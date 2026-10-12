import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);

test("Oct 30 Minors B game is rescheduled to Nov 2", () => {
  const game = games.find((entry) => entry.id === "d66-2026-10-30-01");

  assert.deepEqual(
    {
      date: game.date,
      day: game.day,
      start: game.start,
      end: game.end,
      division: game.division,
      away: game.away,
      home: game.home,
      location: game.location,
      field: game.field,
      notes: game.notes,
    },
    {
      date: "2026-11-02",
      day: "Monday",
      start: "6:00 PM",
      end: "7:30 PM",
      division: "Baseball - Minors B",
      away: "LP The Mighty A's - Beltran",
      home: "LP Strikers - Salas",
      location: "Las Palmas",
      field: "West Field",
      notes: undefined,
    }
  );
});
