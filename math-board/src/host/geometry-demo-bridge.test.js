import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeometryModel } from '../geometry/model.js';
import { createGeometryDemoBridge, DEMO_KEY, DEMO_TOOL, DEMO_KIND } from './geometry-demo-bridge.js';

const G = createGeometryModel();
let raw = G.empty();
raw = G.reduce(raw, { type: 'addPoint', x: 80, y: 80, label: 'A' });
raw = G.reduce(raw, { type: 'addPoint', x: 200, y: 80, label: 'B' });
const [a, b] = raw.points.map(point => point.id);
raw = G.reduce(raw, { type: 'addElement', elementType: 'segment', points: [a, b], note: '9 cm' });
const figure = (title = 'Given') => ({ title, description: 'Known side', board: raw });
const canonical = (title = 'Given') => createGeometryDemoBridge(G).request({ action: 'show', expectedRevision: 0, figure: figure(title) }).figure;
const show = (expectedRevision = 0, title) => ({ action: 'show', expectedRevision, figure: figure(title) });
const hide = (expectedRevision = 0) => ({ action: 'hide', expectedRevision });
const call = (id, input, seq = 1) => ({ type: 'tool/call', seq, data: { name: DEMO_TOOL, callId: id, arguments: JSON.stringify(input) } });
const recorded = (revision = 1, artifact = canonical()) => ({ kind: DEMO_KIND, status: 'recorded', revision, figure: artifact });
const result = (id, value = recorded(), seq = 2) => ({ type: 'tool/result', seq,
  data: { message: { role: 'tool', source: { kind: 'tool', callId: id }, toolCallId: id, content: [{ type: 'text', text: JSON.stringify(value) }] } } });
const fold = (bridge, events, state = bridge.init()) => events.reduce((current, event) => bridge.apply(current, event), state);

test('documented keys and the public view contain no student draft', () => {
  const bridge = createGeometryDemoBridge(G);
  assert.equal(DEMO_KEY, 'eduBoardGeometryDemo');
  assert.equal(DEMO_TOOL, 'geometry_board_draw');
  assert.deepEqual(bridge.view(bridge.init()), { revision: 0, figure: null });
});

test('show replaces the previous figure and hide clears only that figure', () => {
  const bridge = createGeometryDemoBridge(G);
  let state = fold(bridge, [call('a', show()), result('a')]);
  assert.equal(state.view.figure.title, 'Given');
  assert.equal(state.view.figure.board.elements[0].note, '9 cm');
  state = fold(bridge, [call('b', show(1, 'Second'), 3), result('b', recorded(2, canonical('Second')), 4)], state);
  assert.equal(state.view.figure.title, 'Second');
  state = fold(bridge, [call('c', hide(2), 5), result('c', recorded(3, null), 6)], state);
  assert.deepEqual(bridge.view(state), { revision: 3, figure: null });
});

test('stale, spoofed, failed, and cross-session writes do not publish', () => {
  const bridge = createGeometryDemoBridge(G);
  const spoof = result('a');
  spoof.data.message.content[0].text = JSON.stringify(recorded(1, canonical('Spoof')));
  assert.equal(fold(bridge, [call('a', show()), spoof]).view.revision, 0);
  assert.equal(fold(bridge, [call('a', show(1)), result('a')]).view.revision, 0);
  const failed = result('a'); failed.data.error = true;
  assert.equal(fold(bridge, [call('a', show()), failed]).view.revision, 0);
  let state = fold(bridge, [call('a', show(), 1), call('b', show(), 2)]);
  const session = {}, other = {}, service = bridge.createService(() => state);
  service.run(session, show(), { id: 'a' });
  assert.throws(() => service.run(session, show(), { id: 'b' }), /still settling/);
  assert.equal(service.run(other, show(), { id: 'b' }).revision, 1);
  assert.throws(() => service.run(session, { action: 'get', draft: true }), /fields/);
  assert.equal(service.run(session, { action: 'get' }).revision, 0);
  assert.equal(JSON.stringify(service.run(session, { action: 'get' })).includes('student'), false);
});
