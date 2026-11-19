// Opt-in: mount real DSH bundle patches and inspect the actual skill registry.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

test('real DSH registers only the selected skill bundles', {
  skip: process.env.DSH_INTEGRATION_TEST !== '1',
}, () => {
  mkdirSync(join(root, '.build'), { recursive: true });
  const home = mkdtempSync(join(root, '.build', 'edu skill registry '));
  const profile = join(home, 'profiles', 'skill-registry-test');
  const probePatch = join(home, 'skill-probe.yml');
  const probe = join(home, 'skill-probe.mjs');
  try {
    mkdirSync(join(profile, 'node_modules'), { recursive: true });
    writeFileSync(probe, `
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
export const inject = ['skills', 'appReady', 'appExit', 'profileContext'];
export function apply(ctx) {
  const snapshot = async () => (await ctx.skills.list()).map(({ name }) => name);
  async function observe() {
    const states = [await snapshot()];
    if (process.env.EDU_TEST_DISABLE) {
      const resolve = createRequire(ctx.profileContext.installAnchor).resolve;
      const { readProfilePatches, reconcileProfilePatches } = await import(
        pathToFileURL(resolve('@deepseek-ai/dsh-app-boot')).href
      );
      const path = join(ctx.profileContext.dir, 'package.json');
      const manifest = JSON.parse(readFileSync(path, 'utf8'));
      const initial = manifest.dsh.profile.bundles;
      for (const bundles of [initial.filter((name) => name !== process.env.EDU_TEST_DISABLE), initial]) {
        manifest.dsh.profile.bundles = bundles;
        writeFileSync(path, JSON.stringify(manifest));
        await reconcileProfilePatches(ctx.root, readProfilePatches('skill-probe', ctx.profileContext), 'skill-probe');
        states.push(await snapshot());
      }
    }
    console.log('EDU_SKILLS ' + JSON.stringify(states));
    ctx.appExit(0);
  }
  ctx.effect(() => ctx.appReady.onReady(() => {
    observe().catch((error) => { console.error(error); ctx.appExit(1); });
  }));
}
`);
    writeFileSync(probePatch, `- insert:
    - id: test-skills
      name: '@deepseek-ai/dsh-skill'
    - id: test-skill-probe
      name: ${JSON.stringify(probe)}
`);
    const dependencies = {};
    function stage(directory) {
      const source = join(root, directory);
      const { name, version } = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8'));
      const installed = join(profile, 'node_modules', name);
      mkdirSync(installed);
      for (const file of ['package.json', 'cordis.patch.yml', 'resources',
        ...(directory === 'learn' ? ['skill-provider.mjs', 'lib'] : [])]) {
        cpSync(join(source, file), join(installed, file), { recursive: true });
      }
      dependencies[name] = version;
      return name;
    }
    function registered(bundles, disable = '') {
      writeFileSync(join(profile, 'package.json'), JSON.stringify({
        name: 'dsh-profile-skill-registry-test', private: true, dependencies,
        dsh: { profile: { bundles } },
      }));
      const result = spawnSync('dsh', ['--profile', 'skill-registry-test', '--patch', probePatch], {
        cwd: profile,
        env: { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1', EDU_TEST_DISABLE: disable },
        encoding: 'utf8', timeout: 15_000,
      });
      assert.ifError(result.error);
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
      const marker = result.stdout.match(/^EDU_SKILLS (.+)$/m);
      assert.ok(marker, `${result.stdout}\n${result.stderr}`);
      return JSON.parse(marker[1]);
    }

    const learn = stage('learn');
    const [learnOnly] = registered([learn]);
    assert.ok(learnOnly.includes('learn') && learnOnly.includes('learn-general-session'));
    const english = stage('english');
    const [both, liveDisabled, reenabled] = registered([learn, english], english);
    assert.ok(both.includes('learn') && both.includes('english-session'), JSON.stringify(both));
    assert.deepEqual(reenabled, both, 're-enabling English must restore its skills');
    const [afterRestart] = registered([learn]);
    for (const catalog of [liveDisabled, afterRestart]) {
      assert.deepEqual(catalog, learnOnly, 'disabled but installed English still registered');
    }
    // A selected subject still mounts even when its installed provider package
    // is not selected; it must not re-register that package's disabled skills.
    const [subjectOnly] = registered([english]);
    assert.ok(subjectOnly.includes('english-session'));
    assert.ok(!subjectOnly.includes('learn'));
  } finally {
    // `home` is the exact directory returned by mkdtempSync above.
    rmSync(home, { recursive: true });
  }
});
