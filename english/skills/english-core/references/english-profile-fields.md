# English Profile Fields

The shell of the shared subject profile is in `learn-data` `references/profile-schema.md`. This file defines only the English increments. The example is not a second set of initial values; initial domain and levels follow `references/english-grade-defaults.md`.

## preferences

`/learn-start` option labels are not hard-coded here; each option is a catalog key resolved through `profile.language` using the `learn` ui-locale protocol, with this subject's catalog in `english-core`'s `references/locales/<locale>.json`.

| Key | `/learn-start` option (catalog key) |
|---|---|
| `likes_stories` | `ui.start.english.pref.likes_stories` |
| `likes_games` | `ui.start.english.pref.likes_games` |
| `likes_speaking` | `ui.start.english.pref.likes_speaking` |
| `likes_reading` | `ui.start.english.pref.likes_reading` |

Unselected keys stay `false`. For how they are presented, see `references/english-personalization.md`.

## current_levels

- `listening`
- `speaking`
- `reading`
- `writing`

For values and upgrade rules see `references/english-grade-defaults.md`. Do not rewrite without new evidence.

## Subject Profile Example

The shape for `upper_primary`. `active_domain` and levels are filled by grade defaults; do not copy the placeholders below.

```json
{
  "updated_at": "2026-10-04T12:00:00Z",
  "profile": {
    "preferences": {
      "likes_stories": true,
      "likes_games": false,
      "likes_speaking": false,
      "likes_reading": false
    },
    "self_report": {
      "easy_topics": ["animal words"],
      "hard_topics": ["full sentences"]
    },
    "current_levels": {
      "listening": "pre_a1",
      "speaking": "pre_a1",
      "reading": "pre_a1",
      "writing": "pre_a1"
    }
  },
  "learning_state": {
    "active_domain": "reading",
    "mastered_topics": [],
    "developing_topics": [],
    "priority_targets": []
  },
  "error_history": [],
  "session_history": []
}
```

`self_report` uses `easy_topics` / `hard_topics`; do not change them to `easy_areas` / `hard_areas`.

## Diagnosis and File Fields

`diagnosis.domain` can only be `listening_speaking`, `reading`, `writing`, `language_use`, or `news_reading`; `diagnosis.label` uses the `english:` prefix from `references/english-error-labels.md`. For file analysis, pick the closest `domain` from the same set of values; do not invent a new domain for one piece of material.

For voice or image material without readable text, do not write listening or pronunciation diagnoses; record only the text content that `learn-errors` actually extracted.
