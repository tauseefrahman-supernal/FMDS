/**
 * views/sources.js — "Sourcing Plan" (where every number comes from)
 *
 * renderSources(dept, mount)
 *
 * Markup rebuilt to the §5.7 Sources idiom (docs/redesign/DESIGN-GUIDE.md +
 * docs/redesign/reference/view-rest.js's `VIEWS.sources`) — `.page-head`,
 * a target-systems summary `.card--pad`, an amber-left-border banner, a
 * `.grid` of `.card`s "By source system" (each real KPI row wearing a
 * `.badge--amber` "re-keyed today" or `.badge--green` "direct pull"), a
 * 3-node `.flow` (Source system → FMDS vault → FMDS board, middle node
 * `.flow__node--accent`), and a `.board-hint`. Every class here is already
 * ported into styles.css by the Phase-1 tasks — no local `<style>`
 * injection, unlike the pre-rebuild file, which shipped ~50 lines of scoped
 * CSS for one-off `.src-*` classes.
 *
 * Data lookups are unchanged in *behavior* from the pre-rebuild file — only
 * the markup moved, plus one real classification fix:
 *
 *   - `hasNoSystem(kpi)` generalizes the old `isManualOnly(kpi)` (which only
 *     checked `kpi.manualOnly === true`) to also catch KPIs whose
 *     `targetSource` literally says there isn't one yet. data/hr.json's
 *     `bench_strength` has `targetSource: "TBD — no source system"` and
 *     `manualOnly` unset — the pre-rebuild file's `groupByTargetSource`
 *     would have put it in its own "BY SOURCE SYSTEM" card literally titled
 *     "TBD — no source system" wearing a green/amber pull badge, which is
 *     nonsense for a KPI that has no system to pull from. It now buckets
 *     with HR's 6 real `manualOnly` TRIR items into one "No source system"
 *     card, same treatment the pre-rebuild file already gave manualOnly
 *     KPIs. Not new data — `bench_strength`'s own `targetSource` string is
 *     what triggers it.
 *   - `INTEGRATED_SYSTEMS` (a large hardcoded system-name allowlist) is
 *     dropped — grep confirms it was dead code in the pre-rebuild file
 *     (defined, never referenced). Grouping always ran off `targetSource`/
 *     `source` directly, not that set.
 *   - The old file's standalone "Per-KPI Detail" `.src-table` (KPI · Target
 *     Source · Sourcing Status · Today · Action, five columns duplicating
 *     what each source-system card row already shows) is gone. The
 *     reference's Sources page has no equivalent section, and once every
 *     KPI already appears once in its source-system card with its
 *     re-keyed/direct-pull badge, a second full table restating the same
 *     KPI→system→status facts is exactly the "banner restating what a chip
 *     can say" §6 anti-pattern.
 *
 * Zero-invented-data / generalization notes (every dept's source mapping is
 * real, pulled from data/<dept>.json's kpi.targetSource / kpi.source /
 * kpi.manualOnly — nothing here is Operations-specific):
 *   - "BY SOURCE SYSTEM" renders one card per *distinct* `targetSource`
 *     string the department's KPIs actually carry — Operations gets WPS +
 *     Business Central (2 cards); Finance gets Business Central alone (1);
 *     IT gets its two literal Azure DevOps variants (2, kept distinct
 *     because "Azure DevOps" and "Azure DevOps / monitoring" are different
 *     recorded strings — collapsing them would be inventing a merge the
 *     data doesn't state); ODG gets "ODG FMDS Board" (1); Sales/Service/HR/
 *     Logistics/Marketing get however many distinct strings their KPIs use
 *     (Marketing has 19 — every one renders, no cap, no invented grouping).
 *   - Depts with zero manual/no-system KPIs (Operations, Finance, IT,
 *     Marketing, ODG, Sales) simply render no "No source system" card and
 *     no amber double-entry banner if `reKeyedKpis.length` is 0 — both
 *     sections are conditional on real counts, never rendered empty.
 *   - The flow diagram's first node lists the department's own real system
 *     names (joined) as its sub-line — never a fixed "WPS · BC" placeholder.
 */

// ─── Small shared helpers ───────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Right-pointing arrow — ported verbatim from reference/app.js's `ICONS.arrow`
// (this file's only use of it; not worth adding to app.js's shared ICONS set
// for a single flow diagram two views away from the shell).
const ARROW_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

function levelLabel(level) {
  if (level === 1) return 'Main';
  if (level === 2) return 'Contributor';
  if (level === 3) return 'Rep / Sub';
  return `L${level}`;
}

/** Canonical target source from kpi.targetSource (preferred) or kpi.source. */
function targetSource(kpi) {
  if (kpi.targetSource) return kpi.targetSource;
  if (kpi.source && kpi.source !== '—') return kpi.source;
  return '—';
}

/**
 * True when a KPI has no real source system to connect — either explicitly
 * flagged (`manualOnly: true`, e.g. HR's safety TRIR items — human-reported
 * incident counts) or its `targetSource` string itself says there isn't one
 * yet (e.g. "TBD — no source system", "—", empty). See file header.
 */
function hasNoSystem(kpi) {
  if (kpi.manualOnly === true) return true;
  const ts = kpi.targetSource;
  if (!ts || ts === '—') return true;
  if (/\btbd\b|no source system/i.test(ts)) return true;
  return false;
}

/**
 * True when today's number is re-keyed by hand into the board rather than
 * pulled directly from its target system — the double-entry FMDS OS
 * eliminates. Heuristic: `kpi.source` names a hand-keyed board/spreadsheet
 * token, or `source`/`targetSource` differ (today's path isn't the target
 * path yet).
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
  if (kpi.source && kpi.targetSource && kpi.source !== kpi.targetSource) return true;
  return false;
}

/** Groups the department's real (has-a-system) KPIs by their targetSource string. */
function groupByTargetSource(kpis) {
  const groups = {};
  const order = [];
  for (const kpi of kpis) {
    const ts = targetSource(kpi);
    if (!groups[ts]) { groups[ts] = []; order.push(ts); }
    groups[ts].push(kpi);
  }
  return { groups, order };
}

// ─── By-source-system card ────────────────────────────────────────────────

function sourceSystemRowHTML(kpi) {
  const reKeyed = isTodayReKeyed(kpi);
  return `
    <div class="src-sys-row" style="display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--border-soft); font-size:13px">
      <span style="flex:1; min-width:0">
        ${esc(kpi.name)}
        <span class="faint" style="font-size:11.5px"> · ${esc(levelLabel(kpi.level || 1))}</span>
      </span>
      ${reKeyed
        ? '<span class="badge badge--amber"><span class="dot"></span>re-keyed today</span>'
        : '<span class="badge badge--green"><span class="dot"></span>direct pull</span>'}
    </div>`;
}

function sourceSystemCardHTML(ts, kpis) {
  return `
    <section class="card">
      <div style="display:flex; align-items:baseline; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--border-soft)">
        <h3>${esc(ts)}</h3><span class="muted" style="font-size:12.5px">${kpis.length} KPI${kpis.length !== 1 ? 's' : ''}</span>
      </div>
      <div style="padding:12px 24px 16px">
        ${kpis.map(sourceSystemRowHTML).join('')}
      </div>
    </section>`;
}

function noSystemCardHTML(kpis) {
  const rows = kpis.map((k) => `
    <div class="src-sys-row" style="display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid var(--border-soft); font-size:13px">
      <span style="flex:1; min-width:0">
        ${esc(k.name)}
        <span class="faint" style="font-size:11.5px"> · ${esc(levelLabel(k.level || 1))}</span>
      </span>
      <span class="badge badge--outline">no source system</span>
    </div>`).join('');

  return `
    <section class="card">
      <div style="display:flex; align-items:baseline; justify-content:space-between; padding:16px 24px; border-bottom:1px solid var(--border-soft)">
        <h3>No source system</h3><span class="muted" style="font-size:12.5px">${kpis.length} KPI${kpis.length !== 1 ? 's' : ''}</span>
      </div>
      <div style="padding:12px 24px 16px">
        ${rows}
        <p class="faint" style="margin:10px 0 0; font-size:12px; line-height:1.5">No source system identified for these KPIs — entered manually where a number exists.</p>
      </div>
    </section>`;
}

// ─── Public entry point ───────────────────────────────────────────────────

export function renderSources(dept, mount) {
  const kpis        = dept.kpis || [];
  const noSystem     = kpis.filter(hasNoSystem);
  const realKpis     = kpis.filter((k) => !hasNoSystem(k));
  const { groups, order: systems } = groupByTargetSource(realKpis);
  const reKeyedKpis  = realKpis.filter(isTodayReKeyed);
  const totalKpis    = kpis.length;

  const statLine = `${totalKpis} KPI${totalKpis !== 1 ? 's' : ''} · ${systems.length} source system${systems.length !== 1 ? 's' : ''} · ${noSystem.length} manual-only`;

  const sysBadges = systems.map((ts) => `<span class="badge badge--neutral">${esc(ts)}</span>`).join('');
  const manualBadge = noSystem.length
    ? `<span class="badge badge--outline">${noSystem.length} manual-only</span>`
    : '';

  const amberBanner = reKeyedKpis.length ? `
    <section class="card card--pad" style="border-left:3px solid var(--amber); margin-bottom:32px">
      <b style="font-size:13.5px; color:var(--amber-text)">Double-entry being eliminated.</b>
      <span style="font-size:13.5px; color:var(--text-secondary)"> ${reKeyedKpis.length} KPI${reKeyedKpis.length !== 1 ? 's are' : ' is'} currently re-keyed from a source system into the board today — FMDS OS replaces ${reKeyedKpis.length !== 1 ? 'these' : 'this'} with a direct pull from the source, removing the manual step entirely.</span>
    </section>` : '';

  const systemCards = systems.map((ts) => sourceSystemCardHTML(ts, groups[ts])).join('');
  const noSystemCard = noSystem.length ? noSystemCardHTML(noSystem) : '';

  const bySourceSection = (systems.length || noSystem.length) ? `
    <div class="section-head"><span class="running-head">By source system</span></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
      ${systemCards}${noSystemCard}
    </div>` : `<p class="muted">No source data defined for this department yet.</p>`;

  const sourceNodeSub = systems.length ? esc(systems.join(' · ')) : 'No connected systems yet';
  const flowNote = reKeyedKpis.length
    ? `${reKeyedKpis.length} KPI${reKeyedKpis.length !== 1 ? 's' : ''} above ${reKeyedKpis.length !== 1 ? 'are' : 'is'} re-keyed today — FMDS OS eliminates that double-entry once the vault connects directly to the source system.${noSystem.length ? ` ${noSystem.length} item${noSystem.length !== 1 ? 's remain' : ' remains'} manual — no source system exists to connect.` : ''}`
    : (noSystem.length
      ? `All connected KPIs in this department are already on a direct-pull path. ${noSystem.length} item${noSystem.length !== 1 ? 's remain' : ' remains'} manual — no source system exists to connect.`
      : `All KPIs in this department are on a direct-pull path — no re-keying left to eliminate.`);

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${esc(dept.name)} · Data Lineage</span>
        <h1>Sourcing Plan</h1>
        <p class="page-head__sub">Where each number comes from. The number is sourced — not re-keyed.</p>
      </div>
      <div class="page-head__side"><button class="btn btn--secondary" data-go="kpi">KPI Boards</button></div>
    </div>

    <section class="card card--pad" style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; margin-bottom:16px">
      <span class="running-head">Target source systems</span>
      ${sysBadges}
      ${manualBadge}
      <span class="muted" style="font-size:13px; margin-left:auto">${statLine}</span>
    </section>

    ${amberBanner}

    ${bySourceSection}

    <div class="section-head"><span class="running-head">Target data flow — single entry point</span></div>
    <section class="flow">
      <div class="flow__node">
        <h4>Source system</h4><p>${sourceNodeSub}</p>
      </div>
      <span class="flow__arrow">${ARROW_SVG}</span>
      <div class="flow__node flow__node--accent">
        <h4>FMDS vault</h4><p>Single entry point</p>
      </div>
      <span class="flow__arrow">${ARROW_SVG}</span>
      <div class="flow__node">
        <h4>FMDS board</h4><p>Reads the vault — never re-keys</p>
      </div>
    </section>
    <p class="board-hint">${flowNote}</p>`;

  mount.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
  });
}
