import { createDemoModel } from './geometry/demo-model.js';

/** Parse a projection view. Invalid or missing projections show an empty demo tab. */
export function readDemoView(geometry, view) {
  if (view == null) return null;
  try { return createDemoModel(geometry).validateView(view); } catch { return null; }
}

/**
 * Read-only teacher geometry page. Everything it draws with (dock controls, icons, caption
 * and point-label placement, hidden radius handles, stroke and colours) comes from
 * `shared`; build.mjs inlines this factory with toString().
 */
export function createGeometryDemoPage(React, G, t, shared) {
  const h = React.createElement;
  const controls = shared.createBoardControls(React, t);
  const icon = shared.createBoardIcons(React);
  // Teacher writing is drawn larger than a student's, so it reads at the back of a room.
  const TEXT_SCALE = 1.25;
  return function GeometryDemo(props) {
    const [fit, setFit] = React.useState(true);
    const [zoom, setZoom] = React.useState(1);
    const [status, setStatus] = React.useState('');
    const [viewport, setViewport] = React.useState({ width: 1280, height: 640 });
    const stageRef = React.useRef(null);
    const figure = props.figure;
    const board = figure?.board;
    const width = G.bounds.width;
    const height = G.bounds.height;
    // Teacher writing is drawn one size larger than a student's. Both the drawing and the
    // space it reserves use the model's own metrics, so the two cannot disagree.
    const textMetrics = G.textMetrics(TEXT_SCALE);
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
    const at = (id) => {
      const point = board?.points.find((item) => item.id === id);
      return point ? { x: point.x, y: point.y } : null;
    };
    function copy() {
      if (!board) return;
      const result = props.onCopy?.(board);
      if (result?.ok) return;
      // An internal failure must not read as an empty canvas being "too full".
      setStatus(result?.reason === 'full' ? t('demoCopyFull') : t('failed'));
    }
    const hidden = board ? shared.geometryHiddenPoints(board) : new Set();
    function drawElement(element) {
      // Teacher writing is copied with the figure, so the student can edit it on their draft.
      if (element.type === 'text') {
        return h('g', { key: element.id }, element.text.split('\n').map((line, index) => h('text', {
          key: index, x: element.x, y: element.y + index * textMetrics.line, fontSize: textMetrics.size, fill: controls.ink,
          stroke: '#FFFFFF', strokeWidth: 3, paintOrder: 'stroke',
        }, line)));
      }
      const stroke = shared.geometryStroke(element, controls);
      const caption = shared.captionPosition?.(element, at, { width, height });
      const label = caption && h('text', { key: 'caption', ...shared.geometryCaptionLabel(caption, controls) }, caption.text);
      if (element.type === 'circle') {
        const center = at(element.centerPointId);
        const rim = at(element.radiusPointId);
        if (!center || !rim) return null;
        return h('g', { key: element.id }, h('circle', {
          cx: center.x, cy: center.y, r: Math.hypot(rim.x - center.x, rim.y - center.y), ...stroke,
        }), label);
      }
      const points = (element.points || []).map(at);
      if (points.some((point) => !point)) return null;
      const shape = element.type === 'segment'
        ? h('line', { x1: points[0].x, y1: points[0].y, x2: points[1].x, y2: points[1].y, ...stroke })
        : h('polygon', { points: points.map((point) => `${point.x},${point.y}`).join(' '), ...stroke });
      return h('g', { key: element.id }, shape, label);
    }
    // The same framing as the student canvas: a fit keeps the whole board, labels and
    // captions included, and a zoom grows the canvas so the frame scrolls to the rest
    // instead of cropping it.
    const frame = board ? shared.geometryFrame({
      width, height, board,
      caption: (element) => shared.captionPosition?.(element, at, { width, height }) || null,
      textBoxes: board.elements.filter((e) => e.type === 'text').map((e) => {
        const lines = e.text.split('\n');
        const box = textMetrics.box(lines);
        const overflow = shared.geometryTextOverflow(lines, textMetrics);
        return {
          x: e.x - overflow.left, y: e.y - overflow.top,
          width: box.width + overflow.left + overflow.right, height: box.height + overflow.top + overflow.bottom,
        };
      }),
      emptyText: [],
    }, viewport, { value: zoom, fit }) : null;
    // The page itself scrolls: a long title or description can push the figure below the
    // fold, and the frame keeps its own scrollbars for a zoomed figure.
    const canvas = board && h('div', { className: 'eb-demo-canvas-scroll' }, h('svg', {
      className: 'eb-artboard eb-geometry',
      style: { width: frame.box.width, height: frame.box.height },
      viewBox: `${frame.origin.x} ${frame.origin.y} ${frame.span.width} ${frame.span.height}`,
      preserveAspectRatio: 'xMidYMid meet',
      role: 'img', 'aria-label': t('demoCanvas'),
    },
    h('rect', { x: frame.origin.x, y: frame.origin.y, width: frame.span.width, height: frame.span.height, fill: '#FFFFFF' }),
    board.elements.map(drawElement),
    board.points.filter((point) => !hidden.has(point.id)).map((point) => h('g', { key: point.id },
      h('circle', { cx: point.x, cy: point.y, ...shared.geometryPointDot(point, controls) }),
      h('text', shared.geometryPointLabel(point, controls))))));
    const zoomOut = () => { setFit(false); setZoom(Math.max(1, zoom - 0.25)); };
    const zoomIn = () => { setFit(false); setZoom(Math.min(4, zoom + 0.25)); };
    return h('div', {
      className: 'eb-workspace eb-demo-workspace',
      onKeyDown: (event) => event.stopPropagation(),
    },
    props.question,
    // Without a figure this page says nothing on the canvas: no title, no empty-state
    // sentence. Only the dock below, with its way back to the conversation, stays.
    figure && h('div', { className: 'eb-demo-head' },
      h('h2', null, figure.title || t('tabDemo')),
      figure.description && h('p', null, figure.description),
      h('div', { className: 'eb-demo-actions' },
        controls.button(t('demoCopy'), copy, { className: 'eb-primary' }),
        // A read-only page only views the figure, so it keeps the dock's zoom controls but
        // none of the drawing tools.
        controls.button(fit ? t('fitView') : `${Math.round(zoom * 100)}%`, () => setFit(!fit), {
          className: 'eb-zoom-label', 'aria-label': t('fitView'), 'aria-pressed': fit, title: t('fitView'),
        }),
        controls.button('−', zoomOut, { className: 'eb-zoom-button eb-zoom-out', 'aria-label': t('zoomOut'), title: t('zoomOut'), disabled: fit || zoom <= 1 }),
        controls.button('＋', zoomIn, { className: 'eb-zoom-button eb-zoom-in', 'aria-label': t('zoomIn'), title: t('zoomIn'), disabled: !fit && zoom >= 4 }))),
    figure && h('div', { ref: stageRef, className: 'eb-demo-stage' }, canvas),
    h('nav', { className: 'eb-demo-dock', 'aria-label': t('canvasTools') },
      controls.backButton(props.close, { icon })),
    controls.status(status));
  };
}
