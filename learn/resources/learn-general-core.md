---
name: learn-general-core
description: General-task rules. Load when teaching resolution selects the general path and needs initialization, goal classification, recommendation, or task-evidence interpretation; continue real teaching even without an applicable specialist package.
resources: general-contract.md teaching-resolver.md
---

# General-Task Rules

First load `learn-core` and `learn-data`, and reuse the entry snapshot and the resolution result from `references/teaching-resolver.md`; the real subject does not change. Concrete teaching is produced only by `learn-general-session`; this skill produces no replies, segments, or profile writes.

## Subject Contract

This implementation has no fixed subject directory; the five roles are provided section by section from one reference, and the entry reads only the relevant section.

| Role | Reference |
|---|---|
| Target classification | Target classification in `references/general-contract.md` |
| Grade defaults | Grade defaults in `references/general-contract.md` |
| Profile fields | Profile fields in `references/general-contract.md` |
| Diagnosis rules | Diagnosis rules in `references/general-contract.md` |
| Learning recommendation | Learning recommendation in `references/general-contract.md` |

All stages and unknown stages are supported; stage affects only expression and support and never auto-generates a mastery level. All evidence carries `teaching.evidence_namespace: general_v1` and the scope_id, and isolation rules follow the resolver reference.
