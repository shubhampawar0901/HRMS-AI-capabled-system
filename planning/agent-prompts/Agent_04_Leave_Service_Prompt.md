# 🏖️ AGENT 4 - LEAVE MANAGEMENT SERVICE DEVELOPMENT

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 4
- **Service**: Leave Management Service
- **Workspace Folder**: `backend/services/leave-service/`
- **Git Branch**: `feature/leave-service-implementation`
- **Development Phase**: Phase 1 (Foundation)
- **Priority**: HIGH (Critical Foundation Service)
- **Dependencies**: Agent 2 (Employee Service) must be completed first

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
- ✅ **WORK ONLY** in: `backend/services/leave-service/`
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
2. `planning/Backend_Agent_Tasks.md` (Agent 4 section)
3. `planning/API_Integration_Guide.md`
4. `planning/01_Database_Schema_Design.md` (leave tables)

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
GET  /api/leave/balance           # Get leave balance for current user
POST /api/leave/apply             # Apply for leave
GET  /api/leave/applications      # Get leave applications
PUT  /api/leave/applications/:id/approve # Approve/reject leave (Manager)
GET  /api/leave/approvals         # Get pending approvals (Manager)
GET  /api/leave/calendar          # Get leave calendar
GET  /api/leave/types             # Get leave types
POST /api/leave/types             # Create leave type (Admin)
```

### **Required File Structure:**
```
backend/services/leave-service/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   ├── LeaveController.js      # Leave operations
│   ├── ApprovalController.js   # Leave approvals
│   └── LeaveTypeController.js  # Leave type management
├── services/
│   ├── LeaveService.js         # Leave business logic
│   ├── BalanceService.js       # Leave balance calculations
│   └── ApprovalService.js      # Approval workflow
├── models/
│   ├── LeaveApplication.js     # Leave application model
│   ├── LeaveBalance.js         # Leave balance model
│   └── LeaveType.js            # Leave type model
├── middleware/
│   └── validation.js           # Input validation
└── tests/
    ├── leave.test.js           # Unit tests
    └── integration/
        └── leave.integration.test.js
```

### **Key Implementation Requirements:**

#### **1. LeaveController.js - Core Methods:**
```javascript
class LeaveController {
  static async getBalance(req, res)        // Get user's leave balance
  static async applyLeave(req, res)        // Submit leave application
  static async getApplications(req, res)   // Get user's applications
  static async getCalendar(req, res)       // Get leave calendar
  static async cancelApplication(req, res) // Cancel pending application
}
```

#### **2. ApprovalController.js - Approval Workflow:**
```javascript
class ApprovalController {
  static async getPendingApprovals(req, res) // Get pending approvals for manager
  static async approveLeave(req, res)        // Approve leave application
  static async rejectLeave(req, res)         // Reject leave application
  static async getApprovalHistory(req, res)  // Get approval history
}
```

#### **3. LeaveService.js - Business Logic:**
```javascript
class LeaveService {
  static async createApplication(data)           // Create leave application
  static async checkLeaveBalance(empId, typeId, days) // Check if sufficient balance
  static async checkOverlappingLeave(empId, start, end) // Check for overlaps
  static async calculateLeaveDays(startDate, endDate)  // Calculate working days
  static async deductLeaveBalance(empId, typeId, days) // Deduct from balance
  static async getLeaveCalendar(filters)        // Get leave calendar data
}
```

#### **4. BalanceService.js - Balance Management:**
```javascript
class BalanceService {
  static async getEmployeeBalance(employeeId)    // Get all leave balances
  static async allocateAnnualLeave(employeeId)   // Allocate yearly leave
  static async adjustBalance(empId, typeId, days) // Adjust leave balance
  static async calculateCarryForward(empId, year) // Calculate carry forward
  static async resetAnnualBalances()             // Reset balances yearly
}
```

#### **5. Leave Application Workflow:**
- Employee submits application
- Validate leave balance availability
- Check for overlapping applications
- Route to manager for approval
- Update balance upon approval
- Send notifications (future enhancement)

#### **6. Leave Balance Logic:**
- Annual leave: 30 days per year
- Sick leave: 12 days per year
- Personal leave: 5 days per year
- Carry forward rules (max 5 days)
- Pro-rata calculation for new joiners

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests (>90% coverage):**
```javascript
describe('LeaveController', () => {
  test('apply leave with sufficient balance')
  test('apply leave with insufficient balance')
  test('prevent overlapping leave applications')
  test('get leave balance correctly')
  test('leave calendar generation')
})

describe('LeaveService', () => {
  test('leave days calculation excluding weekends')
  test('leave balance validation')
  test('overlap detection logic')
  test('balance deduction after approval')
})

describe('ApprovalController', () => {
  test('manager can approve team leave')
  test('manager cannot approve other team leave')
  test('approval workflow completion')
})
```

### **Integration Tests:**
```javascript
describe('Leave API Integration', () => {
  test('complete leave application workflow')
  test('leave approval by manager')
  test('leave rejection workflow')
  test('balance management lifecycle')
})
```

## 🔒 **SECURITY REQUIREMENTS**
- Validate employee can only apply for their own leave
- Managers can only approve their team's leave
- Prevent manipulation of leave balances
- Secure approval workflow
- Audit trail for all leave actions
- Input validation for dates and reasons

## 📋 **DATABASE INTEGRATION**
Use these tables from the database schema:
```sql
-- leave_applications table
leave_applications (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP,
  comments TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- leave_balances table
leave_balances (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  allocated_days INTEGER NOT NULL,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER NOT NULL
)

-- leave_types table
leave_types (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  max_days_per_year INTEGER,
  carry_forward_allowed BOOLEAN DEFAULT false,
  max_carry_forward_days INTEGER DEFAULT 0
)
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 8 API endpoints implemented and working
- [ ] Leave application system functional
- [ ] Leave balance management working
- [ ] Approval workflow operational
- [ ] Leave calendar generation working
- [ ] Overlap detection functioning
- [ ] Balance validation accurate
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing
- [ ] Error handling comprehensive

## 📋 **COMPLETION PROTOCOL**

### **When You Complete Your Work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** with this format:

```markdown
🤖 **AGENT 4 COMPLETION REPORT**

✅ **Status**: COMPLETED
📁 **Workspace**: backend/services/leave-service/
🌿 **Branch**: feature/leave-service-implementation
📝 **Files Modified**: 
[Paste output of 'git status']

🧪 **Tests**: 
- Unit Tests: [PASS/FAIL] - [X]% coverage
- Integration Tests: [PASS/FAIL]
- Workflow Tests: [PASS/FAIL]

📚 **API Endpoints Implemented**:
- GET /api/leave/balance: [✅/❌]
- POST /api/leave/apply: [✅/❌]
- GET /api/leave/applications: [✅/❌]
- PUT /api/leave/applications/:id/approve: [✅/❌]
- GET /api/leave/approvals: [✅/❌]
- GET /api/leave/calendar: [✅/❌]
- GET /api/leave/types: [✅/❌]
- POST /api/leave/types: [✅/❌]

🔒 **Features Implemented**:
- Leave application workflow: [✅/❌]
- Leave balance management: [✅/❌]
- Approval system: [✅/❌]
- Overlap detection: [✅/❌]
- Leave calendar: [✅/❌]

🔗 **Integration Notes**:
- Ready for frontend leave module integration
- Leave data available for reporting
- Approval workflow ready for manager interface

⚠️ **Issues Encountered**: [None/List any issues]

🚀 **Ready for User Commit**: [YES/NO]
```

## 🆘 **EMERGENCY PROTOCOL**
**STOP IMMEDIATELY and report if you encounter:**
- Complex leave policy requirements
- Date calculation edge cases
- Approval workflow complications
- Integration with Employee Service issues
- Business rule clarifications needed

**Report Format**: "🚨 URGENT: Agent 4 needs assistance - [brief issue description]"

## 🚀 **START COMMAND**
Begin by reading the mandatory documentation, then create the service structure and implement the leave management system. Remember: **WORK ONLY in backend/services/leave-service/** and **NEVER commit code**.

This completes Phase 1 foundation services! 🎯
