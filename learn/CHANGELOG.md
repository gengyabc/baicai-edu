# Changelog

All notable changes to `baicai-edu-learn` are recorded here. This package has
not been published before 0.1.0, so that release is the current state rather
than an upgrade path.

## [Unreleased]

### Skills

- `/learn-start` offers only subjects whose implementation is actually
  registered. The subject card is built by the model, so the install check is
  an instruction, not code: a row is offered when that subject's core skill
  appears in the session's available skill list, and omitted otherwise instead
  of leading to a guaranteed fallback. Math counts as installed when either
  band's core skill is present. A missing, empty, or incomplete skill list keeps
  every row — unfinished discovery is not evidence that a package is absent —
  and omitting a row hides only the shortcut, because naming the subject
  directly still reaches the resolver's general fallback.
- `/learn-start` now asks the learning language as the first question of the
  flow — before the subject card, which cannot be resolved without a locale —
  and writes it to the shared `language`. It asks unconditionally, because
  `/learn-start` has no default student: `/learn` is the entry that resumes the
  session's student, and a stored `language` records an earlier session's
  choice, not this flow's. The question is locale-invariant
  (`ui.start.language_*`) because it is asked before any locale exists, and
  nothing in the DSH environment reports the active UI locale to a skill, so no
  skill infers the language from the student's wording. The handling rules —
  asked once, a skipped card, an unreadable catalog, the write-back — stay in
  `learn-data`'s `ui-locale.md`, and the entry points at them instead of
  restating them.
- `learn-profile` treats `language` as an editable shared field, while a
  one-turn request to switch language stays task-local.

### Packaging

- The provider publishes each skill's `resources/` directory as its base
  directory, and rendered resources now include `references/locales/*.json`.
  Until now the catalogs never reached an installed skill, so every process
  label fell through to the plain-text fallback.

## [0.1.0] - 2026-11-18

First release on npm. Every other `baicai-edu-*` package depends on this one,
so it is always installed, and it owns the shared material the subject packages
build on.

### Skills

- `learn` routes an entry to a subject or a general task; `learn-start` chooses
  the subject or the learner and creates a profile.
- `learn-core` holds the cross-subject rules (answer confirmation, scaffolding,
  Feynman switches, end signals), and `learn-feynman` runs student-led talk.
- `learn-data` owns the student-data protocol: profiles, session lifecycle,
  retention and the record schema.
- `learn-errors` records error items and other materials, handing images to
  `learn-read-image`; `learn-read-image` transcribes without diagnosing.
- `learn-profile`, `learn-save`, `learn-recommend`, `learn-clean` and
  `learn-support` cover viewing progress, saving a session, recommending what to
  learn next, deleting records, and method support.
- `learn-general-core` and `learn-general-session` carry the general-task path
  used when no subject package applies.

### Provider

- One skill provider, `skill-provider.mjs` plus `lib/skill-resources.mjs`: it
  reads each package's rendered `resources/` and registers the skills as DSH
  content, so a skills-only install and a checkout install resolve the same way.
- Installed standalone, `learn-general-*` needs nothing outside this package.

### Packaging

- `engines.dsh: ">=0.2.2-rc.1 <0.3.0"` so a host that cannot run these skills
  refuses the install instead of failing later.
- `publishConfig` pins the public registry with `access: public`.
