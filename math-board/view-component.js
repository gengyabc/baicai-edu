// Workspace-first expression board UI. Embedded into client.js by build.mjs.
import { composerNote } from './view.js';
import { boardQuestionReferences } from './question-reference.js';

export function createBoardView(React, M, ctx, t, css, art, applyHostConfig, T) {
  const h = React.createElement;
  const paletteColor = (index) => M.color(index);
  const DB_NAME = 'dsh-edu-math-board';
  const DB_STORE = 'files';
  const DB_LAST = 'last-board-file';
  const JSON_TYPES = [{ description: 'JSON', accept: { 'application/json': ['.json'] } }];
  function openFileDb() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('unsupported'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function readRememberedHandle() {
    const db = await openFileDb();
    try {
      return await new Promise((resolve, reject) => {
        const request = db.transaction(DB_STORE, 'readonly').objectStore(DB_STORE).get(DB_LAST);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
  }
  async function rememberHandle(handle) {
    const db = await openFileDb();
    try {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(DB_STORE, 'readwrite');
        transaction.objectStore(DB_STORE).put(handle, DB_LAST);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally { db.close(); }
  }
  async function allowHandle(handle, mode) {
    try {
      const options = { mode };
      if (await handle.queryPermission(options) === 'granted') return true;
      return await handle.requestPermission(options) === 'granted';
    } catch { return false; }
  }
  const sameIds = (a, b) => a.length === b.length && a.every((id, index) => id === b[index]);
  const sorted = (ids) => [...ids].sort();
  function icon(name, size = 18) {
    const paths = {
      undo: 'M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12',
      redo: 'm15 5 5 5-5 5m5-5h-9a6 6 0 0 0 0 12',
      back: 'M19 12H5m6-6-6 6 6 6',
      note: 'M20 11a8 8 0 0 1-8 8H7l-5 3V11a9 9 0 0 1 18 0ZM7 10h8M7 14h5',
      group: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8z',
      ungroup: 'M3 3h5v5H3zM16 16h5v5h-5zM3 16h5v5H3zM16 3h5v5h-5z',
      copy: 'M9 9h12v12H9zM15 9V3H3v12h6',
      merge: 'M4 18 10 12M4 12h6v6M20 6l-6 6M14 12h6V6',
      split: 'M10 4 4 10M4 4h6v6M14 20l6-6M20 20h-6v-6',
      cross: 'M4 12h16',
      name: 'm4 16 11-11 4 4L8 20H4Zm9-9 4 4',
      trash: 'M4 6h16M9 6V3h6v3M7 6l1 15h8l1-15',
      clear: 'm18 3-7 9m-3-2 7 4-4 7H3l2-10 3-1Zm-1 6-2 5m6-3-2 3M2 21h13',
      multi: 'M3 3h8v8H3zM13 13h8v8h-8zM17 3v8M13 7h8',
      check: 'm5 12 4 4L19 6',
      plus: 'M12 5v14M5 12h14',
      minus: 'M5 12h14',
      more: 'M5 12h.01M12 12h.01M19 12h.01',
      open: 'M3 7h6l2 3h10l-3 10H3ZM3 7V4h6l2 3h8v3',
      save: 'M4 3h13l3 3v15H4ZM8 3v6h8V3M8 21v-7h8v7',
      insert: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
      library: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
    };
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] || paths.group }));
  }
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

  return function Board(props) {
    React.useSyncExternalStore((fn) => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot());
    const key = `dsh-edu-math-board:v4:${props.sessionId}`;
    const legacyKey = `dsh-edu-math-board:v2:${props.sessionId}`;
    const oldKey = `dsh-edu-math-board:v3:${props.sessionId}`;
    const watermarkKey = `${key}:config`;
    // One atomic local envelope pairs the reset watermark with the surviving
    // draft. Never persist a reset marker separately from its canvas.
    const clearKey = `${key}:clear-v1`;
    const clearMark = React.useRef({ revision: 0, requestId: null });
    const lastEditAt = React.useRef(0);
    const clearRequest = props.useProjection('eduBoardClear');
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
    const [fileName, setFileName] = React.useState('');
    const [dragShape, setDragShape] = React.useState(null);
    const toolLevel = board.settings.levels.find((level) => level.value === toolValue)
      || board.settings.levels.find((level) => level.value === 1) || board.settings.levels[0];
    const config = props.useProjection('eduBoardConfig');
    const watermark = React.useRef(-1);
    const pendingWatermark = React.useRef(null);
    const dialog = React.useRef(null), fileInput = React.useRef(null), downloadAnchor = React.useRef(null);
    const url = React.useRef(null), gesture = React.useRef(null), revision = React.useRef(0);
    const svgRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const revealRef = React.useRef([]);
    const nameRef = React.useRef(null), noteRef = React.useRef(null);
    const fileHandle = React.useRef(null);
    const fileInputRevision = React.useRef(null);
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
    // not its identity, so settled responses and visibility changes update us.
    const referenceJson = props.useChat?.((chat) => JSON.stringify(boardQuestionReferences(chat))) || '[]';
    const references = JSON.parse(referenceJson);
    const [questionKey, setQuestionKey] = React.useState(null);
    const reference = references.find((item) => item.key === questionKey) || references.at(-1);
    React.useEffect(() => { setQuestionExpanded(false); }, [reference?.key]);

    React.useEffect(() => {
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
      return () => { revision.current++; gesture.current = null; if (url.current) URL.revokeObjectURL(url.current); };
    }, [key]);

    React.useEffect(() => {
      if (!ready || storageBlocked) return;
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
    React.useEffect(() => {
      let live = true;
      readRememberedHandle().then((handle) => {
        if (!live || !handle) return;
        fileHandle.current = handle; setFileName(handle.name || '');
      }).catch(() => {});
      return () => { live = false; };
    }, []);
    React.useEffect(() => {
      if (!status || [t('autoClearError'), t('autoClearSkipped'), t('autoClearDone')].includes(status)) return;
      const timer = setTimeout(() => setStatus(''), 5200);
      return () => clearTimeout(timer);
    }, [status]);
    React.useEffect(() => {
      if (!opened) return;
      const closeMenus = (event) => {
        if (!event.target.closest?.('.eb-menu, .eb-menu-trigger')) { setMoreOpen(false); }
      };
      document.addEventListener('pointerdown', closeMenus);
      return () => document.removeEventListener('pointerdown', closeMenus);
    }, [opened]);
    React.useEffect(() => {
      if (!overlay) return;
      const node = overlay.kind === 'note' ? noteRef.current : nameRef.current;
      if (node) { node.focus(); if (node.select) node.select(); }
    }, [overlay]);
    React.useEffect(() => {
      if (!opened) return;
      const onKey = (event) => {
        if (event.key !== 'Escape') return;
        if (overlay) { event.preventDefault(); setOverlay(null); }
        if (moreOpen) { setMoreOpen(false); }
        if (append) setAppend(false);
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [opened, overlay, moreOpen]);

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
      revision.current++; gesture.current = null; setPreview(null);
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
    function selectIds(ids) { setSelection(ids); }
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
    function button(label, handler, extra = {}) { return h('button', { type: 'button', onClick: handler, ...extra }, label); }
    function toolButton(name, handler, extra = {}) { return button(icon(name), handler, { title: t(name), 'aria-label': t(name), className: 'eb-icon-button', ...extra }); }
    function labelled(name, text, handler, extra = {}) {
      const label = extra.title ?? text;
      return button(h(React.Fragment, null, icon(name, 16), h('span', { className: 'eb-label' }, text)), handler,
        { ...extra, title: label, 'aria-label': label });
    }

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
      createAndReveal({ type: 'add', shape, value: creationLevel(shape).value, ...extra });
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
          selectIds(ids); return;
        }
        if (!ids.includes(objectId)) ids = whole;
        selectIds(ids);
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
      if (g.kind === 'move' && g.moved) action({ type: 'moveMany', ids: g.ids, dx: g.dx || 0, dy: g.dy || 0 });
      if (g.kind === 'lasso') {
        if (!g.moved) { selectIds([]); return; }
        const p = g.current, x1 = Math.min(p.x, g.start.x), x2 = Math.max(p.x, g.start.x), y1 = Math.min(p.y, g.start.y), y2 = Math.max(p.y, g.start.y);
        const hit = g.base.objects.filter((o) => o.x + radius >= x1 && o.x - radius <= x2 && o.y + radius >= y1 && o.y - radius <= y2).map((o) => o.id);
        selectIds([...new Set([...g.initial, ...hit])]);
      }
    }
    function objectKey(e, o) {
      const arrows = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectIds(e.shiftKey || append
          ? (selection.includes(o.id) ? selection.filter((id) => id !== o.id) : [...selection, o.id])
          : expandGroup([o.id]));
      } else if (arrows[e.key]) {
        e.preventDefault(); const [dx, dy] = arrows[e.key];
        action({ type: 'moveMany', ids: selection.includes(o.id) ? selection : [o.id], dx, dy });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault(); batch((selection.includes(o.id) ? selection : [o.id]).map((id) => ({ type: 'delete', id }))); selectIds([]);
      }
    }
    function close() {
      flushEditor(); gesture.current = null; setPreview(null); setOverlay(null);
      setMoreOpen(false); setAppend(false); setOpened(false);
      // Persistent task notices are acknowledged once the student has seen them.
      if ([t('autoClearError'), t('autoClearSkipped'), t('autoClearDone')].includes(status)) setStatus('');
    }
    function recoverDraft(next, nextTrace, message) {
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
      flushEditor();
      const text = M.serialize(boardRef.current);
      if (typeof window !== 'undefined' && window.showSaveFilePicker) {
        try {
          let handle = fileHandle.current;
          if (handle && await allowHandle(handle, 'readwrite')) {
            const writable = await handle.createWritable();
            await writable.write(text); await writable.close();
            setStatus(t('fileSaved')); return;
          }
          handle = await window.showSaveFilePicker({ suggestedName: t('attachmentName'), types: JSON_TYPES });
          const writable = await handle.createWritable();
          await writable.write(text); await writable.close();
          fileHandle.current = handle; setFileName(handle.name || '');
          try { await rememberHandle(handle); } catch { /* remembering is best effort */ }
          setStatus(t('fileSaved')); return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
          // A browser that exposes the API can still refuse it (permissions, embedded view).
        }
      }
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      downloadAnchor.current.href = url.current; downloadAnchor.current.click();
      setStatus(t('fileDownloaded'));
    }
    async function loadOpenedFile(file, rev) {
      if (rev !== revision.current) return;
      gesture.current = null; setPreview(null);
      if (file.size > 262144) throw Error(t('fileTooLarge'));
      const next = M.validate(JSON.parse(await file.text()));
      if (rev !== revision.current) return;
      if (storageBlocked) { recoverDraft(next, T.empty(true), 'imported'); return; }
      if (!canEdit()) return;
      commit(next, { type: 'import' }); selectIds([]); setAppend(false); setStatus(t('imported'));
    }
    async function openFile() {
      flushEditor();
      const rev = ++revision.current;
      if (typeof window !== 'undefined' && window.showOpenFilePicker) {
        try {
          const options = { multiple: false, types: JSON_TYPES };
          if (fileHandle.current) options.startIn = fileHandle.current;
          let handles;
          try { handles = await window.showOpenFilePicker(options); }
          catch (error) {
            if (error?.name === 'TypeError' && options.startIn) { delete options.startIn; handles = await window.showOpenFilePicker(options); }
            else throw error;
          }
          const handle = handles?.[0]; if (!handle || rev !== revision.current) return;
          const file = await handle.getFile();
          if (rev !== revision.current) return;
          await loadOpenedFile(file, rev);
          fileHandle.current = handle; setFileName(handle.name || '');
          try { await rememberHandle(handle); } catch { /* remembering is best effort */ }
          setMoreOpen(false);
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
          if (!['NotAllowedError', 'SecurityError', 'NotSupportedError'].includes(error?.name)) {
            setStatus(`${t('failed')}: ${error.message}`);
            return;
          }
          // Permission denial must not prevent opening an ordinary local file.
        }
      }
      if (rev !== revision.current) return;
      fileInputRevision.current = rev;
      setStatus(t('fileOpenFallback'));
      fileInput.current.click();
    }
    async function importInput(event) {
      const rev = fileInputRevision.current;
      fileInputRevision.current = null;
      const file = event.target.files?.[0]; event.target.value = ''; if (!file || rev === null) return;
      try { await loadOpenedFile(file, rev); } catch (error) { setStatus(`${t('failed')}: ${error.message}`); }
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
      setOverlay({ kind: 'note', target, value: noteText(target), label: target ? target.label : t('noteGeneral') });
    }
    function openName() {
      if (completeGroup) setOverlay({ kind: 'name', group: completeGroup, value: completeGroup.alias });
      else if (single && !single.groupId) setOverlay({ kind: 'name', object: single, value: single.alias });
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
      const label = `${o.alias || t(o.shape)} · ${t('value')} ${o.value} · ${t(o.removed ? 'removed' : 'active')}${o.note ? ` · ${t('hasNote')}` : ''}`;
      const common = { fill, stroke: '#1E293B', strokeWidth: 1.2 };
      return h('g', { key: o.id, 'data-object': o.id, transform: `translate(${o.x + dx} ${o.y + dy})`, role: 'button', tabIndex: 0, 'aria-label': label, 'aria-pressed': picked, onKeyDown: (e) => objectKey(e, o) },
        h('title', null, label),
        h('rect', { className: 'eb-focus-ring', x: -r - 6, y: -r - 6, width: r * 2 + 12, height: r * 2 + 12, rx: 8, fill: picked ? '#2563EB12' : 'transparent', stroke: picked ? '#2563EB' : 'transparent', strokeWidth: 2.5 }),
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
    const palette = h('aside', { className: 'eb-palette', 'aria-label': t('toolbox') },
      visibleShapes.map((shape) => button(swatch(shape, creationLevel(shape).color, 32), () => add(shape), {
        className: 'eb-shape-tool', key: shape, draggable: true, disabled: board.objects.length >= 200,
        title: `${t(shape)} · ${t('value')} ${creationLevel(shape).value}`, 'aria-label': `${t(shape)} · ${t('value')} ${creationLevel(shape).value}`,
        onDragStart: () => setDragShape(shape), onDragEnd: () => setDragShape(null),
      })),
      button(icon('plus', 20), () => setOverlay({ kind: 'library' }), {
        className: 'eb-shape-tool eb-shape-more', title: t('morePatterns'), 'aria-label': t('morePatterns'),
      }));
    const canvas = h('div', { className: 'eb-canvas-scroll', ref: canvasRef },
      h('svg', {
        ref: svgRef, className: 'eb-artboard',
        style: { width: fit ? '100%' : 800 * zoom, height: fit ? 'auto' : boardHeight * zoom },
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
        fill: '#2563EB18', stroke: '#2563EB', strokeWidth: 1.5, pointerEvents: 'none',
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
    const colorChoices = h('div', { className: 'eb-color-choices', role: 'group', 'aria-label': t('creationColor') },
      levels.map((level) => button(h(React.Fragment, null,
        h('span', { className: 'eb-color-dot', style: { background: paletteColor(level.color) } }),
        h('span', { className: 'eb-color-value' }, String(level.value))), () => { setToolValue(level.value); }, {
        key: level.value, 'aria-pressed': level.value === toolLevel.value, className: 'eb-color-button',
        title: `${t('creationColor')} · ${level.value}`, 'aria-label': `${t('creationColor')} · ${level.value}`,
      })));
    const moreMenuNode = moreOpen && h('div', { className: 'eb-menu eb-more-menu', role: 'menu', 'aria-label': t('files') },
      h('div', { className: 'eb-menu-head' }, t('files')),
      button(h(React.Fragment, null, icon('open', 16), h('span', null, t('import'))), openFile, { role: 'menuitem' }),
      button(h(React.Fragment, null, icon('save', 16), h('span', null, t('export'))), saveFile, { role: 'menuitem' }),
      fileName && h('p', { className: 'eb-menu-note' }, fileName),
      h('div', { className: 'eb-menu-line' }),
      h('label', { className: 'eb-menu-check' }, h('input', { type: 'checkbox', checked: attachTrace, onChange: (event) => setAttachTrace(event.target.checked) }), h('span', null, t('traceAttach'))));
    const dock = h('nav', { className: 'eb-dock', 'aria-label': t('canvasTools') },
      labelled('back', t('backToChat'), close, { className: 'eb-dock-return' }),
      h('span', { className: 'eb-divider' }),
      toolButton('undo', undo, { disabled: !history.past.length }),
      toolButton('redo', redo, { disabled: !history.future.length, className: 'eb-icon-button eb-redo', title: t('redo') }),
      h('span', { className: 'eb-divider' }),
      colorChoices,
      h('span', { className: 'eb-divider' }),
      button('−', () => { setFit(false); setZoom(Math.max(0.75, zoom - 0.25)); }, { className: 'eb-zoom-button eb-zoom-out', 'aria-label': t('zoomOut'), title: t('zoomOut') }),
      button(fit ? t('fitView') : `${Math.round(zoom * 100)}%`, () => setFit(!fit), { className: 'eb-zoom-label', 'aria-label': t('fitView'), 'aria-pressed': fit, title: t('fitView') }),
      button('＋', () => { setFit(false); setZoom(Math.min(2, zoom + 0.25)); }, { className: 'eb-zoom-button eb-zoom-in', 'aria-label': t('zoomIn'), title: t('zoomIn') }),
      h('span', { className: 'eb-grow' }),
      button(h(React.Fragment, null, icon('note', 19), noteHasText ? h('span', { className: 'eb-note-dot' }) : null), openNote, {
        className: `eb-note-button${noteTarget ? ' eb-contextual' : ''}`, title: noteTarget ? `${t('note')} · ${noteTarget.label}` : `${t('note')} · ${t('noteGeneral')}`,
        'aria-label': noteTarget ? `${t('note')} · ${noteTarget.label}` : `${t('note')} · ${t('noteGeneral')}`,
      }),
      button(icon('clear', 19), () => setOverlay({ kind: 'clear' }), { className: 'eb-icon-button eb-danger', title: t('clear'), 'aria-label': t('clear') }),
      button(icon('more', 19), () => { setMoreOpen(!moreOpen); }, { className: 'eb-icon-button eb-menu-trigger', title: t('moreActions'), 'aria-label': t('moreActions'), 'aria-expanded': moreOpen }),
      button(h(React.Fragment, null, icon('insert', 17), h('span', null, t('insert'))), insert, {
        className: 'eb-primary', title: t('insert'), disabled: (!board.objects.length && !board.note && !(attachTrace && trace.totalChanges)) || phase !== 'plain' }));
    const overlayNode = overlay && h('div', { className: 'eb-overlay', onPointerDown: (event) => { if (event.target === event.currentTarget) setOverlay(null); } },
      h('div', { className: `eb-overlay-card eb-overlay-${overlay.kind}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': overlay.kind === 'note' ? t('note') : overlay.kind === 'name' ? t('alias') : overlay.kind === 'library' ? t('morePatterns') : t('clear') },
        overlay.kind === 'name' && h(React.Fragment, null,
          h('h2', null, overlay.group ? t('groupAlias') : t('alias')),
          h('input', { ref: nameRef, onChange: touchDraft, type: 'text', maxLength: 30, defaultValue: overlay.value, placeholder: overlay.group ? t('groupHint') : t('aliasHint'),
            onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); applyName(); } } }),
          h('div', { className: 'eb-overlay-actions' },
            button(t('cancel'), () => setOverlay(null)),
            button(t('apply'), applyName, { className: 'eb-primary' }))),
        overlay.kind === 'note' && h(React.Fragment, null,
          h('h2', null, t('note')),
          h('p', { className: 'eb-overlay-context' }, overlay.target ? `${t('noteAbout')} ${overlay.label}` : t('noteGeneral')),
          h('textarea', { ref: noteRef, onChange: touchDraft, maxLength: 500, defaultValue: overlay.value, placeholder: t('noteHint') }),
          h('div', { className: 'eb-overlay-actions' },
            button(t('cancel'), () => setOverlay(null)),
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
          h('div', { className: 'eb-overlay-actions' }, button(t('done'), () => setOverlay(null), { className: 'eb-primary' }))),
        overlay.kind === 'clear' && h(React.Fragment, null,
          h('h2', null, t('clear')),
          h('p', { className: 'eb-muted' }, t('clearQuestion')),
          h('div', { className: 'eb-overlay-actions' },
            button(t('cancel'), () => setOverlay(null)),
            button(t('confirmClear'), confirmClearBoard, { className: 'eb-primary eb-danger-solid' })))));
    React.useEffect(() => { if (props.split) props.onReady?.(); }, [props.split]);
    const statusNode = status && h('div', { className: 'eb-status-toast', role: 'status', 'aria-live': 'polite' }, status);
    const editor = h(React.Fragment, null,
      h('input', { hidden: true, type: 'file', accept: '.json,application/json', ref: fileInput, onChange: importInput }),
      h('a', { hidden: true, ref: downloadAnchor, download: t('attachmentName') }));
    // Two tabs share one dialog: the shell owns the launcher, the dialog and the tab
    // bar, so this page contributes its workspace only. A single-tab board keeps the
    // tree it always had, including its own launcher and dialog.
    if (props.split) {
      return h(React.Fragment, null,
        h('div', { className: 'eb-workspace' },
          palette,
          stage,
          dock,
          moreMenuNode,
          statusNode,
          overlayNode),
        editor);
    }
    return h(React.Fragment, null,
      h('style', null, css),
      h('button', {
        type: 'button', className: 'edu-board-launch', title: t('title'),
        'aria-label': t('title'), 'aria-haspopup': 'dialog',
        disabled: !ready, onClick: () => setOpened(true),
      },
      brandMark(levels, 18),
      h('span', null, t('title'))),
      h('dialog', {
        ref: dialog, className: 'eb-dialog', 'aria-label': t('title'),
        onCancel: (event) => {
          event.preventDefault();
          if (overlay) setOverlay(null);
          else if (moreOpen) { setMoreOpen(false); }
          else close();
        },
        onClose: () => setOpened(false),
      },
      h('div', { className: 'eb-workbench' },
        topbar,
        h('div', { className: 'eb-workspace' },
          palette,
          stage,
          dock,
          moreMenuNode,
          statusNode,
          overlayNode)),
        editor));
  };
}
