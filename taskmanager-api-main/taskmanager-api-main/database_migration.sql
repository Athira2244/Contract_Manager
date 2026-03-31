-- 1. Create the new Master Table
CREATE TABLE task_status_master (
    id INT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

-- 2. Insert Default Statuses
INSERT INTO task_status_master (id, status_name) VALUES 
(0, 'PENDING'),
(1, 'IN_PROGRESS'),
(2, 'COMPLETED');

CREATE TABLE checklist_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    created_by INT
);

CREATE TABLE checklist_template_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id BIGINT,
    item_text TEXT,
    FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE
);

CREATE TABLE emp_task_time (
    time_id INT AUTO_INCREMENT PRIMARY KEY,
    emp_fkey INT,
    task_fkey INT,
    start_time DATETIME,
    end_time DATETIME,
    duration_minutes INT,
    created_date TIMESTAMP,
    comment VARCHAR(255),
    emp_name VARCHAR(255)
);

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255)
);

CREATE TABLE feed_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feed_id INT,
    emp_fkey INT,
    is_read BIT(1),
    read_at DATETIME
);

CREATE TABLE feeds (
    feed_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    message TEXT,
    is_global BIT(1),
    is_announcement INT,
    created_at DATETIME
);

CREATE TABLE task_assignees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT,
    assignee_id BIGINT,
    status INT,
    is_assignee INT,
    assignee_name VARCHAR(255),
    assigned_at TIMESTAMP,
    created_at DATETIME(6),
    pending_date DATETIME,
    in_progress_date DATETIME,
    completed_date DATETIME
);

CREATE TABLE task_checklist_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT,
    item_text VARCHAR(255),
    is_completed TINYINT(1)
);

CREATE TABLE tasks (
    task_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255),
    description VARCHAR(255),
    assignee_id INT,
    created_by INT,
    EmpName VARCHAR(255),
    deadline DATETIME,
    created_by_name VARCHAR(255),
    created_date TIMESTAMP,
    status INT,
    attachment VARCHAR(255),
    emp_name VARCHAR(255),
    is_assignee INT,
    pending_date DATETIME,
    in_progress_date DATETIME,
    completed_date DATETIME
);
