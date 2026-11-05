import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoardModel } from './model.js';
const M = createBoardModel();
const add = (value, count) => M.reduce(M.empty(), { type: 'add', shape: 'circle', value, count });
test('merge includes all eleven selected blocks with a distinct custom color', () => {
  const b = add(1, 11);
  const merged = M.reduce(b, { type: 'merge', ids: b.objects.map(o => o.id) });
  assert.equal(merged.objects.length, 1);
  assert.equal(merged.objects[0].value, 11);
  assert.ok(!b.settings.levels.some(l => l.color === merged.objects[0].color));
});
test('native and merged hundreds split to ten tens', () => {
  const b = add(1, 100);
  for (const board of [add(100, 1), M.reduce(b, { type: 'merge', ids: b.objects.map(o => o.id) })]) {
    const result = M.reduce(board, { type: 'split', id: board.objects[0].id });
    assert.deepEqual(result.objects.map(o => o.value), Array(10).fill(10));
  }
});
test('native tens split to ten ones and nonstandard values preserve remainders', () => {
  let b = add(10, 1);
  assert.deepEqual(M.reduce(b, { type: 'split', id: b.objects[0].id }).objects.map(o => o.value), Array(10).fill(1));
  b = add(1, 11); b = M.reduce(b, { type: 'merge', ids: b.objects.map(o => o.id) });
  assert.deepEqual(M.reduce(b, { type: 'split', id: b.objects[0].id }).objects.map(o => o.value), [10, 1]);
});
