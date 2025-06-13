# 🗄️ Database Schema Design - AI-Enhanced HRMS

## Assignment Requirements Analysis

Based on the assignment from `question.md`, the HRMS platform requires:

### **Core Features**:
1. **Employee Management**: Onboarding/offboarding, RBAC, org chart
2. **Attendance & Leave Management**: Virtual attendance, calendar-based leave system
3. **Payroll Management**: Salary structure, compliance tracking
4. **Performance Management**: Goals/KRAs/OKRs, 360-degree feedback, appraisals
5. **Reports & Analytics**: Standard/custom reports, role-specific dashboards
6. **AI Features**: Attrition predictor, feedback generator, anomaly detection, chatbot, resume parser

### **Simplified Approach Assumptions**:
1. **3 User Roles Only**: Admin, Manager, Employee (instead of 6+ complex roles)
2. **Simple Payroll**: Basic calculation without complex compliance (4 tables max)
3. **Single-Level Approval**: Manager approval only (no multi-level workflows)
4. **Virtual Attendance**: Web-based check-in/out (no biometric complexity)
5. **Basic Leave Types**: Annual, Sick, Personal only
6. **Manager-Only Performance Reviews**: No 360-degree feedback complexity
7. **Minimal Onboarding Data**: Essential information only

---

## 🗄️ **Complete Database Schema (SQL DDL)**

```sql
-- =============================================
-- CORE AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- EMPLOYEE MANAGEMENT
-- =============================================

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee profiles (extends users)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    manager_id UUID REFERENCES employees(id),
    basic_salary DECIMAL(12,2),
    join_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee documents (for resume parsing and basic docs)
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'resume', 'id_proof', 'contract'
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ATTENDANCE MANAGEMENT
-- =============================================

-- Daily attendance records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    total_hours DECIMAL(4,2),
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'partial', 'holiday')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- =============================================
-- LEAVE MANAGEMENT
-- =============================================

-- Leave types (simplified to 3 types)
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- 'Annual', 'Sick', 'Personal'
    description TEXT,
    max_days_per_year INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true
);

-- Employee leave balances
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    allocated_days INTEGER DEFAULT 0,
    used_days INTEGER DEFAULT 0,
    remaining_days INTEGER DEFAULT 0,
    UNIQUE(employee_id, leave_type_id, year)
);

-- Leave applications
CREATE TABLE leave_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PAYROLL MANAGEMENT (SIMPLIFIED)
-- =============================================

-- Salary structures (simple approach)
CREATE TABLE salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    basic_salary DECIMAL(12,2) NOT NULL,
    hra_percentage DECIMAL(5,2) DEFAULT 40.00, -- 40% HRA
    pf_percentage DECIMAL(5,2) DEFAULT 12.00,  -- 12% PF
    tax_percentage DECIMAL(5,2) DEFAULT 10.00, -- 10% Tax
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly payroll runs
CREATE TABLE payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'cancelled')),
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, year)
);

-- Individual payslips
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    payroll_run_id UUID REFERENCES payroll_runs(id),
    basic_salary DECIMAL(12,2) NOT NULL,
    hra_amount DECIMAL(12,2) DEFAULT 0,
    other_allowances DECIMAL(12,2) DEFAULT 0,
    gross_salary DECIMAL(12,2) NOT NULL,
    pf_deduction DECIMAL(12,2) DEFAULT 0,
    tax_deduction DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, payroll_run_id)
);

-- =============================================
-- PERFORMANCE MANAGEMENT
-- =============================================

-- Performance review cycles
CREATE TABLE performance_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    review_type VARCHAR(50) DEFAULT 'annual' CHECK (review_type IN ('annual', 'quarterly', 'monthly')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee goals/objectives
CREATE TABLE employee_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES performance_cycles(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_value VARCHAR(100),
    weight_percentage DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    achievement_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance reviews (manager only)
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES employees(id), -- Manager
    cycle_id UUID REFERENCES performance_cycles(id),
    overall_rating DECIMAL(3,2), -- 1.0 to 5.0
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_achievement_score DECIMAL(5,2) DEFAULT 0,
    manager_comments TEXT,
    employee_comments TEXT, -- Self assessment
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed')),
    submitted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AI FEATURES SUPPORT TABLES
-- =============================================

-- AI-generated feedback storage
CREATE TABLE ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    review_id UUID REFERENCES performance_reviews(id),
    feedback_type VARCHAR(50) NOT NULL, -- 'performance_review', 'goal_feedback'
    generated_content TEXT NOT NULL,
    confidence_score DECIMAL(3,2), -- AI confidence level
    human_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attrition prediction data
CREATE TABLE attrition_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    risk_score DECIMAL(3,2) NOT NULL, -- 0.0 to 1.0
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    contributing_factors JSONB, -- Store factors as JSON
    prediction_date DATE NOT NULL,
    model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anomaly detection logs
CREATE TABLE anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'payroll', 'attendance', 'performance'
    entity_id UUID NOT NULL, -- Reference to the anomalous record
    anomaly_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive'))
);

-- HR Chatbot conversation logs
CREATE TABLE chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    session_id VARCHAR(100) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    intent VARCHAR(100), -- Detected intent
    confidence_score DECIMAL(3,2),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User authentication indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Employee management indexes
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_code ON employees(employee_code);

-- Attendance indexes
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- Leave management indexes
CREATE INDEX idx_leave_applications_employee ON leave_applications(employee_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year);

-- Payroll indexes
CREATE INDEX idx_payslips_employee_payroll ON payslips(employee_id, payroll_run_id);
CREATE INDEX idx_payroll_runs_period ON payroll_runs(year, month);

-- Performance indexes
CREATE INDEX idx_goals_employee_cycle ON employee_goals(employee_id, cycle_id);
CREATE INDEX idx_reviews_employee_cycle ON performance_reviews(employee_id, cycle_id);

-- AI features indexes
CREATE INDEX idx_attrition_employee_date ON attrition_predictions(employee_id, prediction_date);
CREATE INDEX idx_anomalies_entity ON anomaly_detections(entity_type, entity_id);
CREATE INDEX idx_chatbot_employee_session ON chatbot_conversations(employee_id, session_id);

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default leave types
INSERT INTO leave_types (name, description, max_days_per_year) VALUES
('Annual', 'Annual vacation leave', 30),
('Sick', 'Medical leave', 12),
('Personal', 'Personal emergency leave', 5);

-- Insert default performance cycle
INSERT INTO performance_cycles (name, start_date, end_date, review_type) VALUES
('Annual Review 2024', '2024-01-01', '2024-12-31', 'annual');
```

---

## 📋 **Schema Assumptions Made**

1. **UUID Primary Keys**: Using UUIDs for better scalability and security
2. **Simplified Payroll**: Only basic salary components (basic + HRA + PF + tax)
3. **Single Manager Approval**: No multi-level approval workflows
4. **3 Leave Types Only**: Annual, Sick, Personal (no complex leave policies)
5. **Manager-Only Reviews**: No 360-degree feedback complexity
6. **JSON Storage for AI Data**: Using JSONB for flexible AI-related data storage
7. **Basic Document Storage**: File path storage only (actual files in cloud storage)
8. **Minimal Employee Data**: Only essential fields for onboarding
9. **Simple Attendance**: Web-based check-in/out only
10. **AI Tables for Future**: Prepared for LLM-based AI features

---

## 🔗 **Table Relationships Summary**

- **users** → **employees** (1:1 via user_id)
- **departments** → **employees** (1:many)
- **employees** → **employees** (manager hierarchy)
- **employees** → **attendance_records** (1:many)
- **employees** → **leave_applications** (1:many)
- **employees** → **payslips** (1:many)
- **employees** → **performance_reviews** (1:many)
- **employees** → **ai_feedback** (1:many)

This schema supports all core HRMS functionality while maintaining simplicity for rapid development and easy AI integration.
