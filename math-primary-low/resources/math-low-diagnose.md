---
name: math-low-diagnose
description: Math strategy diagnosis and error triage. Use when the math-goal starting point is unclear, two guided turns stall, the student submits error items, practice needs error-pattern ID, or self-report conflicts with performance.
resources: math-teaching-core.md strategy-diagnosis-rules.md targeted-practice-rules.md problem-design.md math-segment-fields.md
---

# Math Diagnosis

## Start and Input

Load `math-low-core` and follow its "Start and Input". Also read `math-low-core`'s `references/math-teaching-core.md` and `references/strategy-diagnosis-rules.md` (unified observation, error causes, conservative estimates, and confidence); when generating diagnostic practice, also read `references/targeted-practice-rules.md`. Choose diagnostic format by the goal per `references/problem-design.md`; use stories when quantity meaning matters, without unrelated reading load. Interests do not enter the problem stem, and bridging conditions follow the personalization reference.

Focus on `profile.current_levels`, `error_history`, `learning_state.priority_targets`, and the skills already confirmed in memory. With processed-file `material_refs`, use error-item triage; otherwise use strategy diagnosis.

## A. Strategy Diagnosis

1. Per the diagnosis reference, locate the current quantity role and one strategy to clarify; for fractions/decimals use their corresponding observation items. Reuse known explanations, leave untouched items unknown, and do not pose problems item by item to fill a table.
2. Wait for the student to show their reasoning; separate relationship understanding, calculation, and expression, and adjust support to the new reply; do not judge ability by whether the student adopted the teaching assistant's method.
3. Per the Conservative Conclusion rule, give an estimate within the scope of the current task and one `next_target`. If evidence is insufficient, you may end diagnosis, keeping low confidence and the original stage, and gather more evidence from tasks the student can do independently or same-structure low-load tasks.

Completion condition: the conclusion is traceable, unknowns/low confidence are explicit, and there is one actionable small goal.

## B. Error-Item Triage

1. One item at a time; first listen to the student's understanding or calculation on the current problem; if self-report already exists, continue directly, and without actual error evidence do not first ask "where did you go wrong".
2. Read the extracted analysis and record references already processed by the entry.
3. Check self-report against steps, and use history to tell one-off from stable patterns.
4. Form an evidence-based conclusion per the diagnosis reference; return `continue_practice` if consolidation is needed and `return_teaching` to continue teaching, and let session decide the next action.

Completion condition: the analysis of the current problem is traceable, self-report is checked, and key steps support the error cause and next branch; with insufficient evidence, do not switch hastily.

## Return

Dispatched only by `math-low-session`; per its "Central Dispatch Contract", return evidence and one signal, without producing a separate segment or writing the profile. When the student still needs to reason, return `await_student`, keeping the current problem, step, and pending question; once a conclusion is formed, return `continue_practice` or `return_teaching`, and `request_end` on an explicit end. Only session decides the next action; this leaf does no cross-skill routing.

| Field | Contract |
|---|---|
| `current_levels` | Partial update of arithmetic / multi-digit / fraction strategy stages, only fields with evidence this time; keys and values follow the diagnosis reference |
| `strategy_summary` | The student's actual reasoning |
| `strengths` / `difficulties` | Evidence-backed strengths/difficulties, including how guided understanding went |
| `next_target` | A concrete small goal |
| `diagnosis` | With error evidence, fill `domain`, a specific math `label`, and `evidence` |
| `confidence` | Per the diagnosis reference |

Before merging, read `math-low-core`'s `references/math-segment-fields.md`: `next_target` → `next_step_candidate`; `confidence` is diagnosis metadata only.

The student-visible wrap-up is one sentence on the core issue and one sentence on the next step.

This skill's base directory holds every file it names: a `references/<name>.md` path below is the installed `<name>.md` beside that base directory, because an installed skill keeps no `references/` folder for prose. Locale catalogs do keep theirs, at `references/locales/<locale>.json`.
