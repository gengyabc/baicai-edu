# Task 10: optional file-roundtrip validation

Validated on branch `feat/tutorial-10`. Only the quantity and geometry file chapters were added. Earlier step lists, `createPracticeProgress`, the quantity and geometry models, teaching skills, the submission protocol, and the real-draft file picker were not changed. A quantity file does not restore the independent trace. No geometry modification-record attachment was added.

## Delivered

- [practice-files.js](<../src/quantity/practice-files.js>): `createQuantityFilesChapter({ M, T, emptyFrame })`. Chapter id `quantity-files`, title `quantityPracticeFiles`, `optional: true`. Steps: `files-save`, `files-open`. The completion snapshot step is `files-complete`. A save passes only for `{ type: 'save', via: 'handle' | 'download', text }` whose text is a quantity file. An open passes only when the validated before and after boards differ. `via` stays `download` after that open. The trace is emptied at start and is not part of the file.
- [geometry-files.js](<../src/geometry/geometry-files.js>): `createGeometryFilesChapter({ G, emptyFrame })`. Chapter id `geometry-files`, title `geometryPracticeFiles`, `optional: true`. The same two steps. Geometry files are `kind: "geometry-board"`, `schemaVersion: 1`. No trace field is written.
- [view-component.js](<../src/quantity/view-component.js>) and [geometry-view.js](<../src/geometry/geometry-view.js>): every other practice chapter still shows `practiceFilesUnavailable` and does not touch a file. While the open chapter is the matching file chapter, save and open read and write the practice board. They do not call `picker.saveFile` or `picker.openFile`, do not assign `fileHandleRef`, do not call `rememberHandle`, and do not pass `startIn`. `AbortError` returns with no download and no event. A missing handle, or an anchor whose `click` is not a function, does not pass. `NotAllowedError`, `SecurityError`, and `NotSupportedError` fall through to the file input and do not pass until a file arrives. A file larger than 262144 bytes, invalid JSON, a cross-mode file, an empty fallback input, and a board that does not change all leave the practice board and the step as they are.
- Bilingual copy. Handle success is `practiceFileSaved`. A download is `practiceFileDownloaded` and does not claim a verified disk write. A loaded practice board is `practiceFileLoaded`. `fileSaved` and `fileDownloaded` are not used for these chapters. The built client lists `createQuantityFilesChapter` after `createQuantityNotesChapter` and `createGeometryFilesChapter` after `createGeometryAdjustChapter`.

## Picker and page differences

- Quantity practice previously rendered no file input and no download anchor (`!props.practice && editor`). Those nodes are rendered only on `quantity-files`, with `data-practice-file="quantity"`.
- Geometry had no download anchor. The shared picker creates one with `document.createElement('a')`, which this test document does not implement, and that path also remembers the real handle. Practice download clicks a hidden anchor on `picker.downloadAnchorRef` and does not call the real picker.
- Practice open does not call `commit`. That would record a quantity import on the trace. It does not call `loadOpenedFile`, which returns immediately during practice and would remember a handle. Quantity open publishes the validated board, clears selection and append, and leaves the existing trace and history. Geometry open also clears history, selection, pending, and construction so the practice frame still validates. It does not create a trace.
- Opening a file whose validated board is JSON-equal to the board on screen reports nothing and does not pass. The visible roundtrip is save, change the board, then open that same JSON.
- The quantity coach reads `targets`. The file snapshot includes `targets: []`, so objects are not numbered. That matches the existing requirement that a quantity snapshot include `targets`.
- Quantity cross-mode failure uses `` `${failed}: ${error.message}` `` (`Another board kind`). Geometry maps that same model error to `otherBoardFile`. Neither converts the file.
- A skipped-step supplement returns to the stored continuation goal. A save finished inside that supplement does not replace the continuation's `via`. The replay retries the chapter before the handle roundtrip, so the stored goal still says `handle` or `download`.
- Both chapters set `optional: true`. The catalogue label includes `practiceOptional`. `files-complete` is the snapshot step after the two real steps, not a third step.

## Executed

- `node math-board/build.mjs`: client rebuilt. `node --check math-board/client.js`: passed. `git diff --check`: passed.
- Focused command, **123/123 passed**:

  ```sh
  node --test math-board/src/quantity/practice-files.test.js math-board/src/geometry/geometry-files.test.js math-board/src/quantity/view-practice.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-quantity-files-bundle.test.js math-board/tests/practice-geometry-files-bundle.test.js
  ```

- `npm --prefix math-board test`: **482 tests, 481 passed, 1 failed**. The only failure is the pre-existing [tool-schema.test.js](<../src/host/tool-schema.test.js>) assertion at line 220 (`assert.ok(get)` on the shared-skill fenced JSON recipe). Teaching contracts were not changed. This work adds 30 tests: 14 chapter tests, 8 handler replays, and 8 bundle tests. Both locale files have the same 416 UI keys (405 before this task).

## Operation-goal replay (not a browser pass)

[practice-files.test.js](<../src/quantity/practice-files.test.js>) and [geometry-files.test.js](<../src/geometry/geometry-files.test.js>) drive the goals directly. A handle save stores `via: 'handle'` and the snapshot text. A download save stays `via: 'download'` after a later same-mode open. `AbortError`, a click with no handle and no anchor click, invalid JSON, a cross-mode file, picker cancel, and an unchanged board do not pass. `start` reuses a valid previous board and otherwise creates one circle or one point. That create is not observed. The quantity trace stays empty. `createGoal` throws `Invalid file goal` and does not repair the saved object. `skip` does not call `observe`, does not write a handle, and leaves the board different from the snapshot the open step expects. Skipping the file chapter does not block a stub basics chapter.

[view-practice.test.js](<../src/quantity/view-practice.test.js>) and [geometry-view.test.js](<../src/geometry/geometry-view.test.js>) replay the mounted editor in Chinese and English. The stand-in pointer is reported as `mouse` and `touch`. Both reach the same More-actions menu item. The tests stub `showSaveFilePicker` and `showOpenFilePicker` for the handle path and omit `showSaveFilePicker` for the download path. They do not drive a system file dialog. Basics, notes, and geometry adjust still show `practiceFilesUnavailable` and do not call the stubbed picker. Exit leaves a pre-seeded real quantity draft and its trace, the real geometry draft, the seeded file handles, attachments, and sends unchanged. The real handle's `createWritable` is not called, and IndexedDB `put` stays empty. Skip, reset, and chapter retry stay on the practice board.

## Unexecuted / limits

No real browser, real mouse, touch device, system file dialog, or verified disk write. A stubbed `showSaveFilePicker` is not a browser file-dialog pass. A handler replay is not a browser pass. The known tool-schema failure was not investigated beyond confirming it is the pre-existing fenced-JSON assertion.
