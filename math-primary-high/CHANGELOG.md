# Changelog

All notable changes to `baicai-edu-math-primary-high` are recorded here. This
package has not been published before 0.1.0, so that release is the current
state rather than an upgrade path.

## [0.1.0] - 2026-11-18

First release on npm. Installing this package by name brings
`baicai-edu-learn` and `baicai-edu-math` with it; the math board is optional and
installed separately.

### Skills

- `math-high-session` is the teaching mainline for grades 4-6, in learn and
  Feynman modes: task-selected methods with representations left optional.
- `math-high-diagnose` triages a strategy the student cannot yet name, reads
  error items, and separates a pattern from a single slip.
- `math-high-practice` levels practice by error pattern, contrasts causes,
  stabilizes independent calculation, and works a multi-part exercise
  sub-question by sub-question.
- `math-high-student-problem` has the student invent problems that test a
  method they just learned, then judges the invented problem.
- `math-high-application-modeling` solves a real situation — budget, journey,
  recipe, survey, packaging — by deciding assumptions, choosing a
  representation, calculating, and validating the result.
- `math-high-core` holds the shared rules, the method menu and the field
  conventions for math learning records.

### Packaging

- Depends on `baicai-edu-learn: ^0.1.0` and `baicai-edu-math: ^0.1.0`.
- `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` and a `publishConfig` that pins the
  public registry with `access: public`.
