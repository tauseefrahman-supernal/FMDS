import test from 'node:test'; import assert from 'node:assert';
import { byId, mains, contributorsOf, flagged } from '../lib/registry.js';
const dept = { id:'service', kpis:[
  { id:'rev_we', name:'Incoming Rev WE', isMain:true, target:252661, actual:240000, contributors:['calls','deals'] },
  { id:'calls', name:'# Calls', isMain:false, target:25, actual:22 },
  { id:'deals', name:'# Deals', isMain:false, target:10, actual:6, flag:'time-with-customer inflated' },
]};
test('byId finds a kpi', () => { assert.equal(byId(dept,'calls').name, '# Calls'); });
test('mains returns only mains', () => { assert.equal(mains(dept).length, 1); });
test('contributorsOf resolves ids to kpis', () => {
  assert.deepEqual(contributorsOf(dept,'rev_we').map(k=>k.id), ['calls','deals']);
});
test('flagged returns kpis with a data flag', () => {
  assert.deepEqual(flagged(dept).map(k=>k.id), ['deals']);
});
