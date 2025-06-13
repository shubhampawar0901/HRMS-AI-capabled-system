# 🔌 API Integration Guide - Complete Reference

## 📋 **Overview**

This guide provides comprehensive API integration details for all agents working on backend services and frontend modules. It ensures consistent API implementation and usage across the entire HRMS application.

---

## 🔐 **Authentication APIs**

### **Backend Implementation (Agent 1)**

#### **Login Endpoint**:
```javascript
// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate credentials
    const user = await AuthService.validateCredentials(email, password);
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }
    
    // Generate tokens
    const tokens = await AuthService.generateTokens(user);
    
    // Get employee details
    const employee = await EmployeeService.getByUserId(user.id);
    
    return successResponse(res, {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employee: {
          id: employee.id,
          firstName: employee.first_name,
          lastName: employee.last_name,
          department: employee.department_name
        }
      }
    }, 'Login successful');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
```

### **Frontend Integration (Agent 9)**

#### **Auth API Service**:
```javascript
// store/authAPI.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const authAPI = {
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE}/api/auth/login`, credentials);
    return response.data;
  },
  
  refresh: async (refreshToken) => {
    const response = await axios.post(`${API_BASE}/api/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });
    return response.data;
  },
  
  logout: async () => {
    const token = localStorage.getItem('token');
    await axios.post(`${API_BASE}/api/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
```

---

## 👥 **Employee Management APIs**

### **Backend Implementation (Agent 2)**

#### **Get Employees Endpoint**:
```javascript
// GET /api/employees
router.get('/', authenticateToken, authorizeRoles(['admin', 'manager']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, status = 'active' } = req.query;
    const { role, userId } = req.user;
    
    let filters = { status };
    
    // Role-based filtering
    if (role === 'manager') {
      // Manager can only see their team
      const managedEmployees = await EmployeeService.getManagedEmployees(userId);
      filters.employeeIds = managedEmployees.map(e => e.id);
    }
    
    if (search) filters.search = search;
    if (department) filters.department = department;
    
    const result = await EmployeeService.getEmployees({
      ...filters,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    return successResponse(res, result, 'Employees retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
```

### **Frontend Integration (Agent 11)**

#### **Employee API Service**:
```javascript
// store/employeesAPI.js
export const employeesAPI = {
  getEmployees: async (params) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    
    const response = await axios.get(`${API_BASE}/api/employees?${queryString}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  createEmployee: async (employeeData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/api/employees`, employeeData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },
  
  uploadDocument: async (employeeId, file, documentType) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const response = await axios.post(
      `${API_BASE}/api/employees/${employeeId}/documents`,
      formData,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
};
```

---

## ⏰ **Attendance APIs**

### **Backend Implementation (Agent 3)**

#### **Check-in Endpoint**:
```javascript
// POST /api/attendance/check-in
router.post('/check-in', authenticateToken, validateCheckIn, async (req, res) => {
  try {
    const { userId } = req.user;
    const { timestamp, location } = req.body;
    
    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = await AttendanceService.getTodayRecord(userId, today);
    
    if (existingRecord && existingRecord.check_in_time) {
      return errorResponse(res, 'Already checked in today', 400);
    }
    
    // Create or update attendance record
    const record = await AttendanceService.checkIn({
      employeeId: userId,
      date: today,
      checkInTime: new Date(timestamp),
      location: location
    });
    
    return successResponse(res, {
      checkInTime: record.check_in_time,
      message: 'Checked in successfully'
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
```

### **Frontend Integration (Agent 12)**

#### **Attendance API Service**:
```javascript
// store/attendanceAPI.js
export const attendanceAPI = {
  checkIn: async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/api/attendance/check-in`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  checkOut: async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/api/attendance/check-out`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getMyAttendance: async (startDate, endDate) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({ startDate, endDate });
    
    const response = await axios.get(`${API_BASE}/api/attendance/my-attendance?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
```

---

## 🏖️ **Leave Management APIs**

### **Backend Implementation (Agent 4)**

#### **Apply Leave Endpoint**:
```javascript
// POST /api/leave/apply
router.post('/apply', authenticateToken, validateLeaveApplication, async (req, res) => {
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
    
    return successResponse(res, {
      applicationId: application.id,
      status: application.status,
      message: 'Leave application submitted successfully'
    }, null, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});
```

### **Frontend Integration (Agent 13)**

#### **Leave API Service**:
```javascript
// store/leaveAPI.js
export const leaveAPI = {
  applyLeave: async (leaveData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE}/api/leave/apply`, leaveData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getLeaveBalance: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE}/api/leave/balance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  getLeaveApplications: async (filters) => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(filters);
    
    const response = await axios.get(`${API_BASE}/api/leave/applications?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  approveLeave: async (applicationId, action, comments) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_BASE}/api/leave/applications/${applicationId}/approve`,
      { action, comments },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};
```

---

## 🔧 **Common API Patterns**

### **Error Handling**:
```javascript
// Backend error response format
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

// Frontend error handling
const handleAPIError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  } else if (error.response?.data?.message) {
    // Show specific error message
    toast.error(error.response.data.message);
  } else {
    // Show generic error
    toast.error('An unexpected error occurred');
  }
};
```

### **Request Interceptors**:
```javascript
// Frontend axios interceptor for token management
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authAPI.refresh(refreshToken);
          localStorage.setItem('token', response.data.token);
          // Retry original request
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

This guide provides complete API integration patterns for all agents to follow consistently.
