/**
 * lib/explain.js — Per-KPI explanation engine
 *
 * Every KPI in the FMDS OS carries a short, grounded explanation surfaced when
 * you click into it. This module computes that explanation as a pure function
 * (no DOM) so both the Operations location board and the other-department KPI
 * Boards can share it, and so it is unit-testable.
 *
 * explainKpi(kpi, dept, opts) → { text, definition, source, why }
 *
 *   definition — "what this measures" (from name + unit + cascade level)
 *   source     — "what feeds it"      (targetSource, falling back to source)
 *   why        — RAG-aware "why it's green/amber/red/no-data right now",
 *                grounded in the KPI's own actual vs target (+ story/flag when present)
 *   text       — the three joined into a 1–2 sentence line
 *
 * Grounding priority for `why`:
 *   1. kpi.story.text        (T3 narrative — richest)
 *   2. kpi.flagDetail        (specific data-quality explanation)
 *   3. templated actual-vs-target sentence tuned to the RAG status + direction
 *
 * opts:
 *   rag           — precomputed RAG status ('green'|'amber'|'red'|'nodata').
 *                   If omitted, computed from actualOverride/kpi.actual vs target.
 *   actualOverride — the actual value to reason about (e.g. a location's sub actual
 *                   when the main is Mechanism-B independent). Defaults to kpi.actual.
 */

import { ragStatus } from './rag.js';

// ─── Value formatting (mirrors the views, kept local so this stays pure) ──────

function fmt(v, unit, targetType) {
  if (v == null) return '—';
  if (typeof v !== 'number') return String(v);
  const u = unit || targetType || '';
  if (typeof u === 'string' && (u.startsWith('$') || u.includes('$'))) {
    if (Math.abs(v) >= 1_000_000) return '$' + (v / 1_000_000).toFixed(2) + 'M';
    if (Math.abs(v) >= 1_000)     return '$' + (v / 1_000).toFixed(0) + 'k';
    return '$' + v.toLocaleString();
  }
  if (u === 'ratio' || u === 'rate' || u === 'percent' || u === '%' || u === 'pct') {
    return (v * 100).toFixed(1) + '%';
  }
  if (u === 'pcs_per_labor_hour') return v.toFixed(3) + ' pcs/hr';
  if (u === 'aggregate_labor_hours') return v.toFixed(1) + ' hrs';
  if (u === 'count') return Math.round(v).toLocaleString();
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function cascadeWord(kpi) {
  const lv = kpi.level;
  if (lv === 1 || lv === 'main' || kpi.isMain) return 'main-level';
  if (lv === 2 || lv === 'contributor') return 'contributor-level';
  if (lv === 3 || lv === 'rep') return 'rep-level';
  return null;
}

function dirPhrase(direction) {
  return (direction === 'lower_better') ? 'lower is better' : 'higher is better';
}

// ─── Definition: "what this measures" ────────────────────────────────────────

function buildDefinition(kpi) {
  const cw = cascadeWord(kpi);
  const catBit = kpi.category ? `${kpi.category} · ` : '';
  const levelBit = cw ? `A ${cw} KPI` : 'A KPI';
  return `${catBit}${levelBit} tracked ${dirPhrase(kpi.direction)}.`;
}

// ─── Source: "what feeds it" ─────────────────────────────────────────────────

function buildSource(kpi) {
  if (kpi.manualOnly === true) {
    return 'Manually entered — no source system (hand-keyed).';
  }
  const ts = kpi.targetSource || kpi.source;
  if (!ts) return 'Sourced from the FMDS board.';
  const wasReKeyed = kpi.source && kpi.source !== ts &&
    ['manual', 'hand-keyed', 'coo board', 'literal', 'bowler']
      .some(tok => String(kpi.source).toLowerCase().includes(tok));
  if (wasReKeyed) {
    return `Target source is ${ts} (today re-keyed from ${kpi.source}).`;
  }
  return `Fed from ${ts}.`;
}

// ─── Why: RAG-aware, grounded ────────────────────────────────────────────────

function templatedWhy(kpi, rag, actual) {
  const target = kpi.target;
  const unit = kpi.unit;
  const tt = kpi.targetType;
  const a = fmt(actual, unit, tt);
  const t = fmt(target, unit, tt);

  if (rag === 'nodata') {
    if (kpi.nodataNote) return kpi.nodataNote;
    return `No actual is posted yet, so status can't be computed (target ${t}).`;
  }
  if (rag === 'green') {
    return `On track — latest actual ${a} meets the ${t} target.`;
  }
  if (rag === 'amber') {
    return `At risk — latest actual ${a} is close to but under the ${t} target.`;
  }
  // red
  return `Off track — latest actual ${a} is below the ${t} target (${dirPhrase(kpi.direction)}).`;
}

function buildWhy(kpi, rag, actual) {
  // Richest first: a narrative story, then a specific data-flag detail.
  if (kpi.story && kpi.story.text) {
    return String(kpi.story.text).replace(/\s+/g, ' ').trim();
  }
  if (kpi.flagDetail) {
    return String(kpi.flagDetail).replace(/\s+/g, ' ').trim();
  }
  return templatedWhy(kpi, rag, actual);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * explainKpi(kpi, dept, opts) → { text, definition, source, why }
 */
export function explainKpi(kpi, dept = {}, opts = {}) {
  const actual = opts.actualOverride !== undefined ? opts.actualOverride : kpi.actual;
  const rag = opts.rag || (
    (kpi.nodata || actual == null || kpi.target == null)
      ? 'nodata'
      : ragStatus(actual, kpi.target, kpi.direction || 'higher_better')
  );

  const definition = buildDefinition(kpi);
  const source     = buildSource(kpi);
  const why        = buildWhy(kpi, rag, actual);

  return {
    definition,
    source,
    why,
    text: `${definition} ${source} ${why}`,
  };
}
