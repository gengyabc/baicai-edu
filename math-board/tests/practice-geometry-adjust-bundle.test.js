import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createGeometryModel } from '../src/geometry/model.js';
import { createGeometryPracticeFrames } from '../src/geometry/geometry-basics.js';

// The built client is the copy the page actually runs. Source tests pass even when
// build.mjs forgets to inline the chapter, so this reads client.js.
const bundle = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/geometry/geometry-adjust.js', import.meta.url), 'utf8');

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

test('the built client appends the geometry adjust chapter after edit and leaves the earlier chapters', () => {
  assert.match(bundle, /const createGeometryAdjustChapter = function createGeometryAdjustChapter/, 'build.mjs must inline the chapter factory');
  assert.match(bundle, /geometryPracticeChapters: \[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter\]/, 'adjust is listed after edit');
  assert.match(bundle, /const createGeometryBasicsChapter = function createGeometryBasicsChapter/);
  assert.match(bundle, /const createGeometryConstructChapter = function createGeometryConstructChapter/);
  assert.match(bundle, /const createGeometryEditChapter = function createGeometryEditChapter/);
  assert.equal(factoryBody(bundle, 'createGeometryAdjustChapter'), factoryBody(source, 'createGeometryAdjustChapter'));
  assert.match(bundle, /steps = \['adjust-grid', 'adjust-snap', 'adjust-undo', 'adjust-redo', 'adjust-zoom', 'adjust-scroll', 'adjust-fit', 'adjust-clear'\]/);
  assert.match(bundle, /steps = \['point','segment','triangle','polygon','circle','select-one','deselect','insert'\]/);
});

test('the inlined adjust chapter reads only its own parameters and host globals', () => {
  const hostGlobals = new Set(['G', 'emptyFrame', 'JSON', 'Error', 'Boolean', 'Number', 'String', 'Set']);
  const code = `return (${factoryBody(bundle, 'createGeometryAdjustChapter')});`;
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
    if (hostGlobals.has(key) || key === 'createGeometryAdjustChapter') continue;
    assert.ok(false, `client.js inlines createGeometryAdjustChapter, which reads "${key}" without declaring it`);
  }
});

test('the built adjust chapter refuses a grid point until the grid has been turned on', () => {
  const G = createGeometryModel();
  const frames = createGeometryPracticeFrames(G);
  const factory = new Function('scope', `with (scope) { return (${factoryBody(bundle, 'createGeometryAdjustChapter')}); }`)({});
  const chapter = factory({ G, emptyFrame: frames.empty });
  assert.equal(chapter.id, 'geometry-adjust');
  const frame = chapter.start(null);
  const goal = chapter.createGoal();
  assert.equal(goal.snapshot().step, 'adjust-grid');
  assert.equal(frame.grid, false);
  const after = G.reduce(frame.board, { type: 'addPoint', x: 320, y: 200 });
  goal.observe({ type: 'draw', tool: 'point', before: frame.board, after, grid: true, snap: true });
  assert.equal(goal.snapshot().step, 'adjust-grid', 'a point before the grid changes is not a geometry verdict');
  goal.observe({ type: 'grid', before: false, after: true });
  assert.equal(goal.snapshot().step, 'adjust-grid', 'the grid alone does not pass');
});

test('the shipped adjust module has no module-scope helpers of its own', async () => {
  assert.equal(source.match(/^(?:export\s+)?(?:function|const\s*\w+\s*=\s*(?:function|\())/gm)?.length ?? 0, 1, 'only the factory itself may be top-level');
  assert.equal(source.match(/^export\s+(?!function)/gm)?.length ?? 0, 0, 'no other export besides the factory');
  assert.equal(source.match(/^import\s/gm)?.length ?? 0, 0);
  const listing = await readdir(new URL('../src/geometry/', import.meta.url));
  assert.ok(listing.length > 0);
  assert.ok((await stat(new URL('../src/geometry/geometry-adjust.js', import.meta.url))).isFile());
});
