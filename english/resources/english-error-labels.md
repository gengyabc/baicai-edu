# English Error Label Table

English diagnosis uses this single label table. Pick only the one main label most worth fixing first; secondary problems can go in the persisted entry's `notes`. Student-visible replies describe the problem in words the student understands and never show label names.

## Migration Rules

- Newly written `error_history` entries must use the `english:` prefix.
- Labels are English snake_case identifiers. Legacy `error_history` entries that still hold Chinese-named `english:` labels are read through the mapping in "Legacy Chinese Labels" below; never write new Chinese labels.
- `diagnosis.domain` can only be `listening_speaking`, `reading`, `writing`, `language_use`, or `news_reading`.
- Keep only one main label per diagnosis, backed by student performance; with insufficient evidence, omit the diagnosis and ask more first.
- Pronunciation, speech, and speaking fluency are not in this table: by default there is no real audio capability, so do not infer these from text answers.
- The field table is in `references/english-profile-fields.md`.

## Storage

Diagnosis labels are separate from skill tracking: a label describes this turn's main problem and goes in `diagnosis`; `confirmed_skills` / `skill_errors_observed` accept only shared-whitelist skills and their evidence, and finalize's `skill_errors` does not carry diagnosis labels. Recording chain:

1. The subject skill writes `{ "domain", "label", "evidence" }` in `session_segment.diagnosis`.
2. `learn-data` finalize writes it as one `error_history` diagnosis entry:
   `{ "source": "diagnosis", "domain", "label", "evidence", "next_step", "error_id": "diag_..." }`.
3. `error_history` keeps the latest 20 entries; when the same label recurs, keep the latest evidence and write "repeated pattern" in `notes`.

## error_type

When file analysis writes `error_type`, use the table below; it describes the nature of the error, while `label` describes the specific main problem. In-session diagnosis may write only `label`, and finalize keeps existing fields.

| `error_type` | Meaning | Common matching labels |
|---|---|---|
| `comprehension` | Understanding drifts or information is missed | `english:comprehension_gap`, `english:missed_information` |
| `expression` | Understands but expression is blocked | `english:expression_blocked`, `english:off_topic_answer` |
| `vocabulary` | An unknown word blocks | `english:unclear_word_meaning` |
| `pattern` | Pattern cannot be used independently | `english:unfamiliar_pattern` |
| `task` | The task or question is misunderstood | `english:task_misunderstanding` |
| `spelling` | Spelling hurts readability | `english:spelling_deviation` |
| `news_literacy` | News facts and opinions are confused | `english:fact_opinion_confusion` |

## Labels

| Label | domain | Definition |
|---|---|---|
| `english:task_misunderstanding` | `language_use` | Did not understand or misread the question or task requirement and answered something else |
| `english:comprehension_gap` | `reading` | Understanding of the given English sentence or short passage drifts from the original meaning |
| `english:missed_information` | `reading` | Caught part of the information but missed key information that affects understanding |
| `english:unclear_word_meaning` | `language_use` | An unknown word or phrase blocks understanding or expression |
| `english:unfamiliar_pattern` | `language_use` | Cannot use the target pattern independently in context; relies on hints or memorization |
| `english:expression_blocked` | `speaking` | Understands the meaning but cannot say it; stays in the first language, single words, or half sentences |
| `english:off_topic_answer` | `language_use` | Understood the words but did not catch the other person's meaning or the point of the question |
| `english:spelling_deviation` | `writing` | Spelling errors in copying or imitation hurt readability |
| `english:fact_opinion_confusion` | `news_reading` | While reading news, treated opinion, speculation, or adaptation as verified fact |

## How to Choose (judge in order)

1. First check whether the task was understood: answered something else or went the wrong way → `english:task_misunderstanding`; do not choose other labels yet.
2. When reading material, check comprehension: overall meaning wrong → `english:comprehension_gap`; only missed key information → `english:missed_information`.
3. Stuck on a word → `english:unclear_word_meaning`; knows every word but cannot use the sentence form → `english:unfamiliar_pattern`.
4. Understood but cannot say it: record `english:expression_blocked` first, and do not also record both word-meaning and pattern labels.
5. Spelling in written sentences hurts readability → `english:spelling_deviation`.
6. Treating opinion as fact in news reading → `english:fact_opinion_confusion`.

A student may have several problems at once; pick only the one main label most worth fixing now, and do not stack labels.

## Legacy Chinese Labels

Older `error_history` entries may hold Chinese-named labels. Read them with this exact mapping; do not infer a different label and do not rewrite old entries during a normal turn.

| Legacy label | Current label |
|---|---|
| `english:任务误解` | `english:task_misunderstanding` |
| `english:理解偏差` | `english:comprehension_gap` |
| `english:信息遗漏` | `english:missed_information` |
| `english:词义不明` | `english:unclear_word_meaning` |
| `english:句型不熟` | `english:unfamiliar_pattern` |
| `english:表达受阻` | `english:expression_blocked` |
| `english:答非所问` | `english:off_topic_answer` |
| `english:拼写偏差` | `english:spelling_deviation` |
| `english:事实与观点混淆` | `english:fact_opinion_confusion` |
