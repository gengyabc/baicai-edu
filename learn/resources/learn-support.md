---
name: learn-support
description: Learning support. Load when the student asks about usefulness, fears they cannot learn, resists or is required to learn, wants to talk first, leaves choices to the AI, wants to learn but methods are unclear or ineffective, seeks help with time/resource constraints, or needs start/persist/recover support; a single wrong answer, silence, or short reply does not trigger. Return method advice only to the current teaching owner.
resources: supportive-conversation.md value.md confidence.md autonomy.md strategies.md persistence.md learner-stage.md evidence.md llm-safety-boundaries.md session-schema.md session-lifecycle.md
resource-loading: on-demand
---

# Learning Support Methods

The session has exactly one teaching owner: the resolved specialist or general session. This skill advises that owner; it does not route by itself, write profiles, or produce segments. Apply the `learn-data` lifecycle gates first: an explicit end takes priority over support; recover unfinished saves before support. On crisis cues, stop and read `learn-core`'s `references/llm-safety-boundaries.md` before replying or recording.

Read only the selected references. Local references use this skill's returned base; for a named owner use that owner's returned base.

## Input and Return

The caller supplies the minimal context; when information needed for the current step is missing, return only one clarifying question:

| Input | Content |
|---|---|
| `current_task` | Current goal, submitted materials, teaching implementation, mode/activity, pending question, and resume position; pure support may have no subject goal |
| `need_evidence` | The current need and its source: student self-report or observed action; inferences are listed separately as hypotheses to clarify |
| `willingness` | The student is willing to try, unknown, or refuses; reuse the choice already made in the current task |
| `constraints` | Current time, energy, resources, prior experience, and optional stage/context; unknown stays unknown |

Return to the teaching owner:

- `action`: one main method and, if needed, at most one auxiliary method; state the teaching owner's next action. With a task and a willing student, give one small step for the student to try personally; pure chat has no task forced on it. The advice is carried out by the current owner and does not open a separate teaching turn.
- `observe`: observe self-report, participation, and task performance separately, stating the hint/demonstration conditions; keep it unknown when there is no observation.
- `exit`: when this method returns to teaching, switches to foundational diagnosis, rest, or ending; more chatting or a promise is not completion.
- `support_update`: a minimal update suggestion for `context.learning_support`, written by the lifecycle. The lifecycle reads its `learn-data` `references/session-schema.md` and `references/session-lifecycle.md` before applying the update or handling a save; no separate storage.

## Selection and Exit

1. With no explicit need, keep the current activity and run no fixed questionnaire. Silence, short answers, a single error, or the number of revisions do not by themselves prove low motivation. Distinguish goal, foundation/method, learning conditions, and support needs only when clarification is truly needed. A need may be `unknown` (insufficient evidence) or `conditions` (real-world conditions such as time, cost, family/work responsibilities, environment, and resources); both are allowed to stay outside the five method categories. Handle actual limits first, clarify only one condition if necessary, and do not attribute a lack of resources to a lack of motivation; how state is expressed follows the data protocol.
2. When the student is unwilling to learn, is being required to learn, wants to chat first, or wants to correct the understanding of their situation, first read [supportive conversation](references/supportive-conversation.md) and follow its responses, invitations, and exits; then read only the method in the table below that is explicitly matched, and do not hunt for a need in ordinary chat. Ordinary learning does not need the full text loaded.
3. Keep the current goal, material, pending question, mode/activity, and resume position. Specialist method scheduling still belongs to the current session; where a language activity already has scheduling, reuse its methods, and this skill sets up no per-turn scheduling table of its own. Feynman keeps the student as the explainer, and support does not override the mode.
4. When the student declines the current discussion, return `status: declined`; specific responses and renegotiation conditions follow the supportive conversation reference, and the student is not automatically brought back to the question. Real-world cost is not a willpower or personality label.
5. Once a method is complete, hand back to the current owner; the next activity is decided by the student's willingness and the method's exit conditions. When a task attempt produces no change, re-check foundation, strategy, and conditions first rather than stacking mechanically. Scaffolding fades with current performance, and may be added back when a new difficulty arises. The effect of support never auto-upgrades mastery, diagnosis, or milestones.

| Need | When to read | Method |
|---|---|---|
| `value` | Asks about usefulness, thinks it is unrelated to their own goals | [Value support](references/value.md) |
| `confidence` | Explicitly worries about being unable to learn | [Confidence support](references/confidence.md) |
| `autonomy` | Unwilling to learn, passive goals, needs to understand choices or explicitly delegates; chat first is handled per the conversation reference | [Autonomy support](references/autonomy.md) |
| `strategies` | Wants to learn but the method is unclear or ineffective | [Strategy support](references/strategies.md) |
| `persistence` | Actively asks for help with starting, interruption, or resuming | [Persistence support](references/persistence.md) |

When expression or the degree of companionship needs adapting, read [stage and context](references/learner-stage.md); when a theory needs explaining or its basis needs checking, read [sources and limits](references/evidence.md). Theory provides mechanisms and does not replace task evidence.

## Ownership

- Recommendations, task/subject switches, mode switches, board operations, and reminders all go back to their existing authorization entries; method advice itself authorizes none of them.
- Support layered on ordinary teaching keeps the original activity; pure support uses `activity: support` from the lifecycle, and with no subject answers no segment is made. When the student explicitly asks to save a plan, return only a neutral summary and the request facts for the single save entry to handle; do not claim it has been saved long-term.
- Current emotions, difficulties, and need hypotheses stay temporary state, and no psychological labels are generated or automatically propagated across tasks. A safety crisis goes to the safety rules first, and crisis details do not enter support state or learning records.
