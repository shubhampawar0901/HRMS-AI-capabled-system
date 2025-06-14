const { executeQuery } = require('../config/database');
const { Employee, PerformanceReview, PerformanceGoal } = require('../models');

class SmartReportsDataService {
  
  // ==========================================
  // EMPLOYEE PERFORMANCE DATA COLLECTION
  // ==========================================
  
  async getEmployeePerformanceData(employeeId, dateRange = {}) {
    try {
      // Default to last 6 months if no date range provided
      const startDate = dateRange.startDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const endDate = dateRange.endDate || new Date();
      
      // Get employee basic info
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }
      
      // Get performance metrics
      const performance = await this.getPerformanceMetrics(employeeId, startDate, endDate);
      
      // Get attendance metrics
      const attendance = await this.getAttendanceMetrics(employeeId, startDate, endDate);
      
      // Get leave metrics
      const leave = await this.getLeaveMetrics(employeeId, startDate, endDate);
      
      // Get goals metrics
      const goals = await this.getGoalsMetrics(employeeId, startDate, endDate);
      
      return {
        employee: {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          employeeCode: employee.employeeCode,
          position: employee.position,
          department: employee.department_name,
          hireDate: employee.hireDate,
          tenure: this.calculateTenure(employee.hireDate)
        },
        performance,
        attendance,
        leave,
        goals,
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      console.error('Error collecting employee performance data:', error);
      throw error;
    }
  }
  
  // ==========================================
  // TEAM PERFORMANCE DATA COLLECTION
  // ==========================================
  
  async getTeamPerformanceData(managerId, dateRange = {}) {
    try {
      const startDate = dateRange.startDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const endDate = dateRange.endDate || new Date();
      
      // Get manager info
      const manager = await Employee.findById(managerId);
      if (!manager) {
        throw new Error('Manager not found');
      }
      
      // Get team members
      const teamMembers = await this.getTeamMembers(managerId);
      
      // Get team metrics aggregation
      const teamMetrics = await this.getTeamMetrics(managerId, startDate, endDate);
      
      // Get individual member summaries
      const memberSummaries = await Promise.all(
        teamMembers.map(member => this.getEmployeePerformanceData(member.id, { startDate, endDate }))
      );
      
      return {
        manager: {
          id: manager.id,
          name: `${manager.firstName} ${manager.lastName}`,
          position: manager.position,
          department: manager.department_name
        },
        team: {
          size: teamMembers.length,
          members: teamMembers
        },
        teamMetrics,
        memberSummaries,
        dateRange: { startDate, endDate }
      };
    } catch (error) {
      console.error('Error collecting team performance data:', error);
      throw error;
    }
  }
  
  // ==========================================
  // PERFORMANCE METRICS
  // ==========================================
  
  async getPerformanceMetrics(employeeId, startDate, endDate) {
    const reviewQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(overall_rating) as avg_rating,
        MAX(overall_rating) as highest_rating,
        MIN(overall_rating) as lowest_rating,
        MAX(created_at) as last_review_date
      FROM performance_reviews 
      WHERE employee_id = ? AND created_at BETWEEN ? AND ?
    `;
    
    const reviews = await executeQuery(reviewQuery, [employeeId, startDate, endDate]);
    
    return {
      totalReviews: reviews[0].total_reviews || 0,
      averageRating: parseFloat(reviews[0].avg_rating) || 0,
      highestRating: parseFloat(reviews[0].highest_rating) || 0,
      lowestRating: parseFloat(reviews[0].lowest_rating) || 0,
      lastReviewDate: reviews[0].last_review_date,
      ratingTrend: await this.calculateRatingTrend(employeeId, startDate, endDate)
    };
  }
  
  // ==========================================
  // ATTENDANCE METRICS
  // ==========================================
  
  async getAttendanceMetrics(employeeId, startDate, endDate) {
    const attendanceQuery = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        AVG(totalHours) as avg_daily_hours,
        SUM(totalHours) as total_hours
      FROM attendance 
      WHERE employeeId = ? AND date BETWEEN ? AND ?
    `;
    
    const attendance = await executeQuery(attendanceQuery, [employeeId, startDate, endDate]);
    const result = attendance[0];
    
    return {
      totalDays: result.total_days || 0,
      presentDays: result.present_days || 0,
      absentDays: result.absent_days || 0,
      lateDays: result.late_days || 0,
      attendanceRate: result.total_days > 0 ? ((result.present_days / result.total_days) * 100).toFixed(2) : 0,
      averageDailyHours: parseFloat(result.avg_daily_hours) || 0,
      totalHours: parseFloat(result.total_hours) || 0,
      punctualityRate: result.present_days > 0 ? (((result.present_days - result.late_days) / result.present_days) * 100).toFixed(2) : 0
    };
  }
  
  // ==========================================
  // LEAVE METRICS
  // ==========================================
  
  async getLeaveMetrics(employeeId, startDate, endDate) {
    const leaveQuery = `
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'approved' THEN total_days ELSE 0 END) as approved_days,
        SUM(CASE WHEN status = 'pending' THEN total_days ELSE 0 END) as pending_days,
        SUM(CASE WHEN status = 'rejected' THEN total_days ELSE 0 END) as rejected_days
      FROM leave_applications 
      WHERE employee_id = ? AND start_date BETWEEN ? AND ?
    `;
    
    const leave = await executeQuery(leaveQuery, [employeeId, startDate, endDate]);
    const result = leave[0];
    
    return {
      totalApplications: result.total_applications || 0,
      approvedDays: result.approved_days || 0,
      pendingDays: result.pending_days || 0,
      rejectedDays: result.rejected_days || 0,
      utilizationRate: this.calculateLeaveUtilization(result.approved_days)
    };
  }
  
  // ==========================================
  // GOALS METRICS
  // ==========================================
  
  async getGoalsMetrics(employeeId, startDate, endDate) {
    const goalsQuery = `
      SELECT 
        COUNT(*) as total_goals,
        AVG(achievement_percentage) as avg_achievement,
        COUNT(CASE WHEN achievement_percentage >= 100 THEN 1 END) as completed_goals,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_goals
      FROM performance_goals 
      WHERE employee_id = ? AND created_at BETWEEN ? AND ?
    `;
    
    const goals = await executeQuery(goalsQuery, [employeeId, startDate, endDate]);
    const result = goals[0];
    
    return {
      totalGoals: result.total_goals || 0,
      averageAchievement: parseFloat(result.avg_achievement) || 0,
      completedGoals: result.completed_goals || 0,
      activeGoals: result.active_goals || 0,
      completionRate: result.total_goals > 0 ? ((result.completed_goals / result.total_goals) * 100).toFixed(2) : 0
    };
  }
  
  // ==========================================
  // TEAM METRICS
  // ==========================================
  
  async getTeamMembers(managerId) {
    const query = `
      SELECT id, first_name, last_name, employee_code, position, hire_date
      FROM employees 
      WHERE manager_id = ? AND status = 'active'
      ORDER BY first_name, last_name
    `;
    
    return await executeQuery(query, [managerId]);
  }
  
  async getTeamMetrics(managerId, startDate, endDate) {
    const teamQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as team_size,
        AVG(pr.overall_rating) as avg_team_rating,
        AVG(pg.achievement_percentage) as avg_goal_achievement,
        AVG(attendance_stats.attendance_rate) as avg_attendance_rate
      FROM employees e
      LEFT JOIN performance_reviews pr ON e.id = pr.employee_id AND pr.created_at BETWEEN ? AND ?
      LEFT JOIN performance_goals pg ON e.id = pg.employee_id AND pg.created_at BETWEEN ? AND ?
      LEFT JOIN (
        SELECT 
          employeeId,
          (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100) as attendance_rate
        FROM attendance 
        WHERE date BETWEEN ? AND ?
        GROUP BY employeeId
      ) attendance_stats ON e.id = attendance_stats.employeeId
      WHERE e.manager_id = ? AND e.status = 'active'
    `;
    
    const result = await executeQuery(teamQuery, [startDate, endDate, startDate, endDate, startDate, endDate, managerId]);
    
    return {
      teamSize: result[0].team_size || 0,
      averageRating: parseFloat(result[0].avg_team_rating) || 0,
      averageGoalAchievement: parseFloat(result[0].avg_goal_achievement) || 0,
      averageAttendanceRate: parseFloat(result[0].avg_attendance_rate) || 0
    };
  }
  
  // ==========================================
  // HELPER METHODS
  // ==========================================
  
  calculateTenure(hireDate) {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now - hire);
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  }
  
  calculateLeaveUtilization(approvedDays) {
    // Assuming 21 days annual leave allocation
    const annualAllocation = 21;
    return approvedDays > 0 ? ((approvedDays / annualAllocation) * 100).toFixed(2) : 0;
  }
  
  async calculateRatingTrend(employeeId, startDate, endDate) {
    const trendQuery = `
      SELECT overall_rating, created_at
      FROM performance_reviews 
      WHERE employee_id = ? AND created_at BETWEEN ? AND ?
      ORDER BY created_at ASC
      LIMIT 2
    `;
    
    const ratings = await executeQuery(trendQuery, [employeeId, startDate, endDate]);
    
    if (ratings.length < 2) return 'stable';
    
    const firstRating = ratings[0].overall_rating;
    const lastRating = ratings[ratings.length - 1].overall_rating;
    
    if (lastRating > firstRating) return 'improving';
    if (lastRating < firstRating) return 'declining';
    return 'stable';
  }
}

module.exports = SmartReportsDataService;
