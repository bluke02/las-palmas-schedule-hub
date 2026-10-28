function isLpGame(game) {
  return (
    game.home.startsWith("LP") ||
    game.away.startsWith("LP") ||
    game.home.startsWith("Las Palmas") ||
    game.away.startsWith("Las Palmas")
  );
}

export function getScheduledGames(games) {
  return games.filter((game) => game.status !== "cancelled");
}

export function filterGamesForSchedule(
  games,
  {
    selectedProgram,
    selectedDivision,
    selectedTeamName,
    selectedLocation,
    selectedField,
    master,
  }
) {
  return games.filter(
    (game) =>
      (master || isLpGame(game)) &&
      (!selectedProgram ||
        game.division.startsWith(`${selectedProgram} - `) ||
        game.division === selectedProgram) &&
      (!selectedDivision || game.division === selectedDivision) &&
      (!selectedTeamName ||
        game.home === selectedTeamName ||
        game.away === selectedTeamName) &&
      (!selectedLocation || game.location === selectedLocation) &&
      (!selectedField || game.field === selectedField)
  );
}
