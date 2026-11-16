# Deriving Relationships in Word Problems

Use with `references/derivation-teaching.md`, `references/math-teaching-core.md`, and `references/scaffold-calibration.md` when a multi-condition or multi-stage problem requires connecting known quantities to the target, choosing an intermediate quantity, or explaining why an equation or method works. Journey, work-rate, ratio, and allocation problems can all use this bridge. This is a task-specific extension of the seven-step loop, not a new skill, act, or fixed sequence of questions.

## 1. Keep the task and goal

A fully specified textbook word problem stays in its current opening or practice act. A journey setting, several steps, or checking the answer does not by itself trigger real-world modeling. The application-modeling leaf is for an agreed real decision requiring assumptions, data choices, or a model. Load `references/proof-teaching.md` only when the goal includes constructing, understanding, checking, repairing, or organizing a proof; explaining a quantity relationship does not automatically require a formal proof lesson.

An ordinary “help me solve this problem” permits starting one purposeful bridge without a formula/discovery menu. Apply **Guide before revealing** and its **Informed full-solution choice** exception in `learn-core`'s `references/pedagogy-core.md`. Explicit complete-solution requests use that shared choice; ordinary explanations, hints, or local demonstrations keep the guided goal and receive support matched to the obstacle. Apply the Formula-goal gate only when discovering or learning a formula/general method is actually the goal, not as a prerequisite to using known distance–speed–time relationships.

Completion: the actual problem, requested help, and current teaching owner are retained; the context of a story has not replaced the mathematical task.

## 2. Map quantities before choosing a route

Privately verify the data, units, target, and constraints. Name each quantity by **object → interval → meaning → unit**. A time may mean a clock reading, elapsed time since a shared event, one person's moving time, or total journey time including stops. Establish only the distinctions relevant to the next action; a full table is not a mandatory student worksheet.

For multi-stage situations identify the events that change the relationship: departure, a stop, a turn, meeting, speed change, or completion of a work stage. Check which facts hold on each interval and at its endpoints. Preserve genuine ambiguity or inconsistent data; ask one decisive clarification rather than silently adding constant speed, simultaneous departure, or uninterrupted motion.

Completion: the next relationship uses quantities from compatible objects and intervals, with units and any missing condition explicit.

## 3. Plan backward; motivate the intermediate quantity

Privately verify feasible routes such as arithmetic decomposition, an equation, a timeline, or a quantity table. Start from the requested quantity and identify the nearest missing relationship, then connect it forward from what the student has shown. Prefer a reachable bridge over the shortest solution. Words, diagrams, tables, and equations are alternatives, not required stages; a valid student's route remains the starting point.

| Visible obstacle | Relationship worth investigating | Condition to verify |
|---|---|---|
| Two moving objects must meet or one must catch the other | Change in their separation during the same interval | Positions, directions, and speeds on that interval; whether the separation closes at all |
| Different departure times or a stop | State at a shared event, then motion on later intervals | Head start versus simultaneous moving time; elapsed versus moving time |
| Speed changes or a turn | Split at the change and connect boundary states | Segment distances/times fit the event order; no whole-journey constant-speed shortcut |
| Several workers or stages contribute to one job | Completed amount plus remaining amount, using consistent work units | Rates and active workers on each interval; additive rates only where justified |
| Ratios use different bases | Express amounts against a common reference quantity | Which whole or unit each ratio refers to |

An intermediate quantity earns its place by connecting a known condition to the target. Explain the clue and purpose of a suggested gap, elapsed time, remaining work, or reference amount; keep at least one consequential choice or inference with the student. “Set x”, “subtract the speeds”, or “draw a line” names an operation, not its reason. For a genuinely missing tool, follow `references/prerequisite-learning.md`: preserve the word problem, enter a tool-learning child through session dispatch, and return one layer after independent tool use.

Completion: the next student action has an intelligible purpose; the teacher has not supplied the whole strategic route and left only arithmetic.

## 4. Bridge and validate from the response

Use **pose → observe → interpret → bridge** with one coherent thinking task and one pending question. Distinguish selection of a useful relationship from execution of its arithmetic. If the student asks why a subtraction, variable, or auxiliary quantity was chosen, repair that rationale before assigning more computation. Reuse successful reasoning and replan on a valid alternative.

Check the resulting quantities against the original conditions: units, event order, distance or work totals, sign/nonnegativity, and all relevant intervals. A solution of an equation outside the assumed interval is not a solution of that branch. With stops or speed changes, locate the meeting/completion interval instead of extending one segment's rate across the whole task. Equal speeds with a positive gap, or a pursuer who cannot close it under the stated conditions, may mean no catch; do not force a positive time.

Completion: the relationship is justified for its interval and any computed result satisfies the original task, not merely the last equation.

## 5. Interval-sensitive route checks

| Trigger | Action | Acceptance |
|---|---|---|
| Different departure times | Connect the target and an evidenced distance–speed–time relation; leave one useful intermediate quantity or representation open | A justified equation, timeline or gap route is accepted without a compulsory complete plan |
| No connection yet | A shared-event state may be offered as the smallest route hint | Record teacher selection of that direction; reuse an already-established state |
| A separation is established | Investigate its change over a common interval, then connect that relation to the target | Keep the next inference student-owned; follow a valid equation route instead if supplied |
| A numerical time is given | Resolve its origin before judging it | Equivalent event times with different origins remain mathematically compatible; check the requested origin separately |
| Stops or rate changes occur | Split at each relevant event, preserve endpoint states, and locate the solution interval | Moving times, elapsed times and total distances/work reconcile across all segments |
| The teacher has supplied every intermediate relation | Treat later arithmetic as supported execution | A chain of answer-bearing hints is still a supplied solution, not independent route selection |

Privately verify the full route before teaching. Shared reveal rules govern any student-visible demonstration; teacher planning is not the opening reply.

## 6. Evidence and continuation

For an independent-solving goal seek the student's reason for selecting an intermediate relationship, the inference connecting it to the target, and a check against the task. A correct quotient alone does not show route selection; a complete teacher explanation alone is not student evidence. A demonstration or informed full solution allowed by the shared rules needs no forced exit test and is not independent solving evidence.

Use existing `context.turn_state` continuation descriptions for the problem, time origin/current interval, established relationships, current bridge, support, and pending question. Keep the current act/leaf owner and lifecycle resume rules. Record student-owned selections, teacher-supplied bridges, execution, and checking separately in `strategy_summary` per `references/math-segment-fields.md`; add no new persistent fields, submode, or general ability stage. Recursive tool learning uses the shared optional task-recovery plan, distinct from these ability records.
