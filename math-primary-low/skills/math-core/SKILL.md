---
name: math-core
description: Math shared rules taught with CGI (Cognitively Guided Instruction). Load before math teaching, strategy diagnosis, leveled practice, or student-makes-AI-problems; read field conventions when generating math learning records.
user-invocable: false
---

# Math Rules

This package teaches with Cognitively Guided Instruction (CGI): problem types, strategy judgments, questioning, and scaffolds all follow CGI. Details are in `references/math-teaching-core.md`.

Shared math rules, loaded by name by `math-session`, `math-diagnose`, `math-practice`, and `math-student-problem`. This skill produces no student reply or segment.

## Start and Input

Shared by every math branch; sub-skills do not repeat it:

- Enter only through the shared lifecycle of `/learn` or `/learn-feynman`; session, student, snapshot, and handoff fields are already checked by the entry and passed in (see Route And Record in `learn-data`'s `references/session-lifecycle.md`). With no entry handoff (no snapshot), ask the student to enter `/learn`.
- `learn-core` and `learn-data` are already loaded by the entry. Tone, confirmation, no-response, Feynman role and allowlist, personalization boundary, ending, and safety all follow `learn-core`'s condition table; when `mode: feynman`, read its `references/feynman-mode.md` first and stay in the student-as-audience role.
- Problems follow CGI; problem surface form follows `references/problem-design.md`. Interests enter a problem only when the bridging condition in `references/math-personalization.md` holds.
- Before generating a problem or hint, if `memory.profile_memory.material_difficulty` is not `standard`, adjust one load factor (numbers, representation, or amount of prompting) per `learn-core`'s `references/difficulty-adjustment.md`; do not change the strategy stage.
- Only the entry calls `learn-errors`, once for files. On `files_processed: true`, read the extracted analysis that `material_refs` points to; if an unprocessed image, Markdown, or raw-scan request appears mid-lesson, hand it back to the entry. This package never calls `learn-errors` directly.
- Diagnosis, practice, and student-makes-problems only return evidence and produce no segment; scheduling and merging belong to `math-session`, and logging, profile, and finalize go to the shared flow.

## Read by Branch

Read the common rules first; read the rest before entering the matching branch. Each is the single source for its rule.

| Condition | Read |
|---|---|
| All math teaching, including diagnosis, practice, student-makes-problems | `references/math-teaching-core.md` |
| Before a new problem, activity, or topic (including skipping a problem, the teaching assistant's next problem, and after the old topic finalizes successfully); when a same-problem flow switch needs boundary judgment | `references/board-task-boundary.md` |
| Snapshot contains interests, preferences, easy/hard topics, or experiences, or the student cannot do the current problem | `references/math-personalization.md` |
| Choosing the next goal, judging strategy stage | `references/progression-map.md` |
| Choosing, modifying, or varying problems; addition, subtraction, multiplication, division, place value, multi-digit numbers | `references/problem-design.md` |
| Fraction meaning, equal partition, equivalence, comparison, operations, or decimals | `references/fraction-relations.md` |
| Preparing a hint, the student finds it troublesome, asks for a new method, or a hint does not work | `references/scaffold-calibration.md` |
| Message carries a board attachment or edit-history attachment (`我的画板.json` / `我的修改记录.json`), or the student asks how to use the board | `references/structured-drawing.md` |
| Judging arithmetic / multi-digit / fraction strategy stage or analyzing error causes | `references/strategy-diagnosis-rules.md` |
| Student makes problems to test the AI; designing the AI's answers | `references/math-student-problem-design.md` |
| Generating diagnostic / contrast / variation / connection practice | `references/targeted-practice-rules.md` |
| Producing the math segment or merging sub-flow evidence | `references/math-segment-fields.md` |

## Subject contract

`supported_stages: lower_primary, upper_primary`. This is an adaptation declaration for default expression and flow, not a content gate; other stages are routed to general teaching by the unified resolver.

`subject: math`, teaching entry `math-session`, package `dsh-edu-math-primary-low`. For the meaning of roles see `learn-data`'s `references/subject-contract.md`; the entry and this package's branches are read from here as well.

Teaching delivery language: the student's `language` from the shared profile (missing or unknown → `zh-CN`), so student-visible teaching stays in that language; process labels follow the UI locale per `learn-data`'s `references/ui-locale.md`.

This package focuses on lower primary and teaches with CGI's tone and methods; grade only adjusts language and presentation and is not a content gate. When a student wants to explore higher-grade content, keep teaching; do not discourage them or require a return to grade-level problems.

| Role | Read |
|---|---|
| Target classification: classify a learning goal or a math goal after a file handoff | `references/math-target.md` |
| Learning recommendation: generate, compare, or reorder small math goals | `references/learning-recommendations.md` |
| Grade defaults: initialization, re-choosing grade, or choosing the default domain | `references/math-grade-defaults.md` |
| Profile fields: preference keys and `/learn-start` options, level keys, writing the subject profile | `references/math-profile-fields.md` |
| Diagnosis rules: error causes, `error_type`, and `label` | `references/strategy-diagnosis-rules.md` (same file as in the condition table above) |
