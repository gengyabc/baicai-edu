# Changelog

All notable changes to `baicai-edu-learn` are recorded here. This package has
not been published before 0.1.0, so that release is the current state rather
than an upgrade path.

## [0.1.4] - 2026-11-19

### Packaging

- Rendered `resources/` now carry `user-invocable` and
  `disable-model-invocation` from each skill's source frontmatter. The renderer
  copied only `name` and `description`, and the installed provider registers a
  skill from its rendered file, so the 0.1.3 tarball registered every skill with
  DSH's defaults: all internal rules were user-invocable, and `learn-start`,
  `learn`, and `learn-clean` were model-loadable. The boundary declared in
  `skills/` now reaches the installed copy, and a contract test compares the two
  headers so a later render change cannot drop it again.

## [0.1.3] - 2026-11-19

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
- `learn-support`'s conversational guidance is condensed by about 45% while
  keeping the listening, correcting, inviting, declining, and exiting rules it
  owns.

### Packaging

- Cited prose now ships at `resources/references/<name>.md`, the path a skill
  body already cites, so reading `references/session-lifecycle.md` from the
  registered base directory resolves literally. Previously the files sat flat
  beside it and every rendered body carried a sentence explaining the mapping —
  a sentence easy to skim past, and skipping it sends the reader to a path that
  does not exist. The rendering note is gone and the provider looks up listed
  resources under `references/`. Skill files stay at `resources/<name>.md`;
  `readPackage` reads only that level, so reference files no longer depend on
  being skipped for having no `name`/`description` frontmatter.
- A skill may declare `resource-loading: on-demand` in its frontmatter; the
  provider then registers its body alone, and every reference stays installed
  beside the base directory for the branch that names it. `learn`,
  `learn-core`, `learn-data`, `learn-support`, `learn-feynman`, `learn-save`,
  and `learn-start` use it, taking their initial prompts from 60/92/158/99/55/52/41 KB
  to 3.2/9.6/12.1/6.6/2.2/3.9/11.5 KB.
- The provider publishes each skill's `resources/` directory as its base
  directory, and rendered resources now include `references/locales/*.json`.
  Until now the catalogs never reached an installed skill, so every process
  label fell through to the plain-text fallback.
- A skill's reference directory is now found with `dirname` instead of a search
  for `/` in the path. On Windows every path built by `join` uses `\`, so that
  search found no separator, resolved each resource against a mangled directory,
  and registered every skill body without the reference sections it inlines —
  silently, because a missing resource is skipped by design. Resource lookup is
  guarded as platform-neutral in `scripts/skill-resources.test.mjs`.
- Each enabled bundle gets its own activation row while sharing the provider
  implementation. The shared entry no longer loads skills from disabled
  bundles merely because they are still installed.

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
