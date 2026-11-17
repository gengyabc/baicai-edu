import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardView, createShapeArt } from '../src/quantity/view.js';
import { createBoardModel } from '../src/quantity/model.js';
import { createBoardTrace } from '../src/quantity/trace.js';
import { createQuantityPractice } from '../src/quantity/practice.js';
import { createQuantityAdjustChapter } from '../src/quantity/practice-adjust.js';
import { createQuantityOrganizeChapter } from '../src/quantity/practice-organize.js';
import { createQuantityNotesChapter } from '../src/quantity/practice-notes.js';
import { createQuantityFilesChapter } from '../src/quantity/practice-files.js';
import { createTabbedBoardView } from '../src/shell/board-shell.js';
import { createBoardFilePicker, createBoardIcons } from '../src/shared/file-picker.js';
import { createBoardControls } from '../src/shared/board-kit.js';
import { createPracticeProgress, createPracticeNavigation } from '../src/shell/practice-progress.js';
import { applyHostConfig } from '../src/host/config-bridge.js';
import { createHooks, installBrowser, text, walk } from '../src/testing/test-harness.js';
import { createGeometryPage } from '../src/geometry/geometry-view.js';
import { createGeometryModel } from '../src/geometry/model.js';
import { createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames } from '../src/geometry/geometry-basics.js';
import { createGeometryConstructChapter } from '../src/geometry/geometry-construct.js';
import { createGeometryEditChapter } from '../src/geometry/geometry-edit.js';
import { createGeometryAdjustChapter } from '../src/geometry/geometry-adjust.js';
import { createGeometryFilesChapter } from '../src/geometry/geometry-files.js';
import { createGeometryDemoPage, readDemoView } from '../src/teacher-demo/geometry-demo-view.js';
import { createTeacherDemoChapter } from '../src/teacher-demo/teacher-demo-practice.js';
import { placeFigure } from '../src/geometry/place-figure.js';
import { captionBox, captionPosition, visibleCaption } from '../src/geometry/caption.js';
import {
  geometryHiddenPoints, geometryCaptionLabel, geometryPointLabel, geometryPointDot, geometryShapeNode, geometryStroke,
} from '../src/geometry/draw.js';
import { geometryViewport, geometryFrameInputs, geometryTextOverflow, geometryFrame } from '../src/geometry/frame.js';
import {
  advanceTutorial, createTutorialController, createTutorialOverlay, geometryTutorialSteps, isTutorialSeen,
  markTutorialSeen, measureTourTarget, quantityTutorialSteps, tourHoldsNotePanel, tourInsertMode, tutorialStorageKey,
} from '../src/shell/tutorial.js';

const M = createBoardModel();
const G = createGeometryModel();
const T = createBoardTrace(M);
const locale = JSON.parse(await readFile(new URL('../locale/zh.json', import.meta.url), 'utf8'));
const enLocale = JSON.parse(await readFile(new URL('../locale/en.json', import.meta.url), 'utf8'));
const quantityChapters = [createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter, createQuantityFilesChapter];
const geometryChapters = [createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter];
const SESSION = 'release';
const QUANTITY_KEY = `baicai-edu-math-board:v4:${SESSION}`;
const GEOMETRY_KEY = `baicai-edu-math-board:geometry:v1:${SESSION}`;
const QUANTITY_PRACTICE = 'baicai-edu-math-board:practice:v2:quantity';
const GEOMETRY_PRACTICE = 'baicai-edu-math-board:practice:v2:geometry';
const DEMO_PRACTICE = 'baicai-edu-math-board:practice:v2:teacher-demo';

function translate(dictionary, key, params = {}) {
  assert.equal(typeof dictionary[key], 'string', `Missing locale key: ${key}`);
  return dictionary[key].replace(/\{(\w+)\}/g, (match, name) => (Object.hasOwn(params, name) ? String(params[name]) : match));
}
const zh = (key, params) => translate(locale, key, params);

function segmentFigure() {
  let board = G.reduce(G.empty(), { type: 'addPoint', x: 80, y: 90 });
  board = G.reduce(board, { type: 'addPoint', x: 220, y: 90 });
  const [a, b] = board.points;
  board = G.reduce(board, { type: 'addElement', elementType: 'segment', points: [a.id, b.id], role: 'main' });
  return { title: '线段', description: '只读', board };
}

function realDraftKeys(storage) {
  return new Map([...storage].filter(([name]) => !name.startsWith('baicai-edu-math-board:practice:')
    && !name.startsWith('baicai-edu-math-board:tutorial:')));
}

function mountQuantity(options = {}) {
  const dictionary = options.language === 'en' ? enLocale : locale;
  const t = (key, params) => translate(dictionary, key, params);
  const storage = options.storage || new Map();
  const browser = installBrowser({ ...options, storage });
  const hooks = createHooks();
  const { React } = hooks;
  const drafts = [];
  const texts = [];
  let persisted = 0;
  let sends = 0;
  let config = null;
  let clear = null;
  const inputActions = {
    captureInsertion: () => ({ offset: 0 }),
    addAttachments() { return true; },
    removeAttachment() {},
    insertText(value) { texts.push(value); return true; },
    persistDraft() { persisted += 1; },
    send() { sends += 1; },
  };
  const conversation = {
    createDrafts(_sessionId, files) {
      drafts.push(files);
      return files.map((file, index) => ({ id: `draft-${drafts.length}-${index}`, name: file.name }));
    },
    releaseDraftAttachment() {},
  };
  const Board = createBoardView(React, M, { locale: { subscribe() {}, getSnapshot() {} }, get: () => conversation },
    t, '', createShapeArt(React), applyHostConfig, T, {
      createBoardFilePicker, createBoardIcons, createBoardControls, createPracticeProgress, createPracticeNavigation,
      createQuantityPractice, quantityPracticeChapters: options.chapters || quantityChapters,
    });
  const props = {
    split: true, sessionId: options.sessionId || 'quantity-release', tabActive: true,
    useProjection: (name) => (name === 'eduBoardClear' ? clear : config),
    useInput: () => 'plain', inputActions,
  };
  const dom = new Map();
  let mounted = new Set();
  let rendering;
  function expand(node) {
    if (!node || typeof node !== 'object') return node;
    if (typeof node.type === 'function') {
      rendering.add(node.type);
      const previous = hooks.hooks.current;
      hooks.hooks.current = hooks.storeFor(node.type);
      const result = expand(node.type(node.props));
      hooks.hooks.current = previous;
      return result;
    }
    if (node.props.ref) {
      if (!dom.has(node.props.ref)) dom.set(node.props.ref, {
        focus() {}, select() {}, click() {}, value: '',
        createSVGPoint() { return { x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }; },
        getScreenCTM: () => ({ inverse: () => ({}) }),
      });
      node.props.ref.current = dom.get(node.props.ref);
    }
    return { ...node, children: node.children.flat(Infinity).map((child) => expand(child)) };
  }
  const refresh = () => hooks.refresh(() => {
    rendering = new Set();
    const tree = expand(React.createElement(Board, props));
    for (const type of mounted) if (!rendering.has(type)) {
      const store = hooks.storeFor(type);
      for (const slot of store.slots) slot?.cleanup?.();
      store.slots = [];
      store.effects = [];
    }
    mounted = rendering;
    return tree;
  });
  const visible = (node) => !node || typeof node !== 'object' || node.props.hidden ? []
    : [node, ...node.children.flat(Infinity).flatMap(visible)];
  const nodes = () => visible(hooks.tree);
  const all = () => walk(hooks.tree);
  const find = (predicate) => {
    const matches = nodes().filter(predicate);
    assert.equal(matches.length, 1, `Expected one node, found ${matches.length}`);
    return matches[0];
  };
  const app = {
    browser, storage, drafts, texts, t, nodes, all, find, refresh,
    get persisted() { return persisted; },
    get sends() { return sends; },
    click(label) {
      const node = find((n) => n.type === 'button' && (text(n) === label || n.props['aria-label'] === label));
      node.props.onClick();
      refresh();
    },
    press(label, pointerType = 'mouse') {
      const node = find((n) => n.type === 'button' && (text(n) === label || n.props['aria-label'] === label));
      assert.ok(!node.props.disabled, `${label} should be enabled`);
      node.props.onClick({ pointerType, pointerId: 1, button: 0, shiftKey: false });
      refresh();
    },
    add(pointerType = 'mouse') {
      const node = find((n) => n.type === 'button' && n.props['aria-label'] === `${t('circle')} · ${t('value')} 1`);
      node.props.onClick({ pointerType, pointerId: 1, button: 0, shiftKey: false });
      refresh();
    },
    step() { return find((n) => n.props['data-practice-step'] !== undefined).props['data-practice-step']; },
    objects() { return nodes().filter((n) => n.props['data-object']); },
    pointer(id, x, y, phase = 'Down', pointerType = 'mouse') {
      const svg = find((n) => n.props.className === 'eb-artboard');
      svg.props[`onPointer${phase}`]({
        button: 0, clientX: x, clientY: y, pointerId: 1, pointerType, shiftKey: false,
        target: { closest: () => (id ? { getAttribute: () => id } : null) },
        currentTarget: { setPointerCapture() {} }, preventDefault() {},
      });
      refresh();
    },
    setConfig(next) { config = next; refresh(); },
    setClear(next) { clear = next; refresh(); },
    dispose() { hooks.unmount(); browser.restore(); },
  };
  try { refresh(); } catch (error) { app.dispose(); throw error; }
  return app;
}

function mountShell(options = {}) {
  const dictionary = options.language === 'en' ? enLocale : locale;
  const t = (key, params) => translate(dictionary, key, params);
  const storage = options.storage || new Map();
  const browser = installBrowser({ storage });
  let fileDialogs = 0;
  const openPicker = globalThis.window.showOpenFilePicker;
  globalThis.window.showOpenFilePicker = async (...args) => {
    fileDialogs += 1;
    return openPicker(...args);
  };
  const { React, storeFor, hooks, refresh: refreshTree, unmount } = createHooks();
  const dom = new Map();
  const drafts = [];
  const texts = [];
  let persisted = 0;
  let sends = 0;
  const inputActions = {
    captureInsertion: () => ({ offset: 0 }),
    addAttachments() { return true; },
    removeAttachment() {},
    insertText(value) { texts.push(value); return true; },
    persistDraft() { persisted += 1; },
    send() { sends += 1; },
  };
  const ctx = {
    locale: { subscribe: () => () => {}, getSnapshot: () => options.language || 'zh' },
    get: () => ({
      createDrafts(_sessionId, files) {
        drafts.push(files);
        return files.map((file, index) => ({ id: `draft-${drafts.length}-${index}`, name: file.name }));
      },
      releaseDraftAttachment() {},
    }),
  };
  const shared = {
    createBoardFilePicker, createBoardIcons, createTutorialController, createTutorialOverlay,
    isTutorialSeen, markTutorialSeen, advanceTutorial, measureTourTarget,
    tourHoldsNotePanel, tourInsertMode, quantityTutorialSteps, geometryTutorialSteps,
    placeFigure, captionPosition, captionBox, visibleCaption,
    createBoardControls, createGeometryPractice, createGeometryBasicsChapter, createGeometryPracticeFrames,
    geometryPracticeChapters: geometryChapters,
    createPracticeProgress, createPracticeNavigation, createTeacherDemoChapter, createQuantityPractice,
    quantityPracticeChapters: quantityChapters,
    geometryHiddenPoints, geometryCaptionLabel, geometryPointLabel, geometryPointDot, geometryShapeNode, geometryStroke,
    geometryViewport, geometryTextOverflow, geometryFrame, geometryFrameInputs,
  };
  const quantityPage = () => createBoardView(React, M, ctx, t, '', createShapeArt(React), applyHostConfig, T, shared);
  const geometryPage = () => createGeometryPage(React, G, ctx, t, shared);
  const demoPage = () => createGeometryDemoPage(React, G, t, shared);
  const Board = createTabbedBoardView(React, t, '', {
    quantity: quantityPage, geometry: geometryPage, demo: demoPage,
    mark: (size) => quantityPage().Mark(size),
  }, (view) => readDemoView(G, view));
  const props = {
    sessionId: SESSION,
    useProjection: options.useProjection || (() => null),
    useInput: () => 'plain', inputActions,
  };
  function expand(node) {
    if (!node || typeof node !== 'object') return node;
    if (typeof node.type === 'function') {
      const previous = hooks.current;
      hooks.current = storeFor(node.type);
      try { return expand(node.type(node.props)); } finally { hooks.current = previous; }
    }
    return { ...node, children: (node.children || []).flat(Infinity).map(expand) };
  }
  function bindRefs(rendered) {
    for (const node of walk(rendered)) if (node.props?.ref && typeof node.props.ref === 'object') {
      const ref = node.props.ref;
      if (!dom.has(ref)) dom.set(ref, {
        open: false, ownerDocument: { activeElement: null }, href: '', scrollLeft: 0, scrollTop: 0,
        showModal() { this.open = true; }, close() { this.open = false; },
        contains: () => false, focus() {}, select() {}, click() {}, value: '',
      });
      ref.current = dom.get(ref);
    }
  }
  let tree;
  function refresh() {
    tree = refreshTree(() => expand(React.createElement(Board, props)));
    bindRefs(tree);
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
    assert.equal(matches.length, 1, `Expected one node, found ${matches.length}`);
    return matches[0];
  };
  const button = (label) => find((node) => node.type === 'button'
    && (node.props['aria-label'] === label || text(node) === label));
  const api = {
    storage, drafts, texts, t, find, refresh, visibleNodes,
    get persisted() { return persisted; },
    get sends() { return sends; },
    get fileDialogs() { return fileDialogs; },
    raw(key) { return storage.get(key); },
    step() { return find((node) => node.props && node.props['data-practice-step'] !== undefined).props['data-practice-step']; },
    tab(name) { find((node) => node.props['data-tab'] === name).props.onClick(); refresh(); },
    press(label, pointerType = 'mouse') {
      const node = button(label);
      assert.ok(!node.props.disabled, `${label} should be enabled`);
      node.props.onClick({ pointerType, pointerId: 1, button: 0, shiftKey: false });
      refresh();
    },
    tool(label, pointerType = 'mouse') {
      const node = find((candidate) => candidate.type === 'button' && candidate.props['aria-label'] === t(label));
      node.props.onClick({ pointerType, pointerId: 1, button: 0, shiftKey: false });
      refresh();
    },
    clickAt(x, y, extra = {}) {
      const svg = find((node) => String(node.props.className || '').includes('eb-artboard'));
      const node = svg.props.ref.current;
      node.createSVGPoint = () => ({ x, y, matrixTransform: () => ({ x, y }) });
      node.getScreenCTM = () => ({ inverse: () => ({}) });
      svg.props.onPointerDown({
        button: 0, clientX: x, clientY: y, pointerId: 1, shiftKey: false, pointerType: 'mouse', ...extra,
        target: { closest: () => null }, preventDefault() {}, currentTarget: { setPointerCapture() {} },
      });
      refresh();
    },
    release(x, y) {
      const svg = find((node) => String(node.props.className || '').includes('eb-artboard'));
      svg.props.onPointerUp({ pointerId: 1, clientX: x, clientY: y });
      refresh();
    },
    openMore() { button(t('moreActions')).props.onClick(); refresh(); },
    unmount() { unmount(); browser.restore(); },
  };
  try { refresh(); } catch (error) { api.unmount(); throw error; }
  return api;
}

function chapterButton(app, title) {
  return app.find((node) => node.type === 'button' && text(node).startsWith(`${title} ·`));
}

function installFileDb(records) {
  const puts = [];
  const previous = globalThis.indexedDB;
  const later = (run) => queueMicrotask(run);
  globalThis.indexedDB = {
    open() {
      const request = {};
      const db = {
        objectStoreNames: { contains: () => true },
        close() {},
        transaction() {
          const tx = {
            objectStore() {
              return {
                get(key) {
                  const got = {};
                  later(() => { got.result = records[key] || null; got.onsuccess?.(); });
                  return got;
                },
                put(value, key) { puts.push(key); records[key] = value; later(() => { tx.oncomplete?.(); }); },
              };
            },
          };
          return tx;
        },
      };
      later(() => { request.result = db; request.onsuccess?.(); });
      return request;
    },
  };
  return { puts, restore() { globalThis.indexedDB = previous; } };
}

test('registered factories carry the shipped step ids for Q01–Q20, G01–G21, F01–F03 and D01–D04', async () => {
  const build = await readFile(new URL('../build.mjs', import.meta.url), 'utf8');
  assert.match(build, /quantityPracticeChapters: \[createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter, createQuantityFilesChapter\]/);
  assert.match(build, /geometryPracticeChapters: \[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter\]/);
  assert.equal(/geometryPracticeChapters: \[[^\]]*createTeacherDemoChapter/.test(build), false);
  const page = await readFile(new URL('../src/quantity/view-component.js', import.meta.url), 'utf8');
  const listed = page.match(/const practiceSteps = \[([^\]]+)\]/);
  assert.ok(listed, 'quantity basics steps are declared on the quantity page');
  const quantityBasics = listed[1].split(',').map((item) => item.trim().replace(/['"]/g, ''));
  assert.deepEqual(quantityBasics, ['add', 'move', 'add-second', 'select-one', 'select-many', 'deselect', 'insert']);
  const organize = createQuantityOrganizeChapter({ M, T, emptyFrame: () => ({}) });
  const notes = createQuantityNotesChapter({ M, T, emptyFrame: () => ({}) });
  const adjust = createQuantityAdjustChapter({ M, T, emptyFrame: () => ({}) });
  const quantityFiles = createQuantityFilesChapter({ M, T, emptyFrame: () => ({ board: M.empty() }) });
  const frames = createGeometryPracticeFrames(G);
  const geometryBasics = createGeometryBasicsChapter({ G, emptyFrame: frames.empty, createGoal: createGeometryPractice });
  const construct = createGeometryConstructChapter({ G, emptyFrame: frames.empty });
  const edit = createGeometryEditChapter({ G, emptyFrame: frames.empty });
  const geometryAdjust = createGeometryAdjustChapter({ G, emptyFrame: frames.empty });
  const geometryFiles = createGeometryFilesChapter({ G, emptyFrame: frames.empty });
  const demo = createTeacherDemoChapter({ G, emptyFrame: frames.empty, placeFigure });
  const shippedQuantity = {
    Q01: ['add', 'add-second'], Q02: ['move'], Q03: ['select-one', 'select-many', 'deselect'],
    Q04: ['organize-name', 'organize-reselect'], Q05: ['organize-peer', 'organize-group', 'organize-group-name', 'organize-ungroup'],
    Q06: ['organize-merge', 'organize-split'], Q07: ['organize-copy'], Q08: ['organize-crossout'], Q09: ['organize-delete'],
    Q10: ['notes-deselect', 'notes-board', 'notes-board-read'], Q11: ['notes-object', 'notes-object-check'],
    Q12: ['notes-group', 'notes-group-read'], Q13: ['notes-selection', 'notes-selection-check'],
    Q14: ['adjust-color', 'adjust-color-add'], Q15: ['adjust-pattern-add', 'adjust-pattern-use', 'adjust-pattern-hide'],
    Q16: ['adjust-change', 'adjust-undo', 'adjust-redo'], Q17: ['adjust-zoom', 'adjust-fit'],
    Q18: ['adjust-clear', 'adjust-fresh'], Q19: ['adjust-trace-option'], Q20: ['insert'],
  };
  const shippedGeometry = {
    G01: ['point'], G02: ['segment'], G03: ['triangle'], G04: ['polygon'], G05: ['circle'],
    G06: ['construct-parallelogram', 'construct-rectangle'], G07: ['construct-select-side', 'construct-midpoint'],
    G08: ['construct-drag'], G09: ['construct-auxiliary', 'construct-auxiliary-off'],
    G10: ['select-one', 'deselect'], G11: ['edit-rename'], G12: ['edit-text-add', 'edit-text-change'],
    G13: ['edit-delete'], G14: ['edit-point-note', 'edit-element-note'], G15: ['edit-caption'],
    G16: ['edit-deselect', 'edit-board-note'], G17: ['adjust-grid', 'adjust-snap'], G18: ['adjust-undo', 'adjust-redo'],
    G19: ['adjust-zoom', 'adjust-scroll', 'adjust-fit'], G20: ['adjust-clear'], G21: ['insert'],
  };
  assert.deepEqual(quantityBasics, ['add', 'move', 'add-second', 'select-one', 'select-many', 'deselect', 'insert']);
  assert.deepEqual(organize.steps, ['organize-name', 'organize-reselect', 'organize-peer', 'organize-group', 'organize-group-name', 'organize-ungroup', 'organize-merge', 'organize-split', 'organize-copy', 'organize-crossout', 'organize-delete']);
  assert.deepEqual(notes.steps, ['notes-deselect', 'notes-board', 'notes-board-read', 'notes-object', 'notes-object-check', 'notes-group', 'notes-group-read', 'notes-selection', 'notes-selection-check']);
  assert.deepEqual(adjust.steps, ['adjust-color', 'adjust-color-add', 'adjust-pattern-add', 'adjust-pattern-use', 'adjust-pattern-hide', 'adjust-change', 'adjust-undo', 'adjust-redo', 'adjust-zoom', 'adjust-fit', 'adjust-clear', 'adjust-fresh', 'adjust-trace-option']);
  assert.deepEqual(quantityFiles.steps, ['files-save', 'files-open']);
  assert.deepEqual(geometryFiles.steps, ['files-save', 'files-open']);
  assert.deepEqual(geometryBasics.steps, ['point', 'segment', 'triangle', 'polygon', 'circle', 'select-one', 'deselect', 'insert']);
  assert.deepEqual(construct.steps, ['construct-parallelogram', 'construct-rectangle', 'construct-select-side', 'construct-midpoint', 'construct-drag', 'construct-auxiliary', 'construct-auxiliary-off']);
  assert.deepEqual(edit.steps, ['edit-rename', 'edit-text-add', 'edit-text-change', 'edit-delete', 'edit-point-note', 'edit-element-note', 'edit-caption', 'edit-deselect', 'edit-board-note']);
  assert.deepEqual(geometryAdjust.steps, ['adjust-grid', 'adjust-snap', 'adjust-undo', 'adjust-redo', 'adjust-zoom', 'adjust-scroll', 'adjust-fit', 'adjust-clear']);
  assert.deepEqual(demo.steps, ['demo-read', 'demo-view', 'demo-copy', 'demo-return']);
  const quantityIds = [...quantityBasics, ...organize.steps, ...notes.steps, ...adjust.steps, ...quantityFiles.steps];
  for (const [code, ids] of Object.entries(shippedQuantity)) for (const id of ids) assert.ok(quantityIds.includes(id), `${code} ${id}`);
  const geometryIds = [...geometryBasics.steps, ...construct.steps, ...edit.steps, ...geometryAdjust.steps, ...geometryFiles.steps];
  for (const [code, ids] of Object.entries(shippedGeometry)) for (const id of ids) assert.ok(geometryIds.includes(id), `${code} ${id}`);
  assert.deepEqual(quantityFiles.steps, ['files-save', 'files-open'], 'F01 save and F02 open; F03 is the cancel and download feedback on these steps');
  assert.deepEqual([...demo.steps], ['demo-read', 'demo-view', 'demo-copy', 'demo-return']);
  const empty = G.empty();
  const geometryGoal = createGeometryPractice();
  geometryGoal.observe({ type: 'draw', tool: 'segment', before: empty, after: empty });
  assert.equal(geometryGoal.snapshot().step, 'point', 'an empty construction does not advance');
  const fileGoal = quantityFiles.createGoal();
  fileGoal.observe({ type: 'save' });
  assert.equal(fileGoal.snapshot().step, 'files-save', 'a cancelled save is not a save');
});

test('first open starts that board basics chapter and ignores the legacy seen flag', () => {
  const storage = new Map();
  storage.set(tutorialStorageKey('quantity'), '1');
  storage.set(tutorialStorageKey('geometry'), '1');
  const seenQuantity = storage.get(tutorialStorageKey('quantity'));
  const seenGeometry = storage.get(tutorialStorageKey('geometry'));
  const shell = mountShell({ storage });
  try {
    shell.press(shell.t('title'));
    assert.equal(shell.step(), 'add');
    assert.equal(shell.storage.has(GEOMETRY_PRACTICE), false, 'quantity entry does not write geometry practice');
    assert.equal(shell.storage.has(DEMO_PRACTICE), false);
    const quantityRecord = shell.raw(QUANTITY_PRACTICE);
    const quantity = JSON.parse(quantityRecord);
    assert.equal(quantity.current, 'quantity-basics');
    assert.equal(quantity.entries['quantity-basics'].states[0], 'in-progress');
    assert.equal(quantity.entries['quantity-basics'].states.every((state) => state === 'completed'), false);
    assert.equal(shell.raw(tutorialStorageKey('quantity')), seenQuantity);
    assert.equal(shell.raw(tutorialStorageKey('geometry')), seenGeometry);
    shell.tab('geometry');
    assert.equal(shell.step(), 'point');
    const geometry = JSON.parse(shell.raw(GEOMETRY_PRACTICE));
    assert.equal(geometry.current, 'geometry-basics');
    assert.equal(geometry.entries['geometry-basics'].states[0], 'in-progress');
    assert.equal(shell.raw(QUANTITY_PRACTICE), quantityRecord, 'geometry entry leaves the quantity record unchanged');
    assert.equal(shell.raw(tutorialStorageKey('quantity')), '1');
    assert.equal(shell.raw(tutorialStorageKey('geometry')), '1');
    shell.press(shell.t('practiceExit'));
    shell.press(shell.t('backToChat'));
    shell.press(shell.t('title'));
    shell.tab('geometry');
    assert.equal(shell.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
    shell.openMore();
    shell.press(shell.t('tutorialReplay'));
    assert.equal(shell.step(), 'point', 'a later open resumes instead of resetting');
  } finally { shell.unmount(); }
});

test('no teacher figure does not start the teacher guide', () => {
  const none = mountShell();
  try {
    none.press(none.t('title'));
    none.tab('demo');
    assert.equal(none.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
    assert.equal(none.storage.has(DEMO_PRACTICE), false);
  } finally { none.unmount(); }
  const empty = mountShell({ useProjection: () => ({ revision: 1, figure: { title: '空', description: '', board: G.empty() } }) });
  try {
    empty.press(empty.t('title'));
    empty.tab('demo');
    assert.equal(empty.storage.has(DEMO_PRACTICE), false);
    assert.equal(empty.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
  } finally { empty.unmount(); }
});

for (const pointerType of ['mouse', 'touch']) {
  test(`quantity and geometry basics first controls accept ${pointerType} without shift`, () => {
    const quantity = mountQuantity();
    try {
      assert.equal(quantity.step(), 'add');
      quantity.add(pointerType);
      assert.equal(quantity.step(), 'move');
    } finally { quantity.dispose(); }
    const shell = mountShell();
    try {
      shell.press(shell.t('title'), pointerType);
      shell.tab('geometry');
      shell.tool('point', pointerType);
      shell.clickAt(120, 140, { pointerType, shiftKey: false });
      shell.release(120, 140);
      assert.equal(shell.step(), 'segment');
    } finally { shell.unmount(); }
  });
}

test('catalogue shows completed, not-started, skipped and optional, and a later chapter keeps the practice board', () => {
  const storage = new Map();
  const sessionId = 'quantity-release';
  const draftKey = `baicai-edu-math-board:v4:${sessionId}`;
  let real = M.reduce(M.empty(), { type: 'add', shape: 'cat' });
  real = M.reduce(real, { type: 'note', value: 'REAL-QUANTITY-NOTE' });
  storage.set(draftKey, M.serialize(real));
  const app = mountQuantity({ storage, sessionId });
  try {
    const realBefore = realDraftKeys(storage);
    assert.equal(app.step(), 'add');
    app.add();
    const first = app.objects()[0].props['data-object'];
    app.pointer(first, 40, 40);
    app.pointer(first, 120, 80, 'Move');
    app.pointer(first, 120, 80, 'Up');
    app.add();
    const second = app.objects()[1].props['data-object'];
    app.pointer(first, 120, 80);
    app.pointer(first, 120, 80, 'Up');
    app.click(app.t('appendSelect'));
    app.pointer(second, 150, 40);
    app.pointer(second, 150, 40, 'Up');
    app.click(app.t('appendDone'));
    app.pointer(null, 400, 250);
    app.pointer(null, 400, 250, 'Up');
    app.find((node) => node.props['data-tour-id'] === 'quantity-insert').props.onClick();
    app.refresh();
    assert.equal(app.step(), 'complete');
    const basicsIds = JSON.parse(storage.get(QUANTITY_PRACTICE)).entries['quantity-basics'].frame.board.objects.map((object) => object.id);
    chapterButton(app, app.t('practiceOrganize')).props.onClick();
    app.refresh();
    assert.equal(app.step(), 'organize-name');
    const organizeIds = JSON.parse(storage.get(QUANTITY_PRACTICE)).entries['quantity-organize'].frame.board.objects.map((object) => object.id);
    for (const id of basicsIds) assert.ok(organizeIds.includes(id), 'the later chapter starts from the previous practice board');
    assert.equal(JSON.parse(storage.get(draftKey)).note, 'REAL-QUANTITY-NOTE');
    assert.deepEqual(realDraftKeys(storage), realBefore, 'a catalogue entry does not read the real draft');
    for (let step = 0; step < 11; step += 1) app.click(app.t('practiceSkipStep'));
    assert.equal(JSON.parse(storage.get(QUANTITY_PRACTICE)).entries['quantity-organize'].states.every((state) => state === 'skipped'), true);
    const labels = app.nodes().filter((node) => node.type === 'button').map((node) => text(node));
    const label = (title) => labels.find((value) => value.startsWith(`${title} ·`));
    assert.match(label(app.t('practiceBasics')), new RegExp(app.t('practiceStatus_completed')));
    assert.match(label(app.t('practiceOrganize')), new RegExp(app.t('practiceStatus_skipped')));
    assert.match(label(app.t('practiceAdjust')), new RegExp(app.t('practiceStatus_not-started')));
    assert.match(label(app.t('quantityPracticeFiles')), new RegExp(app.t('practiceOptional')));
    assert.match(label(app.t('quantityPracticeFiles')), new RegExp(app.t('practiceStatus_not-started')));
    const pageText = app.nodes().map((node) => text(node)).join('\n');
    assert.match(pageText, /不代表整套教程|is not the whole tutorial/);
    assert.equal(/整套教程已全部完成|整套全部完成|whole tutorial is complete|all chapters complete/i.test(pageText), false);
    assert.match(pageText, new RegExp(app.t('practiceSkippedEnd')));
    assert.match(label(app.t('practiceBasics')), new RegExp(app.t('practiceStatus_completed')));
  } finally { app.dispose(); }
});

test('a new progress owner resumes the step and frame; skip then supplement returns; retry keeps the other chapter', () => {
  const storage = new Map();
  let app = mountQuantity({ storage, chapters: [createQuantityNotesChapter] });
  try {
    app.add();
    const first = app.objects()[0].props['data-object'];
    assert.equal(app.step(), 'move');
    app.click(app.t('practiceExit'));
    const owner = createPracticeProgress({
      mode: 'quantity',
      chapters: [{
        id: 'quantity-basics',
        steps: ['add', 'move', 'add-second', 'select-one', 'select-many', 'deselect', 'insert'],
        start() { throw new Error('resume must not rebuild the chapter'); },
        createGoal: createQuantityPractice,
      }],
      storage: { getItem: (name) => storage.get(name) ?? null, setItem: (name, value) => storage.set(name, String(value)) },
    });
    const resumed = owner.enter();
    assert.equal(resumed.goal.step, 'move');
    assert.equal(resumed.frame.board.objects[0].id, first);
    app.dispose();
    app = mountQuantity({ storage, chapters: [createQuantityNotesChapter] });
    assert.equal(app.nodes().some((node) => node.props['data-practice-step'] !== undefined), false);
    app.click(app.t('moreActions'));
    app.click(app.t('tutorialReplay'));
    assert.equal(app.step(), 'move');
    assert.equal(app.objects()[0].props['data-object'], first);
    app.click(app.t('practiceSkipStep'));
    assert.equal(app.step(), 'add-second');
    app.click(app.t('practiceRetryStep', { step: 2 }));
    assert.equal(app.step(), 'move');
    app.pointer(first, 40, 40);
    app.pointer(first, 160, 90, 'Move');
    app.pointer(first, 160, 90, 'Up');
    assert.equal(app.step(), 'add-second', 'a finished supplement returns to the saved continuation');
    const basicsBefore = JSON.parse(storage.get(QUANTITY_PRACTICE)).entries['quantity-basics'].states[0];
    chapterButton(app, app.t('practiceNotes')).props.onClick();
    app.refresh();
    app.click(app.t('practiceRetryChapter'));
    assert.equal(app.step(), 'notes-deselect');
    assert.equal(JSON.parse(storage.get(QUANTITY_PRACTICE)).entries['quantity-basics'].states[0], basicsBefore);
    assert.equal(JSON.parse(storage.get(QUANTITY_PRACTICE)).entries['quantity-basics'].frame.board.objects[0].id, first);
  } finally { app.dispose(); }
});

test('quantity board and object notes stay distinct through the notes chapter', () => {
  const app = mountQuantity({ chapters: [createQuantityNotesChapter] });
  const openNote = () => {
    app.find((node) => node.type === 'button' && String(node.props.className || '').includes('eb-note-button')).props.onClick();
    app.refresh();
  };
  const saveNote = (value) => {
    openNote();
    app.find((node) => node.type === 'textarea').props.ref.current.value = value;
    app.click(app.t('save'));
  };
  try {
    chapterButton(app, app.t('practiceNotes')).props.onClick();
    app.refresh();
    assert.equal(app.step(), 'notes-deselect');
    app.pointer(null, 400, 250);
    app.pointer(null, 400, 250, 'Up');
    saveNote('Whole board');
    assert.equal(app.step(), 'notes-board-read');
    const board = () => JSON.parse(app.storage.get(QUANTITY_PRACTICE)).entries['quantity-notes'].frame.board;
    assert.equal(board().note, 'Whole board');
    openNote();
    assert.equal(app.find((node) => node.type === 'textarea').props.defaultValue, 'Whole board');
    app.click(app.t('cancel'));
    const entry = () => JSON.parse(app.storage.get(QUANTITY_PRACTICE)).entries['quantity-notes'];
    const ids = () => entry().goal.targets;
    const clear = () => { app.pointer(null, 400, 250); app.pointer(null, 400, 250, 'Up'); };
    const tap = (id) => { app.pointer(id, 40, 40); app.pointer(id, 40, 40, 'Up'); };
    const buttonText = (label) => app.nodes().find((node) => node.type === 'button' && text(node) === label);
    const selectOnly = (id) => {
      const other = ids().find((item) => item !== id);
      if (buttonText(app.t('appendDone'))) { buttonText(app.t('appendDone')).props.onClick(); app.refresh(); }
      clear();
      tap(id);
      app.click(app.t('appendSelect'));
      tap(other);
      app.click(app.t('appendDone'));
    };
    const first = ids()[0];
    selectOnly(first);
    saveNote('Just this one');
    assert.equal(app.step(), 'notes-object-check');
    assert.equal(board().note, 'Whole board');
    assert.equal(board().objects.find((object) => object.id === first).note, 'Just this one');
    assert.notEqual(board().note, board().objects.find((object) => object.id === first).note);
  } finally { app.dispose(); }
});

test('geometry element and board notes stay distinct through the edit chapter', () => {
  const shell = mountShell();
  try {
    shell.press(shell.t('title'));
    shell.tab('geometry');
    chapterButton(shell, shell.t('geometryPracticeEdit')).props.onClick();
    shell.refresh();
    for (let step = 0; step < 5; step += 1) shell.press(shell.t('practiceSkipStep'));
    assert.equal(shell.step(), 'edit-element-note');
    shell.press(shell.t('note'));
    shell.find((node) => node.type === 'textarea').props.ref.current.value = '边';
    shell.press(shell.t('save'));
    assert.equal(shell.step(), 'edit-caption');
    shell.press(shell.t('practiceSkipStep'));
    shell.press(shell.t('practiceSkipStep'));
    assert.equal(shell.step(), 'edit-board-note');
    shell.press(shell.t('note'));
    shell.find((node) => node.type === 'textarea').props.ref.current.value = '整板说明';
    shell.press(shell.t('save'));
    const board = JSON.parse(shell.raw(GEOMETRY_PRACTICE)).entries['geometry-edit'].frame.board;
    const element = board.elements.find((item) => item.note === '边');
    assert.ok(element, 'the element note is still on the element');
    assert.equal(board.note, '整板说明');
    assert.notEqual(board.note, element.note);
  } finally { shell.unmount(); }
});

test('cancelled quantity and geometry file saves do not advance, and a download keeps via download', async () => {
  let realWrites = 0;
  const realHandle = { name: 'real.json', createWritable: async () => { realWrites += 1; throw new Error('real handle'); } };
  const db = installFileDb({ 'last-board-file': realHandle });
  const previousFile = globalThis.File;
  globalThis.File = class { constructor(parts, name, options) { this.parts = parts; this.name = name; this.type = options?.type; this.text = async () => parts.join(''); } };
  const app = mountQuantity({ chapters: [createQuantityFilesChapter] });
  const choose = async (label) => {
    if (!app.nodes().some((node) => String(node.props.className || '').includes('eb-more-menu'))) app.click(app.t('moreActions'));
    const item = app.find((node) => node.props.role === 'menuitem' && text(node) === label);
    await item.props.onClick({ pointerType: 'mouse', pointerId: 1, button: 0 });
    app.refresh();
  };
  try {
    chapterButton(app, app.t('quantityPracticeFiles')).props.onClick();
    app.refresh();
    assert.equal(app.step(), 'files-save');
    window.showSaveFilePicker = async () => { throw Object.assign(new Error('cancel'), { name: 'AbortError' }); };
    await choose(app.t('export'));
    assert.equal(app.step(), 'files-save', 'a cancelled file save does not advance');
    assert.notEqual(JSON.parse(app.storage.get(QUANTITY_PRACTICE)).entries['quantity-files'].goal.via, 'download');
    delete window.showSaveFilePicker;
    const anchor = app.all().find((node) => node.type === 'a' && node.props['data-practice-file'] === 'quantity');
    let downloads = 0;
    anchor.props.ref.current.click = () => { downloads += 1; };
    await choose(app.t('export'));
    assert.equal(downloads, 1);
    assert.equal(app.step(), 'files-open');
    assert.equal(JSON.parse(app.storage.get(QUANTITY_PRACTICE)).entries['quantity-files'].goal.via, 'download');
    assert.equal(realWrites, 0, 'the quantity file chapter does not write the real handle');
    assert.equal(db.puts.length, 0);
  } finally { app.dispose(); db.restore(); globalThis.File = previousFile; }

  const shell = mountShell();
  const chooseGeometry = async (label) => {
    shell.openMore();
    const item = shell.find((node) => node.props.role === 'menuitem' && text(node) === label);
    await item.props.onClick({ pointerType: 'touch', pointerId: 1, button: 0 });
    shell.refresh();
  };
  try {
    shell.press(shell.t('title'));
    shell.tab('geometry');
    chapterButton(shell, shell.t('geometryPracticeFiles')).props.onClick();
    shell.refresh();
    assert.equal(shell.step(), 'files-save');
    const geometryBefore = shell.raw(GEOMETRY_KEY);
    window.showSaveFilePicker = async () => { throw Object.assign(new Error('cancel'), { name: 'AbortError' }); };
    await chooseGeometry(shell.t('export'));
    assert.equal(shell.step(), 'files-save');
    delete window.showSaveFilePicker;
    const anchor = shell.visibleNodes().find((node) => node.type === 'a' && node.props['data-practice-file'] === 'geometry');
    anchor.props.ref.current.click = () => {};
    await chooseGeometry(shell.t('export'));
    assert.equal(shell.step(), 'files-open');
    assert.equal(JSON.parse(shell.raw(GEOMETRY_PRACTICE)).entries['geometry-files'].goal.via, 'download');
    assert.equal(shell.raw(GEOMETRY_KEY), geometryBefore);
    assert.equal(realWrites, 0);
  } finally { shell.unmount(); }
});

test('an unfinished geometry construction does not advance, and exit stays available', () => {
  const shell = mountShell();
  try {
    shell.press(shell.t('title'));
    shell.tab('geometry');
    assert.equal(shell.step(), 'point');
    shell.tool('segment');
    shell.clickAt(140, 160);
    assert.equal(shell.step(), 'point', 'one click of an unfinished segment is not a placed point');
    const exit = shell.find((node) => node.type === 'button' && text(node) === shell.t('practiceExit'));
    assert.ok(!exit.props.disabled);
    shell.press(shell.t('note'));
    assert.ok(shell.visibleNodes().some((node) => node.type === 'textarea'));
    const duringNote = shell.find((node) => node.type === 'button' && text(node) === shell.t('practiceExit'));
    assert.ok(!duringNote.props.disabled);
    // Real small-screen, scroll, and window-resize layout are not executed.
  } finally { shell.unmount(); }
});

test('practice delete and clear leave the other mode and the real draft, and undo does not restore the clear', () => {
  const storage = new Map();
  const sessionId = 'quantity-release';
  const draftKey = `baicai-edu-math-board:v4:${sessionId}`;
  const seeded = M.reduce(M.empty(), { type: 'add', shape: 'cat' });
  storage.set(draftKey, M.serialize(seeded));
  storage.set(GEOMETRY_PRACTICE, '{"version":2,"current":"geometry-basics","entries":{}}');
  const geometryRecord = storage.get(GEOMETRY_PRACTICE);
  const app = mountQuantity({ storage, sessionId });
  try {
    const real = storage.get(draftKey);
    app.add();
    const id = app.objects()[0].props['data-object'];
    app.pointer(id, 40, 40);
    app.pointer(id, 40, 40, 'Up');
    app.click(app.t('trash'));
    assert.equal(app.objects().length, 0);
    assert.equal(storage.get(draftKey), real);
    assert.equal(storage.get(GEOMETRY_PRACTICE), geometryRecord);
    app.add();
    app.click(app.t('clear'));
    app.click(app.t('confirmClear'));
    assert.equal(app.objects().length, 0);
    app.click(app.t('undo'));
    assert.equal(app.objects().length, 0, 'undo does not restore a cleared practice board');
    assert.equal(storage.get(draftKey), real);
    assert.equal(storage.get(GEOMETRY_PRACTICE), geometryRecord);
  } finally { app.dispose(); }
});

test('a host settings change and clear during practice stay on the real draft after exit', () => {
  const now = Date.now;
  let clock = 1000;
  Date.now = () => clock;
  const storage = new Map();
  const sessionId = 'quantity-release';
  const draftKey = `baicai-edu-math-board:v4:${sessionId}`;
  storage.set(draftKey, M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'cat' })));
  const app = mountQuantity({ storage, sessionId });
  try {
    app.add();
    assert.equal(app.step(), 'move');
    const settings = M.defaultSettings();
    settings.shapes = ['star'];
    app.setConfig({ revision: 1, floorRevision: 0, settings, changes: [{ revision: 1, settings, scope: 'future' }] });
    assert.equal(app.step(), 'move', 'a host settings change is not a practice action');
    assert.equal(app.objects().length, 1);
    clock = 3000;
    app.setClear({ revision: 4, requestId: 'during-practice', requestedAt: 2000 });
    assert.equal(app.objects().length, 1, 'a host clear does not clear the practice board');
    assert.equal(app.step(), 'move');
    app.click(app.t('practiceExit'));
    const real = JSON.parse(storage.get(draftKey));
    assert.deepEqual(real.settings.shapes, ['star']);
    assert.equal(real.objects.length, 0, 'exit does not restore the pre-clear draft');
    const practice = JSON.parse(storage.get(QUANTITY_PRACTICE)).entries['quantity-basics'];
    assert.equal(practice.goal.step, 'move');
    assert.equal(practice.frame.board.objects.length, 1, 'the practice snapshot is not the cleared real draft');
    assert.equal(app.sends, 0);
  } finally { app.dispose(); Date.now = now; }
});

test('storage failure still allows exit, warns that resume is not guaranteed, and does not claim a save', () => {
  const storage = new Map();
  const sessionId = 'quantity-release';
  const draftKey = `baicai-edu-math-board:v4:${sessionId}`;
  const seeded = M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'cat' }));
  storage.set(draftKey, seeded);
  const app = mountQuantity({
    storage, sessionId,
    storageFail: (name) => name.startsWith('baicai-edu-math-board:practice:'),
  });
  try {
    assert.equal(app.step(), 'add');
    assert.ok(app.nodes().some((node) => node.props.role === 'alert' && text(node) === app.t('practiceStorageWarning')));
    const success = [app.t('fileSaved'), app.t('practiceFileSaved'), app.t('inserted'), app.t('insertedNote'), app.t('fileDownloaded'), app.t('practiceFileDownloaded')];
    const shown = app.nodes().map((node) => text(node)).join('\n');
    for (const message of success) assert.equal(shown.includes(message), false, message);
    app.click(app.t('practiceExit'));
    assert.equal(app.nodes().some((node) => node.props['data-practice-step'] !== undefined), false);
    assert.equal(JSON.parse(storage.get(draftKey)).objects[0].shape, 'cat');
    assert.equal(app.sends, 0);
  } finally { app.dispose(); }
});

test('the teacher guide does not call onCopy, and hiding the figure does not complete the copy', () => {
  let figure = segmentFigure();
  const shell = mountShell({ useProjection: () => ({ revision: 1, figure }) });
  const scroll = (left, top) => {
    const scroller = shell.find((node) => node.props.className === 'eb-demo-canvas-scroll');
    scroller.props.ref.current.scrollLeft = left;
    scroller.props.ref.current.scrollTop = top;
    scroller.props.onScroll();
    shell.refresh();
  };
  try {
    shell.press(shell.t('title'), 'mouse');
    shell.tab('demo');
    const geometry = shell.raw(GEOMETRY_KEY);
    assert.equal(shell.step(), 'demo-read');
    shell.press(shell.t('teacherDemoContinue'), 'touch');
    shell.press(shell.t('zoomIn'), 'mouse');
    scroll(24, 12);
    assert.equal(shell.step(), 'demo-copy');
    shell.press(shell.t('demoCopy'), 'touch');
    assert.equal(shell.step(), 'demo-return');
    assert.equal(shell.raw(GEOMETRY_KEY), geometry, 'the guide copy does not call onCopy');
    assert.equal(JSON.parse(shell.raw(DEMO_PRACTICE)).entries['teacher-demo-basics'].goal.copied, true);
  } finally { shell.unmount(); }
  figure = segmentFigure();
  const hidden = mountShell({ useProjection: () => ({ revision: 2, figure }) });
  try {
    hidden.press(hidden.t('title'));
    hidden.tab('demo');
    hidden.press(hidden.t('teacherDemoContinue'), 'mouse');
    hidden.press(hidden.t('zoomIn'), 'touch');
    const scroller = hidden.find((node) => node.props.className === 'eb-demo-canvas-scroll');
    scroller.props.ref.current.scrollLeft = 18;
    scroller.props.ref.current.scrollTop = 8;
    scroller.props.onScroll();
    hidden.refresh();
    assert.equal(hidden.step(), 'demo-copy');
    figure = null;
    hidden.refresh();
    assert.equal(hidden.visibleNodes().some((node) => node.type === 'button' && text(node) === hidden.t('demoCopy')), false);
    assert.equal(JSON.parse(hidden.raw(DEMO_PRACTICE)).entries['teacher-demo-basics'].goal.copied, false);
    const exit = hidden.find((node) => node.type === 'button' && text(node) === hidden.t('practiceExit'));
    assert.ok(!exit.props.disabled);
  } finally { hidden.unmount(); }
});

test('opening geometry during the teacher guide does not cover the return frame', () => {
  const figure = segmentFigure();
  const shell = mountShell({ useProjection: () => ({ revision: 1, figure }) });
  const scroll = (left, top) => {
    const scroller = shell.find((node) => node.props.className === 'eb-demo-canvas-scroll');
    scroller.props.ref.current.scrollLeft = left;
    scroller.props.ref.current.scrollTop = top;
    scroller.props.onScroll();
    shell.refresh();
  };
  try {
    shell.press(shell.t('title'));
    shell.tab('demo');
    assert.equal(shell.step(), 'demo-read');
    shell.tab('geometry');
    assert.equal(shell.storage.has(GEOMETRY_PRACTICE), false, 'an early guide step does not start geometry basics');
    assert.equal(shell.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false);
    shell.tab('demo');
    shell.press(shell.t('teacherDemoContinue'), 'touch');
    shell.press(shell.t('zoomIn'), 'mouse');
    scroll(24, 12);
    shell.press(shell.t('demoCopy'), 'touch');
    assert.equal(shell.step(), 'demo-return');
    shell.tab('geometry');
    assert.equal(shell.step(), 'demo-return');
    assert.equal(shell.visibleNodes().some((node) => node.type === 'button' && text(node) === shell.t('teacherDemoViewCopy')), true);
    assert.equal(shell.storage.has(GEOMETRY_PRACTICE), false, 'coming back still has not written geometry practice');
    const guide = JSON.parse(shell.raw(DEMO_PRACTICE)).entries['teacher-demo-basics'];
    assert.equal(guide.goal.copied, true);
    assert.ok(guide.frame.board.elements.length >= 1, 'the teacher-demo record still holds the copy');
    shell.press(shell.t('teacherDemoViewCopy'));
    assert.equal(shell.step(), 'demo-complete', 'confirming the copy keeps the guide open on its last step');
    shell.tab('demo');
    shell.tab('geometry');
    assert.equal(shell.storage.has(GEOMETRY_PRACTICE), false, 'an open guide on its last step still holds the visit, so no basics yet');
    shell.press(shell.t('practiceExit'));
    assert.equal(shell.visibleNodes().some((node) => node.props && node.props['data-practice-step'] !== undefined), false, 'the same visit does not open geometry basics the moment the guide closes');
    shell.tab('demo');
    shell.tab('geometry');
    assert.equal(shell.storage.has(GEOMETRY_PRACTICE), true, 'a later visit opens geometry basics once the guide is closed');
    assert.deepEqual(Object.keys(JSON.parse(shell.raw(GEOMETRY_PRACTICE)).entries), ['geometry-basics']);
    assert.equal(shell.step(), 'point');
  } finally { shell.unmount(); }
});

test('after practice, quantity insert can attach a trace, geometry insert has none, and neither sends or deletes the draft', () => {
  const previousFile = globalThis.File;
  globalThis.File = class { constructor(parts, name, options) { this.parts = parts; this.name = name; this.type = options?.type; } };
  const quantity = mountQuantity();
  try {
    quantity.click(quantity.t('practiceExit'));
    quantity.add();
    quantity.pointer(null, 400, 250);
    quantity.pointer(null, 400, 250, 'Up');
    quantity.find((node) => node.type === 'button' && String(node.props.className || '').includes('eb-note-button')).props.onClick();
    quantity.refresh();
    quantity.find((node) => node.type === 'textarea').props.ref.current.value = '放入说明';
    quantity.click(quantity.t('save'));
    const draftKey = 'baicai-edu-math-board:v4:quantity-release';
    const before = quantity.storage.get(draftKey);
    quantity.click(quantity.t('insert'));
    assert.equal(quantity.drafts.length, 1);
    assert.equal(quantity.drafts[0].length, 2, 'quantity insert can attach the optional trace');
    assert.ok(quantity.drafts[0].some((file) => file.name === quantity.t('traceAttachmentName')));
    assert.ok(quantity.texts.some((value) => value.includes('放入说明')));
    assert.equal(quantity.sends, 0);
    assert.equal(quantity.storage.get(draftKey), before, 'insert does not delete the draft');
  } finally { quantity.dispose(); }

  const shell = mountShell();
  try {
    shell.press(shell.t('title'));
    shell.tab('geometry');
    shell.press(shell.t('practiceExit'));
    shell.tool('point');
    shell.clickAt(160, 180);
    shell.press(shell.t('note'));
    shell.find((node) => node.type === 'textarea').props.ref.current.value = '几何说明';
    shell.press(shell.t('save'));
    const before = shell.raw(GEOMETRY_KEY);
    shell.press(shell.t('insert'));
    assert.equal(shell.drafts.at(-1).length, 1, 'geometry insert has no trace');
    assert.equal(shell.drafts.at(-1)[0].name, shell.t('geometryAttachmentName'));
    assert.equal(shell.drafts.at(-1).some((file) => file.name === shell.t('traceAttachmentName')), false);
    assert.ok(shell.texts.some((value) => value.includes('几何说明')));
    assert.equal(shell.sends, 0);
    assert.equal(shell.raw(GEOMETRY_KEY), before);
  } finally { shell.unmount(); globalThis.File = previousFile; }
});

test('non-board notes travel inside the snapshot while only the board note reaches the composer', () => {
  const previousFile = globalThis.File;
  globalThis.File = class { constructor(parts, name, options) { this.parts = parts; this.name = name; this.type = options?.type; } };
  const quantityStorage = new Map();
  let quantityBoard = M.empty();
  quantityBoard = M.reduce(quantityBoard, { type: 'add', shape: 'circle', x: 300, y: 200 });
  quantityBoard = M.reduce(quantityBoard, { type: 'add', shape: 'square', x: 420, y: 200 });
  const [first, second] = quantityBoard.objects;
  quantityBoard = M.reduce(quantityBoard, { type: 'annotate', target: 'object', id: first.id, value: '这个圆是我的对象说明' });
  quantityBoard = M.reduce(quantityBoard, { type: 'annotate', target: 'selection', ids: [first.id, second.id], value: '这两个是一组选择说明' });
  quantityBoard = M.reduce(quantityBoard, { type: 'note', value: '整板说明' });
  quantityStorage.set('baicai-edu-math-board:v4:quantity-release', M.serialize(quantityBoard));
  const quantity = mountQuantity({ storage: quantityStorage });
  try {
    quantity.click(quantity.t('practiceExit'));
    quantity.click(quantity.t('insert'));
    assert.equal(quantity.drafts.length, 1);
    const boardFile = quantity.drafts[0].find((file) => file.name === quantity.t('attachmentName'));
    const body = String(boardFile.parts.join(''));
    const snapshot = JSON.parse(body);
    assert.ok(snapshot.objects.some((object) => object.note === '这个圆是我的对象说明'), 'the object note is inside the board snapshot');
    assert.ok(snapshot.notes.some((note) => note.text === '这两个是一组选择说明'), 'the selection note is inside the board snapshot');
    assert.equal(snapshot.note, '整板说明');
    assert.equal(quantity.texts.length, 1, 'only the board note reaches the composer');
    assert.ok(quantity.texts[0].includes('整板说明'));
    assert.equal(quantity.texts[0].includes('这个圆是我的对象说明'), false);
    assert.equal(quantity.texts[0].includes('这两个是一组选择说明'), false);
    assert.equal(quantity.sends, 0);
  } finally { quantity.dispose(); }

  const geometryStorage = new Map();
  let geometryBoard = G.reduce(G.empty(), { type: 'addPoint', x: 180, y: 160 });
  geometryBoard = G.reduce(geometryBoard, { type: 'addPoint', x: 320, y: 160 });
  geometryBoard = G.reduce(geometryBoard, { type: 'addElement', elementType: 'segment', points: geometryBoard.points.map((point) => point.id), role: 'main' });
  const [pointA] = geometryBoard.points;
  const [segment] = geometryBoard.elements;
  geometryBoard = G.reduce(geometryBoard, { type: 'annotate', target: 'point', id: pointA.id, value: '这个点是点说明' });
  geometryBoard = G.reduce(geometryBoard, { type: 'annotate', target: 'element', id: segment.id, value: '这条边是图形说明' });
  geometryBoard = G.reduce(geometryBoard, { type: 'note', value: '几何整板说明' });
  geometryStorage.set(GEOMETRY_KEY, JSON.stringify(geometryBoard));
  const shell = mountShell({ storage: geometryStorage });
  try {
    shell.press(shell.t('title'));
    shell.tab('geometry');
    shell.press(shell.t('practiceExit'));
    shell.press(shell.t('insert'));
    assert.equal(shell.drafts.at(-1).length, 1);
    const snapshot = JSON.parse(String(shell.drafts.at(-1)[0].parts.join('')));
    assert.ok(snapshot.points.some((point) => point.note === '这个点是点说明'), 'the point note is inside the geometry snapshot');
    assert.ok(snapshot.elements.some((element) => element.note === '这条边是图形说明'), 'the element note is inside the geometry snapshot');
    assert.equal(snapshot.note, '几何整板说明');
    assert.equal(shell.texts.length, 1, 'only the board note reaches the composer');
    assert.ok(shell.texts[0].includes('几何整板说明'));
    assert.equal(shell.texts[0].includes('这个点是点说明'), false);
    assert.equal(shell.texts[0].includes('这条边是图形说明'), false);
    assert.equal(shell.sends, 0);
  } finally { shell.unmount(); globalThis.File = previousFile; }
});

test('exit leaves the pre-seeded quantity draft, its trace, the geometry draft, attachments and sends', () => {
  const storage = new Map();
  const before = M.empty();
  const quantity = M.reduce(before, { type: 'add', shape: 'star' });
  const trace = T.record(T.empty(), before, quantity, { type: 'add', shape: 'star' });
  const serialized = M.serialize(quantity);
  storage.set(QUANTITY_KEY, serialized);
  storage.set(`${QUANTITY_KEY}:trace-v1`, JSON.stringify({ board: JSON.stringify(M.validate(JSON.parse(serialized))), trace, attach: true }));
  const geometry = G.validate(G.reduce(G.empty(), { type: 'addPoint', x: 40, y: 40 }));
  storage.set(GEOMETRY_KEY, JSON.stringify(geometry));
  const seededTrace = storage.get(`${QUANTITY_KEY}:trace-v1`);
  const shell = mountShell({ storage });
  try {
    shell.press(shell.t('title'));
    shell.tab('geometry');
    assert.equal(shell.step(), 'point');
    shell.tool('point');
    shell.clickAt(200, 200);
    shell.press(shell.t('practiceExit'));
    assert.equal(M.validate(JSON.parse(shell.raw(QUANTITY_KEY))).objects[0].shape, 'star');
    assert.equal(shell.raw(`${QUANTITY_KEY}:trace-v1`), seededTrace);
    assert.equal(G.validate(JSON.parse(shell.raw(GEOMETRY_KEY))).points.length, 1);
    assert.equal(shell.drafts.length, 0);
    assert.equal(shell.sends, 0);
    assert.equal(shell.persisted, 0);
  } finally { shell.unmount(); }
});
