# Ticket 05: quantity notes validation

Validated 2026-11-16 on branch `feat/tutorial-05`, from integration `2405715` (tickets 01, 02, 03, 04, and 06). Only the quantity notes chapter and its page reports, locale strings, build registration, and these notes changed. Geometry chapters, the file chapter, the teacher-demo chapter, annotate rules in `model.js`, group and merge rules, teaching skills, and `createPracticeProgress` were not changed.

## Delivered

- [practice-notes.js](<../src/quantity/practice-notes.js>): chapter `quantity-notes`, steps `notes-deselect / notes-board / notes-board-read / notes-object / notes-object-check / notes-group / notes-group-read / notes-selection / notes-selection-check`. A step passes only on the student's own committed note for the target the current selection names. `start(previousFrame)` returns the practice frame (the shared lifecycle stores that return value). `fresh()` returns `{ frame, saved }` for catalogue entry. `skip` prepares the next step's selection, group, or earlier note and does not feed that preparation to `observe`.
- [view-component.js](<../src/quantity/view-component.js>): `applyNote` reports `type`, `before`, `after`, target kind, and ids only after `action()` changes the board, and only through `practiceEvent`. `openNote` reports `type: 'open-note'` with the current target and the card value. A rejected save, an unchanged board, and a dismissed overlay are not reported.
- Bilingual goal and failure-reason keys. The coach shows `practiceGoal_<step>`. `observe` still returns a `why` dictionary key; the shared lifecycle does not render that return value, so a miss keeps the current goal sentence on screen.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command: **47/47 passed**:

  ```sh
  node --test math-board/src/quantity/practice-notes.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-notes-bundle.test.js
  ```

- `npm --prefix math-board test`: **395 tests, 394 passed, 1 pre-existing failure**. The only failure is [tool-schema.test.js:214](<../src/host/tool-schema.test.js#L214-L220>) (`assert.ok(get)` on the shared-skill fenced JSON recipe). Left unchanged. Locale files have the same 376 keys. The built chapter list is `[createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter]`. The notes chapter adds 20 tests: 12 model tests, 4 handler replays, and 4 bundle tests.

## What the handler replay covered

[practice-notes.test.js](<../src/quantity/practice-notes.test.js>) drives committed model actions: clearing a prepared selection, choosing another object, an empty or whitespace board note, cancel, a note on an object, group, or selection while the board step is current, add-then-note, a rejected 501-character note, object and group and selection writes, a member note, a different pair, opening the board during the selection check, a preset note that does not pass the write, a resumed step that keeps earlier text, skip and reset through every step, an inconsistent saved goal, reuse of a previous group, and a catalogue start of two objects and one group. Practice storage does not write `baicai-edu-math-board:v4:session`.

[view-practice.test.js](<../src/quantity/view-practice.test.js>) mounts the quantity editor and drives the real handlers in Chinese and English, with the stand-in pointer reported as both `mouse` and `touch`. Empty save, cancel, add-then-note, a rejected over-long note, the wrong object, a member note, ungroup, and a different pair are in that replay. The note card can still reach exit. Skip, reset, chapter retry, exit, and a remount all leave the pre-seeded real draft unchanged, and the upload count stays 0.

## Model difference

The brief said an add-then-save must not store the text as the new object's note. The existing editor selects that object and `applyNote` commits an object annotation. This chapter does not change that rule. The text is stored on the object, the board note stays unchanged, and `notes-board` does not pass. Spec Q10 is met as "do not count it as the board note."

## Unexecuted / limits

No real browser was opened. No real mouse, touch device, layout, focus, scroll, or viewport check was run. The mounted replay is a handler replay, not a browser pass. A notes-specific async save/lock-queue case was not added; the replay checks that exit and remount do not change the pre-seeded real draft, the chapter test checks that practice storage does not write `baicai-edu-math-board:v4:session`, and the existing queued-save test in the same view file still passes.
