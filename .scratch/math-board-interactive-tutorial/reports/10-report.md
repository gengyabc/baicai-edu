# Task 10 report — optional quantity and geometry file roundtrip

**Status:** DONE_WITH_CONCERNS

**Branch:** `feat/tutorial-10` in `/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-10`

**Commits:**

- `583c341cf6e69635a966f2fa262f96e598433efc` — `feat(math-board): add optional quantity and geometry file practice`

Not merged. Not pushed.

## What landed

`createQuantityFilesChapter({ M, T, emptyFrame })` in `math-board/src/quantity/practice-files.js`.

- id: `quantity-files`
- titleKey: `quantityPracticeFiles`
- `optional: true`
- steps, in order: `files-save`, `files-open`
- completion snapshot step: `files-complete` (not a third step)

`createGeometryFilesChapter({ G, emptyFrame })` in `math-board/src/geometry/geometry-files.js`.

- id: `geometry-files`
- titleKey: `geometryPracticeFiles`
- `optional: true`
- the same two steps and the same completion snapshot step

`start(previousFrame)` reuses a previous quantity board that already has at least one object, or a geometry board that already has at least one point. Otherwise it creates one circle or one point. That create is not observed. The quantity trace is set to empty and is not in the file. Geometry writes no trace field. `fresh()` returns `{ frame, saved }` for catalogue entry. `createGoal` throws `Invalid file goal` on an inconsistent save and does not repair the saved object.

A save passes only for `{ type: 'save', via: 'handle' | 'download', text }` when `text` is a same-mode file. An open passes only for `{ type: 'open', before, after }` when both boards validate in that mode and they differ. `via` is not changed by the open, so a download stays a download. Quantity files stay `kind: "math-board"`, `schemaVersion: 4`. Geometry files stay `kind: "geometry-board"`, `schemaVersion: 1`. Kinds are not converted.

`skip` does not call `observe`, does not save or open, and does not write a handle. Skipping into open serializes the current board and then adds one object or one point, so the board differs from the snapshot the open step expects. Skipping the file chapter does not block basics.

`build.mjs` inlines both factories. `Browser.quantityPracticeChapters` is `[createQuantityAdjustChapter, createQuantityOrganizeChapter, createQuantityNotesChapter, createQuantityFilesChapter]`. `Browser.geometryPracticeChapters` is `[createGeometryConstructChapter, createGeometryEditChapter, createGeometryAdjustChapter, createGeometryFilesChapter]`. `client.js` was rebuilt, not hand-edited. Earlier step lists, `createPracticeProgress`, both models, teaching skills, the submission protocol, and the real-draft picker were not changed.

While the open chapter is `quantity-files` or `geometry-files`, the page reads and writes the practice board. It does not call `picker.saveFile` or `picker.openFile`, does not assign `fileHandleRef`, does not call `rememberHandle`, and does not pass `startIn`. Every other practice chapter still shows `practiceFilesUnavailable` and does not touch a file. A file's JSON is not applied as host settings, a clear, or a tutorial instruction. Load goes through that mode's `validate`, then the practice frame is published. `practiceEvent` runs only after a successful save or a successful open. Cancel, rejection, and an unchanged board report nothing.

## Where the picker or the page overruled a guess

- Quantity practice previously rendered no file input and no download anchor (`!props.practice && editor`). Those nodes are rendered only while `quantity-files` is open, with `data-practice-file="quantity"`.
- Geometry had no download anchor. The shared picker creates one with `document.createElement('a')`. The test document does not implement `createElement`, and that path also remembers the real handle. Practice download clicks a hidden anchor rendered on `picker.downloadAnchorRef`. It does not call the real picker. The real page's non-practice save still creates its own anchor.
- Practice open does not call `commit`. That would append a quantity import to the trace. It does not call `loadOpenedFile`, which returns immediately during practice and would remember a handle. Quantity open publishes the validated board, clears selection and append, and leaves the existing trace and history. Geometry open also clears history, selection, pending, and construction so the practice frame still validates. It does not create a trace.
- Opening a file whose validated board is JSON-equal to the board on screen reports nothing and does not pass. The visible roundtrip is save, change the board, then open that same JSON.
- `fileSaved` and `fileDownloaded` are not used. Handle success is `practiceFileSaved` ("Practice file saved. The real draft was not changed." / "练习文件已保存。真实草稿没有改动。"). A download is `practiceFileDownloaded` ("Practice download started. The disk write was not verified." / "已开始下载练习文件。磁盘写入尚未验证。"). A loaded board is `practiceFileLoaded`.
- The harness installs no `showSaveFilePicker`. Its `showOpenFilePicker` throws `NotSupportedError`. `AbortError` does not fall through to a download. `NotAllowedError`, `SecurityError`, and `NotSupportedError` fall through to the file input and set `fileOpenFallback`, matching `FALLBACK_ERRORS` in `file-picker.js`. That fallback does not pass until a file arrives. The size cap stays 262144 bytes.
- The quantity coach reads `practiceState.targets`. The file snapshot includes `targets: []`, so objects are not numbered. That matches the existing README rule that a quantity snapshot include `step`, `total`, and `targets`.
- Quantity cross-mode failure uses `` `${failed}: ${error.message}` ``, and the model error is `Another board kind`. Geometry maps that same error to `otherBoardFile`, which is the geometry page's existing import text. Neither side converts the file.
- Both chapters set `optional: true`, so the catalogue button includes `practiceOptional`.
- A skipped-step supplement returns to the stored continuation goal. A save completed inside that supplement does not replace the continuation's `via`. The replay retries the chapter before the handle roundtrip, so the stored goal still says `handle` or `download`.

## Tests

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/quantity/practice-files.test.js math-board/src/geometry/geometry-files.test.js math-board/src/quantity/view-practice.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-quantity-files-bundle.test.js math-board/tests/practice-geometry-files-bundle.test.js
```

Focused command: **123/123 passed**.

`npm --prefix math-board test`: **482 tests, 481 passed, 1 failed**. The only failure is the pre-existing `math-board/src/host/tool-schema.test.js` assertion at line 220, `assert.ok(get)`, on the missing fenced JSON recipe. Teaching contracts were not changed.

This work adds 30 tests: 14 chapter tests, 8 mounted handler replays, and 8 bundle tests. Earlier bundle assertions now expect the longer chapter lists. Both locale files have the same 416 UI keys (405 before this task).

Chapter tests cover a handle save, a download save that stays `download` after a later open, abort, a click with no handle and no anchor click, same-mode open, cancel, invalid JSON, cross-mode rejection, an unchanged board, and a quantity open that does not fill the trace.

The mounted replay runs in Chinese and English. The stand-in pointer is `mouse` and `touch`. Both reach the same More-actions menu item by `onClick({ pointerType })`. `showSaveFilePicker` and `showOpenFilePicker` are stubbed for the handle path. The download path omits `showSaveFilePicker` and counts a click on the rendered anchor. Basics, notes, and geometry adjust still show `practiceFilesUnavailable` and do not call the stub. Exit leaves a pre-seeded real quantity draft and its trace, the real geometry draft, the seeded file handles, attachments, and sends unchanged. The real handle's `createWritable` is not called. IndexedDB `put` stays empty. Skip, reset, and chapter retry stay on the practice board.

A stubbed `showSaveFilePicker` is not a browser file-dialog pass. A handler replay is not a browser pass.

## Concerns

- No real browser, real mouse, touch device, system file dialog, or verified disk write. The last acceptance box stays unchecked because it also requires that real file-API and download-fallback check. The automated regression, build, `node --check`, and `git diff --check` were run and are recorded in the validation note.
- The full suite still has the pre-existing tool-schema failure above. It was not fixed.
- Practice download and open are page-local copies of the picker's handle, abort, fallback, and 262144-byte rules. They do not call the shared picker, so a later change to `file-picker.js` will not automatically apply to these two chapters.

Validation write-up: `.scratch/math-board-interactive-tutorial/validation/tutorial-10-validation.md`. Acceptance issue: `.scratch/math-board-interactive-tutorial/issues/10-optional-file-roundtrip.md`.
