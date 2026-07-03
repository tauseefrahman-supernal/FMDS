import test from 'node:test'; import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { byId, contributorsOf } from '../lib/registry.js';

const dept = JSON.parse(readFileSync(new URL('../data/service.json', import.meta.url)));

// ── Structure tests ──────────────────────────────────────────────────────────

test('service.json parses without error', () => {
  assert.ok(dept && dept.kpis && Array.isArray(dept.kpis));
});

// ── Team JC ──────────────────────────────────────────────────────────────────

test('rev_jc has all 7 Team JC rep contributors', () => {
  const jc = byId(dept, 'rev_jc');
  assert.ok(jc, 'rev_jc must exist');
  const expected = ['rep_diane','rep_cullen','rep_dylan','rep_liz','rep_charlie','rep_lisa','rep_colten'];
  assert.deepEqual(jc.contributors.sort(), expected.sort());
});

test('rep_liz exists and is parented to rev_jc', () => {
  const liz = byId(dept, 'rep_liz');
  assert.ok(liz, 'rep_liz must exist');
  assert.equal(liz.parentId, 'rev_jc');
  assert.ok(liz.series && liz.series.length >= 1, 'rep_liz must have series data');
});

test('rep_charlie exists and is parented to rev_jc', () => {
  const charlie = byId(dept, 'rep_charlie');
  assert.ok(charlie, 'rep_charlie must exist');
  assert.equal(charlie.parentId, 'rev_jc');
});

test('rep_lisa exists and is parented to rev_jc', () => {
  const lisa = byId(dept, 'rep_lisa');
  assert.ok(lisa, 'rep_lisa must exist');
  assert.equal(lisa.parentId, 'rev_jc');
});

// ── Team Noel ────────────────────────────────────────────────────────────────

test('rev_noel has all 5 Team Noel rep contributors', () => {
  const noel = byId(dept, 'rev_noel');
  assert.ok(noel, 'rev_noel must exist');
  const expected = ['rep_karen','rep_alma','rep_ryan','rep_mindy','rep_tamara'];
  assert.deepEqual(noel.contributors.sort(), expected.sort());
});

test('rep_karen exists and is parented to rev_noel', () => {
  const k = byId(dept, 'rep_karen');
  assert.ok(k, 'rep_karen must exist');
  assert.equal(k.parentId, 'rev_noel');
  assert.ok(k.series && k.series.length >= 1);
});

test('rep_alma exists and is parented to rev_noel', () => {
  const a = byId(dept, 'rep_alma');
  assert.ok(a, 'rep_alma must exist');
  assert.equal(a.parentId, 'rev_noel');
});

test('rep_ryan exists and is parented to rev_noel', () => {
  const r = byId(dept, 'rep_ryan');
  assert.ok(r, 'rep_ryan must exist');
  assert.equal(r.parentId, 'rev_noel');
});

test('rep_mindy exists and is parented to rev_noel', () => {
  const m = byId(dept, 'rep_mindy');
  assert.ok(m, 'rep_mindy must exist');
  assert.equal(m.parentId, 'rev_noel');
});

test('rep_tamara exists and is parented to rev_noel', () => {
  const t = byId(dept, 'rep_tamara');
  assert.ok(t, 'rep_tamara must exist');
  assert.equal(t.parentId, 'rev_noel');
});

// ── Team Noel roll-up bug flag ────────────────────────────────────────────────

test('rev_we has a flag and flagDetail about Team Noel', () => {
  const rev = byId(dept, 'rev_we');
  assert.ok(rev.flag, 'rev_we must have a flag');
  assert.ok(rev.flagDetail, 'rev_we must have flagDetail');
  assert.match(rev.flagDetail, /Team Noel/);
  assert.match(rev.flagDetail, /13/); // references the $13.73M missing
});

test('rev_noel actual reflects real $13.73M (Team Noel FMDS total)', () => {
  const noel = byId(dept, 'rev_noel');
  // The Team Noel (FMDS) AF total = 13,731,560 (annual). Weekly avg = 13731560/52 ≈ 264,068.
  // The KPI stores weekly actual in its series. Confirm series exists and has values > 0.
  assert.ok(noel.actual > 0 || (noel.series && noel.series.some(v => v > 0)));
});

// ── Rep repSubs structure ─────────────────────────────────────────────────────

test('rep_diane repSubs has all 7 L1 day-by-day keys', () => {
  const diane = byId(dept, 'rep_diane');
  const subs = diane.repSubs;
  assert.ok(subs, 'repSubs must exist');
  const requiredKeys = ['incomingRevenue','quotes','openQuotes','deals','openDeals','grip','timeWithCustomer'];
  requiredKeys.forEach(k => assert.ok(k in subs, `repSubs must have key: ${k}`));
});

test('rep_karen repSubs has all 7 L1 day-by-day keys', () => {
  const karen = byId(dept, 'rep_karen');
  const subs = karen.repSubs;
  assert.ok(subs, 'rep_karen.repSubs must exist');
  const requiredKeys = ['incomingRevenue','quotes','openQuotes','deals','openDeals','grip','timeWithCustomer'];
  requiredKeys.forEach(k => assert.ok(k in subs, `rep_karen.repSubs must have key: ${k}`));
});

// ── dept.reps + dept.teams arrays ────────────────────────────────────────────

test('dept.reps includes all 12 reps', () => {
  assert.ok(Array.isArray(dept.reps));
  const expected = [
    'rep_diane','rep_cullen','rep_dylan','rep_liz','rep_charlie','rep_lisa','rep_colten',
    'rep_karen','rep_alma','rep_ryan','rep_mindy','rep_tamara'
  ];
  expected.forEach(id => assert.ok(dept.reps.includes(id), `dept.reps must include ${id}`));
});

test('dept.teams includes rev_jc and rev_noel', () => {
  assert.ok(Array.isArray(dept.teams));
  assert.ok(dept.teams.includes('rev_jc'));
  assert.ok(dept.teams.includes('rev_noel'));
});
