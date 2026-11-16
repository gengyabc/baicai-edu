import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { createPracticeProgress } from '../shell/practice-progress.js';
import { createQuantityNotesChapter } from './practice-notes.js';

const M = createBoardModel(), T = createBoardTrace(M);
const emptyFrame = () => ({ board: M.empty(), trace: T.empty(), history: { past: [], future: [] },
  selection: [], zoom: 1, fit: true, attachTrace: true, toolValue: null, append: false, scroll: { left: 0, top: 0 } });
const chapter = () => createQuantityNotesChapter({ M, T, emptyFrame });
const whyKeys = ['notesDeselectExplain', 'notesEmptyExplain', 'notesBoardTarget', 'notesBoardRead', 'notesObjectTarget',
  'notesObjectCheck', 'notesGroupTarget', 'notesGroupRead', 'notesSelectionTarget', 'notesSelectionCheck',
  'notesCancelExplain', 'notesMiss', 'practiceInsertBlocked'];

/** A page-like driver. During the board-note step an object, group, or selection save is not committed. */
function driver(options = {}) {
  const c = options.chapter || chapter();
  const frame = c.start(options.previous === undefined ? null : options.previous);
  const goal = c.createGoal();
  const snap = () => goal.snapshot();
  const act = (action, extra = {}) => {
    const before = frame.board;
    const held = snap().step === 'notes-board' && action.type === 'annotate';
    let after = before;
    let rejected = false;
    if (!held) {
      try { after = M.reduce(before, action); } catch { rejected = true; }
      if (!rejected) frame.board = after;
    }
    if (held) return snap();
    const kind = action.type === 'note' ? 'board' : action.target;
    const ids = action.type === 'note' ? [] : action.target === 'selection' ? [...(action.ids || [])] : [action.id];
    return goal.observe({ type: rejected ? 'reject' : action.type, action, before, after: frame.board, target: kind, ids, ...extra });
  };
  const select = (ids) => { frame.selection = ids; return goal.observe({ type: 'select', selection: ids, after: frame.board }); };
  const open = (target, ids = [], value = '') => goal.observe({ type: 'open-note', target, ids, value, after: frame.board });
  const reach = (step) => {
    while (snap().step !== step) {
      const now = snap().step;
      const [first, second] = snap().targets;
      if (now === 'notes-deselect') select([]);
      else if (now === 'notes-board') act({ type: 'note', value: 'Whole board' });
      else if (now === 'notes-board-read') open('board', [], frame.board.note);
      else if (now === 'notes-object') act({ type: 'annotate', target: 'object', id: first, value: 'Just this one' });
      else if (now === 'notes-object-check') select([second]);
      else if (now === 'notes-group') act({ type: 'annotate', target: 'group', id: snap().groupId, value: 'The group' });
      else if (now === 'notes-group-read') {
        const members = frame.board.objects.filter((object) => object.groupId === snap().groupId).map((object) => object.id);
        const armed = members.length > 0 && members.every((id) => frame.selection.includes(id)) && frame.selection.length === members.length;
        if (!armed) { select(members); continue; }
        open('group', [snap().groupId], frame.board.groups.find((group) => group.id === snap().groupId).note);
      } else if (now === 'notes-selection') act({ type: 'annotate', target: 'selection', ids: [first, second], value: 'Both of them' });
      else break;
      assert.notEqual(snap().step, now, `student path to ${step} stalled at ${now}`);
    }
    return snap();
  };
  return { c, frame, goal, snap, act, select, open, reach };
}

test('clearing a prepared selection passes, and choosing another object does not', () => {
  const d = driver();
  assert.equal(d.snap().step, 'notes-deselect');
  assert.equal(d.c.id, 'quantity-notes');
  assert.ok(d.frame.selection.length > 0, 'an already-empty board is not the start of this step');
  assert.equal(d.frame.board.groups.length, 1, 'the chapter supplies a group before the group steps');
  assert.equal(d.frame.board.objects.filter((object) => !object.removed).length, 2);
  d.select([d.snap().targets[1]]);
  assert.equal(d.snap().step, 'notes-deselect', 'selecting a different object does not clear the selection');
  assert.equal(d.select([]).why, '');
  assert.equal(d.snap().step, 'notes-board');
  assert.equal(d.frame.board.note, '', 'the board note is not preset');
});

test('a board note is saved with nothing selected, then read back from that same card', () => {
  const d = driver();
  d.reach('notes-board');
  d.goal.observe({ type: 'cancel' });
  assert.equal(d.snap().step, 'notes-board', 'a cancelled overlay does not pass');
  d.act({ type: 'note', value: '' });
  assert.equal(d.snap().step, 'notes-board', 'an empty string does not pass');
  d.act({ type: 'note', value: '   ' });
  assert.equal(d.snap().step, 'notes-board', 'whitespace is not a note');
  d.act({ type: 'annotate', target: 'object', id: d.snap().targets[0], value: 'On the shape' });
  assert.equal(d.snap().step, 'notes-board', 'an object note is not the board note');
  assert.equal(d.frame.board.note.trim(), '', 'the object note did not become the board note');
  assert.equal(d.frame.board.objects.find((object) => object.id === d.snap().targets[0]).note, '');
  const beforeAdd = d.frame.board.objects.length;
  d.act({ type: 'add', shape: 'star' });
  const added = d.frame.board.objects.find((object) => !d.snap().targets.includes(object.id) && object.shape === 'star');
  assert.equal(d.frame.board.objects.length, beforeAdd + 1);
  const notesOf = () => JSON.stringify({
    note: d.frame.board.note,
    objects: d.frame.board.objects.map((object) => [object.id, object.note]),
    groups: d.frame.board.groups.map((group) => [group.id, group.note]),
    notes: d.frame.board.notes,
  });
  const beforeStolen = notesOf();
  d.act({ type: 'annotate', target: 'object', id: added.id, value: 'Stolen' });
  assert.equal(d.snap().step, 'notes-board', 'adding an object and then saving does not pass');
  assert.equal(d.frame.board.note, JSON.parse(beforeStolen).note, 'add-then-note does not change the board note');
  assert.equal(d.frame.board.objects.find((object) => object.id === added.id).note, '', 'add-then-note does not store an object note');
  d.act({ type: 'annotate', target: 'group', id: d.snap().groupId, value: 'Grouped' });
  assert.equal(d.snap().step, 'notes-board', 'a group note does not pass the board step');
  d.act({ type: 'annotate', target: 'selection', ids: [...d.snap().targets], value: 'Pair' });
  assert.equal(d.snap().step, 'notes-board', 'a selection note does not pass the board step');
  assert.equal(notesOf(), beforeStolen, 'object, group, and selection notes stay unchanged');
  d.act({ type: 'note', value: 'Whole board' });
  assert.equal(d.snap().step, 'notes-board-read');
  assert.equal(d.frame.board.note, 'Whole board');
  assert.equal(d.snap().boardNote, 'Whole board');
  d.open('object', [d.snap().targets[0]], 'On the shape');
  assert.equal(d.snap().step, 'notes-board-read', 'opening an object card does not read the board note');
  d.open('group', [d.snap().groupId], 'Grouped');
  assert.equal(d.snap().step, 'notes-board-read', 'opening a group card does not read the board note');
  d.open('board', [], 'Something else');
  assert.equal(d.snap().step, 'notes-board-read', 'a different card value does not pass');
  assert.equal(d.open('board', [], 'Whole board').why, '');
  assert.equal(d.snap().step, 'notes-object');
  const resumed = d.c.createGoal(d.snap());
  assert.equal(resumed.snapshot().step, 'notes-object', 'resuming does not credit the next write');
  assert.equal(resumed.snapshot().boardNote, 'Whole board', 'a resumed step keeps the earlier note');
});

test('an object note stays on the marked object when another object is selected', () => {
  const d = driver();
  d.reach('notes-object');
  d.act({ type: 'annotate', target: 'object', id: d.snap().targets[0], value: '' });
  assert.equal(d.snap().step, 'notes-object', 'empty text does not pass');
  d.act({ type: 'annotate', target: 'object', id: d.snap().targets[1], value: 'Other' });
  assert.equal(d.snap().step, 'notes-object', 'saving on a different object does not pass');
  d.act({ type: 'note', value: 'Board instead' });
  assert.equal(d.snap().step, 'notes-object', 'a board note does not pass the object step');
  d.act({ type: 'annotate', target: 'group', id: d.snap().groupId, value: 'Group instead' });
  assert.equal(d.snap().step, 'notes-object', 'a group note does not pass the object step');
  d.act({ type: 'annotate', target: 'object', id: d.snap().targets[0], value: 'Just this one' });
  assert.equal(d.snap().step, 'notes-object-check');
  assert.equal(d.frame.board.objects.find((object) => object.id === d.snap().targets[0]).note, 'Just this one');
  d.select([d.snap().targets[0]]);
  assert.equal(d.snap().step, 'notes-object-check', 'selecting the marked object again does not check the other one');
  d.frame.board = M.reduce(d.frame.board, { type: 'annotate', target: 'object', id: d.snap().targets[1], value: 'Just this one' });
  d.select([d.snap().targets[1]]);
  assert.equal(d.snap().step, 'notes-object-check', 'the other object must not already show the marked text');
  d.frame.board = M.reduce(d.frame.board, { type: 'annotate', target: 'object', id: d.snap().targets[1], value: '' });
  assert.equal(d.select([d.snap().targets[1]]).why, '');
  assert.equal(d.snap().step, 'notes-group');
  assert.equal(d.frame.board.objects.find((object) => object.id === d.snap().targets[0]).note, 'Just this one');
  assert.notEqual(d.frame.board.objects.find((object) => object.id === d.snap().targets[1]).note, 'Just this one');
});

test('a group note is not a member note, and selecting the group again shows it', () => {
  const d = driver();
  d.reach('notes-group');
  assert.ok(d.frame.board.groups.some((group) => group.id === d.snap().groupId), 'the group already exists');
  d.act({ type: 'annotate', target: 'object', id: d.snap().targets[0], value: 'Member only' });
  assert.equal(d.snap().step, 'notes-group', 'a member note is not the group note');
  d.act({ type: 'note', value: 'Board instead' });
  assert.equal(d.snap().step, 'notes-group', 'a board note is not the group note');
  d.act({ type: 'annotate', target: 'group', id: d.snap().groupId, value: '' });
  assert.equal(d.snap().step, 'notes-group', 'an empty group note does not pass');
  d.act({ type: 'annotate', target: 'group', id: d.snap().groupId, value: 'The group' });
  assert.equal(d.snap().step, 'notes-group-read');
  assert.equal(d.frame.board.groups.find((group) => group.id === d.snap().groupId).note, 'The group');
  const members = d.frame.board.objects.filter((object) => object.groupId === d.snap().groupId).map((object) => object.id);
  d.open('object', [d.snap().targets[0]], 'Member only');
  assert.equal(d.snap().step, 'notes-group-read', 'opening a member card does not read the group note');
  d.open('group', [d.snap().groupId], 'The group');
  assert.equal(d.snap().step, 'notes-group-read', 'opening the group card before selecting the group again does not pass');
  d.select([d.snap().targets[0]]);
  assert.equal(d.snap().step, 'notes-group-read', 'one member is not the whole group');
  d.select(members);
  assert.equal(d.snap().step, 'notes-group-read', 'selecting the group is not yet opening its note');
  assert.equal(d.open('group', [d.snap().groupId], 'The group').why, '');
  assert.equal(d.snap().step, 'notes-selection');
});

test('a selection note stays on the marked set and is not shown for another target', () => {
  const d = driver();
  d.reach('notes-selection');
  const [first, second] = d.snap().targets;
  d.act({ type: 'note', value: 'Board instead' });
  assert.equal(d.snap().step, 'notes-selection', 'the board does not pass the selection step');
  d.act({ type: 'annotate', target: 'object', id: first, value: 'Only one' });
  assert.equal(d.snap().step, 'notes-selection', 'a single object does not pass');
  const third = d.act({ type: 'add', shape: 'star' }).after
    ? d.frame.board.objects.find((object) => object.shape === 'star').id
    : d.frame.board.objects.find((object) => object.shape === 'star').id;
  d.act({ type: 'annotate', target: 'selection', ids: [first, third], value: 'Different pair' });
  assert.equal(d.snap().step, 'notes-selection', 'a different selection is not the marked set');
  d.act({ type: 'annotate', target: 'selection', ids: [second, first], value: '' });
  assert.equal(d.snap().step, 'notes-selection', 'an empty selection note does not pass');
  d.act({ type: 'annotate', target: 'selection', ids: [second, first], value: 'Both of them' });
  assert.equal(d.snap().step, 'notes-selection-check');
  assert.equal(d.frame.board.notes.find((note) => note.objectIds.includes(first) && note.objectIds.includes(second)).text, 'Both of them');
  d.open('selection', [first, second], 'Both of them');
  assert.equal(d.snap().step, 'notes-selection-check', 'opening the marked set again is not a different target');
  d.open('object', [first], 'Only one');
  assert.equal(d.snap().step, 'notes-selection-check', 'a single object is not the check');
  d.open('selection', [first, third], 'Different pair');
  assert.equal(d.snap().step, 'complete', 'a different pair that does not show the marked text passes');
  assert.equal(d.frame.board.notes.find((note) => note.objectIds.includes(first) && note.objectIds.includes(second)).text, 'Both of them');
  assert.equal(d.snap().completed, true);
});

test('opening the board with nothing selected also checks that the selection note stayed put', () => {
  const d = driver();
  d.reach('notes-selection-check');
  assert.notEqual(d.frame.board.note, 'Both of them');
  assert.equal(d.open('board', [], d.frame.board.note).why, '');
  assert.equal(d.snap().completed, true);
  const marked = d.frame.board.notes.find((note) => note.text === 'Both of them');
  assert.ok(marked && marked.objectIds.length >= 2);
});

test('preset and restored note text do not satisfy the step that asks the student to write it', () => {
  const d = driver();
  d.reach('notes-board');
  d.frame.board = M.reduce(d.frame.board, { type: 'note', value: 'Already there' });
  d.goal.observe({ type: 'note', action: { type: 'note', value: 'Already there' }, target: 'board',
    before: d.frame.board, after: d.frame.board });
  assert.equal(d.snap().step, 'notes-board', 'saving the same preset text does not pass');
  const saved = d.snap();
  const restored = d.c.createGoal(saved);
  assert.equal(restored.snapshot().step, 'notes-board');
  assert.equal(restored.snapshot().boardNote, '', 'the write step does not resume as already written');
  d.act({ type: 'note', value: 'Whole board' });
  assert.equal(d.snap().step, 'notes-board-read');
  const read = d.c.createGoal(d.snap());
  assert.equal(read.snapshot().step, 'notes-board-read', 'restoring the read step does not open the card');
  assert.equal(read.snapshot().boardNote, 'Whole board');
});

test('skip and reset prepare the next step without completing the note it asks for', () => {
  const storage = new Map();
  const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const realKey = 'baicai-edu-math-board:v4:session';
  storage.set(realKey, M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'house', count: 2 })));
  let progress = createPracticeProgress({ mode: 'quantity', chapters: [chapter()], storage: adapter });
  let state = progress.enter();
  const starts = [];
  for (let index = 0; index < chapter().steps.length; index += 1) {
    assert.equal(state.goal.index, index);
    starts.push(JSON.stringify(state.frame));
    const goal = chapter().createGoal(state.goal);
    assert.equal(goal.snapshot().step, state.goal.step);
    progress.saveFrame({ ...state.frame, board: M.reduce(state.frame.board, { type: 'add', shape: 'triangle' }) });
    state = progress.reset();
    assert.equal(JSON.stringify(state.frame), starts[index], `step ${index} resets to its own start`);
    assert.equal(state.goal.step, chapter().steps[index], 'reset does not complete the step');
    if (state.goal.step === 'notes-deselect') assert.ok(state.frame.selection.length > 0);
    if (state.goal.step === 'notes-board' || state.goal.step === 'notes-board-read') assert.deepEqual(state.frame.selection, []);
    if (state.goal.step === 'notes-board') assert.equal(state.frame.board.note, '', 'skip into the board note does not write it');
    if (state.goal.step === 'notes-board-read') assert.equal(state.frame.board.note, state.goal.boardNote);
    if (state.goal.step === 'notes-object') assert.equal(state.frame.board.objects.find((object) => object.id === state.goal.targets[0]).note, '');
    if (state.goal.step === 'notes-object-check') {
      const [first, second] = state.goal.targets;
      assert.equal(state.frame.board.objects.find((object) => object.id === first).note, state.goal.objectNote);
      assert.notEqual(state.frame.board.objects.find((object) => object.id === second).note, state.goal.objectNote);
    }
    if (state.goal.step === 'notes-group' || state.goal.step === 'notes-group-read') {
      assert.ok(state.frame.board.groups.some((group) => group.id === state.goal.groupId), 'a group exists before the group steps');
    }
    if (state.goal.step === 'notes-group') assert.equal(state.frame.board.groups.find((group) => group.id === state.goal.groupId).note, '');
    if (state.goal.step === 'notes-group-read') {
      assert.equal(state.frame.board.groups.find((group) => group.id === state.goal.groupId).note, state.goal.groupNote);
    }
    if (state.goal.step === 'notes-selection' || state.goal.step === 'notes-selection-check') {
      assert.ok(state.goal.targets.every((id) => state.frame.board.objects.some((object) => object.id === id && !object.removed)));
      assert.ok(state.goal.targets.every((id) => !state.frame.board.objects.find((object) => object.id === id).groupId),
        'the marked objects are free so a selection note is not captured by a group');
    }
    if (state.goal.step === 'notes-selection') {
      assert.equal(state.frame.board.notes.some((note) => note.text === state.goal.selectionNote && state.goal.selectionNote), false);
    }
    state = progress.skip();
    assert.equal(state.goal.index, index + 1);
    progress = createPracticeProgress({ mode: 'quantity', chapters: [chapter()], storage: adapter });
    state = progress.enter();
  }
  assert.equal(state.goal.completed, true);
  assert.equal(JSON.parse(storage.get(realKey)).objects.length, 2, 'practice never writes the real draft key');
  assert.ok(![...storage.keys()].some((key) => key.startsWith('baicai-edu-math-board:v4') && key !== realKey));
});

test('the notes goal is refused rather than repaired when its saved state is inconsistent', () => {
  const c = chapter();
  const base = { index: 0, targets: ['a', 'b'], groupId: 'group-1', boardNote: '', objectNote: '', groupNote: '', selectionNote: '', selectionIds: ['a', 'b'] };
  assert.throws(() => c.createGoal({ ...base, targets: ['a'] }), /Invalid notes goal/);
  assert.throws(() => c.createGoal({ ...base, targets: ['a', 'a'] }), /Invalid notes goal/);
  assert.throws(() => c.createGoal({ ...base, index: 2, boardNote: '' }), /Invalid notes goal/);
  assert.throws(() => c.createGoal({ ...base, index: 4, boardNote: 'Board', objectNote: ' ' }), /Invalid notes goal/);
  assert.throws(() => c.createGoal({ ...base, index: 6, boardNote: 'Board', objectNote: 'Object', groupNote: '' }), /Invalid notes goal/);
  assert.throws(() => c.createGoal({ ...base, index: 8, boardNote: 'Board', objectNote: 'Object', groupNote: 'Group', selectionNote: '' }), /Invalid notes goal/);
  assert.throws(() => c.createGoal({ ...base, index: 99 }), /Invalid notes goal/);
  assert.throws(() => c.createGoal({ ...base, groupId: '' }), /Invalid notes goal/);
  assert.equal(c.createGoal({ ...base, index: 3, boardNote: 'Kept' }).snapshot().step, 'notes-object');
  assert.equal(c.createGoal({ ...base, index: 3, boardNote: 'Kept' }).snapshot().boardNote, 'Kept');
});

test('a fresh start reuses a usable group and objects, and otherwise creates two objects and one group', () => {
  const previous = emptyFrame();
  previous.board = M.reduce(previous.board, { type: 'add', shape: 'cat', count: 3 });
  const ids = previous.board.objects.map((object) => object.id);
  previous.board = M.reduce(previous.board, { type: 'update', id: ids[0], patch: { removed: true } });
  previous.board = M.reduce(previous.board, { type: 'groupSelected', ids: [ids[1], ids[2]], alias: 'Kept' });
  previous.board = M.reduce(previous.board, { type: 'note', value: 'Old board' });
  const keptGroup = previous.board.objects.find((object) => object.id === ids[1]).groupId;
  const c = chapter();
  const frame = c.start(previous);
  const saved = c.createGoal().snapshot();
  assert.equal(frame.board.objects.length, previous.board.objects.length, 'usable objects are reused, not rebuilt');
  assert.deepEqual(saved.targets, [ids[1], ids[2]]);
  assert.equal(saved.groupId, keptGroup, 'the existing group is reused');
  assert.equal(frame.board.groups.length, 1);
  assert.equal(saved.step, 'notes-deselect');
  assert.equal(frame.board.note, '', 'a preset board note is not the note this chapter asks for');
  assert.ok(!frame.board.objects.find((object) => object.id === ids[0] && saved.targets.includes(ids[0])), 'a crossed-out object is not a target');
  const bare = chapter();
  const started = bare.start(null);
  const seeded = bare.createGoal().snapshot();
  assert.equal(started.board.objects.length, 2);
  assert.equal(started.board.groups.length, 1);
  assert.equal(started.selection.length, 2);
  assert.deepEqual(seeded.targets, started.board.objects.map((object) => object.id));
  const catalogue = chapter().fresh();
  assert.equal(catalogue.frame.board.objects.length, 2);
  assert.equal(catalogue.frame.board.groups.length, 1);
  assert.equal(chapter().createGoal(catalogue.saved).snapshot().step, 'notes-deselect');
  assert.ok(catalogue.frame.board.objects.every((object) => object.shape !== 'house'));
});

test('goal and failure copy exist in both languages and describe an unchecked note', async () => {
  const locales = {};
  for (const language of ['en', 'zh']) locales[language] = JSON.parse(await readFile(new URL(`../../locale/${language}.json`, import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(locales.en).sort(), Object.keys(locales.zh).sort());
  const goals = chapter().steps.map((step) => `practiceGoal_${step}`);
  for (const key of ['practiceNotes', ...goals, ...whyKeys]) {
    assert.equal(typeof locales.en[key], 'string', key);
    assert.equal(typeof locales.zh[key], 'string', key);
  }
  for (const key of goals) {
    assert.match(locales.en[key], /your own words/i);
    assert.match(locales.en[key], /not a checked math conclusion/i);
    assert.match(locales.en[key], /current selection/i);
    assert.match(locales.zh[key], /自己的话/);
    assert.match(locales.zh[key], /不是已核对的数学结论/);
    assert.match(locales.zh[key], /当前选择/);
  }
});

test('an unchanged or rejected note does not advance, and insert never does', () => {
  const d = driver();
  d.reach('notes-board');
  const rejected = d.act({ type: 'note', value: '字'.repeat(501) });
  assert.equal(rejected.why, 'notesBoardTarget', 'a note the model rejects is not a committed board note');
  assert.equal(d.snap().step, 'notes-board');
  assert.equal(d.frame.board.note, '');
  d.goal.observe({ type: 'insert' });
  assert.equal(d.snap().step, 'notes-board');
  assert.equal(d.goal.observe({ type: 'insert' }).why, 'practiceInsertBlocked');
});
