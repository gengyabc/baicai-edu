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

Use the Proof Evidence conventions in `references/math-segment-fields.md`: claim and scope, student reasoning, supplied help, and what remains unproven.

Recording: `references/math-segment-fields.md` — at most one merged performance segment per turn for actual student work; teacher-only explanation, a choice or a plan uses `session_segment: null`. Tool children and recovery: `references/prerequisite-learning.md`. This supplement adds no method scores, obstacle labels or plan fields. Further search is optional; the student may return, continue or end.

## Private counterexample checks

Keep answers/routes private in independent work. Full-solution requests follow shared Informed full-solution choice; confirmed solutions stay teacher-supplied, with no compulsory prerequisites or extra cases.

| Proposed refutation | Required checks |
|---|---|
| A balanced region has no legal covering | Verify class balance and prove that every legal covering fails; adjacency or an isolated required part can supply an obstruction |
| A local degree condition does not guarantee a continuous edge-once traversal | Verify every stated degree condition and a separate global obstruction; retain any connectivity premise already in the claim |
| Connectivity does not guarantee an edge-once traversal | Verify connectivity and the entry/exit obstruction from too many odd-degree vertices |
| A strengthened claim adds a missing premise | Recheck the counterexample against that premise; do not reuse an object now outside scope |
| A necessary condition was refuted as sufficient | Preserve its valid necessity argument; a working instance can prevent overgeneralizing the refutation, but cannot rescue the universal converse |

Invoking a general sufficiency theorem still requires its applicable conditions and usable justification under `references/proof-teaching.md`.
