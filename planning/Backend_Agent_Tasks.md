# 🔧 Backend Agent Tasks - Detailed Implementation Guide

## 🎯 **Agent 1: Authentication Service**

### **Workspace**: `backend/services/auth-service/`

### **Responsibilities**:
- User authentication and authorization
- JWT token management
- Password reset functionality
- Role-based access control

### **API Endpoints to Implement**:
```javascript
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/profile
PUT  /api/auth/profile
```

### **Database Tables**:
- `users` (primary)
- `password_resets` (for reset tokens)

### **Key Implementation Details**:

#### **1. Login Controller**:
```javascript
// controllers/AuthController.js
static async login(req, res) {
  try {
    const { email, password } = req.body;
    
    // Validate user credentials
    const user = await AuthService.validateCredentials(email, password);
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    // Generate tokens
    const tokens = await AuthService.generateTokens(user);
    
    // Get employee details
    const employeeDetails = await AuthService.getEmployeeDetails(user.id);
    
    return successResponse(res, {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: employeeDetails
      }
    }, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

#### **2. JWT Service**:
```javascript
// services/AuthService.js
class AuthService {
  static async generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken);
    
    return { accessToken, refreshToken };
  }
  
  static async validateCredentials(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    return isValid ? user : null;
  }
}
```

### **Testing Requirements**:
- Unit tests for all controllers
- Integration tests for login flow
- JWT token validation tests
- Password reset flow tests

### **Completion Checklist**:
- [ ] All authentication endpoints implemented
- [ ] JWT middleware created
- [ ] Password hashing implemented
- [ ] Role-based access control
- [ ] Refresh token mechanism
- [ ] Password reset functionality
- [ ] Input validation and sanitization
- [ ] Error handling for all scenarios
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests for auth flow
- [ ] Service documentation complete

---

## 🎯 **Agent 2: Employee Management Service**

### **Workspace**: `backend/services/employee-service/`

### **Responsibilities**:
- Employee CRUD operations
- Employee profile management
- Department management
- Document upload handling

### **API Endpoints to Implement**:
```javascript
GET    /api/employees
GET    /api/employees/:id
POST   /api/employees
PUT    /api/employees/:id
DELETE /api/employees/:id
POST   /api/employees/:id/documents
GET    /api/employees/:id/documents
GET    /api/departments
POST   /api/departments
```

### **Database Tables**:
- `employees` (primary)
- `departments`
- `employee_documents`

### **Key Implementation Details**:

#### **1. Employee Controller**:
```javascript
// controllers/EmployeeController.js
static async create(req, res) {
  try {
    const employeeData = req.body;
    
    // Validate required fields
    const validation = await EmployeeService.validateEmployeeData(employeeData);
    if (!validation.isValid) {
      return errorResponse(res, validation.errors, 400);
    }
    
    // Generate employee code
    const employeeCode = await EmployeeService.generateEmployeeCode();
    
    // Create employee
    const employee = await EmployeeService.create({
      ...employeeData,
      employeeCode,
      status: 'active'
    });
    
    // Create user account
    await EmployeeService.createUserAccount(employee);
    
    return successResponse(res, employee, 'Employee created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

#### **2. Document Upload Handler**:
```javascript
// controllers/DocumentController.js
static async uploadDocument(req, res) {
  try {
    const { id: employeeId } = req.params;
    const file = req.file;
    
    if (!file) {
      return errorResponse(res, 'No file uploaded', 400);
    }
    
    // Process document based on type
    let parsedData = null;
    if (file.mimetype === 'application/pdf' && req.body.documentType === 'resume') {
      // Call AI service for resume parsing
      parsedData = await AIService.parseResume(file.buffer);
    }
    
    // Save document metadata
    const document = await DocumentService.saveDocument({
      employeeId,
      fileName: file.originalname,
      fileType: file.mimetype,
      documentType: req.body.documentType,
      parsedData
    });
    
    return successResponse(res, {
      documentId: document.id,
      fileName: document.fileName,
      parsedData
    }, 'Document uploaded successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

### **Testing Requirements**:
- CRUD operation tests
- File upload tests
- Data validation tests
- Role-based access tests

### **Completion Checklist**:
- [ ] All employee endpoints implemented
- [ ] Department management
- [ ] Document upload functionality
- [ ] Employee code generation
- [ ] Data validation and sanitization
- [ ] Role-based access control
- [ ] Search and filtering
- [ ] Pagination implementation
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Service documentation complete

---

## 🎯 **Agent 3: Attendance Service**

### **Workspace**: `backend/services/attendance-service/`

### **Responsibilities**:
- Check-in/check-out functionality
- Attendance tracking and reporting
- Team attendance management
- Attendance analytics

### **API Endpoints to Implement**:
```javascript
GET  /api/attendance/my-attendance
POST /api/attendance/check-in
POST /api/attendance/check-out
GET  /api/attendance/team
GET  /api/attendance/summary
PUT  /api/attendance/:id/correct
```

### **Database Tables**:
- `attendance_records` (primary)

### **Key Implementation Details**:

#### **1. Check-in Controller**:
```javascript
// controllers/AttendanceController.js
static async checkIn(req, res) {
  try {
    const { userId } = req.user;
    const { timestamp, location } = req.body;
    
    // Check if already checked in today
    const existingRecord = await AttendanceService.getTodayRecord(userId);
    if (existingRecord && existingRecord.check_in_time) {
      return errorResponse(res, 'Already checked in today', 400);
    }
    
    // Create attendance record
    const record = await AttendanceService.checkIn({
      employeeId: userId,
      checkInTime: timestamp,
      location,
      date: new Date().toISOString().split('T')[0]
    });
    
    return successResponse(res, {
      checkInTime: record.check_in_time,
      message: 'Checked in successfully'
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

#### **2. Attendance Analytics**:
```javascript
// services/AttendanceService.js
static async getAttendanceSummary(employeeId, startDate, endDate) {
  const records = await AttendanceModel.getRecordsByDateRange(
    employeeId, startDate, endDate
  );
  
  const summary = {
    totalDays: records.length,
    presentDays: records.filter(r => r.status === 'present').length,
    absentDays: records.filter(r => r.status === 'absent').length,
    lateDays: records.filter(r => r.check_in_time > '09:30:00').length,
    averageHours: records.reduce((sum, r) => sum + (r.total_hours || 0), 0) / records.length
  };
  
  return { records, summary };
}
```

### **Testing Requirements**:
- Check-in/out flow tests
- Duplicate check-in prevention
- Time calculation tests
- Team attendance tests

### **Completion Checklist**:
- [ ] Check-in/check-out endpoints
- [ ] Attendance record management
- [ ] Time calculation logic
- [ ] Team attendance views
- [ ] Attendance corrections
- [ ] Summary and analytics
- [ ] Location validation
- [ ] Duplicate prevention
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Service documentation complete

---

## 🎯 **Agent 4: Leave Management Service**

### **Workspace**: `backend/services/leave-service/`

### **Responsibilities**:
- Leave application management
- Leave balance tracking
- Approval workflow
- Leave calendar management

### **API Endpoints to Implement**:
```javascript
GET  /api/leave/balance
POST /api/leave/apply
GET  /api/leave/applications
PUT  /api/leave/applications/:id/approve
GET  /api/leave/approvals
GET  /api/leave/calendar
GET  /api/leave/types
```

### **Database Tables**:
- `leave_applications` (primary)
- `leave_balances`
- `leave_types`

### **Key Implementation Details**:

#### **1. Leave Application Controller**:
```javascript
// controllers/LeaveController.js
static async applyLeave(req, res) {
  try {
    const { userId } = req.user;
    const { leaveTypeId, startDate, endDate, reason } = req.body;
    
    // Calculate total days
    const totalDays = await LeaveService.calculateLeaveDays(startDate, endDate);
    
    // Check leave balance
    const hasBalance = await LeaveService.checkLeaveBalance(userId, leaveTypeId, totalDays);
    if (!hasBalance) {
      return errorResponse(res, 'Insufficient leave balance', 400);
    }
    
    // Check for overlapping applications
    const hasOverlap = await LeaveService.checkOverlappingLeave(userId, startDate, endDate);
    if (hasOverlap) {
      return errorResponse(res, 'Overlapping leave application exists', 400);
    }
    
    // Create application
    const application = await LeaveService.createApplication({
      employeeId: userId,
      leaveTypeId,
      startDate,
      endDate,
      totalDays,
      reason,
      status: 'pending'
    });
    
    return successResponse(res, application, 'Leave application submitted', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

#### **2. Approval Workflow**:
```javascript
// services/LeaveService.js
static async approveLeave(applicationId, managerId, action, comments) {
  const application = await LeaveModel.findById(applicationId);
  
  if (!application) {
    throw new Error('Leave application not found');
  }
  
  // Update application status
  await LeaveModel.updateStatus(applicationId, action, managerId, comments);
  
  if (action === 'approve') {
    // Deduct from leave balance
    await this.deductLeaveBalance(
      application.employee_id,
      application.leave_type_id,
      application.total_days
    );
  }
  
  // Send notification (future enhancement)
  // await NotificationService.sendLeaveStatusUpdate(application);
  
  return { success: true, message: `Leave ${action}d successfully` };
}
```

### **Testing Requirements**:
- Leave application flow tests
- Balance calculation tests
- Approval workflow tests
- Overlap detection tests

### **Completion Checklist**:
- [ ] Leave application endpoints
- [ ] Leave balance management
- [ ] Approval workflow
- [ ] Leave type management
- [ ] Calendar integration
- [ ] Balance calculations
- [ ] Overlap detection
- [ ] Manager approval interface
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Service documentation complete

---

## 🎯 **Agent 5: Payroll Service**

### **Workspace**: `backend/services/payroll-service/`

### **Responsibilities**:
- Payroll processing and calculations
- Payslip generation
- Salary component management
- Tax and deduction calculations

### **API Endpoints to Implement**:
```javascript
GET  /api/payroll/payslips
GET  /api/payroll/payslips/:id
POST /api/payroll/process
GET  /api/payroll/summary
PUT  /api/payroll/salary-components/:id
GET  /api/payroll/tax-settings
```

### **Database Tables**:
- `payroll_records` (primary)
- `salary_components`

### **Key Implementation Details**:

#### **1. Payroll Processing**:
```javascript
// controllers/PayrollController.js
static async processPayroll(req, res) {
  try {
    const { month, year, employeeIds } = req.body;

    const results = [];

    for (const employeeId of employeeIds) {
      // Get employee salary details
      const employee = await EmployeeService.getById(employeeId);

      // Get attendance for the month
      const attendance = await AttendanceService.getMonthlyAttendance(employeeId, month, year);

      // Calculate salary components
      const salaryCalculation = await PayrollService.calculateSalary({
        basicSalary: employee.basic_salary,
        workingDays: attendance.workingDays,
        presentDays: attendance.presentDays,
        overtimeHours: attendance.overtimeHours
      });

      // Create payroll record
      const payrollRecord = await PayrollService.createPayrollRecord({
        employeeId,
        month,
        year,
        ...salaryCalculation
      });

      results.push(payrollRecord);
    }

    return successResponse(res, results, 'Payroll processed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

#### **2. Salary Calculation Logic**:
```javascript
// services/PayrollService.js
static calculateSalary({ basicSalary, workingDays, presentDays, overtimeHours }) {
  const dailySalary = basicSalary / workingDays;
  const earnedBasic = dailySalary * presentDays;

  // Allowances (simplified)
  const hra = earnedBasic * 0.4; // 40% of basic
  const transport = 2000; // Fixed transport allowance

  // Overtime calculation
  const hourlyRate = dailySalary / 8;
  const overtimePay = overtimeHours * hourlyRate * 1.5;

  const grossSalary = earnedBasic + hra + transport + overtimePay;

  // Deductions (simplified)
  const pf = earnedBasic * 0.12; // 12% PF
  const tax = grossSalary > 50000 ? grossSalary * 0.1 : 0; // Simple tax

  const totalDeductions = pf + tax;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary: earnedBasic,
    hra,
    transport,
    overtimePay,
    grossSalary,
    pf,
    tax,
    totalDeductions,
    netSalary,
    workingDays,
    presentDays,
    overtimeHours
  };
}
```

### **Completion Checklist**:
- [ ] Payroll processing endpoints
- [ ] Salary calculation logic
- [ ] Payslip generation
- [ ] Component management
- [ ] Tax calculations
- [ ] Deduction handling
- [ ] Monthly processing
- [ ] Payroll reports
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Service documentation complete

---

## 🎯 **Agent 6: Performance Management Service**

### **Workspace**: `backend/services/performance-service/`

### **Responsibilities**:
- Performance review management
- Goal setting and tracking
- Feedback collection
- Performance analytics

### **API Endpoints to Implement**:
```javascript
GET  /api/performance/reviews
POST /api/performance/reviews
GET  /api/performance/goals
POST /api/performance/goals
PUT  /api/performance/goals/:id
GET  /api/performance/feedback
POST /api/performance/feedback
```

### **Database Tables**:
- `performance_reviews` (primary)
- `employee_goals`
- `performance_feedback`

### **Key Implementation Details**:

#### **1. Performance Review Controller**:
```javascript
// controllers/PerformanceController.js
static async createReview(req, res) {
  try {
    const { employeeId, reviewPeriod, goals, overallRating, comments } = req.body;
    const { userId: reviewerId } = req.user;

    // Validate reviewer authority
    const canReview = await PerformanceService.canReviewEmployee(reviewerId, employeeId);
    if (!canReview) {
      return errorResponse(res, 'Unauthorized to review this employee', 403);
    }

    // Create review
    const review = await PerformanceService.createReview({
      employeeId,
      reviewerId,
      reviewPeriod,
      overallRating,
      comments,
      status: 'draft'
    });

    // Update goal achievements
    for (const goal of goals) {
      await PerformanceService.updateGoalAchievement(goal.id, goal.achievementPercentage);
    }

    return successResponse(res, review, 'Performance review created', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

### **Completion Checklist**:
- [ ] Performance review endpoints
- [ ] Goal management system
- [ ] Feedback collection
- [ ] Review workflow
- [ ] Performance analytics
- [ ] Rating calculations
- [ ] Review scheduling
- [ ] Manager dashboards
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Service documentation complete

---

## 🎯 **Agent 7: AI Features Service**

### **Workspace**: `backend/services/ai-service/`

### **Responsibilities**:
- Resume parsing with LLM
- Attrition prediction
- Smart feedback generation
- Anomaly detection
- HR chatbot
- Smart reports

### **API Endpoints to Implement**:
```javascript
POST /api/ai/parse-resume
GET  /api/ai/attrition-predictions
POST /api/ai/generate-feedback
GET  /api/ai/anomaly-detections
POST /api/ai/chatbot/query
POST /api/ai/generate-report
```

### **Database Tables**:
- `ai_attrition_predictions`
- `ai_feedback_generated`
- `ai_anomaly_detections`
- `ai_chatbot_conversations`

### **Key Implementation Details**:

#### **1. Resume Parser**:
```javascript
// controllers/AIController.js
static async parseResume(req, res) {
  try {
    const pdfBuffer = req.file.buffer;

    // Extract text from PDF
    const pdfText = await AIService.extractTextFromPDF(pdfBuffer);

    // Process with LLM
    const parsedData = await AIService.parseResumeWithLLM(pdfText);

    return successResponse(res, parsedData, 'Resume parsed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

#### **2. LLM Integration**:
```javascript
// services/AIService.js
static async parseResumeWithLLM(pdfText) {
  const prompt = `Extract structured information from this resume text and return ONLY valid JSON:

Resume Text: ${pdfText}

Return JSON in this exact format:
{
  "name": "Full Name",
  "email": "email@domain.com",
  "phone": "+1234567890",
  "experience_years": 5,
  "current_company": "Company Name",
  "skills": ["skill1", "skill2", "skill3"],
  "education": "Highest Degree",
  "summary": "Brief professional summary"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 500
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### **Completion Checklist**:
- [ ] Resume parsing implementation
- [ ] Attrition prediction system
- [ ] Smart feedback generator
- [ ] Anomaly detection
- [ ] HR chatbot with RAG
- [ ] Smart report generation
- [ ] LLM integration
- [ ] Vector database setup
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Service documentation complete

---

## 🎯 **Agent 8: Reports Service**

### **Workspace**: `backend/services/reports-service/`

### **Responsibilities**:
- Report generation and management
- Data analytics and insights
- Dashboard data aggregation
- Export functionality

### **API Endpoints to Implement**:
```javascript
GET  /api/reports/dashboard-stats
GET  /api/reports/attendance-report
GET  /api/reports/leave-report
GET  /api/reports/payroll-report
GET  /api/reports/performance-report
POST /api/reports/custom-report
```

### **Database Tables**:
- Uses data from all other services
- `custom_reports` (for saved reports)

### **Key Implementation Details**:

#### **1. Dashboard Statistics**:
```javascript
// controllers/ReportsController.js
static async getDashboardStats(req, res) {
  try {
    const { userId, role } = req.user;

    let stats;

    if (role === 'admin') {
      stats = await ReportsService.getAdminDashboardStats();
    } else if (role === 'manager') {
      stats = await ReportsService.getManagerDashboardStats(userId);
    } else {
      stats = await ReportsService.getEmployeeDashboardStats(userId);
    }

    return successResponse(res, stats, 'Dashboard stats retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}
```

### **Completion Checklist**:
- [ ] Dashboard statistics
- [ ] Attendance reports
- [ ] Leave reports
- [ ] Payroll reports
- [ ] Performance reports
- [ ] Custom report builder
- [ ] Data export functionality
- [ ] Role-based data access
- [ ] Unit tests (>90% coverage)
- [ ] Integration tests
- [ ] Service documentation complete

This completes all backend agent tasks with detailed implementation guidance.
