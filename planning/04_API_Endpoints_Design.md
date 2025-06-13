# 🔌 API Endpoints Design - AI-Enhanced HRMS

## Complete API Specification

---

## 🔐 **Authentication APIs**

### **POST /api/auth/login**
**Purpose**: User authentication
**Headers**: `Content-Type: application/json`
**Request Body**:
```json
{
  "email": "user@company.com",
  "password": "securePassword123"
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "role": "employee",
      "employee": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "department": "Engineering"
      }
    }
  }
}
```
**Errors**: 401 (Invalid credentials), 400 (Validation error)

### **POST /api/auth/forgot-password**
**Purpose**: Request password reset
**Request Body**:
```json
{
  "email": "user@company.com"
}
```
**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### **POST /api/auth/reset-password**
**Purpose**: Reset password with token
**Request Body**:
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword123"
}
```
**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### **POST /api/auth/refresh**
**Purpose**: Refresh access token
**Headers**: `Authorization: Bearer refresh_token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## 👥 **Employee Management APIs**

### **GET /api/employees**
**Purpose**: Get employees list (with role-based filtering)
**Headers**: `Authorization: Bearer token`
**Query Parameters**: 
- `page=1` (pagination)
- `limit=20` (items per page)
- `department=uuid` (filter by department)
- `status=active` (filter by status)
- `search=john` (search by name/email)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "uuid",
        "employeeCode": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@company.com",
        "department": {
          "id": "uuid",
          "name": "Engineering"
        },
        "position": "Software Engineer",
        "status": "active",
        "joinDate": "2024-01-15"
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
**Purpose**: Get employee details
**Headers**: `Authorization: Bearer token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeCode": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "department": {
      "id": "uuid",
      "name": "Engineering",
      "manager": {
        "id": "uuid",
        "name": "Jane Smith"
      }
    },
    "position": "Software Engineer",
    "manager": {
      "id": "uuid",
      "name": "Jane Smith"
    },
    "basicSalary": 75000,
    "joinDate": "2024-01-15",
    "status": "active",
    "documents": [
      {
        "id": "uuid",
        "type": "resume",
        "fileName": "john_resume.pdf",
        "uploadedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### **POST /api/employees**
**Purpose**: Create new employee (Admin only)
**Headers**: `Authorization: Bearer token`, `Content-Type: application/json`
**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "departmentId": "uuid",
  "position": "Software Engineer",
  "managerId": "uuid",
  "basicSalary": 75000,
  "joinDate": "2024-01-15",
  "role": "employee"
}
```
**Response (201)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "employeeCode": "EMP001",
    "message": "Employee created successfully"
  }
}
```

### **PUT /api/employees/:id**
**Purpose**: Update employee details
**Headers**: `Authorization: Bearer token`, `Content-Type: application/json`
**Request Body**: (same as POST, partial updates allowed)
**Response (200)**:
```json
{
  "success": true,
  "message": "Employee updated successfully"
}
```

### **POST /api/employees/:id/documents**
**Purpose**: Upload employee documents
**Headers**: `Authorization: Bearer token`, `Content-Type: multipart/form-data`
**Request Body**: FormData with file and documentType
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "documentId": "uuid",
    "fileName": "document.pdf",
    "parsedData": {
      "name": "John Doe",
      "email": "john@email.com",
      "experience": 5,
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }
}
```

---

## ⏰ **Attendance Management APIs**

### **GET /api/attendance/my-attendance**
**Purpose**: Get current user's attendance
**Headers**: `Authorization: Bearer token`
**Query Parameters**: 
- `startDate=2024-01-01`
- `endDate=2024-01-31`

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "todayStatus": {
      "date": "2024-01-15",
      "checkIn": "09:00:00",
      "checkOut": null,
      "status": "present",
      "totalHours": 0
    },
    "records": [
      {
        "date": "2024-01-15",
        "checkIn": "09:00:00",
        "checkOut": "18:00:00",
        "totalHours": 8.5,
        "status": "present"
      }
    ],
    "summary": {
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "averageHours": 8.2
    }
  }
}
```

### **POST /api/attendance/check-in**
**Purpose**: Record check-in time
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "timestamp": "2024-01-15T09:00:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "checkInTime": "09:00:00",
    "message": "Checked in successfully"
  }
}
```

### **POST /api/attendance/check-out**
**Purpose**: Record check-out time
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "timestamp": "2024-01-15T18:00:00Z"
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "checkOutTime": "18:00:00",
    "totalHours": 8.5,
    "message": "Checked out successfully"
  }
}
```

### **GET /api/attendance/team** (Manager only)
**Purpose**: Get team attendance
**Headers**: `Authorization: Bearer token`
**Query Parameters**: `date=2024-01-15`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "teamAttendance": [
      {
        "employeeId": "uuid",
        "name": "John Doe",
        "status": "present",
        "checkIn": "09:00:00",
        "checkOut": "18:00:00",
        "totalHours": 8.5
      }
    ],
    "summary": {
      "totalTeamMembers": 10,
      "present": 8,
      "absent": 2,
      "late": 1
    }
  }
}
```

---

## 🏖️ **Leave Management APIs**

### **GET /api/leave/balance**
**Purpose**: Get leave balance for current user
**Headers**: `Authorization: Bearer token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "balances": [
      {
        "leaveType": {
          "id": "uuid",
          "name": "Annual",
          "maxDaysPerYear": 30
        },
        "year": 2024,
        "allocatedDays": 30,
        "usedDays": 5,
        "remainingDays": 25
      }
    ]
  }
}
```

### **POST /api/leave/apply**
**Purpose**: Apply for leave
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "leaveTypeId": "uuid",
  "startDate": "2024-02-01",
  "endDate": "2024-02-03",
  "reason": "Family vacation",
  "totalDays": 3
}
```
**Response (201)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "status": "pending",
    "message": "Leave application submitted successfully"
  }
}
```

### **GET /api/leave/applications**
**Purpose**: Get leave applications
**Headers**: `Authorization: Bearer token`
**Query Parameters**: 
- `status=pending` (filter by status)
- `year=2024` (filter by year)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "uuid",
        "leaveType": {
          "name": "Annual"
        },
        "startDate": "2024-02-01",
        "endDate": "2024-02-03",
        "totalDays": 3,
        "reason": "Family vacation",
        "status": "pending",
        "appliedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### **GET /api/leave/approvals** (Manager only)
**Purpose**: Get pending leave approvals
**Headers**: `Authorization: Bearer token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "pendingApprovals": [
      {
        "id": "uuid",
        "employee": {
          "id": "uuid",
          "name": "John Doe"
        },
        "leaveType": "Annual",
        "startDate": "2024-02-01",
        "endDate": "2024-02-03",
        "totalDays": 3,
        "reason": "Family vacation",
        "appliedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### **PUT /api/leave/applications/:id/approve**
**Purpose**: Approve/reject leave application (Manager only)
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "action": "approve", // or "reject"
  "comments": "Approved for the requested dates"
}
```
**Response (200)**:
```json
{
  "success": true,
  "message": "Leave application approved successfully"
}
```

---

## 💰 **Payroll APIs**

### **GET /api/payroll/payslips**
**Purpose**: Get payslips for current user
**Headers**: `Authorization: Bearer token`
**Query Parameters**: 
- `month=1` (1-12)
- `year=2024`

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "payslips": [
      {
        "id": "uuid",
        "month": 1,
        "year": 2024,
        "basicSalary": 75000,
        "hraAmount": 30000,
        "otherAllowances": 5000,
        "grossSalary": 110000,
        "pfDeduction": 9000,
        "taxDeduction": 15000,
        "otherDeductions": 1000,
        "totalDeductions": 25000,
        "netSalary": 85000,
        "generatedAt": "2024-02-01T00:00:00Z"
      }
    ]
  }
}
```

### **GET /api/payroll/payslips/:id/download**
**Purpose**: Download payslip PDF
**Headers**: `Authorization: Bearer token`
**Response**: PDF file download

### **POST /api/payroll/process** (Admin only)
**Purpose**: Process monthly payroll
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "month": 1,
  "year": 2024,
  "employeeIds": ["uuid1", "uuid2"] // optional, all if not provided
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "payrollRunId": "uuid",
    "processedEmployees": 150,
    "totalAmount": 12500000,
    "status": "completed"
  }
}
```

---

## 📊 **Performance Management APIs**

### **GET /api/performance/goals**
**Purpose**: Get employee goals
**Headers**: `Authorization: Bearer token`
**Query Parameters**: `cycleId=uuid` (optional)
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "uuid",
        "title": "Complete React Migration",
        "description": "Migrate legacy components to React",
        "targetValue": "100% migration",
        "weightPercentage": 30,
        "achievementPercentage": 75,
        "status": "active",
        "cycle": {
          "id": "uuid",
          "name": "Q1 2024"
        }
      }
    ]
  }
}
```

### **POST /api/performance/goals**
**Purpose**: Create new goal
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "cycleId": "uuid",
  "title": "Complete React Migration",
  "description": "Migrate legacy components to React",
  "targetValue": "100% migration",
  "weightPercentage": 30
}
```
**Response (201)**:
```json
{
  "success": true,
  "data": {
    "goalId": "uuid",
    "message": "Goal created successfully"
  }
}
```

### **PUT /api/performance/goals/:id**
**Purpose**: Update goal progress
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "achievementPercentage": 85,
  "status": "active"
}
```
**Response (200)**:
```json
{
  "success": true,
  "message": "Goal updated successfully"
}
```

### **GET /api/performance/reviews**
**Purpose**: Get performance reviews
**Headers**: `Authorization: Bearer token`
**Query Parameters**:
- `employeeId=uuid` (Manager only)
- `cycleId=uuid`

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "employee": {
          "id": "uuid",
          "name": "John Doe"
        },
        "reviewer": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "cycle": {
          "name": "Annual Review 2024"
        },
        "overallRating": 4.2,
        "goalsAchievementScore": 85,
        "status": "completed",
        "completedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### **POST /api/performance/reviews**
**Purpose**: Create/submit performance review
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "employeeId": "uuid",
  "cycleId": "uuid",
  "overallRating": 4.2,
  "strengths": "Excellent technical skills and leadership",
  "areasForImprovement": "Could improve communication skills",
  "goalsAchievementScore": 85,
  "managerComments": "Great performance this year",
  "employeeComments": "Looking forward to new challenges"
}
```
**Response (201)**:
```json
{
  "success": true,
  "data": {
    "reviewId": "uuid",
    "message": "Performance review submitted successfully"
  }
}
```

---

## 🤖 **AI Features APIs**

### **POST /api/ai/resume-parse**
**Purpose**: Parse uploaded resume using AI
**Headers**: `Authorization: Bearer token`, `Content-Type: multipart/form-data`
**Request Body**: FormData with resume file
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "parsedData": {
      "name": "John Doe",
      "email": "john@email.com",
      "phone": "+1234567890",
      "experienceYears": 5,
      "currentCompany": "Tech Corp",
      "noticePeriod": "30 days",
      "skills": ["JavaScript", "React", "Node.js", "Python"],
      "education": [
        {
          "degree": "Bachelor of Computer Science",
          "institution": "University of Technology",
          "year": 2019
        }
      ],
      "previousCompanies": ["StartupXYZ", "BigTech Inc"],
      "summary": "Experienced software engineer with 5 years in full-stack development"
    },
    "confidenceScore": 0.92
  }
}
```

### **POST /api/ai/generate-feedback**
**Purpose**: Generate AI feedback for performance review
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "employeeId": "uuid",
  "performanceData": {
    "goalsAchievement": 85,
    "attendanceRate": 95,
    "projectsCompleted": 8,
    "skillsImproved": ["React", "Leadership"]
  },
  "reviewType": "annual"
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "generatedFeedback": {
      "strengths": "John has demonstrated exceptional technical skills this year, particularly in React development. His attendance rate of 95% shows strong commitment, and completing 8 projects showcases excellent productivity.",
      "areasForImprovement": "While technical skills are strong, focusing on cross-team collaboration and mentoring junior developers could further enhance John's impact on the organization.",
      "recommendations": "Consider enrolling John in leadership development programs and assigning him mentorship responsibilities for new team members."
    },
    "confidenceScore": 0.88
  }
}
```

### **GET /api/ai/attrition-prediction/:employeeId**
**Purpose**: Get attrition risk prediction for employee
**Headers**: `Authorization: Bearer token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "riskScore": 0.75,
    "riskLevel": "high",
    "contributingFactors": [
      {
        "factor": "Low performance ratings",
        "impact": 0.3
      },
      {
        "factor": "Increased absence frequency",
        "impact": 0.25
      },
      {
        "factor": "No recent promotions",
        "impact": 0.2
      }
    ],
    "recommendations": [
      "Schedule one-on-one meeting to discuss career goals",
      "Consider performance improvement plan",
      "Explore internal mobility opportunities"
    ],
    "predictionDate": "2024-01-15",
    "modelVersion": "v1.2"
  }
}
```

### **POST /api/ai/detect-anomalies**
**Purpose**: Run anomaly detection on data
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "dataType": "payroll", // or "attendance"
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "employeeIds": ["uuid1", "uuid2"] // optional
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "id": "uuid",
        "entityType": "payroll",
        "entityId": "payslip_uuid",
        "anomalyType": "Unusually high salary",
        "severity": "high",
        "description": "Employee salary 40% higher than department average",
        "detectedAt": "2024-01-15T10:00:00Z",
        "affectedEmployee": {
          "id": "uuid",
          "name": "John Doe"
        }
      }
    ],
    "summary": {
      "totalAnomalies": 5,
      "highSeverity": 1,
      "mediumSeverity": 2,
      "lowSeverity": 2
    }
  }
}
```

### **POST /api/ai/chatbot**
**Purpose**: HR Chatbot conversation
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "message": "What is my leave balance?",
  "sessionId": "session_uuid",
  "context": {
    "employeeId": "uuid"
  }
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "response": "Your current leave balance is: Annual Leave: 25 days, Sick Leave: 10 days, Personal Leave: 3 days. Would you like to apply for leave?",
    "intent": "leave_balance_inquiry",
    "confidenceScore": 0.95,
    "suggestedActions": [
      {
        "text": "Apply for Leave",
        "action": "navigate",
        "target": "/leave/apply"
      }
    ],
    "sessionId": "session_uuid"
  }
}
```

### **POST /api/ai/smart-reports**
**Purpose**: Generate AI-powered reports and insights
**Headers**: `Authorization: Bearer token`
**Request Body**:
```json
{
  "reportType": "team_performance",
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  },
  "teamId": "uuid"
}
```
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "summary": "The Engineering team showed strong performance in January 2024 with an average goal achievement of 87%. Attendance remained consistent at 94%, and the team completed 45 projects successfully.",
    "keyInsights": [
      "Top performer: John Doe with 95% goal achievement",
      "Attendance improved by 3% compared to previous month",
      "React migration project ahead of schedule"
    ],
    "recommendations": [
      "Consider promoting high performers",
      "Address attendance issues with 2 team members",
      "Allocate more resources to mobile development"
    ],
    "metrics": {
      "averageGoalAchievement": 87,
      "attendanceRate": 94,
      "projectsCompleted": 45,
      "teamSatisfaction": 4.2
    }
  }
}
```

---

## 📈 **Reports & Analytics APIs**

### **GET /api/reports/dashboard-stats**
**Purpose**: Get dashboard statistics (role-based)
**Headers**: `Authorization: Bearer token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalEmployees": 150,
      "presentToday": 142,
      "onLeave": 5,
      "pendingApprovals": 8,
      "attritionRisk": 12,
      "payrollProcessed": true
    },
    "charts": {
      "attendanceTrend": [
        {"date": "2024-01-01", "percentage": 95},
        {"date": "2024-01-02", "percentage": 94}
      ],
      "departmentDistribution": [
        {"department": "Engineering", "count": 60},
        {"department": "Sales", "count": 40}
      ]
    }
  }
}
```

### **GET /api/reports/attendance**
**Purpose**: Generate attendance reports
**Headers**: `Authorization: Bearer token`
**Query Parameters**:
- `startDate=2024-01-01`
- `endDate=2024-01-31`
- `departmentId=uuid` (optional)
- `format=json` (json/csv/pdf)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "report": {
      "period": "January 2024",
      "summary": {
        "totalWorkingDays": 22,
        "averageAttendance": 94.5,
        "totalEmployees": 150
      },
      "departmentWise": [
        {
          "department": "Engineering",
          "attendanceRate": 95.2,
          "employeeCount": 60
        }
      ],
      "employeeDetails": [
        {
          "employeeId": "uuid",
          "name": "John Doe",
          "presentDays": 21,
          "absentDays": 1,
          "attendanceRate": 95.5
        }
      ]
    }
  }
}
```

---

## ⚙️ **System Configuration APIs**

### **GET /api/config/leave-types**
**Purpose**: Get leave types configuration
**Headers**: `Authorization: Bearer token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "leaveTypes": [
      {
        "id": "uuid",
        "name": "Annual",
        "description": "Annual vacation leave",
        "maxDaysPerYear": 30,
        "isActive": true
      }
    ]
  }
}
```

### **GET /api/config/departments**
**Purpose**: Get departments list
**Headers**: `Authorization: Bearer token`
**Response (200)**:
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "uuid",
        "name": "Engineering",
        "description": "Software development team",
        "manager": {
          "id": "uuid",
          "name": "Jane Smith"
        },
        "employeeCount": 60
      }
    ]
  }
}
```

---

## 🔒 **Error Responses**

### **Standard Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### **Common HTTP Status Codes**:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate data)
- **500**: Internal Server Error

---

## 🔐 **Authentication & Authorization**

### **Headers Required**:
- `Authorization: Bearer {jwt_token}` (for all protected endpoints)
- `Content-Type: application/json` (for JSON requests)
- `Content-Type: multipart/form-data` (for file uploads)

### **Role-Based Access**:
- **Admin**: Full access to all endpoints
- **Manager**: Team-related endpoints + own data
- **Employee**: Own data only + limited read access

This comprehensive API specification covers all functionality required by the UI screens and supports the modular backend architecture with independent services.
