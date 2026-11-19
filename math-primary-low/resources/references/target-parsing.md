---
cited: learn-data/references/target-parsing.md
---

# Parse Learning Target

The `target_context` shape shared by `/learn`, `/learn-feynman`, and the restore flow. Input is explicit user text, the current subject, and existing material; mode is specified by the entry and does not take part in material category judgment. Classification of the remaining text and of the target after file handoff is done by the subject target classification designated by the entry; this file does not list subjects.

## Shape

```json
{
  "type": "topic",
  "topic": "current topic",
  "source": "manual_topic",
  "files": [],
  "intent": null,
  "files_processed": false,
  "material_refs": [],
  "warnings": []
}
```

`files_processed` only means the current files were processed successfully and does not mean the student has mastered anything. `material_refs` stores paths of extracted or user material within the current student/subject; after a rename use the new path and no longer rely on the old raw file name. Path resolution, supported formats, and safety validation are defined only by `learn-errors`.

## Classify

1. Empty text -> `type: profile`, `source: profile`. If there is already an active target and no explicit topic change, keep the original target_context.
2. Has a path -> `type: error_files`; first handled by `learn-errors`, then handed off per the subject target classification.
3. Other text goes to the current subject's target classification. When it can't be judged, ask only one short question and do not guess the material.

## Optional math opening advice

A mathematics recommendation candidate and its selected session target_context may carry `math_opening_hint`: `micro_lesson` / `practice` / `probe` / `challenge`. It suggests only the first action: teach a supported new relation, check/consolidate on a fresh item, distinguish an uncertain cause, or offer an unhinted transfer/structural variation. The math session owns the decision and honors the latest explicit request and pending work. It is not a global mode, target-switch authorization, or proof of readiness.

Keep topic and action separate: topic preserves the student's meaningful subject wording, not a graph ID or a generated “teach me” prefix. `intent` may preserve an explicit new-learning request verbatim where the existing classifier runs; do not overwrite intent from file/error processing with generated recommendation reasons. Ordinary same-target replies and restored sessions do not rerun classification or allocate a new scope_id.

The hint lives only in temporary recommendation candidates and the selected current context. Consume it with the first actual opening's successful context write alongside the advanced pending point; a failed write keeps the persisted retry position. Later restore follows recorded activity, never reopens from the hint. Same-target continuation does not overwrite a pending question. Old candidates without it follow the original rules; an unknown value is ignored, not interpreted as authorization. Keep it out of segments, long-term recommendation summaries, profiles, ability evidence, and general-subject records.

### Selected opening expectation

For newly generated math candidates, pair the visible “goal · how we begin” description with the matching `math_opening_hint` whenever a fresh opening is proposed. Keep the description in the candidate's `reason`, not in student-authored `intent`. On selection, the hint carries that opening expectation into the target context:

- `micro_lesson`: an explained example of one new relation, then a reachable student step. Selecting a candidate explicitly offering this sequence agrees to that new-learning activity; it does not establish mastery or authorize solving a pending original. Apply the shared new-learning gate and separate-example protection.
- `practice`: a fresh independent check/consolidation item before hints; describe it as checking or practice, not first teaching new knowledge.
- `challenge`: student-led investigation or transfer with the key inference left to the student.
- `probe`: one brief exploration of a specific uncertainty; describe that uncertainty honestly rather than promising a demonstration first.

An unfinished-task candidate is labeled as continuation, carries its existing scope/teaching, and resumes the pending point without a fresh opening hint. History being unfinished is a reason to offer continuation, not permission to start it before selection.

The session fulfills the offered first activity. If the latest explicit request, conflicting evidence, protected pending work, or an unavailable contract requires a different opening, briefly explain the change before proceeding under the existing gates. Unknown readiness alone does not silently replace an agreed, supported new-learning example with an assessment item. After the opening, evidence guides support and any later independent check; an independent check is not a compulsory exit test. Old candidates without hints keep the original restore behavior; this contract creates no new mode or performance evidence.

## After File Processing

The entry calls `learn-errors` only once, and after obtaining the extracted material, the student's answers, the diagnosis, and the current extracted path:

- Set `files_processed: true`, and record `material_refs` and the user's original intent; on failure or when no content was obtained, keep false, clarify or report the problem, and do not pretend it was processed.
- `type`, `intent`, `source`, and topic are filled in per the current subject's target classification.
- Before routing, save the resolved target_context and material references to the log context. Later, load the extracted content, and do not rerun file analysis or re-ask the self-diagnosis. If the material category is still unclear, ask only one line.

## Source Values

The segment's source enum belongs to Session Segment in `references/session-schema.md`, and this file does not define it separately. The classifier only produces a target and does not perform a second routing; routing is declared by the entry.
