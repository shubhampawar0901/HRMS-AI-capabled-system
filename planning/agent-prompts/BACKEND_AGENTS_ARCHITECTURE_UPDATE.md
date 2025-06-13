# 🚨 CRITICAL: BACKEND AGENTS ARCHITECTURE UPDATE

## 🔄 **MANDATORY FOR ALL BACKEND AGENTS (1-8)**

### **⚠️ ARCHITECTURE HAS COMPLETELY CHANGED**

The backend architecture has been **completely restructured**. All backend agents **MUST** follow these new instructions:

## 🚨 **STEP 1: USE DEVELOP BRANCH**

### **🔄 MANDATORY FIRST STEPS FOR EVERY AGENT:**
```bash
# 1. Switch to develop branch and get latest code
git checkout develop
git pull origin develop

# 2. Check the new architecture (NO SEQUELIZE, NO SHARED FOLDER)
ls backend/  # You should see: models/, controllers/, routes/, middleware/, utils/, services/
```

## 🏗️ **STEP 2: NEW ARCHITECTURE (CRITICAL CHANGES)**

### **❌ OLD ARCHITECTURE (SCRAPPED):**
```
backend/services/[service-name]/
├── controllers/
├── routes/
├── models/
├── middleware/
└── services/
```

### **✅ NEW ARCHITECTURE (CORRECTED):**
```
backend/
├── models/                     # 🔥 GLOBAL MODELS (Plain SQL) - READ ONLY
├── controllers/               # 🔥 GLOBAL CONTROLLERS  
├── routes/                    # 🔥 GLOBAL ROUTES
├── middleware/                # 🔥 GLOBAL MIDDLEWARE - READ ONLY
├── utils/                     # 🔥 GLOBAL UTILITIES - READ ONLY
└── services/                  # 🔥 BUSINESS LOGIC ONLY
```

## 🎯 **STEP 3: AGENT RESPONSIBILITIES (UPDATED)**

### **✅ WHAT EACH AGENT WORKS ON:**

| Agent | Controller | Routes | Service | Description |
|-------|------------|--------|---------|-------------|
| **Agent 1** | `AuthController.js` | `authRoutes.js` | `AuthService.js` | Authentication & Authorization |
| **Agent 2** | `EmployeeController.js` | `employeeRoutes.js` | `EmployeeService.js` | Employee Management |
| **Agent 3** | `AttendanceController.js` | `attendanceRoutes.js` | `AttendanceService.js` | Attendance Tracking |
| **Agent 4** | `LeaveController.js` | `leaveRoutes.js` | `LeaveService.js` | Leave Management |
| **Agent 5** | `PayrollController.js` | `payrollRoutes.js` | `PayrollService.js` | Payroll Processing |
| **Agent 6** | `PerformanceController.js` | `performanceRoutes.js` | `PerformanceService.js` | Performance Management |
| **Agent 7** | `AIController.js` | `aiRoutes.js` | `AIService.js` | AI Features |
| **Agent 8** | `ReportsController.js` | `reportsRoutes.js` | `ReportsService.js` | Reports & Analytics |

### **❌ WHAT AGENTS CANNOT TOUCH:**
- **Models** - Already created, read-only for agents
- **Middleware** - Already created, read-only for agents
- **Utils** - Already created, read-only for agents
- **Other agents' controllers/routes/services**
- **App.js** - Managed centrally
- **Database configuration** - Managed centrally

## 🔥 **STEP 4: CRITICAL TECHNOLOGY CHANGES**

### **❌ NO MORE SEQUELIZE:**
```javascript
// ❌ DON'T USE: Sequelize syntax
const user = await User.findOne({ where: { email } });
const users = await User.findAll({ include: [...] });
```

### **✅ USE PLAIN SQL:**
```javascript
// ✅ USE: Plain SQL methods (already implemented)
const user = await User.findByEmail(email);
const users = await User.findAll(options);
const newUser = await User.create(userData);
```

### **✅ CORRECT IMPORTS:**
```javascript
// Import models
const { User, Employee, Department } = require('../models');

// Import utilities
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');

// Import middleware
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Import your service
const YourService = require('../services/YourService');
```

## 📋 **STEP 5: FILES ALREADY EXIST - UPDATE THEM**

### **🚨 CRITICAL: DO NOT CREATE NEW FILES**

Most files already exist with basic structure. **UPDATE EXISTING FILES**:

- ✅ **Agent 1**: Update `AuthController.js`, `authRoutes.js`, `AuthService.js`
- ✅ **Agent 2**: Update `EmployeeController.js`, `employeeRoutes.js`, `EmployeeService.js`
- ✅ **Agent 7**: Update `AIController.js`, `aiRoutes.js`, `AIService.js`
- ✅ **Other Agents**: Update your respective controller, routes, and service files

### **🔍 CHECK EXISTING FILES:**
```bash
# Check what files already exist
ls backend/controllers/
ls backend/routes/
ls backend/services/
ls backend/models/
```

## 🎯 **STEP 6: DATABASE CHANGES**

### **❌ NO MORE UUIDs:**
```sql
-- ❌ OLD: UUID primary keys
id UUID PRIMARY KEY
```

### **✅ USE INTEGER IDs:**
```sql
-- ✅ NEW: Integer auto-increment primary keys
id INT AUTO_INCREMENT PRIMARY KEY
```

### **✅ PLAIN SQL MODELS:**
All models are already created with Plain SQL. Use them as-is:
- `User.js` - User authentication
- `Employee.js` - Employee management
- `Department.js` - Department management
- `Attendance.js` - Attendance tracking
- `LeaveApplication.js` - Leave management
- `Payroll.js` - Payroll processing
- `PerformanceReview.js` - Performance reviews
- `AI*.js` - All AI feature models

## 🚀 **STEP 7: IMPLEMENTATION PATTERN**

### **✅ STANDARD PATTERN FOR ALL AGENTS:**

1. **Read existing files** - Don't create new ones
2. **Update controller methods** - Complete the existing methods
3. **Update route definitions** - Complete the existing routes
4. **Update service logic** - Complete the existing business logic
5. **Use existing models** - Import and use, don't modify
6. **Use existing middleware** - Import and use, don't modify
7. **Use existing utilities** - Import and use, don't modify

## 📚 **STEP 8: UPDATED DOCUMENTATION**

### **✅ READ THESE FIRST:**
1. `backend/ARCHITECTURE.md` - NEW architecture explanation
2. `planning/Workflow/backend.md` - Backend workflow
3. `backend/database/schema.sql` - Database structure
4. Your specific agent prompt (updated)

## 🎯 **STEP 9: SUCCESS CRITERIA**

### **✅ FOR ALL AGENTS:**
- [ ] Uses develop branch code
- [ ] Updates existing files (doesn't create new ones)
- [ ] Uses Plain SQL models correctly
- [ ] Uses global middleware and utils
- [ ] Follows new import patterns
- [ ] Implements all required endpoints
- [ ] Handles errors properly
- [ ] Follows new architecture standards

## 🚨 **EMERGENCY PROTOCOL**

**STOP IMMEDIATELY and report if you encounter:**
- Missing files that should exist
- Import path errors
- Sequelize references in existing code
- Architecture inconsistencies
- Database connection issues

**Report Format**: "🚨 URGENT: Agent [X] needs assistance - [brief issue description]"

---

## 🎉 **RESULT: CLEAN, MAINTAINABLE ARCHITECTURE**

This new architecture enables:
- ✅ **No conflicts** between agents
- ✅ **Consistent patterns** across all services
- ✅ **Easy testing** and maintenance
- ✅ **Scalable development** with multiple agents
- ✅ **Production-ready code** structure

**All backend agents can now work in parallel without any blocking issues!** 🚀
