import test from 'node:test'; import assert from 'node:assert';
import { ragStatus } from '../lib/rag.js';
test('higher_better: at/above target = green', () => {
  assert.equal(ragStatus(0.99, 0.985), 'green');
});
test('higher_better: Mexico OTP 0.75 vs 0.985 = red', () => {
  assert.equal(ragStatus(0.75, 0.985), 'red');
});
test('higher_better: amber band', () => {
  assert.equal(ragStatus(0.96, 0.985), 'amber');
});
test('lower_better: IT ticket 200min vs 240 target = green', () => {
  assert.equal(ragStatus(200, 240, 'lower_better'), 'green');
});
test('null actual = nodata', () => {
  assert.equal(ragStatus(null, 0.985), 'nodata');
});
test('NaN target = nodata', () => {
  assert.equal(ragStatus(0.99, NaN), 'nodata');
});
test('target=0 lower_better: 0 incidents = green', () => {
  assert.equal(ragStatus(0, 0, 'lower_better'), 'green');
});
test('target=0 lower_better: 1.2 incidents = red', () => {
  assert.equal(ragStatus(1.2, 0, 'lower_better'), 'red');
});
