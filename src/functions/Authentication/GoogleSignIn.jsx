import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Authentication/firebase";

const GoogleSignIn = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log(user); // Log user details for debugging

      // Save user info to localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // Displaying thr  user information
      alert(`Welcome ${user.displayName || user.email}!`);

      // Redirection to home page
      navigate("/home");
    } catch (err) {
      setError("Google sign-in failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="google-signin-container">
      <h2>Sign in with Google</h2>
      {error && <p>{error}</p>}
      <button onClick={handleGoogleSignIn} className="btn google-btn">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Google_2015_logo.svg"
          alt="Google Logo"
          className="google-logo"
        />
        Sign In with Google
      </button>
    </div>
  );
};

export default GoogleSignIn;
