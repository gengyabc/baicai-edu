import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { install, planInstallation } from './install.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const subjectPackages = {
  learn: 'dsh-edu-learn', 'math-common': 'dsh-edu-math', 'math-board': 'dsh-edu-math-board',
  'math-primary-low': 'dsh-edu-math-primary-low', 'math-primary-high': 'dsh-edu-math-primary-high',
  'chinese-reading': 'dsh-edu-chinese-reading', english: 'dsh-edu-english',
};
const plan = (...args) => planInstallation(args);

// DSH activates new top-level bundles only, not npm's transitive packages.
// Exercise the real manifests (currently registry ranges), in both modes.
test('a low-band install explicitly selects its required bundle closure', () => {
  for (const mode of [[], ['--from', 'registry']]) {
    const result = plan('math-primary-low', ...mode);
    assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
    assert.deepEqual(result.names, ['dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-board', 'dsh-edu-math-primary-low']);
  }
});

test('registry installs explicitly select dependencies before their consumers', () => {
  const result = plan('math-primary-low', '--from', 'registry');
  assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
  assert.deepEqual(result.names, ['dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-board', 'dsh-edu-math-primary-low']);
  assert.deepEqual(result.args, ['plugin', '--profile', 'web', 'add', ...result.names]);
  assert.deepEqual(plan('all', '--from', 'registry').args, ['plugin', '--profile', 'web', 'add',
    'dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-board', 'dsh-edu-math-primary-low',
    'dsh-edu-math-primary-high', 'dsh-edu-chinese-reading', 'dsh-edu-english']);
  // A bare subject installs alone too: the shared bundles are their own opt-in.
  assert.deepEqual(plan('learn', '--from', 'registry').names, ['dsh-edu-learn']);
});

test('local checkouts link required bundles even when manifests declare registry ranges', () => {
  const result = plan('math-primary-low');
  assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
  assert.deepEqual(result.args, ['plugin', '--profile', 'web', 'add',
    ...result.packages.map(key => `link:${resolve(root, key)}`)]);
  assert.deepEqual(plan('math-common', 'math-board').packages, ['learn', 'math-common', 'math-board']);
});

for (const subject of ['chinese-reading', 'english']) {
  test(`${subject} is its own bundle and never the board`, () => {
    assert.deepEqual(plan(subject, '--from', 'registry').names, ['dsh-edu-learn', `dsh-edu-${subject}`]);
    assert.ok(!plan(subject, '--from', 'registry').names.includes('dsh-edu-math-board'));
  });
}

// The resolver picks one math band per session; neither depends on the other.
test('upper-primary math never implies the optional board', () => {
  assert.deepEqual(plan('math-primary-high', '--from', 'registry').names,
    ['dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-primary-high']);
  assert.deepEqual(plan('math-primary-high', 'math-board', 'math-board', '--from', 'registry').names,
    ['dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-primary-high', 'dsh-edu-math-board']);
  assert.deepEqual(plan('math-board', 'math-primary-high', '--from', 'registry').names,
    ['dsh-edu-math-board', 'dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-primary-high']);
  const high = JSON.parse(readFileSync(join(root, 'math-primary-high', 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(high.dependencies).sort(), ['dsh-edu-learn', 'dsh-edu-math']);
  const low = JSON.parse(readFileSync(join(root, 'math-primary-low', 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(low.dependencies).sort(),
    ['dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-board']);
});

test('the shared math contract is never a teaching implementation', () => {
  // It brings in the shared learning protocol, never a teaching band or board.
  assert.deepEqual(plan('math-common', '--from', 'registry').names, ['dsh-edu-learn', 'dsh-edu-math']);
  const all = plan('all', '--from', 'registry').names;
  assert.equal(all.filter(name => name === 'dsh-edu-math').length, 1);
  assert.ok(!plan('math-primary-high', '--from', 'registry').names.includes('dsh-edu-math-board'));
});

for (const independent of ['learn', 'math-board']) {
  test(`${independent} remains independently installable`, () => {
    assert.deepEqual(plan(independent).packages, [independent]);
  });
}

test('all subjects and repeated requests share one copy of each bundle', () => {
  assert.deepEqual(plan('all', 'math-primary-low', 'learn', 'all', '--from', 'registry').names, [
    'dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-board', 'dsh-edu-math-primary-low',
    'dsh-edu-math-primary-high', 'dsh-edu-chinese-reading', 'dsh-edu-english',
  ]);
  assert.deepEqual(plan('english', 'chinese-reading', 'math-primary-high', '--from', 'registry').names,
    ['dsh-edu-learn', 'dsh-edu-english', 'dsh-edu-chinese-reading', 'dsh-edu-math', 'dsh-edu-math-primary-high']);
  // Package names and directory names select the same bundle.
  assert.deepEqual(plan('dsh-edu-learn', 'learn', '--from', 'registry').names, ['dsh-edu-learn']);
});

test('profile and preview are explicit; no machine-specific path is stored', () => {
  const result = plan('--profile', 'edu-test', 'math-primary-low', '--dry-run', '--from', 'registry');
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
    { a: { 'dsh-edu-b': '^0.1.0' }, b: { 'dsh-edu-a': '^0.1.0' } },
    { a: { 'dsh-edu-b': 'workspace:*' }, b: {} },
    { a: { 'dsh-edu-b': 'file:../missing' } },
    { a: { 'dsh-edu-wrong': 'file:../b' }, b: {} },
    { a: { 'dsh-edu-learn': 'file:../learn' } },
    { learn: {} },
  ]) {
    const sandbox = fixture(packages);
    try {
      assert.throws(() => planInstallation(['a'], sandbox.path), /dependency|Unknown package/);
    } finally {
      sandbox.cleanup();
    }
  }
});

test('dependency closure comes from manifests and excludes external npm libraries', () => {
  const sandbox = fixture({ a: { 'dsh-edu-b': '^0.1.0', react: '^19.0.0' }, b: {} });
  try {
    for (const mode of [[], ['--from', 'registry']]) {
      assert.deepEqual(planInstallation(['a', ...mode], sandbox.path).packages, ['b', 'a']);
    }
  } finally { sandbox.cleanup(); }
});

test('dependency declarations are the only graph and patch registrations stay unique', () => {
  const seenIds = new Set();
  assert.equal(plan('all', '--from', 'registry').names.length, 7);
  for (const key of Object.keys(subjectPackages)) {
    const manifest = JSON.parse(readFileSync(join(root, key, 'package.json'), 'utf8'));
    // Published packages must be installable from a registry (npm refuses
    // "private": true) while still keeping their adjacent-directory graph for
    // local link: checkouts, so both modes resolve the same closure.
    // Every dependency names a bundle in this repository, by its published
    // range; a local file: reference, when present, must point at that bundle.
    for (const [name, spec] of Object.entries(manifest.dependencies ?? {})) {
      const directory = Object.entries(subjectPackages).find(([, packageName]) => packageName === name)?.[0];
      assert.ok(directory, `${key}: unknown dsh-edu dependency ${name}`);
      if (spec.startsWith('file:')) {
        assert.equal(resolve(root, key, spec.slice(5)), resolve(root, directory), `${key}: ${name}`);
      } else {
        const range = JSON.parse(readFileSync(resolve(root, directory, 'package.json'), 'utf8'));
        assert.match(spec, /^\^\d+\.\d+\.\d+$/, `${key}: ${name} (${spec})`);
        assert.ok(range.version.startsWith('0.') ? spec.startsWith('^0.') : true);
      }
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
