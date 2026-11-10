# Math Learning Recommendations

Read by `learn-recommend` through the subject contract. This file decides only the content, difficulty, reasons, and ordering of math candidates; selection and handoff follow the shared flow.

## Candidates: Relationship × Strategy × Number Structure

From the existing snapshot and the latest real performance, find one quantity relationship that can move forward, and write it as a small goal that can start right away, not "learn addition and subtraction" or "improve calculation ability". Usually give 2–3 candidates that differ and have a basis, with 1 as the first choice; if only one goal fits, keep one, and do not pad by swapping objects in the same problem. The recommendation stage only describes the task and does not present a complete problem awaiting an answer.

- First check the specific methods, problem types, unknown positions, numbers, and level of support in `strategy_summary`, then `priority_targets`, `developing_topics`, recent errors, and the next step in `session_history`. The latest independent performance can correct an old suggestion, and completion after a hint cannot be treated as independent mastery.
- Stages and domains follow `references/progression-map.md`; arithmetic, multi-digit, and fractions are independent tracks. An unknown stage supports only low-load exploratory candidates; do not turn the recommendation into a test, and do not judge a stage by age.
- Choose relationships and numbers per `references/problem-design.md`, including its relationship-complexity decision for harder requests. When a result-unknown relationship is already explained, candidates may change the unknown position, quantity roles, or linked events rather than only enlarge the numbers. When developing a strategy, change mainly one load at a time. A stage is a cue for choosing numbers, not a content entry gate; do not require the student to finish lower stages first.

| Existing evidence | Direction for a small starting goal | Numbers and load |
|---|---|---|
| With small numbers, lays out and counts one by one | Explore where to continue counting from within the same join/separate relationship; keep the right to direct modeling | Small, representable numbers; do not use large numbers to force abandoning the original strategy |
| Can count on, near-ten structure not yet connected | Use known quantity relationships to explore make-ten, near doubles, and similar links | Near-ten structure such as 8+7; do not name or demonstrate an algorithm first |
| Multi-digit still counted one by one, tens-and-ones relationship to be connected | Explain a two-digit relationship using whole tens and a few leftovers | Choose adjacent structures from 30+20 and 30+24; do not directly assign column-method drills |
| Can explain combining tens and ones | Compare number variations within the same relationship and explore their own decompositions | Such as 36+20 and 36+24; add only one load |
| In equal sharing, number of shares and amount per share not yet coordinated | In one fair-sharing context, connect number of people, total, and amount each gets | Small manipulable quantities, such as 3 pancakes shared among 4 people; fraction comparison can also enter from here |
| Correct and able to explain in the original scene | Keep the relationship, unknown position, and nearby numbers, and change to a real activity to test transfer | Change the context, not just the names; a recommendation cannot claim transfer is complete |

Numbers in the table are structural examples, not a fixed sequence. For fraction candidates read `references/fraction-relations.md` as needed; for geometry, measurement, or data goals, likewise choose one relationship by the latest domain evidence and do not force the arithmetic ladder.

## Ranking and Reasons

The first choice is the goal with the clearest current evidence, the smallest step to the next, and one that reveals a relationship. For a repeated difficulty, first choose a small step that can move forward; when an independent explanation already exists, connection or transfer may be ranked before continued same-type practice. When the student explicitly wants to change content, prefer feasible candidates from a different relationship/domain, and avoid ranking the old sticking point in new packaging first. The next step of an ordinary resume is only a candidate and may be reordered by new performance.

`personal.interests` and subject preferences decide context or representation only under the bridging conditions in `references/math-personalization.md` and never replace the quantity relationship. `material_difficulty` adjusts only one load factor and does not upgrade strategy conclusions. With no historical evidence, offer low-load exploration by grade default, with a reason like "we could start from ..." and never falsely claim a prior observation.

Runtime reason text uses the active UI locale (see `learn-data` `references/ui-locale.md`), written in language the student can understand, pointing to the specific action in the record and its link to the next step, without CGI labels or profile keys. The examples below are English illustrations only:

- Recorded: 7+5 counted on from 7. First choice: "find an easier way to combine using a number close to ten"; reason: "Last time you could count on from 7; this time let's see how the two piles can be put together more easily." Another candidate may be explaining the same relationship in a new scene; do not claim the student already can make ten.
- Recorded: independently explained the tens and ones in 36+20. You may rank "explore how tens and ones change when adding twenty-something" before repeating whole-ten calculation; reason: "You already explained what changes when adding two tens; let's see what happens when a few more ones come along."

Completion standard: each candidate has a concrete relationship and an action that can start, difficulty and reasons trace back to existing evidence or an explicit default; only one first choice, and the recommendation itself produces no strategy evidence.
