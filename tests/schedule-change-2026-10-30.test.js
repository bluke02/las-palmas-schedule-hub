import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Oct 30 Las Palmas games are cancelled and Minors B is rescheduled", () => {
  assert.deepEqual(
    games.filter(
      (game) => game.date === "2026-10-30" && game.location === "Las Palmas"
    ),
    []
  );
  assert.deepEqual(
    games.find((game) => game.id === "d66-2026-10-30-02"),
    {
      id: "d66-2026-10-30-02",
      date: "2026-10-29",
      day: "Thursday",
      start: "5:30 PM",
      end: "7:00 PM",
      division: "Baseball - Minors B",
      away: "LP Heavy Hitters - Covarrubias",
      home: "LP Red Tails Minors B - Gomez",
      hostLeague: "Las Palmas",
      location: "Las Palmas",
      field: "East Field",
      rawDivision: "Minor B",
      notes: "Friday Minor B",
    }
  );
  assert.equal(gameRevisions["d66-2026-10-30-02"], "2026-10-20T20:35:53Z");
  assert.equal(
    games.some((game) => game.id === "optional-friday-seniors-2026-10-30"),
    false
  );
  assert.equal(
    gameRevisions["optional-friday-seniors-2026-10-30"],
    undefined
  );
});
