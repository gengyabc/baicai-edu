import { createReferenceModel } from './reference-model.js';

export const REFERENCE_KEY = 'eduBoardReference';
export const REFERENCE_TOOL = 'math_board_reference';
export const REFERENCE_KIND = 'edu-board-reference';
const MAX_PENDING = 128;

/** Session-log projection of teacher artifacts only; never reads student canvases. */
export function createReferenceBridge() {
  const M = createReferenceModel();
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const own = (value, key) => Object.hasOwn(value, key);
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  const idValid = id => typeof id === 'string' && id.trim().length > 0 && id.length <= 200;
  const clone = value => structuredClone(value);
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const exact = (value, keys) => {
    if (!record(value) || keys.some(key => !own(value, key))
      || Reflect.ownKeys(value).some(key => !keys.includes(key))) throw Error('Invalid reference fields');
  };
  function request(value) {
    if (value?.action === 'get') { exact(value, ['action']); return { action: 'get' }; }
    if (value?.action === 'hide') exact(value, ['action', 'expectedRevision']);
    else if (value?.action === 'show') exact(value, ['action', 'expectedRevision', 'reference']);
    else throw Error('Invalid reference action');
    if (!integer(value.expectedRevision) || value.expectedRevision === Number.MAX_SAFE_INTEGER) throw Error('Invalid reference revision');
    return value.action === 'hide' ? { action: 'hide', expectedRevision: value.expectedRevision }
      : { action: 'show', expectedRevision: value.expectedRevision, reference: M.validateReference(value.reference) };
  }
  const init = () => ({ view: { revision: 0, reference: null }, pendingTools: {} });
  function validateState(value) {
    exact(value, ['view', 'pendingTools']); M.validateView(value.view);
    if (!record(value.pendingTools) || Reflect.ownKeys(value.pendingTools).length > MAX_PENDING) throw Error('Invalid reference pending calls');
    for (const id of Reflect.ownKeys(value.pendingTools)) {
      const pending = value.pendingTools[id];
      exact(pending, ['input', 'seq']);
      if (!idValid(id) || !integer(pending.seq) || request(pending.input).action === 'get') throw Error('Invalid reference pending call');
    }
    return value;
  }
  function result(value) {
    exact(value, ['kind', 'status', 'revision', 'reference']);
    if (value.kind !== REFERENCE_KIND || value.status !== 'recorded' || !integer(value.revision) || value.revision === 0) throw Error('Invalid reference result');
    return { kind: REFERENCE_KIND, status: 'recorded', ...M.validateView({ revision: value.revision, reference: value.reference }) };
  }
  function apply(state, event) {
    if (!record(event) || !integer(event.seq) || !record(event.data)) return state;
    const data = event.data;
    if (event.type === 'tool/call' && data.name === REFERENCE_TOOL) {
      try {
        if (!idValid(data.callId) || typeof data.arguments !== 'string' || own(state.pendingTools, data.callId)) return state;
        const input = request(JSON.parse(data.arguments));
        if (input.action === 'get') return state;
        const entries = Object.entries(state.pendingTools).filter(([id]) => id !== data.callId).slice(-(MAX_PENDING - 1));
        return { ...state, pendingTools: Object.fromEntries([...entries, [data.callId, { input, seq: event.seq }]]) };
      } catch { return state; }
    }
    if (event.type !== 'tool/result') return state;
    const message = data.message;
    if (!record(message) || message.role !== 'tool' || !record(message.source) || message.source.kind !== 'tool'
      || message.source.callId !== message.toolCallId || !idValid(message.toolCallId)
      || !own(state.pendingTools, message.toolCallId)) return state;
    const pending = state.pendingTools[message.toolCallId];
    if (event.seq <= pending.seq) return state;
    const remaining = { ...state.pendingTools }; delete remaining[message.toolCallId];
    const settled = { ...state, pendingTools: remaining };
    if (data.error || message.isError === true || !Array.isArray(message.content)) return settled;
    try {
      if (message.content.length !== 1 || message.content[0]?.type !== 'text' || typeof message.content[0].text !== 'string') return settled;
      const output = result(JSON.parse(message.content[0].text)), current = state.view;
      const expected = pending.input.action === 'show' ? pending.input.reference : null;
      if (pending.input.expectedRevision !== current.revision || output.revision !== current.revision + 1
        || !equal(output.reference, expected)) return settled;
      return { ...settled, view: { revision: output.revision, reference: output.reference } };
    } catch { return settled; }
  }
  // Share reservations across adapters/services created by this bridge.
  const reservations = new WeakMap();
  function createService(stateOf) {
    function run(session, rawInput, source) {
      if (!session || typeof session !== 'object') throw Error('A live Session is required');
      const input = request(rawInput), state = stateOf(session);
      if (!state) throw Error('Math board reference projection is unavailable');
      validateState(state);
      const current = state.view;
      if (input.action === 'get') return { kind: REFERENCE_KIND, status: 'current', ...M.validateView(current) };
      if ((source?.channel !== undefined && source.channel !== 'tool') || !idValid(source?.id)
        || !own(state.pendingTools, source.id) || !equal(state.pendingTools[source.id].input, input)) {
        throw Error('Reference writes require their exact logged tool invocation');
      }
      const reserved = reservations.get(session);
      if (reserved && current.revision < reserved.revision && own(state.pendingTools, reserved.id)
        && state.pendingTools[reserved.id].seq === reserved.seq) {
        throw Error('Another reference update is still settling; get the reference and retry');
      }
      reservations.delete(session);
      if (input.expectedRevision !== current.revision) {
        throw Error(`Reference revision changed: expected ${input.expectedRevision}, current ${current.revision}`);
      }
      const output = { kind: REFERENCE_KIND, status: 'recorded', revision: current.revision + 1,
        reference: input.action === 'show' ? input.reference : null };
      reservations.set(session, { id: source.id, seq: state.pendingTools[source.id].seq, revision: output.revision });
      return clone(output);
    }
    return { run };
  }
  return { init, apply, view: state => M.validateView(state.view), validateView: M.validateView, validateState, request, createService };
}
