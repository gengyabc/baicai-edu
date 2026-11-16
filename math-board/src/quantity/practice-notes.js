// Quantity notes chapter (Q10-Q13). A note passes only when the student commits it on
// the target the current selection actually names. Setup never calls observe.
// Self-contained for build.mjs.
export function createQuantityNotesChapter({ M, T, emptyFrame }) {
  const steps = ['notes-deselect', 'notes-board', 'notes-board-read', 'notes-object', 'notes-object-check',
    'notes-group', 'notes-group-read', 'notes-selection', 'notes-selection-check'];
  const at = (step) => steps.indexOf(step);
  // The lifecycle calls createGoal() before start(). The goal binds these targets
  // on the first snapshot, after start() has prepared the frame it will display.
  let prepared = null;
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const sameSet = (left = [], right = []) => {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    const a = [...left].sort();
    const b = [...right].sort();
    return a.every((id, index) => id === b[index]);
  };
  const live = (frame, id) => frame.board.objects.find((object) => object.id === id);
  const usable = (frame) => frame.board.objects.filter((object) => !object.removed);
  function add(frame, shape) {
    const before = new Set(frame.board.objects.map((object) => object.id));
    frame.board = M.reduce(frame.board, { type: 'add', shape, value: 1 });
    const created = frame.board.objects.find((object) => !before.has(object.id));
    if (!created) throw Error('Notes prerequisites are unavailable');
    return created.id;
  }
  /**
   * Make the practice board ready for `index`. One path for a fresh start and for a
   * skip, so the step begins with its prerequisites and without the note it asks
   * the student to write. Nothing here is reported as a student action.
   */
  function ready(frame, index, saved = {}) {
    const keep = (id) => usable(frame).some((object) => object.id === id);
    let targets = Array.isArray(saved.targets) && saved.targets.length === 2 && saved.targets.every(keep)
      ? [...saved.targets] : null;
    // Keep the id after the selection steps dissolve the group. A missing id is not
    // repaired into a different group; ensureGroup creates one only while the group is required.
    let groupId = typeof saved.groupId === 'string' ? saved.groupId : '';
    if (!targets) {
      const host = frame.board.groups.find((group) => usable(frame).filter((object) => object.groupId === group.id).length >= 2);
      if (host) {
        groupId = host.id;
        targets = usable(frame).filter((object) => object.groupId === host.id).slice(0, 2).map((object) => object.id);
      } else targets = usable(frame).slice(0, 2).map((object) => object.id);
    }
    while (targets.length < 2) targets.push(add(frame, 'circle'));
    for (let position = 0; position < 2; position += 1) if (!keep(targets[position])) targets[position] = add(frame, 'circle');
    if (targets[0] === targets[1]) targets[1] = add(frame, 'circle');
    let boardNote = typeof saved.boardNote === 'string' ? saved.boardNote : '';
    let objectNote = typeof saved.objectNote === 'string' ? saved.objectNote : '';
    let groupNote = typeof saved.groupNote === 'string' ? saved.groupNote : '';
    let selectionNote = typeof saved.selectionNote === 'string' ? saved.selectionNote : '';
    let selectionIds = Array.isArray(saved.selectionIds) ? [...saved.selectionIds] : [...targets];
    const setBoard = (value) => {
      if (frame.board.note === value) return;
      frame.board = M.reduce(frame.board, { type: 'note', value });
    };
    const setObject = (id, value) => {
      const current = live(frame, id);
      if (!current || current.note === value) return;
      frame.board = M.reduce(frame.board, { type: 'annotate', target: 'object', id, value });
    };
    const setGroup = (value) => {
      const current = frame.board.groups.find((group) => group.id === groupId);
      if (!current || current.note === value) return;
      frame.board = M.reduce(frame.board, { type: 'annotate', target: 'group', id: groupId, value });
    };
    const setSelection = (ids, value) => {
      const existing = frame.board.notes.find((note) => sameSet(note.objectIds, ids));
      if (!value.trim()) {
        if (!existing) return;
        frame.board = M.reduce(frame.board, { type: 'annotate', target: 'selection', ids, value: '' });
        return;
      }
      if (existing?.text === value) return;
      frame.board = M.reduce(frame.board, { type: 'annotate', target: 'selection', ids, value });
    };
    function ensureGroup() {
      if (groupId && frame.board.groups.some((group) => group.id === groupId)) return;
      const shared = live(frame, targets[0])?.groupId;
      if (shared && shared === live(frame, targets[1])?.groupId && frame.board.groups.some((group) => group.id === shared)) {
        groupId = shared;
        return;
      }
      frame.board = M.reduce(frame.board, { type: 'groupSelected', ids: targets, alias: 'Group' });
      groupId = live(frame, targets[0]).groupId;
    }
    function ungroupTargets() {
      const ids = new Set(targets.map((id) => live(frame, id)?.groupId).filter(Boolean));
      for (const id of ids) {
        if (frame.board.groups.some((group) => group.id === id)) frame.board = M.reduce(frame.board, { type: 'deleteGroup', id });
      }
    }
    // A write step starts without its own note. A later read or check keeps the
    // text saved on the earlier step, seeding one only when skip skipped that write.
    if (index >= at('notes-board-read')) {
      if (!boardNote.trim()) boardNote = 'Board';
      setBoard(boardNote);
    } else { boardNote = ''; setBoard(''); }
    if (index >= at('notes-object-check')) {
      if (!objectNote.trim()) objectNote = 'Object';
      setObject(targets[0], objectNote);
      if ((live(frame, targets[1])?.note || '') === objectNote) setObject(targets[1], '');
    } else { objectNote = ''; setObject(targets[0], ''); }
    if (index >= at('notes-selection')) {
      if (index >= at('notes-group-read') && !groupNote.trim()) groupNote = 'Group';
      // Two live objects, not one whole group: a complete group would take the note.
      ungroupTargets();
    } else {
      ensureGroup();
      if (index >= at('notes-group-read')) {
        if (!groupNote.trim()) groupNote = 'Group';
        setGroup(groupNote);
      } else { groupNote = ''; setGroup(''); }
    }
    if (index >= at('notes-selection-check')) {
      if (!selectionNote.trim()) selectionNote = 'Selection';
      if (!(selectionIds.length >= 2 && selectionIds.every(keep) && new Set(selectionIds).size === selectionIds.length)) selectionIds = [...targets];
      setSelection(selectionIds, selectionNote);
    } else {
      selectionNote = '';
      selectionIds = [...targets];
      setSelection(targets, '');
    }
    frame.selection = index === at('notes-deselect') ? [...targets] : [];
    frame.append = false;
    frame.history = { past: [], future: [] };
    return { index, targets, groupId, boardNote, objectNote, groupNote, selectionNote, selectionIds };
  }
  function start(previousFrame) {
    const frame = previousFrame ? copy(previousFrame) : emptyFrame();
    prepared = ready(frame, 0);
    return frame;
  }
  function fresh() {
    const frame = emptyFrame();
    prepared = ready(frame, 0);
    return { frame, saved: prepared };
  }
  function createGoal(saved) {
    const hasState = Boolean(saved && Array.isArray(saved.targets));
    let index = hasState ? saved.index : 0;
    let targets = hasState ? [...saved.targets] : null;
    let groupId = hasState ? saved.groupId : null;
    let boardNote = hasState ? saved.boardNote : '';
    let objectNote = hasState ? saved.objectNote : '';
    let groupNote = hasState ? saved.groupNote : '';
    let selectionNote = hasState ? saved.selectionNote : '';
    let selectionIds = hasState ? (Array.isArray(saved.selectionIds) ? [...saved.selectionIds] : null) : null;
    if (hasState && (!Number.isInteger(index) || index < 0 || index > steps.length
      || !Array.isArray(targets) || targets.length !== 2 || new Set(targets).size !== 2
      || !targets.every((id) => typeof id === 'string' && id)
      || typeof groupId !== 'string' || !groupId
      || [boardNote, objectNote, groupNote, selectionNote].some((value) => typeof value !== 'string')
      || !Array.isArray(selectionIds) || selectionIds.some((id) => typeof id !== 'string' || !id)
      || new Set(selectionIds).size !== selectionIds.length
      || (index >= at('notes-board-read') && !boardNote.trim())
      || (index >= at('notes-object-check') && !objectNote.trim())
      || (index >= at('notes-group-read') && !groupNote.trim())
      || (index >= at('notes-selection-check') && (!selectionNote.trim() || selectionIds.length < 2)))) throw Error('Invalid notes goal');
    let groupArmed = false;
    function bind() {
      if (targets) return;
      if (!prepared) prepared = ready(emptyFrame(), 0);
      targets = [...prepared.targets];
      groupId = prepared.groupId;
      boardNote = prepared.boardNote || '';
      objectNote = prepared.objectNote || '';
      groupNote = prepared.groupNote || '';
      selectionNote = prepared.selectionNote || '';
      selectionIds = [...(prepared.selectionIds || targets)];
    }
    const snapshot = () => {
      bind();
      return { index, targets: [...targets], groupId, boardNote, objectNote, groupNote, selectionNote,
        selectionIds: [...selectionIds], total: steps.length, step: steps[index] || 'complete',
        completed: index === steps.length };
    };
    function judge(event) {
      const step = steps[index];
      const action = event.action || {};
      const kind = event.target || (action.type === 'note' ? 'board' : action.target);
      const value = typeof action.value === 'string' ? action.value : '';
      const changed = Boolean(event.before && event.after && JSON.stringify(event.before) !== JSON.stringify(event.after));
      if (event.type === 'insert') return [false, 'practiceInsertBlocked'];
      if (event.type === 'cancel' || event.type === 'dismiss') return [false, 'notesCancelExplain'];
      if (step === 'notes-deselect') {
        if (event.type !== 'select') return [false, 'notesDeselectExplain'];
        return [event.selection?.length === 0, 'notesDeselectExplain'];
      }
      if (step === 'notes-board') {
        if (action.type !== 'note' || kind !== 'board') return [false, 'notesBoardTarget'];
        if (!value.trim()) return [false, 'notesEmptyExplain'];
        if (!changed || event.after.note !== value) return [false, 'notesBoardTarget'];
        boardNote = event.after.note;
        return [true, ''];
      }
      if (step === 'notes-board-read') {
        if (event.type !== 'open-note' || event.target !== 'board' || event.value !== boardNote || !boardNote.trim()) return [false, 'notesBoardRead'];
        return [true, ''];
      }
      if (step === 'notes-object') {
        const id = action.id || event.ids?.[0];
        if (action.type !== 'annotate' || kind !== 'object' || id !== targets[0]) return [false, 'notesObjectTarget'];
        if (!value.trim()) return [false, 'notesEmptyExplain'];
        const now = event.after?.objects?.find((object) => object.id === targets[0]);
        const old = event.before?.objects?.find((object) => object.id === targets[0]);
        if (!now || now.note !== value || !now.note.trim() || old?.note === now.note) return [false, 'notesObjectTarget'];
        objectNote = now.note;
        return [true, ''];
      }
      if (step === 'notes-object-check') {
        const ids = event.selection || [];
        if (event.type !== 'select' || ids.length !== 1 || ids[0] !== targets[1]) return [false, 'notesObjectCheck'];
        const marked = event.after?.objects?.find((object) => object.id === targets[0]);
        const other = event.after?.objects?.find((object) => object.id === targets[1]);
        if (!marked || marked.note !== objectNote || !other || other.note === objectNote) return [false, 'notesObjectCheck'];
        return [true, ''];
      }
      if (step === 'notes-group') {
        const id = action.id || event.ids?.[0];
        if (action.type !== 'annotate' || kind !== 'group' || id !== groupId) return [false, 'notesGroupTarget'];
        if (!value.trim()) return [false, 'notesEmptyExplain'];
        const now = event.after?.groups?.find((group) => group.id === groupId);
        const old = event.before?.groups?.find((group) => group.id === groupId);
        if (!now || now.note !== value || !now.note.trim() || old?.note === now.note) return [false, 'notesGroupTarget'];
        groupNote = now.note;
        return [true, ''];
      }
      if (step === 'notes-group-read') {
        if (event.type === 'select') {
          const members = (event.after?.objects || []).filter((object) => object.groupId === groupId).map((object) => object.id);
          groupArmed = members.length > 0 && sameSet(event.selection || [], members);
          return [false, 'notesGroupRead'];
        }
        const id = event.ids?.[0];
        if (event.type !== 'open-note' || !groupArmed || event.target !== 'group' || id !== groupId || event.value !== groupNote || !groupNote.trim()) return [false, 'notesGroupRead'];
        return [true, ''];
      }
      if (step === 'notes-selection') {
        const ids = action.ids || event.ids || [];
        if (action.type !== 'annotate' || kind !== 'selection' || ids.length < 2 || !sameSet(ids, targets)) return [false, 'notesSelectionTarget'];
        if (!value.trim()) return [false, 'notesEmptyExplain'];
        const now = event.after?.notes?.find((note) => sameSet(note.objectIds, ids));
        const old = event.before?.notes?.find((note) => sameSet(note.objectIds, ids));
        if (!now || now.text !== value || !now.text.trim() || old?.text === now.text) return [false, 'notesSelectionTarget'];
        selectionNote = now.text;
        selectionIds = [...now.objectIds];
        return [true, ''];
      }
      if (step === 'notes-selection-check') {
        if (event.type !== 'open-note') return [false, 'notesSelectionCheck'];
        const marked = event.after?.notes?.find((note) => sameSet(note.objectIds, selectionIds));
        if (!marked || marked.text !== selectionNote || !selectionNote.trim()) return [false, 'notesSelectionCheck'];
        const differentPair = event.target === 'selection' && Array.isArray(event.ids) && event.ids.length >= 2 && !sameSet(event.ids, selectionIds);
        if (event.target !== 'board' && !differentPair) return [false, 'notesSelectionCheck'];
        if (event.value === selectionNote) return [false, 'notesSelectionCheck'];
        return [true, ''];
      }
      return [false, 'notesMiss'];
    }
    function observe(event) {
      bind();
      if (index >= steps.length) return Object.assign(snapshot(), { passed: false, why: '', target: 'complete' });
      const step = steps[index];
      const [passed, why] = judge(event);
      if (passed) { index += 1; groupArmed = false; }
      return Object.assign(snapshot(), { passed, why: passed ? '' : why, target: step });
    }
    return { snapshot, observe, ready: (frame) => ready(frame, index, snapshot()) };
  }
  function skip(saved, frame) {
    const index = saved.index + 1;
    if (!steps[index]) return { goal: { ...saved, index }, frame };
    const next = ready(frame, index, { ...saved, index });
    return { goal: next, frame };
  }
  return { id: 'quantity-notes', titleKey: 'practiceNotes', steps, start, fresh, createGoal, skip };
}
