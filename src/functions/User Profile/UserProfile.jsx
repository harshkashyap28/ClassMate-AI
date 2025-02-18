import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import './Profile.css'; // Import custom styles

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState("default-profile-pic.jpg");
  const user = JSON.parse(localStorage.getItem("user")); // Retrieve user data
  const navigate = useNavigate();

  const handleEdit = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // Remove user data
    navigate("/login"); // Navigate to login page
  };

  const handleProfilePicChange = (e) => {
    // Handle profile picture upload
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4 text-center">
          <img
            src={profilePic}
            alt="Profile"
            className="img-fluid rounded-circle mb-3"
            style={{ maxWidth: '150px' }}
          />
          {isEditing ? (
            <div className="edit-profile">
              <input type="file" onChange={handleProfilePicChange} className="form-control mb-3" />
              <button onClick={handleEdit} className="btn btn-primary w-100">Save</button>
            </div>
          ) : (
            <div className="profile-options">
              <button onClick={handleEdit} className="btn btn-info w-100 mb-2">
                <i className="fas fa-pen"></i> Edit Profile
              </button>
              <button onClick={handleLogout} className="btn btn-danger w-100">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          )}
        </div>
        <div className="col-md-8">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          {/* Add more user profile information here */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
