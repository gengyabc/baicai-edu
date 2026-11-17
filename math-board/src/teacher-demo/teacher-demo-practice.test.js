import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createGeometryModel } from '../geometry/model.js';
import { createGeometryPracticeFrames } from '../geometry/geometry-basics.js';
import { createGeometryEditChapter } from '../geometry/geometry-edit.js';
import { placeFigure } from '../geometry/place-figure.js';
import { createPracticeProgress } from '../shell/practice-progress.js';
import { createTeacherDemoChapter } from './teacher-demo-practice.js';

const G = createGeometryModel();
const frames = createGeometryPracticeFrames(G);
const zh = JSON.parse(await readFile(new URL('../../locale/zh.json', import.meta.url), 'utf8'));
const en = JSON.parse(await readFile(new URL('../../locale/en.json', import.meta.url), 'utf8'));

function chapter() {
  return createTeacherDemoChapter({ G, emptyFrame: frames.empty, placeFigure });
}
function figure() {
  let board = G.reduce(G.empty(), { type: 'addPoint', x: 80, y: 90, label: 'A' });
  board = G.reduce(board, { type: 'addPoint', x: 220, y: 90, label: 'B' });
  const [a, b] = board.points;
  board = G.reduce(board, { type: 'addElement', elementType: 'segment', points: [a.id, b.id], role: 'main' });
  return { title: '线段', description: '只读', board };
}
function memory() {
  const storage = new Map();
  return {
    storage,
    adapter: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) },
  };
}

test('reading the introduction passes only when the student continues', () => {
  const c = chapter();
  const shown = figure();
  const id = c.identity(shown);
  c.arm({ id, board: shown.board });
  const frame = c.start(null);
  const goal = c.createGoal();
  assert.equal(c.id, 'teacher-demo-basics');
  assert.equal(c.titleKey, 'teacherDemoPractice');
  assert.deepEqual(c.steps, ['demo-read', 'demo-view', 'demo-copy', 'demo-return']);
  assert.equal(goal.snapshot().step, 'demo-read');
  assert.equal(goal.snapshot().completed, false);
  assert.equal(frame.board.points.length, 0);
  assert.equal(frame.board.elements.length, 0);
  assert.equal(frame.zoom, 1);
  assert.equal(frame.fit, true);
  assert.deepEqual(frame.scroll, { left: 0, top: 0 });
  assert.equal(frame.figureId, id);
  assert.equal(JSON.stringify(shown), JSON.stringify(figure()), 'starting the empty board does not edit the teacher figure');
  goal.observe({ type: 'render', figureId: id });
  goal.observe({ type: 'recorded', figureId: id });
  assert.equal(goal.snapshot().step, 'demo-read', 'rendering the page, or a recorded tool result, is not continue');
  goal.observe({ type: 'continue', figureId: 'other' });
  assert.equal(goal.snapshot().step, 'demo-read', 'a different figure does not pass the introduction');
  goal.observe({ type: 'continue', figureId: id });
  assert.equal(goal.snapshot().step, 'demo-view');
  for (const dictionary of [zh, en]) {
    const intro = dictionary['teacherDemoPracticeGoal_demo-read'];
    assert.equal(typeof intro, 'string');
    assert.equal(/看懂|understood|已经复制|already copied/i.test(intro), false);
  }
});

test('the view step needs a changed zoom number and then a real scroll', () => {
  const c = chapter();
  const shown = figure();
  const id = c.identity(shown);
  const before = JSON.stringify(shown);
  const goal = c.createGoal({ index: 1, figureId: id, zoom: 1, fit: true });
  goal.observe({ type: 'zoom', before: 1, after: 1, figureId: id });
  goal.observe({ type: 'fit', before: true, after: false, figureId: id });
  goal.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 24, top: 8 }, figureId: id });
  assert.equal(goal.snapshot().step, 'demo-view', 'an unchanged zoom, including the current level, does not pass');
  goal.observe({ type: 'zoom', before: 1, after: 1.25, figureId: id });
  assert.equal(goal.snapshot().step, 'demo-view', 'changing the zoom number without scrolling does not pass');
  goal.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 0, top: 0 }, figureId: id });
  assert.equal(goal.snapshot().step, 'demo-view', 'a scroll that leaves the position unchanged does not pass');
  const fitted = c.createGoal({ index: 1, figureId: id, zoom: 1, fit: true, viewed: true });
  fitted.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 12, top: 4 }, figureId: id });
  assert.equal(fitted.snapshot().step, 'demo-view', 'scrolling while zoom is 1 and the view is fitted does not pass');
  goal.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 30, top: 12 }, figureId: 'other' });
  assert.equal(goal.snapshot().step, 'demo-view', 'a replaced figure does not pass the old view step');
  goal.observe({ type: 'scroll', before: { left: 0, top: 0 }, after: { left: 30, top: 12 }, figureId: id });
  assert.equal(goal.snapshot().step, 'demo-copy');
  assert.equal(JSON.stringify(shown), before, 'the teacher figure object is not mutated');
});

test('copy passes only for a successful append of the current figure', () => {
  const c = chapter();
  const shown = figure();
  const id = c.identity(shown);
  const practice = frames.empty().board;
  const placed = placeFigure(G, practice, shown.board);
  assert.equal(placed.ok, true);
  const goal = c.createGoal({ index: 2, figureId: id, zoom: 1.25, fit: false, viewed: true });
  goal.observe({ type: 'copy', figureId: id });
  assert.equal(goal.snapshot().step, 'demo-copy', 'copy without a press does not pass');
  goal.observe({ type: 'copy', figureId: id, before: practice, after: practice, reason: 'full' });
  goal.observe({ type: 'copy', figureId: id, before: practice, after: practice, reason: 'empty' });
  assert.equal(goal.snapshot().step, 'demo-copy', 'a full or empty placeFigure result does not pass');
  assert.equal(goal.snapshot().copied, false, 'a failed placeFigure does not record the copy');
  goal.observe({ type: 'copy', figureId: 'replaced', before: practice, after: placed.board });
  assert.equal(goal.snapshot().step, 'demo-copy', 'a replaced figure does not complete the old copy');
  assert.equal(goal.snapshot().copied, false);
  const frozen = JSON.stringify(shown);
  goal.observe({ type: 'copy', figureId: id, before: practice, after: placed.board });
  assert.equal(goal.snapshot().step, 'demo-return');
  assert.equal(goal.snapshot().copied, true);
  assert.equal(JSON.stringify(shown), frozen);
  assert.equal(practice.elements.length, 0, 'the before board stays the guide frame from before the append');
});

test('return passes only for view-copy, and skip does not observe or complete the copy', () => {
  const c = chapter();
  const shown = figure();
  const id = c.identity(shown);
  const reading = c.createGoal({ index: 0, figureId: id });
  let frame = c.start({ figureId: id, figureBoard: shown.board });
  let calls = 0;
  const original = reading.observe;
  reading.observe = (event) => { calls += 1; return original(event); };
  const skippedRead = c.skip(reading.snapshot(), frame);
  frame = frames.validate(skippedRead.frame);
  assert.equal(calls, 0, 'skip does not observe');
  assert.equal(skippedRead.goal.index, 1);
  const viewing = c.createGoal(skippedRead.goal);
  const skippedView = c.skip(viewing.snapshot(), frame);
  frame = frames.validate(skippedView.frame);
  const copying = c.createGoal(skippedView.goal);
  assert.equal(copying.snapshot().step, 'demo-copy');
  const skippedCopy = c.skip(copying.snapshot(), frame);
  frame = frames.validate(skippedCopy.frame);
  assert.equal(skippedCopy.goal.copied, false, 'placing a figure for the return step does not complete the copy');
  assert.ok(frame.board.elements.length > 0, 'skip into return may place the current figure');
  assert.equal(JSON.stringify(shown.board), JSON.stringify(figure().board));
  const returning = c.createGoal(skippedCopy.goal);
  assert.equal(returning.snapshot().step, 'demo-return');
  returning.observe({ type: 'copy', figureId: id, before: G.empty(), after: frame.board });
  assert.equal(returning.snapshot().step, 'demo-return', 'a late copy does not pass return');
  returning.observe({ type: 'view-copy', figureId: 'hidden' });
  assert.equal(returning.snapshot().step, 'demo-return', 'a hidden figure does not pass return');
  returning.observe({ type: 'view-copy', figureId: id });
  assert.equal(returning.snapshot().step, 'demo-complete');
  assert.equal(returning.snapshot().completed, true);
  assert.equal(returning.snapshot().copied, false);
});

test('start returns the empty frame, fresh opens the catalogue, and an inconsistent goal is refused', () => {
  const c = chapter();
  const shown = figure();
  const id = c.identity(shown);
  c.arm({ id, board: shown.board });
  const started = c.start(null);
  assert.equal(started.board.elements.length, 0);
  assert.equal(started.figureId, id);
  const catalogue = c.fresh();
  assert.equal(c.createGoal(catalogue.saved).snapshot().step, 'demo-read');
  assert.equal(catalogue.frame.board.points.length, 0);
  const broken = { index: -1 };
  assert.throws(() => c.createGoal(broken), /Invalid demo goal/);
  assert.deepEqual(broken, { index: -1 }, 'an inconsistent save is not repaired');
  assert.throws(() => c.createGoal([]), /Invalid demo goal/);
  assert.throws(() => c.createGoal({ index: 1.5 }), /Invalid demo goal/);
  assert.throws(() => c.createGoal({ index: 5 }), /Invalid demo goal/);
  assert.throws(() => c.createGoal({ index: 0, viewed: true }), /Invalid demo goal/);
  assert.throws(() => c.createGoal({ index: 2, copied: true, figureId: id }), /Invalid demo goal/);
  assert.throws(() => c.createGoal({ index: 1, zoom: 8, figureId: id }), /Invalid demo goal/);
  assert.deepEqual(createGeometryEditChapter({ G, emptyFrame: frames.empty }).steps,
    ['edit-rename', 'edit-text-add', 'edit-text-change', 'edit-delete', 'edit-point-note', 'edit-element-note', 'edit-caption', 'edit-deselect', 'edit-board-note']);
});

test('teacher-demo progress is its own record, and the seen flag is not a completed goal', () => {
  const c = chapter();
  const { storage, adapter } = memory();
  storage.set('baicai-edu-math-board:geometry-demo-seen:session', '4');
  storage.set('baicai-edu-math-board:practice:v2:geometry', '{"version":2,"current":"geometry-edit","entries":{}}');
  const geometryBefore = storage.get('baicai-edu-math-board:practice:v2:geometry');
  const progress = createPracticeProgress({
    mode: 'teacher-demo', chapters: [c], storage: adapter, validateFrame: frames.validate,
  });
  assert.equal(progress.snapshot().chapters[0].status, 'not-started');
  assert.equal(progress.snapshot().goal, null);
  assert.equal(progress.snapshot().chapters[0].id, 'teacher-demo-basics');
  const shown = figure();
  c.arm({ id: c.identity(shown), board: shown.board });
  const opened = progress.enter();
  assert.equal(opened.goal.step, 'demo-read');
  assert.equal(opened.goal.completed, false);
  assert.equal(opened.chapters.find((item) => item.id === 'geometry-edit'), undefined);
  assert.equal(storage.get('baicai-edu-math-board:geometry-demo-seen:session'), '4');
  assert.equal(storage.get('baicai-edu-math-board:practice:v2:geometry'), geometryBefore);
  assert.equal(storage.has('baicai-edu-math-board:practice:v2:quantity'), false);
  assert.equal(typeof storage.get('baicai-edu-math-board:practice:v2:teacher-demo'), 'string');
  const skipped = progress.skip();
  assert.equal(skipped.goal.step, 'demo-view');
  assert.equal(skipped.chapters[0].states[0], 'skipped');
  assert.equal(skipped.chapters[0].status, 'in-progress');
});
