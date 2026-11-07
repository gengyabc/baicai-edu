# Task bundle contract

```yaml
task_bundle:
  topic_id: equivalent-fractions
  learning_target: explain why scaling numerator and denominator preserves value
  assumed_prerequisites: [fractions-as-number, multiplicative-thinking]
  grade: 5
  method: concrete-pictorial-abstract
  goal: reasoning
  difficulty: core
  child_view:
    - id: diagnose
      prompt: "Which is larger, 3/4 or 6/8? Explain using the same-sized whole."
    - id: build
      prompt: "Draw two equal bars, split one into 4 pieces and the other into 8. Shade equivalent amounts."
    - id: transfer
      prompt: "Is 4/6 the same as 6/9? How do you know without decimal conversion?"
  adult_key:
    - id: diagnose
      reasoning: "They are equal; 6/8 is obtained by partitioning each quarter into two equal pieces."
      error_probe: "Comparing the size of numerator/denominator independently"
    - id: transfer
      reasoning: "Both simplify to 2/3; multiplying both parts of 4/6 by 1.5 is valid numerically, but 2/3 equivalence is clearer."
  graduated_hints:
    - "What is the whole?"
    - "Can the two bars be the same length?"
    - "What happens if each fourth is cut into two?"
  verification: {arithmetic_checked: true, unique_answer: true, units_checked: true}
```

## Task type by goal

| Goal | Typical tasks | Evidence to elicit |
|---|---|---|
| foundation | worked example → faded example → independent check | correct procedure with explanation |
| school | aligned concept + varied word problem | accuracy, reading, method selection |
| reasoning | conjecture, why, counterexample, multiple representations | explicit general reason |
| enrichment | nonroutine constraints, multiple strategies | flexible method and proof |
| transition | arithmetic → variable/equality → graphical relation | symbolic generalization |
| real_world | estimates, budgets, data decisions | units, assumptions, validation |

For a 20-minute session, default to 3–4 **short** tasks, adjusting to the child's pace. Do not generate a fixed stack of 20 worksheets by default.
