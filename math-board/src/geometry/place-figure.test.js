import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from './model.js';
import { placeFigure } from './place-figure.js';

const G = createGeometryModel();

function segment(x1, y1, x2, y2, labelA = 'A', labelB = 'B', note = '9 cm') {
  let board = G.empty();
  board = G.reduce(board, { type: 'addPoint', x: x1, y: y1, label: labelA });
  board = G.reduce(board, { type: 'addPoint', x: x2, y: y2, label: labelB });
  const [a, b] = board.points.map((point) => point.id);
  return G.reduce(board, { type: 'addElement', elementType: 'segment', points: [a, b], role: 'auxiliary', note });
}

test('an empty draft keeps the figure coordinates, labels, role, and note', () => {
  const student = { ...G.empty(), note: 'mine' };
  const figure = segment(80, 90, 180, 90);
  const placed = placeFigure(G, student, figure);
  assert.equal(placed.ok, true);
  assert.equal(placed.board.note, 'mine');
  assert.equal(placed.board.elements.length, 1);
  assert.equal(placed.board.elements[0].role, 'auxiliary');
  assert.equal(placed.board.elements[0].note, '9 cm');
  const [a, b] = placed.board.points;
  assert.deepEqual([a.label, a.x, a.y], ['A', 80, 90]);
  assert.deepEqual([b.label, b.x, b.y], ['B', 180, 90]);
  assert.deepEqual(placed.elementIds, [placed.board.elements[0].id]);
});

test('copy keeps the target canvas on an empty extended draft', () => {
  const student = { ...G.empty(), canvas: { width: 1600, height: 900 }, note: 'mine' };
  const result = placeFigure(G, student, segment(80, 90, 180, 90));
  assert.equal(result.ok, true);
  assert.deepEqual(result.board.canvas, { width: 1600, height: 900 });
  assert.equal(result.board.note, 'mine');
  assert.deepEqual(G.validate(JSON.parse(G.serialize(result.board))), result.board);
});

test('copy places points and writing in the expanded target area instead of the source bounds', () => {
  const student = G.reduce({ ...G.empty(), canvas: { width: 1600, height: 900 } },
    { type: 'addPoint', x: 1400, y: 700, label: 'S' });
  const before = G.serialize(student);
  const figure = G.reduce(segment(100, 100, 200, 100),
    { type: 'addText', x: 100, y: 150, text: '说明' });
  const result = placeFigure(G, student, figure);
  assert.equal(result.ok, true);
  assert.deepEqual(result.board.canvas, student.canvas);
  assert.deepEqual(result.board.points.filter((point) => point.id !== 'p-1').map((point) => point.x), [1424, 1524]);
  assert.equal(result.board.elements.find((element) => element.type === 'text').x, 1424);
  assert.equal(G.serialize(student), before, 'copy does not mutate the existing draft');
  const embedded = new Function(`return (${placeFigure.toString()});`)();
  assert.deepEqual(embedded(G, student, figure), result);
});

test('copy never imports the source canvas into a legacy target', () => {
  const figure = { ...segment(80, 90, 180, 90), canvas: { width: 1600, height: 900 } };
  const result = placeFigure(G, G.empty(), figure);
  assert.equal(result.ok, true);
  assert.equal(Object.hasOwn(result.board, 'canvas'), false);
});

test('an occupied draft moves the figure to the right and renames colliding labels', () => {
  let student = G.reduce(G.empty(), { type: 'addPoint', x: 100, y: 120, label: 'A' });
  const placed = placeFigure(G, student, segment(400, 200, 500, 200));
  assert.equal(placed.ok, true);
  assert.equal(placed.board.points.length, 3);
  const added = placed.board.points.filter((point) => point.id !== student.points[0].id);
  assert.deepEqual(added.map((point) => point.label).sort(), ['B', 'C']);
  const xs = added.map((point) => point.x).sort((a, b) => a - b);
  assert.equal(xs[0], 124);
  assert.equal(xs[1], 224);
  assert.ok(added.every((point) => point.y === 200));
});

test('a translated rectangle keeps its derived fourth point', () => {
  let figure = G.empty();
  figure = G.reduce(figure, { type: 'addPoint', x: 100, y: 100, label: 'A' });
  figure = G.reduce(figure, { type: 'addPoint', x: 220, y: 100, label: 'B' });
  figure = G.reduce(figure, { type: 'addPoint', x: 220, y: 160, label: 'C' });
  const ids = figure.points.map((point) => point.id);
  figure = G.reduce(figure, { type: 'addElement', elementType: 'rectangle', points: ids, note: '甲 9 cm × 1 cm' });
  const student = G.reduce(G.empty(), { type: 'addPoint', x: 700, y: 300, label: 'S' });
  const placed = placeFigure(G, student, figure);
  assert.equal(placed.ok, true);
  const rectangle = placed.board.elements.find((element) => element.type === 'rectangle');
  assert.equal(rectangle.note, '甲 9 cm × 1 cm');
  const corners = rectangle.points.map((id) => placed.board.points.find((point) => point.id === id));
  const derived = corners[3];
  assert.equal(derived.kind, 'derived');
  assert.equal(derived.construction.op, 'rectangle');
  const [a, b, c] = corners;
  assert.equal(derived.x, a.x + c.x - b.x);
  assert.equal(derived.y, a.y + c.y - b.y);
});

test('a draft that already fills the board is left unchanged', () => {
  let student = G.empty();
  for (const [x, y, label] of [[24, 24, 'A'], [776, 24, 'B'], [24, 576, 'C'], [776, 576, 'D']]) {
    student = G.reduce(student, { type: 'addPoint', x, y, label });
  }
  const before = G.serialize(student);
  const placed = placeFigure(G, student, segment(100, 100, 180, 100));
  assert.equal(placed.ok, false);
  assert.equal(placed.reason, 'full');
  assert.equal(G.serialize(placed.board), before);
  assert.equal(G.serialize(student), before);
});

test('teacher writing is copied into the draft and can be rewritten there', () => {
  let figure = G.reduce(G.empty(), { type: 'addText', x: 100, y: 120, text: '边长 9 cm' });
  figure = G.reduce(figure, { type: 'addPoint', x: 160, y: 200, label: 'A' });
  figure = G.reduce(figure, { type: 'addPoint', x: 320, y: 200, label: 'B' });
  const ids = figure.points.map((point) => point.id);
  figure = G.reduce(figure, { type: 'addElement', elementType: 'segment', points: ids });
  const placed = placeFigure(G, G.empty(), figure);
  assert.equal(placed.ok, true);
  const text = placed.board.elements.find((element) => element.type === 'text');
  assert.equal(text.text, '边长 9 cm', 'the teacher wording arrives verbatim, not as an instruction');
  // The copy is the student's own text from that moment on: it can be edited and deleted.
  const edited = G.reduce(placed.board, { type: 'editText', id: text.id, text: '边长改写' });
  assert.equal(edited.elements.find((element) => element.id === text.id).text, '边长改写');
  const removed = G.reduce(edited, { type: 'delete', ids: [text.id] });
  assert.deepEqual(removed.elements.map((e) => e.type), ['segment'], 'deleting the text keeps the figure');
});

test('a second copy keeps every id distinct and the first copy editable', () => {
  let figure = G.reduce(G.empty(), { type: 'addText', x: 100, y: 120, text: '甲' });
  figure = G.reduce(figure, { type: 'addPoint', x: 160, y: 200, label: 'A' });
  figure = G.reduce(figure, { type: 'addPoint', x: 320, y: 200, label: 'B' });
  const ids = figure.points.map((point) => point.id);
  figure = G.reduce(figure, { type: 'addElement', elementType: 'segment', points: ids });
  const first = placeFigure(G, G.empty(), figure);
  const second = placeFigure(G, first.board, figure);
  // A figure with its own points is moved clear of the draft, so its ids are renumbered.
  assert.equal(second.ok, true);
  const all = second.board.elements.map((e) => e.id);
  assert.equal(new Set(all).size, all.length, 'no two elements share an id');
  // The page renames an arrival that kept an id the draft already used, and the result
  // is a draft the model still accepts and the student can keep editing.
  const rewritten = G.reduce(second.board, { type: 'editText', id: first.elementIds[0], text: '甲组' });
  assert.ok(rewritten.elements.some((e) => e.type === 'text' && e.text === '甲组'));
});

test('a teacher figure that is only writing lands on an empty draft at its own place', () => {
  const figure = G.reduce(G.empty(), { type: 'addText', x: 120, y: 140, text: '看这两条边' });
  const placed = placeFigure(G, G.empty(), figure);
  assert.equal(placed.ok, true, 'writing needs no shape to be placed');
  assert.deepEqual(placed.board.elements.map((e) => [e.type, e.x]), [['text', 120]]);
  // A draft that already holds writing moves the second copy clear instead of overlapping.
  const again = placeFigure(G, placed.board, figure);
  assert.equal(again.ok, true);
  const texts = again.board.elements.filter((e) => e.type === 'text');
  assert.equal(texts.length, 2);
  // The second copy is moved clear in one of the four directions the draft leaves.
  assert.deepEqual(texts.map((e) => e.text), ['看这两条边', '看这两条边']);
  assert.deepEqual([texts[0].x, texts[0].y], [120, 140]);
  assert.ok(texts[1].x !== texts[0].x || texts[1].y !== texts[0].y, 'the second copy does not overlap');
  assert.notEqual(texts[0].id, texts[1].id);
});
