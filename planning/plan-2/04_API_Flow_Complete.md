# 🔌 Complete API Flow Design - AI-Enhanced HRMS

## 📌 Assignment Context

This document specifies the exact API endpoints for the HRMS platform following the multi-agent backend architecture from `planning/Workflow/backend.md`. Each service is designed for independent development by different AI agents.

## 🏗️ Multi-Agent Service Architecture

### **Service Distribution**:
- **auth-service** - Authentication & user management
- **employee-service** - Employee profiles & management
- **attendance-service** - Time tracking & attendance
- **leave-service** - Leave applications & approvals
- **payroll-service** - Salary processing & payslips
- **performance-service** - Goals & reviews
- **ai-service** - All AI features (chatbot, predictions, etc.)
- **reports-service** - Reporting & analytics

## 🔐 Authentication Service APIs

### **Base URL**: `/api/auth`

#### **POST /api/auth/login**
```json
// Request Headers
{
  "Content-Type": "application/json"
}

// Request Body
{
  "email": "user@company.com",
  "password": "password123",
  "role": "admin" // Optional role selection
}

// Success Response (200)
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@company.com",
      "role": "admin",
      "employee": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "department": "HR"
      }
    }
  },
  "message": "Login successful"
}

// Error Response (401)
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_FAILED"
}
```

#### **POST /api/auth/refresh**
```json
// Request Headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer refresh_token"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "accessToken": "new_access_token"
  }
}
```

#### **POST /api/auth/logout**
```json
// Request Headers
{
  "Authorization": "Bearer access_token"
}

// Success Response (200)
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 👥 Employee Service APIs

### **Base URL**: `/api/employees`

#### **GET /api/employees**
```json
// Request Headers
{
  "Authorization": "Bearer access_token"
}

// Query Parameters
{
  "page": 1,
  "limit": 20,
  "search": "john",
  "department": "HR",
  "status": "active"
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
        "department": "HR",
        "position": "HR Manager",
        "status": "active",
        "hireDate": "2023-01-15"
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

#### **POST /api/employees**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-05-15",
  "hireDate": "2024-01-01",
  "departmentId": "uuid",
  "managerId": "uuid",
  "position": "Software Engineer",
  "salary": 75000,
  "address": "123 Main St, City, State"
}

// Success Response (201)
{
  "success": true,
  "data": {
    "employee": {
      "id": "uuid",
      "employeeCode": "EMP152",
      // ... employee data
    }
  },
  "message": "Employee created successfully"
}
```

#### **GET /api/employees/:id**
```json
// Request Headers
{
  "Authorization": "Bearer access_token"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "employee": {
      "id": "uuid",
      "employeeCode": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@company.com",
      "phone": "+1234567890",
      "dateOfBirth": "1985-03-20",
      "hireDate": "2023-01-15",
      "department": {
        "id": "uuid",
        "name": "Human Resources"
      },
      "manager": {
        "id": "uuid",
        "firstName": "Sarah",
        "lastName": "Johnson"
      },
      "position": "HR Manager",
      "salary": 80000,
      "status": "active"
    }
  }
}
```

## ⏰ Attendance Service APIs

### **Base URL**: `/api/attendance`

#### **POST /api/attendance/checkin**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
{
  "employeeId": 123, // Optional for employees (auto-detected)
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

#### **POST /api/attendance/checkout**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
{
  "employeeId": 123, // Optional for employees
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

#### **GET /api/attendance/history**
```json
// Request Headers
{
  "Authorization": "Bearer access_token"
}

// Query Parameters
{
  "employeeId": 123, // Optional for employees (auto-detected)
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "page": 1,
  "limit": 20
}

// Success Response (200)
{
  "success": true,
  "data": {
    "attendance": [
      {
        "id": 1,
        "workDate": "2024-01-15",
        "checkInTime": "2024-01-15T09:00:00Z",
        "checkOutTime": "2024-01-15T18:00:00Z",
        "totalHours": 9.0,
        "status": "present"
      }
    ],
    "summary": {
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "totalHours": 162.0
    }
  }
}
```

## 🏖️ Leave Service APIs

### **Base URL**: `/api/leave`

#### **POST /api/leave/applications**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
{
  "employeeId": 123, // Optional for employees
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

#### **GET /api/leave/balance**
```json
// Request Headers
{
  "Authorization": "Bearer access_token"
}

// Query Parameters
{
  "employeeId": 123, // Optional for employees
  "year": 2024
}

// Success Response (200)
{
  "success": true,
  "data": {
    "balances": [
      {
        "leaveType": "Annual Leave",
        "allocated": 30,
        "used": 10,
        "remaining": 20
      },
      {
        "leaveType": "Sick Leave",
        "allocated": 12,
        "used": 2,
        "remaining": 10
      }
    ]
  }
}
```

#### **PUT /api/leave/applications/:id/approve**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
{
  "notes": "Approved for vacation"
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

### **Base URL**: `/api/payroll`

#### **GET /api/payroll/payslips**
```json
// Request Headers
{
  "Authorization": "Bearer access_token"
}

// Query Parameters
{
  "employeeId": 123, // Optional for employees
  "year": 2024,
  "month": 1
}

// Success Response (200)
{
  "success": true,
  "data": {
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
        "status": "paid"
      }
    ]
  }
}
```

#### **POST /api/payroll/process**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
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

### **Base URL**: `/api/performance`

#### **POST /api/performance/goals**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

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

#### **POST /api/performance/reviews**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

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

### **Base URL**: `/api/ai`

#### **POST /api/ai/chatbot/query**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
{
  "message": "What is my leave balance?",
  "sessionId": "session_123" // Optional
}

// Success Response (200)
{
  "success": true,
  "data": {
    "message": "Your current leave balance is: Annual Leave: 20 days, Sick Leave: 10 days",
    "intent": "leave_balance",
    "quickActions": [
      {
        "text": "Apply for Leave",
        "action": "navigate",
        "target": "/leave/apply"
      }
    ],
    "responseTime": 1200
  }
}
```

#### **GET /api/ai/attrition/predictions**
```json
// Request Headers
{
  "Authorization": "Bearer access_token"
}

// Success Response (200)
{
  "success": true,
  "data": {
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
  }
}
```

#### **POST /api/ai/resume/parse**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "multipart/form-data"
}

// Request Body (Form Data)
{
  "resume": "file.pdf"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "parsedData": {
      "candidateName": "Jane Smith",
      "email": "jane.smith@email.com",
      "phone": "+1234567890",
      "skills": ["JavaScript", "React", "Node.js"],
      "experienceYears": 5,
      "education": "Bachelor's in Computer Science"
    }
  },
  "message": "Resume parsed successfully"
}
```

## 📈 Reports Service APIs

### **Base URL**: `/api/reports`

#### **POST /api/reports/generate**
```json
// Request Headers
{
  "Authorization": "Bearer access_token",
  "Content-Type": "application/json"
}

// Request Body
{
  "reportType": "attendance_summary",
  "parameters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "departmentId": "uuid"
  },
  "format": "pdf"
}

// Success Response (202)
{
  "success": true,
  "data": {
    "reportId": "uuid",
    "status": "generating",
    "estimatedCompletion": "2024-01-15T10:05:00Z"
  },
  "message": "Report generation started"
}
```

## 🔒 Common Error Responses

```json
// 400 Bad Request
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}

// 401 Unauthorized
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}

// 403 Forbidden
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "PERMISSION_DENIED"
}

// 404 Not Found
{
  "success": false,
  "error": "Resource not found",
  "code": "NOT_FOUND"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## 📋 **API Design Assumptions**

1. **Authentication**: JWT tokens with 15-minute access token expiry
2. **Pagination**: Default limit of 20 items per page
3. **Date Format**: ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
4. **File Uploads**: Multipart form data for file uploads
5. **Rate Limiting**: 100 requests per minute per user
6. **Response Format**: Consistent JSON structure with success/error flags
7. **Error Handling**: Standardized error codes and messages
8. **Versioning**: API versioning through URL path (/api/v1/)
9. **CORS**: Enabled for frontend domain
10. **Security**: All endpoints require authentication except login

## 🔄 **Service-to-Service Communication**

### **Internal API Calls** (Between Services)
```json
// Employee Service calling Auth Service
GET /internal/auth/validate/:userId
Authorization: Service-Token service_secret

// AI Service calling Employee Service
GET /internal/employees/:id/data
Authorization: Service-Token service_secret

// Reports Service calling multiple services
GET /internal/attendance/summary/:employeeId
GET /internal/leave/summary/:employeeId
```

### **Event-Based Communication** (Optional)
```javascript
// Employee Service publishes event
EventBus.publish('employee.created', {
  employeeId: 'uuid',
  userId: 'uuid',
  department: 'HR'
});

// Payroll Service subscribes to event
EventBus.subscribe('employee.created', (data) => {
  PayrollService.createEmployeePayrollRecord(data);
});
```

## 🧪 **API Testing Examples**

### **Authentication Flow Test**
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password123"}'

# Use token for subsequent requests
curl -X GET http://localhost:3000/api/employees \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### **Employee Management Test**
```bash
# Create employee
curl -X POST http://localhost:3000/api/employees \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@company.com"}'

# Get employee details
curl -X GET http://localhost:3000/api/employees/uuid \
  -H "Authorization: Bearer token"
```

This API design supports the multi-agent backend architecture where each service can be developed independently while maintaining consistent interfaces and security standards.
