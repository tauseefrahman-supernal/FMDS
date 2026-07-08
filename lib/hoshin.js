/**
 * lib/hoshin.js — Hoshin (annual policy-deployment) data layer
 *
 * Pure, dependency-injectable reader over data/hoshin.json (see that file's
 * _meta for full extraction/zero-invented-data provenance). No localStorage,
 * no fetch in the pure functions below — the caller passes the parsed hoshin
 * object in, so this stays unit-testable in plain Node.
 *
 * hoshin shape: { _meta, objectives: [{id, name, priorityTag}],
 *                 departments: { <deptId>: { block, functionalLead, activities: [...] } } }
 * activity shape: { hoshinPriority, objectiveId, objectiveIds?, activityPlan,
 *                    target, supportFunction, lead, timeline }
 */

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * objectives(hoshin) → [{id, name, priorityTag}]
 * The full WE 2026 objective list, in source order.
 */
export function objectives(hoshin = {}) {
  return hoshin.objectives || [];
}

/**
 * activitiesFor(hoshin, deptId) → [activity]
 * That department's Hoshin activities; [] for an unknown dept or one whose
 * source block was entirely blank (e.g. finance).
 */
export function activitiesFor(hoshin = {}, deptId) {
  const dept = (hoshin.departments || {})[deptId];
  return (dept && dept.activities) || [];
}

/**
 * functionalLeadFor(hoshin, deptId) → string|null
 * The block-level functional lead named in the source workbook; null if the
 * dept is unknown or the lead was never captured.
 */
export function functionalLeadFor(hoshin = {}, deptId) {
  const dept = (hoshin.departments || {})[deptId];
  return (dept && dept.functionalLead) || null;
}

/**
 * objectiveRelations(hoshin, deptId) → [{objectiveId, name, relation}]
 *
 * Every objective, exactly once, tagged 'drives' when the department has at
 * least one activity whose objectiveId (or an entry in objectiveIds, for
 * compound-labeled activities) equals that objective — else 'supports'.
 * Powers the per-board Hoshin strip (drives = bold disk, supports = dim).
 * Departments with zero activities (unknown dept or a blank source block)
 * surface every objective as 'supports'.
 */
export function objectiveRelations(hoshin = {}, deptId) {
  const activities = activitiesFor(hoshin, deptId);
  const driven = new Set();
  activities.forEach((a) => {
    if (a.objectiveId) driven.add(a.objectiveId);
    if (Array.isArray(a.objectiveIds)) {
      a.objectiveIds.forEach((id) => { if (id) driven.add(id); });
    }
  });

  return objectives(hoshin).map((o) => ({
    objectiveId: o.id,
    name: o.name,
    relation: driven.has(o.id) ? 'drives' : 'supports',
  }));
}

/**
 * loadHoshin() → Promise<hoshin object|null>
 * Browser-only convenience loader for view code — fetches data/hoshin.json.
 * Guarded so Node tests (no `fetch` global) never hit this path; they inject
 * a parsed fixture into the pure functions above instead.
 */
export async function loadHoshin() {
  if (typeof fetch === 'undefined') return null;
  const res = await fetch('data/hoshin.json');
  return res.json();
}
