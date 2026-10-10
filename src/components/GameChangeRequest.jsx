import { useRef, useState } from "react";
import games from "../data/games.json";

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

const NEAR_PAST_DAYS = 7;

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  if (date.toISOString().slice(0, 10) !== value) return false;
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
    setSubmissionState("submitting");

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) {
        throw new Error("Request submission failed");
      }

      formRef.current.reset();
      setSelectedGameId("");
      setChangeType("");
      setSubmissionState("success");
    } catch {
      setSubmissionState("error");
    }
  }

  return (
    <section className="change-request" aria-labelledby="change-request-heading">
      <h2 id="change-request-heading">Request a Game Schedule Change</h2>
      <p className="schedule-intro">
        Tell us which game needs an adjustment and what you’re requesting.
        We’ll use your contact information to verify the request before
        approval. Submitting a request does not automatically change the schedule.
      </p>

      {submissionState === "success" ? (
        <p className="change-request-status" role="status">
          Thank you. Your request has been sent for review.
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
          <input
            type="hidden"
            name="form-name"
            value="game-change-request"
          />
          <p className="change-request-honeypot">
            <label>
              Leave this field blank
              <input name="bot-field" />
            </label>
          </p>

          <div className="change-request-fields">
            <fieldset className="change-request-contact change-request-wide">
              <legend>Contact Information</legend>
              <p>Required so we can follow up to validate your request.</p>
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
              <input name="team" type="text" />
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
            {selectedGame && (
              <input
                type="hidden"
                name="game-details"
                value={describeGame(selectedGame)}
              />
            )}
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
              <textarea name="reason" rows="4" required />
            </label>
          </div>

          {validationError && (
            <p className="change-request-error" role="alert">
              {validationError}
            </p>
          )}
          {submissionState === "error" && (
            <p className="change-request-error" role="alert">
              We couldn’t send your request. Please try again later.
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
