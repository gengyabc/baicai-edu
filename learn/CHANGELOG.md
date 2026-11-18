# Changelog

All notable changes to `baicai-edu-learn` are recorded here. This package has
not been published before 0.1.0, so that release is the current state rather
than an upgrade path.

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
