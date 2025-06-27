import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../Home/HomeHeader";
import { auth, db, storage } from "../../functions/Authentication/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion } from "framer-motion";
import imageCompression from "browser-image-compression";
import {
  FiUpload,
  FiSave,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiUsers,
  FiTag,
  FiX,
} from "react-icons/fi";
import "./profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    studentId: "",
    profilePicture: "",
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData({ ...userSnap.data(), email: userSnap.data().email || user.email });
          setPreviewImage(userSnap.data().profilePicture || null);
        } else {
          setUserData((prev) => ({ ...prev, email: user.email }));
        }
      } catch (error) {
        setMessage("Error fetching profile.");
      }
    };

    fetchUserProfile();
  }, [user]);

  // Cleanup preview URL on unmount or change
  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!userData.name.trim()) {
      setMessage("Please enter your name");
      return false;
    }
    if (userData.phone && !/^\d{10,15}$/.test(userData.phone)) {
      setMessage("Invalid phone number");
      return false;
    }
    return true;
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return setMessage("No file selected.");

    if (!file.type.match("image.*"))
      return setMessage("Please select a valid image file");
    if (file.size > 7 * 1024 * 1024)
      return setMessage("File size too large. Max 7MB.");

    setMessage(null);

    // Show preview while compressing and uploading
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);

    setIsUploading(true);

    try {
      // Compress image before upload (max size ~1MB, max width/height 800)
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const storageRef = ref(storage, `profilePictures/${user.uid}/${compressedFile.name}`);
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update local state and Firestore with new profile picture URL
      setUserData((prev) => {
        const updated = { ...prev, profilePicture: downloadURL };
        // Update Firestore with fresh data to avoid stale data issues
        setDoc(doc(db, "users", user.uid), {
          ...updated,
          lastUpdated: new Date().toISOString(),
        }, { merge: true }).catch((err) => {
          console.error("Error updating profile picture in Firestore:", err);
          setMessage("Failed to save profile picture.");
        });
        return updated;
      });

      setMessage("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Image upload failed:", error);
      setMessage("Failed to upload image: " + error.message);
    } finally {
      setIsUploading(false);
      // Clean up preview URL from memory if you want to prevent memory leaks
      if (imageUrl.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    }
  };

  const saveUserProfile = async () => {
    if (!user) return setMessage("User not authenticated!");
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          ...userData,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      setMessage("Profile saved successfully!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (error) {
      setMessage("Failed to save profile: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="profile-root"
    >
      <HomeHeader />
      <div className="profile-page-wrapper">
        <div className="profile-page-container">
          <motion.div
            className="profile-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="profile-header">
              <label className="profile-picture-label">
                {previewImage ? (
                  <img src={previewImage} alt="Profile Preview" className="profile-image" />
                ) : userData.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-picture-placeholder">
                    <FiUser size={40} />
                    <span>Upload Photo</span>
                  </div>
                )}
                <div className="upload-overlay">
                  {isUploading ? <div className="upload-spinner" /> : <FiUpload size={24} />}
                </div>
                <input
                  type="file"
                  className="profile-picture-input"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  disabled={isUploading}
                />
              </label>
              <h2 className="profile-name">{userData.name || "New User"}</h2>
              <p className="profile-email">{userData.email}</p>
            </div>

            <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label className="form-label">
                  <FiUser className="input-icon" /> Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiMail className="input-icon" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  disabled
                  className="form-input disabled"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiPhone className="input-icon" /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  pattern="[0-9]{10,15}"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiCalendar className="input-icon" /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={userData.dob}
                  onChange={handleInputChange}
                  className="form-input"
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiUsers className="input-icon" /> Gender
                </label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiTag className="input-icon" /> Student ID / Faculty ID
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={userData.studentId}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              {message && (
                <div
                  className={`message ${
                    message.toLowerCase().includes("error") ||
                    message.toLowerCase().includes("failed")
                      ? "error"
                      : "success"
                  }`}
                >
                  <span>{message}</span>
                  <button
                    type="button"
                    className="dismiss-button"
                    onClick={() => setMessage(null)}
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}

              <div className="form-actions">
                <motion.button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate("/home")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  type="submit"
                  className="submit-button"
                  onClick={saveUserProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="button-icon" /> Save Profile
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
