import games from "../data/games.json";
import schedule from "../data/schedule.json";
import { getTodayActivities } from "../utils/todayActivities.js";

export default function TodayView() {
  const today = new Date();
  const activities = getTodayActivities(games, schedule, today);
  const heading = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(today);

  return (
    <section className="schedule-overview" aria-labelledby="today-heading">
      <h2 id="today-heading">Today: {heading}</h2>
      <p className="schedule-intro">
        Games and practices scheduled for today, ordered by start time.
      </p>

      {activities.length > 0 ? (
        <div className="schedule-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Team / Matchup</th>
                <th>Division</th>
                <th>Location</th>
                <th>Field</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) =>
                activity.type === "game" ? (
                  <tr key={activity.id}>
                    <td>
                      {activity.bye
                        ? "Bye week"
                        : `${activity.start} - ${activity.end}`}
                    </td>
                    <td>Game</td>
                    <td>
                      {activity.bye
                        ? `${activity.away} (BYE)`
                        : `${activity.away} @ ${activity.home}`}
                    </td>
                    <td>{activity.division}</td>
                    <td>{activity.bye ? "—" : activity.location}</td>
                    <td>{activity.bye ? "—" : activity.field}</td>
                    <td>{activity.notes || "—"}</td>
                  </tr>
                ) : (
                  <tr key={`practice-${activity.id}`}>
                    <td>{`${activity.start} - ${activity.end}`}</td>
                    <td>Practice</td>
                    <td>{activity.team}</td>
                    <td>{activity.division}</td>
                    <td>Las Palmas</td>
                    <td>{activity.field}</td>
                    <td>{activity.notes || "—"}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-schedule">
          Nothing is scheduled for today. Check the other tabs for upcoming
          practices and games.
        </p>
      )}
    </section>
  );
}
