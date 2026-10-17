/* Pure, local rule engine. The score is an authored entertainment scale. */
(function (root) {
  'use strict';
  const kinds = ['stem', 'hidden', 'omen'];
  function assert(ok, message) {
    if (!ok) throw new Error('解读规则配置错误：' + message);
  }
  const nonempty = value => typeof value === 'string' && value.trim().length > 0;
  function validate(config) {
    assert(config && config.schemaVersion === 1, 'schemaVersion 必须为 1');
    for (const key of ['version', 'title', 'disclaimer', 'methodNote']) assert(nonempty(config[key]), key + ' 不能为空');
    const scale = config.scale;
    assert(scale && Number.isFinite(scale.min) && Number.isFinite(scale.max) && scale.min < scale.max, '刻度范围无效');
    assert(Number.isFinite(scale.base) && scale.base >= scale.min && scale.base <= scale.max, '起点必须在刻度范围内');
    assert(nonempty(scale.label), '刻度名称不能为空');
    assert(Array.isArray(config.dimensions) && config.dimensions.length > 0, '至少配置一个维度');
    const ids = new Set();
    config.dimensions.forEach(dimension => {
      assert(nonempty(dimension.id) && !ids.has(dimension.id), '维度 id 为空或重复');
      ids.add(dimension.id);
      for (const key of ['title', 'subtitle', 'description', 'noEvidence']) assert(nonempty(dimension[key]), dimension.id + '.' + key + ' 不能为空');
      assert(Array.isArray(dimension.bands) && dimension.bands.length > 0, dimension.id + ' 缺少分档');
      let last = -Infinity;
      dimension.bands.forEach(band => {
        assert(Number.isFinite(band.max) && band.max > last, dimension.id + ' 的分档上限须严格递增');
        assert(nonempty(band.label) && nonempty(band.text), dimension.id + ' 的分档文案不能为空');
        last = band.max;
      });
      assert(last >= scale.max, dimension.id + ' 的分档未覆盖刻度上限');
      assert(Array.isArray(dimension.rules), dimension.id + '.rules 必须为数组');
      const ruleIds = new Set();
      dimension.rules.forEach(rule => {
        assert(nonempty(rule.id) && !ruleIds.has(rule.id), dimension.id + ' 规则 id 为空或重复');
        ruleIds.add(rule.id);
        assert(Array.isArray(rule.names) && rule.names.length > 0 && rule.names.every(nonempty), rule.id + ' 缺少匹配名称');
        assert(new Set(rule.names).size === rule.names.length, rule.id + ' 匹配名称重复');
        assert(rule.points && Object.keys(rule.points).length > 0, rule.id + ' 缺少权重');
        Object.entries(rule.points).forEach(([kind, points]) => {
          assert(kinds.includes(kind) && Number.isInteger(points) && Math.abs(points) <= 100, rule.id + ' 权重须为 -100 至 100 的整数，类型限 stem/hidden/omen');
        });
        assert(nonempty(rule.explanation), rule.id + ' 缺少映射说明');
      });
    });
    return config;
  }
  function analyze(config, chart) {
    validate(config);
    assert(chart && Array.isArray(chart.entries), '缺少命盘条目');
    const ids = new Set();
    chart.entries.forEach(entry => {
      assert(entry && nonempty(entry.id) && !ids.has(entry.id), '命盘条目 id 为空或重复');
      ids.add(entry.id);
      assert(kinds.includes(entry.kind) && nonempty(entry.name) && nonempty(entry.pillar) && nonempty(entry.origin), '命盘条目不完整');
    });
    const dimensions = config.dimensions.map(dimension => {
      const evidence = dimension.rules.map(rule => {
        const hits = chart.entries.filter(entry => rule.names.includes(entry.name) && Object.hasOwn(rule.points, entry.kind))
          .map(entry => ({ ...entry, points: rule.points[entry.kind] }));
        return { id: rule.id, explanation: rule.explanation, hits, contribution: hits.reduce((sum, hit) => sum + hit.points, 0) };
      }).filter(rule => rule.hits.length > 0);
      const delta = evidence.reduce((sum, rule) => sum + rule.contribution, 0);
      const rawScore = config.scale.base + delta;
      const score = Math.max(config.scale.min, Math.min(config.scale.max, rawScore));
      const band = dimension.bands.find(b => score <= b.max);
      return {
        id: dimension.id, title: dimension.title, subtitle: dimension.subtitle, description: dimension.description,
        score, rawScore, delta, evidence, hasEvidence: evidence.length > 0,
        band: evidence.length ? { ...band } : { label: '无命中依据', text: dimension.noEvidence }
      };
    });
    return { version: config.version, disclaimer: config.disclaimer, methodNote: config.methodNote, scale: { ...config.scale }, dimensions };
  }
  root.YuanjingReading = Object.freeze({ validate, analyze });
})(globalThis);
