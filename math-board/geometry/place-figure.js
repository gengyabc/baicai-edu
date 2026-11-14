/**
 * Append a validated geometry figure beside the student's current draft.
 * Free points share one translation. Derived points are recomputed by the model.
 * Returns the same student board when no legal placement exists.
 *
 * Every helper lives inside this function on purpose: build.mjs inlines only
 * `placeFigure.toString()` into client.js, so a module-level helper would be a
 * ReferenceError in the browser. A thrown helper used to be swallowed below as
 * "no room", turning a missing `merge` into 几何画布太满 on an empty draft.
 */
export function placeFigure(geometry, student, figure) {
  const base = geometry.validate(student);
  const source = geometry.validate(figure);
  // Writing alone is still a figure the teacher drew; it needs no points at all.
  if (!source.elements.length) return { ok: false, reason: 'empty', board: base };
  // Points define what a copied figure must clear. Writing alone is no obstacle: an
  // empty or text-only draft takes the figure at its drawn coordinates, so only colliding
  // ids get renamed and the ids the picker already knows survive.
  const moves = base.points.length > 0 || base.elements.some((item) => item.type === 'text')
    ? placements(geometry, base, source)
    : [source];
  for (const candidate of moves) {
    try {
      const merged = merge(geometry, base, candidate);
      return { ok: true, board: merged.board, elementIds: merged.elementIds, pointIds: merged.pointIds };
    } catch { /* The next offset or scale may land inside the board. */ }
  }
  return { ok: false, reason: 'full', board: base };

  // Points own the figure's box; writing alone still gives the box a place to clear.
  function boundsOf(board) {
    const anchors = board.points.length ? board.points : board.elements.filter((item) => item.type === 'text');
    const xs = anchors.map((item) => item.x);
    const ys = anchors.map((item) => item.y);
    return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  }

  function placements(geometry, student, source) {
    const studentBox = boundsOf(student);
    const placed = [];
    for (const scale of [1, 0.85, 0.7, 0.55, 0.4]) {
      let scaled = source;
      if (scale !== 1) {
        try { scaled = transform(geometry, student, source, 0, 0, scale); } catch { continue; }
      }
      const box = boundsOf(scaled);
      // Four ways out of the draft: right, below, left, above.
      const moves = [
        { dx: studentBox.maxX + 24 - box.minX, dy: 0 },
        { dx: 0, dy: studentBox.maxY + 24 - box.minY },
        { dx: studentBox.minX - 24 - box.maxX, dy: 0 },
        { dx: 0, dy: studentBox.minY - 24 - box.maxY },
      ];
      for (const move of moves) {
        // A zero offset is not a way out: it would return the overlapping original.
        if (!move.dx && !move.dy) continue;
        try { placed.push(transform(geometry, student, scaled, move.dx, move.dy, 1)); } catch { /* outside or degenerate */ }
      }
    }
    return placed;
  }

  function transform(geometry, student, source, dx, dy, scale) {
    const free = source.points.filter((point) => point.kind === 'free');
    // A text-only figure has no free points to measure from; it still moves as a unit.
    const anchors = free.length ? free : source.elements.filter((item) => item.type === 'text');
    const cx = anchors.reduce((sum, item) => sum + item.x, 0) / anchors.length;
    const cy = anchors.reduce((sum, item) => sum + item.y, 0) / anchors.length;
    const points = source.points.map((point) => {
      if (point.kind !== 'free') return point;
      return {
        ...point,
        x: cx + (point.x - cx) * scale + dx,
        y: cy + (point.y - cy) * scale + dy,
      };
    });
    // The figure's own writing moves with the same offset, never with the scale:
    // character size is the board's, not something a copied figure may shrink.
    const elements = source.elements.map((element) => (element.type === 'text'
      ? { ...element, x: element.x + dx, y: element.y + dy } : element));
    // Candidate positions live on the destination paper, not the teacher's canvas.
    return geometry.validate({ ...student, points, elements, note: source.note });
  }

  function letters(n) {
    let name = '';
    for (let k = n; k > 0; k = Math.floor((k - 1) / 26)) name = String.fromCharCode(65 + ((k - 1) % 26)) + name;
    return name;
  }

  function nextSerial(items, prefix) {
    let max = 0;
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);
    for (const item of items) {
      const match = pattern.exec(item.id);
      if (!match) continue;
      const n = Number(match[1]);
      if (Number.isSafeInteger(n)) max = Math.max(max, n);
    }
    return max + 1;
  }

  function nextLabel(used, id) {
    const match = /-(\d+)$/.exec(id);
    if (match) {
      const numbered = letters(Number(match[1]));
      if (!used.has(numbered)) return numbered;
    }
    for (let n = 1; n < 10000; n += 1) {
      const name = letters(n);
      if (!used.has(name)) return name;
    }
    throw Error('Label space exhausted');
  }

  function merge(geometry, student, figure) {
    const idMap = new Map();
    const usedLabels = new Set(student.points.map((point) => point.label));
    const points = [];
    for (const point of figure.points) {
      const id = `p-${nextSerial([...student.points, ...points, ...student.elements], 'p')}`;
      idMap.set(point.id, id);
      const label = usedLabels.has(point.label) ? nextLabel(usedLabels, id) : point.label;
      usedLabels.add(label);
      const construction = point.construction
        ? { op: point.construction.op, inputs: point.construction.inputs.map((input) => idMap.get(input)) }
        : null;
      points.push({ ...point, id, label, construction });
    }
    const elements = [];
    for (const element of figure.elements) {
      const id = `e-${nextSerial([...student.elements, ...elements, ...student.points, ...points], 'e')}`;
      if (element.type === 'text') {
        // A text names no point, and move() already gave it its final place: it must not
        // be shifted a second time here.
        elements.push({ ...element, id });
      } else if (element.type === 'circle') {
        elements.push({
          ...element, id,
          centerPointId: idMap.get(element.centerPointId),
          radiusPointId: idMap.get(element.radiusPointId),
        });
      } else {
        elements.push({ ...element, id, points: element.points.map((pointId) => idMap.get(pointId)) });
      }
    }
    const board = geometry.validate({
      ...student,
      points: [...student.points, ...points],
      elements: [...student.elements, ...elements],
      note: student.note,
    });
    return { board, elementIds: elements.map((element) => element.id), pointIds: points.map((point) => point.id) };
  }
}
