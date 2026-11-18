# Dependencies, the subject contract, and adding a rule

[English](extending.md) | [中文](extending.zh.md)

This package is a subject package: it supplies Chinese teaching and nothing else. The entry, the session loop and the data protocol come from `baicai-edu-learn`, declared as a dependency and pulled in by the install.

## Dependencies

Without `baicai-edu-learn` the shared rules, session loop and data protocol are unavailable, so nothing here runs on its own. The entry loads `learn-core` and `learn-data` and handles dropped files through `learn-errors`; `chinese-session` reuses that handoff and loads `chinese-core`. Student data is read and written through `learn-data`'s JSON protocol.

This package never calls `learn-errors` itself: files are parsed once by the entry, and a later request for a picture or a raw scan is handed back to it.

`cordis.patch.yml` holds a single row: it activates the one skill provider shipped by `baicai-edu-learn` (entry `edu-skills`), which registers every skill from the installed packages' `resources/`. There is no plugin runtime and no tool of this package — all behavior is `SKILL.md` text plus file reads and writes.

## The subject contract

`chinese-core` carries a `## Subject contract` section that the shared entry reads when it routes to Chinese. It declares `supported_stages: lower_primary, upper_primary` (the expression and flow this package is adapted for, not a content gate — other stages go to general teaching), `subject: chinese`, teaching entry `chinese-session`, and package `baicai-edu-chinese-reading`. The five roles and their owners are listed in [skills and ownership](skills.md); the role meanings themselves belong to `learn-data`'s subject contract.

Chinese keeps one package and one skill-name set; math splits by grade band instead. The comparison and the shared rules live in [subject packages](<../../learn/docs/subject-packages.md>).

## Adding a rule or a domain

1. Put the new rule in exactly one file under `skills/chinese-core/references/`, or extend an existing owner listed in [skills and ownership](skills.md). Do not copy a rule that already exists beside its owner.
2. Register where it is read: a conditionally read rule gets a row in `chinese-core`'s read table; a per-turn branch gets a row in the owning teaching skill; a new target type gets a row in [chinese-target](../skills/chinese-core/references/chinese-target.md) and, if it needs its own dispatch, in `chinese-session`'s route table.
3. Keep the boundary: a sub-skill names its reads `skill` plus a path inside that skill, never a cross-package path, and never writes student data itself.
4. Run `node scripts/build-resources.mjs` so the rendered `resources/` carries the change.

Remove a rule the same way in reverse: delete the text, delete the row that read it, rebuild.

## Package structure

```
chinese-reading/
  package.json
  cordis.patch.yml
  README.md
  docs/                     # maintainer reading, repo-only
  skills/
    chinese-core/SKILL.md + references/
    chinese-session/SKILL.md
    chinese-reading-session/SKILL.md
    chinese-writing-session/SKILL.md
    chinese-read-write-transfer/SKILL.md
    chinese-generate-tasks/SKILL.md
  resources/                # generated from skills/
```

`docs/` is not installed; `files` in `package.json` publishes `cordis.patch.yml`, `build.json`, `resources`, `skills`, `README.md` and `LICENSE`. A link from a skill into `docs/` is dead once installed and is rejected by the static check.
