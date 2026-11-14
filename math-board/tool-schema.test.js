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
  const module = await import(pathToFileURL(path.resolve(import.meta.dirname, 'index.js')).href);
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
  assert.equal(tools.length, 4);
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
  const { tool, command, prompts } = await registeredTool();
  assert.equal(tool.name, 'math_board_settings');
  assert.deepEqual(tool.parameters.required, ['action']);
  assert.deepEqual(Object.keys(tool.parameters.properties), ['action', 'settings', 'scope', 'expectedRevision']);
  assert.equal(tool.parameters.properties.action.enum.join(','), 'get,set');
  assert.deepEqual(tool.output.schema.required, ['kind', 'status', 'revision', 'settings']);
  assert.equal(tool.output.schema.properties.kind.const, 'edu-board-config');
  assert.equal(command.name, 'math-board-settings');
  assert.deepEqual(prompts, ['edu-math-board-geometry-demo', 'edu-math-board-reference', 'edu-math-board-clear', 'edu-math-board-submission', 'edu-math-board-geometry', 'edu-math-board-settings']);
});

test('reference tool registers exact structures, plain JSON, and teaching boundaries', async () => {
  const { tools } = await registeredTool();
  const tool = tools.find(entry => entry.name === 'math_board_reference');
  assert.ok(tool);
  assert.equal(tool.parameters.type, 'object');
  assert.deepEqual(tool.parameters.required, ['action']);
  assert.deepEqual(tool.parameters.properties.action.enum, ['get', 'show', 'hide']);
  assert.equal(tool.parameters.properties.expectedRevision.type, 'integer');
  const reference = tool.parameters.properties.reference;
  assert.deepEqual(reference.required, ['title', 'description', 'width', 'height', 'shapes']);
  assert.equal(reference.additionalProperties, false);
  const shapes = reference.properties.shapes.items.oneOf;
  assert.deepEqual(shapes.map(shape => shape.properties.type.const), ['rect', 'line', 'circle', 'text']);
  assert.ok(shapes.every(shape => shape.additionalProperties === false));
  assert.deepEqual(tool.output.schema.required, ['kind', 'status', 'revision', 'reference']);
  assert.equal(tool.output.schema.properties.kind.const, 'edu-board-reference');
  assert.equal(tool.isConcurrencySafe({ action: 'get' }), true);
  assert.equal(tool.isConcurrencySafe({ action: 'show' }), false);
  assert.equal(tool.isConcurrencySafe({ action: 'hide' }), false);
  const current = { kind: 'edu-board-reference', status: 'current', revision: 0, reference: null };
  assert.deepEqual(tool.output.render({}, current), [{ type: 'text', text: JSON.stringify(current) }]);
  await assert.rejects(tool.execute({ action: 'get', draft: true }, { agent: { session: {} }, callId: 'invalid' }), /fields/);
  // A recorded action union from an older tool-call log stays replayable: the
  // handler accepts the old oneOf payload and still reads it through request().
  const { REFERENCE_ACTION_UNION, withActionUnion } = await import('./board-schema.js');
  const invocation = { parameters: { oneOf: REFERENCE_ACTION_UNION } };
  const replayed = withActionUnion(tool.parameters, invocation);
  assert.deepEqual(replayed.oneOf, REFERENCE_ACTION_UNION);
  assert.equal(withActionUnion(tool.parameters, { parameters: tool.parameters }), tool.parameters);
  const { REFERENCE_PROMPT } = await import('./index.js');
  for (const boundary of ['教学门槛', '已知条件', '不读取任何学生草稿', '不是学生作答证据', '不表示客户端已显示或已目视验证', '工具不可用或失败时用文字']) {
    assert.ok(REFERENCE_PROMPT.includes(boundary), boundary);
  }
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

test('registered reference execute and projection replay roundtrip without student APIs', async () => {
  const { tools, projections } = await registeredTool();
  const tool = tools.find(entry => entry.name === 'math_board_reference');
  const projection = projections.find(entry => entry.definition.key === 'eduBoardReference');
  assert.equal(projection.definition.stateVersion, 1);
  const session = { get draft() { throw Error('Must never access student draft'); } };
  const exec = { agent: { session }, callId: 'show-reference' };
  const reference = { title: 'Given', description: 'Known conditions', width: 100, height: 100,
    shapes: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 100 }] };
  const args = { action: 'show', expectedRevision: 0, reference };
  await assert.rejects(tool.execute(args, exec), /exact logged/);
  projection.state = projection.definition.apply(projection.state, { type: 'tool/call', seq: 1,
    data: { name: tool.name, callId: exec.callId, arguments: JSON.stringify(args) } });
  const recorded = await tool.execute(args, exec);
  assert.deepEqual(recorded, { kind: 'edu-board-reference', status: 'recorded', revision: 1, reference });
  projection.state = projection.definition.apply(projection.state, { type: 'tool/result', seq: 2,
    data: { message: { role: 'tool', source: { kind: 'tool', callId: exec.callId }, toolCallId: exec.callId,
      content: tool.output.render(args, recorded) } } });
  const view = projection.definition.wire.view(projection.state);
  projection.definition.stateSchema.parse(projection.state);
  projection.definition.wire.viewSchema.parse(view);
  assert.deepEqual(view, { revision: 1, reference });
  assert.deepEqual(await tool.execute({ action: 'get' }, exec), { ...recorded, status: 'current' });
});

test('shared skill JSON recipe executes through the registered geometry tool and projection', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../math-common/skills/math-common/references/board-contract.md', import.meta.url), 'utf8');
  const examples = [...source.matchAll(/```json\n([\s\S]*?)\n```/g)].map(match => JSON.parse(match[1]));
  const get = examples.find(args => args.action === 'get');
  const show = structuredClone(examples.find(args => args.action === 'show' && args.figure));
  assert.ok(get);
  assert.ok(show);
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
