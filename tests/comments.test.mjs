import test from 'node:test'; import assert from 'node:assert';

// Minimal localStorage shim for Node (comments.js reads/writes localStorage)
const _store = {};
globalThis.localStorage = {
  getItem: (k) => _store[k] ?? null,
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
};

const { addComment, getComments, commentCount, composeMarkNote, seedDemoComments, renderCommentList }
  = await import('../lib/comments.js');

test('addComment returns entry with id, ts, defaults', () => {
  const c = addComment({ deptId: 'sales', kpiId: 'rev', text: 'Looking into it', status: 'red' });
  assert.ok(c.id, 'has id');
  assert.ok(c.ts, 'has ts');
  assert.equal(c.deptId, 'sales');
  assert.equal(c.role, 'human', 'defaults role to human');
  assert.equal(c.author, 'You', 'defaults human author to You');
});

test('addComment attributes Mark for role ai', () => {
  const c = addComment({ deptId: 'sales', kpiId: 'rev', role: 'ai', kind: 'driving', text: 'driver', status: 'red' });
  assert.equal(c.author, 'Mark');
  assert.equal(c.role, 'ai');
});

test('getComments returns oldest → newest for a KPI', () => {
  const cs = getComments({ deptId: 'sales', kpiId: 'rev' });
  assert.ok(cs.length >= 2);
  assert.ok(cs[0].ts <= cs[1].ts, 'oldest first');
  assert.ok(cs.every(c => c.deptId === 'sales' && c.kpiId === 'rev'));
});

test('commentCount matches getComments length', () => {
  const n = commentCount({ deptId: 'sales', kpiId: 'rev' });
  assert.equal(n, getComments({ deptId: 'sales', kpiId: 'rev' }).length);
});

test('composeMarkNote(green) frames what is going right', () => {
  const note = composeMarkNote({ name: 'CSAT' }, 'green');
  assert.match(note, /driving this green/i);
});

test('composeMarkNote prefers KPI story text', () => {
  const note = composeMarkNote({ name: 'OTP', story: { text: 'Mexico dragged the main.' } }, 'red');
  assert.match(note, /Mexico dragged the main/);
});

test('composeMarkNote(red) with no data recommends an 8-step', () => {
  const note = composeMarkNote({ name: 'X' }, 'red');
  assert.match(note, /8-step/i);
});

test('renderCommentList shows empty state when no comments', () => {
  const html = renderCommentList('nowhere', 'nokpi');
  assert.match(html, /No notes yet/i);
});

test('renderCommentList escapes HTML in comment text', () => {
  addComment({ deptId: 'xss', kpiId: 'k', text: '<script>alert(1)</script>', status: 'red' });
  const html = renderCommentList('xss', 'k');
  assert.ok(!html.includes('<script>'), 'raw script tag must not appear');
  assert.match(html, /&lt;script&gt;/);
});

test('seedDemoComments seeds once and is idempotent', () => {
  localStorage.removeItem('fmds_comments_seeded');
  const before = getComments({ deptId: 'operations', kpiId: 'otp' }).length;
  seedDemoComments();
  const after = getComments({ deptId: 'operations', kpiId: 'otp' }).length;
  assert.ok(after > before, 'seed added Operations OTP comments');
  seedDemoComments();
  assert.equal(getComments({ deptId: 'operations', kpiId: 'otp' }).length, after, 'idempotent');
});

test('seeded OTP thread has both AI and human voices', () => {
  const cs = getComments({ deptId: 'operations', kpiId: 'otp' });
  assert.ok(cs.some(c => c.role === 'ai'), 'has a Mark comment');
  assert.ok(cs.some(c => c.role === 'human'), 'has a human comment');
});
