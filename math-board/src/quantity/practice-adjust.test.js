import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoardModel } from './model.js';
import { createBoardTrace } from './trace.js';
import { createQuantityAdjustChapter } from './practice-adjust.js';
const M = createBoardModel(), T = createBoardTrace(M);
const emptyFrame = () => ({ board: M.empty(), trace: T.empty(), history: { past: [], future: [] }, selection: [], zoom: 1, fit: true, toolValue: null, attachTrace: true, append: false, scroll: { left: 0, top: 0 } });
const chapter = () => createQuantityAdjustChapter({ M, T, emptyFrame });
test('library requires adding an absent pattern, using it, then hiding it without deleting objects', () => {
  const c = chapter(), frame = c.start(null), goal = c.createGoal({ index: 2 });
  const before = frame.board;
  goal.observe({ type: 'pattern', before, after: before, shape: 'star' });
  assert.equal(goal.snapshot().step, 'adjust-pattern-add');
  const configured = M.reduce(before, { type: 'configure', settings: { ...before.settings, shapes: [...before.settings.shapes, 'star'] }, scope: 'future' });
  goal.observe({ type: 'pattern', before, after: configured, shape: 'star' });
  assert.equal(goal.snapshot().step, 'adjust-pattern-use');
  const wrong = M.reduce(configured, { type: 'add', shape: 'circle' });
  goal.observe({ type: 'add', before: configured, after: wrong });
  assert.equal(goal.snapshot().step, 'adjust-pattern-use');
  const used = M.reduce(configured, { type: 'add', shape: 'star' });
  goal.observe({ type: 'add', before: configured, after: used });
  assert.equal(goal.snapshot().step, 'adjust-pattern-hide');
  const hidden = M.reduce(used, { type: 'configure', settings: { ...used.settings, shapes: used.settings.shapes.filter((s) => s !== 'star') }, scope: 'future' });
  goal.observe({ type: 'pattern', before: used, after: { ...hidden, objects: [] }, shape: 'star' });
  assert.equal(goal.snapshot().step, 'adjust-pattern-hide');
  goal.observe({ type: 'pattern', before: used, after: hidden, shape: 'star' });
  assert.equal(goal.snapshot().step, 'adjust-change');
});
test('hiding a pattern needs its later state and keeps every existing object', () => {
  const c = chapter(), start = c.start(null);
  const seeded = M.reduce(M.reduce(start.board, { type: 'add', shape: 'circle' }), { type: 'configure',
    settings: { ...start.board.settings, shapes: [...start.board.settings.shapes, 'star'] }, scope: 'future' });
  const goal = c.createGoal({ index: 4, pattern: 'star' });
  const used = M.reduce(seeded, { type: 'add', shape: 'star' });
  const hidden = M.reduce(used, { type: 'configure', settings: { ...used.settings, shapes: used.settings.shapes.filter((s) => s !== 'star') }, scope: 'future' });
  // Hiding a different pattern, or a toggle that changes nothing, is not this change.
  const other = M.reduce(seeded, { type: 'configure', settings: { ...seeded.settings, shapes: seeded.settings.shapes.filter((s) => s !== 'circle') }, scope: 'future' });
  goal.observe({ type: 'pattern', before: seeded, after: other, shape: 'circle' });
  assert.equal(goal.snapshot().step, 'adjust-pattern-hide', 'another pattern is not the newly enabled one');
  goal.observe({ type: 'pattern', before: seeded, after: seeded, shape: 'star' });
  assert.equal(goal.snapshot().step, 'adjust-pattern-hide', 'toggling another pattern is not this one');
  goal.observe({ type: 'pattern', before: used, after: { ...hidden, objects: [] }, shape: 'star' });
  assert.equal(goal.snapshot().step, 'adjust-pattern-hide', 'hiding must not delete its objects');
  const bare = M.reduce(used, { type: 'configure', settings: { ...used.settings, shapes: ['star'] }, scope: 'future' });
  goal.observe({ type: 'pattern', before: used, after: bare, shape: 'star' });
  assert.equal(goal.snapshot().step, 'adjust-pattern-hide', 'at least one rail pattern must remain');
});
test('explicit new addition must undo to its before state and redo to its after state; view needs zoom delta then fit', () => {
  const c = chapter(), frame = c.start(null), goal = c.createGoal({ index: 5 });
  const before = frame.board, after = M.reduce(before, { type: 'add', shape: 'circle' });
  goal.observe({ type: 'add', before, after: before });
  assert.equal(goal.snapshot().step, 'adjust-change');
  goal.observe({ type: 'add', before, after });
  assert.equal(goal.snapshot().step, 'adjust-undo');
  goal.observe({ type: 'undo', before: after, after });
  assert.equal(goal.snapshot().step, 'adjust-undo');
  goal.observe({ type: 'undo', before: after, after: before });
  assert.equal(goal.snapshot().step, 'adjust-redo');
  const restored = c.createGoal(goal.snapshot());
  restored.observe({ type: 'redo', before, after });
  assert.equal(restored.snapshot().step, 'adjust-zoom');
  restored.observe({ type: 'zoom', before: 2, after: 2 });
  assert.equal(restored.snapshot().step, 'adjust-zoom');
  restored.observe({ type: 'zoom', before: 1, after: 1.25 });
  assert.equal(restored.snapshot().step, 'adjust-fit');
  restored.observe({ type: 'fit', before: true, after: true });
  assert.equal(restored.snapshot().step, 'adjust-fit');
  restored.observe({ type: 'fit', before: false, after: true });
  assert.equal(restored.snapshot().step, 'adjust-clear');
});
test('confirmed nonempty clear removes notes trace and history; a fresh addition precedes a real record-option toggle', () => {
  const c = chapter(), frame = c.start(null), goal = c.createGoal({ index: 10 });
  // A real practice board carries content: the clear must be destructive, not a no-op.
  const before = M.reduce(frame.board, { type: 'add', shape: 'circle' }), clean = emptyFrame();
  goal.observe({ type: 'clear', before, confirmed: true, frame: { ...clean, history: { past: [before], future: [] } } });
  assert.equal(goal.snapshot().step, 'adjust-clear');
  goal.observe({ type: 'clear', before: clean.board, confirmed: true, frame: clean });
  assert.equal(goal.snapshot().step, 'adjust-clear');
  goal.observe({ type: 'clear', before, confirmed: true, frame: clean });
  assert.equal(goal.snapshot().step, 'adjust-fresh');
  assert.equal(goal.snapshot().undoBoard, undefined, 'goal no longer carries pre-clear recovery boards');
  goal.observe({ type: 'attach-trace', before: true, after: false, frame: clean });
  assert.equal(goal.snapshot().step, 'adjust-fresh');
  const after = M.reduce(clean.board, { type: 'add', shape: 'circle' });
  goal.observe({ type: 'add', before: clean.board, after });
  assert.equal(goal.snapshot().step, 'adjust-trace-option');
  goal.observe({ type: 'attach-trace', before: true, after: true, frame: { ...clean, board: after } });
  assert.equal(goal.snapshot().step, 'adjust-trace-option');
  goal.observe({ type: 'attach-trace', before: true, after: false, frame: { ...clean, board: after, attachTrace: false } });
  assert.equal(goal.snapshot().completed, true);
});
test('every skipped dependency supplies a safe actionable next start without resurrecting pre-clear history', () => {
  const c = chapter(); let frame = c.start(null), saved = c.createGoal().snapshot();
  for (let index = 0; index < c.steps.length; index++) {
    const next = c.skip(saved, frame); frame = next.frame; saved = c.createGoal(next.goal).snapshot();
    assert.equal(saved.index, index + 1);
    M.validate(frame.board); T.validate(frame.trace);
    if (saved.step === 'adjust-color-add') assert.ok(frame.toolValue);
    if (saved.step === 'adjust-pattern-use') assert.ok(frame.board.settings.shapes.includes(saved.pattern));
    if (saved.step === 'adjust-undo') assert.ok(frame.history.past.length);
    if (saved.step === 'adjust-redo') assert.ok(frame.history.future.length);
    if (saved.step === 'adjust-fit') assert.equal(frame.fit, false);
    if (saved.step === 'adjust-fresh') { assert.equal(frame.board.objects.length, 0); assert.deepEqual(frame.history, { past: [], future: [] }); }
    if (saved.step === 'adjust-trace-option') { assert.ok(frame.board.objects.length); assert.deepEqual(frame.history, { past: [], future: [] }); }
  }
});
test('creation color requires a different level then a new object with matching value/color and unchanged old objects', () => {
  const c = chapter(), frame = c.start(null), goal = c.createGoal();
  goal.observe({ type: 'color', before: 1, after: 1, board: frame.board });
  assert.equal(goal.snapshot().step, 'adjust-color');
  goal.observe({ type: 'color', before: 1, after: 10, board: frame.board });
  assert.equal(goal.snapshot().step, 'adjust-color-add');
  // The old object was placed at the default value; the new one must use the chosen level.
  const before = M.reduce(frame.board, { type: 'add', shape: 'circle' }), after = M.reduce(before, { type: 'add', shape: 'circle', value: 10 });
  goal.observe({ type: 'add', before, after: before });
  assert.equal(goal.snapshot().step, 'adjust-color-add');
  goal.observe({ type: 'add', before, after: { ...after, objects: after.objects.map((o, i) => i === 0 ? { ...o, value: 10, color: 1 } : o) } });
  assert.equal(goal.snapshot().step, 'adjust-color-add');
  goal.observe({ type: 'add', before, after });
  assert.equal(goal.snapshot().step, 'adjust-pattern-add');
});
