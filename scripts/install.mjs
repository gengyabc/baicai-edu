#!/usr/bin/env node
// Both installation modes explicitly select the bundle dependency closure:
// npm installs transitive code, but DSH activates only selected top-level bundles.
// package.json is the dependency graph. Local mode INSTALLS FROM THE PACKED
// ARTIFACTS: `npm pack` each bundle, then install the tarballs in one dsh call.
// That gives a local profile the same node_modules layout as a published one —
// every closure package is a direct dependency of the profile — which is what
// lets the ONE skill provider resolve all of them (see docs/installation.md).
// Neither `link:` nor `file:` to a checkout directory does that: pnpm does not
// install the dependencies of a linked package.
//
// pnpm rewrites the dependencies of an installed tarball for any name it also
// overrides in the PROFILE's package.json. So the install also declares
// overrides naming every packed tarball: a closure package pulled in by another
// tarball resolves to the packed copy instead of the registry. npm has not
// published baicai-edu yet, and even after that a local install must use this
// checkout, not whatever is published.
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const allSubjects = ['learn', 'math-common', 'math-board', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english'];
const usage = `Usage: node scripts/install.mjs <package...|all> [--profile <name>] [--from registry] [--dry-run]

Packages: learn, math-common, math-board, math-primary-low, math-primary-high, chinese-reading, english
Default profile: web
Required bundles are selected explicitly. Local mode (default) packs each bundle from this
checkout and installs the tarballs; --from registry installs the published packages instead.
Both install the whole closure in one dsh call, so only installed top-level bundles matter.
--dry-run only prints the command.
Example: node scripts/install.mjs math-primary-low --profile web
Example: node scripts/install.mjs all --profile web --from registry`;

function readManifest(directory) {
  return JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'));
}

const subjectPackages = {
  learn: 'baicai-edu-learn',
  'math-common': 'baicai-edu-math',
  'math-board': 'baicai-edu-math-board',
  'math-primary-low': 'baicai-edu-math-primary-low',
  'math-primary-high': 'baicai-edu-math-primary-high',
  'chinese-reading': 'baicai-edu-chinese-reading',
  english: 'baicai-edu-english',
};
const subjectKeys = Object.fromEntries(Object.entries(subjectPackages).map(([subject, name]) => [name, subject]));

function readBundledManifest(root, subject) {
  try {
    return readManifest(resolve(root, subject));
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

/**
 * Resolve an argument that may be a subject (`learn`), a package name
 * (`baicai-edu-learn`), or a directory name, to the checkout's bundle subject.
 */
export function resolvePackageKey(name) {
  return subjectKeys[name] ?? name;
}

/**
 * Plan the complete bundle selection without touching a DSH profile.
 * Both modes walk declared sibling bundle dependencies, whether their specs
 * are file: references or published ranges. Third-party npm deps stay with npm.
 */
export function planInstallation(argv, root = repositoryRoot) {
  const requested = [];
  let profile = 'web';
  let from = 'local';
  let dryRun = false;
  let help = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--profile') {
      profile = argv[++index];
      if (!profile || profile.startsWith('-') || !/^[\w.-]+$/.test(profile) || profile === '.' || profile === '..') {
        throw new Error('--profile requires a profile name (letters, digits, _, - or .).');
      }
    } else if (arg === '--from') {
      from = argv[++index];
      if (from !== 'registry' && from !== 'local') throw new Error('--from must be registry or local.');
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      requested.push(arg);
    }
  }
  if (help) return { help: true };
  if (!requested.length) throw new Error('Choose a package or all. Use --help for usage.');

  const bundledNames = new Map();
  for (const directory of readdirSync(root, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const manifest = readBundledManifest(root, directory.name);
    if (!manifest?.dsh?.bundle) continue;
    if (bundledNames.has(manifest.name)) throw new Error(`Duplicate bundle package: ${manifest.name}`);
    bundledNames.set(manifest.name, directory.name);
  }
  const ordered = [];
  const visited = new Set();
  const visiting = new Set();
  function visit(name) {
    const key = resolvePackageKey(name);
    const manifest = readBundledManifest(root, key);
    if (!manifest?.dsh?.bundle) throw new Error(`Unknown package: ${key}`);
    if (visiting.has(key)) throw new Error(`Circular bundle dependency: ${[...visiting, key].join(' -> ')}`);
    if (visited.has(key)) return;
    visiting.add(key);
    for (const [dependencyName, spec] of Object.entries(manifest.dependencies ?? {})) {
      const dependencyKey = bundledNames.get(dependencyName);
      // External runtime libraries are npm's responsibility, not DSH bundles.
      if (!dependencyKey && !dependencyName.startsWith('baicai-edu-')) continue;
      if (!dependencyKey || typeof spec !== 'string') {
        throw new Error(`${key}: missing or mismatched bundle dependency ${dependencyName} (${spec}).`);
      }
      if (spec.startsWith('file:')) {
        const targetKey = relative(resolve(root), resolve(root, key, spec.slice(5)));
        if (targetKey !== dependencyKey) {
          throw new Error(`${key}: mismatched bundle dependency ${dependencyName} (${spec}).`);
        }
      } else if (!/^[~^]?\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(spec)) {
        throw new Error(`${key}: unsupported bundle dependency ${dependencyName} (${spec}).`);
      }
      visit(dependencyKey);
    }
    visiting.delete(key);
    visited.add(key);
    ordered.push({ key, name: manifest.name });
  }
  for (const name of requested.flatMap(name => name === 'all' ? allSubjects : [name])) visit(name);

  return {
    profile,
    from,
    dryRun,
    packages: ordered.map(bundle => bundle.key),
    names: ordered.map(bundle => bundle.name),
  };
}

/**
 * Pack the planned local bundles into one directory.
 * @param plan - the closure, in dependency order.
 * @param options.stage - a directory to pack into (defaults to a new temp one).
 * @returns `{ stage, specs }`: the directory and `{ name, spec }` per tarball.
 */
export function packLocal(plan, { root = repositoryRoot, run = spawnSync, stage = mkdtempSync(join(tmpdir(), 'baicai-edu-install-')) } = {}) {
  const specs = plan.packages.map(directory => {
    const out = run('npm', ['pack', `./${directory}`, '--pack-destination', stage],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    if (out.status !== 0) {
      throw new Error(`npm pack ${directory} failed: ${out.stderr || out.status}`);
    }
    const spec = join(stage, out.stdout.trim().split('\n').filter(Boolean).pop());
    // `npm pack` names the tarball `<name>-<version>.tgz`; read the name from the
    // manifest instead of parsing it back.
    return { name: readManifest(resolve(root, directory)).name, spec };
  });
  return { stage, specs };
}

/**
 * Declare pnpm overrides for the packed tarballs, so a closure package pulled in
 * by another tarball resolves to the packed copy instead of the registry. pnpm
 * 11 reads them from the profile's `pnpm-workspace.yaml`. The block is left in
 * place: it names the artifacts a reinstall re-runs `pnpm add` with.
 */
export function applyOverrides(profilesRoot, profile, specs) {
  const path = join(profilesRoot, profile, 'pnpm-workspace.yaml');
  const overrides = specs
    .map(({ name, spec }) => `  ${JSON.stringify(name)}: ${JSON.stringify(`file:${spec}`)}`)
    .join('\n');
  writeFileSync(path, `${withoutOverrides(readFileSync(path, 'utf8')).trimEnd()}\noverrides:\n${overrides}\n`);
}

/** A profile settings file with its `overrides:` block (and its entries) removed. */
function withoutOverrides(text) {
  const block = /^overrides:\n(?:[ \t].*\n?)*/m.exec(text);
  if (block === null) return text;
  return text.slice(0, block.index) + text.slice(block.index + block[0].length);
}

/** Create the profile directory (and nothing else) when it does not exist yet. */
function initializeProfile(profilesRoot, profile, run) {
  if (existsSync(join(profilesRoot, profile, 'package.json'))) return;
  const init = run('dsh', ['plugin', '--profile', profile, 'add'], { stdio: 'ignore', shell: false });
  if (init.error) throw init.error;
}

/**
 * Every artifact one install needs: this closure re-packed, plus any packed
 * dependency earlier installs added (a different subject) re-added from the
 * copies still on disk. Re-adding all of them makes pnpm resolve the whole
 * graph against local tarballs instead of the registry.
 */
function artifacts(plan, profilesRoot, profile, { root, run }) {
  const data = join(profilesRoot, profile);
  const previous = JSON.parse(readFileSync(join(data, 'package.json'), 'utf8')).dependencies ?? {};
  const kept = Object.entries(previous)
    .filter(([, spec]) => typeof spec === 'string' && spec.startsWith('file:'))
    .map(([name, spec]) => {
      const path = spec.slice('file:'.length);
      if (!existsSync(path)) throw new Error(`${name} was packed at ${path}, which no longer exists; install it again`);
      return { name, spec: path };
    });
  // Every install owns a fresh staging directory, so it also declares the
  // current artifacts; nothing else repacks the copies they replace.
  const stage = mkdtempSync(join(tmpdir(), 'baicai-edu-install-'));
  const packed = packLocal(plan, { root, run, stage });
  const byName = new Map([...kept, ...packed.specs].map(({ name, spec }) => [name, spec]));
  const order = [...new Set([...plan.names.filter((name) => byName.has(name)), ...byName.keys()])];
  return {
    stage,
    specs: order.map((name) => ({ name, spec: byName.get(name) })),
    // Artifacts a reinstalled profile still references are the new copies.
    replaced: packed.specs,
    packed,
  };
}

/**
 * DSH owns package installation, bundle reconciliation, and activation diagnostics.
 *
 * A local install needs the profile before it can declare overrides, so it
 * initializes a missing profile with `dsh plugin ... add` (which creates it and
 * installs nothing). DSH has no command for pnpm overrides, so this script
 * writes them; they stay in the profile, naming the artifacts a reinstall
 * re-runs `pnpm add` with.
 */
export function install(argv, { root = repositoryRoot, run = spawnSync, log = console.log, error = console.error, dshHome = process.env.DSH_HOME } = {}) {
  try {
    const plan = planInstallation(argv, root);
    if (plan.help) {
      log(usage);
      return 0;
    }
    log(`Bundles (dependencies first): ${plan.packages.join(' -> ')}`);
    if (plan.from === 'registry') {
      const args = ['plugin', '--profile', plan.profile, 'add', ...plan.names];
      // JSON quoting is for readable previews only; execution never uses a shell.
      log(['dsh', ...args].map(arg => JSON.stringify(arg)).join(' '));
      if (plan.dryRun) return 0;
      return runDsh(args, run, error, log);
    }
    if (plan.dryRun) {
      log(`npm pack ${plan.packages.join(', ')} -> dsh plugin --profile ${plan.profile} add <packed tarballs>`);
      return 0;
    }
    const profilesRoot = join(dshHome ?? defaultDshHome(), 'profiles');
    initializeProfile(profilesRoot, plan.profile, run);
    const { specs } = artifacts(plan, profilesRoot, plan.profile, { root, run });
    applyOverrides(profilesRoot, plan.profile, specs);
    log(`Packed: ${specs.map(({ spec }) => spec.split('/').pop()).join(', ')}`);
    const args = ['plugin', '--profile', plan.profile, 'add', ...specs.map(({ spec }) => spec)];
    log(['dsh', ...args].map(arg => JSON.stringify(arg)).join(' '));
    return runDsh(args, run, error, log);
  } catch (cause) {
    error(cause.message);
    return 1;
  }
}

/** `$DSH_HOME` when set, else `~/.dsh`, matching DSH's own home resolution. */
function defaultDshHome() {
  return join(process.env.HOME ?? process.env.USERPROFILE ?? '.', '.dsh');
}

function runDsh(args, run, error, log) {
  const result = run('dsh', args, { stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    error(`DSH installation failed (${result.signal ?? result.status ?? 'unknown'}). Review DSH output before retrying.`);
    return result.status || 1;
  }
  log('DSH command completed. Previously disabled bundles remain disabled; enable them explicitly in DSH plugin management if needed.');
  log('Follow DSH activation/restart diagnostics, then refresh the Web page.');
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = install(process.argv.slice(2));
}
