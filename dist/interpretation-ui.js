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
  const signed = number => number >= 0 ? '+' + number : '−' + Math.abs(number);
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
    const grid = node('div', 'reading-grid');
    result.dimensions.forEach((dimension, index) => {
      const card = node('article', 'reading-card');
      card.append(node('div', 'reading-card-index', '0' + (index + 1) + ' / ' + dimension.subtitle));
      card.append(node('h3', '', dimension.title));
      const score = node('div', 'reading-score');
      score.append(node('b', '', String(dimension.score)), node('small', '', ' / ' + result.scale.max));
      card.append(score, node('p', 'reading-scale-label', result.scale.label + ' · 非概率 / 非心理测评'));
      const meter = node('div', 'reading-meter');
      meter.setAttribute('aria-hidden', 'true');
      const fill = node('i');
      fill.style.width = (dimension.score - result.scale.min) / (result.scale.max - result.scale.min) * 100 + '%';
      meter.append(fill);
      card.append(meter, node('h4', '', dimension.band.label), node('p', '', dimension.band.text), node('p', 'reading-definition', dimension.description));
      const detail = node('details', 'reading-evidence');
      const count = dimension.evidence.reduce((sum, rule) => sum + rule.hits.length, 0);
      detail.append(node('summary', '', '查看分析依据 · ' + count + ' 条命中'));
      if (!dimension.hasEvidence) detail.append(node('p', '', dimension.band.text));
      dimension.evidence.forEach(rule => {
        const group = node('section', 'reading-rule');
        group.append(node('h5', '', rule.id + ' · 合计 ' + signed(rule.contribution)), node('p', '', rule.explanation));
        const list = node('ul');
        rule.hits.forEach(hit => {
          const item = node('li');
          item.append(node('span', '', hit.name + ' · ' + kindNames[hit.kind] + ' ' + signed(hit.points)), node('small', '', hit.origin));
          if (hit.basis) item.append(node('small', '', '查法：' + hit.basis));
          list.append(item);
        });
        group.append(list);
        detail.append(group);
      });
      const expression = [String(result.scale.base), ...dimension.evidence.map(rule => signed(rule.contribution))].join(' ');
      detail.append(node('p', 'reading-formula', '刻度 = ' + expression + ' = ' + dimension.rawScore + '；限制在 ' + result.scale.min + '–' + result.scale.max + ' 后为 ' + dimension.score + '。'));
      card.append(detail);
      grid.append(card);
    });
    const method = node('details', 'reading-method');
    method.append(node('summary', '', '解读如何生成'), node('p', '', result.methodNote), node('p', '', '规则版本：' + result.version + '。相同输入与相同规则产生相同结果，不调用大模型，也不向外部服务上传生辰。修改规则后，结果可能改变。'));
    results.replaceChildren(heading, grid, method);
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
      status.textContent = '娱乐解读已生成。每项分数均可展开查看柱位与加减分依据。';
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
