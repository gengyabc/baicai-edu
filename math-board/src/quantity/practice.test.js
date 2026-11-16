import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuantityPractice } from './practice.js';

test('quantity safe basics requires actual successful changes and exact student selection', () => {
  const practice = createQuantityPractice();
  const empty = { objects: [] };
  const first = { objects: [{ id: 'a', x: 40, y: 40 }] };
  const moved = { objects: [{ id: 'a', x: 80, y: 40 }] };
  const pair = { objects: [...moved.objects, { id: 'b', x: 120, y: 40 }] };
  const send = (type, before, after, extra = {}) => practice.observe({ type, before, after, ...extra });
  assert.equal(practice.snapshot().step, 'add');
  send('add', empty, empty);
  assert.equal(practice.snapshot().step, 'add');
  send('add', empty, first);
  assert.equal(practice.snapshot().step, 'move');
  send('move', first, moved, { submitted: false });
  send('move', first, first, { submitted: true });
  assert.equal(practice.snapshot().step, 'move');
  send('move', first, moved, { submitted: true });
  assert.equal(practice.snapshot().step, 'add-second');
  send('add', empty, first);
  assert.equal(practice.snapshot().step, 'add-second', 'an earlier add result cannot be replayed as a new target');
  send('add', moved, pair);
  send('select', null, null, { selection: ['b'] });
  assert.equal(practice.snapshot().step, 'select-one');
  send('select', null, null, { selection: ['a'] });
  send('select', null, null, { selection: ['a', 'other'] });
  assert.equal(practice.snapshot().step, 'select-many');
  send('select', null, null, { selection: ['b', 'a'] });
  send('select', null, null, { selection: ['a'] });
  assert.equal(practice.snapshot().step, 'deselect');
  send('select', null, null, { selection: [] });
  assert.equal(practice.snapshot().step, 'insert');
  send('insert', pair, pair);
  assert.equal(practice.snapshot().step, 'complete');
  assert.equal(practice.snapshot().completed, true);
});

test('restoring quantity goals restores position and targets but never awards a pass', () => {
  const resumed = createQuantityPractice({ index: 1, targets: ['a'] });
  assert.equal(resumed.snapshot().step, 'move');
  assert.deepEqual(resumed.snapshot().targets, ['a']);
  assert.equal(resumed.snapshot().completed, false);
  assert.throws(() => createQuantityPractice({ index: 99, targets: [] }));
  assert.throws(() => createQuantityPractice({ index: 3, targets: [] }));
  assert.throws(() => createQuantityPractice({ index: 3, targets: ['a', 'a'] }));
});

test('insert at any earlier step is only a blocked simulation', () => {
  const practice = createQuantityPractice();
  practice.observe({ type: 'insert' });
  assert.equal(practice.snapshot().step, 'add');
  assert.equal(practice.snapshot().completed, false);
});
