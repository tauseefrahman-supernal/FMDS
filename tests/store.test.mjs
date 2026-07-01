import test from 'node:test'; import assert from 'node:assert';
import { createStore } from '../lib/store.js';
test('set merges and notifies subscribers', () => {
  const s = createStore({ a: 1 });
  let seen = null; s.subscribe(st => { seen = st; });
  s.set({ b: 2 });
  assert.deepEqual(s.get(), { a: 1, b: 2 });
  assert.deepEqual(seen, { a: 1, b: 2 });
});
test('unsubscribe stops notifications', () => {
  const s = createStore({}); let n = 0;
  const off = s.subscribe(() => n++); s.set({ x: 1 }); off(); s.set({ y: 2 });
  assert.equal(n, 1);
});
