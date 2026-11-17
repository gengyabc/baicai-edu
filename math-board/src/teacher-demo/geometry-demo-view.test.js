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
import { createTeacherDemoChapter } from './teacher-demo-practice.js';
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
const QUANTITY_KEY = 'baicai-edu-math-board:v4:tabbed';
const GEOMETRY_KEY = 'baicai-edu-math-board:geometry:v1:tabbed';
const PRACTICE_KEY = 'baicai-edu-math-board:practice:v2:geometry';
const DEMO_KEY = 'baicai-edu-math-board:practice:v2:teacher-demo';
const SEEN_KEY = 'baicai-edu-math-board:geometry-demo-seen:tabbed';

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
    createPracticeProgress, createPracticeRail, createTeacherDemoChapter,
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
  let geometryComponent;
  const geometryPage = () => (geometryComponent = createGeometryPage(React, G, ctx, translate, guarded));
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
    clickAt(x, y, extra = {}) {
      const svg = find((node) => String(node.props.className || '').includes('eb-artboard'));
      const node = svg.props.ref.current;
      node.createSVGPoint = () => ({ x, y, matrixTransform: () => ({ x, y }) });
      node.getScreenCTM = () => ({ inverse: () => ({}) });
      svg.props.onPointerDown({
        button: 0, clientX: x, clientY: y, pointerId: 1, shiftKey: false, ...extra,
        target: { closest: () => null },
        preventDefault() {}, currentTarget: { setPointerCapture() {} },
      });
      refresh();
    },
    tool(label) {
      const node = find((candidate) => candidate.type === 'button' && candidate.props['aria-label'] === translate(label));
      node.props.onClick({ pointerType: 'mouse', pointerId: 1, button: 0 });
      refresh();
    },
    raw(key) { return storage.get(key); },
    openMore() {
      button(translate('moreActions')).props.onClick();
      refresh();
    },
    startTour() {
      this.openMore();
      find((node) => node.type === 'button' && text(node) === translate('tutorialReplay')).props.onClick();
      refresh();
    },
    key(name) {
      browser.key(name);
      refresh();
    },
    unmount() { unmountPages(); browser.restore(); },
  };
  try { refresh(); } catch (error) { api.unmount(); throw error; }
  return api;
}

function step(h) {
  return h.find((node) => node.props && node.props['data-practice-step'] !== undefined).props['data-practice-step'];
}
function paragraph(h) {
  const coach = h.find((node) => node.props && node.props['data-practice-step'] !== undefined);
  return text(walk(coach).find((node) => node.type === 'p'));
}
function scrollDemo(h, left, top) {
  const scroller = h.find((node) => node.props.className === 'eb-demo-canvas-scroll');
  scroller.props.ref.current.scrollLeft = left;
  scroller.props.ref.current.scrollTop = top;
  scroller.props.onScroll();
  h.render();
}

test('no figure and an empty board do not start the guide', () => {
  const empty = mount({ useProjection: () => ({ revision: 1, figure: { title: '空', description: '', board: G.empty() } }) });
  try {
    empty.tab('demo');
    assert.equal(empty.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
    assert.equal(empty.raw(DEMO_KEY), undefined);
    assert.equal(empty.storage.has(DEMO_KEY), false);
  } finally { empty.unmount(); }
  const none = mount();
  try {
    none.tab('demo');
    assert.equal(none.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
    assert.equal(none.storage.has(DEMO_KEY), false);
    assert.notEqual(none.raw(SEEN_KEY), 'completed');
  } finally { none.unmount(); }
});

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
  test(`teacher demo replay (${language}, ${pointerType}) copies into the guide and leaves the real drafts`, () => {
    const figure = segmentFigure(language === 'en' ? 'Segment' : '线段');
    const frozen = JSON.stringify(figure);
    const storage = new Map();
    storage.set(SEEN_KEY, '7');
    storage.set(PRACTICE_KEY, '{"version":2,"current":"geometry-edit","entries":{"geometry-edit":"keep"}}');
    const practiceSeed = storage.get(PRACTICE_KEY);
    const h = mount({
      language, storage,
      useProjection: () => ({ revision: 1, figure }),
    });
    const tr = (key) => (language === 'en' ? enLocale : locale)[key];
    try {
      h.press(tr('title'), pointerType);
      h.inputActions.addAttachments(['kept']);
      h.tab('quantity');
      h.find((node) => node.type === 'button' && String(node.props['aria-label'] || '').startsWith(`${tr('circle')} ·`)).props.onClick();
      h.render();
      h.tab('geometry');
      h.tool('point');
      h.clickAt(140, 160, { pointerType });
      const quantity = h.raw(QUANTITY_KEY);
      const geometry = h.raw(GEOMETRY_KEY);
      assert.equal(typeof quantity, 'string');
      assert.equal(typeof geometry, 'string');
      h.tab('demo');
      assert.equal(step(h), 'demo-read', 'rendering the page does not pass continue');
      assert.equal(/看懂|understood|已经复制|already copied/i.test(paragraph(h)), false);
      h.press(tr('teacherDemoContinue'), pointerType);
      assert.equal(step(h), 'demo-view');
      h.press(tr('fitView'), pointerType);
      assert.equal(step(h), 'demo-view', 'the current zoom level does not pass');
      h.press(tr('zoomIn'), pointerType);
      assert.equal(step(h), 'demo-view', 'zoom without a scroll does not pass');
      scrollDemo(h, 0, 0);
      assert.equal(step(h), 'demo-view', 'an unchanged scroll does not pass');
      scrollDemo(h, 28, 16);
      assert.equal(step(h), 'demo-copy');
      assert.equal(JSON.stringify(figure), frozen, 'zooming does not edit the teacher figure');
      h.press(tr('demoCopy'), pointerType);
      assert.equal(step(h), 'demo-return');
      assert.equal(h.raw(GEOMETRY_KEY), geometry, 'copy does not call onCopy or write the real geometry draft');
      assert.equal(h.raw(QUANTITY_KEY), quantity);
      assert.equal(h.raw(PRACTICE_KEY), practiceSeed);
      assert.equal(h.raw(SEEN_KEY), '7');
      assert.equal(h.attached.get('kept'), 'kept');
      assert.equal(h.removed.length, 0);
      assert.equal(h.drafts.length, 0);
      assert.equal(h.texts.length, 0);
      assert.equal(h.persisted, 0);
      assert.equal(h.sends, 0);
      assert.equal(h.fileDialogs, 0);
      assert.equal(h.visibleNodes().some((node) => text(node) === tr('demoCopyDone')), false);
      const copied = JSON.parse(h.raw(DEMO_KEY)).entries['teacher-demo-basics'];
      assert.equal(copied.goal.copied, true);
      assert.ok(copied.frame.board.elements.length > 0);
      h.tab('geometry');
      assert.equal(step(h), 'demo-return');
      assert.ok(h.visibleNodes().some((node) => node.type === 'line' || node.type === 'polyline' || (node.type === 'text' && text(node) === 'A')));
      const beforeEdit = copied.frame.board.points.length;
      h.tool('point');
      h.clickAt(480, 360, { pointerType });
      const edited = JSON.parse(h.raw(DEMO_KEY)).entries['teacher-demo-basics'].frame.board;
      assert.ok(edited.points.length > beforeEdit, 'the guide frame can be edited');
      assert.equal(h.raw(GEOMETRY_KEY), geometry, 'an edit publishes to the guide, not the real draft');
      assert.equal(h.raw(PRACTICE_KEY), practiceSeed);
      assert.equal(step(h), 'demo-return', 'editing the copy is not the return control');
      h.press(tr('teacherDemoViewCopy'), pointerType);
      assert.equal(step(h), 'demo-complete');
      h.press(tr('practiceExit'), pointerType);
      assert.equal(h.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
      assert.equal(h.raw(GEOMETRY_KEY), geometry);
      assert.equal(h.raw(QUANTITY_KEY), quantity);
      assert.equal(h.fileDialogs, 0);
      assert.equal(JSON.stringify(figure), frozen);
    } finally { h.unmount(); }
  });
}

test('a full placeFigure result does not record the copy', () => {
  const figure = segmentFigure();
  const h = mount({
    placeFigure: () => ({ ok: false, reason: 'full' }),
    useProjection: () => ({ revision: 1, figure }),
  });
  try {
    h.tab('geometry');
    h.tool('point');
    h.clickAt(140, 160);
    const geometry = h.raw(GEOMETRY_KEY);
    h.tab('demo');
    h.press(locale.teacherDemoContinue, 'mouse');
    h.press(locale.zoomIn, 'mouse');
    scrollDemo(h, 20, 10);
    assert.equal(step(h), 'demo-copy');
    h.press(locale.demoCopy, 'touch');
    assert.equal(step(h), 'demo-copy');
    assert.equal(JSON.parse(h.raw(DEMO_KEY)).entries['teacher-demo-basics'].goal.copied, false);
    assert.equal(h.raw(GEOMETRY_KEY), geometry);
    assert.equal(h.fileDialogs, 0);
  } finally { h.unmount(); }
});

test('hiding or replacing the figure blocks the copy and retry uses the current figure', () => {
  let figure = segmentFigure('第一幅');
  const h = mount({ useProjection: () => ({ revision: 1, figure }) });
  try {
    h.tab('demo');
    h.press(locale.teacherDemoContinue, 'mouse');
    h.press(locale.zoomIn, 'touch');
    scrollDemo(h, 18, 8);
    assert.equal(step(h), 'demo-copy');
    figure = null;
    h.render();
    assert.equal(step(h), 'demo-copy');
    assert.equal(paragraph(h), locale.teacherDemoFigureUnavailable);
    assert.equal(JSON.parse(h.raw(DEMO_KEY)).entries['teacher-demo-basics'].goal.copied, false);
    assert.equal(h.visibleNodes().some((node) => node.type === 'button' && text(node) === locale.demoCopy), false);
    assert.ok(h.button(locale.practiceExit));
    figure = segmentFigure('第二幅');
    h.render();
    assert.equal(paragraph(h), locale.teacherDemoFigureUnavailable);
    h.press(locale.demoCopy, 'touch');
    assert.equal(step(h), 'demo-copy', 'a replaced figure does not complete the old copy');
    h.press(locale.practiceRetryChapter, 'mouse');
    assert.equal(step(h), 'demo-read');
    assert.equal(paragraph(h), locale['teacherDemoPracticeGoal_demo-read']);
    h.press(locale.practiceExit, 'touch');
    assert.ok(h.button(locale.teacherDemoResume));
  } finally { h.unmount(); }
});

test('an open geometry practice record stays put and blocks return until that page can show the guide', () => {
  const figure = segmentFigure();
  const h = mount({ useProjection: () => ({ revision: 1, figure }) });
  try {
    h.press(locale.title, 'mouse');
    h.tab('geometry');
    h.startTour();
    const openRecord = h.raw(PRACTICE_KEY);
    assert.equal(typeof openRecord, 'string');
    h.tab('demo');
    assert.equal(h.raw(PRACTICE_KEY), openRecord, 'leaving for the guide does not rewrite geometry practice');
    h.press(locale.teacherDemoContinue, 'mouse');
    h.press(locale.zoomIn, 'touch');
    scrollDemo(h, 22, 14);
    h.press(locale.demoCopy, 'mouse');
    assert.equal(step(h), 'demo-return');
    assert.equal(h.raw(PRACTICE_KEY), openRecord);
    h.tab('geometry');
    assert.equal(h.visibleNodes().some((node) => node.type === 'button' && text(node) === locale.teacherDemoViewCopy), false);
    assert.notEqual(step(h), 'demo-complete');
    h.render();
    assert.equal(h.raw(PRACTICE_KEY), openRecord);
    h.press(locale.practiceExit, 'touch');
    h.press(locale.teacherDemoViewCopy, 'mouse');
    assert.equal(step(h), 'demo-complete');
    assert.equal(JSON.parse(h.raw(PRACTICE_KEY)).current, JSON.parse(openRecord).current);
  } finally { h.unmount(); }
});

test('delete and escape leave the real geometry draft alone while the guide frame is showing', () => {
  const figure = segmentFigure();
  const storage = new Map();
  storage.set(SEEN_KEY, '7');
  storage.set(PRACTICE_KEY, '{"version":2,"current":"geometry-edit","entries":{"geometry-edit":"keep"}}');
  const practiceSeed = storage.get(PRACTICE_KEY);
  const h = mount({
    storage,
    useProjection: () => ({ revision: 1, figure }),
  });
  try {
    h.press(locale.title, 'mouse');
    h.tab('geometry');
    h.tool('point');
    h.clickAt(140, 160);
    const committedId = JSON.parse(h.raw(GEOMETRY_KEY)).points[0].id;
    h.tool('segment');
    h.clickAt(400, 280);
    const drafted = h.raw(GEOMETRY_KEY);
    assert.equal(JSON.parse(drafted).points.length, 2, 'the unfinished segment has a construction point');
    // Select the committed point without leaving the segment tool, so Delete and Escape
    // would each change this draft if the hidden board stayed keyboard-live.
    h.find((node) => node.props && node.props['data-point'] === committedId).props.onKeyDown({
      key: 'Enter', preventDefault() {},
    });
    h.render();
    h.tab('demo');
    h.press(locale.teacherDemoContinue, 'mouse');
    h.press(locale.zoomIn, 'mouse');
    scrollDemo(h, 28, 16);
    h.press(locale.demoCopy, 'mouse');
    h.tab('geometry');
    assert.equal(step(h), 'demo-return');
    const frozen = h.raw(GEOMETRY_KEY);
    assert.equal(frozen, drafted);
    assert.equal(h.raw(PRACTICE_KEY), practiceSeed);
    h.key('Delete');
    assert.equal(h.raw(GEOMETRY_KEY), frozen, 'Delete does not change the real geometry draft');
    h.key('Escape');
    assert.equal(h.raw(GEOMETRY_KEY), frozen, 'Escape does not publish the real geometry draft');
    assert.equal(h.raw(PRACTICE_KEY), practiceSeed);
    const guideBoard = () => JSON.parse(h.raw(DEMO_KEY)).entries['teacher-demo-basics'].frame.board;
    const victim = guideBoard().points[0].id;
    h.find((node) => node.props && node.props['data-point'] === victim).props.onKeyDown({
      key: 'Enter', preventDefault() {},
    });
    h.render();
    h.key('Delete');
    assert.equal(guideBoard().points.some((point) => point.id === victim), false, 'the guide copy still accepts Delete');
    assert.equal(h.raw(GEOMETRY_KEY), frozen);
    const beforeEscape = guideBoard().points.length;
    h.tool('segment');
    h.clickAt(480, 360);
    assert.ok(guideBoard().points.length > beforeEscape, 'the guide copy can start a shape');
    h.key('Escape');
    assert.equal(guideBoard().points.length, beforeEscape, 'the guide copy still accepts Escape');
    assert.equal(h.raw(GEOMETRY_KEY), frozen);
    assert.equal(h.raw(PRACTICE_KEY), practiceSeed);
  } finally { h.unmount(); }
});

for (const language of ['zh', 'en']) {
  test(`the bottom-right tutorial door reopens and replays the guide (${language})`, () => {
    const figure = segmentFigure();
    const frozen = JSON.stringify(figure);
    const storage = new Map();
    storage.set(SEEN_KEY, '7');
    storage.set(PRACTICE_KEY, '{"version":2,"current":"geometry-edit","entries":{"geometry-edit":"keep"}}');
    const practiceSeed = storage.get(PRACTICE_KEY);
    const h = mount({ language, storage, useProjection: () => ({ revision: 1, figure }) });
    const tr = (key) => (language === 'en' ? enLocale : locale)[key];
    const door = () => h.visibleNodes().find((node) => node.props
      && String(node.props.className || '') === 'eb-demo-dock eb-demo-dock-right');
    try {
      h.press(tr('title'), 'mouse');
      h.tab('demo');
      assert.equal(step(h), 'demo-read', 'first contact still opens the rail by itself');
      assert.equal(door(), undefined, 'the door is hidden while the rail is up');
      h.press(tr('practiceExit'), 'mouse');
      assert.equal(h.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
      assert.ok(door(), 'the door stays after the rail is dismissed');
      assert.equal(door().props['aria-label'], tr('teacherDemoTutorialArea'));
      h.press(tr('teacherDemoTutorial'), 'mouse');
      assert.equal(step(h), 'demo-read', 'the door resumes where the guide stopped');
      assert.equal(door(), undefined);
      h.press(tr('teacherDemoContinue'), 'touch');
      h.press(tr('zoomIn'), 'mouse');
      scrollDemo(h, 24, 12);
      h.press(tr('demoCopy'), 'touch');
      h.tab('geometry');
      const geometryDraft = h.raw(GEOMETRY_KEY);
      h.press(tr('teacherDemoViewCopy'), 'mouse');
      assert.equal(step(h), 'demo-complete');
      h.press(tr('practiceExit'), 'touch');
      assert.equal(JSON.parse(h.raw(DEMO_KEY)).entries['teacher-demo-basics'].states.every((state) => state === 'completed'), true);
      // A finished guide replays from its first step; the door is not a dead end there.
      h.tab('demo');
      h.press(tr('teacherDemoTutorial'), 'mouse');
      assert.equal(step(h), 'demo-read');
      assert.equal(paragraph(h), tr('teacherDemoPracticeGoal_demo-read'));
      assert.equal(h.raw(PRACTICE_KEY), practiceSeed, 'the door never writes the geometry practice key');
      assert.equal(JSON.stringify(figure), frozen, 'the teacher figure is never edited');
      assert.equal(h.raw(GEOMETRY_KEY), geometryDraft, 'the door leaves the real geometry draft alone');
      assert.equal(h.drafts.length, 0);
      assert.equal(h.texts.length, 0);
      assert.equal(h.sends, 0);
      assert.equal(h.fileDialogs, 0);
    } finally { h.unmount(); }
  });
}

test('without a figure the tutorial door says only that there is nothing to practise', () => {
  const none = mount();
  try {
    none.tab('demo');
    const door = none.find((node) => String(node.props.className || '') === 'eb-demo-dock eb-demo-dock-right');
    assert.equal(door.props['aria-label'], locale.teacherDemoTutorialArea);
    none.press(locale.teacherDemoTutorial, 'mouse');
    const toast = none.visibleNodes().find((node) => node.props && node.props.className === 'eb-status-toast');
    assert.equal(text(toast), locale.teacherDemoTutorialNoFigure);
    assert.equal(none.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
    assert.equal(none.storage.has(DEMO_KEY), false, 'no figure starts no guide record');
    assert.equal(none.sends, 0);
  } finally { none.unmount(); }
});
