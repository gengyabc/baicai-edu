# Boundary Variation: One Load-Bearing Condition Changes

Read when the student agreed to test why a method works, when a neighbouring case changes a decisive condition, or when they reuse an old reason after the condition changed. Use it with `references/problem-design.md`, which designs the original case, and `references/mathematical-strategies.md`, which owns ordered enumeration, assume/adjust, remainders/cycles and student monitoring. `references/math-teaching-core.md` selects the method and its steps, and the act is chosen separately; `math-high-session` stays the owner and dispatcher. This file adds the boundary moves only: no new leaf, submode, stage, profile field or second teaching loop.

## Pick the one condition

1. Trace the steps the student actually explained and find where the method depends on one fact: the counting unit, the unit change per replacement, a stated repeat or generation rule, the starting state, the order or role of an object, a fixed total, or an allowed range.
2. Name that fact privately. It is load-bearing when removing or changing it leaves the same steps unable to produce the same object, not merely a different number.
3. Change that one fact on an agreed task and keep the other conditions and the valid relationships from the original. Number size alone is a load clue; changing how an object is counted is a structural change.
4. If two facts must change together for the student's route to work, the case has not isolated one condition; simplify the change or treat it as a new task.
5. Ask for agreement before offering the contrast, and offer near transfer instead when the goal is only a familiar route on new material.

## Three outcomes

| Student evidence after the change | Teaching action |
|---|---|
| Uses the old step where it no longer holds (“divide by 2”, “subtract the gap”) | Ask which step of their explanation the change acts on, using their own words; do not correct by naming the right rule |
| Says the whole problem is now impossible | Check one candidate against the changed conditions before agreeing; “the old route stops” and “no route exists” are different claims |
| Finds a different valid route, or keeps part of the old one | Verify it and continue; a verified alternative removes the need for the original method, and needs no method name |
| Gives the new count with no reason | Preserve the count, then ask for the correspondence or recurrence that covers every object |
| Says nothing changed, or the terms are unclear | Compare one concrete object under both conditions, such as the same two people with and without roles; one question at a time |

The method's limit is not a property of the topic. The same structure can be counted under both conditions, and the new route may be easier than the old one. Decide from the object being counted and the conditions, not from a label attached to the story.

## Say what survives

Separate the steps that stay true, the step that must be redone, and what is still open. A useful form is “this part still reasons the same way, this one relied on … and now that changed, so it needs …”. Leave the replacement step to the student; supply it only under the shared support rules in `references/scaffold-calibration.md`, and label it as teacher-supplied.

Rows where the change is not structural stay in the method file that owns them: a different starting size with the same rule is usually a near transfer inside `references/mathematical-strategies.md`; a repeated rule versus a finite prefix already has a boundary there; an unproved direction or converse belongs to `references/proof-teaching.md`. Recurrence scope for old/new structures stays in `references/early-algebra.md`. This file only owns the shared boundary moves.

## Conflicts inside a result

A changed condition may invalidate the old method while the problem still has a solution. Distinguish:

- **The method no longer fits:** the old step is missing a condition it needed.
- **The problem has no solution:** no object satisfies the changed conditions; this needs its own check, not the failure of the old route.
- **Still open:** neither claim is established yet; say what would settle it.

Failure of the old route alone never establishes no-solution, and finding one solution never shows the old route still works. When the student's other route is valid, accept it and let the boundary case remain a check of the old method rather than a demand to replace it.

## Evidence and completion

Use the existing fields in `references/math-segment-fields.md` and one merged segment per turn. Keep these distinct:

- **Boundary discrimination:** the student names the changed condition, the step it touches, and what survives; this is independent work only when they supplied the link, not when they repeated a summary.
- **Near transfer:** a new surface with the same structure. Correct here shows the structure survived the surface; it does not show the limit was seen.
- **Supported work:** the student used a condition, route or correction after the teacher pointed it out. A correct count after the teacher named the change is not independent boundary discrimination.
- **Still unknown:** refused, untested or unclear.

Transfer and the boundary case are optional and need agreement; a refusal returns to the original task or ends the work without lowering a judgment, and an unfinished boundary case is not evidence of a weaker student. Teacher-only explanation, a choice or a plan with no student performance has `session_segment: null`. These are local observations, not a new long-term obstacle type or score. An actual confirmed tool gap follows `references/prerequisite-learning.md`; preserve the original problem, the changed comparison, its conditions and the source of any hint before entering the nearest child, and return one layer after independent tool use.

Completion: the student names the changed condition and which step it acts on, or the unknown part stays explicit; a correct value alone, a restated teacher summary, or a change the teacher pointed out does not complete independent boundary discrimination.

## Teacher-only checked cases

Verify work with these; keep answers and complete routes out of an independent opening. A full-solution request follows `learn-core`'s informed full-solution choice, including its warning, its wait for a same-task choice and its evidence boundary; a hint request does not authorize it, and no prerequisite or follow-up exercise is required after it.

- **Ordered versus unranked, four people:** captain and deputy are twelve ordered choices (4×3). Choosing an unranked group of two gives six groups: each group corresponds to exactly two ordered choices (roles swapped), and that is a claim about **every** group, not one example. Use one pairing as a probe, then ask for the covering argument or the group-by-group check.
- **Same change with five people:** unranked choose-two gives ten groups, and the ranked version gives twenty. Define the object first: choosing two places in a race is ordered, a team list is not. Halving every “choose” question, or answering ten when the roles are present, both come from skipping the object.
- **Changed start with the same rule:** the triangular-dot count from one row of one dot still gives T(10)=55; starting one row later only moves the start and the final size. The recurrence T(n)=T(n−1)+n survives; this is a near transfer, not a limit.
- **Changed increment:** let row k contain 6k dots, for k=1 through 6. The total is 6×21=126. Two reversed copies make six rows of 42 dots, so the pairing still works although the recurrence now adds 6k instead of k. Ask which part of the old reasoning survives.
- **Changed price table:** sell twenty tickets. Cheap tickets always cost 2 yuan; the first ten dear tickets cost 5 yuan each and each additional dear ticket costs 6 yuan, regardless of sale order. Twelve dear and eight cheap tickets total 10×5+2×6+8×2=78. The old constant-gap calculation gives (78−40)/3=38/3, so it no longer applies across the price boundary, although a solution exists.
- **No answer versus broken route:** with uniform prices of 2 and 5 yuan, twenty tickets can total only 40+3k for an integer k from 0 to 20; 65 is impossible because 65−40=25 is not divisible by 3. Contrast this with the tiered-price 78-yuan case: failure of the old calculation there does not mean no solution.
- **Claim after a changed condition:** thirteen people in twelve months still forces a shared month, and adding a thirteenth category or preserving “one person per category” changes which step carries the argument; the count of objects against the count of allowed kinds is the load-bearing step, not the story.

## Boundaries with Other Files

`references/math-teaching-core.md` selects the method; the act allocation stays with `references/learn-act-allocation.md`; `references/mathematical-strategies.md` owns the three method families and student monitoring; `references/problem-design.md` designs the original and the neighbouring tasks; `references/proof-teaching.md` owns direction, scope and counterexample checks; `references/early-algebra.md` owns recurrence scope; `references/prerequisite-learning.md` owns tool-learning children and one-layer return; `references/math-segment-fields.md` owns the single segment. This file only adds the one-condition change, the three outcomes and the survival statement, and does not restate them.
