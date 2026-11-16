// Geometry file chapter (F01–F03). A save passes only after a practice snapshot is
// written or a download starts. An open passes only after a same-mode file replaces
// the practice board. There is no geometry trace. Setup and skip never call observe.
// Self-contained for build.mjs.
export function createGeometryFilesChapter({ G, emptyFrame }) {
  const steps = ['files-save', 'files-open'];
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const spots = [[200, 180], [360, 180], [520, 180], [200, 320], [360, 320], [520, 320]];
  function boardOf(frame) {
    try { return G.validate(frame.board); } catch { return null; }
  }
  function withPoint(board) {
    const base = board || G.empty();
    if (base.points.length > 0) return base;
    return G.reduce(base, { type: 'addPoint', x: 200, y: 180 });
  }
  function fileText(value) {
    if (typeof value !== 'string') return null;
    try { G.validate(JSON.parse(value)); return value; } catch { return null; }
  }
  function anotherPoint(board) {
    for (let i = 0; i < spots.length; i += 1) {
      const x = spots[i][0];
      const y = spots[i][1];
      if (board.points.some((point) => point.x === x && point.y === y)) continue;
      return G.reduce(board, { type: 'addPoint', x, y });
    }
    throw Error('File prerequisites are unavailable');
  }
  function start(previousFrame) {
    const frame = previousFrame ? copy(previousFrame) : emptyFrame();
    frame.board = withPoint(boardOf(frame));
    return frame;
  }
  function fresh() {
    return { frame: start(null), saved: { index: 0, via: null, text: null } };
  }
  function createGoal(saved) {
    const has = saved != null && typeof saved === 'object' && !Array.isArray(saved);
    if (saved != null && !has) throw Error('Invalid file goal');
    let index = has ? saved.index : 0;
    let via = has && saved.via != null ? saved.via : null;
    let text = has && saved.text != null ? saved.text : null;
    const indexOk = Number.isInteger(index) && index >= 0 && index <= steps.length;
    const viaOk = via === null || via === 'handle' || via === 'download';
    const textOk = text === null || typeof text === 'string';
    if (!indexOk || !viaOk || !textOk) throw Error('Invalid file goal');
    if (index === 0 && (via !== null || text !== null)) throw Error('Invalid file goal');
    if (index > 0 && fileText(text) === null) throw Error('Invalid file goal');
    function snapshot() {
      return {
        index, via, text, total: steps.length,
        step: steps[index] || 'files-complete', completed: index === steps.length,
      };
    }
    function observe(event = {}) {
      if (index >= steps.length) return snapshot();
      const step = steps[index];
      let passed = false;
      if (step === 'files-save') {
        const body = fileText(event.text);
        if (event.type === 'save' && (event.via === 'handle' || event.via === 'download') && body !== null) {
          via = event.via;
          text = body;
          passed = true;
        }
      } else if (step === 'files-open' && event.type === 'open') {
        try {
          const before = G.validate(event.before);
          const after = G.validate(event.after);
          passed = JSON.stringify(before) !== JSON.stringify(after);
        } catch { passed = false; }
      }
      if (passed) index += 1;
      return snapshot();
    }
    return { snapshot, observe };
  }
  function skip(saved, frame) {
    const index = Math.min(saved.index + 1, steps.length);
    const next = copy(frame);
    if (saved.index !== 0) {
      const via = saved.via === 'handle' || saved.via === 'download' ? saved.via : null;
      const text = typeof saved.text === 'string' ? saved.text : null;
      return { goal: { index, via, text }, frame: next };
    }
    const board = withPoint(boardOf(next));
    const text = G.serialize(board);
    next.board = anotherPoint(board);
    return { goal: { index, via: null, text }, frame: next };
  }
  return {
    id: 'geometry-files', titleKey: 'geometryPracticeFiles', optional: true,
    steps, start, fresh, createGoal, skip,
  };
}
