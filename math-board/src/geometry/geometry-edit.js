// Geometry edit and notes chapter (G11–G16). A step passes only when that step's
// commit changes the marked point, the same text, the marked object, or the note
// the step names. Notes and text are the student's own words. Setup never calls
// observe, and nothing here clears the board.
//
// Deleting a segment also removes endpoints nothing else uses. The segment that
// later carries the short label stays, so the marked point stays with it, and one
// extra point stays as the object delete must leave behind. The delete step
// removes a different segment. Self-contained for build.mjs.
export function createGeometryEditChapter({ G, emptyFrame }) {
  const steps = ['edit-rename', 'edit-text-add', 'edit-text-change', 'edit-delete', 'edit-point-note', 'edit-element-note', 'edit-caption', 'edit-deselect', 'edit-board-note'];
  const at = (step) => steps.indexOf(step);
  // createGoal() runs before start(). The first snapshot reads the ids start() or
  // fresh() stored here.
  let prepared = null;
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const spots = [[200, 180], [420, 180], [200, 360], [520, 320], [680, 320], [360, 460], [600, 460]];
  const idOk = (value) => typeof value === 'string' && value.length > 0;
  const trimmedLength = (value) => typeof value === 'string' ? [...value.trim()].length : 0;
  const survives = (board, id) => Boolean(board?.points?.some((point) => point.id === id) || board?.elements?.some((element) => element.id === id));
  function elementRefs(element, id) {
    if (!element || element.type === 'text' || !id) return false;
    if (element.type === 'circle') return element.centerPointId === id || element.radiusPointId === id;
    return Array.isArray(element.points) && element.points.includes(id);
  }
  function placePoint(frame) {
    const spot = spots.find(([x, y]) => frame.board.points.every((point) => Math.hypot(point.x - x, point.y - y) > 24));
    if (!spot) throw Error('Edit prerequisites are unavailable');
    frame.board = G.reduce(frame.board, { type: 'addPoint', x: spot[0], y: spot[1] });
    return frame.board.points.at(-1).id;
  }
  function canDelete(board, id, pointId, elementId, keepId) {
    if (!idOk(id) || id === pointId || id === elementId || id === keepId) return false;
    try {
      const next = G.reduce(board, { type: 'delete', ids: [id] });
      return !survives(next, id) && survives(next, pointId) && survives(next, elementId) && survives(next, keepId)
        && next.points.length + next.elements.length > 0;
    } catch {
      return false;
    }
  }
  function pickPoint(frame, savedId) {
    if (frame.board.points.some((point) => point.id === savedId && point.kind === 'free')) return savedId;
    const used = frame.board.points.find((point) => point.kind === 'free'
      && frame.board.elements.some((element) => elementRefs(element, point.id)));
    if (used) return used.id;
    const any = frame.board.points.find((point) => point.kind === 'free');
    if (any) return any.id;
    return placePoint(frame);
  }
  function pickElement(frame, pointId, savedId) {
    const matches = (element) => element && element.type !== 'text' && elementRefs(element, pointId);
    const saved = frame.board.elements.find((element) => element.id === savedId);
    if (matches(saved)) return saved.id;
    const found = frame.board.elements.find(matches);
    if (found) return found.id;
    let other = frame.board.points.find((point) => point.kind === 'free' && point.id !== pointId);
    if (!other) {
      const created = placePoint(frame);
      other = frame.board.points.find((point) => point.id === created);
    }
    frame.board = G.reduce(frame.board, { type: 'addElement', elementType: 'segment', points: [pointId, other.id], role: 'main' });
    return frame.board.elements.at(-1).id;
  }
  function pickKeep(frame, pointId, elementId, savedId) {
    const ends = new Set((() => {
      const element = frame.board.elements.find((item) => item.id === elementId);
      if (!element) return [];
      return element.type === 'circle' ? [element.centerPointId, element.radiusPointId] : element.points || [];
    })());
    if (idOk(savedId) && savedId !== pointId && savedId !== elementId && !ends.has(savedId) && survives(frame.board, savedId)) return savedId;
    const extra = frame.board.points.find((point) => point.kind === 'free' && point.id !== pointId && !ends.has(point.id));
    if (extra) return extra.id;
    const other = frame.board.elements.find((element) => element.id !== elementId && element.type !== 'text');
    if (other && !elementRefs(other, pointId)) return other.id;
    return null;
  }
  function pickDelete(frame, pointId, elementId, keepId, savedId) {
    if (canDelete(frame.board, savedId, pointId, elementId, keepId)) return savedId;
    const element = frame.board.elements.find((item) => item.type !== 'text' && canDelete(frame.board, item.id, pointId, elementId, keepId));
    if (element) return element.id;
    return null;
  }
  function placeDisposable(frame, pointId, elementId, keepId) {
    const a = placePoint(frame);
    const b = placePoint(frame);
    frame.board = G.reduce(frame.board, { type: 'addElement', elementType: 'segment', points: [a, b], role: 'main' });
    const id = frame.board.elements.at(-1).id;
    if (!canDelete(frame.board, id, pointId, elementId, keepId)) throw Error('Edit prerequisites are unavailable');
    return id;
  }
  function ensureText(frame, savedId) {
    const existing = frame.board.elements.find((element) => element.id === savedId && element.type === 'text');
    if (existing) return existing.id;
    frame.board = G.reduce(frame.board, { type: 'addText', x: 240, y: 480, text: '文字' });
    return frame.board.elements.at(-1).id;
  }
  function ensureCaption(frame, elementId, savedNote) {
    const current = frame.board.elements.find((element) => element.id === elementId);
    const savedOk = trimmedLength(savedNote) >= 1 && trimmedLength(savedNote) <= 20;
    const currentOk = trimmedLength(current?.note) >= 1 && trimmedLength(current.note) <= 20;
    const note = savedOk ? savedNote : currentOk ? current.note : 'Side';
    if (current.note !== note) frame.board = G.reduce(frame.board, { type: 'annotate', target: 'element', id: elementId, value: note });
    return frame.board.elements.find((element) => element.id === elementId).note;
  }
  /**
   * Put the prerequisites of `index` on the frame. The rename, the text edit, the
   * delete, and the note this step asks for are not performed here.
   */
  function ready(frame, index, saved = {}) {
    if (index >= steps.length) {
      return { index: steps.length, pointId: saved.pointId, elementId: saved.elementId, keepId: saved.keepId,
        deleteId: saved.deleteId, textId: saved.textId, elementNote: saved.elementNote };
    }
    const pointId = pickPoint(frame, saved.pointId);
    const elementId = pickElement(frame, pointId, saved.elementId);
    let keepId = pickKeep(frame, pointId, elementId, saved.keepId);
    if (!keepId) keepId = placePoint(frame);
    let deleteId = pickDelete(frame, pointId, elementId, keepId, saved.deleteId);
    if (!deleteId) deleteId = placeDisposable(frame, pointId, elementId, keepId);
    const textId = index >= at('edit-text-change') ? ensureText(frame, saved.textId) : null;
    let elementNote = '';
    if (index >= at('edit-caption')) elementNote = ensureCaption(frame, elementId, saved.elementNote);
    else {
      const element = frame.board.elements.find((item) => item.id === elementId);
      if (element?.note) frame.board = G.reduce(frame.board, { type: 'annotate', target: 'element', id: elementId, value: '' });
    }
    if (index <= at('edit-point-note')) {
      const point = frame.board.points.find((item) => item.id === pointId);
      if (point?.note) frame.board = G.reduce(frame.board, { type: 'annotate', target: 'point', id: pointId, value: '' });
    }
    if (index < at('edit-board-note') && frame.board.note) frame.board = G.reduce(frame.board, { type: 'note', value: '' });
    frame.tool = 'select';
    frame.pending = [];
    frame.construction = [];
    frame.history = { past: [], future: [] };
    frame.selection = index === at('edit-rename') || index === at('edit-point-note') ? [pointId]
      : index === at('edit-text-change') ? [textId]
        : index === at('edit-delete') ? [deleteId]
          : index === at('edit-element-note') || index === at('edit-caption') || index === at('edit-deselect') ? [elementId]
            : [];
    return { index, pointId, elementId, keepId, deleteId, textId, elementNote };
  }
  function start(previousFrame) {
    const frame = previousFrame && previousFrame.board ? copy(previousFrame) : emptyFrame();
    prepared = ready(frame, 0, {});
    return frame;
  }
  function fresh() {
    const frame = emptyFrame();
    prepared = ready(frame, 0, {});
    return { frame, saved: { index: 0, pointId: prepared.pointId, elementId: prepared.elementId, keepId: prepared.keepId,
      deleteId: prepared.deleteId, textId: null, elementNote: '' } };
  }
  function createGoal(saved) {
    const hasState = saved != null;
    let index = hasState ? saved.index : 0;
    let pointId = hasState ? saved.pointId : null;
    let elementId = hasState ? saved.elementId : null;
    let keepId = hasState ? saved.keepId : null;
    let deleteId = hasState ? saved.deleteId : null;
    let textId = hasState ? saved.textId : null;
    let elementNote = hasState ? saved.elementNote : '';
    const distinct = idOk(pointId) && idOk(elementId) && idOk(keepId) && idOk(deleteId)
      && pointId !== elementId && pointId !== keepId && pointId !== deleteId
      && elementId !== keepId && elementId !== deleteId && keepId !== deleteId;
    const textOk = index >= at('edit-text-change') ? idOk(textId) : textId === null;
    const noteOk = index >= at('edit-caption')
      ? trimmedLength(elementNote) >= 1 && trimmedLength(elementNote) <= 20
      : elementNote === '';
    if (hasState && (typeof saved !== 'object' || Array.isArray(saved)
      || !Number.isInteger(index) || index < 0 || index > steps.length
      || !distinct || !textOk || !noteOk)) throw Error('Invalid edit goal');
    let captionOpen = false;
    function bind() {
      if (pointId) return;
      if (!prepared) {
        const frame = emptyFrame();
        prepared = ready(frame, 0, {});
      }
      pointId = prepared.pointId;
      elementId = prepared.elementId;
      keepId = prepared.keepId;
      deleteId = prepared.deleteId;
      textId = prepared.textId;
      elementNote = prepared.elementNote;
    }
    const snapshot = () => {
      bind();
      return { index, pointId, elementId, keepId, deleteId, textId, elementNote, total: steps.length,
        step: steps[index] || 'edit-complete', completed: index === steps.length };
    };
    function observe(event) {
      bind();
      if (index >= steps.length) return snapshot();
      const step = steps[index];
      const action = event.action || {};
      const changed = Boolean(event.before && event.after && JSON.stringify(event.before) !== JSON.stringify(event.after));
      let passed = false;
      if (step === 'edit-rename') {
        const nextLabel = event.after?.points?.find((point) => point.id === pointId)?.label;
        const previous = event.before?.points?.find((point) => point.id === pointId)?.label;
        const referenced = (event.before?.elements || []).filter((element) => elementRefs(element, pointId));
        const sameRefs = referenced.every((element) => elementRefs(event.after?.elements?.find((item) => item.id === element.id), pointId));
        const unique = typeof nextLabel === 'string' && !(event.after?.points || []).some((point) => point.id !== pointId && point.label === nextLabel);
        passed = event.type === 'renamePoint' && event.id === pointId && changed && referenced.length > 0 && sameRefs && unique
          && typeof nextLabel === 'string' && nextLabel.trim().length > 0 && nextLabel !== previous;
      } else if (step === 'edit-text-add') {
        const added = (event.after?.elements || []).filter((element) => element.type === 'text'
          && !(event.before?.elements || []).some((old) => old.id === element.id));
        passed = event.type === 'addText' && changed && added.length === 1 && added[0].text.trim().length > 0;
        if (passed) textId = added[0].id;
      } else if (step === 'edit-text-change') {
        const beforeText = event.before?.elements?.find((element) => element.id === textId);
        const afterText = event.after?.elements?.find((element) => element.id === textId);
        const added = (event.after?.elements || []).filter((element) => element.type === 'text'
          && !(event.before?.elements || []).some((old) => old.id === element.id));
        passed = event.type === 'editText' && event.id === textId && changed && added.length === 0
          && beforeText?.type === 'text' && afterText?.type === 'text'
          && afterText.text.trim().length > 0 && afterText.text !== beforeText.text;
      } else if (step === 'edit-delete') {
        const beforeCount = (event.before?.points?.length || 0) + (event.before?.elements?.length || 0);
        const afterCount = (event.after?.points?.length || 0) + (event.after?.elements?.length || 0);
        passed = event.type === 'delete' && changed && Array.isArray(event.ids) && event.ids.includes(deleteId)
          && !survives(event.after, deleteId) && survives(event.after, keepId)
          && survives(event.after, pointId) && survives(event.after, elementId)
          && afterCount > 0 && afterCount < beforeCount;
      } else if (step === 'edit-point-note') {
        const value = event.after?.points?.find((point) => point.id === pointId)?.note || '';
        const previous = event.before?.points?.find((point) => point.id === pointId)?.note || '';
        const targetId = event.id || action.id;
        passed = event.type === 'annotate' && (event.target === 'point' || action.target === 'point') && targetId === pointId
          && changed && value.trim().length > 0 && value !== previous;
      } else if (step === 'edit-element-note') {
        const value = event.after?.elements?.find((element) => element.id === elementId)?.note || '';
        const previous = event.before?.elements?.find((element) => element.id === elementId)?.note || '';
        const targetId = event.id || action.id;
        passed = event.type === 'annotate' && (event.target === 'element' || action.target === 'element') && targetId === elementId
          && changed && trimmedLength(value) >= 1 && trimmedLength(value) <= 20 && value !== previous;
        if (passed) elementNote = value;
      } else if (step === 'edit-caption') {
        if (event.type === 'open-caption') captionOpen = event.id === elementId;
        const value = event.after?.elements?.find((element) => element.id === elementId)?.note || '';
        const previous = event.before?.elements?.find((element) => element.id === elementId)?.note || '';
        const targetId = event.id || action.id;
        const length = trimmedLength(value);
        // A caption is 1–20 characters. A longer note must not be stored: createGoal
        // would then reject the snapshot, and reset would drop the practice record.
        passed = captionOpen && event.via === 'caption' && event.type === 'annotate'
          && (event.target === 'element' || action.target === 'element') && targetId === elementId
          && changed && length >= 1 && length <= 20 && value !== previous;
        if (passed) elementNote = value;
      } else if (step === 'edit-deselect') {
        passed = event.type === 'select' && Array.isArray(event.selection) && event.selection.length === 0;
      } else if (step === 'edit-board-note') {
        const value = typeof action.value === 'string' ? action.value : '';
        passed = event.type === 'note' && action.type !== 'annotate' && event.target !== 'point' && event.target !== 'element'
          && changed && value.trim().length > 0 && event.after?.note === value && event.after.note !== event.before?.note;
      }
      if (passed) index += 1;
      return snapshot();
    }
    return { snapshot, observe };
  }
  function skip(saved, frame) {
    const next = ready(frame, saved.index + 1, saved);
    return { goal: next, frame };
  }
  return { id: 'geometry-edit', titleKey: 'geometryPracticeEdit', steps, start, fresh, createGoal, skip };
}
