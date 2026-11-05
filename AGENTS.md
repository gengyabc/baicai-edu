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
- Student system state is written under `outputs/students/`; user-provided originals live under `data/students/<id>/<subject>/raw/`. Both `outputs/` and `data/` trees are gitignored. Do not commit them or expose raw student JSON to the student.
- Per-turn session state goes to `session_log.json`; `profile.json` / `memory.json` / `milestones.json` are written only at finalize. `current_state.last_finalized_session_id` is the idempotency marker.
- `personal.interests` in the shared `profile.json` is the cross-subject personalization field; Chinese and math skills must read it. Subject preferences and easy/hard topics live in the subject profile.
- Process branches (subject, student identity, grade, preference, continue/end, feynman or transfer) present choices with `ask_user_question` so the Web card is clickable; teaching prompts that ask the student to think stay as plain text, never as options.
- `node scripts/check-skills.mjs` is the static check for frontmatter, invocation policy, stale fields, and dangling references.
- `data/.../raw/` is read-only; back up to `outputs/.../backups/raw/` before renaming with `mv`.
- The migration mapping from Pi is in `docs/migration/pi-to-dsh-skills.md`.
- Skill call graph, package deps, and usage-scenario Mermaid diagrams: `docs/skills/call-graph.md`.
