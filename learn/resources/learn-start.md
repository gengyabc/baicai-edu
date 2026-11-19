---
name: learn-start
description: Choose a subject or learning goal, switch learners or create a profile for a new student, and prepare to start learning.
disable-model-invocation: true
resources: llm-safety-boundaries.md teaching-transition.md finalize-session.md ui-locale.md subject-contract.md session-lifecycle.md teaching-resolver.md grade-band-defaults.md create-student.md learner-stage.md
resource-loading: on-demand
---

# Start Learning

Load or reuse `learn-core` and `learn-data` per "Load Once, Reuse After". All references below belong to `learn-data` unless another owner is named; use the returned base directory. On a crisis cue, apply `learn-core`'s `references/llm-safety-boundaries.md` first. Establish language, confirm the learning identity, identify the student, resolve teaching, and activate the profile; teaching is left to `/learn`. Before switching, follow any pending `references/teaching-transition.md` recovery; if the existing log contains a `finalize_plan`, recover it per `references/finalize-session.md` and switch only after success.

All student-facing process labels and prompts below are locale keys, resolved through the active UI locale per `references/ui-locale.md` in `learn-data` (catalogs in `learn-data`'s `references/locales/`); never hard-code a language-specific literal.

## 1. Ask the Language First

This question opens every `/learn-start`, before the subject card and before any identity card. This flow has no default student — `/learn` resumes the session's student, `/learn-start` never does — so no stored profile decides it.

Ask `ui.start.language_prompt` with `ask_user_question`, offering exactly `ui.start.language_zh` and `ui.start.language_en`, and take every handling rule from the "First contact with an unknown locale" section of `references/ui-locale.md` in `learn-data`: one ask per flow, a skipped card, an unreadable catalog, and never guessing the language from the student's wording. The answer becomes this flow's UI locale and teaching language (`zh-CN` or `en`), written where a profile is saved — step 5 for a profile it creates, step 4 for a resolved student.

## 2. Choose a Subject or Goal

Only after step 1 has an answer: this card's own prompt is a locale key, so it cannot be shown before the locale exists.

A brief first contact may go straight into learning, or use Feynman mode so the AI acts as the audience. The selectable subjects are maintained only in this table; subject field conventions are in `references/subject-contract.md` in `learn-data`.

| Option | subject id | Subject package |
|---|---|---|
| Math | `math` | `baicai-edu-math-primary-low`, `baicai-edu-math-primary-high` |
| Chinese | `chinese` | `baicai-edu-chinese-reading` |
| English | `english` | `baicai-edu-english` |

Math has one subject id and two band packages; the resolver selects the one whose declared stage fit matches the student, so the table names both and the option does not ask the student to choose a package. A subject id that resolves to more than one package is normal; record which one was selected in the session as usual.

Offer only the rows this installation can actually teach: a subject package registers the skills it ships, so the session's available skill list is the install check — offer a row when that subject's core skill is listed (naming per `references/subject-contract.md`; Math counts with either band's core skill present), and leave its row out of the card when it is not, rather than offering a path that can only fall back. Keep every row when the list is missing, empty, or reported incomplete — an unfinished discovery is not evidence that a package is absent. Omitting a row removes only the shortcut: naming that subject still reaches the resolver's fallback.

Use `ask_user_question` with the prompt `ui.start.today_prompt`, offering the subjects in the table plus `ui.start.other_goal` and `ui.start.chat_first`. If the user has already named a subject or only wants to chat, adopt that directly without repeating the options; for other input keep the original goal and do not require reselection or force-guess a subject.

Pure chat reuses the currently available task identity and does not switch an unfinished task; with no identity yet, create a neutral task identity per the resolution protocol and do not invent a learning goal. Afterward confirm only the necessary learner identity; stage and preferences may be skipped, and the chosen pure-chat intent is preserved throughout identity confirmation.

Immediately after successful activation, read `learn-data`'s `references/session-lifecycle.md` (Open or Resume and Support gate) and use those gates to persist the minimal chat selection: with an original question, only overlay resume_question and keep the full task; without one, use activity: support. Do not wait for the next message to write it. Only after the write-back succeeds, say the student can chat directly or continue with `/learn`, which guarantees that a later argument-less `/learn` still keeps the chat selection; if write-back fails, stop per the lifecycle and say the selection has not been saved yet, without claiming readiness. Do not auto-recommend or pose questions.

Then read `references/teaching-resolver.md` in `learn-data`: it jointly decides the real `subject`, the neutral task identity and stable `scope_id`, and `teaching = { provider, core_skill, session_skill, evidence_namespace }`. For an unknown goal, use `task_<random hex>` per that protocol; an explicit new goal also isolates history per its scope rules; do not write everything to one shared general subject. Do not load a specialist package before the stage is recognized. When no fitting package exists, general-task teaching can be used without requiring installation first.

For a goal change, read `learn-data`'s `references/session-lifecycle.md` (Dispatch and Finalize or Switch Topic): confirm the switch and save/interrupt the old task before switching. Selecting a subject does not hot-swap an unfinished task.

## 3. Clear the Old Student Selection

`/learn-start` never inherits the student the previous session left behind: it clears that selection instead of adopting it. Once switching is confirmed to be allowed, read `outputs/students/session.json` (it may not exist) and write the whole file in the transitional state per the session.json structure in `learn-data`: `student_id: null`, the selected `subject` and the identity fields the protocol requires, with both timestamps set to the current ISO time. Identify the student only after the write succeeds; on failure, say the switch did not succeed and stop.

## 4. Identify the Student

Match shared profiles by `outputs/students/*/profile.json`, reading each one's `student_id`, `name`, optional `grade`, `education_stage`, and `personal.interests`. Display the form of address; add stage/grade notes only when known; when unknown, do not show "primary school" or any fabricated stage or grade. Always use a selection card to locate an existing student, not an open question; asking for a name belongs only to step 5 (profile creation).

- No students: go to profile creation.
- Exactly one: use `ask_user_question` with the prompt `ui.identity.confirm_name_prompt` (filled with `<name>`) and options `ui.identity.yes_its_me` and `ui.identity.no`.
- Several: take the top 4 by most recent activity (`current_state`, session `updated_at`; missing values rank last), list their names with `ask_user_question`, and make the last option `ui.identity.none_of_these`; if `ui.identity.none_of_these` is chosen, page by name in batches of 4 plus `ui.identity.none_of_these`, and only ask whether to create a new profile if the student is still not found. Never list everyone at once or guess the student's identity.
- Duplicate names: ask one clarifying question in text, and keep the profiles separate.
- Name does not exist: use `ask_user_question` to ask whether to create a new profile, and create it after confirmation.

Once one existing student is resolved, reconcile their stored `language` with the step 1 answer per `references/ui-locale.md` in `learn-data`, writing it per the Write Protocol before resolving any further label. Never ask again in this flow, and never switch because the student wrote to you in the other language.

## 5. Create a New Student Profile

Ask one question at a time, and do not repeat information already provided:

1. Learning language `language`: reuse the step 1 answer; do not ask a second time. It is written as `zh-CN` or `en`, and it is the only source of the profile's `language`.
2. Name or preferred form of address: ask in text.
3. Optional education stage `education_stage`: use `ask_user_question` to offer `ui.start.stage_primary`, `ui.start.stage_junior`, `ui.start.stage_senior`, `ui.start.stage_higher`, `ui.start.stage_adult`, and `ui.start.stage_uncertain`; if primary is chosen, ask the band or grade next, never more than six options on a card. Read the enum and compatibility rules in `references/grade-band-defaults.md`; skipping (`ui.common.skip`) keeps the stage unknown. `grade` may be omitted, and only a primary stage asks it.
4. Per the known identity and stage, read `references/teaching-resolver.md`, and adopt the profile fields and defaults of the returned `core_skill`; offer learning preferences through `ask_user_question` with that contract's options, skippable. The general implementation uses `learn-general-core` / `learn-general-session` with evidence namespace `general_v1`; a specialist implementation is `specialist`.

Interests, `learning_context`, long-term goals, and support preferences are all skippable; collect only what is necessary for the current profile creation, and do not invite disclosure of difficulties or sensitive experiences. Write shared `learning_preferences` only for goals/support preferences the student explicitly sets for cross-subject use, with fields as in `references/create-student.md`; do not infer anything not provided.

Restate in one sentence the learning language, the form of address, any stage/grade, and preferences provided, and ask the student to confirm with `ask_user_question`, with options `ui.start.confirm_ok` and `ui.start.confirm_edit`. After confirmation, read and execute `references/create-student.md`. When stage or learning context affects expression/support, load `references/learner-stage.md` from `learn-support`; do not treat stage as a ceiling on ability.

After creating and activating the profile, a learning entry prompts the student to enter `/learn` to begin; a pure-chat entry continues per step 2 and does not require setting a learning goal first.

## 6. Activate an Existing Student

1. Make old profiles compatible per `references/grade-band-defaults.md`, then read `references/teaching-resolver.md`. An existing unfinished task keeps its original teaching implementation; only a new task selects one per the fit declaration, and the real `subject` is never changed.
2. Initialize whatever this subject is missing — the file set and templates are Read Snapshot's in `learn-data`, defaults come from the resolved teaching contract, and existing evidence is preserved — and make sure the `raw/`, `extracted/`, and `backups/raw/` directories exist as `references/create-student.md` lays them out.
3. Write the current student, real subject, and required identity/teaching-implementation fields per the session.json structure in `learn-data`, and update the timestamps.
4. Only after the required files, directories, and session are all written successfully, reply with the form of address and any explicit learning goal, and prompt the student to enter `/learn` or state their wish directly; pure chat does not invent a goal and continues per step 2. On failure, report the incomplete operation and keep the profile for retry.

`outputs/students/` is created by the first write if it does not exist.
