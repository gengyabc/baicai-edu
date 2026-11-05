import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardDescription, createShapeArt, colorIndexForValue } from './view.js';
import { createBoardModel } from './model.js';

const M = createBoardModel();
const React = { createElement(type, props, ...children) { return { type, props: props || {}, children }; } };
const art = createShapeArt(React);
const zh = JSON.parse(await readFile(new URL('./locale/zh.json', import.meta.url), 'utf8'));
const t = (key, params = {}) => zh[key].replace(/\{(\w+)\}/g, (match, name) =>
  Object.hasOwn(params, name) ? String(params[name]) : match);
const describeBoard = createBoardDescription(M);

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

test('colorIndexForValue reads level.color, not the array index', () => {
  const levels = [{ value: 1, color: 0 }, { value: 10, color: 4 }, { value: 100, color: 7 }];
  assert.equal(colorIndexForValue(levels, 10), 4);
  assert.equal(colorIndexForValue(levels, 100), 7);
  assert.equal(colorIndexForValue(levels, 999), 0);
});

test('the answer note names groups, cross-outs and the student explanation without coordinates or JSON', () => {
  let board = M.reduce(M.empty(), { type: 'add', shape: 'cat', count: 2 });
  board = M.reduce(board, { type: 'add', shape: 'apple' });
  board = M.reduce(board, { type: 'groupSelected', ids: ['object-1', 'object-2'], alias: '小猫队' });
  board = M.reduce(board, { type: 'update', id: 'object-3', patch: { removed: true } });
  board = M.reduce(board, { type: 'note', value: '两只小猫在一起' });
  const text = describeBoard(board, t);
  assert.equal(text, [
    '我在数学画板上摆好了：',
    '· 一组「小猫队」：小猫 2 个，每个代表 1，一共 2',
    '· 划去的：苹果 1 个，每个代表 1',
    '',
    '我想说：两只小猫在一起',
  ].join('\n'));
  assert.equal(/object-|"x":|schemaVersion/.test(text), false);
});
