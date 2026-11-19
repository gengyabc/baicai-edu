---
cited: learn-data/references/teaching-transition.md
---

# Cross-Subject Target Handoff

Executed only by the shared lifecycle; a recommendation returns only an authorized target and does not write session identity. Cross-subject choices and explicit cross-subject targets both use this protocol. Real target identity and teaching resolution follow `references/teaching-resolver.md`, and saving still goes only through Finalize. All paths are derived from the current student and a valid subject id; arbitrary file paths in the log are not accepted, and old logs or evidence are not moved.

## Preparation and activation

1. In the old subject log's recommendation, first persist selected_id; an explicit cross-subject target also creates a selected-handoff object of the same shape. Add `transition`, containing from_subject, from_session_id, to_subject, to_scope_id, to_session_id, selected_id. The target focus, target_context, and teaching stay in the corresponding candidate. to_session_id is generated here and checked not to conflict with the target's existing log identity, and a retry does not regenerate it. If any write fails, STOP and leave the old identity untouched.
2. First complete the old topic's Finalize (including any requested plan), keeping the selected recommendation and transition; the old subject's current_state marker must match from_session_id. If the source has only temporary state and nothing committable, the lifecycle completes a no-op cleanup but keeps that selected handoff, and writes `source_closed: true` in the transition as a closing confirmation that produces no long-term evidence. If writing the confirmation fails, still STOP.
3. Write session.json's new subject/scope_id/teaching while keeping `pending_transition`, whose value is the above transition plus the same student_id. A successful write does not mean new teaching has started. On failure keep the source log so it can be retried.
4. Read the target subject log. If it already has a different unfinished session, stop and ask how to continue/save, without overwriting or mixing. When the target log is missing, create a new log by to_session_id, initialize missing target profiles but keep existing files; teaching may begin only after the authorized target, material references, mode, scope_id, and teaching are successfully written into the new context. On failure keep pending_transition, and do not generate questions or claim the switch is complete.
5. After the target context succeeds and its identity matches the transition exactly, clear the source log's recommendation, then remove session.pending_transition; if either cleanup fails, only retry the cleanup and do not create another task. If the source is cleared but the pointer is not, the matching target context proves the handoff, and candidates need not be rebuilt from nothing.

## Restore priority

Read Snapshot checks pending_transition before target initialization and ordinary log restore:

- Crisis/explicit end still takes priority; an end may complete the requested save and handoff cleanup but does not start target teaching. A save request alone does not automatically start a class.
- The student_id in the pointer must equal the current student, and the subject/session/scope ids must be syntactically valid; first read the source log/marker in a targeted way to verify the original authorization and that the old topic was closed, then read the target log, without scanning other subjects.
- When the new context already matches to_session_id/to_scope_id/the candidate target, only finish cleanup; repeated restore after the source candidate was cleared also relies on that matching context.
- When the new context is unfinished, the selected_id, transition, and pointer in the source log must agree, and the old topic must be committed or source_closed true, before continuing per step 4. Do not guess old options, and do not change the already-prepared target identity.
- When the source is missing, authorization does not match, the target already has a different unfinished identity, or there is a manual-edit conflict, stop and clarify; keep the pointer and recoverable records, and do not silently overwrite or start a target from the new subject's default history.
- A cross-subject choice is consumed only after the authorized new context is complete; an old session without pending_transition is restored under the original protocol.
