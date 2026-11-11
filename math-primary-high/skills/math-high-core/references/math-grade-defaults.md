# Upper Primary Math Grade Defaults

Grade-to-band mapping and the specific level within a band follow `learn-data`'s `references/grade-band-defaults.md`. This file is the single source for math `active_domain`, initial levels, and domain scope in grades 4–6. Do not copy initial values from the shared schema's examples.

## Initialization

| Grade band | `learning_state.active_domain` |
|---|---|
| `upper_primary` | `fractions` |

The three `profile.preferences` keys start as `false`; `/learn-start` sets only the selected one to `true`. For the keys see `references/math-profile-fields.md`.

Initial `profile.current_levels`:

```json
{
  "overall": "L1",
  "arithmetic_strategy_stage": "unknown",
  "multidigit_strategy_stage": "unknown",
  "fraction_strategy_stage": "unknown",
  "symbolic_strategy_stage": "unknown"
}
```

Strategy stages stay `unknown` until the student's problem solving has been seen. A correct answer, a fast answer, or a correct value after a hint is not enough to set a stage. `overall` starts at `L1` and moves only on the promotion rules in `references/adaptive-thresholds.md`; the knowledge-point and difficulty adaptation is one-step and reversible.

## Grade 4–6 Profile Notes

- Grade 4 and grade 5–6 differ in usual content density and notation, not in allowed reasoning: a grade-4 student may explain a general rule, and a grade-6 student may still be building a fraction unit meaning.
- The `active_domain` above is a starting point for the first task; after evidence, follow `learning_state.priority_targets`, `developing_topics`, and `session_history[0].next_step` per the lifecycle.
- A profile whose `education_stage` resolves to `lower_primary` is not taught by this package; the unified resolver selects the fitting implementation.

## Domain Scope by Grade

Domains are parallel and chosen by the student's explicit goal and problem-solving performance; strategy stage is not a condition for entering a domain.

Grade 4 (`grade: 4`, `upper_primary`):

- `multiplication_division`: equal groups, factors, multiplicative comparison
- `place_value_and_multidigit`: multi-digit operations, place value, estimation
- `fractions`: unit fractions, equal partition, simple equivalence and comparison
- `measurement_and_geometry`: units, area and perimeter with one relationship
- `patterns_and_data`: patterns, tables, and simple data claims

Grades 5–6 (`grade: 5` or `grade: 6`, `upper_primary`):

- `fractions`: quotient meaning, equivalence, operations, decimals as quantities
- `ratio_rate_percent`: ratio, unit rate, percent of an identified base
- `place_value_and_multidigit`: multi-digit operations and estimation in context
- `patterns_and_data`: patterns, data and averages, evidence-based decisions
- `geometry`: shape properties, area, perimeter, volume and nets
- `proportional_and_graphical_relations`: proportional relationships across tables and graphs
- `beginning_symbolic_relations`: unknowns, equality, expressions as relations

For stage values see `references/progression-map.md`; for the concept prerequisites and misconception probes read `references/topic-map.md`.
