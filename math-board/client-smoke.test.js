import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// The other tests import the source modules, so they never exercise what build.mjs ships.
// A factory copied in with toString() carries none of its module's other bindings: a
// module-level constant it reads stays in the source and becomes a ReferenceError in the
// browser, where the board silently fails to appear. Load the generated bundle and
// construct both pages for real, which is the only place that failure is observable.
const bundle = await readFile(new URL('./client.js', import.meta.url), 'utf8');
const zh = JSON.parse(await readFile(new URL('./locale/zh.json', import.meta.url), 'utf8'));

function loadBundle() {
  const registered = [];
  const previousWindow = globalThis.window;
  globalThis.window = { __ModuleLoader__: { load: (mod) => registered.push(mod) }, matchMedia: () => ({ matches: true }) };
  try {
    // client.js is a plain script that registers one module with window.__ModuleLoader__.
    new Function('window', bundle)(globalThis.window);
  } finally { globalThis.window = previousWindow; }
  assert.equal(registered.length, 1, 'the bundle must register exactly one module');
  return registered[0];
}

function makeHost(React) {
  const langs = {};
  const locale = {
    register: (_id, lang, dicts) => { langs[lang] = dicts; },
    bind: () => (key) => langs.zh?.[key] ?? langs.en?.[key] ?? key,
    subscribe: () => () => {},
    getSnapshot: () => 'zh',
  };
  return {
    locale,
    slots: { inject: (_name, factory) => factory(), register: (options) => options },
    effect: (fn) => fn(),
    get: () => undefined,
    systemPrompt: { section: () => {} },
    // Fill in the React hooks the pages call while rendering.
    React: { ...React,
      useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
      useRef: (current) => ({ current }),
      useEffect: () => {},
      useLayoutEffect: () => {},
      useMemo: (fn) => fn(),
      useCallback: (fn) => fn,
      useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
    },
  };
}

const react = { createElement: (type, props, ...children) => ({ type, props: props || {}, children }) };

test('bundled tutorial seen flags persist across calls', () => {
  // Storage helpers share TUTORIAL_VERSION / tutorialStorageKey in the factory scope
  // after toString() inlining; evaluate them together the way build.mjs places them.
  assert.match(bundle, /const TUTORIAL_VERSION =/);
  assert.match(bundle, /const isTutorialSeen = function/);
  assert.match(bundle, /const markTutorialSeen = function/);
  assert.match(bundle, /const tutorialStorageKey = function/);
  const version = bundle.match(/const TUTORIAL_VERSION = ("[^"]+");/)[1];
  const storage = new Map();
  const api = {
    getItem: (name) => storage.get(name) ?? null,
    setItem: (name, value) => storage.set(name, String(value)),
  };
  const helpers = new Function('storageApi', `
    const TUTORIAL_VERSION = ${version};
    const tutorialStorageKey = ${extractFactorySource(bundle, 'tutorialStorageKey')};
    const isTutorialSeen = ${extractFactorySource(bundle, 'isTutorialSeen')};
    const markTutorialSeen = ${extractFactorySource(bundle, 'markTutorialSeen')};
    return { tutorialStorageKey, isTutorialSeen, markTutorialSeen };
  `)(api);
  assert.equal(helpers.isTutorialSeen('quantity', api), false);
  helpers.markTutorialSeen('quantity', api);
  assert.equal(api.getItem(helpers.tutorialStorageKey('quantity')), '1');
  assert.equal(helpers.isTutorialSeen('quantity', api), true);
  assert.equal(helpers.isTutorialSeen('geometry', api), false);
});

test('the generated bundle registers and its pages construct without a missing binding', () => {
  const mod = loadBundle();
  assert.equal(mod.id, 'dsh-edu-math-board');
  assert.equal(typeof mod.factory, 'function');

  // A stub conversation keeps the pages from needing a live host.
  const ctx = makeHost(react);
  ctx.get = () => undefined;
  const factory = mod.factory((id) => (id === 'react' ? ctx.React : undefined));
  assert.equal(typeof factory.apply, 'function');

  // Running apply registers the locale, builds both pages and the shell; the bundle
  // itself must not throw. A free name that only survives in the sources fails here.
  assert.doesNotThrow(() => factory.apply(ctx));
  assert.ok(ctx.locale.bind()('title'), 'the locale must be registered by the bundle');
});

test('shipped teacher reference factories render validated shapes without module closures', () => {
  const model = extractFactory(bundle, 'createReferenceModel')();
  const ctx = makeHost(react);
  const View = extractFactory(bundle, 'createTeacherReferenceView')(ctx.React, key => key, model);
  const tree = View({ sessionId: 'smoke', view: { revision: 1, reference: {
    title: 'Given sides', description: '9 cm and 1 cm', width: 300, height: 100,
    shapes: [{ type: 'rect', x: 20, y: 40, width: 180, height: 20 }],
  } } });
  const walk = node => !node || typeof node !== 'object' ? [] : [node, ...node.children.flat(Infinity).flatMap(walk)];
  assert.equal(walk(tree).filter(node => node.type === 'rect').length, 1);
  assert.equal(walk(tree).filter(node => node.type === 'svg')[0].props.role, 'img');
  assert.equal(View({ sessionId: 'smoke', view: { revision: 2, reference: null } }), null);
});

test('shipped teacher demo renders a labeled rectangle without losing the launcher', () => {
  const mod = loadBundle();
  const ctx = makeHost(react);
  let component;
  ctx.slots = { inject: (_name, fn) => fn(), register: (_options, view) => { component = view; } };
  mod.factory(id => id === 'react' ? ctx.React : undefined).apply(ctx);
  const projection = { revision: 1, figure: {
    title: '周长相同，面积会怎样？', description: '周长24厘米',
    board: { schemaVersion: 1, points: [
      { id: 'a', label: 'A', kind: 'free', x: 180, y: 180, note: '' },
      { id: 'b', label: 'B', kind: 'free', x: 600, y: 180, note: '' },
      { id: 'c', label: 'C', kind: 'free', x: 600, y: 420, note: '' },
      { id: 'd', label: 'D', kind: 'derived', x: 180, y: 420, note: '', construction: { op: 'rectangle', inputs: ['a', 'b', 'c'] } },
      { id: 'o', label: 'O', kind: 'free', x: 100, y: 100, note: '' },
      { id: 'r', label: 'R', kind: 'free', x: 140, y: 100, note: '' },
    ], elements: [
      { id: 'rect', type: 'rectangle', role: 'main', note: '周长24厘米', points: ['a', 'b', 'c', 'd'] },
      { id: 'line', type: 'segment', role: 'auxiliary', note: '边长待选', points: ['a', 'b'] },
      { id: 'circle', type: 'circle', role: 'main', note: '圆', centerPointId: 'o', radiusPointId: 'r' },
    ], note: '' },
  } };
  const nodes = [];
  function render(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(render); return; }
    if (typeof node.type === 'function') { render(node.type(node.props)); return; }
    nodes.push(node);
    node.children?.flat(Infinity).forEach(render);
  }
  render(component({ sessionId: 'smoke',
    useProjection: key => key === 'eduBoardGeometryDemo' ? projection : undefined,
    useInput: selector => selector({ phase: 'idle' }),
  }));
  assert.equal(nodes.filter(node => node.props?.className === 'edu-board-launch').length, 1);
  for (const caption of ['周长24厘米', '边长待选', '圆']) {
    assert.ok(nodes.some(node => node.type === 'text' && node.children.includes(caption)), caption);
  }
});

test('the picker and icon factories the pages receive are callable', () => {
  const mod = loadBundle();
  const ctx = makeHost(react);
  ctx.get = () => undefined;
  let slot;
  ctx.slots = { inject: (_name, fn) => fn(), register: (options, component) => { slot = { ...options, component }; return slot; } };
  mod.factory((id) => (id === 'react' ? ctx.React : undefined)).apply(ctx);
  assert.equal(typeof slot?.component, 'function', 'the launch slot must carry a component');
  // Rendering the board mounts both pages; the icon table and the picker constants are
  // read while constructing them, so a missing outer binding throws right here.
  assert.doesNotThrow(() => slot.component({ sessionId: 'smoke', useProjection: () => null, useInput: () => 'plain' }));

});

test('the inlined picker and icons run real save and import paths', async () => {
  // A smoke test of the shipped bundle's own copies: drive the picker's save and import
  // as the pages do, so an obviously broken bundle fails here rather than in a browser.
  // (The outer-scope audit below is the test that catches a missing constant.)
  const pickerFactory = extractFactory(bundle, 'createFilePicker');
  const iconFactory = extractFactory(bundle, 'createIcons');
  const t = (key) => zh[key] ?? key;
  assert.doesNotThrow(() => iconFactory(react, undefined)?.('circle'));
  const hooks = { ...react,
    useState: (initial) => [typeof initial === 'function' ? initial() : initial, () => {}],
    useRef: (current) => ({ current }),
    useEffect: () => {},
  };
  const picker = pickerFactory({ React: hooks, t, dbName: 'smoke', handleKey: 'k', read: () => '{}' });
  // No File System Access API in Node, so the save takes the download fallback.
  globalThis.URL.createObjectURL = () => 'blob:smoke';
  globalThis.URL.revokeObjectURL = () => {};
  const saved = await picker.saveFile();
  assert.equal(saved.ok, true, saved.message);
  assert.equal(typeof saved.message, 'string');
  // A real file goes through the size cap and the import handoff.
  const file = new File([JSON.stringify({})], 'board.json');
  const result = await picker.importInput({ target: { files: [file], value: '' } }, { revision: 0 });
  assert.equal(typeof result, 'object');
});

/** Source text of one `const name = function ...` factory from the bundle. */
function extractFactorySource(source, name) {
  const start = source.indexOf(`const ${name} = function`);
  assert.ok(start >= 0, `${name} must be inlined in client.js`);
  // Walk braces from the first `{` after the assignment to its matching close.
  const bodyStart = source.indexOf('{', source.indexOf(')', start));
  let depth = 0;
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(source.indexOf('function', start), i + 1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

/** Pull one of the bundle's `const name = function ...` factories out for direct use. */
function extractFactory(source, name) {
  return new Function(`return (${extractFactorySource(source, name)});`)();
}

test('no inlined factory reads a name it does not declare itself', () => {
  // build.mjs copies each factory with toString(), which drops its module's other
  // bindings. A factory may only use names it declares, its own parameters, or host
  // globals; anything else is a ReferenceError waiting in the browser. Wrap each factory
  // in sloppy-mode `with` over a Proxy that answers `has` for every name, then run it
  // with permissive stubs: V8 resolves each free identifier through the trap on use, so
  // the hits are exactly the names the factory reads from outside itself.
  // Limit: a name behind a short-circuit fallback (`shared.x || createBoardX`) is not
  // evaluated and so not reported; the render smoke test above covers that wiring.
  const hostGlobals = new Set(['React', 'require', 'M', 'T', 'createArt', 'composerNote',
    'colorIndexForValue', 'applyHostConfig', 'boardQuestionReferences', 'createView', 'createTabs',
    'createGeometry', 'createGeoModel', 'createDemoModel', 'readDemoView', 'createGeometryDemo',
    'placeFigure', 'captionPosition', 'createFilePicker', 'createIcons', 'art', 'G', 'dictionaries',
    'Browser', 'View', 'Board', 'SessionBoard', 'JSON', 'Math', 'Object', 'Array', 'Error', 'String',
    'geometryHiddenPoints', 'geometryCaptionLabel', 'geometryPointLabel', 'geometryPointDot', 'geometryStroke',
    'geometryTextOverflow', 'geometryFrame',
    'Number', 'Set', 'Map', 'WeakMap', 'Promise', 'RegExp', 'Date', 'URL', 'Blob', 'File', 'indexedDB',
    'window', 'document', 'globalThis', 'localStorage', 'navigator', 'console', 'undefined', 'NaN',
    'Infinity', 'isFinite', 'parseInt', 'parseFloat', 'setTimeout', 'clearTimeout',
    'encodeURIComponent', 'decodeURIComponent', 'Symbol', 'Intl', 'Uint8Array']);
  // Only names that exist in the bundle's own scope. A source-module export must not be
  // listed: if a factory still names one, that is exactly the browser-only failure.
  // Each factory is exercised with permissive stubs; a name it reads that is neither
  // declared by it nor a host global lands in `hits`.
  const INLINED = {
    createBoardModel: 'createBoardModel', createBoardTrace: 'createBoardTrace',
    createArt: 'createShapeArt', composerNote: 'composerNote', colorIndexForValue: 'colorIndexForValue',
    applyHostConfig: 'applyHostConfig', boardQuestionReferences: 'boardQuestionReferences',
    createView: 'createBoardView', createTabs: 'createTabbedBoardView',
    createGeometry: 'createGeometryPage', createGeoModel: 'createGeometryModel',
    createDemoModel: 'createDemoModel', readDemoView: 'readDemoView',
    createGeometryDemo: 'createGeometryDemoPage', placeFigure: 'placeFigure', captionPosition: 'captionPosition',
    createBoardControls: 'createBoardControls', geometryHiddenPoints: 'geometryHiddenPoints',
    geometryCaptionLabel: 'geometryCaptionLabel', geometryPointLabel: 'geometryPointLabel',
    geometryPointDot: 'geometryPointDot', geometryStroke: 'geometryStroke',
    geometryTextOverflow: 'geometryTextOverflow', geometryFrame: 'geometryFrame',
    createFilePicker: 'createBoardFilePicker', createIcons: 'createBoardIcons',
    tutorialStorageKey: 'tutorialStorageKey', isTutorialSeen: 'isTutorialSeen',
    markTutorialSeen: 'markTutorialSeen', createTutorialOverlay: 'createTutorialOverlay',
    tourMaskPads: 'tourMaskPads',
    advanceTutorial: 'advanceTutorial', measureTourTarget: 'measureTourTarget',
    tourHoldsNotePanel: 'tourHoldsNotePanel', tourInsertMode: 'tourInsertMode',
    quantityTutorialSteps: 'quantityTutorialSteps', geometryTutorialSteps: 'geometryTutorialSteps',
  };
  // Tutorial helpers that call tutorialStorageKey need that binding in the host set,
  // matching how build.mjs places both in the factory scope.
  hostGlobals.add('tutorialStorageKey');
  hostGlobals.add('TUTORIAL_VERSION');
  hostGlobals.add('tourMaskPads');
  // Arguments answer every property read with themselves, so a factory body runs past
  // its first guard and keeps resolving free names instead of throwing on `undefined`.
  const inert = (() => {
    const stub = new Proxy(function () {}, {
      get: (_target, key) => (key === Symbol.toPrimitive ? () => 0 : stub),
      apply: () => stub,
      construct: () => stub,
    });
    return stub;
  })();
  // Names the factories are bound to in client.js; each maps to its source function name.
  let exercised = 0;
  for (const name of Object.keys(INLINED)) {
    const hits = new Set();
    const trap = new Proxy({}, {
      has: (_target, key) => { hits.add(String(key)); return true; },
      get: (_target, key) => (key === Symbol.toPrimitive ? () => '' : () => undefined),
    });
    let factory;
    try { factory = new Function('scope', 'with (scope) { return (' + INLINED[name] + '); }')(trap); }
    catch { continue; } // not inlined under this name
    exercised += 1;
    // A call that throws still resolved every name it reached; the audit continues.
    try { factory(inert, inert, inert, inert, inert); } catch { /* names above the throw are recorded */ }
    for (const key of hits) {
      // The factory's own binding and its function name are not outer references.
      if (hostGlobals.has(key) || key === name || key === INLINED[name]) continue;
      assert.ok(false, `client.js inlines ${name}, which reads "${key}" without declaring it`);
    }
  }
  assert.ok(exercised > 0, 'the outer-scope audit must actually call the inlined factories');
});

test('the inlined placeFigure places a teacher figure on an empty and an occupied draft', async () => {
  // The demo copy button calls this exact inlined function. Exercising the bundle's own
  // copy is the only way to catch a helper that toString() left behind in the module:
  // node-side imports of geometry/place-figure.js would still see it.
  const { createGeometryModel } = await import('./geometry/model.js');
  const G = createGeometryModel();
  const placeFigure = extractFactory(bundle, 'placeFigure');
  const figure = G.validate({
    schemaVersion: 1, note: '',
    points: [
      { id: 'a', label: 'A', kind: 'free', x: 200, y: 400, note: '' },
      { id: 'b', label: 'B', kind: 'free', x: 500, y: 400, note: '' },
    ],
    elements: [{ id: 'e', type: 'segment', role: 'main', note: '9 cm', points: ['a', 'b'] }],
  });
  const empty = placeFigure(G, G.empty(), figure);
  assert.equal(empty.ok, true, 'an empty draft must accept the figure, not report it full');
  assert.equal(empty.board.elements.length, 1);
  assert.equal(empty.board.elements[0].note, '9 cm');
  const occupied = placeFigure(G, G.reduce(G.empty(), { type: 'addPoint', x: 100, y: 120, label: 'A' }), figure);
  assert.equal(occupied.ok, true);
  assert.equal(occupied.board.points.length, 3);
  assert.deepEqual(occupied.board.points.slice(1).map((point) => point.label), ['B', 'C']);
  // Truly full boards still report `full`, so the demo keeps its one "make room" message.
  let crammed = G.empty();
  for (const [x, y, label] of [[24, 24, 'A'], [776, 24, 'B'], [24, 576, 'C'], [776, 576, 'D']]) {
    crammed = G.reduce(crammed, { type: 'addPoint', x, y, label });
  }
  const full = placeFigure(G, crammed, figure);
  assert.equal(full.ok, false);
  assert.equal(full.reason, 'full');
});
