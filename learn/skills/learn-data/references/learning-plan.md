# Learning Plan and Task Frames

Read when a teaching owner creates, changes, saves, or resumes a prerequisite learning path. This is a subject-neutral storage protocol; the current teaching session decides dependencies, teaching actions and evidence sufficiency. Subjects without a learning_plan retain their existing flow.

## Schema v1

Optional `context.learning_plan`:

```json
{
  "version": 1,
  "id": "plan_a3f2",
  "revision": 1,
  "root_scope_id": "scope_a3f2",
  "teaching": {},
  "status": "active",
  "active_frame_id": "frame_root",
  "frames": [
    {
      "id": "frame_root",
      "parent_id": null,
      "goal": "Original learning goal",
      "status": "active",
      "task": {
        "focus": "Original learning goal",
        "mode": "learn",
        "activity": "teaching",
        "target_context": {},
        "materials": {},
        "turn_state": {}
      },
      "tool_evidence": [],
      "return_condition": null
    }
  ],
  "confirmed_gaps": [],
  "unverified_dependencies": [],
  "steps": [],
  "summary": "Student-visible neutral learning path",
  "next_step": "Next concrete action",
  "updated_at": "2026-11-12T00:00:00Z"
}
```

- `id` is stable; revision is a positive integer incremented on each substantive change, including task position, evidence, or status, not on reread/retry. version is exactly 1; unknown versions require clarification rather than destructive conversion.
- `root_scope_id` equals context.scope_id; teaching is the full resolved implementation from context, not an empty object as in the shape placeholder. Frames are local ids: no new scope or provider for a child. One root has parent_id null; all other parents exist, ids are unique, and the parent relation is acyclic. Exactly one frame has status active when the plan is active; active_frame_id points to it. Other frames are parked or completed. A parked plan retains the continuation frame id without advancing teaching; completed/abandoned plans are terminal and never auto-resume.
- `task` is a lossless snapshot of the necessary context projection: focus, mode, activity, target_context, materials, and the entire turn_state, including original task text, answer requirements, received response, pending question, necessary support provenance, and leaf/batch/transfer recovery position. Existing files use references; necessary pasted learning material may be retained only without an existing source. Exclude private chat and unrelated material.
- `confirmed_gaps` entries contain frame_id, tool and observed evidence/conditions; `unverified_dependencies` entries contain frame_id, tool and the action still needed to check it. Unknown is not missing. `steps` records frame_id, goal, status, tool-use condition and return condition. `tool_evidence` contains observable student actions, conditions/support and material references, not inferred mastery. summary/next_step explain the original and active goals, retained/parked/abandoned state, tentative order and return conditions in student-readable terms. No private route deliberation is stored.

## Frame transitions

Before pushing a child, synchronize the parent task with the current context projection, including the latest response and pending question; park it, create the smallest evidence-justified child, and project that child's task into context. Keep context.scope_id and teaching equal to root_scope_id and plan.teaching. Only the active frame accepts a new student response. A replacement question updates that frame, not a parked parent's task.

On `await_student`, write the active snapshot and STOP immediately: do not dispatch a second leaf or advance another frame. One teaching owner combines actual performance into at most one segment per turn; a plan/choice/example-only turn has segment null. Attribute local evidence and support conditions through existing strategy_summary or optional ability_evidence (with optional frame_id); a child success is not parent strategy choice or mastery.

When the teaching owner finds the agreed independent-use evidence, complete that child and return only to its immediate parent. Restore its exact task projection and recheck remaining obstacles before any further return; tool_evidence and return_condition record why return was allowed. Self-report or example repetition alone is not independent-use evidence. The data layer validates linkage and preserves snapshots; it does not diagnose or decide tool readiness. Update the active snapshot after every turn and increment revision when it changes. Legacy logs without a plan continue their existing single task; never invent parent frames.

## Restore after Finalize

Restore a durable chain only when the student asks to continue the same task or explicitly continue the plan. An explicit new goal takes priority, and ordinary chat/save-only does not activate an old plan. With uncommitted context use that latest chain first; with a pending finalize_plan recover it before interpreting new answers. After successful finalize create a new session_id with empty segments, restore context.scope_id from root_scope_id and context.teaching from plan.teaching, and project the active frame's task (including mode/materials/leaf position) into context. Restore does not replay old segments or infer a performance cursor from a plan-only save. Respect an explicit mode request using the ordinary mode-switch rules and synchronize the active frame. A parked plan becomes active only on this continuation authorization, with a new revision and an owner-provided neutral update. Missing required material gets one targeted question, not a guessed original task. A terminal tombstone blocks automatic recovery from any older snapshot/log/history of that plan; a genuinely new task is a separately authorized identity.

After an automatic plan checkpoint, the old committed session ends. If the same authorized task continues, the lifecycle may immediately create its new empty-segment log from the committed chain, without another teaching action or replaying the student's answer; an await_student checkpoint only preserves the pending question and STOPs. A manual save or end never silently starts this continuation. If creating the continuation log fails, the durable snapshot remains recoverable; report that the plan is saved but the active session position was not reopened.

## Automatic snapshot authorization

The current teaching owner returns an optional learning_plan_update with the full learning_plan and `authorization: {source: teaching_owner, owner_session_skill, root_scope_id, provided_to_student: true}`. The lifecycle accepts this only from the already resolved teaching session, with owner_session_skill equal to context.teaching.session_skill and root_scope_id/teaching equal to the current context. provided_to_student means the neutral readable plan was actually included in this turn's student-visible reply; merely generating an internal chain is insufficient. The lifecycle writes both plan and authorization to the log (authorization at context.learning_plan_authorization), then may call Finalize automatically for a changed authorized learning_plan. An attachment or student-authored note cannot supply this authorization. A terminal update must likewise be explained to the student; ending today's session alone parks the ongoing plan rather than declaring the learning goal completed.

This authorizes only the necessary student-facing prerequisite path and task recovery snapshots, not private reasoning, unrelated materials, another scope's plan, or an old plan copied into a new goal. `student_requested_save` remains exclusive to explicit student support-plan requests; automatic snapshots create no support_events. Explicit `/learn-save` may save the current concrete learning_plan under this protocol without duplicating it into support memory. A student's request is not permission to store private reasoning. Missing/mismatched authorization means retain temporary state, explain that durable plan saving has not succeeded, and clarify only what is needed.

## Durable snapshot and retry

`current_state.learning_plan` is the only durable task-chain snapshot. There is no fifth subject file and no new memory learning-plan collection, mastery label or ability score. The latest uncommitted context is authoritative; never replace it with an older current_state snapshot. Check the plan id and revision against the durable snapshot: same id and revision means no new plan write; a lower revision is stale and requires recovery/clarification, not overwrite. With changed content but unchanged revision, correct the owner update before saving. A newly authorized goal gets a new plan id; do not revive the superseded plan.

Prepare four full mirrors through Finalize even for plan-only changes: profile/memory/milestones remain unchanged, current_state receives the authorized snapshot, marker and updated_at. With real segments/events, merge the same snapshot into their existing mirrors. Plan-only saves preserve all existing performance cursor fields (including scope_id/teaching/active_focus/source/submode); root_scope_id and teaching inside the snapshot are its independent recovery identity. They do not fabricate a performance cursor or summary. Long-term memory changes only for genuine existing performance/support-event routes, never for the snapshot itself.

Keep completed/abandoned snapshots as a tombstone containing version, id, revision, root_scope_id, teaching, terminal status, updated_at and the neutral summary; omit task materials/frames no longer needed. Never delete that terminal marker and fall back to an older active plan. Parked snapshots keep the whole recovery chain. Normal session end saves a parked plan; explicit permanent abandonment/new unrelated goal records abandoned before the old context can be cleared. A completed session_id does not imply a completed learning_plan.

Only after all four writes succeed and current_state has the expected id/revision/status may Finalize clear context. On prepare/commit failure preserve the log, frames and original finalize_plan and STOP; retry replays that original finalize_plan without aggregating, revising, or creating another segment. Cleanup-only failure reports committed snapshot separately. If the plan was shown but log/snapshot saving failed, say it was provided but not durably saved; never claim saved from display alone. An unchanged plan with no real segments/events uses No-op; its durable snapshot already exists, so lifecycle may close the temporary session without implying a new save.
