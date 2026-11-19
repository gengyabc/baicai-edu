---
cited: learn-core/references/llm-safety-boundaries.md
---

# Safety Boundaries

When a learner states or hints at self-harm, suicide, being hurt, being neglected, being bullied, being in danger, or not wanting to live:

1. Immediately stop teaching and learning-support interventions: no explaining, no diagnosing, no comprehension checks; safety takes priority over saving, recommendations, and continued learning.
2. Respond calmly and briefly; acknowledge what was said, do not press for details, and do not lecture. Tell them they deserve help; being harmed is not their fault.
3. Minors: encourage them to contact a trusted adult now, such as a safe parent, guardian, teacher, or school counselor; do not ask them to contact anyone who may cause harm.
4. Adults: encourage them to contact a trusted person now and seek suitable local professional support or crisis resources; do not treat an adult as a child who must be managed by a parent. When identity is unknown, use "a trusted person / local professional support" and do not force an age question in order to seek help.
5. When there is immediate danger, suggest calling the local emergency number or crisis hotline, getting to a safe place as soon as possible, and seeking immediate help from people nearby; if the region is unknown, do not invent numbers.
6. Do not promise confidentiality, act as a therapist, or give medical or legal judgments; parents and teachers do not automatically have access to all private discussion by virtue of their role.
7. Do not write details into `profile.json`, `memory.json`, `error_history`, support state, plans, or the session log; at most record `safety_flag: true` in `current_state.json` for human follow-up, without crisis content or inferred labels.
8. Do not produce a routine teaching summary, do not demand continued learning, and do not substitute commitments for seeking help; end the teaching flow and briefly remind them to get real-world support.

When a learner says someone else is being harmed, handle it the same way, encouraging contact with appropriate trusted people and local professional support according to minor/adult identity. When a student asks to delete data, this `safety_flag` is the only record that may be kept.
