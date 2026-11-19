---
cited: learn-core/references/prestart-settings-interpretation.md
---

# Prestart Settings Interpretation

Personalization only adjusts tone, examples, and scaffolding; it does not change the learning goal or override the student's current message. How interests become contexts, problems, or bridges is set by the current subject package.

For field paths and templates see `learn-data`'s `references/profile-schema.md`. The shared profile is the only source of cross-subject personalization; the subject profile holds only that subject's learning evidence and preferences. Do not look for `easy_topics` in the shared profile, and do not write interests into `learning_state`. Read them with the snapshot at session start; do not repeatedly ask or follow up for personalization.

## Allowed Influence

Per the current subject package, use the interests, experiences, subject preferences, and easy/hard topics in the snapshot to adjust presentation and scaffolding. Preferences only change how things are presented; they do not lower the goal or change target classification, level judgment, or the evidence bar. Once an interest or experience is used, use at most one concrete detail per turn.

## Easy / Hard and Self-Report

`easy_topics` serve only as a starting point into the current goal. The explicit goal and the current turn's performance take priority over self-report. `hard_topics` only hint at support that may be needed, and give more support around them; do not lower the goal or pre-judge difficulty because of them.

## Disallowed Influence

This information must not override:

- This turn's learning goal.
- The student's current message.
- Explicit teaching instructions or goals set by a human teacher.
- Subject evidence: mastery, difficulties, and error history follow the subject profile.

## Privacy and Usage

- Interests are a source of examples, not a judgment about the student.
- Ask a privacy question once; if the student doesn't want to talk, switch to ordinary examples.
- Do not proactively recount sad experiences or family information; `most_sad_event` is not used as repeatedly reused teaching material; stop immediately if the student doesn't want to say.
- If a field is missing, skip it; do not invent.
- Changes in interests are written to `personal.interests` or the subject `preferences` (write protocol in `learn-data` / `/learn-profile`); do not silently change the learning goal.
