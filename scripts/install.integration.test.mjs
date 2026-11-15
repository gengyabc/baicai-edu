// Opt-in: exercises the real DSH CLI without touching the user's DSH_HOME.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

test('real DSH installs, composes, deduplicates and preserves explicit disablement', {
  skip: process.env.DSH_INTEGRATION_TEST !== '1',
}, () => {
  // Keep both DSH state and all cleanup inside an owned, gitignored directory.
  mkdirSync(join(root, '.build'), { recursive: true });
  const home = mkdtempSync(join(root, '.build', 'edu integration '));
  const profile = 'edu-deps-test';
  const manifestPath = join(home, 'profiles', profile, 'package.json');
  const readManifest = () => JSON.parse(readFileSync(manifestPath, 'utf8'));
  const env = {
    ...process.env,
    DSH_HOME: home,
    // pnpm 11 uses pnpm_config_*; retain npm_config_* for older releases.
    pnpm_config_store_dir: join(home, 'pnpm-store'),
    pnpm_config_cache_dir: join(home, 'pnpm-cache'),
    npm_config_store_dir: join(home, 'pnpm-store'),
    npm_config_cache: join(home, 'pnpm-cache'),
  };
  const run = (command, args) => {
    const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8' });
    assert.ifError(result.error);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    return result.stdout;
  };
  const install = (...packages) => run(process.execPath,
    ['scripts/install.mjs', ...packages, '--profile', profile]);

  const selected = manifest => manifest.dsh.profile.bundles.filter(name => name.startsWith('dsh-edu-'));
  const high = ['dsh-edu-learn', 'dsh-edu-math', 'dsh-edu-math-primary-high'];
  const math = [...high, 'dsh-edu-math-board', 'dsh-edu-math-primary-low'];
  try {
    install('math-primary-high');
    assert.deepEqual(selected(readManifest()), high);
    assert.deepEqual(Object.keys(readManifest().dependencies).sort(), [...high].sort());
    // Every skill package activates the same provider entry. `--dump-config`
    // lists the layers (bundle rows are not composed), and DSH composes rows
    // sharing an id into one entry.
    const highDump = run('dsh', ['--profile', profile, '--dump-config']);
    assert.ok([...highDump.matchAll(/^- id: edu-skills$/gm)].length >= 1);
    assert.doesNotMatch(highDump, /^- id: edu-math-board$/m);
    // The composed entry must name the roots of the row DSH kept.
    assert.ok(highDump.includes('dsh-edu-math-primary-high/package.json'));

    // An explicit opt-in adds the board; subsequent low installation reuses it.
    install('math-primary-high', 'math-board');
    assert.deepEqual(selected(readManifest()), [...high, 'dsh-edu-math-board']);
    assert.deepEqual(Object.keys(readManifest().dependencies).sort(),
      [...high, 'dsh-edu-math-board'].sort());
    install('math-primary-low');
    assert.deepEqual(selected(readManifest()), math);
    assert.deepEqual(Object.keys(readManifest().dependencies).sort(), [...math].sort());

    install('all', 'math-primary-low');
    install('all');
    const all = [...math, 'dsh-edu-chinese-reading', 'dsh-edu-english'];
    const manifest = readManifest();
    assert.deepEqual(selected(manifest), all);
    assert.deepEqual(Object.keys(manifest.dependencies).sort(), [...all].sort());
    const composed = run('dsh', ['--profile', profile, '--dump-config']);
    // One provider entry, and the board's own row; no per-package provider rows.
    for (const id of ['edu-skills', 'edu-math-board']) {
      assert.ok([...composed.matchAll(new RegExp(`^- id: ${id}$`, 'gm'))].length >= 1, id);
    }
    assert.doesNotMatch(composed, /id: edu-[a-z-]+-skills$/m, 'per-package provider entries are gone');
    // Every skill package teaches from ONE installed module: the profile holds
    // the provider once, and only `learn` ships it.
    assert.ok(existsSync(join(home, 'profiles', profile, 'node_modules', 'dsh-edu-learn', 'skill-provider.mjs')));
    for (const name of ['dsh-edu-math', 'dsh-edu-math-primary-low', 'dsh-edu-math-primary-high', 'dsh-edu-english']) {
      assert.ok(!existsSync(join(home, 'profiles', profile, 'node_modules', name, 'skill-provider.mjs')), name);
    }
    // The shared math contract is registered once, and its rules reach a subject.
    assert.equal(selected(readManifest()).filter(name => name === 'dsh-edu-math').length, 1);
    assert.equal(selected(readManifest()).filter(name => name === 'dsh-edu-math-primary-high').length, 1);

    // Mutate only this test-owned manifest to represent a user's explicit disable.
    manifest.dsh.profile.bundles = manifest.dsh.profile.bundles.filter(name => name !== 'dsh-edu-math-board');
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    install('math-primary-low');
    assert.ok(!selected(readManifest()).includes('dsh-edu-math-board'));
    assert.ok('dsh-edu-math-board' in readManifest().dependencies);

    // Disabling the shared math contract keeps both bands' own providers; it is a
    // rule source, not a teaching implementation, and reinstall does not re-enable it.
    const withoutShared = readManifest();
    withoutShared.dsh.profile.bundles = withoutShared.dsh.profile.bundles
      .filter(name => name !== 'dsh-edu-math');
    writeFileSync(manifestPath, `${JSON.stringify(withoutShared, null, 2)}\n`);
    install('math-primary-low');
    assert.ok(!selected(readManifest()).includes('dsh-edu-math'));
    assert.ok('dsh-edu-math' in readManifest().dependencies);
    const bandOnly = run('dsh', ['--profile', profile, '--dump-config']);
    assert.ok([...bandOnly.matchAll(/^- id: edu-skills$/gm)].length >= 1);
    assert.ok(bandOnly.includes('dsh-edu-math-primary-high/package.json'));
  } finally {
    // home is the exact directory returned by mkdtempSync above, never a user path.
    rmSync(home, { recursive: true });
  }
});
