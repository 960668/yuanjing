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
const entry = (id, name, kind = 'stem', pillar = '年柱') => ({ id, name, kind, pillar, origin: pillar + ' · 测试来源' });
const run = entries => analyze(config, { entries });
const scores = result => Array.from(result.dimensions, dimension => dimension.score);

// Duplicates in different source records count independently; hidden stems have their own weight.
const repeated = run([entry('s1', '偏财'), entry('s2', '偏财', 'stem', '月柱'), entry('h1', '偏财', 'hidden')]);
assert.equal(repeated.dimensions[0].score, 65);
assert.equal(repeated.dimensions[0].evidence[0].hits.length, 3);
assert.equal(repeated.dimensions[0].evidence[0].contribution, 15);
const omens = run([entry('o1', '桃花', 'omen'), entry('o2', '桃花', 'omen', '时柱')]);
assert.equal(omens.dimensions[0].score, 60);
assert.equal(omens.dimensions[0].evidence[0].hits.length, 2);

// Signed weights, upper/lower clamp, and evidence retention after clamping.
assert.equal(run([entry('a', '正财'), entry('b', '正官')]).dimensions[0].score, 40);
const high = run(Array.from({ length: 20 }, (_, i) => entry('high-' + i, '偏财'))).dimensions[0];
assert.equal(high.score, 100);
assert.equal(high.rawScore, 170);
assert.equal(high.evidence[0].hits.length, 20);
assert.equal(run(Array.from({ length: 20 }, (_, i) => entry('low-' + i, '正财'))).dimensions[0].score, 0);

// An empty or unknown chart does not invent a trait interpretation from the neutral base.
for (const data of [[], [entry('unmatched', '文昌贵人', 'omen')]]) {
  for (const dimension of run(data).dimensions) {
    assert.equal(dimension.score, 50);
    assert.equal(dimension.hasEvidence, false);
    assert.equal(dimension.band.label, '无命中依据');
  }
}

// Fractional, infinite, duplicate or incomplete edits fail visibly instead of silently producing scores.
for (const edit of [
  c => { c.dimensions[0].rules[0].points.stem = '6'; },
  c => { c.dimensions[0].rules[0].points.stem = Infinity; },
  c => { c.dimensions[0].rules[0].points.stem = 1.5; },
  c => { c.dimensions[0].rules[0].points.bad = 2; },
  c => { c.dimensions[1].id = c.dimensions[0].id; },
  c => { c.dimensions[0].rules.push(c.dimensions[0].rules[0]); },
  c => { c.dimensions[0].bands.at(-1).max = 99; },
  c => { c.dimensions[0].bands[1].max = 20; },
  c => { c.scale.base = 101; },
  c => { c.disclaimer = ''; }
]) {
  const broken = structuredClone(config);
  edit(broken);
  assert.throws(() => validate(broken), /解读规则配置错误/);
}
assert.throws(() => run([entry('same', '偏财'), entry('same', '偏财')]), /id 为空或重复/);

// Check configured names against the actual app catalogues, catching short-name/full-name mismatches.
const godNames = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];
const omenNames = vm.runInContext('Object.keys(SHENSHA_BY_NAME)', context);
for (const dimension of config.dimensions) for (const rule of dimension.rules) for (const name of rule.names) {
  for (const kind of Object.keys(rule.points)) assert.ok((kind === 'omen' ? omenNames : godNames).includes(name), '未知规则名称：' + name);
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
  assert.deepEqual(scores(analyze(config, chart)), scores(result), 'Results must be deterministic');
  const source = new Map(chart.entries.map(e => [e.id, e]));
  for (const dimension of result.dimensions) {
    let sum = config.scale.base;
    for (const rule of dimension.evidence) {
      assert.equal(rule.contribution, rule.hits.reduce((total, hit) => total + hit.points, 0));
      for (const hit of rule.hits) {
        assert.equal(source.get(hit.id).name, hit.name);
        assert.equal(source.get(hit.id).origin, hit.origin);
      }
      sum += rule.contribution;
    }
    assert.equal(dimension.rawScore, sum);
    assert.equal(dimension.score, Math.max(config.scale.min, Math.min(config.scale.max, sum)));
  }
  reports.push({ birthday: [year, month, day].join('-'), pillars: Array.from(chart.pillars), scores: scores(result) });
}
console.log('Reading checks passed: duplicate sources, weights, limits, no-evidence, invalid config, and 5 real charts.');
console.log(JSON.stringify(reports));
