# Proof Teaching

Use with `references/math-teaching-core.md`, `references/scaffold-calibration.md`, and `references/derivation-teaching.md` when the student's task is to **construct, understand, check, or repair a mathematical proof**. This reference **extends**, rather than replaces, the seven-stage planning-and-bridging loop in `derivation-teaching.md`. It does not change the shared question, feedback, evidence, scaffold, or lifecycle policies. **Backward planning is for the teacher; forward reasoning is for the student.**

## 0. Route and goal gate

- Trigger for claims that require justification over a stated scope: geometry proofs, number theory, algebraic identities requiring proof, inequalities, existence/uniqueness, implications/equivalences, counterexamples, and mathematical induction. For a formula-discovery task, use `derivation-teaching.md` as primary; activate this file when the goal turns to rigorous proof.
- Distinguish: **explore/conjecture**, **derive**, **construct an independent proof**, **understand a supplied proof**, **check/repair a proof**, **write up an already-found argument**. Do not silently substitute one goal for another. Preserve the student's explicit request for a complete proof or explanation as permitted by the shared goal gate.
- Examples, diagrams, numerical tests, and symbolic experiments can generate ideas or disprove a universal claim via counterexample; they are not, by themselves, a proof of a universal claim.
- A problem may be false, under-specified, or admit no proof under the given assumptions. Check truth, scope, edge cases and assumptions before engineering a route; do not manufacture a proof.

## 1. Map the claim (extends derivation step 1)

Privately identify: the **given assumptions**, **claim**, **domain/quantifiers**, and **logical shape** (if–then, equivalence, universal, existential, uniqueness, identity, inequality, geometry incidence/congruence). Note implicit domain restrictions (such as nonzero denominators) without silently adding assumptions. If helpful, ask the student to restate one critical part **only when it changes the next move**.

- For `P → Q`, separate sufficient and necessary directions. For `P ↔ Q`, both directions need justification unless an established equivalent criterion covers them.
- For universal claims, a single genuine counterexample disproves; examples cannot prove the general case. For existential claims, a valid witness may establish existence, if it satisfies all conditions.
- Separate a **candidate statement** from a **proved statement**, and the **mathematical target** from a particular teacher-preferred method.

## 2. Locate usable tools and student agency (extends step 2)

Reuse existing demonstrated/self-reported/unknown evidence; avoid re-testing. Distinguish ability to **execute** an operation from ability to **select and justify** its use. Relevant tools may include definitions, parity, divisibility, equivalent transformations, geometric properties, construction, contradiction, contrapositive, induction, case division, invariants, and inequalities. This is a *teacher's menu*, never a mandatory student checklist.

Preserve an authentic student choice: a representation, a lemma, an approach, an inference, a counterexample test, or a check of a disputed step. Do not supply a whole route and call the remaining expansion or blank “discovery.”

## 3. Plan plausible routes privately (extends step 3)

Verify one or more correct routes where feasible. For each route record briefly:

1. **Why consider it?** A clue visible from the current claim or student's work, not hindsight from the hidden solution.
2. **Critical bridge:** the earliest non-obvious selection, lemma, construction, or logical transformation.
3. **Required support:** which tool is demonstrated, only self-reported, or unknown.
4. **Validity checks:** where a direction of implication, equivalence, boundary case, or unproved lemma could fail.
5. **Fallback:** alternative route or one explicitly taught tool if the bridge is not reachable.

Common options—**never deterministic rules**:

| Mathematical structure | Route to consider | Why it may help / what to verify |
| --- | --- | --- |
| Implication `P → Q` | Direct argument or contrapositive | Is `¬Q → ¬P` easier, and does the student know the equivalence? |
| Impossibility or negation | Contradiction | What incompatible statements would actually follow? |
| Existence | Construct a witness or apply a valid existence result | Does the candidate satisfy *every* requirement? |
| Uniqueness | Assume two candidates and compare | Does the argument establish equality for all candidates? |
| Natural-number/recursive structure | Induction | Base case, exact induction hypothesis, and step all valid? |
| Distinct structural cases | Exhaustive case split | Are cases jointly exhaustive and all covered? |
| Geometry requiring an auxiliary object | Construction | What visible constraint motivates this *specific* object? |
| Algebraic equality or inequality | Reversible transformation, known inequality, bound or invariant | Does every step preserve the claimed direction and domain? |

The shortest proof may be a poor learning route. Prefer a student-reachable next strategic decision and meaningful visible progress. A teacher-supplied construction must be named honestly and motivated; do not retrospectively label it student invention.

## 4. Choose the next bridge (extends steps 4–5)

Use the shared **pose → observe → interpret → bridge** cycle. Identify the current obstacle in one of the following lightweight *local* states (no new profile or classifier):

- **Unpack claim:** condition, conclusion, domain, or quantifiers are unclear.
- **Choose route:** student can compute but cannot identify a useful direction or intermediate result.
- **Execute reasoning:** chosen strategy is sound but a specific tool or transformation blocks progress.
- **Validate:** an implication, equivalence, construction, or case is unjustified.
- **Organize proof:** key ideas exist but cannot yet form a complete written argument.
- **Transfer:** assess whether the student can recognize when a method will help in a nearby problem.

States are not a mandatory sequence. One response can move between them. Prefer a meaningful action *inside the real proof*; isolate a short subproblem only if it diagnoses or teaches a specific bridge.

At each turn: **current fact → mathematical obstacle → reason to try → one meaningful student action**. Explain the purpose of a suggested move without predetermining all choices. Give one coherent thinking task rather than a mechanical series of tiny calculations. If the student requests a direct explanation or full solution, honor the agreed level and label what was supplied.

## 5. Validate both strategy and logic (extends step 6)

Check the student's actual argument; ask for a justification at a decisive gap rather than treating every omitted arithmetic line as a problem. In particular look for:

- **Unsupported warrant:** the conclusion does not yet follow from the cited facts or theorem.
- **Circularity:** the target claim, or an equivalent of it, was assumed without justification.
- **Direction error:** using a converse as if it followed, or treating a one-way operation as reversible.
- **Scope error:** examples substituted for a universal argument, quantifiers changed, special cases generalized, boundary cases or domain restrictions missed.
- **Construction error:** an auxiliary object or witness lacks existence, required properties, or justification.
- **Incomplete cases:** not all logically possible cases handled, or base/step missing in induction.

Respond to the *first load-bearing gap* relevant to the learner, not a laundry list. Give specific feedback on what is established, what is still open, and what next fact would close the gap. A counterexample that invalidates an attempted generalization is evidence of productive checking, not proof failure to be concealed.

When the student presents a valid alternate proof, accept it after mathematical verification; do not force the planned route. If the suggested move lacked a genuine rationale, acknowledge and withdraw it, then replan. After unproductive attempts revisit the bridge or teach the missing tool; do not infer low ability.

## 6. Close on the actual proof goal (extends step 7)

For **independent proof construction**, seek evidence that the student can (a) explain the main strategic choice, (b) justify the load-bearing inference, and (c) organize the whole argument with correct scope and no hidden assumptions, ideally with faded support. For **understanding a supplied proof**, request explanation of why its key step follows; for **repairing a proof**, verify the identified gap was actually repaired. A reconstructed proof after answer exposure is *supported reconstruction*, not independent discovery.

Do not force a transfer exercise if the student asked only for a direct proof. If a nearby task is useful and welcomed, vary one structural feature to see whether the student knows *when* the method transfers rather than merely repeating steps.

Reuse the existing `context.turn_state`: provisional route, local obstacle, evidence/support, student-owned moves versus teacher-supplied moves, and any pending question. No new persistent profile field or BKT/IRT/CDM component. The shared evidence thresholds control durable mastery claims.

## 7. Micro-examples: strategy ownership and honest hints

### A. Implication and contrapositive (number theory)

**Claim:** For every integer `n`, if `n²` is even then `n` is even.

- **Over-leading:** “Use contrapositive; set `n = 2k + 1`, square and simplify.” This makes the teacher's strategic choice invisible and leaves mainly execution.
- **Better when parity is known:** “We need to get from the parity of `n²` to the parity of `n`. What can you say about the square of an odd integer? If you establish that, how might it relate to the original claim?”
- **If the equivalence of contraposition is unknown:** Teach briefly that `P → Q` is logically equivalent to `¬Q → ¬P`, illustrate on a separate simple claim, then reconnect. Do not assume the student discovered the logical principle.
- **Evidence:** A student who only expands `(2k+1)²` showed execution; a student who explains the reason for choosing the opposite case has shown strategy understanding.

### B. Mathematical induction

**Claim:** `1 + 2 + ... + n = n(n+1)/2` for positive integers `n`.

- **Over-leading:** Supply the base case, hypothesis, replacement and expansion, then ask for the last simplification.
- **Better when induction is established:** “If the statement is true for `n = k`, how could you express the sum up to `k+1` using the sum up to `k`? What extra part must be accounted for?”
- **Validity check:** Do not turn checking `n = 1,2,3` into proof; the step from `k` to `k+1` carries the general claim.

### C. Geometric auxiliary line

- **Over-leading:** “Draw line X parallel to side Y” with no explanation, then call the construction the student's discovery.
- **Better:** First ask what relation the student is missing (angles, parallelism, congruence). If the needed line is genuinely new, teach it as a *supplied construction* and state which relationship it makes visible. Let the student test and justify its consequences.

These examples illustrate decisions, not fixed scripts to recite. Adapt to the student's evidence and the actual problem.
