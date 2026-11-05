import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoardModel } from './model.js';

const M = createBoardModel();
const clone = (v) => JSON.parse(JSON.stringify(v));
const freeze = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const add = (b = M.empty(), options = {}) => M.reduce(b, { type: 'add', shape: 'circle', ...options });
const ids = (b) => b.objects.map((o) => o.id);
const group = (b, selected = ids(b), alias = '一组') => M.reduce(b, { type: 'groupSelected', ids: selected, alias });
const configured = (b = M.empty(), scope = 'future', levels = [{ value: 2, color: 0 }, { value: 6, color: 1 }]) => {
  const settings = { levels, defaults: M.shapes.map((shape) => ({ shape, value: levels[0].value, alias: shape === 'circle' ? '苹果' : '' })), shapes: ['circle'] };
  return M.reduce(b, { type: 'configure', settings, scope });
};
const assertSpaced = (objects) => {
  for (let i = 0; i < objects.length; i++) {
    const a = objects[i]; assert.ok(a.x >= 30 && a.x <= 770 && a.y >= 30 && a.y <= 330);
    for (let j = i + 1; j < objects.length; j++) assert.ok(Math.hypot(a.x - objects[j].x, a.y - objects[j].y) >= 30);
  }
};

test('v3 defaults show the ten legacy patterns, including basic geometry, and keep the full library', () => {
  const empty = M.empty();
  assert.equal(empty.schemaVersion, 3); assert.equal(Object.hasOwn(empty, 'operation'), false);
  assert.deepEqual(Object.keys(empty).sort(), ['groups', 'note', 'objects', 'schemaVersion', 'settings']);
  assert.deepEqual(M.shapes, ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond', 'heart', 'oval', 'cat', 'dog',
    'car', 'person', 'apple', 'fish', 'rocket', 'flower', 'butterfly', 'house', 'icecream']);
  assert.deepEqual(M.defaultVisibleShapes, ['circle', 'square', 'triangle', 'star', 'hexagon', 'diamond', 'heart', 'oval', 'cat', 'dog']);
  assert.deepEqual(empty.settings.shapes, M.defaultVisibleShapes);
  assert.deepEqual(M.defaultSettings().levels, [1, 10, 100, 1000, 10000].map((value, color) => ({ value, color })));
  assert.deepEqual(empty.settings.defaults.map((d) => d.shape), M.shapes);
  assert.ok(empty.settings.defaults.every((d) => d.value === 1 && d.alias === ''));
  assert.deepEqual(Array.from({ length: 9 }, (_, i) => M.color(i)), ['#4CAF50', '#42A5F5', '#AB47BC', '#26A69A', '#FF7043', '#F4511E', '#E53935', '#D81B60', '#8E24AA']);
  for (const color of [-1, 10, 0.5, '1', null]) assert.throws(() => M.color(color));
  empty.settings.levels[0].value = 99; assert.equal(M.empty().settings.levels[0].value, 1);
});

test('settings strictly validate unique levels, colors, all shape defaults and bounds', () => {
  const settings = M.defaultSettings();
  assert.deepEqual(M.validateSettings(freeze(settings)), settings);
  const cases = [null, {}, { ...settings, extra: true }, { ...settings, levels: [] }, { ...settings, levels: Array.from({ length: 21 }, (_, i) => ({ value: i + 1, color: 0 })) },
    { ...settings, defaults: settings.defaults.slice(1) }, { ...settings, defaults: settings.defaults.map(() => settings.defaults[0]) },
    { ...settings, shapes: [] }, { ...settings, shapes: ['cat', 'cat'] }, { ...settings, shapes: ['mystery'] }];
  for (const level of [{ value: 0, color: 0 }, { value: -1, color: 0 }, { value: 1.5, color: 0 }, { value: Number.MAX_SAFE_INTEGER + 1, color: 0 }, { value: 1, color: 9 }, { value: 1, color: '0' }, { value: 1, color: 0, extra: 1 }]) cases.push({ ...settings, levels: [level] });
  cases.push({ ...settings, levels: [settings.levels[0], settings.levels[0]] });
  for (const patch of [{ shape: 'cat' }, { value: 3 }, { alias: '字'.repeat(31) }, { extra: true }]) {
    cases.push({ ...settings, defaults: [{ ...settings.defaults[0], ...patch }, ...settings.defaults.slice(1)] });
  }
  for (const candidate of cases) assert.throws(() => M.validateSettings(candidate));
});

test('add uses configured per-shape values names and colors; explicit values require configured levels', () => {
  const b = add(configured(), { count: 3 });
  assert.ok(b.objects.every((o) => o.value === 2 && o.color === 0 && o.alias === '苹果' && o.shape === 'circle' && !o.sources.length));
  assert.equal(add(b, { value: 6 }).objects.at(-1).color, 1);
  assert.throws(() => add(b, { value: 10 }));
  for (const shape of M.shapes) assert.equal(add(b, { shape }).objects.at(-1).shape, shape);
  for (const count of [0, -1, 101, 1.5, '2', null]) assert.throws(() => add(b, { count }));
});

test('3 green circles worth2 merge into one SAME blue circle worth6 with preserved sources and name', () => {
  const b = freeze(add(configured(), { count: 3 }));
  const candidate = M.mergeCandidate(b, ids(b));
  assert.deepEqual(candidate, { allowed: true, reason: '', value: 6, color: 1 });
  const merged = M.reduce(b, { type: 'merge', ids: ids(b) });
  assert.equal(merged.objects.length, 1);
  const o = merged.objects[0];
  assert.equal(o.id, 'object-4'); assert.equal(o.shape, 'circle'); assert.equal(o.value, 6); assert.equal(o.color, 1); assert.equal(o.alias, '苹果');
  assert.deepEqual(o.sources, b.objects);
  assert.deepEqual({ x: o.x, y: o.y }, { x: b.objects[0].x, y: b.objects[0].y });
  assert.equal(M.summary(merged).totalValue, M.summary(b).totalValue);
  assert.deepEqual(M.validate(JSON.parse(M.serialize(merged))), merged);
  const restored = M.reduce(merged, { type: 'split', id: o.id });
  assert.deepEqual(restored.objects.map(({ x, y, ...data }) => data), b.objects.map(({ x, y, ...data }) => data));
  assertSpaced(restored.objects);
});

test('mergeCandidate returns ordinary incompatibility instead of throwing; merge failure is atomic', () => {
  const b = freeze(add(configured(), { count: 3 }));
  for (const selected of [[], ['object-1'], ['missing'], ['object-1', 'object-1'], null]) {
    assert.equal(M.mergeCandidate(b, selected).allowed, false);
    assert.throws(() => M.reduce(b, { type: 'merge', ids: selected }));
  }
  const variants = [
    { ...b, objects: b.objects.map((o, i) => ({ ...o, shape: i ? 'circle' : 'square' })) },
    { ...b, objects: b.objects.map((o, i) => ({ ...o, value: i ? 2 : 6 })) },
    { ...b, objects: b.objects.map((o, i) => ({ ...o, alias: i ? '苹果' : '橘子' })) },
    { ...b, objects: b.objects.map((o, i) => ({ ...o, removed: i === 0 })) },
    group(b, ['object-1']),
  ];
  for (const board of variants) { assert.equal(M.mergeCandidate(board, ids(board)).allowed, false); assert.throws(() => M.reduce(freeze(board), { type: 'merge', ids: ids(board) })); }
  const max = Number.MAX_SAFE_INTEGER;
  const overflow = add(configured(M.empty(), 'future', [{ value: max, color: 0 }]), { count: 2 });
  assert.match(M.mergeCandidate(overflow, ids(overflow)).reason, /safe integer/);
  assert.equal(M.summary(overflow).totalValue, (BigInt(max) * 2n).toString());
});

test('configure future leaves existing snapshots intact; existing updates originals only and preserves aliases', () => {
  let b = add(M.empty(), { count: 2 });
  b = M.reduce(b, { type: 'update', id: 'object-1', patch: { alias: '自己的名字' } });
  const future = configured(b);
  assert.deepEqual(future.objects, b.objects);
  assert.equal(add(future).objects.at(-1).value, 2);
  assert.equal(add(future).objects.at(-1).alias, '苹果');
  const existing = configured(b, 'existing');
  assert.ok(existing.objects.every((o) => o.value === 2 && o.color === 0));
  assert.equal(existing.objects[0].alias, '自己的名字');
  let merged = M.reduce(add(configured(), { count: 3 }), { type: 'merge', ids: ['object-1', 'object-2', 'object-3'] });
  merged = add(merged);
  const changed = configured(merged, 'existing', [{ value: 5, color: 4 }]);
  assert.deepEqual(changed.objects[0], merged.objects[0]);
  assert.equal(changed.objects[1].value, 5); assert.equal(changed.objects[1].color, 4);
  assert.equal(changed.objects[0].value, 6); assert.equal(changed.objects[0].color, 1);
  assert.deepEqual(changed.objects[0].sources, merged.objects[0].sources);
  assert.deepEqual(M.validate(JSON.parse(M.serialize(changed))), changed);
  assert.throws(() => M.reduce(b, { type: 'configure', settings: M.defaultSettings() }));
});

test('regrouping dissolves every touched group, releases unselected members and creates one flat group', () => {
  let b = add(M.empty(), { count: 5 });
  b = group(b, ['object-1', 'object-2'], '甲');
  b = group(b, ['object-3', 'object-4'], '乙');
  const result = group(freeze(b), ['object-1', 'object-3', 'object-5'], '新组');
  assert.deepEqual(result.groups, [{ id: 'group-3', alias: '新组' }]);
  assert.deepEqual(result.objects.map((o) => o.groupId), ['group-3', null, 'group-3', null, 'group-3']);
  assert.deepEqual(result.objects.map(({ groupId, ...data }) => data), b.objects.map(({ groupId, ...data }) => data));
  const dissolved = M.reduce(result, { type: 'deleteGroup', id: 'group-3' });
  assert.equal(dissolved.groups.length, 0); assert.ok(dissolved.objects.every((o) => o.groupId === null));
});

test('group members retain original aliases, cannot edit alias until dissolved; groups rename independently', () => {
  let b = add(configured(), { count: 2 });
  b = group(b, ids(b), '一袋');
  assert.throws(() => M.reduce(b, { type: 'update', id: 'object-1', patch: { alias: '不能改' } }), /Rename the group/);
  const renamed = M.reduce(b, { type: 'renameGroup', id: 'group-1', alias: '新袋子' });
  assert.equal(renamed.groups[0].alias, '新袋子'); assert.equal(renamed.objects[0].alias, '苹果');
  const dissolved = M.reduce(renamed, { type: 'deleteGroup', id: 'group-1' });
  assert.equal(dissolved.objects[0].alias, '苹果');
  assert.equal(M.reduce(dissolved, { type: 'update', id: 'object-1', patch: { alias: '可编辑' } }).objects[0].alias, '可编辑');
  assert.throws(() => M.reduce(dissolved, { type: 'update', id: 'object-1', patch: { groupId: 'group-1' } }));
});

test('merge and split retain current group, historical absent group refs are valid', () => {
  const b = group(add(configured(), { count: 3 }), undefined, '组');
  const merged = M.reduce(b, { type: 'merge', ids: ids(b) });
  assert.equal(merged.objects[0].groupId, 'group-1');
  const regrouped = group(merged, ids(merged), '新的组');
  assert.equal(regrouped.objects[0].sources[0].groupId, 'group-1');
  assert.equal(regrouped.groups[0].id, 'group-2');
  assert.deepEqual(M.validate(regrouped), regrouped);
  const restored = M.reduce(regrouped, { type: 'split', id: regrouped.objects[0].id });
  assert.ok(restored.objects.every((o) => o.groupId === 'group-2'));
  assert.equal(restored.groups[0].alias, '新的组');
});

test('nested provenance splits one level and repairs ID collisions without changing saved values/colors', () => {
  const levels = [{ value: 1, color: 0 }, { value: 2, color: 1 }, { value: 4, color: 2 }];
  let b = add(configured(M.empty(), 'future', levels), { count: 4 });
  b = M.reduce(b, { type: 'merge', ids: ['object-1', 'object-2'] });
  b = M.reduce(b, { type: 'merge', ids: ['object-3', 'object-4'] });
  b = M.reduce(b, { type: 'merge', ids: ids(b) });
  assert.equal(b.objects[0].value, 4); assert.equal(b.objects[0].sources[0].sources.length, 2);
  b = add(b);
  b.objects[1].id = b.objects[0].sources[0].id;
  const split = M.reduce(freeze(b), { type: 'split', id: b.objects[0].id });
  assert.equal(new Set(ids(split)).size, 3);
  const restored = split.objects.filter((o) => o.value === 2);
  assert.equal(restored.length, 2); assert.ok(restored.every((o) => o.color === 1 && o.sources.length === 2));
  assert.ok(restored.some((o) => o.id !== b.objects[0].sources[0].id));
  assertSpaced(split.objects);
  assert.deepEqual(M.validate(JSON.parse(M.serialize(split))), split);
});

test('duplicating complete groups creates flat new group; partial groups copy as loose objects with provenance', () => {
  let b = group(add(configured(), { count: 3 }), undefined, '苹果组');
  b = M.reduce(b, { type: 'merge', ids: ids(b) });
  const full = M.reduce(freeze(b), { type: 'duplicateSelected', ids: ids(b) });
  assert.equal(full.groups.length, 2); assert.equal(full.groups[1].alias, '苹果组');
  assert.notEqual(full.objects[0].id, full.objects[1].id); assert.equal(full.objects[1].groupId, full.groups[1].id);
  assert.deepEqual(full.objects[1].sources, b.objects[0].sources);
  let pair = group(add(M.empty(), { count: 2 }));
  const part = M.reduce(pair, { type: 'duplicateSelected', ids: ['object-1'] });
  assert.equal(part.groups.length, 1); assert.equal(part.objects.at(-1).groupId, null);
  assertSpaced(part.objects);
});

test('positions stay sparse first60, dense up to200, and deleted slots are reused', () => {
  const sparse = add(M.empty(), { count: 60 });
  for (const o of sparse.objects) {
    assert.equal(Math.round((o.x - 30) / (740 / 22)) % 2, 0); assert.equal(Math.round((o.y - 30) / 37.5) % 2, 0);
  }
  assertSpaced(sparse.objects);
  const dense = add(sparse); assert.equal(dense.objects.at(-1).x, 30 + 740 / 22); assert.equal(dense.objects.at(-1).y, 30);
  let b = add(add(M.empty(), { count: 100 }), { count: 100 }); assertSpaced(b.objects);
  const removed = b.objects[7]; b = M.reduce(b, { type: 'delete', id: removed.id });
  const next = add(b); assert.equal(next.objects.at(-1).id, 'object-201');
  assert.equal(next.objects.at(-1).x, removed.x); assert.equal(next.objects.at(-1).y, removed.y); assertSpaced(next.objects);
});

test('drop positioning and multi-move clamp selection as a rigid whole', () => {
  const dropped = add(M.empty(), { x: -100, y: 1000, count: 3 });
  assert.equal(dropped.objects[0].x, 30); assert.equal(dropped.objects[0].y, 330); assertSpaced(dropped.objects);
  for (const options of [{ x: 20 }, { y: 40 }, { x: NaN, y: 40 }, { x: 30, y: Infinity }]) assert.throws(() => add(dropped, options));
  let b = add(add(add(M.empty(), { x: 100, y: 80 }), { x: 150, y: 160 }), { x: 300, y: 300 });
  const moved = M.reduce(freeze(b), { type: 'moveMany', ids: ['object-1', 'object-2'], dx: 999, dy: -999 });
  assert.deepEqual(moved.objects.map(({ x, y }) => ({ x, y })), [{ x: 720, y: 30 }, { x: 770, y: 110 }, { x: 300, y: 300 }]);
  for (const delta of [{ dx: NaN, dy: 1 }, { dx: 1, dy: Infinity }, { dx: '1', dy: 2 }, { dx: 1 }]) assert.throws(() => M.reduce(b, { type: 'moveMany', ids: ['object-1'], ...delta }));
});

test('arrange all or subset leaves content and membership unchanged', () => {
  let b = group(add(M.empty(), { count: 6 }), ['object-3', 'object-4']);
  b = M.reduce(b, { type: 'moveMany', ids: ids(b), dx: 12, dy: 9 });
  const arranged = M.reduce(freeze(b), { type: 'arrange' }); assertSpaced(arranged.objects);
  assert.deepEqual(arranged.objects.map(({ x, y, ...data }) => data), b.objects.map(({ x, y, ...data }) => data));
  const subset = M.reduce(arranged, { type: 'arrange', ids: ['object-1', 'object-2'] });
  assert.deepEqual(subset.objects.slice(2), arranged.objects.slice(2)); assertSpaced(subset.objects);
  assert.deepEqual(M.reduce(arranged, { type: 'arrange', ids: [] }), arranged);
  let full = add(add(M.empty(), { count: 100 }), { count: 100 });
  full.objects.forEach((o) => { o.x = 400; o.y = 180; }); assertSpaced(M.reduce(full, { type: 'arrange' }).objects);
});

test('caps, selections, batches, obsolete actions and failed mutations are atomic', () => {
  let full = freeze(add(add(M.empty(), { count: 100 }), { count: 100 }));
  const before = JSON.stringify(full);
  assert.throws(() => add(full)); assert.throws(() => M.reduce(full, { type: 'duplicateSelected', ids: ['object-1'] }));
  assert.equal(JSON.stringify(full), before);
  for (const type of ['groupSelected', 'duplicateSelected', 'moveMany', 'merge', 'arrange']) for (const selected of [['missing'], ['object-1', 'object-1'], [null], null]) {
    assert.throws(() => M.reduce(full, { type, ids: selected, dx: 0, dy: 0 }));
  }
  for (const type of ['operation', 'distribute', 'group', 'duplicateGroup', 'mystery']) assert.throws(() => M.reduce(full, { type }));
  const b = freeze(add(M.empty(), { count: 3 }));
  const result = M.reduce(b, { type: 'batch', actions: [{ type: 'groupSelected', ids: ['object-1', 'object-2'], alias: '组' }, { type: 'batch', actions: [{ type: 'duplicateSelected', ids: ['object-3'] }] }, { type: 'note', value: '说明' }] });
  assert.equal(result.objects.length, 4); assert.equal(result.note, '说明');
  assert.throws(() => M.reduce(b, { type: 'batch', actions: [{ type: 'delete', id: 'object-1' }, { type: 'moveMany', ids: ['object-1'], dx: 1, dy: 1 }] }));
  assert.equal(b.objects.length, 3);
  const cycle = { type: 'batch', actions: [] }; cycle.actions.push(cycle);
  assert.throws(() => M.reduce(b, cycle));
  assert.throws(() => M.reduce(b, { type: 'batch', actions: Array.from({ length: 251 }, () => ({ type: 'arrange' })) }));
  assert.equal(M.reduce(b, { type: 'batch', actions: Array.from({ length: 250 }, () => ({ type: 'note', value: 'a' })) }).note, 'a');
  assert.equal(M.reduce(b, { type: 'note', value: '字'.repeat(500) }).note.length, 500); assert.throws(() => M.reduce(b, { type: 'note', value: '字'.repeat(501) }));
  let many = add(M.empty(), { count: 13 }); for (let i = 0; i < 12; i++) many = group(many, [`object-${i + 1}`]);
  assert.throws(() => group(many, ['object-13']));
  assert.equal(group(many, ['object-1']).groups.length, 12); // Replace an existing group at the cap.
});

const legacy = () => ({ schemaVersion: 1, operation: 'divide', objects: [
  { id: 'object-1', shape: 'circle', value: 10, alias: '十', x: 50, y: 45, groupId: 'group-1', removed: false },
  { id: 'object-2', shape: 'triangle', value: 100, alias: '百', x: 100, y: 45, groupId: null, removed: true },
], groups: [{ id: 'group-1', alias: '老组' }], note: '旧画板' });

test('validated legacy canonical and export states migrate to v3 without operation, geometry or name loss', () => {
  const old = legacy(); const migrated = M.validate(freeze(old));
  assert.equal(migrated.schemaVersion, 3); assert.equal(Object.hasOwn(migrated, 'operation'), false);
  assert.deepEqual(migrated.settings.shapes, ['circle', 'square', 'triangle']);
  assert.deepEqual(migrated.objects.map(({ color, sources, ...rest }) => rest), old.objects);
  assert.deepEqual(migrated.objects.map((o) => o.color), [1, 2]); assert.deepEqual(migrated.groups, old.groups);
  const exported = { kind: 'math-board', ...old, summary: { totalCount: 2, activeCount: 1, totalValue: 10, removedCount: 1, removedValue: 100, groups: [{ id: 'group-1', alias: '老组', count: 1, value: 10 }], ungrouped: { count: 0, value: 0 } } };
  assert.deepEqual(M.validate(exported), migrated);
  exported.summary.totalValue = 999; assert.throws(() => M.validate(exported));
  for (const patch of [{ value: 3 }, { shape: 'star' }, { groupId: 'missing' }, { x: 29 }, { extra: 1 }]) {
    const input = legacy(); Object.assign(input.objects[0], patch); assert.throws(() => M.validate(input));
  }
});

test('schemaVersion 2 settings migrate to v3: ten old patterns stay visible and new patterns get a fallback default', () => {
  const legacyDefaults = M.shapes.slice(0, 10).map((shape) => ({ shape, value: 1, alias: shape === 'circle' ? '苹果' : '' }));
  const old = { schemaVersion: 2, settings: { levels: [{ value: 1, color: 0 }, { value: 10, color: 1 }], defaults: legacyDefaults }, objects: [], groups: [], note: '' };
  const migrated = M.validate(freeze(old));
  assert.equal(migrated.schemaVersion, 3);
  assert.deepEqual(migrated.settings.shapes, M.shapes.slice(0, 10));
  assert.deepEqual(migrated.settings.defaults.map((d) => d.shape), M.shapes);
  assert.deepEqual(migrated.settings.defaults.slice(0, 10), legacyDefaults);
  assert.ok(migrated.settings.defaults.slice(10).every((d) => d.value === 1 && d.alias === ''));
  const noOne = M.validate({ ...old, settings: { ...old.settings, levels: [{ value: 2, color: 0 }],
    defaults: legacyDefaults.map((entry) => ({ ...entry, value: 2 })) } });
  assert.ok(noOne.settings.defaults.slice(10).every((d) => d.value === 2));
  assert.deepEqual(M.validateSettings(old.settings).shapes, M.shapes.slice(0, 10));
  assert.throws(() => M.validateSettings({ ...old.settings, shapes: M.defaultVisibleShapes }));
});

test('strict v3 validation rejects malformed state, sources, links and untrusted totals', () => {
  const b = add(M.empty());
  const cases = [null, [], '{}', { ...b, schemaVersion: 4 }, { ...b, operation: 'add' }, { ...b, settings: {} }, { ...b, note: 1 }, { ...b, objects: {} }, { ...b, groups: [{ id: 'g', alias: 1 }] }];
  for (const patch of [{ id: '' }, { shape: 'catfish' }, { value: 0 }, { color: 10 }, { alias: null }, { x: NaN }, { y: Infinity }, { x: 29 }, { y: 331 }, { removed: 1 }, { groupId: 'missing' }, { sources: [{}] }, { extra: 1 }]) cases.push({ ...b, objects: [{ ...b.objects[0], ...patch }] });
  cases.push({ ...b, objects: [b.objects[0], b.objects[0]] });
  for (const input of cases) assert.throws(() => M.validate(input));
  for (const patch of [{ id: 'changed' }, { shape: 'square' }, { color: 1 }, { value: 2 }, { removed: 'yes' }]) assert.throws(() => M.reduce(b, { type: 'update', id: 'object-1', patch }));
  const merged = M.reduce(add(configured(), { count: 3 }), { type: 'merge', ids: ['object-1', 'object-2', 'object-3'] });
  const invalid = clone(merged); invalid.objects[0].sources[0].value = 5; assert.throws(() => M.validate(invalid));
  const exported = JSON.parse(M.serialize(merged)); exported.summary.totalValue = 999; assert.throws(() => M.validate(exported));
  assert.throws(() => M.validate({ ...b, kind: 'other', summary: M.summary(b) }));
  const canonical = M.validate(freeze(merged)); canonical.objects[0].sources[0].alias = 'changed'; assert.notEqual(merged.objects[0].sources[0].alias, 'changed');
});

test('recursive provenance depth<=8 and total nodes<=2000 are bounded, cycles rejected', () => {
  const leaf = { ...add(M.empty()).objects[0] };
  const tree = (depth, prefix) => depth === 0 ? { ...clone(leaf), id: prefix } : {
    ...clone(leaf), id: prefix, value: 2 ** depth,
    sources: [tree(depth - 1, `${prefix}a`), tree(depth - 1, `${prefix}b`)],
  };
  const valid = { ...M.empty(), objects: [tree(8, 'tree')] };
  assert.deepEqual(M.validate(valid), valid);
  assert.equal(M.mergeCandidate({ ...valid, objects: [tree(8, 'x'), tree(8, 'y')] }, ['x', 'y']).allowed, false);
  assert.throws(() => M.validate({ ...M.empty(), objects: [tree(9, 'deep')] }), /limit/);
  assert.throws(() => M.validate({ ...M.empty(), objects: [tree(8, 'a'), tree(8, 'b'), tree(8, 'c'), tree(8, 'd')] }), /limit/);
  const cycle = { ...clone(leaf), value: 2 }; cycle.sources = [cycle, clone(leaf)];
  assert.throws(() => M.validate({ ...M.empty(), objects: [cycle] }), /limit/);
});

test('summary preserves active versus removed facts and serialization roundtrips independent snapshots', () => {
  let b = group(add(configured(), { count: 3 }), ['object-1', 'object-2'], '两份');
  b = M.reduce(b, { type: 'update', id: 'object-1', patch: { removed: true } });
  assert.deepEqual(M.summary(b), { totalCount: 3, activeCount: 2, totalValue: 4, removedCount: 1, removedValue: 2,
    groups: [{ id: 'group-1', alias: '两份', count: 1, value: 2 }], ungrouped: { count: 1, value: 2 } });
  const exported = JSON.parse(M.serialize(b)); assert.equal(exported.kind, 'math-board'); assert.equal(exported.schemaVersion, 3);
  assert.deepEqual(M.validate(exported), b);
});

test('digest keeps group composition, cross-outs and merge provenance for the friendly answer text', () => {
  let b = configured();
  b = add(b, { count: 3 });
  b = group(b, ['object-1', 'object-2'], '小猫队');
  b = M.reduce(b, { type: 'update', id: 'object-3', patch: { removed: true } });
  const digest = M.digest(b);
  assert.equal(digest.groups.length, 1);
  assert.deepEqual(digest.groups[0], {
    id: 'group-1', alias: '小猫队', count: 2, total: 4,
    items: [{ shape: 'circle', value: 2, alias: '苹果', merged: 0, count: 2, total: 4 }],
  });
  assert.deepEqual(digest.ungrouped, { items: [], count: 0, total: 0 });
  assert.deepEqual(digest.removed, {
    items: [{ shape: 'circle', value: 2, alias: '苹果', merged: 0, count: 1, total: 2 }], count: 1, total: 2,
  });
  const merged = M.reduce(add(configured(), { count: 3 }), { type: 'merge', ids: ['object-1', 'object-2', 'object-3'] });
  const item = M.digest(merged).ungrouped.items[0];
  assert.equal(item.merged, 3); assert.equal(item.value, 6); assert.equal(item.count, 1); assert.equal(item.total, 6);
});

test('deleting the last member drops the empty group and keeps groups that still have members', () => {
  let paired = group(add(M.empty(), { count: 3 }), ['object-1', 'object-2'], '甲');
  paired = group(paired, ['object-3'], '乙');
  const oneLeft = M.reduce(paired, { type: 'delete', id: 'object-1' });
  assert.deepEqual(oneLeft.groups.map((item) => item.alias), ['甲', '乙']);
  assert.equal(oneLeft.objects.find((item) => item.id === 'object-2').groupId, 'group-1');
  const emptied = M.reduce(oneLeft, { type: 'delete', id: 'object-2' });
  assert.deepEqual(emptied.groups.map((item) => item.alias), ['乙']);
  assert.equal(emptied.objects[0].groupId, 'group-2');
  assert.equal(M.summary(emptied).groups.length, 1);
});

test('configure recolours unmerged shapes on a changed level and keeps a merged shape at its recorded colour', () => {
  const levels = [{ value: 2, color: 0 }, { value: 6, color: 1 }];
  let board = add(configured(M.empty(), 'future', levels), { count: 4 });
  board = M.reduce(board, { type: 'merge', ids: ['object-1', 'object-2', 'object-3'] });
  const settings = { ...board.settings, levels: [{ value: 2, color: 3 }, { value: 6, color: 4 }] };
  for (const scope of ['future', 'existing']) {
    const next = M.reduce(board, { type: 'configure', settings, scope });
    assert.equal(next.objects[0].value, 6, scope);
    assert.equal(next.objects[0].color, 1, scope);
    assert.equal(next.objects[1].value, 2, scope);
    assert.equal(next.objects[1].color, 3, scope);
  }
  const plain = add(configured(M.empty(), 'future', levels), { value: 6 });
  const painted = M.reduce(plain, { type: 'configure', settings, scope: 'future' });
  assert.equal(painted.objects[0].color, 4);
});

test('factory has no runtime imports or external bindings, source states and actions remain immutable', () => {
  const source = freeze(add(configured(), { count: 3 })); const snapshot = JSON.stringify(source);
  const actions = [{ type: 'merge', ids: ids(source) }, { type: 'groupSelected', ids: ids(source), alias: '组' },
    { type: 'moveMany', ids: ids(source), dx: 10, dy: 10 }, { type: 'arrange' }, { type: 'duplicateSelected', ids: ['object-1'] },
    { type: 'update', id: 'object-1', patch: { alias: '改名', removed: true } }, { type: 'delete', id: 'object-1' }, { type: 'note', value: '思路' }];
  for (const action of actions) { assert.notEqual(M.reduce(source, freeze(action)), source); assert.equal(JSON.stringify(source), snapshot); }
  const browserFactory = Function(`return (${createBoardModel.toString()})`)();
  assert.deepEqual(browserFactory().empty(), M.empty());
  assert.deepEqual(browserFactory().reduce(source, actions[0]), M.reduce(source, actions[0]));
});
