#!/usr/bin/env node
// Both installation modes explicitly select the bundle dependency closure:
// npm installs transitive code, but DSH activates only selected top-level bundles.
// package.json is the dependency graph; local mode links sibling bundles and
// registry mode installs the same bundle selection by published package name.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const allSubjects = ['learn', 'math-common', 'math-board', 'math-primary-low', 'math-primary-high', 'chinese-reading', 'english'];
const usage = `Usage: node scripts/install.mjs <package...|all> [--profile <name>] [--from registry] [--dry-run]

Packages: learn, math-common, math-board, math-primary-low, math-primary-high, chinese-reading, english
Default profile: web
Required bundles are selected explicitly; --from registry installs published bundle names instead of link: paths.
--dry-run only prints the command.
Example: node scripts/install.mjs math-primary-low --profile web
Example: node scripts/install.mjs all --profile web --from registry`;

function readManifest(directory) {
  return JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'));
}

const subjectPackages = {
  learn: 'dsh-edu-learn',
  'math-common': 'dsh-edu-math',
  'math-board': 'dsh-edu-math-board',
  'math-primary-low': 'dsh-edu-math-primary-low',
  'math-primary-high': 'dsh-edu-math-primary-high',
  'chinese-reading': 'dsh-edu-chinese-reading',
  english: 'dsh-edu-english',
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
 * (`dsh-edu-learn`), or a directory name, to the checkout's bundle subject.
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
      if (!dependencyKey && !dependencyName.startsWith('dsh-edu-')) continue;
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
    args: ['plugin', '--profile', profile, 'add', ...ordered.map(bundle =>
      from === 'registry' ? bundle.name : `link:${resolve(root, bundle.key)}`)],
  };
}

/** DSH owns package installation, bundle reconciliation, and activation diagnostics. */
export function install(argv, { root = repositoryRoot, run = spawnSync, log = console.log, error = console.error } = {}) {
  try {
    const plan = planInstallation(argv, root);
    if (plan.help) {
      log(usage);
      return 0;
    }
    log(`Bundles (dependencies first): ${plan.packages.join(' -> ')}`);
    // JSON quoting is for readable previews only; execution never uses a shell.
    log(['dsh', ...plan.args].map(arg => JSON.stringify(arg)).join(' '));
    if (plan.dryRun) return 0;
    const result = run('dsh', plan.args, { stdio: 'inherit', shell: false });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      error(`DSH installation failed (${result.signal ?? result.status ?? 'unknown'}). Review DSH output before retrying.`);
      return result.status || 1;
    }
    log('DSH command completed. Previously disabled bundles remain disabled; enable them explicitly in DSH plugin management if needed.');
    log('Follow DSH activation/restart diagnostics, then refresh the Web page.');
    return 0;
  } catch (cause) {
    error(cause.message);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = install(process.argv.slice(2));
}
