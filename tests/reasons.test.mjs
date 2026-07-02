import test from 'node:test'; import assert from 'node:assert';

// Minimal localStorage shim for Node (reasons.js reads/writes localStorage)
const _store = {};
globalThis.localStorage = {
  getItem: (k) => _store[k] ?? null,
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
};

// Import after shim so the module init path sees localStorage
const { addReason, getReasons, getReasonsByEntity, getReasonsByDept, seedDemoReasons }
  = await import('../lib/reasons.js');

test('addReason returns entry with id and ts', () => {
  const r = addReason({ deptId: 'sales', kpiId: 'calls', entityId: 'rep_michael',
    author: 'Michael', text: 'Out sick Monday', status: 'red' });
  assert.ok(r.id, 'has id');
  assert.ok(r.ts, 'has ts');
  assert.equal(r.deptId, 'sales');
  assert.equal(r.kpiId, 'calls');
  assert.equal(r.author, 'Michael');
  assert.equal(r.status, 'red');
});

test('getReasons returns newest first', () => {
  addReason({ deptId: 'sales', kpiId: 'calls', entityId: 'rep_michael',
    author: 'Michael', text: 'Second entry', status: 'amber' });
  const rs = getReasons({ deptId: 'sales', kpiId: 'calls' });
  assert.ok(rs.length >= 2);
  // newest first: ts of [0] >= ts of [1]
  assert.ok(rs[0].ts >= rs[1].ts);
});

test('getReasons filters by deptId + kpiId', () => {
  addReason({ deptId: 'hr', kpiId: 'turnover', entityId: 'rep_hr',
    author: 'HR', text: 'Different dept', status: 'red' });
  const rs = getReasons({ deptId: 'sales', kpiId: 'calls' });
  assert.ok(rs.every(r => r.deptId === 'sales' && r.kpiId === 'calls'));
});

test('getReasonsByEntity filters by deptId + entityId', () => {
  const rs = getReasonsByEntity({ deptId: 'sales', entityId: 'rep_michael' });
  assert.ok(rs.every(r => r.deptId === 'sales' && r.entityId === 'rep_michael'));
});

test('getReasonsByDept returns all entries for dept', () => {
  const rs = getReasonsByDept('sales');
  assert.ok(rs.every(r => r.deptId === 'sales'));
});

test('seedDemoReasons seeds once and is idempotent', () => {
  // Clear seed flag so seed runs
  localStorage.removeItem('fmds_reasons_seeded');
  const before = getReasonsByEntity({ deptId: 'sales', entityId: 'rep_diane' }).length;
  seedDemoReasons();
  const after = getReasonsByEntity({ deptId: 'sales', entityId: 'rep_diane' }).length;
  assert.ok(after > before, 'seed added entries');
  // Second call should not double-add
  seedDemoReasons();
  const afterAgain = getReasonsByEntity({ deptId: 'sales', entityId: 'rep_diane' }).length;
  assert.equal(afterAgain, after, 'seed is idempotent');
});

test('entries persist in localStorage', () => {
  const count = getReasonsByDept('sales').length;
  // Re-read raw from localStorage to verify serialization
  const raw = JSON.parse(localStorage.getItem('fmds_reasons') || '[]');
  assert.ok(raw.length >= count);
});
