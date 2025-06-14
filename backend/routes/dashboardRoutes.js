const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');

// Helper function to send success response
const sendSuccess = (res, data, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data
  });
};

// Helper function to send error response
const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: { message }
  });
};

// ==========================================
// DASHBOARD ROUTES
// ==========================================

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;
    
    // Mock data for now - will be replaced with real data later
    const mockStats = {
      admin: {
        totalEmployees: 150,
        activeEmployees: 142,
        pendingLeaves: 8,
        todayAttendance: 135
      },
      manager: {
        teamSize: 12,
        teamAttendance: 11,
        pendingApprovals: 3,
        completedTasks: 45
      },
      employee: {
        attendanceRate: 95,
        leaveBalance: 18,
        tasksCompleted: 23,
        upcomingMeetings: 4
      }
    };

    const stats = mockStats[role] || mockStats.employee;
    sendSuccess(res, stats, 'Dashboard stats retrieved successfully');

  } catch (error) {
    console.error('Dashboard stats error:', error);
    sendError(res, 'Failed to get dashboard stats', 500);
  }
});

// Get recent activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Mock activities data
    const mockActivities = [
      {
        id: 1,
        type: 'leave_request',
        message: 'John Doe submitted a leave request',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        status: 'pending'
      },
      {
        id: 2,
        type: 'attendance',
        message: 'Sarah Wilson checked in',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: 'completed'
      },
      {
        id: 3,
        type: 'performance',
        message: 'Monthly performance review completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        status: 'completed'
      },
      {
        id: 4,
        type: 'payroll',
        message: 'Payroll processed for December',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        status: 'completed'
      }
    ];

    const activities = mockActivities.slice(0, parseInt(limit));
    sendSuccess(res, activities, 'Recent activities retrieved successfully');

  } catch (error) {
    console.error('Dashboard activities error:', error);
    sendError(res, 'Failed to get recent activities', 500);
  }
});

// Get quick actions based on role
router.get('/quick-actions', authenticateToken, async (req, res) => {
  try {
    const { role } = req.query;
    
    const quickActions = {
      admin: [
        { id: 1, title: 'Add Employee', icon: 'UserPlus', path: '/employees/add' },
        { id: 2, title: 'View Reports', icon: 'BarChart', path: '/reports' },
        { id: 3, title: 'Manage Departments', icon: 'Building', path: '/departments' },
        { id: 4, title: 'System Settings', icon: 'Settings', path: '/settings' }
      ],
      manager: [
        { id: 1, title: 'Approve Leaves', icon: 'Calendar', path: '/leaves/pending' },
        { id: 2, title: 'Team Performance', icon: 'TrendingUp', path: '/performance/team' },
        { id: 3, title: 'Schedule Meeting', icon: 'Clock', path: '/meetings/new' },
        { id: 4, title: 'View Team', icon: 'Users', path: '/team' }
      ],
      employee: [
        { id: 1, title: 'Apply Leave', icon: 'Calendar', path: '/leaves/apply' },
        { id: 2, title: 'Check Attendance', icon: 'Clock', path: '/attendance' },
        { id: 3, title: 'View Payslip', icon: 'DollarSign', path: '/payroll' },
        { id: 4, title: 'Update Profile', icon: 'User', path: '/profile' }
      ]
    };

    const actions = quickActions[role] || quickActions.employee;
    sendSuccess(res, actions, 'Quick actions retrieved successfully');

  } catch (error) {
    console.error('Dashboard quick actions error:', error);
    sendError(res, 'Failed to get quick actions', 500);
  }
});

// Get attendance data for dashboard
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.query;
    
    // Mock attendance data
    const mockAttendance = {
      todayStatus: 'present',
      checkInTime: '09:15 AM',
      checkOutTime: null,
      weeklyAttendance: [
        { day: 'Mon', status: 'present', hours: 8 },
        { day: 'Tue', status: 'present', hours: 8.5 },
        { day: 'Wed', status: 'present', hours: 8 },
        { day: 'Thu', status: 'present', hours: 7.5 },
        { day: 'Fri', status: 'present', hours: 8 },
        { day: 'Sat', status: 'off', hours: 0 },
        { day: 'Sun', status: 'off', hours: 0 }
      ],
      monthlyStats: {
        totalDays: 22,
        presentDays: 20,
        absentDays: 1,
        leaveDays: 1,
        attendanceRate: 95.5
      }
    };

    sendSuccess(res, mockAttendance, 'Attendance data retrieved successfully');

  } catch (error) {
    console.error('Dashboard attendance error:', error);
    sendError(res, 'Failed to get attendance data', 500);
  }
});

// Get leave data for dashboard
router.get('/leave', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.query;
    
    // Mock leave data
    const mockLeave = {
      totalLeaves: 24,
      usedLeaves: 6,
      remainingLeaves: 18,
      pendingRequests: 1,
      recentLeaves: [
        {
          id: 1,
          type: 'Annual Leave',
          startDate: '2024-12-20',
          endDate: '2024-12-22',
          days: 3,
          status: 'approved'
        },
        {
          id: 2,
          type: 'Sick Leave',
          startDate: '2024-12-15',
          endDate: '2024-12-15',
          days: 1,
          status: 'approved'
        }
      ]
    };

    sendSuccess(res, mockLeave, 'Leave data retrieved successfully');

  } catch (error) {
    console.error('Dashboard leave error:', error);
    sendError(res, 'Failed to get leave data', 500);
  }
});

// Get performance data for dashboard
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { period = 'month', employeeId } = req.query;
    
    // Mock performance data
    const mockPerformance = {
      overallRating: 4.2,
      goals: {
        completed: 8,
        total: 10,
        percentage: 80
      },
      skills: [
        { name: 'Communication', rating: 4.5 },
        { name: 'Technical Skills', rating: 4.0 },
        { name: 'Leadership', rating: 3.8 },
        { name: 'Problem Solving', rating: 4.2 }
      ],
      feedback: {
        positive: 12,
        constructive: 3,
        total: 15
      }
    };

    sendSuccess(res, mockPerformance, 'Performance data retrieved successfully');

  } catch (error) {
    console.error('Dashboard performance error:', error);
    sendError(res, 'Failed to get performance data', 500);
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    service: 'dashboard-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
