# 🔗 Complete UI-API Mapping - AI-Enhanced HRMS

## 📌 Assignment Context

This document provides a detailed step-by-step mapping of every user interface screen and action to its corresponding backend API call, following the React frontend and multi-agent backend architecture.

## 🔄 Overall Flow Outline

**Screen Flow**: Login → Role-based Dashboard → Feature Modules → AI Features → Reports

## 🔐 Authentication Screens

### **1. Login Screen (`/login`)**

#### **A. Screen Identification**
- **Screen Name**: Login
- **Component**: `LoginForm.tsx`
- **Route**: `/login`

#### **B. User Actions on This Screen**

**1. Action Name**: Click 'Login' button
- **UI Event Handler**: `handleLogin`
- **Component**: `LoginForm.tsx`

#### **C. Associated API Call**
```typescript
// HTTP Method & Endpoint
POST /api/auth/login

// Request Headers
{
  "Content-Type": "application/json"
}

// Request Body Schema
{
  "email": "string",
  "password": "string",
  "role": "admin" | "manager" | "employee" // optional
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
1. **Data Storage**: Store tokens in localStorage, user data in React Context
2. **Component Updates**: Update AuthContext, show loading state during request
3. **Navigation**: Redirect to role-based dashboard (`/admin/dashboard`, `/manager/dashboard`, `/employee/dashboard`)

---

## 👑 Admin Dashboard

### **2. Admin Dashboard (`/admin/dashboard`)**

#### **A. Screen Identification**
- **Screen Name**: Admin Dashboard
- **Component**: `AdminDashboard.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect` hook
- **Component**: `AdminDashboard.tsx`

#### **C. Associated API Call**
```typescript
// Multiple API calls on page load
GET /api/employees?limit=5&status=active  // Recent employees
GET /api/attendance/summary?date=today    // Today's attendance
GET /api/leave/applications?status=pending&limit=5  // Pending leaves
GET /api/ai/attrition/predictions?limit=5  // High-risk employees

// Request Headers (all calls)
{
  "Authorization": "Bearer access_token"
}

// Response aggregated in dashboard state
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Store in component state using `useState`
2. **Component Updates**: Update dashboard cards, charts, and tables
3. **Navigation**: No navigation, data display only

**2. Action Name**: Click 'Add Employee' button
- **UI Event Handler**: `handleAddEmployee`
- **Component**: `QuickActions.tsx`
- **Navigation**: Navigate to `/admin/employees/new` (no API call)

**3. Action Name**: Click employee in recent employees table
- **UI Event Handler**: `handleEmployeeClick`
- **Component**: `RecentEmployeesTable.tsx`
- **Navigation**: Navigate to `/admin/employees/:id` (no API call)

---

## 👥 Employee Management

### **3. Employee List (`/admin/employees`)**

#### **A. Screen Identification**
- **Screen Name**: Employee List
- **Component**: `EmployeeList.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load / Search / Filter
- **UI Event Handler**: `useEffect`, `handleSearch`, `handleFilter`
- **Component**: `EmployeeList.tsx`

#### **C. Associated API Call**
```typescript
GET /api/employees

// Query Parameters
{
  "page": number,
  "limit": number,
  "search": "string",
  "department": "string",
  "status": "active" | "inactive"
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
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number
    }
  }
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Store in component state, update pagination state
2. **Component Updates**: Update table rows, pagination controls
3. **Navigation**: No navigation for data loading

**2. Action Name**: Click 'Add Employee' button
- **UI Event Handler**: `handleAddEmployee`
- **Component**: `EmployeeList.tsx`
- **Navigation**: Navigate to `/admin/employees/new`

**3. Action Name**: Click employee row
- **UI Event Handler**: `handleEmployeeClick`
- **Component**: `EmployeeTable.tsx`
- **Navigation**: Navigate to `/admin/employees/:id`

---

### **4. Employee Profile (`/admin/employees/:id`)**

#### **A. Screen Identification**
- **Screen Name**: Employee Profile
- **Component**: `EmployeeProfile.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect`
- **Component**: `EmployeeProfile.tsx`

#### **C. Associated API Call**
```typescript
GET /api/employees/:id

// Expected Response Schema
{
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "employeeCode": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "hireDate": "string",
      "department": {
        "id": 1,
        "name": "string"
      },
      "manager": {
        "id": 1,
        "firstName": "string",
        "lastName": "string"
      },
      "position": "string",
      "salary": number,
      "status": "string"
    }
  }
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Store employee data in component state
2. **Component Updates**: Populate all profile sections and tabs
3. **Navigation**: No navigation for data loading

**2. Action Name**: Click 'Edit' button
- **UI Event Handler**: `handleEdit`
- **Component**: `EmployeeProfile.tsx`
- **Navigation**: Navigate to `/admin/employees/:id/edit`

---

### **5. Add Employee (`/admin/employees/new`)**

#### **A. Screen Identification**
- **Screen Name**: Add Employee
- **Component**: `AddEmployeeForm.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Submit form
- **UI Event Handler**: `handleSubmit`
- **Component**: `AddEmployeeForm.tsx`

#### **C. Associated API Call**
```typescript
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
  "salary": number,
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

#### **D. UI Consumption of Response**
1. **Data Storage**: No persistent storage needed
2. **Component Updates**: Show success message, reset form
3. **Navigation**: Redirect to `/admin/employees/:id` (new employee profile)

---

## ⏰ Attendance Management

### **6. Attendance Dashboard (`/attendance`)**

#### **A. Screen Identification**
- **Screen Name**: Attendance Dashboard
- **Component**: `AttendanceDashboard.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Click 'Check In' button
- **UI Event Handler**: `handleCheckIn`
- **Component**: `CheckInOutWidget.tsx`

#### **C. Associated API Call**
```typescript
POST /api/attendance/checkin

// Request Body Schema
{
  "employeeId": 123, // auto-detected for employees
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

#### **D. UI Consumption of Response**
1. **Data Storage**: Update attendance context/state
2. **Component Updates**: Update check-in button to check-out, show success toast
3. **Navigation**: No navigation, stay on same page

**2. Action Name**: Click 'Check Out' button
- **UI Event Handler**: `handleCheckOut`
- **Component**: `CheckInOutWidget.tsx`

#### **C. Associated API Call**
```typescript
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
      "totalHours": number,
      "status": "present"
    }
  }
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Update attendance state with total hours
2. **Component Updates**: Show total hours worked, success message
3. **Navigation**: No navigation

**3. Action Name**: Page Load (Get today's attendance)
- **UI Event Handler**: `useEffect`
- **Component**: `AttendanceDashboard.tsx`

#### **C. Associated API Call**
```typescript
GET /api/attendance/today

// Expected Response Schema
{
  "success": true,
  "data": {
    "attendance": {
      "checkInTime": "string",
      "checkOutTime": "string",
      "totalHours": number,
      "status": "present"
    }
  }
}
```

---

## 🏖️ Leave Management

### **7. Leave Application (`/leave/apply`)**

#### **A. Screen Identification**
- **Screen Name**: Leave Application
- **Component**: `LeaveApplicationForm.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load (Get leave balances)
- **UI Event Handler**: `useEffect`
- **Component**: `LeaveApplicationForm.tsx`

#### **C. Associated API Call**
```typescript
GET /api/leave/balance?year=2024

// Expected Response Schema
{
  "success": true,
  "data": {
    "balances": [
      {
        "leaveType": "Annual Leave",
        "allocated": number,
        "used": number,
        "remaining": number
      }
    ]
  }
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Store balances in component state
2. **Component Updates**: Display leave balances, populate leave type dropdown
3. **Navigation**: No navigation

**2. Action Name**: Submit leave application
- **UI Event Handler**: `handleSubmit`
- **Component**: `LeaveApplicationForm.tsx`

#### **C. Associated API Call**
```typescript
POST /api/leave/applications

// Request Body Schema
{
  "leaveTypeId": 1,
  "startDate": "string",
  "endDate": "string",
  "reason": "string"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "application": {
      "id": 1,
      "leaveType": "string",
      "startDate": "string",
      "endDate": "string",
      "totalDays": number,
      "status": "pending"
    }
  },
  "message": "Leave application submitted successfully"
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: No persistent storage needed
2. **Component Updates**: Show success message, reset form
3. **Navigation**: Redirect to `/leave/history`

---

## 🤖 AI Features

### **8. AI Chatbot Widget (Global)**

#### **A. Screen Identification**
- **Screen Name**: AI Chatbot
- **Component**: `ChatbotWidget.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Send message
- **UI Event Handler**: `handleSendMessage`
- **Component**: `ChatInterface.tsx`

#### **C. Associated API Call**
```typescript
POST /api/ai/chatbot/query

// Request Body Schema
{
  "message": "string",
  "sessionId": "session_123"
}

// Expected Response Schema
{
  "success": true,
  "data": {
    "message": "string",
    "intent": "string",
    "quickActions": [
      {
        "text": "string",
        "action": "navigate",
        "target": "string"
      }
    ],
    "responseTime": number
  }
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Add message to chat history state
2. **Component Updates**: Display AI response, show quick action buttons
3. **Navigation**: Quick actions may trigger navigation to other screens

---

### **9. Attrition Predictor (`/admin/ai/attrition`)**

#### **A. Screen Identification**
- **Screen Name**: Attrition Predictor
- **Component**: `AttritionPredictor.tsx`

#### **B. User Actions on This Screen**

**1. Action Name**: Page Load
- **UI Event Handler**: `useEffect`
- **Component**: `AttritionPredictor.tsx`

#### **C. Associated API Call**
```typescript
GET /api/ai/attrition/predictions

// Expected Response Schema
{
  "success": true,
  "data": {
    "predictions": [
      {
        "employeeId": 123,
        "employeeName": "string",
        "riskScore": number,
        "riskLevel": "high" | "medium" | "low",
        "contributingFactors": ["string"],
        "recommendations": ["string"]
      }
    ],
    "summary": {
      "totalEmployees": number,
      "highRisk": number,
      "mediumRisk": number,
      "lowRisk": number
    }
  }
}
```

#### **D. UI Consumption of Response**
1. **Data Storage**: Store predictions in component state
2. **Component Updates**: Populate risk table, update summary cards
3. **Navigation**: No navigation for data loading

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

### **API Error Handling**
```typescript
// Global error handler in API service
const handleApiError = (error) => {
  if (error.status === 401) {
    // Clear auth and redirect to login
    authService.logout();
    navigate('/login');
  } else if (error.status >= 500) {
    // Show generic error message
    toast.error('Something went wrong. Please try again.');
  } else {
    // Show specific error message
    toast.error(error.message);
  }
};
```

## 📱 Completion Criteria

✅ **All user actions mapped to API calls**
✅ **Request/response schemas defined**
✅ **Error handling specified**
✅ **Data flow documented**
✅ **Navigation patterns covered**
✅ **Authentication flows included**
✅ **Role-based access considered**
✅ **Real-time features addressed**

This mapping ensures complete integration between the React frontend and the multi-agent backend services, providing a seamless user experience across all HRMS features.
