/* ═══ KPI Boards — Mechanism B location board ═══ */

function fmtByUnit(v, unit, lowerBetter) {
  if (v == null) return '—';
  if (unit === 'ratio') return pct(v);
  if (unit === 'hrs') return v.toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' hrs';
  if (unit === 'pcs/hr' || unit === 'pcs/labor-hr') return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (unit === 'mixed') return v.toLocaleString('en-US');
  return v.toLocaleString('en-US');
}

VIEWS.kpi = function (el) {
  const locs = [
    { id: 'we', label: 'WE Main' },
    { id: 'mexico', label: 'Mexico' },
    { id: 'norcross', label: 'Norcross' },
    { id: 'houston', label: 'Houston' },
    { id: 'canada', label: 'Canada' },
    { id: 'dr', label: 'Dominican Republic', disabled: true },
    { id: 'hpi', label: 'HPI', disabled: true },
  ];
  const tabs = locs.map(l => `
    <button class="seg__item ${state.loc === l.id ? 'is-on' : ''}" data-loc="${l.id}" ${l.disabled ? 'disabled title="No data"' : ''}>
      ${l.label}${l.disabled ? ' <span class="faint" style="font-size:10px">no data</span>' : ''}
    </button>`).join('');

  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">Operations · Mechanism B</span>
      <h1>KPI Boards</h1>
      <p class="page-head__sub">L2 · Jim Kozel · Location model — expand OTP or PPLH for operator and line contributions</p>
    </div>
    <div class="page-head__side">
      <button class="btn btn--secondary" data-go="overview">Back to Overview</button>
    </div>
  </div>

  ${hoshinStrip()}

  <div class="flex" style="align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:24px">
    <span class="running-head">Location</span>
    <div class="seg" role="tablist" aria-label="Location">${tabs}</div>
    <div style="flex:1"></div>
    <input class="input" style="max-width:220px" type="search" placeholder="Filter KPIs" aria-label="Filter KPIs">
  </div>
  <div id="loc-body"></div>`;

  el.querySelector('[data-go]').addEventListener('click', () => { state.view = 'overview'; renderShell(); });
  const hs = el.querySelector('[data-go-hoshin]');
  if (hs) hs.addEventListener('click', () => { state.view = 'hoshin'; renderShell(); });
  el.querySelectorAll('[data-loc]').forEach(b => b.addEventListener('click', () => {
    state.loc = b.dataset.loc; state.openRows = {}; VIEWS.kpi(el);
    wireChartHover(el, document.getElementById('chart-tip'));
  }));

  const body = el.querySelector('#loc-body');
  if (state.loc === 'we') renderWeMain(body); else renderLocBoard(body, state.loc);
  wireRows(body, el);
};

/* ── WE Main chart panel — adapts to the selected KPI ── */
const CHART_META = {
  otp: {
    title: 'OTP by location — weekly, weeks 15–23',
    sub: 'Mexico is the drag on the WE main. Houston, Norcross and Canada hold near target.',
  },
  pplh: {
    title: 'PPLH — weekly, weeks 1–13',
    sub: 'Above the 67.3 target since week 3. Location rates differ — Canada 109.5 and Norcross 99.5 run high; Houston 63.7 and Mexico 56.2 run below.',
  },
  materials: {
    title: 'Materials $/Revenue — weekly, weeks 1–13',
    sub: 'Lower is better. Holding under the 15.7% target all quarter; every location runs below target (Houston best at 5.2%).',
  },
};

function weMainChart() {
  const sel = state.chartKpi || 'otp';
  const otp = DATA.kpis.otp;
  if (sel === 'otp') {
    return lineChart({
      w: 900, h: 280, target: 0.985, fmt: 'ratio',
      fmtY: v => Math.round(v * 100) + '%',
      label: 'Weekly OTP by location, weeks 15 to 23',
      xLabels: DATA.weeks.map(w => 'Wk ' + w),
      series: [
        { name: 'Norcross', data: otp.weekly.norcross, color: VIZ.contextLine },
        { name: 'Houston', data: otp.weekly.houston, color: VIZ.contextLine },
        { name: 'Canada', data: otp.weekly.canada, color: VIZ.contextLine },
        { name: 'WE Main', data: otp.weekly.we, color: VIZ.single },
        { name: 'Mexico', data: otp.weekly.mexico, color: VIZ.rust, soft: VIZ.rustSoft, emphasis: true },
      ],
    });
  }
  const k = DATA.kpis[sel];
  const isRatio = k.unit === 'ratio';
  return lineChart({
    w: 900, h: 240, target: k.target, fmt: k.unit,
    fmtY: isRatio ? (v => (v * 100).toFixed(1) + '%') : (v => v.toFixed(0)),
    label: k.name + ' weekly actual vs target',
    xLabels: k.series.map((_, i) => 'Wk ' + (i + 1)),
    series: [{ name: 'WE Main', data: k.series, color: VIZ.single, soft: VIZ.singleSoft, emphasis: true }],
  });
}

/* ── WE Main: three main KPIs, expandable to location subs, weekly chart ── */
function renderWeMain(el) {
  const otp = DATA.kpis.otp;
  const wkLabels = DATA.weeks.map(w => 'Wk ' + w);
  const sel = state.chartKpi || 'otp';
  const cm = CHART_META[sel];
  const mainRow = (id, k) => {
    const open = state.openRows[id];
    return `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          <button class="kpi-name__caret ${open ? 'is-open' : ''}" data-row="${id}" aria-expanded="${!!open}" aria-label="Expand ${k.name}">${ICONS.caret}</button>
          ${k.name}
          <span class="chip" title="${DATA.dept.mechanismNote}">Mechanism B</span>
          ${hoshinChips(id)}
        </div>
        ${open && k.note ? `<div class="kpi-flag-note">${k.note}</div>` : ''}
      </td>
      <td class="num">${fmtByUnit(k.target, k.unit)}</td>
      <td class="num" style="font-weight:600">${fmtByUnit(k.actual, k.unit)}</td>
      <td>${statusCell(k.status, k.status === 'green' ? 'On Track' : k.status === 'amber' ? 'At Risk' : 'Off Track')}</td>
      <td><span class="chip">${k.targetSource}</span></td>
      <td>${sparkline(k.series, { w: 132, h: 34, target: k.target, name: k.name + ' trend', labels: k.series.map((_, i) => 'Wk ' + (i + 1)), fmt: k.unit })}</td>
    </tr>
    ${open ? k.subs.map(s => `
      <tr class="kpi-sub">
        <td>${s.loc}${s.flag ? `<div class="kpi-flag-note" style="margin-left:0">${s.flag}</div>` : ''}</td>
        <td class="num">${fmtByUnit(k.target, k.unit)}</td>
        <td class="num">${fmtByUnit(s.actual, k.unit)}</td>
        <td>${s.status === 'nodata' ? '<span class="status-cell status-cell--nodata"><span class="dot"></span>No Data</span>' : statusCell(s.status, s.status === 'green' ? 'On Track' : s.status === 'amber' ? 'At Risk' : 'Off Track')}</td>
        <td><span class="chip">hand-keyed</span></td>
        <td>${k === otp && DATA.kpis.otp.weekly[s.loc.toLowerCase()] ? sparkline(DATA.kpis.otp.weekly[s.loc.toLowerCase()], { w: 132, h: 34, target: k.target, name: s.loc + ' weekly OTP', labels: wkLabels, fmt: 'ratio' }) : ''}</td>
      </tr>`).join('') : ''}`;
  };

  el.innerHTML = `
  <section class="card" style="margin-bottom:24px">
    <div style="padding:24px 24px 8px; display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap">
      <div style="min-width:260px; flex:1">
        <h3>${cm.title}</h3>
        <p class="page-head__sub" style="margin-top:4px; max-width:72ch">${cm.sub}</p>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px">
        <div class="seg" role="tablist" aria-label="Chart KPI">
          <button class="seg__item ${sel === 'otp' ? 'is-on' : ''}" data-chart-kpi="otp">OTP</button>
          <button class="seg__item ${sel === 'pplh' ? 'is-on' : ''}" data-chart-kpi="pplh">PPLH</button>
          <button class="seg__item ${sel === 'materials' ? 'is-on' : ''}" data-chart-kpi="materials">Materials</button>
        </div>
        ${sel === 'otp' ? `
        <div class="legend">
          <span class="legend__item"><span class="legend__line" style="background:hsl(9 37% 56%)"></span>Mexico</span>
          <span class="legend__item"><span class="legend__line" style="background:hsl(197 13% 52%)"></span>WE Main</span>
          <span class="legend__item"><span class="legend__line" style="background:hsl(210 2% 49% / 0.45)"></span>Other locations</span>
        </div>` : ''}
      </div>
    </div>
    <div style="padding: 0 24px 20px">
      ${weMainChart()}
    </div>
  </section>

  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr>
        <th style="min-width:340px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
        <th>Status</th><th>Target source</th><th>Trend</th>
      </tr></thead>
      <tbody>
        ${mainRow('otp', DATA.kpis.otp)}
        ${mainRow('pplh', DATA.kpis.pplh)}
        ${mainRow('materials', DATA.kpis.materials)}
      </tbody>
    </table>
  </div></div>

  ${state.openRows.otp ? `
  <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--red)">
    <span class="running-head">T3 OTP story · Jun 24 review</span>
    <div class="field-list" style="margin-top:12px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
      <div class="field"><span class="field__label">Denominator</span><span class="field__value">Inflated by sample-volume surge — sample rush orders included in the OTP denominator.</span></div>
      <div class="field"><span class="field__label">Backlog</span><span class="field__value">1,917-sample backlog at time of T3 review.</span></div>
      <div class="field"><span class="field__label">Mechanism</span><span class="field__value">Main OTP is an independently entered number; simple vs. weighted average across locations is unconfirmed.</span></div>
    </div>
  </section>` : ''}

  <p class="board-hint"><b>WE Main</b> is entered independently on the COO Board (Mechanism B). <b>Location tabs</b> open each per-location FMDS board — real KPI sets differ by location. <span class="chip">hand-keyed</span> marks a manual literal; <span class="chip">formula</span> is computed by in-sheet formula. Click a row's caret to expand.</p>`;
}

/* ── Per-location boards ── */
function renderLocBoard(el, locId) {
  const L = DATA.locations[locId];
  const months = L.kpis.find(k => k.monthly && k.monthly.length >= 9) ? DATA.months9 : DATA.months6;
  let currentCat = null;
  const rows = L.kpis.map((k, i) => {
    const id = locId + '-' + i;
    const open = state.openRows[id];
    const catRow = k.cat !== currentCat ? `<tr class="kpi-cat"><td colspan="6"><span>${k.cat}</span></td></tr>` : '';
    currentCat = k.cat;
    const expandable = k.contributions || k.people || k.flag;
    const monthsFor = k.monthly ? months.slice(0, k.monthly.length) : [];
    return catRow + `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          ${expandable ? `<button class="kpi-name__caret ${open ? 'is-open' : ''}" data-row="${id}" aria-expanded="${!!open}" aria-label="Expand ${k.name}">${ICONS.caret}</button>` : '<span style="width:22px"></span>'}
          ${k.name}
          ${k.rekey ? '<span class="chip" title="Hand-keyed monthly literal — sub-lines do not feed the main">manual</span>' : ''}
          ${k.formula ? '<span class="chip" style="border-color:hsl(var(--action-4)); background:hsl(var(--action-1)); color:var(--accent-text)" title="Computed by in-sheet formula">formula</span>' : ''}
        </div>
        ${open && k.flag ? `<div class="kpi-flag-note">${k.flag}</div>` : ''}
      </td>
      <td class="num">${k.unit === 'mixed' ? '0.36%' : fmtByUnit(k.target, k.unit)}</td>
      <td class="num" style="font-weight:600">${k.unit === 'mixed' ? (k.actual == null ? '—' : k.actual.toLocaleString('en-US') + ' <span class="faint">count</span>') : fmtByUnit(k.actual, k.unit)}</td>
      <td>${k.status === 'nodata' ? '<span class="status-cell status-cell--nodata"><span class="dot"></span>No Data</span>' : statusCell(k.status, k.status === 'green' ? 'On Track' : k.status === 'amber' ? 'At Risk' : 'Off Track')}</td>
      <td><span class="chip">${k.source}</span></td>
      <td>${k.monthly ? sparkline(k.monthly, { w: 132, h: 34, target: k.target, name: k.name + ' monthly', labels: monthsFor, fmt: k.unit === 'ratio' ? 'ratio' : 'raw' }) : ''}</td>
    </tr>
    ${open && k.contributions ? k.contributions.map(c => `
      <tr class="kpi-sub">
        <td>${c.label} <span class="chip">manual</span></td>
        <td class="num">${fmtByUnit(c.target, k.unit)}</td>
        <td class="num">${fmtByUnit(c.value, k.unit)}</td>
        <td>${c.value == null ? '<span class="status-cell status-cell--nodata"><span class="dot"></span>No Data</span>'
          : statusCell(c.status || (c.value >= c.target === (k.unit !== 'hrs') ? 'green' : 'amber'), (c.status || (c.value >= c.target === (k.unit !== 'hrs') ? 'green' : 'amber')) === 'green' ? 'On Track' : 'Off Track')}</td>
        <td></td><td></td>
      </tr>`).join('') : ''}
    ${open && k.people ? k.people.map(p => `
      <tr class="kpi-sub">
        <td>${p.name} <span class="faint" style="font-weight:400">· Supervisor</span></td>
        <td class="num">${pct(k.target, 0)}</td>
        <td class="num">${p.actual == null ? '—' : pct(p.actual, 0)}</td>
        <td>${p.actual == null ? '<span class="status-cell status-cell--nodata"><span class="dot"></span>No Data</span>' : statusCell(p.actual >= k.target ? 'green' : 'red', p.actual >= k.target ? 'On Track' : 'Off Track')}</td>
        <td></td>
        <td style="min-width:120px">${p.actual != null ? meter(p.actual / k.target, p.actual >= k.target ? 'green' : 'red') : ''}</td>
      </tr>`).join('') : ''}`;
  }).join('');

  el.innerHTML = `
  <section class="loc-note" style="margin-bottom:16px">
    <span class="loc-note__stat"><b>${L.label}</b> FMDS board</span>
    <span class="loc-note__stat"><b>${L.kpiCount}</b> KPI column-pairs in source</span>
    <span class="loc-note__stat"><b>${L.lines}</b> production lines</span>
    <span class="loc-note__stat"><b>${L.buildings}</b> building${L.buildings > 1 ? 's' : ''}</span>
    <span class="loc-note__stat faint" style="flex-basis:100%; font-size:12.5px">Lines: ${L.linesList}</span>
    <span class="loc-note__stat faint" style="flex-basis:100%; font-size:12.5px">${L.note}</span>
  </section>
  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr>
        <th style="min-width:320px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
        <th>Status</th><th>Target source</th><th>Trend</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div></div>
  <p class="board-hint"><span class="chip">manual</span> = hand-keyed literal; <span class="chip" style="border-color:hsl(var(--action-4)); background:hsl(var(--action-1)); color:var(--accent-text)">formula</span> = computed by in-sheet formula. Click a caret to expand line contributions. Data flags are shown inside the expanded row.</p>`;
}

function wireRows(body, viewEl) {
  body.querySelectorAll('[data-row]').forEach(b => b.addEventListener('click', () => {
    state.openRows[b.dataset.row] = !state.openRows[b.dataset.row];
    VIEWS.kpi(viewEl);
    wireChartHover(viewEl, document.getElementById('chart-tip'));
  }));
  body.querySelectorAll('[data-chart-kpi]').forEach(b => b.addEventListener('click', () => {
    state.chartKpi = b.dataset.chartKpi;
    VIEWS.kpi(viewEl);
    wireChartHover(viewEl, document.getElementById('chart-tip'));
  }));
}
