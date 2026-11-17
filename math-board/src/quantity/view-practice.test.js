import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardView, createShapeArt } from './view.js';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { applyHostConfig } from '../host/config-bridge.js';
import { createBoardFilePicker, createBoardIcons } from '../shared/file-picker.js';
import { createBoardControls } from '../shared/board-kit.js';
import * as tutorial from '../shell/tutorial.js';
import * as practice from './practice.js';
import { createQuantityAdjustChapter } from './practice-adjust.js';
import { createQuantityOrganizeChapter } from './practice-organize.js';
import { createQuantityNotesChapter } from './practice-notes.js';
import { createQuantityFilesChapter } from './practice-files.js';
import { createGeometryModel } from '../geometry/model.js';
import { createPracticeProgress, createPracticeNavigation } from '../shell/practice-progress.js';
import { createHooks, installBrowser, text } from '../testing/test-harness.js';

const M = createBoardModel(), T = createBoardTrace(M);
const locales = {};
for (const language of ['en', 'zh']) locales[language] = JSON.parse(await readFile(new URL(`../../locale/${language}.json`, import.meta.url), 'utf8'));
const key = 'baicai-edu-math-board:v4:practice-test';
const realStorage = (storage) => new Map([...storage].filter(([name]) => !name.startsWith('baicai-edu-math-board:practice:')));
function mount(options = {}) {
  const storage = options.storage || new Map();
  // These tests enter practice from the replay menu. A present practice record
  // keeps the release first-run route from opening basics on mount.
  const practiceKey = 'baicai-edu-math-board:practice:v2:quantity';
  if (!storage.has(practiceKey)) {
    storage.set(practiceKey, JSON.stringify({ version: 2, current: 'quantity-basics', entries: {} }));
  }
  const browser = installBrowser({ ...options, storage });
  const hooks = createHooks();
  const { React } = hooks;
  let config = null, clear = null, active = true, uploads = 0, closed = 0, boundClose;
  const t = (name, params = {}) => {
    const value = locales[options.language || 'en'][name];
    assert.equal(typeof value, 'string', `Missing locale ${name}`);
    return value.replace(/\{(\w+)\}/g, (_, k) => params[k]);
  };
  const Board = createBoardView(React, options.model || M, { locale: { subscribe() {}, getSnapshot() {} }, get() { uploads++; throw Error('practice upload'); } },
    t, '', createShapeArt(React), applyHostConfig, T,
    { createBoardFilePicker, createBoardIcons, createBoardControls, createPracticeProgress, createPracticeNavigation, quantityPracticeChapters: options.chapters || [], ...tutorial, ...practice });
  const props = { split: true, sessionId: 'practice-test', tabActive: true,
    close: () => { closed++; active = false; }, bindClose: (fn) => { boundClose = fn; },
    useProjection: (name) => name === 'eduBoardClear' ? clear : config, useInput: () => 'plain',
    inputActions: new Proxy({}, { get() { uploads++; throw Error('composer accessed'); } }) };
  const dom = new Map();
  let mounted = new Set(), rendering;
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
      if (!dom.has(node.props.ref)) dom.set(node.props.ref, { focus() {}, select() {}, click() {},
        createSVGPoint() { return { x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }; },
        getScreenCTM: () => ({ inverse: () => ({}) }) });
      node.props.ref.current = dom.get(node.props.ref);
    }
    return { ...node, children: node.children.flat(Infinity).map((child) => expand(child)) };
  }
  const walkAll = (node) => (!node || typeof node !== 'object' ? []
    : [node, ...(node.children || []).flat(Infinity).flatMap(walkAll)]);
  const refresh = () => hooks.refresh(() => {
    rendering = new Set();
    const tree = expand(React.createElement(Board, { ...props, tabActive: active }));
    for (const type of mounted) if (!rendering.has(type)) {
      const store = hooks.storeFor(type);
      for (const slot of store.slots) slot?.cleanup?.();
      store.slots = []; store.effects = [];
    }
    mounted = rendering;
    return tree;
  });
  const visible = (node) => !node || typeof node !== 'object' || node.props.hidden ? []
    : [node, ...node.children.flat(Infinity).flatMap(visible)];
  const nodes = () => visible(hooks.tree);
  const find = (predicate) => { const matches = nodes().filter(predicate); assert.equal(matches.length, 1); return matches[0]; };
  const click = (label) => { const node = find((n) => n.type === 'button' && (text(n) === label || n.props['aria-label'] === label)); node.props.onClick(); refresh(); };
  refresh();
  return { browser, refresh, nodes, find, click, t, all: () => walkAll(hooks.tree), get uploads() { return uploads; },
    start() { click(t('moreActions')); click(t('tutorialReplay')); },
    add() { find((n) => n.type === 'button' && n.props['aria-label'] === `${t('circle')} · ${t('value')} 1`).props.onClick(); refresh(); },
    step() { return find((n) => n.props['data-practice-step']).props['data-practice-step']; },
    objects() { return nodes().filter((n) => n.props['data-object']); },
    pointer(id, x, y, phase = 'Down', pointerType = 'mouse') {
      const svg = find((n) => n.props.className === 'eb-artboard');
      svg.props[`onPointer${phase}`]({ button: 0, clientX: x, clientY: y, pointerId: 1, pointerType,
        target: { closest: () => id ? { getAttribute: () => id } : null }, currentTarget: { setPointerCapture() {} }, preventDefault() {} }); refresh();
    },
    setConfig(next) { config = next; refresh(); }, setClear(next) { clear = next; refresh(); },
    deactivate() { active = false; refresh(); },
    backdropClose() { boundClose(); refresh(); }, get closed() { return closed; },
    dispose() { hooks.unmount(); browser.restore(); },
  };
}

test('independent fixture chapter starts with sufficient practice and retains other chapter progress on retry', () => {
  const chapter = ({ M, emptyFrame }) => ({ id: 'fixture-independent', titleKey: 'practiceOptional', optional: true, steps: ['add'],
    start: () => { const frame = emptyFrame(); frame.board = M.reduce(frame.board, { type: 'add', shape: 'cat' }); return frame; },
    createGoal(saved = { index: 0 }) {
      let index = saved.index;
      return { snapshot: () => ({ index, targets: [], total: 1, step: index ? 'complete' : 'add', completed: index === 1 }),
        observe(event) { if (event.type === 'add' && event.after.objects.length > event.before.objects.length) index = 1; } };
    },
  });
  const storage = new Map();
  let app = mount({ storage, chapters: [chapter] });
  try {
    app.add(); app.start(); app.add();
    const choose = () => app.click(`${app.t('practiceOptional')} · ${app.t('practiceStatus_not-started')} · ${app.t('practiceOptional')} · 1/1`);
    choose();
    assert.equal(app.step(), 'add', 'preseed is not completion');
    assert.equal(app.objects().length, 1, 'independent chapter provides its prerequisite');
    app.add();
    assert.equal(app.step(), 'complete');
    app.dispose(); app = mount({ storage, chapters: [chapter] }); app.start();
    assert.equal(app.step(), 'complete', 'resumes the current chapter, not basics');
    app.click(app.t('practiceRetryChapter'));
    assert.equal(app.step(), 'add');
    app.click(`${app.t('practiceBasics')} · ${app.t('practiceStatus_in-progress')} · 2/7`);
    assert.equal(app.step(), 'move');
    assert.equal(app.objects().length, 1, 'retry another chapter did not remove basics frame');
    app.click(app.t('practiceExit'));
    assert.equal(app.objects().length, 1, 'real owner remains separate');
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

for (const failure of ['denied', 'corrupt', 'incompatible', 'invalid-frame']) test(`practice storage ${failure} is honest and leaves real draft safe`, () => {
  const storage = new Map();
  const progressKey = 'baicai-edu-math-board:practice:v2:quantity';
  let app = mount({ storage, storageFail: failure === 'denied' ? (name) => name === progressKey : undefined });
  try {
    app.add(); const real = realStorage(storage);
    if (failure === 'corrupt') storage.set(progressKey, '{broken');
    if (failure === 'incompatible') storage.set(progressKey, JSON.stringify({ version: 999, entries: {} }));
    if (failure === 'invalid-frame') {
      app.start(); app.add(); app.click(app.t('practiceExit'));
      const saved = JSON.parse(storage.get(progressKey));
      saved.entries['quantity-basics'].frame.board = { invalid: true };
      storage.set(progressKey, JSON.stringify(saved));
    }
    app.start();
    assert.ok(app.nodes().some((n) => n.props.role === 'alert' && text(n) === app.t('practiceStorageWarning')));
    assert.equal(app.step(), 'add');
    app.add(); assert.equal(app.step(), 'move');
    app.click(app.t('practiceReset')); assert.equal(app.objects().length, 1);
    app.click(app.t('practiceExit'));
    assert.equal(app.objects().length, 1);
    assert.deepEqual(realStorage(storage), real);
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

test('a scroll-only persistence failure immediately warns that resume is unreliable', () => {
  let denied = false;
  const app = mount({ storageFail: (name) => denied && name.includes(':practice:') });
  try {
    app.start(); app.add();
    denied = true;
    const scroller = app.find((n) => n.props.className === 'eb-canvas-scroll');
    scroller.props.ref.current.scrollTop = 80; scroller.props.onScroll(); app.refresh();
    assert.ok(app.nodes().some((n) => n.props.role === 'alert' && text(n) === app.t('practiceStorageWarning')));
    app.click(app.t('practiceExit'));
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

test('skip repairs a removed dependency without awarding the following step', () => {
  const app = mount();
  try {
    app.start(); app.add();
    app.click(app.t('clear')); app.click(app.t('confirmClear'));
    app.click(app.t('practiceSkipStep'));
    assert.equal(app.step(), 'add-second');
    assert.equal(app.objects().length, 1);
    app.add();
    assert.equal(app.step(), 'select-one');
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

test('skipped add can be practised without its programmatic seed passing the goal', () => {
  const app = mount();
  try {
    app.start();
    app.click(app.t('practiceSkipStep'));
    assert.equal(app.step(), 'move');
    assert.equal(app.objects().length, 1);
    const continuingTarget = app.objects()[0].props['data-object'];
    app.click(app.t('practiceRetryStep', { step: 1 }));
    assert.equal(app.step(), 'add');
    assert.equal(app.objects().length, 0);
    app.add();
    assert.equal(app.step(), 'move');
    assert.equal(app.objects()[0].props['data-object'], continuingTarget, 'the pending goal and visible target return together');
    app.pointer(continuingTarget, 40, 40);
    app.pointer(continuingTarget, 100, 80, 'Move');
    app.pointer(continuingTarget, 100, 80, 'Up');
    assert.equal(app.step(), 'add-second', 'the restored cursor can operate on its visible target');
  } finally { app.dispose(); }
});

test('successful supplement restores the actual continuing editor frame and targets, then skip preserves it too', () => {
  const app = mount();
  try {
    app.start(); app.click(app.t('practiceSkipStep'));
    const first = app.objects()[0].props['data-object'];
    app.pointer(first, 40, 40); app.pointer(first, 120, 80, 'Move'); app.pointer(first, 120, 80, 'Up');
    app.add();
    assert.equal(app.step(), 'select-one');
    const continuingObjects = app.objects().map((node) => [node.props['data-object'], node.props.transform]);
    app.click(app.t('practiceRetryStep', { step: 1 }));
    assert.equal(app.objects().length, 0);
    app.add();
    assert.equal(app.step(), 'select-one');
    assert.deepEqual(app.objects().map((node) => [node.props['data-object'], node.props.transform]), continuingObjects);
    app.pointer(first, 120, 80); app.pointer(first, 120, 80, 'Up');
    assert.equal(app.step(), 'select-many');
    app.click(app.t('practiceSkipStep'));
    assert.equal(app.step(), 'deselect');
    app.click(app.t('practiceRetryStep', { step: 5 }));
    assert.equal(app.step(), 'select-many');
    app.click(app.t('practiceSkipStep'));
    assert.equal(app.step(), 'deselect');
    assert.deepEqual(app.objects().map((node) => [node.props['data-object'], node.props.transform]), continuingObjects);
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

test('quantity editor resumes frame, notes, undo history, options and view after fresh mount; resets and retries safely', () => {
  const storage = new Map();
  let app = mount({ storage });
  try {
    app.add();
    app.start(); app.add();
    const first = app.objects()[0].props['data-object'];
    app.click(app.t('morePatterns'));
    app.click(`${app.t('addPattern')}: ${app.t('star')}`);
    app.click(app.t('done'));
    app.find((n) => n.type === 'button' && String(n.props.className || '').includes('eb-note-button')).props.onClick(); app.refresh();
    app.find((n) => n.type === 'textarea').props.ref.current.value = 'Persisted practice note';
    app.click(app.t('save'));
    app.click(app.t('moreActions'));
    app.find((n) => n.type === 'input' && n.props.type === 'checkbox').props.onChange({ target: { checked: false } }); app.refresh();
    app.click(app.t('zoomIn'));
    const scroller = app.find((n) => n.props.className === 'eb-canvas-scroll');
    scroller.props.ref.current.scrollTop = 80; scroller.props.ref.current.scrollLeft = 20;
    scroller.props.onScroll(); app.refresh();
    app.click(app.t('practiceExit'));
    assert.equal(app.objects().length, 1);
    app.dispose(); app = mount({ storage });
    assert.ok(!app.nodes().some((n) => n.props['data-practice-step']));
    app.start();
    assert.equal(app.step(), 'move');
    assert.equal(app.objects()[0].props['data-object'], first);
    assert.ok(app.nodes().some((n) => n.type === 'button' && n.props['aria-label'] === `${app.t('star')} · ${app.t('value')} 1`));
    assert.equal(text(app.find((n) => n.props.className === 'eb-zoom-label')), '125%');
    const restoredScroll = app.find((n) => n.props.className === 'eb-canvas-scroll').props.ref.current;
    assert.equal(restoredScroll.scrollTop, 80); assert.equal(restoredScroll.scrollLeft, 20);
    assert.ok(app.objects()[0].props['aria-label'].includes(app.t('hasNote')));
    app.find((n) => n.type === 'button' && String(n.props.className || '').includes('eb-note-button')).props.onClick(); app.refresh();
    assert.equal(app.find((n) => n.type === 'textarea').props.defaultValue, 'Persisted practice note');
    app.click(app.t('cancel'));
    assert.equal(app.find((n) => n.type === 'button' && n.props['aria-label'] === app.t('fitView')).props['aria-pressed'], false);
    app.click(app.t('moreActions'));
    assert.equal(app.find((n) => n.type === 'input' && n.props.type === 'checkbox').props.checked, false);
    app.click(app.t('undo'));
    app.find((n) => n.type === 'button' && String(n.props.className || '').includes('eb-note-button')).props.onClick(); app.refresh();
    assert.equal(app.find((n) => n.type === 'textarea').props.defaultValue, '');
    app.click(app.t('practiceReset'));
    assert.equal(app.step(), 'move');
    assert.equal(app.objects().length, 1);
    app.click(app.t('practiceSkipStep'));
    assert.equal(app.step(), 'add-second');
    app.click(app.t('practiceRetryChapter'));
    assert.equal(app.step(), 'add');
    assert.equal(app.objects().length, 0);
    app.click(app.t('practiceExit'));
    assert.equal(app.objects().length, 1);
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

for (const language of ['en', 'zh']) for (const pointerType of ['mouse', 'touch']) {
  test(`quantity basics pointer-handler replay: ${language}, ${pointerType} (not a browser replay)`, () => {
    const app = mount({ language });
    try {
      app.add();
      const real = realStorage(app.browser.storage);
      app.start(); app.add();
      const first = app.objects()[0].props['data-object'];
      app.pointer(first, 40, 40, 'Down', pointerType);
      app.pointer(first, 40, 40, 'Up', pointerType);
      assert.equal(app.step(), 'move', 'stationary click does not complete movement');
      app.pointer(first, 40, 40, 'Down', pointerType);
      app.pointer(first, 100, 80, 'Move', pointerType);
      assert.equal(app.step(), 'move', 'preview is not a committed move');
      app.pointer(first, 100, 80, 'Up', pointerType);
      assert.equal(app.step(), 'add-second');
      app.add();
      const second = app.objects()[1].props['data-object'];
      assert.equal(app.step(), 'select-one', 'automatic selection on add is not user selection');
      app.pointer(second, 150, 40, 'Down', pointerType);
      app.pointer(second, 150, 40, 'Up', pointerType);
      assert.equal(app.step(), 'select-one', 'wrong target selection fails');
      app.pointer(first, 100, 80, 'Down', pointerType);
      app.pointer(first, 100, 80, 'Up', pointerType);
      assert.equal(app.step(), 'select-many');
      app.click(app.t('appendSelect'));
      app.pointer(second, 150, 40, 'Down', pointerType);
      app.pointer(second, 150, 40, 'Up', pointerType);
      assert.equal(app.step(), 'deselect');
      app.click(app.t('appendDone'));
      app.pointer(null, 400, 250, 'Down', pointerType);
      app.pointer(null, 400, 250, 'Up', pointerType);
      assert.equal(app.step(), 'insert');
      app.find((n) => n.props['data-tour-id'] === 'quantity-insert').props.onClick(); app.refresh();
      assert.equal(app.step(), 'complete');
      assert.equal(app.uploads, 0);
      assert.deepEqual(realStorage(app.browser.storage), real);
      app.click(app.t('practiceExit'));
      assert.equal(app.objects().length, 1);
    } finally { app.dispose(); }
  });
}

test('workbench close exits practice even while a note editor is open', () => {
  const app = mount();
  try {
    app.add();
    const real = realStorage(app.browser.storage);
    app.start(); app.add();
    app.find((n) => n.type === 'button' && String(n.props.className || '').includes('eb-note-button')).props.onClick(); app.refresh();
    app.backdropClose();
    assert.equal(app.closed, 1);
    assert.ok(!app.nodes().some((n) => n.props['data-practice-step']));
    assert.equal(app.objects().length, 1);
    assert.deepEqual(realStorage(app.browser.storage), real);
  } finally { app.dispose(); }
});

test('a rejected add and a cancelled drag cannot complete a practice goal', () => {
  let reject = true;
  const app = mount({ model: { ...M, reduce(board, action) {
    if (reject && action.type === 'add') throw Error('Synthetic object limit');
    return M.reduce(board, action);
  } } });
  try {
    app.start(); app.add();
    assert.equal(app.step(), 'add');
    assert.equal(app.objects().length, 0);
    reject = false; app.add();
    const first = app.objects()[0].props['data-object'];
    const position = app.objects()[0].props.transform;
    app.pointer(first, 40, 40); app.pointer(first, 100, 80, 'Move'); app.pointer(first, 100, 80, 'Cancel');
    assert.equal(app.step(), 'move');
    assert.equal(app.objects()[0].props.transform, position);
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

test('host settings and clear keep updating the real owner during practice', () => {
  const now = Date.now;
  let clock = 1000;
  Date.now = () => clock;
  const app = mount();
  try {
    app.add(); app.start(); app.add();
    const settings = M.defaultSettings();
    settings.shapes = ['star'];
    app.setConfig({ revision: 1, floorRevision: 0, settings, changes: [{ revision: 1, settings, scope: 'future' }] });
    assert.equal(app.step(), 'move', 'host update cannot pass a practice step');
    assert.equal(app.objects().length, 1);
    clock = 3000;
    app.setClear({ revision: 1, requestId: 'during-practice', requestedAt: 2000 });
    assert.equal(app.objects().length, 1, 'host clear does not clear the practice owner');
    assert.equal(app.step(), 'move');
    app.click(app.t('practiceExit'));
    assert.equal(app.objects().length, 0, 'exit cannot restore pre-clear real objects');
    const real = JSON.parse(app.browser.storage.get(key));
    assert.deepEqual(real.settings.shapes, ['star']);
    assert.equal(real.objects.length, 0);
    assert.equal(JSON.parse(app.browser.storage.get(`${key}:clear-v1`)).revision, 1);
  } finally { app.dispose(); Date.now = now; }
});

test('queued saves and page deactivation cannot persist practice into the real draft', () => {
  const queue = [];
  const app = mount({ lockQueue: queue });
  try {
    app.add();
    const realPosition = app.objects()[0].props.transform;
    app.start(); app.add();
    const first = app.objects()[0].props['data-object'];
    app.pointer(first, 40, 40); app.pointer(first, 120, 100, 'Move'); app.pointer(first, 120, 100, 'Up');
    app.add();
    app.deactivate();
    while (queue.length) queue.shift()();
    app.refresh();
    assert.equal(app.objects().length, 1);
    const real = JSON.parse(app.browser.storage.get(key));
    assert.equal(real.objects.length, 1);
    assert.equal(`translate(${real.objects[0].x} ${real.objects[0].y})`, realPosition);
    assert.ok(!app.nodes().some((n) => n.props['data-practice-step']));
  } finally { app.dispose(); }
});

test('practice changes to settings, notes, history, preferences and view never escape', () => {
  const app = mount();
  try {
    app.add();
    const real = realStorage(app.browser.storage);
    const realSelection = app.objects().map((n) => n.props['aria-pressed']);
    app.start(); app.add();
    app.find((n) => n.type === 'button' && String(n.props.className || '').includes('eb-note-button')).props.onClick(); app.refresh();
    app.find((n) => n.type === 'textarea').props.ref.current.value = 'Synthetic practice note';
    app.click(app.t('save'));
    app.click(app.t('morePatterns'));
    app.click(`${app.t('addPattern')}: ${app.t('star')}`);
    app.click(app.t('done'));
    app.click(app.t('moreActions'));
    const checkbox = app.find((n) => n.type === 'input' && n.props.type === 'checkbox');
    checkbox.props.onChange({ target: { checked: false } }); app.refresh();
    app.click(app.t('export'));
    assert.equal(app.browser.exports.length, 0);
    app.click(app.t('zoomIn'));
    app.click(app.t('clear')); app.click(app.t('confirmClear'));
    assert.equal(app.objects().length, 0);
    assert.ok(app.nodes().some((n) => text(n) === app.t('practiceTargetMissing')));
    app.click(app.t('practiceExit'));
    assert.equal(app.objects().length, 1);
    assert.deepEqual(app.objects().map((n) => n.props['aria-pressed']), realSelection);
    assert.equal(app.find((n) => n.type === 'button' && n.props['aria-label'] === app.t('fitView')).props['aria-pressed'], true);
    app.click(app.t('moreActions'));
    assert.equal(app.find((n) => n.type === 'input' && n.props.type === 'checkbox').props.checked, true);
    assert.deepEqual(realStorage(app.browser.storage), real);
    assert.equal(app.uploads, 0);
  } finally { app.dispose(); }
});

test('rich real snapshot, trace and preferences survive exit and a fresh mount', () => {
  let real = M.reduce(M.empty(), { type: 'add', shape: 'circle', count: 2 });
  real = M.reduce(real, { type: 'merge', ids: real.objects.map((o) => o.id) });
  const mergedId = real.objects[0].id;
  real = M.reduce(real, { type: 'add', shape: 'cat', count: 2 });
  const cats = real.objects.filter((o) => o.shape === 'cat').map((o) => o.id);
  real = M.reduce(real, { type: 'groupSelected', ids: cats, alias: 'Synthetic group' });
  real = M.reduce(real, { type: 'note', value: 'Synthetic real board note' });
  real = M.reduce(real, { type: 'annotate', target: 'object', id: mergedId, value: 'Synthetic real object note' });
  real = M.reduce(real, { type: 'annotate', target: 'group', id: real.groups[0].id, value: 'Synthetic real group note' });
  real = M.reduce(real, { type: 'annotate', target: 'selection', ids: [mergedId, cats[0]], value: 'Synthetic selection note' });
  const storage = new Map([[key, M.serialize(real)]]);
  let app = mount({ storage });
  try {
    const saved = realStorage(storage);
    app.start(); app.add();
    app.click(app.t('practiceExit'));
    assert.deepEqual(realStorage(storage), saved);
    app.start();
    assert.equal(app.step(), 'move');
    assert.equal(app.objects().length, 1);
    app.dispose();
    app = mount({ storage });
    assert.ok(!app.nodes().some((n) => n.props['data-practice-step']));
    assert.equal(app.objects().length, 3);
    assert.deepEqual(realStorage(storage), saved);
  } finally { app.dispose(); }
});

for (const language of ['en', 'zh']) test(`adjust chapter real editor replay, clear boundary and isolated resume (${language})`, () => {
  // The chapter is a browser-provided factory, the way build.mjs appends it to the page.
  const storage = new Map(), chapters = [createQuantityAdjustChapter];
  const progressKey = 'baicai-edu-math-board:practice:v2:quantity';
  const frame = () => JSON.parse(storage.get(progressKey)).entries['quantity-adjust'].frame;
  let app = mount({ storage, chapters, language });
  const tile = (shape) => app.click(`${app.t(shape)} · ${app.t('value')} 10`);
  // The library's own Done is labelled apart from the note dialog's Done; toggling the
  // last tile out of view can leave the panel open and must still be closable.
  const openLibrary = () => app.click(app.t('morePatterns'));
  const press = (label) => { app.find((n) => n.type === 'button' && n.props['aria-label'] === label).props.onClick(); app.refresh(); };
  const closeLibrary = () => press(`${app.t('morePatterns')} · ${app.t('done')}`);
  const toggleTile = (action, shape) => { openLibrary(); press(`${app.t(action)}: ${app.t(shape)}`); return { step: hideStep() }; };
  const hideStep = () => (app.nodes().find((n) => n.props['data-practice-step']) || { props: {} }).props['data-practice-step'];
  const checkbox = () => app.find((n) => n.type === 'input' && n.props.type === 'checkbox');
  const shapes = () => frame().board.objects.map((o) => o.shape);
  try {
    app.add(); const real = realStorage(storage);
    app.start();
    app.click(`${app.t('practiceAdjust')} · ${app.t('practiceStatus_not-started')} · 1/13`);
    assert.equal(app.step(), 'adjust-color'); assert.equal(shapes().length, 0, 'the chapter starts with its own empty practice');
    // Q14: repeating the current creation colour is not a change; the chosen level colours
    // the new object, while the object placed before the lesson keeps its own value/colour.
    app.click(`${app.t('creationColor')} · 1`); assert.equal(app.step(), 'adjust-color');
    app.click(`${app.t('creationColor')} · 10`); assert.equal(app.step(), 'adjust-color-add');
    tile('circle'); assert.equal(app.step(), 'adjust-pattern-add');
    assert.deepEqual(frame().board.objects.map((o) => [o.shape, o.value, o.color]), [['circle', 10, 1]]);
    // Q15: enable an absent pattern, use it, then hide it; earlier objects stay, one tile remains.
    openLibrary(); assert.equal(app.step(), 'adjust-pattern-add', 'opening the library is not the change');
    assert.deepEqual(toggleTile('addPattern', 'star'), { step: 'adjust-pattern-use' }, 'enabling an absent pattern advances the chapter');
    closeLibrary(); assert.equal(app.step(), 'adjust-pattern-use');
    assert.ok(frame().board.settings.shapes.includes('star'));
    tile('circle'); assert.equal(app.step(), 'adjust-pattern-use', 'another pattern is not the newly enabled one');
    tile('star'); assert.equal(app.step(), 'adjust-pattern-hide');
    assert.deepEqual(shapes(), ['circle', 'circle', 'star'], 'existing objects survive hiding the pattern');
    assert.equal(toggleTile('removePattern', 'star').step, 'adjust-change', 'hiding the enabled pattern advances the chapter');
    openLibrary(); assert.ok(app.nodes().find((n) => n.type === 'button' && n.props['aria-label'] === `${app.t('addPattern')}: ${app.t('star')}`), 'hidden from the rail');
    closeLibrary();
    assert.deepEqual(shapes(), ['circle', 'circle', 'star'], 'existing objects survive hiding the pattern');
    assert.ok(frame().board.settings.shapes.length >= 1);
    // Q16: an explicit new addition, undone to its exact before board and redone to its after board.
    tile('circle'); assert.equal(app.step(), 'adjust-undo');
    app.click(app.t('undo'));
    assert.equal(app.step(), 'adjust-redo'); assert.deepEqual(shapes(), ['circle', 'circle', 'star'], 'Undo removed exactly the last addition');
    app.click(app.t('practiceExit')); app.dispose(); app = mount({ storage, chapters, language }); app.start();
    assert.equal(app.step(), 'adjust-redo');
    app.click(app.t('redo')); assert.equal(app.step(), 'adjust-zoom');
    assert.deepEqual(shapes(), ['circle', 'circle', 'star', 'circle'], 'Redo restores exactly the undone addition');
    // Q17: a real zoom change, then back to fit; clicking the current state is not a change.
    app.click(app.t('fitView')); assert.equal(app.step(), 'adjust-zoom', 'already fitted is not the change');
    app.click(app.t('zoomIn')); assert.equal(app.step(), 'adjust-fit');
    assert.equal(frame().zoom, 1.25); assert.equal(frame().fit, false);
    app.click(app.t('fitView')); assert.equal(app.step(), 'adjust-clear'); assert.equal(frame().fit, true);
    // Q18: notes, record and undo history are present; a clear needs confirmation.
    app.find((n) => n.type === 'button' && String(n.props.className || '').includes('eb-note-button')).props.onClick(); app.refresh();
    app.find((n) => n.type === 'textarea').props.ref.current.value = 'Practice only';
    app.click(app.t('save')); assert.equal(frame().board.note, 'Practice only');
    assert.ok(frame().trace.totalChanges > 0); assert.ok(frame().history.past.length > 0);
    app.click(app.t('clear')); app.click(app.t('cancel')); assert.equal(app.step(), 'adjust-clear', 'cancelling never clears');
    assert.equal(frame().board.note, 'Practice only');
    app.click(app.t('clear')); app.click(app.t('confirmClear'));
    assert.deepEqual(frame().board.objects, []); assert.equal(frame().board.note, '');
    assert.deepEqual(frame().board.notes, []); assert.deepEqual(frame().trace, T.empty());
    assert.deepEqual(frame().history, { past: [], future: [] }, 'undo history cleared');
    app.click(app.t('undo')); assert.deepEqual(shapes(), [], 'the cleared objects cannot be restored by Undo');
    // Q19 needs a fresh, nonempty snapshot of its own; the cleared stage supplies the start.
    tile('circle'); assert.equal(app.step(), 'adjust-trace-option'); assert.deepEqual(shapes(), ['circle']);
    assert.equal(frame().history.past[0]?.objects.length ?? 0, 0, 'history never holds cleared work');
    const snapshot = frame().board, trace = frame().trace;
    app.click(app.t('moreActions')); checkbox().props.onChange({ target: { checked: true } }); app.refresh();
    assert.equal(app.step(), 'adjust-trace-option', 'clicking the current value is not a change');
    checkbox().props.onChange({ target: { checked: false } }); app.refresh();
    assert.equal(app.step(), 'complete'); assert.equal(frame().attachTrace, false);
    // Practice-only option: neither the snapshot nor the separate record is cleared.
    assert.deepEqual(frame().board, snapshot); assert.deepEqual(frame().trace, trace, 'snapshot and record stay independent');
    // Snapshot-only insert stays a simulation: no upload, no composer access.
    app.find((n) => n.props['data-tour-id'] === 'quantity-insert').props.onClick(); app.refresh();
    assert.equal(app.uploads, 0);
    app.click(app.t('practiceExit')); assert.deepEqual(realStorage(storage), real, 'tutorial writes nothing to the real draft');
    // Resume restores this chapter; the real draft is still the one made before practice.
    app.dispose(); app = mount({ storage, chapters, language }); app.start();
    assert.equal(app.step(), 'complete'); assert.equal(frame().attachTrace, false);
    assert.deepEqual(realStorage(storage), real);
    // Retry, skip, supplement and reset all stay inside this chapter and its practice.
    app.click(app.t('practiceRetryChapter')); assert.equal(app.step(), 'adjust-color');
    app.click(app.t('practiceSkipStep')); assert.equal(app.step(), 'adjust-color-add');
    app.click(app.t('practiceRetryStep', { step: 1 })); assert.equal(app.step(), 'adjust-color');
    app.click(`${app.t('creationColor')} · 10`); assert.equal(app.step(), 'adjust-color-add');
    app.click(app.t('practiceReset')); assert.equal(app.step(), 'adjust-color-add', 'reset keeps the supplemented position');
    app.click(app.t('practiceExit')); assert.deepEqual(realStorage(storage), real);
  } finally { app.dispose(); }
});

for (const language of ['en', 'zh']) for (const pointerType of ['mouse', 'touch']) {
  test(`organize chapter real editor replay (${language}, ${pointerType}; not a browser replay)`, () => {
    const storage = new Map(), chapters = [createQuantityOrganizeChapter];
    const progressKey = 'baicai-edu-math-board:practice:v2:quantity';
    const entry = () => JSON.parse(storage.get(progressKey)).entries['quantity-organize'];
    const board = () => entry().frame.board;
    const ids = () => entry().goal.targets;
    let app = mount({ storage, chapters, language });
    const coach = () => text(app.find((node) => node.props['data-practice-step']));
    const tap = (id) => { app.pointer(id, 40, 40, 'Down', pointerType); app.pointer(id, 40, 40, 'Up', pointerType); };
    const selectOnly = (id) => {
      app.pointer(null, 400, 250, 'Down', pointerType);
      app.pointer(null, 400, 250, 'Up', pointerType);
      tap(id);
    };
    const buttonText = (label) => app.nodes().find((node) => node.type === 'button' && text(node) === label);
    const pickMany = (list) => {
      if (buttonText(app.t('appendDone'))) buttonText(app.t('appendDone')).props.onClick();
      app.refresh();
      tap(list[0]);
      app.click(app.t('appendSelect'));
      for (const id of list.slice(1)) tap(id);
      app.click(app.t('appendDone'));
    };
    const rename = (value) => {
      app.click(app.t('alias'));
      app.find((node) => node.type === 'input' && node.props.type === 'text').props.ref.current.value = value;
      app.click(app.t('apply'));
    };
    try {
      app.add();
      const real = realStorage(storage);
      app.start();
      app.click(`${app.t('practiceOrganize')} · ${app.t('practiceStatus_not-started')} · 1/11`);
      assert.equal(app.step(), 'organize-name');
      assert.equal(board().objects.length, 2, 'catalogue entry supplies a pair without a previous frame');
      assert.ok(!coach().includes('practiceGoal_'), 'the goal is translated');
      const [first, second] = ids();
      tap(first); rename('');
      assert.equal(app.step(), 'organize-name', 'an empty name does not advance');
      tap(second); rename('Other');
      assert.equal(app.step(), 'organize-name', 'naming a different object does not advance');
      tap(first); rename('Team');
      assert.equal(app.step(), 'organize-reselect');
      assert.equal(board().objects.find((object) => object.id === first).alias, 'Team');
      tap(second);
      assert.equal(app.step(), 'organize-reselect', 'selecting the other object does not read the name back');
      tap(first);
      assert.equal(app.step(), 'organize-peer');
      tap(second); rename('Team');
      assert.equal(app.step(), 'organize-group');
      assert.ok(coach().includes(language === 'zh' ? '分组不是合并' : 'Grouping is not merging'));
      app.click(`${app.t('circle')} · ${app.t('value')} 1`);
      assert.equal(app.step(), 'organize-group', 'adding another object is not grouping');
      tap(first); app.click(app.t('makeGroup'));
      assert.equal(app.step(), 'organize-group', 'a one-member group does not pass');
      pickMany([first, second]); app.click(app.t('makeGroup'));
      assert.equal(app.step(), 'organize-group-name');
      rename(app.t('defaultGroup'));
      assert.equal(app.step(), 'organize-group-name', 'keeping the current group name does not pass');
      rename('Together');
      assert.equal(app.step(), 'organize-ungroup');
      assert.equal(board().groups.find((group) => group.alias === 'Together').alias, 'Together');
      app.click(app.t('ungroup'));
      assert.equal(app.step(), 'organize-merge');
      assert.ok(coach().includes(language === 'zh' ? '灰色结果不是错误' : 'gray result is not a mistake'));
      tap(second); rename('Other');
      pickMany(ids());
      const merge = app.find((node) => node.type === 'button' && text(node) === app.t('merge'));
      assert.equal(merge.props.disabled, true, 'different names disable merge');
      merge.props.onClick(); app.refresh();
      assert.equal(app.step(), 'organize-merge', 'a disabled merge does not advance');
      selectOnly(second); rename('Team');
      pickMany(ids()); app.click(app.t('merge'));
      assert.equal(app.step(), 'organize-split');
      const merged = board().objects.find((object) => object.sources.length === 2);
      assert.equal(merged.color, 9, 'an off-level total is gray, not a failed step');
      const extra = board().objects.find((object) => object.id !== merged.id);
      tap(extra.id);
      assert.equal(app.nodes().some((node) => node.type === 'button' && text(node) === app.t('split')), false);
      assert.equal(app.step(), 'organize-split', 'an object that cannot split does not advance');
      tap(merged.id); app.click(app.t('split'));
      assert.equal(app.step(), 'organize-copy');
      assert.equal(board().objects.find((object) => object.id === first).alias, 'Team', 'split restores the recorded name');
      const beforeCopy = board().objects.length;
      tap(second); app.click(app.t('copy'));
      assert.equal(app.step(), 'organize-copy', 'copying a different object does not pass');
      assert.equal(board().objects.length, beforeCopy + 1, 'the other copy is real, but it is not this step');
      tap(first); app.click(app.t('copy'));
      assert.equal(app.step(), 'organize-crossout');
      assert.equal(board().objects.length, beforeCopy + 2);
      assert.ok(board().objects.some((object) => object.id === first), 'the original stays');
      tap(second); app.click(app.t('crossOut'));
      assert.equal(app.step(), 'organize-crossout', 'crossing out another object does not pass');
      tap(first); app.click(app.t('crossOut'));
      assert.equal(app.step(), 'organize-delete');
      assert.equal(board().objects.find((object) => object.id === first).removed, true);
      assert.ok(board().objects.some((object) => object.id === first), 'cross-out leaves the object on the board');
      const other = board().objects.find((object) => object.id !== first);
      tap(other.id); app.click(app.t('trash'));
      assert.equal(app.step(), 'organize-delete', 'deleting a different object does not pass');
      app.click(app.t('clear')); app.click(app.t('cancel'));
      assert.equal(app.step(), 'organize-delete', 'cancelling a clear is not deleting the marked object');
      tap(first);
      assert.equal(app.step(), 'organize-delete', 'selecting the marked object is not deleting it');
      app.click(app.t('trash'));
      assert.equal(app.step(), 'complete');
      assert.ok(board().objects.every((object) => object.id !== first));
      assert.ok(board().objects.length > 0, 'the rest of the board stays');
      app.click(app.t('practiceExit'));
      assert.deepEqual(realStorage(storage), real, 'exit leaves the pre-seeded real draft unchanged');
      assert.equal(app.uploads, 0);
      app.dispose(); app = mount({ storage, chapters, language }); app.start();
      assert.equal(app.step(), 'complete', 'resume stays on this chapter');
      assert.deepEqual(realStorage(storage), real);
      app.click(app.t('practiceRetryChapter'));
      assert.equal(app.step(), 'organize-name');
      app.click(app.t('practiceSkipStep'));
      assert.equal(app.step(), 'organize-reselect');
      assert.ok(entry().goal.name.trim(), 'skip supplies the name the next step reads');
      app.click(app.t('practiceRetryStep', { step: 1 }));
      assert.equal(app.step(), 'organize-name');
      tap(ids()[0]); rename('Supplement');
      assert.equal(app.step(), 'organize-reselect', 'a finished supplement returns to the pending step');
      app.click(app.t('practiceReset'));
      assert.equal(app.step(), 'organize-reselect', 'reset keeps the supplemented position');
      app.click(app.t('practiceExit'));
      assert.deepEqual(realStorage(storage), real);
    } finally { app.dispose(); }
  });
}

for (const language of ['en', 'zh']) for (const pointerType of ['mouse', 'touch']) {
  test(`notes chapter real editor replay (${language}, ${pointerType}; not a browser replay)`, () => {
    const storage = new Map(), chapters = [createQuantityNotesChapter];
    const progressKey = 'baicai-edu-math-board:practice:v2:quantity';
    const entry = () => JSON.parse(storage.get(progressKey)).entries['quantity-notes'];
    const board = () => entry().frame.board;
    const ids = () => entry().goal.targets;
    let app = mount({ storage, chapters, language });
    const coach = () => text(app.find((node) => node.props['data-practice-step']));
    const tap = (id) => { app.pointer(id, 40, 40, 'Down', pointerType); app.pointer(id, 40, 40, 'Up', pointerType); };
    const clear = () => { app.pointer(null, 400, 250, 'Down', pointerType); app.pointer(null, 400, 250, 'Up', pointerType); };
    const buttonText = (label) => app.nodes().find((node) => node.type === 'button' && text(node) === label);
    const noteButton = () => app.find((node) => node.type === 'button' && String(node.props.className || '').includes('eb-note-button'));
    const openNote = () => { noteButton().props.onClick(); app.refresh(); };
    const saveNote = (value) => {
      openNote();
      app.find((node) => node.type === 'textarea').props.ref.current.value = value;
      app.click(app.t('save'));
    };
    const selectOnly = (id) => {
      const other = ids().find((item) => item !== id);
      if (buttonText(app.t('appendDone'))) { buttonText(app.t('appendDone')).props.onClick(); app.refresh(); }
      clear();
      tap(id);
      app.click(app.t('appendSelect'));
      tap(other);
      app.click(app.t('appendDone'));
    };
    const selectGroup = (id) => {
      clear();
      if (buttonText(app.t('appendDone'))) { buttonText(app.t('appendDone')).props.onClick(); app.refresh(); }
      tap(id);
    };
    const pickMany = (list) => {
      if (buttonText(app.t('appendDone'))) { buttonText(app.t('appendDone')).props.onClick(); app.refresh(); }
      clear();
      tap(list[0]);
      app.click(app.t('appendSelect'));
      for (const id of list.slice(1)) tap(id);
      app.click(app.t('appendDone'));
    };
    try {
      app.add();
      const real = realStorage(storage);
      app.start();
      app.click(`${app.t('practiceNotes')} · ${app.t('practiceStatus_not-started')} · 1/9`);
      assert.equal(app.step(), 'notes-deselect');
      assert.equal(board().objects.length, 2, 'catalogue entry supplies two objects and a group');
      assert.equal(board().groups.length, 1);
      assert.ok(entry().frame.selection.length > 0, 'the step does not start already cleared');
      assert.ok(!coach().includes('practiceGoal_'), 'the goal is translated');
      assert.match(coach(), language === 'zh' ? /自己的话/ : /your own words/i);
      clear();
      assert.equal(app.step(), 'notes-board');
      openNote();
      app.find((node) => node.type === 'textarea').props.ref.current.value = '';
      app.click(app.t('save'));
      assert.equal(app.step(), 'notes-board', 'an empty note does not advance');
      openNote();
      app.click(app.t('cancel'));
      assert.equal(app.step(), 'notes-board', 'cancel does not advance');
      app.click(`${app.t('circle')} · ${app.t('value')} 1`);
      const noteStamp = () => JSON.stringify({
        note: board().note,
        objects: board().objects.map((object) => [object.id, object.note]),
        groups: board().groups.map((group) => [group.id, group.note]),
        notes: board().notes,
      });
      const beforeStolen = noteStamp();
      saveNote('Stolen');
      assert.equal(app.step(), 'notes-board', 'a note on the automatically selected new object does not pass');
      assert.equal(board().note, '', 'add-then-note does not change the board note');
      const extra = board().objects.find((object) => !ids().includes(object.id));
      assert.equal(extra.note, '', 'add-then-note does not store an object note');
      assert.equal(noteStamp(), beforeStolen, 'object, group, and selection notes stay unchanged');
      openNote();
      app.find((node) => node.type === 'textarea').props.ref.current.value = '字'.repeat(501);
      app.click(app.t('save'));
      assert.equal(app.step(), 'notes-board', 'a rejected note does not advance');
      assert.equal(extra.note, '', 'the rejected text is not stored');
      assert.equal(noteStamp(), beforeStolen);
      clear();
      saveNote('Whole board');
      assert.equal(app.step(), 'notes-board-read');
      assert.equal(board().note, 'Whole board');
      openNote();
      assert.equal(app.find((node) => node.type === 'textarea').props.defaultValue, 'Whole board');
      assert.equal(app.step(), 'notes-object');
      app.click(app.t('cancel'));
      const [first, second] = ids();
      selectOnly(second);
      saveNote('Other');
      assert.equal(app.step(), 'notes-object', 'a note on the other object does not pass');
      selectOnly(first);
      saveNote('');
      assert.equal(app.step(), 'notes-object', 'an empty object note does not pass');
      saveNote('Just this one');
      assert.equal(app.step(), 'notes-object-check');
      assert.equal(board().objects.find((object) => object.id === first).note, 'Just this one');
      selectOnly(second);
      assert.equal(app.step(), 'notes-group');
      assert.notEqual(board().objects.find((object) => object.id === second).note, 'Just this one');
      selectOnly(first);
      saveNote('Member only');
      assert.equal(app.step(), 'notes-group', 'a member note is not the group note');
      selectGroup(first);
      saveNote('The group');
      assert.equal(app.step(), 'notes-group-read');
      assert.equal(board().groups.find((group) => group.id === entry().goal.groupId).note, 'The group');
      selectGroup(first);
      openNote();
      assert.equal(app.find((node) => node.type === 'textarea').props.defaultValue, 'The group');
      assert.equal(app.step(), 'notes-selection');
      app.click(app.t('cancel'));
      selectGroup(first);
      app.click(app.t('ungroup'));
      assert.equal(app.step(), 'notes-selection', 'dissolving the group is not the selection note');
      pickMany([first, extra.id]);
      saveNote('Different pair');
      assert.equal(app.step(), 'notes-selection', 'a different pair is not the marked set');
      pickMany(ids());
      saveNote('Both of them');
      assert.equal(app.step(), 'notes-selection-check');
      clear();
      openNote();
      assert.equal(app.find((node) => node.type === 'textarea').props.defaultValue, 'Whole board');
      assert.notEqual(app.find((node) => node.type === 'textarea').props.defaultValue, 'Both of them');
      assert.equal(app.step(), 'complete');
      assert.equal(board().notes.find((note) => note.text === 'Both of them').objectIds.length, 2);
      app.click(app.t('practiceExit'));
      assert.deepEqual(realStorage(storage), real, 'exit leaves the pre-seeded real draft unchanged');
      assert.equal(app.uploads, 0);
      app.dispose();
      app = mount({ storage, chapters, language });
      app.start();
      assert.equal(app.step(), 'complete', 'resume stays on this chapter');
      assert.deepEqual(realStorage(storage), real);
      app.click(app.t('practiceRetryChapter'));
      assert.equal(app.step(), 'notes-deselect');
      openNote();
      app.click(app.t('practiceReset'));
      assert.equal(app.step(), 'notes-deselect', 'reset from the note card stays on this step');
      assert.ok(entry().frame.selection.length > 0);
      openNote();
      app.click(app.t('practiceSkipStep'));
      assert.equal(app.step(), 'notes-board');
      assert.equal(board().note, '', 'skip does not write the board note for the student');
      openNote();
      app.click(app.t('practiceExit'));
      assert.deepEqual(realStorage(storage), real);
    } finally { app.dispose(); }
  });
}

test('explicit entry owns a separate practice board and blocks every real insert', () => {
  const app = mount();
  try {
    app.add();
    const real = realStorage(app.browser.storage);
    const staleRealAdd = app.find((n) => n.type === 'button' && n.props['aria-label'] === `${app.t('circle')} · ${app.t('value')} 1`).props.onClick;
    const staleRealInsert = app.find((n) => n.props['data-tour-id'] === 'quantity-insert').props.onClick;
    app.start();
    staleRealAdd(); staleRealInsert(); app.refresh();
    assert.deepEqual(realStorage(app.browser.storage), real, 'late real-page input is suspended during practice');
    assert.equal(app.objects().length, 0);
    assert.equal(app.step(), 'add');
    app.find((n) => n.props['data-tour-id'] === 'quantity-insert').props.onClick(); app.refresh();
    assert.equal(app.step(), 'add');
    app.add();
    assert.equal(app.step(), 'move');
    assert.equal(app.uploads, 0);
    assert.deepEqual(realStorage(app.browser.storage), real);
    app.click(app.t('practiceExit'));
    assert.equal(app.objects().length, 1);
    assert.deepEqual(realStorage(app.browser.storage), real);
  } finally { app.dispose(); }
});

function installFileDb(records) {
  const puts = [];
  const opens = [];
  const previous = globalThis.indexedDB;
  const later = (run) => queueMicrotask(run);
  globalThis.indexedDB = {
    open(name) {
      opens.push(name);
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
                put(value, key) {
                  puts.push(key);
                  records[key] = value;
                  later(() => { tx.oncomplete?.(); });
                },
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
  return { puts, opens, restore() { globalThis.indexedDB = previous; } };
}

for (const language of ['en', 'zh']) for (const pointerType of ['mouse', 'touch']) {
  test(`quantity file chapter replay (${language}, ${pointerType}; not a system file dialog)`, async () => {
    const G = createGeometryModel();
    let realWrites = 0;
    const realHandle = {
      name: 'real-quantity.json',
      queryPermission: async () => 'granted',
      requestPermission: async () => 'granted',
      createWritable: async () => { realWrites += 1; throw new Error('real handle written'); },
    };
    const db = installFileDb({ 'last-board-file': realHandle });
    const storage = new Map();
    const chapters = [createQuantityNotesChapter, createQuantityFilesChapter];
    let app = mount({ storage, chapters, language });
    const progressKey = 'baicai-edu-math-board:practice:v2:quantity';
    const entry = () => JSON.parse(storage.get(progressKey)).entries['quantity-files'];
    const toast = () => {
      const node = app.nodes().find((node) => node.props.className === 'eb-status-toast');
      return node ? text(node) : '';
    };
    const coach = () => text(app.find((node) => node.props['data-practice-step']));
    const practiceNode = (type) => app.all().find((node) => node.type === type && node.props['data-practice-file'] === 'quantity');
    let downloads = 0;
    let inputClicks = 0;
    const arm = () => {
      const anchor = practiceNode('a').props.ref.current;
      if (!anchor.armed) {
        const click = anchor.click.bind(anchor);
        anchor.click = () => { downloads += 1; click(); };
        anchor.armed = true;
      }
      const input = practiceNode('input').props.ref.current;
      if (!input.armed) {
        const click = input.click.bind(input);
        input.click = () => { inputClicks += 1; click(); };
        input.armed = true;
      }
    };
    const choose = async (label) => {
      if (!app.nodes().some((node) => String(node.props.className || '').includes('eb-more-menu'))) app.click(app.t('moreActions'));
      const item = app.find((node) => node.props.role === 'menuitem' && text(node) === label);
      await item.props.onClick({ pointerType, pointerId: 1, button: 0 });
      app.refresh();
    };
    try {
      app.add();
      for (let i = 0; i < 4; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
      app.refresh();
      const real = realStorage(storage);
      const opens = db.opens.length;
      app.click(app.t('moreActions'));
      assert.equal(text(app.find((node) => node.props.className === 'eb-menu-note')), 'real-quantity.json');
      app.click(app.t('moreActions'));
      app.start();
      let saveCalls = 0;
      window.showSaveFilePicker = async () => { saveCalls += 1; throw Object.assign(new Error('cancel'), { name: 'AbortError' }); };
      await choose(app.t('export'));
      assert.equal(saveCalls, 0, 'basics does not reach a file picker');
      assert.equal(toast(), app.t('practiceFilesUnavailable'));
      assert.equal(app.step(), 'add');
      app.click(`${app.t('practiceNotes')} · ${app.t('practiceStatus_not-started')} · 1/9`);
      await choose(app.t('export'));
      assert.equal(saveCalls, 0, 'notes does not reach a file picker');
      assert.equal(toast(), app.t('practiceFilesUnavailable'));
      app.click(`${app.t('quantityPracticeFiles')} · ${app.t('practiceStatus_not-started')} · ${app.t('practiceOptional')} · 1/2`);
      assert.equal(app.step(), 'files-save');
      assert.ok(coach().includes(app.t('practiceGoal_files-save')));
      assert.equal(entry().frame.trace.totalChanges, 0);
      arm();
      const anchor = practiceNode('a').props.ref.current;
      const wrapped = anchor.click;
      anchor.click = undefined;
      window.showSaveFilePicker = async () => undefined;
      await choose(app.t('export'));
      assert.equal(app.step(), 'files-save', 'no handle and no download click does not pass');
      assert.equal(downloads, 0);
      anchor.click = wrapped;
      window.showSaveFilePicker = async () => { throw Object.assign(new Error('cancel'), { name: 'AbortError' }); };
      await choose(app.t('export'));
      assert.equal(app.step(), 'files-save', 'picker cancel does not fall through to a download');
      assert.equal(downloads, 0);
      assert.notEqual(toast(), app.t('practiceFileSaved'));
      delete window.showSaveFilePicker;
      await choose(app.t('export'));
      assert.equal(downloads, 1);
      assert.equal(app.step(), 'files-open');
      assert.equal(entry().goal.via, 'download');
      assert.equal(toast(), app.t('practiceFileDownloaded'));
      assert.notEqual(toast(), app.t('fileDownloaded'));
      const savedText = entry().goal.text;
      assert.equal(JSON.parse(savedText).kind, 'math-board');
      assert.equal(await app.browser.exports.at(-1).text(), savedText);
      assert.equal(entry().frame.trace.totalChanges, 0);
      window.showOpenFilePicker = async () => [{ getFile: async () => ({ size: savedText.length, text: async () => savedText }) }];
      await choose(app.t('import'));
      assert.equal(app.step(), 'files-open', 'opening the unchanged practice board does not pass');
      const beforeAdd = entry().frame.board.objects.length;
      app.add();
      assert.equal(app.step(), 'files-open', 'adding an object is not the open');
      assert.equal(entry().frame.board.objects.length, beforeAdd + 1);
      const changed = JSON.stringify(entry().frame.board);
      let openOptions;
      window.showOpenFilePicker = async (options) => { openOptions = options; throw Object.assign(new Error('cancel'), { name: 'AbortError' }); };
      const clicksBefore = inputClicks;
      await choose(app.t('import'));
      assert.equal(app.step(), 'files-open');
      assert.equal(inputClicks, clicksBefore, 'cancel does not open the fallback input');
      assert.equal(openOptions.startIn, undefined);
      window.showOpenFilePicker = async () => [{ getFile: async () => ({ size: 1, text: async () => '{' }) }];
      await choose(app.t('import'));
      assert.equal(JSON.stringify(entry().frame.board), changed, 'invalid JSON keeps the practice board');
      const geometryFile = G.serialize(G.reduce(G.empty(), { type: 'addPoint', x: 200, y: 180 }));
      window.showOpenFilePicker = async () => [{ getFile: async () => ({ size: geometryFile.length, text: async () => geometryFile }) }];
      await choose(app.t('import'));
      assert.equal(JSON.stringify(entry().frame.board), changed, 'a geometry file is refused');
      assert.notEqual(toast(), app.t('practiceFileLoaded'));
      window.showOpenFilePicker = async () => [{ getFile: async () => ({ size: 262145, text: async () => savedText }) }];
      await choose(app.t('import'));
      assert.equal(toast(), app.t('fileTooLarge'));
      assert.equal(JSON.stringify(entry().frame.board), changed);
      window.showOpenFilePicker = async () => { throw Object.assign(new Error('denied'), { name: 'NotAllowedError' }); };
      await choose(app.t('import'));
      assert.equal(app.step(), 'files-open', 'permission denial alone does not pass');
      assert.equal(inputClicks, clicksBefore + 1);
      const input = practiceNode('input');
      await input.props.onChange({ target: { files: [], value: 'stale' } });
      app.refresh();
      assert.equal(app.step(), 'files-open', 'the fallback input without a file does not pass');
      const traceBeforeOpen = JSON.stringify(entry().frame.trace);
      await input.props.onChange({ target: { files: [{ size: savedText.length, text: async () => savedText }], value: 'picked' } });
      app.refresh();
      assert.equal(app.step(), 'files-complete');
      assert.equal(entry().goal.via, 'download', 'opening the download does not turn it into a verified disk save');
      assert.equal(entry().goal.text, savedText);
      assert.equal(M.serialize(entry().frame.board), savedText);
      assert.equal(JSON.stringify(entry().frame.trace), traceBeforeOpen, 'opening a file does not fill the trace');
      assert.equal(entry().frame.trace.entries.some((item) => item.type === 'import'), false);
      assert.equal(toast(), app.t('practiceFileLoaded'));
      app.click(app.t('practiceRetryChapter'));
      assert.equal(app.step(), 'files-save');
      app.click(app.t('practiceSkipStep'));
      assert.equal(app.step(), 'files-open');
      assert.equal(entry().goal.via, null, 'skip does not write a handle');
      assert.notEqual(M.serialize(entry().frame.board), entry().goal.text);
      app.click(app.t('practiceReset'));
      assert.equal(app.step(), 'files-open');
      app.click(app.t('practiceRetryStep', { step: 1 }));
      assert.equal(app.step(), 'files-save');
      app.click(app.t('practiceRetryChapter'));
      assert.equal(app.step(), 'files-save');
      let written = '';
      window.showSaveFilePicker = async () => ({
        name: 'practice.json',
        createWritable: async () => ({ write: async (value) => { written = value; }, close: async () => {} }),
      });
      await choose(app.t('export'));
      assert.equal(downloads, 1, 'a handle save does not also download');
      assert.equal(app.step(), 'files-open');
      assert.equal(entry().goal.via, 'handle');
      assert.equal(written, entry().goal.text);
      assert.equal(toast(), app.t('practiceFileSaved'));
      assert.notEqual(toast(), app.t('fileSaved'));
      app.click(app.t('moreActions'));
      assert.equal(app.nodes().some((node) => node.props.className === 'eb-menu-note'), false, 'practice save does not adopt a file name');
      app.click(app.t('moreActions'));
      const handleText = written;
      app.add();
      const traceBeforeHandleOpen = JSON.stringify(entry().frame.trace);
      window.showOpenFilePicker = async (options) => {
        openOptions = options;
        return [{ getFile: async () => ({ size: handleText.length, text: async () => handleText }) }];
      };
      await choose(app.t('import'));
      assert.equal(app.step(), 'files-complete');
      assert.equal(entry().goal.via, 'handle');
      assert.equal(openOptions.startIn, undefined, 'practice open does not start in the real handle');
      assert.equal(M.serialize(entry().frame.board), handleText);
      assert.equal(JSON.stringify(entry().frame.trace), traceBeforeHandleOpen, 'opening a file does not fill the trace');
      assert.equal(realWrites, 0);
      assert.equal(db.puts.length, 0);
      assert.equal(db.opens.length, opens);
      assert.equal(app.uploads, 0);
      app.click(app.t('practiceExit'));
      assert.deepEqual(realStorage(storage), real, 'exit leaves the real draft and trace');
      app.click(app.t('moreActions'));
      assert.equal(text(app.find((node) => node.props.className === 'eb-menu-note')), 'real-quantity.json');
      app.dispose();
      app = mount({ storage, chapters, language });
      app.start();
      assert.equal(app.step(), 'files-complete', 'resume stays on this chapter');
      app.click(app.t('practiceExit'));
      assert.deepEqual(realStorage(storage), real);
    } finally { app.dispose(); db.restore(); }
  });
}
