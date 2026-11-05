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

export function createBoardView(React, M, ctx, t, css, art) {
  const h = React.createElement;
  const paletteColor = (index) => M.color(index);
  function icon(name, size = 18) {
    const paths = {
      undo: 'M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12',
      redo: 'm15 5 5 5-5 5m5-5h-9a6 6 0 0 0 0 12',
      close: 'm6 6 12 12M18 6 6 18',
      gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
      group: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8z',
      ungroup: 'M3 3h5v5H3zM16 16h5v5h-5zM3 16h5v5H3zM16 3h5v5h-5z',
      copy: 'M9 9h12v12H9zM15 9V3H3v12h6',
      merge: 'M4 18 10 12M4 12h6v6M20 6l-6 6M14 12h6V6',
      split: 'M10 4 4 10M4 4h6v6M14 20l6-6M20 20h-6v-6',
      cross: 'M4 12h16M7 5h10v14H7z',
      trash: 'M4 6h16M9 6V3h6v3M7 6l1 15h8l1-15',
      multi: 'M3 3h7v7H3zm11 11h7v7h-7zM17 3v7M14 6h7M3 17h7',
      plus: 'M12 5v14M5 12h14',
      minus: 'M5 12h14',
    };
    return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] || paths.group }));
  }
  function swatch(shape, colorIndex, size = 30) {
    return h('svg', { width: size, height: size, viewBox: '-28 -28 56 56', 'aria-hidden': true }, art.node(shape, 17, { fill: paletteColor(colorIndex), stroke: '#1E293B', strokeWidth: 1.1 }));
  }
  return function Board(props) {
    React.useSyncExternalStore((fn) => ctx.locale.subscribe(fn), () => ctx.locale.getSnapshot());
    const key = `dsh-edu-math-board:v3:${props.sessionId}`;
    const legacyKey = `dsh-edu-math-board:v2:${props.sessionId}`;
    const watermarkKey = `${key}:config`;
    const [opened, setOpened] = React.useState(false);
    const [board, setBoard] = React.useState(M.empty);
    const boardRef = React.useRef(board);
    const [ready, setReady] = React.useState(false);
    const [storageBlocked, setStorageBlocked] = React.useState(false);
    const [history, setHistory] = React.useState({ past: [], future: [] });
    const [selection, setSelection] = React.useState([]);
    const [multi, setMulti] = React.useState(false);
    const [focus, setFocus] = React.useState(false);
    const [fit, setFit] = React.useState(() => window.matchMedia('(min-width: 1000px)').matches);
    const [zoom, setZoom] = React.useState(1);
    const [status, setStatus] = React.useState('');
    const [preview, setPreview] = React.useState(null);
    const [clearConfirm, setClearConfirm] = React.useState(false);
    const [settingsView, setSettingsView] = React.useState(false);
    const [settingsDraft, setSettingsDraft] = React.useState(null);
    const [dragShape, setDragShape] = React.useState(null);
    const config = props.useProjection('eduBoardConfig');
    const watermark = React.useRef(-1);
    const dialog = React.useRef(null), fileInput = React.useRef(null), downloadAnchor = React.useRef(null);
    const url = React.useRef(null), gesture = React.useRef(null), revision = React.useRef(0);
    const svgRef = React.useRef(null);
    const phase = props.useInput((s) => s.phase);
    const selected = board.objects.filter((o) => selection.includes(o.id));
    const single = selected.length === 1 ? selected[0] : null;
    const activeSelected = selected.filter((o) => !o.removed);
    const touchedGroups = [...new Set(selected.map((o) => o.groupId).filter(Boolean))];
    const group = touchedGroups.length === 1 ? board.groups.find((g) => g.id === touchedGroups[0]) : null;
    const dense = board.objects.length > 60;
    const radius = dense ? 13 : 19;
    const mergeInfo = activeSelected.length >= 2 ? M.mergeCandidate(board, activeSelected.map((o) => o.id)) : null;
    const settings = settingsDraft || board.settings;

    React.useEffect(() => {
      revision.current++;
      try {
        const current = localStorage.getItem(key);
        const previous = current === null ? localStorage.getItem(legacyKey) : null;
        const raw = current ?? previous;
        const next = raw ? M.validate(JSON.parse(raw)) : M.empty();
        boardRef.current = next; setBoard(next);
        const mark = localStorage.getItem(watermarkKey) ?? (previous === null ? null : localStorage.getItem(`${legacyKey}:config`));
        watermark.current = mark === null ? -1 : Number(mark);
      } catch { setStorageBlocked(true); setStatus(t('loadError')); }
      setReady(true);
      return () => { revision.current++; gesture.current = null; if (url.current) URL.revokeObjectURL(url.current); };
    }, [key]);

    React.useEffect(() => {
      if (!ready || storageBlocked) return;
      try { localStorage.setItem(key, JSON.stringify(board)); } catch { setStatus(t('storageError')); }
    }, [board, ready, storageBlocked, key]);

    // Host settings changes (typed by the student in chat or via /math-board-settings).
    React.useEffect(() => {
      if (!ready || !config || !Array.isArray(config.changes)) return;
      const pending = config.changes.filter((change) => change.revision > watermark.current);
      if (!pending.length) return;
      if (watermark.current < (config.floorRevision ?? 0)) {
        let next = boardRef.current;
        try { next = M.reduce(next, { type: 'configure', settings: config.settings, scope: 'future' }); } catch { return; }
        publish(next); watermark.current = config.revision;
        try { localStorage.setItem(watermarkKey, String(config.revision)); } catch {}
        setStatus(t('configGap'));
        return;
      }
      let next = boardRef.current, last = watermark.current;
      for (const change of pending) {
        try { next = M.reduce(next, { type: 'configure', settings: change.settings, scope: change.scope }); } catch { continue; }
        last = Math.max(last, change.revision);
      }
      publish(next); watermark.current = last;
      try { localStorage.setItem(watermarkKey, String(last)); } catch {}
      setStatus(t('configApplied'));
    }, [config, ready]);

    React.useEffect(() => {
      const node = dialog.current;
      if (opened && !node.open) node.showModal();
      if (!opened && node.open) node.close();
    }, [opened]);
    React.useEffect(() => () => { if (dialog.current?.open) dialog.current.close(); }, []);

    function flushEditor() {
      const active = dialog.current?.ownerDocument.activeElement;
      if (active && dialog.current.contains(active) && active.matches('input,textarea,select')) active.blur();
    }
    function publish(next) { boardRef.current = next; setBoard(next); }
    function commit(next) {
      const before = boardRef.current;
      if (JSON.stringify(next) === JSON.stringify(before)) return;
      gesture.current = null; setPreview(null); revision.current++;
      setHistory((old) => ({ past: [...old.past.slice(-39), before], future: [] }));
      publish(next); setStatus(''); setClearConfirm(false);
    }
    function action(a) {
      try { const next = M.reduce(boardRef.current, a); commit(next); return next; }
      catch (error) { setStatus(`${t('failed')}: ${error.message}`); return null; }
    }
    function batch(actions) { return action({ type: 'batch', actions }); }
    function selectIds(ids) { setSelection(ids); }
    function undo() {
      const prev = history.past.at(-1); if (!prev) return;
      gesture.current = null; setPreview(null); revision.current++;
      setHistory({ past: history.past.slice(0, -1), future: [boardRef.current, ...history.future].slice(0, 40) });
      publish(prev); selectIds([]); setStatus('');
    }
    function redo() {
      const next = history.future[0]; if (!next) return;
      gesture.current = null; setPreview(null); revision.current++;
      setHistory({ past: [...history.past, boardRef.current].slice(-40), future: history.future.slice(1) });
      publish(next); selectIds([]); setStatus('');
    }
    function button(label, handler, extra = {}) { return h('button', { type: 'button', onClick: handler, ...extra }, label); }
    function toolButton(name, handler, extra = {}) { return button(icon(name), handler, { title: t(name), 'aria-label': t(name), className: 'eb-icon-button', ...extra }); }

    function add(shape, point) {
      const before = new Set(boardRef.current.objects.map((o) => o.id));
      const extra = point ? { x: point.x, y: point.y } : {};
      const next = action({ type: 'add', shape, ...extra });
      if (next) selectIds(next.objects.filter((o) => !before.has(o.id)).map((o) => o.id));
    }
    function updateSelected(patch) { batch(selected.map((o) => ({ type: 'update', id: o.id, patch }))); }
    function groupSelection() {
      const before = new Set(boardRef.current.groups.map((item) => item.id));
      const alias = group ? group.alias : t('defaultGroup');
      const next = action({ type: 'groupSelected', ids: selected.map((item) => item.id), alias });
      if (!next) return;
      const created = next.groups.find((item) => !before.has(item.id));
      if (created) setSelection(next.objects.filter((item) => item.groupId === created.id).map((item) => item.id));
    }
    function ungroup() { if (group) { action({ type: 'deleteGroup', id: group.id }); setSelection([]); } }
    function duplicate() {
      const before = new Set(boardRef.current.objects.map((o) => o.id));
      const next = action({ type: 'duplicateSelected', ids: selection });
      if (next) selectIds(next.objects.filter((o) => !before.has(o.id)).map((o) => o.id));
    }
    function mergeSelection() {
      const next = action({ type: 'merge', ids: activeSelected.map((o) => o.id) });
      if (next) selectIds([]);
    }
    function splitSelection() {
      const next = action({ type: 'split', id: single.id });
      if (next) selectIds([]);
    }
    function removeSelected() { batch(selected.map((o) => ({ type: 'delete', id: o.id }))); selectIds([]); }

    function point(e) {
      const svg = svgRef.current, p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const matrix = svg.getScreenCTM(); return matrix ? p.matrixTransform(matrix.inverse()) : { x: 30, y: 30 };
    }
    function expandGroup(ids) {
      const members = boardRef.current.objects.filter((o) => ids.includes(o.id) && o.groupId !== null);
      const extra = boardRef.current.objects.filter((o) => members.some((m) => m.groupId === o.groupId) && !ids.includes(o.id)).map((o) => o.id);
      return [...new Set([...ids, ...extra])];
    }
    function pointerDown(e) {
      if (e.button !== 0) return;
      flushEditor();
      const p = point(e), objectId = e.target.closest?.('[data-object]')?.getAttribute('data-object');
      revision.current++;
      if (objectId) {
        const whole = expandGroup([objectId]);
        let ids = selection;
        if (e.shiftKey || multi) {
          ids = selection.includes(objectId) ? selection.filter((id) => !whole.some((w) => w === id)) : [...new Set([...selection, ...whole])];
          selectIds(ids); return;
        }
        if (!ids.includes(objectId)) ids = whole;
        selectIds(ids);
        gesture.current = { kind: 'move', ids, start: p, pointer: e.pointerId, base: boardRef.current, moved: false };
      } else {
        gesture.current = { kind: 'lasso', start: p, current: p, pointer: e.pointerId, base: boardRef.current, initial: e.shiftKey ? selection : [], moved: false };
      }
      e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    }
    function pointerMove(e) {
      const g = gesture.current; if (!g || g.pointer !== e.pointerId) return;
      const p = point(e), dx = p.x - g.start.x, dy = p.y - g.start.y;
      g.current = p;
      if (Math.abs(dx) + Math.abs(dy) < 3 && !g.moved) return;
      g.moved = true;
      if (g.kind === 'move') {
        const members = g.base.objects.filter((o) => g.ids.includes(o.id));
        g.dx = Math.max(30 - Math.min(...members.map((o) => o.x)), Math.min(770 - Math.max(...members.map((o) => o.x)), dx));
        g.dy = Math.max(30 - Math.min(...members.map((o) => o.y)), Math.min(330 - Math.max(...members.map((o) => o.y)), dy));
        setPreview({ kind: 'move', ids: g.ids, dx: g.dx, dy: g.dy });
      } else setPreview({ kind: 'lasso', x: Math.min(p.x, g.start.x), y: Math.min(p.y, g.start.y), w: Math.abs(dx), h: Math.abs(dy) });
    }
    function pointerEnd(e, cancelled = false) {
      const g = gesture.current; if (!g || g.pointer !== e.pointerId) return;
      gesture.current = null; setPreview(null);
      if (cancelled) return;
      if (g.kind === 'move' && g.moved) action({ type: 'moveMany', ids: g.ids, dx: g.dx || 0, dy: g.dy || 0 });
      if (g.kind === 'lasso') {
        if (!g.moved) { selectIds([]); return; }
        const p = g.current, x1 = Math.min(p.x, g.start.x), x2 = Math.max(p.x, g.start.x), y1 = Math.min(p.y, g.start.y), y2 = Math.max(p.y, g.start.y);
        const hit = g.base.objects.filter((o) => o.x + radius >= x1 && o.x - radius <= x2 && o.y + radius >= y1 && o.y - radius <= y2).map((o) => o.id);
        selectIds(expandGroup([...new Set([...g.initial, ...hit])]));
      }
    }
    function objectKey(e, o) {
      const arrows = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const whole = expandGroup([o.id]);
        selectIds(e.shiftKey ? (selection.includes(o.id) ? selection.filter((id) => !whole.includes(id)) : [...new Set([...selection, ...whole])]) : whole);
      } else if (arrows[e.key]) {
        e.preventDefault(); const [dx, dy] = arrows[e.key];
        action({ type: 'moveMany', ids: selection.includes(o.id) ? selection : [o.id], dx, dy });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault(); batch((selection.includes(o.id) ? selection : [o.id]).map((id) => ({ type: 'delete', id }))); selectIds([]);
      }
    }
    function close() { flushEditor(); gesture.current = null; setPreview(null); setOpened(false); }
    function insert() {
      flushEditor();
      try {
        const span = props.inputActions.captureInsertion();
        const text = '\n```json\n' + M.serialize(boardRef.current) + '\n```\n';
        if (!props.inputActions.insertText(text, span)) throw Error();
        props.inputActions.persistDraft(); setStatus(t('inserted')); close();
      } catch { setStatus(t('insertFailed')); }
    }
    function exportFile() {
      flushEditor();
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = URL.createObjectURL(new Blob([M.serialize(boardRef.current)], { type: 'application/json' }));
      downloadAnchor.current.href = url.current; downloadAnchor.current.click();
    }
    async function importFile(e) {
      const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
      const rev = ++revision.current; gesture.current = null; setPreview(null);
      try {
        if (file.size > 262144) throw Error(t('fileTooLarge'));
        const next = M.validate(JSON.parse(await file.text()));
        if (rev !== revision.current) return;
        commit(next); setStorageBlocked(false); selectIds([]); setStatus(t('imported'));
      } catch (error) { setStatus(`${t('failed')}: ${error.message}`); }
    }

    function saveSettings(scope) {
      const next = action({ type: 'configure', settings, scope });
      if (next) { setSettingsView(false); setSettingsDraft(null); setStatus(scope === 'existing' ? t('settingsExistingDone') : t('settingsFutureDone')); }
    }
    function editSettings(change) {
      let draft;
      try { draft = M.validateSettings(settings); } catch { draft = JSON.parse(JSON.stringify(settings)); }
      setSettingsDraft(change(draft));
    }
    function togglePattern(shape) {
      editSettings((draft) => {
        const index = draft.shapes.indexOf(shape);
        if (index >= 0) { if (draft.shapes.length > 1) draft.shapes.splice(index, 1); }
        else draft.shapes.push(shape);
        return draft;
      });
    }

    function renderObject(o) {
      const picked = selection.includes(o.id), moving = preview?.kind === 'move' && preview.ids.includes(o.id);
      const dx = moving ? preview.dx : 0, dy = moving ? preview.dy : 0, r = radius;
      const fill = paletteColor(o.color);
      const label = `${o.alias || t(o.shape)} · ${t('value')} ${o.value} · ${t(o.removed ? 'removed' : 'active')}`;
      const common = { fill, stroke: '#1E293B', strokeWidth: 1.2 };
      return h('g', { key: o.id, 'data-object': o.id, transform: `translate(${o.x + dx} ${o.y + dy})`, role: 'button', tabIndex: 0, 'aria-label': label, 'aria-pressed': picked, onKeyDown: (e) => objectKey(e, o) },
        h('title', null, label),
        h('rect', { className: 'eb-focus-ring', x: -r - 6, y: -r - 6, width: r * 2 + 12, height: r * 2 + 12, rx: 8, fill: picked ? '#2563EB12' : 'transparent', stroke: picked ? '#2563EB' : 'transparent', strokeWidth: 2.5 }),
        h('g', { opacity: o.removed ? 0.35 : 1 },
          art.node(o.shape, r, common),
          h('text', { textAnchor: 'middle', y: 4, fill: '#1E293B', fontSize: String(o.value).length > 3 ? 8 : 10, fontWeight: 700, pointerEvents: 'none', stroke: '#FFFFFF', strokeWidth: 2.5, paintOrder: 'stroke' }, String(o.value))),
        o.removed && h('path', { d: `M${-r - 4} 0h${r * 2 + 8}`, stroke: '#64748B', strokeWidth: 3, strokeDasharray: '4 2', pointerEvents: 'none' }),
        o.sources.length > 0 && h('g', { transform: `translate(${r * 0.72} ${-r * 0.72})`, pointerEvents: 'none' },
          h('circle', { r: 8, fill: '#1F2937', stroke: '#FFFFFF', strokeWidth: 1.5 }),
          h('text', { textAnchor: 'middle', y: 3, fill: '#FFFFFF', fontSize: 9, fontWeight: 700 }, o.sources.length)),
        o.alias && (!dense || picked) && h('text', { textAnchor: 'middle', y: r + 16, fill: '#1E293B', fontSize: 11, pointerEvents: 'none', stroke: '#FFFFFF', strokeWidth: 3, paintOrder: 'stroke' }, [...o.alias].slice(0, 12).join('')));
    }
    function groupBoundary(g) {
      const members = board.objects.filter((o) => o.groupId === g.id);
      if (!members.length) return null;
      const moving = preview?.kind === 'move';
      const points = members.map((o) => ({ x: o.x + (moving && preview.ids.includes(o.id) ? preview.dx : 0), y: o.y + (moving && preview.ids.includes(o.id) ? preview.dy : 0) }));
      const first = points[0];
      return h('g', { key: g.id, pointerEvents: 'none' },
        h('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '), fill: 'none', stroke: '#CBD5E1', strokeWidth: 1.5, strokeDasharray: '4 4' }),
        points.map((p, i) => h('rect', { key: i, x: p.x - radius - 4, y: p.y - radius - 4, width: radius * 2 + 8, height: radius * 2 + 8, rx: 9, fill: 'none', stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '3 3' })),
        h('text', { x: Math.max(8, first.x - radius), y: Math.max(14, first.y - radius - 10), fill: '#64748B', fontSize: 10, stroke: '#FFFFFF', strokeWidth: 3, paintOrder: 'stroke' }, [...(g.alias || t('defaultGroup'))].slice(0, 18).join('')));
    }

    const library = M.shapes;
    const visibleShapes = settings.shapes;
    const levels = settings.levels;
    const colorForLevel = (value) => levels.findIndex((l) => l.value === value);

    function settingsPanel() {
      const rows = levels.map((level, index) => h('div', { className: 'eb-level-row', key: index },
        h('span', { className: 'eb-color-dot', style: { background: paletteColor(index) } }),
        h('input', {
          type: 'number', min: 1, value: level.value, 'aria-label': `${t('level')} ${index + 1}`,
          onChange: (event) => {
            const next = Number(event.target.value);
            editSettings((draft) => {
              const previous = draft.levels[index].value;
              draft.levels[index] = { ...draft.levels[index], value: next };
              for (const entry of draft.defaults) if (entry.value === previous) entry.value = next;
              return draft;
            });
          },
        }),
        h('span', { className: 'eb-muted' }, `${t('colorName')} ${index + 1}`),
        button(icon('minus', 14), () => editSettings((draft) => {
          if (draft.levels.length < 2) return draft;
          const removed = draft.levels[index].value;
          const fallback = draft.levels[index === 0 ? 1 : 0].value;
          draft.levels.splice(index, 1);
          for (const entry of draft.defaults) if (entry.value === removed) entry.value = fallback;
          return draft;
        }), { 'aria-label': t('removeLevel') })));
      const shapeRows = settings.shapes.map((shape) => {
        const entry = settings.defaults.find((item) => item.shape === shape);
        return h('div', { className: 'eb-default-row', key: shape },
          h('span', { className: 'eb-default-shape' }, swatch(shape, Math.max(0, colorForLevel(entry.value)), 22), h('span', null, t(shape))),
          h('input', {
            type: 'text', maxLength: 30, value: entry.alias, placeholder: t('aliasHint'), 'aria-label': `${t(shape)} ${t('alias')}`,
            onChange: (event) => editSettings((draft) => {
              draft.defaults.find((item) => item.shape === shape).alias = event.target.value;
              return draft;
            }),
          }),
          h('select', {
            value: entry.value, 'aria-label': `${t(shape)} ${t('value')}`,
            onChange: (event) => editSettings((draft) => {
              draft.defaults.find((item) => item.shape === shape).value = Number(event.target.value);
              return draft;
            }),
          }, levels.map((level, index) => h('option', { key: index, value: level.value }, String(level.value)))));
      });
      const libraryTiles = library.map((shape) => {
        const on = settings.shapes.includes(shape);
        const entry = settings.defaults.find((item) => item.shape === shape);
        const label = `${on ? t('removePattern') : t('addPattern')}: ${t(shape)}`;
        return button(h(React.Fragment, null, swatch(shape, Math.max(0, colorForLevel(entry.value)), 24), h('span', null, t(shape))),
          () => togglePattern(shape),
          { key: shape, className: 'eb-library-tile', 'aria-pressed': on, 'aria-label': label, title: label,
            disabled: on && settings.shapes.length === 1 });
      });
      return h('div', { className: 'eb-settings' },
        h('h2', { className: 'eb-settings-title' }, t('settings')),
        h('p', { className: 'eb-muted' }, t('settingsIntro')),
        h('div', { className: 'eb-section-label' }, t('levelLadder')),
        rows,
        h('div', { className: 'eb-inline-actions' },
          button(`＋ ${t('addLevel')}`, () => editSettings((draft) => {
            if (draft.levels.length < 9) draft.levels.push({ value: Math.max(...draft.levels.map((item) => item.value)) * 10, color: draft.levels.length });
            return draft;
          }), { disabled: levels.length >= 9 }),
          button(t('resetSettings'), () => setSettingsDraft(M.defaultSettings()))),
        h('div', { className: 'eb-section-label' }, t('patterns')),
        h('p', { className: 'eb-muted' }, t('patternsHint')),
        h('div', { className: 'eb-library-grid' }, libraryTiles),
        h('div', { className: 'eb-section-label' }, t('shapeDefaults')),
        shapeRows,
        h('div', { className: 'eb-inline-actions' },
          button(t('applyFuture'), () => saveSettings('future'), { className: 'eb-primary' }),
          button(t('applyExisting'), () => saveSettings('existing')),
          button(t('cancel'), () => { setSettingsView(false); setSettingsDraft(null); })));
    }

    const modeHint = group ? t('hintGrouped') : selected.length ? t('hintSelected') : t('hintEmpty');
    const canMerge = activeSelected.length >= 2;
    const canSplit = Boolean(single && single.sources.length > 0 && !single.removed);
    const header = h('header', { className: 'eb-top' },
      h('div', { className: 'eb-identity' }, swatch('star', 1, 32),
        h('div', null, h('strong', null, t('title')), h('small', null, t('workspaceSubtitle')))));
    const toolboxPanel = h('aside', { className: 'eb-panel eb-tools', 'aria-label': t('toolbox') },
      h('div', { className: 'eb-panel-head' }, h('h3', null, t('toolbox')), h('p', null, t('tapToAdd'))),
      h('div', { className: 'eb-tools-body' },
        h('div', { className: 'eb-section-label' }, t('shapes')),
        h('div', { className: 'eb-shape-grid' }, visibleShapes.map((shape) => {
          const def = settings.defaults.find((item) => item.shape === shape);
          const colorIndex = Math.max(0, colorForLevel(def.value));
          return button(h(React.Fragment, null, swatch(shape, colorIndex, 28), h('span', null, t(shape))),
            () => add(shape),
            { className: 'eb-shape-tool', key: shape, draggable: true, disabled: board.objects.length >= 200,
              title: `${t(shape)} · ${t('value')} ${def.value}`,
              onDragStart: () => setDragShape(shape), onDragEnd: () => setDragShape(null) });
        }),
        button(h(React.Fragment, null, icon('plus', 15), h('span', null, t('morePatterns'))),
          () => { setSettingsView(true); setSettingsDraft(null); },
          { className: 'eb-shape-tool eb-shape-more', key: 'more-patterns', title: t('patternsHint') })),
        h('div', { className: 'eb-legend' }, levels.map((level, index) => h('div', { className: 'eb-legend-row', key: index },
          h('span', { className: 'eb-color-dot', style: { background: paletteColor(index) } }),
          h('span', null, String(level.value))))),
        button(h(React.Fragment, null, icon('gear', 15), t('settings')),
          () => { setSettingsView(!settingsView); setSettingsDraft(null); },
          { className: 'eb-new-group', 'aria-pressed': settingsView })));
    const selectionBar = selected.length > 0 && !settingsView && h('div', { className: 'eb-floating', role: 'toolbar', 'aria-label': t('selectionActions') },
      h('small', null, `${t('selectedCount')} ${selected.length}`),
      !group && button(h(React.Fragment, null, icon('group', 15), t('makeGroup')), groupSelection, { disabled: board.groups.length >= 12 }),
      group && button(h(React.Fragment, null, icon('ungroup', 15), t('ungroup')), ungroup),
      canMerge && button(h(React.Fragment, null, icon('merge', 15), t('merge')), mergeSelection,
        { disabled: !(mergeInfo && mergeInfo.allowed), title: mergeInfo && !mergeInfo.allowed ? mergeInfo.reason : '' }),
      canSplit && button(h(React.Fragment, null, icon('split', 15), t('split')), splitSelection),
      button(h(React.Fragment, null, icon('copy', 15), t('copy')), duplicate, { disabled: board.objects.length + selected.length > 200 }),
      button(h(React.Fragment, null, icon('cross', 15), selected.every((item) => item.removed) ? t('restore') : t('crossOut')),
        () => updateSelected({ removed: !selected.every((item) => item.removed) })),
      toolButton('trash', removeSelected));
    const canvas = h('div', { className: 'eb-canvas-scroll' },
      h('svg', {
        ref: svgRef, className: 'eb-artboard',
        style: { width: fit ? '100%' : 800 * zoom, height: fit ? '100%' : 400 * zoom },
        viewBox: '0 0 800 400', preserveAspectRatio: 'xMidYMid meet', role: 'group', 'aria-label': t('canvas'),
        onPointerDown: pointerDown, onPointerMove: pointerMove, onPointerUp: (event) => pointerEnd(event),
        onPointerCancel: (event) => pointerEnd(event, true), onLostPointerCapture: (event) => pointerEnd(event, true),
      },
      h('rect', { width: 800, height: 400, fill: '#FFFFFF' }),
      board.groups.map(groupBoundary),
      board.objects.map(renderObject),
      !board.objects.length && h('g', { pointerEvents: 'none' },
        h('text', { x: 400, y: 190, textAnchor: 'middle', fill: '#64748B', fontSize: 17, fontWeight: 500 }, t('canvasEmpty')),
        h('text', { x: 400, y: 216, textAnchor: 'middle', fill: '#64748B', fontSize: 12 }, t('canvasEmptyHint'))),
      preview && preview.kind === 'lasso' && h('rect', {
        x: preview.x, y: preview.y, width: preview.w, height: preview.h,
        fill: '#2563EB18', stroke: '#2563EB', strokeWidth: 1.5, pointerEvents: 'none',
      })));
    const stageTools = h('div', { className: 'eb-canvas-tools' },
      toolButton('undo', undo, { disabled: !history.past.length }),
      toolButton('redo', redo, { disabled: !history.future.length }),
      button(h(React.Fragment, null, icon('multi', 15), h('span', null, t('multiSelect'))),
        () => setMulti(!multi), { 'aria-pressed': multi, className: 'eb-chip' }),
      button(h(React.Fragment, null, icon('focus', 15), h('span', null, t('focusMode'))),
        () => setFocus(!focus), { 'aria-pressed': focus, className: 'eb-chip' }),
      h('div', { className: 'eb-zoom' },
        button('−', () => { setFit(false); setZoom(Math.max(0.75, zoom - 0.25)); }, { 'aria-label': t('zoomOut') }),
        button(fit ? t('fitView') : `${Math.round(zoom * 100)}%`, () => setFit(!fit), { 'aria-label': t('fitView'), 'aria-pressed': fit }),
        button('＋', () => { setFit(false); setZoom(Math.min(2, zoom + 0.25)); }, { 'aria-label': t('zoomIn') })));
    const stagePanel = h('section', { className: 'eb-stage-wrap', 'aria-label': t('canvas') },
      settingsView
        ? h('div', { className: 'eb-settings-wrap' }, settingsPanel())
        : h('div', {
            className: 'eb-stage-frame',
            onDragOver: (event) => { if (dragShape) event.preventDefault(); },
            onDrop: (event) => {
              if (!dragShape) return;
              event.preventDefault();
              const rect = svgRef.current.getBoundingClientRect();
              add(dragShape, { x: (event.clientX - rect.left) * (800 / rect.width), y: (event.clientY - rect.top) * (400 / rect.height) });
              setDragShape(null);
            },
          },
          h('div', { className: 'eb-canvas-area' }, canvas, selectionBar),
          stageTools),
      h('div', { className: 'eb-stage-caption' }, h('span', null, modeHint)));
    const inspectorSections = [];
    if (selected.length > 0 && group) inspectorSections.push(h('section', { key: 'group' },
      h('label', null, t('groupAlias'), h('input', {
        key: `g:${group.id}:${group.alias}`, type: 'text', maxLength: 30, defaultValue: group.alias, placeholder: t('groupHint'),
        onBlur: (event) => { if (event.target.value !== group.alias) action({ type: 'renameGroup', id: group.id, alias: event.target.value }); },
        onKeyDown: (event) => { if (event.key === 'Enter') event.currentTarget.blur(); },
      })),
      h('p', { className: 'eb-muted' }, t('groupedNoAlias')),
      h('div', { className: 'eb-inspector-actions' },
        button(t('ungroup'), ungroup),
        button(t('duplicateGroup'), () => { action({ type: 'duplicateSelected', ids: selected.map((item) => item.id) }); }))));
    if (selected.length > 0 && !group && single) inspectorSections.push(h('section', { key: 'single' },
      h('label', null, t('alias'), h('input', {
        key: `n:${single.id}:${single.alias}`, type: 'text', maxLength: 30, defaultValue: single.alias, placeholder: t('aliasHint'),
        onBlur: (event) => { if (event.target.value !== single.alias) updateSelected({ alias: event.target.value }); },
        onKeyDown: (event) => { if (event.key === 'Enter') event.currentTarget.blur(); },
      })),
      h('p', { className: 'eb-muted' }, `${t('value')}: ${single.value}${single.sources.length ? ` · ${t('mergedFrom')} ${single.sources.length}` : ''}`)));
    if (selected.length > 0 && !group && !single) inspectorSections.push(h('div', { className: 'eb-hint-card', key: 'many' }, `${t('selectedCount')} ${selected.length}`));
    const inspectorPanel = h('aside', { className: 'eb-panel eb-inspector', 'aria-label': t('myObjects') },
      h('div', { className: 'eb-panel-head' },
        h('h3', null, group ? t('myGroup') : t('myObjects')),
        h('p', null, t('inspectorHint'))),
      h('div', { className: 'eb-inspector-body' },
        !selected.length && h('div', { className: 'eb-hint-card' }, t('noSelection')),
        ...inspectorSections,
        canMerge && mergeInfo && !mergeInfo.allowed && h('div', { className: 'eb-hint-card' }, t('mergeReason')),
        h('label', null, t('note'), h('textarea', {
          key: `note:${board.note}`, defaultValue: board.note, maxLength: 500, placeholder: t('noteHint'),
          onBlur: (event) => { if (event.target.value !== boardRef.current.note) action({ type: 'note', value: event.target.value }); },
        }))));
    const footer = h('footer', { className: 'eb-footer' },
      h('div', { className: 'eb-status', role: 'status', 'aria-live': 'polite' }, status || t('localDraft')),
      clearConfirm
        ? h('div', { className: 'eb-confirm' },
            h('span', null, t('clearQuestion')),
            button(t('confirmClear'), () => { commit(M.empty()); selectIds([]); setStorageBlocked(false); }),
            button(t('cancel'), () => setClearConfirm(false)))
        : h('div', { className: 'eb-file-actions' },
            button(t('export'), exportFile),
            button(t('import'), () => fileInput.current.click()),
            button(t('clear'), () => setClearConfirm(true))),
      button(t('insert'), insert, { className: 'eb-primary', disabled: !board.objects.length || phase !== 'plain' }),
      button(h(React.Fragment, null, icon('close'), h('span', null, t('backToChat'))), close, { className: 'eb-close', 'aria-label': t('backToChat') }),
      h('input', { hidden: true, type: 'file', accept: '.json,application/json', ref: fileInput, onChange: importFile }),
      h('a', { hidden: true, ref: downloadAnchor, download: 'math-board.json' }));
    return h(React.Fragment, null,
      h('style', null, css),
      h('section', { className: 'edu-board-entry', 'aria-label': t('title') },
        swatch('star', 1, 28),
        h('div', { className: 'eb-entry-copy' }, h('strong', null, t('title')), h('small', null, status || t('entryHint'))),
        button(t('openWorkbench'), () => setOpened(true), { className: 'eb-launch', disabled: !ready })),
      h('dialog', {
        ref: dialog, className: 'eb-dialog', 'aria-label': t('title'),
        onCancel: (event) => { event.preventDefault(); close(); },
        onClose: () => setOpened(false),
      },
      h('div', { className: 'eb-workbench' },
        header,
        h('main', { className: 'eb-layout', 'data-focus': focus }, toolboxPanel, stagePanel, inspectorPanel),
        footer)));
  };
}
