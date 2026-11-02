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
      end: "11:45 AM",
      away: "LP Dirtbags - Ybarra",
      home: "LP Coyotes - Rodriguez",
      hostLeague: "Las Palmas",
      location: "Las Palmas",
      field: "East Field",
    }
  );
  assert.equal(gameRevisions[game.id], "2026-11-02T18:41:13Z");
});
