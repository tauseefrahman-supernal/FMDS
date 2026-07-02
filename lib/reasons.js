/**
 * lib/reasons.js — reason-log store
 *
 * In-memory + localStorage-backed. Readable by the L2 view via
 * getReasonsByDept(deptId). Seeded with illustrative Diane entries on first load.
 *
 * Entry shape:
 *   { id, deptId, kpiId, entityId, author, text, status, ts }
 *   id:       string (crypto.randomUUID or Date.now fallback)
 *   deptId:   string  — e.g. 'sales'
 *   kpiId:    string  — e.g. 'calls'
 *   entityId: string  — rep kpi id, e.g. 'rep_michael'
 *   author:   string  — display name of the rep
 *   text:     string  — free-text reason note
 *   status:   'red' | 'amber' | 'green' | 'nodata'
 *   ts:       ISO 8601 string
 */

const LS_KEY    = 'fmds_reasons';
const SEED_FLAG = 'fmds_reasons_seeded';

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function save(entries) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(entries)); } catch { /* quota */ }
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return String(Date.now()) + '-' + Math.random().toString(36).slice(2, 9);
}

export function addReason({ deptId, kpiId, entityId, author, text, status }) {
  const entry = {
    id: uid(),
    deptId,
    kpiId:    kpiId    || '',
    entityId: entityId || '',
    author:   author   || '',
    text:     text     || '',
    status:   status   || 'nodata',
    ts: new Date().toISOString(),
  };
  const entries = load();
  entries.push(entry);
  save(entries);
  return entry;
}

export function getReasons({ deptId, kpiId }) {
  return load()
    .filter(r => r.deptId === deptId && r.kpiId === kpiId)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

export function getReasonsByEntity({ deptId, entityId }) {
  return load()
    .filter(r => r.deptId === deptId && r.entityId === entityId)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

export function getReasonsByDept(deptId) {
  return load()
    .filter(r => r.deptId === deptId)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

export function seedDemoReasons() {
  if (localStorage.getItem(SEED_FLAG)) return;
  // Two illustrative Diane (Service / Team JC rep) entries — clearly demo data.
  // deptId: 'service', kpiId: 'rev_jc' (Team JC revenue), entityId: 'rep_diane'
  // These surface on the L2 Service Team Board when rev_jc or rev_total is expanded.
  addReason({
    deptId: 'service', kpiId: 'rev_jc', entityId: 'rep_diane',
    author: 'Diane',
    text: '3 quotes short — 2 accounts rescheduled to Thu, 1 no-show. Expect to catch up Fri AM.',
    status: 'amber',
  });
  addReason({
    deptId: 'service', kpiId: 'rev_jc', entityId: 'rep_diane',
    author: 'Diane',
    text: 'Quote volume dropped Mon–Tue: system outage on HubSpot dialer 9–11 AM both days. JC team impacted.',
    status: 'red',
  });
  localStorage.setItem(SEED_FLAG, '1');
}

// Auto-seed on first import in the browser, so the L2 board has floor context
// even if the L1 My Day view was never opened. Browser-guarded so Node tests
// (which import this module without a localStorage global) don't throw.
if (typeof localStorage !== 'undefined') {
  try { seedDemoReasons(); } catch { /* localStorage unavailable */ }
}
