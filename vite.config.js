import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function getCommitTimestamp() {
  try {
    const value = execSync("git log -1 --format=%cI", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    return Number.isNaN(Date.parse(value)) ? null : value;
  } catch {
    return null;
  }
}

export default defineConfig({
  plugins: [react()],
  define: {
    __COMMIT_TIMESTAMP__: JSON.stringify(getCommitTimestamp()),
  },
});
