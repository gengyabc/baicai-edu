---
cited: learn-core/references/feynman-skill-whitelist.md
---

# Feynman Skill Whitelist

All modes may record skill confirmations and real errors; deliberate mistakes belong to Feynman mode only (the AI as listener), not ordinary student-authored quizzes. A subject package may require explicitly labeled hypothetical confusion and same-reply correction; recording and retraction still follow this file. Role difficulty follows `references/feynman-mode.md`. Subject skill names and domains are agreed by each subject; this file only defines evidence and retraction.

## Deliberate Mistakes

Before responding, check `confirmed_skills` (including confirmations already projected in this session but not yet finalized).

- **Already on the whitelist**: do not deliberately make mistakes with that skill.
- **Not on the whitelist**: make a real mistake slightly below the student's level at a key conceptual step (err where you can); do not only make calculation slips.
- Before any question is wrapped up, never leave a wrong answer standing as the correct result. Ordinary math answerer turns are sincere; error analysis is a separate explicitly labeled contrast activity, not an exception to sincere answering. In the math student-problem Feynman branch, label a hypothetical confusion and clarify the correct relation in the same reply. Reasoning after that exposure is explanation or reconstruction, not independent error detection.

## Confirmation Threshold

When the student successfully corrects the AI or clearly explains a concept:

1. If the skill is not yet in `confirmed_skills`, and it reaches **two independent demonstrations** (different numbers/contexts) or **one demonstration plus a correct explanation** of why it works, write the skill name into this turn's `session_segment.confirmed_skills` (array of strings).
2. Do not write `memory.json` within the turn; finalize converts names into objects with `domain` / `confirmed_at` and writes them once.
3. Initialization: when creating or updating memory, seed `confirmed_skills` from `mastered_topics` per `learn-data`'s `references/profile-schema.md`, deduplicating only by `skill`.

`confirmed_skills` and `mastered_topics` are workflow labels, not evidence of retention or transfer by themselves. A local difficulty change does not replace these confirmation rules. No recorded error is not a new success; report delayed retention only after an observed later attempt, with its support conditions known.

## Errors and Retraction

During teaching, append the skill name of a truly observed error to this turn's `skill_errors_observed`; use the in-memory projected whitelist so later turns do not still treat a skill that should have been retracted as confirmed. Record the same skill only once within the same segment; replaying the same response is not a new observation. A deliberate AI mistake is not a student error.

Finalize processes in segment time order: for each error observation, find or create that skill's `skill_errors`, increment `error_count`, and update `last_error_at` (cumulative count, not a consecutive streak). When `error_count >= 2`, remove the skill from `confirmed_skills` and clear its error-count entry. Re-confirmation must meet the confirmation threshold above with new evidence; old evidence from before the retraction must not be added back in the same finalize.

Write timing: within a turn only append to `session_log.json`; finalize merges `confirmed_skills` / `skill_errors` in the same pass as other memory fields. Do not write the same file in parallel.
