---
name: spaced-retrieval
description: Spaced retrieval. Load when exposure records exist and old vocabulary or expressions need recall without looking; prioritize review from the records.
user-invocable: false
---
# Spaced Retrieval Practice
## Principle
Retrieving language after delays with feedback can strengthen retention. Adapt intervals to evidence; there is no universal perfect schedule.
## Variables
age, previous_items, last_practiced, recall_results, hint_history, session_time, preferred_activity, modalities, review_interval.

Follow the “Method skills” contract in `english-core`.

## Procedure
1. Select a few expressions from the actual supplied history or this session. With no such evidence, suggest a new learning activity to session rather than inventing earlier practice.
2. Prompt recall in a new meaningful context before showing the target expression. Read `english-core`'s `references/english-input-adaptation.md` for new prompt material.
3. Wait for the attempt; feedback follows its `references/english-teaching-core.md`. A revealed expression changes later responses into supported performance rather than first unaided recall.
4. For a specific recall block read its `references/english-scaffolding.md`; classify the actual response and support using its `references/english-segment-fields.md`.
5. Recommend earlier revisiting for uncertain items and a longer delay after well-supported independent recall, without claiming a universally optimal interval.
6. Return a next-step suggestion to session. Automatic reminders require an explicit user request and actual scheduling support; this method does not create reminders or a parallel progress record.
## Example
Practice “under” while hiding a toy today; retrieve it in a treasure hunt on another day.
