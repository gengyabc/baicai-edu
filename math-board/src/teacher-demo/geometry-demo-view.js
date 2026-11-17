import { createDemoModel } from './demo-model.js';

/** Parse a projection view. Invalid or missing projections show an empty demo tab. */
export function readDemoView(geometry, view) {
  if (view == null) return null;
  try { return createDemoModel(geometry).validateView(view); } catch { return null; }
}

/**
 * Read-only teacher geometry page. Everything it draws with (dock controls, icons, the
 * caption box and point labels, the shape node, the framing, the hidden radius handles,
 * the stroke and the colours) comes from `shared`; build.mjs inlines this factory with
 * toString().
 */
export function createGeometryDemoPage(React, G, t, shared) {
  const h = React.createElement;
  const controls = shared.createBoardControls(React, t);
  const icon = shared.createBoardIcons(React);
  const PracticeRail = shared.createPracticeRail?.(React, t);
  const practiceFrames = shared.createGeometryPracticeFrames?.(G);
  const chapter = typeof shared.createTeacherDemoChapter === 'function' && practiceFrames
    ? shared.createTeacherDemoChapter({ G, emptyFrame: practiceFrames.empty, placeFigure: shared.placeFigure })
    : null;
  return function GeometryDemo(props) {
    const [fit, setFit] = React.useState(true);
    const [zoom, setZoom] = React.useState(1);
    const [status, setStatus] = React.useState('');
    const [viewport, setViewport] = React.useState({ width: 1280, height: 640 });
    const stageRef = React.useRef(null);
    const scrollRef = React.useRef(null);
    const scrollPos = React.useRef({ left: 0, top: 0 });
    const progressRef = React.useRef(null);
    if (chapter && !progressRef.current) {
      progressRef.current = shared.createPracticeProgress({
        mode: 'teacher-demo', chapters: [chapter], validateFrame: practiceFrames.validate,
      });
    }
    const [guideOpen, setGuideOpen] = React.useState(false);
    const [dismissed, setDismissed] = React.useState(false);
    const [progress, setProgress] = React.useState(() => progressRef.current?.snapshot() ?? null);
    const figure = props.figure;
    const board = figure?.board;
    const liveId = chapter?.identity(figure) ?? null;
    const width = G.bounds.width;
    const height = G.bounds.height;
    // The teacher's writing is the student's writing, size included: a copied figure must
    // look on the student's canvas exactly as it looked here.
    const textMetrics = G.textMetrics();
    React.useEffect(() => {
      const node = stageRef.current;
      if (!node || typeof ResizeObserver === 'undefined') return undefined;
      const measure = () => {
        const next = { width: Math.max(160, node.clientWidth), height: Math.max(160, node.clientHeight) };
        setViewport((old) => (old.width === next.width && old.height === next.height ? old : next));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, [figure]);
    function guideFrame() {
      const saved = progressRef.current?.snapshot().frame;
      const base = saved || chapter.start(null);
      return {
        ...base,
        zoom, fit,
        scroll: { left: scrollRef.current?.scrollLeft || 0, top: scrollRef.current?.scrollTop || 0 },
      };
    }
    function report(event) {
      if (!guideOpen || !progressRef.current) return;
      setProgress(progressRef.current.observe(event, guideFrame()));
    }
    function openGuide(retry) {
      if (!chapter || !progressRef.current || !liveId || !figure?.board) return;
      if (retry || progressRef.current.snapshot().chapters[0]?.status === 'not-started') {
        chapter.arm({ id: liveId, board: figure.board });
      }
      const next = retry
        ? progressRef.current.enter('teacher-demo-basics', { retry: true })
        : progressRef.current.enter('teacher-demo-basics');
      setProgress(next);
      setDismissed(false);
      setGuideOpen(true);
    }
    function closeGuide() {
      setGuideOpen(false);
      setDismissed(true);
    }
    function navigate(command, value) {
      const owner = progressRef.current;
      if (!owner) return;
      if (command === 'retry') {
        if (!liveId || !figure?.board) return;
        chapter.arm({ id: liveId, board: figure.board });
        setProgress(owner.enter('teacher-demo-basics', { retry: true }));
        setGuideOpen(true);
        return;
      }
      if (command === 'skip') {
        const frame = guideFrame();
        if (liveId !== owner.snapshot().goal?.figureId) frame.figureBoard = null;
        owner.saveFrame(frame);
      }
      const next = command === 'enter' ? owner.enter(value)
        : command === 'retryStep' ? owner.retryStep(value)
          : owner[command]();
      setProgress(next);
    }
    React.useEffect(() => {
      if (!chapter || !progressRef.current || dismissed || guideOpen || !liveId || !figure?.board) return undefined;
      if (progressRef.current.snapshot().chapters[0]?.status !== 'not-started') return undefined;
      chapter.arm({ id: liveId, board: figure.board });
      setProgress(progressRef.current.enter('teacher-demo-basics'));
      setGuideOpen(true);
      return undefined;
    }, [liveId, dismissed, guideOpen]);
    const at = (id) => {
      const point = board?.points.find((item) => item.id === id);
      return point ? { x: point.x, y: point.y } : null;
    };
    const unavailable = Boolean(guideOpen && progress?.goal && liveId !== progress.goal.figureId);
    function copy() {
      if (guideOpen) {
        const snap = progressRef.current?.snapshot();
        if (!snap?.goal || liveId !== snap.goal.figureId) {
          setStatus(t('teacherDemoFigureUnavailable'));
          return;
        }
        if (snap.goal.step !== 'demo-copy' || !figure?.board) return;
        const before = snap.frame.board;
        const placed = shared.placeFigure?.(G, before, figure.board);
        if (!placed?.ok) {
          setStatus(placed?.reason === 'full' ? t('demoCopyFull') : t('failed'));
          return;
        }
        const frame = { ...guideFrame(), board: placed.board };
        setProgress(progressRef.current.observe({
          type: 'copy', figureId: liveId, before, after: placed.board,
        }, frame));
        return;
      }
      if (!board) return;
      const result = props.onCopy?.(board);
      if (result?.ok) return;
      // An internal failure must not read as an empty canvas being "too full".
      setStatus(result?.reason === 'full' ? t('demoCopyFull') : t('failed'));
    }
    function changeView(nextFit, nextZoom) {
      if (guideOpen && !unavailable) {
        if (nextZoom !== undefined && nextZoom !== zoom) report({ type: 'zoom', before: zoom, after: nextZoom, figureId: liveId });
        if (nextFit !== fit) report({ type: 'fit', before: fit, after: nextFit, figureId: liveId });
      }
      setFit(nextFit);
      if (nextZoom !== undefined) setZoom(nextZoom);
    }
    const hidden = board ? shared.geometryHiddenPoints(board) : new Set();
    const captionOf = (element) => shared.captionPosition?.(element, at, { width, height }) || null;
    // The same hit box the geometry page measures. The frame wants that box relative to
    // the anchor, so the anchor is removed here. There is no shared.geometryTextBox.
    function textBoxOf(element) {
      const box = G.textBox(element.text.split('\n'));
      return { x0: element.x - 6, y0: element.y - textMetrics.size - 4, x1: element.x + box.width + 2, y1: element.y + box.height - textMetrics.size };
    }
    function frameTextBox(element) {
      const hit = textBoxOf(element);
      return { x: hit.x0 - element.x, y: hit.y0 - element.y, width: hit.x1 - hit.x0, height: hit.y1 - hit.y0 };
    }
    function drawElement(element) {
      // The student's writing is copied with the figure and drawn at the same size there.
      if (element.type === 'text') {
        return h('g', { key: element.id }, element.text.split('\n').map((line, index) => h('text', {
          key: index, x: element.x, y: element.y + index * textMetrics.line, fontSize: textMetrics.size, fill: controls.ink,
          stroke: '#FFFFFF', strokeWidth: 3, paintOrder: 'stroke',
        }, line)));
      }
      const caption = captionOf(element);
      return shared.geometryShapeNode(h, element, at, controls, {
        caption, captionBox: shared.captionBox?.(caption) ?? null,
      })?.node ?? null;
    }
    // The same framing as the student canvas: a fit keeps the whole board, labels and
    // captions included, and a zoom grows the canvas so the frame scrolls to the rest
    // instead of cropping it.
    const frame = board ? shared.geometryFrame(
      shared.geometryFrameInputs({ width, height, board, captionOf, textBox: frameTextBox }),
      viewport, { value: zoom, fit },
    ) : null;
    // The page itself scrolls: a long title or description can push the figure below the
    // fold, and the frame keeps its own scrollbars for a zoomed figure.
    const canvas = board && h('div', {
      ref: scrollRef, className: 'eb-demo-canvas-scroll',
      onScroll: guideOpen ? () => {
        const after = { left: scrollRef.current?.scrollLeft || 0, top: scrollRef.current?.scrollTop || 0 };
        const before = scrollPos.current;
        if (before.left === after.left && before.top === after.top) return;
        scrollPos.current = after;
        if (!unavailable) report({ type: 'scroll', before, after, figureId: liveId });
      } : undefined,
    }, h('svg', {
      className: 'eb-artboard eb-geometry',
      style: { width: frame.box.width, height: frame.box.height },
      viewBox: `${frame.origin.x} ${frame.origin.y} ${frame.span.width} ${frame.span.height}`,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img', 'aria-label': t('demoCanvas'),
    },
    h('rect', { x: frame.origin.x, y: frame.origin.y, width: frame.span.width, height: frame.span.height, fill: '#FFFFFF' }),
    board.elements.filter((element) => element.type !== 'text').map(drawElement),
    board.elements.filter((element) => element.type === 'text').map(drawElement),
    board.points.filter((point) => !hidden.has(point.id)).map((point) => h('g', { key: point.id },
      h('circle', { cx: point.x, cy: point.y, ...shared.geometryPointDot(point, controls) }),
      h('text', shared.geometryPointLabel(point, controls), point.label)))));
    const goal = progress?.goal;
    const chapterStatus = progress?.chapters?.[0]?.status;
    const canResume = Boolean(!guideOpen && liveId && (chapterStatus === 'in-progress' || chapterStatus === 'skipped'));
    // The page keeps a tutorial door of its own, so the guide is reachable after it was
    // dismissed and without hunting the rail. A finished guide replays from its first
    // step; a skipped one resumes where it stopped, and the rail still says so. With no
    // figure there is nothing to practise, so the press only says that much.
    function openTutorial() {
      if (!chapter || !progressRef.current || !liveId || !figure?.board) {
        setStatus(t('teacherDemoTutorialNoFigure'));
        return;
      }
      // Read the record, not the rendered progress: the geometry page can advance the
      // guide while this page keeps an older snapshot in state.
      const status = progressRef.current.snapshot().chapters?.[0]?.status;
      openGuide(status === 'completed');
    }
    // The guide uses the same step rail as the two student boards.
    const coach = guideOpen && goal && PracticeRail && h(PracticeRail, {
      progress,
      chapters: [chapter],
      onNavigate: navigate,
      onExit: closeGuide,
      goalKey: (step) => `teacherDemoPracticeGoal_${step}`,
      stepKey: (step) => `practiceStep_${step}`,
      goalText: unavailable ? t('teacherDemoFigureUnavailable') : null,
      extra: goal.step === 'demo-read' && !unavailable && controls.button(t('teacherDemoContinue'), () => {
        report({ type: 'continue', figureId: liveId });
      }, { className: 'eb-primary' }),
    });
    if (props.bindGuide && progressRef.current && chapter) {
      props.bindGuide({ open: guideOpen, progress: progressRef.current, chapter, liveId, close: closeGuide });
    }
    // Without a figure this page says nothing on the canvas: no title, no empty-state
    // sentence. Only the dock below, with its way back to the conversation, stays.
    const main = h('div', { className: 'eb-demo-main' },
      // The guide hides the teacher-message strip, like the two practice boards.
      coach ? null : props.question,
      canResume && controls.button(t('teacherDemoResume'), () => openGuide(false), { className: 'eb-primary' }),
      figure && h('div', { className: 'eb-demo-head' },
        h('h2', null, figure.title || t('tabDemo')),
        figure.description && h('p', null, figure.description),
        h('div', { className: 'eb-demo-actions' },
          controls.button(t('demoCopy'), copy, { className: 'eb-primary' }),
          // A read-only page only views the figure, so it keeps the dock's zoom controls but
          // none of the drawing tools.
          ...controls.zoomPair({ zoom, fit, setFit: changeView }))),
      figure && h('div', { ref: stageRef, className: 'eb-demo-stage' }, canvas),
      h('nav', { className: 'eb-demo-dock', 'aria-label': t('canvasTools') },
        controls.backButton(props.close, { icon })),
      // The tutorial door sits at the other end of the same bottom edge: 返回对话 stays
      // left, this page's one way to learn it stays right. It is hidden while the rail is
      // up, because the rail itself already carries the steps and 退出练习.
      !guideOpen && chapter && h('nav', {
        className: 'eb-demo-dock eb-demo-dock-right', 'aria-label': t('teacherDemoTutorialArea'),
      }, controls.button(t('teacherDemoTutorial'), openTutorial, { className: 'eb-dock-tutorial' })));
    return h('div', {
      className: `eb-workspace eb-demo-workspace${coach ? ' eb-has-rail' : ''}`,
      onKeyDown: (event) => event.stopPropagation(),
    },
    main,
    coach,
    controls.status(status));
  };
}
