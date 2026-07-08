import test from 'node:test'; import assert from 'node:assert';
import { objectives, activitiesFor, functionalLeadFor, objectiveRelations } from '../lib/hoshin.js';

const hoshinFixture = {
  objectives: [
    { id: 'financial-performance', name: 'Financial Performance', priorityTag: '(Priority: Financial Performance)' },
    { id: 'organizational-development', name: 'Organizational Development', priorityTag: '(Priority: Organizational Development)' },
    { id: 'acquisitions', name: 'Acquisitions', priorityTag: '(Priority: Acquisitions)' },
  ],
  departments: {
    operations: {
      block: 'OPERATIONS',
      functionalLead: 'Jim Kozel',
      activities: [
        { hoshinPriority: '57.5% Gross margin', objectiveId: 'financial-performance', objectiveIds: null,
          activityPlan: 'Labor efficiency improved by 9%', target: 't1', supportFunction: 'ODG', lead: 'PM' },
        { hoshinPriority: '57.5% GM/ Org Dev', objectiveId: 'financial-performance',
          objectiveIds: ['financial-performance', 'organizational-development'],
          activityPlan: 'Indirect labor decreased by 15%', target: 't2', supportFunction: 'HR', lead: 'PM' },
      ],
    },
    finance: {
      block: 'FINANCE',
      functionalLead: 'Will Schwartz',
      activities: [],
    },
  },
};

test('objectives returns the objective list', () => {
  const objs = objectives(hoshinFixture);
  assert.equal(objs.length, 3);
  assert.deepEqual(objs.map(o => o.id), ['financial-performance', 'organizational-development', 'acquisitions']);
});

test("activitiesFor returns a department's activities", () => {
  const acts = activitiesFor(hoshinFixture, 'operations');
  assert.equal(acts.length, 2);
  assert.equal(acts[0].activityPlan, 'Labor efficiency improved by 9%');
});

test('activitiesFor returns [] for an unknown dept', () => {
  assert.deepEqual(activitiesFor(hoshinFixture, 'unknown-dept'), []);
});

test('activitiesFor returns [] for a dept with an empty activities array (finance)', () => {
  assert.deepEqual(activitiesFor(hoshinFixture, 'finance'), []);
});

test('functionalLeadFor returns the dept lead', () => {
  assert.equal(functionalLeadFor(hoshinFixture, 'operations'), 'Jim Kozel');
  assert.equal(functionalLeadFor(hoshinFixture, 'finance'), 'Will Schwartz');
});

test('functionalLeadFor returns null for unknown dept', () => {
  assert.equal(functionalLeadFor(hoshinFixture, 'unknown-dept'), null);
});

test('objectiveRelations: financial-performance and organizational-development drive, acquisitions supports — covers every objective exactly once', () => {
  const rels = objectiveRelations(hoshinFixture, 'operations');
  assert.equal(rels.length, 3);
  const byId = Object.fromEntries(rels.map(r => [r.objectiveId, r.relation]));
  assert.equal(byId['financial-performance'], 'drives');
  assert.equal(byId['organizational-development'], 'drives');
  assert.equal(byId['acquisitions'], 'supports');
  // exactly once each — no dupes, none missing
  assert.deepEqual(rels.map(r => r.objectiveId).sort(), hoshinFixture.objectives.map(o => o.id).sort());
});

test('objectiveRelations: dept with zero activities (finance) marks every objective as supports', () => {
  const rels = objectiveRelations(hoshinFixture, 'finance');
  assert.equal(rels.length, 3);
  rels.forEach(r => assert.equal(r.relation, 'supports'));
});

test('objectiveRelations: unknown dept treated as zero activities — all supports', () => {
  const rels = objectiveRelations(hoshinFixture, 'unknown-dept');
  assert.equal(rels.length, 3);
  rels.forEach(r => assert.equal(r.relation, 'supports'));
});

test('objectiveRelations carries the objective name through', () => {
  const rels = objectiveRelations(hoshinFixture, 'operations');
  const fp = rels.find(r => r.objectiveId === 'financial-performance');
  assert.equal(fp.name, 'Financial Performance');
});
