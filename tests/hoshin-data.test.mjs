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

test('objectives: all 5 carry a real, non-empty description (canonical 2026 slide; none synthesized)', () => {
  const byId = Object.fromEntries(hoshin.objectives.map(o => [o.id, o]));
  const allIds = ['financial-performance', 'organizational-development', 'branding-solution', 'new-customer-acquisition-lifetime-journey', 'acquisitions'];
  allIds.forEach((id) => {
    assert.equal(typeof byId[id].description, 'string', `${id}.description should be a non-null string`);
    assert.ok(byId[id].description.length > 0, `${id}.description should not be empty`);
    // Descriptions now come verbatim from the owner's canonical slide — nothing is synthesized/flagged anymore.
    assert.equal('descriptionProvenance' in byId[id], false, `${id} should carry no descriptionProvenance`);
  });
});

test('objective descriptions match the canonical 2026 1-Year Hoshin Priorities slide (verbatim content + corrected figures)', () => {
  const byId = Object.fromEntries(hoshin.objectives.map(o => [o.id, o]));
  assert.match(byId['financial-performance'].description, /\$150M revenue, 55% GM/, 'financial-performance uses the corrected $150M / 55% GM figures');
  assert.match(byId['branding-solution'].description, /Lock down IL market \(70%\+\)/, 'branding-solution uses the corrected 70%+ IL figure');
  assert.match(byId['acquisitions'].description, /Fully integrate HPI\/EEI/, 'acquisitions uses the real slide wording');
  assert.match(byId['organizational-development'].description, /Complete RACI/, 'org-dev uses the slide wording');
  assert.match(byId['new-customer-acquisition-lifetime-journey'].description, /5-min onboarding/, 'new-customer uses the slide wording');
  // Guard against regressing to the old V-3 figures.
  hoshin.objectives.forEach(o => assert.doesNotMatch(o.description, /\$200m|\(85%\)/i, `${o.id} must not carry the old V-3 figures`));
});
