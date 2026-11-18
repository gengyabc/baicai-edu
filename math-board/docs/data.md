# Data, snapshots and change records

[English](data.md) | [中文](data.zh.md)

## Quantity board snapshots

`kind: "math-board", schemaVersion: 4`:

```
settings: { levels: [{value, color}], defaults: [{shape, value, alias}], shapes: [shape] }
objects:  [{ id, shape, value, color, alias, note, x, y, groupId, removed, sources }]
groups:   [{ id, alias, note }]
notes:    [{ id, text, objectIds }]    // notes aimed at one multi-select set
note:     the board's ordinary note
summary:  deterministic quantity summary (not a right/wrong verdict)
```

`settings.defaults` covers all 20 shapes, and defaults are not lost when a shape is collapsed; `settings.shapes` is the order of shapes currently shown in the shape rail (at least one). Each shape and each group may carry one `note`; `notes` stores only set notes for two or more concrete objects, and when any target object is deleted or merged, that set note becomes invalid or transfers to the merge result. Undo and redo also cover these notes. The board draft and the change records exist only in browser local storage, isolated per DSH session, and survive a page refresh, closing the workbench or closing the browser and reopening it; only when "Put into answer" (「放入回答」) is clicked is the read-only snapshot, together with the change records the student ticked, uploaded as an attachment to the local Host. Coordinates do not imply an arithmetic expression. For the geometry snapshot format see [geometry mode](geometry.md), and for module responsibilities see [development and installation](development.md).

## Put into answer

"Put into answer" places the complete JSON into the draft as the `我的画板.json` file attachment, and does not write the shape, group or crossed-out lists into the input box. Words the student has written in "I want to say" (「我想说」) are placed in verbatim. The canvas and the change records are both kept, so the student can fix mistakes on the same board and put it in again. The attachment is a read-only exact snapshot; the model reads it and then responds, does not repeat the lists back to the student, and does not string the change records from earlier messages into one overall process. The attachment is uploaded to the local Host when "Put into answer" is clicked, but does not enter the conversation until the student sends it themselves; the student can withdraw it like an ordinary attachment. Only clicking "Clear" clears the canvas and the local change records at the same time; attachments already put in or sent are not deleted, and clearing cannot be undone.

## Version migration

Old `schemaVersion: 1`, `2` and `3` JSON migrates automatically to v4: v1 keeps circle, square and triangle, v2 keeps the original ten shapes and fills in default values for the new shapes, v3 gives shapes and groups empty notes and empty multi-select notes; the browser draft is read from the v3/v2 storage key and written back to the new v4 storage key. For details see [teaching protocol](<../../math-primary-low/skills/math-low-core/references/structured-drawing.md>).

## Saving and opening files

When saving and opening JSON, browsers that support the File System Access API remember the last used file; saving again prefers to write back to the same file, and opening also prefers to start from that location. When the browser refuses or the environment does not support it, it falls back to ordinary download and file selection, and says so in the interface.

## Independent change records

`kind: "math-board-trace", schemaVersion: 1` is an optional change-record attachment, not a new version of the snapshot. Saving/opening the snapshot still only round-trips v4 data: it neither exports records nor restores records from an imported file; an import marks the earlier process as unknown, so an import change is left only when the board actually changes because of it. For why the two are separate see [ADR-0001](<../../docs/adr/0001-math-shared-contracts.md>).

- **Attempt boundary**: records accumulate after the last "Clear canvas" (「清空画布」); putting into answer does not interrupt the records, so the student can keep fixing mistakes. When an old draft has no history it is marked `priorUnknown`, and the absence must not be described as "the student made no changes". Clicking "Clear canvas" clears the canvas and the local change records together, and undo cannot go back to before the clearing; attachments already put in or sent are not deleted, and a new process starts from an empty board. The interface no longer offers separate "clear records" or "start a new attempt" entries; the boundary of the records is clearing the canvas.
- **Recorded content**: user-visible semantic changes are recorded in the order they happen, including adding, deleting, renaming, grouping, merging/splitting, crossing out, student notes (whole board, shape, group or multi-select), undo/redo, clearing, imports that change the board as a result, and host settings changes; student and system origins are distinguished, and settings synced by the system cannot count as student actions. Interface actions such as selecting and hovering are not semantic facts; coordinates and timestamps are not recorded, and pauses, intent or proficiency are not inferred from them.
- **Bounded retention**: only consecutive identical facts are collapsed; different changes or repetitions separated in time are not merged into one entry. The cap is 60 entries; beyond that the earliest 20 and the most recent 30 are kept, with the number of omitted actions clearly marked instead of implying a complete history. The separate attachment cap is 64 KB, separate from the snapshot size limit; when unavailable it does not prevent submitting the snapshot alone. When one record write fails, existing facts are kept, the process after it is marked unknown, and the board itself still saves as usual.
- **Visible submission**: the interface ticks the attached records by default but the tick can be removed; the tick box is under "More actions" (「更多操作」). Records enter the conversation only with a message the student sends themselves, and the student can also delete them separately in the attachment bar; sent attachments are kept with the conversation and are not temporary items that vanish once read. No separate permanent behaviour record is created, and change counts are not written to the student profile.
- **Reading on demand**: the AI normally reads only the snapshot; it reads the records only when the student is stuck, explicitly asks to look back, or the materials are inconsistent. It uses only this one record attached to the current message, and does not connect the records from earlier messages. A new learning session does not use the previous session's sent board or the quantity differences in it; when this session has no sent snapshot, the board is not discussed on that basis. Records provide only observable facts, at most one clarifying question may be asked from them, and no automatic diagnosis or mastery verdict is made; a history state that differs from the final state is usually just an edit. Omitted or unknown history stays unknown; when records are missing or unavailable, go back to the snapshot, and when quantity meaning or relations are genuinely missing, ask the student rather than inventing an explanation.
