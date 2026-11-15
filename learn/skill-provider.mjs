#!/usr/bin/env node
// Register every installed baicai-edu skill with DSH's skill registry.
//
// Each skill package ships a `cordis.patch.yml` that activates THIS file, and in
// a registry (or packed-tarball) install every named dependency is a direct
// dependency of the profile, so all six activations resolve to the profile's
// one copy of `baicai-edu-learn/skill-provider.mjs`.
//
// Every activation shares one entry id, so the profile composes a single entry —
// and a single `config.packages` list, because the last layer's row wins. That
// is why this entry is inserted by the LAYER THAT IS FIRST in bundle order
// (`baicai-edu-learn`, always a transitive dependency of a subject install and its
// own direct dependency): its row is the one left standing, and it must name the
// whole closure. A top-level bundle that sorts after it would be defeated by
// this row's last-wins config.
//
// The provider reads each named package's `resources/` directory and registers
// one skill per rendered file, so its citations of shared files (learn-data,
// math-common) are inlined instead of left for the model to resolve by path.
// A package the activation cannot resolve keeps its unresolved path and is
// skipped: a partial local `link:` install registers nothing rather than
// guessing what is installed.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { isAbsolute } from 'node:path';

import { readPackage } from './lib/skill-resources.mjs';

export const name = 'edu-skills';
export const inject = ['skills'];


/** Bundled precedence shared with DSH's own packaged skill roots. */
const BUNDLED_RANK = 600;

/** Model-facing size cap for one expanded skill, kept well under context limits. */
const MAX_CONTENT_BYTES = 256 * 1024;

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
  const skills = roots.flatMap((root) => readPackage(root)).map((skill) => {
    if (Buffer.byteLength(skill.content, 'utf8') <= MAX_CONTENT_BYTES) return skill;
    truncated.push(skill.name);
    return {
      ...skill,
      content: `${skill.content.slice(0, MAX_CONTENT_BYTES)}\n\nIts remaining resources are installed beside this skill; load the specific resource the body names when needed.\n`,
    };
  });
  ctx.logger.info(`edu-skills: ${skills.length} skills from ${roots.length} package roots`);
  for (const skill of truncated) ctx.logger.warn(`edu-skills: ${skill} exceeds the content cap and was truncated`);
  ctx.effect(function* () {
    for (const skill of skills) {
      yield ctx.skills.register({ ...skill, provider: name, source: 'bundled', rank: BUNDLED_RANK });
    }
  }, name);
}
