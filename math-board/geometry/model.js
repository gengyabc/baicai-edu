/**
 * Pure, dependency-free geometry board model. Factory is embedded in the browser bundle.
 * Geometry is a separate, read-only expression mode beside the quantity board: nothing here
 * converts a quantity object, and nothing here persists a derived point's position.
 */
export function createGeometryModel() {
  const KIND = 'geometry-board';
  const coordinateSystem = Object.freeze({ type: 'cartesian-2d', units: 'board-unit' });
  const WIDTH = 800;
  const HEIGHT = 600;
  // Every point keeps this distance from the border so its label and hit area stay on the board.
  const MARGIN = 24;
  // Corner drags stop just before a degenerate shape instead of refusing the whole drag.
  const EPSILON = 0.5;
  const elementTypes = ['segment', 'polygon', 'circle', 'parallelogram', 'rectangle'];
  // A text element is a line of student writing placed on the board. It is not a point,
  // not a shape, and its position is its own anchor; it never references geometry.
  const textTypes = ['text'];
  const commonTypes = [...elementTypes, ...textTypes];
  const TEXT_MAX = 200;
  const roles = ['main', 'auxiliary'];
  const operations = ['midpoint', 'parallelogram', 'rectangle'];
  const fail = (message) => { throw new Error(message); };
  const record = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
    && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
  const keys = (v, required, optional = []) => {
    if (!record(v) || required.some((k) => !Object.hasOwn(v, k))
      || Object.keys(v).some((k) => !required.includes(k) && !optional.includes(k))) fail('Invalid fields');
  };
  const chars = (v) => [...v];
  const text = (v, max) => typeof v === 'string' && chars(v).length <= max;
  const idValid = (v) => text(v, 100) && v.trim().length > 0;
  const finite = (v) => typeof v === 'number' && Number.isFinite(v);
  const inside = (p) => p.x >= MARGIN && p.x <= WIDTH - MARGIN && p.y >= MARGIN && p.y <= HEIGHT - MARGIN;
  const sameData = (a, b) => {
    if (a === b) return true;
    if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => sameData(v, b[i]));
    return record(a) && record(b) && Object.keys(a).length === Object.keys(b).length
      && Object.keys(a).every((k) => Object.hasOwn(b, k) && sameData(a[k], b[k]));
  };
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  // The one authoritative statement of the shared fourth-point formula: P4 = P1 + P3 - P2,
  // so P2 and P4 are the diagonal pair for both families. Dragging a corner keeps its
  // diagonal partner and re-derives the other one from the two remaining corners.
  const fourthPoint = (a, b, c) => ({ x: a.x + c.x - b.x, y: a.y + c.y - b.y });
  // A rectangle drawn from three clicks keeps the side P1 P2 and a right angle at P2.
  // The third click is a height: P3 moves onto the perpendicular through P2, and only
  // the part of the click perpendicular to P1 P2 is kept. An already-right corner is
  // unchanged. No perpendicular height means there is no rectangle.
  function rectangleThird(a, b, c) {
    const vx = a.x - b.x, vy = a.y - b.y;
    const nx = -vy, ny = vx;
    const len2 = nx * nx + ny * ny;
    if (!(len2 > EPSILON * EPSILON)) return null;
    const h = ((c.x - b.x) * nx + (c.y - b.y) * ny) / len2;
    const third = { x: b.x + h * nx, y: b.y + h * ny };
    if (!(distance(third, b) > EPSILON)) return null;
    return { third, fourth: fourthPoint(a, b, third) };
  }
  // What a third click means to a rectangle, in one place: where its right-angle corner
  // goes, and whether the clicked point is that corner. `keepId` is the clicked free point
  // when it already sits on the corner, so a shared vertex is never relocated; otherwise the
  // shape takes a new corner and the click point is not part of it.
  function rectanglePlacement(a, b, click, hit = null) {
    const placed = a && b && click ? rectangleThird(a, b, click) : null;
    if (!placed) return null;
    const keep = hit && distance(hit, placed.third) <= EPSILON ? hit.id : null;
    return { third: placed.third, fourth: placed.fourth, keepId: keep };
  }
  // A rectangle's three inputs P1 P2 P3 are perpendicular at their middle corner, so its
  // construction fixes all four right angles no matter which corner the student dragged.
  const rectangleValid = ([a, b, c]) => {
    const dot = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
    const scale = Math.hypot(a.x - b.x, a.y - b.y) * Math.hypot(c.x - b.x, c.y - b.y);
    // Tolerance belongs to the shape test, not to the visual snap; 0.01% keeps a sheet
    // that a drag unscrolled visible as a rectangle.
    return scale > EPSILON * EPSILON && Math.abs(dot) <= 1e-4 * scale + 1e-4;
  };
  // Input corners P1 P2 P3 must not lie on one line; P4 follows from them.
  const parallelogramValid = ([a, b, c]) => Math.abs(cross(a, b, c)) > EPSILON;

  // Deferred references: polygonDegenerate is defined below this table.
  const degenerate = {
    segment: (points) => distance(points[0], points[1]) <= EPSILON,
    polygon: (points) => polygonDegenerate(points),
    circle: (center, rim) => distance(center, rim) <= EPSILON,
    parallelogram: parallelogramValid,
    rectangle: rectangleValid,
  };
  // Two segments cross or touch where they overlap, which a simple ring never allows. A
  // corner a segment merely sits on counts as well: the ring passes through it.
  const segmentsMeet = (a, b, c, d) => Math.max(a.x, b.x) >= Math.min(c.x, d.x)
    && Math.max(c.x, d.x) >= Math.min(a.x, b.x)
    && Math.max(a.y, b.y) >= Math.min(c.y, d.y)
    && Math.max(c.y, d.y) >= Math.min(a.y, b.y)
    && cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0;
  // Two shapes may not overlap, but one touching the other is a shared vertex, not a clash.
  const segmentsCrowd = (a, b, c, d) => {
    if (!segmentsMeet(a, b, c, d)) return false;
    const same = (p, q) => Math.abs(p.x - q.x) <= EPSILON && Math.abs(p.y - q.y) <= EPSILON;
    return !((same(a, c) || same(a, d) || same(b, c) || same(b, d)));
  };
  // A polygon must be a simple ring: adjacent vertices apart, and no two edges crossing.
  const polygonDegenerate = (points) => {
    const ring = [...points, points[0]];
    for (let i = 0; i < ring.length - 1; i++) if (distance(ring[i], ring[i + 1]) <= EPSILON) return true;
    // Shoelace twice the signed area: positive and negative turns cancel when collinear.
    const area2 = Math.abs(points.reduce((sum, p, i) => sum + (p.x * points[(i + 1) % points.length].y
      - points[(i + 1) % points.length].x * p.y), 0));
    if (area2 <= EPSILON * EPSILON * points.length) return true;
    const edges = ring.slice(0, -1).map((p, i) => [p, ring[i + 1]]);
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 2; j < edges.length; j++) {
        if (i === 0 && j === edges.length - 1) continue;
        const [a, b] = edges[i], [c, d] = edges[j];
        if (segmentsMeet(a, b, c, d)) return true;
      }
    }
    return false;
  };
  function validateConstruction(construction, points, id) {
    keys(construction, ['op', 'inputs']);
    if (!operations.includes(construction.op) || !Array.isArray(construction.inputs)) fail('Invalid construction');
    const arity = construction.op === 'midpoint' ? 2 : 3;
    if (construction.inputs.length !== arity || new Set(construction.inputs).size !== arity) fail('Invalid construction');
    for (const input of construction.inputs) {
      if (!idValid(input) || input === id) fail('Invalid construction reference');
      const point = points.get(input) || fail('Construction references an unknown point');
      if (point.kind !== 'free' || point.construction !== null) fail('Construction inputs must be free points');
    }
    return { op: construction.op, inputs: [...construction.inputs] };
  }
  const empty = () => ({ schemaVersion: 1, points: [], elements: [], note: '' });
  // Text words are free student writing: no control characters, no blank line, and at
  // least one visible character. The stored value is trimmed at both ends.
  const words = (v) => typeof v === 'string' && chars(v).length <= TEXT_MAX
    && !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(v);
  const emptyText = (v) => !chars(v).some((ch) => !/\s/.test(ch));
  /** Return detached canonical state; a snapshot only carries its own kind. */
  function validate(input) {
    if (record(input) && Object.hasOwn(input, 'kind') && input.kind !== KIND) fail('Another board kind');
    keys(input, ['schemaVersion', 'points', 'elements', 'note'], ['kind']);
    // A canonical state always writes `construction`; the wire form writes it only for derived points.
    // The board note is student text copied verbatim; it may be empty and is never rewritten.
    if (input.schemaVersion !== 1 || !Array.isArray(input.points) || input.points.length > 300
      || !Array.isArray(input.elements) || input.elements.length > 300 || typeof input.note !== 'string'
      || !text(input.note, 500)) fail('Invalid geometry board');
    const ids = new Set(); const labels = new Set(); const pointMap = new Map();
    const raw = [];
    for (const p of input.points) {
      keys(p, ['id', 'label', 'kind', 'x', 'y'], ['construction', 'note']);
      if (!idValid(p.id) || ids.has(p.id) || !text(p.label, 30) || !chars(p.label).length || labels.has(p.label)
        || !['free', 'derived'].includes(p.kind) || !finite(p.x) || !inside(p) || !text(p.note ?? '', 500)) fail('Invalid point');
      ids.add(p.id); labels.add(p.label); raw.push(p);
      if (p.kind === 'free') {
        // A free point carries no construction; validateConstruction re-checks the wire
        // form before a file is accepted, so a free point's construction is not re-tested here.
        pointMap.set(p.id, { id: p.id, label: p.label, kind: 'free', x: p.x, y: p.y, construction: null, note: p.note ?? '' });
        continue;
      }
      const construction = validateConstruction(p.construction, pointMap, p.id);
      const inputs = construction.inputs.map((ref) => pointMap.get(ref));
      const at = construction.op === 'midpoint' ? midpoint(inputs[0], inputs[1]) : fourthPoint(...inputs);
      // The coordinates on the wire are stale: shiftFree writes only free points, and
      // P4 = P1 + P3 - P2 can leave the board while those free points stay inside.
      if (!inside(at)) fail('Invalid point');
      pointMap.set(p.id, { id: p.id, label: p.label, kind: 'derived', ...at, construction, note: p.note ?? '' });
    }
    const elements = input.elements.map((e) => {
      keys(e, ['id', 'type', 'role', 'note'], ['points', 'centerPointId', 'radiusPointId', 'x', 'y', 'text']);
      if (!idValid(e.id) || ids.has(e.id) || !commonTypes.includes(e.type) || !roles.includes(e.role) || !text(e.note ?? '', 500)) fail('Invalid element');
      ids.add(e.id);
      const point = (ref) => pointMap.get(ref) || fail('Element references an unknown point');
      if (e.type === 'text') {
        // A text names no point: its anchor is its own position, and it lives only from
        // one edge of the board to the other.
        for (const key of ['points', 'centerPointId', 'radiusPointId']) {
          if (Object.hasOwn(e, key)) fail('A text references no point');
        }
        if (!words(e.text) || emptyText(e.text) || !finite(e.x) || !finite(e.y)
          || e.x < 0 || e.x > WIDTH || e.y < 0 || e.y > HEIGHT) fail('Invalid text');
        return { id: e.id, type: 'text', role: e.role, note: e.note ?? '', x: e.x, y: e.y, text: e.text.trim() };
      }
      if (Object.hasOwn(e, 'x') || Object.hasOwn(e, 'y') || Object.hasOwn(e, 'text')) fail('Only a text has its own position');
      if (e.type === 'circle') {
        if (Object.hasOwn(e, 'points')) fail('A circle does not use a point list');
        const center = point(e.centerPointId), rim = point(e.radiusPointId);
        if (e.centerPointId === e.radiusPointId || distance(center, rim) <= EPSILON) fail('Zero-radius circle');
        return { id: e.id, type: e.type, centerPointId: center.id, radiusPointId: rim.id, role: e.role, note: e.note ?? '' };
      }
      if (Object.hasOwn(e, 'centerPointId') || Object.hasOwn(e, 'radiusPointId')) fail('Only a circle has its own radius points');
      if (!Array.isArray(e.points) || new Set(e.points).size !== e.points.length) fail('Repeated point reference');
      if (e.type === 'segment' && e.points.length !== 2) fail('A segment has two points');
      if (e.type === 'polygon' && (e.points.length < 3 || e.points.length > 60)) fail('A polygon has three to sixty points');
      if (e.type !== 'segment' && e.type !== 'polygon' && e.points.length !== 4) fail('A quadrilateral has four points');
      const ordered = e.points.map(point);
      if (e.type === 'polygon' && ordered.length === 3 && Math.abs(cross(ordered[0], ordered[1], ordered[2])) <= EPSILON) {
        fail('Degenerate polygon');
      }
      if (e.type === 'parallelogram' || e.type === 'rectangle') {
        const ids = e.points;
        const derived = pointMap.get(ids[ids.length - 1]);
        // Four free corners are a different shape, not a misplaced derived point: say so,
        // because the remedy (use a polygon) differs from ordering the point list.
        if (ids.every((ref) => pointMap.get(ref).kind === 'free')) {
          fail('Four free points are a polygon; a rectangle or parallelogram names a derived fourth point');
        }
        if (!derived || derived.kind !== 'derived' || derived.construction?.op !== e.type || !sameData(derived.construction.inputs, ids.slice(0, 3))) {
          fail('A quadrilateral names its derived fourth point last');
        }
        if (!degenerate[e.type](ordered.slice(0, 3))) fail('Degenerate element');
      } else if (e.type === 'polygon' ? polygonDegenerate(ordered) : degenerate[e.type](ordered)) fail('Degenerate element');
      return { id: e.id, type: e.type, points: ordered.map((p) => p.id), role: e.role, note: e.note ?? '' };
    });
    return { schemaVersion: 1, points: raw.map((p) => pointMap.get(p.id)), elements, note: input.note };
  }
  // Derived positions are computed from their construction and are not written as authority.
  // A free point carries no construction key; derived positions are recomputed, not trusted.
  const serialize = (board) => {
    const canonical = validate(board);
    return JSON.stringify({ kind: KIND, ...canonical,
      points: canonical.points.map(({ construction, ...rest }) => construction ? { ...rest, construction } : rest) });
  };
  const cloneBoard = (board) => validate(clone(board));
  // A circle's centre is a handle for the whole circle: moving it carries the rim
  // point by the same offset, so the radius never changes on a centre drag.
  const circlesAt = (canonical, id) => canonical.elements.filter((e) => e.type === 'circle' && e.centerPointId === id);
  // Walk start -> target and return the last position the predicate still accepts.
  function lastLegal(start, target, legal) {
    let good = start, bad = target;
    for (let step = 0; step < 40; step++) {
      const probe = { x: (good.x + bad.x) / 2, y: (good.y + bad.y) / 2 };
      if (legal(probe)) good = probe; else bad = probe;
    }
    return good;
  }
  // The same walk along a fraction of one requested move: try the whole move, then halve
  // until the last accepted fraction is found. `placed(t)` answers the legal board at
  // fraction `t`, or null when the model cannot place it there.
  function lastLegalFraction(placed, fallback) {
    const direct = placed(1);
    if (direct) return direct;
    let best = placed(0) || fallback();
    let lo = 0, hi = 1;
    for (let step = 0; step < 40; step++) {
      const mid = (lo + hi) / 2;
      const got = placed(mid);
      if (got) { best = got; lo = mid; } else hi = mid;
    }
    return best;
  }
  const isPointIdle = (canonical, id) => !pointReferenced(canonical, id);
  function makeIdle(canonical) {
    const spare = new Set();
    let board = canonical;
    for (const point of canonical.points) {
      if (isPointIdle(board, point.id)) { spare.add(point.id); continue; }
      const moved = { ...point, x: -1000 - (spare.size + 1) * 10, y: -1000 };
      try { board = validate({ ...board, points: board.points.map((p) => (p.id === point.id ? moved : p)) }); spare.add(point.id); }
      catch { /* keep it where it is; the shape test below still runs */ }
    }
    return { board, spare };
  }
  function restoreIdle(from, board, spare) {
    const back = new Map(from.points.map((p) => [p.id, p]));
    return validate({ ...board, points: board.points.map((p) => (spare.has(p.id) && back.has(p.id)
      ? { ...p, x: back.get(p.id).x, y: back.get(p.id).y } : p)) });
  }
  // Circle collisions use filled interiors, not only circumference crossings: a segment
  // or another closed shape wholly inside the disk still overlaps it. External tangency
  // is a single shared touch and is allowed. This tolerance is numerical, not a snap gap.
  const COLLISION_TOLERANCE = 1e-7;
  function pointSegmentDistance(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const length2 = dx * dx + dy * dy;
    const t = length2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length2)) : 0;
    return distance(p, { x: a.x + t * dx, y: a.y + t * dy });
  }
  function pointInRing(point, ring) {
    let within = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if (pointSegmentDistance(point, a, b) <= COLLISION_TOLERANCE) return false;
      if ((a.y > point.y) !== (b.y > point.y)
        && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) within = !within;
    }
    return within;
  }
  function circleCrowds(board, circle, other) {
    const point = (id) => board.points.find((p) => p.id === id);
    const center = point(circle.centerPointId);
    const radius = distance(center, point(circle.radiusPointId));
    if (other.type === 'circle') {
      return distance(center, point(other.centerPointId))
        < radius + distance(point(other.centerPointId), point(other.radiusPointId)) - COLLISION_TOLERANCE;
    }
    const ring = other.points.map(point);
    return shapeEdges(other).some(([a, b]) => pointSegmentDistance(center, point(a), point(b)) < radius - COLLISION_TOLERANCE)
      || (other.type !== 'segment' && pointInRing(center, ring));
  }
  // Whether a drag is legal: a shape must stay simple, so a polygon may not cross itself and
  // no two shapes may overlap. Points that take no part in any shape step aside for the
  // test, so a lone dot inside a triangle is never mistaken for a crossing.
  function layoutHolds(canonical, next) {
    const { board, spare } = makeIdle(next);
    const shapes = board.elements.filter((e) => e.type !== 'text');
    for (const element of shapes) {
      if (element.type === 'circle') continue;
      const ring = (element.points || []).map((id) => board.points.find((p) => p.id === id)).filter(Boolean);
      if (element.type === 'polygon' && ring.length >= 3 && polygonDegenerate(ring)) return false;
      const edges = shapeEdges(element).map(([a, b]) => [board.points.find((p) => p.id === a), board.points.find((p) => p.id === b)]);
      if (edges.some(([a, b]) => !a || !b)) return false;
      // A ring also stays simple: four corners cannot fold onto one line or across their
      // own edges, however far one side is dragged toward the other.
      if (element.type !== 'segment' && edges.some(([a, b]) => distance(a, b) <= EPSILON)) return false;
      // A ring keeps its own order: no side may fold over another, which is what happens
      // when one side is pushed past the side next to it.
      for (let i = 0; i < edges.length && element.type !== 'segment'; i++) {
        for (let j = i + 2; j < edges.length; j++) {
          if (i === 0 && j === edges.length - 1) continue;
          const [a, b] = edges[i], [c, d] = edges[j];
          if (segmentsMeet(a, b, c, d)) return false;
        }
      }
    }
    // Then no two shapes may cross each other. Only sharing a corner is allowed, so the
    // same shape compared with itself is skipped and shared vertices do not count.
    const segments = shapes.map((element) => ({
      id: element.id,
      edges: shapeEdges(element).map(([a, b]) => [board.points.find((p) => p.id === a), board.points.find((p) => p.id === b)]),
    }));
    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        if (shapes[i].type === 'circle' || shapes[j].type === 'circle') {
          const [circle, other] = shapes[i].type === 'circle' ? [shapes[i], shapes[j]] : [shapes[j], shapes[i]];
          // Existing compound diagrams (for example a circle centered on a polygon's
          // vertex) remain editable. Imports/creation retain their existing contract;
          // a previously disjoint pair may never acquire overlapping filled interiors.
          if (circleCrowds(board, circle, other) && !circleCrowds(canonical, circle, other)) return false;
        }
        for (const [a, b] of segments[i].edges) {
          for (const [c, d] of segments[j].edges) if (segmentsCrowd(a, b, c, d)) return false;
        }
      }
    }
    return Boolean(restoreIdle(canonical, board, spare));
  }
  // A drag on a quadrilateral corner holds the diagonally opposite corner still (spec §3).
  // The dragged corner follows the pointer, its opposite corner stays, and the other two
  // corners are recomputed about the shared diagonal midpoint. That is the same rule for a
  // rectangle and a parallelogram, and it needs no per-corner special case.
  //
  // A quadrilateral has the two diagonal pairs (A, C) and (B, D). With W the dragged corner
  // fixed at T and P its partner held, the other pair U, V turns about M = (T + P) / 2:
  //   parallelogram: U, V = M ± k, keeping the pair's own half-diagonal k (both diagonals
  //                  bisect each other, so every side stays parallel to its opposite);
  //   rectangle:     the diagonals of a rectangle are equal, so k is also rotated to be
  //                  perpendicular to T - P with |k| = |T - P| / 2. That forces the four
  //                  right angles while W follows the pointer exactly.
  function diagonalMove(canonical, id, target, finish = validate) {
    const shape = canonical.elements.find((e) => (e.type === 'rectangle' || e.type === 'parallelogram')
      && e.points.includes(id));
    if (!shape) return null;
    const ring = shape.points.map((ref) => canonical.points.find((p) => p.id === ref));
    const [a, b, c, d] = ring;
    if (!a || !b || !c || !d || d.kind !== 'derived') return null;
    // Diagonal pairs: P1/P3 and P2/P4. Each corner's partner is the one across the centre.
    const partnerOf = new Map([[a.id, c], [c.id, a], [b.id, d], [d.id, b]]);
    const partner = partnerOf.get(id);
    const owner = ring.find((p) => p.id === id);
    if (!partner || !owner || owner.kind !== 'free') return null;
    // The two corners that are neither the dragged one nor its partner; they turn about M.
    const turning = ring.filter((p) => p.id !== id && p.id !== partner.id);
    const rectangle = shape.type === 'rectangle';
    const boardAt = (t) => {
      const m = { x: (t.x + partner.x) / 2, y: (t.y + partner.y) / 2 };
      // The current half-diagonal of the turning pair, and the half-diagonal the pointer implies.
      const half = { x: (turning[0].x - turning[1].x) / 2, y: (turning[0].y - turning[1].y) / 2 };
      const span = { x: (t.x - partner.x) / 2, y: (t.y - partner.y) / 2 };
      // A rectangle needs |k| = |T - P| / 2 and k ⟂ T - P; a parallelogram keeps its own k.
      // Each turning corner keeps the side it was on: the pair's own half-diagonal tells
      // which one sits on the positive side of the turned half-diagonal.
      const turned = rectangle ? { x: -span.y, y: span.x } : half;
      const same = half.x * turned.x + half.y * turned.y >= 0;
      const placed = new Map([[id, t],
        [turning[0].id, { x: m.x + (same ? turned.x : -turned.x), y: m.y + (same ? turned.y : -turned.y) }],
        [turning[1].id, { x: m.x - (same ? turned.x : -turned.x), y: m.y - (same ? turned.y : -turned.y) }]]);
      const tried = { ...canonical, points: canonical.points.map((p) => {
        const at = placed.get(p.id);
        if (!at) return p;
        // Free corners only move inside the board; the derived corner is checked there too.
        return inside(at) ? { ...p, x: at.x, y: at.y } : fail('Invalid coordinate');
      }) };
      const next = finish(tried);
      return layoutHolds(canonical, next) ? next : fail('Invalid coordinate');
    };
    const start = { x: owner.x, y: owner.y };
    const legal = (t) => {
      if (!inside(t)) return false;
      try { boardAt(t); return true; } catch { return false; }
    };
    if (legal(target)) return boardAt(target);
    // Absorption: the pointer asked for a position the shape cannot take, so the drag stops
    // at the last legal position on the way there instead of being read as another axis.
    return boardAt(lastLegal(start, target, legal));
  }
  // A drag asks for a target; the model answers where the point may actually go.
  function axisMove(canonical, id, patch, finish = validate) {
    const point = canonical.points.find((p) => p.id === id) || fail('Unknown point');
    if (point.kind !== 'free') fail('Only a free point can move');
    const target = { x: patch.x, y: patch.y };
    if (!finite(target.x) || !finite(target.y)) fail('Invalid coordinate');
    // A quadrilateral corner moves the whole ring, keeping its diagonal partner still.
    const diagonal = diagonalMove(canonical, id, target, finish);
    if (diagonal) return diagonal;
    const at = ({ x, y }) => ({ ...point, x, y });
    const shapeAt = (coordinate) => {
      const next = finish({ ...canonical, points: canonical.points.map((p) => p.id === id ? at(coordinate) : p) });
      if (!layoutHolds(canonical, next)) fail('Invalid coordinate');
      return next;
    };
    // A lone point that a shape still uses may not be dragged across another shape, so the
    // legal test is the shape test, not just the coordinate.
    const legal = (coordinate) => {
      try { shapeAt(coordinate); return true; } catch { return false; }
    };
    const clamped = { x: Math.max(MARGIN, Math.min(WIDTH - MARGIN, target.x)),
      y: Math.max(MARGIN, Math.min(HEIGHT - MARGIN, target.y)) };
    if (legal(clamped)) return shapeAt(clamped);
    // Any other shape: stop at the last legal point on the requested segment. The start is
    // always legal, so the bracket never leaves the board and always has a legal end.
    return shapeAt(lastLegal(point, clamped, legal));
  }
  // A circle's centre is a handle for the whole circle: moving it carries the rim point
  // by the same offset, so a centre drag never changes the radius.
  function carryCircles(next, start, id, coordinate) {
    const rimIds = new Set(circlesAt(next, id).map((e) => e.radiusPointId));
    if (!rimIds.size) return next;
    const dx = coordinate.x - start.x, dy = coordinate.y - start.y;
    return validate({ ...next, points: next.points.map((p) => {
      if (p.id === id) return { ...p, x: coordinate.x, y: coordinate.y };
      return rimIds.has(p.id) ? { ...p, x: p.x + dx, y: p.y + dy } : p;
    }) });
  }
  function movePoint(canonical, action) {
    const point = canonical.points.find((p) => p.id === action.id) || fail('Unknown point');
    // A quadrilateral corner drag answers with its whole ring; only a lone point needs the
    // circle translation, so the ring result is returned as the model computed it.
    if (!circlesAt(canonical, action.id).length) return axisMove(canonical, action.id, action);
    // Carry before validation and collision checks: testing the uncarried rim would
    // test a different radius, and could either reject a safe move or miss a collision.
    return axisMove(canonical, action.id, action, (next) => carryCircles(next, point, action.id,
      next.points.find((p) => p.id === action.id)));
  }
  // Move these free points by one vector. A circle whose centre is among them is
  // carried with it, so the radius stays. Derived corners are recomputed, not shifted.
  function shiftFree(canonical, ids, vector) {
    const shifts = new Map();
    for (const id of ids) {
      const point = canonical.points.find((p) => p.id === id);
      if (!point || point.kind !== 'free') continue;
      shifts.set(id, { x: point.x + vector.x, y: point.y + vector.y });
    }
    if (!shifts.size) return validate(canonical);
    for (const [id, at] of shifts) {
      const before = canonical.points.find((p) => p.id === id);
      const dx = at.x - before.x, dy = at.y - before.y;
      for (const element of canonical.elements) {
        if (element.type !== 'circle' || element.centerPointId !== id || shifts.has(element.radiusPointId)) continue;
        const rim = canonical.points.find((p) => p.id === element.radiusPointId);
        if (!rim || rim.kind !== 'free') continue;
        shifts.set(rim.id, { x: rim.x + dx, y: rim.y + dy });
      }
    }
    const next = validate({ ...canonical, points: canonical.points.map((p) => {
      const at = shifts.get(p.id);
      return at ? { ...p, x: at.x, y: at.y } : p;
    }) });
    // A translate may not step one shape across another either.
    if (!layoutHolds(canonical, next)) fail('The shape cannot move there');
    return next;
  }
  const placeEdge = (canonical, aId, bId, vector) => shiftFree(canonical, [aId, bId], vector);
  function slide(canonical, ids, vector) {
    const placed = (t) => {
      try { return shiftFree(canonical, ids, { x: vector.x * t, y: vector.y * t }); } catch { return null; }
    };
    return lastLegalFraction(placed, () => validate(canonical));
  }
  function translatePoints(canonical, action) {
    if (!Array.isArray(action.ids) || !action.ids.length || action.ids.length > 300 || new Set(action.ids).size !== action.ids.length) {
      fail('Select distinct points or shapes');
    }
    if (!finite(action.dx) || !finite(action.dy)) fail('Invalid coordinate');
    for (const id of action.ids) canonical.points.find((p) => p.id === id) || fail('Unknown point');
    return slide(canonical, action.ids, { x: action.dx, y: action.dy });
  }
  function moveEdge(canonical, action) {
    const edge = edgeAt(canonical, action);
    const { element, index } = edge;
    if (!finite(action.dx) || !finite(action.dy)) fail('Invalid coordinate');
    const [aId, bId] = shapeEdges(element)[index];
    const a = canonical.points.find((p) => p.id === aId);
    const b = canonical.points.find((p) => p.id === bId);
    let vector = { x: action.dx, y: action.dy };
    if (element.type === 'rectangle' && a && b) {
      const ex = b.x - a.x, ey = b.y - a.y;
      const len = Math.hypot(ex, ey);
      if (!(len > EPSILON)) return validate(canonical);
      const nx = -ey / len, ny = ex / len;
      const along = vector.x * nx + vector.y * ny;
      vector = { x: along * nx, y: along * ny };
    }
    // A drag on a side moves both of its ends. The side may not come closer than the
    // degenerate threshold to the other sides it touches: that is the size limit the
    // student can see, and it is the same threshold every other drag stops at.
    const apart = (next) => {
      const [aId2, bId2] = shapeEdges(element)[index];
      const ends = [aId2, bId2].map((id) => next.points.find((p) => p.id === id));
      const others = next.points.filter((p) => p.id !== aId2 && p.id !== bId2
        && (element.points || []).includes(p.id));
      return ends.every((end) => others.every((other) => distance(end, other) > EPSILON));
    };
    const placed = (t) => {
      try {
        const next = placeEdge(canonical, aId, bId, { x: vector.x * t, y: vector.y * t });
        const ok = apart(next) && layoutHolds(canonical, next);
        return ok ? next : null;
      } catch { return null; }
    };
    const direct = placed(1);
    if (direct) return direct;
    // The pointer asked for a size the shape cannot take. Stop at the last legal fraction.
    return lastLegalFraction(placed, () => validate(canonical));
  }
  function dependents(canonical, id) {
    const result = [];
    const queue = [id];
    while (queue.length) {
      const current = queue.shift();
      for (const p of canonical.points) {
        if (p.construction?.inputs.includes(current) && !result.includes(p.id)) { result.push(p.id); queue.push(p.id); }
      }
    }
    return result;
  }
  const elementPoints = (e) => e.type === 'circle' ? [e.centerPointId, e.radiusPointId] : e.type === 'text' ? [] : e.points;
  // True when some element outside `skip`, or some construction, still names this point.
  function pointReferenced(canonical, id, skip = new Set()) {
    if (!id) return false;
    for (const e of canonical.elements) {
      if (skip.has(e.id)) continue;
      if (elementPoints(e).includes(id)) return true;
    }
    return canonical.points.some((p) => p.id !== id && p.construction?.inputs.includes(id));
  }
  // Every point and element which disappears when `ids` are deleted, then everything that
  // depended on what went: a construction loses its input, an element loses a point, and a
  // quadrilateral's derived corner loses the shape it was only there to make.
  function cascade(canonical, ids) {
    const removed = new Set(ids);
    const queue = [...ids];
    while (queue.length) {
      const current = queue.shift();
      for (const id of dependents(canonical, current)) {
        if (!removed.has(id)) { removed.add(id); queue.push(id); }
      }
    }
    let elements = canonical.elements;
    for (;;) {
      const keep = elements.filter((e) => !elementPoints(e).some((ref) => removed.has(ref)));
      if (keep.length === elements.length) break;
      // A quadrilateral's fourth corner exists only to make that shape, so losing the shape
      // would leave it unexplained. A free-standing midpoint is a legitimate isolated point
      // even with no shape around it; its own removal is handled by the queue above, which
      // already took every construction that lost an input.
      for (const p of canonical.points) if (p.construction?.op === 'rectangle'
        || p.construction?.op === 'parallelogram') {
        if (!removed.has(p.id) && !keep.some((e) => elementPoints(e).includes(p.id))) {
          removed.add(p.id);
          for (const id of dependents(canonical, p.id)) if (!removed.has(id)) removed.add(id);
        }
      }
      elements = keep;
    }
    // Deletion never removes geometry the student still has: a point that the remaining
    // shapes and constructions do not use stays on the board, whether it was a circle's rim
    // handle or a dot placed by hand. Only the cascade above takes points away.
    return { points: canonical.points.filter((p) => !removed.has(p.id)), elements, removedPoints: removed };
  }
  function deleteIds(canonical, ids) {
    const result = cascade(canonical, ids);
    return validate({ ...canonical, points: result.points, elements: result.elements });
  }
  // Points that disappear with the named shapes: a segment's endpoints when nothing else
  // uses them, a circle's rim point when it is only that radius handle, and a
  // quadrilateral's derived corner. Other free vertices stay.
  function pointsLeavingWith(canonical, elementIds) {
    const skip = new Set(elementIds);
    const extra = [];
    const take = (id) => { if (id && !extra.includes(id)) extra.push(id); };
    for (const e of canonical.elements) {
      if (!skip.has(e.id)) continue;
      if (e.type === 'segment') {
        for (const id of e.points) if (!pointReferenced(canonical, id, skip)) take(id);
      } else if (e.type === 'circle') {
        if (e.radiusPointId && !pointReferenced(canonical, e.radiusPointId, skip)) take(e.radiusPointId);
      } else {
        for (const id of elementPoints(e)) {
          if (canonical.points.find((p) => p.id === id)?.kind === 'derived') take(id);
        }
      }
    }
    return extra;
  }
  function removeSelection(canonical, pointIds, elementIds) {
    const ids = [...pointIds];
    for (const id of pointsLeavingWith(canonical, elementIds)) if (!ids.includes(id)) ids.push(id);
    const elements = canonical.elements.filter((e) => !elementIds.includes(e.id));
    const next = validate({ ...canonical, elements });
    if (!ids.length) return next;
    return deleteIds(next, ids);
  }
  // A closed shape is a ring of edges. Index i joins point i to the next point, and the
  // last index closes the ring. A segment is its single edge. A circle has no edge.
  function shapeEdges(element) {
    const ids = element?.points;
    if (!ids || ids.length < 2) return [];
    if (element.type === 'segment') return [[ids[0], ids[1]]];
    if (element.type === 'circle') return [];
    const edges = [];
    for (let i = 0; i < ids.length; i++) edges.push([ids[i], ids[(i + 1) % ids.length]]);
    return edges;
  }
  // One edge's selection key. The model owns it, so the view, the delete action and the
  // resize gesture cannot resolve the same selection differently.
  const edgeKey = (id, index) => `${id}#${index}`;
  // The element and edge index a selection key names, or null when it names no live edge.
  function parseEdgeKey(canonical, key) {
    if (typeof key !== 'string') return null;
    const mark = key.lastIndexOf('#');
    if (mark <= 0) return null;
    const elementId = key.slice(0, mark);
    const indexText = key.slice(mark + 1);
    const index = Number(indexText);
    // Only the canonical spelling names an edge: "e-1#2.0" is not the key the view makes.
    if (!Number.isInteger(index) || String(index) !== indexText) return null;
    const element = canonical.elements.find((e) => e.id === elementId);
    if (!element) return null;
    const edges = shapeEdges(element);
    if (index < 0 || index >= edges.length) return null;
    return { element, index, points: edges[index] };
  }
  // One action may name an edge by its selection key ("e-1#2", as the view stores it) or by
  // an element id plus an index; both resolve through the same parser.
  const edgeAt = (canonical, action) => {
    const byKey = typeof action.id === 'string' ? parseEdgeKey(canonical, action.id) : null;
    if (byKey && (!Number.isInteger(action.index) || byKey.index === action.index)) return byKey;
    const edge = Number.isInteger(action.index) && typeof action.id === 'string'
      ? parseEdgeKey(canonical, edgeKey(action.id, action.index)) : null;
    return edge || fail('Unknown element');
  };
  // The midpoint a side already carries, or null. One side has one midpoint, and both the
  // button that offers the action and the model that accepts it read this rule here.
  const midpointOf = (canonical, a, b) => canonical.points.find((p) => p.construction?.op === 'midpoint'
    && p.construction.inputs.length === 2
    && p.construction.inputs.includes(a) && p.construction.inputs.includes(b)) || null;
  const sameSegment = (element, a, b) => element.type === 'segment'
    && ((element.points[0] === a && element.points[1] === b) || (element.points[0] === b && element.points[1] === a));
  // Drop the named edges. Every other side of that shape becomes its own segment, and a
  // vertex that no remaining side and nothing else uses is deleted with them.
  function deleteShapeEdges(canonical, refs) {
    const grouped = new Map();
    for (const ref of refs) {
      const bucket = grouped.get(ref.id) || [];
      if (!bucket.includes(ref.index)) bucket.push(ref.index);
      grouped.set(ref.id, bucket);
    }
    let board = canonical;
    for (const [id, indexes] of grouped) {
      const element = board.elements.find((e) => e.id === id) || fail('Unknown point');
      const edges = shapeEdges(element);
      if (!edges.length) fail('Unknown point');
      for (const index of indexes) {
        if (!Number.isInteger(index) || index < 0 || index >= edges.length) fail('Unknown point');
      }
      const drop = new Set(indexes);
      const keep = edges.filter((_, index) => !drop.has(index));
      let donor = board;
      const added = [];
      for (const [a, b] of keep) {
        if (board.elements.some((e) => e.id !== id && sameSegment(e, a, b)) || added.some((e) => sameSegment(e, a, b))) continue;
        const segId = nextId(donor, 'e');
        const seg = { id: segId, type: 'segment', points: [a, b], role: element.role, note: '' };
        added.push(seg);
        donor = { ...donor, elements: [...donor.elements, seg] };
      }
      const draft = { ...board, elements: [...board.elements.filter((e) => e.id !== id), ...added] };
      const survivors = new Set(keep.flat());
      const orphans = [];
      for (const pid of element.points) {
        if (survivors.has(pid) || orphans.includes(pid)) continue;
        if (!pointReferenced(draft, pid)) orphans.push(pid);
      }
      board = orphans.length ? deleteIds(validate(draft), orphans) : validate(draft);
    }
    return board;
  }
  function nextId(canonical, prefix) {
    let max = 0;
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);
    const inspect = (id) => {
      const match = pattern.exec(id);
      if (match) { const n = Number(match[1]); if (!Number.isSafeInteger(n)) fail('ID sequence exhausted'); max = Math.max(max, n); }
    };
    for (const p of canonical.points) inspect(p.id);
    for (const e of canonical.elements) inspect(e.id);
    if (!Number.isSafeInteger(max + 1)) fail('ID sequence exhausted');
    return `${prefix}-${max + 1}`;
  }
  // Labels are display names only. A new point is named from its own stable number, so a
  // deleted label is never recycled: A, B, C then B deleted yields D, not B again.
  const letters = (n) => {
    let name = '';
    for (let k = n; k > 0; k = Math.floor((k - 1) / 26)) name = String.fromCharCode(65 + ((k - 1) % 26)) + name;
    return name;
  };
  function nextLabel(canonical, id) {
    const used = new Set(canonical.points.map((p) => p.label));
    const match = /-(\d+)$/.exec(id);
    if (match) {
      const numbered = letters(Number(match[1]));
      if (!used.has(numbered)) return numbered;
    }
    for (let n = 1; n < 10000; n++) if (!used.has(letters(n))) return letters(n);
    for (let n = 1; n < 10000; n++) if (!used.has(`P${n}`)) return `P${n}`;
    fail('Label space exhausted');
  }
  const limited = (label) => {
    if (!text(label, 30) || !chars(label).length) fail('Invalid label');
  };
  // Allocate a point's label and own its uniqueness in one place: every point-creating
  // action accepts a student label or asks for the next free letter, then checks the set.
  function allocateLabel(canonical, id, action) {
    const label = Object.hasOwn(action, 'label') ? action.label : nextLabel(canonical, id);
    limited(label);
    if (canonical.points.some((p) => p.label === label)) fail('Labels must be unique');
    return label;
  }
  function reduceWith(canonical, action) {
    if (!record(action) || typeof action.type !== 'string') fail('Invalid action');
    if (action.type === 'batch') {
      const pending = [action]; const steps = []; let count = -1;
      while (pending.length) {
        const step = pending.pop();
        if (++count > 250 || !record(step) || typeof step.type !== 'string') fail('Invalid batch or action limit exceeded');
        if (step.type === 'batch') {
          if (!Array.isArray(step.actions) || step.actions.length > 250) fail('Invalid batch');
          for (let i = step.actions.length - 1; i >= 0; i--) pending.push(step.actions[i]);
          continue;
        }
        steps.push(step);
      }
      return steps.reduce((state, step) => reduceWith(state, step), canonical);
    }
    const pointById = (id) => canonical.points.find((p) => p.id === id) || fail('Unknown point');
    const elementById = (id) => canonical.elements.find((e) => e.id === id) || fail('Unknown element');
    const circle = (centerId, rimId) => {
      const center = pointById(centerId), rim = pointById(rimId);
      if (centerId === rimId || distance(center, rim) <= EPSILON) fail('A circle needs a centre and a different rim point');
    };
    switch (action.type) {
      case 'addPoint': {
        if (canonical.points.length >= 300) fail('Point limit exceeded');
        const id = nextId(canonical, 'p');
        const label = allocateLabel(canonical, id, action);
        const target = { x: action.x, y: action.y };
        if (!finite(target.x) || !finite(target.y) || !inside(target)) fail('Invalid coordinate');
        return validate({ ...canonical, points: [...canonical.points,
          { id, label, kind: 'free', x: target.x, y: target.y, construction: null, note: '' }] });
      }
      case 'addElement': {
        if (canonical.elements.length >= 300) fail('Element limit exceeded');
        keys(action, ['type', 'elementType'], ['points', 'centerPointId', 'radiusPointId', 'role', 'note']);
        const role = action.role ?? 'main';
        if (!elementTypes.includes(action.elementType) || !roles.includes(role)) fail('Unknown element type');
        const note = Object.hasOwn(action, 'note') ? action.note : '';
        if (!text(note, 500)) fail('Note exceeds 500 characters');
        const id = nextId(canonical, 'e');
        if (action.elementType === 'circle') {
          if (!action.centerPointId || !action.radiusPointId) fail('A circle needs its centre and rim points');
          circle(action.centerPointId, action.radiusPointId);
          return validate({ ...canonical, elements: [...canonical.elements,
            { id, type: 'circle', centerPointId: action.centerPointId, radiusPointId: action.radiusPointId, role, note }] });
        }
        if (!Array.isArray(action.points)) fail('Invalid point list');
        const orderedIds = [...action.points];
        if (new Set(orderedIds).size !== orderedIds.length) fail('Repeated point reference');
        if (action.elementType === 'polygon' && (orderedIds.length < 3 || orderedIds.length > 60)) fail('A polygon has three to sixty points');
        if (action.elementType === 'segment' && orderedIds.length !== 2) fail('A segment has two points');
        for (const ref of orderedIds) if (!ref) fail('A point reference is missing');
        orderedIds.forEach(pointById);
        if (action.elementType === 'parallelogram' || action.elementType === 'rectangle') {
          if (orderedIds.length !== 3) fail('This shape starts from three points');
          let board = canonical;
          if (action.elementType === 'rectangle') {
            // The third click sets the height. Keep P1P2 and place P3 on the perpendicular
            // through P2. The click itself is not a corner: it only asks which side and how
            // far, so the third point is placed on the right-angle corner and the click's
            // own point never becomes part of the shape, exactly as the preview shows.
            const [a, b, c] = orderedIds.map((ref) => board.points.find((p) => p.id === ref));
            const placed = rectangleThird(a, b, c);
            if (!placed) fail('Degenerate element');
            if (!inside(placed.third) || !inside(placed.fourth)) fail('The fourth point would leave the board');
            if (distance(c, placed.third) <= EPSILON) {
              board = validate({ ...board, points: board.points.map((p) => p.id === c.id
                ? { ...p, x: placed.third.x, y: placed.third.y } : p) });
            } else {
              const thirdId = nextId(board, 'p');
              const thirdPoint = { id: thirdId, label: nextLabel(board, thirdId), kind: 'free',
                x: placed.third.x, y: placed.third.y, construction: null, note: '' };
              board = validate({ ...board, points: [...board.points, thirdPoint] });
              orderedIds[2] = thirdId;
              // The click point made for this shape, and nothing else, is no longer part of
              // the board: leaving it behind would show a stray corner the student never drew.
              if (isPointIdle(board, c.id)) {
                board = validate({ ...board, points: board.points.filter((p) => p.id !== c.id) });
              }
            }
          }
          const at = fourthPoint(...orderedIds.map((ref) => board.points.find((p) => p.id === ref)));
          if (!inside(at)) fail('The fourth point would leave the board');
          const derivedId = nextId(board, 'p');
          const derived = { id: derivedId, label: nextLabel(board, derivedId), kind: 'derived', ...at,
            construction: { op: action.elementType, inputs: orderedIds }, note: '' };
          const candidate = validate({ ...board, points: [...board.points, derived] });
          const shape = { id, type: action.elementType, points: [...orderedIds, derivedId], role, note };
          return validate({ ...candidate, elements: [...candidate.elements, shape] });
        }
        return validate({ ...canonical, elements: [...canonical.elements,
          { id, type: action.elementType, points: orderedIds, role, note }] });
      }
      case 'movePoint': {
        const point = pointById(action.id);
        if (point.kind !== 'free') fail('Only a free point can move');
        if (!finite(action.x) || !finite(action.y)) fail('Invalid coordinate');
        // A quadrilateral corner drag moves several corners at once; every other point
        // moves alone. Either way the model answers with the whole legal next board.
        return movePoint(canonical, action);
      }
      case 'moveEdge': return moveEdge(canonical, action);
      case 'translate': return translatePoints(canonical, action);
      case 'addMidpoint': {
        const [a, b] = [pointById(action.a), pointById(action.b)];
        if (action.a === action.b) fail('A midpoint needs two different points');
        // A side has one midpoint. The control that offers the action is disabled when one
        // exists, but the model is what makes it true, so a second request is refused here.
        if (midpointOf(canonical, action.a, action.b)) fail('This side already has its midpoint');
        const at = midpoint(a, b);
        if (!inside(at)) fail('The midpoint would leave the board');
        const id = nextId(canonical, 'p');
        const label = allocateLabel(canonical, id, action);
        return validate({ ...canonical, points: [...canonical.points, { id, label, kind: 'derived',
          ...at, construction: { op: 'midpoint', inputs: [action.a, action.b] }, note: '' }] });
      }
      case 'renamePoint': {
        pointById(action.id);
        limited(action.label);
        if (canonical.points.some((p) => p.id !== action.id && p.label === action.label)) fail('Labels must be unique');
        return validate({ ...canonical, points: canonical.points.map((p) => p.id === action.id ? { ...p, label: action.label } : p) });
      }
      case 'annotate': {
        if (!text(action.value, 500)) fail('Note exceeds 500 characters');
        const value = action.value.trim() ? action.value : '';
        if (action.target === 'point') return validate({ ...canonical, points: canonical.points.map((p) => p.id === action.id ? { ...p, note: value } : p) });
        elementById(action.id);
        return validate({ ...canonical, elements: canonical.elements.map((e) => e.id === action.id ? { ...e, note: value } : e) });
      }
      case 'note': if (!text(action.value, 500)) fail('Note exceeds 500 characters'); return validate({ ...canonical, note: action.value });
      case 'addText': {
        if (canonical.elements.length >= 300) fail('Element limit exceeded');
        if (typeof action.text !== 'string' || !words(action.text) || emptyText(action.text)) fail('Invalid text');
        const role = action.role ?? 'main';
        if (!roles.includes(role)) fail('Unknown element type');
        const anchor = { x: action.x, y: action.y };
        if (!finite(anchor.x) || !finite(anchor.y)) fail('Invalid coordinate');
        // A new text is placed from its left edge; only its anchor has to reach the board.
        if (anchor.x < 0 || anchor.x > WIDTH - 24 || anchor.y < MARGIN || anchor.y > HEIGHT - MARGIN) fail('Invalid coordinate');
        return validate({ ...canonical, elements: [...canonical.elements,
          { id: nextId(canonical, 'e'), type: 'text', role, note: '', x: anchor.x, y: anchor.y, text: action.text.trim() }] });
      }
      case 'moveText': {
        const item = elementById(action.id);
        if (item.type !== 'text') fail('Only a text can move');
        if (!finite(action.x) || !finite(action.y)) fail('Invalid coordinate');
        // The drag answers where the anchor may go: clamped to the board on release.
        const to = { x: Math.max(0, Math.min(WIDTH, action.x)), y: Math.max(MARGIN, Math.min(HEIGHT - MARGIN, action.y)) };
        return validate({ ...canonical, elements: canonical.elements.map((e) => e.id === item.id ? { ...e, x: to.x, y: to.y } : e) });
      }
      case 'editText': {
        const item = elementById(action.id);
        if (item.type !== 'text') fail('Only a text can be edited');
        if (typeof action.text !== 'string' || !words(action.text) || emptyText(action.text)) fail('Invalid text');
        return validate({ ...canonical, elements: canonical.elements.map((e) => e.id === item.id ? { ...e, text: action.text.trim() } : e) });
      }
      case 'delete': {
        if (!Array.isArray(action.ids) || !action.ids.length || action.ids.length > 300 || new Set(action.ids).size !== action.ids.length) fail('Select distinct points or shapes');
        const pointIds = [];
        const elementIds = [];
        const edgeRefs = [];
        for (const id of action.ids) {
          const mark = typeof id === 'string' ? id.lastIndexOf('#') : -1;
          if (mark > 0) {
            const elementId = id.slice(0, mark);
            const indexText = id.slice(mark + 1);
            const index = Number(indexText);
            if (Number.isInteger(index) && String(index) === indexText && canonical.elements.some((e) => e.id === elementId)) {
              edgeRefs.push({ id: elementId, index });
              continue;
            }
          }
          if (canonical.points.some((p) => p.id === id)) pointIds.push(id);
          else if (canonical.elements.some((e) => e.id === id)) elementIds.push(id);
          else fail('Unknown point');
        }
        let next = edgeRefs.length ? deleteShapeEdges(canonical, edgeRefs) : canonical;
        const livePoints = pointIds.filter((pid) => next.points.some((p) => p.id === pid));
        const liveElements = elementIds.filter((eid) => next.elements.some((e) => e.id === eid));
        if (liveElements.length) return removeSelection(next, livePoints, liveElements);
        if (livePoints.length) return deleteIds(next, livePoints);
        return next;
      }
      case 'deleteElement': {
        elementById(action.id);
        return removeSelection(canonical, [], [action.id]);
      }
      case 'clear': return validate({ ...empty(), note: canonical.note });
      default: fail('Unknown action');
    }
  }
  const reduce = (board, action) => reduceWith(cloneBoard(board), action);
  /**
   * Drag preview: where the model would land the point if the pointer were released here,
   * or null when it cannot move. Everything the view draws during the drag comes from here,
   * so the view never re-derives geometry the model already computed:
   *   `x`, `y`  the dragged point,
   *   `rims`    { rimId: {x, y} } every circle rim the drag carries along,
   *   `corners` the other quadrilateral corners a corner drag moves, as [{id, x, y}].
   */
  const constrainedMove = (board, id, x, y) => {
    const canonical = cloneBoard(board);
    const before = canonical.points.find((p) => p.id === id);
    if (!before || before.kind !== 'free') return null;
    let next;
    try { next = movePoint(canonical, { id, x, y }); } catch { return null; }
    const rims = {};
    for (const e of canonical.elements) {
      if (e.type !== 'circle' || e.centerPointId !== id) continue;
      const rim = next.points.find((p) => p.id === e.radiusPointId);
      if (rim) rims[rim.id] = { x: rim.x, y: rim.y };
    }
    // Any other point a construction carries must be drawn at its preview position too,
    // so a corner drag shows the whole ring moving rather than a lone corner.
    const corners = next.points
      .filter((p) => p.id !== id && !Object.hasOwn(rims, p.id)
        && canonical.points.some((q) => q.id === p.id && (q.x !== p.x || q.y !== p.y)))
      .map((p) => ({ id: p.id, x: p.x, y: p.y }));
    const dragged = next.points.find((p) => p.id === id);
    return { x: dragged.x, y: dragged.y, rims, corners };
  };
  // The delta a drag actually landed, read back from the board the model returned. An edge
  // drag is answered with the same delta when it goes through and with a shorter one when
  // the model stopped it at a degenerate shape, so the release can commit the landing.
  function landedDelta(canonical, next, ids) {
    const moved = new Map(next.points.map((p) => [p.id, p]));
    const pairs = ids
      .map((id) => [canonical.points.find((q) => q.id === id), moved.get(id)])
      .filter(([before, after]) => before && after);
    if (!pairs.length) return null;
    // The drag's own direction, read off the average motion: an edge that may only move
    // along one axis keeps its full component there instead of averaging a zero in.
    const moved0 = pairs[0][1].x - pairs[0][0].x, moved1 = pairs[0][1].y - pairs[0][0].y;
    const along = Math.hypot(moved0, moved1) || 1;
    const dx = pairs.reduce((sum, [before, after]) => sum + (after.x - before.x), 0) / pairs.length;
    const dy = pairs.reduce((sum, [before, after]) => sum + (after.y - before.y), 0) / pairs.length;
    return { dx: (dx * moved0 + dy * moved1) / along * (moved0 / along), dy: (dx * moved0 + dy * moved1) / along * (moved1 / along) };
  }
  // Edge-drag preview. `x` and `y` are the delta the student asked for; `landed` is the
  // delta the model accepted; `corners` is every point the model actually moved.
  const constrainedEdgeMove = (board, id, index, dx, dy) => {
    const canonical = cloneBoard(board);
    let next;
    try { next = moveEdge(canonical, { id, index, dx, dy }); } catch { return null; }
    const corners = next.points
      .filter((p) => {
        const before = canonical.points.find((q) => q.id === p.id);
        return before && (before.x !== p.x || before.y !== p.y);
      })
      .map((p) => ({ id: p.id, x: p.x, y: p.y }));
    const delta = landedDelta(canonical, next, corners.map((c) => c.id)) || { dx: 0, dy: 0 };
    return { x: dx, y: dy, rims: {}, corners, landed: delta };
  };
  // Whole-shape drag. Same preview shape as an edge drag: every point that actually moved.
  const constrainedTranslate = (board, ids, dx, dy) => {
    const canonical = cloneBoard(board);
    let next;
    try { next = translatePoints(canonical, { ids, dx, dy }); } catch { return null; }
    const corners = next.points
      .filter((p) => {
        const before = canonical.points.find((q) => q.id === p.id);
        return before && (before.x !== p.x || before.y !== p.y);
      })
      .map((p) => ({ id: p.id, x: p.x, y: p.y }));
    return { x: dx, y: dy, rims: {}, corners };
  };;
  // The drawable library, in toolbox order. A point is a point; the rest are elements.
  const shapeLibrary = ['point', ...elementTypes, ...textTypes];
  // One estimate of a rendered text's box, shared by the student page's selection frame
  // and hit test so the drawn writing and the clickable writing cannot drift apart.
  const TEXT_SIZE = 16;
  const TEXT_LINE = 20;
  const textBox = (lines) => ({
    width: Math.max(28, Math.max(...lines.map((line) => chars(line).length)) * TEXT_SIZE * 0.62 + 8),
    height: lines.length * TEXT_LINE + 2,
  });
  // The writing chart a view draws on one canvas: its anchor is its left baseline and each
  // line drops by TEXT_LINE. `scale` is a text drawn larger (the teacher demo page draws
  // every text one size bigger, so the same writing measures proportionally).
  const textMetrics = (scale = 1) => ({
    size: TEXT_SIZE * scale, line: TEXT_LINE * scale,
    box: (lines) => { const measured = textBox(lines.length ? lines : ['']); return { width: measured.width * scale, height: measured.height * scale }; },
  });
  return { kind: KIND, coordinateSystem, shapeLibrary, elementTypes: [...elementTypes], roles: [...roles], operations: [...operations],
    bounds: { width: WIDTH, height: HEIGHT, margin: MARGIN, epsilon: EPSILON },
    // A view that draws text at another size measures it here, so the drawing and the
    // space reserved around it can never disagree.
    empty, validate, reduce, TEXT_MAX, textBox: (lines) => textBox(lines.length ? lines : ['']), textMetrics,
    constrainedMove, constrainedEdgeMove, constrainedTranslate, serialize,
    // Edge identity and edge lookups are the model's, so every page reads a selection the
    // same way the actions behind it do.
    shapeEdges, edgeKey, parseEdgeKey, edgeAt, midpointOf, rectanglePlacement,
    dependents: (board, id) => dependents(cloneBoard(board), id) };
}
