import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { createGeometryModel } from '../geometry/model.js';
import { createPracticeProgress } from '../shell/practice-progress.js';
import { createQuantityFilesChapter } from './practice-files.js';

const M = createBoardModel(), T = createBoardTrace(M), G = createGeometryModel();
const emptyFrame = () => ({ board: M.empty(), trace: T.empty(), history: { past: [], future: [] },
  selection: [], zoom: 1, fit: true, attachTrace: true, toolValue: null, append: false, scroll: { left: 0, top: 0 } });
const chapter = () => createQuantityFilesChapter({ M, T, emptyFrame });
const geometryText = () => G.serialize(G.reduce(G.empty(), { type: 'addPoint', x: 200, y: 180 }));

function driver(previous) {
  const c = chapter();
  const frame = c.start(previous === undefined ? null : previous);
  const goal = c.createGoal();
  return { c, frame, goal, snap: () => goal.snapshot() };
}

test('a handle save passes only when the practice snapshot is actually saved', () => {
  const d = driver();
  assert.equal(d.c.id, 'quantity-files');
  assert.equal(d.c.titleKey, 'quantityPracticeFiles');
  assert.equal(d.c.optional, true);
  assert.deepEqual(d.c.steps, ['files-save', 'files-open']);
  assert.equal(d.snap().step, 'files-save');
  assert.equal(d.frame.board.objects.length, 1, 'a catalogue start has one practice object');
  assert.equal(d.frame.trace.totalChanges, 0, 'the seeded object is not a trace entry');
  const text = M.serialize(d.frame.board);
  d.goal.observe({ type: 'save' });
  assert.equal(d.snap().step, 'files-save', 'a click with no handle and no download does not pass');
  assert.equal(d.snap().via, null);
  assert.equal(d.snap().text, null);
  d.goal.observe({ type: 'abort' });
  assert.equal(d.snap().step, 'files-save', 'cancelling the picker does not pass');
  d.goal.observe({ type: 'save', via: 'handle', text: '{' });
  assert.equal(d.snap().step, 'files-save', 'invalid JSON does not pass');
  d.goal.observe({ type: 'save', via: 'handle', text: geometryText() });
  assert.equal(d.snap().step, 'files-save', 'a geometry file is not a quantity save');
  assert.equal(d.snap().via, null, 'a rejected save is not recorded as a disk save');
  const saved = d.goal.observe({ type: 'save', via: 'handle', text });
  assert.equal(saved.step, 'files-open');
  assert.equal(saved.via, 'handle');
  assert.equal(saved.text, text);
  assert.equal(JSON.parse(saved.text).kind, 'math-board');
  assert.equal(JSON.parse(saved.text).schemaVersion, 4);
  assert.equal(Object.hasOwn(JSON.parse(saved.text), 'trace'), false);
  assert.equal(d.frame.trace.totalChanges, 0);
});

test('a download save is recorded as a download and stays a download after the file is opened', () => {
  const d = driver();
  const text = M.serialize(d.frame.board);
  d.goal.observe({ type: 'save', via: 'download' });
  assert.equal(d.snap().step, 'files-save', 'a download without the snapshot does not pass');
  const saved = d.goal.observe({ type: 'save', via: 'download', text });
  assert.equal(saved.via, 'download');
  assert.equal(saved.step, 'files-open');
  const changed = M.reduce(d.frame.board, { type: 'add', shape: 'square' });
  d.goal.observe({ type: 'cancel' });
  d.goal.observe({ type: 'abort' });
  d.goal.observe({ type: 'open' });
  d.goal.observe({ type: 'open', before: changed, after: { nope: true } });
  d.goal.observe({ type: 'open', before: changed, after: JSON.parse(geometryText()) });
  d.goal.observe({ type: 'open', before: changed, after: changed });
  assert.equal(d.snap().step, 'files-open', 'cancel, invalid JSON, a geometry file, or an unchanged board do not pass');
  assert.equal(d.snap().via, 'download');
  const loaded = M.validate(JSON.parse(text));
  const trace = T.record(T.empty(), changed, loaded, { type: 'import' });
  const opened = d.goal.observe({ type: 'open', before: changed, after: loaded, trace, text: JSON.stringify({ trace }) });
  assert.equal(opened.step, 'files-complete');
  assert.equal(opened.via, 'download', 'a later open does not turn a download into a verified disk save');
  assert.equal(opened.text, text);
  assert.equal(opened.trace, undefined);
  assert.equal(d.frame.trace.totalChanges, 0, 'opening does not fill the practice trace');
});

test('start reuses a valid board and otherwise creates one object without a trace', () => {
  const previous = emptyFrame();
  const before = M.empty();
  previous.board = M.reduce(before, { type: 'add', shape: 'cat' });
  previous.trace = T.record(T.empty(), before, previous.board, { type: 'add', shape: 'cat' });
  const reused = chapter().start(previous);
  assert.equal(reused.board.objects[0].shape, 'cat');
  assert.equal(reused.board.objects.length, 1);
  assert.equal(reused.trace.totalChanges, 0, 'the practice trace stays empty and is not part of the file');
  const broken = emptyFrame();
  broken.board = JSON.parse(geometryText());
  const created = chapter().start(broken);
  assert.equal(created.board.objects.length, 1);
  assert.equal(created.board.schemaVersion, 4);
  assert.equal(created.trace.totalChanges, 0);
  const catalogue = chapter().fresh();
  assert.equal(chapter().createGoal(catalogue.saved).snapshot().step, 'files-save');
  assert.equal(catalogue.frame.board.objects.length, 1);
  assert.equal(catalogue.frame.trace.totalChanges, 0);
});

test('an inconsistent save is refused and not repaired', () => {
  const c = chapter();
  const text = M.serialize(c.start(null).board);
  const geometry = geometryText();
  const bad = { index: 1, via: 'handle', text: geometry };
  const copy = JSON.parse(JSON.stringify(bad));
  assert.throws(() => c.createGoal(bad), /Invalid file goal/);
  assert.deepEqual(bad, copy, 'a geometry file is not rewritten into a quantity file');
  assert.throws(() => c.createGoal({ index: 0, via: 'download', text }), /Invalid file goal/);
  assert.throws(() => c.createGoal({ index: 1, via: 'download' }), /Invalid file goal/);
  assert.throws(() => c.createGoal({ index: 1, via: 'verified', text }), /Invalid file goal/);
  assert.throws(() => c.createGoal({ index: 1, via: 'download', text: '{' }), /Invalid file goal/);
  assert.throws(() => c.createGoal([]), /Invalid file goal/);
  assert.throws(() => c.createGoal({ index: 9, via: 'download', text }), /Invalid file goal/);
  const kept = c.createGoal({ index: 2, via: 'download', text }).snapshot();
  assert.equal(kept.via, 'download');
  assert.equal(kept.text, text);
  assert.equal(kept.completed, true);
});

test('skip into open leaves a different board and does not save or open a file', () => {
  const c = chapter();
  let frame = c.start(null);
  let goal = c.createGoal();
  const next = c.skip(goal.snapshot(), frame);
  assert.equal(goal.snapshot().step, 'files-save', 'skip does not call observe');
  assert.equal(next.goal.index, 1);
  assert.equal(next.goal.via, null, 'skip does not record a handle or a download');
  assert.equal(next.goal.handle, undefined);
  const expected = M.validate(JSON.parse(next.goal.text));
  assert.notEqual(JSON.stringify(next.frame.board), JSON.stringify(expected), 'the open step can show a change');
  assert.equal(next.frame.trace.totalChanges, 0);
  frame = next.frame;
  goal = c.createGoal(next.goal);
  goal.observe({ type: 'open', before: frame.board, after: expected });
  assert.equal(goal.snapshot().step, 'files-complete');
  assert.equal(goal.snapshot().via, null);
  const again = c.skip(goal.snapshot(), frame);
  assert.equal(again.goal.index, 2);
  assert.equal(JSON.stringify(again.frame.board), JSON.stringify(frame.board), 'skip does not open a file');
});

test('skipping the file chapter does not block quantity basics', () => {
  const basics = {
    id: 'quantity-basics', titleKey: 'practiceBasics', steps: ['add'], start: emptyFrame,
    createGoal(saved = { index: 0 }) {
      let index = saved.index || 0;
      return {
        snapshot: () => ({ index, step: index ? 'complete' : 'add', total: 1, targets: [], completed: index === 1 }),
        observe(event) { if (event.type === 'add') index = 1; return this.snapshot(); },
      };
    },
  };
  const storage = new Map();
  const progress = createPracticeProgress({
    mode: 'quantity', chapters: [basics, chapter()],
    storage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  });
  let state = progress.enter('quantity-basics');
  state = progress.observe({ type: 'add', before: state.frame.board, after: M.reduce(state.frame.board, { type: 'add', shape: 'circle' }) }, state.frame);
  assert.equal(state.chapters.find((item) => item.id === 'quantity-basics').status, 'completed');
  state = progress.enter('quantity-files');
  state = progress.skip();
  state = progress.skip();
  assert.equal(state.chapters.find((item) => item.id === 'quantity-files').status, 'skipped');
  assert.equal(state.chapters.find((item) => item.id === 'quantity-basics').status, 'completed');
});

test('file goal copy exists in both languages and does not claim a verified disk save', async () => {
  const locales = {};
  for (const language of ['en', 'zh']) locales[language] = JSON.parse(await readFile(new URL('../../locale/' + language + '.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(locales.en).sort(), Object.keys(locales.zh).sort());
  for (const key of ['quantityPracticeFiles', 'practiceGoal_files-save', 'practiceGoal_files-open', 'practiceGoal_files-complete',
    'practiceFileSaved', 'practiceFileDownloaded', 'practiceFileLoaded']) {
    assert.equal(typeof locales.en[key], 'string', key);
    assert.equal(typeof locales.zh[key], 'string', key);
  }
  assert.match(locales.en.practiceFileDownloaded, /not verified/i);
  assert.match(locales.zh.practiceFileDownloaded, /尚未验证/);
  assert.notEqual(locales.en.practiceFileSaved, locales.en.fileSaved);
  assert.notEqual(locales.en.practiceFileDownloaded, locales.en.fileDownloaded);
  assert.match(locales.en.practiceFileLoaded, /real draft/i);
  assert.match(locales.en['practiceGoal_files-open'], /modification record/i);
});
