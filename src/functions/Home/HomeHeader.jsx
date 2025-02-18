import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

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
        <a href="/home">Home</a>
        <a href="/profile">Profile</a>
        <a href="/assignments">Assignments</a>
        <a href="/notes">Notes</a>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default HomeHeader;
