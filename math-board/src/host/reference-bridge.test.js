import test from 'node:test';
import assert from 'node:assert/strict';
import { createReferenceBridge, REFERENCE_KEY, REFERENCE_TOOL, REFERENCE_KIND } from './reference-bridge.js';

const reference = (title = 'Given') => ({ title, description: 'Known conditions only', width: 200, height: 100,
  shapes: [{ type: 'rect', x: 0, y: 0, width: 100, height: 100 }] });
const show = (expectedRevision = 0, title) => ({ action: 'show', expectedRevision, reference: reference(title) });
const hide = (expectedRevision = 0) => ({ action: 'hide', expectedRevision });
const call = (id, input, seq = 1) => ({ type: 'tool/call', seq, data: { name: REFERENCE_TOOL, callId: id, arguments: JSON.stringify(input) } });
const recorded = (revision = 1, artifact = reference()) => ({ kind: REFERENCE_KIND, status: 'recorded', revision, reference: artifact });
const result = (id, value = recorded(), seq = 2) => ({ type: 'tool/result', seq,
  data: { message: { role: 'tool', source: { kind: 'tool', callId: id }, toolCallId: id, content: [{ type: 'text', text: JSON.stringify(value) }] } } });
const fold = (bridge, events, state = bridge.init()) => events.reduce((current, event) => bridge.apply(current, event), state);

test('documented keys and initial public view exclude all student data', () => {
  const bridge = createReferenceBridge();
  assert.equal(REFERENCE_KEY, 'eduBoardReference');
  assert.equal(REFERENCE_TOOL, 'math_board_reference');
  assert.deepEqual(bridge.view(bridge.init()), { revision: 0, reference: null });
  bridge.validateState(bridge.init());
  assert.equal(bridge.validateState(bridge.init()).pendingTools.constructor, Object);
});

test('show, replacement, hide, and get replay only successful matched tool pairs', () => {
  const bridge = createReferenceBridge();
  let state = fold(bridge, [call('a', show()), result('a')]);
  assert.deepEqual(bridge.view(state), { revision: 1, reference: reference() });
  state = fold(bridge, [call('b', show(1, 'Second'), 3), result('b', recorded(2, reference('Second')), 4)], state);
  assert.equal(state.view.reference.title, 'Second');
  state = fold(bridge, [call('c', hide(2), 5), result('c', recorded(3, null), 6)], state);
  assert.deepEqual(bridge.view(state), { revision: 3, reference: null });
  state = fold(bridge, [call('get', { action: 'get' }, 7), result('get', { ...recorded(3, null), status: 'current' }, 8)], state);
  assert.deepEqual(state.pendingTools, {});
  assert.deepEqual(state.view, { revision: 3, reference: null });
  bridge.validateState(state);
});

test('request parser is exact and rejects snapshots and unauthorized operations', () => {
  const bridge = createReferenceBridge();
  assert.deepEqual(bridge.request({ action: 'get' }), { action: 'get' });
  assert.deepEqual(bridge.request(show()), show());
  assert.deepEqual(bridge.request(hide()), hide());
  for (const input of [null, [], {}, { action: 'set' }, { action: 'clear' }, { action: 'submit' },
    { action: 'get', reference: null }, { action: 'hide' }, { ...hide(), reference: null },
    { action: 'show', reference: reference() }, { ...show(), expectedRevision: -1 },
    { ...show(), expectedRevision: 0.1 }, { ...show(), expectedRevision: Number.MAX_SAFE_INTEGER },
    { ...show(), expectedRevision: '0' }, { ...show(), reference: { kind: 'math-board', schemaVersion: 4 } },
    { ...show(), reference: { kind: 'geometry-board', schemaVersion: 1 } },
  ]) assert.throws(() => bridge.request(input));
});

test('uncorrelated, wrong source, malformed, failed, stale and spoofed results do not publish', () => {
  const bridge = createReferenceBridge();
  const variants = [
    event => { event.data.message.toolCallId = 'other'; },
    event => { event.data.message.source.callId = 'other'; },
    event => { event.data.message.source.kind = 'user'; },
    event => { event.data.message.role = 'assistant'; },
    event => { event.data.error = 'failed'; },
    event => { event.data.message.isError = true; },
    event => { event.data.message.content = []; },
    event => { event.data.message.content = [{ type: 'text', text: 'broken json' }]; },
    event => { event.data.message.content.push({ type: 'image', url: 'fake' }); },
    event => { event.data.message.content[0].text = JSON.stringify({ ...recorded(), revision: 2 }); },
    event => { event.data.message.content[0].text = JSON.stringify({ ...recorded(), status: 'current' }); },
    event => { event.data.message.content[0].text = JSON.stringify({ ...recorded(), kind: 'math-board' }); },
    event => { event.data.message.content[0].text = JSON.stringify({ ...recorded(), extra: true }); },
    event => { event.data.message.content[0].text = JSON.stringify(recorded(1, reference('Spoof'))); },
    event => { event.seq = 1; },
  ];
  for (const mutate of variants) {
    const event = result('a'); mutate(event);
    assert.equal(fold(bridge, [call('a', show()), event]).view.revision, 0);
  }
  assert.equal(fold(bridge, [result('a')]).view.revision, 0);
  assert.equal(fold(bridge, [call('a', hide()), result('a')]).view.revision, 0);
  assert.equal(fold(bridge, [call('a', show(1)), result('a')]).view.revision, 0);
  const failed = result('a'); failed.data.error = true;
  assert.deepEqual(fold(bridge, [call('a', show()), failed, result('a', recorded(), 3)]).pendingTools, {});
  assert.equal(fold(bridge, [call('a', show()), failed, result('a', recorded(), 3)]).view.revision, 0);
});

test('unrelated and malformed log events are ignored without exceptions', () => {
  const bridge = createReferenceBridge();
  for (const event of [null, {}, [], { type: 'tool/call', seq: -1, data: {} },
    { ...call('a', show()), data: { ...call('a', show()).data, arguments: '{bad' } },
    { ...call('a', show()), data: { ...call('a', show()).data, arguments: show() } },
    call('', show()), call('x'.repeat(201), show()),
    { ...call('a', show()), data: { ...call('a', show()).data, name: 'math_board_settings' } },
    { type: 'command/run', seq: 1, data: { name: REFERENCE_TOOL, args: JSON.stringify(show()), commandId: 'a', source: { kind: 'user' } } },
    { type: 'assistant/message', seq: 1, data: { reference: reference() } },
  ]) assert.deepEqual(bridge.apply(bridge.init(), event), bridge.init());
});

test('pending tools are bounded to latest 128 and special IDs remain safe', () => {
  const bridge = createReferenceBridge();
  let state = bridge.init();
  for (let i = 0; i < 130; i++) state = bridge.apply(state, call(`id-${i}`, show(), i));
  assert.equal(Object.keys(state.pendingTools).length, 128);
  assert.equal(Object.hasOwn(state.pendingTools, 'id-0'), false);
  assert.equal(Object.hasOwn(state.pendingTools, 'id-1'), false);
  bridge.validateState(state);
  state = bridge.apply(state, result('id-0', recorded(), 131));
  assert.equal(state.view.revision, 0);
  for (const id of ['__proto__', 'constructor', 'toString']) {
    const special = fold(bridge, [call(id, show()), result(id)]);
    assert.equal(special.view.revision, 1);
    assert.deepEqual(special.pendingTools, {});
  }
});

test('duplicate pending IDs cannot replace their original invocation', () => {
  const bridge = createReferenceBridge();
  const state = fold(bridge, [call('a', show(), 1), call('a', hide(), 2)]);
  assert.deepEqual(state.pendingTools.a, { input: show(), seq: 1 });
  assert.equal(bridge.apply(state, result('a', recorded(), 3)).view.revision, 1);
});

test('stale concurrent results and duplicate result delivery cannot advance state', () => {
  const bridge = createReferenceBridge();
  const state = fold(bridge, [call('a', show(), 1), call('b', show(), 2), result('a', recorded(), 3),
    result('a', recorded(), 4), result('b', recorded(2), 5)]);
  assert.equal(state.view.revision, 1);
  assert.deepEqual(state.pendingTools, {});
});

test('service requires live projection and exact logged mutations; get has no board access', () => {
  const bridge = createReferenceBridge();
  let state = fold(bridge, [call('a', show()), call('stale', show(1), 2)]);
  const session = {}, service = bridge.createService(() => state);
  assert.deepEqual(service.run(session, { action: 'get' }), { kind: REFERENCE_KIND, status: 'current', revision: 0, reference: null });
  assert.throws(() => service.run(null, { action: 'get' }), /live Session/);
  assert.throws(() => bridge.createService(() => null).run(session, { action: 'get' }), /unavailable/);
  for (const source of [undefined, { id: 'ghost' }, { id: 'a', channel: 'command' }]) {
    assert.throws(() => service.run(session, show(), source), /exact logged/);
  }
  assert.throws(() => service.run(session, show(0, 'Mismatch'), { id: 'a' }), /exact logged/);
  assert.throws(() => service.run(session, show(1), { id: 'stale' }), /revision changed/);
  assert.deepEqual(service.run(session, show(), { id: 'a', channel: 'tool' }), recorded());
  assert.equal(state.view.revision, 0, 'service does not mutate projection before logged success');
  state = bridge.apply(state, result('a', recorded(), 3));
  assert.deepEqual(service.run(session, { action: 'get' }), { ...recorded(), status: 'current' });
});

test('reservation prevents concurrent mutations, recovers after success or error, isolates sessions', () => {
  const bridge = createReferenceBridge();
  let state = fold(bridge, [call('a', show(), 1), call('b', show(), 2)]);
  const session = {}, other = {}, service = bridge.createService(() => state);
  service.run(session, show(), { id: 'a' });
  assert.throws(() => service.run(session, show(), { id: 'b' }), /still settling/);
  assert.throws(() => service.run(session, show(), { id: 'a' }), /still settling/);
  assert.throws(() => bridge.createService(() => state).run(session, show(), { id: 'b' }), /still settling/);
  assert.equal(service.run(session, { action: 'get' }).revision, 0);
  assert.equal(service.run(other, show(), { id: 'b' }).revision, 1);
  const failure = result('a', recorded(), 3); failure.data.error = 'failed';
  state = bridge.apply(state, failure);
  const output = service.run(session, show(), { id: 'b' });
  state = bridge.apply(state, result('b', output, 4));
  state = bridge.apply(state, call('c', hide(1), 5));
  assert.equal(service.run(session, hide(1), { id: 'c' }).revision, 2);
});

test('all data crossing request, output, view and replay boundaries is cloned', () => {
  const bridge = createReferenceBridge(), input = show(), canonical = bridge.request(input);
  canonical.reference.shapes[0].width = 1;
  assert.equal(input.reference.shapes[0].width, 100);
  let state = fold(bridge, [call('a', input)]);
  const service = bridge.createService(() => state), session = {};
  const output = service.run(session, input, { id: 'a' });
  output.reference.title = 'mutated';
  assert.equal(state.pendingTools.a.input.reference.title, 'Given');
  state = bridge.apply(state, result('a'));
  const view = bridge.view(state); view.reference.shapes[0].width = 1;
  const current = service.run(session, { action: 'get' }); current.reference.description = 'mutated';
  assert.equal(state.view.reference.shapes[0].width, 100);
  assert.equal(state.view.reference.description, 'Known conditions only');
});

test('persisted state validation enforces bounds, exact state and valid pending requests', () => {
  const bridge = createReferenceBridge(), state = fold(bridge, [call('a', show())]);
  assert.equal(bridge.validateState(state), state);
  for (const bad of [
    { ...state, drafts: [] }, { ...state, view: { revision: -1, reference: null } },
    { ...state, pendingTools: [] }, { ...state, pendingTools: { a: show() } },
    { ...state, pendingTools: { '': { input: show(), seq: 1 } } },
    { ...state, pendingTools: { a: { input: { action: 'get' }, seq: 1 } } },
    { ...state, pendingTools: { a: { input: show(), seq: -1 } } },
    { ...state, pendingTools: Object.fromEntries(Array.from({ length: 129 }, (_, i) => [`id-${i}`, { input: show(), seq: i }])) },
  ]) assert.throws(() => bridge.validateState(bad));
});
