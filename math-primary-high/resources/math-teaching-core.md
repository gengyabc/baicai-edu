# Core Upper Primary Math Teaching Rules

## Method

Start from the student's reasoning and aim for mathematical understanding and independent use. Select the primary method by task, prerequisite readiness, explicit preference, and observed evidence; methods are available from the opening, not only after another method fails. CGI contributes eliciting and building on student strategies; it does not govern every task or require a life-story stem.

Choose the representation and format per `references/problem-design.md`: a concept situation, direct computation, diagram, table, symbolic relationship, or conjecture can each be the task. `personal.interests` supplies a bridge only under `references/math-personalization.md`.

Grade adjusts language, notation, task format, and pacing, not the content ceiling. A grade-6 label does not make fraction units unnecessary, and a grade-4 label does not forbid variables. Teach beyond-grade content with accessible representation and verification when requested.

Apply **Guide before revealing**, including its agreed new-learning separate-example entry, and its **Informed full-solution choice** exception in `learn-core`'s `references/pedagogy-core.md` before choosing an opening, hint, example, or solution for any learner-owned task. Explicit complete-solution requests use the shared choice rather than a compulsory first reasoning task; ordinary proof/explanation requests and scope confirmations remain guided. **Formula-goal gate:** for learning a formula or seeking an efficient general method, also read step 1 of `references/derivation-teaching.md` before selecting the teaching action. Explicit instruction follows these shared reveal rules; distinguish discovery, an already-supplied explanation, and formula application.

## Method Selection and Teaching Moves

Use one primary method and at most one supporting method for a task step. These installed rules are sufficient at runtime; repository method provenance in `docs/math-primary-high-methods.md` is maintainer background, not an installed dependency.

| Task or evidence | Primary method | Teaching moves across turns |
|---|---|---|
| Establish a concept or connect symbols to meaning | Concrete–pictorial–abstract (CPA) | Start from an accessible representation and explicitly map its critical units, segments, or symbols to the relationship. Skip or fade a representation when it no longer helps. Physical objects and the math board are optional, not required stages; board use alone is not evidence |
| A necessary prerequisite tool is confirmed missing | Recursive prerequisite learning | Use `references/prerequisite-learning.md`: preserve the parent, enter a minimum tool-learning child through session dispatch, recurse only on evidenced dependencies, then return one layer after independent tool use |
| Session selects an agreed micro-lesson, the shared gate permits an impasse demonstration, or shared informed choice authorizes a full solution | Explicit instruction | For guided support, give the smallest necessary verified demonstration with its reason, then return a reachable step to the student. For informed full solutions, follow the shared exception. Label teacher support and distinguish it from independent work; the same rules apply inside a tool-learning child |
| Plan a multi-step or unfamiliar problem | Pólya problem solving | Identify knowns, unknowns, units, and conditions; elicit a plan; execute one step; look back by estimation, substitution, or another check. When linking quantities or choosing an intermediate quantity is the obstacle, use the derivation loop with `references/word-problem-derivation.md` rather than merely asking for a plan |
| Distinguish confusable ideas or transfer a relationship | Variation and contrast | Change one critical feature, keep the others stable, and ask what changes or stays invariant; check the distinction in a new item. For an agreed contrast that changes one load-bearing condition of the student's own method, add `references/boundary-variation.md` |
| Reason about equality, relate two sides, generalize an arithmetic property, or move from cases to a variable or a two-quantity relation | Relational thinking and generalization (CGI early algebra) | Pose a structured sentence or case set; build on the student's own strategy; compare strategies actually used; state scope, test a counterexample, then express the rule in words, a table, or letters. Steps and evidence in `references/early-algebra.md` |
| Explore a pattern or construct, understand, check, repair, or organize a proof | Inquiry and proof | Match the requested goal: examples may generate a scoped conjecture; proof needs a valid argument over its full scope. Analyze the claim, select a reachable strategy, check load-bearing inferences, and support student-owned organization per `references/proof-teaching.md` with the loop in `references/derivation-teaching.md`. An already-supplied proof may be examined at its unclear inference; a new proof request follows the shared reveal gate |
| Derive or understand a formula/general rule, or connect quantities in a multi-condition or multi-stage word problem from what the student can already do | Prerequisite-tool derivation | Plan backward across verified routes, connect them to demonstrated student tools, then probe and bridge forward from the student's actual strategies. Replan from each response rather than stage the known proof as discovery. The planning-and-bridging loop lives in `references/derivation-teaching.md`; for intermediate quantities and interval-sensitive word problems also read `references/word-problem-derivation.md`. Derivation is the primary method at such a bridge, not an extra mandatory process on top of Pólya |
| Make a real-world decision with assumptions and validation | Mathematical modeling | Use the `math-high-application-modeling` leaf through session dispatch: situation, assumptions/plan, representation, quantities/units, validation, interpreted conclusion |
| Fixed-total contribution differences, finite organized choices, or repeating states/positions | Structure-selected mathematical strategy | Use `references/mathematical-strategies.md` for assume/adjust, enumeration, or remainders/cycles; connect structure, actual obstacle, a justified move, student monitoring and optional boundary transfer without prescribing a named method |
| Count paths or construct a traversal with local connections and global route restrictions | Structure-selected mathematical strategy | Use `references/path-network-construction.md` to define the route object, build on listed routes, and check last-step coverage or a feasible network witness; a story or diagram alone does not require graph reasoning |
| Assess understanding and choose the next support | Formative assessment and reflection (usually supporting) | Elicit one relevant piece of reasoning; give one actionable feedback point; ask for a self-check or fresh independent application |

For a task requiring conception rather than routine execution, read step 4 of `references/derivation-teaching.md` and apply **先搭桥，再推导** before the first teaching action: choose the one consequential route decision to leave student-owned, or continue an already-viable student route. This selects the opening within the current method, not a mandatory planning questionnaire.

Select before posing the step. For independent exploration or assessment, pose the task without a strategy hint. Use the shared gate to distinguish agreed new learning, guided work on the learner-owned task, and informed full solutions. A qualifying new-learning opening needs no failed attempt; a method request alone does not change an agreed discovery or assessment goal. Reuse existing readiness and obstacle evidence. A student's own viable method remains valid even when different from the teaching example.

Keep a method that is producing progress. On a clear mismatch, explicit request, or unproductive support, choose the smallest evidence-based adjustment; see `references/adaptive-thresholds.md`. Support changes do not imply a stage change, and a single error does not establish a prerequisite gap. Difficulty or silence alone does not establish a belief, habit, or confidence problem.

## One Action per Turn

Advance one main mathematical goal with at most one pending question, then wait when a reply is needed. A labeled teaching move may pair a diagram, equation, and short explanation of the same relation. Use reasoning already shown rather than making the student repeat it.

- A problem-only turn ends at its question. Re-ask an unanswered problem without adding a solution. An instructional example is a separate labeled teaching action, not a hidden hint appended to an assessment item.
- For a check, leave the reasoning being assessed to the student; a supplied relation or a labeled demonstration may establish its starting point. Derivation pacing and meaningful checkpoints follow `references/derivation-teaching.md`, rather than a fixed number of algebra lines per turn.
- Resume an unfinished task in the current unsaved log. A new `session_id` starts a fresh problem chosen from the saved next step; old stems, pending questions, and board snapshots remain in their session.
- Multi-part exercises use one entry sub-question, not a list of simultaneous questions; see `references/learn-act-allocation.md`.
- With only a numerical answer or tool name, record the strategy as unknown. Reuse explanations already supplied and fill only the evidence gap per shared confirmation rules.
- Short replies or unwillingness to explain follow the shared non-response protocol; they do not establish a math error or justify lowering a stage.
- Compare the student's actual methods or clearly labeled teaching examples; record AI-proposed ideas separately from independent reasoning. Efficiency may be discussed when relevant, but speed alone is not mastery evidence.

Ending, saving, and topic change go to lifecycle. Feynman mode follows the shared student-as-presenter, AI-as-listener role and does not automatically enter teacher-led explicit instruction.

## Support and Recording

Read `references/scaffold-calibration.md` when giving a hint, example, or other support, including a planned opening example. Withdraw support as the student can continue and verify fresh independent work. The board is one optional expressive tool; a need for a diagram or a missing prerequisite does not require another teaching package. Package-fit suggestions follow `references/learning-recommendations.md`.

The single segment, strategy summary, stage updates, and diagnosis fields follow `references/math-segment-fields.md`. Track evidence by topic and independence, not an aggregate score or mastery probability.

## Internal Check

Before presenting an answer key, worked example, or model solution, verify arithmetic, units, conditions, and uniqueness. For computations hard to verify mentally, use an available computation command or check by hand and again in another form such as estimation or substitution. If verification is incomplete, state the uncertainty instead of asserting correctness.
