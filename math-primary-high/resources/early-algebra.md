# Early Algebra (CGI Relational Thinking and Generalization)

CGI's early-algebra work (Carpenter, Franke & Levi; Jacobs and colleagues) builds algebraic reasoning from the student's own arithmetic strategies: from computing one value, to using a relationship between quantities, to stating and justifying a general rule. The aim is not earlier use of letters; a letter enters when it names a quantity the student already reasons about.

## When to Read

- The task belongs to `equality-variable` or `patterns-generalize` in `references/topic-map.md`, or to the `beginning_symbolic_relations` domain.
- The student treats `=` as "write the answer next", uses compensation, or relates the two sides without computing.
- The student claims an arithmetic property or a pattern holds in general, asks why it holds, or wants a letter for a varying quantity.
- A table or sequence links two changing quantities, a generation action splits old and new parts, or a claimed continuation needs its rule checked.

## Five Directions

The directions are a revisitable guide (relation → property → generalization → variable → relational modeling), not a sequence of grades and not a content gate. Pick one per task step by the goal and evidence.

| Direction | Task form (examples) | Questioning focus |
|---|---|---|
| Relational thinking | `48+27=50+□`, `25×12=50×□`, `3/4+5/8=7/8+□` | How do the two sides relate? What changed on one side, and what must change on the other? |
| Equivalence | True/false: `8=3+5`, `3+5=4+4`, `56−19=57−20`; open: `□+6=3+5` | Is it true, and how do you know without computing? Used for diagnosis and repair |
| Generalized arithmetic | Student's conjecture from cases such as `5+7=7+5`, `13+25=25+13` | Does it work for every number you can think of? Why? Does it work for subtraction or division? Can you say it with letters? |
| Variables | Squares in a row made of sticks: 5, 10, 100, then `n` squares | What does the letter stand for? Why does each new square add only 3 sticks? |
| Functional thinking | Table of squares `n` and sticks `S`; unit price, quantity, and total | Which quantity changes with which? Show the same relationship in a table, a diagram, words, and an expression |

Choose numbers so that computing remains possible and a relational route is the student's choice. Do not name the strategy ("compensation", "commutative law", "function") in an assessment item; a labeled instructional example may name it after the student has worked with the idea.

## Teaching Moves

The CGI cycle across turns: pose a task with mathematical structure; observe the student's own strategy; ask about, compare, and explain the strategies actually used; support a generalization and pose the next task from it. One step per turn, per "One Action per Turn" in `references/math-teaching-core.md`.

- Computing both sides is a valid method; ask about its details before inviting another route, and never require a switch.
- Ask the student to make their own true sentences or cases; each is new evidence and is checked.
- For a conjecture, state its scope with the student, seek a counterexample (subtraction is a natural one for swapping), and ask for a reason that covers every case in the scope. Examples alone do not establish a general claim.
- For a variable, move from small cases to a far case (such as 100) before the letter, so the letter names a quantity the student already computes.
- For functional thinking, ask the student to link two representations of the same relation and say what each part of the expression counts.
- Do not demonstrate solving an equation by formal manipulation unless the student explicitly asks; then use labeled explicit instruction per `references/math-teaching-core.md`.

## Structural recurrence

Read this branch when a stated generation action separates an old object from its new part, or when extrapolation from a finite prefix needs checking. Words, tables, paper diagrams and student-submitted representations can carry the reasoning; letters and method names are optional. Use the existing teaching moves above, not a second observation-to-formula sequence.

### Scope, state and goal

Distinguish an observed conjecture, calculation from a given generation rule, and a reason covering every allowed size. A finite prefix by itself leaves the next term **not uniquely determined**: after 1, 3, 6, 10, either 15 or 16 is compatible unless a further rule is specified. Say which generation assumption makes a candidate follow; a nonstandard continuation is not wrong merely for differing from 15. This is the same finite-prefix boundary used for cycles in `references/mathematical-strategies.md`, not permission to invent a repeat rule.

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

### Teacher-only checked cases

Use these to verify and plan; keep worked answers out of an independent opening. In guided work reveal only the next useful bridge under the shared rules, not this whole route.

- **Triangular dots:** for positive integer n, the nth object has n rows and row k has exactly k dots for 1≤k≤n. The state is size n and total T(n); T(1)=1. Only row n+1 is added, so T(n+1)=T(n)+(n+1). Thus T(5)=15 and T(10)=55. Continuing the student's “15, then add 6, …, then add 10” is sufficient for the numerical goal when the row coverage is explained.
- **Optional general count:** two copies, one reversed, join into n rows of n+1 dots: each row pairs k with n+1−k, accounting for every row in each copy with no omissions or duplicates. Hence 2T(n)=n(n+1), and T(n)=n(n+1)/2. Each factor and the halving needs its counting meaning. If the joining idea was supplied by the teacher, record that source; successful halving alone does not establish selection or discovery of the construction.
- **Near transfer:** a staircase has k bricks in layer k, for k=1 through 8. Its 8 layers total 36. Look for student-owned connection to the old/new layer structure, not merely a recalled quotient; generalization remains unknown without corresponding evidence.
- **Changed condition, existing stick example:** a row of n squares (n≥1), each new square sharing exactly one side, starts at 4 and adds 3, giving 3n+1. Independent squares with no shared side add 4 each and give 4n. Identify the lost shared side condition before changing the relationship; reuse the existing variable example above, not another stick lesson. A changed first layer or addition rule likewise requires a fresh start/transition check.

Completion and evidence: judge against the original goal, linking local generation to the whole count and its starting range. In the existing `strategy_summary` and single segment, separate sampled values, conjectures, justified recurrence, closed-form reasoning, teacher supply and supported execution. Pure teacher demonstration contributes no student performance; unknown generalization stays unknown. A valid recurrence may finish a recurrence/numerical task without a closed form or formal induction.

## Boundaries with Other Methods

This method owns arithmetic-structure tasks: equality, relational strategies, properties of operations, generated old/new counts, and the step from cases to a letter or a two-quantity relation. Variation and contrast may supply a short contrast set inside it (for example `48+27=50+□` beside `48−27=50−□`). Inquiry and proof owns other pattern and geometric claims; Pólya owns unfamiliar multi-step problems even when they use an unknown. Use one primary method per task step.

## Misconception Probes

Use the minimal discriminating contrast in `references/strategy-diagnosis-rules.md`; reuse work already shown. These probe pairs are options, not a fixed two-question requirement.

| Misconception | Contrasting probes |
|---|---|
| Equals means "the answer comes next" | `8=3+5` true/false; `3+5=□+6` open |
| Examples prove a rule | Ask whether two cases settle it; offer a case outside the stated scope |
| A letter is a label for an object ("`n` means squares") | Ask what number `n` is when there are 7 squares, and what `3n` counts |
| Every increasing relation is proportional | Compare `S=3n+1` with `S=4n` in one table |

## Evidence and Stage

Record by topic in `strategy_summary`: the sentence or task form, whether the student computed values or used a relation, their rule in their words, the scope they gave, and any representation they linked. Map onto `symbolic_strategy_stage` per `references/progression-map.md`:

| Student evidence | Stage value |
|---|---|
| Computes each side or each case; no relation used | `arithmetic_only` |
| Finds an unknown or judges a sentence from the relation between sides, or solves one unknown by substitution or an equation | `relational_unknown` |
| Explains why a general relation must hold over a stated scope, or links two representations of the same relation | `generalized_structure` |

Credit an open-sentence solution only for the relation shown. Generalization needs what varies, what stays true, and why it extends beyond listed cases, using words, drawings, tables, actions, or symbols. Linking representations earns only the scope actually justified. Examples alone, a correct value by trial and error, or an invented symbol do not raise the stage. Work completed after a hint is recorded as supported and leaves independent evidence unknown.
