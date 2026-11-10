# English Learning Recommendations

Read by `learn-recommend` through the Subject contract. This file decides only the content, difficulty, reasons, and ordering of English candidates; choice and handoff follow the shared flow. Method dispatch is still carried out by `english-session` per the single method table in `references/english-teaching-core.md`; no separate method table is built here and no method is invoked.

## Candidates: a Meaningful Next Comprehension or Expression

From the existing snapshot and latest real performance, pick a communicative purpose; usually give 2–3 differentiated, evidence-backed small goals with 1 as the first pick; give fewer when evidence is thin, and do not pad out four forms of read/speak/game/review. A candidate must make clear the scene and what the student can accomplish, such as "tell a lost animal the way to the library", not "improve speaking" or "learn A1". A recommendation only describes the goal; it does not first tell a story, test, or pose a pending English question.

- First look at what the student actually understood or expressed in the current material and the difference between independent and supported completion, then check `priority_targets`, `developing_topics`, recent errors, `session_history`, and memory's next step. First-language supplements, short answers, or slow answers are not themselves evidence of low level.
- Look at comprehension and output separately: understanding a story is not the same as being able to retell it independently; when the meaning can be expressed but the form is unstable, prefer using the same expression in a new context rather than scheduling a grammar lecture. Text mode cannot infer listening or pronunciation.
- With a specific sticking point, choose a goal that handles just one spot; with clear comprehension evidence, prefer negotiation of meaning, a neighboring expression, or task transfer, and do not mechanically read another passage. Interests and format preferences are carriers, not a reason to cover all methods.

| Existing evidence | Direction of small goals that can start | Load control |
|---|---|---|
| Main events of a short story not yet connected | Read a complete small story and say why the character finally changed their decision | Familiar topic, short complete text, keeping cause, development, and result |
| Understands events; expression often leans on single words or first-language supplements | Express a wish in a real choice and add one reason | Add only one useful expression; do not require long output |
| Meaning to express is clear, but something is unclear in one place | Ask for one piece of information or clarify one meaning in a new scene | A single information gap; do not deliberately create misunderstanding |
| Has met a word or sentence before but no recent independent recall | Recall and use a recorded old expression in a new mini-situation | Call it review only with an exposure record; do not list words first |
| Can already use a pattern independently | Use it in a changed situation for a concrete outcome, such as picking a gift for a friend and explaining why | Keep the language close first and change only one situational factor |
| Writing already has its meaning, one spot hurts readability | Revise one of your own sentences so a peer understands it more easily | Keep the original meaning, handle only one spot, do not write the whole paragraph |

## Difficulty and Ordering

Real comprehension/expression in the current domain takes priority over the profile's general level; decide sentence length, cohesion, and information amount per `references/english-input-adaptation.md`. Age adjusts topic maturity and format and does not set CEFR; a recommendation does not announce a level-up. `material_difficulty` adjusts only one load factor. When level is unknown, pick a goal in a familiar scene that is low-load and complete in meaning, and observe the response only after selection; do not start with a leveling questionnaire.

Prefer the smallest next step that builds on an existing foothold and meets the current communication need; next, retrieval of an old expression with a record basis or neighboring transfer. The historical next step of ordinary resume may be reordered; do not always open with a story. When the student explicitly wants different content, carry feasible goals in a different scene/topic and do not force a continuation of the old story; a student who names a specific activity goes directly to the session, with no extra recommendation. News candidates state only the topic and reading purpose; sources are verified only after selection, and during recommendation do not search or promise unverified news.

Read `personal.interests` and subject preferences per `references/english-personalization.md`; do not raise the language load to cater to interests. When there is no matching record, say it is a starting point worth trying and do not invent old words or sentences, exposure times, or performance.

## Reasons and Examples

Reasons that cite records are generated at runtime and use the student's UI locale (resolved from `profile.language` per `learn-data` `references/ui-locale.md`); recommendation chrome (goal descriptions, flow labels, choice prompts) uses `ui.recommend.*` keys from the `learn` catalog. English words and sentences may appear as necessary examples within a goal, but a reason is not switched wholesale to English if the UI locale is not English. After a choice, material, teaching questions, and feedback resume the English rules of `english-core`.

The examples below are illustrative samples only: the candidate focus and reason are shown in English, and the real reason text is generated in the UI locale.

- Has understood a lost-pet story but expresses wishes in single words. First pick: "Choose a home for a little animal and say where you want to put it." Sample reason: "You already understood what the little animal was looking for last time; this time you can say your own choice more fully." Do not record understanding as the ability to express fully.
- Records show "Can I have ...?" was used before and still needs hints recently. May first pick: "Ask for two things you need while getting ready for a picnic." Sample reason: "You used this request before; in a picnic this time, try to remember it on your own." Do not claim mastery, and do not replace communication with dictation.
- Can already independently explain why they like something, and the ordinary resume suggestion is still reading a story: may rank "Pick a gift for a friend and give your reason" first. Sample reason: "Last time you could already explain why you like something; you can use that to help a friend choose." The second pick is another low-load short story; do not push the task goal down to obey a fixed order.

Completion standard: each candidate has a concrete scene, communicative outcome, and evidence-backed language load; only one first pick, and a recommendation produces no evidence of English level or method execution.
