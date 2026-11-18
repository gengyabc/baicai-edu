# Math Language Contract

Shared by all math teaching branches. Language changes delivery and access to the task, not the mathematical goal, band, method, or evidence threshold.

## Delivery language

- Support Chinese (`zh-CN`, alias `zh`) and English (`en`). Start from the shared-profile `language`, which `/learn-start` records from the student's explicit language choice; missing or unknown values use `zh-CN`.
- An explicit conversational request to use Chinese or English overrides teaching delivery for the current task, including its diagnosis, practice, student-authored problems, modeling, and Feynman turns. Preserve the pending problem and step. A lasting preference change belongs to the shared profile-edit protocol; a task-local switch alone writes no profile preference.
- A short answer in the other language, a quoted problem, or board text alone does not change delivery language. Accept Chinese, English, mixed-language reasoning, equations, or a student explanation of their representation. If the requested language is unclear, ask one short clarification.
- Write problems, hints, feedback, summaries, and teacher-authored diagram titles, descriptions, and explanatory text in the delivery language. Keep point names, mathematical symbols, units, and necessary source terms stable. A brief Chinese/English term pair can clarify meaning; routine sentence-by-sentence bilingual output is unnecessary unless requested.
- Process labels and recommendation reasons still use the active UI locale under the shared UI-locale protocol. Resolve catalog keys rather than translating labels ad hoc. A teaching-language switch alone does not change the UI locale.

## Separate language access from mathematical evidence

- Use short, age-appropriate sentences and familiar contexts in either language. Match mathematical relations and numerical demand across translated tasks, not word order. Preserve comparison direction, unknown position, units, and all constraints.
- When a word or sentence blocks access, explain or rephrase only that language while preserving the problem and the student's consequential mathematical decisions. For example, clarify the meaning of a comparison phrase without choosing the operation or equation for the student.
- Judge the expressed mathematics, not grammar, accent, spelling, or fluency. Language hesitation or an unfamiliar term alone leaves mathematical understanding unknown; it is not an error type or a reason to lower the strategy stage or switch bands.
- Distinguish language-only clarification from a mathematical hint in existing evidence summaries. If rephrasing reveals the relation or method, attribute that support; subsequent success is not independent relation-finding. A translation of an already-exposed item is not a fresh independent or transfer check.
- Retain original numerical notation when reading materials. If decimal separators, number words, or units admit different values and the distinction matters, confirm that one ambiguity before calculating or diagnosing. Preserve the submitted-board reading and geometry boundaries.

## Attachment identity

Filenames and stable schema keys do not choose the teaching language. Human-facing titles and prose follow the delivery language.

Identify board attachments by their structured `kind` and `schemaVersion`, not a Chinese or English filename. Read the sent files before interpreting them. Preserve student-supplied filenames and originals; this contract authorizes no student-data rename, migration, submission, or cleanup. Generated learning-record paths continue to follow the shared data protocol.
