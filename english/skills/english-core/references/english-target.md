# English Target Classification

The shared `target_context` shape, empty text, and file-path handling are in `learn-data` `references/target-parsing.md`. This file classifies the remaining English text and the target after a file handoff. An explicit intent takes priority over fuzzy keywords; when you cannot tell, ask only one short question.

## Remaining Text

| User need / material | type | intent |
|---|---|---|
| A clear learning topic, such as colors, animals, family, letters, numbers, everyday conversation | `topic` | `learn_english` |
| English story, short passage, picture book, graded reader (no answers given yet) | `reading_material` | `learn_reading` |
| Practice speaking, dialogue, role-play, describing a person or object | `speaking_practice` | `practice_speaking` |
| Learn or review words, patterns, set expressions | `language_focus` | `practice_language` |
| Play an English game, do a task, craft, project | `activity` | `task_activity` |
| Kid-appropriate news, current events, news English | `news` | `news_reading` |
| Check written English answers, reading questions, or sentences | `assessment` | `assess_english` |
| Wants to write or imitate short sentences or a short paragraph, with a draft already | `writing_task` | `revise_writing` |
| Wants to quiz the AI, or check an expression just learned | `student_problem` | `student_problem` |
| Target cannot be determined beyond the profile | `profile` | null |

Judge "continue writing/rewrite" by whether a ready draft exists and whether the student explicitly wants to quiz the AI, not by a single keyword hit. When a standalone article's source is unclear, confirm whether it is reading material or the student's own draft; do not mistake pasted original text for the student's composition.

## After File Processing

After `learn-errors` returns extracted material, student answers, and diagnosis, classify by content:

- Only a reading passage or story: `reading_material` + `learn_reading`
- Reading questions or student answers present: `assessment` + `assess_english`
- English sentences or a short paragraph written by the student: `writing_task` + `revise_writing`
- News original text or news-link text: `news` + `news_reading`
- If it is still unclear whether it is reading material or homework, ask only one question.

`source` uses `manual_topic`, `error_analysis`, `profile`, or `focus`; save `target_context` and `material_refs` before routing. Later, load the extracted content; do not rerun file analysis and do not re-ask the self-diagnosis.

Classification only produces the target and performs no second routing; `english-session` takes over teaching.
