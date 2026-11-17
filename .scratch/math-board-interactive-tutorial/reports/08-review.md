### Spec Compliance
✅ Spec compliant

G11–G16 advance only on the committed action the brief names. Rename passes when the marked point receives a new trimmed non-empty label and every element that referenced that point id still references it. An empty label, a cancelled card, an unchanged label, a duplicate the model rejects, and a whitespace-only label do not. One new non-empty text passes, and only `editText` on that same element passes the next step. Delete passes when the marked id is gone, the marked point, the note element, and another object from the step start remain, and the board is not empty. A point note and an element note are separate `annotate` targets. The element note must be 1–20 characters. The caption step requires an `open-caption` hit on that element and a later `annotate` with `via: 'caption'` that changes the same note to a trimmed length of 1–20 characters. Deselect passes on an empty `select`. The board note passes only for `{ type: 'note', value }` with trimmed text. On `edit-board-note`, a point or element target returns before `action()`. Notes and text are not judged as geometry. `start`, `fresh`, and `skip` prepare the figure without calling `observe`. `createGoal` throws `Invalid edit goal` on a malformed save, including an `elementNote` whose trim falls outside 1–20 characters from the caption step onward. Practice events fire only after the board changes, and only while practice is open. The real geometry draft, the basics and construct step lists, the geometry model, `createPracticeProgress`, and teaching skills are unchanged. The real-device box stays unchecked.

The previous caption-length finding is gone. `edit-caption` assigns `elementNote` only when the new note trims to 1–20 characters (`math-board/src/geometry/geometry-edit.js:249-252`). A longer observe leaves the previous short note in the snapshot, and `createGoal` still accepts that snapshot (`math-board/src/geometry/geometry-edit.js:168-173`). On the page, while the step is `edit-caption`, a caption card whose value is empty or longer than 20 characters returns before `action()` (`math-board/src/geometry/geometry-view.js:931-934`). That check calls `visibleCaption`, which returns null unless the trimmed note is 1–20 code points (`math-board/src/geometry/caption.js:16-22`). The chapter test observes a 21-character caption, keeps the step and the short `elementNote`, and shows that reset and `createGoal` do not throw (`math-board/src/geometry/geometry-edit.test.js:172`). The mounted replay leaves the short note in place after an empty save and a 21-character save, stays on the step through reset, and advances on a later 1–20 character save (`math-board/src/geometry/geometry-view.test.js:1709`). The same early return is in the rebuilt `client.js`. The reported 72/72 run was judged from those tests in the diff.

The diff does not change the teacher-demo page. Its `shared.geometryTextBox` call stays outside this task.

⚠️ None.

### Strengths
- The caption bound is the same statement the canvas uses to draw the short label. The goal stores `elementNote` only after a 1–20 character caption change, and the page refuses an empty or longer caption save before the board changes, so the short label and the saved goal both stay loadable.
- Pass rules stay tied to the committed event: the marked point and its references for rename, one new text then `editText` on that id, the marked delete id with the survivors still present, `annotate` target and id for the two notes, the caption hit plus `via: 'caption'`, an empty selection, and a whole-board `note`.
- The page reports rename, text, delete, and note only when `action()` replaces the board, and it reports `{ type: 'open-caption', id }` from the caption hit target. The board-note guard still closes the card without writing when the step is `edit-board-note` and the target is a point or an element.

### Issues
#### Critical (Must Fix)
None.

#### Important (Should Fix)
None.

#### Minor (Nice to Have)
The validation note and the issue answer still record the pre-fix run: 70/70, 20 added tests, and commit `8c40233` (`math-board/docs/tutorial-08-validation.md:20` and `:26`). The fix adds the caption-length chapter test and the mounted replay. The pass rules in the tree already include that bound.

### Assessment
**Task quality:** Approved
**Reasoning:** A caption edit now passes only for a trimmed note of 1–20 characters, and a longer or empty caption save returns before `action()`, so reset and `createGoal` keep a loadable goal. The other G11–G16 commits still match the brief, and the geometry model, `createPracticeProgress`, and the teacher-demo page are untouched.
