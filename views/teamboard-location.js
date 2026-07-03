/**
 * views/teamboard-location.js — Location-aware L2 Team Board
 *
 * renderLocationBoard(dept, mount)
 *
 * Used for departments with layerModel:"location" (Operations — Mechanism B).
 *
 * Features:
 *  - Location switcher: Mexico · Norcross · Houston · Canada
 *    + disabled "no data" chips for Dominican Republic and HPI
 *  - WE main = COO-board independently-entered number with a Mechanism B note
 *  - Location tab = per-location FMDS board (from dept.locationBoards[locId])
 *    - Each location has its own real KPI set (size differs: Mexico 11, others 8)
 *    - Formats values by unit/targetType; RAG respects direction
 *    - Flags unit mismatches (PPLH, External Remakes) inline
 *  - OTP row in WE view: info affordance surfaces the T3 story
 */

import { mains, byId } from '../lib/registry.js';
import { ragStatus }    from '../lib/rag.js';
import { svgLine }      from '../lib/charts.js';

// ─── Location config ─────────────────────────────────────────────────────────

const ACTIVE_LOCATIONS = [
  { id: 'mexico',   label: 'Mexico' },
  { id: 'norcross', label: 'Norcross' },
  { id: 'houston',  label: 'Houston' },
  { id: 'canada',   label: 'Canada' },
];

const NO_DATA_LOCATIONS = [
  { id: 'dr',  label: 'Dominican Republic' },
  { id: 'hpi', label: 'HPI' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function ragChip(status) {
  const label = {
    green:  '● On Track',
    amber:  '● At Risk',
    red:    '● Off Track',
    nodata: '— No Data',
  }[status];
  return `<span class="rag-chip rag-chip--${status}">${label}</span>`;
}

function sourceBadge(source) {
  if (!source) return '';
  return `<span class="badge" title="${source}">${source.split(' / ')[0]}</span>`;
}

// ─── Find location-specific sub-KPI for a main ───────────────────────────────

function getLocationSub(dept, mainKpi, locationId) {
  if (!mainKpi.contributors || !mainKpi.contributors.length) return null;
  return mainKpi.contributors
    .map(cid => byId(dept, cid))
    .filter(Boolean)
    .find(k => k.location === locationId) || null;
}

// ─── OTP Story panel (T3 narrative) ──────────────────────────────────────────

function renderStoryPanel(story) {
  if (!story) return '';
  return `
    <div id="otp-story-panel" style="display:none;margin-top:12px;background:var(--slate-50);
         border:1px solid var(--slate-200);border-radius:var(--radius);padding:16px 20px;
         font-size:0.82rem;line-height:1.6;color:var(--slate-700)">
      <div style="font-weight:700;margin-bottom:6px;color:var(--slate-900)">${story.title}</div>
      <p style="margin:0 0 10px 0">${story.text}</p>
      <ul style="margin:0;padding-left:18px;list-style:disc">
        <li><strong>Denominator:</strong> ${story.denominatorNote}</li>
        <li><strong>Backlog:</strong> ${story.backlogNote}</li>
        <li><strong>Mechanism:</strong> ${story.mechanismNote}</li>
      </ul>
    </div>`;
}

// ─── Render a single main KPI row for the selected location ──────────────────

function renderMainRow(dept, mainKpi, locationId, expandedIds) {
  const sub       = getLocationSub(dept, mainKpi, locationId);
  const isExpanded = expandedIds.has(mainKpi.id);

  // Decide what actual + series to show
  let displayActualVal, displaySeries, isNoData;
  if (locationId === 'we') {
    // WE main — use main KPI's own actual (independently entered)
    displayActualVal = mainKpi.actual;
    displaySeries    = mainKpi.series || [];
    isNoData         = (displayActualVal == null);
  } else if (sub) {
    if (sub.nodata) {
      displayActualVal = null;
      displaySeries    = [];
      isNoData         = true;
    } else {
      displayActualVal = sub.actual;
      displaySeries    = sub.series || [];
      isNoData         = false;
    }
  } else {
    displayActualVal = null;
    displaySeries    = [];
    isNoData         = true;
  }

  const rag = isNoData
    ? 'nodata'
    : ragStatus(displayActualVal, mainKpi.target, mainKpi.direction || 'higher_better');

  const chart = displaySeries.length
    ? svgLine(displaySeries, { target: mainKpi.target, width: 220, height: 60, mini: false })
    : '';

  const hasContribs = mainKpi.contributors && mainKpi.contributors.length > 0;

  // Mechanism B note for WE main
  const mechNote = locationId === 'we' && mainKpi.rollupMethod === 'independent'
    ? `<span class="badge badge--info" style="font-size:0.68rem;margin-left:6px"
         title="${dept.mechanismNote || 'Mechanism B'}">Mechanism B</span>`
    : '';

  // OTP story info button
  const isOtp = mainKpi.id === 'otp';
  const storyBtn = isOtp && mainKpi.story
    ? `<button id="otp-story-toggle" class="btn btn--ghost"
              style="padding:1px 7px;font-size:0.7rem;border-radius:3px;margin-left:6px"
              title="Show T3 OTP context story">ⓘ story</button>`
    : '';

  const toggleBtn = hasContribs
    ? `<button class="btn btn--ghost expand-btn" data-kpi-id="${mainKpi.id}"
               style="padding:2px 6px;font-size:0.7rem;border-radius:3px">
         ${isExpanded ? '▼' : '▶'}
       </button>`
    : '<span style="display:inline-block;width:22px"></span>';

  let rows = `
    <tr class="main-row ${hasContribs ? 'main-row--expandable' : ''}"
        data-kpi-id="${mainKpi.id}" data-has-contribs="${hasContribs}">
      <td>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          ${toggleBtn}
          <span style="font-weight:500">${mainKpi.name}</span>
          ${mechNote}
          ${storyBtn}
          ${isNoData ? '<span class="badge badge--warning">no data</span>' : ''}
        </div>
        ${isOtp && mainKpi.story ? renderStoryPanel(mainKpi.story) : ''}
        ${locationId === 'we' && mainKpi.rollupMethod === 'independent'
          ? `<div style="font-size:0.7rem;color:var(--slate-500);padding-left:26px;margin-top:2px">
               Mechanism B — main is entered, not summed from locations; roll-up rule to confirm with Jim.
             </div>` : ''}
      </td>
      <td class="text-right text-mono">${formatVal(mainKpi.target, mainKpi.unit)}</td>
      <td class="text-right text-mono">${isNoData ? '—' : formatVal(displayActualVal, mainKpi.unit)}</td>
      <td>${ragChip(rag)}</td>
      <td>${sourceBadge(mainKpi.source)}</td>
      <td>${chart}</td>
    </tr>`;

  // Expanded sub-rows for the current location's sibling sub-KPIs
  if (isExpanded && hasContribs) {
    const subs = mainKpi.contributors
      .map(cid => byId(dept, cid))
      .filter(Boolean);

    rows += subs.map(subKpi => {
      const subAct   = subKpi.nodata ? null : subKpi.actual;
      const subRag   = subKpi.nodata ? 'nodata'
        : ragStatus(subAct, subKpi.target, subKpi.direction || 'higher_better');
      const subChart = subKpi.series && subKpi.series.length
        ? svgLine(subKpi.series, { target: subKpi.target, width: 200, height: 56, mini: true })
        : '';

      // Highlight the active location's sub row
      const isActive = subKpi.location === locationId;
      const rowStyle = isActive
        ? 'background:var(--accent-light);'
        : '';

      return `
        <tr class="contributor-row" style="${rowStyle}">
          <td style="padding-left:36px">
            <span class="text-muted" style="font-size:0.75rem">↳</span>
            ${subKpi.name}
            ${isActive ? `<span style="font-size:0.65rem;color:var(--accent);font-weight:600;margin-left:4px">◀ selected</span>` : ''}
            ${subKpi.flag ? `<span class="flag-icon" title="${subKpi.flag.replace(/"/g,'&quot;')}">⚠</span>` : ''}
            ${subKpi.nodata ? '<span class="badge badge--warning">no data</span>' : ''}
          </td>
          <td class="text-right text-mono">${formatVal(subKpi.target, subKpi.unit)}</td>
          <td class="text-right text-mono">${subKpi.nodata ? '—' : formatVal(subAct, subKpi.unit)}</td>
          <td>${ragChip(subRag)}</td>
          <td>${sourceBadge(subKpi.source)}</td>
          <td>${subChart}</td>
        </tr>`;
    }).join('');
  }

  return rows;
}

// ─── Per-location FMDS board helpers ─────────────────────────────────────────

/**
 * Format a value from a locationBoard KPI according to its unit/targetType.
 * Different from the COO-board formatVal because:
 *  - "ratio" / "rate" → percentage
 *  - "pcs_per_labor_hour" → show raw decimal (e.g. 1.089 pcs/hr)
 *  - "aggregate_labor_hours" → show with 1 decimal and "hrs"
 *  - "count" → integer (toLocaleString)
 *  - "not_set" → "—"
 */
function formatLocVal(v, unit, targetType) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  const u = unit || targetType || '';
  if (u === 'ratio' || u === 'rate' || u === 'percent' || u === '%' || u === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (u === 'pcs_per_labor_hour') {
    return v.toFixed(3) + ' pcs/hr';
  }
  if (u === 'aggregate_labor_hours') {
    return v.toFixed(1) + ' hrs';
  }
  if (u === 'count') {
    return Math.round(v).toLocaleString();
  }
  if (u === 'not_set') return '—';
  // fallback
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
  return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

/** RAG for a per-location KPI. Respects target===0 safety special case. */
function locRag(kpi) {
  if (kpi.nodata || kpi.actual == null || kpi.target == null) return 'nodata';
  // Houston External Remakes: target is rate, actual is count — cannot auto-RAG
  if (kpi.flag && kpi.flag.startsWith('unit_mismatch')) return 'nodata';
  return ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
}

/** Category label bar */
function categoryBadge(category) {
  const colors = {
    'SAFETY':           'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5',
    'QUALITY':          'background:#fef9c3;color:#854d0e;border:1px solid #fde047',
    'SERVICE/DELIVERY': 'background:#dbeafe;color:#1e40af;border:1px solid #93c5fd',
    'COST':             'background:#d1fae5;color:#065f46;border:1px solid #6ee7b7',
    'HRD':              'background:#ede9fe;color:#4c1d95;border:1px solid #c4b5fd',
  };
  const style = colors[category] || 'background:var(--slate-100);color:var(--slate-700)';
  return `<span style="font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:3px;${style}">${category}</span>`;
}

/** Unit badge shown when the unit is non-obvious or has a mismatch warning */
function unitBadge(kpi) {
  if (!kpi.unitLabel && !kpi.unit) return '';
  const label = kpi.unitLabel || kpi.unit;
  if (label === 'ratio' || label === 'rate' || label === 'count' || label === 'not_set') return '';
  const warnStyle = (kpi.flag && kpi.flag.startsWith('unit_mismatch'))
    ? 'background:#fef3c7;color:#92400e;border:1px solid #fcd34d'
    : 'background:var(--slate-100);color:var(--slate-600)';
  return `<span style="font-size:0.62rem;padding:1px 5px;border-radius:3px;${warnStyle}" title="${kpi.unitNote || ''}">${label}</span>`;
}

/** Month sparkline: simple fixed-width inline SVG for monthly actuals */
function monthSparkline(monthlyActuals, target) {
  if (!monthlyActuals) return '';
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const vals = MONTHS.map(m => monthlyActuals[m]).filter(v => v != null && typeof v === 'number');
  if (vals.length < 2) return '';
  const W = 200, H = 52, pad = 4;
  const allVals = target != null ? [...vals, target] : vals;
  const mn = Math.min(...allVals);
  const mx = Math.max(...allVals);
  const range = mx - mn || 1;
  const px = (i) => pad + (i / (vals.length - 1)) * (W - 2 * pad);
  const py = (v) => H - pad - ((v - mn) / range) * (H - 2 * pad);
  const pts = vals.map((v, i) => `${px(i)},${py(v)}`).join(' ');
  const targetY = target != null ? py(target) : null;
  const tLine = targetY != null
    ? `<line x1="${pad}" y1="${targetY}" x2="${W - pad}" y2="${targetY}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,2"/>`
    : '';
  // Color the line by final value vs target
  let lineColor = '#64748b';
  if (target != null && vals.length) {
    const last = vals[vals.length - 1];
    // Simple: flag April OTP for Mexico (0.789 vs 0.985)
    lineColor = '#3b82f6'; // blue default
  }
  return `<svg width="${W}" height="${H}" style="display:block">
    ${tLine}
    <polyline points="${pts}" fill="none" stroke="${lineColor}" stroke-width="1.5"/>
    ${vals.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="2" fill="${lineColor}"/>`).join('')}
  </svg>`;
}

/** Render a single per-location KPI row */
function renderLocKpiRow(kpi, expandedLocKpis) {
  const rag       = locRag(kpi);
  const isExpanded = expandedLocKpis.has(kpi.id);
  const hasSubLines = Array.isArray(kpi.subLines) && kpi.subLines.length > 0;
  const hasByBldg   = Array.isArray(kpi.byBuilding) && kpi.byBuilding.length > 0;
  const hasSups     = Array.isArray(kpi.supervisors) && kpi.supervisors.length > 0;
  const hasExpandable = hasSubLines || hasByBldg || hasSups;

  const spark = kpi.monthlyActuals
    ? monthSparkline(kpi.monthlyActuals, kpi.target)
    : '';

  // Flag icons
  const flagHtml = kpi.flag
    ? `<span class="flag-icon" title="${String(kpi.flag).replace(/"/g, '&quot;')}">⚠</span>`
    : '';
  const mxOnlyBadge = kpi.mexicoOnly
    ? `<span style="font-size:0.6rem;padding:1px 5px;border-radius:3px;background:#ede9fe;color:#5b21b6;border:1px solid #c4b5fd">Mexico only</span>`
    : '';
  const nodataBadge = kpi.nodata
    ? `<span class="badge badge--warning">no data</span>`
    : '';

  const toggleBtn = hasExpandable
    ? `<button class="btn btn--ghost loc-expand-btn" data-loc-kpi="${kpi.id}"
               style="padding:2px 6px;font-size:0.7rem;border-radius:3px">${isExpanded ? '▼' : '▶'}</button>`
    : '<span style="display:inline-block;width:22px"></span>';

  let rows = `
    <tr class="main-row ${hasExpandable ? 'main-row--expandable' : ''}" data-loc-kpi-id="${kpi.id}">
      <td>
        <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
          ${toggleBtn}
          ${categoryBadge(kpi.category)}
          <span style="font-weight:500">${kpi.name}</span>
          ${unitBadge(kpi)}
          ${flagHtml}
          ${mxOnlyBadge}
          ${nodataBadge}
        </div>
        ${kpi.unitNote ? `<div style="font-size:0.68rem;color:#92400e;padding-left:26px;margin-top:2px">⚠ ${kpi.unitNote}</div>` : ''}
        ${kpi.nodataNote ? `<div style="font-size:0.68rem;color:var(--slate-500);padding-left:26px;margin-top:2px">${kpi.nodataNote}</div>` : ''}
        ${kpi.flagDetail ? `<div style="font-size:0.68rem;color:#b91c1c;padding-left:26px;margin-top:2px">⚠ ${kpi.flagDetail}</div>` : ''}
      </td>
      <td class="text-right text-mono">${kpi.target == null ? '—' : formatLocVal(kpi.target, kpi.unit, kpi.targetType)}</td>
      <td class="text-right text-mono">${kpi.nodata || kpi.actual == null ? '—' : formatLocVal(kpi.actual, kpi.unit, kpi.targetType)}</td>
      <td>${ragChip(rag)}</td>
      <td><span class="badge" style="font-size:0.65rem">FMDS Board</span></td>
      <td>${spark}</td>
    </tr>`;

  // Expanded sub-rows
  if (isExpanded && hasExpandable) {
    const items = hasSubLines ? kpi.subLines
      : hasByBldg ? kpi.byBuilding.map(b => ({
          line: `Building ${b.building}`,
          target: b.target, actual: b.actual
        }))
      : kpi.supervisors.map(s => ({
          line: `${s.name} (${s.role})`,
          target: s.target, actual: s.actual,
          note: s.note
        }));

    rows += items.map(sub => {
      const subActual = sub.actual != null ? sub.actual
        : (sub.monthlyActuals ? Object.values(sub.monthlyActuals).filter(v => v != null).pop() : null);
      const subRag = (subActual == null || sub.target == null)
        ? 'nodata'
        : ragStatus(subActual, sub.target, kpi.direction || 'higher_better');
      const subMonthsSpark = sub.monthlyActuals
        ? monthSparkline(sub.monthlyActuals, sub.target)
        : '';
      return `
        <tr class="contributor-row">
          <td style="padding-left:48px">
            <span class="text-muted" style="font-size:0.75rem">↳</span>
            ${sub.line || sub.name || ''}
            ${sub.note ? `<span style="font-size:0.65rem;color:var(--slate-500);margin-left:4px">${sub.note}</span>` : ''}
            ${subActual == null ? '<span class="badge badge--warning">no data</span>' : ''}
          </td>
          <td class="text-right text-mono">${sub.target == null ? '—' : formatLocVal(sub.target, kpi.unit, kpi.targetType)}</td>
          <td class="text-right text-mono">${subActual == null ? '—' : formatLocVal(subActual, kpi.unit, kpi.targetType)}</td>
          <td>${ragChip(subRag)}</td>
          <td></td>
          <td>${subMonthsSpark}</td>
        </tr>`;
    }).join('');
  }

  return rows;
}

/** Build the per-location FMDS board table body */
function buildLocBoardTable(locBoard, filterText, expandedLocKpis) {
  if (!locBoard || !locBoard.kpis || !locBoard.kpis.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--slate-500)">
      No per-location board data available.</td></tr>`;
  }
  let kpis = locBoard.kpis;
  if (filterText) {
    kpis = kpis.filter(k =>
      k.name.toLowerCase().includes(filterText.toLowerCase()) ||
      k.category.toLowerCase().includes(filterText.toLowerCase())
    );
  }
  if (!kpis.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--slate-500)">
      No KPIs match "${filterText}"</td></tr>`;
  }
  return kpis.map(k => renderLocKpiRow(k, expandedLocKpis)).join('');
}

/** Header strip shown above the per-location table */
function buildLocBoardHeader(locBoard) {
  if (!locBoard) return '';
  const lines = locBoard.productionLines || [];
  return `
    <div style="background:var(--slate-50);border:1px solid var(--slate-200);border-radius:var(--radius);
         padding:10px 16px;margin-bottom:12px;font-size:0.78rem;line-height:1.6">
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:baseline">
        <span><strong>${locBoard.label}</strong> FMDS Board</span>
        <span class="text-muted">${locBoard.kpiCount} KPI column-pairs in source</span>
        <span class="text-muted">${locBoard.productionLines ? locBoard.productionLines.length : 0} production lines</span>
        ${locBoard.weeklyLabel === 'DAYS' ? '<span class="badge">Cadence: DAYS</span>' : ''}
      </div>
      ${lines.length
        ? `<div style="margin-top:6px;color:var(--slate-500);font-size:0.7rem">
             Lines: ${lines.join(' · ')}
           </div>` : ''}
      ${locBoard.actualsNote
        ? `<div style="margin-top:4px;color:var(--slate-600);font-size:0.7rem;font-style:italic">
             ${locBoard.actualsNote}
           </div>` : ''}
    </div>`;
}

// ─── Full table ───────────────────────────────────────────────────────────────

function buildTable(dept, locationId, filterText, expandedIds) {
  const mainKpis = mains(dept).filter(k =>
    !filterText || k.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if (!mainKpis.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--slate-500)">
      No KPIs match "${filterText}"</td></tr>`;
  }

  return mainKpis
    .map(kpi => renderMainRow(dept, kpi, locationId, expandedIds))
    .join('');
}

// ─── Location switcher HTML ───────────────────────────────────────────────────

function buildSwitcher(activeLocation) {
  const activeChips = ACTIVE_LOCATIONS.map(loc => {
    const isActive = activeLocation === loc.id;
    return `<button class="loc-chip ${isActive ? 'loc-chip--active' : ''}" data-loc="${loc.id}">
      ${loc.label}
    </button>`;
  }).join('');

  const noDataChips = NO_DATA_LOCATIONS.map(loc =>
    `<button class="loc-chip loc-chip--disabled" disabled title="No data available for this location">
      ${loc.label} <span style="font-size:0.65rem;opacity:0.7">no data</span>
    </button>`
  ).join('');

  const weChip = `<button class="loc-chip ${activeLocation === 'we' ? 'loc-chip--active' : ''} loc-chip--we" data-loc="we">
    WE Main
  </button>`;

  return `
    <div class="loc-switcher" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;
         margin-bottom:16px;padding:12px 16px;background:var(--slate-50);
         border:1px solid var(--slate-200);border-radius:var(--radius)">
      <span style="font-size:0.7rem;font-weight:700;letter-spacing:0.06em;
                   text-transform:uppercase;color:var(--slate-500);margin-right:4px">Location</span>
      ${weChip}
      <span style="color:var(--slate-300);font-size:0.8rem">|</span>
      ${activeChips}
      <span style="color:var(--slate-300);font-size:0.8rem">|</span>
      ${noDataChips}
    </div>`;
}

// ─── Switcher styles (injected once) ─────────────────────────────────────────

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .loc-chip {
      padding: 5px 12px;
      border-radius: 999px;
      border: 1px solid var(--slate-300);
      background: #fff;
      font-size: 0.8rem;
      color: var(--slate-700);
      cursor: pointer;
      transition: background 0.1s, border-color 0.1s, color 0.1s;
      line-height: 1.4;
    }
    .loc-chip:hover:not(:disabled) {
      background: var(--slate-100);
      border-color: var(--slate-400);
    }
    .loc-chip--active {
      background: var(--accent);
      border-color: var(--accent);
      color: #fff;
      font-weight: 600;
    }
    .loc-chip--we {
      border-style: dashed;
    }
    .loc-chip--we.loc-chip--active {
      border-style: solid;
    }
    .loc-chip--disabled {
      opacity: 0.45;
      cursor: not-allowed;
      background: var(--slate-50);
      color: var(--slate-400);
    }
    .badge--info {
      background: var(--accent-light);
      color: var(--accent);
      border: 1px solid var(--accent);
      opacity: 0.85;
    }
  `;
  document.head.appendChild(style);
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderLocationBoard(dept, mount) {
  injectStyles();

  let locationId     = 'we';   // default: WE main (COO board)
  let filterText     = '';
  let expandedIds    = new Set(); // for WE-main COO-board rows
  let expandedLocIds = new Set(); // for per-location FMDS board rows

  /** True when a specific location is selected and has a locationBoard */
  function hasLocBoard(locId) {
    return locId !== 'we' && dept.locationBoards && dept.locationBoards[locId];
  }

  function renderTable() {
    const tbody = document.getElementById('lb-tbody');
    const locHeader = document.getElementById('lb-loc-header');
    if (!tbody) return;

    if (hasLocBoard(locationId)) {
      const locBoard = dept.locationBoards[locationId];
      if (locHeader) locHeader.innerHTML = buildLocBoardHeader(locBoard);
      tbody.innerHTML = buildLocBoardTable(locBoard, filterText, expandedLocIds);
      bindLocEvents();
    } else {
      if (locHeader) locHeader.innerHTML = '';
      tbody.innerHTML = buildTable(dept, locationId, filterText, expandedIds);
      bindEvents();
    }
  }

  function renderSwitcher() {
    const sw = document.getElementById('lb-switcher');
    if (sw) {
      sw.innerHTML = buildSwitcher(locationId);
      bindSwitcherEvents();
    }
  }

  function bindSwitcherEvents() {
    mount.querySelectorAll('.loc-chip[data-loc]').forEach(btn => {
      btn.addEventListener('click', () => {
        locationId = btn.dataset.loc;
        expandedIds.clear();
        expandedLocIds.clear();
        renderSwitcher();
        renderTable();
      });
    });
  }

  /** Bind expand/collapse for per-location FMDS KPI rows */
  function bindLocEvents() {
    mount.querySelectorAll('.loc-expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.locKpi;
        if (expandedLocIds.has(id)) expandedLocIds.delete(id);
        else expandedLocIds.add(id);
        renderTable();
      });
    });

    mount.querySelectorAll('[data-loc-kpi-id]').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.locKpiId;
        if (expandedLocIds.has(id)) expandedLocIds.delete(id);
        else expandedLocIds.add(id);
        renderTable();
      });
    });
  }

  function bindEvents() {
    // Story panel toggle
    const storyBtn = mount.querySelector('#otp-story-toggle');
    const storyPanel = mount.querySelector('#otp-story-panel');
    if (storyBtn && storyPanel) {
      storyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hidden = storyPanel.style.display === 'none' || !storyPanel.style.display;
        storyPanel.style.display = hidden ? 'block' : 'none';
        storyBtn.textContent = hidden ? 'ⓘ hide' : 'ⓘ story';
      });
    }

    // Expand/collapse buttons
    mount.querySelectorAll('.expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.kpiId;
        if (expandedIds.has(id)) expandedIds.delete(id);
        else expandedIds.add(id);
        renderTable();
      });
    });

    // Row click expand
    mount.querySelectorAll('.main-row--expandable').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.kpiId;
        if (expandedIds.has(id)) expandedIds.delete(id);
        else expandedIds.add(id);
        renderTable();
      });
    });
  }

  // ─── Initial paint ────────────────────────────────────────────────────────
  mount.innerHTML = `
    <div class="team-board">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
        <div>
          <h2>${dept.name} — Team Board</h2>
          <p class="text-muted text-small mt-1">L2 · ${dept.lead || ''} · Location model (Mechanism B)</p>
        </div>
        <a href="#/dept/${dept.id}/kpi" class="btn btn--ghost" style="font-size:0.8rem">
          KPI Detail →
        </a>
      </div>

      <div id="lb-switcher">
        ${buildSwitcher(locationId)}
      </div>

      <div id="lb-loc-header"></div>

      <div class="filter-row" style="margin-bottom:16px">
        <input id="lb-filter" type="search" placeholder="Filter KPIs…" style="width:240px">
      </div>

      <div class="table-wrap">
        <table id="lb-table">
          <thead>
            <tr>
              <th style="min-width:260px">KPI</th>
              <th class="text-right">Target</th>
              <th class="text-right">Actual</th>
              <th style="min-width:110px">Status</th>
              <th>Source</th>
              <th style="min-width:230px">Trend</th>
            </tr>
          </thead>
          <tbody id="lb-tbody">
            ${buildTable(dept, locationId, filterText, expandedIds)}
          </tbody>
        </table>
      </div>

      <p class="text-muted text-small mt-4">
        <strong>WE Main</strong> = COO Board independently entered (Mechanism B).
        <strong>Location tabs</strong> = per-location FMDS board (real KPI sets differ by location).
        ⚠ = data flag. Click a row to expand sub-lines.
      </p>
    </div>`;

  // Bind filter input
  const filterInput = mount.querySelector('#lb-filter');
  filterInput.addEventListener('input', (e) => {
    filterText = e.target.value;
    renderTable();
  });

  bindSwitcherEvents();
  bindEvents();
}
