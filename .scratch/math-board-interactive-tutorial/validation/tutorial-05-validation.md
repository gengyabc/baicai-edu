# Ticket 05: quantity notes validation

Validated 2026-11-16 on branch `feat/tutorial-05`, from integration `2405715` (tickets 01, 02, 03, 04, and 06). Only the quantity notes chapter and its page reports, locale strings, build registration, and these notes changed. Geometry chapters, the file chapter, the teacher-demo chapter, annotate rules in `model.js`, group and merge rules, teaching skills, and `createPracticeProgress` were not changed.

## Delivered

- [practice-notes.js](<../../../math-board/src/quantity/practice-notes.js>): chapter `quantity-notes`, steps `notes-deselect / notes-board / notes-board-read / notes-object / notes-object-check / notes-group / notes-group-read / notes-selection / notes-selection-check`. A step passes only on the student's own committed note for the target the current selection names. `start(previousFrame)` returns the practice frame (the shared lifecycle stores that return value). `fresh()` returns `{ frame, saved }` for catalogue entry. `skip` prepares the next step's selection, group, or earlier note and does not feed that preparation to `observe`.
- [view-component.js](<../../../math-board/src/quantity/view-component.js>): `applyNote` reports `type`, `before`, `after`, target kind, and ids only after `action()` changes the board, and only through `practiceEvent`. `openNote` reports `type: 'open-note'` with the current target and the card value. A rejected save, an unchanged board, and a dismissed overlay are not reported.
- Bilingual goal and failure-reason keys. The coach shows `practiceGoal_<step>`. `observe` still returns a `why` dictionary key; the shared lifecycle does not render that return value, so a miss keeps the current goal sentence on screen.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command: **47/47 passed**:

  ```sh
  node --test math-board/src/quantity/practice-notes.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-notes-bundle.test.js
  ```

- `npm --prefix math-board test`: **395 tests, 394 passed, 1 pre-existing failure**. The only failure is [tool-schema.test.js:214](<../../../math-board/src/host/tool-schema.test.js#L214-L220>) (`assert.ok(get)` on the shared-skill fenced JSON recipe). Left unchanged. Locale files have the same 376 keys. The built chapter list is `[createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter]`. The notes chapter adds 20 tests: 12 model tests, 4 handler replays, and 4 bundle tests.

## What the handler replay covered

[practice-notes.test.js](<../../../math-board/src/quantity/practice-notes.test.js>) drives committed model actions: clearing a prepared selection, choosing another object, an empty or whitespace board note, cancel, a rejected 501-character note, object and group and selection writes on their own steps, a member note, a different pair, opening the board during the selection check, a preset note that does not pass the write, a resumed step that keeps earlier text, skip and reset through every step, an inconsistent saved goal, reuse of a previous group, and a catalogue start of two objects and one group. During `notes-board`, an object, group, or selection save is not committed: the new object's note stays empty, and the board, group, and selection notes stay as they were. Practice storage does not write `baicai-edu-math-board:v4:session`.

[view-practice.test.js](<../../../math-board/src/quantity/view-practice.test.js>) mounts the quantity editor and drives the real handlers in Chinese and English, with the stand-in pointer reported as both `mouse` and `touch`. Empty save, cancel, add-then-note, a rejected over-long note, the wrong object, a member note, ungroup, and a different pair are in that replay. The note card can still reach exit. Skip, reset, chapter retry, exit, and a remount all leave the pre-seeded real draft unchanged, and the upload count stays 0.

## Board-note guard

While practice is open and the current step is `notes-board`, a note whose overlay target is an object, a group, or a selection does not call `action()`. The board note and every object, group, and selection note stay as they were, and the step stays on `notes-board`. A board note saved with nothing selected still passes. Other steps still save object, group, and selection notes. `model.js` annotate rules are unchanged.

## Unexecuted / limits

No real browser was opened. No real mouse, touch device, layout, focus, scroll, or viewport check was run. The mounted replay is a handler replay, not a browser pass. A notes-specific async save/lock-queue case was not added; the replay checks that exit and remount do not change the pre-seeded real draft, the chapter test checks that practice storage does not write `baicai-edu-math-board:v4:session`, and the existing queued-save test in the same view file still passes.
