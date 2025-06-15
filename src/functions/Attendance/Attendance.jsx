import React, { useEffect } from 'react';
import HomeHeader from "../Home/HomeHeader";
import { useNavigate } from 'react-router-dom';
import './css/attendance.css';

const AttendanceMain = () => {
  const navigate = useNavigate();

  // Scroll lock only when this component is mounted
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow; // restore on unmount
    };
  }, []);

  return (
    <div className="attendance-main-container">
      <HomeHeader className="header" />
      <div className="attendance-main-content">
        <h1 className="main-title">Mark Your Attendance</h1>
        <div className="main-button-container">
          <button onClick={() => navigate('/attendance/geo')} className="main-button">
            📍 Verify with Geo-Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMain;
