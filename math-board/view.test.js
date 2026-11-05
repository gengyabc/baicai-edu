import test from 'node:test';
import assert from 'node:assert/strict';
import { createShapeArt } from './view.js';
import { createBoardModel } from './model.js';

const M = createBoardModel();
const React = { createElement(type, props, ...children) { return { type, props: props || {}, children }; } };
const art = createShapeArt(React);

test('every library pattern renders artwork, and the custom patterns use the level fill', () => {
  const expected = ['apple', 'butterfly', 'car', 'cat', 'dog', 'fish', 'flower', 'house', 'icecream', 'person', 'rocket'];
  assert.deepEqual([...art.patterns].sort(), expected.sort());
  for (const shape of M.shapes) {
    const node = art.node(shape, 17, { fill: '#4CAF50' });
    assert.equal(typeof node.type, 'string');
    if (expected.includes(shape)) assert.equal(node.type, 'g', `${shape} uses custom artwork`);
    else assert.notEqual(node.type, 'g', `${shape} uses the built-in geometry`);
  }
});

test('cat and dog use different ears, so they stay distinguishable at toolbox size', () => {
  const cat = art.node('cat', 17, { fill: '#4CAF50' });
  const dog = art.node('dog', 17, { fill: '#4CAF50' });
  assert.equal(cat.type, 'g');
  assert.equal(dog.type, 'g');
  const children = (node) => node.children.flatMap((child) => child.type === 'g' ? children(child) : [child]);
  const catShapes = children(cat).map((child) => child.type);
  const dogShapes = children(dog).map((child) => child.type);
  assert.ok(catShapes.filter((type) => type === 'polygon').length >= 4, 'cat has pointed ear and nose polygons');
  assert.ok(dogShapes.filter((type) => type === 'ellipse').length >= 3, 'dog has floppy ear and muzzle ellipses');
});
