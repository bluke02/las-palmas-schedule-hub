import { useState } from "react";
import TeamFinder from "../components/TeamFinder";
import TodayView from "../components/TodayView";
import ScheduleOverview from "../components/ScheduleOverview";
import MakeupSlots from "../components/MakeupSlots";
import GameSchedule from "../components/GameSchedule";
import GameChangeRequest from "../components/GameChangeRequest";
import ShareSchedule from "../components/ShareSchedule";
import gameRevisions from "../data/gameRevisions.json";
import { getLatestGameRevision } from "../utils/gameRevisions";

const latestGameRevision = getLatestGameRevision(gameRevisions);
const formattedLatestGameRevision = latestGameRevision
  ? new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(latestGameRevision))
  : null;

export default function Home() {
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <>
      <section className="hero">
        <img
          className="hero-logo"
          src="/logo.png"
          alt="Las Palmas"
        />

        <h1>Las Palmas Schedule Hub</h1>

        <p>
          Fall 2026 practice and game schedules,
          team information, and field assignments.
        </p>
        {latestGameRevision && (
          <p className="schedule-last-updated">
            Schedule last updated{" "}
            <time dateTime={latestGameRevision}>
              {formattedLatestGameRevision}
            </time>
          </p>
        )}
        <ShareSchedule />
      </section>

      <div className="container">
        <div className="card">
          <TeamFinder
            selectedProgram={selectedProgram}
            selectedDivision={selectedDivision}
            selectedTeam={selectedTeam}
            selectedLocation={selectedLocation}
            selectedField={selectedField}
            onProgramChange={(program) => {
              setSelectedProgram(program);
              setSelectedDivision("");
              setSelectedTeam("");
            }}
            onDivisionChange={(division) => {
              setSelectedDivision(division);
              setSelectedTeam("");
            }}
            onTeamChange={setSelectedTeam}
            onLocationChange={(location) => {
              setSelectedLocation(location);
              setSelectedField("");
            }}
            onFieldChange={setSelectedField}
          />
        </div>

        <div className="schedule-tabs" role="tablist" aria-label="Schedule views">
          <button
            className={activeTab === "today" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("today")}
            role="tab"
            aria-selected={activeTab === "today"}
          >
            Today
          </button>
          <button
            className={activeTab === "schedule" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("schedule")}
            role="tab"
            aria-selected={activeTab === "schedule"}
          >
            Recurring Schedule
          </button>
          <button
            className={activeTab === "makeup" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("makeup")}
            role="tab"
            aria-selected={activeTab === "makeup"}
          >
            Makeup Slots
          </button>
          <button
            className={activeTab === "games" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("games")}
            role="tab"
            aria-selected={activeTab === "games"}
          >
            Game Schedule (LP Teams)
          </button>
          <button
            className={activeTab === "master" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("master")}
            role="tab"
            aria-selected={activeTab === "master"}
          >
            D66 Master Schedule
          </button>
          <button
            className="tab-button"
            onClick={() => window.open("/calendar", "_blank", "noopener")}
          >
            Calendar View
          </button>
          <button
            className={activeTab === "change-request" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("change-request")}
            role="tab"
            aria-selected={activeTab === "change-request"}
          >
            Request a Change
          </button>
        </div>

        {activeTab === "today" ? (
          <TodayView />
        ) : activeTab === "schedule" ? (
          <ScheduleOverview
            selectedProgram={selectedProgram}
            selectedDivision={selectedDivision}
            selectedTeam={selectedTeam}
            selectedLocation={selectedLocation}
          />
        ) : activeTab === "games" ? (
          <GameSchedule
            selectedProgram={selectedProgram}
            selectedDivision={selectedDivision}
            selectedTeam={selectedTeam}
            selectedLocation={selectedLocation}
            selectedField={selectedField}
          />
        ) : activeTab === "master" ? (
          <GameSchedule
            master
            selectedProgram={selectedProgram}
            selectedDivision={selectedDivision}
            selectedTeam={selectedTeam}
            selectedLocation={selectedLocation}
            selectedField={selectedField}
          />
        ) : activeTab === "change-request" ? (
          <GameChangeRequest />
        ) : (
          <MakeupSlots />
        )}
      </div>
    </>
  );
}
