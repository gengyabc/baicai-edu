# Task 08 report — geometry edit and notes chapter

**Status:** DONE_WITH_CONCERNS

**Branch:** `feat/tutorial-08` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-08`

**Commits:**

- `8c40233144d2b1b14b90dd5aa9a252620ae63497` — `feat(math-board): add geometry edit and notes practice`
- `6c8fac56afd8870f0ad7c5654df7dceff7b074cf` — `docs(math-board): record the geometry edit commit on its issue`

Not pushed. Not merged. The parent checkout was not edited except for this report.

## Delivered

Chapter `geometry-edit` (`titleKey` `geometryPracticeEdit`) in `math-board/src/geometry/geometry-edit.js`. Factory `createGeometryEditChapter({ G, emptyFrame })` is self-contained and inlined by `build.mjs` after `createGeometryConstructChapter`. Basics and construct stay registered. Their step lists were not changed.

Steps, in order:

`edit-rename`, `edit-text-add`, `edit-text-change`, `edit-delete`, `edit-point-note`, `edit-element-note`, `edit-caption`, `edit-deselect`, `edit-board-note`.

Rename passes only when `renamePoint` commits a new trimmed non-empty label on the marked point and every element that referenced that point id still references it. An empty label, a cancelled card, an unchanged label, a duplicate the model rejects, and a whitespace-only label do not pass. Adding text passes only when `addText` commits one new text element with non-empty text. Editing text passes only when `editText` changes that same element. A second text, a cancel, and an empty save do not. Delete passes only when `delete` removes the marked segment and the marked point, the note element, and another object from the step start are still there. Deleting a different object, clearing the board, and removing every object do not. The chapter does not call a host clear. A point note passes only for `annotate` with `target: 'point'` on the marked point. An element note passes only for `annotate` with `target: 'element'` on the marked element, with a non-empty note of at most 20 characters. A text element, a point note, an empty note, and a note longer than 20 characters do not stand in for each other. Caption passes only after the caption hit target (`kind: 'caption'`) opens the card and a later `annotate` with `via: 'caption'` changes that same element's note. Opening the card without saving, and editing a different element, do not pass. Deselect passes when the selection becomes empty. The step starts with something selected. The board note passes only for `{ type: 'note', value }` with a trimmed non-empty value while nothing is selected. An empty save does not pass. Notes and text are the student's own words and are not a geometry verdict. The geometry model was not changed.

`start(previousFrame)` returns the frame. A free point, an element that references it, and a survivor are reused when the previous practice frame already has them. Otherwise that point, the note segment, the extra point, and the disposable segment are created, and those creates are not observed. `fresh()` returns `{ frame, saved }`. `skip` prepares the next step's prerequisites and does not call `observe`. It does not perform the rename, the text edit, the delete, or the note the current step asks for. The caption step's start already has a 1–20 character note (`Side` when the element does not already have one). Seeding that note is not a pass. The text-change step's start already has the text `文字` when the student has not added one. `createGoal` throws `Invalid edit goal` on an inconsistent saved goal.

Page events, only after `action()` changes the board, and only while practice is open:

- rename: `{ type: 'renamePoint', before, after, id, label }`
- text: `{ type: 'addText', before, after, id }` or `{ type: 'editText', before, after, id }`
- delete: `{ type: 'delete', before, after, ids }`
- note: `{ type: 'annotate', before, after, action, target, id, ids, via }` or `{ type: 'note', ... }`
- caption open: `{ type: 'open-caption', id }` when the caption click opens the card

`via` is `caption` only when the open card came from a caption hit. A rejected rename or delete does not change the board and is not reported. On `edit-board-note`, if the note target is a point or an element, the card closes and the page returns before `action()`. A newly created element that becomes selected does not receive that text, and the step stays on `edit-board-note`. Other steps still annotate. The practice board is not written into the real geometry draft.

The student page previously asked `shared.geometryTextBox` for the text frame. That function is not defined and is not on the host object. The first text commit threw inside `geometryFrameInputs`. The student page now feeds the existing `textBoxOf` hit box into the frame, relative to the text anchor. Hit testing, the marquee, and the selection frame already used that box.

## Difference from the brief

Deleting a segment also removes endpoints nothing else references (`pointsLeavingWith`). The brief's fallback figure is one point, one segment that uses it, and one extra point, and delete removes the marked element. Deleting that only segment would remove the marked point and leave no geometry element for the later note and caption steps. A text element cannot stand in for an element note. The chapter keeps the note segment, so the marked point stays with it, keeps an extra free point that is not an endpoint of that segment (`keepId`), and deletes a different segment (`deleteId`) whose endpoints are otherwise unused. Deleting that segment removes it and those endpoints. `pointId`, `elementId`, and `keepId` remain. The model was not changed.

The model stores a whitespace-only label. `limited` checks that the label is non-empty by length, not by trim. The rename goal still requires `trim().length > 0`, so that rename does not pass.

## Tests

Focused command, **70/70 passed**:

```sh
node --test math-board/src/geometry/geometry-edit.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-edit-bundle.test.js
```

`npm --prefix math-board test`: **433 tests, 432 passed, 1 failed**. The only failure is the pre-existing `math-board/src/host/tool-schema.test.js` assertion at line 220 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. This work adds 20 tests (10 chapter, 6 handler replays, 4 bundle).

Also run before the commit: `node math-board/build.mjs`, `node --check math-board/client.js`, `git diff --check`. All passed. `client.js` was rebuilt, not hand-edited.

The handler replay finishes the chapter in Chinese and English with the stand-in pointer reported as both `mouse` and `touch`. The caption path clicks the caption hit target. A selected new text does not receive the board note. Exit, reset, skip, and chapter retry work. Chapter retry leaves the basics step state in place. The note card can still reach exit. Exit leaves a pre-seeded real geometry draft unchanged, and the quantity draft, uploads, attachments, and sends stay unchanged.

## Docs

- `math-board/README.md`: one paragraph under 安全教程扩展接口.
- `math-board/docs/tutorial-08-validation.md`: commands, counts, and what was not executed.
- Worktree issue `08-geometry-edit-notes.md`: `Status: resolved`, `## Answer`, and checked boxes only where the tests exercise the behavior. The last box is unchecked.

Both locale files have the same 396 UI keys.

## Not done

No adjust, file, or teacher-demo chapter. No change to rename, text, delete, or note rules, the basics or construct step lists, teaching skills, the submission protocol, or `createPracticeProgress`. No merge and no push.

No real browser, real mouse, touch device, layout, focus, scroll, or viewport check. The mounted replay is a handler replay, not a browser pass.

## Concerns

1. There is no real-browser or real-device pass. Handler replay used `mouse` and `touch` pointer types only. The last acceptance checkbox stays unchecked for that reason.
2. The teacher demo page still calls `shared.geometryTextBox`. A demo board that contains text still cannot be framed. The student page was changed because this chapter creates text. The demo page was left as it was. The review judged that call outside this task.

## Review fix

`edit-caption` accepted any trimmed non-empty change and stored it as `elementNote`. The note card and the model allow 500 characters. `createGoal` rejects a saved goal whose `elementNote` trims to more than 20 characters, so reset and the next load could drop the geometry practice record.

The caption step now passes only when the new note trims to 1–20 characters, the same bound as `CAPTION_MAX`. A longer string is not stored as `elementNote`. While the step is `edit-caption`, a caption edit whose trimmed text is empty or longer than 20 characters returns before `action()`. The previous short note stays, the step stays, and a later 1–20 character caption save still advances. The geometry model's note limit, `createPracticeProgress`, and the teacher-demo page were not changed.

```sh
node --test math-board/src/geometry/geometry-edit.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-edit-bundle.test.js
```

**72/72 passed.** `node math-board/build.mjs` rebuilt `client.js`. `node --check math-board/client.js` passed. `git diff --check` passed.

Commit `35e17c5b19636f3ce5dfbe2711bc75a267c2aa22` on `feat/tutorial-08`. Not pushed. Not merged.
