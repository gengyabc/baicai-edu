# Skill self-containment (no external citation links)

Installed skills must be readable offline for the model. Do not put citation or provenance URLs into the skill tree; extract the executable rules into the skill text itself.

## Scope

Applies to every file under each education bundle’s `skills/<name>/` tree (`SKILL.md`, `references/`, and any other files there).

Does **not** apply to package `README.md`, maintainer docs under `docs/`, or test fixtures.

## Rules

| Kind | Policy |
| --- | --- |
| Citation / provenance URLs (papers, guides, theory pages) | Forbidden in the skill tree. Rewrite as mechanisms, boundaries, and limits the agent can follow without opening a link. |
| In-repo relative links (`references/…`, sibling skills) | Allowed. |
| Runtime material URLs (trusted source entry points, remote images shown to the student) | Allowed only for skills on the runtime-URL allowlist. Today: `child-news-reader` only. |
| Maintainer verification with live links | Keep under `docs/` (e.g. `docs/learn-support-evidence.md`), never back into the skill. |

## Extraction standard

After editing a skill, an agent should be able to run it without fetching an external page. Names of theories, authors, or years are fine; `http://` / `https://` are not (except allowlisted runtime-material skills).

## Enforcement

`node scripts/check-skills.mjs` rejects `https?://` anywhere under a non-allowlisted skill directory. Expand the allowlist only for runtime working materials, not citations.

Design record: `docs/superpowers/specs/2026-11-10-skill-no-external-links-design.md`.
