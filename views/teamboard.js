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
import { getReasonsByDept }      from '../lib/reasons.js';

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

function sourceBadge(source, kpi) {
  // Prefer targetSource (the FMDS OS sourcing plan) over current source
  const ts = (kpi && kpi.targetSource) ? kpi.targetSource : source;
  if (!ts) return '';
  const isManual = kpi && kpi.manualOnly === true;
  const label = ts.split(' / ')[0];
  if (isManual) {
    return `<span class="badge" title="Manual entry — no source system" style="background:var(--red-bg);color:var(--red-text);border:1px solid var(--red-border)">${label}</span>`;
  }
  const wasReKeyed = source && source !== ts &&
    ['manual', 'hand-keyed', 'coo board', 'literal', 'bowler'].some(tok => source.toLowerCase().includes(tok));
  if (wasReKeyed) {
    return `<span class="badge" title="Target: ${ts} (today: re-keyed from ${source})" style="background:var(--green-bg);color:var(--green-text);border:1px solid var(--green-border)">${label}</span>`;
  }
  return `<span class="badge" title="${ts}">${label}</span>`;
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
      <td>${sourceBadge(kpi.source, kpi)}</td>
      <td>${chart}</td>
    </tr>`;
}

// ─── Why panel ────────────────────────────────────────────────────────────────
// Renders below the contributor rows when a main KPI is expanded.
// Shows: (1) heading "Why is <KPI> <status>?", (2) sorted contributors list
// with biggest drag first, (3) floor context from L1 reasons, (4) Run 8-Step btn.

function whyHeading(kpi, rag) {
  const verb = rag === 'red' ? 'red' : rag === 'amber' ? 'at risk' : 'on track';
  const suffix = rag === 'red' ? '?' : rag === 'amber' ? '?' : '';
  if (rag === 'green') return `Why is ${kpi.name} on track${suffix}`;
  return `Why is ${kpi.name} ${verb}${suffix}`;
}

function relativeTime(isoStr) {
  if (!isoStr) return '';
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Compute drag: positive = pulls main down (red/amber), negative = lifts (green).
// Returns a signed fraction: (actual - target) / target.  Lower = bigger drag.
function dragScore(kpi) {
  const act = displayActual(kpi);
  if (act == null || !kpi.target || kpi.target === 0) return 0;
  const dir = kpi.direction || 'higher_better';
  if (dir === 'higher_better') {
    return (act - kpi.target) / Math.abs(kpi.target); // negative = below target = drag
  }
  // lower_better: over target = drag (positive diff from target)
  return (kpi.target - act) / Math.abs(kpi.target);
}

function renderWhyPanel(kpi, dept, contribs, rag) {
  // --- Sorted contributors: biggest drag first (lowest dragScore first for higher_better) ---
  const sorted = [...contribs].sort((a, b) => dragScore(a) - dragScore(b));

  const contributorRows = sorted.map(c => {
    const act  = displayActual(c);
    const cRag = ragStatus(act, c.target, c.direction || 'higher_better');
    const drag = dragScore(c);
    const dragCls = drag < -0.05 ? 'why-drag why-drag--down'
                  : drag >  0.05 ? 'why-drag why-drag--up'
                  : 'why-drag why-drag--neutral';
    const dragLabel = drag < -0.05 ? `↓ ${Math.abs(drag * 100).toFixed(0)}% below`
                    : drag >  0.05 ? `↑ ${(drag * 100).toFixed(0)}% above`
                    : 'on target';

    return `
      <div class="why-contributor">
        <div class="why-contributor__name">${c.name}</div>
        <div class="why-contributor__metrics">
          <span class="text-mono why-mono">${formatVal(act, c.unit)}</span>
          <span class="why-vs">vs</span>
          <span class="text-mono why-mono why-mono--target">${formatVal(c.target, c.unit)}</span>
          ${ragChip(cRag)}
          <span class="${dragCls}">${dragLabel}</span>
        </div>
      </div>`;
  }).join('');

  // --- Floor context: L1 reasons relevant to this KPI ---
  // Match: reason.kpiId === kpi.id  OR  reason.entityId matches a contributor/rep id
  const contributorIds = new Set(contribs.map(c => c.id));
  // Also include rep-level KPIs (level 3) that are contributors of these contributors
  const allReasons = (typeof getReasonsByDept === 'function')
    ? getReasonsByDept(dept.id)
    : [];

  const relevant = allReasons.filter(r =>
    r.kpiId === kpi.id ||
    contributorIds.has(r.kpiId) ||
    contributorIds.has(r.entityId)
  );

  const floorHtml = relevant.length
    ? relevant.map(r => `
        <div class="floor-reason floor-reason--${r.status}">
          <div class="floor-reason__meta">
            <span class="floor-reason__author">${r.author}</span>
            <span class="floor-reason__time">${relativeTime(r.ts)}</span>
          </div>
          <div class="floor-reason__text">${r.text}</div>
        </div>`).join('')
    : `<p class="why-empty">No floor context logged yet — the rep hasn't left a note.</p>`;

  return `
    <tr class="why-panel-row" data-why-for="${kpi.id}">
      <td colspan="6" style="padding:0">
        <div class="why-panel">
          <div class="why-panel__head">
            <span class="why-panel__title">${whyHeading(kpi, rag)}</span>
            <a class="btn btn--ghost btn--sm why-solve-btn"
               href="#/dept/${dept.id}/solve?kpi=${encodeURIComponent(kpi.id)}"
               data-dept="${dept.id}" data-kpi="${kpi.id}">
              Run 8-Step →
            </a>
          </div>

          <div class="why-panel__section">
            <div class="why-panel__section-label">Contributors</div>
            ${sorted.length
              ? `<div class="why-contributors">${contributorRows}</div>`
              : `<p class="why-empty">No contributors defined for this KPI.</p>`}
          </div>

          <div class="why-panel__section">
            <div class="why-panel__section-label">Context from the floor</div>
            <div class="why-floor">${floorHtml}</div>
          </div>
        </div>
      </td>
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
      <td>${sourceBadge(kpi.source, kpi)}</td>
      <td>${chart}</td>
    </tr>`;
}

// ─── Marketing two-owner L2 group header ─────────────────────────────────────
// Renders a full-width sub-board divider row showing the board name + owner badge.
// Only called when dept.id === 'marketing' and we detect a boardId boundary.

function renderOwnerGroupHeader(boardId, dept) {
  if (!dept.l2Boards) return '';
  const board = dept.l2Boards.find(b => b.boardId === boardId);
  if (!board) return '';

  const ownerColor = board.ownerCode === 'PC'
    ? 'background:var(--viz-4-bg);color:hsl(var(--viz-4));border:1px solid hsl(var(--viz-4) / .35)'
    : 'background:var(--viz-single-bg);color:hsl(var(--viz-single));border:1px solid hsl(var(--viz-single) / .35)';

  return `
    <tr class="owner-group-header">
      <td colspan="6" style="padding:10px 16px 6px;border-top:2px solid var(--slate-200)">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="font-weight:700;font-size:0.85rem;color:var(--slate-900)">${board.domain || boardId}</span>
          <span style="font-size:0.72rem;padding:2px 8px;border-radius:999px;font-weight:700;${ownerColor}">
            Owner: ${board.ownerName || board.ownerCode}
          </span>
          <span style="font-size:0.68rem;color:var(--slate-500)">${board.file || ''}</span>
          <span style="font-size:0.68rem;color:var(--slate-400);margin-left:auto">${board.actualsStatus || ''}</span>
        </div>
      </td>
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

  // For Marketing: group mains by boardId to surface the two-owner structure
  const isMarketing = dept.id === 'marketing' && Array.isArray(dept.l2Boards);

  if (isMarketing) {
    // Build ordered list of boardIds from l2Boards definition order
    const boardOrder = dept.l2Boards.map(b => b.boardId);
    // Group mains by boardId; preserve KPIs with no boardId in a fallback group
    const groups = new Map();
    boardOrder.forEach(bid => groups.set(bid, []));
    mainKpis.forEach(kpi => {
      const bid = kpi.boardId || '_ungrouped';
      if (!groups.has(bid)) groups.set(bid, []);
      groups.get(bid).push(kpi);
    });

    let html = '';
    for (const [boardId, kpis] of groups) {
      if (!kpis.length) continue;
      html += renderOwnerGroupHeader(boardId, dept);
      html += kpis.map(kpi => {
        const isExpanded = expandedIds.has(kpi.id);
        const mainHtml   = renderMainRow(kpi, dept, isExpanded);
        let contribHtml = '';
        let whyHtml     = '';
        if (isExpanded && kpi.contributors && kpi.contributors.length) {
          const contribs = contributorsOf(dept, kpi.id);
          contribHtml = contribs.map(c => renderContributorRow(c, dept)).join('');
          const act = displayActual(kpi);
          const rag = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
          whyHtml = renderWhyPanel(kpi, dept, contribs, rag);
        }
        return mainHtml + contribHtml + whyHtml;
      }).join('');
    }
    return html;
  }

  return mainKpis.map(kpi => {
    const isExpanded = expandedIds.has(kpi.id);
    const mainHtml   = renderMainRow(kpi, dept, isExpanded);

    let contribHtml = '';
    let whyHtml     = '';
    if (isExpanded && kpi.contributors && kpi.contributors.length) {
      const contribs = contributorsOf(dept, kpi.id);
      contribHtml = contribs.map(c => renderContributorRow(c, dept)).join('');
      // Why panel: appended after contributor rows
      const act = displayActual(kpi);
      const rag = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
      whyHtml = renderWhyPanel(kpi, dept, contribs, rag);
    }

    return mainHtml + contribHtml + whyHtml;
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

  // Marketing Hermes agent note + two-owner callout
  const hermesNote = dept.id === 'marketing'
    ? `<div class="agent-note" style="margin-bottom:8px">
         <span class="badge" style="background:var(--accent-light);color:var(--accent);margin-right:6px">Agent Layer</span>
         Carlos's <strong>Hermes agent</strong> can wrap this board — the agent integration layer is intentionally left open for Hermes to connect as the Marketing automation layer.
       </div>
       <div style="margin-bottom:14px;padding:10px 14px;border-radius:var(--radius);
            background:var(--info-bg);border:1px solid var(--info-border);font-size:0.8rem;line-height:1.6">
         <strong style="color:var(--info-text)">Two-owner L2 model:</strong>
         Marketing is the only FMDS department with two distinct L2 owners operating in separate boards.
         <span style="display:inline-flex;align-items:center;gap:4px;margin:0 4px;padding:1px 7px;border-radius:999px;
              background:var(--viz-4-bg);color:hsl(var(--viz-4));font-weight:700;font-size:0.72rem">PC</span>
         owns <em>Branding &amp; Creative</em> (search visibility, social, PR, agency accountability).
         <span style="display:inline-flex;align-items:center;gap:4px;margin:0 4px;padding:1px 7px;border-radius:999px;
              background:var(--viz-single-bg);color:hsl(var(--viz-single));font-weight:700;font-size:0.72rem">Carlos Mitchell</span>
         owns <em>Ecomm &amp; Performance Marketing</em> (ecomm revenue, paid channels, demand gen / leads pipeline).
         KPIs below are grouped by board with the owner identified.
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
          : 'Click a row to expand contributors + Why panel (floor context + 8-step). ⚠ = data flag.'}
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
