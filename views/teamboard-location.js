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
 *  - WE main row renders the independently-entered number with a Mechanism B note
 *  - OTP row: info affordance surfaces the embedded T3 story
 *  - Mexico OTP renders RED (0.750; weekly 0.39–0.55 chart)
 *  - All other KPI actuals switch to the selected location's contributor value
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
  if (unit === 'ratio') {
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

  let locationId  = 'we';      // default: WE main
  let filterText  = '';
  let expandedIds = new Set();

  function renderTable() {
    const tbody = document.getElementById('lb-tbody');
    if (tbody) {
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
        renderSwitcher();
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
        Click a row to expand all location contributors. ⚠ = data flag.
        WE Main = independently entered (Mechanism B).
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
