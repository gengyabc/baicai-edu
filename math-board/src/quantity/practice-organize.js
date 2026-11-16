// Quantity organization chapter (Q04-Q09). Every step judges the student's own committed
// operation; programmatic prerequisites never pass one. Self-contained for build.mjs.
export function createQuantityOrganizeChapter({ M, T, emptyFrame }) {
  const steps = ['organize-name', 'organize-reselect', 'organize-peer', 'organize-group',
    'organize-group-name', 'organize-ungroup', 'organize-merge', 'organize-split', 'organize-copy',
    'organize-crossout', 'organize-delete'];
  const at = (step) => steps.indexOf(step);
  const SETUP_NAME = 'Group';
  // The lifecycle calls createGoal() before start(). The goal binds these targets
  // on the first snapshot, after start() has prepared the frame it will display.
  let prepared = null;
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const live = (frame, id) => frame.board.objects.find((o) => o.id === id);
  // Every practice start is its own canvas, so an id from the previous frame means
  // nothing here: two boards compared for a new object must share a canvas identity.
  const identity = (board) => [board.objects.length, ...board.objects.map((o) => o.id)].join('|');
  function add(frame, shape, value = 1) {
    const before = new Set(frame.board.objects.map((o) => o.id));
    frame.board = M.reduce(frame.board, { type: 'add', shape, value });
    const created = frame.board.objects.find((o) => !before.has(o.id));
    if (!created) throw Error('Organize prerequisites are unavailable');
    return created.id;
  }
  /**
   * Make the practice board ready for `index` and return the satz the step needs. One
   * path for a fresh start and for a reset, so a step never begins on a board that
   * cannot satisfy its own goal. Nothing here is ever reported as a student action.
   */
  function ready(frame, index, saved = {}) {
    const buried = (id) => frame.board.objects.some((o) => o.sources.some((source) => source.id === id));
    const targets = saved.targets && saved.targets.length === 2 ? [...saved.targets]
      : frame.board.objects.filter((o) => !o.removed && !o.groupId && !o.sources.length).map((o) => o.id).slice(0, 2);
    let mergedId = saved.mergedId || null;
    // Past split, the marked members have to be on the board again. Undo a skipped
    // merge here, before any alias or group edit tries to touch a buried id.
    if (index > at('organize-split')) {
      const parent = (mergedId && live(frame, mergedId))
        || frame.board.objects.find((o) => targets.length === 2 && targets.every((id) => o.sources.some((source) => source.id === id)));
      if (parent) {
        mergedId = parent.id;
        frame.board = M.reduce(frame.board, { type: 'split', id: parent.id });
      }
    }
    for (let i = 0; i < 2; i++) {
      if (targets[i] && (live(frame, targets[i]) || (index === at('organize-split') && buried(targets[i])))) continue;
      // Same pattern and value, so the unchanged merge rules allow this pair later.
      const first = live(frame, targets[0]);
      targets[i] = add(frame, first?.shape || 'circle', first?.value || 1);
    }
    for (const id of new Set(targets.map((id) => live(frame, id)?.groupId).filter(Boolean))) {
      frame.board = M.reduce(frame.board, { type: 'deleteGroup', id });
    }
    // The naming step supplies nothing: its goal is a first valid name, never a preset.
    let name = saved.name || '';
    if (index >= at('organize-reselect') && index !== at('organize-split')) {
      if (!name.trim()) name = SETUP_NAME;
      for (const id of targets) frame.board = M.reduce(frame.board, { type: 'update', id, patch: { alias: name, removed: false } });
    } else if (index === at('organize-split') && !name.trim()) name = SETUP_NAME;
    if (index >= at('organize-group-name') && index <= at('organize-ungroup')) {
      frame.board = M.reduce(frame.board, { type: 'groupSelected', ids: targets, alias: name });
    }
    if (index === at('organize-split')) {
      // The unchanged merge rules decide whether this pair can be joined at all.
      if (!(mergedId && live(frame, mergedId)?.sources.length === 2 && targets.every((id) => buried(id)))) {
        if (!targets.every((id) => live(frame, id)) || !M.mergeCandidate(frame.board, targets).allowed) {
          targets.splice(0, 2, add(frame, 'circle'), add(frame, 'circle'));
          if (!name.trim()) name = SETUP_NAME;
          for (const id of targets) frame.board = M.reduce(frame.board, { type: 'update', id, patch: { alias: name, removed: false } });
        }
        frame.board = M.reduce(frame.board, { type: 'merge', ids: targets });
        mergedId = frame.board.objects.find((o) => o.sources.length === 2
          && targets.every((id) => o.sources.some((source) => source.id === id))).id;
      }
    }
    frame.selection = []; frame.append = false;
    frame.history = { past: [], future: [] };
    return { index, targets, name, mergedId };
  }
  // A fresh chapter keeps whatever suitable practice objects the previous chapter left.
  // The shared lifecycle stores this return value as the practice frame.
  function start(previousFrame) {
    const frame = previousFrame ? copy(previousFrame) : emptyFrame();
    prepared = ready(frame, 0);
    return frame;
  }
  // Catalogue entry with no previous frame. Callers that want the goal seed as well
  // as the frame use this; the page's enter() uses start(null) and createGoal().
  function fresh() {
    const frame = emptyFrame();
    prepared = ready(frame, 0);
    return { frame, saved: prepared };
  }
  function createGoal(saved) {
    const hasState = Boolean(saved && Array.isArray(saved.targets));
    let index = hasState ? saved.index : 0;
    let targets = hasState ? [...saved.targets] : null;
    let name = hasState ? (saved.name || '') : '';
    let mergedId = hasState ? (saved.mergedId ?? null) : null;
    // A goal a step cannot be trusted to resume is refused, not silently repaired.
    if (hasState && (!Number.isInteger(index) || index < 0 || index > steps.length
      || targets.length !== 2 || !targets.every((id) => typeof id === 'string' && id) || new Set(targets).size !== 2
      || typeof name !== 'string' || !(mergedId === null || (typeof mergedId === 'string' && mergedId))
      || (index >= at('organize-reselect') && !name.trim()))) throw Error('Invalid organize goal');
    // No saved goal yet: bind after start()/fresh() has chosen this enter's objects.
    function bind() {
      if (targets) return;
      if (!prepared) prepared = ready(emptyFrame(), 0);
      targets = [...prepared.targets];
      name = prepared.name || '';
      mergedId = prepared.mergedId ?? null;
    }
    const snapshot = () => {
      bind();
      return { index, targets: [...targets], name, mergedId, total: steps.length,
        step: steps[index] || 'complete', completed: index === steps.length };
    };
    // A note on an object, or on the exact selection a merge replaces, travels with
    // that merge; a note on some other group does not describe these members.
    function mergeKeepsNotes(board) {
      return board.notes.every((note) => !note.objectIds.some((id) => targets.includes(id)));
    }
    // Each step checks its own committed change and reports the reason when it misses.
    function judge(event) {
      const [first, second] = targets;
      const step = steps[index];
      const before = event.before, after = event.after;
      const mine = (board, id) => board?.objects.find((o) => o.id === id);
      if (event.type === 'select') {
        if (step === 'organize-reselect') return [event.selection?.length === 1 && event.selection[0] === first, 'organizeSelectExplain'];
        return [false, step === 'organize-delete' ? 'organizeDeleteSelect' : 'organizeSelectExplain'];
      }
      if (event.type === 'add') {
        if (step === 'organize-name') return [Boolean(before && after && identity(before) === identity(after)
          && event.created?.length === 1 && !targets.includes(event.created[0])), 'organizeAddExplain'];
        return [false, 'organizeAddExplain'];
      }
      if (event.type === 'move') return [false, 'organizeMoveExplain'];
      if (event.type === 'insert') return [false, 'practiceInsertBlocked'];
      if (event.type === 'update') {
        if (step === 'organize-name') {
          const old = mine(before, first), now = mine(after, first);
          if (old && now && now.alias.trim() && old.alias !== now.alias) { name = now.alias; return [true, '']; }
          return [false, 'organizeNameExplain'];
        }
        if (step === 'organize-peer') {
          const old = mine(before, second), now = mine(after, second);
          return [Boolean(old && now && old.alias !== now.alias && now.alias === name && !now.groupId), 'organizePeerExplain'];
        }
        return [false, 'organizeRenameGroupHint'];
      }
      if (event.type === 'groupSelected') {
        if (step !== 'organize-group') return [false, 'organizeGroupExplain'];
        const members = after?.objects.filter((o) => targets.includes(o.id)) ?? [];
        const group = members[0]?.groupId ?? null;
        return [Boolean(group && members.length === 2 && members.every((o) => o.groupId === group)
          && before?.groups.every((g) => g.id !== group)), 'organizeGroupExplain'];
      }
      if (event.type === 'renameGroup') {
        if (step !== 'organize-group-name') return [false, 'organizeGroupNameExplain'];
        const id = mine(before, first)?.groupId;
        const was = before?.groups.find((g) => g.id === id), now = after?.groups.find((g) => g.id === id);
        return [Boolean(was && now && now.alias.trim() && was.alias !== now.alias), 'organizeGroupNameExplain'];
      }
      if (event.type === 'deleteGroup') {
        if (step !== 'organize-ungroup') return [false, 'organizeUngroupExplain'];
        const id = mine(before, first)?.groupId;
        return [Boolean(id && !after?.groups.some((g) => g.id === id)
          && targets.every((target) => mine(after, target) && !mine(after, target).groupId)), 'organizeUngroupExplain'];
      }
      if (event.type === 'merge') {
        if (step !== 'organize-merge') return [false, 'organizeMergeExplain'];
        const merged = after?.objects.find((o) => !before?.objects.some((p) => p.id === o.id) && o.sources.length === 2
          && targets.every((id) => o.sources.some((source) => source.id === id)));
        if (merged && !mergeKeepsNotes(before)) return [false, 'organizeMergeNoteExplain'];
        if (merged && targets.every((id) => !after.objects.some((o) => o.id === id)) && M.mergeCandidate(before, targets).allowed) {
          mergedId = merged.id;
          return [true, ''];
        }
        return [false, 'organizeMergeExplain'];
      }
      if (event.type === 'split') {
        if (step !== 'organize-split') return [false, 'organizeSplitExplain'];
        const parent = mine(before, mergedId);
        return [Boolean(parent?.sources.length === 2 && !after?.objects.some((o) => o.id === mergedId)
          && parent.sources.every((source) => after.objects.some((o) => o.id === source.id
            && ['shape', 'value', 'color', 'alias', 'note'].every((key) => o[key] === source[key])))), 'organizeSplitExplain'];
      }
      if (event.type === 'duplicateSelected') {
        if (step !== 'organize-copy') return [false, 'organizeCopyExplain'];
        const original = mine(before, first);
        const added = after?.objects.filter((o) => !before?.objects.some((p) => p.id === o.id)) ?? [];
        return [Boolean(original && JSON.stringify(original) === JSON.stringify(mine(after, first))
          && event.action?.ids?.length === 1 && event.action.ids[0] === first && added.length === 1
          && ['shape', 'value', 'color', 'alias', 'note', 'removed'].every((key) => added[0][key] === original[key])), 'organizeCopyExplain'];
      }
      if (event.type === 'batch') {
        // Notes are a later chapter. A note committed during organize never passes a step.
        if (event.overlayTarget) return [false, event.guideKey || 'organizeNoteTarget'];
        const old = mine(before, first), now = mine(after, first);
        if (step === 'organize-delete') {
          const others = before?.objects.filter((o) => o.id !== first) ?? [];
          const onlyTarget = Boolean(old) && !now && others.length > 0
            && after?.objects.length === others.length
            && others.every((o) => after.objects.some((p) => p.id === o.id));
          return [onlyTarget, 'organizeDeleteExplain'];
        }
        if (step === 'organize-crossout') {
          const marked = Boolean(old && now && !old.removed && now.removed
            && before.objects.length === after.objects.length);
          return [marked, 'organizeCrossoutExplain'];
        }
        return [false, 'organizeCrossoutExplain'];
      }
      return [false, ''];
    }
    function observe(event) {
      bind();
      const step = steps[index];
      const [passed, why] = judge(event);
      if (passed) index++;
      return Object.assign(snapshot(), { passed, why, target: step });
    }
    return { snapshot, observe, ready: (frame) => ready(frame, index, snapshot()) };
  }
  /**
   * A skipped step hands the next step a board that already satisfies its prerequisites.
   * These programmatic changes are never observed, so they cannot credit the skipped step
   * or the next one.
   */
  function skip(saved, frame) {
    const index = saved.index + 1;
    if (!steps[index]) return { goal: { ...saved, index }, frame };
    const next = ready(frame, index, { ...saved, index });
    return { goal: next, frame };
  }
  return { id: 'quantity-organize', titleKey: 'practiceOrganize', steps, start, fresh, createGoal, skip };
}
