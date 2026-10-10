import { useEffect, useMemo, useState } from "react";
import games from "../data/games.json";
import schedule from "../data/schedule.json";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function toKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function timeToMinutes(time) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return ((Number(match[1]) % 12) + (match[3] === "PM" ? 12 : 0)) * 60 +
    Number(match[2]);
}

function buildEvents() {
  const keys = games.map((game) => game.date).sort();
  const first = parseKey(keys[0]);
  const last = parseKey(keys[keys.length - 1]);
  const byDate = {};
  const add = (key, event) => {
    (byDate[key] ||= []).push(event);
  };

  games.forEach((game) =>
    add(game.date, {
      id: `game-${game.id}`,
      type: "game",
      title: game.bye ? `${game.away} (Bye)` : `${game.away} v ${game.home}`,
      bye: game.bye,
      start: game.start,
      end: game.end,
      division: game.division,
      location: game.location,
      field: game.field,
      away: game.away,
      home: game.home,
      notes: game.notes,
    })
  );

  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const weekday = WEEKDAYS[d.getDay()];
    schedule
      .filter((team) => team.day === weekday)
      .forEach((team) =>
        add(toKey(d), {
          id: `practice-${team.id}-${toKey(d)}`,
          type: "practice",
          title: `${team.team} (Practice)`,
          start: team.start,
          end: team.end,
          division: team.division,
          location: "Las Palmas",
          field: team.field,
        })
      );
  }

  Object.values(byDate).forEach((list) =>
    list.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
  );

  return { byDate, first, last };
}

export default function CalendarView() {
  const { byDate, first, last } = useMemo(buildEvents, []);
  const [month, setMonth] = useState(
    new Date(first.getFullYear(), first.getMonth(), 1)
  );
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = "Calendar View - Las Palmas Schedule Hub";
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const leading = month.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [
    ...Array(leading).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const canPrev =
    year * 12 + monthIndex > first.getFullYear() * 12 + first.getMonth();
  const canNext =
    year * 12 + monthIndex < last.getFullYear() * 12 + last.getMonth();
  const shift = (delta) => setMonth(new Date(year, monthIndex + delta, 1));

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <button className="tab-button" onClick={() => shift(-1)} disabled={!canPrev}>
          ← Prev
        </button>
        <h1>
          {new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
          }).format(month)}
        </h1>
        <button className="tab-button" onClick={() => shift(1)} disabled={!canNext}>
          Next →
        </button>
      </header>
      <p className="calendar-legend">
        <span className="legend-swatch game" /> Game (Away v Home)
        <span className="legend-swatch practice" /> Practice
      </p>

      <div className="calendar-grid" role="grid">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday" role="columnheader">
            {day.slice(0, 3)}
          </div>
        ))}
        {cells.map((day, index) => {
          const key = day ? toKey(new Date(year, monthIndex, day)) : null;
          const events = key ? byDate[key] || [] : [];
          return (
            <div
              key={index}
              className={day ? "calendar-cell" : "calendar-cell empty"}
              role="gridcell"
            >
              {day && <div className="calendar-day">{day}</div>}
              {events.map((event) => (
                <button
                  key={event.id}
                  className={`calendar-event ${event.type}`}
                  onClick={() => setSelected({ ...event, date: key })}
                  title={event.title}
                >
                  <span className="calendar-event-time">
                    {event.bye ? "BYE" : event.start}
                  </span>{" "}
                  {event.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {selected && (
        <div
          className="calendar-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            className="calendar-bubble"
            role="dialog"
            aria-label="Event details"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="calendar-bubble-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2>{selected.type === "game" ? "Game" : "Practice"}</h2>
            <p className="calendar-bubble-title">{selected.title}</p>
            <dl>
              <dt>Date</dt>
              <dd>
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "full",
                }).format(parseKey(selected.date))}
              </dd>
              <dt>Time</dt>
              <dd>
                {selected.bye
                  ? "Bye week – no game"
                  : `${selected.start} - ${selected.end}`}
              </dd>
              <dt>Division</dt>
              <dd>{selected.division}</dd>
              {selected.type === "game" && !selected.bye && (
                <>
                  <dt>Away</dt>
                  <dd>{selected.away}</dd>
                  <dt>Home</dt>
                  <dd>{selected.home}</dd>
                </>
              )}
              {!selected.bye && (
                <>
                  <dt>Location</dt>
                  <dd>{selected.location}</dd>
                  <dt>Field</dt>
                  <dd>{selected.field}</dd>
                </>
              )}
              {selected.notes && (
                <>
                  <dt>Notes</dt>
                  <dd>{selected.notes}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
