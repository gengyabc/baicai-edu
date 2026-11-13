# Counterexamples and Proposition Direction

Read when testing a universal or “if … then …” claim, checking a proposed counterexample, or examining a necessary condition from student work or a teacher-supplied example. `references/proof-teaching.md` owns claim mapping, direction, necessity and proof validity; `references/derivation-teaching.md` owns planning and bridging. This supplement stays in the current act, with `math-high-session` as teaching owner.

## Scope and direction before hunting

Identify the objects, every premise, and the conclusion from the claim as written. For P → Q, a counterexample must have P without Q. An object outside P does not test the claim; knowing Q alone does not establish P. Use the student's words, not a quantifier quiz.

If scope or direction is unclear, ask one decisive clarification and wait. Keep stated conditions such as “connected” or “each edge used once”; check a disputed premise rather than silently adding or removing it.

## Necessary conditions are evidence, not a verdict

Preserve a correct necessity argument: if a property requires a condition, failing that condition rules the property out. Passing the condition alone does not show it is sufficient. Record the student's reasoning with its actual support level, not as an error or automatically as supported work.

For the reverse direction, seek a proof over the stated range or a counterexample. One successful construction establishes only that instance. A failed search for a counterexample leaves the claim unproven; a finite exhaustive check can prove it when every allowed case is covered, under `references/proof-teaching.md`.

## Validate a proposed counterexample

Check both ends:

1. **Every premise holds** for the proposed object.
2. **The conclusion fails** for that object. If the conclusion is “a tiling exists”, one failed tiling attempt is insufficient: rule out every legal tiling of that object.

A bare “this cannot be completed” leaves these checks open. Ask about the first missing end, one question at a time, using tools the student can handle. If a premise cannot yet be checked, use a smaller comparable case or a purposeful probe.

One valid counterexample refutes the universal claim. It does not show that every object in the premise class fails; a working instance does not rescue the refuted claim. Further examples are optional.

## Who constructed it, and what it establishes

- **Student-constructed:** record the proposed object and the premise/conclusion checks actually supplied by the student.
- **Teacher-hinted:** record the hint and the student's subsequent contribution separately.
- **Teacher-supplied:** when search stalls, offer one concrete case under **Guide before revealing** and the Informed full-solution choice in `learn-core`'s `references/pedagogy-core.md`. Label the help. Explaining or reproducing it is supported understanding, not independent construction.

Choose one useful next action: clarify an uncertain claim, check the missing premise of a near-miss, offer a nearby case after a stalled search, or examine a working instance when a refutation has been overgeneralized. Keep the next inference open to the student.

## Record and stop

Use the Proof Evidence conventions in `references/math-segment-fields.md`: claim and scope, student reasoning, supplied help, and what remains unproven. Record at most one merged segment for actual student performance; teacher-only explanation, a process choice or a plan has `session_segment: null`. These observations add no long-term label or score.

Further search is optional: the student may return to the problem, continue or end. A confirmed tool gap follows `references/prerequisite-learning.md`; the existing session and lifecycle retain recovery and exit control.

## Teacher-only checked cases

Use these for private verification, not answers or routes to disclose in an independent opening. Full-solution requests follow the shared Informed full-solution choice; a confirmed solution stays teacher-supplied, with no compulsory prerequisites or extra cases.

**Case A — colour balance and tiling.** On a 4×4 board, colour (r,c) black when r+c is even and white otherwise. Delete (1,2), (2,1), (3,3) and (4,4): two white and two black cells. The remaining cells are 6 black and 6 white, but (1,1) has no remaining neighbour, so no adjacent two-cell piece can cover it. Thus balance is necessary, because each legal piece covers one cell of each colour, but not sufficient. A full 2×2 board is balanced and tileable, so the refutation does not mean all balanced regions fail.

**Case B — even degrees and one-stroke drawing.** For finite simple undirected graphs, require one continuous stroke to use every edge exactly once. Two disjoint triangles have degree 2 at every vertex but cannot be covered by one stroke. This refutes “all degrees even is enough”, not the strengthened claim requiring all vertices incident to edges to lie in one connected component. With that connectivity condition, all-even degrees suffice for a closed edge-covering stroke; invoking the general theorem still needs usable justification under the proof rules.

**Case C — odd vertices.** The three-arm star K1,3 has four odd-degree vertices: the centre has degree 3 and each leaf degree 1. Internal visits pair arrival and departure edges, so at most its two endpoints can be odd. No one-stroke drawing uses every edge exactly once. Connectivity alone is therefore insufficient; check connectivity and odd-degree conditions separately.
