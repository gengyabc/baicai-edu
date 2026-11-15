#!/usr/bin/env node
// Publish the education packages from the repo root, without a root package.json.
//
// npm has no way to reach from an empty root directory to a sibling package, so
// the root deliberately has no `package.json` (one would also turn the whole
// repository into a publishable package). Instead this script drives each
// package separately: it `npm pack`s the package into a staging directory, runs
// `npm publish` on that tarball, and finally copies the provider file into the
// six skill packages and packs again so the committed copies match the source.
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
const npmCache = process.env.NPM_CONFIG_CACHE ?? mkdtempSync(join(tmpdir(), 'dsh-edu-npm-cache-'));
process.env.NPM_CONFIG_CACHE = npmCache;

/** Publish order: shared packages before the subjects that depend on them. */
export const PUBLISH_ORDER = ['learn', 'math-common', 'math-board',
  'math-primary-low', 'math-primary-high', 'chinese-reading', 'english'];

/** Packages that register skills and therefore ship rendered `resources/`. */
export const SKILL_PACKAGES = ['learn', 'math-common', 'math-primary-low',
  'math-primary-high', 'chinese-reading', 'english'];

/**
 * npm treats a bare word as a registry package spec, not a directory: `npm pack
 * math-common` tries to download `math-common@*` from the registry. Always pass
 * a path form, and one relative to the repo root, which is the cwd we use.
 */
const spec = directory => `./${directory}`;

const pack = directory => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json', spec(directory)],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(out)[0];
};

const manifest = directory => JSON.parse(readFileSync(join(root, directory, 'package.json'), 'utf8'));

/** Packages whose committed `resources/` differs from a fresh build of their skills. */
export function resourceDrift() {
  return SKILL_PACKAGES.filter(directory => {
    try {
      const name = manifest(directory).name;
      const { files } = buildResources(name, { root, write: false });
      const committed = readdirSync(join(root, directory, 'resources'), { recursive: true })
        .map(String).filter((path) => path.endsWith('.md'));
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
 * Checks that would make a release wrong: a package is not shippable as packed,
 * or the provider copies no longer match their single source.
 */
export function releaseProblems() {
  const problems = [];
  for (const directory of PUBLISH_ORDER) {
    const { name, version } = manifest(directory);
    if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(version)) {
      problems.push(`${name}: version ${version} is not publishable`);
    }
    const packed = pack(directory).files.map(file => file.path);
    if (!packed.includes('cordis.patch.yml')) problems.push(`${name}: packed without cordis.patch.yml`);
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
  for (const directory of resourceDrift()) {
    problems.push(`${manifest(directory).name}: resources/ is stale (run node scripts/build-resources.mjs)`);
  }
  return problems;
}

/**
 * Pack each package once and report the tarball, so a dry run proves the same
 * artifact `--publish` would upload rather than only the file list.
 */
export function packAll({ stage = mkdtempSync(join(tmpdir(), 'dsh-edu-pack-')) } = {}) {
  const packed = [];
  for (const directory of PUBLISH_ORDER) {
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

const USAGE = `Usage: node scripts/publish.mjs <command>

  check     dry-run every package and report release problems (default)
  pack      check, then pack all tarballs into a staging directory
  publish   check, then npm publish each tarball in dependency order

Flags:
  --dry-run   for pack/publish, stop before uploading
  --help      print this text

Only "publish" without --dry-run uploads. An unknown argument is an error, never
a guess: a typo must not reach the publish path.`;

const COMMANDS = ['check', 'pack', 'publish'];

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(USAGE);
    return 0;
  }
  const words = argv.filter(argument => !argument.startsWith('-') && argument !== '');
  const unknown = words.filter(word => !COMMANDS.includes(word));
  if (unknown.length > 0) {
    console.error(`✗ unknown command: ${unknown.join(', ')}\n\n${USAGE}`);
    return 2;
  }
  if (words.length > 1) {
    console.error(`✗ give one command, not ${words.join(' + ')}\n\n${USAGE}`);
    return 2;
  }
  const command = words[0] ?? 'check';
  const dryRun = argv.includes('--dry-run') || command === 'check';
  const otp = process.env.NPM_OTP === undefined ? [] : ['--otp', process.env.NPM_OTP];


  const problems = releaseProblems();
  if (problems.length > 0) {
    report(problems, []);
    return 1;
  }
  if (command === 'check') {
    console.log(`✓ ${PUBLISH_ORDER.length} packages are shippable and every resources/ tree matches`);
    return 0;
  }

  const { stage, packed } = packAll();
  if (!dryRun) {
    for (const { tarball } of packed) {
      console.log(`publishing ${tarball}`);
      execFileSync('npm', ['publish', tarball, ...otp], { cwd: root, stdio: 'inherit' });
    }
    rmSync(stage, { recursive: true, force: true });
    console.log(`✓ published ${packed.length} packages in dependency order`);
    return 0;
  }
  report([], packed);
  console.log(`(dry run; tarballs kept in ${stage})`);
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
