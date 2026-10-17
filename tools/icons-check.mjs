import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const dist = new URL('../dist/', import.meta.url);
const context = vm.createContext({});
vm.runInContext(await readFile(new URL('symbol-icons.js', dist), 'utf8'), context);
vm.runInContext(await readFile(new URL('shensha-adapter.js', dist), 'utf8'), context);
const icons = context.YuanjingIcons;
const gods = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];
const omens = Array.from(vm.runInContext('Object.keys(SHENSHA_BY_NAME)', context));
assert.deepEqual(Array.from(icons.gods), gods);
assert.deepEqual(Array.from(icons.omens).sort(), omens.sort());
assert.equal(icons.omens.length, 51);
const drawings = new Set();
for (const [family, names] of [['god', gods], ['omen', omens]]) {
  for (const name of names) {
    const svg = icons.svg(name, family);
    assert.ok(svg.includes('viewBox="0 0 32 32"'), name + ' missing fixed coordinate space');
    assert.ok(svg.includes('stroke="currentColor"'), name + ' must inherit family color');
    assert.ok(!svg.includes('data-icon-key="fallback"'), name + ' incorrectly falls back');
    assert.ok(svg.includes('aria-hidden="true"') && svg.includes('focusable="false"'));
    assert.ok(!/<(?:text|image|use|script|foreignObject)\b/i.test(svg), name + ' depends on text or external content');
    assert.ok(!/href=|\bon\w+=|NaN|undefined/.test(svg), name + ' invalid artwork');
    const body = svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'));
    assert.ok(/<(?:path|circle)\b/.test(body));
    assert.ok(!drawings.has(body), name + ' shares an indistinguishable drawing');
    drawings.add(body);
    if (family === 'omen') assert.equal(context.getOmenIcon(name), svg, 'Omen adapter must return vector art');
  }
}
assert.equal(drawings.size, 61);
const unknown = icons.svg('<img onerror=alert(1)>', 'omen');
assert.ok(unknown.includes('data-icon-key="fallback"'));
assert.ok(!unknown.includes('<img'), 'Unknown labels must not become SVG markup');
const html = await readFile(new URL('index.html', dist), 'utf8');
assert.ok(html.indexOf('src="symbol-icons.js') < html.indexOf('src="app.js'), 'Icons must load before chart initialization');
const app = await readFile(new URL('app.js', dist), 'utf8');
assert.ok(!app.includes('icons=[') && !app.includes('icons['), 'Do not retain the font glyph render path');
assert.ok(!/\.textContent\s*=\s*getOmenIcon/.test(app), 'SVG markup must not be rendered as text');
console.log('Vector icon checks passed: all 10 gods and 51 omens have distinct, local, font-independent SVG art.');
