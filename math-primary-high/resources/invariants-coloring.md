# Invariants and Coloring

Read when legal operations may preserve a quantity of a changing state, or when each covering piece contributes fixed counts to chosen classes. Use `references/mathematical-strategies.md` for selection and monitoring, and `references/proof-teaching.md` for claim scope and the first load-bearing gap. Keep the current act and `math-high-session` as teaching owner; this is a method reference, not another lesson sequence.

## Structure and reachable tools

Clarify the initial state, target and every legal operation or piece orientation. Choose a quantity whose behavior can distinguish initial and target states; coloring is useful when it exposes what each legal covering piece must contribute, not because a problem contains a chessboard. A verified alternative route stays valid.

Link only needed counting, pairing and parity tools to `operation-meaning` and `factors-multiples` in `references/topic-map.md`. Plain language, row counts and paired objects can replace coordinate notation. A student's inability to select a quantity does not imply inability to count or use parity. Unknown tools get a minimal discriminating probe; a confirmed gap follows `references/prerequisite-learning.md` through the existing session dispatcher. Preserve the original problem, answer, pending position, established directions and support, especially who supplied the coloring/state quantity. Return one layer after independent tool use and reconnect it to the still-unverified parent inference; the child answer is not the parent answer.

## Bridge from actual work

Give one coherent reasoning task and wait; these are alternative starting points, not questions to ask together:

| Actual evidence | Next useful bridge |
|---|---|
| I0: “I tried tiling several times and failed.” | Retain the attempts as exploration, not an impossibility proof. Ask what relation the two cells under any one legal piece share. If a representation is needed, explain “I suggest alternating colors so we can compare what each piece removes”; label this as a teacher-supplied key step. Leave its consequence to the student. |
| I1: “Horizontal pieces cover one of each color; I have not checked vertical.” | Preserve the established horizontal reason. Ask why a vertical move between adjacent rows changes the color for every position, rather than testing a few placements or restarting the whole argument. |
| I2: “Impossible because the color counts differ.” | Keep the counts and conclusion provisional. Ask why a complete covering would require equal counts; connect the missing per-piece contribution to the whole board without recounting everything already justified. |

When the student supplies a valid reason for only one orientation, address the other before claiming preservation for all legal operations. If both directions are established but the initial-to-target link is missing, address that link instead. Following a teacher's coloring/counting instructions is supported execution, not independent discovery or strategy monitoring.

## Validate the invariant and its direction

Define the state quantity, establish its initial value, prove its behavior for **every legal operation type**, and compare with the target's required value. For tiling, use the remaining uncovered cells; a piece removes its contribution from these counts. A few failed tilings or sampled moves cannot exclude all sequences. If the quantity is preserved and target values differ, reaching the target is impossible.

Matching values only mean this test has not ruled out the target: a necessary condition is not sufficient and does not give a construction. A claimed possible tiling needs an actual legal covering or a separate sufficient argument. Check that a proposed construction covers exactly the required cells without overlaps or gaps.

If diagonal pairs, other piece shapes, rotations or other operations become legal, recheck each new type before reusing the quantity. Adjacent diagonal cells have row-plus-column sums differing by 0 or 2, so share a color: such a piece removes two black or two white cells, changing black-minus-white by −2 or +2. The old difference is no longer invariant. Losing this obstruction does not prove a tiling exists; leave reachability open without a separate proof/construction.

## Teacher-only checked cases

Use for verification, not to disclose the full route in an independent opening. Explicit complete-proof requests follow `learn-core`'s informed full-solution choice with its same-task warning/confirmation; this reference adds no prerequisite or compulsory exercise. An ordinary hint request remains guided.

- **Main case:** Rows and columns run from 1 to 8; color (i,j) black when i+j is even and white otherwise. Initially 32 black and 32 white. Removing (1,1) and (8,8), both black, leaves 30 black and 32 white. A horizontal piece changes j by 1, so switches parity; a vertical piece changes i by 1, also switching parity. Thus every legal 1×2 piece covers exactly one black and one white cell. On remaining cells, each placement subtracts one from each count, preserving black-minus-white = −2. An empty target has difference 0, a contradiction. Equivalently 31 pieces would require 31 cells of each color. This covers both legal directions generally, not just particular placements.
- **IB1, near transfer:** A 6×6 board similarly has 18 of each; deleting (1,1) and (6,6) leaves 16 black and 18 white. Horizontal and vertical neighbors still differ in parity, so each placement preserves difference −2, incompatible with the empty target. Changing the size does not replace the preservation reason.
- **IB2, possible construction:** On a 2×2 board remove (1,1) and (1,2). The remaining cells (2,1) and (2,2) are adjacent; one horizontal 1×2 piece covers exactly them. This witness proves possible, not color balance alone.
- **IB3, balance is not sufficient:** A general region consisting only of (1,1) and (1,4) has one black and one white cell, but they are not adjacent. No legal horizontal or vertical piece fits, so it cannot be tiled despite balance. Keep the general-region scope; this is not an example of deleting two cells from a full rectangle.
- **IB4, changed pieces:** The diagonal contribution above invalidates the old invariant. For an 8×8 board with two opposite-color cells removed, or for added piece types, neither impossibility nor reachability follows merely from the old count test; verify an independent argument before either claim.

## Completion and evidence

Match the agreed goal: the student defines a useful quantity, justifies all operation types and the initial/target contradiction, repairs the specific missing reason, or verifies a legal construction. Record actual student explanations, teacher-supplied coloring/quantity, supported counts and still-unknown selection/transfer separately in existing evidence fields. Teacher-only proof or demonstration has no performance segment (`session_segment: null`); it cannot create student mastery. Use the existing single merged segment and durable-evidence thresholds, not new obstacle labels or scores.

Near transfer and changed-rule discrimination remain optional; respect refusal, pause, end and authorized target changes. Restore support attribution with the task after prerequisite learning; informed full solutions do not repair missing tools or force a migration exercise. Shared lifecycle and plan rules remain the sole authority for saving, termination and recovery.
