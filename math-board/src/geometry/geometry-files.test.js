import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createGeometryModel } from './model.js';
import { createGeometryPracticeFrames } from './geometry-basics.js';
import { createBoardModel } from '../quantity/model.js';
import { createPracticeProgress } from '../shell/practice-progress.js';
import { createGeometryFilesChapter } from './geometry-files.js';

const G = createGeometryModel();
const M = createBoardModel();
const frames = createGeometryPracticeFrames(G);
const chapter = () => createGeometryFilesChapter({ G, emptyFrame: frames.empty });
const quantityText = () => M.serialize(M.reduce(M.empty(), { type: 'add', shape: 'circle' }));

function driver(previous) {
  const c = chapter();
  const frame = c.start(previous === undefined ? null : previous);
  const goal = c.createGoal();
  return { c, frame, goal, snap: () => goal.snapshot() };
}

test('a handle save passes only when the geometry snapshot is actually saved', () => {
  const d = driver();
  assert.equal(d.c.id, 'geometry-files');
  assert.equal(d.c.titleKey, 'geometryPracticeFiles');
  assert.equal(d.c.optional, true);
  assert.deepEqual(d.c.steps, ['files-save', 'files-open']);
  assert.equal(d.frame.board.points.length, 1);
  assert.equal(d.frame.trace, undefined, 'geometry has no modification record');
  assert.equal(d.snap().trace, undefined);
  const text = G.serialize(d.frame.board);
  d.goal.observe({ type: 'save' });
  assert.equal(d.snap().step, 'files-save', 'a click with no handle and no download does not pass');
  d.goal.observe({ type: 'abort' });
  assert.equal(d.snap().step, 'files-save', 'cancelling the picker does not pass');
  d.goal.observe({ type: 'save', via: 'handle', text: '{' });
  d.goal.observe({ type: 'save', via: 'handle', text: quantityText() });
  assert.equal(d.snap().step, 'files-save', 'invalid JSON or a quantity file does not pass');
  assert.equal(d.snap().via, null);
  const saved = d.goal.observe({ type: 'save', via: 'handle', text });
  assert.equal(saved.step, 'files-open');
  assert.equal(saved.via, 'handle');
  assert.equal(saved.text, text);
  assert.equal(JSON.parse(saved.text).kind, 'geometry-board');
  assert.equal(JSON.parse(saved.text).schemaVersion, 1);
  assert.equal(d.frame.trace, undefined);
});

test('a download save stays a download after a same-mode open', () => {
  const d = driver();
  const text = G.serialize(d.frame.board);
  const saved = d.goal.observe({ type: 'save', via: 'download', text });
  assert.equal(saved.via, 'download');
  const changed = G.reduce(d.frame.board, { type: 'addPoint', x: 360, y: 180 });
  d.goal.observe({ type: 'cancel' });
  d.goal.observe({ type: 'abort' });
  d.goal.observe({ type: 'open', before: changed, after: JSON.parse(quantityText()) });
  d.goal.observe({ type: 'open', before: changed, after: changed });
  assert.equal(d.snap().step, 'files-open');
  const loaded = G.validate(JSON.parse(text));
  const opened = d.goal.observe({ type: 'open', before: changed, after: loaded, trace: { totalChanges: 4 } });
  assert.equal(opened.step, 'files-complete');
  assert.equal(opened.via, 'download');
  assert.equal(opened.text, text);
  assert.equal(opened.trace, undefined, 'opening does not create a geometry trace');
  assert.equal(d.frame.trace, undefined);
});

test('start reuses a point and otherwise creates one without observing it', () => {
  const previous = frames.empty();
  previous.board = G.reduce(G.empty(), { type: 'addPoint', x: 140, y: 160 });
  const id = previous.board.points[0].id;
  const reused = chapter().start(previous);
  assert.equal(reused.board.points[0].id, id);
  assert.equal(reused.trace, undefined);
  const broken = frames.empty();
  broken.board = JSON.parse(quantityText());
  const created = chapter().start(broken);
  assert.equal(created.board.points.length, 1);
  assert.equal(created.board.schemaVersion, 1);
  const catalogue = chapter().fresh();
  assert.equal(chapter().createGoal(catalogue.saved).snapshot().step, 'files-save');
  assert.equal(catalogue.frame.board.points.length, 1);
});

test('an inconsistent geometry save is refused and not repaired', () => {
  const c = chapter();
  const text = G.serialize(c.start(null).board);
  const bad = { index: 1, via: 'handle', text: quantityText() };
  const copy = JSON.parse(JSON.stringify(bad));
  assert.throws(() => c.createGoal(bad), /Invalid file goal/);
  assert.deepEqual(bad, copy, 'a quantity file is not rewritten into a geometry file');
  assert.throws(() => c.createGoal({ index: 0, via: 'handle', text }), /Invalid file goal/);
  assert.throws(() => c.createGoal({ index: 1, via: 'download', text: '{' }), /Invalid file goal/);
  assert.throws(() => c.createGoal({ index: 1, via: 'disk', text }), /Invalid file goal/);
  const kept = c.createGoal({ index: 1, via: 'download', text }).snapshot();
  assert.equal(kept.via, 'download');
  assert.equal(kept.step, 'files-open');
});

test('skip into open leaves a different board and does not save or open a file', () => {
  const c = chapter();
  const frame = c.start(null);
  const goal = c.createGoal();
  const next = c.skip(goal.snapshot(), frame);
  assert.equal(goal.snapshot().step, 'files-save', 'skip does not call observe');
  assert.equal(next.goal.via, null);
  assert.equal(next.goal.handle, undefined);
  const expected = G.validate(JSON.parse(next.goal.text));
  assert.notEqual(JSON.stringify(next.frame.board), JSON.stringify(expected));
  assert.equal(next.frame.trace, undefined);
  const opened = c.createGoal(next.goal);
  opened.observe({ type: 'open', before: next.frame.board, after: expected });
  assert.equal(opened.snapshot().via, null);
  assert.equal(opened.snapshot().step, 'files-complete');
});

test('skipping the geometry file chapter does not block geometry basics', () => {
  const basics = {
    id: 'geometry-basics', titleKey: 'geometryPracticeBasics', steps: ['point'], start: frames.empty,
    createGoal(saved = { index: 0 }) {
      let index = saved.index || 0;
      return {
        snapshot: () => ({ index, step: index ? 'complete' : 'point', total: 1, targets: [], completed: index === 1 }),
        observe(event) { if (event.type === 'draw') index = 1; return this.snapshot(); },
      };
    },
  };
  const storage = new Map();
  const progress = createPracticeProgress({
    mode: 'geometry', chapters: [basics, chapter()],
    storage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  });
  let state = progress.enter('geometry-basics');
  state = progress.observe({ type: 'draw' }, state.frame);
  assert.equal(state.chapters.find((item) => item.id === 'geometry-basics').status, 'completed');
  state = progress.enter('geometry-files');
  state = progress.skip();
  state = progress.skip();
  assert.equal(state.chapters.find((item) => item.id === 'geometry-files').status, 'skipped');
  assert.equal(state.chapters.find((item) => item.id === 'geometry-basics').status, 'completed');
});

test('geometry file goal copy exists in both languages', async () => {
  const locales = {};
  for (const language of ['en', 'zh']) locales[language] = JSON.parse(await readFile(new URL('../../locale/' + language + '.json', import.meta.url), 'utf8'));
  for (const key of ['geometryPracticeFiles', 'geometryPracticeGoal_files-save', 'geometryPracticeGoal_files-open', 'geometryPracticeGoal_files-complete']) {
    assert.equal(typeof locales.en[key], 'string', key);
    assert.equal(typeof locales.zh[key], 'string', key);
  }
  assert.match(locales.en['geometryPracticeGoal_files-save'], /not verified/i);
  assert.match(locales.en['geometryPracticeGoal_files-open'], /quantity/i);
});
