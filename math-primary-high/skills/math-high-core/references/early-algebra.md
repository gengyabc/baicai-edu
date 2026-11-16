# Early Algebra (CGI Relational Thinking and Generalization)

CGI's early-algebra work (Carpenter, Franke & Levi; Jacobs and colleagues) builds algebraic reasoning from the student's own arithmetic strategies: from computing one value, to using a relationship between quantities, to stating and justifying a general rule. The aim is not earlier use of letters; a letter enters when it names a quantity the student already reasons about.

## When to Read

- The task belongs to `equality-variable` or `patterns-generalize` in `references/topic-map.md`, or to the `beginning_symbolic_relations` domain.
- The student treats `=` as "write the answer next", uses compensation, or relates the two sides without computing.
- The student claims an arithmetic property or a pattern holds in general, asks why it holds, or wants a letter for a varying quantity.
- A table or sequence links two changing quantities, a generation action splits old and new parts, or a claimed continuation needs its rule checked.

## Five Directions

The directions are a revisitable guide (relation → property → generalization → variable → relational modeling), not a sequence of grades and not a content gate. Pick one per task step by the goal and evidence.

| Direction | Task structure | Evidence to seek |
|---|---|---|
| Relational thinking | Open equality with coordinated changes | Explains how changing one side constrains the other |
| Equivalence | True/false or open equalities with varied result position | Judges equality from the relation, not only by computing both sides |
| Generalized arithmetic | A student conjecture about operations | States scope, tests other operations/counterexamples, and gives a covering reason; letters optional |
| Variables | A generated quantity at small, far and variable sizes | Explains the quantity named by the letter and the contribution of each term |
| Functional thinking | Two varying quantities in linked representations | Explains their dependence and maps the same relation across representations |

Choose numbers so that computing remains possible and a relational route is the student's choice. Do not name the strategy ("compensation", "commutative law", "function") in an assessment item; a labeled instructional example may name it after the student has worked with the idea.

## Teaching Moves

The CGI cycle across turns: pose a task with mathematical structure; observe the student's own strategy; ask about, compare, and explain the strategies actually used; support a generalization and pose the next task from it. One step per turn, per "One Action per Turn" in `references/math-teaching-core.md`.

- Computing both sides is a valid method; ask about its details before inviting another route, and never require a switch.
- Ask the student to make their own true sentences or cases; each is new evidence and is checked.
- For a conjecture, state its scope with the student, seek a counterexample (subtraction is a natural one for swapping), and ask for a reason that covers every case in the scope. Examples alone do not establish a general claim.
- For a variable, move from small cases to a far case before the letter, so it names a quantity the student already computes.
- For functional thinking, ask the student to link two representations of the same relation and say what each part of the expression counts.
- Do not demonstrate solving an equation by formal manipulation unless the student explicitly asks; then use labeled explicit instruction per `references/math-teaching-core.md`.

## Structural recurrence

Read this branch when a stated generation action separates an old object from its new part, or when extrapolation from a finite prefix needs checking. Words, tables, paper diagrams and student-submitted representations can carry the reasoning; letters and method names are optional. Use the existing teaching moves above, not a second observation-to-formula sequence.

### Scope, state and goal

Distinguish an observed conjecture, calculation from a given generation rule, and a reason covering every allowed size. A finite prefix by itself leaves the next term **not uniquely determined**. State the generation assumption behind a candidate; a different continuation is not wrong merely for departing from the expected one. This is the same finite-prefix boundary used for cycles in `references/mathematical-strategies.md`, not permission to invent a repeat rule.

| Part | What to establish |
|---|---|
| Initial state | The starting size and its count; changing the start requires checking it again |
| State | What is being counted at the current size, with enough information to determine the next step |
| Increment | What the stated action retains, adds or removes; why retained and added parts cover the next object exactly once |
| Recurrence | How to obtain the next count from the state and scale; why the action works throughout the stated range |
| Closed form | A direct count for a requested size without computing all preceding counts; a separate goal, not a condition for valid recurrence |
| General reason | Why the count follows at any allowed size, not just at sampled sizes; a structural explanation can suffice without formal induction |

For a numerical target, accept a valid stepwise count that explains its coverage. If a general formula becomes the student's goal, use the **Formula-goal gate** and the planning/bridging loop in `references/derivation-teaching.md`; for full-scope argument checks use `references/proof-teaching.md`. These own general derivation/proof rather than this supplement. Confirmed route-critical tool gaps use `references/prerequisite-learning.md`, including recovery and single-parent return. Shared informed full-solution choice and exit rules still apply; transfer or a closed form is not compulsory at the end.

### Respond to the actual starting point

| Evidence | Smallest useful action |
|---|---|
| Can draw small objects but has no counting route | Compare one size with the next: locate what remains and what is new, leaving the increment/count to the student |
| Has found the new row or another valid stepwise route | Keep it; check the starting count and that every part is counted once. A longer calculation is not an error and need not be replaced by a formula |
| Gives a correct expression but lacks a reason | Ask what each term counts or where a pairing/construction covers the whole object. More successful substitutions do not supply a general reason |

At a real decision, help the student judge what their attempt establishes and whether the generation rule is given or conjectured; teacher replanning is not student monitoring. When offering a new pairing or joining construction, explain its purpose and label it teacher-supplied. Later substitution, dividing by two, or repeating the construction is supported work, not independent discovery or student monitoring.

### Private structural checks

Keep worked answers out of an independent opening; guided work reveals only the next permitted bridge.

| Route | Verify |
|---|---|
| Stepwise count | Initial size/count, exact new part, no recounting of retained parts, and coverage through the requested size |
| Joined or paired copies | Every part in every copy is represented once; each factor and any division have a counting meaning |
| Same structure in a new setting | The student makes the old/new connection; a recalled quotient alone leaves generalization unknown |
| Changed sharing, start or increment | Identify the changed condition before revising the start/transition; recheck coverage |

Teacher-supplied pairing or joining remains route help; later arithmetic does not establish its discovery.

Completion and evidence: judge against the original goal, linking local generation to the whole count and its starting range. In the existing `strategy_summary` and single segment, separate sampled values, conjectures, justified recurrence, closed-form reasoning, teacher supply and supported execution. Pure teacher demonstration contributes no student performance; unknown generalization stays unknown. A valid recurrence may finish a recurrence/numerical task without a closed form or formal induction.

## Boundaries with Other Methods

This method owns arithmetic-structure tasks: equality, relational strategies, properties of operations, generated old/new counts, and the step from cases to a letter or a two-quantity relation. Variation and contrast may compare the same relational change across different operations. Inquiry and proof owns other pattern and geometric claims; Pólya owns unfamiliar multi-step problems even when they use an unknown. Use one primary method per task step.

## Misconception Probes

Use the minimal discriminating contrast in `references/strategy-diagnosis-rules.md`; reuse work already shown. These probe pairs are options, not a fixed two-question requirement.

| Misconception | Minimal contrast |
|---|---|
| Equals means "the answer comes next" | Reverse the result position or place unknowns on both sides |
| Examples prove a rule | Ask whether the sampled cases cover the claim; distinguish a case outside scope from a counterexample |
| A letter labels an object rather than a quantity | Ask for its numerical value in one case and what a term counts |
| Every increasing relation is proportional | Compare constant-ratio growth with growth containing a nonzero fixed part |

## Evidence and Stage

Record by topic in `strategy_summary`: the sentence or task form, whether the student computed values or used a relation, their rule in their words, the scope they gave, and any representation they linked. Map onto `symbolic_strategy_stage` per `references/progression-map.md`:

| Student evidence | Stage value |
|---|---|
| Computes each side or each case; no relation used | `arithmetic_only` |
| Finds an unknown or judges a sentence from the relation between sides, or solves one unknown by substitution or an equation | `relational_unknown` |
| Explains why a general relation must hold over a stated scope, or links two representations of the same relation | `generalized_structure` |

Credit an open-sentence solution only for the relation shown. Generalization needs what varies, what stays true, and why it extends beyond listed cases, using words, drawings, tables, actions, or symbols. Linking representations earns only the scope actually justified. Examples alone, a correct value by trial and error, or an invented symbol do not raise the stage. Work completed after a hint is recorded as supported and leaves independent evidence unknown.
