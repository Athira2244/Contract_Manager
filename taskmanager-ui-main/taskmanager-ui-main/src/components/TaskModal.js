import React, { useState, useEffect } from "react";
import API_BASE_URL from "../apiConfig";


function TaskModal({ onClose, onTaskCreated }) {
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
const AUTH_BASE_URL = "https://v1.mypayrollmaster.online/api/v2qa/";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  useEffect(() => {
    if (!user?.user_id) return; // ⛔ wait for logged-in user

    fetch(
      `${AUTH_BASE_URL}/employees_list?user_id=${user.user_id}`
    )
      .then(res => res.json())
      .then(json => {
        if (json.success === 1) {
          setEmployees(json.data);
        } else {
          setEmployees([]);
        }
      })
      .catch(err => {
        console.error("Failed to load employees", err);
        setEmployees([]);
      });

    // Load checklist templates
    if (user?.emp_pkey) {
      fetch(`${API_BASE_URL}/checklists/templates/user/${user.emp_pkey}`)
        .then(res => res.json())
        .then(data => setTemplates(Array.isArray(data) ? data : []))
        .catch(err => console.error("Failed to load templates", err));
    }
  }, [user]);

  // Ensure current user is in the list
  const allEmployees = React.useMemo(() => {
    if (!user || !user.emp_pkey) return employees;
    const exists = employees.find(e => Number(e.emp_pkey) === Number(user.emp_pkey));
    if (!exists) {
      return [...employees, {
        emp_pkey: user.emp_pkey,
        EmpName: user.employee_name || "Myself"
      }];
    }
    return employees;
  }, [employees, user]);



  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, newChecklistItem.trim()]);
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (index) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {

    // find selected employee object
    const selectedEmployee = allEmployees.find(
      emp => String(emp.emp_pkey) === String(assigneeId)
    );



    const taskData = {
      taskName: taskName,
      description: description,
      assigneeId: assigneeId ? Number(assigneeId) : null,
      empName: selectedEmployee ? selectedEmployee.EmpName : "",
      deadline: deadline,
      createdBy: Number(user?.emp_pkey || user?.user_id),
      createdByName: user?.employee_name || "Unknown",
      checklistTemplateId: selectedTemplateId ? Number(selectedTemplateId) : null,
      checklistItems: checklistItems
    };

    console.log("Saving Task Payload:", taskData);

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save task:", errorText);
        alert("Failed to save task. See console for details.");
        return;
      }

      onTaskCreated();
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      alert("An error occurred while saving the task.");
    }
  };


  return (
    <div className="modal">
      <div className="modal-box">
        <h3>Create New Task</h3>

        <input
          placeholder="Task Name"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
        />

        <textarea
          placeholder="Task Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <input
          type="datetime-local"
          step="1"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />

        <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
          <option value="">Select Assignee</option>
          {allEmployees.map(emp => (
            <option key={emp.emp_pkey} value={emp.emp_pkey}>
              {emp.EmpName}
            </option>
          ))}
        </select>

        <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
          <option value="">Select Checklist Template (Optional)</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
            Created By
          </label>
          <input
            value={user?.employee_name || "Myself"}
            disabled
            style={{ background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }}
          />
        </div>

        {/* CHECKLIST SECTION */}
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>
            Checklist (Optional)
          </label>

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              placeholder="Add checklist item..."
              value={newChecklistItem}
              onChange={e => setNewChecklistItem(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAddChecklistItem}
              style={{ minWidth: "60px", height: "40px" }}
            >
              Add
            </button>
          </div>

          {checklistItems.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {checklistItems.map((item, index) => (
                <li key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "8px", marginBottom: "4px", borderRadius: "4px" }}>
                  <span style={{ fontSize: "14px" }}>{item}</span>
                  <button
                    onClick={() => handleRemoveChecklistItem(index)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px" }}
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Task</button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
