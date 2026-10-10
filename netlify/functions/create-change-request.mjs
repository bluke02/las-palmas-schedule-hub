import games from "../../src/data/games.json";

const CHANGE_TYPES = {
  date: { label: "Date" },
  "start-time": { label: "Start Time" },
  "end-time": { label: "End Time" },
  "home-team": { label: "Home Team" },
  "away-team": { label: "Away Team" },
  location: { label: "Location" },
  field: { label: "Field" },
  division: { label: "Division" },
  other: { label: "Other" },
};

const OPTION_VALUES = {
  "home-team": games.map((game) => game.home),
  "away-team": games.map((game) => game.away),
  location: games.map((game) => game.location),
  field: games.map((game) => game.field),
  division: games.map((game) => game.division),
};

const MAX_BODY_LENGTH = 10_000;
const MAX_REASON_LENGTH = 2_000;
const NEAR_PAST_DAYS = 7;
const REQUEST_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

function isAllowedOrigin(event) {
  const origin = event.headers?.origin || event.headers?.Origin;
  if (!origin) return true;

  try {
    const allowedOrigins = [
      process.env.URL,
      process.env.DEPLOY_URL,
      process.env.DEPLOY_PRIME_URL,
    ]
      .filter(Boolean)
      .map((url) => new URL(url).origin);

    return allowedOrigins.includes(new URL(origin).origin);
  } catch {
    return false;
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - NEAR_PAST_DAYS);
  return date >= cutoff;
}

function codeBlock(value) {
  const backtickRuns = value.match(/`+/g) || [];
  const fence = "`".repeat(Math.max(3, ...backtickRuns.map((run) => run.length + 1)));
  return `${fence}\n${value}\n${fence}`;
}

function getRequestError(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "Please submit a valid change request.";
  }
  if (typeof payload.botField === "string" && payload.botField.trim()) {
    return "Please submit a valid change request.";
  }
  if (
    typeof payload.requestId !== "string" ||
    !REQUEST_ID_PATTERN.test(payload.requestId)
  ) {
    return "Please submit a valid change request.";
  }
  if (typeof payload.game !== "string" || !games.some((game) => game.id === payload.game)) {
    return "Choose a game from the schedule.";
  }

  if (
    typeof payload.changeType !== "string" ||
    !Object.hasOwn(CHANGE_TYPES, payload.changeType)
  ) {
    return "Choose a valid type of change.";
  }
  const changeType = CHANGE_TYPES[payload.changeType];
  if (typeof payload.requestedValue !== "string") {
    return "Provide the requested change.";
  }

  const requestedValue = payload.requestedValue.trim();
  if (!requestedValue || requestedValue.length > MAX_REASON_LENGTH) {
    return "The requested change is empty or too long.";
  }

  if (
    payload.changeType === "date" &&
    !isValidDate(requestedValue)
  ) {
    return "Enter a valid date that is in the future or within the past week.";
  }
  if (
    ["start-time", "end-time"].includes(payload.changeType) &&
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(requestedValue)
  ) {
    return "Enter a valid time.";
  }
  if (
    Object.hasOwn(OPTION_VALUES, payload.changeType) &&
    !OPTION_VALUES[payload.changeType].includes(requestedValue)
  ) {
    return "Choose a valid value from the list.";
  }

  if (typeof payload.reason !== "string" || !payload.reason.trim()) {
    return "Add a reason for the requested change.";
  }
  if (payload.reason.length > MAX_REASON_LENGTH) {
    return "The reason must be 2,000 characters or fewer.";
  }
  if (
    payload.team !== undefined &&
    (typeof payload.team !== "string" || payload.team.length > 100)
  ) {
    return "The team name must be 100 characters or fewer.";
  }

  return "";
}

function createIssueBody(game, changeType, requestedValue, team, reason, requestId) {
  const gameDetails = [
    game.date,
    `${game.start} - ${game.end}`,
    game.division,
    `${game.away} vs. ${game.home}`,
    `${game.location} (${game.field})`,
  ].join(" | ");

  return [
    "This request is for review only and does not change the schedule. If approved, implement the change on a branch and open a pull request. Close this issue if the request is declined.",
    "",
    "## Review",
    "- [ ] Approve and open a pull request with the schedule update",
    "- [ ] Decline and close this issue",
    "",
    `Private contact details are stored in Netlify Forms under request ID \`${requestId}\`.`,
    "",
    "## Scheduled game",
    codeBlock(gameDetails),
    "",
    "## Requested change",
    `**${changeType.label}:**`,
    codeBlock(requestedValue),
    ...(team?.trim() ? ["", "## Team", codeBlock(team.trim())] : []),
    "",
    "## Reason",
    codeBlock(reason.trim()),
  ].join("\n");
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return response(405, { error: "Use POST to submit a change request." });
  }

  if (!isAllowedOrigin(event)) {
    return response(403, { error: "This request must come from the schedule site." });
  }

  if (!process.env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN is not configured for the change-request function.");
    return response(503, {
      error: "The request service is not configured. Please try again later.",
    });
  }

  let body;
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || "", "base64").toString("utf8")
      : event.body || "";
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_LENGTH) {
      return response(413, { error: "The change request is too large." });
    }
    body = JSON.parse(rawBody);
  } catch {
    return response(400, { error: "Please submit a valid change request." });
  }

  const requestError = getRequestError(body);
  if (requestError) return response(400, { error: requestError });

  const game = games.find((scheduledGame) => scheduledGame.id === body.game);
  const changeType = CHANGE_TYPES[body.changeType];
  const title = `[Schedule change] ${game.date}: ${changeType.label} - ${game.away} vs. ${game.home}`;
  let githubResponse;
  try {
    githubResponse = await fetch(
      "https://api.github.com/repos/bluke02/las-palmas-schedule-hub/issues",
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "Las-Palmas-Schedule-Hub",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          title,
          body: createIssueBody(
            game,
            changeType,
            body.requestedValue.trim(),
            body.team || "",
            body.reason,
            body.requestId
          ),
          assignees: ["bluke02"],
        }),
      },
    );
  } catch (error) {
    console.error(
      "GitHub API request failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return response(502, {
      error: "GitHub could not create the review issue. Please try again later.",
    });
  }

  if (!githubResponse.ok) {
    console.error("GitHub issue creation failed with status", githubResponse.status);
    return response(502, {
      error: "GitHub could not create the review issue. Please try again later.",
    });
  }

  let issue;
  try {
    issue = await githubResponse.json();
  } catch {
    console.error("GitHub issue creation returned an invalid response.");
    return response(502, {
      error: "GitHub could not confirm the review issue. Please try again later.",
    });
  }
  if (!issue.html_url) {
    console.error("GitHub issue creation returned no issue URL.");
    return response(502, {
      error: "GitHub could not confirm the review issue. Please try again later.",
    });
  }

  return response(201, { issueUrl: issue.html_url });
};
