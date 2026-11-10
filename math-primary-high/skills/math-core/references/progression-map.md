# Progression Map

The existing CGI-derived arithmetic and sharing strategy fields and the symbolic field are stored in `profile.current_levels`. They preserve record compatibility, not a single curriculum ladder or a required teaching method. Geometry, data, procedure, and proof evidence may be recorded by topic without changing these stages. A stage describes the strategy used on a given problem type and number size; it chooses numbers and the next problem and never gates content. Every field starts as `unknown` and changes only with strategy evidence.

| Field | Values, in typical CGI order (a tendency, not a strict ladder) |
|---|---|
| `arithmetic_strategy_stage` (single-digit +, −, ×, ÷) | `direct_modeling`, `counting_strategy`, `derived_facts` (includes recalled facts) |
| `multidigit_strategy_stage` (separate track) | `counting_by_ones`, `modeling_tens_ones`, `invented_strategies` |
| `fraction_strategy_stage` (Empson & Levi equal sharing) | `equal_sharing_no_coordination`, `equal_sharing_nonanticipatory`, `equal_sharing_additive`, `equal_sharing_multiplicative` |
| `symbolic_strategy_stage` (deepens across grades 4–6) | `arithmetic_only`, `relational_unknown`, `generalized_structure` |

`derived_facts` is a local aggregate of CGI's number-fact strategies; `strategy_summary` still says whether the student derived the fact from a known one or recalled it, and a fast recall is not evidence of deriving a relation. Relational thinking and standard algorithms are recorded in `strategy_summary`, not as stages; an algorithm counts only when the student ties its steps to tens and ones. Fraction comparison, equivalence and operations can be explored at any sharing stage; they are not a further value.

`symbolic_strategy_stage` describes how a student treats unknowns, equality, formulas, and relations: working only by concrete numbers, solving for one unknown by substitution or by an equation, or generalizing structure (for example, stating why a rule must hold or linking two representations such as a table, a graph, and an expression). A correct value produced by trial and error is not `generalized_structure`; an invented symbol or a guess-check table may still show `arithmetic_only`.

Older stored arithmetic values: read `flexible_relational` and `structure_extension` as `derived_facts` for compatibility, not as new evidence of fact derivation. Preserve any existing `multidigit_strategy_stage`; only a missing field is read as `unknown`. A profile without `symbolic_strategy_stage` is read as `unknown`; do not backfill it from the arithmetic stage. These mappings never change the other fields. Write only current values.

## Content Domains

`number_and_operations`, `addition_subtraction_word_problems`, `multiplication_division`, `fractions`, `place_value_and_multidigit`, `measurement_and_geometry`, `patterns_and_data`, `ratio_rate_percent`, `geometry`, `proportional_and_graphical_relations`, `beginning_symbolic_relations`.

The last four are grades-5–6 domains: `ratio_rate_percent` (ratio, unit rate, percent in contexts), `geometry` (perimeter, area, volume, nets), `proportional_and_graphical_relations` (proportional relationships across tables and graphs), and `beginning_symbolic_relations` (unknowns, equality, expressions as relations). Grade 4 uses `measurement_and_geometry`; grades 5–6 use `geometry`.

Math domains by grade: `references/math-grade-defaults.md`.
