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
import { createPracticeProgress, createPracticeNavigation } from '../shell/practice-progress.js';
import { createHooks, installBrowser, text } from '../testing/test-harness.js';

const M = createBoardModel(), T = createBoardTrace(M);
const locales = {};
for (const language of ['en', 'zh']) locales[language] = JSON.parse(await readFile(new URL(`../../locale/${language}.json`, import.meta.url), 'utf8'));
const key = 'baicai-edu-math-board:v4:practice-test';
const realStorage = (storage) => new Map([...storage].filter(([name]) => !name.startsWith('baicai-edu-math-board:practice:')));
function mount(options = {}) {
  const browser = installBrowser(options);
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
  return { browser, refresh, nodes, find, click, t, get uploads() { return uploads; },
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
    app.click(app.t('practiceRetryStep', { step: 1 }));
    assert.equal(app.step(), 'add');
    assert.equal(app.objects().length, 0);
    app.add();
    assert.equal(app.step(), 'move');
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
