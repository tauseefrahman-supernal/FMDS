/**
 * views/sources.js — "Where your numbers come from"
 *
 * renderSources(dept, mount)
 *
 * Sections:
 *   1. Header: connected-system badges, stat summary line
 *   2. Source system cards (grouped by source), KPI list + Pulled/Manual pill
 *   3. Per-KPI table: KPI · Source · Pull mechanism · Status
 *   4. Flow-line visual: Source system → FMDS Vault → Board (single entry)
 *
 * Only real `source` values from dept data are used. No invented systems.
 */

// ─── Source classification ────────────────────────────────────────────────────

/**
 * Systems that can do direct, automated data pulls.
 * Anything listed here is "Pulled" (integrated).
 * Everything else is "Manual re-key today."
 */
const PULLABLE_SYSTEMS = new Set([
  'Power BI',
  'HubSpot',
  'NetSuite',
  'ADP',
  'Windsor',
  'Ask Nicely',
  'Trust Pilot',
  'AskNicely',
  'TrustPilot',
  'Azure DevOps',
  'Google Search Console',
  'Glassdoor',
  'Indeed',
  'Rhythm',
]);

/** Heuristic: a source string implies a pullable system if any pullable token appears in it. */
function isPullable(source) {
  if (!source || source === '—') return false;
  const s = source.toLowerCase();
  for (const sys of PULLABLE_SYSTEMS) {
    if (s.includes(sys.toLowerCase())) return true;
  }
  return false;
}

/** Identify "hand-keyed / double-entry" sources. */
function isHandKeyed(source) {
  if (!source || source === '—') return true;   // unknown = conservative flagging
  const handKeyedTokens = [
    'bowler',
    'sharepoint',
    'coo board',
    'odg fmds board',
    'odg fmds',
    'odg board',
    'sales board',
    'finance board',
    'hand-keyed',
    'manual',
    'literal',
    'cached',
    'survey',
  ];
  const s = source.toLowerCase();
  for (const tok of handKeyedTokens) {
    if (s.includes(tok)) return true;
  }
  // If it's pullable, it's not hand-keyed
  return !isPullable(source);
}

/** Returns { status: 'pulled'|'manual', label: string } */
function sourceStatus(source) {
  if (!source || source === '—') return { status: 'manual', label: 'Manual re-key today' };
  if (isPullable(source) && !isHandKeyed(source)) return { status: 'pulled', label: 'Pulled' };
  return { status: 'manual', label: 'Manual re-key today' };
}

/** Pull mechanism prose: today = sheet/manual; target = direct integration. */
function pullMechanism(source) {
  if (!source || source === '—') return 'Unknown / manual';
  if (isPullable(source) && !isHandKeyed(source)) {
    return `Direct API pull from ${source}`;
  }
  // Partially pullable (e.g., "HubSpot / Bowler" — pullable part + hand-keyed part)
  if (isPullable(source)) {
    return `Part API, part manual re-key`;
  }
  return 'Spreadsheet / manual re-key';
}

/** Target mechanism — what it should be once integrated. */
function targetMechanism(source) {
  if (!source || source === '—') return 'Direct integration TBD';
  if (isPullable(source) && !isHandKeyed(source)) return 'Already direct — maintain';
  if (isPullable(source)) return 'Eliminate manual re-key; API pull only';
  // purely hand-keyed
  const systems = source.split(/[/,+&·]/).map(s => s.trim()).filter(Boolean);
  return `Connect ${systems.join(' + ')} → vault`;
}

// ─── Dedupe and group KPIs by source ─────────────────────────────────────────

function groupBySource(kpis) {
  const groups = {};
  for (const kpi of kpis) {
    const src = kpi.source || '—';
    if (!groups[src]) groups[src] = [];
    groups[src].push(kpi);
  }
  return groups;
}

function distinctSources(kpis) {
  return [...new Set(kpis.map(k => k.source || '—'))];
}

function levelLabel(level) {
  if (level === 1) return 'Main';
  if (level === 2) return 'Contributor';
  if (level === 3) return 'Rep / Sub';
  return `L${level}`;
}

// ─── Status pill HTML ─────────────────────────────────────────────────────────

function statusPill(source) {
  const { status, label } = sourceStatus(source);
  if (status === 'pulled') {
    return `<span class="src-pill src-pill--pulled">● ${label}</span>`;
  }
  return `<span class="src-pill src-pill--manual">⚠ ${label}</span>`;
}

// ─── Flow line visual ─────────────────────────────────────────────────────────

function renderFlowLine(kpis) {
  const handKeyedKpis = kpis.filter(k => isHandKeyed(k.source || '—'));
  const doubleEntryCount = handKeyedKpis.length;

  const doubleEntryBlock = doubleEntryCount > 0
    ? `<div class="src-flow-flag">
         <span class="src-flow-flag__icon">⚠</span>
         <span><strong>${doubleEntryCount} KPI${doubleEntryCount !== 1 ? 's' : ''}</strong> still require manual re-key — double-entry to eliminate:
           <span class="text-mono" style="font-size:0.72rem">
             ${handKeyedKpis.map(k => k.name).join(', ')}
           </span>
         </span>
       </div>`
    : `<div class="src-flow-flag src-flow-flag--ok">
         <span class="src-flow-flag__icon">✓</span>
         <span>All KPIs in this department are on a direct pull path.</span>
       </div>`;

  return `
    <div class="src-flow card">
      <div class="src-flow__head">Data flow — single entry point</div>
      <div class="src-flow__diagram">
        <div class="src-flow__node src-flow__node--source">
          <div class="src-flow__node-icon">⛁</div>
          <div class="src-flow__node-label">Source System</div>
          <div class="src-flow__node-sub text-mono">Power BI · HubSpot · etc.</div>
        </div>
        <div class="src-flow__arrow">→</div>
        <div class="src-flow__node src-flow__node--vault">
          <div class="src-flow__node-icon">🗄</div>
          <div class="src-flow__node-label">FMDS Vault</div>
          <div class="src-flow__node-sub text-mono">single entry point</div>
        </div>
        <div class="src-flow__arrow">→</div>
        <div class="src-flow__node src-flow__node--board">
          <div class="src-flow__node-icon">▤</div>
          <div class="src-flow__node-label">FMDS Board</div>
          <div class="src-flow__node-sub text-mono">reads vault — never re-keys</div>
        </div>
      </div>
      <p class="src-flow__note text-muted text-small">
        The vault is the single source of truth. Boards read from it directly —
        no manual re-entry. Double-entry is eliminated once all hand-keyed sources
        are replaced with direct integrations.
      </p>
      ${doubleEntryBlock}
    </div>`;
}

// ─── Source system cards ──────────────────────────────────────────────────────

function renderSourceCard(source, kpis) {
  const { status } = sourceStatus(source);
  const cardClass = status === 'pulled' ? 'src-card src-card--pulled' : 'src-card src-card--manual';

  const kpiRows = kpis.map(k => `
    <div class="src-card__kpi-row">
      <span class="src-card__kpi-name">${k.name}</span>
      <span class="src-card__kpi-level text-muted">${levelLabel(k.level || 1)}</span>
      ${statusPill(source)}
    </div>`).join('');

  return `
    <div class="${cardClass}">
      <div class="src-card__head">
        <span class="src-card__name text-mono">${source}</span>
        <span class="src-card__count text-muted">${kpis.length} KPI${kpis.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="src-card__kpis">${kpiRows}</div>
    </div>`;
}

// ─── Per-KPI table ────────────────────────────────────────────────────────────

function renderKpiTable(kpis) {
  const rows = kpis.map(k => {
    const src = k.source || '—';
    const { status } = sourceStatus(src);
    const flagCol = isHandKeyed(src)
      ? `<span class="src-table-flag">⚠ double-entry to eliminate</span>`
      : `<span class="src-table-ok">✓ integrated</span>`;

    return `
      <tr>
        <td>
          <div class="src-table-kpi-name">${k.name}</div>
          <div class="text-muted text-small">${levelLabel(k.level || 1)}</div>
        </td>
        <td class="text-mono" style="font-size:0.8rem">${src}</td>
        <td class="text-small text-muted">${pullMechanism(src)}</td>
        <td class="text-small">${targetMechanism(src)}</td>
        <td>${statusPill(src)}</td>
        <td>${flagCol}</td>
      </tr>`;
  }).join('');

  return `
    <div class="table-wrap">
      <table class="src-table">
        <thead>
          <tr>
            <th>KPI</th>
            <th>Source System</th>
            <th>Pull Mechanism Today</th>
            <th>Target Mechanism</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderSources(dept, mount) {
  const kpis    = dept.kpis || [];
  const sources = distinctSources(kpis);
  const grouped = groupBySource(kpis);

  const handKeyedCount = kpis.filter(k => isHandKeyed(k.source || '—')).length;
  const systemCount    = sources.length;
  const totalKpis      = kpis.length;

  // Summary stat line
  const statLine = `${totalKpis} KPI${totalKpis !== 1 ? 's' : ''} · ${systemCount} system${systemCount !== 1 ? 's' : ''} · ${handKeyedCount} still hand-keyed`;

  // Connected system badges (deduped)
  const systemBadges = sources.map(src => {
    const { status } = sourceStatus(src);
    const badgeClass = status === 'pulled' ? 'src-sys-badge src-sys-badge--pulled' : 'src-sys-badge src-sys-badge--manual';
    return `<span class="${badgeClass} text-mono">${src}</span>`;
  }).join('');

  // Source cards
  const sourceCards = sources.map(src => renderSourceCard(src, grouped[src])).join('');

  // KPI table
  const kpiTable = renderKpiTable(kpis);

  // Flow line
  const flowLine = renderFlowLine(kpis);

  mount.innerHTML = `
    <div class="sources-view reveal-1">

      <!-- ── Header ── -->
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px">
        <div>
          <h2>${dept.name} — Sources</h2>
          <p class="text-muted text-small mt-1">Where your numbers come from.</p>
        </div>
        <a href="#/dept/${dept.id}/kpi" class="btn btn--ghost" style="font-size:0.8rem">
          ← KPI Boards
        </a>
      </div>

      <!-- ── Connected systems summary ── -->
      <div class="src-header card reveal-2" style="margin-bottom:24px">
        <div class="src-header__label text-muted text-small" style="margin-bottom:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;font-size:0.68rem">Connected Systems</div>
        <div class="src-sys-badges" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
          ${systemBadges}
        </div>
        <div class="src-stat text-mono" style="font-size:0.82rem;color:var(--text-muted)">
          ${statLine}
        </div>
      </div>

      <!-- ── Source system cards ── -->
      <div class="src-section reveal-3" style="margin-bottom:28px">
        <div class="src-section-label" style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:12px">By Source System</div>
        <div class="src-cards">
          ${sourceCards || '<p class="text-muted">No source data defined for this department.</p>'}
        </div>
      </div>

      <!-- ── Per-KPI table ── -->
      <div class="src-section reveal-4" style="margin-bottom:28px">
        <div class="src-section-label" style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:12px">Per-KPI Detail</div>
        ${kpiTable}
      </div>

      <!-- ── Flow line ── -->
      <div class="src-section">
        <div class="src-section-label" style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:12px">Data Flow</div>
        ${flowLine}
      </div>

    </div>`;
}
