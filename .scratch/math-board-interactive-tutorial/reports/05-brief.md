# Task 05 — Quantity notes chapter (Q10–Q13)

Read this first. It is the requirements. Exact ids below are binding.

## Where this fits

Integration branch `feat/math-board-interactive-tutorial` at `2405715` already has quantity basics, chapter navigation, geometry basics, quantity adjust (`quantity-adjust`), and quantity organize (`quantity-organize`). You add only the notes chapter.

Do not implement geometry chapters, the file chapter, the teacher-demo chapter, or ticket 12. Do not change annotate rules in `model.js`, group or merge rules, teaching skills, the submission protocol, or `createPracticeProgress`.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-05`

Branch: `feat/tutorial-05`, already checked out at the integration tip. Do not merge integration again. Do not merge into `feat/math-board-interactive-tutorial`. Do not push. Do not edit the parent checkout `/Users/yugeng/programming/dsh-edu` except to write the report file named below.

## Chapter

Factory: `createQuantityNotesChapter({ M, T, emptyFrame })` in `math-board/src/quantity/practice-notes.js`.

- id: `quantity-notes`
- titleKey: `practiceNotes`
- Self-contained for `build.mjs` inlining (no free variables outside the function).

Step ids, in this order. Do not collapse two of these into one prompt:

| Spec | Step id | Done when |
| --- | --- | --- |
| Q10 clear selection | `notes-deselect` | The student clears the selection. The step start has a non-empty selection, so an already-empty board does not pass. Selecting a different object does not pass. |
| Q10 board note | `notes-board` | With an empty selection, the student saves a non-empty whole-board note (`action.type === 'note'`). An empty string, a cancelled overlay, or a note saved while an object, group, or selection is the target does not pass. Adding an object (which selects the new object) and then saving must not store the text as that object's note and must not pass. |
| Q10 read back | `notes-board-read` | The student opens the note card again with no selection, and the card value is the board note just saved. Opening a card for an object or group does not pass. |
| Q11 object note | `notes-object` | A non-empty note is saved on the marked object (`annotate` target `object`). Saving on a different object, on the board, or on a group does not pass. Empty text does not pass. |
| Q11 check | `notes-object-check` | The student selects a different practice object. That object's note is not the marked object's text, and the marked object still has the text just saved. |
| Q12 group note | `notes-group` | A non-empty note is saved on the target group (`annotate` target `group`), not on a member and not on the board. The group must already exist at the step start. |
| Q12 read back | `notes-group-read` | The student selects that whole group again and opens its note. The card shows the group note. A member's own note is not accepted as the group note. |
| Q13 selection note | `notes-selection` | A non-empty selection note is saved for the exact marked id set (`annotate` target `selection`, at least two ids). A different set, a single object, or the board does not pass. |
| Q13 check | `notes-selection-check` | The student opens the note for a different pair, or for the board with nothing selected. That target does not show the selection text, and the marked set still has it. |

`start(previousFrame)` returns the frame itself, because `createPracticeProgress` stores that return value as the frame. Reuse a usable group and objects from the previous practice frame when they exist. Otherwise create two objects and one group. Those created objects and the group are not observed and do not complete any step.

`fresh()` supports catalogue entry and may return `{ frame, saved }`.

`skip(saved, frame)` prepares the next step's prerequisites (a selection for deselect, an empty selection before the board note, a group before the group steps, two live objects before the selection note) without writing the note the current step asks the student to write, and without calling `observe`.

`createGoal` throws `Invalid notes goal` on an inconsistent saved goal instead of repairing it. Preset or restored note text must not satisfy the step that asks the student to write it. A resumed in-progress step keeps the text already saved on earlier steps.

Failure `why` values are dictionary keys present in both `locale/zh.json` and `locale/en.json`. Goal keys are `practiceGoal_<stepId>`. Chapter title key is `practiceNotes`. The same keys exist in both files. Goal copy says a note is the student's own words, not a checked math conclusion, and that the target depends on the current selection.

## Page wiring

`math-board/src/quantity/view-component.js` already saves notes in `applyNote`:

- no target → `{ type: 'note', value }` (whole board)
- selection → `{ type: 'annotate', target: 'selection', ids, value }`
- object or group → `{ type: 'annotate', target, id, value }`

`noteTargetFor` makes a complete group the note target before a single object. `openNote` opens the card. `dismissOverlay` closes it without saving.

Report a practice event only after a note save that `action()` actually commits, and only through the existing `practiceEvent` helper (it no-ops when practice is closed). Include `type`, `before`, `after`, and the target kind (`board`, `object`, `group`, or `selection`) plus ids. A rejected save, an empty commit that does not change the board, and a dismissed overlay do not advance the step. Also report opening the note card (`type: 'open-note'`) with the current target and the card value, so the read-back steps can see what the student opened. Do not report host or system changes. Do not write practice into `baicai-edu-math-board:v4:session` or any other real draft, trace, or attachment key.

Register the factory in `math-board/build.mjs` the same way as organize: import, inline with `.toString()`, append to `Browser.quantityPracticeChapters` after `createQuantityOrganizeChapter`. Do not remove adjust or organize.

## Tests

1. `math-board/src/quantity/practice-notes.test.js` — each success, plus at least one miss: empty note, wrong target, cancel, add-then-note does not become the board note, a member note is not the group note, a different selection is not the marked set. Skip and reset do not auto-complete the write they prepare for.
2. Mounted replay in `math-board/src/quantity/view-practice.test.js`, same stand-in as the organize replay. Chinese and English both finish the chapter. Exit leaves a pre-seeded real draft unchanged. Skip, reset, and chapter retry work. The note card can still reach exit.
3. `math-board/tests/practice-notes-bundle.test.js` mirroring `practice-organize-bundle.test.js`: the built client inlines `createQuantityNotesChapter` and lists it after the adjust and organize factories.

Run:

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/quantity/practice-notes.test.js math-board/src/quantity/view-practice.test.js math-board/tests/practice-notes-bundle.test.js
npm --prefix math-board test
```

The known failure `math-board/src/host/tool-schema.test.js` around the missing fenced JSON recipe is pre-existing. Do not change teaching contracts to satisfy it. Any other new failure is yours.

Do not hand-edit `math-board/client.js`. Rebuild it.

## Docs in this branch

- One short paragraph in `math-board/README.md` under 安全教程扩展接口: chapter id, step ids, and that only a committed note on the current target passes.
- `math-board/docs/tutorial-05-validation.md`: commands, counts, and what was not executed (real browser, real mouse, touch device, layout). Handler replay is not a browser pass.
- `.scratch/math-board-interactive-tutorial/issues/05-quantity-notes.md`: `Status: resolved`, an `## Answer`, and checked boxes only for behavior the tests actually exercise. Leave the real-device box unchecked.

## Commit

One or more commits on `feat/tutorial-05` only. Message style: `feat(math-board): ...`. Do not amend. Do not use `--no-verify`.

## Report

Write the full report to:

`/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/05-report.md`

Do not `git add` that report. Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, a one-line test summary, and concerns.
