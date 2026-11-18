# Skills, dispatch, and rule ownership

[English](skills.md) | [中文](skills.zh.md)

Five internal skills: one mainline, one rule owner, three leaves. None is user-invocable and none occupies a `/` entry; `/learn` and `/learn-feynman` reach the band through the shared lifecycle. This page states the roster, the dispatch contract, and which rules this band owns versus borrows from `baicai-edu-math`.

## Roster

| Skill | Role |
|---|---|
| `math-low-session` | Teaching mainline, focus recovery, the only dispatcher of the three leaves, the only merger of the turn's segment |
| `math-low-core` | Shared rules and the conditionally loaded references |
| `math-low-diagnose` | Strategy diagnosis, error-item triage, stage estimates that carry evidence |
| `math-low-practice` | Keeps the diagnose / contrast / variation / connect tiers, plus non-tier consolidation and revisit; one item at a time |
| `math-low-student-problem` | Student invents problems, the AI answers honestly, the student checks; find-the-error is labeled separately, and a Feynman-mode misconception is corrected in the same turn |

## Dispatch

- Only `math-low-session` dispatches leaves. A leaf returns evidence and a next-action signal; leaves never call each other.
- While waiting for the student, keep the current step. When evidence is sufficient and no question is pending, at most two leaf dispatches fit in one turn.
- Only the session merges the single segment; the lifecycle records and finalizes. Error-item files are read by one `learn-errors` call from the lifecycle, and the subject branch consumes the result.
- This is a convention inside the instruction layer, not runtime call isolation.

## What the band owns, what it borrows

- Student-authored problems, practice evidence, the board protocol and handwriting reading are written once in [`baicai-edu-math`](../../math-common/README.md); this band loads each by name only on the branch that needs it.
- The handwriting contract is loaded straight from this band's core conditional line, grade-independent and with no local delta: read the contract, then load `learn-read-image`.
- What this bucket keeps locally, in its own references: CGI quantity relations and the child-strategy view, choosing story or non-story form by goal — a story carries quantity meaning while calculation and equations may use a non-story form — automatic board clearing at a task boundary, and grade 1–3 notation and story phrasing.
- Whether `math-common` loaded changes neither this band's `supported_stages` nor its session ownership. With the shared package unavailable, this band continues on its own core's safety behavior and does not claim the shared contract was applied.

## Rules and stages

Rules load through conditional pointers in `math-low-core` rather than a summary in the running instructions. Stages follow three CGI lines — arithmetic, multi-digit, fractions — as a strategy summary only: they change no shared schema and set no content gate.

Board entry, local deltas and the clear authority: [the math board](board.md) and [structured drawing](../skills/math-low-core/references/structured-drawing.md). What the band may say and do: [teaching boundaries](teaching-boundaries.md).
