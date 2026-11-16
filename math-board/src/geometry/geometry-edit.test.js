import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from './model.js';
import { createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames } from './geometry-basics.js';
import { createGeometryConstructChapter } from './geometry-construct.js';
import { createGeometryEditChapter } from './geometry-edit.js';
import { createPracticeProgress } from '../shell/practice-progress.js';

const G = createGeometryModel();
const frames = createGeometryPracticeFrames(G);

function chapter() {
  return createGeometryEditChapter({ G, emptyFrame: frames.empty });
}
function opened(index = 0, patch = {}) {
  const c = chapter();
  const frame = c.start(null);
  const saved = { ...c.createGoal().snapshot(), ...patch, index };
  if (index >= 2 && !saved.textId) saved.textId = 'e-9';
  if (index < 2) saved.textId = null;
  if (index >= 6 && [...String(saved.elementNote || '').trim()].length < 1) saved.elementNote = 'Side';
  if (index < 6) saved.elementNote = '';
  const goal = c.createGoal(saved);
  return { c, frame, board: frame.board, goal, ids: goal.snapshot() };
}
const live = (board, id) => board.points.some((point) => point.id === id) || board.elements.some((element) => element.id === id);

test('renaming the marked point advances and keeps every reference to that point id', () => {
  const c = chapter();
  const frame = c.start(null);
  const goal = c.createGoal();
  assert.equal(c.id, 'geometry-edit');
  assert.equal(c.titleKey, 'geometryPracticeEdit');
  assert.equal(goal.snapshot().step, 'edit-rename');
  const pointId = goal.snapshot().pointId;
  const before = frame.board;
  const point = before.points.find((item) => item.id === pointId);
  const referenced = before.elements.filter((element) => element.points?.includes(pointId) || element.centerPointId === pointId || element.radiusPointId === pointId);
  assert.ok(point && point.kind === 'free');
  assert.ok(referenced.length >= 1, 'an element references the marked point');
  const after = G.reduce(before, { type: 'renamePoint', id: pointId, label: '甲' });
  goal.observe({ type: 'renamePoint', before, after, id: pointId, label: '甲' });
  assert.equal(goal.snapshot().step, 'edit-text-add');
  assert.equal(after.points.find((item) => item.id === pointId).label, '甲');
  for (const element of referenced) {
    const kept = after.elements.find((item) => item.id === element.id);
    assert.ok(kept);
    const ids = kept.points || [kept.centerPointId, kept.radiusPointId];
    assert.ok(ids.includes(pointId));
  }
});

test('an empty, unchanged, duplicate, or whitespace rename does not pass, and a dropped reference does not', () => {
  const { goal, board, ids } = opened(0);
  const point = board.points.find((item) => item.id === ids.pointId);
  const other = board.points.find((item) => item.id !== ids.pointId);
  assert.equal(goal.snapshot().step, 'edit-rename', 'a cancelled card sends no rename');
  assert.throws(() => G.reduce(board, { type: 'renamePoint', id: ids.pointId, label: '' }));
  goal.observe({ type: 'renamePoint', before: board, after: board, id: ids.pointId, label: '' });
  assert.throws(() => G.reduce(board, { type: 'renamePoint', id: ids.pointId, label: other.label }));
  goal.observe({ type: 'renamePoint', before: board, after: board, id: ids.pointId, label: other.label });
  const unchanged = G.reduce(board, { type: 'renamePoint', id: ids.pointId, label: point.label });
  goal.observe({ type: 'renamePoint', before: board, after: unchanged, id: ids.pointId, label: point.label });
  const blank = G.reduce(board, { type: 'renamePoint', id: ids.pointId, label: '   ' });
  goal.observe({ type: 'renamePoint', before: board, after: blank, id: ids.pointId, label: '   ' });
  const renamed = G.reduce(board, { type: 'renamePoint', id: ids.pointId, label: '甲' });
  const broken = JSON.parse(JSON.stringify(renamed));
  const linked = broken.elements.find((element) => element.points?.includes(ids.pointId));
  linked.points = linked.points.map((id) => (id === ids.pointId ? other.id : id));
  goal.observe({ type: 'renamePoint', before: board, after: broken, id: ids.pointId, label: '甲' });
  const elsewhere = G.reduce(board, { type: 'renamePoint', id: other.id, label: '乙' });
  goal.observe({ type: 'renamePoint', before: board, after: elsewhere, id: other.id, label: '乙' });
  assert.equal(goal.snapshot().step, 'edit-rename');
});

test('adding one text advances, and editing that same text advances; a second text does not', () => {
  const added = opened(1);
  added.goal.observe({ type: 'addText', before: added.board, after: added.board });
  assert.equal(added.goal.snapshot().step, 'edit-text-add', 'an empty or cancelled save does not pass');
  const textBoard = G.reduce(added.board, { type: 'addText', x: 240, y: 480, text: '面积' });
  const textId = textBoard.elements.at(-1).id;
  added.goal.observe({ type: 'addText', before: added.board, after: textBoard, id: textId });
  assert.equal(added.goal.snapshot().step, 'edit-text-change');
  assert.equal(added.goal.snapshot().textId, textId);
  const changing = opened(2, { textId });
  const second = G.reduce(textBoard, { type: 'addText', x: 360, y: 480, text: '另一份' });
  changing.goal.observe({ type: 'addText', before: textBoard, after: second, id: second.elements.at(-1).id });
  assert.throws(() => G.reduce(textBoard, { type: 'editText', id: textId, text: '' }));
  changing.goal.observe({ type: 'editText', before: textBoard, after: textBoard, id: textId });
  assert.equal(changing.goal.snapshot().step, 'edit-text-change', 'a second text or an empty save does not pass');
  const edited = G.reduce(textBoard, { type: 'editText', id: textId, text: '周长' });
  changing.goal.observe({ type: 'editText', before: textBoard, after: edited, id: textId });
  assert.equal(changing.goal.snapshot().step, 'edit-delete');
  assert.equal(edited.elements.find((element) => element.id === textId).text, '周长');
});

test('deleting the marked object leaves another object, and deleting a different one or everything does not pass', () => {
  const { goal, board, ids } = opened(3, { textId: 'e-9' });
  assert.notEqual(ids.deleteId, ids.elementId);
  assert.notEqual(ids.keepId, ids.pointId);
  const wrong = G.reduce(board, { type: 'delete', ids: [ids.elementId] });
  goal.observe({ type: 'delete', before: board, after: wrong, ids: [ids.elementId] });
  const wiped = G.reduce(board, { type: 'clear' });
  goal.observe({ type: 'clear', before: board, after: wiped, ids: [ids.deleteId] });
  const every = [...board.points.map((point) => point.id), ...board.elements.map((element) => element.id)];
  const none = G.reduce(board, { type: 'delete', ids: every });
  goal.observe({ type: 'delete', before: board, after: none, ids: every });
  assert.equal(goal.snapshot().step, 'edit-delete');
  const deleted = G.reduce(board, { type: 'delete', ids: [ids.deleteId] });
  assert.equal(live(deleted, ids.deleteId), false);
  assert.equal(live(deleted, ids.keepId), true);
  assert.equal(live(deleted, ids.pointId), true);
  assert.equal(live(deleted, ids.elementId), true);
  assert.ok(deleted.points.length + deleted.elements.length > 0);
  goal.observe({ type: 'delete', before: board, after: deleted, ids: [ids.deleteId] });
  assert.equal(goal.snapshot().step, 'edit-point-note');
});

test('a point note is not a text element or a shape note, and a shape note longer than 20 characters does not pass', () => {
  const point = opened(4, { textId: 'e-9' });
  const textBoard = G.reduce(point.board, { type: 'addText', x: 240, y: 480, text: '不是说明' });
  const textId = textBoard.elements.at(-1).id;
  point.goal.observe({ type: 'addText', before: point.board, after: textBoard, id: textId });
  const shape = G.reduce(point.board, { type: 'annotate', target: 'element', id: point.ids.elementId, value: '图形' });
  point.goal.observe({ type: 'annotate', target: 'element', id: point.ids.elementId, before: point.board, after: shape,
    action: { type: 'annotate', target: 'element', id: point.ids.elementId, value: '图形' } });
  const onText = G.reduce(textBoard, { type: 'annotate', target: 'element', id: textId, value: '写在文字上' });
  point.goal.observe({ type: 'annotate', target: 'element', id: textId, before: textBoard, after: onText,
    action: { type: 'annotate', target: 'element', id: textId, value: '写在文字上' } });
  assert.equal(point.goal.snapshot().step, 'edit-point-note');
  const noted = G.reduce(point.board, { type: 'annotate', target: 'point', id: point.ids.pointId, value: '起点' });
  point.goal.observe({ type: 'annotate', target: 'point', id: point.ids.pointId, before: point.board, after: noted,
    action: { type: 'annotate', target: 'point', id: point.ids.pointId, value: '起点' } });
  assert.equal(point.goal.snapshot().step, 'edit-element-note');
  assert.equal(noted.points.find((item) => item.id === point.ids.pointId).note, '起点');

  const element = opened(5, { textId });
  const long = G.reduce(element.board, { type: 'annotate', target: 'element', id: element.ids.elementId, value: '字'.repeat(21) });
  element.goal.observe({ type: 'annotate', target: 'element', id: element.ids.elementId, before: element.board, after: long,
    action: { type: 'annotate', target: 'element', id: element.ids.elementId, value: '字'.repeat(21) } });
  element.goal.observe({ type: 'annotate', target: 'element', id: textId, before: textBoard, after: onText,
    action: { type: 'annotate', target: 'element', id: textId, value: '写在文字上' } });
  element.goal.observe({ type: 'annotate', target: 'point', id: element.ids.pointId, before: element.board, after: noted,
    action: { type: 'annotate', target: 'point', id: element.ids.pointId, value: '起点' } });
  assert.equal(element.goal.snapshot().step, 'edit-element-note');
  const short = G.reduce(element.board, { type: 'annotate', target: 'element', id: element.ids.elementId, value: '字'.repeat(20) });
  element.goal.observe({ type: 'annotate', target: 'element', id: element.ids.elementId, before: element.board, after: short,
    action: { type: 'annotate', target: 'element', id: element.ids.elementId, value: '字'.repeat(20) } });
  assert.equal(element.goal.snapshot().step, 'edit-caption');
  assert.equal([...element.goal.snapshot().elementNote.trim()].length, 20);
});

test('opening a caption without saving does not pass, and a later save must change that same element', () => {
  const { goal, board, ids } = opened(6, { textId: 'e-9', elementNote: 'Side' });
  const before = G.reduce(board, { type: 'annotate', target: 'element', id: ids.elementId, value: 'Side' });
  goal.observe({ type: 'open-caption', id: ids.elementId });
  assert.equal(goal.snapshot().step, 'edit-caption', 'opening the card does not pass');
  const otherId = ids.deleteId;
  const other = G.reduce(before, { type: 'annotate', target: 'element', id: otherId, value: '别的' });
  goal.observe({ type: 'annotate', via: 'caption', target: 'element', id: otherId, before, after: other,
    action: { type: 'annotate', target: 'element', id: otherId, value: '别的' } });
  const changed = G.reduce(before, { type: 'annotate', target: 'element', id: ids.elementId, value: '改过' });
  goal.observe({ type: 'annotate', target: 'element', id: ids.elementId, before, after: changed,
    action: { type: 'annotate', target: 'element', id: ids.elementId, value: '改过' } });
  assert.equal(goal.snapshot().step, 'edit-caption', 'a save that did not come from the caption does not pass');
  goal.observe({ type: 'annotate', via: 'caption', target: 'element', id: ids.elementId, before, after: changed,
    action: { type: 'annotate', target: 'element', id: ids.elementId, value: '改过' } });
  assert.equal(goal.snapshot().step, 'edit-deselect');
  assert.equal(changed.elements.find((element) => element.id === ids.elementId).note, '改过');
});

test('a caption longer than 20 characters does not pass, and reset can still load the saved goal', () => {
  const storage = new Map();
  const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const edit = chapter();
  const progress = createPracticeProgress({ mode: 'geometry', chapters: [edit], storage: adapter, validateFrame: frames.validate });
  progress.enter('geometry-edit');
  for (let i = 0; i < 6; i += 1) progress.skip();
  const saved = progress.snapshot();
  assert.equal(saved.goal.step, 'edit-caption');
  const id = saved.goal.elementId;
  const before = saved.frame.board;
  const kept = before.elements.find((element) => element.id === id).note;
  assert.equal([...kept.trim()].length >= 1 && [...kept.trim()].length <= 20, true);
  const longValue = '字'.repeat(21);
  const long = G.reduce(before, { type: 'annotate', target: 'element', id, value: longValue });
  progress.observe({ type: 'open-caption', id }, saved.frame);
  progress.observe({
    type: 'annotate', via: 'caption', target: 'element', id, before, after: long,
    action: { type: 'annotate', target: 'element', id, value: longValue },
  }, { ...saved.frame, board: long });
  const stuck = progress.snapshot();
  assert.equal(stuck.goal.step, 'edit-caption');
  assert.equal(stuck.goal.elementNote, kept);
  assert.doesNotThrow(() => progress.reset());
  assert.equal(progress.snapshot().goal.step, 'edit-caption');
  assert.doesNotThrow(() => edit.createGoal(stuck.goal).snapshot());
  assert.doesNotThrow(() => edit.createGoal(progress.snapshot().goal).snapshot());
  const restored = progress.snapshot().frame;
  const short = G.reduce(restored.board, { type: 'annotate', target: 'element', id, value: '短' });
  progress.observe({ type: 'open-caption', id }, restored);
  progress.observe({
    type: 'annotate', via: 'caption', target: 'element', id, before: restored.board, after: short,
    action: { type: 'annotate', target: 'element', id, value: '短' },
  }, { ...restored, board: short });
  assert.equal(progress.snapshot().goal.step, 'edit-deselect');
});

test('clearing the selection advances, and a board note is not stolen by a selected element', () => {
  const clearing = opened(7, { textId: 'e-9', elementNote: 'Side' });
  clearing.goal.observe({ type: 'select', selection: [clearing.ids.pointId], after: clearing.board });
  assert.equal(clearing.goal.snapshot().step, 'edit-deselect');
  clearing.goal.observe({ type: 'select', selection: [], after: clearing.board });
  assert.equal(clearing.goal.snapshot().step, 'edit-board-note');
  const { goal, board, ids } = opened(8, { textId: 'e-9', elementNote: 'Side' });
  const stolen = G.reduce(board, { type: 'annotate', target: 'element', id: ids.elementId, value: 'Stolen' });
  goal.observe({ type: 'annotate', target: 'element', id: ids.elementId, before: board, after: stolen,
    action: { type: 'annotate', target: 'element', id: ids.elementId, value: 'Stolen' } });
  const blank = G.reduce(board, { type: 'note', value: '   ' });
  goal.observe({ type: 'note', before: board, after: blank, action: { type: 'note', value: '   ' }, target: 'board' });
  goal.observe({ type: 'note', before: board, after: board, action: { type: 'note', value: '' }, target: 'board' });
  assert.equal(goal.snapshot().step, 'edit-board-note', 'an element note or an empty save does not pass');
  assert.equal(stolen.elements.find((element) => element.id === ids.elementId).note, 'Stolen');
  assert.equal(board.note, '');
  const noted = G.reduce(board, { type: 'note', value: '整板' });
  goal.observe({ type: 'note', before: board, after: noted, action: { type: 'note', value: '整板' }, target: 'board' });
  assert.equal(goal.snapshot().completed, true);
  assert.equal(goal.snapshot().step, 'edit-complete');
  assert.equal(noted.note, '整板');
});

test('start reuses a free point, its element, and a survivor, and an inconsistent goal is refused', () => {
  const previous = frames.empty();
  let board = previous.board;
  const placed = [];
  for (const [x, y] of [[200, 180], [420, 180], [200, 360], [520, 320], [680, 320]]) {
    board = G.reduce(board, { type: 'addPoint', x, y });
    placed.push(board.points.at(-1).id);
  }
  board = G.reduce(board, { type: 'addElement', elementType: 'segment', points: [placed[0], placed[1]], role: 'main' });
  board = G.reduce(board, { type: 'addElement', elementType: 'segment', points: [placed[3], placed[4]], role: 'main' });
  previous.board = board;
  const c = chapter();
  const reused = c.start(previous);
  assert.equal(reused.board.points.length, 5);
  assert.equal(reused.board.elements.length, 2);
  const snap = c.createGoal().snapshot();
  assert.equal(snap.pointId, placed[0]);
  assert.notEqual(snap.deleteId, snap.elementId);
  assert.equal(live(reused.board, snap.keepId), true);
  const bare = chapter().start(null);
  assert.equal(bare.board.points.length, 5);
  assert.equal(bare.board.elements.filter((element) => element.type === 'segment').length, 2);
  assert.equal(bare.board.elements.some((element) => element.type === 'text'), false);
  assert.equal(bare.selection.length, 1);
  const catalogue = chapter();
  const fresh = catalogue.fresh();
  assert.equal(catalogue.createGoal(fresh.saved).snapshot().step, 'edit-rename');
  assert.equal(fresh.frame.board.elements.some((element) => element.type === 'text'), false);
  assert.throws(() => c.createGoal({}), /Invalid edit goal/);
  assert.throws(() => c.createGoal({ index: 2, pointId: 'p-1', elementId: 'e-1', keepId: 'p-3', deleteId: 'e-2', textId: null, elementNote: '' }), /Invalid edit goal/);
  assert.throws(() => c.createGoal({ index: 6, pointId: 'p-1', elementId: 'e-1', keepId: 'p-3', deleteId: 'e-2', textId: 'e-9', elementNote: '字'.repeat(21) }), /Invalid edit goal/);
  assert.throws(() => c.createGoal({ index: 0, pointId: 'p-1', elementId: 'e-1', keepId: 'p-1', deleteId: 'e-2', textId: null, elementNote: '' }), /Invalid edit goal/);
  assert.throws(() => c.createGoal({ index: 9, pointId: '', elementId: 'e-1', keepId: 'p-3', deleteId: 'e-2', textId: 'e-9', elementNote: 'Side' }), /Invalid edit goal/);
  assert.throws(() => c.createGoal({ index: 1.2, pointId: 'p-1', elementId: 'e-1', keepId: 'p-3', deleteId: 'e-2', textId: null, elementNote: '' }), /Invalid edit goal/);
  const saved = c.createGoal(snap).snapshot();
  assert.equal(c.createGoal(saved).snapshot().pointId, snap.pointId);
  assert.deepEqual(createGeometryBasicsChapter({ G, emptyFrame: frames.empty, createGoal: createGeometryPractice }).steps,
    ['point', 'segment', 'triangle', 'polygon', 'circle', 'select-one', 'deselect', 'insert']);
  assert.deepEqual(createGeometryConstructChapter({ G, emptyFrame: frames.empty }).steps,
    ['construct-parallelogram', 'construct-rectangle', 'construct-select-side', 'construct-midpoint', 'construct-drag', 'construct-auxiliary', 'construct-auxiliary-off']);
});

test('skip prepares the next step without the write, rename, or delete that step asks for', () => {
  const c = chapter();
  let frame = c.start(null);
  let goal = c.createGoal();
  const label = frame.board.points.find((point) => point.id === goal.snapshot().pointId).label;
  const steps = [];
  for (let index = 0; index < 9; index += 1) {
    const next = c.skip(goal.snapshot(), frame);
    frame = frames.validate(next.frame);
    goal = c.createGoal(next.goal);
    steps.push(goal.snapshot().step);
  }
  assert.deepEqual(steps, ['edit-text-add', 'edit-text-change', 'edit-delete', 'edit-point-note', 'edit-element-note', 'edit-caption', 'edit-deselect', 'edit-board-note', 'edit-complete']);
  assert.equal(goal.snapshot().completed, true);
  assert.equal(frame.board.points.find((point) => point.id === goal.snapshot().pointId).label, label);
  assert.equal(live(frame.board, goal.snapshot().deleteId), true, 'skip does not delete the marked object');
  assert.equal(frame.board.note, '');
  assert.equal([...frame.board.elements.find((element) => element.id === goal.snapshot().elementId).note.trim()].length <= 20, true);
  const again = chapter();
  let practice = again.start(null);
  let cursor = again.createGoal();
  const land = () => {
    const next = again.skip(cursor.snapshot(), practice);
    practice = frames.validate(next.frame);
    cursor = again.createGoal(next.goal);
    return cursor.snapshot();
  };
  assert.equal(land().step, 'edit-text-add');
  assert.equal(practice.board.elements.some((element) => element.type === 'text'), false);
  const change = land();
  assert.equal(change.step, 'edit-text-change');
  assert.equal(practice.board.elements.find((element) => element.id === change.textId).text, '文字');
  assert.deepEqual(practice.selection, [change.textId]);
  const removing = land();
  assert.equal(removing.step, 'edit-delete');
  assert.equal(live(practice.board, removing.deleteId), true);
  assert.deepEqual(practice.selection, [removing.deleteId]);
  const point = land();
  assert.equal(point.step, 'edit-point-note');
  assert.equal(practice.board.points.find((item) => item.id === point.pointId).note, '');
  const element = land();
  assert.equal(element.step, 'edit-element-note');
  assert.equal(practice.board.elements.find((item) => item.id === element.elementId).note, '');
  const caption = land();
  assert.equal(caption.step, 'edit-caption');
  const seeded = practice.board.elements.find((item) => item.id === caption.elementId).note;
  assert.equal([...seeded.trim()].length >= 1 && [...seeded.trim()].length <= 20, true);
  const deselect = land();
  assert.equal(deselect.step, 'edit-deselect');
  assert.equal(practice.selection.length > 0, true);
  const boardNote = land();
  assert.equal(boardNote.step, 'edit-board-note');
  assert.deepEqual(practice.selection, []);
  assert.equal(practice.board.note, '');
});

test('the edit chapter can be entered, skipped, reset, and retried without rewriting other chapters', () => {
  const storage = new Map();
  const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const basics = createGeometryBasicsChapter({ G, emptyFrame: frames.empty, createGoal: createGeometryPractice });
  const construct = createGeometryConstructChapter({ G, emptyFrame: frames.empty });
  const edit = chapter();
  let progress = createPracticeProgress({ mode: 'geometry', chapters: [basics, construct, edit], storage: adapter, validateFrame: frames.validate });
  const entered = progress.enter();
  const drawn = G.reduce(entered.frame.board, { type: 'addPoint', x: 100, y: 100 });
  progress.observe({ type: 'draw', tool: 'point', before: entered.frame.board, after: drawn }, { ...entered.frame, board: drawn });
  const opened = progress.enter('geometry-edit');
  assert.equal(opened.goal.step, 'edit-rename');
  assert.equal(opened.frame.board.points.length, 5);
  const skipped = progress.skip();
  assert.equal(skipped.goal.step, 'edit-text-add');
  assert.equal(skipped.chapters.find((item) => item.id === 'geometry-edit').states[0], 'skipped');
  assert.equal(skipped.frame.board.elements.some((element) => element.type === 'text'), false);
  progress.reset();
  assert.equal(progress.snapshot().goal.step, 'edit-text-add');
  progress.retryStep(0);
  assert.equal(progress.snapshot().goal.step, 'edit-rename');
  progress.skip();
  progress.enter('geometry-edit', { retry: true });
  assert.equal(progress.snapshot().goal.step, 'edit-rename');
  assert.equal(progress.snapshot().chapters.find((item) => item.id === 'geometry-basics').states[0], 'completed');
  assert.equal(progress.snapshot().chapters.find((item) => item.id === 'geometry-construct').status, 'not-started');
  progress = createPracticeProgress({ mode: 'geometry', chapters: [basics, construct, edit], storage: adapter, validateFrame: frames.validate });
  assert.equal(progress.enter().goal.step, 'edit-rename');
  assert.equal(storage.has('baicai-edu-math-board:geometry:v1:tabbed'), false);
  assert.equal(typeof storage.get('baicai-edu-math-board:practice:v2:geometry'), 'string');
});
