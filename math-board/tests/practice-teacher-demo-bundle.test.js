import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createGeometryModel } from '../src/geometry/model.js';
import { createGeometryPracticeFrames } from '../src/geometry/geometry-basics.js';

// The built client is the copy the page actually runs. Source tests pass even when
// build.mjs forgets to inline the chapter, so this reads client.js.
const bundle = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/teacher-demo/teacher-demo-practice.js', import.meta.url), 'utf8');
const demoSource = await readFile(new URL('../src/teacher-demo/geometry-demo-view.js', import.meta.url), 'utf8');

/** The `function name(...) {...}` text of one factory, from the bundle or a module. */
function factoryBody(text, name) {
  const head = Math.max(
    text.indexOf(`const ${name} = function ${name}(`),
    text.indexOf(`export function ${name}(`),
    text.indexOf(`function ${name}(`),
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

test('the built client inlines the teacher-demo chapter outside the geometry and quantity lists', () => {
  assert.match(bundle, /const createTeacherDemoChapter = function createTeacherDemoChapter/, 'build.mjs must inline the chapter factory');
  assert.match(bundle, /createTeacherDemoChapter,/);
  assert.match(bundle, /geometryPracticeChapters: \[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter\]/);
  assert.match(bundle, /quantityPracticeChapters: \[createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter, createQuantityFilesChapter\]/);
  assert.equal(/geometryPracticeChapters: \[[^\]]*createTeacherDemoChapter/.test(bundle), false);
  assert.equal(/quantityPracticeChapters: \[[^\]]*createTeacherDemoChapter/.test(bundle), false);
  assert.equal(factoryBody(bundle, 'createTeacherDemoChapter'), factoryBody(source, 'createTeacherDemoChapter'));
  assert.match(bundle, /steps = \['demo-read', 'demo-view', 'demo-copy', 'demo-return'\]/);
  assert.equal(/shared\.geometryTextBox\(/.test(factoryBody(bundle, 'createGeometryDemoPage')), false);
  assert.equal(/shared\.geometryTextBox\(/.test(demoSource), false);
  assert.match(factoryBody(bundle, 'createGeometryDemoPage'), /G\.textBox\(/);
});

test('the inlined teacher-demo chapter reads only its own parameters and host globals', () => {
  const hostGlobals = new Set(['G', 'emptyFrame', 'placeFigure', 'JSON', 'Error', 'Boolean', 'Number', 'String', 'Array', 'Object']);
  const code = `return (${factoryBody(bundle, 'createTeacherDemoChapter')});`;
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
  try { factory({ G: inert, emptyFrame: inert, placeFigure: inert }); } catch { /* names above the throw are recorded */ }
  for (const key of hits) {
    if (hostGlobals.has(key) || key === 'createTeacherDemoChapter') continue;
    assert.ok(false, `client.js inlines createTeacherDemoChapter, which reads "${key}" without declaring it`);
  }
});

test('the built teacher-demo chapter does not treat a render as continue', () => {
  const G = createGeometryModel();
  const frames = createGeometryPracticeFrames(G);
  const factory = new Function('scope', `with (scope) { return (${factoryBody(bundle, 'createTeacherDemoChapter')}); }`)({});
  const chapter = factory({ G, emptyFrame: frames.empty });
  assert.equal(chapter.id, 'teacher-demo-basics');
  let board = G.reduce(G.empty(), { type: 'addPoint', x: 80, y: 90 });
  board = G.reduce(board, { type: 'addPoint', x: 200, y: 90 });
  const [a, b] = board.points;
  board = G.reduce(board, { type: 'addElement', elementType: 'segment', points: [a.id, b.id], role: 'main' });
  const figure = { title: '线段', description: '只读', board };
  const id = chapter.identity(figure);
  chapter.arm({ id, board });
  const frame = chapter.start(null);
  const goal = chapter.createGoal();
  assert.equal(frame.board.elements.length, 0);
  assert.equal(goal.snapshot().step, 'demo-read');
  goal.observe({ type: 'render', figureId: id });
  goal.observe({ type: 'recorded', figureId: id });
  assert.equal(goal.snapshot().step, 'demo-read');
  goal.observe({ type: 'continue', figureId: id });
  assert.equal(goal.snapshot().step, 'demo-view');
});

test('the shipped teacher-demo module has no module-scope helpers of its own', async () => {
  assert.equal(source.match(/^(?:export\s+)?(?:function|const\s*\w+\s*=\s*(?:function|\())/gm)?.length ?? 0, 1, 'only the factory itself may be top-level');
  assert.equal(source.match(/^export\s+(?!function)/gm)?.length ?? 0, 0, 'no other export besides the factory');
  assert.equal(source.match(/^import\s/gm)?.length ?? 0, 0);
  const listing = await readdir(new URL('../src/teacher-demo/', import.meta.url));
  assert.ok(listing.includes('teacher-demo-practice.js'));
  assert.ok((await stat(new URL('../src/teacher-demo/teacher-demo-practice.js', import.meta.url))).isFile());
});
