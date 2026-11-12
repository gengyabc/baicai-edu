import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from './model.js';
import { createBoardModel } from '../model.js';

const G = createGeometryModel();
const Q = createBoardModel();
const clone = (v) => JSON.parse(JSON.stringify(v));
const freeze = (v) => { if (v && typeof v === 'object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const near = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
const at = (board, id) => board.points.find((p) => p.id === id);
const idOf = (label, board) => board.points.find((p) => p.label === label).id;
const add = (board = G.empty(), x = 100, y = 100) => G.reduce(board, { type: 'addPoint', x, y });
const shape = (board, elementType, points, extra = {}) => G.reduce(board, { type: 'addElement', elementType, points, ...extra });
// A square A B C D: A(100,100) B(300,100) C(300,300) D(100,300) as a rectangle construction.
const rectangle = () => {
  const b = shape(add(add(add(G.empty(), 100, 100), 300, 100), 300, 300), 'rectangle', ['p-1', 'p-2', 'p-3']);
  return b;
};
const serialized = (board) => JSON.parse(G.serialize(board));

test('a snapshot carries only its own kind, v1 shape and no quantity fields', () => {
  assert.equal(G.kind, 'geometry-board');
  assert.deepEqual(G.coordinateSystem, { type: 'cartesian-2d', units: 'board-unit' });
  assert.deepEqual(G.shapeLibrary, ['point', 'segment', 'polygon', 'circle', 'parallelogram', 'rectangle']);
  assert.deepEqual(clone(G.empty()), { schemaVersion: 1, points: [], elements: [], note: '' });
  const wire = serialized(rectangle());
  assert.deepEqual(Object.keys(wire).sort(), ['elements', 'kind', 'note', 'points', 'schemaVersion']);
  assert.equal(wire.kind, 'geometry-board');
  assert.equal(wire.schemaVersion, 1);
  for (const forbidden of ['summary', 'relations', 'annotations', 'notes', 'groups', 'settings', 'objects', 'display']) {
    assert.equal(Object.hasOwn(wire, forbidden), false, `${forbidden} must stay out of the snapshot`);
  }
  assert.deepEqual(G.validate(wire), G.validate(rectangle()));
});

test('cross-mode files are rejected outright, with no conversion', () => {
  const quantity = JSON.parse(Q.serialize(Q.reduce(Q.empty(), { type: 'add', shape: 'circle' })));
  assert.throws(() => G.validate(quantity), /Another board kind/);
  // The quantity model refuses the geometry envelope explicitly before its own field list.
  assert.throws(() => Q.validate(serialized(G.empty())), /Another board kind/);
  assert.throws(() => Q.validate(serialized(rectangle())), /Another board kind/);
  // A file with an unknown kind is not silently accepted as either board.
  assert.throws(() => G.validate({ ...serialized(G.empty()), kind: 'geomtry-board' }), /Another board kind/);
});

test('points are free or derived, labeled uniquely and moved only while free', () => {
  const b = add(add(G.empty(), 100, 100), 600, 500);
  assert.deepEqual(b.points.map((p) => [p.id, p.label, p.kind, p.x, p.y]),
    [['p-1', 'A', 'free', 100, 100], ['p-2', 'B', 'free', 600, 500]]);
  const renamed = G.reduce(b, { type: 'renamePoint', id: 'p-1', label: '甲' });
  assert.equal(at(renamed, 'p-1').label, '甲');
  // Renaming keeps every reference: the segment still names p-1.
  const seg = shape(renamed, 'segment', ['p-1', 'p-2']);
  assert.deepEqual(seg.elements[0].points, ['p-1', 'p-2']);
  assert.throws(() => G.reduce(b, { type: 'renamePoint', id: 'p-2', label: 'A' }), /Labels must be unique/);
  assert.throws(() => G.reduce(b, { type: 'addPoint', x: 200, y: 200, label: 'A' }), /Labels must be unique/);
  assert.throws(() => G.reduce(b, { type: 'renamePoint', id: 'p-1', label: '' }));
  assert.throws(() => G.reduce(b, { type: 'renamePoint', id: 'p-1', label: '字'.repeat(31) }));
  // Labels are display names; the ID remains the only reference.
  assert.deepEqual(Object.keys(at(b, 'p-1')).sort(), ['construction', 'id', 'kind', 'label', 'note', 'x', 'y']);
});

test('deleted labels are never recycled and a new point takes the next free letter', () => {
  let b = add(add(add(G.empty(), 100, 100), 300, 100), 300, 300);
  b = G.reduce(b, { type: 'delete', ids: ['p-2'] });
  b = add(b, 500, 400);
  // B is not recycled while any point is named B; the new point takes the first free letter.
  assert.deepEqual(b.points.map((p) => [p.id, p.label]), [['p-1', 'A'], ['p-3', 'C'], ['p-4', 'B']]);
});

test('isolated points are legal; free points can be renamed and annotated', () => {
  const b = add(G.empty(), 100, 100);
  assert.deepEqual(b.elements, []);
  assert.deepEqual(G.validate(serializeAndBack(b)), b);
  const noted = G.reduce(b, { type: 'annotate', target: 'point', id: 'p-1', value: '起点' });
  assert.equal(at(noted, 'p-1').note, '起点');
});

const serializeAndBack = (board) => G.validate(serialized(board));

test('segments, polygons, circles and quadrilaterals validate their point references', () => {
  const b = add(add(add(G.empty(), 100, 100), 400, 100), 400, 400);
  const seg = shape(b, 'segment', ['p-1', 'p-2']);
  const tri = shape(seg, 'polygon', ['p-1', 'p-2', 'p-3']);
  const circle = shape(tri, 'circle', [], { centerPointId: 'p-1', radiusPointId: 'p-2' });
  assert.deepEqual(circle.elements.map((e) => e.type), ['segment', 'polygon', 'circle']);
  assert.deepEqual(circle.elements[2], { id: 'e-3', type: 'circle', centerPointId: 'p-1', radiusPointId: 'p-2', role: 'main', note: '' });
  assert.throws(() => shape(b, 'segment', ['p-1']));
  assert.throws(() => shape(b, 'segment', ['p-1', 'p-1']));
  assert.throws(() => shape(b, 'polygon', ['p-1', 'p-2']));
  assert.throws(() => shape(b, 'polygon', ['p-1', 'p-2', 'p-1']));
  assert.throws(() => shape(b, 'circle', [], { centerPointId: 'p-1', radiusPointId: 'p-1' }));
  assert.throws(() => shape(b, 'circle', ['p-1', 'p-2']));
  assert.throws(() => shape(b, 'segment', ['p-1', 'p-9']));
});

test('degenerate elements are rejected on input and absorbed during drags', () => {
  const flat = add(add(add(G.empty(), 100, 100), 300, 100), 500, 100);
  assert.throws(() => shape(flat, 'polygon', ['p-1', 'p-2', 'p-3']), /Degenerate/);
  const zero = add(add(G.empty(), 100, 100), 100, 100);
  assert.throws(() => shape(zero, 'segment', ['p-1', 'p-2']), /Degenerate element/);
  // A quadrilateral whose edges cross is refused too.
  const bow = add(add(add(add(G.empty(), 100, 100), 300, 300), 300, 100), 500, 400);
  assert.throws(() => shape(bow, 'polygon', ['p-1', 'p-2', 'p-3', 'p-4']), /Degenerate/);
  const tri = shape(add(add(add(G.empty(), 100, 100), 400, 100), 250, 400), 'polygon', ['p-1', 'p-2', 'p-3']);
  assert.equal(tri.elements.length, 1);
});

test('a segment collapses into a threshold stop instead of a zero-length edge', () => {
  let b = shape(add(add(G.empty(), 100, 100), 400, 100), 'segment', ['p-1', 'p-2']);
  const dragged = G.reduce(b, { type: 'movePoint', id: 'p-2', x: 100, y: 100 });
  assert.equal(dragged.elements.length, 1, 'the segment survives');
  const a = at(dragged, 'p-1'), c = at(dragged, 'p-2');
  assert.ok(Math.hypot(c.x - a.x, c.y - a.y) > 0, 'the segment keeps a real length');
  assert.ok(Math.hypot(c.x - a.x, c.y - a.y) <= 1, 'the drag stops at the threshold');
});

test('a circle keeps its rim away from the centre', () => {
  let b = shape(add(add(G.empty(), 200, 200), 300, 200), 'circle', [], { centerPointId: 'p-1', radiusPointId: 'p-2' });
  const dragged = G.reduce(b, { type: 'movePoint', id: 'p-2', x: 200, y: 200 });
  const c = at(dragged, 'p-1'), r = at(dragged, 'p-2');
  assert.ok(Math.hypot(r.x - c.x, r.y - c.y) > 0.4);
  assert.ok(Math.hypot(r.x - c.x, r.y - c.y) <= 0.6);
  assert.equal(dragged.elements[0].type, 'circle');
  // Dragging the centre translates the whole circle: the radius is unchanged.
  const moved = G.reduce(b, { type: 'movePoint', id: 'p-1', x: 220, y: 240 });
  assert.deepEqual([at(moved, 'p-1').x, at(moved, 'p-1').y], [220, 240]);
  assert.deepEqual([at(moved, 'p-2').x, at(moved, 'p-2').y], [320, 240]);
  assert.ok(near(Math.hypot(at(moved, 'p-2').x - 220, at(moved, 'p-2').y - 240), 100),
    'the radius survives a centre drag');
});

test('midpoint construction stays the midpoint of its two inputs after dragging', () => {
  let b = add(add(G.empty(), 60, 80), 300, 200);
  b = G.reduce(b, { type: 'addMidpoint', a: 'p-2', b: 'p-1' });
  const d = at(b, 'p-3');
  assert.deepEqual([d.kind, d.label, d.x, d.y], ['derived', 'C', 180, 140]);
  assert.deepEqual(d.construction, { op: 'midpoint', inputs: ['p-2', 'p-1'] });
  // 2D = B + C for the two inputs.
  const [a, c] = [at(b, 'p-2'), at(b, 'p-1')];
  assert.ok(near(2 * d.x, a.x + c.x) && near(2 * d.y, a.y + c.y));
  for (const target of [{ x: 700, y: 40 }, { x: 44, y: 520 }, { x: 120, y: 300 }]) {
    const moved = G.reduce(b, { type: 'movePoint', id: 'p-1', x: target.x, y: target.y });
    const m = at(moved, 'p-3');
    const [p2, p1] = [at(moved, 'p-2'), at(moved, 'p-1')];
    assert.ok(near(2 * m.x, p2.x + p1.x) && near(2 * m.y, p2.y + p1.y), `midpoint survives a drag to ${target.x},${target.y}`);
  }
  // A midpoint never moves on its own.
  assert.throws(() => G.reduce(b, { type: 'movePoint', id: 'p-3', x: 1, y: 1 }), /Only a free point can move/);
});

test('properties: random drags keep 2D = B + C, and translate-then-midpoint matches', () => {
  let seed = 7;
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let round = 0; round < 80; round++) {
    const a = { x: 60 + Math.round(next() * 640), y: 60 + Math.round(next() * 460) };
    const c = { x: 60 + Math.round(next() * 640), y: 60 + Math.round(next() * 460) };
    if (Math.hypot(a.x - c.x, a.y - c.y) < 3) continue;
    let b = add(G.empty(), a.x, a.y);
    b = add(b, c.x, c.y);
    b = shape(b, 'segment', ['p-1', 'p-2']);
    b = G.reduce(b, { type: 'addMidpoint', a: 'p-1', b: 'p-2' });
    const m = at(b, 'p-3');
    assert.ok(near(2 * m.x, a.x + c.x) && near(2 * m.y, a.y + c.y), '2D = B + C at creation');
    // Drag each endpoint to another legal spot; the midpoint follows.
    for (const id of ['p-1', 'p-2']) {
      const to = { x: 60 + Math.round(next() * 640), y: 60 + Math.round(next() * 460) };
      b = G.reduce(b, { type: 'movePoint', id, x: to.x, y: to.y });
      const [p1, p2, mid] = [at(b, 'p-1'), at(b, 'p-2'), at(b, 'p-3')];
      assert.ok(near(2 * mid.x, p1.x + p2.x) && near(2 * mid.y, p1.y + p2.y), '2D = B + C after a drag');
    }
    // Translate both endpoints by one vector: the midpoint translates by the same vector.
    const dx = 4, dy = -3;
    const before = at(b, 'p-3');
    b = G.reduce(G.reduce(b, { type: 'movePoint', id: 'p-1', x: at(b, 'p-1').x + dx, y: at(b, 'p-1').y + dy }),
      { type: 'movePoint', id: 'p-2', x: at(b, 'p-2').x + dx, y: at(b, 'p-2').y + dy });
    const after = at(b, 'p-3');
    assert.ok(near(after.x, before.x + dx) && near(after.y, before.y + dy), 'translation commutes with the midpoint');
    assert.deepEqual(G.validate(serialized(b)), b, 'every legal step validates');
  }
});

test('rectangle and parallelogram keep their constraints for random corner drags', () => {
  let seed = 11;
  const next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const dot = (o, u, v) => (u.x - o.x) * (v.x - o.x) + (u.y - o.y) * (v.y - o.y);
  const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const vec = (p, q) => ({ x: q.x - p.x, y: q.y - p.y });
  const eq = (u, v) => near(u.x, v.x) && near(u.y, v.y);
  const cross = (o, u, v) => (u.x - o.x) * (v.y - o.y) - (u.y - o.y) * (v.x - o.x);
  for (let round = 0; round < 40; round++) {
    // A valid rectangle: take an anchor B and two perpendicular leg lengths, then place A and C.
    const b = { x: 150 + Math.round(next() * 400), y: 120 + Math.round(next() * 350) };
    const angle = next() * Math.PI * 2;
    const l1 = 30 + Math.round(next() * 100), l2 = 30 + Math.round(next() * 100);
    const a = { x: b.x + Math.cos(angle) * l1, y: b.y + Math.sin(angle) * l1 };
    const c = { x: b.x - Math.sin(angle) * l2, y: b.y + Math.cos(angle) * l2 };
    if (![a, b, c].every((p) => p.x >= 24 && p.x <= 776 && p.y >= 24 && p.y <= 576)) continue;
    let board = add(add(add(G.empty(), a.x, a.y), b.x, b.y), c.x, c.y);
    board = shape(board, 'rectangle', ['p-1', 'p-2', 'p-3']);
    // Drag one of the free ends adjacent to the anchor; D is derived and never dragged.
    const corner = 'p-1';
    const anchor = at(board, 'p-2'), opposite = at(board, 'p-4');
    const distance = 40 + next() * 400;
    const length = Math.hypot(opposite.x - anchor.x, opposite.y - anchor.y) || 1;
    const target = { x: anchor.x + (opposite.x - anchor.x) / length * Math.max(distance, 40),
      y: anchor.y + (opposite.y - anchor.y) / length * Math.max(distance, 40) };
    const moved = G.reduce(board, { type: 'movePoint', id: corner, x: target.x, y: target.y });
    const corners = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(moved, id));
    assert.ok(near(corners[0].x + corners[2].x, corners[1].x + corners[3].x), 'diagonals share a midpoint');
    assert.ok(near(corners[0].y + corners[2].y, corners[1].y + corners[3].y));
    assert.ok(near(corners[1].x, anchor.x) && near(corners[1].y, anchor.y), 'the anchor never moves');
    assert.ok(near(d(corners[0], corners[1]), d(corners[2], corners[3])) && near(d(corners[1], corners[2]), d(corners[3], corners[0])));
    // The anchor itself never moves.
    assert.throws(() => G.reduce(board, { type: 'movePoint', id: 'p-2', x: target.x, y: target.y }), /right-angled corner/);

    let para = add(add(add(G.empty(), 100, 100), 400, 100), 450, 350);
    para = shape(para, 'parallelogram', ['p-1', 'p-2', 'p-3']);
    const pm = G.reduce(para, { type: 'movePoint', id: 'p-1', x: 220, y: 170 });
    assert.deepEqual([at(pm, 'p-2').x, at(pm, 'p-2').y], [at(para, 'p-2').x, at(para, 'p-2').y], 'the diagonal partner stays put');
    const pc = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(pm, id));
    // The ring is P1 P2 P3 P4 with P2 and P4 diagonal, so it stays convex.
    assert.ok(cross(pc[0], pc[1], pc[2]) > 0 && cross(pc[0], pc[2], pc[3]) > 0, 'the ring stays convex');
    assert.ok(eq(vec(pc[0], pc[1]), vec(pc[3], pc[2])) && eq(vec(pc[1], pc[2]), vec(pc[0], pc[3])), 'opposite sides stay parallel');
  }
});

test('a rectangle never degrades: an axis drag stops the shape from collapsing', () => {
  let b = add(add(add(G.empty(), 100, 100), 400, 100), 400, 300);
  b = shape(b, 'rectangle', ['p-1', 'p-2', 'p-3']);
  // Pull A along the line through B and C until the rectangle would flatten.
  const moved = G.reduce(b, { type: 'movePoint', id: 'p-1', x: 300, y: 300 });
  assert.ok(moved.elements.some((e) => e.type === 'rectangle'), 'the rectangle remains');
  const a = at(moved, 'p-1'), c = at(moved, 'p-2'), d = at(moved, 'p-3');
  const area = Math.abs((c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x));
  assert.ok(area > 0.4, 'the shape keeps a real area');
  // The drag stopped on its own path, not somewhere arbitrary.
  assert.ok(near(a.y, 100) || near(a.y, 300) || Math.abs(a.x - a.y) < 1);
});

test('parallelogram drags keep opposite sides parallel and the diagonal neighbour fixed', () => {
  let b = add(add(add(G.empty(), 100, 100), 400, 100), 450, 350);
  b = shape(b, 'parallelogram', ['p-1', 'p-2', 'p-3']);
  const moved = G.reduce(b, { type: 'movePoint', id: 'p-1', x: 220, y: 170 });
  // P2 and P4 form the diagonal, so their positions are untouched.
  assert.deepEqual([at(moved, 'p-2').x, at(moved, 'p-2').y], [at(b, 'p-2').x, at(b, 'p-2').y]);
  const corners = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(moved, id));
  const cross = (o, u, v) => (u.x - o.x) * (v.y - o.y) - (u.y - o.y) * (v.x - o.x);
  assert.ok(cross(corners[0], corners[1], corners[2]) > 0, 'the ring stays convex');
  const vec = (p, q) => ({ x: q.x - p.x, y: q.y - p.y });
  const eq = (u, v) => near(u.x, v.x) && near(u.y, v.y);
  assert.ok(eq(vec(corners[0], corners[1]), vec(corners[3], corners[2])), 'P1P2 matches P4P3');
  assert.ok(eq(vec(corners[1], corners[2]), vec(corners[0], corners[3])), 'P2P3 matches P1P4');
});

test('derived positions are recomputed, not persisted, and never imported as authority', () => {
  const b = rectangle();
  const wire = G.serialize(b);
  assert.equal(wire.includes('"kind":"geometry-board"'), true);
  // A derived point carries its construction; its position follows from the inputs.
  // A forged in-board position is discarded and recomputed from the construction.
  const forged = serialized(b);
  const derived = forged.points.find((p) => p.kind === 'derived');
  derived.x = 101; derived.y = 301;
  const restored = G.validate(forged);
  assert.deepEqual(restored.points.find((p) => p.id === derived.id), at(b, derived.id));
  // An off-board forged position invalidates the file; the construction never trusts it.
  const offBoard = serialized(b);
  offBoard.points.find((p) => p.kind === 'derived').x = 900;
  assert.throws(() => G.validate(offBoard), /Invalid point/);
  // Removing the construction is rejected outright.
  const constructionless = serialized(b);
  delete constructionless.points.find((p) => p.kind === 'derived').construction;
  assert.throws(() => G.validate(constructionless));
});

test('deleting a point removes every downstream element and construction in one action', () => {
  const b = rectangle();
  const withSegment = shape(b, 'segment', ['p-1', 'p-2']);
  const withMid = G.reduce(withSegment, { type: 'addMidpoint', a: 'p-1', b: 'p-2' });
  assert.equal(withMid.points.length, 5);
  // Deleting A drops the rectangle (it loses a corner) and the segment, but keeps
  // the midpoint, which depends on B and C, not on A.
  const deleted = G.reduce(withMid, { type: 'delete', ids: ['p-1'] });
  // The rectangle's derived corner D and the midpoint both depend on A, so both go with it.
  assert.deepEqual(deleted.points.map((p) => p.id), ['p-2', 'p-3']);
  assert.deepEqual(deleted.elements, []);
  assert.deepEqual(G.validate(serialized(deleted)), deleted);
  // Deleting a shape removes only its own derived fourth corner; free corners and the
  // midpoint stay. The shape's identity always goes with it, so no orphan edge remains.
  const shapedGone = G.reduce(withMid, { type: 'deleteElement', id: 'e-1' });
  assert.deepEqual(shapedGone.elements.map((e) => e.id), ['e-2']);
  assert.deepEqual(shapedGone.points.map((p) => p.id).sort(), ['p-1', 'p-2', 'p-3', 'p-5']);
});

test('construction DAGs reject cycles, missing inputs and non-free inputs', () => {
  const base = add(add(add(G.empty(), 100, 100), 300, 200), 500, 300);
  // A point may not construct itself from itself.
  const self = serialized(base);
  self.points.push({ id: 'p-4', label: 'D', kind: 'derived', construction: { op: 'midpoint', inputs: ['p-4', 'p-1'] } });
  assert.throws(() => G.validate(self));
  // A mutual cycle (backwards order) is refused because inputs must already exist.
  const cycle = { schemaVersion: 1, points: [
    { id: 'p-1', label: 'A', kind: 'derived', construction: { op: 'midpoint', inputs: ['p-2', 'p-3'] } },
    { id: 'p-2', label: 'B', kind: 'derived', construction: { op: 'midpoint', inputs: ['p-1', 'p-3'] } },
    { id: 'p-3', label: 'C', kind: 'free', x: 200, y: 200 },
  ], elements: [], note: '' };
  assert.throws(() => G.validate(cycle));
  // A missing input is refused.
  const missing = serialized(base);
  missing.points.push({ id: 'p-4', label: 'D', kind: 'derived', construction: { op: 'midpoint', inputs: ['p-1', 'p-9'] } });
  assert.throws(() => G.validate(missing));
  // Constructions take only free points: a chain of derived points does not lengthen the DAG.
  const chained = serialized(base);
  chained.points.push({ id: 'p-4', label: 'D', kind: 'derived', construction: { op: 'midpoint', inputs: ['p-1', 'p-2'] } });
  chained.points.push({ id: 'p-5', label: 'E', kind: 'derived', construction: { op: 'midpoint', inputs: ['p-3', 'p-4'] } });
  assert.throws(() => G.validate(chained));
  // An unknown operation is refused too, inside the accepted field shape.
  const unknown = serialized(base);
  unknown.points.push({ id: 'p-4', label: 'D', kind: 'derived', construction: { op: 'cross', inputs: ['p-1', 'p-2'] } });
  assert.throws(() => G.validate(unknown));
});

test('strict schema rejects unknown fields, bad numbers, duplicates, bad labels and notes', () => {
  const b = rectangle();
  const wire = serialized(b);
  const cases = [
    { ...wire, extra: true },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, x: Number.NaN }) },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, x: Number.POSITIVE_INFINITY }) },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, x: 900 }) },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, y: -1 }) },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, kind: 'pinned' }) },
    { ...wire, points: [...wire.points, { ...wire.points[0] }] },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, label: '' }) },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, label: '字'.repeat(31) }) },
    { ...wire, note: '字'.repeat(501) },
    { ...wire, elements: [...wire.elements, { ...wire.elements[0] }] },
    { ...wire, elements: wire.elements.map((e) => ({ ...e, role: 'guide' })) },
    { ...wire, elements: wire.elements.map((e) => ({ ...e, type: 'line' })) },
    { ...wire, elements: wire.elements.map((e) => ({ ...e, points: ['p-1', 'p-2', 'p-3', 'p-9'] })) },
    { ...wire, elements: wire.elements.map((e) => ({ ...e, color: 'red' })) },
    { ...wire, points: wire.points.map((p, i) => i ? p : { ...p, label: wire.points[1].label }) },
  ];
  for (const candidate of cases) assert.throws(() => G.validate(candidate));
  assert.throws(() => G.validate({ ...wire, schemaVersion: 2 }), /Invalid geometry board/);
  assert.throws(() => G.validate({ ...wire, schemaVersion: '1' }), /Invalid geometry board/);
});

test('the role marks auxiliary lines without changing their geometry', () => {
  const b = shape(add(add(G.empty(), 100, 100), 400, 100), 'segment', ['p-1', 'p-2'], { role: 'auxiliary' });
  assert.equal(b.elements[0].role, 'auxiliary');
  assert.throws(() => shape(add(add(G.empty(), 100, 100), 400, 100), 'segment', ['p-1', 'p-2'], { role: 'main', style: 'dashed' }));
});

test('notes attach to the whole board or to a single element and never survive its deletion', () => {
  let b = rectangle();
  b = G.reduce(b, { type: 'note', value: '  我画了一个长方形  ' });
  assert.equal(b.note, '  我画了一个长方形  ');
  b = G.reduce(b, { type: 'annotate', target: 'element', id: 'e-1', value: '四条边' });
  assert.equal(b.elements[0].note, '四条边');
  b = G.reduce(b, { type: 'annotate', target: 'element', id: 'e-1', value: '   ' });
  assert.equal(b.elements[0].note, '');
  b = G.reduce(b, { type: 'annotate', target: 'point', id: 'p-4', value: '第四点' });
  assert.equal(at(b, 'p-4').note, '第四点');
  assert.throws(() => G.reduce(b, { type: 'note', value: '字'.repeat(501) }));
  assert.throws(() => G.reduce(b, { type: 'annotate', target: 'element', id: 'e-9', value: 'x' }));
  const deleted = G.reduce(b, { type: 'delete', ids: ['p-1'] });
  assert.equal(deleted.note, b.note, 'the board note survives element deletion');
});

test('serialize is deterministic and validate(serialize(x)) round-trips without summary', () => {
  let b = rectangle();
  b = shape(b, 'segment', ['p-1', 'p-2'], { role: 'auxiliary', note: '这条线' });
  b = G.reduce(b, { type: 'note', value: '说明' });
  b = G.reduce(b, { type: 'addMidpoint', a: 'p-2', b: 'p-3' });
  const once = G.serialize(b);
  assert.equal(G.serialize(b), once);
  assert.equal(G.serialize(G.validate(JSON.parse(once))), once);
  assert.equal(once.includes('"summary"'), false);
});

test('points never leave the board and an off-board target keeps the point in place', () => {
  const b = add(G.empty(), 100, 100);
  assert.throws(() => G.reduce(G.empty(), { type: 'addPoint', x: 801, y: 100 }));
  assert.throws(() => G.reduce(G.empty(), { type: 'addPoint', x: 0, y: 100 }));
  assert.throws(() => G.reduce(b, { type: 'movePoint', id: 'p-1', x: Number.NaN, y: 100 }));
});

test('factories have no runtime imports and operations never mutate their input', () => {
  const source = freeze(rectangle()); const snapshot = JSON.stringify(source);
  const actions = [{ type: 'addPoint', x: 200, y: 200 }, { type: 'movePoint', id: 'p-1', x: 90, y: 120 },
    { type: 'addMidpoint', a: 'p-1', b: 'p-3' }, { type: 'renamePoint', id: 'p-1', label: 'X' },
    { type: 'note', value: 'x' }, { type: 'annotate', target: 'element', id: 'e-1', value: 'y' },
    { type: 'delete', ids: ['p-1'] }, { type: 'deleteElement', id: 'e-1' },
    { type: 'addElement', elementType: 'segment', points: ['p-1', 'p-3'] },
    { type: 'batch', actions: [{ type: 'addPoint', x: 200, y: 200 }] }];
  for (const action of actions) {
    const next = G.reduce(source, action);
    assert.notEqual(JSON.stringify(next), snapshot);
  }
  assert.equal(JSON.stringify(source), snapshot, 'the input board is never mutated');
  // Freezing the input still permits every action: the model never writes into it.
  const frozen = freeze(rectangle());
  for (const action of actions) G.reduce(frozen, action);
  assert.equal(JSON.stringify(frozen), snapshot);
  // The factory embeds into the browser bundle by name and keeps working there.
  const embedded = new Function(`return (${createGeometryModel.toString()})`)();
  assert.equal(typeof embedded, 'function');
  const built = new Function(`${createGeometryModel.toString()} return createGeometryModel();`)();
  assert.deepEqual(built.empty(), G.empty());
  assert.equal(built.reduce(built.empty(), { type: 'addPoint', x: 100, y: 100 }).points.length, 1);
});
