import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("Cherry Bombs vs. Fabulosas is scheduled during Fabulosas practice", () => {
  const game = games.find((entry) => entry.id === "d66-2026-11-03-02");

  assert.deepEqual(
    {
      date: game?.date,
      day: game?.day,
      start: game?.start,
      end: game?.end,
      division: game?.division,
      away: game?.away,
      home: game?.home,
      hostLeague: game?.hostLeague,
      location: game?.location,
      field: game?.field,
    },
    {
      date: "2026-11-03",
      day: "Tuesday",
      start: "7:00 PM",
      end: "8:30 PM",
      division: "Softball - Seniors",
      away: "Cherry Bombs",
      home: "LP Fabulosas - Masino",
      hostLeague: "Las Palmas",
      location: "Las Palmas",
      field: "East Field",
    }
  );
  assert.equal(gameRevisions["d66-2026-11-03-02"], "2026-11-01T05:51:02Z");
});
