import React, { useEffect, useState } from "react";
import TaskModal from "./TaskModal";
import TaskDetails from "./TaskDetails";
import API_BASE_URL from '../apiConfig';



function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filterType, setFilterType] = useState("all"); // 'all', 'assigned', 'created'
  const [statuses, setStatuses] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const AUTH_BASE_URL = "https://v1.mypayrollmaster.online/api/v2qa/";

  // const employeeName = "Athira"; // replace with dynamic value later



  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch employees list
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const userId = user?.user_id;

      if (userId) {
        fetch(`${AUTH_BASE_URL}/employees_list?user_id=${userId}`)
          .then(res => res.json())
          .then(json => {
            if (json.success === 1) {
              setEmployees(json.data);
            }
          })
          .catch(err => console.error("Failed to load employees", err));
      }
    }

    // Fetch Statuses
    fetch(`${API_BASE_URL}/statuses`)
      .then(res => res.json())
      .then(data => {
        setStatuses(data);
        const map = {};
        data.forEach(s => map[s.id] = s.statusName);
        setStatusMap(map);
      })
      .catch(err => console.error("Failed to load statuses", err));

  }, []);

  const loadTasks = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const assigneeId = user?.emp_pkey;

      if (assigneeId) {
        // Use new endpoint that combines tasks created by and assigned to the user
        fetch(`${API_BASE_URL}/tasks/user/${user.emp_pkey}`)
          .then(res => res.json())
          .then(data => setTasks(Array.isArray(data) ? data : []))
          .catch(err => {
            console.error("Failed to load tasks", err);
            setTasks([]);
          });
      }
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const employeeName = user?.employee_name || "Employee";
  const loggedInUserId = user?.emp_pkey;

  // Filter tasks based on selected filterType
  const filteredTasks = (Array.isArray(tasks) ? tasks : []).filter(task => {
    if (filterType === "assigned") {
      return Number(task.assigneeId) === Number(loggedInUserId);
    }
    if (filterType === "created") {
      return Number(task.createdBy) === Number(loggedInUserId);
    }
    return true; // 'all'
  });

  const assignedTasks = filteredTasks;

  // Helper function to get employee name by ID
  const getEmployeeName = (assigneeId) => {
    if (!assigneeId) return "Unassigned";
    const employee = employees.find(emp => Number(emp.emp_pkey) === Number(assigneeId));
    return employee?.EmpName?.trim() || "Unknown";
  };

  console.log(assignedTasks, 'assigned');

  // Use Integer Status IDs: 0=PENDING, 1=IN_PROGRESS, 2=COMPLETED
  const pendingCount = assignedTasks.filter(t => t.status === 0).length;
  const progressCount = assignedTasks.filter(t => t.status === 1).length;
  const completedCount = assignedTasks.filter(t => t.status === 2).length;
  const overdueCount = assignedTasks.filter(task =>
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== 2
  ).length;

  return (

    <div className="dashboard">

      {/* Header */}
      <div className="header">
        <div>
          <h2>Welcome, {employeeName} 👋</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "6px" }}>
            Here’s an overview of your tasks
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="card-container">
        <div className="card pending">
          <h4>Pending</h4>
          <p>{pendingCount}</p>
        </div>

        <div className="card progress">
          <h4>In Progress</h4>
          <p>{progressCount}</p>
        </div>

        <div className="card completed">
          <h4>Completed</h4>
          <p>{completedCount}</p>
        </div>
        <div className="card overdue">
          <h4>Overdue</h4>
          <p style={{ color: "#c0392b" }}>{overdueCount}</p>
        </div>
      </div>

      {/* Task Section */}
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h3>Tasks</h3>
          <div className="filter-tabs" style={{ display: "flex", gap: "10px", background: "#f1f5f9", padding: "4px", borderRadius: "100px" }}>
            <button
              onClick={() => setFilterType("all")}
              style={{
                border: "none",
                padding: "6px 16px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: filterType === "all" ? "var(--primary)" : "transparent",
                color: filterType === "all" ? "white" : "var(--text-muted)",
                transition: "var(--transition)"
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("assigned")}
              style={{
                border: "none",
                padding: "6px 16px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: filterType === "assigned" ? "var(--primary)" : "transparent",
                color: filterType === "assigned" ? "white" : "var(--text-muted)",
                transition: "var(--transition)"
              }}
            >
              Assigned to Me
            </button>
            <button
              onClick={() => setFilterType("created")}
              style={{
                border: "none",
                padding: "6px 16px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: filterType === "created" ? "var(--primary)" : "transparent",
                color: filterType === "created" ? "white" : "var(--text-muted)",
                transition: "var(--transition)"
              }}
            >
              Created by Me
            </button>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Create Task
        </button>
      </div>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onTaskCreated={loadTasks}
        />
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Description</th>
              <th>Assignee</th>
              <th>Created By</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {assignedTasks.map(task => {
              const isOverdue =
                task.deadline &&
                new Date(task.deadline) < new Date() &&
                task.status !== 2; // 2 = COMPLETED

              return (
                <tr
                  key={`${task.source}-${task.id}`}
                  onClick={() => setSelectedTask(task)}
                  className={isOverdue ? "overdue-task" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td>{task.taskId}</td>
                  <td>{task.taskName}</td>
                  <td>{task.description}</td>
                  <td>{task.empName || getEmployeeName(task.assigneeId)}</td>
                  <td>{task.createdByName || getEmployeeName(task.createdBy)}</td>
                  <td>{task.deadline}</td>
                  <td>
                    <span className={`task-status status-${task.status}`}>
                      {statusMap[task.status] ? statusMap[task.status].replace("_", " ") : task.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onStatusChange={loadTasks}
          />
        )}

      </div>

    </div>
  );
}

export default Dashboard;
