/**
 * views/problemsolving.js — 8-Step Problem-Solving View (the centerpiece)
 *
 * renderProblemSolving(dept, mount)
 *
 * Three surfaces (kept distinct — per spec & the Jul-3 client call):
 *   1. Tracker table — all KZ records for this dept. The 5 REAL completed KZs
 *      (KZ-327/328/342/352/364) open a full read-only A3. Others open the
 *      walkthrough.
 *   2. Read-view — full filled A3 (all 8 steps) for a completed KZ that carries
 *      rich `content`.
 *   3. Agent-prefilled wizard — triggered by a RED SUB-KPI. Steps 1-6 open with
 *      an "AI draft — review & edit" block already populated (lib/agent.draftStep),
 *      grounded in the red KPI + a governing SOP + a prior similar KZ. Step 4 is a
 *      5-Whys ladder + 6M fishbone; step 5 is the countermeasure scoring matrix;
 *      step 6 has the ODG gate; step 8 writes back to the SOP library.
 *
 * SOPs are the INPUT to steps 1-5 and the OUTPUT of step 8 (Yokoten).
 */

import { byDept, newKZ, progress } from '../lib/eightstep.js';
import { contributorsOf, mains, byId } from '../lib/registry.js';
import { ragStatus }               from '../lib/rag.js';
import { draftStep, liveReply }    from '../lib/agent.js';
import { svgRecoveryTrend, svgPareto, svgFunnel } from '../lib/charts.js';

// ─── State (module-level, reset each render) ─────────────────────────────────
let _activeKZ     = null;   // the KZ being solved in the wizard
let _readKZ       = null;   // a completed KZ being viewed read-only
let _currentStep  = 1;      // 1–8 (the wizard page shown)
let _stepData     = {};     // user-entered values per step
let _kzRecords    = [];     // all records for this dept
let _template     = null;   // eightstep-template.json
let _dept         = null;
let _mount        = null;
let _sopWrittenBack = false; // step-8 write-back toggle for the active KZ
let _markStepHelp = null;   // docked Mark co-pilot: current step's proactive suggestion set

// ─── Helpers ─────────────────────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ragChip(status) {
  const label = { green: '● On Track', amber: '▲ At Risk', red: '● Off Track', nodata: '— No Data' }[status] || status;
  return `<span class="rag-chip rag-chip--${status}">${label}</span>`;
}

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && unit.includes('$')) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000) return v.toLocaleString();
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function pdcaColor(pdca) {
  return { PLAN: '#1864ab', DO: '#2f9e44', CHECK: '#e8590c', ACT: '#7048e8' }[pdca] || '#6c757d';
}

// KZs that carry full completed A3 content (rendered as read-view).
function isCompletedA3(kz) {
  return !!(kz && kz.content && kz.closed);
}

// Steps the agent pre-solves.
const AI_STEPS = [1, 2, 3, 4, 5, 6];

// ─── Step-dot progress strip ─────────────────────────────────────────────────

function stepDotStrip(kz, clickable = false, activeStep = null) {
  const steps = kz.steps || {};
  return Array.from({ length: 8 }, (_, i) => {
    const n    = i + 1;
    const done = !!steps[String(n)];
    const isActive = activeStep === n;
    const cls  = done ? 'step-dot step-dot--done' : (isActive ? 'step-dot step-dot--active' : 'step-dot');
    const onclick = clickable
      ? `onclick="window._psGotoStep(${n})" title="Step ${n}"`
      : `title="Step ${n}: ${done ? 'done' : 'not done'}"`;
    return `<span class="${cls}" ${onclick}>${n}</span>`;
  }).join('');
}

// ─── Golden-thread header (main → sub) ────────────────────────────────────────

function renderGoldenThread(dept, kpi) {
  if (!kpi || !dept.kpis) return '';

  const chainItems = [`<span class="gt-node gt-node--l1">L3 Leadership OS</span>`];

  // Dept main (parent of this sub-KPI if one exists, else first main)
  const parent = kpi.parentId ? byId(dept, kpi.parentId) : null;
  const mainKpi = parent || mains(dept)[0];
  if (mainKpi) {
    const rag = ragStatus(mainKpi.actual, mainKpi.target, mainKpi.direction || 'higher_better');
    chainItems.push(`<span class="gt-node gt-node--l2">${esc(dept.name)} — ${esc(mainKpi.name)} ${ragChip(rag)}</span>`);
  }

  // The specific (sub) KPI that triggered the 8-step
  if (kpi && kpi !== mainKpi) {
    const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
    chainItems.push(`<span class="gt-node gt-node--l4">${esc(kpi.name)} ${formatVal(kpi.actual, kpi.unit)} vs ${formatVal(kpi.target, kpi.unit)} ${ragChip(rag)}</span>`);
  }

  return `
    <div class="golden-thread">
      <div class="gt-label">Golden Thread — main red ▸ drill ▸ sub red opens this 8-step</div>
      <div class="gt-chain">
        ${chainItems.join('<span class="gt-arrow">▸</span>')}
      </div>
    </div>`;
}

// ─── Tracker table ────────────────────────────────────────────────────────────

// Honest stall/age flag: a KZ record carries no per-step timestamps, only a
// single real `start` date — so the only fact we can report is "how many
// whole days has this been open" against the real `start`, never a fabricated
// "stalled at step k" moment. Closed KZs and KZs with no `start` on file never
// flag (there is no fact to flag from).
const STALL_DAYS = 14;

function stallInfo(kz) {
  if (!kz || kz.closed || !kz.start) return null;
  const start = new Date(kz.start);
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  if (days < STALL_DAYS) return null;
  const done = progress(kz).done;
  if (done >= 8) return null;
  return { days, done };
}

// Linked red KPI — ties a KZ back to the board KPI it exists to fix (Task 5's
// `linkedKpiId`). Closed KZs whose linked KPI has since gone green are called
// out as "resolved"; everything else just shows the KPI's live RAG chip so a
// KZ that's closed-but-still-red (or open-but-already-green) reads honestly.
function linkedKpiCell(kz, dept) {
  const kpi = kz.linkedKpiId ? byId(dept, kz.linkedKpiId) : null;
  if (!kpi) return '<span class="text-muted" style="font-size:0.78rem">—</span>';
  const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
  const chip = (kz.closed && rag === 'green')
    ? `<span class="rag-chip rag-chip--green">✓ Resolved</span>`
    : ragChip(rag);
  return `
    <div style="font-size:0.8rem;font-weight:500;line-height:1.3;margin-bottom:2px">${esc(kpi.name)}</div>
    ${chip}`;
}

function renderTrackerTable(records, dept) {
  if (!records.length) {
    return `<p class="text-muted" style="padding:16px 0">No 8-step records for ${esc(dept.name)} yet.</p>`;
  }

  const rows = records.map((kz, idx) => {
    const p = progress(kz);
    const completed = isCompletedA3(kz);
    const stall = stallInfo(kz);
    const statusBadge = kz.closed
      ? `<span class="badge badge--success">Closed</span>`
      : kz.active
        ? `<span class="badge badge--info">Active</span>`
        : `<span class="badge">—</span>`;
    const stallFlag = stall
      ? `<div class="stall-flag" title="Open since ${esc(kz.start)} — no per-step timestamps on file, age is measured from the real start date">⚠ open ${stall.days}d · step ${stall.done}/8</div>`
      : '';
    const odgBadge = kz.odgSupport
      ? `<span class="badge badge--accent">ODG</span>`
      : `<span class="text-muted" style="font-size:0.75rem">—</span>`;
    const a3Btn = completed
      ? `<button class="btn btn--outline" style="font-size:0.75rem;padding:3px 8px" onclick="window._psOpenRead(${idx})">View A3 →</button>`
      : `<span class="text-muted" style="font-size:0.72rem">—</span>`;

    return `
      <tr${completed ? ' class="tr--a3"' : ''}>
        <td>
          <div style="font-weight:500;font-size:0.875rem">${esc(kz.title || kz.kzNumber)}${completed ? ' <span class="a3-tag">A3</span>' : ''}</div>
          ${kz.title !== kz.kzNumber ? `<div class="text-muted" style="font-size:0.75rem">${esc(kz.kzNumber)}</div>` : ''}
        </td>
        <td class="text-mono text-muted" style="white-space:nowrap">${esc(kz.kzNumber)}</td>
        <td style="font-size:0.875rem">${esc(kz.who || '—')}</td>
        <td>${linkedKpiCell(kz, dept)}</td>
        <td>${odgBadge}</td>
        <td class="text-muted" style="font-size:0.8rem">${esc(kz.start || '—')}</td>
        <td>
          <div class="step-dots" style="display:flex;gap:3px;align-items:center">
            ${stepDotStrip(kz)}
          </div>
          <div class="text-muted" style="font-size:0.7rem;margin-top:3px">${p.done}/8</div>
        </td>
        <td>${statusBadge}${stallFlag}</td>
        <td>${a3Btn}</td>
      </tr>`;
  }).join('');

  return `
    <div style="overflow-x:auto">
      <table class="kpi-table" style="width:100%">
        <thead>
          <tr>
            <th>Item</th>
            <th>KZ #</th>
            <th>Who</th>
            <th>Linked red KPI</th>
            <th>ODG</th>
            <th>Start</th>
            <th style="min-width:160px">Progress (1–8)</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ─── Tracker header: funnel + counts ─────────────────────────────────────────
// counts[i] = how many KZs in this dept reached step i+1 — a visual drop-off
// curve across the 8 steps (a real cliff between, say, steps 6 and 7 shows up
// as a red bar via svgFunnel's own reach-vs-step-1 RAG grading).

function stepReachCounts(records) {
  return Array.from({ length: 8 }, (_, i) =>
    records.filter(kz => !!(kz.steps && kz.steps[String(i + 1)])).length);
}

function renderTrackerHeaderMeta(records) {
  const counts  = stepReachCounts(records);
  const total   = records.length;
  const open    = records.filter(kz => !kz.closed).length;
  const closed  = records.filter(kz => kz.closed).length;
  const flagged = records.filter(kz => !!stallInfo(kz)).length;
  const svg = svgFunnel(counts, { labels: counts.map((_, i) => `S${i + 1}`), width: 300, height: 108 });

  return `
    <div class="ps-funnel">
      <div class="ps-funnel__label">Step reach — where KZs drop off</div>
      <div class="ps-funnel__svg">${svg}</div>
      <div class="ps-funnel__counts">
        <span><b>${total}</b> total</span>
        <span><b>${open}</b> open</span>
        <span><b>${closed}</b> closed</span>
        <span${flagged ? ' class="ps-funnel__counts--flagged"' : ''}><b>${flagged}</b> flagged</span>
      </div>
    </div>`;
}

// ─── Red SUB-KPI selector ─────────────────────────────────────────────────────
// A 8-step is triggered by a red SUB-KPI (level 2/3), not the main.

function subKpis(dept) {
  if (!dept.kpis) return [];
  return dept.kpis.filter(k => !k.isMain && (k.level === 2 || k.level === 3));
}

function renderRedKpiSelector(dept) {
  const subs = subKpis(dept);
  const redSubs = subs.filter(k => {
    const rag = ragStatus(k.actual, k.target, k.direction || 'higher_better');
    return rag === 'red' || rag === 'amber';
  });

  if (!subs.length) {
    return `<p class="text-muted" style="margin:0;font-size:0.82rem">No sub-KPIs defined for ${esc(dept.name)} — drill from the KPI board to open an 8-step.</p>`;
  }

  const ragLabel = { green: '● Green', amber: '▲ Amber', red: '● Red', nodata: '— No data' };
  // Prefer red/amber subs; fall back to all subs so the demo always has options.
  const list = redSubs.length ? redSubs : subs;
  const options = list.map(k => {
    const rag = ragStatus(k.actual, k.target, k.direction || 'higher_better');
    return `<option value="${esc(k.id)}">${ragLabel[rag] || rag} — ${esc(k.name)} (${formatVal(k.actual, k.unit)} vs ${formatVal(k.target, k.unit)})</option>`;
  }).join('');

  return `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <select id="ps-kpi-select" style="padding:7px 10px;border:1px solid var(--slate-300);border-radius:var(--radius);font-size:0.85rem;background:#fff;max-width:340px">
        <option value="">— Select a red sub-KPI —</option>
        ${options}
      </select>
      <button id="ps-open-btn" class="btn btn--primary" onclick="window._psOpenWizard()">
        Open 8-Step (AI-drafted)
      </button>
    </div>`;
}

// Pick a prior similar completed KZ in this dept to ground the draft.
function priorSimilarKZ(dept) {
  return _kzRecords.find(k => isCompletedA3(k)) || null;
}

function govSop(dept) {
  // Derive the governing SOP for step-8 write-back from a prior KZ's step8 link
  // (which references the real SOP-library / data/sops entry) when available.
  const prior = priorSimilarKZ(dept);
  if (prior && prior.content && prior.content.step8 && prior.content.step8.sopLink) {
    return prior.content.step8.sopLink;
  }
  return { id: null, title: null };
}

// ─── AI-draft block (shown atop steps 1–6) ────────────────────────────────────

function draftBlock(draft, deptId, stepN) {
  const solved = AI_STEPS.filter(n => n <= stepN).length; // cosmetic per-step
  const srcLine = draft && draft.source ? draft.source.line : '';
  const note = draft && draft.note ? `<div style="margin-top:8px;font-size:0.78rem;color:var(--slate-600);font-style:italic">${esc(draft.note)}</div>` : '';
  return `
    <div class="ai-draft">
      <div class="ai-draft__head">
        <span class="ai-draft__badge">AI draft — review &amp; edit</span>
        <span class="ai-draft__src text-mono">${esc(srcLine)}</span>
      </div>
      ${note}
    </div>`;
}

// ─── Chart helpers (Steps 1, 2, 3, 7) ─────────────────────────────────────────
// Real actual-vs-target / breakdown charts drawn from the active KPI's own
// `series` (data/*.json) via lib/charts.js's svgRecoveryTrend/svgPareto.
// Zero-invented-data rule: anything we have to synthesize — no real series on
// file, or the "did it get back to green" future that hasn't happened yet for
// a still-open KZ — is visibly badged "illustrative", never blended in as if
// it were a real reading.

function cap(s) {
  const str = String(s || '');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Deterministic small illustrative trend anchored to the KPI's own
// target/actual (no RNG — a given KPI always renders the same illustrative
// shape). Used only when a KPI has no usable real `series` on file.
function synthIllustrativeSeries(target, actual) {
  const t = typeof target === 'number' ? target : 100;
  const a = typeof actual === 'number' ? actual : t * 0.85;
  const span = Math.abs(t - a) || t * 0.05 || 1;
  const start = a - span * 0.35;
  const n = 6;
  return Array.from({ length: n }, (_, i) => {
    const f = i / (n - 1);
    const wobble = (i % 2 === 0 ? -1 : 1) * span * 0.08;
    return +(start + (a - start) * f + wobble).toFixed(4);
  });
}

// Illustrative "what recovery could look like" tail appended after a real
// (or synthesized) baseline. Step 7 asks "did it get back to green?" — for a
// KZ still open in the wizard that answer genuinely isn't measured yet, so
// this is always rendered badged illustrative at the call site.
function synthRecoveryTail(lastVal, target) {
  if (typeof target !== 'number' || typeof lastVal !== 'number') return [];
  if (target === 0) return [lastVal * 0.5, lastVal * 0.15, 0].map(v => +v.toFixed(4));
  // Climbing toward target, then deliberately through the amber band
  // (ragStatus green needs ratio>=1.0, amber needs ratio>=0.95) before
  // landing above target — so the projection visibly crosses red→amber→green
  // rather than skipping straight from red to green.
  const step1 = lastVal + (target - lastVal) * 0.5;
  const step2 = target * 0.965;
  const step3 = target * 1.02;
  return [step1, step2, step3].map(v => +v.toFixed(4));
}

function hasRealSeries(kpi) {
  return !!(kpi && Array.isArray(kpi.series)
    && kpi.series.filter(v => typeof v === 'number' && !Number.isNaN(v)).length >= 2);
}

function chartBlock(svg, { illustrative = false, caption = '' } = {}) {
  return `
    <div class="chart-block">
      <div class="chart-block__svg">${svg}</div>
      <div class="chart-block__caption">
        ${caption ? `<span>${esc(caption)}</span>` : ''}
        ${illustrative ? '<span class="badge badge--illustrative">illustrative</span>' : ''}
      </div>
    </div>`;
}

// Steps 1 & 3 — gap / objective trend: actual vs target from the KPI's own series.
function gapChartBlock(kpi) {
  if (!kpi) {
    return chartBlock(svgRecoveryTrend([], { width: 340, height: 100 }), { illustrative: true, caption: 'No KPI selected yet.' });
  }
  const real = hasRealSeries(kpi);
  const direction = kpi.direction || 'higher_better';
  const points = real ? kpi.series : synthIllustrativeSeries(kpi.target, kpi.actual);
  const svg = svgRecoveryTrend(points, { target: kpi.target, direction, width: 340, height: 100 });
  const illustrative = !real || !!kpi.illustrative;
  const caption = real
    ? `${kpi.name} — actual vs target, ${points.length} periods on file`
    : `${kpi.name} — no weekly series on file; gap trend shown is illustrative`;
  return chartBlock(svg, { illustrative, caption });
}

// Step 7 — recovery trend: real baseline + countermeasure-in marker + an
// illustrative projected recovery tail (an open KZ has no real "back to
// green" measurement yet — confirming that is what Step 7 asks the human to
// go do).
function recoveryChartBlock(kpi) {
  if (!kpi) {
    return chartBlock(svgRecoveryTrend([], { width: 340, height: 110 }), { illustrative: true, caption: 'No KPI selected yet.' });
  }
  const real = hasRealSeries(kpi);
  const direction = kpi.direction || 'higher_better';
  const baseline = real ? kpi.series.slice() : synthIllustrativeSeries(kpi.target, kpi.actual);
  const target = typeof kpi.target === 'number' ? kpi.target : null;
  const tail = target != null ? synthRecoveryTail(baseline[baseline.length - 1], target) : [];
  const hasTail = tail.length > 0;
  const points = baseline.concat(tail);
  // Only mark the countermeasure-in boundary when a projected recovery tail
  // was actually appended; without a numeric target this is a plain
  // actual-vs-target trend, so no marker and no projected-range caption.
  const cmIndex = hasTail ? baseline.length - 1 : null;
  const svg = svgRecoveryTrend(points, { target, cmIndex, direction, width: 340, height: 110 });
  // Badge illustrative only when the chart actually contains synthesized data:
  // a projected recovery tail, or a fully synthesized baseline (no real series).
  const illustrative = !real || hasTail || !!kpi.illustrative;
  let caption;
  if (!real) {
    caption = `${kpi.name} — no weekly series on file; recovery trend shown is illustrative`;
  } else if (hasTail) {
    caption = `${kpi.name} — periods 1–${baseline.length} actual · marker = countermeasure-in · periods ${baseline.length + 1}–${points.length} projected recovery (not yet measured)`;
  } else {
    caption = `${kpi.name} — actual vs target, ${baseline.length} periods on file`;
  }
  return chartBlock(svg, { illustrative, caption });
}

// Step 2 — breakdown/Pareto: stratify the gap by the KPI's own family
// (siblings sharing a parent = location/rep/team breakdown per the
// registry), largest contributor first.
function paretoRowsFor(dept, kpi) {
  if (!kpi) return { rows: [], illustrative: true };
  let family = [];
  if (kpi.contributors && kpi.contributors.length) {
    family = contributorsOf(dept, kpi.id);
  } else if (kpi.parentId) {
    family = contributorsOf(dept, kpi.parentId);
  }
  if (family.length >= 2) {
    const dir = kpi.direction || 'higher_better';
    const rows = family.map(k => {
      const value = (typeof k.actual === 'number' && typeof k.target === 'number')
        ? Math.max(0, dir === 'higher_better' ? k.target - k.actual : k.actual - k.target)
        : null;
      return { label: k.location ? cap(k.location) : k.name, value };
    });
    return { rows, illustrative: false };
  }
  // No real family on file — a small illustrative stratification, sized off
  // the KPI's own real gap so it's at least proportionate, not made up whole.
  const t = typeof kpi.target === 'number' ? kpi.target : 100;
  const a = typeof kpi.actual === 'number' ? kpi.actual : t * 0.85;
  const totalGap = Math.max(Math.abs(t - a), 0.0001);
  const shares = [0.42, 0.27, 0.19, 0.12];
  const labels = ['Location A', 'Location B', 'Location C', 'Other'];
  return { rows: labels.map((label, i) => ({ label, value: +(totalGap * shares[i]).toFixed(4) })), illustrative: true };
}

function paretoChartBlock(dept, kpi) {
  if (!kpi) return '';
  const { rows, illustrative } = paretoRowsFor(dept, kpi);
  if (!rows.length) return '';
  const svg = svgPareto(rows, { width: 340 });
  const caption = illustrative
    ? `Illustrative breakdown — no location/rep-level sub-KPI family on file for ${kpi.name}.`
    : `Where the gap is coming from — ${kpi.name}'s family, largest contributor first.`;
  return `
    <div class="form-group">
      <label class="form-label">Breakdown — Where Is It Coming From?</label>
      ${chartBlock(svg, { illustrative, caption })}
    </div>`;
}

// ─── Generic prefilled fields (steps 1,2,3) ───────────────────────────────────

function renderPrefillFields(stepDef, stepN, draft, kpi, dept) {
  const saved = _stepData[stepN] || {};
  const draftFields = (draft && draft.fields) || {};
  const fieldsHtml = stepDef.fields.map(f => {
    if (f.columns) return ''; // handled elsewhere
    if (f.key === 'chart') {
      return `<div class="form-group"><label class="form-label">${esc(f.label)}</label>${gapChartBlock(kpi)}</div>`;
    }
    const val = saved[f.key] != null ? saved[f.key] : (draftFields[f.key] || '');
    const isLong = (f.hint && f.hint.length > 70) || String(val).length > 60;
    const input = isLong
      ? `<textarea class="form-input" data-field="${f.key}" rows="3" placeholder="${esc(f.hint)}">${esc(val)}</textarea>`
      : `<input type="text" class="form-input" data-field="${f.key}" placeholder="${esc(f.hint)}" value="${esc(val)}">`;
    return `
      <div class="form-group">
        <label class="form-label">${esc(f.label)}${draftFields[f.key] ? ' <span class="drafted-tag">drafted</span>' : ''}</label>
        ${input}
      </div>`;
  }).join('');
  const extra = stepN === 2 ? paretoChartBlock(dept, kpi) : '';
  return fieldsHtml + extra;
}

// ─── 5-Whys ladder + 6M fishbone (Step 4) ─────────────────────────────────────

function render5Whys6M(stepDef, draft) {
  const saved = _stepData[4] || {};
  const draftWhys = (draft && draft.whys) || [];
  const cats = (_template && _template.fishboneCategories) || ['Man', 'Method', 'Machine', 'Material', 'Environment', 'Measurement'];

  const ladder = [1, 2, 3, 4, 5].map((n, i) => {
    const key = `why${n}`;
    const dw = draftWhys.find(w => w.n === n);
    const val = saved[key] != null ? saved[key] : (dw ? dw.text : '');
    const cat = dw ? dw.category : cats[i];
    const isLast = n === 5;
    return `
      <div class="why-row ${isLast ? 'why-row--root' : ''}">
        <div class="why-rail">
          <span class="why-num">Why ${n}</span>
          <span class="why-cat" title="6M category">${esc(cat)}</span>
        </div>
        <textarea class="form-input why-input" data-field="${key}" rows="2"
          placeholder="${isLast ? 'Root systemic cause — the bone to treat' : 'Why did the level above occur? (fact-based, no blame)'}">${esc(val)}</textarea>
        ${!isLast ? '<div class="why-connector">↓</div>' : ''}
      </div>`;
  }).join('');

  const rootVal = saved.rootCause != null ? saved.rootCause : (draft ? draft.rootCause : '');

  const fishboneRows = cats.map(cat => {
    const fk = `fishbone_${cat.toLowerCase()}`;
    const dw = draftWhys.find(w => w.category === cat);
    const val = saved[fk] != null ? saved[fk] : (dw ? dw.text.replace(/\s+←.*$/, '') : '');
    return `
      <tr>
        <td style="font-weight:600;width:110px;color:var(--slate-600)">${esc(cat)}</td>
        <td><input type="text" class="form-input" data-field="${fk}" placeholder="How does ${esc(cat)} contribute?" value="${esc(val)}"></td>
      </tr>`;
  }).join('');

  return `
    <div class="rootcause-grid">
      <div class="rc-whys">
        <h4 class="rc-head">5-Whys Ladder <span class="text-muted" style="font-weight:400">(Genchi Genbutsu — confirm each at the point of occurrence)</span></h4>
        ${ladder}
        <div class="form-group" style="margin-top:14px">
          <label class="form-label">Root Cause (confirmed) <span class="drafted-tag">high-leverage</span></label>
          <textarea class="form-input" data-field="rootCause" rows="3" placeholder="The single systemic root cause the 5-Whys converge on">${esc(rootVal)}</textarea>
        </div>
      </div>
      <div class="rc-fishbone">
        <h4 class="rc-head">6M Fishbone</h4>
        <table class="fishbone-tbl">${fishboneRows}</table>
      </div>
    </div>`;
}

// ─── Countermeasure scoring matrix (Step 5) ───────────────────────────────────

function renderScoringMatrix(draft) {
  const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [
    { key: 'S', label: 'Safety' }, { key: 'Q', label: 'Quality' }, { key: 'C', label: 'Cost' },
    { key: 'T', label: 'Time' }, { key: 'Cu', label: 'Customer' }, { key: 'Ef', label: 'Effective' }, { key: 'OA', label: 'Overall' }
  ];
  const saved = (_stepData[5] && _stepData[5].countermeasures) || null;
  const rows = saved || (draft && draft.countermeasures) || [];

  const scoreCell = (row, ck, i) => {
    const v = row[ck];
    const opts = ['', 0, 1, 2].map(o =>
      `<option value="${o}" ${String(v) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('');
    return `<td class="score-cell"><select class="score-sel" data-cm-field="${ck}" data-cm-row="${i}">${opts}</select></td>`;
  };

  const body = rows.map((row, i) => `
    <tr>
      <td class="cm-text"><input type="text" class="form-input" data-cm-field="text" data-cm-row="${i}" value="${esc(row.text)}" placeholder="Countermeasure candidate"></td>
      ${cols.map(c => scoreCell(row, c.key, i)).join('')}
    </tr>`).join('');

  return `
    <div>
      <div style="overflow-x:auto">
        <table class="kpi-table cm-matrix">
          <thead>
            <tr>
              <th style="min-width:220px">Countermeasure</th>
              ${cols.map(c => `<th title="0 worst · 2 best" class="score-th">${esc(c.label)}</th>`).join('')}
            </tr>
          </thead>
          <tbody id="cm-matrix-body">${body}</tbody>
        </table>
      </div>
      <div style="font-size:0.75rem;color:var(--slate-500);margin-top:8px">
        Score each 0 (worst) · 1 · 2 (best). <b>Overall</b> = ranked priority, not a sum. Build consensus first (Nemawashi).
      </div>
      <button class="btn btn--outline" style="margin-top:8px;font-size:0.8rem" onclick="window._psAddCmRow()">+ Add Countermeasure</button>
    </div>`;
}

// ─── Action register + ODG gate (Step 6) ──────────────────────────────────────

function renderActionRegister(draft) {
  const statusColors = { R: 'var(--red)', Y: 'var(--amber)', G: 'var(--green)', C: 'var(--accent)' };
  const statusLabels = { R: 'Behind', Y: 'At Risk', G: 'On Track', C: 'Completed' };

  const savedRows = (_stepData[6] && _stepData[6].actionRows)
    || (draft && draft.actionRows)
    || Array.from({ length: 3 }, (_, i) => ({ no: i + 1, plan: '', startDate: '', dueDate: '', responsible: '', status: 'R' }));

  const rows = savedRows.map((row, i) => `
    <tr>
      <td class="text-center text-mono" style="width:40px">${row.no || i + 1}</td>
      <td><input type="text" class="form-input" data-ar-field="plan" data-ar-row="${i}" value="${esc(row.plan)}" placeholder="What needs to be done"></td>
      <td><input type="date" class="form-input" data-ar-field="startDate" data-ar-row="${i}" value="${esc(row.startDate)}" style="min-width:120px"></td>
      <td><input type="date" class="form-input" data-ar-field="dueDate" data-ar-row="${i}" value="${esc(row.dueDate)}" style="min-width:120px"></td>
      <td><input type="text" class="form-input" data-ar-field="responsible" data-ar-row="${i}" value="${esc(row.responsible)}" placeholder="Name"></td>
      <td>
        <select class="form-input" data-ar-field="status" data-ar-row="${i}" style="min-width:90px">
          ${Object.keys(statusColors).map(s =>
            `<option value="${s}" ${row.status === s ? 'selected' : ''}>${s} — ${statusLabels[s]}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('');

  const legend = Object.entries(statusLabels).map(([k, v]) =>
    `<span style="color:${statusColors[k]};font-weight:600">${k}</span>=<span style="color:var(--slate-600)">${v}</span>`).join(' · ');

  const gate = (_stepData[6] && _stepData[6].odgGate) || (draft && draft.odgGate) || { status: 'pending', reviewer: 'Eric / Allison (ODG)' };
  const gateBadge = {
    pending:  '<span class="gate-badge gate-badge--pending">Not yet submitted</span>',
    submitted:'<span class="gate-badge gate-badge--submitted">Submitted — awaiting ODG</span>',
    approved: '<span class="gate-badge gate-badge--approved">✓ ODG approved</span>'
  }[gate.status] || '';

  return `
    <div>
      <div style="overflow-x:auto">
        <table class="kpi-table" style="width:100%;font-size:0.85rem">
          <thead>
            <tr>
              <th style="width:40px">No.</th><th>Implementation Plan</th><th>Start</th><th>Due</th><th>Responsible</th><th>Status</th>
            </tr>
          </thead>
          <tbody id="action-register-body">${rows}</tbody>
        </table>
      </div>
      <div style="font-size:0.75rem;color:var(--slate-500);margin-top:8px">Status: ${legend}</div>
      <button class="btn btn--outline" style="margin-top:8px;font-size:0.8rem" onclick="window._psAddActionRow()">+ Add Row</button>

      <div class="odg-gate">
        <div class="odg-gate__left">
          <div class="odg-gate__label">ODG Gate — Step 6</div>
          <div class="odg-gate__desc">Countermeasure plan must be reviewed by ${esc(gate.reviewer)} before implementation. ${gateBadge}</div>
        </div>
        <button class="btn ${gate.status === 'approved' ? 'btn--success' : 'btn--primary'}"
          onclick="window._psSubmitOdg()" ${gate.status === 'approved' ? 'disabled' : ''}>
          ${gate.status === 'approved' ? 'Approved' : gate.status === 'submitted' ? 'Mark ODG-approved' : 'Submit to ODG for gate review'}
        </button>
      </div>
    </div>`;
}

// ─── Results (Step 7) ─────────────────────────────────────────────────────────

function renderResults(stepDef, kpi) {
  const saved = _stepData[7] || {};
  const seed = {
    kpi: kpi ? kpi.name : '',
    measurementStart: kpi ? `${formatVal(kpi.actual, kpi.unit)} (baseline)` : '',
    newTarget: kpi ? `${formatVal(kpi.target, kpi.unit)}` : ''
  };
  return stepDef.fields.map(f => {
    if (f.key === 'chart') {
      return `<div class="form-group"><label class="form-label">${esc(f.label)}</label>${recoveryChartBlock(kpi)}</div>`;
    }
    const val = saved[f.key] != null ? saved[f.key] : (seed[f.key] || '');
    const isLong = f.key === 'narrative';
    const input = isLong
      ? `<textarea class="form-input" data-field="${f.key}" rows="4" placeholder="${esc(f.hint)}">${esc(val)}</textarea>`
      : `<input type="text" class="form-input" data-field="${f.key}" placeholder="${esc(f.hint)}" value="${esc(val)}">`;
    return `<div class="form-group"><label class="form-label">${esc(f.label)}</label>${input}</div>`;
  }).join('');
}

// ─── Standardize + SOP write-back (Step 8) ─────────────────────────────────────

function renderStandardize(stepDef, dept) {
  const saved = _stepData[8] || {};
  const fields = stepDef.fields.map(f => {
    if (f.key === 'improvementImage') {
      return `<div class="form-group"><label class="form-label">${esc(f.label)}</label>
        <div class="chart-placeholder">Before/after visual — attach.</div></div>`;
    }
    const val = saved[f.key] || '';
    return `<div class="form-group"><label class="form-label">${esc(f.label)}</label>
      <textarea class="form-input" data-field="${f.key}" rows="2" placeholder="${esc(f.hint)}">${esc(val)}</textarea></div>`;
  }).join('');

  const sop = govSop(dept);
  const sopTitle = sop.title || 'the governing Standard Work';
  const writeBackBtn = _sopWrittenBack
    ? `<span class="badge badge--success" style="font-size:0.8rem">✓ Standard Work updated — written back to SOP library</span>`
    : `<button class="btn btn--primary" onclick="window._psWriteBackSop()">Update Standard Work → write back to SOP library</button>`;

  return `
    ${fields}
    <div class="sop-writeback">
      <div class="sop-writeback__label">SOP Write-Back (Yokoten)</div>
      <div style="font-weight:600;font-size:0.95rem;margin:2px 0 4px">${esc(sopTitle)}</div>
      <p class="text-muted" style="margin:0 0 10px;font-size:0.8rem">
        SOPs are the <b>input</b> to Steps 1–5 and the <b>output</b> of Step 8. Locking in the countermeasure updates the standard work so the problem does not recur, and Yokoten shares it to other locations.
      </p>
      ${writeBackBtn}
      <a href="#/dept/${esc(dept.id)}/sop" style="display:inline-block;margin-left:12px;font-size:0.85rem;color:var(--accent)">Open Standard Work view →</a>
    </div>`;
}

// ─── Wizard step page ─────────────────────────────────────────────────────────

function renderWizardStep(dept, kpi, stepN, template) {
  const stepDef = template.steps[stepN - 1];
  if (!stepDef) return `<p class="text-muted">Step ${stepN} not found in template.</p>`;

  const kzNum = _activeKZ.kzNumber;
  const pdca  = stepDef.pdca;

  // Build the structured draft for this step (steps 1–6 only).
  const prior = _activeKZ._prior || null;
  const sop   = _activeKZ._sop || null;
  const draft = AI_STEPS.includes(stepN)
    ? draftStep(dept.id, stepN, {
        kpi: kpi?.name, kpiActual: kpi?.actual ?? null, kpiTarget: kpi?.target ?? null,
        kpiUnit: kpi?.unit, priorKZ: prior, sop
      })
    : null;

  const thread = renderGoldenThread(dept, kpi);
  const pdcaBadge = `<span class="pdca-badge" style="background:${pdcaColor(pdca)}">${pdca}</span>`;

  // AI pre-solve progress indicator (separate surface from the docked drawer).
  const solvedCount = AI_STEPS.filter(n => !!_activeKZ.steps[String(n)] || (draft && draft.prefilled && n === stepN)).length;
  const aiConfirmed = AI_STEPS.filter(n => !!_activeKZ.steps[String(n)]).length;
  const presolveBar = `
    <div class="presolve">
      <div class="presolve__text">
        <span class="presolve__dot">◆</span>
        AI pre-solved <b>${AI_STEPS.length} of 6</b> planning steps — you review &amp; finish.
        <span class="text-muted">${aiConfirmed}/6 confirmed so far.</span>
      </div>
      <div class="presolve__track">
        ${AI_STEPS.map(n => {
          const done = !!_activeKZ.steps[String(n)];
          return `<span class="presolve__seg ${done ? 'presolve__seg--done' : 'presolve__seg--ai'}" title="Step ${n}"></span>`;
        }).join('')}
      </div>
    </div>`;

  // Step-specific body
  let bodyContent = '';
  if (stepN === 4)      bodyContent = render5Whys6M(stepDef, draft);
  else if (stepN === 5) bodyContent = renderScoringMatrix(draft);
  else if (stepN === 6) bodyContent = renderActionRegister(draft);
  else if (stepN === 7) bodyContent = renderResults(stepDef, kpi);
  else if (stepN === 8) bodyContent = renderStandardize(stepDef, dept);
  else                  bodyContent = renderPrefillFields(stepDef, stepN, draft, kpi, dept);

  const draftHeader = AI_STEPS.includes(stepN) ? draftBlock(draft, dept.id, stepN) : '';

  const prevBtn = stepN > 1
    ? `<button class="btn btn--outline" onclick="window._psGotoStep(${stepN - 1})">← Previous</button>` : '<span></span>';
  const nextBtn = stepN < 8
    ? `<button class="btn btn--primary" onclick="window._psConfirmStep(${stepN})">Confirm &amp; Next →</button>`
    : `<button class="btn btn--success" onclick="window._psConfirmStep(${stepN})">Confirm Step 8 — Close KZ</button>`;

  return `
    <div class="wizard-panel" data-step="${stepN}">
      ${presolveBar}
      ${thread}

      <div class="wizard-header">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            ${pdcaBadge}
            <span class="text-muted" style="font-size:0.8rem">Step ${stepN} of 8${stepDef.highLeverage ? ' · highest-leverage' : ''}</span>
          </div>
          <h3 style="margin:0;font-size:1.1rem">Step ${stepN}: ${esc(stepDef.name)}</h3>
          <p class="text-muted" style="margin:4px 0 0;font-size:0.85rem">${esc(stepDef.description)}</p>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div class="text-mono text-muted" style="font-size:0.75rem">${esc(kzNum)}</div>
          <div class="step-dots" style="display:flex;gap:4px;margin-top:6px">
            ${stepDotStrip(_activeKZ, true, stepN)}
          </div>
        </div>
      </div>

      ${draftHeader}

      <div class="wizard-fields">${bodyContent}</div>

      <div class="wizard-nav">
        ${prevBtn}
        <div style="display:flex;gap:8px">${nextBtn}</div>
      </div>
    </div>`;
}

// ─── Docked Mark co-pilot (proactive, per-step) ───────────────────────────────
// Sits beside the wizard (never shown in the tracker or read-only A3). Refreshes
// with a scripted, KPI-grounded suggestion every time the step changes
// (_psGotoStep / _psConfirmStep both re-render the whole wizard view). Each idea
// offers an "Add" action that writes straight into the wizard's own DOM fields —
// no separate state model, no network. See lib/agent.js stepHelpFor() for the
// content; this file only renders it and wires the Add/Dismiss/Ask actions.

function renderMarkItem(it, i) {
  let bodyHtml;
  if (it.type === 'chain') {
    bodyHtml = `
      <div class="mark-item__chain">
        ${it.whys.map(w => `<div class="mark-item__why"><b>Why ${w.n}</b><span class="mark-item__cat">${esc(w.category)}</span>${esc(w.text)}</div>`).join('')}
        ${it.rootCause ? `<div class="mark-item__root">Root (hypothesis): ${esc(it.rootCause)}</div>` : ''}
      </div>`;
  } else if (it.type === 'altbranch') {
    bodyHtml = `<div class="mark-item__text"><span class="mark-item__tag">${esc(it.category)}</span>${esc(it.text)}</div>`;
  } else if (it.type === 'countermeasure') {
    bodyHtml = `
      <div class="mark-item__text">${esc(it.text)}</div>
      <div class="mark-item__scores">S${esc(it.S)} · Q${esc(it.Q)} · C${esc(it.C)} · T${esc(it.T)} · Cu${esc(it.Cu)} · Ef${esc(it.Ef)} · OA ${esc(it.OA)}</div>`;
  } else {
    bodyHtml = `<div class="mark-item__text">${esc(it.text)}</div>`;
  }

  return `
    <div class="mark-item" id="mark-item-${i}">
      ${bodyHtml}
      <div class="mark-item__actions">
        <button class="mark-item__btn mark-item__btn--add" onclick="window._psMarkAdd(${i})">${esc(it.label || 'Add')}</button>
        <button class="mark-item__btn mark-item__btn--skip" onclick="window._psMarkSkip(${i})">Dismiss</button>
      </div>
    </div>`;
}

function renderMarkDock(stepN, stepHelp) {
  const items = (stepHelp && stepHelp.items) || [];
  const itemsHtml = items.length
    ? items.map((it, i) => renderMarkItem(it, i)).join('')
    : `<p class="text-muted" style="font-size:0.78rem;margin:0">Nothing scripted for this step yet — ask below.</p>`;

  return `
    <aside class="mark-dock" id="mark-dock">
      <button class="mark-dock__pill" onclick="window._psMarkReopen()" title="Reopen Mark">
        <span class="mark-dock__avatar mark-dock__avatar--sm">M</span>
      </button>
      <div class="mark-dock__panel">
        <div class="mark-dock__head">
          <div class="mark-dock__ident">
            <span class="mark-dock__avatar">M</span>
            <div>
              <div class="mark-dock__name">Mark</div>
              <div class="mark-dock__meta">helping · Step ${stepN}</div>
            </div>
          </div>
          <button class="mark-dock__close" onclick="window._psMarkDismiss()" title="Dismiss panel">×</button>
        </div>

        ${stepHelp && stepHelp.headline ? `<div class="mark-dock__headline">${esc(stepHelp.headline)}</div>` : ''}
        ${stepHelp && stepHelp.note ? `<div class="mark-dock__note">${esc(stepHelp.note)}</div>` : ''}

        <div class="mark-dock__body">${itemsHtml}</div>

        <div id="mark-dock-answers" class="mark-dock__answers"></div>

        <div class="mark-dock__composer">
          <textarea id="mark-dock-input" rows="2" placeholder="Ask Mark about this step…"></textarea>
          <button class="btn btn--primary" style="width:100%;margin-top:6px;font-size:0.8rem" onclick="window._psMarkAsk()">Ask</button>
        </div>
      </div>
    </aside>`;
}

// ─── Read-view: full completed A3 ─────────────────────────────────────────────

function scoreBadge(v) {
  if (v == null) return '<span class="sc sc--na">–</span>';
  return `<span class="sc sc--${v}">${v}</span>`;
}

function renderReadA3(kz, dept, template) {
  const c = kz.content || {};
  const h = c.header || {};
  const cats = (template && template.scoringMatrix && template.scoringMatrix.columns) || [];

  const whysHtml = (c.step4 && c.step4.whys || []).map(w => `
    <div class="ro-why">
      <span class="ro-why__n">Why ${w.n}</span>
      <span class="ro-why__cat">${esc(w.category)}</span>
      <span class="ro-why__t">${esc(w.text)}</span>
    </div>`).join('');

  const altChains = (c.step4 && c.step4.altChains || []).map(ch => `
    <div class="ro-altchain">
      <div class="text-muted" style="font-size:0.72rem;font-weight:700">${esc(ch.label)}</div>
      ${ch.whys.map((t, i) => `<div class="ro-alt-why">Why ${i + 1}: ${esc(t)}</div>`).join('')}
      <div class="ro-alt-root">Root: ${esc(ch.rootCause)}</div>
    </div>`).join('');

  const cmRows = (c.step5 && c.step5.countermeasures || []).map(cm => `
    <tr>
      <td class="cm-text">${esc(cm.text)}</td>
      ${cats.map(col => `<td class="score-cell">${scoreBadge(cm[col.key])}</td>`).join('')}
    </tr>`).join('');

  const arRows = (c.step6 && c.step6.actionRows || []).map(r => `
    <tr>
      <td class="text-center text-mono">${r.no}</td>
      <td>${esc(r.plan)}</td>
      <td class="text-muted">${esc(r.startDate)}</td>
      <td class="text-muted">${esc(r.dueDate)}</td>
      <td>${esc(r.responsible)}</td>
      <td><span class="ar-status ar-status--${r.status}">${esc(r.status)}</span></td>
    </tr>`).join('');

  const gate = (c.step6 && c.step6.odgGate) || {};
  const gateBadge = gate.status === 'approved'
    ? '<span class="gate-badge gate-badge--approved">✓ ODG approved</span>'
    : gate.status === 'pending'
      ? '<span class="gate-badge gate-badge--pending">ODG gate pending</span>' : '';

  const sopLink = (c.step8 && c.step8.sopLink) || {};
  const stepCard = (n, pdca, title, inner) => `
    <div class="ro-step">
      <div class="ro-step__head">
        <span class="pdca-badge" style="background:${pdcaColor(pdca)}">${pdca}</span>
        <span class="ro-step__n">Step ${n}</span>
        <span class="ro-step__title">${esc(title)}</span>
      </div>
      <div class="ro-step__body">${inner}</div>
    </div>`;

  const kv = (label, val) => `<div class="ro-kv"><span class="ro-kv__k">${esc(label)}</span><span class="ro-kv__v">${esc(val)}</span></div>`;

  return `
    <div class="ro-a3">
      <div style="margin-bottom:14px">
        <button class="btn btn--outline" onclick="window._psCloseRead()" style="font-size:0.8rem">← Back to tracker</button>
      </div>

      <div class="ro-header">
        <div>
          <div class="ro-header__title">${esc(kz.title)} <span class="a3-tag">A3</span></div>
          <div class="text-mono text-muted" style="font-size:0.8rem">${esc(kz.kzNumber)} · ${esc(dept.name)}${h.lang ? ' · ' + esc(h.lang) : ''}</div>
        </div>
        <div class="ro-header__meta">
          ${kv('Sponsor', h.sponsor || '—')}
          ${kv('Leader', h.leader || '—')}
          ${kv('Team', h.team || '—')}
          ${kv('Rev Date', h.revDate || '—')}
        </div>
      </div>
      <div class="step-dots" style="display:flex;gap:4px;margin:12px 0 18px">${stepDotStrip(kz)}</div>

      ${stepCard(1, 'PLAN', 'Clarify the Problem', `
        ${kv('Ultimate Goal', c.step1?.ultimateGoal)}
        ${kv('Standard', c.step1?.standard)}
        ${kv('Current Situation', c.step1?.current)}
        <div class="ro-gap">Gap = Problem: <b>${esc(c.step1?.gap)}</b></div>`)}

      ${stepCard(2, 'PLAN', 'Break Down the Problem', `
        ${c.step2?.note ? `<p class="text-muted" style="font-size:0.8rem;margin:0 0 6px">${esc(c.step2.note)}</p>` : ''}
        <div class="ro-prio">Prioritized problem: <b>${esc(c.step2?.prioritizedProblem)}</b></div>`)}

      ${stepCard(3, 'PLAN', 'Objective', `
        ${kv('Do What', c.step3?.doWhat)}
        ${kv('To What', c.step3?.toWhat)}
        ${kv('By When', c.step3?.byWhen)}`)}

      ${stepCard(4, 'PLAN', 'Root Cause (5-Whys + 6M)', `
        <div class="ro-whys">${whysHtml}</div>
        <div class="ro-rootcause">Root Cause: <b>${esc(c.step4?.rootCause)}</b></div>
        ${altChains ? `<div class="ro-altchains"><div class="text-muted" style="font-size:0.72rem;margin:8px 0 4px">Additional 5-Why chains iterated by the team:</div>${altChains}</div>` : ''}`)}

      ${stepCard(5, 'PLAN', 'Countermeasures (scored)', `
        <div style="overflow-x:auto"><table class="kpi-table cm-matrix">
          <thead><tr><th style="min-width:220px">Countermeasure</th>${cats.map(col => `<th class="score-th" title="${esc(col.label)}">${esc(col.label).slice(0, 4)}</th>`).join('')}</tr></thead>
          <tbody>${cmRows}</tbody>
        </table></div>`)}

      ${stepCard(6, 'DO', 'Implementation + ODG Gate', `
        <div style="overflow-x:auto"><table class="kpi-table" style="font-size:0.83rem">
          <thead><tr><th>No.</th><th>Plan</th><th>Start</th><th>Due</th><th>Responsible</th><th>Status</th></tr></thead>
          <tbody>${arRows}</tbody>
        </table></div>
        <div class="ro-gate">ODG gate: ${gateBadge} <span class="text-muted" style="font-size:0.78rem">${esc(gate.note || '')}</span></div>`)}

      ${stepCard(7, 'CHECK', 'Results', `
        ${kv('KPI', c.step7?.kpi)}
        ${kv('Start (baseline)', c.step7?.measurementStart)}
        ${kv('End (result)', c.step7?.measurementEnd)}
        ${kv('New Target', c.step7?.newTarget)}
        ${c.step7?.narrative ? `<div class="ro-narr">${esc(c.step7.narrative)}</div>` : ''}`)}

      ${stepCard(8, 'ACT', 'Standardize + Yokoten', `
        ${kv('Process Documents', c.step8?.processDocuments)}
        ${kv('Training', c.step8?.training)}
        ${kv('Yokoten', c.step8?.yokoten)}
        <div class="sop-writeback" style="margin-top:12px">
          <div class="sop-writeback__label">SOP Write-Back</div>
          <div style="font-weight:600;font-size:0.9rem">${esc(sopLink.title || '—')}</div>
          <div class="text-muted" style="font-size:0.8rem;margin-top:2px">
            ${sopLink.writtenBack ? '✓ Standard work updated & written back to the SOP library (Yokoten complete).' : 'Standard-work write-back pending close.'}
          </div>
          <a href="#/dept/${esc(dept.id)}/sop" style="display:inline-block;margin-top:8px;font-size:0.85rem;color:var(--accent)">Open Standard Work view →</a>
        </div>`)}
    </div>`;
}

// ─── Main render ──────────────────────────────────────────────────────────────

async function doRender() {
  if (!_dept || !_mount) return;

  if (!_kzRecords.length) {
    try {
      const res = await fetch('data/kz-records.json');
      const all = await res.json();
      _kzRecords = byDept(all, _dept.id);
    } catch (e) { console.warn('Could not load kz-records.json', e); }
  }
  if (!_template) {
    try {
      const res = await fetch('data/eightstep-template.json');
      _template = await res.json();
    } catch (e) { console.warn('Could not load eightstep-template.json', e); }
  }

  let content;

  if (_readKZ) {
    // ── Read-view of a completed A3 ─────────────────────────────────────────
    content = renderReadA3(_readKZ, _dept, _template || { steps: [], scoringMatrix: {} });
  } else if (!_activeKZ) {
    // ── Tracker view ─────────────────────────────────────────────────────────
    const openItems   = _kzRecords.filter(k => !k.closed).length;
    const closedItems = _kzRecords.filter(k => k.closed).length;
    const a3Count     = _kzRecords.filter(isCompletedA3).length;

    content = `
      <div>
        <div class="ps-tophead">
          <div>
            <h2 style="margin:0 0 4px">Problem-Solving Tracker</h2>
            <p class="text-muted" style="margin:0;font-size:0.85rem">
              ${_kzRecords.length} total · ${openItems} open · ${closedItems} closed · ${a3Count} full A3${a3Count === 1 ? '' : 's'} — ${esc(_dept.name)}
            </p>
          </div>
          ${_kzRecords.length ? renderTrackerHeaderMeta(_kzRecords) : ''}
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
            <span style="font-size:0.78rem;color:var(--slate-500)">Trigger a new 8-step from a red sub-KPI:</span>
            ${renderRedKpiSelector(_dept)}
          </div>
        </div>

        ${renderTrackerTable(_kzRecords, _dept)}

        <div class="ps-about">
          <div class="ps-about__label">How the 8-step is triggered</div>
          <p class="text-muted" style="margin:0;font-size:0.8rem">
            A main KPI turning red is drilled to its contributing sub-KPIs; a red <b>sub-KPI</b> opens an 8-step owned by the
            manager at that level. The agent pre-solves the planning steps (1–6) into a reviewable draft — grounded in the red
            KPI, the governing SOP, and a prior similar KZ — and the human reviews &amp; finishes. Rows tagged <span class="a3-tag">A3</span>
            carry full completed content from the FMDS-New discovery.
          </p>
        </div>
      </div>`;
  } else {
    // ── Wizard view ───────────────────────────────────────────────────────────
    const kpiId = _activeKZ._kpiId;
    const kpi   = kpiId && _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    const tmpl  = _template || { steps: [] };

    // Docked Mark co-pilot: a fresh, proactive suggestion every time the step
    // (re)renders — grounded in the KPI via lib/agent.js, no network.
    _markStepHelp = await liveReply(_dept.id, 'step-help', {
      dept: _dept, step: _currentStep, kpi,
      kpiActual: kpi ? kpi.actual : null, kpiTarget: kpi ? kpi.target : null, kpiUnit: kpi ? kpi.unit : null,
      kz: _activeKZ
    });

    content = `
      <div>
        <div style="margin-bottom:16px">
          <button class="btn btn--outline" onclick="window._psCloseWizard()" style="font-size:0.8rem">← Back to tracker</button>
        </div>
        <div class="wizard-layout">
          ${renderWizardStep(_dept, kpi, _currentStep, tmpl)}
          ${renderMarkDock(_currentStep, _markStepHelp)}
        </div>
      </div>`;
  }

  const viewClass = _activeKZ ? 'ps-view ps-view--wizard' : 'ps-view';
  _mount.innerHTML = `<div class="${viewClass}">${content}</div>`;
  attachHandlers();
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function attachHandlers() {
  window._psOpenWizard = () => {
    const sel = document.getElementById('ps-kpi-select');
    const kpiId = sel && sel.value;
    if (!kpiId) { alert('Please select a red sub-KPI first.'); return; }
    const kpi = _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    _activeKZ = newKZ({ item: kpi?.name || 'Problem', who: _dept.lead || '', deptId: _dept.id });
    _activeKZ._kpiId = kpiId;
    _activeKZ._prior = priorSimilarKZ(_dept);
    _activeKZ._sop   = govSop(_dept);
    _currentStep = 1;
    _stepData = {};
    _sopWrittenBack = false;
    doRender();
  };

  window._psOpenRead = (idx) => {
    _readKZ = _kzRecords[idx] || null;
    doRender();
  };
  window._psCloseRead = () => { _readKZ = null; doRender(); };

  window._psCloseWizard = () => {
    _activeKZ = null; _currentStep = 1; _stepData = {}; _sopWrittenBack = false; _markStepHelp = null;
    doRender();
  };

  window._psGotoStep = (n) => { _saveCurrentStepInputs(); _currentStep = n; doRender(); };

  window._psConfirmStep = (n) => {
    _saveCurrentStepInputs();
    if (_activeKZ) _activeKZ.steps[String(n)] = true;
    if (n === 8) {
      if (_activeKZ) { _activeKZ.closed = true; _activeKZ.active = false; }
      // _activeKZ is usually a brand-new record (from newKZ(), via the
      // red-sub-KPI selector or the ?kpi= handoff) that isn't in _kzRecords
      // yet — prepend it. But Fix 1's ?kz= handoff can open the wizard on an
      // EXISTING record already IN _kzRecords (same reference); guard so
      // closing that one doesn't duplicate its row in the tracker.
      _kzRecords = _kzRecords.includes(_activeKZ) ? _kzRecords : [_activeKZ, ..._kzRecords];
      _activeKZ = null; _currentStep = 1; _stepData = {}; _sopWrittenBack = false; _markStepHelp = null;
    } else {
      _currentStep = n + 1;
    }
    doRender();
  };

  window._psSubmitOdg = () => {
    _saveCurrentStepInputs();
    const cur = (_stepData[6] && _stepData[6].odgGate) || { status: 'pending', reviewer: 'Eric / Allison (ODG)' };
    const next = cur.status === 'pending' ? 'submitted' : 'approved';
    _stepData[6] = { ...(_stepData[6] || {}), odgGate: { ...cur, status: next } };
    doRender();
  };

  window._psWriteBackSop = () => {
    _saveCurrentStepInputs();
    _sopWrittenBack = true;
    doRender();
  };

  window._psAddActionRow = () => {
    const tbody = document.getElementById('action-register-body');
    if (!tbody) return;
    const n = tbody.querySelectorAll('tr').length + 1;
    if (n > 10) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-center text-mono" style="width:40px">${n}</td>
      <td><input type="text" class="form-input" data-ar-field="plan" data-ar-row="${n - 1}" placeholder="What needs to be done"></td>
      <td><input type="date" class="form-input" data-ar-field="startDate" data-ar-row="${n - 1}" style="min-width:120px"></td>
      <td><input type="date" class="form-input" data-ar-field="dueDate" data-ar-row="${n - 1}" style="min-width:120px"></td>
      <td><input type="text" class="form-input" data-ar-field="responsible" data-ar-row="${n - 1}" placeholder="Name"></td>
      <td><select class="form-input" data-ar-field="status" data-ar-row="${n - 1}" style="min-width:90px">
        <option value="R" selected>R — Behind</option><option value="Y">Y — At Risk</option>
        <option value="G">G — On Track</option><option value="C">C — Completed</option></select></td>`;
    tbody.appendChild(tr);
  };

  window._psAddCmRow = () => {
    const tbody = document.getElementById('cm-matrix-body');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [];
    const tr = document.createElement('tr');
    const scoreCells = cols.map(c =>
      `<td class="score-cell"><select class="score-sel" data-cm-field="${c.key}" data-cm-row="${i}"><option value="">–</option><option value="0">0</option><option value="1">1</option><option value="2">2</option></select></td>`).join('');
    tr.innerHTML = `<td class="cm-text"><input type="text" class="form-input" data-cm-field="text" data-cm-row="${i}" placeholder="Countermeasure candidate"></td>${scoreCells}`;
    tbody.appendChild(tr);
  };

  // ── Docked Mark co-pilot ────────────────────────────────────────────────
  window._psMarkAdd = (idx) => {
    if (!_markStepHelp || !_markStepHelp.items || !_markStepHelp.items[idx]) return;
    const item = _markStepHelp.items[idx];
    const panel = document.querySelector('.wizard-panel');
    if (!panel) return;

    if (item.type === 'chain') {
      item.whys.forEach(w => {
        const el = panel.querySelector(`[data-field="why${w.n}"]`);
        if (el) el.value = el.value ? `${el.value}\n\n${w.text}` : w.text;
      });
      if (item.rootCause) {
        const rc = panel.querySelector('[data-field="rootCause"]');
        if (rc) rc.value = rc.value ? `${rc.value}\n\n${item.rootCause}` : item.rootCause;
      }
    } else if (item.type === 'altbranch') {
      const el = panel.querySelector(`[data-field="fishbone_${item.category.toLowerCase()}"]`);
      if (el) el.value = el.value ? `${el.value}\n\n${item.text}` : item.text;
    } else if (item.type === 'countermeasure') {
      _addSuggestedCmRow(item);
    } else if (item.type === 'recovery') {
      const el = panel.querySelector('[data-field="narrative"]');
      if (el) el.value = el.value ? `${el.value}\n\n${item.text}` : item.text;
    } else if (item.type === 'action') {
      _addSuggestedActionRow(item);
    } else if (item.type === 'nudge' && item.field) {
      const el = panel.querySelector(`[data-field="${item.field}"]`);
      if (el) el.value = el.value ? `${el.value}\n\n${item.text}` : item.text;
    }

    _markMarkItem(idx, 'added', '✓ Added — edit above before confirming');
  };

  window._psMarkSkip = (idx) => {
    _markMarkItem(idx, 'skipped', null);
  };

  window._psMarkDismiss = () => {
    const dock = document.getElementById('mark-dock');
    if (dock) dock.classList.add('mark-dock--collapsed');
  };

  window._psMarkReopen = () => {
    const dock = document.getElementById('mark-dock');
    if (dock) dock.classList.remove('mark-dock--collapsed');
  };

  window._psMarkAsk = async () => {
    const input = document.getElementById('mark-dock-input');
    const q = input && input.value.trim();
    if (!q || !_activeKZ) return;
    const kpiId = _activeKZ._kpiId;
    const kpi = kpiId && _dept.kpis ? _dept.kpis.find(k => k.id === kpiId) : null;
    const reply = await liveReply(_dept.id, 'step-help', { dept: _dept, step: _currentStep, kpi, kz: _activeKZ, question: q });
    const list = document.getElementById('mark-dock-answers');
    const answerText = (reply && reply.items && reply.items[0] && reply.items[0].text) || '';
    if (list) {
      const div = document.createElement('div');
      div.className = 'mark-answer';
      div.innerHTML = `<div class="mark-answer__q">${esc(q)}</div><div class="mark-answer__a">${esc(answerText)}</div>`;
      list.appendChild(div);
    }
    input.value = '';
  };
}

// Visually marks a docked-panel suggestion as handled (added/skipped) in place —
// deliberately NOT a full doRender(), so unsaved edits elsewhere in the wizard
// (and other suggestion rows) are left untouched.
function _markMarkItem(idx, state, doneLabel) {
  const row = document.getElementById(`mark-item-${idx}`);
  if (!row) return;
  row.classList.add(`mark-item--${state}`);
  row.querySelectorAll('button').forEach(b => { b.disabled = true; });
  if (doneLabel) {
    const tag = document.createElement('div');
    tag.className = 'mark-item__done';
    tag.textContent = doneLabel;
    row.appendChild(tag);
  }
}

// Appends one prefilled row to the Step 5 scoring matrix (mirrors _psAddCmRow,
// but seeded with the suggestion's text + scores instead of a blank row).
function _addSuggestedCmRow(item) {
  const tbody = document.getElementById('cm-matrix-body');
  if (!tbody) return;
  const i = tbody.querySelectorAll('tr').length;
  const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [];
  const scoreCells = cols.map(c => {
    const v = item[c.key];
    const opts = ['', 0, 1, 2].map(o =>
      `<option value="${o}" ${String(v) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('');
    return `<td class="score-cell"><select class="score-sel" data-cm-field="${c.key}" data-cm-row="${i}">${opts}</select></td>`;
  }).join('');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td class="cm-text"><input type="text" class="form-input" data-cm-field="text" data-cm-row="${i}" value="${esc(item.text)}" placeholder="Countermeasure candidate"></td>${scoreCells}`;
  tbody.appendChild(tr);
}

// Appends one prefilled row to the Step 6 action register (mirrors _psAddActionRow,
// but seeded with the suggestion's text as the plan).
function _addSuggestedActionRow(item) {
  const tbody = document.getElementById('action-register-body');
  if (!tbody) return;
  const n = tbody.querySelectorAll('tr').length + 1;
  if (n > 10) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="text-center text-mono" style="width:40px">${n}</td>
    <td><input type="text" class="form-input" data-ar-field="plan" data-ar-row="${n - 1}" value="${esc(item.text)}" placeholder="What needs to be done"></td>
    <td><input type="date" class="form-input" data-ar-field="startDate" data-ar-row="${n - 1}" style="min-width:120px"></td>
    <td><input type="date" class="form-input" data-ar-field="dueDate" data-ar-row="${n - 1}" style="min-width:120px"></td>
    <td><input type="text" class="form-input" data-ar-field="responsible" data-ar-row="${n - 1}" placeholder="Name"></td>
    <td><select class="form-input" data-ar-field="status" data-ar-row="${n - 1}" style="min-width:90px">
      <option value="R" selected>R — Behind</option><option value="Y">Y — At Risk</option>
      <option value="G">G — On Track</option><option value="C">C — Completed</option></select></td>`;
  tbody.appendChild(tr);
}

function _saveCurrentStepInputs() {
  if (!_activeKZ) return;
  const panel = document.querySelector('.wizard-panel');
  if (!panel) return;
  const stepN = parseInt(panel.dataset.step, 10);
  const saved = { ...(_stepData[stepN] || {}) };

  panel.querySelectorAll('[data-field]').forEach(el => { saved[el.dataset.field] = el.value; });

  // Action register rows
  const tbody = document.getElementById('action-register-body');
  if (tbody) {
    const arRows = [];
    tbody.querySelectorAll('tr').forEach((tr, i) => {
      const rowData = { no: i + 1 };
      tr.querySelectorAll('[data-ar-field]').forEach(el => { rowData[el.dataset.arField] = el.value; });
      arRows.push(rowData);
    });
    if (arRows.length) saved.actionRows = arRows;
  }

  // Countermeasure matrix rows
  const cmBody = document.getElementById('cm-matrix-body');
  if (cmBody) {
    const cmRows = [];
    cmBody.querySelectorAll('tr').forEach((tr, i) => {
      const row = {};
      tr.querySelectorAll('[data-cm-field]').forEach(el => {
        const f = el.dataset.cmField;
        row[f] = f === 'text' ? el.value : (el.value === '' ? null : Number(el.value));
      });
      cmRows.push(row);
    });
    if (cmRows.length) saved.countermeasures = cmRows;
  }

  _stepData[stepN] = saved;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const PS_STYLES = `
  .ps-view { max-width: 1000px; }
  .ps-view--wizard { max-width: 1320px; }
  .ps-tophead { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:12px; }

  /* Step-reach funnel + counts (tracker header) */
  .ps-funnel { display:flex; flex-direction:column; align-items:center; gap:2px; }
  .ps-funnel__label { font-size:0.63rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--slate-500); }
  .ps-funnel__svg svg { display:block; }
  .ps-funnel__counts { display:flex; gap:10px; font-size:0.72rem; color:var(--slate-600); }
  .ps-funnel__counts b { color:var(--slate-900); }
  .ps-funnel__counts--flagged, .ps-funnel__counts--flagged b { color:var(--amber); }

  /* Stall / age flag (tracker rows — real start-date age only, no fabricated per-step timing) */
  .stall-flag { margin-top:4px; font-size:0.68rem; font-weight:600; color:var(--amber); white-space:nowrap; }

  /* Golden thread */
  .golden-thread { background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius); padding: 10px 14px; }
  .gt-label { font-size: 0.63rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); margin-bottom: 6px; }
  .gt-chain { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; font-size: 0.82rem; }
  .gt-node { padding: 3px 8px; border-radius: var(--radius); background: #fff; border: 1px solid var(--slate-200); white-space: nowrap; }
  .gt-node--l1 { color: var(--slate-500); font-size: 0.75rem; }
  .gt-node--l2 { font-weight: 500; }
  .gt-node--l4 { border-color: #ffc9c9; background: #fff5f5; font-weight: 600; }
  .gt-arrow { color: var(--slate-400); font-size: 0.75rem; }

  /* AI pre-solve indicator */
  .presolve { display:flex; align-items:center; justify-content:space-between; gap:12px;
    background: linear-gradient(90deg, var(--accent-light,#eaf0ff), #fff);
    border:1px solid var(--accent, #2f6bff); border-radius: var(--radius); padding:10px 14px; margin-bottom:14px; }
  .presolve__text { font-size:0.85rem; color: var(--slate-800); }
  .presolve__dot { color: var(--accent,#2f6bff); margin-right:4px; }
  .presolve__track { display:flex; gap:4px; }
  .presolve__seg { width:26px; height:6px; border-radius:3px; }
  .presolve__seg--ai { background: var(--accent-light,#c9d8ff); border:1px solid var(--accent,#2f6bff); }
  .presolve__seg--done { background: var(--green,#2f9e44); }

  /* AI draft block */
  .ai-draft { background: var(--accent-light,#eaf0ff); border-left:3px solid var(--accent,#2f6bff); border-radius: 0 var(--radius) var(--radius) 0; padding:10px 14px; margin:16px 0; }
  .ai-draft__head { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .ai-draft__badge { font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color: var(--accent,#2f6bff); }
  .ai-draft__src { font-size:0.72rem; color: var(--slate-600); }
  .drafted-tag { font-size:0.6rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color: var(--accent,#2f6bff); background:#fff; border:1px solid var(--accent-light,#c9d8ff); border-radius:3px; padding:1px 5px; margin-left:4px; }

  /* PDCA badge */
  .pdca-badge { color:#fff; padding:2px 8px; border-radius:3px; font-size:0.68rem; font-weight:700; letter-spacing:0.05em; }

  /* Step dots */
  .step-dot { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; border:2px solid var(--slate-300); font-size:0.7rem; font-weight:600; color:var(--slate-400); cursor:default; transition:all .15s; }
  .step-dot--done { background: var(--green); border-color: var(--green); color:#fff; }
  .step-dot--active { background: var(--accent); border-color: var(--accent); color:#fff; }
  [onclick].step-dot { cursor:pointer; }
  [onclick].step-dot:hover { opacity:.8; transform:scale(1.1); }

  /* Wizard */
  .wizard-panel { background:#fff; border:1px solid var(--slate-200); border-radius: var(--radius-lg); padding:24px; box-shadow: var(--shadow-sm); }
  .wizard-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-top:4px; }
  .wizard-fields { margin-top:16px; }
  .wizard-nav { display:flex; justify-content:space-between; align-items:center; margin-top:24px; padding-top:16px; border-top:1px solid var(--slate-200); }

  /* Docked Mark co-pilot (wizard only) */
  .wizard-layout { display:flex; align-items:flex-start; gap:20px; }
  .wizard-layout .wizard-panel { flex:1 1 auto; min-width:0; }
  @media (max-width: 980px) { .wizard-layout { flex-direction:column; } .mark-dock { width:100%; position:static; } }

  .mark-dock { width:280px; flex-shrink:0; position:sticky; top:16px; }
  .mark-dock__pill { display:none; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; border:1px solid var(--slate-200); background:#fff; cursor:pointer; box-shadow: var(--shadow-sm); padding:0; }
  .mark-dock--collapsed .mark-dock__panel { display:none; }
  .mark-dock--collapsed .mark-dock__pill { display:flex; }

  .mark-dock__panel { background:#fff; border:1px solid var(--slate-200); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow:hidden; display:flex; flex-direction:column; max-height: calc(100vh - 140px); }
  .mark-dock__head { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid var(--slate-200); background: var(--slate-50); flex-shrink:0; }
  .mark-dock__ident { display:flex; align-items:center; gap:8px; }
  .mark-dock__avatar { width:28px; height:28px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-family: var(--font-mono, monospace); font-weight:700; font-size:0.78rem; color:#fff; background: linear-gradient(140deg, var(--accent), #6f4bff); box-shadow: 0 0 0 3px var(--accent-light, #eaf0ff); }
  .mark-dock__avatar--sm { width:24px; height:24px; font-size:0.7rem; box-shadow:none; }
  .mark-dock__name { font-size:0.85rem; font-weight:700; color: var(--slate-800); line-height:1.1; }
  .mark-dock__meta { font-size:0.62rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color: var(--accent); margin-top:2px; }
  .mark-dock__close { background:none; border:none; font-size:1.15rem; line-height:1; color: var(--slate-400); cursor:pointer; padding:0 2px; }
  .mark-dock__close:hover { color: var(--slate-700); }

  .mark-dock__headline { padding:10px 14px 0; font-size:0.8rem; font-weight:600; color: var(--slate-800); }
  .mark-dock__note { padding:4px 14px 0; font-size:0.7rem; font-style:italic; color: var(--slate-500); }

  .mark-dock__body { padding:10px 14px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; }
  .mark-item { border:1px solid var(--slate-200); border-radius: var(--radius); padding:8px 10px; background: var(--slate-50); }
  .mark-item--added { border-color: var(--green); background: var(--green-bg); }
  .mark-item--skipped { opacity:0.5; }
  .mark-item__text { font-size:0.78rem; color: var(--slate-700); line-height:1.4; }
  .mark-item__tag { font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color: var(--accent); background:#fff; border:1px solid var(--accent-light,#c9d8ff); border-radius:3px; padding:1px 5px; margin-right:5px; }
  .mark-item__chain { display:flex; flex-direction:column; gap:3px; }
  .mark-item__why { font-size:0.76rem; color: var(--slate-700); line-height:1.4; }
  .mark-item__why b { color: var(--accent); font-family: var(--font-mono, monospace); font-size:0.72rem; margin-right:4px; }
  .mark-item__cat { font-size:0.58rem; font-weight:700; text-transform:uppercase; color: var(--slate-500); background: var(--slate-100); border-radius:3px; padding:0 4px; margin:0 5px 0 2px; }
  .mark-item__root { margin-top:4px; font-size:0.76rem; font-weight:600; color: var(--slate-800); }
  .mark-item__scores { margin-top:4px; font-family: var(--font-mono, monospace); font-size:0.68rem; color: var(--slate-500); }
  .mark-item__actions { display:flex; gap:6px; margin-top:8px; }
  .mark-item__btn { flex:1; font-size:0.7rem; font-weight:600; padding:4px 8px; border-radius: var(--radius-sm); cursor:pointer; border:1px solid transparent; }
  .mark-item__btn:disabled { cursor:default; opacity:.6; }
  .mark-item__btn--add { background: var(--accent); color:#fff; }
  .mark-item__btn--add:hover:not(:disabled) { opacity:.88; }
  .mark-item__btn--skip { background:transparent; border-color: var(--slate-300); color: var(--slate-600); }
  .mark-item__btn--skip:hover:not(:disabled) { background: var(--slate-100); }
  .mark-item__done { margin-top:6px; font-size:0.68rem; font-weight:700; color: var(--green); }

  .mark-dock__answers { padding: 0 14px; display:flex; flex-direction:column; gap:8px; }
  .mark-answer { font-size:0.75rem; }
  .mark-answer__q { font-weight:700; color: var(--slate-700); }
  .mark-answer__a { color: var(--slate-600); margin-top:2px; white-space:pre-wrap; }

  .mark-dock__composer { padding:10px 14px 14px; border-top:1px solid var(--slate-200); flex-shrink:0; }
  .mark-dock__composer textarea { width:100%; resize:none; font-size:0.78rem; padding:7px 9px; border:1px solid var(--slate-300); border-radius: var(--radius); box-sizing:border-box; font-family:inherit; }
  .mark-dock__composer textarea:focus { outline:none; border-color: var(--accent); box-shadow:0 0 0 2px var(--accent-light); }

  /* Forms */
  .form-group { margin-bottom:14px; }
  .form-label { display:block; font-size:0.8rem; font-weight:600; color:var(--slate-700); margin-bottom:5px; }
  .form-input { width:100%; padding:7px 10px; border:1px solid var(--slate-300); border-radius: var(--radius); font-size:0.875rem; font-family:inherit; color:var(--slate-900); background:#fff; transition:border-color .15s; box-sizing:border-box; }
  .form-input:focus { outline:none; border-color: var(--accent); box-shadow:0 0 0 2px var(--accent-light); }
  textarea.form-input { resize:vertical; }
  .chart-placeholder { border:1px dashed var(--slate-300); border-radius: var(--radius); padding:16px; text-align:center; color:var(--slate-400); font-size:0.8rem; background: var(--slate-50); }

  /* Charts (Steps 1,2,3,7 — real actual-vs-target / breakdown SVGs) */
  .chart-block { border:1px solid var(--slate-200); border-radius: var(--radius); padding:10px 12px 8px; background:#fff; }
  .chart-block__svg { overflow-x:auto; }
  .chart-block__svg svg { display:block; }
  .chart-block__caption { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:6px; font-size:0.72rem; color:var(--slate-500); }

  /* Root cause grid (step 4) */
  .rootcause-grid { display:grid; grid-template-columns: 1.15fr 0.85fr; gap:24px; }
  @media (max-width: 820px) { .rootcause-grid { grid-template-columns: 1fr; } }
  .rc-head { font-size:0.85rem; font-weight:700; margin:0 0 12px; color:var(--slate-700); }
  .why-row { position:relative; margin-bottom:10px; }
  .why-rail { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
  .why-num { font-size:0.72rem; font-weight:700; color:var(--accent,#2f6bff); font-family: var(--mono, monospace); }
  .why-cat { font-size:0.62rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:var(--slate-500); background:var(--slate-100); border-radius:3px; padding:1px 6px; }
  .why-input { border-left:3px solid var(--accent-light,#c9d8ff); }
  .why-row--root .why-input { border-left:3px solid var(--accent,#2f6bff); background:#fbfcff; }
  .why-connector { text-align:left; color:var(--slate-300); font-size:0.9rem; line-height:1; margin:2px 0 0 6px; }
  .fishbone-tbl { width:100%; border-collapse:collapse; font-size:0.85rem; }
  .fishbone-tbl td { padding:4px 0 4px 4px; }

  /* Countermeasure matrix */
  .cm-matrix th, .cm-matrix td { font-size:0.8rem; }
  .cm-matrix .cm-text { min-width:200px; }
  .score-th { text-align:center; }
  .score-cell { text-align:center; }
  .score-sel { padding:3px 4px; border:1px solid var(--slate-300); border-radius:4px; font-family: var(--mono, monospace); font-size:0.8rem; }
  .sc { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:4px; font-family: var(--mono, monospace); font-weight:700; font-size:0.78rem; }
  .sc--0 { background:#ffe3e3; color:#c92a2a; } .sc--1 { background:#fff3bf; color:#e67700; } .sc--2 { background:#d3f9d8; color:#2b8a3e; } .sc--na { background:var(--slate-100); color:var(--slate-400); }

  /* ODG gate */
  .odg-gate { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-top:18px; padding:14px 16px; border:1px solid #d0bfff; background:#f5f0ff; border-radius: var(--radius); flex-wrap:wrap; }
  .odg-gate__label { font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#7048e8; margin-bottom:3px; }
  .odg-gate__desc { font-size:0.82rem; color:var(--slate-700); }
  .gate-badge { font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:3px; margin-left:4px; }
  .gate-badge--pending { background:var(--slate-100); color:var(--slate-500); }
  .gate-badge--submitted { background:#fff3bf; color:#e67700; }
  .gate-badge--approved { background:#d3f9d8; color:#2b8a3e; }

  /* SOP write-back */
  .sop-writeback { margin-top:20px; border:1px solid var(--slate-200); border-radius: var(--radius); padding:16px; background: var(--slate-50); }
  .sop-writeback__label { font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--slate-500); margin-bottom:4px; }

  /* Tracker */
  .kpi-table th, .kpi-table td { font-size:0.85rem; }
  .a3-tag { font-size:0.58rem; font-weight:800; letter-spacing:0.04em; color:#fff; background: var(--accent,#2f6bff); border-radius:3px; padding:1px 5px; vertical-align:middle; }
  .tr--a3 { background: #fbfcff; }
  .ps-about { margin-top:24px; padding:14px 16px; background: var(--slate-50); border:1px solid var(--slate-200); border-radius: var(--radius); }
  .ps-about__label { font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--slate-500); margin-bottom:4px; }

  /* Read-only A3 */
  .ro-a3 { }
  .ro-header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap; padding-bottom:12px; border-bottom:2px solid var(--slate-200); }
  .ro-header__title { font-size:1.25rem; font-weight:700; }
  .ro-header__meta { display:grid; grid-template-columns: 1fr 1fr; gap:2px 18px; }
  .ro-kv { display:flex; gap:8px; padding:2px 0; font-size:0.83rem; }
  .ro-kv__k { color:var(--slate-500); font-weight:600; min-width:120px; }
  .ro-kv__v { color:var(--slate-800); }
  .ro-step { border:1px solid var(--slate-200); border-radius: var(--radius); margin-bottom:12px; overflow:hidden; }
  .ro-step__head { display:flex; align-items:center; gap:10px; padding:8px 14px; background: var(--slate-50); border-bottom:1px solid var(--slate-200); }
  .ro-step__n { font-family: var(--mono, monospace); font-size:0.75rem; color:var(--slate-500); font-weight:700; }
  .ro-step__title { font-weight:600; font-size:0.92rem; }
  .ro-step__body { padding:12px 14px; }
  .ro-gap, .ro-prio { margin-top:6px; padding:6px 10px; background:#fff5f5; border-left:3px solid #ffc9c9; border-radius:0 4px 4px 0; font-size:0.85rem; }
  .ro-why { display:flex; gap:10px; align-items:baseline; padding:3px 0; font-size:0.84rem; }
  .ro-why__n { font-family: var(--mono, monospace); font-weight:700; color:var(--accent,#2f6bff); min-width:46px; }
  .ro-why__cat { font-size:0.6rem; font-weight:700; text-transform:uppercase; color:var(--slate-500); background:var(--slate-100); border-radius:3px; padding:1px 6px; min-width:70px; text-align:center; }
  .ro-rootcause { margin-top:10px; padding:8px 12px; background:#fbfcff; border-left:3px solid var(--accent,#2f6bff); border-radius:0 4px 4px 0; font-size:0.86rem; }
  .ro-altchains { margin-top:8px; }
  .ro-altchain { border:1px dashed var(--slate-300); border-radius:4px; padding:8px 10px; margin-bottom:6px; }
  .ro-alt-why { font-size:0.78rem; color:var(--slate-600); }
  .ro-alt-root { font-size:0.78rem; color:var(--slate-800); font-weight:600; margin-top:3px; }
  .ro-narr { margin-top:8px; font-size:0.83rem; line-height:1.5; color:var(--slate-700); background:var(--slate-50); border-radius:4px; padding:8px 10px; }
  .ro-gate { margin-top:10px; font-size:0.85rem; }
  .ar-status { display:inline-block; width:22px; text-align:center; font-family: var(--mono, monospace); font-weight:700; border-radius:4px; }
  .ar-status--C { background:#d3f9d8; color:#2b8a3e; } .ar-status--R { background:#ffe3e3; color:#c92a2a; }
  .ar-status--Y { background:#fff3bf; color:#e67700; } .ar-status--G { background:#e7f5ff; color:#1971c2; }

  /* Badges / buttons */
  .badge--success { background: var(--green-bg); color: var(--green); }
  .badge--info { background: var(--accent-tint); color: var(--accent); }
  .badge--accent { background: var(--accent-light); color: var(--accent); }
  .btn--success { background: var(--green) !important; border:none; color:#fff; padding:7px 14px; border-radius: var(--radius); font-size:0.875rem; cursor:pointer; }
  .btn--outline { background:transparent; border:1px solid var(--slate-300); color:var(--slate-700); padding:7px 14px; border-radius: var(--radius); font-size:0.875rem; cursor:pointer; transition:background .1s; }
  .btn--outline:hover { background: var(--slate-100); }
  .btn--primary { background: var(--accent); border:none; color:#fff; padding:7px 14px; border-radius: var(--radius); font-size:0.875rem; cursor:pointer; transition:opacity .1s; }
  .btn--primary:hover { opacity:.88; }
  .btn--primary:disabled { opacity:.5; cursor:default; }
`;

(function injectStyles() {
  if (document.getElementById('ps-styles')) return;
  const el = document.createElement('style');
  el.id = 'ps-styles';
  el.textContent = PS_STYLES;
  document.head.appendChild(el);
})();

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderProblemSolving(dept, mount)
 * @param {object} dept   — department data object (from data/<id>.json)
 * @param {Element} mount — DOM element to render into
 */
export async function renderProblemSolving(dept, mount) {
  _dept = dept;
  _mount = mount;
  _activeKZ = null;
  _readKZ = null;
  _currentStep = 1;
  _stepData = {};
  _kzRecords = [];
  _template = null;
  _sopWrittenBack = false;
  _markStepHelp = null;

  // R3 handoff: hash ?kpi=<id> pre-opens the wizard for that sub-KPI. Ask
  // Mark's escalation read-back (Fix 1) additionally carries &kz=<kzNumber>
  // so the handoff can open the REAL linked KZ record instead of always
  // minting a fresh blank one for the KPI.
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  const hashParams = new URLSearchParams(hashQuery);
  const preselectKpiId = hashParams.get('kpi') || null;
  const preselectKzNumber = hashParams.get('kz') || null;

  mount.innerHTML = `<p class="text-muted" style="padding:24px 0">Loading problem-solving data…</p>`;
  await doRender(); // populates _kzRecords, needed for the kz-param lookup below

  // Prefer a REAL linked KZ when the deep-link resolves to an actual record
  // on file (e.g. KZ-346, linked via linkedKpiId to otp_mexico). A freshly
  // minted kzNumber not yet in the data file (KZ-NEW-…), or no kz param at
  // all, falls through unchanged to the existing ?kpi= mint-a-blank-wizard
  // handoff below.
  const realKz = preselectKzNumber
    ? _kzRecords.find((k) => k.kzNumber === preselectKzNumber)
    : null;

  if (realKz) {
    if (isCompletedA3(realKz)) {
      _readKZ = realKz;
    } else {
      _activeKZ = realKz;
      _activeKZ._kpiId = realKz.linkedKpiId || preselectKpiId;
      _activeKZ._prior = priorSimilarKZ(_dept);
      _activeKZ._sop   = govSop(_dept);
      let firstOpenStep = 1;
      const steps = realKz.steps || {};
      for (let n = 1; n <= 8; n++) {
        if (!steps[String(n)]) { firstOpenStep = n; break; }
      }
      _currentStep = firstOpenStep;
      _stepData = {};
    }
    await doRender();
    return;
  }

  if (preselectKpiId && _dept && _dept.kpis) {
    const kpi = _dept.kpis.find(k => k.id === preselectKpiId);
    if (kpi) {
      const sel = document.getElementById('ps-kpi-select');
      if (sel) sel.value = preselectKpiId;
      _activeKZ = newKZ({ item: kpi.name || 'Problem', who: _dept.lead || '', deptId: _dept.id });
      _activeKZ._kpiId = preselectKpiId;
      _activeKZ._prior = priorSimilarKZ(_dept);
      _activeKZ._sop   = govSop(_dept);
      _currentStep = 1;
      _stepData = {};
      await doRender();
    }
  }
}
