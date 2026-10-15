import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

const GAME_DATA_PATH = "src/data/games.json";
const REVISION_DATA_PATH = "src/data/gameRevisions.json";
const TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/;

function parseTimestamp(value) {
  if (typeof value !== "string") return null;

  const match = TIMESTAMP_PATTERN.exec(value);
  if (!match) return null;

  const [, year, month, day, hour, minute, second, , offsetHour, offsetMinute] =
    match;
  const calendarDate = new Date(0);
  calendarDate.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  if (
    calendarDate.getUTCFullYear() !== Number(year) ||
    calendarDate.getUTCMonth() !== Number(month) - 1 ||
    calendarDate.getUTCDate() !== Number(day) ||
    Number(hour) > 23 ||
    Number(minute) > 59 ||
    Number(second) > 59 ||
    (offsetHour !== undefined &&
      (Number(offsetHour) > 23 || Number(offsetMinute) > 59))
  ) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function indexGames(games, label, errors) {
  const indexedGames = new Map();
  if (!Array.isArray(games)) {
    errors.push(`${label} game data must be an array.`);
    return indexedGames;
  }

  for (const game of games) {
    if (!game || typeof game.id !== "string" || game.id.length === 0) {
      errors.push(`${label} contains a game without a valid ID.`);
      continue;
    }
    if (indexedGames.has(game.id)) {
      errors.push(`${label} contains duplicate game ID "${game.id}".`);
      continue;
    }
    indexedGames.set(game.id, game);
  }
  return indexedGames;
}

export function validateGameRevisions(
  baseGames,
  baseRevisions,
  currentGames,
  currentRevisions
) {
  const errors = [];
  const baseGamesById = indexGames(baseGames, "Base", errors);
  const currentGamesById = indexGames(currentGames, "Current", errors);

  if (
    !baseRevisions ||
    typeof baseRevisions !== "object" ||
    Array.isArray(baseRevisions)
  ) {
    errors.push("Base revision data must be an object.");
    baseRevisions = {};
  }
  if (
    !currentRevisions ||
    typeof currentRevisions !== "object" ||
    Array.isArray(currentRevisions)
  ) {
    errors.push("Current revision data must be an object.");
    currentRevisions = {};
  }

  for (const [gameId, game] of currentGamesById) {
    const baseGame = baseGamesById.get(gameId);
    if (baseGame && isDeepStrictEqual(baseGame, game)) continue;

    const currentTimestamp = parseTimestamp(currentRevisions[gameId]);
    if (currentTimestamp === null) {
      errors.push(
        `Changed game "${gameId}" needs a valid ISO 8601 timestamp in gameRevisions.json.`
      );
      continue;
    }

    const baseTimestampValue = baseRevisions[gameId];
    if (baseTimestampValue === undefined) continue;

    const baseTimestamp = parseTimestamp(baseTimestampValue);
    if (baseTimestamp === null) {
      errors.push(
        `Game "${gameId}" has an invalid timestamp on the base branch; replace it with a valid timestamp.`
      );
    } else if (currentTimestamp <= baseTimestamp) {
      errors.push(
        `Changed game "${gameId}" needs a timestamp later than its base-branch timestamp.`
      );
    }
  }

  return errors;
}

async function main() {
  const baseSha = process.env.BASE_SHA;
  if (!/^[a-f0-9]{40}$/i.test(baseSha ?? "")) {
    throw new Error("BASE_SHA must contain the pull request base commit SHA.");
  }

  const readBaseJson = (filePath) =>
    JSON.parse(
      execFileSync("git", ["show", `${baseSha}:${filePath}`], {
        encoding: "utf8",
      })
    );
  const readCurrentJson = (filePath) =>
    readFile(new URL(`../${filePath}`, import.meta.url), "utf8").then(
      JSON.parse
    );

  const [baseGames, baseRevisions, currentGames, currentRevisions] =
    await Promise.all([
      readBaseJson(GAME_DATA_PATH),
      readBaseJson(REVISION_DATA_PATH),
      readCurrentJson(GAME_DATA_PATH),
      readCurrentJson(REVISION_DATA_PATH),
    ]);
  const errors = validateGameRevisions(
    baseGames,
    baseRevisions,
    currentGames,
    currentRevisions
  );

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log("Changed games have valid, updated revision timestamps.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
