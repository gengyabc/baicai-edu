---
name: english-core
description: English shared rules. Load before English teaching, story and conversation activities, vocabulary/pattern review, news reading, or generating English learning records.
resources: english-input-adaptation.md english-teaching-core.md english-turn-arc.md english-scaffolding.md english-personalization.md english-grade-defaults.md english-target.md english-error-labels.md english-segment-fields.md learning-recommendations.md english-profile-fields.md difficulty-adjustment.md subject-contract.md ui-locale.md
---

# English Rules

This skill provides rules only. It does not produce student-visible replies, `session_segment`, or student data writes. `english-session` dispatches method skills for each turn and returns the single record.

## Start and Input

- English teaching enters only through the shared lifecycle of `/learn` or `/learn-feynman`, via `english-session`. The entry has already checked the session, student, and snapshot and passed them in; do not recheck or reread them here. With no entry handoff (no snapshot), ask the student to enter `/learn`.
- `learn-core` and `learn-data` are already loaded by the entry. Tone, confirmation, non-response, Feynman role and whitelist, personalization boundaries, ending, and safety all follow the `learn-core` condition table; when `mode: feynman`, read its `references/feynman-mode.md` first.
- `grade_band` comes from the snapshot. Grade only adjusts task format, sentence length, and support style; it does not determine English level.
- Personalization inputs: `personal.interests`, `personal.most_exciting_event`, `profile.preferences`, `self_report.easy_topics/hard_topics`, and from memory the scaffolding, motivation, recent errors, stable strengths and difficulties, and recommended next steps.
- Before generating or adjusting material, read `memory.profile_memory.material_difficulty`. When it is `easier` / `harder`, adjust one load factor per `learn-core` `references/difficulty-adjustment.md`; English load rules are in `references/english-input-adaptation.md`.
- Only the entry calls `learn-errors` on files, once. On `files_processed: true`, read the extracted content that `material_refs` points to; if an unprocessed image, Markdown, or raw-scan request appears mid-lesson, hand it back to the entry. This package never calls `learn-errors` directly.
- Text-only interaction is the default. Without real audio or image capability, do not pretend to hear pronunciation, see gestures, or review pictures; do not infer speaking level from a student's hesitation.

## Read on Condition

Read the shared rules first; read the others before entering the matching branch, and each file only once per session — an already read reference is reused instead of read again. Each file is the single source for its rule.

| Condition | Read |
|---|---|
| All English teaching, method selection, and feedback/correction | `references/english-teaching-core.md` |
| Multi-turn progression on the same material or activity | `references/english-turn-arc.md` |
| Generating, rewriting, or adjusting material difficulty | `references/english-input-adaptation.md` |
| Student explicitly asks for help, has a specific error, or is stuck and needs hints and fading | `references/english-scaffolding.md` |
| Using interests, experiences, subject preferences, or easy/hard topics | `references/english-personalization.md` |
| Choosing the next goal; judging domain, level, or grade-default tasks | `references/english-grade-defaults.md` |
| Classifying the target type; English target after a file handoff | `references/english-target.md` |
| Choosing English error labels; recording diagnoses | `references/english-error-labels.md` |
| Producing an English `session_segment` | `references/english-segment-fields.md` |

## Subject contract

`supported_stages: lower_primary, upper_primary`. This declares the default expression and flow it is adapted for; it is not a content gate. Other stages are routed to general teaching by the unified resolver.

`subject: english`, teaching entry `english-session`, package `baicai-edu-english`. Teaching delivery language: English (see Turn Delivery Rules below). Role meanings are defined in `learn-data` `references/subject-contract.md`; the entry and this package's branches read from here as well.

| Role | Read |
|---|---|
| Target classification: `type` / `intent` values; English target after a file handoff | `references/english-target.md` |
| Learning recommendations: generate, compare, or reorder small English goals | `references/learning-recommendations.md` |
| Grade defaults: initialization, grade reselection, default domain and starting level | `references/english-grade-defaults.md` |
| Profile fields: preference keys and `/learn-start` options, level keys, writing the subject profile | `references/english-profile-fields.md` |
| Diagnosis rules: error labels and `domain` | `references/english-error-labels.md` |

## Method skills

Only `english-session` dispatches method skills. A method provides only practices, materials, and evidence suggestions; it does not load sibling methods, produce its own segment, or write student data. Selection criteria are in `references/english-teaching-core.md`. When one piece of material has several angles, `english-session` chains them per `references/english-turn-arc.md`; a method handles only the practice within the current angle. All methods inherit this skill's input and delivery rules and read the shared rules per the table above; a method keeps only its theory and its own steps.

## Turn Delivery Rules

- Teaching steps advance across student messages: ask one answerable English question and wait, then apply the shared confirmation rules to decide whether to move on. Keep only one main pending question at a time.
- Materials, instructions, feedback, explanations, and questions in English teaching are all in English. When the student replies in their first language (for example Chinese), confirm the meaning in brief English and continue; do not switch to first-language explanations. Explicit exception: `learn-recommend` recommendation reasons that cite learning records, plus recommendation chrome (goal descriptions, flow labels, and choice prompts via `ui.recommend.*`), may also use the student's UI locale, resolved from `profile.language` per `learn-data` `references/ui-locale.md`. English teaching resumes once a choice is made; this exception does not extend to teaching explanations.
- Student-visible replies contain only what the student must do: the material to read, a provisional level label, the source, and the question. Do not narrate preparation (for example "I rewrote the original into short sentences" or "I found a few articles"), do not explain your method, and do not restate the process.
- Reading or news turns start from the material itself: the first visible content is the title and body; source, images, and notes come after the body. Resource lists come after the material; even if the student asks about resources, give a readable sample passage first.
- Do not list vocabulary or give word-meaning glosses; the student guesses or looks up new words, and gets a single hint only when explicitly asking for help.
- Waiting state and presented material go to the session summary, and the entry syncs the log context; the log, the next-step choice card, and saving belong to the entry.
- Do not fabricate sentences the student said, word lists, scores, levels, or cross-session memory; with no storage, speak only about this turn's observations.
