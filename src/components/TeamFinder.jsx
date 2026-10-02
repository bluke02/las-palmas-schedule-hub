import schedule from "../data/schedule.json";
import games from "../data/games.json";

export default function TeamFinder({
  selectedProgram,
  selectedDivision,
  selectedTeam,
  selectedLocation,
  selectedField,
  onProgramChange,
  onDivisionChange,
  onTeamChange,
  onLocationChange,
  onFieldChange,
}) {
  const programs = [...new Set(schedule.map((team) => team.division.split(" - ")[0]))];
  const locations = [...new Set(games.map((game) => game.location))]
    .sort((a, b) => a.localeCompare(b));
  const fields = [
    ...new Set(
      games
        .filter((game) => !selectedLocation || game.location === selectedLocation)
        .map((game) => game.field)
    ),
  ].sort((a, b) => a.localeCompare(b));
  const divisions = [
    ...new Set(
      schedule
        .filter(
          (team) =>
            !selectedProgram ||
            team.division.startsWith(`${selectedProgram} - `)
        )
        .map((team) => team.division)
    ),
  ];
  const filteredSchedule = schedule.filter(
    (team) =>
      (!selectedProgram ||
        team.division.startsWith(`${selectedProgram} - `)) &&
      (!selectedDivision || team.division === selectedDivision)
  );
  const teamCounts = schedule.reduce((counts, team) => {
    counts[team.team] = (counts[team.team] || 0) + 1;
    return counts;
  }, {});

  return (
    <div>
      <h2>Find My Team</h2>

      <div className="filter-controls">
        <label>
          Program
          <select
            value={selectedProgram}
            onChange={(e) => {
              onProgramChange(e.target.value);
              onTeamChange("");
            }}
          >
            <option value="">All Programs</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </label>

        <label>
          Division
          <select
            value={selectedDivision}
            onChange={(e) => {
              onDivisionChange(e.target.value);
              onTeamChange("");
            }}
          >
            <option value="">All Divisions</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </label>
        <label>
          Game Location
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
        <label>
          Game Field
          <select
            value={selectedField}
            onChange={(e) => onFieldChange(e.target.value)}
          >
            <option value="">All Fields</option>
            {fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="filter-note">
        Game location and field filters apply to Game Schedule and Games by Field.
      </p>

      <select
        value={selectedTeam}
        onChange={(e) => onTeamChange(e.target.value)}
      >
        <option value="">
          Select Your Team
        </option>

        {filteredSchedule.map((team) => (
          <option
            key={team.id}
            value={team.id}
          >
            {team.team}
            {teamCounts[team.team] > 1
              ? ` - ${team.division}`
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
