import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./functions/Authentication/Signup";
import Home from "./functions/Home/Home";
import WelcomePage from "./functions/Welcome/WelcomePage";
import AdminDashboard from "./functions/Admin/AdminDashboard";
import Summarizer from "./functions/Notes/Summarizer"; // Summarizer Component
import GoogleSignIn from "./functions/Authentication/GoogleSignIn"; // Google Sign-In component
import Quiz from "./functions/Quiz/Quiz"; // Single merged Quiz Component
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/summarizer" element={<Summarizer />} />
          <Route path="/google-signin" element={<GoogleSignIn />} />
          <Route path="/quiz" element={<Quiz />} /> {/* Single route for all quiz types */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
