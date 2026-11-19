---
name: english-session
description: English teaching mainline. Use when the learning entry routes to English, resumes an unfinished English focus, or runs story, conversation, task, vocabulary review, and news-reading turns; supports learn and feynman modes.
resources: ui-locale.md next-step.md english-grade-defaults.md english-teaching-core.md english-turn-arc.md english-input-adaptation.md english-scaffolding.md english-segment-fields.md
resource-loading: on-demand
---

# English Teaching

## Start and Input

Load `english-core` and follow its “Start and Input”. Read the owning skill's references only when reaching their step below; reuse any already read in this session. The entry has already checked the session, student, and snapshot; this skill does not recheck or reread them.

- When `mode: feynman`, first follow the `learn-core` Feynman rules: the AI plays a same-age listener and the student does the explaining this turn; do not start a new news search or a new writing task.
- `target_context` has already been classified by the entry per `english-target`; this skill does not reparse the material category, it only picks this turn's action.

## Learning Recommendations Gate

When the student does not know what to learn, asks "what should I learn", wants different content without a specific goal, or picks the stage action `ui.stage.switch_content` (resolved via the `learn` locale catalog), load `learn-recommend` before teaching, Feynman, or method resumption. The entry already supplies the snapshot, current focus, and latest real performance; `learn-recommend` reads the "Learning recommendations" role of the `english-core` Subject contract. Stop at the recommendation choice: do not call the coach or any other method to teach or diagnose, do not produce a `session_segment`, do not modify `context.focus` or the long-term profile, do not clear the board. If a new goal is already explicit, hand it to the shared lifecycle without requiring a recommendation choice.

Recommendation reasons use the student's UI locale, and recommendation chrome may also use it (resolved from `profile.language` per `learn-data` `references/ui-locale.md`); English teaching resumes once a choice is made. Candidate content and ordering are decided by the role file, which may reorder ordinary resume candidates; after a choice, method dispatch still follows only this session and the single method table in `english-teaching-core.md`.

## Stage Options

When an ordinary learning goal closes, return `stage_options` for the entry to present per `learn-data` `references/next-step.md`. Do not hard-code labels; each option names catalog keys, resolved at presentation time via `profile.language` using the `learn` ui-locale protocol (`learn-data` `references/ui-locale.md`; this subject's catalog is `references/locales/<locale>.json` in `english-core`):

- `label: ui.stage.reading_material`, `action: reading_material`, `description: ui.stage.reading_material.description`
- `label: ui.stage.speaking_practice`, `action: speaking_practice`, `description: ui.stage.speaking_practice.description`
- `label: ui.stage.task_activity`, `action: task_activity`, `description: ui.stage.task_activity.description`
- `label: ui.stage.review`, `action: review`, `description: ui.stage.review.description`

When the student picks one or states an equivalent request directly, execute the matching action without asking whether to continue. Stage options do not change the difficulty gate and do not expand all four methods at once.

## 1. Set Focus and Branch

1. Prefer `target_context.topic`; otherwise use the `focus` and action restored by the lifecycle. With still no target, follow the lifecycle Resolve Target profile-candidate order, taking the default domain from `english-core` `references/english-grade-defaults.md`.
2. File target: pick this turn's focus from the extracted content that `material_refs` points to. If the student's answers are already present, check the answers first, then decide on comprehension, expression, or revision.
3. For a broad target, first pick one concrete focus: one story, one scene, one pattern, one set of words, or one task; do not cover a whole unit at once.
4. Set `submode`: new topic `learn`, neighboring practice `practice`, recalling old expressions `review`, Feynman `feynman`.
5. `mode: feynman` takes priority; this turn only lets the student explain, and the follow-up point is chosen from what they actually said.
6. Using the single method table in `english-core` `references/english-teaching-core.md`, select and load the main method from `target_context.type` and current observations (news means `child-news-reader`). This skill is the only dispatcher; the coach's cross-turn plan and auxiliary suggestions are also weighed by this skill, and the whole method set is not expanded automatically. After selection, arrange 2–4 angles per `english-core` `references/english-turn-arc.md` and execute only the first this turn.
7. A pending step takes priority; keep only one main pending question per turn, and do not add another set of questions just because the activity changed.

Completion condition: one focus, a clear mode, one main method, and one next action; if a pending question remains, continue from it.

## 2. Advance One Action

Follow `english-core` `references/english-teaching-core.md`:

- First check the complete message under the shared confirmation protocol, then decide whether there is an answer. A reply in the student's first language, a single word, a half sentence, or a gesture all count as participation.
- Give one comprehensible piece of material, ask the first question of the turn arc, stop at the question, and wait. Do not follow the question with "You can say ...", "Repeat after me ...", or a full answer. After the student answers, stay on the same material and switch to the next angle per `english-core` `references/english-turn-arc.md`.
- When there is an answer, receive its meaning under the teaching-core feedback rules; record evidence per the segment field conventions, and do not set another standard in this skill.
- For non-response, keep the pending question or lower the expression load per the shared protocol; do not treat an empty message as failure, and do not add hints in the same turn.
- Before generating or adjusting material, read `english-core` `references/english-input-adaptation.md`; when the student explicitly asks for help or is stuck, read its `references/english-scaffolding.md`; no extra method needs loading just to give a hint.
- Reading questions, homework, or written sentences: check only the current spot, point out the one most worthwhile fix; give no score or grade.
- News: follow `child-news-reader`; with no reliable source, say plainly it cannot be verified and do not fabricate.
- Writing: mainly short sentences and imitation, keeping the student's own meaning; change only the one spot that most hurts readability, and do not rewrite whole paragraphs for the student.
- A new `session_id` does not carry over the previous session's story, word list, or unanswered questions; the profile's next step is used only to pick a new English goal.

While waiting, have the entry sync `context.turn_state`: the shared current question, received answers, and pending question, plus `active_method` (the current main method), `method_step`, angles already covered in the turn arc, hints used, and any necessary activity plan; for news, also store the presented article, source citations, and reading step. Auxiliary methods provide local support and do not override the original activity plan or main step; the hint count accumulates per stuck point and does not reset when the method changes. Once a full article has been presented, continue only with the current question and do not re-search or regrade; multi-question plans advance one turn at a time, and unanswered items do not count as performance. Text without a persistent extracted reference is stored in `context.materials`; if a reference exists, reuse it and do not copy raw student data.

When resuming the same log, first handle the lifecycle's explicit end, mode, or topic requests, then continue with `active_method` and step; if an old log lacks markers, resume from existing material and pending questions, asking about only one spot if key information is missing. After a method wraps up, clear the active markers; a new session does not inherit old pending state.

Completion condition: either one answerable English question is asked, or the current answer is handled and one action is given; steps that depend on a new response wait, and understanding or level is confirmed only from evidence.

## 3. Wrap Up and Return

When there is evidence of understanding or expression, summarize in one sentence the student could repeat and give one small next step; while an answer is pending, keep the current question. When a single angle is answered correctly, continue to the next angle; wrap up and offer next-step options only when the turn arc's angles are exhausted or the student explicitly wants to leave. Ending, saving, or changing topics goes to the shared lifecycle.

Read `english-core` `references/english-segment-fields.md` and return the single `session_segment`: `subject: english`, `mode` inherited from the caller, `submode` as above, and `source` aligned to `target_context.source`. Method-skill evidence is merged into the same record, not logged as another turn. `diagnosis` uses only one main label; `current_levels` gives a partial update only when evidence is sufficient.

Completion condition: required fields are complete, and understanding, expression, correction, or difficulty has evidence; optional fields without evidence are omitted.
