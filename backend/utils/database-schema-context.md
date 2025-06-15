# 🗄️ **HRMS Database Schema - LLM Context Documentation**

> **Purpose:** Comprehensive database documentation for LLM context generation  
> **Usage:** Loaded by DatabaseContextService for intelligent query generation  
> **Timeout:** 30 seconds for all LLM operations

## 📊 **Database Overview**
- **Purpose:** Complete Human Resource Management System
- **Database:** MySQL (hrms_db)
- **Total Tables:** 17
- **Primary Focus:** Employee lifecycle, attendance, leave, payroll, performance, AI features

---

## 🏢 **Core Business Tables**

### **👥 employees** - Central Employee Information
**Purpose:** Master table containing all employee personal and professional details

| Column | Type | Business Meaning | Example Values | Query Usage |
|--------|------|------------------|----------------|-------------|
| id | int | Unique employee identifier | 1, 2, 3 | Primary key for all employee queries |
| user_id | int | Links to login credentials | 1, 2, 3 | JOIN with users table for authentication |
| employee_code | varchar(20) | Human-readable employee ID | "EMP001", "HR2024" | Search by employee code |
| first_name | varchar(50) | Employee's first name | "John", "Priya" | Name-based searches |
| last_name | varchar(50) | Employee's last name | "Doe", "Sharma" | Full name construction |
| email | varchar(100) | Official company email | "john@company.com" | Communication and login |
| phone | varchar(20) | Contact number | "+91-9876543210" | Emergency contact |
| date_of_birth | date | Birth date for age calculations | "1990-05-15" | Age-based reports |
| gender | enum | Gender identity | "male", "female", "other" | Diversity reports |
| department_id | int | Which department employee belongs to | 1, 2, 3 | JOIN with departments |
| position | varchar(100) | Job title/role | "Software Engineer", "HR Manager" | Role-based queries |
| hire_date | date | When employee joined company | "2023-01-15" | Tenure calculations |
| basic_salary | decimal(10,2) | Monthly basic salary | 50000.00, 75000.00 | Payroll calculations |
| status | enum | Current employment status | "active", "inactive", "terminated" | Active employee filters |
| manager_id | int | Direct reporting manager | 5, 10, 15 | Hierarchy queries |

**Common Query Patterns:**
```sql
-- Get active employees in a department
SELECT * FROM employees WHERE department_id = ? AND status = 'active'

-- Find employee by code
SELECT * FROM employees WHERE employee_code = ?

-- Get team members under a manager
SELECT * FROM employees WHERE manager_id = ? AND status = 'active'
```

### **🏢 departments** - Organizational Structure
**Purpose:** Company organizational units and hierarchy

| Column | Type | Business Meaning | Example Values |
|--------|------|------------------|----------------|
| id | int | Department unique identifier | 1, 2, 3 |
| name | varchar(100) | Department name | "Engineering", "Human Resources", "Finance" |
| description | text | Department purpose/role | "Responsible for software development" |
| manager_id | int | Department head employee ID | 5, 10, 15 |
| is_active | tinyint(1) | Whether department is operational | 1 (active), 0 (inactive) |

### **📅 attendance** - Daily Attendance Records
**Purpose:** Track employee daily attendance, check-in/out times, and work hours

| Column | Type | Business Meaning | Example Values | Query Usage |
|--------|------|------------------|----------------|-------------|
| id | int | Unique attendance record | 1, 2, 3 | Primary key |
| employeeId | int | Which employee's attendance | 1, 2, 3 | Filter by employee |
| date | date | Attendance date | "2024-06-14" | Date range queries |
| checkInTime | time | When employee arrived | "09:15:00", "08:45:00" | Late arrival analysis |
| checkOutTime | time | When employee left | "18:30:00", "17:15:00" | Early departure tracking |
| status | enum | Attendance status | "present", "absent", "late", "half_day" | Status-based reports |
| totalHours | decimal(4,2) | Hours worked that day | 8.50, 7.25, 4.00 | Productivity analysis |
| overtimeHours | decimal(4,2) | Extra hours beyond standard | 1.50, 0.00, 2.25 | Overtime calculations |
| location | varchar(255) | Work location | "Office", "Home", "Client Site" | Remote work tracking |

**Common Query Patterns:**
```sql
-- Get monthly attendance for employee
SELECT * FROM attendance WHERE employeeId = ? AND MONTH(date) = ? AND YEAR(date) = ?

-- Count absent days in a period
SELECT COUNT(*) FROM attendance WHERE employeeId = ? AND status = 'absent' AND date BETWEEN ? AND ?

-- Calculate total working hours
SELECT SUM(totalHours) FROM attendance WHERE employeeId = ? AND MONTH(date) = ?
```

### **🏖️ leave_balances** - Employee Leave Entitlements
**Purpose:** Track how many leave days each employee has available

| Column | Type | Business Meaning | Example Values |
|--------|------|------------------|----------------|
| employee_id | int | Which employee's leave balance | 1, 2, 3 |
| leave_type_id | int | Type of leave (annual, sick, etc.) | 1, 2, 3 |
| year | year | Which calendar year | 2024, 2023 |
| allocated_days | int | Total days given for the year | 21, 10, 5 |
| used_days | int | Days already taken | 8, 3, 0 |
| remaining_days | int | Days still available | 13, 7, 5 |

### **📝 leave_applications** - Leave Requests
**Purpose:** Employee leave requests and their approval status

| Column | Type | Business Meaning | Example Values |
|--------|------|------------------|----------------|
| employee_id | int | Who is requesting leave | 1, 2, 3 |
| leave_type_id | int | What type of leave | 1 (annual), 2 (sick), 3 (maternity) |
| start_date | date | Leave start date | "2024-07-01" |
| end_date | date | Leave end date | "2024-07-05" |
| total_days | int | Number of leave days | 5, 1, 90 |
| reason | text | Why leave is needed | "Family vacation", "Medical treatment" |
| status | enum | Current approval status | "pending", "approved", "rejected", "cancelled" |
| approved_by | int | Manager who approved/rejected | 5, 10, 15 |

### **🎯 performance_reviews** - Employee Performance Evaluations
**Purpose:** Periodic performance assessments and ratings

| Column | Type | Business Meaning | Example Values |
|--------|------|------------------|----------------|
| employee_id | int | Employee being reviewed | 1, 2, 3 |
| reviewer_id | int | Manager conducting review | 5, 10, 15 |
| review_period | varchar(50) | Time period covered | "Q1 2024", "Annual 2023" |
| overall_rating | decimal(3,2) | Performance score | 4.5, 3.8, 5.0 |
| comments | text | Detailed feedback | "Excellent performance in project delivery" |
| status | enum | Review completion status | "draft", "submitted", "approved" |

### **💰 payroll_records** - Salary and Payment Information
**Purpose:** Monthly salary calculations and payment details

| Column | Type | Business Meaning | Example Values |
|--------|------|------------------|----------------|
| employee_id | int | Employee receiving salary | 1, 2, 3 |
| month | tinyint | Salary month | 1-12 |
| year | year | Salary year | 2024, 2023 |
| basic_salary | decimal(10,2) | Base monthly salary | 50000.00, 75000.00 |
| hra | decimal(10,2) | House rent allowance | 15000.00, 22500.00 |
| gross_salary | decimal(10,2) | Total before deductions | 65000.00, 97500.00 |
| pf_deduction | decimal(10,2) | Provident fund deduction | 6000.00, 9000.00 |
| tax_deduction | decimal(10,2) | Income tax deduction | 5000.00, 12000.00 |
| net_salary | decimal(10,2) | Final take-home amount | 54000.00, 76500.00 |
| status | enum | Payment status | "draft", "processed", "paid" |

---

## 🔗 **Table Relationships**

### **Primary Relationships:**
```
users (1) ←→ (1) employees
employees (1) ←→ (many) attendance
employees (1) ←→ (many) leave_applications
employees (1) ←→ (many) leave_balances
employees (1) ←→ (many) performance_reviews
employees (1) ←→ (many) payroll_records
departments (1) ←→ (many) employees
leave_types (1) ←→ (many) leave_applications
leave_types (1) ←→ (many) leave_balances
```

### **Hierarchy Relationships:**
```
employees.manager_id → employees.id (Self-referencing)
departments.manager_id → employees.id
```

---

## 📊 **Common Business Queries**

### **Employee Information Queries:**
```sql
-- Get employee with department info
SELECT e.*, d.name as department_name 
FROM employees e 
LEFT JOIN departments d ON e.department_id = d.id 
WHERE e.id = ?

-- Get team members under manager
SELECT e.first_name, e.last_name, e.position 
FROM employees e 
WHERE e.manager_id = ? AND e.status = 'active'
```

### **Attendance Analysis:**
```sql
-- Monthly attendance summary
SELECT 
  COUNT(*) as total_days,
  SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
  SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
  SUM(totalHours) as total_hours
FROM attendance 
WHERE employeeId = ? AND MONTH(date) = ? AND YEAR(date) = ?
```

### **Leave Management:**
```sql
-- Current year leave balance
SELECT lb.*, lt.name as leave_type_name
FROM leave_balances lb
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.employee_id = ? AND lb.year = YEAR(CURDATE())
```

---

## 🎯 **LLM Query Generation Guidelines**

### **Security Rules:**
1. **Always filter by employee_id** for personal data queries
2. **Never expose other employees' sensitive data** (salary, personal info)
3. **Use proper JOINs** to get related information
4. **Filter by status = 'active'** for current employees
5. **30-second timeout** for all LLM operations

### **Performance Tips:**
1. **Use indexed columns** for WHERE clauses (employee_id, date, status)
2. **Limit date ranges** for large tables (attendance, payroll)
3. **Use appropriate aggregations** (COUNT, SUM, AVG) for summaries

### **Common Patterns:**
- **Personal Data:** Always WHERE employee_id = ?
- **Date Ranges:** Use BETWEEN for date ranges
- **Status Filters:** Include status checks for active records
- **Joins:** Use LEFT JOIN to include records even if related data is missing
