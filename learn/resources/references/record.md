# Archive and Reading Record

## One original, one record

Keep one original image and one reading record per image. Do not create a second copy, a summary file, or a model reconstruction.

## Where files go

| Artifact | Location |
|---|---|
| Original | `data/students/<student_id>/<subject>/raw/<topic>-<NNN>-<YYYYMMDD>.<ext>` |
| Reading record | `outputs/students/<student_id>/<subject>/extracted/<same base name>.md` |
| Backups | `outputs/students/<student_id>/<subject>/backups/raw/`, only for a raw-file rename |

- For a message attachment, copy it into `raw/` under the final name as a new original. This never overwrites, edits, or deletes an existing raw file, so no backup is made: nothing is replaced.
- For a path the student already placed in `raw/`, do not copy it; use the final path after the file intake's rename.
- Keep every existing raw original read-only: never overwrite, edit, or delete one.
- If the copy fails, still write the record with `archived: false` and the source reference, and return `archived: false`; the current owner states that the original was not archived, not the reader.

`<topic>` is a short English or pinyin slug based on the question or the current topic; an attachment from a subject turn without a question slug uses that topic's short slug. This is the same rule the file intake uses. `<NNN>` is the largest number for that topic in `raw/` and `extracted/` plus one, zero-padded to three digits; the date is the current date.

The record is a reading index, not the original. `page_scope` describes the visible extent of the image, not which problem the teaching owner will choose.

## Content hash

- Compute a content hash with a content-hash capability the current environment provides; prefer SHA-256, MD5 is acceptable for deduplication.
- Store it at the top of the record as `content_hash: sha256:<hex>` (or the algorithm actually used).
- Look for an existing record with the same hash in the current subject's `extracted/`. On a match, reuse the first reading: do not read again, do not write a second record, and do not copy the image again.
- If the environment provides no content hash, store `content_hash: null`, skip deduplication, and do not ask the student for a tool.
- Never change the first reading. A student confirmation or correction updates the confirmed value, not the transcription.
- A clearer close-up is a different image: write its own record, and link it only when the student says it is the same page. Use it to resolve the original ambiguity without replacing the first reading.

## Record shape

Top structured fields:

```yaml
content_hash: "sha256:..."
source_kind: uploaded_attachment | raw_file
original_path: "..."
archived: true | false
subject: ...
topic: ...
read_at: ...
page_scope: whole_page | one_problem | selected_region
read_status: clear | ambiguous | unreadable | partial
ambiguities:
  - region: ...
    alternatives: [...]
    affects_judgment: true | false
    resolution: none | student_confirmed | closeup
confirmed:
  - region: ...
    value: ...
related_extracted: null | "..."
```

Then the body: the printed content if any, and the student's handwritten lines by line id, LaTeX preserved as written. No diagnosis and no mastery conclusion.

When the student confirms or corrects a token, the current teaching owner appends a `## Confirmation` section and updates `confirmed`; the original ambiguity stays in place.

## Privacy

Do not copy a name, school, address, or unrelated page content into the record. Do not keep a second copy of the image. Deletion and retention follow the existing clean rules. Never store a model drawing or SVG as the record; the original image is the only faithful artifact.
