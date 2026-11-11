---
name: math-common
description: Shared math rules for both primary bands. Load from a math band skill when it handles a student-made problem, plans practice evidence, or reads or writes the math board; returns rules only.
user-invocable: false
---

# Shared Math Contracts

The math rules both primary bands must change together. This is not a teaching implementation: it registers no session, declares no stage fit, chooses no band, grade, method, activity, or clear authorization, and produces no student reply, segment, or profile write.

## Interface

The caller is the current math band, which already holds the current provider, `mode` and confirmed-skill evidence, the current problem and pending step, the practice purpose, and the evidence and signal to return. When an input a rule depends on is missing, take that rule's most conservative branch (no confirmed skill means always answer correctly).

Loading this skill returns its base directory. Read only the one matching reference and do not pre-load the others; do not invent a contract that is missing.

| When the band needs | Read | The band keeps |
|---|---|---|
| A student-authored problem | `references/student-problem-contract.md` | Multi-part grading, problem-type range, invented-versus-real quantities |
| Practice evidence | `references/practice-evidence-contract.md` | Problem design, methods and scaffolds, batch attribution |
| The math board | `references/board-contract.md` | Clear authorization, teaching use, sub-question attribution |
| The student's handwritten work, a math diagram, or a printed math page | `references/handwritten-work-contract.md` | Diagnosis, scaffolds and the next teaching move; the contract supplies reading hints and step-check facts only |

## Boundary

- Shared text never names a band package, band file, or relative path; where local detail is needed it says "the current provider's rule", and the band's supplement names its own file.
- Stage fit, session ownership, clear authorization, method selection, diagnostic depth, batch tracking, and modeling work stay local to the band.
- The handwriting contract supplies reading hints and deterministic step-check facts only; it assigns no error type, label, mastery, or next move, and names no grade.
- If this skill cannot be loaded or is disabled, the band continues under the safe fallback in its own `math-core` and does not claim the shared contract was applied. This skill is never a math specialist and is never selected by the teaching resolver.
