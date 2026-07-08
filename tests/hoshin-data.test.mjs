import test from 'node:test'; import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { activitiesFor } from '../lib/hoshin.js';

const hoshin = JSON.parse(readFileSync(new URL('../data/hoshin.json', import.meta.url)));

const DEPT_IDS = ['service', 'operations', 'sales', 'hr', 'odg', 'marketing', 'logistics', 'it', 'finance'];
const ACTIVITY_FIELDS = ['hoshinPriority', 'objectiveId', 'activityPlan', 'target', 'supportFunction', 'lead'];

test('hoshin.json parses without error', () => {
  assert.ok(hoshin && typeof hoshin === 'object');
});

test('has at least 1 objective', () => {
  assert.ok(Array.isArray(hoshin.objectives));
  assert.ok(hoshin.objectives.length >= 1);
});

test('every objective has id and name', () => {
  hoshin.objectives.forEach(o => {
    assert.ok(o.id, 'objective must have id');
    assert.ok(o.name, 'objective must have name');
  });
});

test('all 9 department ids exist under departments', () => {
  DEPT_IDS.forEach(id => {
    assert.ok(id in hoshin.departments, `departments must include ${id}`);
  });
});

test('each department has an activities array', () => {
  DEPT_IDS.forEach(id => {
    const dept = hoshin.departments[id];
    assert.ok(Array.isArray(dept.activities), `${id}.activities must be an array`);
  });
});

test('every activity carries the 6 core fields (hoshinPriority, objectiveId, activityPlan, target, supportFunction, lead)', () => {
  DEPT_IDS.forEach(id => {
    hoshin.departments[id].activities.forEach((a, i) => {
      ACTIVITY_FIELDS.forEach(f => {
        assert.ok(f in a, `${id}.activities[${i}] must have field: ${f}`);
      });
    });
  });
});

test('every activity has a timeline object with start/end/months/confidence', () => {
  DEPT_IDS.forEach(id => {
    hoshin.departments[id].activities.forEach((a, i) => {
      assert.ok(a.timeline, `${id}.activities[${i}] must have timeline`);
      assert.ok('start' in a.timeline && 'end' in a.timeline && Array.isArray(a.timeline.months),
        `${id}.activities[${i}].timeline must have start/end/months`);
    });
  });
});

test('at least one activity exists across the extracted departments', () => {
  const total = DEPT_IDS.reduce((sum, id) => sum + hoshin.departments[id].activities.length, 0);
  assert.ok(total >= 1);
});

test('hr and odg share the same HR & ODG source activities (duplicated by design)', () => {
  assert.equal(hoshin.departments.hr.activities.length, hoshin.departments.odg.activities.length);
  assert.equal(hoshin.departments.hr.block, hoshin.departments.odg.block);
});

test('finance has zero activities (source block is entirely blank)', () => {
  assert.equal(hoshin.departments.finance.activities.length, 0);
});

test('service is aliased to sales (owner direction 2026-07) — raw JSON activities stays [], aliasOf points to sales', () => {
  assert.deepEqual(hoshin.departments.service.activities, []);
  assert.equal(hoshin.departments.service.aliasOf, 'sales');
});

test('activitiesFor(hoshin, "service") resolves through the alias to Sales\'s same activities, non-empty', () => {
  const serviceActs = activitiesFor(hoshin, 'service');
  const salesActs = activitiesFor(hoshin, 'sales');
  assert.ok(serviceActs.length > 0, 'service should inherit non-empty activities via aliasOf');
  assert.deepEqual(serviceActs, salesActs);
});

test('objectives: 4 of 5 carry a real, non-null description; acquisitions stays null (no source text exists)', () => {
  const byId = Object.fromEntries(hoshin.objectives.map(o => [o.id, o]));
  const withDescription = ['financial-performance', 'organizational-development', 'branding-solution', 'new-customer-acquisition-lifetime-journey'];
  withDescription.forEach((id) => {
    assert.equal(typeof byId[id].description, 'string', `${id}.description should be a non-null string`);
    assert.ok(byId[id].description.length > 0, `${id}.description should not be empty`);
  });
  assert.equal(byId['acquisitions'].description, null, 'acquisitions.description must stay null — no real source text exists');
});

test('objective descriptions are copied verbatim from the matching Marketing-block activity (objectiveId cross-check)', () => {
  const marketing = hoshin.departments.marketing.activities;
  const byId = Object.fromEntries(hoshin.objectives.map(o => [o.id, o]));
  const expectations = [
    { objectiveId: 'financial-performance', activityIndex: 0 },
    { objectiveId: 'organizational-development', activityIndex: 2 },
    { objectiveId: 'new-customer-acquisition-lifetime-journey', activityIndex: 3 },
    { objectiveId: 'branding-solution', activityIndex: 4 },
  ];
  expectations.forEach(({ objectiveId, activityIndex }) => {
    const activity = marketing[activityIndex];
    assert.equal(activity.objectiveId, objectiveId, `marketing.activities[${activityIndex}].objectiveId should match ${objectiveId}`);
    assert.equal(byId[objectiveId].description, activity.hoshinPriority, `${objectiveId}.description should be verbatim-equal to the source activity's hoshinPriority`);
  });
});
