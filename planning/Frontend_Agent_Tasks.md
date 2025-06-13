# 🎨 Frontend Agent Tasks - Detailed Implementation Guide

## 🎯 **Agent 9: Authentication Module**

### **Workspace**: `frontend/src/modules/auth/`

### **Responsibilities**:
- Login/logout functionality
- User authentication state management
- Protected route handling
- Profile management

### **Components to Implement**:
```javascript
// Module structure
auth/
├── components/
│   ├── LoginForm.jsx
│   ├── ForgotPasswordForm.jsx
│   ├── ResetPasswordForm.jsx
│   └── ProfileForm.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── ForgotPasswordPage.jsx
│   └── ResetPasswordPage.jsx
├── hooks/
│   ├── useAuth.js
│   └── useProfile.js
├── store/
│   ├── authSlice.js
│   └── authAPI.js
└── utils/
    ├── authHelpers.js
    └── tokenManager.js
```

### **Key Implementation Details**:

#### **1. Login Form Component**:
```jsx
// components/LoginForm.jsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { loginUser } from '../store/authSlice';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await dispatch(loginUser(formData)).unwrap();
      // Navigation handled by auth state change
    } catch (error) {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login to HRMS</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
```

#### **2. Auth Redux Slice**:
```javascript
// store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from './authAPI';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

### **Testing Requirements**:
- Login form validation tests
- Authentication flow tests
- Token management tests
- Protected route tests

### **Completion Checklist**:
- [ ] Login form with validation
- [ ] Forgot password flow
- [ ] Reset password functionality
- [ ] Profile management
- [ ] Auth state management
- [ ] Token handling
- [ ] Protected routes
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Unit tests for components
- [ ] Integration tests for auth flow

---

## 🎯 **Agent 10: Dashboard Module**

### **Workspace**: `frontend/src/modules/dashboard/`

### **Responsibilities**:
- Role-based dashboard layouts
- Statistics and metrics display
- Quick action widgets
- Recent activity feeds

### **Components to Implement**:
```javascript
dashboard/
├── components/
│   ├── AdminDashboard.jsx
│   ├── ManagerDashboard.jsx
│   ├── EmployeeDashboard.jsx
│   ├── StatsCard.jsx
│   ├── QuickActions.jsx
│   ├── RecentActivity.jsx
│   └── AttendanceWidget.jsx
├── pages/
│   └── DashboardPage.jsx
├── hooks/
│   ├── useDashboardStats.js
│   └── useRecentActivity.js
└── store/
    ├── dashboardSlice.js
    └── dashboardAPI.js
```

### **Key Implementation Details**:

#### **1. Role-based Dashboard**:
```jsx
// pages/DashboardPage.jsx
import { useSelector } from 'react-redux';
import AdminDashboard from '../components/AdminDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';

const DashboardPage = () => {
  const { user } = useSelector(state => state.auth);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <div>Access Denied</div>;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;
```

#### **2. Stats Card Component**:
```jsx
// components/StatsCard.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const StatsCard = ({ title, value, icon, trend, trendValue }) => {
  return (
    <Card className="hrms-card hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-hrms-admin">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↗' : '↘'} {trendValue}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
```

### **Completion Checklist**:
- [ ] Role-based dashboard layouts
- [ ] Statistics cards
- [ ] Quick action widgets
- [ ] Recent activity feed
- [ ] Attendance widgets
- [ ] Performance metrics
- [ ] Responsive grid layout
- [ ] Real-time data updates
- [ ] Loading states
- [ ] Error handling
- [ ] Unit tests for components
- [ ] Integration tests

---

## 🎯 **Agent 11: Employee Management Module**

### **Workspace**: `frontend/src/modules/employees/`

### **Responsibilities**:
- Employee listing and search
- Employee profile management
- Employee creation and editing
- Document management

### **Components to Implement**:
```javascript
employees/
├── components/
│   ├── EmployeeList.jsx
│   ├── EmployeeCard.jsx
│   ├── EmployeeForm.jsx
│   ├── EmployeeProfile.jsx
│   ├── DocumentUpload.jsx
│   └── EmployeeSearch.jsx
├── pages/
│   ├── EmployeesPage.jsx
│   ├── EmployeeDetailsPage.jsx
│   └── AddEmployeePage.jsx
├── hooks/
│   ├── useEmployees.js
│   └── useEmployeeForm.js
└── store/
    ├── employeesSlice.js
    └── employeesAPI.js
```

### **Key Implementation Details**:

#### **1. Employee List Component**:
```jsx
// components/EmployeeList.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import EmployeeCard from './EmployeeCard';
import { fetchEmployees } from '../store/employeesSlice';

const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ department: '', status: 'active' });
  const dispatch = useDispatch();
  const { employees, isLoading, pagination } = useSelector(state => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees({ 
      page: 1, 
      search: searchTerm, 
      ...filters 
    }));
  }, [dispatch, searchTerm, filters]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employees</h2>
        <Button onClick={() => navigate('/employees/add')}>
          Add Employee
        </Button>
      </div>
      
      <div className="flex gap-4">
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        {/* Department filter, status filter */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <EmployeeCard key={employee.id} employee={employee} />
        ))}
      </div>
      
      {/* Pagination component */}
    </div>
  );
};

export default EmployeeList;
```

### **Completion Checklist**:
- [ ] Employee listing with pagination
- [ ] Search and filtering
- [ ] Employee profile views
- [ ] Employee creation form
- [ ] Employee editing
- [ ] Document upload
- [ ] Resume parsing integration
- [ ] Role-based access control
- [ ] Responsive design
- [ ] Form validation
- [ ] Unit tests for components
- [ ] Integration tests

---

## 🎯 **Agent 12: Attendance Module**

### **Workspace**: `frontend/src/modules/attendance/`

### **Responsibilities**:
- Check-in/check-out interface
- Attendance tracking and history
- Team attendance views (managers)
- Attendance analytics

### **Components to Implement**:
```javascript
attendance/
├── components/
│   ├── CheckInOut.jsx
│   ├── AttendanceCalendar.jsx
│   ├── AttendanceHistory.jsx
│   ├── TeamAttendance.jsx
│   └── AttendanceStats.jsx
├── pages/
│   ├── AttendancePage.jsx
│   └── TeamAttendancePage.jsx
├── hooks/
│   ├── useAttendance.js
│   └── useCheckInOut.js
└── store/
    ├── attendanceSlice.js
    └── attendanceAPI.js
```

### **Key Implementation Details**:

#### **1. Check-in/Out Component**:
```jsx
// components/CheckInOut.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { checkIn, checkOut } from '../store/attendanceSlice';

const CheckInOut = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { todayStatus } = useSelector(state => state.attendance);

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      await dispatch(checkIn({
        timestamp: new Date().toISOString(),
        location: await getCurrentLocation()
      })).unwrap();
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await dispatch(checkOut({
        timestamp: new Date().toISOString()
      })).unwrap();
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hrms-card">
      <CardHeader>
        <CardTitle>Today's Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold">
            {new Date().toLocaleDateString()}
          </div>
          <div className="text-lg text-gray-600">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {todayStatus?.checkIn ? (
          <div className="space-y-2">
            <p>Check-in: {todayStatus.checkIn}</p>
            {todayStatus.checkOut ? (
              <p>Check-out: {todayStatus.checkOut}</p>
            ) : (
              <Button
                onClick={handleCheckOut}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Checking out...' : 'Check Out'}
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleCheckIn}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Checking in...' : 'Check In'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckInOut;
```

### **Completion Checklist**:
- [ ] Check-in/out functionality
- [ ] Attendance calendar view
- [ ] Attendance history
- [ ] Team attendance (managers)
- [ ] Attendance statistics
- [ ] Location tracking
- [ ] Time calculations
- [ ] Real-time updates
- [ ] Responsive design
- [ ] Error handling
- [ ] Unit tests for components
- [ ] Integration tests

---

## 🎯 **Agent 13: Leave Management Module**

### **Workspace**: `frontend/src/modules/leave/`

### **Responsibilities**:
- Leave application forms
- Leave balance display
- Leave history and status
- Manager approval interface

### **Components to Implement**:
```javascript
leave/
├── components/
│   ├── LeaveApplicationForm.jsx
│   ├── LeaveBalance.jsx
│   ├── LeaveHistory.jsx
│   ├── LeaveApprovals.jsx
│   └── LeaveCalendar.jsx
├── pages/
│   ├── LeavePage.jsx
│   ├── ApplyLeavePage.jsx
│   └── LeaveApprovalsPage.jsx
├── hooks/
│   ├── useLeave.js
│   └── useLeaveBalance.js
└── store/
    ├── leaveSlice.js
    └── leaveAPI.js
```

### **Key Implementation Details**:

#### **1. Leave Application Form**:
```jsx
// components/LeaveApplicationForm.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { applyLeave } from '../store/leaveSlice';

const LeaveApplicationForm = () => {
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { leaveTypes } = useSelector(state => state.leave);

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(applyLeave({
        ...formData,
        totalDays: calculateDays()
      })).unwrap();
      // Reset form and show success
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Leave Type</label>
        <Select
          value={formData.leaveTypeId}
          onValueChange={(value) => setFormData({...formData, leaveTypeId: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            {leaveTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Total Days: {calculateDays()}
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Reason</label>
        <Textarea
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
          placeholder="Enter reason for leave"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Submitting...' : 'Apply for Leave'}
      </Button>
    </form>
  );
};

export default LeaveApplicationForm;
```

### **Completion Checklist**:
- [ ] Leave application form
- [ ] Leave balance display
- [ ] Leave history
- [ ] Manager approval interface
- [ ] Leave calendar
- [ ] Date calculations
- [ ] Form validation
- [ ] Status tracking
- [ ] Responsive design
- [ ] Error handling
- [ ] Unit tests for components
- [ ] Integration tests

---

## 🎯 **Agent 14: Payroll Module**

### **Workspace**: `frontend/src/modules/payroll/`

### **Responsibilities**:
- Payslip viewing and download
- Salary component display
- Payroll history
- Tax information

### **Components to Implement**:
```javascript
payroll/
├── components/
│   ├── PayslipViewer.jsx
│   ├── PayslipList.jsx
│   ├── SalaryBreakdown.jsx
│   └── PayrollSummary.jsx
├── pages/
│   ├── PayrollPage.jsx
│   └── PayslipDetailsPage.jsx
├── hooks/
│   └── usePayroll.js
└── store/
    ├── payrollSlice.js
    └── payrollAPI.js
```

### **Key Implementation Details**:

#### **1. Payslip Viewer**:
```jsx
// components/PayslipViewer.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

const PayslipViewer = ({ payslip }) => {
  const handleDownload = () => {
    // Generate PDF download
    window.print();
  };

  return (
    <Card className="hrms-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Payslip - {payslip.month}/{payslip.year}
        </CardTitle>
        <Button onClick={handleDownload} variant="outline">
          Download PDF
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-green-600">Earnings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span>₹{payslip.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>HRA</span>
                <span>₹{payslip.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport</span>
                <span>₹{payslip.transport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime</span>
                <span>₹{payslip.overtimePay.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Gross Salary</span>
                <span>₹{payslip.grossSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-red-600">Deductions</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>PF</span>
                <span>₹{payslip.pf.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{payslip.tax.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total Deductions</span>
                <span>₹{payslip.totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Net Salary</span>
            <span className="text-green-600">
              ₹{payslip.netSalary.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayslipViewer;
```

### **Completion Checklist**:
- [ ] Payslip viewer
- [ ] Payslip list/history
- [ ] Salary breakdown
- [ ] PDF download
- [ ] Payroll summary
- [ ] Tax information
- [ ] Responsive design
- [ ] Print functionality
- [ ] Error handling
- [ ] Unit tests for components
- [ ] Integration tests

---

## 🎯 **Agent 15: Performance Module**

### **Workspace**: `frontend/src/modules/performance/`

### **Responsibilities**:
- Performance review interface
- Goal management
- Feedback collection
- Performance analytics

### **Components to Implement**:
```javascript
performance/
├── components/
│   ├── PerformanceReview.jsx
│   ├── GoalsList.jsx
│   ├── GoalForm.jsx
│   ├── FeedbackForm.jsx
│   └── PerformanceChart.jsx
├── pages/
│   ├── PerformancePage.jsx
│   ├── ReviewPage.jsx
│   └── GoalsPage.jsx
├── hooks/
│   ├── usePerformance.js
│   └── useGoals.js
└── store/
    ├── performanceSlice.js
    └── performanceAPI.js
```

### **Key Implementation Details**:

#### **1. Performance Review Component**:
```jsx
// components/PerformanceReview.jsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Slider } from '@/shared/components/ui/slider';

const PerformanceReview = ({ employee, onSubmit }) => {
  const [review, setReview] = useState({
    overallRating: 3,
    strengths: '',
    improvements: '',
    goals: '',
    comments: ''
  });

  const handleAIGenerate = async () => {
    // Call AI service to generate feedback
    const aiResponse = await fetch('/api/ai/generate-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: employee.id })
    });

    const aiData = await aiResponse.json();
    setReview(prev => ({
      ...prev,
      strengths: aiData.strengths,
      improvements: aiData.areas_for_improvement,
      comments: aiData.overall_summary
    }));
  };

  return (
    <Card className="hrms-card">
      <CardHeader>
        <CardTitle>Performance Review - {employee.name}</CardTitle>
        <Button onClick={handleAIGenerate} variant="outline">
          Generate AI Feedback
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Overall Rating: {review.overallRating}/5
          </label>
          <Slider
            value={[review.overallRating]}
            onValueChange={(value) => setReview({...review, overallRating: value[0]})}
            max={5}
            min={1}
            step={0.5}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Strengths</label>
          <Textarea
            value={review.strengths}
            onChange={(e) => setReview({...review, strengths: e.target.value})}
            placeholder="Key strengths and achievements..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Areas for Improvement</label>
          <Textarea
            value={review.improvements}
            onChange={(e) => setReview({...review, improvements: e.target.value})}
            placeholder="Areas that need development..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Overall Comments</label>
          <Textarea
            value={review.comments}
            onChange={(e) => setReview({...review, comments: e.target.value})}
            placeholder="Overall performance summary..."
          />
        </div>

        <Button onClick={() => onSubmit(review)} className="w-full">
          Submit Review
        </Button>
      </CardContent>
    </Card>
  );
};

export default PerformanceReview;
```

### **Completion Checklist**:
- [ ] Performance review interface
- [ ] Goal management system
- [ ] AI feedback integration
- [ ] Performance charts
- [ ] Feedback forms
- [ ] Review history
- [ ] Rating systems
- [ ] Progress tracking
- [ ] Responsive design
- [ ] Error handling
- [ ] Unit tests for components
- [ ] Integration tests

---

## 🎯 **Agent 16: AI Features Module**

### **Workspace**: `frontend/src/modules/ai-features/`

### **Responsibilities**:
- HR Chatbot interface
- Attrition prediction display
- Anomaly detection alerts
- Smart reports viewer
- Resume parser integration

### **Components to Implement**:
```javascript
ai-features/
├── components/
│   ├── HRChatbot.jsx
│   ├── AttritionPredictor.jsx
│   ├── AnomalyDetector.jsx
│   ├── SmartReports.jsx
│   └── ResumeParser.jsx
├── pages/
│   ├── AIFeaturesPage.jsx
│   ├── ChatbotPage.jsx
│   └── AttritionPage.jsx
├── hooks/
│   ├── useChatbot.js
│   └── useAIFeatures.js
└── store/
    ├── aiSlice.js
    └── aiAPI.js
```

### **Key Implementation Details**:

#### **1. HR Chatbot Component**:
```jsx
// components/HRChatbot.jsx
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

const HRChatbot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hi! I\'m your HR assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chatbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });

      const data = await response.json();
      const botMessage = {
        type: 'bot',
        content: data.message,
        quickActions: data.quickActions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hrms-card h-96 flex flex-col">
      <CardHeader>
        <CardTitle>HR Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.content}
                {message.quickActions && (
                  <div className="mt-2 space-y-1">
                    {message.quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (action.action === 'navigate') {
                            window.location.href = action.target;
                          }
                        }}
                      >
                        {action.text}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about HR policies..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRChatbot;
```

### **Completion Checklist**:
- [ ] HR Chatbot interface
- [ ] Attrition prediction display
- [ ] Anomaly detection alerts
- [ ] Smart reports viewer
- [ ] Resume parser integration
- [ ] Real-time AI responses
- [ ] Quick action buttons
- [ ] AI confidence indicators
- [ ] Responsive design
- [ ] Error handling
- [ ] Unit tests for components
- [ ] Integration tests

---

## 🎯 **Agent 17: Reports Module**

### **Workspace**: `frontend/src/modules/reports/`

### **Responsibilities**:
- Report generation interface
- Data visualization
- Export functionality
- Custom report builder

### **Components to Implement**:
```javascript
reports/
├── components/
│   ├── ReportBuilder.jsx
│   ├── ReportViewer.jsx
│   ├── ChartComponents.jsx
│   └── ExportOptions.jsx
├── pages/
│   ├── ReportsPage.jsx
│   └── CustomReportPage.jsx
├── hooks/
│   └── useReports.js
└── store/
    ├── reportsSlice.js
    └── reportsAPI.js
```

### **Key Implementation Details**:

#### **1. Report Viewer Component**:
```jsx
// components/ReportViewer.jsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportViewer = ({ reportData, title }) => {
  const handleExport = (format) => {
    // Export functionality
    if (format === 'pdf') {
      window.print();
    } else if (format === 'excel') {
      // Export to Excel
    }
  };

  return (
    <Card className="hrms-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {reportData.chartData && (
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {reportData.summary && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Summary</h3>
            <p>{reportData.summary}</p>
          </div>
        )}

        {reportData.insights && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Key Insights</h3>
            <ul className="list-disc list-inside space-y-1">
              {reportData.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportViewer;
```

### **Completion Checklist**:
- [ ] Report generation interface
- [ ] Data visualization charts
- [ ] Export functionality (PDF/Excel)
- [ ] Custom report builder
- [ ] Report templates
- [ ] Interactive charts
- [ ] Filter options
- [ ] Scheduled reports
- [ ] Responsive design
- [ ] Error handling
- [ ] Unit tests for components
- [ ] Integration tests

This completes all frontend agent tasks with comprehensive implementation guidance for each module.
