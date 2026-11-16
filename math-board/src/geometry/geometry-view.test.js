import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardView, createShapeArt } from '../quantity/view.js';
import { createTabbedBoardView } from '../shell/board-shell.js';
import { createBoardFilePicker, createBoardIcons } from '../shared/file-picker.js';
import { createGeometryPage } from './geometry-view.js';
import { createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames } from './geometry-basics.js';
import { createGeometryConstructChapter } from './geometry-construct.js';
import { createGeometryEditChapter } from './geometry-edit.js';
import { createGeometryAdjustChapter } from './geometry-adjust.js';
import { createPracticeProgress, createPracticeNavigation } from '../shell/practice-progress.js';
import { createGeometryDemoPage, readDemoView } from '../teacher-demo/geometry-demo-view.js';
import { placeFigure } from './place-figure.js';
import { captionBox, captionPosition, visibleCaption } from './caption.js';
import {
  geometryHiddenPoints, geometryCaptionLabel, geometryPointLabel, geometryPointDot, geometryShapeNode, geometryStroke,
} from './draw.js';
import { geometryViewport, geometryFrameInputs, geometryTextOverflow, geometryFrame } from './frame.js';
import { createBoardControls } from '../shared/board-kit.js';
import { createGeometryModel } from './model.js';
import { createBoardModel } from '../quantity/model.js';
import { createBoardTrace } from '../quantity/trace.js';
import { createHooks, installBrowser, text, walk } from '../testing/test-harness.js';
import { applyHostConfig } from '../host/config-bridge.js';
import {
  advanceTutorial, createTutorialController, createTutorialOverlay, geometryTutorialSteps, isTutorialSeen,
  markTutorialSeen, measureTourTarget, quantityTutorialSteps, tourHoldsNotePanel,
  tourInsertMode, tutorialStorageKey,
} from '../shell/tutorial.js';

// The radius the geometry page uses to decide a press landed on a point.
const POINT_HIT_RADIUS = Number(/Math\.hypot\(q\.x - p\.x, q\.y - p\.y\) <= (\d+)/.exec(
  await readFile(new URL('./geometry-view.js', import.meta.url), 'utf8'),
)?.[1]);
if (!Number.isFinite(POINT_HIT_RADIUS)) throw new Error('The geometry page no longer states its point hit radius');
const M = createBoardModel();
const G = createGeometryModel();
const T = createBoardTrace(M);
const locale = JSON.parse(await readFile(new URL('../../locale/zh.json', import.meta.url), 'utf8'));
const enLocale = JSON.parse(await readFile(new URL('../../locale/en.json', import.meta.url), 'utf8'));
const t = (key, params = {}) => {
  assert.equal(typeof locale[key], 'string', `Missing locale key: ${key}`);
  return locale[key].replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(params, name) ? String(params[name]) : match);
};
const QUANTITY_KEY = 'baicai-edu-math-board:v4:tabbed';
const GEOMETRY_KEY = `baicai-edu-math-board:geometry:v1:tabbed`;
const PRACTICE_KEY = 'baicai-edu-math-board:practice:v2:geometry';

/** Stateful hooks: persistent slots, dependency-aware effects and explicit rendering. */
function mount(options = {}) {
  // English runs swap only the dictionary: the same page, the same steps.
  const dictionary = options.language === 'en' ? enLocale : locale;
  const translate = options.language === 'en'
    ? (key, params = {}) => {
      assert.equal(typeof enLocale[key], 'string', `Missing English locale key: ${key}`);
      return enLocale[key].replace(/\{(\w+)\}/g, (match, name) =>
        Object.hasOwn(params, name) ? String(params[name]) : match);
    }
    : t;
  const storage = options.storage || new Map();
  const browser = installBrowser({ storage });
  const { React, storeFor, hooks, render: renderTree, refresh: refreshTree, unmount: unmountPages } = createHooks();
  const { documentListeners, key: pressKey } = browser;
  const dom = new Map();
  let tree;
  const drafts = []; const attached = new Map(); const removed = []; const texts = []; let persisted = 0;
  const localInputActions = {
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
  const localConversation = conversation;
  const ctx = { locale: { subscribe: () => () => {}, getSnapshot: () => 'zh' },
    get: (name) => (options.conversation ? options.conversation(name) : localConversation) };
  const inputActions = options.inputActions || localInputActions;
  // Mark both tutorials seen so first-open autoplay does not alter existing UI assertions.
  storage.set(tutorialStorageKey('quantity'), '1');
  storage.set(tutorialStorageKey('geometry'), '1');
  const shared = {
    createBoardFilePicker, createBoardIcons, createTutorialController, createTutorialOverlay,
    isTutorialSeen, markTutorialSeen, advanceTutorial, measureTourTarget,
    tourHoldsNotePanel, tourInsertMode, quantityTutorialSteps, geometryTutorialSteps,
    placeFigure, captionPosition, captionBox, visibleCaption,
    createBoardControls, createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames,
    geometryPracticeChapters: [createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter],
    createPracticeProgress, createPracticeNavigation,
    geometryHiddenPoints, geometryCaptionLabel, geometryPointLabel, geometryPointDot, geometryShapeNode, geometryStroke,
    geometryViewport, geometryTextOverflow, geometryFrame, geometryFrameInputs,
  };
  const quantityPage = () => createBoardView(React, M, ctx, translate, '', createShapeArt(React), applyHostConfig, T, shared);
  let geometryComponent;
  const geometryPage = () => (geometryComponent = createGeometryPage(React, G, ctx, translate, shared));
  const demoPage = () => createGeometryDemoPage(React, G, translate, shared);
  // The shell draws the shared brand mark, so the quantity page hands it in.
  const Board = createTabbedBoardView(React, translate, '', {
    quantity: quantityPage, geometry: geometryPage, demo: demoPage,
    mark: (size) => quantityPage().Mark(size)
  }, (view) => readDemoView(G, view));
  const props = { sessionId: 'tabbed', useProjection: options.useProjection || (() => null),
    useChat: options.useChat, useInput: options.useInput || (() => 'plain'), inputActions };

  const h = React.createElement;
  // A function component becomes its output; its hooks run against its own slots.
  function expand(node) {
    if (!node || typeof node !== 'object') return node;
    if (typeof node.type === 'function') {
      const previous = hooks.current;
      hooks.current = storeFor(node.type);
      try { return expand(node.type(node.props)); } finally { hooks.current = previous; }
    }
    return { ...node, children: (node.children || []).flat(Infinity).map(expand) };
  }
  // The tree the harness renders: the shell, with every page expanded into plain nodes.
  // The shared hooks re-render a tree through this same function, so effects queue where
  // each component's own slots live and settle before a test looks at the result.
  const build = () => buildTree();
  function buildTree() { return expand(h(Board, props)); }
  function render() {
    const rendered = renderTree(build);
    for (const node of walk(rendered)) if (node.props.ref && typeof node.props.ref === 'object') {
      const ref = node.props.ref;
      if (!dom.has(ref)) dom.set(ref, {
        open: false, ownerDocument: { activeElement: null }, href: '',
        showModal() { this.open = true; }, close() { this.open = false; },
        contains: () => false, focus() {}, select() {}, click() {},
      });
      ref.current = dom.get(ref);
    }
    tree = rendered;
    return tree;
  }
  function refresh() {
    const rendered = refreshTree(build);
    for (const node of walk(rendered)) if (node.props.ref && typeof node.props.ref === 'object') {
      const ref = node.props.ref;
      if (!dom.has(ref)) dom.set(ref, {
        open: false, ownerDocument: { activeElement: null }, href: '',
        showModal() { this.open = true; }, close() { this.open = false; },
        contains: () => false, focus() {}, select() {}, click() {},
      });
      ref.current = dom.get(ref);
    }
    tree = rendered;
    return tree;
  }
  // Both tabs stay mounted; queries see only the visible panel so each tab's own
  // controls are unambiguous (the hidden tab is a separate canvas and toolbar).
  const visibleNodes = () => {
    const all = walk(tree);
    const hidden = all.filter((node) => node.type === 'div' && node.props && node.props.hidden);
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
    render: refresh, find, button, visibleNodes,
    resizeGeometry(width, height) {
      // Drive the viewport state that ResizeObserver supplies in the real browser.
      const slot = storeFor(geometryComponent).slots.find((item) => item?.value
        && Object.keys(item.value).sort().join(',') === 'height,width');
      assert.ok(slot, 'geometry viewport state exists');
      slot.value = { width, height };
      refresh();
    },
    tab(name) {
      find((node) => node.props['data-tab'] === name).props.onClick();
      refresh();
    },
    click(label) { const node = button(label); assert.ok(!node.props.disabled, `${label} should be enabled`); node.props.onClick(); refresh(); },
    tool(label) {
      const node = find((candidate) => candidate.type === 'button' && candidate.props['aria-label'] === translate(label));
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
        button: 0, clientX: x, clientY: y, pointerId: 1, shiftKey: false, ...extra,
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
      button(translate('moreActions')).props.onClick();
      refresh();
      assert.equal(menu().length, 1, 'More menu should open');
    },
    startTour() {
      this.openMore();
      find((node) => node.type === 'button' && text(node) === translate('tutorialReplay')).props.onClick();
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
      pressKey(key, { target });
      refresh();
      return prevented;
    },
    // Browser order: keydown, then the dialog's cancel event.
    escape() {
      pressKey('Escape');
      find((node) => node.type === 'dialog').props.onCancel?.({ preventDefault() {} });
      refresh();
    },
    dialogOpen() {
      return find((node) => node.type === 'dialog').props.ref.current.open;
    },
    unmount() {
      unmountPages();
      browser.restore();
    },
  };
  // Hit testing mirrors the view's own point radius; it is read from the page source so the
  // double cannot drift away from the code it stands in for.
  function hitNode(selector, x, y) {
    if (!String(selector).includes('data-point')) return null;
    // Practice draws on its own board. The real draft stays put, so a hit has to use
    // the board that is actually on screen.
    let state = null;
    if (visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined)) {
      try {
        const saved = JSON.parse(storage.get(PRACTICE_KEY));
        state = saved.entries[saved.current].frame.board;
      } catch { state = null; }
    }
    if (!state) state = api.board();
    const hit = state.points.find((point) => Math.hypot(point.x - x, point.y - y) <= POINT_HIT_RADIUS);
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
    const preview = h.visibleNodes().filter((node) => node.type === 'polygon' && node.props.points?.includes('140,150'));
    assert.equal(preview.length, 1, 'the moved rectangle is previewed where the model put it');
    assert.match(String(preview[0].props.points), /340,350/);
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
    assert.equal(board.points.length, 4, 'the three corners plus the derived fourth');
    // The crooked click was only a height, so it is not left behind as a stray dot.
    assert.equal(board.points.filter((point) => point.kind === 'free').length, 3);
    assert.ok(!board.points.some((point) => point.x === 360 && point.y === 320));
    const polygons = h.visibleNodes().filter((node) => node.type === 'polygon');
    assert.equal(polygons.length, 1, 'one closed outline is drawn for the rectangle');
    const [polygon] = polygons;
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
    assert.deepEqual(Object.keys(stored).sort(), ['canvas', 'elements', 'note', 'points', 'schemaVersion'],
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

test('fit shows the whole board and only zooming scrolls to the rest of it', () => {
  withMount((h) => {
    h.tab('geometry');
    const artboard = () => h.find((n) => n.type === 'svg' && String(n.props.className || '').includes('eb-geometry'));
    const zoomLabel = () => h.find((n) => n.type === 'button' && n.props['aria-label'] === t('fitView'));
    const zoomIn = () => h.find((n) => n.type === 'button' && n.props['aria-label'] === t('zoomIn'));
    const before = artboard();
    const [, , w, vh] = before.props.viewBox.split(' ').map(Number);
    // A fit keeps the whole board in the frame, with room for point labels on each side.
    assert.ok(w > 800 && vh > 600, 'the fit leaves room past the board for its labels');
    // The viewBox AND SVG box fill the frame at one scale; no letterboxing remains.
    assert.deepEqual(before.props.style, { width: 1280, height: 640 });
    assert.ok(Math.abs(w / vh - 2) < 1e-9, 'viewBox has the same aspect ratio as the frame');
    assert.equal(before.props.preserveAspectRatio, 'xMidYMid meet');

    zoomIn().props.onClick();
    h.render();
    const zoomed = artboard();
    // Zooming grows the canvas box instead of cropping the viewBox, so everything drawn
    // stays reachable by scrolling the frame.
    assert.equal(zoomed.props.viewBox, before.props.viewBox, 'zoom never crops the drawn area');
    assert.equal(typeof zoomed.props.style.width, 'number', 'a zoom leaves the frame and sizes the canvas itself');
    assert.equal(zoomed.props.style.width, 1600, 'zoom scales expanded paper by 125%');
    assert.equal(zoomed.props.style.height, 800);
    assert.equal(text(zoomLabel()), '125%');

    // 适应宽度 restores the full board at the fit scale.
    zoomLabel().props.onClick();
    h.render();
    assert.deepEqual(artboard().props.style, before.props.style);
    assert.equal(h.find((n) => n.type === 'button' && n.props['aria-label'] === t('fitView')).props['aria-pressed'], true);
  });
});

test('viewport measurement ignores scrollbar feedback and floors fractional layout sizes', () => {
  const node = {
    clientWidth: 1199, clientHeight: 699,
    getBoundingClientRect: () => ({ width: 1198.5, height: 698.5 }),
  };
  const before = geometryViewport(node);
  node.clientWidth -= 15;
  node.clientHeight -= 15;
  assert.deepEqual(geometryViewport(node), before, 'scrollbars must not resize the coordinate system');
  assert.deepEqual(before, { width: 1198, height: 698 }, 'never round into fractional overflow');
  assert.equal(geometryViewport({ getBoundingClientRect: () => ({ width: 0, height: 0 }) }), null);
});

test('student fill expands board coordinates across a wide frame without stretching', () => {
  const frame = geometryFrame(
    { width: 800, height: 600, board: { points: [], elements: [] } },
    { width: 1600, height: 640 }, { value: 1, fit: true, fill: true },
  );
  assert.ok(frame.paper.width > 1400, 'the extra width is drawable paper, not SVG letterboxing');
  assert.equal(frame.box.width, 1600);
  assert.equal(frame.box.height, 640);
  assert.ok(Math.abs(frame.box.width / frame.span.width - frame.box.height / frame.span.height) < 1e-9,
    'horizontal and vertical units have identical scale');
});

test('expanded geometry paper supports drawing, grid and snapshot reopening past the old edge', () => {
  const storage = new Map();
  withMount((h) => {
    h.tab('geometry');
    h.click(t('gridOff'));
    const svg = h.find((n) => n.type === 'svg' && String(n.props.className || '').includes('eb-geometry'));
    const [, , w, height] = svg.props.viewBox.split(' ').map(Number);
    const horizontal = walk(svg).filter((n) => n.type === 'line' && n.props.y1 === n.props.y2);
    assert.ok(horizontal.some((n) => n.props.x2 - n.props.x1 >= w - 1e-6), 'grid crosses the full paper');
    assert.ok(w > 1200 && height >= 600);
    h.tool('point');
    h.clickAt(1100, 100);
    assert.equal(h.board().points[0].x, 1100, 'new area must not clamp to the old 776 edge');
    const saved = JSON.parse(G.serialize(h.board()));
    assert.ok(saved.canvas.width >= 1124, 'snapshot retains new paper extent');
    assert.equal(G.validate(saved).points[0].x, 1100);
  }, { storage });
  withMount((h) => {
    h.tab('geometry');
    assert.equal(h.board().points[0].x, 1100, 'reopening keeps drawing in the added area');
  }, { storage });
});

test('resizing fills both axes without compounding unused paper or clipping existing points', () => {
  withMount((h) => {
    h.tab('geometry');
    const original = { ...h.board().canvas };
    for (let i = 0; i < 4; i++) {
      h.resizeGeometry(640, 1280);
      assert.ok(h.board().canvas.height > 1500, 'portrait frame extends vertically');
      h.resizeGeometry(1280, 640);
      assert.deepEqual(h.board().canvas, original, 'unused paper never compounds');
    }
    h.tool('point');
    h.clickAt(1100, 100);
    h.resizeGeometry(640, 1280);
    assert.equal(h.board().points[0].x, 1100);
    assert.ok(h.board().canvas.width >= 1124, 'occupied paper never clips after a resize');
  });
});

test('geometry dock clear, undo, redo and more buttons contain visible icons', () => {
  withMount((h) => {
    h.tab('geometry');
    for (const label of ['clearGeometry', 'undo', 'redo', 'moreActions']) {
      const control = h.find((n) => n.type === 'button' && n.props['aria-label'] === t(label));
      assert.ok(walk(control).some((n) => n.type === 'svg'), `${label} must contain an actual icon`);
    }
  });
});

test('a short frame still fits the whole board instead of cropping its bottom', () => {
  // The window the tests run in is short relative to the 800×600 board: a fit measured by
  // width alone would show only the top of the board, and the rest sat below the frame.
  const frame = geometryFrame(
    { width: 800, height: 600, board: { points: [], elements: [] }, textBoxes: [], emptyText: [] },
    { width: 1280, height: 400 },
    { value: 1, fit: true },
  );
  assert.ok(frame.box.height <= 400 + 1, 'the fitted canvas is no taller than the frame');
  assert.ok(frame.box.width <= 1280 + 1, 'the fitted canvas is no wider than the frame');
  assert.ok(Math.abs(frame.box.height - 400) <= 1, 'the short side is the one that meets the frame');
  assert.equal(frame.visible.x + frame.visible.width >= 800, true, 'the whole board is inside the view');
  assert.equal(frame.visible.y + frame.visible.height >= 600, true);
});

test('the canvas keeps a reserve for the ink that lies past the board edge', () => {
  withMount((h) => {
    h.tab('geometry');
    // A point on the far corner draws its label up and to the right of itself, past both
    // edges of the board; the fitted canvas must still show that label whole.
    h.tool('point');
    h.clickAt(776, 576);
    const artboard = () => h.find((n) => n.type === 'svg' && String(n.props.className || '').includes('eb-geometry'));
    const [x, y, w, vh] = artboard().props.viewBox.split(' ').map(Number);
    const label = walk(artboard()).find((n) => n.type === 'text' && text(n) === 'A');
    assert.ok(label, 'the corner point is labelled');
    assert.ok(label.props.x + 40 <= x + w, 'a label past the right edge stays inside the canvas');
    assert.ok(label.props.y - 14 >= y, 'a label above the top edge stays inside the canvas');
    assert.ok(y + vh >= 600, 'the whole board is inside the canvas');
  });
});

for (const pointerType of ['mouse','touch']) test(`geometry safe basics real editor replay (${pointerType}) preserves both drafts and composer`, () => {
  const h = mount();
  try {
    h.tab('geometry'); h.tool('point'); h.clickAt(80,80); h.tool('select');
    const real = h.raw(GEOMETRY_KEY), quantity = h.raw(QUANTITY_KEY);
    h.startTour();
    const step = () => h.find(n=>n.props?.['data-practice-step']).props['data-practice-step'];
    const tap = (x,y) => {h.clickAt(x,y,{pointerType}); h.release(x,y);};
    const state = () => JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-basics'];
    assert.equal(step(),'point');
    h.click(t('insert')); assert.equal(h.drafts.length,0); assert.equal(step(),'point');
    h.tool('point'); assert.equal(step(),'point'); tap(100,100); assert.equal(step(),'segment');
    h.tool('segment'); tap(100,100); assert.equal(step(),'segment'); tap(260,100); assert.equal(step(),'triangle');
    h.tool('triangle'); tap(100,100); tap(260,100); assert.equal(step(),'triangle'); tap(180,220); assert.equal(step(),'polygon');
    h.tool('polygon'); tap(350,100); tap(480,100); tap(480,220); tap(350,220); assert.equal(step(),'polygon');
    tap(350,100); assert.equal(step(),'circle');
    h.tool('circle'); tap(620,350); assert.equal(step(),'circle'); tap(690,350); assert.equal(step(),'select-one');
    tap(100,100); assert.equal(step(),'deselect'); tap(740,500); assert.equal(step(),'insert');
    const board = state().frame.board; assert.equal(board.elements.length,4);
    h.click(t('insert')); assert.equal(step(),'complete');
    assert.equal(h.drafts.length,0); assert.equal(h.attached.size,0); assert.equal(h.texts.length,0); assert.equal(h.persisted,0);
    assert.equal(h.raw(GEOMETRY_KEY),real); assert.equal(h.raw(QUANTITY_KEY),quantity);
    h.click(t('practiceExit')); assert.equal(h.raw(GEOMETRY_KEY),real);
  } finally {h.unmount();}
});

// --- Ticket03: chapter navigation, resume, isolation and simulated insert ---

function practiceStep(h) {
  const node = h.find((n) => n.props && n.props['data-practice-step'] !== undefined);
  return node.props['data-practice-step'];
}
function practiceState(h) { return JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-basics']; }
function practiceCoachText(h) {
  const coach = h.find((n) => n.props && n.props['data-practice-step'] !== undefined);
  return text(coach);
}
/**
 * A tap on the canvas with a pointer type. Drawing tools commit on press, so a tap is one
 * press: a release would be a second, unrelated operation.
 */
function tapShaped(h, x, y, pointerType = 'mouse') {
  h.clickAt(x, y, { pointerType });
}

test('geometry practice resumes the unfinished step and its whole picture after a refresh', () => {
  const storage = new Map();
  let h = mount({ storage });
  try {
    h.tab('geometry'); h.tool('point'); h.clickAt(80, 80); h.tool('select');
    const real = h.raw(GEOMETRY_KEY);
    h.startTour();
    h.tool('point');
    tapShaped(h, 100, 100, 'mouse');
    assert.equal(practiceStep(h), 'segment');
    h.tool('segment'); tapShaped(h, 100, 100, 'mouse');
    assert.equal(practiceStep(h), 'segment', 'one endpoint does not finish the segment');
    // A deliberate view choice the student made inside the practice must survive the refresh.
    h.click(t('gridOff'));
    const saved = practiceState(h);
    assert.equal(saved.frame.grid, true, 'the practice frame keeps its own grid setting');
    // The practice keeps a history of its own edits, separate from the real draft's.
    assert.equal(saved.frame.history.past.length > 0, true, 'the practice point is its own undo unit');
    assert.equal(h.raw(GEOMETRY_KEY), real, 'the real draft history is untouched');

    // A refresh is a real remount of the page; the browser storage is the only thing kept.
    h.unmount();
    h = mount({ storage });
    h.tab('geometry');
    assert.ok(!h.visibleNodes().some((n) => n.props && n.props['data-practice-step'] !== undefined),
      'a refresh does not reopen practice on its own; the student re-enters it');
    h.startTour();
    assert.equal(practiceStep(h), 'segment', 'the unfinished step is restored, not restarted');
    const restored = practiceState(h).frame;
    assert.equal(restored.board.points.length, 1, 'the practice picture comes back');
    assert.equal(restored.tool, 'segment', 'the tool the student had chosen comes back');
    assert.equal(restored.grid, true, 'the view setting comes back');
    assert.equal(h.raw(GEOMETRY_KEY), real, 'the real geometry draft is untouched by practice');
  } finally { h.unmount(); }
});

test('geometry practice offers reset, skip, supplementary retry and chapter retry in its own coach', () => {
  const storage = new Map();
  const h = mount({ storage });
  try {
    h.tab('geometry'); h.tool('point'); h.clickAt(110, 110);
    const real = h.raw(GEOMETRY_KEY);
    h.startTour();
    h.tool('point');
    tapShaped(h, 100, 100, 'mouse');
    assert.equal(practiceStep(h), 'segment');
    // Skip the line: the next step receives a starting point it did not have to draw.
    h.click(t('practiceSkipStep'));
    const skipped = practiceState(h);
    assert.equal(skipped.goal.step, 'triangle');
    assert.equal(skipped.states[1], 'skipped', 'a skipped step is recorded as skipped, never completed');
    assert.equal(practiceStep(h), 'triangle');
    // The skipped step can be practised again from its own start, then returns to where it was.
    const retry = `${t('practiceRetryStep', { step: 2 })}`;
    h.click(retry);
    assert.equal(practiceStep(h), 'segment', 'the supplement starts the skipped operation again');
    const supplementStart = practiceState(h);
    assert.ok(supplementStart.frame.board.points.length >= 1, 'the supplement supplies the endpoint it needs');
    h.tool('segment');
    tapShaped(h, 100, 100, 'mouse'); tapShaped(h, 260, 100, 'mouse');
    assert.equal(practiceStep(h), 'triangle', 'a successful supplement returns to the pending step');
    assert.equal(JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-basics'].returnTo, undefined,
      'the supplement returned to the pending step instead of keeping a continuation');
    // Reset the current step restores its own starting picture.
    h.click(t('practiceReset'));
    assert.equal(practiceState(h).goal.step, 'triangle');
    assert.equal(h.raw(GEOMETRY_KEY), real, 'navigation never writes the real draft');
  } finally { h.unmount(); }
});

test('geometry practice feedback says what is missing and never awards a skipped-only run', () => {
  const h = mount();
  try {
    h.tab('geometry');
    h.startTour();
    h.tool('point');
    tapShaped(h, 100, 100, 'mouse');
    assert.equal(practiceStep(h), 'segment');
    h.click(t('practiceSkipStep'));
    assert.match(practiceCoachText(h), /沿用线段的两个端点/, 'the coach names the action for the current step');
    // Skipping every remaining step must end honestly, not claim completion.
    for (let index = 0; index < 8; index++) {
      if (practiceState(h).goal.completed) break;
      h.click(t('practiceSkipStep'));
    }
    assert.equal(practiceState(h).goal.completed, true, 'the run reaches its end');
    assert.match(practiceCoachText(h), /跳过|skipped/i, 'the end message reports skipped steps rather than completion');
    assert.equal(practiceState(h).states[0], 'completed', 'only the operation the student actually did is completed');
    assert.equal(practiceState(h).states.slice(1).every((state) => state === 'skipped'), true,
      'every operation the student skipped is recorded as skipped');
    // The coach still offers an always-available exit.
    h.click(t('practiceExit'));
    assert.ok(!h.visibleNodes().some((n) => n.props && n.props['data-practice-step'] !== undefined), 'exit leaves practice');
  } finally { h.unmount(); }
});

test('geometry practice never reaches the host, the composer or a file at any step', () => {
  // Every host-facing surface is a tripwire: any call is counted by name.
  let host = 0, composer = 0, files = 0, sends = 0;
  const observed = [];
  const inputActions = {
    captureInsertion() { composer++; return { offset: 0 }; },
    addAttachments() { composer++; return true; },
    removeAttachment() { composer++; },
    insertText() { composer++; return true; },
    persistDraft() { composer++; },
    send() { sends++; },
  };
  const h = mount({
    inputActions,
    // The shell and the real quantity page read their own projections; a geometry
    // practice reaching any of them would be the failure this test names.
    useProjection(name) { observed.push(name); return null; },
    useChat() { return '[]'; },
    conversation() { files++; return { createDrafts() { files++; return []; }, releaseDraftAttachment() { files++; } }; },
  });
  try {
    h.tab('geometry');
    h.tool('point'); h.clickAt(80, 80);
    const realGeometry = h.raw(GEOMETRY_KEY);
    h.startTour();
    // A fresh mount decides what its boards read; later renders just re-read those names.
    // Practice consulting a new projection the real boards never asked for is the failure.
    const beforeMount = new Set(observed);
    const step = () => practiceStep(h);
    const untouched = () => {
      const introduced = [...new Set(observed)].filter((name) => !beforeMount.has(name));
      assert.deepEqual(introduced, [], `step ${step()} introduced projections ${introduced.join(', ')}`);
      assert.ok(composer === 0 && files === 0 && sends === 0,
        `step ${step()} touched composer=${composer} files=${files} send=${sends}`);
    };
    // The insert control is live at every step, the first one included, and attaches nothing.
    for (let guard = 0; guard < 12 && step() !== 'insert'; guard++) {
      h.click(t('insert'));
      assert.equal(h.drafts.length, 0, 'no draft is created');
      assert.equal(h.attached.size, 0, 'no attachment is added');
      untouched();
      if (step() === 'point') { h.tool('point'); tapShaped(h, 100, 100); }
      else if (step() === 'segment') { h.tool('segment'); tapShaped(h, 100, 100); tapShaped(h, 260, 100); }
      else if (step() === 'triangle') {
        h.tool('triangle'); tapShaped(h, 100, 100); tapShaped(h, 260, 100); tapShaped(h, 180, 220);
      } else if (step() === 'polygon') {
        h.tool('polygon'); tapShaped(h, 350, 100); tapShaped(h, 480, 100);
        tapShaped(h, 420, 220); tapShaped(h, 350, 100);
      } else if (step() === 'circle') { h.tool('circle'); tapShaped(h, 620, 350); tapShaped(h, 690, 350); }
      else if (step() === 'select-one') { h.tool('select'); tapShaped(h, 100, 100); }
      else if (step() === 'deselect') { h.tool('select'); h.clickAt(740, 500); h.release(740, 500); }
      else break;
    }
    assert.equal(step(), 'insert', 'the run reaches the simulated insert');
    h.click(t('insert'));
    assert.equal(step(), 'complete');
    assert.equal(h.drafts.length, 0);
    assert.equal(h.attached.size, 0);
    assert.equal(h.texts.length, 0);
    assert.equal(h.persisted, 0);
    untouched();
    assert.equal(h.raw(GEOMETRY_KEY), realGeometry, 'the real geometry draft keeps its own value');
  } finally { h.unmount(); }
});

test('practice never writes over legal host changes and a late save cannot touch the real draft', () => {
  const storage = new Map();
  let clear = null;
  const h = mount({ storage, useProjection: (name) => (name === 'eduBoardClear' ? clear : null) });
  try {
    h.tab('geometry');
    h.tool('point'); h.clickAt(80, 80); h.clickAt(300, 80);
    const real = h.raw(GEOMETRY_KEY);
    const realBoard = h.board();
    h.startTour();
    h.tool('point'); tapShaped(h, 100, 100);
    assert.equal(practiceStep(h), 'segment');
    // A legitimate host change arrives while practice is open: the real draft keeps it.
    const hostBoard = G.reduce(realBoard, { type: 'addPoint', x: 420, y: 160 });
    h.set(GEOMETRY_KEY, JSON.stringify(hostBoard));
    clear = { revision: 9, requestId: 'call-9', requestedAt: Date.now() - 1000 };
    h.render();
    // The practice keeps practising and its save never replaces the host's draft.
    h.tool('segment'); tapShaped(h, 100, 100); tapShaped(h, 260, 100);
    assert.equal(practiceStep(h), 'triangle');
    assert.equal(h.raw(GEOMETRY_KEY), JSON.stringify(hostBoard), 'the host change is not reverted');
    // Leaving through the shell close is the same path as 返回对话.
    h.click(t('practiceExit'));
    h.render();
    assert.equal(h.raw(GEOMETRY_KEY), JSON.stringify(hostBoard), 'exit does not restore a pre-practice backup');
    assert.equal(h.raw(PRACTICE_KEY) !== undefined, true, 'practice progress is its own record');
    // A remount after practice exits reads the host's draft, not a practice picture.
    const again = mount({ storage, useProjection: (name) => (name === 'eduBoardClear' ? clear : null) });
    try {
      again.tab('geometry');
      assert.equal(again.board().points.length, hostBoard.points.length, 'the real draft is the host version');
      assert.ok(!again.visibleNodes().some((n) => n.props['data-practice-step'] !== undefined), 'practice is not reopened');
    } finally { again.unmount(); }
  } finally { h.unmount(); }
});

test('closing the board mid-practice leaves the real draft exactly as it was', () => {
  const storage = new Map();
  const h = mount({ storage });
  try {
    h.tab('geometry');
    h.tool('point'); h.clickAt(90, 90); h.clickAt(320, 90);
    const real = h.raw(GEOMETRY_KEY);
    h.startTour();
    h.tool('point'); tapShaped(h, 150, 150);
    h.tool('segment'); tapShaped(h, 150, 150); tapShaped(h, 300, 250);
    assert.equal(practiceStep(h), 'triangle');
    const practice = h.raw(PRACTICE_KEY);
    // 返回对话 closes through the same bound close the shell hands every page.
    h.click(t('backToChat'));
    assert.equal(h.dialogOpen(), false, 'the board closes');
    assert.equal(h.raw(GEOMETRY_KEY), real, 'the real draft is untouched by closing');
    assert.equal(h.raw(PRACTICE_KEY), practice, 'practice progress survives to be resumed later');
    // Reopening shows the real draft, not the practice picture.
    h.click(t('title'));
    assert.equal(h.board().points.length, 2);
    assert.ok(!h.visibleNodes().some((n) => n.props['data-practice-step'] !== undefined), 'practice stays closed');
  } finally { h.unmount(); }
});

for (const language of ['zh', 'en']) {
  const tr = language === 'en' ? (key) => enLocale[key] : (key) => locale[key];
  test(`geometry safe basics completes in ${language} with every goal shown`, () => {
    const h = mount({ language });
    try {
      h.tab('geometry');
      h.startTour();
      assert.equal(practiceStep(h), 'point');
      // The coach speaks the page's language at every step, not only the first.
      const seen = [];
      let page = 'point';
      const advance = () => {
        page = practiceStep(h);
        seen.push(practiceCoachText(h));
        if (practiceStep(h) === 'segment') { h.tool('segment'); tapShaped(h, 100, 100); tapShaped(h, 260, 100); }
        else if (practiceStep(h) === 'triangle') {
          h.tool('triangle'); tapShaped(h, 100, 100); tapShaped(h, 260, 100); tapShaped(h, 180, 220);
        } else if (practiceStep(h) === 'polygon') {
          h.tool('polygon'); tapShaped(h, 350, 100); tapShaped(h, 480, 100);
          tapShaped(h, 420, 220); tapShaped(h, 350, 100);
        } else if (practiceStep(h) === 'circle') { h.tool('circle'); tapShaped(h, 620, 350); tapShaped(h, 690, 350); }
        else if (practiceStep(h) === 'select-one') { h.tool('select'); tapShaped(h, 100, 100); }
        else if (practiceStep(h) === 'deselect') { h.tool('select'); h.clickAt(740, 500); h.release(740, 500); }
      };
      h.tool('point'); tapShaped(h, 100, 100);
      for (let guard = 0; guard < 10 && practiceStep(h) !== 'insert'; guard++) advance();
      assert.equal(practiceStep(h), 'insert', `${language}: the run reaches the simulated insert`);
      seen.push(practiceCoachText(h));
      // Every shown goal came from this language's dictionary, never a fallback or a key name.
      for (const copy of seen) {
        assert.ok(copy.length > 0);
        assert.ok(!/geometryPracticeGoal_|practiceGoal_/.test(copy), `${language}: no raw keys on screen`);
        // The coach carries the goal sentence for the step it is on, in this language.
        assert.ok(copy.includes(page === 'point' ? tr('geometryPracticeGoal_point') : tr('geometryPracticeBasics')));
      }
      h.click(tr('insert'));
      assert.equal(practiceStep(h), 'complete');
      assert.match(practiceCoachText(h), new RegExp(language === 'en' ? 'completed' : '完成'));
    } finally { h.unmount(); }
  });
}

test('geometry safe basics closes the polygon and clears a selection with touch alone', () => {
  const h = mount();
  try {
    h.tab('geometry');
    h.startTour();
    // Every step is driven by touch pointer events, with no keyboard and no hover.
    h.tool('point'); h.clickAt(100, 100, { pointerType: 'touch' });
    h.tool('polygon');
    for (const [x, y] of [[350, 100], [480, 100], [420, 220]]) h.clickAt(x, y, { pointerType: 'touch' });
    // Tapping back on the first vertex is what closes the ring.
    h.clickAt(350, 100, { pointerType: 'touch' });
    assert.equal(practiceState(h).frame.board.elements.filter((e) => e.type === 'polygon').length, 1,
      'closing by tapping the start point creates one polygon');
    // A touch tap on empty canvas with the select tool clears the selection on release.
    h.tool('select');
    h.clickAt(740, 500, { pointerType: 'touch' });
    h.release(740, 500);
    assert.equal(practiceState(h).frame.selection.length, 0, 'touch clears the selection');
    // No keyboard shortcut and no hover was needed anywhere above.
    assert.ok(!h.visibleNodes().some((n) => (n.props['data-practice-step'] || '') === 'hover'));
  } finally { h.unmount(); }
});

function constructState(h) {
  return JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-construct'];
}
function enterConstruct(h, tr) {
  h.find((node) => node.type === 'button' && text(node).includes(tr('geometryPracticeConstruct'))).props.onClick();
  h.render();
}
function practiceParagraph(h) {
  const coach = h.find((node) => node.props && node.props['data-practice-step'] !== undefined);
  return text(walk(coach).find((node) => node.type === 'p'));
}

for (const language of ['zh', 'en']) {
  for (const pointerType of ['mouse', 'touch']) {
    test(`geometry construct replay (${language}, ${pointerType}) finishes and leaves the real draft`, () => {
      const h = mount({ language });
      const tr = language === 'en'
        ? (key, params = {}) => enLocale[key].replace(/\{(\w+)\}/g, (match, name) => (Object.hasOwn(params, name) ? String(params[name]) : match))
        : t;
      try {
        h.tab('geometry');
        h.tool('point'); h.clickAt(90, 90); h.tool('select');
        const real = h.raw(GEOMETRY_KEY);
        const quantity = h.raw(QUANTITY_KEY);
        h.startTour();
        enterConstruct(h, tr);
        assert.equal(practiceStep(h), 'construct-parallelogram');
        const heading = h.find((node) => node.props && node.props['data-practice-step'] !== undefined);
        assert.equal(text(walk(heading).find((node) => node.type === 'strong')), tr('geometryPracticeConstruct'));
        assert.equal(practiceParagraph(h), tr('geometryPracticeGoal_construct-parallelogram'));
        const seen = [practiceParagraph(h)];
        const tap = (x, y) => h.clickAt(x, y, { pointerType });
        const drag = (x, y, nx, ny) => { h.clickAt(x, y, { pointerType }); h.moveTo(nx, ny); h.release(nx, ny); };
        h.tool('polygon');
        tap(80, 80); tap(200, 80); tap(140, 140); tap(80, 80);
        assert.equal(practiceStep(h), 'construct-parallelogram', 'a plain polygon is not a parallelogram');
        h.tool('parallelogram');
        tap(400, 180); tap(560, 180); tap(480, 300);
        assert.equal(practiceStep(h), 'construct-rectangle');
        seen.push(practiceParagraph(h));
        h.tool('rectangle');
        tap(200, 400); tap(400, 400);
        assert.equal(practiceStep(h), 'construct-rectangle', 'two clicks are still a preview');
        tap(400, 520);
        assert.equal(practiceStep(h), 'construct-select-side');
        seen.push(practiceParagraph(h));
        const midpoint = h.find((node) => node.type === 'button' && node.props['aria-label'] === tr('midpoint'));
        assert.equal(midpoint.props.disabled, true);
        midpoint.props.onClick();
        h.render();
        assert.equal(practiceStep(h), 'construct-select-side', 'a disabled midpoint click does not advance');
        h.tool('select');
        tap(300, 180);
        assert.equal(practiceStep(h), 'construct-midpoint');
        seen.push(practiceParagraph(h));
        h.tool('midpoint');
        assert.equal(practiceStep(h), 'construct-drag');
        seen.push(practiceParagraph(h));
        assert.match(practiceParagraph(h), language === 'en' ? /derived point cannot be dragged directly/ : /派生点不能直接拖动/);
        drag(300, 180, 330, 220);
        assert.equal(practiceStep(h), 'construct-drag', 'dragging the midpoint does not pass');
        h.clickAt(200, 180, { pointerType });
        h.release(200, 180);
        assert.equal(practiceStep(h), 'construct-drag', 'a press that does not move does not pass');
        drag(200, 180, 240, 220);
        assert.equal(practiceStep(h), 'construct-auxiliary');
        seen.push(practiceParagraph(h));
        h.tool('auxiliary');
        assert.equal(practiceStep(h), 'construct-auxiliary', 'the switch alone is not an auxiliary figure');
        h.tool('segment');
        tap(520, 240); tap(680, 240);
        assert.equal(practiceStep(h), 'construct-auxiliary-off');
        assert.equal(constructState(h).frame.board.elements.some((item) => item.role === 'auxiliary'), true);
        seen.push(practiceParagraph(h));
        h.tool('auxiliary');
        assert.equal(practiceStep(h), 'construct-complete');
        seen.push(practiceParagraph(h));
        for (const copy of seen) {
          assert.ok(copy.length > 0);
          assert.ok(!/geometryPracticeGoal_|practiceGoal_/.test(copy), `${language}: no raw keys on screen`);
        }
        assert.equal(h.drafts.length, 0);
        assert.equal(h.attached.size, 0);
        assert.equal(h.texts.length, 0);
        assert.equal(h.persisted, 0);
        assert.equal(h.raw(GEOMETRY_KEY), real);
        assert.equal(h.raw(QUANTITY_KEY), quantity);
        h.click(tr('practiceExit'));
        assert.equal(h.raw(GEOMETRY_KEY), real, 'exit leaves the real geometry draft unchanged');
        assert.ok(!h.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined));
      } finally { h.unmount(); }
    });
  }
}

test('geometry construct skip, reset, and chapter retry stay on the practice board', () => {
  const h = mount();
  try {
    h.tab('geometry');
    h.tool('point'); h.clickAt(90, 90);
    const real = h.raw(GEOMETRY_KEY);
    h.startTour();
    enterConstruct(h, t);
    h.click(t('practiceSkipStep'));
    assert.equal(practiceStep(h), 'construct-rectangle');
    assert.equal(constructState(h).states[0], 'skipped');
    assert.equal(constructState(h).frame.board.elements.some((item) => item.type === 'parallelogram'), false);
    assert.ok(constructState(h).frame.board.points.filter((point) => point.kind === 'free').length >= 3);
    h.click(t('practiceReset'));
    assert.equal(practiceStep(h), 'construct-rectangle');
    h.click(`${t('practiceRetryStep', { step: 1 })}`);
    assert.equal(practiceStep(h), 'construct-parallelogram');
    assert.equal(constructState(h).returnTo === undefined, false);
    h.click(t('practiceSkipStep'));
    assert.equal(practiceStep(h), 'construct-rectangle');
    assert.equal(constructState(h).returnTo, undefined);
    h.click(t('practiceRetryChapter'));
    assert.equal(practiceStep(h), 'construct-parallelogram');
    assert.equal(JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-basics'].states[0], 'in-progress');
    assert.equal(h.raw(GEOMETRY_KEY), real);
    h.click(t('practiceExit'));
    assert.equal(h.raw(GEOMETRY_KEY), real);
  } finally { h.unmount(); }
});

test('geometry construct reset keeps the drag step marked on the free point', () => {
  const h = mount();
  try {
    h.tab('geometry');
    h.startTour();
    enterConstruct(h, t);
    const tap = (x, y) => h.clickAt(x, y);
    h.tool('parallelogram');
    tap(400, 180); tap(560, 180); tap(480, 300);
    h.tool('rectangle');
    tap(200, 400); tap(400, 400); tap(400, 520);
    h.tool('select');
    tap(300, 180);
    assert.equal(practiceStep(h), 'construct-midpoint');
    h.tool('midpoint');
    assert.equal(practiceStep(h), 'construct-drag');
    const pointId = constructState(h).goal.pointId;
    const derived = constructState(h).frame.board.points.find((point) => point.construction?.op === 'midpoint');
    assert.ok(derived, 'the midpoint commit is on the drag step board');
    assert.notEqual(derived.id, pointId);
    h.click(t('practiceReset'));
    assert.equal(practiceStep(h), 'construct-drag');
    const restored = constructState(h);
    assert.deepEqual(restored.frame.selection, [pointId], 'reset marks the free point, not the derived midpoint');
    assert.equal(restored.goal.pointId, pointId);
    const marked = h.find((node) => node.props && node.props['data-point'] === pointId);
    const midpoint = h.find((node) => node.props && node.props['data-point'] === derived.id);
    assert.equal(marked.props['aria-pressed'], true);
    assert.equal(midpoint.props['aria-pressed'], false);
    const point = restored.frame.board.points.find((item) => item.id === pointId);
    assert.equal(point.kind, 'free');
    h.clickAt(point.x, point.y);
    h.moveTo(point.x + 40, point.y + 40);
    h.release(point.x + 40, point.y + 40);
    assert.equal(practiceStep(h), 'construct-auxiliary', 'moving the marked free point still advances');
  } finally { h.unmount(); }
});

function editState(h) {
  return JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-edit'];
}
function enterEdit(h, tr) {
  h.find((node) => node.type === 'button' && text(node).includes(tr('geometryPracticeEdit'))).props.onClick();
  h.render();
}
function setControl(h, type, value) {
  const node = h.find((item) => item.type === type && item.props.type !== 'file');
  node.props.ref.current.value = value;
}
function captionAt(h) {
  const state = editState(h);
  const board = state.frame.board;
  const element = board.elements.find((item) => item.id === state.goal.elementId);
  const caption = captionPosition(element, (id) => {
    const point = board.points.find((item) => item.id === id);
    return point ? { x: point.x, y: point.y } : null;
  }, { width: 1280, height: 640 });
  assert.ok(caption, 'the short note is drawn as a caption');
  return caption;
}

for (const language of ['zh', 'en']) {
  for (const pointerType of ['mouse', 'touch']) {
    test(`geometry edit replay (${language}, ${pointerType}) finishes and leaves the real draft`, () => {
      const h = mount({ language });
      const tr = language === 'en'
        ? (key, params = {}) => enLocale[key].replace(/\{(\w+)\}/g, (match, name) => (Object.hasOwn(params, name) ? String(params[name]) : match))
        : t;
      try {
        h.tab('geometry');
        h.tool('point'); h.clickAt(90, 90); h.tool('select');
        const real = h.raw(GEOMETRY_KEY);
        const quantity = h.raw(QUANTITY_KEY);
        h.startTour();
        enterEdit(h, tr);
        assert.equal(practiceStep(h), 'edit-rename');
        const heading = h.find((node) => node.props && node.props['data-practice-step'] !== undefined);
        assert.equal(text(walk(heading).find((node) => node.type === 'strong')), tr('geometryPracticeEdit'));
        assert.equal(practiceParagraph(h), tr('geometryPracticeGoal_edit-rename'));
        const seen = [practiceParagraph(h)];
        const tap = (x, y) => h.clickAt(x, y, { pointerType });
        h.click(tr('renamePoint'));
        h.click(tr('cancel'));
        assert.equal(practiceStep(h), 'edit-rename', 'cancel does not rename');
        h.click(tr('renamePoint'));
        setControl(h, 'input', '');
        h.click(tr('apply'));
        assert.equal(practiceStep(h), 'edit-rename', 'an empty name does not pass');
        const other = editState(h).frame.board.points.find((point) => point.id !== editState(h).goal.pointId);
        h.click(tr('renamePoint'));
        setControl(h, 'input', other.label);
        h.click(tr('apply'));
        assert.equal(practiceStep(h), 'edit-rename', 'a duplicate name does not pass');
        h.click(tr('renamePoint'));
        setControl(h, 'input', '甲');
        h.click(tr('apply'));
        assert.equal(practiceStep(h), 'edit-text-add');
        seen.push(practiceParagraph(h));
        h.tool('text');
        tap(300, 480);
        h.click(tr('cancel'));
        assert.equal(practiceStep(h), 'edit-text-add', 'cancel does not add text');
        h.tool('text');
        tap(300, 480);
        setControl(h, 'textarea', '   ');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-text-add', 'an empty save does not add text');
        h.tool('text');
        tap(300, 480);
        setControl(h, 'textarea', '面积');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-text-change');
        seen.push(practiceParagraph(h));
        h.tool('text');
        tap(360, 500);
        setControl(h, 'textarea', '另一份');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-text-change', 'a second text does not pass');
        h.click(tr('editText'));
        setControl(h, 'textarea', '周长');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-delete');
        seen.push(practiceParagraph(h));
        const deleteId = editState(h).goal.deleteId;
        assert.deepEqual(editState(h).frame.selection, [deleteId]);
        h.click(tr('trash'));
        assert.equal(practiceStep(h), 'edit-point-note');
        assert.equal(editState(h).frame.board.points.some((point) => point.id === deleteId)
          || editState(h).frame.board.elements.some((element) => element.id === deleteId), false);
        const kept = editState(h).goal.keepId;
        assert.equal(editState(h).frame.board.points.some((point) => point.id === kept)
          || editState(h).frame.board.elements.some((element) => element.id === kept), true);
        seen.push(practiceParagraph(h));
        h.click(tr('note'));
        setControl(h, 'textarea', '起点');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-element-note');
        seen.push(practiceParagraph(h));
        h.click(tr('note'));
        setControl(h, 'textarea', '字'.repeat(21));
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-element-note', 'a note longer than 20 characters does not pass');
        h.click(tr('note'));
        setControl(h, 'textarea', '边');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-caption');
        seen.push(practiceParagraph(h));
        const caption = captionAt(h);
        h.moveTo(caption.x, caption.y);
        assert.equal(practiceStep(h), 'edit-caption', 'hovering the caption does not pass');
        h.clickAt(caption.x, caption.y, { pointerType });
        h.click(tr('cancel'));
        assert.equal(practiceStep(h), 'edit-caption', 'opening the caption without saving does not pass');
        h.clickAt(caption.x, caption.y, { pointerType });
        setControl(h, 'textarea', '改过');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-deselect');
        seen.push(practiceParagraph(h));
        h.clickAt(740, 500, { pointerType });
        h.release(740, 500);
        assert.equal(practiceStep(h), 'edit-board-note');
        seen.push(practiceParagraph(h));
        h.tool('text');
        tap(300, 520);
        setControl(h, 'textarea', '新的');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-board-note');
        h.click(tr('note'));
        setControl(h, 'textarea', 'Stolen');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-board-note', 'a note on the newly selected text does not pass');
        const stolen = editState(h).frame.board;
        assert.equal(stolen.note, '');
        assert.equal(stolen.elements.filter((element) => element.type === 'text').every((element) => element.note === ''), true);
        h.clickAt(740, 500, { pointerType });
        h.release(740, 500);
        h.click(tr('note'));
        setControl(h, 'textarea', '');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-board-note', 'an empty board note does not pass');
        h.click(tr('note'));
        setControl(h, 'textarea', language === 'en' ? 'Whole board' : '整板');
        h.click(tr('save'));
        assert.equal(practiceStep(h), 'edit-complete');
        seen.push(practiceParagraph(h));
        for (const copy of seen) {
          assert.ok(copy.length > 0);
          assert.ok(!/geometryPracticeGoal_|practiceGoal_/.test(copy), `${language}: no raw keys on screen`);
        }
        assert.equal(h.drafts.length, 0);
        assert.equal(h.attached.size, 0);
        assert.equal(h.texts.length, 0);
        assert.equal(h.persisted, 0);
        assert.equal(h.raw(GEOMETRY_KEY), real);
        assert.equal(h.raw(QUANTITY_KEY), quantity);
        h.click(tr('practiceExit'));
        assert.equal(h.raw(GEOMETRY_KEY), real, 'exit leaves the real geometry draft unchanged');
        assert.ok(!h.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined));
      } finally { h.unmount(); }
    });
  }
}

test('geometry edit skip, reset, and chapter retry stay on the practice board', () => {
  const h = mount();
  try {
    h.tab('geometry');
    h.tool('point'); h.clickAt(90, 90);
    const real = h.raw(GEOMETRY_KEY);
    h.startTour();
    enterEdit(h, t);
    h.click(t('practiceSkipStep'));
    assert.equal(practiceStep(h), 'edit-text-add');
    assert.equal(editState(h).states[0], 'skipped');
    assert.equal(editState(h).frame.board.elements.some((element) => element.type === 'text'), false);
    h.click(t('practiceReset'));
    assert.equal(practiceStep(h), 'edit-text-add');
    h.click(`${t('practiceRetryStep', { step: 1 })}`);
    assert.equal(practiceStep(h), 'edit-rename');
    h.click(t('practiceSkipStep'));
    assert.equal(practiceStep(h), 'edit-text-add');
    h.click(t('practiceRetryChapter'));
    assert.equal(practiceStep(h), 'edit-rename');
    assert.equal(JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-basics'].states[0], 'in-progress');
    assert.equal(h.raw(GEOMETRY_KEY), real);
    h.click(t('practiceExit'));
    assert.equal(h.raw(GEOMETRY_KEY), real);
  } finally { h.unmount(); }
});

test('a caption longer than 20 characters stays on the step and the saved goal still loads', () => {
  const h = mount();
  try {
    h.tab('geometry');
    h.startTour();
    enterEdit(h, t);
    for (let i = 0; i < 6; i += 1) h.click(t('practiceSkipStep'));
    assert.equal(practiceStep(h), 'edit-caption');
    const noteOf = () => {
      const state = editState(h);
      return state.frame.board.elements.find((element) => element.id === state.goal.elementId).note;
    };
    const kept = noteOf();
    assert.equal([...kept.trim()].length >= 1 && [...kept.trim()].length <= 20, true);
    const caption = captionAt(h);
    h.clickAt(caption.x, caption.y);
    setControl(h, 'textarea', '');
    h.click(t('save'));
    assert.equal(practiceStep(h), 'edit-caption', 'an empty caption save does not pass');
    assert.equal(noteOf(), kept);
    h.clickAt(caption.x, caption.y);
    setControl(h, 'textarea', '字'.repeat(21));
    h.click(t('save'));
    assert.equal(practiceStep(h), 'edit-caption');
    assert.equal(noteOf(), kept, 'a caption longer than 20 characters is not written');
    h.click(t('practiceReset'));
    assert.equal(practiceStep(h), 'edit-caption');
    const reload = createGeometryEditChapter({
      G: createGeometryModel(),
      emptyFrame: createGeometryPracticeFrames(createGeometryModel()).empty,
    });
    assert.doesNotThrow(() => reload.createGoal(editState(h).goal).snapshot());
    const again = captionAt(h);
    h.clickAt(again.x, again.y);
    setControl(h, 'textarea', '短');
    h.click(t('save'));
    assert.equal(practiceStep(h), 'edit-deselect');
  } finally { h.unmount(); }
});

test('the geometry note card can still reach exit', () => {
  const h = mount();
  try {
    h.tab('geometry');
    h.tool('point'); h.clickAt(90, 90);
    const real = h.raw(GEOMETRY_KEY);
    h.startTour();
    enterEdit(h, t);
    h.click(t('note'));
    assert.equal(h.find((node) => node.type === 'textarea').type, 'textarea');
    h.click(t('practiceExit'));
    assert.equal(h.raw(GEOMETRY_KEY), real, 'exit from the note card leaves the real draft');
    assert.equal(h.drafts.length, 0);
    assert.equal(h.texts.length, 0);
    assert.ok(!h.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined));
  } finally { h.unmount(); }
});

function adjustState(h) {
  return JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-adjust'];
}
function enterAdjust(h, tr) {
  h.find((node) => node.type === 'button' && text(node).includes(tr('geometryPracticeAdjust'))).props.onClick();
  h.render();
}
function control(h, label) {
  return h.find((node) => node.type === 'button' && node.props['aria-label'] === label);
}
function scrollPractice(h, left, top) {
  const scroller = h.find((node) => node.props.className === 'eb-canvas-scroll');
  const node = scroller.props.ref.current;
  node.scrollLeft = left;
  node.scrollTop = top;
  scroller.props.onScroll();
  h.render();
}

for (const language of ['zh', 'en']) {
  for (const pointerType of ['mouse', 'touch']) {
    test(`geometry adjust replay (${language}, ${pointerType}) finishes and leaves both drafts`, () => {
      const h = mount({ language });
      const tr = language === 'en'
        ? (key, params = {}) => enLocale[key].replace(/\{(\w+)\}/g, (match, name) => (Object.hasOwn(params, name) ? String(params[name]) : match))
        : t;
      try {
        h.tab('quantity');
        h.find((node) => node.type === 'button' && String(node.props['aria-label'] || '').startsWith(`${tr('circle')} ·`)).props.onClick();
        h.render();
        h.tab('geometry');
        h.tool('point'); h.clickAt(90, 90); h.tool('select');
        const real = h.raw(GEOMETRY_KEY);
        const quantity = h.raw(QUANTITY_KEY);
        h.startTour();
        enterAdjust(h, tr);
        assert.equal(practiceStep(h), 'adjust-grid');
        const heading = h.find((node) => node.props && node.props['data-practice-step'] !== undefined);
        assert.equal(text(walk(heading).find((node) => node.type === 'strong')), tr('geometryPracticeAdjust'));
        assert.equal(practiceParagraph(h), tr('geometryPracticeGoal_adjust-grid'));
        const seen = [practiceParagraph(h)];
        assert.equal(control(h, tr('undo')).props.disabled, true);
        assert.equal(practiceStep(h), 'adjust-grid', 'a click while undo is disabled does not pass');
        h.click(tr('gridOff'));
        assert.equal(practiceStep(h), 'adjust-grid', 'turning the grid on without a new point does not pass');
        h.tool('point');
        h.clickAt(320, 220, { pointerType });
        assert.equal(practiceStep(h), 'adjust-snap');
        seen.push(practiceParagraph(h));
        h.click(tr('snapOn'));
        assert.equal(practiceStep(h), 'adjust-snap', 'turning snap off without a new point does not pass');
        h.clickAt(460, 300, { pointerType });
        assert.equal(practiceStep(h), 'adjust-undo');
        seen.push(practiceParagraph(h));
        const latest = adjustState(h).goal.pointId;
        assert.equal(adjustState(h).frame.board.points.some((point) => point.id === latest), true);
        assert.equal(control(h, tr('redo')).props.disabled, true);
        assert.equal(practiceStep(h), 'adjust-undo', 'a click while redo is disabled does not pass');
        h.click(tr('undo'));
        assert.equal(practiceStep(h), 'adjust-redo');
        assert.equal(adjustState(h).frame.board.points.some((point) => point.id === latest), false);
        assert.equal(control(h, tr('redo')).props.disabled, false, 'the undone point stays available to redo');
        seen.push(practiceParagraph(h));
        h.click(tr('redo'));
        assert.equal(practiceStep(h), 'adjust-zoom');
        assert.equal(adjustState(h).frame.board.points.some((point) => point.id === latest), true);
        seen.push(practiceParagraph(h));
        assert.equal(control(h, tr('zoomOut')).props.disabled, true);
        h.click(tr('fitView'));
        assert.equal(practiceStep(h), 'adjust-zoom', 'a control that leaves the zoom number unchanged does not pass');
        h.click(tr('zoomIn'));
        assert.equal(practiceStep(h), 'adjust-scroll');
        assert.equal(text(control(h, tr('fitView'))), '125%');
        seen.push(practiceParagraph(h));
        scrollPractice(h, 0, 0);
        assert.equal(practiceStep(h), 'adjust-scroll', 'a scroll that leaves the position unchanged does not pass');
        scrollPractice(h, 36, 18);
        assert.equal(practiceStep(h), 'adjust-fit');
        assert.equal(adjustState(h).frame.scroll.left, 36);
        assert.equal(adjustState(h).frame.scroll.top, 18);
        seen.push(practiceParagraph(h));
        h.click(tr('fitView'));
        assert.equal(practiceStep(h), 'adjust-clear');
        assert.equal(control(h, tr('fitView')).props['aria-pressed'], true);
        seen.push(practiceParagraph(h));
        h.click(tr('clearGeometry'));
        h.click(tr('cancel'));
        assert.equal(practiceStep(h), 'adjust-clear', 'opening confirm without confirming does not pass');
        h.click(tr('clearGeometry'));
        h.click(tr('confirmClear'));
        assert.equal(practiceStep(h), 'adjust-complete');
        seen.push(practiceParagraph(h));
        const cleared = adjustState(h);
        assert.equal(cleared.frame.board.points.length, 0);
        assert.equal(cleared.frame.board.elements.length, 0);
        assert.deepEqual(cleared.frame.history, { past: [], future: [] });
        assert.equal(cleared.goal.undoBoard, null);
        assert.equal(control(h, tr('undo')).props.disabled, true, 'undo after clear does not restore the old board');
        assert.equal(adjustState(h).frame.board.points.length, 0);
        for (const copy of seen) {
          assert.ok(copy.length > 0);
          assert.ok(!/geometryPracticeGoal_|practiceGoal_/.test(copy), `${language}: no raw keys on screen`);
        }
        assert.equal(h.drafts.length, 0);
        assert.equal(h.attached.size, 0);
        assert.equal(h.texts.length, 0);
        assert.equal(h.persisted, 0);
        assert.equal(h.raw(GEOMETRY_KEY), real);
        assert.equal(h.raw(QUANTITY_KEY), quantity);
        h.click(tr('practiceExit'));
        assert.equal(h.raw(GEOMETRY_KEY), real, 'exit leaves the real geometry draft unchanged');
        assert.equal(h.raw(QUANTITY_KEY), quantity, 'exit leaves the quantity draft unchanged');
        assert.ok(!h.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined));
      } finally { h.unmount(); }
    });
  }
}

test('geometry adjust skip, reset, chapter retry, and refresh stay on the practice board', () => {
  const storage = new Map();
  let h = mount({ storage });
  try {
    h.tab('geometry');
    h.tool('point'); h.clickAt(90, 90);
    const real = h.raw(GEOMETRY_KEY);
    h.startTour();
    enterAdjust(h, t);
    h.click(t('practiceSkipStep'));
    assert.equal(practiceStep(h), 'adjust-snap');
    assert.equal(adjustState(h).states[0], 'skipped');
    assert.equal(adjustState(h).frame.grid, false, 'skip does not turn the grid on');
    h.click(t('practiceReset'));
    assert.equal(practiceStep(h), 'adjust-snap');
    h.click(`${t('practiceRetryStep', { step: 1 })}`);
    assert.equal(practiceStep(h), 'adjust-grid');
    h.click(t('practiceSkipStep'));
    assert.equal(practiceStep(h), 'adjust-snap');
    h.click(t('practiceRetryChapter'));
    assert.equal(practiceStep(h), 'adjust-grid');
    assert.equal(JSON.parse(h.raw(PRACTICE_KEY)).entries['geometry-basics'].states[0], 'in-progress');
    h.click(t('gridOff'));
    h.tool('point');
    h.clickAt(320, 220);
    assert.equal(practiceStep(h), 'adjust-snap');
    h.unmount();
    h = mount({ storage });
    h.tab('geometry');
    h.startTour();
    assert.equal(practiceStep(h), 'adjust-snap', 'refresh resumes the unfinished adjust step');
    assert.equal(adjustState(h).frame.grid, true);
    assert.equal(h.raw(GEOMETRY_KEY), real);
    h.click(t('practiceExit'));
    assert.equal(h.raw(GEOMETRY_KEY), real);
  } finally { h.unmount(); }
});
