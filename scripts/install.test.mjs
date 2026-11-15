import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { applyOverrides, install, planInstallation } from './install.mjs';

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
  assert.deepEqual(plan('all', '--from', 'registry').names, [
    'dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-board', 'dsh-edu-math-primary-low',
    'dsh-edu-math-primary-high', 'dsh-edu-chinese-reading', 'dsh-edu-english']);
  // A bare subject installs alone too: the shared bundles are their own opt-in.
  assert.deepEqual(plan('learn', '--from', 'registry').names, ['dsh-edu-learn']);
});

test('local installs pack the closure and never link a checkout directory', () => {
  // A linked directory keeps the layout that cannot work: pnpm does not install
  // a linked package's dependencies, so the profile would hold only some of the
  // closure and the one skill provider could not resolve the rest.
  const result = plan('math-primary-low');
  assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
  assert.equal(result.args, undefined);
  assert.deepEqual(plan('math-common', 'math-board').packages, ['learn', 'math-common', 'math-board']);
});

test('packed installs declare pnpm overrides so a tarball pulls its siblings from the tarballs', () => {
  // pnpm rewrites the dependencies of an installed tarball for any name the
  // PROFILE also overrides; without these entries a closure package resolves
  // from the registry, which has not published dsh-edu.
  const home = mkdtempSync(join(tmpdir(), 'dsh-edu-home-'));
  try {
    const profileDir = join(home, 'profiles', 'web');
    mkdirSync(profileDir, { recursive: true });
    const settings = join(profileDir, 'pnpm-workspace.yaml');
    const original = 'packages:\n  - .\n\nnodeLinker: hoisted\n';
    writeFileSync(settings, original);
    applyOverrides(join(home, 'profiles'), 'web', [
      { name: 'dsh-edu-learn', spec: '/tmp/stage/dsh-edu-learn-0.1.0.tgz' },
      { name: 'dsh-edu-math', spec: '/tmp/stage/dsh-edu-math-0.1.0.tgz' },
    ]);
    const written = readFileSync(settings, 'utf8');
    assert.match(written, /^packages:\n  - \.\n/);
    assert.match(written, /overrides:/);
    assert.match(written, /"dsh-edu-learn": "file:\/tmp\/stage\/dsh-edu-learn-0\.1\.0\.tgz"/);
    assert.ok(written.includes('nodeLinker: hoisted'), 'existing settings stay intact');
    // A reinstall replaces the block wholesale instead of appending to it.
    applyOverrides(join(home, 'profiles'), 'web', [
      { name: 'dsh-edu-learn', spec: '/tmp/stage2/dsh-edu-learn-0.1.0.tgz' },
    ]);
    const again = readFileSync(settings, 'utf8');
    assert.equal([...again.matchAll(/^overrides:$/gm)].length, 1);
    assert.ok(!again.includes('/tmp/stage/'), 'a stale tarball path would break the next install');
    assert.ok(again.includes('/tmp/stage2/dsh-edu-learn-0.1.0.tgz'));
    // The block stays: it names the artifacts a reinstall re-runs `pnpm add` with.
    writeFileSync(settings, original);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
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
  // The plan holds bundle keys only; the install builds the DSH arguments.
  assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
  assert.ok(!JSON.stringify(result).includes(root));
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

test('installation uses one shell-free DSH call with the packed tarballs', () => {
  const calls = [];
  const fakeRoot = fixture({ learn: {}, 'math board': {} });
  const home = mkdtempSync(join(tmpdir(), 'dsh-edu-home-'));
  try {
    mkdirSync(join(home, 'profiles', 'web'), { recursive: true });
    writeFileSync(join(home, 'profiles', 'web', 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    // A profile already exists, so the run is packs + one install call.
    writeFileSync(join(home, 'profiles', 'web', 'package.json'), '{"dependencies":{}}\n');
    const status = install(['math board'], {
      root: fakeRoot.path,
      dshHome: home,
      log() {},
      env: undefined,
      run: (command, args) => {
        calls.push([command, args]);
        if (command === 'npm') {
          const stage = args[args.indexOf('--pack-destination') + 1];
          writeFileSync(join(stage, 'dsh-edu-math board-0.1.0.tgz'), '');
          return { status: 0, stdout: 'dsh-edu-math board-0.1.0.tgz\n', stderr: '' };
        }
        return { status: 0 };
      },
    });
    assert.equal(status, 0);
    assert.equal(calls.filter(([command]) => command === 'dsh').length, 1);
    const [, dshArgs] = calls[calls.length - 1];
    assert.deepEqual(dshArgs.slice(0, 4), ['plugin', '--profile', 'web', 'add']);
    // One spec per packed bundle, in dependency order, each a tarball path.
    assert.equal(dshArgs.length, 5);
    assert.ok(dshArgs[4].endsWith('dsh-edu-math board-0.1.0.tgz'), dshArgs[4]);
    assert.ok(!dshArgs.some((arg) => arg.startsWith('link:')));
  } finally {
    rmSync(home, { recursive: true, force: true });
    fakeRoot.cleanup();
  }
});

test('failed command, missing DSH, and signal exits are never reported as success', () => {
  const home = mkdtempSync(join(tmpdir(), 'dsh-edu-home-'));
  try {
    mkdirSync(join(home, 'profiles', 'web'), { recursive: true });
    writeFileSync(join(home, 'profiles', 'web', 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    for (const result of [{ status: 2 }, { status: null, signal: 'SIGTERM' }, { error: new Error('ENOENT') }]) {
      const messages = [];
      assert.notEqual(install(['math-primary-low'], { dshHome: home,
        run: (command, args) => (command === 'npm'
          ? (() => {
            const stage = args[args.indexOf('--pack-destination') + 1];
            writeFileSync(join(stage, 'x-0.1.0.tgz'), '');
            return { status: 0, stdout: 'x-0.1.0.tgz\n', stderr: '' };
          })()
          : result),
        log: value => messages.push(value), error: value => messages.push(value) }), 0,
        `a ${JSON.stringify(result)} is not success`);
      assert.ok(!messages.some(value => value.includes('command completed')));
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
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
      // All skill packages share the edu-skills entry on purpose (DSH composes
      // them into one); every other id must appear once.
      if (id === 'edu-skills') continue;
      assert.ok(!seenIds.has(id), `duplicate patch registration: ${id}`);
      seenIds.add(id);
    }
  }
  assert.deepEqual([...seenIds].sort(), ['edu-math-board'],
    'every skill package activates the shared edu-skills entry; the board adds its own row');
});
