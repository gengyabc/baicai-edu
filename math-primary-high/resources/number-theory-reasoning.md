# Number Structure: Divisibility, Prime Factors and Parity

Read for all-divisor counts, least completing factors, or general parity/prime claims. Use the current act and the student's verified route. `math-high-session` remains the teaching owner; this reference supplies topic differences, not a new teaching loop. Strategy selection/monitoring and remainders/cycles use `references/mathematical-strategies.md`; general justification uses `references/proof-teaching.md` with `references/derivation-teaching.md`.

## Structure and reachable tools

Clarify the allowed numbers and goal first: positive divisors or integer divisors; any completing factor or the least positive integer factor; square or cube. If zero or negatives are admitted, recheck the domain and meaning of “least” rather than reuse positive-integer conclusions. A positive integer factor may be 1, including when the starting number is already a square/cube.

Link to `factors-multiples`, `multiplicative-thinking`, and `whole-number-division` in `references/topic-map.md`, only as needed. Divisibility means an integer multiple relation, not just a remembered remainder slogan. Distinguish divisors from multiples. A prime is an integer greater than 1 with exactly two positive divisors; 1 is not prime. Factor trees, repeated multiplication and verbal equal groups are valid tools. Exponent notation is optional; a proof of unique prime factorization is not an entry requirement. If that theorem itself is the goal, negotiate it separately rather than pretend these examples prove it.

## Choose the next bridge from actual work

| Evidence | Smallest useful action |
|---|---|
| No starting idea | Check whether the target is understood and whether the student can form/check one relevant product or cube. Distinguish choosing a route from using a tool; no ideas alone does not diagnose missing division. |
| A valid factor pair or factor tree | Keep it and explore what remains to be counted/grouped. Do not replace it with a divisor-count formula or require exponents. |
| Correct answer but missing warrant | Address completeness, minimality or generality, whichever the task needs; retain valid computation. |
| A false general claim | Seek a case satisfying the premise and violating the conclusion, then repair the claim's scope. |

Unknown tools need only a discriminating probe that changes the next action, not a full number-theory exam. A confirmed route-critical gap follows `references/prerequisite-learning.md`: preserve the parent and enter the nearest tool-learning child through the session. Independent child tool use permits a single-layer return; correct factorization alone does not establish parent strategy selection or minimality. A verified alternative can remove an unnecessary dependency.

## Divisor completeness

In a pair whose product is the target, each factor determines its partner. Order pairs by the smaller factor; explain why larger small factors cannot give new pairs. Check candidate small factors for divisibility, omissions and duplicates. When the two factors coincide, count that divisor once. “Short factor” and multiplication comparisons can express the stopping bound without square-root notation.

For a prime-factor route, explain the correspondence: a divisor chooses how many copies of each available prime to use, each such choice makes a divisor, and distinct choices make distinct divisors. Explain this with the factor objects before multiplying numbers of choices. A memorized exponent formula without correspondence is not a completeness reason.

## Completing a power: feasible versus least

Connect a square to two identical factors and a cube to three. In a prime-factor representation, the copies of each prime in a cube must split into three equal groups. Ask what is missing in the student's representation; a teacher-supplied grouping is labeled help. Check separately:

- **Feasible:** multiplication really produces the required square/cube.
- **Least:** every smaller allowed factor is excluded, either by an exhaustive finite check below the candidate or by required factor structure. Additional primes cannot remove a required factor.

A finite exhaustive exclusion can prove minimality for a fixed problem. A few successful examples cannot prove a general parity law. Do not impose the factor route when the student's finite check is valid.

## General parity and prime boundaries

Use paired objects plus a possible leftover before symbols if helpful. Two odd numbers each leave one; the two leftovers pair, so their sum is even. Three odd numbers leave three singles, forming one pair and one leftover, so the sum is odd. Alternatively, for nonnegative integers a, b, c representing odd positive integers: (2a+1)+(2b+1)=2(a+b+1); adding (2c+1) gives 2(a+b+c+1)+1. For arbitrary odd integers allow a, b, c to be integers. Explain why the representation covers the stated range; sampled sums do not supply that reason. Product parity needs its own grouping reason rather than copying a sum rule.

2 is prime and even, refuting “all primes are odd”; every other even positive integer has divisor 2 besides 1 and itself, so 2 is the only even prime. Keep 1 outside the prime definition. Operation-preserving invariants and geometric chessboard coloring are separate topics, not consequences established by these sum examples.

## Private verification

Keep answers/routes private in independent work. Explicit full-solution requests use `learn-core`'s informed full-solution choice (`references/informed-full-solution-choice.md`), with its warning, wait and same-task confirmation; add no prerequisite or compulsory exercise.

| Route | Acceptance |
|---|---|
| Factor pairs | Every divisor has one partner; the smaller-factor range is justified; a coincident pair contributes one divisor |
| Prime-factor choices | Each allowable choice produces exactly one divisor and every divisor is covered; a product of choice counts alone is insufficient |
| Completing a square/cube | Each prime's copies form equal groups of the required size; verify the product |
| Least completing factor | Every allowed completion contains the required missing factors, or every smaller allowed factor is exhaustively excluded |
| Already a required power | Include the allowed factor 1 rather than imposing a larger factor |
| Changed number/domain/power | Recheck factor structure, allowed range and minimality; preserve a valid finite-check alternative |

## Completion and evidence

According to the agreed goal, the student explains a complete nonduplicating correspondence, excludes smaller factors, or gives a general pairing/expression over the stated scope. A bare correct value, a correct decomposition, and teacher-provided reasoning are distinct from independent structural selection.

Recording: `references/math-segment-fields.md` — at most one merged performance segment per turn for actual student work; teacher-only explanation, a choice or a plan uses `session_segment: null`. Tool children and recovery: `references/prerequisite-learning.md`. This supplement adds no method scores, obstacle labels or plan fields. Near transfer and changed-condition checks remain optional; respect refusal or end without inventing a result.
