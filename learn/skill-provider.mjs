#!/usr/bin/env node
// Every selected baicai-edu skill bundle has its own DSH loader row. The rows
// reuse this implementation but each names only its bundle's package root.
// Registrations belong to that row's effect, so DSH disposes them when the row
// is removed. The packages array remains compatible with explicit legacy config.
//
// Read the named roots' rendered resources, skipping unresolved specifiers.
// Citations are inlined by default; on-demand references and locale catalogs
// are read from the registered resources base.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { isAbsolute } from 'node:path';

import { readPackage } from './lib/skill-resources.mjs';

export const name = 'edu-skills';
export const inject = ['skills'];


/** Bundled precedence shared with DSH's own packaged skill roots. */
const BUNDLED_RANK = 600;

/**
 * Model-facing size cap for one expanded skill.
 *
 * This is the package's own safety net, not a DSH limit or a target. Prefer
 * routing to on-demand references when a skill has independent branches.
 */
export const MAX_CONTENT_BYTES = 512 * 1024;

/**
 * Size at which a skill is reported for review while still registered whole.
 * Growth past this line is a signal to split the skill, not to cut it.
 */
export const WARN_CONTENT_BYTES = 200 * 1024;

/**
 * Register the skills of every configured package root.
 * @param ctx - Cordis context with the `skills` service.
 * @param config - `{ packages: string[] }`: absolute package.json paths, in install order.
 */
export function apply(ctx, config = {}) {
  const roots = (config.packages ?? [])
    .filter((path) => typeof path === 'string' && isAbsolute(path))
    .map((path) => join(path, '..'))
    .filter((root) => existsSync(root));
  const truncated = [];
  const oversized = [];
  // The size limit is applied while the resource sections are assembled, so an
  // oversized skill loses whole resources at their boundary and names them, rather
  // than being sliced mid-sentence. The rendered body already states that each name
  // is installed as `<name>.md` beside the base directory, which is what keeps an
  // omitted resource reachable.
  const skills = roots.flatMap((root) => readPackage(root, { maxBytes: MAX_CONTENT_BYTES }).map(({ omitted = [], ...skill }) => {
    if (omitted.length > 0) truncated.push(`${skill.name} (${omitted.join(', ')})`);
    // The rendered skill names its own catalog as `references/locales/<locale>.json`.
    // Publishing `resources/` as the base directory is what lets the model read that
    // file after install, and what keeps an omitted resource reachable.
    const resourceBase = { kind: 'directory', path: join(root, 'resources') };
    const bytes = Buffer.byteLength(skill.content, 'utf8');
    if (bytes > WARN_CONTENT_BYTES) oversized.push(`${skill.name} ${(bytes / 1024).toFixed(0)} KB`);
    if (bytes <= MAX_CONTENT_BYTES) return { ...skill, resourceBase };
    // Only a body that is oversized on its own reaches here; there is no section
    // boundary left to cut at.
    truncated.push(skill.name);
    return { ...skill, resourceBase, content: `${skill.content.slice(0, MAX_CONTENT_BYTES)}\n` };
  }));
  ctx.logger.info(`edu-skills: ${skills.length} skills from ${roots.length} package roots`);
  if (oversized.length > 0) ctx.logger.info(`edu-skills: large but whole: ${oversized.join(', ')}`);
  for (const skill of truncated) ctx.logger.warn(`edu-skills: ${skill} exceeds the content cap and was truncated`);
  ctx.effect(function* () {
    for (const skill of skills) {
      yield ctx.skills.register({ ...skill, provider: name, source: 'bundled', rank: BUNDLED_RANK });
    }
  }, name);
}
