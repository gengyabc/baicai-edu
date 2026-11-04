## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles keep their default label strings, recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` at the repo root plus ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Education skill packages

- `learn/`, `math-low/`, and `chinese-reading/` are DSH skill bundles installed with `dsh plugin --profile web add link:<absolute-dir>`.
- Session-boundary entries (`start`, `learn`) set `disable-model-invocation: true`; their only entry is the user's `/name`.
- In-conversation entries (`feynman`, `profile`, `save`) stay model-invocable so the model can load them from a student's intent, while remaining user-invocable via `/name`.
- Internal skills loaded by another skill must stay model-invocable: use `user-invocable: false`, never `disable-model-invocation: true`, because DSH has no separate skill-to-skill channel.
- Skills are addressed by name; shared rules live in `learn/skills/learn-core`, the student-data protocol in `learn/skills/learn-data`, and error-file handling in `learn/skills/learn-errors`.
- Student data is written under `outputs/students/`; the whole `outputs/` tree is gitignored. Do not commit it or expose raw student JSON to the student.
- `raw/` under a student's subject directory is read-only; only rename via `mv`.
- The migration mapping from Pi is in `docs/migration/pi-to-dsh-skills.md`.
