import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoardModel } from './model.js';
import { createConfigBridge, applyHostConfig, CONFIG_KEY, CONFIG_TOOL, CONFIG_COMMAND, CONFIG_KIND } from './config-bridge.js';

const M = createBoardModel();
const customSettings = (value = 2) => {
  const settings = M.defaultSettings();
  settings.levels = [{ value, color: 0 }, { value: 6, color: 1 }];
  settings.defaults = settings.defaults.map((entry) => ({ ...entry, value, alias: entry.shape === 'circle' ? '小苹果' : '' }));
  return settings;
};

function fold(bridge, events, state = bridge.init()) {
  return events.reduce((current, event) => bridge.apply(current, event), state);
}
const toolCall = (seq, id, input) => ({ type: 'tool/call', seq, data: { name: CONFIG_TOOL, callId: id, arguments: JSON.stringify(input) } });
const toolResult = (seq, id, value) => ({
  type: 'tool/result', seq,
  data: { message: { role: 'tool', source: { kind: 'tool', callId: id }, toolCallId: id, content: value === null ? [] : [{ type: 'text', text: JSON.stringify(value) }] } },
});
const commandRun = (seq, id, input) => ({ type: 'command/run', seq, data: { commandId: id, name: CONFIG_COMMAND, args: JSON.stringify(input), source: { kind: 'user' } } });
const commandDone = (seq, id, kind, text) => ({ type: 'command/done', seq, data: { commandId: id, kind, text } });
const recorded = (revision, settings, scope) => ({ kind: CONFIG_KIND, status: 'recorded', revision, settings, scope });

test('initial view is revision 0 defaults with no history', () => {
  const view = createConfigBridge(M).init().view;
  assert.equal(view.revision, 0);
  assert.deepEqual(view.settings, M.defaultSettings());
  assert.deepEqual(view.changes, []);
  assert.equal(view.floorRevision, 0);
});

test('legacy settings without a toolbox list canonicalize instead of resetting every pattern', () => {
  const bridge = createConfigBridge(M);
  const legacy = { levels: [{ value: 2, color: 0 }], defaults: M.shapes.slice(0, 10).map((shape) => ({ shape, value: 2, alias: shape === 'circle' ? '苹果' : '' })) };
  const canonical = M.validateSettings(legacy);
  const state = fold(bridge, [
    toolCall(1, 'call-legacy', { action: 'set', settings: legacy, scope: 'future', expectedRevision: 0 }),
    toolResult(2, 'call-legacy', recorded(1, canonical, 'future')),
  ]);
  const view = bridge.view(state);
  assert.equal(view.revision, 1);
  assert.deepEqual(view.settings.shapes, M.shapes.slice(0, 10));
  assert.equal(view.settings.defaults.length, M.shapes.length);
  assert.ok(view.settings.defaults.slice(10).every((entry) => entry.value === 2 && entry.alias === ''));
});

test('a correlated tool write publishes one client-visible change', () => {
  const bridge = createConfigBridge(M);
  const settings = customSettings();
  const state = fold(bridge, [
    toolCall(1, 'call-1', { action: 'set', settings, scope: 'existing', expectedRevision: 0 }),
    toolResult(2, 'call-1', recorded(1, settings, 'existing')),
  ]);
  const view = bridge.view(state);
  assert.equal(view.revision, 1);
  assert.deepEqual(view.settings, settings);
  assert.deepEqual(view.changes, [{ seq: 2, revision: 1, settings, scope: 'existing' }]);
  bridge.validateView(view);
});

test('a correlated user command write behaves identically', () => {
  const bridge = createConfigBridge(M);
  const settings = customSettings();
  const state = fold(bridge, [
    commandRun(1, 'cmd-1', { action: 'set', settings, scope: 'future', expectedRevision: 0 }),
    commandDone(2, 'cmd-1', 'success', JSON.stringify(recorded(1, settings, 'future'))),
  ]);
  const view = bridge.view(state);
  assert.equal(view.revision, 1);
  assert.equal(view.changes[0].scope, 'future');
});

test('uncorrelated, malformed, failed and unrelated payloads never publish', () => {
  const bridge = createConfigBridge(M);
  const settings = customSettings();
  const base = [commandRun(1, 'cmd-1', { action: 'set', settings, scope: 'future', expectedRevision: 0 })];
  const attempts = [
    [commandDone(2, 'cmd-1', 'error', 'boom')],
    [commandDone(2, 'cmd-1', 'success', 'not json')],
    [commandDone(2, 'other-id', 'success', JSON.stringify(recorded(1, settings, 'future')))],
    [commandDone(2, 'cmd-1', 'success', JSON.stringify(recorded(2, settings, 'future')))],
    [commandDone(2, 'cmd-1', 'success', JSON.stringify(recorded(1, customSettings(), 'existing')))],
    [toolCall(2, 'call-1', { action: 'set', settings, scope: 'future', expectedRevision: 0 }), toolResult(3, 'call-1', { ...recorded(1, settings, 'future'), kind: 'other' })],
  ];
  for (const extra of attempts) assert.equal(bridge.view(fold(bridge, [...base, ...extra])).revision, 0);
  assert.equal(bridge.view(fold(bridge, [{ type: 'assistant/message', seq: 1, data: {} }])).revision, 0);
});

test('history keeps order, bounds and floorRevision', () => {
  const bridge = createConfigBridge(M);
  let state = bridge.init();
  let seq = 0;
  for (let revision = 1; revision <= 3; revision += 1) {
    const settings = customSettings(revision + 2);
    state = fold(bridge, [
      toolCall(++seq, `call-${revision}`, { action: 'set', settings, scope: 'existing', expectedRevision: revision - 1 }),
      toolResult(++seq, `call-${revision}`, recorded(revision, settings, 'existing')),
    ], state);
  }
  const view = bridge.view(state);
  assert.equal(view.revision, 3);
  assert.deepEqual(view.changes.map((change) => change.revision), [1, 2, 3]);
  assert.equal(view.floorRevision, 0);
  assert.deepEqual(view.changes.at(-1).settings, view.settings);
});

test('state and view validators reject malformed shapes', () => {
  const bridge = createConfigBridge(M);
  const view = bridge.init().view;
  for (const patch of [{ revision: -1 }, { floorRevision: 5 }, { changes: {} }, { changes: [{ seq: 1, revision: 2, settings: M.defaultSettings(), scope: 'future' }] }]) {
    assert.throws(() => bridge.validateView({ ...view, ...patch }));
  }
  assert.throws(() => bridge.validateState({ ...bridge.init(), extra: 1 }));
});

test('the service rejects writes without an exact logged invocation and stale revisions', () => {
  const bridge = createConfigBridge(M);
  const settings = customSettings();
  const state = fold(bridge, [toolCall(1, 'call-1', { action: 'set', settings, scope: 'existing', expectedRevision: 0 })]);
  const session = {};
  const service = bridge.createService(() => state);
  const output = service.run(session, { action: 'get' }, { channel: 'tool', id: 'call-1' });
  assert.equal(output.status, 'current');
  assert.equal(output.revision, 0);
  assert.throws(() => service.run(session, { action: 'set', settings, scope: 'existing', expectedRevision: 0 }, { channel: 'tool', id: 'ghost' }), /exact logged/);
  assert.equal(service.run(session, { action: 'set', settings, scope: 'existing', expectedRevision: 0 }, { channel: 'tool', id: 'call-1' }).revision, 1);
  assert.throws(() => service.run(session, { action: 'set', settings, scope: 'existing', expectedRevision: 0 }, { channel: 'command', id: 'cmd-1' }), /exact logged/);
});

// CONFIG_KEY is the wire table name the Client reads through props.useProjection.
test('the wire key is the documented projection name', () => {
  assert.equal(CONFIG_KEY, 'eduBoardConfig');
});

test('set requires expectedRevision', () => {
  const bridge = createConfigBridge(M);
  const settings = customSettings();
  assert.throws(() => bridge.request({ action: 'set', settings, scope: 'future' }), /fields|revision/);
  assert.deepEqual(
    bridge.request({ action: 'set', settings, scope: 'future', expectedRevision: 0 }),
    { action: 'set', settings, scope: 'future', expectedRevision: 0 },
  );
});

test('applyHostConfig replays retained scopes across a history gap instead of forcing future', () => {
  let board = M.reduce(M.empty(), { type: 'add', shape: 'circle', count: 1 });
  assert.equal(board.objects[0].value, 1);
  const settings = customSettings(2);
  const config = {
    revision: 5,
    floorRevision: 4,
    settings,
    changes: [{ seq: 10, revision: 5, settings, scope: 'existing' }],
  };
  const result = applyHostConfig(M, board, config, 0);
  assert.equal(result.status, 'configGap');
  assert.equal(result.watermark, 5);
  assert.equal(result.board.objects[0].value, 2);
  assert.deepEqual(result.board.settings, settings);
});

test('applyHostConfig treats a non-finite watermark as unread and applies pending changes', () => {
  let board = M.reduce(M.empty(), { type: 'add', shape: 'circle', count: 1 });
  const settings = customSettings(2);
  const config = {
    revision: 1,
    floorRevision: 0,
    settings,
    changes: [{ seq: 2, revision: 1, settings, scope: 'existing' }],
  };
  const result = applyHostConfig(M, board, config, Number('bad'));
  assert.equal(result.status, 'configApplied');
  assert.equal(result.watermark, 1);
  assert.equal(result.board.objects[0].value, 2);
});

test('applyHostConfig aborts the batch on a failed configure and keeps the last good watermark', () => {
  let board = M.reduce(M.empty(), { type: 'add', shape: 'circle', count: 1 });
  const good = customSettings(2);
  const bad = { ...good, levels: [] };
  const config = {
    revision: 2,
    floorRevision: 0,
    settings: bad,
    changes: [
      { seq: 1, revision: 1, settings: good, scope: 'existing' },
      { seq: 2, revision: 2, settings: bad, scope: 'future' },
    ],
  };
  const result = applyHostConfig(M, board, config, 0);
  assert.equal(result.status, 'configError');
  assert.equal(result.watermark, 1);
  assert.equal(result.board.objects[0].value, 2);
});
