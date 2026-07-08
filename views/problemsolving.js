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
import { svgFunnel, stepChart, paretoBars } from '../lib/charts.js';

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
  const label = { green: 'On Track', amber: 'At Risk', red: 'Off Track', nodata: 'No Data' }[status] || status;
  return `<span class="status-cell status-cell--${status}"><span class="dot"></span>${label}</span>`;
}

// RAG → the correctly-calibrated "-text" tier token for inline prose (never
// the base --green/--amber/--red token as a text color — see design-system
// spec §1's AA rule).
function ragTextVar(status) {
  return { green: 'var(--green-text)', amber: 'var(--amber-text)', red: 'var(--red-text)', nodata: 'var(--text-faint)' }[status] || 'var(--text)';
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

// KZs that carry full completed A3 content (rendered as read-view).
function isCompletedA3(kz) {
  return !!(kz && kz.content && kz.closed);
}

// Steps the agent pre-solves.
const AI_STEPS = [1, 2, 3, 4, 5, 6];

// ─── Step-dot progress strip ─────────────────────────────────────────────────

function stepDotStrip(kz, clickable = false, activeStep = null) {
  const steps = kz.steps || {};
  const dots = Array.from({ length: 8 }, (_, i) => {
    const n    = i + 1;
    const done = !!steps[String(n)];
    const isActive = activeStep === n;
    const cls  = ['step-track__dot', done ? 'is-done' : '', isActive ? 'is-next' : ''].filter(Boolean).join(' ');
    return clickable
      ? `<button type="button" class="${cls}" onclick="window._psGotoStep(${n})" title="Step ${n}">${n}</button>`
      : `<span class="${cls}" title="Step ${n}: ${done ? 'done' : 'not done'}">${n}</span>`;
  }).join('');
  return `<span class="step-track">${dots}</span>`;
}

// Horizontal 8-step wizard nav (artifact §3.8's .step-bar/.step-tab) — each
// tab shows its PDCA phase + name + done/active state, and is the single
// step-navigation surface for the wizard (the tracker table and read-only A3
// keep the compact stepDotStrip() above).
function renderStepBar(template, kz, activeStep) {
  const steps = (template && template.steps) || [];
  return steps.map(st => {
    const done = !!(kz && kz.steps && kz.steps[String(st.n)]);
    const active = activeStep === st.n;
    const cls = ['step-tab', active ? 'is-active' : '', done ? 'is-done' : ''].filter(Boolean).join(' ');
    return `
      <button type="button" class="${cls}" onclick="window._psGotoStep(${st.n})" aria-current="${active ? 'step' : 'false'}">
        <span class="step-tab__n">${done ? '✓' : st.n}</span>
        <span class="step-tab__name">${esc(st.name)}</span>
        <span class="step-tab__pdca">${esc(st.pdca)}</span>
      </button>`;
  }).join('');
}

// ─── Golden-thread — `.kz-meta` header row (main → sub) ───────────────────────
// Rendered once, atop the wizard, as the artifact's `.kz-meta` row — pill
// chips + divider ticks, tabular nums, nothing wraps mid-value. Replaces the
// old inline page-head__sub sentence AND the old separate AI-draft/golden-
// thread boxes: per design-system spec §5.5, this row (plus a right-aligned
// source-note inside the step body) is the ONLY place that info lives — no
// banner box restating it.

function goldenThreadChips(dept, kpi) {
  if (!kpi || !dept.kpis) return [];
  const chips = [];

  // Dept main (parent of this sub-KPI if one exists, else first main)
  const parent = kpi.parentId ? byId(dept, kpi.parentId) : null;
  const mainKpi = parent || mains(dept)[0];
  if (mainKpi) {
    const rag = ragStatus(mainKpi.actual, mainKpi.target, mainKpi.direction || 'higher_better');
    chips.push(`<span class="kz-meta__item kz-meta__chip">${esc(mainKpi.name)} <b style="color:${ragTextVar(rag)}">${formatVal(mainKpi.actual, mainKpi.unit)}</b></span>`);
  }

  // The specific (sub) KPI that triggered the 8-step
  if (kpi && kpi !== mainKpi) {
    const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
    chips.push(`<span class="kz-meta__item kz-meta__chip">${esc(kpi.name)} <b style="color:${ragTextVar(rag)}">${formatVal(kpi.actual, kpi.unit)}</b> <span class="faint">vs ${formatVal(kpi.target, kpi.unit)}</span></span>`);
  }

  return chips;
}

function renderKzMeta(dept, kz, kpi) {
  const segs = [`<span class="kz-meta__item">Owner <b>${kz.who ? esc(kz.who) : '—'}</b></span>`];

  const chips = goldenThreadChips(dept, kpi);
  if (chips.length) {
    segs.push('<span class="kz-meta__sep"></span>');
    segs.push('<span class="kz-meta__item">Golden Thread</span>');
    chips.forEach((chip) => {
      segs.push(chip);
      segs.push('<span class="kz-meta__arrow">▸</span>');
    });
    segs.push('<span class="kz-meta__item">opens this 8-step</span>');
  }

  segs.push('<span class="kz-meta__sep"></span>');
  // Only claim "steps 1-6 pre-solved" once at least one of them is actually
  // confirmed done — a freshly-opened draft (0/8, e.g. from a red-sub-KPI
  // candidate row) has AI-drafted CONTENT available (draftStep() runs live,
  // every render) but nothing pre-solved/confirmed yet, so it gets the
  // honest "not yet confirmed" copy instead of implying finished work exists.
  const aiConfirmed = AI_STEPS.filter((n) => !!(kz.steps && kz.steps[String(n)])).length;
  const aiBadgeText = aiConfirmed > 0
    ? `AI draft · steps 1–6 pre-solved · ${aiConfirmed} confirmed`
    : 'AI draft — not yet confirmed';
  segs.push(`<span class="badge badge--info"><span class="dot"></span>${aiBadgeText}</span>`);

  return `<div class="kz-meta">${segs.join('')}</div>`;
}

// Grounded, per-step provenance line (right-aligned inside the step head) —
// replaces the old per-step "AI draft — review & edit" banner box. Only
// shown on the steps the agent actually pre-solves (AI_STEPS); steps 7/8
// are captured after implementation, never drafted, so no note is fabricated
// for them.
function stepSourceNote(kpi, prior, sop, currentKzNumber) {
  const parts = [];
  if (kpi && kpi.name) parts.push(`red KPI "${esc(kpi.name)}"`);
  if (prior && prior.kzNumber && prior.kzNumber !== currentKzNumber) parts.push(`prior similar ${esc(prior.kzNumber)}`);
  if (sop && sop.title) parts.push(`SOP "${esc(sop.title)}"`);
  if (!parts.length) return '';
  return `Drafted from ${parts.join(' · ')}`;
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
    ? `<span class="status-cell status-cell--green"><span class="dot"></span>✓ Resolved</span>`
    : ragChip(rag);
  return `
    <div style="font-size:0.8rem;font-weight:500;line-height:1.3;margin-bottom:2px">${esc(kpi.name)}</div>
    ${chip}`;
}

// ─── AI-draft KZ detector (tracker banner + row) ──────────────────────────
// "AI-drafted 8-step ready for review" is real, derived state, never a
// hardcoded KZ number: a KZ qualifies when the agent has finished exactly
// the steps it's scoped to pre-solve (AI_STEPS, 1–6), the human hasn't
// closed out 7–8 yet, and it's linked (linkedKpiId) to a KPI that's
// currently red or amber. This is the same red-sub-KPI-triggered signal
// views/overview.js's findLinkedKz() / lib/agent.js's liveReply() / the
// accountability seed all key off of (see tests/agent-live.test.mjs's
// "liveReply surfaces the REAL linked open 8-step (KZ-346 → otp_mexico)"
// case) — it just happens that KZ-346/Operations is the only record on file
// that currently matches, so the banner naturally appears only there.
function resolveAiDraftKz(dept, records) {
  const candidates = records.filter((kz) => {
    if (kz.closed || !kz.linkedKpiId) return false;
    const steps = kz.steps || {};
    if (!AI_STEPS.every((n) => steps[String(n)])) return false;
    if (steps['7'] || steps['8']) return false;
    const kpi = byId(dept, kz.linkedKpiId);
    if (!kpi) return false;
    const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
    return rag === 'red' || rag === 'amber';
  });
  if (!candidates.length) return null;
  candidates.sort((a, b) => progress(b).done - progress(a).done);
  return candidates[0];
}

// Honest "not started yet" AI-draft candidates — computed LIVE from every red/
// amber sub-KPI (subKpis(), same filter renderRedKpiSelector already uses)
// that has no OPEN KZ already linked to it. Unlike resolveAiDraftKz() above
// (which only matches a PERSISTED record whose steps 1–6 are already marked
// done — real seed data like Operations' KZ-346), this never claims any step
// is pre-solved: it only surfaces the real kpiId/kpiName/rag so a dept with
// zero KZ records on file (Service) can still show clickable, honest
// "ready to draft" tracker rows and an honest count. Exported so tests can
// exercise it directly against real data/*.json fixtures (no DOM/fetch
// needed — see tests/problemsolving-view.test.mjs).
export function aiDraftCandidatesFromRedKpis(dept, records) {
  return subKpis(dept)
    .filter((kpi) => {
      const rag = ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
      if (rag !== 'red' && rag !== 'amber') return false;
      return !records.some((kz) => kz.linkedKpiId === kpi.id && !kz.closed);
    })
    .map((kpi) => ({
      kpiId: kpi.id,
      kpiName: kpi.name,
      rag: ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better'),
    }));
}

// One tracker row for a not-yet-started AI-draft candidate — styled like the
// real AI-draft row above (sage tint, "AI draft ready" chip) but HONEST about
// there being no progress yet: KZ# reads "Draft" (nothing has been minted or
// numbered), Progress shows 0/8, and Status reads "Ready to draft" rather
// than any completed-step language. The whole row is clickable (data-open-
// ai-draft carries the real kpiId) and reuses the exact same _psOpenWizard()
// path the sidebar red-KPI <select> already uses — no separate code path.
function candidateRowHTML(candidate) {
  return `
    <tr class="ps-candidate-row" data-open-ai-draft="${esc(candidate.kpiId)}" style="background:hsl(var(--action-1));cursor:pointer">
      <td>
        <div style="font-weight:500;font-size:0.875rem">${esc(candidate.kpiName)} <span class="chip" style="border-color:hsl(var(--action-4));background:var(--panel);color:var(--accent-text)">AI draft ready</span></div>
        <div class="faint" style="font-size:0.75rem">Not started — no 8-step on file yet</div>
      </td>
      <td class="text-mono muted" style="white-space:nowrap">Draft</td>
      <td class="muted" style="font-size:0.875rem">—</td>
      <td>
        <div style="font-size:0.8rem;font-weight:500;line-height:1.3;margin-bottom:2px">${esc(candidate.kpiName)}</div>
        ${ragChip(candidate.rag)}
      </td>
      <td><span class="faint">—</span></td>
      <td class="muted tnum" style="white-space:nowrap">—</td>
      <td>
        ${stepDotStrip({ steps: {} })}
        <span class="faint tnum" style="font-size:11.5px;margin-left:6px">0/8</span>
      </td>
      <td><span class="badge badge--neutral">Ready to draft</span></td>
      <td style="text-align:right"><button class="btn btn--outline btn--sm">Open 8-Step</button></td>
    </tr>`;
}

// Lightweight sage banner for a dept that has red-sub-KPI AI-draft candidates
// but no PERSISTED AI-draft-ready KZ (resolveAiDraftKz found none) — e.g.
// Service, which has 0 KZ records on file today. Deliberately worded to
// never claim pre-solved content: Mark CAN draft an 8-step from the top
// candidate, not "steps 1–6 already done".
function renderAiDraftCandidateBanner(dept, candidate) {
  return `
    <section class="card ai-draft-banner">
      <div class="ai-note__avatar" style="width:36px;height:36px;font-size:15px">M</div>
      <div style="flex:1;min-width:0">
        <b style="font-size:13.5px">Mark can draft an 8-step for ${esc(candidate.kpiName)}</b>
        <div class="muted" style="font-size:12.5px;margin-top:2px">This red sub-KPI has no 8-step on file yet — open to review the AI draft for steps 1–6 and confirm as you go.</div>
      </div>
      <button class="btn btn--primary" data-open-ai-draft="${esc(candidate.kpiId)}">Review AI Draft →</button>
    </section>`;
}

// Grounded one-liner for the banner — built only from fields the app already
// resolves elsewhere for this exact KZ (the linked KPI, the governing SOP
// step 8 would write back to, a prior completed KZ) so nothing here is
// invented; any piece that doesn't resolve is simply omitted.
function renderAiDraftBanner(dept, kz) {
  const kpi = kz.linkedKpiId ? byId(dept, kz.linkedKpiId) : null;
  const title = kz.title || kz.item || kz.kzNumber;
  const sop = govSop(dept);
  const prior = priorSimilarKZ(dept);
  const grounded = [];
  if (sop && sop.title) grounded.push(`the ${esc(sop.title)} SOP`);
  if (prior && prior.kzNumber && prior.kzNumber !== kz.kzNumber) grounded.push(`prior similar ${esc(prior.kzNumber)}`);
  let note = `Mark pre-solved planning steps 1–6 from the red ${esc(kpi ? kpi.name : 'linked')} sub-KPI`;
  note += grounded.length ? `, grounded in ${grounded.join(' and ')}.` : '.';
  note += ' You review, edit and confirm.';

  return `
    <section class="card ai-draft-banner">
      <div class="ai-note__avatar" style="width:36px;height:36px;font-size:15px">M</div>
      <div style="flex:1;min-width:0">
        <b style="font-size:13.5px">AI-drafted 8-step ready for review — ${esc(kz.kzNumber)} · ${esc(title)}</b>
        <div class="muted" style="font-size:12.5px;margin-top:2px">${note}</div>
      </div>
      <button class="btn btn--primary" data-go-kz="${esc(kz.kzNumber)}" data-go-kpi="${esc(kz.linkedKpiId || '')}">Review Draft 8-Step →</button>
    </section>`;
}

function renderTrackerTable(records, dept, aiDraftKz, candidates = []) {
  if (!records.length && !candidates.length) {
    return `<p class="muted" style="padding:16px 0">No 8-step records for ${esc(dept.name)} yet.</p>`;
  }

  const rows = records.map((kz, idx) => {
    const p = progress(kz);
    const completed = isCompletedA3(kz);
    const stall = stallInfo(kz);
    const isAiDraft = !!aiDraftKz && kz === aiDraftKz;
    const statusBadge = kz.closed
      ? `<span class="badge badge--green"><span class="dot"></span>Closed</span>`
      : kz.active
        ? `<span class="badge badge--info"><span class="dot"></span>Active</span>`
        : `<span class="badge badge--neutral">—</span>`;
    const stallFlag = stall
      ? `<div class="stall-flag" title="Open since ${esc(kz.start)} — no per-step timestamps on file, age is measured from the real start date">open ${stall.days}d · step ${stall.done}/8</div>`
      : '';
    const odgCell = kz.odgSupport
      ? `<span class="badge badge--neutral" style="font-size:10.5px">ODG</span>`
      : `<span class="faint">—</span>`;
    const actionCell = completed
      ? `<button class="btn btn--ghost btn--sm" onclick="window._psOpenRead(${idx})">View A3 →</button>`
      : isAiDraft
        ? `<button class="btn btn--outline btn--sm" data-go-kz="${esc(kz.kzNumber)}" data-go-kpi="${esc(kz.linkedKpiId || '')}">Open 8-Step</button>`
        : '';
    const aiTag = isAiDraft
      ? ` <span class="chip" style="border-color:hsl(var(--action-4));background:var(--panel);color:var(--accent-text)">AI draft ready</span>`
      : '';
    const a3Tag = completed ? ' <span class="badge badge--accent" style="font-size:9.5px">A3</span>' : '';

    // A closed-at-step-8 record minted live from newKZ() carries kzNumber:
    // null (no real sequential number has ever been allocated — see
    // lib/eightstep.js's newKZ) — show the honest "Draft" label rather than
    // an empty cell, never a fabricated number.
    const kzNumberLabel = kz.kzNumber || 'Draft';

    return `
      <tr${isAiDraft ? ' style="background:hsl(var(--action-1))"' : ''}>
        <td>
          <div style="font-weight:500;font-size:0.875rem">${esc(kz.title || kz.kzNumber || kzNumberLabel)}${a3Tag}${aiTag}</div>
          ${kz.title && kz.kzNumber && kz.title !== kz.kzNumber ? `<div class="faint" style="font-size:0.75rem">${esc(kz.kzNumber)}</div>` : ''}
        </td>
        <td class="text-mono muted" style="white-space:nowrap">${esc(kzNumberLabel)}</td>
        <td class="muted" style="font-size:0.875rem">${esc(kz.who || '—')}</td>
        <td>${linkedKpiCell(kz, dept)}</td>
        <td>${odgCell}</td>
        <td class="muted tnum" style="white-space:nowrap">${esc(kz.start || '—')}</td>
        <td>
          ${stepDotStrip(kz)}
          <span class="faint tnum" style="font-size:11.5px;margin-left:6px">${p.done}/8</span>
        </td>
        <td>${statusBadge}${stallFlag}</td>
        <td style="text-align:right">${actionCell}</td>
      </tr>`;
  }).join('');

  // candidates already excludes any KPI with an open KZ on file (see
  // aiDraftCandidatesFromRedKpis) — just append them after the real rows.
  const candidateRows = candidates.map(candidateRowHTML).join('');

  return `
    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead>
          <tr>
            <th style="min-width:260px">Item</th>
            <th>KZ #</th>
            <th>Who</th>
            <th>Linked red KPI</th>
            <th>ODG</th>
            <th>Start</th>
            <th style="min-width:220px">Progress (1–8)</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}${candidateRows}</tbody>
      </table>
    </div></div>`;
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
      <span class="running-head">Step reach — where KZs drop off</span>
      <div class="ps-funnel__svg">${svg}</div>
      <div class="ps-summary">
        <span class="ps-summary__stat"><b>${total}</b>total</span>
        <span class="ps-summary__stat"><b>${open}</b>open</span>
        <span class="ps-summary__stat"><b>${closed}</b>closed</span>
        <span class="ps-summary__stat${flagged ? ' ps-summary__stat--flag' : ''}"><b>${flagged}</b>flagged</span>
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
    return `<p class="muted" style="margin:0;font-size:0.82rem">No sub-KPIs defined for ${esc(dept.name)} — drill from the KPI board to open an 8-step.</p>`;
  }

  const ragLabel = { green: '● Green', amber: '▲ Amber', red: '● Red', nodata: '— No data' };
  // Prefer red/amber subs; fall back to all subs so the demo always has options.
  const list = redSubs.length ? redSubs : subs;
  const options = list.map(k => {
    const rag = ragStatus(k.actual, k.target, k.direction || 'higher_better');
    return `<option value="${esc(k.id)}">${ragLabel[rag] || rag} — ${esc(k.name)} (${formatVal(k.actual, k.unit)} vs ${formatVal(k.target, k.unit)})</option>`;
  }).join('');

  return `
    <label class="muted" style="font-size:13px" for="ps-kpi-select">Trigger a new 8-step from a red sub-KPI</label>
    <select id="ps-kpi-select" class="input" style="width:auto;min-width:250px">
      <option value="">— Select a red sub-KPI —</option>
      ${options}
    </select>
    <button id="ps-open-btn" class="btn btn--primary" onclick="window._psOpenWizard()">Open 8-Step (AI-Drafted)</button>`;
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

// ─── Chart helpers (Steps 1, 2, 3, 7) ─────────────────────────────────────────
// Real actual-vs-target / breakdown charts drawn from the active KPI's own
// `series` (data/*.json) via lib/charts.js's stepChart/paretoBars (the A3
// gap/recovery + largest-first breakdown spec helpers — §4 of the guide).
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
// this is always rendered badged illustrative at the call site. Direction-
// aware: for a lower_better KPI (e.g. DART incidents) the projected path
// must land BELOW target to read green (ragStatus's target/actual ratio),
// not above it — mirroring the higher_better climb-through-amber-into-green
// shape on the other side of the target line.
function synthRecoveryTail(lastVal, target, direction = 'higher_better') {
  if (typeof target !== 'number' || typeof lastVal !== 'number') return [];
  if (target === 0) return [lastVal * 0.5, lastVal * 0.15, 0].map(v => +v.toFixed(4));
  // Climbing/falling toward target, then deliberately through the amber band
  // (ragStatus green needs ratio>=1.0, amber needs ratio>=0.95) before
  // landing solidly in-target — so the projection visibly crosses
  // red→amber→green rather than skipping straight from red to green.
  const step1 = lastVal + (target - lastVal) * 0.5;
  const overshoot = direction === 'lower_better'
    ? [target * 1.035, target * 0.97]   // just above target (amber) → below target (green)
    : [target * 0.965, target * 1.02];  // just below target (amber) → above target (green)
  return [step1, ...overshoot].map(v => +v.toFixed(4));
}

function hasRealSeries(kpi) {
  return !!(kpi && Array.isArray(kpi.series)
    && kpi.series.filter(v => typeof v === 'number' && !Number.isNaN(v)).length >= 2);
}

// ─── A3 chart figures (Steps 1, 2, 3, 7) — lib/charts.js's spec helpers ───────
// `stepChart` (gap + recovery, solid actual vs dashed target, optional
// dashed hollow-dot projected tail + countermeasure-in marker) and
// `paretoBars` (largest-first breakdown) draw the SVG; `chartFig` wraps it in
// the ported `.chart-fig`/`.chart-fig__cap` figure + an `illustrative` badge
// exactly per reference view-solve.js's `chartFig`/`kzGapChart`/
// `kzParetoChart`/`kzRecoveryChart` — grounded here in OUR kpi.series/target/
// direction instead of the reference's hardcoded DATA.kpis.otp.

function chartFig(svg, opts = {}) {
  return `<figure class="chart-fig">
    ${svg}
    <figcaption class="chart-fig__cap">
      ${opts.illustrative ? '<span class="badge badge--outline" style="font-size:10px">illustrative</span>' : ''}
      ${opts.caption ? `<span>${esc(opts.caption)}</span>` : ''}
    </figcaption>
  </figure>`;
}

function noKpiChartFig() {
  return chartFig('<div class="muted" style="font-size:12.5px;padding:12px 0">No KPI selected yet — pick a red sub-KPI to see its trend.</div>', {});
}

// y-axis label formatter honoring the KPI's own unit — stepChart's default
// (`Math.round(v*100)+'%'`) only suits ratio/percent KPIs.
function stepChartFmtY(kpi) {
  const u = kpi && kpi.unit;
  if (u === 'ratio' || u === 'percent' || u === '%' || u === 'pct') return (v) => (v * 100).toFixed(1) + '%';
  return (v) => formatVal(v, u);
}

function chartXLabels(n, extra) {
  const base = Array.from({ length: n }, (_, i) => `P${i + 1}`);
  for (let i = 0; i < (extra || 0); i++) base.push(`P${n + i + 1}*`);
  return base;
}

// Steps 1 & 3 — gap / objective trend: actual vs target from the KPI's own series.
function gapChartFig(kpi) {
  if (!kpi) return noKpiChartFig();
  const real = hasRealSeries(kpi);
  const series = real ? kpi.series.slice() : synthIllustrativeSeries(kpi.target, kpi.actual);
  if (!series.length) return noKpiChartFig();
  const target = typeof kpi.target === 'number' ? kpi.target : undefined;
  const illustrative = !real || !!kpi.illustrative;
  const svg = stepChart(series, {
    target, xLabels: chartXLabels(series.length),
    label: `${kpi.name} actual vs target`, fmtY: stepChartFmtY(kpi),
  });
  const caption = illustrative
    ? `${kpi.name} — no weekly series on file; gap trend shown is illustrative`
    : `${kpi.name} — actual vs target, ${series.length} periods on file`;
  return chartFig(svg, { illustrative, caption });
}

// Step 7 — recovery trend: real baseline + countermeasure-in marker + an
// illustrative projected recovery tail (an open KZ has no real "back to
// green" measurement yet — confirming that is what Step 7 asks the human to
// go do). Direction-correct via synthRecoveryTail(..., kpi.direction).
function recoveryChartFig(kpi) {
  if (!kpi) return noKpiChartFig();
  const real = hasRealSeries(kpi);
  const baseline = real ? kpi.series.slice() : synthIllustrativeSeries(kpi.target, kpi.actual);
  if (!baseline.length) return noKpiChartFig();
  const target = typeof kpi.target === 'number' ? kpi.target : null;
  const direction = kpi.direction || 'higher_better';
  const tail = target != null ? synthRecoveryTail(baseline[baseline.length - 1], target, direction) : [];
  const hasTail = tail.length > 0;
  const svg = stepChart(baseline, {
    target: target != null ? target : undefined,
    projected: hasTail ? tail : undefined,
    xLabels: chartXLabels(baseline.length, tail.length),
    label: `${kpi.name} recovery trend`, fmtY: stepChartFmtY(kpi),
  });
  // Badge illustrative only when the chart actually contains synthesized data:
  // a projected recovery tail, or a fully synthesized baseline (no real series).
  const illustrative = !real || hasTail || !!kpi.illustrative;
  let caption;
  if (!real) {
    caption = `${kpi.name} — no weekly series on file; recovery trend shown is illustrative`;
  } else if (hasTail) {
    caption = `${kpi.name} — periods 1–${baseline.length} actual · marker = countermeasure-in · periods ${baseline.length + 1}–${baseline.length + tail.length} projected recovery (not yet measured)`;
  } else {
    caption = `${kpi.name} — actual vs target, ${baseline.length} periods on file`;
  }
  return chartFig(svg, { illustrative, caption });
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

// Sort largest-first + drop rows with no computable gap — `paretoBars`
// expects the caller to pre-sort (see lib/charts.js doc comment) and can't
// plot a null value.
function paretoChartFig(dept, kpi) {
  if (!kpi) return '';
  const { rows, illustrative } = paretoRowsFor(dept, kpi);
  const clean = rows.filter((r) => typeof r.value === 'number').sort((a, b) => b.value - a.value);
  if (!clean.length) return '';
  const ratioLike = kpi.unit === 'ratio' || kpi.unit === 'percent' || kpi.unit === '%' || kpi.unit === 'pct';
  const svg = paretoBars(clean, {
    label: `${kpi.name} gap by location, largest contributor first`,
    ...(ratioLike ? {} : { fmt: (v) => formatVal(v, kpi.unit) }),
  });
  const caption = illustrative
    ? `Illustrative breakdown — no location/rep-level sub-KPI family on file for ${kpi.name}.`
    : `Where the gap is coming from — ${kpi.name}'s family, largest contributor first.`;
  return chartFig(svg, { illustrative, caption });
}

// ─── Shared field helpers (steps 1–3, 7, 8 — plain A3 grid fields) ────────────

// A field wrapped in a tinted callout (Step 1's red Gap, Step 2's sage
// Prioritized Problem, Step 4's sage Root Cause) — the callout chrome lives
// on the wrapping div; the textarea itself renders borderless/transparent so
// it reads as "editable text inside the callout" rather than a nested input
// box inside a box.
function calloutTextarea(key, hint, value, rows) {
  return `<textarea class="input" data-field="${key}" rows="${rows || 2}" placeholder="${esc(hint)}"
    style="background:transparent;border:none;padding:0;box-shadow:none;font-weight:500;resize:vertical">${esc(value)}</textarea>`;
}

function attachSlot(label) {
  return `<div class="drop-zone">
    <span>${esc(label || 'Attach an image or chart — floor photos, before/after, source screenshots')}</span>
    <button class="btn btn--ghost btn--sm" type="button">Add Image</button>
  </div>`;
}

function fieldDefsOf(stepDef) {
  return Object.fromEntries((stepDef.fields || []).map((f) => [f.key, f]));
}

// ─── Step 1 — Clarify the Problem ──────────────────────────────────────────────

function renderStep1(stepDef, draft, kpi) {
  const saved = _stepData[1] || {};
  const draftFields = (draft && draft.fields) || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => (saved[k] != null ? saved[k] : (draftFields[k] || ''));
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <textarea class="input" data-field="${key}" rows="2" placeholder="${esc(F[key].hint)}">${esc(val(key))}</textarea>
    </div>`;

  return `
    <div class="a3-grid a3-grid--2">
      ${plainField('ultimateGoal')}
      ${plainField('standard')}
      ${plainField('current')}
      <div class="field">
        <span class="field__label">${esc(F.gap.label)}</span>
        <div class="a3-callout a3-callout--red">${calloutTextarea('gap', F.gap.hint, val('gap'), 2)}</div>
      </div>
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">Chart — the gap over time</span>${gapChartFig(kpi)}</div>
    ${attachSlot()}`;
}

// ─── Step 2 — Break Down the Problem (stratification + Pareto) ────────────────

function renderStep2(stepDef, draft, dept, kpi) {
  const saved = _stepData[2] || {};
  const draftFields = (draft && draft.fields) || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => (saved[k] != null ? saved[k] : (draftFields[k] || ''));
  const pareto = paretoChartFig(dept, kpi);

  return `
    <span class="running-head">Stratification — what · where · when · who (not why) · Genchi Genbutsu to the point of occurrence</span>
    <div class="field" style="margin-top:12px">
      <textarea class="input" data-field="stratification" rows="3" placeholder="${esc(F.stratification.hint)}">${esc(val('stratification'))}</textarea>
    </div>
    <div class="field" style="margin-top:20px">
      <span class="field__label">${esc(F.prioritizedProblem.label)}</span>
      <div class="a3-callout a3-callout--accent">${calloutTextarea('prioritizedProblem', F.prioritizedProblem.hint, val('prioritizedProblem'), 2)}</div>
    </div>
    ${pareto ? `<div class="field" style="margin-top:24px"><span class="field__label">Breakdown — Where Is It Coming From?</span>${pareto}</div>` : ''}`;
}

// ─── Step 3 — Target Setting (Objective) ───────────────────────────────────────

function renderStep3(stepDef, draft, kpi) {
  const saved = _stepData[3] || {};
  const draftFields = (draft && draft.fields) || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => (saved[k] != null ? saved[k] : (draftFields[k] || ''));
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <textarea class="input" data-field="${key}" rows="2" placeholder="${esc(F[key].hint)}">${esc(val(key))}</textarea>
    </div>`;

  return `
    <div class="a3-grid a3-grid--3">
      ${plainField('doWhat')}
      ${plainField('toWhat')}
      ${plainField('byWhen')}
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">Chart — eliminating the prioritized problem inside the big-problem gap</span>${gapChartFig(kpi)}</div>`;
}

// ─── 5-Whys ladder + 6M fishbone (Step 4) ─────────────────────────────────────

function render5Whys6M(stepDef, draft) {
  const saved = _stepData[4] || {};
  const draftWhys = (draft && draft.whys) || [];
  const cats = (_template && _template.fishboneCategories) || ['Man', 'Method', 'Machine', 'Material', 'Environment', 'Measurement'];
  const F = fieldDefsOf(stepDef);

  // 5-Whys ladder — one `.a3-why` row per rung: Why-N label · 6M category chip
  // · editable text on a subtle bg (design-system spec §5.5 step 4), replacing
  // the old two-column ladder+fishbone-table layout.
  const ladder = [1, 2, 3, 4, 5].map((n, i) => {
    const key = `why${n}`;
    const dw = draftWhys.find(w => w.n === n);
    const val = saved[key] != null ? saved[key] : (dw ? dw.text : '');
    const cat = dw ? dw.category : ((F[key] && F[key].fishbone) || cats[i]);
    const hint = (F[key] && F[key].hint) || 'Why did the level above occur? (fact-based, no blame)';
    return `
      <div class="a3-why">
        <span class="field__label" style="white-space:nowrap">Why ${n}</span>
        <span class="chip">${esc(cat)}</span>
        <textarea class="input" data-field="${key}" rows="1" placeholder="${esc(hint)}"
          style="background:transparent;border:none;padding:0;box-shadow:none;resize:vertical">${esc(val)}</textarea>
      </div>`;
  }).join('');

  const rootVal = saved.rootCause != null ? saved.rootCause : (draft ? draft.rootCause : '');

  // Secondary 6M contributing-factor notes — independent of a specific why
  // rung; also the target Mark's per-category "altbranch" step-help
  // suggestions write into (see window._psMarkAdd's 'altbranch' handler).
  const fishboneRows = cats.map(cat => {
    const fk = `fishbone_${cat.toLowerCase()}`;
    const dw = draftWhys.find(w => w.category === cat);
    const val = saved[fk] != null ? saved[fk] : (dw ? dw.text.replace(/\s+←.*$/, '') : '');
    return `
      <tr>
        <td style="font-weight:600;width:110px;color:var(--text-dim)">${esc(cat)}</td>
        <td><input type="text" class="input" data-field="${fk}" placeholder="How does ${esc(cat)} contribute?" value="${esc(val)}"></td>
      </tr>`;
  }).join('');

  return `
    <span class="running-head">5-Whys ladder — Genchi Genbutsu: confirm each at the point of occurrence</span>
    <div class="a3-whys" style="margin-top:12px">${ladder}</div>
    <div class="field" style="margin-top:20px">
      <span class="field__label">Root Cause (confirmed) <span class="chip" style="margin-left:6px">high-leverage</span></span>
      <div class="a3-callout a3-callout--accent">${calloutTextarea('rootCause', F.rootCause.hint, rootVal, 2)}</div>
    </div>
    <div style="margin-top:20px">
      <span class="running-head">Additional 6M factors (optional — not on the 5-Whys ladder)</span>
      <table class="fishbone-tbl" style="margin-top:8px">${fishboneRows}</table>
    </div>`;
}

// ─── Countermeasure scoring matrix (Step 5) ───────────────────────────────────

function renderScoringMatrix(draft) {
  const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [
    { key: 'S', label: 'Safety' }, { key: 'Q', label: 'Quality' }, { key: 'C', label: 'Cost' },
    { key: 'T', label: 'Time' }, { key: 'Cu', label: 'Customer' }, { key: 'Ef', label: 'Effective' }, { key: 'OA', label: 'Overall' }
  ];
  const dims = cols.filter((c) => c.key !== 'OA');
  const oaCol = cols.find((c) => c.key === 'OA') || { key: 'OA', label: 'Overall' };
  const saved = (_stepData[5] && _stepData[5].countermeasures) || null;
  const rows = saved || (draft && draft.countermeasures) || [];

  // Dimension columns score 0 (worst) · 1 · 2 (best); Overall (OA) is a bold
  // 1–5 ranked-priority select — not a sum of the dimension scores.
  const scoreCell = (row, ck, i, isOA) => {
    const v = row[ck];
    const options = isOA ? ['', 1, 2, 3, 4, 5] : ['', 0, 1, 2];
    const opts = options.map((o) =>
      `<option value="${o}" ${String(v) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('');
    return `<td class="num score-cell"><select class="score-sel ${isOA ? 'score-sel--oa' : ''}" data-cm-field="${ck}" data-cm-row="${i}" aria-label="${esc(ck)} score, row ${i + 1}">${opts}</select></td>`;
  };

  const body = rows.map((row, i) => `
    <tr>
      <td><input type="text" class="input cm-text" data-cm-field="text" data-cm-row="${i}" value="${esc(row.text)}" placeholder="Countermeasure candidate" aria-label="Countermeasure ${i + 1}"></td>
      ${dims.map((c) => scoreCell(row, c.key, i, false)).join('')}
      ${scoreCell(row, oaCol.key, i, true)}
    </tr>`).join('');

  return `
    <span class="running-head">Countermeasure scoring matrix — score each 0 (worst) · 1 · 2 (best) per dimension</span>
    <div class="table-wrap" style="margin-top:12px;box-shadow:none">
      <table class="dt">
        <thead>
          <tr>
            <th style="min-width:260px">Countermeasure</th>
            ${dims.map((c) => `<th class="num" title="${esc(c.label)}">${esc(c.key)}</th>`).join('')}
            <th class="num" title="Overall — ranked priority">${esc(oaCol.key)}</th>
          </tr>
        </thead>
        <tbody id="cm-matrix-body">${body}</tbody>
      </table>
    </div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-top:12px;flex-wrap:wrap">
      <p style="margin:0;font-size:12.5px;color:var(--text-dim);max-width:80ch"><b>Overall</b> is the ranked priority, not a sum. Build consensus first (Nemawashi) — reviewed with cross-functional leads.</p>
      <button class="btn btn--outline btn--sm" onclick="window._psAddCmRow()">Add Countermeasure</button>
    </div>`;
}

// ─── Action register + ODG gate (Step 6) ──────────────────────────────────────

function renderActionRegister(draft) {
  const statusTone = { R: 'red', Y: 'amber', G: 'green', C: 'accent' };
  const statusLabels = { R: 'Behind', Y: 'At Risk', G: 'On Track', C: 'Completed' };

  const savedRows = (_stepData[6] && _stepData[6].actionRows)
    || (draft && draft.actionRows)
    || Array.from({ length: 3 }, (_, i) => ({ no: i + 1, plan: '', startDate: '', dueDate: '', responsible: '', status: 'R' }));

  // Status select is styled with the same tone tokens as `.badge--{tone}` —
  // an at-a-glance R/Y/G/C color signal that stays a live, editable control
  // (the reference's own action register is a static read-only demo; ours is
  // the live wizard, so it can't be a plain badge).
  const statusStyle = (status) => {
    if (status === 'C') return 'color:var(--accent-text);background:hsl(var(--action-1));border-color:hsl(var(--action-3))';
    const tone = statusTone[status];
    return tone ? `color:var(--${tone}-text);background:var(--${tone}-bg);border-color:var(--${tone}-border)` : '';
  };

  const rows = savedRows.map((row, i) => `
    <tr>
      <td class="tnum" style="width:40px">${row.no || i + 1}</td>
      <td><input type="text" class="input" data-ar-field="plan" data-ar-row="${i}" value="${esc(row.plan)}" placeholder="What needs to be done" aria-label="Plan, row ${i + 1}"></td>
      <td><input type="date" class="input" data-ar-field="startDate" data-ar-row="${i}" value="${esc(row.startDate)}" style="min-width:130px" aria-label="Start date, row ${i + 1}"></td>
      <td><input type="date" class="input" data-ar-field="dueDate" data-ar-row="${i}" value="${esc(row.dueDate)}" style="min-width:130px" aria-label="Due date, row ${i + 1}"></td>
      <td><input type="text" class="input" data-ar-field="responsible" data-ar-row="${i}" value="${esc(row.responsible)}" placeholder="Name" style="min-width:110px" aria-label="Responsible, row ${i + 1}"></td>
      <td>
        <select class="input" data-ar-field="status" data-ar-row="${i}" style="min-width:120px;font-weight:600;${statusStyle(row.status)}" aria-label="Status, row ${i + 1}">
          ${Object.keys(statusLabels).map((s) =>
            `<option value="${s}" ${row.status === s ? 'selected' : ''}>${s} — ${statusLabels[s]}</option>`).join('')}
        </select>
      </td>
    </tr>`).join('');

  const gate = (_stepData[6] && _stepData[6].odgGate) || (draft && draft.odgGate) || { status: 'pending', reviewer: 'Eric / Allison (ODG)' };
  const gateStatusBadge = {
    pending:   '<span class="badge badge--neutral">Not yet submitted</span>',
    submitted: '<span class="badge badge--amber"><span class="dot"></span>Submitted — awaiting ODG</span>',
    approved:  '<span class="badge badge--green"><span class="dot"></span>✓ ODG approved</span>',
  }[gate.status] || '';
  const gateBtn = gate.status === 'approved'
    ? ''
    : `<button class="btn btn--secondary btn--sm" onclick="window._psSubmitOdg()">${gate.status === 'submitted' ? 'Mark ODG-Approved' : 'Submit to ODG for gate review'}</button>`;

  return `
    <span class="running-head">Action register — R Behind · Y At Risk · G On Track · C Completed</span>
    <div class="table-wrap" style="margin-top:12px;box-shadow:none">
      <table class="dt">
        <thead>
          <tr><th style="width:40px">No.</th><th style="min-width:220px">Implementation Plan</th><th>Start</th><th>Due</th><th>Responsible</th><th>Status</th></tr>
        </thead>
        <tbody id="action-register-body">${rows}</tbody>
      </table>
    </div>
    <button class="btn btn--ghost btn--sm" style="margin-top:8px" onclick="window._psAddActionRow()">Add Row</button>

    <div class="card card--pad" style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;box-shadow:none;background:var(--bg-subtle)">
      <div>
        <h4>ODG Gate — Step 6</h4>
        <p style="margin:4px 0 0;font-size:12.5px;color:var(--text-dim)">Reviewer: ${esc(gate.reviewer)}. The countermeasure plan is reviewed before implementation proceeds.</p>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        ${gateStatusBadge}
        ${gateBtn}
      </div>
    </div>`;
}

// ─── Results (Step 7) ─────────────────────────────────────────────────────────

function renderResults(stepDef, kpi) {
  const saved = _stepData[7] || {};
  const F = fieldDefsOf(stepDef);
  const seed = {
    kpi: kpi ? kpi.name : '',
    measurementStart: kpi ? `${formatVal(kpi.actual, kpi.unit)} (baseline)` : '',
    newTarget: kpi ? `${formatVal(kpi.target, kpi.unit)}` : ''
  };
  const val = (k) => (saved[k] != null ? saved[k] : (seed[k] || ''));
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <input type="text" class="input" data-field="${key}" placeholder="${esc(F[key].hint)}" value="${esc(val(key))}">
    </div>`;

  return `
    <div class="a3-grid a3-grid--2">
      ${plainField('kpi')}
      ${plainField('measurementStart')}
      ${plainField('measurementEnd')}
      ${plainField('newTarget')}
    </div>
    <div class="field" style="margin-top:20px">
      <span class="field__label">${esc(F.narrative.label)}</span>
      <textarea class="input" data-field="narrative" rows="4" placeholder="${esc(F.narrative.hint)}">${esc(val('narrative'))}</textarea>
    </div>
    <div class="field" style="margin-top:24px"><span class="field__label">${esc(F.chart.label)}</span>${recoveryChartFig(kpi)}</div>
    ${attachSlot('Attach the confirmed measurement chart on close — the weekly series is pulled automatically when you confirm')}`;
}

// ─── Standardize + SOP write-back (Step 8) ─────────────────────────────────────

function renderStandardize(stepDef, dept) {
  const saved = _stepData[8] || {};
  const F = fieldDefsOf(stepDef);
  const val = (k) => saved[k] || '';
  const plainField = (key) => `
    <div class="field">
      <span class="field__label">${esc(F[key].label)}</span>
      <textarea class="input" data-field="${key}" rows="2" placeholder="${esc(F[key].hint)}">${esc(val(key))}</textarea>
    </div>`;

  const sop = govSop(dept);
  const sopTitle = sop.title || 'the governing Standard Work';
  const writeBackAction = _sopWrittenBack
    ? `<span class="badge badge--green"><span class="dot"></span>Standard Work updated</span>`
    : `<button class="btn btn--primary btn--sm" onclick="window._psWriteBackSop()">Update Standard Work</button>`;

  return `
    <div class="a3-grid a3-grid--2">
      ${plainField('processDocuments')}
      ${plainField('training')}
      ${plainField('yokoten')}
      ${plainField('improvementImage')}
    </div>
    ${attachSlot('Attach the before/after improvement image — the metric before and after the countermeasure')}
    <div class="card card--pad" style="margin-top:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;box-shadow:none;background:hsl(var(--action-1));border-color:hsl(var(--action-3))">
      <div>
        <h4>SOP Write-Back (Yokoten)</h4>
        <p style="margin:4px 0 0;font-size:12.5px;color:var(--text-dim)">${esc(sopTitle)} — SOPs are the input to Steps 1–5 and the output of Step 8. <a href="#/dept/${esc(dept.id)}/sop" style="color:var(--accent-text)">Open Standard Work →</a></p>
      </div>
      ${writeBackAction}
    </div>`;
}

// ─── Wizard step page ─────────────────────────────────────────────────────────

function renderWizardStep(dept, kpi, stepN, template, kz) {
  const stepDef = template.steps[stepN - 1];
  if (!stepDef) return `<div class="eightstep__body" data-step="${stepN}"><p class="muted">Step ${stepN} not found in template.</p></div>`;

  // Build the structured draft for this step (steps 1–6 only).
  const prior = kz._prior || null;
  const sop   = kz._sop || null;
  const draft = AI_STEPS.includes(stepN)
    ? draftStep(dept.id, stepN, {
        kpi: kpi?.name, kpiActual: kpi?.actual ?? null, kpiTarget: kpi?.target ?? null,
        kpiUnit: kpi?.unit, priorKZ: prior, sop
      })
    : null;

  // Step-specific body — real, editable A3 fields per stepBody (design-
  // system spec §5.5), not a generic stand-in card.
  let bodyContent = '';
  if (stepN === 1)      bodyContent = renderStep1(stepDef, draft, kpi);
  else if (stepN === 2) bodyContent = renderStep2(stepDef, draft, dept, kpi);
  else if (stepN === 3) bodyContent = renderStep3(stepDef, draft, kpi);
  else if (stepN === 4) bodyContent = render5Whys6M(stepDef, draft);
  else if (stepN === 5) bodyContent = renderScoringMatrix(draft);
  else if (stepN === 6) bodyContent = renderActionRegister(draft);
  else if (stepN === 7) bodyContent = renderResults(stepDef, kpi);
  else                  bodyContent = renderStandardize(stepDef, dept);

  // Grounded provenance — right-aligned inside the step head, only on the
  // steps the agent actually pre-solves. Replaces the old per-step
  // "AI draft — review & edit" banner box (that info now lives in the
  // `.kz-meta` row once, plus this one-line citation per step).
  const sourceNote = AI_STEPS.includes(stepN) ? stepSourceNote(kpi, prior, sop, kz.kzNumber) : '';

  const prevBtn = `<button class="btn btn--ghost" onclick="window._psGotoStep(${stepN - 1})" ${stepN === 1 ? 'disabled' : ''}>Previous</button>`;
  const nextBtn = stepN < 8
    ? `<button class="btn btn--primary" onclick="window._psConfirmStep(${stepN})">Confirm &amp; Next</button>`
    : `<button class="btn btn--primary" onclick="window._psConfirmStep(${stepN})">Confirm Step 8 — Close KZ</button>`;

  return `
    <div class="eightstep__body" data-step="${stepN}" style="padding:32px 40px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <span class="running-head">${esc(stepDef.pdca)} · Step ${stepN} of 8${stepDef.highLeverage ? ' · highest-leverage' : ''}</span>
          <h2 style="margin-top:6px;font-size:20px">Step ${stepN}: ${esc(stepDef.name)}</h2>
        </div>
        ${sourceNote ? `<span class="source-note" style="max-width:44ch;text-align:right">${sourceNote}</span>` : ''}
      </div>
      <p style="margin:8px 0 24px;font-size:13px;color:var(--text-dim);max-width:90ch">${esc(stepDef.description)}</p>

      ${bodyContent}

      <div style="display:flex;justify-content:space-between;margin-top:40px">
        ${prevBtn}
        ${nextBtn}
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

// Docked in the wizard canvas's right column (`.eightstep__assist`, ported
// from reference/view-solve.js's `assistPanel()`): header, per-step note
// card, our own proactive suggestion items (Add/Dismiss — a real feature the
// static reference doesn't have), a running Q&A thread, and the "Ask Mark
// about this step" composer. Always visible (no collapse pill) — the grid
// itself hides the column under 1100px (`.eightstep-wide` media query).
function renderAssistPanel(stepN, stepHelp) {
  const items = (stepHelp && stepHelp.items) || [];
  const itemsHtml = items.length ? items.map((it, i) => renderMarkItem(it, i)).join('') : '';
  const headline = stepHelp && stepHelp.headline;
  const note = stepHelp && stepHelp.note;

  return `
    <aside class="eightstep__assist">
      <div class="assist-head">
        <span class="ai-note__avatar" style="width:28px;height:28px;font-size:12px">M</span>
        <div>
          <b style="font-size:13px">Mark · AI assist</b>
          <div class="faint" style="font-size:11px">Grounded in the red KPI, the SOP, and prior KZs</div>
        </div>
      </div>
      <div class="assist-note">
        <span class="running-head" style="font-size:10px">Step ${stepN}</span>
        ${headline ? `<p style="margin:6px 0 0;font-size:12.5px;font-weight:600;color:var(--text)">${esc(headline)}</p>` : ''}
        ${note ? `<p style="margin:${headline ? '4px' : '6px'} 0 0;font-size:12.5px;line-height:1.55;color:var(--text-secondary)">${esc(note)}</p>` : ''}
        ${!headline && !note ? `<p style="margin:6px 0 0;font-size:12.5px;color:var(--text-faint)">Nothing scripted for this step yet — ask below.</p>` : ''}
      </div>
      ${itemsHtml ? `<div class="assist-items">${itemsHtml}</div>` : ''}
      <div class="assist-thread" id="mark-dock-answers"></div>
      <div class="chat__composer" style="margin-top:auto">
        <textarea class="input" rows="2" id="mark-dock-input" placeholder="Ask Mark about this step"
          aria-label="Ask Mark about this step"
          onkeydown="if(event.key==='Enter'&amp;&amp;!event.shiftKey){event.preventDefault();window._psMarkAsk();}"></textarea>
        <button class="btn btn--primary btn--sm" style="align-self:flex-end" onclick="window._psMarkAsk()">Send</button>
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
        <span class="pdca-badge">${pdca}</span>
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
      <div style="margin:12px 0 18px">${stepDotStrip(kz)}</div>

      ${stepCard(1, 'PLAN', 'Clarify the Problem', `
        ${kv('Ultimate Goal', c.step1?.ultimateGoal)}
        ${kv('Standard', c.step1?.standard)}
        ${kv('Current Situation', c.step1?.current)}
        <div class="a3-callout a3-callout--red ro-gap">Gap = Problem: <b>${esc(c.step1?.gap)}</b></div>`)}

      ${stepCard(2, 'PLAN', 'Break Down the Problem', `
        ${c.step2?.note ? `<p class="text-muted" style="font-size:0.8rem;margin:0 0 6px">${esc(c.step2.note)}</p>` : ''}
        <div class="a3-callout a3-callout--red ro-prio">Prioritized problem: <b>${esc(c.step2?.prioritizedProblem)}</b></div>`)}

      ${stepCard(3, 'PLAN', 'Objective', `
        ${kv('Do What', c.step3?.doWhat)}
        ${kv('To What', c.step3?.toWhat)}
        ${kv('By When', c.step3?.byWhen)}`)}

      ${stepCard(4, 'PLAN', 'Root Cause (5-Whys + 6M)', `
        <div class="ro-whys">${whysHtml}</div>
        <div class="a3-callout a3-callout--accent ro-rootcause">Root Cause: <b>${esc(c.step4?.rootCause)}</b></div>
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
    const aiDraftKz   = resolveAiDraftKz(_dept, _kzRecords);
    // Honest red-sub-KPI gap count — separate from the _kzRecords-only totals
    // above (owner ask: reflect the red sub-KPIs that have no 8-step yet,
    // even for a dept like Service with zero persisted KZ records on file).
    const aiDraftCandidates = aiDraftCandidatesFromRedKpis(_dept, _kzRecords);
    const redGaps = aiDraftCandidates.length;
    const redGapsNote = redGaps
      ? ` · ${redGaps} red sub-KPI${redGaps === 1 ? '' : 's'} ready for an 8-step`
      : '';

    content = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(_dept.name)} · 8-Step</span>
          <h1>Problem-Solving Tracker</h1>
          <p class="page-head__sub">${_kzRecords.length} total · ${openItems} open · ${closedItems} closed · ${a3Count} full A3${a3Count === 1 ? '' : 's'}${redGapsNote} — ${esc(_dept.name)}</p>
        </div>
        <div class="page-head__side">
          ${renderRedKpiSelector(_dept)}
        </div>
      </div>

      ${_kzRecords.length ? `<section class="card card--pad">${renderTrackerHeaderMeta(_kzRecords)}</section>` : ''}

      ${aiDraftKz
        ? renderAiDraftBanner(_dept, aiDraftKz)
        : (aiDraftCandidates.length ? renderAiDraftCandidateBanner(_dept, aiDraftCandidates[0]) : '')}

      ${renderTrackerTable(_kzRecords, _dept, aiDraftKz, aiDraftCandidates)}

      <section class="card card--pad" style="margin-top:24px">
        <span class="running-head">How the 8-step is triggered</span>
        <p style="margin:12px 0 0;font-size:13.5px;line-height:1.6;color:var(--text-secondary);max-width:90ch">
          A main KPI turning red is drilled to its contributing sub-KPIs; a red <b>sub-KPI</b> opens an 8-step owned by the
          manager at that level. The agent pre-solves the planning steps (1–6) into a reviewable draft — grounded in the red
          KPI, the governing SOP, and a prior similar KZ — and the human reviews &amp; finishes. Rows tagged
          <span class="badge badge--accent" style="font-size:9.5px">A3</span> carry full completed content from the FMDS-New
          discovery.
        </p>
      </section>

      <p class="board-hint">Extracted from the 8-Step Problem Solving Tracker workbook (Jul 2026). ${esc(_dept.name)} has ${_kzRecords.length} row${_kzRecords.length === 1 ? '' : 's'} on file — ${openItems} open, ${closedItems} closed.</p>`;
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

    // Wizard header — eyebrow + h1 + the `.kz-meta` row (owner · golden
    // thread · AI-draft badge). No banner box: that info lives only in this
    // row plus the right-aligned source-note inside the step (design-system
    // spec §5.5).
    const kzTitle = esc(_activeKZ.title || _activeKZ.item || _activeKZ.kzNumber);
    const eyebrow = (_template && _template.source) ? _template.source : _dept.name;

    content = `
      <div class="page-head" style="margin-bottom:16px">
        <div>
          <span class="running-head page-head__eyebrow">8-Step Problem Solving A3 · ${esc(eyebrow)}</span>
          <h1>${_activeKZ.kzNumber ? esc(_activeKZ.kzNumber) + ' · ' : ''}${kzTitle}</h1>
          ${renderKzMeta(_dept, _activeKZ, kpi)}
        </div>
        <div class="page-head__side">
          <button class="btn btn--secondary" onclick="window._psCloseWizard()">Back to Tracker</button>
        </div>
      </div>

      <nav class="step-bar" aria-label="8-step progress">${renderStepBar(tmpl, _activeKZ, _currentStep)}</nav>

      <section class="card eightstep-wide">
        ${renderWizardStep(_dept, kpi, _currentStep, tmpl, _activeKZ)}
        ${renderAssistPanel(_currentStep, _markStepHelp)}
      </section>`;
  }

  const viewClass = _activeKZ ? 'ps-view ps-view--wizard' : 'ps-view';
  _mount.innerHTML = `<div class="${viewClass}">${content}</div>`;
  attachHandlers();
}

// ─── Event handlers ───────────────────────────────────────────────────────────

function attachHandlers() {
  // Tracker: AI-draft banner + AI-draft row's "Open 8-Step" button — the SAME
  // `?kpi=<id>&kz=<kzNumber>` hash handoff views/overview.js's "Review Draft
  // 8-Step" note already uses, so the exported entry point's real-KZ lookup
  // (below) resolves the actual record and lands on its first open step.
  _mount.querySelectorAll('[data-go-kz]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const kzNumber = btn.dataset.goKz;
      const kpiId = btn.dataset.goKpi || '';
      location.hash = `#/dept/${_dept.id}/solve?kpi=${encodeURIComponent(kpiId)}&kz=${encodeURIComponent(kzNumber)}`;
    });
  });

  // Not-yet-started AI-draft candidate rows/banner (aiDraftCandidatesFromRedKpis)
  // — no KZ record exists yet, so there's nothing to hash-link to; open the
  // SAME in-memory wizard the sidebar red-KPI <select> already uses, just
  // pre-seeded with this row's real kpiId. Works whether the attribute sits
  // on the whole <tr> (candidateRowHTML) or a standalone button
  // (renderAiDraftCandidateBanner) — a click on the row's inner button
  // bubbles up to the row's own listener, so each element only needs one.
  _mount.querySelectorAll('[data-open-ai-draft]').forEach((el) => {
    el.addEventListener('click', () => {
      window._psOpenWizard(el.dataset.openAiDraft);
    });
  });

  // Step 6 action register — recolor the status <select> live (R/Y/G/C tone
  // tokens matching `.badge--{tone}`) on change, without a full doRender()
  // (which would lose focus/in-progress edits elsewhere in the row). Event
  // delegation on the tbody so it also covers rows added later by
  // _psAddActionRow/_addSuggestedActionRow.
  const arBody = _mount.querySelector('#action-register-body');
  if (arBody) {
    arBody.addEventListener('change', (e) => {
      const sel = e.target.closest('select[data-ar-field="status"]');
      if (!sel) return;
      if (sel.value === 'C') {
        sel.style.cssText += 'color:var(--accent-text);background:hsl(var(--action-1));border-color:hsl(var(--action-3))';
        return;
      }
      const tone = { R: 'red', Y: 'amber', G: 'green' }[sel.value];
      if (tone) sel.style.cssText += `color:var(--${tone}-text);background:var(--${tone}-bg);border-color:var(--${tone}-border)`;
    });
  }

  // presetKpiId lets a candidate row / banner button (data-open-ai-draft)
  // open the wizard directly for a specific KPI, bypassing the <select> —
  // the sidebar "Open 8-Step (AI-Drafted)" button still calls this with no
  // argument, falling back to whatever's selected there, so both entry
  // points share this one code path.
  window._psOpenWizard = (presetKpiId) => {
    const sel = document.getElementById('ps-kpi-select');
    const kpiId = presetKpiId || (sel && sel.value);
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
      <td class="tnum" style="width:40px">${n}</td>
      <td><input type="text" class="input" data-ar-field="plan" data-ar-row="${n - 1}" placeholder="What needs to be done" aria-label="Plan, row ${n}"></td>
      <td><input type="date" class="input" data-ar-field="startDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Start date, row ${n}"></td>
      <td><input type="date" class="input" data-ar-field="dueDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Due date, row ${n}"></td>
      <td><input type="text" class="input" data-ar-field="responsible" data-ar-row="${n - 1}" placeholder="Name" style="min-width:110px" aria-label="Responsible, row ${n}"></td>
      <td><select class="input" data-ar-field="status" data-ar-row="${n - 1}" style="min-width:120px;font-weight:600;color:var(--red-text);background:var(--red-bg);border-color:var(--red-border)" aria-label="Status, row ${n}">
        <option value="R" selected>R — Behind</option><option value="Y">Y — At Risk</option>
        <option value="G">G — On Track</option><option value="C">C — Completed</option></select></td>`;
    tbody.appendChild(tr);
  };

  window._psAddCmRow = () => {
    const tbody = document.getElementById('cm-matrix-body');
    if (!tbody) return;
    const i = tbody.querySelectorAll('tr').length;
    const cols = (_template && _template.scoringMatrix && _template.scoringMatrix.columns) || [];
    const dims = cols.filter((c) => c.key !== 'OA');
    const tr = document.createElement('tr');
    const scoreCells = dims.map((c) =>
      `<td class="num score-cell"><select class="score-sel" data-cm-field="${c.key}" data-cm-row="${i}" aria-label="${esc(c.key)} score, row ${i + 1}"><option value="">–</option><option value="0">0</option><option value="1">1</option><option value="2">2</option></select></td>`).join('');
    const oaCell = `<td class="num score-cell"><select class="score-sel score-sel--oa" data-cm-field="OA" data-cm-row="${i}" aria-label="Overall rank, row ${i + 1}"><option value="">–</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td>`;
    tr.innerHTML = `<td><input type="text" class="input cm-text" data-cm-field="text" data-cm-row="${i}" placeholder="Countermeasure candidate" aria-label="Countermeasure ${i + 1}"></td>${scoreCells}${oaCell}`;
    tbody.appendChild(tr);
    const newInput = tr.querySelector('.cm-text');
    if (newInput) newInput.focus();
  };

  // ── Docked Mark co-pilot ────────────────────────────────────────────────
  window._psMarkAdd = (idx) => {
    if (!_markStepHelp || !_markStepHelp.items || !_markStepHelp.items[idx]) return;
    const item = _markStepHelp.items[idx];
    const panel = document.querySelector('.eightstep__body');
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
  const dims = cols.filter((c) => c.key !== 'OA');
  const scoreCell = (ck, isOA) => {
    const v = item[ck];
    const options = isOA ? ['', 1, 2, 3, 4, 5] : ['', 0, 1, 2];
    const opts = options.map((o) =>
      `<option value="${o}" ${String(v) === String(o) ? 'selected' : ''}>${o === '' ? '–' : o}</option>`).join('');
    return `<td class="num score-cell"><select class="score-sel ${isOA ? 'score-sel--oa' : ''}" data-cm-field="${ck}" data-cm-row="${i}" aria-label="${esc(ck)} score, row ${i + 1}">${opts}</select></td>`;
  };
  const scoreCells = dims.map((c) => scoreCell(c.key, false)).join('') + scoreCell('OA', true);
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="text" class="input cm-text" data-cm-field="text" data-cm-row="${i}" value="${esc(item.text)}" placeholder="Countermeasure candidate" aria-label="Countermeasure ${i + 1}"></td>${scoreCells}`;
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
    <td class="tnum" style="width:40px">${n}</td>
    <td><input type="text" class="input" data-ar-field="plan" data-ar-row="${n - 1}" value="${esc(item.text)}" placeholder="What needs to be done" aria-label="Plan, row ${n}"></td>
    <td><input type="date" class="input" data-ar-field="startDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Start date, row ${n}"></td>
    <td><input type="date" class="input" data-ar-field="dueDate" data-ar-row="${n - 1}" style="min-width:130px" aria-label="Due date, row ${n}"></td>
    <td><input type="text" class="input" data-ar-field="responsible" data-ar-row="${n - 1}" placeholder="Name" style="min-width:110px" aria-label="Responsible, row ${n}"></td>
    <td><select class="input" data-ar-field="status" data-ar-row="${n - 1}" style="min-width:120px;font-weight:600;color:var(--red-text);background:var(--red-bg);border-color:var(--red-border)" aria-label="Status, row ${n}">
      <option value="R" selected>R — Behind</option><option value="Y">Y — At Risk</option>
      <option value="G">G — On Track</option><option value="C">C — Completed</option></select></td>`;
  tbody.appendChild(tr);
}

function _saveCurrentStepInputs() {
  if (!_activeKZ) return;
  const panel = document.querySelector('.eightstep__body');
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
  .ps-view--wizard { max-width: 1360px; }

  /* Step-reach funnel (tracker header card) — counts render via the shared .ps-summary strip */
  .ps-funnel { display:flex; flex-direction:column; align-items:center; gap:4px; }
  .ps-funnel__svg svg { display:block; }

  /* Stall / age flag (tracker rows — real start-date age only, no fabricated per-step timing) */
  .stall-flag { margin-top:4px; font-size:0.68rem; font-weight:600; color:var(--amber-text); white-space:nowrap; }

  /* PDCA badge — plain neutral label (phase is identity, not status). Used by
     the read-only A3 (renderReadA3's stepCard); the wizard's own step head
     uses the shared .running-head instead. */
  .pdca-badge { background:var(--muted); color:var(--text-dim); border:1px solid var(--border); padding:2px 8px; border-radius:var(--radius-sm); font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; }

  /* Docked Mark co-pilot's own proactive suggestion cards (Add/Dismiss) — a
     real feature beyond the static reference's assist panel, nested inside
     the ported .eightstep__assist column (see renderAssistPanel). */
  .assist-items { display:grid; gap:8px; overflow-y:auto; max-height:260px; }
  .mark-item { border:1px solid var(--border-soft); border-radius: var(--radius); padding:8px 10px; background: var(--bg-subtle); }
  .mark-item--added { border-color: var(--green-border); background: var(--green-bg); }
  .mark-item--skipped { opacity:0.5; }
  .mark-item__text { font-size:0.78rem; color: var(--text-secondary); line-height:1.4; }
  .mark-item__tag { font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color: var(--accent-text); background:var(--panel); border:1px solid hsl(var(--action-3)); border-radius:3px; padding:1px 5px; margin-right:5px; }
  .mark-item__chain { display:flex; flex-direction:column; gap:3px; }
  .mark-item__why { font-size:0.76rem; color: var(--text-secondary); line-height:1.4; }
  .mark-item__why b { color: var(--accent-text); font-family: var(--font-mono); font-size:0.72rem; margin-right:4px; }
  .mark-item__cat { font-size:0.58rem; font-weight:700; text-transform:uppercase; color: var(--text-faint); background: var(--muted); border-radius:3px; padding:0 4px; margin:0 5px 0 2px; }
  .mark-item__root { margin-top:4px; font-size:0.76rem; font-weight:600; color: var(--text); }
  .mark-item__scores { margin-top:4px; font-family: var(--font-mono); font-size:0.68rem; color: var(--text-faint); }
  .mark-item__actions { display:flex; gap:6px; margin-top:8px; }
  .mark-item__btn { flex:1; font-size:0.7rem; font-weight:600; padding:4px 8px; border-radius: var(--radius-sm); cursor:pointer; border:1px solid transparent; }
  .mark-item__btn:disabled { cursor:default; opacity:.6; }
  .mark-item__btn--add { background: var(--accent); color:var(--accent-fg); }
  .mark-item__btn--add:hover:not(:disabled) { background: var(--accent-hover); }
  .mark-item__btn--skip { background:transparent; border-color: var(--border-strong); color: var(--text-dim); }
  .mark-item__btn--skip:hover:not(:disabled) { background: var(--muted); }
  .mark-item__done { margin-top:6px; font-size:0.68rem; font-weight:700; color: var(--green-text); }

  /* Ask-Mark answer entries appended live into .assist-thread (#mark-dock-answers) */
  .mark-answer { font-size:0.75rem; }
  .mark-answer__q { font-weight:700; color: var(--text-secondary); }
  .mark-answer__a { color: var(--text-dim); margin-top:2px; white-space:pre-wrap; }

  /* Secondary 6M contributing-factor mini-table (Step 4, below the 5-Whys
     ladder — see render5Whys6M) */
  .fishbone-tbl { width:100%; border-collapse:collapse; font-size:0.85rem; }
  .fishbone-tbl td { padding:4px 0 4px 4px; }

  /* Countermeasure matrix (read-only A3's renderReadA3 only — the live wizard
     uses the ported global .dt/.score-sel/.score-cell/.cm-text classes) */
  .cm-matrix th, .cm-matrix td { font-size:0.8rem; }
  .cm-matrix .cm-text { min-width:200px; }
  .score-th { text-align:center; }
  .sc { display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:4px; font-family: var(--font-mono); font-weight:700; font-size:0.78rem; }
  .sc--0 { background:var(--red-bg);   color:var(--red-text); }
  .sc--1 { background:var(--amber-bg); color:var(--amber-text); }
  .sc--2 { background:var(--green-bg); color:var(--green-text); }
  .sc--na { background:var(--muted); color:var(--text-faint); }

  /* ODG gate + SOP write-back badges (read-only A3's renderReadA3 only — the
     live wizard uses the shared .badge--{amber/green/neutral} tones) */
  .gate-badge { font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:3px; margin-left:4px; }
  .gate-badge--pending { background:var(--muted); color:var(--text-faint); }
  .gate-badge--submitted { background:var(--amber-bg); color:var(--amber-text); }
  .gate-badge--approved { background:var(--green-bg); color:var(--green-text); }
  .sop-writeback { margin-top:20px; border:1px solid var(--border-soft); border-radius: var(--radius); padding:16px; background: var(--bg-subtle); }
  .sop-writeback__label { font-size:0.68rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--text-faint); margin-bottom:4px; }

  /* Read-only A3 tables (score matrix, action register) */
  .kpi-table th, .kpi-table td { font-size:0.85rem; }
  /* .a3-tag — the read-only A3 header's "A3" mark (renderReadA3 only; the
     tracker's own A3/AI-draft tags moved to .badge/.chip, see renderTrackerTable) */
  .a3-tag { font-size:0.58rem; font-weight:800; letter-spacing:0.04em; color:var(--accent-fg); background: var(--accent); border-radius:3px; padding:1px 5px; vertical-align:middle; }

  /* Read-only A3 */
  .ro-header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap; padding-bottom:12px; border-bottom:2px solid var(--border); }
  .ro-header__title { font-family: var(--font-serif); font-size:1.35rem; font-weight:600; }
  .ro-header__meta { display:grid; grid-template-columns: 1fr 1fr; gap:2px 18px; }
  .ro-kv { display:flex; gap:8px; padding:2px 0; font-size:0.83rem; }
  .ro-kv__k { color:var(--text-faint); font-weight:600; min-width:120px; }
  .ro-kv__v { color:var(--text-secondary); }
  .ro-step { border:1px solid var(--border); border-radius: var(--radius); margin-bottom:12px; overflow:hidden; }
  .ro-step__head { display:flex; align-items:center; gap:10px; padding:8px 14px; background: var(--bg-subtle); border-bottom:1px solid var(--border-soft); }
  .ro-step__n { font-family: var(--font-mono); font-size:0.75rem; color:var(--text-faint); font-weight:700; }
  .ro-step__title { font-weight:600; font-size:0.92rem; }
  .ro-step__body { padding:12px 14px; }
  .ro-gap, .ro-prio { margin-top:6px; font-size:0.85rem; }
  .ro-why { display:flex; gap:10px; align-items:baseline; padding:3px 0; font-size:0.84rem; }
  .ro-why__n { font-family: var(--font-mono); font-weight:700; color:var(--accent-text); min-width:46px; }
  .ro-why__cat { font-size:0.6rem; font-weight:700; text-transform:uppercase; color:var(--text-faint); background:var(--muted); border-radius:3px; padding:1px 6px; min-width:70px; text-align:center; }
  .ro-rootcause { margin-top:10px; font-size:0.86rem; }
  .ro-altchains { margin-top:8px; }
  .ro-altchain { border:1px dashed var(--border-strong); border-radius:4px; padding:8px 10px; margin-bottom:6px; }
  .ro-alt-why { font-size:0.78rem; color:var(--text-dim); }
  .ro-alt-root { font-size:0.78rem; color:var(--text); font-weight:600; margin-top:3px; }
  .ro-narr { margin-top:8px; font-size:0.83rem; line-height:1.5; color:var(--text-secondary); background:var(--bg-subtle); border-radius:4px; padding:8px 10px; }
  .ro-gate { margin-top:10px; font-size:0.85rem; }
  .ar-status { display:inline-block; width:22px; text-align:center; font-family: var(--font-mono); font-weight:700; border-radius:4px; }
  .ar-status--R { background:var(--red-bg);   color:var(--red-text); }
  .ar-status--Y { background:var(--amber-bg); color:var(--amber-text); }
  .ar-status--G { background:var(--green-bg); color:var(--green-text); }
  .ar-status--C { background:hsl(var(--action-1)); color:var(--accent-text); }
`;

(function injectStyles() {
  // Guard for non-browser module loads (node --test importing this file to
  // reach an exported pure helper like aiDraftCandidatesFromRedKpis — see
  // tests/problemsolving-view.test.mjs). No behavior change in the browser,
  // where `document` always exists.
  if (typeof document === 'undefined') return;
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
  // on file (e.g. KZ-346, linked via linkedKpiId to otp_mexico). No kz param
  // at all (Ask Mark's escalation no longer fabricates one for a fresh
  // draft — see views/askmark.js's resolveKzNumber) falls through unchanged
  // to the existing ?kpi= mint-a-fresh-wizard handoff below.
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
