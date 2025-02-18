// WelcomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Authentication/firebase";
import './WelcomePage.css';

function WelcomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        setError("Please verify your email address before logging in.");
        return;
      }

      navigate("/home");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("user", JSON.stringify(result.user)); // Store user data
      navigate("/home");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="welcome-container">
      <div className="animated-background">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="glass-card">
        <div className="welcome-form">
          <h2 className="animate-text">Welcome to ClassMate AI</h2>
          <p className="animate-text">A smart companion to help students manage assignments, attendance, and much more!</p>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button type="submit" className="btn-success button-animate">
              Login
            </button>
            <div className="text-center">
              <p className="text-white">or</p>
              <button
                type="button"
                className="btn-google button-animate"
                onClick={handleGoogleSignIn}
              >
                <img
                  src="https://img.icons8.com/?size=160&id=JvOSspDsPpwP&format=png" // Replace with your actual Google icon URL
                  alt="Google Logo"
                  className="google-logo"
                />
                Continue with Google
              </button>
            </div>
          </form>
          <p className="signup-link">
            Don't have an account?{" "}
            <span
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;