import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('published package includes runtime sources, excludes tests, and builds independently', async (t) => {
  const temporary = await mkdtemp(join(tmpdir(), 'math-board-package-'));
  // Only remove the dedicated directory returned by mkdtemp, never the checkout.
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const report = JSON.parse(execFileSync('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', temporary,
  ], { cwd: root, encoding: 'utf8', env: { ...process.env, NPM_CONFIG_CACHE: join(temporary, 'cache') } }));
  // npm ≤ 11 prints an array of packs; npm ≥ 12 prints an object keyed by package name.
  const packed = (Array.isArray(report) ? report : Object.values(report ?? {}))
    .find((entry) => entry && Array.isArray(entry.files));
  assert.ok(packed, `npm pack did not report a file list: ${JSON.stringify(report).slice(0, 400)}`);
  // A file entry is an object with `path`; older npm versions printed bare strings.
  const files = new Set(packed.files.map((file) => (typeof file === 'string' ? file : file.path)));
  for (const source of await readdir(join(root, 'src'), { recursive: true })) {
    if (!/\.(js|css)$/.test(source) || source.endsWith('.test.js') || source.startsWith('testing/')) continue;
    assert.ok(files.has(`src/${source}`), `Missing runtime source: ${source}`);
  }
  assert.ok(![...files].some(file => file.endsWith('.test.js') || file.startsWith('tests/') || file.startsWith('src/testing/')));
  const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  for (const target of Object.values(manifest.exports)) {
    if (target.includes('*')) {
      for (const language of ['en', 'zh']) assert.ok(files.has(target.replace('./', '').replace('*', language)));
    } else {
      assert.ok(files.has(target.replace('./', '')), `Missing public export: ${target}`);
    }
  }

  execFileSync('tar', ['-xzf', join(temporary, packed.filename), '-C', temporary]);
  const directory = join(temporary, 'package');
  const entry = await import(pathToFileURL(join(directory, 'index.js')).href);
  assert.equal(entry.name, manifest.name);
  assert.equal(typeof entry.apply, 'function');
  assert.deepEqual(entry.inject, []);
  const shipped = await readFile(join(directory, 'client.js'), 'utf8');
  execFileSync(process.execPath, ['build.mjs'], { cwd: directory });
  assert.equal(await readFile(join(directory, 'client.js'), 'utf8'), shipped, 'Published sources must reproduce the client');
  execFileSync(process.execPath, ['--check', 'client.js'], { cwd: directory });
  const preview = join(temporary, 'preview.html');
  execFileSync(process.execPath, ['preview.mjs', preview], { cwd: directory });
  assert.match(await readFile(preview, 'utf8'), /<svg/);
});
