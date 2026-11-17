// Teacher-demo short guide (D01–D04). A step passes only for that step's own
// student action. The guide frame starts empty. A successful copy is an append
// into that frame; skip may place the current figure for viewing and does not
// call observe. Self-contained for build.mjs.
export function createTeacherDemoChapter({ G, emptyFrame, placeFigure }) {
  const steps = ['demo-read', 'demo-view', 'demo-copy', 'demo-return'];
  const at = (step) => steps.indexOf(step);
  const copy = (value) => JSON.parse(JSON.stringify(value));
  let armed = null;
  function identity(figure) {
    if (!figure || typeof figure !== 'object' || !figure.board) return null;
    const board = figure.board;
    const elements = Array.isArray(board.elements) ? board.elements : [];
    if (elements.length < 1) return null;
    const points = Array.isArray(board.points) ? board.points : [];
    return JSON.stringify({
      title: typeof figure.title === 'string' ? figure.title : '',
      description: typeof figure.description === 'string' ? figure.description : '',
      points: points.map((point) => [point.id, point.kind, point.x, point.y, point.label]),
      elements: elements.map((element) => [
        element.id, element.type, element.text || '',
        element.points || [], element.centerPointId || null, element.radiusPointId || null,
      ]),
    });
  }
  function arm(figure) {
    if (!figure || typeof figure.id !== 'string' || !figure.id || !figure.board) { armed = null; return; }
    armed = { id: figure.id, board: copy(figure.board) };
  }
  function start(previousFrame) {
    const frame = emptyFrame();
    frame.zoom = 1;
    frame.fit = true;
    frame.scroll = { left: 0, top: 0 };
    const previousId = typeof previousFrame?.figureId === 'string' && previousFrame.figureId ? previousFrame.figureId : null;
    frame.figureId = previousId || armed?.id || null;
    if (previousFrame?.figureBoard) frame.figureBoard = copy(previousFrame.figureBoard);
    else if (!previousId && armed?.board) frame.figureBoard = copy(armed.board);
    else frame.figureBoard = null;
    return frame;
  }
  function fresh() {
    const frame = start(null);
    return {
      frame,
      saved: { index: 0, figureId: frame.figureId, zoom: 1, fit: true, viewed: false, copied: false },
    };
  }
  function boardContent(board) {
    try {
      const value = G.validate(board);
      return JSON.stringify({ points: value.points, elements: value.elements });
    } catch { return null; }
  }
  function createGoal(saved) {
    const hasState = saved != null;
    const plain = hasState && typeof saved === 'object' && !Array.isArray(saved);
    const index = hasState ? saved.index : 0;
    let figureId = hasState ? (saved.figureId ?? null) : (armed?.id ?? null);
    const zoom = hasState && saved.zoom !== undefined ? saved.zoom : 1;
    let fit = hasState && saved.fit !== undefined ? saved.fit : true;
    let viewed = hasState && saved.viewed !== undefined ? saved.viewed : false;
    let copied = hasState && saved.copied !== undefined ? saved.copied : false;
    const indexOk = Number.isInteger(index) && index >= 0 && index <= steps.length;
    const zoomOk = typeof zoom === 'number' && Number.isFinite(zoom) && zoom >= 1 && zoom <= 4;
    const fitOk = typeof fit === 'boolean';
    const figureOk = figureId === null || (typeof figureId === 'string' && figureId.length > 0);
    const viewedOk = typeof viewed === 'boolean';
    const copiedOk = typeof copied === 'boolean';
    const orderOk = viewedOk && copiedOk && !(index < at('demo-view') && viewed) && !(index < at('demo-return') && copied);
    if (hasState && (!plain || !indexOk || !zoomOk || !fitOk || !figureOk || !orderOk)) throw Error('Invalid demo goal');
    let cursor = index;
    let zoomNow = zoom;
    function snapshot() {
      return {
        index: cursor, figureId, zoom: zoomNow, fit, viewed, copied,
        total: steps.length,
        step: steps[cursor] || 'demo-complete',
        completed: cursor === steps.length,
      };
    }
    function sameFigure(event) {
      return Boolean(figureId) && event?.figureId === figureId;
    }
    function observe(event = {}) {
      if (cursor >= steps.length) return snapshot();
      if (event.type === 'recorded' || event.type === 'render') return snapshot();
      if (event.type === 'zoom' && Number.isFinite(event.before) && Number.isFinite(event.after) && event.before !== event.after) {
        zoomNow = event.after;
        if (sameFigure(event) && steps[cursor] === 'demo-view') viewed = true;
      }
      if (event.type === 'fit' && typeof event.before === 'boolean' && typeof event.after === 'boolean' && event.before !== event.after) {
        fit = event.after;
      }
      const step = steps[cursor];
      let passed = false;
      if (step === 'demo-read') passed = event.type === 'continue' && sameFigure(event);
      else if (step === 'demo-view') {
        const before = event.before || {};
        const after = event.after || {};
        const moved = event.type === 'scroll' && (before.left !== after.left || before.top !== after.top);
        passed = moved && viewed && sameFigure(event) && (zoomNow !== 1 || fit === false);
      } else if (step === 'demo-copy') {
        const beforeContent = boardContent(event.before);
        const afterContent = boardContent(event.after);
        const appended = Boolean(beforeContent && afterContent && beforeContent !== afterContent);
        passed = event.type === 'copy' && sameFigure(event) && event.reason !== 'full' && event.reason !== 'empty' && appended;
        if (passed) copied = true;
      } else if (step === 'demo-return') passed = event.type === 'view-copy' && sameFigure(event);
      if (passed) cursor += 1;
      return snapshot();
    }
    return { snapshot, observe };
  }
  function skip(saved, frame) {
    const next = copy(frame);
    const goal = {
      index: saved.index + 1,
      figureId: typeof saved.figureId === 'string' && saved.figureId ? saved.figureId : null,
      zoom: typeof saved.zoom === 'number' ? saved.zoom : 1,
      fit: typeof saved.fit === 'boolean' ? saved.fit : true,
      viewed: saved.viewed === true && saved.index >= at('demo-view'),
      copied: saved.copied === true && saved.index >= at('demo-return'),
    };
    const step = steps[goal.index];
    // The return step needs something to view. This placement is not observed and
    // does not mark the copy complete. It does not switch tabs.
    if (step === 'demo-return' && next.figureBoard && typeof placeFigure === 'function') {
      const placed = placeFigure(G, next.board, next.figureBoard);
      if (placed?.ok) next.board = placed.board;
    }
    next.selection = [];
    next.pending = [];
    next.construction = [];
    next.tool = 'select';
    return { goal, frame: next };
  }
  return {
    id: 'teacher-demo-basics', titleKey: 'teacherDemoPractice', steps,
    start, fresh, createGoal, skip, identity, arm,
  };
}
