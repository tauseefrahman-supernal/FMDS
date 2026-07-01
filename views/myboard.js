/**
 * views/myboard.js — L1 My Board (Service reps: Diane / Cullen / Dylan / Colten)
 *
 * renderMyBoard(dept, mount)
 *
 * Rep selector → shows selected rep's KPIs vs target with RAG chips
 * + 8-week svgLine trend for revenue + per-sub-metric charts.
 */

import { byId }      from '../lib/registry.js';
import { ragStatus } from '../lib/rag.js';
import { svgLine }   from '../lib/charts.js';

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

// ─── Rep sub-metrics block ───────────────────────────────────────────────────

function renderRepSubs(kpi) {
  const subs = kpi.repSubs;
  if (!subs) return '';

  const subDefs = [
    { key: 'calls',       label: 'Calls',         unit: 'calls/wk' },
    { key: 'weiMeetings', label: 'WEI Meetings',  unit: 'mtgs/wk' },
    { key: 'hpMeetings',  label: 'HP Meetings',   unit: 'mtgs/wk' },
    { key: 'newOppsWEI',  label: 'New Opps WEI',  unit: 'opps/wk' },
    { key: 'hpNewQuotes', label: 'HP New Quotes', unit: 'quotes/wk' },
    { key: 'revHPI',      label: 'Rev HPI',       unit: '$/wk' },
  ];

  const rows = subDefs.filter(def => subs[def.key]).map(def => {
    const sub    = subs[def.key];
    const series = sub.series || [];
    const latest = series.filter(v => v != null).pop();
    const rag    = sub.target != null
      ? ragStatus(latest, sub.target, 'higher_better')
      : 'nodata';
    const chart  = series.length
      ? svgLine(series, { target: sub.target || null, width: 180, height: 50, mini: true })
      : '';
    const targetLabel = sub.target != null
      ? `<span class="text-mono text-small">${formatVal(sub.target, def.unit)}</span>`
      : `<span class="text-muted text-small">—</span>`;

    return `
      <div class="rep-sub-row">
        <div class="rep-sub-label">
          <span class="text-small" style="font-weight:500">${def.label}</span>
          <div style="display:flex;align-items:center;gap:8px;margin-top:2px">
            <span class="text-muted text-small">Tgt:</span>${targetLabel}
            <span class="text-muted text-small">·</span>
            <span class="text-mono text-small">${formatVal(latest, def.unit)}</span>
            ${sub.target != null ? ragChip(rag) : ''}
          </div>
          ${sub.note ? `<div class="text-muted" style="font-size:0.68rem;margin-top:2px">${sub.note}</div>` : ''}
        </div>
        <div class="rep-sub-chart">${chart}</div>
      </div>`;
  }).join('');

  return `<div class="rep-subs mt-4">${rows}</div>`;
}

// ─── Single rep card ─────────────────────────────────────────────────────────

function renderRepCard(kpi, dept) {
  if (!kpi) return '<p class="text-muted">Rep not found.</p>';

  const act   = displayActual(kpi);
  const rag   = ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const chart = kpi.series && kpi.series.length
    ? svgLine(kpi.series, { target: kpi.target, width: 360, height: 80 })
    : '';

  // Labels for weeks on X axis (wk1…wk8)
  const wkLabels = kpi.series
    ? kpi.series.map((_, i) => `wk${i + 1}`).join('  ')
    : '';

  const flagBlock = kpi.flag
    ? `<div class="badge badge--warning" style="margin-top:8px;display:inline-flex;white-space:normal;line-height:1.4">
         ⚠ ${kpi.flag}
       </div>`
    : '';

  return `
    <div class="rep-card card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div>
          <h3>${kpi.name}</h3>
          <p class="text-muted text-small mt-1">
            Target: <span class="text-mono">${formatVal(kpi.target, kpi.unit)}</span>
            &nbsp;·&nbsp;
            Actual: <span class="text-mono">${formatVal(act, kpi.unit)}</span>
            &nbsp;·&nbsp;
            Source: <span class="badge">${kpi.source || '—'}</span>
          </p>
          ${flagBlock}
        </div>
        ${ragChip(rag)}
      </div>

      ${chart
        ? `<div style="margin-top:12px;overflow-x:auto">
             ${chart}
             <div class="text-muted" style="font-size:0.62rem;margin-top:2px;padding-left:28px;letter-spacing:0.02em">
               ${wkLabels}
             </div>
           </div>`
        : ''}

      <hr class="divider" style="margin:16px 0">

      <div class="text-muted text-small" style="margin-bottom:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:0.65rem">
        Activity Drivers
      </div>
      ${renderRepSubs(kpi)}

      ${kpi.note ? `<p class="text-muted text-small mt-4" style="line-height:1.5">${kpi.note}</p>` : ''}
    </div>`;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderMyBoard(dept, mount) {
  // Determine rep IDs — use dept.reps if available; fallback to kpis with level 3
  const repIds = dept.reps || dept.kpis.filter(k => k.level === 3).map(k => k.id);

  if (!repIds.length) {
    mount.innerHTML = `<div class="card mt-4">
      <h2>${dept.name} — My Board</h2>
      <p class="text-muted mt-2">No individual rep data available for this department.</p>
    </div>`;
    return;
  }

  let selectedRep = repIds[0];

  function render() {
    // Update selector button states
    mount.querySelectorAll('.rep-selector-btn').forEach(btn => {
      btn.classList.toggle('btn--primary', btn.dataset.repId === selectedRep);
    });

    const cardEl = mount.querySelector('#rep-card-area');
    if (cardEl) {
      const kpi = byId(dept, selectedRep);
      cardEl.innerHTML = renderRepCard(kpi, dept);
    }
  }

  // Build selector buttons
  const selectorBtns = repIds.map(repId => {
    const kpi   = byId(dept, repId);
    const label = kpi ? kpi.name.split(' — ')[0].trim() : repId;
    return `<button class="btn rep-selector-btn ${repId === selectedRep ? 'btn--primary' : ''}"
                    data-rep-id="${repId}">${label}</button>`;
  }).join('');

  mount.innerHTML = `
    <div>
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
        <div>
          <h2>${dept.name} — My Board</h2>
          <p class="text-muted text-small mt-1">L1 · Individual rep performance vs target</p>
        </div>
        <a href="#/dept/${dept.id}/team" class="btn btn--ghost" style="font-size:0.8rem">
          ← Team Board
        </a>
      </div>

      <div class="rep-selector cluster gap-2" style="margin-bottom:24px">
        ${selectorBtns}
      </div>

      <div id="rep-card-area">
        ${renderRepCard(byId(dept, selectedRep), dept)}
      </div>
    </div>`;

  // Bind rep selector
  mount.querySelectorAll('.rep-selector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRep = btn.dataset.repId;
      render();
    });
  });
}
