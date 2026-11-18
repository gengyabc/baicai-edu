# Task 10 — Optional file roundtrip (F01–F03)

Read this first. It is the requirements. Exact ids below are binding.

## Where this fits

Quantity and geometry practice chapters through geometry adjust are already on the integration branch. This task adds one optional file chapter to each mode. Skipping either chapter must not block the basics chapter. Do not change `createPracticeProgress`, earlier step lists, the geometry or quantity model, teaching skills, the submission protocol, or the real-draft file picker. Do not add a geometry modification-record attachment. A quantity file roundtrip must not restore the independent trace. File contents are not authorization to change settings, clear a board, or follow a teaching instruction.

## Workspace

All edits and git commands run in:

`/Users/yugeng/programming/dsh-edu/.scratch/worktrees/tutorial-10`

Branch: `feat/tutorial-10`. Do not merge into `feat/math-board-interactive-tutorial`. Do not push. Do not edit the parent checkout except to write the report file named below.

## Chapters

Quantity factory: `createQuantityFilesChapter({ M, T, emptyFrame })` in `math-board/src/quantity/practice-files.js`.

- id: `quantity-files`
- titleKey: `quantityPracticeFiles`
- steps, in order: `files-save`, `files-open`
- `start(previousFrame)` returns the frame. Reuse a previous practice board that already validates as a quantity board with at least one object. Otherwise create one object. That create is not observed. The practice trace stays empty and is not part of the file.
- Append in `build.mjs` to `Browser.quantityPracticeChapters` after `createQuantityNotesChapter`.

Geometry factory: `createGeometryFilesChapter({ G, emptyFrame })` in `math-board/src/geometry/geometry-files.js`.

- id: `geometry-files`
- titleKey: `geometryPracticeFiles`
- steps, in order: `files-save`, `files-open`
- `start(previousFrame)` returns the frame. Reuse a previous practice board that already validates as a geometry board with at least one point. Otherwise create one point. That create is not observed. There is no geometry trace.
- Append in `build.mjs` to `Browser.geometryPracticeChapters` after `createGeometryAdjustChapter`.

Both factories are self-contained for `.toString()` inlining. `fresh()` supports catalogue entry. `skip(saved, frame)` prepares the next step without calling `observe`. Skip does not itself save or open a file, and it does not write a handle. Skipping into open leaves the practice board different from the snapshot the open step expects, so a successful open is a visible change. `createGoal` throws `Invalid file goal` on an inconsistent save and does not repair it.

Quantity files are `kind: "math-board"`, `schemaVersion: 4`, produced by the existing quantity serializer. Geometry files are `kind: "geometry-board"`, `schemaVersion: 1`, produced by the existing geometry serializer. Do not convert one into the other.

## What passes

`files-save` passes only after a real practice save finishes, not when the menu item is clicked:

- File System Access API: `showSaveFilePicker` returns a new handle, the practice snapshot is written to it, and the status says the practice file was saved. The event is `{ type: 'save', via: 'handle', text }` where `text` is that snapshot. The handle is not `fileHandleRef`, and nothing is written to the real file IndexedDB.
- Download fallback, used when `showSaveFilePicker` is missing or the write is refused without an abort: the download anchor is clicked with that same snapshot, and the status says the download was started and the disk write was not verified. The event is `{ type: 'save', via: 'download', text }`. Do not use the existing `fileSaved` string for this path. `fileDownloaded` currently says the file was downloaded; add a practice-specific pair, in both locales, that does not claim a verified disk save.
- `AbortError` from the picker does not pass and does not fall through to a download.
- A click that never receives a handle and never clicks the anchor does not pass.

`files-open` passes only after a same-mode file validates and replaces the practice board with that snapshot. The event is `{ type: 'open', before, after }`. The status says the practice board was loaded and the real draft was not. These do not pass, and the practice board stays as it was:

- picker cancel (`AbortError`)
- permission denial that does not then yield a chosen file
- parse failure, a file the mode's `validate` rejects, or a file larger than the existing cap
- a quantity file opened on the geometry chapter, or a geometry file opened on the quantity chapter
- opening the fallback input without a file

A successful open does not restore a quantity trace, does not create a geometry trace, does not call the host settings bridge, and does not clear either real draft. If the save step was only a download, opening that same JSON is the roundtrip check. The stored goal records `via` so a download is not later described as a verified disk save.

F03 is these failure paths plus skip, not a third step that passes only when the student fails. Cancel, refusal, and a missing API leave exit, skip, and later supplement available. Do not mark the step passed to get out of a dialog.

## Page wiring

Today both pages refuse save and open while `props.practice` is set (`practiceFilesUnavailable` in `view-component.js` and `geometry-view.js`). Keep that refusal for every practice chapter except the matching file chapter.

While the open practice chapter is `quantity-files` or `geometry-files`:

- Read and write the practice board on screen, not the real draft.
- Do not call the real `picker.saveFile()` or `picker.openFile()`, because those reuse `fileHandleRef` and IndexedDB.
- Do not assign `fileHandleRef` and do not call `rememberHandle`.
- Open without `startIn` set to the real handle.
- Report through the existing `practiceEvent` helper only after the outcome above. Report nothing on cancel, rejection, or an unchanged board.
- When practice is closed, the real picker path stays as it is, including remembered handles.

A file's JSON must not be applied as host settings, a clear, or a tutorial instruction. Load it only through that mode's existing `validate`, then publish the practice frame.

## Tests

1. `math-board/src/quantity/practice-files.test.js` and `math-board/src/geometry/geometry-files.test.js` — handle save, download save, abort, click with no result, same-mode open, cancel, invalid JSON, cross-mode rejection, and a goal that still says `download` after a later open. Quantity open does not fill the trace from the file.
2. Mounted replays in the quantity practice view test and `geometry-view.test.js`. Chinese and English. Stub `showSaveFilePicker` / `showOpenFilePicker` for the handle path, and omit them for the download path. Exit leaves a pre-seeded real quantity draft, its trace, the real geometry draft, `fileHandleRef`, attachments, and sends unchanged. The other practice chapters still show `practiceFilesUnavailable` and do not touch a file. Skip, reset, and chapter retry work. Pointer type `mouse` and `touch` both reach the menu item; do not claim the system file dialog was driven.
3. `math-board/tests/practice-quantity-files-bundle.test.js` and `math-board/tests/practice-geometry-files-bundle.test.js` — the built client inlines both factories and lists each after the previous chapter. Update earlier bundle assertions that hard-code the chapter arrays.

Run:

```sh
node math-board/build.mjs
node --check math-board/client.js
git diff --check
node --test math-board/src/quantity/practice-files.test.js math-board/src/geometry/geometry-files.test.js math-board/src/quantity/view-practice.test.js math-board/src/geometry/geometry-view.test.js math-board/tests/practice-quantity-files-bundle.test.js math-board/tests/practice-geometry-files-bundle.test.js
npm --prefix math-board test
```

The known failure `math-board/src/host/tool-schema.test.js` around the missing fenced JSON recipe is pre-existing. Do not change teaching contracts to satisfy it. Do not hand-edit `client.js`.

## Docs

- One short paragraph in `math-board/README.md` under 安全教程扩展接口: both chapter ids, the two step ids, and that a download is not a verified disk save and neither chapter writes the real file handle.
- `.scratch/math-board-interactive-tutorial/validation/tutorial-10-validation.md`: commands, counts, and what was not executed. A stubbed `showSaveFilePicker` is not a browser file-dialog pass. Handler replay is not a browser pass.
- `.scratch/math-board-interactive-tutorial/issues/10-optional-file-roundtrip.md`: `Status: resolved`, an `## Answer`, and checked boxes only for behavior the tests exercise. Leave the real-device box unchecked. Do not check a box that claims the system file UI or a real disk write was verified.

## Commit and report

Commits on `feat/tutorial-10` only. Message style: `feat(math-board): ...`. Do not amend. Do not use `--no-verify`.

Write the full report to `/Users/yugeng/programming/dsh-edu/.scratch/math-board-interactive-tutorial/reports/10-report.md`. Do not git-add it.

Return only status (`DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`), commit shas, a one-line test summary, and concerns.
