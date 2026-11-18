# Task 08 — Geometry edit and notes chapter (G11–G16)

Read this first. It is the requirements. Exact ids below are binding.

## Where this fits

Geometry basics and geometry construct are already on the integration branch. This chapter does not depend on the construct chapter’s figures. Do not change point-rename, text, delete, or note rules in the geometry model. Do not change `createPracticeProgress`, the basics or construct step lists, teaching skills, or the submission protocol. Do not implement the adjust, file, or teacher-demo chapters. Notes and text are the student’s own words. Do not judge them as geometry or as a right answer.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-08`

Branch: `feat/tutorial-08`. Do not merge into `feat/math-board-interactive-tutorial`. Do not push. Do not edit the parent checkout except to write the report file named below.

## Chapter

Factory: `createGeometryEditChapter({ G, emptyFrame })` in `math-board/src/geometry/geometry-edit.js`.

- id: `geometry-edit`
- titleKey: `geometryPracticeEdit`
- Self-contained for `build.mjs` inlining.
- `start(previousFrame)` returns the frame. Reuse a free point and an element that references it when the previous practice frame has them, plus a second object that delete must leave behind. Otherwise create that point, one segment that uses it, and one extra point. Those creates are not observed.
- `fresh()` supports catalogue entry.
- `skip(saved, frame)` prepares the next step’s prerequisites without calling `observe` and without performing the write, rename, or delete the current step asks for. The caption step’s start must already have a 1–20 character note on the marked element, because that is what the canvas draws as a short label (`CAPTION_MAX` is 20 in `math-board/src/geometry/caption.js`). Putting that short note in place during skip is not a pass.
- `createGoal` throws `Invalid edit goal` on an inconsistent saved goal.

Step ids, in this order:

| Spec | Step id | Done when |
| --- | --- | --- |
| G11 rename | `edit-rename` | `renamePoint` commits a new non-empty label on the marked point, and every element that referenced that point id still references it. An empty label, a cancelled card, an unchanged label, and a duplicate label that the model rejects do not pass. |
| G12 add text | `edit-text-add` | `addText` commits one new text element with non-empty text. Cancelling or an empty save does not pass. |
| G12 edit text | `edit-text-change` | `editText` changes that same text element’s text. Adding a second text, cancelling, or an empty save does not pass. |
| G13 delete | `edit-delete` | `delete` removes the marked element. Another object that was on the step start is still there. Deleting a different object, or removing every object, does not pass. Do not call a host clear. |
| G14 point note | `edit-point-note` | `annotate` with `target: 'point'` saves a non-empty note on the marked point. A text element or an element note does not pass. |
| G14 element note | `edit-element-note` | `annotate` with `target: 'element'` saves a non-empty note of at most 20 characters on the marked element, so a short label can appear. A point note, a text element, an empty note, or a note longer than 20 characters does not pass. |
| G15 caption | `edit-caption` | The student opens the note from that element’s canvas caption (the hit target `kind: 'caption'`, not a hover) and `annotate` changes that same element’s note. Opening the card without saving does not pass. Editing a different element does not pass. |
| G16 deselect | `edit-deselect` | The student clears the selection. The step start has something selected. |
| G16 board note | `edit-board-note` | With nothing selected, `{ type: 'note', value }` saves a non-empty whole-board note. An empty save does not pass. |

While the practice step is `edit-board-note`, if the note target is a point or an element, do not call `action()`. A newly created element that becomes selected must not receive that text. The step stays on `edit-board-note`. This is the same guard the quantity notes chapter uses for `notes-board`. Do not change annotate rules for the other steps.

## Page wiring

`geometry-view.js` already performs these commits and does not report them to practice:

- `applyRename` → `{ type: 'renamePoint', id, label }`
- `applyText` → `{ type: 'addText', ... }` or `{ type: 'editText', id, text }`
- `deleteSelection` → `{ type: 'delete', ids }`
- `applyNote` → `{ type: 'annotate', target, id, value }` or `{ type: 'note', value }`
- caption `pointerDown` opens the note overlay with `target` set from the caption

Report a practice event only after `action()` changes the board, through the existing `practiceEvent` helper. Include `type`, `before`, `after`, and enough ids to see which point or element changed. A rejected rename or delete is not a success. Report `{ type: 'open-caption', id }` when the caption click opens the card, so a bare open does not have to be inferred from a later save. `practiceEvent` already no-ops when practice is closed.

Register the factory in `build.mjs`: import, inline with `.toString()`, append to `Browser.geometryPracticeChapters` after `createGeometryConstructChapter`. Do not remove basics or construct.

## Tests

1. `math-board/src/geometry/geometry-edit.test.js` — each success and at least one miss: duplicate or empty rename, a second text instead of an edit, delete-all, a text element used as an element note, a note longer than 20 characters, a caption open without a save, a board note stolen onto a selected element.
2. A mounted replay in `geometry-view.test.js`. Chinese and English both finish the chapter. The caption path clicks the caption hit target rather than relying on hover. Exit leaves a pre-seeded real geometry draft unchanged. Skip, reset, and chapter retry work. The note card can still reach exit.
3. `math-board/tests/practice-edit-bundle.test.js` — the built client inlines `createGeometryEditChapter` and lists it after the construct factory.

Run:

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/geometry/geometry-edit.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-edit-bundle.test.js
npm --prefix math-board test
```

The known failure `math-board/src/host/tool-schema.test.js` around the missing fenced JSON recipe is pre-existing. Do not change teaching contracts to satisfy it. Do not hand-edit `client.js`.

## Docs

- One short paragraph in `math-board/README.md` under 安全教程扩展接口: chapter id, step ids, and that a note or text is not a geometry verdict.
- `.scratch/math-board-interactive-tutorial/validation/tutorial-08-validation.md`: commands, counts, and what was not executed. Handler replay is not a browser pass.
- `.scratch/math-board-interactive-tutorial/issues/08-geometry-edit-notes.md`: `Status: resolved`, an `## Answer`, and checked boxes only for behavior the tests exercise. Leave the real-device box unchecked.

## Commit and report

Commits on `feat/tutorial-08` only. Message style: `feat(math-board): ...`. Do not amend. Do not use `--no-verify`.

Write the full report to `/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/08-report.md`. Do not git-add it.

Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, a one-line test summary, and concerns.
