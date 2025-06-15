# 👥 AGENT 2 - EMPLOYEE MANAGEMENT SERVICE DEVELOPMENT

## 🚨 **CRITICAL: USE DEVELOP BRANCH & NEW ARCHITECTURE**

### **🔄 MANDATORY FIRST STEPS:**
```bash
# 1. Switch to develop branch and get latest code
git checkout develop
git pull origin develop

# 2. Check the new architecture (NO SEQUELIZE, NO SHARED FOLDER)
ls backend/  # You should see: models/, controllers/, routes/, middleware/, utils/, services/
```

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 2
- **Service**: Employee Management Service
- **Architecture**: **PLAIN SQL** (No Sequelize) + **Global Folder Structure**
- **Your Files**: `EmployeeController.js`, `employeeRoutes.js`, `EmployeeService.js`
- **Priority**: HIGH (Critical Foundation Service)

## 🏗️ **NEW ARCHITECTURE (CRITICAL CHANGES)**

### **✅ CORRECTED STRUCTURE:**
```
backend/
├── models/                     # 🔥 GLOBAL MODELS (Plain SQL) - READ ONLY
│   ├── Employee.js            # ← ALREADY CREATED (use this)
│   ├── Department.js          # ← ALREADY CREATED (use this)
│   └── User.js                # ← ALREADY CREATED (use this)
├── controllers/               # 🔥 GLOBAL CONTROLLERS
│   └── EmployeeController.js  # ← YOUR CONTROLLER (already exists - update it)
├── routes/                    # 🔥 GLOBAL ROUTES
│   └── employeeRoutes.js      # ← YOUR ROUTES (already exists - update it)
├── middleware/                # 🔥 GLOBAL MIDDLEWARE - READ ONLY
├── utils/                     # 🔥 GLOBAL UTILITIES - READ ONLY
└── services/                  # 🔥 BUSINESS LOGIC ONLY
    └── EmployeeService.js     # ← YOUR SERVICE (already exists - update it)
```

### **🚫 ABSOLUTE PROHIBITIONS:**
```bash
# NEVER RUN THESE COMMANDS:
git commit -m "..."          # ❌ FORBIDDEN
git push origin ...          # ❌ FORBIDDEN
git merge ...                # ❌ FORBIDDEN
git rebase ...               # ❌ FORBIDDEN
```

### **📁 YOUR EXACT WORKSPACE:**
- ✅ **WORK ONLY ON**:
  - `backend/controllers/EmployeeController.js` (UPDATE EXISTING)
  - `backend/routes/employeeRoutes.js` (UPDATE EXISTING)
  - `backend/services/EmployeeService.js` (UPDATE EXISTING)
- ❌ **NEVER TOUCH**:
  - `backend/models/` (read-only, already created with Plain SQL)
  - `backend/middleware/` (read-only, already created)
  - `backend/config/` folder
  - `backend/app.js`
  - Other agents' files

## 📚 **MANDATORY READING**
Before starting, read these documents:
1. `backend/ARCHITECTURE.md` (NEW - explains corrected structure)
2. `planning/Workflow/backend.md`
3. `planning/Backend_Agent_Tasks.md` (Agent 2 section)
4. `backend/database/schema.sql` (employees, departments tables)

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
GET    /api/employees              # Get employees list (with filtering)
GET    /api/employees/:id          # Get employee details
POST   /api/employees              # Create new employee (Admin only)
PUT    /api/employees/:id          # Update employee details
DELETE /api/employees/:id          # Deactivate employee (Admin only)
POST   /api/employees/:id/documents # Upload employee documents
GET    /api/employees/:id/documents # Get employee documents
GET    /api/departments            # Get departments list
POST   /api/departments            # Create department (Admin only)
```

### **🚨 CRITICAL: FILES ALREADY EXIST - UPDATE THEM**
The files are already created with basic structure. **DO NOT CREATE NEW FILES**. Update existing ones:

```
backend/
├── controllers/
│   └── EmployeeController.js   # ← UPDATE THIS (already has methods)
├── routes/
│   └── employeeRoutes.js      # ← UPDATE THIS (already has routes)
└── services/
    └── EmployeeService.js     # ← UPDATE THIS (already has methods)
```

### **🔍 EXISTING FILES TO USE (READ-ONLY):**
```
backend/
├── models/
│   ├── Employee.js            # ← USE THIS (Plain SQL model - already complete)
│   ├── Department.js          # ← USE THIS (Plain SQL model - already complete)
│   └── User.js                # ← USE THIS (for user account creation)
├── middleware/
│   └── authMiddleware.js      # ← USE THIS (authentication)
└── utils/
    └── responseHelper.js      # ← USE THIS (sendSuccess, sendError, sendCreated)
```

### **🔥 IMPLEMENTATION REQUIREMENTS (PLAIN SQL):**

#### **1. UPDATE EmployeeController.js:**
The file already exists with methods. **Update and complete them**:
```javascript
const { Employee, Department, User } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const EmployeeService = require('../services/EmployeeService');

class EmployeeController {
  static async getAllEmployees(req, res)      // Already exists - complete it
  static async getEmployeeById(req, res)      // Already exists - complete it
  static async createEmployee(req, res)       // Already exists - complete it
  static async updateEmployee(req, res)       // Already exists - complete it
  static async deleteEmployee(req, res)       // Already exists - complete it
  static async uploadEmployeeDocument(req, res) // Already exists - complete it
  static async getEmployeeDocuments(req, res)   // Already exists - complete it
  static async getAllDepartments(req, res)     // Already exists - complete it
  static async createDepartment(req, res)      // Already exists - complete it
}
```

#### **2. UPDATE EmployeeService.js:**
The file already exists with methods. **Update and complete them**:
```javascript
const { Employee, Department, User } = require('../models');

class EmployeeService {
  static async createEmployee(employeeData)    // Already exists - complete it
  static async updateEmployee(id, data)        // Already exists - complete it
  static async deactivateEmployee(id, reason)  // Already exists - complete it
  static async uploadDocument(id, docData)     // Already exists - complete it
  static async getEmployeeDocuments(id, type)  // Already exists - complete it
  static async searchEmployees(criteria)       // Already exists - complete it
  static async getEmployeeStatistics()         // Already exists - complete it
}
```

#### **3. UPDATE employeeRoutes.js:**
The file already exists with routes. **Update and complete them**:
```javascript
const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Routes already exist - complete the validation and middleware
router.get('/', authenticateToken, authorizeRoles(['admin', 'manager']), EmployeeController.getAllEmployees);
router.post('/', authenticateToken, authorizeRoles(['admin', 'manager']), EmployeeController.createEmployee);
// ... etc (all routes already defined)
```

#### **4. Use Existing Models (Plain SQL - READ ONLY):**
The models are already created with Plain SQL. **DO NOT MODIFY THEM**. Just use them:
```javascript
const { Employee, Department, User } = require('../models');

// Available Employee methods (already implemented):
await Employee.findById(id)
await Employee.findAll(options)
await Employee.create(employeeData)
await Employee.update(id, updateData)
await Employee.delete(id)
await Employee.generateEmployeeCode()

// Available Department methods (already implemented):
await Department.findById(id)
await Department.findAll(options)
await Department.create(departmentData)
await Department.update(id, updateData)
```

#### **4. Document Handling:**
```javascript
class DocumentController {
  static async uploadDocument(req, res)    // Handle file upload
  static async getDocuments(req, res)      // Get employee documents
  static async deleteDocument(req, res)    // Delete document
}

class DocumentService {
  static async saveDocument(data)          // Save document metadata
  static async processResume(file)         // Process resume with AI
  static async validateFile(file)          // Validate uploaded file
}
```

#### **5. Role-Based Access Control:**
- Admin: Full access to all employees
- Manager: Access to their team members only
- Employee: Access to their own profile only

#### **6. Employee Code Generation:**
- Format: EMP001, EMP002, etc.
- Auto-increment based on existing employees
- Unique constraint validation

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests (>90% coverage):**
```javascript
describe('EmployeeController', () => {
  test('get all employees with pagination')
  test('get employee by ID')
  test('create employee with valid data')
  test('create employee with invalid data')
  test('update employee details')
  test('deactivate employee')
  test('role-based access control')
})

describe('EmployeeService', () => {
  test('employee code generation')
  test('user account creation')
  test('data validation')
  test('filtering and search')
})
```

### **Integration Tests:**
```javascript
describe('Employee API Integration', () => {
  test('complete employee lifecycle')
  test('document upload and retrieval')
  test('department management')
  test('role-based access scenarios')
})
```

## 🔒 **SECURITY REQUIREMENTS**
- Implement role-based access control
- Validate all input data
- Sanitize file uploads
- Protect sensitive employee information
- Audit log for employee changes
- Secure document storage

## 📋 **DATABASE INTEGRATION**
Use these tables from the database schema:
```sql
-- employees table
employees (
  id UUID PRIMARY KEY,
  employee_code VARCHAR(20) UNIQUE,
  user_id UUID REFERENCES users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  department_id UUID REFERENCES departments(id),
  position VARCHAR(100),
  manager_id UUID REFERENCES employees(id),
  basic_salary DECIMAL(12,2),
  join_date DATE,
  status VARCHAR(20) DEFAULT 'active'
)

-- departments table
departments (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES employees(id)
)

-- employee_documents table
employee_documents (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  document_type VARCHAR(50),
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  uploaded_at TIMESTAMP
)
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 9 API endpoints implemented and working
- [ ] Employee CRUD operations functional
- [ ] Department management working
- [ ] Document upload system operational
- [ ] Employee code generation working
- [ ] Role-based access control implemented
- [ ] Input validation and sanitization complete
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing
- [ ] Error handling comprehensive

## 📋 **COMPLETION PROTOCOL**

### **When You Complete Your Work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** with this format:

```markdown
🤖 **AGENT 2 COMPLETION REPORT**

✅ **Status**: COMPLETED
📁 **Workspace**: backend/services/employee-service/
🌿 **Branch**: feature/employee-service-implementation
📝 **Files Modified**: 
[Paste output of 'git status']

🧪 **Tests**: 
- Unit Tests: [PASS/FAIL] - [X]% coverage
- Integration Tests: [PASS/FAIL]
- RBAC Tests: [PASS/FAIL]

📚 **API Endpoints Implemented**:
- GET /api/employees: [✅/❌]
- GET /api/employees/:id: [✅/❌]
- POST /api/employees: [✅/❌]
- PUT /api/employees/:id: [✅/❌]
- DELETE /api/employees/:id: [✅/❌]
- POST /api/employees/:id/documents: [✅/❌]
- GET /api/employees/:id/documents: [✅/❌]
- GET /api/departments: [✅/❌]
- POST /api/departments: [✅/❌]

🔒 **Features Implemented**:
- Employee CRUD: [✅/❌]
- Department management: [✅/❌]
- Document upload: [✅/❌]
- Employee code generation: [✅/❌]
- Role-based access: [✅/❌]

🔗 **Integration Notes**:
- Ready for Attendance Service integration
- Ready for Leave Service integration
- Employee data available for other services

⚠️ **Issues Encountered**: [None/List any issues]

🚀 **Ready for User Commit**: [YES/NO]
```

## 🆘 **EMERGENCY PROTOCOL**
**STOP IMMEDIATELY and report if you encounter:**
- Database schema questions
- File upload configuration issues
- Role-based access implementation questions
- Integration with Auth Service problems
- Document processing requirements

**Report Format**: "🚨 URGENT: Agent 2 needs assistance - [brief issue description]"

## 🚀 **START COMMAND**
Begin by reading the mandatory documentation, then create the service structure and implement the employee management system. Remember: **WORK ONLY in backend/services/employee-service/** and **NEVER commit code**.

This service is critical for Agents 3 and 4 - they depend on your completion! 🎯
