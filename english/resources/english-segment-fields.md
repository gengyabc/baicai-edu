---
cited: english-core/references/english-segment-fields.md
---

# English Segment Field Conventions

Before producing an English learning record or merging method-skill results, first read the Session Segments of `learn-data` and the Session Segment section of its `references/session-schema.md`. The full structure, required fields, enums, and write-back mapping belong to the shared schema; this file defines only the English incremental semantics.

## One Record per Turn

`english-session` returns one `session_segment` per turn; method-skill evidence is merged into that segment, not recorded as another turn and not logged separately. The log is appended by the entry; the profile and finalize are written by the shared flow.

`focus` records the actual focus of this turn; while waiting for the student's next answer, record only evidence already observed, and leave later demonstration, judgment, and level changes to later turns. Asking a question is not itself evidence of student performance.

## Evidence Classification (single convention)

Methods return the task that took place, the student's original meaning/expression, the support conditions, and the actual result; the classifications below are written in existing fields such as `strategy_summary`, and no scoring, counting, or global level fields are added.

| Evidence type | Judgment and recording |
|---|---|
| Independent comprehension / production | Without the sought answer or matching expression being provided, the student understands the meaning or organizes the expression on their own; state the specific task scope |
| Comprehension / production after a hint | Completed after a context cue, choice, sentence start, or partial model; record the actual support and do not write it as independent |
| Recognition / selection | Identified from provided information; a correct choice is not the same as free production or independent recall |
| Imitation / repeating a given expression | Reading along, copying, or repeating after the target expression was shown; not a first independent retrieval, and evidence is taken again later in a changed context |
| Not observed / still unknown | Unanswered, empty message, mere agreement, or only a teaching-assistant model; do not fill in as a student error, failure, or ability decline |

One performance may have several facets: for example "correct choice after a hint" records both the support condition and recognition, and the strongest classification may not be picked to hide the support. Task completion, language accuracy, and independent communication are described separately; explaining the gist in the first language can be comprehension evidence but cannot be used to infer independent English production. A student's own correction and echoing after a teaching-assistant restatement are also kept separate.

Observe only from the media genuinely available now. Text answers can support reading, written expression, or language use in text dialogue; without audio, do not update listening, pronunciation, or speaking fluency. The provisional CEFR difficulty label on material is not the student's level and cannot be written directly into `current_levels`.

Merge and deduplicate evidence from multiple methods, keeping distinct contexts and support conditions; on conflict, leave it unknown or a local conclusion, and do not stitch it into a stronger mastery judgment. Reviews, next independent attempts, and unanswered questions planned by the teaching assistant are only next steps.

## Field Semantics

| Field | English convention |
|---|---|
| `subject` / `mode` / `submode` / `source` | `subject: english`, `mode` inherited from the caller; `submode` uses `learn` / `practice` / `review` / `feynman`, with the branch chosen per `english-session`; `source` aligned to `target_context.source` |
| `strategy_summary` | The current focus, what the student actually understood or expressed, and the difference between completed independently, completed after a hint, or only recognized; not just the answer or "used a story" |
| `strengths` / `difficulties` | Actual evidence of comprehension, expression, vocabulary, patterns, spelling, and response to scaffolding; short, slow, first-language-supplemented, or unanswered responses alone are not recorded as English difficulty |
| `next_step_candidate` / `recommended_targets` | One conservative, concrete small step and neighboring target |
| `feynman_handoff_recommended` | Whether it suits moving to Feynman explanation, filled from actual performance |
| `confirmed_skills` / `skill_errors_observed` | Before recording, read `learn-core` `references/feynman-skill-whitelist.md`; in all modes fill skill names per its threshold; empty arrays when no evidence. An AI's deliberate error is not a student error |
| `overall_performance_code` / `overall_performance_text` (optional) | `needs_support` needs scaffolding, `basic_independent` mostly independent with a few steps needing hints, `stable` — stable use in the same context, `flexible` still understands or expresses after a context change; a single correct answer is recorded at most as `stable` |
| `current_levels` (optional) | With sufficient evidence, give a partial update of `listening` / `speaking` / `reading` / `writing`; band meanings belong to `references/english-grade-defaults.md` |
| `diagnosis` (optional) | The English domain `domain`, one specific error `label`, and key performance `evidence`; labels belong to `references/english-error-labels.md` |

Omit optional fields with no observation and keep existing profile values. One correct answer, one fluent reading aloud, or one repeat-after-me does not by itself raise the level; do not add global level or scoring fields.

## Skill Domain Mapping

The segment writes only skill names; when finalize writes `confirmed_skills` objects it fills `domain` from the table below. If no close domain is found, keep the narrowest domain consistent with the evidence and do not invent a broad category outside the table.

| Domain | Example skills |
|---|---|
| `listening_speaking` | understand a short instruction, express a need in a short sentence, clarify meaning in a dialogue |
| `reading` | read a story and catch characters, find key information, predict from the title |
| `writing` | imitate a short sentence, spell common words, capitalize the start of a sentence |
| `language_use` | color words, animal words, `I want ...`, `Can you ...?` |
| `news_reading` | read news for facts, distinguish fact from opinion |
