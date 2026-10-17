/* Authored entertainment narratives, selected by exact chart facts and explicit rules. */
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
  function validateProfile(profile, path) {
    requireText(profile, ['headline','context','core','behavior','strength','risk','environment','advice'], path);
  }
  function validateCondition(condition, path) {
    assert(object(condition), path + ' 必须是对象');
    assert(Array.isArray(condition.names) && condition.names.length > 0 && condition.names.every(nonempty) && new Set(condition.names).size === condition.names.length, path + ' 名称为空或重复');
    assert(Array.isArray(condition.kinds) && condition.kinds.length > 0 && condition.kinds.every(kind => kinds.includes(kind)) && new Set(condition.kinds).size === condition.kinds.length, path + ' 来源类型无效');
    assert(Number.isInteger(condition.minCount) && condition.minCount > 0, path + ' minCount 须为正整数');
  }
  function validate(config) {
    assert(object(config) && config.schemaVersion === 3, 'schemaVersion 必须为 3，请刷新网页以使用新版解读');
    requireText(config, ['version', 'title', 'intro', 'disclaimer', 'methodNote'], 'config');
    assert(object(config.sourceWeights) && Object.keys(config.sourceWeights).length === kinds.length, 'sourceWeights 必须包含且仅包含 stem/hidden/omen');
    kinds.forEach(kind => assert(Number.isInteger(config.sourceWeights[kind]) && config.sourceWeights[kind] >= 1 && config.sourceWeights[kind] <= 10, kind + ' 来源权重须为 1–10 的整数'));
    assert(Array.isArray(config.dimensions) && config.dimensions.length > 0, '至少配置一个主题');
    const dimensionIds = new Set();
    config.dimensions.forEach(dimension => {
      requireText(dimension, ['id', 'title', 'subtitle'], 'dimension');
      assert(!dimensionIds.has(dimension.id), '主题 id 重复');
      dimensionIds.add(dimension.id);
      assert(dimension.featured === undefined || typeof dimension.featured === 'boolean', dimension.id + '.featured 须为布尔值');
      requireText(dimension.empty, ['label'], dimension.id + '.empty');
      validateProfile(dimension.empty.profile, dimension.id + '.empty.profile');
      assert(Array.isArray(dimension.motifs) && dimension.motifs.length > 0, dimension.id + ' 缺少意象');
      const motifIds = new Set();
      dimension.motifs.forEach(motif => {
        requireText(motif, ['id', 'label'], dimension.id + '.motif');
        validateProfile(motif.profile, motif.id + '.profile');
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
    assert(Array.isArray(config.patterns), 'patterns 必须为数组，可留空');
    const patternIds = new Set();
    config.patterns.forEach(pattern => {
      requireText(pattern, ['id','label','basisNote'], 'pattern');
      assert(!patternIds.has(pattern.id), '组合规则 id 重复');
      patternIds.add(pattern.id);
      assert(Number.isInteger(pattern.priority) && pattern.priority >= 0, pattern.id + ' priority 须为非负整数');
      assert(Array.isArray(pattern.requirements) && pattern.requirements.length > 0, pattern.id + ' 缺少条件');
      pattern.requirements.forEach((condition, i) => validateCondition(condition, pattern.id + '.requirements.' + i));
      assert(object(pattern.profiles) && Object.keys(pattern.profiles).length > 0, pattern.id + ' 缺少叙事');
      Object.entries(pattern.profiles).forEach(([dimensionId, profile]) => {
        assert(dimensionIds.has(dimensionId), pattern.id + ' 引用了不存在的主题');
        validateProfile(profile, pattern.id + '.' + dimensionId);
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
    const patternMatches = config.patterns.map((pattern, order) => {
      const requirements = pattern.requirements.map(condition => ({
        ...condition, hits: chart.entries.filter(entry => condition.names.includes(entry.name) && condition.kinds.includes(entry.kind)).map(entry => ({ ...entry }))
      }));
      return { ...pattern, order, requirements };
    }).filter(pattern => pattern.requirements.every(condition => condition.hits.length >= condition.minCount))
      .sort((a, b) => b.priority - a.priority || a.order - b.order);
    const dimensions = config.dimensions.map(dimension => {
      const matches = dimension.motifs.map((motif, order) => {
        const evidence = motif.rules.map(rule => {
          const hits = chart.entries.filter(entry => rule.names.includes(entry.name) && rule.kinds.includes(entry.kind))
            .map(entry => ({ ...entry, sourceWeight: config.sourceWeights[entry.kind], ruleWeight: rule.weight, support: rounded(config.sourceWeights[entry.kind] * rule.weight) }));
          return { id: rule.id, explanation: rule.explanation, hits, support: rounded(hits.reduce((sum, hit) => sum + hit.support, 0)) };
        }).filter(rule => rule.hits.length > 0);
        return { id: motif.id, label: motif.label, profile: { ...motif.profile }, order,
          support: rounded(evidence.reduce((sum, rule) => sum + rule.support, 0)), evidence };
      }).filter(motif => motif.evidence.length > 0).sort((a, b) => b.support - a.support || a.order - b.order);
      const dominant = matches.length ? matches.filter(motif => motif.support === matches[0].support) : [];
      const distinct = new Map();
      matches.forEach(motif => motif.evidence.forEach(rule => rule.hits.forEach(hit => distinct.set(hit.id, { ...hit }))));
      const mainSources = new Map();
      dominant.forEach(motif => motif.evidence.forEach(rule => rule.hits.forEach(hit => mainSources.set(hit.id, { ...hit }))));
      const selectedPattern = patternMatches.find(pattern => Object.hasOwn(pattern.profiles, dimension.id));
      const profiles = selectedPattern
        ? [{ label: selectedPattern.label, ...selectedPattern.profiles[dimension.id] }]
        : dominant.length ? dominant.map(motif => ({ label: motif.label, ...motif.profile }))
        : [{ label: dimension.empty.label, ...dimension.empty.profile }];
      if (selectedPattern) {
        mainSources.clear();
        selectedPattern.requirements.forEach(condition => condition.hits.forEach(hit => {
          mainSources.set(hit.id, { ...hit });
          distinct.set(hit.id, { ...hit });
        }));
      }
      const selection = selectedPattern ? {
        type: 'pattern', id: selectedPattern.id, label: selectedPattern.label, priority: selectedPattern.priority,
        explanation: selectedPattern.basisNote, requirements: selectedPattern.requirements
      } : { type: dominant.length ? 'motif' : 'empty', label: dominant.map(motif => motif.label).join('、') || dimension.empty.label };
      return {
        id: dimension.id, title: dimension.title, subtitle: dimension.subtitle,
        featured: Boolean(dimension.featured), hasEvidence: matches.length > 0 || Boolean(selectedPattern),
        headline: profiles.map(profile => profile.headline).join('；'), profiles, selection,
        texts: profiles.map(profile => profile.core), dominantIds: dominant.map(motif => motif.id),
        tied: !selectedPattern && dominant.length > 1, tension: profiles.map(profile => profile.risk).join(' '),
        practices: profiles.map(profile => ({ label: profile.label, text: profile.advice })),
        evidenceCount: distinct.size, mainSources: Array.from(mainSources.values()), matches
      };
    });
    const portrait = [
      { id: 'mind', label: '你的驱动力', field: 'core' },
      { id: 'talent', label: '你能发挥的优势', field: 'strength' },
      { id: 'practice', label: '你容易卡住的地方', field: 'risk' }
    ].flatMap(item => {
      const dimension = dimensions.find(d => d.id === item.id && d.hasEvidence);
      return dimension ? [{ dimensionId: item.id, label: item.label, text: dimension.profiles.map(profile => profile[item.field]).join(' ') }] : [];
    });
    return { schemaVersion: 3, portrait, version: config.version, title: config.title, disclaimer: config.disclaimer,
      methodNote: config.methodNote, sourceWeights: { ...config.sourceWeights }, dimensions };
  }
  root.YuanjingReading = Object.freeze({ validate, analyze });
})(globalThis);
