// Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Authentication/firebase";
import './Signup.css';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/verify-email"); // Redirect to email verification page
    } catch (err) {
      setError(err.message); // Display Firebase error message
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("user", JSON.stringify(result.user));
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
          <h2>Sign Up</h2>
          <p>Create your ClassMate AI account</p>
          <form onSubmit={handleSignup}>
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
              Sign Up
            </button>
            <div className="text-center">
              <p className="text-white">or</p>
              <button
                type="button"
                className="btn-google button-animate"
                onClick={handleGoogleSignIn}
              >
                <img
                  src="https://img.icons8.com/?size=160&id=JvOSspDsPpwP&format=png" // Replace with your Google icon URL
                  alt="Google Logo"
                  className="google-logo"
                />
                Continue with Google
              </button>
            </div>
          </form>
          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;