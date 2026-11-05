/** Session-log settings bridge. Drawing objects never cross this boundary. */
export const CONFIG_KEY = 'eduBoardConfig';
export const CONFIG_TOOL = 'math_board_settings';
export const CONFIG_COMMAND = 'math-board-settings';
export const CONFIG_KIND = 'edu-board-config';
const MAX_CHANGES = 100;
const MAX_PENDING = 256;

export function createConfigBridge(M) {
  const own = (value, key) => Object.hasOwn(value, key);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  const clone = value => structuredClone(value);
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const exact = (value, required, optional = []) => {
    if (!record(value) || required.some(key => !own(value, key))
      || Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) throw Error('Invalid configuration fields');
  };
  const settings = value => {
    const result = M.validateSettings(value);
    if (!record(result)) throw Error('Settings validator must return canonical settings');
    return clone(result);
  };
  const initialView = () => ({ revision: 0, settings: settings(M.defaultSettings()), changes: [], floorRevision: 0 });
  const init = () => ({ view: initialView(), pendingTools: {}, pendingCommands: {} });
  function request(value) {
    if (value?.action === 'get') { exact(value, ['action']); return { action: 'get' }; }
    exact(value, ['action', 'settings', 'scope'], ['expectedRevision']);
    if (value.action !== 'set' || !['future', 'existing'].includes(value.scope)
      || (own(value, 'expectedRevision') && !integer(value.expectedRevision))) throw Error('Invalid configuration action, scope or revision');
    return { action: 'set', settings: settings(value.settings), scope: value.scope,
      ...(own(value, 'expectedRevision') ? { expectedRevision: value.expectedRevision } : {}) };
  }
  function parseRequest(text) { return request(JSON.parse(text)); }
  function change(value) {
    exact(value, ['kind', 'revision', 'settings', 'scope', 'status']);
    if (value.kind !== CONFIG_KIND || value.status !== 'recorded' || !integer(value.revision) || value.revision === 0
      || !['future', 'existing'].includes(value.scope)) throw Error('Invalid configuration change');
    return { kind: CONFIG_KIND, revision: value.revision, settings: settings(value.settings), scope: value.scope, status: 'recorded' };
  }
  function validateView(value) {
    exact(value, ['revision', 'settings', 'changes', 'floorRevision']);
    if (!integer(value.revision) || !integer(value.floorRevision) || value.floorRevision > value.revision
      || !Array.isArray(value.changes) || value.changes.length > MAX_CHANGES) throw Error('Invalid configuration view');
    settings(value.settings);
    let previousRevision = value.floorRevision, previousSeq = -1;
    for (const item of value.changes) {
      exact(item, ['seq', 'revision', 'settings', 'scope']);
      if (!integer(item.seq) || item.seq <= previousSeq || item.revision !== previousRevision + 1
        || !['future', 'existing'].includes(item.scope)) throw Error('Invalid configuration history');
      settings(item.settings); previousRevision = item.revision; previousSeq = item.seq;
    }
    if (previousRevision !== value.revision || (value.revision > 0 && value.changes.length === 0)
      || (value.changes.length && !equal(settings(value.changes.at(-1).settings), settings(value.settings)))) throw Error('Invalid latest configuration');
    return value;
  }
  function validateState(value) {
    exact(value, ['view', 'pendingTools', 'pendingCommands']); validateView(value.view);
    for (const pending of [value.pendingTools, value.pendingCommands]) {
      if (!record(pending) || Object.keys(pending).length > MAX_PENDING) throw Error('Invalid configuration pending calls');
      for (const [id, input] of Object.entries(pending)) {
        if (!id || id.length > 200 || request(input).action !== 'set') throw Error('Invalid configuration call');
      }
    }
    return value;
  }
  function pending(state, field, id, input) {
    if (typeof id !== 'string' || !id || id.length > 200) return state;
    const entries = Object.entries(state[field]).filter(([key]) => key !== id).slice(-(MAX_PENDING - 1));
    return { ...state, [field]: Object.fromEntries([...entries, [id, input]]) };
  }
  function settle(state, field, id, payload, seq) {
    if (typeof id !== 'string' || !own(state[field], id)) return state;
    const input = state[field][id], remaining = { ...state[field] }; delete remaining[id];
    const settled = { ...state, [field]: remaining };
    if (payload === null) return settled;
    try {
      const output = change(payload), current = state.view;
      if (output.revision !== current.revision + 1 || !equal(output.settings, input.settings) || output.scope !== input.scope
        || (own(input, 'expectedRevision') && input.expectedRevision !== current.revision)) return settled;
      const changes = [...current.changes, { seq, revision: output.revision, settings: output.settings, scope: output.scope }].slice(-MAX_CHANGES);
      return { ...settled, view: { revision: output.revision, settings: output.settings, changes,
        floorRevision: changes[0].revision - 1 } };
    } catch { return settled; }
  }
  function apply(state, event) {
    if (!record(event) || !integer(event.seq) || !record(event.data)) return state;
    const data = event.data;
    if (event.type === 'tool/call' && data.name === CONFIG_TOOL) {
      try { const input = parseRequest(data.arguments); return input.action === 'set' ? pending(state, 'pendingTools', data.callId, input) : state; }
      catch { return state; }
    }
    if (event.type === 'command/run' && data.name === CONFIG_COMMAND && data.source?.kind === 'user') {
      try { const input = parseRequest(data.args); return input.action === 'set' ? pending(state, 'pendingCommands', data.commandId, input) : state; }
      catch { return state; }
    }
    if (event.type === 'tool/result') {
      const message = data.message;
      if (!record(message) || message.role !== 'tool' || message.source?.kind !== 'tool'
        || message.source.callId !== message.toolCallId) return state;
      let output = null;
      if (!data.error && message.isError !== true && Array.isArray(message.content)) {
        const text = message.content.filter(block => block?.type === 'text').map(block => block.text).join('');
        try { output = JSON.parse(text); } catch { /* An unstructured result is never a settings update. */ }
      }
      return settle(state, 'pendingTools', message.toolCallId, output, event.seq);
    }
    if (event.type === 'command/done') {
      let output = null;
      if (data.kind === 'success' && typeof data.text === 'string') {
        try { output = JSON.parse(data.text); } catch { /* Failed parsing leaves only lifecycle cleanup. */ }
      }
      return settle(state, 'pendingCommands', data.commandId, output, event.seq);
    }
    return state;
  }
  /** One domain operation used by the agent tool and the user-command adapter. */
  function createService(stateOf) {
    const reservations = new WeakMap();
    function run(session, rawInput, source) {
      if (!session || typeof session !== 'object') throw Error('A live Session is required');
      const input = request(rawInput), state = stateOf(session);
      if (!state) throw Error('Math board configuration projection is unavailable');
      const current = state.view;
      if (input.action === 'get') return { kind: CONFIG_KIND, status: 'current', revision: current.revision, settings: clone(current.settings) };
      const field = source?.channel === 'tool' ? 'pendingTools' : source?.channel === 'command' ? 'pendingCommands' : null;
      if (!field || typeof source.id !== 'string' || !own(state[field], source.id) || !equal(state[field][source.id], input)) {
        throw Error('Configuration writes require their exact logged tool or user-command invocation');
      }
      const reserved = reservations.get(session);
      if (reserved && current.revision < reserved.revision && own(state[reserved.field], reserved.id)) {
        throw Error('Another configuration update is still settling; read settings and retry');
      }
      reservations.delete(session);
      if (own(input, 'expectedRevision') && input.expectedRevision !== current.revision) {
        throw Error(`Configuration revision changed: expected ${input.expectedRevision}, current ${current.revision}`);
      }
      const output = { kind: CONFIG_KIND, revision: current.revision + 1, settings: input.settings, scope: input.scope, status: 'recorded' };
      reservations.set(session, { id: source.id, field, revision: output.revision });
      // The caller framework commits this carrier in command/done or tool/result. No private log types.
      return clone(output);
    }
    return { run };
  }
  return { init, apply, view: state => state.view, validateView, validateState, request, createService };
}
