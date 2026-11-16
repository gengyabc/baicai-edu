import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from './model.js';
import { createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames } from './geometry-basics.js';
import { createGeometryConstructChapter } from './geometry-construct.js';
import { createGeometryEditChapter } from './geometry-edit.js';
import { createGeometryAdjustChapter } from './geometry-adjust.js';
import { createPracticeProgress } from '../shell/practice-progress.js';

const G = createGeometryModel();
const frames = createGeometryPracticeFrames(G);

function chapter() {
  return createGeometryAdjustChapter({ G, emptyFrame: frames.empty });
}
function pointBoard(x, y, board = G.empty()) {
  return G.reduce(board, { type: 'addPoint', x, y });
}

test('turning the grid on and then committing a point passes, and the grid alone does not', () => {
  const c = chapter();
  const frame = c.start(null);
  const goal = c.createGoal();
  assert.equal(c.id, 'geometry-adjust');
  assert.equal(c.titleKey, 'geometryPracticeAdjust');
  assert.equal(goal.snapshot().step, 'adjust-grid');
  assert.equal(frame.board.points.length, 1);
  assert.deepEqual(frame.history, { past: [], future: [] });
  assert.equal(frame.grid, false);
  assert.equal(frame.snap, true);
  assert.equal(frame.zoom, 1);
  assert.equal(frame.fit, true);
  assert.deepEqual(frame.scroll, { left: 0, top: 0 });
  const before = frame.board;
  const early = pointBoard(320, 200, before);
  goal.observe({ type: 'draw', tool: 'point', before, after: early, grid: true, snap: true });
  assert.equal(goal.snapshot().step, 'adjust-grid', 'a point before the grid changes does not pass');
  goal.observe({ type: 'grid', before: false, after: true });
  assert.equal(goal.snapshot().step, 'adjust-grid', 'turning the grid on without a new point does not pass');
  goal.observe({ type: 'draw', tool: 'point', before, after: early, grid: false, snap: true });
  assert.equal(goal.snapshot().step, 'adjust-grid', 'a point committed while the grid is off does not pass');
  const elsewhere = pointBoard(480, 360, before);
  goal.observe({ type: 'draw', tool: 'point', before, after: elsewhere, grid: true, snap: true });
  assert.equal(goal.snapshot().step, 'adjust-snap');
  assert.equal(goal.snapshot().gridOn, true);
});

test('turning snap off and then committing a point passes, wherever that point lands', () => {
  const frame = chapter().start(null);
  const goal = chapter().createGoal({ index: 1, zoom: 1, fit: true });
  const before = frame.board;
  const sameSpot = before.points[0];
  const overlapped = pointBoard(sameSpot.x, sameSpot.y, before);
  goal.observe({ type: 'draw', tool: 'point', before, after: overlapped, grid: true, snap: false });
  assert.equal(goal.snapshot().step, 'adjust-snap', 'a point before snap changes does not pass');
  goal.observe({ type: 'snap', before: true, after: false });
  assert.equal(goal.snapshot().step, 'adjust-snap', 'turning snap off without a new point does not pass');
  goal.observe({ type: 'draw', tool: 'point', before, after: overlapped, grid: false, snap: true });
  assert.equal(goal.snapshot().step, 'adjust-snap', 'a point committed while snap is still on does not pass');
  goal.observe({ type: 'draw', tool: 'point', before, after: overlapped, grid: true, snap: false });
  assert.equal(goal.snapshot().step, 'adjust-undo');
  assert.equal(overlapped.points.filter((point) => point.x === sameSpot.x && point.y === sameSpot.y).length, 2);
});

test('undo restores the board from before the latest point, and redo puts that same point back', () => {
  const before = pointBoard(200, 180);
  const after = pointBoard(420, 260, before);
  const pointId = after.points.at(-1).id;
  const goal = chapter().createGoal({ index: 2, zoom: 1, fit: true, undoBoard: before, redoBoard: after });
  assert.equal(goal.snapshot().pointId, pointId);
  goal.observe({ type: 'undo' });
  goal.observe({ type: 'undo', before: after, after });
  const extra = pointBoard(520, 300, after);
  goal.observe({ type: 'draw', tool: 'point', before: after, after: extra, grid: false, snap: false });
  assert.equal(goal.snapshot().step, 'adjust-undo', 'a disabled undo or another point does not pass');
  goal.observe({ type: 'undo', before: after, after: before });
  assert.equal(goal.snapshot().step, 'adjust-redo');
  assert.equal(before.points.some((point) => point.id === pointId), false);
  const restored = chapter().createGoal(goal.snapshot());
  restored.observe({ type: 'redo' });
  restored.observe({ type: 'redo', before, after: before });
  assert.equal(restored.snapshot().step, 'adjust-redo', 'a disabled redo does not pass');
  restored.observe({ type: 'redo', before, after });
  assert.equal(restored.snapshot().step, 'adjust-zoom');
  assert.equal(after.points.some((point) => point.id === pointId), true);
});

test('zoom must change the number, scroll must move, and fit must return from off to on', () => {
  const goal = chapter().createGoal({ index: 4, zoom: 1, fit: true });
  goal.observe({ type: 'zoom', before: 1, after: 1 });
  goal.observe({ type: 'fit', before: true, after: false });
  assert.equal(goal.snapshot().step, 'adjust-zoom', 'an unchanged zoom, including a control that only leaves the fit, does not pass');
  goal.observe({ type: 'zoom', before: 1, after: 1.25 });
  assert.equal(goal.snapshot().step, 'adjust-scroll');
  goal.observe({ type: 'fit', before: true, after: false });
  goal.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 0, top: 0 } });
  assert.equal(goal.snapshot().step, 'adjust-scroll', 'a scroll that leaves the position unchanged does not pass');
  const fitted = chapter().createGoal({ index: 5, zoom: 1, fit: true });
  fitted.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 40, top: 12 } });
  assert.equal(fitted.snapshot().step, 'adjust-scroll', 'scrolling while zoom is 1 and the view is fitted does not pass');
  goal.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 48, top: 16 } });
  assert.equal(goal.snapshot().step, 'adjust-fit');
  goal.observe({ type: 'fit', before: true, after: true });
  goal.observe({ type: 'fit', before: true, after: false });
  assert.equal(goal.snapshot().step, 'adjust-fit', 'clicking fit while the view is already fitted does not pass');
  goal.observe({ type: 'fit', before: false, after: true });
  assert.equal(goal.snapshot().step, 'adjust-clear');
});

test('a confirmed clear empties the practice board and drops undo history, and a later undo does not restore it', () => {
  const undo = G.empty();
  const redo = pointBoard(200, 180, undo);
  const goal = chapter().createGoal({ index: 7, zoom: 1, fit: true, undoBoard: undo, redoBoard: redo });
  goal.observe({ type: 'clear', before: redo, after: redo });
  assert.equal(goal.snapshot().step, 'adjust-clear', 'opening the confirm dialog without confirming does not pass');
  const cleared = G.empty();
  goal.observe({ type: 'clear', before: redo, after: cleared });
  const done = goal.snapshot();
  assert.equal(done.completed, true);
  assert.equal(done.step, 'adjust-complete');
  assert.equal(done.undoBoard, null);
  assert.equal(done.redoBoard, null);
  goal.observe({ type: 'undo', before: cleared, after: redo });
  const afterUndo = goal.snapshot();
  assert.equal(afterUndo.step, 'adjust-complete');
  assert.equal(afterUndo.undoBoard, null);
  assert.equal(afterUndo.redoBoard, null);
  assert.equal(cleared.points.length, 0);
  assert.deepEqual(chapter().createGoal(done).snapshot().undoBoard, null);
});

test('start reuses an existing point, fresh opens the catalogue, and an inconsistent goal is refused', () => {
  const previous = frames.empty();
  previous.board = pointBoard(140, 160, pointBoard(100, 120));
  previous.grid = true;
  previous.snap = false;
  previous.zoom = 2;
  previous.history = { past: [G.empty()], future: [previous.board] };
  const c = chapter();
  const reused = c.start(previous);
  assert.equal(reused.board.points.length, 2);
  assert.equal(reused.grid, false);
  assert.equal(reused.snap, true);
  assert.equal(reused.zoom, 1);
  assert.equal(reused.fit, true);
  assert.deepEqual(reused.scroll, { left: 0, top: 0 });
  assert.deepEqual(reused.history, { past: [], future: [] });
  const bare = c.start(null);
  assert.equal(bare.board.points.length, 1);
  assert.deepEqual(bare.history, { past: [], future: [] });
  const catalogue = c.fresh();
  assert.equal(c.createGoal(catalogue.saved).snapshot().step, 'adjust-grid');
  assert.equal(catalogue.frame.board.points.length, 1);
  const undo = G.empty();
  const redo = pointBoard(200, 180);
  assert.throws(() => c.createGoal({}), /Invalid adjust goal/);
  assert.throws(() => c.createGoal([]), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: -1 }), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: 1.5 }), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: 9 }), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: 2 }), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: 0, undoBoard: undo, redoBoard: redo }), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: 2, undoBoard: undo, redoBoard: undo }), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: 3, zoom: 8, fit: true, undoBoard: undo, redoBoard: redo }), /Invalid adjust goal/);
  assert.throws(() => c.createGoal({ index: 4, fit: 'no' }), /Invalid adjust goal/);
  assert.deepEqual(createGeometryBasicsChapter({ G, emptyFrame: frames.empty, createGoal: createGeometryPractice }).steps,
    ['point', 'segment', 'triangle', 'polygon', 'circle', 'select-one', 'deselect', 'insert']);
  assert.deepEqual(createGeometryConstructChapter({ G, emptyFrame: frames.empty }).steps,
    ['construct-parallelogram', 'construct-rectangle', 'construct-select-side', 'construct-midpoint', 'construct-drag', 'construct-auxiliary', 'construct-auxiliary-off']);
  assert.deepEqual(createGeometryEditChapter({ G, emptyFrame: frames.empty }).steps,
    ['edit-rename', 'edit-text-add', 'edit-text-change', 'edit-delete', 'edit-point-note', 'edit-element-note', 'edit-caption', 'edit-deselect', 'edit-board-note']);
});

test('skip prepares the next step without toggling its control, clearing the board, or counting the seeded point', () => {
  const c = chapter();
  let frame = c.start(null);
  let goal = c.createGoal();
  const grid = frame.grid;
  const snap = frame.snap;
  const steps = [];
  for (let index = 0; index < c.steps.length; index += 1) {
    const leaving = goal.snapshot().step;
    const next = c.skip(goal.snapshot(), frame);
    frame = frames.validate(next.frame);
    goal = c.createGoal(next.goal);
    steps.push(goal.snapshot().step);
    if (leaving === 'adjust-grid') assert.equal(frame.grid, grid, 'skip does not turn the grid on');
    if (leaving === 'adjust-snap') assert.equal(frame.snap, snap, 'skip does not turn snap off');
    if (goal.snapshot().step === 'adjust-undo') {
      assert.equal(frame.history.past.length, 1);
      assert.equal(frame.history.future.length, 0);
      goal.observe({ type: 'draw', tool: 'point', before: frame.board, after: pointBoard(600, 400, frame.board), grid: false, snap: false });
      assert.equal(goal.snapshot().step, 'adjust-undo', 'a point prepared by skip is not the undo');
    }
    if (goal.snapshot().step === 'adjust-redo') assert.equal(frame.history.future.length, 1);
    if (goal.snapshot().step === 'adjust-zoom') { assert.equal(frame.zoom, 1); assert.equal(frame.fit, true); }
    if (goal.snapshot().step === 'adjust-scroll') {
      assert.equal(frame.zoom !== 1 || frame.fit === false, true);
      assert.deepEqual(frame.scroll, { left: 0, top: 0 });
    }
    if (goal.snapshot().step === 'adjust-fit') assert.equal(frame.fit, false);
    if (goal.snapshot().step === 'adjust-clear') assert.ok(frame.board.points.length + frame.board.elements.length > 0);
  }
  assert.deepEqual(steps, ['adjust-snap', 'adjust-undo', 'adjust-redo', 'adjust-zoom', 'adjust-scroll', 'adjust-fit', 'adjust-clear', 'adjust-complete']);
  assert.equal(goal.snapshot().completed, true);
  assert.ok(frame.board.points.length + frame.board.elements.length > 0, 'skip does not clear the board');
});

test('the adjust chapter can be entered, skipped, reset, and retried without rewriting other chapters', () => {
  const storage = new Map();
  const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const basics = createGeometryBasicsChapter({ G, emptyFrame: frames.empty, createGoal: createGeometryPractice });
  const construct = createGeometryConstructChapter({ G, emptyFrame: frames.empty });
  const edit = createGeometryEditChapter({ G, emptyFrame: frames.empty });
  const adjust = chapter();
  let progress = createPracticeProgress({ mode: 'geometry', chapters: [basics, construct, edit, adjust], storage: adapter, validateFrame: frames.validate });
  const entered = progress.enter();
  const drawn = pointBoard(100, 100, entered.frame.board);
  progress.observe({ type: 'draw', tool: 'point', before: entered.frame.board, after: drawn }, { ...entered.frame, board: drawn });
  const opened = progress.enter('geometry-adjust');
  assert.equal(opened.goal.step, 'adjust-grid');
  assert.equal(opened.frame.board.points.length >= 1, true);
  assert.equal(opened.frame.grid, false);
  const skipped = progress.skip();
  assert.equal(skipped.goal.step, 'adjust-snap');
  assert.equal(skipped.chapters.find((item) => item.id === 'geometry-adjust').states[0], 'skipped');
  assert.equal(skipped.frame.grid, false);
  progress.reset();
  assert.equal(progress.snapshot().goal.step, 'adjust-snap');
  progress.retryStep(0);
  assert.equal(progress.snapshot().goal.step, 'adjust-grid');
  progress.skip();
  progress.enter('geometry-adjust', { retry: true });
  assert.equal(progress.snapshot().goal.step, 'adjust-grid');
  assert.equal(progress.snapshot().chapters.find((item) => item.id === 'geometry-basics').states[0], 'completed');
  assert.equal(progress.snapshot().chapters.find((item) => item.id === 'geometry-construct').status, 'not-started');
  assert.equal(progress.snapshot().chapters.find((item) => item.id === 'geometry-edit').status, 'not-started');
  progress = createPracticeProgress({ mode: 'geometry', chapters: [basics, construct, edit, adjust], storage: adapter, validateFrame: frames.validate });
  assert.equal(progress.enter().goal.step, 'adjust-grid');
  assert.equal(storage.has('baicai-edu-math-board:geometry:v1:tabbed'), false);
  assert.equal(typeof storage.get('baicai-edu-math-board:practice:v2:geometry'), 'string');
});
