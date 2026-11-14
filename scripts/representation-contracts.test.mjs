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
    'If the tool is absent or fails',
    'without claiming placement']) assert.ok(source.includes(phrase), phrase);
});

test('teacher demo recovery requires a live receipt instead of a remembered placement claim', () => {
  const source = common('representation-contract');
  for (const phrase of ['## Verify Placement and Recover',
    'support_shown is not a tool receipt',
    'call `get` to inspect the current teacher figure',
    'figure: null', 'successful `show` receipt',
    'historical unknown-tool error', 'current tool catalog',
    'do not substitute a command, shell write, or student-board edit',
    'keep the original task and pending question',
    'not a student performance segment']) assert.ok(source.includes(phrase), phrase);
  const scenarios = text('math-common/tests/teaching-scenarios.md');
  for (const id of ['R13', 'R14', 'R15']) assert.ok(scenarios.includes(id), id);
});

test('teacher authoring owns no student draft access, submission, board schema, or automatic clear', () => {
  const board = common('board-contract');
  const teacher = board.split('## Teacher Reference')[1].split('## Teacher Geometry Demonstration')[0];
  for (const phrase of ['math_board_reference', 'expectedRevision', 'description', 'hide',
    'not a local draft', 'does not open the board', 'No student clear', 'not a visual verification',
    'when its support would reveal the next independent check', 'Tool absent or failed']) assert.ok(teacher.includes(phrase), phrase);
  for (const phrase of ['kind: "math-board"', 'schemaVersion: 4', 'student has already sent']) assert.ok(board.includes(phrase), phrase);
  assert.doesNotMatch(teacher, /schemaVersion|math_board_clear/);
  const geometryDemo = board.split('## Teacher Geometry Demonstration')[1].split('## Submission and Reading')[0];
  for (const phrase of ['geometry_board_draw', 'Teacher demo', 'expectedRevision', '9 cm',
    'not proof the student saw it', 'not itself evidence', 'leaves an already copied figure']) {
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
    'projection keys are not callable tools', 'Skill loading does not register tools',
    'before promising placement', 'does not turn teacher drawing into student homework']) {
    assert.ok(board.includes(phrase), phrase);
  }
});

test('shared teacher demo instructions include an executable tool-call example', async () => {
  const board = common('board-contract');
  const blocks = [...board.matchAll(/```json\n([\s\S]*?)\n```/g)].map(match => JSON.parse(match[1]));
  const get = blocks.find(args => args.action === 'get');
  const show = blocks.find(args => args.action === 'show' && args.figure);
  assert.ok(get, 'shared instructions need the exact get arguments');
  assert.ok(show, 'shared instructions need a complete show example, not a shell drawing');
  const { createGeometryModel } = await import('../math-board/geometry/model.js');
  const { createGeometryDemoBridge } = await import('../math-board/geometry-demo-bridge.js');
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
