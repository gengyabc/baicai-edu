// Shared step rail: what this chapter still needs, this step's goal, and the controls
// that move between steps. It owns no editor state and awards no goals. Every other
// chapter lives one level down behind 全部章节, so the canvas keeps its space.
export function createPracticeRail(React, t) {
  const h = React.createElement;
  return function PracticeRail({ progress, chapters, onNavigate, onExit, goalKey, stepKey, notice, extra, goalText }) {
    const [catalog, setCatalog] = React.useState(false);
    const chapter = progress.chapters.find((item) => item.id === progress.current) || progress.chapters[0];
    const definition = chapters.find((item) => item.id === chapter?.id);
    if (!chapter || !definition) return null;
    const total = chapter.steps.length;
    const index = Math.min(chapter.index, total);
    const done = index >= total;
    const goal = progress.goal;
    const stepGoal = goalText || (done
      ? (chapter.status === 'completed' ? t('practiceComplete') : t('practiceSkippedEnd'))
      : t(goalKey(chapter.steps[index])));
    return h('aside', {
      className: 'eb-practice-rail', 'aria-label': t(definition.titleKey),
      'data-practice-step': goal?.step,
    },
    h('header', { className: 'eb-rail-head' },
      h('strong', null, t(definition.titleKey)),
      h('span', { className: 'eb-rail-count' }, `${Math.min(index + 1, total)}/${total}`),
      h('small', { className: 'eb-rail-note' }, t('practiceSealed'))),
    h('ol', { className: 'eb-rail-steps', 'aria-label': t('practiceSteps') },
      chapter.steps.map((step, position) => {
        const state = chapter.states[position];
        const current = !done && position === index;
        return h('li', {
          key: step, className: current ? 'now' : state === 'completed' ? 'done' : state === 'skipped' ? 'skipped' : '',
          'aria-current': current ? 'step' : undefined,
        },
        h('span', { className: 'eb-rail-mark', 'aria-hidden': true },
          state === 'completed' ? '✓' : state === 'skipped' ? '–' : String(position + 1)),
        h('span', null, t(stepKey(step))));
      })),
    h('div', { className: 'eb-rail-goal', role: 'status', 'aria-live': 'polite' },
      h('p', null, stepGoal)),
    notice && h('p', { className: 'eb-rail-alert', role: 'alert' }, notice),
    progress.persistence !== 'saved' && h('p', { className: 'eb-rail-alert', role: 'alert' }, t('practiceStorageWarning')),
    h('div', { className: 'eb-rail-acts' },
      extra,
      !goal?.completed && h('button', { type: 'button', onClick: () => onNavigate('reset') }, t('practiceReset')),
      !goal?.completed && h('button', { type: 'button', onClick: () => onNavigate('skip') }, t('practiceSkipStep')),
      chapter.states.map((state, position) => state === 'skipped'
        && h('button', { key: position, type: 'button', onClick: () => onNavigate('retryStep', position) },
          t('practiceRetryStep', { step: position + 1 }))),
      h('button', { type: 'button', onClick: () => onNavigate('retry') }, t('practiceRetryChapter')),
      h('button', { type: 'button', onClick: () => setCatalog(true) }, t('practiceChaptersOpen')),
      onExit && h('button', { type: 'button', className: 'eb-rail-exit', onClick: onExit }, t('practiceExit'))),
    catalog && h('div', { className: 'eb-rail-catalog', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('practiceChapters') },
      h('h2', null, t('practiceChapters')),
      h('ul', null, progress.chapters.map((item) => {
        const info = chapters.find((entry) => entry.id === item.id);
        return h('li', { key: item.id },
          h('button', {
            type: 'button', 'aria-current': item.id === chapter.id ? 'step' : undefined,
            onClick: () => { setCatalog(false); onNavigate('enter', item.id); },
          },
          `${t(info.titleKey)} · ${t(`practiceStatus_${item.status}`)}`,
          item.optional ? ` · ${t('practiceOptional')}` : '',
          ` · ${Math.min(item.index + 1, item.steps.length)}/${item.steps.length}`));
      })),
      h('p', null, t('practiceMoreChapters')),
      h('button', { type: 'button', className: 'eb-primary', onClick: () => setCatalog(false) }, t('close'))));
  };
}

// Shared browser-local operation practice lifecycle. No draft keys, host calls or UI.
// Factories are inlined by build.mjs; keep dependencies inside this function.
export function createPracticeProgress({ mode, chapters, storage, validateFrame = (frame) => frame }) {
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const key = `baicai-edu-math-board:practice:v2:${mode}`;
  let entries = {}, current = null, resumeChapter = chapters[0]?.id, goal = null, persistence = 'saved', recoveryRequired = false;
  function definition(id) {
    const chapter = chapters.find((item) => item.id === id);
    if (!chapter) throw Error('Unknown practice chapter');
    return chapter;
  }
  function validGoal(chapter, value) {
    if (!value || !Number.isInteger(value.index) || value.index < 0 || value.index > chapter.steps.length) throw Error('Invalid practice goal');
    const restored = chapter.createGoal(copy(value)).snapshot();
    if (restored.index !== value.index) throw Error('Incompatible practice goal');
    return restored;
  }
  try {
    const target = storage === undefined ? globalThis.localStorage : storage;
    storage = target;
    if (!storage?.getItem || !storage?.setItem) throw Error('Storage unavailable');
    const raw = storage.getItem(key);
    if (raw !== null) {
      const saved = JSON.parse(raw);
      if (saved.version !== 2 || !saved.entries || typeof saved.entries !== 'object') throw Error('Invalid practice progress');
      // Validate the whole envelope before publishing any restored state.
      const restored = {};
      for (const chapter of chapters) {
        const entry = saved.entries[chapter.id];
        if (!entry) continue;
        validGoal(chapter, entry.goal);
        if (!Array.isArray(entry.states) || entry.states.length !== chapter.steps.length
          || !entry.states.every((s) => ['not-started', 'in-progress', 'completed', 'skipped'].includes(s))
          || !entry.starts || typeof entry.starts !== 'object' || !entry.goals || typeof entry.goals !== 'object') throw Error('Invalid practice states');
        entry.frame = validateFrame(entry.frame);
        if (entry.returnTo) {
          validGoal(chapter, entry.returnTo.goal);
          entry.returnTo.frame = validateFrame(entry.returnTo.frame);
        }
        for (const index of Object.keys(entry.starts)) {
          if (!Number.isInteger(Number(index)) || Number(index) < 0 || Number(index) >= chapter.steps.length) throw Error('Invalid step start');
          entry.starts[index] = validateFrame(entry.starts[index]);
          if (validGoal(chapter, entry.goals[index]).index !== Number(index)) throw Error('Invalid step goal');
        }
        if (entry.goal.index < chapter.steps.length && !entry.starts[entry.goal.index]) throw Error('Missing step start');
        restored[chapter.id] = entry;
      }
      entries = restored;
      if (chapters.some((chapter) => chapter.id === saved.current)) resumeChapter = saved.current;
    }
  } catch (error) {
    entries = {};
    recoveryRequired = true;
    persistence = 'unavailable-or-invalid';
  }
  function persist() {
    if (recoveryRequired) return;
    try {
      if (!storage?.setItem) throw Error('Storage unavailable');
      storage.setItem(key, JSON.stringify({ version: 2, current: resumeChapter, entries }));
      persistence = 'saved';
    } catch { persistence = 'unavailable'; }
  }
  function snapshot() {
    return copy({ current, persistence, supplementing: Boolean(current && entries[current].returnTo), goal: goal?.snapshot() ?? null,
      frame: current ? entries[current].frame : null,
      chapters: chapters.map((chapter) => {
        const entry = entries[chapter.id];
        const states = entry?.states ?? chapter.steps.map(() => 'not-started');
        const status = states.every((s) => s === 'completed') ? 'completed'
          : states.every((s) => s === 'completed' || s === 'skipped') ? 'skipped'
            : entry ? 'in-progress' : 'not-started';
        return { id: chapter.id, optional: Boolean(chapter.optional), status, steps: chapter.steps, states,
          index: entry?.goal.index ?? 0 };
      }) });
  }
  function enter(id = resumeChapter, { retry = false, frame } = {}) {
    const chapter = definition(id);
    if (retry) recoveryRequired = false;
    if (!entries[id] || retry) {
      goal = chapter.createGoal();
      const previous = current && current !== id ? copy(entries[current].frame) : null;
      const start = validateFrame(copy(frame ?? chapter.start(previous)));
      entries[id] = { goal: goal.snapshot(), frame: start,
        starts: { 0: copy(start) }, goals: { 0: goal.snapshot() }, states: chapter.steps.map((_, index) => index === 0 ? 'in-progress' : 'not-started') };
    } else goal = chapter.createGoal(copy(entries[id].goal));
    current = id; resumeChapter = id;
    persist();
    return snapshot();
  }
  function saveFrame(frame) {
    if (!current) return snapshot();
    entries[current].frame = validateFrame(copy(frame));
    persist();
    return snapshot();
  }
  function returnFromSupplement(entry, chapter) {
    const continuation = entry.returnTo;
    if (!continuation) return false;
    goal = chapter.createGoal(copy(continuation.goal));
    entry.goal = goal.snapshot();
    entry.frame = copy(continuation.frame);
    delete entry.returnTo;
    return true;
  }
  function observe(event, frame) {
    if (!current) return snapshot();
    const entry = entries[current], chapter = definition(current), before = goal.snapshot();
    if (before.index >= chapter.steps.length) return saveFrame(frame);
    goal.observe(event);
    const next = goal.snapshot();
    entry.frame = validateFrame(copy(frame));
    if (next.index !== before.index) {
      entry.states[before.index] = 'completed';
      if (returnFromSupplement(entry, chapter)) { persist(); return snapshot(); }
      if (next.index < chapter.steps.length) {
        entry.states[next.index] = 'in-progress';
        entry.starts[next.index] = copy(entry.frame);
        entry.goals[next.index] = copy(next);
      }
    }
    entry.goal = next;
    persist();
    return snapshot();
  }
  function reset() {
    if (!current) return snapshot();
    const entry = entries[current], index = goal.snapshot().index;
    if (entry.starts[index]) {
      entry.frame = copy(entry.starts[index]);
      goal = definition(current).createGoal(copy(entry.goals[index]));
      entry.goal = goal.snapshot();
    }
    persist();
    return snapshot();
  }
  function skip() {
    if (!current) return snapshot();
    const chapter = definition(current), entry = entries[current], saved = goal.snapshot();
    if (saved.index >= chapter.steps.length) return snapshot();
    entry.states[saved.index] = 'skipped';
    if (returnFromSupplement(entry, chapter)) { persist(); return snapshot(); }
    // Each chapter supplies a sufficient independent start for a skipped dependency.
    const next = chapter.skip ? chapter.skip(copy(saved), copy(entry.frame))
      : { goal: { ...saved, index: saved.index + 1 }, frame: entry.frame };
    goal = chapter.createGoal(next.goal);
    entry.goal = goal.snapshot();
    entry.frame = validateFrame(copy(next.frame));
    if (entry.goal.index < chapter.steps.length) {
      entry.states[entry.goal.index] = 'in-progress';
      entry.starts[entry.goal.index] = copy(entry.frame);
      entry.goals[entry.goal.index] = copy(entry.goal);
    }
    persist();
    return snapshot();
  }
  function retryStep(index) {
    if (!current) return snapshot();
    const entry = entries[current], chapter = definition(current);
    if (!Number.isInteger(index) || !entry.starts[index] || entry.states[index] !== 'skipped') throw Error('Unavailable skipped step');
    if (entry.returnTo) entry.states[entry.goal.index] = 'skipped';
    else entry.returnTo = { goal: copy(entry.goal), frame: copy(entry.frame) };
    goal = chapter.createGoal(copy(entry.goals[index]));
    entry.goal = goal.snapshot();
    entry.frame = copy(entry.starts[index]);
    entry.states[index] = 'in-progress';
    persist();
    return snapshot();
  }
  return { snapshot, enter, saveFrame, observe, reset, skip, retryStep };
}
