# 🚀 SIMPLE AGENT STARTER PROMPT

## 📋 **COPY-PASTE PROMPTS FOR EACH AGENT**

Use these exact prompts to start each agent. Just copy and paste the relevant one.

---

## 🔐 **AGENT 1 - AUTH SERVICE**

```
You are Agent 1 responsible for the Authentication Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_01_Auth_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/AuthController.js` (UPDATE existing)
   - `backend/routes/authRoutes.js` (UPDATE existing)
   - `backend/services/AuthService.js` (UPDATE existing)

Start by reading the documentation, then begin implementation.
```

---

## 👥 **AGENT 2 - EMPLOYEE SERVICE**

```
You are Agent 2 responsible for the Employee Management Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_02_Employee_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/EmployeeController.js` (UPDATE existing)
   - `backend/routes/employeeRoutes.js` (UPDATE existing)
   - `backend/services/EmployeeService.js` (UPDATE existing)

Start by reading the documentation, then begin implementation.
```

---

## ⏰ **AGENT 3 - ATTENDANCE SERVICE**

```
You are Agent 3 responsible for the Attendance Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_03_Attendance_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/AttendanceController.js` (CREATE new)
   - `backend/routes/attendanceRoutes.js` (UPDATE existing placeholder)
   - `backend/services/AttendanceService.js` (CREATE new)

Start by reading the documentation, then begin implementation.
```

---

## 🏖️ **AGENT 4 - LEAVE SERVICE**

```
You are Agent 4 responsible for the Leave Management Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_04_Leave_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/LeaveController.js` (CREATE new)
   - `backend/routes/leaveRoutes.js` (UPDATE existing placeholder)
   - `backend/services/LeaveService.js` (CREATE new)

Start by reading the documentation, then begin implementation.
```

---

## 💰 **AGENT 5 - PAYROLL SERVICE**

```
You are Agent 5 responsible for the Payroll Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_05_Payroll_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/PayrollController.js` (CREATE new)
   - `backend/routes/payrollRoutes.js` (UPDATE existing placeholder)
   - `backend/services/PayrollService.js` (CREATE new)

Start by reading the documentation, then begin implementation.
```

---

## 📊 **AGENT 6 - PERFORMANCE SERVICE**

```
You are Agent 6 responsible for the Performance Management Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_06_Performance_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/PerformanceController.js` (CREATE new)
   - `backend/routes/performanceRoutes.js` (UPDATE existing placeholder)
   - `backend/services/PerformanceService.js` (CREATE new)

Start by reading the documentation, then begin implementation.
```

---

## 🤖 **AGENT 7 - AI SERVICE**

```
You are Agent 7 responsible for the AI Features Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_07_AI_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/AIController.js` (UPDATE existing)
   - `backend/routes/aiRoutes.js` (UPDATE existing)
   - `backend/services/AIService.js` (UPDATE existing)

Start by reading the documentation, then begin implementation.
```

---

## 📈 **AGENT 8 - REPORTS SERVICE**

```
You are Agent 8 responsible for the Reports & Analytics Service in the HRMS project.

CRITICAL: Follow these steps exactly:

1. Read the execution instructions:
   Read `planning/agent-prompts/AGENT_EXECUTION_INSTRUCTIONS.md` completely.

2. Pull latest changes:
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. Read your specific prompt:
   Read `planning/agent-prompts/Agent_08_Reports_Service_Prompt.md` for detailed instructions.

4. Your files to work on:
   - `backend/controllers/ReportsController.js` (CREATE new)
   - `backend/routes/reportsRoutes.js` (UPDATE existing placeholder)
   - `backend/services/ReportsService.js` (CREATE new)

Start by reading the documentation, then begin implementation.
```

---

## 🎯 **EXECUTION ORDER**

### **Phase 1 (Start First):**
- Agent 1 (Auth Service)
- Agent 2 (Employee Service)

### **Phase 2 (Start After Phase 1):**
- Agent 3 (Attendance Service)
- Agent 4 (Leave Service)
- Agent 5 (Payroll Service)
- Agent 6 (Performance Service)

### **Phase 3 (Start After Phase 2):**
- Agent 7 (AI Service)
- Agent 8 (Reports Service)

---

## 📚 **QUICK REFERENCE**

**All agents should:**
1. ✅ Read `AGENT_EXECUTION_INSTRUCTIONS.md` first
2. ✅ Pull develop branch changes
3. ✅ Read their specific prompt
4. ✅ Use Plain SQL (no Sequelize)
5. ✅ Follow global architecture patterns
6. ✅ Never commit code

**Ready to start parallel development!** 🚀
