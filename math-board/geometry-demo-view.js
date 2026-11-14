import { createDemoModel } from './geometry/demo-model.js';

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
    const captionOf = (element) => shared.captionPosition?.(element, at, { width, height }) || null;
    const textBoxOf = (element) => shared.geometryTextBox(element.text.split('\n'), textMetrics);
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
      shared.geometryFrameInputs({ width, height, board, captionOf, textBox: textBoxOf }),
      viewport, { value: zoom, fit },
    ) : null;
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
    board.elements.filter((element) => element.type !== 'text').map(drawElement),
    board.elements.filter((element) => element.type === 'text').map(drawElement),
    board.points.filter((point) => !hidden.has(point.id)).map((point) => h('g', { key: point.id },
      h('circle', { cx: point.x, cy: point.y, ...shared.geometryPointDot(point, controls) }),
      h('text', shared.geometryPointLabel(point, controls), point.label)))));
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
        ...controls.zoomPair({ zoom, fit, setFit: (nextFit, nextZoom) => { setFit(nextFit); if (nextZoom !== undefined) setZoom(nextZoom); } }))),
    figure && h('div', { ref: stageRef, className: 'eb-demo-stage' }, canvas),
    h('nav', { className: 'eb-demo-dock', 'aria-label': t('canvasTools') },
      controls.backButton(props.close, { icon })),
    controls.status(status));
  };
}
