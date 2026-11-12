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
| No idea how to guarantee a win from 7 | Shrink to an accessible state, e.g. ask what happens with 1 stone under the stated rule, then build toward 2/3 as replies arrive. Do not open with the losing-state table or a remainder trick. No idea is not evidence of inability to subtract. |
| “I take 1, leave 6; if they take 1, I take 2” | Preserve that valid branch. Ask how to respond if the opponent instead takes 2. Once supplied, examine why the response pattern remains legal and reaches the right terminal outcome, without retesting the already explained branch. |
| “Take 1 first; definitely win, but I cannot explain” | Keep the correct first move. Ask for the first missing guarantee, such as a response not yet covered; distinguish the move from a proof of the whole strategy. |
| Only a single winning play is demonstrated | Identify one still-legal alternative opponent response and let the student examine it. A cooperative opponent does not establish a guarantee. |
| Can organize branches but cannot execute a required operation | Confirm the specific tool gap, then preserve the parent and enter its nearest child via the existing prerequisite contract. Strategy uncertainty alone does not trigger arithmetic remediation. |

When tools are reachable, teach normally with inquiry, representations, labeled examples, explanation and fading. If division/remainders are unavailable but small states or a branch argument suffice, use that route instead of imposing division study. Tool readiness does not itself establish strategy selection or guarantee reasoning.

## Teacher-only checked cases

Use these to verify mathematics, not to supply answers/routes in an independent opening. An explicit request for a complete strategy follows shared **informed full-solution choice** in `learn-core`'s `references/pedagogy-core.md`: warn, wait for same-task confirmation, then give the verified teacher-supplied strategy with no prerequisite or compulsory exercise. Skip/ambiguity is not authorization. For a full strategy, include opponent alternatives, legal continuation and termination, rather than just a slogan. Students setting a problem for the AI retain the shared student-problem role contract; this reference does not turn them into examinees.

### Last stone wins: 7, then 8 and 6

One positive integer pile, players alternate removing 1 or 2 available stones; taking the last wins. An exhausted pile is terminal: the previous mover won, and there is no next action. From 1 or 2 the mover takes all and wins. From 3, either move leaves the opponent able to take all, so 3 loses. From 4/5, remove 1/2 to leave 3; from 6, either move leaves 5/4 winning for the opponent; from 7, remove 1 to leave 6. Thus states 1–7 are W,W,L,W,W,L,W for the player about to move.

**Complete strategy from 7:** first take 1, leave 6. At 6 the opponent can take only 1 or 2. If they take 1, 5 remain: take 2 and leave 3. If they take 2, 4 remain: take 1 and leave 3. At 3, if they take 1, take the remaining 2; if they take 2, take the remaining 1. Both replies are legal, and in either branch I take the last. Each pair removes 3, with a strictly smaller pile; no zero-stone extra turn or illegal removal is required.

**General warrant, if the agreed goal needs it:** every positive multiple of 3 is losing. From 3k, any legal move leaves a nonmultiple; from 3k+1 or 3k+2 above the base cases, a move leaves 3k. Backward reasoning from 1/2/3, or repeatedly pairing the opponent's action with 3 minus that action, supplies the full argument. A pattern in a short table alone is not that argument. Accept a fully verified finite branch tree for the concrete 7-stone task; a general remainder formula is optional.

**Near transfer, 8:** take 2, leave 6; then the same checked continuation works. **Initial losing boundary, 6:** taking 1 leaves 5, from which the opponent takes 2 to leave me 3; taking 2 leaves 4, from which the opponent takes 1 to leave me 3. At 3 either first-player action lets the opponent take the last. Every initial action has a defeating response, so the first player has no guaranteed winning strategy from 6. Do not promise unconditional wins for all initial counts.

### Last stone loses: rebuild from the terminal rule

Keep available removals 1/2 and alternate turns, but taking the last now loses immediately. The game ends on that move; do not assign an extra move at 0 or import the last-wins empty-state convention.

1 loses (forced to take the last). From 2 take 1, leave the opponent 1, so 2 wins. From 3 take 2 to leave 1, so 3 wins (taking 1 instead leaves the opponent winning 2). From 4 every move leaves winning 3 or 2, so 4 loses. From 5/6 take 1/2 to leave 4; from 7 both moves leave winning 6/5. States 1–7 are L,W,W,L,W,W,L; positive losing counts are 1,4,7,…, those with remainder 1 on division by 3.

For 7: if the first player takes 1, the opponent takes 2 from 6 to leave 4; if the first takes 2, the opponent takes 1 from 5 to leave 4. At 4, any first-player action leaves 3 or 2, and the opponent can leave 1; the first player must take it and loses. This covers both initial actions, their later alternatives and the terminal loss. Thus 7 has no first-player guarantee under the changed rule. To justify the general pattern, the winning player leaves 1 and pairs removals while it is legal; from 3k+1 all legal moves go to winning states, from 3k+2 or 3k+3 one move leaves 3k+1. Recheck bases and the last move: “leave multiples of 3” is not transferable to this rule.

## Close, record and resume

Completion is tied to the requested scope: rules are clear and the student explains the strategy's coverage, legality and terminal result, or the unverified branches remain explicit. A correct first move, winning one play, naming a remainder or reciting a teacher's table does not alone establish complete strategy understanding. Near transfer and changed-rule contrasts are optional, not a task quota; refusal, pause and end take priority over further probing.

Use existing `context.turn_state` and `strategy_summary` for the stated rules, original student answer, verified/unverified branches, teacher-supplied table or key replies, support and pending position needed for continuation; these are notes, not new required fields. On interruption or a tool child, follow `references/prerequisite-learning.md` and the existing plan: only the active task consumes the answer, return one layer, and reconnect at the stored branch. Lifecycle handles end/target/mode changes first; do not revive abandoned goals or replay an already consumed answer.

Follow `references/math-segment-fields.md`: at most one merged segment for actual student performance. A choice, plan or teacher-only strategy explanation uses `session_segment: null`; teacher-supplied responses are help, not student independent strategy evidence. Subsequent explanation after exposure is supported/reconstruction unless fresh evidence demonstrates independent application. Leave untested transfer and generalization unknown; add no game level, long-term diagnosis or mastery score.
