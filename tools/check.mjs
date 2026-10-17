import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const html = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const ref = match[1];
  if (/^(https?:|#|mailto:)/.test(ref)) continue;
  await access(path.resolve(dist, ref.split(/[?#]/)[0]));
}
for (const file of ['app.js', 'cosmos3d.js', 'shensha-adapter.js', 'vendor/shensha.js', 'interpretation-engine.js', 'interpretation-ui.js']) {
  const result = spawnSync(process.execPath, ['--check', path.join(dist, file)], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `Syntax check failed: ${file}`);
}
const scene = await readFile(path.join(dist, 'cosmos3d.js'), 'utf8');
for (const match of scene.matchAll(/from\s+['"]([^'"]+)['"]/g)) await access(path.resolve(dist, match[1]));
console.log('All local assets, module imports and application script syntax passed.');
await import('./reading-check.mjs');
