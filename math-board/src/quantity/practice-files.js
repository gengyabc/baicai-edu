// Quantity file chapter (F01–F03). A save passes only after a practice snapshot is
// written or a download starts. An open passes only after a same-mode file replaces
// the practice board. The trace stays empty and is not part of the file. Setup and
// skip never call observe. Self-contained for build.mjs.
export function createQuantityFilesChapter({ M, T, emptyFrame }) {
  const steps = ['files-save', 'files-open'];
  const copy = (value) => JSON.parse(JSON.stringify(value));
  function boardOf(frame) {
    try { return M.validate(frame.board); } catch { return null; }
  }
  function withObject(board) {
    if (board && board.objects.length > 0) return board;
    return M.reduce(board || M.empty(), { type: 'add', shape: 'circle' });
  }
  function fileText(value) {
    if (typeof value !== 'string') return null;
    try { M.validate(JSON.parse(value)); return value; } catch { return null; }
  }
  function start(previousFrame) {
    const frame = previousFrame ? copy(previousFrame) : emptyFrame();
    frame.board = withObject(boardOf(frame));
    frame.trace = T.empty();
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
        index, via, text, targets: [], total: steps.length,
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
          const before = M.validate(event.before);
          const after = M.validate(event.after);
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
    const board = withObject(boardOf(next));
    const text = M.serialize(board);
    next.board = M.reduce(board, { type: 'add', shape: 'square' });
    next.trace = T.empty();
    return { goal: { index, via: null, text }, frame: next };
  }
  return {
    id: 'quantity-files', titleKey: 'quantityPracticeFiles', optional: true,
    steps, start, fresh, createGoal, skip,
  };
}
