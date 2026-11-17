# Task 05 report — quantity notes chapter

**Status:** DONE_WITH_CONCERNS

**Branch:** `feat/tutorial-05` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-05`

**Commit:** `1f4006808815f52f84d2962f7ca2751de7ebc329` — `feat(math-board): add quantity notes practice for the current selection`

Not pushed. Not merged. The parent checkout was not edited except for this report.

## Delivered

Chapter `quantity-notes` (`titleKey` `practiceNotes`) in `math-board/src/quantity/practice-notes.js`. Factory `createQuantityNotesChapter({ M, T, emptyFrame })` is self-contained and inlined by `build.mjs` after `createQuantityOrganizeChapter`. Adjust and organize stay registered.

Steps, in order:

`notes-deselect`, `notes-board`, `notes-board-read`, `notes-object`, `notes-object-check`, `notes-group`, `notes-group-read`, `notes-selection`, `notes-selection-check`.

A step passes only when the student commits a non-empty note on the target the current selection names, or, for the check and read steps, opens or selects that target and the saved text is still on the marked object, group, or id set. Empty text, cancel, a rejected save, an unchanged board, and the wrong target do not advance. `start(previousFrame)` returns the frame. A usable previous group and its objects are reused; otherwise the chapter creates two objects and one group, and those creates are not observed. `fresh()` returns `{ frame, saved }`. `skip` prepares the next step and does not call `observe`. `createGoal` throws `Invalid notes goal` on an inconsistent saved goal. Preset or restored text does not satisfy the write step. A resumed step keeps text saved on earlier steps.

`applyNote` reports `type`, `before`, `after`, target kind (`board`, `object`, `group`, or `selection`), and ids only after `action()` changes the board, and only through `practiceEvent`. `openNote` reports `{ type: 'open-note', target, ids, value, after }`. Dismiss does not report a save.

Goal copy in both locales says a note is the student's own words, not a checked math conclusion, and that the target depends on the current selection. Both locale files have the same 376 keys. Failure `why` values are dictionary keys. The shared lifecycle still shows `practiceGoal_<step>` and does not render `why`.

## Difference from the brief

The brief said that adding an object and then saving must not store the text as that object's note. The model and the existing editor disagree with that guess. A new object is selected, `noteTargetFor` names that object, and `applyNote` commits `{ type: 'annotate', target: 'object', id, value }`. Annotate rules in `model.js` were not changed. The text is stored on the object, `board.note` stays unchanged, and `notes-board` does not pass. Spec Q10 (“不能误写成对象说明”) is implemented as: that save is not the board note. Acceptance checkbox 2 is left unchecked for this reason. The unit test and the mounted replay both assert the object stores `Stolen` and the board note does not.

## Tests

Focused command, **47/47 passed**:

```sh
node --test math-board/src/quantity/practice-notes.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-notes-bundle.test.js
```

`npm --prefix math-board test`: **395 tests, 394 passed, 1 failed**. The only failure is the pre-existing `math-board/src/host/tool-schema.test.js` assertion at line 214 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. The notes work adds 20 tests (12 model, 4 handler replays, 4 bundle).

Also run before the commit: `node math-board/build.mjs`, `node --check math-board/client.js`, `git diff --check`. All passed. `client.js` was rebuilt, not hand-edited.

The handler replay finishes the chapter in Chinese and English with the stand-in pointer reported as both `mouse` and `touch`. Exit, reset, and chapter retry work. The note card can still reach exit. Exit leaves a pre-seeded real draft unchanged and the upload count stays 0. The chapter test checks that practice storage does not write `baicai-edu-math-board:v4:session`.

## Docs

- `math-board/README.md`: one paragraph under 安全教程扩展接口.
- `math-board/docs/tutorial-05-validation.md`: commands, counts, the model difference, and what was not executed.
- Worktree issue `05-quantity-notes.md`: `Status: resolved`, `## Answer`, and checked boxes only where the tests exercise the behavior. The real-device box is unchecked. Checkbox 2 is unchecked because add-then-save still stores an object note.

## Not done

No geometry chapter, file chapter, teacher-demo chapter, or ticket 12. No change to annotate, group, or merge rules, teaching skills, the submission protocol, or `createPracticeProgress`. No merge and no push.

No real browser, real mouse, touch device, layout, focus, scroll, or viewport check. The mounted replay is a handler replay, not a browser pass. No new notes-specific async lock-queue case; the existing queued-save test in `view-practice.test.js` still passes.

## Concerns

1. Add-then-save stores the text on the automatically selected object. The board note is unchanged and the step does not pass. This follows `noteTargetFor` / `applyNote` / `annotate`, and it is stricter than the brief's “must not store” wording only in the sense that the object does receive the note.
2. There is no real-browser or real-device pass. Handler replay used `mouse` and `touch` pointer types only.

## Follow-up: board-note save is not stored on the selected object

While practice is open and the current step is `notes-board`, `applyNote` does not call `action()` when the note overlay target is an object, a group, or a selection. `board.note` and every object, group, and selection note stay unchanged, and the step stays on `notes-board`. A board note saved with nothing selected still passes. Other steps still save object, group, and selection notes. `model.js` was not changed.

The unit test and the mounted replay now expect the added object's note to stay empty, the board note to stay unchanged, and the step to stay `notes-board`. Checkbox 2 on the acceptance issue is checked.

Command:

```sh
node math-board/build.mjs
node --check math-board/client.js
node --test math-board/src/quantity/practice-notes.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-notes-bundle.test.js
```

Result: client rebuilt, `node --check` passed, **47/47 passed**. The full `npm --prefix math-board test` suite was not re-run for this fix.

Fix commit: `34e61a5c60762265600c664b7695ade8e25e301c` on `feat/tutorial-05`. Not pushed.
