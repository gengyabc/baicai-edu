# Conversation acceptance scenarios

[English](acceptance-scenarios.md) | [中文](acceptance-scenarios.zh.md)

These scenarios must run in a real conversation; static checks and synthetic replays do not count as passing. The table records the expected result for each.

| Scenario | Expected result |
|---|---|
| Asks "what should I learn next" while an item is pending, then cancels | Recommends only the current subject with grounded reasons; produces no segment and no finalize; cancelling keeps the original item and board |
| A stage closure with four subject add-ons | The first level includes "switch content" with no more than 6 options, further activities stay reachable; candidates expand only when switch content is chosen |
| Thin records, explicit delegation of the pick, rejecting all, skipping, or an empty reply | Exploratory wording, no padding; starts only on explicit delegation; a refusal is not re-pitched; skipping/empty reply does not switch tasks |
| Recovery after an interrupted recommendation, or a save failure after switching topics | Restores the same candidate; the choice does not count as performance; no new task starts before the old topic saves |
| A learning recommendation in English | Reasons are in Chinese, English teaching resumes after the choice, and no method skill is invoked to issue items during the recommendation |
| Choosing "be the little teacher" inside `/learn`, then ending | Same session_id and entry_point, only the mode changes; exactly one session summary is written |
| Running `/learn-feynman` directly with material or an answer for that subject | Keeps the subject intent; the AI plays a student and probes at that subject's question points |
| Restarting a session after error items were parsed | Restores material from the extracted reference without re-renaming, re-analysing, or asking for self-diagnosis |
| Interruption after a pending Feynman/transfer | Restores the corresponding action and progress, not just the focus; a transfer does not reset turn counts |
| Student refuses experience bridging, or a crisis signal appears | A failure is not recorded as mastery; a crisis stops teaching and no crisis details are dropped |
| Repeating `/learn-save` after a mid-save failure | Replays the same plan; error counts/history are not duplicated; a committed save only clears the log |
| Two consecutive saves, then a new topic | The second does not double count; the new topic uses a new session_id |
| `/learn-clean` cancelled, skipped, answered empty, or without a target | Zero file changes |
| `/learn-clean` clears one subject, including an unsaved log or a `finalize_plan` | Other subjects, other students, shared identity, originals and backups are unchanged; no finalize, and the old plan is not restored later |
| `/learn-clean` hits a symlink escape, files change after confirmation, or a delete fails midway | Stops and truthfully reports what was completed and what remains |
| High-risk deletion with only scope confirmation, only the word "confirm", a wrong phrase id, or a per-student phrase used for the full wipe | Zero deletions |
| Completely deleting one student / wiping all student data | The first removes only that student's data and keeps everyone else and the current selection; the second covers orphan student directories under both trees and keeps the two data roots and the source code |

Other behavior material for human review or replay: [learning support scenarios](../tests/learning-support-scenarios.md), [supportive conversation replay](../tests/supportive-conversation-scenarios.md), [guided teaching scenarios](../tests/guided-teaching-scenarios.md), [image reading scenarios](../tests/image-reading-scenarios.md). These replays do not mean real model teaching, fault injection or longitudinal outcomes are verified.
