#!/usr/bin/env node
// Teach skills from inside the installed package instead of from a profile
// directory the author configured by hand.
//
// Each dsh-edu bundle ships this plugin and a cordis.patch.yml entry that
// activates it (`kind: dsh-edu-skills`, `require: <package>/package.json`).
// The plugin reads its own skills/ directory, expands every SKILL.md body and
// its references/ files into one content string, and registers each skill with
// `ctx.skills.register()`. A published package therefore teaches from wherever
// it was installed, with no absolute path, no launch-time skill directory, and
// no dependency on another checkout.
//
// The expanded content is the parsed skill body plus a `## Skill resources`
// appendix: every skill of the package (its directory is its name) as a
// `<skill name>/references/<file>` section, plus `<file>.md` sections for
// references/ files that are cited without a name. Both the head skill's own
// paths and named cross-skill paths in the body still resolve. A skill whose
// appendix exceeds the size cap keeps its body only and is marked truncated.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Package root of the bundle that shipped this file: the installed location,
 * resolved at runtime, never an author path.
 */
export function packageRootFrom(moduleUrl = import.meta.url) {
  return fileURLToPath(new URL('./', moduleUrl));
}

/** Model-facing size cap for one expanded skill, kept well under context limits. */
export const MAX_CONTENT_BYTES = 256 * 1024;

/** Bundled precedence shared with DSH's own packaged skill roots. */
const BUNDLED_RANK = 600;

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;
const REFERENCE_LINK = /`?references\/([A-Za-z0-9_./-]+\.md)`?/g;

/** Split YAML-frontmatter-free markdown frontmatter into the fields skills use. */
export function parseFrontmatter(text) {
  const match = FRONTMATTER.exec(text);
  if (match === undefined) throw new Error('skill file is missing its frontmatter');
  const fields = {};
  for (const line of match[1].split('\n')) {
    const entry = line.match(/^([\w-]+):\s*(.*)$/);
    if (entry !== null) fields[entry[1]] = entry[2].trim().replace(/^["']|["']$/g, '');
  }
  return { fields, body: text.slice(match[0].length) };
}

/** Invocation policy: `user-invocable: false` hides the user surface, and so does `disable-model-invocation: true` for the model surface. */
export function invocationOf(fields) {
  return {
    modelInvocable: !(fields['disable-model-invocation'] === 'true'),
    userInvocable: !(fields['user-invocable'] === 'false'),
  };
}

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => entry.name)
    .sort();
}

/** A `references/<file>.md` token belonging to the skill itself (no directory, no `..`). */
const OWN_REFERENCE = /^references\/([A-Za-z0-9_.-]+\.md)$/;
/** `name ` introduces a cross-skill reference `<skill name>/references/<file>`. */
const NAMED_REFERENCE = /`([a-z0-9]+(?:-[a-z0-9]+)*)`\s*(`?references\/[A-Za-z0-9_.-]+\.md`?)/g;

/** Head-skill references/ file names in citation order, without duplicates. */
export function citedReferences(text) {
  const names = [];
  for (const match of text.matchAll(REFERENCE_LINK)) {
    const token = `references/${match[1]}`;
    const own = OWN_REFERENCE.exec(token);
    if (own !== null && !names.includes(own[1])) names.push(own[1]);
  }
  return names;
}

/** Cross-skill references a body cites, as `{skill, file}` pairs that exist in this package. */
export function namedReferences(body, skills) {
  const found = [];
  for (const match of body.matchAll(NAMED_REFERENCE)) {
    const owner = skills.find(skill => skill.name === match[1]);
    const file = OWN_REFERENCE.exec(match[2].replace(/^`|`$/g, ''));
    if (owner === undefined || file === null) continue;
    const path = join(owner.directory, 'references', file[1]);
    if (existsSync(path)) found.push({ skill: match[1], file: file[1], path });
  }
  return found;
}

/**
 * Appendix sections for one skill: its cross-skill references under
 * `<skill>/references/<file>` headings, then its own cited files under
 * `<file>` headings (those are not captured by a named cross-skill mention).
 */
export function renderAppendix(skill, skills, read) {
  const sections = [];
  const used = new Set();
  for (const reference of namedReferences(skill.body, skills)) {
    const key = `${reference.skill}/references/${reference.file}`;
    if (used.has(key)) continue;
    used.add(key);
    sections.push(`### ${key}\n\n${read(reference.path).trim()}`);
  }
  for (const file of citedReferences(skill.body)) {
    const path = join(skill.directory, 'references', file);
    if (!existsSync(path) || used.has(`${skill.name}/references/${file}`)) continue;
    used.add(`${skill.name}/references/${file}`);
    sections.push(`### ${file}\n\n${read(path).trim()}`);
  }
  return sections;
}

/** One registration per SKILL.md under `skills/`, with its cited references appended. */
export function loadSkills(root = packageRootFrom()) {
  const read = path => readFileSync(path, 'utf8');
  const skillsRoot = join(root, 'skills');
  if (!existsSync(skillsRoot)) throw new Error(`no skills directory at ${skillsRoot}`);
  const skills = [];
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = join(skillsRoot, entry.name);
    const file = join(directory, 'SKILL.md');
    if (!existsSync(file)) continue;
    const { fields, body } = parseFrontmatter(read(file));
    const name = fields.name ?? entry.name;
    const description = fields.description;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || typeof description !== 'string' || description.length === 0) {
      throw new Error(`${file}: needs a kebab-case name and a non-empty description`);
    }
    skills.push({
      name, description, directory, file, body, fields,
      ...fields['when-to-use'] === undefined ? {} : { whenToUse: fields['when-to-use'] },
      invocation: invocationOf(fields),
      resourceBase: { kind: 'directory', path: directory },
    });
  }
  const truncated = [];
  const registrations = skills.map(skill => {
    const appendix = renderAppendix(skill, skills, read);
    const content = appendix.length === 0 ? skill.body : `${skill.body.trim()}\n\n## Skill resources\n\n${appendix.join('\n\n')}\n`;
    if (Buffer.byteLength(content, 'utf8') > MAX_CONTENT_BYTES) {
      truncated.push(skill.name);
      return { name: skill.name, description: skill.description, ...skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse },
        invocation: skill.invocation, content: `${skill.body.trim()}\n\nIts cited references/ files are installed beside this skill and are too large to inline; read the specific file the body names when needed.\n`,
        resourceBase: skill.resourceBase, path: skill.file };
    }
    return { name: skill.name, description: skill.description, ...skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse },
      invocation: skill.invocation, content, resourceBase: skill.resourceBase, path: skill.file };
  });
  if (registrations.length === 0) throw new Error(`no SKILL.md files under ${skillsRoot}`);
  return { skills: registrations, truncated, resourceBase: { kind: 'directory', path: skillsRoot } };
}

export const name = 'dsh-edu-skills';
export const inject = ['skills'];

/** Register every shipped skill; the provider label keeps lookups and logs attributable. */
export function apply(ctx, config = {}) {
  const providerName = config.providerName ?? 'dsh-edu-skills';
  const loaded = loadSkills(packageRootFrom());
  ctx.effect(function* () {
    for (const skill of loaded.skills) {
      yield ctx.skills.register({ ...skill, provider: providerName, source: 'bundled', rank: BUNDLED_RANK });
    }
  }, `${name} (${providerName})`);
}

