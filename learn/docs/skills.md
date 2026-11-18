# Skills and rule ownership

[English](skills.md) | [中文](skills.zh.md)

The package skills come in two lanes: entries only route and talk to the user; internal skills hold the cross-subject teaching, student-data and material protocols. This page states each role and the single owner of every rule, so no rule is written twice.

## Shared internal skills

- `learn-core`: Chinese tone, student-centered pacing, grade fit, difficulty adjustment, on-demand confirmation, handling a stalled guide, end signals, persona, Feynman rules.
- `learn-data`: the `outputs/students/` JSON protocol, snapshots, profile creation, write-back, finalize.
- `learn-errors`: parsing user-dropped files, read-only `data/.../raw/`, backups, extracted writes, `error_history` updates; image reading goes to `learn-read-image`.
- `learn-read-image`: faithful transcription of user-supplied images (handwriting, scans, screenshots, digital ink), original archiving, `extracted` read records and hand-off; loaded only when an image exists, never diagnoses and never writes the profile.
- `learn-recommend`: recommends concrete small goals from the current subject record, marking the preferred pick with a reason in the active UI language; content, difficulty and ordering come from the subject contract, and the general path may explore cross-domain goals on student request.
- `learn-general-core` / `learn-general-session`: the general-task contract and the actual teaching; real subject identity is unchanged and records never auto-upgrade to a specialist level.
- `learn-support`: on-demand method for value, confidence, autonomy, study strategy and persistence; natural replies, listening, correction, ordinary topics, open invitations, refusal and exit are maintained only by `references/supportive-conversation.md`, and `learn-core` owns when to position the support. Theory and stage/context material are read on demand; there is no fixed motivation questionnaire and no second teaching scheduler.

## Invocation tiers

Entries split into two tiers: `learn-start`, `learn` and `learn-clean` set `disable-model-invocation: true`, so only the user can type them and they stay out of the model catalog; `learn-feynman`, `learn-profile` and `learn-save` keep the model entry and can load inside a conversation ("let me explain it to you", "look at my profile", "save this"). The internal skills above stay model-loadable and are hidden from the `/` menu only through `user-invocable: false`.

`/teach` is taken by the machine-global `teach` skill, so the Feynman entry is `/learn-feynman`.

## Rule ownership

- `learn-core`: cross-subject teaching behavior; grade defaults, difficulty adjustment, Feynman roles and allow-lists are defined by its own references.
- `learn-data/references/session-lifecycle.md`: the one session loop for `/learn` and `/learn-feynman`. A mode switch keeps the log and `entry_point`; it does not open a new session.
- [Teaching resolver](../skills/learn-data/references/teaching-resolver.md) and [subject contract](../skills/learn-data/references/subject-contract.md): unified start, initialization, target classification, recommendation and recovery; a specialist package is located by the resolved core/session skill names, and a missing package falls back to the general path with the same interface. Selectable subjects are maintained only in the `/learn-start` subject table; any other goal can be described directly.
- `learn-data/references/session-schema.md`: the per-turn log and the segment shell.
- `learn-data/references/profile-schema.md`: profile, memory, state, error-item and milestone templates, read at profile creation and finalize; preference keys, level, domains, tags and target classification are defined by subject packages.
- `learn-core/references/prestart-settings-interpretation.md`: what personalization must not override, plus privacy, usage and self-assessment priority. Field paths belong to `profile-schema`; how a subject uses them belongs to its package.
- `learn-core/references/difficulty-adjustment.md`: how a request to lower or raise difficulty is judged, adjusted within the turn, logged and carried forward; storage fields belong to `profile-schema`.
- `learn-data/references/finalize-session.md`: the single save flow; retention policy belongs to `session-retention.md`.
- `learn-read-image/references/reading.md`, `record.md`, `handoff.md`: the only text for image reading, original/transcript records and hand-off fields; triggers are maintained by `learn-core`'s condition lines and `learn-errors`' image branch, and the reading layer itself never diagnoses.
- Subject references: the only text for methods, rubrics, tags and item types; the subject SKILL keeps routing, execution steps and its own output.

Before editing skill text, read the repository's [skill maintenance](<../../docs/agents/skill-maintenance.md>) guide.
