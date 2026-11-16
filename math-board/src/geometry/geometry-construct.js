// Geometry construct chapter (G06–G09). A step passes only when the named tool or
// action commits. Nothing here measures a length, an angle, or a relation, and
// nothing here calls observe on a point or segment it had to supply.
// Self-contained for build.mjs.
export function createGeometryConstructChapter({ G, emptyFrame }) {
  const steps = ['construct-parallelogram', 'construct-rectangle', 'construct-select-side', 'construct-midpoint', 'construct-drag', 'construct-auxiliary', 'construct-auxiliary-off'];
  const at = (step) => steps.indexOf(step);
  // createGoal() runs before start(). The first snapshot reads the ids start() or
  // fresh() stored here.
  let prepared = null;
  const copy = (value) => JSON.parse(JSON.stringify(value));
  // Three clicks on the first three stay inside the board: P4 = P1 + P3 - P2.
  const spots = [[200, 180], [400, 180], [280, 320], [480, 300], [180, 440], [520, 440]];
  const idOk = (value) => typeof value === 'string' && value.length > 0;
  const sideOk = (value) => Array.isArray(value) && value.length === 2 && value[0] !== value[1] && value.every(idOk);
  const freePoints = (board) => board.points.filter((point) => point.kind === 'free');
  const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const added = (before, after, type) => (after?.elements || []).filter((element) => element.type === type
    && !(before?.elements || []).some((old) => old.id === element.id));
  function trio(board) {
    const points = freePoints(board);
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        for (let k = j + 1; k < points.length; k += 1) {
          // The model refuses a flat parallelogram. Three clicks need a real triangle.
          if (Math.abs(cross(points[i], points[j], points[k])) > 0.5) return true;
        }
      }
    }
    return false;
  }
  function place(frame) {
    const spot = spots.find(([x, y]) => frame.board.points.every((point) => Math.hypot(point.x - x, point.y - y) > 24));
    if (!spot) throw Error('Construct prerequisites are unavailable');
    frame.board = G.reduce(frame.board, { type: 'addPoint', x: spot[0], y: spot[1] });
    return frame.board.points.at(-1);
  }
  function endsFree(board, ids) {
    if (!Array.isArray(ids) || ids.length !== 2 || ids[0] === ids[1]) return false;
    const points = ids.map((id) => board.points.find((point) => point.id === id));
    return points.every((point) => point && point.kind === 'free') && !G.midpointOf(board, ids[0], ids[1]);
  }
  function usableSegment(board) {
    return board.elements.find((element) => element.type === 'segment' && endsFree(board, element.points)) || null;
  }
  function pairWithoutMidpoint(board) {
    const points = freePoints(board);
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        if (!G.midpointOf(board, points[i].id, points[j].id)) return [points[i].id, points[j].id];
      }
    }
    return null;
  }
  // One segment, or one edge of a polygon, rectangle, or parallelogram.
  function sideFrom(board, key) {
    const edge = G.parseEdgeKey(board, key);
    if (edge) {
      if (!['polygon', 'rectangle', 'parallelogram'].includes(edge.element.type)) return null;
      return edge.points;
    }
    const element = board.elements.find((item) => item.id === key);
    if (!element || element.type !== 'segment') return null;
    return element.points;
  }
  function selectionFor(board, side) {
    const segment = board.elements.find((element) => element.type === 'segment'
      && ((element.points[0] === side[0] && element.points[1] === side[1])
        || (element.points[0] === side[1] && element.points[1] === side[0])));
    if (segment) return [segment.id];
    for (const element of board.elements) {
      if (!['polygon', 'rectangle', 'parallelogram'].includes(element.type)) continue;
      for (let index = 0; index < element.points.length; index += 1) {
        const key = `${element.id}#${index}`;
        const edge = G.parseEdgeKey(board, key);
        if (!edge) continue;
        const [a, b] = edge.points;
        if ((a === side[0] && b === side[1]) || (a === side[1] && b === side[0])) return [key];
      }
    }
    return [];
  }
  /**
   * Put the prerequisites of `index` on the frame. Points and the one segment are
   * created only when the frame does not already have them. The figure this step
   * asks the student to commit is not created here.
   */
  function ready(frame, index, saved = {}) {
    if (index >= steps.length) return { index: steps.length, pointId: saved.pointId, side: saved.side ?? null };
    let guard = 0;
    while (!trio(frame.board) && guard < spots.length) { place(frame); guard += 1; }
    if (!trio(frame.board)) throw Error('Construct prerequisites are unavailable');
    if (!usableSegment(frame.board)) {
      let pair = pairWithoutMidpoint(frame.board);
      if (!pair) { place(frame); place(frame); pair = pairWithoutMidpoint(frame.board); }
      if (!pair) throw Error('Construct prerequisites are unavailable');
      frame.board = G.reduce(frame.board, { type: 'addElement', elementType: 'segment', points: pair, role: 'main' });
    }
    const kept = freePoints(frame.board).find((point) => point.id === saved.pointId);
    const pointId = kept ? kept.id : freePoints(frame.board)[0].id;
    let side = null;
    if (index >= at('construct-midpoint')) {
      if (endsFree(frame.board, saved.side)) side = [saved.side[0], saved.side[1]];
      else {
        const segment = usableSegment(frame.board);
        side = [segment.points[0], segment.points[1]];
      }
    }
    frame.tool = 'select';
    frame.pending = [];
    frame.construction = [];
    frame.history = { past: [], future: [] };
    frame.selection = index === at('construct-midpoint') ? selectionFor(frame.board, side)
      : index === at('construct-drag') ? [pointId] : [];
    // The create step starts with the switch off. The off step starts with it on,
    // so the student can turn it off, and still has to draw the auxiliary figure
    // themself on the create step.
    frame.auxiliary = index === at('construct-auxiliary-off');
    return { index, pointId, side };
  }
  function start(previousFrame) {
    const frame = previousFrame && previousFrame.board ? copy(previousFrame) : emptyFrame();
    prepared = ready(frame, 0, {});
    return frame;
  }
  function fresh() {
    const frame = emptyFrame();
    prepared = ready(frame, 0, {});
    return { frame, saved: { index: 0, pointId: prepared.pointId, side: null } };
  }
  function createGoal(saved) {
    const hasState = saved != null;
    let index = hasState ? saved.index : 0;
    let pointId = hasState ? saved.pointId : null;
    let side = hasState ? saved.side : null;
    if (hasState && (typeof saved !== 'object' || Array.isArray(saved)
      || !Number.isInteger(index) || index < 0 || index > steps.length
      || !idOk(pointId)
      || !(side === null || sideOk(side))
      || (index >= at('construct-midpoint') ? !sideOk(side) : side !== null))) throw Error('Invalid construct goal');
    if (hasState && sideOk(side)) side = [side[0], side[1]];
    function bind() {
      if (pointId) return;
      if (!prepared) {
        const frame = emptyFrame();
        prepared = ready(frame, 0, {});
      }
      pointId = prepared.pointId;
      side = prepared.side;
    }
    const snapshot = () => {
      bind();
      return { index, pointId, side: side ? [...side] : null, total: steps.length,
        step: steps[index] || 'construct-complete', completed: index === steps.length };
    };
    function observe(event) {
      bind();
      if (index >= steps.length) return snapshot();
      const step = steps[index];
      let passed = false;
      if (step === 'construct-parallelogram' || step === 'construct-rectangle') {
        const tool = step === 'construct-parallelogram' ? 'parallelogram' : 'rectangle';
        passed = event.type === 'draw' && event.tool === tool && added(event.before, event.after, tool).length === 1;
      } else if (step === 'construct-select-side') {
        const key = event.type === 'select' && event.selection?.length === 1 ? event.selection[0] : null;
        const ends = key && event.after ? sideFrom(event.after, key) : null;
        passed = Boolean(ends && endsFree(event.after, ends));
        if (passed) side = [ends[0], ends[1]];
      } else if (step === 'construct-midpoint') {
        const created = event.after?.points?.find((point) => point.id === event.id);
        const inputs = created?.construction?.inputs;
        const same = event.a === side[0] && event.b === side[1] || event.a === side[1] && event.b === side[0];
        passed = event.type === 'midpoint' && same && created && !event.before?.points?.some((point) => point.id === event.id)
          && created.construction?.op === 'midpoint' && Array.isArray(inputs) && inputs.includes(side[0]) && inputs.includes(side[1]);
      } else if (step === 'construct-drag') {
        const before = event.before?.points?.find((point) => point.id === event.id);
        const after = event.after?.points?.find((point) => point.id === event.id);
        passed = event.type === 'move' && event.id === pointId && before?.kind === 'free' && after
          && (before.x !== after.x || before.y !== after.y);
      } else if (step === 'construct-auxiliary') {
        const created = (event.after?.elements || []).filter((element) => element.role === 'auxiliary'
          && !(event.before?.elements || []).some((old) => old.id === element.id));
        passed = event.type === 'draw' && event.role === 'auxiliary' && created.length === 1;
      } else if (step === 'construct-auxiliary-off') {
        passed = event.type === 'auxiliary' && event.before === true && event.after === false;
      }
      if (passed) index += 1;
      return snapshot();
    }
    return { snapshot, observe };
  }
  function skip(saved, frame) {
    const next = ready(frame, saved.index + 1, saved);
    return { goal: next, frame };
  }
  return { id: 'geometry-construct', titleKey: 'geometryPracticeConstruct', steps, start, fresh, createGoal, skip };
}
