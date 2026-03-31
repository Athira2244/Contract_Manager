import React from "react";

function Sidebar({ active, onNavigate }) {
  return (
    <div className="sidebar">
      <ul>
        <li
          className={active === "dashboard" ? "active" : ""}
          onClick={() => onNavigate("dashboard")}
        >
          Dashboard
        </li>
        <li
          className={active === "messages" ? "active" : ""}
          onClick={() => onNavigate("messages")}
        >
          Feed
        </li>
        {/* <li
          className={active === "reports" ? "active" : ""}
          onClick={() => onNavigate("reports")}
        >
          Reports
        </li> */}
        <li
          className={active === "settings" ? "active" : ""}
          onClick={() => onNavigate("settings")}
        >
          Checklist Templates
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
