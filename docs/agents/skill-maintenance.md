# Skill maintenance

Use this guide when changing education skills. It locates the authoritative rules; it does not replace the installed skills' runtime protocols.

## Authoring and invocation

- Before editing skill text or references, read [self-containment rules](<skill-self-contained.md>): installed rules must work without repository-only files or external provenance pages. Keep research and citations in maintainer docs.
- Preserve the invocation boundary: `learn-start`, `learn`, and `learn-clean` are user-only (`disable-model-invocation: true`); `learn-feynman`, `learn-profile`, and `learn-save` also accept conversational intent. Internal skills use `user-invocable: false` while remaining model-invocable: DSH has no separate skill-to-skill channel. The static checker enforces these policies.
- Address skills by name. Follow the owning skill's references rather than copying its rules into another skill or repository instructions.
- Math skill/reference filenames use English ASCII kebab-case; preserve canonical names such as `SKILL.md` and locale identifiers such as `zh-CN.json`. Keep schema keys stable in English and localize student-facing copy separately. This naming convention does not authorize renaming student originals or changing learning-record paths.
- For provider, cross-package references, or rendering changes, read [ADR-0004](<../adr/0004-single-skill-provider.md>). For dependency, packaging, or installation changes, read [installation](<../installation.md>).

## Locate the owning protocol

Read only the rows matching the behavior being changed, together with the affected skill's own instructions and references.

| Change | Authoritative entry points |
| --- | --- |
| Cross-subject teaching, scaffolding, process choices versus thinking prompts | [learn-core](<../../learn/skills/learn-core/SKILL.md>) |
| Subject/provider selection, initialization, grade-band defaults, unfinished-task restore, legacy names, or general fallback | [Teaching resolver](<../../learn/skills/learn-data/references/teaching-resolver.md>) |
| Student state, personalization, per-turn writes, finalize, or replay/idempotency | [learn-data](<../../learn/skills/learn-data/SKILL.md>), then its scenario-specific references |
| Cleanup scopes and confirmation | [learn-clean](<../../learn/skills/learn-clean/SKILL.md>), including its [high-risk branch](<../../learn/skills/learn-clean/references/high-risk-deletion.md>) |
| Materials, original-file handling, or archiving | [learn-errors](<../../learn/skills/learn-errors/SKILL.md>) |
| Handwritten or photographed work | [learn-read-image](<../../learn/skills/learn-read-image/SKILL.md>) and [ADR-0002](<../adr/0002-handwritten-image-reading.md>); math-specific contracts belong to `math-common` |
| Recommendation triggers, pending choices, or recommendation pedagogy | [learn-recommend](<../../learn/skills/learn-recommend/SKILL.md>) and the resolved subject contract |
| Process UI language and locale catalogs | [UI locale protocol](<../../learn/skills/learn-data/references/ui-locale.md>) |
| Shared versus band-specific math behavior | [math-common](<../../math-common/skills/math-common/SKILL.md>) and [ADR-0001](<../adr/0001-math-shared-contracts.md>); teaching implementations stay in the owning band |
| Learning support, support-only evidence, or neutral support events | [learn-support](<../../learn/skills/learn-support/SKILL.md>), [session schema](<../../learn/skills/learn-data/references/session-schema.md>), and [finalize protocol](<../../learn/skills/learn-data/references/finalize-session.md>) |

For package dependencies, skill calls, and scenario sequences, consult the [skill map](<../skill-map/call-graph.md>). For upper-primary method provenance, consult [method background](<../../math-primary-high/docs/methods.md>); it is maintainer material, not installed teaching rules.

## Finish a skill change

1. Update the owning source and affected regression tests; keep shared contracts authoritative rather than duplicating them across subjects or bands.
2. Run `node scripts/build-resources.mjs` and include regenerated resources with the source change. A locale catalog under a skill's `references/locales/` is copied to `resources/references/locales/` rather than inlined, so add a catalog only where one skill of the package owns it.
3. Run `node scripts/check-skills.mjs`, `node --test scripts/skill-contracts.test.mjs`, and the tests covering the changed behavior. Report failures rather than treating a successful build as protocol verification.

Installation checks stay in the [installation guide](<../installation.md>); publishing, `resources/` rendering and post-publish verification in the [publishing guide](<../publishing.md>).
