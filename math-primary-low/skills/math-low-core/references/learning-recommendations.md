# Math Learning Recommendations

Read by `learn-recommend` through the subject contract. This file decides content, difficulty, reasons, ordering, and advisory openings; shared lifecycle owns selection, save, and handoff. A cold math opening follows lifecycle's gate, not an automatic profile-goal lesson. An unfinished task or micro-lesson resumes first.

## Evidence Window

Use the supplied snapshot and latest real performance only: the baseline includes at most the latest 5 session summaries and 20 recent error items, not full turn histories. Do not scan originals or old logs to reconstruct missing support conditions. Use “independent”, “supported”, “delayed”, or “due” only when the record actually establishes the condition; otherwise keep it unknown. A single error or self-report does not establish a stable gap, and a stored mastery label alone is not fresh evidence.

Check the specific methods, problem types, unknown positions, numbers, and support conditions in `strategy_summary`, then `priority_targets`, `developing_topics`, recent errors, and historical next steps. Latest comparable independent performance can correct an old suggestion; hinted completion cannot establish independent mastery.

## Candidates: Relationship × Strategy × Number Structure

Find one relationship that can move forward and write it as a small actionable goal, not “learn addition and subtraction”. Usually give 2–3 distinct justified candidates and one first choice; keep one if only one fits. Recommendation describes a task without presenting a full unanswered problem.

Read `references/progression-map.md` for local progression cues, not an entire graph search; arithmetic, multi-digit, and fractions are independent tracks. Unknown stages support low-load exploration, not age-based diagnosis. Read `references/problem-design.md` for its relationship-complexity decision and number load. Change mainly one load at a time; stages guide number choice, not access to content.

| Existing evidence | Small goal and suitable opening |
|---|---|
| Multiple comparable performances or diagnosis confirm a particular blocking relation | Repair the smallest relevant gap; a short example may fit a clear gap (`micro_lesson`), while unresolved causes call for one discriminating item (`probe`) |
| Recently completed after hints, no independent evidence yet | Consolidate the same relation with a fresh unhinted check (`practice`), adding support only if needed; do not jump to harder content |
| Independently understood or selected a method in comparable tasks | Offer one adjacent new relation (`micro_lesson`) or an unhinted structural variation/transfer (`challenge`), rather than ranking redundant drills first |
| A recorded future check, or prior success without recent comparable performance | Offer a fresh unhinted revisit (`practice`); say “let's check again”, not “you forgot”; claim a check is due only with comparable dates and an explicit agreement |
| One error, self-report alone, grade/interests only, or no history | Local clarification or light exploration (`probe` when a distinction matters), or the explicit learning goal; describe the basis honestly, without stable weakness/mastery claims |

Band examples, not a fixed ladder:

| Relation/strategy evidence | One feasible neighboring goal |
|---|---|
| Small-number one-by-one modeling | Explore where counting can continue within the same join/separate relation; keep the student's right to model directly |
| Count-on available, near-ten relation not connected | Explore a near-ten relation such as 8+7; preserve discovery unless new-learning teaching is agreed |
| Multi-digit one-by-one counting, tens/ones not connected | Relate whole tens and leftovers, with adjacent structures such as 30+20 and 30+24; no automatic column-method drills |
| Independently explains tens and ones in 36+20 | Explore what changes in 36+24, increasing only one load |
| Equal-sharing experience, shares and amount each not coordinated | Connect people, total, and each share using small manipulable quantities, such as 3 pancakes among 4 people |
| Explains a relation independently in one scene | Test that relation in a genuinely new activity with comparable numbers and unknown position; recommendation is not itself transfer evidence |

For fraction candidates read `references/fraction-relations.md`; equality reads `references/relational-thinking.md`. Geometry, measurement, and data use their actual domain evidence rather than forcing arithmetic progression. `personal.interests` and preferences affect context/representation only under `references/math-personalization.md`; `material_difficulty` adjusts one load, not strategy conclusions.

## Ranking and Reasons

1. **Scope first.** An explicit reliable goal goes directly to teaching. If the student wants different content, prefer a different relation/domain instead of renaming the old sticking point.
2. **Resolve conflicts.** Latest comparable independent evidence can supersede an old next-step suggestion. Different task scopes or prompting conditions remain separate; easier success does not erase a harder gap.
3. **Choose a useful next step.** A confirmed blocker relevant to the goal takes priority. Otherwise compare consolidation, neighboring new learning, transfer, and an agreed revisit by recent evidence and goals. Recent independent success without a revisit need keeps redundant same-structure practice out of first place.
4. **Make reasons verifiable.** State one real performance and why it supports this next step, in the active UI locale from `learn-data`'s `references/ui-locale.md`. With no evidence, explicitly describe exploration rather than inventing a past observation.

Example: “Last time you explained what changes when adding two tens; let's see what happens when a few more ones come along.” If the record only says “answered correctly”, keep independence unknown rather than embellishing the reason. Existing profile `next_step` is a reorderable candidate, not a command to repeat old work.

## Advisory Opening Handoff

Keep the existing candidate fields `id / focus / target_context / reason / basis`; preserve student theme wording and original `target_context.intent`. Reasons generated here never overwrite that intent. For new candidates, describe the goal and first activity in `reason`, and pair a proposed fresh opening with `target_context.math_opening_hint` per **Selected opening expectation** in `learn-data`'s `references/target-parsing.md`. A continuation instead retains the current scope and pending point without a fresh hint. Choose from evidence, not a rule that every learning session starts with a problem:

- `micro_lesson`: a new relation or clearly supported repair suitable for a brief agreed example.
- `practice`: a fresh unhinted consolidation/revisit item under practice purpose rules.
- `probe`: one low-burden discriminating item when an important distinction is unknown.
- `challenge`: a fresh unhinted structural variation or transfer opportunity, with no method cue.

The hint is advice for this opening, not authorization, a global mode, or performance. Old candidates without it remain valid. Store it only with the candidate and selected current target, never long-term summaries/profile/evidence. “Continue current” resumes its pending step; it does not restart the same goal. A new explicit action request overrides a stale hint.

Shared flow saves `selected_id` first and preserves originals/old task saves on target changes. Failed writes leave selection available for retry and do not start new teaching. Session chooses the real opening; lifecycle consumes the hint only in the same successful context write that records the advanced activity and pending point. Resume uses that activity, not a replayed opening. Candidate display, selection, and AI demonstrations produce no performance segment. At end, use existing `next_step_candidate` for one evidence-based suggestion, not a separate recommendation store.

Completion standard: each candidate has an actionable relation, an honest basis, a suitable advisory opening if supplied, and one first choice; recommendation itself yields no strategy evidence.
