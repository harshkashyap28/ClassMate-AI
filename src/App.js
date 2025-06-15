import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./functions/Authentication/Signup";
import Home from "./functions/Home/Home";
import WelcomePage from "./functions/Welcome/WelcomePage";
import AdminDashboard from "./functions/Admin/AdminDashboard";
import Summarizer from "./functions/Notes/Summarizer"; 
import GoogleSignIn from "./functions/Authentication/GoogleSignIn";
import Quiz from "./functions/Quiz/Quiz";
import Profile from "./functions/User Profile/profile";
import Assignment from "./functions/AssignmentReminder/assignment";

// Attendance-related components
import AttendanceMain from "./functions/Attendance/attendance";
import GeoAttendance from "./functions/Attendance/GeoAttendance";
import BluetoothAttendance from "./functions/Attendance/BluetoothAttendance";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/summarizer" element={<Summarizer />} />
          <Route path="/assignments" element={<Assignment />} />
          <Route path="/google-signin" element={<GoogleSignIn />} />
          <Route path="/quiz" element={<Quiz />} />

          {/* Updated Attendance Routes */}
          <Route path="/attendance" element={<AttendanceMain />} />
          <Route path="/attendance/geo" element={<GeoAttendance />} />
          <Route path="/attendance/bluetooth" element={<BluetoothAttendance />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
