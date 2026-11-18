# Development and validation

[English](development.md) | [中文](development.zh.md)

## Skill sources and resources

Skill text lives in `skills/`; installation reads `resources/`, rendered from it by `node scripts/build-resources.mjs` at the repository root. This package ships `resources/`, while `skills/` is for reading and maintenance. After changing a skill, run the build before committing — otherwise the contract tests report `resources/` diverging from the sources.

`resources/` is generated: never edit it by hand. A resource inlines each reference it cites, which is why English resources also carry the shared `learn/` references its skills cite.

## Validation

```bash
node scripts/check-skills.mjs                      # static skill check: names, frontmatter, links, stale commands
node --test scripts/skill-contracts.test.mjs       # contracts: dispatch, evidence, delivery, catalog keys
node scripts/build-resources.mjs                   # then confirm no diff under resources/
git diff --check                                   # whitespace and line endings
```

These are static checks and do not replace real conversation validation.

## Teaching scenarios

[Teaching scenarios](../tests/teaching-scenarios.md) is the behavior list that needs a real run: prepare a valid student snapshot, send one student message at a time, and judge the reply and the evidence it would record. It is read by a human or replayed by a model; passing it is not a claim that a scenario has been executed automatically.

The scenarios are organized by comprehension and story, dialogue and expression, and tasks, vocabulary and review, with the expected behavior and the failure signal in adjacent columns.
