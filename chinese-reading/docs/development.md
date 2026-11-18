# Development and validation

[English](development.md) | [中文](development.zh.md)

## Skill sources and resources

Skill text lives in `skills/`; installation reads `resources/`, rendered from it by `node scripts/build-resources.mjs` at the repository root. This package ships `resources/`, while `skills/` is for reading and maintenance. After changing a skill, run the build before committing — otherwise the contract test reports `resources/` diverging from the sources.

`resources/` is generated: never edit it by hand. A resource inlines each reference it cites, which is why Chinese resources also carry the shared `learn/` references its skills cite.

## Validation

```bash
node scripts/check-skills.mjs                      # static skill check: names, frontmatter, links, stale commands
node --test scripts/skill-contracts.test.mjs       # contracts: routing, evidence, delivery, profile fields
node scripts/build-resources.mjs                   # then confirm no diff under resources/
git diff --check                                   # whitespace and line endings
```

The contract tests that cover this package check that the sub-skills inherit the gate and shared reads from `chinese-core`, that experience bridging is reached only through its internal action table, that one state, gate and file handoff has one owner, and that each skill still names its `session_segment` fields explicitly. These are static checks and do not replace real conversation validation.

## Changing the docs

`docs/` is maintainer reading and is not installed. Keep each page and its Chinese pair at the same length, and keep one authoritative copy of every rule: this directory summarizes and points at the skill file that owns the text. Instructions for the README and docs split: [documentation layout](<../../docs/agents/doc-layout.md>).
