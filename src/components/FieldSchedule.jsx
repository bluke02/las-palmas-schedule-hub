import games from "../data/games.json";
import gameRevisions from "../data/gameRevisions.json";
import schedule from "../data/schedule.json";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatRevisionTimestamp(timestamp) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function timeToMinutes(time) {
  if (time === "TBD") {
    return Number.MAX_SAFE_INTEGER;
  }

  const [, hour, minute, meridiem] = time.match(
    /^(\d{1,2}):(\d{2})\s(AM|PM)$/
  );
  let normalizedHour = Number(hour) % 12;

  if (meridiem === "PM") {
    normalizedHour += 12;
  }

  return normalizedHour * 60 + Number(minute);
}

function sortGames(gamesToSort) {
  return [...gamesToSort].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      timeToMinutes(a.start) - timeToMinutes(b.start)
  );
}

export default function FieldSchedule({
  selectedProgram,
  selectedDivision,
  selectedTeam,
}) {
  const selectedTeamName = schedule.find(
    (team) => team.id === selectedTeam
  )?.team;
  const gamesForView = games.filter(
    (game) =>
      (!selectedProgram ||
        game.division.startsWith(`${selectedProgram} - `) ||
        game.division === selectedProgram) &&
      (!selectedDivision || game.division === selectedDivision) &&
      (!selectedTeamName ||
        game.home === selectedTeamName ||
        game.away === selectedTeamName)
  );
  const gamesByField = [...new Set(gamesForView.map((game) => game.field))]
    .sort((a, b) => a.localeCompare(b))
    .map((field) => ({
      field,
      games: sortGames(gamesForView.filter((game) => game.field === field)),
    }));

  return (
    <section
      className="schedule-overview"
      aria-labelledby="field-games-heading"
    >
      <h2 id="field-games-heading">Game Schedule by Field</h2>
      <p className="schedule-intro">
        Fall 2026 games grouped by field and ordered by date and start time.
      </p>

      {gamesByField.length > 0 ? (
        <div className="field-schedules">
          {gamesByField.map(({ field, games: fieldGames }) => (
            <section className="field-schedule" key={field}>
              <h3>{field}</h3>
              <div className="schedule-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Time</th>
                      <th scope="col">Division</th>
                      <th scope="col">Away Team</th>
                      <th scope="col">Home Team</th>
                      <th scope="col">Location</th>
                      <th scope="col">Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldGames.map((game) => (
                      <tr key={game.id}>
                        <td>{formatDate(game.date)}</td>
                        <td>{game.start} - {game.end}</td>
                        <td>{game.division}</td>
                        <td>{game.away}</td>
                        <td>{game.home}</td>
                        <td>{game.location}</td>
                        <td>
                          {game.field}
                          {gameRevisions[game.id] && (
                            <span className="field-revision">
                              Updated{" "}
                              {formatRevisionTimestamp(gameRevisions[game.id])}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="empty-schedule">
          No games are listed for the selected program, division, or team.
        </p>
      )}
    </section>
  );
}
