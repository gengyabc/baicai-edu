// Development-only visual check: node preview.mjs [output.html]
// Renders every pattern through createShapeArt with a minimal React -> SVG adapter.
import { writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createShapeArt } from './view.js';
import { createBoardModel } from './model.js';

const React = {
  createElement(type, props, ...children) { return { type, props: props || {}, children }; },
};
const art = createShapeArt(React);
const M = createBoardModel();
const palette = ['#4CAF50', '#42A5F5', '#FF7043'];
const ATTRIBUTES = { strokeWidth: 'stroke-width', strokeLinecap: 'stroke-linecap', strokeLinejoin: 'stroke-linejoin' };
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
function render(node) {
  if (node === null || node === undefined || node === false) return '';
  if (Array.isArray(node)) return node.map(render).join('');
  if (typeof node !== 'object') return escape(node);
  const { type, props, children } = node;
  if (type === '#fragment') return children.map(render).join('');
  const attrs = Object.entries(props)
    .filter(([key, value]) => key !== 'key' && key !== 'ref' && value !== null && value !== undefined && typeof value !== 'function')
    .map(([key, value]) => `${ATTRIBUTES[key] || key}="${escape(value)}"`).join(' ');
  return `<${type} ${attrs}>${children.map(render).join('')}</${type}>`;
}
const zh = JSON.parse(await readFile(new URL('locale/zh.json', import.meta.url), 'utf8'));
const label = (shape) => zh[shape] || shape;
const tile = (shape, radius, size, color) => `<figure><svg width="${size}" height="${size}" viewBox="-28 -28 56 56" aria-label="${label(shape)}">${render(art.node(shape, radius, { fill: color }))}</svg><figcaption>${label(shape)}</figcaption></figure>`;
const large = M.defaultVisibleShapes.map((shape, i) => tile(shape, 22, 150, palette[i % palette.length])).join('');
const all = M.shapes.map((shape, i) => tile(shape, 21, 88, palette[i % palette.length])).join('');
const small = M.shapes.map((shape, i) => tile(shape, 13, 38, palette[i % palette.length])).join('');
const tiny = M.shapes.map((shape, i) => tile(shape, 10, 28, palette[i % palette.length])).join('');
const canvasValues = ['1', '2', '10', '100', '1000'];
const canvas = M.defaultVisibleShapes.map((shape, i) => {
  const value = canvasValues[i % canvasValues.length];
  return `<figure><svg width="82" height="82" viewBox="-24 -24 48 48">${render(art.node(shape, 19, { fill: palette[i % palette.length] }))}<text x="0" y="4" text-anchor="middle" font-size="${value.length > 3 ? 8 : 10}" font-weight="700" fill="#1E293B" stroke="#FFFFFF" stroke-width="2.5" paint-order="stroke">${value}</text></svg><figcaption>${label(shape)} · ${value}</figcaption></figure>`;
}).join('');
const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><style>
  body{font-family:-apple-system,"PingFang SC",sans-serif;margin:24px;background:#f8fafc;color:#0f172a}
  h1{font-size:18px;margin:0 0 8px} h2{font-size:13px;margin:22px 0 8px;color:#475569}
  .row{display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start}
  .grid{display:grid;grid-template-columns:repeat(10,96px);gap:8px}
  .grid.small{grid-template-columns:repeat(19,44px)} .grid.tiny{grid-template-columns:repeat(19,34px)}
  figure{margin:0;text-align:center} figcaption{font-size:11px;color:#64748b;margin-top:2px}
  svg{background:#fff;border:1px solid #e2e8f0;border-radius:10px}
</style></head><body>
<h1>默认工具箱（${M.defaultVisibleShapes.map(label).join('、')}）</h1><div class="row">${large}</div>
<h2>全部 19 个图案（展示尺寸）</h2><div class="grid">${all}</div>
<h2>画布实际大小（含数值）</h2><div class="row">${canvas}</div>
<h2>工具箱小图标 38px / 28px</h2><div class="grid small">${small}</div><div class="grid tiny">${tiny}</div>
</body></html>`;
const target = process.argv[2] || join(tmpdir(), 'math-board-shapes.html');
await writeFile(target, html);
console.log(target);
