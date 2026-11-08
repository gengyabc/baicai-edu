/** A logged clear request, not an acknowledgement that a client cleared its board. */
export const CLEAR_KEY = 'eduBoardClear';
export const CLEAR_TOOL = 'math_board_clear';
export const CLEAR_KIND = 'edu-board-clear';
const MAX_PENDING = 256;
const MAX_SETTLED = 256;

export function createClearBridge() {
  const own = (value, key) => Object.hasOwn(value, key);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  const id = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 200;
  const exact = (value, keys) => {
    if (!record(value) || Reflect.ownKeys(value).length !== keys.length || keys.some(key => !own(value, key))) {
      throw Error('Invalid clear fields');
    }
  };
  const init = () => ({ view: { revision: 0, requestId: null, requestedAt: 0 }, pendingTools: {}, settledIds: [] });
  function validateView(value) {
    exact(value, ['revision', 'requestId', 'requestedAt']);
    if (!integer(value.revision) || !integer(value.requestedAt)
      || (value.revision === 0 ? value.requestId !== null || value.requestedAt !== 0 : !id(value.requestId))) {
      throw Error('Invalid clear view');
    }
    return value;
  }
  function validateState(value) {
    exact(value, ['view', 'pendingTools', 'settledIds']);
    validateView(value.view);
    if (!record(value.pendingTools) || Reflect.ownKeys(value.pendingTools).length > MAX_PENDING
      || !Array.isArray(value.settledIds) || value.settledIds.length > MAX_SETTLED
      || !value.settledIds.every(id) || new Set(value.settledIds).size !== value.settledIds.length) {
      throw Error('Invalid clear lifecycle');
    }
    for (const key of Reflect.ownKeys(value.pendingTools)) {
      const pending = value.pendingTools[key];
      exact(pending, ['requestedAt', 'seq']);
      if (!id(key) || value.settledIds.includes(key) || !integer(pending.requestedAt) || !integer(pending.seq)) {
        throw Error('Invalid clear pending call');
      }
    }
    return value;
  }
  function settle(state, callId, output) {
    const remaining = { ...state.pendingTools };
    delete remaining[callId];
    const settled = { ...state, pendingTools: remaining,
      settledIds: [...state.settledIds, callId].slice(-MAX_SETTLED) };
    try {
      exact(output, ['kind', 'status', 'revision', 'requestId', 'requestedAt']);
      if (output.kind !== CLEAR_KIND || output.status !== 'recorded'
        || !integer(output.revision) || output.revision !== state.view.revision + 1
        || output.requestId !== callId || output.requestedAt !== state.pendingTools[callId].requestedAt) return settled;
      return { ...settled, view: { revision: output.revision, requestId: callId, requestedAt: output.requestedAt } };
    } catch { return settled; }
  }
  function apply(state, event) {
    if (!record(event) || !integer(event.seq) || !record(event.data)) return state;
    const data = event.data;
    if (event.type === 'tool/call' && data.name === CLEAR_TOOL) {
      if (!id(data.callId) || !integer(event.time) || typeof data.arguments !== 'string'
        || own(state.pendingTools, data.callId) || state.settledIds.includes(data.callId)) return state;
      try { exact(JSON.parse(data.arguments), []); } catch { return state; }
      const entries = Object.entries(state.pendingTools).slice(-(MAX_PENDING - 1));
      return { ...state, pendingTools: Object.fromEntries([...entries,
        [data.callId, { requestedAt: event.time, seq: event.seq }]]) };
    }
    if (event.type !== 'tool/result') return state;
    const message = data.message;
    if (!record(message) || message.role !== 'tool' || !record(message.source) || message.source.kind !== 'tool'
      || message.source.callId !== message.toolCallId || !id(message.toolCallId)
      || !own(state.pendingTools, message.toolCallId) || event.seq <= state.pendingTools[message.toolCallId].seq) return state;
    let output = null;
    if (!data.error && message.isError !== true && Array.isArray(message.content)) {
      const blocks = message.content;
      if (blocks.length && blocks.every(block => record(block) && block.type === 'text' && typeof block.text === 'string')) {
        try { output = JSON.parse(blocks.map(block => block.text).join('')); } catch { /* Terminal, but not a clear request. */ }
      }
    }
    return settle(state, message.toolCallId, output);
  }
  // Shared across services from this bridge, so adapters cannot bypass a reservation.
  const reservations = new WeakMap();
  function createService(stateOf) {
    function run(session, args, source) {
      if (!session || typeof session !== 'object') throw Error('A live Session is required');
      exact(args, []);
      const state = stateOf(session);
      if (!state) throw Error('Math board clear projection is unavailable');
      validateState(state);
      const callId = source?.id;
      if (!id(callId) || !own(state.pendingTools, callId)) {
        throw Error('Clear requests require their exact logged empty tool invocation');
      }
      const reserved = reservations.get(session);
      if (reserved && own(state.pendingTools, reserved.id) && state.pendingTools[reserved.id].seq === reserved.seq) {
        throw Error('Another clear request is still settling; retry after its result');
      }
      if (!integer(state.view.revision + 1)) throw Error('Clear revision exhausted');
      const pending = state.pendingTools[callId];
      const output = { kind: CLEAR_KIND, status: 'recorded', revision: state.view.revision + 1,
        requestId: callId, requestedAt: pending.requestedAt };
      reservations.set(session, { id: callId, seq: pending.seq });
      // Host commits this carrier in tool/result. No board data or client action occurs here.
      return output;
    }
    return { run };
  }
  return { init, apply, view: state => state.view, validateState, validateView, createService };
}
