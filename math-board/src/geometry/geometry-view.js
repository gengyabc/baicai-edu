// Geometry tab: a draw-only canvas with points, segments, triangles, polygons, circles,
// parallelograms and rectangles. Embedded into client.js by build.mjs. Nothing here reads
// the quantity board: no patterns, no values, no shared storage key, no shared undo history.

/**
 * The geometry page. `shared` is required and carries the modules both tabs use
 * (`createBoardFilePicker` and `createBoardIcons` from file-picker.js): build.mjs inlines
 * this factory with toString(), so importing them here would leave a reference that cannot
 * resolve in the bundle. JS tests pass the real imports; client.js passes the inlined copies.
 */
export function createGeometryPage(React, G, ctx, t, shared) {
  const h = React.createElement;
  const STORAGE_PREFIX = 'baicai-edu-math-board:geometry:v1:';
  const HISTORY_LIMIT = 40;
  const SNAP_RADIUS = 12;
  // The drawable library comes from the model so the two lists cannot drift.
  // "select" is a tool, not a shape. A triangle is three clicks that close as a polygon,
  // so it stays out of the snapshot's element types. Polygon sits after rectangle.
  // Midpoint is an action on one selected side, drawn beside these tools rather than as one of them.
  // The text tool has its own rail position below, so the library keeps it out of the
  // shape run that follows the segment tool.
  const shapeTools = G.shapeLibrary.filter((name) => name !== 'point' && name !== 'polygon' && name !== 'text');
  const segmentAt = shapeTools.indexOf('segment');
  const DRAW_TOOLS = [
    'select', 'point',
    ...shapeTools.slice(0, segmentAt + 1),
    'triangle',
    ...shapeTools.slice(segmentAt + 1),
    'text',
    'polygon',
  ];
  // One way to write a run of points for an SVG line or polygon.
  const pathOf = (points) => points.map((point) => `${point.x},${point.y}`).join(' ');
  // A tool that draws several points in a row before it closes.
  const drawnInRun = (name) => ['segment', 'triangle', 'polygon', 'parallelogram', 'rectangle'].includes(name);
  // Box geometry for marquee selection. A point counts when it lies inside; a shape counts
  // when its stroke meets the rectangle.
  function boxFrom(a, b) {
    return {
      x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y),
      x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y),
    };
  }
  function pointInBox(p, box) {
    return p.x >= box.x0 && p.x <= box.x1 && p.y >= box.y0 && p.y <= box.y1;
  }
  function orient(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }
  function segmentsCross(a, b, c, d) {
    const ab = orient(a, b, c) * orient(a, b, d);
    const cd = orient(c, d, a) * orient(c, d, b);
    if (ab < 0 && cd < 0) return true;
    const on = (p, q, r) => Math.abs(orient(p, q, r)) <= 1e-6
      && r.x >= Math.min(p.x, q.x) - 1e-6 && r.x <= Math.max(p.x, q.x) + 1e-6
      && r.y >= Math.min(p.y, q.y) - 1e-6 && r.y <= Math.max(p.y, q.y) + 1e-6;
    return on(a, b, c) || on(a, b, d) || on(c, d, a) || on(c, d, b);
  }
  function segmentHitsBox(a, b, box) {
    if (pointInBox(a, box) || pointInBox(b, box)) return true;
    const corners = [
      { x: box.x0, y: box.y0 }, { x: box.x1, y: box.y0 },
      { x: box.x1, y: box.y1 }, { x: box.x0, y: box.y1 },
    ];
    return corners.some((corner, i) => segmentsCross(a, b, corner, corners[(i + 1) % 4]));
  }
  // Edge identity, edge lookup and the text metrics are the model's, so this page never
  // keeps a second rule for the same thing.
  const edgeKey = G.edgeKey;
  // A student's writing is drawn at the model's own size, so the box the model measures is
  // the box the page draws, selects and hit-tests. One box serves the hit test, the marquee
  // and the selection frame; none of them estimates the writing again.
  const textMetrics = G.textMetrics();
  const TEXT_SIZE = textMetrics.size;
  const TEXT_LINE = textMetrics.line;
  function textBoxOf(e) {
    const box = G.textBox(e.text.split('\n'));
    return { x0: e.x - 6, y0: e.y - TEXT_SIZE - 4, x1: e.x + box.width + 2, y1: e.y + box.height - TEXT_SIZE };
  }
  const boxesMeet = (a, b) => a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
  const closedShape = (type) => type === 'polygon' || type === 'rectangle' || type === 'parallelogram';
  function circleHitsBox(center, radius, box) {
    const nearestX = Math.max(box.x0, Math.min(center.x, box.x1));
    const nearestY = Math.max(box.y0, Math.min(center.y, box.y1));
    const nearest = Math.hypot(center.x - nearestX, center.y - nearestY);
    const far = Math.hypot(
      Math.max(Math.abs(center.x - box.x0), Math.abs(center.x - box.x1)),
      Math.max(Math.abs(center.y - box.y0), Math.abs(center.y - box.y1)),
    );
    return nearest <= radius + 0.5 && far + 0.5 >= radius;
  }
  // A circle's unused rim point stays in the snapshot so the radius is defined, and it is
  // not drawn. The demo page hides the same points with the same rule.
  const exclusiveRimIds = (state) => shared.geometryHiddenPoints(state);
  // Icons, dock controls, the caption and label placement, the stroke and the file pickers
  // are shared with the other pages so the three tabs cannot drift apart; only the
  // per-tab callbacks below differ.
  const icon = shared.createBoardIcons(React);
  const controls = shared.createBoardControls(React, t);
  const PracticeNavigation = shared.createPracticeNavigation?.(React, t);
  const practiceFrames = shared.createGeometryPracticeFrames?.(G);
  const practiceChapters = shared.createGeometryBasicsChapter ? [shared.createGeometryBasicsChapter({
    G, emptyFrame: practiceFrames.empty, createGoal: shared.createGeometryPractice,
  }), ...(shared.geometryPracticeChapters || []).map(factory => factory({G,emptyFrame:practiceFrames.empty}))] : [];
  function Board(props) {
    const key = `${STORAGE_PREFIX}${props.sessionId}`;
    const [ready, setReady] = React.useState(false);
    const [board, setBoard] = React.useState(G.empty);
    const boardRef = React.useRef(board);
    const [history, setHistory] = React.useState({ past: [], future: [] });
    const [tool, setTool] = React.useState('select');
    const [auxiliary, setAuxiliary] = React.useState(false);
    const [pending, setPending] = React.useState([]);
    const [selection, setSelection] = React.useState([]);
    const [hover, setHover] = React.useState(null);
    const [hit, setHit] = React.useState(null);
    const [marquee, setMarquee] = React.useState(null);
    const [preview, setPreview] = React.useState(null);
    // How far the canvas is enlarged over the fit, like the quantity board's zoom.
    const [zoom, setZoom] = React.useState(1);
    const [fit, setFit] = React.useState(true);
    const [grid, setGrid] = React.useState(false);
    const [snap, setSnap] = React.useState(true);
    const [moreOpen, setMoreOpen] = React.useState(false);
    const [status, setStatus] = React.useState('');
    const [overlay, setOverlay] = React.useState(null);
    const [rename, setRename] = React.useState(null);
    const [writing, setWriting] = React.useState(null);
    const [practiceOpen, setPracticeOpen] = React.useState(false);
    const [guideShown, setGuideShown] = React.useState(false);
    const practiceOpenRef = React.useRef(false);
    const guideShownRef = React.useRef(false);
    practiceOpenRef.current = practiceOpen;
    guideShownRef.current = guideShown;
    const alive = React.useRef(true);
    const practiceRef = React.useRef(null);
    const guideMode = props.guideMode === true;
    if ((props.practice || guideMode) && !practiceRef.current) practiceRef.current = guideMode
      ? props.guideProgress
      : shared.createPracticeProgress({
        mode:'geometry',chapters:practiceChapters,validateFrame:practiceFrames.validate,
      });
    const [progress,setProgress] = React.useState(() => practiceRef.current?.snapshot());
    const practiceEvents = React.useRef([]);
    const practiceState = progress?.goal;
    function editable() { return alive.current && (props.practice || guideMode || (!practiceOpenRef.current && !guideShownRef.current)); }
    function practiceEvent(event) { if ((props.practice || guideMode) && alive.current) { practiceEvents.current.push(event); setProgress({...practiceRef.current.snapshot()}); } }
    function selectUser(ids) { setSelection(ids); practiceEvent({type:'select',selection:ids,after:boardRef.current}); }
    const workspaceRef = React.useRef(null);
    const gesture = React.useRef(null);
    // Free points created for the unfinished shape. Escape deletes these and leaves
    // points the student had already placed.
    const constructionPoints = React.useRef([]);
    const svgRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const scrollRef = React.useRef({ left: 0, top: 0 });
    const noteRef = React.useRef(null), nameRef = React.useRef(null);
    // An open that arrives after this tab's draft changed must not overwrite it.
    const revision = React.useRef(0);
    const phase = props.useInput((s) => s.phase);
    // The area the canvas really has. A fit is sized against it, so a short window never
    // crops the bottom of the board.
    const [viewport, setViewport] = React.useState({ width: 1280, height: 640 });
    const storedBounds = G.boundsFor(board);
    // Refit against content, not previously unused paper: repeated window rotations must
    // not compound old horizontal and vertical extensions into an ever-growing board.
    const anchors = [...board.points, ...board.elements.filter((element) => element.type === 'text')];
    const paperBounds = {
      width: Math.min(10000, Math.max(G.bounds.width, ...anchors.map((point) => Math.ceil(point.x + G.bounds.margin)))),
      height: Math.min(10000, Math.max(G.bounds.height, ...anchors.map((point) => Math.ceil(point.y + G.bounds.margin)))),
    };
    const frame = shared.geometryFrame(shared.geometryFrameInputs({
      ...paperBounds, board,
      captionOf: (element) => shared.captionPosition?.(element,
        (id) => board.points.find((point) => point.id === id), paperBounds) || null,
      textBox: (element) => {
        const hit = textBoxOf(element);
        return { x: hit.x0 - element.x, y: hit.y0 - element.y, width: hit.x1 - hit.x0, height: hit.y1 - hit.y0 };
      },
    }), viewport, { value: zoom, fit, fill: true });
    const { width, height } = frame.paper;
    // Growing paper is layout, not a student action. Preserve it in the snapshot so
    // points in the added area remain valid after saving, opening or submitting.
    React.useEffect(() => {
      if (!ready || (width === storedBounds.width && height === storedBounds.height)) return;
      publish(G.validate({ ...boardRef.current, canvas: { width, height } }));
    }, [ready, width, height, storedBounds.width, storedBounds.height]);
    React.useEffect(() => {
      const node = canvasRef.current;
      if (!node || typeof ResizeObserver === 'undefined') return undefined;
      const measure = () => {
        // Measure the stable outer scrollport, not its scrollbar-dependent client area.
        const next = shared.geometryViewport(node);
        if (!next) return;
        setViewport((old) => (old.width === next.width && old.height === next.height ? old : next));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    React.useEffect(() => {
      alive.current = true;
      if (props.practice || guideMode) {
        const next = practiceRef.current.enter(); applyPracticeFrame(next.frame); setProgress(next); setReady(true);
        return () => { alive.current = false; gesture.current = null; };
      }
      try {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved !== null) { const next = G.validate(saved); boardRef.current = next; setBoard(next); }
      } catch { setStatus(t('geometryLoadError')); }
      setReady(true);
      return () => { alive.current = false; gesture.current = null; };
    }, [key]);
    React.useEffect(() => {
      if (!ready || props.practice || guideMode || !alive.current) return;
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
    const textRef = React.useRef(null);
    React.useEffect(() => {
      if (!writing) return;
      const node = textRef.current;
      node?.focus();
      node?.select?.();
    }, [writing?.id]);
    React.useEffect(() => {
      if (!moreOpen) return undefined;
      const closeMenus = (event) => {
        if (!event.target.closest?.('.eb-menu, .eb-menu-trigger')) setMoreOpen(false);
      };
      document.addEventListener('pointerdown', closeMenus);
      return () => document.removeEventListener('pointerdown', closeMenus);
    }, [moreOpen]);

    const tabActive = props.tabActive === true && !practiceOpen && !guideShown;
    React.useEffect(() => {
      if (props.tabActive || guideMode || props.practice) return undefined;
      const guideOpen = typeof props.guide === 'function' && props.guide()?.open;
      if (!guideOpen) setPracticeOpen(false);
      return undefined;
    }, [props.tabActive]);
    React.useEffect(() => {
      if (guideMode || props.practice) return undefined;
      if (!props.tabActive || practiceOpen) { setGuideShown(false); return undefined; }
      const api = typeof props.guide === 'function' ? props.guide() : null;
      const goalStep = api?.open ? api.progress?.snapshot()?.goal?.step : null;
      setGuideShown(goalStep === 'demo-return' || goalStep === 'demo-complete');
      return undefined;
    }, [props.tabActive, practiceOpen]);
    function startGeometryTour() {
      if (!practiceChapters.length) return;
      practiceOpenRef.current = true;
      setMoreOpen(false); setOverlay(null); setRename(null); setWriting(null); setPracticeOpen(true);
    }
    function practiceRecorded(mode) {
      try {
        return globalThis.localStorage?.getItem(`baicai-edu-math-board:practice:v2:${mode}`) != null;
      } catch { return true; }
    }
    React.useEffect(() => {
      if (guideMode || props.practice || !props.tabActive || practiceOpenRef.current) return undefined;
      const api = typeof props.guide === 'function' ? props.guide() : null;
      // Any open teacher guide owns this visit. Starting basics here would stay
      // open through the return step, because leaving the tab does not close
      // practice while the guide is open, and the return frame is hidden then.
      if (api?.open) return undefined;
      if (!shared.createPracticeProgress || practiceRecorded('geometry')) return undefined;
      startGeometryTour();
      return undefined;
    }, [props.tabActive]);
    function practiceFrame() {
      return {board:boardRef.current,history,selection,tool,pending,construction:constructionPoints.current,
        auxiliary,grid,snap,zoom,fit,scroll:{left:canvasRef.current?.scrollLeft || 0,top:canvasRef.current?.scrollTop || 0}};
    }
    function applyPracticeFrame(frame) {
      publish(frame.board); setHistory(frame.history); setSelection(frame.selection); setTool(frame.tool);
      setPending(frame.pending); constructionPoints.current = frame.construction;
      setAuxiliary(frame.auxiliary); setGrid(frame.grid); setSnap(frame.snap); setZoom(frame.zoom); setFit(frame.fit);
      gesture.current=null; setPreview(null); setMarquee(null); setHover(null); setHit(null);
      setOverlay(null); setRename(null); setWriting(null);
      scrollRef.current = { left: frame.scroll.left, top: frame.scroll.top };
      if (canvasRef.current) {canvasRef.current.scrollLeft=frame.scroll.left;canvasRef.current.scrollTop=frame.scroll.top;}
    }
    function navigatePractice(command,value) {
      practiceEvents.current=[];
      const next = command==='retry' ? practiceRef.current.enter(progress.current,{retry:true})
        : command==='enter' ? practiceRef.current.enter(value)
          : command==='retryStep' ? practiceRef.current.retryStep(value) : practiceRef.current[command]();
      applyPracticeFrame(next.frame); setProgress(next);
    }
    React.useEffect(() => {
      if (!(props.practice || guideMode) || !ready || !alive.current) return;
      const events=practiceEvents.current.splice(0), wasSupplementing=practiceRef.current.snapshot().supplementing;
      let next;
      if (events.length) for (const event of events) next=practiceRef.current.observe(event,practiceFrame());
      else next=practiceRef.current.saveFrame(practiceFrame());
      if (wasSupplementing && !next.supplementing) applyPracticeFrame(next.frame);
      if (events.length || next.persistence!==progress?.persistence) setProgress(next);
      // The midpoint commit selects the derived point, and progress stores that selection
      // as this step's start. Reset puts it back. Re-apply the free point whenever this
      // step is showing and the selection is not exactly that point.
      const marked = next.goal?.step === 'construct-drag' ? next.goal.pointId : null;
      const point = marked && boardRef.current.points.find((item) => item.id === marked && item.kind === 'free');
      if (point && !(selection.length === 1 && selection[0] === marked)) setSelection([marked]);
      // The previous commit selects whatever it just made. These steps name one object,
      // so the selection bar keeps pointing at that object while the step is showing.
      const editStep = next.goal?.step;
      const editMark = editStep === 'edit-rename' || editStep === 'edit-point-note' ? next.goal.pointId
        : editStep === 'edit-text-change' ? next.goal.textId
          : editStep === 'edit-delete' ? next.goal.deleteId
            : editStep === 'edit-element-note' ? next.goal.elementId : null;
      const editLive = editMark && (boardRef.current.points.some((item) => item.id === editMark)
        || boardRef.current.elements.some((item) => item.id === editMark));
      if (editLive && !(selection.length === 1 && selection[0] === editMark)) setSelection([editMark]);
    },[ready,board,history,selection,tool,pending,auxiliary,grid,snap,zoom,fit,progress]);
    function closePage() {
      if (guideMode) { props.onGuideExit?.(); return; }
      if (props.practice) props.onPracticeExit(); else setPracticeOpen(false); props.close?.();
    }

    function publish(next) { revision.current += 1; boardRef.current = next; setBoard(next); }
    function action(a) {
      if (!ready || !editable()) return null;
      try {
        const next = G.reduce(boardRef.current, a);
        if (JSON.stringify(next) !== JSON.stringify(boardRef.current)) {
          setHistory((old) => ({ past: [...old.past, boardRef.current].slice(-HISTORY_LIMIT), future: [] }));
          publish(next);
        }
        return next;
      } catch (error) { setStatus(`${t('failed')}: ${error.message}`); return null; }
    }
    function appendFigure(figureBoard) {
      // Only a real placement failure may reach the demo's "make room" message; a draft
      // that has not loaded yet or a missing module is not the student's canvas being full.
      if (!ready || !alive.current) return { ok: false, reason: 'not-ready' };
      if (typeof shared.placeFigure !== 'function') return { ok: false, reason: 'failed' };
      const placed = shared.placeFigure(G, boardRef.current, figureBoard);
      if (!placed?.ok) return placed || { ok: false, reason: 'full' };
      // The figure was drawn on the teacher's own board, so its ids repeat a draft's
      // naming (`e-1`, `p-1`), and a second copy repeats the first copy's. Every arrival
      // keeps only ids that nothing else on this draft already uses.
      const arrivals = new Set(placed.elementIds);
      const used = new Set(placed.board.elements.filter((e) => !arrivals.has(e.id)).map((e) => e.id));
      const renamed = [];
      const elements = placed.board.elements.map((e) => {
        if (!arrivals.has(e.id) || !used.has(e.id)) { used.add(e.id); return e; }
        const id = freshElementId(used);
        used.add(id);
        renamed.push(id);
        return { ...e, id };
      });
      let next;
      try { next = G.validate({ ...placed.board, elements }); } catch { return { ok: false, reason: 'failed' }; }
      setHistory((old) => ({ past: [...old.past, boardRef.current].slice(-HISTORY_LIMIT), future: [] }));
      forgetConstruction();
      publish(next);
      setSelection([...placed.elementIds.filter((id) => !renamed.includes(id)), ...renamed]);
      setPending([]);
      setStatus(t('demoCopyDone'));
      return { ok: true };
    }
    // The next free element id this draft has never used, in the board's own `e-<n>` form.
    function freshElementId(used) {
      let max = 0;
      const pattern = /^e-(\d+)$/;
      for (const id of [...used, ...boardRef.current.elements.map((e) => e.id)]) {
        const match = pattern.exec(String(id));
        if (match && Number.isSafeInteger(Number(match[1]))) max = Math.max(max, Number(match[1]));
      }
      let next = max + 1;
      while (used.has(`e-${next}`)) next += 1;
      return `e-${next}`;
    }
    function forgetConstruction() { constructionPoints.current = []; }
    function undo() {
      if (!editable()) return;
      const prev = history.past.at(-1); if (!prev) return;
      const before = boardRef.current;
      setHistory({ past: history.past.slice(0, -1), future: [before, ...history.future].slice(0, HISTORY_LIMIT) });
      forgetConstruction(); publish(prev); setSelection([]); setPending([]);
      practiceEvent({ type: 'undo', before, after: prev });
    }
    function redo() {
      if (!editable()) return;
      const next = history.future[0]; if (!next) return;
      const before = boardRef.current;
      setHistory({ past: [...history.past, before].slice(-HISTORY_LIMIT), future: history.future.slice(1) });
      forgetConstruction(); publish(next); setSelection([]); setPending([]);
      practiceEvent({ type: 'redo', before, after: next });
    }
    const pointById = (id) => board.points.find((p) => p.id === id);
    const selectedPoints = selection.map(pointById).filter(Boolean);
    const selectedElements = selection.map((id) => board.elements.find((e) => e.id === id)).filter(Boolean);
    const singlePoint = selection.length === 1 && selectedPoints.length === 1 ? selectedPoints[0] : null;
    const singleElement = selection.length === 1 && selectedElements.length === 1 ? selectedElements[0] : null;
    const singleText = singleElement?.type === 'text' ? singleElement : null;
    // Short element notes are drawn as a caption beside the shape, and that caption is a
    // pick target in its own right: the writing the student sees must be the writing the
    // note control rewrites. Point labels are hit as points and keep their own rename.
    const captionOf = (e) => (!e || e.type === 'text') ? null : shared.captionPosition?.(e, (id) => {
      const q = pointById(id);
      return q ? { x: q.x, y: q.y } : null;
    }, { width, height }) || null;
    const captionTarget = (() => {
      if (hit?.kind === 'caption') {
        const element = board.elements.find((e) => e.id === hit.id);
        const caption = captionOf(element);
        if (caption) return { element, caption };
      }
      // A selected shape with a caption keeps the note control pointed at that caption.
      // The whole-board note still has its own copy in the toolbar, as on the quantity tab.
      if (singleElement && captionOf(singleElement)) return { element: singleElement, caption: captionOf(singleElement) };
      return null;
    })();
    const noteTarget = captionTarget
      ? { kind: 'element', id: captionTarget.element.id, label: `${t(captionTarget.element.type)} · ${t('hasNote')}` }
      : singlePoint
        ? { kind: 'point', id: singlePoint.id, label: singlePoint.label }
        : singleElement ? { kind: 'element', id: singleElement.id, label: t(singleElement.type) } : null;
    const noteValue = !noteTarget ? board.note
      : noteTarget.kind === 'point' ? pointById(noteTarget.id)?.note || '' : board.elements.find((e) => e.id === noteTarget.id)?.note || '';
    // A card opened from a caption holds that caption's target, live with the current
    // selection, so the words it shows are always the words it will rewrite.
    const noteCardTarget = overlay?.kind === 'note'
      ? (overlay.target ? { kind: 'element', id: overlay.target.id, label: overlay.target.label } : noteTarget)
      : null;
    const noteCardValue = !noteCardTarget ? board.note
      : noteCardTarget.kind === 'point' ? pointById(noteCardTarget.id)?.note || '' : board.elements.find((e) => e.id === noteCardTarget.id)?.note || '';

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
    // Only a free point is a legal construction input or a lone drag handle. A derived point stays
    // visible and selectable, and clicking it must never reuse its id as an endpoint. A vertex of
    // a fully selected shape, derived or free, translates that shape by moving its free points.
    const freePoints = () => boardRef.current.points.filter((q) => q.kind === 'free');
    // Grid and snap are local view state; neither reaches the snapshot.
    function snapTo(p) {
      if (!snap) return p;
      const hidden = exclusiveRimIds(boardRef.current);
      let best = null;
      for (const q of freePoints()) {
        if (hidden.has(q.id)) continue;
        const d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d <= SNAP_RADIUS && (!best || d < best.d)) best = { d, q };
      }
      return best ? { x: best.q.x, y: best.q.y, id: best.q.id } : p;
    }
    function hitTest(p) {
      // A derived point is still hit first, so selecting it does not fall through to a
      // shape underneath; the caller decides whether it may be used as an endpoint.
      // A circle's exclusive rim point is not a hit target: the stroke is the circle.
      const state = boardRef.current;
      const hidden = exclusiveRimIds(state);
      for (const q of state.points) {
        if (hidden.has(q.id)) continue;
        if (Math.hypot(q.x - p.x, q.y - p.y) <= 10) return { kind: 'point', id: q.id };
      }
      // A text is hit by its own writing box, above the shapes it sits over.
      for (const e of [...state.elements].reverse()) {
        if (e.type !== 'text') continue;
        if (pointInBox(p, textBoxOf(e))) return { kind: 'text', id: e.id };
      }
      // A short element note is drawn beside the shape; that writing is a target of its
      // own, so pressing it opens the note that produced it instead of selecting the shape.
      for (const e of [...state.elements].reverse()) {
        if (e.type === 'text') continue;
        const caption = shared.captionPosition?.(e, (id) => {
          const q = pointById(id);
          return q ? { x: q.x, y: q.y } : null;
        }, { width, height });
        if (!caption) continue;
        // The click target is the writing the page draws, box and all: both come from the
        // same measured caption, never from a second estimate of how wide it looks.
        const box = shared.captionBox?.(caption);
        if (box && p.x >= box.x0 && p.x <= box.x1 && p.y >= box.y0 && p.y <= box.y1) return { kind: 'caption', id: e.id };
      }
      for (const e of [...state.elements].reverse()) {
        if (e.type === 'text') continue;
        const ids = e.type === 'circle' ? [e.centerPointId, e.radiusPointId] : e.points;
        const pts = ids.map(pointById).filter(Boolean);
        if (e.type === 'circle') {
          const [center, rim] = pts;
          if (!center || !rim) continue;
          const radius = Math.hypot(rim.x - center.x, rim.y - center.y);
          if (Math.abs(Math.hypot(p.x - center.x, p.y - center.y) - radius) <= 6) return { kind: 'element', id: e.id };
          continue;
        }
        const closed = closedShape(e.type);
        for (let i = 0; i + 1 < pts.length; i++) {
          if (segmentDistance(p, pts[i], pts[i + 1]) <= 6) {
            return closed ? { kind: 'edge', id: edgeKey(e.id, i) } : { kind: 'element', id: e.id };
          }
        }
        if (closed && pts.length > 2 && segmentDistance(p, pts.at(-1), pts[0]) <= 6) {
          return { kind: 'edge', id: edgeKey(e.id, pts.length - 1) };
        }
      }
      return null;
    }
    function segmentDistance(p, a, b) {
      const dx = b.x - a.x, dy = b.y - a.y, length = dx * dx + dy * dy;
      if (!length) return Math.hypot(p.x - a.x, p.y - a.y);
      const at = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length));
      return Math.hypot(p.x - (a.x + at * dx), p.y - (a.y + at * dy));
    }
    function chooseTool(name) {
      if (!editable()) return;
      forgetConstruction();
      setTool(name); setPending([]); setSelection([]);
    }
    function finish(ids) {
      const before = boardRef.current;
      const role = auxiliary ? 'auxiliary' : 'main';
      const drawing = tool;
      const spec = tool === 'segment' ? { type: 'addElement', elementType: 'segment', points: ids, role }
        : tool === 'triangle' || tool === 'polygon' ? { type: 'addElement', elementType: 'polygon', points: ids, role }
        : tool === 'circle' ? { type: 'addElement', elementType: 'circle', centerPointId: ids[0], radiusPointId: ids[1], role }
        : tool === 'parallelogram' || tool === 'rectangle' ? { type: 'addElement', elementType: tool, points: ids, role }
        : null;
      // action reports a refusal instead of throwing out of the click, which used to
      // leave the clicked corners on the board and never draw the shape.
      const next = spec ? action(spec) : null;
      forgetConstruction();
      setPending([]);
      if (!next) return;
      setTool('select');
      const created = next.elements.find((e) => !before.elements.some((old) => old.id === e.id));
      if (created && closedShape(created.type)) setSelection(created.points.map((_, index) => edgeKey(created.id, index)));
      else if (created) setSelection([created.id]);
      if (created) practiceEvent({type:'draw',tool:drawing,before,after:next,closed:drawing==='polygon',role});
    }
    function clickEmpty(p) {
      const before = boardRef.current;
      const next = action({ type: 'addPoint', x: p.x, y: p.y });
      // Only the point tool counts for this goal; other tools also
      // drop free points as construction inputs and must not advance that step.
      if (next && tool === 'point') practiceEvent({ type: 'draw', tool, before, after: next, grid, snap });
      const created = next ? next.points.at(-1) : null;
      if (created && tool !== 'point') constructionPoints.current.push(created.id);
      return created;
    }
    function usePoint(target, p) {
      // A derived point cannot be a construction input, so a click on it places a new free
      // point instead of silently reusing an id the model would reject.
      let usable = target && boardRef.current.points.find((q) => q.id === target.id)?.kind === 'free' ? target : null;
      let place = p;
      if (tool === 'rectangle' && pending.length === 2) {
        const [a, b] = pending.map((id) => boardRef.current.points.find((q) => q.id === id));
        // The model decides where the right-angle corner goes and which click points it
        // keeps, so the preview, this click and the committed shape are one rule.
        const hit = usable ? boardRef.current.points.find((q) => q.id === usable.id) : null;
        const placement = a && b ? G.rectanglePlacement(a, b, p, hit) : null;
        if (!placement) {
          setStatus(`${t('failed')}: Degenerate element`);
          return;
        }
        if (usable && usable.id !== placement.keepId) usable = null;
        place = placement.third;
      }
      let chosen = usable;
      if (!chosen) {
        const created = clickEmpty(place);
        if (!created) return;
        chosen = { kind: 'point', id: created.id };
      }
      const ids = [...pending, chosen.id];
      if (tool === 'segment' && ids.length === 2) return finish(ids);
      if (tool === 'circle' && ids.length === 2) return finish(ids);
      if (tool === 'triangle' && ids.length === 3) return finish(ids);
      if (tool === 'parallelogram' && ids.length === 3) return finish(ids);
      if (tool === 'rectangle' && ids.length === 3) return finish(ids);
      if (tool === 'polygon') {
        // The ring closes when the first point is clicked again; that repeat is dropped
        // so the polygon keeps each vertex once.
        if (ids.length > 3 && chosen.id === ids[0]) return finish(ids.slice(0, -1));
        setPending(ids); return;
      }
      setPending(ids);
    }
    function idsInBox(box) {
      const state = boardRef.current;
      const hidden = exclusiveRimIds(state);
      const ids = [];
      for (const q of state.points) {
        if (!hidden.has(q.id) && pointInBox(q, box)) ids.push(q.id);
      }
      for (const e of state.elements) {
        // A text is one whole object, not a set of sides: the box takes it when the box
        // touches the writing, and deleting it removes the writing only.
        if (e.type === 'text') {
          if (boxesMeet(textBoxOf(e), box)) ids.push(e.id);
          continue;
        }
        if (e.type === 'circle') {
          const center = state.points.find((item) => item.id === e.centerPointId);
          const rim = state.points.find((item) => item.id === e.radiusPointId);
          if (center && rim && circleHitsBox(center, Math.hypot(rim.x - center.x, rim.y - center.y), box)) ids.push(e.id);
          continue;
        }
        const pts = e.points.map((id) => state.points.find((item) => item.id === id));
        if (pts.some((item) => !item)) continue;
        const closed = closedShape(e.type);
        for (let i = 0; i + 1 < pts.length; i++) {
          if (!segmentHitsBox(pts[i], pts[i + 1], box)) continue;
          const key = closed ? edgeKey(e.id, i) : e.id;
          if (!ids.includes(key)) ids.push(key);
        }
        if (closed && pts.length > 2 && segmentHitsBox(pts.at(-1), pts[0], box)) {
          const key = edgeKey(e.id, pts.length - 1);
          if (!ids.includes(key)) ids.push(key);
        }
      }
      return ids;
    }
    // A closed shape is fully selected when every edge is in the selection, which is how
    // drawing one leaves it. A segment is fully selected when the segment itself is.
    // A circle has no edges: its stroke stays a radius handle.
    function shapeFullySelected(element) {
      if (!element || element.type === 'circle') return false;
      if (element.type === 'segment') return selection.includes(element.id);
      if (!closedShape(element.type)) return false;
      return element.points.every((_, index) => selection.includes(edgeKey(element.id, index)));
    }
    function translationIds() {
      const state = boardRef.current;
      const ids = [];
      for (const element of state.elements) {
        if (!shapeFullySelected(element)) continue;
        const refs = element.points || [];
        for (const id of refs) {
          if (state.points.find((p) => p.id === id)?.kind === 'free' && !ids.includes(id)) ids.push(id);
        }
      }
      return ids;
    }
    // The model parses an edge key, so a selection this page drew and a deletion the model
    // runs can never disagree about which side was meant.
    const edgeOf = (target) => (target?.kind === 'edge' ? G.parseEdgeKey(boardRef.current, target.id) : null);
    // One selected edge resizes. The whole shape, once every edge is selected, does not.
    function resizeHandle(target) {
      if (!target || target.kind === 'point') return null;
      const state = boardRef.current;
      const edge = edgeOf(target);
      if (edge) {
        if (!selection.includes(target.id) || shapeFullySelected(edge.element)) return null;
        // The gesture keeps the selection key the student pressed: the model parses it back
        // into the same element and side, so the view never rebuilds an id of its own.
        return { kind: 'edge', id: target.id, index: edge.index, selectionId: target.id };
      }
      const element = state.elements.find((e) => e.id === target.id);
      if (!element || !selection.includes(element.id)) return null;
      if (element.type === 'circle') {
        const rim = state.points.find((q) => q.id === element.radiusPointId);
        if (!rim || rim.kind !== 'free') return null;
        return { kind: 'radius', id: rim.id, selectionId: element.id };
      }
      if (element.type === 'segment') return { kind: 'edge', id: target.id, index: 0, selectionId: element.id };
      return null;
    }
    function pointerDown(event) {
      if (event.button !== 0 || !ready || !editable()) return;
      const p = localPoint(event);
      const target = hitTest(p);
      const pointId = event.target.closest?.('[data-point]')?.getAttribute('data-point');
      if (tool === 'text') {
        // Clicking a text with the text tool edits it; clicking empty canvas starts a
        // new one whose left baseline sits at the click.
        if (target?.kind === 'text') { selectUser([target.id]); openText(target.id); }
        else openText(null, { x: Math.max(24, Math.min(width - 24, p.x)), y: Math.max(G.bounds.margin + TEXT_SIZE, p.y) });
        event.preventDefault();
        return;
      }
      if (tool === 'select') {
        if (target?.kind === 'caption') {
          // The note card opens for this shape; select it when the card closes so the
          // selection bar still means "the selected shape".
          const shape = board.elements.find((e) => e.id === target.id);
          requestOverlay({
            kind: 'note', selectOnClose: target.id,
            target: shape ? { id: shape.id, label: `${t(shape.type)} · ${t('hasNote')}` } : null,
          });
          practiceEvent({ type: 'open-caption', id: target.id });
          setHit(null);
          event.preventDefault();
          return;
        }
        if (target?.kind === 'text') {
          const item = boardRef.current.elements.find((e) => e.id === target.id);
          if (item) {
            selectUser([item.id]);
            gesture.current = { kind: 'text', id: item.id, start: p, base: { x: item.x, y: item.y }, pointer: event.pointerId, moved: false };
            setPreview({ text: { id: item.id, x: item.x, y: item.y } });
            setMarquee(null);
            event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
            return;
          }
        }
        const hidden = exclusiveRimIds(boardRef.current);
        const q = pointId && !hidden.has(pointId) ? pointById(pointId) : null;
        if (q) {
          const moving = translationIds();
          const onSelectedShape = boardRef.current.elements.some((element) =>
            shapeFullySelected(element) && (element.points || []).includes(q.id));
          // A derived corner is not in translationIds; the free points carry it.
          if (moving.length && onSelectedShape && (q.kind !== 'free' || moving.includes(q.id))) {
            gesture.current = { kind: 'translate', ids: moving, narrow: [q.id], start: p, base: boardRef.current, pointer: event.pointerId, moved: false };
            setPreview(null);
            setMarquee(null);
            event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
            return;
          }
          if (q.kind === 'free') {
            if (!selection.includes(q.id)) selectUser([q.id]);
            gesture.current = { kind: 'drag', id: q.id, start: p, base: boardRef.current, pointer: event.pointerId, moved: false };
            setPreview({ id: q.id, x: q.x, y: q.y });
            setMarquee(null);
            event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
            return;
          }
        }
        const whole = edgeOf(target);
        if (whole && shapeFullySelected(whole.element)) {
          const moving = translationIds();
          if (moving.length) {
            gesture.current = { kind: 'translate', ids: moving, narrow: [target.id], start: p, base: boardRef.current, pointer: event.pointerId, moved: false };
            setPreview(null);
            setMarquee(null);
            event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
            return;
          }
        }
        // A segment's stroke is the element, not an edge. Once the segment is fully
        // selected, that stroke translates the group; a later endpoint drag changes length.
        if (target?.kind === 'element') {
          const element = boardRef.current.elements.find((item) => item.id === target.id);
          if (element?.type === 'segment' && shapeFullySelected(element)) {
            const moving = translationIds();
            if (moving.length) {
              gesture.current = { kind: 'translate', ids: moving, narrow: [element.id], start: p, base: boardRef.current, pointer: event.pointerId, moved: false };
              setPreview(null);
              setMarquee(null);
              event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
              return;
            }
          }
        }
        const handle = resizeHandle(target);
        if (handle?.kind === 'radius') {
          const rim = boardRef.current.points.find((item) => item.id === handle.id);
          selectUser([handle.selectionId]);
          gesture.current = { kind: 'drag', id: rim.id, start: p, base: boardRef.current, pointer: event.pointerId, moved: false };
          setPreview({ id: rim.id, x: rim.x, y: rim.y });
          setMarquee(null);
          event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
          return;
        }
        if (handle?.kind === 'edge') {
          selectUser([handle.selectionId]);
          gesture.current = { kind: 'edge', id: handle.id, index: handle.index, start: p, base: boardRef.current, pointer: event.pointerId, moved: false };
          setPreview(null);
          setMarquee(null);
          event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
          return;
        }
        if (target) {
          selectUser([target.id]);
          event.preventDefault();
          return;
        }
        // Empty press starts a marquee. A click with no drag clears the selection on release.
        gesture.current = { kind: 'marquee', start: p, current: p, pointer: event.pointerId, moved: false };
        event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId);
        return;
      }
      if (target?.kind === 'point') usePoint(target, p);
      else if (target) usePoint(null, p);
      else usePoint(null, snapTo(p));
      event.preventDefault();
    }
    function pointerMove(event) {
      if (!editable()) return;
      const p = localPoint(event);
      const g = gesture.current;
      if (g && g.pointer === event.pointerId) {
        if (Math.abs(p.x - g.start.x) + Math.abs(p.y - g.start.y) < 3 && !g.moved) return;
        g.moved = true;
        if (g.kind === 'marquee') {
          g.current = p;
          setMarquee({ x1: g.start.x, y1: g.start.y, x2: p.x, y2: p.y });
          return;
        }
        // The drag previews the position the model accepts; release is the only undo step.
        if (g.kind === 'edge' || g.kind === 'translate') {
          g.point = p;
          const accepted = g.kind === 'translate'
            ? G.constrainedTranslate(g.base, g.ids, p.x - g.start.x, p.y - g.start.y)
            : G.constrainedEdgeMove(g.base, g.id, g.index, p.x - g.start.x, p.y - g.start.y);
          if (accepted) {
            // The model stops an edge short of a degenerate shape. Release commits where
            // the drag actually got to, not the pointer, so the shape does not jump past
            // the stop it was just held at.
            g.accepted = accepted.landed;
            setPreview({ corners: accepted.corners, rims: accepted.rims });
          }
          return;
        }
        if (g.kind === 'text') {
          // The text follows the pointer, clamped to the board: no geometry depends on it.
          const x = Math.max(0, Math.min(width, g.base.x + p.x - g.start.x));
          const y = Math.max(G.bounds.margin + 16, Math.min(height - G.bounds.margin, g.base.y + p.y - g.start.y));
          setPreview({ text: { id: g.id, x, y } });
          return;
        }
        const accepted = G.constrainedMove(g.base, g.id, p.x, p.y);
        if (accepted) setPreview({ id: g.id, ...accepted });
        return;
      }
      if (tool !== 'select') setHover(snapTo(p));
      // Only a caption needs a live hit for its hover colour; shapes already highlight
      // through their own pressed state.
      if (tool === 'select') {
        const next = hitTest(p);
        setHit((old) => (next?.kind === 'caption'
          ? (old?.kind === 'caption' && old.id === next.id ? old : next)
          : null));
      }
    }
    function pointerEnd(event, cancelled = false) {
      if (!editable()) return;
      const g = gesture.current;
      if (!g || g.pointer !== event.pointerId) return;
      gesture.current = null;
      if (g.kind === 'marquee') {
        setMarquee(null);
        if (cancelled || !g.moved) { selectUser([]); return; }
        selectUser(idsInBox(boxFrom(g.start, g.current || g.start)));
        return;
      }
      if (g.kind === 'edge' || g.kind === 'translate') {
        const end = g.point;
        setPreview(null);
        if (cancelled || !g.moved || !end) {
          if (!cancelled && g.narrow) selectUser(g.narrow);
          return;
        }
        if (g.kind === 'translate') action({ type: 'translate', ids: g.ids, dx: end.x - g.start.x, dy: end.y - g.start.y });
        else {
          const landed = g.accepted || { dx: end.x - g.start.x, dy: end.y - g.start.y };
          action({ type: 'moveEdge', id: g.id, index: g.index, dx: landed.dx, dy: landed.dy });
        }
        return;
      }
      if (g.kind === 'text') {
        const placed = preview?.text;
        setPreview(null);
        if (cancelled || !g.moved || !placed) return;
        action({ type: 'moveText', id: g.id, x: placed.x, y: placed.y });
        return;
      }
      const shown = preview;
      setPreview(null);
      if (cancelled || !g.moved || !shown) return;
      const before = boardRef.current;
      const next = action({ type: 'movePoint', id: g.id, x: shown.x, y: shown.y });
      if (!next) return;
      const origin = before.points.find((point) => point.id === g.id);
      const landed = next.points.find((point) => point.id === g.id);
      // A press that stays put, and any host or system change, is not a drag.
      if (origin && landed && (origin.x !== landed.x || origin.y !== landed.y)) {
        practiceEvent({ type: 'move', before, after: next, id: g.id });
      }
    }
    function deleteSelection() {
      if (!editable()) return;
      if (!selection.length) return;
      const ids = selection.slice();
      const before = boardRef.current;
      const next = action({ type: 'delete', ids });
      if (next && boardRef.current !== before) practiceEvent({ type: 'delete', before, after: boardRef.current, ids });
      setSelection([]);
    }
    function requestOverlay(next) {
      if (!editable()) return;
      setOverlay(next);
    }
    function dismissOverlay() {
      const seq = overlay?.selectOnClose;
      if (seq) setSelection([seq]);
      requestOverlay(null);
    }
    function cancelDrawing() {
      if (!editable()) return;
      const live = boardRef.current;
      const ids = constructionPoints.current.filter((id) => {
        const point = live.points.find((item) => item.id === id);
        if (!point || point.kind !== 'free') return false;
        return !live.elements.some((el) =>
          (el.points || []).includes(id) || el.centerPointId === id || el.radiusPointId === id);
      });
      forgetConstruction();
      setPending([]);
      setHover(null);
      setTool('select');
      if (ids.length) action({ type: 'delete', ids });
    }
    React.useEffect(() => {
      if (!tabActive) return undefined;
      const onKey = (event) => {
        if (event.target?.closest?.('.eb-teacher-reference')) return;
        if (event.key === 'Delete' || event.key === 'Backspace') {
          if (!selection.length || overlay || rename || writing) return;
          const tag = event.target?.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.target?.isContentEditable) return;
          event.preventDefault();
          deleteSelection();
          return;
        }
        if (event.key !== 'Escape') return;
        // An open panel is the current operation; Escape dismisses it first.
        const noteHeld = false;
        if (overlay && !noteHeld) { event.preventDefault(); dismissOverlay(); }
        if (rename) { event.preventDefault(); setRename(null); }
        if (writing) { event.preventDefault(); setWriting(null); }
        if (moreOpen) { event.preventDefault(); setMoreOpen(false); }
        if (noteHeld || overlay || rename || writing || moreOpen) return;
        if (gesture.current) {
          event.preventDefault();
          gesture.current = null;
          setPreview(null);
          setMarquee(null);
          return;
        }
        // An unfinished shape, or a drawing tool that has not placed anything yet.
        if (pending.length || tool !== 'select') {
          event.preventDefault();
          cancelDrawing();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }, [tabActive, overlay, rename, writing, moreOpen, pending, tool, selection]);
    function applyNote() {
      if (!editable()) return;
      const value = noteRef.current?.value ?? '';
      const target = noteCardTarget;
      const before = boardRef.current;
      // G16: a selected point or element must not capture the whole-board note.
      if (props.practice && target && practiceRef.current.snapshot().goal?.step === 'edit-board-note') {
        setOverlay(null);
        return;
      }
      // A caption is 1–20 characters. A longer or empty save must not replace the
      // short note: the saved goal would then fail to load.
      if (props.practice && overlay?.target && practiceRef.current.snapshot().goal?.step === 'edit-caption'
        && !shared.visibleCaption?.(value)) {
        setOverlay(null);
        return;
      }
      const command = target
        ? { type: 'annotate', target: target.kind, id: target.id, value }
        : { type: 'note', value };
      action(command);
      if (boardRef.current !== before) {
        practiceEvent({
          type: command.type, before, after: boardRef.current, action: command,
          target: target ? target.kind : 'board', id: target?.id, ids: target ? [target.id] : [],
          via: overlay?.target ? 'caption' : undefined,
        });
      }
      if (overlay?.selectOnClose) setSelection([overlay.selectOnClose]);
      setOverlay(null);
    }
    function applyRename() {
      if (!editable()) return;
      const value = nameRef.current?.value ?? '';
      const before = boardRef.current;
      const id = rename?.id;
      if (rename) action({ type: 'renamePoint', id, label: value });
      if (id && boardRef.current !== before) practiceEvent({ type: 'renamePoint', before, after: boardRef.current, id, label: value });
      setRename(null);
    }
    // Writing is the one editor a text has: a new one is created on save, an existing
    // one is rewritten in place. An empty save adds nothing and changes nothing.
    function openText(id = null, at = null) {
      if (!editable()) return;
      const item = id ? boardRef.current.elements.find((e) => e.id === id) : null;
      setWriting({ id: item ? item.id : null, value: item ? item.text : '', x: at?.x, y: at?.y });
    }
    function applyText() {
      if (!editable()) return;
      const value = (textRef.current?.value ?? '').trim();
      if (!value) { setWriting(null); return; }
      const before = boardRef.current;
      if (writing?.id) {
        action({ type: 'editText', id: writing.id, text: value });
        if (boardRef.current !== before) practiceEvent({ type: 'editText', before, after: boardRef.current, id: writing.id });
      } else if (writing) {
        const next = action({ type: 'addText', x: writing.x, y: writing.y, text: value });
        const created = next?.elements.filter((e) => e.type === 'text' && !before.elements.some((old) => old.id === e.id)).at(-1);
        if (created) setSelection([created.id]);
        if (created && boardRef.current !== before) practiceEvent({ type: 'addText', before, after: boardRef.current, id: created.id });
      }
      setWriting(null);
      setTool('select');
    }
    // "Add to answer" places only the geometry snapshot and the student's own words.
    // The composer keeps whatever it already held, and a failed insert leaves nothing behind.
    function insertGeometry() {
      if (!ready) return;
      if (!editable()) return;
      if (guideMode) { setStatus(t('practiceInsertBlocked')); return; }
      if (props.practice) {
        practiceEvent({type:'insert',after:boardRef.current});
        setStatus(t('geometryPracticeInsert')); return;
      }
      const conversation = ctx.get('conversation');
      let drafts = [];
      const discard = () => {
        for (const draft of drafts) {
          try { props.inputActions?.removeAttachment?.(draft.id); } catch { /* composer may be locked */ }
        }
        drafts = [];
      };
      try {
        // An explicit guard, not a bare throw: the composer must be able to take a draft,
        // and the same catch below rolls the whole insert back when it cannot.
        if (!conversation?.createDrafts || !props.inputActions) throw new Error('The composer cannot take a geometry attachment');
        // The board note is the student's own words; it goes into the composer verbatim.
        const note = boardRef.current.note || '';
        const file = new File([G.serialize(boardRef.current)], t('geometryAttachmentName'), { type: 'application/json' });
        drafts = conversation.createDrafts(props.sessionId, [file]);
        if (!props.inputActions.addAttachments(drafts.map((draft) => draft.id))) {
          throw new Error('The composer refused the geometry attachment');
        }
        if (note.trim()) props.inputActions.insertText(`\n${note}\n`, props.inputActions.captureInsertion());
        props.inputActions.persistDraft();
        setStatus(t(note.trim() ? 'insertedNote' : 'inserted'));
        props.close?.();
      } catch {
        discard();
        setStatus(t('insertFailed'));
      }
    }
    // Files use the pickers both tabs share; this page only supplies its own JSON, its
    // draft and its sentences. Its remembered handle key is separate, so each mode
    // resumes from its own last file.
    function loadOpenedFile(file) {
      return (async () => {
        // Validation runs before anything is published: a bad file changes nothing.
        const next = G.validate(JSON.parse(await file.text()));
        if (!editable() || props.practice || guideMode) return;
        forgetConstruction();
        publish(next); setHistory({ past: [], future: [] }); setSelection([]); setPending([]);
        revision.current += 1;
        setStatus(t('imported'));
      })();
    }
    function importFailure(error) {
      // Only a file from the other board is named; everything else stays a plain failure.
      if (error?.message === t('fileTooLarge')) return t('fileTooLarge');
      if (error?.message === 'Another board kind') return t('otherBoardFile');
      return t('geometryImportFailed');
    }
    const picker = shared.createBoardFilePicker({
      React, t, dbName: 'baicai-edu-math-board', handleKey: 'last-geometry-board-file',
      attachmentKey: 'geometryAttachmentName',
      read: () => G.serialize(boardRef.current),
      load: loadOpenedFile,
      // An open that outlives an edit must not replace the draft the student has moved on to.
      stale: (rev) => !editable() || props.practice || rev !== revision.current,
      describe: importFailure,
    });
    const fileInputRef = picker.fileInputRef;
    // The remembered last file is read once this page is interactive, so a reopen starts
    // at the student's own file.
    React.useEffect(() => { if (!props.practice) picker.rememberName(); }, []);
    // The shared picker reports outcomes; this page shows them in its own status line.
    const report = (result) => {
      if (result?.message) setStatus(result.message);
    };
    function practiceFiles() {
      return Boolean(props.practice && practiceRef.current?.snapshot().current === 'geometry-files');
    }
    // Practice files read and write the practice board only. The shared picker is not
    // called: it reuses fileHandleRef, startIn, and the real geometry IndexedDB key.
    async function loadPracticeFile(file) {
      if (!file) return;
      if (file.size > 262144) { setStatus(t('fileTooLarge')); return; }
      let next;
      try { next = G.validate(JSON.parse(await file.text())); }
      catch (error) {
        setStatus(error?.message === 'Another board kind' ? t('otherBoardFile') : `${t('failed')}: ${error.message}`);
        return;
      }
      const before = boardRef.current;
      if (JSON.stringify(before) === JSON.stringify(next)) return;
      forgetConstruction();
      publish(next);
      setHistory({ past: [], future: [] });
      setSelection([]);
      setPending([]);
      setStatus(t('practiceFileLoaded'));
      practiceEvent({ type: 'open', before, after: next });
    }
    async function savePracticeFile() {
      setStatus('');
      const text = G.serialize(boardRef.current);
      const savePicker = typeof window !== 'undefined' ? window.showSaveFilePicker : undefined;
      if (typeof savePicker === 'function') {
        try {
          const handle = await savePicker({ suggestedName: t('geometryAttachmentName'), types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
          if (!handle || typeof handle.createWritable !== 'function') throw Object.assign(new Error('refused'), { name: 'NotAllowedError' });
          const writable = await handle.createWritable();
          await writable.write(text);
          await writable.close();
          setStatus(t('practiceFileSaved'));
          practiceEvent({ type: 'save', via: 'handle', text });
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }
      const anchor = picker.downloadAnchorRef.current;
      if (!anchor || typeof anchor.click !== 'function') return;
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      anchor.href = url;
      anchor.download = t('geometryAttachmentName');
      anchor.click();
      setStatus(t('practiceFileDownloaded'));
      practiceEvent({ type: 'save', via: 'download', text });
    }
    async function openPracticeFile() {
      setStatus('');
      const openPicker = typeof window !== 'undefined' ? window.showOpenFilePicker : undefined;
      if (typeof openPicker === 'function') {
        try {
          const handles = await openPicker({ multiple: false, types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
          const handle = handles && handles[0];
          if (!handle || typeof handle.getFile !== 'function') return;
          await loadPracticeFile(await handle.getFile());
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
          if (!['NotAllowedError', 'SecurityError', 'NotSupportedError'].includes(error?.name)) {
            setStatus(error?.message === 'Another board kind' ? t('otherBoardFile') : `${t('failed')}: ${error.message}`);
            return;
          }
        }
      }
      const input = fileInputRef.current;
      if (!input || typeof input.click !== 'function') return;
      input.click();
      setStatus(t('fileOpenFallback'));
    }
    const saveFile = () => {
      setMoreOpen(false);
      if (!editable()) return;
      if (props.practice || guideMode) {
        if (!practiceFiles()) { setStatus(t('practiceFilesUnavailable')); return; }
        return savePracticeFile();
      }
      return picker.saveFile().then(report);
    };
    const openFile = () => {
      setMoreOpen(false);
      if (!editable()) return;
      if (props.practice || guideMode) {
        if (!practiceFiles()) { setStatus(t('practiceFilesUnavailable')); return; }
        return openPracticeFile();
      }
      return picker.openFile({ revision: revision.current }).then(report);
    };
    const importInput = (event) => {
      if (!editable()) return;
      if (props.practice || guideMode) {
        if (!practiceFiles()) return;
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;
        return loadPracticeFile(file);
      }
      return picker.importInput(event, { revision: revision.current }).then(report);
    };
    function clearMode() {
      // Clearing this mode resets the geometry canvas and its undo history only.
      forgetConstruction();
      if (!editable()) return;
      const before = boardRef.current;
      const after = G.empty();
      const nonempty = before.points.length > 0 || before.elements.length > 0 || Boolean(String(before.note || '').trim());
      publish(after);
      setHistory({ past: [], future: [] });
      setSelection([]); setPending([]); setOverlay(null);
      setStatus(t('geometryClearDone'));
      if (nonempty) practiceEvent({ type: 'clear', before, after });
    }

    // The drag preview is whatever the model computed: the dragged point, the rim points a
    // centre drag carries, and the corners a quadrilateral drag moves. The view only draws.
    const at = (id) => {
      const q = pointById(id);
      if (!q) return null;
      if (preview?.rims?.[id]) return preview.rims[id];
      if (preview?.id === id) return { x: preview.x, y: preview.y };
      const corner = preview?.corners?.find((c) => c.id === id);
      if (corner) return { x: corner.x, y: corner.y };
      return { x: q.x, y: q.y };
    };
    function selectedEdgeIndexes(elementId) {
      const indexes = [];
      for (const item of selection) {
        const edge = G.parseEdgeKey(boardRef.current, item);
        if (edge?.element.id === elementId) indexes.push(edge.index);
      }
      return indexes;
    }
    // A text is written, not drawn: its anchor is its left baseline and it takes no
    // part in point snapping or edge selection. The model owns the box estimate.
    function renderText(e) {
      const anchor = { x: e.x, y: e.y };
      const drag = preview?.text?.id === e.id ? preview.text : anchor;
      const picked = selection.includes(e.id);
      const lines = e.text.split('\n');
      const box = G.textBox(lines);
      return h('g', {
        key: e.id, 'data-element': e.id, 'data-text': e.id, role: 'button', tabIndex: 0,
        'aria-label': `${t('text')}: ${e.text}`, 'aria-pressed': picked,
        style: { cursor: 'move' },
        onKeyDown: (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          setSelection([e.id]);
        },
      },
      picked && h('rect', {
        x: drag.x - 4, y: drag.y - TEXT_SIZE - 3, width: box.width, height: box.height,
        rx: 5, fill: '#2563EB14', stroke: controls.selection,
        strokeWidth: 1, strokeDasharray: '4 3', pointerEvents: 'none',
      }),
      h('text', {
        x: drag.x, y: drag.y, fontSize: TEXT_SIZE, fill: picked ? controls.selection : controls.ink,
        stroke: '#FFFFFF', strokeWidth: 3, paintOrder: 'stroke', pointerEvents: 'none',
      }, lines.map((line, index) => h('tspan', {
        key: index, x: drag.x, dy: index === 0 ? 0 : TEXT_LINE,
      }, line))));
    }
    // The sides of a selected shape, drawn over its own outline.
    function highlightedEdges(e, indexes) {
      const points = e.points.map(at);
      return indexes.map((index) => {
        const a = points[index], b = points[(index + 1) % points.length];
        if (!a || !b) return null;
        return h('line', {
          key: `edge-${index}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          stroke: controls.selection, strokeWidth: 3, strokeLinecap: 'round', pointerEvents: 'none',
        });
      }).filter(Boolean);
    }
    function renderElement(e) {
      if (e.type === 'text') return renderText(e);
      const picked = selection.includes(e.id);
      const edgeIndexes = selectedEdgeIndexes(e.id);
      // A note longer than a caption is not drawn beside the shape, so the shape does not
      // claim one; the note card still holds it.
      const caption = shared.captionPosition?.(e, at, { width, height }) || null;
      const label = `${t(e.type)}${e.role === 'auxiliary' ? ` · ${t('auxiliary')}` : ''}${caption ? ` · ${t('hasNote')}` : ''}`;
      const group = {
        key: e.id, 'data-element': e.id, role: 'button', tabIndex: 0, 'aria-label': label,
        'aria-pressed': picked || edgeIndexes.length > 0,
        onKeyDown: (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          if (closedShape(e.type)) setSelection(e.points.map((_, index) => edgeKey(e.id, index)));
          else setSelection([e.id]);
        },
      };
      // The shape and its caption are drawn once, by the shared node, from the same caption
      // box the hit test uses; this page only adds what belongs to it: the group and the
      // highlighted sides of a selection.
      const shape = shared.geometryShapeNode(h, e, at, controls, {
        stroke: { active: picked }, caption, captionBox: shared.captionBox?.(caption) ?? null,
        captionProps: { active: hit?.kind === 'caption' && hit.id === e.id, pickable: tool === 'select' },
      });
      if (!shape) return null;
      if (shape.shape !== 'polygon' || !edgeIndexes.length) return h('g', group, shape.node);
      // A polygon with highlighted sides: the outline, the tinted sides over it, and the
      // caption on top.
      return h('g', group, shape.primary, ...highlightedEdges(e, edgeIndexes), shape.caption);
    }
    function renderPoint(q) {
      const shown = at(q.id) || q;
      const picked = selection.includes(q.id), staged = pending.includes(q.id);
      const label = `${q.label}${q.kind === 'derived' ? ` · ${t('derivedPoint')}` : ''}${q.note ? ` · ${t('hasNote')}` : ''}`;
      return h('g', {
        key: q.id, 'data-point': q.id, role: 'button', tabIndex: 0, 'aria-label': label, 'aria-pressed': picked,
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelection([q.id]); }
          // An open overlay claims the keyboard: Delete must not reach the canvas.
          if (picker.overlayBlocksKey(overlay, event)) {
            event.preventDefault();
            return;
          }
          // Delete is handled for the whole selection on the document listener. Swallow
          // the key here so a focused point does not also navigate the browser back.
          if (event.key === 'Delete' || event.key === 'Backspace') event.preventDefault();
        },
      },
      h('circle', { cx: shown.x, cy: shown.y, r: 11, fill: 'transparent' }),
      h('circle', { cx: shown.x, cy: shown.y, ...shared.geometryPointDot(q, controls, {
        radius: staged ? 6 : picked ? 5.5 : 4, active: picked || staged,
      }) }),
      h('text', shared.geometryPointLabel({ x: shown.x, y: shown.y }, controls, { active: picked }), q.label));
    }
    function hintShape() {
      if (!pending.length) return null;
      const points = pending.map(at).filter(Boolean);
      if (!points.length || !hover) return null;
      const last = points.at(-1);
      if (tool === 'circle') return h('circle', { cx: last.x, cy: last.y, r: Math.hypot(hover.x - last.x, hover.y - last.y), ...previewStroke });
      if (tool === 'rectangle' && points.length >= 2) {
        const draft = G.rectanglePlacement(points[0], points[1], hover);
        if (!draft) return null;
        const ring = [points[0], points[1], draft.third, draft.fourth];
        return h('polygon', { points: pathOf(ring), ...previewStroke });
      }
      if (drawnInRun(tool)) return h('polyline', { points: pathOf([...points, hover]), ...previewStroke });
      return null;
    }
    // The preview stroke is the drawing's own stroke, told to look unfinished, so a new
    // shape and the parked one it becomes cannot be styled two different ways.
    const previewStroke = { ...shared.geometryStroke(null, controls), stroke: controls.preview, strokeWidth: 2, strokeDasharray: '5 4', 'pointer-events': 'none' };
    const hiddenRims = exclusiveRimIds(board);
    // `frame` expands the coordinate range as well as the paper. Both axes retain
    // one common scale, and labels/text outside the drawing area remain reachable.
    const origin = frame.origin;
    // Zoom is real: the canvas grows with the zoom and the frame scrolls to the rest of
    // the drawing, so nothing is cropped; a fit puts the whole board, reserve included,
    // inside the frame. `non-scaling-stroke` is deliberately not used: a magnified figure
    // must look magnified, exactly as the quantity board's zoom scales its artwork.
    const canvas = h('div', { ref: canvasRef, className: 'eb-canvas-scroll', 'data-tour-id': 'geometry-canvas',
      onScroll: props.practice || guideMode ? () => {
        const after = { left: canvasRef.current?.scrollLeft || 0, top: canvasRef.current?.scrollTop || 0 };
        const before = scrollRef.current;
        if (before.left !== after.left || before.top !== after.top) {
          scrollRef.current = after;
          practiceEvent({ type: 'scroll', before: { left: before.left, top: before.top }, after });
        }
        const next = practiceRef.current.saveFrame(practiceFrame());
        if (next.persistence !== progress.persistence) setProgress(next);
      } : undefined },
      h('svg', {
        ref: svgRef, className: `eb-artboard eb-geometry${grid ? ' eb-grid' : ''}`,
        style: { width: frame.box.width, height: frame.box.height },
        viewBox: `${origin.x} ${origin.y} ${frame.span.width} ${frame.span.height}`,
        preserveAspectRatio: 'xMidYMid meet',
        role: 'group', 'aria-label': t('geometryCanvas'),
        onPointerDown: pointerDown, onPointerMove: pointerMove,
        onPointerUp: (event) => pointerEnd(event), onPointerCancel: (event) => pointerEnd(event, true),
        onMouseLeave: () => { setHover(null); setHit(null); },
      },
      h('rect', { x: origin.x, y: origin.y, width: frame.span.width, height: frame.span.height, fill: '#FFFFFF' }),
      grid && h('g', { 'pointer-events': 'none' },
        Array.from({ length: Math.ceil(frame.span.width / 40) + 1 }, (_, i) => h('line', { key: `v${i}`, x1: i * 40, y1: origin.y, x2: i * 40, y2: origin.y + frame.span.height, stroke: '#EEF2F4' })),
        Array.from({ length: Math.ceil(frame.span.height / 40) + 1 }, (_, i) => h('line', { key: `h${i}`, x1: origin.x, y1: i * 40, x2: origin.x + frame.span.width, y2: i * 40, stroke: '#EEF2F4' }))),
      board.elements.filter((e) => e.type !== 'text').map(renderElement),
      board.elements.filter((e) => e.type === 'text').map(renderText),
      board.points.filter((q) => !hiddenRims.has(q.id)).map(renderPoint),
      marquee && h('rect', {
        x: Math.min(marquee.x1, marquee.x2), y: Math.min(marquee.y1, marquee.y2),
        width: Math.abs(marquee.x2 - marquee.x1), height: Math.abs(marquee.y2 - marquee.y1),
        fill: '#2563EB22', stroke: controls.selection, strokeWidth: 1, strokeDasharray: '4 3', pointerEvents: 'none',
      }),
      hintShape(),
      hover && !pending.length && tool !== 'select' && tool !== 'point'
        && h('circle', { cx: hover.x, cy: hover.y, r: 6, fill: '#BFDBFE', stroke: controls.selection, strokeWidth: 1.5, 'pointer-events': 'none' }),
      // Same place and type as the quantity canvas: 17/500 at y=190, 12 at y=216.
      !board.points.length && !board.elements.length && h('g', { pointerEvents: 'none' },
        h('text', { x: 400, y: 190, textAnchor: 'middle', fill: '#64748B', fontSize: 17, fontWeight: 500 }, t('geometryEmpty')),
        h('text', { x: 400, y: 216, textAnchor: 'middle', fill: '#64748B', fontSize: 12 }, t('geometryEmptyHint')))));

    // Midpoint is an action on one selected side, not a tool that drops new endpoints.
    // A segment is that side. A polygon, rectangle, or parallelogram is selected one
    // edge at a time; a circle has none. The control stays disabled until that side's
    // two free ends do not already have a midpoint.
    // One side's two ends. A segment is its own single side; any other shape is selected one
    // edge at a time, and the trailing index names that edge.
    function sideEnds(key) {
      const edge = G.parseEdgeKey(board, key);
      if (edge) return edge.points[0] !== edge.points[1] ? edge.points : null;
      const element = board.elements.find((item) => item.id === key);
      if (!element || element.type !== 'segment' || element.points.length !== 2) return null;
      return element.points;
    }
    // The model owns the two rules: the ends must be free points, and a side carries one
    // midpoint. The control only asks.
    function midpointTarget() {
      if (selection.length !== 1) return null;
      const ends = sideEnds(selection[0]);
      if (!ends) return null;
      const [a, b] = ends;
      const points = [a, b].map((id) => board.points.find((point) => point.id === id));
      if (points.some((point) => !point || point.kind !== 'free')) return null;
      return G.midpointOf(board, a, b) ? null : { a, b };
    }
    function markMidpoint() {
      const target = midpointTarget();
      if (!target) return;
      const { a, b } = target;
      const before = boardRef.current;
      const next = action({ type: 'addMidpoint', a, b });
      if (!next) return;
      const created = next.points.find((point) => point.construction?.op === 'midpoint'
        && point.construction.inputs[0] === a && point.construction.inputs[1] === b
        && !before.points.some((old) => old.id === point.id));
      if (!created) return;
      setSelection([created.id]);
      practiceEvent({ type: 'midpoint', before, after: next, a, b, id: created.id });
    }
    const toolButton = (name) => h('button', {
      key: name, type: 'button', className: 'eb-tool', title: t(name), 'aria-label': t(name),
      'aria-pressed': tool === name, onClick: () => chooseTool(name),
      'data-tour-id': name === 'point' || name === 'segment' ? `geometry-tool-${name}` : undefined,
    }, icon(name));
    const tools = h('aside', { className: 'eb-palette eb-geometry-tools', 'aria-label': t('geometryTools') },
      DRAW_TOOLS.map(toolButton),
      h('button', {
        type: 'button', className: 'eb-tool', title: t('midpoint'), 'aria-label': t('midpoint'),
        disabled: !midpointTarget(), onClick: markMidpoint,
      }, icon('midpoint')),
      h('button', {
        type: 'button', className: 'eb-tool eb-switch', role: 'switch', 'aria-checked': auxiliary,
        title: t('auxiliary'), 'aria-label': t('auxiliary'), onClick: () => {
          if (!editable()) return;
          const before = auxiliary;
          setAuxiliary(!before);
          practiceEvent({ type: 'auxiliary', before, after: !before });
        },
      }, h('span', { className: 'eb-switch-track', 'aria-hidden': true },
        h('span', { className: 'eb-switch-knob' })),
      h('span', { className: 'eb-label' }, t('auxiliary'))));
    const selectionBar = selection.length > 0 && h('div', { className: 'eb-floating', role: 'toolbar', 'aria-label': t('geometrySelectionActions') },
      h('small', null, `${t('selectedCount')} ${selection.length}`),
      singlePoint && h('button', { type: 'button', className: 'eb-context-action', onClick: () => setRename({ id: singlePoint.id, value: singlePoint.label }) }, t('renamePoint')),
      singleText && h('button', { type: 'button', className: 'eb-context-action', onClick: () => openText(singleText.id) }, icon('edit', 16), t('editText')),
      h('button', { type: 'button', className: 'eb-danger', onClick: deleteSelection }, icon('trash', 16), t('trash')));
    const stage = h('section', { className: 'eb-stage-wrap', 'aria-label': t('geometryCanvas') },
      props.question,
      h('div', { className: 'eb-stage-frame' }, canvas, selectionBar));
    // Same controls and the same dock order as the quantity tab. This tab drops creation
    // colours and the trace checkbox, and keeps grid and snap in that slot.
    const button = controls.button;
    // An icon button whose accessible name is the tool's own; the note and clear controls
    // pass their own words instead.
    function dockButton(name, handler, extra = {}) {
      return controls.iconButton(handler, extra.title ?? t(name), { icon: icon(name, 19), title: t(name), ...extra });
    }
    const modeToggle = (pressed, onLabel, offLabel, handler) => button(pressed ? t(onLabel) : t(offLabel), handler, {
      className: 'eb-mode-toggle', 'aria-pressed': pressed, title: pressed ? t(onLabel) : t(offLabel),
      'aria-label': pressed ? t(onLabel) : t(offLabel),
    });
    const noteHasText = Boolean(noteValue);
    const noteTitleTarget = overlay?.kind === 'note' ? noteCardTarget : noteTarget;
    const moreMenuNode = moreOpen && h('div', { className: 'eb-menu eb-more-menu', role: 'menu', 'aria-label': t('files') },
      h('div', { className: 'eb-menu-head' }, t('files')),
      controls.menuItem(icon('open'), t('import'), openFile),
      controls.menuItem(icon('save'), t('export'), saveFile),
      picker.fileNameState && h('p', { className: 'eb-menu-note' }, picker.fileNameState),
      !props.practice && !guideMode && practiceChapters.length > 0 && h(React.Fragment, null,
        h('div', { className: 'eb-menu-line' }),
        controls.menuItem(null, t('tutorialReplay'), () => startGeometryTour())));
    // The student dock, in the same order as the quantity tab: the one shared 返回对话,
    // the shared undo/redo icons, the tab's own toggles, the shared zoom pair, then the
    // note, clear, more and insert controls this tab owns.
    const dock = h('nav', { className: 'eb-dock', 'aria-label': t('canvasTools') },
      controls.backButton(closePage, { icon }),
      controls.divider(),
      dockButton('undo', undo, { disabled: !history.past.length }),
      dockButton('redo', redo, { disabled: !history.future.length, className: 'eb-icon-button eb-redo', title: t('redo') }),
      controls.divider(),
      modeToggle(grid, 'gridOn', 'gridOff', () => {
        if (!editable()) return;
        const before = grid;
        const after = !before;
        setGrid(after);
        if (before !== after) practiceEvent({ type: 'grid', before, after });
      }),
      modeToggle(snap, 'snapOn', 'snapOff', () => {
        if (!editable()) return;
        const before = snap;
        const after = !before;
        setSnap(after);
        if (before !== after) practiceEvent({ type: 'snap', before, after });
      }),
      controls.divider(),
      // A − or ＋ press is a request to enlarge or shrink what is on screen, so it leaves
      // the fit; 适应宽度 returns to it. Every page docks the same pair, from board-kit.
      ...controls.zoomPair({ zoom, fit, setFit: (nextFit, nextZoom) => {
        if (!editable()) return;
        if (nextZoom !== undefined && nextZoom !== zoom) practiceEvent({ type: 'zoom', before: zoom, after: nextZoom });
        if (nextFit !== fit) practiceEvent({ type: 'fit', before: fit, after: nextFit });
        setFit(nextFit);
        if (nextZoom !== undefined) setZoom(nextZoom);
      } }, { min: 1, max: 4 }),
      h('span', { className: 'eb-grow' }),
      controls.button(h(React.Fragment, null, icon('note', 19), noteHasText ? h('span', { className: 'eb-note-dot' }) : null), () => {
        requestOverlay({ kind: 'note' });
      }, {
        className: `eb-note-button${noteTarget ? ' eb-contextual' : ''}`,
        title: noteTarget ? `${t('note')} · ${noteTarget.label}` : `${t('note')} · ${t('noteGeneral')}`,
        'aria-label': t('note'), 'data-tour-id': 'geometry-note',
      }),
      dockButton('clear', () => requestOverlay({ kind: 'clear' }), { className: 'eb-icon-button eb-danger', title: t('clearGeometry') }),
      controls.moreMenu(moreOpen, () => setMoreOpen(!moreOpen), icon('more', 19)),
      button(h(React.Fragment, null, icon('insert', 17), h('span', null, t('insert'))), () => insertGeometry(), {
        className: 'eb-primary', title: t('insert'), 'aria-label': t('insert'), 'data-tour-id': 'geometry-insert',
        disabled: !props.practice && (phase !== 'plain' || (!board.points.length && !board.elements.length && !board.note)),
      }));
    const overlayNode = overlay && h('div', { className: 'eb-overlay', onPointerDown: (event) => { if (event.target === event.currentTarget) dismissOverlay(); } },
      h('div', {
        className: `eb-overlay-card eb-overlay-${overlay.kind}`, role: 'dialog', 'aria-modal': 'true',
        'data-tour-id': overlay.kind === 'note' ? 'geometry-note-panel' : undefined,
      },
        overlay.kind === 'note' && h(React.Fragment, null,
          h('h2', null, t('note')),
          h('p', { className: 'eb-overlay-context' }, noteTitleTarget ? `${t('noteAbout')} ${noteTitleTarget.label}` : t('noteGeneral')),
          h('textarea', { ref: noteRef, maxLength: 500, defaultValue: noteCardValue, placeholder: t('noteHint') }),
          h('div', { className: 'eb-overlay-actions' },
            h('button', { type: 'button', onClick: dismissOverlay }, t('cancel')),
            h('button', { type: 'button', className: 'eb-primary', onClick: applyNote }, t('save')))),
        overlay.kind === 'clear' && h(React.Fragment, null,
          h('h2', null, t('clearGeometry')),
          h('p', { className: 'eb-muted' }, t('geometryClearQuestion')),
          h('div', { className: 'eb-overlay-actions' },
            h('button', { type: 'button', onClick: dismissOverlay }, t('cancel')),
            h('button', { type: 'button', className: 'eb-primary eb-danger-solid', onClick: clearMode }, t('confirmClear'))))));
    const renameNode = rename && h('div', { className: 'eb-overlay' },
      h('div', { className: 'eb-overlay-card eb-overlay-name', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('renamePoint') },
        h('h2', null, t('renamePoint')),
        h('input', { ref: nameRef, type: 'text', maxLength: 30, defaultValue: rename.value,
          onKeyDown: (event) => { if (event.key === 'Enter') applyRename(); } }),
        h('div', { className: 'eb-overlay-actions' },
          h('button', { type: 'button', onClick: () => setRename(null) }, t('cancel')),
          h('button', { type: 'button', className: 'eb-primary', onClick: applyRename }, t('apply')))));
    const writingNode = writing && h('div', { className: 'eb-overlay' },
      h('div', { className: 'eb-overlay-card eb-overlay-text', role: 'dialog', 'aria-modal': 'true', 'aria-label': writing.id ? t('editText') : t('addText') },
        h('h2', null, writing.id ? t('editText') : t('addText')),
        h('textarea', {
          ref: textRef, maxLength: G.TEXT_MAX, defaultValue: writing.value, placeholder: t('textHint'),
          rows: 3,
          onKeyDown: (event) => {
            // Enter writes a new line; the buttons save, so a text can carry two lines.
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); applyText(); }
          },
        }),
        h('div', { className: 'eb-overlay-actions' },
          h('button', { type: 'button', onClick: () => { setWriting(null); setTool('select'); } }, t('cancel')),
          h('button', { type: 'button', className: 'eb-primary', onClick: applyText }, t('save')))));
    const statusNode = controls.status(status);
    const practiceChapter = practiceChapters.find((item) => item.id === progress?.current);
    const practiceTitleKey = practiceChapter?.titleKey || 'geometryPracticeBasics';
    function confirmGuideView() {
      const goal = practiceRef.current?.snapshot().goal;
      if (!guideMode || goal?.step !== 'demo-return') return;
      if (props.guideLiveId !== goal.figureId) { setStatus(t('teacherDemoFigureUnavailable')); return; }
      if (!(boardRef.current.elements?.length > 0)) return;
      setProgress(practiceRef.current.observe({ type: 'view-copy', figureId: goal.figureId }, practiceFrame()));
    }
    const practiceCoach = props.practice && h('section', {className:'eb-practice-coach', 'aria-label':t(practiceTitleKey),
      'data-practice-step':practiceState?.step},
      h('div',{role:'status','aria-live':'polite'},h('strong',null,t(practiceTitleKey)),
        h('p',null,t(practiceState?.completed && progress.chapters.find(c=>c.id===progress.current)?.status!=='completed'
          ? 'practiceSkippedEnd' : `geometryPracticeGoal_${practiceState?.step || 'point'}`)),
        PracticeNavigation && progress?.goal && h(PracticeNavigation,{progress,chapters:practiceChapters,onNavigate:navigatePractice})),
      button(t('practiceExit'),()=>props.onPracticeExit(),{className:'eb-practice-exit'}));
    const guideCoach = guideMode && h('section', {
      className: 'eb-practice-coach', 'aria-label': t('teacherDemoPractice'), 'data-practice-step': practiceState?.step,
    },
    h('div', { role: 'status', 'aria-live': 'polite' },
      h('strong', null, t('teacherDemoPractice')),
      h('p', null, props.guideLiveId !== practiceState?.figureId
        ? t('teacherDemoFigureUnavailable')
        : t(`teacherDemoPracticeGoal_${practiceState?.step || 'demo-return'}`))),
    practiceState?.step === 'demo-return' && props.guideLiveId === practiceState?.figureId
      && button(t('teacherDemoViewCopy'), confirmGuideView, { className: 'eb-primary' }),
    button(t('practiceExit'), () => props.onGuideExit?.(), { className: 'eb-practice-exit' }));
    if (props.bindClose && !guideMode) props.bindClose(practiceOpen ? () => {setPracticeOpen(false);props.close?.();} : closePage);
    if (props.bindAppend && !props.practice && !guideMode) props.bindAppend(appendFigure);
    const guideApi = !guideMode && typeof props.guide === 'function' ? props.guide() : null;
    return h(React.Fragment, null,
      h('div',{className:'eb-geometry-owner',hidden:practiceOpen || guideShown}, practiceCoach, guideCoach, h('div', {
        className: 'eb-workspace eb-geometry-workspace', ref: workspaceRef,
        onKeyDown: (event) => {
          // An open overlay owns the keyboard, so the shortcuts below never fire under it.
          if (overlay || writing) return;
          // Undo/redo shortcuts work from anywhere inside the geometry tab.
          if (!(event.metaKey || event.ctrlKey)) return;
          if (event.key === 'z' || event.key === 'Z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
          if (event.key === 'y' || event.key === 'Y') { event.preventDefault(); redo(); }
        },
      }, tools, stage, dock, moreMenuNode, statusNode, overlayNode, renameNode, writingNode),
      h('a', { hidden: true, ref: picker.downloadAnchorRef, download: t('geometryAttachmentName'),
        'data-practice-file': props.practice ? 'geometry' : undefined }),
      h('input', { hidden: true, type: 'file', accept: '.json,application/json', ref: fileInputRef, onChange: importInput,
        'data-practice-file': props.practice ? 'geometry' : undefined })),
      practiceOpen && h(PracticeBoard,{...props,practice:true,onPracticeExit:()=>setPracticeOpen(false),bindAppend:undefined,guide:undefined,guideMode:false}),
      guideShown && !practiceOpen && guideApi?.progress && h(GuideBoard, {
        ...props, guide: undefined, guideMode: true, practice: false,
        guideProgress: guideApi.progress, guideLiveId: guideApi.liveId,
        onGuideExit: () => { setGuideShown(false); guideApi.close?.(); },
        bindAppend: undefined, bindClose: undefined, tabActive: true,
      }));
  }
  function PracticeBoard(props) { return Board(props); }
  function GuideBoard(props) { return Board(props); }
  return Board;
}
