import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createBoardModel } from '../src/quantity/model.js';
import { createBoardTrace } from '../src/quantity/trace.js';

// Only the built bundle can tell whether an independent chapter actually ships: the
// source module passes its own tests whether or not build.mjs inlines it. Read the
// generated client and the factory source instead of trusting the registration.
const bundle = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/quantity/practice-adjust.js', import.meta.url), 'utf8');

/** The `function name(...) {...}` text of one factory, from the bundle or a module. */
function factoryBody(text, name) {
  // toString() of an exported function keeps its own name after `function`, while the
  // source module writes `export function name(...)`; accept either spelling.
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

test('the built client registers the quantity adjust chapter as an independent factory', () => {
  assert.match(bundle, /const createQuantityAdjustChapter = function createQuantityAdjustChapter/, 'build.mjs must inline the chapter factory');
  assert.match(bundle, /quantityPracticeChapters: \[createQuantityAdjustChapter\]/, 'the built browser map must append the factory');
  // The shipped copy is the source factory, not a stale hand-edited variant.
  assert.equal(factoryBody(bundle, 'createQuantityAdjustChapter'), factoryBody(source, 'createQuantityAdjustChapter'));
});

test('the inlined chapter reads only its own parameters and host globals', () => {
  const hostGlobals = new Set(['M', 'T', 'JSON', 'Number', 'Boolean', 'typeof', 'undefined', 'Error', 'delete']);
  const code = `return (${factoryBody(bundle, 'createQuantityAdjustChapter')});`;
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
  try { factory(inert, inert, inert); } catch { /* names above the throw are recorded */ }
  for (const key of hits) {
    if (hostGlobals.has(key) || key === 'createQuantityAdjustChapter') continue;
    assert.ok(false, `client.js inlines createQuantityAdjustChapter, which reads "${key}" without declaring it`);
  }
});

test('the built chapter drives the real model through its first committed goals', () => {
  const M = createBoardModel(), T = createBoardTrace(M);
  const emptyFrame = () => ({ board: M.empty(), trace: T.empty(), history: { past: [], future: [] }, selection: [], zoom: 1, fit: true, toolValue: null, attachTrace: true, append: false, scroll: { left: 0, top: 0 } });
  const factory = new Function('scope', `with (scope) { return (${factoryBody(bundle, 'createQuantityAdjustChapter')}); }`)({});
  const chapter = factory({ M, T, emptyFrame });
  assert.equal(chapter.id, 'quantity-adjust');
  const goal = chapter.createGoal();
  const level = M.defaultSettings().levels.find((item) => item.value === 10);
  goal.observe({ type: 'color', before: 1, after: 10, board: M.empty() });
  assert.equal(goal.snapshot().step, 'adjust-color-add');
  const before = chapter.start(null).board, after = M.reduce(before, { type: 'add', shape: 'circle', value: 10 });
  goal.observe({ type: 'add', before, after });
  assert.equal(goal.snapshot().step, 'adjust-pattern-add');
  assert.equal(goal.snapshot().level.color, level.color);
});

test('the shipped chapter module has no module-scope helpers of its own', async () => {
  // build.mjs inlines with toString(), which drops every binding outside the factory.
  // A top-level constant or import beside the factory would silently vanish in the
  // bundle, so the chapter keeps everything inside createQuantityAdjustChapter.
  assert.equal(source.match(/^(?:export\s+)?(?:function|const\s*\w+\s*=\s*(?:function|\())/gm)?.length ?? 0, 1, 'only the factory itself may be top-level');
  assert.equal(source.match(/^export\s+(?!function)/gm)?.length ?? 0, 0, 'no other export besides the factory');
  assert.equal(source.match(/^import\s/gm)?.length ?? 0, 0);
  const listing = await readdir(new URL('../src/quantity/', import.meta.url));
  assert.ok(listing.length > 0);
  assert.ok((await stat(new URL('../src/quantity/practice-adjust.js', import.meta.url))).isFile());
});
