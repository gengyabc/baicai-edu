# Development and validation

[English](development.md) | [中文](development.zh.md)

## Skill sources and resources

Skill text lives in `skills/`; installation reads `resources/`, rendered from it by `node scripts/build-resources.mjs` at the repository root (this package ships `resources/`, while `skills/` is for reading and maintenance). After changing a skill, run `node scripts/build-resources.mjs` before committing — otherwise `publish.mjs check` and the contract tests report `resources/` diverging from the sources.

`resources/` is generated: never edit it by hand. `files` in `package.json` publishes only what runs (`cordis.patch.yml`, `skill-provider.mjs`, `lib`, `build.json`, `resources`, `skills`, `README.md`, `LICENSE`); this `docs/` and `tests/` are repo-only reading material.

## Validation

```bash
node scripts/check-skills.mjs
node --test scripts/*.test.mjs
```

These are static checks and do not replace real conversation validation; the behavior list that needs an actual run is in [conversation acceptance scenarios](acceptance-scenarios.md).
