# Feynman Skill Whitelist

## Purpose

Manage the confirmed skills whitelist across all learning modes (learn, practice, review, feynman). Track which skills the student has demonstrated mastery of, and strategically make mistakes only on non-whitelisted skills in Feynman mode.

## Scope

- **Whitelist applies to**: All learning modes (learn, practice, review, feynman)
- **Strategic mistakes apply to**: Only Feynman mode (AI as learner)
- **Skill confirmation**: Can happen in any mode when student demonstrates mastery

## Initialization

When a student's `outputs/students/<student_id>/<subject>/memory.json` is first created or when `mastered_topics` is updated:

1. Read `outputs/students/<student_id>/<subject>/profile.json` → `learning_state.mastered_topics`
2. For each topic in `mastered_topics`, add to `confirmed_skills`:
   ```json
   { "skill": "<topic>", "domain": "<domain>", "confirmed_at": "<now>" }
   ```
3. Skip duplicates: check if the `skill` field already exists in `confirmed_skills` (match on `skill` only, ignore `domain` and `confirmed_at`)

## Whitelist Behavior in Feynman Mode

### During AI Response (as Learner)

1. **Before making mistakes**: Check if the skill being demonstrated is in `confirmed_skills`
2. **If IN whitelist**: Do NOT make mistakes on this skill
3. **If NOT IN whitelist**: Make strategic mistakes on key steps ("能错尽量错")
4. **Role level**: Always play slightly below the current student's level

### Mistake Strategy

When the skill is NOT in the whitelist:
- Make mistakes on key conceptual steps (not just calculation errors)
- Mistakes should be realistic for a learner slightly below the student's level
- Never make a mistake on a skill in `confirmed_skills`, and never present a wrong answer as correct at the end of a turn
- Common mistake types:
  - Misapplying a rule
  - Skipping a step
  - Confusing similar concepts
  - Wrong operation choice

### After Student Corrects

When the student successfully corrects AI's mistake or explains a concept clearly:

1. Check if the skill is already in `confirmed_skills`
2. If not, and the skill has **two independent demonstrations** (different numbers/contexts) or one demonstration plus a correct explanation of why it works, add its name to the current `session_segment.confirmed_skills`:
   ```json
   ["<skill_name>"]
   ```
3. Do not write `memory.json` now. Finalize converts the names to objects and writes memory once.

## Error Tracking

During teaching, append each genuinely observed error's skill name to the current segment's `skill_errors_observed`. Use a projected in-memory whitelist so later turns do not treat a revoked skill as confirmed; do not write memory mid-turn.

At finalize, process segments in order. For each error observation, find/create the skill's `skill_errors` entry, increment `error_count`, and update `last_error_at`. The counter accumulates observations; it is not a consecutive-error streak. At `error_count >= 2`, remove that skill from `confirmed_skills` and remove its error-counter entry. A later re-confirmation needs fresh evidence under After Student Corrects; evidence preceding revocation cannot re-add it during the same finalize.

Record only actual errors once per skill per segment; replaying the same student answer is not a new observation.

## Skill Domain Mapping

| Domain | Example Skills |
|--------|----------------|
| `addition_subtraction` | 凑十策略, 减法借位, 加减法逆运算 |
| `multiplication_division` | 乘法口诀, 除法意义, 余数概念 |
| `fractions` | 分数意义, 通分, 约分 |
| `place_value` | 数位理解, 进位退位 |
| `word_problems` | 理解题意, 找关键信息, 列式 |

## Session End Update

At the end of each Feynman/teaching session:

1. Check `skill_errors` for any skills reaching `error_count >= 2`
2. Remove those skills from `confirmed_skills`
3. Add newly confirmed skills that meet the two-evidence bar
4. Leave the actual `memory.json` write to `learn-data` finalize; the session log already carries the names

## Write Timing

- During a turn: only append to `session_log.json`; do not write `memory.json`.
- At finalize: merge `confirmed_skills` and `skill_errors` once, in the same write as the other memory fields.
- There is no cross-process lock; do not write the same file from two turns in parallel.