/**
 * views/myday.js — L1 "My Day" (R2: reason-capture + completion summary)
 *
 * renderMyDay(dept, mount, persona)
 *
 * A clean, single-operator surface: the signed-in rep's own headline KPI vs
 * target (big Plex-Mono hero), a RAG read, an 8-week trend, and their activity
 * drivers as metric cards. Reuses the same dept KPI data as My Board.
 *
 * R2 adds:
 *   - RED/AMBER KPIs → inline "Log reason" textarea + Save (persists to localStorage)
 *   - GREEN KPIs → completion summary line (actual vs target, Plex-Mono)
 *   - "This week's context" panel listing the rep's logged reasons
 *
 * Rep resolution: match the persona name against the rep KPIs; else first rep.
 */

import { byId }      from '../lib/registry.js';
import { ragStatus } from '../lib/rag.js';
import { svgLine }   from '../lib/charts.js';
import { addReason, getReasons, getReasonsByEntity, seedDemoReasons } from '../lib/reasons.js';

function displayActual(kpi) {
  if (kpi && kpi.series && kpi.series.length) return kpi.series[kpi.series.length - 1];
  return kpi ? kpi.actual : null;
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

function resolveRepKpi(dept, persona) {
  const repIds = dept.reps || dept.kpis.filter(k => k.level === 3).map(k => k.id);
  if (!repIds.length) return null;
  const wanted = (persona && persona.name || '').toLowerCase();
  if (wanted) {
    const match = repIds
      .map(id => byId(dept, id))
      .find(k => k && k.name.toLowerCase().includes(wanted));
    if (match) return match;
  }
  return byId(dept, repIds[0]);
}

// ─── Reason-log rendering helpers ──────────────────────────────────────────

function relTime(isoTs) {
  const diff = Date.now() - new Date(isoTs).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function reasonEntries(entries) {
  if (!entries.length) return '';
  return entries.map(r => `
    <div class="reason-entry reason-entry--${r.status}">
      <div class="reason-entry__meta">
        <span class="reason-entry__author">${r.author}</span>
        <span class="reason-entry__time">${relTime(r.ts)}</span>
      </div>
      <div class="reason-entry__text">${r.text}</div>
    </div>`).join('');
}

function completionLine(actual, target, unit) {
  return `<div class="completion-line">
    <span class="completion-line__check">✓</span>
    Target met &nbsp;·&nbsp;
    <span class="mono">${formatVal(actual, unit)}</span>
    vs <span class="mono">${formatVal(target, unit)}</span>
  </div>`;
}

function subCards(kpi, dept) {
  const subs = kpi.repSubs;
  if (!subs) return '';
  const defs = [
    { key: 'calls',       label: 'Calls',         unit: 'calls/wk' },
    { key: 'weiMeetings', label: 'WEI Meetings',  unit: 'mtgs/wk' },
    { key: 'hpMeetings',  label: 'HP Meetings',   unit: 'mtgs/wk' },
    { key: 'newOpps',     label: 'New Opps',       unit: 'opps/wk' },
    { key: 'newOppsWEI',  label: 'New Opps WEI',  unit: 'opps/wk' },
    { key: 'hpNewQuotes', label: 'HP New Quotes', unit: 'quotes/wk' },
    { key: 'revHPI',      label: 'Rev HPI',       unit: '$/wk' },
    { key: 'coldCalls',   label: 'Cold Calls',    unit: 'calls/wk' },
    { key: 'meetings',    label: 'Meetings',      unit: 'mtgs/wk' },
  ];
  return defs.filter(d => subs[d.key]).map(d => {
    const sub    = subs[d.key];
    const series = sub.series || [];
    const latest = series.filter(v => v != null).pop();
    const rag    = sub.target != null ? ragStatus(latest, sub.target, 'higher_better') : 'nodata';
    const chart  = series.length ? svgLine(series, { target: sub.target || null, width: 200, height: 44, mini: true }) : '';

    const existing    = getReasons({ deptId: dept.id, kpiId: d.key });
    const needsReason = rag === 'red' || rag === 'amber';
    const isGreen     = rag === 'green';

    const reasonBlock = needsReason
      ? `<div class="reason-log" data-dept="${dept.id}" data-kpi="${d.key}" data-entity="${kpi.id}" data-author="${kpi.name.split('—')[0].trim()}" data-rag="${rag}" data-actual="${latest}" data-unit="${d.unit}">
           ${reasonEntries(existing)}
           <div class="reason-log__form">
             <textarea class="reason-log__input" rows="2" placeholder="Log a reason for this…"></textarea>
             <button class="reason-log__save btn btn--sm">Save</button>
           </div>
         </div>`
      : (isGreen && sub.target != null
          ? completionLine(latest, sub.target, d.unit)
          : '');

    return `
      <div class="metric-card">
        <div class="metric-card__top">
          <span class="metric-card__name">${d.label}</span>
          ${sub.target != null ? ragChip(rag) : '<span class="rag-chip rag-chip--nodata">— No Data</span>'}
        </div>
        <div class="metric-card__val">${formatVal(latest, d.unit)}</div>
        <div class="metric-card__tgt">Target <b>${formatVal(sub.target, d.unit)}</b></div>
        ${chart ? `<div class="metric-card__chart">${chart}</div>` : ''}
        ${reasonBlock}
      </div>`;
  }).join('');
}

function wireReasonLogs(mount, dept) {
  mount.addEventListener('click', (e) => {
    if (!e.target.classList.contains('reason-log__save')) return;
    const logEl   = e.target.closest('.reason-log');
    if (!logEl) return;
    const textarea = logEl.querySelector('.reason-log__input');
    const text = textarea ? textarea.value.trim() : '';
    if (!text) return;

    const { dept: deptId, kpi: kpiId, entity: entityId, author, rag: status } = logEl.dataset;
    addReason({ deptId, kpiId, entityId, author, text, status });

    // Re-render just this log's entries
    const entries = getReasons({ deptId, kpiId });
    const form    = logEl.querySelector('.reason-log__form');
    // Remove old rendered entries (everything before the form)
    Array.from(logEl.children).forEach(c => { if (c !== form) c.remove(); });
    form.insertAdjacentHTML('beforebegin', reasonEntries(entries));
    textarea.value = '';

    // Also refresh the week-context panel if present
    const weekPanel = mount.querySelector('.week-context');
    if (weekPanel) {
      const entityRsns = getReasonsByEntity({ deptId, entityId });
      if (entityRsns.length) {
        weekPanel.innerHTML = `<div class="week-context__head">This week's context</div>${reasonEntries(entityRsns)}`;
      }
    }
  });
}

export function renderMyDay(dept, mount, persona) {
  // Seed illustrative demo reasons on first load (idempotent)
  try { seedDemoReasons(); } catch { /* localStorage unavailable */ }

  const kpi = resolveRepKpi(dept, persona);
  const name = (persona && persona.name) || 'there';

  if (!kpi) {
    mount.innerHTML = `
      <div class="myday__head reveal-1">
        <div class="myday__greeting">Good day, ${name}.</div>
        <div class="myday__date">No individual rep data is available for ${dept.name} yet.</div>
      </div>
      <div class="card reveal-2">
        <p class="text-muted">My Day will populate once your KPIs are wired to a source.</p>
      </div>`;
    return;
  }

  const act = displayActual(kpi);
  const rag = kpi.nodata ? 'nodata' : ragStatus(act, kpi.target, kpi.direction || 'higher_better');
  const chart = kpi.series && kpi.series.length
    ? svgLine(kpi.series, { target: kpi.target, width: 420, height: 70 })
    : '';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const heroReasons     = getReasons({ deptId: dept.id, kpiId: kpi.id });
  const entityReasons   = getReasonsByEntity({ deptId: dept.id, entityId: kpi.id });
  const heroNeedsReason = rag === 'red' || rag === 'amber';
  const heroIsGreen     = rag === 'green';

  const heroReasonBlock = heroNeedsReason
    ? `<div class="reason-log reason-log--hero" data-dept="${dept.id}" data-kpi="${kpi.id}" data-entity="${kpi.id}" data-author="${name}" data-rag="${rag}" data-actual="${act}" data-unit="${kpi.unit || ''}">
         ${reasonEntries(heroReasons)}
         <div class="reason-log__form">
           <textarea class="reason-log__input" rows="2" placeholder="Log a reason for your headline KPI…"></textarea>
           <button class="reason-log__save btn btn--sm">Save</button>
         </div>
       </div>`
    : (heroIsGreen && kpi.target != null
        ? completionLine(act, kpi.target, kpi.unit)
        : '');

  const weekContext = entityReasons.length
    ? `<div class="week-context reveal-4">
         <div class="week-context__head">This week's context</div>
         ${reasonEntries(entityReasons)}
       </div>`
    : '';

  mount.innerHTML = `
    <div class="myday__head reveal-1">
      <div class="myday__greeting">Good day, ${name}.</div>
      <div class="myday__date">${today} · ${dept.name} · your targets for the week</div>
    </div>

    <div class="myday__hero reveal-2">
      <div>
        <div class="myday__hero-label">My headline</div>
        <div class="myday__hero-kpi">${kpi.name}</div>
        <div class="myday__hero-val">${formatVal(act, kpi.unit)}</div>
        <div class="myday__hero-tgt">
          Target <b>${formatVal(kpi.target, kpi.unit)}</b>
          &nbsp;·&nbsp; ${ragChip(rag)}
        </div>
      </div>
      ${chart ? `<div style="overflow:hidden">${chart}</div>` : ''}
    </div>

    ${heroReasonBlock}

    ${kpi.flag ? `<div class="frozen-banner reveal-2" style="background:var(--amber-bg);border-color:var(--amber-border)">⚠ ${kpi.flag}</div>` : ''}

    <h2 class="reveal-3" style="margin-bottom:14px">My activity drivers</h2>
    <div class="myday__grid reveal-3">
      ${subCards(kpi, dept) || '<p class="text-muted">No activity-driver metrics for this rep.</p>'}
    </div>

    ${weekContext}

    ${kpi.note ? `<p class="text-muted text-small mt-6 reveal-4" style="line-height:1.5">${kpi.note}</p>` : ''}`;

  wireReasonLogs(mount, dept);
}
