import test from 'node:test'; import assert from 'node:assert';
import { progress, isClosed, byDept, newKZ } from '../lib/eightstep.js';
const kz = { kzNumber:'KZ-339', deptId:'sales', steps:{1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true}, closed:true };
test('progress counts completed steps', () => {
  assert.deepEqual(progress(kz), { done:8, total:8, pct:100 });
});
test('isClosed reflects 8/8', () => { assert.equal(isClosed(kz), true); });
test('byDept filters records', () => {
  assert.equal(byDept([kz,{deptId:'ops'}], 'sales').length, 1);
});
test('newKZ starts at step 0, active', () => {
  const k = newKZ({ item:'Mexico OTP', who:'Jim', deptId:'operations' });
  assert.equal(progress(k).done, 0); assert.equal(k.active, true);
});
test('newKZ no longer fabricates a placeholder kzNumber — real number is unallocated (null)', () => {
  const k = newKZ({ item:'# WEI New Opps', who:'JC', deptId:'service' });
  assert.equal(k.kzNumber, null);
  assert.notEqual(k.kzNumber, 'KZ-NEW');
});
test('newKZ defaults title to item so the wizard header has a grounded, non-placeholder title', () => {
  const k = newKZ({ item:'# WEI New Opps', who:'JC', deptId:'service' });
  assert.equal(k.title, '# WEI New Opps');
});
test('newKZ honors an explicit title distinct from item', () => {
  const k = newKZ({ item:'new_opps_wei', title:'# WEI New Opps', who:'JC', deptId:'service' });
  assert.equal(k.title, '# WEI New Opps');
});
