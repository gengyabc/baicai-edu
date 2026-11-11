# Upper Primary Math Learning Recommendations

Read by `learn-recommend` through the subject contract. This file decides only the content, difficulty, reasons, and ordering of math candidates for grades 4–6; selection and handoff follow the shared flow.

## Candidates: Relationship × Strategy × Structure

From the existing snapshot and the latest real performance, find one quantity relationship or one grade-4-6 structure that can move forward, and write it as a small goal that can start right away, not "learn fractions" or "improve reasoning". Usually give 2–3 candidates that differ and have a basis, with 1 as the first choice; if only one goal fits, keep one, and do not pad by swapping objects in the same problem.

- First check the specific methods, problem types, unknown positions, numbers, and level of support in `strategy_summary`, then `priority_targets`, `developing_topics`, recent errors, and `session_history[0].next_step`. The latest independent performance can correct an old suggestion, and completion after a hint or example is not independent mastery.
- Stages and domains follow `references/progression-map.md`; arithmetic, multi-digit, fractions, and symbolic stages are independent tracks. An unknown stage supports only low-load exploratory candidates; do not turn the recommendation into a test, and do not judge a stage by age or grade.
- Choose relationships and numbers per `references/problem-design.md`; when developing a strategy, change mainly one of number structure, unknown position, problem type, or scene at a time. A grade-band table is a load clue, not a content entry gate; do not require the student to finish lower-grade content first.
- Released early in the student's timeline only as ready: ratio, percent, proportional relationships, and unknowns as relations are candidates once the earlier relationships are usable, not a fixed unit sequence.

| Existing evidence | Direction for a small starting goal | Numbers and load |
|---|---|---|
| Adds and subtracts whole numbers accurately but a fraction unit is not yet connected | Explain one equal-partition situation with the same whole, then name the shares | Small quantities, shares that can be split; no division-rule lesson first |
| Handles simple fractions but equivalence is procedural | Compare two expressions that are the same amount by building, then argue why | Pairs that can be compared by partition, such as `3/4` and `6/8` |
| Calculates decimals accurately but compares by digit count | Compare two decimal values that mislead, then place both on a number line | Pairs such as `0.9` and `0.87`, `1.5` and `1.05` |
| Solves one-step word problems, multi-step plan missing | Plan a two-step situation by naming quantities and units first | One extra condition, everyday scene |
| Uses a formula, but area and perimeter are confused | Explain which boundary or surface one formula measures in a real object | Rectangle shapes and one decomposition |
| Sees examples of a pattern and claims a general rule | Test one counterexample attempt, then state which cases the rule covers | Small numbers, a pattern the student already noticed |
| Works percent or ratio accurately in one scene | Use the same percent or rate in a new situation and say what changes | Keep the numbers close; do not claim transfer is complete |

Numbers in the table are structural examples, not a fixed sequence. For geometry, data, or proportional goals, likewise choose one relationship by the latest domain evidence and do not force the arithmetic ladder.

## Tools, Prerequisites, and Package Fit

This subject package judges the mathematical need: a prerequisite gap, a representation, a method, or a different learning goal. A need for objects or diagrams, board use, or one weak prerequisite does not by itself justify `math-primary-low`; support the student inside this package first. Keep grade-appropriate language even when revisiting earlier content.

When the known student stage fits grades 1–3, `math-primary-low` is the specialist fit; if unavailable, the shared resolver continues general teaching without blocking learning. If the recorded stage appears wrong, ask the shared profile flow to confirm it rather than inferring a new stage from performance. Package changes follow `learn-data`'s `references/teaching-resolver.md`: the subject supplies evidence and rationale, learn owns process choices, confirmation, saving, and re-resolution for a new task. No direct leaf/package hot-swap or automatic installation. `learn-recommend` owns learning-goal choices only when its normal recommendation trigger applies; a tool suggestion alone is not that trigger.

## Ranking and Reasons

The first choice is the goal with the clearest current evidence, the smallest step to the next, and one that reveals a relationship. For a repeated difficulty, first choose a small step that can move forward; when an independent explanation already exists, connection or transfer may be ranked before continued same-type practice. When the student explicitly wants different content, prefer feasible candidates from a different relationship or domain, and do not rank the old sticking point in new packaging first. The next step of an ordinary resume is only a candidate and may be reordered by new performance.

`personal.interests` and subject preferences decide context or representation only under the bridging conditions in `references/math-personalization.md` and never replace the quantity relationship. `material_difficulty` adjusts only one load factor and does not upgrade strategy conclusions. With no historical evidence, offer low-load exploration by grade default, with a reason like "we could start from …" and never falsely claim a prior observation.

Runtime reason text uses the active UI locale (see `learn-data` `references/ui-locale.md`), written in language the student can understand, pointing to the specific action in the record and its link to the next step, without topic-map ids or profile keys. The examples below are English illustrations only:

- Recorded: compared `0.9` and `0.87` by digit count. First choice: "decide which decimal is larger using a number line"; reason: "Last time the two values looked close and the number of digits got in the way; this time let's check them on a line first."
- Recorded: explained why `3/4 = 6/8` after building it. May first pick: "explain equivalence for a new pair without building"; reason: "You already explained how splitting each quarter into two pieces keeps the same amount; let's try a pair you haven't built."

Completion standard: each candidate has a concrete relationship and an action that can start, difficulty and reasons trace back to existing evidence or an explicit default; only one first choice, and the recommendation itself produces no strategy evidence.
