import React, { useState } from "react";
import API_BASE_URL from "../apiConfig";

import "../styles/Login.css";
// import SHA1 from "crypto-js/sha1";

function Login({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const AUTH_BASE_URL = "https://v1.mypayrollmaster.online/api/v2qa/";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("user_id", username);
      params.append("password", password);

      const response = await fetch(`${AUTH_BASE_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const data = await response.json();

      if (data.success === 1) {
        // Save login info if needed
        localStorage.setItem("user", JSON.stringify(data.data));
        onSuccess(data.data);
      } else {
        setError("Invalid login credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Task Manager</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div style={{
              color: "#dc2626",
              background: "#fee2e2",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "14px",
              textAlign: "center",
              border: "1px solid #fecaca"
            }}>
              {error}
            </div>
          )}

          <div className="input-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
