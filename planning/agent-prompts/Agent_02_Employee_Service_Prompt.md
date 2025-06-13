# 👥 AGENT 2 - EMPLOYEE MANAGEMENT SERVICE DEVELOPMENT

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 2
- **Service**: Employee Management Service
- **Workspace Folder**: `backend/services/employee-service/`
- **Git Branch**: `feature/employee-service-implementation`
- **Development Phase**: Phase 1 (Foundation)
- **Priority**: HIGH (Critical Foundation Service)
- **Dependencies**: Agent 1 (Auth Service) must be completed first

## 🚨 **CRITICAL RULES - MUST FOLLOW EXACTLY**

### **🚫 ABSOLUTE PROHIBITIONS:**
```bash
# NEVER RUN THESE COMMANDS:
git commit -m "..."          # ❌ FORBIDDEN
git push origin ...          # ❌ FORBIDDEN  
git merge ...                # ❌ FORBIDDEN
git rebase ...               # ❌ FORBIDDEN
git checkout [other-branch]  # ❌ FORBIDDEN
git pull origin main         # ❌ FORBIDDEN
```

### **✅ ALLOWED GIT OPERATIONS:**
```bash
git status                   # ✅ Check file status
git add .                    # ✅ Stage your changes
git diff                     # ✅ View changes
git branch                   # ✅ Check current branch
git log --oneline -10        # ✅ View recent commits
```

### **📁 WORKSPACE BOUNDARIES:**
- ✅ **WORK ONLY** in: `backend/services/employee-service/`
- ❌ **NEVER TOUCH**: 
  - `backend/shared/` folder
  - `backend/config/` folder
  - `backend/app.js`
  - Other service folders
  - Package.json files
  - .env files

## 📚 **MANDATORY READING**
Before starting, read these documents:
1. `planning/Workflow/backend.md`
2. `planning/Backend_Agent_Tasks.md` (Agent 2 section)
3. `planning/API_Integration_Guide.md`
4. `planning/01_Database_Schema_Design.md` (employees, departments tables)

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

### **Required File Structure:**
```
backend/services/employee-service/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   ├── EmployeeController.js   # Employee CRUD operations
│   ├── DepartmentController.js # Department management
│   └── DocumentController.js   # Document handling
├── services/
│   ├── EmployeeService.js      # Employee business logic
│   ├── DepartmentService.js    # Department business logic
│   └── DocumentService.js     # Document processing
├── models/
│   ├── Employee.js             # Employee database model
│   ├── Department.js           # Department database model
│   └── Document.js             # Document database model
├── middleware/
│   └── validation.js           # Input validation
└── tests/
    ├── employee.test.js        # Unit tests
    └── integration/
        └── employee.integration.test.js
```

### **Key Implementation Requirements:**

#### **1. EmployeeController.js - Core Methods:**
```javascript
class EmployeeController {
  static async getAll(req, res)        // Get employees with filtering/pagination
  static async getById(req, res)       // Get employee by ID
  static async create(req, res)        // Create new employee
  static async update(req, res)        // Update employee
  static async deactivate(req, res)    // Deactivate employee
  static async getByUserId(req, res)   // Get employee by user ID
}
```

#### **2. EmployeeService.js - Business Logic:**
```javascript
class EmployeeService {
  static async getEmployees(filters)           // Get employees with filters
  static async getById(id)                     // Get employee by ID
  static async create(employeeData)            // Create employee
  static async update(id, data)                // Update employee
  static async deactivate(id)                  // Deactivate employee
  static async generateEmployeeCode()          // Generate unique employee code
  static async createUserAccount(employee)     // Create user account for employee
  static async validateEmployeeData(data)      // Validate employee data
}
```

#### **3. Employee.js - Database Model:**
```javascript
class Employee {
  static async findAll(filters)        // Find employees with filters
  static async findById(id)            // Find employee by ID
  static async findByUserId(userId)    // Find employee by user ID
  static async create(data)            // Create employee record
  static async update(id, data)        // Update employee record
  static async updateStatus(id, status) // Update employee status
}
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
