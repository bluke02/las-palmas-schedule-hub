import { useState } from "react";
import TeamFinder from "../components/TeamFinder";
import ScheduleOverview from "../components/ScheduleOverview";
import MakeupSlots from "../components/MakeupSlots";
import GameSchedule from "../components/GameSchedule";
import FieldSchedule from "../components/FieldSchedule";
import ShareSchedule from "../components/ShareSchedule";

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
            Game Schedule
          </button>
          <button
            className={activeTab === "fields" ? "tab-button active" : "tab-button"}
            onClick={() => setActiveTab("fields")}
            role="tab"
            aria-selected={activeTab === "fields"}
          >
            Games by Field
          </button>
        </div>

        {activeTab === "schedule" ? (
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
        ) : activeTab === "fields" ? (
          <FieldSchedule
            selectedProgram={selectedProgram}
            selectedDivision={selectedDivision}
            selectedTeam={selectedTeam}
            selectedLocation={selectedLocation}
            selectedField={selectedField}
          />
        ) : (
          <MakeupSlots />
        )}
      </div>
    </>
  );
}
