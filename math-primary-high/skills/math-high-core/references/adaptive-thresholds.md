# Adaptive Thresholds and Constraints

This file owns the configurable thresholds and the hard constraints for grade 4–6 adaptation. Platform values are defaults, not empirically calibrated claims; a parent or the student may change them, one change at a time.

## Thresholds (defaults)

| Setting | Default | Meaning |
|---|---|---|
| `difficulty_levels` | `L1`, `L2`, `L3` | `L1` concept/direct application; `L2` multi-step, variation, or transfer; `L3` open inquiry, reasoning, or proof. `profile.current_levels.overall` uses these same labels; change it only under `promotion_independent_successes` and the demotion/struggle rules below |
| `starting_level` | `auto` | Start from observed evidence, never from grade alone |
| `promotion_independent_successes` | `2` | Soft trigger to consider one nearby challenge after distinct independent successes; not a mastery or transfer threshold. Evidence must match the goal |
| `difficulty_review_after_struggles` | `2` | Meaningful struggles before simplifying one demand or probing prerequisites |
| `prerequisite_backtrack_depth` | `1` | At most one knowledge-map edge back per adjustment; not a global recursion depth limit. Confirmed child dependencies follow `references/prerequisite-learning.md`, with burden and cycle review |
| `hint_levels` | `H0`–`H4` | Optional support descriptions, not a ladder: `H0` unhinted work; `H1` attention/condition cue; `H2` strategy or representation suggestion; `H3` partially worked step or analogous example; `H4` clear explanation followed when appropriate by a fresh independent item |
| `hints_before_clear_example` | `2` | Soft cap, not a minimum; shared-gate examples can precede hints. Never force frustration |
| `method_switch_after_failed_adjustments` | `2` | Review an unproductive method after this many support adjustments; a clear mismatch or explicit preference permits earlier change. Initial method selection has no failure prerequisite |
| `preserve_method_when_progressing` | `true` | Do not switch method while the student is making progress |
| `allow_child_choice` | `true` | The student may choose an activity, an easier variant, or a full explanation |

Widen or narrow a threshold only when the student or parent explicitly asks; when an adaptation would change several dimensions at once, choose the smallest change that resolves the visible difficulty.

## Hard Constraints

- A **single wrong answer** triggers neither a knowledge-point backtrack nor a level change. One answer is a clue, not a pattern.
- Match success evidence to the goal: accurate unprompted execution can show procedural fluency; a valid explanation, drawing, action, or written relation can show reasoning. Unwillingness to speak is not evidence of misunderstanding. If the nearby challenge depends on an untested distinction, probe that distinction directly. The default two successes invite a challenge, not a mastery or transfer claim.
- **Supported correctness is not independent success.** Work after a hint, an example, or an easier case is recorded as supported; only a fresh independent item counts toward promotion.
- Adjust in this order of priority: wellbeing and explicit preferences, mathematical correctness, and prerequisite readiness. Then choose the smallest relevant change to support, representation, difficulty, or method; these are alternatives, not a mandatory failure ladder. Initial method selection follows the task.
- Grade and speed are never evidence of ability. Interests, fatigue, and the student's own choice adjust the activity, not the stage.
- The next problem is chosen by the purpose recorded for that turn; a level change or method switch needs its own evidence, not just a new topic.
- At the end of a meaningful activity, the difficulty, method, hint level, and independence of the observed evidence go into `strategy_summary` and the next action into `next_step_candidate` per `references/math-segment-fields.md`; add no new fields. Summaries such as `needs_support` / `developing` / `independent` are working labels, never permanent mastery or a probability.

## When Chosen Data Is Missing

With no cross-session history, operate from current-session evidence and offer a copyable state note; do not claim memory. Unknown stage means a low-load exploratory task, not a fabricated stage or grade.
