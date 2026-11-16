// Geometry adjust and recover chapter (G17–G20). A step passes only for that
// step's own change: grid or snap must actually switch, and a new point must
// then be committed while that setting holds. Undo and redo restore that point.
// Zoom, scroll, and fit must change the view. Clear empties this practice board
// and its history. Grid and snap are not a geometry verdict. Setup never calls
// observe. Self-contained for build.mjs.
export function createGeometryAdjustChapter({ G, emptyFrame }) {
  const steps = ['adjust-grid', 'adjust-snap', 'adjust-undo', 'adjust-redo', 'adjust-zoom', 'adjust-scroll', 'adjust-fit', 'adjust-clear'];
  const at = (step) => steps.indexOf(step);
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const spots = [[200, 180], [360, 180], [520, 180], [200, 320], [360, 320], [520, 320], [200, 460], [360, 460]];
  const content = (board) => JSON.stringify({ points: board?.points || [], elements: board?.elements || [], note: board?.note || '' });
  const nonempty = (board) => Boolean(board && ((board.points?.length || 0) + (board.elements?.length || 0) > 0 || String(board.note || '').trim()));
  const emptyBoard = (board) => Boolean(board) && (board.points?.length || 0) === 0 && (board.elements?.length || 0) === 0 && !String(board.note || '').trim();
  function placePoint(board) {
    for (const [x, y] of spots) {
      if (board.points.some((point) => point.x === x && point.y === y)) continue;
      try { return G.reduce(board, { type: 'addPoint', x, y }); } catch { /* the next open spot */ }
    }
    throw Error('Adjust prerequisites are unavailable');
  }
  function addedPointId(before, after) {
    const ids = new Set((before?.points || []).map((point) => point.id));
    const created = (after?.points || []).filter((point) => !ids.has(point.id) && point.kind === 'free');
    return created.length === 1 ? created[0].id : null;
  }
  function boardsOf(saved) {
    if (!saved?.undoBoard && !saved?.redoBoard) return { undoBoard: null, redoBoard: null, ok: true };
    try {
      const undoBoard = G.validate(saved.undoBoard);
      const redoBoard = G.validate(saved.redoBoard);
      return { undoBoard, redoBoard, ok: content(undoBoard) !== content(redoBoard) };
    } catch { return { undoBoard: null, redoBoard: null, ok: false }; }
  }
  function start(previousFrame) {
    const reusable = Boolean(previousFrame?.board?.points?.length);
    const frame = reusable ? copy(previousFrame) : emptyFrame();
    if (!frame.board.points.length) frame.board = placePoint(frame.board);
    frame.history = { past: [], future: [] };
    frame.selection = [];
    frame.tool = 'select';
    frame.pending = [];
    frame.construction = [];
    frame.auxiliary = false;
    frame.grid = false;
    frame.snap = true;
    frame.zoom = 1;
    frame.fit = true;
    frame.scroll = { left: 0, top: 0 };
    return frame;
  }
  function fresh() {
    return { frame: start(null), saved: { index: 0, zoom: 1, fit: true, gridOn: false, snapOff: false, undoBoard: null, redoBoard: null, pointId: null } };
  }
  function createGoal(saved) {
    const hasState = saved != null;
    const plain = hasState && typeof saved === 'object' && !Array.isArray(saved);
    let index = hasState ? saved.index : 0;
    let zoom = hasState && saved.zoom !== undefined ? saved.zoom : 1;
    let fit = hasState && saved.fit !== undefined ? saved.fit : true;
    let gridOn = hasState && saved.gridOn === true;
    let snapOff = hasState && saved.snapOff === true;
    let pointId = hasState ? saved.pointId ?? null : null;
    const boards = boardsOf(hasState ? saved : {});
    let undoBoard = boards.undoBoard;
    let redoBoard = boards.redoBoard;
    const indexOk = Number.isInteger(index) && index >= 0 && index <= steps.length;
    const zoomOk = typeof zoom === 'number' && Number.isFinite(zoom) && zoom >= 1 && zoom <= 4;
    const fitOk = typeof fit === 'boolean';
    const flagOk = (!hasState || saved.gridOn === undefined || typeof saved.gridOn === 'boolean')
      && (!hasState || saved.snapOff === undefined || typeof saved.snapOff === 'boolean');
    const pointOk = pointId === null || pointId === undefined || (typeof pointId === 'string' && pointId.length > 0);
    const pair = Boolean(undoBoard || redoBoard);
    const needsBoards = index === at('adjust-undo') || index === at('adjust-redo');
    if (hasState && (!plain || !indexOk || !zoomOk || !fitOk || !flagOk || !pointOk || !boards.ok
      || (needsBoards && !pair) || (index < at('adjust-undo') && pair))) throw Error('Invalid adjust goal');
    if (pointId === undefined) pointId = null;
    if (!pointId && undoBoard && redoBoard) pointId = addedPointId(undoBoard, redoBoard);
    function snapshot() {
      return {
        index, zoom, fit, gridOn, snapOff, pointId,
        undoBoard: undoBoard ? copy(undoBoard) : null,
        redoBoard: redoBoard ? copy(redoBoard) : null,
        total: steps.length,
        step: steps[index] || 'adjust-complete',
        completed: index === steps.length,
      };
    }
    function observe(event = {}) {
      if (index >= steps.length) return snapshot();
      if (event.type === 'grid' && event.before === false && event.after === true) gridOn = true;
      if (event.type === 'snap' && event.before === true && event.after === false) snapOff = true;
      if (event.type === 'zoom' && Number.isFinite(event.before) && Number.isFinite(event.after) && event.before !== event.after) zoom = event.after;
      if (event.type === 'fit' && typeof event.before === 'boolean' && typeof event.after === 'boolean' && event.before !== event.after) fit = event.after;
      const step = steps[index];
      const created = addedPointId(event.before, event.after);
      let passed = false;
      if (step === 'adjust-grid') {
        passed = gridOn && event.type === 'draw' && event.tool === 'point' && event.grid === true && Boolean(created);
      } else if (step === 'adjust-snap') {
        passed = snapOff && event.type === 'draw' && event.tool === 'point' && event.snap === false && Boolean(created);
        if (passed) { undoBoard = copy(event.before); redoBoard = copy(event.after); pointId = created; }
      } else if (step === 'adjust-undo') {
        passed = event.type === 'undo' && Boolean(undoBoard && redoBoard && pointId)
          && content(event.before) === content(redoBoard) && content(event.after) === content(undoBoard)
          && event.before.points.some((point) => point.id === pointId)
          && !event.after.points.some((point) => point.id === pointId);
      } else if (step === 'adjust-redo') {
        passed = event.type === 'redo' && Boolean(undoBoard && redoBoard && pointId)
          && content(event.before) === content(undoBoard) && content(event.after) === content(redoBoard)
          && !event.before.points.some((point) => point.id === pointId)
          && event.after.points.some((point) => point.id === pointId);
      } else if (step === 'adjust-zoom') {
        passed = event.type === 'zoom' && Number.isFinite(event.before) && Number.isFinite(event.after) && event.before !== event.after;
      } else if (step === 'adjust-scroll') {
        const before = event.before || {};
        const after = event.after || {};
        const moved = before.left !== after.left || before.top !== after.top;
        passed = event.type === 'scroll' && moved && (zoom !== 1 || fit === false);
      } else if (step === 'adjust-fit') {
        passed = event.type === 'fit' && event.before === false && event.after === true;
      } else if (step === 'adjust-clear') {
        passed = event.type === 'clear' && nonempty(event.before) && emptyBoard(event.after);
        if (passed) { undoBoard = null; redoBoard = null; pointId = null; }
      }
      if (passed) index += 1;
      return snapshot();
    }
    return { snapshot, observe };
  }
  function skip(saved, frame) {
    const next = copy(frame);
    const goal = {
      index: saved.index + 1,
      zoom: typeof saved.zoom === 'number' ? saved.zoom : 1,
      fit: typeof saved.fit === 'boolean' ? saved.fit : true,
      gridOn: saved.gridOn === true,
      snapOff: saved.snapOff === true,
      undoBoard: saved.undoBoard ? copy(saved.undoBoard) : null,
      redoBoard: saved.redoBoard ? copy(saved.redoBoard) : null,
      pointId: typeof saved.pointId === 'string' ? saved.pointId : null,
    };
    const step = steps[goal.index];
    // The destination gets a usable frame. This does not press that step's control,
    // does not call observe, and does not clear the board.
    if (step === 'adjust-snap') next.snap = true;
    if (step === 'adjust-undo') {
      const before = copy(next.board);
      next.board = placePoint(next.board);
      goal.undoBoard = before;
      goal.redoBoard = copy(next.board);
      goal.pointId = addedPointId(before, next.board);
      next.history = { past: [before], future: [] };
    }
    if (step === 'adjust-redo') {
      if (!goal.undoBoard || !goal.redoBoard || content(goal.undoBoard) === content(goal.redoBoard)) {
        const before = copy(next.board);
        next.board = placePoint(next.board);
        goal.undoBoard = before;
        goal.redoBoard = copy(next.board);
        goal.pointId = addedPointId(before, next.board);
      }
      next.board = copy(goal.undoBoard);
      next.history = { past: [], future: [copy(goal.redoBoard)] };
    }
    if (step === 'adjust-zoom') { next.zoom = 1; next.fit = true; goal.zoom = 1; goal.fit = true; }
    if (step === 'adjust-scroll') {
      next.zoom = 1.25; next.fit = false; next.scroll = { left: 0, top: 0 };
      goal.zoom = 1.25; goal.fit = false;
    }
    if (step === 'adjust-fit') {
      next.fit = false;
      if (!(next.zoom > 1)) next.zoom = 1.25;
      goal.fit = false;
      goal.zoom = next.zoom;
    }
    if (step === 'adjust-clear' && !nonempty(next.board)) next.board = placePoint(next.board);
    next.selection = [];
    next.pending = [];
    next.construction = [];
    next.tool = step === 'adjust-grid' || step === 'adjust-snap' ? 'point' : 'select';
    return { goal, frame: next };
  }
  return { id: 'geometry-adjust', titleKey: 'geometryPracticeAdjust', steps, start, fresh, createGoal, skip };
}
