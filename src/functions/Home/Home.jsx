import React, { useEffect, useState } from "react";
import HomeHeader from "./HomeHeader";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";  // Firebase Auth for getting current user
import { getFirestore, doc, getDoc } from "firebase/firestore";  // Firestore for fetching user data
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const auth = getAuth();
  const db = getFirestore();

  // Fetch the user data from Firestore when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Get user data from Firestore using the user ID (UID)
          const userRef = doc(db, "users", user.uid);  // Assuming "users" is the collection
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Assuming the first name is stored as "name" in the user profile
            if (userData.name) {
              setUserName(userData.name.split(" ")[0]);  // Get the first name
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [auth, db]);

  const handleAttendance = () => {
    navigate("/attendance");
  };

  const handleAssignments = () => {
    navigate("/assignments");
  };

  const handleQuiz = () => {
    navigate("/quiz");
  };

  const handleNotesSummarizer = () => {
    navigate("/summarizer");
  };

  // Particle animation
  useEffect(() => {
    const particlesContainer = document.querySelector(".particles");
    if (particlesContainer) {
      for (let i = 0; i < 100; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 5 + 3}s`;
        particlesContainer.appendChild(particle);
      }
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
          Welcome back, {userName}! 👋
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
