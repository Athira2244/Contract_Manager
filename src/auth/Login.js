import React, { useState } from "react";

function Login({ onSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const AUTH_BASE_URL = "https://mpmv2o.mypayrollmaster.online/api/v2qa/";

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
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
            });

            const data = await response.json();

            if (data.success === 1) {
                localStorage.setItem("user", JSON.stringify(data.data));
                onSuccess(data.data);
            } else {
                setError("Invalid login credentials. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Server error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#F4F9FB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            fontFamily: "'Outfit', 'Segoe UI', sans-serif",
        }}>
            <div style={{ width: "100%", maxWidth: 420 }}>

                {/* Card */}
                <div style={{
                    background: "#fff",
                    borderRadius: 24,
                    border: "1px solid #E8F2F8",
                    padding: "48px 44px 40px",
                }}>

                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: "conic-gradient(#36BEF6, #25B14C, #FED206, #E50A86, #712A84, #36BEF6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: "#1E516E", letterSpacing: "-0.03em" }}>ContractOS</span>
                    </div>

                    {/* Greeting */}
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E516E", letterSpacing: "-0.02em", margin: "0 0 6px" }}>
                            Welcome back
                        </h2>
                        <p style={{ fontSize: 13, color: "#1e516e", margin: 0 }}>
                            Sign in to your workspace to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Error */}
                        {error && (
                            <div style={{
                                background: "#FCE4F2", border: "1px solid #F0B6D6",
                                borderRadius: 10, padding: "10px 14px",
                                fontSize: 12, fontWeight: 600, color: "#C80975",
                                marginBottom: 20, display: "flex", alignItems: "center", gap: 8,
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Username */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: "block", fontSize: 10, fontWeight: 700,
                                color: "#1e516e", letterSpacing: "0.08em",
                                textTransform: "uppercase", marginBottom: 8,
                            }}>Username</label>
                            <div style={{ position: "relative" }}>
                                <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#1E516E", pointerEvents: "none" }}
                                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    required
                                    style={{
                                        width: "100%", padding: "12px 14px 12px 42px",
                                        borderRadius: 12, border: "1px solid #CFE3EE",
                                        background: "#F4F9FB", fontFamily: "inherit",
                                        fontSize: 13, color: "#1E516E", outline: "none",
                                        transition: "border-color 0.15s, background 0.15s",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "#1E516E"; e.target.style.background = "#fff"; }}
                                    onBlur={e => { e.target.style.borderColor = "#CFE3EE"; e.target.style.background = "#F4F9FB"; }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: "block", fontSize: 10, fontWeight: 700,
                                color: "#1e516e", letterSpacing: "0.08em",
                                textTransform: "uppercase", marginBottom: 8,
                            }}>Password</label>
                            <div style={{ position: "relative" }}>
                                <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#1E516E", pointerEvents: "none" }}
                                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    style={{
                                        width: "100%", padding: "12px 14px 12px 42px",
                                        borderRadius: 12, border: "1px solid #CFE3EE",
                                        background: "#F4F9FB", fontFamily: "inherit",
                                        fontSize: 13, color: "#1E516E", outline: "none",
                                        transition: "border-color 0.15s, background 0.15s",
                                        boxSizing: "border-box",
                                    }}
                                    onFocus={e => { e.target.style.borderColor = "#1E516E"; e.target.style.background = "#fff"; }}
                                    onBlur={e => { e.target.style.borderColor = "#CFE3EE"; e.target.style.background = "#F4F9FB"; }}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%", padding: 13,
                                background: isLoading ? "#1e516e" : "#1E516E",
                                color: "#fff", border: "none", borderRadius: 12,
                                fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                                letterSpacing: "0.02em", cursor: isLoading ? "not-allowed" : "pointer",
                                transition: "background 0.2s",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = "#164a63"; }}
                            onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = "#1E516E"; }}
                        >
                            {isLoading ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10" strokeDasharray="30 70">
                                            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                                        </circle>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in to Dashboard
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Brand dots */}
                    <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 28 }}>
                        {["#36BEF6", "#25B14C", "#FED206", "#E50A86"].map(c => (
                            <div key={c} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: "center", fontSize: 11, color: "#1E516E",
                    fontFamily: "monospace", letterSpacing: "0.08em",
                    textTransform: "uppercase", marginTop: 24,
                }}>
                    v1.0.42 · Secure Access Required
                </p>
            </div>
        </div>
    );
}

export default Login;