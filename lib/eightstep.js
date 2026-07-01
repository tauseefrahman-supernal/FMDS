export function progress(kz) {
  const steps = kz.steps || {};
  const done = Object.values(steps).filter(Boolean).length;
  return { done, total: 8, pct: Math.round((done / 8) * 100) };
}
export const isClosed = (kz) => progress(kz).done === 8;
export const byDept = (records, deptId) => records.filter(r => r.deptId === deptId);
export function newKZ({ item, who, deptId }) {
  return { item, who, deptId, kzNumber: 'KZ-NEW', start: null,
    steps: {1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:false},
    active: true, closed: false };
}
