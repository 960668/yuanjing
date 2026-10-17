import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const dist = new URL('../dist/', import.meta.url);
const config = JSON.parse(await readFile(new URL('interpretation-rules.json', dist), 'utf8'));
const context = vm.createContext({ console });
for (const file of ['vendor/lunar.js', 'vendor/shensha.js', 'shensha-adapter.js', 'interpretation-engine.js']) {
  vm.runInContext(await readFile(new URL(file, dist), 'utf8'), context, { filename: file });
}
const { validate, analyze } = context.YuanjingReading;
validate(config);
assert.deepEqual(config.dimensions.map(d => d.title), ['心性底色','天赋潜能','行动方式','关系模式','修行课题']);
assert.deepEqual(config.dimensions.filter(d => d.featured).map(d => d.id), ['talent', 'practice']);
const entry = (id, name, kind = 'stem', pillar = '年柱') => ({ id, name, kind, pillar, origin: pillar + ' · 测试来源' });
const fixture = structuredClone(config);
fixture.dimensions = [structuredClone(config.dimensions[0])];
fixture.dimensions[0].motifs = [
  { ...structuredClone(config.dimensions[0].motifs[0]), id:'flow', label:'探索', rules:[{id:'a',names:['偏财','桃花'],kinds:['stem','hidden','omen'],weight:1,explanation:'测试映射'}] },
  { ...structuredClone(config.dimensions[0].motifs[1]), id:'care', label:'经营', rules:[{id:'b',names:['正财'],kinds:['stem','hidden'],weight:1,explanation:'测试映射'}] }
];
const run = entries => analyze(fixture, { entries }).dimensions[0];
// Independent source records count separately. No baseline or trait score is manufactured.
const repeated = run([entry('s1','偏财'),entry('s2','偏财','stem','月柱'),entry('h1','偏财','hidden'),entry('b1','正财')]);
assert.equal(repeated.headline, '探索');
assert.equal(repeated.matches[0].support, 7);
assert.equal(repeated.matches[0].evidence[0].hits.length, 3);
assert.equal(repeated.evidenceCount, 4);
assert.ok(repeated.tension.includes('探索') && repeated.tension.includes('经营'));
assert.equal(run([entry('o1','桃花','omen'),entry('o2','桃花','omen','时柱')]).matches[0].support, 2);
assert.equal('score' in repeated, false);
// Ties show both motifs, while a single motif uses its authored question rather than an invented counterpart.
const tie = run([entry('a','偏财'),entry('b','正财')]);
assert.equal(tie.tied, true);
assert.deepEqual(Array.from(tie.dominantIds), ['flow','care']);
assert.equal(tie.practices.length, 2);
assert.equal(run([entry('a','偏财')]).tension, fixture.dimensions[0].motifs[0].tension);
for (const data of [[], [entry('unmatched','文昌贵人','omen')]]) {
  const empty = run(data);
  assert.equal(empty.hasEvidence, false);
  assert.equal(empty.evidenceCount, 0);
  assert.equal(empty.matches.length, 0);
  assert.equal(empty.headline, fixture.dimensions[0].empty.label);
}
// Configuration edits actually change motif selection, not just display text.
const changed = structuredClone(fixture);
changed.dimensions[0].motifs[1].rules[0].weight = 4;
const changedResult = analyze(changed,{entries:[entry('a','偏财'),entry('b','正财')]}).dimensions[0];
assert.equal(changedResult.headline,'经营');
for (const edit of [
  c => { c.schemaVersion = 1; },
  c => { c.sourceWeights.stem = '3'; },
  c => { c.sourceWeights.hidden = Infinity; },
  c => { c.sourceWeights.omen = 0; },
  c => { c.dimensions[0].motifs[0].rules[0].weight = -1; },
  c => { c.dimensions[0].motifs[0].rules[0].weight = Infinity; },
  c => { c.dimensions[0].motifs[0].rules[0].kinds = ['invalid']; },
  c => { c.dimensions[0].motifs.push(c.dimensions[0].motifs[0]); },
  c => { c.dimensions[1].id = c.dimensions[0].id; },
  c => { c.dimensions[0].tensionTemplate = '没有占位符'; },
  c => { c.dimensions[0].empty.practice = ''; },
  c => { c.disclaimer = ''; }
]) {
  const broken = structuredClone(config);
  edit(broken);
  assert.throws(() => validate(broken), /解读规则配置错误/);
}
assert.throws(() => run([entry('same','偏财'),entry('same','偏财')]), /id 为空或重复/);
const godNames = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];
const omenNames = vm.runInContext('Object.keys(SHENSHA_BY_NAME)', context);
for (const dimension of config.dimensions) for (const motif of dimension.motifs) for (const rule of motif.rules) for (const name of rule.names) {
  for (const kind of rule.kinds) assert.ok((kind === 'omen' ? omenNames : godNames).includes(name), '未知规则名称：' + name);
}

// Real calendar + shensha library integration. Verify every cited record exists in the source chart.
const reports = [];
for (const [year, month, day, hour, minute, gender] of [
  [1998, 8, 16, 9, 30, ''], [1990, 1, 1, 23, 30, 'male'],
  [2000, 2, 29, 0, 0, 'female'], [2024, 2, 4, 16, 30, ''], [1988, 11, 11, 12, 0, 'male']
]) {
  context.fixture = { year, month, day, hour, minute, gender };
  const chart = vm.runInContext(`(() => {
    const f = fixture, e = Solar.fromYmdHms(f.year,f.month,f.day,f.hour,f.minute,0).getLunar().getEightChar();
    const entries = [], pillars = ['Year','Month','Day','Time'];
    pillars.forEach((p,i) => {
      const label = ['年柱','月柱','日柱','时柱'][i], pair = e['get'+p]();
      if(i !== 2) entries.push({id:'stem-'+i,kind:'stem',name:e['get'+p+'ShiShenGan'](),pillar:label,origin:label+'天干 '+pair[0]});
      const hidden = e['get'+p+'HideGan']();
      e['get'+p+'ShiShenZhi']().forEach((name,j) => entries.push({id:'hidden-'+i+'-'+j,kind:'hidden',name,pillar:label,origin:label+'地支 '+pair[1]+' · 藏干 '+hidden[j]}));
    });
    entries.push(...computeOmenEntries(e,f.gender));
    return {entries, pillars:pillars.map(p=>e['get'+p]())};
  })()`, context);
  const original = JSON.stringify(chart);
  const result = analyze(config, chart);
  assert.equal(JSON.stringify(chart), original, 'Engine mutated chart');
  assert.equal(chart.entries.filter(e => e.kind === 'stem').length, 3);
  assert.equal(JSON.stringify(analyze(config, chart)), JSON.stringify(result), 'Results must be deterministic');
  const source = new Map(chart.entries.map(e => [e.id, e]));
  for (const dimension of result.dimensions) {
    assert.equal('score' in dimension, false);
    const seen = new Set();
    for (const motif of dimension.matches) {
      let support = 0;
      for (const rule of motif.evidence) {
        for (const hit of rule.hits) {
          assert.equal(source.get(hit.id).name, hit.name);
          assert.equal(source.get(hit.id).origin, hit.origin);
          assert.equal(hit.support, hit.sourceWeight * hit.ruleWeight);
          support += hit.support;
          seen.add(hit.id);
        }
      }
      assert.equal(motif.support, support);
    }
    assert.equal(dimension.evidenceCount, seen.size);
    assert.ok(dimension.practices.every(p => p.text.length > 0));
    if (dimension.hasEvidence) {
      const max = Math.max(...dimension.matches.map(m => m.support));
      assert.deepEqual(Array.from(dimension.dominantIds), Array.from(dimension.matches.filter(m => m.support === max), m => m.id));
    }
  }
  reports.push({ birthday: [year, month, day].join('-'), pillars: Array.from(chart.pillars), motifs: Array.from(result.dimensions, d => d.headline) });
}
console.log('Reading checks passed: 5 themes, duplicate sources, motif selection, ties, no-evidence, editable weights, invalid config, and 5 real charts.');
console.log(JSON.stringify(reports));
