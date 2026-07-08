/**
 * views/myday.js — L1 "My Day" (§5.9 of docs/redesign/DESIGN-GUIDE.md)
 *
 * renderMyDay(dept, mount, persona)
 *
 * Markup rebuilt to match docs/redesign/reference/view-rest.js's My Day
 * renderer: a serif greeting, a 2-col `.hero-kpi` headline card (mirrors
 * views/overview.js's hero — same classes, same conventions), an amber
 * "Data flag" card when the rep's headline KPI carries a real flag/nodata
 * note, a `.driver-grid` of `.stat-tile`s for the rep's real activity
 * drivers, and a "This week's context" reason composer + logged-reasons
 * card wired to the same lib/reasons.js store as before.
 *
 * Data plumbing preserved from the pre-rebuild file:
 *   - resolveRepKpi(dept, persona): matches the signed-in persona's name
 *     against the dept's rep KPIs (per-user L1 differentiation) — unchanged.
 *   - lib/reasons.js: addReason/getReasons/getReasonsByEntity/seedDemoReasons
 *     — same store, same call shape (deptId/kpiId/entityId/author/text/status).
 *
 * Real changes vs. the pre-rebuild layout (structural, not data):
 *   - "This week's context" (composer + logged-reasons) is now unconditional,
 *     matching the reference — the old file only showed the reason composer
 *     for red/amber headlines and a plain "target met" line for green ones.
 *     The redesign's My Day always offers reason-logging + a history panel
 *     regardless of the headline's status, which is also a strictly more
 *     useful surface (a rep can log context on a green week too).
 *   - Activity-driver labels/units now use the SAME canonical map
 *     views/kpi.js's Service 3-level drill already established
 *     (SUB_KPI_LABELS/SUB_KPI_UNITS there) for the exact repSubs schema
 *     data/service.json carries today (incomingRevenue/quotes/openQuotes/
 *     deals/openDeals/grip/timeWithCustomer) — the OLD label list here
 *     (calls/weiMeetings/hpMeetings/newOppsWEI/hpNewQuotes/revHPI/…) was
 *     written for a key-naming scheme data/service.json no longer uses as of
 *     e4b9081 ("enrich L1 structure"), so for every Service rep it silently
 *     matched zero keys and rendered "No activity-driver metrics for this
 *     rep." — a real bug this rebuild fixes by aligning with the current
 *     schema. Sales' reps (calls/coldCalls/meetings/newOpps) keep their
 *     existing keys/labels, which the old map did cover correctly.
 *   - `incomingRevenue` is deliberately excluded from the driver grid: for
 *     every Service rep it is byte-for-byte the same series/target as the
 *     rep's own headline KPI (it's the same underlying number restated under
 *     a repSub key, not a distinct driver) — showing it twice would just
 *     duplicate the hero card directly above it.
 *   - "rolls up to <team> → <parent KPI>" is derived from the real
 *     `parentId` chain (rep → team → main, or rep → main directly for depts
 *     with no team layer, e.g. Sales) via lib/registry.js's byId() — never
 *     hardcoded, so it's correct for every rep in every dept that has one.
 */

import { byId }       from '../lib/registry.js';
import { ragStatus }  from '../lib/rag.js';
import { sparkline }  from '../lib/charts.js';
import { addReason, getReasonsByEntity, seedDemoReasons } from '../lib/reasons.js';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Formatters — mirrors views/overview.js's conventions so My Day's hero
// reads identically to Overview's (same value/badge/source-note treatment). ─

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && (unit.startsWith('$') || unit.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function isPctUnit(unit) {
  return unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct';
}

// Same split as Overview's heroValueParts: only percent-like units split the
// hero numeral from its unit; everything else renders formatVal()'s full
// string whole (never an invented "$116 / ,430" split for other units).
function heroValueParts(kpi) {
  const act = displayActual(kpi);
  if (act == null) return { main: '—', small: '' };
  if (isPctUnit(kpi.unit)) return { main: (act * 100).toFixed(1), small: '%' };
  return { main: formatVal(act, kpi.unit), small: '' };
}

function statusBadge(rag) {
  const map = {
    green:  ['green',   'On Track'],
    amber:  ['amber',   'At Risk'],
    red:    ['red',     'Off Track'],
    nodata: ['outline', 'No Data'],
  };
  const [cls, label] = map[rag] || map.nodata;
  const dot = rag === 'nodata' ? '' : '<span class="dot"></span>';
  return `<span class="badge badge--${cls}">${dot}${label}</span>`;
}

function displayActual(kpi) {
  if (kpi && kpi.series && kpi.series.length) {
    const last = [...kpi.series].reverse().find((v) => v != null);
    return last != null ? last : null;
  }
  return kpi ? kpi.actual : null;
}

// Unit's cadence suffix, e.g. "$/wk" → " / wk" — used only in the hero's
// "vs target" line, matching the reference's "$26,960 / wk" treatment.
function unitCadence(unit) {
  if (!unit || typeof unit !== 'string') return '';
  const i = unit.indexOf('/');
  return i >= 0 ? ' / ' + unit.slice(i + 1) : '';
}

function sourceNoteFor(kpi) {
  const parts = [];
  if (kpi.source) parts.push(kpi.source.split(' / ')[0]);
  if (kpi.targetSource) parts.push('target from ' + kpi.targetSource);
  return parts.join(' · ');
}

// "rolls up to <team> → <parent main KPI>" — real parentId chain only.
// Service reps roll up rep → team (rev_jc) → main (rev_we); Sales reps roll
// up rep → main directly (no team layer) — both real shapes, never invented.
function rollupLine(dept, kpi) {
  const parent = kpi.parentId ? byId(dept, kpi.parentId) : null;
  if (!parent) return '';
  if (parent.isMain) return ` · rolls up to ${esc(parent.name)}`;
  const grandparent = parent.parentId ? byId(dept, parent.parentId) : null;
  return grandparent
    ? ` · rolls up to ${esc(parent.name)} → ${esc(grandparent.name)}`
    : ` · rolls up to ${esc(parent.name)}`;
}

function seriesFootnote(series, unit) {
  if (!series || !series.length) return '';
  return series.map((v, i) => `Wk${i + 1} ${formatVal(v, unit)}`).join(' · ');
}

function resolveRepKpi(dept, persona) {
  const repIds = dept.reps || dept.kpis.filter((k) => k.level === 3).map((k) => k.id);
  if (!repIds.length) return null;
  const wanted = (persona && persona.name || '').toLowerCase();
  if (wanted) {
    const match = repIds
      .map((id) => byId(dept, id))
      .find((k) => k && k.name.toLowerCase().includes(wanted));
    if (match) return match;
  }
  return byId(dept, repIds[0]);
}

// ─── Activity-driver canonical label/unit map ──────────────────────────────
// Service schema mirrors views/kpi.js's SUB_KPI_LABELS/SUB_KPI_UNITS exactly
// (same repSubs shape) — kept in sync deliberately so the same metric reads
// with the same name on My Day and on the KPI Boards drill. Sales' legacy
// keys (calls/coldCalls/meetings/newOpps) are the only other repSubs shape
// in the app today (see data/sales.json).
const DRIVER_LABELS = {
  quotes:           'Quotes',
  openQuotes:       'Open Quotes',
  deals:            'Deals / Win%',
  openDeals:        'Open Deals',
  grip:             'Grip / Retention',
  timeWithCustomer: 'Time with Customer',
  calls:            'Calls',
  coldCalls:        'Cold Calls',
  meetings:         'Meetings',
  newOpps:          'New Opps',
};

const DRIVER_UNITS = {
  quotes:           'count',
  openQuotes:       'count',
  deals:            'count',
  openDeals:        'count',
  grip:             '%',
  timeWithCustomer: 'count',
  calls:            'calls/wk',
  coldCalls:        'calls/wk',
  meetings:         'mtgs/wk',
  newOpps:          'opps/wk',
};

// `incomingRevenue` is deliberately NOT in this map — see file header note.
const DRIVER_ORDER = Object.keys(DRIVER_LABELS);

function buildDriverTile(key, sub) {
  const label  = DRIVER_LABELS[key] || key;
  const unit   = DRIVER_UNITS[key] || '';
  const series = sub.series || [];
  const latest = [...series].reverse().find((v) => v != null) ?? null;
  const hasTarget = sub.target != null;
  const rag = hasTarget ? ragStatus(latest, sub.target, 'higher_better') : 'nodata';
  const hasSpark = series.filter((v) => v != null).length >= 2;
  const spark = hasSpark
    ? sparkline(series, { w: 200, h: 32, target: sub.target, name: label + ' trend', labels: series.map((_, i) => 'Day ' + (i + 1)), fmt: unit })
    : '';

  return `
    <section class="card stat-tile" style="padding:16px">
      <div class="stat-tile__top">
        <span class="stat-tile__label">${esc(label)}</span>
        ${hasTarget ? statusBadge(rag) : '<span class="badge badge--outline">No Data</span>'}
      </div>
      <div class="stat-tile__value">${formatVal(latest, unit)}</div>
      <div class="stat-tile__vs">Target ${hasTarget ? formatVal(sub.target, unit) : '—'}</div>
      ${spark ? `<div class="stat-tile__spark">${spark}</div>` : ''}
      ${sub.note ? `<div class="faint" style="font-size:11px; margin-top:2px">${esc(sub.note)}</div>` : ''}
    </section>`;
}

function buildDriversHTML(kpi) {
  const subs = kpi.repSubs;
  if (!subs) return '';
  return DRIVER_ORDER
    .filter((key) => subs[key])
    .map((key) => buildDriverTile(key, subs[key]))
    .join('');
}

// ─── Logged-reasons list + composer ─────────────────────────────────────────

function relTime(isoTs) {
  const diff = Date.now() - new Date(isoTs).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function reasonEntryHTML(r) {
  const tone = r.status === 'red' ? 'red' : r.status === 'amber' ? 'amber' : r.status === 'green' ? 'green' : 'nodata';
  return `
    <div style="display:flex; gap:10px">
      <span class="status-cell status-cell--${tone}" style="margin-top:2px"><span class="dot"></span></span>
      <div>
        <div style="font-size:13px; line-height:1.55; color:var(--text-secondary)">${esc(r.text)}</div>
        <div class="faint" style="font-size:11.5px; margin-top:2px">${esc(r.author)} · ${relTime(r.ts)}</div>
      </div>
    </div>`;
}

// ─── Hero card — same idiom as views/overview.js's `.hero-kpi` ─────────────

function buildHeroCard(dept, kpi) {
  const rag = kpi.nodata ? 'nodata' : ragStatus(displayActual(kpi), kpi.target, kpi.direction || 'higher_better');
  const { main, small } = heroValueParts(kpi);
  const targetDisplay = kpi.target != null ? formatVal(kpi.target, kpi.unit) + unitCadence(kpi.unit) : '—';
  const sourceNote = sourceNoteFor(kpi);
  const series = kpi.series || [];
  const hasSpark = series.filter((v) => v != null).length >= 2;
  const spark = hasSpark
    ? sparkline(series, {
        w: 560, h: 120, target: kpi.target,
        name: `${kpi.name} weekly`, labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: kpi.unit,
      }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"')
    : '';
  const footnote = seriesFootnote(series, kpi.unit);

  return `
    <section class="card hero-kpi" aria-label="My headline target">
      <div class="hero-kpi__main">
        <div class="hero-kpi__label">
          <div><span class="running-head">My headline</span><h3 style="margin-top:4px">${esc(kpi.name)}</h3></div>
          ${statusBadge(rag)}
        </div>
        <div class="hero-kpi__value">${main}${small ? `<small>${small}</small>` : ''}</div>
        <div class="hero-kpi__vs">vs target <b>${targetDisplay}</b>${rollupLine(dept, kpi)}</div>
        <div class="hero-kpi__foot">
          ${sourceNote ? `<span class="source-note">${esc(sourceNote)}</span>` : '<span></span>'}
        </div>
      </div>
      <div class="hero-kpi__side" style="display:flex; flex-direction:column; gap:12px">
        <span class="running-head">8-week trend</span>
        ${spark || '<span class="faint" style="font-size:12.5px">Not enough weekly data yet for a trend.</span>'}
        ${footnote ? `<span class="faint" style="font-size:12px">${esc(footnote)}</span>` : ''}
      </div>
    </section>`;
}

// ─── Public entry point ─────────────────────────────────────────────────────

export function renderMyDay(dept, mount, persona) {
  // Seed illustrative demo reasons on first load (idempotent).
  try { seedDemoReasons(); } catch { /* localStorage unavailable */ }

  const kpi = resolveRepKpi(dept, persona);
  const name = (persona && persona.name) || 'there';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (!kpi) {
    mount.innerHTML = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1</span>
          <h1>Good day, ${esc(name)}.</h1>
          <p class="page-head__sub">${today}</p>
        </div>
      </div>
      <section class="card card--pad">
        <p class="muted">No individual rep data is available for ${esc(dept.name)} yet. My Day will populate once your KPIs are wired to a source.</p>
      </section>`;
    return;
  }

  // Team eyebrow segment: only when the rep's parent is a team (not a main
  // KPI directly) — real per lib/registry.js's parentId chain.
  const parent = kpi.parentId ? byId(dept, kpi.parentId) : null;
  const teamLabel = parent && !parent.isMain ? parent.name : null;

  // Data-flag banner: prefer the KPI's own real `flag`; fall back to
  // `nodataNote` for reps whose tab is entirely empty (e.g. Sales' Eric) —
  // both are real fields already on the KPI, never invented.
  const flagText = kpi.flag || kpi.nodataNote || null;

  const entityReasons = getReasonsByEntity({ deptId: dept.id, entityId: kpi.id });

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1${teamLabel ? ' · ' + esc(teamLabel) : ''}</span>
        <h1>Good day, ${esc(name)}.</h1>
        <p class="page-head__sub">${today} · ${esc(dept.name)} · your targets for the week</p>
      </div>
    </div>

    ${buildHeroCard(dept, kpi)}

    ${flagText ? `
    <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--amber); display:flex; gap:8px; align-items:baseline">
      <b style="font-size:13px; color:var(--amber-text); white-space:nowrap">Data flag</b>
      <span style="font-size:13.5px; color:var(--text-secondary)">${esc(flagText)}</span>
    </section>` : ''}

    <div class="section-head"><span class="running-head">My activity drivers</span></div>
    <div class="driver-grid">
      ${buildDriversHTML(kpi) || '<p class="muted">No activity-driver metrics for this rep.</p>'}
    </div>

    <div class="section-head"><span class="running-head">This week's context</span></div>
    <div class="grid" style="grid-template-columns: 3fr 2fr">
      <section class="card card--pad">
        <h4 style="margin-bottom:12px">Log a reason for this week's numbers</h4>
        <div class="field-list">
          <textarea class="input" id="reason-input" rows="3" placeholder="e.g. 3 quotes short — 2 accounts rescheduled to Thu"></textarea>
          <div style="display:flex; justify-content:flex-end"><button class="btn btn--primary" id="reason-save">Save Reason</button></div>
        </div>
      </section>
      <section class="card card--pad" id="week-context">
        <span class="running-head">Logged reasons</span>
        <div id="reason-list" style="margin-top:12px; display:grid; gap:12px">
          ${entityReasons.length ? entityReasons.map(reasonEntryHTML).join('') : '<p class="faint" style="font-size:12.5px">No reasons logged this week yet.</p>'}
        </div>
      </section>
    </div>`;

  const saveBtn = mount.querySelector('#reason-save');
  saveBtn.addEventListener('click', () => {
    const textarea = mount.querySelector('#reason-input');
    const text = textarea.value.trim();
    if (!text) return;
    const rag = kpi.nodata ? 'nodata' : ragStatus(displayActual(kpi), kpi.target, kpi.direction || 'higher_better');
    addReason({ deptId: dept.id, kpiId: kpi.id, entityId: kpi.id, author: name, text, status: rag });
    renderMyDay(dept, mount, persona);
  });
}
