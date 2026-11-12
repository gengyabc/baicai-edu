// Geometry tab: a draw-only canvas with points, segments, polygons, circles, parallelograms
// and rectangles. Embedded into client.js by build.mjs. Nothing here reads the quantity
// board: no patterns, no values, no shared storage key, no shared undo history.
export function createGeometryPage(React, G, ctx, t) {
  const h = React.createElement;
  const STORAGE_PREFIX = 'dsh-edu-math-board:geometry:v1:';
  const HISTORY_LIMIT = 40;
  const SNAP_RADIUS = 12;
  const TOOLS = ['select', 'point', 'segment', 'polygon', 'circle', 'parallelogram', 'rectangle', 'midpoint'];
  const ICONS = {
    select: 'M5 3l14 8-6 1.5L11 19z',
    point: 'M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8',
    segment: 'M5 19 19 5',
    polygon: 'M12 3 21 9.5 18 20H6L3 9.5z',
    circle: 'M12 4a8 8 0 1 1 0 16a8 8 0 1 1 0-16',
    parallelogram: 'M3 18 8 6h13l-5 12z',
    rectangle: 'M4 6h16v12H4z',
    midpoint: 'M3 12h18M8 8v8M16 8v8',
    undo: 'M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12',
    redo: 'm15 5 5 5-5 5m5-5h-9a6 6 0 0 0 0 12',
    note: 'M20 11a8 8 0 0 1-8 8H7l-5 3V11a9 9 0 0 1 18 0ZM7 10h8M7 14h5',
    trash: 'M4 6h16M9 6V3h6v3M7 6l1 15h8l1-15',
    clear: 'm18 3-7 9m-3-2 7 4-4 7H3l2-10 3-1Zm-1 6-2 5m6-3-2 3M2 21h13',
  };
  const icon = (name, size = 20) => h('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  }, h('path', { d: ICONS[name] || ICONS.select }));

  return function GeometryPage(props) {
    const key = `${STORAGE_PREFIX}${props.sessionId}`;
    const [ready, setReady] = React.useState(false);
    const [board, setBoard] = React.useState(G.empty);
    const boardRef = React.useRef(board);
    const [history, setHistory] = React.useState({ past: [], future: [] });
    const [tool, setTool] = React.useState('select');
    const [auxiliary, setAuxiliary] = React.useState(false);
    const [pending, setPending] = React.useState([]);
    const [selection, setSelection] = React.useState([]);
    const [append, setAppend] = React.useState(false);
    const [hover, setHover] = React.useState(null);
    const [preview, setPreview] = React.useState(null);
    const [zoom, setZoom] = React.useState(1);
    const [fit, setFit] = React.useState(true);
    const [grid, setGrid] = React.useState(false);
    const [snap, setSnap] = React.useState(true);
    const [status, setStatus] = React.useState('');
    const [overlay, setOverlay] = React.useState(null);
    const [rename, setRename] = React.useState(null);
    const gesture = React.useRef(null);
    const svgRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const noteRef = React.useRef(null), nameRef = React.useRef(null);
    const revision = React.useRef(0);
    const phase = props.useInput((s) => s.phase);
    const width = G.bounds.width, height = G.bounds.height;

    React.useEffect(() => {
      revision.current++;
      try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved !== null) { const next = G.validate(saved); boardRef.current = next; setBoard(next); }
      } catch { setStatus(t('geometryLoadError')); }
      setReady(true);
      return () => { revision.current++; gesture.current = null; };
    }, [key]);
    React.useEffect(() => {
      if (!ready) return;
      try { localStorage.setItem(key, JSON.stringify(board)); } catch { setStatus(t('storageError')); }
    }, [board, ready, key]);
    React.useEffect(() => {
      if (!status) return undefined;
      const timer = setTimeout(() => setStatus(''), 5200);
      return () => clearTimeout(timer);
    }, [status]);
    React.useEffect(() => {
      if (rename) { const node = nameRef.current; node?.focus(); node?.select?.(); }
    }, [rename]);
    React.useEffect(() => {
      if (overlay?.kind === 'note') noteRef.current?.focus();
    }, [overlay]);

    function publish(next) { boardRef.current = next; setBoard(next); }
    function action(a) {
      if (!ready) return null;
      try {
        const next = G.reduce(boardRef.current, a);
        if (JSON.stringify(next) !== JSON.stringify(boardRef.current)) {
          revision.current++;
          setHistory((old) => ({ past: [...old.past, boardRef.current].slice(-HISTORY_LIMIT), future: [] }));
          publish(next);
        }
        return next;
      } catch (error) { setStatus(`${t('failed')}: ${error.message}`); return null; }
    }
    function undo() {
      const prev = history.past.at(-1); if (!prev) return;
      setHistory({ past: history.past.slice(0, -1), future: [boardRef.current, ...history.future].slice(0, HISTORY_LIMIT) });
      publish(prev); setSelection([]); setPending([]);
    }
    function redo() {
      const next = history.future[0]; if (!next) return;
      setHistory({ past: [...history.past, boardRef.current].slice(-HISTORY_LIMIT), future: history.future.slice(1) });
      publish(next); setSelection([]); setPending([]);
    }
    const pointById = (id) => board.points.find((p) => p.id === id);
    const selectedPoints = selection.map(pointById).filter(Boolean);
    const selectedElements = selection.map((id) => board.elements.find((e) => e.id === id)).filter(Boolean);
    const singlePoint = selection.length === 1 && selectedPoints.length === 1 ? selectedPoints[0] : null;
    const singleElement = selection.length === 1 && selectedElements.length === 1 ? selectedElements[0] : null;
    const noteTarget = singlePoint
      ? { kind: 'point', id: singlePoint.id, label: singlePoint.label }
      : singleElement ? { kind: 'element', id: singleElement.id, label: t(singleElement.type) } : null;
    const noteValue = !noteTarget ? board.note
      : noteTarget.kind === 'point' ? pointById(noteTarget.id)?.note || '' : board.elements.find((e) => e.id === noteTarget.id)?.note || '';

    function localPoint(event) {
      const svg = svgRef.current;
      const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
      const matrix = svg.getScreenCTM();
      const raw = matrix ? p.matrixTransform(matrix.inverse()) : { x: 0, y: 0 };
      return {
        x: Math.max(G.bounds.margin, Math.min(width - G.bounds.margin, raw.x)),
        y: Math.max(G.bounds.margin, Math.min(height - G.bounds.margin, raw.y)),
      };
    }
    // Grid and snap are local view state; neither reaches the snapshot.
    function snapTo(p) {
      if (!snap) return p;
      let best = null;
      for (const q of boardRef.current.points) {
        const d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d <= SNAP_RADIUS && (!best || d < best.d)) best = { d, q };
      }
      return best ? { x: best.q.x, y: best.q.y, id: best.q.id } : p;
    }
    function hitTest(p) {
      for (const q of boardRef.current.points) if (Math.hypot(q.x - p.x, q.y - p.y) <= 10) return { kind: 'point', id: q.id };
      for (const e of [...boardRef.current.elements].reverse()) {
        const ids = e.type === 'circle' ? [e.centerPointId, e.radiusPointId] : e.points;
        const pts = ids.map(pointById).filter(Boolean);
        if (e.type === 'circle') {
          const [center, rim] = pts;
          if (!center || !rim) continue;
          const radius = Math.hypot(rim.x - center.x, rim.y - center.y);
          if (Math.abs(Math.hypot(p.x - center.x, p.y - center.y) - radius) <= 6) return { kind: 'element', id: e.id };
          continue;
        }
        for (let i = 0; i + 1 < pts.length; i++) {
          if (segmentDistance(p, pts[i], pts[i + 1]) <= 6) return { kind: 'element', id: e.id };
        }
        if (pts.length > 2 && segmentDistance(p, pts.at(-1), pts[0]) <= 6) return { kind: 'element', id: e.id };
      }
      return null;
    }
    function segmentDistance(p, a, b) {
      const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy;
      if (!length) return Math.hypot(p.x - a.x, p.y - a.y);
      const at = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length));
      return Math.hypot(p.x - (a.x + at * dx), p.y - (a.y + at * dy));
    }
    function toggleSelection(id) {
      setSelection((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);
    }
    function chooseTool(name) { setTool(name); setPending([]); setSelection([]); }
    function finish(ids) {
      const before = boardRef.current;
      let next = before;
      if (tool === 'segment') next = G.reduce(before, { type: 'addElement', elementType: 'segment', points: ids, role: auxiliary ? 'auxiliary' : 'main' });
      else if (tool === 'polygon') next = G.reduce(before, { type: 'addElement', elementType: 'polygon', points: ids, role: auxiliary ? 'auxiliary' : 'main' });
      else if (tool === 'circle') next = G.reduce(before, { type: 'addElement', elementType: 'circle', centerPointId: ids[0], radiusPointId: ids[1], role: auxiliary ? 'auxiliary' : 'main' });
      else if (tool === 'parallelogram' || tool === 'rectangle') next = G.reduce(before, { type: 'addElement', elementType: tool, points: ids, role: auxiliary ? 'auxiliary' : 'main' });
      else if (tool === 'midpoint') next = G.reduce(before, { type: 'addMidpoint', a: ids[0], b: ids[1] });
      if (JSON.stringify(next) !== JSON.stringify(before)) {
        revision.current++;
        setHistory((old) => ({ past: [...old.past, before].slice(-HISTORY_LIMIT), future: [] }));
        publish(next);
      }
      setPending([]);
      setTool('select');
      const created = next.elements.find((e) => !before.elements.some((old) => old.id === e.id));
      if (created) setSelection([created.id]);
    }
    function clickEmpty(p) {
      const next = action({ type: 'addPoint', x: p.x, y: p.y });
      return next ? next.points.at(-1) : null;
    }
    function usePoint(target, p) {
      let chosen = target;
      if (!chosen) {
        const created = clickEmpty(p);
        if (!created) return;
        chosen = { kind: 'point', id: created.id };
      }
      const ids = [...pending, chosen.id];
      if (tool === 'segment' && ids.length === 2) return finish(ids);
      if (tool === 'circle' && ids.length === 2) return finish(ids);
      if (tool === 'midpoint' && ids.length === 2) return finish(ids);
      if (tool === 'parallelogram' && ids.length === 3) return finish(ids);
      if (tool === 'rectangle' && ids.length === 3) return finish(ids);
      if (tool === 'polygon') {
        // Three points close a triangle; a larger ring closes on the first point again.
        if (ids.length > 3 && ids.at(-1) === ids[0]) return finish(ids.slice(0, -1));
        if (ids.length >= 3 && chosen.id === ids[0] && ids.length > 3) return finish(ids.slice(0, -1));
        setPending(ids); return;
      }
      setPending(ids);
    }
    function pointerDown(event) {
      if (event.button !== 0 || !ready) return;
      const p = localPoint(event);
      const target = hitTest(p);
      const pointId = event.target.closest?.('[data-point]')?.getAttribute('data-point');
      if (tool === 'select') {
        const q = pointId ? pointById(pointId) : null;
        if (q && q.kind === 'free') {
          if (!selection.includes(q.id)) setSelection([q.id]);
          gesture.current = { kind: 'drag', id: q.id, start: p, base: boardRef.current, pointer: event.pointerId, moved: false };
          setPreview({ id: q.id, x: q.x, y: q.y });
          event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
          return;
        }
        if (target) {
          if (append) toggleSelection(target.id);
          else setSelection([target.id]);
        } else if (!append) setSelection([]);
        event.preventDefault();
        return;
      }
      if (target?.kind === 'point') usePoint(target, p);
      else if (target) usePoint(null, p);
      else usePoint(null, snapTo(p));
      event.preventDefault();
    }
    function pointerMove(event) {
      const p = localPoint(event);
      const g = gesture.current;
      if (g && g.pointer === event.pointerId) {
        if (Math.abs(p.x - g.start.x) + Math.abs(p.y - g.start.y) < 3 && !g.moved) return;
        g.moved = true;
        // The drag previews the position the model accepts; release is the only undo step.
        const accepted = G.constrainedMove(g.base, g.id, p.x, p.y);
        if (accepted) setPreview({ id: g.id, x: accepted.x, y: accepted.y });
        return;
      }
      if (tool !== 'select') setHover(snapTo(p));
    }
    function pointerEnd(event, cancelled = false) {
      const g = gesture.current;
      if (!g || g.pointer !== event.pointerId) return;
      gesture.current = null;
      const shown = preview;
      setPreview(null);
      if (cancelled || !g.moved || !shown) return;
      action({ type: 'movePoint', id: g.id, x: shown.x, y: shown.y });
    }
    function deleteSelection() {
      if (!selection.length) return;
      const ids = selection.slice();
      action({ type: 'delete', ids });
      setSelection([]);
    }
    function applyNote() {
      const value = noteRef.current?.value ?? '';
      if (noteTarget) action({ type: 'annotate', target: noteTarget.kind, id: noteTarget.id, value });
      else action({ type: 'note', value });
      setOverlay(null);
    }
    function applyRename() {
      const value = nameRef.current?.value ?? '';
      if (rename) action({ type: 'renamePoint', id: rename.id, label: value });
      setRename(null);
    }
    // "Add to answer" places only the geometry snapshot and the student's own words.
    // The composer keeps whatever it already held, and a failed insert leaves nothing behind.
    function insertGeometry() {
      if (!ready) return;
      const conversation = ctx.get('conversation');
      let drafts = [];
      const discard = () => {
        for (const draft of drafts) {
          try { props.inputActions?.removeAttachment?.(draft.id); } catch { /* composer may be locked */ }
        }
        drafts = [];
      };
      try {
        if (!conversation?.createDrafts || !props.inputActions) throw Error();
        // The board note is the student's own words; it goes into the composer verbatim.
        const note = boardRef.current.note || '';
        const file = new File([G.serialize(boardRef.current)], t('geometryAttachmentName'), { type: 'application/json' });
        drafts = conversation.createDrafts(props.sessionId, [file]);
        if (!props.inputActions.addAttachments(drafts.map((draft) => draft.id))) throw Error();
        if (note.trim()) props.inputActions.insertText(`\n${note}\n`, props.inputActions.captureInsertion());
        props.inputActions.persistDraft();
        setStatus(t(note.trim() ? 'insertedNote' : 'inserted'));
        props.close?.();
      } catch {
        discard();
        setStatus(t('insertFailed'));
      }
    }
    // Files reuse the same browser pickers as the quantity board; the remembered
    // handle is not shared, so each mode remembers its own last file.
    async function saveFile() {
      const text = G.serialize(boardRef.current);
      if (typeof window !== 'undefined' && window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({ suggestedName: t('geometryAttachmentName'),
            types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
          const writable = await handle.createWritable();
          await writable.write(text); await writable.close();
          setStatus(t('fileSaved'));
          return;
        } catch (error) { if (error?.name === 'AbortError') return; }
      }
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = t('geometryAttachmentName'); anchor.click();
      URL.revokeObjectURL(url);
      setStatus(t('fileDownloaded'));
    }
    async function importInput(event) {
      const file = event.target.files?.[0]; event.target.value = '';
      if (!file) return;
      try {
        if (file.size > 262144) throw new Error(t('fileTooLarge'));
        const next = G.validate(JSON.parse(await file.text()));
        // A rejected file never changes the current draft.
        publish(next); setHistory({ past: [], future: [] }); setSelection([]);
        setStatus(t('imported'));
      } catch (error) {
        setStatus(/Another board kind|Invalid/.test(error.message) ? t('otherBoardFile') : `${t('failed')}: ${error.message}`);
      }
    }
    function clearMode() {
      // Clearing this mode resets the geometry canvas and its undo history only.
      publish(G.empty());
      setHistory({ past: [], future: [] });
      setSelection([]); setPending([]); setOverlay(null);
      setStatus(t('geometryClearDone'));
    }

    const at = (id) => {
      const q = pointById(id);
      if (!q) return null;
      return preview && preview.id === id ? { x: preview.x, y: preview.y } : { x: q.x, y: q.y };
    };
    function renderElement(e) {
      const picked = selection.includes(e.id);
      const stroke = {
        stroke: picked ? '#2563EB' : '#1E293B', strokeWidth: picked ? 3 : 1.8, fill: 'none',
        strokeLinejoin: 'round', strokeLinecap: 'round',
        strokeDasharray: e.role === 'auxiliary' ? '7 5' : undefined,
      };
      const label = `${t(e.type)}${e.role === 'auxiliary' ? ` · ${t('auxiliary')}` : ''}${e.note ? ` · ${t('hasNote')}` : ''}`;
      const group = {
        key: e.id, 'data-element': e.id, role: 'button', tabIndex: 0, 'aria-label': label, 'aria-pressed': picked,
        onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelection([e.id]); } },
      };
      if (e.type === 'circle') {
        const center = at(e.centerPointId), rim = at(e.radiusPointId);
        if (!center || !rim) return null;
        return h('g', group, h('circle', { cx: center.x, cy: center.y, r: Math.hypot(rim.x - center.x, rim.y - center.y), ...stroke }));
      }
      const points = e.points.map(at).filter(Boolean);
      if (points.length < 2) return null;
      if (e.type === 'segment') {
        return h('g', group, h('line', { x1: points[0].x, y1: points[0].y, x2: points[1].x, y2: points[1].y, ...stroke }));
      }
      return h('g', group, h('polygon', { points: points.map((p) => `${p.x},${p.y}`).join(' '), ...stroke }));
    }
    function renderPoint(q) {
      const shown = preview && preview.id === q.id ? preview : q;
      const picked = selection.includes(q.id), staged = pending.includes(q.id);
      const label = `${q.label}${q.kind === 'derived' ? ` · ${t('derivedPoint')}` : ''}${q.note ? ` · ${t('hasNote')}` : ''}`;
      return h('g', {
        key: q.id, 'data-point': q.id, role: 'button', tabIndex: 0, 'aria-label': label, 'aria-pressed': picked,
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelection([q.id]); }
          if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); action({ type: 'delete', ids: [q.id] }); setSelection([]); }
        },
      },
      h('circle', { cx: shown.x, cy: shown.y, r: 11, fill: 'transparent' }),
      h('circle', {
        cx: shown.x, cy: shown.y, r: staged ? 6 : picked ? 5.5 : 4,
        fill: picked || staged ? '#2563EB' : q.kind === 'derived' ? '#475569' : '#1E293B',
        stroke: '#FFFFFF', strokeWidth: 1.5,
      }),
      h('text', {
        x: shown.x + 9, y: shown.y - 9, fontSize: 13, fontWeight: 600,
        fill: picked ? '#2563EB' : '#1E293B', stroke: '#FFFFFF', strokeWidth: 3.5, paintOrder: 'stroke', 'pointer-events': 'none',
      }, q.label));
    }
    function hintShape() {
      if (!pending.length) return null;
      const points = pending.map(at).filter(Boolean);
      if (!points.length || !hover) return null;
      const last = points.at(-1);
      if (tool === 'circle') return h('circle', { cx: last.x, cy: last.y, r: Math.hypot(hover.x - last.x, hover.y - last.y), ...previewStyle });
      if (tool === 'segment' || tool === 'polygon' || tool === 'parallelogram' || tool === 'rectangle' || tool === 'midpoint') {
        return h('polyline', { points: [...points, hover].map((p) => `${p.x},${p.y}`).join(' '), ...previewStyle });
      }
      return null;
    }
    const previewStyle = { fill: 'none', stroke: '#93C5FD', strokeWidth: 2, strokeDasharray: '5 4', 'pointer-events': 'none' };
    const canvas = h('div', { className: 'eb-canvas-scroll' },
      h('svg', {
        ref: svgRef, className: `eb-artboard eb-geometry${grid ? ' eb-grid' : ''}`,
        style: { width: fit ? '100%' : width * zoom, height: fit ? 'auto' : height * zoom },
        viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'xMidYMid meet', role: 'group', 'aria-label': t('geometryCanvas'),
        onPointerDown: pointerDown, onPointerMove: pointerMove,
        onPointerUp: (event) => pointerEnd(event), onPointerCancel: (event) => pointerEnd(event, true),
        onMouseLeave: () => setHover(null),
      },
      h('rect', { width, height, fill: '#FFFFFF' }),
      grid && h('g', { 'pointer-events': 'none' },
        Array.from({ length: Math.floor(width / 40) + 1 }, (_, i) => h('line', { key: `v${i}`, x1: i * 40, y1: 0, x2: i * 40, y2: height, stroke: '#EEF2F4' })),
        Array.from({ length: Math.floor(height / 40) + 1 }, (_, i) => h('line', { key: `h${i}`, x1: 0, y1: i * 40, x2: width, y2: i * 40, stroke: '#EEF2F4' }))),
      board.elements.map(renderElement),
      board.points.map(renderPoint),
      hintShape(),
      hover && !pending.length && tool !== 'select' && tool !== 'point'
        && h('circle', { cx: hover.x, cy: hover.y, r: 6, fill: '#BFDBFE', stroke: '#2563EB', strokeWidth: 1.5, 'pointer-events': 'none' }),
      !board.points.length && !board.elements.length && h('g', { 'pointer-events': 'none' },
        h('text', { x: width / 2, y: height / 2 - 12, textAnchor: 'middle', fill: '#64748B', fontSize: 17 }, t('geometryEmpty')),
        h('text', { x: width / 2, y: height / 2 + 14, textAnchor: 'middle', fill: '#64748B', fontSize: 12 }, t('geometryEmptyHint')))));

    const toolButton = (name) => h('button', {
      key: name, type: 'button', className: 'eb-tool', title: t(name), 'aria-label': t(name),
      'aria-pressed': tool === name, onClick: () => chooseTool(name),
    }, icon(name));
    const tools = h('aside', { className: 'eb-palette eb-geometry-tools', 'aria-label': t('geometryTools') },
      TOOLS.map(toolButton),
      h('button', {
        type: 'button', className: 'eb-tool', 'aria-pressed': auxiliary, onClick: () => setAuxiliary(!auxiliary),
        title: t('auxiliary'), 'aria-label': t('auxiliary'),
      }, icon('segment'), h('span', { className: 'eb-label' }, t('auxiliary'))));
    const selectionBar = selection.length > 0 && h('div', { className: 'eb-floating', role: 'toolbar', 'aria-label': t('geometrySelectionActions') },
      h('small', null, `${t('selectedCount')} ${selection.length}`),
      singlePoint && h('button', { type: 'button', className: 'eb-context-action', onClick: () => setRename({ id: singlePoint.id, value: singlePoint.label }) }, t('renamePoint')),
      h('button', { type: 'button', 'aria-pressed': append, onClick: () => setAppend(!append) }, append ? t('appendDone') : t('appendSelect')),
      h('button', { type: 'button', className: 'eb-danger', onClick: deleteSelection }, icon('trash', 16), t('trash')));
    const stage = h('section', { className: 'eb-stage-wrap', 'aria-label': t('geometryCanvas') },
      props.question,
      h('div', { className: 'eb-stage-frame' }, canvas, selectionBar));
    const dock = h('nav', { className: 'eb-dock', 'aria-label': t('canvasTools') },
      h('button', { type: 'button', className: 'eb-dock-return', onClick: props.close }, t('backToChat')),
      h('span', { className: 'eb-divider' }),
      h('button', { type: 'button', className: 'eb-icon-button', title: t('undo'), 'aria-label': t('undo'), disabled: !history.past.length, onClick: undo }, icon('undo', 18)),
      h('button', { type: 'button', className: 'eb-icon-button', title: t('redo'), 'aria-label': t('redo'), disabled: !history.future.length, onClick: redo }, icon('redo', 18)),
      h('span', { className: 'eb-divider' }),
      h('button', { type: 'button', 'aria-pressed': grid, onClick: () => setGrid(!grid) }, grid ? t('gridOn') : t('gridOff')),
      h('button', { type: 'button', 'aria-pressed': snap, onClick: () => setSnap(!snap) }, snap ? t('snapOn') : t('snapOff')),
      h('span', { className: 'eb-divider' }),
      h('button', { type: 'button', className: 'eb-zoom-button', 'aria-label': t('zoomOut'), onClick: () => { setFit(false); setZoom(Math.max(0.5, zoom - 0.25)); } }, '−'),
      h('button', { type: 'button', className: 'eb-zoom-label', 'aria-pressed': fit, onClick: () => setFit(!fit) }, fit ? t('fitView') : `${Math.round(zoom * 100)}%`),
      h('button', { type: 'button', className: 'eb-zoom-button', 'aria-label': t('zoomIn'), onClick: () => { setFit(false); setZoom(Math.min(2, zoom + 0.25)); } }, '＋'),
      h('span', { className: 'eb-grow' }),
      h('button', {
        type: 'button', className: `eb-note-button${noteTarget ? ' eb-contextual' : ''}`,
        title: noteTarget ? `${t('note')} · ${noteTarget.label}` : `${t('note')} · ${t('noteGeneral')}`,
        'aria-label': t('note'), onClick: () => setOverlay({ kind: 'note' }),
      }, icon('note', 18)),
      h('button', { type: 'button', className: 'eb-icon-button eb-danger', title: t('clearGeometry'), 'aria-label': t('clearGeometry'),
        onClick: () => setOverlay({ kind: 'clear' }) }, icon('clear', 18)),
      h('button', { type: 'button', title: t('export'), 'aria-label': t('export'), onClick: saveFile }, t('export')),
      h('button', { type: 'button', title: t('import'), 'aria-label': t('import'), onClick: () => fileInputRef.current?.click() }, t('import')),
      h('button', {
        type: 'button', className: 'eb-primary', title: t('insert'), disabled: phase !== 'plain' || (!board.points.length && !board.elements.length && !board.note),
        onClick: () => insertGeometry(),
      }, t('insert')));
    const overlayNode = overlay && h('div', { className: 'eb-overlay', onPointerDown: (event) => { if (event.target === event.currentTarget) setOverlay(null); } },
      h('div', { className: `eb-overlay-card eb-overlay-${overlay.kind}`, role: 'dialog', 'aria-modal': 'true' },
        overlay.kind === 'note' && h(React.Fragment, null,
          h('h2', null, t('note')),
          h('p', { className: 'eb-overlay-context' }, noteTarget ? `${t('noteAbout')} ${noteTarget.label}` : t('noteGeneral')),
          h('textarea', { ref: noteRef, maxLength: 500, defaultValue: noteValue, placeholder: t('noteHint') }),
          h('div', { className: 'eb-overlay-actions' },
            h('button', { type: 'button', onClick: () => setOverlay(null) }, t('cancel')),
            h('button', { type: 'button', className: 'eb-primary', onClick: applyNote }, t('save')))),
        overlay.kind === 'clear' && h(React.Fragment, null,
          h('h2', null, t('clearGeometry')),
          h('p', { className: 'eb-muted' }, t('geometryClearQuestion')),
          h('div', { className: 'eb-overlay-actions' },
            h('button', { type: 'button', onClick: () => setOverlay(null) }, t('cancel')),
            h('button', { type: 'button', className: 'eb-primary eb-danger-solid', onClick: clearMode }, t('confirmClear'))))));
    const renameNode = rename && h('div', { className: 'eb-overlay' },
      h('div', { className: 'eb-overlay-card eb-overlay-name', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('renamePoint') },
        h('h2', null, t('renamePoint')),
        h('input', { ref: nameRef, type: 'text', maxLength: 30, defaultValue: rename.value,
          onKeyDown: (event) => { if (event.key === 'Enter') applyRename(); } }),
        h('div', { className: 'eb-overlay-actions' },
          h('button', { type: 'button', onClick: () => setRename(null) }, t('cancel')),
          h('button', { type: 'button', className: 'eb-primary', onClick: applyRename }, t('apply')))));
    const statusNode = status && h('div', { className: 'eb-status-toast', role: 'status', 'aria-live': 'polite' }, status);
    return h(React.Fragment, null,
      h('div', { className: 'eb-workspace eb-geometry-workspace' }, tools, stage, dock, statusNode, overlayNode, renameNode),
      h('input', { hidden: true, type: 'file', accept: '.json,application/json', ref: fileInputRef, onChange: importInput }));
  };
}
