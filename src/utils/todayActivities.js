const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function toLocalDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function timeToMinutes(time) {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(time || "");

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const hour = (Number(match[1]) % 12) + (match[3] === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

export function getTodayActivities(games, practices, today = new Date()) {
  const dateString = toLocalDateString(today);
  const dayName = DAY_NAMES[today.getDay()];

  const todaysGames = games
    .filter((game) => game.date === dateString)
    .map((game) => ({ ...game, type: "game" }));
  const todaysPractices = practices
    .filter((practice) => practice.day === dayName)
    .map((practice) => ({ ...practice, type: "practice" }));

  return [...todaysGames, ...todaysPractices].sort(
    (a, b) =>
      timeToMinutes(a.start) - timeToMinutes(b.start) ||
      (a.type === b.type ? 0 : a.type === "game" ? -1 : 1)
  );
}
