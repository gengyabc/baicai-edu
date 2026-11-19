#!/usr/bin/env node
// Publish the education packages from the repo root, without a root package.json.
//
// npm has no way to reach from an empty root directory to a sibling package, so
// the root deliberately has no `package.json` (one would also turn the whole
// repository into a publishable package). Instead this script drives each
// package separately: it `npm pack`s each package into a staging directory, runs
// `npm stage publish` on that tarball, and leaves `approve` as the separate,
// 2FA-bearing step that actually makes the versions live.
//
// There is one skill provider, shipped by `learn`, and every skill package's
// cordis.patch.yml activates it; nothing is copied between packages any more.
// What each skill package does ship is a generated `resources/` tree, so `check`
// also proves it is current (it is generated here and compared, never written).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { buildResources } from './build-resources.mjs';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * npm works from a private cache. The default `~/.npm` can be unusable — a
 * sandbox that blocks it, or root-owned entries from an older npm — which has
 * nothing to do with the package being packed. Point npm at a temp cache
 * instead; `NPM_CONFIG_CACHE` wins when the caller set one on purpose.
 */
const npmCache = process.env.NPM_CONFIG_CACHE ?? mkdtempSync(join(tmpdir(), 'baicai-edu-npm-cache-'));
process.env.NPM_CONFIG_CACHE = npmCache;

/** Publish order: shared packages before the subjects that depend on them. */
export const PUBLISH_ORDER = ['learn', 'math-common', 'math-board',
  'math-primary-low', 'math-primary-high', 'chinese-reading', 'english'];

/**
 * Accept either a directory or the npm name it publishes under. A partial
 * release is normal — some packages are already live at their current version —
 * but a name nobody ships must fail loudly instead of quietly shrinking the set.
 */
const directoryFor = word => {
  const directories = PUBLISH_ORDER.filter(directory => directory === word
    || manifest(directory).name === word);
  if (directories.length === 1) return directories[0];
  throw new Error(`unknown package: ${word} (expected one of ${PUBLISH_ORDER.join(', ')} `
    + `or their npm names)`);
};

/**
 * The packages this run touches, still in publish order so a selected set keeps
 * its dependencies ahead of the subject that depends on them. Names are matched
 * first, order second, so "english learn" ships `learn` first rather than in the
 * order it was typed. Duplicates collapse; an empty selection means everything.
 */
export function selectPackages(words = []) {
  const selected = new Set(words.map(directoryFor));
  return selected.size === 0 ? [...PUBLISH_ORDER] : PUBLISH_ORDER.filter(directory => selected.has(directory));
}

/** Packages that register skills and therefore ship rendered `resources/`. */
export const SKILL_PACKAGES = ['learn', 'math-common', 'math-primary-low',
  'math-primary-high', 'chinese-reading', 'english'];

/**
 * npm treats a bare word as a registry package spec, not a directory: `npm pack
 * math-common` tries to download `math-common@*` from the registry. Always pass
 * a path form, and one relative to the repo root, which is the cwd we use.
 */
const spec = directory => `./${directory}`;

/**
 * `npm pack --json` changed shape in npm 12: it answered with an array of one
 * entry and now answers with an object keyed by package name. Parse both so the
 * release path does not depend on which npm the maintainer upgraded to.
 */
export const packedEntry = json => Array.isArray(json) ? json[0] : Object.values(json)[0];

const pack = directory => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', spec(directory)],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return packedEntry(JSON.parse(out));
};

const manifest = directory => JSON.parse(readFileSync(join(root, directory, 'package.json'), 'utf8'));

/** Packages whose committed `resources/` differs from a fresh build of their skills. */
export function resourceDrift() {
  return SKILL_PACKAGES.filter(directory => {
    try {
      const name = manifest(directory).name;
      const { files } = buildResources(name, { root, write: false });
      const committed = readdirSync(join(root, directory, 'resources'), { recursive: true })
        .map(String).filter((path) => path.endsWith('.md') || path.endsWith('.json'));
      if (committed.length !== files.size) return true;
      return [...files].some(([path, text]) => {
        try {
          return readFileSync(join(root, directory, path), 'utf8') !== text;
        } catch {
          return true;
        }
      });
    } catch {
      return true;
    }
  });
}

/**
 * Links in a package README that cannot work once published. The README becomes
 * the npm landing page, where only the tarball's own files exist: a target has to
 * be packed with the package, and a `../` target never can be, because there is
 * no parent directory there. Cross-package and root-doc links are absolute URLs
 * instead. `packed` holds package-relative paths.
 */
export function readmeLinkProblems(readme, packed, label = 'README.md') {
  const problems = [];
  const targets = [...readme.matchAll(/\]\(<([^>]*)>|\]\(([^)\s]+)/g)].map(match => match[1] ?? match[2]);
  for (const target of new Set(targets)) {
    if (/^(?:https?:|mailto:|#)/.test(target)) continue;
    const path = target.split('#')[0].split('?')[0];
    if (path === '') continue;
    if (path.startsWith('../')) {
      problems.push(`${label} links outside the package (${target}); use an absolute URL`);
    } else if (!packed.includes(path)) {
      problems.push(`${label} links ${target}, which is not packed (ship it or link absolutely)`);
    }
  }
  return problems;
}

/**
 * Checks that would make a release wrong: a package is not shippable as packed,
 * or the provider copies no longer match their single source. `directories` is
 * what this run will ship; a partial release leaves the rest alone, so their
 * problems are not this run's to report.
 */
export function releaseProblems(directories = PUBLISH_ORDER) {
  const problems = [];
  for (const directory of directories) {
    const { name, version } = manifest(directory);
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(version)) {
      problems.push(`${name}: version ${version} is not publishable`);
    }
    const packed = pack(directory).files.map(file => file.path);
    if (!packed.includes('cordis.patch.yml')) problems.push(`${name}: packed without cordis.patch.yml`);
    // npm fills these in from the package root, but a missing copy ships a
    // tarball whose licence and landing page are empty.
    if (!packed.includes('README.md')) problems.push(`${name}: packed without README.md`);
    if (!packed.includes('LICENSE')) problems.push(`${name}: packed without LICENSE`);
    problems.push(...readmeLinkProblems(readFileSync(join(root, directory, 'README.md'), 'utf8'),
      packed, `${directory}/README.md`));
    // The board ships a client, not skills; every other package ships skills.
    if (existsSync(join(root, directory, 'skills'))) {
      if (!packed.some(path => path.startsWith('skills/'))) problems.push(`${name}: packed without skills/`);
    } else if (packed.some(path => path.startsWith('skills/'))) {
      problems.push(`${name}: packed skills/ that are not in the source tree`);
    }
    if (SKILL_PACKAGES.includes(directory)) {
      if (!packed.some(path => path.startsWith('resources/'))) problems.push(`${name}: packed without resources/`);
      if (!packed.includes('build.json')) problems.push(`${name}: packed without build.json`);
    }
    if (directory === 'learn' && !packed.includes('skill-provider.mjs')) {
      problems.push(`${name}: packed without skill-provider.mjs`);
    }
    if (directory !== 'learn' && packed.includes('skill-provider.mjs')) {
      problems.push(`${name}: packed a second provider module`);
    }
  }
  for (const directory of resourceDrift().filter(directory => directories.includes(directory))) {
    problems.push(`${manifest(directory).name}: resources/ is stale (run node scripts/build-resources.mjs)`);
  }
  return problems;
}

/**
 * Pack each package once and report the tarball, so a dry run proves the same
 * artifact `--publish` would upload rather than only the file list.
 */
export function packAll({ stage = mkdtempSync(join(tmpdir(), 'baicai-edu-pack-')),
  directories = PUBLISH_ORDER } = {}) {
  const packed = [];
  for (const directory of directories) {
    const out = execFileSync('npm', ['pack', spec(directory), '--pack-destination', stage],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    const tarball = out.split('\n').filter(Boolean).pop();
    packed.push({ directory, name: manifest(directory).name, version: manifest(directory).version, tarball: join(stage, tarball) });
  }
  return { stage, packed };
}

function report(problems, packed) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  for (const { name, version, tarball } of packed) console.log(`${name}@${version}  ${tarball}`);
}

/**
 * `npm stage` arrived in npm 11.15. Publishing a new package name through plain
 * `npm publish` now fails with E_STAGE_REQUIRED, and npm is withdrawing 2FA-
 * bypassing tokens from direct publishing, so staging is the only path left.
 */
export const NPM_STAGE_MIN = '11.15.0';

const versionParts = version => version.split('-')[0].split('.').map(Number);

const npmVersion = () => execFileSync('npm', ['--version'],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/** Problems that stop a staged release before it uploads anything. */
export function npmVersionProblems(version) {
  const [major, minor, patch] = versionParts(version);
  const [needMajor, needMinor, needPatch] = versionParts(NPM_STAGE_MIN);
  const older = major < needMajor
    || (major === needMajor && minor < needMinor)
    || (major === needMajor && minor === needMinor && patch < needPatch);
  return older
    ? [`npm ${version} cannot stage a release: staged publishing needs npm >= ${NPM_STAGE_MIN}`]
    : [];
}

/** The stage id npm prints once a tarball is staged. */
export function stagedId(output) {
  const match = /staged with id ([0-9a-f-]{36})/i.exec(output);
  return match === null ? undefined : match[1];
}

const USAGE = `Usage: node scripts/publish.mjs <command> [<package> ...]

  check     dry-run the packages and report release problems (default)
  pack      check, then pack the tarballs into a staging directory (never uploads)
  publish   check, then stage the tarballs in dependency order (never goes live)
  approve   approve staged versions by stage id, publishing them with 2FA

  <package>   limit check/pack/publish to these packages, given as directory
              names (math-common) or npm names (baicai-edu-math); the rest of
              the set keeps publish order and is left untouched. Omitting the
              list covers all ${PUBLISH_ORDER.length}. approve takes stage ids instead.

Flags:
  --dry-run   for publish, stop before staging; for approve, list what it would do
  --help      print this text

A release is two steps: "publish" stages, "approve" takes it live. Approval is
the only step that needs a one-time password, and each package needs its own
or a fresh "npm stage approve" run. An unknown argument is an error, never a
guess: a typo must not reach the publish path. A package that is already live at
its current version is not something to retry — give the changed ones by name.`;

const COMMANDS = ['check', 'pack', 'publish', 'approve'];

/**
 * Whether this invocation may upload to the staging area. Packing a candidate
 * release is a routine step, so only the explicitly named command can stage;
 * anything else stays a dry run. A regression test pins this: `pack` once
 * reached `npm publish`.
 */
export const uploads = (command, argv) => command === 'publish' && !argv.includes('--dry-run');

/**
 * Whether this invocation may make staged versions live. Approval is the step
 * that actually publishes, so it is spelled out separately.
 */
export const approvesLive = (command, argv) => command === 'approve' && !argv.includes('--dry-run');

/**
 * Approve staged versions, which is what makes them live. Every id needs its own
 * `npm stage approve`, so stop at the first failure and say how far it got: the
 * approved ones are already public and the rest are not.
 */
function approveStaged(ids, otp, dryRun) {
  if (dryRun) {
    console.log(`(dry run; would approve ${ids.length} staged versions: ${ids.join(', ')})`);
    return 0;
  }
  const approved = [];
  for (const id of ids) {
    try {
      execFileSync('npm', ['stage', 'approve', id, ...otp], { cwd: root, stdio: 'inherit' });
    } catch (error) {
      console.error(`✗ approval stopped after ${approved.length}/${ids.length}: `
        + `${approved.join(', ') || 'nothing approved'}`);
      throw error;
    }
    approved.push(id);
  }
  console.log(`✓ approved ${approved.length} staged versions, now live`);
  return 0;
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(USAGE);
    return 0;
  }
  const words = argv.filter(argument => !argument.startsWith('-') && argument !== '');
  const [command = 'check', ...rest] = words;
  if (!COMMANDS.includes(command)) {
    console.error(`✗ unknown command: ${command}\n\n${USAGE}`);
    return 2;
  }
  // `approve` takes stage ids; every other command may name the packages it
  // touches, and naming none means the whole set.
  let directories = PUBLISH_ORDER;
  if (command !== 'approve') {
    try {
      directories = selectPackages(rest);
    } catch (error) {
      console.error(`✗ ${error.message}`);
      return 2;
    }
  }
  const dryRun = argv.includes('--dry-run');
  const otp = process.env.NPM_OTP === undefined ? [] : ['--otp', process.env.NPM_OTP];

  if (command === 'approve' && rest.length === 0) {
    console.error('✗ approve needs at least one stage id (list them with: npm stage list)');
    return 2;
  }

  // Only the two uploading steps need `npm stage`: `check` and `pack` stay
  // usable on an older npm, which is what a review on this machine does.
  if (uploads(command, argv) || approvesLive(command, argv)) {
    const versionProblems = npmVersionProblems(npmVersion());
    if (versionProblems.length > 0) {
      report(versionProblems, []);
      return 1;
    }
  }
  // Approval uploads a tarball the registry already holds, so packing the
  // working tree would only add a slow, irrelevant gate.
  if (command === 'approve') return approveStaged(rest, otp, dryRun);

  const problems = releaseProblems(directories);
  if (problems.length > 0) {
    report(problems, []);
    return 1;
  }
  if (command === 'check') {
    console.log(`✓ ${directories.length} package${directories.length === 1 ? '' : 's'} shippable `
      + `(${directories.join(', ')}) and every packed resources/ tree matches`);
    return 0;
  }

  const { stage, packed } = packAll({ directories });
  if (uploads(command, argv)) {
    const staged = [];
    try {
      for (const { tarball, name, version } of packed) {
        console.log(`staging ${tarball}`);
        const output = execFileSync('npm', ['stage', 'publish', tarball],
          { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
        const id = stagedId(output);
        staged.push({ name, version, id });
        console.log(`  ${name}@${version} ${id === undefined ? '(stage id not parsed; use npm stage list)' : `stage id ${id}`}`);
      }
    } catch (error) {
      // A half-staged closure is not live anywhere, but the next run has to know
      // what already sits in the staging area before it retries.
      rmSync(stage, { recursive: true, force: true });
      console.error(`✗ staging stopped after ${staged.length}/${packed.length}: `
        + `${staged.map(({ name, version }) => `${name}@${version}`).join(', ') || 'nothing staged'}`);
      throw error;
    }
    rmSync(stage, { recursive: true, force: true });
    console.log(`✓ staged ${staged.length} packages in dependency order; none is live yet`);    console.log('\nApprove them to publish (needs a one-time password):');
    console.log('  npmjs.com -> Settings -> Staged Packages -> Add to batch -> Approve');
    console.log('  node scripts/publish.mjs approve <stage-id> [<stage-id> ...]   # with NPM_OTP=<code>');
    return 0;
  }
  report([], packed);
  console.log(command === 'pack'
    ? `✓ packed ${packed.length} packages into ${stage} (nothing uploaded)`
    : `(dry run; nothing uploaded, tarballs kept in ${stage})`);
  return 0;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(`✗ ${error.message}`);
    process.exitCode = 1;
  }
}
