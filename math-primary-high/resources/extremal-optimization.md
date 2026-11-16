# Extremal Reasoning: Bounds and Attainment

Read when comparing a target over feasible objects, or checking whether a proposed best value is actually optimal. Retain the current act and the student's verified route. `math-high-session` remains the teaching owner. Use `references/mathematical-strategies.md` for ordered enumeration and monitoring, `references/derivation-teaching.md` for reachable bridges, and `references/proof-teaching.md` for scope and the first load-bearing gap; this is a topic supplement, not another teaching sequence.

## Feasible objects and reachable tools

Before comparing, establish the objective, units and domain: positive integers or positive real numbers, fixed perimeter, allowed shapes, whether squares are allowed, and whether zero or degenerate shapes are excluded. Reuse explicit conditions rather than asking again. If a missing restriction changes the answer, ask one relevant clarification instead of silently supplying it. A drawing's appearance is not a length or area condition; words, paper work or a table suffice.

Link only needed tools to `area-perimeter`, `multiplicative-thinking` and `operation-meaning` in `references/topic-map.md`. For a rectangle, perimeter counts each adjacent side twice; area counts the product in square units. Finite enumeration, verbal comparisons and balancing are valid routes; algebraic inequalities and square expansion are optional tools, not an entry course.

## Choose the next bridge from actual work

| Evidence | Smallest useful action |
|---|---|
| Draws a few feasible objects without a route | Connect the constraint to a usable relation, then leave organization of allowed candidates to the student. No ideas alone does not diagnose missing calculation. |
| Calls one feasible value best | Preserve it; inspect unexcluded possibilities or continue a valid improvement argument. A better example still needs a global reason. |
| Has a feasible optimum candidate without a global reason | Ask only for exhaustive coverage or a bound. If a valid bound instead lacks a witness, ask only for attainment; retain established work and actual scope. |
| Can execute comparisons but cannot choose the organization | Explore the useful range or what an attempted comparison ruled out, not a basic arithmetic lesson. Teacher-chosen balancing/classification stays teacher help. |

Unknown tools need a minimal discriminating probe only when it changes the next action. A confirmed route-critical area, perimeter or comparison gap follows `references/prerequisite-learning.md`: preserve the parent problem, answer, pending position, materials and support, then enter the nearest tool-learning child through the session. Independent tool use permits return to exactly one parent; child calculation does not establish parent optimization strategy. A verified alternative may remove the dependency. Leaf skills return evidence and a wait position rather than dispatching each other. Keep one coherent thinking task and one pending question per turn.

## Globality and attainment

A maximum M requires both **every feasible value ≤ M** and **a feasible object attaining M**. A minimum reverses the bound. A witness alone proves feasibility, not bestness; an unattained bound is not an actual extremum.

For finite candidates, use the existing ordered-enumeration rules: explain why the classification covers every allowed object, why its stopping point is valid, and how each value is checked. Swapping the two side names does not change a rectangle's area, so short-side enumeration suffices when roles do not matter. A few tried pairs are not exhaustive unless the range is justified.

For a student's balancing route, check that the adjustment keeps all constraints, actually changes the target in the claimed direction, and accounts for every nonoptimal candidate or reaches a justified stopping bound. One improving move does not prove global optimality. In the positive-integer fixed-sum rectangle case, if b−a≥2, changing (a,b) to (a+1,b−1) increases area by b−a−1>0; repeated allowed moves reach equal or adjacent sides. Explain those comparisons with the student's available tools instead of requiring expansion. Recheck legality if squares or other intermediate states are forbidden; finite enumeration remains a valid alternative.

## Private bound checks

Keep answers and complete tables private in independent work. Explicit complete-solution/proof requests use `learn-core`'s informed full-solution choice (`references/informed-full-solution-choice.md`): warning, wait and same-task confirmation, then the checked solution with no prerequisite or compulsory exercise. Hints, scope clarification and ambiguous assent do not authorize it.

| Condition | Required check |
|---|---|
| Positive-integer rectangle sides at fixed perimeter | Reduce to a fixed adjacent-side sum; enumerate the justified short-side range without duplicates, or prove a valid balancing bound |
| Positive-real sides | Replace finite enumeration with an argument over all real candidates; inspect boundary limits and attainment |
| Squares or other candidates forbidden | Recheck both the feasible range and the equality case; an old bound may remain true without being attained |
| Minimum over positive real sides | Check whether feasible values approach an excluded boundary; an unattained lower bound is not a minimum |
| Zero/degenerate sides allowed | Recheck feasibility and boundary attainment rather than importing strict-positive conclusions |
| Changed perimeter, domain or admissibility | Recheck range, bound and attaining object; conclusions for constrained rectangles do not cover arbitrary shapes |

## Completion and evidence

Completion for an optimization goal requires a justified global bound or exhaustive comparison plus an attaining feasible object; an unfinished half stays explicit. For a bound-only goal, state whether attainment was asked or remains unknown. Record student choices, explanations and comparisons separately from teacher-supplied candidate lists, balancing moves, algebra identities and counterexamples in existing `strategy_summary`/`ability_evidence`. Repeating them is supported work, not independent discovery or monitoring.

Recording: `references/math-segment-fields.md` — at most one merged performance segment per turn for actual student work; teacher-only explanation, a choice or a plan uses `session_segment: null`. Tool children and recovery: `references/prerequisite-learning.md`. This supplement adds no method scores, obstacle labels or plan fields. Near transfer (same structure, new numbers) and changed-condition checks (a changed feasibility rule or domain, such as perimeter instead of area or integer instead of any length) serve different evidence; offer only when needed and agreed. Respect refusal, changed goals, pause and end without forced verification or invented mastery.
