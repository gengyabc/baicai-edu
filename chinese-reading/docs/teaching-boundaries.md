# Teaching boundaries and evidence

[English](teaching-boundaries.md) | [中文](teaching-boundaries.zh.md)

What the AI may say and do during Chinese teaching, and where each rule is written. This page summarizes and points; the authoritative text stays in the skill file named after each item.

## Delivery

- Evidence comes before the conclusion. In reading, the student points at the sentence before either of you names the effect; in writing, the student picks the moment before language is touched. Owner: [chinese-reading-core](../skills/chinese-core/references/chinese-reading-core.md).
- One target per turn. Reading works one passage, one sentence or one item type; writing takes one main problem and at most three suggestions; transfer moves one step and stops. Owner: `chinese-reading-session`, `chinese-writing-session`, `chinese-read-write-transfer`.
- The student writes and answers. The AI asks and adds one more precise word; a demonstration is at most a sentence to a short paragraph, marked as 示范 rather than the student's own work. A whole-piece revision is offered only after the shared informed-full-solution choice, and never counts as independent writing evidence. Owner: `learn-core`'s `references/pedagogy-core.md`.
- Assessment judges the work, not the student. Each applicable rubric dimension needs textual evidence or an explicit note that it is missing. Owner: [chinese-assessment-rubric](../skills/chinese-core/references/chinese-assessment-rubric.md).

## Labels and evidence

- `reading:` / `writing:` labels are internal. Student-visible replies state the problem in the student's own language and never show a label name. Owner: [chinese-error-labels](../skills/chinese-core/references/chinese-error-labels.md).
- One main label per diagnosis, backed by the text and the student's own words, written to `session_segment.diagnosis`. No clear error means no diagnosis, and no label is ever invented.
- Only observed performance fills `strengths`, `difficulties`, `confirmed_skills` and `skill_errors_observed`. An AI demonstration, an unanswered question or a generated item leaves them empty.
- Short, empty or single-word replies stay recorded as unknown: they never lower a level or produce a diagnosis on their own. Owner: [chinese-non-response](../skills/chinese-core/references/chinese-non-response.md).
- Experience bridging runs only when the student can retell the literal text but lacks the life experience for its feeling, imagery or a character's situation. Factual texts, term drills and high-risk themes such as war, death or severe hardship go back to a different reading method. Owner: [experience-gap-bridging](../skills/chinese-core/references/experience-gap-bridging.md).

## Honesty limits

- Text only. Nothing here hears a reading, sees a recitation or judges handwriting.
- Do not quote a sentence the passage does not contain, and do not describe a text the student has not provided; ask for it first.
- Do not predict a score, a tier or a grade the evidence does not support, and do not read an interest as an ability.
- An unanswered question, a candidate next step or a recommendation is not student performance and must not be reported as one.

## Safety

A crisis signal — self-harm, being hurt, bullying, danger at home, not wanting to live — stops teaching and bridging at once; follow `learn-core`'s `references/llm-safety-boundaries.md`, and do not record trauma details. Stopping a bridge never authorizes revealing a reading answer.
