# General Teaching Contract Roles

## Target Classification

Keep the original topic, files, and intent per `references/target-parsing.md` in `learn-data`. An explicit topic uses `type: topic`; material reading, practice, projects, and feedback on works are all determined by task intent, and the original text is not guessed. If material is present and unprocessed, go through the file handoff first; without material, first ask for the information the current small step needs. A pure support need goes to the lifecycle, and no question is forced.

## Grade Defaults

Available for all stages and unknown stages. `active_domain: ""`, `current_levels: {}`, with the student's goals and materials taking priority; with no goal, ask one question about what they want to solve, and do not force a test. A primary-school grade never becomes the initialization template for adults.

## Profile Fields

`preferences: {}`; general support preferences use the goals and preferences the student explicitly set in shared learning_preferences. easy_topics/hard_topics serve only as self-reported reference, and no fixed learning-style labels are created.

## Diagnosis Rules

No specialist `label` / `error_type` / `domain` is defined; unknown stays empty, and no subject diagnosis is fabricated; record the actual problem, what the student did, and verifiable evidence. File analysis keeps recognizable content and references, and does not pass off material reading as a student error.

## Learning Recommendation

Offer 2–3 distinct small goals that can start immediately, with a single preferred one, and a reason/basis in the active UI locale (see `references/ui-locale.md` in `learn-data`); if there are not enough, give only one. Goals/materials take priority; general history uses only general_progress of the same scope_id, and capability is not extrapolated from specialist levels. Pick a feasible starting point in light of the value, support needs, and time cost the student has stated; with no performance, mark it exploratory, and do not test first for the sake of a recommendation.

When the student explicitly wants to explore other areas, cross-domain directions may be offered; a candidate explicitly keeps the target subject or a neutral task description, and after selection the lifecycle saves the old topic and switches; the recommendation itself grants no authorization. With no explicit area, first ask one question about an interest or use, and do not mix all history. Presentation, waiting, rejection, and resume are handled only by `learn-recommend`.
