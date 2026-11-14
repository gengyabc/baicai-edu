// Boot smoke test for the math-board host plugin through the REAL Cordis loader.
//
// Why: the client once declared `inject` as a nested `{ optional: [...] }`
// object. Cordis reads that nesting as "one REQUIRED service named 'optional'",
// so the fiber stayed PENDING, `apply()` never ran, and the board was silently
// dead while `dsh web` only printed one vague warning. Unit tests that call
// `apply(ctx)` directly cannot catch that class of bug, so this test boots the
// package the way dsh does:
//
//   Context + Loader -> loader.create({ name: 'dsh-edu-math-board' })
//
// and asserts the fiber settles ACTIVE and registers its four projections.
//
// It uses the same Cordis instance dsh itself runs (the package is a peer of
// @deepseek-ai/cordis, so require() from this checkout fails). Run it with:
//
//   node --test scripts/board-boot.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DSH_ROOT = process.env.DSH_ROOT ?? '/Users/yugeng/.nvm/versions/node/v24.15.0/lib/node_modules/@deepseek-ai/dsh';
const require = createRequire(join(DSH_ROOT, 'lib/bin.js'));
const load = (specifier) => import(pathToFileURL(require.resolve(specifier)).href);
// The loader resolves a bare package name against its parent's baseUrl, which
// for this checkout has no node_modules of its own; boot the package by URL.
const PACKAGE_URL = new URL('../math-board/index.js', import.meta.url).href;

const STATE = ['pending', 'loading', 'active', 'failed', 'disposed', 'unloading'];

// Service notifications can activate sibling fibers (e.g. systemPrompt ->
// ToolsService -> board tool children). Drain those cascades, not just the
// loader entry's initial task; no wall-clock sleeps are needed here.
async function settleServices(ctx) {
  for (let turn = 0; turn < 5; turn++) {
    await new Promise(resolve => setImmediate(resolve));
    await ctx.loader.await();
  }
}

/** Stand-ins for the host services the board decorates. */
async function provideHost(ctx, provided) {
  const state = { get tools() { return new Set(ctx.tools?.view().visible.keys() ?? []); }, sections: new Set(), projections: new Set(), projectionRegistrations: 0, commands: new Set() };
  if (provided.includes('sessionProjections')) {
    ctx.provide('sessionProjections', { register: async (definition) => {
      state.projections.add(definition.key);
      state.projectionRegistrations++;
      const value = definition.init();
      return { stateOf: () => value };
    } });
  }
  if (provided.includes('commands')) ctx.provide('commands', { register: (definition) => { state.commands.add(definition.name); return () => state.commands.delete(definition.name); } });
  if (provided.includes('systemPrompt')) ctx.provide('systemPrompt', {
    section: (section) => { state.sections.add(section.name); return () => state.sections.delete(section.name); },
    tools: () => () => {},
  });
  if (provided.includes('tools')) {
    const { ToolsService } = await load('@deepseek-ai/dsh-tools');
    state.toolFiber = ctx.plugin(ToolsService);
    await state.toolFiber;
  }
  return state;
}

/**
 * Boot the board entry. `host` selects which host services exist beforehand:
 * 'full' (every service the board decorates), 'projections' (only the
 * projection registry), or 'none'.
 */
async function bootBoard(host = 'projections') {
  const provided = Array.isArray(host) ? host : host === 'full'
    ? ['sessionProjections', 'tools', 'commands', 'systemPrompt']
    : host === 'projections' ? ['sessionProjections'] : [];
  const { Context } = await load('@deepseek-ai/cordis');
  const loaderModule = await load('@deepseek-ai/cordis-plugin-loader');
  const Loader = loaderModule.default ?? loaderModule;
  const ctx = new Context();
  // Stderr-highlighting only; keeps this test out of ~/.dsh/logs.
  ctx.logger.exporter({ levels: { default: 1, debug: 3 }, export: () => {} });
  ctx.baseUrl = new URL('.', PACKAGE_URL).href;
  const state = await provideHost(ctx, provided);
  // A plugin callback in Cordis is `apply(ctx, config)`; the method form is
  // `constructor(ctx, config)`.
  await ctx.plugin(Loader);
  const options = { name: PACKAGE_URL, config: {} };
  await ctx.loader.create(options);
  // A PENDING fiber re-checks its deps only when its in-flight load/unload
  // settles, so awaiting the tree alone is not enough: poll the fiber.
  const fiber = ctx.loader.resolve(options.id)?.fiber;
  // LOADING means activation is running: wait for it too, then judge.
  for (let attempt = 0; attempt < 50 && fiber !== undefined && ['pending', 'loading'].includes(STATE[fiber.state]); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    await ctx.loader.await();
  }
  return { ctx, fiber, state };
}

test('the board activates without any host services, then registers when they arrive', async () => {
  const { ctx, fiber, state } = await bootBoard('none');
  try {
    assert.equal(STATE[fiber.state], 'active');
    assert.equal(state.projections.size, 0);
    const late = await provideHost(ctx, ['sessionProjections', 'commands', 'systemPrompt', 'tools']);
    await settleServices(ctx);
    assert.equal(late.projections.size, 4);
    assert.equal(state.tools.size, 4);
    assert.ok(ctx.tools.get('geometry_board_draw'));
    assert.equal(late.commands.size, 1);
    assert.equal(late.sections.size, 6);
  } finally { await ctx.fiber.dispose(); }
});

for (const missing of ['tools', 'commands', 'systemPrompt']) {
  test(`missing ${missing} does not block projections; late service recovers decorations`, async () => {
    const provided = ['sessionProjections', 'tools', 'commands', 'systemPrompt'].filter(name => name !== missing);
    const { ctx, fiber, state } = await bootBoard(provided);
    try {
      assert.equal(STATE[fiber.state], 'active');
      assert.equal(state.projections.size, 4);
      if (missing === 'tools' || missing === 'systemPrompt') assert.equal(state.tools.size, 0);
      if (missing === 'commands') assert.equal(state.tools.size, 4);
      const late = await provideHost(ctx, [missing]);
      await settleServices(ctx);
      assert.equal(state.tools.size, 4);
      assert.ok(ctx.tools.get('geometry_board_draw'));
      assert.equal(state.projections.size, 4);
      if (missing === 'commands') assert.equal(late.commands.size, 1);
      if (missing === 'systemPrompt') assert.equal(late.sections.size, 6);
    } finally { await ctx.fiber.dispose(); }
  });
}

test('the board plugin settles ACTIVE under the real cordis loader', async () => {
  const { ctx, fiber, state } = await bootBoard('projections');
  try {
    assert.ok(fiber !== undefined, 'the entry has no fiber: its module failed to import');
    assert.equal(STATE[fiber.state], 'active',
      `fiber state is ${STATE[fiber.state]}; inject=${JSON.stringify(fiber.inject)} — ` +
      'a nested { optional: [...] } is read as a REQUIRED service named "optional"');
    // Every declared dependency must resolve; an "optional" entry means the
    // declaration shape regressed.
    assert.ok(!('optional' in fiber.inject), 'inject still carries the nested "optional" key');
    for (const name of Object.keys(fiber.inject)) {
      assert.notEqual(fiber.ctx.get(name), undefined, `declared inject "${name}" has no provider here`);
    }
    // The board provides no service of its own; it registers projection UNITS.
    assert.deepEqual([...(fiber.provisions ?? [])].map((impl) => impl.name), []);
    assert.deepEqual([...state.projections].sort(), ['eduBoardClear', 'eduBoardConfig', 'eduBoardGeometryDemo', 'eduBoardReference']);
  } finally {
    await ctx.fiber.dispose();
  }
});

test('tool registry replacement re-registers once without restarting projections', async () => {
  const { ctx, fiber, state } = await bootBoard('full');
  try {
    assert.equal(state.tools.size, 4);
    await state.toolFiber.dispose();
    await settleServices(ctx);
    assert.equal(STATE[fiber.state], 'active');
    assert.equal(state.tools.size, 0);
    assert.equal(state.projections.size, 4);
    assert.equal(state.sections.size, 6);
    await provideHost(ctx, ['tools']);
    await settleServices(ctx);
    assert.equal(state.tools.size, 4);
    assert.ok(ctx.tools.get('geometry_board_draw'));
    assert.equal(state.projections.size, 4);
    assert.equal(state.projectionRegistrations, 4, 'tool replacement must not remount projections');
    await fiber.dispose();
    await settleServices(ctx);
    assert.equal(state.tools.size, 0, 'disposing the board removes every tool from the surviving registry');
    assert.equal(state.sections.size, 0);
    assert.equal(state.commands.size, 0);
  } finally { await ctx.fiber.dispose(); }
});

test('the board registers its tools and prompt sections when the host has them', async () => {
  const { ctx, fiber, state } = await bootBoard('full');
  try {
    assert.equal(STATE[fiber.state], 'active');
    assert.deepEqual([...state.tools].sort(), ['geometry_board_draw', 'math_board_clear', 'math_board_reference', 'math_board_settings']);
    assert.deepEqual([...state.sections].sort(), [
      'edu-math-board-clear', 'edu-math-board-geometry', 'edu-math-board-geometry-demo',
      'edu-math-board-reference', 'edu-math-board-settings', 'edu-math-board-submission',
    ]);
  } finally {
    await ctx.fiber.dispose();
  }
});
