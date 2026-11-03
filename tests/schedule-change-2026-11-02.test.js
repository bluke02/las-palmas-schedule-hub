import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Nov 2 game is cancelled and rescheduled to Nov 10 on East Field", () => {
  const original = games.find((entry) => entry.id === "d66-2026-10-30-01");
  assert.equal(original.date, "2026-10-30");
  assert.equal(original.status, "cancelled");

  const cancelled = games.find((entry) => entry.id === "d66-2026-11-02-01");
  assert.equal(cancelled.status, "cancelled");
  assert.match(cancelled.notes, /cancelled due to no lights/i);
  assert.match(cancelled.notes, /rescheduled to November 10/i);

  const game = games.find((entry) => entry.id === "d66-2026-11-10-01");

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
      date: "2026-11-10",
      day: "Tuesday",
      start: "6:00 PM",
      end: "7:30 PM",
      division: "Baseball - Minors B",
      away: "LP The Mighty A's - Beltran",
      home: "LP Strikers - Salas",
      location: "Las Palmas",
      field: "East Field",
      notes: "Rescheduled from November 2",
    }
  );
  assert.equal(gameRevisions["d66-2026-11-02-01"], "2026-11-03T22:06:05Z");
  assert.equal(gameRevisions["d66-2026-11-10-01"], "2026-11-03T22:06:05Z");
});
