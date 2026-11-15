---
cited: learn-data/references/ui-locale.md
---

# UI Locale Resolution

Process-branch student copy (`ask_user_question` labels, stage menus, confirmations, recommendation chrome) is **not** hard-coded in skill prose. Skills name stable keys; packages supply locale catalogs.

## Locale source

1. Read `language` from the shared base profile (`outputs/students/<id>/profile.json`).
2. Normalize aliases: `zh` → `zh-CN`, `en` → `en`. Unknown or missing → `zh-CN`.
3. Load catalogs in order until the key resolves; the resolved `teaching.core_skill`'s base directory and `learn-data`'s base directory give the roots:
   - `references/locales/<locale>.json` of the current subject core skill (if a subject owns the string)
   - `references/locales/<locale>.json` of `learn-data`
   - the same two paths for fallback locale `zh-CN`
4. Never invent a missing key at runtime; if a key is absent after fallback, keep the key name visible only in agent logs and ask a short generic plain-text question with custom input — do not silently switch languages mid-card.

## Catalog shape

Flat JSON object. Keys use dotted namespaces:

- `ui.*` — student-visible process labels and short prompts
- `confirm.phrase.*` — exact-match typed confirmations (locale-specific; trim ends, require full match)
- `example.*` — optional sample strings for docs/tests (not shown unless a skill cites them)

Subject packages may define only the keys they own (for example stage option labels). Shared process chrome stays in `learn-data`'s catalog.

## Writing rules for skills

- Agent instructions, headings, and tables: English.
- When presenting a process choice, write the **key** (for example `ui.stage.switch_content`), not a language-specific literal.
- Teaching prompts that ask the student to think stay plain text in the **teaching delivery language** declared by the subject contract; they are not locale-catalog entries. When a subject contract declares no delivery language, use the student's `language` (default `zh-CN`).
- Recommendation candidate `reason` text uses the active UI locale; recommendation chrome (`ui.recommend.*`) may also use it.
- Content titles may keep the subject’s natural language (for example an English phrase the student is practicing).

## Ownership

| Key prefix | Owner |
|---|---|
| `ui.stage.*` basic four + more/back | `learn` |
| `ui.recommend.*`, `ui.identity.*`, `ui.start.*`, `ui.clean.*`, `ui.end.*`, `ui.feynman.*`, `ui.solution.*` | `learn` |
| `ui.stage.*` subject extras / descriptions | subject package |
| `ui.board.*` | owning subject package |
| `confirm.phrase.*` | `learn` |
