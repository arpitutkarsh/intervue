import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import TeacherHome from "./pages/TeacherHome.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import StudentHome from "./pages/StudentHome.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import PollHistory from "./pages/PollHistory.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher-dashboard/:id" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/student/poll" element={<StudentDashboard />} />
        <Route path="/poll-history/:pollId" element={<PollHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
