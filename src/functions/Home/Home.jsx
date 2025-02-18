import React, { useEffect } from "react";
import HomeHeader from "./HomeHeader";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleAttendance = () => {
    // Placeholder for attendance feature
    alert("Attendance functionality coming soon!");
  };

  const handleAssignments = () => {
    // Placeholder for assignments feature
    alert("Assignments feature coming soon!");
  };

  const handleQuiz = () => {
    navigate("/quiz"); // Redirect to the quiz page
  };
  
  const handleNotesSummarizer = () => {
    // Navigate to the Notes Summarizer page
    navigate("/summarizer");
  };

  // Add particle animation dynamically
  useEffect(() => {
    const particlesContainer = document.querySelector(".particles");
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${Math.random() * 5 + 3}s`;
      particlesContainer.appendChild(particle);
    }
  }, []);

  return (
    <div className="home-page">
      {/* Animated Background Particles */}
      <div className="particles"></div>

      {/* Header */}
      <HomeHeader />

      {/* Main Content */}
      <main className="home-content">
        <h2 className="welcome-message animate__animated animate__fadeInDown">
          Welcome back, {user ? user.name : "User"}! 👋
        </h2>
        <p className="welcome-subtext animate__animated animate__fadeInUp">
          Your dashboard is ready. Manage your assignments, notes, attendance, and more.
        </p>

        {/* Features Grid */}
        <div className="features-grid">
          {/* Attendance Feature */}
          <div className="feature-card animate__animated animate__fadeInLeft">
            <h3>📅 Attendance</h3>
            <p>Mark your attendance and view records.</p>
            <button className="btn btn-primary" onClick={handleAttendance}>
              Mark Attendance
            </button>
          </div>

          {/* Assignments Feature */}
          <div className="feature-card animate__animated animate__fadeInLeft">
            <h3>📚 Assignments</h3>
            <p>Track your assignments and deadlines.</p>
            <button className="btn btn-primary" onClick={handleAssignments}>
              View Assignments
            </button>
          </div>

          {/* Quiz Feature */}
          <div className="feature-card animate__animated animate__fadeInRight">
            <h3>🧠 Quiz</h3>
            <p>Take quizzes and enhance your knowledge.</p>
            <button className="btn btn-primary" onClick={handleQuiz}>
              Start Quiz
            </button>
          </div>

          {/* Notes Summarizer Feature */}
          <div className="feature-card animate__animated animate__fadeInRight">
            <h3>📝 Notes Summarizer</h3>
            <p>Generate summaries for your uploaded PDFs.</p>
            <button className="btn btn-primary" onClick={handleNotesSummarizer}>
              Summarize Note
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
