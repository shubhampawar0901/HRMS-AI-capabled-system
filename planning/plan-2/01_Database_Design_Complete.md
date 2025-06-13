# 🗄️ Complete Database Schema Design - AI-Enhanced HRMS

## 📌 Assignment Context

This database design covers the complete HRMS platform with AI features as discussed in our previous conversations, following the database design rules from `planning/Workflow/database.md`.

## 🎯 Core Requirements Covered

### **Authentication & User Management**
- 3 user roles: Admin (HR), Manager, Employee
- JWT-based authentication with role-based access control
- User profile management

### **Core HRMS Features**
1. **Employee Management** - Profiles, onboarding, department management
2. **Attendance Management** - Web check-in/out, tracking, reporting
3. **Leave Management** - Applications, approvals, balance tracking
4. **Payroll Management** - Basic salary calculation, payslip generation
5. **Performance Management** - Goals, reviews, ratings

### **AI Features** (6 features as discussed)
1. **Attrition Predictor** - Employee retention analysis
2. **Smart Feedback Generator** - AI-powered performance feedback
3. **Attendance Anomaly Detection** - Pattern analysis
4. **HR Chatbot** - Role-based conversational AI (simplified, no audit logging)
5. **Resume Parser** - Automated resume processing
6. **Smart Reports** - AI-generated insights

## 🗄️ Complete SQL DDL Script

```sql
-- =============================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- Users table for authentication
CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INT,
    parent_id INT,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES department(id) ON DELETE SET NULL
);

-- Employees table (core profile data)
CREATE TABLE employee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    department_id INT,
    manager_id INT,
    position VARCHAR(100),
    employment_status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    salary DECIMAL(12,2),
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL
);

-- Add foreign key for department manager
ALTER TABLE department ADD FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL;

-- =============================================
-- ATTENDANCE MANAGEMENT
-- =============================================

-- Attendance records
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    work_date DATE NOT NULL,
    total_hours DECIMAL(4,2),
    status ENUM('present', 'absent', 'late', 'half_day') DEFAULT 'present',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    UNIQUE(employee_id, work_date)
);

-- =============================================
-- LEAVE MANAGEMENT
-- =============================================

-- Leave types
CREATE TABLE leave_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_days_per_year INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Leave balances
CREATE TABLE leave_balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year INT NOT NULL,
    allocated_days INT DEFAULT 0,
    used_days INT DEFAULT 0,
    remaining_days INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_type(id) ON DELETE CASCADE,
    UNIQUE(employee_id, leave_type_id, year)
);

-- Leave applications
CREATE TABLE leave_application (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    approved_by INT,
    approved_at DATETIME,
    rejection_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_type(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employee(id) ON DELETE SET NULL
);

-- =============================================
-- PAYROLL MANAGEMENT (Simplified)
-- =============================================

-- Payroll records
CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    allowances DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    tax_deduction DECIMAL(12,2) DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    status ENUM('draft', 'processed', 'paid') DEFAULT 'draft',
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

-- =============================================
-- PERFORMANCE MANAGEMENT
-- =============================================

-- Performance goals
CREATE TABLE performance_goal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    progress_percentage TINYINT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES employee(id) ON DELETE SET NULL
);

-- Performance reviews
CREATE TABLE performance_review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating TINYINT CHECK (overall_rating >= 1 AND overall_rating <= 5),
    feedback TEXT,
    goals_achievement TEXT,
    areas_of_improvement TEXT,
    status ENUM('draft', 'submitted', 'completed') DEFAULT 'draft',
    submitted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employee(id) ON DELETE CASCADE
);

-- =============================================
-- AI FEATURES TABLES
-- =============================================

-- AI Attrition Predictions
CREATE TABLE ai_attrition_prediction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    risk_score DECIMAL(5,2) NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level ENUM('low', 'medium', 'high') NOT NULL,
    contributing_factors TEXT,
    recommendations TEXT,
    prediction_date DATE NOT NULL,
    model_version VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
);

-- AI Smart Feedback
CREATE TABLE ai_smart_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    feedback_type ENUM('performance', 'development', 'recognition') NOT NULL,
    ai_generated_feedback TEXT NOT NULL,
    human_feedback TEXT,
    is_approved BOOLEAN DEFAULT false,
    approved_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employee(id) ON DELETE SET NULL
);

-- AI Attendance Anomaly Detection
CREATE TABLE ai_attendance_anomaly (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    anomaly_date DATE NOT NULL,
    anomaly_type ENUM('late_arrival', 'early_departure', 'long_break', 'irregular_pattern') NOT NULL,
    severity ENUM('low', 'medium', 'high') NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by INT,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES employee(id) ON DELETE SET NULL
);

-- AI Chatbot Conversations
CREATE TABLE ai_chatbot_conversation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    intent VARCHAR(100),
    confidence_score DECIMAL(3,2),
    response_time_ms INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- AI Resume Parser
CREATE TABLE ai_resume_parser (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_name VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    skills TEXT,
    experience_years TINYINT,
    education TEXT,
    parsed_data_json TEXT, -- Store JSON as TEXT in MySQL
    resume_file_path VARCHAR(500),
    parsing_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AI Smart Reports
CREATE TABLE ai_smart_report (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(200) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    generated_by INT NOT NULL,
    ai_insights TEXT,
    report_data_json TEXT, -- Store JSON as TEXT in MySQL
    parameters_json TEXT, -- Store JSON as TEXT in MySQL
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES user(id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User authentication indexes
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_role ON user(role);
CREATE INDEX idx_user_active ON user(is_active);

-- Employee indexes
CREATE INDEX idx_employee_user_id ON employee(user_id);
CREATE INDEX idx_employee_department ON employee(department_id);
CREATE INDEX idx_employee_manager ON employee(manager_id);
CREATE INDEX idx_employee_status ON employee(employment_status);
CREATE INDEX idx_employee_code ON employee(employee_code);

-- Attendance indexes
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(work_date);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, work_date);

-- Leave indexes
CREATE INDEX idx_leave_application_employee ON leave_application(employee_id);
CREATE INDEX idx_leave_application_status ON leave_application(status);
CREATE INDEX idx_leave_application_dates ON leave_application(start_date, end_date);

-- Payroll indexes
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(pay_period_start, pay_period_end);

-- Performance indexes
CREATE INDEX idx_performance_goal_employee ON performance_goal(employee_id);
CREATE INDEX idx_performance_review_employee ON performance_review(employee_id);
CREATE INDEX idx_performance_review_reviewer ON performance_review(reviewer_id);

-- AI features indexes
CREATE INDEX idx_ai_attrition_employee ON ai_attrition_prediction(employee_id);
CREATE INDEX idx_ai_attrition_date ON ai_attrition_prediction(prediction_date);
CREATE INDEX idx_ai_feedback_employee ON ai_smart_feedback(employee_id);
CREATE INDEX idx_ai_anomaly_employee ON ai_attendance_anomaly(employee_id);
CREATE INDEX idx_ai_anomaly_date ON ai_attendance_anomaly(anomaly_date);
CREATE INDEX idx_chatbot_user ON ai_chatbot_conversation(user_id);
CREATE INDEX idx_chatbot_session ON ai_chatbot_conversation(session_id);

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default leave types
INSERT INTO leave_type (name, description, max_days_per_year) VALUES
('Annual Leave', 'Yearly vacation leave', 30),
('Sick Leave', 'Medical leave', 12),
('Emergency Leave', 'Emergency situations', 5);

-- =============================================
-- ASSUMPTIONS MADE
-- =============================================
```

## 📋 **Assumptions Made**

1. **Database Type**: MySQL as specified in database.md guidelines
2. **Primary Keys**: Auto-increment INT as specified in guidelines
3. **Authentication**: Simple JWT-based auth without complex MFA (can be added later)
4. **Employee Hierarchy**: Single manager per employee (no matrix reporting)
5. **Leave System**: Calendar year basis, simple approval workflow
6. **Payroll**: Basic calculation without complex tax rules or multiple pay components
7. **Performance**: Simple 1-5 rating scale, annual review cycle
8. **AI Features**: Separate tables for each AI feature for better data isolation
9. **File Storage**: File paths stored as strings (actual files stored externally)
10. **Audit**: Basic audit trails with created_at/updated_at timestamps
11. **Multi-tenancy**: Single tenant design (can be extended for multi-tenant)
12. **Denormalization**: Applied for AI features performance as per guidelines

## 🔧 **Database Design Principles Followed**

✅ **Database Type**: MySQL as specified in database.md
✅ **Normalization**: 3NF with strategic denormalization for performance
✅ **Consistent Naming**: Lowercase with underscores, singular table names
✅ **Primary Keys**: Auto-increment `id` as specified in guidelines
✅ **Foreign Keys**: Proper constraints with CASCADE/SET NULL actions
✅ **Indexes**: Strategic indexing for query performance
✅ **Data Types**: Smallest appropriate MySQL types (INT vs INT)
✅ **Constraints**: CHECK constraints for data validation
✅ **Timestamps**: DATETIME with default values as specified
✅ **Security**: Password hashing, no sensitive data in plain text

This schema follows all database.md guidelines while supporting all core HRMS features and AI capabilities.
