CREATE DATABASE contract_manager;
use contract_manager;

CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_manager VARCHAR(255),
    address VARCHAR(255),
    assigned_sales_person VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    gstin VARCHAR(255),
    name VARCHAR(255),
    pan VARCHAR(255),
    phone VARCHAR(255),
    status VARCHAR(255),
    created_by VARCHAR(255)
);

CREATE TABLE contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    billing_frequency VARCHAR(255),
    end_date DATE,
    payment_terms VARCHAR(255),
    start_date DATE,
    status VARCHAR(255),
    total_value DECIMAL(38,2),
    client_id BIGINT,
    created_by VARCHAR(255),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    base_price DECIMAL(38,2),
    category VARCHAR(255),
    name VARCHAR(255),
    pricing_type VARCHAR(255),
    time_span VARCHAR(255),
    created_by VARCHAR(255)
);

CREATE TABLE sub_services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    price DECIMAL(38,2),
    service_id BIGINT,
    task_template_id BIGINT,
    time_span VARCHAR(255),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE contract_services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_count INT,
    frequency VARCHAR(255),
    tax_percentage DECIMAL(38,2),
    total_amount DECIMAL(38,2),
    unit_price DECIMAL(38,2),
    contract_id BIGINT,
    service_id BIGINT,
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE contract_service_sub_services (
    contract_service_id BIGINT,
    sub_service_id BIGINT,
    PRIMARY KEY (contract_service_id, sub_service_id),
    FOREIGN KEY (contract_service_id) REFERENCES contract_services(id),
    FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
);

CREATE TABLE deliverables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    completed_at DATE,
    due_date DATE,
    month INT,
    remarks VARCHAR(255),
    status VARCHAR(255),
    year INT,
    contract_id BIGINT,
    service_id BIGINT,
    sub_service_id BIGINT,
    FOREIGN KEY (contract_id) REFERENCES contracts(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (sub_service_id) REFERENCES sub_services(id)
);