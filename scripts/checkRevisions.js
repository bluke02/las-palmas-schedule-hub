import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const DATA_FILES = ["src/data/games.json", "src/data/schedule.json"];
const REVISIONS_FILE = "src/data/gameRevisions.json";

export function findMissingRevisions(baseData, headData, baseRevisions, headRevisions) {
  const missing = [];
  for (const [file, headEntries] of Object.entries(headData)) {
    const baseById = new Map((baseData[file] ?? []).map((e) => [e.id, e]));
    for (const entry of headEntries) {
      const before = baseById.get(entry.id);
      const changed = !before || JSON.stringify(before) !== JSON.stringify(entry);
      if (!changed) continue;
      const revision = headRevisions[entry.id];
      if (!revision || Number.isNaN(Date.parse(revision)) || revision === baseRevisions[entry.id]) {
        missing.push(`${file}: ${entry.id}`);
      }
    }
  }
  return missing;
}

function readAtRef(ref, file) {
  try {
    return JSON.parse(execFileSync("git", ["show", `${ref}:${file}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return null;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const baseRef = process.argv[2];
  if (!baseRef) {
    console.error("Usage: node scripts/checkRevisions.js <base-ref>");
    process.exit(2);
  }
  const baseData = {};
  const headData = {};
  for (const file of DATA_FILES) {
    baseData[file] = readAtRef(baseRef, file) ?? [];
    headData[file] = JSON.parse(readFileSync(file, "utf8"));
  }
  const baseRevisions = readAtRef(baseRef, REVISIONS_FILE) ?? {};
  const headRevisions = JSON.parse(readFileSync(REVISIONS_FILE, "utf8"));
  const missing = findMissingRevisions(baseData, headData, baseRevisions, headRevisions);
  if (missing.length) {
    console.error(`Add or update a timestamp in ${REVISIONS_FILE} for:\n${missing.join("\n")}`);
    process.exit(1);
  }
  console.log("Schedule revision timestamps are up to date.");
}
