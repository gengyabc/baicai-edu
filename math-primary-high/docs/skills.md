# Skills, acts, and rule ownership

[English](skills.md) | [中文](skills.zh.md)

Six internal skills: one mainline, one rule owner, four leaves. None is user-invocable and none occupies a `/` entry; `/learn` and `/learn-feynman` reach the band through the shared lifecycle. This page states the roster, the dispatch contract, how the two math bands coexist, and what this band keeps locally.

## Roster

| Skill | Role |
|---|---|
| `math-high-session` | Mainline, focus recovery, the only dispatcher of the four acts, the only merger of the turn's segment |
| `math-high-core` | Shared rules — teaching, diagnosis, scaffolding, act allocation, board, subject contract — with conditionally loaded references |
| `math-high-diagnose` | Strategy diagnosis, prerequisite checks, error-item triage, stage estimates that carry evidence |
| `math-high-practice` | Diagnose / contrast / variation / connect plus non-tier consolidation and revisit; sub-questions advance one at a time |
| `math-high-student-problem` | Student invents problems, the AI answers honestly, the student grades; find-the-error is labeled separately |
| `math-high-application-modeling` | Real-world modeling: situation, plan, representation, quantities and units, validation, conclusion |

## Dispatch

- Only `math-high-session` dispatches the four leaves. A leaf returns evidence and a next-action signal; leaves never call each other.
- While waiting for the student, keep the current step. When evidence is sufficient and no question is pending, at most two leaf dispatches fit in one turn.
- Only the session merges the single segment. A later check follows the existing next-step handoff and promises no scheduled time.
- This is a convention inside the instruction layer, not runtime call isolation.

## Two bands, one subject

- Both packages use unique skill names — `math-high-*` here, `math-low-*` there — so they install side by side under the same `math` subject id. The shared teaching resolver — `learn-data`'s `references/teaching-resolver.md` — picks the band for a new task (1–3 → low, 4–6 → high, no grade → low) and preserves the resolved band while a task is unfinished; `supported_stages` only declares the default expression and flow.
- The priority is not a content gate: the low band supports higher content, and a running task is never hot-swapped because another package was installed.
- This band's writing defaults to upper-primary cognition and expression, but it is not a copy of the low band; the differences live in each band's own `references/`.
- CGI keeps its role in watching the student's real strategy without leading every lesson. Concepts use CPA, procedures may use explicit teaching, unfamiliar problems use Pólya, discrimination and transfer use variation, patterns use inquiry and argument, real decisions use modeling; formative assessment runs through. Steps: [teaching core](../skills/math-high-core/references/math-teaching-core.md).
- Using the board, wanting a diagram, or shoring up foundations does not mean switching to the low band. Judge the prerequisite gap, the scaffolding and the fit first; switching bands is a decision about the student's stage, not about one wrong answer or one tool.

## What the band owns, what it borrows

- Student-authored problems, practice evidence, the board protocol and handwriting reading are written once in [`baicai-edu-math`](../../math-common/README.md); this band loads each by name on the branch that needs it.
- The handwriting contract is loaded straight from this band's core conditional line, grade-independent and with no local delta: read the contract, then load `learn-read-image`.
- Kept locally: task-selected methods, direct calculation and explicit teaching openings, batch attribution, no automatic board clear, and the modeling leaf. Item types follow the teaching purpose — story, calculation, diagram, equation and argument each have a use, and the same relation in a new scene can test situational transfer.
- The shared contract package takes no part in teaching resolution and never replaces this band's `core` or `session`. `learn` carries flow choice, confirmation, saving and new-task resolution; the low band fits a confirmed student stage, never one wrong answer or one tool need.
- Two independent owners: [act allocation](../skills/math-high-core/references/learn-act-allocation.md) chooses the activity, [teaching core](../skills/math-high-core/references/math-teaching-core.md) chooses the method. Method names and their installed homes: [methods](methods.md).
