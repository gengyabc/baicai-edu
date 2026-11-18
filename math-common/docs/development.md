# Development and validation

[English](development.md) | [中文](development.zh.md)

## Skill sources and resources

Rule text lives in `skills/math-common/references/`; installation reads `resources/`, rendered from it by `node scripts/build-resources.mjs` at the repository root. Run the build after changing a reference and commit the regenerated `resources/` — otherwise the contract tests report the two diverging. `resources/` is generated: never edit it by hand.

This package also renders `learn/` and `english/` skill resources, because a band may cite them from a math branch.

## Validation

```bash
node scripts/check-skills.mjs                 # static skill check: names, frontmatter, links, stale commands
node --test scripts/*.test.mjs                # contracts: ownership, dispatch, evidence, catalog keys
node scripts/build-resources.mjs              # then confirm no diff under resources/
git diff --check                              # whitespace and line endings
```

Static checks do not replace conversation validation.

## Scenarios

[math-common/tests/teaching-scenarios.md](../tests/teaching-scenarios.md) is the shared behavior list that needs a real run: prepare a valid student snapshot, send one student message at a time, and judge the reply and the evidence it would record. The reading layer's scenarios are in [learn/tests/image-reading-scenarios.md](../../learn/tests/image-reading-scenarios.md). Both files are read by a human or replayed by a model; passing a scenario is not a claim that it was executed.

No test needs exempting for these docs: `check-skills.mjs` already treats `docs` as non-shipped, so the pairs may link concrete reference files, and the `files` manifest stays unchanged — `docs/` and `tests/` are repo-only, which is deliberate: they carry maintainer material, not installed rules.

The README and this directory follow [documentation layout](<../../docs/agents/doc-layout.md>).
