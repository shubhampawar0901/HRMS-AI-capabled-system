import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

// Layout Components
import Layout from '@/components/layout/Layout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import ProfilePage from '@/pages/auth/ProfilePage';

// Dashboard Pages
import DashboardPage from '@/pages/dashboard/DashboardPage';

// Employee Pages
import EmployeesPage from '@/pages/employees/EmployeesPage';
import EmployeeDetailsPage from '@/pages/employees/EmployeeDetailsPage';
import AddEmployeePage from '@/pages/employees/AddEmployeePage';
import EditEmployeePage from '@/pages/employees/EditEmployeePage';

// Attendance Pages
import AttendancePage from '@/pages/attendance/AttendancePage';
import TeamAttendancePage from '@/pages/attendance/TeamAttendancePage';

// Leave Pages
import LeavePage from '@/pages/leave/LeavePage';
import ApplyLeavePage from '@/pages/leave/ApplyLeavePage';
import LeaveApprovalsPage from '@/pages/leave/LeaveApprovalsPage';

// Payroll Pages
import PayrollPage from '@/pages/payroll/PayrollPage';
import PayslipDetailsPage from '@/pages/payroll/PayslipDetailsPage';

// Performance Pages
import PerformancePage from '@/pages/performance/PerformancePage';
import ReviewPage from '@/pages/performance/ReviewPage';
import GoalsPage from '@/pages/performance/GoalsPage';

// AI Features Pages
import AIFeaturesPage from '@/pages/ai-features/AIFeaturesPage';
import AttritionPage from '@/pages/ai-features/AttritionPage';

// Chatbot Page
import ChatbotPage from '@/pages/ChatbotPage';

// Smart Reports Pages
import AdminSmartReports from '@/pages/admin/SmartReports';
import ManagerSmartReports from '@/pages/manager/SmartReports';



const AppRoutes = () => {
  const { isAuthenticated } = useAuthContext();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Employees - Admin/Manager Only */}
        <Route
          path="employees"
          element={
            <ProtectedRoute requiredRoles={['admin', 'manager']}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/add"
          element={
            <ProtectedRoute requiredRoles={['admin', 'manager']}>
              <AddEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/:id"
          element={
            <ProtectedRoute requiredRoles={['admin', 'manager']}>
              <EmployeeDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="employees/:id/edit"
          element={
            <ProtectedRoute requiredRoles={['admin', 'manager']}>
              <EditEmployeePage />
            </ProtectedRoute>
          }
        />

        {/* Attendance */}
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="attendance/team" element={<TeamAttendancePage />} />

        {/* Leave Management */}
        <Route path="leave" element={<LeavePage />} />
        <Route path="leave/apply" element={<ApplyLeavePage />} />
        <Route path="leave/approvals" element={<LeaveApprovalsPage />} />

        {/* Payroll */}
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="payroll/:id" element={<PayslipDetailsPage />} />

        {/* Performance */}
        <Route path="performance" element={<PerformancePage />} />
        <Route path="performance/review/:id" element={<ReviewPage />} />
        <Route path="performance/goals" element={<GoalsPage />} />

        {/* AI Chatbot - Employee Only */}
        <Route
          path="ai-chatbot"
          element={
            <ProtectedRoute requiredRoles={['employee']}>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />

        {/* AI Features */}
        <Route path="ai-features" element={<AIFeaturesPage />} />
        <Route path="ai-features/attrition" element={<AttritionPage />} />

        {/* Smart Reports - Role-based Routes */}
        <Route
          path="admin/smart-reports"
          element={
            <ProtectedRoute requiredRoles={['admin']}>
              <AdminSmartReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="manager/smart-reports"
          element={
            <ProtectedRoute requiredRoles={['manager']}>
              <ManagerSmartReports />
            </ProtectedRoute>
          }
        />



      </Route>

      {/* Catch all route */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
