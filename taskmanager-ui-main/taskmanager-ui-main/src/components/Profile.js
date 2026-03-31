import React from "react";

import "../styles/Profile.css";
import { SERVER_URL } from "../constants/server";
function Profile({ onBack, onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="profile-pro-container">
      <div className="profile-header-v2">
        <button className="back-link" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h1>Employee Profile</h1>
      </div>

      <div className="profile-grid">
        {/* Left Side: Quick Info Card */}
        <div className="profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            <img
              src={user?.profile_pic ? `${SERVER_URL}/${user.profile_pic}` : "/istockphoto-2132177453-170667a.jpg"}
              alt="Profile"
              className="profile-avatar-large"
              onError={(e) => (e.target.src = "/istockphoto-2132177453-170667a.jpg")}
            />
            <div className="status-indicator online">Online</div>
          </div>

          <h2 className="profile-user-name">{user?.employee_name || "Employee"}</h2>
          <p className="profile-user-id">ID: {user?.user_id}</p>

          <div className="profile-quick-actions">
            <button className="btn-logout-v2" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Side: Detailed Info Card */}
        <div className="profile-details-card">
          <div className="details-section">
            <div className="section-title">Career Information</div>
            <div className="details-grid">
              <div className="info-group">
                <label>Department</label>
                <span>{user?.department || "Unassigned"}</span>
              </div>
              <div className="info-group">
                <label>Designation</label>
                <span>{user?.designation || "Unassigned"}</span>
              </div>
              <div className="info-group">
                <label>Date of Joining</label>
                <span>{formatDate(user?.joining_date)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <div className="section-title">Personal Details</div>
            <div className="details-grid">
              <div className="info-group">
                <label>Date of Birth</label>
                <span>{formatDate(user?.date_of_birth)}</span>
              </div>
              <div className="info-group">
                <label>Email Address</label>
                <span>{user?.user_email || "N/A"}</span>
              </div>
              {/* Add more fields as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
