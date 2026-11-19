---
name: learn-feynman
description: Feynman learning. Use when the student wants to be the little teacher, explain to the AI, check whether their explanation is clear, or switch from ordinary learning to student-led talk; the AI plays a same-age listener.
resources: llm-safety-boundaries.md feynman-mode.md feynman-skill-whitelist.md session-lifecycle.md target-parsing.md teaching-resolver.md
resource-loading: on-demand
---

# Feynman Learning

Load or reuse `learn-core` and `learn-data` per "Load Once, Reuse After". Read named references from the returned base of their owner. On a crisis cue, apply `learn-core`'s `references/llm-safety-boundaries.md` first. Before starting, read `learn-core`'s `references/feynman-mode.md` and `references/feynman-skill-whitelist.md` for role, skill confirmation, and deliberate mistakes.

Read and execute `references/session-lifecycle.md` from `learn-data`:

- Active session exists: run its step 4, "explicitly act as the little teacher".
- No active session: a new session uses `entry_point: learn-feynman` and `mode: feynman`; an unfinished log is resumed or saved per the lifecycle.

## Choose a Target

Choose only when a new target is needed. Priority: the text after `/learn-feynman` or a topic the student says they want to explain, then `current_state.active_focus`, then the profile candidate order from the lifecycle's Resolve Target. Resolve an explicit new target per the lifecycle's Resolve Target (`references/target-parsing.md` in `learn-data`, plus the target classification in the resolved `teaching.core_skill` subject contract), reuse teaching per `references/teaching-resolver.md` in `learn-data`, and route with `mode: feynman` to `teaching.session_skill` (the selected specialist session or the general path when the package is missing or does not fit); read target classification from the same implementation's core contract. Feynman takes priority over subject transfer. When the current session has no new target, keep the focus and target_context. If subject-required material is missing, ask one specific question and do not guess the original text.

## Turn

The subject skill returns a reply and one segment, with both `mode` and `submode` set to `feynman`. Skill evidence and errors are recorded for this turn only and written back by finalize. Crisis signals take priority: stop teaching per the safety flow in `learn-core`.
