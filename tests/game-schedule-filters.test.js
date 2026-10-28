import assert from "node:assert/strict";
import test from "node:test";
import {
  filterGamesForSchedule,
  getScheduledGames,
} from "../src/utils/gameSchedule.js";

const games = [
  {
    id: "lp-game",
    division: "Baseball - Minors A",
    home: "LP Tigers",
    away: "LP Eagles",
    location: "Las Palmas",
    field: "East Field",
  },
  {
    id: "cancelled-lp-game",
    division: "Baseball - Minors A",
    home: "LP Tigers",
    away: "LP Eagles",
    location: "Las Palmas",
    field: "East Field",
    status: "cancelled",
  },
  {
    id: "other-game",
    division: "Baseball - Minors A",
    home: "SDA Tigers",
    away: "Encanto Eagles",
    location: "SDA",
    field: "East Field",
  },
  {
    id: "different-division",
    division: "Baseball - Minors B",
    home: "SDA Tigers",
    away: "Encanto Eagles",
    location: "SDA",
    field: "West Field",
  },
];

test("master schedule includes non-LP games while applying selected filters", () => {
  const filteredGames = filterGamesForSchedule(games, {
    selectedProgram: "Baseball",
    selectedDivision: "Baseball - Minors A",
    selectedTeamName: "SDA Tigers",
    selectedLocation: "SDA",
    selectedField: "East Field",
    master: true,
  });

  assert.deepEqual(
    filteredGames.map((game) => game.id),
    ["other-game"]
  );
});

test("LP game schedule remains limited to LP teams", () => {
  const filteredGames = filterGamesForSchedule(games, {
    selectedProgram: "",
    selectedDivision: "",
    selectedTeamName: "",
    selectedLocation: "",
    selectedField: "",
    master: false,
  });

  assert.deepEqual(
    filteredGames.map((game) => game.id),
    ["lp-game", "cancelled-lp-game"]
  );
});

test("active schedule views exclude cancelled games", () => {
  assert.deepEqual(
    getScheduledGames(games).map((game) => game.id),
    ["lp-game", "other-game", "different-division"]
  );
});
