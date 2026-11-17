### Spec Compliance
- ✅ Spec compliant
- Check: chapter `quantity-organize` keeps the eleven step ids in the brief’s order (`practice-organize.js:4-6`). Q10–Q13 are not steps. `model.js`, `practice-progress.js`, teaching skills, and the submission path are absent from the diff. `quantityPracticeChapters` stays `[createQuantityAdjustChapter, createQuantityOrganizeChapter]`.
- Check: the previous Critical finding is gone. `ready()` names only object 1 for reselect and peer (`practice-organize.js:60-63`). When peer is prepared and object 2 already holds that name, its alias is cleared to `''` (`practice-organize.js:65-69`). An empty alias is a legal update (`model.js:26`, `model.js:345`), and the targets are ungrouped first (`practice-organize.js:50-52`), so the clear is not rejected as a member rename. `practice-organize.test.js:80-104` skips through `createPracticeProgress` into peer, checks that object 2 lacks the saved name, resets to that start, and then advances by setting the name.
- Check: arriving at peer by completing reselect, with object 2 already holding the saved name, stays inside the spec. A passed reselect stores the student frame as the next start (`practice-progress.js:140-142`) and does not run `ready()`. Peer still requires object 2’s alias to change to the saved name (`practice-organize.js:157-159`), so the earlier edit leaves the step open. Reset restores the board from entry (`practice-progress.js:153-156`). A later change to that saved name can still pass. Skip preparation is the path that writes the practice start, and that path now leaves object 2 unnamed.
- Check: the selection-note finding is gone. A merge passes when `mergeCandidate` allows the marked pair and the model commits it (`practice-organize.js:182-189`). The judge no longer rejects a selection note. `practice-organize.test.js:162-170` annotates both targets, merges, advances to split, and the merged object keeps the note.
- Check: the reselect finding is gone. One selected id passes only when that id is object 1 and `after` still has the alias saved at the end of naming (`practice-organize.js:137-140`). Renaming object 1 and then selecting it stays on reselect (`practice-organize.test.js:69-71`). Practice select events include `after` (`view-component.js:524`), and `practiceEvent` still runs only while `props.practice` is set (`view-component.js:91-93`).
- Check: name, group, group name, ungroup, split, copy, cross-out, and delete still judge their own committed change. Empty, unchanged, and other-object names stay on naming. A one-member group and an add stay on grouping. An unchanged group name stays. A refused ungroup stays. Split requires the recorded sources’ shape, value, color, alias, and note. Copy requires one duplicate of object 1 with the original unchanged. Cross-out requires object 1 to stay and become `removed: true`. Delete requires that object gone and every other id kept. Confirmed clear is a `clear` event (`view-component.js:742-749`) and does not pass delete; a batch that removes every object stays on delete (`practice-organize.test.js:206-208`).
- Check: goal strings in both locales say grouping is not merging, state the same-shape / same-value / same-name / same-group-or-ungrouped rule, say a gray result is not a mistake and is not a math answer, say split follows recorded sources, say undo can restore a cross-out, and say delete is not clear-all. The 29 new keys match across `locale/en.json` and `locale/zh.json`. `why` is a dictionary key. A miss leaves `practiceGoal_<step>` on screen.
- Check: `createGoal` throws `Invalid organize goal` instead of repairing (`practice-organize.js:111-116`). `skip` returns the prepared frame and does not call `observe`. Practice clear returns before the real draft write. Practice insert does not upload. The replay deep-compares non-practice storage after exit and remount.
- Check: the issue leaves isolation and real-device boxes unchecked. The validation note calls the mounted run a handler replay. Tests were not re-run for this review.

### Strengths
- Check: naming, reselect, peer, group, rename, ungroup, gray merge, split, copy, cross-out, and delete stay separate committed actions. The mounted replay drives the real handlers in `en` and `zh` for both pointer types, including an empty name, a disabled merge, and chapter retry, skip, supplement, and reset.
- Check: the peer regression is exercised through the shared lifecycle, including reset of the prepared start and a following rename that reaches grouping. The legal merge-with-note case and the changed-alias reselect miss are both asserted.
- Check: adjust stays registered beside the new factory, and the bundle test requires the inlined organize factory to match `practice-organize.js`.

### Issues
#### Critical (Must Fix)
None.

#### Important (Should Fix)
None.

#### Minor (Nice to Have)
- `practice-organize.test.js:189-190` — the assertion “deleting is not crossing out” still calls `refuse()`, an unchanged batch. A real delete would fail `practice-organize.js:207-211` because the object is gone. That miss is not what this assertion runs. The previous finding remains.
- `practice-organize.test.js:141-143` — after merging the only pair, no other object exists, so the “split something else” call is skipped and the assertion still passes. The replay only checks that the extra object has no split button. The previous finding remains.
- `practice-organize.test.js:80-92` — the new peer skip starts from a fresh board, so object 2 never holds the saved name before `ready()` runs. The assertion shows that peer preparation does not assign the name. It does not execute the clear at `practice-organize.js:65-69`.
- `docs/tutorial-04-validation.md` and the issue Answer still record the pre-fix focused run as 41/41 and cite `a51fa7f` only. The branch head is `894116d`.

### Assessment
**Task quality:** Approved
**Reasoning:** Skip and reset into peer no longer pre-write object 2’s name, a selection note no longer rejects a merge the model already accepted, and reselect now requires the saved alias. The completion-path case where the student already named object 2 does not satisfy peer, and the remaining gaps are assertion coverage and a stale validation count.
