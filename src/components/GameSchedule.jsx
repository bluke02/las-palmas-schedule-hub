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
  const gamesByProgram = [...new Set(
    gamesForView.map((game) => game.division.split(" - ")[0])
  )].map((program) => {
    const programGames = gamesForView.filter(
      (game) => game.division.split(" - ")[0] === program
    );
    const divisions = [...new Set(programGames.map((game) => game.division))];

    return {
      program,
      divisions: divisions.map((division) => ({
        division,
        games: sortGames(
          programGames.filter((game) => game.division === division)
        ),
      })),
    };
  });

  return (
    <section className="schedule-overview" aria-labelledby="games-heading">
      <h2 id="games-heading">Game Schedule</h2>
      <p className="schedule-intro">
        Fall 2026 games grouped by program and division, with field and
        location details for every game.
      </p>

      {gamesByProgram.length > 0 ? (
        <div className="program-schedules">
          {gamesByProgram.map(({ program, divisions }) => (
            <section className="program-schedule" key={program}>
              <h3>{program}</h3>
              {divisions.map(({ division, games: divisionGames }) => (
                <div className="division-schedule" key={division}>
                  <h4>{division.split(" - ").slice(1).join(" - ") || division}</h4>
                  <div className="schedule-table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Time</th>
                          <th scope="col">Away Team</th>
                          <th scope="col">Home Team</th>
                          <th scope="col">Location</th>
                          <th scope="col">Field</th>
                        </tr>
                      </thead>
                      <tbody>
                        {divisionGames.map((game) => (
                          <tr key={game.id}>
                            <td>{formatDate(game.date)}</td>
                            <td>{game.start} - {game.end}</td>
                            <td>{game.away}</td>
                            <td>{game.home}</td>
                            <td>{game.location}</td>
                            <td>
                              {game.field}
                              {gameRevisions[game.field] && (
                                <span className="field-revision">
                                  Updated{" "}
                                  {formatRevisionTimestamp(
                                    gameRevisions[game.field]
                                  )}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <p className="empty-schedule">
          No games are listed for the selected program, division, or team.
        </p>
      )}

      {gamesForView.some((game) => game.division.startsWith("Softball - ")) && (
        <p className="pending-schedule">
          Softball Season schedule not yet final.
        </p>
      )}
    </section>
  );
}
