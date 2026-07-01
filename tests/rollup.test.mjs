import test from 'node:test'; import assert from 'node:assert';
import { rollup } from '../lib/rollup.js';
test('sum adds numeric children, ignores null/NaN', () => {
  assert.equal(rollup('sum', [1, 2, null, 3]), 6);
});
test('avg averages numeric children', () => {
  assert.equal(rollup('avg', [0.9, 1.0, 0.8]), 0.9);
});
test('independent (Mechanism B) never computes from children', () => {
  assert.equal(rollup('independent', [0.75, 0.95]), null);
});
test('manual returns null (entered, not derived)', () => {
  assert.equal(rollup('manual', [1, 2]), null);
});
