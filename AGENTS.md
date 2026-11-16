# Agent instructions

## Working rules

- Edit skill sources under `<package>/skills/`; after changing a skill or reference, run `node scripts/build-resources.mjs` and include the regenerated `resources/` changes. Installed skills read `resources/`, not the source tree.
- Keep student data out of commits and student-facing raw JSON dumps: `outputs/` holds generated state; `data/` holds originals. Originals under `data/.../raw/` are read-only except for backed-up renames under the `learn-errors` protocol. Read `learn-data` before student-data operations; cleanup authorization belongs to `learn-clean`.
- Keep teaching behavior in the owning skill or shared contract. This file routes repository work; it is not a second source of teaching rules.

## Read by task

Read the linked material before working on the matching area; unrelated tasks do not need it.

| Task | Read first |
| --- | --- |
| Edit skills, invocation policy, teaching routing, or data protocols | [Skill maintenance](<docs/agents/skill-maintenance.md>); follow its topic-specific pointers |
| Install, publish, change package dependencies, or recover disabled bundles | [Installation](<docs/installation.md>) |
| Change skill registration or resource rendering | [Single-provider decision](<docs/adr/0004-single-skill-provider.md>) |
| Explore domain concepts or change architecture | [Domain documentation conventions](<docs/agents/domain.md>), then relevant ADRs |
| Create or update local specs and issues | [Issue tracker](<docs/agents/issue-tracker.md>) |
| Triage issues | [Triage labels](<docs/agents/triage-labels.md>) |

## Validation

- Skill changes: `node scripts/check-skills.mjs` and `node --test scripts/skill-contracts.test.mjs` after rebuilding resources; also run tests covering the changed behavior.
- Other changes: use the affected component's checks; repository-wide validation commands are in [README](<README.md#验证>).
