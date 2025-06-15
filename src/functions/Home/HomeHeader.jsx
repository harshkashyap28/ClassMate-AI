import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./homeheader.css";

const HomeHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  }; 

  return (
    <header className="home-header">
      <h1 className="home-title">ClassMate AI</h1>
      <nav className="home-nav">
        <Link to="/home">Home</Link>
        <Link to="/profile">Profile</Link> {/* Correct Client-Side Navigation */}
        <Link to="/assignments">Assignments</Link>
        <Link to="/summarizer">Notes</Link>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default HomeHeader;
