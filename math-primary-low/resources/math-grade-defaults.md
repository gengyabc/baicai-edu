# Math Grade Defaults

Grade-to-band mapping and the specific level within a band follow `learn-data`'s `references/grade-band-defaults.md`. This file is the single source for math `active_domain`, initial levels, and domain scope. Do not copy initial values from the shared schema's examples.

## Initialization

| Grade band | `learning_state.active_domain` |
|---|---|
| `lower_primary` | `addition_subtraction_word_problems` |
| `upper_primary` | `fractions` |

All three `profile.preferences` keys start as `false`; `/learn-start` sets only the selected one to `true`. For the keys see `references/math-profile-fields.md`.

Initial `profile.current_levels`:

```json
{
  "overall": "L1",
  "arithmetic_strategy_stage": "unknown",
  "multidigit_strategy_stage": "unknown",
  "fraction_strategy_stage": "unknown"
}
```

Strategy stages stay `unknown` until the student's problem solving has been seen.

## Domain Scope

Domains are parallel and chosen by the student's explicit goal and problem-solving performance; strategy stage is not a condition for entering a domain. Students can solve multiplication, division, and sharing stories with direct modeling.

Lower primary (grades 1–3, `lower_primary`):

- `addition_subtraction_word_problems`: addition/subtraction contexts, the default starting point
- `multiplication_division`: grouping and sharing contexts; direct modeling is enough to start
- `fractions`: fair-sharing stories, starting from equal partition
- `place_value_and_multidigit`: starting from stories of grouping by tens and larger numbers
- `number_and_operations`: number sense and basic operations

Upper primary (grades 4–6, `upper_primary`):

- `fractions`: equal partition, quotient meaning, comparison, equivalence, operations
- `multiplication_division`: multiplication/division structure and relational reasoning
- `place_value_and_multidigit`: multi-digit operations and place value
- `patterns_and_data`: patterns, data, and early algebraic structure

For stage values see `references/progression-map.md`.
