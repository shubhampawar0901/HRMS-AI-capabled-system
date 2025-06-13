# ⏰ AGENT 3 - ATTENDANCE SERVICE DEVELOPMENT

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 3
- **Service**: Attendance Service
- **Workspace Folder**: `backend/services/attendance-service/`
- **Git Branch**: `feature/attendance-service-implementation`
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
- ✅ **WORK ONLY** in: `backend/services/attendance-service/`
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
2. `planning/Backend_Agent_Tasks.md` (Agent 3 section)
3. `planning/API_Integration_Guide.md`
4. `planning/01_Database_Schema_Design.md` (attendance_records table)

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
GET  /api/attendance/my-attendance    # Get current user's attendance
POST /api/attendance/check-in         # Record check-in time
POST /api/attendance/check-out        # Record check-out time
GET  /api/attendance/team             # Get team attendance (Manager only)
GET  /api/attendance/summary          # Get attendance summary
PUT  /api/attendance/:id/correct      # Correct attendance record (Admin)
GET  /api/attendance/reports          # Generate attendance reports
```

### **Required File Structure:**
```
backend/services/attendance-service/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   ├── AttendanceController.js # Attendance operations
│   └── ReportsController.js    # Attendance reports
├── services/
│   ├── AttendanceService.js    # Attendance business logic
│   ├── TimeCalculationService.js # Time calculations
│   └── ReportsService.js       # Report generation
├── models/
│   └── AttendanceRecord.js     # Attendance database model
├── middleware/
│   └── validation.js           # Input validation
└── tests/
    ├── attendance.test.js      # Unit tests
    └── integration/
        └── attendance.integration.test.js
```

### **Key Implementation Requirements:**

#### **1. AttendanceController.js - Core Methods:**
```javascript
class AttendanceController {
  static async getMyAttendance(req, res)    // Get user's attendance records
  static async checkIn(req, res)            // Handle check-in
  static async checkOut(req, res)           // Handle check-out
  static async getTeamAttendance(req, res)  // Get team attendance (managers)
  static async getSummary(req, res)         // Get attendance summary
  static async correctRecord(req, res)      // Correct attendance record
}
```

#### **2. AttendanceService.js - Business Logic:**
```javascript
class AttendanceService {
  static async checkIn(employeeId, data)           // Process check-in
  static async checkOut(employeeId, data)          // Process check-out
  static async getTodayRecord(employeeId)          // Get today's record
  static async getAttendanceRecords(filters)       // Get attendance records
  static async calculateWorkingHours(checkIn, checkOut) // Calculate hours
  static async getMonthlyAttendance(employeeId, month, year) // Monthly data
  static async validateCheckIn(employeeId)         // Validate check-in eligibility
  static async validateCheckOut(employeeId)        // Validate check-out eligibility
}
```

#### **3. AttendanceRecord.js - Database Model:**
```javascript
class AttendanceRecord {
  static async create(data)                    // Create attendance record
  static async findByEmployeeAndDate(empId, date) // Find by employee and date
  static async updateCheckOut(id, checkOutTime)   // Update check-out time
  static async findByDateRange(empId, start, end) // Find records in date range
  static async getTeamAttendance(managerIds, date) // Get team attendance
  static async updateRecord(id, data)         // Update attendance record
}
```

#### **4. Time Calculation Features:**
```javascript
class TimeCalculationService {
  static calculateWorkingHours(checkIn, checkOut)  // Calculate total hours
  static calculateOvertime(totalHours)             // Calculate overtime
  static calculateLateArrival(checkIn, shiftStart) // Calculate late minutes
  static calculateEarlyDeparture(checkOut, shiftEnd) // Calculate early departure
  static isWeekend(date)                           // Check if weekend
  static isHoliday(date)                          // Check if holiday
}
```

#### **5. Check-in/Check-out Logic:**
- Prevent duplicate check-ins for the same day
- Validate check-out only after check-in
- Calculate total working hours automatically
- Support location tracking (optional)
- Handle timezone considerations

#### **6. Attendance Status Calculation:**
- Present: Check-in recorded
- Absent: No check-in for working day
- Late: Check-in after designated time
- Half-day: Less than 4 hours worked
- Overtime: More than 8 hours worked

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests (>90% coverage):**
```javascript
describe('AttendanceController', () => {
  test('check-in with valid data')
  test('prevent duplicate check-in')
  test('check-out after check-in')
  test('prevent check-out without check-in')
  test('get attendance records with filters')
  test('team attendance for managers')
})

describe('AttendanceService', () => {
  test('working hours calculation')
  test('overtime calculation')
  test('late arrival detection')
  test('attendance status determination')
})

describe('TimeCalculationService', () => {
  test('accurate time calculations')
  test('timezone handling')
  test('weekend and holiday detection')
})
```

### **Integration Tests:**
```javascript
describe('Attendance API Integration', () => {
  test('complete check-in/check-out flow')
  test('monthly attendance summary')
  test('team attendance management')
  test('attendance correction workflow')
})
```

## 🔒 **SECURITY REQUIREMENTS**
- Validate employee identity for check-in/out
- Prevent attendance manipulation
- Secure location data if used
- Role-based access for team attendance
- Audit trail for attendance corrections
- Rate limiting for check-in attempts

## 📋 **DATABASE INTEGRATION**
Use the `attendance_records` table from the database schema:
```sql
attendance_records (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  total_hours DECIMAL(4,2),
  status VARCHAR(20),
  location_check_in JSONB,
  location_check_out JSONB,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 7 API endpoints implemented and working
- [ ] Check-in/check-out system functional
- [ ] Time calculation logic accurate
- [ ] Attendance status determination working
- [ ] Team attendance views for managers
- [ ] Attendance correction system operational
- [ ] Duplicate prevention mechanisms working
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing
- [ ] Error handling comprehensive

## 📋 **COMPLETION PROTOCOL**

### **When You Complete Your Work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** with this format:

```markdown
🤖 **AGENT 3 COMPLETION REPORT**

✅ **Status**: COMPLETED
📁 **Workspace**: backend/services/attendance-service/
🌿 **Branch**: feature/attendance-service-implementation
📝 **Files Modified**: 
[Paste output of 'git status']

🧪 **Tests**: 
- Unit Tests: [PASS/FAIL] - [X]% coverage
- Integration Tests: [PASS/FAIL]
- Time Calculation Tests: [PASS/FAIL]

📚 **API Endpoints Implemented**:
- GET /api/attendance/my-attendance: [✅/❌]
- POST /api/attendance/check-in: [✅/❌]
- POST /api/attendance/check-out: [✅/❌]
- GET /api/attendance/team: [✅/❌]
- GET /api/attendance/summary: [✅/❌]
- PUT /api/attendance/:id/correct: [✅/❌]
- GET /api/attendance/reports: [✅/❌]

🔒 **Features Implemented**:
- Check-in/check-out system: [✅/❌]
- Time calculations: [✅/❌]
- Duplicate prevention: [✅/❌]
- Team attendance views: [✅/❌]
- Attendance corrections: [✅/❌]

🔗 **Integration Notes**:
- Ready for Payroll Service integration
- Attendance data available for AI anomaly detection
- Monthly summaries ready for reporting

⚠️ **Issues Encountered**: [None/List any issues]

🚀 **Ready for User Commit**: [YES/NO]
```

## 🆘 **EMERGENCY PROTOCOL**
**STOP IMMEDIATELY and report if you encounter:**
- Time zone calculation issues
- Database constraint problems
- Location tracking implementation questions
- Integration with Employee Service problems
- Complex business logic requirements

**Report Format**: "🚨 URGENT: Agent 3 needs assistance - [brief issue description]"

## 🚀 **START COMMAND**
Begin by reading the mandatory documentation, then create the service structure and implement the attendance tracking system. Remember: **WORK ONLY in backend/services/attendance-service/** and **NEVER commit code**.

This service provides critical data for Payroll and AI services! 🎯
