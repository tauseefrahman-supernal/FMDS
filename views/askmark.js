/**
 * views/askmark.js — Ask Mark: chat-first workspace with a response modal
 *
 * renderAskMark(dept, mount, session)
 *
 * Layout ported from docs/redesign/reference/view-rest.js (Ask Mark) — §5.8 of
 * docs/redesign/DESIGN-GUIDE.md — a 34fr/66fr grid: left = the live red-KPI
 * "Needs response" queue (`.q-card`s) + a "Recent threads" list
 * (`.thread-item`s); right = a chat surface (thread header, scrollable
 * messages, docked composer) talking to Mark via `lib/agent.js` liveReply().
 * The old two-pane "response card sits beside the chat" layout is retired —
 * a KPI's response card is now a `.modal-panel` opened from its `.q-card`'s
 * "Open response card" affordance (spec §3 Modal: scrim + panel, header/body/
 * footer, dismiss via ×/Close/overlay-click/Escape).
 *
 * ALL data plumbing from the pre-rebuild version is preserved verbatim —
 * only the markup + the chat's data shape (one flat thread → many named
 * threads) changed:
 *   - lib/accountability.js: redKpisNeedingResponse (live red queue),
 *     getResponse/addResponse (the response store), advanceLifecycle/
 *     lifecycleView (the 6-stage lifecycle track), linkEightStep (8-step
 *     escalation), rollupSignal (header "N stalled · M responses logged").
 *   - lib/agent.js liveReply() — every chat send still gathers the same live
 *     context (reasons, per-KPI comments, kz-records.json), now also the
 *     dept's accountability responses (getResponsesByDept) and the active
 *     thread's message history, and calls it unchanged; liveReply itself
 *     decides whether to hit the real backend agent or fall back to the
 *     scripted reply.
 *   - The header's "N action required" / "M being actioned" pill math is
 *     still computed off the LIVE queue split by whether each red already
 *     has a submitted response (not off rollupSignal — see the split-queue
 *     note above renderPageHead()).
 *   - The `respond=<kpiId>` hash param (reserved in app.js's routing
 *     docstring for exactly this) now opens the response modal for that KPI
 *     on mount — deep-linkable, e.g. `#/dept/operations/mark?respond=otp_mexico`.
 *
 * What DID change, deliberately, because the old co-located layout no longer
 * exists once the response card becomes a modal (a modal blocks the page
 * behind it, so there's no simultaneous "type in the chat to fill the
 * response draft" surface anymore): the previous "answer via chat" shortcut
 * (typing a chat message while an unanswered response card was selected
 * dropped that text into the draft's Field 1) is removed. The response
 * form's own "Ask Mark to draft it" button covers the same grounded-draft
 * need; the chat composer is now a plain Q&A surface with Mark, matching the
 * reference's fully independent chat-vs-response-modal split.
 *
 * "Chat threads" are an in-view/session concern (never persisted — same as
 * the old single `_thread`, reset on every renderAskMark() call), just now a
 * named LIST of threads instead of one flat log, so multiple conversations
 * can coexist and be switched between via the left column's "Recent
 * threads" list. "+ New Chat" pushes a fresh thread (Mark's scripted
 * intro copy — not business data) to the front and makes it active; a
 * thread's title renames itself from the first message sent in it.
 */

import {
  redKpisNeedingResponse, rollupSignal, getResponse, addResponse,
  advanceLifecycle, lifecycleView, linkEightStep, getResponsesByDept,
} from '../lib/accountability.js';
import { liveReply, toApiMessages }        from '../lib/agent.js';
import { getReasonsByDept }                from '../lib/reasons.js';
import { getComments, composeMarkNote }    from '../lib/comments.js';
import { sparkline, stepChart, VIZ }       from '../lib/charts.js';

// ─── State (module-level, reset each render — mirrors problemsolving.js) ────
let _dept          = null;
let _mount         = null;
let _session       = null;
let _queue         = [];    // live red-KPI queue, refreshed every doRender()
let _threads       = [];    // [{ id, title, titled, when, msgs:[{role,text,system?}] }]
let _activeThreadId = null;
let _sending       = false; // guards double-send while a liveReply is in flight
let _submitting    = false; // guards double-submit on the response modal — addResponse()
                             // + the needs8 escalation path both run before the re-render
                             // that swaps the form out, so a fast double-click could
                             // otherwise persist two entries (double-counting rollupSignal)
let _kzRecordsCache = null; // lazy-loaded data/kz-records.json, shared across sends
let _drafts        = {};    // in-progress (unsubmitted) response-form edits, keyed by
                             // `${deptId}:${kpiId}` (draftKey) — NOT bare kpiId: KPI ids
                             // collide across departments. Cleared per KPI once
                             // addResponse() persists it, reset entirely on renderAskMark().
let _modalKpiId    = null;  // kpiId whose response modal is open, or null
let _modalEditing  = false; // answered response modal only: showing the editable form
                             // (via "Edit Response") instead of the read-back

// Field-1 prompt — Mark adapts what "what's driving the red?" means per
// department. Generic fallback covers depts not called out in the spec table.
const CAUSE_PROMPT_BY_DEPT = {
  operations: 'which location / which standard-work step',
  service:    'which reps & accounts',
  marketing:  'which channel',
  hr:         'incident vs data-entry artifact',
};
function causePromptFor(deptId) {
  return CAUSE_PROMPT_BY_DEPT[deptId] || 'what specifically is driving this';
}

// ─── Small formatters ────────────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

// Short "Mon D" date, same regex-on-ISO approach as lib/comments.js shortTs().
function formatDueDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[+m[2] - 1]} ${+m[3]}`;
}

// "Mon D" for TODAY — used for a freshly created thread's meta line. Real
// current date, not a fabricated one (mirrors accountability.js's own
// addDays(new Date().toISOString(), ...) pattern for real-time stamps).
function shortDateLabel(d = new Date()) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function findKpi(dept, kpiId) {
  return (dept.kpis || []).find((k) => k.id === kpiId) || null;
}

// ─── Chart helpers (modal's "actual vs target" chart) ───────────────────────
// Same idiom as views/problemsolving.js's A3 chart figures (chartFig/
// stepChartFmtY) — kept local here since problemsolving.js doesn't export
// them, but grounded in the same real kpi.series/target/unit.

// A couple of departments store object-shaped series (marketing.json:
// [{week,date,target,actual}, ...]); most store a flat number array. Same
// normalization views/overview.js already applies for its sparklines.
function seriesNumbers(kpi) {
  const s = kpi && kpi.series;
  if (!Array.isArray(s)) return [];
  if (s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => (pt && typeof pt === 'object') ? (pt.actual ?? null) : pt);
  }
  return s;
}

function seriesLabels(kpi) {
  const s = kpi && kpi.series;
  if (Array.isArray(s) && s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => 'P' + (pt && pt.week != null ? pt.week : '?'));
  }
  return seriesNumbers(kpi).map((_, i) => 'P' + (i + 1));
}

function chartFmtY(kpi) {
  const u = kpi && kpi.unit;
  if (u === 'ratio' || u === 'percent' || u === '%' || u === 'pct') return (v) => (v * 100).toFixed(1) + '%';
  return (v) => formatVal(v, u);
}

function chartXLabels(n) {
  return Array.from({ length: n }, (_, i) => `P${i + 1}`);
}

function chartFigFor(kpi) {
  if (!kpi) return `<div class="muted" style="font-size:12.5px; padding:12px 0">No KPI data available.</div>`;
  const series = seriesNumbers(kpi).filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (!series.length) return `<div class="muted" style="font-size:12.5px; padding:12px 0">No trend series on file for ${esc(kpi.name)}.</div>`;
  const target = typeof kpi.target === 'number' ? kpi.target : undefined;
  const svg = stepChart(series, {
    w: 660, h: 130, target, xLabels: chartXLabels(series.length),
    label: `${kpi.name} actual vs target`, fmtY: chartFmtY(kpi),
  });
  return `<figure class="chart-fig">
    ${svg}
    <figcaption class="chart-fig__cap"><span>${esc(kpi.name)} — actual vs target, ${series.length} periods on file. The number this response answers for.</span></figcaption>
  </figure>`;
}

// ─── Queue lookups ───────────────────────────────────────────────────────────

function findQueueItem(kpiId) {
  return _queue.find((q) => q.kpiId === kpiId) || null;
}

// Resolves a "queue item" shape for the response modal even when the KPI has
// already recovered off the live board (e.g. reopened later via the
// `respond=` deep link, or the read-back of an old answered entry). Falls
// back to the KPI definition + the persisted response entry's own owner/
// dueDate — never invents a value the store doesn't have.
function modalItemFor(kpiId) {
  const queued = findQueueItem(kpiId);
  if (queued) return queued;
  const kpi = findKpi(_dept, kpiId);
  if (!kpi) return null;
  const resp = getResponse({ deptId: _dept.id, kpiId });
  return {
    kpiId,
    kpi: kpi.name,
    rag: 'red',
    owner: (resp && resp.owner) || '',
    dueDate: (resp && resp.dueDate) || null,
  };
}

// ─── Page head ───────────────────────────────────────────────────────────────
//
// Pill math: BOTH pills are computed off the LIVE red queue —
// redKpisNeedingResponse(dept) — split by whether each item already has a
// submitted response (getResponse(...).answered):
//   "N action required" — live reds with NO response yet.
//   "M being actioned"  — live reds that DO have a response (still red on
//                         the board, but an owner has answered).
// Neither pill reads rollupSignal(deptId) counts: rollupSignal summarizes
// *persisted* accountability entries, which can include ones that have since
// recovered off the live board, or that haven't yet reached the
// 'actionUnderway' stage rollupSignal's own beingActioned count requires —
// using it for the headline pills risked an answered-but-not-yet-underway
// red not moving out of "action required" the moment it's submitted.
// rollupSignal's stalled + answered counts still feed the page-head sub-line.
function renderPageHead(dept, unansweredCount, answeredCount, rollup) {
  return `
    <div class="page-head">
      <div style="display:flex; gap:16px; align-items:center">
        <div class="ai-note__avatar" style="width:44px; height:44px; font-size:18px">M</div>
        <div>
          <h1 style="font-size:24px">Mark</h1>
          <p class="page-head__sub">AI Employee · ${esc(dept.name)} · ${rollup.stalled} stalled · ${rollup.answered} response${rollup.answered === 1 ? '' : 's'} logged</p>
        </div>
      </div>
      <div class="page-head__side">
        <span class="badge badge--red"><span class="dot"></span>${unansweredCount} action required</span>
        <span class="badge badge--amber"><span class="dot"></span>${answeredCount} being actioned</span>
        <button type="button" class="btn btn--primary" id="new-chat">+ New Chat</button>
      </div>
    </div>`;
}

// ─── Left column: red-KPI queue + recent threads ────────────────────────────

function renderQueueCard(item, dept) {
  const kpi      = findKpi(dept, item.kpiId);
  const actual   = kpi ? formatVal(kpi.actual, kpi.unit) : '—';
  const target   = kpi ? formatVal(kpi.target, kpi.unit) : '—';
  const resp     = getResponse({ deptId: dept.id, kpiId: item.kpiId });
  const answered = !!(resp && resp.answered);
  const spark    = kpi ? sparkline(seriesNumbers(kpi), {
    w: 96, h: 28, target: kpi.target, name: `${kpi.name} trend`,
    labels: seriesLabels(kpi), fmt: kpi.unit, color: VIZ.rust, soft: VIZ.rustSoft,
  }) : '';

  return `
    <button type="button" class="q-card" data-kpi-id="${esc(item.kpiId)}" data-open-response>
      <div class="q-card__row">
        <span class="status-cell status-cell--red"><span class="dot"></span>${esc(item.kpi)}</span>
        ${answered ? '<span class="badge badge--green">✓ Answered</span>' : '<span class="badge badge--red">Respond</span>'}
      </div>
      <div class="q-card__row" style="align-items:flex-end">
        <span class="q-card__value tnum">${actual} <small>vs ${target}</small></span>
        ${spark}
      </div>
      <div class="q-card__meta">Due ${formatDueDate(item.dueDate)} · Owner ${esc(item.owner || 'Unassigned')} · <b style="color:var(--accent-text)">Open response card</b></div>
    </button>`;
}

function renderThreadItems(threads, activeId) {
  if (!threads.length) {
    return '<p class="muted" style="font-size:12.5px">No threads yet — start one below, or click + New Chat.</p>';
  }
  return threads.map((t) => {
    const n = t.msgs.length;
    return `
      <button type="button" class="thread-item${t.id === activeId ? ' is-active' : ''}" data-thread-id="${esc(t.id)}">
        <span class="thread-item__title">${esc(t.title)}</span>
        <span class="thread-item__meta">${esc(t.when)} · ${n} message${n === 1 ? '' : 's'}</span>
      </button>`;
  }).join('');
}

// The split (unanswered vs answered) still drives the header pills + each
// card's own badge; the queue itself renders as ONE "Needs response" list
// (spec §5.8), unanswered items first so the most urgent reds lead.
function renderLeftColumn(dept, queue) {
  const unanswered = [];
  const answered   = [];
  for (const item of queue) {
    const resp = getResponse({ deptId: dept.id, kpiId: item.kpiId });
    (resp && resp.answered ? answered : unanswered).push(item);
  }
  const ordered = unanswered.concat(answered);
  const queueHtml = ordered.length
    ? ordered.map((it) => renderQueueCard(it, dept)).join('')
    : '<p class="muted" style="font-size:12.5px">No reds needing a response right now.</p>';

  return `
    <div class="section-head" style="margin-top:0">
      <span class="running-head">Needs response</span>
      <span class="badge badge--neutral">${queue.length}</span>
    </div>
    <div style="display:grid; gap:8px">${queueHtml}</div>

    <div class="section-head"><span class="running-head">Recent threads</span></div>
    <div id="askmark-threads-list" style="display:grid; gap:8px">${renderThreadItems(_threads, _activeThreadId)}</div>`;
}

// ─── Right column: chat surface ─────────────────────────────────────────────

function renderChatMessage(msg) {
  if (msg.role === 'me') {
    return `<div class="msg msg--user"><div class="msg__bubble">${esc(msg.text)}</div></div>`;
  }
  // System confirmations (response logged / 8-step opened) render as a
  // sage-tinted bubble — same Mark avatar, distinct fill — so they read as
  // a receipt inline in the conversation rather than a normal reply.
  const sysStyle = msg.system ? ' style="background:hsl(var(--action-1)); border-color:hsl(var(--action-3))"' : '';
  return `
    <div class="msg">
      <div class="ai-note__avatar">M</div>
      <div class="msg__bubble"${sysStyle}><p>${esc(msg.text)}</p></div>
    </div>`;
}

function renderThreadMessages(thread) {
  if (!thread || !thread.msgs.length) {
    return `<div class="muted" style="margin:auto; font-size:13.5px; text-align:center; max-width:44ch">Ask Mark about this board — I reason over the live KPI numbers, the response trail, and the 8-step record.</div>`;
  }
  return thread.msgs.map(renderChatMessage).join('');
}

function renderChatCard(thread) {
  return `
    <section class="card chat-surface">
      <div class="chat-surface__head">
        <span class="running-head">Thread</span>
        <b style="font-size:13px">${esc(thread ? thread.title : 'Ask Mark')}</b>
      </div>
      <div class="chat__thread chat-surface__scroll" id="askmark-thread">${renderThreadMessages(thread)}</div>
      <div class="chat__composer" style="padding:12px 20px 20px; margin:0">
        <textarea class="input" rows="2" id="askmark-input" placeholder="Ask Mark about this board…" aria-label="Ask Mark about this board"></textarea>
        <button type="button" class="btn btn--primary" id="askmark-send" style="align-self:flex-end">Send</button>
      </div>
    </section>`;
}

// ─── Response modal (spec §3 Modal + §5.8) ──────────────────────────────────

// The lifecycle chip track. Fed a real persisted entry once one exists;
// before a response, a pseudo-entry with only 'detected' done stands in
// (detection isn't persisted until an owner responds — see
// lib/accountability.js module header). lifecycleView() flags done/current.
function renderLifecycleChips(entry) {
  const stages = lifecycleView(entry);
  return stages.map((s) => {
    const cls = s.done ? 'is-done' : (s.current ? 'is-now' : '');
    return `<span class="life-chip ${cls}">${s.done ? '✓ ' : ''}${esc(s.label)}</span>`;
  }).join('<span class="faint" style="padding:0 2px">›</span>');
}

// Read-back of an already-submitted response (all persisted, user-entered
// text escaped). needs8Step = Yes renders one of three states: a deep-link
// once the 8-step is actually opened (lifecycle.eightStepOpened.done), an
// explicit "Open 8-step" action when a KZ is linked/linkable but escalation
// hasn't happened yet (e.g. the seeded OTP entry), or plain "No" text.
function renderReadBackFields(resp) {
  const opened = !!(resp.lifecycle && resp.lifecycle.eightStepOpened && resp.lifecycle.eightStepOpened.done);
  let eightStep;
  if (!resp.needs8Step) {
    eightStep = 'No — one-off / data artifact';
  } else if (opened && resp.kzNumber) {
    eightStep = `Yes — <a href="#/dept/${esc(resp.deptId)}/solve?kpi=${esc(resp.kpiId)}&kz=${esc(resp.kzNumber)}" style="color:var(--accent-text); font-weight:600">Open ${esc(resp.kzNumber)} in Problem-Solving →</a>`;
  } else {
    eightStep = `Yes — <button type="button" class="btn btn--outline btn--sm" id="rc-open8step" data-kpi-id="${esc(resp.kpiId)}">Open 8-step →</button>`;
  }
  const field = (label, value) => `<div class="field"><span class="field__label">${label}</span><span class="field__value">${value}</span></div>`;
  return `
    <div class="field-list">
      ${field("What's driving the red?", esc(resp.cause) || '—')}
      ${field('What are you doing about it?', esc(resp.action) || '—')}
      ${field('Needs an 8-step?', eightStep)}
      ${field('When will you report back?', esc(resp.reportBackWhen) || '—')}
    </div>`;
}

// The fillable 4-field form — used for a brand-new (unanswered) response AND
// for re-opening an already-answered one via "Edit Response" (seeded from
// `resp` instead of a blank slate). Field 1 pre-drafts from Mark's grounded
// read (composeMarkNote) unless the owner already edited it (persisted in
// _drafts) or an existing resp supplies one.
function renderResponseFormFields(item, kpi, resp) {
  const draft  = getDraft(item.kpiId);
  const cause  = draft.cause       != null ? draft.cause       : (resp ? resp.cause  : composeMarkNote(kpi || {}, item.rag));
  const action = draft.action      != null ? draft.action      : (resp ? resp.action : '');
  const needs8 = draft.needs8Step  != null ? draft.needs8Step  : (resp ? !!resp.needs8Step : false);
  const report = draft.reportBackWhen != null ? draft.reportBackWhen : (resp ? (resp.reportBackWhen || '') : '');
  const prompt = causePromptFor(_dept.id);

  return `
    <div class="field-list">
      <div class="field">
        <span class="field__label">What's driving the red? <span class="faint" style="font-weight:500">${esc(prompt)}</span></span>
        <textarea class="input" id="rc-cause" rows="4">${esc(cause)}</textarea>
        <div style="display:flex; align-items:center; gap:8px">
          <button type="button" class="btn btn--outline btn--sm" id="rc-draft">Ask Mark to draft it</button>
          <span class="faint" style="font-size:11px">Mark pre-fills this from the KPI's grounded read.</span>
        </div>
      </div>

      <div class="field">
        <span class="field__label">What are you doing about it?</span>
        <textarea class="input" id="rc-action" rows="3" placeholder="The action you're taking…">${esc(action)}</textarea>
      </div>

      <div class="field">
        <span class="field__label">Does this need an 8-step?</span>
        <div class="seg" id="rc-needs8" style="width:fit-content">
          <button type="button" class="seg__item${needs8 ? ' is-on' : ''}" data-val="yes">Yes</button>
          <button type="button" class="seg__item${!needs8 ? ' is-on' : ''}" data-val="no">No</button>
        </div>
        <p class="muted" id="rc-esc-note" style="font-size:12px; margin-top:6px;${needs8 ? '' : ' display:none'}">Submitting will link or open a KZ (8-step) for this KPI.</p>
      </div>

      <div class="field">
        <span class="field__label">When will you report back?</span>
        <input type="text" class="input" id="rc-report" style="max-width:320px" placeholder="e.g. Next T3 review, or a date" value="${esc(report)}">
      </div>
    </div>`;
}

function renderResponseModal() {
  const kpiId = _modalKpiId;
  const item  = modalItemFor(kpiId);
  if (!item) return '';
  const kpi      = findKpi(_dept, kpiId);
  const actual   = kpi ? formatVal(kpi.actual, kpi.unit) : '—';
  const target   = kpi ? formatVal(kpi.target, kpi.unit) : '—';
  const resp     = getResponse({ deptId: _dept.id, kpiId });
  const answered = !!(resp && resp.answered);
  const showForm = !answered || _modalEditing;
  const trackEntry = answered ? resp : { lifecycle: { detected: { done: true, ts: null } } };

  const headerBadge = answered
    ? `<span class="badge badge--green">✓ Response submitted${resp.owner ? ` · ${esc(resp.owner)}` : ''}</span>`
    : `<span class="badge badge--red">Respond</span>`;

  const footerPrimary = showForm
    ? `<button type="button" class="btn btn--primary" id="rc-submit">Submit Response</button>`
    : `<button type="button" class="btn btn--primary" id="rc-edit">Edit Response</button>`;

  return `
    <div class="modal-overlay" data-modal-close></div>
    <div class="modal-panel" role="dialog" aria-modal="true" aria-label="Response card — ${esc(item.kpi)}">
      <div class="modal-panel__head">
        <div>
          <h3>${esc(item.kpi)}</h3>
          <span class="faint" style="font-size:12px">${actual} vs ${target} · Due ${formatDueDate(item.dueDate)} · Owner ${esc(item.owner || 'Unassigned')}</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px">
          ${headerBadge}
          <button type="button" class="icon-btn" data-modal-close aria-label="Close response card">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </button>
        </div>
      </div>
      <div class="modal-panel__body">
        ${chartFigFor(kpi)}
        <span class="running-head">Response lifecycle</span>
        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin:8px 0 20px">${renderLifecycleChips(trackEntry)}</div>
        ${showForm ? renderResponseFormFields(item, kpi, resp) : renderReadBackFields(resp)}
      </div>
      <div class="modal-panel__foot">
        <button type="button" class="btn btn--secondary" data-modal-close>Close</button>
        ${footerPrimary}
      </div>
    </div>`;
}

// ─── Threads ─────────────────────────────────────────────────────────────────

function threadUid() {
  return 't-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

// `withGreeting` is only true for "+ New Chat" — the default landing thread
// created on mount starts empty (renderThreadMessages' own empty-state copy
// covers it), so no scripted text appears until the user asks for a fresh
// conversation. Either way `titled: false` means the thread's title still
// renames itself from the first message actually sent in it.
function newThread({ withGreeting = false } = {}) {
  return {
    id: threadUid(),
    title: withGreeting ? 'New thread' : 'Ask Mark',
    titled: false,
    when: shortDateLabel(),
    msgs: withGreeting
      ? [{ role: 'mark', text: 'New thread — ask me about any KPI on this board. I reason over the live numbers and the response trail.' }]
      : [],
  };
}

function activeThread() {
  return _threads.find((t) => t.id === _activeThreadId) || _threads[0] || null;
}

// ─── Draft state (unsubmitted response-form edits) ──────────────────────────

function draftKey(kpiId) { return `${_dept.id}:${kpiId}`; }
function getDraft(kpiId) { return _drafts[draftKey(kpiId)] || {}; }
function setDraft(kpiId, key, val) {
  const k = draftKey(kpiId);
  _drafts[k] = _drafts[k] || {};
  _drafts[k][key] = val;
}

// Mark (re)drafts field 1 from the KPI's grounded read (composeMarkNote), and
// suggests field 2 only when it's still empty.
function askMarkToDraft(kpiId) {
  const item = modalItemFor(kpiId);
  if (!item) return;
  const kpi   = findKpi(_dept, kpiId);
  const cause = composeMarkNote(kpi || {}, item.rag);
  const root  = document.getElementById('askmark-modal-root');
  const causeEl  = root && root.querySelector('#rc-cause');
  const actionEl = root && root.querySelector('#rc-action');

  if (causeEl) causeEl.value = cause;
  setDraft(kpiId, 'cause', cause);

  if (actionEl && !actionEl.value.trim()) {
    const suggestion = `Confirming ${causePromptFor(_dept.id)} with the owning team, then correcting the standard work. I'll open an 8-step if the cause needs structured problem-solving.`;
    actionEl.value = suggestion;
    setDraft(kpiId, 'action', suggestion);
  }
}

// Escalation: given field 3 = Yes, pick the KZ this response should link to.
// Prefers an EXISTING open KZ already tagged to this KPI (data/kz-records.json's
// linkedKpiId) so escalating a KPI that's already being worked doesn't spawn a
// duplicate 8-step — that's a REAL kzNumber, safe to display and deep-link to.
// Otherwise there is no real KZ record yet: rather than fabricate a
// timestamp-suffixed placeholder ID that never resolves to anything (the old
// bug — Ask Mark would promise a number that Problem-Solving could never
// look up, and silently mint a DIFFERENT blank wizard instead), we return
// null. Callers must not display a fake number; the honest promise is "an
// 8-step draft is available for this KPI" and the actual draft is minted
// live by views/problemsolving.js's `?kpi=<id>` handoff when the owner gets
// there.
function resolveKzNumber(kpiId, owner) {
  const records = _kzRecordsCache || [];
  const existingOpen = records.find(
    (r) => r.deptId === _dept.id && r.linkedKpiId === kpiId && !r.closed);
  return existingOpen ? existingOpen.kzNumber : null;
}

// Submit the 4 fields → persist + advance the lifecycle to 'responded', then
// (field 3 = Yes) resolve+link a KZ and advance to 'eightStepOpened' too,
// then a full doRender() so the queue card, header pills, lifecycle track,
// and the modal (now in its read-back state) all update together.
async function submitResponse(kpiId) {
  if (_submitting) return; // ignore re-entrant clicks until doRender() repaints the modal
  const root = document.getElementById('askmark-modal-root');
  const item = modalItemFor(kpiId);
  if (!root || !item) return;

  const causeEl  = root.querySelector('#rc-cause');
  const actionEl = root.querySelector('#rc-action');
  const reportEl = root.querySelector('#rc-report');
  const yesBtn   = root.querySelector('#rc-needs8 .seg__item[data-val="yes"]');
  const needs8   = !!(yesBtn && yesBtn.classList.contains('is-on'));

  const cause  = causeEl  ? causeEl.value.trim()  : '';
  const action = actionEl ? actionEl.value.trim() : '';
  const report = reportEl ? reportEl.value.trim() : '';

  // Light client-side validation: cause + action are the substance of a
  // response; report-back is nudged but optional.
  if (!cause)  { if (causeEl)  causeEl.focus();  return; }
  if (!action) { if (actionEl) actionEl.focus(); return; }

  // Set BEFORE the (possibly async, see needs8 below) work starts — the
  // needs8 branch awaits loadKzRecords(), which leaves a window before
  // doRender() swaps the form out for the read-back where a second click on
  // the still-visible Submit button would otherwise re-run this whole path.
  _submitting = true;
  const submitBtn = root.querySelector('#rc-submit');
  if (submitBtn) submitBtn.disabled = true;

  addResponse({
    deptId: _dept.id,
    kpiId,
    owner: item.owner || '',
    cause,
    action,
    needs8Step: needs8,
    kzNumber: null,            // resolved + linked just below when needs8
    reportBackWhen: report || null,
  });
  advanceLifecycle({ deptId: _dept.id, kpiId, stage: 'responded' });
  delete _drafts[draftKey(kpiId)];

  let kzNumber = null;
  if (needs8) {
    await loadKzRecords();
    kzNumber = resolveKzNumber(kpiId, item.owner);
    linkEightStep({ deptId: _dept.id, kpiId, kzNumber });
  }

  // Mark posts a confirmation into the currently active chat thread — the
  // "system confirmations" sage-tinted bubble (spec §5.8). Only names a real
  // KZ number when one actually exists (an existing open KZ); otherwise the
  // honest promise is "an 8-step draft is available" — no fake ID — which
  // now matches exactly what views/problemsolving.js's `?kpi=` handoff mints
  // live when the owner gets there.
  const thread = activeThread();
  if (thread) {
    thread.msgs.push({
      role: 'mark', system: true,
      text: needs8
        ? (kzNumber
            ? `Logged your response on ${item.kpi} and opened ${kzNumber} for it — head to Problem-Solving to work the 8-step. I'll roll "being actioned" up to the Leadership OS too.`
            : `Logged your response on ${item.kpi} — I've opened an 8-step draft for it. Head to Problem-Solving to work it. I'll roll "being actioned" up to the Leadership OS too.`)
        : `Logged your response on ${item.kpi}. I'll roll "being actioned" up to the Leadership OS so the Chief of Staff sees this red is being worked.`,
    });
  }

  _submitting = false;
  _modalEditing = false;
  doRender();
}

// Escalate an ALREADY-answered response whose needs8Step is Yes but hasn't
// opened its 8-step yet (the read-back's "Open 8-step →" button — e.g. the
// seeded OTP entry, which ships with a kzNumber but eightStepOpened left
// pending on purpose). Reuses the entry's own kzNumber if it already has one;
// otherwise resolveKzNumber() now returns null rather than a fake ID (see its
// comment) — so this also actually NAVIGATES to Problem-Solving's `?kpi=`
// handoff, which mints the real draft live. That's the fix for the old
// mismatch: Ask Mark used to just log a fake "opened <placeholder-id>"
// message and go nowhere, so the promised ID could never be found once the
// owner clicked through on their own. `&kz=<kzNumber>` is only appended when
// we resolved a REAL existing record, so the deep link never references a
// number that doesn't exist on file.
async function openEightStepForKpi(kpiId) {
  const resp = getResponse({ deptId: _dept.id, kpiId });
  if (!resp) return;
  let kzNumber = resp.kzNumber;
  if (!kzNumber) {
    await loadKzRecords();
    kzNumber = resolveKzNumber(kpiId, resp.owner);
  }
  linkEightStep({ deptId: _dept.id, kpiId, kzNumber });

  const kpi = findKpi(_dept, kpiId);
  const kpiName = (kpi && kpi.name) || kpiId;
  const thread = activeThread();
  if (thread) {
    thread.msgs.push({
      role: 'mark', system: true,
      text: kzNumber
        ? `Opened ${kzNumber} for ${kpiName} — head to Problem-Solving to work the 8-step.`
        : `I've opened an 8-step draft for ${kpiName} — head to Problem-Solving to work it.`,
    });
  }

  doRender();
  const kzParam = kzNumber ? `&kz=${encodeURIComponent(kzNumber)}` : '';
  location.hash = `#/dept/${_dept.id}/solve?kpi=${encodeURIComponent(kpiId)}${kzParam}`;
}

// ─── Data loaders ────────────────────────────────────────────────────────────

// data/kz-records.json holds every department's 8-step records; fetched once
// and cached module-wide, mirroring the lazy-load pattern in
// views/problemsolving.js.
async function loadKzRecords() {
  if (_kzRecordsCache) return _kzRecordsCache;
  try {
    const res = await fetch('data/kz-records.json');
    _kzRecordsCache = await res.json();
  } catch (e) {
    console.warn('Ask Mark: could not load data/kz-records.json', e);
    _kzRecordsCache = [];
  }
  return _kzRecordsCache;
}

// Flatten stored per-KPI comment threads across every KPI in this dept —
// cheap (localStorage-backed, no network) and gives liveReply the same
// "what's driving this" trail a human would see on the KPI board.
function gatherDeptComments(dept) {
  return (dept.kpis || []).flatMap((k) => getComments({ deptId: dept.id, kpiId: k.id }));
}

// ─── Chat: send + repaint ────────────────────────────────────────────────────

function scrollThreadToBottom() {
  const el = document.getElementById('askmark-thread');
  if (el) el.scrollTop = el.scrollHeight;
}

// Re-render just the chat card + the recent-threads list (not the queue, not
// the modal) — used for thread switch / new chat / send, so the response
// modal (a separate overlay) is never disturbed by ordinary chat activity.
function repaintChatArea() {
  const chatHost = document.getElementById('askmark-chat-host');
  if (chatHost) chatHost.innerHTML = renderChatCard(activeThread());
  const threadsList = document.getElementById('askmark-threads-list');
  if (threadsList) threadsList.innerHTML = renderThreadItems(_threads, _activeThreadId);
  bindChatComposer();
  bindThreadItems();
  scrollThreadToBottom();
}

function switchThread(threadId) {
  if (threadId === _activeThreadId) return;
  _activeThreadId = threadId;
  repaintChatArea();
}

function handleNewChat() {
  const t = newThread({ withGreeting: true });
  _threads.unshift(t);
  _activeThreadId = t.id;
  repaintChatArea();
  const inputEl = document.getElementById('askmark-input');
  if (inputEl) inputEl.focus();
}

async function sendMessage() {
  const inputEl = document.getElementById('askmark-input');
  const sendBtn = document.getElementById('askmark-send');
  if (!inputEl || _sending) return;
  const question = inputEl.value.trim();
  if (!question) { inputEl.focus(); return; }
  const thread = activeThread();
  if (!thread) return;

  _sending = true;
  if (sendBtn) sendBtn.disabled = true;
  inputEl.value = '';
  if (!thread.titled) {
    thread.title = question.length > 42 ? question.slice(0, 42) + '…' : question;
    thread.titled = true;
  }
  thread.msgs.push({ role: 'me', text: question });
  repaintChatArea();

  try {
    const reasons   = getReasonsByDept(_dept.id);
    const comments  = gatherDeptComments(_dept);
    const kzRecords = await loadKzRecords();
    const responses = getResponsesByDept(_dept.id);
    const messages  = toApiMessages(thread.msgs);
    const reply = await liveReply(_dept.id, 'ask', { dept: _dept, question, reasons, comments, kzRecords, responses, messages });
    thread.msgs.push({ role: 'mark', text: reply });
  } catch (e) {
    console.warn('Ask Mark: liveReply failed', e);
    thread.msgs.push({ role: 'mark', text: 'Sorry — I hit an error pulling that context together. Try asking again.' });
  }

  _sending = false;
  repaintChatArea();
  const freshInput = document.getElementById('askmark-input');
  if (freshInput) freshInput.focus();
}

// ─── Modal open/close ────────────────────────────────────────────────────────

function onModalKeydown(e) {
  if (e.key === 'Escape') closeModal();
}

function paintModalRoot() {
  const root = document.getElementById('askmark-modal-root');
  if (!root) return;
  root.innerHTML = _modalKpiId ? renderResponseModal() : '';
  document.removeEventListener('keydown', onModalKeydown);
  if (_modalKpiId) {
    bindModal();
    document.addEventListener('keydown', onModalKeydown);
  }
}

function openModal(kpiId) {
  _modalKpiId = kpiId;
  _modalEditing = false;
  paintModalRoot();
}

function closeModal() {
  _modalKpiId = null;
  _modalEditing = false;
  paintModalRoot();
}

// ─── Bind ────────────────────────────────────────────────────────────────────

function bindModal() {
  const root = document.getElementById('askmark-modal-root');
  const kpiId = _modalKpiId;
  if (!root || !kpiId) return;

  root.querySelectorAll('[data-modal-close]').forEach((b) => b.addEventListener('click', closeModal));

  const editBtn = root.querySelector('#rc-edit');
  if (editBtn) editBtn.addEventListener('click', () => { _modalEditing = true; paintModalRoot(); });

  const causeEl  = root.querySelector('#rc-cause');
  const actionEl = root.querySelector('#rc-action');
  const reportEl = root.querySelector('#rc-report');
  if (causeEl)  causeEl.addEventListener('input',  () => setDraft(kpiId, 'cause', causeEl.value));
  if (actionEl) actionEl.addEventListener('input', () => setDraft(kpiId, 'action', actionEl.value));
  if (reportEl) reportEl.addEventListener('input', () => setDraft(kpiId, 'reportBackWhen', reportEl.value));

  const toggle = root.querySelector('#rc-needs8');
  if (toggle) {
    toggle.querySelectorAll('.seg__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const yes = btn.dataset.val === 'yes';
        setDraft(kpiId, 'needs8Step', yes);
        toggle.querySelectorAll('.seg__item').forEach((b) => b.classList.toggle('is-on', b === btn));
        const note = root.querySelector('#rc-esc-note');
        if (note) note.style.display = yes ? '' : 'none';
      });
    });
  }

  const draftBtn = root.querySelector('#rc-draft');
  if (draftBtn) draftBtn.addEventListener('click', () => askMarkToDraft(kpiId));

  const submitBtn = root.querySelector('#rc-submit');
  if (submitBtn) submitBtn.addEventListener('click', () => submitResponse(kpiId));

  // Read-back state only: escalates an already-answered "needs8Step: Yes"
  // response that hasn't opened its 8-step yet.
  const open8Btn = root.querySelector('#rc-open8step');
  if (open8Btn) open8Btn.addEventListener('click', () => openEightStepForKpi(open8Btn.dataset.kpiId));
}

function bindChatComposer() {
  const sendBtn = document.getElementById('askmark-send');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  const inputEl = document.getElementById('askmark-input');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }
}

function bindThreadItems() {
  const list = document.getElementById('askmark-threads-list');
  if (!list) return;
  list.querySelectorAll('[data-thread-id]').forEach((btn) => {
    btn.addEventListener('click', () => switchThread(btn.dataset.threadId));
  });
}

function attachHandlers() {
  _mount.querySelectorAll('[data-open-response]').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.kpiId));
  });
  const newChatBtn = document.getElementById('new-chat');
  if (newChatBtn) newChatBtn.addEventListener('click', handleNewChat);
  bindChatComposer();
  bindThreadItems();
}

// ─── Main render ──────────────────────────────────────────────────────────────

function doRender() {
  _queue = redKpisNeedingResponse(_dept);
  const rollup = rollupSignal(_dept.id);
  // If the modal's KPI is no longer resolvable at all (no KPI definition and
  // no persisted response), drop it rather than render a broken modal.
  if (_modalKpiId && !modalItemFor(_modalKpiId)) { _modalKpiId = null; _modalEditing = false; }

  const answeredCount   = _queue.filter((it) =>
    !!(getResponse({ deptId: _dept.id, kpiId: it.kpiId }) || {}).answered).length;
  const unansweredCount = _queue.length - answeredCount;

  _mount.innerHTML = `
    ${renderPageHead(_dept, unansweredCount, answeredCount, rollup)}
    <div class="chat" style="grid-template-columns: minmax(260px, 34fr) 66fr">
      <div>${renderLeftColumn(_dept, _queue)}</div>
      <div id="askmark-chat-host">${renderChatCard(activeThread())}</div>
    </div>
    <div id="askmark-modal-root">${_modalKpiId ? renderResponseModal() : ''}</div>`;

  attachHandlers();
  document.removeEventListener('keydown', onModalKeydown);
  if (_modalKpiId) {
    bindModal();
    document.addEventListener('keydown', onModalKeydown);
  }
  scrollThreadToBottom();
}

// Reads `respond=<kpiId>` off the current hash (app.js's routing docstring
// reserves this param for exactly this — opening the Ask Mark response
// modal for a KPI via a deep link, e.g. from Overview or an inbox item).
function parseRespondParam() {
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  return new URLSearchParams(hashQuery).get('respond');
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderAskMark(dept, mount, session)
 * @param {object} dept    — department data object (from data/<id>.json)
 * @param {Element} mount  — DOM element to render into (#view-mount)
 * @param {object} session — { deptId, role, persona }
 */
export function renderAskMark(dept, mount, session) {
  _dept = dept;
  _mount = mount;
  _session = session;
  _sending = false;
  _submitting = false;
  _drafts = {};              // reset unsubmitted drafts per render (also guards against
                              // any stale cross-dept draft surviving a dept switch)
  _threads = [newThread()];  // fresh session-scoped chat state — never persisted (mirrors
  _activeThreadId = _threads[0].id; // the old single-`_thread`'s reset-per-mount behavior)
  _modalKpiId = null;
  _modalEditing = false;

  const respondKpiId = parseRespondParam();
  if (respondKpiId) {
    const queue = redKpisNeedingResponse(dept);
    const inQueue = queue.some((q) => q.kpiId === respondKpiId);
    const hasResp = !!getResponse({ deptId: dept.id, kpiId: respondKpiId });
    if (inQueue || hasResp) _modalKpiId = respondKpiId;
  }

  doRender();
}
