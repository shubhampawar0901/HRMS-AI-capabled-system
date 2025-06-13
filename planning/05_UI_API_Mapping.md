# 🔗 UI-API Mapping - Detailed Flow Documentation

## Complete Step-by-Step UI to API Mapping

---

## 🔐 **Authentication Flow**

### **Screen 1: Login Screen**

#### **A. Screen Identification**
- **Screen Name**: Login Screen
- **Component**: `LoginForm.tsx`
- **Route**: `/login`

#### **B. User Actions on This Screen**

**Action 1: Click 'Login' button**
- **Action Name**: Submit login form
- **UI Event Handler**: `handleLogin`
- **Component**: `LoginForm.tsx`

#### **C. Associated API Call**
- **HTTP Method & Endpoint**: `POST /api/auth/login`
- **Request Headers**: 
  ```
  Content-Type: application/json
  ```
- **Request Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "email": "string (required, email format)",
    "password": "string (required, min 6 chars)"
  }
  ```
- **Expected Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "token": "string (JWT token)",
      "refreshToken": "string",
      "user": {
        "id": "string (UUID)",
        "email": "string",
        "role": "string (admin|manager|employee)",
        "employee": {
          "id": "string (UUID)",
          "firstName": "string",
          "lastName": "string",
          "department": "string"
        }
      }
    }
  }
  ```

#### **D. UI Consumption of Response**
1. **How response data is stored**: 
   - Token stored in Redux store (`auth/loginSuccess`)
   - User data stored in Redux store (`user/setUserData`)
   - Token also stored in localStorage for persistence

2. **Which components update**:
   - `AuthProvider` context updates
   - `Header` component shows user info
   - `Sidebar` navigation updates based on role

3. **Subsequent navigation**:
   - Redirect to role-specific dashboard (`/dashboard`)
   - Clear any error states
   - Initialize user session

**Action 2: Click 'Forgot Password' link**
- **Action Name**: Navigate to forgot password
- **UI Event Handler**: `handleForgotPassword`
- **Navigation**: Direct route change to `/forgot-password`

---

### **Screen 2: Employee Dashboard**

#### **A. Screen Identification**
- **Screen Name**: Employee Dashboard
- **Component**: `EmployeeDashboard.tsx`
- **Route**: `/dashboard`

#### **B. User Actions on This Screen**

**Action 1: Page Load (useEffect)**
- **Action Name**: Load dashboard data
- **UI Event Handler**: `useEffect` hook
- **Component**: `EmployeeDashboard.tsx`

#### **C. Associated API Call**
- **HTTP Method & Endpoint**: `GET /api/reports/dashboard-stats`
- **Request Headers**: 
  ```
  Authorization: Bearer {token}
  ```
- **Request Parameters**: None
- **Request Body Schema**: None (GET request)
- **Expected Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "attendanceToday": "present|absent",
        "leaveBalance": {
          "annual": 25,
          "sick": 10,
          "personal": 3
        },
        "upcomingReviews": 1,
        "pendingActions": 2
      },
      "recentActivities": [
        {
          "type": "attendance",
          "message": "Checked in at 09:00 AM",
          "timestamp": "2024-01-15T09:00:00Z"
        }
      ]
    }
  }
  ```

#### **D. UI Consumption of Response**
1. **How response data is stored**: 
   - Dashboard stats stored in component state (`useState`)
   - Recent activities stored in separate state array

2. **Which components update**:
   - `StatsCards` component displays attendance, leave balance
   - `RecentActivities` component shows activity feed
   - `QuickActions` component enables/disables based on data

3. **Subsequent navigation**: None (data display only)

**Action 2: Click 'Check In' button**
- **Action Name**: Record attendance check-in
- **UI Event Handler**: `handleCheckIn`
- **Component**: `AttendanceWidget.tsx`

#### **C. Associated API Call**
- **HTTP Method & Endpoint**: `POST /api/attendance/check-in`
- **Request Headers**: 
  ```
  Authorization: Bearer {token}
  Content-Type: application/json
  ```
- **Request Parameters**: None
- **Request Body Schema**:
  ```json
  {
    "timestamp": "string (ISO 8601 format)",
    "location": {
      "latitude": "number (optional)",
      "longitude": "number (optional)"
    }
  }
  ```
- **Expected Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "checkInTime": "string (HH:mm:ss)",
      "message": "string"
    }
  }
  ```

#### **D. UI Consumption of Response**
1. **How response data is stored**: 
   - Update attendance status in component state
   - Store check-in time in local state

2. **Which components update**:
   - `AttendanceWidget` shows "Checked In" status
   - `StatsCards` updates today's attendance status
   - Success toast notification appears

3. **Subsequent navigation**: None (stays on dashboard)

---

## 👥 **Employee Management Flow**

### **Screen 3: Employee List Screen**

#### **A. Screen Identification**
- **Screen Name**: Employee List Screen
- **Component**: `EmployeeList.tsx`
- **Route**: `/employees`

#### **B. User Actions on This Screen**

**Action 1: Page Load with Pagination**
- **Action Name**: Load employees list
- **UI Event Handler**: `useEffect` + `handlePageChange`
- **Component**: `EmployeeList.tsx`

#### **C. Associated API Call**
- **HTTP Method & Endpoint**: `GET /api/employees`
- **Request Headers**: 
  ```
  Authorization: Bearer {token}
  ```
- **Request Parameters**: 
  - `page=1` (URL parameter)
  - `limit=20` (URL parameter)
  - `department=uuid` (URL parameter, optional)
  - `search=john` (URL parameter, optional)
- **Request Body Schema**: None (GET request)
- **Expected Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "employees": [
        {
          "id": "string (UUID)",
          "employeeCode": "string",
          "firstName": "string",
          "lastName": "string",
          "email": "string",
          "department": {
            "id": "string (UUID)",
            "name": "string"
          },
          "position": "string",
          "status": "string",
          "joinDate": "string (YYYY-MM-DD)"
        }
      ],
      "pagination": {
        "page": "number",
        "limit": "number",
        "total": "number",
        "totalPages": "number"
      }
    }
  }
  ```

#### **D. UI Consumption of Response**
1. **How response data is stored**: 
   - Employees array stored in component state
   - Pagination info stored in separate state object
   - Loading state managed during API call

2. **Which components update**:
   - `EmployeeTable` component renders employee rows
   - `Pagination` component shows page controls
   - `LoadingSpinner` shows/hides based on loading state

3. **Subsequent navigation**: None (data display)

**Action 2: Click employee row**
- **Action Name**: Navigate to employee profile
- **UI Event Handler**: `handleEmployeeClick`
- **Component**: `EmployeeTableRow.tsx`

#### **C. Associated API Call**
- **HTTP Method & Endpoint**: `GET /api/employees/:id`
- **Request Headers**: 
  ```
  Authorization: Bearer {token}
  ```
- **Request Parameters**: 
  - `id` (path parameter from clicked employee)
- **Request Body Schema**: None (GET request)
- **Expected Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "id": "string (UUID)",
      "employeeCode": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "address": "string",
      "department": {
        "id": "string (UUID)",
        "name": "string",
        "manager": {
          "id": "string (UUID)",
          "name": "string"
        }
      },
      "position": "string",
      "manager": {
        "id": "string (UUID)",
        "name": "string"
      },
      "basicSalary": "number",
      "joinDate": "string (YYYY-MM-DD)",
      "status": "string",
      "documents": [
        {
          "id": "string (UUID)",
          "type": "string",
          "fileName": "string",
          "uploadedAt": "string (ISO 8601)"
        }
      ]
    }
  }
  ```

#### **D. UI Consumption of Response**
1. **How response data is stored**: 
   - Employee data stored in Redux store (`employees/setSelectedEmployee`)
   - Documents array stored in component state

2. **Which components update**:
   - Navigate to `EmployeeProfile.tsx` component
   - `ProfileHeader` shows employee basic info
   - `DocumentsList` shows uploaded documents
   - `EmployeeDetails` shows all profile information

3. **Subsequent navigation**: Route change to `/employees/:id`

**Action 3: Search employees**
- **Action Name**: Filter employees by search term
- **UI Event Handler**: `handleSearch` (debounced)
- **Component**: `SearchInput.tsx`

#### **C. Associated API Call**
- **HTTP Method & Endpoint**: `GET /api/employees`
- **Request Headers**: 
  ```
  Authorization: Bearer {token}
  ```
- **Request Parameters**: 
  - `search={searchTerm}` (URL parameter)
  - `page=1` (reset to first page)
  - `limit=20`
- **Request Body Schema**: None (GET request)
- **Expected Response Schema**: Same as employee list response

#### **D. UI Consumption of Response**
1. **How response data is stored**: 
   - Replace current employees array in state
   - Reset pagination to page 1
   - Update search term in URL params

2. **Which components update**:
   - `EmployeeTable` re-renders with filtered results
   - `Pagination` resets to show new total
   - `SearchInput` shows current search term

3. **Subsequent navigation**: URL updates with search parameter

---

## ⏰ **Attendance Management Flow**

### **Screen 4: Attendance History Screen**

#### **A. Screen Identification**
- **Screen Name**: Attendance History Screen
- **Component**: `AttendanceHistory.tsx`
- **Route**: `/attendance/history`

#### **B. User Actions on This Screen**

**Action 1: Load attendance history**
- **Action Name**: Fetch attendance records
- **UI Event Handler**: `useEffect` + `handleDateRangeChange`
- **Component**: `AttendanceHistory.tsx`

#### **C. Associated API Call**
- **HTTP Method & Endpoint**: `GET /api/attendance/my-attendance`
- **Request Headers**: 
  ```
  Authorization: Bearer {token}
  ```
- **Request Parameters**: 
  - `startDate=2024-01-01` (URL parameter)
  - `endDate=2024-01-31` (URL parameter)
- **Request Body Schema**: None (GET request)
- **Expected Response Schema**:
  ```json
  {
    "success": true,
    "data": {
      "todayStatus": {
        "date": "string (YYYY-MM-DD)",
        "checkIn": "string (HH:mm:ss)",
        "checkOut": "string (HH:mm:ss) | null",
        "status": "string",
        "totalHours": "number"
      },
      "records": [
        {
          "date": "string (YYYY-MM-DD)",
          "checkIn": "string (HH:mm:ss)",
          "checkOut": "string (HH:mm:ss)",
          "totalHours": "number",
          "status": "string"
        }
      ],
      "summary": {
        "totalDays": "number",
        "presentDays": "number",
        "absentDays": "number",
        "averageHours": "number"
      }
    }
  }
  ```

#### **D. UI Consumption of Response**
1. **How response data is stored**: 
   - Attendance records stored in component state array
   - Summary data stored in separate state object
   - Today's status stored in dedicated state

2. **Which components update**:
   - `AttendanceTable` renders attendance records
   - `AttendanceSummary` shows statistics
   - `TodayStatus` shows current day info
   - `AttendanceChart` visualizes trends

3. **Subsequent navigation**: None (data display)

---

## 🔄 **Validation & Error Handling**

### **Form Validation Patterns**:

**Client-Side Validation** (before API call):
```typescript
// Example: Login form validation
const validateLoginForm = (email: string, password: string) => {
  const errors: ValidationErrors = {};
  
  if (!email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
  
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  
  return errors;
};
```

**API Error Handling**:
```typescript
// Example: API call with error handling
const handleLogin = async (credentials: LoginCredentials) => {
  try {
    setLoading(true);
    const response = await authAPI.login(credentials);
    
    // Success handling
    dispatch(loginSuccess(response.data));
    navigate('/dashboard');
    showToast('Login successful', 'success');
    
  } catch (error: any) {
    // Error handling - no API error display to user
    console.error('Login failed:', error);
    
    if (error.status === 401) {
      setFieldError('password', 'Invalid credentials');
    } else if (error.status === 400) {
      // Handle validation errors from server
      error.details?.forEach((detail: any) => {
        setFieldError(detail.field, detail.message);
      });
    } else {
      // Generic error - show user-friendly message
      showToast('Login failed. Please try again.', 'error');
    }
  } finally {
    setLoading(false);
  }
};
```

### **Error Display Strategy**:
- **Form Errors**: Show inline field errors, no API error details
- **Network Errors**: Show generic "Please try again" message
- **Validation Errors**: Show specific field-level errors
- **Console Logging**: Log all API errors for debugging
- **User Experience**: Never show raw API error messages to users

---

## 📊 **State Management Patterns**

### **Redux Store Structure**:
```typescript
interface RootState {
  auth: {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
  };
  employees: {
    list: Employee[];
    selectedEmployee: Employee | null;
    pagination: PaginationInfo;
    loading: boolean;
  };
  attendance: {
    records: AttendanceRecord[];
    todayStatus: TodayAttendance | null;
    summary: AttendanceSummary | null;
  };
  // ... other modules
}
```

### **API Integration Hooks**:
```typescript
// Custom hook for API calls
const useEmployeeAPI = () => {
  const dispatch = useDispatch();
  
  const fetchEmployees = useCallback(async (params: EmployeeListParams) => {
    dispatch(setLoading(true));
    try {
      const response = await employeeAPI.getEmployees(params);
      dispatch(setEmployees(response.data.employees));
      dispatch(setPagination(response.data.pagination));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      // Handle error without showing API details
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);
  
  return { fetchEmployees };
};
```

This comprehensive UI-API mapping ensures every user interaction is properly connected to backend services while maintaining clean error handling and state management patterns.
