import games from "../data/games.json";
import gameRevisions from "../data/gameRevisions.json";
import schedule from "../data/schedule.json";
import { filterGamesForSchedule } from "../utils/gameSchedule.js";

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
  if (time === "TBD" || time === "BYE") {
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

export default function GameSchedule({
  selectedProgram,
  selectedDivision,
  selectedTeam,
  selectedLocation,
  selectedField,
  master = false,
}) {
  const selectedTeamName = schedule.find(
    (team) => team.id === selectedTeam
  )?.team;
  const gamesForView = filterGamesForSchedule(games, {
    selectedProgram,
    selectedDivision,
    selectedTeamName,
    selectedLocation,
    selectedField,
    master,
  });
  const sortedGames = sortGames(gamesForView);

  return (
    <section className="schedule-overview" aria-labelledby="games-heading">
      <h2 id="games-heading">
        {master ? "D66 Master Schedule" : "Game Schedule (LP Teams)"}
      </h2>
      <p className="schedule-intro">
        {master
          ? "All league games, including games between non-LP teams, sorted by date and start time."
          : "Fall 2026 games involving Las Palmas teams, sorted by date and start time, with division, field, and location details."}
      </p>

      {sortedGames.length > 0 ? (
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
              {sortedGames.map((game) => (
                <tr key={game.id}>
                  <td>{formatDate(game.date)}</td>
                  <td>{game.bye ? "Bye week" : `${game.start} - ${game.end}`}</td>
                  <td>{game.division}</td>
                  <td>{game.away}</td>
                  <td>{game.bye ? "BYE" : game.home}</td>
                  <td>{game.bye ? "—" : game.location}</td>
                  <td>
                    {game.bye ? "—" : game.field}
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
      ) : (
        <p className="empty-schedule">
          No games are listed for the selected filters.
        </p>
      )}
    </section>
  );
}
