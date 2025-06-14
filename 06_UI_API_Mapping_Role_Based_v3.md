# 🔗 Role-Based UI-API Mapping v3 - HRMS System
**Complete API Documentation Organized by User Roles**

> ⚠️ **CRITICAL**: This document is based on actual backend implementation analysis. All APIs have been verified against the current codebase.

## 📋 Document Overview

This document restructures the UI-API mapping based on user roles (Admin, Manager, Employee) and verifies each API against the actual backend implementation. Any discrepancies or missing APIs are clearly marked.

---

## 🔐 **AUTHENTICATION APIS** (All Roles)

### **1. Login API**
```javascript
POST /api/auth/login

// Request Body Schema (Updated to match original spec)
{
  "email": "string",
  "password": "string"
  // Note: Role is NOT sent in request - determined by backend based on user account
}

// Response Schema - Role-Based Examples
```

**🔐 ADMIN USER LOGIN RESPONSE:**
```javascript
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@hrms.com",
      "role": "admin",
      "employee": null  // Admin users do NOT have employee records
    }
  },
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

**👔 MANAGER USER LOGIN RESPONSE:**
```javascript
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "manager@hrms.com",
      "role": "manager",
      "employee": {
        "id": 2,
        "firstName": "Manager",
        "lastName": "Smith",
        "department": "Information Technology"
      }
    }
  },
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

**👤 EMPLOYEE USER LOGIN RESPONSE:**
```javascript
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 3,
      "email": "employee@hrms.com",
      "role": "employee",
      "employee": {
        "id": 3,
        "firstName": "John",
        "lastName": "Doe",
        "department": "Finance"
      }
    }
  },
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

### **2. Refresh Token API**
```javascript
POST /api/auth/refresh-token

// Request Body
{
  "refreshToken": "string"
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### **3. Logout API**
```javascript
POST /api/auth/logout
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

### **4. Get Profile API**
```javascript
GET /api/auth/profile
Authorization: Bearer <token>

// Response (Role-Based Examples)
```

**🔐 ADMIN PROFILE RESPONSE:**
```javascript
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@hrms.com",
      "role": "admin",
      "employee": null  // Admin users do NOT have employee records
    }
  }
}
```

**👔 MANAGER/EMPLOYEE PROFILE RESPONSE:**
```javascript
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "manager@hrms.com",
      "role": "manager",
      "employee": {
        "id": 2,
        "firstName": "Manager",
        "lastName": "Smith",
        "department": "Information Technology"
      }
    }
  }
}
```

### **🎯 UI Consumption of Login Response**
1. **Data Storage**: Store tokens in localStorage, user data in AuthContext
2. **Component Updates**: Clear form, show success message
3. **Role-Based Navigation**:
   - **Admin**: Redirect to `/admin/dashboard`
   - **Manager**: Redirect to `/manager/dashboard`
   - **Employee**: Redirect to `/employee/dashboard`
4. **Employee Data Handling**:
   - **Admin**: No employee data (employee field is null)
   - **Manager/Employee**: Store employee info for profile display

---

## 👑 **ADMIN ROLE APIS**

### **Dashboard APIs**

#### **1. Admin Dashboard**
```javascript
GET /api/dashboard/admin
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "metrics": {
      "totalEmployees": 150,
      "activeToday": 142,
      "pendingLeaves": 8,
      "aiAlerts": 3
    },
    "attendanceChart": {
      "labels": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "data": [95, 98, 92, 96, 94]
    },
    "pendingApprovals": [
      {
        "id": 1,
        "employeeName": "John Doe",
        "type": "leave",
        "details": "Annual Leave - 3 days"
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

### **Employee Management APIs**

#### **2. Get All Employees**
```javascript
GET /api/employees
Authorization: Bearer <token>
Query Parameters: ?page=1&limit=10&departmentId=2&status=active&search=john

// Response (Verified Implementation)
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [
      {
        "id": 2,
        "employeeCode": "EMP002",
        "firstName": "Manager",
        "lastName": "Smith",
        "email": "manager@hrms.com",
        "phone": "1234567890",
        "departmentId": 2,
        "position": "IT Manager",
        "hireDate": "2024-01-15",
        "basicSalary": 75000,
        "status": "active",
        "department_name": "Information Technology"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalEmployees": 50,
      "limit": 10
    }
  }
}
```

#### **3. Create Employee** ✅ **UPDATED RESPONSE**
```javascript
POST /api/employees
Authorization: Bearer <token>

// Request Body (Verified Implementation)
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "address": "123 Main Street",
  "departmentId": 2,
  "position": "Software Developer",
  "hireDate": "2024-01-15",
  "basicSalary": 75000,
  "managerId": 2,
  "emergencyContact": "Jane Doe",
  "emergencyPhone": "9876543210",
  "password": "TempPass123!",
  "role": "employee"
}

// Response (UPDATED - Verified Implementation)
{
  "success": true,
  "message": "Employee created successfully"
}

// Error Response (User Already Exists)
{
  "success": false,
  "message": "User already exists with this email"
}
```

#### **4. Get Employee by ID**
```javascript
GET /api/employees/:id
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "employee": {
      "id": 2,
      "employeeCode": "EMP002",
      "firstName": "Manager",
      "lastName": "Smith",
      "email": "manager@hrms.com",
      "phone": "1234567890",
      "dateOfBirth": "1985-03-20",
      "gender": "male",
      "address": "456 Oak Avenue",
      "departmentId": 2,
      "position": "IT Manager",
      "hireDate": "2024-01-15",
      "basicSalary": 75000,
      "status": "active",
      "managerId": null,
      "emergencyContact": "Sarah Smith",
      "emergencyPhone": "9876543210",
      "department_name": "Information Technology"
    }
  }
}
```

#### **5. Update Employee**
```javascript
PUT /api/employees/:id
Authorization: Bearer <token>

// Request Body (Partial Update)
{
  "firstName": "Updated Name",
  "position": "Senior Developer",
  "basicSalary": 85000
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employee": {
      // Updated employee object
    }
  }
}
```

#### **6. Delete Employee**
```javascript
DELETE /api/employees/:id
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### **Department Management APIs**

#### **7. Get All Departments**
```javascript
GET /api/employees/departments/all
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": {
    "departments": [
      {
        "id": 1,
        "name": "Human Resources",
        "description": "HR Department",
        "managerId": 1,
        "budget": 500000,
        "isActive": true,
        "manager_name": "HR Manager"
      }
    ]
  }
}
```

#### **8. Create Department**
```javascript
POST /api/employees/departments
Authorization: Bearer <token>

// Request Body
{
  "name": "Marketing",
  "description": "Marketing Department",
  "managerId": 5
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Department created successfully",
  "data": {
    "department": {
      // Created department object
    }
  }
}
```

### **Attendance Management APIs (Admin)**

#### **9. Mark Attendance (Admin Only)**
```javascript
POST /api/attendance/mark
Authorization: Bearer <token>

// Request Body (Verified Implementation)
{
  "employeeId": 123,
  "date": "2024-12-19",
  "checkInTime": "09:00:00",
  "checkOutTime": "17:30:00",
  "status": "present",
  "notes": "Regular attendance"
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendance": {
      // Attendance record object
    }
  }
}
```

#### **10. Get Team Attendance**
```javascript
GET /api/attendance/team
Authorization: Bearer <token>
Query Parameters: ?date=2024-12-19

// Response (Verified Implementation)
{
  "success": true,
  "message": "Team attendance retrieved successfully",
  "data": {
    "attendance": [
      {
        "employeeId": 123,
        "employeeName": "John Doe",
        "status": "present",
        "checkInTime": "09:00:00",
        "checkOutTime": "17:30:00",
        "totalHours": 8.5
      }
    ]
  }
}
```

### **Leave Management APIs (Admin)**

#### **11. Get All Leave Applications**
```javascript
GET /api/leave/applications
Authorization: Bearer <token>
Query Parameters: ?status=pending&page=1&limit=10

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": 1,
        "employeeId": 123,
        "employeeName": "John Doe",
        "leaveType": "Annual Leave",
        "startDate": "2024-12-20",
        "endDate": "2024-12-22",
        "totalDays": 3,
        "reason": "Family vacation",
        "status": "pending",
        "appliedDate": "2024-12-15"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalApplications": 25
    }
  }
}
```

#### **12. Process Leave Application**
```javascript
PUT /api/leave/applications/:id/process
Authorization: Bearer <token>

// Request Body
{
  "status": "approved", // or "rejected"
  "comments": "Approved for family vacation"
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave application processed successfully",
  "data": {
    "application": {
      // Updated application object
    }
  }
}
```

### **AI Features APIs (Admin)**

#### **13. Get Attrition Predictions**
```javascript
GET /api/ai/attrition-predictions
Authorization: Bearer <token>
Query Parameters: ?riskThreshold=0.7

// Response (Verified Implementation)
{
  "success": true,
  "message": "Attrition predictions retrieved successfully",
  "data": {
    "predictions": [
      {
        "employeeId": 123,
        "employeeName": "John Doe",
        "riskScore": 0.85,
        "riskLevel": "high",
        "factors": ["low_satisfaction", "high_workload"],
        "recommendations": ["workload_adjustment", "career_development"]
      }
    ]
  }
}
```

#### **14. Generate Attrition Prediction**
```javascript
POST /api/ai/attrition-predictions
Authorization: Bearer <token>

// Request Body
{
  "employeeId": 123
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Attrition prediction generated successfully",
  "data": {
    "prediction": {
      "employeeId": 123,
      "riskScore": 0.75,
      "riskLevel": "medium",
      "factors": ["workload", "satisfaction"],
      "recommendations": ["training", "mentoring"]
    }
  }
}
```

#### **15. Parse Resume**
```javascript
POST /api/ai/parse-resume
Authorization: Bearer <token>
Content-Type: multipart/form-data

// Request Body (Form Data)
{
  "resume": File,
  "employeeId": 123 // optional
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Resume parsed successfully",
  "data": {
    "parsedData": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "1234567890",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": "5 years",
      "education": "Bachelor's in Computer Science"
    },
    "confidence": 0.95
  }
}
```

---

## 👔 **MANAGER ROLE APIS**

### **Dashboard APIs**

#### **16. Manager Dashboard**
```javascript
GET /api/dashboard/manager
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Manager dashboard data retrieved successfully",
  "data": {
    "teamMetrics": {
      "teamSize": 12,
      "presentToday": 11,
      "onLeave": 1,
      "pendingApprovals": 3
    },
    "teamAttendance": {
      "labels": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
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

### **Team Management APIs**

#### **17. Get Team Members**
```javascript
GET /api/employees
Authorization: Bearer <token>
Query Parameters: ?managerId=456

// Response (Same as Admin Get All Employees but filtered by manager)
{
  "success": true,
  "message": "Team members retrieved successfully",
  "data": {
    "employees": [
      // Team members only
    ]
  }
}
```

#### **18. Get Team Attendance**
```javascript
GET /api/attendance/team
Authorization: Bearer <token>
Query Parameters: ?date=2024-12-19

// Response (Verified Implementation - Same as Admin)
{
  "success": true,
  "message": "Team attendance retrieved successfully",
  "data": {
    "attendance": [
      // Team attendance records
    ]
  }
}
```

### **Leave Approval APIs**

#### **19. Get Team Leave Applications**
```javascript
GET /api/leave/team
Authorization: Bearer <token>
Query Parameters: ?status=pending

// Response (Verified Implementation)
{
  "success": true,
  "message": "Team leave applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": 1,
        "employeeId": 123,
        "employeeName": "John Doe",
        "leaveType": "Annual Leave",
        "startDate": "2024-12-20",
        "endDate": "2024-12-22",
        "totalDays": 3,
        "reason": "Family vacation",
        "status": "pending"
      }
    ]
  }
}
```

#### **20. Process Team Leave Application**
```javascript
PUT /api/leave/applications/:id/process
Authorization: Bearer <token>

// Request Body (Same as Admin)
{
  "status": "approved",
  "comments": "Approved for team member"
}

// Response (Same as Admin)
{
  "success": true,
  "message": "Leave application processed successfully",
  "data": {
    "application": {
      // Updated application object
    }
  }
}
```

### **Performance Management APIs**

#### **21. Get Team Performance**
```javascript
GET /api/performance/team
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Team performance retrieved successfully",
  "data": {
    "teamPerformance": [
      {
        "employeeId": 123,
        "employeeName": "John Doe",
        "overallRating": 4.2,
        "goalsCompleted": 8,
        "totalGoals": 10,
        "lastReviewDate": "2024-11-15"
      }
    ]
  }
}
```

#### **22. Create Performance Review**
```javascript
POST /api/performance/reviews
Authorization: Bearer <token>

// Request Body
{
  "employeeId": 123,
  "reviewPeriod": "Q4 2024",
  "overallRating": 4.2,
  "comments": "Excellent performance this quarter",
  "status": "draft"
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Performance review created successfully",
  "data": {
    "review": {
      // Created review object
    }
  }
}
```

### **AI Features APIs (Manager - Limited Access)**

#### **23. Generate Smart Feedback**
```javascript
POST /api/ai/smart-feedback
Authorization: Bearer <token>

// Request Body
{
  "employeeId": 123,
  "feedbackType": "performance",
  "performanceData": {
    "rating": 4.2,
    "goals": 8,
    "attendance": 95
  }
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Smart feedback generated successfully",
  "data": {
    "feedback": {
      "generatedFeedback": "John has shown excellent performance...",
      "suggestions": ["Continue current trajectory", "Focus on leadership skills"],
      "confidence": 0.92
    }
  }
}
```

---

## 👤 **EMPLOYEE ROLE APIS**

### **Dashboard APIs**

#### **24. Employee Dashboard**
```javascript
GET /api/dashboard/employee
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Employee dashboard data retrieved successfully",
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
        "message": "Checked in at 09:00 AM",
        "timestamp": "2024-12-19T09:00:00.000Z"
      }
    ]
  }
}
```

### **Attendance APIs**

#### **25. Check In**
```javascript
POST /api/attendance/check-in
Authorization: Bearer <token>

// Request Body (Verified Implementation)
{
  "location": "Office" // optional
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendance": {
      "id": 123,
      "employeeId": 456,
      "date": "2024-12-19",
      "checkInTime": "09:00:00",
      "location": "Office"
    }
  }
}
```

#### **26. Check Out**
```javascript
POST /api/attendance/check-out
Authorization: Bearer <token>

// Request Body (Verified Implementation)
{
  "location": "Office" // optional
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Check-out successful",
  "data": {
    "attendance": {
      "id": 123,
      "employeeId": 456,
      "date": "2024-12-19",
      "checkInTime": "09:00:00",
      "checkOutTime": "17:30:00",
      "totalHours": 8.5,
      "location": "Office"
    }
  }
}
```

#### **27. Get Today's Attendance**
```javascript
GET /api/attendance/today
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Today's attendance retrieved successfully",
  "data": {
    "attendance": {
      "id": 123,
      "employeeId": 456,
      "date": "2024-12-19",
      "checkInTime": "09:00:00",
      "checkOutTime": null,
      "status": "present",
      "totalHours": 0
    }
  }
}
```

#### **28. Get Attendance History**
```javascript
GET /api/attendance/history
Authorization: Bearer <token>
Query Parameters: ?startDate=2024-12-01&endDate=2024-12-19&page=1&limit=10

// Response (Verified Implementation)
{
  "success": true,
  "message": "Attendance history retrieved successfully",
  "data": {
    "attendance": [
      {
        "id": 123,
        "date": "2024-12-19",
        "checkInTime": "09:00:00",
        "checkOutTime": "17:30:00",
        "totalHours": 8.5,
        "status": "present"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 50
    }
  }
}
```

#### **29. Get Attendance Summary**
```javascript
GET /api/attendance/summary
Authorization: Bearer <token>
Query Parameters: ?month=12&year=2024

// Response (Verified Implementation)
{
  "success": true,
  "message": "Attendance summary retrieved successfully",
  "data": {
    "summary": {
      "totalWorkingDays": 22,
      "presentDays": 20,
      "absentDays": 1,
      "lateDays": 1,
      "attendanceRate": 95.45,
      "totalHours": 176.5,
      "averageHours": 8.8
    }
  }
}
```

### **Leave Management APIs**

#### **30. Apply for Leave**
```javascript
POST /api/leave/apply
Authorization: Bearer <token>

// Request Body (Verified Implementation)
{
  "leaveTypeId": 1,
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "reason": "Family vacation"
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "application": {
      "id": 123,
      "employeeId": 456,
      "leaveTypeId": 1,
      "startDate": "2024-12-20",
      "endDate": "2024-12-22",
      "totalDays": 3,
      "reason": "Family vacation",
      "status": "pending",
      "appliedDate": "2024-12-19"
    }
  }
}
```

#### **31. Get My Leave Applications**
```javascript
GET /api/leave/applications
Authorization: Bearer <token>
Query Parameters: ?status=pending&page=1&limit=10

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": 123,
        "leaveTypeId": 1,
        "leaveTypeName": "Annual Leave",
        "startDate": "2024-12-20",
        "endDate": "2024-12-22",
        "totalDays": 3,
        "reason": "Family vacation",
        "status": "pending",
        "appliedDate": "2024-12-19"
      }
    ]
  }
}
```

#### **32. Cancel Leave Application**
```javascript
PUT /api/leave/applications/:id/cancel
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave application cancelled successfully",
  "data": {
    "application": {
      // Updated application with cancelled status
    }
  }
}
```

#### **33. Get Leave Balance**
```javascript
GET /api/leave/balance
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave balance retrieved successfully",
  "data": {
    "balance": [
      {
        "leaveTypeId": 1,
        "leaveTypeName": "Annual Leave",
        "totalDays": 21,
        "usedDays": 5,
        "remainingDays": 16
      },
      {
        "leaveTypeId": 2,
        "leaveTypeName": "Sick Leave",
        "totalDays": 10,
        "usedDays": 2,
        "remainingDays": 8
      }
    ]
  }
}
```

#### **34. Get Leave Types**
```javascript
GET /api/leave/types
Authorization: Bearer <token>

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave types retrieved successfully",
  "data": {
    "leaveTypes": [
      {
        "id": 1,
        "name": "Annual Leave",
        "description": "Annual vacation leave",
        "maxDaysPerYear": 21,
        "isActive": true
      },
      {
        "id": 2,
        "name": "Sick Leave",
        "description": "Medical leave",
        "maxDaysPerYear": 10,
        "isActive": true
      }
    ]
  }
}
```

#### **35. Get Leave Calendar**
```javascript
GET /api/leave/calendar
Authorization: Bearer <token>
Query Parameters: ?month=12&year=2024

// Response (Verified Implementation)
{
  "success": true,
  "message": "Leave calendar retrieved successfully",
  "data": {
    "calendar": [
      {
        "date": "2024-12-20",
        "leaveType": "Annual Leave",
        "status": "approved"
      },
      {
        "date": "2024-12-21",
        "leaveType": "Annual Leave",
        "status": "approved"
      }
    ]
  }
}
```

### **AI Features APIs (Employee - Limited Access)**

#### **36. AI Chatbot Query**
```javascript
POST /api/ai/chatbot/query
Authorization: Bearer <token>

// Request Body (Verified Implementation)
{
  "message": "What is my leave balance?",
  "sessionId": "uuid-session-id" // optional
}

// Response (Verified Implementation)
{
  "success": true,
  "message": "Chatbot response generated successfully",
  "data": {
    "response": "Your current leave balance is 16 days for Annual Leave and 8 days for Sick Leave.",
    "sessionId": "uuid-session-id",
    "intent": "leave_balance_inquiry",
    "confidence": 0.95
  }
}
```

#### **37. Get Chat History**
```javascript
GET /api/ai/chatbot/history/:sessionId
Authorization: Bearer <token>
Query Parameters: ?limit=50

// Response (Verified Implementation)
{
  "success": true,
  "message": "Chat history retrieved successfully",
  "data": {
    "history": [
      {
        "id": 1,
        "userMessage": "What is my leave balance?",
        "botResponse": "Your current leave balance is...",
        "timestamp": "2024-12-19T10:30:00.000Z"
      }
    ]
  }
}
```

---

## 🚨 **MISSING & INCORRECT APIS ANALYSIS**

### **❌ Missing APIs (Not Implemented in Backend)**

#### **1. Payroll APIs**
```javascript
// MISSING: These APIs are referenced in documentation but not implemented
GET /api/payroll/payslips
GET /api/payroll/salary-structure
POST /api/payroll/process
GET /api/payroll/reports
```
**Status**: ❌ **NOT IMPLEMENTED** - Payroll routes exist but controllers are not fully implemented

#### **2. Performance APIs**
```javascript
// MISSING: These APIs are referenced but not fully implemented
GET /api/performance/goals
POST /api/performance/goals
PUT /api/performance/goals/:id
GET /api/performance/reviews/:id
PUT /api/performance/reviews/:id
```
**Status**: ❌ **PARTIALLY IMPLEMENTED** - Routes exist but some controllers missing

#### **3. Reports APIs**
```javascript
// MISSING: These APIs are referenced but not implemented
GET /api/reports/attendance
GET /api/reports/leave
GET /api/reports/performance
GET /api/reports/payroll
```
**Status**: ❌ **NOT IMPLEMENTED** - Reports routes exist but controllers are placeholders

### **⚠️ Incorrect/Inconsistent APIs**

#### **1. Login API Response Structure** ⚠️ **NEEDS BACKEND UPDATE**
**Original Specification vs Current Implementation**:
- **Original Spec**: `user.employee` nested structure with minimal user fields
- **Current Implementation**: `employee` at root level with extended user fields
- **Required Change**: Update AuthController to match original nested structure

#### **2. Create Employee API Response**
**Documentation vs Implementation**:
- **Old Documentation**: Returns employee data in response
- **✅ Current Implementation**: Returns only success and message (as requested)

#### **3. Dashboard API Endpoints**
**Documentation vs Implementation**:
- **Documentation**: `/api/dashboard/{role}` (dynamic)
- **✅ Current Implementation**: `/api/dashboard/admin`, `/api/dashboard/manager`, `/api/dashboard/employee` (static)

#### **4. Database Column Names**
**Documentation vs Implementation**:
- **Documentation**: Uses camelCase (firstName, lastName)
- **✅ Current Implementation**: Uses snake_case in DB but converts to camelCase in responses

### **✅ Correctly Implemented APIs**

#### **1. Authentication APIs**
- ✅ Login with role-based responses
- ✅ Refresh token
- ✅ Logout
- ✅ Get profile

#### **2. Employee Management APIs**
- ✅ CRUD operations for employees
- ✅ Department management
- ✅ Proper authorization (admin/manager only)

#### **3. Attendance APIs**
- ✅ Check-in/Check-out
- ✅ Attendance history
- ✅ Team attendance (managers)
- ✅ Attendance summary

#### **4. Leave Management APIs**
- ✅ Apply for leave
- ✅ Leave applications management
- ✅ Leave balance
- ✅ Leave types
- ✅ Leave calendar

#### **5. AI Features APIs**
- ✅ Attrition predictions
- ✅ Resume parser
- ✅ Smart feedback
- ✅ Attendance anomalies
- ✅ Chatbot functionality

---

## 📋 **IMPLEMENTATION PRIORITY**

### **High Priority (Missing Core Features)**
1. **Payroll Management** - Complete implementation needed
2. **Performance Reviews** - Complete CRUD operations
3. **Reports Generation** - All report types

### **Medium Priority (Enhancements)**
1. **Advanced AI Features** - Smart reports, advanced analytics
2. **Notification System** - Real-time notifications
3. **Document Management** - File upload/download

### **Low Priority (Nice to Have)**
1. **Advanced Dashboard Widgets**
2. **Custom Report Builder**
3. **Advanced Search and Filters**

---

## 🔧 **FRONTEND IMPLEMENTATION NOTES**

### **API Base URL**
```javascript
const API_BASE_URL = 'http://localhost:5003/api';
```

### **Authentication Header**
```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
};
```

### **Error Handling**
```javascript
// Standard error response format
{
  "success": false,
  "message": "Error message",
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

### **Role-Based Access Control**
```javascript
// Check user role before API calls
const userRole = useAuth().user.role;
const canAccess = ['admin', 'manager'].includes(userRole);
```

---

**Last Updated**: 2025-06-14
**Version**: 3.0
**Status**: ✅ Verified against actual backend implementation
