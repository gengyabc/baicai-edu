# Counterexamples and Proposition Direction

Read when a universal or “if … then …” claim is in play and someone wants to test it: the student probes a claim without asking, a teacher example or construction raises it, or a student claim appears to contain a direction error, a scope error or an unsupported search. `references/proof-teaching.md` owns claim mapping, direction (`P → Q`, `P ↔ Q`), necessity, refutation and the validity checks; `references/derivation-teaching.md` owns the planning-and-bridging loop. This file adds only what pursuing a counterexample needs. It is not a logic course, a second proof framework, an act, a submode or a teaching owner. `math-high-session` remains the owner and keeps the current act.

## Scope and direction before hunting

State privately, from the student's own words, what objects the claim covers and which part is the condition and which the conclusion. For “every region that passes P also passes Q”, every object that passes P is a candidate; an object outside P can neither confirm nor refute it. Say the direction in words the student can check: passing P is not yet passing Q, and passing Q does not get P.

Keep the difficulties distinct: failing to see what is claimed contradicts nothing; a direction or scope uncertainty needs one decisive clarification; a possibly false statement needs a counterexample or a check the teacher cannot do privately. Do not ask the student to classify quantifiers before doing mathematics.

The premise list is the claim as written, including conditions such as “connected” or “each object used once”. Do not add premises the student did not state, and do not silently let the student weaken one.

## Necessary conditions are evidence, not a verdict

When the student derives a necessary condition — something the conclusion forces, such as a conservation, a parity or a colour count — keep that reasoning and record it as a supported relation. It does not by itself establish the claim in either direction:

- It shows any object failing the condition cannot have the desired property. The student's consequence stands.
- It shows passing the condition is required. It says nothing yet about whether passing it is enough.

Ask whether the other direction has been shown: a construction satisfying every premise and the condition, or a refutation. A failed search for a counterexample — several trials that all work — is a check that leaves the claim unproven. A finite list of successes proves the claim only when the range is genuinely finite and the check covers every case; that proof belongs to `references/proof-teaching.md`.

## Validate a proposed counterexample

Accept a candidate as a counterexample only when both ends are shown:

1. **Every premise holds**, as the statement was written. A case that fails an earlier condition, however striking, is outside the claim and does not refute it.
2. **The conclusion fails**, for the whole contradictory class the claim describes, not merely one instance of it. A construction that still admits the forbidden object shows difficulty, not failure.

The two ends are separate checks, so a student may report one without the other, for example that a specific case “cannot be completed”. Then ask which premise supplies the desired object and what is missing at the point that would need it, one missing end at a time, rather than accepting a failing attempt as a refutation. Ask the checks that are accessible with the student's tools; a premise the student cannot check directly calls for a smaller comparable case or a purposeful probe.

When the claim's class admits some members that work and some that do not, a counterexample refutes only the written claim that every member works. Say so: a tileable instance does not rescue the claim, and the refutation leaves the premise class itself open. The student's refutation does not extend into “nothing with this condition works”.

A failed trial of the opposite kind is not a counterexample either: one case that fails shows a premise or the desired object, never a universal impossibility.

## Who constructed it, and what it establishes

- **Student-constructed:** the student proposes the object and, when the evidence is still missing, supplies or checks the two ends. This is design and validation evidence, attributed to the student.
- **Teacher-supplied:** when the student's search is stuck, the teacher may give a counterexample or the comparing construction as help under **Guide before revealing** and the Informed full-solution choice in `learn-core`'s `references/pedagogy-core.md`. Label it as the teacher's. A student who then explains or reproduces why it refutes the claim shows supported understanding; the construction stays teacher-supplied and is not recorded as the student's independent search.
- **Student discovers under a teacher hint:** record the search as posterior to the hint, not as unprompted.

Redirect deliberately without handing over the answer: a direction or scope confusion gets the claim restated in the student's words; a near-miss case gets asked about its missing premises; a failed-then-abandoned search gets one concrete case to examine; a refutation taken too far gets a working instance of the same class.

## Record and stop

Only a conclusion about a claim is recorded here. Use the Proof Evidence conventions in `references/math-segment-fields.md`: the claim and scope, the student's actual counterexample or necessity derivation, teacher-supplied help, and what is still unproven. These are revisable field descriptions, not a new long-term label or a “finds counterexamples” attribute.

Session and evidence rules are already fixed. Contacting this reference stays optional: a student may decline further searching and stop; a teacher explanation, puzzle or condition classification carries no student performance, so keep the turn context-only with `session_segment: null`, and at most one merged segment per turn. Named prerequisites are material under `references/prerequisite-learning.md`. After a verified decision, the student may return to the problem, continue exploring, or end.

## Teacher-only checked cases

Teacher checks for the examples below; the rules above stay the operating source. Keep these out of an independent opening, as `learn-core`'s Informed full-solution choice requires. A counterexample given after a warning and same-task confirmation is still labelled teacher-supplied, with no compulsory prerequisites or extra cases following.

**Case A — colour balance and tiling.** Let the 4×4 region use rows and columns numbered 1–4; a cell is black when row + column is even and white otherwise, with row 1 and column 1 at the top and left edges. Delete (1,2), (2,1), (3,3) and (4,4): two black and two white. The remaining 12 cells hold exactly 6 black and 6 white, so the balanced premise holds. But (1,1) survives while both of its neighbouring cells, (1,2) and (2,1), are gone, so no adjacent two-cell piece can cover it and the region cannot be tiled. A colour count is thus necessary, because each adjacent two-cell piece uses one black and one white cell, but not sufficient. Many balanced boards are tileable, so the failure says nothing about other balanced boards; and the refutation targets the written “balanced is enough” claim while the necessity direction is untouched. A 2×2 board with one black and one white cell is the smallest check of the premise; it is not a defect in Case A.

**Case B — even degrees and one-stroke drawing.** On two triangles that share no vertex or edge, every vertex has degree 2 — all even — but drawing every edge exactly once in one stroke would have to jump between disconnected parts. A single closed stroke does cover one triangle. So “every vertex even is enough” is false for the written claim, while the strengthened claim “connected, plus all degrees even” is correct: the counterexample does not meet its added connectivity premise and does not touch it. Read degrees as the number of edges meeting a vertex, with each edge counted once, not as any number visible in a drawing.

**Case C — odd vertices.** The connected four-arm star has three arms from one centre and all four vertices odd (centre degree 3, each leaf degree 1). A one-stroke path uses each vertex inside the walk in pairs (in and out), so at most its two endpoints can be odd. No one-stroke drawing exists. This shows connectivity alone is not sufficient either, so the claim the student actually needs carries both premises and stays open until supported. Drawing one picture does not make a walk impossible; the degree count is the premise the student can check.

**Case D — what a single counterexample settles.** The “all objects whose property is P also have Q” claim can be refuted by any one object with P and without Q; searching more cases beyond the first success adds nothing. Likewise, a student who has refuted the written claim has not shown “no P-object has Q”.

## Counterexamples · contract coverage

- Voluntary probing: a proposition appears in the student's work with a universal scope and an P→Q direction, or the student's own attempt may contain one; scope and direction are stated before hunting, and contacting this reference remains optional. A refusal to continue searching is honoured.
- Necessity reasoning that the student supplies is preserved: necessary is not sufficient, and it is not recorded as an error; the reverse direction stays open until shown. A failed search is not a proof, and a finite search that covers its range is a proof only under `references/proof-teaching.md`.
- A proposed counterexample counts only when every premise holds and the conclusion fails; a check of one end alone is partial evidence, not a refutation; when the student gives only a bare “can't be completed”, for a bare “can't be tiled” claim ask, each missing premise gets one relevant clarification. A tileable instance does not rescue the written universal claim, the premise class is left open, and a faulty case refutes nothing.
- The student voluntarily constructs under a teacher hint, or the teacher-supplied counterexample is marked as help; supported understanding and independent search are recorded separately. A condition list that a student has not confirmed, or a premise that later turns out wrong, calls for one relevant clarification of that premise; do not record a correct necessity result as an error.
- Direction fixes: from even degrees alone the student must ask for connectivity. Odd-vertex counting (four odd vertices) raises the premise list back to two conditions. A student's “all balanced boards fail” → refutation of the written claim stops at the written claim, and the counterexample does not extend past the premise class; a tileable instance does not rescue the written claim.
- The fail-then-abandon handle is one nearby failing case: a specific case that satisfies every premise and violates the conclusion; not “just search more”. A teacher explanation or puzzle is teacher-supplied, with session_segment: null or at most one merged segment per turn.
- Further search and extra cases are optional; the student may stop or return. Prerequisite learning, Informed full-solution choice and exit boundaries are the with-skill integration and are kept as shared rules; no new boundary file.
