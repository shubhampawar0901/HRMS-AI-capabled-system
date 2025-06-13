# 🔗 Complete API Flow v2 - Streamlined AI-Enhanced HRMS

## 📌 Assignment Context

This document defines the complete API structure for the **streamlined 15-screen** HRMS platform with consolidated endpoints that support tabbed interfaces and modal-based workflows.

## 🏗️ Multi-Agent Backend Architecture

### **8 Independent Services**
```
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Services Architecture                 │
├─────────────────────────────────────────────────────────────────┤
│ auth-service     │ employee-service │ attendance-service         │
│ payroll-service  │ leave-service    │ performance-service        │
│ ai-service       │ reports-service  │                            │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Service APIs

### **POST /api/auth/login**
```json
// Request Body
{
  "email": "admin@company.com",
  "password": "password123",
  "role": "admin"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": 1,
      "email": "admin@company.com",
      "role": "admin",
      "employee": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "department": "IT"
      }
    }
  },
  "message": "Login successful"
}
```

### **POST /api/auth/refresh**
```json
// Request Body
{
  "refreshToken": "refresh_token_here"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token_here"
  }
}
```

### **POST /api/auth/logout**
```json
// Success Response (200)
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 👥 Employee Service APIs

### **GET /api/employees**
```json
// Query Parameters
{
  "page": 1,
  "limit": 20,
  "search": "john",
  "department": "IT",
  "status": "active",
  "role": "employee"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": 1,
        "employeeCode": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@company.com",
        "department": "IT",
        "position": "Developer",
        "status": "active",
        "hireDate": "2023-01-15",
        "manager": "Jane Smith"
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

### **GET /api/employees/:id**
```json
// Success Response (200) - Consolidated employee data for tabbed interface
{
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@company.com",
        "phone": "+1234567890",
        "address": "123 Main St"
      },
      "employment": {
        "employeeCode": "EMP001",
        "department": "IT",
        "position": "Developer",
        "manager": "Jane Smith",
        "hireDate": "2023-01-15",
        "salary": 75000,
        "status": "active"
      },
      "attendance": {
        "todayStatus": "present",
        "checkInTime": "09:00:00",
        "thisMonthHours": 160,
        "attendanceRate": 95
      },
      "leave": {
        "annualBalance": 20,
        "sickBalance": 10,
        "emergencyBalance": 5,
        "pendingRequests": 1
      },
      "performance": {
        "currentRating": 4,
        "activeGoals": 3,
        "completedGoals": 8,
        "lastReviewDate": "2023-12-15"
      },
      "payroll": {
        "basicSalary": 75000,
        "lastPayslipDate": "2024-01-31",
        "ytdEarnings": 75000
      }
    }
  }
}
```

### **POST /api/employees**
```json
// Request Body
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "hireDate": "2024-02-01",
  "departmentId": 1,
  "managerId": 2,
  "position": "Senior Developer",
  "salary": 85000,
  "address": "456 Oak St"
}

// Success Response (201)
{
  "success": true,
  "data": {
    "employee": {
      "id": 151,
      "employeeCode": "EMP151",
      // ... other employee data
    }
  },
  "message": "Employee created successfully"
}
```

### **PUT /api/employees/:id**
```json
// Request Body (partial update)
{
  "position": "Lead Developer",
  "salary": 90000,
  "departmentId": 2
}

// Success Response (200)
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

## ⏰ Attendance Service APIs

### **POST /api/attendance/checkin**
```json
// Request Body
{
  "employeeId": 123,
  "notes": "Started work early"
}

// Success Response (201)
{
  "success": true,
  "data": {
    "attendance": {
      "id": 1,
      "employeeId": 123,
      "checkInTime": "2024-01-15T09:00:00Z",
      "workDate": "2024-01-15",
      "status": "present"
    }
  },
  "message": "Checked in successfully"
}
```

### **POST /api/attendance/checkout**
```json
// Request Body
{
  "employeeId": 123,
  "notes": "Completed daily tasks"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "attendance": {
      "id": 1,
      "employeeId": 123,
      "checkInTime": "2024-01-15T09:00:00Z",
      "checkOutTime": "2024-01-15T18:00:00Z",
      "totalHours": 9.0,
      "workDate": "2024-01-15",
      "status": "present"
    }
  },
  "message": "Checked out successfully"
}
```

### **GET /api/attendance/hub**
```json
// Query Parameters - Consolidated endpoint for attendance hub
{
  "employeeId": 123,
  "tab": "history", // today, history, team, reports
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "page": 1,
  "limit": 20
}

// Success Response (200) - Supports all attendance hub tabs
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
        "checkInTime": "09:00:00",
        "workingHours": 8.5
      }
    ],
    "summary": {
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "totalHours": 162.0,
      "averageHours": 8.1
    }
  }
}
```

## 🏖️ Leave Service APIs

### **GET /api/leave/hub**
```json
// Query Parameters - Consolidated endpoint for leave hub
{
  "employeeId": 123,
  "tab": "balance", // apply, history, balance, calendar
  "year": 2024
}

// Success Response (200) - Supports all leave hub tabs
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
        "status": "approved",
        "reason": "Family vacation"
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

### **POST /api/leave/apply**
```json
// Request Body
{
  "employeeId": 123,
  "leaveTypeId": 1,
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "reason": "Family vacation"
}

// Success Response (201)
{
  "success": true,
  "data": {
    "application": {
      "id": 1,
      "employeeId": 123,
      "leaveType": "Annual Leave",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "totalDays": 5,
      "reason": "Family vacation",
      "status": "pending"
    }
  },
  "message": "Leave application submitted successfully"
}
```

### **GET /api/leave/approvals**
```json
// Query Parameters - Manager leave approvals
{
  "managerId": 456,
  "status": "pending",
  "page": 1,
  "limit": 20
}

// Success Response (200)
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
        "status": "pending",
        "appliedDate": "2024-01-15"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### **PUT /api/leave/approve/:id**
```json
// Request Body
{
  "status": "approved",
  "comments": "Approved for the requested dates"
}

// Success Response (200)
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

## 💰 Payroll Service APIs

### **GET /api/payroll/hub**
```json
// Query Parameters - Consolidated payroll hub
{
  "employeeId": 123,
  "tab": "payslips", // payroll, payslips, management, reports
  "year": 2024,
  "month": 1
}

// Success Response (200) - Supports all payroll hub tabs
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
        "employeeId": 123,
        "payPeriod": "January 2024",
        "basicSalary": 5000.00,
        "allowances": 1000.00,
        "deductions": 500.00,
        "taxDeduction": 750.00,
        "netSalary": 4750.00,
        "status": "paid",
        "payDate": "2024-01-31"
      }
    ],
    "ytdSummary": {
      "totalEarnings": 60000.00,
      "totalDeductions": 12000.00,
      "netPay": 48000.00,
      "taxPaid": 9000.00
    }
  }
}
```

### **POST /api/payroll/process**
```json
// Request Body - Admin payroll processing
{
  "payPeriodStart": "2024-01-01",
  "payPeriodEnd": "2024-01-31",
  "employeeIds": [123, 456] // Optional, all if not provided
}

// Success Response (202)
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

## 📊 Performance Service APIs

### **GET /api/performance/hub**
```json
// Query Parameters - Consolidated performance hub
{
  "employeeId": 123,
  "tab": "goals", // goals, reviews, history, analytics
  "year": 2024
}

// Success Response (200) - Supports all performance hub tabs
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": 1,
        "employeeId": 123,
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
        "employeeId": 123,
        "reviewerId": 456,
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

### **POST /api/performance/goals**
```json
// Request Body
{
  "employeeId": 123,
  "title": "Complete React Training",
  "description": "Finish advanced React course and build sample project",
  "targetDate": "2024-03-31"
}

// Success Response (201)
{
  "success": true,
  "data": {
    "goal": {
      "id": 1,
      "employeeId": 123,
      "title": "Complete React Training",
      "description": "Finish advanced React course and build sample project",
      "targetDate": "2024-03-31",
      "status": "active",
      "progressPercentage": 0
    }
  },
  "message": "Goal created successfully"
}
```

### **POST /api/performance/reviews**
```json
// Request Body
{
  "employeeId": 123,
  "reviewPeriodStart": "2024-01-01",
  "reviewPeriodEnd": "2024-12-31",
  "overallRating": 4,
  "feedback": "Excellent performance throughout the year",
  "goalsAchievement": "Met all quarterly goals",
  "areasOfImprovement": "Could improve communication skills"
}

// Success Response (201)
{
  "success": true,
  "data": {
    "review": {
      "id": 1,
      "employeeId": 123,
      "reviewerId": 456,
      "overallRating": 4,
      "status": "submitted"
    }
  },
  "message": "Performance review submitted"
}
```

## 🤖 AI Service APIs

### **POST /api/ai/chatbot/query**
```json
// Request Body
{
  "message": "What is my leave balance?",
  "sessionId": "session_123"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "message": "Your current leave balance: Annual Leave: 20 days, Sick Leave: 10 days, Emergency Leave: 5 days",
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

### **GET /api/ai/hub**
```json
// Query Parameters - Consolidated AI hub
{
  "feature": "attrition", // attrition, resume, anomaly, insights
  "employeeId": 123 // Optional filter
}

// Success Response (200) - Supports all AI hub tabs
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
          "contributingFactors": ["Low engagement", "No recent promotion"],
          "recommendations": ["Schedule 1:1 meeting", "Discuss career growth"]
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
          "email": "jane@email.com",
          "skills": ["React", "Node.js", "Python"],
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
    ],
    "insights": {
      "totalInsights": 15,
      "actionableItems": 8,
      "trends": ["Attendance improving", "Performance stable"]
    }
  }
}
```

### **POST /api/ai/resume/parse**
```json
// Request Body (multipart/form-data)
{
  "file": "resume.pdf",
  "candidateName": "Jane Smith" // Optional
}

// Success Response (201)
{
  "success": true,
  "data": {
    "parsed": {
      "id": 1,
      "candidateName": "Jane Smith",
      "email": "jane@email.com",
      "phone": "+1234567890",
      "skills": ["React", "Node.js", "Python", "AWS"],
      "experienceYears": 5,
      "education": "BS Computer Science",
      "parsingStatus": "completed",
      "confidenceScore": 0.95
    }
  },
  "message": "Resume parsed successfully"
}
```

## 📈 Reports Service APIs

### **GET /api/reports/dashboard**
```json
// Query Parameters
{
  "reportType": "attendance", // attendance, leave, payroll, performance
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "reportName": "Monthly Attendance Report",
        "reportType": "attendance",
        "generatedBy": 1,
        "createdAt": "2024-01-31T10:00:00Z",
        "status": "completed"
      }
    ],
    "quickStats": {
      "totalReports": 25,
      "recentReports": 5,
      "scheduledReports": 3
    }
  }
}
```

## 🔧 API Design Principles

### **Consolidated Endpoints**
- ✅ **Hub endpoints** support multiple tabs with single API call
- ✅ **Reduced API calls** through data consolidation
- ✅ **Tab-specific filtering** via query parameters
- ✅ **Consistent response structure** across all endpoints

### **Performance Optimizations**
- ✅ **Pagination** for large datasets
- ✅ **Field selection** to reduce payload size
- ✅ **Caching headers** for static data
- ✅ **Batch operations** for bulk actions

### **Security & Validation**
- ✅ **JWT authentication** for all endpoints
- ✅ **Role-based access control**
- ✅ **Input validation** and sanitization
- ✅ **Rate limiting** (100 requests/minute/user)

This streamlined API design supports the consolidated UI with efficient data fetching and reduced complexity while maintaining all functionality.
```
