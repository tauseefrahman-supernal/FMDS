export function progress(kz) {
  const steps = kz.steps || {};
  const done = Object.values(steps).filter(Boolean).length;
  return { done, total: 8, pct: Math.round((done / 8) * 100) };
}
export const isClosed = (kz) => progress(kz).done === 8;
export const byDept = (records, deptId) => records.filter(r => r.deptId === deptId);
// kzNumber is deliberately null (not a fake placeholder string) — a fresh,
// in-memory 8-step draft doesn't have a real sequential number yet, and
// callers (views/problemsolving.js's wizard header,
// views/askmark.js's escalation read-back) must render/word around that
// honestly rather than display a number that was never allocated. `title`
// defaults to the real problem `item` (usually the triggering KPI's own
// name) so the wizard header always has a grounded, non-placeholder title
// even before any step content exists.
export function newKZ({ item, title, who, deptId }) {
  return { item, title: title || item || null, who, deptId, kzNumber: null, start: null,
    steps: {1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:false},
    active: true, closed: false };
}
