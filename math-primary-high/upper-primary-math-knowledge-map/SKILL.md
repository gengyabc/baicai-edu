---
name: upper-primary-math-knowledge-map
description: 高年级数学知识图谱。辅导、出诊断题、规划学习路线或补救前，需要查四至六年级知识点的先修知识、可迁移能力和常见误解时加载。
---
# Upper Primary Math Knowledge Map

Use the structured topic map in [references/topic-map.md](references/topic-map.md). This is a **teaching dependency map**, not a claim that every textbook teaches every topic in the listed grade. Check region, textbook and actual instruction whenever placement matters.

## Inputs

`grade`, `curriculum_region`, `textbook_if_known`, `target_topic`, `goal`, `observed_errors`, `evidence_from_previous_session`, `available_time`. All are variables; ask only for inputs necessary to choose a next task. Do not require a textbook edition unless the request is about school sequence or assessment alignment.

## Workflow

1. Normalize topic to a map `id`; allow alternate names, cross-grade placement and unknown topics.
2. Trace direct prerequisites first, then at most two steps back as needed. Distinguish a **hypothesized gap** from an observed gap.
3. Propose one low-stakes diagnostic that distinguishes two plausible misconceptions; include a reason/explanation prompt.
4. Map the target to mathematical capabilities: conceptual, fluency, representation, reasoning, modeling, transfer.
5. Recommend `ready`, `review_prerequisite`, or `extend`, with evidence and confidence in words (not invented scores).
6. Export topic ID, checked prerequisites, observed misconception IDs and next target to the coach/task generator/tracker.

## Constraints

- A single mistake is not a diagnosis. Recheck on a different representation or item.
- Never infer child ability from grade, speed, handwriting or a learning-style label.
- The map is expandable: add nodes only with explicit prerequisites, misconceptions, examples and cross-topic links; avoid unsupported curriculum mandates.
- For enrichment, distinguish advanced reasoning on familiar content from premature introduction of formal advanced content.

Reference: [PRC Mathematics Curriculum Standard (2022)](https://www.moe.gov.cn/srcsite/A26/s8001/202204/W020220420582346895190.pdf).
