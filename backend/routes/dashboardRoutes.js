const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { executeQuery } = require('../config/database');

// Helper function to send success response
const sendSuccess = (res, data, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Helper function to send error response
const sendError = (res, message, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: { message },
    timestamp: new Date().toISOString()
  });
};

// ==========================================
// ROLE-BASED DASHBOARD ROUTES (AS PER DOCUMENTATION)
// ==========================================

// Admin Dashboard - GET /api/dashboard/admin
router.get('/admin', async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return sendError(res, 'Access denied. Admin role required.', 403);
    }

    // Get real data from database using correct table and column names
    const [
      totalEmployeesResult,
      activeTodayResult,
      pendingLeavesResult,
      attendanceChartResult
    ] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM employees WHERE status = "active"'),
      executeQuery(`
        SELECT COUNT(DISTINCT e.id) as count
        FROM employees e
        LEFT JOIN attendance a ON e.id = a.employeeId AND a.date = CURDATE()
        WHERE e.status = "active" AND (a.status = "present" OR a.checkInTime IS NOT NULL)
      `),
      executeQuery(`
        SELECT COUNT(*) as count
        FROM leave_applications
        WHERE status = "pending"
      `),
      executeQuery(`
        SELECT
          DAYNAME(date) as day,
          COUNT(DISTINCT employeeId) as present_count
        FROM attendance
        WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          AND status = 'present'
        GROUP BY date, DAYNAME(date)
        ORDER BY date DESC
        LIMIT 5
      `)
    ]);

    // Get pending approvals with correct column names
    const pendingApprovals = await executeQuery(`
      SELECT
        la.id,
        CONCAT(e.first_name, ' ', e.last_name) as employeeName,
        'leave' as type,
        CONCAT(COALESCE(lt.name, 'Leave'), ' - ', DATEDIFF(la.end_date, la.start_date) + 1, ' days') as details
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.status = 'pending'
      ORDER BY la.created_at DESC
      LIMIT 5
    `);

    // Prepare response data
    const dashboardData = {
      metrics: {
        totalEmployees: totalEmployeesResult[0]?.count || 0,
        activeToday: activeTodayResult[0]?.count || 0,
        pendingLeaves: pendingLeavesResult[0]?.count || 0,
        aiAlerts: 3 // Mock AI alerts for now
      },
      attendanceChart: {
        labels: attendanceChartResult.map(row => row.day).reverse(),
        data: attendanceChartResult.map(row => row.present_count).reverse()
      },
      pendingApprovals: pendingApprovals,
      aiInsights: [
        {
          type: "attrition",
          message: "3 employees at high attrition risk",
          action: "/admin/ai#attrition"
        }
      ]
    };

    sendSuccess(res, dashboardData, 'Admin dashboard data retrieved successfully');

  } catch (error) {
    console.error('Admin dashboard error:', error);
    sendError(res, 'Failed to get admin dashboard data', 500);
  }
});

// Manager Dashboard - GET /api/dashboard/manager
router.get('/manager', async (req, res) => {
  try {
    // Verify manager role
    if (req.user.role !== 'manager') {
      return sendError(res, 'Access denied. Manager role required.', 403);
    }

    const managerId = req.user.employeeId;
    if (!managerId) {
      return sendError(res, 'Manager employee ID not found', 400);
    }

    // Get real data from database using correct table and column names
    const [
      teamSizeResult,
      presentTodayResult,
      onLeaveResult,
      pendingApprovalsResult
    ] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM employees WHERE manager_id = ? AND status = "active"', [managerId]),
      executeQuery(`
        SELECT COUNT(DISTINCT e.id) as count
        FROM employees e
        LEFT JOIN attendance a ON e.id = a.employeeId AND a.date = CURDATE()
        WHERE e.manager_id = ? AND e.status = "active"
          AND (a.status = "present" OR a.checkInTime IS NOT NULL)
      `, [managerId]),
      executeQuery(`
        SELECT COUNT(DISTINCT e.id) as count
        FROM employees e
        JOIN leave_applications la ON e.id = la.employee_id
        WHERE e.manager_id = ? AND e.status = "active"
          AND la.status = "approved"
          AND CURDATE() BETWEEN la.start_date AND la.end_date
      `, [managerId]),
      executeQuery(`
        SELECT COUNT(*) as count
        FROM leave_applications la
        JOIN employees e ON la.employee_id = e.id
        WHERE e.manager_id = ? AND la.status = "pending"
      `, [managerId])
    ]);

    // Get team attendance chart using correct table and column names
    const teamAttendanceChart = await executeQuery(`
      SELECT
        DAYNAME(a.date) as day,
        COUNT(DISTINCT a.employeeId) as present_count
      FROM attendance a
      JOIN employees e ON a.employeeId = e.id
      WHERE e.manager_id = ?
        AND a.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        AND a.status = 'present'
      GROUP BY a.date, DAYNAME(a.date)
      ORDER BY a.date DESC
      LIMIT 5
    `, [managerId]);

    // Get pending approvals for team with correct column names
    const pendingApprovals = await executeQuery(`
      SELECT
        la.id,
        CONCAT(e.first_name, ' ', e.last_name) as employeeName,
        COALESCE(lt.name, 'Leave') as leaveType,
        la.start_date as startDate,
        la.end_date as endDate
      FROM leave_applications la
      JOIN employees e ON la.employee_id = e.id
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE e.manager_id = ? AND la.status = 'pending'
      ORDER BY la.created_at DESC
      LIMIT 5
    `, [managerId]);

    const dashboardData = {
      teamMetrics: {
        teamSize: teamSizeResult[0]?.count || 0,
        presentToday: presentTodayResult[0]?.count || 0,
        onLeave: onLeaveResult[0]?.count || 0,
        pendingApprovals: pendingApprovalsResult[0]?.count || 0
      },
      teamAttendance: {
        labels: teamAttendanceChart.map(row => row.day).reverse(),
        data: teamAttendanceChart.map(row => row.present_count).reverse()
      },
      pendingApprovals: pendingApprovals,
      teamInsights: [
        {
          type: "performance",
          message: "Team performance improved 15% this quarter"
        }
      ]
    };

    sendSuccess(res, dashboardData, 'Manager dashboard data retrieved successfully');

  } catch (error) {
    console.error('Manager dashboard error:', error);
    sendError(res, 'Failed to get manager dashboard data', 500);
  }
});

// Employee Dashboard - GET /api/dashboard/employee
router.get('/employee', async (req, res) => {
  try {
    // Verify employee role
    if (req.user.role !== 'employee') {
      return sendError(res, 'Access denied. Employee role required.', 403);
    }

    const employeeId = req.user.employeeId;
    if (!employeeId) {
      return sendError(res, 'Employee ID not found', 400);
    }

    // Get employee personal info
    const employeeInfo = await executeQuery(`
      SELECT
        e.first_name as firstName,
        e.last_name as lastName,
        CONCAT('Welcome back, ', e.first_name, '!') as welcomeMessage
      FROM employees e
      WHERE e.id = ?
    `, [employeeId]);

    if (employeeInfo.length === 0) {
      return sendError(res, 'Employee not found', 404);
    }

    // Get today's attendance using correct table and column names
    const todayAttendance = await executeQuery(`
      SELECT
        status as todayStatus,
        checkInTime,
        checkOutTime,
        totalHours as workingHours
      FROM attendance
      WHERE employeeId = ? AND date = CURDATE()
      ORDER BY createdAt DESC
      LIMIT 1
    `, [employeeId]);

    // Get monthly attendance rate using correct table and column names
    const monthlyAttendance = await executeQuery(`
      SELECT
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as presentDays
      FROM attendance
      WHERE employeeId = ?
        AND MONTH(date) = MONTH(CURDATE())
        AND YEAR(date) = YEAR(CURDATE())
    `, [employeeId]);

    const totalDays = monthlyAttendance[0]?.totalDays || 0;
    const presentDays = monthlyAttendance[0]?.presentDays || 0;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Get leave balances (mock data for now - would need leave_balances table)
    const leaveBalance = {
      annual: 20,
      sick: 10,
      emergency: 5
    };

    // Get recent activities using correct table and column names
    const recentActivities = await executeQuery(`
      SELECT
        'attendance' as type,
        CONCAT('Checked in at ', TIME_FORMAT(checkInTime, '%h:%i %p')) as message,
        createdAt as timestamp
      FROM attendance
      WHERE employeeId = ? AND checkInTime IS NOT NULL
      ORDER BY createdAt DESC
      LIMIT 5
    `, [employeeId]);

    const dashboardData = {
      personalInfo: employeeInfo[0],
      attendance: {
        todayStatus: todayAttendance[0]?.todayStatus || 'not_checked_in',
        checkInTime: todayAttendance[0]?.checkInTime || null,
        workingHours: todayAttendance[0]?.workingHours || 0,
        thisMonthRate: attendanceRate
      },
      leaveBalance: leaveBalance,
      quickActions: [
        {
          name: "Apply Leave",
          action: "/leave#apply"
        },
        {
          name: "View Payslip",
          action: "/payroll#payslips"
        }
      ],
      recentActivities: recentActivities
    };

    sendSuccess(res, dashboardData, 'Employee dashboard data retrieved successfully');

  } catch (error) {
    console.error('Employee dashboard error:', error);
    sendError(res, 'Failed to get employee dashboard data', 500);
  }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
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
