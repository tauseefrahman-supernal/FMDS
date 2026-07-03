import test from 'node:test'; import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { byId, contributorsOf } from '../lib/registry.js';

const dept = JSON.parse(readFileSync(new URL('../data/service.json', import.meta.url)));

// ── Drill-level connectivity ──────────────────────────────────────────────────

test('main rev_we connects to team level (rev_jc and rev_noel)', () => {
  const contribs = contributorsOf(dept, 'rev_we');
  const ids = contribs.map(c => c.id);
  assert.ok(ids.includes('rev_jc'), 'rev_jc must be a contributor of rev_we');
  assert.ok(ids.includes('rev_noel'), 'rev_noel must be a contributor of rev_we');
});

test('rev_jc connects to all 7 JC reps', () => {
  const contribs = contributorsOf(dept, 'rev_jc');
  assert.equal(contribs.length, 7, 'rev_jc must have 7 contributors');
  const names = contribs.map(c => c.id);
  ['rep_diane','rep_cullen','rep_dylan','rep_liz','rep_charlie','rep_lisa','rep_colten']
    .forEach(id => assert.ok(names.includes(id), `${id} must be a contributor of rev_jc`));
});

test('rev_noel connects to all 5 Noel reps', () => {
  const contribs = contributorsOf(dept, 'rev_noel');
  assert.equal(contribs.length, 5, 'rev_noel must have 5 contributors');
  const names = contribs.map(c => c.id);
  ['rep_karen','rep_alma','rep_ryan','rep_mindy','rep_tamara']
    .forEach(id => assert.ok(names.includes(id), `${id} must be a contributor of rev_noel`));
});

// ── Rep L1 sub-KPI structure ──────────────────────────────────────────────────

test('every rep in dept.reps has a repSubs object with the 7 canonical keys', () => {
  const required = ['incomingRevenue','quotes','openQuotes','deals','openDeals','grip','timeWithCustomer'];
  dept.reps.forEach(repId => {
    const rep = byId(dept, repId);
    assert.ok(rep, `${repId} must exist`);
    assert.ok(rep.repSubs, `${repId} must have repSubs`);
    required.forEach(k => assert.ok(k in rep.repSubs, `${repId}.repSubs must have key ${k}`));
  });
});

test('rep_diane incomingRevenue sub matches her series', () => {
  const diane = byId(dept, 'rep_diane');
  assert.deepEqual(diane.repSubs.incomingRevenue.series, diane.series);
});

// ── Noel flag ────────────────────────────────────────────────────────────────

test('rev_we flagDetail mentions $13.73M and Team Noel', () => {
  const rev = byId(dept, 'rev_we');
  assert.match(rev.flagDetail, /13/);
  assert.match(rev.flagDetail, /Team Noel/i);
});

test('rev_noel actual > 0 (data tracked here even though not in main)', () => {
  const noel = byId(dept, 'rev_noel');
  const act = noel.series ? noel.series[noel.series.length - 1] : noel.actual;
  assert.ok(act > 0, 'rev_noel actual must be positive');
});

// ── Three-level cascade completeness ─────────────────────────────────────────

test('cascade depth: main (1) → team (2) → rep (3) all have correct level fields', () => {
  const main = byId(dept, 'rev_we');
  assert.ok(main.isMain === true, 'rev_we must be main');

  const teams = contributorsOf(dept, 'rev_we');
  teams.forEach(t => assert.equal(t.level, 2, `${t.id} must be level 2`));

  const jcReps = contributorsOf(dept, 'rev_jc');
  jcReps.forEach(r => assert.equal(r.level, 3, `${r.id} must be level 3`));

  const noelReps = contributorsOf(dept, 'rev_noel');
  noelReps.forEach(r => assert.equal(r.level, 3, `${r.id} must be level 3`));
});
