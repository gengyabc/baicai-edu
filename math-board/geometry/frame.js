// How a geometry snapshot is framed inside its viewport. The student page and the
// read-only teacher demo show the same 800×600 board, so they compute the fit scale, the
// SVG box and the visible part of the board with the same code; only the zoom state they
// pass in differs.
//
// The rule that keeps a drawing complete: a fit shows the whole board, never the whole
// board cropped to the viewport's height. Everything that can sit outside the board's own
// drawing area — a point label above and to the right of its point, a caption beside a
// shape, the empty-state words, a circle drawn past the edge — therefore keeps a reserve
// of board units on every side, so the frame that holds the canvas can scroll to it.
//
// build.mjs inlines these with toString(), so they use only their own arguments.

/**
 * The space a text element's writing can reach past its box: the writing is anchored on its
 * left baseline, drawn with a light halo, and each line box is taller than the next line's
 * spacing. The demo page draws the same text one size larger.
 */
export function geometryTextOverflow(lines, metrics) {
  const count = Math.max(1, Array.isArray(lines) ? lines.length : 1);
  const line = metrics?.line ?? 20;
  const size = metrics?.size ?? 16;
  const pad = Math.max(4, Math.round(line * 0.3));
  return { left: pad, right: pad + 2, top: line + pad, bottom: (count - 1) * line + (size - line) + pad };
}

/**
/**
 * Everything `geometryFrame` needs besides the viewport and the zoom: the board, each
 * shape's caption, and the box of every text the page writes. Both pages build the same
 * argument object here, from the same metrics they draw with, so the fit cannot depend on
 * which page asked for it.
 *
 * `captionOf(element)` places a shape's short note; it comes from caption.js, which owns
 * that rule. `textBox(element)` measures one text with the page's own metrics.
 */
export function geometryFrameInputs(options) {
  const { board, captionOf, textBox } = options;
  const { width, height } = options;
  return {
    width, height, board,
    caption: (element) => (element && element.type !== 'text' ? captionOf(element) : null),
    textBoxes: (board?.elements || []).filter((e) => e.type === 'text').map((e) => anchoredTextBox(e, textBox(e))),
    emptyText: [],
  };

  // A page measures the writing from its own anchor; the frame wants the box in board
  // coordinates, so the anchor is added here once instead of on every page.
  function anchoredTextBox(element, box) {
    return { x: element.x + box.x, y: element.y + box.y, width: box.width, height: box.height };
  }
}


/**
 * Frame the board. `viewport` is the area the canvas really has; `zoom` is `{ value, fit }`.
 * Returns the fit scale, the scrollable canvas box, the viewBox that shows it, and the
 * board rectangle a complete view of the drawing must keep reachable.
 */
export function geometryFrame(geometry, viewport, zoom) {
  // Board units of ink a point label can reach past its point, as a box around the point.
  // It is declared here, not at module scope: build.mjs inlines only this function's
  // source, so anything outside it would be missing in client.js.
  const label = { x: -2, y: -14, width: 32, height: 18 };
  // Named so the nesting cannot shadow a box: `union(a, b)` hid the label reserve `b`.
  function union(outer, inner) {
    const x0 = Math.min(outer.x, inner.x), y0 = Math.min(outer.y, inner.y);
    const x1 = Math.max(outer.x + outer.width, inner.x + inner.width);
    const y1 = Math.max(outer.y + outer.height, inner.y + inner.height);
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  }
  function around(p, box) {
    return { x: p.x + box.x, y: p.y + box.y, width: box.width, height: box.height };
  }
  const at = (id) => {
    const point = geometry.board?.points?.find((item) => item.id === id);
    return point ? { x: point.x, y: point.y } : null;
  };
  // The box a complete view must reach: the board, then anything drawn past its edge. It
  // starts at the reserve itself, so a point label on the board's border still has room.
  const boardBox = { x: 0, y: 0, width: geometry.width, height: geometry.height };
  const labelRight = label.x + label.width;
  const labelBottom = label.y + label.height;
  let drawing = { x: boardBox.x + label.x, y: boardBox.y + label.y,
    width: boardBox.width - label.x + labelRight, height: boardBox.height - label.y + labelBottom };
  for (const point of geometry.board?.points || []) drawing = union(drawing, around(point, label));
  for (const element of geometry.board?.elements || []) {
    if (element.type === 'text') continue;
    const caption = geometry.caption?.(element);
    if (caption) drawing = union(drawing, around(caption, { x: -60, y: -18, width: 120, height: 24 }));
    // A circle is drawn by its radius point, which is a free point of the board: its rim
    // always lies inside the point margin, so the board itself still contains it.
  }
  for (const line of geometry.emptyText || []) {
    drawing = union(drawing, { x: line.x - line.width / 2, y: line.y - line.height, width: line.width, height: line.height });
  }
  for (const box of geometry.textBoxes || []) {
    drawing = union(drawing, { x: box.x, y: box.y, width: box.width, height: box.height });
  }
  // How far the drawing reaches past the board on each side. A fit frames this span, so
  // nothing drawn on the board can be left outside the canvas.
  const inset = {
    left: Math.max(0, -drawing.x),
    top: Math.max(0, -drawing.y),
    right: Math.max(0, drawing.x + drawing.width - geometry.width),
    bottom: Math.max(0, drawing.y + drawing.height - geometry.height),
  };
  const span = { width: geometry.width + inset.left + inset.right, height: geometry.height + inset.top + inset.bottom };
  // A fit shows the whole board, so the longest side lands on the viewport's matching side.
  const fitScale = Math.min(viewport.width / span.width, viewport.height / span.height);
  const scale = Math.max(0.05, fitScale * (zoom.fit ? 1 : zoom.value)) || 0.05;
  const box = { width: Math.round(span.width * scale), height: Math.round(span.height * scale) };
  const origin = { x: -inset.left, y: -inset.top };
  return {
    reserve: { left: -label.x, top: -label.y, right: label.x + label.width, bottom: label.y + label.height },
    inset, span, scale, fitScale, box, origin,
    visible: { x: origin.x, y: origin.y, width: span.width, height: span.height },
  };
}
