### Spec Compliance
✅ Spec compliant

G06–G09 advance only on the committed action the brief names. A new `parallelogram` or `rectangle` element from that tool passes; a plain polygon, an unfinished preview, the other quadrilateral, and a figure already on the board do not. Selecting one segment, or one edge of a polygon, rectangle, or parallelogram, passes only when both ends are free points and that side has no midpoint. `addMidpoint` must commit a new `midpoint` point for those ends. Drag passes only when the stored free point’s position changes through `movePoint`. Auxiliary create passes only for a new element whose `role` is `auxiliary`, and the following step passes only when the switch goes from on to off. Lengths, angles, parallel, perpendicular, equal, and collinear are not judged. `start`, `fresh`, and `skip` prepare points, one usable segment, the selected side, the movable free point, and the auxiliary switch without calling `observe` and without creating the figure the current step asks for. `createGoal` throws `Invalid construct goal` on a malformed save. Practice events are emitted only while `props.practice` is set, and the real geometry draft is still persisted only from the non-practice owner. The basics step list, `createPracticeProgress`, the geometry model, teaching skills, and the submission protocol are unchanged. The real-device acceptance box is unchecked.

The previous drag-reset finding is gone. `geometry-view.js:274-276` selects `goal.pointId` whenever the step is `construct-drag` and the selection is not exactly `[goal.pointId]`, including after `applyPracticeFrame` restores the start. The `markedDrag` ref that skipped a second selection is gone. Reset still copies the start saved at the midpoint commit (`practice-progress.js:142` and `practice-progress.js:154`), and that start still carries the derived-point selection, but the effect runs because `selection` is a dependency and `refresh` keeps rendering while a state write is dirty (`test-harness.js:67-71`). The follow-up `setSelection` is then `saveFrame`d, so the live frame and the pressed point are the free point. `geometry-view.test.js:1478-1512` completes the midpoint, resets, and checks the stored selection, `aria-pressed` on that free point, and a committed move of it.

### Strengths
- Pass rules stay tied to the committed tool event: element type plus a new id for the two quadrilaterals, the selected side’s ends for the midpoint, a position change of `pointId` for the drag, and `role: 'auxiliary'` then a true-to-false switch.
- The drag mark is re-applied from the current goal and the current selection, so the same correction covers the first arrival after `markMidpoint` and a later reset. The judge still accepts only that free point (`geometry-construct.js:175-179`).
- Prerequisite setup stays inside `ready` and is shared by `start`, `fresh`, and `skip`. Collinear inherited points gain one off-line point so the existing model can accept a later parallelogram, and those creates are not observed.
- The page reports `role` on a finished draw, `{ type: 'midpoint', ... }` only after `addMidpoint` commits, `{ type: 'move', ... }` only when the landed point moved, and `{ type: 'auxiliary', before, after }` as switch booleans. The bundle test checks that `client.js` inlines the same factory body and keeps the basics step list. Locale goal copy is present in both languages, including the derived-point sentence on the drag step. The validation note and the issue answer leave the device box open and say the handler replay is not a browser pass.

### Issues
#### Critical (Must Fix)
None.

#### Important (Should Fix)
None.

#### Minor (Nice to Have)
The validation note and the issue answer still record the pre-fix focused run: **61/61**, 17 added tests, and 5 handler replays. The reset replay is a sixth mounted test, and the implementer reports **62/62** for the same three files. The unexecuted boundary is unchanged.

### Assessment
**Task quality:** Approved
**Reasoning:** The chapter’s commit checks match G06–G09, and practice state stays off the real draft. Reset of the drag step restores a start that selected the derived midpoint, and the view now marks the free point again before the student drags.
