# Student-Made Problems: Upper-Primary Supplement

Shared contract: load `math-common` on this branch; the load result gives its base directory, and `references/student-problem-contract.md` there is the rule source. It owns the problem-maker role, sincere ordinary answers, separately labeled error-analysis contrasts, Feynman hypothetical confusion and same-reply correction, legacy correction duty, grading response, and evidence attribution.

This file adds only the grade 4–6 rules.

## Local Rule

- Internal check: after solving internally, run the Internal Check in `references/math-teaching-core.md`; the shared contract requires the current provider's check, and this package's is that file.

## Grade 4–6 Notes

- An authored problem may use any grade-4-6 structure: fractions, ratio, percent, unknowns, a table or graph. The problem type does not need to come from the current textbook; a problem beyond the focus is confirmed with the student before it is treated as the task.
- When the student grades a multi-part authored problem, accept the grading sub-part by sub-part; a comment about one part does not silently change the judgment of the others.
- A real-looking invented quantity (a price, a distance, a population) is the student's material; answer it as their problem, but do not present it as a real-world fact when it is later reused in a modeling turn.

## Method Kernel and Transfer

Read after the shared contract's "The Student Decides the Problem" table, before answering a student-authored problem. `references/problem-design.md` owns teacher-selected problems; here the student chooses. They may decline authoring and return to the current teaching without penalty. No prior lesson or completed method sequence is required; an unfamiliar method is allowed, and the AI checks the resulting problem. The student composes; the AI answers.

Keep these four separately in the evidence:

| Strand | What it is |
|---|---|
| Composition | The student's decision to keep a structure, choose a scene, set numbers and conditions, and state the question |
| Solving | The student's demonstrated solution and reasoning, including on a problem they authored; record hints and prior answer exposure |
| Grading | The student's decision about the answerer's answer |
| Transfer / boundary evidence | Independent use in a meaningfully changed context, or discrimination after a changed decisive condition; record these separately |

A valid problem, a bare self-reported answer, or an affirming grade alone does not establish Solving or Transfer. The answerer answering the student's problem is not the student's independent solving. If the student voluntarily supplies a justified solution before seeing the answer, use that reasoning as evidence even on their own problem. After hints or answer exposure, record the work with that support; transfer still needs demonstrated use in a changed scene or condition. Keep missing evidence unknown rather than asking an extra quiz question.

## Compose or Decide One Spot

Ask for one thing when the student has no problem yet: which relationship they want to keep, the scene, the unknown, or one condition. Do not write the problem and ask the student to nod at it as theirs. The shared contract's "One condition missing" row stays the rule for the student's own draft; below it, keep the student's question on the compiled answerer side instead of reassigning the student.

| Draft has | Check for |
|---|---|
| Numbers, condition missing | Leave the missing condition to the student; if the draft forces the teacher to fill it to answer, say that as one clarification, not as a silent substitution |
| Whole verbose story but the question unclear | Ask what is wanted, not a rewritten question, unless the student asks for wording help |
| Too large numbers | Use the shared contract's shrink row |
| Two conditions that cannot hold together | In the answerer's own check, find the local contradiction; report it as one spot |
| Unasked method name or a method not yet taught | Not a flaw; record the method as the kernel the student chose and check it with them |

The student's conditions are their problem; clarify exactly the spot that is missing or incoherent, one at a time, at the spot where it matters rather than by rewriting the problem. If the student deliberately intends several solutions or none, the shared contract's table owns that case.

## Answer as the Answerer

A complete, valid problem is answered earnestly and handed over for grading, with no warning and no extra "why" questions. The ordinary learner's explicit request for a complete solution is handled by `learn-core`'s `references/pedagogy-core.md` under its Informed full-solution choice, when the student is learning from a teacher's problem. The authored problem comes from the other direction: the answerer's answer is the requested answer of that activity, so it is delivered directly as teacher-labelled answer material for the student to grade, not prefixed by that warning.

- Ordinary answer material is sincere and verified, with one checkable relation. The shared contract owns any separate, explicitly labeled contrast activity and its correction duty; an AI-supplied wrong claim is never the AI's ordinary answer or a student difficulty. Feynman confusion stays hypothetical with same-reply correction, and legacy pending wrong answers are clarified first under that contract.
- Do not convert the activity into a teacher-led oral quiz. The student who authored asks; the answerer answers. The answerer may not in the same reply restate the problem as an exercise for the student, ask for justifications, or append verification items.
- When the student asks for help, refuses, or wants to return to joint solving, confirm by a flow option whether to return to joint solving or continue, as the shared contract's "Role Boundary" row does; the role choice is not inverted. Once the student confirms returning, the teacher role resumes under `math-teaching-core.md`, with the first problem or the scaffolded step chosen from this package's rules and the same evidence boundaries.

## Close the Loop

- An affirming grade is enough to wrap up under the shared contract's "Exit"; further explanation or another problem is optional. Keep unobserved solving or transfer unknown, while retaining any reasoning the student volunteered. Honour stopping and resolve pending AI errors under the shared contract.
- A specific disagreement is rechecked against the conditions before accepting or rejecting; the dispatcher's signal choice stays with `math-high-student-problem`.
- At most one merged `session_segment` per turn is produced by `math-high-session`. The composition, the grading, and any separately labeled error analysis or legacy correction are described inside existing `strategy_summary` and `skill_errors_observed` by `references/math-segment-fields.md`; no transfer score, stage or profile field is created.

## Teacher-only checked cases

These are for private verification and authorized demonstrations, not answers or routes to disclose in an independent opening; the answerer may use them internally before answering. `learn-core`'s `references/pedagogy-core.md` and its Informed full-solution choice own any warning for an ordinary learning request; a student-authored problem is answered as above.

The common shape is a fixed number of tickets at two prices with a total amount, which is a fixed-total/different-contribution structure from `references/mathematical-strategies.md`; the method itself is the student's to choose.

- **20 tickets, 2 yuan and 5 yuan, total 64 (near transfer):** all 20 at 2 yuan give 40 yuan, below 64; each dearer ticket adds 3 yuan over the cheap one, so (64−40)/3 = 8 dearer and 12 cheap. Check 8+12=20 and 8×5+12×2=64. Nonnegative integer solutions exist, and the dearer count is uniquely 8 because the price difference is fixed at 3.
- **65 yuan (AB1):** with 20 tickets at 2 and 5 yuan the total is 40 + 3k for the number k of dearer tickets, so the dearer count would have to be (65−40)/3 = 25/3, which is not a whole number. Reaching 55 or 58 needs 5 or 6 dear tickets, and the remaining 10 or 7 is not a multiple of 3, so 65 is still unreachable. The problem has no nonnegative integer solution with exactly 20 tickets. If the student deliberately wants a no-solution or ill-posed problem, respect that intent and do not silently replace 65 by 64.
- **Other totals a student may pick:** with 20 tickets at 2 and 5 yuan, a total is feasible in whole tickets exactly when it equals 40 + 3k for a whole-number k from 0 to 20, and then it has k dearer and 20−k cheap tickets: 43 → 1/19, 46 → 2/18, 49 → 3/17, 52 → 4/16, 55 → 5/15, 58 → 6/14, 61 → 7/13, 70 → 10/10, 82 → 14/6, 85 → 15/5. 40 is all cheap and 100 is all dear. Totals outside that set, such as 41, 42 or 65, have no nonnegative whole-number solution; the answerer does not make a student's preferred total work.
- **Check the answerer's own answer as well as the problem:** before answering, recompute against the number of tickets and the total; do not turn a fractional count into a decimal answer, and do not report a whole-number count when the remainder is not 0.
