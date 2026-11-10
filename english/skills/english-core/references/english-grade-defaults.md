# English Grade Defaults

Grade to grade band, and the specific level within a band, follow `learn-data` `references/grade-band-defaults.md`. This file is the single source for English `active_domain`, initial levels, default tasks, and progression order. Do not copy initial values from the shared schema's examples.

## Initialization

| Grade band | `learning_state.active_domain` |
|---|---|
| `lower_primary` | `listening_speaking` |
| `upper_primary` | `reading` |

The four keys of `profile.preferences` all start as `false`; `/learn-start` sets only the student's selected one to `true`. Keys are in `references/english-profile-fields.md`.

Initial `profile.current_levels` are all `pre_a1`:

```json
{
  "listening": "pre_a1",
  "speaking": "pre_a1",
  "reading": "pre_a1",
  "writing": "pre_a1"
}
```

Grade does not determine English level. A student may already have a foundation in the lower grades or may be just starting in the upper grades; initial values are uniformly conservative, then updated one skill at a time from actual performance. One correct answer is not enough to level up; it takes independent performance in more than one context.

## Level Bands

| Value | Meaning |
|---|---|
| `pre_a1` | Understands a few words with the help of pictures, actions, and familiar scenes; expresses mostly with single words, phrases, or first-language supplements |
| `a1` | Understands everyday short sentences and short stories; can say or write simple needs in short sentences |
| `a2` | Can read short paragraphs and catch main information; can do brief retelling, description, and Q&A |
| `b1` | Can read longer material, give reasons and simple opinions; expression is more coherent |

Level up only one band at a time; with insufficient evidence, keep the original value. Do not treat grade, one correct answer, or fluent reading aloud as long-term level evidence.

`active_domain` takes one of: `listening_speaking`, `reading`, `writing`, `language_use`, `news_reading`.

## Lower Primary (Grades 1–3, `lower_primary`)

Default to starting with listening and speaking, with short sentences and concrete activities.

1. Listen to instructions and act, name things from pictures, pick one of two
2. Short dialogues and simple Q&A in familiar scenes
3. Shared reading of picture books or short stories, grasping the main line
4. Respond with one word or half a sentence, then gradually build up to a short sentence
5. Reuse the same expression in another everyday scene

Common topics: colors, animals, family, numbers, food, actions, weather. Grade 3 can add a small comparison or transfer, without introducing a grammar system early.

## Upper Primary (Grades 4–6, `upper_primary`)

Default to starting with short reading, gradually adding retelling, imitation writing, and simple tasks.

1. Read a short story or informational passage and find who, where, and what happened
2. Answer one comprehension question, then retell a sentence or two
3. Imitate the target pattern to write a short sentence of one's own
4. Put the expression to use in a task or game
5. Change topic or scene to check independence

Common topics: school life, nature and animals, small science facts, holidays, travel, health. Grade 6 can read slightly longer material and give one simple reason; grammar terms are not a threshold.

## Progression Order

Understanding comes before expression, supported expression before independent expression, and the same context before a changed context. Once a goal is stable, pick a neighboring task or switch scenes; do not jump to the next band directly from the grade table.
