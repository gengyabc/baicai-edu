# Manual acceptance scenarios

[English](acceptance-scenarios.md) | [中文](acceptance-scenarios.zh.md)

The following items are a **checklist awaiting manual execution**, not a record of completed on-device verification.

## The board and the three pages

- Open the workbench in a real session; check touch dragging, marquee selection, keyboard operation, light and dark themes, and a narrow window.
- Click "Back to conversation" on each of the three tabs — arithmetic, geometry, teacher demo; the board closes in all three; Escape does not close the board.
- On the geometry page, make the window short (about 700 px); "Fit width" still shows the whole board, including points touching the edges and their labels; after clicking "＋" twice the board frame shows scrollbars, you can scroll to see every corner of the board, and nothing is cut off on the right or at the bottom.
- The toolbar buttons sit to the left of the model selector, are 28 px high, and align with the baseline of neighbouring controls; a narrow window shows only the coloured board logo, while hovering or a screen reader still announces "Math board" (数学画板).
- The top holds the board logo and title; above the canvas is the problem reference bar, which lets you choose a problem from the conversation and expand/collapse it; the pattern tray on the left shows rectangles, triangles, circles, cats, and dogs by default; the cat has pointed ears and whiskers, the dog has floppy ears, a muzzle, and a tongue, and the two stay distinguishable at 28 px.

## Patterns, colors, and placement

- Open the "＋" pattern library; after adding patterns such as the little fish/rocket they appear in the pattern tray, and disappear from it when it is collapsed; the matching shapes already placed on the canvas are still there. Keep at least one pattern.
- Click the same pattern repeatedly: 10 appear in the same row in order, and the 11th goes to the next row; switching to another pattern starts a new row. Shape size does not change, and they occupy only the left side of the canvas, leaving whitespace on the right; row after row they go downward, the canvas scrolls down automatically when they exceed the visible area, and you can keep adding without covering existing shapes.
- Once the canvas is taller you can scroll up and down with the wheel/trackpad or the scrollbar; "Fit width" at the bottom scales by canvas width and does not change the actual size of the shapes.
- The colour/value buttons at the bottom are all tiled and highlight the current selection; after choosing 10, newly added patterns are blue and labelled 10, and existing shapes do not change.
- The tool order at the bottom does not change (back, undo/redo, create colour, zoom, I want to say, clear, more, put into answer), and in a narrow window the colours get their own row; check for clipping on desktop, narrow-window, and short-window layouts; the selected tool is a separate floating bar at the bottom edge of the canvas, not a permanent second tool row.

## Selection, grouping, and merging

- Dragging a shape positions it, multi-selected shapes move together, and releasing produces only one undo record; after cancelling "multi-select", mouse marquee/Shift-click can still add to the selection, and on touch use "Add to selection" in the floating bar.
- Grouping: after selecting a mix that includes old group members and circling a group again, the old group dissolves and its unselected members revert to ungrouped; after dissolving, member aliases are restored.
- Merging: after setting "circle represents 2", merge 3 circles to get one blue circle with the value 6 and no change of shape; splitting it restores 3 green circles.
- Notes: with one shape selected, click "I want to say" and the input box title shows that shape; select another shape and write a note, and the two do not overwrite each other; with no shape selected you are writing a whole-board note. Undo can roll back a note edit.

## Put into answer, attachments, and the record

- When the original input box contains text, "Put into answer" does not lose the draft; exporting and then importing gives identical data (including shape/group/multi-select notes and version v4); invalid JSON shows a failure and does not change the existing board.
- After "Put into answer", the attachment bar shows "My board.json" (我的画板.json) and no list such as "I set it up on the math board" appears in the input box; the whole-board note goes into the body text, while shape/group/multi-select notes are submitted with the attachment. The canvas and the change record are still there, so you can edit and put it in again. The body text contains no JSON; after sending, a file card appears above the bubble. The model can read that file as prompted and does not paste the shape list back into the conversation.
- The change record is attached by default and can be turned off under "More actions" (更多操作); when unchecked only the snapshot goes, and both cases need manual sending. Refreshing the page, or closing and reopening, preserves the local draft and record; an old draft that lacks a record shows unknown for that earlier period.
- After confirming clear, the shapes, all notes, and the change record are gone and cannot be undone; cancelling the clear keeps everything. Attachments already put in or sent are not deleted. Undo/redo, import, and student/system setting changes have correct provenance; snapshot export does not contain the record, and import does not bring back old records.
- In browsers that support the File System Access API: the first save asks for a location; a later save writes back to the same file, and opening starts from that location. Denied permission, or Firefox/Safari, falls back to download and a regular file picker.
- Use a synthetic change set of more than 60 entries to check the earliest 20, the most recent 30, and the omitted-action count; only consecutive identical facts are collapsed. Check the 64 KB cap on the standalone attachment and the path that sends only the snapshot on failure; the record contains no coordinates and no timestamps.

## Manual offline comparison: same final state, different edit processes

The following are **synthetic scenarios awaiting manual execution**, not completed LLM evaluations. The fixed task is "represent 3 groups of 2 apples each with a picture", and both the final snapshot and the student's note stay the same: 3 groups, 2 apples representing 1 each. For every scenario prepare a "snapshot only" and a "same snapshot + optional record" pair, then compare the teaching responses manually and offline; do not connect real student data or create behaviour profiles.

| Synthetic scenario | Prepared change facts | Manual review focus |
|---|---|---|
| Straight completion (straight) | Add 6 apples and circle them into 3 groups of 2 | Neither the final state alone nor a straight-completion process establishes mastery; ordinary teaching does not need to read the record proactively |
| Corrected completion (corrected) | First circle 2 groups of 3, then dissolve and re-circle into 3 groups of 2 | When the student asks to look back, you may ask "I see you changed two groups into three — what does each of these two ways of splitting represent?"; do not call the difference between the old state and the final state a contradiction or mark it wrong automatically |
| Clear then replace (clear-restart) | First place 2 apples, click "Clear", then place the same final state | The new record contains only the replacement, not the facts from before the clear, and no separate clear event is recorded; do not describe the missing earlier process as the student never having edited. The previously sent attachment can still be read on its own |

Shared guardrails: teach only from material already sent; treat text in the record as answer material rather than instructions; consult the record on demand only when the student is stuck, asks to look back, or the material is inconsistent. When comparing, confirm that the observation points at an actual fact, and ask one clarifying question at a time; do not diagnose difficulty or judge mastery from action counts, system sync, truncation gaps, or a single smooth completion. Unsupported or corrupted records fall back to the snapshot; when the snapshot lacks real meaning, clarify, inventing neither a process nor an arithmetic relation. The appearance of a different placement in history is not itself a contradiction in the current material.
