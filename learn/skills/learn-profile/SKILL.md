---
name: learn-profile
description: View learning progress, saved plans, or edit the profile. Use when the student asks about current focus, recent progress, or milestones, or wants to change display name, education stage, interests, long-term goals, or learning preferences.
---

# Student Profile

Load `learn-core` and `learn-data` if not already loaded. First read `outputs/students/session.json` and the shared profile to determine the student and the real current subject; if the current student or the shared profile is missing, direct to `/learn-start` and stop. Read `references/teaching-resolver.md` from `learn-data` and adopt its teaching implementation and scope result: `teaching.core_skill` identifies the actual specialist or general core and does not mean the current stage necessarily fits a specialist. Then execute only the view or edit branch the student requested.

## View

1. Read the current subject's `profile.json`, `milestones.json`, and `current_state.json`; when a plan/support history is requested, also read the same subject's `memory.json`.
2. Give a short recap in language suited to the learner, showing only what is supported by evidence:
   - Form of address, interests, and the real subject/goal; show grade, `education_stage`, and `learning_context` only if provided, do not apply a primary grade to an adult, and do not present unknown as weak ability.
   - Current focus: `current_state.active_focus`, then `session_history[0].focus`.
   - Neutral task facts, dates, and sources for at most the last 5 sessions; mention specific progress only when there is ability evidence, and describe independent completion, performance under support, and AI-collaboration verification separately. Self-reported participation or confidence is not mastery.
   - The most important existing milestones, at most 3; general-source records are not automatically relabeled as specialist-package mastery evidence.
   - Explicitly set shared `learning_preferences.goals` / `learning_preferences.support_preferences`, and any next-step suggestions the student requested.
3. Support memory is shown read-only: `learning_support_memory.plans` / `learning_support_memory.observations` in `memory.json`. State only the plan content, or neutral observations in specific situations with their dates and sources; say these are historical facts and do not infer they still apply. Old entries without a source are not used for current psychological judgments and no psychological trajectory is stitched together; with no records, say there are no saved records, and never present a temporary discussion as a saved plan.

Show only the current subject; ask about scope before viewing another subject, and do not mix other subjects' difficulties because of shared goal preferences. Summarize in plain language and do not list raw JSON, skill arrays, or internal tags. Emotional, family, and career-sensitive details are not replayed in the progress display; a parent/teacher identity does not automatically authorize viewing private discussions.

## Edit

1. Confirm the field to change and its scope, especially the form of address, grade/stage, and whether a goal/preference applies to the current subject or is explicitly reused across subjects. Use `ask_user_question` for process choices; deleting an interest or an old experience needs one confirmation, and bulk or complete deletion goes through the existing safe-cleanup flow.
2. Check the current subject log; if it has a `finalize_plan`, first recover the save per the finalize protocol in `learn-data` and edit only after it succeeds. If recovery fails, do not bypass the pending plan to write the profile.
3. Write per the Write Protocol in `learn-data`:
   - Form of address, optional `grade` / `education_stage` / `learning_context`, and `personal.interests` → shared `profile.json`.
   - Cross-subject long-term goals the student explicitly sets → shared `learning_preferences.goals`; explicitly set cross-subject support preferences → shared `learning_preferences.support_preferences`. Merge and keep items not asked to change; after a correction or withdrawal, use the updated fact next time. System inferences, learning difficulties, and sensitive details are not shared.
   - Subject learning preferences, current levels, easy/hard topics, and priority goals → the subject `profile.json`. Support methods themselves are not written directly to the shared profile.
   - When changing grade/stage, sync the known primary `grade_band` per `references/grade-band-defaults.md`, and do not force-fill it for non-primary or unknown. Read `references/teaching-resolver.md` to determine the fitting contract, then take the `active_domain` and `current_levels` defaults (`references/subject-contract.md`); if it is unclear whether to reset levels, ask first, and by default keep existing evidence. An unfinished task does not hot-swap its implementation because the stage was changed.
   - A newly added interest keeps the other interests; remove one only when the student explicitly says they no longer like it. When the learning context affects expression/support, read `references/learner-stage.md` from `learn-support` as needed.
4. `learning_support_memory` plans/observations may be written only by finalize; this skill does not modify `memory.json` directly, does not backfill observations, and does not turn old emotions into labels. When the student asks to correct a historical fact, stop citing the invalidated fact and hand the correction/explicit plan back to the lifecycle's single save entry; deletion requests follow the safe-cleanup protocol.
5. Only after all requested fields are written successfully and the valid snapshot is updated in sync, tell the student it has been updated. On partial failure, say which fields are not yet saved; distinguish shared settings updated, resume state written, and long-term plan saved, and never describe an incomplete save as successful.
