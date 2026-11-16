import test from 'node:test';
import assert from 'node:assert/strict';
import { createReferenceModel } from './reference-model.js';

const M = createReferenceModel();
const reference = () => ({ title: 'Given conditions', description: 'Not a student drawing', width: 200, height: 100, shapes: [
  { type: 'rect', x: 0, y: 0, width: 200, height: 100 },
  { type: 'line', x1: 0, y1: 100, x2: 200, y2: 0 },
  { type: 'circle', cx: 50, cy: 50, r: 50 },
  { type: 'text', x: 200, y: 100, text: '<svg>https://example.com</svg>' },
] });

test('shared model validates all four shapes and clones every level', () => {
  const input = reference(), output = M.validateReference(input);
  assert.deepEqual(output, input);
  output.shapes[0].width = 10;
  assert.equal(input.shapes[0].width, 200);
  const view = { revision: 1, reference: input }, result = M.validateView(view);
  assert.deepEqual(result, view);
  result.reference.shapes.pop();
  assert.equal(input.shapes.length, 4);
  assert.equal(M.validateReference(input).shapes[3].text, '<svg>https://example.com</svg>');
});

test('factory can be inlined without module closures', () => {
  const inline = (0, eval)(`(${createReferenceModel.toString()})()`);
  assert.deepEqual(inline.validateReference(reference()), reference());
  assert.deepEqual(inline.validateView({ revision: 0, reference: null }), { revision: 0, reference: null });
});

test('exact structures reject student snapshots, markup fields and unsupported shapes', () => {
  for (const value of [null, [], {}, { kind: 'math-board', schemaVersion: 4 }, { kind: 'geometry-board', schemaVersion: 1 },
    { ...reference(), note: 'student' }, { ...reference(), kind: 'math-board' },
    { ...reference(), shapes: [{ type: 'triangle', points: [] }] },
    { ...reference(), shapes: [{ ...reference().shapes[0], fill: 'red' }] },
    { ...reference(), shapes: [{ type: 'text', x: 0, y: 0, text: 'safe', href: 'https://example.com' }] },
    { ...reference(), shapes: [null] }, { ...reference(), shapes: Array(2) },
    Object.assign(Object.create({ inherited: true }), reference()),
  ]) assert.throws(() => M.validateReference(value));
});

test('reference string and shape count limits are enforced without truncating', () => {
  assert.equal(M.validateReference({ ...reference(), title: 't'.repeat(120), description: 'd'.repeat(1000),
    shapes: Array.from({ length: 40 }, () => ({ type: 'text', x: 0, y: 0, text: 'x'.repeat(120) })) }).shapes.length, 40);
  for (const patch of [{ title: 'x'.repeat(121) }, { title: 1 }, { description: 'x'.repeat(1001) }, { description: null },
    { shapes: [] }, { shapes: Array.from({ length: 41 }, () => reference().shapes[0]) },
    { shapes: [{ type: 'text', x: 0, y: 0, text: 'x'.repeat(121) }] },
    { shapes: [{ type: 'text', x: 0, y: 0, text: {} }] },
  ]) assert.throws(() => M.validateReference({ ...reference(), ...patch }));
});

test('dimensions must be finite bounded numbers', () => {
  for (const width of [99, 1201, NaN, Infinity, -Infinity, '200', null]) assert.throws(() => M.validateReference({ ...reference(), width }));
  for (const height of [99, 801, NaN, Infinity, -Infinity, '100', null]) assert.throws(() => M.validateReference({ ...reference(), height }));
  for (const [width, height] of [[100, 100], [1200, 800], [100.5, 100.5]]) {
    assert.doesNotThrow(() => M.validateReference({ ...reference(), width, height, shapes: [{ type: 'line', x1: 0, y1: 0, x2: width, y2: height }] }));
  }
});

test('all coordinates are finite nonnegative bounded numbers and extents fit', () => {
  for (const shape of reference().shapes) {
    for (const key of Object.keys(shape).filter(key => !['type', 'text'].includes(key))) {
      for (const invalid of [-1, NaN, Infinity, -Infinity, '1', null, 1201]) {
        assert.throws(() => M.validateReference({ ...reference(), shapes: [{ ...shape, [key]: invalid }] }), `${shape.type}.${key}=${invalid}`);
      }
    }
  }
  for (const shape of [
    { type: 'rect', x: 1, y: 0, width: 200, height: 1 },
    { type: 'rect', x: 0, y: 1, width: 1, height: 100 },
    { type: 'rect', x: 0, y: 0, width: 0, height: 1 },
    { type: 'rect', x: 0, y: 0, width: 1, height: 0 },
    { type: 'circle', cx: 50, cy: 50, r: 51 },
    { type: 'circle', cx: 180, cy: 50, r: 21 },
    { type: 'circle', cx: 0, cy: 0, r: 0 },
  ]) assert.throws(() => M.validateReference({ ...reference(), shapes: [shape] }));
  assert.doesNotThrow(() => M.validateReference({ ...reference(), shapes: [{ type: 'circle', cx: 0.5, cy: 0.5, r: 0.5 }] }));
});

test('public view has only revision and teacher reference', () => {
  assert.deepEqual(M.validateView({ revision: 0, reference: null }), { revision: 0, reference: null });
  assert.doesNotThrow(() => M.validateView({ revision: 2, reference: null }));
  for (const view of [null, {}, { revision: 0, reference: reference() }, { revision: -1, reference: null },
    { revision: 1.5, reference: null }, { revision: Number.MAX_SAFE_INTEGER + 1, reference: null },
    { revision: 1, reference: null, drafts: [] }, { revision: 1, reference: { kind: 'geometry-board' } },
  ]) assert.throws(() => M.validateView(view));
});
