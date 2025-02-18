import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function AdminDashboard() {
  return (
    <div className="container mt-5 p-4 border rounded shadow-lg bg-light">
      <h1 className="text-center mb-5 text-primary">Admin Dashboard</h1>
      <div className="row g-4 justify-content-center">
        {/* Take Attendance */}
        <div className="col-md-3 d-flex justify-content-center">
          <Link
            to="/admin/attendance"
            className="btn btn-primary btn-lg w-100 py-4 shadow-sm d-flex align-items-center justify-content-center rounded-pill transition-transform hover-transform"
          >
            <i className="bi bi-check2-circle me-3 fs-3"></i>
            <span className="fs-5">Take Attendance</span>
          </Link>
        </div>

        {/* View Attendance Data */}
        <div className="col-md-3 d-flex justify-content-center">
          <Link
            to="/admin/attendance-data"
            className="btn btn-secondary btn-lg w-100 py-4 shadow-sm d-flex align-items-center justify-content-center rounded-pill transition-transform hover-transform"
          >
            <i className="bi bi-table me-3 fs-3"></i>
            <span className="fs-5">View Attendance Data</span>
          </Link>
        </div>

        {/* Student List */}
        <div className="col-md-3 d-flex justify-content-center">
          <Link
            to="/admin/students"
            className="btn btn-success btn-lg w-100 py-4 shadow-sm d-flex align-items-center justify-content-center rounded-pill transition-transform hover-transform"
          >
            <i className="bi bi-people me-3 fs-3"></i>
            <span className="fs-5">Student List</span>
          </Link>
        </div>

        {/* Profile */}
        <div className="col-md-3 d-flex justify-content-center">
          <Link
            to="/admin/profile"
            className="btn btn-info btn-lg w-100 py-4 shadow-sm d-flex align-items-center justify-content-center rounded-pill transition-transform hover-transform"
          >
            <i className="bi bi-person-circle me-3 fs-3"></i>
            <span className="fs-5">Profile</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="col-md-3 d-flex justify-content-center">
          <Link
            to="/"
            className="btn btn-danger btn-lg w-100 py-4 shadow-sm d-flex align-items-center justify-content-center rounded-pill transition-transform hover-transform"
            onClick={() => {
              alert("Logged out!");
            }}
          >
            <i className="bi bi-box-arrow-right me-3 fs-3"></i>
            <span className="fs-5">Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
