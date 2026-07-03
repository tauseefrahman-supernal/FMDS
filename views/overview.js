/**
 * views/overview.js — Role-scoped RED/GREEN Overview surface
 *
 * renderOverview(dept, mount)
 *
 * L2 lead: compact status cards for all department-main KPIs, sorted
 *   RED → AMBER → GREEN. Under each RED/AMBER card: agent explanation
 *   drawn from bakedReply('explain-red') + the KPI's own story/flagDetail.
 *   Each card has an "Open in KPI Boards →" link.
 *
 * L1 operator: light per-location target view (their own targets from
 *   locationBoards, if available) — or falls back to main summary for
 *   departments without L1 location data.
 *
 * Operations special path:
 *   L2 → mains from dept.kpis (OTP, PPLH, Materials — WE-level)
 *   L1 → per-location targets (location = session.persona.location if set)
 *
 * All other departments:
 *   L2 → mains summary (same card format, generic agent reply)
 *   L1 → fallback to L2 mains summary (most dept L1 personas are supervisors)
 */

import { mains, byId }  from '../lib/registry.js';
import { ragStatus }     from '../lib/rag.js';
import { bakedReply }    from '../lib/agent.js';

// ─── Formatters (shared with teamboard pattern) ───────────────────────────────

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

function ragLabel(status) {
  return { green: 'On Track', amber: 'At Risk', red: 'Off Track', nodata: 'No Data' }[status] || status;
}

// ─── Agent explanation for a single KPI ──────────────────────────────────────

/**
 * Build the agent explanation text for a red/amber KPI.
 * Combines:
 *  1. The KPI's own `story.text` or `flagDetail` from data (richer than generic reply)
 *  2. The dept-level `bakedReply('explain-red', {kpi: kpi.name})` as fallback/supplement
 *  3. `rollup` note (if present) — OTP/PPLH entry mechanics
 */
function kpiAgentExplanation(dept, kpi) {
  const parts = [];

  // Story text from KPI data (most grounded)
  if (kpi.story && kpi.story.text) {
    parts.push(kpi.story.text);
    if (kpi.story.denominatorNote) {
      parts.push(`Denominator note: ${kpi.story.denominatorNote}`);
    }
  } else if (kpi.flagDetail) {
    parts.push(kpi.flagDetail);
  } else if (kpi.flag && typeof kpi.flag === 'string' && kpi.flag.length < 200) {
    parts.push(kpi.flag);
  }

  // Rollup / entry mechanic note
  if (kpi.rollup && kpi.rollup.note) {
    parts.push(`Entry mechanic: ${kpi.rollup.note}`);
  }

  // If no KPI-specific story, fall back to dept-level baked reply
  if (!parts.length) {
    const reply = bakedReply(dept.id, 'explain-red', { kpi: kpi.name });
    // Strip the "Why is X red?\n\n" prefix for inline display
    parts.push(reply.replace(/^Why is [^\n]+\?\n\n/, '').trim());
  }

  return parts.filter(Boolean).join('\n\n');
}

// ─── Styles (injected once) ───────────────────────────────────────────────────

let overviewStylesInjected = false;
function injectOverviewStyles() {
  if (overviewStylesInjected) return;
  overviewStylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 16px;
      margin-top: 8px;
    }
    .ov-card {
      border-radius: var(--radius, 6px);
      border: 1px solid var(--slate-200);
      background: #fff;
      overflow: hidden;
    }
    .ov-card--red    { border-left: 4px solid #ef4444; }
    .ov-card--amber  { border-left: 4px solid #f59e0b; }
    .ov-card--green  { border-left: 4px solid #22c55e; }
    .ov-card--nodata { border-left: 4px solid var(--slate-300); }

    .ov-card__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 10px;
      gap: 12px;
    }
    .ov-card__name {
      font-weight: 600;
      font-size: 0.88rem;
      color: var(--slate-900);
      flex: 1;
    }
    .ov-card__rag {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 2px 8px;
      border-radius: 999px;
    }
    .ov-card__rag--red    { background: #fee2e2; color: #b91c1c; }
    .ov-card__rag--amber  { background: #fef3c7; color: #92400e; }
    .ov-card__rag--green  { background: #dcfce7; color: #166534; }
    .ov-card__rag--nodata { background: var(--slate-100); color: var(--slate-500); }

    .ov-card__vals {
      display: flex;
      align-items: baseline;
      gap: 12px;
      padding: 0 16px 10px;
    }
    .ov-card__actual {
      font-family: var(--font-mono, 'IBM Plex Mono', monospace);
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--slate-900);
      line-height: 1.1;
    }
    .ov-card__actual--red   { color: #dc2626; }
    .ov-card__actual--amber { color: #b45309; }
    .ov-card__actual--green { color: #16a34a; }
    .ov-card__target-label {
      font-size: 0.72rem;
      color: var(--slate-500);
    }
    .ov-card__target-val {
      font-family: var(--font-mono, 'IBM Plex Mono', monospace);
      font-size: 0.82rem;
      color: var(--slate-600);
    }

    .ov-card__agent {
      margin: 0 16px 12px;
      padding: 10px 12px;
      background: #f8fafc;
      border: 1px solid var(--slate-200);
      border-radius: 4px;
      font-size: 0.76rem;
      line-height: 1.55;
      color: var(--slate-700);
    }
    .ov-card__agent-head {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--slate-500);
      margin-bottom: 6px;
    }
    .ov-card__agent-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--accent, #2f6bff);
      display: inline-block;
    }
    .ov-card__agent-body {
      white-space: pre-line;
    }

    .ov-card__footer {
      padding: 8px 16px 12px;
      border-top: 1px solid var(--slate-100);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ov-card__footer-source {
      font-size: 0.68rem;
      color: var(--slate-400);
    }
    .ov-card__kpi-link {
      font-size: 0.72rem;
      color: var(--accent, #2f6bff);
      text-decoration: none;
      font-weight: 600;
    }
    .ov-card__kpi-link:hover { text-decoration: underline; }

    .ov-section-label {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--slate-400);
      margin: 20px 0 6px;
    }
    .ov-section-label:first-child { margin-top: 0; }

    .ov-l1-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      margin-top: 8px;
    }
    .ov-l1-card {
      border-radius: var(--radius, 6px);
      border: 1px solid var(--slate-200);
      background: #fff;
      padding: 14px 16px;
    }
    .ov-l1-card__label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--slate-500);
      margin-bottom: 6px;
    }
    .ov-l1-card__kpiname {
      font-weight: 600;
      font-size: 0.88rem;
      margin-bottom: 8px;
    }
    .ov-l1-card__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }
    .ov-l1-card__val {
      font-family: var(--font-mono, 'IBM Plex Mono', monospace);
      font-weight: 700;
      font-size: 1.1rem;
    }
  `;
  document.head.appendChild(style);
}

// ─── Single status card ───────────────────────────────────────────────────────

function buildStatusCard(dept, kpi, role) {
  const isNoData = kpi.nodata || kpi.actual == null;
  const rag = isNoData
    ? 'nodata'
    : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');

  const ragLabels = { red: 'RED', amber: 'AMBER', green: 'GREEN', nodata: 'No Data' };

  const actualDisplay = isNoData ? '—' : formatVal(kpi.actual, kpi.unit);
  const targetDisplay = kpi.target != null ? formatVal(kpi.target, kpi.unit) : '—';

  // Agent block: only for red and amber
  let agentBlock = '';
  if ((rag === 'red' || rag === 'amber') && !isNoData) {
    const explanation = kpiAgentExplanation(dept, kpi);
    agentBlock = `
      <div class="ov-card__agent">
        <div class="ov-card__agent-head">
          <span class="ov-card__agent-dot"></span>
          AI — why ${rag === 'red' ? 'red' : 'at risk'}
        </div>
        <div class="ov-card__agent-body">${escHtml(explanation)}</div>
      </div>`;
  }

  const sourceText = kpi.source
    ? kpi.source.split(' / ')[0]
    : (kpi.rollupMethod === 'independent' ? 'Mechanism B' : '');

  return `
    <div class="ov-card ov-card--${rag}">
      <div class="ov-card__head">
        <div class="ov-card__name">${kpi.name}</div>
        <span class="ov-card__rag ov-card__rag--${rag}">${ragLabels[rag]}</span>
      </div>
      <div class="ov-card__vals">
        <div class="ov-card__actual ov-card__actual--${rag}">${actualDisplay}</div>
        <div>
          <div class="ov-card__target-label">vs target</div>
          <div class="ov-card__target-val">${targetDisplay}</div>
        </div>
      </div>
      ${agentBlock}
      <div class="ov-card__footer">
        <span class="ov-card__footer-source">${sourceText}</span>
        <a class="ov-card__kpi-link" href="#/dept/${dept.id}/kpi">Open in KPI Boards →</a>
      </div>
    </div>`;
}

// ─── Escape HTML for agent text ───────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── L2 main-KPI overview ─────────────────────────────────────────────────────

function renderL2Overview(dept, mount) {
  const kpiList = mains(dept);

  // Sort: red → amber → green → nodata
  const order = { red: 0, amber: 1, green: 2, nodata: 3 };
  const sorted = [...kpiList].sort((a, b) => {
    const ragA = (a.nodata || a.actual == null)
      ? 'nodata'
      : ragStatus(a.actual, a.target, a.direction || 'higher_better');
    const ragB = (b.nodata || b.actual == null)
      ? 'nodata'
      : ragStatus(b.actual, b.target, b.direction || 'higher_better');
    return (order[ragA] ?? 9) - (order[ragB] ?? 9);
  });

  // Group by RAG
  const groups = { red: [], amber: [], green: [], nodata: [] };
  sorted.forEach(kpi => {
    const rag = (kpi.nodata || kpi.actual == null)
      ? 'nodata'
      : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
    groups[rag].push(kpi);
  });

  const sectionOrder = [
    { key: 'red',    label: 'Needs Attention' },
    { key: 'amber',  label: 'At Risk'         },
    { key: 'green',  label: 'On Track'        },
    { key: 'nodata', label: 'No Data'         },
  ];

  let sections = '';
  sectionOrder.forEach(({ key, label }) => {
    if (!groups[key].length) return;
    sections += `<div class="ov-section-label">${label}</div>
      <div class="overview-grid">
        ${groups[key].map(kpi => buildStatusCard(dept, kpi, 'L2')).join('')}
      </div>`;
  });

  // Count reds for the headline
  const redCount  = groups.red.length;
  const subheading = redCount > 0
    ? `${redCount} KPI${redCount > 1 ? 's' : ''} need${redCount === 1 ? 's' : ''} attention`
    : 'All KPIs on track or no active issues';

  mount.innerHTML = `
    <div class="team-board">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px">
        <div>
          <h2>${dept.name} — Overview</h2>
          <p class="text-muted text-small mt-1">
            L2 · ${dept.lead || ''} · ${subheading}
          </p>
        </div>
        <a href="#/dept/${dept.id}/kpi" class="btn btn--ghost" style="font-size:0.8rem">
          KPI Boards →
        </a>
      </div>
      ${sections || '<p class="text-muted">No KPI data available.</p>'}
      <p class="text-muted text-small mt-4" style="border-top:1px solid var(--slate-100);padding-top:12px">
        <strong>Overview</strong> shows department main KPIs by status. Red and amber cards include an AI explanation.
        Use <strong>KPI Boards</strong> for the full level-by-level breakdown with trends and operator contributions.
      </p>
    </div>`;
}

// ─── L1 per-location target view (Operations path) ───────────────────────────

/**
 * For an L1 Operations operator: show the location board KPIs they own.
 * Falls back to a compact summary if no location board is available.
 */
function renderL1OperationsOverview(dept, mount, persona) {
  // Try to match persona location (persona.location or fallback to first active location)
  const locId = persona && persona.location
    ? persona.location.toLowerCase()
    : (dept.locations && dept.locations[0]) || null;

  const locBoard = locId && dept.locationBoards && dept.locationBoards[locId]
    ? dept.locationBoards[locId]
    : null;

  if (!locBoard) {
    // Fallback: show L2 mains
    renderL2Overview(dept, mount);
    return;
  }

  // Pull OTP + PPLH KPIs from the location board
  const otpKpi  = locBoard.kpis.find(k => k.category === 'SERVICE/DELIVERY' && k.name.includes('OTP'));
  const pplhKpi = locBoard.kpis.find(k => k.category === 'COST' && k.name === 'PPLH');

  const makeL1Card = (kpi) => {
    if (!kpi) return '';
    const isNoData = kpi.nodata || kpi.actual == null;
    const rag = isNoData
      ? 'nodata'
      : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');

    const ragColors = {
      red:    { bg: '#fee2e2', fg: '#b91c1c', label: 'Off Track' },
      amber:  { bg: '#fef3c7', fg: '#92400e', label: 'At Risk'   },
      green:  { bg: '#dcfce7', fg: '#166534', label: 'On Track'  },
      nodata: { bg: '#f1f5f9', fg: '#64748b', label: 'No Data'   },
    };
    const rc = ragColors[rag];

    return `
      <div class="ov-l1-card" style="border-left:4px solid ${rc.fg}">
        <div class="ov-l1-card__label">${kpi.category}</div>
        <div class="ov-l1-card__kpiname">${kpi.name}</div>
        <div class="ov-l1-card__row">
          <span class="ov-l1-card__val" style="color:${rc.fg}">
            ${isNoData ? '—' : formatVal(kpi.actual, kpi.unit)}
          </span>
          <span style="font-size:0.72rem;padding:2px 8px;border-radius:999px;
                       background:${rc.bg};color:${rc.fg};font-weight:700">${rc.label}</span>
        </div>
        <div style="margin-top:6px;font-size:0.72rem;color:var(--slate-500)">
          Target: ${kpi.target != null ? formatVal(kpi.target, kpi.unit) : '—'}
          ${kpi.latestMonth ? ` · Latest: ${kpi.latestMonth}` : ''}
        </div>
        ${kpi.unitNote ? `<div style="margin-top:4px;font-size:0.68rem;color:#92400e">⚠ ${kpi.unitNote}</div>` : ''}
      </div>`;
  };

  mount.innerHTML = `
    <div class="team-board">
      <div style="margin-bottom:20px">
        <h2>${dept.name} — My Targets</h2>
        <p class="text-muted text-small mt-1">
          L1 · ${locBoard.label} · ${locBoard.productionLines ? locBoard.productionLines.length : '—'} production lines
        </p>
      </div>

      <div class="ov-l1-grid">
        ${makeL1Card(otpKpi)}
        ${makeL1Card(pplhKpi)}
      </div>

      ${locBoard.actualsNote ? `
        <div style="margin-top:16px;padding:10px 14px;background:var(--slate-50);
             border:1px solid var(--slate-200);border-radius:4px;font-size:0.75rem;
             color:var(--slate-600)">
          ${locBoard.actualsNote}
        </div>` : ''}

      <p class="text-muted text-small mt-4" style="border-top:1px solid var(--slate-100);padding-top:12px">
        Your targets for <strong>${locBoard.label}</strong>.
        <a href="#/dept/${dept.id}/kpi" style="color:var(--accent)">Open KPI Boards</a> for the full location breakdown.
      </p>
    </div>`;
}

// ─── Public entry point ───────────────────────────────────────────────────────

/**
 * renderOverview(dept, mount, session)
 *
 * session — { role: 'L1' | 'L2', persona: { name, label, location? } }
 *   Pass null/undefined session to default to L2 rendering.
 */
export function renderOverview(dept, mount, session) {
  injectOverviewStyles();

  const role = session && session.role ? session.role : 'L2';

  if (role === 'L1' && dept.id === 'operations') {
    renderL1OperationsOverview(dept, mount, session ? session.persona : null);
  } else {
    // L2 for all departments (including Operations L2 Jim Kozel view)
    renderL2Overview(dept, mount);
  }
}
