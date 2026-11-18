# Changelog

All notable changes to `baicai-edu-chinese-reading` are recorded here. This
package has not been published before 0.1.0, so that release is the current
state rather than an upgrade path.

## [0.1.0] - 2026-11-18

First release on npm. Depends on `baicai-edu-learn` for the single skill
provider, which arrives with it.

### Skills

- `chinese-session` routes the subject — reading, writing, or a switch between
  them — and resumes an unfinished focus.
- `chinese-reading-session` teaches reading: studying a passage, evaluating
  answers already written, and explaining evidence in Feynman mode.
- `chinese-writing-session` teaches writing: a prompt with no draft, revising a
  draft, and explaining a writing choice in Feynman mode.
- `chinese-read-write-transfer` reuses a text's writing moves on a new topic.
- `chinese-generate-tasks` generates reading questions, writing prompts and
  focused item practice, with role-appropriate scoring criteria.
- `chinese-core` holds the shared rules — reading, writing, read-write transfer,
  task generation, feedback and long-term training — and the internal action
  table that bridges a missing life experience when a passage stalls.

### Packaging

- `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` and a `publishConfig` that pins the
  public registry with `access: public`.
