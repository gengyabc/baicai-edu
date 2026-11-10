---
name: learn-general-session
description: General-task teaching. When teaching resolution selects the general path, run explanation, practice, feedback, and verification around student materials or real goals; supports ordinary and Feynman modes.
user-invocable: false
---

# General-Task Teaching

This path is the sole teaching owner of the current task and does not create a second lifecycle. Load `learn-core` and `learn-general-core`, and reuse the student, real subject, scope_id, teaching, snapshot, and resume state handed over by the lifecycle; do not write logs or the long-term profile yourself. With no current student, handle it per the unified lifecycle gates.

## Start and Resume

First obey the lifecycle's safety, save, end, recommendation, and support gates. When a recommendation has not yet been selected, hand off to `learn-recommend` and do not start teaching. Resume keeps the current material, question, the student's answer, and the mode, and does not restart a question because a package is missing. Teach only from messages/materials the student has already sent; read a file before using it, and do not infer unsubmitted drafts, the board, or works.

Based on the student's real goal, define one small task and its success criterion. Ask one question only when essential information is missing; otherwise start with an explanation/minimal demonstration and invite the student to try. Give feedback on current evidence and gradually reduce support; it can be increased again as the student needs. Verify unknown specialist facts or state uncertainty; for high-risk tasks, turn toward principles, evidence-based verification, and professional help, and do not refuse to teach merely because a package is missing, nor pose as an authoritative certification.

## Each Turn

- Ordinary mode: advance one small goal at a time; after explaining, leave room for the student to understand, try, or verify personally. Judge existing answers per the confirmation rules in `learn-core`, and do not use AI output as evidence of the student's ability.
- `mode: feynman`: apply the role and evidence rules already loaded by `learn-feynman`, and let the student lead the explanation; do not slip back to long teacher lectures or enable a specialist package's transfer activities. The general path still does not create specialist confirmed_skills.
- For an explicit support need, adopt the `learn-support` method advice provided by the lifecycle; if a cue first appears during teaching, return support_update to the lifecycle and do not open a separate support flow yourself. Use one main method and, if needed, one auxiliary; with no need, just teach.
- Do not fabricate mastery levels or specialist diagnoses; describe task errors with neutral, verifiable specific observations. For professional and career tasks, distinguish independent capability from AI-collaboration capability according to the goal, and do not require everything to be done without AI to count.

## Return

Return the student-visible reply, the updated turn_state, and one segment when real student performance exists; when there is only questioning, demonstration, support discussion, or a recommendation choice, the segment is null and the lifecycle updates only the context. Merge internal actions and do not record a separate turn.

A real segment uses the common required fields, with mode/submode as the current actual mode; append `scope_id` and `teaching` (evidence_namespace `general_v1`), and fill ability_evidence per `references/session-schema.md` in `learn-data`: describe independent capability, performance under support, AI-collaboration capability, and the observation conditions separately, and a watched result is only exposure. Leave unknowns empty.

Do not return a specialist package's current_levels, confirmed_skills, skill_errors_observed, or diagnosis; general_progress is saved uniformly by finalize. next_step_candidate is a suggestion the student can choose and does not auto-switch the goal. After a small goal is completed, wait on the shared next-step menu.
