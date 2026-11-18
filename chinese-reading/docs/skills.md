# Skills, routing, and rule ownership

[English](skills.md) | [中文](skills.zh.md)

The package ships six internal skills: `chinese-session` routes one turn, four teaching skills run reading, writing, read-write transfer and task generation, and `chinese-core` holds the rules they share. This page states the roster, who dispatches what, and which file owns each rule, so no rule is written twice.

## Roster

| Skill | Role |
|---|---|
| `chinese-core` | Rule base: the gate and inputs, the conditional read table, the subject contract, the internal action table and the per-turn delivery rules. It produces no student-visible reply and writes no record. |
| `chinese-session` | Router: reads `target_context`, `mode` and `focus`, picks one child skill, hands the context over. It does no teaching and returns no segment. |
| `chinese-reading-session` | Reading teaching and diagnosis. `task_mode` is `learn` for a passage without answers, `diagnose` for existing answers, `feynman` when the student explains the evidence. |
| `chinese-writing-session` | Writing. `task_mode` is `start` (prompt, no draft), `revise` (local upgrades), `assess` (rubric tier and the three places worth changing), `feynman`. |
| `chinese-read-write-transfer` | Read-write transfer: extract 1–3 techniques with textual evidence, set a new topic, write alongside, then assess with the rubric — at most two rounds. |
| `chinese-generate-tasks` | Reading and writing items matched to the grade band, with reference answers, item intent and scoring rules. It does not then teach, grade or ghostwrite. |

## Routing

Only `chinese-session` dispatches, using the route table in its own `SKILL.md`; `mode` is passed through unchanged, and `task_mode` is a branch inside the child skill that is never written back to the context. Two gates run before teaching starts:

- A student who does not know what to learn, asks what to study, or picks "换个内容" goes to `learn-recommend` first. That turn stops at the choice, produces no segment and changes no focus; candidates and their order come from [learning-recommendations](../skills/chinese-core/references/learning-recommendations.md).
- An ordinary reading or writing exit may return `stage_options` (`label: 写一写`, `action: transfer`). Choosing it records the transfer state, and the next turn enters `chinese-read-write-transfer` after its target is normalized.

Target types and intents are classified only by [chinese-target](../skills/chinese-core/references/chinese-target.md). A file the entry has processed is classified from the extracted material, without re-reading the raw path or asking for a self-diagnosis again.

## Rule ownership

Each rule has exactly one file. Start by looking up the owner here, then edit only that file.

- `chinese-core/SKILL.md`: the gate and inputs, the conditional read table, the subject contract, the internal action table, and the delivery rules every child skill follows.
- [chinese-reading-core](../skills/chinese-core/references/chinese-reading-core.md): the deep-reading methods, the diagnosis flow and the common reading problems.
- [chinese-writing-core](../skills/chinese-core/references/chinese-writing-core.md): writing principles, the six circles, the upgrade rules, and technique extraction for transfer.
- [chinese-feedback-core](../skills/chinese-core/references/chinese-feedback-core.md): the feedback flow and long-term management.
- [chinese-task-generation](../skills/chinese-core/references/chinese-task-generation.md): reading and writing item generation, its checklists and its grade-band scaffolds.
- [chinese-assessment-rubric](../skills/chinese-core/references/chinese-assessment-rubric.md): the six-step rubric, its tiers, output shape and transfer branch.
- [chinese-error-labels](../skills/chinese-core/references/chinese-error-labels.md): the `reading:` / `writing:` labels, how one is chosen, and how a diagnosis is stored.
- [chinese-target](../skills/chinese-core/references/chinese-target.md): target type and intent, including a target classified from a processed file.
- [chinese-grade-defaults](../skills/chinese-core/references/chinese-grade-defaults.md): initial `active_domain`, initial levels and the default item types per band.
- [chinese-profile-fields](../skills/chinese-core/references/chinese-profile-fields.md): preference keys, level keys and the subject profile increments.
- [chinese-personalization](../skills/chinese-core/references/chinese-personalization.md): how interests, preferences and easy/hard topics are used in each domain.
- [chinese-non-response](../skills/chinese-core/references/chinese-non-response.md): the Chinese examples for a stuck, short or silent turn.
- [experience-gap-bridging](../skills/chinese-core/references/experience-gap-bridging.md): the bridging action, its inputs, its return fields and when not to use it.
- [learning-recommendations](../skills/chinese-core/references/learning-recommendations.md): the "Learning recommendations" contract role.
- Shared owners: the session loop, confirmation, tone and end signals come from `learn-core`; the JSON protocol, snapshot, log and finalize come from `learn-data`; file parsing comes from `learn-errors` through the entry only.

Before editing skill text, read the repository's [skill maintenance](<../../docs/agents/skill-maintenance.md>) guide.
