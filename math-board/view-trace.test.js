import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardView, createShapeArt } from './view.js';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { applyHostConfig } from './config-bridge.js';

const M = createBoardModel();
const T = createBoardTrace(M);
const locale = JSON.parse(await readFile(new URL('./locale/zh.json', import.meta.url), 'utf8'));
const t = (key, params = {}) => {
  assert.equal(typeof locale[key], 'string', `Missing locale key: ${key}`);
  return locale[key].replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(params, name) ? String(params[name]) : match);
};
const key = 'dsh-edu-math-board:v4:integration';
const traceKey = `${key}:trace-v1`;
const walk = (node) => !node || typeof node !== 'object' ? []
  : [node, ...(node.children || []).flat(Infinity).flatMap(walk)];
const text = (node) => typeof node === 'string' || typeof node === 'number' ? String(node)
  : node && typeof node === 'object' ? (node.children || []).flat(Infinity).map(text).join('') : '';

/** Stateful hooks with persistent refs, dependency-aware effects, and explicit rendering. */
function mount(options = {}) {
  const storage = options.storage || new Map();
  const old = { window: globalThis.window, navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator'), localStorage: globalThis.localStorage,
    createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL };
  globalThis.window = { matchMedia: () => ({ matches: true }), location: { hostname: '127.0.0.1' } };
  globalThis.document = { addEventListener() {}, removeEventListener() {} };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    locks: options.noLocks ? undefined : { request(_key, _options, task) {
      if (options.lockQueue) { options.lockQueue.push(task); return Promise.resolve(); }
      task(); return Promise.resolve();
    } },
  } });
  globalThis.localStorage = { getItem: (name) => storage.get(name) ?? null,
    setItem: (name, value) => {
      if (options.storageFail?.(name)) throw new Error('Quota exceeded');
      storage.set(name, String(value));
    } };
  const slots = []; const dom = new Map(); const effects = [];
  let cursor = 0; let dirty = false; let tree; let config = options.config || null; let clear = options.clear || null;
  const exports = []; const files = []; const batches = []; const attached = new Set();
  const removed = []; const released = []; const inserted = []; let persisted = 0; let sent = 0;
  URL.createObjectURL = (blob) => { exports.push(blob); return `blob:test-${exports.length}`; };
  URL.revokeObjectURL = () => {};
  const React = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useSyncExternalStore() {},
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[index].value, (next) => {
        const value = typeof next === 'function' ? next(slots[index].value) : next;
        if (!Object.is(value, slots[index].value)) { slots[index].value = value; dirty = true; }
      }];
    },
    useRef(current) { const index = cursor++; return slots[index] ||= { current }; },
    useEffect(callback, deps) {
      const index = cursor++; const previous = slots[index];
      if (!previous || !deps || deps.some((v, i) => !Object.is(v, previous.deps?.[i]))) {
        effects.push(() => { previous?.cleanup?.(); slots[index] = { deps, cleanup: callback() }; });
      }
    },
  };
  const inputActions = {
    captureInsertion: () => ({ offset: 17 }),
    addAttachments(ids) { ids.forEach((id) => attached.add(id)); return options.fail !== 'addAttachments'; },
    removeAttachment(id) { removed.push(id); attached.delete(id); },
    insertText(value, span) { inserted.push({ value, span }); return options.fail !== 'insertText'; },
    persistDraft() { persisted++; },
    send() { sent++; },
  };
  const conversation = {
    createDrafts(sessionId, snapshots) {
      assert.equal(sessionId, 'integration');
      const drafts = snapshots.map((file) => { files.push(file); return { id: `draft-${files.length}`, file }; });
      batches.push(drafts); return drafts;
    },
    releaseDraftAttachment(id) { released.push(id); },
    send() { sent++; },
  };
  const ctx = { locale: { subscribe: () => () => {}, getSnapshot: () => 'zh' },
    get: (name) => { assert.equal(name, 'conversation'); return conversation; } };
  const Board = createBoardView(React, M, ctx, t, '', createShapeArt(React), applyHostConfig, T);
  const props = { sessionId: 'integration', useProjection: (name) => name === 'eduBoardClear' ? clear : config, useInput: () => 'plain', inputActions };
  function render() {
    cursor = 0; dirty = false; tree = Board(props);
    for (const node of walk(tree)) if (node.props.ref && typeof node.props.ref === 'object') {
      const ref = node.props.ref;
      if (!dom.has(ref)) dom.set(ref, { open: false, ownerDocument: { activeElement: null },
        showModal() { this.open = true; }, close() { this.open = false; }, contains: () => false,
        focus() {}, select() {}, click() {}, href: '' });
      ref.current = dom.get(ref);
    }
    effects.splice(0).forEach((effect) => effect());
    return tree;
  }
  function refresh() {
    let iterations = 0;
    do { render(); assert.ok(++iterations < 20, 'Effects should settle'); } while (dirty);
  }
  function find(predicate) {
    const matches = walk(tree).filter(predicate);
    assert.equal(matches.length, 1, `Expected exactly one matching view node; found ${matches.length}`);
    return matches[0];
  }
  const button = (label) => find((node) => node.type === 'button'
    && (node.props['aria-label'] === label || text(node) === label));
  const api = {
    storage, inputActions, files, batches, attached, removed, released, inserted, exports,
    get persisted() { return persisted; }, get sent() { return sent; },
    render, refresh, button, find,
    click(label) { const node = button(label); assert.ok(!node.props.disabled, `${label} should be enabled`); const result = node.props.onClick(); refresh(); return result; },
    add(shape = 'circle') {
      const node = find((candidate) => candidate.type === 'button'
        && String(candidate.props['aria-label'] || '').startsWith(`${t(shape)} ·`));
      assert.ok(!node.props.disabled, `${shape} should be enabled`);
      node.props.onClick(); refresh();
    },
    clearSelection() {
      const svg = find((node) => node.props.className === 'eb-artboard');
      const node = svg.props.ref.current;
      node.createSVGPoint = () => ({ matrixTransform: () => ({ x: 400, y: 200 }) });
      node.getScreenCTM = () => ({ inverse: () => ({}) });
      svg.props.onPointerDown({ button: 0, clientX: 0, clientY: 0, pointerId: 1, shiftKey: false,
        target: { closest: () => null }, preventDefault() {}, currentTarget: { setPointerCapture() {} } });
      svg.props.onPointerUp({ pointerId: 1 });
      refresh();
    },
    note(value) {
      find((node) => node.type === 'button' && String(node.props.className || '').includes('eb-note-button')).props.onClick(); refresh();
      const area = find((node) => node.type === 'textarea');
      area.props.ref.current.value = value;
      this.click(t('save'));
    },
    openMore() {
      const labels = () => walk(tree).filter((node) => node.type === 'label' && text(node) === t('traceAttach'));
      if (labels().length === 1) return;
      find((node) => node.type === 'button' && node.props['aria-label'] === t('moreActions')).props.onClick(); refresh();
      assert.equal(labels().length, 1, 'More menu should open');
    },
    attach(value) {
      this.openMore();
      const label = find((node) => node.type === 'label' && text(node) === t('traceAttach'));
      walk(label).find((node) => node.type === 'input').props.onChange({ target: { checked: value } }); refresh();
    },
    get attachChecked() {
      this.openMore();
      const label = find((node) => node.type === 'label' && text(node) === t('traceAttach'));
      return walk(label).find((node) => node.type === 'input').props.checked;
    },
    board: () => M.validate(JSON.parse(storage.get(key))),
    trace: () => T.validate(JSON.parse(storage.get(traceKey)).trace),
    setConfig(next) { config = next; refresh(); },
    setClear(next) { clear = next; refresh(); },
    unmount() {
      for (const slot of slots) slot?.cleanup?.();
      globalThis.window = old.window; globalThis.localStorage = old.localStorage;
      delete globalThis.document;
      if (old.navigator) Object.defineProperty(globalThis, 'navigator', old.navigator);
      else delete globalThis.navigator;
      URL.createObjectURL = old.createObjectURL; URL.revokeObjectURL = old.revokeObjectURL;
    },
  };
  try { refresh(); } catch (error) { api.unmount(); throw error; }
  return api;
}

function withMount(options, run) {
  const board = mount(options);
  try { return run(board); } finally { board.unmount(); }
}

test('draft and trace sidecar restore across mounts, including attachment preference', () => {
  const storage = new Map(); let expectedBoard; let expectedTrace;
  withMount({ storage }, (h) => {
    h.add(); h.clearSelection(); h.note('Two steps in my attempt'); h.attach(false);
    expectedBoard = h.board(); expectedTrace = h.trace();
    assert.equal(expectedTrace.totalChanges, 2); assert.equal(expectedTrace.priorUnknown, false);
  });
  withMount({ storage }, (h) => {
    assert.deepEqual(h.board(), expectedBoard); assert.deepEqual(h.trace(), expectedTrace);
    assert.equal(h.attachChecked, false);
    h.add(); assert.equal(h.trace().totalChanges, 3);
  });
});

test('a genuine nineteen-pattern v3 local draft migrates without hiding its objects', () => {
  const old = M.reduce(M.empty(), { type: 'add', shape: 'cat' });
  old.schemaVersion = 3;
  delete old.notes;
  for (const object of old.objects) delete object.note;
  old.settings.defaults = old.settings.defaults.filter((entry) => entry.shape !== 'rectangle');
  old.settings.shapes = ['cat', 'circle'];
  const storage = new Map([['dsh-edu-math-board:v3:integration', JSON.stringify(old)]]);
  withMount({ storage }, (h) => {
    assert.equal(h.board().schemaVersion, 4);
    assert.equal(h.board().objects.length, 1);
    assert.equal(h.board().objects[0].shape, 'cat');
    assert.equal(h.board().settings.defaults.length, 20);
    assert.deepEqual(h.board().settings.shapes, ['cat', 'circle']);
    assert.equal(h.trace().priorUnknown, true);
    h.add('cat');
    assert.equal(h.board().objects.length, 2);
  });
});

test('old draft without a trace restores the board and explicitly marks unknown prior work', () => {
  const draft = M.reduce(M.empty(), { type: 'add', shape: 'cat', count: 2 });
  for (const draftKey of [key, 'dsh-edu-math-board:v3:integration', 'dsh-edu-math-board:v2:integration']) {
    withMount({ storage: new Map([[draftKey, JSON.stringify(draft)]]) }, (h) => {
      assert.deepEqual(h.board(), draft); assert.deepEqual(h.trace(), T.empty(true));
    });
  }
});

test('mismatched and corrupt trace sidecars never discard a valid board draft', () => {
  const draft = M.reduce(M.empty(), { type: 'add', shape: 'square', count: 3 });
  const badSidecars = ['{invalid', JSON.stringify({ board: JSON.stringify(M.empty()), trace: T.empty() }),
    JSON.stringify({ board: JSON.stringify(draft), trace: { ...T.empty(), totalChanges: 42 } })];
  for (const sidecar of badSidecars) {
    withMount({ storage: new Map([[key, JSON.stringify(draft)], [traceKey, sidecar]]) }, (h) => {
      assert.deepEqual(h.board(), draft); assert.deepEqual(h.trace(), T.empty(true));
    });
  }
});

test('clear wipes the canvas and the process record, and the next task starts fresh', () => {
  withMount({}, (h) => {
    h.add(); h.clearSelection(); h.note('An initial idea');
    h.click(t('clear')); h.click(t('cancel'));
    assert.equal(h.board().objects.length, 1); assert.equal(h.trace().totalChanges, 2);
    h.click(t('clear')); h.click(t('confirmClear'));
    assert.deepEqual(h.board(), M.empty()); assert.deepEqual(h.trace(), T.empty());
    assert.equal(h.button(t('undo')).props.disabled, true);
    assert.equal(h.button(t('insert')).props.disabled, true);
    h.find((node) => node.props.role === 'status' && text(node) === t('clearDone'));
    h.add();
    assert.equal(h.board().objects.length, 1);
    assert.equal(h.trace().totalChanges, 1); assert.equal(h.trace().priorUnknown, false);
    assert.equal(h.trace().entries[0].type, 'add');
  });
});

test('host task clear is atomic, preserves settings and attachments, and cannot be undone or replayed', async (context) => {
  let now = 1000;
  context.mock.method(Date, 'now', () => now);
  const storage = new Map();
  const request = { revision: 1, requestId: 'clear-1', requestedAt: 2000 };
  const h = mount({ storage });
  try {
    h.add(); h.note('old object explanation'); h.clearSelection(); h.note('old task');
    h.click(t('insert'));
    const attachments = [...h.attached];
    const settings = h.board().settings;
    now = 2001; h.setClear(request);
    assert.equal(h.board().objects.length, 0);
    assert.equal(h.board().note, ''); assert.deepEqual(h.trace(), T.empty());
    assert.deepEqual(h.board().settings, settings);
    assert.deepEqual([...h.attached], attachments); assert.equal(h.sent, 0);
    assert.equal(h.button(t('undo')).props.disabled, true);
    assert.equal(h.find(node => node.type === 'dialog').props.ref.current.open, false);
    h.add(); h.setClear({ ...request });
    assert.equal(h.board().objects.length, 1, 'same request never erases later work');
    assert.equal(h.trace().totalChanges, 1);
  } finally { h.unmount(); }
  withMount({ storage, clear: request }, h => {
    assert.equal(h.board().objects.length, 1, 'refresh preserves work after the reset');
    assert.equal(h.trace().totalChanges, 1);
  });
});

test('a reset received while unmounted applies before editing and only once', (context) => {
  context.mock.method(Date, 'now', () => 3000);
  const storage = new Map([[key, M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'cat' }))]]);
  const request = { revision: 2, requestId: 'closed-clear', requestedAt: 2000 };
  withMount({ storage, clear: request }, h => {
    assert.equal(h.board().objects.length, 0);
    h.add(); assert.equal(h.board().objects.length, 1);
  });
  withMount({ storage, clear: request }, h => assert.equal(h.board().objects.length, 1));
});

test('the task-clear notice waits in the workbench until the student actually opens it', (context) => {
  let now = 1000;
  context.mock.method(Date, 'now', () => now);
  withMount({}, (h) => {
    h.add();
    now = 2000;
    h.setClear({ revision: 1, requestId: 'notice', requestedAt: 2000 });
    assert.equal(h.board().objects.length, 0);
    h.find(node => node.props.role === 'status' && text(node) === t('autoClearDone'));
    h.click(t('title'));
    h.find(node => node.props.role === 'status' && text(node) === t('autoClearDone'));
    h.click(t('backToChat'));
    assert.equal(walk(h.find(node => node.props.className === 'eb-workbench'))
      .some(node => node.props.role === 'status'), false, 'the seen notice does not linger');
  });
});

test('late and out-of-order resets preserve newer edits, including edits across refresh', (context) => {
  context.mock.method(Date, 'now', () => 4000);
  const storage = new Map();
  withMount({ storage }, h => h.add());
  withMount({ storage }, h => {
    h.setClear({ revision: 2, requestId: 'late', requestedAt: 3000 });
    assert.equal(h.board().objects.length, 1);
    h.find(node => node.props.role === 'status' && text(node) === t('autoClearSkipped'));
    h.setClear({ revision: 1, requestId: 'older', requestedAt: 2000 });
    assert.equal(h.board().objects.length, 1);
  });
});

test('quota failure never clears in-memory work or persists a successful reset marker', (context) => {
  let fail = false;
  context.mock.method(Date, 'now', () => 6000);
  withMount({ storageFail: name => fail && name === `${key}:clear-v1` }, h => {
    h.add(); const before = h.board();
    fail = true;
    h.setClear({ revision: 1, requestId: 'quota', requestedAt: 5999 });
    assert.deepEqual(h.board(), before);
    assert.equal(JSON.parse(h.storage.get(`${key}:clear-v1`)).revision, 0);
    h.find(node => node.props.role === 'status' && text(node) === t('autoClearError'));
    fail = false;
    h.click(t('clear')); h.click(t('confirmClear'));
    h.add(); assert.equal(h.board().objects.length, 1, 'manual recovery unblocks editing');
  });
});

test('an atomic reset envelope wins over a stale legacy canvas after interrupted mirroring', (context) => {
  context.mock.method(Date, 'now', () => 8000);
  const old = M.reduce(M.empty(), { type: 'add', shape: 'cat' });
  const storage = new Map([[key, M.serialize(old)], [`${key}:clear-v1`, JSON.stringify({
    revision: 1, requestId: 'atomic', lastEditAt: 0, board: M.empty(), trace: T.empty(), attach: false,
  })]]);
  withMount({ storage, clear: { revision: 1, requestId: 'atomic', requestedAt: 7000 } }, h => {
    assert.equal(h.board().objects.length, 0); assert.deepEqual(h.trace(), T.empty());
    assert.equal(h.attachChecked, false);
  });
});

test('missing browser locks fails safe and manual clear remains available', (context) => {
  context.mock.method(Date, 'now', () => 9000);
  const old = M.reduce(M.empty(), { type: 'add', shape: 'cat' });
  withMount({ noLocks: true, storage: new Map([[key, M.serialize(old)]]),
    clear: { revision: 1, requestId: 'unsupported', requestedAt: 8000 } }, h => {
    assert.equal(h.board().objects.length, 1);
    h.find(node => node.props.role === 'status' && text(node) === t('autoClearError'));
    h.click(t('clear')); h.click(t('confirmClear'));
    assert.equal(h.board().objects.length, 0);
  });
});

test('a selection-only click does not lose a queued draft save across remount', () => {
  const storage = new Map();
  const lockQueue = [];
  withMount({ storage, lockQueue }, h => {
    while (lockQueue.length) { lockQueue.shift()(); h.refresh(); }
    h.add('cat');
    h.clearSelection();
    while (lockQueue.length) { lockQueue.shift()(); h.refresh(); }
  });
  withMount({ storage }, h => {
    h.find(node => node.props['data-object'] && node.props['aria-label'].startsWith(t('cat')));
    assert.equal(h.trace().totalChanges, 1);
  });
});

test('cancelling a file picker does not lose a queued draft save across remount', async () => {
  const storage = new Map();
  const lockQueue = [];
  const h = mount({ storage, lockQueue });
  try {
    while (lockQueue.length) { lockQueue.shift()(); h.refresh(); }
    h.add('cat');
    window.showOpenFilePicker = async () => { throw new DOMException('Cancelled', 'AbortError'); };
    h.openMore(); await h.click(t('import'));
    while (lockQueue.length) { lockQueue.shift()(); h.refresh(); }
  } finally { h.unmount(); }
  withMount({ storage }, restored => {
    restored.find(node => node.props['data-object'] && node.props['aria-label'].startsWith(t('cat')));
    assert.equal(restored.trace().totalChanges, 1);
  });
});

test('a queued clear rechecks the latest draft inside its lock instead of overwriting a newer save', (context) => {
  context.mock.method(Date, 'now', () => 15000);
  const options = {};
  const h = mount(options);
  try {
    h.add();
    options.lockQueue = [];
    h.setClear({ revision: 1, requestId: 'queued', requestedAt: 14000 });
    const saved = JSON.parse(h.storage.get(`${key}:clear-v1`));
    const newer = M.reduce(saved.board, { type: 'add', shape: 'cat' });
    h.storage.set(`${key}:clear-v1`, JSON.stringify({ ...saved, board: newer, lastEditAt: 16000 }));
    while (options.lockQueue.length) { options.lockQueue.shift()(); h.refresh(); }
    assert.equal(JSON.parse(h.storage.get(`${key}:clear-v1`)).board.objects.length, 2);
    assert.equal(JSON.parse(h.storage.get(`${key}:clear-v1`)).revision, 1);
    h.find(node => node.props.role === 'status' && text(node) === t('autoClearSkipped'));
  } finally { h.unmount(); }
});

test('remote-host clocks are not treated as authorization to erase local edits', (context) => {
  context.mock.method(Date, 'now', () => 20000);
  withMount({}, h => {
    h.add();
    window.location.hostname = 'example.com';
    h.setClear({ revision: 1, requestId: 'remote', requestedAt: 19000 });
    assert.equal(h.board().objects.length, 1);
    h.find(node => node.props.role === 'status' && text(node) === t('autoClearError'));
  });
});

test('explicit clear repairs a corrupt atomic envelope and survives remount', () => {
  const storage = new Map([[`${key}:clear-v1`, '{broken']]);
  withMount({ storage }, h => {
    h.click(t('clear')); h.click(t('confirmClear')); h.add();
    assert.equal(h.board().objects.length, 1);
    assert.equal(JSON.parse(storage.get(`${key}:clear-v1`)).board.objects.length, 1);
  });
  withMount({ storage }, h => assert.equal(h.board().objects.length, 1));
});

test('a picker opened on the old task cannot import after a task clear', async (context) => {
  let now = 10000;
  context.mock.method(Date, 'now', () => now);
  const h = mount();
  try {
    h.add();
    let resolveFile;
    window.showOpenFilePicker = async () => [{ getFile: () => new Promise(resolve => { resolveFile = resolve; }) }];
    h.openMore();
    const opening = h.click(t('import'));
    await Promise.resolve();
    now = 12000; h.setClear({ revision: 1, requestId: 'during-picker', requestedAt: 11000 });
    resolveFile(new File([M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'cat' }))], 'old.json'));
    await opening; h.refresh();
    assert.equal(h.board().objects.length, 0);
    assert.deepEqual(h.trace(), T.empty());
  } finally { h.unmount(); }
});

test('a fallback picker opened on the old task cannot restore it after a task clear', async (context) => {
  let now = 10000;
  context.mock.method(Date, 'now', () => now);
  for (const denied of [false, true]) {
    const storage = new Map();
    const h = mount({ storage });
    try {
      h.add();
      if (denied) window.showOpenFilePicker = async () => { throw new DOMException('Denied', 'NotAllowedError'); };
      h.openMore();
      await h.click(t('import'));
      now = 12000;
      h.setClear({ revision: 1, requestId: 'during-fallback-picker', requestedAt: 11000 });
      const input = h.find(node => node.type === 'input' && node.props.type === 'file');
      await input.props.onChange({ target: { value: '', files: [
        new File([M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'cat' }))], 'old.json'),
      ] } });
      h.refresh();
      assert.equal(h.board().objects.length, 0);
      assert.deepEqual(h.trace(), T.empty());
      assert.equal(h.button(t('undo')).props.disabled, true);
    } finally { h.unmount(); }
    withMount({ storage }, restored => {
      assert.equal(walk(restored.render()).filter(node => node.props['data-object']).length, 0);
      assert.deepEqual(restored.trace(), T.empty());
    });
    now = 10000;
  }
});

test('undo and redo append semantic facts instead of replacing the trace with snapshot history', () => {
  withMount({}, (h) => {
    h.add(); h.add(); h.click(t('undo')); h.click(t('redo'));
    const trace = h.trace(); assert.equal(trace.totalChanges, 4); assert.equal(h.board().objects.length, 2);
    assert.deepEqual(trace.entries.map((entry) => entry.type), ['add', 'add', 'undo', 'redo']);
    assert.deepEqual(trace.entries[2].facts.find((fact) => fact.field === 'count'), { field: 'count', before: 2, after: 1 });
    assert.deepEqual(trace.entries[3].facts.find((fact) => fact.field === 'count'), { field: 'count', before: 1, after: 2 });
  });
});

test('each host configuration callback records explicit system origin and actual transition', () => {
  withMount({}, (h) => {
    h.add();
    const first = M.defaultSettings(); first.defaults[0].alias = 'apple';
    const second = M.validateSettings(first); second.defaults[0].value = 10;
    h.setConfig({ revision: 2, floorRevision: 0, settings: second, changes: [
      { seq: 11, revision: 1, settings: first, scope: 'future' },
      { seq: 12, revision: 2, settings: second, scope: 'existing' },
    ] });
    const trace = h.trace(); assert.equal(trace.totalChanges, 3);
    assert.deepEqual(trace.entries.slice(1).map((entry) => [entry.type, entry.origin]), [['configure', 'system'], ['configure', 'system']]);
    assert.deepEqual(trace.entries[2].facts.find((fact) => fact.field === 'value'), { field: 'value', before: 1, after: 10 });
    assert.equal(h.board().objects[0].value, 10);
    h.refresh(); assert.equal(h.trace().totalChanges, 3, 'Effect rerender must not replay a configuration');
  });
});

test('insertion makes independent File snapshots, optional trace follows checkbox, and never sends', async () => {
  const h = mount();
  try {
    h.add(); h.attach(false); h.click(t('insert'));
    assert.equal(h.batches[0].length, 1); assert.ok(h.files[0] instanceof File);
    const snapshotText = await h.files[0].text(); const snapshot = JSON.parse(snapshotText);
    assert.equal(snapshot.kind, 'math-board'); assert.equal(snapshot.objects.length, 1);
    assert.equal(Object.hasOwn(snapshot, 'trace'), false);
    assert.equal(Object.hasOwn(snapshot, 'entries'), false);
    assert.equal(h.board().objects.length, 1); assert.equal(h.trace().totalChanges, 1);
    h.add(); h.attach(true); h.click(t('insert'));
    assert.equal(h.batches[1].length, 2);
    const boardSnapshot = JSON.parse(await h.files[1].text());
    const traceSnapshot = T.validate(JSON.parse(await h.files[2].text()));
    assert.equal(boardSnapshot.objects.length, 2); assert.equal(traceSnapshot.totalChanges, 2);
    assert.equal(h.board().objects.length, 2); assert.equal(h.trace().totalChanges, 2);
    assert.equal(h.files[2].name, t('traceAttachmentName')); assert.equal(h.files[2].type, 'application/json');
    h.add(); assert.equal(await h.files[0].text(), snapshotText);
    assert.equal(T.validate(JSON.parse(await h.files[2].text())).totalChanges, 2);
    assert.equal(h.trace().totalChanges, 3);
    assert.equal(h.persisted, 2); assert.equal(h.inserted.length, 0); assert.equal(h.sent, 0);
    h.clearSelection(); h.note('两只小猫在一起'); h.click(t('insert'));
    assert.equal(h.inserted.length, 1);
    assert.equal(h.inserted[0].value, '\n两只小猫在一起\n');
    assert.equal(/我在数学画板上摆好了|没圈组|划去的/.test(h.inserted[0].value), false);
    assert.deepEqual(h.inserted[0].span, { offset: 17 });
    assert.equal(h.board().objects.length, 3); assert.equal(h.board().note, '两只小猫在一起');
    assert.equal(h.trace().totalChanges, 4);
  } finally { h.unmount(); }
});

test('optional trace can be removed through normal attachment API without changing the board attachment', async () => {
  const h = mount();
  try {
    h.add(); h.click(t('insert'));
    const [boardDraft, traceDraft] = h.batches[0];
    const snapshotText = await h.files[0].text();
    h.inputActions.removeAttachment(traceDraft.id);
    assert.deepEqual([...h.attached], [boardDraft.id]);
    assert.deepEqual(h.removed, [traceDraft.id]);
    assert.equal(await h.files[0].text(), snapshotText);
    assert.equal(JSON.parse(snapshotText).objects.length, 1);
    assert.equal(h.board().objects.length, 1);
    assert.equal(h.trace().totalChanges, 1);
    assert.equal(h.sent, 0);
  } finally { h.unmount(); }
});

test('failed attachment addition or text insertion rolls back both drafts via normal APIs', () => {
  withMount({ fail: 'addAttachments' }, (h) => {
    h.add(); h.click(t('insert')); const ids = h.batches[0].map((draft) => draft.id);
    assert.equal(ids.length, 2); assert.deepEqual(h.removed, ids); assert.deepEqual(h.released, ids);
    assert.equal(h.attached.size, 0); assert.equal(h.persisted, 0); assert.equal(h.sent, 0);
    assert.equal(h.board().objects.length, 1); assert.equal(h.trace().totalChanges, 1);
    h.find((node) => node.props.role === 'status' && text(node) === t('insertFailed'));
  });
  withMount({ fail: 'insertText' }, (h) => {
    h.add(); h.clearSelection(); h.note('keep my words'); h.click(t('insert')); const ids = h.batches[0].map((draft) => draft.id);
    assert.equal(ids.length, 2); assert.deepEqual(h.removed, ids); assert.deepEqual(h.released, ids);
    assert.equal(h.attached.size, 0); assert.equal(h.persisted, 0); assert.equal(h.sent, 0);
    assert.equal(h.board().objects.length, 1); assert.equal(h.trace().totalChanges, 2);
    h.find((node) => node.props.role === 'status' && text(node) === t('insertFailed'));
  });
});

test('a failed draft write keeps the settings watermark behind the applied board', () => {
  const storage = new Map(); let failing = false;
  withMount({ storage, storageFail: (name) => failing && name === key }, (h) => {
    h.add();
    const settings = M.defaultSettings(); settings.defaults[0].alias = 'apple';
    failing = true;
    h.setConfig({ revision: 1, floorRevision: 0, settings: M.validateSettings(settings), changes: [
      { seq: 1, revision: 1, settings: M.validateSettings(settings), scope: 'future' },
    ] });
    assert.equal(storage.has(`${key}:config`), false, 'A failed draft write must not advance the watermark');
    assert.equal(h.board().settings.defaults[0].alias, '', 'The persisted draft stays at its last successful write');
    failing = false; h.add();
    assert.equal(Number(storage.get(`${key}:config`)), 1, 'The next successful write advances the watermark');
    assert.equal(h.board().settings.defaults[0].alias, 'apple', 'The applied settings reach the persisted draft with it');
  });
});

test('opening a board identical to the current one only marks earlier process unknown', async () => {
  const h = mount();
  try {
    h.add(); h.clearSelection(); h.note('Same content');
    const before = h.trace(); const boardBefore = h.board();
    h.openMore(); await h.click(t('import'));
    const input = h.find((node) => node.type === 'input' && node.props.type === 'file');
    await input.props.onChange({ target: {
      files: [new File([M.serialize(boardBefore)], 'same.json', { type: 'application/json' })], value: '',
    } });
    h.refresh();
    assert.deepEqual(h.board(), boardBefore);
    assert.equal(h.trace().priorUnknown, true);
    assert.deepEqual(h.trace().entries, before.entries);
    assert.equal(h.trace().totalChanges, before.totalChanges);
  } finally { h.unmount(); }
});

function armSvg(h, map = (x, y) => ({ x, y })) {
  const svg = h.find((node) => node.props.className === 'eb-artboard');
  const node = svg.props.ref.current;
  node.createSVGPoint = () => {
    const point = { matrixTransform() { return map(this.x, this.y); } };
    return point;
  };
  node.getScreenCTM = () => ({ inverse() { return {}; } });
  return svg;
}
function pointerAt(h, objectId, init = {}) {
  const svg = armSvg(h);
  const target = { closest: (selector) => selector === '[data-object]' && objectId
    ? { getAttribute: () => objectId } : null };
  svg.props.onPointerDown({
    button: 0, clientX: init.x ?? 30, clientY: init.y ?? 30, pointerId: 1,
    shiftKey: false, target, preventDefault() {}, currentTarget: { setPointerCapture() {} }, ...init,
  });
  h.refresh();
}
const toolbarText = (h) => {
  const bars = walk(h.find((node) => node.props.className === 'eb-workbench')).filter((node) => node.props.role === 'toolbar');
  assert.equal(bars.length, 1);
  return text(bars[0]);
};

test('undo and redo keep a host settings sync instead of restoring the earlier snapshot settings', () => {
  const settings = M.validateSettings({ ...M.defaultSettings(), defaults: M.defaultSettings().defaults.map((entry) => entry.shape === 'circle' ? { ...entry, value: 10 } : entry) });
  const config = { revision: 1, floorRevision: 0, settings, changes: [
    { seq: 1, revision: 1, settings, scope: 'existing' },
  ] };
  withMount({}, (h) => {
    h.add();
    h.setConfig(config);
    h.click(t('undo'));
    assert.equal(h.board().objects.length, 0);
    assert.equal(h.board().settings.defaults[0].value, 10);
    h.click(t('redo'));
    assert.equal(h.board().objects[0].value, 10);
    assert.equal(h.board().settings.defaults[0].value, 10);
    assert.equal(Number(h.storage.get(`${key}:config`)), 1);
  });
  withMount({}, (h) => {
    h.add(); h.click(t('undo'));
    h.setConfig(config);
    h.click(t('redo'));
    assert.equal(h.board().objects[0].value, 10);
    assert.equal(h.board().settings.defaults[0].value, 10);
  });
});

test('a partial or extended group selection can regroup, and a full group can dissolve', () => {
  let board = M.reduce(M.empty(), { type: 'add', shape: 'circle', count: 3 });
  board = M.reduce(board, { type: 'groupSelected', ids: ['object-1', 'object-2'], alias: '小猫队' });
  withMount({ storage: new Map([[key, JSON.stringify(board)]]) }, (h) => {
    pointerAt(h, 'object-1');
    assert.match(toolbarText(h), /解散组/);
    assert.equal(toolbarText(h).includes(t('makeGroup')), false);
    pointerAt(h, 'object-3', { shiftKey: true });
    assert.match(toolbarText(h), /圈为一组/);
    h.click(t('makeGroup'));
    assert.equal(h.board().groups.length, 1);
    assert.equal(h.board().groups[0].alias, '小猫队');
    assert.ok(h.board().objects.every((item) => item.groupId === h.board().groups[0].id));
    pointerAt(h, 'object-1');
    pointerAt(h, 'object-1', { shiftKey: true });
    h.click(t('makeGroup'));
    const released = h.board().objects.find((item) => item.id === 'object-1');
    const kept = h.board().objects.filter((item) => item.id !== 'object-1');
    assert.equal(released.groupId, null);
    assert.ok(kept.every((item) => item.groupId && item.groupId !== released.groupId));
  });
});

test('regroup stays available at the group cap when the selection dissolves an existing group', () => {
  let board = M.reduce(M.empty(), { type: 'add', shape: 'circle', count: 13 });
  for (let i = 0; i < 12; i++) board = M.reduce(board, { type: 'groupSelected', ids: [`object-${i + 1}`], alias: `组${i}` });
  withMount({ storage: new Map([[key, JSON.stringify(board)]]) }, (h) => {
    pointerAt(h, 'object-1');
    pointerAt(h, 'object-13', { shiftKey: true });
    const bar = walk(h.find((node) => node.props.className === 'eb-workbench')).find((node) => node.props.role === 'toolbar');
    const regroup = walk(bar).find((node) => node.type === 'button' && text(node).includes(t('makeGroup')));
    assert.equal(regroup.props.disabled, false);
    h.click(t('makeGroup'));
    assert.equal(h.board().groups.length, 12);
    assert.equal(h.board().objects.find((item) => item.id === 'object-13').groupId, h.board().objects.find((item) => item.id === 'object-1').groupId);
  });
});

test('dropping a pattern places the shape at the viewBox point from the screen transform', () => {
  withMount({}, (h) => {
    armSvg(h, () => ({ x: 200, y: 120 }));
    h.find((node) => node.props.title === `${t('circle')} · ${t('value')} 1`).props.onDragStart();
    h.refresh();
    h.find((node) => node.props.className === 'eb-stage-frame').props.onDrop({
      preventDefault() {}, clientX: 0, clientY: 0,
    });
    h.refresh();
    assert.equal(h.board().objects[0].x, 200);
    assert.equal(h.board().objects[0].y, 120);
  });
});

test('explicit snapshot export remains a board-only JSON attachment, independent from process evidence', async () => {
  const h = mount();
  try {
    h.add(); h.clearSelection(); h.note('Export this board'); h.openMore(); h.click(t('export'));
    assert.equal(h.exports.length, 1);
    const exported = JSON.parse(await h.exports[0].text());
    assert.equal(exported.kind, 'math-board'); assert.equal(exported.objects.length, 1);
    assert.equal(exported.note, 'Export this board');
    assert.equal(Object.hasOwn(exported, 'trace'), false); assert.equal(Object.hasOwn(exported, 'entries'), false);
    assert.deepEqual(M.validate(exported), h.board()); assert.equal(h.trace().totalChanges, 2);
  } finally { h.unmount(); }
});

test('the explanation bubble follows the selection and keeps ordinary and per-object notes separate', () => {
  withMount({}, (h) => {
    h.add();
    h.note('第一只小猫');
    assert.equal(h.board().objects[0].note, '第一只小猫');
    assert.equal(h.board().note, '');
    h.clearSelection();
    h.note('整张画板的想法');
    assert.equal(h.board().note, '整张画板的想法');
    pointerAt(h, 'object-1');
    h.find((node) => node.type === 'button' && String(node.props.className || '').includes('eb-note-button')).props.onClick();
    h.refresh();
    const area = h.find((node) => node.type === 'textarea');
    assert.equal(area.props.defaultValue, '第一只小猫');
    h.click(t('cancel'));
    assert.equal(h.board().objects[0].note, '第一只小猫');
    assert.equal(h.board().note, '整张画板的想法');
  });
});

test('host defaults govern creation until the student explicitly chooses a creation colour', () => {
  withMount({}, (h) => {
    h.add('cat');
    const settings = M.empty().settings;
    settings.levels.push({ value: 2, color: 5 });
    settings.defaults.find((entry) => entry.shape === 'cat').value = 2;
    h.setConfig({ revision: 1, floorRevision: 0, settings, changes: [{ revision: 1, settings, scope: 'future' }] });
    assert.ok(h.button(`${t('cat')} · ${t('value')} 2`));
    h.add('cat'); h.add('circle');
    assert.deepEqual(h.board().objects.map((o) => o.value), [1, 2, 1]);
    h.click(`${t('creationColor')} · 1`);
    h.find((node) => node.props.role === 'menuitemradio' && text(node) === '10').props.onClick(); h.refresh();
    h.add('cat');
    assert.equal(h.board().objects.at(-1).value, 10);
    h.setConfig({ revision: 2, floorRevision: 0, settings, changes: [{ revision: 2, settings, scope: 'future' }] });
    h.add('cat');
    assert.equal(h.board().objects.at(-1).value, 2);
  });
});

test('denied file picker permission falls back to ordinary input while cancellation does not', async () => {
  const h = mount();
  try {
    let clicks = 0;
    h.find((node) => node.type === 'input' && node.props.type === 'file').props.ref.current.click = () => { clicks++; };
    for (const name of ['NotAllowedError', 'SecurityError']) {
      window.showOpenFilePicker = async () => { throw Object.assign(new Error('denied'), { name }); };
      h.openMore(); await h.click(t('import')); h.refresh();
    }
    assert.equal(clicks, 2);
    window.showOpenFilePicker = async () => { throw Object.assign(new Error('cancelled'), { name: 'AbortError' }); };
    h.openMore(); await h.click(t('import')); h.refresh();
    assert.equal(clicks, 2);
    window.showOpenFilePicker = async () => [{ getFile: async () => new File(['not json'], 'bad.json') }];
    h.openMore(); await h.click(t('import')); h.refresh();
    assert.equal(clicks, 2, 'invalid file content reports failure without opening a second picker');
    assert.equal(h.board().objects.length, 0);
  } finally { h.unmount(); }
});

test('tapping fills ten shapes per row and a taller board grows for scrolling', () => {
  withMount({}, (h) => {
    const artboard = () => h.find((node) => node.props.className === 'eb-artboard');
    assert.equal(artboard().props.viewBox, '0 0 800 400');
    for (let i = 0; i < 10; i++) h.add('circle');
    assert.deepEqual(h.board().objects.map(({ x, y }) => [x, y]), Array.from({ length: 10 }, (_, i) => [30 + i * 52, 30]));
    h.add('circle');
    assert.deepEqual([h.board().objects.at(-1).x, h.board().objects.at(-1).y], [30, 78]);
    for (let i = 0; i < 69; i++) h.add('circle');
    assert.equal(h.board().objects.length, 80);
    assert.deepEqual([h.board().objects.at(-1).x, h.board().objects.at(-1).y], [30 + 9 * 52, 30 + 7 * 48]);
    assert.equal(artboard().props.viewBox, '0 0 800 426');
    assert.deepEqual(artboard().props.style, { width: '100%', height: 'auto' });
  });
});

test('the quantity rides in a corner tag at the shape lower right, leaving the artwork clear', () => {
  withMount({}, (h) => {
    h.add('circle');
    const object = h.find((node) => node.type === 'g' && node.props['data-object']);
    const [badge] = walk(object).filter((node) => node.type === 'g' && !node.props['data-object']
      && /^translate\(([\d.]+) ([\d.]+)\)$/.test(node.props.transform || '')
      && walk(node).some((child) => child.type === 'text' && text(child) === '1'));
    assert.ok(badge, 'the value should sit in its own tag');
    const [, x, y] = /^translate\(([\d.]+) ([\d.]+)\)$/.exec(badge.props.transform);
    assert.ok(Number(x) > 0 && Number(y) > 0, 'the tag sits at the lower right');
    const art = walk(object).find((node) => node.props && node.props.textAnchor === 'middle' && node.props.y === 4);
    assert.equal(art, undefined, 'no value label is centred on the shape');
  });
});
