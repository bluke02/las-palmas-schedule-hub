# las-palmas-practice-hub
For team practice schedules

## Game change requests

The change-request form stores requester contact information in Netlify Forms
and creates a public GitHub issue for schedule review. The issue includes a
request ID that can be used to find its matching private submission in the
Netlify Forms dashboard. Contact information is not included in the public
issue. Requests do not change the schedule automatically.

To enable issue creation on Netlify, create a fine-grained GitHub personal
access token restricted to this repository with **Issues: read and write**
permission, then add it to the Netlify site's environment variables as
`GITHUB_TOKEN`. Keep the token out of source control. Redeploy after setting
the variable. The function returns an error instead of creating an issue if
the token is missing or GitHub rejects the request. Issues are assigned to
`bluke02` for review.

## Schedule revision timestamps

When changing or adding a game in `src/data/games.json`, add or update that
game's timestamp in `src/data/gameRevisions.json`. The timestamp must be valid
ISO 8601 and later than the prior timestamp. Pull requests targeting `main` run
the timestamp check and the test suite.

Cancelled games stay on the schedule with their original date and details,
marked as cancelled in the Notes column. Rescheduled games are listed as
separate rows with a note linking them to the original date.
