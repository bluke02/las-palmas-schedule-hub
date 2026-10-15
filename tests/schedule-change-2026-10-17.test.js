import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);

test("Oct 17 LP Coyotes–TH Majors game starts at 11 AM", () => {
  const game = games.find((entry) => entry.id === "d66-2026-10-17-11");

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
      date: "2026-10-17",
      start: "11:00 AM",
      end: "1:00 PM",
      away: "LP Coyotes - Rodriguez",
      home: "TH Majors",
      location: "Encanto",
      field: "Majors Field / Field 1",
    }
  );
});

test("Oct 17 LP Heavy Hitters–SDA CAPS game is cancelled", () => {
  assert.equal(
    games.some((entry) => entry.id === "d66-2026-10-17-07"),
    false
  );
});
