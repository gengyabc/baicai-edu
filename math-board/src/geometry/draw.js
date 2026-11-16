// Reading a geometry board for drawing. The student geometry page and the read-only
// teacher demo page show the same snapshot with the same rules: which circle rim point is
// only a radius handle, where a short caption sits, how a point's label is placed and how
// a shape's stroke looks. Only the geometry model owns the snapshot; these helpers turn it
// into coordinates and never decide anything about the figure.
//
// build.mjs inlines these with toString(), so they use only their own arguments.

/**
 * Points that no shape and no construction uses besides being a circle's radius handle.
 * They stay in the snapshot so the radius is defined, and neither page draws them.
 */
export function geometryHiddenPoints(board) {
  const used = new Set();
  for (const element of board?.elements || []) {
    // A text references no point at all.
    if (element.type === 'text') continue;
    if (element.type === 'circle') used.add(element.centerPointId);
    else for (const id of element.points || []) used.add(id);
  }
  for (const point of board?.points || []) for (const input of point.construction?.inputs || []) used.add(input);
  const hidden = new Set();
  for (const element of board?.elements || []) {
    if (element.type === 'circle' && element.radiusPointId && !used.has(element.radiusPointId)) hidden.add(element.radiusPointId);
  }
  return hidden;
}

/**
 * A short caption beside a shape, as both pages draw it. `active` marks the caption the
 * student pointed at, and `pickable` makes the writing itself a target on the canvas.
 */
export function geometryCaptionLabel(caption, colors, options = {}) {
  if (!caption) return null;
  const { active = false, pickable = false, box } = options;
  return {
    x: caption.x, y: caption.y, textAnchor: box ? box.anchor : 'middle',
    fontSize: box ? box.size : 13, fontWeight: 600,
    fill: active ? colors.selection : colors.ink, stroke: '#FFFFFF', strokeWidth: 3.5, paintOrder: 'stroke',
    pointerEvents: pickable ? 'auto' : 'none', cursor: pickable ? 'pointer' : undefined,
  };
}

/**
 * A shape as both pages draw it: the primitive and its caption in one node, so neither page
 * re-derives the circle radius, the segment ends or the caption's size. `captionBox` is the
 * drawn writing's own box, so the click target is exactly the text the student reads.
 */
export function geometryShapeNode(h, element, at, colors, options = {}) {
  const { stroke = {}, caption = null, captionProps = {}, captionBox = null } = options;
  const shape = options.shape ?? (() => {
    if (element.type === 'circle') {
      const center = at(element.centerPointId), rim = at(element.radiusPointId);
      if (!center || !rim) return null;
      return { type: 'circle', props: { cx: center.x, cy: center.y, r: Math.hypot(rim.x - center.x, rim.y - center.y) } };
    }
    const points = (element.points || []).map(at);
    if (points.some((point) => !point) || points.length < 2) return null;
    if (element.type === 'segment') {
      const [a, b] = points;
      return { type: 'line', props: { x1: a.x, y1: a.y, x2: b.x, y2: b.y } };
    }
    return { type: 'polygon', props: { points: points.map((point) => `${point.x},${point.y}`).join(' ') } };
  })();
  if (!shape) return null;
  // One caption box decides both how the writing is drawn and how much of the canvas it
  // claims, so the drawn writing and the clickable writing can never drift apart.
  const box = caption ? captionBox : null;
  const label = box && geometryCaptionLabel(caption, colors, { ...captionProps, box });
  const primary = { key: element?.id ?? 'shape', ...shape.props, ...geometryStroke(element, colors, stroke) };
  // Always the same node shape: a page reads `node.primary` (the SVG primitive) and
  // `node.caption` (the drawn note, or null) and never has to tell the two cases apart.
  const primaryNode = h(shape.type, primary);
  const captionNode = label ? h('text', { key: 'caption', ...label }, caption.text) : null;
  return { type: 'shape', shape: shape.type, primary: primaryNode, caption: captionNode,
    node: captionNode ? h('g', { key: element?.id }, primaryNode, captionNode) : primaryNode };
}

/** A free-standing point with its label above and to the right, as both pages draw it. */
export function geometryPointLabel(point, colors, options = {}) {
  return {
    x: point.x + 9, y: point.y - 9, fontSize: 13, fontWeight: 600,
    fill: options.active ? colors.selection : colors.ink,
    stroke: '#FFFFFF', strokeWidth: 3.5, paintOrder: 'stroke', pointerEvents: 'none',
  };
}

/** A point's dot: the student page tints selected and staged points, the demo keeps ink. */
export function geometryPointDot(point, colors, options = {}) {
  const { radius = 4, active = false } = options;
  return {
    r: radius,
    fill: active ? colors.selection : point.kind === 'derived' ? colors.derived : colors.ink,
    stroke: '#FFFFFF', strokeWidth: 1.5,
  };
}

/**
 * A shape's stroke: the same width, dash and cap on both pages; the student page widens
 * and tints it while the shape is selected.
 */
export function geometryStroke(element, colors, options = {}) {
  const { width = 1.8, active = false } = options;
  return {
    fill: 'none', stroke: active ? colors.selection : colors.ink, strokeWidth: active ? 3 : width,
    strokeLinejoin: 'round', strokeLinecap: 'round',
    strokeDasharray: element?.role === 'auxiliary' ? '7 5' : undefined,
  };
}
