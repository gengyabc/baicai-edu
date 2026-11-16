// Independent operation practice, not mathematical assessment. Inlined without closures.
// Goal definitions follow spec Q14-Q19: every step needs a committed, distinct change;
// a click on the current state, an unavailable button or a seeded frame never counts.
export function createQuantityAdjustChapter({ M, T, emptyFrame }) {
  const steps = ['adjust-color', 'adjust-color-add', 'adjust-pattern-add', 'adjust-pattern-use',
    'adjust-pattern-hide', 'adjust-change', 'adjust-undo', 'adjust-redo',
    'adjust-zoom', 'adjust-fit', 'adjust-clear', 'adjust-fresh', 'adjust-trace-option'];
  const newShape = (event) => event.shape || event.change?.shape
    || event.after?.objects?.find((o) => !event.before?.objects?.some((p) => p.id === o.id))?.shape || null;
  const added = (before, after) => after.objects.filter((o) => !before.objects.some((p) => p.id === o.id));
  const kept = (before, after) => before.objects.every((o) => {
    const next = after.objects.find((p) => p.id === o.id);
    return Boolean(next) && JSON.stringify(o) === JSON.stringify(next);
  });
  function createGoal(saved = { index: 0, targets: [] }) {
    const targets = Array.isArray(saved.targets) ? [...saved.targets] : [];
    if (!Number.isInteger(saved.index) || saved.index < 0 || saved.index > steps.length
      || !targets.every((id) => typeof id === 'string' && id.length > 0)) throw Error('Invalid adjustment goal');
    let state = { ...saved, targets };
    function snapshot() {
      return { ...state, targets: [...state.targets], step: steps[state.index] || 'complete', total: steps.length, completed: state.index === steps.length };
    }
    function observe(event = {}) {
      const step = steps[state.index], level = (value) => event.board?.settings?.levels?.find((l) => l.value === value);
      let passed = false;
      if (step === 'adjust-color') {
        // Only a different level is a real change; repeating the current colour never advances.
        passed = event.type === 'color' && event.before !== event.after && Boolean(level(event.after));
        if (passed) state.level = level(event.after);
      } else if (step === 'adjust-color-add') {
        const created = added(event.before || { objects: [] }, event.after || { objects: [] });
        passed = event.type === 'add' && Boolean(event.before && event.after) && created.length === 1
          && created[0].value === state.level?.value && created[0].color === state.level?.color
          && kept(event.before, event.after);
        if (passed) state.targets.push(created[0].id);
      } else if (step === 'adjust-pattern-add') {
        // Opening the library alone is not the change; the rail list itself must grow.
        const shape = newShape(event);
        passed = event.type === 'pattern' && Boolean(event.before && event.after) && Boolean(shape)
          && !event.before.settings.shapes.includes(shape) && event.after.settings.shapes.includes(shape)
          && JSON.stringify(event.before.objects) === JSON.stringify(event.after.objects);
        if (passed) state.pattern = shape;
      } else if (step === 'adjust-pattern-use') {
        const created = added(event.before || { objects: [] }, event.after || { objects: [] });
        passed = event.type === 'add' && Boolean(event.before && event.after) && created.length === 1
          && created[0].shape === state.pattern && kept(event.before, event.after);
        if (passed) state.targets.push(created[0].id);
      } else if (step === 'adjust-pattern-hide') {
        passed = event.type === 'pattern' && Boolean(event.before && event.after) && event.shape === state.pattern
          && event.before.settings.shapes.includes(state.pattern) && !event.after.settings.shapes.includes(state.pattern)
          && event.after.settings.shapes.length > 0 && JSON.stringify(event.before.objects) === JSON.stringify(event.after.objects);
      } else if (step === 'adjust-change') {
        // A fresh addition, not an earlier one: it is the change Undo must reverse.
        const created = added(event.before || { objects: [] }, event.after || { objects: [] });
        passed = event.type === 'add' && Boolean(event.before && event.after) && created.length === 1 && kept(event.before, event.after);
        if (passed) { state.undoBoard = event.before; state.redoBoard = event.after; }
      } else if (step === 'adjust-undo') {
        passed = event.type === 'undo' && Boolean(state.undoBoard && state.redoBoard)
          && JSON.stringify(event.before) === JSON.stringify(state.redoBoard)
          && JSON.stringify(event.after) === JSON.stringify(state.undoBoard);
      } else if (step === 'adjust-redo') {
        passed = event.type === 'redo' && Boolean(state.undoBoard && state.redoBoard)
          && JSON.stringify(event.before) === JSON.stringify(state.undoBoard)
          && JSON.stringify(event.after) === JSON.stringify(state.redoBoard);
      } else if (step === 'adjust-zoom') {
        // An actual zoom change; clicking a limit that leaves the zoom unchanged does not count.
        passed = event.type === 'zoom' && Number.isFinite(event.before) && Number.isFinite(event.after) && event.before !== event.after;
      } else if (step === 'adjust-fit') {
        passed = event.type === 'fit' && event.before === false && event.after === true;
      } else if (step === 'adjust-clear') {
        const frame = event.frame || {};
        passed = event.type === 'clear' && event.confirmed === true && Boolean(event.before?.objects?.length)
          && frame.board?.objects?.length === 0 && frame.board?.groups?.length === 0 && frame.board?.notes?.length === 0
          && frame.board?.note === '' && JSON.stringify(frame.trace) === JSON.stringify(T.empty())
          && frame.history?.past?.length === 0 && frame.history?.future?.length === 0;
        // The pre-clear boards must not survive as recovery history for a later Undo.
        if (passed) { delete state.undoBoard; delete state.redoBoard; state.targets = []; }
      } else if (step === 'adjust-fresh') {
        const created = added(event.before || { objects: [] }, event.after || { objects: [] });
        passed = event.type === 'add' && Boolean(event.before && event.after) && created.length === 1 && kept(event.before, event.after);
      } else if (step === 'adjust-trace-option') {
        // Snapshot and modification record are separate: toggling the option clears neither.
        const frame = event.frame || {};
        passed = event.type === 'attach-trace' && typeof event.before === 'boolean' && typeof event.after === 'boolean'
          && event.before !== event.after && frame.attachTrace === event.after
          && Boolean(frame.board?.objects?.length);
      }
      if (passed) state.index++;
      return snapshot();
    }
    return { snapshot, observe };
  }
  // A skipped step keeps its dependency but never counts the seed as the student's action.
  function skip(saved, start) {
    // The start is the step the student skips from; the next step receives a usable
    // frame of its own, and that seeded content is never counted as an action.
    const goal = { ...saved, index: saved.index + 1, targets: [] };
    let frame = JSON.parse(JSON.stringify(start));
    const tile = () => M.shapes.find((shape) => !frame.board.settings.shapes.includes(shape)) || frame.board.settings.shapes[0];
    const seed = (shape) => { frame.board = M.reduce(frame.board, { type: 'add', shape }); };
    // A pattern the library can offer but the rail does not show yet.
    const absent = () => M.shapes.find((shape) => !frame.board.settings.shapes.includes(shape));
    const reveal = (shape) => { if (!frame.board.settings.shapes.includes(shape)) frame.board = M.reduce(frame.board, { type: 'configure', settings: { ...frame.board.settings, shapes: [...frame.board.settings.shapes, shape] }, scope: 'future' }); };
    const step = steps[goal.index];
    if (step === 'adjust-color-add' && !goal.level) {
      goal.level = frame.board.settings.levels.find((level) => level.value !== frame.toolValue) || frame.board.settings.levels[0];
      frame.toolValue = goal.level.value;
    }
    // The library must actually offer an absent pattern when the student arrives.
    if (step === 'adjust-pattern-add' && !absent()) frame.board = M.reduce(frame.board, { type: 'configure', settings: { ...frame.board.settings, shapes: frame.board.settings.shapes.slice(0, -1) }, scope: 'future' });
    if (step === 'adjust-pattern-use' || step === 'adjust-pattern-hide') {
      goal.pattern ||= absent() || M.defaultVisible.find((shape) => !frame.board.settings.shapes.includes(shape)) || 'star';
      reveal(goal.pattern);
      if (step === 'adjust-pattern-hide') {
        if (frame.board.settings.shapes.length === 1) reveal(absent() || 'star');
        if (!frame.board.objects.some((o) => o.shape === goal.pattern)) seed(goal.pattern);
      }
    }
    if (step === 'adjust-change') seed(tile());
    if (step === 'adjust-undo') {
      goal.undoBoard = frame.board; seed(tile()); goal.redoBoard = frame.board;
      frame.history = { past: [goal.undoBoard], future: [] };
    }
    if (step === 'adjust-redo') {
      if (!goal.undoBoard || !goal.redoBoard || JSON.stringify(goal.undoBoard) === JSON.stringify(goal.redoBoard)) {
        goal.undoBoard = frame.board; seed(tile()); goal.redoBoard = frame.board;
      }
      frame.board = goal.undoBoard; frame.history = { past: [], future: [goal.redoBoard] };
    }
    if (step === 'adjust-zoom') { frame.zoom = 1; frame.fit = true; }
    if (step === 'adjust-fit') { frame.zoom = 1.5; frame.fit = false; }
    if (step === 'adjust-clear' && !frame.board.objects.length) seed(tile());
    if (step === 'adjust-fresh') {
      // A cleared stage: nothing from before the clear may return through Undo.
      frame = { ...emptyFrame(), board: { ...M.empty(), settings: frame.board.settings }, toolValue: frame.toolValue, attachTrace: frame.attachTrace };
    }
    if (step === 'adjust-trace-option') { if (!frame.board.objects.length) seed(tile()); frame.history = { past: [], future: [] }; frame.trace = T.empty(); }
    if (step !== 'adjust-redo') { delete goal.undoBoard; delete goal.redoBoard; }
    frame.selection = [];
    return { goal: createGoal({ ...goal, targets: [] }).snapshot(), frame };
  }
  function start() { return emptyFrame(); }
  return { id: 'quantity-adjust', titleKey: 'practiceAdjust', steps, start, createGoal, skip };
}
