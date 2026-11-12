# Session Schema

Each teaching turn needs only this file: the structure of the log and segments. Templates for profile, memory, state, error items, and milestones are in `references/profile-schema.md`, read only when creating a profile, initializing missing files, and finalizing.

## Session Log

- Path: `outputs/students/<student_id>/<subject>/session_log.json`
- The source of truth for an unfinished session. Segments in memory are only a cache. Each item of `segments` is one Session Segment.

```json
{
  "session_id": "sess_20261004_1200",
  "entry_point": "learn",
  "started_at": "2026-10-04T12:00:00Z",
  "updated_at": "2026-10-04T12:18:00Z",
  "context": {
    "focus": "current focus",
    "mode": "learn",
    "activity": "teaching",
    "target_context": { "type": "topic", "topic": "current focus", "source": "manual_topic", "files": [], "intent": null },
    "materials": {},
    "turn_state": {}
  },
  "segments": []
}
```

- `context` is optional for old logs. New sessions and restored sessions write it when the target is determined, when mode or activity changes, and after every turn. The `mode` here is the interaction mode (`learn` / `feynman`), synonymous with the segment's `mode`; subject-internal branches are not written into `mode`.
- `context.difficulty_request` (optional) stores the student's most recent explicit difficulty request: `{ "direction": "easier" | "harder" | "standard", "note": "...", "requested_at": "..." }`. Finalize writes it to `profile_memory.material_difficulty`; omit it when there is no request.
- `activity`: `teaching` / `transfer`. For ordinary teaching, `turn_state` stores `current_task` (the original text of the current question), `response_format` (answer requirements), `student_response` (the answer already received, null if unanswered), and `pending_question` (the latest pending question, null if none). A new question replaces the current question and answer; an explanatory follow-up keeps the original question and answer. On restore, first check this message, then pick up the latest pending question. Transfer also puts the source domain, extracted techniques, current stage, round count, and pending question in `turn_state`, and restore does not restart the stage.
- Optional `context.turn_state.solution_choice` retains the shared **Informed full-solution choice** from `learn-core`'s `references/pedagogy-core.md`: `{ "task": "exact current task identity or text", "warning_shown": true, "status": "awaiting_choice" }`. Status may become `full_requested` only after an explicit post-warning full-solution choice, then `delivered` after delivery. The choice is task-specific, not a mode, preference, performance segment, or long-term profile field. Keep the original task, received work, and reasoning question alongside it; while awaiting choice, `pending_question` holds the choice prompt. Restore only for the same task. Returning to guidance, cancellation, or changing task removes this choice and restores the reasoning question when applicable; skip does not authorize a solution or require re-asking. Absent in old logs means no recorded authorization. This schema stores state only; the shared teaching gate owns warning and decision semantics.
- For the shape, file-processing flag, and references of `target_context`, see `references/target-parsing.md`. `materials` stores necessary pasted text, drafts, or answers only when there is no persistent file; existing files use workspace references. Do not write crises or private experiences here.
- An old log without `context`: restore the last segment, and ask if material or intent is missing, without inferring. Extracted references already in `error_history` may be read, and raw is not reprocessed.
- `finalize_plan` is defined only by `references/finalize-session.md`. While a plan is incomplete, finish the save first, then teach, edit profiles, or write error items.
- `/learn` and `/learn-feynman` both go through `references/session-lifecycle.md` to append the single subject segment and update context. Append only for actual student performance; in other turns the segment is null and only context is written. After Finalize commits the four subject files, segments, context, and plan are then cleared.

## Prerequisite learning plans

Optional `context.learning_plan` follows `references/learning-plan.md`: versioned local task frames, one active projection, stable root scope/teaching, and evidence-based single-parent returns. Read that reference before creating/changing/restoring a plan; the current teaching owner owns subject semantics. Its durable snapshot is `current_state.learning_plan`, separate from support_events and performance memory. Old logs without it keep the single-task flow.

## Teaching implementation and support state

A new context adds `scope_id` (the stable identity of the selected target) and `teaching`; its core/session fields store actual unique skill names, not just a subject-derived alias. The result and the defaults for old logs follow only `references/teaching-resolver.md`, including legacy mathematics-name restore. A new segment also carries the same scope_id/teaching; an old segment without these fields is treated as specialist and is not migrated or rewritten. `activity` additionally allows `support`: with pure support, focus and target_context may be null and turn_state does not fabricate a current question; with a real task, support layers on top and keeps the original activity, material, mode, and pending question.

Optional `context.learning_support`:

```json
{
  "primary_need": "confidence",
  "status": "hypothesis",
  "evidence": [{ "source": "student_statement", "observation": "Worried they won't be able to learn the current task", "date": "2026-11-09T08:00:00Z" }],
  "method": null,
  "observation_goal": "Observe whether the student is willing to try the current step after a minimal hint",
  "outcome": { "statement": null, "participation": null, "task_performance": null },
  "resume_question": null
}
```

primary_need is value / confidence / autonomy / strategies / persistence / conditions / unknown; conditions means practical limits such as time, resources, responsibilities, or environment, which are handled first as conditions and not classed as insufficient motivation; unknown means insufficient evidence and does not require completing a classification. They do not force use of the five kinds of methods, and method may be null; ordinary conversation need not create learning_support. status is hypothesis / clarified / active / observing / declined. evidence.source is student_statement / observed_action; an inference cannot pose as a fact, and crisis details or irrelevant private life must not be recorded. The three outcome items are neutral observations of the student's own statement, participation, and task performance, using null for unknown; they are not a motivation score or mastery. Ordinary chat generates no segment, mastery, or milestone, and does not summarize family, emotions, and small talk as learning performance.

When the student denies or corrects the understanding, first withdraw the original hypothesis, then replace primary_need/evidence with the necessary corrected facts; if still unclear use unknown, and do not re-record the denial itself as declined. Clear method, observation_goal, and outcome that depended only on the old hypothesis (using null for unknown items), keeping the real task position, existing performance, and the still-valid chat choice/decline boundary. When no state is needed, learning_support may be removed; do not store a separate history or sensitive verbatim to keep a hypothesis. Even a confirmed hypothesis does not automatically become a long-term observation; corrections to saved plans or observations still go through support_events and finalize.

### Temporary chat choice and restore

Reuse status and resume_question, adding no fields, friend profiles, or relationship scores:

- `resume_question` is an optional minimal neutral continuation text or null, and need not be an actual question. For pure support, or a task where the student wants to chat first, it may record "continue ordinary chat, wait for the student to actively reopen learning"; it only states the process choice, does not copy the chat original, and does not record private topics or reasons for declining. The pending question and restore position of an existing task remain fully in turn_state and must not be replaced by this field.
- `status: declined` means the current invitation/discussion has been declined, and is not a low-motivation or ability label. resume_question may keep "not discussing arrangements for now, keep chatting"; when only some kind of support is declined but problem-solving continues, clear that continuation text and keep declined's restriction on the same discussion. Only when the student actively reopens, or a new target presents a clearly new need, is the corresponding support reopened; chat, interest cues, and the passage of time do not reset a decline.
- On restore, keep identity, teaching, scope_id, focus, material, mode/activity, turn_state, and the minimal chat choice; do not automatically go back to the question, add a recommendation, or invite again. When activity is support, no-target chat is still allowed; for layered support, the chat-first choice is recognized by the process meaning of resume_question, and is not ignored because the original activity is teaching/transfer. Do not infer a change in willingness from restore, short answers, or empty messages.
- An old log lacking learning_support does not fabricate a decline or chat choice; a missing status is treated as unknown, and a missing resume_question is treated as null. An old activity: support still first checks this message's intent and does not force a learning target; an existing declined is kept for the same discussion even with no continuation text. Only necessary facts related to the current target are written to temporary state, and general topics need not be written to the log.

The log's top level optionally has `support_events`, added only when the student explicitly asks for a specific neutral plan to be saved long-term:

```json
{
  "id": "plan_20261109_a3f2",
  "date": "2026-11-09T08:00:00Z",
  "scope_id": "scope_a3f2",
  "kind": "plan",
  "summary": "Next time, first recall one example independently, then check against the material",
  "student_requested_save": true,
  "source": "student_statement"
}
```

This example is one event, and support_events is an array of such events; the id is generated before the log is written and reused on retry. Without an explicit wish to save, create no event. Events do not enter segment, diagnosis, or confirmed_skills; finalize writes only whitelisted fields into memory.learning_support_memory.plans. Pure support still persists a minimal context for restore, and long-term plan saving and writing the restore state are reported separately.

`ability_evidence` is an optional array on a new segment, each item `{kind, observation, conditions}`; kind is independent / supported / ai_collaboration / exposure. Independent ability, performance under support, and AI-collaboration ability are evaluated against the task goal and are not ranked into a single level; viewing AI results counts only as exposure. Willingness to participate or neat work cannot substitute for mastery evidence. general_v1 performance enters only the isolated general history and does not update specialist levels; old segments with missing fields are not inferred or backfilled.

## Temporary learning recommendation

The log's top level optionally has `recommendation`, independent of the teaching context, and may exist even when there is no target yet:

```json
{
  "subject": "subject_id",
  "mode": "learn",
  "preferred_id": "r1",
  "candidates": [
    {
      "id": "r1",
      "focus": "a specific small goal",
      "target_context": { "type": "topic", "topic": "a specific small goal", "source": "manual_topic", "files": [], "intent": null },
      "reason": "A reason why this suits learning right now, in the active UI locale (see references/ui-locale.md)",
      "basis": "A fact supported by existing records, or an exploratory note"
    }
  ]
}
```

A new recommendation may optionally carry teaching; a candidate may carry subject, scope_id, and teaching, and a cross-domain candidate must have a target subject or neutral task identity and a clear target description. The top-level subject is always the original identity that initiated the recommendation, to prevent cross-subject mis-consumption. An existing valid selection is saved first in the original log and consumed only after the new target context is written successfully; the actual switch is handled by the lifecycle. The shapes and the restore/cleanup order of a cross-subject recommendation's transition and session.pending_transition follow only `references/teaching-transition.md`. An old object missing extension fields is still handled under the current subject.

`mode` keeps the mode at the time the recommendation was initiated, for restore when there is no teaching context; when a context exists, context.mode prevails. After selection, the optional `selected_id` must correspond to a candidate and is persisted by the lifecycle before finalize; it represents a target the student has authorized and cannot be derived from a preferred marker or a skip. Candidate ids are unique within one recommendation, and preferred_id must correspond to one of them; target_context follows the target classification contract and does not reuse unrelated old material. This object is only for interrupted-restore of the choice, is not a selected focus, and is not a segment's recommended_targets. It is formed by `learn-recommend` and written back by the lifecycle; during recommendation, the old context and segments are kept, and selecting/declining generates no performance. It is cleared after the selected target is written into context successfully, or on cancel or end. Final save does not aggregate the recommendation object into the profile; when cleaning the log, remove an unselected recommendation, and keep one with an existing selected_id until the new target context is written successfully, for recovery after a save failure. Save-only does not automatically start new teaching. An old log without this object is restored as usual, and old profiles are not migrated.

## Session Segment

Produced by the teaching skill and appended by `/learn` or `/learn-feynman`:

```json
{
  "focus": "current focus",
  "subject": "subject_id",
  "mode": "learn",
  "submode": "practice",
  "source": "profile",
  "overall_performance_code": "basic_independent",
  "overall_performance_text": "Completed mostly independently, with hints needed at a few steps",
  "strategy_summary": "The student explained their own approach; one relationship still needed a hint",
  "strengths": ["Can state one concrete reason"],
  "difficulties": ["One relationship is still unstable"],
  "next_step_candidate": "Try again with a neighboring task",
  "recommended_targets": ["A neighboring task on the same relationship"],
  "confirmed_skills": ["example skill"],
  "skill_errors_observed": ["example skill"],
  "feynman_handoff_recommended": true,
  "diagnosis": {
    "domain": "subject_domain",
    "label": "subject:example_label",
    "evidence": "The student only restated the steps and did not explain why this step holds."
  },
  "current_levels": {}
}
```

Required: `focus`, `subject`, `mode`, `submode`, `source`, `strategy_summary`, `strengths`, `difficulties`, `next_step_candidate`, `recommended_targets`.

Enums:

- `subject`: the id written by the entry. This file does not list subjects.
- `mode`: `learn` / `feynman`, following the caller's interaction mode; subject packages do not extend it. Subject-internal branches are recorded in subject fields instead, written in the subject documents.
- `submode`: `learn` / `practice` / `review` / `feynman`. Subject packages may add values. Existing old values are kept, and none are newly invented here.
- `source`: `profile` / `manual_topic` / `error_analysis` / `diagnosis` / `practice` / `save` / `focus`. Subject packages may add values.
- `error_history.source` is counted separately: `file_analysis` / `diagnosis`.

Optional, with constraints the example cannot express:

- `overall_performance_code`: `needs_support` / `basic_independent` / `stable` / `flexible`. `overall_performance_text` is free text.
- `confirmed_skills`: skill-name strings. Evidence and retraction follow the whitelist; finalize converts them into the Subject Memory objects of `references/profile-schema.md`.
- `skill_errors_observed`: skill names of the student's real errors, not mistakes the AI deliberately made.
- `feynman_handoff_recommended`: hand off to `/learn-feynman`.
- `diagnosis`: one primary label plus evidence. The label table belongs to the subject package.
- `current_levels`: a partial update of `profile.current_levels`, nested back under `profile` by finalize. The keys belong to the subject package.
- Subject packages may add other fields. Finalize keeps unrecognized fields and does not interpret them here.
