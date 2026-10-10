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

export default function GameChangeRequest() {
  const [selectedGameId, setSelectedGameId] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");
  const formRef = useRef(null);
  const selectedGame = games.find((game) => game.id === selectedGameId);
  const sortedGames = [...games].sort(
    (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmissionState("submitting");

    const formData = new FormData(formRef.current);

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
              <select name="change-type" defaultValue="" required>
                <option value="" disabled>
                  Select a change
                </option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="location-or-field">Location or field</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Requested date
              <input name="requested-date" type="date" />
            </label>
            <label>
              Requested start time
              <input name="requested-time" type="time" />
            </label>
            <label>
              Requested location
              <input name="requested-location" type="text" />
            </label>
            <label>
              Requested field
              <input name="requested-field" type="text" />
            </label>
            <label className="change-request-wide">
              Reason or additional details <span aria-hidden="true">*</span>
              <textarea name="reason" rows="4" required />
            </label>
          </div>

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
