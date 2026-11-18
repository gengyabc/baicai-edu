# Changelog

All notable changes to `baicai-edu-english` are recorded here. This package has
not been published before 0.1.0, so that release is the current state rather
than an upgrade path.

## [Unreleased]

### Packaging

- Locale catalogs now ship as `resources/references/locales/<locale>.json` at the
  path the skill prose cites, so an installed skill can read them instead of
  falling back to plain text for every process label.

## [0.1.0] - 2026-11-18

First release on npm. Depends on `baicai-edu-learn` for the single skill
provider, which arrives with it.

### Skills

- `english-session` is the teaching mainline: story, conversation, task,
  vocabulary review and news reading, in learn and Feynman modes.
- `english-core` holds the shared rules for English teaching, story and
  conversation activities, review and record generation.
- `child-english-coach` orchestrates one activity that combines story, talk,
  tasks and review when the student wants free play.
- `comprehensible-input` carries a little new language in familiar context;
  `interaction-hypothesis` negotiates meaning when spoken language is unclear;
  `output-hypothesis` keeps the student's meaning while pushing output;
  `scaffolding-zpd` grades hints and then fades them.
- `usage-based-language-learning` builds a pattern from varied examples;
  `spaced-retrieval` recalls old items without looking; `task-based-language-
  learning` uses English for a concrete outcome.
- `child-news-reader` reads a news item at the student's level, verified against
  its source and filtered for age.

### Packaging

- `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` and a `publishConfig` that pins the
  public registry with `access: public`.
