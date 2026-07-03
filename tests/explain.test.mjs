import test from 'node:test'; import assert from 'node:assert';
import { explainKpi } from '../lib/explain.js';

test('grounds definition in cascade level + direction', () => {
  const kpi = { name: 'OTP', level: 1, isMain: true, direction: 'higher_better', target: 0.985, actual: 0.99, targetSource: 'WPS' };
  const e = explainKpi(kpi, {});
  assert.match(e.definition, /main-level/);
  assert.match(e.definition, /higher is better/);
});

test('source prefers targetSource', () => {
  const kpi = { name: 'OTP', target: 0.985, actual: 0.99, targetSource: 'WPS', source: 'COO Board / hand-keyed' };
  const e = explainKpi(kpi, {});
  assert.match(e.source, /WPS/);
});

test('manualOnly source note', () => {
  const kpi = { name: 'TRIR', target: 0, actual: 0, direction: 'lower_better', manualOnly: true };
  const e = explainKpi(kpi, {});
  assert.match(e.source, /Manually entered/);
});

test('red why cites actual below target', () => {
  const kpi = { name: 'OTP', target: 0.985, actual: 0.75, unit: 'ratio', direction: 'higher_better' };
  const e = explainKpi(kpi, {});
  assert.equal(e.why.startsWith('Off track'), true);
  assert.match(e.why, /75\.0%/);
});

test('green why for on-target', () => {
  const kpi = { name: 'X', target: 100, actual: 105, unit: 'count', direction: 'higher_better' };
  const e = explainKpi(kpi, {});
  assert.match(e.why, /On track/);
});

test('nodata why when no actual', () => {
  const kpi = { name: 'X', target: 100, actual: null };
  const e = explainKpi(kpi, {});
  assert.match(e.why, /can't be computed/);
});

test('prefers story.text over templated why', () => {
  const kpi = { name: 'OTP', target: 0.985, actual: 0.75, story: { text: 'WE OTP appears red due to a Galls sample surge.' } };
  const e = explainKpi(kpi, {});
  assert.match(e.why, /Galls sample surge/);
});

test('prefers flagDetail when no story', () => {
  const kpi = { name: 'OTP', target: 0.985, actual: 0.75, flagDetail: 'April OTP = 78.9% vs 98.5% — confirm context.' };
  const e = explainKpi(kpi, {});
  assert.match(e.why, /April OTP/);
});

test('actualOverride drives RAG (Mechanism-B location sub)', () => {
  const kpi = { name: 'OTP', target: 0.985, actual: 0.99, direction: 'higher_better' };
  const e = explainKpi(kpi, {}, { actualOverride: 0.5 });
  assert.equal(e.why.startsWith('Off track'), true);
});

test('text joins definition + source + why', () => {
  const kpi = { name: 'X', target: 100, actual: 105, unit: 'count', targetSource: 'WPS' };
  const e = explainKpi(kpi, {});
  assert.equal(e.text, `${e.definition} ${e.source} ${e.why}`);
});
