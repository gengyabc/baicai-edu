// Workspace-first expression board UI. Embedded into client.js by build.mjs.
import { composerNote } from './view.js';
import { boardQuestionReferences } from '../shared/question-reference.js';

/**
 * The quantity page. `shared` is required and carries the modules both tabs use
 * (`createBoardFilePicker` and `createBoardIcons` from file-picker.js): build.mjs inlines
 * this factory with toString(), so importing them here would leave a reference that cannot
 * resolve in the bundle. JS tests pass the real imports; client.js passes the inlined copies.
 */
export function createBoardView(React, M, ctx, t, css, art, applyHostConfig, T, shared) {
  const h = React.createElement;
  const paletteColor = (index) => M.color(index);
  const icon = shared.createBoardIcons(React);
  // The dock's 返回对话, menu rows, more-actions trigger, status line and the board's
  // colours are shared with the geometry and demo pages.
  const controls = shared.createBoardControls(React, t);
  // Stable chapter ids are public extension points; later tickets append definitions.
  const PracticeNavigation = shared.createPracticeNavigation?.(React, t);
  const practiceSteps = ['add', 'move', 'add-second', 'select-one', 'select-many', 'deselect', 'insert'];
  const emptyPracticeFrame = () => ({ board: M.empty(), trace: T.empty(), history: { past: [], future: [] },
    selection: [], zoom: 1, fit: true, attachTrace: true, toolValue: null, append: false, scroll: { left: 0, top: 0 } });
  function validatePracticeFrame(frame) {
    if (!frame || !frame.history || !Array.isArray(frame.history.past) || !Array.isArray(frame.history.future)
      || frame.history.past.length > 40 || frame.history.future.length > 40
      || !Array.isArray(frame.selection) || !frame.selection.every((id) => typeof id === 'string')
      || !Number.isFinite(frame.zoom) || frame.zoom < 0.1 || frame.zoom > 10
      || typeof frame.fit !== 'boolean' || typeof frame.attachTrace !== 'boolean'
      || typeof frame.append !== 'boolean' || !(frame.toolValue === null || Number.isSafeInteger(frame.toolValue))
      || !Number.isFinite(frame.scroll?.left) || !Number.isFinite(frame.scroll?.top)) throw Error('Invalid practice frame');
    return { ...frame, board: M.validate(frame.board), trace: T.validate(frame.trace),
      history: { past: frame.history.past.map((state) => M.validate(state)), future: frame.history.future.map((state) => M.validate(state)) } };
  }
  const practiceChapters = [{ id: 'quantity-basics', titleKey: 'practiceBasics', steps: practiceSteps,
    start: emptyPracticeFrame, createGoal: shared.createQuantityPractice,
    skip(saved, frame) {
      const index = saved.index + 1;
      const targets = [...saved.targets];
      // Skipping an add supplies its dependency, but never counts the seed as an action.
      const needed = index >= 3 ? 2 : index >= 1 ? 1 : 0;
      for (let position = 0; position < needed; position++) {
        if (frame.board.objects.some((o) => o.id === targets[position])) continue;
        const before = new Set(frame.board.objects.map((o) => o.id));
        frame.board = M.reduce(frame.board, { type: 'add', shape: 'circle' });
        targets[position] = frame.board.objects.find((o) => !before.has(o.id)).id;
      }
      return { goal: { index, targets }, frame };
    },
  }, ...(shared.quantityPracticeChapters || []).map((factory) => factory({ M, T, emptyFrame: emptyPracticeFrame }))];
  const sameIds = (a, b) => a.length === b.length && a.every((id, index) => id === b[index]);
  const sorted = (ids) => [...ids].sort();
  function swatch(shape, colorIndex, size = 30) {
    return h('svg', { width: size, height: size, viewBox: '-28 -28 56 56', 'aria-hidden': true }, art.node(shape, 17, { fill: paletteColor(colorIndex), stroke: '#1E293B', strokeWidth: 1.1 }));
  }
  function brandMark(levels, size = 34) {
    const levelColor = (value, fallback) => {
      const level = levels.find((item) => item.value === value) || levels[Math.min(fallback, levels.length - 1)] || levels[0];
      return level ? paletteColor(level.color) : '#4CAF50';
    };
    return h('svg', { width: size, height: size, viewBox: '0 0 36 36', 'aria-hidden': true },
      h('rect', { x: 0.5, y: 0.5, width: 35, height: 35, rx: 10, fill: '#FFFFFF', stroke: '#D6DFE2' }),
      h('circle', { cx: 11, cy: 11.5, r: 5.5, fill: levelColor(1, 0) }),
      h('path', { d: 'M26 5.5 33.5 19h-15Z', fill: levelColor(10, 1) }),
      h('rect', { x: 6.5, y: 20, width: 21, height: 9, rx: 2, fill: levelColor(10000, 4) }));
  }

  function Board(props) {
    React.useSyncExternalStore((fn) => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot());
    const key = `baicai-edu-math-board:v4:${props.sessionId}`;
    const legacyKey = `baicai-edu-math-board:v2:${props.sessionId}`;
    const oldKey = `baicai-edu-math-board:v3:${props.sessionId}`;
    const watermarkKey = `${key}:config`;
    // One atomic local envelope pairs the reset watermark with the surviving
    // draft. Never persist a reset marker separately from its canvas.
    const clearKey = `${key}:clear-v1`;
    const clearMark = React.useRef({ revision: 0, requestId: null });
    const lastEditAt = React.useRef(0);
    const clearRequest = props.practice ? null : props.useProjection('eduBoardClear');
    // A second state owner, never a backup/restore of the live draft. The real
    // page stays mounted to consume legitimate host updates while practice is open.
    const [practiceOpen, setPracticeOpen] = React.useState(false);
    const practiceOpenRef = React.useRef(false);
    practiceOpenRef.current = practiceOpen;
    const practiceRef = React.useRef(null);
    if (props.practice && !practiceRef.current) practiceRef.current = shared.createPracticeProgress({
      mode: 'quantity', chapters: practiceChapters, validateFrame: validatePracticeFrame,
    });
    const [practiceProgress, setPracticeProgress] = React.useState(() => practiceRef.current?.snapshot());
    const practiceState = practiceProgress?.goal || { step: 'add', index: 0, total: 7, targets: [], completed: false };
    const practiceEvents = React.useRef([]);
    function practiceEvent(event) {
      if (props.practice) { practiceEvents.current.push(event); setPracticeProgress({ ...practiceRef.current.snapshot() }); }
    }
    const [opened, setOpened] = React.useState(false);
    const [board, setBoard] = React.useState(M.empty);
    const boardRef = React.useRef(board);
    const [ready, setReady] = React.useState(false);
    const [storageBlocked, setStorageBlocked] = React.useState(false);
    const [history, setHistory] = React.useState({ past: [], future: [] });
    const [trace, setTrace] = React.useState(() => T.empty());
    const traceRef = React.useRef(trace);
    const [attachTrace, setAttachTrace] = React.useState(true);
    const traceKey = `${key}:trace-v1`;
    const [selection, setSelection] = React.useState([]);
    const [zoom, setZoom] = React.useState(1);
    const [fit, setFit] = React.useState(() => window.matchMedia('(min-width: 1000px)').matches);
    const [status, setStatus] = React.useState('');
    const [preview, setPreview] = React.useState(null);
    const [overlay, setOverlay] = React.useState(null);
    // No explicit colour choice: honour the host's per-pattern defaults.
    const [toolValue, setToolValue] = React.useState(null);
    const [questionExpanded, setQuestionExpanded] = React.useState(false);
    const [moreOpen, setMoreOpen] = React.useState(false);
    const [append, setAppend] = React.useState(false);
    const [dragShape, setDragShape] = React.useState(null);
    const workspaceRef = React.useRef(null);
    const toolLevel = board.settings.levels.find((level) => level.value === toolValue)
      || board.settings.levels.find((level) => level.value === 1) || board.settings.levels[0];
    const config = props.practice ? null : props.useProjection('eduBoardConfig');
    const watermark = React.useRef(-1);
    const pendingWatermark = React.useRef(null);
    const dialog = React.useRef(null), gesture = React.useRef(null), revision = React.useRef(0);
    // Opening a different file replaces the canvas, so an open that outlives a clear must
    // not land as an edit: every clear starts a new draft epoch.
    const draftEpoch = React.useRef(0);
    // File handles, pickers and the browser-side memory are shared with the geometry tab;
    // this page only supplies its own JSON, its draft and its sentences.
    const picker = shared.createBoardFilePicker({
      React, t, dbName: 'baicai-edu-math-board', handleKey: 'last-board-file', anchor: true,
      read: () => (gesture.current = null, M.serialize(boardRef.current)),
      load: (file, epoch) => loadOpenedFile(file, revision.current, epoch ?? draftEpoch.current),
      stale: (rev) => rev !== revision.current,
      // The handoff input may still hold a file chosen before a clear.
      canAcceptFile: (epoch) => epoch === draftEpoch.current,
      canEdit,
      beforeOpen: flushEditor,
    });
    const svgRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const revealRef = React.useRef([]);
    const nameRef = React.useRef(null), noteRef = React.useRef(null);
    const phase = props.useInput((s) => s.phase);
    const selected = board.objects.filter((o) => selection.includes(o.id));
    const single = selected.length === 1 ? selected[0] : null;
    const activeSelected = selected.filter((o) => !o.removed);
    const touchedGroups = [...new Set(selected.map((o) => o.groupId).filter(Boolean))];
    const completeGroup = touchedGroups.length === 1 && selected.length > 0
      && selected.every((o) => o.groupId === touchedGroups[0])
      && board.objects.every((o) => o.groupId !== touchedGroups[0] || selection.includes(o.id))
      ? board.groups.find((g) => g.id === touchedGroups[0]) : null;
    const dense = board.objects.length > 60;
    const radius = dense ? 13 : 19;
    // Rows keep growing downwards: the board is as tall as its lowest shape plus
    // room for the value badge and name, and the canvas scrolls when it passes the
    // visible area. Dragging stays inside the committed board, not this preview.
    const restBottom = Math.max(330, board.objects.reduce((value, o) => Math.max(value, o.y), 0) + 60);
    const lowest = board.objects.reduce((value, o) =>
      Math.max(value, o.y + (preview?.kind === 'move' && preview.ids.includes(o.id) ? preview.dy : 0)), 0);
    const boardHeight = Math.max(400, lowest + 60);
    const mergeInfo = activeSelected.length >= 2 ? M.mergeCandidate(board, activeSelected.map((o) => o.id)) : null;
    const levels = board.settings.levels;
    const visibleShapes = board.settings.shapes;
    // The keyed chat reader is live: select a primitive derived from its values,
    // not its identity, so settled responses and visibility changes update us. A split
    // layout shares the shell's single reader and receives its question strip instead.
    const referenceJson = !props.question && props.useChat
      ? props.useChat((chat) => JSON.stringify(boardQuestionReferences(chat))) : '[]';
    const references = JSON.parse(referenceJson);
    const [questionKey, setQuestionKey] = React.useState(null);
    const reference = references.find((item) => item.key === questionKey) || references.at(-1);
    React.useEffect(() => { setQuestionExpanded(false); }, [reference?.key]);

    const pageActive = props.split ? props.tabActive === true : opened;
    const tabActive = pageActive && !practiceOpen;
    // Quantity safe basics is explicitly entered; first-run routing belongs to
    // the later release ticket, not the legacy v1 'seen' flag.
    const startQuantityTour = () => {
      practiceOpenRef.current = true;
      gesture.current = null; setPreview(null); setDragShape(null);
      setMoreOpen(false); setOverlay(null); setPracticeOpen(true);
    };
    React.useEffect(() => {
      if (!pageActive) setPracticeOpen(false);
    }, [pageActive]);

    React.useEffect(() => {
      if (props.practice) {
        const next = practiceRef.current.enter();
        applyPracticeFrame(next.frame); setPracticeProgress(next); setReady(true);
        return () => { gesture.current = null; revision.current++; };
      }
      revision.current++;
      try {
        const envelope = JSON.parse(localStorage.getItem(clearKey) || 'null');
        if (envelope && (!Number.isSafeInteger(envelope.revision) || envelope.revision < 0
          || !(envelope.requestId === null || typeof envelope.requestId === 'string')
          || !Number.isSafeInteger(envelope.lastEditAt) || envelope.lastEditAt < 0)) throw Error('Invalid clear envelope');
        const current = envelope ? JSON.stringify(envelope.board)
          : localStorage.getItem(key) ?? localStorage.getItem(oldKey) ?? localStorage.getItem(legacyKey);
        const next = current ? M.validate(JSON.parse(current)) : M.empty();
        if (envelope) {
          clearMark.current = { revision: envelope.revision, requestId: envelope.requestId };
          lastEditAt.current = envelope.lastEditAt;
        }
        boardRef.current = next; setBoard(next);
        let restored = T.empty(current !== null);
        try {
          const saved = envelope ? { board: JSON.stringify(next), trace: envelope.trace, attach: envelope.attach }
            : JSON.parse(localStorage.getItem(traceKey) || 'null');
          if (saved && typeof saved.attach === 'boolean') setAttachTrace(saved.attach);
          if (saved && saved.board === JSON.stringify(next)) restored = T.validate(saved.trace);
        } catch { setStatus(t('traceLoadError')); }
        traceRef.current = restored; setTrace(restored);
        setHistory({ past: [], future: [] });
        const mark = envelope?.configWatermark ?? localStorage.getItem(watermarkKey) ?? localStorage.getItem(`${oldKey}:config`) ?? localStorage.getItem(`${legacyKey}:config`);
        const parsed = mark === null ? -1 : Number(mark);
        watermark.current = Number.isFinite(parsed) ? parsed : -1;
        pendingWatermark.current = null;
      } catch { setStorageBlocked(true); setStatus(t('loadError')); }
      setReady(true);
      return () => { revision.current++; gesture.current = null; };
    }, [key]);

    React.useEffect(() => {
      if (props.practice || !ready || storageBlocked) return;
      let live = true;
      withDraftLock(() => {
      // Selection and file pickers change the interaction revision, not the draft.
      // Only a replaced draft (or a cleaned-up effect) invalidates this save.
      if (!live || boardRef.current !== board || traceRef.current !== trace) return;
      try {
        const saved = JSON.parse(localStorage.getItem(clearKey) || 'null');
        if (saved && (saved.revision > clearMark.current.revision || saved.lastEditAt > lastEditAt.current)) return;
        const serialized = JSON.stringify(board);
        saveClearEnvelope(board, trace, attachTrace);
        localStorage.setItem(key, serialized);
        localStorage.setItem(traceKey, JSON.stringify({ board: serialized, trace, attach: attachTrace }));
        if (pendingWatermark.current !== null) {
          localStorage.setItem(watermarkKey, String(pendingWatermark.current));
          pendingWatermark.current = null;
        }
      } catch { setStatus(t('storageError')); }
      }, () => setStatus(t('storageError')));
      return () => { live = false; };
    }, [board, trace, attachTrace, ready, storageBlocked, key]);

    function practiceFrame() {
      return { board, trace, history, selection, zoom, fit, attachTrace, toolValue, append,
        scroll: { left: canvasRef.current?.scrollLeft || 0, top: canvasRef.current?.scrollTop || 0 } };
    }
    function applyPracticeFrame(frame) {
      gesture.current = null; setPreview(null); setDragShape(null); setOverlay(null); setMoreOpen(false);
      boardRef.current = frame.board; setBoard(frame.board);
      traceRef.current = frame.trace; setTrace(frame.trace);
      setHistory(frame.history); setSelection(frame.selection); setZoom(frame.zoom); setFit(frame.fit);
      setAttachTrace(frame.attachTrace); setToolValue(frame.toolValue); setAppend(frame.append);
      if (canvasRef.current) { canvasRef.current.scrollLeft = frame.scroll.left; canvasRef.current.scrollTop = frame.scroll.top; }
    }
    function navigatePractice(command, value) {
      practiceEvents.current = [];
      const next = command === 'retry' ? practiceRef.current.enter(practiceProgress.current, { retry: true })
        : command === 'enter' ? practiceRef.current.enter(value)
          : command === 'retryStep' ? practiceRef.current.retryStep(value) : practiceRef.current[command]();
      applyPracticeFrame(next.frame); setPracticeProgress(next);
    }
    React.useEffect(() => {
      if (!props.practice || !ready) return;
      const events = practiceEvents.current.splice(0);
      const wasSupplementing = practiceRef.current.snapshot().supplementing;
      let next;
      if (events.length) for (const event of events) next = practiceRef.current.observe(event, practiceFrame());
      else next = practiceRef.current.saveFrame(practiceFrame());
      // A one-step supplement returns to its original paired goal/frame, not to
      // the temporary editor contents used to practise the skipped operation.
      if (wasSupplementing && !next.supplementing) applyPracticeFrame(next.frame);
      // Do not loop an effect for a failed write or a frame-only save.
      if (events.length || next.persistence !== practiceProgress?.persistence) setPracticeProgress(next);
    }, [ready, board, trace, history, selection, zoom, fit, attachTrace, toolValue, append, practiceProgress]);

    // New shapes that land below the visible part of a tall board scroll it down so
    // the student sees the row they just started.
    React.useEffect(() => {
      const added = revealRef.current;
      if (!added.length) return;
      revealRef.current = [];
      const container = canvasRef.current, svg = svgRef.current;
      if (!container || !svg) return;
      const viewHeight = svg.viewBox?.baseVal?.height
        ?? Number.parseFloat((svg.getAttribute?.('viewBox') || '').split(/\s+/)[3] || '0');
      const rect = svg.getBoundingClientRect?.();
      const scale = rect?.height && viewHeight ? rect.height / viewHeight : 0;
      if (!scale) return;
      const objects = board.objects.filter((o) => added.includes(o.id));
      if (!objects.length) return;
      const bottom = Math.max(...objects.map((o) => o.y)) * scale;
      if (bottom > container.scrollTop + container.clientHeight - 40) {
        container.scrollTop = Math.max(0, bottom - container.clientHeight + 70);
      }
    }, [board]);

    React.useEffect(() => {
      if (!ready || !config) return;
      const applied = [];
      let recordFailed = false;
      const result = applyHostConfig(M, boardRef.current, config, watermark.current,
        (before, after, change) => {
          applied.push(change);
          if (!recordChange(before, after, change, 'system')) recordFailed = true;
        });
      if (!result) return;
      revision.current++;
      publish(result.board);
      if (applied.length) {
        setToolValue(null);
        const replay = (snapshot) => applied.reduce((state, action) => {
          try { return M.reduce(state, action); } catch { return state; }
        }, snapshot);
        setHistory((old) => ({ past: old.past.map(replay), future: old.future.map(replay) }));
      }
      watermark.current = result.watermark;
      pendingWatermark.current = result.watermark;
      setStatus(recordFailed ? t('traceRecordError') : t(result.status));
    }, [config, ready]);

    React.useEffect(() => {
      if (!ready || !clearRequest || !Number.isSafeInteger(clearRequest.revision)
        || clearRequest.revision <= clearMark.current.revision || !clearRequest.requestId
        || !Number.isSafeInteger(clearRequest.requestedAt) || clearRequest.requestedAt <= 0) return;
      // Local host and browser share the system clock. A remote host's wall
      // clock cannot establish edit causality; fail safe rather than guess.
      const localHost = ['localhost', '127.0.0.1', '[::1]', '::1'].includes(window.location?.hostname);
      if (storageBlocked || !localHost) { setStatus(t('autoClearError')); return; }
      let live = true;
      withDraftLock(() => {
      if (!live || clearRequest.revision <= clearMark.current.revision) return;
      try {
        // Another tab may have edited this same session while this tab was idle.
        const saved = JSON.parse(localStorage.getItem(clearKey) || 'null');
        if (saved && saved.revision >= clearRequest.revision) {
          restoreSavedDraft(saved);
          return;
        }
        const editedAt = Math.max(lastEditAt.current, saved?.lastEditAt || 0);
        const late = editedAt >= clearRequest.requestedAt || clearRequest.requestedAt > Date.now();
        if (saved && saved.lastEditAt > lastEditAt.current) {
          publish(M.validate(saved.board)); publishTrace(T.validate(saved.trace));
          lastEditAt.current = saved.lastEditAt;
        }
        const next = late ? boardRef.current : { ...M.empty(), settings: boardRef.current.settings };
        const nextTrace = late ? traceRef.current : T.empty();
        const mark = { revision: clearRequest.revision, requestId: clearRequest.requestId };
        // Persist first: a quota failure must not publish a destructive change.
        saveClearEnvelope(next, nextTrace, attachTrace, mark);
        clearMark.current = mark;
        if (!late) {
          resetCanvas(next, nextTrace);
          setStatus(t('autoClearDone'));
        } else setStatus(t('autoClearSkipped'));
      } catch { setStatus(t('autoClearError')); }
      }, () => setStatus(t('autoClearError')), true);
      return () => { live = false; };
    }, [clearRequest, ready, storageBlocked]);

    React.useEffect(() => {
      const node = dialog.current;
      // A split layout has no dialog of its own: the shell owns the only one.
      if (!node) return;
      if (opened && !node.open) node.showModal();
      if (!opened && node.open) node.close();
    }, [opened]);
    React.useEffect(() => () => { if (dialog.current?.open) dialog.current.close(); }, []);
    // Show the remembered file name right away; a missing memory is not an error.
    React.useEffect(() => { if (!props.practice) picker.rememberName().catch(() => {}); }, []);
    React.useEffect(() => {
      if (!status || [t('autoClearError'), t('autoClearSkipped'), t('autoClearDone')].includes(status)) return;
      const timer = setTimeout(() => setStatus(''), 5200);
      return () => clearTimeout(timer);
    }, [status]);
    // In the shared dialog this page has no `opened` of its own: the shell already
    // showed it, so menus must still dismiss. A standalone board waits until it opens.
    const shown = Boolean(props.split) || opened;
    React.useEffect(() => {
      if (!shown) return;
      const closeMenus = (event) => {
        if (!event.target.closest?.('.eb-menu, .eb-menu-trigger')) { setMoreOpen(false); }
      };
      document.addEventListener('pointerdown', closeMenus);
      return () => document.removeEventListener('pointerdown', closeMenus);
    }, [shown]);
    React.useEffect(() => {
      if (!overlay) return;
      const node = overlay.kind === 'note' ? noteRef.current : nameRef.current;
      if (node) { node.focus(); if (node.select) node.select(); }
    }, [overlay]);
    function requestOverlay(next) {
      setOverlay(next);
    }
    function dismissOverlay() {
      requestOverlay(null);
    }
    React.useEffect(() => {
      // Only the visible tab hears Escape, so a hidden page cannot cancel the other one.
      if (!tabActive) return undefined;
      const onKey = (event) => {
        if (event.target?.closest?.('.eb-teacher-reference')) return;
        if (event.key === 'Delete' || event.key === 'Backspace') {
          // An overlay owns the keyboard. A text field or the question
          // menu keeps the key. A focused shape outside the selection is removed on
          // its own, matching Enter and the arrow keys. Any other focus deletes the
          // current selection, so the key works after a click the way it does on
          // the geometry board.
          if (overlay) return;
          const tag = event.target?.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable) return;
          const focusedId = event.target?.closest?.('[data-object]')?.getAttribute('data-object');
          const ids = focusedId && !selection.includes(focusedId) ? [focusedId] : selection;
          const live = ids.filter((id) => boardRef.current.objects.some((object) => object.id === id));
          if (!live.length) return;
          event.preventDefault();
          batch(live.map((id) => ({ type: 'delete', id })));
          selectIds([]);
          return;
        }
        if (event.key !== 'Escape') return;
        if (overlay) { event.preventDefault(); dismissOverlay(); }
        if (moreOpen) { event.preventDefault(); setMoreOpen(false); }
        if (append) { event.preventDefault(); setAppend(false); }
        if (overlay || moreOpen || append) return;
        if (gesture.current || dragShape) {
          event.preventDefault();
          gesture.current = null;
          setPreview(null);
          setDragShape(null);
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [tabActive, overlay, moreOpen, append, dragShape, selection]);

    function flushEditor() {
      const active = dialog.current?.ownerDocument.activeElement;
      if (active && dialog.current.contains(active) && active.matches('input,textarea,select')) active.blur();
    }
    function withDraftLock(task, failed, required = false) {
      const locks = globalThis.navigator?.locks;
      if (!locks?.request) {
        if (required) { failed(); return; }
        task(); return;
      }
      try { locks.request(clearKey, { mode: 'exclusive' }, task).catch(failed); }
      catch { failed(); }
    }
    function saveClearEnvelope(next, nextTrace, attach, mark = clearMark.current) {
      localStorage.setItem(clearKey, JSON.stringify({ ...mark, lastEditAt: lastEditAt.current,
        board: next, trace: nextTrace, attach, configWatermark: watermark.current }));
    }
    function touchDraft() { lastEditAt.current = Math.max(Date.now(), lastEditAt.current + 1); }
    function restoreSavedDraft(saved) {
      const next = M.validate(saved.board);
      const nextTrace = T.validate(saved.trace);
      clearMark.current = { revision: saved.revision, requestId: saved.requestId };
      lastEditAt.current = saved.lastEditAt;
      resetCanvas(next, nextTrace);
    }
    function resetCanvas(next, nextTrace) {
      revision.current++; draftEpoch.current++; gesture.current = null; setPreview(null);
      publish(next); publishTrace(nextTrace);
      setHistory({ past: [], future: [] });
      selectIds([]); setAppend(false); setOverlay(null); revealRef.current = [];
    }
    function publish(next) { boardRef.current = next; setBoard(next); }
    function publishTrace(next) { traceRef.current = next; setTrace(next); }
    function recordChange(before, after, change, origin = 'student') {
      try { publishTrace(T.record(traceRef.current, before, after, change, origin)); return true; }
      catch {
        let kept;
        try { kept = { ...traceRef.current, priorUnknown: true }; T.validate(kept); } catch { kept = T.empty(true); }
        publishTrace(kept);
        setStatus(t('traceRecordError'));
        return false;
      }
    }
    function commit(next, change) {
      const before = boardRef.current;
      if (JSON.stringify(next) === JSON.stringify(before)) {
        if (change?.type === 'import') { touchDraft(); recordChange(before, next, change); }
        return;
      }
      touchDraft();
      gesture.current = null; setPreview(null); revision.current++;
      setHistory((old) => ({ past: [...old.past.slice(-39), before], future: [] }));
      const recorded = recordChange(before, next, change);
      publish(next);
      if (recorded) setStatus('');
    }
    function canEdit() {
      if (props.practice) return ready;
      // Captured real-page callbacks can outlive the menu that entered practice.
      // Suspend student edits, not the host effects or queued real-draft saves.
      if (practiceOpenRef.current) return false;
      if (!ready || (clearRequest?.revision > clearMark.current.revision)) {
        setStatus(t('autoClearError')); return false;
      }
      try {
        const saved = JSON.parse(localStorage.getItem(clearKey) || 'null');
        if (saved && (saved.revision > clearMark.current.revision || saved.lastEditAt > lastEditAt.current)) {
          restoreSavedDraft(saved);
          return false;
        }
      } catch { /* Ordinary editing remains possible when browser storage is blocked. */ }
      return true;
    }
    function action(a) {
      if (!canEdit()) return null;
      try { const next = M.reduce(boardRef.current, a); commit(next, a); return next; }
      catch (error) { setStatus(`${t('failed')}: ${error.message}`); return null; }
    }
    function batch(actions) { return action({ type: 'batch', actions }); }
    function selectIds(ids, user = false) {
      setSelection(ids);
      if (user) practiceEvent({ type: 'select', selection: ids });
    }
    function undo() {
      if (!canEdit()) return;
      const prev = history.past.at(-1); if (!prev) return;
      touchDraft();
      gesture.current = null; setPreview(null); revision.current++;
      setHistory({ past: history.past.slice(0, -1), future: [boardRef.current, ...history.future].slice(0, 40) });
      const recorded = recordChange(boardRef.current, prev, { type: 'undo' });
      publish(prev); selectIds([]); setAppend(false); if (recorded) setStatus('');
    }
    function redo() {
      if (!canEdit()) return;
      const next = history.future[0]; if (!next) return;
      touchDraft();
      gesture.current = null; setPreview(null); revision.current++;
      setHistory({ past: [...history.past, boardRef.current].slice(-40), future: history.future.slice(1) });
      const recorded = recordChange(boardRef.current, next, { type: 'redo' });
      publish(next); selectIds([]); setAppend(false); if (recorded) setStatus('');
    }
    const button = controls.button;
    function toolButton(name, handler, extra = {}) { return button(icon(name), handler, { title: t(name), 'aria-label': t(name), className: 'eb-icon-button', ...extra }); }

    function creationLevel(shape) {
      if (toolValue !== null && levels.some((level) => level.value === toolValue)) return toolLevel;
      const value = board.settings.defaults.find((entry) => entry.shape === shape)?.value;
      return levels.find((level) => level.value === value) || toolLevel;
    }
    function createAndReveal(a, selectCreated = true) {
      const before = new Set(boardRef.current.objects.map((o) => o.id));
      const next = action(a);
      if (!next) return;
      const added = next.objects.filter((o) => !before.has(o.id)).map((o) => o.id);
      selectIds(selectCreated ? added : []);
      revealRef.current = added;
    }
    function add(shape, point) {
      const extra = point ? { x: point.x, y: point.y } : {};
      const before = boardRef.current;
      createAndReveal({ type: 'add', shape, value: creationLevel(shape).value, ...extra });
      practiceEvent({ type: 'add', before, after: boardRef.current });
    }
    function updateSelected(patch) { batch(selected.map((o) => ({ type: 'update', id: o.id, patch }))); }
    function groupSelection() {
      const current = boardRef.current;
      const before = new Set(current.groups.map((item) => item.id));
      const touched = [...new Set(current.objects.filter((item) => selection.includes(item.id)).map((item) => item.groupId).filter(Boolean))];
      const previous = touched.length === 1 ? current.groups.find((item) => item.id === touched[0]) : null;
      const alias = previous ? previous.alias : t('defaultGroup');
      const next = action({ type: 'groupSelected', ids: selected.map((item) => item.id), alias });
      if (!next) return;
      const created = next.groups.find((item) => !before.has(item.id));
      if (created) setSelection(next.objects.filter((item) => item.groupId === created.id).map((item) => item.id));
    }
    function ungroup() { if (completeGroup) { action({ type: 'deleteGroup', id: completeGroup.id }); setSelection([]); } }
    function duplicate() { createAndReveal({ type: 'duplicateSelected', ids: selection }); }
    function mergeSelection() {
      const next = action({ type: 'merge', ids: activeSelected.map((o) => o.id) });
      if (next) selectIds([]);
    }
    function splitSelection() { createAndReveal({ type: 'split', id: single.id }, false); }
    function removeSelected() { batch(selected.map((o) => ({ type: 'delete', id: o.id }))); selectIds([]); }
    function crossOut() { batch(activeSelected.map((o) => ({ type: 'update', id: o.id, patch: { removed: true } }))); }

    function point(e) {
      const svg = svgRef.current, p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const matrix = svg.getScreenCTM(); return matrix ? p.matrixTransform(matrix.inverse()) : { x: 30, y: 30 };
    }
    function expandGroup(ids) {
      const members = boardRef.current.objects.filter((o) => ids.includes(o.id) && o.groupId !== null);
      const extra = boardRef.current.objects.filter((o) => members.some((m) => m.groupId === o.groupId) && !ids.includes(o.id)).map((o) => o.id);
      return [...new Set([...ids, ...extra])];
    }
    function pointerDown(e) {
      if (e.button !== 0 || !canEdit()) return;
      touchDraft();
      flushEditor();
      const p = point(e), objectId = e.target.closest?.('[data-object]')?.getAttribute('data-object');
      revision.current++;
      if (objectId) {
        const whole = expandGroup([objectId]);
        let ids = selection;
        if (e.shiftKey || append) {
          ids = selection.includes(objectId) ? selection.filter((id) => id !== objectId) : [...selection, objectId];
          selectIds(ids, true); return;
        }
        if (!ids.includes(objectId)) ids = whole;
        selectIds(ids, true);
        gesture.current = { kind: 'move', ids, start: p, pointer: e.pointerId, base: boardRef.current, moved: false };
      } else {
        gesture.current = { kind: 'lasso', start: p, current: p, pointer: e.pointerId, base: boardRef.current, initial: e.shiftKey || append ? selection : [], moved: false };
      }
      e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    }
    function pointerMove(e) {
      const g = gesture.current; if (!g || g.pointer !== e.pointerId) return;
      const p = point(e), dx = p.x - g.start.x, dy = p.y - g.start.y;
      g.current = p;
      if (Math.abs(dx) + Math.abs(dy) < 3 && !g.moved) return;
      g.moved = true;
      if (g.kind === 'move') {
        const members = g.base.objects.filter((o) => g.ids.includes(o.id));
        g.dx = Math.max(30 - Math.min(...members.map((o) => o.x)), Math.min(770 - Math.max(...members.map((o) => o.x)), dx));
        g.dy = Math.max(30 - Math.min(...members.map((o) => o.y)), Math.min(restBottom - Math.max(...members.map((o) => o.y)), dy));
        setPreview({ kind: 'move', ids: g.ids, dx: g.dx, dy: g.dy });
      } else setPreview({ kind: 'lasso', x: Math.min(p.x, g.start.x), y: Math.min(p.y, g.start.y), w: Math.abs(dx), h: Math.abs(dy) });
    }
    function pointerEnd(e, cancelled = false) {
      const g = gesture.current; if (!g || g.pointer !== e.pointerId) return;
      gesture.current = null; setPreview(null);
      if (cancelled) return;
      if (g.kind === 'move' && g.moved) {
        const before = boardRef.current;
        const after = action({ type: 'moveMany', ids: g.ids, dx: g.dx || 0, dy: g.dy || 0 });
        if (after) practiceEvent({ type: 'move', before, after, submitted: true });
      }
      if (g.kind === 'lasso') {
        if (!g.moved) { selectIds([], true); return; }
        const p = g.current, x1 = Math.min(p.x, g.start.x), x2 = Math.max(p.x, g.start.x), y1 = Math.min(p.y, g.start.y), y2 = Math.max(p.y, g.start.y);
        const hit = g.base.objects.filter((o) => o.x + radius >= x1 && o.x - radius <= x2 && o.y + radius >= y1 && o.y - radius <= y2).map((o) => o.id);
        selectIds([...new Set([...g.initial, ...hit])], true);
      }
    }
    function objectKey(e, o) {
      // An open editor claims the keyboard; Delete must not edit under it.
      if (picker.overlayBlocksKey(overlay, e)) {
        e.preventDefault();
        return;
      }
      const arrows = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectIds(e.shiftKey || append
          ? (selection.includes(o.id) ? selection.filter((id) => id !== o.id) : [...selection, o.id])
          : expandGroup([o.id]), true);
      } else if (arrows[e.key]) {
        e.preventDefault(); const [dx, dy] = arrows[e.key];
        action({ type: 'moveMany', ids: selection.includes(o.id) ? selection : [o.id], dx, dy });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // The document listener deletes. Swallow the key here so a focused shape
        // does not also navigate the browser back.
        e.preventDefault();
      }
    }
    function close() {
      if (props.practice) { props.onPracticeExit(); props.close?.(); return; }
      setPracticeOpen(false);
      flushEditor(); gesture.current = null; setPreview(null); setOverlay(null);
      setMoreOpen(false); setAppend(false);
      // Persistent task notices are acknowledged once the student has seen them.
      if ([t('autoClearError'), t('autoClearSkipped'), t('autoClearDone')].includes(status)) setStatus('');
      // The shell owns the only dialog. Closing this page's unused `opened` flag
      // leaves that dialog up, so "返回对话" did nothing on the quantity tab.
      if (props.split) props.close?.();
      else setOpened(false);
    }
    // A press outside the shared dialog uses this same close.
    if (props.bindClose) props.bindClose(close);
    function recoverDraft(next, nextTrace, message) {
      if (props.practice) { resetCanvas(next, nextTrace); setStatus(t(message)); return; }
      const version = revision.current;
      withDraftLock(() => {
        if (version !== revision.current) { setStatus(t('storageError')); return; }
        try {
          const mark = clearRequest?.revision > clearMark.current.revision && clearRequest.requestId
            ? { revision: clearRequest.revision, requestId: clearRequest.requestId } : clearMark.current;
          touchDraft();
          // Explicit recovery replaces a poisoned envelope without parsing it.
          saveClearEnvelope(next, nextTrace, attachTrace, mark);
          clearMark.current = mark;
          resetCanvas(next, nextTrace);
          setStorageBlocked(false); setStatus(t(message));
        } catch { setStatus(t('storageError')); }
      }, () => setStatus(t('storageError')));
    }
    function confirmClearBoard() {
      recoverDraft({ ...M.empty(), settings: boardRef.current.settings }, T.empty(), 'clearDone');
    }
    function insert() {
      // This guard precedes every host/composer access, including keyboard calls
      // and direct activation at an earlier goal or after completion.
      if (props.practice) {
        const step = practiceRef.current.snapshot().goal.step;
        practiceEvent({ type: 'insert', after: boardRef.current });
        setStatus(t(step === 'insert' || step === 'complete' ? 'tutorialInsertPractice' : 'practiceInsertBlocked'));
        return;
      }
      if (!canEdit()) return;
      flushEditor();
      const conversation = ctx.get('conversation');
      let drafts = [];
      const discard = () => {
        for (const draft of drafts) {
          try { props.inputActions.removeAttachment(draft.id); } catch { /* composer may be locked */ }
          try { conversation.releaseDraftAttachment(draft.id); } catch { /* upload settled */ }
        }
        drafts = [];
      };
      try {
        if (!conversation?.createDrafts) throw Error();
        const note = composerNote(boardRef.current);
        const files = [new File([M.serialize(boardRef.current)], t('attachmentName'), { type: 'application/json' })];
        let traceSkipped = false;
        if (attachTrace) {
          try { files.push(new File([T.serialize(traceRef.current)], t('traceAttachmentName'), { type: 'application/json' })); }
          catch { traceSkipped = true; }
        }
        drafts = conversation.createDrafts(props.sessionId, files);
        if (!props.inputActions.addAttachments(drafts.map((draft) => draft.id))) throw Error();
        if (note && !props.inputActions.insertText(`\n${note}\n`, props.inputActions.captureInsertion())) throw Error();
        props.inputActions.persistDraft(); setStatus(t(traceSkipped ? 'traceSkipped' : (note ? 'insertedNote' : 'inserted'))); close();
      } catch {
        discard();
        setStatus(t('insertFailed'));
      }
    }

    async function saveFile() {
      if (props.practice) { setStatus(t('practiceFilesUnavailable')); return; }
      flushEditor();
      setStatus((await picker.saveFile()).message || '');
    }
    // The tab's own import: it validates before publishing and decides what a blocked
    // draft may do. The shared picker only owns the picker, the size cap and the memory.
    async function loadOpenedFile(file, rev, epoch = draftEpoch.current) {
      if (props.practice) return;
      if (rev !== revision.current || epoch !== draftEpoch.current) return;
      gesture.current = null; setPreview(null);
      const next = M.validate(JSON.parse(await file.text()));
      if (rev !== revision.current) return;
      if (storageBlocked) { recoverDraft(next, T.empty(true), 'imported'); return; }
      if (!canEdit()) return;
      commit(next, { type: 'import' }); selectIds([]); setAppend(false); setStatus(t('imported'));
    }
    async function openFile() {
      if (props.practice) { setStatus(t('practiceFilesUnavailable')); return; }
      flushEditor();
      // Each open owns a revision; an answer that arrives after the student edited the
      // board is dropped instead of replacing the newer draft. The fallback input also
      // remembers the draft it was opened on, so a stale file cannot land after a clear.
      const epoch = draftEpoch.current;
      inputEpoch.current = epoch; inputRevision.current = revision.current + 1;
      await picker.openFile({ revision: ++revision.current, epoch });
      setMoreOpen(false);
    }
    // The handoff input belongs to an open started at a known draft: a file it returns
    // after a clear is from the old task. Capture that epoch when the dialog starts, not
    // when the file arrives, or the guard could never fail.
    const inputEpoch = React.useRef(null);
    const inputRevision = React.useRef(null);
    async function importInput(event) {
      if (props.practice) return;
      // Only the handoff can show a "choose a plain file" hint; the opened file reports
      // its own success or failure through the tab's import.
      const epoch = inputEpoch.current ?? draftEpoch.current;
      const rev = inputRevision.current ?? revision.current;
      inputEpoch.current = null; inputRevision.current = null;
      const result = await picker.importInput(event, { revision: rev, epoch });
      if (result.message) setStatus(result.message);
    }

    function noteTargetFor(items, group) {
      if (group) return { kind: 'group', id: group.id, label: group.alias || t('defaultGroup') };
      if (items.length === 1) return { kind: 'object', id: items[0].id, label: items[0].alias || t(items[0].shape) };
      if (items.length > 1) return { kind: 'selection', ids: sorted(items.map((o) => o.id)), label: `${t('selectedCount')} ${items.length}` };
      return null;
    }
    function noteText(target) {
      if (!target) return board.note;
      if (target.kind === 'group') return board.groups.find((g) => g.id === target.id)?.note || '';
      if (target.kind === 'object') return board.objects.find((o) => o.id === target.id)?.note || '';
      return board.notes.find((note) => sameIds(note.objectIds, target.ids))?.text || '';
    }
    function openNote() {
      const target = noteTargetFor(selected, completeGroup);
      requestOverlay({ kind: 'note', target, value: noteText(target), label: target ? target.label : t('noteGeneral') });
    }
    function openName() {
      if (completeGroup) requestOverlay({ kind: 'name', group: completeGroup, value: completeGroup.alias });
      else if (single && !single.groupId) requestOverlay({ kind: 'name', object: single, value: single.alias });
    }
    function applyName() {
      const value = nameRef.current?.value ?? '';
      if (overlay?.group) action({ type: 'renameGroup', id: overlay.group.id, alias: value });
      if (overlay?.object) action({ type: 'update', id: overlay.object.id, patch: { alias: value } });
      setOverlay(null);
    }
    function applyNote() {
      const value = noteRef.current?.value ?? '';
      const target = overlay?.target;
      if (!target) action({ type: 'note', value });
      else if (target.kind === 'selection') action({ type: 'annotate', target: 'selection', ids: target.ids, value });
      else action({ type: 'annotate', target: target.kind, id: target.id, value });
      setOverlay(null);
    }
    function togglePattern(shape) {
      const current = boardRef.current.settings;
      if (current.shapes.includes(shape)) {
        if (current.shapes.length === 1) return;
        action({ type: 'configure', settings: { ...current, shapes: current.shapes.filter((item) => item !== shape) }, scope: 'future' });
      } else {
        action({ type: 'configure', settings: { ...current, shapes: [...current.shapes, shape] }, scope: 'future' });
      }
    }
    function defaultColorIndex(shape) {
      const entry = board.settings.defaults.find((item) => item.shape === shape);
      const level = levels.find((item) => item.value === entry?.value) || levels[0];
      return level ? level.color : 0;
    }

    // The quantity rides in a small corner tag at the shape's lower right, the way
    // the pattern previews show it; the artwork itself stays uncovered.
    function valueBadge(value, r) {
      const text = String(value), long = text.length > 3;
      const fontSize = long ? (r > 15 ? 8 : 7) : (r > 15 ? 9.5 : 8.5);
      const height = r > 15 ? 13 : 11;
      const width = Math.max(height + 3, text.length * fontSize * 0.62 + 8);
      const x = r + 4 - width / 2, y = r * 0.98 + 2 - height / 2;
      return h('g', { transform: `translate(${x} ${y})`, pointerEvents: 'none' },
        h('rect', { x: -width / 2, y: -height / 2, width, height, rx: height / 2 - 1.5, fill: '#FFFFFF', stroke: '#CBD5E1', strokeWidth: 1 }),
        h('text', { textAnchor: 'middle', y: fontSize * 0.36, fill: '#1E293B', fontSize, fontWeight: 700 }, text));
    }
    function renderObject(o) {
      const picked = selection.includes(o.id), moving = preview?.kind === 'move' && preview.ids.includes(o.id);
      const dx = moving ? preview.dx : 0, dy = moving ? preview.dy : 0, r = radius;
      const fill = paletteColor(o.color);
      const practiceNumber = props.practice ? practiceState.targets.indexOf(o.id) + 1 : 0;
      const label = `${practiceNumber ? `${t('practiceObject', { number: practiceNumber })} · ` : ''}${o.alias || t(o.shape)} · ${t('value')} ${o.value} · ${t(o.removed ? 'removed' : 'active')}${o.note ? ` · ${t('hasNote')}` : ''}`;
      const common = { fill, stroke: '#1E293B', strokeWidth: 1.2 };
      return h('g', { key: o.id, 'data-object': o.id, transform: `translate(${o.x + dx} ${o.y + dy})`, role: 'button', tabIndex: 0, 'aria-label': label, 'aria-pressed': picked, onKeyDown: (e) => objectKey(e, o) },
        h('title', null, label),
        props.practice && practiceState.targets.includes(o.id) && h('text', {
          x: -r, y: -r - 8, fill: '#2563EB', fontSize: 14, fontWeight: 700, pointerEvents: 'none',
        }, String(practiceState.targets.indexOf(o.id) + 1)),
        h('rect', { className: 'eb-focus-ring', x: -r - 6, y: -r - 6, width: r * 2 + 12, height: r * 2 + 12, rx: 8, fill: picked ? '#2563EB12' : 'transparent', stroke: picked ? controls.selection : 'transparent', strokeWidth: 2.5 }),
        h('g', { opacity: o.removed ? 0.35 : 1 },
          art.node(o.shape, r, common),
          valueBadge(o.value, r)),
        o.removed && h('path', { d: `M${-r - 4} 0h${r * 2 + 8}`, stroke: '#64748B', strokeWidth: 3, strokeDasharray: '4 2', pointerEvents: 'none' }),
        o.sources.length > 0 && h('g', { transform: `translate(${r * 0.72} ${-r * 0.72})`, pointerEvents: 'none' },
          h('circle', { r: 8, fill: '#1F2937', stroke: '#FFFFFF', strokeWidth: 1.5 }),
          h('text', { textAnchor: 'middle', y: 3, fill: '#FFFFFF', fontSize: 9, fontWeight: 700 }, o.sources.length)),
        o.note && !o.groupId && h('g', { transform: `translate(${-r - 3} ${-r - 3})`, pointerEvents: 'none' },
          h('path', { d: 'M0 0h13v8.5H5.5L2.5 12v-3.5H0Z', fill: '#FFFFFF', stroke: '#4CAF50', strokeWidth: 1.3 }),
          h('circle', { cx: 3, cy: 3.4, r: 0.8, fill: '#4CAF50' }),
          h('circle', { cx: 6.5, cy: 3.4, r: 0.8, fill: '#4CAF50' }),
          h('circle', { cx: 10, cy: 3.4, r: 0.8, fill: '#4CAF50' })),
        o.alias && (!dense || picked) && h('text', { textAnchor: 'middle', y: r + 16, fill: '#1E293B', fontSize: 11, pointerEvents: 'none', stroke: '#FFFFFF', strokeWidth: 3, paintOrder: 'stroke' }, [...o.alias].slice(0, 12).join('')));
    }
    function groupBoundary(g) {
      const members = board.objects.filter((o) => o.groupId === g.id);
      if (!members.length) return null;
      const moving = preview?.kind === 'move';
      const points = members.map((o) => ({ x: o.x + (moving && preview.ids.includes(o.id) ? preview.dx : 0), y: o.y + (moving && preview.ids.includes(o.id) ? preview.dy : 0) }));
      const first = points[0];
      return h('g', { key: g.id, pointerEvents: 'none' },
        h('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '), fill: 'none', stroke: '#CBD5E1', strokeWidth: 1.5, strokeDasharray: '4 4' }),
        points.map((p, i) => h('rect', { key: i, x: p.x - radius - 4, y: p.y - radius - 4, width: radius * 2 + 8, height: radius * 2 + 8, rx: 9, fill: 'none', stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '3 3' })),
        h('text', { x: Math.max(8, first.x - radius), y: Math.max(14, first.y - radius - 10), fill: '#64748B', fontSize: 10, stroke: '#FFFFFF', strokeWidth: 3, paintOrder: 'stroke' }, [...(g.alias || t('defaultGroup'))].slice(0, 18).join('')),
        g.note && h('g', { transform: `translate(${Math.max(8, first.x - radius + 86)} ${Math.max(3, first.y - radius - 22)})` },
          h('path', { d: 'M0 0h13v8.5H5.5L2.5 12v-3.5H0Z', fill: '#FFFFFF', stroke: '#4CAF50', strokeWidth: 1.3 }),
          h('circle', { cx: 4, cy: 3.4, r: 0.8, fill: '#4CAF50' }),
          h('circle', { cx: 7.5, cy: 3.4, r: 0.8, fill: '#4CAF50' })));
    }

    const canMerge = activeSelected.length >= 2;
    const canSplit = Boolean(single && single.value > 1 && !single.removed);
    const noteTarget = noteTargetFor(selected, completeGroup);
    const noteHasText = Boolean(noteText(noteTarget));
    const brand = brandMark(levels, 18);
    const topbar = h('header', { className: 'eb-topbar' }, brandMark(levels, 27), h('span', null, t('title')));
    const question = props.question || h('aside', { className: 'eb-question', 'aria-label': t('questionTeacher') },
      reference ? h('div', { id: `eb-question-${props.sessionId}`, className: `eb-question-text${questionExpanded ? '' : ' eb-collapsed'}` },
        props.renderFactorySlot?.('conversation.chat.reasoning.content', { text: reference.text, running: false }) ?? reference.text)
        : h('p', { className: 'eb-question-empty' }, t('questionEmpty')),
      reference && h('div', { className: 'eb-question-controls' },
        h('select', {
          'aria-label': t('questionSource'), title: t('questionSource'), value: reference.key,
          onChange: (event) => { setQuestionKey(event.target.value); setQuestionExpanded(false); },
        }, [...references].reverse().map((item) => h('option', { key: item.key, value: item.key },
          item.text.replace(/\s+/g, ' ').slice(0, 48)))),
        button(questionExpanded ? t('questionCollapse') : t('questionExpand'), () => setQuestionExpanded(!questionExpanded), {
          className: 'eb-question-toggle', 'aria-expanded': questionExpanded, 'aria-controls': `eb-question-${props.sessionId}`,
        })));
    const palette = h('aside', {
      className: 'eb-palette', 'aria-label': t('toolbox'), 'data-tour-id': 'quantity-palette',
    },
      visibleShapes.map((shape) => button(swatch(shape, creationLevel(shape).color, 32), () => add(shape), {
        className: 'eb-shape-tool', key: shape, draggable: true, disabled: board.objects.length >= 200,
        title: `${t(shape)} · ${t('value')} ${creationLevel(shape).value}`, 'aria-label': `${t(shape)} · ${t('value')} ${creationLevel(shape).value}`,
        onDragStart: () => setDragShape(shape), onDragEnd: () => setDragShape(null),
      })),
      button(icon('plus', 20), () => requestOverlay({ kind: 'library' }), {
        className: 'eb-shape-tool eb-shape-more', title: t('morePatterns'), 'aria-label': t('morePatterns'),
      }));
    const canvas = h('div', { className: 'eb-canvas-scroll', ref: canvasRef,
      onScroll: props.practice ? () => {
        const next = practiceRef.current.saveFrame(practiceFrame());
        if (next.persistence !== practiceProgress.persistence) setPracticeProgress(next);
      } : undefined },
      h('svg', {
        ref: svgRef, className: 'eb-artboard',
        // Quantity paper already fits the width; keep its growing height scrollable.
        style: fit ? { width: '100%', height: 'auto' } : { width: 800 * zoom, height: boardHeight * zoom },
        viewBox: `0 0 800 ${boardHeight}`, preserveAspectRatio: 'xMidYMid meet', role: 'group', 'aria-label': t('canvas'),
        onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: (event) => pointerEnd(event),
        onPointerCancel: (event) => pointerEnd(event, true), onLostPointerCapture: (event) => pointerEnd(event, true),
      },
      h('rect', { width: 800, height: boardHeight, fill: '#FFFFFF' }),
      board.groups.map(groupBoundary),
      board.objects.map(renderObject),
      !board.objects.length && h('g', { pointerEvents: 'none' },
        h('text', { x: 400, y: 190, textAnchor: 'middle', fill: '#64748B', fontSize: 17, fontWeight: 500 }, t('canvasEmpty')),
        h('text', { x: 400, y: 216, textAnchor: 'middle', fill: '#64748B', fontSize: 12 }, t('canvasEmptyHint'))),
      preview && preview.kind === 'lasso' && h('rect', {
        x: preview.x, y: preview.y, width: preview.w, height: preview.h,
        fill: '#2563EB18', stroke: controls.selection, strokeWidth: 1.5, pointerEvents: 'none',
      })));
    const selectionBar = selected.length > 0 && h('div', { className: 'eb-floating', role: 'toolbar', 'aria-label': t('selectionActions') },
      h('small', null, `${t('selectedCount')} ${selected.length}`),
      button(h(React.Fragment, null, icon('name', 16), h('span', { className: 'eb-label' }, t('alias'))), openName,
        { disabled: !completeGroup && !(single && !single.groupId), className: 'eb-context-action', title: t('alias') }),
      !completeGroup && button(h(React.Fragment, null, icon('group', 15), h('span', { className: 'eb-label' }, t('makeGroup'))), groupSelection,
        { disabled: board.groups.length - touchedGroups.length >= 12, title: t('makeGroup') }),
      completeGroup && button(h(React.Fragment, null, icon('ungroup', 15), h('span', { className: 'eb-label' }, t('ungroup'))), ungroup, { title: t('ungroup') }),
      canMerge && button(h(React.Fragment, null, icon('merge', 15), h('span', { className: 'eb-label' }, t('merge'))), mergeSelection,
        { disabled: !(mergeInfo && mergeInfo.allowed), title: mergeInfo && !mergeInfo.allowed ? mergeInfo.reason : t('merge') }),
      canSplit && button(h(React.Fragment, null, icon('split', 15), h('span', { className: 'eb-label' }, t('split'))), splitSelection, { title: t('split') }),
      button(h(React.Fragment, null, icon('copy', 15), h('span', { className: 'eb-label' }, t('copy'))), duplicate, { disabled: board.objects.length + selected.length > 200, title: t('copy') }),
      button(h(React.Fragment, null, icon('cross', 15), h('span', { className: 'eb-label' }, t('crossOut'))), crossOut,
        { disabled: !activeSelected.length, title: t('crossOut') }),
      button(h(React.Fragment, null, icon(append ? 'check' : 'multi', 15), h('span', { className: 'eb-label' }, append ? t('appendDone') : t('appendSelect'))),
        () => setAppend(!append), { 'aria-pressed': append, className: append ? 'eb-selected-mode' : '', title: append ? t('appendDone') : t('appendHint') }),
      toolButton('trash', removeSelected, { className: 'eb-icon-button eb-danger', title: t('trash') }));
    const stage = h('section', { className: 'eb-stage-wrap', 'aria-label': t('canvas') },
      question,
      h('div', {
        className: 'eb-stage-frame',
        onDragOver: (event) => { if (dragShape) event.preventDefault(); },
        onDrop: (event) => {
          if (!dragShape) return;
          event.preventDefault();
          add(dragShape, point(event));
          setDragShape(null);
        },
      }, canvas, selectionBar));
    const colorChoices = h('div', {
      className: 'eb-color-choices', role: 'group', 'aria-label': t('creationColor'), 'data-tour-id': 'quantity-color',
    },
      levels.map((level) => button(h(React.Fragment, null,
        h('span', { className: 'eb-color-dot', style: { background: paletteColor(level.color) } }),
        h('span', { className: 'eb-color-value' }, String(level.value))), () => {
        setToolValue(level.value);
      }, {
        key: level.value, 'aria-pressed': level.value === toolLevel.value, className: 'eb-color-button',
        title: `${t('creationColor')} · ${level.value}`, 'aria-label': `${t('creationColor')} · ${level.value}`,
      })));
    const moreMenuNode = moreOpen && h('div', { className: 'eb-menu eb-more-menu', role: 'menu', 'aria-label': t('files') },
      h('div', { className: 'eb-menu-head' }, t('files')),
      controls.menuItem(icon('open'), t('import'), openFile),
      controls.menuItem(icon('save'), t('export'), saveFile),
      picker.fileNameState && h('p', { className: 'eb-menu-note' }, picker.fileNameState),
      h('div', { className: 'eb-menu-line' }),
      h('label', { className: 'eb-menu-check' }, h('input', { type: 'checkbox', checked: attachTrace, onChange: (event) => setAttachTrace(event.target.checked) }), h('span', null, t('traceAttach'))),
      !props.practice && shared.createQuantityPractice && h(React.Fragment, null,
        h('div', { className: 'eb-menu-line' }),
        controls.menuItem(null, t('tutorialReplay'), () => startQuantityTour())));
    // One dock for both tabs, in this order. This tab keeps creation colours and the
    // trace checkbox; the geometry tab keeps grid and snap in that same slot.
    const dock = h('nav', { className: 'eb-dock', 'aria-label': t('canvasTools') },
      controls.backButton(close, { icon }),
      controls.divider(),
      toolButton('undo', undo, { disabled: !history.past.length }),
      toolButton('redo', redo, { disabled: !history.future.length, className: 'eb-icon-button eb-redo', title: t('redo') }),
      controls.divider(),
      colorChoices,
      controls.divider(),
      button('−', () => { setFit(false); setZoom(Math.max(0.75, zoom - 0.25)); }, { className: 'eb-zoom-button eb-zoom-out', 'aria-label': t('zoomOut'), title: t('zoomOut') }),
      button(fit ? t('fitView') : `${Math.round(zoom * 100)}%`, () => setFit(!fit), { className: 'eb-zoom-label', 'aria-label': t('fitView'), 'aria-pressed': fit, title: t('fitView') }),
      button('＋', () => { setFit(false); setZoom(Math.min(2, zoom + 0.25)); }, { className: 'eb-zoom-button eb-zoom-in', 'aria-label': t('zoomIn'), title: t('zoomIn') }),
      h('span', { className: 'eb-grow' }),
      button(h(React.Fragment, null, icon('note', 19), noteHasText ? h('span', { className: 'eb-note-dot' }) : null), openNote, {
        className: `eb-note-button${noteTarget ? ' eb-contextual' : ''}`, title: noteTarget ? `${t('note')} · ${noteTarget.label}` : `${t('note')} · ${t('noteGeneral')}`,
        'aria-label': noteTarget ? `${t('note')} · ${noteTarget.label}` : `${t('note')} · ${t('noteGeneral')}`,
        'data-tour-id': 'quantity-note',
      }),
      button(icon('clear', 19), () => requestOverlay({ kind: 'clear' }), { className: 'eb-icon-button eb-danger', title: t('clear'), 'aria-label': t('clear') }),
      controls.moreMenu(moreOpen, () => setMoreOpen(!moreOpen), icon('more', 19)),
      button(h(React.Fragment, null, icon('insert', 17), h('span', null, t('insert'))), insert, {
        className: 'eb-primary', title: t('insert'), 'data-tour-id': 'quantity-insert',
        disabled: (!board.objects.length && !board.note && !(attachTrace && trace.totalChanges)) || phase !== 'plain' }));
    const overlayNode = overlay && h('div', { className: 'eb-overlay', onPointerDown: (event) => { if (event.target === event.currentTarget) dismissOverlay(); } },
      h('div', {
        className: `eb-overlay-card eb-overlay-${overlay.kind}`, role: 'dialog', 'aria-modal': 'true',
        'aria-label': overlay.kind === 'note' ? t('note') : overlay.kind === 'name' ? t('alias') : overlay.kind === 'library' ? t('morePatterns') : t('clear'),
        'data-tour-id': overlay.kind === 'note' ? 'quantity-note-panel' : undefined,
      },
        overlay.kind === 'name' && h(React.Fragment, null,
          h('h2', null, overlay.group ? t('groupAlias') : t('alias')),
          h('input', { ref: nameRef, onChange: touchDraft, type: 'text', maxLength: 30, defaultValue: overlay.value, placeholder: overlay.group ? t('groupHint') : t('aliasHint'),
            onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); applyName(); } } }),
          h('div', { className: 'eb-overlay-actions' },
            button(t('cancel'), dismissOverlay),
            button(t('apply'), applyName, { className: 'eb-primary' }))),
        overlay.kind === 'note' && h(React.Fragment, null,
          h('h2', null, t('note')),
          h('p', { className: 'eb-overlay-context' }, overlay.target ? `${t('noteAbout')} ${overlay.label}` : t('noteGeneral')),
          h('textarea', { ref: noteRef, onChange: touchDraft, maxLength: 500, defaultValue: overlay.value, placeholder: t('noteHint') }),
          h('div', { className: 'eb-overlay-actions' },
            button(t('cancel'), dismissOverlay),
            button(t('save'), applyNote, { className: 'eb-primary' }))),
        overlay.kind === 'library' && h(React.Fragment, null,
          h('h2', null, t('morePatterns')),
          h('p', { className: 'eb-muted' }, t('patternsHint')),
          h('div', { className: 'eb-library-grid' }, M.shapes.map((shape) => {
            const on = visibleShapes.includes(shape);
            return button(h(React.Fragment, null, swatch(shape, defaultColorIndex(shape), 28), h('span', null, t(shape))), () => togglePattern(shape), {
              key: shape, className: 'eb-library-tile', 'aria-pressed': on, 'aria-label': `${on ? t('removePattern') : t('addPattern')}: ${t(shape)}`,
              title: `${on ? t('removePattern') : t('addPattern')}: ${t(shape)}`, disabled: on && visibleShapes.length === 1,
            });
          })),
          h('div', { className: 'eb-overlay-actions' }, button(t('done'), dismissOverlay, { className: 'eb-primary' }))),
        overlay.kind === 'clear' && h(React.Fragment, null,
          h('h2', null, t('clear')),
          h('p', { className: 'eb-muted' }, t('clearQuestion')),
          h('div', { className: 'eb-overlay-actions' },
            button(t('cancel'), dismissOverlay),
            button(t('confirmClear'), confirmClearBoard, { className: 'eb-primary eb-danger-solid' })))));
    const statusNode = controls.status(status);
    const practiceCoach = props.practice && h('section', {
      className: 'eb-practice-coach', 'aria-label': t('practiceTitle'), 'data-practice-step': practiceState.step,
    },
      h('div', { role: 'status', 'aria-live': 'polite' },
        h('strong', null, t(practiceProgress?.chapters.find((chapter) => chapter.id === practiceProgress.current)?.status === 'completed' ? 'practiceComplete' : 'practiceTitle')),
        h('p', null, t(practiceState.completed && practiceProgress?.chapters.find((chapter) => chapter.id === practiceProgress.current)?.status !== 'completed'
          ? 'practiceSkippedEnd' : `practiceGoal_${practiceState.step}`)),
        PracticeNavigation && practiceProgress?.goal && h(PracticeNavigation, { progress: practiceProgress, chapters: practiceChapters, onNavigate: navigatePractice }),
        practiceState.targets.some((id) => !board.objects.some((o) => o.id === id))
          && h('p', { role: 'alert' }, t('practiceTargetMissing')),
        !practiceState.completed && h('small', null, t('tutorialProgress', { step: practiceState.index + 1, total: practiceState.total }))),
      button(t('practiceExit'), () => props.onPracticeExit(), { className: 'eb-practice-exit' }));
    const editor = h(React.Fragment, null,
      h('input', { hidden: true, type: 'file', accept: '.json,application/json', ref: picker.fileInputRef, onChange: importInput }),
      h('a', { hidden: true, ref: picker.downloadAnchorRef, download: t('attachmentName') }));
    // Two tabs share one dialog: the shell owns the launcher, the dialog and the tab
    // bar, so this page contributes its workspace only. A single-tab board keeps the
    // tree it always had, including its own launcher and dialog.
    if (props.split) {
      // The shell owns the launcher, the dialog and the top bar, including the brand mark,
      // so this page only contributes its workspace.
      return h(React.Fragment, null,
        h('div', { className: 'eb-quantity-owner', hidden: practiceOpen },
          practiceCoach,
          h('div', { className: 'eb-workspace', ref: workspaceRef },
            palette, stage, dock, moreMenuNode, statusNode, overlayNode),
          !props.practice && editor),
        practiceOpen && h(PracticeBoard, {
          ...props, practice: true, bindClose: props.bindClose,
          onPracticeExit: () => setPracticeOpen(false),
        }));
    }
    return h(React.Fragment, null,
      h('style', null, css),
      h('button', {
        type: 'button', className: 'edu-board-launch', title: t('title'),
        'aria-label': t('title'), 'aria-haspopup': 'dialog',
        disabled: !ready, onClick: () => setOpened(true),
      },
      brand,
      h('span', null, t('title'))),
      h('dialog', {
        ref: dialog, className: 'eb-dialog', 'aria-label': t('title'),
        onCancel: (event) => {
          event.preventDefault();
          if (practiceOpen) setPracticeOpen(false);
          else if (overlay) dismissOverlay();
          else if (moreOpen) { setMoreOpen(false); }
          else if (append) setAppend(false);
          else if (gesture.current) { gesture.current = null; setPreview(null); }
        },
        onClose: () => setOpened(false),
      },
      h('div', { className: 'eb-workbench' },
        topbar,
        h('div', { className: 'eb-quantity-owner', hidden: practiceOpen },
          h('div', { className: 'eb-workspace', ref: workspaceRef },
            palette, stage, dock, moreMenuNode, statusNode, overlayNode)),
        practiceOpen && h(PracticeBoard, { ...props, split: true, tabActive: opened,
          practice: true, close: () => setOpened(false), onPracticeExit: () => setPracticeOpen(false) })),
        editor));
  };
  // The shell draws the shared launcher and top bar before this page mounts, so it
  // needs the mark without a live board. The default levels give the same colours the
  // page paints; a student who changed the levels still sees the page's own header.
  // Distinct component type = independent hooks, refs, history and picker memory.
  // Its lifetime ends at exit; asynchronous callbacks cannot target the real owner.
  function PracticeBoard(props) { return Board(props); }
  function BoardMark(size = 18) { return brandMark(M.defaultSettings().levels, size); }
  Board.Mark = BoardMark;
  return Board;
}
