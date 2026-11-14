import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from './model.js';
import { captionBox, captionPosition, visibleCaption } from './caption.js';
import { geometryCaptionLabel } from './draw.js';

const bounds = { width: 800, height: 600 };
const at = (points) => (id) => points[id];

test('only a trimmed note of 1 to 20 characters is drawn', () => {
  assert.equal(visibleCaption('  9 cm  '), '9 cm');
  assert.equal(visibleCaption('甲 9 cm × 1 cm'), '甲 9 cm × 1 cm');
  assert.equal(visibleCaption(''), null);
  assert.equal(visibleCaption('   '), null);
  assert.equal(visibleCaption('x'.repeat(21)), null);
  assert.equal(visibleCaption('一'.repeat(20)), '一'.repeat(20));
  assert.equal(visibleCaption('一'.repeat(21)), null);
});

test('segment, polygon, and circle captions use the specified side', () => {
  const segment = captionPosition(
    { type: 'segment', points: ['a', 'b'], note: '9 cm' },
    at({ a: { x: 100, y: 100 }, b: { x: 180, y: 100 } }),
    bounds,
  );
  assert.equal(segment.text, '9 cm');
  assert.equal(segment.x, 140);
  assert.equal(segment.y, 86);

  const low = captionPosition(
    { type: 'segment', points: ['a', 'b'], note: '9 cm' },
    at({ a: { x: 100, y: 4 }, b: { x: 180, y: 4 } }),
    bounds,
  );
  assert.equal(low.y, 18);

  const polygon = captionPosition(
    { type: 'polygon', points: ['a', 'b', 'c'], note: '甲' },
    at({ a: { x: 0, y: 0 }, b: { x: 30, y: 0 }, c: { x: 0, y: 30 } }),
    bounds,
  );
  assert.equal(polygon.x, 10);
  assert.equal(polygon.y, 10);

  const circle = captionPosition(
    { type: 'circle', centerPointId: 'c', radiusPointId: 'r', note: 'r' },
    at({ c: { x: 200, y: 200 }, r: { x: 240, y: 200 } }),
    bounds,
  );
  assert.deepEqual({ x: circle.x, y: circle.y }, { x: 200, y: 146 });

  const high = captionPosition(
    { type: 'circle', centerPointId: 'c', radiusPointId: 'r', note: 'r' },
    at({ c: { x: 80, y: 30 }, r: { x: 100, y: 30 } }),
    bounds,
  );
  assert.equal(high.y, 64);
});

test('the caption box is the writing that is drawn, so a click lands on what the student reads', () => {
  const caption = { text: '9 cm', x: 140, y: 86 };
  const box = captionBox(caption);
  const painted = geometryCaptionLabel(caption, { ink: '#000', selection: '#00F' }, { box, pickable: true });
  // The label draws at the box's own size and anchor: one measurement serves both.
  assert.equal(painted.fontSize, box.size);
  assert.equal(painted.textAnchor, box.anchor);
  assert.equal(painted.pointerEvents, 'auto');
  // The box covers the glyphs and a little halo, never a second, wider estimate.
  assert.ok(box.x0 < caption.x - 10 && box.x1 > caption.x + 10);
  assert.ok(box.y0 < caption.y && box.y1 > caption.y - box.size);
  assert.equal(captionBox(null), null);
});

test('a note that is too long is not drawn and not claimed as a caption', () => {
  const long = { type: 'segment', points: ['a', 'b'], note: 'x'.repeat(21) };
  assert.equal(captionPosition(long, at({ a: { x: 100, y: 100 }, b: { x: 180, y: 100 } }), bounds), null);
  assert.equal(captionPosition({ ...long, note: 'x'.repeat(20) }, at({ a: { x: 100, y: 100 }, b: { x: 180, y: 100 } }), bounds).text.length, 20);
});
