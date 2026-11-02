import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Oct 23 Red Tails game remains cancelled and is rescheduled to Nov 9", () => {
  const original = games.find((game) => game.id === "d66-2026-10-23-02");
  assert.equal(original.status, "cancelled");
  assert.match(original.notes, /rescheduled to November 9/i);

  const replacement = games.find((game) => game.id === "d66-2026-11-09-01");
  assert.deepEqual(
    {
      date: replacement.date,
      day: replacement.day,
      start: replacement.start,
      end: replacement.end,
      division: replacement.division,
      away: replacement.away,
      home: replacement.home,
      location: replacement.location,
      field: replacement.field,
      notes: replacement.notes,
    },
    {
      date: "2026-11-09",
      day: "Monday",
      start: "6:00 PM",
      end: "7:30 PM",
      division: "Baseball - Minors B",
      away: "LP Red Tails Minors B - Gomez",
      home: "LP Strikers - Salas",
      location: "Las Palmas",
      field: "West Field",
      notes: "Rescheduled from October 23",
    }
  );
  assert.equal(gameRevisions[original.id], "2026-11-02T17:11:55Z");
  assert.equal(gameRevisions[replacement.id], "2026-11-02T17:11:55Z");
});
