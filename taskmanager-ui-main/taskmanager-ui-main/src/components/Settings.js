import React from "react";
import ChecklistTemplates from "./ChecklistTemplates";

function Settings() {
    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Checklists Template</h2>
                <p style={{ color: "var(--text-muted)", marginTop: "6px" , fontSize:"14px"}}>
                    Create and Manage Checklists
                </p>
            </div>

            <div className="settings-content">
                <ChecklistTemplates />
            </div>
        </div>
    );
}

export default Settings;
