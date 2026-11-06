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
const key = 'dsh-edu-math-board:v3:integration';
const traceKey = `${key}:trace-v1`;
const walk = (node) => !node || typeof node !== 'object' ? []
  : [node, ...(node.children || []).flat(Infinity).flatMap(walk)];
const text = (node) => typeof node === 'string' || typeof node === 'number' ? String(node)
  : node && typeof node === 'object' ? (node.children || []).flat(Infinity).map(text).join('') : '';

/** Stateful hooks with persistent refs, dependency-aware effects, and explicit rendering. */
function mount(options = {}) {
  const storage = options.storage || new Map();
  const old = { window: globalThis.window, localStorage: globalThis.localStorage,
    createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL };
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  globalThis.localStorage = { getItem: (name) => storage.get(name) ?? null,
    setItem: (name, value) => {
      if (options.storageFail?.(name)) throw new Error('Quota exceeded');
      storage.set(name, String(value));
    } };
  const slots = []; const dom = new Map(); const effects = [];
  let cursor = 0; let dirty = false; let tree; let config = options.config || null;
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
  const props = { sessionId: 'integration', useProjection: () => config, useInput: () => 'plain', inputActions };
  function render() {
    cursor = 0; dirty = false; tree = Board(props);
    for (const node of walk(tree)) if (node.props.ref && typeof node.props.ref === 'object') {
      const ref = node.props.ref;
      if (!dom.has(ref)) dom.set(ref, { open: false, ownerDocument: { activeElement: null },
        showModal() { this.open = true; }, close() { this.open = false; }, contains: () => false,
        click() {}, href: '' });
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
    add(shape = 'circle') { this.click(t(shape)); },
    note(value) { find((node) => node.type === 'textarea').props.onBlur({ target: { value } }); refresh(); },
    attach(value) {
      const label = find((node) => node.type === 'label' && text(node) === t('traceAttach'));
      walk(label).find((node) => node.type === 'input').props.onChange({ target: { checked: value } }); refresh();
    },
    get attachChecked() {
      const label = find((node) => node.type === 'label' && text(node) === t('traceAttach'));
      return walk(label).find((node) => node.type === 'input').props.checked;
    },
    board: () => M.validate(JSON.parse(storage.get(key))),
    trace: () => T.validate(JSON.parse(storage.get(traceKey)).trace),
    setConfig(next) { config = next; refresh(); },
    unmount() {
      for (const slot of slots) slot?.cleanup?.();
      globalThis.window = old.window; globalThis.localStorage = old.localStorage;
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
    h.add(); h.note('Two steps in my attempt'); h.attach(false);
    expectedBoard = h.board(); expectedTrace = h.trace();
    assert.equal(expectedTrace.totalChanges, 2); assert.equal(expectedTrace.priorUnknown, false);
  });
  withMount({ storage }, (h) => {
    assert.deepEqual(h.board(), expectedBoard); assert.deepEqual(h.trace(), expectedTrace);
    assert.equal(h.attachChecked, false);
    h.click(t('tracePreview'));
    h.find((node) => node.type === 'p' && text(node) === t('traceTotals', { count: 2, omitted: 0 }));
    h.add(); assert.equal(h.trace().totalChanges, 3);
  });
});

test('old draft without a trace restores the board and explicitly marks unknown prior work', () => {
  const draft = M.reduce(M.empty(), { type: 'add', shape: 'cat', count: 2 });
  for (const draftKey of [key, 'dsh-edu-math-board:v2:integration']) {
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
    h.add(); h.note('An initial idea');
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
    h.note('两只小猫在一起'); h.click(t('insert'));
    assert.equal(h.inserted.length, 1);
    assert.equal(h.inserted[0].value, '\n两只小猫在一起\n');
    assert.equal(/我在数学画板上摆好了|没圈组|划去的/.test(h.inserted[0].value), false);
    assert.deepEqual(h.inserted[0].span, { offset: 17 });
    assert.equal(h.board().objects.length, 3); assert.equal(h.board().note, '两只小猫在一起');
    assert.equal(h.trace().totalChanges, 4);
  } finally { h.unmount(); }
});

test('starting a new attempt requires confirmation, keeps board, resets undo and process evidence', () => {
  withMount({}, (h) => {
    h.add(); h.note('Keep this arrangement'); const expected = h.board();
    h.click(t('traceNewAttempt')); assert.equal(h.trace().totalChanges, 2);
    h.click(t('cancel')); assert.equal(h.trace().totalChanges, 2);
    h.click(t('traceNewAttempt')); h.click(t('traceResetConfirm'));
    assert.deepEqual(h.board(), expected); assert.deepEqual(h.trace(), T.empty(true));
    assert.equal(h.button(t('undo')).props.disabled, true); assert.equal(h.button(t('redo')).props.disabled, true);
    h.add(); assert.equal(h.trace().totalChanges, 1); assert.equal(h.trace().priorUnknown, true);
  });
});

test('clear record keeps the drawing, drops the local process log, and leaves an empty board fully known', () => {
  withMount({}, (h) => {
    h.add(); const expected = h.board();
    h.click(t('traceClear')); h.click(t('cancel'));
    assert.equal(h.trace().totalChanges, 1);
    h.click(t('traceClear')); h.click(t('traceResetConfirm'));
    assert.deepEqual(h.board(), expected); assert.deepEqual(h.trace(), T.empty(true));
    h.click(t('clear')); h.click(t('confirmClear'));
    assert.deepEqual(h.board(), M.empty()); assert.deepEqual(h.trace(), T.empty());
    h.click(t('traceClear')); h.click(t('traceResetConfirm'));
    assert.deepEqual(h.trace(), T.empty(false));
  });
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
    h.add(); h.note('keep my words'); h.click(t('insert')); const ids = h.batches[0].map((draft) => draft.id);
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
    h.add(); h.note('Same content');
    const before = h.trace(); const boardBefore = h.board();
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
    h.add(); h.note('Export this board'); h.click(t('export'));
    assert.equal(h.exports.length, 1);
    const exported = JSON.parse(await h.exports[0].text());
    assert.equal(exported.kind, 'math-board'); assert.equal(exported.objects.length, 1);
    assert.equal(exported.note, 'Export this board');
    assert.equal(Object.hasOwn(exported, 'trace'), false); assert.equal(Object.hasOwn(exported, 'entries'), false);
    assert.deepEqual(M.validate(exported), h.board()); assert.equal(h.trace().totalChanges, 2);
  } finally { h.unmount(); }
});
