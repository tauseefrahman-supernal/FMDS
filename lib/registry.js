export const byId = (dept, id) => dept.kpis.find(k => k.id === id) || null;
export const mains = (dept) => dept.kpis.filter(k => k.isMain);
export const contributorsOf = (dept, id) => {
  const k = byId(dept, id); if (!k || !k.contributors) return [];
  return k.contributors.map(cid => byId(dept, cid)).filter(Boolean);
};
export const flagged = (dept) => dept.kpis.filter(k => k.flag);
