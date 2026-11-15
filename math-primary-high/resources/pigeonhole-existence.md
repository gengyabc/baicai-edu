# Pigeonhole and Guaranteed Existence

Read when finitely many objects are assigned to finitely many categories and the goal is an at-least/must-exist claim. This specializes `references/mathematical-strategies.md` and `references/proof-teaching.md` within the current act; `math-high-session` remains the teaching owner. Accept a verified alternative route. A method name, a quotient, or the word “birthday” alone does not justify this method.

## Structure and reachable tools

Identify the objects, categories and assignment rule. Explain why every object is counted once in a category; omitted objects or overlapping counts invalidate the total-capacity comparison. In the birthday-month case each person has exactly one birth month among twelve, regardless of whether actual birthdays are known. If a different problem has missing or ambiguous assignments, clarify the relevant condition before using a bound.

Link counting and upper-bound comparisons to `operation-meaning`, `multiplicative-thinking` and, for organizing categories, `data-graphs` in `references/topic-map.md`. Division is optional: repeated addition and a justified capacity comparison suffice. Unknown tools need only a discriminating probe that changes the next action; a confirmed route-critical gap uses `references/prerequisite-learning.md` through the existing session. Unfamiliar terminology or “no idea” is not a confirmed gap.

## Bridge from the student's work

Use the first missing warrant rather than replacing their classification or calculation with a teacher route. Pose one coherent thinking task and wait; the following are alternatives, not consecutive mandatory prompts.

| Observed evidence | Local bridge |
|---|---|
| Tries several birthday arrangements and is unsure whether overlap always happens | Retain their twelve-month classification; ask how many people all twelve months could hold if every month had at most one. Leave the comparison and conclusion for the student. More successful trials do not settle all assignments. |
| Writes 13÷12 remainder 1 and concludes “exactly two” or “only one pair” | Keep the calculation; first ask whether more than two people in one month is compatible with the given information. Once the exactness claim is repaired, inspect what the calculation rules out. Do not restart division instruction. |
| Says “at least two” but gives no reason, or only names the pigeonhole principle | Ask what the assumption “every month has at most one” implies for the total. Connect their resulting bound to thirteen on a later turn if still needed. Naming the principle is not the warrant. |
| Has already explained the total-capacity contradiction | Reuse that reasoning; inspect only a missing scope, tightness or identification claim relevant to the actual goal. Do not require another proof or exercise. |

If the teacher introduces the reverse assumption, classification or counterexample, mark that help as teacher-supplied. The student's subsequent explanation may be supported work; it is not independent discovery of that bridge.

## Justification and scope

For a guarantee of at least k in some category, denying the claim means **every** category has at most k−1. Compare the resulting total capacity with the actual object count, and discharge that assumption if they conflict. Explain why the capacity bound covers all assignments, rather than treating a few observed distributions as a universal proof. Unequal category capacities require their actual sum, not an automatic equal-category division formula.

Keep three outputs distinct:

- **Guaranteed lower bound:** some category must reach the threshold, for every permitted assignment. The category may differ between assignments.
- **Tight guarantee:** in addition, an allowed assignment keeps every category at or below that threshold, so a stronger guarantee is false. One construction serves this counterexample purpose; it is not the universal lower-bound proof.
- **Actual count or identification:** knowing that some category is large enough does not determine its real size, month or members. Without actual assignment data, say which information is missing. Hypothetical labels or distributions remain hypothetical, never invented student birthdays. With supplied data, finding a witness requires a checked grouping/search of that data.

## Teacher-only checked cases

These are for private verification and authorized demonstrations, not answers/routes to disclose in an independent opening. Use the informed full-solution choice in `learn-core`'s `references/pedagogy-core.md` for an explicit complete-proof request; its shared reference owns warning, wait and same-task confirmation. Once confirmed, give the verified proof directly with no prerequisite or compulsory exercise. A supplied proof remains teacher-provided, not evidence of independent student construction.

- **13 people, 12 months:** if every month had at most 1 person, the total would be at most 12, contradicting 13. Thus some month has at least 2. A distribution of 2 in one month and 1 in each of the other eleven totals 13 and has maximum 2, so the guarantee cannot be raised to 3. All 13 in one month is also permitted: the result is not an actual maximum of 2, exactly one pair, or a named month or pair of people.
- **25 people (near transfer / HB1):** if every month had at most 2, the total would be at most 24, contradicting 25. Some month has at least 3. One month with 3 and each other month with 2 totals 25 and has maximum 3, proving tightness. Larger actual groups remain possible; the proof identifies no particular three people.
- **12 people (boundary / HB2):** one per month is a permitted assignment without any shared month, disproving a guarantee. Twelve people in one month is also permitted. “Can overlap” and “must overlap” differ; equality of count and capacity causes no contradiction.
- **Who shares a month? (HB3):** thirteen without real month data proves only that a shared month exists. Neither the month nor a real pair can be named. Offer to examine supplied month data if identification is the goal; do not substitute a hypothetical distribution for the real answer.

## Close and evidence

Use optional, agreed near transfer and boundary tasks for different purposes, not a fixed course. Respect refusal, pause and end. An explained capacity comparison supports only the scope actually shown; transfer and identifying real people can remain unknown.

Follow `references/math-segment-fields.md`: at most one merged segment per turn for actual student performance. Record independent explanations, supported reasoning, teacher constructions and untested claims distinctly in existing evidence fields. A teacher-only proof, choice, support or plan-only turn uses `session_segment: null`; it creates no independent capability, permanent obstacle label or new state schema. Recovery, child entry and single-layer return stay in the existing prerequisite contract, not a second task sequence here.
