# Schedule change requests

Whenever a pull request changes a game or schedule entry (`src/data/games.json`, `src/data/schedule.json`):

- Add or update the entry's timestamp in `src/data/gameRevisions.json`, keyed by the game id, using an ISO 8601 time with offset (e.g. `2026-10-14T13:03:00-07:00`) set to the time of the change.
- Do this in the same pull request, before the issue is considered done/closed.
- The "Schedule last updated" label on the home page is derived from these timestamps and the build's latest commit time.
