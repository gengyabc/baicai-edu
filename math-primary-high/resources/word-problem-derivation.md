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

## 5. Micro-examples (teacher planning is not the opening reply)

### Delayed chase

**Textbook task:** A leaves a point at 60 m/min. B leaves the same point 5 minutes later in the same direction at 80 m/min. Both maintain these speeds without stops. How long after B's departure does B catch A?

**Private verified route:** at B's departure A is 300 m ahead; while both move the gap shrinks by 20 m/min; catch is 15 minutes after B leaves, or 20 minutes after A leaves. Check: B travels 1200 m and A travels 1200 m. An equation using B's elapsed time t, `80t = 60(t+5)`, is equally valid.

- **Over-leading for independent solving:** give the head start, speed difference, and division, then ask for the quotient.
- **Route-finding opening when basic distance calculation is available:** put the requested catch-up time and the student's usable distance–speed–time relationship in view, then ask for one intermediate quantity or representation that could connect them. Accept a justified equation, timeline or gap route; do not require a complete plan. If a route is already shown, skip this opening.
- **More directed bridge when that connection remains unclear:** “They did not start together. At the moment B starts, where is A relative to B?” This selects the shared-event/head-start direction for the student, so record it as a route hint, not independent selection. Wait for the response; if that state is already established, reuse it rather than re-asking.
- Once the student establishes the gap, investigate how it changes during a common minute as a separate task. Only after that relation is established connect it to catch-up time. If the student writes the valid equation first, follow it rather than requiring the gap method.
- A reply of “20 minutes” needs its time origin interpreted before being judged wrong: 20 after A leaves and 15 after B leaves name the same event, but the requested time origin still matters.

### A stop changes the interval

If B in the same problem stops for 2 minutes immediately after moving for 10 minutes, the constant-closing-rate shortcut no longer covers the chase. At the stop the gap is 100 m; A adds 120 m during the stop; after B resumes, closing 220 m takes 11 more minutes. Total since B's departure is 23 minutes. Check distances: B moves for 21 minutes and A for 28 minutes, both traveling 1680 m. Keep these values for private verification; any student-visible demonstration must pass the shared reveal gate. A chain of answer-bearing hints is still a supplied solution.

## 6. Evidence and continuation

For an independent-solving goal seek the student's reason for selecting an intermediate relationship, the inference connecting it to the target, and a check against the task. A correct quotient alone does not show route selection; a complete teacher explanation alone is not student evidence. A demonstration or informed full solution allowed by the shared rules needs no forced exit test and is not independent solving evidence.

Use existing `context.turn_state` continuation descriptions for the problem, time origin/current interval, established relationships, current bridge, support, and pending question. Keep the current act/leaf owner and lifecycle resume rules. Record student-owned selections, teacher-supplied bridges, execution, and checking separately in `strategy_summary` per `references/math-segment-fields.md`; no new persistent fields for ability, submode, or general ability stage is added. Recursive tool learning uses the shared optional task-recovery plan, distinct from these ability records.
