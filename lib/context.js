/**
 * lib/context.js — Department context layer for Mark (the AI employee)
 *
 * Assembles a single "what Mark knows about this department" object by
 * composing the existing pure modules (rag, explain, registry, eightstep)
 * with externally-owned reason / comment / KZ (8-step) data passed in via
 * opts. This module is pure and dependency-injectable — no localStorage,
 * no fetch — so it stays unit-testable in plain Node and so later
 * consumers (Ask Mark chat, the red-KPI accountability workflow, the
 * interactive 8-step co-pilot) can all build off the same shape.
 *
 * buildDeptContext(dept, opts) → {
 *   deptId, deptName,
 *   kpis: [{ id, name, rag, actual, target, unit, level, isMain, parentId, owner, explanation }],
 *   reds: [kpiId],
 *   reasons, comments,
 *   kzRecords: [{ kzNumber, item, who, linkedKpiId, done, closed }],
 *   ownerOf(kpiId) → string,
 * }
 *
 * opts (all optional, each defaults to []):
 *   reasons    — reason-log entries for this dept (lib/reasons.js shape), passed through untouched.
 *   comments   — comment-thread entries for this dept (lib/comments.js shape), passed through untouched.
 *   kzRecords  — raw 8-step KZ records (any dept); filtered to this dept via byDept and re-shaped.
 */

import { ragStatus } from './rag.js';
import { explainKpi } from './explain.js';
import { byId } from './registry.js';
import { byDept, progress } from './eightstep.js';

// ─── Ownership ────────────────────────────────────────────────────────────────

/**
 * ownerFor(dept, kpi) → string
 *
 * Main/board KPIs (kpi.isMain === true, or kpi.level <= 1) are owned by the
 * department's L2 lead (dept.lead). Sub-KPIs are owned by kpi.who when a rep
 * is assigned; otherwise ownership falls back to the L2 lead. Always returns
 * a non-empty string (falls back to 'Unassigned' if dept.lead is also missing).
 */
export function ownerFor(dept = {}, kpi = {}) {
  const lead = dept.lead || 'Unassigned';
  const isBoardKpi = kpi.isMain === true || (typeof kpi.level === 'number' && kpi.level <= 1);
  if (isBoardKpi) return lead;
  if (kpi.who) return kpi.who;
  return lead;
}

// ─── RAG (mirrors explainKpi's own nodata-guard so the two never disagree) ─────

function kpiRag(kpi) {
  if (kpi.nodata || kpi.actual == null || kpi.target == null) return 'nodata';
  return ragStatus(kpi.actual, kpi.target, kpi.direction || 'higher_better');
}

// ─── KZ (8-step) record shaping ─────────────────────────────────────────────
//
// Stored KZ records (data/kz-records.json) use `title` for the human-readable
// item description and a numeric `item` for the row's sequence number, while
// freshly-opened records (lib/eightstep.js newKZ) hold the description in
// `item` directly. We surface the description under the output's `item` key,
// preferring `title` (the descriptive field) when present.

function mapKZ(kz) {
  const item = kz.title != null ? kz.title : (kz.item != null ? kz.item : '');
  const linkedKpiId = kz.linkedKpiId != null ? kz.linkedKpiId
    : (kz._kpiId != null ? kz._kpiId : null);
  return {
    kzNumber: kz.kzNumber,
    item,
    who: kz.who || '',
    linkedKpiId,
    done: progress(kz).done,
    closed: !!kz.closed,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * buildDeptContext(dept, opts = {}) → see module header for full shape.
 * Pure: does not read localStorage or fetch JSON. `dept` is a data/<id>.json
 * shaped object ({ id, name, lead, kpis: [...] }); reason/comment/KZ data
 * arrive via opts so this stays testable with no browser globals.
 */
export function buildDeptContext(dept, opts = {}) {
  const reasons = opts.reasons || [];
  const comments = opts.comments || [];
  const kzInput = opts.kzRecords || [];

  const kpis = (dept.kpis || []).map((kpi) => {
    const rag = kpiRag(kpi);
    const explanation = explainKpi(kpi, dept, { rag });
    return {
      id: kpi.id,
      name: kpi.name,
      rag,
      actual: kpi.actual,
      target: kpi.target,
      unit: kpi.unit,
      level: kpi.level,
      isMain: !!kpi.isMain,
      parentId: kpi.parentId != null ? kpi.parentId : null,
      owner: ownerFor(dept, kpi),
      explanation,
    };
  });

  const reds = kpis.filter((k) => k.rag === 'red').map((k) => k.id);

  const kzRecords = byDept(kzInput, dept.id).map(mapKZ);

  function ownerOf(kpiId) {
    const kpi = byId(dept, kpiId);
    return kpi ? ownerFor(dept, kpi) : (dept.lead || 'Unassigned');
  }

  return {
    deptId: dept.id,
    deptName: dept.name,
    kpis,
    reds,
    reasons,
    comments,
    kzRecords,
    ownerOf,
  };
}
