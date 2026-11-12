# Mathematical Strategies

Read for fixed-total/different-contribution reasoning, finite choices requiring organization, repeating states/positions, generated old/new structures, the conditional methods below, or when a student's explanation or monitoring is blocked on these structures. Reuse Pólya and the existing derivation/proof loops, not a second mandatory sequence. Methods, topic-map tools, and problem families have many-to-many links: accept a verified student alternative. Names and formulas are not entry requirements. A confirmed tool gap uses `references/prerequisite-learning.md`; unknown tools first need discriminating evidence.

## Conditional method references

For area splitting/completion, rearrangement, equal-area conditions or choosing an auxiliary object from visible constraints, read `references/geometry-reasoning.md`. It specializes the existing derivation/proof loop; a diagram alone is not its trigger. Link the needed tools to `area-perimeter` and `geometry-attributes` in `references/topic-map.md`, not a fixed geometry course.

For all-divisor counts, least factors completing a square/cube, or parity/prime claims, read `references/number-theory-reasoning.md`. It links factor tools to completeness, minimality and general reasons; remainders/cycles stay here as their single rule source.

For repeated legal operations that may preserve a state quantity, or coverage relations with fixed contributions under a useful coloring, read `references/invariants-coloring.md`. A board picture alone does not trigger coloring; verify the actual operations and accept other justified routes.

## Student monitoring and local obstacles

At a meaningful decision or actual stall, help the student judge what this attempt established, what remains uncertain, and why continuing or changing the organization may help. Use their actual work; do not ask for a monitoring report after every step. A failed attempt may rule out a case or expose a duplicate without solving the problem. Teacher replanning alone is not student monitoring.

| Evidence in this task | Possible local obstacle | One useful action |
|---|---|---|
| Cannot identify the target or constraints | Understanding | Clarify one condition; do not infer a knowledge gap |
| Relations known but hard to organize | Representation | Connect the student's words, table, drawing or symbols |
| Can perform needed operations but sees no route | Strategy selection | Explore one structurally simpler case or visible comparison |
| Has a valid route but cannot perform one operation | Execution | Confirm the tool gap and enter its learning child |
| Gets the result but cannot explain why | Justification | Examine the first missing warrant, not repeat all computation |
| Works only on the familiar version | Transfer | Compare one changed structural condition on an agreed task |

These are revisable descriptions in existing `strategy_summary`, not a new diagnosis enum, permanent student type, score or ordered stage. One omitted case might be a copying slip rather than missing classification; ask only what distinguishes the possibilities.

## Assume and adjust

**Structure and tools:** a fixed total number, differing per-item contributions, and a target total. Link to `operation-meaning`, `multiplicative-thinking`, and relevant `multi-step-models` in `references/topic-map.md`: compare quantities, preserve total count during replacement, and connect repeated equal changes to a total difference. No equation prerequisite by default.

**Bridge:** simplify one dimension while retaining a constraint, then compare the simplified total with the real total. If the student already assumed all of one kind, use that assumption. Ask about the effect of replacing one item, then connect their unit change to the total discrepancy on a later turn. A proposed assumption needs a purpose, not the phrase “this is a chicken-and-rabbit problem”.

**Monitor and justify:** which constraint stayed fixed? Does each replacement have the same contribution change? Does the calculated number fit the count and both original totals? If unit change varies, reconsider the model rather than keep dividing. An equation or a justified trial table is equally valid.

**Teacher-only checked case:** 20 chickens/rabbits and 56 legs: all chickens give 40, discrepancy 16, replacement adds 2; 8 rabbits and 12 chickens. Do not disclose this route in an independent opening. If the student gives 12/8 by trial, record trial as their method; help them explain it without rewriting their history as independent assumption-method discovery.

**Transfer:** near transfer can use 20 tickets priced 2 and 5, total 64: 8 dearer, 12 cheaper. For a boundary contrast, introduce a quantity-dependent discount and ask whether the fixed unit adjustment still holds. The contrast tests applicability, not a compulsory new lesson.

Completion: the student explains the useful assumption/change and checks conditions, or the unverified part remains explicit; a correct quotient alone is not strategy evidence.

## Ordered enumeration

**Structure and tools:** finitely many choices under explicit constraints. Link to `operation-meaning`, `multiplicative-thinking`, and, for records/tables, `data-graphs`; these are conditional tools, not a prerequisite exam. Determine what counts as one object and whether order or roles matter before counting.

**Bridge:** use actual listed cases to form one stable classification or step order. For a missing branch, examine whether the classes cover all possible first choices; for duplicates, trace where the same object entered twice. Do not substitute “be careful” or reteach multiplication when the issue is organization.

**Monitor and justify:** classes must be exhaustive and mutually exclusive; within each class, account for every allowed choice. Classification adds disjoint counts; stepwise multiplication counts choice sequences when their correspondence with wanted objects and branch counts are justified. Varying later choice counts may require separate branches, not a single unjustified product. A finite exhaustive list can be a complete argument, not merely a guess from examples.

**Teacher-only checked case:** digits 1,2,3,4, no repetition, two-digit numbers: four tens classes with three units each, 12 total. If the student lists tens 1,2,3 and omits tens 4, ask about coverage without listing the missing class and all its numbers for them. If they get 4×3 but cannot justify completeness, examine the unique class containing any proposed number.

**Transfer:** near transfer: select captain and deputy from four people, 12 ordered role choices. Boundary: select two unranked group members, only 6 pairs. 12 and 21 are distinct numbers, but the same two people in an unranked pair are not two objects. Diagnose the counting unit before prescribing deduplication.

Completion: the student can explain why the organization has neither omissions nor duplicates; knowing a product or a formula name is insufficient.

## Remainders and cycles

**Structure and tools:** a stated repeat rule or a justified returning state, a complete cycle, and a position relative to its start. Link to `whole-number-division`, `operation-meaning`, `factors-multiples`, and `patterns-generalize`. For a confirmed division/remainder gap, enter the nearest tool child; do not silently give a modulus algorithm inside the parent.

**Bridge:** connect complete groups to the remaining position. Distinguish an arithmetic gap from not recognizing a repeat or not knowing why it persists. Reuse “three per group, 33 remainder 1” if already shown rather than restarting basic division. Ask for the meaning of the remainder before awarding method understanding.

**Monitor and justify:** locate cycle length, start position, and the mapping for remainder zero. An observed finite prefix does not determine a unique continuation. A problem's explicit endless repeat rule supplies general structure; examples alone do not prove one. For an operation-generated cycle, justify that the state and transition repeat, not just that a few outputs match.

**Teacher-only checked case:** endless red/blue/green: 100=3×33+1, position 100 is red; position 99 has remainder zero and is green. A correct red answer from ten sampled positions still needs the general positional connection. Avoid teaching students that zero means the first color.

**Transfer:** near transfer: endless A/B/C/D shifts, day 102 is B. Boundary contrasts: change the start to blue/green/red, or provide only a finite prefix without a repeat rule. The original remainder-to-color mapping or extrapolation is then not licensed.

Completion: the student connects complete groups, remaining position and repeat justification over the agreed range; computing a remainder alone is not selecting or explaining the strategy.

## Structural recurrence

When a stated generation action separates old and new parts, or a student needs to distinguish that action from a guessed continuation, read `references/early-algebra.md` — its Structural recurrence section owns the local moves and checked cases. Link to `patterns-generalize`, `operation-meaning`, and `multiplicative-thinking` in `references/topic-map.md` only as the route needs them. Keep a valid stepwise route; a closed form is a separate goal. Use `references/derivation-teaching.md` for deriving a general rule and `references/proof-teaching.md` for checking its full scope, not another lesson loop here. Repeating-state methods remain in Remainders and cycles above.

## Transfer and evidence boundary

Use near transfer and boundary discrimination separately when needed and agreed; changing a story or numbers alone is not evidence of knowing the method's limits. Do not force a new task at every close. Record student decisions/explanations, teacher hints and constructions, supported execution and still-unknown transfer distinctly. Following a teacher's classification or repeating its summary is supported work, not independent monitoring or mastery.
