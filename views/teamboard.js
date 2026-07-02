/**
 * views/teamboard.js — L2 Team Board
 *
 * renderTeamBoard(dept, mount)
 *
 * Renders:
 *  - Filter input (by KPI name)
 *  - Table of mains: name | target | actual | RAG chip | source badge | flag
 *  - Clicking a main row expands contributors + svgLine trend chart
 */

import { mains, contributorsOf } from '../lib/registry.js';
import { ragStatus }             from '../lib/rag.js';
import { svgLine }               from '../lib/charts.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function displayActual(kpi) {
  if (kpi.series && kpi.series.length) {
    return kpi.series[kpi.series.length - 1];
  }
  return kpi.actual;
}

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
  const label = { green: '● On Track', amber: '● At Risk', red: '● Off Track', nodata: '— No Data' }[status];
  return `<span class="rag-chip rag-chip--${status}">${label}</span>`;
}

function sourceBadge(source) {
  if (!source) return '';
  return `<span class="badge" title="${source}">${source.split(' / ')[0]}</span>`;
}

function flagIcon(flag) {
  if (!flag) return '';
  return `<span class="flag-icon" title="${flag.replace(/"/g, '&quot;')}">⚠</span>`;
}

// ─── Contributor row ─────────────────────────────────────────────────────────
function renderContributorRow(kpi, dept) {
  const act   = displayActual(kpi);
  const rag   = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const chart = kpi.series && kpi.series.length
    ? svgLine(kpi.series, { target: kpi.target, width: 200, height: 56, mini: true })
    : '';

  return `
    <tr class="contributor-row">
      <td style="padding-left:36px">
        <span class="text-muted" style="font-size:0.75rem">↳</span>
        ${kpi.name}
        ${flagIcon(kpi.flag)}
        ${kpi.nodata ? '<span class="badge badge--warning">no data</span>' : ''}
      </td>
      <td class="text-right text-mono">${formatVal(kpi.target, kpi.unit)}</td>
      <td class="text-right text-mono">${formatVal(act, kpi.unit)}</td>
      <td>${kpi.nodata ? '' : ragChip(rag)}</td>
      <td>${sourceBadge(kpi.source)}</td>
      <td>${chart}</td>
    </tr>`;
}

// ─── Main KPI row ─────────────────────────────────────────────────────────
function renderMainRow(kpi, dept, expanded) {
  const act   = displayActual(kpi);
  const rag   = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const chart = kpi.series && kpi.series.length
    ? svgLine(kpi.series, { target: kpi.target, width: 220, height: 60, mini: false })
    : '';
  const hasContribs = kpi.contributors && kpi.contributors.length > 0;
  const toggleBtn = hasContribs
    ? `<button class="btn btn--ghost expand-btn" data-kpi-id="${kpi.id}"
               style="padding:2px 6px;font-size:0.7rem;border-radius:3px">
         ${expanded ? '▼' : '▶'}
       </button>`
    : '<span style="display:inline-block;width:22px"></span>';

  return `
    <tr class="main-row ${hasContribs ? 'main-row--expandable' : ''}"
        data-kpi-id="${kpi.id}" data-has-contribs="${hasContribs}">
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          ${toggleBtn}
          <span style="font-weight:500">${kpi.name}</span>
          ${flagIcon(kpi.flag)}
          ${kpi.illustrative ? '<span class="badge badge--illustrative">illustrative</span>' : ''}
          ${kpi.nodata ? '<span class="badge badge--warning">no data</span>' : ''}
        </div>
      </td>
      <td class="text-right text-mono">${formatVal(kpi.target, kpi.unit)}</td>
      <td class="text-right text-mono">${formatVal(act, kpi.unit)}</td>
      <td>${kpi.nodata ? '' : ragChip(rag)}</td>
      <td>${sourceBadge(kpi.source)}</td>
      <td>${chart}</td>
    </tr>`;
}

// ─── Full table render ────────────────────────────────────────────────────────
function buildTableHTML(dept, filterText, expandedIds) {
  const mainKpis = mains(dept).filter(k =>
    !filterText || k.name.toLowerCase().includes(filterText.toLowerCase())
  );

  if (!mainKpis.length) {
    return `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--slate-500)">
      No KPIs match "${filterText}"</td></tr>`;
  }

  return mainKpis.map(kpi => {
    const isExpanded = expandedIds.has(kpi.id);
    const mainHtml   = renderMainRow(kpi, dept, isExpanded);

    let contribHtml = '';
    if (isExpanded && kpi.contributors && kpi.contributors.length) {
      const contribs = contributorsOf(dept, kpi.id);
      contribHtml = contribs.map(c => renderContributorRow(c, dept)).join('');
    }

    return mainHtml + contribHtml;
  }).join('');
}

// ─── Public entry point ───────────────────────────────────────────────────────
export function renderTeamBoard(dept, mount) {
  let filterText  = '';
  let expandedIds = new Set();

  function render() {
    const tbody = document.getElementById('tb-tbody');
    if (tbody) {
      tbody.innerHTML = buildTableHTML(dept, filterText, expandedIds);
      bindRowEvents();
    }
  }

  function bindRowEvents() {
    // Expand/collapse via button click
    mount.querySelectorAll('.expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.kpiId;
        if (expandedIds.has(id)) expandedIds.delete(id);
        else expandedIds.add(id);
        render();
      });
    });

    // Also expand via row click (only expandable rows)
    mount.querySelectorAll('.main-row--expandable').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.kpiId;
        if (expandedIds.has(id)) expandedIds.delete(id);
        else expandedIds.add(id);
        render();
      });
    });
  }

  // Frozen banner (Finance Tier 3)
  const frozenBanner = dept.frozen
    ? `<div class="frozen-banner" role="status">
         <strong>⚠ ${dept.frozenNote || 'Frozen — Phase 2'}</strong>
         <span class="text-muted" style="margin-left:12px;font-size:0.8rem">
           KPI view only — no interactive problem-solving or standard-work until Phase 2.
         </span>
       </div>`
    : '';

  // Marketing Hermes agent note
  const hermesNote = dept.id === 'marketing'
    ? `<div class="agent-note" style="margin-bottom:12px">
         <span class="badge" style="background:var(--accent-light);color:var(--accent);margin-right:6px">Agent Layer</span>
         Carlos's <strong>Hermes agent</strong> can wrap this board — the agent integration layer is intentionally left open for Hermes to connect as the Marketing automation layer.
       </div>`
    : '';

  // Initial render
  mount.innerHTML = `
    <div class="team-board">
      ${frozenBanner}
      ${hermesNote}
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
        <div>
          <h2>${dept.name} — Team Board</h2>
          <p class="text-muted text-small mt-1">L2 · ${dept.lead || ''}</p>
        </div>
        <a href="#/dept/${dept.id}/kpi" class="btn btn--ghost" style="font-size:0.8rem">
          KPI Detail →
        </a>
      </div>

      <div class="filter-row" style="margin-bottom:16px">
        <input id="tb-filter" type="search" placeholder="Filter KPIs…" style="width:240px" ${dept.frozen ? 'disabled' : ''}>
      </div>

      <div class="table-wrap">
        <table id="tb-table">
          <thead>
            <tr>
              <th style="min-width:220px">KPI</th>
              <th class="text-right">Target</th>
              <th class="text-right">Actual</th>
              <th style="min-width:110px">Status</th>
              <th>Source</th>
              <th style="min-width:230px">Trend (8 wk)</th>
            </tr>
          </thead>
          <tbody id="tb-tbody">
            ${buildTableHTML(dept, filterText, expandedIds)}
          </tbody>
        </table>
      </div>

      <p class="text-muted text-small mt-4">
        ${dept.frozen
          ? 'Finance is KPI-display only — restructure + NetSuite sunset in progress (Phase 2).'
          : 'Click a row to expand contributors. ⚠ = data flag.'}
      </p>
    </div>`;

  // Bind filter
  const filterInput = mount.querySelector('#tb-filter');
  filterInput.addEventListener('input', (e) => {
    filterText = e.target.value;
    render();
  });

  bindRowEvents();
}
