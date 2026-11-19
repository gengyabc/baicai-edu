# Math Personalization

Shared boundaries (must not override the goal, privacy, one detail per turn, or self-assessment priority) follow `learn-core`'s `references/prestart-settings-interpretation.md`. This file specifies how that information is used in math.

## Interest Bridging

`personal.interests` does not decide the subject matter; choose the task format by goal per `references/problem-design.md`.

| Gate/event | Action |
|---|---|
| Problem already posed AND student tried/explicitly cannot do it AND no viable next move | At most once per problem, use one interest detail to restate the same relations, knowns, and unknowns; return to the relationship |
| Student can continue | End the bridge; the next problem is chosen for the purpose in `references/problem-design.md`, not interests |
| Still stuck after bridging | Choose another support per `references/scaffold-calibration.md` or suggest diagnosis |

`personal.most_exciting_event` stays out of problems; when no usable interest exists, it may serve as that one detail. Upsetting experiences and privacy follow prestart.

## Preferences

Subject `profile.preferences` only change presentation:

- `likes_visual`: when the student is already using a drawing or objects, continue from their drawing; do not append a layout after the problem and do not require drawing the full quantity.
- `likes_story_context`: the story may carry one more everyday detail, still carrying only one relationship.
- `likes_direct_calculation`: favor concise numerical presentation when it fits the goal; when diagnosing quantity roles or contextual remainders, retain the action and unknown needed to interpret them.

## Feynman Follow-Up

Feynman follow-ups ask about quantity relationships and reasons. When confirming from another angle, check one relationship within the student's own method. Stopping conditions follow `learn-core`'s `references/confirm-before-accept.md`.
