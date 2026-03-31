import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";

import "../styles/Feed.css";

function Feed() {
  const [message, setMessage] = useState("");
  const [feeds, setFeeds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedRecipients, setSelectedRecipients] = useState([
    { id: "all", name: "All employees" }
  ]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const AUTH_BASE_URL = "https://v1.mypayrollmaster.online/api/v2qa/";
  const loadFeeds = async () => {
    if (!user?.emp_pkey) return;
    try {
      const empId = user.emp_pkey;
      const res = await fetch(
        `${API_BASE_URL}/feeds/employee/${empId}`
      );
      const data = await res.json();
      setFeeds(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Feed load failed", e);
      setFeeds([]);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!user?.emp_pkey) return; // ⛔ wait until user is loaded

    loadFeeds();
  }, [user]); // ✅ runs when user changes


  // Fetch employees

  useEffect(() => {
    if (!user?.user_id) return; // ⛔ wait until user is ready

    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `${AUTH_BASE_URL}/employees_list?user_id=${user.user_id}`
        );

        const json = await res.json();

        if (json.success === 1 && Array.isArray(json.data)) {
          const normalized = json.data
            .map(emp => ({
              id: emp.emp_pkey,
              fullName: emp.EmpName?.trim()
            }))
            .filter(emp => emp.fullName);

          setEmployees(normalized);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, [user]); // ✅ dependency

  // Handle outside clicks for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.add-recipient-wrapper')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Add recipient
  const addRecipient = (emp) => {
    if (emp.id === "all") {
      setSelectedRecipients([{ id: "all", name: "All employees" }]);
    } else {
      const filtered = selectedRecipients.filter(r => r.id !== "all");
      if (!filtered.find(r => r.id === emp.id)) {
        setSelectedRecipients([...filtered, { id: emp.id, name: emp.fullName }]);
      }
    }
    setSearchTerm("");
    setShowDropdown(false);
  };

  // Remove recipient
  const removeRecipient = (id) => {
    const updated = selectedRecipients.filter(r => r.id !== id);
    if (updated.length === 0) {
      updated.push({ id: "all", name: "All employees" });
    }
    setSelectedRecipients(updated);
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSend = async () => {
    if (!message.trim()) return;

    const recipientType = selectedRecipients.some(r => r.id === "all") ? "ALL" : "SELECTED";
    const recipientIds = recipientType === "SELECTED" ? selectedRecipients.map(r => parseInt(r.id)) : [];

    const payload = {
      message,
      recipientType,
      recipientIds
    };

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/feeds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        alert("Feed sent successfully!");
        setMessage("");
        setSelectedRecipients([{ id: "all", name: "All employees" }]);
        loadFeeds(); // Refresh feed
      } else {
        alert("Failed to send feed.");
      }
    } catch (err) {
      console.error("Send error:", err);
      alert("Error sending feed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Announcement
  const handleSendAnnouncement = async () => {
    if (!message.trim()) return;

    const payload = {
      message,
      recipientType: "ALL",
      recipientIds: [],
      isAnnouncement: 1
    };

    try {
      setAnnouncementLoading(true);
      const res = await fetch(`${API_BASE_URL}/feeds`, {
        // ... existing headers and body ...
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.success) {
        alert("Announcement sent successfully!");
        setMessage("");
        setSelectedRecipients([{ id: "all", name: "All employees" }]);
        loadFeeds(); // Refresh feed
      } else {
        alert("Failed to send announcement.");
      }
    } catch (err) {
      console.error("Announcement error:", err);
      alert("Error sending announcement.");
    } finally {
      setAnnouncementLoading(false);
    }
  };

  return (
    <div className="bitrix-feed-container">
      {showDropdown && (
        <div className="dropdown-overlay" onClick={() => setShowDropdown(false)} />
      )}

      <div className="bitrix-composer">
        <div className="composer-tabs">
          <button className="tab active">Message</button>
        </div>

        <div className="composer-content">
          <textarea
            className="composer-textarea"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="recipient-row">
            <span className="to-label">To:</span>
            <div className="recipient-pills">
              {selectedRecipients.map(r => (
                <span key={r.id} className={`pill ${r.id === 'all' ? 'all-pill' : ''}`}>
                  {r.name}
                  <button className="remove-pill" onClick={() => removeRecipient(r.id)}>×</button>
                </span>
              ))}

              <div className="add-recipient-wrapper">
                <input
                  type="text"
                  className="recipient-input"
                  placeholder="Add persons..."
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                />

                {showDropdown && (
                  <div className="recipient-dropdown" onClick={e => e.stopPropagation()}>
                    <div
                      className="dropdown-item all"
                      onClick={() => addRecipient({ id: 'all', fullName: 'All employees' })}
                    >
                      <strong>All employees</strong>
                    </div>

                    {filteredEmployees.length === 0 ? (
                      <div className="dropdown-item no-results">No employees found</div>
                    ) : (
                      filteredEmployees.map(emp => (
                        <div
                          key={emp.id}
                          className="dropdown-item"
                          onClick={() => addRecipient(emp)}
                        >
                          <div className="user-icon">{emp.fullName.charAt(0).toUpperCase()}</div>
                          {emp.fullName}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="composer-footer">
          <button
            className="send-button"
            disabled={!message.trim() || loading}
            onClick={handleSend}
          >
            {loading ? "Sending..." : "SEND"}
          </button>
          <button
            className="announcement-button"
            disabled={!message.trim() || announcementLoading}
            onClick={handleSendAnnouncement}
          >
            {announcementLoading ? "Sending..." : "SEND ANNOUNCEMENT"}
          </button>
          <button
            className="cancel-button"
            onClick={() => {
              setMessage("");
              setSelectedRecipients([{ id: "all", name: "All employees" }]);
            }}
          >
            Clear
          </button>
        </div>
      </div>
      {/* FEEDS LIST */}
      <div className="feeds-list">
        {feeds.length === 0 ? (
          <div className="placeholder-content">
            <h3>No feeds available</h3>
            <p>Your team's updates will appear here.</p>
          </div>
        ) : (
          feeds.map(feed => (
            <div
              key={feed.feedId}
              className={`feed-item ${feed.isAnnouncement === 1 ? 'announcement-feed' : ''}`}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                <span>
                  {feed.isAnnouncement === 1 ? (
                    <strong style={{ color: "var(--warning)" }}>ANNOUNCEMENT</strong>
                  ) : (
                    feed.isGlobal ? (
                      <span style={{ fontWeight: "600", color: "var(--primary)" }}>All Employees</span>
                    ) : (
                      <span style={{ fontWeight: "600", color: "var(--text-main)" }}>Assigned to you</span>
                    )
                  )}
                  <span style={{ margin: "0 8px" }}>·</span>
                  {new Date(feed.createdAt).toLocaleString()}
                </span>
              </div>

              <div style={{ fontSize: "15px", lineHeight: "1.5", color: "var(--text-main)", fontWeight: feed.isAnnouncement === 1 ? "600" : "400" }}>
                {feed.message}
              </div>
            </div>
          ))
        )}
      </div>

    </div >
  );
}

export default Feed;
