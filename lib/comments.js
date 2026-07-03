/**
 * lib/comments.js — per-KPI comment thread (interactive: Mark + human)
 *
 * The comment thread is the two-voice conversation that hangs off any KPI:
 *   • Mark (the AI employee) posts "what's driving this" — for a green, what's
 *     going right; for a red/amber, the story + what's wrong. Mark reads the KPI
 *     data AND the meeting record (T2 / T3 / team huddles) to ground it.
 *   • The human (L2 lead / operator) posts tracking notes — "Looking into it,
 *     report back Fri", an action, a status — so the board is a place people
 *     converse and track, not just read.
 *
 * Every rendered thread LEADS with Mark's live read (composeMarkNote), computed
 * from the KPI's current status, so even a green KPI answers "what's driving
 * that green?". Below it sits the stored thread (seeded + posted comments).
 *
 * In-memory + localStorage-backed (same pattern as lib/reasons.js). Seeded with
 * a couple of illustrative Mark↔human exchanges on first load.
 *
 * Entry shape:
 *   { id, deptId, kpiId, author, role, kind, text, status, ts }
 *   role:   'ai' (Mark) | 'human'
 *   kind:   'driving' (what's driving the status) | 'action' | 'note'
 *   status: 'red' | 'amber' | 'green' | 'nodata'
 */

const LS_KEY    = 'fmds_comments';
const SEED_FLAG = 'fmds_comments_seeded';

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}
function save(entries) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch { /* quota */ }
}
function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
}
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function addComment({ deptId, kpiId, author, role, kind, text, status }) {
  const entry = {
    id: uid(),
    deptId,
    kpiId:  kpiId  || '',
    author: author || (role === 'ai' ? 'Mark' : 'You'),
    role:   role   || 'human',
    kind:   kind   || 'note',
    text:   text   || '',
    status: status || 'nodata',
    ts: new Date().toISOString(),
  };
  const entries = load();
  entries.push(entry);
  save(entries);
  return entry;
}

/** Stored comments for a KPI, oldest → newest (reads as a thread). */
export function getComments({ deptId, kpiId }) {
  return load()
    .filter(c => c.deptId === deptId && c.kpiId === kpiId)
    .sort((a, b) => a.ts.localeCompare(b.ts));
}

/** Count of stored comments on a KPI (excludes Mark's live lead note). */
export function commentCount({ deptId, kpiId }) {
  return getComments({ deptId, kpiId }).length;
}

// ─── Mark's live "what's driving this" read ───────────────────────────────────

/**
 * composeMarkNote(kpi, rag) → string
 * Mark's grounded read of why the KPI is at its status. Prefers the KPI's own
 * story/flag data; otherwise a status-appropriate template. Green gets a
 * positive framing so "what's driving that green?" is always answered.
 */
export function composeMarkNote(kpi, rag) {
  const parts = [];
  if (kpi.story && kpi.story.text) {
    parts.push(kpi.story.text.trim());
  } else if (kpi.flagDetail) {
    parts.push(String(kpi.flagDetail).trim());
  } else if (kpi.flag && typeof kpi.flag === 'string' && kpi.flag.length < 240) {
    parts.push(kpi.flag.trim());
  }
  const grounded = parts.join(' ');

  if (rag === 'green') {
    return grounded
      ? `What's driving this green: ${grounded}`
      : `What's driving this green: actual is at or above the board-of-record target and the trend is holding. No open 8-step on the driving sub-KPIs — the standard work is being followed. I'm monitoring to sustain it.`;
  }
  if (rag === 'amber') {
    return grounded
      ? `Watching this — ${grounded}`
      : `At risk: slipping below target but not yet red. No confirmed root cause yet — I'm watching the driving sub-KPI's trend and will flag if it breaks red.`;
  }
  if (rag === 'red') {
    return grounded
      ? `Why it's red: ${grounded}`
      : `Below target. Root cause not yet confirmed — I recommend opening an 8-step on the sub-KPI that's driving the gap. I'll pre-draft steps 1–6 from the data.`;
  }
  return grounded || `No data connected yet — awaiting the source-system feed for this KPI.`;
}

// ─── Thread UI (shared by Overview + KPI Boards) ──────────────────────────────

function initials(name) {
  return String(name || '?').split(/[\s/—-]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
function shortTs(ts) {
  // ts is ISO; show as e.g. "Jul 3" without pulling in a date lib
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ts || '');
  if (!m) return '';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m[2] - 1]} ${+m[3]}`;
}

function renderStoredComment(c) {
  const isAi = c.role === 'ai';
  const av = isAi ? 'M' : initials(c.author);
  const kindTag = c.kind === 'action'
    ? '<span class="cmt__kind cmt__kind--action">action</span>' : '';
  return `
    <div class="cmt cmt--${isAi ? 'ai' : 'human'}">
      <span class="cmt__avatar cmt__avatar--${isAi ? 'ai' : 'human'}">${av}</span>
      <div class="cmt__body">
        <div class="cmt__meta">
          <span class="cmt__author">${esc(c.author)}${isAi ? ' · AI Employee' : ''}</span>
          ${kindTag}
          <span class="cmt__ts">${shortTs(c.ts)}</span>
        </div>
        <div class="cmt__text">${esc(c.text)}</div>
      </div>
    </div>`;
}

/** Inner HTML of the stored-comment list (re-rendered after each post). */
export function renderCommentList(deptId, kpiId) {
  const stored = getComments({ deptId, kpiId });
  if (!stored.length) {
    return `<div class="cmt-empty">No notes yet — add the first, or ask Mark.</div>`;
  }
  return stored.map(renderStoredComment).join('');
}

/**
 * commentThreadHTML({ deptId, kpi, rag, author, collapsed })
 * Full thread block: Mark's live read + stored list + a post box.
 *   author   — display name attributed to human posts (session persona / dept lead)
 *   collapsed — start with the body hidden behind a toggle (used for green cards)
 *   markNote  — optional override for Mark's lead read (callers may pass a richer,
 *               dept-aware explanation; falls back to composeMarkNote otherwise)
 */
export function commentThreadHTML({ deptId, kpi, rag, author, collapsed, markNote }) {
  const leadNote = (markNote && String(markNote).trim()) || composeMarkNote(kpi, rag);
  const count = commentCount({ deptId, kpiId: kpi.id });
  const bodyStyle = collapsed ? 'style="display:none"' : '';
  const toggleLabel = collapsed
    ? `💬 Notes${count ? ` (${count})` : ''} · ask Mark`
    : `💬 Notes${count ? ` (${count})` : ''}`;

  return `
    <div class="cmt-thread cmt-thread--${rag}" data-cmt-dept="${deptId}"
         data-cmt-kpi="${kpi.id}" data-cmt-status="${rag}"
         data-cmt-author="${esc(author || 'You')}">
      <button class="cmt-toggle" data-cmt-toggle="${kpi.id}">${toggleLabel}</button>
      <div class="cmt-body" data-cmt-body="${kpi.id}" ${bodyStyle}>
        <div class="cmt cmt--ai cmt--lead">
          <span class="cmt__avatar cmt__avatar--ai">M</span>
          <div class="cmt__body">
            <div class="cmt__meta">
              <span class="cmt__author">Mark · AI Employee</span>
              <span class="cmt__kind cmt__kind--driving">what's driving this</span>
            </div>
            <div class="cmt__text">${esc(leadNote)}</div>
          </div>
        </div>
        <div class="cmt-list" data-cmt-list="${kpi.id}">
          ${renderCommentList(deptId, kpi.id)}
        </div>
        <div class="cmt-form">
          <textarea class="cmt-input" rows="2"
            placeholder="Leave a note — e.g. &quot;Looking into it, report back Fri&quot;"></textarea>
          <button class="cmt-post" type="button">Post note</button>
        </div>
      </div>
    </div>`;
}

/**
 * bindComments(rootEl) — one delegated handler for all threads under rootEl.
 * Idempotent: safe to call after every re-render (guards with a dataset flag).
 * Reads deptId / kpiId / author from the thread's data attributes, so it works
 * for both Overview (author = persona) and KPI Boards (author = dept lead).
 */
export function bindComments(rootEl) {
  if (!rootEl || rootEl.__fmdsCmtBound) return;
  rootEl.__fmdsCmtBound = true;

  rootEl.addEventListener('click', (e) => {
    const toggle = e.target.closest('.cmt-toggle');
    if (toggle && rootEl.contains(toggle)) {
      const id = toggle.getAttribute('data-cmt-toggle');
      const body = rootEl.querySelector(`.cmt-body[data-cmt-body="${id}"]`);
      if (body) body.style.display = (body.style.display === 'none') ? '' : 'none';
      return;
    }

    const post = e.target.closest('.cmt-post');
    if (post && rootEl.contains(post)) {
      const thread = post.closest('.cmt-thread');
      if (!thread) return;
      const input = thread.querySelector('.cmt-input');
      const text = input ? input.value.trim() : '';
      if (!text) { if (input) input.focus(); return; }
      const deptId = thread.getAttribute('data-cmt-dept');
      const kpiId  = thread.getAttribute('data-cmt-kpi');
      const status = thread.getAttribute('data-cmt-status') || 'nodata';
      const author = thread.getAttribute('data-cmt-author') || 'You';
      addComment({ deptId, kpiId, author, role: 'human', kind: 'note', text, status });
      const list = thread.querySelector('.cmt-list');
      if (list) list.innerHTML = renderCommentList(deptId, kpiId);
      if (input) input.value = '';
      const toggleBtn = thread.querySelector('.cmt-toggle');
      if (toggleBtn) {
        const n = commentCount({ deptId, kpiId });
        toggleBtn.textContent = `💬 Notes (${n})`;
      }
    }
  });
}

// ─── Seed a couple of illustrative Mark ↔ human exchanges ──────────────────────

export function seedDemoComments() {
  if (localStorage.getItem(SEED_FLAG)) return;

  // Operations OTP (red) — the interactive loop: Mark's meeting-grounded read,
  // then Jim's tracking action, then Mark confirming it back for the roll-up.
  addComment({
    deptId: 'operations', kpiId: 'otp', role: 'ai', author: 'Mark', kind: 'note', status: 'red',
    text: 'Picked this up from last T3 (Jim + Ops) — Mexico was flagged as the driver. I\'ve pre-drafted an 8-step on the Mexico OTP sub-KPI (steps 1–6 seeded from KZ-346, the $40K short-code event) so the team starts at ~70%. It\'s waiting in Problem-Solving.',
  });
  addComment({
    deptId: 'operations', kpiId: 'otp', role: 'human', author: 'Jim Kozel', kind: 'action', status: 'red',
    text: 'Walking the short-code order-entry step with the Mexico team Thu AM to confirm exactly which standard broke. Will open the 8-step off the Mexico sub-KPI and report back at Monday roll-up.',
  });
  addComment({
    deptId: 'operations', kpiId: 'otp', role: 'ai', author: 'Mark', kind: 'note', status: 'red',
    text: 'Logged — I\'ll surface "root cause being confirmed Thu (Jim)" to the Leadership OS roll-up so the Chief of Staff sees this red is already being actioned, not just flagged.',
  });

  // Service main revenue (flagged roll-up) — Mark ties the data-quality bug to
  // the huddle context so the L2 lead sees performance vs. reporting are different.
  addComment({
    deptId: 'service', kpiId: 'rev_we', role: 'ai', author: 'Mark', kind: 'driving', status: 'amber',
    text: 'Read carefully: the shortfall shown is a reporting gap, not a performance gap. Team Noel\'s revenue ($13.73M) is tracked accurately in their own sheet but never rolls into the Data Base main (column BQ is empty). From JC\'s Tue huddle: Team JC quote volume recovered after the HubSpot dialer outage. Recommend the fix go to Ricardo, not an 8-step.',
  });

  localStorage.setItem(SEED_FLAG, '1');
}

// Auto-seed on first import in the browser (browser-guarded so Node tests that
// import without a localStorage global don't throw).
if (typeof localStorage !== 'undefined') {
  try { seedDemoComments(); } catch { /* localStorage unavailable */ }
}
