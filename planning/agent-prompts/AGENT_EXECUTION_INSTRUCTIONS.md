# 🚀 AGENT EXECUTION INSTRUCTIONS

## 🎯 **FOR ALL BACKEND AGENTS (1-8)**

This document contains step-by-step instructions for each backend agent to pull changes and start executing their tasks.

---

## 🚨 **CRITICAL: ARCHITECTURE HAS CHANGED**

**BEFORE STARTING**: The backend architecture has been completely restructured. You MUST follow these new instructions.

### **⚠️ KEY CHANGES:**
- ✅ **Use develop branch** (not feature branches)
- ✅ **Plain SQL** (no Sequelize)
- ✅ **Global folder structure** (no shared folder)
- ✅ **Update existing files** (don't create new ones for some agents)

---

## 📋 **STEP-BY-STEP EXECUTION GUIDE**

### **🔄 STEP 1: PULL LATEST CHANGES (ALL AGENTS)**

```bash
# Switch to develop branch and pull latest changes
git checkout develop
git pull origin develop

# Verify the new structure
ls backend/  # You should see: models/, controllers/, routes/, middleware/, utils/, services/
```

### **📚 STEP 2: READ DOCUMENTATION (ALL AGENTS)**

**Read these documents in order:**

1. **`planning/agent-prompts/BACKEND_AGENTS_ARCHITECTURE_UPDATE.md`** (CRITICAL - Read first)
2. **`backend/ARCHITECTURE.md`** (Technical architecture details)
3. **Your specific agent prompt** (see table below)
4. **`planning/Workflow/backend.md`** (Backend workflow)

### **🎯 STEP 3: IDENTIFY YOUR FILES (AGENT-SPECIFIC)**

| Agent | Controller | Routes | Service | Status |
|-------|------------|--------|---------|---------|
| **Agent 1** | `AuthController.js` | `authRoutes.js` | `AuthService.js` | UPDATE existing |
| **Agent 2** | `EmployeeController.js` | `employeeRoutes.js` | `EmployeeService.js` | UPDATE existing |
| **Agent 3** | `AttendanceController.js` | `attendanceRoutes.js` | `AttendanceService.js` | CREATE new |
| **Agent 4** | `LeaveController.js` | `leaveRoutes.js` | `LeaveService.js` | CREATE new |
| **Agent 5** | `PayrollController.js` | `payrollRoutes.js` | `PayrollService.js` | CREATE new |
| **Agent 6** | `PerformanceController.js` | `performanceRoutes.js` | `PerformanceService.js` | CREATE new |
| **Agent 7** | `AIController.js` | `aiRoutes.js` | `AIService.js` | UPDATE existing |
| **Agent 8** | `ReportsController.js` | `reportsRoutes.js` | `ReportsService.js` | CREATE new |

### **🔍 STEP 4: CHECK EXISTING FILES**

```bash
# Check what files already exist
ls backend/controllers/
ls backend/routes/
ls backend/services/
ls backend/models/

# Check your specific files
ls backend/controllers/[YourController].js
ls backend/routes/[yourRoutes].js
ls backend/services/[YourService].js
```

### **📖 STEP 5: READ YOUR SPECIFIC PROMPT**

| Agent | Prompt File |
|-------|-------------|
| **Agent 1** | `planning/agent-prompts/Agent_01_Auth_Service_Prompt.md` |
| **Agent 2** | `planning/agent-prompts/Agent_02_Employee_Service_Prompt.md` |
| **Agent 3** | `planning/agent-prompts/Agent_03_Attendance_Service_Prompt.md` |
| **Agent 4** | `planning/agent-prompts/Agent_04_Leave_Service_Prompt.md` |
| **Agent 5** | `planning/agent-prompts/Agent_05_Payroll_Service_Prompt.md` |
| **Agent 6** | `planning/agent-prompts/Agent_06_Performance_Service_Prompt.md` |
| **Agent 7** | `planning/agent-prompts/Agent_07_AI_Service_Prompt.md` |
| **Agent 8** | `planning/agent-prompts/Agent_08_Reports_Service_Prompt.md` |

---

## 🏗️ **IMPLEMENTATION GUIDELINES**

### **✅ CORRECT IMPORT PATTERNS (ALL AGENTS)**

```javascript
// Import models (READ-ONLY)
const { User, Employee, Department, Attendance } = require('../models');

// Import utilities (READ-ONLY)
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');

// Import middleware (READ-ONLY)
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Import your service
const YourService = require('../services/YourService');
```

### **✅ PLAIN SQL USAGE (ALL AGENTS)**

```javascript
// ❌ DON'T USE: Sequelize syntax
// const user = await User.findOne({ where: { email } });

// ✅ USE: Plain SQL methods (already implemented)
const user = await User.findByEmail(email);
const users = await User.findAll(options);
const newUser = await User.create(userData);
```

### **✅ CONTROLLER PATTERN (ALL AGENTS)**

```javascript
const { YourModel } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const YourService = require('../services/YourService');

class YourController {
  static async methodName(req, res) {
    try {
      // Your logic here
      const result = await YourService.someMethod(req.body);
      return sendSuccess(res, result, 'Success message');
    } catch (error) {
      console.error('Error:', error);
      return sendError(res, error.message, 500);
    }
  }
}

module.exports = YourController;
```

### **✅ ROUTES PATTERN (ALL AGENTS)**

```javascript
const express = require('express');
const router = express.Router();
const YourController = require('../controllers/YourController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Public routes
router.post('/public-endpoint', YourController.publicMethod);

// Protected routes
router.get('/', authenticateToken, YourController.getAll);
router.post('/', authenticateToken, authorizeRoles(['admin']), YourController.create);

module.exports = router;
```

### **✅ SERVICE PATTERN (ALL AGENTS)**

```javascript
const { YourModel, OtherModel } = require('../models');

class YourService {
  static async someMethod(data) {
    try {
      // Business logic here
      const result = await YourModel.create(data);
      return result;
    } catch (error) {
      console.error('Service error:', error);
      throw new Error('Failed to perform operation');
    }
  }
}

module.exports = YourService;
```

---

## 🎯 **EXECUTION PHASES**

### **Phase 1 (Foundation) - Start First:**
- **Agent 1** (Auth Service) - Authentication foundation
- **Agent 2** (Employee Service) - Employee data foundation

### **Phase 2 (Core Services) - Start After Phase 1:**
- **Agent 3** (Attendance Service)
- **Agent 4** (Leave Service)
- **Agent 5** (Payroll Service)
- **Agent 6** (Performance Service)

### **Phase 3 (Advanced Features) - Start After Phase 2:**
- **Agent 7** (AI Service) - Requires all core data
- **Agent 8** (Reports Service) - Requires all services

---

## 🚨 **CRITICAL REMINDERS**

### **❌ NEVER DO:**
- Don't commit code (`git commit`)
- Don't push code (`git push`)
- Don't modify models in `backend/models/`
- Don't modify middleware in `backend/middleware/`
- Don't modify `backend/app.js`
- Don't use Sequelize syntax

### **✅ ALWAYS DO:**
- Use `git add .` to stage changes
- Use Plain SQL methods from models
- Import from global folders (`../models/`, `../utils/`, etc.)
- Follow the controller/routes/service pattern
- Handle errors properly
- Use existing middleware and utilities

---

## 🆘 **EMERGENCY PROTOCOL**

**STOP IMMEDIATELY and report if you encounter:**
- Missing files that should exist
- Import path errors
- Sequelize references in existing code
- Architecture inconsistencies
- Database connection issues

**Report Format**: "🚨 URGENT: Agent [X] needs assistance - [brief issue description]"

---

## 🎉 **SUCCESS CRITERIA**

### **When you complete your work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** using the format in your specific prompt

### **Your work is complete when:**
- ✅ All your endpoints are implemented and working
- ✅ All business logic is functional
- ✅ Error handling is comprehensive
- ✅ Code follows the new architecture patterns
- ✅ Integration with existing models works
- ✅ No import or syntax errors

---

## 🚀 **START YOUR EXECUTION**

1. **Pull latest changes** (Step 1)
2. **Read documentation** (Step 2)
3. **Identify your files** (Step 3)
4. **Check existing files** (Step 4)
5. **Read your specific prompt** (Step 5)
6. **Begin implementation** following the patterns above

**Good luck! The new architecture enables efficient parallel development!** 🎯
