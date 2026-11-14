import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

// A standalone board install has no teaching bundle and no model route. The
// plugin must still activate, keep its local projections and commands, and
// contribute no tools or prompt text that would ride model conversations.
const moduleUrl = pathToFileURL(path.resolve(import.meta.dirname, 'index.js')).href;

async function mount(services) {
  const module = await import(moduleUrl);
  const captured = { tools: [], commands: [], prompts: [], projections: [] };
  const ctx = {
    effect: fn => fn(),
    inject: (dependencies, callback) => dependencies.every(name => ctx[name] !== undefined) ? callback(ctx) : undefined,
    ...services.projections === false ? {} : { sessionProjections: { register: async definition => {
      captured.projections.push(definition);
      const state = definition.init();
      return { stateOf: () => state };
    } } },
    ...services.tools === false ? {} : { tools: { register(definition) { captured.tools.push(definition); return () => {}; } } },
    ...services.commands === false ? {} : { commands: { register(definition) { captured.commands.push(definition); return () => {}; } } },
    ...services.systemPrompt === false ? {} : { systemPrompt: { section: section => captured.prompts.push(section.name) } },
  };
  await module.apply(ctx);
  return { module, captured };
}

test('the entry has no required services; capabilities use child injections', async () => {
  const { module } = await mount({ tools: false, commands: false, systemPrompt: false });
  // Cordis treats both array entries and object keys as REQUIRED services.
  // Real loader tests cover waiting child injections and late registration.
  assert.deepEqual(module.inject, []);
});

test('without a projection registry the board activates and registers nothing', async () => {
  const { captured } = await mount({ projections: false, tools: true, commands: true, systemPrompt: true });
  assert.deepEqual(captured.projections, []);
  assert.deepEqual(captured.tools, []);
  assert.deepEqual(captured.commands, []);
  assert.deepEqual(captured.prompts, []);
});

test('without a model route the board still activates with projections and commands only', async () => {
  const { captured } = await mount({ tools: false, commands: true, systemPrompt: false });
  assert.deepEqual(captured.tools, []);
  assert.deepEqual(captured.prompts, []);
  assert.deepEqual(captured.commands.map(command => command.name), ['math-board-settings']);
  assert.deepEqual(captured.projections.map(projection => projection.key).sort(),
    ['eduBoardClear', 'eduBoardConfig', 'eduBoardGeometryDemo', 'eduBoardReference']);
});

test('without a system prompt the tools register but no instruction text is injected', async () => {
  const { captured } = await mount({ tools: true, commands: false, systemPrompt: false });
  assert.deepEqual(captured.tools.map(tool => tool.name).sort(),
    ['geometry_board_draw', 'math_board_clear', 'math_board_reference', 'math_board_settings']);
  assert.deepEqual(captured.prompts, []);
});

test('a full host gets every tool and every instruction section exactly once', async () => {
  const { captured } = await mount({ tools: true, commands: true, systemPrompt: true });
  assert.equal(captured.tools.length, 4);
  assert.equal(captured.commands.length, 1);
  assert.deepEqual(captured.prompts.sort(), [
    'edu-math-board-clear', 'edu-math-board-geometry', 'edu-math-board-geometry-demo',
    'edu-math-board-reference', 'edu-math-board-settings', 'edu-math-board-submission',
  ]);
});
