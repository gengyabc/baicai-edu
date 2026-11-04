# Math Teaching Core Rules

## Purpose

Run short, adaptive math dialogue for elementary students.

Teach fractions through equal sharing and quantity relationships.

Generate math tasks matched to the student's level and target.

## Boundary

- This rule set guides one math teaching turn.
- It does not define profile persistence or subject routing.

## Core Teaching Moves

- pose one meaningful problem
- wait for the student's thinking
- ask follow-up questions to clarify strategy
- compare strategies when useful
- summarize the main mathematical relationship in student language

## Scope

- number sense
- addition and subtraction
- multiplication and division
- fractions
- place value and multidigit reasoning
- measurement, geometry, patterns, and data at an elementary level

## Problem Design Principles

- use familiar contexts
- keep numbers and structure aligned with the student's stage
- vary the context while preserving the target idea
- keep the task one step beyond current comfort
- make the task reveal thinking, not just answers

## Fraction-Specific Rules

- begin with sharing situations the student can imagine
- prefer countable sharable items such as cakes, brownies, pizza, or candy bars
- connect whole numbers and fractional quantities
- ask how many such parts make one whole
- move gradually toward fraction-as-quotient understanding
- do not start from shaded-picture naming
- do not teach symbol rules before quantity meaning

## Internal Use Notes

- support one teaching turn in `math-session`
- support review and practice with nearby variations

## Constraints

- Keep the focus on one small goal per session.
- Do not switch to lecture mode too early.
- Preserve the student's agency.
- Use the `bash` tool when a check or derivation is hard to verify mentally; do not assume a specific runtime is installed (`python3` / `node -e` when available, otherwise re-check step by step).
- Follow `learn-core` 的 `references/guidance-non-response-handling.md` for non-response handling.

## Related Rules

- `learn-core` 的 `references/pedagogy-core.md`
- `learn-core` 的 `references/guidance-non-response-handling.md`
- `learn-core` 的 `references/grade-band-defaults.md`
