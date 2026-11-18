# Interface and interaction (quantity page)

[English](interface.md) | [中文](interface.zh.md)

The interface puts the canvas first: the board logo and title at the top, a narrow pattern rail down the left, an expandable problem reference above the large white canvas in the middle, and fixed tools at the bottom; operations such as naming, grouping and merging after a selection appear in a separate floating bar along the lower edge of the canvas and no longer take up the right column. Talking with the teacher still goes through the DSH conversation.

## Pattern rail and canvas

The left pattern rail holds only rectangle, triangle, circle, cat and dog by default. Clicking a pattern adds it directly: the same pattern is laid out along a row from left to right, and after 10 it moves to the next row; clicking a different pattern starts a new row. Shapes keep their original size and sit close together, occupying only the left side of the canvas and leaving the right side blank; the canvas extends downward, and when a new shape lands outside the visible area the canvas scrolls automatically so that it, along with the number drawn above it and the name below it, can be seen. A blank band as wide as the left margin is left along the top edge of the paper, so that the numbers and sticky notes drawn above the first row of shapes are not cut off by the upper edge of the canvas. You can also drag a pattern to a specific position on the canvas, and a dropped position is not bound by this default placement. The "＋" at the end opens the pattern library; the library still contains all 20 patterns, one tap adds a pattern to the pattern rail and another tap puts it away.

## Problem reference above the canvas

The top of the canvas directly shows the most recent completed teacher message in the currently loaded conversation; it shows no "Problem reference" title and does not include student messages; it is not automatic problem recognition or rewriting. The message selector and expand/collapse sit to the right of the text and do not take up a title row of their own; an earlier teacher message can be pinned, at most 3 lines are shown by default and at most 5 lines after expanding, and further content is viewed by scrolling inside the body area; when showing, only blank lines are removed, line breaks between non-blank lines and the Markdown structure are kept, the original message is not changed, and formulas use the host's Markdown rendering. Only visible, completed teacher body text is read, not the reasoning process, tool arguments, attachment contents or input draft; when there is no teacher message it shows an empty state. The reference text and the selected message do not enter the board JSON, the edit history or the answer attachment, and do not trigger a clear.

## Creating colors

The "Create colors" buttons are tiled at the bottom; on a narrow screen the colors take a row of their own, and with many levels they can scroll horizontally: colors share the existing 1, 10, 100, 1000, 10000 ladder with values. After choosing a level, patterns added afterwards represent that value and use that level's color; switching color does not change existing shapes.

## Selecting and dragging

Single click selects; clicking a shape in a group selects the whole group. Shift-click adds or removes a single shape; on touch, after selecting you can tap "Add to selection"（追加选择）and add or remove one by one, then tap "Done selecting". A marquee selects only the shapes it covers; dragging an already selected shape moves them together. A drag shows only a preview, and the move is recorded in history in one go on release; a single click creates no undo record.

## Floating bar after selection

After shapes are selected, a separate floating bar along the lower edge of the canvas offers naming, grouping into a group / ungrouping, merging, splitting, copying, crossing out, adding to the selection and deleting. Naming and crossing out are only in the floating bar and are not pinned in a side column; crossing out only crosses out, and a mistake can be fixed with the global undo. Clearing the canvas is in the bottom toolbar and deleting the selection is in the floating bar; the two differ in icon and in scope.

## Bottom toolbar

Undo/redo, zoom and "Fit width" are on the right side of the bottom toolbar; when the canvas content grows taller it can be scrolled up and down; the bottom also offers "I want to say"（我想说）, more operations and "Put into answer"（放入回答）. There is no permanent "multi-select" or "canvas only" button.

## Keyboard

Tab focuses a shape, Enter/space selects, Shift+Enter adds or removes a single shape (this also works in add-to-selection mode), the arrow keys move, Delete deletes, Esc leaves add-to-selection.

## Grouping rules

Grouping is a flat "squad formation" with no sub-groups:

- Select any shapes and tap "Group into one": if some of them already belong to another group, those old groups are dissolved as a whole, the old members that were not selected return to ungrouped, and then a new group is formed.
- Clicking any one shape in a group selects the whole group; Shift-click can add other shapes to the selection, or remove one from the whole group, and tapping "Group into one" then merges them into a new group. Old members that were not selected return to ungrouped.
- "Ungroup" turns all members back into independent shapes; the group name can be changed; after ungrouping, members get their own aliases back. When the last shape of a group is deleted, the group disappears as well and no longer counts against the limit of 12 groups.
- The whole action is a single undo step.

## Merging rules

Merging **only changes value and color, not the shape**: 3 green circles "representing 2" merge into 1 blue circle with value 6, the name is unchanged, the merge source is recorded, and "Split" can restore it.

- Only shapes of the same shape, the same value, in the same group (or all ungrouped) and with the same alias can merge. When the total is exactly one level, that level's color is used; otherwise they still merge into the original pattern, the value is the exact total, and a separate gray is used for the color.
- There is no need to add a level for the total first. Gray means this number is not on the value ladder.
- A merge result carries a corner badge showing how many shapes it was merged from; splitting restores the shapes, values, colors, names and notes of the direct merge sources, nested merges are restored layer by layer and are not recalculated against the current ladder. Native shapes with no merge source can still be split into lower levels.
- Splitting removes multi-selection notes that point at the original merged object, multi-selection notes of other objects are kept, and the source objects' original notes are restored.

## Preset values, colors and the pattern library

The interface no longer offers an editing entry for values, colors or "how much each pattern represents by default"; the student only chooses a creation color from the fixed 1, 10, 100, 1000, 10000 ladder. The value is always marked in the small white corner badge at the lower right of a shape and does not cover the pattern itself; identification never relies on color alone, and the same value uses the same color.

- The default ladder is 1, 10, 100, 1000, 10000, corresponding to a fixed palette (green, blue, purple, cyan, orange). The board interface cannot add, remove or rewrite these levels.
- The pattern library can still be opened from "＋" on the left to add or put away patterns; a pattern that has been put away keeps its own default name, and shapes already on the canvas do not disappear.
- Merged shapes keep the value and color they had when merged; an unmerged shape whose value is still on a level keeps using that level's color.
- The default pattern rail is rectangle, triangle, circle, cat and dog; the remaining patterns are added through the pattern library.
- The host can still sync the session-level levels/defaults/pattern list through `math_board_settings` (for example according to a meaning the student has explicitly stated); the client replays them from the projection history and keeps each entry's `future`/`existing` scope. This entry no longer corresponds to a settings panel inside the board. After a host sync, new shapes first use each pattern's defaults, and the pattern rail preview and tooltips show them in sync; when the student later chooses a creation color on their own, that choice takes precedence until the next host sync.

## The student's path

1. `/learn addition and subtraction` (other topics work too), then click "Math board" beside the model selector in the input box toolbar.
2. Pick patterns from the left pattern rail by clicking or dragging; tap "＋" when you need more patterns and enter the pattern library; drag, marquee and Shift-select until the canvas looks the way you want to say it. On touch you can select first and then tap "Add to selection".
3. After selecting, group, give names, cross out, or merge same-shape same-value shapes into a larger level. Naming and crossing out are both in the floating bar, not in a side column.
4. Tap the "I want to say" bubble at the bottom: when there is a selected object, the note is linked to that shape, the whole group or this multi-selection; when nothing is selected, what you write is an ordinary note for the whole board. Switching the selection does not overwrite what was written before.
5. Tap "Put into answer" to return to the conversation: the board data goes into the "My board.json"（我的画板.json） attachment, and the input box gets no shape list; an ordinary note for the whole board is put in as it is, and shape/group/multi-selection notes are submitted together with the board JSON. The separate record attachment is checked by default and can be unchecked under "More operations"; without checking it the snapshot can still be submitted normally. The canvas and the edit history are both kept, so the student can keep fixing mistakes and put it in again. After checking the body text and the attachments, send it **yourself**; inserting is not sending. To redo by hand, tap "Clear canvas"（清空画布）, and the shapes, all notes and the edit history are wiped together. Before lower-primary math teaching actually enters a new task that does not carry over the old board, an automatic clear request is also recorded; there is no need to confirm by clicking each time.

Submission boundaries and attachment details are in [Data and submission](data.md); the automatic clear rules are in [Task-switch clearing](clearing.md).
