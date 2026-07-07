import test from 'node:test'; import assert from 'node:assert';
import { buildDeptContext, ownerFor } from '../lib/context.js';

const operationsFixture = {
  id: 'operations', name: 'Operations', lead: 'Jim Kozel',
  kpis: [
    { id: 'otp', name: 'OTP (On-Time %)', level: 1, isMain: true, parentId: null,
      actual: 0.863, target: 0.985, unit: 'ratio', direction: 'higher_better' },
    { id: 'otp_mexico', name: 'OTP — Mexico', level: 2, isMain: false, parentId: 'otp',
      actual: 0.75, target: 0.985, unit: 'ratio', direction: 'higher_better', who: 'M. Franco' },
    { id: 'otp_houston', name: 'OTP — Houston', level: 2, isMain: false, parentId: 'otp',
      actual: 0.996, target: 0.985, unit: 'ratio', direction: 'higher_better' },
  ],
};

test('buildDeptContext computes rag per KPI — OTP is red', () => {
  const ctx = buildDeptContext(operationsFixture);
  const otp = ctx.kpis.find(k => k.id === 'otp');
  assert.equal(otp.rag, 'red');
});

test('buildDeptContext.reds includes the red OTP kpi id', () => {
  const ctx = buildDeptContext(operationsFixture);
  assert.ok(ctx.reds.includes('otp'));
});

test('ownerOf("otp") is non-empty (L2 lead owns the main KPI)', () => {
  const ctx = buildDeptContext(operationsFixture);
  assert.equal(ctx.ownerOf('otp'), 'Jim Kozel');
  assert.ok(ctx.ownerOf('otp').length > 0);
});

test('sub-KPI owner uses kpi.who when present; falls back to dept.lead otherwise', () => {
  const ctx = buildDeptContext(operationsFixture);
  assert.equal(ctx.ownerOf('otp_mexico'), 'M. Franco');
  assert.equal(ctx.ownerOf('otp_houston'), 'Jim Kozel');
});

test('ownerFor: main/board KPI (isMain) owned by dept.lead', () => {
  assert.equal(ownerFor(operationsFixture, operationsFixture.kpis[0]), 'Jim Kozel');
});

test('ownerFor: level<=1 counts as board KPI even without isMain flag', () => {
  const kpi = { id: 'x', level: 1 };
  assert.equal(ownerFor(operationsFixture, kpi), 'Jim Kozel');
});

test('ownerFor: sub with kpi.who wins over dept.lead', () => {
  const kpi = { id: 'sub', level: 2, who: 'Rep Name' };
  assert.equal(ownerFor(operationsFixture, kpi), 'Rep Name');
});

test('reasons/comments/kzRecords default to [] when not passed via opts', () => {
  const ctx = buildDeptContext(operationsFixture);
  assert.deepEqual(ctx.reasons, []);
  assert.deepEqual(ctx.comments, []);
  assert.deepEqual(ctx.kzRecords, []);
});

test('reasons/comments pass through from opts untouched', () => {
  const reasons = [{ id: 'r1', deptId: 'operations', kpiId: 'otp' }];
  const comments = [{ id: 'c1', deptId: 'operations', kpiId: 'otp' }];
  const ctx = buildDeptContext(operationsFixture, { reasons, comments });
  assert.deepEqual(ctx.reasons, reasons);
  assert.deepEqual(ctx.comments, comments);
});

test('kzRecords maps to {kzNumber,item,who,linkedKpiId,done,closed}, filtered to this dept', () => {
  const kzRecords = [
    { kzNumber: 'KZ-346', deptId: 'operations', title: 'Galls color short-code', who: 'Jim Kozel',
      _kpiId: 'otp_mexico', steps: {1:true,2:true,3:true,4:false,5:false,6:false,7:false,8:false}, active: true, closed: false },
    { kzNumber: 'KZ-999', deptId: 'sales', title: 'Not this dept', who: 'Someone',
      steps: {}, active: true, closed: false },
  ];
  const ctx = buildDeptContext(operationsFixture, { kzRecords });
  assert.equal(ctx.kzRecords.length, 1);
  const kz = ctx.kzRecords[0];
  assert.equal(kz.kzNumber, 'KZ-346');
  assert.equal(kz.item, 'Galls color short-code');
  assert.equal(kz.who, 'Jim Kozel');
  assert.equal(kz.linkedKpiId, 'otp_mexico');
  assert.equal(kz.done, 3);
  assert.equal(kz.closed, false);
});

test('kzRecords: linkedKpiId falls back to null when no kz.linkedKpiId/_kpiId present', () => {
  const kzRecords = [
    { kzNumber: 'KZ-1', deptId: 'operations', item: 'Untracked item', who: 'Someone',
      steps: {}, active: true, closed: false },
  ];
  const ctx = buildDeptContext(operationsFixture, { kzRecords });
  assert.equal(ctx.kzRecords[0].linkedKpiId, null);
  assert.equal(ctx.kzRecords[0].item, 'Untracked item');
});

test('each kpi carries an explanation object from explainKpi', () => {
  const ctx = buildDeptContext(operationsFixture);
  const otp = ctx.kpis.find(k => k.id === 'otp');
  assert.ok(otp.explanation);
  assert.equal(typeof otp.explanation.text, 'string');
  assert.ok(otp.explanation.text.length > 0);
});

test('deptId/deptName carried through', () => {
  const ctx = buildDeptContext(operationsFixture);
  assert.equal(ctx.deptId, 'operations');
  assert.equal(ctx.deptName, 'Operations');
});
