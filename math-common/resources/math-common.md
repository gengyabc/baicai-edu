---
name: math-common
description: Shared math rules for both primary bands. Load from a math band skill for Chinese/English teaching delivery, an agreed micro-lesson, a student-made problem, practice evidence, a geometry figure on the Teacher demo tab, or reading or writing the math board; returns rules only.
resources: math-language-contract.md micro-lesson-contract.md student-problem-contract.md practice-evidence-contract.md representation-contract.md board-contract.md handwritten-work-contract.md
resource-loading: on-demand
---

# Shared Math Contracts

Shared contracts keep both primary bands aligned; the calling band owns teaching decisions and execution.

## Interface

The caller is the current math band, which already holds the current provider, `mode` and confirmed-skill evidence, the current problem and pending step, the practice purpose, and the evidence and signal to return. When an input a rule depends on is missing, take that rule's most conservative branch (for example, without confirmed-skill evidence, never present a deliberately wrong answer as the AI's own).

Loading this skill returns its base directory. Read only the references required by the current branch; reuse contracts already read this session. Teacher geometry needs both representation ownership and the board tool-call recipe: read both contracts before drawing or recovering a figure; do not pre-load unrelated contracts. For nested shared rules, use the named owner's base directory.

| When the band needs | Read | The band keeps |
|---|---|---|
| Any math teaching branch: Chinese/English delivery, language-access support, or attachment naming | `references/math-language-contract.md` | Task-local delivery choice, pending task, mathematical goal, and evidence attribution; process UI remains under the shared locale protocol |
| An agreed new-learning micro-lesson | `references/micro-lesson-contract.md` | Entry decision, method selection, teaching execution, and local activity state |
| A student-authored problem | `references/student-problem-contract.md` | Multi-part grading, problem-type range, invented-versus-real quantities |
| Practice evidence | `references/practice-evidence-contract.md` | Problem design, methods and scaffolds, batch attribution |
| Choosing teacher-supplied diagrams, student-generated representations, or fading support; geometry-related teaching or a geometry problem | `references/representation-contract.md` | Learning goal, method, activity, pending task, and evidence attribution. Call `geometry_board_draw` for a drawable figure; that call is teacher material, not a student draft |
| The math board, including an explicit request for the teacher to draw or a missing teacher figure | `references/board-contract.md` | Clear authorization, teaching use, sub-question attribution; Tool Dispatch and executable geometry-call recipe |
| The student's handwritten work, a math diagram, or a printed math page | `references/handwritten-work-contract.md` | Diagnosis, scaffolds and the next teaching move; the contract supplies reading hints and step-check facts only |

## Boundary

- Shared text never names a band package, band file, or relative path; where local detail is needed it says "the current provider's rule", and the band's supplement names its own file.
- Stage fit, session ownership, clear authorization, method selection, diagnostic depth, batch tracking, and modeling work stay local to the band.
- The handwriting contract supplies reading hints and deterministic step-check facts only; it assigns no error type, label, mastery, or next move, and names no grade.
- If this skill cannot be loaded or is disabled, the band continues under the safe fallback in its own core skill and does not claim the shared contract was applied. This skill is never a math specialist and is never selected by the teaching resolver.

This skill's base directory holds every file it names: a `references/<name>.md` path below is the installed `<name>.md` beside that base directory, because an installed skill keeps no `references/` folder for prose. Locale catalogs do keep theirs, at `references/locales/<locale>.json`.
