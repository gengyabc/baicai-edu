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

## After File Processing

The entry calls `learn-errors` only once, and after obtaining the extracted material, the student's answers, the diagnosis, and the current extracted path:

- Set `files_processed: true`, and record `material_refs` and the user's original intent; on failure or when no content was obtained, keep false, clarify or report the problem, and do not pretend it was processed.
- `type`, `intent`, `source`, and topic are filled in per the current subject's target classification.
- Before routing, save the resolved target_context and material references to the log context. Later, load the extracted content, and do not rerun file analysis or re-ask the self-diagnosis. If the material category is still unclear, ask only one line.

## Source Values

The segment's source enum belongs to Session Segment in `references/session-schema.md`, and this file does not define it separately. The classifier only produces a target and does not perform a second routing; routing is declared by the entry.
