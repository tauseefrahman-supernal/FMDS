import test from 'node:test'; import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { byId, mains, contributorsOf } from '../lib/registry.js';

const dept = JSON.parse(readFileSync(new URL('../data/operations.json', import.meta.url)));

// ── Gross Margin main ────────────────────────────────────────────────────────

test('operations.json parses without error', () => {
  assert.ok(dept && dept.kpis && Array.isArray(dept.kpis));
});

test('gross_margin is a main KPI with 4 gm_* contributors', () => {
  const gm = byId(dept, 'gross_margin');
  assert.ok(gm, 'gross_margin must exist');
  assert.equal(gm.isMain, true);
  assert.equal(gm.parentId, null);
  assert.deepEqual(gm.contributors.slice().sort(), ['gm_canada', 'gm_houston', 'gm_mexico', 'gm_norcross']);
});

test('gross_margin is a formula/weighted roll-up, not Mechanism-B/independent', () => {
  const gm = byId(dept, 'gross_margin');
  assert.equal(gm.rollupMethod, 'weighted');
  assert.notEqual(gm.rollupMethod, 'independent');
});

test('gross_margin surfaces via lib/registry mains()', () => {
  const ids = mains(dept).map((k) => k.id);
  assert.ok(ids.includes('gross_margin'), 'mains(dept) must include gross_margin');
});

test('gross_margin resolves all 4 contributor subs via contributorsOf', () => {
  const subs = contributorsOf(dept, 'gross_margin');
  assert.equal(subs.length, 4);
});

// ── Location subs: target/actual/drivers present ────────────────────────────

const LOCATIONS = ['gm_mexico', 'gm_houston', 'gm_norcross', 'gm_canada'];

for (const id of LOCATIONS) {
  test(`${id} has target, actual, and a $ drivers breakdown`, () => {
    const sub = byId(dept, id);
    assert.ok(sub, `${id} must exist`);
    assert.equal(sub.parentId, 'gross_margin');
    assert.equal(typeof sub.target, 'number');
    assert.equal(typeof sub.actual, 'number');
    assert.ok(sub.drivers, `${id} must carry a drivers object`);
    for (const key of ['revenue', 'labor', 'materials', 'freight', 'grossProfit']) {
      assert.equal(typeof sub.drivers[key], 'number', `${id}.drivers.${key} must be a number`);
    }
  });

  test(`${id}: grossProfit === revenue - labor - materials - freight`, () => {
    const { revenue, labor, materials, freight, grossProfit } = byId(dept, id).drivers;
    const computed = revenue - labor - materials - freight;
    assert.ok(Math.abs(computed - grossProfit) < 1, `${id}: expected grossProfit ≈ ${computed}, got ${grossProfit}`);
  });
}

test('WE main weeklyActuals carries all 4 locations + we, 13 weeks each', () => {
  const gm = byId(dept, 'gross_margin');
  assert.ok(gm.weeklyActuals && Array.isArray(gm.weeklyActuals.weeks));
  assert.equal(gm.weeklyActuals.weeks.length, 13);
  for (const key of ['we', 'mexico', 'houston', 'norcross', 'canada']) {
    assert.equal(gm.weeklyActuals[key].length, 13, `weeklyActuals.${key} must have 13 points`);
  }
});
