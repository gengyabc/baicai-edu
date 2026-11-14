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
  const { active = false, pickable = false } = options;
  return {
    x: caption.x, y: caption.y, textAnchor: 'middle', fontSize: 13, fontWeight: 600,
    fill: active ? colors.selection : colors.ink, stroke: '#FFFFFF', strokeWidth: 3.5, paintOrder: 'stroke',
    pointerEvents: pickable ? 'auto' : 'none', cursor: pickable ? 'pointer' : undefined,
  };
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
