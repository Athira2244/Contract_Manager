


import React, { useEffect, useState, useCallback } from "react";
import API_BASE_URL from "../apiConfig";


function TaskDetails({ task, onClose, onStatusChange }) {
  const [timeEntries, setTimeEntries] = useState([]);
  const [newEntry, setNewEntry] = useState(null);
  const [status, setStatus] = useState(task.status);
  const [employees, setEmployees] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const AUTH_BASE_URL = "https://v1.mypayrollmaster.online/api/v2qa/";

  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.user_id) return;

    fetch(
      `${AUTH_BASE_URL}/employees_list?user_id=${storedUser.user_id}`
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

    // Fetch Statuses
    fetch(`${API_BASE_URL}/statuses`)
      .then(res => res.json())
      .then(data => setStatuses(data))
      .catch(err => console.error("Failed to load statuses", err));

    // Load checklist templates
    if (storedUser?.emp_pkey) {
      fetch(`${API_BASE_URL}/checklists/templates/user/${storedUser.emp_pkey}`)
        .then(res => res.json())
        .then(data => setTemplates(Array.isArray(data) ? data : []))
        .catch(err => console.error("Failed to load templates", err));
    }
  }, []);

  // Ensure current user is in the list
  const user = JSON.parse(localStorage.getItem("user"));
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
  }, [employees]);

  // Helper function to get employee name by ID
  const getEmployeeName = (assigneeId) => {
    if (!assigneeId) return "Unassigned";
    const employee = employees.find(emp => Number(emp.emp_pkey) === Number(assigneeId));
    return employee?.EmpName?.trim() || "Unknown";
  };

  const isCreator = Number(task.createdBy) === Number(user?.emp_pkey || user?.user_id);

  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    taskName: task.taskName,
    description: task.description,
    assigneeId: task.assigneeId,
  });

  const loadChecklistItems = useCallback(async () => {
    const taskIdToFetch = task.taskId || task.id;
    try {
      const res = await fetch(`${API_BASE_URL}/task_checklists/task/${taskIdToFetch}`);
      const data = await res.json();
      setChecklistItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load checklist", e);
    }
  }, [task.id, task.taskId]);

  const loadTimeEntries = useCallback(async () => {
    const taskIdToFetch = task.taskId || task.id;
    const res = await fetch(
      `${API_BASE_URL}/emp_task_time/task/${taskIdToFetch}`
    );
    const data = await res.json();
    setTimeEntries(Array.isArray(data) ? data : []);
  }, [task.id, task.taskId]);

  const [newChecklistItem, setNewChecklistItem] = useState("");

  const handleToggleChecklist = async (itemId) => {
    try {
      await fetch(`${API_BASE_URL}/task_checklists/${itemId}/toggle`, { method: "PUT" });
      loadChecklistItems();
    } catch (e) {
      console.error("Toggle failed", e);
    }
  };

  const handleAddNewChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;
    try {
      await fetch(`${API_BASE_URL}/task_checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.taskId || task.id,
          itemText: newChecklistItem,
          isCompleted: false
        })
      });
      setNewChecklistItem("");
      loadChecklistItems();
    } catch (e) {
      console.error("Failed to add item", e);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    if (!window.confirm("Delete this checklist item?")) return;
    try {
      await fetch(`${API_BASE_URL}/task_checklists/${itemId}`, { method: "DELETE" });
      loadChecklistItems();
    } catch (e) {
      console.error("Failed to delete item", e);
    }
  };

  useEffect(() => {
    if (task?.id) {
      setStatus(task.status);
      setForm({
        taskName: task.taskName,
        description: task.description,
        assigneeId: task.assigneeId,
      });
      loadTimeEntries();
      loadChecklistItems();
    }
  }, [task, loadTimeEntries, loadChecklistItems]);


  /* -------- STATUS CHANGE -------- */
  const handleStatusChangeRaw = async (e) => {
    const newStatus = Number(e.target.value);

    // Use taskId (parent task ID) for status updates
    const taskIdToUpdate = task.taskId || task.id;

    await fetch(`${API_BASE_URL}/tasks/${taskIdToUpdate}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        assigneeId: task.assigneeId
      }),
    });

    setStatus(newStatus);
    if (onStatusChange) onStatusChange();
  };

  /* -------- SAVE EDIT -------- */
  const handleSave = async () => {
    try {
      // isAssigneeChanged removed as it was unused

      // Use taskId (parent task ID) for updates
      const taskIdToUpdate = task.taskId || task.id;

      // Find the selected employee name for the CURRENTLY selected assigneeId in the form
      const selectedEmployee = allEmployees.find(e => Number(e.emp_pkey) === Number(form.assigneeId));
      const empName = selectedEmployee?.EmpName?.trim() || task.empName || '';

      // We always send the full object to ensure names are persisted correctly
      await fetch(`${API_BASE_URL}/tasks/${taskIdToUpdate}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: form.taskName,
          description: form.description,
          assigneeId: form.assigneeId,
          empName: empName,
          checklistTemplateId: isCreator && selectedTemplateId ? Number(selectedTemplateId) : null
        }),
      });

      setIsEdit(false);
      if (onStatusChange) onStatusChange();
      onClose();

    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save task");
    }
  };


  /* -------- TIME -------- */
  const handleAddTime = () => {
    const now = new Date().toISOString().slice(0, 16);
    setNewEntry({ startTime: now, endTime: "", comment: "" });
  };

  const duration = (s, e) =>
    s && e ? Math.floor((new Date(e) - new Date(s)) / 60000) : 0;

  const saveTime = async () => {
    const taskIdToSave = task.taskId || task.id;

    await fetch(`${API_BASE_URL}/emp_task_time`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        empFkey: user?.emp_pkey || user?.user_id || task.assigneeId,
        taskFkey: taskIdToSave,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        durationMinutes: duration(newEntry.startTime, newEntry.endTime),
        comment: newEntry.comment,
        empName: user?.employee_name || "Myself",
      }),
    });

    setNewEntry(null);
    loadTimeEntries();
  };

  return (
    <div className="task-details-overlay" onClick={onClose}>
      <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="task-details-header">
          <h3>Task Details</h3>
          <div>
            {!isEdit ? (
              <button
                className="btn-primary"
                disabled={status === 2 && !isCreator}
              >
                Edit
              </button>
            ) : (
              <>
                <button className="btn-primary" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setIsEdit(false)}
                  style={{ marginLeft: 8 }}
                >
                  Cancel
                </button>
              </>
            )}
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* BODY – USES YOUR GRID */}
        <div className="task-details-body">

          <label>Task</label>
          {isEdit ? (
            <input
              value={form.taskName}
              disabled={!isCreator}
              onChange={(e) =>
                setForm({ ...form, taskName: e.target.value })
              }
              style={!isCreator ? { background: "#f1f5f9", cursor: "not-allowed" } : {}}
            />
          ) : (
            <span>{task.taskName}</span>
          )}

          <label>Created By</label>
          <span>{task.createdByName || getEmployeeName(task.createdBy)}</span>

          <label>Assignee</label>
          {isEdit ? (

            <select
              value={form.assigneeId}
              onChange={(e) =>
                setForm({ ...form, assigneeId: Number(e.target.value) })
              }
            >
              <option value="">Select assignee</option>

              {allEmployees.map(emp => (
                <option key={emp.emp_pkey} value={emp.emp_pkey}>
                  {emp.EmpName}
                </option>
              ))}
            </select>

          ) : (
            <span>{task.empName || getEmployeeName(task.assigneeId)}</span>
          )}

          {isEdit && isCreator && (
            <>
              <label>Assign Checklist Template</label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
              >
                <option value="">Select Checklist Template (Optional)</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Status</label>
          <span className={`task-status status-${status}`}>
            {statuses.find(s => s.id === status)?.statusName?.replace("_", " ") || status}
          </span>

          <label>Description</label>
          {isEdit ? (
            <textarea
              rows="3"
              value={form.description}
              disabled={!isCreator}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              style={!isCreator ? { background: "#f1f5f9", cursor: "not-allowed" } : {}}
            />
          ) : (
            <span>{task.description}</span>
          )}

        </div>

        {/* CHECKLIST */}
        {checklistItems.length > 0 && (
          <div className="task-checklist" style={{ marginTop: "20px", background: "#f8fafc", padding: "15px", borderRadius: "8px" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", textTransform: "uppercase", color: "#64748b" }}>Checklist</h4>
            {checklistItems.map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggleChecklist(item.id)}
                  style={{ width: "auto", margin: 0, cursor: "pointer" }}
                />
                <span style={{
                  fontSize: "14px",
                  color: item.isCompleted ? "#94a3b8" : "#1e293b",
                  textDecoration: item.isCompleted ? "line-through" : "none",
                  flex: 1
                }}>
                  {item.itemText}
                </span>
                {isEdit && isCreator && (
                  <button
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "16px", padding: "0 5px" }}
                    title="Delete Item"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ADD CHECKLIST ITEM (EDIT MODE ONLY) */}
        {isEdit && isCreator && (
          <div style={{ marginTop: "10px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                placeholder="Add new checklist item..."
                value={newChecklistItem}
                onChange={e => setNewChecklistItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddNewChecklistItem();
                }}
              />
              <button className="btn-secondary" onClick={handleAddNewChecklistItem}>Add</button>
            </div>
          </div>
        )}

        {/* ACTIONS */}

        {/* Status Actions - Buttons instead of Dropdown */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

          {/* PENDING -> START */}
          {status === 0 && (
            <button
              className="btn-primary"
              onClick={() => handleStatusChangeRaw({ target: { value: 1 } })} // reusing existing handler logic style or better yet calling API directly if refactored, but here adapting to existing handler pattern or simple wrapper
            >
              Start Task
            </button>
          )}

          {/* IN_PROGRESS -> COMPLETE */}
          {status === 1 && (
            <button
              className="btn-primary"
              style={{ backgroundColor: "#10b981", borderColor: "#10b981" }}
              onClick={() => handleStatusChangeRaw({ target: { value: 2 } })}
            >
              Complete
            </button>
          )}

          {/* COMPLETED -> RESUME (Creator only) */}
          {status === 2 && isCreator && (
            <button
              className="btn-secondary"
              onClick={() => handleStatusChangeRaw({ target: { value: 0 } })}
            >
              ↺ Resume
            </button>
          )}

          <button
            className="btn-secondary"
            onClick={handleAddTime}
            style={{ marginLeft: 10 }}
            disabled={status === 2} // 2 = COMPLETED
          >
            ➕ Add Time
          </button>
        </div>


        {/* TIME TABLE */}
        <table style={{ width: "100%", marginTop: 15 }}>
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Minutes</th>
              <th>Comment</th>
              <th>User</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {timeEntries.map((t) => (
              <tr key={t.timeId}>
                <td>{t.startTime}</td>
                <td>{t.endTime}</td>
                <td>{t.durationMinutes}</td>
                <td>{t.comment}</td>
                <td>{t.empName || "Unknown"}</td>
                <td></td>
              </tr>
            ))}

            {newEntry && (
              <tr>
                <td>
                  <input
                    type="datetime-local"
                    value={newEntry.startTime}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, startTime: e.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    type="datetime-local"
                    value={newEntry.endTime}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, endTime: e.target.value })
                    }
                  />
                </td>
                <td>{duration(newEntry.startTime, newEntry.endTime)}</td>
                <td>
                  <input
                    value={newEntry.comment}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, comment: e.target.value })
                    }
                  />
                </td>
                <td>
                  {user?.employee_name || "Myself"}
                </td>
                <td>
                  <button
                    className="btn-primary"
                    onClick={saveTime}
                    disabled={!newEntry.endTime || !newEntry.comment}
                  >
                    Save
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}

export default TaskDetails;

