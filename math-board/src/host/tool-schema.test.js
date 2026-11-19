import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// DSH admits only a keyword subset in registered tool schemas (dsh-tools
// `assertSupportedJsonSchema`): type/oneOf/properties/required/
// additionalProperties/items/enum/const plus description/title/default/
// examples. Anything else throws inside tools.register(), which aborts the
// whole plugin entry at activation time, so this test mounts the real entry
// and validates its schemas with the harness's own checker.
function harnessValidatorPath() {
  const candidates = [];
  if (process.env.DSH_TOOLS_MODULE) candidates.push(process.env.DSH_TOOLS_MODULE);
  try {
    const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    candidates.push(path.join(root, '@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-tools/lib/index.js'));
  } catch {}
  candidates.push(path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules',
    '@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-tools/lib/index.js'));
  return candidates.find(candidate => candidate && existsSync(candidate));
}

async function registeredTool() {
  const module = await import(pathToFileURL(path.resolve(import.meta.dirname, '../../index.js')).href);
  const captured = { tool: null, tools: [], command: null, prompts: [], projections: [] };
  const disposer = () => {};
  const ctx = {
    effect: fn => fn(),
    inject: (_dependencies, callback) => callback(ctx),
    tools: { register(definition) { captured.tools.push(definition); if (definition.name === 'math_board_settings') captured.tool = definition; return disposer; } },
    commands: { register(definition) { captured.command = definition; return disposer; } },
    sessionProjections: { register: async definition => {
      const projection = { definition, state: definition.init() };
      captured.projections.push(projection);
      return { stateOf: () => projection.state };
    } },
    systemPrompt: { section: entry => captured.prompts.push(entry.name) },
  };
  await module.apply(ctx);
  assert.ok(captured.tool, 'apply() must register the settings tool');
  return captured;
}

// Rejects anything outside DSH's author schema subset: type/oneOf/properties/
// required/additionalProperties/items/enum/const plus description-like
// annotations. The plugin no longer imports the host's checker, so the package
// activates on hosts it cannot resolve from; these guards keep the wire schema
// inside that contract anyway.
const authorKeys = new Set(['type', 'oneOf', 'properties', 'required', 'additionalProperties', 'items', 'enum', 'const', 'description', 'title', 'default', 'examples']);
function subsetViolations(schema, path = 'schema') {
  const violations = [];
  if (Array.isArray(schema)) { schema.forEach((child, index) => violations.push(...subsetViolations(child, `${path}[${index}]`))); return violations; }
  if (typeof schema !== 'object' || schema === null) { violations.push(`${path} must be a schema object`); return violations; }
  for (const key of Object.keys(schema)) if (!authorKeys.has(key)) violations.push(`${path}.${key} is outside the DSH subset`);
  if (Object.hasOwn(schema, 'oneOf')) {
    if (Object.hasOwn(schema, 'type')) violations.push(`${path} cannot declare both type and oneOf`);
    if (!Array.isArray(schema.oneOf) || schema.oneOf.length < 2) violations.push(`${path}.oneOf needs at least two branches`);
    else schema.oneOf.forEach((branch, index) => violations.push(...subsetViolations(branch, `${path}.oneOf[${index}]`)));
  }
  if (schema.type === 'object') {
    if (typeof schema.additionalProperties !== 'boolean') violations.push(`${path}.additionalProperties must be explicit`);
    if (schema.properties) for (const [key, child] of Object.entries(schema.properties)) violations.push(...subsetViolations(child, `${path}.properties.${key}`));
  }
  if (schema.type === 'array' && schema.items) violations.push(...subsetViolations(schema.items, `${path}.items`));
  return violations;
}

test('registered tool schemas stay inside the DSH keyword subset', async () => {
  // The host checker is the reference for the subset; the local guards above
  // keep the assertion even when one particular DSH installation cannot be
  // located, which is exactly the layout a published package meets.
  const validatorPath = harnessValidatorPath();
  const { assertSupportedJsonSchema } = validatorPath
    ? await import(pathToFileURL(validatorPath).href)
    : { assertSupportedJsonSchema: () => {} };
  const { tools } = await registeredTool();
  assert.equal(tools.length, 3);
  for (const tool of tools) {
    assert.doesNotThrow(() => assertSupportedJsonSchema(tool.output.schema));
    assert.doesNotThrow(() => assertSupportedJsonSchema(tool.parameters));
    assert.deepEqual(subsetViolations(tool.parameters), [], tool.name);
    assert.deepEqual(subsetViolations(tool.output.schema), [], tool.name);
  }
  // OpenAI-compatible providers in general, and Volcengine Ark in particular,
  // reject a function whose parameters are not an object-rooted schema with
  // 400 InvalidParameter ("tools.N.function.parameters must be a JSON Schema
  // of type object"). DSH's subset forbids type alongside oneOf, so every
  // action union here must be flattened into one object schema; each action's
  // exact shape stays enforced by the owning bridge's request().
  for (const tool of tools) {
    assert.equal(tool.parameters.type, 'object', `${tool.name} parameters must be object-rooted`);
  }
  const clear = tools.find(tool => tool.name === 'math_board_clear');
  assert.deepEqual(clear.parameters.properties, {});
  assert.deepEqual(clear.parameters.required, []);
  assert.equal(clear.isConcurrencySafe, false);
});

test('settings tool keeps its contract after keyword removal', async () => {
  const { tool, prompts } = await registeredTool();
  assert.equal(tool.name, 'math_board_settings');
  assert.deepEqual(tool.parameters.required, ['action']);
  assert.deepEqual(Object.keys(tool.parameters.properties), ['action', 'settings', 'scope', 'expectedRevision']);
  assert.equal(tool.parameters.properties.action.enum.join(','), 'get,set');
  assert.deepEqual(tool.output.schema.required, ['kind', 'status', 'revision', 'settings']);
  assert.equal(tool.output.schema.properties.kind.const, 'edu-board-config');
  assert.deepEqual(prompts, ['edu-math-board-geometry-demo', 'edu-math-board-clear', 'edu-math-board-submission', 'edu-math-board-geometry', 'edu-math-board-settings']);
});

test('registered geometry tool recovers an empty teacher page and publishes its figure without student APIs', async () => {
  const { tools, projections } = await registeredTool();
  const tool = tools.find(entry => entry.name === 'geometry_board_draw');
  assert.ok(tool, 'the advertised geometry tool must actually be registered');
  assert.equal(tool.parameters.type, 'object');
  assert.deepEqual(tool.parameters.properties.action.enum, ['get', 'show', 'hide']);
  assert.ok(tool.parameters.properties.figure);
  const projection = projections.find(entry => entry.definition.key === 'eduBoardGeometryDemo');
  const session = { get draft() { throw Error('Must never access student draft'); } };
  const exec = { agent: { session }, callId: 'recover-geometry-demo' };
  const current = await tool.execute({ action: 'get' }, exec);
  assert.equal(current.figure, null);
  assert.equal(current.revision, 0);
  const args = { action: 'show', expectedRevision: current.revision, figure: {
    title: '周长相同，面积会怎样？', description: '周长24厘米，长和宽都是整厘米数。仅示意已知条件。',
    board: { schemaVersion: 1, points: [
      { id: 'a', label: 'A', kind: 'free', x: 180, y: 180 },
      { id: 'b', label: 'B', kind: 'free', x: 600, y: 180 },
      { id: 'c', label: 'C', kind: 'free', x: 600, y: 420 },
      { id: 'd', label: 'D', kind: 'derived', x: 180, y: 420, construction: { op: 'rectangle', inputs: ['a', 'b', 'c'] } },
    ], elements: [{ id: 'rect', type: 'rectangle', role: 'main', note: '周长24厘米', points: ['a', 'b', 'c', 'd'] }], note: '' },
  } };
  await assert.rejects(tool.execute(args, exec), /exact logged/);
  projection.state = projection.definition.apply(projection.state, { type: 'tool/call', seq: 1,
    data: { name: tool.name, callId: exec.callId, arguments: JSON.stringify(args) } });
  const recorded = await tool.execute(args, exec);
  assert.equal(recorded.status, 'recorded');
  projection.state = projection.definition.apply(projection.state, { type: 'tool/result', seq: 2,
    data: { message: { role: 'tool', source: { kind: 'tool', callId: exec.callId }, toolCallId: exec.callId,
      content: tool.output.render(args, recorded) } } });
  const view = projection.definition.wire.view(projection.state);
  projection.definition.stateSchema.parse(projection.state);
  projection.definition.wire.viewSchema.parse(view);
  assert.equal(view.revision, 1);
  assert.equal(view.figure.title, args.figure.title);
  assert.equal(view.figure.board.elements[0].type, 'rectangle');
  assert.equal(view.figure.board.elements[0].note, '周长24厘米');
  assert.deepEqual(await tool.execute({ action: 'get' }, exec), { ...recorded, status: 'current' });
});

test('geometry get and show arguments execute through the registered tool and projection', async () => {
  // The teaching contract is prose and has no fenced JSON recipes. Build the
  // arguments here and still run them through the registered tool.
  const get = { action: 'get' };
  const show = {
    action: 'show',
    expectedRevision: 0,
    figure: {
      title: '周长相同，面积会怎样？',
      description: '周长24厘米，长和宽都是整厘米数。仅示意已知条件。',
      board: {
        schemaVersion: 1,
        points: [
          { id: 'a', label: 'A', kind: 'free', x: 180, y: 180 },
          { id: 'b', label: 'B', kind: 'free', x: 600, y: 180 },
          { id: 'c', label: 'C', kind: 'free', x: 600, y: 420 },
          { id: 'd', label: 'D', kind: 'derived', x: 180, y: 420, construction: { op: 'rectangle', inputs: ['a', 'b', 'c'] } },
        ],
        elements: [{ id: 'rect', type: 'rectangle', role: 'main', note: '周长24厘米', points: ['a', 'b', 'c', 'd'] }],
        note: '',
      },
    },
  };
  const { tools, projections } = await registeredTool();
  const tool = tools.find(entry => entry.name === 'geometry_board_draw');
  const projection = projections.find(entry => entry.definition.key === 'eduBoardGeometryDemo');
  const session = { get draft() { throw Error('Must never access student draft'); } };
  const exec = { agent: { session }, callId: 'shared-recipe' };
  const initial = await tool.execute(get, exec);
  show.expectedRevision = initial.revision;
  projection.state = projection.definition.apply(projection.state, { type: 'tool/call', seq: 1,
    data: { name: tool.name, callId: exec.callId, arguments: JSON.stringify(show) } });
  const recorded = await tool.execute(show, exec);
  assert.equal(recorded.status, 'recorded');
  projection.state = projection.definition.apply(projection.state, { type: 'tool/result', seq: 2,
    data: { message: { role: 'tool', source: { kind: 'tool', callId: exec.callId }, toolCallId: exec.callId,
      content: tool.output.render(show, recorded) } } });
  const current = await tool.execute(get, exec);
  assert.equal(current.revision, initial.revision + 1);
  assert.deepEqual(current.figure, recorded.figure);
  assert.equal(current.figure.board.elements[0].type, 'rectangle');
});
