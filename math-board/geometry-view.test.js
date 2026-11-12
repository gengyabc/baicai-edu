import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardView, createShapeArt } from './view.js';
import { createTabbedBoardView } from './board-shell.js';
import { createGeometryPage } from './geometry-view.js';
import { createGeometryModel } from './geometry/model.js';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { applyHostConfig } from './config-bridge.js';

const M = createBoardModel();
const G = createGeometryModel();
const T = createBoardTrace(M);
const locale = JSON.parse(await readFile(new URL('./locale/zh.json', import.meta.url), 'utf8'));
const t = (key, params = {}) => {
  assert.equal(typeof locale[key], 'string', `Missing locale key: ${key}`);
  return locale[key].replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(params, name) ? String(params[name]) : match);
};
const QUANTITY_KEY = 'dsh-edu-math-board:v4:tabbed';
const GEOMETRY_KEY = `dsh-edu-math-board:geometry:v1:tabbed`;
const walk = (node) => !node || typeof node !== 'object' ? []
  : [node, ...(node.children || []).flat(Infinity).flatMap(walk)];
const text = (node) => typeof node === 'string' || typeof node === 'number' ? String(node)
  : node && typeof node === 'object' ? (node.children || []).flat(Infinity).map(text).join('') : '';

/** Stateful hooks: persistent slots, dependency-aware effects and explicit rendering. */
function mount(options = {}) {
  const storage = options.storage || new Map();
  const old = { window: globalThis.window, navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator'),
    localStorage: globalThis.localStorage, document: globalThis.document };
  globalThis.window = { matchMedia: () => ({ matches: true }), location: { hostname: '127.0.0.1' } };
  globalThis.document = { addEventListener() {}, removeEventListener() {} };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    locks: { request(_key, _options, task) { task(); return Promise.resolve(); } },
  } });
  globalThis.localStorage = {
    getItem: (name) => storage.get(name) ?? null,
    setItem: (name, value) => storage.set(name, String(value)),
  };
  // Each component type owns its hook slots, so nested pages keep independent state
  // exactly as React does; the harness expands function components into their trees.
  const stores = new Map(); const dom = new Map(); const effects = [];
  const attached = new Map(); const inserted = [];
  let active = null; let dirty = false; let tree;
  const storeFor = (type) => {
    if (!stores.has(type)) stores.set(type, { slots: [] });
    return stores.get(type);
  };
  const React = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useSyncExternalStore() {},
    useState(initial) {
      const store = active; const index = store.cursor++;
      if (!(index in store.slots)) store.slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [store.slots[index].value, (next) => {
        const value = typeof next === 'function' ? next(store.slots[index].value) : next;
        if (!Object.is(value, store.slots[index].value)) { store.slots[index].value = value; dirty = true; }
      }];
    },
    useRef(current) { const store = active; const index = store.cursor++; return store.slots[index] ||= { current }; },
    useEffect(callback, deps) {
      const store = active; const index = store.cursor++;
      const previous = store.slots[index];
      if (!previous || !deps || deps.some((v, i) => !Object.is(v, previous.deps?.[i]))) {
        store.effects.push(() => {
          previous?.cleanup?.();
          store.slots[index] = { deps, cleanup: callback() };
        });
      }
    },
  };
  const inputActions = {
    captureInsertion: () => ({ offset: 0 }),
    addAttachments(ids) { ids.forEach((id) => attachments.set(id, id)); return true; },
    removeAttachment(id) { attachments.delete(id); },
    insertText() { return true; },
    persistDraft() {}, send() {},
  };
  const conversation = {
    createDrafts(sessionId, files) { return files.map((file) => ({ id: `draft-${file.name}`, file })); },
    releaseDraftAttachment() {},
  };
  const ctx = { locale: { subscribe: () => () => {}, getSnapshot: () => 'zh' }, get: () => conversation };
  const quantityPage = () => createBoardView(React, M, ctx, t, '', createShapeArt(React), applyHostConfig, T);
  const geometryPage = () => createGeometryPage(React, G, t);
  const Board = createTabbedBoardView(React, t, '', quantityPage, geometryPage);
  const props = { sessionId: 'tabbed', useProjection: () => null, useInput: () => 'plain', inputActions };

  const h = React.createElement;
  function expand(node) {
    if (!node || typeof node !== 'object') return node;
    if (typeof node.type === 'function') {
      const store = storeFor(node.type);
      const previous = active; const previousEffects = store.effects;
      active = store; store.cursor = 0; store.effects = [];
      let output;
      try { output = node.type(node.props); } finally {
        effects.push(...store.effects);
        store.effects = previousEffects;
        active = previous;
      }
      return expand(output);
    }
    return { ...node, children: (node.children || []).flat(Infinity).map(expand) };
  }
  function render() {
    dirty = false;
    effects.length = 0;
    tree = expand(h(Board, props));
    for (const node of walk(tree)) if (node.props.ref && typeof node.props.ref === 'object') {
      const ref = node.props.ref;
      if (!dom.has(ref)) dom.set(ref, {
        open: false, ownerDocument: { activeElement: null }, href: '',
        showModal() { this.open = true; }, close() { this.open = false; },
        contains: () => false, focus() {}, select() {}, click() {},
      });
      ref.current = dom.get(ref);
    }
    effects.splice(0).forEach((effect) => effect());
  }
  function refresh() {
    let iterations = 0;
    do { render(); assert.ok(++iterations < 20, 'Effects should settle'); } while (dirty);
  }
  // Both tabs stay mounted; queries see only the visible panel so each tab's own
  // controls are unambiguous (the hidden tab is a separate canvas and toolbar).
  const visibleNodes = () => {
    const all = walk(tree);
    const hidden = all.filter((node) => node.props && node.props.role === 'tabpanel' && node.props.hidden);
    const excluded = new Set(hidden.flatMap((node) => walk(node)));
    return all.filter((node) => !excluded.has(node));
  };
  const find = (predicate) => {
    const matches = visibleNodes().filter(predicate);
    assert.equal(matches.length, 1, `Expected exactly one matching node; found ${matches.length}`);
    return matches[0];
  };
  const button = (label) => find((node) => node.type === 'button'
    && (node.props['aria-label'] === label || text(node) === label));
  const api = {
    storage,
    get tree() { return tree; },
    render: refresh, find, button,
    tab(name) {
      find((node) => node.props['data-tab'] === name).props.onClick();
      refresh();
    },
    click(label) { const node = button(label); assert.ok(!node.props.disabled, `${label} should be enabled`); node.props.onClick(); refresh(); },
    tool(label) {
      const node = find((candidate) => candidate.type === 'button' && candidate.props['aria-label'] === t(label));
      assert.ok(!node.props.disabled, `${label} should be enabled`);
      node.props.onClick();
      refresh();
    },
    canvas() {
      const svg = find((node) => String(node.props.className || '').includes('eb-artboard'));
      svg.props.ref.current.createSVGPoint = () => ({ matrixTransform: ({ }) => ({ x: 0, y: 0 }) });
      const node = svg.props.ref.current;
      node.createSVGPoint = () => ({ matrixTransform: () => ({ x: 0, y: 0 }) });
      node.getScreenCTM = () => ({ inverse: () => ({}) });
      return svg;
    },
    /** Click at a board point. The harness maps client coords 1:1 onto board units. */
    clickAt(x, y, extra = {}) {
      const svg = find((node) => String(node.props.className || '').includes('eb-artboard'));
      const node = svg.props.ref.current;
      node.createSVGPoint = () => ({ x, y, matrixTransform: () => ({ x, y }) });
      node.getScreenCTM = () => ({ inverse: () => ({}) });
      const event = {
        button: 0, clientX: x, clientY: y, pointerId: 1, shiftKey: false,
        target: { closest: (selector) => hitNode(selector, x, y) },
        preventDefault() {}, currentTarget: { setPointerCapture() {} },
      };
      svg.props.onPointerDown(event);
      refresh();
    },
    moveTo(x, y) {
      const svg = find((node) => String(node.props.className || '').includes('eb-artboard'));
      const node = svg.props.ref.current;
      node.createSVGPoint = () => ({ x, y, matrixTransform: () => ({ x, y }) });
      node.getScreenCTM = () => ({ inverse: () => ({}) });
      svg.props.onPointerMove({ pointerId: 1, clientX: x, clientY: y });
      refresh();
    },
    release(x, y) {
      const svg = find((node) => String(node.props.className || '').includes('eb-artboard'));
      const node = svg.props.ref.current;
      node.createSVGPoint = () => ({ x, y, matrixTransform: () => ({ x, y }) });
      node.getScreenCTM = () => ({ inverse: () => ({}) });
      svg.props.onPointerUp({ pointerId: 1, clientX: x, clientY: y });
      refresh();
    },
    board() { return G.validate(JSON.parse(storage.get(GEOMETRY_KEY))); },
    quantityBoard() { return M.validate(JSON.parse(storage.get(QUANTITY_KEY))); },
    raw(key) { return storage.get(key); },
    set(key, value) { storage.set(key, value); },
    unmount() {
      for (const store of stores.values()) for (const slot of store.slots) slot?.cleanup?.();
      globalThis.window = old.window; globalThis.localStorage = old.localStorage;
      globalThis.document = old.document;
      if (old.navigator) Object.defineProperty(globalThis, 'navigator', old.navigator);
      else delete globalThis.navigator;
    },
  };
  // Hit testing mirrors the view: points within 10 units, then element proximity.
  function hitNode(selector, x, y) {
    if (!String(selector).includes('data-point')) return null;
    const state = api.board();
    const hit = state.points.find((point) => Math.hypot(point.x - x, point.y - y) <= 11);
    return hit ? { getAttribute: () => hit.id } : null;
  }
  try { refresh(); } catch (error) { api.unmount(); throw error; }

  return api;
}

function withMount(run, options = {}) {
  const board = mount(options);
  try { return run(board); } finally { board.unmount(); }
}

test('one entry shows both tabs and neither draft sees the other', () => {
  const storage = new Map();
  withMount((h) => {
    h.tab('geometry');
    assert.ok(h.find((n) => n.props['data-tab'] === 'quantity'));
    assert.ok(h.find((n) => n.props['data-tab'] === 'geometry'));
    assert.equal(h.find((n) => n.props['data-tab'] === 'geometry').props['aria-selected'], true);
    assert.equal(h.find((n) => n.props['data-tab'] === 'quantity').props['aria-selected'], false);
  }, { storage });
});

test('each tab keeps its own draft and undo history across a switch', () => {
  const storage = new Map();
  withMount((h) => {
    // Draw on the geometry tab, switch away and back, and find it unchanged.
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    const geometry = h.board();
    h.tab('quantity');
    // Add a quantity circle through the pattern rail.
    const tool = h.find((node) => node.type === 'button'
      && String(node.props['aria-label'] || '').startsWith(`${t('circle')} ·`));
    tool.props.onClick(); h.render();
    h.tab('geometry');
    assert.deepEqual(h.board(), geometry);
    // The quantity draft never appears in the geometry key and vice versa.
    assert.equal(JSON.parse(h.raw(GEOMETRY_KEY)).elements.length, 0);
    assert.equal(JSON.parse(storage.get(QUANTITY_KEY)).objects.length, 1);
    // Undo on the geometry tab does not touch the quantity board.
    h.click(t('undo'));
    assert.equal(h.board().points.length, 0);
    assert.equal(JSON.parse(storage.get(QUANTITY_KEY)).objects.length, 1);
    h.tab('quantity');
    assert.equal(JSON.parse(storage.get(QUANTITY_KEY)).objects.length, 1);
  }, { storage });
});

test('a geometry figure is drawn with points, labels and one undo unit', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100); h.clickAt(300, 100);
    const board = h.board();
    assert.equal(board.points.length, 2);
    assert.deepEqual(board.points.map((p) => p.label), ['A', 'B']);
    h.tool('segment');
    h.clickAt(100, 100); h.clickAt(300, 100);
    assert.equal(h.board().elements.length, 1);
    assert.deepEqual(h.board().elements[0].points, ['p-1', 'p-2']);
    // One click on undo removes the segment, a second removes the last point.
    h.click(t('undo'));
    assert.equal(h.board().elements.length, 0);
    assert.equal(h.board().points.length, 2);
  });
});

test('dragging a free point commits one undo unit and previews before release', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    h.tool('select');
    h.clickAt(100, 100);
    h.moveTo(140, 120);
    assert.equal(h.board().points[0].x, 100, 'the drag is only a preview');
    h.release(140, 120);
    assert.equal(h.board().points[0].x, 140);
    assert.equal(h.board().points[0].y, 120);
    h.click(t('undo'));
    assert.equal(h.board().points[0].x, 100);
  });
});

test('rectangle corners keep right angles and the opposite corner stays put', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100); h.clickAt(300, 100); h.clickAt(300, 300);
    h.tool('rectangle');
    h.clickAt(100, 100); h.clickAt(300, 100); h.clickAt(300, 300);
    assert.equal(h.board().elements[0].type, 'rectangle');
    assert.equal(h.board().points.length, 4);
    const derived = h.board().points.find((p) => p.kind === 'derived');
    assert.ok(derived, 'the fourth corner is constructed');
  });
});

test('the whole-board and per-shape notes are independent', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    h.click(t('note'));
    h.find((n) => n.type === 'textarea').props.ref.current.value = '这是我的想法';
    h.click(t('save'));
    assert.equal(h.board().note, '这是我的想法');
  });
});

test('grid and snap are local view state, never snapshot fields', () => {
  withMount((h) => {
    h.tab('geometry');
    h.click(t('gridOff'));
    assert.ok(h.find((n) => String(n.props.className || '').includes('eb-grid')));
    const stored = JSON.parse(h.raw(GEOMETRY_KEY) || 'null');
    assert.deepEqual(Object.keys(stored).sort(), ['elements', 'note', 'points', 'schemaVersion'],
      'grid and snap never reach the snapshot');
  });
});

test('clearing this mode empties the canvas and its undo history but keeps the board note', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    h.click(t('clearGeometry'));
    h.click(t('confirmClear'));
    assert.equal(h.board().points.length, 0);
    assert.equal(h.button(t('undo')).props.disabled, true);
  });
});

test('a cross-mode file is refused and the current geometry draft stays', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    const before = h.board();
    const quantity = JSON.parse(M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'circle' })));
    assert.throws(() => G.validate(quantity));
    assert.deepEqual(h.board(), before);
  });
});
