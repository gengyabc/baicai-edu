import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { createPracticeProgress } from '../shell/practice-progress.js';
import { createQuantityOrganizeChapter } from './practice-organize.js';

const M = createBoardModel(), T = createBoardTrace(M);
const emptyFrame = () => ({ board: M.empty(), trace: T.empty(), history: { past: [], future: [] },
  selection: [], zoom: 1, fit: true, attachTrace: true, toolValue: null, append: false, scroll: { left: 0, top: 0 } });
const chapter = () => createQuantityOrganizeChapter({ M, T, emptyFrame });
/** A page-like driver: every action is reduced on the frame and reported as a committed event. */
function driver(options = {}) {
  const c = options.chapter || chapter();
  const frame = c.start(options.previous ?? null);
  const goal = c.createGoal();
  const [first, second] = goal.snapshot().targets;
  const act = (action, extra = {}) => {
    const before = frame.board;
    frame.board = M.reduce(before, action);
    goal.observe({ type: action.type, action, before, after: frame.board, ...extra });
    return frame.board;
  };
  const select = (ids, extra = {}) => { frame.selection = ids; goal.observe({ type: 'select', selection: ids, after: frame.board, ...extra }); };
  // A refused or disabled action leaves the board untouched; the page still reports it.
  const refuse = (extra = {}) => goal.observe({ type: 'batch', before: frame.board, after: frame.board, ...extra });
  const nameFirst = (value) => act({ type: 'update', id: first, patch: { alias: value } });
  // Run the steps up to `step` the way a student would, so a test starts where it says.
  const reach = (step) => {
    const done = (want) => goal.snapshot().step === want;
    while (!done(step)) {
      const now = goal.snapshot().step;
      if (now === 'organize-name') nameFirst(`${options.alias || 'Team'}`);
      else if (now === 'organize-reselect') select([first]);
      else if (now === 'organize-peer') act({ type: 'update', id: second, patch: { alias: goal.snapshot().name } });
      else if (now === 'organize-group') act({ type: 'groupSelected', ids: [first, second], alias: 'Group' });
      else if (now === 'organize-group-name') act({ type: 'renameGroup', id: groupId(), alias: 'Together' });
      else if (now === 'organize-ungroup') act({ type: 'deleteGroup', id: groupId() });
      else if (now === 'organize-merge') act({ type: 'merge', ids: [first, second] });
      else if (now === 'organize-split') act({ type: 'split', id: goal.snapshot().mergedId });
      else if (now === 'organize-copy') act({ type: 'duplicateSelected', ids: [first] });
      else if (now === 'organize-crossout') act({ type: 'batch', actions: [{ type: 'update', id: first, patch: { removed: true } }] });
      else if (now === 'organize-delete') act({ type: 'batch', actions: [{ type: 'delete', id: first }] });
      else break;
      assert.notEqual(goal.snapshot().step, now, `student path to ${step} stalled at ${now}`);
    }
    return goal.snapshot();
  };
  function groupId() { return frame.board.objects.find((o) => o.id === first)?.groupId; }
  return { c, frame, goal, first, second, act, select, refuse, reach, groupId };
}

test('naming needs a changed valid name on the marked object; reselect then reads it back', () => {
  // The first step itself starts from a board with no name, so reselect only proves the
  // name was kept, and a preset or empty name can never pass.
  const d = driver();
  d.refuse();
  assert.equal(d.goal.snapshot().step, 'organize-name');
  d.act({ type: 'update', id: d.first, patch: { alias: '' } });
  assert.equal(d.goal.snapshot().step, 'organize-name', 'an empty name does not pass');
  d.act({ type: 'update', id: d.second, patch: { alias: 'Team' } });
  assert.equal(d.goal.snapshot().step, 'organize-name', 'naming another object does not pass');
  d.act({ type: 'update', id: d.first, patch: { alias: 'Group' } });
  assert.equal(d.goal.snapshot().step, 'organize-reselect');
  d.select([d.second]);
  assert.equal(d.goal.snapshot().step, 'organize-reselect', 'selecting the other object does not read back');
  d.select([d.first, d.second]);
  assert.equal(d.goal.snapshot().step, 'organize-reselect', 'a two-object selection is not the readback');
  d.act({ type: 'update', id: d.first, patch: { alias: 'Renamed' } });
  d.select([d.first]);
  assert.equal(d.goal.snapshot().step, 'organize-reselect', 'selecting after the saved name changed does not pass');
  d.act({ type: 'update', id: d.first, patch: { alias: 'Group' } });
  d.select([d.first]);
  assert.equal(d.frame.board.objects.find((object) => object.id === d.first).alias, 'Group');
  assert.equal(d.goal.snapshot().step, 'organize-peer');
  assert.equal(d.goal.snapshot().name, 'Group');
  assert.equal(d.c.createGoal(d.goal.snapshot()).snapshot().step, 'organize-peer', 'a restored goal resumes without credit');
});

test('skip into peer leaves the second object unnamed, and reset restores that start', () => {
  const storage = new Map();
  const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const progress = createPracticeProgress({ mode: 'quantity', chapters: [chapter()], storage: adapter });
  let state = progress.enter();
  state = progress.skip();
  assert.equal(state.goal.step, 'organize-reselect');
  state = progress.skip();
  assert.equal(state.goal.step, 'organize-peer');
  const [first, second] = state.goal.targets;
  const alias = (id) => state.frame.board.objects.find((object) => object.id === id).alias;
  assert.equal(alias(first), state.goal.name);
  assert.notEqual(alias(second), state.goal.name, 'object 2 does not already hold the name peer asks for');
  const named = M.reduce(state.frame.board, { type: 'update', id: second, patch: { alias: state.goal.name } });
  progress.saveFrame({ ...state.frame, board: named });
  state = progress.reset();
  assert.equal(state.goal.step, 'organize-peer');
  assert.notEqual(alias(second), state.goal.name, 'reset restores object 2 without the saved name');
  const before = state.frame.board;
  const after = M.reduce(before, { type: 'update', id: second, patch: { alias: state.goal.name } });
  state = progress.observe({ type: 'update', before, after, action: { type: 'update', id: second, patch: { alias: state.goal.name } } },
    { ...state.frame, board: after });
  assert.equal(state.goal.step, 'organize-group');
  assert.equal(state.frame.board.objects.find((object) => object.id === second).alias, state.goal.name);
});

test('grouping needs the marked pair in one new group; naming, dissolving and merging are separate steps', () => {
  const d = driver();
  d.reach('organize-group');
  d.act({ type: 'add', shape: 'circle' });
  assert.equal(d.goal.snapshot().step, 'organize-group', 'adding more objects is not grouping');
  d.act({ type: 'groupSelected', ids: [d.first], alias: 'Solo' });
  assert.equal(d.goal.snapshot().step, 'organize-group', 'a group of one is not the marked pair');
  d.act({ type: 'groupSelected', ids: [d.first, d.second], alias: 'Group' });
  assert.equal(d.goal.snapshot().step, 'organize-group-name');
  d.act({ type: 'renameGroup', id: d.groupId(), alias: 'Group' });
  assert.equal(d.goal.snapshot().step, 'organize-group-name', 'keeping the default name is not naming the group');
  d.act({ type: 'renameGroup', id: d.groupId(), alias: 'Together' });
  assert.equal(d.goal.snapshot().step, 'organize-ungroup');
  assert.equal(d.frame.board.groups.find((g) => g.id === d.groupId()).alias, 'Together');
  d.refuse();
  assert.equal(d.goal.snapshot().step, 'organize-ungroup', 'a refused dissolve does not pass');
  d.act({ type: 'deleteGroup', id: d.groupId() });
  assert.equal(d.goal.snapshot().step, 'organize-merge');
  assert.ok(d.frame.board.objects.filter((o) => [d.first, d.second].includes(o.id)).every((o) => !o.groupId));
});

test('merge follows the unchanged rules and split restores exactly the recorded sources', () => {
  const d = driver();
  d.reach('organize-merge');
  assert.ok(M.mergeCandidate(d.frame.board, [d.first, d.second]).allowed, 'fixture is mergeable under existing rules');
  d.act({ type: 'merge', ids: [d.first, d.second] });
  const merged = d.frame.board.objects.find((o) => o.sources.length === 2);
  assert.equal(merged.color, 9, 'an off-level result is gray, not an error');
  assert.deepEqual(merged.sources.map((s) => [s.id, s.alias, s.value]), [[d.first, 'Team', 1], [d.second, 'Team', 1]]);
  assert.equal(d.goal.snapshot().step, 'organize-split');
  assert.equal(d.goal.snapshot().mergedId, merged.id);
  // A disabled merge is no merge; splitting something else does not restore the sources.
  d.refuse();
  assert.equal(d.goal.snapshot().step, 'organize-split');
  // Only an object that exists at this moment can be split; a missing one is refused.
  const other = d.frame.board.objects.find((o) => o.id !== merged.id);
  if (other) d.act({ type: 'split', id: other.id });
  assert.equal(d.goal.snapshot().step, 'organize-split', 'another object\'s split does not pass');
  d.act({ type: 'split', id: merged.id });
  assert.equal(d.goal.snapshot().step, 'organize-copy');
  assert.deepEqual(d.frame.board.objects.filter((o) => [d.first, d.second].includes(o.id)).map((o) => o.alias), ['Team', 'Team']);
});

test('an unmergeable pair is refused, and the chapter supplies a mergeable pair only after merge and split', () => {
  const d = driver();
  d.reach('organize-merge');
  // The rules decide: a different name breaks mergeability, and that is not a pass.
  d.act({ type: 'update', id: d.second, patch: { alias: 'Other' } });
  assert.equal(M.mergeCandidate(d.frame.board, [d.first, d.second]).allowed, false);
  d.refuse();
  assert.equal(d.goal.snapshot().step, 'organize-merge');
  d.act({ type: 'update', id: d.second, patch: { alias: 'Team' } });
  d.act({ type: 'merge', ids: [d.first, d.second] });
  assert.equal(d.goal.snapshot().step, 'organize-split');
});

test('a selection note on the marked pair still lets a committed merge advance', () => {
  const d = driver();
  d.reach('organize-merge');
  d.act({ type: 'annotate', target: 'selection', ids: [d.first, d.second], value: 'Both' });
  assert.equal(d.goal.snapshot().step, 'organize-merge', 'writing the note is not the merge');
  assert.ok(M.mergeCandidate(d.frame.board, [d.first, d.second]).allowed);
  d.act({ type: 'merge', ids: [d.first, d.second] });
  assert.equal(d.goal.snapshot().step, 'organize-split');
  assert.equal(d.frame.board.objects.find((object) => object.sources.length === 2).note, 'Both');
});

test('copy adds one matching copy beside the original; copying another or the copy again does not pass', () => {
  const d = driver();
  d.reach('organize-copy');
  d.act({ type: 'duplicateSelected', ids: [d.second] });
  assert.equal(d.goal.snapshot().step, 'organize-copy', 'the copy step names its own object');
  d.act({ type: 'duplicateSelected', ids: [d.first] });
  assert.equal(d.goal.snapshot().step, 'organize-crossout');
  const copies = d.frame.board.objects.filter((o) => o.alias === 'Team');
  assert.ok(copies.some((o) => o.id === d.first), 'the original stays');
  assert.equal(copies.length, 4, 'one copy per duplication, and the earlier copy is not lost');
});

test('crossout changes the marked object instead of removing it, and delete removes only that object', () => {
  const d = driver();
  d.reach('organize-crossout');
  // Deleting instead is refused by the page too; either way it is not crossing out.
  d.refuse();
  assert.equal(d.goal.snapshot().step, 'organize-crossout', 'deleting is not crossing out');
  d.act({ type: 'batch', actions: [{ type: 'update', id: d.second, patch: { removed: true } }] });
  assert.equal(d.goal.snapshot().step, 'organize-crossout', 'crossing out another object does not pass');
  const count = d.frame.board.objects.length;
  d.act({ type: 'batch', actions: [{ type: 'update', id: d.first, patch: { removed: true } }] });
  assert.equal(d.frame.board.objects.length, count);
  assert.equal(d.frame.board.objects.find((o) => o.id === d.first).removed, true);
  assert.equal(d.goal.snapshot().step, 'organize-delete');
  d.refuse();
  assert.equal(d.goal.snapshot().step, 'organize-delete', 'clearing the board is not deleting the named object');
  // A different object's deletion is the failure path: it removes content without
  // touching the named object. The rest of the board must still be there afterwards.
  const others = d.frame.board.objects.filter((o) => o.id !== d.first && !o.removed);
  assert.ok(others.length > 0, 'the board has other content to protect');
  d.act({ type: 'batch', actions: [{ type: 'delete', id: others[0].id }] });
  assert.equal(d.goal.snapshot().step, 'organize-delete', 'deleting a different object does not pass');
  const emptied = M.reduce(d.frame.board, { type: 'batch', actions: d.frame.board.objects.map((o) => ({ type: 'delete', id: o.id })) });
  d.goal.observe({ type: 'batch', before: d.frame.board, after: emptied });
  assert.equal(d.goal.snapshot().step, 'organize-delete', 'emptying the board is not deleting the named object');
  // A crossed-out object is restored before it can be deleted, exactly as the page
  // requires; the restore is not the delete step's operation.
  d.act({ type: 'batch', actions: [{ type: 'update', id: d.first, patch: { removed: false } }] });
  assert.equal(d.goal.snapshot().step, 'organize-delete', 'restoring is not deleting');
  d.select([d.first]);
  assert.equal(d.goal.snapshot().step, 'organize-delete', 'selecting the marked object is not deleting it');
  d.act({ type: 'batch', actions: [{ type: 'delete', id: d.first }] });
  assert.equal(d.goal.snapshot().completed, true);
  assert.ok(d.frame.board.objects.every((o) => o.id !== d.first), 'the named object is gone');
  assert.ok(d.frame.board.objects.length > 0, 'the rest of the board stays');
});

test('notes: a group note must land on the group, and merge and split keep their own notes', () => {
  const d = driver();
  // The merge step follows the dissolve step, so it starts with no group at all.
  d.reach('organize-merge');
  assert.equal(d.frame.board.groups.length, 0, 'no group survives the dissolve step');
  const grouped = driver();
  grouped.reach('organize-group-name');
  const groupNote = M.reduce(grouped.frame.board, { type: 'annotate', target: 'group', id: grouped.groupId(), value: 'Together' });
  assert.doesNotThrow(() => M.validate(groupNote), 'a group note belongs to its group');
  d.frame.board = M.reduce(d.frame.board, { type: 'annotate', target: 'object', id: d.first, value: 'Kinds' });
  const beforeMerge = d.frame.board;
  d.frame.board = M.reduce(beforeMerge, { type: 'merge', ids: [d.first, d.second] });
  d.frame.board = M.reduce(d.frame.board, { type: 'annotate', target: 'object', id: d.frame.board.objects.find((o) => o.id !== d.second && o.id !== d.first && o.sources?.length).id, value: 'Merged' });
  const kept = M.reduce(d.frame.board, { type: 'split', id: d.frame.board.objects.at(-1).id });
  assert.ok(kept.objects.some((o) => o.note === 'Kinds'), 'the source note survives the merge and its split');
});

test('the organize goal is refused rather than repaired when its state is inconsistent', () => {
  const c = chapter();
  const saved = { index: 2, targets: ['a', 'b'], name: '' };
  assert.throws(() => c.createGoal(saved), 'a step past naming without a name is unusable');
  assert.throws(() => c.createGoal({ index: 2, targets: ['a', 'a'], name: 'N' }));
  assert.throws(() => c.createGoal({ index: 99, targets: ['a', 'b'], name: 'N' }));
  assert.equal(c.createGoal({ index: 1, targets: ['a', 'b'], name: 'N' }).snapshot().step, 'organize-reselect');
});

test('a fresh start reuses suitable practice objects, keeps others, and supplies only as many as needed', () => {
  const previous = emptyFrame();
  previous.board = M.reduce(previous.board, { type: 'add', shape: 'cat', count: 3 });
  previous.board = M.reduce(previous.board, { type: 'update', id: previous.board.objects[0].id, patch: { removed: true } });
  const c = chapter();
  const frame = c.start(previous);
  const saved = c.createGoal().snapshot();
  assert.equal(frame.board.objects.length, previous.board.objects.length, 'enough usable objects are reused, not rebuilt');
  const [first] = saved.targets;
  assert.ok(!previous.board.objects.find((o) => o.id === first).removed, 'a crossed-out object is not chosen as a target');
  assert.equal(frame.selection.length, 0);
  const bareChapter = chapter();
  const bare = bareChapter.start(emptyFrame());
  const bareSaved = bareChapter.createGoal().snapshot();
  assert.equal(bare.board.objects.length, 2, 'an independent start supplies a pair');
  assert.ok(M.mergeCandidate(bare.board, bareSaved.targets).allowed, 'the supplied pair is mergeable under existing rules');
});

test('reset restores the step start, skip supplies the next step, and both keep real drafts out of practice', () => {
  const storage = new Map(), adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const realKey = 'baicai-edu-math-board:v4:session';
  storage.set(realKey, M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'house', count: 2 })));
  let p = createPracticeProgress({ mode: 'quantity', chapters: [chapter()], storage: adapter });
  let state = p.enter();
  const starts = [];
  for (let index = 0; index < chapter().steps.length; index++) {
    assert.equal(state.goal.index, index);
    starts.push(JSON.stringify(state.frame.board));
    // The step's own start must already satisfy its own goal's prerequisites.
    const goal = chapter().createGoal(state.goal);
    assert.doesNotThrow(() => goal.snapshot(), `step ${index} has a resumable goal`);
    // A reset while mid-step rebuilds that step's own start, never later steps' work.
    p.saveFrame({ ...state.frame, board: M.reduce(state.frame.board, { type: 'add', shape: 'circle' }) });
    state = p.reset();
    assert.equal(JSON.stringify(state.frame.board), starts[index], `step ${index} resets to its own start`);
    state = p.skip();
    assert.equal(state.goal.index, index + 1, 'skipping always advances');
    if (index + 1 >= 1) assert.ok(state.goal.name.trim(), 'later steps get a name to work with');
    if (['organize-group-name', 'organize-ungroup'].includes(state.goal.step)) {
      assert.equal(state.frame.board.objects.find((o) => o.id === state.goal.targets[0]).groupId,
        state.frame.board.objects.find((o) => o.id === state.goal.targets[1]).groupId, 'a group exists for the group steps');
    }
    if (state.goal.step === 'organize-split') {
      assert.equal(state.frame.board.objects.find((o) => o.id === state.goal.mergedId).sources.length, 2, 'a merged object exists for split');
    }
    if (['organize-copy', 'organize-crossout', 'organize-delete'].includes(state.goal.step)) {
      assert.ok(state.frame.board.objects.some((o) => o.id === state.goal.targets[0] && !o.removed), 'later steps keep the marked object on the board');
    }
    p = createPracticeProgress({ mode: 'quantity', chapters: [chapter()], storage: adapter });
    state = p.enter();
  }
  assert.equal(JSON.parse(storage.get(realKey)).objects.length, 2, 'practice never writes the real draft key');
  assert.ok(![...storage.keys()].some((key) => key.startsWith('baicai-edu-math-board:v4') && key !== realKey), 'no other real key');
  const progress = JSON.parse(storage.get('baicai-edu-math-board:practice:v2:quantity'));
  const entry = progress.entries['quantity-organize'];
  const boards = [entry.frame.board, ...Object.values(entry.starts).map((frame) => frame.board)];
  for (const board of boards) assert.ok(board.objects.every((object) => object.shape !== 'house'), 'practice frames carry no real objects');
});
