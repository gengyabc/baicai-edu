# Progression Map

Stage values follow CGI and are what gets stored in `profile.current_levels`. A stage describes the strategy used on a given problem type and number size; it chooses numbers and the next problem and never gates content. Every field starts as `unknown` and changes only with strategy evidence.

| Field | Values, in typical CGI order (a tendency, not a strict ladder) |
|---|---|
| `arithmetic_strategy_stage` (single-digit +, −, ×, ÷) | `direct_modeling`, `counting_strategy`, `derived_facts` (includes recalled facts) |
| `multidigit_strategy_stage` (separate track) | `counting_by_ones`, `modeling_tens_ones`, `invented_strategies` |
| `fraction_strategy_stage` (Empson & Levi equal sharing) | `equal_sharing_no_coordination`, `equal_sharing_nonanticipatory`, `equal_sharing_additive`, `equal_sharing_multiplicative` |

`derived_facts` is a local aggregate of CGI's number-fact strategies; `strategy_summary` still says whether the student derived the fact from a known one or recalled it, and a fast recall is not evidence of deriving a relation. Relational thinking and standard algorithms are recorded in `strategy_summary`, not as stages; an algorithm counts only when the student ties its steps to tens and ones. Fraction comparison, equivalence and operations can be explored at any sharing stage; they are not a further value.

Older stored arithmetic values: read `flexible_relational` and `structure_extension` as `derived_facts` for compatibility, not as new evidence of fact derivation. Preserve any existing `multidigit_strategy_stage`; only a missing field is read as `unknown`. This arithmetic mapping never changes the multidigit field. Write only current values.

## Content Domains

`number_and_operations`, `addition_subtraction_word_problems`, `multiplication_division`, `fractions`, `place_value_and_multidigit`, `measurement_and_geometry`, `patterns_and_data`.

Grade band: `learn-data` 的 `references/grade-band-defaults.md`. Math domains by grade: `references/math-grade-defaults.md`.
