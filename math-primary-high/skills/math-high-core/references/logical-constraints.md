# Logical Constraints and Solution Completeness

Read when finite candidate assignments interact through several conditions, a student needs justified elimination or propagation, or the number of solutions matters. Use Ordered enumeration in `references/mathematical-strategies.md` for exhaustive organization and `references/proof-teaching.md` for scope and the first load-bearing gap. Keep the current act; `math-high-session` remains the teaching owner. This is a task-selected supplement, not another lesson sequence.

## Establish the candidate space

Identify the objects/roles, allowed values, whether repetition is allowed, and the quantifiers: each person has exactly one color, each color is used exactly once, at least one, and so on. Roles matter: swapping A and B usually changes the assignment. An ambiguous repetition rule calls for one relevant clarification, not a silently supplied all-different condition.

Link tools to `operation-meaning` (checking a condition), `data-graphs` (organizing a table), and `multiplicative-thinking` (choices without repetition) in `references/topic-map.md` only where needed. A small list or verbal argument may need no counting formula, equation or table terminology.

A table may distinguish **allowed so far**, **ruled out with a reason**, **forced with a reason**, and **not yet checked**. These are mathematical annotations, not software states. A blank is not an exclusion. Removing a value needs an original condition or an already justified consequence. A value still allowed locally need not extend to a complete solution. Propagation must preserve every possible solution; do not remove a candidate because it differs from the hoped-for answer.

## Bridge at the actual obstacle

Keep the student's valid assignments, exclusions and chosen representation. Use one reachable task and one pending question, then wait; the examples below are alternatives, not a script to deliver together.

| Student evidence | Useful local action |
|---|---|
| “Too many conditions; where do I start?” | Invite organizing the options for one person or using an already fixed value. Leave the next exclusion to the student, rather than supplying a complete table. No ideas alone is not a calculation gap. |
| Treats “each color once” as allowing shared colors | Clarify that condition and ask its consequence for one assignment; do not restart with a whole elimination lesson. |
| Has C=red and A≠red but keeps B=red | Retain both valid facts. Ask how using red for C affects B under the once-only condition. If the omission is repaired, continue from there. |
| Gives a valid final assignment but cannot explain uniqueness | Preserve the result. Separate its condition check from why any other candidate must fail; examine just the missing completeness reason. |
| Crosses out a blank or says “it looks impossible” | Ask which condition rules that candidate out. Keep it open until a reason or a complete branch check resolves it. |

Unknown tool use needs only a discriminating probe if it changes the next decision. For example, if applying “once each” remains unclear, use a two-person/two-color assignment to observe its use, not a vocabulary quiz. A confirmed gap follows `references/prerequisite-learning.md` through session dispatch: synchronize the parent problem, original answer, exclusions and their reasons, supplied support and pending position with that contract before entering the nearest tool child. Reuse it for recursion, saving/restoring and one-layer return; this supplement adds no plan fields or dispatcher. A verified alternative can remove a dependency. Tool readiness alone does not show independent selection in the parent.

## Check the strength of the conclusion

- **Existence:** a complete assignment satisfies every original condition. One successful substitution proves this, not uniqueness.
- **Uniqueness:** after existence, every other candidate is excluded by justified propagation or exhaustive branches. A finite complete enumeration is a proof when its coverage and checks are explained.
- **Multiple solutions:** two different valid assignments disprove uniqueness; to report the exact number, cover the whole candidate space.
- **No solution:** a direct contradiction or exhaustive justified exclusion leaves none. Failed attempts alone do not suffice.
- **Insufficient conditions:** if the requested assignment is not determined, say what remains possible; if a rule is unspecified, clarify it. Do not invent an extra clue or choose a favorite solution to satisfy wording such as “the answer”.

At an actual completeness decision, ask what has been established and which possibilities remain, using the student's work. A teacher's rebuilt table is not student monitoring. A valid verbal propagation argument can replace the planned enumeration.

## Private verification

Keep answers and complete routes private in an independent opening. Guided work follows **Guide before revealing** in `learn-core`'s `references/pedagogy-core.md`. Only explicit full-solution requests use `learn-core`'s informed full-solution choice (`references/informed-full-solution-choice.md`), for parent and child tasks alike. Valid same-task confirmation permits the checked full solution without compulsory prerequisites or exercises; a hint request does not trigger that choice. Pause, exit and refusal of transfer remain available.

| Change or result | Verify |
|---|---|
| One forced assignment | Every exclusion follows from an original condition or justified propagation; check the resulting full assignment against all conditions |
| Claimed uniqueness | Every alternative branch is excluded; a successful substitution alone establishes existence |
| A clue is removed | Keep old valid solutions, reopen only exclusions dependent on that clue, and recheck the full count |
| A contradictory clue is added | Identify the incompatible conditions; no exhaustive enumeration or silent clue repair is needed |
| Labels/settings change with structure preserved | Observe use of the constraints, not memorized placements; changed surface alone is not boundary discrimination |
| A decisive condition changes | Recheck feasibility and completeness; offer this contrast only when useful and agreed |

## Attribution and completion

Keep student exclusions/reasons, supported execution, teacher tables/key deductions, and untested completeness or transfer distinct. A supplied elimination copied afterward is supported work, not independent discovery.

Recording: `references/math-segment-fields.md` — at most one merged performance segment per turn for actual student work; teacher-only explanation, a choice or a plan uses `session_segment: null`. Tool children and recovery: `references/prerequisite-learning.md`. This supplement adds no method scores, obstacle labels or plan fields.

Completion: the actual student's conclusion has its supported strength (one witness, unique, multiple, none, or still unresolved), with the first missing reason explicit. Correct placement alone does not establish completeness or durable mastery; the student may stop with that part untested.
