/**
 * views/myboard.js — My Board (browse any L1 rep's KPI vs target)
 *
 * renderMyBoard(dept, mount)
 *
 * Re-skinned onto the same component idiom as views/myday.js / overview.js
 * per §5.9 of docs/redesign/DESIGN-GUIDE.md ("apply the same card/table/
 * badge idiom to myboard.js"): `.page-head`, a `.seg` rep switcher (same
 * pattern views/teamboard-location.js's location switcher uses), a
 * `.hero-kpi` card for the selected rep's headline vs target + 8-week
 * sparkline, an amber "Data flag" card for any real flag/nodata note, and a
 * `.driver-grid` of `.stat-tile`s for the rep's real activity drivers.
 *
 * Data + behavior preserved from the pre-rebuild file: rep-selector state
 * (repIds from dept.reps, first rep selected by default), the same
 * byId()/ragStatus() lookups, and a graceful nodata-rep card (e.g. Sales'
 * Eric — target/actuals entirely absent).
 *
 * Activity-driver labels/units use the SAME canonical map views/myday.js and
 * views/kpi.js's Service 3-level drill use for the current repSubs schema
 * (incomingRevenue/quotes/openQuotes/deals/openDeals/grip/timeWithCustomer)
 * — the old defs list here (calls/weiMeetings/hpMeetings/newOppsWEI/
 * hpNewQuotes/revHPI/…) matched none of Service's real repSubs keys post
 * e4b9081 ("enrich L1 structure") and silently rendered zero driver rows for
 * every Service rep; this rebuild fixes that the same way myday.js does.
 */

import { byId }      from '../lib/registry.js';
import { ragStatus } from '../lib/rag.js';
import { sparkline } from '../lib/charts.js';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Formatters — same conventions as views/overview.js / views/myday.js ──

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
  if (kpi.series && kpi.series.length) {
    const last = [...kpi.series].reverse().find((v) => v != null);
    return last != null ? last : null;
  }
  return kpi.actual;
}

function unitCadence(unit) {
  if (!unit || typeof unit !== 'string') return '';
  const i = unit.indexOf('/');
  return i >= 0 ? ' / ' + unit.slice(i + 1) : '';
}

// ─── Activity-driver canonical label/unit map — identical to views/myday.js
// (kept in sync deliberately; see that file's header for the schema note). ─

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

// `incomingRevenue` excluded deliberately — for every Service rep it is the
// same series/target as the rep's own headline KPI (see views/myday.js).
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

// ─── Rep card (hero + drivers) ──────────────────────────────────────────────

function renderRepCard(kpi) {
  if (!kpi) return '<p class="muted">Rep not found.</p>';

  if (kpi.nodata) {
    return `
      <section class="card hero-kpi" aria-label="${esc(kpi.name)} — no data">
        <div class="hero-kpi__main">
          <div class="hero-kpi__label">
            <h3>${esc(kpi.name)}</h3>
            ${statusBadge('nodata')}
          </div>
          <div class="hero-kpi__value">—</div>
          ${kpi.nodataNote ? `<div class="hero-kpi__vs">${esc(kpi.nodataNote)}</div>` : ''}
        </div>
      </section>`;
  }

  const act = displayActual(kpi);
  const rag = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const targetDisplay = kpi.target != null ? formatVal(kpi.target, kpi.unit) + unitCadence(kpi.unit) : '—';
  const series = kpi.series || [];
  const hasSpark = series.filter((v) => v != null).length >= 2;
  const spark = hasSpark
    ? sparkline(series, {
        w: 560, h: 120, target: kpi.target,
        name: `${kpi.name} weekly`, labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: kpi.unit,
      }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"')
    : '';
  const sourceNote = [kpi.source, kpi.targetSource ? 'target from ' + kpi.targetSource : null].filter(Boolean).join(' · ');

  const flagCard = kpi.flag ? `
    <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--amber); display:flex; gap:8px; align-items:baseline">
      <b style="font-size:13px; color:var(--amber-text); white-space:nowrap">Data flag</b>
      <span style="font-size:13.5px; color:var(--text-secondary)">${esc(kpi.flag)}</span>
    </section>` : '';

  return `
    <section class="card hero-kpi" aria-label="${esc(kpi.name)} headline KPI">
      <div class="hero-kpi__main">
        <div class="hero-kpi__label">
          <h3>${esc(kpi.name)}</h3>
          ${statusBadge(rag)}
        </div>
        <div class="hero-kpi__value">${formatVal(act, kpi.unit)}</div>
        <div class="hero-kpi__vs">vs target <b>${targetDisplay}</b></div>
        <div class="hero-kpi__foot">
          ${sourceNote ? `<span class="source-note">${esc(sourceNote)}</span>` : '<span></span>'}
        </div>
      </div>
      <div class="hero-kpi__side" style="display:flex; flex-direction:column; gap:12px">
        <span class="running-head">8-week trend</span>
        ${spark || '<span class="faint" style="font-size:12.5px">Not enough weekly data yet for a trend.</span>'}
      </div>
    </section>
    ${flagCard}
    <div class="section-head"><span class="running-head">Activity drivers</span></div>
    <div class="driver-grid">
      ${buildDriversHTML(kpi) || '<p class="muted">No activity-driver metrics for this rep.</p>'}
    </div>
    ${kpi.note ? `<p class="board-hint">${esc(kpi.note)}</p>` : ''}`;
}

// ─── Public entry point ─────────────────────────────────────────────────────

export function renderMyBoard(dept, mount) {
  const repIds = dept.reps || dept.kpis.filter((k) => k.level === 3).map((k) => k.id);

  if (!repIds.length) {
    mount.innerHTML = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1</span>
          <h1>My Board</h1>
        </div>
      </div>
      <section class="card card--pad">
        <p class="muted">No individual rep data available for this department.</p>
      </section>`;
    return;
  }

  let selectedRep = repIds[0];

  function segHTML() {
    return repIds.map((id) => {
      const kpi = byId(dept, id);
      const label = kpi ? kpi.name.split(' — ')[0].trim() : id;
      return `<button class="seg__item ${id === selectedRep ? 'is-on' : ''}" data-rep-id="${esc(id)}">${esc(label)}</button>`;
    }).join('');
  }

  function paint() {
    mount.innerHTML = `
      <div class="page-head">
        <div>
          <span class="running-head page-head__eyebrow">${esc(dept.name)} · L1 Reps</span>
          <h1>My Board</h1>
          <p class="page-head__sub">Individual rep performance vs target</p>
        </div>
        <div class="page-head__side">
          <a href="#/dept/${esc(dept.id)}/team" class="btn btn--secondary">Back to Team Board</a>
        </div>
      </div>

      <div class="flex" style="align-items:center; gap:16px; flex-wrap:wrap; margin:0 0 24px">
        <span class="running-head">Rep</span>
        <div class="seg" role="tablist" aria-label="Rep">${segHTML()}</div>
      </div>

      <div id="rep-card-area">${renderRepCard(byId(dept, selectedRep))}</div>`;

    mount.querySelectorAll('[data-rep-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedRep = btn.dataset.repId;
        paint();
      });
    });
  }

  paint();
}
