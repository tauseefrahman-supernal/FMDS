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
  // Two illustrative Diane (inside sales rep) entries — clearly demo data
  addReason({
    deptId: 'sales', kpiId: 'calls', entityId: 'rep_diane',
    author: 'Diane',
    text: '3 short — 2 accounts rescheduled to Thu, 1 no-show. Expect to catch up Fri AM.',
    status: 'amber',
  });
  addReason({
    deptId: 'sales', kpiId: 'calls', entityId: 'rep_diane',
    author: 'Diane',
    text: 'Call volume dropped Mon–Tue: system outage on HubSpot dialer 9–11 AM both days.',
    status: 'red',
  });
  localStorage.setItem(SEED_FLAG, '1');
}
