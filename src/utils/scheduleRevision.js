export function getLatestScheduleRevision(revisions) {
  return Object.values(revisions).reduce((latest, timestamp) => {
    if (Number.isNaN(Date.parse(timestamp))) {
      return latest;
    }

    return !latest || Date.parse(timestamp) > Date.parse(latest)
      ? timestamp
      : latest;
  }, null);
}
