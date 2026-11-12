# Proof Teaching

Use with `references/math-teaching-core.md`, `references/scaffold-calibration.md`, and `references/derivation-teaching.md` to construct, understand, check, repair, or organize a mathematical proof. This file extends the seven-step planning-and-bridging loop; it is not another mandatory lesson sequence or a new teaching owner. In Feynman mode keep the student as presenter. Shared question, support, evidence, and lifecycle rules still apply.

## 1. Map the claim and goal

Distinguish independent construction, understanding a supplied proof, checking/repairing an argument, and writing up an already-found argument. Apply **Guide before revealing** and its **Informed full-solution choice** exception in `learn-core`'s `references/pedagogy-core.md` before proof delivery. Ordinary “how to prove”, explanation requests, hints during construction, and scope confirmations remain guided; explicit complete-proof requests use the shared informed-choice path. In guided work, clarify the claim if needed, then pose one reachable reasoning task and wait. A supplied proof means material already present or a verified demonstration allowed by the shared rules. Exploration and derivation also retain the goal gate in `references/derivation-teaching.md`.

Privately identify the assumptions, conclusion, domain/quantifiers, definitions, and logical shape: implication, equivalence, universal property, existence, uniqueness, identity, inequality, or geometric relationship. Check truth and edge cases before planning a proof. A false or under-specified statement calls for a counterexample or one relevant clarification, not a manufactured proof or silently added assumption.

- For `P → Q`, keep the direction explicit: P is sufficient for Q; Q is necessary for P. For `P ↔ Q`, justify both directions unless an established equivalent criterion already covers them.
- Finite examples and numerical or diagrammatic tests can motivate a universal conjecture; one genuine counterexample refutes it. A valid witness can prove existence if it satisfies every requirement. An exhaustive finite check can prove a genuinely finite claim when all cases and checks are justified.
- A diagram can support a general argument when its stated relationships justify every inference; appearance or measurement alone does not establish those relationships.

When the claim is to be tested rather than proved — a proposed counterexample, a necessary condition someone hopes is sufficient, an attempt to refute a universal claim, or a supplied example or construction that should show why a claim fails — read `references/counterexamples-and-proposition-direction.md` before the next action. It adds how the two ends of a counterexample are checked and how it is attributed; this section keeps ownership of direction, necessity and refutation.

Completion: the claim's scope and requested output are clear enough to choose a next action; truth and missing assumptions are not taken on faith.

## 2. Connect tools to candidate routes

Use the starting-point and backward-planning steps of `references/derivation-teaching.md`. Retain demonstrated / self-reported / unknown tools and their support conditions. Distinguish executing a tool from selecting and justifying it. Compare feasible routes privately, locating the earliest uncertain strategic bridge and its student-visible clue. Keep only concise continuation notes, not private deliberation.

Candidate strategies are options, not keyword rules or a student checklist:

| Claim structure | Candidate route | Decisive check |
|---|---|---|
| Implication `P → Q` | Direct proof or contrapositive `¬Q → ¬P` | Is the new direction more accessible, and is its logical equivalence understood? |
| Negation or impossibility | Contradiction | Which incompatible facts follow from the negated claim? |
| Existence | Construct a witness or use an established existence result | Does the object exist and satisfy all requirements? |
| Uniqueness | Compare any two candidates | Does their equality follow for arbitrary candidates, after existence is settled if required? |
| Natural-number or recursive structure | Induction when available | Correct starting case, induction hypothesis, and step over the full domain? |
| Structurally different cases | Exhaustive case split | Are all possibilities covered? |
| Geometric relationship | Direct properties or auxiliary construction | What visible constraint motivates this particular object and ensures it can be constructed? |
| Equality or inequality | Transformations, bounds, known results, or invariants | Which steps are reversible, and are domain and inequality direction preserved? |

For a genuinely missing logical tool, follow `references/prerequisite-learning.md`: preserve the proof goal and enter a tool-learning child through session dispatch. Teach normally once its prerequisites are available; return one layer after independent use and reconnect to the proof obstacle. A candidate strategy is useful only through specific available relations; knowing its name is not a prerequisite. A supplied construction needs an origin and purpose and remains teacher-supplied evidence.

Completion: one verified candidate has a reachable next strategic decision, or one specific missing tool is selected for teaching; neither a whole route menu nor an unexplained trick is assigned to the student.

## 3. Bridge from the current obstacle

Use **pose → observe → interpret → bridge** inside the actual proof where possible. These local descriptions help choose an action; they are not ordered software states or a diagnosis model:

| Current obstacle | Next useful teaching action |
|---|---|
| Unpack claim | Clarify one decisive condition, definition, domain, or quantifier |
| Choose route | Connect a known fact to a useful intermediate relation; contrast routes only when their tools are accessible |
| Execute reasoning | Support the specific blocked operation or logical tool, then return to its purpose |
| Validate | Examine the first load-bearing gap using the checks below |
| Organize proof | Ask the student to connect their established facts into an argument |
| Transfer | On an agreed nearby task, vary one structural feature and observe method selection |

Use the student's response to move between obstacles, including returning to an earlier one. Give one coherent thinking task and one pending question, then wait. A suggested direction should leave a meaningful inference or strategic choice to the learner. A fresh clarification earns its place only if it changes the teaching decision.

Completion: the next action responds to an evidenced obstacle, with its purpose visible and a meaningful action still belonging to the student.

## 4. Validate the argument

Inspect the student's actual reasoning, not the teacher's planned route. Use **facts → warrant → claim** to locate why an inference follows (a lightweight argument check, not a substitute for mathematical logic). Check:

- **Unsupported warrant:** a definition, theorem, or intermediate claim is missing, unproved, or applied outside its conditions.
- **Circularity:** the target or an equivalent statement was assumed without independent justification. Explicit temporary assumptions in contradiction or induction have their own discharge requirements; they are not automatically circular.
- **Direction error:** a converse is substituted, a one-way operation treated as equivalent, or an inequality reversed incorrectly. Working backward is planning; the final proof still needs a valid forward implication or justified equivalences.
- **Scope error:** examples replace a general reason, quantifiers change, domain restrictions disappear, or boundary cases are missed.
- **Construction error:** an auxiliary object or witness lacks existence or required properties.
- **Incomplete cases:** possibilities are omitted, or an induction base/step fails to cover the domain.

Respond to the first load-bearing gap rather than a list of all omissions. State what is established and what justification remains. Routine omitted arithmetic is not necessarily a logical gap. A valid student alternative replaces the planned route after verification. A failed conjecture can produce useful checking evidence; an unsupported teacher suggestion should be acknowledged and withdrawn.

Completion: the disputed inference is justified, repaired, or left explicitly open; a successful calculation has not concealed an invalid strategy.

## 5. Organize, close, and record

Match evidence to the actual goal:

- **Independent construction:** the student explains the strategic choice, justifies the key inference, and organizes the whole argument with correct scope and no hidden assumptions. Invite their own write-up and self-check of the reasoning chain when that evidence is still missing; reuse an already complete submission.
- **Supplied-proof understanding:** the student explains why the load-bearing step follows; this does not establish independent construction.
- **Repair:** the student identifies and actually closes the gap, checking any changed conditions or cases.
- **Write-up:** the student's established ideas become a connected argument from conditions to the stated conclusion; supplying polished prose for them is not evidence of their organization skill.

Completion criteria describe evidence to seek, not compulsory exercises after a shared-rule demonstration or informed full solution, or a requirement to continue when the student wants to stop. Mark supported completion, reconstruction after answer exposure, and independent construction separately. Transfer is optional and follows agreement; recitation does not show when a strategy applies.

In existing `context.turn_state`, retain only the current claim/scope, goal, provisional route, local obstacle, tool evidence/support, teacher-supplied help, and pending question needed to resume. These proof descriptions within existing state are not new required keys, profile fields, stages, or mastery probabilities. A confirmed tool gap uses the separate optional task-recovery plan in `references/prerequisite-learning.md`; it is not a proof diagnosis field. Follow `references/math-segment-fields.md` for the single segment and shared thresholds for durable confirmation. An unfinished proof alone is not evidence of a student difficulty.

Completion: the record states what the student established, under what support, and what remains unknown without turning completion of the teaching process into a mastery claim.

## 6. Micro-examples (adapt, do not recite)

### Implication: square even implies integer even

For every integer n, if n² is even then n is even.

- **Over-leading during construction:** “Use contrapositive, write n = 2k+1, expand, and fill in the last line.” All strategic choices were supplied.
- **Reachable hint when parity is available:** “Going from the square back to the integer is the obstacle. What could studying the square of an odd integer tell us?” Wait. Once the student establishes that relation, ask why it settles the original claim as a separate thinking task.
- **Missing logical tool:** explicitly teach why `P → Q` and `¬Q → ¬P` are equivalent using a small separate example, then reconnect. Expansion of `(2k+1)²` is execution evidence; explaining why this route proves the original implication is strategy evidence.

### Circularity versus legitimate assumptions

To prove the sum of two odd integers is even, a student says “let their sum be 2k; therefore it is even.” Ask what licenses writing the sum in that form: the conclusion was assumed. The repair starts with the known forms of the two odd integers, not the assumed form of their sum. In contrast, explicitly assuming a negated conclusion for contradiction is legitimate when the resulting contradiction is justified and the assumption discharged.

### Construction and alternative routes

A parallel auxiliary line cannot be justified merely by “it makes the proof easy.” Connect the missing angle relation to the parallel-line property; if the construction is new, supply and label it, then let the student justify its consequences. If the student instead gives a valid area-based proof under the given assumptions, verify and follow it. Do not require the planned auxiliary line or record its discovery as the student's.
