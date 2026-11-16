import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createGeometryModel } from '../src/geometry/model.js';
import { createGeometryPracticeFrames } from '../src/geometry/geometry-basics.js';

// The built client is the copy the page actually runs. Source tests pass even when
// build.mjs forgets to inline the chapter, so this reads client.js.
const bundle = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/geometry/geometry-edit.js', import.meta.url), 'utf8');

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

test('the built client appends the geometry edit chapter after construct and leaves basics registered', () => {
  assert.match(bundle, /const createGeometryEditChapter = function createGeometryEditChapter/, 'build.mjs must inline the chapter factory');
  assert.match(bundle, /geometryPracticeChapters: \[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter\]/, 'edit stays after construct, and adjust follows edit');
  assert.match(bundle, /const createGeometryBasicsChapter = function createGeometryBasicsChapter/);
  assert.match(bundle, /const createGeometryConstructChapter = function createGeometryConstructChapter/);
  assert.equal(factoryBody(bundle, 'createGeometryEditChapter'), factoryBody(source, 'createGeometryEditChapter'));
  assert.match(bundle, /steps = \['point','segment','triangle','polygon','circle','select-one','deselect','insert'\]/);
  assert.match(bundle, /steps = \['construct-parallelogram', 'construct-rectangle', 'construct-select-side', 'construct-midpoint', 'construct-drag', 'construct-auxiliary', 'construct-auxiliary-off'\]/);
});

test('the inlined edit chapter reads only its own parameters and host globals', () => {
  const hostGlobals = new Set(['G', 'emptyFrame', 'JSON', 'Math', 'Error', 'Object', 'Array', 'Boolean', 'Number', 'Set']);
  const code = `return (${factoryBody(bundle, 'createGeometryEditChapter')});`;
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
    if (hostGlobals.has(key) || key === 'createGeometryEditChapter') continue;
    assert.ok(false, `client.js inlines createGeometryEditChapter, which reads "${key}" without declaring it`);
  }
});

test('the built edit chapter rejects a duplicate rename and does not supply the text itself', () => {
  const G = createGeometryModel();
  const frames = createGeometryPracticeFrames(G);
  const factory = new Function('scope', `with (scope) { return (${factoryBody(bundle, 'createGeometryEditChapter')}); }`)({});
  const chapter = factory({ G, emptyFrame: frames.empty });
  assert.equal(chapter.id, 'geometry-edit');
  const frame = chapter.start(null);
  const goal = chapter.createGoal();
  assert.equal(goal.snapshot().step, 'edit-rename');
  assert.equal(frame.board.elements.some((item) => item.type === 'text'), false);
  const pointId = goal.snapshot().pointId;
  const other = frame.board.points.find((point) => point.id !== pointId);
  assert.throws(() => G.reduce(frame.board, { type: 'renamePoint', id: pointId, label: other.label }));
  goal.observe({ type: 'renamePoint', before: frame.board, after: frame.board, id: pointId, label: other.label });
  assert.equal(goal.snapshot().step, 'edit-rename', 'a duplicate label the model rejects does not pass');
});

test('the shipped edit module has no module-scope helpers of its own', async () => {
  assert.equal(source.match(/^(?:export\s+)?(?:function|const\s*\w+\s*=\s*(?:function|\())/gm)?.length ?? 0, 1, 'only the factory itself may be top-level');
  assert.equal(source.match(/^export\s+(?!function)/gm)?.length ?? 0, 0, 'no other export besides the factory');
  assert.equal(source.match(/^import\s/gm)?.length ?? 0, 0);
  const listing = await readdir(new URL('../src/geometry/', import.meta.url));
  assert.ok(listing.length > 0);
  assert.ok((await stat(new URL('../src/geometry/geometry-edit.js', import.meta.url))).isFile());
});
