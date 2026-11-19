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
// pnpm rewrites dependencies using the profile's pnpm-workspace.yaml overrides.
// An explicit override for each packed education bundle keeps dependencies on
// checkout artifacts instead of falling back to the registry.
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, relative } from 'node:path';
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

/** Every bundle this checkout ships, as `name -> directory`. */
function bundledDirectories(root) {
  const bundled = new Map();
  for (const directory of readdirSync(root, { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const manifest = readBundledManifest(root, directory.name);
    if (!manifest?.dsh?.bundle) continue;
    if (bundled.has(manifest.name)) throw new Error(`Duplicate bundle package: ${manifest.name}`);
    bundled.set(manifest.name, directory.name);
  }
  return bundled;
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

  const bundledNames = bundledDirectories(root);
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
  // npm works from a cache, and the default `~/.npm` can be unusable (a sandbox
  // that blocks it, or root-owned entries from an older npm). Point npm at a
  // directory beside the packed tarballs; a caller-set NPM_CONFIG_CACHE wins.
  const env = { ...process.env, NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE ?? join(stage, '.npm-cache') };
  const specs = plan.packages.map(directory => {
    const { name } = readManifest(resolve(root, directory));
    const out = run('npm', ['pack', `./${directory}`, '--json', '--pack-destination', stage],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env });
    if (out.status !== 0) {
      throw new Error(`npm pack ${directory} failed: ${out.stderr || out.status}`);
    }
    let filename;
    try {
      const result = JSON.parse(out.stdout);
      filename = (Array.isArray(result) ? result[0] : result?.[name] ?? result)?.filename;
    } catch {
      throw new Error(`npm pack ${directory} did not return valid JSON`);
    }
    if (typeof filename !== 'string' || !/^[^/\\]+\.tgz$/.test(filename) || !existsSync(join(stage, filename))) {
      throw new Error(`npm pack ${directory} did not produce the reported tarball`);
    }
    return { name, spec: join(stage, filename) };
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
  let settings;
  try {
    settings = readFileSync(path, 'utf8');
  } catch (error) {
    // A profile directory without this file was not created by DSH; saying so
    // beats an ENOENT stack whose path the user never typed.
    if (error.code !== 'ENOENT') throw error;
    throw new Error(`${path} is missing, so pnpm overrides cannot be declared; `
      + `create the profile through DSH first (dsh plugin --profile ${profile} add <package>) and retry`);
  }
  writeFileSync(path, mergeOverrides(settings, specs, path));
}

/** Edit pnpm's block mapping without reserializing unrelated settings. */
function mergeOverrides(settings, specs, path) {
  const eol = settings.match(/\r?\n/)?.[0] ?? '\n';
  const bom = settings.startsWith('\uFEFF') ? '\uFEFF' : '';
  const lines = settings.slice(bom.length).split(/\r?\n/);
  const pending = new Map(specs.map(({ name, spec }) => [name, `file:${spec}`]));
  const entry = (name, spec) => `${JSON.stringify(name)}: ${JSON.stringify(spec)}`;
  const headers = lines.flatMap((line, i) => /^(?:overrides|"overrides"|'overrides')\s*:/.test(line) ? [i] : []);
  const unsupported = () => new Error(`Cannot safely edit overrides in ${path}; use one top-level block mapping`);
  if (headers.length > 1) throw unsupported();
  if (headers.length === 0) {
    if (lines.some(line => /^(?:[\[{]|\.\.\.|<<:|\?\s)/.test(line))) throw unsupported();
    if (lines.at(-1) === '') lines.pop();
    lines.push('overrides:', ...[...pending].map(([key, spec]) => `  ${entry(key, spec)}`), '');
    return bom + lines.join(eol);
  }
  const [header] = headers;
  const emptyMap = /^((?:overrides|"overrides"|'overrides')\s*:)\s*\{\s*\}(\s*(?:#.*)?)$/.exec(lines[header]);
  if (emptyMap) lines[header] = emptyMap[1] + emptyMap[2];
  if (!/^(?:overrides|"overrides"|'overrides')\s*:\s*(?:#.*)?$/.test(lines[header])) throw unsupported();
  const seen = new Set();
  let indent;
  let insertAt = header + 1;
  for (let i = header + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    if (/^\S/.test(line)) break;
    const row = /^( +)("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^'"\s][^:]*?):(?:\s|$)/.exec(line);
    if (!row) throw unsupported();
    indent ??= row[1];
    if (row[1] !== indent) throw unsupported();
    let key = row[2].trim();
    try {
      if (key.startsWith('"')) key = JSON.parse(key);
      else if (key.startsWith("'")) key = key.slice(1, -1).replaceAll("''", "'");
    } catch {
      throw unsupported();
    }
    if (key === '<<' || /^[?&*[{]/.test(key) || seen.has(key)) throw unsupported();
    seen.add(key);
    if (pending.has(key)) {
      lines[i] = `${indent}${entry(key, pending.get(key))}`;
      pending.delete(key);
    }
    insertAt = i + 1;
  }
  lines.splice(insertAt, 0, ...[...pending].map(([key, spec]) => `${indent ?? '  '}${entry(key, spec)}`));
  return bom + lines.join(eol);
}

/**
 * Create the profile directory (and nothing else) when it does not exist yet.
 *
 * `dsh plugin … add` with no packages exits non-zero (pnpm requires a package
 * name) but DSH creates the profile first, so the manifest is the signal. What
 * must not pass silently is a profile that was NOT created — an app-managed
 * name (the Electron app owns its own) is rejected there, and carrying on
 * surfaces later as `ENOENT … profiles/<name>/package.json`, which names
 * neither the cause nor the remedy.
 */
function initializeProfile(profilesRoot, profile, run) {
  const manifest = join(profilesRoot, profile, 'package.json');
  if (existsSync(manifest)) return;
  const init = run('dsh', ['plugin', '--profile', profile, 'add'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: false });
  if (init.error) throw init.error;
  if (existsSync(manifest)) return;
  const detail = `${init.stderr ?? ''}${init.stdout ?? ''}`.trim();
  throw new Error(`could not create profile ${profile}: ${detail || `dsh exited ${init.status ?? init.signal}`}`);
}

/**
 * Every artifact one install needs: this closure re-packed, plus any packed
 * dependency earlier installs added (a different subject) re-added from the
 * copies still on disk. Re-adding all of them makes pnpm resolve the whole
 * graph against local tarballs instead of the registry.
 *
 * The staging directory is on the OS's temp path, so it can be cleaned between
 * installs. A stale path is therefore not an error to hand back to the user —
 * reinstalling IS the remedy the message would name. When this checkout ships
 * that bundle it is packed again here; only a package this checkout cannot
 * produce leaves the user with an action to take.
 */
function artifacts(plan, profilesRoot, profile, { root, run }) {
  const data = join(profilesRoot, profile);
  const previous = JSON.parse(readFileSync(join(data, 'package.json'), 'utf8')).dependencies ?? {};
  const bundled = bundledDirectories(root);
  const kept = [];
  const repack = [];
  for (const [name, spec] of Object.entries(previous)) {
    if (!(bundled.has(name) || name.startsWith('baicai-edu-')) ||
        typeof spec !== 'string' || !spec.startsWith('file:') || !spec.endsWith('.tgz')) continue;
    const path = resolve(data, spec.slice('file:'.length));
    if (existsSync(path)) kept.push({ name, spec: path });
    else if (bundled.has(name)) repack.push(bundled.get(name));
    else {
      throw new Error(`${name} was packed at ${path}, which no longer exists and this checkout cannot repack; `
        + `remove it from the profile (dsh plugin --profile ${profile} remove ${name}) and install it again`);
    }
  }
  // Every install owns a fresh staging directory, so it also declares the
  // current artifacts; nothing else repacks the copies they replace.
  const stage = mkdtempSync(join(tmpdir(), 'baicai-edu-install-'));
  const packed = packLocal({ ...plan, packages: [...new Set([...plan.packages, ...repack])] }, { root, run, stage });
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
    log(`Packed: ${specs.map(({ spec }) => basename(spec)).join(', ')}`);
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
