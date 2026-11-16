# Task 08: geometry edit and notes validation

Validated on branch `feat/tutorial-08`. Only the geometry edit and notes chapter was added. Geometry basics and geometry construct step lists, `createPracticeProgress`, the geometry rename, text, delete, and note rules, teaching skills, and the submission protocol were not changed. Adjust, file, and teacher-demo chapters were not implemented.

## Delivered

- [geometry-edit.js](<../src/geometry/geometry-edit.js>): `createGeometryEditChapter({ G, emptyFrame })`. Chapter id `geometry-edit`, title `geometryPracticeEdit`. Steps: `edit-rename`, `edit-text-add`, `edit-text-change`, `edit-delete`, `edit-point-note`, `edit-element-note`, `edit-caption`, `edit-deselect`, `edit-board-note`. A step passes only when that step's commit changes the marked point, the same text, the marked object, or the note the step names. Notes and text are the student's own words and are not a geometry verdict.
- [geometry-view.js](<../src/geometry/geometry-view.js>): a rename, text add, text edit, delete, or note is reported only after `action()` changes the board. A caption click reports `{ type: 'open-caption', id }`. On `edit-board-note`, a point or element target closes the card and returns before `action()`, so a newly selected object cannot take the whole-board note. Other steps still annotate. The student page frames text with the existing hit box. `shared.geometryTextBox` is not defined, and the first text commit otherwise throws inside `geometryFrameInputs`.
- Bilingual goal copy, one README paragraph, and the built client lists `createGeometryEditChapter` after `createGeometryConstructChapter`. Basics and construct stay registered. Their step lists are unchanged. The construct bundle assertion now expects that longer chapter list.

## Model difference

Deleting a segment also removes endpoints nothing else references. The brief's fallback is one point, one segment that uses it, and one extra point, with delete removing the marked element. Deleting that only segment would remove the marked point and leave no geometry element for the later note and caption steps. A text element cannot stand in. The chapter keeps the note segment and the marked point, keeps an extra free point that is not an endpoint of that segment, and deletes a different segment whose endpoints are otherwise unused. The geometry model was not changed.

A whitespace-only label is stored by the model. The rename goal still requires a trimmed non-empty label, so that rename does not pass.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command, **70/70 passed**:

  ```sh
  node --test math-board/src/geometry/geometry-edit.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-edit-bundle.test.js
  ```

- `npm --prefix math-board test`: **433 tests, 432 passed, 1 failed**. The only failure is the pre-existing [tool-schema.test.js](<../src/host/tool-schema.test.js>) assertion at line 220 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. This work adds 20 tests: 10 chapter tests, 6 handler replays, and 4 bundle tests. Both locale files have the same 396 UI keys.

## Operation-goal replay (not a browser pass)

[geometry-edit.test.js](<../src/geometry/geometry-edit.test.js>) drives the goal with committed boards:

- Renaming the marked point passes, and every element that referenced that point id still references it. An empty label, an unchanged label, a duplicate the model rejects, a whitespace-only label, and a dropped reference do not.
- One new text passes. Editing that same text passes. A second text, and an empty edit, do not.
- Deleting the marked segment passes and leaves the marked point, the note element, and the extra object. Deleting a different object, clearing the board, and removing every object do not.
- A point note passes. A text element and an element note do not stand in. An element note of 20 characters passes. A note of 21 characters does not.
- Opening a caption without saving does not pass. Saving a different element, or saving without the caption path, does not. A caption save that changes that element's note passes.
- Clearing the selection passes. An annotate while a selected element is the note target does not pass the board note, and an empty or whitespace board note does not. A non-empty whole-board note then completes the chapter.
- `start` reuses a free point, an element that references it, and a survivor. Otherwise it creates that figure, and those creates are not observed. `fresh` supports catalogue entry. `createGoal` throws `Invalid edit goal` instead of repairing a bad save. `skip` does not call `observe` and does not perform the write, rename, or delete the current step asks for. The caption step's start already has a 1–20 character note. Seeding that note is not a pass.

[geometry-view.test.js](<../src/geometry/geometry-view.test.js>) replays the mounted editor in Chinese and English, with the stand-in pointer reported as `mouse` and `touch`. The caption path clicks the caption hit target. A newly created text that becomes selected does not receive the board note. Exit leaves a pre-seeded real geometry draft unchanged. Skip, reset, and chapter retry work, and retrying this chapter leaves the basics step state in place. The note card can still reach exit.

## Unexecuted / limits

No real browser, real mouse, touch device, layout, focus, scroll, or viewport check. The mounted replay is a handler replay, not a browser pass. No new geometry-specific async lock-queue case. The known tool-schema failure was not investigated beyond confirming it is the pre-existing fenced-JSON assertion. The teacher demo page still calls `shared.geometryTextBox`, so a demo board that contains text still cannot be framed. That page was not part of this chapter.
