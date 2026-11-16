// Where a short element note sits on the geometry canvas, y growing downward, and how big
// its writing is. The student page and the teacher demo both draw a caption through
// draw.js's `geometryCaptionLabel`; that label derives its size, anchor and halo from the
// box returned here, so the writing a student sees is the writing they can click.
//
// build.mjs inlines these with toString(), so they use only their own arguments.

/**
 * The writing a caption draws, trimmed, or null when the note is too short or too long to be
 * drawn beside the shape. This is the one statement of how long a caption may be: a longer
 * note stays in the note card and is never claimed as drawn beside its shape.
 *
 * The bound is declared inside the function because build.mjs inlines only function
 * sources; a module-level constant would be missing from client.js.
 */
export function visibleCaption(note) {
  const CAPTION_MAX = 20;
  if (typeof note !== 'string') return null;
  const text = note.trim();
  const chars = [...text];
  if (chars.length < 1 || chars.length > CAPTION_MAX) return null;
  return text;
}

/**
 * The box a caption's writing fills: one line of text, centred on `x` and sitting on the
 * baseline `y`. Both pages draw at this size and hit-test against this box.
 */
export function captionBox(caption) {
  if (!caption) return null;
  const size = 13, pad = 4;
  const width = [...caption.text].length * size * 0.62;
  return {
    x0: caption.x - width / 2 - pad, x1: caption.x + width / 2 + pad,
    y0: caption.y - size - pad, y1: caption.y + pad,
    size, anchor: 'middle',
  };
}

/**
 * @param {object} element geometry element
 * @param {(id: string) => {x: number, y: number} | null} at
 * @param {{width: number, height: number}} bounds
 * @returns {{text: string, x: number, y: number} | null}
 */
export function captionPosition(element, at, bounds) {
  // Keep this helper local: build.mjs copies this function into the client bundle.
  function inside(point, bounds) {
    return point.x >= 0 && point.x <= bounds.width && point.y >= 0 && point.y <= bounds.height;
  }
  const text = visibleCaption(element?.note);
  if (!text || typeof at !== 'function' || !bounds) return null;
  if (element.type === 'circle') {
    const center = at(element.centerPointId);
    const rim = at(element.radiusPointId);
    if (!center || !rim) return null;
    const radius = Math.hypot(rim.x - center.x, rim.y - center.y);
    const above = { x: center.x, y: center.y - radius - 14 };
    const below = { x: center.x, y: center.y + radius + 14 };
    const point = inside(above, bounds) ? above : below;
    return { text, x: point.x, y: point.y };
  }
  if (!Array.isArray(element.points)) return null;
  const points = element.points.map((id) => at(id));
  if (points.some((point) => !point)) return null;
  if (element.type === 'segment' && points.length === 2) {
    const [start, end] = points;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy) || 1;
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const offsetX = (dy / length) * 14;
    const offsetY = (-dx / length) * 14;
    const counterclockwise = { x: midX + offsetX, y: midY + offsetY };
    const clockwise = { x: midX - offsetX, y: midY - offsetY };
    const point = inside(counterclockwise, bounds) ? counterclockwise
      : inside(clockwise, bounds) ? clockwise
        : { x: midX, y: midY };
    return { text, x: point.x, y: point.y };
  }
  const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const y = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  return { text, x, y };
}
