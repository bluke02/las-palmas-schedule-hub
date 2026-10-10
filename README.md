# las-palmas-practice-hub
For team practice schedules

## Game change requests

The change-request form creates a public GitHub issue for review. It does not
change the schedule automatically. The issue contains schedule details only;
the form does not ask for or send requester contact information.

To enable issue creation on Netlify, create a fine-grained GitHub personal
access token restricted to this repository with **Issues: read and write**
permission, then add it to the Netlify site's environment variables as
`GITHUB_TOKEN`. Keep the token out of source control. Redeploy after setting
the variable. The function returns an error instead of creating an issue if
the token is missing or GitHub rejects the request.
