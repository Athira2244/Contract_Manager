

import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Feed from "./Feed";
import Profile from "./Profile";
import Reports from "./Reports";
import Settings from "./Settings";

function Layout({ onLogout }) {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "messages":
        return <Feed />;
      case "tasks":
        return <Dashboard />;
      case "profile":
        return <Profile onBack={() => setPage("dashboard")} onLogout={() => window.location.reload()} />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;



      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="layout">
      <Navbar onProfileClick={() => setPage("profile")} />
      <div className="content-area">
        <Sidebar active={page} onNavigate={setPage} />
        <div className="main-content">{renderPage()}</div>
      </div>
    </div>
  );
}

export default Layout;

