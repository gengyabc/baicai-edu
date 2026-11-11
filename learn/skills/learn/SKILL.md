---
name: learn
description: Start adaptive learning from a topic, materials, error items, or profile goals; prefer applicable subject packages, fall back to general-task teaching when none apply, and support different education stages.
disable-model-invocation: true
---

# Learn

Load `learn-core` and `learn-data` if not already loaded, then read and execute `references/session-lifecycle.md` from `learn-data`. A new session uses `entry_point: learn` and initial `mode: learn`; an existing session resumes according to the lifecycle.

## Choose a Target

Resolve the target using the lifecycle's Resolve Target (`references/target-parsing.md` in `learn-data`, plus the target classification in the resolved `teaching.core_skill` subject contract). This entry adds one rule: after an empty-argument `/learn`, if the student's first reply gives a topic, material, or path, adopt it as the target; only replies such as "OK" or "let's start" fall back to choosing from the profile.

When the student does not know what to learn, asks what to learn next, or wants to switch but has no specific target, load `learn-recommend` through the lifecycle recommendation gate. Reuse the current subject records to produce candidates, teach only after one is chosen, and do not directly apply the first profile item.

## Subject Routing

Reuse teaching per `references/teaching-resolver.md` in `learn-data`; Route And Record loads `teaching.session_skill` (the selected specialist session or general-task teaching when the package is missing or does not fit). Target classification also reads that implementation's core contract; do not guess package names. Ordinary teaching, additional actions, and transfer recovery all enter the current teaching owner first; general support does not create a separate loop.

## Continue

The base menu for ordinary learning keeps `ui.stage.continue`, `ui.stage.feynman`, and `ui.stage.end`, and adds `ui.stage.switch_content`. Continue hands off to the current subject to advance; Feynman loads `learn-feynman`; End hands off to lifecycle finalize; Switch content loads `learn-recommend`, which only recommends and does not switch the task. Resolve all labels through the active UI locale (`learn-data` `references/ui-locale.md`). Merge and display the `stage_options` returned by the subject per `references/next-step.md` in `learn-data`; additional actions go back to the subject that declared them.
