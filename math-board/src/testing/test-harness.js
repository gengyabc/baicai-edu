import assert from 'node:assert/strict';

// The one stand-in for React and the browser that both view test files mount a page with.
// A page is a function of hooks and refs; this runs them with persistent slots, settles
// effects, and lets a test drive the tree it produced. Keeping it here means a page test
// harness cannot grow a second, slightly different React stub.

/** Every element node a rendered tree contains, in render order. */
export const walk = (node) => (!node || typeof node !== 'object' ? []
  : [node, ...(node.children || []).flat(Infinity).flatMap(walk)]);

/** The text a node (and everything under it) shows. */
export const text = (node) => (typeof node === 'string' || typeof node === 'number' ? String(node)
  : node && typeof node === 'object' ? (node.children || []).flat(Infinity).map(text).join('') : '');

/**
 * Stateful hooks with persistent slots, dependency-aware effects, and an explicit render.
 *
 * Each component type owns its slots, exactly as React keeps a separate hook list per
 * component: a page that renders another page must not share a cursor with it. Values the
 * harness needs back (a ref, a state setter) live in the same slot record.
 */
export function createHooks() {
  const stores = new Map();
  let dirty = false;
  const effects = [];
  let tree;
  const storeFor = (type) => {
    if (!stores.has(type)) stores.set(type, { slots: [], cursor: 0, effects: [] });
    return stores.get(type);
  };
  const hooks = { current: null };
  const React = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useSyncExternalStore() {},
    useState(initial) {
      const store = hooks.current; const index = store.cursor++;
      if (!(index in store.slots)) store.slots[index] = { value: typeof initial === 'function' ? initial() : initial };
      return [store.slots[index].value, (next) => {
        const value = typeof next === 'function' ? next(store.slots[index].value) : next;
        if (!Object.is(value, store.slots[index].value)) { store.slots[index].value = value; dirty = true; }
      }];
    },
    useRef(current) { const store = hooks.current; const index = store.cursor++; return (store.slots[index] ||= { current }); },
    useEffect(callback, deps) {
      const store = hooks.current; const index = store.cursor++;
      const previous = store.slots[index];
      if (!previous || !deps || deps.some((value, i) => !Object.is(value, previous.deps?.[i]))) {
        store.effects.push(() => { previous?.cleanup?.(); store.slots[index] = { deps, cleanup: callback() }; });
      }
    },
    useMemo(factory) { return factory(); },
    useCallback(callback) { return callback; },
  };
  /**
   * Render once. \`expand(node, owner)\` turns the tree functors return into plain nodes:
   * it is where a harness decides how deeply to expand and which component owns each slot.
   */
  function render(build) {
    dirty = false;
    for (const store of stores.values()) store.cursor = 0;
    tree = build({ React, hooks, storeFor });
    for (const store of stores.values()) store.effects.splice(0).forEach((effect) => effect());
    return tree;
  }
  /** Render until every queued state change has settled. */
  function refresh(build) {
    let iterations = 0;
    do { render(build); assert.ok(++iterations < 20, 'Effects should settle'); } while (dirty);
    return tree;
  }
  /** Run one cleanup for every slot of every component, as unmounting a tree would. */
  function unmount() {
    for (const store of stores.values()) for (const slot of store.slots) slot?.cleanup?.();
  }
  return { React, storeFor, hooks, render, refresh, unmount, get tree() { return tree; } };
}

/**
 * Install a fake browser for one test and return the function that puts the real globals
 * back. Tests that mount a page call it in a `try/finally` (or through `withBrowser`).
 */
export function installBrowser(options = {}) {
  const storage = options.storage || new Map();
  const old = {
    window: globalThis.window, navigator: Object.getOwnPropertyDescriptor(globalThis, 'navigator'),
    localStorage: globalThis.localStorage, document: globalThis.document,
    createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL,
  };
  globalThis.window = {
    matchMedia: () => ({ matches: true }), location: { hostname: '127.0.0.1' },
    addEventListener() {}, removeEventListener() {},
    // A picker keeps the handle it resolved with, then marks itself current: the test
    // reaches the real file dialogs through this revision check.
    showOpenFilePicker: async () => {
      await Promise.resolve();
      throw Object.assign(new Error('no picker'), { name: 'NotSupportedError' });
    },
  };
  const documentListeners = new Map();
  globalThis.document = {
    addEventListener(type, handler) {
      const list = documentListeners.get(type) || [];
      list.push(handler);
      documentListeners.set(type, list);
    },
    removeEventListener(type, handler) {
      const list = documentListeners.get(type) || [];
      documentListeners.set(type, list.filter((item) => item !== handler));
    },
    activeElement: null,
  };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    locks: options.noLocks ? undefined : { request(_key, _opts, task) {
      if (options.lockQueue) { options.lockQueue.push(task); return Promise.resolve(); }
      task(); return Promise.resolve();
    } },
  } });
  globalThis.localStorage = {
    getItem: (name) => storage.get(name) ?? null,
    setItem: (name, value) => {
      if (options.storageFail?.(name)) throw new Error('Quota exceeded');
      storage.set(name, String(value));
    },
  };
  const exports = [];
  URL.createObjectURL = (blob) => { exports.push(blob); return `blob:test-${exports.length}`; };
  URL.revokeObjectURL = () => {};
  return {
    storage, exports, documentListeners,
    /** Dispatch a key press to the document listeners this page installed. */
    key(key, extra = {}) {
      for (const handler of documentListeners.get('keydown') || []) {
        handler({ key, preventDefault() {}, target: { closest: () => null, tagName: 'SVG' }, ...extra });
      }
    },
    restore() {
      globalThis.window = old.window;
      globalThis.localStorage = old.localStorage;
      globalThis.document = old.document;
      URL.createObjectURL = old.createObjectURL;
      URL.revokeObjectURL = old.revokeObjectURL;
      if (old.navigator) Object.defineProperty(globalThis, 'navigator', old.navigator);
      else delete globalThis.navigator;
    },
  };
}

/** Run `body` with a fake browser installed, restoring the real globals afterwards. */
export function withBrowser(options, body) {
  const browser = installBrowser(options);
  try { return body(browser); } finally { browser.restore(); }
}
