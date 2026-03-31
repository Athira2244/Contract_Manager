import React, { useState } from "react";
import API_BASE_URL from "../apiConfig";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Reports() {
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleDownloadReport = async () => {
        if (!user || !user.emp_pkey) {
            alert("User not found. Please log in.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/report/${user.emp_pkey}`);
            if (!response.ok) throw new Error("Failed to fetch report data");

            const data = await response.json();

            if (data.length === 0) {
                alert("No tasks found for report.");
                setLoading(false);
                return;
            }

            // Format data for Excel
            const excelData = data.map(item => ({
                "Task ID": item.taskId,
                "Task Name": item.taskName,
                "Description": item.description,
                "Employee Name": item.empName,
                "Status": item.status,
                "Total Time Taken (HH:mm)": item.totalTimeTaken,
                "Created Date": item.createdDate ? new Date(item.createdDate).toLocaleString() : "-",
                "In Progress Date": item.inProgressDate ? new Date(item.inProgressDate).toLocaleString() : "-",
                "Completed Date": item.completedDate ? new Date(item.completedDate).toLocaleString() : "-"
            }));

            // Create Worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Task Report");

            // Generate Buffer
            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

            // Save File
            saveAs(blob, `Task_Report_${user.employee_name}_${new Date().toISOString().split('T')[0]}.xlsx`);

        } catch (error) {
            console.error("Error generating report:", error);
            alert("Error generating report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Reports & Analytics</h2>
                <p style={{ color: "var(--text-muted)", marginTop: "6px" }}>
                    Generate and download performance reports.
                </p>
            </div>

            <div className="reports-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
                {/* Excel Report Card */}
                <div className="report-card" style={{
                    background: "var(--bg-surface)",
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "16px"
                }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "#e0f2fe",
                        color: "#0284c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>Task Performance Report</h3>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Download a detailed Excel file of all your tasks, including time logs and status history.</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleDownloadReport}
                        disabled={loading}
                        style={{ width: "100%", marginTop: "auto" }}
                    >
                        {loading ? "Generating..." : "Download Excel Report"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Reports;
