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
    const overview = node('section', 'reading-portrait');
    overview.append(node('h3', '', '先看懂你的整体画像'));
    overview.append(node('p', 'reading-portrait-note', '以下为本次命盘触发的娱乐解读。具体表现、优势与盲点见下方。'));
    result.portrait.forEach(item => {
      const row = node('div', 'reading-portrait-row');
      row.append(node('h4', '', item.label), node('p', '', item.text));
      overview.append(row);
    });
    if (!result.portrait.length) overview.append(node('p', '', '当前规则未提供足够依据，暂不生成整体画像。'));
    const featured = node('div', 'reading-featured-grid');
    const grid = node('div', 'reading-grid');
    result.dimensions.forEach(dimension => {
      const card = node('article', 'reading-card' + (dimension.featured ? ' reading-card-featured' : ''));
      card.append(node('div', 'reading-card-index', dimension.subtitle), node('h3', '', dimension.title));
      if (dimension.tied) card.append(node('p', 'reading-tie', '本主题同时触发 ' + dimension.profiles.length + ' 种描述，分场景呈现。'));
      dimension.profiles.forEach(profile => {
        const body = node('section', 'reading-profile');
        body.append(node('p', 'reading-motif', profile.headline), node('p', 'reading-context', profile.context), node('p', 'reading-interpretation', profile.core));
        const descriptions = node('dl', 'reading-descriptions');
        [
          ['具体表现', profile.behavior, ''],
          ['你的优势', profile.strength, ''],
          ['容易卡住的地方', profile.risk, 'reading-tension'],
          ['更适合你的方式', profile.environment, '']
        ].forEach(([label, text, className]) => {
          descriptions.append(node('dt', '', label), node('dd', className, text));
        });
        body.append(descriptions);
        const advice = node('section', 'reading-practice');
        advice.append(node('h4', 'reading-section-label', '怎样调整会更有帮助'), node('p', '', profile.advice));
        body.append(advice);
        card.append(body);
      });
      const sources = node('section', 'reading-source-preview');
      sources.append(node('h4', 'reading-section-label', '为什么这样解读'));
      if (dimension.hasEvidence) {
        sources.append(node('p', 'reading-selection', '本段触发依据：' + dimension.selection.label));
        dimension.mainSources.slice(0, 2).forEach(source => sources.append(node('p', '', source.origin + ' → ' + source.name + '（' + kindNames[source.kind] + '）')));
        if (dimension.mainSources.length > 2) sources.append(node('p', 'reading-source-more', '另有 ' + (dimension.mainSources.length - 2) + ' 项实际来源，可展开查看。'));
      } else sources.append(node('p', '', '当前规则未命中，不补写个人结论。'));
      const detail = node('details', 'reading-evidence');
      detail.append(node('summary', '', '查看规则与全部来源 · ' + dimension.evidenceCount + ' 个命盘条目'));
      if (dimension.selection.type === 'pattern') {
        const combination = node('section', 'reading-rule reading-combination');
        combination.append(node('h5', '', '命局组合 · ' + dimension.selection.label), node('p', '', dimension.selection.explanation));
        dimension.selection.requirements.forEach(requirement => {
          combination.append(node('p', '', '条件：' + requirement.names.join(' / ') + '（' + requirement.kinds.map(kind => kindNames[kind]).join(' / ') + '）至少 ' + requirement.minCount + ' 项；实际 ' + requirement.hits.length + ' 项。'));
          const list = node('ul');
          requirement.hits.forEach(hit => {
            const item = node('li');
            item.append(node('span', '', hit.name + ' · ' + kindNames[hit.kind]), node('small', '', hit.origin));
            list.append(item);
          });
          combination.append(list);
        });
        detail.append(combination);
      }
      detail.append(node('p', 'reading-weight-note', '基础条目匹配列在下方。权重只用于选择叙事，不是人格或能力分数；命中的组合规则优先于基础匹配。'));
      dimension.matches.forEach(motif => {
        const group = node('section', 'reading-rule');
        group.append(node('h5', '', motif.label + ' · 基础匹配权重 ' + motif.support));
        motif.evidence.forEach(rule => {
          group.append(node('p', '', rule.explanation));
          const list = node('ul');
          rule.hits.forEach(hit => {
            const item = node('li');
            item.append(node('span', '', hit.name + ' · ' + kindNames[hit.kind]), node('small', '', hit.origin), node('small', '', '来源权重 ' + hit.sourceWeight + ' × 映射系数 ' + hit.ruleWeight + ' = ' + hit.support));
            if (hit.basis) item.append(node('small', '', '查法：' + hit.basis));
            list.append(item);
          });
          group.append(list);
        });
        detail.append(group);
      });
      sources.append(detail);
      card.append(sources);
      (dimension.featured ? featured : grid).append(card);
    });
    const method = node('details', 'reading-method');
    method.append(node('summary', '', '解读如何生成'), node('p', '', result.methodNote));
    method.append(node('p', '', '当前来源权重：透干 ' + result.sourceWeights.stem + ' / 藏干 ' + result.sourceWeights.hidden + ' / 神煞 ' + result.sourceWeights.omen + '。仅用于基础叙事的匹配，不衡量真实性格或能力。'));
    method.append(node('p', '', '规则版本：' + result.version + '。相同输入与规则产生相同结果，不调用大模型，也不向外部服务上传生辰。组合条件、叙事文案与权重均可编辑，修改后解读可能改变。'));
    const sections = [heading, overview];
    if (featured.children.length) sections.push(node('h3', 'reading-group-title', '你的优势与成长重点'), featured);
    if (grid.children.length) sections.push(node('h3', 'reading-group-title', '性格、做事与相处方式'), grid);
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
      status.textContent = result.dimensions.length + ' 个主题解读已生成。先看整体画像，再查看具体表现、优势、盲点与命盘依据。';
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
