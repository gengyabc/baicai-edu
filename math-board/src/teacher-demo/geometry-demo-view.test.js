import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardView, createShapeArt } from '../quantity/view.js';
import { createTabbedBoardView } from '../shell/board-shell.js';
import { createBoardFilePicker, createBoardIcons } from '../shared/file-picker.js';
import { createGeometryPage } from '../geometry/geometry-view.js';
import { createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames } from '../geometry/geometry-basics.js';
import { createGeometryConstructChapter } from '../geometry/geometry-construct.js';
import { createGeometryEditChapter } from '../geometry/geometry-edit.js';
import { createGeometryAdjustChapter } from '../geometry/geometry-adjust.js';
import { createGeometryFilesChapter } from '../geometry/geometry-files.js';
import { createPracticeProgress, createPracticeRail } from '../shell/practice-progress.js';
import { createGeometryDemoPage, readDemoView } from './geometry-demo-view.js';
import { placeFigure } from '../geometry/place-figure.js';
import { captionBox, captionPosition, visibleCaption } from '../geometry/caption.js';
import {
  geometryHiddenPoints, geometryCaptionLabel, geometryPointLabel, geometryPointDot, geometryShapeNode, geometryStroke,
} from '../geometry/draw.js';
import { geometryViewport, geometryFrameInputs, geometryTextOverflow, geometryFrame } from '../geometry/frame.js';
import { createBoardControls } from '../shared/board-kit.js';
import { createGeometryModel } from '../geometry/model.js';
import { createBoardModel } from '../quantity/model.js';
import { createBoardTrace } from '../quantity/trace.js';
import { createHooks, installBrowser, text, walk } from '../testing/test-harness.js';
import { applyHostConfig } from '../host/config-bridge.js';
import {
  advanceTutorial, createTutorialController, createTutorialOverlay, geometryTutorialSteps, isTutorialSeen,
  markTutorialSeen, measureTourTarget, quantityTutorialSteps, tourHoldsNotePanel,
  tourInsertMode, tutorialStorageKey,
} from '../shell/tutorial.js';

const M = createBoardModel();
const G = createGeometryModel();
const T = createBoardTrace(M);
const locale = JSON.parse(await readFile(new URL('../../locale/zh.json', import.meta.url), 'utf8'));
const enLocale = JSON.parse(await readFile(new URL('../../locale/en.json', import.meta.url), 'utf8'));
const GEOMETRY_KEY = 'baicai-edu-math-board:geometry:v1:tabbed';
const DEMO_SEEN = 'baicai-edu-math-board:geometry-demo-seen:tabbed';

function segmentFigure(title = '线段') {
  let board = G.reduce(G.empty(), { type: 'addPoint', x: 80, y: 90 });
  board = G.reduce(board, { type: 'addPoint', x: 220, y: 90 });
  const [a, b] = board.points;
  board = G.reduce(board, { type: 'addElement', elementType: 'segment', points: [a.id, b.id], role: 'main' });
  return { title, description: '只读', board };
}
function textFigure() {
  const board = G.reduce(G.empty(), { type: 'addText', x: 120, y: 80, text: '已知条件' });
  return { title: '文字', description: '只读说明', board };
}

function mount(options = {}) {
  const dictionary = options.language === 'en' ? enLocale : locale;
  const translate = (key, params = {}) => {
    assert.equal(typeof dictionary[key], 'string', `Missing locale key: ${key}`);
    return dictionary[key].replace(/\{(\w+)\}/g, (match, name) =>
      Object.hasOwn(params, name) ? String(params[name]) : match);
  };
  const storage = options.storage || new Map();
  const browser = installBrowser({ storage });
  let fileDialogs = 0;
  const openPicker = globalThis.window.showOpenFilePicker;
  globalThis.window.showOpenFilePicker = async (...args) => {
    fileDialogs += 1;
    return openPicker(...args);
  };
  const { React, storeFor, hooks, render: renderTree, refresh: refreshTree, unmount: unmountPages } = createHooks();
  const dom = new Map();
  let tree;
  const drafts = []; const attached = new Map(); const removed = []; const texts = [];
  let persisted = 0; let sends = 0;
  const inputActions = {
    captureInsertion: () => ({ offset: 0 }),
    addAttachments(ids) { ids.forEach((id) => attached.set(id, id)); return true; },
    removeAttachment(id) { removed.push(id); attached.delete(id); },
    insertText(value) { texts.push(value); return true; },
    persistDraft() { persisted += 1; },
    send() { sends += 1; },
  };
  const ctx = { locale: { subscribe: () => () => {}, getSnapshot: () => 'zh' }, get: () => ({
    createDrafts(sessionId, files) { drafts.push(files); return files.map((file) => ({ id: `draft-${file.name}` })); },
    releaseDraftAttachment() {},
  }) };
  storage.set(tutorialStorageKey('quantity'), '1');
  storage.set(tutorialStorageKey('geometry'), '1');
  // The v1 seen flag no longer blocks first-run. Keep the real boards available
  // unless the test already stored a practice record.
  if (!storage.has('baicai-edu-math-board:practice:v2:quantity')) {
    storage.set('baicai-edu-math-board:practice:v2:quantity', JSON.stringify({ version: 2, current: 'quantity-basics', entries: {} }));
  }
  if (!storage.has('baicai-edu-math-board:practice:v2:geometry')) {
    storage.set('baicai-edu-math-board:practice:v2:geometry', JSON.stringify({ version: 2, current: 'geometry-basics', entries: {} }));
  }
  const shared = {
    createBoardFilePicker, createBoardIcons, createTutorialController, createTutorialOverlay,
    isTutorialSeen, markTutorialSeen, advanceTutorial, measureTourTarget,
    tourHoldsNotePanel, tourInsertMode, quantityTutorialSteps, geometryTutorialSteps,
    placeFigure: options.placeFigure || placeFigure, captionPosition, captionBox, visibleCaption,
    createBoardControls, createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames,
    geometryPracticeChapters: [createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter],
    createPracticeProgress, createPracticeRail,
    geometryHiddenPoints, geometryCaptionLabel, geometryPointLabel, geometryPointDot, geometryShapeNode, geometryStroke,
    geometryViewport, geometryTextOverflow, geometryFrame, geometryFrameInputs,
  };
  const guarded = new Proxy(shared, {
    get(target, key) {
      if (key === 'geometryTextBox') throw new Error('geometryTextBox is not provided');
      const value = target[key];
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  const quantityPage = () => createBoardView(React, M, ctx, translate, '', createShapeArt(React), applyHostConfig, T, guarded);
  const geometryPage = () => createGeometryPage(React, G, ctx, translate, guarded);
  const demoPage = () => createGeometryDemoPage(React, G, translate, guarded);
  const Board = createTabbedBoardView(React, translate, '', {
    quantity: quantityPage, geometry: geometryPage, demo: demoPage,
    mark: (size) => quantityPage().Mark(size),
  }, (view) => readDemoView(G, view));
  const props = {
    sessionId: 'tabbed', useProjection: options.useProjection || (() => null),
    useInput: () => 'plain', inputActions,
  };
  const h = React.createElement;
  function expand(node) {
    if (!node || typeof node !== 'object') return node;
    if (typeof node.type === 'function') {
      const previous = hooks.current;
      hooks.current = storeFor(node.type);
      try { return expand(node.type(node.props)); } finally { hooks.current = previous; }
    }
    return { ...node, children: (node.children || []).flat(Infinity).map(expand) };
  }
  const build = () => expand(h(Board, props));
  function bindRefs(rendered) {
    for (const node of walk(rendered)) if (node.props?.ref && typeof node.props.ref === 'object') {
      const ref = node.props.ref;
      if (!dom.has(ref)) dom.set(ref, {
        open: false, ownerDocument: { activeElement: null }, href: '',
        showModal() { this.open = true; }, close() { this.open = false; },
        contains: () => false, focus() {}, select() {}, click() {},
        scrollLeft: 0, scrollTop: 0,
      });
      ref.current = dom.get(ref);
    }
  }
  function refresh() {
    const rendered = refreshTree(build);
    bindRefs(rendered);
    tree = rendered;
    return tree;
  }
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
    get sends() { return sends; },
    get fileDialogs() { return fileDialogs; },
    get tree() { return tree; },
    render: refresh, find, button, visibleNodes, walk,
    tab(name) {
      find((node) => node.props['data-tab'] === name).props.onClick();
      refresh();
    },
    press(label, pointerType) {
      const node = button(label);
      assert.ok(!node.props.disabled, `${label} should be enabled`);
      node.props.onClick({ pointerType, pointerId: 1, button: 0 });
      refresh();
    },
    raw(key) { return storage.get(key); },
    unmount() { unmountPages(); browser.restore(); },
  };
  try { refresh(); } catch (error) { api.unmount(); throw error; }
  return api;
}

test('a text figure frames without shared.geometryTextBox', () => {
  const figure = textFigure();
  const h = mount({ useProjection: () => ({ revision: 1, figure }) });
  try {
    h.tab('demo');
    const svg = h.find((node) => node.type === 'svg' && String(node.props.className || '').includes('eb-artboard'));
    assert.equal(/NaN/.test(String(svg.props.viewBox)), false);
    assert.ok(h.visibleNodes().some((node) => node.type === 'text' && text(node) === '已知条件'));
    assert.equal(JSON.stringify(figure), JSON.stringify(textFigure()));
  } finally { h.unmount(); }
});

for (const language of ['zh', 'en']) for (const pointerType of ['mouse', 'touch']) {
  test(`the demo page copies the teacher figure without touching the input box (${language}, ${pointerType})`, () => {
    const figure = segmentFigure(language === 'en' ? 'Segment' : '线段');
    const frozen = JSON.stringify(figure);
    const storage = new Map();
    storage.set(DEMO_SEEN, '7');
    const h = mount({ language, storage, useProjection: () => ({ revision: 1, figure }) });
    const tr = (key) => (language === 'en' ? enLocale : locale)[key];
    try {
      h.press(tr('title'), pointerType);
      h.tab('demo');
      // The page is read-only and carries no step rail or tutorial door of its own.
      assert.equal(h.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
      assert.equal(h.visibleNodes().some((node) => node.type === 'button' && text(node) === tr('teacherDemoTutorial')), false);
      const before = h.raw(GEOMETRY_KEY);
      assert.equal(JSON.parse(before).points.length, 0, 'opening the demo tab draws nothing on the geometry draft');
      h.press(tr('demoCopy'), pointerType);
      const copied = JSON.parse(h.raw(GEOMETRY_KEY));
      assert.notEqual(h.raw(GEOMETRY_KEY), before);
      assert.ok(copied.points.length >= 2, 'the copy lands on the real geometry draft');
      assert.ok(copied.elements.some((element) => element.type === 'segment'));
      assert.equal(JSON.stringify(figure), frozen, 'copying does not edit the teacher figure');
      assert.equal(h.attached.size, 0);
      assert.equal(h.removed.length, 0);
      assert.equal(h.drafts.length, 0);
      assert.equal(h.texts.length, 0);
      assert.equal(h.persisted, 0);
      assert.equal(h.sends, 0);
      assert.equal(h.fileDialogs, 0);
    } finally { h.unmount(); }
  });
}

test('a full canvas leaves the copy unplaced and says so', () => {
  const figure = segmentFigure();
  const h = mount({
    placeFigure: () => ({ ok: false, reason: 'full' }),
    useProjection: () => ({ revision: 1, figure }),
  });
  try {
    h.press(locale.title, 'mouse');
    h.tab('demo');
    h.press(locale.demoCopy, 'mouse');
    const toast = h.visibleNodes().find((node) => node.props && node.props.className === 'eb-status-toast');
    assert.equal(text(toast), locale.demoCopyFull);
    assert.deepEqual(JSON.parse(h.raw(GEOMETRY_KEY)).points, [], 'a refused copy leaves the geometry draft alone');
    assert.equal(h.fileDialogs, 0);
  } finally { h.unmount(); }
});

test('without a figure the page shows only its way back', () => {
  const none = mount();
  try {
    none.press(locale.title, 'mouse');
    none.tab('demo');
    assert.equal(none.visibleNodes().some((node) => node.type === 'h2'), false);
    assert.equal(none.visibleNodes().some((node) => node.type === 'button' && text(node) === locale.demoCopy), false);
    assert.ok(none.button(locale.backToChat));
    assert.equal(none.sends, 0);
  } finally { none.unmount(); }
});
