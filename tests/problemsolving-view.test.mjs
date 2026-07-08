import test from 'node:test'; import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { aiDraftCandidatesFromRedKpis } from '../views/problemsolving.js';
import { byDept } from '../lib/eightstep.js';

// views/problemsolving.js's renderProblemSolving(dept, mount) is a DOM-
// mounting + fetch entry point (matches the other views' router-entry
// pattern) — like the rest of this suite (see tests/hoshin-view.test.mjs), we
// don't stand up a real DOM or mock fetch here. Instead we test the exported
// pure helper (aiDraftCandidatesFromRedKpis) directly against the REAL
// data/service.json and data/operations.json + data/kz-records.json fixtures
// — zero hand-typed/invented KPI data, per the app's own zero-invented-data
// rule.

const service    = JSON.parse(readFileSync(new URL('../data/service.json', import.meta.url)));
const operations = JSON.parse(readFileSync(new URL('../data/operations.json', import.meta.url)));
const kzRecords  = JSON.parse(readFileSync(new URL('../data/kz-records.json', import.meta.url)));

test('aiDraftCandidatesFromRedKpis surfaces Service\'s 2 real red sub-KPIs (0 KZ records on file)', () => {
  const opsKz = byDept(kzRecords, 'service'); // confirmed empty — Service has 0 records
  assert.equal(opsKz.length, 0, 'precondition: Service has no KZ records on file');

  const candidates = aiDraftCandidatesFromRedKpis(service, opsKz);
  const ids = candidates.map((c) => c.kpiId).sort();
  assert.deepEqual(ids, ['credits_remakes', 'new_opps_wei'].sort());
  candidates.forEach((c) => assert.equal(c.rag, 'red', `${c.kpiId} must be real RAG-red, not fabricated`));
  // Real KPI names from data/service.json, not invented labels.
  const byId = Object.fromEntries(candidates.map((c) => [c.kpiId, c.kpiName]));
  assert.equal(byId.new_opps_wei, '# WEI New Opps');
  assert.equal(byId.credits_remakes, 'Services Credits & Remakes (cases)');
});

test('aiDraftCandidatesFromRedKpis excludes a red sub-KPI that already has a REAL open KZ (Operations otp_mexico ↔ KZ-346)', () => {
  const opsRecords = byDept(kzRecords, 'operations');
  const kz346 = opsRecords.find((k) => k.kzNumber === 'KZ-346');
  assert.ok(kz346, 'precondition: KZ-346 must exist in data/kz-records.json');
  assert.equal(kz346.linkedKpiId, 'otp_mexico');
  assert.equal(kz346.closed, false);

  const candidates = aiDraftCandidatesFromRedKpis(operations, opsRecords);
  assert.equal(candidates.some((c) => c.kpiId === 'otp_mexico'), false,
    'otp_mexico already has an open KZ (KZ-346) — must not double-surface as a fresh candidate');
});

test('aiDraftCandidatesFromRedKpis re-includes a KPI once its only linked KZ is closed', () => {
  const closedOnly = [{ deptId: 'service', linkedKpiId: 'new_opps_wei', closed: true }];
  const candidates = aiDraftCandidatesFromRedKpis(service, closedOnly);
  assert.equal(candidates.some((c) => c.kpiId === 'new_opps_wei'), true,
    'a CLOSED KZ does not count as "already being worked" — the sub-KPI is still open to draft');
});
