/**
 * views/askmark.js — Ask Mark full-page workspace
 *
 * renderAskMark(dept, mount, session)
 *
 * Mark is promoted from a topbar drawer (still present — `assistant-btn` in
 * app.js — and left untouched) to a full nav destination: `#/dept/:id/mark`.
 * Two-pane workspace:
 *
 *   Left  (~38%) — "⚠ Action required" queue: one card per red KPI awaiting
 *                  an owner response (lib/accountability.js
 *                  redKpisNeedingResponse), plus a "Recent threads" stub.
 *   Right (~62%) — chat surface: an in-view message thread + composer. Send
 *                  appends the human turn, awaits a context-grounded scripted
 *                  reply from lib/agent.js liveReply() (built off this dept's
 *                  live buildDeptContext — no network), and appends Mark's
 *                  turn. History persists for the life of this view (reset
 *                  on next renderAskMark(), e.g. navigating away and back).
 *
 * Header pill math: BOTH pills are computed off the LIVE red queue —
 * redKpisNeedingResponse(dept) — split by whether each item already has a
 * submitted response (getResponse(...).answered):
 *   "N action required" — live reds with NO response yet.
 *   "M being actioned"  — live reds that DO have a response (still red on
 *                         the board, but an owner has answered).
 * Neither pill reads rollupSignal(deptId) counts: rollupSignal summarizes
 * *persisted* accountability entries, which can include ones that have since
 * recovered off the live board, or that haven't yet reached the
 * 'actionUnderway' stage rollupSignal's own beingActioned count requires —
 * using it for the headline pills risked an answered-but-not-yet-underway
 * red not moving out of "action required" the moment it's submitted.
 * rollupSignal's stalled count is still useful and is surfaced as a
 * supporting line under the pills.
 *
 * Selecting a queue card renders the 4-field response card (spec §5.2) above
 * the chat: an UNANSWERED red gets the fillable form (cause pre-drafted by
 * Mark via composeMarkNote, editable action / needs-8-step toggle / report-
 * back), an already-ANSWERED red (getResponse(...).answered) gets a read-back
 * of the submitted response. Both states render the lifecycle chip track
 * (spec §5.3) via lifecycleView() — pre-response, a local pseudo-entry with
 * only 'detected' marked done stands in, since detection isn't persisted
 * until an owner responds (see lib/accountability.js module header). Submit
 * → addResponse() + advanceLifecycle('responded'), then a full doRender() so
 * the queue card, header pills, and lifecycle track all update together.
 *
 * Escalation (Task 7): when field 3 = Yes, the submit path also resolves a
 * KZ (8-step) for the KPI — reusing an EXISTING open KZ already linked to
 * it (data/kz-records.json's linkedKpiId, e.g. otp_mexico -> KZ-346) or
 * minting a fresh one via lib/eightstep.js newKZ() — then calls
 * lib/accountability.js linkEightStep() to store the kzNumber and advance
 * the lifecycle to 'eightStepOpened'. The same linkEightStep() path also
 * backs an "Open 8-step" action on an already-ANSWERED card whose
 * needs8Step is Yes but hasn't escalated yet (e.g. the seeded OTP-Mexico
 * entry, which deliberately ships with a kzNumber but eightStepOpened left
 * pending). Once opened, the card renders a real deep-link to
 * #/dept/:id/solve?kpi=<id>&kz=<kzNumber> — the R3 handoff route
 * (renderProblemSolving) extended to also carry the resolved KZ number, so
 * the handoff opens the REAL linked KZ record (read-view if it's a
 * completed A3, the wizard pre-positioned on its next open step otherwise)
 * instead of always minting a fresh blank 8-step for the KPI.
 */

import {
  redKpisNeedingResponse, rollupSignal, getResponse, addResponse,
  advanceLifecycle, lifecycleView, linkEightStep,
} from '../lib/accountability.js';
import { liveReply }                    from '../lib/agent.js';
import { getReasonsByDept }             from '../lib/reasons.js';
import { getComments, composeMarkNote } from '../lib/comments.js';
import { newKZ }                        from '../lib/eightstep.js';

// ─── State (module-level, reset each render — mirrors problemsolving.js) ────
let _dept          = null;
let _mount         = null;
let _session       = null;
let _queue         = [];
let _selectedKpiId = null;
let _thread        = [];    // in-view chat history: [{ role: 'me'|'mark', text }]
let _sending       = false; // guards double-send while a reply is in flight
let _submitting    = false; // guards double-submit on the response card (mirrors _sending) —
                             // addResponse() + the needs8 escalation path both run before the
                             // re-render that removes the Submit button, so a fast double-click
                             // could otherwise persist two entries (double-counting
                             // rollupSignal.redCount)
let _kzRecordsCache = null; // lazy-loaded data/kz-records.json, shared across sends
let _drafts        = {};    // in-progress (unsubmitted) response-card edits, keyed by
                             // `${deptId}:${kpiId}` (draftKey) — NOT bare kpiId: KPI ids
                             // collide across departments (e.g. credits_remakes, rev_total
                             // exist in both service.json and sales.json), so a bare key
                             // would leak one dept's draft into another's card. Each value:
                             // { cause, action, needs8Step, reportBackWhen }. Cleared per KPI
                             // once addResponse() persists it, reset entirely on renderAskMark().

// Field-1 prompt (spec §5.2) — Mark adapts what "what's driving the red?"
// means per department. Generic fallback covers depts not called out in the
// spec table (sales, finance, it, logistics, odg).
const CAUSE_PROMPT_BY_DEPT = {
  operations: 'which location / which standard-work step',
  service:    'which reps & accounts',
  marketing:  'which channel',
  hr:         'incident vs data-entry artifact',
};
function causePromptFor(deptId) {
  return CAUSE_PROMPT_BY_DEPT[deptId] || 'what specifically is driving this';
}

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

// Short "Mon D" date, same regex-on-ISO approach as lib/comments.js shortTs().
function formatDueDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[+m[2] - 1]} ${+m[3]}`;
}

function findKpi(dept, kpiId) {
  return (dept.kpis || []).find((k) => k.id === kpiId) || null;
}

// Attribution for the human side of the chat — signed-in persona when known,
// falling back to a generic "You" (same fallback comment threads use).
function humanLabel() {
  return (_session && _session.persona && _session.persona.name) || 'You';
}
function humanInitials(name) {
  return String(name || 'Y').split(/[\s/—-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'Y';
}

// ─── Header ──────────────────────────────────────────────────────────────────

function renderHeader(dept, unansweredCount, answeredCount, rollup) {
  return `
    <div class="mk-header">
      <div class="mk-header__ident">
        <div class="mk-avatar">M</div>
        <div>
          <div class="mk-header__name">Mark</div>
          <div class="mk-header__role">AI Employee · ${esc(dept.name)}</div>
        </div>
      </div>
      <div class="mk-header__stats">
        <div class="mk-header__pills">
          <span class="mk-pill mk-pill--red">${unansweredCount} action required</span>
          <span class="mk-pill mk-pill--amber">${answeredCount} being actioned</span>
        </div>
        <span class="mk-header__rollup">${rollup.stalled} stalled · ${rollup.answered} response${rollup.answered === 1 ? '' : 's'} logged</span>
      </div>
    </div>`;
}

// ─── Left column: red-KPI queue ─────────────────────────────────────────────

function renderQueueCard(item, dept) {
  const kpi      = findKpi(dept, item.kpiId);
  const actual   = kpi ? formatVal(kpi.actual, kpi.unit) : '—';
  const target   = kpi ? formatVal(kpi.target, kpi.unit) : '—';
  const resp     = getResponse({ deptId: dept.id, kpiId: item.kpiId });
  const answered = !!(resp && resp.answered);
  const isActive = _selectedKpiId === item.kpiId;

  return `
    <button type="button" class="mk-qcard${isActive ? ' mk-qcard--active' : ''}" data-kpi-id="${esc(item.kpiId)}">
      <div class="mk-qcard__top">
        <span class="mk-qcard__name">${esc(item.kpi)}</span>
        ${ragChip(item.rag)}
      </div>
      <div class="mk-qcard__metric">
        <span class="text-mono">${actual}</span>
        <span class="mk-qcard__vs">vs target</span>
        <span class="text-mono mk-qcard__target">${target}</span>
      </div>
      <div class="mk-qcard__meta">
        <span class="mk-qcard__due">Due ${formatDueDate(item.dueDate)}</span>
        <span class="mk-qcard__answered mk-qcard__answered--${answered ? 'yes' : 'no'}">
          ${answered ? '✓ Answered' : '○ Not yet answered'}
        </span>
      </div>
      <div class="mk-qcard__owner">Owner: ${esc(item.owner || 'Unassigned')}</div>
    </button>`;
}

function renderQueueColumn(dept, queue) {
  // Split so each group's header count matches exactly the cards listed under
  // it (spec §5: unanswered reds need action; answered-but-still-red are being
  // actioned).
  const unanswered = [];
  const answered   = [];
  for (const item of queue) {
    const resp = getResponse({ deptId: dept.id, kpiId: item.kpiId });
    (resp && resp.answered ? answered : unanswered).push(item);
  }
  const cardsFor = (items) => items.map((item) => renderQueueCard(item, dept)).join('');

  const actionSection = `
    <div class="mk-queue-head mk-queue-head--red">
      <span class="mk-queue-head__icon">⚠</span> Action required
      <span class="mk-queue-head__count">${unanswered.length}</span>
    </div>
    <div class="mk-queue-list">${
      unanswered.length
        ? cardsFor(unanswered)
        : `<div class="mk-empty">No unanswered reds — every red has a response.</div>`
    }</div>`;

  const actionedSection = answered.length ? `
    <div class="mk-queue-head mk-queue-head--green mk-queue-head--spaced">
      <span class="mk-queue-head__icon">✓</span> Being actioned
      <span class="mk-queue-head__count mk-queue-head__count--green">${answered.length}</span>
    </div>
    <div class="mk-queue-list">${cardsFor(answered)}</div>` : '';

  return `
    ${actionSection}
    ${actionedSection}

    <div class="mk-threads">
      <div class="mk-threads__head">Recent threads</div>
      <div class="mk-empty mk-empty--small">No prior Ask Mark threads yet — conversations you start here will show up as a history.</div>
    </div>`;
}

// ─── Right column: chat surface ─────────────────────────────────────────────

// One chat turn, styled with the same .cmt / .cmt__avatar classes as the
// per-KPI comment threads (lib/comments.js) so Mark reads as one consistent
// voice across the app — "M" accent avatar, gradient background.
function renderChatMessage(msg) {
  const isMark  = msg.role === 'mark';
  const avatar  = isMark ? 'M' : humanInitials(humanLabel());
  const author  = isMark ? 'Mark · AI Employee' : humanLabel();
  return `
    <div class="cmt cmt--${isMark ? 'ai' : 'human'}">
      <span class="cmt__avatar cmt__avatar--${isMark ? 'ai' : 'human'}">${esc(avatar)}</span>
      <div class="cmt__body">
        <div class="cmt__meta"><span class="cmt__author">${esc(author)}</span></div>
        <div class="cmt__text">${esc(msg.text)}</div>
      </div>
    </div>`;
}

function renderThreadBody(item) {
  if (!_thread.length) {
    const emptyLabel = item
      ? `Ask Mark anything about ${esc(item.kpi)} — or fill the response card above.`
      : 'Ask Mark about this board…';
    return `<div class="mk-chat__empty">${emptyLabel}</div>`;
  }
  return _thread.map(renderChatMessage).join('');
}

function renderChatColumn(selectedItem) {
  return `
    <div class="mk-chat">
      <div class="mk-chat__thread" id="askmark-thread">${renderThreadBody(selectedItem)}</div>
      <div class="mk-chat__composer">
        <textarea id="askmark-input" rows="3" placeholder="Ask Mark about this board…"></textarea>
        <button type="button" class="btn btn--primary" id="askmark-send">Send</button>
      </div>
    </div>`;
}

// ─── Right column: the red-KPI response card (spec §5.2 + §5.3) ──────────────

// The lifecycle chip track (spec §5.3). Fed a real persisted entry once one
// exists; before a response, a pseudo-entry with only 'detected' done stands
// in (detection isn't persisted until an owner responds — see
// lib/accountability.js module header). lifecycleView() flags done/current.
function renderLifecycleTrack(entry) {
  const stages = lifecycleView(entry);
  const chips = stages.map((s) => {
    const state = s.done ? 'done' : (s.current ? 'current' : 'todo');
    const glyph = s.done ? '✓' : (s.current ? '→' : '○');
    return `<span class="mk-lc__chip mk-lc__chip--${state}"><span class="mk-lc__glyph">${glyph}</span>${esc(s.label)}</span>`;
  }).join('<span class="mk-lc__sep">›</span>');
  return `
    <div class="mk-lc">
      <div class="mk-lc__label">Response lifecycle</div>
      <div class="mk-lc__track">${chips}</div>
    </div>`;
}

// Read-back of an already-submitted response (all persisted, user-entered text
// escaped). needs8Step = Yes renders one of three states: a deep-link once
// the 8-step is actually opened (lifecycle.eightStepOpened.done), an
// explicit "Open 8-step" action when a KZ is linked/linkable but escalation
// hasn't happened yet (e.g. the seeded OTP entry — kzNumber present,
// eightStepOpened deliberately left pending), or plain "Yes" text as a last
// resort (no entry at all — shouldn't happen via the current submit flow,
// but keeps old/malformed entries from rendering a dead control).
function renderReadBack(resp) {
  const opened = !!(resp.lifecycle && resp.lifecycle.eightStepOpened && resp.lifecycle.eightStepOpened.done);
  let eightStep;
  if (!resp.needs8Step) {
    eightStep = 'No — one-off / data artifact';
  } else if (opened && resp.kzNumber) {
    eightStep = `Yes — <a class="mk-rc__kz-link" href="#/dept/${esc(resp.deptId)}/solve?kpi=${esc(resp.kpiId)}&kz=${esc(resp.kzNumber)}">`
      + `▸ Open ${esc(resp.kzNumber)} in Problem-Solving →</a>`;
  } else {
    eightStep = 'Yes — <button type="button" class="btn btn--outline btn--sm mk-rc__open8step" '
      + `id="mk-rc-open8step" data-kpi-id="${esc(resp.kpiId)}">▸ Open 8-step →</button>`;
  }
  const field = (label, value) =>
    `<div class="mk-rc__ro-field"><dt>${label}</dt><dd>${value}</dd></div>`;
  return `
    <div class="mk-rc__answered-tag">✓ Response submitted${resp.owner ? ` · ${esc(resp.owner)}` : ''}</div>
    <dl class="mk-rc__readback">
      ${field("What's driving the red?", esc(resp.cause) || '—')}
      ${field('What are you doing about it?', esc(resp.action) || '—')}
      ${field('Needs an 8-step?', eightStep)}
      ${field('When will you report back?', esc(resp.reportBackWhen) || '—')}
    </dl>`;
}

// The fillable 4-field form for an unanswered red. Field 1 pre-drafts from
// Mark's grounded read (composeMarkNote) unless the owner already edited it
// (persisted in _drafts). needs8Step defaults to No.
function renderResponseForm(item, kpi) {
  const draft   = getDraft(item.kpiId);
  const cause   = draft.cause != null ? draft.cause : composeMarkNote(kpi || {}, item.rag);
  const action  = draft.action != null ? draft.action : '';
  const needs8  = draft.needs8Step != null ? draft.needs8Step : false;
  const report  = draft.reportBackWhen != null ? draft.reportBackWhen : '';
  const prompt  = causePromptFor(_dept.id);

  return `
    <div class="mk-rc__form">
      <div class="mk-rc__field-group">
        <div class="mk-rc__label">What's driving the red? <span class="mk-rc__hint">${esc(prompt)}</span></div>
        <textarea class="mk-rc__input" id="mk-rc-cause" rows="4">${esc(cause)}</textarea>
        <button type="button" class="btn btn--outline btn--sm mk-rc__draft" id="mk-rc-draft">✦ Ask Mark to draft it</button>
        <span class="mk-rc__draft-note">Mark pre-fills this from the KPI's grounded read.</span>
      </div>

      <div class="mk-rc__field-group">
        <div class="mk-rc__label">What are you doing about it?</div>
        <textarea class="mk-rc__input" id="mk-rc-action" rows="3" placeholder="The action you're taking…">${esc(action)}</textarea>
      </div>

      <div class="mk-rc__field-group">
        <div class="mk-rc__label">Does this need an 8-step?</div>
        <div class="mk-rc__toggle" id="mk-rc-needs8">
          <button type="button" class="mk-rc__toggle-btn${needs8 ? ' mk-rc__toggle-btn--active' : ''}" data-val="yes">Yes</button>
          <button type="button" class="mk-rc__toggle-btn${!needs8 ? ' mk-rc__toggle-btn--active' : ''}" data-val="no">No</button>
        </div>
        <div class="mk-rc__esc-note" id="mk-rc-esc-note"${needs8 ? '' : ' style="display:none"'}>
          Submitting will link or open a KZ (8-step) for this KPI.
        </div>
      </div>

      <div class="mk-rc__field-group">
        <div class="mk-rc__label">When will you report back?</div>
        <input type="text" class="mk-rc__input mk-rc__input--sm" id="mk-rc-report" placeholder="e.g. Next T3 review, or a date" value="${esc(report)}">
      </div>

      <div class="mk-rc__actions">
        <button type="button" class="btn btn--primary" id="mk-rc-submit">Submit response</button>
      </div>
    </div>`;
}

// The full response card: header (KPI/RAG/actual-vs-target/due/owner), the
// lifecycle track, then either a read-back (answered) or the form (unanswered).
function renderResponseCard(item) {
  if (!item) {
    return `
      <div class="mk-rc mk-rc--empty">
        <span class="mk-rc__empty-icon">◇</span>
        <span>Select a red from the queue to open its response card.</span>
      </div>`;
  }
  const kpi      = findKpi(_dept, item.kpiId);
  const actual   = kpi ? formatVal(kpi.actual, kpi.unit) : '—';
  const target   = kpi ? formatVal(kpi.target, kpi.unit) : '—';
  const resp     = getResponse({ deptId: _dept.id, kpiId: item.kpiId });
  const answered = !!(resp && resp.answered);
  const trackEntry = answered ? resp : { lifecycle: { detected: { done: true, ts: null } } };

  return `
    <div class="mk-rc${answered ? ' mk-rc--answered' : ''}" data-rc-kpi="${esc(item.kpiId)}">
      <div class="mk-rc__head">
        <div class="mk-rc__head-top">
          <span class="mk-rc__kpi">${esc(item.kpi)}</span>
          ${ragChip(item.rag)}
        </div>
        <div class="mk-rc__meta">
          <span class="text-mono mk-rc__actual">${actual}</span>
          <span class="mk-rc__vs">vs</span>
          <span class="text-mono mk-rc__target">${target}</span>
          <span class="mk-rc__sep-dot">·</span>
          <span>Due ${formatDueDate(item.dueDate)}</span>
          <span class="mk-rc__sep-dot">·</span>
          <span>Owner: ${esc(item.owner || 'Unassigned')}</span>
        </div>
      </div>
      ${renderLifecycleTrack(trackEntry)}
      ${answered ? renderReadBack(resp) : renderResponseForm(item, kpi)}
    </div>`;
}

function renderRightColumn(selectedItem) {
  return `
    <div class="mk-rc-wrap" id="askmark-response-card">${renderResponseCard(selectedItem)}</div>
    ${renderChatColumn(selectedItem)}`;
}

function scrollThreadToBottom(threadEl) {
  if (threadEl) threadEl.scrollTop = threadEl.scrollHeight;
}

function currentSelectedItem() {
  return _selectedKpiId ? (_queue.find((q) => q.kpiId === _selectedKpiId) || null) : null;
}

function repaintThread() {
  const threadEl = document.getElementById('askmark-thread');
  if (!threadEl) return;
  threadEl.innerHTML = renderThreadBody(currentSelectedItem());
  scrollThreadToBottom(threadEl);
}

// Re-render only the response-card region (keeps the composer's in-progress
// text intact — that lives in a separate, un-touched textarea).
function repaintResponseCard() {
  const el = document.getElementById('askmark-response-card');
  if (el) el.innerHTML = renderResponseCard(currentSelectedItem());
}

// ─── Response-card state + handlers ─────────────────────────────────────────

// Draft keys are dept-scoped (see _drafts note) so colliding KPI ids across
// departments can't share a draft.
function draftKey(kpiId) { return `${_dept.id}:${kpiId}`; }
function getDraft(kpiId) { return _drafts[draftKey(kpiId)] || {}; }
function setDraft(kpiId, key, val) {
  const k = draftKey(kpiId);
  _drafts[k] = _drafts[k] || {};
  _drafts[k][key] = val;
}

// Mark (re)drafts field 1 from the KPI's grounded read (composeMarkNote), and
// suggests field 2 only when it's still empty — the "answer via Mark" mode.
function askMarkToDraft(kpiId) {
  const item = _queue.find((q) => q.kpiId === kpiId);
  if (!item) return;
  const kpi   = findKpi(_dept, kpiId);
  const cause = composeMarkNote(kpi || {}, item.rag);
  const wrap  = document.getElementById('askmark-response-card');
  const causeEl  = wrap && wrap.querySelector('#mk-rc-cause');
  const actionEl = wrap && wrap.querySelector('#mk-rc-action');

  if (causeEl) causeEl.value = cause;
  setDraft(kpiId, 'cause', cause);

  if (actionEl && !actionEl.value.trim()) {
    const suggestion = `Confirming ${causePromptFor(_dept.id)} with the owning team, then correcting the standard work. I'll open an 8-step if the cause needs structured problem-solving.`;
    actionEl.value = suggestion;
    setDraft(kpiId, 'action', suggestion);
  }
}

// Escalation (Task 7): given field 3 = Yes, pick the KZ this response should
// link to. Prefers an EXISTING open KZ already tagged to this KPI —
// data/kz-records.json's linkedKpiId (e.g. otp_mexico → KZ-346, still
// open) — so escalating a KPI that's already being worked doesn't spawn a
// duplicate 8-step. Only mints a fresh KZ (lib/eightstep.js newKZ, then a
// unique kzNumber — timestamp-based, so it can never collide with a real
// KZ-### from the data file) when no open KZ is linked yet. Synchronous:
// callers must await loadKzRecords() first so _kzRecordsCache is populated.
function resolveKzNumber(kpiId, owner) {
  const records = _kzRecordsCache || [];
  const existingOpen = records.find(
    (r) => r.deptId === _dept.id && r.linkedKpiId === kpiId && !r.closed);
  if (existingOpen) return existingOpen.kzNumber;

  const kpi = findKpi(_dept, kpiId);
  const kz  = newKZ({ item: (kpi && kpi.name) || kpiId, who: owner || _dept.lead || '', deptId: _dept.id });
  kz.kzNumber = 'KZ-NEW-' + Date.now().toString(36).toUpperCase();
  return kz.kzNumber;
}

// Submit the 4 fields → persist + advance the lifecycle to 'responded', then
// (field 3 = Yes) resolve+link a KZ and advance to 'eightStepOpened' too,
// then a full re-render so the queue card flips to ✓, the header pills
// re-split, and the card swaps to its read-back + advanced track.
async function submitResponse(kpiId) {
  if (_submitting) return; // ignore re-entrant clicks until doRender() repaints the card
  const wrap = document.getElementById('askmark-response-card');
  const item = _queue.find((q) => q.kpiId === kpiId);
  if (!wrap || !item) return;

  const causeEl  = wrap.querySelector('#mk-rc-cause');
  const actionEl = wrap.querySelector('#mk-rc-action');
  const reportEl = wrap.querySelector('#mk-rc-report');
  const yesBtn   = wrap.querySelector('.mk-rc__toggle-btn[data-val="yes"]');
  const needs8   = !!(yesBtn && yesBtn.classList.contains('mk-rc__toggle-btn--active'));

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
  const submitBtn = wrap.querySelector('#mk-rc-submit');
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

  // Mark posts a confirmation (spec §5.2) into the running chat thread.
  _thread.push({
    role: 'mark',
    text: needs8
      ? `Logged your response on ${item.kpi} and opened ${kzNumber} for it — head to Problem-Solving to work the 8-step. I'll roll "being actioned" up to the Leadership OS too.`
      : `Logged your response on ${item.kpi}. I'll roll "being actioned" up to the Leadership OS so the Chief of Staff sees this red is being worked.`,
  });

  _submitting = false;
  doRender();
}

// Escalate an ALREADY-answered response whose needs8Step is Yes but hasn't
// opened its 8-step yet (the read-back's "▸ Open 8-step →" button — e.g. the
// seeded OTP entry, which ships with a kzNumber but eightStepOpened left
// pending on purpose). Reuses the entry's own kzNumber if it already has one
// (don't spawn a second KZ for a response that's already linked); otherwise
// resolves one the same way the submit path does.
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
  _thread.push({
    role: 'mark',
    text: `Opened ${kzNumber} for ${(kpi && kpi.name) || kpiId} — head to Problem-Solving to work the 8-step.`,
  });

  doRender();
}

// (Re)bind the controls inside the response card. Called after every card
// (re)paint, so listeners are always fresh against the current DOM.
function bindResponseCard() {
  const wrap  = document.getElementById('askmark-response-card');
  const kpiId = _selectedKpiId;
  if (!wrap || !kpiId) return;

  const causeEl  = wrap.querySelector('#mk-rc-cause');
  const actionEl = wrap.querySelector('#mk-rc-action');
  const reportEl = wrap.querySelector('#mk-rc-report');
  if (causeEl)  causeEl.addEventListener('input',  () => setDraft(kpiId, 'cause', causeEl.value));
  if (actionEl) actionEl.addEventListener('input', () => setDraft(kpiId, 'action', actionEl.value));
  if (reportEl) reportEl.addEventListener('input', () => setDraft(kpiId, 'reportBackWhen', reportEl.value));

  const toggle = wrap.querySelector('#mk-rc-needs8');
  if (toggle) {
    toggle.querySelectorAll('.mk-rc__toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const yes = btn.dataset.val === 'yes';
        setDraft(kpiId, 'needs8Step', yes);
        toggle.querySelectorAll('.mk-rc__toggle-btn').forEach((b) =>
          b.classList.toggle('mk-rc__toggle-btn--active', b === btn));
        const note = wrap.querySelector('#mk-rc-esc-note');
        if (note) note.style.display = yes ? '' : 'none';
      });
    });
  }

  const draftBtn = wrap.querySelector('#mk-rc-draft');
  if (draftBtn) draftBtn.addEventListener('click', () => askMarkToDraft(kpiId));

  const submitBtn = wrap.querySelector('#mk-rc-submit');
  if (submitBtn) submitBtn.addEventListener('click', () => submitResponse(kpiId));

  // Read-back state only: escalates an already-answered "needs8Step: Yes"
  // response that hasn't opened its 8-step yet (see openEightStepForKpi).
  const open8Btn = wrap.querySelector('#mk-rc-open8step');
  if (open8Btn) open8Btn.addEventListener('click', () => openEightStepForKpi(open8Btn.dataset.kpiId));
}

// ─── Send: gather live context, get a grounded reply, grow the thread ───────

// data/kz-records.json holds every department's 8-step records; fetched once
// and cached module-wide (buildDeptContext filters to this dept internally),
// mirroring the lazy-load pattern in views/problemsolving.js.
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

async function sendMessage() {
  const inputEl = document.getElementById('askmark-input');
  const sendBtn = document.getElementById('askmark-send');
  if (!inputEl || _sending) return;
  const question = inputEl.value.trim();
  if (!question) { inputEl.focus(); return; }

  // Entry mode: "answer in chat → Mark fills the card" (brief §"Two entry
  // modes"). When an UNANSWERED response card is open, a chat message is
  // treated as the owner *stating the cause*: it drops into Field 1's draft
  // and Mark acknowledges — the owner then edits/submits on the card as
  // normal. This is the honest Phase-1 version: NO prose-parsing, the whole
  // message becomes the cause verbatim. Richer prose → multi-field extraction
  // (splitting a paragraph into cause/action/8-step/report-back) is deferred
  // to the live-SDK phase (Task 12). With no card selected, chat is unchanged.
  const selected = currentSelectedItem();
  if (selected) {
    const resp = getResponse({ deptId: _dept.id, kpiId: selected.kpiId });
    if (!(resp && resp.answered)) {
      inputEl.value = '';
      _thread.push({ role: 'me', text: question });
      setDraft(selected.kpiId, 'cause', question);
      const causeEl = document.getElementById('mk-rc-cause');
      if (causeEl) causeEl.value = question;
      _thread.push({
        role: 'mark',
        text: "Got it — I've dropped that into your response draft (Field 1: what's driving the red). Review and submit when you're ready.",
      });
      repaintThread();
      inputEl.focus();
      return;
    }
  }

  _sending = true;
  if (sendBtn) sendBtn.disabled = true;
  inputEl.value = '';
  _thread.push({ role: 'me', text: question });
  repaintThread();

  try {
    const reasons   = getReasonsByDept(_dept.id);
    const comments  = gatherDeptComments(_dept);
    const kzRecords = await loadKzRecords();
    const reply = await liveReply(_dept.id, 'ask', { dept: _dept, question, reasons, comments, kzRecords });
    _thread.push({ role: 'mark', text: reply });
  } catch (e) {
    console.warn('Ask Mark: liveReply failed', e);
    _thread.push({ role: 'mark', text: 'Sorry — I hit an error pulling that context together. Try asking again.' });
  }

  _sending = false;
  if (sendBtn) sendBtn.disabled = false;
  repaintThread();
  if (inputEl) inputEl.focus();
}

// ─── Main render ──────────────────────────────────────────────────────────────

function doRender() {
  _queue = redKpisNeedingResponse(_dept);
  const rollup       = rollupSignal(_dept.id);
  const selectedItem = _selectedKpiId ? _queue.find((q) => q.kpiId === _selectedKpiId) || null : null;
  if (!selectedItem) _selectedKpiId = null; // selection no longer on the live board (e.g. it recovered)

  // Split the live red queue by whether each already carries a submitted
  // response (spec: "action required" = unanswered reds only; "being
  // actioned" = answered-but-still-red).
  const answeredCount   = _queue.filter((it) =>
    !!(getResponse({ deptId: _dept.id, kpiId: it.kpiId }) || {}).answered).length;
  const unansweredCount = _queue.length - answeredCount;

  _mount.innerHTML = `
    <div class="askmark-view">
      ${renderHeader(_dept, unansweredCount, answeredCount, rollup)}
      <div class="askmark-grid">
        <div class="askmark-col askmark-col--queue">${renderQueueColumn(_dept, _queue)}</div>
        <div class="askmark-col askmark-col--chat">${renderRightColumn(selectedItem)}</div>
      </div>
    </div>`;

  attachHandlers();
}

function attachHandlers() {
  const cards = Array.from(_mount.querySelectorAll('.mk-qcard'));
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const kpiId = card.dataset.kpiId;
      _selectedKpiId = kpiId;
      cards.forEach((c) => c.classList.toggle('mk-qcard--active', c === card));
      // Targeted repaint (not a full doRender) so the composer's in-progress
      // text survives selecting a different queue card.
      repaintResponseCard();
      bindResponseCard();
      repaintThread();

      // Seed (don't clobber) the composer with a starter question for this KPI.
      const item    = currentSelectedItem();
      const inputEl = document.getElementById('askmark-input');
      if (inputEl && item && !inputEl.value.trim()) {
        inputEl.value = `Why is ${item.kpi} red?`;
      }
    });
  });

  // Bind the response card on first paint too (a selection may already be set
  // after a submit-triggered doRender()).
  bindResponseCard();

  const sendBtn = document.getElementById('askmark-send');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);

  const inputEl = document.getElementById('askmark-input');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ASKMARK_STYLES = `
  .askmark-view { max-width: 1280px; }

  /* Header */
  .mk-header { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
    padding-bottom:16px; margin-bottom:18px; border-bottom:1px solid var(--line); }
  .mk-header__ident { display:flex; align-items:center; gap:12px; }
  .mk-avatar { width:40px; height:40px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-family:var(--font-mono); font-weight:700; font-size:1rem; color:#fff;
    background: linear-gradient(140deg, var(--accent), #6f4bff);
    box-shadow: 0 0 0 3px var(--accent-tint); }
  .mk-header__name { font-size:1.05rem; font-weight:700; color:var(--text); line-height:1.2; }
  .mk-header__role { font-size:0.7rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--accent); }
  .mk-header__stats { display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
  .mk-header__pills { display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
  .mk-pill { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; }
  .mk-pill--red { background: var(--red-bg); color: var(--red); border:1px solid rgba(217,45,58,.22); }
  .mk-pill--amber { background: var(--amber-bg); color: var(--amber); border:1px solid rgba(224,122,18,.22); }
  .mk-header__rollup { font-size:0.72rem; color: var(--text-muted); }

  /* Two-pane grid: ~38% queue / ~62% chat */
  .askmark-grid { display:grid; grid-template-columns: 38% 1fr; gap:22px; align-items:start; }
  @media (max-width: 900px) { .askmark-grid { grid-template-columns: 1fr; } }

  /* Queue column */
  .mk-queue-head { display:flex; align-items:center; gap:8px; font-size:0.76rem; font-weight:700;
    letter-spacing:0.05em; text-transform:uppercase; color: var(--red); margin-bottom:12px; }
  .mk-queue-head--green { color: var(--green); }
  .mk-queue-head--spaced { margin-top:22px; }
  .mk-queue-head__count { margin-left:auto; background: var(--red-bg); color: var(--red); border-radius:999px; padding:1px 9px; font-size:0.72rem; }
  .mk-queue-head__count--green { background: var(--green-bg); color: var(--green); }
  .mk-queue-list { display:flex; flex-direction:column; gap:10px; }

  .mk-qcard { display:block; width:100%; text-align:left; cursor:pointer; font-family:inherit;
    background: var(--surface); border:1px solid var(--line); border-left:3px solid var(--red);
    border-radius: var(--radius); padding:12px 14px;
    transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast); }
  .mk-qcard:hover { border-color: var(--red); box-shadow: var(--shadow-sm); }
  /* Compound selector so the active/selected state outranks both .mk-qcard:hover
     above AND the global button:hover rule (styles.css) — otherwise hovering an
     already-selected card would visually flash its highlight back to red/grey. */
  .mk-qcard.mk-qcard--active,
  .mk-qcard.mk-qcard--active:hover {
    background: var(--accent-tint); border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-tint-2);
  }
  .mk-qcard__top { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:7px; }
  .mk-qcard__name { font-weight:600; font-size:0.88rem; color:var(--text); }
  .mk-qcard__metric { display:flex; align-items:baseline; gap:6px; font-size:0.85rem; margin-bottom:7px; }
  .mk-qcard__vs { color:var(--text-muted); font-size:0.7rem; }
  .mk-qcard__target { color:var(--text-muted); }
  .mk-qcard__meta { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:0.72rem; color:var(--text-muted); margin-bottom:5px; }
  .mk-qcard__answered--yes { color: var(--green); font-weight:600; }
  .mk-qcard__answered--no { color: var(--red); font-weight:600; }
  .mk-qcard__owner { font-size:0.72rem; color:var(--text-muted); }

  .mk-empty { padding:14px; border:1px dashed var(--line-strong); border-radius: var(--radius);
    color:var(--text-muted); font-size:0.82rem; text-align:center; background: var(--surface-2); }
  .mk-empty--small { padding:10px; font-size:0.76rem; }

  .mk-threads { margin-top:24px; }
  .mk-threads__head { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-bottom:8px; }

  /* Right column stacks the response card above the chat */
  .askmark-col--chat { display:flex; flex-direction:column; gap:16px; }

  /* Response card (spec §5.2) */
  .mk-rc-wrap { display:block; }
  .mk-rc { background: var(--surface); border:1px solid var(--line); border-left:3px solid var(--red);
    border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding:16px 18px; }
  .mk-rc--answered { border-left-color: var(--green); }
  .mk-rc--empty { display:flex; align-items:center; gap:10px; justify-content:center; color:var(--text-muted);
    font-size:0.85rem; border-left-color: var(--line); border-style:dashed; background: var(--surface-2); padding:22px; }
  .mk-rc__empty-icon { font-size:1.1rem; color: var(--accent); }

  .mk-rc__head { border-bottom:1px solid var(--line); padding-bottom:12px; margin-bottom:12px; }
  .mk-rc__head-top { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
  .mk-rc__kpi { font-size:1rem; font-weight:700; color:var(--text); }
  .mk-rc__meta { display:flex; align-items:center; flex-wrap:wrap; gap:6px; font-size:0.76rem; color:var(--text-muted); }
  .mk-rc__actual { font-size:0.88rem; color:var(--red); font-weight:700; }
  .mk-rc__vs { color:var(--text-muted); }
  .mk-rc__target { color:var(--text); }
  .mk-rc__sep-dot { color:var(--line-strong); }

  /* Lifecycle chip track (spec §5.3) */
  .mk-lc { margin-bottom:16px; }
  .mk-lc__label { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-muted); margin-bottom:8px; }
  .mk-lc__track { display:flex; align-items:center; flex-wrap:wrap; gap:4px; }
  .mk-lc__chip { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:999px;
    font-size:0.72rem; font-weight:600; border:1px solid var(--line); background: var(--surface-2); color:var(--text-muted); }
  .mk-lc__chip--done { background: var(--green-bg); color: var(--green); border-color: rgba(31,157,87,.22); }
  .mk-lc__chip--current { background: var(--accent-tint); color: var(--accent); border-color: var(--accent-tint-2); }
  .mk-lc__glyph { font-size:0.7rem; }
  .mk-lc__sep { color: var(--line-strong); font-size:0.7rem; }

  /* Read-back (answered state) */
  .mk-rc__answered-tag { display:inline-flex; align-items:center; gap:6px; font-size:0.74rem; font-weight:700;
    color: var(--green); background: var(--green-bg); border:1px solid rgba(31,157,87,.22);
    border-radius:999px; padding:3px 11px; margin-bottom:12px; }
  .mk-rc__readback { display:flex; flex-direction:column; gap:12px; margin:0; }
  .mk-rc__ro-field dt { font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--text-muted); margin-bottom:3px; }
  .mk-rc__ro-field dd { margin:0; font-size:0.86rem; color:var(--text); line-height:1.5; }
  .mk-rc__kz-link { color: var(--accent); font-weight:700; text-decoration:none; }
  .mk-rc__kz-link:hover { text-decoration:underline; }
  .mk-rc__open8step { margin-left:2px; }

  /* Form (unanswered state) */
  .mk-rc__form { display:flex; flex-direction:column; gap:14px; }
  .mk-rc__field-group { display:flex; flex-direction:column; gap:6px; }
  .mk-rc__label { font-size:0.8rem; font-weight:700; color:var(--text); }
  .mk-rc__hint { font-weight:500; font-size:0.72rem; color:var(--accent); margin-left:4px; }
  .mk-rc__input { width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; font-size:0.85rem;
    line-height:1.5; padding:9px 11px; border:1px solid var(--line-strong); border-radius: var(--radius);
    background: var(--canvas); color:var(--text); }
  .mk-rc__input:focus { outline:none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-tint); }
  .mk-rc__input--sm { max-width:340px; }
  .mk-rc__draft { align-self:flex-start; margin-top:2px; }
  .mk-rc__draft-note { font-size:0.7rem; color:var(--text-muted); }
  .mk-rc__toggle { display:inline-flex; border:1px solid var(--line-strong); border-radius:999px; overflow:hidden; align-self:flex-start; }
  .mk-rc__toggle-btn { border:none; border-radius:0; background:var(--surface); color:var(--text-muted);
    font-size:0.8rem; font-weight:600; padding:5px 18px; cursor:pointer; }
  /* Compound :hover selectors so the toggle outranks the global button:hover
     rule (styles.css, specificity 0,0,1,1) — otherwise hovering the active
     "Yes" repaints it slate-on-white and the white label vanishes. */
  .mk-rc__toggle-btn.mk-rc__toggle-btn:hover { background: var(--surface-2); }
  .mk-rc__toggle-btn.mk-rc__toggle-btn--active,
  .mk-rc__toggle-btn.mk-rc__toggle-btn--active:hover { background: var(--accent); color:#fff; }
  .mk-rc__esc-note { font-size:0.74rem; color:var(--amber); background: var(--amber-bg);
    border:1px solid rgba(224,122,18,.22); border-radius: var(--radius); padding:6px 10px; }
  .mk-rc__actions { display:flex; justify-content:flex-end; padding-top:2px; }

  /* Chat column */
  .mk-chat { display:flex; flex-direction:column; min-height:360px; flex:1;
    background: var(--surface); border:1px solid var(--line); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm); overflow:hidden; }
  .mk-chat__thread { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:14px; min-height:200px; }
  .mk-chat__empty { margin:auto; color:var(--text-muted); font-size:0.88rem; text-align:center; }
  .mk-chat__composer { display:flex; gap:10px; padding:14px 16px; border-top:1px solid var(--line); background: var(--surface-2); }
  .mk-chat__composer textarea { flex:1; resize:none; font-family:inherit; font-size:0.85rem; padding:9px 12px;
    border:1px solid var(--line-strong); border-radius: var(--radius); background: var(--canvas); color:var(--text); }
  .mk-chat__composer textarea:focus { outline:none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-tint); }
  .mk-chat__composer .btn { align-self:flex-end; }
`;

(function injectStyles() {
  if (document.getElementById('askmark-styles')) return;
  const el = document.createElement('style');
  el.id = 'askmark-styles';
  el.textContent = ASKMARK_STYLES;
  document.head.appendChild(el);
})();

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderAskMark(dept, mount, session)
 * @param {object} dept    — department data object (from data/<id>.json)
 * @param {Element} mount  — DOM element to render into (#view-mount)
 * @param {object} session — { deptId, role, persona }; persona.name attributes
 *                            the human side of the chat (falls back to "You").
 */
export function renderAskMark(dept, mount, session) {
  _dept = dept;
  _mount = mount;
  _session = session;
  _selectedKpiId = null;
  _thread = [];
  _sending = false;
  _submitting = false;
  _drafts = {};   // reset unsubmitted drafts per render (also guards against
                  // any stale cross-dept draft surviving a dept switch)
  doRender();
}
