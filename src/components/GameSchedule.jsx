import games from "../data/games.json";
import schedule from "../data/schedule.json";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default function GameSchedule({
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
  const gamesByField = [...new Set(gamesForView.map((game) => game.field))].map(
    (field) => ({
      field,
      games: gamesForView.filter((game) => game.field === field),
    })
  );

  return (
    <section className="schedule-overview" aria-labelledby="games-heading">
      <h2 id="games-heading">Game Schedule</h2>
      <p className="schedule-intro">
        Fall 2026 games grouped by field and filtered by the selected program,
        division, or team.
      </p>

      {gamesByField.length > 0 ? (
        <div className="field-schedules">
          {gamesByField.map(({ field, games: fieldGames }) => (
            <div className="field-schedule" key={field}>
              <h3>{field}</h3>
              <div className="schedule-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Time</th>
                      <th scope="col">Division</th>
                      <th scope="col">Home Team</th>
                      <th scope="col">Away Team</th>
                      <th scope="col">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldGames.map((game) => (
                      <tr key={game.id}>
                        <td>{formatDate(game.date)}</td>
                        <td>{game.start} - {game.end}</td>
                        <td>{game.rawDivision}</td>
                        <td>{game.home}</td>
                        <td>{game.away}</td>
                        <td>{game.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-schedule">
          No games are listed for the selected program, division, or team.
        </p>
      )}

      <p className="pending-schedule">
        Additional East and West field game schedules will be added when
        available.
      </p>
    </section>
  );
}
