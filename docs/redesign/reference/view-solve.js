/* ═══ Problem-Solving — tracker + 8-step detail (KZ-346) ═══ */

function stepTrack(steps) {
  return `<span class="step-track">${steps.map((done, i) =>
    `<span class="step-track__dot ${done ? 'is-done' : ''}">${i + 1}</span>`).join('')}</span>`;
}

VIEWS.solve = function (el) {
  if (state.kzOpen === 'kz346') return renderKz346(el);

  const open = KZ_ROWS.filter(r => !r.closed).length;
  const closed = KZ_ROWS.filter(r => r.closed).length;
  const rows = KZ_ROWS.map(r => {
    const done = r.steps.filter(Boolean).length;
    const isKz346 = r.kz === 'KZ-346';
    return `
    <tr ${isKz346 ? 'style="background:hsl(var(--action-1))"' : ''}>
      <td>${r.title}${isKz346 ? ' <span class="chip" style="border-color:hsl(var(--action-4)); background:var(--panel); color:var(--accent-text)">AI draft ready</span>' : ''}</td>
      <td style="white-space:nowrap"><span class="mono muted">${r.kz}</span></td>
      <td class="muted">${r.who}</td>
      <td>${r.odg ? '<span class="badge badge--neutral" style="font-size:10.5px">ODG</span>' : '<span class="faint">—</span>'}</td>
      <td class="muted tnum" style="white-space:nowrap">${r.start || '—'}</td>
      <td>${stepTrack(r.steps)} <span class="faint tnum" style="font-size:11.5px; margin-left:6px">${done}/8</span></td>
      <td>${r.closed ? '<span class="badge badge--green"><span class="dot"></span>Closed</span>' : '<span class="badge badge--info"><span class="dot"></span>Active</span>'}</td>
      <td style="text-align:right">${r.a3 ? '<button class="btn btn--ghost btn--sm">View A3</button>' : isKz346 ? '<button class="btn btn--outline btn--sm" data-open-kz>Open 8-Step</button>' : ''}</td>
    </tr>`;
  }).join('');

  el.innerHTML = `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">Operations · 8-Step</span>
      <h1>Problem-Solving Tracker</h1>
      <p class="page-head__sub">31 total · ${open} open · ${closed} closed · 3 full A3s — Operations</p>
    </div>
    <div class="page-head__side">
      <label class="muted" style="font-size:13px" for="red-kpi-select">Trigger a new 8-step from a red sub-KPI</label>
      <select id="red-kpi-select" class="input" style="width:auto; min-width:250px">
        <option>— Select a red sub-KPI —</option>
        <option>Red — OTP — Mexico (75.0% vs 98.5%)</option>
        <option>Red — SRR Supervisor — Mexico (57.4% vs 80%)</option>
        <option>Red — DART Incidents — Norcross (2 vs 0)</option>
      </select>
      <button class="btn btn--primary">Open 8-Step (AI-Drafted)</button>
    </div>
  </div>

  <section class="card ai-draft-banner">
    <div class="ai-note__avatar" style="width:36px;height:36px;font-size:15px">M</div>
    <div style="flex:1; min-width:0">
      <b style="font-size:13.5px">AI-drafted 8-step ready for review — KZ-346 · Pricing Credit Memos Feb '26</b>
      <div class="muted" style="font-size:12.5px; margin-top:2px">Mark pre-solved planning steps 1–6 from the red Mexico OTP sub-KPI, the Short-Code Order Entry SOP, and prior similar KZ-339. You review, edit and confirm.</div>
    </div>
    <button class="btn btn--primary" data-open-kz>Review Draft 8-Step ${ICONS.arrow}</button>
  </section>

  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr>
        <th style="min-width:280px">Item</th><th>KZ #</th><th>Who</th><th>ODG</th>
        <th>Start</th><th style="min-width:220px">Progress (1–8)</th><th>Status</th><th></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div></div>

  <section class="card card--pad" style="margin-top:24px">
    <span class="running-head">How the 8-step is triggered</span>
    <p style="margin:12px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:90ch">
      A main KPI turning red is drilled to its contributing sub-KPIs; a red <b>sub-KPI</b> opens an 8-step owned
      by the manager at that level. The agent pre-solves the planning steps (1–6), grounded in the red KPI, the
      governing SOP, and a prior similar KZ. Rows tagged A3 carry full completed content from the FMDS-New discovery.
    </p>
  </section>

  <p class="board-hint">Extracted from the 8-Step Problem Solving Tracker workbook (Jul 2026). Operations has the most active items (31 rows). Finance and Sales have 3 and 1 respectively.</p>`;

  el.querySelectorAll('[data-open-kz]').forEach(b =>
    b.addEventListener('click', () => { state.kzOpen = 'kz346'; state.step = 4; VIEWS.solve(el); }));
};

/* Mark's step-contextual assist notes for KZ-346 */
const STEP_ASSIST = {
  1: "I filled the gap statement from the T3 story: standard work exists but wasn't followed at order entry for high-volume remake programs. Edit the current-situation line if the backlog number has moved since week 23.",
  2: 'The stratification points at Mexico order entry — that\'s where the short-code re-entry happens. Galls color program, weeks 15–23, order-entry clerks under volume pressure.',
  3: 'Target seeded as: eliminate wrong-short-code remake entries at Mexico order entry by end of Q1, protecting the OTP denominator.',
  4: 'The 5-Whys land on the standard-work gap: no short-code rule for remake jobs. That matches the root cause recorded in KZ-346 and the BWI revision log. Confirm each rung at the point of occurrence before accepting.',
  5: 'Three countermeasures scored — the BWI update ranked highest on Effective and Cost. Nemawashi: loop in Norcross and Houston leads before you lock it.',
  6: 'The action register is live. Step 6 is the ODG gate — the plan is submitted and awaiting Eric / Allison. I\'ll nudge you when the gate clears.',
  7: 'On close, attach the actual-vs-target chart. Baseline: OTP 0.863 (Mar). I\'ll pull the weekly series automatically when you confirm.',
  8: 'Step 8 writes the improvement back to Standard Work (Yokoten). The Short-Code Order Entry BWI already carries the KZ-346 backlink — closing here updates its revision log.',
};

function assistPanel() {
  const note = STEP_ASSIST[state.step] || '';
  const thread = (state.assistThread || []).map(m => m.from === 'user'
    ? `<div class="msg msg--user" style="max-width:100%"><div class="msg__bubble">${m.text}</div></div>`
    : `<div class="msg" style="max-width:100%"><div class="ai-note__avatar" style="width:24px;height:24px;font-size:11px">M</div><div class="msg__bubble">${m.text}</div></div>`
  ).join('');
  return `
  <aside class="eightstep__assist">
    <div class="assist-head">
      <div class="ai-note__avatar" style="width:28px;height:28px;font-size:12px">M</div>
      <div>
        <b style="font-size:13px">Mark · AI assist</b>
        <div class="faint" style="font-size:11px">Grounded in the red KPI, the SOP, and prior KZs</div>
      </div>
    </div>
    <div class="assist-note">
      <span class="running-head" style="font-size:10px">Step ${state.step}</span>
      <p style="margin:6px 0 0; font-size:12.5px; line-height:1.55; color:var(--text-secondary)">${note}</p>
    </div>
    <div class="assist-thread">${thread}</div>
    <div class="chat__composer" style="margin-top:auto">
      <textarea class="input" rows="2" id="assist-input" placeholder="Ask Mark about this step" aria-label="Ask Mark about this step"></textarea>
      <button class="btn btn--primary btn--sm" id="assist-send" style="align-self:flex-end">Send</button>
    </div>
  </aside>`;
}

const ASSIST_REPLY = 'Grounded read: the wrong short-code routes the job incorrectly in WPS and bills into a credit memo — the Feb–Mar Galls spike produced roughly $40K of preventable credits. The corrected rule lives in the Short-Code Order Entry BWI, step 2: always take the remake code from the WMS reference table, never the first-run code. Anything else you want me to pull from the trail?';

/* ── KZ-346 8-step wizard — horizontal step bar, full-width A3 canvas ── */

/* Chart figure with caption + illustrative badge (matches prototype chartBlock) */
function chartFig(svg, opts = {}) {
  return `<figure class="chart-fig">
    ${svg}
    <figcaption class="chart-fig__cap">
      ${opts.illustrative ? '<span class="badge badge--outline" style="font-size:10px">illustrative</span>' : ''}
      ${opts.caption || ''}
    </figcaption>
  </figure>`;
}

function attachSlot(label) {
  return `<div class="drop-zone">
    <span>${label || 'Attach an image or chart — floor photos, before/after, source screenshots'}</span>
    <button class="btn btn--ghost btn--sm" data-attach>Add Image</button>
  </div>`;
}

/* Grounded chart data for KZ-346 — OTP Mexico weekly, weeks 15–23 */
function kzMexicoSeries() { return DATA.kpis.otp.weekly.mexico; }
function kzWeekLabels(extra) {
  const base = DATA.weeks.map(w => 'Wk ' + w);
  for (let i = 0; i < (extra || 0); i++) base.push('Wk ' + (23 + i + 1) + '*');
  return base;
}
function kzGapChart() {
  return chartFig(
    stepChart(kzMexicoSeries(), { target: 0.985, xLabels: kzWeekLabels(), label: 'OTP Mexico actual vs target' }),
    { caption: 'OTP — Mexico · actual vs target, 9 weekly periods on file (weeks 15–23)' });
}
function kzParetoChart() {
  const otp = DATA.kpis.otp;
  const rows = otp.subs
    .filter(s => s.actual != null)
    .map(s => ({ label: s.loc, value: Math.max(0, otp.target - s.actual) }))
    .sort((a, b) => b.value - a.value);
  return chartFig(
    paretoBars(rows, { label: 'OTP gap by location, largest contributor first' }),
    { caption: "Where the gap is coming from — OTP's location family, gap to the 98.5% target, largest contributor first." });
}
function kzRecoveryChart() {
  const base = kzMexicoSeries();
  const tail = [0.65, 0.76, 0.86, 0.93, 0.985];
  return chartFig(
    stepChart(base, { target: 0.985, projected: tail, xLabels: kzWeekLabels(tail.length), label: 'OTP Mexico recovery trend' }),
    { illustrative: true, caption: 'OTP — Mexico · periods 1–9 actual · marker = countermeasure-in · periods 10–14 projected recovery (not yet measured — confirming this is what Step 7 asks you to do).' });
}

function stepBody(n, kz) {
  const S = kz.steps;
  if (n === 1) return `
    <div class="a3-grid a3-grid--2">
      <div class="field"><span class="field__label">Ultimate Goal</span><span class="field__value">${S[1].ultimateGoal}</span></div>
      <div class="field"><span class="field__label">Standard</span><span class="field__value">${S[1].standard}</span></div>
      <div class="field"><span class="field__label">Current Situation</span><span class="field__value">${S[1].current}</span></div>
      <div class="field"><span class="field__label">Gap = Problem</span>
        <span class="field__value a3-callout a3-callout--red">${S[1].gap}</span></div>
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">Chart — the gap over time</span>${kzGapChart()}</div>
    ${attachSlot()}`;
  if (n === 2) return `
    <span class="running-head">Stratification — what · where · when · who (not why) · Genchi Genbutsu to the point of occurrence</span>
    <div class="a3-grid a3-grid--2" style="margin-top:12px">
      ${S[2].strat.map(r => `<div class="field"><span class="field__label">${r.q}</span><span class="field__value">${r.a}</span></div>`).join('')}
    </div>
    <div class="field" style="margin-top:20px"><span class="field__label">Prioritized Problem at the point of occurrence</span>
      <span class="field__value a3-callout a3-callout--accent">${S[2].prioritized}</span></div>
    <div class="field" style="margin-top:24px"><span class="field__label">Breakdown — where is it coming from?</span>${kzParetoChart()}</div>`;
  if (n === 3) return `
    <div class="a3-grid a3-grid--3">
      <div class="field"><span class="field__label">Do What?</span><span class="field__value">${S[3].doWhat}</span></div>
      <div class="field"><span class="field__label">To What?</span><span class="field__value">${S[3].toWhat}</span></div>
      <div class="field"><span class="field__label">By When?</span><span class="field__value">${S[3].byWhen}</span></div>
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">Chart — eliminating the prioritized problem inside the big-problem gap</span>
      ${kzGapChart()}
      <span class="faint" style="font-size:12px; margin-top:4px">${S[3].chartNote}</span></div>`;
  if (n === 4) return `
    <span class="running-head">5-Whys ladder — Genchi Genbutsu: confirm each at the point of occurrence</span>
    <div class="a3-whys" style="margin-top:12px">
      ${S[4].whys.map((w, i) => `
        <div class="a3-why">
          <span class="field__label" style="white-space:nowrap">Why ${i + 1}</span>
          <span class="chip">${S[4].fishbone[i]}</span>
          <span class="field__value">${w}</span>
        </div>`).join('')}
    </div>
    <div class="field" style="margin-top:20px">
      <span class="field__label">Root Cause (confirmed) <span class="chip" style="margin-left:6px">high-leverage</span></span>
      <span class="field__value a3-callout a3-callout--accent" style="font-weight:500">${S[4].rootCause}</span>
    </div>`;
  if (n === 5) {
    if (!state.kz5) state.kz5 = S[5].matrix.map(m => ({ ...m }));
    const scoreSel = (row, key, i) => {
      const v = row[key];
      return `<td class="num score-cell"><select class="score-sel" data-cm-row="${i}" data-cm-field="${key}" aria-label="${key} score, row ${i + 1}">
        ${['', 0, 1, 2].map(o => `<option value="${o}" ${String(v) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('')}
      </select></td>`;
    };
    return `
    <span class="running-head">Countermeasure scoring matrix — score each 0 (worst) · 1 · 2 (best) per dimension</span>
    <div class="table-wrap" style="margin-top:12px; box-shadow:none">
      <table class="dt">
        <thead><tr><th style="min-width:300px">Countermeasure</th>
          <th class="num" title="Safety">S</th><th class="num" title="Quality">Q</th><th class="num" title="Cost">C</th>
          <th class="num" title="Time">T</th><th class="num" title="Customer">Cu</th><th class="num" title="Effective">Ef</th>
          <th class="num" title="Overall — ranked priority">OA</th></tr></thead>
        <tbody>
          ${state.kz5.map((m, i) => `<tr>
            <td><input type="text" class="input cm-text" data-cm-row="${i}" data-cm-field="text" value="${m.text.replace(/"/g, '&quot;')}" placeholder="Countermeasure candidate" aria-label="Countermeasure ${i + 1}"></td>
            ${['S', 'Q', 'C', 'T', 'Cu', 'Ef'].map(k => scoreSel(m, k, i)).join('')}
            <td class="num score-cell"><select class="score-sel score-sel--oa" data-cm-row="${i}" data-cm-field="OA" aria-label="Overall rank, row ${i + 1}">
              ${['', 1, 2, 3, 4, 5].map(o => `<option value="${o}" ${String(m.OA) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('')}
            </select></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="display:flex; align-items:baseline; justify-content:space-between; gap:16px; margin-top:12px; flex-wrap:wrap">
      <p style="margin:0; font-size:12.5px; color:var(--text-dim); max-width:80ch"><b>Overall</b> is the ranked priority, not a sum. Build consensus first (Nemawashi) — reviewed with Norcross and Houston leads.</p>
      <button class="btn btn--outline btn--sm" data-add-cm>Add Countermeasure</button>
    </div>`;
  }
  if (n === 6) return `
    <span class="running-head">Action register — R Behind · Y At Risk · G On Track · C Completed</span>
    <div class="table-wrap" style="margin-top:12px; box-shadow:none">
      <table class="dt">
        <thead><tr><th>No.</th><th style="min-width:260px">Implementation plan</th><th>Responsible</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>
          ${S[6].map(a => {
            const tone = a.status === 'C' || a.status === 'G' ? 'green' : a.status === 'Y' ? 'amber' : 'red';
            const label = a.status === 'C' ? 'Completed' : a.status === 'G' ? 'On Track' : a.status === 'Y' ? 'At Risk' : 'Behind';
            return `<tr><td class="tnum">${a.no}</td><td>${a.plan}</td><td class="muted">${a.responsible}</td><td class="muted tnum" style="white-space:nowrap">${a.due}</td>
              <td><span class="badge badge--${tone}"><span class="dot"></span>${label}</span></td></tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    <button class="btn btn--ghost btn--sm" style="margin-top:8px">Add Row</button>
    <div class="card card--pad" style="margin-top:16px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; box-shadow:none; background:var(--bg-subtle)">
      <div>
        <h4>ODG Gate — Step 6</h4>
        <p style="margin:4px 0 0; font-size:12.5px; color:var(--text-dim)">Reviewer: Eric / Allison (ODG). The countermeasure plan is reviewed before implementation proceeds.</p>
      </div>
      <div style="display:flex; align-items:center; gap:12px">
        <span class="badge badge--amber"><span class="dot"></span>Submitted — awaiting ODG</span>
        <button class="btn btn--secondary btn--sm">Mark ODG-Approved</button>
      </div>
    </div>`;
  if (n === 7) return `
    <div class="a3-grid a3-grid--2">
      <div class="field"><span class="field__label">KPI</span><span class="field__value">${S[7].kpi}</span></div>
      <div class="field"><span class="field__label">New Target</span><span class="field__value">${S[7].newTarget}</span></div>
      <div class="field"><span class="field__label">Measurement — Start (baseline)</span><span class="field__value">${S[7].baseline}</span></div>
      <div class="field"><span class="field__label">Measurement — End (result)</span><span class="field__value">${S[7].result}</span></div>
    </div>
    <div class="field" style="margin-top:20px"><span class="field__label">Result Narrative</span><span class="field__value">${S[7].narrative}</span></div>
    <div class="field" style="margin-top:24px"><span class="field__label">Chart — actual vs target with recovery projection</span>${kzRecoveryChart()}</div>
    ${attachSlot('Attach the confirmed measurement chart on close — the weekly series is pulled automatically when you confirm')}`;
  return `
    <div class="a3-grid a3-grid--2">
      <div class="field"><span class="field__label">Process Documents Created / Updated</span><span class="field__value">${S[8].docs}</span></div>
      <div class="field"><span class="field__label">Training on New Process — Who &amp; When</span><span class="field__value">${S[8].training}</span></div>
      <div class="field"><span class="field__label">Yokoten Plan</span><span class="field__value">${S[8].yokoten}</span></div>
      <div class="field"><span class="field__label">Improvement Image or Chart</span><span class="field__value">${S[8].image}</span></div>
    </div>
    ${attachSlot('Attach the before/after improvement image — credit memos per week and the corrected OTP denominator')}
    <div class="card card--pad" style="margin-top:20px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; box-shadow:none; background:hsl(var(--action-1)); border-color:hsl(var(--action-3))">
      <div>
        <h4>SOP Write-Back (Yokoten)</h4>
        <p style="margin:4px 0 0; font-size:12.5px; color:var(--text-dim)">Step 8 writes the improvement back to the SOP library — SOPs are the input to Steps 1–5 and the output of Step 8.</p>
      </div>
      <button class="btn btn--primary btn--sm" data-go-sop>Update Standard Work</button>
    </div>`;
}

function renderKz346(el) {
  const meta = DATA.eightStepMeta;
  const kz = DATA.kz346;
  const s = meta.steps.find(x => x.n === state.step);

  const stepBar = meta.steps.map(st => `
    <button class="step-tab ${state.step === st.n ? 'is-active' : ''} ${st.n <= 6 ? 'is-done' : ''}" data-step="${st.n}" aria-current="${state.step === st.n ? 'step' : 'false'}">
      <span class="step-tab__n">${st.n <= 6 ? '✓' : st.n}</span>
      <span class="step-tab__name">${st.name}</span>
      <span class="step-tab__pdca">${st.pdca}</span>
    </button>`).join('');

  el.innerHTML = `
  <div class="page-head" style="margin-bottom:16px">
    <div>
      <span class="running-head page-head__eyebrow">8-Step Problem Solving A3 · ${meta.source}</span>
      <h1>KZ-346 · Pricing Credit Memos Feb '26</h1>
      <div class="kz-meta">
        <span class="kz-meta__item">Owner <b>P. Fernandez</b></span>
        <span class="kz-meta__sep"></span>
        <span class="kz-meta__item">Golden Thread</span>
        <span class="kz-meta__item kz-meta__chip">OTP <b style="color:var(--red-text)">86.3%</b></span>
        <span class="kz-meta__arrow">▸</span>
        <span class="kz-meta__item kz-meta__chip">OTP — Mexico <b style="color:var(--red-text)">75.0%</b> <span class="faint">vs 98.5%</span></span>
        <span class="kz-meta__arrow">▸</span>
        <span class="kz-meta__item">opens this 8-step</span>
        <span class="kz-meta__sep"></span>
        <span class="badge badge--info"><span class="dot"></span>AI draft · steps 1–6 pre-solved · 4 confirmed</span>
      </div>
    </div>
    <div class="page-head__side">
      <button class="btn btn--secondary" data-back>Back to Tracker</button>
    </div>
  </div>

  <nav class="step-bar" aria-label="8-step progress">${stepBar}</nav>

  <section class="card eightstep-wide">
    <div class="eightstep__body" style="padding:32px 40px">
      <div style="display:flex; align-items:baseline; justify-content:space-between; gap:16px; flex-wrap:wrap">
        <div>
          <span class="running-head">${s.pdca} · Step ${s.n} of 8${s.n === 4 ? ' · highest-leverage' : ''}</span>
          <h2 style="margin-top:6px; font-size:20px">Step ${s.n}: ${s.name}</h2>
        </div>
        <span class="source-note" style="max-width:44ch; text-align:right">Drafted from red KPI "OTP — Mexico" · prior similar KZ-339 · SOP "Short-Code Order Entry"</span>
      </div>
      <p style="margin:8px 0 24px; font-size:13px; color:var(--text-dim); max-width:90ch">${s.desc}</p>
      ${stepBody(state.step, kz)}
      <div style="display:flex; justify-content:space-between; margin-top:40px">
        <button class="btn btn--ghost-neutral" data-prev ${state.step === 1 ? 'disabled' : ''}>Previous</button>
        <button class="btn btn--primary" data-next>${state.step === 8 ? 'Confirm Step 8 — Close KZ' : 'Confirm & Next'}</button>
      </div>
    </div>
    ${assistPanel()}
  </section>`;

  el.querySelector('[data-back]').addEventListener('click', () => { state.kzOpen = 'tracker'; state.assistThread = []; VIEWS.solve(el); });
  const sopBtn = el.querySelector('[data-go-sop]');
  if (sopBtn) sopBtn.addEventListener('click', () => { state.view = 'sop'; state.sopOpen = true; renderShell(); });

  /* Step 5 — score entry persists in state without re-render */
  el.querySelectorAll('.score-sel, .cm-text').forEach(ctrl => {
    ctrl.addEventListener('change', () => {
      const row = state.kz5[+ctrl.dataset.cmRow];
      if (row) row[ctrl.dataset.cmField] = ctrl.value === '' ? null : (ctrl.dataset.cmField === 'text' ? ctrl.value : +ctrl.value);
    });
  });
  const addCm = el.querySelector('[data-add-cm]');
  if (addCm) addCm.addEventListener('click', () => {
    state.kz5.push({ text: '', S: null, Q: null, C: null, T: null, Cu: null, Ef: null, OA: null });
    VIEWS.solve(el);
    const rows = el.querySelectorAll('.cm-text');
    rows[rows.length - 1].focus();
  });
  el.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { state.step = +b.dataset.step; VIEWS.solve(el); }));
  const prev = el.querySelector('[data-prev]'), next = el.querySelector('[data-next]');
  if (prev) prev.addEventListener('click', () => { state.step = Math.max(1, state.step - 1); VIEWS.solve(el); });
  if (next) next.addEventListener('click', () => { state.step = Math.min(8, state.step + 1); VIEWS.solve(el); });

  const send = el.querySelector('#assist-send'), input = el.querySelector('#assist-input');
  const submitAssist = () => {
    const text = input.value.trim();
    if (!text) return;
    state.assistThread = (state.assistThread || []).concat({ from: 'user', text }, { from: 'mark', text: ASSIST_REPLY });
    VIEWS.solve(el);
    const t = el.querySelector('.assist-thread'); if (t) t.scrollTop = t.scrollHeight;
  };
  if (send) send.addEventListener('click', submitAssist);
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAssist(); } });
}
