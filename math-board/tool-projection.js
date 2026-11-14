// One session-log projection for a teacher-only tool: the tool call, its matching result,
// the revision the view it feeds is on, and the reservation that keeps two updates from
// overlapping. The geometry demo and the quantity reference are two configurations of this
// one protocol; nothing about how a pending call is matched or how `expectedRevision`
// guards a write lives in a second copy.

const MAX_PENDING = 128;

/** The record and key-set validators every projection and model reads a value with. */
export function createRecordHelpers(message) {
  const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const own = (value, key) => Object.hasOwn(value, key);
  const exact = (value, keys) => {
    if (!record(value) || keys.some((key) => !own(value, key))
      || Reflect.ownKeys(value).some((key) => !keys.includes(key))) throw Error(message);
  };
  return { record, own, exact };
}

/**
 * @param {object} config
 * @param {string} config.kind        projection kind written into results
 * @param {string} config.tool        the tool name whose calls this projection follows
 * @param {string} config.payload     the field holding the figure/reference on view
 * @param {(value: unknown) => void} config.validateView   view validator from the model
 * @param {(value: unknown) => object} config.validatePayload  payload validator from the model
 * @param {string} config.noun        the words used in errors ("demo", "reference")
 */
export function createToolProjection(config) {
  const { kind, tool, payload, validateView, validatePayload, noun } = config;
  const integer = (value) => Number.isSafeInteger(value) && value >= 0;
  const idValid = (id) => typeof id === 'string' && id.trim().length > 0 && id.length <= 200;
  const clone = (value) => structuredClone(value);
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const { record, own, exact } = createRecordHelpers(`Invalid ${noun} fields`);
  const viewOf = () => ({ revision: 0, [payload]: null });
  function request(value) {
    if (value?.action === 'get') { exact(value, ['action']); return { action: 'get' }; }
    if (value?.action === 'hide') exact(value, ['action', 'expectedRevision']);
    else if (value?.action === 'show') exact(value, ['action', 'expectedRevision', payload]);
    else throw Error(`Invalid ${noun} action`);
    if (!integer(value.expectedRevision) || value.expectedRevision === Number.MAX_SAFE_INTEGER) throw Error(`Invalid ${noun} revision`);
    return value.action === 'hide' ? { action: 'hide', expectedRevision: value.expectedRevision }
      : { action: 'show', expectedRevision: value.expectedRevision, [payload]: validatePayload(value[payload]) };
  }
  const init = () => ({ view: viewOf(), pendingTools: {} });
  function validateState(value) {
    exact(value, ['view', 'pendingTools']); validateView(value.view);
    if (!record(value.pendingTools) || Reflect.ownKeys(value.pendingTools).length > MAX_PENDING) throw Error(`Invalid ${noun} pending calls`);
    for (const id of Reflect.ownKeys(value.pendingTools)) {
      const pending = value.pendingTools[id];
      exact(pending, ['input', 'seq']);
      if (!idValid(id) || !integer(pending.seq) || request(pending.input).action === 'get') throw Error(`Invalid ${noun} pending call`);
    }
    return value;
  }
  function result(value) {
    exact(value, ['kind', 'status', 'revision', payload]);
    if (value.kind !== kind || value.status !== 'recorded' || !integer(value.revision) || value.revision === 0) throw Error(`Invalid ${noun} result`);
    return { kind, status: 'recorded', ...validateView({ revision: value.revision, [payload]: value[payload] }) };
  }
  function apply(state, event) {
    if (!record(event) || !integer(event.seq) || !record(event.data)) return state;
    const data = event.data;
    if (event.type === 'tool/call' && data.name === tool) {
      try {
        if (!idValid(data.callId) || typeof data.arguments !== 'string' || own(state.pendingTools, data.callId)) return state;
        const input = request(JSON.parse(data.arguments));
        if (input.action === 'get') return state;
        const entries = Object.entries(state.pendingTools).filter(([id]) => id !== data.callId).slice(-(MAX_PENDING - 1));
        return { ...state, pendingTools: Object.fromEntries([...entries, [data.callId, { input, seq: event.seq }]]) };
      } catch { return state; }
    }
    if (event.type !== 'tool/result') return state;
    const resultMessage = data.message;
    if (!record(resultMessage) || resultMessage.role !== 'tool' || !record(resultMessage.source) || resultMessage.source.kind !== 'tool'
      || resultMessage.source.callId !== resultMessage.toolCallId || !idValid(resultMessage.toolCallId)
      || !own(state.pendingTools, resultMessage.toolCallId)) return state;
    const pending = state.pendingTools[resultMessage.toolCallId];
    if (event.seq <= pending.seq) return state;
    const remaining = { ...state.pendingTools }; delete remaining[resultMessage.toolCallId];
    const settled = { ...state, pendingTools: remaining };
    if (data.error || resultMessage.isError === true || !Array.isArray(resultMessage.content)) return settled;
    try {
      if (resultMessage.content.length !== 1 || resultMessage.content[0]?.type !== 'text' || typeof resultMessage.content[0].text !== 'string') return settled;
      const output = result(JSON.parse(resultMessage.content[0].text)), current = state.view;
      const expected = pending.input.action === 'show' ? pending.input[payload] : null;
      if (pending.input.expectedRevision !== current.revision || output.revision !== current.revision + 1
        || !equal(output[payload], expected)) return settled;
      return { ...settled, view: { revision: output.revision, [payload]: output[payload] } };
    } catch { return settled; }
  }
  // Share reservations across adapters/services created by this projection.
  const reservations = new WeakMap();
  function createService(stateOf) {
    function run(session, rawInput, source) {
      if (!session || typeof session !== 'object') throw Error('A live Session is required');
      const input = request(rawInput), state = stateOf(session);
      if (!state) throw Error(`The ${noun} projection is unavailable`);
      validateState(state);
      const current = state.view;
      if (input.action === 'get') return { kind, status: 'current', ...validateView(current) };
      if ((source?.channel !== undefined && source.channel !== 'tool') || !idValid(source?.id)
        || !own(state.pendingTools, source.id) || !equal(state.pendingTools[source.id].input, input)) {
        throw Error(`A ${noun} write requires its exact logged tool invocation`);
      }
      const reserved = reservations.get(session);
      if (reserved && current.revision < reserved.revision && own(state.pendingTools, reserved.id)
        && state.pendingTools[reserved.id].seq === reserved.seq) {
        throw Error(`Another ${noun} update is still settling; get it again and retry`);
      }
      reservations.delete(session);
      if (input.expectedRevision !== current.revision) {
        throw Error(`The ${noun} revision changed: expected ${input.expectedRevision}, current ${current.revision}`);
      }
      const output = { kind, status: 'recorded', revision: current.revision + 1,
        [payload]: input.action === 'show' ? input[payload] : null };
      reservations.set(session, { id: source.id, seq: state.pendingTools[source.id].seq, revision: output.revision });
      return clone(output);
    }
    return { run };
  }
  return {
    init, apply, validateState, request, createService,
    view: (state) => validateView(state.view), validateView,
  };
}
