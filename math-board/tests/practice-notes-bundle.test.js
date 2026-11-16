import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { createBoardModel } from '../src/quantity/model.js';
import { createBoardTrace } from '../src/quantity/trace.js';

// The built client is the copy the page actually runs. Source tests pass even when
// build.mjs forgets to inline the chapter, so this reads client.js.
const bundle = await readFile(new URL('../client.js', import.meta.url), 'utf8');
const source = await readFile(new URL('../src/quantity/practice-notes.js', import.meta.url), 'utf8');

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

test('the built client appends the quantity notes chapter after adjust and organize', () => {
  assert.match(bundle, /const createQuantityNotesChapter = function createQuantityNotesChapter/, 'build.mjs must inline the chapter factory');
  assert.match(bundle, /quantityPracticeChapters: \[createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter, createQuantityFilesChapter\]/, 'notes is appended and adjust and organize stay registered');
  assert.equal(factoryBody(bundle, 'createQuantityNotesChapter'), factoryBody(source, 'createQuantityNotesChapter'));
});

test('the inlined notes chapter reads only its own parameters and host globals', () => {
  const hostGlobals = new Set(['M', 'T', 'JSON', 'Number', 'Boolean', 'typeof', 'undefined', 'Error', 'Set', 'Object']);
  const code = `return (${factoryBody(bundle, 'createQuantityNotesChapter')});`;
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
    if (hostGlobals.has(key) || key === 'createQuantityNotesChapter') continue;
    assert.ok(false, `client.js inlines createQuantityNotesChapter, which reads "${key}" without declaring it`);
  }
});

test('the built notes chapter clears a prepared selection through the real model', () => {
  const M = createBoardModel(), T = createBoardTrace(M);
  const emptyFrame = () => ({ board: M.empty(), trace: T.empty(), history: { past: [], future: [] }, selection: [], zoom: 1, fit: true, toolValue: null, attachTrace: true, append: false, scroll: { left: 0, top: 0 } });
  const factory = new Function('scope', `with (scope) { return (${factoryBody(bundle, 'createQuantityNotesChapter')}); }`)({});
  const chapter = factory({ M, T, emptyFrame });
  assert.equal(chapter.id, 'quantity-notes');
  const frame = chapter.start(null);
  const goal = chapter.createGoal();
  assert.ok(frame.selection.length > 0, 'an empty selection is not this step');
  goal.observe({ type: 'select', selection: [goal.snapshot().targets[1]], after: frame.board });
  assert.equal(goal.snapshot().step, 'notes-deselect', 'selecting another object does not pass');
  goal.observe({ type: 'select', selection: [], after: frame.board });
  assert.equal(goal.snapshot().step, 'notes-board');
  const before = frame.board;
  goal.observe({ type: 'note', action: { type: 'note', value: '' }, target: 'board', before, after: before });
  assert.equal(goal.snapshot().step, 'notes-board', 'an unchanged board is not a board note');
});

test('the shipped notes module has no module-scope helpers of its own', async () => {
  assert.equal(source.match(/^(?:export\s+)?(?:function|const\s*\w+\s*=\s*(?:function|\())/gm)?.length ?? 0, 1, 'only the factory itself may be top-level');
  assert.equal(source.match(/^export\s+(?!function)/gm)?.length ?? 0, 0, 'no other export besides the factory');
  assert.equal(source.match(/^import\s/gm)?.length ?? 0, 0);
  const listing = await readdir(new URL('../src/quantity/', import.meta.url));
  assert.ok(listing.length > 0);
  assert.ok((await stat(new URL('../src/quantity/practice-notes.js', import.meta.url))).isFile());
});
