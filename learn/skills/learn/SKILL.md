---
name: learn
description: Start adaptive learning from a topic, materials, error items, or profile goals; prefer applicable subject packages, fall back to general-task teaching when none apply, and support different education stages.
disable-model-invocation: true
---

# Learn

Load `learn-core` and `learn-data` (only the ones not yet loaded this session; already loaded ones are reused per `learn-core`'s "Load Once, Reuse After"), then read and execute `references/session-lifecycle.md` from `learn-data`. A new session uses `entry_point: learn` and initial `mode: learn`; an existing session resumes according to the lifecycle.

## Choose a Target

Resolve the target using the lifecycle's Resolve Target (`references/target-parsing.md` in `learn-data`, plus the target classification in the resolved `teaching.core_skill` subject contract). This entry adds one rule: after an empty-argument `/learn`, if the student's first reply gives a topic, material, or path, adopt it as the target; only replies such as "OK" or "let's start" use the lifecycle's fallback. The lifecycle's restricted math cold opening presents recommendations before any profile target is auto-applied; pending tasks and pending candidates are restored first.

When the student does not know what to learn, asks what to learn next, or wants to switch but has no specific target, load `learn-recommend` through the lifecycle recommendation gate. Reuse the current subject records to produce candidates, teach only after one is chosen, and do not directly apply the first profile item.

Entry examples: `/learn 教我异分母分数加法，我没学过`, `/learn 我想自己推平行四边形面积公式`, `/learn 给我三道分数加法题`, and `/learn 今天学什么`. The current subject decides how to begin; this entry does not select a mathematical method. A bare `/learn` resumes pending work before considering new content. `/learn-start` still activates identity and subject; do not assume a temporary teaching request made there was persisted for a later empty command.

## Subject Routing

Reuse teaching per `references/teaching-resolver.md` in `learn-data`; Route And Record loads `teaching.session_skill` (the selected specialist session or general-task teaching when the package is missing or does not fit). Target classification also reads that implementation's core contract; do not guess package names. Ordinary teaching, additional actions, and transfer recovery all enter the current teaching owner first; general support does not create a separate loop.

## Continue

The base menu for ordinary learning keeps `ui.stage.continue`, `ui.stage.feynman`, and `ui.stage.end`, and adds `ui.stage.switch_content`. Continue hands off to the current subject to advance; Feynman loads `learn-feynman`; End hands off to lifecycle finalize; Switch content loads `learn-recommend`, which only recommends and does not switch the task. Resolve all labels through the active UI locale (`learn-data` `references/ui-locale.md`). Merge and display the `stage_options` returned by the subject per `references/next-step.md` in `learn-data`; additional actions go back to the subject that declared them.
