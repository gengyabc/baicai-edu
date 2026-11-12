// Workspace-first expression board; self-contained factories embedded by build.mjs.
// The artwork factory is standalone so it can also power the shape preview script.
export function createShapeArt(React) {
  const h = React.createElement;
  const INK = '#1E293B';
  const PALE = 'rgba(255,255,255,.5)';
  const u = (r, n) => Math.round(n * r * 100) / 100;
  const points = (r, list) => list.map(([x, y]) => `${u(r, x)},${u(r, y)}`).join(' ');
  const painted = (fill, extra = {}) => ({ fill, stroke: INK, strokeWidth: 1.2, strokeLinejoin: 'round', strokeLinecap: 'round', ...extra });
  const dot = (r, x, y, n, fill) => h('circle', { cx: u(r, x), cy: u(r, y), r: u(r, n), fill });
  const line = (r, x1, y1, x2, y2, width = 1) => h('line', { x1: u(r, x1), y1: u(r, y1), x2: u(r, x2), y2: u(r, y2), stroke: INK, strokeWidth: width, strokeLinecap: 'round' });

  function cat(r, fill) {
    const p = painted(fill);
    return [
      h('polygon', { points: points(r, [[-0.78, -0.4], [-0.6, -1.02], [-0.16, -0.58]]), ...p }),
      h('polygon', { points: points(r, [[0.78, -0.4], [0.6, -1.02], [0.16, -0.58]]), ...p }),
      h('polygon', { points: points(r, [[-0.68, -0.44], [-0.58, -0.87], [-0.32, -0.57]]), fill: PALE }),
      h('polygon', { points: points(r, [[0.68, -0.44], [0.58, -0.87], [0.32, -0.57]]), fill: PALE }),
      h('ellipse', { cx: 0, cy: u(r, 0.04), rx: u(r, 0.68), ry: u(r, 0.6), ...p }),
      dot(r, -0.26, -0.13, 0.075, INK),
      dot(r, 0.26, -0.13, 0.075, INK),
      h('polygon', { points: points(r, [[0, 0.2], [-0.09, 0.08], [0.09, 0.08]]), fill: INK }),
      h('path', { d: `M${u(r, -0.13)} ${u(r, 0.3)} Q0 ${u(r, 0.4)} ${u(r, 0.13)} ${u(r, 0.3)}`, fill: 'none', stroke: INK, strokeWidth: 1 }),
      line(r, -0.55, 0.06, -1.0, -0.02),
      line(r, -0.55, 0.17, -1.0, 0.24),
      line(r, 0.55, 0.06, 1.0, -0.02),
      line(r, 0.55, 0.17, 1.0, 0.24),
    ];
  }

  function dog(r, fill) {
    const p = painted(fill);
    return [
      h('ellipse', { cx: u(r, -0.56), cy: u(r, 0.16), rx: u(r, 0.24), ry: u(r, 0.55), transform: `rotate(-10 ${u(r, -0.56)} ${u(r, 0.16)})`, ...p }),
      h('ellipse', { cx: u(r, 0.56), cy: u(r, 0.16), rx: u(r, 0.24), ry: u(r, 0.55), transform: `rotate(10 ${u(r, 0.56)} ${u(r, 0.16)})`, ...p }),
      h('ellipse', { cx: 0, cy: u(r, -0.02), rx: u(r, 0.52), ry: u(r, 0.6), ...p }),
      h('ellipse', { cx: 0, cy: u(r, 0.3), rx: u(r, 0.38), ry: u(r, 0.27), fill: PALE, stroke: INK, strokeWidth: 0.8 }),
      dot(r, -0.22, -0.18, 0.075, INK),
      dot(r, 0.22, -0.18, 0.075, INK),
      h('ellipse', { cx: 0, cy: u(r, 0.19), rx: u(r, 0.15), ry: u(r, 0.11), fill: INK }),
      h('rect', { x: u(r, -0.1), y: u(r, 0.5), width: u(r, 0.2), height: u(r, 0.22), rx: u(r, 0.1), fill: '#F472B6', stroke: INK, strokeWidth: 0.8 }),
    ];
  }

  function car(r, fill) {
    const p = painted(fill);
    return [
      h('rect', { x: u(r, -0.46), y: u(r, -0.62), width: u(r, 1.0), height: u(r, 0.55), rx: u(r, 0.18), ...p }),
      h('rect', { x: u(r, -0.92), y: u(r, -0.16), width: u(r, 1.84), height: u(r, 0.6), rx: u(r, 0.14), ...p }),
      h('rect', { x: u(r, -0.38), y: u(r, -0.52), width: u(r, 0.32), height: u(r, 0.3), rx: u(r, 0.06), fill: '#DBEAFE', stroke: INK, strokeWidth: 0.8 }),
      h('rect', { x: u(r, 0.02), y: u(r, -0.52), width: u(r, 0.38), height: u(r, 0.3), rx: u(r, 0.06), fill: '#DBEAFE', stroke: INK, strokeWidth: 0.8 }),
      dot(r, -0.5, 0.45, 0.22, '#1F2937'),
      dot(r, 0.5, 0.45, 0.22, '#1F2937'),
      dot(r, -0.5, 0.45, 0.09, '#E2E8F0'),
      dot(r, 0.5, 0.45, 0.09, '#E2E8F0'),
      h('circle', { cx: u(r, -0.87), cy: u(r, 0.02), r: u(r, 0.07), fill: '#FDE047', stroke: INK, strokeWidth: 0.6 }),
    ];
  }

  function person(r, fill) {
    const p = painted(fill);
    return [
      h('rect', { x: u(r, -0.62), y: u(r, -0.06), width: u(r, 0.2), height: u(r, 0.4), rx: u(r, 0.1), transform: `rotate(22 ${u(r, -0.52)} ${u(r, 0.14)})`, ...p }),
      h('rect', { x: u(r, 0.42), y: u(r, -0.06), width: u(r, 0.2), height: u(r, 0.4), rx: u(r, 0.1), transform: `rotate(-22 ${u(r, 0.52)} ${u(r, 0.14)})`, ...p }),
      h('rect', { x: u(r, -0.18), y: u(r, 0.5), width: u(r, 0.14), height: u(r, 0.36), rx: u(r, 0.07), ...p }),
      h('rect', { x: u(r, 0.04), y: u(r, 0.5), width: u(r, 0.14), height: u(r, 0.36), rx: u(r, 0.07), ...p }),
      h('path', { d: `M${u(r, -0.26)} ${u(r, -0.12)} L${u(r, 0.26)} ${u(r, -0.12)} L${u(r, 0.19)} ${u(r, 0.48)} L${u(r, -0.19)} ${u(r, 0.48)} Z`, ...p }),
      h('rect', { x: u(r, -0.06), y: u(r, -0.22), width: u(r, 0.12), height: u(r, 0.14), fill: '#FDDCB8', stroke: INK, strokeWidth: 0.9 }),
      h('circle', { cx: 0, cy: u(r, -0.45), r: u(r, 0.27), fill: '#FDDCB8', stroke: INK, strokeWidth: 1.2 }),
      h('path', { d: `M${u(r, -0.25)} ${u(r, -0.48)} Q${u(r, -0.24)} ${u(r, -0.72)} 0 ${u(r, -0.72)} Q${u(r, 0.24)} ${u(r, -0.72)} ${u(r, 0.25)} ${u(r, -0.48)} Q${u(r, 0.1)} ${u(r, -0.55)} 0 ${u(r, -0.5)} Q${u(r, -0.1)} ${u(r, -0.55)} ${u(r, -0.25)} ${u(r, -0.48)} Z`, fill: '#3B2F2F' }),
      dot(r, -0.09, -0.44, 0.035, INK),
      dot(r, 0.09, -0.44, 0.035, INK),
      h('path', { d: `M${u(r, -0.1)} ${u(r, -0.33)} Q0 ${u(r, -0.26)} ${u(r, 0.1)} ${u(r, -0.33)}`, fill: 'none', stroke: INK, strokeWidth: 1 }),
    ];
  }

  function apple(r, fill) {
    const p = painted(fill);
    const body = `M0 ${u(r, -0.42)} C${u(r, -0.2)} ${u(r, -0.62)} ${u(r, -0.62)} ${u(r, -0.62)} ${u(r, -0.76)} ${u(r, -0.12)} C${u(r, -0.88)} ${u(r, 0.34)} ${u(r, -0.46)} ${u(r, 0.74)} ${u(r, -0.12)} ${u(r, 0.7)} Q0 ${u(r, 0.62)} ${u(r, 0.12)} ${u(r, 0.7)} C${u(r, 0.46)} ${u(r, 0.74)} ${u(r, 0.88)} ${u(r, 0.34)} ${u(r, 0.76)} ${u(r, -0.12)} C${u(r, 0.62)} ${u(r, -0.62)} ${u(r, 0.2)} ${u(r, -0.62)} 0 ${u(r, -0.42)} Z`;
    return [
      h('path', { d: body, ...p }),
      h('ellipse', { cx: u(r, -0.34), cy: u(r, 0.02), rx: u(r, 0.11), ry: u(r, 0.26), transform: `rotate(-18 ${u(r, -0.34)} ${u(r, 0.02)})`, fill: 'rgba(255,255,255,.55)' }),
      h('path', { d: `M0 ${u(r, -0.42)} C${u(r, 0.02)} ${u(r, -0.6)} ${u(r, 0.06)} ${u(r, -0.72)} ${u(r, 0.04)} ${u(r, -0.82)}`, fill: 'none', stroke: '#6B4F2A', strokeWidth: 2, strokeLinecap: 'round' }),
      h('ellipse', { cx: u(r, 0.28), cy: u(r, -0.65), rx: u(r, 0.2), ry: u(r, 0.1), transform: `rotate(-28 ${u(r, 0.28)} ${u(r, -0.65)})`, fill: '#22C55E', stroke: INK, strokeWidth: 0.9 }),
    ];
  }

  function fish(r, fill) {
    const p = painted(fill);
    return [
      h('polygon', { points: points(r, [[0.5, 0], [1.0, -0.34], [1.0, 0.34]]), ...p }),
      h('polygon', { points: points(r, [[-0.02, -0.46], [-0.2, -0.72], [0.2, -0.56]]), ...p }),
      h('ellipse', { cx: u(r, -0.06), cy: 0, rx: u(r, 0.64), ry: u(r, 0.46), ...p }),
      h('path', { d: `M${u(r, -0.12)} ${u(r, -0.28)} Q${u(r, -0.26)} 0 ${u(r, -0.12)} ${u(r, 0.28)}`, fill: 'none', stroke: INK, strokeWidth: 1 }),
      dot(r, -0.4, -0.1, 0.075, INK),
      dot(r, -0.42, -0.12, 0.025, '#FFFFFF'),
    ];
  }

  function rocket(r, fill) {
    const p = painted(fill);
    const body = `M0 ${u(r, -1)} C${u(r, 0.36)} ${u(r, -0.52)} ${u(r, 0.42)} ${u(r, 0.18)} ${u(r, 0.3)} ${u(r, 0.55)} L${u(r, -0.3)} ${u(r, 0.55)} C${u(r, -0.42)} ${u(r, 0.18)} ${u(r, -0.36)} ${u(r, -0.52)} 0 ${u(r, -1)} Z`;
    return [
      h('path', { d: body, ...p }),
      h('polygon', { points: points(r, [[-0.3, 0.36], [-0.58, 0.7], [-0.28, 0.58]]), ...p }),
      h('polygon', { points: points(r, [[0.3, 0.36], [0.58, 0.7], [0.28, 0.58]]), ...p }),
      h('path', { d: `M${u(r, -0.15)} ${u(r, 0.55)} Q0 ${u(r, 1.02)} ${u(r, 0.15)} ${u(r, 0.55)}`, fill: '#FDBA74', stroke: '#F97316', strokeWidth: 1 }),
      h('circle', { cx: 0, cy: u(r, -0.28), r: u(r, 0.17), fill: '#DBEAFE', stroke: INK, strokeWidth: 0.9 }),
    ];
  }

  function flower(r, fill) {
    const p = painted(fill);
    const petals = Array.from({ length: 5 }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      return h('circle', { key: `petal-${i}`, cx: u(r, Math.cos(angle) * 0.4), cy: u(r, Math.sin(angle) * 0.4), r: u(r, 0.24), ...p });
    });
    return [
      line(r, 0, 0.45, 0, 0.95, 2.4),
      h('ellipse', { cx: u(r, 0.24), cy: u(r, 0.78), rx: u(r, 0.2), ry: u(r, 0.1), transform: `rotate(-28 ${u(r, 0.24)} ${u(r, 0.78)})`, fill: '#22C55E', stroke: INK, strokeWidth: 0.8 }),
      ...petals,
      h('circle', { cx: 0, cy: 0, r: u(r, 0.22), fill: '#FBBF24', stroke: INK, strokeWidth: 1 }),
    ];
  }

  function butterfly(r, fill) {
    const p = painted(fill);
    const wing = (cx, cy, rx, ry, rotate) => h('ellipse', { cx: u(r, cx), cy: u(r, cy), rx: u(r, rx), ry: u(r, ry), transform: `rotate(${rotate} ${u(r, cx)} ${u(r, cy)})`, ...p });
    return [
      wing(-0.4, -0.22, 0.36, 0.27, -24),
      wing(0.4, -0.22, 0.36, 0.27, 24),
      wing(-0.37, 0.27, 0.24, 0.27, 20),
      wing(0.37, 0.27, 0.24, 0.27, -20),
      dot(r, -0.42, -0.26, 0.07, 'rgba(255,255,255,.7)'),
      dot(r, 0.42, -0.26, 0.07, 'rgba(255,255,255,.7)'),
      h('ellipse', { cx: 0, cy: 0, rx: u(r, 0.09), ry: u(r, 0.5), fill: INK }),
      h('path', { d: `M0 ${u(r, -0.45)} Q${u(r, -0.16)} ${u(r, -0.66)} ${u(r, -0.2)} ${u(r, -0.8)}`, fill: 'none', stroke: INK, strokeWidth: 1 }),
      h('path', { d: `M0 ${u(r, -0.45)} Q${u(r, 0.16)} ${u(r, -0.66)} ${u(r, 0.2)} ${u(r, -0.8)}`, fill: 'none', stroke: INK, strokeWidth: 1 }),
      dot(r, -0.2, -0.8, 0.04, INK),
      dot(r, 0.2, -0.8, 0.04, INK),
    ];
  }

  function house(r, fill) {
    const p = painted(fill);
    return [
      h('rect', { x: u(r, -0.55), y: u(r, -0.05), width: u(r, 1.1), height: u(r, 0.85), ...p }),
      h('polygon', { points: points(r, [[-0.72, -0.03], [0, -0.78], [0.72, -0.03]]), ...p }),
      h('rect', { x: u(r, 0.32), y: u(r, -0.52), width: u(r, 0.18), height: u(r, 0.26), fill: '#6B4F2A', stroke: INK, strokeWidth: 0.8 }),
      h('rect', { x: u(r, 0.18), y: u(r, 0.08), width: u(r, 0.24), height: u(r, 0.24), fill: '#DBEAFE', stroke: INK, strokeWidth: 0.8 }),
      h('rect', { x: u(r, -0.16), y: u(r, 0.34), width: u(r, 0.32), height: u(r, 0.46), rx: u(r, 0.03), fill: '#6B4F2A', stroke: INK, strokeWidth: 0.8 }),
      dot(r, 0.1, 0.57, 0.035, '#FDE047'),
    ];
  }

  function icecream(r, fill) {
    const p = painted(fill);
    return [
      h('polygon', { points: points(r, [[-0.42, 0.12], [0.42, 0.12], [0, 0.92]]), fill: '#E8B66A', stroke: INK, strokeWidth: 1 }),
      h('circle', { cx: 0, cy: u(r, -0.06), r: u(r, 0.4), ...p }),
      h('circle', { cx: u(r, -0.02), cy: u(r, -0.42), r: u(r, 0.31), ...p }),
      h('circle', { cx: u(r, 0.2), cy: u(r, -0.68), r: u(r, 0.09), fill: '#EF4444', stroke: INK, strokeWidth: 0.7 }),
      h('path', { d: `M${u(r, 0.2)} ${u(r, -0.77)} Q${u(r, 0.26)} ${u(r, -0.92)} ${u(r, 0.4)} ${u(r, -0.94)}`, fill: 'none', stroke: INK, strokeWidth: 1 }),
      dot(r, -0.18, -0.22, 0.05, 'rgba(255,255,255,.75)'),
      dot(r, 0.12, -0.5, 0.05, 'rgba(255,255,255,.75)'),
      dot(r, -0.15, -0.42, 0.04, 'rgba(255,255,255,.75)'),
    ];
  }

  const patterns = { cat, dog, car, person, apple, fish, rocket, flower, butterfly, house, icecream };

  function geometry(shape, r) {
    switch (shape) {
      case 'circle': return { type: 'circle', r };
      case 'square': return { type: 'rect', x: -r * 0.88, y: -r * 0.88, width: r * 1.76, height: r * 1.76, rx: 3 };
      case 'rectangle': return { type: 'rect', x: -r * 1.1, y: -r * 0.8, width: r * 2.2, height: r * 1.6, rx: 3 };
      case 'triangle': return { type: 'polygon', points: `0,${-r - 2} ${r + 2},${r - 2} ${-r - 2},${r - 2}` };
      case 'star': {
        const starPoints = [];
        for (let i = 0; i < 10; i++) {
          const radius = i % 2 === 0 ? r + 1 : r * 0.45;
          const angle = -Math.PI / 2 + (i * Math.PI) / 5;
          starPoints.push(`${(Math.cos(angle) * radius).toFixed(1)},${(Math.sin(angle) * radius).toFixed(1)}`);
        }
        return { type: 'polygon', points: starPoints.join(' ') };
      }
      case 'hexagon': {
        const hexPoints = [];
        for (let i = 0; i < 6; i++) {
          const angle = -Math.PI / 2 + (i * Math.PI) / 3;
          hexPoints.push(`${(Math.cos(angle) * (r + 1)).toFixed(1)},${(Math.sin(angle) * (r + 1)).toFixed(1)}`);
        }
        return { type: 'polygon', points: hexPoints.join(' ') };
      }
      case 'diamond': return { type: 'polygon', points: `0,${-r - 1} ${r + 1},0 0,${r + 1} ${-r - 1},0` };
      case 'heart': return { type: 'path', d: `M0 ${r * 0.72}C${-r * 1.4} ${-r * 0.1} ${-r * 0.55} ${-r * 1.15} 0 ${-r * 0.4}C${r * 0.55} ${-r * 1.15} ${r * 1.4} ${-r * 0.1} 0 ${r * 0.72}Z` };
      case 'oval': return { type: 'rect', x: -r * 1.22, y: -r * 0.72, width: r * 2.44, height: r * 1.44, rx: r * 0.72 };
      default: return { type: 'circle', r };
    }
  }

  function node(shape, r, props = {}) {
    const draw = patterns[shape];
    if (draw) return h('g', null, ...draw(r, props.fill || '#4CAF50'));
    const spec = geometry(shape, r);
    if (spec.type === 'circle') return h('circle', { r: spec.r, ...props });
    if (spec.type === 'rect') return h('rect', { x: spec.x, y: spec.y, width: spec.width, height: spec.height, rx: spec.rx, ...props });
    if (spec.type === 'polygon') return h('polygon', { points: spec.points, ...props });
    return h('path', { d: spec.d, ...props });
  }

  return { node, patterns: Object.keys(patterns) };
}

// The JSON attachment is the board. The composer only receives words the student wrote.
export function composerNote(board) {
  return typeof board?.note === 'string' ? board.note.trim() : '';
}

/** Resolve a level value to its stored palette index (not the array position). */
export function colorIndexForValue(levels, value) {
  const level = levels.find((entry) => entry.value === value);
  return level ? level.color : 0;
}
export { createBoardView } from './view-component.js';
export { createTabbedBoardView } from './board-shell.js';
