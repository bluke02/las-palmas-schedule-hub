import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Oct 30 originals remain cancelled while Minors B games are rescheduled", () => {
  const originals = games.filter(
    (game) => game.date === "2026-10-30" && game.location === "Las Palmas"
  );
  assert.equal(originals.length, 3);
  assert.ok(originals.every((game) => game.status === "cancelled"));

  assert.deepEqual(
    games.find((game) => game.id === "d66-2026-10-30-02"),
    {
      id: "d66-2026-10-30-02",
      date: "2026-10-30",
      day: "Friday",
      start: "6:00 PM",
      end: "7:30 PM",
      division: "Baseball - Minors B",
      away: "LP Heavy Hitters - Covarrubias",
      home: "LP Red Tails Minors B - Gomez",
      hostLeague: "Las Palmas",
      location: "Las Palmas",
      field: "East Field",
      rawDivision: "Minor B",
      status: "cancelled",
      notes: "Friday Minor B; cancelled; rescheduled to October 29",
    }
  );
  assert.ok(gameRevisions["d66-2026-10-30-02"]);
  assert.equal(games.find((game) => game.id === "d66-2026-10-29-01").date, "2026-10-29");
  assert.equal(games.find((game) => game.id === "d66-2026-11-02-01").date, "2026-11-02");
  assert.equal(
    games.find((game) => game.id === "optional-friday-seniors-2026-10-30").status,
    "cancelled"
  );
  assert.ok(gameRevisions["optional-friday-seniors-2026-10-30"]);
});
