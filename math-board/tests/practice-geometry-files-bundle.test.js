import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createGeometryModel } from '../src/geometry/model.js';

// The built client is the copy the page actually runs. Source tests pass even when
// build.mjs forgets to inline the chapter, so this reads client.js.
const bundle = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/geometry/geometry-files.js', import.meta.url), 'utf8');

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

test('the built client appends the geometry file chapter after adjust', () => {
  assert.match(bundle, /const createGeometryFilesChapter = function createGeometryFilesChapter/, 'build.mjs must inline the chapter factory');
  assert.match(bundle, /geometryPracticeChapters: \[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter\]/, 'files is appended and the earlier chapters stay registered');
  assert.equal(factoryBody(bundle, 'createGeometryFilesChapter'), factoryBody(source, 'createGeometryFilesChapter'));
});

test('the inlined geometry file chapter reads only its own parameters and host globals', () => {
  const hostGlobals = new Set(['G', 'JSON', 'Number', 'Array', 'Math', 'Error']);
  const code = `return (${factoryBody(bundle, 'createGeometryFilesChapter')});`;
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
  let chapter;
  try { chapter = factory({ G: inert, emptyFrame: () => inert }); } catch { /* names above the throw are recorded */ }
  try { chapter.createGoal({}); } catch { /* an empty goal is invalid; the lookup still counts */ }
  try { chapter.skip({ index: 0 }, {}); } catch { /* the inert model stops after Math and JSON */ }
  for (const key of hits) {
    if (hostGlobals.has(key) || key === 'createGeometryFilesChapter') continue;
    assert.ok(false, `client.js inlines createGeometryFilesChapter, which reads "${key}" without declaring it`);
  }
});

test('the built geometry file chapter keeps a download distinct from a later open', () => {
  const G = createGeometryModel();
  const emptyFrame = () => ({ board: G.empty() });
  const factory = new Function('scope', `with (scope) { return (${factoryBody(bundle, 'createGeometryFilesChapter')}); }`)({});
  const chapter = factory({ G, emptyFrame });
  assert.equal(chapter.id, 'geometry-files');
  const frame = chapter.start(null);
  assert.equal(frame.trace, undefined, 'geometry files do not create a trace');
  const goal = chapter.createGoal();
  const text = G.serialize(frame.board);
  goal.observe({ type: 'save', via: 'download', text });
  assert.equal(goal.snapshot().step, 'files-open');
  const after = G.reduce(frame.board, { type: 'addPoint', x: 360, y: 180 });
  goal.observe({ type: 'open', before: frame.board, after });
  assert.equal(goal.snapshot().step, 'files-complete');
  assert.equal(goal.snapshot().via, 'download', 'a later open does not turn a download into a verified disk save');
  assert.throws(() => chapter.createGoal({ index: 1, via: 'disk', text }), /Invalid file goal/);
});

test('the shipped geometry file module has no module-scope helpers of its own', async () => {
  assert.equal(source.match(/^(?:export\s+)?(?:function|const\s*\w+\s*=\s*(?:function|\())/gm)?.length ?? 0, 1, 'only the factory itself may be top-level');
  assert.equal(source.match(/^export\s+(?!function)/gm)?.length ?? 0, 0, 'no other export besides the factory');
  assert.equal(source.match(/^import\s/gm)?.length ?? 0, 0);
  const listing = await readdir(new URL('../src/geometry/', import.meta.url));
  assert.ok(listing.length > 0);
  assert.ok((await stat(new URL('../src/geometry/geometry-files.js', import.meta.url))).isFile());
});
