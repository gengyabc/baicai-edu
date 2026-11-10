---
name: math-common
description: Shared contracts for student-authored problems, practice evidence, and the math-board protocol across the primary math bands. Load on demand from a math band skill; rules only, never teaching, routing, or a resolver candidate.
user-invocable: false
---

# Shared Math Contracts

This skill owns only the math rules that both primary math bands must change together. It is not a teaching implementation: it registers no teaching session, declares no stage fit, chooses no band, grade, method, activity, or clear authorization, and produces no student reply, segment, or profile write.

## Interface

The caller is the current math band. It already holds the current provider, `mode` plus confirmed-skill evidence, the current problem and pending step, the practice purpose, and the evidence and signal to return. This skill returns the rules for the one contract asked for; when an input is missing, leave the dependent rule to the band.

Loading this skill returns its base directory. Read only the matching reference from that directory; do not pre-load all three, and do not treat a missing contract as permission to invent one.

| When the band needs | Read | The band keeps |
|---|---|---|
| The student-authored problem protocol: role boundary, answering, restricted deliberate error, correction duty, grading response, evidence attribution | `references/student-problem-contract.md` | Multi-part grading, problem-type range, invented-versus-real quantities |
| The practice evidence strategy: four purposes, one problem at a time, count cap, stop condition, transfer evidence | `references/practice-evidence-contract.md` | Problem design, methods and scaffolds, batch attribution |
| The board protocol: field meanings, attachment read order, edit-history reading, trust boundary, settings read and write | `references/board-contract.md` | Clear authorization, teaching use, sub-question attribution |

## Boundary

- Shared text never names a band package, band file, or relative path. Where a rule needs local detail it says "the current provider's rule"; the band's local supplement names its own file.
- The band's stage fit, session ownership, clear authorization, method selection, diagnostic depth, batch tracking, and modeling work stay local and are not overridden here.
- If this skill cannot be loaded or is disabled, the band continues with its own core rules and does not claim the shared contract was applied. This skill is never a math specialist and is never selected by the teaching resolver.
