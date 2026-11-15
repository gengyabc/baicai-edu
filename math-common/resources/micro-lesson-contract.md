# Agreed Math Micro-lesson

Rules only. The current teaching owner selects and executes the activity, replies to the student, and returns context and at most one performance segment through the existing lifecycle. Load this contract only on a new-learning branch; ordinary guidance does not preload it.

## Entry and priority

Use `learn-core`'s **Agreed new learning** gate: a clear topic, agreed teaching intent, and learner report or observed evidence supporting teaching the relation or method. A request such as “teach me unlike-denominator addition; I haven't learned it” needs no failed attempt or menu. For a broad topic, choose a small goal from known evidence; ask one short question only if the missing prerequisite or intent would materially change the next action. Grade alone is not readiness evidence.

Choose on entry to a target, an explicit same-target request to change approach, or an accepted proposal based on a concrete supported gap. A single error, short answer, silence, or ordinary answer does not reclassify the activity. A recommendation's `math_opening_hint` is advice, never consent or evidence; the latest explicit request and current pending work prevail. A new target is authorized by the lifecycle before opening.

Independent assessment, agreed autonomous discovery/derivation, Feynman, full-solution choice, pause, end, pending save, and target switch keep their existing priority. A request to explain the current step stays local guidance. A request for the original complete solution follows informed full-solution choice, not this branch.

## One observable goal

1. State one small goal and use the known starting point. Probe only a material uncertainty, not a mandatory entrance test.
2. Teach one relation with a brief, verified, labeled teacher example. Select explanation, concrete objects, a representation, contrast, construction, or derivation for this goal; multiple representations may serve the same relation in one turn. Verify calculations and reasoning before presenting. The math board remains student-authored: an explanation never authorizes reading unsent work, editing, submitting, or inferring geometry.
3. Leave a reachable, genuine judgment or action to the student. Copying the example is not independent selection of a method. Adapt from the student's actual response rather than impose a turn quota.
4. When useful and accepted, offer a structurally appropriate fresh item without naming the method to use. Attribute only what it shows. The student may instead request practice, pause, or end; an exit test is optional.

An example for a common-unit goal can show `1/2 + 1/4` on the same whole, invite rewriting `1/2` as sixths with support, then check a fresh `1/3 + 1/4` without a method cue. If common units are already understood and choosing a denominator is the obstacle, teach that smaller target instead. Understanding/applying a given formula and independently deriving it are distinct goals.

## Protect pending work

When a learner-owned problem is pending, preserve its exact task, received response, and pending point in the existing fields. Use a separate item without giving the original answer or decisive inference. For MVP, a requested same-goal analogy is a single-turn demonstration followed by the original pending question; it introduces no second pending task, scope, nested lesson, or learning_plan. If that cannot protect the original, stay with targeted guidance. Normal new-learning goals also do not create prerequisite plans; only the current provider's established, necessary prerequisite-gap rules authorize those.

## Evidence and restore

- Teacher explanation, showing an example, choosing an activity, or choosing a recommendation returns `session_segment: null`; write only context. Viewing a solution never becomes a performance segment merely to record exposure.
- Student mathematical actions may produce the existing single segment. Mark guided work as supported, distinguish student execution from AI-provided strategy selection, and state the help actually supplied. Do not count a reconstruction of exposed reasoning as independent discovery.
- A fresh unhinted answer may supply independent evidence only for the demonstrated relation, strategy, and task conditions. Immediate single-item success is not long-term mastery; unknown historical support remains unknown.
- Keep `mode: learn`, `context.activity: teaching`, and performance `submode: learn`; this is no new global mode. Use the current question, response, and pending-question fields for restore. Where needed, use optional `turn_state.active_act: micro_lesson` and `turn_state.micro_lesson` with `goal`, `phase` (`example` / `guided` / `independent`), and `exposed_support`. Store just the support needed for honest attribution; do not duplicate task or answer fields.
- Return the actual opening and advanced pending point together with removal of `target_context.math_opening_hint` for one successful lifecycle context write. On write failure stop, preserve the recorded retry position, and do not report saved progress. After success restore the recorded activity and pending point, not the old hint or opening example. Old logs without local state restore normally and imply no prior consent.
- On transfer to practice, Feynman, another activity, or exit, clear the local micro-lesson markers while retaining the original task where applicable. Pause restores the same waiting position; end and target switch use existing save rules. No profile field, scoring model, recommendation database, or durable opening hint is added. A real performance segment may leave one grounded `next_step_candidate` through the existing protocol.
