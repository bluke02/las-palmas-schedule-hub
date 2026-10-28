import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const games = JSON.parse(
  await readFile(new URL("../src/data/games.json", import.meta.url), "utf8")
);
const gameRevisions = JSON.parse(
  await readFile(new URL("../src/data/gameRevisions.json", import.meta.url), "utf8")
);

test("rescheduled Oct 28 and Nov 3 games are included", () => {
  assert.deepEqual(
    games
      .filter((game) =>
        [
          "sb-2026-10-28-02",
          "d66-2026-10-28-01",
          "d66-2026-11-03-01",
        ].includes(game.id)
      )
      .map(({ id, date, day, start, end, away, home, location, field, notes }) => ({
        id,
        date,
        day,
        start,
        end,
        away,
        home,
        location,
        field,
        notes,
      })),
    [
      {
        id: "sb-2026-10-28-02",
        date: "2026-10-28",
        day: "Wednesday",
        start: "5:30 PM",
        end: "7:00 PM",
        away: "Sooners",
        home: "LP PocoLocas - Cortez",
        location: "South Bay",
        field: "SBLL Field 3",
        notes: "Rescheduled from October 24",
      },
      {
        id: "d66-2026-10-28-01",
        date: "2026-10-28",
        day: "Wednesday",
        start: "7:00 PM",
        end: "8:30 PM",
        away: "LP Dirtbags - Ybarra",
        home: "LP Coyotes - Rodriguez",
        location: "Las Palmas",
        field: "East Field",
        notes: "Rescheduled from October 24",
      },
      {
        id: "d66-2026-11-03-01",
        date: "2026-11-03",
        day: "Tuesday",
        start: "5:30 PM",
        end: "7:00 PM",
        away: "SDA CAPS",
        home: "LP The Mighty A's - Beltran",
        location: "Las Palmas",
        field: "East Field",
        notes: "Rescheduled from October 24",
      },
    ]
  );
  for (const id of [
    "sb-2026-10-28-02",
    "d66-2026-10-28-01",
    "d66-2026-11-03-01",
  ]) {
    assert.equal(gameRevisions[id], "2026-10-28T01:19:45Z");
  }
  for (const id of [
    "sb-2026-10-24-02",
    "d66-2026-10-24-03",
    "d66-2026-10-24-10",
  ]) {
    const original = games.find((game) => game.id === id);
    assert.equal(original.status, "cancelled", id);
    assert.match(original.notes, /rescheduled/i, id);
  }
});
