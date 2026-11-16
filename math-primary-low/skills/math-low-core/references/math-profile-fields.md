# Math Profile Fields

For the shared subject-profile shell see `learn-data`'s `references/profile-schema.md`. This file defines only the math additions; `self_report`, the `learning_state` arrays, and `error_history` / `session_history` are not repeated here. Initial domain and levels follow `references/math-grade-defaults.md`.

## preferences

| Key | `/learn-start` option label key |
|---|---|
| `likes_visual` | `ui.start.math_pref.likes_visual` |
| `likes_story_context` | `ui.start.math_pref.likes_story_context` |
| `likes_direct_calculation` | `ui.start.math_pref.likes_direct_calculation` |

Unselected keys stay `false`. Resolve label keys through `learn-data`'s `references/ui-locale.md` from `references/locales/` of `math-low-core`. For presentation see `references/math-personalization.md`.

## current_levels

- `overall`
- `arithmetic_strategy_stage`
- `multidigit_strategy_stage`
- `fraction_strategy_stage`

For stage values and how to read old values see `references/progression-map.md`. Do not rewrite without new evidence; when an old profile lacks `multidigit_strategy_stage`, read it as `unknown`.

## Domain for File Analysis

`number_and_operations`, `addition_subtraction_word_problems`, `multiplication_division`, `fractions`, `place_value_and_multidigit`, `measurement_and_geometry`, `patterns_and_data` (same set as Content Domains in `references/progression-map.md`).

For the classification of `error_type` and `diagnosis.label` see `references/strategy-diagnosis-rules.md`.
