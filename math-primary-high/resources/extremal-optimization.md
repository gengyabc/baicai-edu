# Extremal Reasoning: Bounds and Attainment

Read when comparing a target over feasible objects, or checking whether a proposed best value is actually optimal. Retain the current act and the student's verified route. `math-high-session` remains the teaching owner. Use `references/mathematical-strategies.md` for ordered enumeration and monitoring, `references/derivation-teaching.md` for reachable bridges, and `references/proof-teaching.md` for scope and the first load-bearing gap; this is a topic supplement, not another teaching sequence.

## Feasible objects and reachable tools

Before comparing, establish the objective, units and domain: positive integers or positive real numbers, fixed perimeter, allowed shapes, whether squares are allowed, and whether zero or degenerate shapes are excluded. Reuse explicit conditions rather than asking again. If a missing restriction changes the answer, ask one relevant clarification instead of silently supplying it. A drawing's appearance is not a length or area condition; words, paper work or a table suffice.

Link only needed tools to `area-perimeter`, `multiplicative-thinking` and `operation-meaning` in `references/topic-map.md`. For a rectangle, perimeter counts each adjacent side twice; area counts the product in square units. Finite enumeration, verbal comparisons and balancing are valid routes; algebraic inequalities and square expansion are optional tools, not an entry course.

## Choose the next bridge from actual work

| Evidence | Smallest useful action |
|---|---|
| E0: draws a few rectangles without a route | Connect the given perimeter to the sum of two adjacent sides, then let the student organize allowed pairs. Distinguish understanding the constraint from selecting an organization; do not announce the square or infer missing multiplication from no ideas. |
| E1: has 4×6=24 and calls it largest | Keep that feasible area. Ask what allowed possibilities remain unexcluded, or continue their balancing argument. Computing a better example repairs the candidate, but still leaves globality to justify. |
| E2: has 25 at 5×5, but no reason nothing is larger | Preserve the already established feasible witness; ask only for coverage or an upper-bound reason. If instead a valid upper bound lacks a witness, ask only for attainment. Do not restart every calculation or accept “squares are always largest” without scope. |
| Can execute comparisons but cannot choose the organization | Explore the useful range or what an attempted comparison ruled out, not a basic arithmetic lesson. Teacher-chosen balancing/classification stays teacher help. |

Unknown tools need a minimal discriminating probe only when it changes the next action. A confirmed route-critical area, perimeter or comparison gap follows `references/prerequisite-learning.md`: preserve the parent problem, answer, pending position, materials and support, then enter the nearest tool-learning child through the session. Independent tool use permits return to exactly one parent; child calculation does not establish parent optimization strategy. A verified alternative may remove the dependency. Leaf skills return evidence and a wait position rather than dispatching each other. Keep one coherent thinking task and one pending question per turn.

## Globality and attainment

A maximum M requires both **every feasible value ≤ M** and **a feasible object attaining M**. A minimum reverses the bound. A witness alone proves feasibility, not bestness; an unattained bound is not an actual extremum.

For finite candidates, use the existing ordered-enumeration rules: explain why the classification covers every allowed object, why its stopping point is valid, and how each value is checked. Swapping the two side names does not change a rectangle's area, so short-side enumeration suffices when roles do not matter. A few tried pairs are not exhaustive unless the range is justified.

For a student's balancing route, check that the adjustment keeps all constraints, actually changes the target in the claimed direction, and accounts for every nonoptimal candidate or reaches a justified stopping bound. One improving move does not prove global optimality. In the positive-integer fixed-sum rectangle case, if b−a≥2, changing (a,b) to (a+1,b−1) increases area by b−a−1>0; repeated allowed moves reach equal or adjacent sides. Explain those comparisons with the student's available tools instead of requiring expansion. Recheck legality if squares or other intermediate states are forbidden; finite enumeration remains a valid alternative.

## Teacher-only checked cases

Use these to verify work, not to disclose answers or a complete table in an independent opening. Reveal according to current guidance rules. Explicit complete-solution/proof requests use `learn-core`'s informed full-solution choice with its warning, wait and same-task confirmation; once confirmed, give the checked solution with no prerequisite or compulsory exercise. Hints, scope clarification and ambiguous assent do not authorize a full solution.

- **E0–E2, perimeter 20 metres, positive integer sides, squares allowed:** a≤b and a+b=10 imply 1≤a≤5. The complete pairs (1,9), (2,8), (3,7), (4,6), (5,5) have areas 9,16,21,24,25 square metres. Every rectangle is represented after swapping names if needed. Thus all areas ≤25 and the feasible 5×5 attains 25. If the algebra tools are available, ab=25−(a−5)²≤25 gives a global bound, with equality at a=b=5; do not impose that route on a valid finite list.
- **EB1, perimeter 24, same domain:** a+b=12; short sides 1 through 6 give areas 11,20,27,32,35,36. Maximum 36 square metres is attained by 6×6. Alternatively ab=36−(a−6)²≤36 with feasible equality.
- **EB2, perimeter 20, positive integers, squares forbidden:** short sides 1 through 4 give 9,16,21,24. All are ≤24, attained by 4×6. The old upper bound 25 is still true but its equality case is disallowed, so it is not the maximum here. If the domain instead becomes positive reals with squares forbidden, the supremum is 25 and is not attained; (5−t,5+t), with 0<t<5, approaches it as t tends to zero. Clarify the domain before claiming 24.
- **EB3, perimeter 20, minimum:** positive integers have minimum 9 square metres at 1×9 by the same complete list. With positive real sides, every area is strictly positive and there is no minimum: from any 0<a≤b with a+b=10, the feasible pair (a/2,b+a/2) has smaller area, since the area decrease is a(2b−a)/4>0. Areas can be arbitrarily close to zero: take a=t, b=10−t with 0<t≤1, giving 0<ab<10t. Thus 0 is an unattained lower bound, not a minimum. Degenerate sides would change this domain and conclusion.

These arguments concern rectangles under the stated perimeter constraints, not arbitrary shapes. A changed perimeter, domain or admissibility condition requires rechecking the range, bound and equality case rather than copying the old answer.

## Completion and evidence

Completion for an optimization goal requires a justified global bound or exhaustive comparison plus an attaining feasible object; an unfinished half stays explicit. For a bound-only goal, state whether attainment was asked or remains unknown. Record student choices, explanations and comparisons separately from teacher-supplied candidate lists, balancing moves, algebra identities and counterexamples in existing `strategy_summary`/`ability_evidence`. Repeating them is supported work, not independent discovery or monitoring.

Follow existing segment rules: at most one merged performance segment per turn; teacher-only explanations and process choices use `session_segment: null`. This supplement adds no method scores, obstacle enums, plan fields or second task collection. Near transfer (EB1) and changed-condition checks (EB2–EB3) serve different evidence; offer only when needed and agreed. Respect refusal, changed goals, pause and end through existing choice/plan rules without forced verification or invented mastery.
