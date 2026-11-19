import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { applyOverrides, clearOverrides, install, packLocal, planInstallation } from './install.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const subjectPackages = {
  learn: 'baicai-edu-learn', 'math-common': 'baicai-edu-math', 'math-board': 'baicai-edu-math-board',
  'math-primary-low': 'baicai-edu-math-primary-low', 'math-primary-high': 'baicai-edu-math-primary-high',
  'chinese-reading': 'baicai-edu-chinese-reading', english: 'baicai-edu-english',
};
const plan = (...args) => planInstallation(args);

// DSH activates new top-level bundles only, not npm's transitive packages.
// Exercise the real manifests (currently registry ranges), in both modes.
test('a low-band install explicitly selects its required bundle closure', () => {
  for (const mode of [[], ['--from', 'registry']]) {
    const result = plan('math-primary-low', ...mode);
    assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
    assert.deepEqual(result.names, ['baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-board', 'baicai-edu-math-primary-low']);
  }
});

test('registry installs explicitly select dependencies before their consumers', () => {
  const result = plan('math-primary-low', '--from', 'registry');
  assert.deepEqual(result.packages, ['learn', 'math-common', 'math-board', 'math-primary-low']);
  assert.deepEqual(result.names, ['baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-board', 'baicai-edu-math-primary-low']);
  assert.deepEqual(plan('all', '--from', 'registry').names, [
    'baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-board', 'baicai-edu-math-primary-low',
    'baicai-edu-math-primary-high', 'baicai-edu-chinese-reading', 'baicai-edu-english']);
  // A bare subject installs alone too: the shared bundles are their own opt-in.
  assert.deepEqual(plan('learn', '--from', 'registry').names, ['baicai-edu-learn']);
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
  // from the registry, which has not published baicai-edu.
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const profileDir = join(home, 'profiles', 'web');
    mkdirSync(profileDir, { recursive: true });
    const settings = join(profileDir, 'pnpm-workspace.yaml');
    const original = 'packages:\n  - .\n\nnodeLinker: hoisted\n';
    writeFileSync(settings, original);
    applyOverrides(join(home, 'profiles'), 'web', [
      { name: 'baicai-edu-learn', spec: '/tmp/stage/baicai-edu-learn-0.1.0.tgz' },
      { name: 'baicai-edu-math', spec: '/tmp/stage/baicai-edu-math-0.1.0.tgz' },
    ]);
    const written = readFileSync(settings, 'utf8');
    assert.match(written, /^packages:\n  - \.\n/);
    assert.match(written, /overrides:/);
    assert.match(written, /"baicai-edu-learn": "file:\/tmp\/stage\/baicai-edu-learn-0\.1\.0\.tgz"/);
    assert.ok(written.includes('nodeLinker: hoisted'), 'existing settings stay intact');
    // A reinstall updates only the named entries instead of appending to them.
    applyOverrides(join(home, 'profiles'), 'web', [
      { name: 'baicai-edu-learn', spec: '/tmp/stage2/baicai-edu-learn-0.1.0.tgz' },
    ]);
    const again = readFileSync(settings, 'utf8');
    assert.equal([...again.matchAll(/^overrides:$/gm)].length, 1);
    assert.ok(!again.includes('/tmp/stage/baicai-edu-learn'), 'the replaced tarball must not persist');
    assert.ok(again.includes('/tmp/stage/baicai-edu-math'), 'an untouched override must persist');
    assert.ok(again.includes('/tmp/stage2/baicai-edu-learn-0.1.0.tgz'));
    // The block stays: it names the artifacts a reinstall re-runs `pnpm add` with.
    writeFileSync(settings, original);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('a registry install drops the tarball overrides a checkout install left behind', () => {
  // `file:` wins over the requested range, so pnpm would answer "Already up to
  // date" and keep the checkout copies — the exact failure that survives a
  // correct fix, because the stale copy is what the profile reports.
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const profileDir = join(home, 'profiles', 'web');
    mkdirSync(profileDir, { recursive: true });
    const settings = join(profileDir, 'pnpm-workspace.yaml');
    writeFileSync(settings, [
      'packages:', '  - .', '', 'nodeLinker: hoisted', '', 'overrides:',
      '  "baicai-edu-learn": "file:/tmp/stage/baicai-edu-learn-0.1.4.tgz"',
      "  'baicai-edu-math': 'file:/tmp/stage/baicai-edu-math-0.1.4.tgz'",
      '  "other>dep": 1.2.3', '', 'minimumReleaseAgeExclude:', '  - dshmarket@1.73.21', ''].join('\n'));
    assert.equal(clearOverrides(join(home, 'profiles'), 'web'), true);
    assert.equal(readFileSync(settings, 'utf8'), [
      'packages:', '  - .', '', 'nodeLinker: hoisted', '', 'overrides:',
      '  "other>dep": 1.2.3', '', 'minimumReleaseAgeExclude:', '  - dshmarket@1.73.21', ''].join('\n'));
    // Nothing left to strip, and a profile without the file, are both no-ops.
    assert.equal(clearOverrides(join(home, 'profiles'), 'web'), false);
    assert.equal(clearOverrides(join(home, 'profiles'), 'absent'), false);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('an unsupported overrides block stops a registry install instead of guessing', () => {
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const path = join(home, 'pnpm-workspace.yaml');
    writeFileSync(path, 'overrides: {baicai-edu-learn: file:a.tgz}\n');
    assert.throws(() => clearOverrides(home, '.'), /Cannot safely edit overrides/);
    assert.equal(readFileSync(path, 'utf8'), 'overrides: {baicai-edu-learn: file:a.tgz}\n');
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

for (const eol of ['\n', '\r\n']) {
  test(`reinstall preserves unrelated pnpm overrides (${JSON.stringify(eol)})`, () => {
    const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
    try {
      const path = join(home, 'pnpm-workspace.yaml');
      writeFileSync(path, ['overrides: # pinned by the user', '  "other>dep": 1.2.3',
        '  baicai-edu-learn: old', '', 'nodeLinker: hoisted', ''].join(eol));
      applyOverrides(home, '.', [{ name: 'baicai-edu-learn', spec: 'learn.tgz' }]);
      assert.equal(readFileSync(path, 'utf8'), ['overrides: # pinned by the user', '  "other>dep": 1.2.3',
        '  "baicai-edu-learn": "file:learn.tgz"', '', 'nodeLinker: hoisted', ''].join(eol));
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  });
}

test('unsupported override forms fail without changing pnpm settings', () => {
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const path = join(home, 'pnpm-workspace.yaml');
    const original = 'overrides: { other: 1.2.3 }\r\n';
    writeFileSync(path, original);
    assert.throws(() => applyOverrides(home, '.', [{ name: 'baicai-edu-learn', spec: 'learn.tgz' }]),
      /Cannot safely edit overrides/);
    assert.equal(readFileSync(path, 'utf8'), original);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('local pack uses the filename from npm JSON output', () => {
  const stage = mkdtempSync(join(tmpdir(), 'baicai-edu-pack-'));
  try {
    const filename = 'baicai-edu-learn-0.1.2.tgz';
    writeFileSync(join(stage, filename), '');
    for (const output of [[{ filename }], { 'baicai-edu-learn': { filename } }]) {
      const result = packLocal({ packages: ['learn'] }, { stage,
        run: () => ({ status: 0, stdout: JSON.stringify(output, null, 2) }),
      });
      assert.equal(result.specs[0].spec, join(stage, filename));
    }
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
});

test('a profile without pnpm settings names the missing file instead of an ENOENT', () => {
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    assert.throws(() => applyOverrides(join(home, 'profiles'), 'web', [
      { name: 'baicai-edu-learn', spec: '/tmp/stage/baicai-edu-learn-0.1.0.tgz' },
    ]), /pnpm-workspace\.yaml is missing/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

for (const subject of ['chinese-reading', 'english']) {
  test(`${subject} is its own bundle and never the board`, () => {
    assert.deepEqual(plan(subject, '--from', 'registry').names, ['baicai-edu-learn', `baicai-edu-${subject}`]);
    assert.ok(!plan(subject, '--from', 'registry').names.includes('baicai-edu-math-board'));
  });
}

// The resolver picks one math band per session; neither depends on the other.
test('upper-primary math never implies the optional board', () => {
  assert.deepEqual(plan('math-primary-high', '--from', 'registry').names,
    ['baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-primary-high']);
  assert.deepEqual(plan('math-primary-high', 'math-board', 'math-board', '--from', 'registry').names,
    ['baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-primary-high', 'baicai-edu-math-board']);
  assert.deepEqual(plan('math-board', 'math-primary-high', '--from', 'registry').names,
    ['baicai-edu-math-board', 'baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-primary-high']);
  const high = JSON.parse(readFileSync(join(root, 'math-primary-high', 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(high.dependencies).sort(), ['baicai-edu-learn', 'baicai-edu-math']);
  const low = JSON.parse(readFileSync(join(root, 'math-primary-low', 'package.json'), 'utf8'));
  assert.deepEqual(Object.keys(low.dependencies).sort(),
    ['baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-board']);
});

test('the shared math contract is never a teaching implementation', () => {
  // It brings in the shared learning protocol, never a teaching band or board.
  assert.deepEqual(plan('math-common', '--from', 'registry').names, ['baicai-edu-learn', 'baicai-edu-math']);
  const all = plan('all', '--from', 'registry').names;
  assert.equal(all.filter(name => name === 'baicai-edu-math').length, 1);
  assert.ok(!plan('math-primary-high', '--from', 'registry').names.includes('baicai-edu-math-board'));
});

for (const independent of ['learn', 'math-board']) {
  test(`${independent} remains independently installable`, () => {
    assert.deepEqual(plan(independent).packages, [independent]);
  });
}

test('all subjects and repeated requests share one copy of each bundle', () => {
  assert.deepEqual(plan('all', 'math-primary-low', 'learn', 'all', '--from', 'registry').names, [
    'baicai-edu-learn', 'baicai-edu-math', 'baicai-edu-math-board', 'baicai-edu-math-primary-low',
    'baicai-edu-math-primary-high', 'baicai-edu-chinese-reading', 'baicai-edu-english',
  ]);
  assert.deepEqual(plan('english', 'chinese-reading', 'math-primary-high', '--from', 'registry').names,
    ['baicai-edu-learn', 'baicai-edu-english', 'baicai-edu-chinese-reading', 'baicai-edu-math', 'baicai-edu-math-primary-high']);
  // Package names and directory names select the same bundle.
  assert.deepEqual(plan('baicai-edu-learn', 'learn', '--from', 'registry').names, ['baicai-edu-learn']);
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
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
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
          writeFileSync(join(stage, 'baicai-edu-math board-0.1.0.tgz'), '');
          return { status: 0, stdout: JSON.stringify({ filename: 'baicai-edu-math board-0.1.0.tgz' }), stderr: '' };
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
    assert.ok(dshArgs[4].endsWith('baicai-edu-math board-0.1.0.tgz'), dshArgs[4]);
    assert.ok(!dshArgs.some((arg) => arg.startsWith('link:')));
  } finally {
    rmSync(home, { recursive: true, force: true });
    fakeRoot.cleanup();
  }
});

// A profile this CLI cannot create (the desktop app owns its own) used to pass
// silently and surface later as ENOENT on a profile path the user never typed.
test('a profile that could not be created is reported with its reason', () => {
  const fakeRoot = fixture({ learn: {} });
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const messages = [];
    const status = install(['learn', '--profile', 'desktop'], {
      root: fakeRoot.path,
      dshHome: home,
      log() {},
      error: (value) => messages.push(value),
      run: () => ({ status: 1, stdout: '', stderr: 'error: profile "desktop" is managed exclusively by the Electron application' }),
    });
    assert.equal(status, 1);
    assert.match(messages.join('\n'), /could not create profile desktop/);
    assert.match(messages.join('\n'), /managed exclusively by the Electron application/);
  } finally {
    rmSync(home, { recursive: true, force: true });
    fakeRoot.cleanup();
  }
});

test('install reuses existing education tarballs relative to the profile', () => {
  const fakeRoot = fixture({ learn: {}, english: {} });
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const profile = join(home, 'profiles', 'web');
    mkdirSync(profile, { recursive: true });
    const previous = join(profile, 'baicai-edu-english-0.1.2.tgz');
    writeFileSync(previous, '');
    writeFileSync(join(profile, 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    writeFileSync(join(profile, 'package.json'), JSON.stringify({
      dependencies: { 'baicai-edu-english': 'file:./baicai-edu-english-0.1.2.tgz' },
    }));
    const status = install(['learn'], {
      root: fakeRoot.path, dshHome: home, log() {},
      run: (command, args) => {
        if (command === 'dsh') {
          assert.ok(args.includes(previous));
          return { status: 0 };
        }
        assert.equal(args[1], './learn', 'the existing English tarball should not be repacked');
        const filename = 'baicai-edu-learn-0.1.2.tgz';
        writeFileSync(join(args[args.indexOf('--pack-destination') + 1], filename), '');
        return { status: 0, stdout: JSON.stringify([{ filename }]) };
      },
    });
    assert.equal(status, 0);
  } finally {
    rmSync(home, { recursive: true, force: true });
    fakeRoot.cleanup();
  }
});

test('install leaves unrelated profile-relative file dependencies to pnpm', () => {
  const fakeRoot = fixture({ learn: {} });
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const profile = join(home, 'profiles', 'web');
    mkdirSync(join(profile, 'local-addon'), { recursive: true });
    writeFileSync(join(profile, 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    writeFileSync(join(profile, 'package.json'), JSON.stringify({ dependencies: { addon: 'file:./local-addon' } }));
    const calls = [];
    const errors = [];
    const status = install(['learn'], {
      root: fakeRoot.path, dshHome: home, log() {}, error: message => errors.push(message),
      run: (command, args) => {
        if (command === 'npm') {
          const filename = 'baicai-edu-learn-0.1.2.tgz';
          writeFileSync(join(args[args.indexOf('--pack-destination') + 1], filename), '');
          return { status: 0, stdout: JSON.stringify([{ filename }]) };
        }
        calls.push(args);
        return { status: 0 };
      },
    });
    assert.equal(status, 0, errors.join('\n'));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].length, 5);
    assert.doesNotMatch(readFileSync(join(profile, 'pnpm-workspace.yaml'), 'utf8'), /addon/);
  } finally {
    rmSync(home, { recursive: true, force: true });
    fakeRoot.cleanup();
  }
});

// The staging directory lives on the OS temp path, so it can be cleaned between
// installs. Reinstalling is exactly the remedy a stale-path error would name, so
// it has to work: the stale artifact is packed again when this checkout ships it.
test('a cleaned staging directory is repacked instead of failing the reinstall', () => {
  const calls = [];
  const fakeRoot = fixture({ learn: {}, english: {} });
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const profileDir = join(home, 'profiles', 'web');
    mkdirSync(profileDir, { recursive: true });
    writeFileSync(join(profileDir, 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    writeFileSync(join(profileDir, 'package.json'), JSON.stringify({
      dependencies: { 'baicai-edu-english': 'file:/var/folders/gone/baicai-edu-english-0.1.2.tgz' },
    }));
    const status = install(['learn'], {
      root: fakeRoot.path,
      dshHome: home,
      log() {},
      error() {},
      run: (command, args) => {
        calls.push([command, args]);
        if (command !== 'npm') return { status: 0 };
        const directory = args[1].replace('./', '');
        const name = `baicai-edu-${directory}`;
        const stage = args[args.indexOf('--pack-destination') + 1];
        writeFileSync(join(stage, `${name}-0.1.2.tgz`), '');
        return { status: 0, stdout: JSON.stringify([{ filename: `${name}-0.1.2.tgz` }]), stderr: '' };
      },
    });
    assert.equal(status, 0);
    assert.deepEqual(calls.filter(([command]) => command === 'npm').map(([, args]) => args[1]),
      ['./learn', './english'], 'the bundle with the cleaned tarball is packed again');
    const [, dshArgs] = calls[calls.length - 1];
    for (const name of ['learn', 'english']) {
      assert.ok(dshArgs.some((arg) => arg.endsWith(`baicai-edu-${name}-0.1.2.tgz`)), dshArgs.join(' '));
    }
  } finally {
    rmSync(home, { recursive: true, force: true });
    fakeRoot.cleanup();
  }
});

test('an artifact this checkout cannot repack names the profile edit that unblocks it', () => {
  const fakeRoot = fixture({ learn: {} });
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    const profileDir = join(home, 'profiles', 'web');
    mkdirSync(profileDir, { recursive: true });
    writeFileSync(join(profileDir, 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    writeFileSync(join(profileDir, 'package.json'), JSON.stringify({
      dependencies: { 'baicai-edu-elsewhere': 'file:/var/folders/gone/baicai-edu-elsewhere-0.1.0.tgz' },
    }));
    const messages = [];
    const status = install(['learn'], {
      root: fakeRoot.path,
      dshHome: home,
      log() {},
      error: (value) => messages.push(value),
      run: () => assert.fail('must not execute'),
    });
    assert.equal(status, 1);
    assert.match(messages.join('\n'), /baicai-edu-elsewhere/);
    assert.match(messages.join('\n'), /dsh plugin --profile web remove baicai-edu-elsewhere/);
  } finally {
    rmSync(home, { recursive: true, force: true });
    fakeRoot.cleanup();
  }
});

test('failed command, missing DSH, and signal exits are never reported as success', () => {
  const home = mkdtempSync(join(tmpdir(), 'baicai-edu-home-'));
  try {
    mkdirSync(join(home, 'profiles', 'web'), { recursive: true });
    writeFileSync(join(home, 'profiles', 'web', 'pnpm-workspace.yaml'), 'packages:\n  - .\n');
    writeFileSync(join(home, 'profiles', 'web', 'package.json'), '{}\n');
    for (const result of [{ status: 2 }, { status: null, signal: 'SIGTERM' }, { error: new Error('ENOENT') }]) {
      const messages = [];
      assert.notEqual(install(['math-primary-low'], { dshHome: home,
        run: (command, args) => (command === 'npm'
          ? (() => {
            const stage = args[args.indexOf('--pack-destination') + 1];
            writeFileSync(join(stage, 'x-0.1.0.tgz'), '');
            return { status: 0, stdout: JSON.stringify([{ filename: 'x-0.1.0.tgz' }]), stderr: '' };
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
  const path = mkdtempSync(join(tmpdir(), 'baicai-edu-install-'));
  for (const [key, dependencies] of Object.entries(packages)) {
    mkdirSync(join(path, key));
    writeFileSync(join(path, key, 'package.json'), JSON.stringify({
      name: `baicai-edu-${key}`, dependencies, dsh: { bundle: { patch: './cordis.patch.yml' } },
    }));
  }
  return { path, cleanup: () => rmSync(path, { recursive: true }) };
}

test('cycles, missing packages, mismatched names, and unsupported specs fail closed', () => {
  for (const packages of [
    { a: { 'baicai-edu-b': 'file:../b' }, b: { 'baicai-edu-a': 'file:../a' } },
    { a: { 'baicai-edu-b': '^0.1.0' }, b: { 'baicai-edu-a': '^0.1.0' } },
    { a: { 'baicai-edu-b': 'workspace:*' }, b: {} },
    { a: { 'baicai-edu-b': 'file:../missing' } },
    { a: { 'baicai-edu-wrong': 'file:../b' }, b: {} },
    { a: { 'baicai-edu-learn': 'file:../learn' } },
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
  const sandbox = fixture({ a: { 'baicai-edu-b': '^0.1.0', react: '^19.0.0' }, b: {} });
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
      assert.ok(directory, `${key}: unknown baicai-edu dependency ${name}`);
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
    'edu-math-board', 'edu-skills', 'edu-skills-chinese-reading', 'edu-skills-english',
    'edu-skills-math', 'edu-skills-math-primary-high', 'edu-skills-math-primary-low',
  ], 'each bundle owns a distinct activation row');
});
