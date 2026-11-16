import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createGeometryModel } from '../src/geometry/model.js';
import { createGeometryPracticeFrames } from '../src/geometry/geometry-basics.js';

// The built client is the copy the page actually runs. Source tests pass even when
// build.mjs forgets to inline the chapter, so this reads client.js.
const bundle = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/geometry/geometry-construct.js', import.meta.url), 'utf8');

/** The `function name(...) {...}` text of one factory, from the bundle or a module. */
function factoryBody(text, name) {
  const head = Math.max(
    text.indexOf(`const ${name} = function ${name}(`),
    text.indexOf(`export function ${name}(`),
  );
  assert.ok(head >= 0, `${name} must be declared under its own function name`);
  const bodyStart = text.indexOf('{', text.indexOf(')', head));
  let depth = 0;
  for (let i = bodyStart; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(text.indexOf('function', head), i + 1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

test('the built client appends the geometry construct chapter and leaves basics registered', () => {
  assert.match(bundle, /const createGeometryConstructChapter = function createGeometryConstructChapter/, 'build.mjs must inline the chapter factory');
  assert.match(bundle, /geometryPracticeChapters: \[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter\]/, 'construct stays listed, edit follows it, and adjust follows edit');
  assert.match(bundle, /const createGeometryBasicsChapter = function createGeometryBasicsChapter/);
  assert.equal(factoryBody(bundle, 'createGeometryConstructChapter'), factoryBody(source, 'createGeometryConstructChapter'));
  assert.match(bundle, /steps = \['point','segment','triangle','polygon','circle','select-one','deselect','insert'\]/);
});

test('the inlined construct chapter reads only its own parameters and host globals', () => {
  const hostGlobals = new Set(['G', 'emptyFrame', 'JSON', 'Math', 'Error', 'Object', 'Array', 'Boolean', 'Number']);
  const code = `return (${factoryBody(bundle, 'createGeometryConstructChapter')});`;
  const hits = new Set();
  const trap = new Proxy({}, {
    has: (_target, key) => { hits.add(String(key)); return true; },
    get: (_target, key) => (key === Symbol.toPrimitive ? () => '' : () => undefined),
  });
  const factory = new Function('scope', `with (scope) { ${code} }`)(trap);
  const inert = (() => {
    const stub = new Proxy(function () {}, {
      get: (_target, key) => (key === Symbol.toPrimitive ? () => 0 : stub),
      apply: () => stub,
      construct: () => stub,
    });
    return stub;
  })();
  try { factory({ G: inert, emptyFrame: inert }); } catch { /* names above the throw are recorded */ }
  for (const key of hits) {
    if (hostGlobals.has(key) || key === 'createGeometryConstructChapter') continue;
    assert.ok(false, `client.js inlines createGeometryConstructChapter, which reads "${key}" without declaring it`);
  }
});

test('the built construct chapter rejects a plain polygon and supplies no parallelogram of its own', () => {
  const G = createGeometryModel();
  const frames = createGeometryPracticeFrames(G);
  const factory = new Function('scope', `with (scope) { return (${factoryBody(bundle, 'createGeometryConstructChapter')}); }`)({});
  const chapter = factory({ G, emptyFrame: frames.empty });
  assert.equal(chapter.id, 'geometry-construct');
  const frame = chapter.start(null);
  const goal = chapter.createGoal();
  assert.equal(goal.snapshot().step, 'construct-parallelogram');
  assert.equal(frame.board.elements.some((item) => item.type === 'parallelogram'), false);
  const before = frame.board;
  let board = before;
  const ids = [];
  for (const [x, y] of [[200, 180], [400, 180], [280, 320]]) {
    if (board.points.some((point) => point.x === x && point.y === y)) {
      ids.push(board.points.find((point) => point.x === x && point.y === y).id);
      continue;
    }
    board = G.reduce(board, { type: 'addPoint', x, y });
    ids.push(board.points.at(-1).id);
  }
  const polygon = G.reduce(board, { type: 'addElement', elementType: 'polygon', points: ids.slice(0, 3), role: 'main' });
  goal.observe({ type: 'draw', tool: 'polygon', before: board, after: polygon, closed: true, role: 'main' });
  assert.equal(goal.snapshot().step, 'construct-parallelogram', 'a plain polygon is not a parallelogram');
});

test('the shipped construct module has no module-scope helpers of its own', async () => {
  assert.equal(source.match(/^(?:export\s+)?(?:function|const\s*\w+\s*=\s*(?:function|\())/gm)?.length ?? 0, 1, 'only the factory itself may be top-level');
  assert.equal(source.match(/^export\s+(?!function)/gm)?.length ?? 0, 0, 'no other export besides the factory');
  assert.equal(source.match(/^import\s/gm)?.length ?? 0, 0);
  const listing = await readdir(new URL('../src/geometry/', import.meta.url));
  assert.ok(listing.length > 0);
  assert.ok((await stat(new URL('../src/geometry/geometry-construct.js', import.meta.url))).isFile());
});
