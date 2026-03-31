
import React from "react";
import { SERVER_URL } from "../constants/server";

function Navbar({ onProfileClick }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const employeeName = user?.employee_name || "Employee";
  // Set profile image with fallback
  const profileImage =
    user?.profile_pic && user.profile_pic !== ""
      ? `${SERVER_URL}/${user.profile_pic}`
      : "/istockphoto-2132177453-170667a.jpg"; // image in public folder

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h3>Task Manager</h3>
      </div>

      <div
        className="navbar-right"
        onClick={onProfileClick}
        style={{ cursor: "pointer" }}
      >
        <span className="profile-name">{employeeName}</span>
        <img
          src={profileImage}
          alt="profile"
          className="profile-pic"
          onError={(e) => {
            e.target.src = "/istockphoto-2132177453-170667a.jpg";
          }}
        />
      </div>
    </div>
  );
}

export default Navbar;
