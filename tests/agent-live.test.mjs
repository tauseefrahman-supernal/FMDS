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
