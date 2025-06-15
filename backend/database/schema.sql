-- HRMS Database Schema (Plain SQL)
-- MySQL Database Schema for HRMS Application
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hrms_db;
USE hrms_db;
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME NULL,
  refresh_token TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (is_active)
);
-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  manager_id INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_manager (manager_id),
  INDEX idx_active (is_active)
);
-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  employee_code VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  department_id INT,
  position VARCHAR(100),
  hire_date DATE NOT NULL,
  basic_salary DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('active', 'inactive', 'terminated', 'deleted') DEFAULT 'active',
  manager_id INT NULL,
  emergency_contact VARCHAR(100),
  emergency_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE
  SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE
  SET NULL,
    INDEX idx_employee_code (employee_code),
    INDEX idx_user_id (user_id),
    INDEX idx_department (department_id),
    INDEX idx_manager (manager_id),
    INDEX idx_status (status),
    INDEX idx_name (first_name, last_name)
);
-- Employee Documents table
CREATE TABLE IF NOT EXISTS employee_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  document_type ENUM(
    'resume',
    'id_proof',
    'address_proof',
    'education',
    'experience',
    'other'
  ) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  parsed_data JSON NULL,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_employee (employee_id),
  INDEX idx_document_type (document_type),
  INDEX idx_uploaded_by (uploaded_by)
);
-- Attendance Records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  total_hours DECIMAL(4, 2) DEFAULT 0.00,
  status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_date (employee_id, date),
  INDEX idx_employee (employee_id),
  INDEX idx_date (date),
  INDEX idx_status (status)
);
-- Leave Types table
CREATE TABLE IF NOT EXISTS leave_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  max_days_per_year INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);
-- Leave Balances table
CREATE TABLE IF NOT EXISTS leave_balances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  year YEAR NOT NULL,
  allocated_days INT DEFAULT 0,
  used_days INT DEFAULT 0,
  remaining_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year),
  INDEX idx_employee (employee_id),
  INDEX idx_leave_type (leave_type_id),
  INDEX idx_year (year)
);
-- Leave Applications table
CREATE TABLE IF NOT EXISTS leave_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  approved_by INT NULL,
  approved_at DATETIME NULL,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE
  SET NULL,
    INDEX idx_employee (employee_id),
    INDEX idx_leave_type (leave_type_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_approved_by (approved_by)
);
-- Payroll Records table
CREATE TABLE IF NOT EXISTS payroll_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month TINYINT NOT NULL,
  year YEAR NOT NULL,
  basic_salary DECIMAL(10, 2) NOT NULL,
  hra DECIMAL(10, 2) DEFAULT 0.00,
  transport_allowance DECIMAL(10, 2) DEFAULT 0.00,
  overtime_pay DECIMAL(10, 2) DEFAULT 0.00,
  gross_salary DECIMAL(10, 2) NOT NULL,
  pf_deduction DECIMAL(10, 2) DEFAULT 0.00,
  tax_deduction DECIMAL(10, 2) DEFAULT 0.00,
  total_deductions DECIMAL(10, 2) DEFAULT 0.00,
  net_salary DECIMAL(10, 2) NOT NULL,
  working_days INT NOT NULL,
  present_days INT NOT NULL,
  overtime_hours DECIMAL(4, 2) DEFAULT 0.00,
  status ENUM('draft', 'processed', 'paid') DEFAULT 'draft',
  processed_by INT NULL,
  processed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE
  SET NULL,
    UNIQUE KEY unique_employee_month_year (employee_id, month, year),
    INDEX idx_employee (employee_id),
    INDEX idx_month_year (month, year),
    INDEX idx_status (status),
    INDEX idx_processed_by (processed_by)
);
-- Performance Goals table
CREATE TABLE IF NOT EXISTS performance_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE,
  achievement_percentage DECIMAL(5, 2) DEFAULT 0.00,
  status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_employee (employee_id),
  INDEX idx_status (status),
  INDEX idx_target_date (target_date),
  INDEX idx_created_by (created_by)
);
-- Performance Reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  review_period VARCHAR(50) NOT NULL,
  overall_rating DECIMAL(3, 2) NOT NULL,
  comments TEXT,
  status ENUM('draft', 'submitted', 'approved') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_employee (employee_id),
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_status (status),
  INDEX idx_review_period (review_period)
);
-- Add foreign key constraint for departments manager
ALTER TABLE departments
ADD CONSTRAINT fk_departments_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE
SET NULL;
-- Insert default leave types
INSERT IGNORE INTO leave_types (name, description, max_days_per_year)
VALUES ('Annual Leave', 'Annual vacation leave', 21),
  ('Sick Leave', 'Medical leave', 10),
  ('Casual Leave', 'Casual/personal leave', 12),
  ('Maternity Leave', 'Maternity leave', 180),
  ('Paternity Leave', 'Paternity leave', 15);
-- AI Attrition Predictions table
CREATE TABLE IF NOT EXISTS ai_attrition_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  risk_score DECIMAL(5, 4) NOT NULL,
  risk_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  factors JSON,
  recommendations JSON,
  prediction_date DATE NOT NULL,
  model_version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee (employee_id),
  INDEX idx_risk_level (risk_level),
  INDEX idx_prediction_date (prediction_date)
);
-- AI Smart Feedback table
CREATE TABLE IF NOT EXISTS ai_smart_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  feedback_type ENUM(
    'performance',
    'development',
    'career',
    'general'
  ) NOT NULL,
  generated_feedback TEXT NOT NULL,
  performance_data JSON,
  suggestions JSON,
  confidence DECIMAL(5, 4),
  generated_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_employee (employee_id),
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_generated_by (generated_by)
);
-- AI Attendance Anomalies table
CREATE TABLE IF NOT EXISTS ai_attendance_anomalies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  anomaly_type ENUM(
    'late_pattern',
    'early_leave',
    'irregular_hours',
    'absence_pattern'
  ) NOT NULL,
  detected_date DATE NOT NULL,
  anomaly_data JSON,
  severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
  description TEXT,
  recommendations JSON,
  status ENUM('active', 'resolved', 'ignored') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee (employee_id),
  INDEX idx_anomaly_type (anomaly_type),
  INDEX idx_detected_date (detected_date),
  INDEX idx_status (status)
);
-- AI Chatbot Interactions table
CREATE TABLE IF NOT EXISTS ai_chatbot_interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  user_query TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  intent VARCHAR(100),
  confidence DECIMAL(5, 4),
  response_time INT,
  feedback ENUM('positive', 'negative', 'neutral'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_session (session_id),
  INDEX idx_intent (intent),
  INDEX idx_created_at (created_at)
);
-- AI Resume Parser table
CREATE TABLE IF NOT EXISTS ai_resume_parser (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  parsed_data JSON,
  extracted_text TEXT,
  confidence DECIMAL(5, 4),
  processing_time INT,
  status ENUM('processing', 'processed', 'failed') DEFAULT 'processing',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE
  SET NULL,
    INDEX idx_employee (employee_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
-- Insert default departments
INSERT IGNORE INTO departments (name, description)
VALUES ('Human Resources', 'Human Resources Department'),
  ('Information Technology', 'IT Department'),
  ('Finance', 'Finance and Accounting Department'),
  ('Marketing', 'Marketing and Sales Department'),
  ('Operations', 'Operations Department');