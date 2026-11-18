# Changelog

All notable changes to `baicai-edu-math` are recorded here. This package has not
been published before 0.1.0, so that release is the current state rather than an
upgrade path.

## [0.1.0] - 2026-11-18

First release on npm. Both primary math bands depend on it, so it is installed
with either of them.

### Skills

- `math-common` is shared rules only — Chinese/English delivery, an agreed
  micro-lesson, student-made problems, practice evidence, reading and writing
  the math board, and geometry figures drawn on the teacher demo tab. It is
  never a teaching implementation and never a resolver candidate, so loading it
  cannot change which subject a turn belongs to.

### Packaging

- Depends on `baicai-edu-learn: ^0.1.0` for the single skill provider.
- Ships rendered `resources/` and the `skills/` sources they are generated from.
- `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` and a `publishConfig` that pins the
  public registry with `access: public`.
