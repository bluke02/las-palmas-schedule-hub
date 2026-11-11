import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Nov 14 Dirtbags vs Coyotes game is updated to Las Palmas East Field", () => {
  const game = games.find((entry) => entry.id === "d66-2026-11-14-05");

  assert.deepEqual(
    {
      date: game.date,
      start: game.start,
      end: game.end,
      away: game.away,
      home: game.home,
      hostLeague: game.hostLeague,
      location: game.location,
      field: game.field,
    },
    {
      date: "2026-11-14",
      start: "10:45 AM",
      end: "12:30 PM",
      away: "LP Dirtbags - Ybarra",
      home: "LP Coyotes - Rodriguez",
      hostLeague: "Las Palmas",
      location: "Las Palmas",
      field: "East Field",
    }
  );
  assert.equal(gameRevisions[game.id], "2026-11-02T18:56:54Z");
});

test("Nov 14 Storm vs Violent Vipers game starts at 12:45 PM", () => {
  const game = games.find((entry) => entry.id === "sb-2026-11-14-11");

  assert.deepEqual(
    {
      date: game.date,
      start: game.start,
      end: game.end,
      away: game.away,
      home: game.home,
      location: game.location,
      field: game.field,
    },
    {
      date: "2026-11-14",
      start: "12:45 PM",
      end: "2:15 PM",
      away: "LP Violent Vipers - Trinidad",
      home: "Storm",
      location: "Las Palmas",
      field: "East Field",
    }
  );
  assert.equal(gameRevisions[game.id], "2026-11-11T17:15:23Z");
});
