/**
 * views/kpi.js — KPI Boards (main → sub-KPI connection drill)
 *
 * renderKpi(dept, mount)
 *
 * The other-department counterpart to the Operations location board: a lighter
 * connection + explanation view. Every main KPI is click-in to its sub-KPIs
 * (the L2 → main → sub cascade connection). On expand each main leads with a
 * per-KPI explanation block (measures / source / why now), then lists its
 * sub-KPIs (contributors), then a "details" toggle exposing the full KPI
 * identity (single source of truth, RAG rule, owner, cadence, context/history).
 *
 * Operations keeps its richer operator-control board (teamboard-location.js);
 * this view is the KPI-connection drill for everyone else.
 */

import { mains, contributorsOf } from '../lib/registry.js';
import { ragStatus }             from '../lib/rag.js';
import { svgLine }               from '../lib/charts.js';
import { explainKpi }            from '../lib/explain.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function displayActual(kpi) {
  if (kpi.series && kpi.series.length) return kpi.series[kpi.series.length - 1];
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
  if (unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function ragChip(status) {
  const label = { green: '● On Track', amber: '● At Risk', red: '● Off Track', nodata: '— No Data' }[status];
  return `<span class="rag-chip rag-chip--${status}">${label}</span>`;
}

function sourceBadge(source, kpi) {
  const ts = (kpi && kpi.targetSource) ? kpi.targetSource : source;
  if (!ts) return '';
  const isManual = kpi && kpi.manualOnly === true;
  const label = ts.split(' / ')[0];
  if (isManual) {
    return `<span class="badge" title="Manual entry — no source system" style="background:#fee2e2;color:#991b1b;border:1px solid #fca5a5">${label}</span>`;
  }
  const wasReKeyed = source && source !== ts &&
    ['manual', 'hand-keyed', 'coo board', 'literal', 'bowler'].some(tok => source.toLowerCase().includes(tok));
  if (wasReKeyed) {
    return `<span class="badge" title="Target: ${ts} (today: re-keyed from ${source})" style="background:#f0fdf4;color:#166534;border:1px solid #86efac">${label}</span>`;
  }
  return `<span class="badge" title="${ts}">${label}</span>`;
}

function flagIcon(flag) {
  if (!flag) return '';
  return `<span class="flag-icon" title="${String(flag).replace(/"/g, '&quot;')}">⚠</span>`;
}

function ragRuleText(kpi) {
  const dir   = kpi.direction || 'higher_better';
  const bands = kpi.bands || { green: 1.0, amber: 0.95 };
  const dirLabel = dir === 'higher_better' ? 'Higher is better' : 'Lower is better';
  return `${dirLabel} · Green ≥ ${(bands.green * 100).toFixed(0)}% of target · Amber ≥ ${(bands.amber * 100).toFixed(0)}% of target · Red < ${(bands.amber * 100).toFixed(0)}% of target`;
}

function cascadeLabel(level) {
  if (level === 1) return 'Main (L1)';
  if (level === 2) return 'Contributor (L2)';
  if (level === 3) return 'Rep / Sub-contributor (L3)';
  return `Level ${level}`;
}

// ─── Per-KPI explanation block ───────────────────────────────────────────────

function renderExplainBlock(kpi, dept) {
  const act = displayActual(kpi);
  const rag = (act == null || kpi.target == null)
    ? 'nodata'
    : ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const e = explainKpi(kpi, dept, { rag, actualOverride: act });
  return `
    <div class="kpi-explain">
      <div class="kpi-explain__label">What this KPI means</div>
      <div class="kpi-explain__grid">
        <div><span class="kpi-explain__k">Measures</span> ${e.definition}</div>
        <div><span class="kpi-explain__k">Source</span> ${e.source}</div>
        <div><span class="kpi-explain__k">Why now</span> ${e.why}</div>
      </div>
    </div>`;
}

// ─── Identity details (behind a toggle) ──────────────────────────────────────

function renderDetails(kpi, dept, contribs) {
  const contribChips = contribs.length
    ? contribs.map(c => `<span class="badge">${c.name}</span>`).join(' ')
    : '<span class="text-muted">none</span>';

  return `
    <div class="kpi-details" data-details-for="${kpi.id}" style="display:none">
      <div class="identity-fields">
        <div class="identity-field">
          <div class="identity-label">Cascade Position</div>
          <div>${cascadeLabel(kpi.level || 1)}</div>
        </div>
        <div class="identity-field">
          <div class="identity-label">Single Source of Truth</div>
          <div><span class="badge">${kpi.targetSource || kpi.source || '—'}</span></div>
        </div>
        <div class="identity-field">
          <div class="identity-label">RAG Rule</div>
          <div class="text-small text-muted">${ragRuleText(kpi)}</div>
        </div>
        <div class="identity-field">
          <div class="identity-label">Owner</div>
          <div>${dept.lead || '—'}</div>
        </div>
        <div class="identity-field">
          <div class="identity-label">Roll-up Method</div>
          <div class="text-small text-muted">${kpi.rollupMethod || dept.mechanism || '—'}</div>
        </div>
        <div class="identity-field">
          <div class="identity-label">Cadence</div>
          <div>Weekly</div>
        </div>
        <div class="identity-field">
          <div class="identity-label">Contributors</div>
          <div class="cluster gap-1">${contribChips}</div>
        </div>
        ${kpi.flag ? `
        <div class="identity-field">
          <div class="identity-label">Data Flag</div>
          <div class="badge badge--warning" style="display:inline-flex;max-width:100%;white-space:normal;line-height:1.4">⚠ ${kpi.flag}</div>
        </div>` : ''}
        ${kpi.note ? `
        <div class="identity-field">
          <div class="identity-label">Context / History</div>
          <div class="text-small text-muted" style="line-height:1.5">${kpi.note}</div>
        </div>` : ''}
      </div>
    </div>`;
}

// ─── Sub-KPI (contributor) row ───────────────────────────────────────────────

function renderSubRow(kpi) {
  const act   = displayActual(kpi);
  const rag   = (act == null || kpi.target == null)
    ? 'nodata'
    : ragStatus(act, kpi.target, kpi.direction || 'higher_better');
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
      <td class="text-right text-mono">${kpi.nodata ? '—' : formatVal(act, kpi.unit)}</td>
      <td>${kpi.nodata ? '' : ragChip(rag)}</td>
      <td>${sourceBadge(kpi.source, kpi)}</td>
      <td>${chart}</td>
    </tr>`;
}

// ─── Main KPI row ────────────────────────────────────────────────────────────

function renderMainRow(kpi, dept, expanded) {
  const act   = displayActual(kpi);
  const rag   = (act == null || kpi.target == null)
    ? 'nodata'
    : ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const chart = kpi.series && kpi.series.length
    ? svgLine(kpi.series, { target: kpi.target, width: 220, height: 60, mini: false })
    : '';
  const toggleBtn = `<button class="btn btn--ghost expand-btn" data-kpi-id="${kpi.id}"
               style="padding:2px 6px;font-size:0.7rem;border-radius:3px">${expanded ? '▼' : '▶'}</button>`;

  return `
    <tr class="main-row main-row--expandable" data-kpi-id="${kpi.id}">
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
      <td class="text-right text-mono">${kpi.nodata ? '—' : formatVal(act, kpi.unit)}</td>
      <td>${kpi.nodata ? '' : ragChip(rag)}</td>
      <td>${sourceBadge(kpi.source, kpi)}</td>
      <td>${chart}</td>
    </tr>`;
}

// ─── Expansion row (explanation + sub-KPIs + details toggle) ─────────────────

function renderExpansion(kpi, dept) {
  const contribs = contributorsOf(dept, kpi.id);
  const subRows = contribs.length
    ? contribs.map(renderSubRow).join('')
    : '';
  const subSection = contribs.length
    ? `<table style="width:100%;border-collapse:collapse;margin-top:10px"><tbody>${subRows}</tbody></table>`
    : `<p class="text-muted text-small" style="margin-top:8px">No sub-KPIs connect to this main — it is entered directly.</p>`;

  return `
    <tr class="kpi-expansion-row" data-expansion-for="${kpi.id}">
      <td colspan="6" style="padding:0">
        <div class="kpi-expansion">
          ${renderExplainBlock(kpi, dept)}
          <div class="kpi-expansion__subs">
            <div class="kpi-explain__label" style="color:var(--slate-500);margin:10px 0 2px">Sub-KPI connections</div>
            ${subSection}
          </div>
          <button class="btn btn--ghost details-toggle" data-details-toggle="${kpi.id}"
                  style="margin-top:10px;font-size:0.72rem;padding:3px 9px;border-radius:3px">
            ▸ KPI details (source · RAG rule · owner · cadence)
          </button>
          ${renderDetails(kpi, dept, contribs)}
        </div>
      </td>
    </tr>`;
}

// ─── Full table ──────────────────────────────────────────────────────────────

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
    let html = renderMainRow(kpi, dept, isExpanded);
    if (isExpanded) html += renderExpansion(kpi, dept);
    return html;
  }).join('');
}

// ─── Styles (injected once) ──────────────────────────────────────────────────

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .kpi-expansion { padding: 8px 8px 14px; background: var(--slate-50, #f8fafc); }
    .kpi-explain {
      background: var(--accent-light, #eef3ff);
      border-left: 3px solid var(--accent, #2f6bff);
      padding: 10px 16px 10px 22px;
      border-radius: var(--radius, 6px);
    }
    .kpi-explain__label {
      font-size: 0.62rem; font-weight: 700; letter-spacing: 0.07em;
      text-transform: uppercase; color: var(--accent, #2f6bff); margin-bottom: 6px;
    }
    .kpi-explain__grid { display: grid; gap: 4px; font-size: 0.8rem; line-height: 1.55; color: var(--slate-700, #334155); }
    .kpi-explain__k {
      display: inline-block; min-width: 66px; font-weight: 700; color: var(--slate-500, #64748b);
      font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.03em; margin-right: 6px;
    }
    .kpi-details { margin-top: 8px; padding: 10px 16px; background: #fff; border: 1px solid var(--slate-200, #e2e8f0); border-radius: var(--radius, 6px); }
  `;
  document.head.appendChild(style);
}

// ─── Public entry point ──────────────────────────────────────────────────────

export function renderKpi(dept, mount) {
  injectStyles();
  let filterText  = '';
  let expandedIds = new Set();

  function render() {
    const tbody = document.getElementById('kpi-tbody');
    if (tbody) {
      tbody.innerHTML = buildTableHTML(dept, filterText, expandedIds);
      bindRowEvents();
    }
  }

  function bindRowEvents() {
    mount.querySelectorAll('.expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.kpiId;
        if (expandedIds.has(id)) expandedIds.delete(id); else expandedIds.add(id);
        render();
      });
    });
    mount.querySelectorAll('.main-row--expandable').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.kpiId;
        if (expandedIds.has(id)) expandedIds.delete(id); else expandedIds.add(id);
        render();
      });
    });
    // "details" toggle inside an expansion — reveal identity fields in place
    mount.querySelectorAll('.details-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.detailsToggle;
        const panel = mount.querySelector(`.kpi-details[data-details-for="${id}"]`);
        if (!panel) return;
        const hidden = panel.style.display === 'none' || !panel.style.display;
        panel.style.display = hidden ? 'block' : 'none';
        btn.textContent = hidden
          ? '▾ Hide KPI details'
          : '▸ KPI details (source · RAG rule · owner · cadence)';
      });
    });
  }

  mount.innerHTML = `
    <div class="team-board">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
        <div>
          <h2>${dept.name} — KPI Boards</h2>
          <p class="text-muted text-small mt-1">Click any KPI to see its sub-KPI connections + an explanation of what it measures and why it's at this status.</p>
        </div>
        <a href="#/dept/${dept.id}/team" class="btn btn--ghost" style="font-size:0.8rem">← Overview</a>
      </div>

      <div class="filter-row" style="margin-bottom:16px">
        <input id="kpi-filter" type="search" placeholder="Filter KPIs…" style="width:240px">
      </div>

      <div class="table-wrap">
        <table id="kpi-table">
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
          <tbody id="kpi-tbody">
            ${buildTableHTML(dept, filterText, expandedIds)}
          </tbody>
        </table>
      </div>

      <p class="text-muted text-small mt-4">
        Click a main KPI to drill in: main → sub-KPI cascade connection, with a plain-language
        explanation on top and full KPI identity behind the "details" toggle. ⚠ = data flag.
      </p>
    </div>`;

  const filterInput = mount.querySelector('#kpi-filter');
  filterInput.addEventListener('input', (e) => {
    filterText = e.target.value;
    render();
  });

  bindRowEvents();
}
