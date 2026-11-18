# Dependencies, the subject contract, and adding a method

[English](extending.md) | [中文](extending.zh.md)

This package is a subject package: it supplies English teaching and nothing else. The shared entry, session loop and data protocol come from `baicai-edu-learn`, which is declared as a dependency and pulled in by the install.

## Dependencies

Without `baicai-edu-learn` the shared rules, the session loop and the data protocol are unavailable, so nothing in this package can run on its own. The entry loads `learn-core` and `learn-data` and handles dropped files through `learn-errors`; `english-session` reuses that handoff and loads `english-core`. Student data is read and written through `learn-data`'s JSON protocol.

This package never calls `learn-errors` itself: files are parsed once by the entry, and an image, Markdown or raw-scan request appearing mid-lesson is handed back to it.

## The subject contract

`english-core` carries a `## Subject contract` section that the shared entry reads when it routes to English. It declares `supported_stages: lower_primary, upper_primary` (the expression and flow the package is adapted for, not a content gate — other stages go to general teaching), `subject: english`, teaching entry `english-session`, and package `baicai-edu-english`. The five roles and their owners are listed in [skills and ownership](skills.md), and the role meanings themselves are defined by `learn-data`'s subject contract.

A multi-band subject splits into several packages with different skill names; English keeps one package and one skill name set.

## Adding a method

1. Create `skills/<method-name>/SKILL.md` with `user-invocable: false` and no `disable-model-invocation`, and describe the theory and the practice only — no sibling loading, no own `session_segment`, no profile writes.
2. Register it in the single method table of [english-teaching-core](../skills/english-core/references/english-teaching-core.md), including which `target_context.type` reaches it; the table must stay the only place selection is written.
3. If the method needs a UI label, add the key to `english-core/references/locales/<locale>.json` in every locale.
4. Run `node scripts/build-resources.mjs` so the rendered `resources/` carries the new skill.

Remove a method the same way in reverse: delete the directory, delete its row from the method table, and rebuild.

## Package structure

```
english/
  package.json
  cordis.patch.yml
  README.md
  docs/                     # maintainer reading, repo-only
  skills/
    english-core/SKILL.md + references/ + references/locales/
    english-session/SKILL.md
    <nine method skills>/SKILL.md
  resources/                # generated from skills/
  tests/teaching-scenarios.md
```

`docs/` and `tests/` are not installed; `files` in `package.json` publishes `cordis.patch.yml`, `build.json`, `resources`, `skills`, `README.md` and `LICENSE`. Links from a skill into `docs/` are therefore dead once installed and are rejected by the static check.
