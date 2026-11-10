# Upper Primary Math Profile Fields

For the shared subject-profile shell see `learn-data`'s `references/profile-schema.md`. This file defines only the upper-primary math additions; `self_report`, the `learning_state` arrays, and `error_history` / `session_history` are not repeated here. Initial domain and levels follow `references/math-grade-defaults.md`.

## preferences

| Key | `/learn-start` option label key |
|---|---|
| `likes_step_by_step` | `ui.start.math_pref.step_by_step` |
| `likes_examples` | `ui.start.math_pref.worked_example` |
| `likes_real_world` | `ui.start.math_pref.real_world` |

The lower-primary `likes_visual`, `likes_story_context`, and `likes_direct_calculation` keys belong to the other package; a profile brought to this package keeps its own keys and keys it does not own are not rewritten. Unselected keys stay `false`. Resolve label keys through `learn-data`'s `references/ui-locale.md` from `references/locales/` of `math-core`. For presentation see `references/math-personalization.md`.

## current_levels

- `overall`
- `arithmetic_strategy_stage`
- `multidigit_strategy_stage`
- `fraction_strategy_stage`
- `symbolic_strategy_stage`

For stage values and how to read old values see `references/progression-map.md`. Do not rewrite without current evidence; when an old profile lacks `multidigit_strategy_stage` or `symbolic_strategy_stage`, read the missing field as `unknown` and leave the others untouched.

## Domain for File Analysis

`fractions`, `place_value_and_multidigit`, `multiplication_division`, `addition_subtraction_word_problems`, `measurement_and_geometry`, `patterns_and_data`, `ratio_rate_percent`, `geometry`, `beginning_symbolic_relations`, `proportional_and_graphical_relations`.

For the classification of `error_type` and `diagnosis.label` see `references/strategy-diagnosis-rules.md`. When finalize writes a `confirmed_skills` object, its `domain` is the narrowest domain from this same list that fits the actual confirmed skill; never invent a broader category.

## Preference Options for `/learn-start`

Offer the three preferences with `ask_user_question`, each skippable, and set only the selected one to `true`:

1. `ui.start.math_pref.step_by_step`: wants to see a multi-step plan laid out as separate steps.
2. `ui.start.math_pref.worked_example`: wants an example first when a concept is opaque.
3. `ui.start.math_pref.real_world`: prefers working from real situations.

The label literals live in `references/locales/` of `math-core` and are not hard-coded here.
