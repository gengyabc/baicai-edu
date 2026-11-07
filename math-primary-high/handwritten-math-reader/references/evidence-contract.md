# Faithful transcription and evidence handoff

Use compact YAML or JSON. `read_status` describes readability, **not** how correct the mathematics is. `verified` is only true for a step after ambiguous symbols are resolved and the mathematics independently checked.

```yaml
handwritten_math:
  problem_id: photo-1-problem-1
  image_scope: one_problem
  question:
    text: "Compute 1/2 + 1/3"
    origin: printed_or_supplied
  transcript:
    - line_id: L1
      text_as_written: "1/2 + 1/3 = (1+1)/(2+3)"
      latex_as_written: "\\frac12+\\frac13=\\frac{1+1}{2+3}"
      read_status: clear
      ambiguities: []
      crossed_out: false
    - line_id: L2
      text_as_written: "= 2/5"
      latex_as_written: "=\\frac25"
      read_status: clear
      ambiguities: []
      crossed_out: false
  interpretation:
    checked: true
    first_verified_issue:
      at: L1
      observation: "The denominator was added along with the numerator."
      mathematical_check: "1/2 + 1/3 = 5/6, not 2/5"
    misconception_hypothesis: "May be adding numerators and denominators componentwise"
    confirmation_needed: "Ask why the denominators were added"
  tutoring_handoff:
    topic_id: fraction-operations
    evidence: "Student wrote a componentwise fraction addition procedure"
    independence: unknown
    next_action: "Ask the child what one-third and one-half mean as units"
    may_update_progress: true
```

This is synthetic example data. Do not present it as an actual child's work.

## Uncertain transcription example

If a line might read `7 × 3 = 21` or `1 × 3 = 21`, output:

```yaml
line_id: L2
text_as_written: "[7|1] × 3 = 21"
read_status: ambiguous
ambiguities:
  - region: "L2 first handwritten digit"
    alternatives: ["7", "1"]
    affects_math_judgment: true
interpretation:
  checked: false
  first_verified_issue: null
  reason: "The digit must be confirmed before checking the step"
tutoring_handoff:
  may_update_progress: false
  next_action: "Ask for a close-up or confirmation of the first digit"
```

## Minimal reporting sequence

1. **我识别到的步骤**: one line per visible line; preserve wrong equations and crossed-out attempts.
2. **需要确认的地方**: exact line/region and alternatives, or `无`.
3. **数学检查**: only on adequately confirmed lines; earliest verified issue and a reason.
4. **给孩子的下一句话**: one non-judgmental question or appropriately sized hint.

If `mode=transcription_only`, return (1) and (2) only. In `mode=tutor`, do not automatically display an adult answer key. If a diagram is unclear, describe visible strokes/labels and ask rather than inventing a geometric relation.
