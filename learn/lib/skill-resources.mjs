// Read the skills a package ships, without DSH's skill registry.
//
// This lives outside `skills/` because `skills/` holds only DOCUMENT bundles
// (`<name>/SKILL.md`); code the provider needs would break tools that treat
// every entry there as a skill directory.
//
// A skill package ships `resources/`: one rendered `<name>.md` per skill (its
// frontmatter plus a `resources:` header) and, under `resources/references/`, one
// file per reference it needs. This module turns that directory back into skill
// definitions — the body plus a `## Skill resources` section — so a provider can
// register them as the one `content` string DSH hands to the model.
//
// Nothing here looks at where a package was installed: the caller passes the
// package root it already resolved, so a registry install, a packed tarball and
// a `link:` checkout read the same way. A package without `resources/` ships no
// skills (the board, for instance).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const HEADER = /^---\n([\s\S]*?)\n---\n?/;

/** Header fields of a rendered skill file. */
function headerFields(text) {
  const match = HEADER.exec(text);
  if (match === null) return undefined;
  const fields = {};
  for (const line of match[1].split('\n')) {
    const entry = /^([\w-]+):\s*(.*)$/.exec(line);
    if (entry !== null) fields[entry[1]] = entry[2].trim();
  }
  return fields;
}

/** The resources a skill needs, as `[heading, section text]` in listed order. */
function resourceSections(file, fields) {
  // `dirname`, not a search for `/`: the provider runs on Windows too, where a
  // path built by `join` has no forward slash at all — slicing on `/` then
  // resolved every resource against a mangled directory and the sections were
  // dropped silently, leaving the skill body without its rules.
  const directory = dirname(file);
  const sections = [];
  for (const name of (fields?.resources ?? '').split(/\s+/).filter(Boolean)) {
    const path = join(directory, 'references', name);
    if (!existsSync(path)) continue;
    const heading = name.includes('/') ? name : name.replace(/\.md$/, '');
    sections.push([heading, `### ${heading}\n\n${readFileSync(path, 'utf8').trim()}`]);
  }
  return sections;
}

/**
 * What a size-limited skill says in place of the sections it could not inline.
 * The names stay usable because every resource is also installed at
 * `references/<name>.md` under the base directory, the path the body cites.
 */
function omittedNote(headings) {
  return [
    'These resources were left out of this prompt to stay within its size limit; each is installed',
    `as \`references/<name>.md\` under this skill's base directory and should be read when the body names it: ${headings.join(', ')}.`,
  ].join(' ');
}

/**
 * One registered skill from its rendered file.
 * @returns `{ name, description, whenToUse?, invocation, content }`, or undefined for an invalid file.
 */
export function renderSkill(file, { maxBytes = Infinity } = {}) {
  const text = readFileSync(file, 'utf8');
  const match = HEADER.exec(text);
  const fields = headerFields(text);
  if (match === null || fields?.name === undefined || fields?.description === undefined) return undefined;
  const body = text.slice(match[0].length);
  const skill = {
    name: fields.name,
    description: fields.description,
    whenToUse: fields['when-to-use'],
    invocation: {
      modelInvocable: fields['disable-model-invocation'] !== 'true',
      userInvocable: fields['user-invocable'] !== 'false',
    },
    content: body,
  };
  // On-demand references are still installed beside the resource base. The
  // skill body routes the reader to the file needed for the current branch.
  if (fields['resource-loading'] === 'on-demand') return skill;
  const sections = resourceSections(file, fields);
  if (sections.length === 0) return skill;
  // Cut between resources, never inside one: a half-sentence is worse than an
  // absent section the model can still open by name.
  const prefix = `${body.trim()}\n\n## Skill resources\n\n`;
  let content = prefix;
  const omitted = [];
  for (const [heading, section] of sections) {
    const candidate = `${content}${section}\n\n`;
    if (Buffer.byteLength(candidate, 'utf8') > maxBytes) omitted.push(heading);
    else content = candidate;
  }
  skill.content = omitted.length === 0 ? content : `${content}${omittedNote(omitted)}\n`;
  skill.omitted = omitted;
  return skill;
}

/**
 * Every skill a package root ships, sorted by name.
 * @param root - absolute package root.
 * @returns skill definitions; empty when the package ships no `resources/`.
 */
export function readPackage(root, { maxBytes = Infinity } = {}) {
  const directory = join(root, 'resources');
  if (!existsSync(directory)) return [];
  // A skill file's path is exactly `<directory>/<name>.md`: a resource name
  // that collides with another skill is written as `skill/file.md` and is
  // therefore never mistaken for a skill.
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && !entry.name.includes('/'))
    .map((entry) => join(directory, entry.name))
    .sort()
    .flatMap((file) => {
      const skill = renderSkill(file, { maxBytes });
      return skill === undefined ? [] : [skill];
    });
}
