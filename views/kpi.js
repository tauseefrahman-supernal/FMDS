/**
 * views/kpi.js — KPI Boards (main → sub-KPI connection drill)
 *
 * renderKpi(dept, mount)
 *
 * The non-Operations counterpart to the Operations location board
 * (views/teamboard-location.js): every department's main KPIs click in to
 * their real sub-KPI contributors (dept.kpis[].contributors). Service goes
 * one level deeper — main → team → rep → the rep's 7 real L1 day-by-day
 * sub-KPIs — because that is the real shape of dept.kpis for Service only
 * (see the "Sales also has repSubs" note below).
 *
 * Markup rebuilt to the §5.2 KPI-Boards idiom (docs/redesign/DESIGN-GUIDE.md)
 * — the same `.dt` table / `.status-cell` / `.chip` / `sparkline` / caret /
 * `.kpi-sub` components views/teamboard-location.js already ports (Task 8),
 * applied here to the main→sub connection drill instead of the main→location
 * drill. Data lookups (lib/registry.js, lib/rag.js, lib/explain.js,
 * lib/comments.js, lib/hoshin.js) and the drill/expand behavior are
 * unchanged from before this rebuild — only the markup, plus two real
 * data-shape bugs fixed in the process (documented below), moved.
 *
 * No `.seg` / adaptive chart card: unlike Operations, none of these 8
 * departments' kpi.js switches on a location or chart-KPI dimension today
 * (verified against every data/<dept>.json — zero location models, zero
 * `weeklyActuals`-style multi-series objects anywhere outside
 * data/operations.json), so per the task brief neither is added here —
 * inventing a seg/chart-card would mean inventing a dimension these boards
 * don't have. Every KPI's own trend is single-series, so the Trend column is
 * always a plain `sparkline()` with no legend (§4's single-series rule).
 *
 * What changed vs. the pre-rebuild file (markup + two real bugs, not new
 * data):
 *   - The boxed "What this KPI means" explain panel and the "▸ KPI details"
 *     identity-toggle sub-panel are gone — once teamboard-location.js's own
 *     idiom is applied, they're exactly the "banner box that restates what a
 *     chip can say" DESIGN-GUIDE anti-pattern (target/actual/status/source
 *     are already the row; cascade position/RAG-rule text/cadence were
 *     static boilerplate, not KPI-specific). The one genuinely load-bearing
 *     bit — explainKpi(...)'s grounded "why" sentence — now surfaces as the
 *     row's own `.kpi-flag-note` on expand, the same fallback
 *     teamboard-location.js's weMainNoteLines/locNoteLines already use.
 *   - Comment threads (lib/comments.js) for red/amber main KPIs are kept —
 *     real, recently-shipped functionality with no equivalent in
 *     teamboard-location.js to copy a convention from, so it's re-skinned in
 *     place as its own full-width `.kpi-sub` row rather than dropped.
 *   - BUG FIX — marketing.json series shape: 12 of its KPIs
 *     (branded_search_volume, social_engagement_rate, social_media_growth,
 *     pr_unique_viewers and 8 of their contributors) store `series` as
 *     `[{week,date,target,actual}]` point objects, not the flat `number[]`
 *     every other dept's `series` is. The pre-rebuild renderer fed that
 *     straight into formatVal/ragStatus/svgLine, which silently rendered
 *     "[object Object]" as the actual value and forced every one of those
 *     KPIs red (an object coerces to NaN; ragStatus's ratio check falls
 *     through NaN >= x to the red branch) with a blank "no data" chart.
 *     seriesData() below normalizes both shapes to real {values,labels} —
 *     using real week numbers for labels (so gapped weeks like 1,5,10… don't
 *     get mislabeled by array index) — a bug fix, not new data: every value
 *     shown already existed in the point object's own `.actual`/`.week`.
 *   - The data-quality roll-up banner (e.g. Service's Team Noel) now renders
 *     the flagged KPI's own real `flagDetail` text verbatim via
 *     `.frozen-banner` (the amber alert box already used elsewhere for this
 *     exact purpose) instead of a hand-duplicated paraphrase of the same
 *     numbers — avoids the two ever drifting apart.
 *   - sourceChip() drops the old red/green "manual"/"re-keyed" badge tints —
 *     RAG hues are status-only per the redesign's global constraint; the
 *     manual/re-keyed nuance still surfaces via the chip's title tooltip and,
 *     for HR's 6 `manualOnly` KPIs, via their own real
 *     `targetSource: "Manual — reported"` text.
 *
 * Zero-invented-data / preserved-quirk notes:
 *   - Frozen depts (Finance: dept.frozen === true): the pre-rebuild kpi.js
 *     applied NO gating at all — no banner, no disabled drill. That gating
 *     only ever existed in the dead views/teamboard.js (imported in app.js
 *     but never called — see the file's own dispatch table). Per "keep
 *     whatever gating the current kpi.js applies," none is added here
 *     either; Finance renders as a normal connection-drill board. Flagged in
 *     the task report as a real gap for a follow-up task — not fixed here,
 *     out of this task's markup-only scope.
 *   - marketing.json's wei_leads_revenue lists a contributor id
 *     `mkt_sourced_revenue_wei` that does not exist anywhere in
 *     data/marketing.json (the real, unrelated KPI is `mkt_sourced_revenue`
 *     — likely a source-data typo). contributorsOf() already returns `[]`
 *     for it, same as before the rebuild; not "fixed" here since that would
 *     mean editing data/marketing.json, out of this task's views/kpi.js-only
 *     scope.
 *   - Sales' rep_* KPIs also carry a real `repSubs` object (identical shape
 *     to Service's), but only `dept.id === 'service'` gets the 3-level
 *     team→rep→L1 drill below, matching the pre-rebuild file's exact gating
 *     — Sales' repSubs stays unused here, unchanged from before.
 *   - Sales' rev_total lists rev_outside/rev_inside as its own
 *     "contributors" even though both are themselves real mains with their
 *     own rep contributors — since Sales is not `service`, expanding
 *     rev_total renders them as flat generic leaf sub-rows (no further
 *     drill), same as before; both remain independently drillable via their
 *     own top-level main rows. Service has the analogous case (rev_total →
 *     rev_we/rev_hpi as "teams" → rev_jc/rev_noel mis-cast as "reps" with no
 *     repSubs, showing the graceful "No L1 sub-KPI data" fallback) — also
 *     unchanged from the pre-rebuild file, which had the identical
 *     recursive-contributors behavior.
 *   - The `illustrative` chip only renders where dept.kpis actually carries
 *     `illustrative: true` (Logistics' 4 per-location shipping-margin subs,
 *     IT's Sprint Burndown/Azure DevOps Points) — omitted everywhere else,
 *     never invented.
 */

import { mains, contributorsOf }           from '../lib/registry.js';
import { ragStatus }                       from '../lib/rag.js';
import { sparkline, wireChartHover }       from '../lib/charts.js';
import { explainKpi }                      from '../lib/explain.js';
import { commentThreadHTML, bindComments } from '../lib/comments.js';
import { hoshinStrip, hoshinChips, wireHoshinStrip } from './hoshin.js';
import { loadHoshin }                      from '../lib/hoshin.js';

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Right-chevron; `.kpi-name__caret.is-open` rotates it 90° to point down —
// same SVG + behavior as views/teamboard-location.js's CARET_SVG.
const CARET_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l5 5-5 5"/></svg>';
const CARET_PLACEHOLDER = '<span style="display:inline-block;width:22px;flex-shrink:0"></span>';

// ─── Value formatting ────────────────────────────────────────────────────────

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

/**
 * seriesData(kpi) → { values: (number|null)[], labels: string[] }
 * Normalizes `kpi.series`, which is a flat number[] for every dept EXCEPT
 * marketing.json (12 KPIs there store `[{week,date,target,actual}]` point
 * objects instead — see file header). Real week numbers are used for labels
 * when present so gapped weeks (e.g. 1, 5, 10…) aren't mislabeled by index.
 */
function seriesData(kpi) {
  const raw = Array.isArray(kpi.series) ? kpi.series : [];
  if (raw.length && raw[0] && typeof raw[0] === 'object') {
    return {
      values: raw.map((pt) => (pt && typeof pt.actual === 'number') ? pt.actual : null),
      labels: raw.map((pt, i) => 'Wk ' + (pt && pt.week != null ? pt.week : i + 1)),
    };
  }
  return { values: raw, labels: raw.map((_, i) => 'Wk ' + (i + 1)) };
}

/** Last series value, falling back to kpi.actual when there's no series at all. */
function lastValue(kpi) {
  const { values } = seriesData(kpi);
  return values.length ? values[values.length - 1] : (kpi.actual != null ? kpi.actual : null);
}

function sparkFor(kpi) {
  const { values, labels } = seriesData(kpi);
  if (!values.length) return '';
  return sparkline(values, { w: 132, h: 34, target: kpi.target, name: kpi.name + ' trend', labels, fmt: kpi.unit });
}

// ─── Status cell / chips ─────────────────────────────────────────────────────

function statusCell(rag) {
  const label = { green: 'On Track', amber: 'At Risk', red: 'Off Track', nodata: 'No Data' }[rag] || 'No Data';
  return `<span class="status-cell status-cell--${rag}"><span class="dot"></span>${label}</span>`;
}

/** Target-source `.chip` — plain mono chip; manual/re-keyed nuance lives in
 *  the title tooltip, never in a borrowed RAG hue (status colors are
 *  status-only per the redesign's global constraint). */
function sourceChip(kpi) {
  const ts = kpi.targetSource || kpi.source;
  if (!ts) return '';
  const label = ts.split(' / ')[0];
  const wasReKeyed = kpi.source && kpi.source !== ts &&
    ['manual', 'hand-keyed', 'coo board', 'literal', 'bowler'].some((tok) => String(kpi.source).toLowerCase().includes(tok));
  const title = wasReKeyed ? `Target: ${ts} (today: re-keyed from ${kpi.source})` : ts;
  return `<span class="chip" title="${esc(title)}">${esc(label)}</span>`;
}

function illustrativeChip(kpi) {
  return kpi.illustrative
    ? `<span class="chip" title="Illustrative — placeholder trend, not a live tracked number">illustrative</span>`
    : '';
}

// ─── Per-KPI "why" note on expand ────────────────────────────────────────────

function noteLines(kpi, dept, rag) {
  // The roll-up data-quality banner (rollupBannerHTML) already carries
  // flagDetail's narrative below the table — don't restate it here too.
  if (kpi.flagDetail) return [];
  const lines = [];
  if (kpi.note) lines.push(kpi.note);
  if (kpi.flag && typeof kpi.flag === 'string') lines.push(kpi.flag);
  if (kpi.nodataNote) lines.push(kpi.nodataNote);
  if (!lines.length) {
    const why = explainKpi(kpi, dept, { rag }).why;
    if (why) lines.push(why);
  }
  return lines;
}

function flagNoteHTML(kpi, dept, rag) {
  return noteLines(kpi, dept, rag).map((n) => `<div class="kpi-flag-note">${esc(n)}</div>`).join('');
}

// ─── Comment thread row — red/amber main KPIs only ───────────────────────────

function commentRowHTML(dept, kpi, rag) {
  const author = `${dept.lead || 'Lead'} (L2)`;
  return `
    <tr class="kpi-sub">
      <td colspan="6" style="padding:10px 16px 16px">
        ${commentThreadHTML({ deptId: dept.id, kpi, rag, author, collapsed: false })}
      </td>
    </tr>`;
}

// ─── Roll-up data-quality banner (below the table) ───────────────────────────

function rollupBannerHTML(kpi) {
  if (!kpi || !kpi.flagDetail) return '';
  return `
    <div class="frozen-banner" role="status" style="align-items:flex-start; margin-top:16px">
      <div>
        <strong>Data quality — ${esc(kpi.name)} roll-up is incomplete</strong>
        <div style="margin-top:4px; line-height:1.55">${esc(kpi.flagDetail)}</div>
      </div>
    </div>`;
}

// ─── Generic sub-row (level 2) — every dept except Service's team/rep path ──

function genericSubRowHTML(dept, sub) {
  const act = lastValue(sub);
  const rag = ragStatus(act, sub.target, sub.direction || 'higher_better');
  return `
    <tr class="kpi-sub">
      <td>
        <div class="kpi-name">
          ${CARET_PLACEHOLDER}
          ${esc(sub.name)}
          ${illustrativeChip(sub)}
        </div>
        ${flagNoteHTML(sub, dept, rag)}
      </td>
      <td class="num">${formatVal(sub.target, sub.unit)}</td>
      <td class="num">${formatVal(act, sub.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(sub)}</td>
      <td>${sparkFor(sub)}</td>
    </tr>`;
}

// ─── Service only: rep's 7 real L1 day-by-day sub-KPIs (deepest level) ──────

const SUB_KPI_LABELS = {
  incomingRevenue:  'Incoming Revenue WE+HP',
  quotes:           'Quotes',
  openQuotes:       'Open Quotes',
  deals:            'Deals / Win%',
  openDeals:        'Open Deals',
  grip:             'Grip / Retention',
  timeWithCustomer: 'Time with Customer',
};

const SUB_KPI_UNITS = {
  incomingRevenue:  '$/wk',
  quotes:           'count',
  openQuotes:       'count',
  deals:            'count',
  openDeals:        'count',
  grip:             '%',
  timeWithCustomer: 'count',
};

function repSubRowHTML(key, sub) {
  const unit = SUB_KPI_UNITS[key];
  const series = sub.series || [];
  const lastVal = series.length ? series[series.length - 1] : null;
  const rag = ragStatus(lastVal, sub.target, 'higher_better');
  const isGrip = key === 'grip';
  const chip = isGrip
    ? `<span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)" title="Live feed from the Grip system">Grip (live)</span>`
    : `<span class="chip" title="Hand-keyed literal">manual</span>`;
  const spark = series.filter((v) => v != null).length >= 2
    ? sparkline(series, { w: 132, h: 34, target: sub.target, name: SUB_KPI_LABELS[key] + ' trend', labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: unit })
    : '';
  return `
    <tr class="kpi-sub">
      <td style="padding-left:88px">
        ${esc(SUB_KPI_LABELS[key])}
        ${sub.note ? `<div class="kpi-flag-note" style="margin-left:0">${esc(sub.note)}</div>` : ''}
      </td>
      <td class="num">${formatVal(sub.target, unit)}</td>
      <td class="num">${formatVal(lastVal, unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${chip}</td>
      <td>${spark}</td>
    </tr>`;
}

function repSubsRowsHTML(rep) {
  if (!rep.repSubs) {
    return `<tr class="kpi-sub"><td colspan="6" style="padding-left:88px;color:var(--text-faint);font-size:12.5px">No L1 sub-KPI data for this rep.</td></tr>`;
  }
  const firstName = String(rep.name || '').split('—')[0].trim();
  const bandRow = `<tr class="kpi-cat"><td colspan="6"><span>Day-by-day — ${esc(firstName)}</span></td></tr>`;
  const rows = Object.keys(SUB_KPI_LABELS)
    .filter((key) => rep.repSubs[key])
    .map((key) => repSubRowHTML(key, rep.repSubs[key]))
    .join('');
  return bandRow + rows;
}

// ─── Service only: rep row (level 3) — always expandable into its L1 subs ───
//
// Expand state is tracked in its OWN Set (state.expandedRepIds), separate
// from the main/team Sets below. Service's data lets the same KPI id appear
// at more than one cascade depth at once (see the rev_total → rev_we/rev_hpi
// "team" quirk documented in the file header) — sharing a single Set across
// levels would let expanding a real team bleed into an unrelated rep-shaped
// render of the same id reached through that quirk. Three level-scoped Sets
// (matching the pre-rebuild file's expandedIds/expandedTeamIds/
// expandedRepIds) keep each cascade position's open/closed state independent.

function serviceRepRowHTML(dept, rep, expandedRepIds) {
  const act = lastValue(rep);
  const rag = ragStatus(act, rep.target, rep.direction || 'higher_better');
  const isExpanded = expandedRepIds.has(rep.id);
  const caret = `<button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-rep-row="${esc(rep.id)}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(rep.name)}">${CARET_SVG}</button>`;
  let rows = `
    <tr class="kpi-sub">
      <td style="padding-left:68px">
        <div class="kpi-name">${caret}${esc(rep.name)}</div>
        ${isExpanded ? flagNoteHTML(rep, dept, rag) : ''}
      </td>
      <td class="num">${formatVal(rep.target, rep.unit)}</td>
      <td class="num">${formatVal(act, rep.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(rep)}</td>
      <td>${sparkFor(rep)}</td>
    </tr>`;
  if (isExpanded) rows += repSubsRowsHTML(rep);
  return rows;
}

// ─── Service only: team row (level 2) — expandable only when it has reps ────

function serviceTeamRowHTML(dept, team, expandedTeamIds, expandedRepIds) {
  const act = lastValue(team);
  const rag = ragStatus(act, team.target, team.direction || 'higher_better');
  const reps = contributorsOf(dept, team.id);
  const hasReps = reps.length > 0;
  const isExpanded = expandedTeamIds.has(team.id);
  const caret = hasReps
    ? `<button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-team-row="${esc(team.id)}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(team.name)}">${CARET_SVG}</button>`
    : CARET_PLACEHOLDER;
  let rows = `
    <tr class="kpi-sub">
      <td>
        <div class="kpi-name">${caret}<strong>${esc(team.name)}</strong></div>
        ${isExpanded ? flagNoteHTML(team, dept, rag) : ''}
      </td>
      <td class="num">${formatVal(team.target, team.unit)}</td>
      <td class="num">${formatVal(act, team.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(team)}</td>
      <td>${sparkFor(team)}</td>
    </tr>`;
  if (isExpanded && hasReps) {
    rows += reps.map((rep) => serviceRepRowHTML(dept, rep, expandedRepIds)).join('');
  }
  return rows;
}

// ─── Main row (level 1) ──────────────────────────────────────────────────────

function mainRowHTML(dept, kpi, hoshin, state) {
  const isExpanded = state.expandedIds.has(kpi.id);
  const act = lastValue(kpi);
  const rag = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const hchips = hoshin ? hoshinChips(hoshin, dept) : '';
  const caret = `<button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-row="${esc(kpi.id)}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(kpi.name)}">${CARET_SVG}</button>`;

  let rows = `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          ${caret}
          ${esc(kpi.name)}
          ${illustrativeChip(kpi)}
          ${hchips}
        </div>
        ${isExpanded ? flagNoteHTML(kpi, dept, rag) : ''}
      </td>
      <td class="num">${formatVal(kpi.target, kpi.unit)}</td>
      <td class="num" style="font-weight:600">${formatVal(act, kpi.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(kpi)}</td>
      <td>${sparkFor(kpi)}</td>
    </tr>`;

  if (isExpanded) {
    const children = contributorsOf(dept, kpi.id);
    if (children.length) {
      rows += dept.id === 'service'
        ? children.map((team) => serviceTeamRowHTML(dept, team, state.expandedTeamIds, state.expandedRepIds)).join('')
        : children.map((sub) => genericSubRowHTML(dept, sub)).join('');
    } else {
      rows += `<tr class="kpi-sub"><td colspan="6" style="text-align:center;padding:16px;color:var(--text-faint);font-size:12.5px">No sub-KPIs connect to this main — it is entered directly.</td></tr>`;
    }
    if (rag === 'red' || rag === 'amber') rows += commentRowHTML(dept, kpi, rag);
  }
  return rows;
}

// ─── Table body ──────────────────────────────────────────────────────────────

function tableBodyHTML(dept, hoshin, state) {
  const allMains = mains(dept);
  const filtered = state.filterText
    ? allMains.filter((k) => k.name.toLowerCase().includes(state.filterText.toLowerCase()))
    : allMains;
  if (!filtered.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-faint)">No KPIs match "${esc(state.filterText)}"</td></tr>`;
  }
  return filtered.map((k) => mainRowHTML(dept, k, hoshin, state)).join('');
}

function flaggedBannerHTML(dept, state) {
  const flaggedMain = mains(dept).find((k) => k.flagDetail && state.expandedIds.has(k.id));
  return rollupBannerHTML(flaggedMain);
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderKpi(dept, mount) {
  const state = {
    filterText: '',
    expandedIds: new Set(),     // main-level (level 1)
    expandedTeamIds: new Set(), // Service team-level (level 2)
    expandedRepIds: new Set(),  // Service rep-level (level 3)
  };
  let hoshin = null;
  const hasIllustrative = (dept.kpis || []).some((k) => k.illustrative);

  function fullHTML() {
    return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Connection Drill</span>
        <h1>KPI Boards</h1>
        <p class="page-head__sub">Click any KPI's caret to see its sub-KPI connections and what's driving its status.</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-go="team">Back to Overview</button>
      </div>
    </div>

    ${hoshin ? hoshinStrip(hoshin, dept) : ''}

    <div class="flex" style="align-items:center; justify-content:flex-end; gap:16px; margin:24px 0">
      <input class="input" id="kpi-filter" style="max-width:220px" type="search" placeholder="Filter KPIs" aria-label="Filter KPIs" value="${esc(state.filterText)}">
    </div>

    <div class="table-wrap"><div class="table-scroll">
      <table class="dt">
        <thead><tr>
          <th style="min-width:300px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
          <th>Status</th><th>Target source</th><th>Trend</th>
        </tr></thead>
        <tbody>${tableBodyHTML(dept, hoshin, state)}</tbody>
      </table>
    </div></div>

    ${flaggedBannerHTML(dept, state)}

    <p class="board-hint">Click a KPI's caret to expand its sub-KPI connections${dept.id === 'service' ? ' — main → team → rep → day-by-day for Incoming Revenue' : ''}.${hasIllustrative ? ' <span class="chip">illustrative</span> marks a placeholder trend, not a live tracked number.' : ''} Off-track and at-risk KPIs carry a note thread with Mark's read and space for your own.</p>
    <div class="chart-tip" id="chart-tip"></div>`;
  }

  function paint() {
    const prevFilter = mount.querySelector('#kpi-filter');
    const hadFocus = !!prevFilter && document.activeElement === prevFilter;
    const selStart = hadFocus ? prevFilter.selectionStart : null;

    mount.innerHTML = fullHTML();

    if (hadFocus) {
      const inp = mount.querySelector('#kpi-filter');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(selStart, selStart); } catch { /* no-op */ }
      }
    }
    const tip = mount.querySelector('#chart-tip');
    if (tip) wireChartHover(mount, tip);
    bindComments(mount);
  }

  mount.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-go]');
    if (backBtn) { location.hash = `#/dept/${dept.id}/${backBtn.dataset.go}`; return; }

    const rowBtn = e.target.closest('[data-row]');
    if (rowBtn) {
      const id = rowBtn.dataset.row;
      if (state.expandedIds.has(id)) state.expandedIds.delete(id); else state.expandedIds.add(id);
      paint();
      return;
    }

    const teamBtn = e.target.closest('[data-team-row]');
    if (teamBtn) {
      const id = teamBtn.dataset.teamRow;
      if (state.expandedTeamIds.has(id)) state.expandedTeamIds.delete(id); else state.expandedTeamIds.add(id);
      paint();
      return;
    }

    const repBtn = e.target.closest('[data-rep-row]');
    if (repBtn) {
      const id = repBtn.dataset.repRow;
      if (state.expandedRepIds.has(id)) state.expandedRepIds.delete(id); else state.expandedRepIds.add(id);
      paint();
    }
  });

  mount.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'kpi-filter') {
      state.filterText = e.target.value;
      paint();
    }
  });

  wireHoshinStrip(mount);

  paint();

  loadHoshin().then((h) => {
    if (!h) return;
    hoshin = h;
    paint();
  });
}
