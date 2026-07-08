/**
 * views/overview.js — Role-scoped RED/GREEN Overview surface
 *
 * renderOverview(dept, mount, session)
 *
 * Layout ported from docs/redesign/reference/view-overview.js (§5.1 of
 * docs/redesign/DESIGN-GUIDE.md) — a `.page-head` + a "Needs attention" hero
 * card per red/amber main KPI (Mark's grounded read as a `.ai-note` thread,
 * plus a "Review Draft 8-Step" note when a linked KZ exists) + an "On track"
 * `.stat-tile` grid for everything else. Wired to OUR data throughout: no
 * field is invented — anything the reference hardcodes for Operations (the
 * "86.3", "Mechanism B", "Jim Kozel" example) is derived here from dept.kpis,
 * dept.lead, kpi.story, kpi.rollupMethod, and data/kz-records.json so the
 * same renderer works for every department.
 *
 * L2 lead (and any role landing here for a non-Operations dept): the hero +
 *   stat-tile board described above, built from dept.kpis (the mains).
 *
 * L1 operator, Operations only: unchanged per-location target cards (no
 *   reference spec exists for this surface — Task 15 covers the L1 home
 *   surfaces proper). Re-skinned only to drop the old left-color-bar status
 *   convention in favor of the shared `.badge` treatment.
 */

import { mains }        from '../lib/registry.js';
import { ragStatus }    from '../lib/rag.js';
import { bakedReply }   from '../lib/agent.js';
import { sparkline }    from '../lib/charts.js';
import { byDept, progress } from '../lib/eightstep.js';

// ─── Formatters ────────────────────────────────────────────────────────────

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

function isPctUnit(unit) {
  return unit === 'ratio' || unit === 'percent' || unit === '%' || unit === 'pct';
}

// The 56px hero numeral needs the bare number split from its unit (the unit
// renders separately at 24px via <small>) — only done for percent-like units,
// which is what the reference itself does ("86.3" + small "%"). Every other
// unit just renders formatVal()'s full string with no split, since inventing
// a generic "number vs unit" split for units like "$/wk" or "pcs/hr" would
// either duplicate the $ sign or mangle magnitude abbreviations (k/M).
function heroValueParts(kpi) {
  if (kpi.actual == null) return { main: '—', small: '' };
  if (isPctUnit(kpi.unit)) return { main: (kpi.actual * 100).toFixed(1), small: '%' };
  return { main: formatVal(kpi.actual, kpi.unit), small: '' };
}

// Stat tiles are smaller (26px) — percent-like units get the whole formatted
// string (e.g. "73.4%") with no separate unit chip; other units append the
// dept's own unit label as the <small> suffix, UNLESS it's a $ unit (formatVal
// already renders the $ sign / k / M abbreviation, so a second unit chip would
// just repeat "$/wk" next to a number that already reads "$1.19M").
function tileValueParts(kpi) {
  if (kpi.actual == null) return { main: '—', small: '' };
  if (isPctUnit(kpi.unit)) return { main: formatVal(kpi.actual, kpi.unit), small: '' };
  const isDollar = typeof kpi.unit === 'string' && kpi.unit.includes('$');
  return { main: formatVal(kpi.actual, kpi.unit), small: isDollar ? '' : (kpi.unit || '') };
}

// A couple of departments' KPI `series` are flat number arrays (e.g.
// Operations: [0.948, 0.943, ...]); marketing.json instead stores
// `[{week,date,target,actual}, ...]`. sparkline() expects a flat numeric
// array, so normalize both shapes down to one here rather than teach the
// chart helper about department-specific data quirks.
function seriesNumbers(kpi) {
  const s = kpi.series;
  if (!Array.isArray(s)) return [];
  if (s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => (pt && typeof pt === 'object') ? (pt.actual ?? null) : pt);
  }
  return s;
}

function seriesLabels(kpi) {
  const s = kpi.series;
  if (Array.isArray(s) && s.length && s[0] && typeof s[0] === 'object') {
    return s.map((pt) => 'Wk ' + (pt && pt.week != null ? pt.week : '?'));
  }
  return seriesNumbers(kpi).map((_, i) => 'Wk ' + (i + 1));
}

// ─── RAG + badge ─────────────────────────────────────────────────────────────

function kpiRag(kpi) {
  if (kpi.nodata || kpi.actual == null || kpi.target == null) return 'nodata';
  return ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
}

function statusBadge(rag) {
  const map = {
    green:  ['green',   'On Track'],
    amber:  ['amber',   'At Risk'],
    red:    ['red',     'Off Track'],
    nodata: ['outline', 'No Data'],
  };
  const [cls, label] = map[rag] || map.nodata;
  const dot = rag === 'nodata' ? '' : '<span class="dot"></span>';
  return `<span class="badge badge--${cls}">${dot}${label}</span>`;
}

// ─── Source note + vs-target lines ──────────────────────────────────────────

function sourceNoteFor(kpi) {
  const parts = [];
  if (kpi.source) parts.push(kpi.source.split(' / ')[0]);
  if (kpi.targetSource) parts.push('target from ' + kpi.targetSource);
  return parts.join(' · ');
}

// The hero card's "vs target X · <mechanism/context>" line. The mechanism
// clause is the KPI's own T3-story note when one exists (Operations' OTP is
// the only KPI with this much narrative depth); otherwise it's a plain-English
// read of the KPI's real `rollupMethod` field — never an invented narrative.
function mechanismContext(kpi) {
  if (kpi.story && kpi.story.mechanismNote) return kpi.story.mechanismNote;
  const labels = {
    independent: 'main entered independently',
    sum:         'sum of contributing KPIs',
    avg:         'average of contributing KPIs',
    manual:      'manually entered',
    external:    'external report',
  };
  return kpi.rollupMethod && labels[kpi.rollupMethod] ? labels[kpi.rollupMethod] : null;
}

function heroVsLine(kpi) {
  const targetDisplay = kpi.target != null ? formatVal(kpi.target, kpi.unit) : '—';
  const mech = mechanismContext(kpi);
  return `vs target <b>${targetDisplay}</b>${mech ? ' · ' + mech : ''}`;
}

function tileVsLine(kpi) {
  if (kpi.target == null) return 'No target set';
  const targetDisplay = formatVal(kpi.target, kpi.unit);
  const dirNote = kpi.direction === 'lower_better' ? 'lower is better' : 'higher is better';
  return `vs target ${targetDisplay} · ${dirNote}`;
}

// ─── Mark's "what's driving this" explanation ───────────────────────────────
//
// Combines (in order of groundedness):
//  1. The KPI's own `story.text` (+ `story.denominatorNote`) — richest, most
//     grounded (currently only Operations' OTP has this depth of narrative).
//  2. `kpi.flagDetail` / a short `kpi.flag` string.
//  3. `kpi.rollup.note` — roll-up/entry-mechanic note, appended if present.
//  4. Falls back to the dept-level `bakedReply('explain-red', ...)` template
//     when the KPI itself carries no grounded text.
function kpiAgentExplanation(dept, kpi) {
  const parts = [];

  if (kpi.story && kpi.story.text) {
    parts.push(kpi.story.text);
    if (kpi.story.denominatorNote) parts.push(`Denominator note: ${kpi.story.denominatorNote}`);
  } else if (kpi.flagDetail) {
    parts.push(kpi.flagDetail);
  } else if (kpi.flag && typeof kpi.flag === 'string' && kpi.flag.length < 200) {
    parts.push(kpi.flag);
  }

  if (kpi.rollup && kpi.rollup.note) {
    parts.push(`Entry mechanic: ${kpi.rollup.note}`);
  }

  if (!parts.length) {
    const reply = bakedReply(dept.id, 'explain-red', { kpi: kpi.name });
    parts.push(reply.replace(/^Why is [^\n]+\?\n\n/, '').trim());
  }

  return parts.filter(Boolean).join('\n\n');
}

// ─── Hero card (red/amber headline KPI) ────────────────────────────────────

function buildHeroCard(dept, kpi) {
  const rag = kpiRag(kpi);
  const { main, small } = heroValueParts(kpi);
  const spark = sparkline(seriesNumbers(kpi), {
    w: 380, h: 88, target: kpi.target,
    name: `${kpi.name} weekly`, labels: seriesLabels(kpi), fmt: kpi.unit,
  }).replace('<svg class="spark"', '<svg class="spark" style="width:100%;height:auto"');
  const sourceNote = sourceNoteFor(kpi);
  const explanation = kpiAgentExplanation(dept, kpi);
  const paragraphs = explanation.split('\n\n').filter(Boolean).map((p) => `<p>${p}</p>`).join('');

  return `
    <section class="card hero-kpi" aria-label="${kpi.name} headline KPI">
      <div class="hero-kpi__main">
        <div class="hero-kpi__label">
          <h3>${kpi.name}</h3>
          ${statusBadge(rag)}
        </div>
        <div class="hero-kpi__value">${main}${small ? `<small>${small}</small>` : ''}</div>
        <div class="hero-kpi__vs">${heroVsLine(kpi)}</div>
        <div style="flex:1; display:flex; align-items:center; min-height:80px">${spark}</div>
        <div class="hero-kpi__foot">
          ${sourceNote ? `<span class="source-note">${sourceNote}</span>` : '<span></span>'}
          <button class="btn btn--ghost btn--sm" data-go="kpi">Open in KPI Boards →</button>
        </div>
      </div>
      <div class="hero-kpi__side" data-kz-side="${dept.id}::${kpi.id}">
        <div class="ai-note">
          <div class="ai-note__avatar">M</div>
          <div class="ai-note__body">
            <div class="ai-note__head">
              <b>Mark</b><span class="muted">AI Employee</span>
              <span class="running-head" style="color:var(--accent-text)">What's driving this</span>
            </div>
            <div class="ai-note__text">${paragraphs}</div>
          </div>
        </div>
      </div>
    </section>`;
}

// ─── Stat tile (on-track / no-data KPI) ────────────────────────────────────

function buildStatTile(dept, kpi) {
  const rag = kpiRag(kpi);
  const { main, small } = tileValueParts(kpi);
  const spark = sparkline(seriesNumbers(kpi), {
    w: 280, h: 40, target: kpi.target, name: kpi.name, labels: seriesLabels(kpi), fmt: kpi.unit,
  });
  const sourceNote = sourceNoteFor(kpi);

  return `
    <section class="card stat-tile">
      <div class="stat-tile__top">
        <span class="stat-tile__label">${kpi.name}</span>
        ${statusBadge(rag)}
      </div>
      <div class="stat-tile__value">${main}${small ? `<small>${small}</small>` : ''}</div>
      <div class="stat-tile__vs">${tileVsLine(kpi)}</div>
      <div class="stat-tile__spark">${spark}</div>
      <div class="hero-kpi__foot" style="padding-top:8px">
        ${sourceNote ? `<span class="source-note">${sourceNote}</span>` : '<span></span>'}
        <button class="btn btn--ghost btn--sm" data-go="kpi">Open in KPI Boards →</button>
      </div>
    </section>`;
}

// ─── "Review Draft 8-Step" note — deep-opens the dept's linked KZ ──────────
//
// Finds the open (not-closed) KZ record — from data/kz-records.json — linked
// (via `linkedKpiId`) to this headline KPI or one of its contributors (sub-
// KPIs). For Operations' OTP that resolves to KZ-346 (linked to the
// otp_mexico contributor); most other departments have no such record, so
// the note is simply omitted — never fabricated. When more than one open KZ
// matches, the furthest-along draft (most steps confirmed) wins.
function findLinkedKz(records, dept, kpi) {
  const candidateIds = new Set([kpi.id, ...(kpi.contributors || [])]);
  const matches = byDept(records, dept.id)
    .filter((r) => !r.closed && r.linkedKpiId && candidateIds.has(r.linkedKpiId));
  if (!matches.length) return null;
  matches.sort((a, b) => progress(b).done - progress(a).done);
  return matches[0];
}

function kzNoteHTML(kz) {
  const p = progress(kz);
  const title = kz.title || kz.item || kz.kzNumber;
  const who = kz.who ? `owned by ${kz.who}, ` : '';
  return `
    <div class="ai-note">
      <div class="ai-note__avatar">M</div>
      <div class="ai-note__body">
        <div class="ai-note__head"><b>Mark</b></div>
        <div class="ai-note__text">
          <p>I've pre-drafted an 8-step on this — <b>${kz.kzNumber}</b>, "${title}" (${who}${p.done}/8 steps confirmed). It's waiting in Problem-Solving.</p>
        </div>
        <div style="margin-top:8px">
          <button class="btn btn--outline btn--sm" data-go-kz="${kz.kzNumber}" data-go-kpi="${kz.linkedKpiId || ''}">Review Draft 8-Step</button>
        </div>
      </div>
    </div>`;
}

// Fire-and-forget, same pattern as the old Hoshin-strip splice: the board
// already painted synchronously (dispatchView() never awaits renderOverview),
// so once data/kz-records.json resolves we splice the second note into the
// matching hero card's `.hero-kpi__side`. No-ops gracefully with no `fetch`
// global (Node tests) or if the mount has since been replaced/navigated away.
async function injectKzDraftNotes(dept, mount, headlineKpis) {
  if (!headlineKpis.length || typeof fetch !== 'function') return;
  let records;
  try {
    const res = await fetch('data/kz-records.json');
    records = await res.json();
  } catch { return; }
  if (!mount.isConnected) return;

  headlineKpis.forEach((kpi) => {
    const kz = findLinkedKz(records, dept, kpi);
    if (!kz) return;
    const host = mount.querySelector(`[data-kz-side="${dept.id}::${kpi.id}"]`);
    if (host) host.insertAdjacentHTML('beforeend', kzNoteHTML(kz));
  });
}

// ─── L2 (+ default) main-KPI overview ──────────────────────────────────────

function renderBoardOverview(dept, mount, role) {
  const kpiList = mains(dept);
  const order = { red: 0, amber: 1, green: 2, nodata: 3 };
  const withRag = kpiList
    .map((kpi) => ({ kpi, rag: kpiRag(kpi) }))
    .sort((a, b) => order[a.rag] - order[b.rag]);

  const headline = withRag.filter((x) => x.rag === 'red' || x.rag === 'amber');
  const rest     = withRag.filter((x) => x.rag === 'green' || x.rag === 'nodata');

  const redCount = headline.filter((x) => x.rag === 'red').length;
  const attentionCount = headline.length;
  const subheading = attentionCount > 0
    ? `${attentionCount} KPI${attentionCount > 1 ? 's' : ''} need${attentionCount === 1 ? 's' : ''} attention`
    : 'All KPIs on track or no active issues';

  const needsAttentionHtml = headline.length ? `
    <div class="section-head" style="margin-top:0"><span class="running-head">Needs attention</span></div>
    ${headline.map((x) => buildHeroCard(dept, x.kpi)).join('')}` : '';

  const onTrackHtml = rest.length ? `
    <div class="section-head"${headline.length ? '' : ' style="margin-top:0"'}><span class="running-head">On track</span></div>
    <div class="stat-grid">${rest.map((x) => buildStatTile(dept, x.kpi)).join('')}</div>` : '';

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${dept.name} · Team Board</span>
        <h1>Overview</h1>
        <p class="page-head__sub">${role} · ${dept.lead || 'Lead'} · ${subheading}</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--secondary" data-go="sources">Sources</button>
        <button class="btn btn--primary" data-go="kpi">Open KPI Boards →</button>
      </div>
    </div>
    ${needsAttentionHtml}
    ${onTrackHtml}
    ${!kpiList.length ? '<p class="muted">No KPI data available.</p>' : ''}
    <p class="board-hint"><b>Overview</b> shows department main KPIs by status. Red and amber cards include Mark's grounded explanation. Use <b>KPI Boards</b> for the full level-by-level breakdown with trends and operator contributions.</p>`;

  // Router hooks: data-go → view (kpi/sources); data-go-kz → solve, opening
  // the linked KZ via the SAME `?kpi=<id>&kz=<kzNumber>` handoff Ask Mark's
  // escalation flow already uses (views/problemsolving.js resolves the real
  // KZ record and lands on its first unconfirmed step) — never a hardcoded
  // step number.
  mount.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) {
      location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
      return;
    }
    const kzBtn = e.target.closest('[data-go-kz]');
    if (kzBtn) {
      const kzNumber = kzBtn.dataset.goKz;
      const kpiId = kzBtn.dataset.goKpi || '';
      location.hash = `#/dept/${dept.id}/solve?kpi=${encodeURIComponent(kpiId)}&kz=${encodeURIComponent(kzNumber)}`;
    }
  });

  injectKzDraftNotes(dept, mount, headline.map((x) => x.kpi));

  return { redCount };
}

// ─── L1 per-location target view (Operations path) ─────────────────────────

/**
 * For an L1 Operations operator: show the location board KPIs they own. No
 * reference layout exists for this surface (Task 15 covers the L1 home
 * surfaces) — kept behaviorally identical to before, re-skinned only to
 * replace the old left-color-bar status convention with the shared `.badge`
 * (state lives in the badge everywhere else in the redesign; this surface
 * shouldn't be the one holdout).
 */
function renderL1OperationsOverview(dept, mount, persona) {
  const locId = persona && persona.location
    ? persona.location.toLowerCase()
    : (dept.locations && dept.locations[0]) || null;

  const locBoard = locId && dept.locationBoards && dept.locationBoards[locId]
    ? dept.locationBoards[locId]
    : null;

  if (!locBoard) {
    renderBoardOverview(dept, mount, 'L1');
    return;
  }

  const otpKpi  = locBoard.kpis.find((k) => k.category === 'SERVICE/DELIVERY' && k.name.includes('OTP'));
  const pplhKpi = locBoard.kpis.find((k) => k.category === 'COST' && k.name === 'PPLH');

  const makeL1Tile = (kpi) => {
    if (!kpi) return '';
    const isNoData = kpi.nodata || kpi.actual == null;
    const rag = isNoData ? 'nodata' : ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');

    return `
      <section class="card stat-tile">
        <div class="stat-tile__top">
          <span class="stat-tile__label">${kpi.category} · ${kpi.name}</span>
          ${statusBadge(rag)}
        </div>
        <div class="stat-tile__value">${isNoData ? '—' : formatVal(kpi.actual, kpi.unit)}</div>
        <div class="stat-tile__vs">
          Target: ${kpi.target != null ? formatVal(kpi.target, kpi.unit) : '—'}${kpi.latestMonth ? ` · Latest: ${kpi.latestMonth}` : ''}
        </div>
        ${kpi.unitNote ? `<div class="stat-tile__vs" style="color:var(--amber-text)">${kpi.unitNote}</div>` : ''}
      </section>`;
  };

  mount.innerHTML = `
    <div class="page-head">
      <div>
        <span class="running-head page-head__eyebrow">${dept.name} · My Targets</span>
        <h1>Overview</h1>
        <p class="page-head__sub">L1 · ${locBoard.label} · ${locBoard.productionLines ? locBoard.productionLines.length : '—'} production lines</p>
      </div>
      <div class="page-head__side">
        <button class="btn btn--primary" data-go="kpi">Open KPI Boards →</button>
      </div>
    </div>
    <div class="stat-grid" style="margin-top:0">
      ${makeL1Tile(otpKpi)}
      ${makeL1Tile(pplhKpi)}
    </div>
    ${locBoard.actualsNote ? `<p class="board-hint">${locBoard.actualsNote}</p>` : ''}
    <p class="board-hint">Your targets for <b>${locBoard.label}</b>. Use <b>KPI Boards</b> for the full location breakdown.</p>`;

  mount.addEventListener('click', (e) => {
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) location.hash = `#/dept/${dept.id}/${goBtn.dataset.go}`;
  });
}

// ─── Public entry point ─────────────────────────────────────────────────────

/**
 * renderOverview(dept, mount, session)
 *
 * session — { role: 'L1' | 'L2', persona: { name, label, location? } }
 *   Pass null/undefined session to default to L2 rendering.
 */
export function renderOverview(dept, mount, session) {
  const role = session && session.role ? session.role : 'L2';

  if (role === 'L1' && dept.id === 'operations') {
    renderL1OperationsOverview(dept, mount, session ? session.persona : null);
  } else {
    renderBoardOverview(dept, mount, role);
  }
}
