/**
 * views/kpi.js — KPI cascade list + identity card
 *
 * renderKpi(dept, mount)
 *
 * Left: cascade list grouped by level (1 = main, 2 = sub, 3 = rep)
 * Right panel: clicking a KPI opens its identity card with:
 *   - definition / note
 *   - cascade position
 *   - single source of truth + data flag
 *   - RAG rule (bands, direction)
 *   - owner + email (from dept.lead)
 *   - cadence
 *   - contributor chips
 *   - context / history (note field)
 */

import { byId, mains, contributorsOf } from '../lib/registry.js';
import { ragStatus }                   from '../lib/rag.js';
import { svgLine }                     from '../lib/charts.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  if (unit === 'ratio') return (v * 100).toFixed(1) + '%';
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function ragChip(status) {
  const label = { green: '● On Track', amber: '● At Risk', red: '● Off Track', nodata: '— No Data' }[status];
  return `<span class="rag-chip rag-chip--${status}">${label}</span>`;
}

function ragRuleText(kpi) {
  const dir   = kpi.direction || 'higher_better';
  const bands = kpi.bands || { green: 1.0, amber: 0.95 };
  const dirLabel = dir === 'higher_better' ? 'Higher is better' : 'Lower is better';
  return `${dirLabel} · Green ≥ ${(bands.green * 100).toFixed(0)}% of target · Amber ≥ ${(bands.amber * 100).toFixed(0)}%  of target · Red < ${(bands.amber * 100).toFixed(0)}% of target`;
}

function cascadeLabel(level) {
  if (level === 1) return 'Main (L1)';
  if (level === 2) return 'Contributor (L2)';
  if (level === 3) return 'Rep / Sub-contributor (L3)';
  return `Level ${level}`;
}

// ─── Identity card ────────────────────────────────────────────────────────────

function renderCard(kpi, dept) {
  const act      = displayActual(kpi);
  const rag      = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const contribs = contributorsOf(dept, kpi.id);

  const contribChips = contribs.length
    ? contribs.map(c => `<span class="badge">${c.name}</span>`).join(' ')
    : '<span class="text-muted">none</span>';

  const chart = kpi.series && kpi.series.length
    ? `<div style="margin-top:12px">${svgLine(kpi.series, { target: kpi.target, width: 360, height: 80 })}</div>`
    : '';

  const flagBlock = kpi.flag
    ? `<div class="identity-field">
         <div class="identity-label">Data Flag</div>
         <div class="badge badge--warning" style="display:inline-flex;max-width:100%;white-space:normal;line-height:1.4">
           ⚠ ${kpi.flag}
         </div>
       </div>`
    : '';

  return `
    <div class="identity-card card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:16px">
        <div>
          <h3 style="font-size:1rem;line-height:1.3">${kpi.name}</h3>
          <p class="text-muted text-small mt-1">${kpi.unit || ''}</p>
        </div>
        ${ragChip(rag)}
      </div>

      ${chart}

      <div class="identity-fields" style="margin-top:16px">

        <div class="identity-field">
          <div class="identity-label">Cascade Position</div>
          <div>${cascadeLabel(kpi.level || 1)}</div>
        </div>

        <div class="identity-field">
          <div class="identity-label">Target</div>
          <div class="text-mono">${formatVal(kpi.target, kpi.unit)}</div>
        </div>

        <div class="identity-field">
          <div class="identity-label">Actual (latest)</div>
          <div class="text-mono">${formatVal(act, kpi.unit)}</div>
        </div>

        <div class="identity-field">
          <div class="identity-label">Single Source of Truth</div>
          <div><span class="badge">${kpi.source || '—'}</span></div>
        </div>

        ${flagBlock}

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

        ${kpi.note ? `
        <div class="identity-field">
          <div class="identity-label">Context / History</div>
          <div class="text-small text-muted" style="line-height:1.5">${kpi.note}</div>
        </div>` : ''}

      </div>
    </div>`;
}

// ─── Cascade list ─────────────────────────────────────────────────────────────

function renderCascadeList(dept, selectedId) {
  // Group by level
  const levels = {};
  dept.kpis.forEach(k => {
    const lv = k.level || 1;
    if (!levels[lv]) levels[lv] = [];
    levels[lv].push(k);
  });

  return Object.keys(levels).sort().map(lv => {
    const items = levels[lv].map(k => {
      const act = displayActual(k);
      const rag = ragStatus(act, k.target, k.direction || 'higher_better');
      const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;
                   background:var(--rag-${rag});flex-shrink:0;margin-top:3px"></span>`;
      return `
        <button class="kpi-list-item ${k.id === selectedId ? 'kpi-list-item--active' : ''}"
                data-kpi-id="${k.id}">
          ${dot}
          <span>${k.name}</span>
          ${k.flag ? '<span style="font-size:0.7rem">⚠</span>' : ''}
        </button>`;
    }).join('');

    return `
      <div class="kpi-group">
        <div class="kpi-group-label">${cascadeLabel(Number(lv))}</div>
        ${items}
      </div>`;
  }).join('');
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderKpi(dept, mount) {
  const firstMain = mains(dept)[0];
  let selectedId  = firstMain ? firstMain.id : (dept.kpis[0] ? dept.kpis[0].id : null);

  function render() {
    const listEl = mount.querySelector('#kpi-list');
    const cardEl = mount.querySelector('#kpi-card');

    if (listEl) listEl.innerHTML = renderCascadeList(dept, selectedId);
    if (cardEl) {
      const kpi = selectedId ? byId(dept, selectedId) : null;
      cardEl.innerHTML = kpi
        ? renderCard(kpi, dept)
        : `<p class="text-muted">Select a KPI on the left.</p>`;
    }

    // Rebind clicks
    mount.querySelectorAll('.kpi-list-item').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedId = btn.dataset.kpiId;
        render();
      });
    });
  }

  mount.innerHTML = `
    <div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
        <div>
          <h2>${dept.name} — KPI Cascade</h2>
          <p class="text-muted text-small mt-1">Click a KPI to open its identity card.</p>
        </div>
        <a href="#/dept/${dept.id}/team" class="btn btn--ghost" style="font-size:0.8rem">
          ← Team Board
        </a>
      </div>

      <div class="kpi-layout">
        <aside class="kpi-list card--flat" id="kpi-list">
          ${renderCascadeList(dept, selectedId)}
        </aside>
        <section class="kpi-detail" id="kpi-card">
          ${selectedId && byId(dept, selectedId)
            ? renderCard(byId(dept, selectedId), dept)
            : '<p class="text-muted">Select a KPI.</p>'}
        </section>
      </div>
    </div>`;

  // Bind initial clicks
  mount.querySelectorAll('.kpi-list-item').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedId = btn.dataset.kpiId;
      render();
    });
  });
}
