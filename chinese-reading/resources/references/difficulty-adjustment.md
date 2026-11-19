---
cited: learn-core/references/difficulty-adjustment.md
---

# Difficulty Adjustment

When a student asks to lower or raise difficulty, this turn adjusts the presentation along one load factor and records the direction and target in the log; after finalize it is written to subject memory for later materials to reuse. Difficulty is a presentation preference, not a level, and does not change `current_levels`.

## When to record

- The student explicitly says the material, question, or text is "too hard / make it easier / lower the difficulty" or "too easy / make it harder / raise the difficulty": record.
- The student is stuck at a step, didn't understand, or can't answer: first handle it per `references/guidance-non-response-handling.md` and the subject scaffolding; record a difficulty request only if they also express a standing preference such as "keep it like this from now on".
- Unclear whether it is about this piece or going forward: adjust for this piece and record the direction, with `note` stating the target; do not press for clarification, and do not treat a single request as a level conclusion.

## How to adjust this turn

Change only one load factor, keeping the task goal and the full meaning of the material. A factor can be sentence length and new-word count, complexity of numbers or steps, concreteness of representation, amount of hints, text length, or number of question layers; move only one per turn and keep the rest.

- When the material has already been presented, do not rewrite it in full; apply the new direction from the next question or the next piece.
- Do not announce "Your current level is...", give a grade, or record the adjustment as mastery or regression.

## Where to record

`context.difficulty_request` in `session_log.json`:

```json
{
  "direction": "easier",
  "note": "News from the image had long sentences and many new words",
  "requested_at": "2026-11-07T20:19:00+08:00"
}
```

- `direction`: `easier` / `harder` / `standard`. If the student says "normal difficulty / no need to adjust," record `standard`.
- A later request in the same session overrides the earlier one; `note` only summarizes the student's own words and the target, with no diagnostic labels.
- When there is no request, do not write this field; the entry writes the log uniformly.

## How to use afterwards

- Before generating new material, questions, or text, a subject reads `memory.profile_memory.material_difficulty` and adjusts one load factor according to `direction`.
- When `note` names a target, prefer carrying it over on similar material; when the target is unclear, treat it as general material.
- The direction carries over until the student explicitly asks again; if the student says nothing more, do not automatically revert to `standard` just because one performance went well.
- It applies only when generating new material; text already in progress stays intact and is not rewritten midway.

## Saving

- Teaching turns only write the log; finalize's memory patch merges `context.difficulty_request` into `profile_memory.material_difficulty`, using `requested_at` for `updated_at`.
- A session that does not go through finalize does not write subject memory, and must not claim it was saved.
