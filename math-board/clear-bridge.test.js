import test from 'node:test';
import assert from 'node:assert/strict';
import { createClearBridge, CLEAR_KEY, CLEAR_TOOL, CLEAR_KIND } from './clear-bridge.js';

const call = (seq = 1, callId = 'clear-1', args = {}, time = 1700000000000) => ({
  type: 'tool/call', seq, time, data: { name: CLEAR_TOOL, callId, arguments: JSON.stringify(args) },
});
const output = (revision = 1, requestId = 'clear-1', requestedAt = 1700000000000) => ({
  kind: CLEAR_KIND, status: 'recorded', revision, requestId, requestedAt,
});
const result = (seq = 2, callId = 'clear-1', value = output()) => ({
  type: 'tool/result', seq, time: 1700000000100, data: { message: {
    role: 'tool', toolCallId: callId, source: { kind: 'tool', callId },
    content: [{ type: 'text', text: JSON.stringify(value) }],
  } },
});
const fold = (bridge, events, initial = bridge.init()) => events.reduce(bridge.apply, initial);

test('stable exports and initial view expose requests, never client acknowledgements', () => {
  assert.equal(CLEAR_KEY, 'eduBoardClear');
  assert.equal(CLEAR_TOOL, 'math_board_clear');
  assert.equal(CLEAR_KIND, 'edu-board-clear');
  const bridge = createClearBridge();
  assert.deepEqual(bridge.view(bridge.init()), { revision: 0, requestId: null, requestedAt: 0 });
  bridge.validateState(bridge.init());
});

test('exact logged empty call authorizes the service and its correlated result publishes', () => {
  const bridge = createClearBridge(), session = {};
  let state = bridge.apply(bridge.init(), call());
  assert.deepEqual(state.pendingTools, { 'clear-1': { requestedAt: 1700000000000, seq: 1 } });
  const service = bridge.createService(() => state);
  const carrier = service.run(session, {}, { id: 'clear-1' });
  assert.deepEqual(carrier, output());
  assert.equal(state.view.revision, 0);
  state = bridge.apply(state, result(2, 'clear-1', carrier));
  assert.deepEqual(state.view, { revision: 1, requestId: 'clear-1', requestedAt: 1700000000000 });
  assert.deepEqual(state.pendingTools, {});
  assert.deepEqual(state.settledIds, ['clear-1']);
  bridge.validateState(state);
});

test('only exact empty arguments with a real call id, seq and time enter pending', () => {
  const bridge = createClearBridge();
  const bad = [null, [], 0, '', false, { requestId: 'chosen' }, { clear: true }].map(args => call(1, 'clear-1', args));
  for (const field of ['time', 'seq']) {
    for (const value of [undefined, null, NaN, Infinity, -1, '123', 1.5]) bad.push({ ...call(), [field]: value });
  }
  for (const callId of ['', ' ', null, 'x'.repeat(201), '__proto__'.repeat(30)]) bad.push(call(1, callId));
  bad.push({ ...call(), data: { ...call().data, arguments: {} } });
  bad.push({ ...call(), data: { ...call().data, arguments: '{' } });
  bad.push({ ...call(), type: 'command/run' });
  bad.push({ ...call(), data: { ...call().data, name: 'other' } });
  for (const event of bad) assert.deepEqual(bridge.apply(bridge.init(), event), bridge.init());
});

test('failed, malformed, unmatched or forged results cannot publish', () => {
  const bridge = createClearBridge();
  const patches = [
    { kind: 'other' }, { status: 'executed' }, { revision: 2 }, { revision: '1' },
    { requestId: 'chosen' }, { requestedAt: 0 }, { extra: true },
  ];
  const bad = patches.map(patch => result(2, 'clear-1', { ...output(), ...patch }));
  bad.push(result(2, 'ghost'));
  bad.push(result(1)); // Must follow the pending call's sequence.
  for (const patch of [{ role: 'assistant' }, { source: { kind: 'user', callId: 'clear-1' } },
    { source: { kind: 'tool', callId: 'ghost' } }, { isError: true }, { content: [] },
    { content: [{ type: 'text', text: 'not json' }] }, { content: [{ type: 'image', text: JSON.stringify(output()) }] }]) {
    const event = result(); Object.assign(event.data.message, patch); bad.push(event);
  }
  const errorEvent = result(); errorEvent.data.error = { name: 'Error' }; bad.push(errorEvent);
  for (const event of bad) assert.equal(fold(bridge, [call(), event]).view.revision, 0);
  assert.equal(bridge.apply(bridge.init(), result()).view.revision, 0);
});

test('terminal errors consume authorization, while spoofed envelopes do not', () => {
  const bridge = createClearBridge();
  const failed = result(); failed.data.message.isError = true;
  const state = fold(bridge, [call(), failed, result(3)]);
  assert.equal(state.view.revision, 0);
  assert.deepEqual(state.pendingTools, {});
  assert.throws(() => bridge.createService(() => state).run({}, {}, { id: 'clear-1' }), /exact logged/);
  const forged = result(); forged.data.message.source.kind = 'user';
  assert.equal(fold(bridge, [call(), forged, result(3)]).view.revision, 1);
});

test('duplicate calls preserve original time, duplicate successful ids and results do not increment', () => {
  const bridge = createClearBridge();
  let state = fold(bridge, [call(), call(2, 'clear-1', {}, 5), result(3)]);
  assert.equal(state.view.revision, 1);
  assert.equal(state.view.requestedAt, 1700000000000);
  state = fold(bridge, [result(4, 'clear-1', output(2)), call(5), result(6, 'clear-1', output(2))], state);
  assert.equal(state.view.revision, 1);
});

test('concurrent results must use the current revision and each request metadata', () => {
  const bridge = createClearBridge();
  let state = fold(bridge, [call(), call(2, 'clear-2', {}, 20), result(3), result(4, 'clear-2', output(1, 'clear-2', 20))]);
  assert.equal(state.view.revision, 1);
  state = fold(bridge, [call(5, 'clear-3', {}, 30), result(6, 'clear-3', output(2, 'clear-3', 30))], state);
  assert.deepEqual(state.view, { revision: 2, requestId: 'clear-3', requestedAt: 30 });
});

test('service rejects model-supplied parameters, missing calls and concurrent reservations', () => {
  const bridge = createClearBridge(), session = {};
  let state = fold(bridge, [call(), call(2, 'clear-2', {}, 20)]);
  const service = bridge.createService(() => state);
  for (const args of [undefined, null, [], { requestId: 'clear-1' }, { requestedAt: 1 }, { [Symbol('hidden')]: 1 }]) {
    assert.throws(() => service.run(session, args, { id: 'clear-1' }), /fields/);
  }
  assert.throws(() => service.run(null, {}, { id: 'clear-1' }), /Session/);
  assert.throws(() => service.run(session, {}, { id: 'ghost' }), /exact logged/);
  assert.throws(() => service.run(session, {}, {}), /exact logged/);
  const carrier = service.run(session, {}, { id: 'clear-1' });
  assert.throws(() => service.run(session, {}, { id: 'clear-1' }), /settling/);
  assert.throws(() => service.run(session, {}, { id: 'clear-2' }), /settling/);
  assert.throws(() => bridge.createService(() => state).run(session, {}, { id: 'clear-2' }), /settling/);
  state = bridge.apply(state, result(3, 'clear-1', carrier));
  assert.deepEqual(service.run(session, {}, { id: 'clear-2' }), output(2, 'clear-2', 20));
});

test('failed settlement releases reservations and sessions are isolated', () => {
  const bridge = createClearBridge(), session = {}, other = {};
  let state = fold(bridge, [call(), call(2, 'clear-2')]);
  const service = bridge.createService(() => state);
  service.run(session, {}, { id: 'clear-1' });
  assert.equal(service.run(other, {}, { id: 'clear-2' }).requestId, 'clear-2');
  const failed = result(3); failed.data.message.isError = true;
  state = bridge.apply(state, failed);
  assert.equal(service.run(session, {}, { id: 'clear-2' }).revision, 1);
});

test('pending and settled lifecycle storage remain bounded and support prototype-like ids', () => {
  const bridge = createClearBridge();
  let state = bridge.init();
  for (let i = 1; i <= 300; i++) state = bridge.apply(state, call(i, `pending-${i}`));
  assert.equal(Object.keys(state.pendingTools).length, 256);
  assert.equal(Object.hasOwn(state.pendingTools, 'pending-1'), false);
  bridge.validateState(state);
  state = bridge.init();
  for (let i = 1; i <= 300; i++) state = fold(bridge,
    [call(i * 2, `done-${i}`), result(i * 2 + 1, `done-${i}`, output(i, `done-${i}`))], state);
  assert.equal(state.settledIds.length, 256);
  assert.equal(state.view.revision, 300);
  bridge.validateState(state);
  const unusual = fold(bridge, [call(1, '__proto__'), result(2, '__proto__', output(1, '__proto__'))]);
  assert.equal(unusual.view.requestId, '__proto__');
  bridge.validateState(unusual);
});

test('strict validators reject malformed or inconsistent state and view', () => {
  const bridge = createClearBridge(), initial = bridge.init();
  for (const patch of [{ revision: -1 }, { revision: 0.5 }, { requestId: 'early' }, { requestedAt: 1 },
    { revision: 1 }, { revision: 1, requestId: '' }, { extra: 1 }, { requestedAt: Infinity }]) {
    assert.throws(() => bridge.validateView({ ...initial.view, ...patch }));
  }
  for (const patch of [{ extra: 1 }, { pendingTools: [] }, { settledIds: ['a', 'a'] },
    { settledIds: [''] }, { settledIds: Array(257).fill('a') },
    { pendingTools: { a: { requestedAt: 1, seq: -1 } } },
    { pendingTools: { a: { requestedAt: 1, seq: 1, extra: 0 } } },
    { pendingTools: { a: { requestedAt: 1, seq: 1 } }, settledIds: ['a'] }]) {
    assert.throws(() => bridge.validateState({ ...initial, ...patch }));
  }
  assert.throws(() => bridge.createService(() => null).run({}, {}, { id: 'a' }), /unavailable/);
});
