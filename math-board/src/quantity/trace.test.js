import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';

const M = createBoardModel();
const T = createBoardTrace(M);
const clone = (v) => JSON.parse(JSON.stringify(v));
const freeze = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const fact = (entry, field) => entry.facts.find((f) => f.field === field);
function session() {
  let board = M.empty(); let trace = T.empty();
  return {
    get board() { return board; }, get trace() { return trace; },
    step(action, origin) { const before = board; board = M.reduce(board, action); trace = T.record(trace, before, board, action, origin); return board; },
    restore(after, type, origin) { trace = T.record(trace, board, after, { type }, origin); board = after; },
  };
}
const add = (count = 1) => ({ type: 'add', shape: 'circle', count });

test('factory embeds using toString without external dependencies', () => {
  const context = vm.createContext({});
  const factory = vm.runInContext(`(${createBoardTrace.toString()})`, context);
  const embedded = factory(M);
  // Cross-realm values are exchanged as JSON, as in the build embedding.
  assert.equal(embedded.serialize(embedded.empty()), T.serialize(T.empty()));
  const before = M.empty(); const after = M.reduce(before, add(2));
  assert.equal(embedded.serialize(embedded.record(embedded.empty(), before, after, vm.runInContext('({type:"add",shape:"circle",count:2})', context))),
    T.serialize(T.record(T.empty(), before, after, add(2))));
});

test('three approaches reach one final board but preserve distinct process evidence and undo facts', () => {
  const straight = session(); straight.step(add(2));
  const corrected = session(); const target = corrected.step(add(2));
  corrected.step(add()); corrected.restore(target, 'undo');
  const revised = session(); const wrong = revised.step(add(3)); revised.restore(M.empty(), 'undo');
  revised.restore(wrong, 'redo'); revised.restore(M.empty(), 'undo'); revised.step(add(2));
  assert.deepEqual(straight.board, corrected.board); assert.deepEqual(straight.board, revised.board);
  assert.equal(straight.trace.totalChanges, 1); assert.equal(corrected.trace.totalChanges, 3); assert.equal(revised.trace.totalChanges, 5);
  const undo = corrected.trace.entries.at(-1);
  assert.equal(undo.type, 'undo');
  assert.deepEqual(fact(undo, 'count'), { field: 'count', before: 3, after: 2 });
  assert.deepEqual(fact(undo, 'value'), { field: 'value', before: 3, after: 2 });
  assert.ok(fact(undo, 'objects').before[0].includes('×3'));
  assert.notEqual(T.serialize(straight.trace), T.serialize(corrected.trace));
  assert.equal(revised.trace.entries[2].type, 'redo');
});

test('clear preserves earlier events and reports removed board facts rather than resetting trace', () => {
  const s = session(); s.step(add(4)); s.step({ type: 'note', value: 'Four apples' });
  const previous = clone(s.trace); s.restore(M.empty(), 'clear');
  assert.deepEqual(s.trace.entries.slice(0, 2), previous.entries);
  assert.equal(s.trace.totalChanges, 3);
  assert.deepEqual(fact(s.trace.entries.at(-1), 'count'), { field: 'count', before: 4, after: 0 });
  assert.deepEqual(fact(s.trace.entries.at(-1), 'note'), { field: 'note', before: 'Four apples', after: '' });
  s.restore(M.empty(), 'clear'); assert.equal(s.trace.totalChanges, 3);
});

test('import marks unknown earlier process without erasing known events', () => {
  const s = session(); s.step({ type: 'note', value: 'My attempt' });
  const imported = M.reduce(M.empty(), add(5)); s.restore(imported, 'import');
  assert.equal(s.trace.priorUnknown, true); assert.equal(s.trace.entries.length, 2);
  assert.equal(s.trace.entries[1].type, 'import');
  assert.deepEqual(fact(s.trace.entries[1], 'count'), { field: 'count', before: 0, after: 5 });
  assert.equal(T.empty(true).priorUnknown, true);
  assert.throws(() => T.empty('true'));
});

test('regrouping different members stays distinct instead of collapsing by count', () => {
  const s = session();
  for (const shape of ['circle', 'square', 'triangle']) s.step({ type: 'add', shape });
  const [circle, square, triangle] = s.board.objects.map((o) => o.id);
  s.step({ type: 'groupSelected', ids: [circle, square], alias: 'team' });
  s.step({ type: 'groupSelected', ids: [circle, triangle], alias: 'team' });
  s.step({ type: 'groupSelected', ids: [square, triangle], alias: 'team' });
  const groups = s.trace.entries.filter((entry) => entry.type === 'group');
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.map((entry) => entry.repeats), [1, 1, 1]);
  assert.deepEqual(groups.map((entry) => fact(entry, 'groups').after[0]), [
    'team: circle:1×1+square:1×1 / 2',
    'team: circle:1×1+triangle:1×1 / 2',
    'team: square:1×1+triangle:1×1 / 2',
  ]);
});

test('importing an unchanged board marks earlier process unknown without inventing a change', () => {
  const s = session(); s.step(add(2));
  const same = clone(s.board); const before = clone(s.trace);
  s.restore(same, 'import');
  assert.deepEqual(s.trace.entries, before.entries);
  assert.equal(s.trace.totalChanges, before.totalChanges);
  assert.equal(s.trace.priorUnknown, true);
});

test('all model action families give semantic structured deltas', () => {
  const s = session();
  s.step({ type: 'batch', actions: [add(2), { type: 'add', shape: 'square', count: 1 }] });
  const circles = s.board.objects.filter((o) => o.shape === 'circle').map((o) => o.id);
  s.step({ type: 'groupSelected', ids: circles, alias: 'apples' });
  assert.equal(s.trace.entries.at(-1).type, 'group');
  assert.ok(fact(s.trace.entries.at(-1), 'groups').after[0].includes('apples'));
  s.step({ type: 'renameGroup', id: s.board.groups[0].id, alias: 'fruit' });
  assert.ok(fact(s.trace.entries.at(-1), 'groups').before[0].includes('apples'));
  s.step({ type: 'merge', ids: circles });
  assert.equal(s.trace.entries.at(-1).type, 'merge');
  assert.deepEqual(fact(s.trace.entries.at(-1), 'count'), { field: 'count', before: 3, after: 2 });
  assert.equal(fact(s.trace.entries.at(-1), 'value'), undefined); // Merge conserves value.
  const merged = s.board.objects.find((o) => o.sources.length);
  s.step({ type: 'split', id: merged.id });
  assert.equal(s.trace.entries.at(-1).type, 'split');
  s.step({ type: 'deleteGroup', id: s.board.groups[0].id });
  const id = s.board.objects[0].id;
  s.step({ type: 'update', id, patch: { alias: 'apple' } });
  assert.ok(fact(s.trace.entries.at(-1), 'aliases').after[0].includes('apple'));
  s.step({ type: 'update', id, patch: { removed: true } });
  assert.deepEqual(fact(s.trace.entries.at(-1), 'removedCount'), { field: 'removedCount', before: 0, after: 1 });
  s.step({ type: 'duplicateSelected', ids: [id] });
  assert.equal(s.trace.entries.at(-1).type, 'duplicate');
  s.step({ type: 'delete', id });
  assert.equal(s.trace.entries.at(-1).type, 'delete');
  assert.equal(s.trace.entries[0].type, 'batch');
});

test('configure records changed settings, actual value effects, and explicit origin', () => {
  const s = session(); s.step(add(2));
  const settings = M.defaultSettings(); settings.levels = [{ value: 3, color: 2 }];
  settings.defaults = settings.defaults.map((d) => ({ ...d, value: 3, alias: d.shape === 'circle' ? 'pear' : '' }));
  settings.shapes = ['circle'];
  s.step({ type: 'configure', settings, scope: 'existing' }, 'system');
  const entry = s.trace.entries.at(-1);
  assert.equal(entry.type, 'configure'); assert.equal(entry.origin, 'system');
  assert.deepEqual(fact(entry, 'value'), { field: 'value', before: 2, after: 6 });
  assert.ok(fact(entry, 'settings.defaults').after[0].includes('pear'));
  const before = s.board; const after = M.reduce(before, { type: 'configure', settings: M.defaultSettings(), scope: 'future' });
  const trace = T.record(s.trace, before, after, { type: 'systemConfigure' }, 'system');
  assert.equal(trace.entries.at(-1).type, 'configure'); assert.equal(trace.entries.at(-1).origin, 'system');
  assert.equal(trace.entries[0].origin, 'student');
});

test('movement contains only moved count, no coordinates, object IDs or clocks', () => {
  const s = session(); s.step(add());
  const id = s.board.objects[0].id;
  s.step({ type: 'moveMany', ids: [id], dx: 113, dy: 17 });
  assert.deepEqual(s.trace.entries.at(-1).facts, [{ field: 'movedCount', before: 0, after: 1 }]);
  s.step({ type: 'update', id, patch: { x: 200, y: 200 } });
  const text = T.serialize(s.trace);
  for (const forbidden of ['"x":', '"y":', '"dx":', '"dy":', 'timestamp', 'createdAt', 'object-1', 'groupId', 'sources']) {
    assert.equal(text.includes(forbidden), false, forbidden);
  }
  assert.equal(text.includes('113'), false);
});

test('no-ops excluded and immutable inputs remain untouched', () => {
  const board = freeze(M.reduce(M.empty(), add())); const trace = freeze(T.empty());
  const noOp = T.record(trace, board, board, { type: 'undo' });
  assert.deepEqual(noOp, trace); assert.notEqual(noOp, trace);
  const after = freeze(M.reduce(board, { type: 'note', value: 'thinking' }));
  const recorded = T.record(trace, board, after, { type: 'note' });
  assert.equal(trace.totalChanges, 0); assert.equal(recorded.totalChanges, 1);
  recorded.entries[0].facts[0].after = 'independent';
  assert.equal(after.note, 'thinking');
});

test('collapse only consecutive identical facts of the same type and origin', () => {
  const s = session(); s.step(add()); const id = s.board.objects[0].id;
  const move = () => s.step({ type: 'moveMany', ids: [id], dx: 5, dy: 0 });
  move(); move(); move();
  assert.equal(s.trace.entries.length, 2); assert.equal(s.trace.entries[1].repeats, 3);
  assert.equal(s.trace.totalChanges, 4); assert.equal(s.trace.entries[1].seq, 2);
  s.step({ type: 'note', value: 'boundary' }); move();
  assert.equal(s.trace.entries.at(-1).repeats, 1); assert.equal(s.trace.entries.at(-1).seq, 6);
  s.step({ type: 'moveMany', ids: [id], dx: 5, dy: 0 }, 'system');
  assert.equal(s.trace.entries.at(-1).origin, 'system'); assert.equal(s.trace.entries.at(-1).repeats, 1);
  const before = s.board; const after = M.reduce(before, { type: 'moveMany', ids: [id], dx: 5, dy: 0 });
  s.restore(after, 'undo', 'system');
  assert.equal(s.trace.entries.at(-1).type, 'undo');
});

test('up to sixty entries are retained, then exact head20/tail30 and repeat-aware omission', () => {
  const s = session();
  for (let i = 1; i <= 60; i++) s.step({ type: 'note', value: `attempt ${i}` });
  assert.equal(s.trace.entries.length, 60); assert.equal(s.trace.omittedChanges, 0);
  const head = clone(s.trace.entries.slice(0, 20));
  s.step({ type: 'note', value: 'attempt 61' });
  assert.equal(s.trace.entries.length, 50); assert.deepEqual(s.trace.entries.slice(0, 20), head);
  assert.equal(s.trace.omittedChanges, 11); assert.equal(s.trace.entries[20].seq, 32);
  for (let i = 62; i <= 150; i++) s.step({ type: 'note', value: `attempt ${i}` });
  assert.equal(s.trace.totalChanges, 150); assert.equal(s.trace.omittedChanges, 100);
  assert.deepEqual(s.trace.entries.slice(0, 20), head);
  assert.deepEqual(s.trace.entries.slice(20).map((e) => e.seq), Array.from({ length: 30 }, (_, i) => 121 + i));

  const repeats = session(); repeats.step(add());
  for (let i = 2; i <= 20; i++) repeats.step({ type: 'note', value: `head ${i}` });
  const id = repeats.board.objects[0].id;
  for (let i = 0; i < 7; i++) repeats.step({ type: 'moveMany', ids: [id], dx: 1, dy: 0 });
  for (let i = 0; i < 40; i++) repeats.step({ type: 'note', value: `tail ${i}` });
  assert.equal(repeats.trace.entries.length, 50);
  assert.equal(repeats.trace.omittedChanges, 17); // seven repeats + ten single entries
  assert.equal(repeats.trace.totalChanges, 67);
  assert.equal(repeats.trace.entries[20].seq, 38);
});

test('bounded Unicode notes, aliases and busy settings keep serialization below 64KiB', () => {
  const s = session(); s.step(add(100));
  const settings = M.defaultSettings();
  settings.defaults = settings.defaults.map((d) => ({ ...d, alias: '🍎'.repeat(30) }));
  for (let i = 0; i < 59; i++) {
    if (i % 3 === 0) s.step({ type: 'configure', settings: i % 2 ? M.defaultSettings() : settings, scope: 'future' });
    else s.step({ type: 'note', value: `${i} ` + '🍎'.repeat(240) });
  }
  assert.ok(Buffer.byteLength(T.serialize(s.trace), 'utf8') <= 65536);
  for (const e of s.trace.entries) assert.ok(Buffer.byteLength(JSON.stringify(e.facts), 'utf8') <= 850);
  assert.deepEqual(T.validate(JSON.parse(T.serialize(s.trace))), s.trace);
});

test('Unicode alias-only settings changes retain settings facts rather than just an omission marker', () => {
  const before = M.empty();
  const settings = M.defaultSettings();
  settings.defaults = settings.defaults.map((d) => ({ ...d, alias: '🍎'.repeat(30) }));
  const after = M.reduce(before, { type: 'configure', settings, scope: 'future' });
  const trace = T.record(T.empty(), before, after, { type: 'configure' }, 'system');
  assert.ok(fact(trace.entries[0], 'settings.defaults'));
  assert.ok(Buffer.byteLength(JSON.stringify(trace.entries[0].facts)) <= 850);
});

test('edits beyond bounded text prefixes still produce events', () => {
  const before = M.reduce(M.empty(), { type: 'note', value: 'a'.repeat(100) + 'first' });
  const after = M.reduce(before, { type: 'note', value: 'a'.repeat(100) + 'second' });
  const trace = T.record(T.empty(), before, after, { type: 'note' });
  assert.equal(trace.totalChanges, 1);
  assert.ok(fact(trace.entries[0], 'note').before.includes('first'));
  assert.ok(fact(trace.entries[0], 'note').after.includes('second'));
});

test('large totals remain exact decimal strings', () => {
  const before = M.empty(); const settings = M.defaultSettings();
  settings.levels = [{ value: Number.MAX_SAFE_INTEGER, color: 0 }];
  settings.defaults = settings.defaults.map((d) => ({ ...d, value: Number.MAX_SAFE_INTEGER }));
  const configured = M.reduce(before, { type: 'configure', settings, scope: 'future' });
  const after = M.reduce(configured, add(2));
  const trace = T.record(T.empty(), configured, after, add(2));
  assert.equal(fact(trace.entries[0], 'value').after, '18014398509481982');
});

test('strict validation rejects malformed envelopes, entry metadata, facts, accounting and gaps', () => {
  const s = session(); s.step(add()); const valid = s.trace;
  assert.deepEqual(T.validate(JSON.parse(T.serialize(valid))), valid);
  const mutations = [
    (v) => { v.kind = 'math-board'; }, (v) => { v.schemaVersion = 2; }, (v) => { v.priorUnknown = 1; },
    (v) => { v.extra = true; }, (v) => { v.totalChanges = 2; }, (v) => { v.omittedChanges = 1; },
    (v) => { v.entries[0].seq = 0; }, (v) => { v.entries[0].seq = 2; }, (v) => { v.entries[0].repeats = 0; },
    (v) => { v.entries[0].origin = 'teacher'; }, (v) => { v.entries[0].type = 'anything'; },
    (v) => { v.entries[0].timestamp = 123; }, (v) => { v.entries[0].facts = []; },
    (v) => { v.entries[0].facts[0].field = 'x'; }, (v) => { v.entries[0].facts[0].after = 'not a count'; },
    (v) => { v.entries[0].facts[0].after = Infinity; }, (v) => { v.entries[0].facts[0].before = -1; },
    (v) => { v.entries[0].facts[0].after = v.entries[0].facts[0].before; },
    (v) => { v.entries[0].facts.push(clone(v.entries[0].facts[0])); },
    (v) => { v.entries[0].facts[0].extra = true; },
    (v) => { v.entries[0].facts = [{ field: 'note', before: '', after: 'a'.repeat(61) }]; },
    (v) => { v.entries[0].facts = [{ field: 'objects', before: [], after: Array(7).fill('circle') }]; },
    (v) => { v.entries[0].facts = [{ field: 'value', before: 0, after: '0009007199254740992' }]; },
  ];
  for (const mutate of mutations) { const bad = clone(valid); mutate(bad); assert.throws(() => T.validate(bad), mutate.toString()); }
  for (const bad of [null, [], {}, 'bad JSON', { ...T.empty(), entries: null }, Object.assign(Object.create({}), valid)]) {
    assert.throws(() => T.validate(bad));
  }
  const badRepeat = clone(valid); badRepeat.entries.push({ ...clone(valid.entries[0]), seq: 2 }); badRepeat.totalChanges = 2;
  assert.throws(() => T.validate(badRepeat));
  const detached = T.validate(valid); detached.entries[0].facts[0].after = 77; assert.notDeepEqual(detached, valid);
  assert.throws(() => T.record(T.empty(), M.empty(), s.board, { type: 'wat' }));
  assert.throws(() => T.record(T.empty(), M.empty(), s.board, add(), 'teacher'));
  assert.throws(() => T.serialize({ ...T.empty(), totalChanges: -1 }));
});

test('persisted invalid localStorage can be handled safely by caller without mutating a board', () => {
  const load = (raw) => { try { return T.validate(JSON.parse(raw)); } catch { return T.empty(true); } };
  for (const raw of [null, '', '{broken', '{"kind":"math-board"}', '{"__proto__":{"polluted":true}}']) {
    assert.deepEqual(load(raw), T.empty(true));
  }
  assert.deepEqual(load(T.serialize(T.empty())), T.empty());
  assert.equal({}.polluted, undefined);
});
