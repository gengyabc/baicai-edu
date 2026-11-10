---
name: handwritten-math-reader
description: Handwritten math reading. Use when the student submits handwritten grades 4–6 math photos, scans, or digital ink (fractions, vertical algorithms, equations, figures, multi-line steps); preserve errors faithfully, mark unclear parts, and do not silently correct.
---
# Handwritten Math Reader

Use when a child, parent or tutor uploads a photograph, scan or digital ink of handwritten mathematics. This skill is an **input interpretation layer**, not a grading service or teaching method. Use the host's available image-capable model; do not assume every harness supports image attachments. If images cannot be accessed, explain the limitation and ask for typed steps or an accessible image-capable route. No separate OCR model or API is required.

## Runtime variables

```yaml
input:
  image_available: auto
  grade: null             # 4|5|6|other|unknown; not mandatory for transcription
  topic: null
  original_question: null
  page_scope: one_problem  # one_problem|selected_region|whole_page
  language: zh
options:
  mode: tutor             # transcription_only|tutor|parent_review
  confirm_uncertain: true
  allow_cropping: available_only
  show_latex: true
  preserve_layout: true
  answer_visibility: after_attempt
  store_image: false
```

Use supplied values. Ask for the original printed question only when context is needed to interpret the work or judge correctness; don't insist on grade, textbook or identity for straightforward transcription. If a page contains several problems, segment explicitly and ask which to analyze when selection changes the next action.

## Two-phase procedure: never mix transcription with correction

### Phase A: faithful reading

1. Examine the whole page for question boundaries, annotations, reading order, arrows, crossed-out work, drawings and whether a line is part of a calculation or an abandoned attempt. Then examine individual lines/regions. Do not invent earlier or omitted steps.
2. Transcribe exactly what is visible: digits, signs, decimal points, parentheses, fraction bar extent, exponents, roots, equal/inequality signs, units, vertical alignment, carries/borrows and diagram labels. Use LaTeX only as a readable **rendering**, not as a corrected mathematical equivalent.
3. Keep the original order, each visible line and any deletions/corrections. Separate printed question, student ink and adult/teacher marks. Do not silently normalize an invalid equation to a valid one.
4. Mark uncertain tokens with their image location and plausible alternatives, e.g. `line 2, last digit: 1 or 7`; use `unreadable` when necessary. **Never assign made-up numerical confidence scores.** A visually clear token may still be wrong: do not equate plausible algebra with legibility.
5. If uncertainty affects a mathematical judgment, ask the child/parent to confirm that region or provide a clearer close-up; withhold the affected judgment. Continue with unambiguous steps when useful.

### Phase B: mathematical analysis only after reading

6. State what was *read* separately from what is *mathematically inferred*. Compare adjacent steps with valid operations; verify arithmetic and units independently. Locate the earliest **verified** discrepancy, while noting valid alternative methods. Do not call an unverified OCR guess a student's error.
7. A static image documents written steps, not timing, intention, erased thought, or the child's mental process. Describe a misconception as a **hypothesis**; seek a short explanation or contrasting probe before treating it as established.
8. In tutor mode, report the first relevant issue with a gentle question or graduated hint; do not reveal the full solution by default. If the child asks for explanation or remains stuck, explain clearly and follow with a new transfer item. Parent-review mode may include a clearly separated key.
9. Hand off compact evidence to `upper-primary-math-coach`, `upper-primary-math-knowledge-map` and `math-learning-progress-tracker`. Only **confirmed** transcriptions and observed attempts may update progress; keep ambiguous fields explicitly unknown. Read [references/evidence-contract.md](references/evidence-contract.md) for the handoff schema and concrete examples.

## Specific risks to check

- Fractions: numerator/denominator boundaries, nested fractions, missing operation signs, slash vs division.
- Column arithmetic: digit place alignment, decimal position, carried/borrowed digits, intermediate products, remainder.
- Algebra: `-` vs `=`, parentheses and sign distribution, superscript vs ordinary digit, equation transformation direction.
- Geometry: labels/marks vs inferred dimensions, solid vs dashed auxiliary lines, angle arcs, units, sketch not to scale.
- Multi-line work: line order, crossed-out attempts, arrows and side calculations; do not merge separate lines into an idealized solution.

## Safety, quality and privacy

- If an image is blurry, cropped or rotated, request a clearer photo rather than hallucinating. Prefer one full image for context plus a close-up of the ambiguous part. Cropping or enlargement must preserve enough surrounding structure to identify the region.
- Never promise perfect recognition or automatic grading accuracy. This is low-stakes tutoring support; high-stakes grading requires human verification.
- Don't request or retain identity, school, address or unrelated page information. Do not save images unless the parent explicitly asks and the host supports it.
- Do not accuse a child of carelessness or infer stable ability from one page. Avoid overwriting their writing with a correct derivation before the original has been faithfully captured.

## Research anchors

- [FERMAT: Can Vision-Language Models Evaluate Handwritten Math? (ACL 2025)](https://aclanthology.org/2025.acl-long.720/)
- [Seeing Symbols, Missing Structure (ICML 2026)](https://proceedings.mlr.press/v306/jiang26bg.html)
- [When VLMs “Fix” Students: Over-Correction in Multi-line Handwritten Math OCR (EMNLP 2026)](https://aclanthology.org/2026.emnlp-main.476/)
- [Google MathWriting dataset](https://github.com/google-research/google-research/tree/master/mathwriting)
