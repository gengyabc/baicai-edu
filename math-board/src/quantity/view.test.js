import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { composerNote, createShapeArt, colorIndexForValue, createBoardView } from './view.js';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { createBoardFilePicker, createBoardIcons } from '../shared/file-picker.js';
import { createBoardControls } from '../shared/board-kit.js';
import { createTutorialController } from '../shell/tutorial.js';
import { createHooks, installBrowser, walk, text } from '../testing/test-harness.js';

const M = createBoardModel();
const React = { createElement(type, props, ...children) { return { type, props: props || {}, children }; } };
const art = createShapeArt(React);
const zh = JSON.parse(await readFile(new URL('../../locale/zh.json', import.meta.url), 'utf8'));
const t = (key, params = {}) => zh[key].replace(/\{(\w+)\}/g, (match, name) =>
  Object.hasOwn(params, name) ? String(params[name]) : match);

test('creation colour defaults to 1 and synchronizes previews and new objects', () => {
  const browser = installBrowser();
  const hooks = createHooks();
  try {
    const ctx = { locale: { subscribe() {}, getSnapshot() {} } };
    const Board = createBoardView(hooks.React, M, ctx, t, '', art, () => null, createBoardTrace(M), { createBoardFilePicker, createBoardIcons, createBoardControls, createTutorialController });
    const render = () => walk(hooks.refresh(() => {
      hooks.hooks.current = hooks.storeFor(Board);
      return Board({ sessionId: 'test', useProjection: () => null, useInput: () => 'plain' });
    }));
    let nodes = render();
    let tool = nodes.find((n) => n.props.className === 'eb-shape-tool');
    assert.ok(tool.props.title.endsWith('1'));
    assert.equal(nodes.filter((n) => n.props.className === 'eb-color-button').length, 5);
    assert.equal(nodes.some((n) => n.props.role === 'menuitemradio'), false);
    nodes.find((n) => n.props.className === 'eb-color-button' && text(n) === '10').props.onClick();
    nodes = render();
    tool = nodes.find((n) => n.props.className === 'eb-shape-tool');
    assert.ok(tool.props.title.endsWith('10'));
    tool.props.onClick();
    render();
    const saved = JSON.parse(browser.storage.get('baicai-edu-math-board:v4:test'));
    assert.equal(saved.objects[0].value, 10);
    assert.equal(saved.objects[0].color, 1);
  } finally { hooks.unmount(); browser.restore(); }
});

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

test('the composer receives only the student note, never a generated inventory', () => {
  let board = M.reduce(M.empty(), { type: 'add', shape: 'cat', count: 2 });
  board = M.reduce(board, { type: 'add', shape: 'apple' });
  board = M.reduce(board, { type: 'groupSelected', ids: ['object-1', 'object-2'], alias: '小猫队' });
  board = M.reduce(board, { type: 'update', id: 'object-3', patch: { removed: true } });
  assert.equal(composerNote(board), '');
  board = M.reduce(board, { type: 'note', value: '  两只小猫在一起  ' });
  assert.equal(composerNote(board), '两只小猫在一起');
  assert.equal(/我在数学画板上摆好了|没圈组|划去|object-|schemaVersion/.test(composerNote(board)), false);
});
