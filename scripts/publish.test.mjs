import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { PUBLISH_ORDER, approvesLive, npmVersionProblems, readmeLinkProblems, releaseProblems,
  stagedId, uploads } from './publish.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');

// `pack` is a routine, reviewable step, so it must never reach `npm publish`.
// It once did: the only remaining gate is that the command names itself.
test('only the explicit publish command can upload', () => {
  assert.equal(uploads('check', ['check']), false);
  assert.equal(uploads('pack', ['pack']), false, 'packing is not publishing');
  assert.equal(uploads('pack', ['pack', '--dry-run']), false);
  assert.equal(uploads('publish', ['publish']), true);
  assert.equal(uploads('publish', ['publish', '--dry-run']), false);
  // An argument the parser mistakes for a command must not become the publish path.
  assert.equal(uploads(undefined, []), false);
});

// Staging uploads a tarball; only approval makes it live. Neither may happen by
// accident, and the two are deliberately different commands.
test('staging and approval are separate, individually named steps', () => {
  assert.equal(approvesLive('check', ['check']), false);
  assert.equal(approvesLive('pack', ['pack']), false);
  assert.equal(approvesLive('publish', ['publish']), false, 'staging is not approval');
  assert.equal(approvesLive('approve', ['approve']), true);
  assert.equal(approvesLive('approve', ['approve', '--dry-run']), false);
  // A staging run must never take itself live as a side effect.
  assert.equal(uploads('approve', ['approve']), false);
});

// `npm stage` does not exist before 11.15, and the registry refuses a new
// package name through plain `npm publish`, so an old npm has to fail loudly
// instead of uploading and leaving a half-staged closure.
test('staged publishing refuses an npm too old to stage', () => {
  assert.deepEqual(npmVersionProblems('12.2.3'), []);
  assert.deepEqual(npmVersionProblems('11.15.0'), []);
  assert.deepEqual(npmVersionProblems('11.15.1'), []);
  assert.deepEqual(npmVersionProblems('13.0.0'), []);
  assert.match(npmVersionProblems('11.14.1').join('\n'), /needs npm >= 11\.15\.0/);
  assert.match(npmVersionProblems('10.9.4').join('\n'), /needs npm >= 11\.15\.0/);
});

// The stage id is what `approve` needs later, so it has to survive a later npm
// changing everything else about the notice line.
test('a staged release reports the id approval needs', () => {
  const line = '+ baicai-edu-learn@0.1.0 (staged with id f55cfd0c-2d7a-4fce-a4ac-c0be196f8a27)';
  assert.equal(stagedId(line), 'f55cfd0c-2d7a-4fce-a4ac-c0be196f8a27');
  assert.equal(stagedId('npm notice stage package baicai-edu-learn@0.1.0 has been staged'), undefined);
});

// The README is the npm landing page. A relative link works only when the target
// is packed beside it, and a `../` target never can be.
test('a README may only link to files it ships or to absolute URLs', () => {
  const packed = ['README.md', 'docs/skills.md'];
  const label = 'pkg/README.md';
  assert.deepEqual(readmeLinkProblems([
    '[a](docs/skills.md)',
    '[b](<docs/skills.md>)',
    '[c](https://example.com/x.md)',
    '[d](mailto:someone@example.com)',
    '[e](#section)',
    '[f](docs/skills.md#heading)',
  ].join('\n'), packed, label), []);

  assert.deepEqual(readmeLinkProblems('[a](docs/missing.md)', packed, label),
    [`${label} links docs/missing.md, which is not packed (ship it or link absolutely)`]);
  assert.deepEqual(readmeLinkProblems('[a](../docs/installation.md)', packed, label),
    [`${label} links outside the package (../docs/installation.md); use an absolute URL`]);
  assert.deepEqual(readmeLinkProblems('[a](<../math-primary-low/README.md>)', packed, label),
    [`${label} links outside the package (../math-primary-low/README.md); use an absolute URL`]);
});

// Every package README is checked through the packed file list, so this also
// proves `files` really ships the docs the READMEs point at.
test('the seven publishable packages are shippable as packed', () => {
  assert.deepEqual(PUBLISH_ORDER, ['learn', 'math-common', 'math-board',
    'math-primary-low', 'math-primary-high', 'chinese-reading', 'english']);
  assert.deepEqual(releaseProblems(), []);
});

// A cross-package note is only readable from the tarball when the link leaves
// the package: `../` resolves in a checkout and nowhere else.
test('package READMEs keep no link that escapes the package', () => {
  for (const directory of PUBLISH_ORDER) {
    const readme = read(`${directory}/README.md`);
    const escaping = [...readme.matchAll(/\]\(<?(\.\.\/[^)\s>]+)/g)].map(match => match[1]);
    assert.deepEqual(escaping, [], `${directory}/README.md links outside the package`);
  }
});

// Publishing a package nobody can find is a silent loss, and the registry is
// pinned so a mirror configured for reading cannot capture the upload.
test('every package declares its keywords and pins the public registry', () => {
  for (const directory of PUBLISH_ORDER) {
    const manifest = JSON.parse(read(`${directory}/package.json`));
    assert.ok(Array.isArray(manifest.keywords) && manifest.keywords.length >= 5,
      `${manifest.name} has no usable keywords`);
    assert.deepEqual(manifest.publishConfig, {
      registry: 'https://registry.npmjs.org/',
      access: 'public',
    }, `${manifest.name} does not pin its publish target`);
    assert.notEqual(manifest.private, true, `${manifest.name} is private and cannot be published`);
  }
});

// DSH ignores a plugin whose range excludes it, so an absent or unbounded range
// is how a release silently breaks on the next major. 0.2.2-rc.1 is the runtime
// the DSH integration test boots; widening it needs a boot test on that line,
// which is why this pin is asserted rather than derived.
test('every package declares the same bounded DSH requirement', () => {
  const range = '>=0.2.2-rc.1 <0.3.0';
  for (const directory of PUBLISH_ORDER) {
    const manifest = JSON.parse(read(`${directory}/package.json`));
    assert.equal(manifest.engines?.dsh, range, `${manifest.name} has no verified engines.dsh pin`);
    assert.match(range, /^>=0\.\d+\.\d+(?:-[0-9A-Za-z.-]+)? <\d+\.\d+\.\d+$/, 'range needs an upper bound');
  }
});
