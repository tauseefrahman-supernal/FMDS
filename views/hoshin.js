/**
 * views/hoshin.js — WE 2026 Hoshin (annual policy-deployment) view
 *
 * Exports:
 *   renderHoshin(dept, mount)              — mounts the per-function Hoshin page (router entry)
 *   hoshinPageHTML(dept, hoshin)           — pure HTML-string builder for the full page (Node-testable)
 *   hoshinStrip(hoshin, dept)              — KPI-Boards alignment strip, consumed by the board views
 *   hoshinChips(hoshin, dept)              — small H<n> pill chips for a board row/header
 *
 * Ported from docs/redesign/reference/view-hoshin.js (§5.3 DESIGN-GUIDE), wired to
 * OUR data layer (lib/hoshin.js: objectives/activitiesFor/functionalLeadFor/
 * objectiveRelations/loadHoshin + data/hoshin.json) instead of the reference's
 * single global DATA object.
 *
 * Signature notes for callers (Task 8/8b KPI-Boards):
 *   - lib/hoshin.js's pure functions take (hoshin, deptId) — bare id strings,
 *     because that module has zero knowledge of display names. hoshinStrip/
 *     hoshinChips live here in the VIEW layer instead and need the department's
 *     human name (dept.name — not present anywhere in data/hoshin.json) for the
 *     strip's sentence + disk tooltips, so they take the whole `dept` object
 *     (the same object every view already has in scope) rather than a bare id.
 *   - Both are pure string builders — no DOM, no fetch. A board view must fetch
 *     data/hoshin.json itself (via lib/hoshin.js's loadHoshin(), same
 *     fire-and-forget splice pattern views/overview.js already uses for
 *     data/kz-records.json) and pass the resolved object in as `hoshin`.
 *   - wireHoshinStrip(mount) is an optional convenience export: delegated
 *     click/keydown handling for the strip's [data-go-hoshin] card, routing to
 *     `#/dept/<data-hoshin-dept>/hoshin`. Board views may use it or wire their
 *     own listener — the strip's markup carries a `data-hoshin-dept` attribute
 *     either way.
 *
 * Zero-invented-data guards (data/hoshin.json's own fields, nothing added):
 *   - Objective "1-year priority" text prefers the objective's real
 *     `description` (verbatim deck-quote text captured on the Marketing
 *     block's activities — see data/hoshin.json _meta.objectiveMapping),
 *     falling back to the shorter `priorityTag`, falling back to a neutral
 *     "not captured" note. 4 of the 5 WE 2026 objectives carry a real
 *     `description`; only Acquisitions has no verbatim description anywhere
 *     in source, so its card falls through to its short `priorityTag`
 *     bracket-tag text — never a fabricated priority sentence.
 *   - Target/Support-function/Accountable text is split on the source's own
 *     "\n" line breaks and rendered verbatim. Where a line count lines up 1:1
 *     across target/support/lead (the common case), each target row gets its
 *     own matching support+lead; where the counts don't line up (some source
 *     rows list 3 collaborating functions against 2 targets), we do NOT invent
 *     a mapping — every real value is shown on every row instead of guessing
 *     which line goes with which.
 *   - Due date: the source's Gantt-fill "confidence" flag (see
 *     data/hoshin.json _meta.timelineMethod) marks 29 of 31 activities
 *     'unverified-default-full-range' — a template artifact, not a real
 *     commitment. Only the 2 activities flagged 'derived-from-fill-gap' show a
 *     real end date; everything else renders a neutral "—" (with the reason in
 *     its title) rather than a fabricated due date.
 *   - Status: data/hoshin.json carries no per-activity status field at all —
 *     unlike the reference (which hardcodes "On Plan" for its own sample DATA),
 *     every row here shows a neutral "Not tracked" badge.
 *   - "Measured on this board by …" footer: the reference's per-activity
 *     `kpis` link to board KPI ids does not exist anywhere in our
 *     data/hoshin.json — omitted rather than guessed.
 *   - No per-KPI Hoshin mapping exists in our data (the reference's kpiMap is
 *     a field on its own global DATA object we don't have) — hoshinChips() is
 *     department-scoped (every objective the dept's activities DRIVE), not
 *     KPI-scoped.
 */

import {
  objectives,
  activitiesFor,
  functionalLeadFor,
  objectiveRelations,
  loadHoshin,
} from '../lib/hoshin.js';

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function splitLines(s) {
  return String(s == null ? '' : s).split('\n').map((x) => x.trim()).filter(Boolean);
}

// Per-row value picker: zips 1:1 only when the line count matches the number
// of target rows (the common, reliable case); otherwise broadcasts the whole
// real list so nothing is silently dropped or invented.
function perRow(list, i, rowCount) {
  if (list.length === rowCount && rowCount > 0) return [list[i]].filter(Boolean);
  return list;
}

function joinWithAnd(strs) {
  if (!strs.length) return '';
  if (strs.length === 1) return strs[0];
  if (strs.length === 2) return strs.join(' and ');
  return strs.slice(0, -1).join(', ') + ' and ' + strs[strs.length - 1];
}

function hoshinDisk(n, relation, size) {
  const s = size || 30;
  const cls = relation === 'drives' ? 'hoshin-disk--drives' : relation === 'supports' ? 'hoshin-disk--supports' : '';
  return `<span class="hoshin-disk ${cls}" style="width:${s}px;height:${s}px;font-size:${Math.round(s * 0.42)}px">${n}</span>`;
}

// 1-based position of an objective in the canonical WE 2026 list — the same
// order objectives()/objectiveRelations() always iterate in.
function objectiveNumber(hoshin, objectiveId) {
  const idx = objectives(hoshin).findIndex((o) => o.id === objectiveId);
  return idx === -1 ? null : idx + 1;
}

function mappedObjectiveIds(activity) {
  const ids = [];
  if (activity.objectiveId) ids.push(activity.objectiveId);
  if (Array.isArray(activity.objectiveIds)) {
    activity.objectiveIds.forEach((id) => { if (id && !ids.includes(id)) ids.push(id); });
  }
  return ids;
}

// ─── Due / status cells (the zero-invented-data guards) ────────────────────

function dueCell(activity) {
  const tl = activity.timeline;
  if (tl && tl.confidence === 'derived-from-fill-gap' && tl.end) {
    return `<span class="tnum" style="white-space:nowrap">${esc(tl.end)}</span>`;
  }
  return `<span class="muted" title="Timeline range in source is unverified — not a confirmed commitment date (see data/hoshin.json _meta.timelineMethod)">—</span>`;
}

function statusCell() {
  // No per-activity status field exists in data/hoshin.json — never fabricate one.
  return `<span class="badge badge--neutral">Not tracked</span>`;
}

// ─── Quarter chips — built from the activity's own real timeline.months ────

const QUARTER_MONTHS = {
  Q1: ["Jan'26", "Feb'26", "Mar'26"],
  Q2: ["Apr'26", "May'26", "Jun'26"],
  Q3: ["Jul'26", "Aug'26", "Sep'26"],
  Q4: ["Oct'26", "Nov'26", "Dec'26"],
};

function quarterChipsHTML(activity) {
  const months = (activity.timeline && activity.timeline.months) || [];
  return Object.entries(QUARTER_MONTHS).map(([q, ms]) => {
    const on = ms.some((m) => months.includes(m));
    return `<span class="q-chip ${on ? 'is-on' : ''}">${q}</span>`;
  }).join('');
}

// ─── Section 1 — objective cards ────────────────────────────────────────────

function objectiveCardsHTML(hoshin, dept) {
  const rels = objectiveRelations(hoshin, dept.id);
  const allObjs = objectives(hoshin); // same order objectiveRelations() iterates
  return rels.map((r, i) => {
    const obj = allObjs[i];
    const n = i + 1;
    const drives = r.relation === 'drives';
    const badgeLabel = `${esc(dept.name)} ${drives ? 'drives' : 'supports'}`;
    const priorityText = obj && obj.description
      ? esc(obj.description)
      : obj && obj.priorityTag
        ? esc(obj.priorityTag)
        : 'No literal priority tag captured in source for this objective.';
    return `
    <section class="card card--pad hoshin-obj ${drives ? 'hoshin-obj--ops' : ''}">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px">
        ${hoshinDisk(n, r.relation, 32)}
        <h4 style="flex:1">${esc(r.name)}</h4>
        <span class="badge ${drives ? 'badge--info' : 'badge--neutral'}">${badgeLabel}</span>
      </div>
      <p style="margin:0; font-size:12.5px; line-height:1.55; color:var(--text-dim)">${priorityText}</p>
    </section>`;
  }).join('');
}

// ─── Section 2 — one card per activity plan ────────────────────────────────

function activityBlockHTML(hoshin, dept, activity) {
  const mapIds = mappedObjectiveIds(activity);
  const disksHTML = mapIds.length
    ? mapIds.map((id) => {
        const n = objectiveNumber(hoshin, id);
        return n ? hoshinDisk(n, 'drives', 24) : '';
      }).join('')
    : `<span class="chip">No objective mapped</span>`;

  const priorityLine = activity.hoshinPriority
    ? `<span class="faint" style="font-size:12px">Hoshin priority: ${esc(activity.hoshinPriority)}</span>`
    : `<span class="faint" style="font-size:12px">No Hoshin priority text captured in source</span>`;

  const leadLines = splitLines(activity.lead);
  const leadHeaderHTML = leadLines.length
    ? `<b>${esc(leadLines.join(' / '))}</b>`
    : `<span class="muted" style="font-size:12.5px">Not yet assigned</span>`;

  const targets = splitLines(activity.target);
  const supports = splitLines(activity.supportFunction);
  const rows = targets.length ? targets : ['No target/milestone text captured in source'];
  const dueHTML = dueCell(activity);
  const statusHTML = statusCell();

  const rowsHTML = rows.map((t, i) => {
    const rowSupports = perRow(supports, i, targets.length);
    const supportHTML = rowSupports.length
      ? rowSupports.map((s) => `<span class="chip">${esc(s)}</span>`).join(' ')
      : '<span class="muted">—</span>';
    const rowLeads = perRow(leadLines, i, targets.length);
    const leadCellHTML = rowLeads.length ? esc(rowLeads.join(', ')) : '—';
    return `<tr>
      <td>${esc(t)}</td>
      <td>${supportHTML}</td>
      <td class="muted">${leadCellHTML}</td>
      <td class="muted tnum" style="white-space:nowrap">${dueHTML}</td>
      <td>${statusHTML}</td>
    </tr>`;
  }).join('');

  return `
  <section class="card" style="margin-bottom:16px">
    <div class="hoshin-act__head">
      <div style="display:flex; gap:6px">${disksHTML}</div>
      <div style="flex:1; min-width:0">
        <h3>${esc(activity.activityPlan) || 'Untitled activity plan'}</h3>
        ${priorityLine}
      </div>
      <div class="hoshin-act__lead">
        <span class="running-head">Lead</span>
        ${leadHeaderHTML}
      </div>
      <div class="hoshin-act__timeline">${quarterChipsHTML(activity)}</div>
    </div>
    <div class="table-scroll">
      <table class="dt">
        <thead><tr>
          <th style="min-width:340px">Target · Milestone</th><th>Support function</th><th>Accountable</th><th>Due</th><th>Status</th>
        </tr></thead>
        <tbody>${rowsHTML}</tbody>
      </table>
    </div>
  </section>`;
}

// ─── Public: full-page HTML (pure — Node-testable with a fixture) ─────────

export function hoshinPageHTML(dept, hoshin) {
  const lead = functionalLeadFor(hoshin, dept.id) || 'Not yet assigned';
  const acts = activitiesFor(hoshin, dept.id);
  const objectiveCards = objectiveCardsHTML(hoshin, dept);
  const activityBlocks = acts.length
    ? acts.map((a) => activityBlockHTML(hoshin, dept, a)).join('')
    : `<p class="muted">No Hoshin activity plans captured for ${esc(dept.name)} in the source workbook.</p>`;

  return `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">WE 2026 Hoshin · Functional Lead: ${esc(lead)}</span>
      <h1>${esc(dept.name)} Hoshin</h1>
      <p class="page-head__sub">Company objectives, the ${esc(dept.name)} activity plans that move them, and the accountable lead behind every target.</p>
    </div>
    <div class="page-head__side">
      <button class="btn btn--secondary" data-go="kpi">KPI Boards</button>
    </div>
  </div>

  <div class="section-head" style="margin-top:0"><span class="running-head">1-year Hoshin priorities (2026) — company-wide</span></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">${objectiveCards}</div>

  <div class="section-head"><span class="running-head">${esc(dept.name)} activity plans — every target tracked to an owner</span></div>
  ${activityBlocks}

  <section class="card card--pad" style="border-left:3px solid hsl(var(--we-sky))">
    <span class="running-head">Support functions</span>
    <p style="margin:8px 0 0; font-size:13.5px; line-height:1.6; color:var(--text-secondary); max-width:100ch">Targets owned by another function roll up on that function's own Hoshin page — this page tracks ${esc(dept.name)}'s own activity plans and the functions supporting them.</p>
  </section>`;
}

// ─── Public: KPI-Boards alignment strip (pure) ─────────────────────────────
//
// hoshinStrip(hoshin, dept) — takes the whole dept object (not a bare id) so
// it can name the department in its sentence + disk tooltips without knowing
// anything data/hoshin.json itself doesn't carry (display names live only in
// data/<dept>.json / data/departments.json).
export function hoshinStrip(hoshin, dept) {
  const rels = objectiveRelations(hoshin, dept.id);
  const name = dept.name || dept.id;

  const disksHTML = rels.map((r, i) => {
    const n = i + 1;
    const title = `${r.name} — ${r.relation === 'drives' ? `${name} drives this` : `${name} supports this`}`;
    return `<span class="hoshin-strip__item" title="${esc(title)}">${hoshinDisk(n, r.relation, 26)}</span>`;
  }).join('');

  const drivesNames = rels
    .map((r, i) => (r.relation === 'drives' ? `Hoshin ${i + 1} · ${r.name}` : null))
    .filter(Boolean);
  const supportsCount = rels.length - drivesNames.length;

  const boldLine = drivesNames.length
    ? `This board drives ${joinWithAnd(drivesNames)}`
    : `${name} doesn't yet drive a WE 2026 objective directly`;
  const dimLine = supportsCount > 0
    ? `${name} also supports ${supportsCount} other WE 2026 objective${supportsCount === 1 ? '' : 's'}.`
    : '';

  return `
  <section class="card hoshin-strip" role="button" tabindex="0" data-go-hoshin data-hoshin-dept="${esc(dept.id)}" aria-label="Open the ${esc(name)} Hoshin view">
    <div class="hoshin-strip__disks">${disksHTML}</div>
    <div class="hoshin-strip__text">
      <b>${esc(boldLine)}</b>
      ${dimLine ? `<span class="muted">${esc(dimLine)}</span>` : ''}
    </div>
    <span class="btn btn--outline btn--sm" style="pointer-events:none">Open Hoshin View →</span>
  </section>`;
}

// Optional convenience: delegated click/keydown wiring for hoshinStrip()'s
// card. Board views may call this after splicing the strip's markup in, or
// wire their own listener against the same [data-go-hoshin]/[data-hoshin-dept]
// attributes.
export function wireHoshinStrip(mount) {
  const go = (el) => { location.hash = `#/dept/${el.dataset.hoshinDept}/hoshin`; };
  mount.addEventListener('click', (e) => {
    const card = e.target.closest('[data-go-hoshin]');
    if (card) go(card);
  });
  mount.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('[data-go-hoshin]');
    if (card) { e.preventDefault(); go(card); }
  });
}

// ─── Public: small H<n> chips for a board row (pure) ───────────────────────
//
// hoshinChips(hoshin, dept) — department-scoped (see file header: no per-KPI
// mapping exists in data/hoshin.json). Renders one chip per objective this
// dept's activities DRIVE; '' when the dept drives none (e.g. an empty
// activities block).
export function hoshinChips(hoshin, dept) {
  const rels = objectiveRelations(hoshin, dept.id);
  const driven = rels
    .map((r, i) => (r.relation === 'drives' ? { n: i + 1, name: r.name } : null))
    .filter(Boolean);
  if (!driven.length) return '';
  return driven
    .map(({ n, name }) => `<span class="hoshin-chip" title="Rolls into Hoshin ${n} — ${esc(name)}">H${n}</span>`)
    .join('');
}

// ─── Public: router entry point — fetches data/hoshin.json + mounts ───────

function loadingHTML(dept) {
  return `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">WE 2026 Hoshin</span>
      <h1>${esc(dept.name)} Hoshin</h1>
      <p class="page-head__sub">Loading Hoshin data…</p>
    </div>
  </div>`;
}

function unavailableHTML(dept) {
  return `
  <div class="page-head">
    <div>
      <span class="running-head page-head__eyebrow">WE 2026 Hoshin</span>
      <h1>${esc(dept.name)} Hoshin</h1>
      <p class="page-head__sub">Hoshin data is unavailable right now.</p>
    </div>
  </div>`;
}

export function renderHoshin(dept, mount) {
  mount.innerHTML = loadingHTML(dept);
  loadHoshin().then((hoshin) => {
    if (!hoshin) { mount.innerHTML = unavailableHTML(dept); return; }
    mount.innerHTML = hoshinPageHTML(dept, hoshin);
    mount.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-go]');
      if (goBtn) location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
    });
  });
}
