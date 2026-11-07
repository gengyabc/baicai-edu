# Portable student progress state v1

Use YAML or JSON with the same field meanings. This is a compact artifact suitable for manual copy-paste between DSH/Codex sessions.

```yaml
schema_version: 1
learner_alias: null
grade: 5
primary_goal: reasoning
last_session: "2026-11-06"  # only use actual supplied/current date
topics:
  equivalent-fractions:
    evidence:
      - task: "compare 3/4 and 6/8"
        observed: "correct after seeing a bar diagram"
        support: representation_hint
        axes: [concept, representation]
        source: child_response
      - task: "compare 4/6 and 6/9"
        observed: "explained both as 2/3 without help"
        support: none
        axes: [concept, transfer]
        source: child_response
    statuses:
      calculation: not_observed
      concept: emerging
      reasoning: not_observed
      representation: needs_support
      transfer: emerging
    misconception_hypotheses: []
    uncertainty: "One independent transfer attempt; durability untested"
    next_step: "Explain equivalence with a new number line example"
    review_suggestion: "After 3 days, then adapt to new evidence"
```

The example is synthetic; never present it as a child's actual record.

## Updating rules

- Append new evidence to the matching topic; do not erase conflicting observations. Summarize older evidence if state grows too large, preserving dates and strongest counterevidence.
- For a status change, quote the response or adult-reported observation that justifies it.
- `not_observed` means no basis for a judgment; `needs_support` means an attempted relevant task required assistance; `emerging` means mixed or limited successful evidence; `independent` means correct in a fresh, varied task without hints.
- Parents may ask to omit raw answers and retain only topic-level summaries. Never require storage of child identity.
- Do not infer long-term memory from successful current-session performance. Revisit on another day.
