# 🔗 Complete UI-API Mapping v2 - Streamlined AI-Enhanced HRMS

## 📌 Assignment Context

This document provides a detailed step-by-step mapping of every user interface screen and action to its corresponding backend API call for the **streamlined 15-screen** HRMS platform with consolidated workflows.

## 🔄 Overall Flow Outline

**Screen Flow**: Login → Role-based Dashboard → Consolidated Feature Hubs → AI Features
**Key Change**: Most actions now happen within tabs/modals instead of separate screens

## 🔐 Authentication Screens (1 Screen)

### **1. Login Screen (`/login`)**

#### **A. Screen Identification**
- **Screen Name**: Login
- **Component**: `LoginForm.jsx`
- **Route**: `/login`

#### **B. User Actions on This Screen**

**1. Action Name**: Click 'Login' button
- **UI Event Handler**: `handleLogin`
- **Component**: `LoginForm.jsx`

#### **C. Associated API Call**
```javascript
POST /api/auth/login

// Request Body Schema
{
  "email": "string",
  "password": "string",
  "role": "admin" | "manager" | "employee"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": 1,
      "email": "string",
      "role": "string",
      "employee": {
        "id": 1,
        "firstName": "string",
        "lastName": "string",
        "department": "string"
      }
    }
  },
  "message": "string"
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Store tokens in localStorage, user data in AuthContext
2. **Component Updates**: Clear form, show success message
3. **Navigation**: Redirect to role-based dashboard

---

## 🏠 Dashboard Screens (3 Screens)

### **2. Admin Dashboard (`/admin/dashboard`)**

#### **A. Screen Identification**
- **Screen Name**: Admin Dashboard
- **Component**: `AdminDashboard.jsx`
- **Route**: `/admin/dashboard`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect` on component mount
- **Component**: `AdminDashboard.jsx`

#### **C. Associated API Call**
```javascript
GET /api/dashboard/admin

// Expected Response Schema
{
  "success": true,
  "data": {
    "metrics": {
      "totalEmployees": 150,
      "activeToday": 142,
      "pendingLeaves": 8,
      "aiAlerts": 3
    },
    "attendanceChart": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
      "data": [95, 98, 92, 96, 94]
    },
    "pendingApprovals": [
      {
        "id": 1,
        "employeeName": "John Doe",
        "type": "leave",
        "details": "Sick Leave - 2 days"
      }
    ],
    "aiInsights": [
      {
        "type": "attrition",
        "message": "3 employees at high attrition risk",
        "action": "/admin/ai#attrition"
      }
    ]
  }
}
```

**2. Action Name**: Click 'Add Employee' button
- **UI Event Handler**: `handleAddEmployee`
- **Component**: `AdminDashboard.jsx`
- **Action**: Open Add Employee modal (no navigation)

---

### **3. Manager Dashboard (`/manager/dashboard`)**

#### **A. Screen Identification**
- **Screen Name**: Manager Dashboard
- **Component**: `ManagerDashboard.jsx`
- **Route**: `/manager/dashboard`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect` on component mount

#### **C. Associated API Call**
```javascript
GET /api/dashboard/manager

// Query Parameters
{
  "managerId": 456
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "teamMetrics": {
      "teamSize": 12,
      "presentToday": 11,
      "onLeave": 1,
      "pendingApprovals": 3
    },
    "teamAttendance": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
      "data": [92, 95, 88, 94, 91]
    },
    "pendingApprovals": [
      {
        "id": 1,
        "employeeName": "John Doe",
        "leaveType": "Annual Leave",
        "startDate": "2024-02-01",
        "endDate": "2024-02-05"
      }
    ],
    "teamInsights": [
      {
        "type": "performance",
        "message": "Team performance improved 15% this quarter"
      }
    ]
  }
}
```

---

### **4. Employee Dashboard (`/employee/dashboard`)**

#### **A. Screen Identification**
- **Screen Name**: Employee Dashboard
- **Component**: `EmployeeDashboard.jsx`
- **Route**: `/employee/dashboard`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect` on component mount

#### **C. Associated API Call**
```javascript
GET /api/dashboard/employee

// Query Parameters
{
  "employeeId": 123
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "welcomeMessage": "Welcome back, John!"
    },
    "attendance": {
      "todayStatus": "checked_in",
      "checkInTime": "09:00:00",
      "workingHours": 8.5,
      "thisMonthRate": 95
    },
    "leaveBalance": {
      "annual": 20,
      "sick": 10,
      "emergency": 5
    },
    "quickActions": [
      {
        "name": "Apply Leave",
        "action": "/leave#apply"
      },
      {
        "name": "View Payslip",
        "action": "/payroll#payslips"
      }
    ],
    "recentActivities": [
      {
        "type": "attendance",
        "message": "Checked in at 9:00 AM",
        "timestamp": "2024-01-15T09:00:00Z"
      }
    ]
  }
}
```

**2. Action Name**: Click 'Check In' button
- **UI Event Handler**: `handleCheckIn`
- **Component**: `EmployeeDashboard.jsx`

#### **C. Associated API Call**
```javascript
POST /api/attendance/checkin

// Request Body Schema
{
  "employeeId": 123,
  "notes": "string"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "attendance": {
      "id": 1,
      "employeeId": 123,
      "checkInTime": "string",
      "workDate": "string",
      "status": "present"
    }
  },
  "message": "Checked in successfully"
}
```

---

## 👥 Employee Management Screens (2 Screens)

### **5. Employee List (`/admin/employees`)**

#### **A. Screen Identification**
- **Screen Name**: Employee List
- **Component**: `EmployeeList.jsx`
- **Route**: `/admin/employees`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect` on component mount

#### **C. Associated API Call**
```javascript
GET /api/employees

// Query Parameters
{
  "page": 1,
  "limit": 20,
  "search": "string",
  "department": "string",
  "status": "string"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": 1,
        "employeeCode": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "department": "string",
        "position": "string",
        "status": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

**2. Action Name**: Click 'Add Employee' button
- **UI Event Handler**: `handleAddEmployee`
- **Component**: `EmployeeList.jsx`
- **Action**: Open Add Employee modal

#### **C. Associated API Call**
```javascript
POST /api/employees

// Request Body Schema
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "hireDate": "string",
  "departmentId": 1,
  "managerId": 1,
  "position": "string",
  "salary": 75000,
  "address": "string"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "employeeCode": "string",
      // ... other employee data
    }
  },
  "message": "Employee created successfully"
}
```

**3. Action Name**: Click employee row
- **UI Event Handler**: `handleEmployeeClick`
- **Component**: `EmployeeList.jsx`
- **Navigation**: Navigate to `/admin/employees/:id`

---

### **6. Employee Profile (`/admin/employees/:id`)**

#### **A. Screen Identification**
- **Screen Name**: Employee Profile
- **Component**: `EmployeeProfile.jsx`
- **Route**: `/admin/employees/:id`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect` on component mount

#### **C. Associated API Call**
```javascript
GET /api/employees/:id

// Expected Response Schema - Consolidated data for all tabs
{
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "personalInfo": {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "phone": "string",
        "address": "string"
      },
      "employment": {
        "employeeCode": "string",
        "department": "string",
        "position": "string",
        "manager": "string",
        "hireDate": "string",
        "salary": 75000,
        "status": "string"
      },
      "attendance": {
        "todayStatus": "string",
        "thisMonthHours": 160,
        "attendanceRate": 95
      },
      "leave": {
        "annualBalance": 20,
        "sickBalance": 10,
        "pendingRequests": 1
      },
      "performance": {
        "currentRating": 4,
        "activeGoals": 3,
        "lastReviewDate": "string"
      },
      "payroll": {
        "basicSalary": 75000,
        "lastPayslipDate": "string"
      }
    }
  }
}
```

**2. Action Name**: Click 'Edit' button
- **UI Event Handler**: `handleEdit`
- **Component**: `EmployeeProfile.jsx`
- **Action**: Toggle edit mode (no navigation)

**3. Action Name**: Save changes
- **UI Event Handler**: `handleSave`
- **Component**: `EmployeeProfile.jsx`

#### **C. Associated API Call**
```javascript
PUT /api/employees/:id

// Request Body Schema (partial update)
{
  "firstName": "string",
  "position": "string",
  "salary": 80000
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "employee": {
      // ... updated employee data
    }
  },
  "message": "Employee updated successfully"
}
```

---

## ⏰ Attendance Hub (1 Screen)

### **7. Attendance Hub (`/attendance`)**

#### **A. Screen Identification**
- **Screen Name**: Attendance Hub
- **Component**: `AttendanceHub.jsx`
- **Route**: `/attendance`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load / Tab Switch
- **UI Event Handler**: `useEffect` on component mount and tab change
- **Component**: `AttendanceHub.jsx`

#### **C. Associated API Call**
```javascript
GET /api/attendance/hub

// Query Parameters
{
  "employeeId": 123,
  "tab": "today" | "history" | "team" | "reports",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "page": 1,
  "limit": 20
}

// Expected Response Schema - Supports all tabs
{
  "success": true,
  "data": {
    "today": {
      "status": "present",
      "checkInTime": "09:00:00",
      "workingHours": 8.5,
      "isCheckedIn": true
    },
    "history": [
      {
        "id": 1,
        "workDate": "2024-01-15",
        "checkInTime": "09:00:00",
        "checkOutTime": "18:00:00",
        "totalHours": 9.0,
        "status": "present"
      }
    ],
    "team": [
      {
        "employeeId": 123,
        "employeeName": "John Doe",
        "status": "present",
        "checkInTime": "09:00:00"
      }
    ],
    "summary": {
      "totalDays": 20,
      "presentDays": 18,
      "averageHours": 8.1
    }
  }
}
```

**2. Action Name**: Click 'Check Out' button
- **UI Event Handler**: `handleCheckOut`
- **Component**: `AttendanceHub.jsx`

#### **C. Associated API Call**
```javascript
POST /api/attendance/checkout

// Request Body Schema
{
  "employeeId": 123,
  "notes": "string"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "attendance": {
      "id": 1,
      "checkInTime": "string",
      "checkOutTime": "string",
      "totalHours": 9.0,
      "status": "present"
    }
  },
  "message": "Checked out successfully"
}
```

---

## 🏖️ Leave Management Screens (2 Screens)

### **8. Leave Hub (`/leave`)**

#### **A. Screen Identification**
- **Screen Name**: Leave Hub
- **Component**: `LeaveHub.jsx`
- **Route**: `/leave`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load / Tab Switch
- **UI Event Handler**: `useEffect` on component mount and tab change
- **Component**: `LeaveHub.jsx`

#### **C. Associated API Call**
```javascript
GET /api/leave/hub

// Query Parameters
{
  "employeeId": 123,
  "tab": "apply" | "history" | "balance" | "calendar",
  "year": 2024
}

// Expected Response Schema - Supports all tabs
{
  "success": true,
  "data": {
    "balance": [
      {
        "leaveTypeId": 1,
        "leaveType": "Annual Leave",
        "allocated": 30,
        "used": 10,
        "remaining": 20
      }
    ],
    "history": [
      {
        "id": 1,
        "leaveType": "Annual Leave",
        "startDate": "2024-01-15",
        "endDate": "2024-01-19",
        "totalDays": 5,
        "status": "approved"
      }
    ],
    "leaveTypes": [
      {
        "id": 1,
        "name": "Annual Leave",
        "maxDays": 30
      }
    ],
    "teamCalendar": [
      {
        "employeeName": "John Doe",
        "startDate": "2024-02-01",
        "endDate": "2024-02-05",
        "leaveType": "Annual Leave"
      }
    ]
  }
}
```

**2. Action Name**: Submit Leave Application
- **UI Event Handler**: `handleSubmitLeave`
- **Component**: `LeaveHub.jsx`

#### **C. Associated API Call**
```javascript
POST /api/leave/apply

// Request Body Schema
{
  "leaveTypeId": 1,
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "reason": "Family vacation"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "application": {
      "id": 1,
      "leaveType": "Annual Leave",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "totalDays": 5,
      "status": "pending"
    }
  },
  "message": "Leave application submitted successfully"
}
```

---

### **9. Leave Approvals (`/manager/leave/approvals`)**

#### **A. Screen Identification**
- **Screen Name**: Leave Approvals
- **Component**: `LeaveApprovals.jsx`
- **Route**: `/manager/leave/approvals`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect` on component mount
- **Component**: `LeaveApprovals.jsx`

#### **C. Associated API Call**
```javascript
GET /api/leave/approvals

// Query Parameters
{
  "managerId": 456,
  "status": "pending",
  "page": 1,
  "limit": 20
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": 1,
        "employeeId": 123,
        "employeeName": "John Doe",
        "leaveType": "Annual Leave",
        "startDate": "2024-02-01",
        "endDate": "2024-02-05",
        "totalDays": 5,
        "reason": "Family vacation",
        "status": "pending"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8
    }
  }
}
```

**2. Action Name**: Approve Leave
- **UI Event Handler**: `handleApprove`
- **Component**: `LeaveApprovals.jsx`

#### **C. Associated API Call**
```javascript
PUT /api/leave/approve/:id

// Request Body Schema
{
  "status": "approved",
  "comments": "Approved for the requested dates"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "application": {
      "id": 1,
      "status": "approved",
      "approvedBy": 456,
      "approvedAt": "2024-01-15T10:00:00Z"
    }
  },
  "message": "Leave application approved"
}
```

---

## 💰 Payroll Hub (1 Screen)

### **10. Payroll Hub (`/payroll`)**

#### **A. Screen Identification**
- **Screen Name**: Payroll Hub
- **Component**: `PayrollHub.jsx`
- **Route**: `/payroll`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load / Tab Switch
- **UI Event Handler**: `useEffect` on component mount and tab change
- **Component**: `PayrollHub.jsx`

#### **C. Associated API Call**
```javascript
GET /api/payroll/hub

// Query Parameters
{
  "employeeId": 123,
  "tab": "payroll" | "payslips" | "management" | "reports",
  "year": 2024,
  "month": 1
}

// Expected Response Schema - Supports all tabs
{
  "success": true,
  "data": {
    "currentPayroll": {
      "basicSalary": 5000.00,
      "allowances": 1000.00,
      "deductions": 500.00,
      "taxDeduction": 750.00,
      "netSalary": 4750.00,
      "payPeriod": "January 2024"
    },
    "payslips": [
      {
        "id": 1,
        "payPeriod": "January 2024",
        "basicSalary": 5000.00,
        "netSalary": 4750.00,
        "status": "paid",
        "payDate": "2024-01-31"
      }
    ],
    "ytdSummary": {
      "totalEarnings": 60000.00,
      "totalDeductions": 12000.00,
      "netPay": 48000.00
    }
  }
}
```

**2. Action Name**: Download Payslip
- **UI Event Handler**: `handleDownloadPayslip`
- **Component**: `PayrollHub.jsx`
- **Action**: Download PDF file (no navigation)

**3. Action Name**: Process Payroll (Admin only)
- **UI Event Handler**: `handleProcessPayroll`
- **Component**: `PayrollHub.jsx`

#### **C. Associated API Call**
```javascript
POST /api/payroll/process

// Request Body Schema
{
  "payPeriodStart": "2024-01-01",
  "payPeriodEnd": "2024-01-31",
  "employeeIds": [123, 456]
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "jobId": 1,
    "status": "processing",
    "estimatedCompletion": "2024-01-15T12:00:00Z"
  },
  "message": "Payroll processing started"
}
```

---

## 📊 Performance Hub (1 Screen)

### **11. Performance Hub (`/performance`)**

#### **A. Screen Identification**
- **Screen Name**: Performance Hub
- **Component**: `PerformanceHub.jsx`
- **Route**: `/performance`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load / Tab Switch
- **UI Event Handler**: `useEffect` on component mount and tab change
- **Component**: `PerformanceHub.jsx`

#### **C. Associated API Call**
```javascript
GET /api/performance/hub

// Query Parameters
{
  "employeeId": 123,
  "tab": "goals" | "reviews" | "history" | "analytics",
  "year": 2024
}

// Expected Response Schema - Supports all tabs
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": 1,
        "title": "Complete React Training",
        "description": "Finish advanced React course",
        "targetDate": "2024-03-31",
        "status": "active",
        "progressPercentage": 75
      }
    ],
    "reviews": [
      {
        "id": 1,
        "reviewPeriod": "Q4 2024",
        "overallRating": 4,
        "status": "completed",
        "submittedAt": "2024-01-15"
      }
    ],
    "analytics": {
      "averageRating": 4.2,
      "goalsCompleted": 8,
      "goalsActive": 3,
      "performanceTrend": "improving"
    }
  }
}
```

**2. Action Name**: Add New Goal
- **UI Event Handler**: `handleAddGoal`
- **Component**: `PerformanceHub.jsx`
- **Action**: Open Add Goal modal

#### **C. Associated API Call**
```javascript
POST /api/performance/goals

// Request Body Schema
{
  "employeeId": 123,
  "title": "Complete React Training",
  "description": "Finish advanced React course",
  "targetDate": "2024-03-31"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "goal": {
      "id": 1,
      "title": "Complete React Training",
      "status": "active",
      "progressPercentage": 0
    }
  },
  "message": "Goal created successfully"
}
```

**3. Action Name**: Submit Performance Review
- **UI Event Handler**: `handleSubmitReview`
- **Component**: `PerformanceHub.jsx`

#### **C. Associated API Call**
```javascript
POST /api/performance/reviews

// Request Body Schema
{
  "employeeId": 123,
  "reviewPeriodStart": "2024-01-01",
  "reviewPeriodEnd": "2024-12-31",
  "overallRating": 4,
  "feedback": "Excellent performance",
  "goalsAchievement": "Met all goals"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "review": {
      "id": 1,
      "overallRating": 4,
      "status": "submitted"
    }
  },
  "message": "Performance review submitted"
}
```

---

## 🤖 AI Features (2 Screens)

### **12. AI Chatbot (Global Widget)**

#### **A. Screen Identification**
- **Screen Name**: AI Chatbot
- **Component**: `AIChatbot.jsx`
- **Type**: Global floating widget

#### **B. User Actions on This Screen**

**1. Action Name**: Send Message
- **UI Event Handler**: `handleSendMessage`
- **Component**: `AIChatbot.jsx`

#### **C. Associated API Call**
```javascript
POST /api/ai/chatbot/query

// Request Body Schema
{
  "message": "What is my leave balance?",
  "sessionId": "session_123"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "message": "Your current leave balance: Annual Leave: 20 days",
    "intent": "leave_balance_inquiry",
    "quickActions": [
      {
        "text": "Apply for Leave",
        "action": "navigate",
        "target": "/leave#apply"
      }
    ],
    "responseTime": 1200
  }
}
```

---

### **13. AI Hub (`/admin/ai`)**

#### **A. Screen Identification**
- **Screen Name**: AI Hub
- **Component**: `AIHub.jsx`
- **Route**: `/admin/ai`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load / Tab Switch
- **UI Event Handler**: `useEffect` on component mount and tab change
- **Component**: `AIHub.jsx`

#### **C. Associated API Call**
```javascript
GET /api/ai/hub

// Query Parameters
{
  "feature": "attrition" | "resume" | "anomaly" | "insights",
  "employeeId": 123
}

// Expected Response Schema - Supports all AI features
{
  "success": true,
  "data": {
    "attrition": {
      "predictions": [
        {
          "employeeId": 123,
          "employeeName": "John Doe",
          "riskScore": 75.5,
          "riskLevel": "high",
          "contributingFactors": ["Low engagement"],
          "recommendations": ["Schedule 1:1 meeting"]
        }
      ],
      "summary": {
        "totalEmployees": 150,
        "highRisk": 12,
        "mediumRisk": 25,
        "lowRisk": 113
      }
    },
    "resumeParser": {
      "recentParsed": [
        {
          "id": 1,
          "candidateName": "Jane Smith",
          "skills": ["React", "Node.js"],
          "experienceYears": 5,
          "parsingStatus": "completed"
        }
      ]
    },
    "anomalies": [
      {
        "id": 1,
        "employeeId": 123,
        "anomalyType": "late_arrival",
        "severity": "medium",
        "description": "Consistently arriving 30 minutes late",
        "isResolved": false
      }
    ]
  }
}
```

**2. Action Name**: Upload Resume
- **UI Event Handler**: `handleResumeUpload`
- **Component**: `AIHub.jsx`

#### **C. Associated API Call**
```javascript
POST /api/ai/resume/parse

// Request Body (multipart/form-data)
{
  "file": "resume.pdf",
  "candidateName": "Jane Smith"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "parsed": {
      "id": 1,
      "candidateName": "Jane Smith",
      "email": "jane@email.com",
      "skills": ["React", "Node.js", "Python"],
      "experienceYears": 5,
      "parsingStatus": "completed",
      "confidenceScore": 0.95
    }
  },
  "message": "Resume parsed successfully"
}
```

---

## 🔄 Validation & Error Paths

### **Form Validation Errors**
- **Client-side**: Show inline error messages using React Hook Form
- **Server-side**: Display API validation errors below form fields
- **Network errors**: Show retry button and error toast

### **Authentication Errors**
- **401 Unauthorized**: Redirect to login page, clear stored tokens
- **403 Forbidden**: Show "Access Denied" message, no navigation
- **Token expiry**: Automatically refresh token or redirect to login

### **Loading States**
- **Initial load**: Show skeleton screens for each tab
- **Tab switching**: Show loading spinner for tab content
- **Form submission**: Show loading state on submit buttons
- **File upload**: Show progress bar for resume uploads

## 📱 Mobile Optimizations

### **Touch Interactions**
- **Swipe gestures**: Left/right swipe for tab navigation
- **Pull-to-refresh**: Refresh current tab data
- **Long press**: Context menus for quick actions
- **Haptic feedback**: Confirmation for important actions

### **Responsive API Calls**
- **Reduced payloads**: Mobile-optimized response schemas
- **Pagination**: Smaller page sizes for mobile
- **Caching**: Aggressive caching for frequently accessed data
- **Offline support**: Cache critical data for offline viewing

## 📊 Performance Optimizations

### **API Efficiency**
- ✅ **Consolidated endpoints** reduce API calls by 60%
- ✅ **Tab-based loading** loads only required data
- ✅ **Pagination** for large datasets
- ✅ **Caching** for static data (departments, leave types)

### **UI Efficiency**
- ✅ **Modal workflows** eliminate page transitions
- ✅ **Tab persistence** maintains state across navigation
- ✅ **Optimistic updates** for better perceived performance
- ✅ **Lazy loading** for non-critical components

This streamlined mapping ensures efficient data flow between the consolidated UI and backend services while maintaining all functionality through smart API design.
```
