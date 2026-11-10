---
name: learn-start
description: Choose a subject or learning goal, switch learners or create a profile for a new student, and prepare to start learning.
disable-model-invocation: true
---

# Start Learning

Load `learn-core` and `learn-data` if not already loaded. In order: confirm the learning identity, identify the student, resolve the teaching implementation, and activate the profile; teaching is left to `/learn`. If the existing log contains a `finalize_plan`, recover it per the save protocol first and switch only after it succeeds.

All student-facing process labels and prompts below are locale keys, resolved through the active UI locale per `references/ui-locale.md` in `learn-data` (catalogs in `learn-data`'s `references/locales/`); never hard-code a language-specific literal.

## 1. Choose a Subject or Goal

A brief first contact may go straight into learning, or use Feynman mode so the AI acts as the audience. The selectable subjects are maintained only in this table; subject field conventions are in `references/subject-contract.md` in `learn-data`.

| Option | subject id | Subject package |
|---|---|---|
| Math | `math` | `dsh-edu-math-primary-low` |
| Chinese | `chinese` | `dsh-edu-chinese-reading` |
| English | `english` | `dsh-edu-english` |

Use `ask_user_question` with the prompt `ui.start.today_prompt`, offering the subjects in the table plus `ui.start.other_goal` and `ui.start.chat_first`. If the user has already named a subject or only wants to chat, adopt that directly without repeating the options; for other input keep the original goal and do not require reselection or force-guess a subject. Pure chat reuses the currently available task identity and does not switch an unfinished task; with no identity yet, create a neutral task identity per the resolution protocol and do not invent a learning goal. Afterward confirm only the necessary learner identity; stage and preferences may be skipped, and the chosen pure-chat intent is preserved throughout identity confirmation. Immediately after successful activation, hand that intent to the lifecycle's create/resume and support gates and persist the minimal chat selection: with an original question, only overlay resume_question and keep the full task; without one, use activity: support. Do not wait for the next message to write it. Only after the write-back succeeds, say the student can chat directly or continue with `/learn`, which guarantees that a later argument-less `/learn` still keeps the chat selection; if write-back fails, stop per the lifecycle and say the selection has not been saved yet, without claiming readiness. Do not auto-recommend or pose questions.

First read `references/teaching-resolver.md` in `learn-data`: it jointly decides the real `subject`, the neutral task identity and stable `scope_id`, and `teaching = { provider, core_skill, session_skill, evidence_namespace }`. For an unknown goal, use `task_<random hex>` per that protocol; an explicit new goal also isolates history per its scope rules; do not write everything to one shared general subject. Do not load a specialist package before the stage is recognized. When no fitting package exists, general-task teaching can be used without requiring installation first.

Changing goals midway requires the lifecycle to save/interrupt the old task and obtain confirmation first; selecting a subject does not hot-swap an unfinished task.

## 2. Clear the Old Student Selection

Once switching is confirmed to be allowed, read `outputs/students/session.json` (it may not exist) and write the whole file in the transitional state per the session.json structure in `learn-data`: `student_id: null`, the selected `subject` and the identity fields the protocol requires, with both timestamps set to the current ISO time. Identify the student only after the write succeeds; on failure, say the switch did not succeed and stop.

## 3. Identify the Student

Match shared profiles by `outputs/students/*/profile.json`, reading each one's `student_id`, `name`, optional `grade`, `education_stage`, and `personal.interests`. Display the form of address; add stage/grade notes only when known; when unknown, do not show "primary school" or any fabricated stage or grade. Always use a selection card to locate an existing student, not an open question; asking for a name belongs only to step 4 (profile creation).

- No students: go to profile creation.
- Exactly one: use `ask_user_question` with the prompt `ui.identity.confirm_name_prompt` (filled with `<name>`) and options `ui.identity.yes_its_me` and `ui.identity.no`.
- Several: take the top 4 by most recent activity (`current_state`, session `updated_at`; missing values rank last), list their names with `ask_user_question`, and make the last option `ui.identity.none_of_these`; if `ui.identity.none_of_these` is chosen, page by name in batches of 4 plus `ui.identity.none_of_these`, and only ask whether to create a new profile if the student is still not found. Never list everyone at once or guess the student's identity.
- Duplicate names: ask one clarifying question in text, and keep the profiles separate.
- Name does not exist: use `ask_user_question` to ask whether to create a new profile, and create it after confirmation.

## 4. Create a New Student Profile

Ask one question at a time, and do not repeat information already provided:

1. Name or preferred form of address: ask in text.
2. Optional education stage `education_stage`: use `ask_user_question` to first offer six options, `ui.start.stage_primary`, `ui.start.stage_junior`, `ui.start.stage_senior`, `ui.start.stage_higher`, `ui.start.stage_adult`, and `ui.start.stage_uncertain`; if primary is chosen, further ask lower/upper band or grade, never more than six options on a card. Read the enum and compatibility rules in `references/grade-band-defaults.md`; skipping (`ui.common.skip`) keeps the stage unknown. Primary stage may additionally ask for grade; `grade` may be omitted, and do not force a primary grade for non-primary stages.
3. Per the known identity and stage, read `references/teaching-resolver.md`, and adopt the profile fields and defaults of the returned `core_skill`; offer learning preferences through `ask_user_question` with that contract's options, skippable. The general implementation uses `learn-general-core` / `learn-general-session` with evidence namespace `general_v1`; a specialist implementation is `specialist`.

Interests, `learning_context`, long-term goals, and support preferences are all skippable; collect only what is necessary for the current profile creation, and do not invite disclosure of difficulties or sensitive experiences. Write shared `learning_preferences` only for goals/support preferences the student explicitly sets for cross-subject use, with fields as in `references/create-student.md`; do not infer anything not provided.

Restate in one sentence the form of address, any stage/grade, and preferences provided, and ask the student to confirm with `ask_user_question`, with options `ui.start.confirm_ok` and `ui.start.confirm_edit`. After confirmation, read and execute `references/create-student.md`. When stage or learning context affects expression/support, load `references/learner-stage.md` from `learn-support`; do not treat stage as a ceiling on ability.

After creating and activating the profile, a learning entry prompts the student to enter `/learn` to begin; a pure-chat entry continues per step 1 and does not require setting a learning goal first.

## 5. Activate an Existing Student

1. Make old profiles compatible per `references/grade-band-defaults.md`, then read `references/teaching-resolver.md`. An existing unfinished task keeps its original teaching implementation; only a new task selects one per the fit declaration, and the real `subject` is never changed.
2. Check the current subject's `profile.json`, `memory.json`, `current_state.json`, `milestones.json`, and `session_log.json`; initialize missing files per `learn-data` Read Snapshot, with defaults taken from the resolved teaching contract and existing evidence preserved.
3. Ensure these directories exist (keep them if already present): `data/students/<id>/<subject>/raw`, `outputs/students/<id>/<subject>/extracted`, `outputs/students/<id>/<subject>/backups/raw`.
4. Write the current student, real subject, and required identity/teaching-implementation fields per the session.json structure in `learn-data`, and update the timestamps.
5. Only after the required files, directories, and session are all written successfully, reply with the form of address and any explicit learning goal, and prompt the student to enter `/learn` or state their wish directly; pure chat does not invent a goal and continues per step 1. On failure, report the incomplete operation and keep the profile for retry.

`outputs/students/` is created by the first write if it does not exist.
