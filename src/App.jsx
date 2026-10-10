import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CalendarView from "./pages/CalendarView";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calendar" element={<CalendarView />} />
    </Routes>
  );
}
