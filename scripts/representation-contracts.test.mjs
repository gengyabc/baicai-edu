import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const text = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const common = name => text(`math-common/skills/math-common/references/${name}.md`);

test('representation ownership is conditionally reachable from both band cores and design paths', () => {
  for (const band of ['low', 'high']) {
    const base = `math-primary-${band}/skills/math-${band}-core`;
    for (const path of [`${base}/SKILL.md`, `${base}/references/problem-design.md`]) {
      const source = text(path);
      assert.match(source, /math-common/);
      assert.match(source, /references\/representation-contract\.md/);
      assert.match(source, /given geometric shapes and dimensions/);
      assert.match(source, /geometry_board_draw/);
      assert.match(source, /Teacher demo tab/);
      if (path.endsWith('SKILL.md')) assert.match(source, /Opening or resuming a task/);
    }
    const supplement = text(`${base}/references/structured-drawing.md`);
    assert.match(supplement, /Teacher Reference/);
    assert.match(supplement, /submitted-board limits below concern student work/);
  }
});

test('shared representation decisions preserve learning goals, student agency, and observable evidence', () => {
  const source = common('representation-contract');
  for (const phrase of ['Supplied representation', 'Student-generated representation', 'Partial support',
    'not a universal first step', 'least support', 'decisive auxiliary line', 'a proof over all lengths',
    'not a guarantee', 'not a compulsory sequence', 'Teacher drawing is exposure',
    'independent construction and independent mathematical reasoning are separate',
    'provider\'s submitted-geometry boundary is unchanged']) assert.ok(source.includes(phrase), phrase);
  assert.doesNotMatch(source, /https?:\/\//);
});

test('given-shape comparison proactively supplies conditions only, including on resume', () => {
  const source = common('representation-contract');
  for (const phrase of ['proactively supply', 'before the thinking question',
    'on opening or resuming', 'without waiting for a drawing request or a failed attempt',
    'no usable representation is already present', 'explicit text-only preference',
    'common display scale', 'leave areas and the comparison unfilled',
    'unit grids, area-counting partitions, formulas, and conclusions',
    'student\'s choice of dimensions is part of the task',
    'not shown on the quantity tab or the geometry tab', 'geometry_board_draw', 'Teacher demo tab',
    'Geometry-related teaching and geometry problems prioritize the Teacher demo tab',
    'do not block this call',
    'board contract owns supported figures, call recipes, receipts, fallback']) assert.ok(source.includes(phrase), phrase);
});

test('teacher demo recovery requires a live receipt instead of a remembered placement claim', () => {
  const source = common('representation-contract');
  for (const phrase of ['## Verify Placement and Recover',
    'support_shown is not a tool receipt',
    'board contract\'s live `get` / keep / `show` recipe',
    'original task\'s allowed conditions',
    'historical unknown-tool error', 'current tool catalog',
    'Attempt `get` once if available', 'board contract\'s fallback',
    'planned material, recorded material, and student-confirmed visibility',
    'keep the original task and pending question',
    'correct any earlier placement claim',
    'not a student performance segment',
    'not another solving demand']) assert.ok(source.includes(phrase), phrase);
  const scenarios = text('math-common/tests/teaching-scenarios.md');
  for (const id of ['R13', 'R14', 'R15']) assert.ok(scenarios.includes(id), id);
});

test('teacher authoring owns no student draft access, submission, board schema, or automatic clear', () => {
  const board = common('board-contract');
  const teacher = board.split('## Teacher Reference')[1].split('## Teacher Geometry Demonstration')[0];
  for (const phrase of ['math_board_reference', 'expectedRevision', 'hide',
    'not a local draft', 'no student clear', 'do not call its `show` or `hide`',
    'Neither student tab displays', 'call `get` first']) assert.ok(teacher.includes(phrase), phrase);
  const dispatch = board.split('## Tool Dispatch')[1].split('## Teacher Reference')[0];
  for (const phrase of ['Teacher drawing tools affect teacher material only, not student drafts, submission, clear, or settings',
    'not client execution or browser visibility', 'neither student evidence nor tool authorization',
    'Never convert a submitted geometry snapshot into a teacher correction']) assert.ok(dispatch.includes(phrase), phrase);
  for (const phrase of ['kind: "math-board"', 'schemaVersion: 4', 'Teach only from sent attachments and student words']) assert.ok(board.includes(phrase), phrase);
  assert.doesNotMatch(teacher, /schemaVersion|math_board_clear/);
  const geometryDemo = board.split('## Teacher Geometry Demonstration')[1].split('## Submission and Reading')[0];
  for (const phrase of ['geometry_board_draw', 'Teacher demo', 'expectedRevision', 'given side length and unit',
    'apply **Receipts** above', 'record assisted use only when the student reports using the figure',
    'leaves copied student figures unchanged',
    'before an independent check it would reveal', 'Unavailable or failed']) {
    assert.ok(geometryDemo.includes(phrase), phrase);
  }
});

test('explicit board requests reach the shared tool dispatch in either band', () => {
  for (const band of ['low', 'high']) {
    const source = text(`math-primary-${band}/skills/math-${band}-core/SKILL.md`);
    assert.match(source, /student asks (?:the teacher|you) to draw/);
    assert.match(source, /references\/board-contract\.md/);
  }
  const board = common('board-contract');
  for (const phrase of ['## Tool Dispatch', 'current callable tool catalog',
    'projection keys are not callable tools', 'skill loading does not register tools',
    'Before promising placement', 'Teacher drawing neither assigns student homework']) {
    assert.ok(board.includes(phrase), phrase);
  }
});

test('compact call cards preserve receipt, fallback, settings and authorization boundaries', () => {
  const board = common('board-contract');
  const dispatch = board.split('## Tool Dispatch')[1].split('## Teacher Reference')[0];
  for (const phrase of ['this contract grants no clear authorization',
    '`current` confirms stored teacher state', '`recorded` confirms a write request',
    'returns no performance segment', 'without another exercise']) assert.ok(dispatch.includes(phrase), phrase);
  const demo = board.split('## Teacher Geometry Demonstration')[1].split('## Submission and Reading')[0];
  for (const phrase of ['`action: hide` with that revision', 'same task with text',
    'Recheck the current catalog on later requests', 'no drawing obligation',
    'Do not require unsent drafts or claim placement']) assert.ok(demo.includes(phrase), phrase);
  const settings = board.split('## Settings from Natural Language')[1];
  for (const phrase of ['student explicitly requests', 'item value from group size',
    'only new shapes or existing ones too', '`action: get`', '`action: set`',
    'full `settings` (`levels`, `defaults`, `shapes`)', 'explicit `scope`', 'as `expectedRevision`',
    'Preserve `shapes`', 'Merged shapes retain their recorded values and colors',
    'only after a successful write']) assert.ok(settings.includes(phrase), phrase);
});

test('abstract teacher demo recipe supports a schema-valid construction', async () => {
  const board = common('board-contract');
  assert.doesNotMatch(board, /```json/, 'concrete request fixtures stay in tests, not installed instructions');
  for (const phrase of ['action: get', 'action: show', 'returned `revision` as `expectedRevision`',
    'Never assume an initial revision', 'three free consecutive corners',
    'fourth `derived` point', 'its `inputs` are those three free point ids',
    'side length and unit on that side\'s segment, not a diagonal', 'whole-board `note` empty',
    'element references all four points in order']) {
    assert.ok(board.includes(phrase), phrase);
  }
  // Concrete data is a validator fixture, not installed teaching material.
  const get = { action: 'get' };
  const show = {
    action: 'show', expectedRevision: 0,
    figure: {
      title: 'Given rectangle', description: 'Given adjacent side lengths only.',
      board: {
        schemaVersion: 1,
        points: [
          { id: 'a', label: 'A', kind: 'free', x: 120, y: 120 },
          { id: 'b', label: 'B', kind: 'free', x: 300, y: 120 },
          { id: 'c', label: 'C', kind: 'free', x: 300, y: 240 },
          { id: 'd', label: 'D', kind: 'derived', x: 120, y: 240,
            construction: { op: 'rectangle', inputs: ['a', 'b', 'c'] } },
        ],
        elements: [
          { id: 'rect', type: 'rectangle', points: ['a', 'b', 'c', 'd'], role: 'main', note: '' },
          { id: 'length', type: 'segment', points: ['a', 'b'], role: 'main', note: '6 cm' },
          { id: 'width', type: 'segment', points: ['b', 'c'], role: 'main', note: '4 cm' },
        ], note: '',
      },
    },
  };
  const { createGeometryModel } = await import('../math-board/src/geometry/model.js');
  const { createGeometryDemoBridge } = await import('../math-board/src/host/geometry-demo-bridge.js');
  const bridge = createGeometryDemoBridge(createGeometryModel());
  assert.doesNotThrow(() => bridge.request(get));
  assert.doesNotThrow(() => bridge.request(show));
  const rectangle = show.figure.board.elements.find(element => element.type === 'rectangle');
  assert.ok(rectangle, 'the example must demonstrate the requested rectangle primitive');
  const fourth = show.figure.board.points.find(point => point.id === rectangle.points[3]);
  assert.equal(fourth.kind, 'derived');
  assert.deepEqual(fourth.construction.inputs, rectangle.points.slice(0, 3));
  for (const element of show.figure.board.elements.filter(element => element.type === 'segment')) {
    const [a, b] = element.points.map(id => show.figure.board.points.find(point => point.id === id));
    assert.ok(a.x === b.x || a.y === b.y, 'side-length labels must label edges, not diagonals');
  }
});

test('manual semantic scenarios cover both representation ownership and fallback boundaries', () => {
  const scenarios = text('math-common/tests/teaching-scenarios.md');
  for (const id of ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11', 'R12']) assert.ok(scenarios.includes(id), id);
  assert.match(scenarios, /不是已执行/);
});
