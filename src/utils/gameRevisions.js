export function getLatestGameRevision(revisions) {
  return Object.values(revisions)
    .filter(
      (timestamp) =>
        typeof timestamp === "string" && Number.isFinite(Date.parse(timestamp))
    )
    .reduce(
      (latest, timestamp) =>
        latest === null || Date.parse(timestamp) > Date.parse(latest)
          ? timestamp
          : latest,
      null
    );
}
