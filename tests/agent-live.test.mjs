import test from 'node:test'; import assert from 'node:assert';
import { liveReply } from '../lib/agent.js';

// ─── No ctx.dept → falls back to bakedReply (existing drawer behavior) ────────

test('liveReply with no ctx.dept falls back to bakedReply (Mexico/OTP story preserved)', async () => {
  const reply = await liveReply('operations', 'explain-red', {});
  assert.match(reply, /Mexico/);
  assert.match(reply, /0\.863/);
  assert.match(reply, /0\.985/);
});

// ─── ctx.dept present → context-grounded, live-figure reply ──────────────────

const fixtureDept = {
  id: 'testdept', name: 'Test Dept', lead: 'Lead Person',
  kpis: [
    { id: 'kpi_a', name: 'Metric A', level: 1, isMain: true, parentId: null,
      actual: 100, target: 90, unit: 'count', direction: 'higher_better' },
    { id: 'kpi_b', name: 'Metric B (Red Widget)', level: 1, isMain: true, parentId: null,
      actual: 10, target: 50, unit: 'count', direction: 'higher_better' },
    { id: 'kpi_c', name: 'Metric C', level: 1, isMain: true, parentId: null,
      actual: 92, target: 95, unit: 'count', direction: 'higher_better' },
  ],
};

test('liveReply with ctx.dept + a generic question grounds the reply in the LIVE red KPI (not the static corpus)', async () => {
  const reply = await liveReply(fixtureDept.id, 'ask', { dept: fixtureDept, question: 'what is red?' });
  // Proves grounding: mentions the fixture's actual red KPI name and owner —
  // this KPI/department does not exist in the bakedReply corpus at all.
  assert.match(reply, /Metric B \(Red Widget\)/);
  assert.match(reply, /Lead Person/);
  assert.match(reply, /\b10\b/);
  assert.match(reply, /\b50\b/);
});

test('liveReply with ctx.dept + a question naming a specific KPI explains that KPI', async () => {
  const reply = await liveReply(fixtureDept.id, 'ask', { dept: fixtureDept, question: 'why is Metric A doing?' });
  assert.match(reply, /Metric A/);
  assert.match(reply, /Lead Person/);
});

test('liveReply with ctx.dept and no reds gives a clean-board answer', async () => {
  const cleanDept = {
    id: 'cleandept', name: 'Clean Dept', lead: 'Someone',
    kpis: [
      { id: 'k1', name: 'K One', level: 1, isMain: true, parentId: null,
        actual: 100, target: 90, unit: 'count', direction: 'higher_better' },
    ],
  };
  const reply = await liveReply(cleanDept.id, 'ask', { dept: cleanDept, question: 'any reds?' });
  assert.match(reply, /no red/i);
  assert.match(reply, /Clean Dept/);
});

test('liveReply prefers the more specific sub-KPI match over a shorter parent-KPI match (regression: queue-card-seeded question)', async () => {
  // The main KPI's own display name ("OTP (On-Time %)") is textually LONGER
  // than the sub-KPI's ("OTP — Mexico"), but "OTP — Mexico" is the more
  // specific (longer matched token) hit in the question — it must win, not
  // fall back to the shorter "OTP" acronym match on the parent.
  const opsFixture = {
    id: 'operations', name: 'Operations', lead: 'Jim Kozel',
    kpis: [
      { id: 'otp', name: 'OTP (On-Time %)', level: 1, isMain: true, parentId: null,
        actual: 0.863, target: 0.985, unit: 'ratio', direction: 'higher_better' },
      { id: 'otp_mexico', name: 'OTP — Mexico', level: 2, isMain: false, parentId: 'otp',
        actual: 0.75, target: 0.985, unit: 'ratio', direction: 'higher_better', who: 'M. Franco',
        flag: 'RED — primary drag on WE OTP.' },
    ],
  };
  const reply = await liveReply('operations', 'ask', { dept: opsFixture, question: 'Why is OTP — Mexico red?' });
  assert.match(reply, /OTP — Mexico is currently red/);
  assert.match(reply, /M\. Franco/);
});

test('liveReply "why is OTP red?" against the real Operations shape surfaces the Mexico story', async () => {
  // Mirrors data/operations.json's shape closely enough to prove the browser
  // path ("why is OTP red?") resolves to the rich story via composeMarkNote's
  // story-text grounding + the dept redStory corpus (matched by headline KPI).
  const opsFixture = {
    id: 'operations', name: 'Operations', lead: 'Jim Kozel',
    kpis: [
      { id: 'otp', name: 'OTP (On-Time %)', level: 1, isMain: true, parentId: null,
        actual: 0.863, target: 0.985, unit: 'ratio', direction: 'higher_better',
        story: { text: 'WE OTP appears red primarily because Mexico is dragging the main.' } },
    ],
  };
  const reply = await liveReply('operations', 'ask', { dept: opsFixture, question: 'why is OTP red?' });
  assert.match(reply, /Mexico/);
  assert.match(reply, /Jim Kozel/);
});

// ─── Important 1: headline story only when a CURRENT red is the headline KPI ──

test('liveReply "what is red?" does NOT glue on the headline story when the headline KPI is green', async () => {
  // Mirrors the real operations.json risk: OTP (headline) can be GREEN while a
  // non-headline KPI (PPLH — Mexico) is RED. The reds summary must list the red
  // but must NOT append the static OTP redStory (that would be hardcoded, not grounded).
  const opsFixture = {
    id: 'operations', name: 'Operations', lead: 'Jim Kozel',
    kpis: [
      { id: 'otp', name: 'OTP (On-Time %)', level: 1, isMain: true, parentId: null,
        actual: 0.99, target: 0.985, unit: 'ratio', direction: 'higher_better' }, // GREEN
      { id: 'pplh_mexico', name: 'PPLH — Mexico', level: 2, isMain: false, parentId: 'pplh',
        actual: 56.23, target: 67.3, unit: 'pcs_per_labor_hour', direction: 'higher_better', who: 'M. Franco' }, // RED
    ],
  };
  const reply = await liveReply('operations', 'ask', { dept: opsFixture, question: 'what is red?' });
  assert.match(reply, /PPLH — Mexico/, 'lists the actual red');
  // The OTP redStory corpus mentions the Galls color program + $40K short-code —
  // none of that should appear, since OTP is green here.
  assert.ok(!/Galls color program/.test(reply), 'must not glue on the headline OTP story when OTP is green');
  assert.ok(!/\$40K short-code/.test(reply), 'must not glue on the headline OTP story when OTP is green');
});

test('liveReply "what is red?" DOES glue on the headline story when the headline KPI is itself red', async () => {
  const opsFixture = {
    id: 'operations', name: 'Operations', lead: 'Jim Kozel',
    kpis: [
      { id: 'otp', name: 'OTP (On-Time %)', level: 1, isMain: true, parentId: null,
        actual: 0.863, target: 0.985, unit: 'ratio', direction: 'higher_better' }, // RED (headline)
    ],
  };
  const reply = await liveReply('operations', 'ask', { dept: opsFixture, question: 'what is red?' });
  assert.match(reply, /OTP/);
  assert.match(reply, /Galls color program/, 'headline story appended because the headline KPI is red');
});

// ─── Important 2: the live trail (reasons/comments/kzRecords) is surfaced ─────

test('liveReply surfaces a floor reason from ctx.reasons for the mentioned KPI', async () => {
  const dept = {
    id: 'service', name: 'Service', lead: 'JC',
    kpis: [
      { id: 'rev_jc', name: 'Revenue Team JC', level: 1, isMain: true, parentId: null,
        actual: 100, target: 200, unit: '$', direction: 'higher_better' }, // RED
    ],
  };
  const reasons = [
    { id: 'r1', deptId: 'service', kpiId: 'rev_jc', entityId: 'rep_diane', author: 'Diane',
      text: 'HubSpot dialer outage 9-11 AM cut quote volume Mon-Tue.', status: 'red',
      ts: '2026-07-06T10:00:00.000Z' },
  ];
  const reply = await liveReply('service', 'ask', { dept, question: 'why is Revenue Team JC red?', reasons });
  assert.match(reply, /Latest floor note \(Diane\)/);
  assert.match(reply, /HubSpot dialer outage/);
});

test('liveReply surfaces an open 8-step from ctx.kzRecords linked to the mentioned KPI', async () => {
  const dept = {
    id: 'operations', name: 'Operations', lead: 'Jim Kozel',
    kpis: [
      { id: 'otp_mexico', name: 'OTP — Mexico', level: 2, isMain: false, parentId: 'otp',
        actual: 0.75, target: 0.985, unit: 'ratio', direction: 'higher_better', who: 'M. Franco' }, // RED
    ],
  };
  const kzRecords = [
    { kzNumber: 'KZ-346', deptId: 'operations', title: 'Galls color short-code', who: 'Jim Kozel',
      _kpiId: 'otp_mexico', steps: { 1: true, 2: true, 3: true, 4: false, 5: false, 6: false, 7: false, 8: false },
      active: true, closed: false },
  ];
  const reply = await liveReply('operations', 'ask', { dept, question: 'why is OTP — Mexico red?', kzRecords });
  assert.match(reply, /Open 8-step: KZ-346 \(3\/8 steps\)/);
});

test('liveReply omits the trail gracefully when no reasons/comments/kz are supplied', async () => {
  const dept = {
    id: 'operations', name: 'Operations', lead: 'Jim Kozel',
    kpis: [
      { id: 'otp_mexico', name: 'OTP — Mexico', level: 2, isMain: false, parentId: 'otp',
        actual: 0.75, target: 0.985, unit: 'ratio', direction: 'higher_better', who: 'M. Franco' },
    ],
  };
  const reply = await liveReply('operations', 'ask', { dept, question: 'why is OTP — Mexico red?' });
  assert.ok(!/Latest floor note/.test(reply));
  assert.ok(!/Open 8-step/.test(reply));
  assert.match(reply, /OTP — Mexico is currently red/);
});
