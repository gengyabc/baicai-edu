# Elementary Games and Winning Guarantees

Read for finite terminating deterministic perfect-information two-player games with alternating legal actions, when the target is a guarantee against every opponent response. Stay in the current act; `math-high-session` remains the sole teaching owner and dispatcher. This is a conditional method reference, not a new skill, activity, game level or mandatory lesson sequence. Use `references/proof-teaching.md` for claim scope and complete arguments.

Link only needed tools to `operation-meaning`, `patterns-generalize` and, when useful, `whole-number-division` in `references/topic-map.md`. A confirmed tool gap follows `references/prerequisite-learning.md`; unfamiliar strategy language is not itself a tool gap.

## Rules before strategy

Establish the initial state, who moves first, allowed actions (including availability limits), alternating turns, termination, winner/loser and the treatment of no legal move. Reuse rules already stated; if a decisive rule is missing, ask just that clarification and wait. Random outcomes, hidden information, draws or potentially endless play require their own clarified target; the win/lose backward rule below does not automatically cover them.

Once rules are explicit, distinguish:

- One legal winning play: winning is possible against that sequence of responses.
- A correct first move: a candidate entry into a winning strategy, not its complete explanation.
- A winning guarantee: there exists a legal move of mine and a continuation covering every legal opponent response, all the way to the correctly evaluated terminal outcome.
- No guaranteed win: with optimal opposition, every legal first move can be answered to defeat the first player. This does not mean the first player can never win against a mistake.

At a nonterminal state, winning means at least one legal move leads to an opponent-losing state; losing means every legal move leads to an opponent-winning state. Treat an immediately terminal move by its actual winner, not by an assumed normal-play rule. Backward reasoning is justified by finite termination and the correct terminal outcomes, not by a few repeating table entries. Use ordinary language rather than requiring game-theory vocabulary.

## Bridge from actual student evidence

Keep verified moves and branches, including a valid alternative to the teacher's plan. Privately track which opponent replies and terminal outcomes remain unchecked. Ask one coherent thinking task, keep one pending question and wait; do not deliver a whole decision tree as a hint. At an actual decision or stall, ask what the last branch established and which missing branch matters next; teacher replanning is not student monitoring.

| Evidence | Local next action |
|---|---|
| No starting route to a guarantee | Shrink to an accessible state and build from its terminal outcome as replies arrive; keep the losing-state table and remainder shortcut private. No idea is not evidence of inability to subtract. |
| One response branch is justified | Preserve it; examine one uncovered legal opponent response, then its legality and terminal outcome. |
| Correct first move without a reason | Preserve the move; ask for the first missing guarantee, not another calculation or a repetition of established branches. |
| Only a single winning play is demonstrated | Identify one still-legal alternative opponent response and let the student examine it. A cooperative opponent does not establish a guarantee. |
| Can organize branches but cannot execute a required operation | Confirm the specific tool gap, then preserve the parent and enter its nearest child via the existing prerequisite contract. Strategy uncertainty alone does not trigger arithmetic remediation. |

When tools are reachable, teach normally with inquiry, representations, labeled examples, explanation and fading. If division/remainders are unavailable but small states or a branch argument suffice, use that route instead of imposing division study. Tool readiness does not itself establish strategy selection or guarantee reasoning.

## Private strategy verification

Keep answers/routes private in an independent opening. An explicit complete-strategy request follows shared **informed full-solution choice** in `learn-core`'s `references/pedagogy-core.md`: warn, wait for same-task confirmation, then give the verified teacher-supplied strategy with no prerequisite or compulsory exercise. Skip/ambiguity is not authorization. Students setting a problem for the AI retain the shared student-problem role contract; do not turn them into examinees.

| Check | Acceptance |
|---|---|
| Terminal rules | Evaluate the actual winning/losing move and stop immediately; no invented action after termination |
| Winning-state claim | At least one legal move has a continuation covering every legal opponent reply |
| Losing-state claim | Every legal move has a verified defeating reply under optimal opposition; mistakes may still permit a win |
| Pairing strategy | Each reply is available, preserves the claimed relation, and reaches the correct terminal outcome |
| Backward or general argument | Correct bases and every legal transition are covered; strict progress/finite termination justifies the reasoning |
| Concrete versus general goal | A verified finite branch tree may finish a concrete task; a general remainder rule is optional and needs a general warrant |
| Changed initial state | Recheck the first move and whether the old continuation is reachable |
| Changed winner or legal action | Rebuild terminal evaluations and transitions; a previously valid remainder pattern need not survive |

A full strategy includes opponent alternatives, legal continuation and termination, not just a first move, table or slogan.

## Close, record and resume

Completion is tied to the requested scope: rules are clear and the student explains the strategy's coverage, legality and terminal result, or the unverified branches remain explicit. A correct first move, winning one play, naming a remainder or reciting a teacher's table does not alone establish complete strategy understanding. Near transfer and changed-rule contrasts are optional, not a task quota; refusal, pause and end take priority over further probing.

Use existing `context.turn_state` and `strategy_summary` for the stated rules, original student answer, verified/unverified branches, teacher-supplied table or key replies, support and pending position; these are notes, not new required fields. On interruption or a tool child, follow `references/prerequisite-learning.md`: only the active task consumes the answer, return one layer, and reconnect at the stored branch. Lifecycle handles end/target/mode changes first; do not revive abandoned goals or replay an already consumed answer.

Recording: `references/math-segment-fields.md` — at most one merged performance segment per turn for actual student work; teacher-only explanation, a choice or a plan uses `session_segment: null`. Teacher-supplied responses are help, not independent strategy evidence; later explanation after exposure is supported unless fresh evidence shows independent application. This supplement adds no method scores, obstacle labels or plan fields.
