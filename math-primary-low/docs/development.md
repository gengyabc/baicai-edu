# Development and validation

[English](development.md) | [中文](development.zh.md)

## Skill sources and resources

Skill text lives in `skills/`; installation reads `resources/`, rendered from it by `node scripts/build-resources.mjs` at the repository root. This package ships `resources/`, while `skills/` is for reading and maintenance. After changing a skill, run the build before committing — otherwise the contract tests report `resources/` diverging from the sources. Never edit `resources/` by hand: a resource inlines each reference it cites, including the shared `math-common` and `learn/` references this band points at.

## Validation

```bash
node scripts/check-skills.mjs                  # static skill check: names, frontmatter, links, stale commands
node --test scripts/skill-contracts.test.mjs   # contracts: dispatch, evidence, board authority, catalog keys
node scripts/build-resources.mjs               # then confirm no diff under resources/
git diff --check                               # whitespace and line endings
```

These are static checks and do not replace a real conversation.

## Teaching scenarios

[Teaching scenarios](../tests/teaching-scenarios.md) is the behavior list that needs a real run: prepare a valid student snapshot, send one student message at a time, and judge the reply and the evidence it would record. It is read by a human or replayed by a model; passing a scenario is not a claim that it was executed.

A change to a shared contract in `baicai-edu-math` replays both bands' common scenarios and their differing scenarios; the common ones are in [math-common/tests/teaching-scenarios.md](../../math-common/tests/teaching-scenarios.md).

## These docs

`docs/` is maintainer reading and is not installed, so the pairs may link concrete reference files without a check exemption. Keep each page and its Chinese pair at the same length, and keep one authoritative copy of each rule: this directory summarizes and points at the skill file that owns the text. The layout follows [documentation layout](<../../docs/agents/doc-layout.md>).
