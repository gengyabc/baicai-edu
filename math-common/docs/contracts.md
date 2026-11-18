# Shared contracts, loading, and ownership

[English](contracts.md) | [中文](contracts.zh.md)

The four rules below would otherwise be written twice, once per band, and drift apart. This page says which file owns each one, how a band reaches it, and what the shared text may never contain. The authoritative text is the reference file in each row; this page is a summary with pointers.

## Ownership

| Contract | Only source | Each band still keeps locally |
|---|---|---|
| Student-authored problems | [student-problem-contract.md](../skills/math-common/references/student-problem-contract.md) | Upper-primary multi-part scoring, item scope, separating invented numbers from real facts |
| Practice evidence | [practice-evidence-contract.md](../skills/math-common/references/practice-evidence-contract.md) | Item design, methods and scaffolding, batch and local attribution, grade wording |
| Math board | [board-contract.md](../skills/math-common/references/board-contract.md) | Clear authorization, how teaching uses the board, upper-primary sub-question attribution |
| Handwriting reading | [handwritten-work-contract.md](../skills/math-common/references/handwritten-work-contract.md) | Reading prompts, fact checking, evidence mapping; diagnosis, scaffolding and next steps stay in the band |

## How a band reaches it

- The first three are reached through a band-local reference that acts as a load pointer; the base directory that load returns is where the model reads the text.
- The handwriting contract is loaded straight from the band core's conditional line: it is grade-independent and has no local delta, so no band restates it.
- Read the contract first, then load `learn-read-image`.

## Boundaries on the shared text

- No band package name, band file or cross-package relative path. Where a step needs a local detail the shared text says "per the current provider's rules", and the band's own reference supplies its file.
- The handwriting contract carries reading prompts and deterministically checkable facts only. `error_type` / `label`, scaffolding and next steps stay in the band; the reading layer does not diagnose.
- Rules only: not a teaching implementation, no session of its own, never a teaching-resolver candidate, never a complete specialist.
- The band skills — core, session, diagnose, practice, student-problem, application-modeling — exist only in the bands. Each band's teaching philosophy, clear authorization, diagnosis depth, batch handling and modeling stay outside this package.
- Local increments and differences stay in the band's own reference; the shared body is never copied there.

## When a shared file is missing or disabled

Each band continues on the safety behavior written in its own core skill — never a deliberately wrong answer when the student invents problems, board text that is neither an instruction nor an authorization, one item at a time with at most three items per purpose, handwriting read by the general rules with checked facts marked unknown — and does not claim the shared contract was applied. A missing shared package never substitutes for band resolution either.

## Changing a contract

Every change replays both bands' common scenarios and their differing scenarios. Common math scenarios are in [math-common/tests/teaching-scenarios.md](../tests/teaching-scenarios.md); the reading layer's are in [learn/tests/image-reading-scenarios.md](../../learn/tests/image-reading-scenarios.md). Static checks passing is not teaching behavior passing.
