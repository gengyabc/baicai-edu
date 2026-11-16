import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from './model.js';
import { createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames } from './geometry-basics.js';
import { createGeometryConstructChapter } from './geometry-construct.js';
import { createPracticeProgress } from '../shell/practice-progress.js';

const G = createGeometryModel();
const frames = createGeometryPracticeFrames(G);

function chapter() {
  return createGeometryConstructChapter({ G, emptyFrame: frames.empty });
}
function points(board, coords) {
  let next = board;
  const ids = [];
  for (const [x, y] of coords) {
    next = G.reduce(next, { type: 'addPoint', x, y });
    ids.push(next.points.at(-1).id);
  }
  return { board: next, ids };
}
function element(board, elementType, ids, role = 'main') {
  return G.reduce(board, { type: 'addElement', elementType, points: ids, role });
}
// P4 = P1 + P3 - P2 stays inside the board margin. A flatter triple is refused by the model.
const corner = [[200, 180], [400, 180], [280, 320]];

test('a committed parallelogram advances and a plain polygon or a tool choice does not', () => {
  const c = chapter();
  const frame = c.start(null);
  const goal = c.createGoal();
  assert.equal(c.id, 'geometry-construct');
  assert.equal(c.titleKey, 'geometryPracticeConstruct');
  assert.deepEqual(c.steps, ['construct-parallelogram', 'construct-rectangle', 'construct-select-side', 'construct-midpoint', 'construct-drag', 'construct-auxiliary', 'construct-auxiliary-off']);
  assert.equal(goal.snapshot().step, 'construct-parallelogram');
  assert.equal(frame.board.elements.some((item) => item.type === 'parallelogram'), false);
  const empty = G.empty();
  goal.observe({ type: 'draw', tool: 'parallelogram', before: empty, after: empty });
  assert.equal(goal.snapshot().step, 'construct-parallelogram');
  const { board, ids } = points(empty, corner);
  const polygon = element(board, 'polygon', ids);
  goal.observe({ type: 'draw', tool: 'polygon', before: board, after: polygon, closed: true, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-parallelogram');
  goal.observe({ type: 'draw', tool: 'parallelogram', before: polygon, after: polygon, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-parallelogram', 'a parallelogram already on the board is not a new one');
  const parallelogram = element(board, 'parallelogram', ids);
  goal.observe({ type: 'draw', tool: 'parallelogram', before: board, after: parallelogram, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-rectangle');
  assert.equal(parallelogram.elements.some((item) => item.type === 'parallelogram'), true);
});

test('a rectangle needs its own committed element, not a parallelogram or an unfinished preview', () => {
  const c = chapter();
  const goal = c.createGoal({ index: 1, pointId: 'p-9', side: null });
  const { board, ids } = points(G.empty(), corner);
  const preview = G.reduce(board, { type: 'addPoint', x: 400, y: 180 });
  goal.observe({ type: 'draw', tool: 'rectangle', before: board, after: preview, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-rectangle');
  const parallelogram = element(board, 'parallelogram', ids);
  goal.observe({ type: 'draw', tool: 'parallelogram', before: board, after: parallelogram, role: 'main' });
  goal.observe({ type: 'draw', tool: 'rectangle', before: board, after: parallelogram, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-rectangle');
  const rectangle = element(board, 'rectangle', ids);
  goal.observe({ type: 'draw', tool: 'rectangle', before: board, after: rectangle, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-select-side');
  assert.equal(rectangle.elements.at(-1).type, 'rectangle');
});

test('selecting one free side advances, and a point, a circle, or a blocked side does not', () => {
  const c = chapter();
  const goal = c.createGoal({ index: 2, pointId: 'p-1', side: null });
  const { board, ids } = points(G.empty(), corner);
  const segment = element(board, 'segment', [ids[0], ids[1]]);
  const parallelogram = element(segment, 'parallelogram', ids);
  const circle = G.reduce(parallelogram, { type: 'addElement', elementType: 'circle', centerPointId: ids[0], radiusPointId: ids[1], role: 'main' });
  const miss = (selection) => goal.observe({ type: 'select', selection, after: circle });
  miss([]);
  miss([ids[0]]);
  miss([circle.elements.find((item) => item.type === 'circle').id]);
  miss([`${parallelogram.elements.find((item) => item.type === 'parallelogram').id}#2`]);
  assert.equal(goal.snapshot().step, 'construct-select-side');
  const withMid = G.reduce(circle, { type: 'addMidpoint', a: ids[0], b: ids[1] });
  goal.observe({ type: 'select', selection: [segment.elements[0].id], after: withMid });
  assert.equal(goal.snapshot().step, 'construct-select-side', 'a side that already has a midpoint is not available');
  const edge = `${parallelogram.elements.find((item) => item.type === 'parallelogram').id}#1`;
  goal.observe({ type: 'select', selection: [edge], after: circle });
  assert.equal(goal.snapshot().step, 'construct-midpoint');
  assert.deepEqual(goal.snapshot().side, G.parseEdgeKey(circle, edge).points);
});

test('a midpoint is the derived point of the selected side, not a free point or a disabled click', () => {
  const c = chapter();
  const goal = c.createGoal({ index: 3, pointId: 'p-1', side: ['p-1', 'p-2'] });
  const { board, ids } = points(G.empty(), [[120, 120], [280, 120], [200, 260]]);
  assert.deepEqual(ids, ['p-1', 'p-2', 'p-3']);
  const dropped = G.reduce(board, { type: 'addPoint', x: 400, y: 200 });
  goal.observe({ type: 'draw', tool: 'point', before: board, after: dropped });
  goal.observe({ type: 'midpoint', before: board, after: board, a: 'p-1', b: 'p-2', id: 'p-9' });
  assert.equal(goal.snapshot().step, 'construct-midpoint');
  const other = G.reduce(board, { type: 'addMidpoint', a: 'p-2', b: 'p-3' });
  const otherId = other.points.find((point) => point.construction?.op === 'midpoint').id;
  goal.observe({ type: 'midpoint', before: board, after: other, a: 'p-2', b: 'p-3', id: otherId });
  assert.equal(goal.snapshot().step, 'construct-midpoint');
  const mid = G.reduce(board, { type: 'addMidpoint', a: 'p-1', b: 'p-2' });
  const id = mid.points.find((point) => point.construction?.op === 'midpoint').id;
  goal.observe({ type: 'midpoint', before: board, after: mid, a: 'p-2', b: 'p-1', id });
  assert.equal(goal.snapshot().step, 'construct-drag');
  assert.equal(mid.points.find((point) => point.id === id).kind, 'derived');
});

test('dragging the marked free point advances, and the midpoint or a press that stays put does not', () => {
  const c = chapter();
  const goal = c.createGoal({ index: 4, pointId: 'p-1', side: ['p-1', 'p-2'] });
  let board = points(G.empty(), [[120, 140], [300, 140]]).board;
  board = G.reduce(board, { type: 'addMidpoint', a: 'p-1', b: 'p-2' });
  const mid = board.points.find((point) => point.construction?.op === 'midpoint');
  goal.observe({ type: 'move', before: board, after: board, id: 'p-1' });
  const shifted = copyPoint(board, mid.id, 30, 0);
  goal.observe({ type: 'move', before: board, after: shifted, id: mid.id });
  const other = G.reduce(board, { type: 'movePoint', id: 'p-2', x: 340, y: 180 });
  goal.observe({ type: 'move', before: board, after: other, id: 'p-2' });
  assert.equal(goal.snapshot().step, 'construct-drag');
  const moved = G.reduce(board, { type: 'movePoint', id: 'p-1', x: 160, y: 180 });
  assert.notEqual(moved.points[0].x, board.points[0].x);
  goal.observe({ type: 'move', before: board, after: moved, id: 'p-1' });
  assert.equal(goal.snapshot().step, 'construct-auxiliary');
});

test('an auxiliary element advances only after the switch is on, and turning the switch off is its own step', () => {
  const c = chapter();
  const goal = c.createGoal({ index: 5, pointId: 'p-1', side: ['p-1', 'p-2'] });
  const { board, ids } = points(G.empty(), [[160, 200], [360, 200]]);
  goal.observe({ type: 'auxiliary', before: false, after: true });
  goal.observe({ type: 'auxiliary', before: true, after: false });
  const main = element(board, 'segment', ids, 'main');
  goal.observe({ type: 'draw', tool: 'segment', before: board, after: main, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-auxiliary');
  const auxiliary = element(board, 'segment', ids, 'auxiliary');
  goal.observe({ type: 'draw', tool: 'segment', before: board, after: auxiliary, role: 'auxiliary' });
  assert.equal(goal.snapshot().step, 'construct-auxiliary-off');
  goal.observe({ type: 'auxiliary', before: false, after: true });
  assert.equal(goal.snapshot().step, 'construct-auxiliary-off');
  goal.observe({ type: 'auxiliary', before: true, after: false });
  assert.equal(goal.snapshot().completed, true);
  assert.equal(goal.snapshot().step, 'construct-complete');
});

test('start reuses enough free points and a segment, and an inconsistent goal is refused', () => {
  const c = chapter();
  const previous = frames.empty();
  let board = previous.board;
  for (const [x, y] of [[100, 120], [300, 120], [180, 260]]) board = G.reduce(board, { type: 'addPoint', x, y });
  board = G.reduce(board, { type: 'addElement', elementType: 'segment', points: ['p-1', 'p-2'], role: 'main' });
  previous.board = board;
  const reused = c.start(previous);
  assert.deepEqual(reused.board.points.map((point) => point.id), ['p-1', 'p-2', 'p-3']);
  assert.deepEqual(reused.board.elements.map((item) => [item.id, item.type]), [['e-1', 'segment']]);
  assert.equal(c.createGoal().snapshot().pointId, 'p-1');
  const bare = chapter();
  const created = bare.start(null);
  assert.equal(frames.validate(created).board.points.filter((point) => point.kind === 'free').length >= 3, true);
  assert.equal(created.board.elements.filter((item) => item.type === 'segment').length, 1);
  assert.equal(created.board.elements.some((item) => item.type === 'parallelogram' || item.type === 'rectangle'), false);
  assert.equal(created.board.points.some((point) => point.construction), false);
  assert.equal(created.auxiliary, false);
  const catalogue = bare.fresh();
  assert.equal(bare.createGoal(catalogue.saved).snapshot().step, 'construct-parallelogram');
  assert.equal(catalogue.frame.board.elements.some((item) => item.type === 'parallelogram'), false);
  const flat = frames.empty();
  flat.board = points(G.empty(), [[100, 100], [220, 100], [340, 100]]).board;
  const lifted = chapter().start(flat);
  const free = lifted.board.points.filter((point) => point.kind === 'free');
  assert.equal(free.length >= 3, true);
  assert.equal(lifted.board.elements.some((item) => item.type === 'segment'), true);
  assert.equal(free.some((a, i) => free.some((b, j) => j > i && free.some((d, k) => k > j
    && Math.abs((b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x)) > 0.5))), true);
  assert.throws(() => c.createGoal({}), /Invalid construct goal/);
  assert.throws(() => c.createGoal({ index: 3, pointId: 'p-1', side: null }), /Invalid construct goal/);
  assert.throws(() => c.createGoal({ index: 2, pointId: 'p-1', side: ['p-1', 'p-2'] }), /Invalid construct goal/);
  assert.throws(() => c.createGoal({ index: 4, pointId: '', side: ['p-1', 'p-2'] }), /Invalid construct goal/);
  assert.throws(() => c.createGoal({ index: 3, pointId: 'p-1', side: ['p-1', 'p-1'] }), /Invalid construct goal/);
  assert.throws(() => c.createGoal({ index: 99, pointId: 'p-1', side: null }), /Invalid construct goal/);
  assert.throws(() => c.createGoal({ index: 1.2, pointId: 'p-1', side: null }), /Invalid construct goal/);
  const saved = c.createGoal({ index: 0, pointId: 'p-4', side: null }).snapshot();
  assert.equal(c.createGoal(saved).snapshot().pointId, 'p-4');
  assert.equal(c.createGoal(saved).snapshot().side, null);
});

test('skip prepares the next step without the figure that step asks for, and the chapter can be resumed', () => {
  const c = chapter();
  let frame = c.start(null);
  let goal = c.createGoal();
  const steps = [];
  for (let index = 0; index < 7; index += 1) {
    const next = c.skip(goal.snapshot(), frame);
    frame = frames.validate(next.frame);
    goal = c.createGoal(next.goal);
    steps.push(goal.snapshot().step);
  }
  assert.deepEqual(steps, ['construct-rectangle', 'construct-select-side', 'construct-midpoint', 'construct-drag', 'construct-auxiliary', 'construct-auxiliary-off', 'construct-complete']);
  assert.equal(goal.snapshot().completed, true);
  assert.equal(frame.board.elements.some((item) => item.type === 'parallelogram' || item.type === 'rectangle'), false);
  assert.equal(frame.board.points.some((item) => item.construction?.op === 'midpoint'), false);
  assert.equal(frame.board.elements.some((item) => item.role === 'auxiliary'), false);
  assert.equal(frame.auxiliary, true);
  const again = chapter();
  let practice = again.start(null);
  let cursor = again.createGoal();
  const land = () => {
    const next = again.skip(cursor.snapshot(), practice);
    practice = next.frame;
    cursor = again.createGoal(next.goal);
    return cursor.snapshot();
  };
  const rectangle = land();
  assert.equal(rectangle.step, 'construct-rectangle');
  assert.ok(practice.board.points.filter((item) => item.kind === 'free').length >= 3);
  const select = land();
  assert.equal(select.step, 'construct-select-side');
  assert.equal(select.side, null);
  assert.ok(practice.board.elements.some((item) => item.type === 'segment' && item.points.every((id) => practice.board.points.find((p) => p.id === id)?.kind === 'free')));
  const midpoint = land();
  assert.equal(midpoint.step, 'construct-midpoint');
  assert.equal(practice.selection.length, 1);
  assert.equal(practice.board.points.some((item) => item.construction?.op === 'midpoint'), false);
  const beforeDrag = practice.board.points.find((item) => item.id === midpoint.pointId);
  const drag = land();
  assert.equal(drag.step, 'construct-drag');
  assert.deepEqual(practice.selection, [drag.pointId]);
  assert.equal(practice.board.points.find((item) => item.id === drag.pointId).kind, 'free');
  const auxiliary = land();
  const parked = practice.board.points.find((item) => item.id === auxiliary.pointId);
  assert.equal(auxiliary.step, 'construct-auxiliary');
  assert.equal(practice.auxiliary, false);
  assert.equal(parked.x, beforeDrag.x);
  assert.equal(parked.y, beforeDrag.y);
  const off = land();
  assert.equal(off.step, 'construct-auxiliary-off');
  assert.equal(practice.auxiliary, true);
  assert.equal(practice.board.elements.some((item) => item.role === 'auxiliary'), false);
  const storage = new Map();
  const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const basics = createGeometryBasicsChapter({ G, emptyFrame: frames.empty, createGoal: createGeometryPractice });
  const construct = chapter();
  let progress = createPracticeProgress({ mode: 'geometry', chapters: [basics, construct], storage: adapter, validateFrame: frames.validate });
  const entered = progress.enter();
  const drawn = G.reduce(entered.frame.board, { type: 'addPoint', x: 100, y: 100 });
  progress.observe({ type: 'draw', tool: 'point', before: entered.frame.board, after: drawn }, { ...entered.frame, board: drawn });
  const opened = progress.enter('geometry-construct');
  assert.equal(opened.goal.step, 'construct-parallelogram');
  assert.ok(opened.frame.board.points.length >= 3);
  assert.equal(opened.frame.board.elements.some((item) => item.type === 'parallelogram'), false);
  const skipped = progress.skip();
  assert.equal(skipped.goal.step, 'construct-rectangle');
  assert.equal(skipped.chapters.find((item) => item.id === 'geometry-construct').states[0], 'skipped');
  progress.retryStep(0);
  assert.equal(progress.snapshot().goal.step, 'construct-parallelogram');
  assert.equal(progress.snapshot().supplementing, true);
  progress.skip();
  assert.equal(progress.snapshot().goal.step, 'construct-rectangle');
  assert.equal(progress.snapshot().supplementing, false);
  progress.reset();
  assert.equal(progress.snapshot().goal.step, 'construct-rectangle');
  progress.enter('geometry-construct', { retry: true });
  assert.equal(progress.snapshot().goal.step, 'construct-parallelogram');
  assert.equal(progress.snapshot().chapters.find((item) => item.id === 'geometry-basics').states[0], 'completed');
  progress = createPracticeProgress({ mode: 'geometry', chapters: [basics, construct], storage: adapter, validateFrame: frames.validate });
  assert.equal(progress.enter().goal.step, 'construct-parallelogram');
  assert.equal(storage.has('baicai-edu-math-board:geometry:v1:tabbed'), false);
  assert.equal(typeof storage.get('baicai-edu-math-board:practice:v2:geometry'), 'string');
});

function copyPoint(board, id, dx, dy) {
  const next = JSON.parse(JSON.stringify(board));
  const point = next.points.find((item) => item.id === id);
  point.x += dx;
  point.y += dy;
  return next;
}
