# Derivation & Proof Teaching — drop-in reference patch

This is a **minimal compatible patch** for an existing math Skill. It **does not include or replace** your `math-teaching-core.md`, `scaffold-calibration.md`, or root `SKILL.md`, because they were not part of the supplied upload.

## Files

- `references/derivation-teaching.md`: a cleaned-up, backward-compatible version of the supplied **Derivation Teaching** document. The seven section names, the main teaching loop, `context.turn_state`, and the original shared reference paths are retained.
- `references/proof-teaching.md`: new optional extension for proof construction, validation, and write-up. It explicitly builds on the original shared references and derivation loop.
- `examples/routing-snippet.md`: optional caller integration, without altering the user's existing `SKILL.md`.

## Install (no path migration)

1. Back up your current `references/derivation-teaching.md` if it exists.
2. Copy both `.md` files from this bundle's `references/` into the **existing** Skill's `references/` folder, keeping the same filenames and directory structure.
3. Keep `references/math-teaching-core.md` and `references/scaffold-calibration.md` in their existing locations unchanged.
4. If the root Skill file currently loads derivation for formula discovery and proof alike, optionally apply the small call-routing note from `examples/routing-snippet.md`. If it already routes proof requests via derivation, that reference now explicitly directs proof tasks to the new file.

## Trigger tests

- **Discover a formula:** load derivation and the two existing shared references; do not reveal the target merely because the student requests a hint.
- **Prove a universal claim:** load derivation + proof, keep definitions/domain and validity checks explicit.
- **Explain an already-given proof:** honor the student's requested explanatory depth; don't force rediscovery.
- **Student supplies a valid different proof:** verify and continue their route, rather than the teacher's predetermined one.
- **Student writes an unjustified converse:** inspect direction of implication before asking for more arithmetic.
- **Student asks only for the formula or a complete proof:** provide the requested form; don't add compulsory exercises.

## Compatibility notes

- Original shared references preserved literally: `references/math-teaching-core.md`, `references/scaffold-calibration.md`.
- Existing state key preserved: `context.turn_state` (no extra durable fields).
- Original seven-stage approach preserved. New local proof states are descriptions, not new software states or learning-model algorithms.
- The uploaded file appeared as Markdown **escaped by another layer** (e.g., `**# Title**` and `\``). The replacement normalizes those delimiters so it renders correctly while retaining the original educational content and extending it.
