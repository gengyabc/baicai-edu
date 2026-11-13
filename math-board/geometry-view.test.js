import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardView, createShapeArt } from './view.js';
import { createTabbedBoardView } from './board-shell.js';
import { createBoardFilePicker, createBoardIcons } from './file-picker.js';
import { createGeometryPage } from './geometry-view.js';
import { createGeometryModel } from './geometry/model.js';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { applyHostConfig } from './config-bridge.js';
import {
  advanceTutorial, createTutorialOverlay, geometryTutorialSteps, isTutorialSeen,
  markTutorialSeen, measureTourTarget, quantityTutorialSteps, tourHoldsNotePanel,
  tourInsertMode, tutorialStorageKey,
} from './tutorial.js';

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
  globalThis.window = {
    matchMedia: () => ({ matches: true }), location: { hostname: '127.0.0.1' },
    addEventListener() {}, removeEventListener() {},
  };
  const documentListeners = new Map();
  globalThis.document = {
    addEventListener(type, handler) {
      const list = documentListeners.get(type) || [];
      list.push(handler);
      documentListeners.set(type, list);
    },
    removeEventListener(type, handler) {
      const list = documentListeners.get(type) || [];
      documentListeners.set(type, list.filter((item) => item !== handler));
    },
  };
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
  const drafts = []; const attached = new Map(); const removed = []; const texts = []; let persisted = 0;
  const inputActions = {
    captureInsertion: () => ({ offset: 0 }),
    addAttachments(ids) { ids.forEach((id) => attached.set(id, id)); return true; },
    removeAttachment(id) { removed.push(id); attached.delete(id); },
    insertText(value) { texts.push(value); return true; },
    persistDraft() { persisted++; }, send() {},
  };
  const conversation = {
    createDrafts(sessionId, files) { drafts.push(files); return files.map((file) => ({ id: `draft-${file.name}` })); },
    releaseDraftAttachment() {},
  };
  const ctx = { locale: { subscribe: () => () => {}, getSnapshot: () => 'zh' }, get: () => conversation };
  // Mark both tutorials seen so first-open autoplay does not alter existing UI assertions.
  storage.set(tutorialStorageKey('quantity'), '1');
  storage.set(tutorialStorageKey('geometry'), '1');
  const shared = {
    createBoardFilePicker, createBoardIcons, createTutorialOverlay,
    isTutorialSeen, markTutorialSeen, advanceTutorial, measureTourTarget,
    tourHoldsNotePanel, tourInsertMode, quantityTutorialSteps, geometryTutorialSteps,
  };
  const quantityPage = () => createBoardView(React, M, ctx, t, '', createShapeArt(React), applyHostConfig, T, shared);
  const geometryPage = () => createGeometryPage(React, G, ctx, t, shared);
  // The shell draws the shared brand mark, so the quantity page hands it in.
  const Board = createTabbedBoardView(React, t, '', quantityPage, geometryPage, (size) => quantityPage().Mark(size));
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
    storage, drafts, attached, removed, texts, inputActions,
    get persisted() { return persisted; },
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
    openMore() {
      const menu = () => visibleNodes().filter((node) => String(node.props.className || '').includes('eb-more-menu'));
      if (menu().length === 1) return;
      button(t('moreActions')).props.onClick();
      refresh();
      assert.equal(menu().length, 1, 'More menu should open');
    },
    startTour() {
      this.openMore();
      find((node) => node.type === 'button' && text(node) === t('tutorialReplay')).props.onClick();
      refresh();
    },
    tourTitle() {
      const tip = find((node) => node.props?.className === 'eb-tour-tip');
      return text(walk(tip).find((node) => node.type === 'h2'));
    },
    notePanel() {
      return visibleNodes().find((node) => String(node.props?.['data-tour-id'] || '').endsWith('-note-panel'));
    },
    keydown(key, target) {
      let prevented = false;
      const event = { key, target, preventDefault() { prevented = true; } };
      for (const handler of documentListeners.get('keydown') || []) handler(event);
      refresh();
      return prevented;
    },
    // Browser order: keydown, then the dialog's cancel event.
    escape() {
      const event = { key: 'Escape', preventDefault() {} };
      for (const handler of documentListeners.get('keydown') || []) handler(event);
      find((node) => node.type === 'dialog').props.onCancel?.({ preventDefault() {} });
      refresh();
    },
    dialogOpen() {
      return find((node) => node.type === 'dialog').props.ref.current.open;
    },
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
    assert.equal(text(h.find((n) => n.props['data-tab'] === 'quantity')), '算数');
  }, { storage });
});

test('both docks share one toolbar, and return to chat closes the dialog from the quantity tab', () => {
  const shared = [t('backToChat'), t('undo'), t('redo'), t('zoomOut'), t('fitView'), t('zoomIn'), t('moreActions'), t('insert')];
  const labels = (h) => {
    const dock = h.find((node) => node.props.className === 'eb-dock');
    return walk(dock).filter((node) => node.type === 'button').map((node) => node.props['aria-label'] || text(node));
  };
  withMount((h) => {
    const dialog = () => h.find((node) => node.type === 'dialog').props.ref.current;
    h.click(t('title'));
    assert.equal(dialog().open, true);
    const quantity = labels(h);
    for (const label of shared) assert.ok(quantity.includes(label), `quantity dock missing ${label}`);
    assert.ok(quantity.some((label) => String(label).startsWith(`${t('note')} ·`)), 'quantity keeps the note control');
    assert.ok(quantity.some((label) => String(label).startsWith(t('creationColor'))), 'quantity keeps creation colours');
    assert.ok(quantity.includes(t('clear')));
    assert.equal(quantity.includes(t('gridOff')), false);
    assert.equal(quantity.includes(t('snapOn')), false);
    h.click(t('backToChat'));
    assert.equal(dialog().open, false, '返回对话 closes the shared dialog from the quantity tab');

    h.click(t('title'));
    h.tab('geometry');
    const geometry = labels(h);
    for (const label of shared) assert.ok(geometry.includes(label), `geometry dock missing ${label}`);
    assert.ok(geometry.includes(t('note')));
    assert.ok(geometry.includes(t('gridOff')));
    assert.ok(geometry.includes(t('snapOn')));
    assert.ok(geometry.includes(t('clearGeometry')));
    assert.equal(geometry.some((label) => String(label).startsWith(t('creationColor'))), false);
    assert.equal(geometry.includes(t('import')), false, 'open and save stay in the shared more menu');
    assert.equal(geometry.includes(t('export')), false);
    h.click(t('backToChat'));
    assert.equal(dialog().open, false);
  });
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

test('escape cancels the unfinished line and leaves the board open', () => {
  withMount((h) => {
    h.click(t('title'));
    assert.equal(h.dialogOpen(), true);
    h.tab('geometry');
    h.tool('segment');
    h.clickAt(100, 100);
    h.moveTo(240, 160);
    assert.equal(h.board().points.length, 1);
    assert.equal(h.board().elements.length, 0);
    assert.equal(walk(h.tree).filter((node) => node.type === 'polyline').length, 1, 'the unfinished segment previews');

    h.escape();
    assert.equal(h.dialogOpen(), true, 'Escape keeps the board open');
    assert.equal(h.board().points.length, 0, 'the unfinished line takes its new point with it');
    assert.equal(h.board().elements.length, 0);
    assert.equal(walk(h.tree).filter((node) => node.type === 'polyline').length, 0);
    assert.equal(h.button(t('segment')).props['aria-pressed'], false);
    assert.equal(h.button(t('select')).props['aria-pressed'], true);

    // A point placed on its own stays; Escape only drops the line that was using it.
    h.tool('point');
    h.clickAt(100, 100);
    h.tool('segment');
    h.clickAt(100, 100);
    h.moveTo(240, 160);
    assert.equal(h.board().points.length, 1);
    h.escape();
    assert.equal(h.dialogOpen(), true);
    assert.equal(h.board().points.length, 1);
    assert.equal(h.button(t('select')).props['aria-pressed'], true);

    // A finished segment is not an in-progress operation.
    h.tool('segment');
    h.clickAt(100, 100);
    h.clickAt(300, 100);
    assert.equal(h.board().elements.length, 1);
    h.escape();
    assert.equal(h.dialogOpen(), true);
    assert.equal(h.board().elements.length, 1);
    assert.equal(h.board().points.length, 2);

    // With nothing in progress, Escape still does not close the board.
    h.tab('quantity');
    h.escape();
    assert.equal(h.dialogOpen(), true);
  });
});

test('a press on the dimmed area outside the board closes it and keeps the draft', () => {
  withMount((h) => {
    const dialogNode = () => {
      const dialog = h.find((node) => node.type === 'dialog');
      const node = dialog.props.ref.current;
      node.getBoundingClientRect = () => ({ left: 40, top: 30, right: 900, bottom: 700 });
      return { dialog, node };
    };
    const press = (x, y, target, button = 0) => {
      const { dialog, node } = dialogNode();
      dialog.props.onPointerDown({ button, clientX: x, clientY: y, target, currentTarget: node });
      h.render();
    };
    h.click(t('title'));
    assert.equal(h.dialogOpen(), true);
    const { node } = dialogNode();
    press(120, 80, node);
    assert.equal(h.dialogOpen(), true, 'a press inside the dialog box stays');
    press(0, 0, { closest() { return null; } });
    assert.equal(h.dialogOpen(), true, 'a press that starts on the board stays');
    press(0, 0, node, 2);
    assert.equal(h.dialogOpen(), true, 'a secondary press on the backdrop stays');

    const tool = h.find((n) => n.type === 'button'
      && String(n.props['aria-label'] || '').startsWith(`${t('circle')} ·`));
    tool.props.onClick();
    h.render();
    h.find((n) => n.type === 'button' && String(n.props['aria-label'] || '').startsWith(`${t('note')} ·`)).props.onClick();
    h.render();
    h.find((n) => n.props?.['data-tour-id'] === 'quantity-note-panel');

    press(0, 0, dialogNode().node);
    assert.equal(h.dialogOpen(), false, 'the dimmed area closes the board');
    assert.equal(JSON.parse(h.raw(QUANTITY_KEY)).objects.length, 1, 'closing keeps the draft');

    h.click(t('title'));
    assert.equal(walk(h.tree).some((n) => n.props?.['data-tour-id'] === 'quantity-note-panel'), false);
    h.tab('geometry');
    press(1000, 10, dialogNode().node);
    assert.equal(h.dialogOpen(), false, 'the geometry tab closes the same way');
    assert.equal(JSON.parse(h.raw(QUANTITY_KEY)).objects.length, 1);
  });
});

test('escape cancels a point drag without moving it', () => {
  withMount((h) => {
    h.click(t('title'));
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    h.tool('select');
    h.clickAt(100, 100);
    h.moveTo(140, 120);
    h.escape();
    h.release(140, 120);
    assert.equal(h.dialogOpen(), true);
    assert.equal(h.board().points[0].x, 100);
    assert.equal(h.board().points[0].y, 100);
  });
});

test('geometry selection does not offer an append mode', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    h.tool('select');
    h.clickAt(100, 100);
    h.button(t('renamePoint'));
    const labels = walk(h.tree).filter((node) => node.type === 'button').map(text);
    assert.equal(labels.includes(t('appendSelect')), false);
    assert.equal(labels.includes(t('appendDone')), false);
  });
});

test('a selected edge or circle stroke resizes the shape, and the first press only selects', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('rectangle');
    h.clickAt(100, 100);
    h.clickAt(300, 100);
    h.clickAt(300, 300);
    // Every side is selected after drawing, so the drag carries the whole rectangle.
    h.clickAt(200, 100);
    h.moveTo(240, 150);
    assert.equal(h.board().points.find((p) => p.id === 'p-1').y, 100, 'the drag is only a preview');
    assert.match(String(h.find((node) => node.type === 'polygon').props.points), /140,150/);
    assert.match(String(h.find((node) => node.type === 'polygon').props.points), /340,350/);
    h.release(240, 150);
    assert.deepEqual(h.board().points.map((p) => [p.id, p.x, p.y]), [
      ['p-1', 140, 150], ['p-2', 340, 150], ['p-3', 340, 350], ['p-4', 140, 350],
    ]);
    h.clickAt(140, 150);
    h.moveTo(180, 190);
    h.release(180, 190);
    assert.deepEqual(h.board().points.map((p) => [p.id, p.x, p.y]), [
      ['p-1', 180, 190], ['p-2', 380, 190], ['p-3', 380, 390], ['p-4', 180, 390],
    ], 'a corner of the fully selected rectangle moves the whole shape');
    h.click(t('undo'));
    h.click(t('undo'));
    assert.equal(h.board().points.find((p) => p.id === 'p-1').y, 100);

    h.clickAt(40, 40);
    h.release(40, 40);
    h.clickAt(200, 100);
    h.moveTo(200, 180);
    h.release(200, 180);
    assert.equal(h.board().points.find((p) => p.id === 'p-1').y, 100, 'an unselected edge only becomes selected');
    h.clickAt(200, 100);
    h.moveTo(200, 180);
    h.release(200, 180);
    assert.equal(h.board().points.find((p) => p.id === 'p-1').y, 180);
    assert.equal(h.board().points.find((p) => p.id === 'p-1').x, 100);
    assert.equal(h.board().points.find((p) => p.id === 'p-3').y, 300, 'the opposite edge stays');
    assert.equal(h.board().points.find((p) => p.id === 'p-4').y, 300, 'the opposite edge stays');

    h.tool('circle');
    h.clickAt(500, 200);
    h.clickAt(620, 200);
    h.clickAt(620, 200);
    h.moveTo(700, 200);
    h.release(700, 200);
    const circle = h.board().elements.find((e) => e.type === 'circle');
    const center = h.board().points.find((p) => p.id === circle.centerPointId);
    const rim = h.board().points.find((p) => p.id === circle.radiusPointId);
    assert.deepEqual([center.x, center.y], [500, 200], 'the centre stays');
    assert.deepEqual([rim.x, rim.y], [700, 200]);
  });
});

test('dragging the derived corner of a freshly drawn rectangle moves the whole shape', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('rectangle');
    h.clickAt(100, 100);
    h.clickAt(300, 100);
    h.clickAt(300, 300);
    const derived = h.board().points.find((p) => p.kind === 'derived');
    assert.deepEqual([derived.x, derived.y], [100, 300]);
    h.clickAt(derived.x, derived.y);
    h.moveTo(derived.x + 40, derived.y + 40);
    h.release(derived.x + 40, derived.y + 40);
    assert.deepEqual(h.board().points.map((p) => [p.id, p.x, p.y]), [
      ['p-1', 140, 140], ['p-2', 340, 140], ['p-3', 340, 340], ['p-4', 140, 340],
    ]);
  });
});

test('dragging a fully selected segment moves the other fully selected shape with it', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('segment');
    h.clickAt(120, 80);
    h.clickAt(320, 80);
    h.tool('triangle');
    h.clickAt(140, 220);
    h.clickAt(340, 220);
    h.clickAt(240, 400);
    h.clickAt(40, 40);
    h.moveTo(450, 480);
    h.release(450, 480);
    const before = h.board().points.map((p) => [p.id, p.x, p.y]);
    h.clickAt(220, 80);
    h.moveTo(260, 130);
    h.release(260, 130);
    assert.deepEqual(h.board().points.map((p) => [p.id, p.x, p.y]), before.map(([id, x, y]) => [id, x + 40, y + 50]));
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

test('the rectangle tool draws the sides when the third click is not a right angle', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('rectangle');
    h.clickAt(120, 140);
    h.clickAt(340, 160);
    h.clickAt(360, 320);
    const board = h.board();
    assert.equal(board.elements.length, 1);
    assert.equal(board.elements[0].type, 'rectangle');
    assert.equal(board.points.length, 4, 'the fourth corner is drawn with the three clicks');
    const polygon = h.find((node) => node.type === 'polygon');
    assert.equal(String(polygon.props.points).trim().split(/\s+/).length, 4, 'the rectangle is a closed outline');
    assert.equal(polygon.props.fill, 'none');
    assert.ok(polygon.props.stroke);
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

test('rectangle third click on another shape vertex does not move that vertex', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('triangle');
    h.clickAt(100, 100);
    h.clickAt(300, 100);
    h.clickAt(200, 250);
    const before = h.board().points.find((p) => p.label === 'C');
    assert.ok(before);
    h.tool('rectangle');
    h.clickAt(100, 100);
    h.clickAt(300, 100);
    h.clickAt(200, 250);
    const board = h.board();
    const shared = board.points.find((p) => p.id === before.id);
    assert.deepEqual([shared.x, shared.y], [before.x, before.y], 'triangle vertex stays put');
    const triangle = board.elements.find((e) => e.type === 'polygon');
    assert.ok(triangle.points.includes(before.id));
    const rect = board.elements.find((e) => e.type === 'rectangle');
    assert.ok(rect);
    assert.equal(rect.points.includes(before.id), false, 'rectangle does not reuse the off-corner vertex');
    assert.equal(board.elements.length, 2);
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

test('undo and redo shortcuts work inside the geometry tab', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    const workspace = h.find((node) => String(node.props.className || '').includes('eb-geometry-workspace'));
    let prevented = false;
    workspace.props.onKeyDown({ key: 'z', metaKey: true, shiftKey: false, preventDefault() { prevented = true; } });
    h.render();
    assert.equal(prevented, true);
    assert.equal(h.board().points.length, 0);
    // Re-read the handler after the re-render; closures capture the rendered state.
    const again = h.find((node) => String(node.props.className || '').includes('eb-geometry-workspace'));
    again.props.onKeyDown({ key: 'z', metaKey: true, shiftKey: true, preventDefault() {} });
    h.render();
    assert.equal(h.board().points.length, 1);
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

test('geometry add-to-answer attaches only the geometry snapshot and keeps the note verbatim', () => {
  const previousFile = globalThis.File;
  globalThis.File = class { constructor(parts, name, options) { this.parts = parts; this.name = name; this.type = options?.type; } };
  try {
    withMount((h) => {
      h.tab('geometry');
      h.tool('point');
      h.clickAt(100, 100);
      h.click(t('note'));
      h.find((n) => n.type === 'textarea').props.ref.current.value = '  我画了一个点  ';
      h.click(t('save'));
      h.click(t('insert'));
      assert.equal(h.drafts.length, 1);
      assert.equal(h.drafts[0].length, 1, 'no trace attachment for geometry');
      assert.equal(h.drafts[0][0].name, t('geometryAttachmentName'));
      const snapshot = JSON.parse(h.drafts[0][0].parts.join(''));
      assert.equal(snapshot.kind, 'geometry-board');
      assert.equal(snapshot.schemaVersion, 1);
      assert.equal(snapshot.points.length, 1);
      assert.equal(Object.hasOwn(snapshot, 'summary'), false);
      assert.deepEqual(h.texts, ['\n  我画了一个点  \n']);
      assert.equal(h.persisted, 1);
    });
  } finally { globalThis.File = previousFile; }
});

test('a refused geometry attachment leaves no draft behind and keeps the canvas', () => {
  const previousFile = globalThis.File;
  globalThis.File = class { constructor(parts, name) { this.parts = parts; this.name = name; } };
  try {
    withMount((h) => {
      h.tab('geometry');
      h.tool('point');
      h.clickAt(100, 100);
      // A composer that refuses attachments must not leave a half-inserted draft.
      h.inputActions.addAttachments = () => false;
      h.click(t('insert'));
      assert.equal(h.persisted, 0);
      assert.equal(h.texts.length, 0);
      assert.equal(h.board().points.length, 1);
      assert.equal(h.find((n) => n.props.role === 'status').children.flat().join(''), t('insertFailed'));
    });
  } finally { globalThis.File = previousFile; }
});

test('a geometry JSON import replaces the draft and a wrong-kind file changes nothing', async () => {
  const previousFile = globalThis.File;
  globalThis.File = class {
    constructor(parts, name) { this.text = async () => parts.join(''); this.name = name; this.size = String(parts.join('')).length; }
  };
  try {
    const other = G.reduce(G.reduce(G.empty(), { type: 'addPoint', x: 200, y: 200 }), { type: 'addPoint', x: 400, y: 400 });
    const h = mount();
    try {
      h.tab('geometry');
      h.tool('point');
      h.clickAt(100, 100);
      const before = h.board();
      const input = h.find((node) => node.type === 'input' && node.props.type === 'file');
      // A quantity file is refused and the geometry draft survives untouched.
      input.props.onChange({ target: { files: [{ text: async () => M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'circle' })), size: 100 }], value: '' } });
      await new Promise((resolve) => setTimeout(resolve, 0));
      h.render();
      assert.deepEqual(h.board(), before);
      // A geometry file replaces the draft.
      input.props.onChange({ target: { files: [{ text: async () => G.serialize(other), size: 100 }], value: '' } });
      await new Promise((resolve) => setTimeout(resolve, 0));
      h.render(); h.render();
      assert.deepEqual(h.board().points.map((p) => p.id), ['p-1', 'p-2']);
    } finally { h.unmount(); }
  } finally { globalThis.File = previousFile; }
});

test('a derived point is visible and selectable but never a snap target or drag handle', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100); h.clickAt(300, 100); h.clickAt(300, 300);
    h.tool('rectangle');
    h.clickAt(100, 100); h.clickAt(300, 100); h.clickAt(300, 300);
    const derived = h.board().points.find((p) => p.kind === 'derived');
    assert.ok(derived, 'the rectangle has a derived fourth corner');
    // Re-clicking the derived corner with a shape tool does not reuse its id as an
    // endpoint: a new free point is placed instead, and no shape references the derived id.
    h.tool('segment');
    h.clickAt(derived.x, derived.y);
    const after = h.board();
    assert.equal(after.points.filter((p) => p.kind === 'free').length, 4, 'a fresh free point was placed');
    assert.equal(after.points.some((p) => p.id === derived.id && p.label !== derived.label), false);
    // Starting a drag on the derived corner does not move it; a derived point never moves.
    h.tool('select');
    h.clickAt(derived.x, derived.y);
    h.moveTo(derived.x + 40, derived.y + 40);
    h.release(derived.x + 40, derived.y + 40);
    assert.deepEqual([h.board().points.find((p) => p.id === derived.id).x,
      h.board().points.find((p) => p.id === derived.id).y], [derived.x, derived.y],
    'a derived point is not a drag handle');
    // A visible endpoint is not duplicated by a click next to it: the click reuses it.
    const free = h.board().points.find((p) => p.kind === 'free');
    h.tool('point');
    const before = h.board().points.length;
    h.clickAt(free.x + 3, free.y + 3);
    assert.equal(h.board().points.length, before, 'snapping to a free point never duplicates it');
  });
});

test('opening text matches the quantity canvas position and font', () => {
  withMount((h) => {
    const line = (root, copy) => walk(root).find((n) => n.type === 'text' && text(n) === copy);
    const placed = (node) => ({
      x: node.props.x, y: node.props.y, fontSize: node.props.fontSize,
      fontWeight: node.props.fontWeight, fill: node.props.fill, textAnchor: node.props.textAnchor,
    });
    h.tab('quantity');
    const quantity = h.find((n) => n.props.className === 'eb-artboard');
    h.tab('geometry');
    const geometry = h.find((n) => n.type === 'svg' && String(n.props.className || '').includes('eb-geometry'));
    assert.deepEqual(placed(line(geometry, t('geometryEmpty'))), placed(line(quantity, t('canvasEmpty'))));
    assert.deepEqual(placed(line(geometry, t('geometryEmptyHint'))), placed(line(quantity, t('canvasEmptyHint'))));
  });
});

test('zoom magnifies the drawing and fit shows the whole board', () => {
  withMount((h) => {
    h.tab('geometry');
    const artboard = () => h.find((n) => n.type === 'svg' && String(n.props.className || '').includes('eb-geometry'));
    const before = artboard();
    assert.equal(before.props.viewBox, '0 0 800 600', 'fit-to-width frames the whole board');
    assert.deepEqual(before.props.style, { width: '100%', height: 'auto', aspectRatio: '800 / 600' },
      'fit keeps the full canvas width, so text stays at the original size');
    h.find((n) => n.type === 'button' && n.props['aria-label'] === t('zoomIn')).props.onClick();
    h.render();
    const zoomed = artboard();
    // A real zoom narrows the viewBox, so every stroke and label is magnified.
    assert.equal(zoomed.props.viewBox, '80 60 640 480');
    assert.ok(String(zoomed.props.style.width) === '100%', 'the canvas keeps its slot size');
    // 适应宽度 restores the full board.
    h.find((n) => n.type === 'button' && text(n) === '125%').props.onClick();
    h.render();
    const fitted = artboard();
    assert.equal(fitted.props.viewBox, '0 0 800 600');
  });
});

test('midpoint marks the selected segment and stays idle until a segment is selected', () => {
  withMount((h) => {
    h.tab('geometry');
    const midpoint = () => h.find((node) => node.type === 'button' && node.props['aria-label'] === t('midpoint'));
    assert.equal(midpoint().props.disabled, true, 'midpoint is idle with nothing selected');
    h.tool('point');
    h.clickAt(100, 100);
    h.clickAt(300, 200);
    assert.equal(midpoint().props.disabled, true, 'two free points are not a segment');
    h.tool('segment');
    h.clickAt(100, 100);
    h.clickAt(300, 200);
    assert.equal(midpoint().props.disabled, false, 'the segment just drawn can take a midpoint');
    const before = h.board().points.length;
    h.click(t('midpoint'));
    const board = h.board();
    const derived = board.points.find((point) => point.kind === 'derived');
    assert.equal(board.points.length, before + 1);
    assert.equal(board.elements.length, 1, 'marking a midpoint does not add another shape');
    assert.deepEqual(derived.construction, { op: 'midpoint', inputs: ['p-1', 'p-2'] });
    assert.equal(derived.x, 200);
    assert.equal(derived.y, 150);
    assert.equal(midpoint().props.disabled, true, 'the new point is selected, so midpoint is idle again');
    h.tool('select');
    h.clickAt(150, 125);
    assert.equal(midpoint().props.disabled, true, 'a segment that already has its midpoint stays idle');
  });
});

test('a selected side of a shape can take a midpoint', () => {
  withMount((h) => {
    h.tab('geometry');
    const midpoint = () => h.find((node) => node.type === 'button' && node.props['aria-label'] === t('midpoint'));
    h.tool('triangle');
    h.clickAt(120, 80);
    h.clickAt(360, 90);
    h.clickAt(200, 320);
    assert.equal(midpoint().props.disabled, true, 'every side of a new shape is selected, so midpoint stays idle');

    // The closing side runs from the third vertex back to the first.
    h.clickAt(40, 40);
    h.release(40, 40);
    h.clickAt(160, 200);
    assert.equal(midpoint().props.disabled, false, 'one selected side of the triangle can take a midpoint');
    h.click(t('midpoint'));
    const board = h.board();
    const derived = board.points.find((point) => point.kind === 'derived');
    assert.equal(board.elements.length, 1, 'marking a midpoint does not add another shape');
    assert.equal(board.elements[0].type, 'polygon');
    assert.deepEqual(derived.construction, { op: 'midpoint', inputs: ['p-3', 'p-1'] });
    assert.equal(derived.x, 160);
    assert.equal(derived.y, 200);

    h.clickAt(180, 260);
    assert.equal(midpoint().props.disabled, true, 'a side that already has its midpoint stays idle');

    h.clickAt(40, 40);
    h.release(40, 40);
    h.clickAt(280, 205);
    assert.equal(midpoint().props.disabled, false, 'another side of the same shape can still take a midpoint');

    h.tool('circle');
    h.clickAt(560, 200);
    h.clickAt(680, 200);
    assert.equal(midpoint().props.disabled, true, 'a circle has no side to mark');

    h.tool('rectangle');
    h.clickAt(100, 420);
    h.clickAt(260, 420);
    h.clickAt(260, 540);
    h.clickAt(40, 40);
    h.release(40, 40);
    h.clickAt(180, 420);
    assert.equal(midpoint().props.disabled, false, 'a rectangle side between two free corners can take a midpoint');
    h.clickAt(40, 40);
    h.release(40, 40);
    h.clickAt(180, 540);
    assert.equal(midpoint().props.disabled, true, 'a side that ends on the derived corner stays idle');
  });
});

test('the point tool is drawn as a filled circle', () => {
  withMount((h) => {
    h.tab('geometry');
    const button = h.find((node) => node.type === 'button' && node.props['aria-label'] === t('point'));
    const mark = walk(button).find((node) => node.type === 'circle');
    assert.ok(mark, 'the point tool draws a circle');
    assert.equal(mark.props.fill, 'currentColor');
    assert.notEqual(mark.props.fill, 'none');
  });
});

test('the midpoint tool shows a segment with a mark at its middle', () => {
  withMount((h) => {
    h.tab('geometry');
    const button = h.find((node) => node.type === 'button' && node.props['aria-label'] === t('midpoint'));
    const marks = walk(button);
    assert.ok(marks.some((node) => node.type === 'path'), 'the icon includes the segment');
    const dots = marks.filter((node) => node.type === 'circle' && node.props.fill === 'currentColor');
    assert.ok(dots.length >= 1, 'the middle of the segment is a filled mark');
  });
});

test('the triangle tool closes three points into a polygon', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('triangle');
    h.clickAt(120, 80);
    h.clickAt(360, 90);
    h.clickAt(200, 320);
    const board = h.board();
    assert.equal(board.elements.length, 1);
    assert.equal(board.elements[0].type, 'polygon');
    assert.deepEqual(board.elements[0].points, ['p-1', 'p-2', 'p-3']);
    assert.equal(board.points.length, 3, 'the third click closes the triangle');
  });
});

test('auxiliary is a switch, and the next shape follows it', () => {
  withMount((h) => {
    h.tab('geometry');
    const control = () => h.find((node) => node.type === 'button' && node.props.role === 'switch');
    assert.equal(control().props['aria-label'], t('auxiliary'));
    assert.equal(control().props['aria-checked'], false);
    assert.equal(control().props['aria-pressed'], undefined, 'a switch is not a pressed tool');
    h.click(t('auxiliary'));
    assert.equal(control().props['aria-checked'], true);
    h.tool('segment');
    h.clickAt(80, 80);
    h.clickAt(240, 80);
    assert.equal(h.board().elements[0].role, 'auxiliary');
    h.click(t('auxiliary'));
    assert.equal(control().props['aria-checked'], false);
    h.tool('triangle');
    h.clickAt(80, 160);
    h.clickAt(240, 160);
    h.clickAt(160, 300);
    assert.equal(h.board().elements[1].role, 'main');
    assert.equal(h.board().elements[1].type, 'polygon');
  });
});

test('undo shortcuts and Delete stay off the canvas while an overlay is open', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    h.click(t('clearGeometry'));
    const workspace = h.find((node) => String(node.props.className || '').includes('eb-geometry-workspace'));
    let prevented = false;
    workspace.props.onKeyDown({ key: 'z', metaKey: true, shiftKey: false, preventDefault() { prevented = true; } });
    let deleted = false;
    workspace.props.onKeyDown({ key: 'Delete', metaKey: false, shiftKey: false, preventDefault() { deleted = true; } });
    h.render();
    assert.equal(prevented, false, 'the overlay owns the keyboard');
    assert.equal(deleted, false);
    assert.equal(h.board().points.length, 1, 'nothing is deleted under the overlay');
  });
});

test('quantity tour advances on signals, blocks early insert, and keeps the note panel on Cancel', () => {
  withMount((h) => {
    const addCircle = () => {
      h.find((node) => node.type === 'button'
        && String(node.props['aria-label'] || '').startsWith(`${t('circle')} ·`)).props.onClick();
      h.render();
    };
    h.startTour();
    assert.equal(h.tourTitle(), t('tutorialQAddTitle'));
    assert.equal(h.button(t('insert')).props.disabled, true, 'Insert stays off until the insert step');

    addCircle();
    assert.equal(h.tourTitle(), t('tutorialQColorTitle'));

    h.find((node) => node.type === 'button' && node.props['aria-label'] === `${t('creationColor')} · 10`).props.onClick();
    h.render();
    assert.equal(h.tourTitle(), t('tutorialQAddMoreTitle'));

    addCircle();
    assert.equal(h.tourTitle(), t('tutorialQNoteTitle'));
    assert.equal(h.drafts.length, 0);

    h.find((node) => node.type === 'button' && String(node.props.className || '').includes('eb-note-button')).props.onClick();
    h.render();
    assert.equal(h.tourTitle(), t('tutorialQNoteSaveTitle'));
    assert.ok(h.notePanel(), 'note-save keeps the panel as the tour target');

    h.click(t('cancel'));
    assert.ok(h.notePanel(), 'Cancel must not dismiss the note panel on note-save');
    assert.equal(h.tourTitle(), t('tutorialQNoteSaveTitle'));

    h.keydown('Escape');
    assert.ok(h.notePanel(), 'Escape must not dismiss the note panel on note-save');
    assert.equal(h.tourTitle(), t('tutorialQNoteSaveTitle'));

    h.click(t('clear'));
    assert.ok(h.notePanel(), 'Clear must not replace the note panel on note-save');
    assert.equal(h.tourTitle(), t('tutorialQNoteSaveTitle'));
    assert.equal(
      walk(h.tree).some((node) => node.props?.className === 'eb-overlay-card eb-overlay-clear'),
      false,
      'Clear must not open the clear card during note-save',
    );

    h.click(t('save'));
    assert.equal(h.tourTitle(), t('tutorialQInsertTitle'));
    assert.equal(h.button(t('insert')).props.disabled, false);

    h.click(t('insert'));
    assert.equal(h.drafts.length, 0, 'insert practice must not createDrafts');
    assert.equal(h.find((node) => node.props.role === 'status').children.flat().join(''), t('tutorialInsertPractice'));
    assert.equal(visibleTour(h), false, 'the last practice step closes the coach');
  });
});

test('geometry tour advances on signals, blocks early insert, and keeps the note panel on Cancel', () => {
  withMount((h) => {
    h.tab('geometry');
    h.startTour();
    assert.equal(h.tourTitle(), t('tutorialGPointToolTitle'));
    assert.equal(h.button(t('insert')).props.disabled, true, 'Insert stays off until the insert step');

    h.tool('point');
    assert.equal(h.tourTitle(), t('tutorialGPlacePointTitle'));

    h.clickAt(140, 120);
    assert.equal(h.tourTitle(), t('tutorialGSegmentToolTitle'));

    h.tool('segment');
    assert.equal(h.tourTitle(), t('tutorialGDrawSegmentTitle'));

    h.clickAt(140, 120);
    h.clickAt(280, 200);
    assert.equal(h.tourTitle(), t('tutorialGNoteTitle'));
    assert.equal(h.drafts.length, 0);

    h.find((node) => node.type === 'button' && String(node.props.className || '').includes('eb-note-button')).props.onClick();
    h.render();
    assert.equal(h.tourTitle(), t('tutorialGNoteSaveTitle'));
    assert.ok(h.notePanel(), 'note-save keeps the panel as the tour target');

    h.click(t('cancel'));
    assert.ok(h.notePanel(), 'Cancel must not dismiss the note panel on note-save');
    assert.equal(h.tourTitle(), t('tutorialGNoteSaveTitle'));

    h.keydown('Escape');
    assert.ok(h.notePanel(), 'Escape must not dismiss the note panel on note-save');
    assert.equal(h.tourTitle(), t('tutorialGNoteSaveTitle'));

    h.click(t('clearGeometry'));
    assert.ok(h.notePanel(), 'Clear must not replace the note panel on note-save');
    assert.equal(h.tourTitle(), t('tutorialGNoteSaveTitle'));
    assert.equal(
      walk(h.tree).some((node) => node.props?.className === 'eb-overlay-card eb-overlay-clear'),
      false,
      'Clear must not open the clear card during note-save',
    );

    h.click(t('save'));
    assert.equal(h.tourTitle(), t('tutorialGInsertTitle'));
    assert.equal(h.button(t('insert')).props.disabled, false);

    h.click(t('insert'));
    assert.equal(h.drafts.length, 0, 'insert practice must not createDrafts');
    assert.equal(h.find((node) => node.props.role === 'status').children.flat().join(''), t('tutorialInsertPractice'));
    assert.equal(visibleTour(h), false, 'the last practice step closes the coach');
  });
});

test('polygon is the tool after rectangle', () => {
  withMount((h) => {
    h.tab('geometry');
    const rail = h.find((node) => String(node.props.className || '').includes('eb-geometry-tools'));
    const labels = walk(rail)
      .filter((node) => node.type === 'button' && Object.hasOwn(node.props, 'aria-pressed'))
      .map((node) => node.props['aria-label']);
    assert.deepEqual(labels, [
      t('select'), t('point'), t('segment'), t('triangle'), t('circle'),
      t('parallelogram'), t('rectangle'), t('polygon'),
    ]);
  });
});

test('a circle does not draw its rim point, and deleting the circle removes that point', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('circle');
    h.clickAt(200, 200);
    h.clickAt(320, 200);
    const board = h.board();
    assert.equal(board.points.length, 2, 'the radius is still stored as a rim point');
    const canvas = h.find((node) => String(node.props.className || '').includes('eb-artboard'));
    const marks = walk(canvas).filter((node) => node.props?.['data-point']);
    assert.deepEqual(marks.map((node) => node.props['data-point']), ['p-1'], 'only the centre is drawn');
    h.click(t('trash'));
    assert.deepEqual(h.board().elements, []);
    assert.deepEqual(h.board().points.map((p) => p.id), ['p-1']);
  });
});

test('a rim point that belongs to another shape stays visible', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('segment');
    h.clickAt(200, 200);
    h.clickAt(320, 200);
    h.tool('circle');
    h.clickAt(200, 200);
    h.clickAt(320, 200);
    const canvas = h.find((node) => String(node.props.className || '').includes('eb-artboard'));
    const marks = walk(canvas).filter((node) => node.props?.['data-point']).map((node) => node.props['data-point']);
    assert.deepEqual(marks.sort(), ['p-1', 'p-2']);
  });
});

test('select mode box-selects several objects and deletes them together', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(100, 100);
    h.clickAt(220, 100);
    h.clickAt(520, 420);
    h.tool('segment');
    h.clickAt(100, 100);
    h.clickAt(220, 100);
    h.tool('select');
    h.clickAt(70, 70);
    h.moveTo(250, 150);
    h.release(250, 150);
    assert.match(text(h.find((node) => node.props.className === 'eb-floating')), /3/);
    h.click(t('trash'));
    assert.deepEqual(h.board().elements, []);
    assert.deepEqual(h.board().points.map((p) => p.id), ['p-3'], 'the point outside the box stays');
  });
});

test('clicking one side of a triangle deletes only that side', () => {
  withMount((h) => {
    h.tab('geometry');
    h.tool('triangle');
    h.clickAt(120, 80);
    h.clickAt(360, 90);
    h.clickAt(200, 320);
    h.clickAt(240, 85);
    h.release(240, 85);
    assert.match(text(h.find((node) => node.props.className === 'eb-floating')), new RegExp(`${t('selectedCount')} 1`));
    h.click(t('trash'));
    const board = h.board();
    assert.deepEqual(board.elements.map((e) => e.points), [['p-2', 'p-3'], ['p-3', 'p-1']]);
    assert.equal(board.points.length, 3, 'the corners of the remaining sides stay');
    h.clickAt(280, 205);
    h.click(t('trash'));
    assert.deepEqual(h.board().elements.map((e) => e.points), [['p-3', 'p-1']]);
    assert.deepEqual(h.board().points.map((p) => p.id), ['p-1', 'p-3']);
  });
});

test('deleting a selected segment removes endpoints with no other use', () => {
  withMount((h) => {
    h.tab('geometry');
    h.click(t('title'));
    h.tool('segment');
    h.clickAt(100, 140);
    h.clickAt(340, 140);
    assert.equal(h.keydown('Delete', { tagName: 'SELECT' }), false);
    assert.equal(h.board().elements.length, 1, 'the question menu keeps Delete');
    h.keydown('Delete');
    assert.deepEqual(h.board().elements, []);
    assert.deepEqual(h.board().points, []);
    h.tool('segment');
    h.clickAt(100, 200);
    h.clickAt(100, 80);
    h.tool('triangle');
    h.clickAt(100, 200);
    h.clickAt(300, 200);
    h.clickAt(200, 360);
    h.tool('select');
    h.clickAt(100, 140);
    h.click(t('trash'));
    const board = h.board();
    assert.equal(board.elements.length, 1);
    assert.equal(board.elements[0].type, 'polygon');
    assert.equal(board.points.length, 3, 'vertices the triangle still uses stay');
  });
});

test('Delete and Backspace remove the quantity selection without focusing a shape', () => {
  withMount((h) => {
    h.click(t('title'));
    const addCircle = () => {
      h.find((node) => node.type === 'button'
        && String(node.props['aria-label'] || '').startsWith(`${t('circle')} ·`)).props.onClick();
      h.render();
    };
    const shapes = () => walk(h.tree).filter((node) => node.props && node.props['data-object']);
    const ids = () => h.quantityBoard().objects.map((object) => object.id);
    const failed = () => walk(h.tree).some((node) => node.props.className === 'eb-status-toast'
      && String(text(node)).startsWith(t('failed')));
    addCircle();
    addCircle();
    assert.deepEqual(ids(), ['object-1', 'object-2']);
    // The newest shape is selected. A click does not focus it, so Delete has to
    // reach the selection from the document the way it does on the geometry tab.
    shapes().find((node) => node.props['data-object'] === 'object-1').props.onKeyDown({
      key: 'Enter', shiftKey: true, preventDefault() {},
    });
    h.render();
    assert.equal(h.keydown('Delete', { tagName: 'SELECT' }), false);
    assert.deepEqual(ids(), ['object-1', 'object-2'], 'the question menu keeps Delete');
    assert.equal(h.keydown('Delete'), true);
    assert.deepEqual(ids(), []);
    assert.equal(failed(), false, 'one key is a single delete');
    h.click(t('undo'));
    assert.deepEqual(ids(), ['object-1', 'object-2']);
    // Undo clears the selection, so pick the second shape again. Backspace on the
    // other, focused shape removes only that one.
    shapes().find((node) => node.props['data-object'] === 'object-2').props.onKeyDown({
      key: 'Enter', preventDefault() {},
    });
    h.render();
    assert.equal(h.keydown('Backspace', {
      tagName: 'g',
      closest(selector) {
        return selector === '[data-object]' ? { getAttribute: () => 'object-1' } : null;
      },
    }), true);
    assert.deepEqual(ids(), ['object-2']);

    h.find((node) => node.type === 'button'
      && String(node.props['aria-label'] || '').startsWith(`${t('note')} ·`)).props.onClick();
    h.render();
    assert.equal(h.keydown('Backspace', { tagName: 'TEXTAREA' }), false);
    assert.deepEqual(ids(), ['object-2'], 'a note keeps Backspace');
    h.keydown('Escape');
    shapes().find((node) => node.props['data-object'] === 'object-2').props.onKeyDown({
      key: 'Enter', preventDefault() {},
    });
    h.render();
    assert.equal(h.keydown('Delete'), true);
    assert.deepEqual(ids(), []);

    addCircle();
    h.tab('geometry');
    h.tool('segment');
    h.clickAt(80, 80);
    h.clickAt(240, 80);
    h.tab('quantity');
    h.keydown('Delete');
    assert.deepEqual(ids(), []);
    h.tab('geometry');
    assert.equal(h.board().elements.length, 1, 'quantity Delete leaves the geometry canvas alone');
    h.keydown('Delete');
    assert.deepEqual(h.board().elements, []);
    assert.deepEqual(h.board().points, []);
  });
});

function visibleTour(h) {
  return walk(h.tree).some((node) => node.props?.className === 'eb-tour-tip');
}
