# Finalize Session

Before running, read this skill's `references/profile-schema.md`, `references/session-schema.md`, and `references/session-retention.md`, plus `learn-core`'s `references/feynman-skill-whitelist.md`. Aggregate `session_segments` into five patches (subject profile, diagnosis history, memory, current state, milestones), merge-write them into the four subject files, then clear the log.

## Inputs

```json
{
  "student_id": "stu_xxx",
  "subject": "subject_id",
  "session_id": "sess_20261004_1200",
  "session_segments": [],
  "status": "completed",
  "interrupted_at": null,
  "last_topic": null,
  "entry_point": "learn"
}
```

Rules:

- `student_id`, `subject`, `session_id`, and `session_segments` are required.
- `status` must be `completed` or `interrupted`, defaulting to `completed`.
- When `status = "interrupted"`, `interrupted_at` and `last_topic` are required.
- `entry_point` is one of `learn`, `learn-feynman`, `learn-save`.
- `session_segments` is read from `session_log.json` first; a copy in the model context is only a cache.

## Idempotency Gate

1. Read the full `session_log.json` and `current_state.json`, and verify that student/subject/session_id match this save.
2. An identical `last_finalized_session_id` means the four subject files are already committed: do not rewrite subject files or accumulate errors again. If the same log still has segments/context/support_events/finalize_plan, clean up only those already-committed temporary contents; a selected recommendation is not stale teaching residue and is kept per Cleanup. If cleanup fails, say "learning records are saved, log cleanup is not finished," retry cleanup next time, and do not wrongly report that learning data was not saved.
3. A different marker with a matching `finalize_plan` in the log: directly execute Commit And Recovery below, without regenerating the summary/patches and without prepending or counting again on half-written files.
4. A different marker and no plan: continue with Process. Old log/file shapes are all compatible; only a new finalize produces a plan.

## Process

Validation failure is not an empty save: an invalid or stale learning_plan (including missing/mismatched owner authorization, scope, version, linkage or revision) must STOP before No-op, Prepare, or cleanup. Retain context, frames and segments, report the specific saving limitation, and resolve only the missing/corrected update; do not discard the chain as though there were no save input. Pending prepared-plan recovery still precedes this validation.

1. Read the log's `support_events` (a missing field in an old log is treated as an empty array); first verify that a plan event has student_requested_save true, or that a correction event has an explicit student correction request. Also validate any changed authorized learning_plan per `references/learning-plan.md`, including owner/provided-to-student authorization, scope/teaching, revision and terminal tombstones. If both segments and support_events are empty and there is neither a changed authorized learning_plan nor another valid save input: return `nothing_to_finalize: true` and write no long-term files. When there is only temporary support and the session is ending or switching topic, the lifecycle clears the context; do not falsely claim a long-term plan was saved. See No-op for the return shape. If non-empty, classify and prepare per the next section, and do not fabricate specialist performance for support or general records.
2. First classify per "Performance routing and non-performance saves"; with no specialist segments, skip the specialist aggregation of steps 3–9 here and go straight to step 10 with the result of the isolated general/support branches. With specialist segments, choose the final focus: take the `focus` of the last such segment; if interrupted, take `last_topic`.
3. Aggregate `overall_performance_code` / `overall_performance_text`: take the most conservative/lowest tier and write one overall sentence.
4. Aggregate `strategy_summary`: merge the segments, at most 2-3 sentences.
5. Merge `strengths` / `difficulties`: dedupe, keeping 3-5 of each.
6. Aggregate `recommended_targets`: dedupe, keeping 1-3.
7. Generate `next_step`: prefer the last segment's `next_step_candidate`.
8. Generate `final_summary`.
9. Generate the five patches (see below); the subject profile and diagnosis history patches merge into the same subject profile file.
10. Read the four full subject files and merge in memory into four final JSON documents; first execute Commit And Recovery below, and do not write subject files while generating patches.
11. After a successful commit, clean the log per Cleanup.
12. Give the student a one-sentence summary.

## Performance routing and non-performance saves

Before preparing the plan, route by teaching.evidence_namespace (an old segment without the field counts as specialist):

Ordinary chat and self-reports about family or emotions are not performance or plan events and do not form stable support observations; even if repeated, they are not automatically distilled into long-term interests, preferences, or psychological labels. Communication choices and declined are used only for temporary restore and are not written to long-term profiles. With no valid segment or event and no changed authorized learning_plan, take the No-op path and do not write the four subject files; at the end, only the lifecycle clears the temporary log. If there was earlier genuine teaching performance or support_events with an explicit save request, still save per the original evidence and whitelist, do not mix later chat into the summary, and do not migrate or delete existing evidence. Changes to shared goals/preferences go only to `/learn-start` or `/learn-profile` and must not be done by bypassing through a support save.

- Only specialist segments take part in the existing final_summary, subject_profile_patch, error_history, confirmed_skills, current_levels, and milestones flows; the other merge steps in this file take only those segments as input.
- general_v1 segments are only prepended to memory.general_progress, with a field whitelist of session_id, date, subject, scope_id, teaching, focus, strategy_summary, ability_evidence, next_step, target_context, and material references material_refs; target_context/material_refs come from the matching context and keep the student's original intent, without copying raw or sensitive content. Pasted original text without a persistent source is not written to long-term memory, and when resuming, missing required material must be provided again; the source is the actual segment, containing no specialist diagnosis, grades, or confirmed skills. Dedupe by session_id + scope_id, using the retention policy; they do not take part in specialist mastery or subject summaries. When there is actual performance, current_state's active_focus, source, submode, teaching, and scope_id must be written as the resume cursor: the last real performance segment in time decides the current scope, and mixed records also use that last segment's implementation and scope; it must not be overwritten by a later pure support event. If the last segment is general, resume from the corresponding general_progress; if the last is specialist, take the specialist candidate chain.
- support_events with kind: plan and student_requested_save: true are written to memory.learning_support_memory.plans, taking only id/date/scope_id/summary/source; they do not update performance, errors, levels, or milestones. kind: correction follows the rules below.
- With no specialist segments, final_summary is null, and the plan adds `record_kind: support_only` (support events only) or `record_kind: general` (with general segments). Keep the original mirrors of profile and milestones, and do not insert an empty subject session summary. With only a plan, do not overwrite current_state's active_focus/source/submode; update only the marker and updated_at. A mixed record uses `record_kind: mixed`, and the specialist summary is also based only on specialist segments.
- A changed authorized learning_plan takes the snapshot branch in `references/learning-plan.md`; with no segments/events, use `record_kind: learning_plan`, final_summary null and unchanged profile/memory/milestones mirrors. Preserve the performance cursor; write only the snapshot/marker/updated_at into current_state. Mixed saves add the snapshot to the ordinary mirrors. Before clearing context, confirm the expected snapshot id/revision/status was committed. Terminal snapshots are tombstones, not deletions.
- All branches still prepare four full mirrors, committed in the original order, with the marker last. No specialist performance is not a sufficient condition for a no-op; only having no valid segment/event and no changed authorized learning_plan is a no-op. Replaying the same plan uses the same mirrors, without re-aggregating or recounting.
- Cleanup clears both `support_events` and temporary learning_support (cleared along with context); if log cleanup fails, keep all uncleaned content for idempotent retry and do not append the plan again. The result should distinguish "learning plan saved," "general task progress saved," and "subject learning record saved," and a support plan must not be described as a mastery gain.

### Stable observations and corrections

Long-term support observations go in memory.learning_support_memory.observations, with entries containing id, date, scope_id, source, observation, support_used, evidence_refs, status. They are aggregated by finalize only when supported by facts traceable across sessions and useful for later teaching, and a stable judgment is not formed from repetition count alone; with no basis, add nothing. source is student_statement / observed_action, and status is historical / superseded. Even if recently still applicable, check against the current task first and do not treat it as a permanent psychological trait; old motivation_signals without a source are kept but not over-interpreted.

When a student explicitly corrects a saved plan or observation, the lifecycle adds `{id,date,scope_id,kind:correction,target_id,target_collection,summary,source:student_statement}` to support_events (the log uses valid JSON), with target_collection only plans / observations; only targets of the current student/subject are allowed. Before Prepare, verify the target exists uniquely: a plan is updated by target_id to the neutral content the student confirmed, keeping the original id and updating the date; an observation is marked superseded, saving the necessary correction note and leaving no sensitive verbatim. If the target is duplicated or not found, ask for clarification and do not silently replace. A correction event is deduped by its own id; it replays in the same mirror as other saves. When there is no log yet, the lifecycle creates the support log; a profile skill must not bypass and write memory.

## Commit and Recovery

Files still use single-session local read/write, and no cross-file transaction is claimed. To make partial writes safely retryable, use the prepared plan in the log:

1. **Prepare**: before any subject file write, first write `finalize_plan` into the current log and confirm success. The plan contains the matching `session_id`, `student_id`, `subject`, `final_summary`, and four full final JSON documents under `target_files`: `profile`, `memory`, `milestones`, `current_state`. Timestamps and error counts are fixed at preparation; the final current_state mirror includes this marker. Target paths are computed by the data protocol, and arbitrary paths in the plan are not accepted.
2. **Commit**: in the order `profile → memory → milestones → current_state`, read each target file first, then write the final mirror from the plan. The marker may be written only in the last subject file; do not clear the log until all four files succeed. A retry always replays the same mirrors and must not re-merge, re-prepend history, or add error counts again based on partially written files.
3. **Failure**: if preparing the plan fails, write no subject file; if a failure happens mid-commit, keep the full plan and segments, state clearly that saving is incomplete, and stop new teaching. The next `/learn-save` or recovery replays the plan first. While a plan is held, the same student/subject must not run a new `/learn-profile` edit or `learn-errors` write; first complete/recover the save, and do not overwrite external modifications made midway. If a manual-edit conflict is found, stop and ask the user to choose a recovery approach.
4. **Cleanup**: after the marker is written successfully, clear segments and support_events, and remove context, finalize_plan, and the unselected recommendation; the log keeps `session_id`, `entry_point`, `started_at`, `updated_at`, and `segments: []`. If the recommendation already has a valid selected_id, keep that object as is (including mode) until the lifecycle successfully writes the new target context; it takes no part in the summary/patches. An explicit end or cancel makes the lifecycle clear it. A retry at this point only does cleanup and does not rewrite subject data. The next `/learn` creates a new session and takes over the selected target; `/learn-save` alone does not automatically start new teaching.

The plan exists only in the current unfinished log, used to replay after a sequential write failure; it provides no multi-process lock or recovery from arbitrary file corruption.

## final_summary

The shape is the Session Summary Entry in `references/profile-schema.md`. When interrupted, `status` is `interrupted` and `interrupted_at` and `last_topic` are written; when completed, `status` is `completed`.

## subject_profile_patch

`current_levels` is nested under `profile`; do not write it at the top level. Merge only changed fields.

- `profile.current_levels` is updated only when there is evidence; when uncertain, keep the original value. Evidence comes from a segment's `current_levels` or `diagnosis`. Key names are defined by the subject package. An empty object only marks the field position; do not use it to overwrite an existing level.
- An empty `session_history` is only a placeholder; prepend the latest `final_summary` generated in the previous section, keep the interruption fields, and retain old records per `references/session-retention.md`.
- `learning_state` overwrites only the fields that appear in the patch. The threshold for adding to `mastered_topics` is in Subject Memory of `references/profile-schema.md`.

## error_history_patch

Every segment with a `diagnosis` object produces one diagnosis entry. File-based errors are written by `learn-errors`, not here.

`error_history` entries use the Diagnosis entry of `references/profile-schema.md`: `source: diagnosis`, the current `date`, `analyzed: true`, and the remaining fields generated from the segment's diagnosis and next step.

Rules:

- `error_id` uses `diag_<YYYYMMDD>_<3-digit sequence>`; on the same day, increment based on existing `diag_` records.
- `label` must be a value from the current subject's label table. This file does not enumerate labels.
- Prepend the latest entry, with the cap per `references/session-retention.md`.
- When multiple segments share the same label, write only one entry, keeping the latest evidence and `next_step`.
- `priority_targets` are chosen deduped from the latest `diagnosis` and `next_step`, with the count per `references/session-retention.md`.

## memory_patch

Merge per Subject Memory in `references/profile-schema.md`. When there are no new observations, do not change `profile_memory`.

Merge rules:

- Process `confirmed_skills` and `skill_errors_observed` in segment time order. The confirmation threshold, error counting, and retraction/re-confirmation follow `learn-core`'s `references/feynman-skill-whitelist.md` exactly; do not set a separate threshold in finalize.
- Skill names that meet the confirmation condition are converted to `{ "skill", "domain", "confirmed_at" }`, deduped by `skill`; error counts persist as `{ "skill", "error_count", "last_error_at" }`. An old confirmation that was retracted must not be re-added by an unordered merge.
- `feynman_readiness` takes `unknown` / `ready` / `not_ready`.
- `preferred_scaffolds` and `expression_traits` are updated only for traceable stable patterns. Old motivation_signals are kept as historical reference; new support observations are written to learning_support_memory.observations, and no psychological labels without a source may be added. Before the next turn uses them, check against the task context and student corrections.
- `material_difficulty`: take `context.difficulty_request` from `session_log.json` and write it as is into `profile_memory.material_difficulty`; when there is no request, keep the original value. It records a presentation preference, does not change `current_levels`, and is not mastery evidence.

## current_state_patch

Overwrite the fields to change this time per the Current Learning State template.

- Write `last_finalized_session_id` as the idempotency marker.

## milestones_patch

For the shape and `type` enum see Milestones in `references/profile-schema.md`.

Rules:

- First merge duplicate focuses, keeping the most recent.
- Ordering, caps, and over-limit compression follow `references/session-retention.md`.
- Record only long-term meaningful changes: strategy stage changes, topic mastery, repeated success, clear leaps.

## No-op

```json
{
  "success": true,
  "nothing_to_finalize": true,
  "already_finalized": false,
  "writes": [],
  "final_summary": null,
  "subject_profile_patch": {},
  "error_history_patch": {},
  "memory_patch": {},
  "current_state_patch": {},
  "milestones_patch": {}
}
```

## Persistence Rules

- Write one summary per complete learning session; `learn -> feynman` counts as one complete session.
- Write only the four subject files: the shared `profile.json` (name, grade, interests, experiences) and `data/.../raw/` are both outside finalize's write scope, and no `shared_profile_patch` is generated.
- Commit failure and cleanup failure are handled separately per Commit And Recovery.
