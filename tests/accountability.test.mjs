import test from 'node:test'; import assert from 'node:assert';

// Minimal localStorage shim for Node (accountability.js reads/writes localStorage),
// same shim shape as tests/reasons.test.mjs / tests/comments.test.mjs.
const _store = {};
globalThis.localStorage = {
  getItem: (k) => _store[k] ?? null,
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
};

// Import after shim so the module init path (auto-seed) sees localStorage.
const {
  LIFECYCLE, redKpisNeedingResponse, addResponse, getResponse, getResponsesByDept,
  advanceLifecycle, lifecycleView, stalledDays, rollupSignal, seedDemoAccountability,
} = await import('../lib/accountability.js');

// Same shape as tests/context.test.mjs's operationsFixture — real WE figures
// (OTP main: 0.863 actual vs 0.985 target; Mexico sub dragging it red).
const operationsFixture = {
  id: 'operations', name: 'Operations', lead: 'Jim Kozel',
  kpis: [
    { id: 'otp', name: 'OTP (On-Time %)', level: 1, isMain: true, parentId: null,
      actual: 0.863, target: 0.985, unit: 'ratio', direction: 'higher_better' },
    { id: 'otp_houston', name: 'OTP — Houston', level: 2, isMain: false, parentId: 'otp',
      actual: 0.996, target: 0.985, unit: 'ratio', direction: 'higher_better' },
  ],
};

// ─── LIFECYCLE shape ───────────────────────────────────────────────────────

test('LIFECYCLE is the ordered 6-stage array', () => {
  assert.deepEqual(LIFECYCLE,
    ['detected', 'responded', 'actionUnderway', 'eightStepOpened', 'reported', 'recovered']);
});

// ─── (a) redKpisNeedingResponse ─────────────────────────────────────────────

test('redKpisNeedingResponse returns OTP for the red ops fixture', () => {
  const queue = redKpisNeedingResponse(operationsFixture);
  const otp = queue.find(q => q.kpiId === 'otp');
  assert.ok(otp, 'OTP is in the queue');
  assert.equal(otp.rag, 'red');
  assert.equal(otp.owner, 'Jim Kozel');
  assert.ok(otp.dueDate, 'has a dueDate');
  assert.ok(!queue.some(q => q.kpiId === 'otp_houston'), 'green sub-KPI omitted');
});

test('redKpisNeedingResponse omits OTP once its actual meets target', () => {
  const fixed = {
    ...operationsFixture,
    kpis: operationsFixture.kpis.map(k => k.id === 'otp' ? { ...k, actual: 0.99 } : k),
  };
  const queue = redKpisNeedingResponse(fixed);
  assert.ok(!queue.some(q => q.kpiId === 'otp'), 'OTP no longer needs a response');
});

test('redKpisNeedingResponse({includeAmber:true}) also surfaces amber KPIs', () => {
  const amberFixture = {
    ...operationsFixture,
    kpis: [{ ...operationsFixture.kpis[0], actual: 0.96 }], // 0.96/0.985 = amber band
  };
  const redOnly = redKpisNeedingResponse(amberFixture);
  const withAmber = redKpisNeedingResponse(amberFixture, { includeAmber: true });
  assert.ok(!redOnly.some(q => q.kpiId === 'otp'), 'amber excluded by default');
  assert.ok(withAmber.some(q => q.kpiId === 'otp'), 'amber included when requested');
});

// ─── addResponse / getResponse / getResponsesByDept ────────────────────────

// Uses its own kpiId ('otp_manual', distinct from the real 'otp' KPI the
// seed below writes to) so this test's entry can never collide/tie with
// seedDemoAccountability()'s entry later in the file.
test('addResponse returns an entry with id, ts, the 4 fields, and detected+responded done', () => {
  const entry = addResponse({
    deptId: 'operations', kpiId: 'otp_manual', owner: 'Jim Kozel',
    cause: 'Mexico OTP dragging WE main red.',
    action: 'Overtime deployed at Mexico; short-code SOP corrected.',
    needs8Step: true, kzNumber: 'KZ-346', reportBackWhen: 'Next T3 review',
  });
  assert.ok(entry.id);
  assert.ok(entry.ts);
  assert.equal(entry.deptId, 'operations');
  assert.equal(entry.kpiId, 'otp_manual');
  assert.equal(entry.owner, 'Jim Kozel');
  assert.equal(entry.needs8Step, true);
  assert.equal(entry.kzNumber, 'KZ-346');
  assert.equal(entry.answered, true);
  assert.equal(entry.lifecycle.detected.done, true);
  assert.equal(entry.lifecycle.responded.done, true);
  assert.equal(entry.lifecycle.actionUnderway.done, false);
});

test('getResponse finds the entry just added; getResponsesByDept lists it', () => {
  const found = getResponse({ deptId: 'operations', kpiId: 'otp_manual' });
  assert.ok(found);
  assert.equal(found.kpiId, 'otp_manual');
  const byDept = getResponsesByDept('operations');
  assert.ok(byDept.some(e => e.kpiId === 'otp_manual'));
});

test('getResponse breaks ts ties by most-recently-inserted, not array order', () => {
  const sameTs = '2026-06-05T12:00:00.000Z';
  const entries = JSON.parse(localStorage.getItem('fmds_accountability') || '[]');
  entries.push({ id: 'tie-a', deptId: 'operations', kpiId: 'tie_kpi', owner: 'A', ts: sameTs,
    lifecycle: {}, answered: true });
  entries.push({ id: 'tie-b', deptId: 'operations', kpiId: 'tie_kpi', owner: 'B', ts: sameTs,
    lifecycle: {}, answered: true });
  localStorage.setItem('fmds_accountability', JSON.stringify(entries));
  const found = getResponse({ deptId: 'operations', kpiId: 'tie_kpi' });
  assert.equal(found.id, 'tie-b', 'later-inserted entry wins an exact ts tie');
});

test('getResponse returns null when no entry exists', () => {
  assert.equal(getResponse({ deptId: 'operations', kpiId: 'no_such_kpi' }), null);
});

// ─── (b) advanceLifecycle ───────────────────────────────────────────────────

test('advanceLifecycle to "responded" sets answered + lifecycle.responded.done', () => {
  // Fresh dept/kpi with no prior entry — addResponse not called first.
  addResponse({ deptId: 'operations', kpiId: 'otp_fresh', owner: 'Jim Kozel',
    cause: '', action: '', needs8Step: false, kzNumber: null, reportBackWhen: null });
  const entry = advanceLifecycle({ deptId: 'operations', kpiId: 'otp_fresh', stage: 'responded' });
  assert.equal(entry.answered, true);
  assert.equal(entry.lifecycle.responded.done, true);
  assert.ok(entry.lifecycle.responded.ts);
});

test('advanceLifecycle is idempotent — re-advancing an already-done stage keeps the original ts', () => {
  const first = advanceLifecycle({ deptId: 'operations', kpiId: 'otp_fresh', stage: 'actionUnderway' });
  const firstTs = first.lifecycle.actionUnderway.ts;
  const second = advanceLifecycle({ deptId: 'operations', kpiId: 'otp_fresh', stage: 'actionUnderway' });
  assert.equal(second.lifecycle.actionUnderway.ts, firstTs, 'ts unchanged on re-advance (no-op)');
});

test('advanceLifecycle targets the most recent entry when a kpiId has more than one', () => {
  // Simulate a KPI that recovered once already and has since gone red again:
  // two 'otp_repeat' entries exist. advanceLifecycle must progress the newer
  // one, not the first match in array order.
  addResponse({ deptId: 'operations', kpiId: 'otp_repeat', owner: 'Jim Kozel',
    cause: 'first pass', action: '', needs8Step: false, kzNumber: null, reportBackWhen: null });
  const second = addResponse({ deptId: 'operations', kpiId: 'otp_repeat', owner: 'Jim Kozel',
    cause: 'second pass (KPI went red again)', action: '', needs8Step: false, kzNumber: null, reportBackWhen: null });
  const advanced = advanceLifecycle({ deptId: 'operations', kpiId: 'otp_repeat', stage: 'actionUnderway' });
  assert.equal(advanced.id, second.id, 'advanced the newer entry');
  assert.equal(advanced.lifecycle.actionUnderway.done, true);
});

// ─── (c) lifecycleView ──────────────────────────────────────────────────────

test('lifecycleView marks exactly the first not-done stage as current', () => {
  const entry = {
    lifecycle: {
      detected: { done: true, ts: '2026-06-01T00:00:00.000Z' },
      responded: { done: true, ts: '2026-06-02T00:00:00.000Z' },
      actionUnderway: { done: false, ts: null },
      eightStepOpened: { done: false, ts: null },
      reported: { done: false, ts: null },
      recovered: { done: false, ts: null },
    },
  };
  const view = lifecycleView(entry);
  assert.equal(view.length, 6);
  const current = view.filter(s => s.current);
  assert.equal(current.length, 1, 'exactly one current stage');
  assert.equal(current[0].stage, 'actionUnderway');
  assert.equal(view.find(s => s.stage === 'detected').current, false);
  assert.equal(view.find(s => s.stage === 'detected').done, true);
});

test('lifecycleView: no current stage once every stage is done', () => {
  const done = { done: true, ts: '2026-06-01T00:00:00.000Z' };
  const entry = { lifecycle: Object.fromEntries(LIFECYCLE.map(s => [s, done])) };
  const view = lifecycleView(entry);
  assert.ok(view.every(s => s.current === false));
});

// ─── (d) stalledDays ────────────────────────────────────────────────────────

test('stalledDays flags an old actionUnderway ts', () => {
  const entry = {
    lifecycle: {
      detected: { done: true, ts: '2026-06-01T00:00:00.000Z' },
      responded: { done: true, ts: '2026-06-01T00:00:00.000Z' },
      actionUnderway: { done: true, ts: '2026-06-01T00:00:00.000Z' },
      eightStepOpened: { done: false, ts: null },
      reported: { done: false, ts: null },
      recovered: { done: false, ts: null },
    },
  };
  const now = new Date('2026-06-11T00:00:00.000Z'); // 10 days later
  assert.equal(stalledDays(entry, now), 10);
});

test('stalledDays is 0 when nothing has progressed yet', () => {
  const entry = { lifecycle: Object.fromEntries(LIFECYCLE.map(s => [s, { done: false, ts: null }])) };
  assert.equal(stalledDays(entry, new Date('2026-06-11T00:00:00.000Z')), 0);
});

test('stalledDays is 0 for a just-now stamp', () => {
  const now = new Date('2026-06-11T00:00:00.000Z');
  const entry = {
    lifecycle: {
      ...Object.fromEntries(LIFECYCLE.map(s => [s, { done: false, ts: null }])),
      detected: { done: true, ts: now.toISOString() },
    },
  };
  assert.equal(stalledDays(entry, now), 0);
});

// ─── rollupSignal ───────────────────────────────────────────────────────────

test('rollupSignal summarizes redCount/answered/beingActioned/stalled for a dept', () => {
  const signal = rollupSignal('operations');
  assert.ok(signal.redCount >= 2, 'otp + otp_fresh entries counted');
  assert.ok(signal.answered >= 2);
  assert.ok(signal.beingActioned >= 1, 'otp_fresh is in actionUnderway');
  assert.equal(typeof signal.stalled, 'number');
});

// ─── seedDemoAccountability ─────────────────────────────────────────────────

test('seedDemoAccountability seeds the OTP/Mexico entry (Jim Kozel) once, idempotently', () => {
  localStorage.removeItem('fmds_accountability_seeded');
  const before = getResponsesByDept('operations').length;
  seedDemoAccountability();
  const seeded = getResponse({ deptId: 'operations', kpiId: 'otp' });
  assert.ok(seeded, 'seed entry exists');
  assert.equal(seeded.owner, 'Jim Kozel');
  assert.equal(seeded.needs8Step, true);
  assert.equal(seeded.kzNumber, 'KZ-346');
  assert.ok(/Mexico/.test(seeded.cause), 'cause references Mexico');
  assert.equal(seeded.lifecycle.responded.done, true);
  assert.equal(seeded.lifecycle.actionUnderway.done, true);
  assert.equal(seeded.lifecycle.eightStepOpened.done, false);
  const afterCount = getResponsesByDept('operations').length;
  assert.ok(afterCount > before, 'seed added an entry');
  // Second call must not double-add.
  seedDemoAccountability();
  assert.equal(getResponsesByDept('operations').length, afterCount, 'seed is idempotent');
});
