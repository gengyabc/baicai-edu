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
  // Every three-point construction uses P4 = P1 + P3 - P2. A rectangle is a parallelogram
  // whose right angle sits at P2, so the interface pins that corner: dragging P1 or P3
  // then changes only a side length and keeps all four corner right.
  const fourthPoint = (a, b, c) => ({ x: a.x + c.x - b.x, y: a.y + c.y - b.y });
  // The anchor B of a rectangle carries the right angle, so it is the one corner
  // which never moves; its two neighbours slide along the perpendicular legs.
  const fixedAnchor = (canonical, id) => {
    const owner = canonical.elements.find((e) => e.type === 'rectangle' && e.points.includes(id));
    if (!owner) return false;
    return owner.points[1] === id;
  };
  // Input corners P1 P2 P3: P2 and P4 are the diagonal pair. A rectangle needs the
  // right angle at P2, the corner every drag keeps.
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
        if (cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0) return true;
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
        if (p.construction != null) fail('A free point carries no construction');
        pointMap.set(p.id, { id: p.id, label: p.label, kind: 'free', x: p.x, y: p.y, construction: null, note: p.note ?? '' });
        continue;
      }
      const construction = validateConstruction(p.construction, pointMap, p.id);
      const inputs = construction.inputs.map((ref) => pointMap.get(ref));
      const at = construction.op === 'midpoint' ? midpoint(inputs[0], inputs[1]) : fourthPoint(...inputs);
      pointMap.set(p.id, { id: p.id, label: p.label, kind: 'derived', ...at, construction, note: p.note ?? '' });
    }
    const elements = input.elements.map((e) => {
      keys(e, ['id', 'type', 'role', 'note'], ['points', 'centerPointId', 'radiusPointId']);
      if (!idValid(e.id) || ids.has(e.id) || !elementTypes.includes(e.type) || !roles.includes(e.role) || !text(e.note ?? '', 500)) fail('Invalid element');
      ids.add(e.id);
      const point = (ref) => pointMap.get(ref) || fail('Element references an unknown point');
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
  function withPoint(canonical, id, patch) {
    const point = canonical.points.find((p) => p.id === id) || fail('Unknown point');
    if (point.kind !== 'free') fail('Only a free point can move');
    const moved = { ...point, x: patch.x, y: patch.y };
    if (!finite(moved.x) || !finite(moved.y) || !inside(moved)) fail('Invalid coordinate');
    return validate({ ...canonical, points: canonical.points.map((p) => p.id === id ? moved : p) });
  }
  function allowed(canonical, id, patch) {
    try { withPoint(canonical, id, patch); return true; } catch { return false; }
  }
  // In a rectangle one corner carries the right angle and cannot move; the two
  // corners next to it may slide along their own leg only. A corner slides by
  // the projection of the request onto that leg, which keeps every angle exact.
  function legOf(canonical, id) {
    const owner = canonical.elements.find((e) => e.type === 'rectangle' && e.points.includes(id));
    if (!owner) return null;
    const b = canonical.points.find((q) => q.id === owner.points[1]);
    const a = canonical.points.find((q) => q.id === owner.points[0]);
    const c = canonical.points.find((q) => q.id === owner.points[2]);
    if (!b || !a || !c || owner.points[1] === id) return null;
    // Each free end owns exactly one leg: A owns BA, C owns BC. The direction points
    // away from the anchor and has the leg's own length.
    const end = owner.points[0] === id ? a : c;
    const vector = { x: end.x - b.x, y: end.y - b.y };
    const length = Math.hypot(vector.x, vector.y);
    if (length <= EPSILON) return null;
    return { b, end, unit: { x: vector.x / length, y: vector.y / length } };
  }
  // A drag asks for a target; the model answers where the point may actually go.
  function axisMove(canonical, id, patch) {
    const point = canonical.points.find((p) => p.id === id) || fail('Unknown point');
    const target = { x: patch.x, y: patch.y };
    if (!finite(target.x) || !finite(target.y)) fail('Invalid coordinate');
    const start = { x: point.x, y: point.y };
    const clamped = { x: Math.max(MARGIN, Math.min(WIDTH - MARGIN, target.x)),
      y: Math.max(MARGIN, Math.min(HEIGHT - MARGIN, target.y)) };
    if (allowed(canonical, id, clamped)) return clamped;
    const leg = legOf(canonical, id);
    // Sliding along the leg by the requested amount is exact for a rectangle.
    if (leg) {
      const along = (clamped.x - start.x) * leg.unit.x + (clamped.y - start.y) * leg.unit.y;
      const wanted = { x: start.x + leg.unit.x * along, y: start.y + leg.unit.y * along };
      const goal = { x: Math.max(MARGIN, Math.min(WIDTH - MARGIN, wanted.x)), y: Math.max(MARGIN, Math.min(HEIGHT - MARGIN, wanted.y)) };
      if (allowed(canonical, id, goal)) return goal;
      let good = start, bad = goal;
      for (let step = 0; step < 40; step++) {
        const probe = { x: (good.x + bad.x) / 2, y: (good.y + bad.y) / 2 };
        if (allowed(canonical, id, probe)) good = probe; else bad = probe;
      }
      return good;
    }
    // Any other shape: bisect the segment start -> target for the last legal point.
    let good = start, bad = clamped;
    for (let step = 0; step < 40; step++) {
      const probe = { x: (good.x + bad.x) / 2, y: (good.y + bad.y) / 2 };
      if (allowed(canonical, id, probe)) good = probe; else bad = probe;
    }
    return good;
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
  const elementPoints = (e) => e.type === 'circle' ? [e.centerPointId, e.radiusPointId] : e.points;
  /** Every point and element which disappears when `ids` are deleted, then all elements losing a point. */
  function cascade(canonical, ids) {
    const removed = new Set(ids);
    const queue = [...ids];
    while (queue.length) {
      const current = queue.shift();
      for (const p of canonical.points) {
        if (p.construction?.inputs.includes(current) && !removed.has(p.id)) { removed.add(p.id); queue.push(p.id); }
      }
    }
    let elements = canonical.elements;
    for (;;) {
      const keep = elements.filter((e) => !elementPoints(e).some((ref) => removed.has(ref)));
      if (keep.length === elements.length) break;
      const gone = new Set(elements.filter((e) => !keep.includes(e)).map((e) => e.id));
      // A derived point exists only to make a shape; losing that shape would leave it unexplained.
      // Dependents of a removed point lose their inputs; and a derived point whose
      // inputs are still present stays as a legitimate isolated point.
      for (const p of canonical.points) if (p.kind === 'derived' && !removed.has(p.id)
        && !keep.some((e) => elementPoints(e).includes(p.id)) && p.construction.inputs.every((input) => removed.has(input))) {
        removed.add(p.id); gone.add(p.id);
      }
      elements = keep;
    }
    return { points: canonical.points.filter((p) => !removed.has(p.id)), elements, removedPoints: removed };
  }
  function deleteIds(canonical, ids) {
    const result = cascade(canonical, ids);
    // Deleting a shape keeps the points it merely passed through.
    return validate({ ...canonical, points: result.points, elements: result.elements });
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
  // Labels are display names only; a deleted label is never recycled, so A stays the same A.
  function nextLabel(canonical) {
    const used = new Set(canonical.points.map((p) => p.label));
    const letters = (n) => {
      let name = '';
      for (let k = n; k > 0; k = Math.floor((k - 1) / 26)) name = String.fromCharCode(65 + ((k - 1) % 26)) + name;
      return name;
    };
    for (let n = 1; n < 10000; n++) if (!used.has(letters(n))) return letters(n);
    for (let n = 1; n < 10000; n++) if (!used.has(`P${n}`)) return `P${n}`;
    fail('Label space exhausted');
  }
  const limited = (label) => {
    if (!text(label, 30) || !chars(label).length) fail('Invalid label');
  };
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
        const label = Object.hasOwn(action, 'label') ? action.label : nextLabel(canonical);
        limited(label);
        if (canonical.points.some((p) => p.label === label)) fail('Labels must be unique');
        const target = { x: action.x, y: action.y };
        if (!finite(target.x) || !finite(target.y) || !inside(target)) fail('Invalid coordinate');
        return validate({ ...canonical, points: [...canonical.points,
          { id: nextId(canonical, 'p'), label, kind: 'free', x: target.x, y: target.y, construction: null, note: '' }] });
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
          const at = fourthPoint(...orderedIds.map(pointById));
          if (!inside(at)) fail('The fourth point would leave the board');
          const derivedId = nextId(canonical, 'p');
          const derived = { id: derivedId, label: nextLabel(canonical), kind: 'derived', ...at,
            construction: { op: action.elementType, inputs: orderedIds }, note: '' };
          const candidate = validate({ ...canonical, points: [...canonical.points, derived] });
          const shape = { id, type: action.elementType, points: [...orderedIds, derivedId], role, note };
          return validate({ ...candidate, elements: [...candidate.elements, shape] });
        }
        return validate({ ...canonical, elements: [...canonical.elements,
          { id, type: action.elementType, points: orderedIds, role, note }] });
      }
      case 'movePoint': {
        const point = pointById(action.id);
        if (point.kind !== 'free') fail('Only a free point can move');
        if (fixedAnchor(canonical, action.id)) fail('The right-angled corner stays in place');
        if (!finite(action.x) || !finite(action.y)) fail('Invalid coordinate');
        const at = axisMove(canonical, action.id, action);
        // The click landed outside the board: the point stays where it was.
        if (!finite(at.x) || !finite(at.y) || !inside(at)) fail('Invalid coordinate');
        return withPoint(canonical, action.id, at);
      }
      case 'addMidpoint': {
        const [a, b] = [pointById(action.a), pointById(action.b)];
        if (action.a === action.b) fail('A midpoint needs two different points');
        const at = midpoint(a, b);
        if (!inside(at)) fail('The midpoint would leave the board');
        const label = Object.hasOwn(action, 'label') ? action.label : nextLabel(canonical);
        limited(label);
        if (canonical.points.some((p) => p.label === label)) fail('Labels must be unique');
        return validate({ ...canonical, points: [...canonical.points, { id: nextId(canonical, 'p'), label, kind: 'derived',
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
      case 'delete': {
        if (!Array.isArray(action.ids) || !action.ids.length || action.ids.length > 300 || new Set(action.ids).size !== action.ids.length) fail('Select distinct points or shapes');
        for (const id of action.ids) { pointById(id); }
        return deleteIds(canonical, action.ids);
      }
      case 'deleteElement': {
        elementById(action.id);
        // A derived point exists only to make this shape, so it goes with it.
        const extra = elementPoints(elementById(action.id)).filter((id) => pointById(id).kind === 'derived');
        return deleteIds(canonical, [action.id, ...extra]);
      }
      case 'clear': return validate({ ...empty(), note: canonical.note });
      default: fail('Unknown action');
    }
  }
  const reduce = (board, action) => reduceWith(cloneBoard(board), action);
  /** Drag preview: the position the model will accept if the pointer is released here. */
  const constrainedMove = (board, id, x, y) => {
    const at = axisMove(cloneBoard(board), id, { x, y });
    return inside(at) ? at : null;
  };
  return { kind: KIND, coordinateSystem, elementTypes: [...elementTypes], roles: [...roles], operations: [...operations],
    bounds: { width: WIDTH, height: HEIGHT, margin: MARGIN, epsilon: EPSILON },
    empty, validate, reduce, constrainedMove, dependents: (board, id) => dependents(cloneBoard(board), id), serialize };
}
