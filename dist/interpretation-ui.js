(function () {
  'use strict';
  const byId = id => document.getElementById(id);
  const dialog = byId('reading-dialog');
  const intro = byId('reading-intro');
  const results = byId('reading-results');
  const status = byId('reading-status');
  const start = byId('reading-start');
  const retry = byId('reading-retry');
  const kindNames = { stem: '透干', hidden: '藏干', omen: '神煞' };
  const inputKey = () => JSON.stringify(['date', 'time', 'zone', 'gender'].map(id => byId(id).value));
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  let chart = getReadingChart();
  let config = null;
  let loading = null;
  let generation = 0;
  let lastResult = null;
  function isDirty() { return inputKey() !== chart.inputKey; }
  function invalidate() {
    generation++;
    lastResult = null;
    results.replaceChildren();
    results.hidden = true;
    intro.hidden = false;
    byId('reading-export').hidden = true;
    byId('reading-again').hidden = true;
    start.hidden = false;
    start.disabled = !config || isDirty();
    const dirty = isDirty();
    byId('reading-hint').textContent = dirty ? '生辰已修改，请先点击“开启我的星境”，更新命盘后再解读。' : '先阅读娱乐分析声明，再查看符号依据。';
    status.textContent = dirty ? '请先更新星境，解读不会使用未提交的生辰。' : '';
  }
  async function loadRules() {
    if (config) return config;
    if (!loading) loading = fetch('interpretation-rules.json', { cache: 'no-cache' })
      .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
      .then(value => YuanjingReading.validate(value))
      .then(value => { config = value; return value; })
      .catch(error => { loading = null; throw error; });
    return loading;
  }
  async function prepare() {
    const token = ++generation;
    retry.hidden = true;
    start.disabled = true;
    status.textContent = '正在读取本地解读规则…';
    try {
      const rules = await loadRules();
      if (token !== generation || !dialog.open) return;
      byId('reading-theme').textContent = rules.title;
      byId('reading-scope').textContent = rules.intro;
      byId('reading-preview').replaceChildren(...rules.dimensions.map((dimension, index) => node('span', '', String(index + 1).padStart(2, '0') + ' / ' + dimension.title)));
      byId('reading-config-note').textContent = rules.disclaimer;
      byId('reading-rule-version').textContent = '规则版本 ' + rules.version + ' · 全部计算在浏览器本地完成';
      start.disabled = isDirty();
      status.textContent = isDirty() ? '请先关闭此窗口并更新星境。' : '规则已就绪。阅读声明后，可开始娱乐解读。';
    } catch (error) {
      if (token !== generation || !dialog.open) return;
      status.textContent = '规则加载失败，尚未生成任何解读。请检查网络或规则文件格式。' + (error.message.startsWith('解读规则配置错误') ? ' ' + error.message : '');
      retry.hidden = false;
    }
  }
  function render(result) {
    const heading = node('div', 'reading-chart');
    heading.append(node('p', 'reading-caption', chart.date + ' · ' + chart.time + ' · UTC' + (Number(chart.zone) >= 0 ? '+' : '') + chart.zone));
    heading.append(node('p', 'reading-pillars', chart.pillars.map(p => p.label + ' ' + p.value).join('　')));
    heading.append(node('p', 'reading-caption', '日主 ' + chart.dayMaster + ' · 透干 ' + chart.stemCount + ' 项 / 藏干 ' + chart.hiddenCount + ' 项 / 神煞 ' + chart.omenCount + ' 项'));
    const featured = node('div', 'reading-featured-grid');
    const grid = node('div', 'reading-grid');
    result.dimensions.forEach(dimension => {
      const card = node('article', 'reading-card' + (dimension.featured ? ' reading-card-featured' : ''));
      card.append(node('div', 'reading-card-index', (dimension.featured ? '核心探索 / ' : '') + dimension.subtitle));
      card.append(node('h3', '', dimension.title), node('p', 'reading-question', dimension.question));
      card.append(node('h4', 'reading-section-label', '主导意象'), node('p', 'reading-motif', dimension.headline));
      if (dimension.tied) card.append(node('p', 'reading-tie', '同权意象并列呈现，不分高低。'));
      dimension.texts.forEach(text => card.append(node('p', 'reading-interpretation', text)));
      const sources = node('section', 'reading-source-preview');
      sources.append(node('h4', 'reading-section-label', '命盘依据'));
      if (dimension.hasEvidence) {
        dimension.mainSources.slice(0, 2).forEach(source => {
          sources.append(node('p', '', source.origin + ' → ' + source.name + '（' + kindNames[source.kind] + '）'));
        });
        if (dimension.mainSources.length > 2) sources.append(node('p', 'reading-source-more', '主导意象另有 ' + (dimension.mainSources.length - 2) + ' 项来源，可展开核对。'));
      } else sources.append(node('p', '', '当前规则未命中；暂不推演主导意象。'));
      const detail = node('details', 'reading-evidence');
      detail.append(node('summary', '', '展开全部依据 · ' + dimension.evidenceCount + ' 个命盘条目'));
      detail.append(node('p', 'reading-weight-note', '以下权重只用于选择意象，不是能力分数。同一条目可以支持不同意象。'));
      if (!dimension.hasEvidence) detail.append(node('p', '', '未命中不代表缺少相关能力；也可能是规则尚未覆盖。'));
      dimension.matches.forEach(motif => {
        const group = node('section', 'reading-rule');
        const isDominant = dimension.dominantIds.includes(motif.id);
        group.append(node('h5', '', motif.label + ' · ' + (isDominant ? '主导' : '伴随') + '意象 · 匹配权重 ' + motif.support));
        motif.evidence.forEach(rule => {
          group.append(node('p', '', rule.explanation));
          const list = node('ul');
          rule.hits.forEach(hit => {
            const item = node('li');
            item.append(node('span', '', hit.name + ' · ' + kindNames[hit.kind]), node('small', '', hit.origin));
            item.append(node('small', '', '来源权重 ' + hit.sourceWeight + ' × 映射系数 ' + hit.ruleWeight + ' = ' + hit.support));
            if (hit.basis) item.append(node('small', '', '查法：' + hit.basis));
            list.append(item);
          });
          group.append(list);
        });
        const expression = motif.evidence.map(rule => String(rule.support)).join(' + ');
        group.append(node('p', 'reading-weight-note', '匹配权重合计：' + expression + ' = ' + motif.support));
        detail.append(group);
      });
      sources.append(detail);
      card.append(sources);
      const tension = node('section', 'reading-tension');
      tension.append(node('h4', 'reading-section-label', '内在张力'), node('p', '', dimension.tension));
      const practice = node('section', 'reading-practice');
      practice.append(node('h4', 'reading-section-label', dimension.practices.length > 1 ? '任选一件小事练习' : '一件小事，开始修行'));
      dimension.practices.forEach(item => {
        if (dimension.practices.length > 1) practice.append(node('h5', '', item.label));
        practice.append(node('p', '', item.text));
      });
      card.append(tension, practice);
      (dimension.featured ? featured : grid).append(card);
    });
    const method = node('details', 'reading-method');
    method.append(node('summary', '', '解读如何生成'), node('p', '', result.methodNote));
    method.append(node('p', '', '当前来源权重：透干 ' + result.sourceWeights.stem + ' / 藏干 ' + result.sourceWeights.hidden + ' / 神煞 ' + result.sourceWeights.omen + '。只比较同一主题中的意象匹配，不比较人与人。'));
    method.append(node('p', '', '规则版本：' + result.version + '。相同输入与规则产生相同结果，不调用大模型，也不向外部服务上传生辰。可编辑规则与文案，修改后解读可能改变。'));
    const sections = [heading];
    if (featured.children.length) sections.push(node('h3', 'reading-group-title', '先看天赋，再选一件事练习'), featured);
    if (grid.children.length) sections.push(node('h3', 'reading-group-title', '继续探索你的内在宇宙'), grid);
    results.replaceChildren(...sections, method);
  }
  byId('reading-open').onclick = () => {
    invalidate();
    dialog.showModal();
    prepare();
  };
  byId('reading-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { generation++; });
  retry.onclick = prepare;
  start.onclick = () => {
    if (!config || isDirty()) { invalidate(); return; }
    try {
      const result = YuanjingReading.analyze(config, chart);
      render(result);
      lastResult = { ...result, chart: { ...chart } };
      intro.hidden = true;
      results.hidden = false;
      start.hidden = true;
      byId('reading-export').hidden = false;
      byId('reading-again').hidden = false;
      status.textContent = result.dimensions.length + ' 个主题已展开。可查看主导意象、柱位依据，并选择一件适合当下的小事练习。';
      dialog.scrollTop = 0;
      byId('reading-title').focus({ preventScroll: true });
    } catch (error) {
      status.textContent = error.message;
    }
  };
  byId('reading-again').onclick = () => { invalidate(); prepare(); };
  byId('reading-export').onclick = () => {
    if (!lastResult || isDirty()) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(lastResult, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = '元境-娱乐解读-' + chart.date + '.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  byId('birthform').addEventListener('input', invalidate);
  byId('birthform').addEventListener('change', invalidate);
  window.addEventListener('yuanjing:chart-updated', event => {
    chart = event.detail;
    invalidate();
    if (dialog.open) prepare();
  });
})();
