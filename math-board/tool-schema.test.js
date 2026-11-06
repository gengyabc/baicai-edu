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
  const captured = { tool: null, command: null, prompts: [] };
  const disposer = () => {};
  const ctx = {
    effect: fn => fn(),
    tools: { register(definition) { captured.tool = definition; return disposer; } },
    commands: { register(definition) { captured.command = definition; return disposer; } },
    sessionProjections: { register: async () => ({ stateOf: () => null }) },
    systemPrompt: { section: entry => captured.prompts.push(entry.name) },
  };
  await module.apply(ctx);
  assert.ok(captured.tool, 'apply() must register the settings tool');
  return captured;
}

test('registered tool schemas stay inside the DSH keyword subset', async () => {
  const validatorPath = harnessValidatorPath();
  assert.ok(validatorPath, 'cannot locate @deepseek-ai/dsh-tools; set DSH_TOOLS_MODULE to its lib/index.js');
  const { assertSupportedJsonSchema } = await import(pathToFileURL(validatorPath).href);
  const { tool } = await registeredTool();
  assert.doesNotThrow(() => assertSupportedJsonSchema(tool.output.schema));
  assert.doesNotThrow(() => assertSupportedJsonSchema(tool.parameters));
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
  assert.deepEqual(prompts, ['edu-math-board-submission', 'edu-math-board-settings']);
});
