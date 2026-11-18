### Spec Compliance
- ✅ Spec compliant
- ⚠️ The full `npm --prefix math-board test` result after `34e61a5` is not in the diff. The report says that suite was 394/395 before the guard and was not re-run. Tests were not re-run for this review.

The follow-up claim matches the diff. In `applyNote`, when practice is open, the overlay has a target, and `practiceRef.current.snapshot().goal.step === 'notes-board'`, the function closes the overlay and returns before `action()`. That target is an object, a group, or a selection (`noteTargetFor` returns one of those, or `null` for the board). The board note, object notes, group notes, and selection notes stay as they were, and no practice event is emitted, so the step stays on `notes-board`. A save with no overlay target still builds `{ type: 'note', value }` and calls `action()`. Other steps still call `action()` for object, group, and selection notes. `model.js` is unchanged. The same `.goal.step` path is already used for the practice insert guard, and `createPracticeProgress` puts the chapter snapshot on `goal`.

The mounted replay saves `Stolen` after adding a shape on `notes-board` and asserts the new object's note stays empty, the board note stays empty, and the step stays `notes-board`. It then clears the selection, saves `Whole board`, and advances.

Q10–Q13 are present in order, with a goal, a prepared start, a judge that requires a new committed change or an explicit open/select, a `why` key in both locales, and a reset start. Empty text, cancel, a rejected over-long note, the wrong object, a member note, and a different pair do not advance. Preset text does not satisfy the write. `start` returns the frame, `fresh` returns `{ frame, saved }`, `skip` does not call `observe`, and `createGoal` throws `Invalid notes goal`. Practice stays off `baicai-edu-math-board:v4:session`. Adjust and organize stay registered; the notes factory is inlined after them. Goal copy in both languages calls the note the student's own words and ties the target to the current selection.

### Strengths
- The board-note hold is in the shared editor, which is the layer that can refuse the commit without changing annotate rules. The chapter still rejects a targeted note if one is reported.
- Read-back is a separate open (`open-note` with the card value). Group read stays disarmed until the student selects the whole group again. Selection check accepts another pair or the empty-selection board card, and still requires the marked set to keep its text.
- Skip and reset are exercised through the real progress helper. Skip into a write step does not leave that step's note already saved. Catalogue entry and reuse of a previous group are both tested.
- The built client is checked against the source factory, and the issue leaves the real-device box unchecked.

### Issues
#### Critical (Must Fix)
None.

#### Important (Should Fix)
None.

#### Minor (Nice to Have)
- The chapter unit driver repeats the hold (`step === 'notes-board' && action.type === 'annotate'`) and returns before `observe`. Group and selection non-commits are asserted there. The editor replay covers the auto-selected object, then relies on the same `target` condition for a group or a selection.
- Successful advance stores the live frame and does not call `ready()`. `ready()` is what restores a missing group and clears append mode. A student who dissolves the group before the group step, or who leaves append on after the single-object step, keeps that frame on entry and on reset. Append mode selects one member, so the group-step line “tap one member and the group selects together” does not match the board until append is turned off. Skip does run `ready()`.
- `.scratch/math-board-interactive-tutorial/validation/tutorial-05-validation.md` lists the 394/395 full suite in Executed beside the guard. The report is the place that says that suite ran before the guard.
- Skip placeholders (`Board`, `Object`, `Group`, `Selection`) are English in both languages. Goals and failure strings are translated.

### Assessment
**Task quality:** Approved
**Reasoning:** The chapter matches Q10–Q13, and the follow-up does what it claims: on `notes-board`, a targeted note is dropped before `action()`, while an empty-selection board note still commits and advances. The remaining notes are test-seam and step-entry edges, not a broken pass condition.
