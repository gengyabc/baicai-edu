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
test('native hundreds split to tens, while merged hundreds restore all hundred sources', () => {
  const b = add(1, 100);
  const native = add(100, 1);
  assert.deepEqual(M.reduce(native, { type: 'split', id: native.objects[0].id }).objects.map(o => o.value), Array(10).fill(10));
  const merged = M.reduce(b, { type: 'merge', ids: b.objects.map(o => o.id) });
  const result = M.reduce(merged, { type: 'split', id: merged.objects[0].id });
  assert.deepEqual(result.objects, b.objects);
});
test('native tens split to ones and native nonstandard values preserve remainders', () => {
  const b = add(10, 1);
  assert.deepEqual(M.reduce(b, { type: 'split', id: b.objects[0].id }).objects.map(o => o.value), Array(10).fill(1));
  const native = { ...b, objects: b.objects.map(o => ({ ...o, value: 11, color: 9 })) };
  assert.deepEqual(M.reduce(native, { type: 'split', id: native.objects[0].id }).objects.map(o => o.value), [10, 1]);
});

test('eleven annotated ones restore their saved values, colors, aliases and notes after settings change', () => {
  let b = add(1, 11);
  b = M.reduce(b, { type: 'update', id: b.objects[0].id, patch: { alias: '圆片' } });
  b.objects = b.objects.map((o, i) => ({ ...o, alias: '圆片', note: `第${i + 1}只`, color: i % 9 }));
  const merged = M.reduce(b, { type: 'merge', ids: b.objects.map(o => o.id) });
  const settings = { ...merged.settings, levels: [{ value: 3, color: 4 }, { value: 10, color: 6 }],
    defaults: merged.settings.defaults.map(d => ({ ...d, value: 3 })) };
  const changed = M.reduce(merged, { type: 'configure', settings, scope: 'existing' });
  const result = M.reduce(changed, { type: 'split', id: changed.objects[0].id });
  assert.deepEqual(result.objects, b.objects);
  assert.equal(M.summary(result).totalValue, 11);
});

test('nested split restores immediate merged sources even when a larger lower level exists', () => {
  let b = add(1, 22);
  const original = b.objects;
  b = M.reduce(b, { type: 'merge', ids: original.slice(0, 11).map(o => o.id) });
  b = M.reduce(b, { type: 'merge', ids: original.slice(11).map(o => o.id) });
  b = M.reduce(b, { type: 'annotate', target: 'object', id: b.objects[0].id, value: '第一堆' });
  b = M.reduce(b, { type: 'annotate', target: 'object', id: b.objects[1].id, value: '第二堆' });
  const immediate = b.objects;
  const merged = M.reduce(b, { type: 'merge', ids: immediate.map(o => o.id) });
  const result = M.reduce(merged, { type: 'split', id: merged.objects[0].id });
  const withoutPosition = ({ x, y, ...o }) => o;
  assert.deepEqual(result.objects.map(withoutPosition), immediate.map(withoutPosition));
  assert.deepEqual(result.objects.map(o => o.sources), immediate.map(o => o.sources));
  assert.equal(result.objects.length, 2);
});

test('splitting annotated native or merged parents prunes only selection notes naming that parent', () => {
  for (const isMerged of [false, true]) {
    let b = isMerged ? add(1, 11) : add(10, 1);
    if (isMerged) b = M.reduce(b, { type: 'merge', ids: b.objects.map(o => o.id) });
    const parentId = b.objects[0].id;
    b = M.reduce(b, { type: 'add', shape: 'square', count: 2 });
    const others = b.objects.slice(1).map(o => o.id);
    b = M.reduce(b, { type: 'annotate', target: 'selection', ids: [parentId, others[0]], value: '包含待拆物品' });
    b = M.reduce(b, { type: 'annotate', target: 'selection', ids: others, value: '保留的说明' });
    b = M.reduce(b, { type: 'annotate', target: 'object', id: others[0], value: '物品说明' });
    b = M.reduce(b, { type: 'note', value: '整板说明' });
    b = M.reduce(b, { type: 'groupSelected', ids: [parentId], alias: '组' });
    b = M.reduce(b, { type: 'annotate', target: 'group', id: b.groups[0].id, value: '组说明' });
    const result = M.reduce(b, { type: 'split', id: parentId });
    assert.deepEqual(result.notes, [b.notes[1]]);
    assert.deepEqual(result.groups, b.groups);
    assert.equal(result.note, b.note);
    assert.deepEqual(result.objects.filter(o => others.includes(o.id)), b.objects.slice(1));
    assert.ok(result.objects.filter(o => !others.includes(o.id)).every(o => o.groupId === b.groups[0].id));
    assert.deepEqual(M.validate(JSON.parse(M.serialize(result))), result);
  }
});
