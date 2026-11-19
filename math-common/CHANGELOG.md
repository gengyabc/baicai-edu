# Changelog

All notable changes to `baicai-edu-math` are recorded here. This package has not
been published before 0.1.0, so that release is the current state rather than an
upgrade path.

## [0.1.4] - 2026-11-19

### Packaging

- Rendered `resources/` now carry `user-invocable` from each skill's source
  frontmatter. The renderer copied only `name` and `description`, and the
  installed provider registers a skill from its rendered file, so the 0.1.3
  tarball registered every rule skill here as user-invocable and listed it in the
  learner's command menu. Version floors on `baicai-edu-learn` (and
  `baicai-edu-math`) move to `^0.1.4`, which already carries the same fix.

## [0.1.3] - 2026-11-19

### Skills

- The language contract now says where the shared-profile `language` comes
  from: the explicit choice `/learn-start` asks for, never an inference from a
  message, a subject, or a filename. Delivery, task-local switches, and the
  `zh-CN` fallback are unchanged.

### Packaging

- `math-common` declares `resource-loading: on-demand`: the registered prompt is
  the contract table itself (43 KB to 3.5 KB), and a band reads only the
  contract its branch names from the installed base directory.
- This bundle registers only its own skills when enabled. Missing other
  subjects no longer prevent it from loading, and a disabled bundle does not
  register its skills just because its package is present on disk.

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
