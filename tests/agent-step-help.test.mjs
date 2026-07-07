import test from 'node:test'; import assert from 'node:assert';
import { bakedReply, liveReply } from '../lib/agent.js';

test('step-help step 4 returns a candidate 5-Whys chain + alternative branches', () => {
  const kpi = { name: 'OTP', actual: 0.863, target: 0.985, unit: 'ratio' };
  const help = bakedReply('operations', 'step-help', { step: 4, kpi, kpiActual: kpi.actual, kpiTarget: kpi.target });
  assert.equal(help.step, 4);
  assert.match(help.headline, /OTP/);
  const chain = help.items.find(i => i.type === 'chain');
  assert.ok(chain, 'expected a chain item');
  assert.equal(chain.whys.length, 5);
  assert.ok(chain.rootCause && chain.rootCause.length > 0);
  const alts = help.items.filter(i => i.type === 'altbranch');
  assert.ok(alts.length >= 1 && alts.length <= 2);
  alts.forEach(a => assert.match(a.category, /^(Man|Method|Measurement)$/));
});

test('step-help step 5 returns 2-3 pre-scored countermeasure ideas', () => {
  const help = bakedReply('sales', 'step-help', { step: 5, kpi: { name: 'Incoming Rev WE Outside' } });
  assert.equal(help.step, 5);
  const cms = help.items.filter(i => i.type === 'countermeasure');
  assert.ok(cms.length >= 2 && cms.length <= 3);
  cms.forEach(c => {
    assert.equal(typeof c.text, 'string');
    ['S', 'Q', 'C', 'T', 'Cu', 'Ef', 'OA'].forEach(k => assert.equal(typeof c[k], 'number'));
  });
});

test('step-help step 7 frames recovery status against target', () => {
  const kpi = { name: 'TRIR', actual: 30.80, target: 0 };
  const help = bakedReply('hr', 'step-help', { step: 7, kpi, kpiActual: kpi.actual, kpiTarget: kpi.target });
  assert.equal(help.step, 7);
  const rec = help.items.find(i => i.type === 'recovery');
  assert.ok(rec);
  assert.match(rec.text, /watch/i);
  assert.match(rec.text, /stable/i);
});

test('step-help other steps returns a brief grounded nudge', () => {
  const help = bakedReply('finance', 'step-help', { step: 1, kpi: { name: 'Cash Conversion' } });
  assert.equal(help.step, 1);
  assert.equal(help.items.length, 1);
  assert.equal(help.items[0].type, 'nudge');
  assert.match(help.items[0].text, /Cash Conversion/);
});

test('step-help composer question returns a scripted note grounded in dept context', async () => {
  const help = await liveReply('operations', 'step-help', { step: 4, kpi: { name: 'OTP' }, question: 'why Mexico?' });
  assert.equal(help.items[0].type, 'note');
  assert.match(help.items[0].text, /OTP/);
});

test('step-help rejects an out-of-range step', () => {
  const help = bakedReply('operations', 'step-help', { step: 99 });
  assert.equal(help.items[0].type, 'note');
  assert.match(help.items[0].text, /1–8/);
});

test('liveReply delegates step-help to bakedReply (no network)', async () => {
  const kpi = { name: 'OTP', actual: 0.863, target: 0.985 };
  const help = await liveReply('operations', 'step-help', { step: 5, kpi });
  assert.equal(help.step, 5);
  assert.ok(help.items.every(i => i.type === 'countermeasure'));
});
