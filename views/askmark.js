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
 * Header pill math: "N action required" counts LIVE reds needing a response
 * — redKpisNeedingResponse(dept).length — NOT rollupSignal(deptId).redCount.
 * rollupSignal summarizes *persisted* accountability entries ever created for
 * the dept, which can include ones that have since recovered; using it for
 * the headline count would risk showing a red that's no longer actually red.
 * rollupSignal is still useful, so its answered/beingActioned/stalled counts
 * are surfaced as a supporting line under the pill.
 *
 * Selecting a queue card highlights it and loads a contextual placeholder in
 * the chat column — the full response-card UI (cause / action / needs-8-step
 * / report-back, backed by addResponse()+advanceLifecycle()) is Task 6.
 */

import { redKpisNeedingResponse, rollupSignal, getResponse } from '../lib/accountability.js';
import { liveReply }        from '../lib/agent.js';
import { getReasonsByDept } from '../lib/reasons.js';
import { getComments }      from '../lib/comments.js';

// ─── State (module-level, reset each render — mirrors problemsolving.js) ────
let _dept          = null;
let _mount         = null;
let _session       = null;
let _queue         = [];
let _selectedKpiId = null;
let _thread        = [];    // in-view chat history: [{ role: 'me'|'mark', text }]
let _sending       = false; // guards double-send while a reply is in flight
let _kzRecordsCache = null; // lazy-loaded data/kz-records.json, shared across sends

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

function renderHeader(dept, actionRequiredCount, rollup) {
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
        <span class="mk-pill mk-pill--red">${actionRequiredCount} action required</span>
        <span class="mk-header__rollup">
          ${rollup.answered} answered · ${rollup.beingActioned} being actioned · ${rollup.stalled} stalled
        </span>
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
  const cards = queue.length
    ? queue.map((item) => renderQueueCard(item, dept)).join('')
    : `<div class="mk-empty">No reds awaiting a response right now — nice board.</div>`;

  return `
    <div class="mk-queue-head">
      <span class="mk-queue-head__icon">⚠</span> Action required
      <span class="mk-queue-head__count">${queue.length}</span>
    </div>
    <div class="mk-queue-list">${cards}</div>

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
  const contextBlock = item ? `
    <div class="mk-chat-context">
      <div class="mk-chat-context__label">Selected from queue</div>
      <div class="mk-chat-context__kpi">${esc(item.kpi)} ${ragChip(item.rag)}</div>
      <div class="mk-chat-context__note">
        The full response card (cause · action taken · needs-8-step · report-back) lands in Task 6.
        For now, ask Mark about this KPI below.
      </div>
    </div>` : '';

  if (!_thread.length) {
    const emptyLabel = item ? `Ask Mark about ${esc(item.kpi)}…` : 'Ask Mark about this board…';
    return `${contextBlock}<div class="mk-chat__empty">${emptyLabel}</div>`;
  }

  return `${contextBlock}${_thread.map(renderChatMessage).join('')}`;
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

  _mount.innerHTML = `
    <div class="askmark-view">
      ${renderHeader(_dept, _queue.length, rollup)}
      <div class="askmark-grid">
        <div class="askmark-col askmark-col--queue">${renderQueueColumn(_dept, _queue)}</div>
        <div class="askmark-col askmark-col--chat">${renderChatColumn(selectedItem)}</div>
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
      repaintThread();

      // Seed (don't clobber) the composer with a starter question for this KPI.
      const item    = currentSelectedItem();
      const inputEl = document.getElementById('askmark-input');
      if (inputEl && item && !inputEl.value.trim()) {
        inputEl.value = `Why is ${item.kpi} red?`;
        inputEl.focus();
      }
    });
  });

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
  .mk-header__stats { display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
  .mk-pill { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:999px; font-size:0.8rem; font-weight:700; }
  .mk-pill--red { background: var(--red-bg); color: var(--red); border:1px solid rgba(217,45,58,.22); }
  .mk-header__rollup { font-size:0.72rem; color: var(--text-muted); }

  /* Two-pane grid: ~38% queue / ~62% chat */
  .askmark-grid { display:grid; grid-template-columns: 38% 1fr; gap:22px; align-items:start; }
  @media (max-width: 900px) { .askmark-grid { grid-template-columns: 1fr; } }

  /* Queue column */
  .mk-queue-head { display:flex; align-items:center; gap:8px; font-size:0.76rem; font-weight:700;
    letter-spacing:0.05em; text-transform:uppercase; color: var(--red); margin-bottom:12px; }
  .mk-queue-head__count { margin-left:auto; background: var(--red-bg); color: var(--red); border-radius:999px; padding:1px 9px; font-size:0.72rem; }
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

  /* Chat column */
  .mk-chat { display:flex; flex-direction:column; min-height:480px;
    background: var(--surface); border:1px solid var(--line); border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm); overflow:hidden; }
  .mk-chat__thread { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:14px; }
  .mk-chat__empty { margin:auto; color:var(--text-muted); font-size:0.88rem; text-align:center; }
  .mk-chat-context { background: var(--accent-tint); border:1px solid var(--accent-tint-2); border-radius: var(--radius); padding:12px 14px; }
  .mk-chat-context__label { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--accent); margin-bottom:5px; }
  .mk-chat-context__kpi { display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.9rem; margin-bottom:7px; }
  .mk-chat-context__note { font-size:0.8rem; color:var(--text-muted); line-height:1.5; }
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
  doRender();
}
