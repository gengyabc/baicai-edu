# Skills, method dispatch, and rule ownership

[English](skills.md) | [中文](skills.zh.md)

The package ships eleven internal skills in two lanes: `english-session` runs the teaching mainline, `english-core` holds the shared rules, and nine method skills carry one theory and its practice each. This page states the roster and who owns each rule, so no rule is written twice.

## Roster

| Skill | Theory | Role |
|---|---|---|
| `english-session` | — | Mainline: set focus, pick one method, advance one action, return the single segment; learn and feynman modes |
| `english-core` | — | Shared rules, method selection table, input adaptation, scaffolding, subject contract, evidence mapping |
| `child-english-coach` | adaptive language teaching | Cross-turn plan and method suggestions for free play; it does not dispatch or record |
| `comprehensible-input` | Krashen input hypothesis | Carry a little new language in familiar context |
| `interaction-hypothesis` | Long interaction hypothesis | Negotiated meaning: clarify, confirm, repair |
| `output-hypothesis` | Swain output hypothesis | Production attempts; accept half-words and half-sentences |
| `scaffolding-zpd` | Vygotsky zone of proximal development | Graded hints, one level at a time, then fade |
| `task-based-language-learning` | Task-based language teaching | English in service of a concrete outcome |
| `usage-based-language-learning` | Tomasello / Ellis usage-based learning | One function, many contents and scenes |
| `spaced-retrieval` | Retrieval practice and spacing | Recall before the answer; separate independent from hinted |
| `child-news-reader` | Comprehensible input, interaction, extensive reading | Source verification, age filtering, leveled rewriting, interactive reading |

## Method dispatch

Only `english-session` dispatches method skills: one main method per turn, plus a supporting method when it is genuinely needed. The single method table lives in [english-teaching-core](../skills/english-core/references/english-teaching-core.md) and is chosen from `target_context.type` plus the current observations; a news target always means `child-news-reader`.

A method skill provides only its theory, its practice and its material and evidence suggestions. It never loads a sibling method, produces its own `session_segment`, or writes student data, and it reads the shared difficulty, hint and evidence standards from `english-core` instead of writing a second set. When one piece of material has several angles, the session chains them per [english-turn-arc](../skills/english-core/references/english-turn-arc.md) and executes only the first this turn. The coach's cross-turn plan and auxiliary suggestions are weighed by the session as well; the whole method set is never expanded automatically.

## Invocation

Every skill in this package sets `user-invocable: false`, so none of them occupies a `/` entry and none is listed in the command menu. This is a scheduling convention the model follows, not runtime isolation.

English is entered from the shared entry: `/learn-start` offers English in its subject table, and `/learn` or `/learn-feynman` routes on `subject: english` to `english-session`. The entry has already checked the session, student and snapshot before any skill here loads, which is why no skill in this package rechecks them.

## Rule ownership

Each rule has exactly one file. Start by looking up the owner here, then edit only that file.

- `english-core`: the shared rules and the `## Subject contract` section; the entry reads the contract roles from it as well.
- [english-teaching-core](../skills/english-core/references/english-teaching-core.md): the only method selection table, plus the feedback and correction rules.
- [english-input-adaptation](../skills/english-core/references/english-input-adaptation.md): language load, material length, and the adjustment after comprehension.
- [english-scaffolding](../skills/english-core/references/english-scaffolding.md): the only hint ladder; one level of support per stuck point.
- [english-turn-arc](../skills/english-core/references/english-turn-arc.md): how 2–4 angles of one material are spaced across turns.
- [english-segment-fields](../skills/english-core/references/english-segment-fields.md): the only learning-evidence mapping; one record per turn.
- [english-target](../skills/english-core/references/english-target.md): target type and intent classification, including an English target after a file handoff.
- [english-grade-defaults](../skills/english-core/references/english-grade-defaults.md): initial `active_domain`, initial levels, default tasks and progression order.
- [english-profile-fields](../skills/english-core/references/english-profile-fields.md): preference keys, level keys and the subject profile increments.
- [english-error-labels](../skills/english-core/references/english-error-labels.md): the `english:` error labels and the `domain` values.
- [english-personalization](../skills/english-core/references/english-personalization.md): how interests, experiences and easy/hard topics are used.
- [learning-recommendations](../skills/english-core/references/learning-recommendations.md): the "Learning recommendations" contract role; what is recommended and in which order.
- `english-core/references/locales/<locale>.json`: the subject's UI catalog for `/learn-start` options and stage options.
- [child-news-reader](../skills/child-news-reader/SKILL.md): source tiers, verification, age filtering, rewriting and image rules for news.
- Shared owners: the session loop, confirmation and tone come from `learn-core`; the JSON protocol, snapshot, log and finalize come from `learn-data`; file parsing comes from `learn-errors` through the entry only.

Before editing skill text, read the repository's [skill maintenance](<../../docs/agents/skill-maintenance.md>) guide.
