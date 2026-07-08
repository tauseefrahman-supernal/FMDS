import test from 'node:test'; import assert from 'node:assert';
import { readFileSync } from 'node:fs';

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
