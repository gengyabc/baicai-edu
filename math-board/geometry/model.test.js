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
  assert.deepEqual(G.shapeLibrary, ['point', 'segment', 'polygon', 'circle', 'parallelogram', 'rectangle', 'text']);
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
  // A deleted label is never recycled: the next point is named from its own number.
  assert.deepEqual(b.points.map((p) => [p.id, p.label]), [['p-1', 'A'], ['p-3', 'C'], ['p-4', 'D']]);
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

test('dragging any quadrilateral corner keeps its diagonal partner and every right angle', () => {
  // spec.md:32 「拖任一角，其对角不动，另两角按直角重算」
  const dot = (o, u, v) => (u.x - o.x) * (v.x - o.x) + (u.y - o.y) * (v.y - o.y);
  const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  const vec = (p, q) => ({ x: q.x - p.x, y: q.y - p.y });
  const eq = (u, v) => near(u.x, v.x) && near(u.y, v.y);
  const cross = (o, u, v) => (u.x - o.x) * (v.y - o.y) - (u.y - o.y) * (v.x - o.x);
  // The ring is P1 P2 P3 P4, and P1/P3 and P2/P4 are the diagonal pairs.
  const partners = { 'p-1': 'p-3', 'p-3': 'p-1', 'p-2': 'p-4', 'p-4': 'p-2' };
  const square = shape(add(add(add(G.empty(), 100, 100), 400, 100), 400, 300), 'rectangle', ['p-1', 'p-2', 'p-3']);
  for (const [corner, target] of [['p-1', { x: 150, y: 140 }], ['p-2', { x: 380, y: 120 }],
    ['p-3', { x: 380, y: 260 }], ['p-4', { x: 150, y: 300 }]]) {
    // A derived corner is not a drag handle at all (the view never offers it either).
    if (at(square, corner).kind === 'derived') {
      assert.throws(() => G.reduce(square, { type: 'movePoint', id: corner, x: target.x, y: target.y }), /Only a free point can move/);
      continue;
    }
    const moved = G.reduce(square, { type: 'movePoint', id: corner, x: target.x, y: target.y });
    const ring = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(moved, id));
    // The corner follows the pointer, the diagonal partner stays exactly put.
    assert.ok(eq(at(moved, corner), target), `${corner} follows the pointer`);
    assert.ok(eq(at(moved, partners[corner]), at(square, partners[corner])), `${corner}: the diagonal partner stays put`);
    // All four angles stay right: the dot product at each corner vanishes.
    for (const [o, u, v] of [[0, 1, 3], [1, 0, 2], [2, 1, 3], [3, 0, 2]]) {
      assert.ok(near(dot(ring[o], ring[u], ring[v]), 0), 'every corner stays right-angled');
    }
    assert.ok(eq(vec(ring[0], ring[1]), vec(ring[3], ring[2])), 'opposite sides stay parallel');
    assert.ok(near(d(ring[0], ring[2]), d(ring[1], ring[3])), 'the diagonals stay equal');
  }
  // The parallelogram follows the same rule (spec.md:31): the diagonal partner does not move.
  let para = add(add(add(G.empty(), 100, 100), 400, 100), 450, 350);
  para = shape(para, 'parallelogram', ['p-1', 'p-2', 'p-3']);
  for (const corner of ['p-1', 'p-2', 'p-3']) {
    const moved = G.reduce(para, { type: 'movePoint', id: corner, x: 220, y: 170 });
    assert.ok(eq(at(moved, partners[corner]), at(para, partners[corner])), `${corner}: the diagonal partner stays put`);
    const pc = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(moved, id));
    assert.ok(eq(vec(pc[0], pc[1]), vec(pc[3], pc[2])), 'opposite sides stay parallel');
    assert.ok(eq(vec(pc[1], pc[2]), vec(pc[0], pc[3])), 'opposite sides stay parallel');
  }
});

test('a rectangle click that misses the right angle still closes the rectangle', () => {
  // A freehand third click is not an exact right angle. The first side stays put; a new
  // free corner keeps only the perpendicular part of the click (the skewed seed point is
  // left alone), and the fourth corner is derived so the shape is a rectangle.
  let b = add(add(add(G.empty(), 120, 140), 340, 160), 360, 320);
  b = shape(b, 'rectangle', ['p-1', 'p-2', 'p-3']);
  assert.equal(b.elements.length, 1);
  assert.equal(b.elements[0].type, 'rectangle');
  assert.deepEqual(b.elements[0].points, ['p-1', 'p-2', 'p-4', 'p-5']);
  assert.deepEqual([at(b, 'p-3').x, at(b, 'p-3').y], [360, 320], 'the skewed seed stays put');
  const [a, corner, c, d] = ['p-1', 'p-2', 'p-4', 'p-5'].map((id) => at(b, id));
  assert.deepEqual([a.x, a.y, corner.x, corner.y], [120, 140, 340, 160]);
  const side = { x: a.x - corner.x, y: a.y - corner.y };
  const leg = { x: c.x - corner.x, y: c.y - corner.y };
  assert.ok(near(side.x * leg.x + side.y * leg.y, 0), 'the second corner stays a right angle');
  assert.equal(c.kind, 'free');
  assert.equal(d.kind, 'derived');
  assert.ok(near(d.x, a.x + c.x - corner.x) && near(d.y, a.y + c.y - corner.y));
  const click = { x: 360, y: 320 };
  const nx = -side.y, ny = side.x;
  const len2 = nx * nx + ny * ny;
  const h = ((click.x - corner.x) * nx + (click.y - corner.y) * ny) / len2;
  assert.ok(near(c.x, corner.x + h * nx) && near(c.y, corner.y + h * ny),
    'the new third corner keeps the click height and drops the skew');
  // A click with no height is still refused; it must not invent a flat rectangle.
  const flat = add(add(add(G.empty(), 100, 100), 300, 100), 450, 100);
  assert.throws(() => shape(flat, 'rectangle', ['p-1', 'p-2', 'p-3']), /Degenerate/);
});

test('a rectangle does not relocate a free vertex shared with another shape', () => {
  // Triangle ABC, then a rectangle on AB whose third input names C off the perpendicular.
  // C must stay put so the triangle is not warped; the rectangle gets its own third corner.
  let b = add(add(add(G.empty(), 100, 100), 300, 100), 200, 250);
  b = shape(b, 'polygon', ['p-1', 'p-2', 'p-3']);
  const before = { x: at(b, 'p-3').x, y: at(b, 'p-3').y };
  b = shape(b, 'rectangle', ['p-1', 'p-2', 'p-3']);
  assert.deepEqual([at(b, 'p-3').x, at(b, 'p-3').y], [before.x, before.y], 'triangle vertex stays put');
  const triangle = b.elements.find((e) => e.type === 'polygon');
  assert.deepEqual(triangle.points, ['p-1', 'p-2', 'p-3']);
  const rect = b.elements.find((e) => e.type === 'rectangle');
  assert.ok(rect);
  assert.notEqual(rect.points[2], 'p-3', 'rectangle owns a fresh third corner');
  const [a, corner, c] = [rect.points[0], rect.points[1], rect.points[2]].map((id) => at(b, id));
  const side = { x: a.x - corner.x, y: a.y - corner.y };
  const leg = { x: c.x - corner.x, y: c.y - corner.y };
  assert.ok(near(side.x * leg.x + side.y * leg.y, 0), 'rectangle keeps a right angle at P2');
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
  // spec.md:31 「拖任一角，其对角不动，另两角重算」
  const vec = (p, q) => ({ x: q.x - p.x, y: q.y - p.y });
  const eq = (u, v) => near(u.x, v.x) && near(u.y, v.y);
  const cross = (o, u, v) => (u.x - o.x) * (v.y - o.y) - (u.y - o.y) * (v.x - o.x);
  let b = add(add(add(G.empty(), 100, 100), 400, 100), 450, 350);
  b = shape(b, 'parallelogram', ['p-1', 'p-2', 'p-3']);
  const moved = G.reduce(b, { type: 'movePoint', id: 'p-1', x: 220, y: 170 });
  // The partner of P1 is P3: it stays exactly where it was, and P1 follows the pointer.
  const partner = at(b, 'p-3');
  assert.deepEqual([at(moved, 'p-3').x, at(moved, 'p-3').y], [partner.x, partner.y],
    'the diagonal partner does not move');
  assert.deepEqual([at(moved, 'p-1').x, at(moved, 'p-1').y], [220, 170]);
  const corners = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(moved, id));
  assert.ok(cross(corners[0], corners[1], corners[2]) * cross(corners[0], corners[2], corners[3]) > 0, 'the ring stays simple');
  assert.ok(eq(vec(corners[0], corners[1]), vec(corners[3], corners[2])), 'P1P2 matches P4P3');
  assert.ok(eq(vec(corners[1], corners[2]), vec(corners[0], corners[3])), 'P2P3 matches P1P4');
  // The shared midpoint of the diagonals holds: a parallelogram bisects its diagonals.
  const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  assert.ok(eq(mid(corners[0], corners[2]), mid(corners[1], corners[3])), 'diagonals bisect each other');
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

test('four free corners and a misplaced derived point get different refusals', () => {
  // A rectangle drawn by hand from four free corners is a polygon. The remedy is a
  // different element type, so the refusal must not talk about point order.
  const square = shape(add(add(add(add(G.empty(), 100, 100), 300, 100), 300, 300), 100, 300), 'polygon',
    ['p-1', 'p-2', 'p-3', 'p-4']);
  const allFree = serialized(square);
  allFree.elements[0].type = 'rectangle';
  assert.throws(() => G.validate(allFree), /Four free points are a polygon/);
  assert.throws(() => G.validate(allFree), (error) => !/fourth point last/.test(error.message));
  // A derived fourth corner that is simply not last keeps the ordering refusal.
  const b = rectangle();
  const reordered = serialized(b);
  const derivedId = reordered.elements[0].points[3];
  reordered.elements[0].points = [reordered.elements[0].points[0], derivedId,
    ...reordered.elements[0].points.slice(1, 3)];
  assert.throws(() => G.validate(reordered), /names its derived fourth point last/);
});

test('deleting a point removes every downstream element and construction in one action', () => {
  const b = rectangle();
  const withSegment = shape(b, 'segment', ['p-1', 'p-2']);
  const withMid = G.reduce(withSegment, { type: 'addMidpoint', a: 'p-1', b: 'p-2' });
  assert.equal(withMid.points.length, 5);
  // Deleting A drops the rectangle (it loses a corner) and the segment. The midpoint D
  // takes A as an input, so it loses a parent and goes with it (spec §4: a deletion
  // propagates to every downstream reference and never leaves a dangling one).
  const deleted = G.reduce(withMid, { type: 'delete', ids: ['p-1'] });
  // The rectangle's derived corner and the midpoint both reference A, so both go with it.
  assert.deepEqual(deleted.points.map((p) => p.id), ['p-2', 'p-3']);
  assert.deepEqual(deleted.elements, []);
  assert.deepEqual(G.validate(serialized(deleted)), deleted);
  // Deleting a shape removes only its own derived fourth corner; free corners and the
  // midpoint stay. The shape's identity always goes with it, so no orphan edge remains.
  const shapedGone = G.reduce(withMid, { type: 'deleteElement', id: 'e-1' });
  assert.deepEqual(shapedGone.elements.map((e) => e.id), ['e-2']);
  assert.deepEqual(shapedGone.points.map((p) => p.id).sort(), ['p-1', 'p-2', 'p-3', 'p-5']);
});

test('deleting a segment removes endpoints that nothing else uses', () => {
  const alone = shape(add(add(G.empty(), 100, 100), 300, 160), 'segment', ['p-1', 'p-2']);
  const cleared = G.reduce(alone, { type: 'delete', ids: ['e-1'] });
  assert.deepEqual(cleared.elements, []);
  assert.deepEqual(cleared.points, [], 'both endpoints existed only for that segment');
  // A shared endpoint stays, and so does a midpoint that still names the ends.
  let shared = shape(add(add(add(G.empty(), 100, 100), 300, 100), 300, 260), 'segment', ['p-1', 'p-2']);
  shared = shape(shared, 'segment', ['p-2', 'p-3']);
  shared = G.reduce(shared, { type: 'addMidpoint', a: 'p-1', b: 'p-2' });
  const oneSide = G.reduce(shared, { type: 'delete', ids: ['e-2'] });
  assert.deepEqual(oneSide.elements.map((e) => e.points), [['p-1', 'p-2']]);
  assert.deepEqual(oneSide.points.map((p) => p.id).sort(), ['p-1', 'p-2', 'p-4']);
  const withMid = G.reduce(oneSide, { type: 'deleteElement', id: 'e-1' });
  assert.deepEqual(withMid.elements, []);
  assert.deepEqual(withMid.points.map((p) => p.id).sort(), ['p-1', 'p-2', 'p-4'], 'the midpoint still uses the ends');
});

test('deleting one side of a polygon or rectangle leaves the other sides', () => {
  const tri = shape(add(add(add(G.empty(), 120, 80), 360, 90), 200, 320), 'polygon', ['p-1', 'p-2', 'p-3']);
  const opened = G.reduce(tri, { type: 'delete', ids: ['e-1#2'] });
  assert.deepEqual(opened.points.map((p) => p.id), ['p-1', 'p-2', 'p-3']);
  assert.deepEqual(opened.elements.map((e) => e.points), [['p-1', 'p-2'], ['p-2', 'p-3']]);
  // The vertex that loses both of its sides goes; the remaining side keeps its ends.
  const oneSide = G.reduce(opened, { type: 'delete', ids: [opened.elements[0].id] });
  assert.deepEqual(oneSide.elements.map((e) => e.points), [['p-2', 'p-3']]);
  assert.deepEqual(oneSide.points.map((p) => p.id), ['p-2', 'p-3']);
  const rect = G.reduce(rectangle(), { type: 'delete', ids: ['e-1#0'] });
  assert.deepEqual(rect.elements.map((e) => e.points), [['p-2', 'p-3'], ['p-3', 'p-4'], ['p-4', 'p-1']]);
  assert.equal(rect.points.length, 4, 'every corner of the remaining sides stays');
});

test('deleting a circle drops a rim point that only defined the radius', () => {
  const circle = shape(add(add(G.empty(), 200, 200), 320, 200), 'circle', [], { centerPointId: 'p-1', radiusPointId: 'p-2' });
  const removed = G.reduce(circle, { type: 'delete', ids: ['e-1'] });
  assert.deepEqual(removed.elements, []);
  assert.deepEqual(removed.points.map((p) => p.id), ['p-1'], 'the centre stays and the rim handle goes');
  // A rim that is also a segment end is a real point and stays when the circle goes.
  let shared = shape(add(add(G.empty(), 200, 200), 320, 200), 'segment', ['p-1', 'p-2']);
  shared = shape(shared, 'circle', [], { centerPointId: 'p-1', radiusPointId: 'p-2' });
  const circleGone = G.reduce(shared, { type: 'delete', ids: ['e-2'] });
  assert.deepEqual(circleGone.elements.map((e) => e.type), ['segment']);
  assert.deepEqual(circleGone.points.map((p) => p.id), ['p-1', 'p-2']);
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

test('a diagonal corner drag follows the pointer on both axes and absorbs at the threshold', () => {
  // spec.md:37 「退化被吸收在拖动阈值处」: the preview stops at the last legal position instead
  // of silently reading a diagonal request as a pure sideways move.
  const sq = shape(add(add(add(G.empty(), 100, 100), 400, 100), 400, 300), 'rectangle', ['p-1', 'p-2', 'p-3']);
  const preview = G.constrainedMove(sq, 'p-1', 160, 140);
  assert.ok(preview.x > 100 && preview.y > 100, 'both coordinates change on a diagonal request');
  const committed = G.reduce(sq, { type: 'movePoint', id: 'p-1', x: 160, y: 140 });
  assert.deepEqual([preview.x, preview.y], [at(committed, 'p-1').x, at(committed, 'p-1').y],
    'the preview is exactly the position the release commits');
  // A request that cannot be honoured stops short of the shape becoming degenerate.
  const flat = G.constrainedMove(sq, 'p-2', 400, 300);
  const landed = G.reduce(sq, { type: 'movePoint', id: 'p-2', x: 400, y: 300 });
  const ring = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(landed, id));
  const area = Math.abs((ring[1].x - ring[0].x) * (ring[2].y - ring[0].y) - (ring[1].y - ring[0].y) * (ring[2].x - ring[0].x));
  assert.ok(area > 0, 'the shape keeps a real area');
  assert.deepEqual([flat.x, flat.y], [at(landed, 'p-2').x, at(landed, 'p-2').y], 'the preview matches the absorbed release');
});

test('deleting a point never leaves a derived point referencing a missing parent', () => {
  // issue 16 「删除矩形任一角会删除该矩形与由它算出的派生角」; spec.md:43 「不留悬空引用」
  const b = rectangle();
  const withMid = G.reduce(b, { type: 'addMidpoint', a: 'p-1', b: 'p-2' });
  const deleted = G.reduce(withMid, { type: 'delete', ids: ['p-1'] });
  const ids = new Set(deleted.points.map((p) => p.id));
  for (const p of deleted.points) {
    for (const input of p.construction?.inputs || []) {
      assert.ok(ids.has(input), `${p.id} references ${input}, which no longer exists`);
    }
  }
  assert.deepEqual(deleted.points.map((p) => p.id), ['p-2', 'p-3'], 'the midpoint loses its parent and goes too');
  assert.deepEqual(G.validate(serialized(deleted)), deleted, 'validate round-trips the cascade');
  for (const e of deleted.elements) {
    for (const ref of e.type === 'circle' ? [e.centerPointId, e.radiusPointId] : e.points) {
      assert.ok(ids.has(ref), `${e.id} references ${ref}, which no longer exists`);
    }
  }
  // An isolated midpoint the student deleted gets the same transitive treatment.
  const chain = G.reduce(withMid, { type: 'delete', ids: ['p-5'] });
  assert.deepEqual(chain.points.map((p) => p.id), ['p-1', 'p-2', 'p-3', 'p-4']);
});

test('dragging an edge resizes that side and leaves the opposite side fixed', () => {
  const rect = rectangle();
  // A sideways component must not shear a rectangle: only the part perpendicular to the edge counts.
  const lower = G.reduce(rect, { type: 'moveEdge', id: 'e-1', index: 0, dx: 40, dy: 50 });
  assert.deepEqual([at(lower, 'p-1').x, at(lower, 'p-1').y], [100, 150]);
  assert.deepEqual([at(lower, 'p-2').x, at(lower, 'p-2').y], [300, 150]);
  assert.deepEqual([at(lower, 'p-3').x, at(lower, 'p-3').y], [300, 300], 'the opposite edge stays');
  assert.deepEqual([at(lower, 'p-4').x, at(lower, 'p-4').y], [100, 300], 'the opposite edge stays');
  const ring = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(lower, id));
  const dot = (o, u, v) => (u.x - o.x) * (v.x - o.x) + (u.y - o.y) * (v.y - o.y);
  for (const [o, u, v] of [[0, 1, 3], [1, 0, 2], [2, 1, 3], [3, 0, 2]]) {
    assert.ok(near(dot(ring[o], ring[u], ring[v]), 0), 'every corner stays right-angled');
  }
  // Pulling the same edge through the opposite side stops short of a flat rectangle.
  const flat = G.reduce(rect, { type: 'moveEdge', id: 'e-1', index: 0, dx: 0, dy: 400 });
  const height = at(flat, 'p-3').y - at(flat, 'p-1').y;
  assert.ok(height > 0.4 && height < 2, 'the drag stops at the threshold');
  assert.equal(at(flat, 'p-3').y, 300);
  assert.equal(at(flat, 'p-1').x, 100);

  let para = shape(add(add(add(G.empty(), 100, 100), 400, 100), 450, 350), 'parallelogram', ['p-1', 'p-2', 'p-3']);
  const slid = G.reduce(para, { type: 'moveEdge', id: 'e-1', index: 0, dx: 30, dy: 40 });
  assert.deepEqual([at(slid, 'p-1').x, at(slid, 'p-1').y], [130, 140]);
  assert.deepEqual([at(slid, 'p-2').x, at(slid, 'p-2').y], [430, 140]);
  assert.deepEqual([at(slid, 'p-3').x, at(slid, 'p-3').y], [450, 350], 'the opposite edge stays');
  assert.deepEqual([at(slid, 'p-4').x, at(slid, 'p-4').y], [150, 350], 'the opposite edge stays');
  const vec = (p, q) => ({ x: q.x - p.x, y: q.y - p.y });
  const eq = (u, v) => near(u.x, v.x) && near(u.y, v.y);
  const corners = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(slid, id));
  assert.ok(eq(vec(corners[0], corners[1]), vec(corners[3], corners[2])));
  assert.ok(eq(vec(corners[1], corners[2]), vec(corners[0], corners[3])));

  const tri = shape(add(add(add(G.empty(), 100, 100), 400, 100), 250, 400), 'polygon', ['p-1', 'p-2', 'p-3']);
  const side = G.reduce(tri, { type: 'moveEdge', id: 'e-1', index: 0, dx: 0, dy: 30 });
  assert.deepEqual([at(side, 'p-1').x, at(side, 'p-1').y], [100, 130]);
  assert.deepEqual([at(side, 'p-2').x, at(side, 'p-2').y], [400, 130]);
  assert.deepEqual([at(side, 'p-3').x, at(side, 'p-3').y], [250, 400], 'the far vertex stays');

  const seg = shape(add(add(G.empty(), 100, 140), 340, 140), 'segment', ['p-1', 'p-2']);
  const shifted = G.reduce(seg, { type: 'moveEdge', id: 'e-1', index: 0, dx: 10, dy: 60 });
  assert.deepEqual([at(shifted, 'p-1').x, at(shifted, 'p-1').y], [110, 200]);
  assert.deepEqual([at(shifted, 'p-2').x, at(shifted, 'p-2').y], [350, 200]);
  assert.ok(near(Math.hypot(240, 0), Math.hypot(at(shifted, 'p-2').x - at(shifted, 'p-1').x, at(shifted, 'p-2').y - at(shifted, 'p-1').y)),
    'dragging the segment keeps its length');

  assert.throws(() => G.reduce(rect, { type: 'moveEdge', id: 'e-9', index: 0, dx: 1, dy: 1 }));
  assert.throws(() => G.reduce(rect, { type: 'moveEdge', id: 'e-1', index: 9, dx: 1, dy: 1 }));
});

test('an edge drag carries a circle whose centre is on that edge', () => {
  let b = add(add(add(add(G.empty(), 100, 100), 400, 100), 250, 400), 180, 100);
  b = shape(b, 'polygon', ['p-1', 'p-2', 'p-3']);
  b = shape(b, 'circle', [], { centerPointId: 'p-1', radiusPointId: 'p-4' });
  const moved = G.reduce(b, { type: 'moveEdge', id: 'e-1', index: 0, dx: 0, dy: 40 });
  assert.deepEqual([at(moved, 'p-1').x, at(moved, 'p-1').y], [100, 140]);
  assert.deepEqual([at(moved, 'p-4').x, at(moved, 'p-4').y], [180, 140], 'the rim follows the centre');
  assert.ok(near(80, Math.hypot(at(moved, 'p-4').x - at(moved, 'p-1').x, at(moved, 'p-4').y - at(moved, 'p-1').y)));
  const other = G.reduce(b, { type: 'moveEdge', id: 'e-1', index: 1, dx: 20, dy: 0 });
  assert.deepEqual([at(other, 'p-1').x, at(other, 'p-1').y], [100, 100], 'a far edge leaves the circle');
  assert.deepEqual([at(other, 'p-4').x, at(other, 'p-4').y], [180, 100]);
});

test('translating a whole shape moves every corner by the same vector', () => {
  const rect = rectangle();
  const moved = G.reduce(rect, { type: 'translate', ids: ['p-1', 'p-2', 'p-3'], dx: 20, dy: -30 });
  assert.deepEqual([at(moved, 'p-1').x, at(moved, 'p-1').y], [120, 70]);
  assert.deepEqual([at(moved, 'p-2').x, at(moved, 'p-2').y], [320, 70]);
  assert.deepEqual([at(moved, 'p-3').x, at(moved, 'p-3').y], [320, 270]);
  assert.deepEqual([at(moved, 'p-4').x, at(moved, 'p-4').y], [120, 270], 'the derived corner follows');
  const ring = ['p-1', 'p-2', 'p-3', 'p-4'].map((id) => at(moved, id));
  const dot = (o, u, v) => (u.x - o.x) * (v.x - o.x) + (u.y - o.y) * (v.y - o.y);
  for (const [o, u, v] of [[0, 1, 3], [1, 0, 2], [2, 1, 3], [3, 0, 2]]) {
    assert.ok(near(dot(ring[o], ring[u], ring[v]), 0), 'translation keeps the right angles');
  }
  // The shape stops at the margin instead of leaving the board.
  const stopped = G.reduce(rect, { type: 'translate', ids: ['p-1', 'p-2', 'p-3'], dx: -200, dy: 0 });
  assert.ok(at(stopped, 'p-1').x >= 24 && at(stopped, 'p-1').x < 24.01, 'the drag stops at the margin');
  assert.ok(near(at(stopped, 'p-2').x - at(stopped, 'p-1').x, 200), 'every corner keeps the same shift');
  assert.equal(at(stopped, 'p-1').y, 100);
  const preview = G.constrainedTranslate(rect, ['p-1', 'p-2', 'p-3'], 20, -30);
  for (const corner of preview.corners) {
    assert.deepEqual([corner.x, corner.y], [at(moved, corner.id).x, at(moved, corner.id).y]);
  }
});

test('a derived corner outside the free-point box stops at the margin', () => {
  const { margin, width, height } = G.bounds;
  // P4 = P1 + P3 - P2. The free corners sit in x >= 200; the derived corner is at x = 50.
  let para = shape(add(add(add(G.empty(), 200, 100), 400, 100), 250, 300), 'parallelogram', ['p-1', 'p-2', 'p-3']);
  const free = ['p-1', 'p-2', 'p-3'].map((id) => at(para, id));
  assert.ok(at(para, 'p-4').x < Math.min(...free.map((p) => p.x)), 'the derived corner starts outside the free points box');
  const onBoard = (board) => {
    for (const point of board.points) {
      assert.ok(point.x >= margin && point.y >= margin
        && point.x <= width - margin && point.y <= height - margin, `${point.id} stays inside the margin`);
    }
  };
  const translated = G.reduce(para, { type: 'translate', ids: ['p-1', 'p-2', 'p-3'], dx: -200, dy: 0 });
  onBoard(translated);
  assert.ok(at(translated, 'p-4').x >= margin && at(translated, 'p-4').x < margin + 0.01,
    'translate stops the derived corner at the margin');
  // The bottom edge joins the free P3 to the derived P4. Sliding it left pushes P4 out
  // while P3, and the opposite edge, would still be inside.
  const resized = G.reduce(para, { type: 'moveEdge', id: 'e-1', index: 2, dx: -400, dy: 0 });
  onBoard(resized);
  assert.ok(at(resized, 'p-4').x >= margin && at(resized, 'p-4').x < margin + 0.01,
    'moveEdge stops the derived corner at the margin');
  assert.equal(at(resized, 'p-1').x, 200, 'the opposite edge stays');
  assert.equal(at(resized, 'p-2').x, 400, 'the opposite edge stays');
});

test('an edge-drag preview matches the board the release commits', () => {
  const rect = rectangle();
  const preview = G.constrainedEdgeMove(rect, 'e-1', 0, 40, 50);
  assert.deepEqual(Object.keys(preview).sort(), ['corners', 'rims', 'x', 'y']);
  const committed = G.reduce(rect, { type: 'moveEdge', id: 'e-1', index: 0, dx: 40, dy: 50 });
  assert.deepEqual(preview.corners.map((c) => c.id).sort(), ['p-1', 'p-2']);
  for (const corner of preview.corners) {
    assert.deepEqual([corner.x, corner.y], [at(committed, corner.id).x, at(committed, corner.id).y]);
  }
});

test('a drag preview carries the corner moves and rim translations the model computed', () => {
  // Feature envy: the view renders `preview.corners` / `preview.rims` instead of re-deriving.
  const sq = rectangle();
  const preview = G.constrainedMove(sq, 'p-1', 160, 140);
  assert.deepEqual(Object.keys(preview).sort(), ['corners', 'rims', 'x', 'y']);
  // A corner drag moves its two neighbours as well, so the preview names every one of them.
  assert.deepEqual(preview.corners.map((c) => c.id).sort(), ['p-2', 'p-4']);
  const committed = G.reduce(sq, { type: 'movePoint', id: 'p-1', x: 160, y: 140 });
  for (const corner of preview.corners) {
    assert.deepEqual([corner.x, corner.y], [at(committed, corner.id).x, at(committed, corner.id).y]);
  }
  // A centre drag previews the rim translation the model will apply on release.
  const circle = shape(add(add(G.empty(), 200, 200), 300, 200), 'circle', [], { centerPointId: 'p-1', radiusPointId: 'p-2' });
  const moved = G.constrainedMove(circle, 'p-1', 230, 240);
  assert.deepEqual(moved.rims, { 'p-2': { x: 330, y: 240 } });
  assert.deepEqual(moved.corners, [], 'the rim is previewed as a rim, not as a corner');
  const released = G.reduce(circle, { type: 'movePoint', id: 'p-1', x: 230, y: 240 });
  assert.deepEqual([at(released, 'p-2').x, at(released, 'p-2').y], [330, 240], 'the preview matches the release');
});

test('a text is written by the student, kept in the snapshot, and never borrowed from a point', () => {
  const b = G.reduce(G.empty(), { type: 'addText', x: 120, y: 160, text: '  面积 = 长 × 宽 ' });
  assert.deepEqual(b.elements, [{ id: 'e-1', type: 'text', role: 'main', note: '', x: 120, y: 160, text: '面积 = 长 × 宽' }]);
  // The wire form carries the writing itself, so a reopened file keeps the student's words.
  const wire = serialized(b);
  assert.deepEqual(wire.elements[0], { id: 'e-1', type: 'text', role: 'main', note: '', x: 120, y: 160, text: '面积 = 长 × 宽' });
  assert.deepEqual(G.validate(wire), G.validate(b));
  // Writing more lines is the student's own line break, not layout.
  const two = G.reduce(b, { type: 'editText', id: 'e-1', text: '长 6\n宽 4' });
  assert.equal(two.elements[0].text, '长 6\n宽 4');
  // The box estimate is one place for drawing and clicking: two lines, widest 3 characters.
  assert.deepEqual(G.textBox(two.elements[0].text.split('\n')), { width: 3 * 16 * 0.62 + 8, height: 2 * 20 + 2 });
  // A blank text would be an invisible object: it is refused rather than stored.
  assert.throws(() => G.reduce(G.empty(), { type: 'addText', x: 1, y: 1, text: '   ' }), /Invalid text/);
  assert.throws(() => G.reduce(b, { type: 'editText', id: 'e-1', text: '' }), /Invalid text/);
  assert.throws(() => G.reduce(G.empty(), { type: 'addText', x: 1, y: 1, text: '字'.repeat(G.TEXT_MAX + 1) }), /Invalid text/);
  // It is neither a point nor a construction input and cannot move a shape.
  assert.deepEqual(b.points, []);
  assert.throws(() => G.reduce(b, { type: 'translate', ids: ['e-1'], dx: 5, dy: 5 }), /Unknown point/);
  assert.throws(() => G.reduce(b, { type: 'movePoint', id: 'e-1', x: 1, y: 1 }), /Unknown point/);
  assert.throws(() => G.reduce(b, { type: 'addElement', elementType: 'segment', points: ['e-1', 'e-1'] }));
});

test('a text moves by its own anchor and stays reachable on the board', () => {
  const b = G.reduce(G.empty(), { type: 'addText', x: 100, y: 100, text: '周长' });
  const moved = G.reduce(b, { type: 'moveText', id: 'e-1', x: 640, y: 420 });
  assert.deepEqual([moved.elements[0].x, moved.elements[0].y], [640, 420]);
  // A drag beyond the board stops at the board instead of storing an unreachable anchor.
  const pinned = G.reduce(b, { type: 'moveText', id: 'e-1', x: 9999, y: -50 });
  assert.deepEqual([pinned.elements[0].x, pinned.elements[0].y], [G.bounds.width, G.bounds.margin]);
  assert.throws(() => G.reduce(b, { type: 'moveText', id: 'e-1', x: NaN, y: 1 }));
  // Deleting removes only the writing; shapes and points beside it stay.
  const withShape = G.reduce(shape(add(add(G.empty(), 200, 200), 300, 300), 'segment', ['p-1', 'p-2']),
    { type: 'addText', x: 50, y: 50, text: '边 AB' });
  const deleted = G.reduce(withShape, { type: 'delete', ids: ['e-2'] });
  assert.deepEqual(deleted.points.map((p) => p.id), ['p-1', 'p-2']);
  assert.deepEqual(deleted.elements.map((e) => e.id), ['e-1']);
});

test('a board file with the wrong text shape is refused instead of guessed', () => {
  const wire = (element) => ({ kind: 'geometry-board', schemaVersion: 1, points: [], elements: [element], note: '' });
  assert.throws(() => G.validate(wire({ id: 'e-1', type: 'text', role: 'main', note: '', x: 10, y: 10, text: '' })), /Invalid text/);
  // A text names no point: a stale point list is a broken file, not an anchor.
  assert.throws(() => G.validate(wire({ id: 'e-1', type: 'text', role: 'main', note: '', x: 10, y: 10, text: 'a', points: ['p-1'] })), /references no point/);
  assert.throws(() => G.validate(wire({ id: 'e-1', type: 'text', role: 'main', note: '', x: 900, y: 10, text: 'a' })), /Invalid text/);
  // A closed shape may not borrow the text's own fields.
  assert.throws(() => G.validate(wire({ id: 'e-1', type: 'segment', role: 'main', note: '', x: 1, y: 1, points: ['p-1', 'p-2'] })), /Unknown point|own position/);
});
