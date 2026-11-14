import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createReferenceModel } from './reference-model.js';
import { createTeacherReferenceView } from './reference-view.js';
import { createTabbedBoardView } from './board-shell.js';

const model = createReferenceModel();
const reference = {
  title: '两个长方形', description: '甲长9厘米、宽1厘米；乙长6厘米、宽4厘米。', width: 600, height: 240,
  shapes: [
    { type: 'rect', x: 30, y: 70, width: 180, height: 20 },
    { type: 'rect', x: 330, y: 70, width: 120, height: 80 },
    { type: 'text', x: 30, y: 40, text: '甲：9厘米 × 1厘米' },
    { type: 'line', x1: 20, y1: 170, x2: 220, y2: 170 },
    { type: 'circle', cx: 500, cy: 190, r: 10 },
  ],
};
function harness() {
  let state = null;
  return {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter(x => x != null && x !== false) }),
    useState: () => [state, value => { state = value; }],
    useEffect: () => {}, useRef: current => ({ current }), Fragment: 'fragment',
  };
}
function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  return [...(predicate(tree) ? [tree] : []), ...(tree.children || []).flatMap(child => nodes(child, predicate))];
}

test('teacher primitives render only literal SVG attributes and accessible text', () => {
  const React = harness();
  const View = createTeacherReferenceView(React, key => key, model);
  const view = { revision: 1, reference };
  const tree = View({ view, sessionId: 's-geometry' });
  const svg = nodes(tree, n => n.type === 'svg')[0];
  assert.equal(svg.props.role, 'img');
  assert.equal(svg.props.viewBox, '0 0 600 240');
  assert.equal(nodes(svg, n => n.type === 'rect').length, 2);
  assert.equal(nodes(svg, n => n.type === 'text')[0].children[0], reference.shapes[2].text);
  assert.equal(nodes(svg, n => n.type === 'desc')[0].children[0], reference.description);
  assert.equal(nodes(tree, n => n.props.dangerouslySetInnerHTML || n.props.onPointerDown || n.props['data-object']).length, 0);
  assert.deepEqual(view, { revision: 1, reference });
  let stopped = false;
  tree.props.onKeyDown({ key: 'z', ctrlKey: true, stopPropagation() { stopped = true; } });
  assert.equal(stopped, true, 'board undo/delete handlers do not receive reference keyboard events');
  const hostile = structuredClone(reference);
  hostile.shapes[2].text = '<script>alert(1)</script>';
  const text = nodes(View({ view: { revision: 2, reference: hostile }, sessionId: 's' }), n => n.type === 'text')[0];
  assert.equal(text.children[0], '<script>alert(1)</script>', 'React receives literal text, never HTML');
});

test('missing, hidden, unsupported, and invalid reference projections fail closed', () => {
  const View = createTeacherReferenceView(harness(), k => k, model);
  for (const view of [null, undefined, { revision: 0, reference: null }, { revision: 1, reference: null },
    { revision: 1, reference, student: true }, { revision: 1, reference: { ...reference, shapes: [{ type: 'image', href: 'file:///private' }] } }]) {
    assert.equal(View({ view, sessionId: 's' }), null);
  }
});

test('student can collapse a reference locally and newer references reappear without writes', () => {
  const React = harness(), View = createTeacherReferenceView(React, k => k, model);
  const props = { view: { revision: 1, reference }, sessionId: 's' };
  let tree = View(props);
  nodes(tree, n => n.type === 'button')[0].props.onClick();
  tree = View(props);
  assert.equal(nodes(tree, n => n.type === 'svg').length, 0);
  assert.equal(nodes(tree, n => n.type === 'button')[0].props['aria-expanded'], false);
  assert.equal(nodes(View({ ...props, view: { revision: 2, reference } }), n => n.type === 'svg').length, 1);
  nodes(tree, n => n.type === 'button')[0].props.onClick();
  assert.equal(nodes(View(props), n => n.type === 'svg').length, 1);
});

test('shell shows no teacher diagram on the quantity or geometry tab', () => {
  const React = harness(), projectionReads = [];
  function TeacherReference() {}
  function Quantity() {}
  function Geometry() {}
  const Shell = createTabbedBoardView(React, k => k, '', {
    quantity: () => Quantity, geometry: () => Geometry, mark: () => null, TeacherReference,
  });
  const tree = Shell({ sessionId: 's', useProjection: key => { projectionReads.push(key); return { revision: 1, reference }; } });
  assert.deepEqual(projectionReads, ['eduBoardGeometryDemo']);
  const pages = nodes(tree, n => n.type === Quantity || n.type === Geometry);
  assert.equal(pages.flatMap(page => nodes(page.props.question, n => n.type === TeacherReference)).length, 0);
  assert.ok(pages.every(page => !('reference' in page.props)), 'teacher reference never becomes student model input');
});

test('teacher reference has localized boundary copy and shipped modules', async () => {
  for (const lang of ['zh', 'en']) {
    const locale = JSON.parse(await readFile(new URL(`locale/${lang}.json`, import.meta.url)));
    for (const key of ['teacherReference', 'teacherReferenceHint', 'teacherReferenceShow', 'teacherReferenceHide', 'teacherReferenceScroll']) assert.ok(locale[key]);
  }
  const pkg = JSON.parse(await readFile(new URL('package.json', import.meta.url)));
  for (const path of ['reference-model.js', 'reference-bridge.js', 'reference-view.js']) assert.ok(pkg.files.includes(path));
});
