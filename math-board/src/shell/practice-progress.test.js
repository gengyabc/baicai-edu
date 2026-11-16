import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeProgress } from './practice-progress.js';

const chapters = ['basics', 'other', 'files'].map((id) => ({
  id, optional: id === 'files', steps: ['one', 'two'],
  start: () => ({ objects: [], note: '' }),
  createGoal: (saved = { index: 0 }) => {
    let index = saved.index;
    return { snapshot: () => ({ index, step: ['one', 'two', 'complete'][index], completed: index === 2 }),
      observe: (event) => { if (event.type === 'success') index++; } };
  },
}));
const memory = () => { const values = new Map(); return { getItem: (k) => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) }; };

test('skip remains distinct, skipped steps can be practised, retry preserves independent chapters and modes', () => {
  const storage = memory();
  const progress = createPracticeProgress({ mode: 'quantity', chapters, storage });
  progress.enter('other');
  progress.observe({ type: 'success' }, { objects: ['other'] });
  progress.observe({ type: 'success' }, { objects: ['other'] });
  progress.enter('basics');
  progress.skip(); progress.skip();
  assert.equal(progress.snapshot().chapters[0].status, 'skipped');
  progress.retryStep(0);
  progress.observe({ type: 'success' }, { objects: ['fixed'] });
  assert.deepEqual(progress.snapshot().chapters[0].states, ['completed', 'skipped']);
  progress.retryStep(1);
  progress.observe({ type: 'success' }, { objects: ['fixed'] });
  assert.equal(progress.snapshot().chapters[0].status, 'completed');
  progress.enter('basics', { retry: true });
  assert.equal(progress.snapshot().chapters[1].status, 'completed');
  assert.equal(progress.snapshot().chapters[2].status, 'not-started');
  const geometry = createPracticeProgress({ mode: 'geometry', chapters, storage });
  assert.equal(geometry.snapshot().chapters[0].status, 'not-started');
  assert.equal(progress.snapshot().chapters[0].status, 'in-progress');
});

for (const action of ['observe', 'skip']) test(`supplement ${action} preserves later completed and skipped steps and the paired continuation cursor across refresh`, () => {
  const chapter = { id: 'fixture', steps: ['one', 'two', 'three', 'four'], start: () => ({ object: 'start' }),
    createGoal(saved = { index: 0, target: 'start' }) {
      let state = { ...saved };
      return { snapshot: () => ({ ...state, completed: state.index === 4 }),
        observe(event) { if (event.type === 'success') state = { index: state.index + 1, target: event.nextTarget }; } };
    },
  };
  const storage = memory();
  let progress = createPracticeProgress({ mode: 'quantity', chapters: [chapter], storage });
  progress.enter(); progress.skip();
  progress.observe({ type: 'success', nextTarget: 'third' }, { object: 'third', history: [1, 2] });
  progress.skip();
  const continuation = { object: 'fourth-current', history: [1, 2, 3], zoom: 2 };
  progress.saveFrame(continuation);
  const continuationGoal = progress.snapshot().goal;
  progress.retryStep(0);
  progress = createPracticeProgress({ mode: 'quantity', chapters: [chapter], storage });
  progress.enter();
  if (action === 'observe') progress.observe({ type: 'success', nextTarget: 'supplement-only' }, { object: 'supplement-only' });
  else progress.skip();
  const result = progress.snapshot();
  assert.deepEqual(result.chapters[0].states, [action === 'observe' ? 'completed' : 'skipped', 'completed', 'skipped', 'in-progress']);
  assert.deepEqual(result.goal, continuationGoal, 'restore the saved pending cursor, not a fabricated target from the supplementary action');
  assert.deepEqual(result.frame, continuation);
  assert.deepEqual(progress.reset().frame, { object: 'third', history: [1, 2] }, 'later step reset start is not overwritten');
});

for (const action of ['observe', 'skip']) test(`supplement ${action} returns to completion without resetting later completed progress`, () => {
  const chapter = { ...chapters[0], steps: ['one', 'two', 'three'], createGoal(saved = { index: 0 }) {
    let index = saved.index;
    return { snapshot: () => ({ index, completed: index === 3 }), observe(event) { if (event.type === 'success') index++; } };
  } };
  const progress = createPracticeProgress({ mode: 'quantity', chapters: [chapter], storage: memory() });
  progress.enter('basics'); progress.skip();
  progress.observe({ type: 'success' }, { objects: ['middle'] });
  progress.observe({ type: 'success' }, { objects: ['finished'] });
  progress.retryStep(0);
  if (action === 'observe') progress.observe({ type: 'success' }, { objects: ['supplement'] });
  else progress.skip();
  assert.deepEqual(progress.snapshot().chapters[0].states, [action === 'observe' ? 'completed' : 'skipped', 'completed', 'completed']);
  assert.equal(progress.snapshot().goal.completed, true);
  assert.deepEqual(progress.snapshot().frame, { objects: ['finished'] });
});

for (const raw of ['{broken', JSON.stringify({ version: 999, entries: {} }), JSON.stringify({ version: 2, entries: { basics: { goal: { index: 88 } } } })]) {
  test(`invalid progress is isolated with an honest restart warning: ${raw}`, () => {
    const storage = memory();
    storage.setItem('baicai-edu-math-board:practice:v2:quantity', raw);
    const progress = createPracticeProgress({ mode: 'quantity', chapters, storage });
    const entered = progress.enter('basics');
    assert.notEqual(entered.persistence, 'saved');
    assert.equal(entered.goal.step, 'one');
    assert.equal(progress.enter('basics', { retry: true }).persistence, 'saved');
  });
}

test('resume remembers the active chapter rather than returning to basics', () => {
  const storage = memory();
  let progress = createPracticeProgress({ mode: 'quantity', chapters, storage });
  progress.enter('other');
  progress.observe({ type: 'success' }, { objects: ['chapter two'] });
  progress = createPracticeProgress({ mode: 'quantity', chapters, storage });
  assert.equal(progress.enter().current, 'other');
  assert.equal(progress.snapshot().goal.step, 'two');
});

test('new chapters may reuse previous practice, while independent entry supplies its own sufficient start', () => {
  const extension = { ...chapters[1], start: (previous) => previous ?? { objects: ['seed'], note: 'independent' } };
  const progress = createPracticeProgress({ mode: 'quantity', chapters: [chapters[0], extension], storage: memory() });
  progress.enter('basics');
  progress.saveFrame({ objects: ['kept'], note: 'continuous' });
  assert.deepEqual(progress.enter('other').frame, { objects: ['kept'], note: 'continuous' });
  const independent = createPracticeProgress({ mode: 'quantity', chapters: [extension], storage: memory() });
  assert.deepEqual(independent.enter('other').frame, { objects: ['seed'], note: 'independent' });
});

test('denied storage keeps memory practice usable but never reports saving', () => {
  const storage = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } };
  const progress = createPracticeProgress({ mode: 'quantity', chapters, storage });
  assert.notEqual(progress.enter('basics').persistence, 'saved');
  progress.observe({ type: 'success' }, { objects: ['a'] });
  assert.equal(progress.snapshot().goal.step, 'two');
  assert.notEqual(progress.snapshot().persistence, 'saved');
  assert.equal(progress.reset().goal.step, 'two');
});

test('chapters resume exact practice and reset to step start without awarding restored goals', () => {
  const storage = memory();
  let progress = createPracticeProgress({ mode: 'quantity', chapters, storage });
  assert.equal(progress.snapshot().chapters[0].status, 'not-started');
  progress.enter('basics');
  progress.observe({ type: 'success' }, { objects: ['a'], note: 'first', history: [1] });
  progress.saveFrame({ objects: ['a', 'b'], note: 'editing', history: [1, 2], zoom: 2 });
  progress = createPracticeProgress({ mode: 'quantity', chapters, storage });
  const resumed = progress.enter('basics');
  assert.equal(resumed.goal.step, 'two');
  assert.deepEqual(resumed.frame, { objects: ['a', 'b'], note: 'editing', history: [1, 2], zoom: 2 });
  assert.deepEqual(progress.reset().frame, { objects: ['a'], note: 'first', history: [1] });
  assert.equal(progress.snapshot().goal.step, 'two');
});
