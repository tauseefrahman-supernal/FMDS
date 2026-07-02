/**
 * views/myday.js — L1 "My Day" (first cut for R1)
 *
 * renderMyDay(dept, mount, persona)
 *
 * A clean, single-operator surface: the signed-in rep's own headline KPI vs
 * target (big Plex-Mono hero), a RAG read, an 8-week trend, and their activity
 * drivers as metric cards. Reuses the same dept KPI data as My Board.
 *
 * Rep resolution: match the persona name against the rep KPIs; else first rep.
 */

import { byId }      from '../lib/registry.js';
import { ragStatus } from '../lib/rag.js';
import { svgLine }   from '../lib/charts.js';

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

function subCards(kpi) {
  const subs = kpi.repSubs;
  if (!subs) return '';
  const defs = [
    { key: 'calls',       label: 'Calls',         unit: 'calls/wk' },
    { key: 'weiMeetings', label: 'WEI Meetings',  unit: 'mtgs/wk' },
    { key: 'hpMeetings',  label: 'HP Meetings',   unit: 'mtgs/wk' },
    { key: 'newOppsWEI',  label: 'New Opps WEI',  unit: 'opps/wk' },
    { key: 'hpNewQuotes', label: 'HP New Quotes', unit: 'quotes/wk' },
    { key: 'revHPI',      label: 'Rev HPI',       unit: '$/wk' },
  ];
  return defs.filter(d => subs[d.key]).map(d => {
    const sub    = subs[d.key];
    const series = sub.series || [];
    const latest = series.filter(v => v != null).pop();
    const rag    = sub.target != null ? ragStatus(latest, sub.target, 'higher_better') : 'nodata';
    const chart  = series.length ? svgLine(series, { target: sub.target || null, width: 200, height: 44, mini: true }) : '';
    return `
      <div class="metric-card">
        <div class="metric-card__top">
          <span class="metric-card__name">${d.label}</span>
          ${sub.target != null ? ragChip(rag) : '<span class="rag-chip rag-chip--nodata">— No Data</span>'}
        </div>
        <div class="metric-card__val">${formatVal(latest, d.unit)}</div>
        <div class="metric-card__tgt">Target <b>${formatVal(sub.target, d.unit)}</b></div>
        ${chart ? `<div class="metric-card__chart">${chart}</div>` : ''}
      </div>`;
  }).join('');
}

export function renderMyDay(dept, mount, persona) {
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

    ${kpi.flag ? `<div class="frozen-banner reveal-2" style="background:var(--amber-bg);border-color:rgba(224,122,18,.28)">⚠ ${kpi.flag}</div>` : ''}

    <h2 class="reveal-3" style="margin-bottom:14px">My activity drivers</h2>
    <div class="myday__grid reveal-3">
      ${subCards(kpi) || '<p class="text-muted">No activity-driver metrics for this rep.</p>'}
    </div>

    ${kpi.note ? `<p class="text-muted text-small mt-6 reveal-4" style="line-height:1.5">${kpi.note}</p>` : ''}`;
}
