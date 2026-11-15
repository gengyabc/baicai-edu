// Read the skills a package ships, without DSH's skill registry.
//
// This lives outside `skills/` because `skills/` holds only DOCUMENT bundles
// (`<name>/SKILL.md`); code the provider needs would break tools that treat
// every entry there as a skill directory.
//
// A skill package ships `resources/`: one rendered `<name>.md` per skill (its
// frontmatter plus a `resources:` header) and one file per resource it needs.
// This module turns that directory back into skill definitions — the body plus
// a `## Skill resources` section — so a provider can register them as the one
// `content` string DSH hands to the model.
//
// Nothing here looks at where a package was installed: the caller passes the
// package root it already resolved, so a registry install, a packed tarball and
// a `link:` checkout read the same way. A package without `resources/` ships no
// skills (the board, for instance).
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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

/** The resources a skill needs, as `### <heading>` sections in listed order. */
function resourceSections(file, fields) {
  const directory = file.slice(0, file.lastIndexOf('/'));
  const sections = [];
  for (const name of (fields?.resources ?? '').split(/\s+/).filter(Boolean)) {
    const path = join(directory, name);
    if (!existsSync(path)) continue;
    const heading = name.includes('/') ? name : name.replace(/\.md$/, '');
    sections.push(`### ${heading}\n\n${readFileSync(path, 'utf8').trim()}`);
  }
  return sections;
}

/**
 * One registered skill from its rendered file.
 * @returns `{ name, description, whenToUse?, invocation, content }`, or undefined for an invalid file.
 */
export function renderSkill(file) {
  const text = readFileSync(file, 'utf8');
  const match = HEADER.exec(text);
  const fields = headerFields(text);
  if (match === null || fields?.name === undefined || fields?.description === undefined) return undefined;
  const body = text.slice(match[0].length);
  const sections = resourceSections(file, fields);
  return {
    name: fields.name,
    description: fields.description,
    whenToUse: fields['when-to-use'],
    invocation: {
      modelInvocable: fields['disable-model-invocation'] !== 'true',
      userInvocable: fields['user-invocable'] !== 'false',
    },
    content: sections.length === 0 ? body : `${body.trim()}\n\n## Skill resources\n\n${sections.join('\n\n')}\n`,
  };
}

/**
 * Every skill a package root ships, sorted by name.
 * @param root - absolute package root.
 * @returns skill definitions; empty when the package ships no `resources/`.
 */
export function readPackage(root) {
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
      const skill = renderSkill(file);
      return skill === undefined ? [] : [skill];
    });
}
