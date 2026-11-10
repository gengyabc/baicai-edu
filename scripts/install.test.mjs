import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { install, planInstallation } from './install.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const plan = (...args) => planInstallation(args);

test('math installs shared learning, shared math rules, and the board before its own bundle', () => {
  const result = plan('math-primary-low');
  assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
  assert.deepEqual(result.args, ['plugin', '--profile', 'web', 'add',
    ...['learn', 'math-common', 'math-board', 'math-primary-low'].map(key => `link:${resolve(root, key)}`)]);
});

for (const subject of ['chinese-reading', 'english']) {
  test(`${subject} installs shared learning but not the board`, () => {
    assert.deepEqual(plan(subject).packages, ['learn', subject]);
  });
}

// The resolver picks one math band per session; neither depends on the other.
test('upper-primary math requires only shared rules, with an optional board', () => {
  assert.deepEqual(plan('math-primary-high').packages, ['learn', 'math-common', 'math-primary-high']);
  assert.deepEqual(plan('math-primary-high', 'math-board', 'math-board').packages,
    ['learn', 'math-common', 'math-primary-high', 'math-board']);
  assert.deepEqual(plan('math-board', 'math-primary-high').packages,
    ['math-board', 'learn', 'math-common', 'math-primary-high']);
  // Low still brings its required board, without duplicating either shared bundle.
  assert.deepEqual(plan('math-primary-high', 'math-primary-low').packages,
    ['learn', 'math-common', 'math-primary-high', 'math-board', 'math-primary-low']);
});

test('the shared math contract is never a teaching implementation', () => {
  // It is a rule source with its own bundle, so it is installable and appears
  // exactly once; installing it alone never pulls in a band.
  assert.deepEqual(plan('math-common').packages, ['learn', 'math-common']);
  const all = plan('all').packages;
  assert.equal(all.filter(key => key === 'math-common').length, 1);
  // The upper-primary band never drags in the optional board.
  assert.ok(!plan('math-primary-high').packages.includes('math-board'));
});

for (const independent of ['learn', 'math-board']) {
  test(`${independent} remains independently installable`, () => {
    assert.deepEqual(plan(independent).packages, [independent]);
  });
}

test('all subjects and repeated requests share one copy of each bundle', () => {
  assert.deepEqual(plan('all', 'math-primary-low', 'learn', 'all').packages,
    ['learn', 'math-common', 'math-board', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english']);
  assert.deepEqual(plan('english', 'chinese-reading', 'math-primary-high').packages,
    ['learn', 'english', 'chinese-reading', 'math-common', 'math-primary-high']);
});

test('profile and preview are explicit; no machine-specific path is stored', () => {
  const result = plan('--profile', 'edu-test', 'math-primary-low', '--dry-run');
  assert.equal(result.profile, 'edu-test');
  assert.equal(result.dryRun, true);
  assert.deepEqual(result.args.slice(0, 4), ['plugin', '--profile', 'edu-test', 'add']);
});

test('invalid inputs fail before any package manager is invoked', () => {
  for (const args of [[], ['missing'], ['--wat'], ['math-primary-low', '--profile'],
    ['math-primary-low', '--profile', '../web'], ['math-primary-low', '--profile', '--dry-run'],
    ['math-primary-low', '--profile', '..']]) {
    assert.throws(() => planInstallation(args));
    assert.equal(install(args, { run: () => assert.fail('must not execute'), error() {}, log() {} }), 1);
  }
});

test('preview and help never invoke DSH', () => {
  for (const args of [['math-primary-low', '--dry-run'], ['--help']]) {
    assert.equal(install(args, { run: () => assert.fail('must not execute'), log() {} }), 0);
  }
});

test('installation uses one shell-free DSH call, preserving paths with spaces', () => {
  const calls = [];
  const fakeRoot = fixture({ learn: {}, 'math board': {} });
  try {
    assert.equal(install(['math board'], { root: fakeRoot.path, log() {},
      run: (...args) => { calls.push(args); return { status: 0 }; } }), 0);
    assert.deepEqual(calls, [['dsh', ['plugin', '--profile', 'web', 'add',
      `link:${join(fakeRoot.path, 'math board')}`], { stdio: 'inherit', shell: false }]]);
  } finally {
    fakeRoot.cleanup();
  }
});

test('failed command, missing DSH, and signal exits are never reported as success', () => {
  for (const result of [{ status: 2 }, { status: null, signal: 'SIGTERM' }, { error: new Error('ENOENT') }]) {
    const messages = [];
    assert.notEqual(install(['math-primary-low'], { run: () => result,
      log: value => messages.push(value), error: value => messages.push(value) }), 0);
    assert.ok(!messages.some(value => value.includes('command completed')));
  }
});

function fixture(packages) {
  const path = mkdtempSync(join(tmpdir(), 'dsh-edu-install-'));
  for (const [key, dependencies] of Object.entries(packages)) {
    mkdirSync(join(path, key));
    writeFileSync(join(path, key, 'package.json'), JSON.stringify({
      name: `dsh-edu-${key}`, dependencies, dsh: { bundle: { patch: './cordis.patch.yml' } },
    }));
  }
  return { path, cleanup: () => rmSync(path, { recursive: true }) };
}

test('cycles, missing packages, mismatched names, and unsupported specs fail closed', () => {
  for (const packages of [
    { a: { 'dsh-edu-b': 'file:../b' }, b: { 'dsh-edu-a': 'file:../a' } },
    { a: { 'dsh-edu-b': 'file:../missing' } },
    { a: { 'dsh-edu-wrong': 'file:../b' }, b: {} },
    { a: { 'dsh-edu-b': '^1.0.0' } },
  ]) {
    const sandbox = fixture(packages);
    try {
      assert.throws(() => planInstallation(['a'], sandbox.path), /dependency/);
    } finally {
      sandbox.cleanup();
    }
  }
});

test('dependency declarations are the only graph and patch registrations stay unique', () => {
  const seenIds = new Set();
  for (const key of plan('all').packages) {
    const manifest = JSON.parse(readFileSync(join(root, key, 'package.json'), 'utf8'));
    assert.equal(manifest.private, true, 'file: dependencies are a private-checkout contract');
    for (const [name, spec] of Object.entries(manifest.dependencies ?? {})) {
      assert.ok(spec.startsWith('file:'));
      const dependency = JSON.parse(readFileSync(resolve(root, key, spec.slice(5), 'package.json'), 'utf8'));
      assert.equal(dependency.name, name);
    }
    const patch = readFileSync(join(root, key, manifest.dsh.bundle.patch), 'utf8');
    for (const [, id] of patch.matchAll(/- id: ([\w-]+)/g)) {
      assert.ok(!seenIds.has(id), `duplicate patch registration: ${id}`);
      seenIds.add(id);
    }
  }
  assert.deepEqual([...seenIds].sort(), [
    'edu-learn-skills', 'edu-math-board', 'edu-math-common-skills',
    'edu-math-primary-low-skills', 'edu-math-primary-high-skills',
    'edu-chinese-reading-skills', 'edu-english-skills',
  ].sort());
});
