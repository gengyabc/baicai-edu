---
name: math-low-practice
description: Leveled math practice. Use to confirm error patterns with similar items, explain causes by contrast, stabilize independent calculation, consolidate or revisit taught skills, add practice on request, or connect already-mastered knowledge.
resources: math-teaching-core.md targeted-practice-rules.md math-segment-fields.md
---

# Math Practice

## Start and Input

Load `math-low-core` and follow its "Start and Input". Also read `math-low-core`'s `references/math-teaching-core.md` and `references/targeted-practice-rules.md` (local design additions; the shared evidence contract it names owns purpose, problem count, per-problem adjustment, and completion conditions).

Focus on `profile.current_levels`, `profile.preferences`, `self_report`, `error_history`, and the extracted analysis in the snapshot, `learning_state.active_domain` / `priority_targets`, `learning_memory.recent_error_patterns`, and any existing `math-low-diagnose` conclusions. Interests do not drive problem choice; bridge only per the personalization reference.

## Execute

1. **Set the starting point**: reuse diagnosis; if you only need to check for repeated errors, tier 1 suffices; if you need to estimate a stage or clarify an unclear error cause, return `continue_diagnose` with the evidence you have and let session decide the next action. Completion condition: one pattern to test/consolidate, without re-checking settled conclusions.
2. **Choose the purpose**: per the practice reference, choose one of the four Tiers or non-Tier Consolidate / Revisit and design one problem. Completion condition: purpose and problem match the reference.
3. **Advance problem by problem**: pose, wait, confirm, and adjust per the reference. Completion condition: the current problem awaits an answer, or existing evidence decides whether to continue, re-pick the purpose, or return; later confirmation waits for a reply.
4. **Wrap up**: when the reference's stop or completion condition is met, or the sticking point needs relocating, wrap up per the reference and return `return_teaching`; when diagnosis is needed, return `continue_diagnose` and let session decide the next action. Completion condition: evidence is separated from unknowns.

## Return

Dispatched only by `math-low-session`; per its "Central Dispatch Contract", return only evidence and one signal, without producing a separate segment or writing the profile. When the current problem awaits an answer, return `await_student` with the current problem, step, and pending question; return `continue_diagnose` when diagnosis is needed, `return_teaching` when practice wraps up, and `request_end` on an explicit end. This leaf does no cross-skill routing.

Read `math-low-core`'s `references/math-segment-fields.md` for session to merge:

- Branch metadata is `subject: math`, `submode: practice`; `mode` is inherited from the caller, and `source` is set uniformly by session from the target source.
- `strategy_summary` separates contrast judgments from independent calculation and records the observed evidence.
- `next_step_candidate` gives a concrete suggestion to continue/re-pick the purpose or add local support; `recommended_targets` are neighboring targets, and `feynman_handoff_recommended` is filled as actually needed.

The student sees only the explanation, the current problem, confirming follow-ups, and the relationships already shown.

This skill's base directory holds every file it names: a `references/<name>.md` path below is the installed `<name>.md` beside that base directory, because an installed skill keeps no `references/` folder for prose. Locale catalogs do keep theirs, at `references/locales/<locale>.json`.
