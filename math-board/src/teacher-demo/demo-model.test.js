import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from '../geometry/model.js';
import { createDemoModel } from './demo-model.js';

const G = createGeometryModel();
const M = createDemoModel(G);

function segmentBoard(note = '9 cm') {
  let board = G.empty();
  board = G.reduce(board, { type: 'addPoint', x: 80, y: 80, label: 'A' });
  board = G.reduce(board, { type: 'addPoint', x: 200, y: 80, label: 'B' });
  const [a, b] = board.points.map((point) => point.id);
  return G.reduce(board, { type: 'addElement', elementType: 'segment', points: [a, b], note });
}

const figure = (board = segmentBoard(), extra = {}) => ({
  title: 'Given', description: 'Known side', board, ...extra,
});

test('a segment figure keeps its short note and canonical board', () => {
  const board = segmentBoard();
  const value = M.validateFigure(figure(board));
  assert.equal(value.title, 'Given');
  assert.equal(value.board.elements[0].note, '9 cm');
  assert.equal(value.board.note, '');
  assert.equal(M.validateView({ revision: 1, figure: figure(board) }).figure.board.points.length, 2);
  assert.deepEqual(M.validateView({ revision: 0, figure: null }), { revision: 0, figure: null });
});

test('counts, board note, other kinds, and extra fields are rejected', () => {
  const board = segmentBoard();
  const bulky = G.validate(JSON.parse(G.serialize(board)));
  const tooMany = { ...bulky, points: Array.from({ length: 41 }, (_, i) => ({ ...bulky.points[0], id: `p-${i + 1}`, label: `P${i}` })) };
  for (const input of [
    figure({ ...board, note: 'student words' }),
    figure(G.empty()),
    { ...figure(board), extra: true },
    { title: 'Given', description: 'Known side', board: { kind: 'math-board', schemaVersion: 4, objects: [] } },
    { title: 'x'.repeat(121), description: 'Known side', board },
    { title: 'Given', description: 'Known side', board: tooMany },
  ]) assert.throws(() => M.validateFigure(input));
  assert.throws(() => M.validateView({ revision: 0, figure: figure(board) }));
  assert.deepEqual(M.validateView({ revision: 1, figure: null }), { revision: 1, figure: null });
  assert.throws(() => M.validateView({ revision: -1, figure: null }));
});
