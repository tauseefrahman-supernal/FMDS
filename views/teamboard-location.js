/**
 * views/teamboard-location.js — KPI Boards, location model (Operations · Mechanism B)
 *
 * renderLocationBoard(dept, mount)   — unchanged public signature; app.js calls this
 *                                       only for dept.id === 'operations'.
 *
 * Layout ported from docs/redesign/reference/view-kpi.js (§5.2 DESIGN-GUIDE) — the
 * `.dt`-table KPI-board idiom (caret expander, `.status-cell`, `.chip` source/entry
 * tags, `sparkline`/`lineChart` trends, category-band rows) — wired to OUR data
 * throughout (lib/registry.js, lib/rag.js, lib/explain.js, dept.kpis,
 * dept.locationBoards) instead of the reference's single global DATA object. The
 * Hoshin strip + `H<n>` chips come from views/hoshin.js (Task 9), fed by
 * lib/hoshin.js's loadHoshin() the same fire-and-forget way views/hoshin.js's own
 * renderHoshin() loads it — this view paints synchronously without the strip, then
 * repaints once data/hoshin.json resolves (graceful null handling).
 *
 * Two sub-views selected by the LOCATION `.seg`:
 *   'we'      — the COO-board main KPIs (otp/pplh/materials), Mechanism B: WE Main is
 *               entered independently, not summed/averaged from the location subs.
 *               An adaptive chart card sits above the table (`.seg` KPI switcher):
 *               OTP has real weekly per-location series (`kpi.weeklyActuals`) so it
 *               renders as a multi-line chart with the location(s) whose computed RAG
 *               is red emphasized in `VIZ.rust` (data-driven "story location"
 *               detection — never a hardcoded "Mexico", even though Mexico is the
 *               only location that currently qualifies); PPLH/Materials have only a
 *               flat WE-level `kpi.series`, so they render single-series with no
 *               legend per §4.
 *   <location> — the location's own real FMDS board (dept.locationBoards[id]) —
 *               different KPI set/category taxonomy per location, category-band rows,
 *               `manual`/`formula` chips (derived from the KPI's real `rollup.
 *               isManualRekey`/contribution `entryType` fields — the legacy `k.rekey`/
 *               `k.formula` fields this file used to key off never exist in
 *               data/operations.json, so those chips silently never rendered before;
 *               fixed here to read the fields that actually exist), and expandable
 *               operator/line `contributions`, `subLines`, `byBuilding`, and
 *               `supervisors` (SRR) sub-rows — whichever of those four the KPI
 *               actually carries; sections with none of them render no caret at all.
 *
 * Zero-invented-data notes:
 *   - LOCATION tabs + labels come from dept.locations/dept.noDataLocations (not a
 *     hardcoded list) — a display-label map is the only local lookup, since the
 *     source JSON has no id→label field.
 *   - The "expand <KPI> for operator and line contributions" sub-head lists every
 *     main KPI that actually has `.contributors` (otp, pplh, AND materials in our
 *     data — the reference's own hardcoded example only names OTP/PPLH because its
 *     sample DATA only wired two).
 *   - hou_quality_external_remakes carries a real `actualUnit: "count"` distinct
 *     from its `unit: "rate"` target — the old code formatted the actual with the
 *     target's unit (showing an absurd "260200.0%"); fixed to prefer `actualUnit`
 *     for the actual-value cell, a field that already existed in source and was
 *     simply never read.
 *   - Per-KPI notes on expand prefer the KPI's own real fields (`note`/`unitNote`/
 *     `flagDetail`/`flag`/`nodataNote`/`rollup.note`) in that order; only when a KPI
 *     carries none of them does lib/explain.js's `explainKpi(...).why` (RAG-grounded,
 *     still real — never templated filler beyond "actual vs target") fill the gap, so
 *     every KPI stays click-in-able the way this board always has been.
 *   - The OTP row's dedicated red-bordered "T3 story" card only renders the fields
 *     `kpi.story` actually carries (title/denominatorNote/backlogNote/mechanismNote).
 */

import { mains, byId }        from '../lib/registry.js';
import { ragStatus }          from '../lib/rag.js';
import { explainKpi }         from '../lib/explain.js';
import { lineChart, sparkline, wireChartHover, meter, VIZ } from '../lib/charts.js';
import { hoshinStrip, hoshinChips, wireHoshinStrip } from './hoshin.js';
import { loadHoshin }         from '../lib/hoshin.js';

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function joinWithAnd(strs) {
  if (!strs.length) return '';
  if (strs.length === 1) return strs[0];
  if (strs.length === 2) return strs.join(' and ');
  return strs.slice(0, -1).join(', ') + ' and ' + strs[strs.length - 1];
}

function joinWithOr(strs) {
  if (!strs.length) return '';
  if (strs.length === 1) return strs[0];
  if (strs.length === 2) return strs.join(' or ');
  return strs.slice(0, -1).join(', ') + ' or ' + strs[strs.length - 1];
}

// Right-chevron; `.kpi-name__caret.is-open` rotates it 90° to point down.
const CARET_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3l5 5-5 5"/></svg>';

// ─── Location labels (display-only — ids/membership come from dept.locations /
//     dept.noDataLocations, the real fields; this is just id → human label) ──

const LOCATION_LABELS = {
  mexico: 'Mexico', norcross: 'Norcross', houston: 'Houston', canada: 'Canada',
  dr: 'Dominican Republic', hpi: 'HPI',
};

function locLabel(id) {
  if (!id) return id;
  return LOCATION_LABELS[id] || (id.charAt(0).toUpperCase() + id.slice(1));
}

function activeLocations(dept) {
  return (dept.locations || []).map((id) => ({ id, label: locLabel(id) }));
}

function noDataLocations(dept) {
  return (dept.noDataLocations || []).map((id) => ({ id, label: locLabel(id) }));
}

// ─── Value formatting ────────────────────────────────────────────────────────

function formatVal(v, unit) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  if (unit && (unit.startsWith('$') || unit.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format a value from a locationBoard KPI according to its unit/targetType.
 * See formatVal's header note in the old file for the per-unit rationale —
 * unchanged from before this rebuild.
 */
function formatLocVal(v, unit, targetType) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  const u = unit || targetType || '';
  if (u === 'ratio' || u === 'rate' || u === 'percent' || u === '%' || u === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (u === 'pcs_per_labor_hour') return v.toFixed(3) + ' pcs/hr';
  if (u === 'aggregate_labor_hours') return v.toFixed(1) + ' hrs';
  if (u === 'count') return Math.round(v).toLocaleString();
  if (u === 'not_set') return '—';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

// ─── Status cell / chips ─────────────────────────────────────────────────────

function statusCell(rag) {
  const label = { green: 'On Track', amber: 'At Risk', red: 'Off Track', nodata: 'No Data' }[rag] || 'No Data';
  return `<span class="status-cell status-cell--${rag}"><span class="dot"></span>${label}</span>`;
}

/** Target-source `.chip` — plain mono chip per §3; the manual/no-source-system
 *  distinction lives in the tooltip, not a borrowed status hue. */
function sourceChip(kpi) {
  const ts = kpi.targetSource || kpi.source;
  if (!ts) return '';
  const label = ts.split(' / ')[0];
  return `<span class="chip" title="${esc(ts)}">${esc(label)}</span>`;
}

/** WE-main sub-row source chip — derives the real entry-method word ("hand-keyed",
 *  "literal", …) from the sub's own `source` field instead of hardcoding it. */
function subSourceChip(sub) {
  if (!sub.source) return '';
  const parts = sub.source.split(' / ');
  const label = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return `<span class="chip" title="${esc(sub.source)}">${esc(label)}</span>`;
}

/** manual/formula `.chip` — sage-tinted variant for formula, matching the
 *  reference's own inline-style treatment (no new CSS class needed). */
function entryChip(kind) {
  if (kind === 'formula') {
    return `<span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)" title="Computed by in-sheet formula">formula</span>`;
  }
  if (kind === 'manual') {
    return `<span class="chip" title="Hand-keyed literal">manual</span>`;
  }
  return '';
}

// ─── Monthly-series sparkline (shared by WE-main .note fallback + loc boards) ─

const MONTH_ORDER = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function monthlySeries(monthlyActuals) {
  const keys = Object.keys(monthlyActuals || {});
  const order = MONTH_ORDER.filter((m) => keys.includes(m) || keys.includes(m.toLowerCase()));
  const values = order.map((m) => {
    const v = monthlyActuals[m] != null ? monthlyActuals[m] : monthlyActuals[m.toLowerCase()];
    return typeof v === 'number' ? v : null;
  });
  const labels = order.map((m) => m[0] + m.slice(1).toLowerCase());
  return { values, labels };
}

function monthSparklineSvg(monthlyActuals, target, name, unit) {
  const { values, labels } = monthlySeries(monthlyActuals);
  if (values.filter((v) => v != null).length < 2) return '';
  return sparkline(values, { w: 132, h: 34, target, name, labels, fmt: unit });
}

// ─── Deep-link hash params (read-once on mount, matching the `?kpi=&kz=`
//     pattern views/problemsolving.js already uses) ──────────────────────────

function currentHashParams() {
  const hashQuery = location.hash.includes('?') ? location.hash.split('?')[1] : '';
  return new URLSearchParams(hashQuery);
}

// ─── Per-KPI "why" notes on expand ───────────────────────────────────────────

function weMainNoteLines(kpi, dept, rag) {
  // OTP's dedicated red-bordered story card already carries this narrative —
  // don't restate it a second time in the row's own flag-note.
  if (kpi.story) return [];
  const lines = [];
  if (kpi.note) lines.push(kpi.note);
  if (!lines.length) {
    const why = explainKpi(kpi, dept, { rag }).why;
    if (why) lines.push(why);
  }
  return lines;
}

function locNoteLines(kpi, dept, rag) {
  const lines = [];
  if (kpi.unitNote) lines.push(kpi.unitNote);
  if (kpi.flagDetail) lines.push(kpi.flagDetail);
  else if (kpi.flag && typeof kpi.flag === 'string') lines.push(kpi.flag);
  if (kpi.nodataNote) lines.push(kpi.nodataNote);
  if (kpi.rollup && kpi.rollup.note) lines.push(kpi.rollup.note);
  if (!lines.length) {
    const why = explainKpi(kpi, dept, { rag }).why;
    if (why) lines.push(why);
  }
  return lines;
}

// ─── WE Main (COO board) — rows ──────────────────────────────────────────────

function weMainSubRow(dept, mainKpi, sub) {
  const isNoData = sub.nodata || sub.actual == null;
  const rag = isNoData ? 'nodata' : ragStatus(sub.actual, mainKpi.target, mainKpi.direction || 'higher_better');
  const label = locLabel(sub.location) || sub.name;
  const series = sub.series || [];
  const spark = series.length
    ? sparkline(series, { w: 132, h: 34, target: mainKpi.target, name: `${label} ${mainKpi.name}`, labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: mainKpi.unit })
    : '';
  return `
    <tr class="kpi-sub">
      <td>${esc(label)}${sub.flag ? `<div class="kpi-flag-note" style="margin-left:0">${esc(sub.flag)}</div>` : ''}</td>
      <td class="num">${formatVal(mainKpi.target, mainKpi.unit)}</td>
      <td class="num">${isNoData ? '—' : formatVal(sub.actual, mainKpi.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${subSourceChip(sub)}</td>
      <td>${spark}</td>
    </tr>`;
}

function weMainRow(dept, kpi, hoshin, expandedIds) {
  const isExpanded = expandedIds.has(kpi.id);
  const isNoData = kpi.actual == null;
  const rag = isNoData ? 'nodata' : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
  const mechChip = kpi.rollupMethod === 'independent'
    ? `<span class="chip" title="${esc(dept.mechanismNote || '')}">Mechanism B</span>`
    : '';
  const hchips = hoshin ? hoshinChips(hoshin, dept) : '';
  const series = kpi.series || [];
  const spark = series.length
    ? sparkline(series, { w: 132, h: 34, target: kpi.target, name: kpi.name + ' trend', labels: series.map((_, i) => 'Wk ' + (i + 1)), fmt: kpi.unit })
    : '';

  let rows = `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          <button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-row="${kpi.id}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(kpi.name)}">${CARET_SVG}</button>
          ${esc(kpi.name)}
          ${mechChip}
          ${hchips}
        </div>
        ${isExpanded ? weMainNoteLines(kpi, dept, rag).map((n) => `<div class="kpi-flag-note">${esc(n)}</div>`).join('') : ''}
      </td>
      <td class="num">${formatVal(kpi.target, kpi.unit)}</td>
      <td class="num" style="font-weight:600">${isNoData ? '—' : formatVal(kpi.actual, kpi.unit)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(kpi)}</td>
      <td>${spark}</td>
    </tr>`;

  if (isExpanded) {
    const subs = (kpi.contributors || []).map((cid) => byId(dept, cid)).filter(Boolean);
    rows += subs.map((sub) => weMainSubRow(dept, kpi, sub)).join('');
  }
  return rows;
}

// ─── OTP "T3 story" card ─────────────────────────────────────────────────────

function storyPanelHTML(story) {
  if (!story) return '';
  const fields = [
    story.denominatorNote ? ['Denominator', story.denominatorNote] : null,
    story.backlogNote ? ['Backlog', story.backlogNote] : null,
    story.mechanismNote ? ['Mechanism', story.mechanismNote] : null,
  ].filter(Boolean);
  if (!fields.length) return '';
  return `
    <section class="card card--pad" style="margin-top:16px; border-left:3px solid var(--red)">
      <span class="running-head">${esc(story.title || 'Context story')}</span>
      <div class="field-list" style="margin-top:12px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
        ${fields.map(([label, value]) => `<div class="field"><span class="field__label">${esc(label)}</span><span class="field__value">${esc(value)}</span></div>`).join('')}
      </div>
    </section>`;
}

// ─── Adaptive chart card (WE Main) ───────────────────────────────────────────

/** Contributor subs whose computed RAG is red — the data-driven "drag" set
 *  (only ever Mexico today, but never hardcoded as such). */
function dragSubsFor(dept, kpi) {
  if (!(kpi.weeklyActuals && kpi.weeklyActuals.weeks)) return [];
  const subs = (kpi.contributors || []).map((cid) => byId(dept, cid)).filter(Boolean);
  return subs.filter((s) => !s.nodata && s.actual != null &&
    ragStatus(s.actual, kpi.target, kpi.direction || 'higher_better') === 'red');
}

function chartMetaFor(dept, kpi) {
  const isMulti = !!(kpi.weeklyActuals && kpi.weeklyActuals.weeks);
  if (isMulti) {
    const weeks = kpi.weeklyActuals.weeks;
    const title = `${kpi.name} by location — weekly, weeks ${weeks[0]}–${weeks[weeks.length - 1]}`;
    const subs = (kpi.contributors || []).map((cid) => byId(dept, cid)).filter(Boolean);
    const dragSubs = dragSubsFor(dept, kpi);
    const dragIds = new Set(dragSubs.map((s) => s.location));
    const nearSubs = subs.filter((s) => !dragIds.has(s.location) && !s.nodata && s.actual != null);
    let sub;
    if (dragSubs.length) {
      const dragNames = dragSubs.map((s) => locLabel(s.location));
      const nearNames = nearSubs.map((s) => locLabel(s.location));
      sub = `${joinWithAnd(dragNames)} ${dragNames.length > 1 ? 'are' : 'is'} the drag on the WE main.`
        + (nearNames.length ? ` ${joinWithAnd(nearNames)} hold near target.` : '');
    } else {
      sub = 'All active locations report within range of target.';
    }
    return { title, sub, isMulti: true, dragIds };
  }
  const series = kpi.series || [];
  return {
    title: `${kpi.name} — weekly, weeks 1–${series.length}`,
    sub: kpi.note || `${kpi.direction === 'lower_better' ? 'Lower is better.' : 'Higher is better.'} Target ${formatVal(kpi.target, kpi.unit)}.`,
    isMulti: false,
  };
}

function weMainChartSvg(kpi, meta) {
  const isRatio = kpi.unit === 'ratio';
  const fmtY = isRatio ? (v) => Math.round(v * 100) + '%' : (v) => v.toFixed(0);
  if (meta.isMulti) {
    const weeks = kpi.weeklyActuals.weeks;
    const locKeys = Object.keys(kpi.weeklyActuals).filter((k) => k !== 'weeks');
    const rank = (k) => (k === 'we' ? 1 : meta.dragIds.has(k) ? 2 : 0);
    const ordered = locKeys.slice().sort((a, b) => rank(a) - rank(b));
    const series = ordered.map((locKey) => {
      const isWe = locKey === 'we';
      const isDrag = meta.dragIds.has(locKey);
      return {
        name: isWe ? 'WE Main' : locLabel(locKey),
        data: kpi.weeklyActuals[locKey],
        color: isWe ? VIZ.single : isDrag ? VIZ.rust : VIZ.contextLine,
        soft: isDrag ? VIZ.rustSoft : undefined,
        emphasis: isDrag,
      };
    });
    return lineChart({
      w: 900, h: 280, target: kpi.target, fmt: kpi.unit, fmtY,
      label: `Weekly ${kpi.name} by location`,
      xLabels: weeks.map((w) => 'Wk ' + w),
      series,
    });
  }
  return lineChart({
    w: 900, h: 240, target: kpi.target, fmt: kpi.unit, fmtY,
    label: kpi.name + ' weekly actual vs target',
    xLabels: (kpi.series || []).map((_, i) => 'Wk ' + (i + 1)),
    series: [{ name: 'WE Main', data: kpi.series || [], color: VIZ.single, soft: VIZ.singleSoft, emphasis: true }],
  });
}

function chartLegendHTML(meta, kpi) {
  if (!meta.isMulti) return '';
  const items = [];
  [...meta.dragIds].forEach((id) => {
    items.push(`<span class="legend__item"><span class="legend__line" style="background:${VIZ.rust}"></span>${esc(locLabel(id))}</span>`);
  });
  items.push(`<span class="legend__item"><span class="legend__line" style="background:${VIZ.single}"></span>WE Main</span>`);
  const otherCount = Object.keys(kpi.weeklyActuals).filter((k) => k !== 'weeks' && k !== 'we' && !meta.dragIds.has(k)).length;
  if (otherCount) items.push(`<span class="legend__item"><span class="legend__line" style="background:${VIZ.contextLine}"></span>Other locations</span>`);
  return `<div class="legend">${items.join('')}</div>`;
}

function chartKpiSegHTML(kpiList, selectedId) {
  const items = kpiList.map((k) => {
    const label = k.name.split(' (')[0];
    return `<button class="seg__item ${selectedId === k.id ? 'is-on' : ''}" data-chart-kpi="${k.id}">${esc(label)}</button>`;
  }).join('');
  return `<div class="seg" role="tablist" aria-label="Chart KPI">${items}</div>`;
}

// ─── WE Main section (chart card + table) ────────────────────────────────────

function weMainSectionHTML(dept, hoshin, state) {
  const allMains = mains(dept);
  const selKpi = byId(dept, state.chartKpi) || allMains[0];

  const chartHtml = selKpi ? (() => {
    const meta = chartMetaFor(dept, selKpi);
    const svg = weMainChartSvg(selKpi, meta);
    const legend = chartLegendHTML(meta, selKpi);
    return `
    <section class="card" style="margin-bottom:24px">
      <div style="padding:24px 24px 8px; display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap">
        <div style="min-width:260px; flex:1">
          <h3>${esc(meta.title)}</h3>
          <p class="page-head__sub" style="margin-top:4px; max-width:72ch">${esc(meta.sub)}</p>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:10px">
          ${chartKpiSegHTML(allMains, selKpi.id)}
          ${legend}
        </div>
      </div>
      <div style="padding:0 24px 20px">${svg}</div>
    </section>`;
  })() : '';

  const tableKpis = state.filterText
    ? allMains.filter((k) => k.name.toLowerCase().includes(state.filterText.toLowerCase()))
    : allMains;

  const rowsHtml = tableKpis.length
    ? tableKpis.map((k) => weMainRow(dept, k, hoshin, state.expandedIds)).join('')
    : `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-faint)">No KPIs match "${esc(state.filterText)}"</td></tr>`;

  const storyKpi = allMains.find((k) => k.story && state.expandedIds.has(k.id));

  return `
  ${chartHtml}
  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr>
        <th style="min-width:340px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
        <th>Status</th><th>Target source</th><th>Trend</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div></div>
  ${storyKpi ? storyPanelHTML(storyKpi.story) : ''}
  <p class="board-hint"><b>WE Main</b> is entered independently on the COO Board (${esc(dept.mechanismNote || 'Mechanism B')}). <b>Location tabs</b> open each per-location FMDS board — real KPI sets differ by location. <span class="chip">hand-keyed</span> marks a manual literal; a sage-tinted <span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)">formula</span> chip marks a computed roll-up. Click a row's caret to expand.</p>`;
}

// ─── Per-location FMDS board ──────────────────────────────────────────────────

function locSummaryStripHTML(locBoard) {
  const lines = locBoard.productionLines || [];
  return `
    <section class="loc-note" style="margin-bottom:16px">
      <span class="loc-note__stat"><b>${esc(locBoard.label)}</b> FMDS board</span>
      <span class="loc-note__stat"><b>${locBoard.kpiCount}</b> KPI column-pairs in source</span>
      <span class="loc-note__stat"><b>${lines.length}</b> production line${lines.length === 1 ? '' : 's'}</span>
      ${locBoard.buildings != null ? `<span class="loc-note__stat"><b>${locBoard.buildings}</b> building${locBoard.buildings > 1 ? 's' : ''}</span>` : ''}
      ${locBoard.weeklyLabel === 'DAYS' ? '<span class="badge badge--neutral">Cadence: DAYS</span>' : ''}
      ${lines.length ? `<span class="loc-note__stat faint" style="flex-basis:100%; font-size:12.5px">Lines: ${esc(lines.join(' · '))}</span>` : ''}
      ${locBoard.actualsNote ? `<span class="loc-note__stat faint" style="flex-basis:100%; font-size:12.5px">${esc(locBoard.actualsNote)}</span>` : ''}
    </section>`;
}

function lastNonNull(obj) {
  if (!obj) return null;
  const vals = Object.values(obj).filter((v) => typeof v === 'number');
  return vals.length ? vals[vals.length - 1] : null;
}

function genericSubRowHTML(kpi, label, target, actual) {
  const hasVal = actual != null;
  const rag = hasVal && target != null ? ragStatus(actual, target, kpi.direction || 'higher_better') : 'nodata';
  return `
    <tr class="kpi-sub">
      <td>${esc(label)}</td>
      <td class="num">${target == null ? '—' : formatLocVal(target, kpi.unit, kpi.targetType)}</td>
      <td class="num">${hasVal ? formatLocVal(actual, kpi.unit, kpi.targetType) : '—'}</td>
      <td>${statusCell(rag)}</td>
      <td></td>
      <td></td>
    </tr>`;
}

function contribRowHTML(kpi, c) {
  const hasVal = c.value != null;
  const rag = hasVal && c.target != null ? ragStatus(c.value, c.target, kpi.direction || 'higher_better') : 'nodata';
  const ownerHtml = c.owner ? ` <span class="faint" style="font-size:11px">${esc(c.owner)}</span>` : '';
  const spark = c.monthlyActuals ? monthSparklineSvg(c.monthlyActuals, c.target, `${c.label} monthly`, c.unit || kpi.unit) : '';
  return `
    <tr class="kpi-sub">
      <td>${esc(c.label)} ${entryChip(c.entryType)}${ownerHtml}</td>
      <td class="num">${c.target != null ? formatLocVal(c.target, c.unit || kpi.unit, kpi.targetType) : '—'}</td>
      <td class="num">${hasVal ? formatLocVal(c.value, c.unit || kpi.unit, kpi.targetType) : '—'}</td>
      <td>${statusCell(rag)}</td>
      <td></td>
      <td>${spark}</td>
    </tr>`;
}

function supervisorRowHTML(kpi, p) {
  const hasVal = p.actual != null;
  const target = p.target != null ? p.target : kpi.target;
  const rag = hasVal && target != null ? ragStatus(p.actual, target, kpi.direction || 'higher_better') : 'nodata';
  const tone = rag === 'green' ? 'green' : rag === 'amber' ? 'amber' : 'red';
  return `
    <tr class="kpi-sub">
      <td>${esc(p.name)} <span class="faint" style="font-weight:400">· ${esc(p.role || '')}</span></td>
      <td class="num">${target != null ? formatLocVal(target, kpi.unit, kpi.targetType) : '—'}</td>
      <td class="num">${hasVal ? formatLocVal(p.actual, kpi.unit, kpi.targetType) : '—'}</td>
      <td>${statusCell(rag)}</td>
      <td></td>
      <td style="min-width:120px">${hasVal && target != null ? meter(Math.min(p.actual / target, 1), tone) : ''}</td>
    </tr>`;
}

/** Expandable sub-rows for a per-location KPI — whichever of these four real
 *  shapes the KPI actually carries (never more than one is populated). */
function subRowsForLocKpi(kpi) {
  if (Array.isArray(kpi.contributions) && kpi.contributions.length) {
    return kpi.contributions.map((c) => contribRowHTML(kpi, c)).join('');
  }
  if (Array.isArray(kpi.subLines) && kpi.subLines.length) {
    return kpi.subLines.map((s) => genericSubRowHTML(kpi, s.line, s.target, lastNonNull(s.monthlyActuals))).join('');
  }
  if (Array.isArray(kpi.byBuilding) && kpi.byBuilding.length) {
    return kpi.byBuilding.map((b) => genericSubRowHTML(kpi, `Building ${b.building}`, b.target, b.actual)).join('');
  }
  if (Array.isArray(kpi.supervisors) && kpi.supervisors.length) {
    return kpi.supervisors.map((p) => supervisorRowHTML(kpi, p)).join('');
  }
  return '';
}

function hasSubRows(kpi) {
  return (Array.isArray(kpi.contributions) && kpi.contributions.length > 0)
    || (Array.isArray(kpi.subLines) && kpi.subLines.length > 0)
    || (Array.isArray(kpi.byBuilding) && kpi.byBuilding.length > 0)
    || (Array.isArray(kpi.supervisors) && kpi.supervisors.length > 0);
}

function locRowHTML(dept, kpi, expandedLocIds) {
  const isNoData = kpi.nodata || kpi.actual == null;
  const unitMismatch = kpi.flag && String(kpi.flag).startsWith('unit_mismatch');
  const rag = (isNoData || unitMismatch) ? 'nodata' : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
  const isExpanded = expandedLocIds.has(kpi.id);
  const entryKind = kpi.rollup ? (kpi.rollup.isManualRekey ? 'manual' : 'formula') : null;
  const spark = kpi.monthlyActuals ? monthSparklineSvg(kpi.monthlyActuals, kpi.target, kpi.name + ' monthly', kpi.unit) : '';
  // hou_quality_external_remakes: target unit is 'rate', actual is a raw count
  // (real `actualUnit` field) — format the actual with its own real unit.
  const actualUnit = kpi.actualUnit || kpi.unit;

  let rows = `
    <tr class="kpi-row">
      <td>
        <div class="kpi-name">
          <button class="kpi-name__caret ${isExpanded ? 'is-open' : ''}" data-loc-row="${kpi.id}" aria-expanded="${isExpanded}" aria-label="Expand ${esc(kpi.name)}">${CARET_SVG}</button>
          ${esc(kpi.name)}
          ${entryKind ? entryChip(entryKind) : ''}
        </div>
        ${isExpanded ? locNoteLines(kpi, dept, rag).map((n) => `<div class="kpi-flag-note">${esc(n)}</div>`).join('') : ''}
      </td>
      <td class="num">${kpi.target == null ? '—' : formatLocVal(kpi.target, kpi.unit, kpi.targetType)}</td>
      <td class="num" style="font-weight:600">${isNoData ? '—' : formatLocVal(kpi.actual, actualUnit, kpi.targetType)}</td>
      <td>${statusCell(rag)}</td>
      <td>${sourceChip(kpi)}</td>
      <td>${spark}</td>
    </tr>`;

  if (isExpanded) rows += subRowsForLocKpi(kpi);
  return rows;
}

function buildLocRows(dept, kpis, expandedLocIds) {
  let currentCat = null;
  return kpis.map((k) => {
    const catRow = k.category !== currentCat
      ? `<tr class="kpi-cat"><td colspan="6"><span>${esc(k.category || '')}</span></td></tr>`
      : '';
    currentCat = k.category;
    return catRow + locRowHTML(dept, k, expandedLocIds);
  }).join('');
}

function locBoardSectionHTML(dept, locBoard, state) {
  if (!locBoard) {
    return `<div class="table-wrap"><div class="table-scroll"><table class="dt"><tbody>
      <tr><td style="text-align:center;padding:24px;color:var(--text-faint)">No per-location board data available.</td></tr>
    </tbody></table></div></div>`;
  }
  let kpis = locBoard.kpis || [];
  if (state.filterText) {
    const f = state.filterText.toLowerCase();
    kpis = kpis.filter((k) => k.name.toLowerCase().includes(f) || (k.category || '').toLowerCase().includes(f));
  }
  const rowsHtml = kpis.length
    ? buildLocRows(dept, kpis, state.expandedLocIds)
    : `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-faint)">No KPIs match "${esc(state.filterText)}"</td></tr>`;

  return `
  ${locSummaryStripHTML(locBoard)}
  <div class="table-wrap"><div class="table-scroll">
    <table class="dt">
      <thead><tr>
        <th style="min-width:320px">KPI</th><th class="num">Target</th><th class="num">Actual</th>
        <th>Status</th><th>Target source</th><th>Trend</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div></div>
  <p class="board-hint"><span class="chip">manual</span> = hand-keyed literal; <span class="chip" style="border-color:hsl(var(--action-4));background:hsl(var(--action-1));color:var(--accent-text)">formula</span> = computed by in-sheet formula. Click a caret to expand line contributions. Data flags are shown inside the expanded row.</p>`;
}

// ─── Location switcher ────────────────────────────────────────────────────────

function locationSegHTML(dept, state) {
  const items = [
    { id: 'we', label: 'WE Main' },
    ...activeLocations(dept),
    ...noDataLocations(dept).map((l) => ({ ...l, disabled: true })),
  ];
  return items.map((l) => `
    <button class="seg__item ${state.locationId === l.id ? 'is-on' : ''}" data-loc="${l.id}" ${l.disabled ? `disabled title="${esc(dept.noDataNote || 'No data')}"` : ''}>
      ${esc(l.label)}${l.disabled ? ' <span class="faint" style="font-size:10px">no data</span>' : ''}
    </button>`).join('');
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderLocationBoard(dept, mount) {
  const hashParams = currentHashParams();
  const allLocIds = new Set(['we', ...activeLocations(dept).map((l) => l.id)]);
  const mainList = mains(dept);

  const state = {
    locationId: allLocIds.has(hashParams.get('loc')) ? hashParams.get('loc') : 'we',
    chartKpi: mainList.some((k) => k.id === hashParams.get('chart')) ? hashParams.get('chart') : (mainList[0] ? mainList[0].id : null),
    filterText: '',
    expandedIds: new Set(),
    expandedLocIds: new Set(),
  };
  let hoshin = null;

  const expandableNames = mainList
    .filter((k) => k.contributors && k.contributors.length)
    .map((k) => k.name.split(' (')[0]);

  function fullHTML() {
    const hasLocBoard = state.locationId !== 'we' && dept.locationBoards && dept.locationBoards[state.locationId];
    const body = hasLocBoard
      ? locBoardSectionHTML(dept, dept.locationBoards[state.locationId], state)
      : weMainSectionHTML(dept, hoshin, state);

    return `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Mechanism B</span>
        <h1>KPI Boards</h1>
        <p class="page-head__sub">L2 · ${esc(dept.lead || '')} · Location model — expand ${esc(joinWithOr(expandableNames))} for operator and line contributions</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-go="team">Back to Overview</button>
      </div>
    </div>

    ${hoshin ? hoshinStrip(hoshin, dept) : ''}

    <div class="flex" style="align-items:center; gap:16px; flex-wrap:wrap; margin:24px 0">
      <span class="running-head">Location</span>
      <div class="seg" role="tablist" aria-label="Location">${locationSegHTML(dept, state)}</div>
      <div style="flex:1"></div>
      <input class="input" id="lb-filter" style="max-width:220px" type="search" placeholder="Filter KPIs" aria-label="Filter KPIs" value="${esc(state.filterText)}">
    </div>

    <div id="loc-body">${body}</div>
    <div class="chart-tip" id="chart-tip"></div>`;
  }

  function paint() {
    const prevFilter = mount.querySelector('#lb-filter');
    const hadFocus = !!prevFilter && document.activeElement === prevFilter;
    const selStart = hadFocus ? prevFilter.selectionStart : null;

    mount.innerHTML = fullHTML();

    if (hadFocus) {
      const inp = mount.querySelector('#lb-filter');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(selStart, selStart); } catch { /* no-op */ }
      }
    }
    const tip = mount.querySelector('#chart-tip');
    if (tip) wireChartHover(mount, tip);
  }

  mount.addEventListener('click', (e) => {
    const backBtn = e.target.closest('[data-go]');
    if (backBtn) { location.hash = `#/dept/${dept.id}/${backBtn.dataset.go}`; return; }

    const locBtn = e.target.closest('[data-loc]');
    if (locBtn) {
      state.locationId = locBtn.dataset.loc;
      state.expandedIds.clear();
      state.expandedLocIds.clear();
      paint();
      return;
    }

    const chartBtn = e.target.closest('[data-chart-kpi]');
    if (chartBtn) { state.chartKpi = chartBtn.dataset.chartKpi; paint(); return; }

    const rowBtn = e.target.closest('[data-row]');
    if (rowBtn) {
      const id = rowBtn.dataset.row;
      if (state.expandedIds.has(id)) state.expandedIds.delete(id); else state.expandedIds.add(id);
      paint();
      return;
    }

    const locRowBtn = e.target.closest('[data-loc-row]');
    if (locRowBtn) {
      const id = locRowBtn.dataset.locRow;
      if (state.expandedLocIds.has(id)) state.expandedLocIds.delete(id); else state.expandedLocIds.add(id);
      paint();
    }
  });

  mount.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'lb-filter') {
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
