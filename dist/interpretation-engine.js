/* Local cultural-symbol matching. Weights select motifs; they do not measure personality. */
(function (root) {
  'use strict';
  const kinds = ['stem', 'hidden', 'omen'];
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  function assert(ok, message) {
    if (!ok) throw new Error('解读规则配置错误：' + message);
  }
  function requireText(value, keys, path) {
    assert(object(value), path + ' 必须是对象');
    keys.forEach(key => assert(nonempty(value[key]), path + '.' + key + ' 不能为空'));
  }
  function validate(config) {
    assert(object(config) && config.schemaVersion === 2, 'schemaVersion 必须为 2，请刷新网页以使用新版解读');
    requireText(config, ['version', 'title', 'intro', 'disclaimer', 'methodNote'], 'config');
    assert(object(config.sourceWeights) && Object.keys(config.sourceWeights).length === kinds.length, 'sourceWeights 必须包含且仅包含 stem/hidden/omen');
    kinds.forEach(kind => assert(Number.isInteger(config.sourceWeights[kind]) && config.sourceWeights[kind] >= 1 && config.sourceWeights[kind] <= 10, kind + ' 来源权重须为 1–10 的整数'));
    assert(Array.isArray(config.dimensions) && config.dimensions.length > 0, '至少配置一个主题');
    const dimensionIds = new Set();
    config.dimensions.forEach(dimension => {
      requireText(dimension, ['id', 'title', 'subtitle', 'question', 'tensionTemplate'], 'dimension');
      assert(!dimensionIds.has(dimension.id), '主题 id 重复');
      dimensionIds.add(dimension.id);
      assert(dimension.featured === undefined || typeof dimension.featured === 'boolean', dimension.id + '.featured 须为布尔值');
      assert(dimension.tensionTemplate.includes('{first}') && dimension.tensionTemplate.includes('{second}'), dimension.id + ' 张力模板须包含 {first} 和 {second}');
      requireText(dimension.empty, ['label', 'text', 'tension', 'practice'], dimension.id + '.empty');
      assert(Array.isArray(dimension.motifs) && dimension.motifs.length > 0, dimension.id + ' 缺少意象');
      const motifIds = new Set();
      dimension.motifs.forEach(motif => {
        requireText(motif, ['id', 'label', 'text', 'tension', 'practice'], dimension.id + '.motif');
        assert(!motifIds.has(motif.id), dimension.id + ' 意象 id 重复');
        motifIds.add(motif.id);
        assert(Array.isArray(motif.rules) && motif.rules.length > 0, motif.id + ' 缺少匹配规则');
        const ruleIds = new Set();
        motif.rules.forEach(rule => {
          requireText(rule, ['id', 'explanation'], motif.id + '.rule');
          assert(!ruleIds.has(rule.id), motif.id + ' 规则 id 重复');
          ruleIds.add(rule.id);
          assert(Array.isArray(rule.names) && rule.names.length > 0 && rule.names.every(nonempty) && new Set(rule.names).size === rule.names.length, rule.id + ' 名称为空或重复');
          assert(Array.isArray(rule.kinds) && rule.kinds.length > 0 && rule.kinds.every(kind => kinds.includes(kind)) && new Set(rule.kinds).size === rule.kinds.length, rule.id + ' 来源类型无效或重复');
          assert(Number.isFinite(rule.weight) && rule.weight > 0 && rule.weight <= 10, rule.id + ' 映射系数须大于 0 且不超过 10');
        });
      });
    });
    return config;
  }
  const rounded = value => Math.round(value * 1e6) / 1e6;
  function analyze(config, chart) {
    validate(config);
    assert(chart && Array.isArray(chart.entries), '缺少命盘条目');
    const ids = new Set();
    chart.entries.forEach(entry => {
      assert(object(entry) && nonempty(entry.id) && !ids.has(entry.id), '命盘条目 id 为空或重复');
      ids.add(entry.id);
      assert(kinds.includes(entry.kind) && nonempty(entry.name) && nonempty(entry.pillar) && nonempty(entry.origin), '命盘条目不完整');
    });
    const dimensions = config.dimensions.map(dimension => {
      const matches = dimension.motifs.map((motif, order) => {
        const evidence = motif.rules.map(rule => {
          const hits = chart.entries.filter(entry => rule.names.includes(entry.name) && rule.kinds.includes(entry.kind))
            .map(entry => ({ ...entry, sourceWeight: config.sourceWeights[entry.kind], ruleWeight: rule.weight, support: rounded(config.sourceWeights[entry.kind] * rule.weight) }));
          return { id: rule.id, explanation: rule.explanation, hits, support: rounded(hits.reduce((sum, hit) => sum + hit.support, 0)) };
        }).filter(rule => rule.hits.length > 0);
        return { id: motif.id, label: motif.label, text: motif.text, tension: motif.tension, practice: motif.practice, order,
          support: rounded(evidence.reduce((sum, rule) => sum + rule.support, 0)), evidence };
      }).filter(motif => motif.evidence.length > 0).sort((a, b) => b.support - a.support || a.order - b.order);
      const dominant = matches.length ? matches.filter(motif => motif.support === matches[0].support) : [];
      const distinct = new Map();
      matches.forEach(motif => motif.evidence.forEach(rule => rule.hits.forEach(hit => distinct.set(hit.id, { ...hit }))));
      const mainSources = new Map();
      dominant.forEach(motif => motif.evidence.forEach(rule => rule.hits.forEach(hit => mainSources.set(hit.id, { ...hit }))));
      const tension = matches.length >= 2
        ? dimension.tensionTemplate.replaceAll('{first}', matches[0].label).replaceAll('{second}', matches[1].label)
        : matches.length ? matches[0].tension : dimension.empty.tension;
      return {
        id: dimension.id, title: dimension.title, subtitle: dimension.subtitle, question: dimension.question,
        featured: Boolean(dimension.featured), hasEvidence: matches.length > 0,
        headline: dominant.length ? dominant.map(motif => motif.label).join(' · ') : dimension.empty.label,
        texts: dominant.length ? dominant.map(motif => motif.text) : [dimension.empty.text],
        dominantIds: dominant.map(motif => motif.id), tied: dominant.length > 1,
        tension, practices: dominant.length ? dominant.map(motif => ({ label: motif.label, text: motif.practice })) : [{ label: '从观察开始', text: dimension.empty.practice }],
        evidenceCount: distinct.size, mainSources: Array.from(mainSources.values()), matches
      };
    });
    return { schemaVersion: 2, version: config.version, title: config.title, disclaimer: config.disclaimer,
      methodNote: config.methodNote, sourceWeights: { ...config.sourceWeights }, dimensions };
  }
  root.YuanjingReading = Object.freeze({ validate, analyze });
})(globalThis);
