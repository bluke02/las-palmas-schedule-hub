import { useRef, useState } from "react";
import allGames from "../data/games.json";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function describeGame(game) {
  return `${formatDate(game.date)} · ${game.start}–${game.end} · ${game.division} · ${game.away} vs. ${game.home} · ${game.location} (${game.field})`;
}

const CHANGE_TYPES = [
  { value: "date", label: "Date", hint: "Choose the new game date." },
  { value: "start-time", label: "Start Time", hint: "Choose the new start time." },
  { value: "end-time", label: "End Time", hint: "Choose the new end time." },
  { value: "home-team", label: "Home Team", hint: "Choose the new home team." },
  { value: "away-team", label: "Away Team", hint: "Choose the new away team." },
  { value: "location", label: "Location", hint: "Choose the new location." },
  { value: "field", label: "Field", hint: "Choose the new field." },
  { value: "division", label: "Division (optional)", hint: "Choose the new division." },
  { value: "other", label: "Other", hint: "Describe the change you are requesting." },
];

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

const games = allGames.filter((game) => !game.bye && game.status !== "cancelled");
const teams = uniqueSorted(games.flatMap((game) => [game.home, game.away]));
const locations = uniqueSorted(games.map((game) => game.location));
const fields = uniqueSorted(games.map((game) => game.field));
const divisions = uniqueSorted(games.map((game) => game.division));

const FIELD_NAMES = {
  date: ["requested-date"],
  "start-time": ["requested-start-time"],
  "end-time": ["requested-end-time"],
  "home-team": ["requested-home"],
  "away-team": ["requested-away"],
  location: ["requested-location"],
  field: ["requested-field"],
  division: ["requested-division"],
  other: ["requested-other"],
};

const ALL_REQUESTED_FIELDS = Object.values(FIELD_NAMES).flat();

const NEAR_PAST_DAYS = 7;

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
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

function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validateRequest(changeType, formData) {
  const names = FIELD_NAMES[changeType];
  if (!names) return "Please select a type of change.";
  const value = (formData.get(names[0]) || "").toString().trim();
  if (!value) return "Please provide the requested change value.";
  if (changeType === "date" && !isValidDate(value)) {
    return "Enter a valid date that is in the future or within the past week.";
  }
  if ((changeType === "start-time" || changeType === "end-time") && !isValidTime(value)) {
    return "Enter a valid time.";
  }
  return "";
}

function OptionSelect({ name, label, options, placeholder }) {
  return (
    <label>
      {label}
      <select name={name} defaultValue="" required>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RequestedValueInput({ changeType }) {
  switch (changeType) {
    case "date":
      return (
        <label>
          Requested date
          <input name="requested-date" type="date" required />
        </label>
      );
    case "start-time":
      return (
        <label>
          Requested start time
          <input name="requested-start-time" type="time" required />
        </label>
      );
    case "end-time":
      return (
        <label>
          Requested end time
          <input name="requested-end-time" type="time" required />
        </label>
      );
    case "home-team":
      return <OptionSelect name="requested-home" label="Requested home team" options={teams} placeholder="Choose a team" />;
    case "away-team":
      return <OptionSelect name="requested-away" label="Requested away team" options={teams} placeholder="Choose a team" />;
    case "location":
      return <OptionSelect name="requested-location" label="Requested location" options={locations} placeholder="Choose a location" />;
    case "field":
      return <OptionSelect name="requested-field" label="Requested field" options={fields} placeholder="Choose a field" />;
    case "division":
      return <OptionSelect name="requested-division" label="Requested division" options={divisions} placeholder="Choose a division" />;
    case "other":
      return (
        <label className="change-request-wide">
          Requested change
          <textarea name="requested-other" rows="3" required />
        </label>
      );
    default:
      return null;
  }
}

export default function GameChangeRequest() {
  const [selectedGameId, setSelectedGameId] = useState("");
  const [changeType, setChangeType] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const formRef = useRef(null);
  const selectedChangeType = CHANGE_TYPES.find((type) => type.value === changeType);
  const selectedGame = games.find((game) => game.id === selectedGameId);
  const sortedGames = [...games].sort(
    (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)
  );

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(formRef.current);
    const error = validateRequest(changeType, formData);
    setValidationError(error);
    if (error) return;
    setSubmissionError("");
    setSubmissionState("submitting");

    let privateDetailsSaved = false;
    try {
      const requestId = crypto.randomUUID();
      const netlifyFormData = new URLSearchParams();
      formData.forEach((value, key) => {
        netlifyFormData.append(key, value);
      });
      netlifyFormData.set("form-name", "game-change-request");
      netlifyFormData.set("request-id", requestId);
      netlifyFormData.set("change-type", changeType);
      netlifyFormData.set("game-details", describeGame(selectedGame));
      ALL_REQUESTED_FIELDS.forEach((field) => {
        if (!netlifyFormData.has(field)) {
          netlifyFormData.append(field, "");
        }
      });

      const formResponse = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: netlifyFormData.toString(),
      });
      if (!formResponse.ok) {
        throw new Error("Your request details could not be saved. Please try again.");
      }
      privateDetailsSaved = true;

      const response = await fetch("/.netlify/functions/create-change-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game: selectedGameId,
          changeType,
          requestedValue: formData.get(FIELD_NAMES[changeType][0]),
          team: formData.get("team"),
          reason: formData.get("reason"),
          requestId,
          botField: formData.get("bot-field"),
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          result?.error || "We couldn't send your request. Please try again later."
        );
      }
      if (typeof result?.issueUrl !== "string") {
        throw new Error("The review issue could not be confirmed. Please try again later.");
      }

      formRef.current.reset();
      setSelectedGameId("");
      setChangeType("");
      setIssueUrl(result.issueUrl);
      setSubmissionState("success");
    } catch (error) {
      setSubmissionError(
        privateDetailsSaved
          ? `${error instanceof Error ? error.message : "The review issue couldn't be created."} Your contact details were saved privately in Netlify Forms.`
          : error instanceof Error
            ? error.message
            : "We couldn't send your request. Please try again later."
      );
      setSubmissionState("error");
    }
  }

  return (
    <section className="change-request" aria-labelledby="change-request-heading">
      <h2 id="change-request-heading">Request a Game Schedule Change</h2>
      <p className="schedule-intro">
        Your schedule request will be created as a public GitHub issue for
        review. Your name and contact details are kept in Netlify Forms and
        are not included in the public issue. Submitting a request does not
        automatically change the schedule.
      </p>

      {submissionState === "success" ? (
        <p className="change-request-status" role="status">
          Your request has been sent for review.{" "}
          <a href={issueUrl}>View the GitHub issue</a>
        </p>
      ) : (
        <form
          ref={formRef}
          className="change-request-form"
          name="game-change-request"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="game-change-request" />
          <input type="hidden" name="request-id" value="" />
          <input type="hidden" name="game-details" value="" />
          <p className="change-request-honeypot">
            <label>
              Leave this field empty
              <input name="bot-field" tabIndex="-1" autoComplete="off" />
            </label>
          </p>

          <div className="change-request-fields">
            <fieldset className="change-request-contact change-request-wide">
              <legend>Contact Information</legend>
              <p>
                Your name and contact details are stored privately in Netlify
                Forms so the schedule administrator can validate your request.
              </p>
              <div className="change-request-contact-fields">
                <label>
                  Your name <span aria-hidden="true">*</span>
                  <input
                    name="requester-name"
                    type="text"
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  Email <span aria-hidden="true">*</span>
                  <input
                    name="requester-email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  Phone (optional)
                  <input
                    name="requester-phone"
                    type="tel"
                    autoComplete="tel"
                  />
                </label>
              </div>
            </fieldset>
            <label>
              Team
              <input name="team" type="text" maxLength={100} />
            </label>
            <label className="change-request-wide">
              Game to change <span aria-hidden="true">*</span>
              <select
                name="game"
                value={selectedGameId}
                onChange={(event) => setSelectedGameId(event.target.value)}
                required
              >
                <option value="">Choose a scheduled game</option>
                {sortedGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {describeGame(game)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type of change <span aria-hidden="true">*</span>
              <select
                name="change-type"
                value={changeType}
                onChange={(event) => {
                  setChangeType(event.target.value);
                  setValidationError("");
                }}
                aria-describedby="change-type-hint"
                required
              >
                <option value="" disabled>
                  Select a change
                </option>
                {CHANGE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <p id="change-type-hint" className="change-request-wide">
              {selectedChangeType
                ? `${selectedChangeType.hint} Only this field is required.`
                : "Select a type of change to see the relevant field."}
            </p>
            {selectedGame && (
              <p className="change-request-wide">
                Current game: {describeGame(selectedGame)}
              </p>
            )}
            <RequestedValueInput changeType={changeType} />
            <label className="change-request-wide">
              Reason or additional details <span aria-hidden="true">*</span>
              <textarea name="reason" rows="4" maxLength={2000} required />
            </label>
          </div>

          {validationError && (
            <p className="change-request-error" role="alert">
              {validationError}
            </p>
          )}
          {submissionState === "error" && (
            <p className="change-request-error" role="alert">
              {submissionError}
            </p>
          )}
          <button type="submit" disabled={submissionState === "submitting"}>
            {submissionState === "submitting" ? "Sending…" : "Send Change Request"}
          </button>
        </form>
      )}
    </section>
  );
}
