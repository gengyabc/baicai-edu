#!/usr/bin/env node
// Keep dependency knowledge in package.json, not in a second installer graph.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const allSubjects = ['math-primary-low', 'chinese-reading', 'english'];
const usage = `Usage: node scripts/install.mjs <package...|all> [--profile <name>] [--dry-run]

Packages: learn, math-board, math-primary-low, chinese-reading, english
Default profile: web
Dependencies are included automatically. --dry-run only prints the command.
Example: node scripts/install.mjs math-primary-low --profile web`;

function readManifest(directory) {
  return JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'));
}

/** Plan the complete bundle selection without touching a DSH profile. */
export function planInstallation(argv, root = repositoryRoot) {
  const requested = [];
  let profile = 'web';
  let dryRun = false;
  let help = false;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--profile') {
      profile = argv[++index];
      if (!profile || profile.startsWith('-') || !/^[\w.-]+$/.test(profile) || profile === '.' || profile === '..') {
        throw new Error('--profile requires a profile name (letters, digits, _, - or .).');
      }
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

  const bundles = new Map();
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = resolve(root, entry.name);
    let manifest;
    try {
      manifest = readManifest(directory);
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (manifest.dsh?.bundle) bundles.set(entry.name, { directory, manifest, key: entry.name });
  }

  const ordered = [];
  const visited = new Set();
  const visiting = new Set();
  function visit(key) {
    const bundle = bundles.get(key);
    if (!bundle) throw new Error(`Unknown package: ${key}`);
    if (visiting.has(key)) throw new Error(`Circular bundle dependency: ${[...visiting, key].join(' -> ')}`);
    if (visited.has(key)) return;
    visiting.add(key);
    for (const [name, spec] of Object.entries(bundle.manifest.dependencies ?? {})) {
      if (!spec.startsWith('file:')) {
        throw new Error(`${key}: unsupported dependency ${name} (${spec}); expected a local file: bundle.`);
      }
      const directory = resolve(bundle.directory, spec.slice(5));
      const dependency = [...bundles.values()].find(candidate => candidate.directory === directory);
      if (!dependency || dependency.manifest.name !== name) {
        throw new Error(`${key}: missing or mismatched bundle dependency ${name} (${spec}).`);
      }
      visit(dependency.key);
    }
    visiting.delete(key);
    visited.add(key);
    ordered.push(bundle);
  }
  for (const key of requested.flatMap(key => key === 'all' ? allSubjects : [key])) visit(key);

  return {
    profile,
    dryRun,
    packages: ordered.map(bundle => bundle.key),
    args: ['plugin', '--profile', profile, 'add', ...ordered.map(bundle => `link:${bundle.directory}`)],
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
