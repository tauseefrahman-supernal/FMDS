/**
 * views/sources.js — "Where your numbers come from" (SOURCING PLAN view)
 *
 * renderSources(dept, mount)
 *
 * Reframed to present the TARGET sourcing model — where FMDS OS will pull
 * each number from once integrated. The current manual re-key situation is
 * shown as a "today: re-keyed → target: <system>" hint, not the headline.
 *
 * Sections:
 *   1. Header: source-system badges, headline stat (N KPIs · M systems · K manual-only)
 *   2. Source plan grouped by TARGET system — each KPI shows a green "sourced ← <system>" pill
 *   3. Manual-only safety group (no source system exists — human reported)
 *   4. Per-KPI table: KPI · Target Source · Today (re-keyed?) · Action
 *   5. Data flow diagram
 */

// ─── Source group classification ──────────────────────────────────────────────

/**
 * Target source systems that have real integrations possible.
 * Used to display a green "sourced ← <system>" pill.
 */
const INTEGRATED_SYSTEMS = new Set([
  'WPS',
  'Business Central',
  'HubSpot',
  'NetSuite',
  'Power BI',
  'ADP',
  'Azure DevOps',
  'Azure DevOps / monitoring',
  'Ask Nicely',
  'AskNicely',
  'Trust Pilot',
  'TrustPilot',
  'ODG',
  'ODG FMDS Board',
  'Glassdoor',
  'Indeed',
  'Google Search Console',
  'GA4',
  'Meta Ads Manager',
  'Meta Business Suite',
  'LinkedIn Analytics',
  'LinkedIn Campaign Manager',
  'Google Ads',
  'Rhythm 2025',
  'Amazon Seller Central',
  'Walmart Marketplace',
  'Carrier / Customs portal',
  'Ecomm platform',
  'Survey (internal)',
  'Survey',
  'Agency report',
  'Agency social report',
  'DxD HPI',
  'Ecomm-CM',
  'HubSpot / CRM',
  'HubSpot / NetSuite',
  'Power BI / NetSuite',
  'Ecomm platform / NetSuite',
  'Ecomm platform / CRM',
  'GA4 / Ecomm platform',
  'Rhythm 2025 / Ecomm platform',
  'Ad platforms + HubSpot',
]);

/** True when the targetSource is not a real system (safety-incident manual items). */
function isManualOnly(kpi) {
  return kpi.manualOnly === true;
}

/** Canonical target source from kpi.targetSource (preferred) or kpi.source (fallback) */
function targetSource(kpi) {
  if (kpi.targetSource) return kpi.targetSource;
  if (kpi.source && kpi.source !== '—') return kpi.source;
  return '—';
}

/**
 * True when today's data is re-keyed (the elimination story).
 * Heuristic: source field contains hand-keyed tokens, OR no targetSource was
 * previously set (meaning the field used to say "Manual" / "COO Board" etc.)
 */
function isTodayReKeyed(kpi) {
  const src = (kpi.source || '').toLowerCase();
  const handKeyedTokens = [
    'bowler', 'sharepoint', 'coo board', 'odg fmds board', 'odg board',
    'sales board', 'finance board', 'hand-keyed', 'manual', 'literal',
    'cached', 're-key', 'rekey',
  ];
  for (const tok of handKeyedTokens) {
    if (src.includes(tok)) return true;
  }
  // If source and targetSource differ, today's number is being re-keyed
  if (kpi.source && kpi.targetSource && kpi.source !== kpi.targetSource) return true;
  return false;
}

// ─── Group KPIs by targetSource ───────────────────────────────────────────────

function groupByTargetSource(kpis) {
  const groups = {};
  for (const kpi of kpis) {
    const ts = targetSource(kpi);
    if (!groups[ts]) groups[ts] = [];
    groups[ts].push(kpi);
  }
  return groups;
}

function distinctTargetSources(kpis) {
  return [...new Set(kpis.map(k => targetSource(k)))];
}

function levelLabel(level) {
  if (level === 1) return 'Main';
  if (level === 2) return 'Contributor';
  if (level === 3) return 'Rep / Sub';
  return `L${level}`;
}

// ─── Pills and badges ─────────────────────────────────────────────────────────

/** Green "sourced ← <system>" pill for integrated KPIs */
function sourcedPill(ts) {
  if (!ts || ts === '—') {
    return `<span class="src-pill src-pill--manual">⚠ No source system</span>`;
  }
  return `<span class="src-pill src-pill--pulled">● sourced ← ${ts}</span>`;
}

/** "today: re-keyed" hint (amber, subtle) */
function reKeyedHint(kpi) {
  if (!isTodayReKeyed(kpi)) return '';
  const src = kpi.source ? kpi.source.split(' / ')[0] : 'spreadsheet';
  return `<span class="src-pill src-pill--rekey" title="Today this number is re-keyed from ${src} into the board. FMDS OS eliminates this double-entry.">today: re-keyed</span>`;
}

/** Manual-only badge (safety items) */
function manualOnlyPill() {
  return `<span class="src-pill src-pill--manual-only">⚡ Manual entry</span>`;
}

// ─── Source system card ───────────────────────────────────────────────────────

function renderSourceCard(ts, kpis) {
  const isManual = ts === 'Manual — reported';
  const cardClass = isManual ? 'src-card src-card--manual-only' : 'src-card src-card--pulled';
  const headIcon  = isManual ? '⚡' : '⊙';

  const kpiRows = kpis.map(k => `
    <div class="src-card__kpi-row">
      <span class="src-card__kpi-name">${k.name}</span>
      <span class="src-card__kpi-level text-muted">${levelLabel(k.level || 1)}</span>
      ${isManual ? manualOnlyPill() : sourcedPill(ts)}
      ${isTodayReKeyed(k) && !isManual ? reKeyedHint(k) : ''}
    </div>`).join('');

  const cardNote = isManual
    ? `<div class="src-card__note text-muted text-small" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
         No source system exists for these items. They are human-reported incident counts and rates — the only remaining manual entry in FMDS OS.
       </div>`
    : '';

  return `
    <div class="${cardClass}">
      <div class="src-card__head">
        <span class="src-card__icon">${headIcon}</span>
        <span class="src-card__name text-mono">${ts}</span>
        <span class="src-card__count text-muted">${kpis.length} KPI${kpis.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="src-card__kpis">${kpiRows}</div>
      ${cardNote}
    </div>`;
}

// ─── Per-KPI table ────────────────────────────────────────────────────────────

function renderKpiTable(kpis) {
  const rows = kpis.map(k => {
    const ts = targetSource(k);
    const isManual = isManualOnly(k);
    const todayIsReKeyed = isTodayReKeyed(k);

    const statusCol = isManual
      ? manualOnlyPill()
      : sourcedPill(ts);

    const todayCol = isManual
      ? `<span class="text-muted text-small">Human-reported — no system</span>`
      : todayIsReKeyed
        ? `<span class="src-table-flag">⚠ re-keyed today → eliminated by FMDS OS</span>`
        : `<span class="src-table-ok">✓ direct pull</span>`;

    const actionCol = isManual
      ? `<span class="text-muted text-small">Keep — no system to connect</span>`
      : todayIsReKeyed
        ? `<span class="text-small">Connect ${ts} → vault</span>`
        : `<span class="src-table-ok">Already sourced</span>`;

    return `
      <tr>
        <td>
          <div class="src-table-kpi-name">${k.name}</div>
          <div class="text-muted text-small">${levelLabel(k.level || 1)}</div>
        </td>
        <td class="text-mono" style="font-size:0.8rem">${ts}</td>
        <td>${statusCol}</td>
        <td>${todayCol}</td>
        <td>${actionCol}</td>
      </tr>`;
  }).join('');

  return `
    <div class="table-wrap">
      <table class="src-table">
        <thead>
          <tr>
            <th>KPI</th>
            <th>Target Source System</th>
            <th>Sourcing Status</th>
            <th>Today (re-keyed?)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ─── Data flow visual ─────────────────────────────────────────────────────────

function renderFlowLine(kpis) {
  const reKeyedKpis  = kpis.filter(k => isTodayReKeyed(k) && !isManualOnly(k));
  const manualKpis   = kpis.filter(k => isManualOnly(k));
  const doubleEntryN = reKeyedKpis.length;

  const doubleEntryBlock = doubleEntryN > 0
    ? `<div class="src-flow-flag">
         <span class="src-flow-flag__icon">⚠</span>
         <span><strong>${doubleEntryN} KPI${doubleEntryN !== 1 ? 's' : ''}</strong> are re-keyed today — FMDS OS eliminates this double-entry once integrated:
           <span class="text-mono" style="font-size:0.72rem">
             ${reKeyedKpis.map(k => k.name).join(', ')}
           </span>
         </span>
       </div>`
    : `<div class="src-flow-flag src-flow-flag--ok">
         <span class="src-flow-flag__icon">✓</span>
         <span>All KPIs in this department are on a direct pull path — no re-keying to eliminate.</span>
       </div>`;

  const manualBlock = manualKpis.length > 0
    ? `<div class="src-flow-flag src-flow-flag--manual" style="margin-top:8px;border-color:var(--red-border)">
         <span class="src-flow-flag__icon">⚡</span>
         <span><strong>${manualKpis.length} safety item${manualKpis.length !== 1 ? 's' : ''}</strong> remain manual — no source system exists for incident reporting:
           <span class="text-mono" style="font-size:0.72rem">
             ${manualKpis.map(k => k.name).join(', ')}
           </span>
         </span>
       </div>`
    : '';

  return `
    <div class="src-flow card">
      <div class="src-flow__head">Target data flow — single entry point</div>
      <div class="src-flow__diagram">
        <div class="src-flow__node src-flow__node--source">
          <div class="src-flow__node-icon">⛁</div>
          <div class="src-flow__node-label">Source System</div>
          <div class="src-flow__node-sub text-mono">WPS · BC · HubSpot · etc.</div>
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
        The number comes from the source system. Boards read from the vault directly —
        no manual re-entry. Where today's process re-keys a number that already exists
        in a source system, FMDS OS eliminates that double-entry. The only remaining
        manual entry is safety-incident counts (human-reported — no system to connect).
      </p>
      ${doubleEntryBlock}
      ${manualBlock}
    </div>`;
}

// ─── Inline styles for new pills ─────────────────────────────────────────────

function injectSourceStyles(doc) {
  if (doc.getElementById('sources-v2-styles')) return;
  const style = doc.createElement('style');
  style.id = 'sources-v2-styles';
  style.textContent = `
    .src-pill--rekey {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 7px;
      border-radius: var(--radius-full);
      font-size: 0.67rem;
      font-weight: 600;
      font-family: var(--font-mono);
      background: var(--amber-bg);
      color: var(--amber-text);
      border: 1px solid var(--amber-border);
      vertical-align: middle;
    }
    .src-pill--manual-only {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 7px;
      border-radius: var(--radius-full);
      font-size: 0.67rem;
      font-weight: 600;
      font-family: var(--font-mono);
      background: var(--red-bg);
      color: var(--red-text);
      border: 1px solid var(--red-border);
      vertical-align: middle;
    }
    .src-card--manual-only {
      border-left: 3px solid var(--red-border);
      background: var(--red-bg);
    }
    .src-card__icon {
      margin-right: 4px;
    }
    .src-flow-flag--manual {
      border-color: var(--red-border) !important;
      background: var(--red-bg);
    }
  `;
  doc.head.appendChild(style);
}

// ─── Public entry point ───────────────────────────────────────────────────────

export function renderSources(dept, mount) {
  if (typeof document !== 'undefined') injectSourceStyles(document);

  const kpis           = dept.kpis || [];
  const allSources     = distinctTargetSources(kpis);
  const grouped        = groupByTargetSource(kpis);
  const manualOnlyKpis = kpis.filter(k => isManualOnly(k));
  const reKeyedKpis    = kpis.filter(k => isTodayReKeyed(k) && !isManualOnly(k));
  const totalKpis      = kpis.length;

  // Non-manual sources for headline count
  const realSystems = allSources.filter(s => s !== 'Manual — reported' && s !== '—');

  // Headline stat: N KPIs · M source systems · K manual-only (safety)
  const statLine = `${totalKpis} KPI${totalKpis !== 1 ? 's' : ''} · ${realSystems.length} source system${realSystems.length !== 1 ? 's' : ''} · ${manualOnlyKpis.length} manual-only (safety)`;

  // System badges — grouped: integrated first, then manual-only
  const integratedBadges = realSystems.map(ts => {
    return `<span class="src-sys-badge src-sys-badge--pulled text-mono">${ts}</span>`;
  }).join('');

  const manualBadge = manualOnlyKpis.length
    ? `<span class="src-sys-badge src-sys-badge--manual text-mono">Manual entry (safety only)</span>`
    : '';

  // Source cards: integrated systems first, manual-only group last
  const integratedCards = realSystems
    .map(ts => renderSourceCard(ts, grouped[ts]))
    .join('');

  const manualOnlyCard = manualOnlyKpis.length
    ? renderSourceCard('Manual — reported', manualOnlyKpis)
    : '';

  // Per-KPI table
  const kpiTable = renderKpiTable(kpis);

  // Flow diagram
  const flowLine = renderFlowLine(kpis);

  // Re-keyed elimination note
  const eliminationNote = reKeyedKpis.length
    ? `<div class="src-elimination-note" style="background:var(--amber-bg);border:1px solid var(--amber-border);border-radius:var(--radius);
           padding:10px 14px;margin-bottom:18px;font-size:0.8rem;line-height:1.5">
         <strong style="color:var(--amber-text)">Double-entry being eliminated:</strong>
         <span class="text-muted" style="margin-left:6px">${reKeyedKpis.length} KPI${reKeyedKpis.length !== 1 ? 's' : ''} currently re-keyed from source systems into the board —
         FMDS OS replaces these with direct pulls from the source, removing the manual step entirely.</span>
       </div>`
    : '';

  mount.innerHTML = `
    <div class="sources-view reveal-1">

      <!-- ── Header ── -->
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px">
        <div>
          <h2>${dept.name} — Sourcing Plan</h2>
          <p class="text-muted text-small mt-1">Where each number comes from. The number is sourced — not re-keyed.</p>
        </div>
        <a href="#/dept/${dept.id}/kpi" class="btn btn--ghost" style="font-size:0.8rem">
          ← KPI Boards
        </a>
      </div>

      <!-- ── Connected systems summary ── -->
      <div class="src-header card reveal-2" style="margin-bottom:24px">
        <div class="src-header__label text-muted text-small" style="margin-bottom:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;font-size:0.68rem">Target Source Systems</div>
        <div class="src-sys-badges" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
          ${integratedBadges}
          ${manualBadge}
        </div>
        <div class="src-stat text-mono" style="font-size:0.82rem;color:var(--text-dim)">
          ${statLine}
        </div>
      </div>

      <!-- ── Re-keyed elimination note (only shown if any exist) ── -->
      ${eliminationNote}

      <!-- ── Source system cards ── -->
      <div class="src-section reveal-3" style="margin-bottom:28px">
        <div class="src-section-label" style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-dim);margin-bottom:12px">By Source System</div>
        <div class="src-cards">
          ${integratedCards || ''}
          ${manualOnlyCard}
          ${(!integratedCards && !manualOnlyCard) ? '<p class="text-muted">No source data defined for this department.</p>' : ''}
        </div>
      </div>

      <!-- ── Per-KPI table ── -->
      <div class="src-section reveal-4" style="margin-bottom:28px">
        <div class="src-section-label" style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-dim);margin-bottom:12px">Per-KPI Detail</div>
        ${kpiTable}
      </div>

      <!-- ── Data flow ── -->
      <div class="src-section">
        <div class="src-section-label" style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-dim);margin-bottom:12px">Data Flow</div>
        ${flowLine}
      </div>

    </div>`;
}
