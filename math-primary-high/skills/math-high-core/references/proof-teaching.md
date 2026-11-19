# Proof Teaching

Use `references/derivation-teaching.md`'s seven-step planning-and-bridging loop with `references/math-teaching-core.md` and `references/scaffold-calibration.md`. Proof is a method in the current act; Feynman keeps the student as presenter.

## 1. Map the claim and goal

Distinguish independent construction, supplied-proof understanding, repair/checking and organizing an existing argument. Follow **Guide before revealing** and **Informed full-solution choice** in `learn-core`'s `references/pedagogy-core.md`: “how to prove,” hints during construction and scope confirmations stay guided; explicit complete-proof requests use informed choice. A supplied proof is material already present or a verified, permitted demonstration. Derivation retains its goal gate.

Privately check assumptions, conclusion, domain/quantifiers, definitions, logical shape, truth and edge cases. For false or underspecified claims, find a counterexample or clarify one decisive condition; never add premises silently.

- `P → Q`: P sufficient for Q, Q necessary for P. `P ↔ Q`: justify both directions or cite an established equivalence.
- Finite examples motivate conjectures; one genuine counterexample refutes a universal claim. A valid witness meets every existence condition; an exhaustive finite check proves only with complete justified coverage.
- Accept informal reasoning, symbols, objects or diagrams if the reasons cover scope; appearance and measurement are not warrants. Submitted geometry snapshots remain read-only material, not grounds for geometric judgments (shared board contract).

For a proposed counterexample, a necessary condition claimed sufficient, an attempt to refute a universal claim, or a supplied example or construction showing failure, read `references/counterexamples-and-proposition-direction.md` for checks and attribution; this file owns direction, necessity and refutation.

## 2. Connect tools to candidate routes

Use derivation's backward planning: verify private alternatives, distinguish tool selection from execution, and find the earliest uncertain bridge and its visible clue. Keep continuation notes, not private deliberation. Candidate strategies are options, not keyword rules:

| Structure | Route and decisive check |
|---|---|
| Implication | Direct or contrapositive `¬Q → ¬P`: is it easier, and can the student explain why it proves `P → Q`? |
| Negation/impossibility | Contradiction: which incompatible facts follow from denying the claim? |
| Existence / Uniqueness | Witness or known existence result; for uniqueness show any two candidates coincide (settle existence if required) |
| Recursive/natural-number | Induction if available: check base, hypothesis and transition across the domain |
| Distinct cases | Exhaustive split: why are none missed? |
| Geometry | Properties or auxiliary construction: which constraint suggests and licenses the object? |
| Equality/inequality | Transform, bound, use known results or invariants: check reversibility, domain and direction |

**Missing logical tool:** enter a session-dispatched child per `references/prerequisite-learning.md`, then reconnect after independent use and single-parent return. Strategy names are not prerequisites. **Over-leading during construction:** supplying strategy, candidate and steps leaves execution; identify the assessed choice. Explain and attribute supplied constructions.

## 3. Bridge from the current obstacle

Use **pose → observe → interpret → bridge** in the actual proof. Unpack one decisive definition/condition; for route choice link a known fact to an intermediate relation (contrast only accessible routes); for execution support the specific operation, then restore its purpose. To validate, inspect the first load-bearing gap; to organize, connect the student's established facts; for agreed transfer change one structural feature and watch selection. Revisit earlier obstacles as needed. Give one coherent thinking task and one pending question, then wait.

## 4. Validate the argument

Check the student's **facts → warrant → claim**, not conformity to a planned route:

- **Unsupported warrant:** missing/unproved reason or misapplied theorem or definition.
- **Circularity:** target/equivalent assumed. Legitimate contradiction or induction assumptions still need proper discharge.
- **Direction error:** converse, unjustified reversal or wrong inequality direction. Backward planning needs forward implication or justified equivalences in the proof.
- **Scope error:** examples for a general reason, changed quantifiers, lost restrictions or missed boundaries.
- **Construction error:** missing existence or required properties. An argument diagram cannot assume its conclusion; restart from established premises.
- **Incomplete cases:** gaps in enumeration or induction coverage.

Name what is established and the first load-bearing justification still due; omitted routine arithmetic need not be a gap. Verify and follow a valid student alternative. Keep useful checks from false conjectures; withdraw unsupported teacher suggestions. Repair the inference or leave it explicitly open.

## 5. Organize, close, and record

- Independent construction: strategic rationale, justified key inference, connected full-scope argument. Invite own write-up and self-check if missing; reuse complete work.
- Supplied-proof understanding: explain why the key step follows, not how to discover it independently.
- Repair: identify and close the gap; check affected conditions/cases.
- Write-up: learner connects conditions to conclusion; teacher polish is not evidence of learner organization.

Distinguish supported completion, reconstruction after answer exposure and independent construction. These checks are not compulsory exercises after permitted demonstration or informed solution, or when stopping. Transfer is optional by agreement; recitation does not show applicability.

Keep only resumption details in `context.turn_state` (claim/scope, goal, route, obstacle, evidence/help, pending question): not new required keys, profile fields, stages or probabilities. A tool gap uses the optional task-recovery plan, not a proof diagnosis. Use `references/math-segment-fields.md` for the single segment and durable thresholds; an unfinished proof alone is not a difficulty. Record established reasoning, support and unknowns.
