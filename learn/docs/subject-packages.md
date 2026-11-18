# Dependencies, subject packages, and adding a subject

[English](subject-packages.md) | [中文](subject-packages.zh.md)

This package is the shared base of the subject packages: installed on its own it provides general-task teaching and the five support areas; specialist teaching starts only after a fitting subject package is installed.

## Dependencies

- The skills of `math-primary-low`, `math-primary-high`, `chinese-reading` and `english` load `learn-core`, `learn-data` and `learn-errors` by name.
- With a fitting subject package installed, specialist teaching is available; old general-task evidence is not reinterpreted automatically and an unfinished task is never hot-swapped.
- Education stage, grade and context are optional; old primary profiles need no migration and adults are never pushed into a primary grade. A support-only discussion can be resumed; a neutral plan the student explicitly asks to save is stored separately from subject performance and still goes through the same finalize.
- `personal.interests` is a cross-subject personalization field that every subject skill reads; how each subject uses it belongs to that package.
- The shared package never installs all subjects in reverse. Install order and failure handling are in the [installation guide](<../../docs/installation.md>).

## Existing subject packages

`math-primary-low`, `math-primary-high`, `chinese-reading`, `english`.

One subject may be split into packages by grade band (math is `math-primary-low` and `math-primary-high`): the [teaching resolver](../skills/learn-data/references/teaching-resolver.md) picks the band from a known grade (1–3 → low, 4–6 → high, no grade → low) and loads and restores it by unique skill names (`math-low-*` / `math-high-*`), while the subject id stays the same.

## Adding a subject

1. Ship a `<subject>-session` and a `<subject>-core` that carries a "Subject contract" section.
2. Register the subject in `learn-start`'s subject table.
3. No other entry needs changes; a multi-band subject follows the unique-skill-name rule above.

The interfaces of `<subject>-session` / `<subject>-core` are defined by the [subject contract](../skills/learn-data/references/subject-contract.md); a missing package falls back to the general path with the same interface.
