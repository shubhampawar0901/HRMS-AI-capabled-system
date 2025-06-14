const { PerformanceReview, PerformanceGoal, Employee, AISmartFeedback } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const AIService = require('../services/AIService');

class PerformanceController {
  // ==========================================
  // PERFORMANCE REVIEWS
  // ==========================================
  static async createReview(req, res) {
    try {
      const { role, userId, employeeId } = req.user;
      const { employeeId: targetEmployeeId, reviewPeriod, overallRating, comments } = req.body;

      // Check permissions
      if (role !== 'admin' && role !== 'manager') {
        return sendError(res, 'Access denied', 403);
      }

      // For managers, check if they can review this employee
      if (role === 'manager') {
        const employee = await Employee.findById(targetEmployeeId);
        if (employee.managerId !== employeeId) {
          return sendError(res, 'You can only review your team members', 403);
        }
      }

      const review = await PerformanceReview.create({
        employeeId: targetEmployeeId,
        reviewerId: userId,
        reviewPeriod,
        overallRating,
        comments,
        status: 'draft'
      });

      return sendCreated(res, review, 'Performance review created successfully');
    } catch (error) {
      console.error('Create review error:', error);
      return sendError(res, 'Failed to create performance review', 500);
    }
  }

  // ==========================================
  // GET REVIEWS
  // ==========================================
  static async getReviews(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { page = 1, limit = 20, status } = req.query;

      let reviews;
      let total;

      if (role === 'admin') {
        // Admin can see all reviews
        const options = { status, page: parseInt(page), limit: parseInt(limit) };
        reviews = await PerformanceReview.findAll(options);
        total = await PerformanceReview.count(options);
      } else if (role === 'manager') {
        // Manager can see reviews for their team
        const options = { managerId: employeeId, status, page: parseInt(page), limit: parseInt(limit) };
        reviews = await PerformanceReview.findByManager(employeeId, options);
        total = await PerformanceReview.countByManager(employeeId, options);
      } else {
        // Employee can see their own reviews
        const options = { employeeId, status, page: parseInt(page), limit: parseInt(limit) };
        reviews = await PerformanceReview.findByEmployee(employeeId, options);
        total = await PerformanceReview.countByEmployee(employeeId, options);
      }

      const responseData = {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      return sendSuccess(res, responseData, 'Performance reviews retrieved');
    } catch (error) {
      console.error('Get reviews error:', error);
      return sendError(res, 'Failed to get performance reviews', 500);
    }
  }

  // ==========================================
  // GET REVIEW BY ID
  // ==========================================
  static async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const { role, userId, employeeId } = req.user;

      const review = await PerformanceReview.findById(id);
      if (!review) {
        return sendError(res, 'Performance review not found', 404);
      }

      // Check permissions
      if (role === 'employee' && review.employeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      } else if (role === 'manager') {
        const employee = await Employee.findById(review.employeeId);
        if (employee.managerId !== employeeId && review.reviewerId !== userId) {
          return sendError(res, 'Access denied', 403);
        }
      }

      return sendSuccess(res, review, 'Performance review retrieved successfully');
    } catch (error) {
      console.error('Get review by ID error:', error);
      return sendError(res, 'Failed to get performance review', 500);
    }
  }

  // ==========================================
  // UPDATE REVIEW
  // ==========================================
  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.user;
      const { overallRating, comments } = req.body;

      const review = await PerformanceReview.findById(id);
      if (!review) {
        return sendError(res, 'Performance review not found', 404);
      }

      if (review.reviewerId !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      if (review.status !== 'draft') {
        return sendError(res, 'Only draft reviews can be updated', 400);
      }

      const updatedReview = await PerformanceReview.update(id, {
        overallRating,
        comments
      });

      return sendSuccess(res, updatedReview, 'Performance review updated successfully');
    } catch (error) {
      console.error('Update review error:', error);
      return sendError(res, 'Failed to update performance review', 500);
    }
  }

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================
  static async submitReview(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.user;

      const review = await PerformanceReview.findById(id);
      if (!review) {
        return sendError(res, 'Performance review not found', 404);
      }

      if (review.reviewerId !== userId) {
        return sendError(res, 'Access denied', 403);
      }

      if (review.status !== 'draft') {
        return sendError(res, 'Review has already been submitted', 400);
      }

      const updatedReview = await PerformanceReview.update(id, {
        status: 'submitted'
      });

      return sendSuccess(res, updatedReview, 'Performance review submitted successfully');
    } catch (error) {
      console.error('Submit review error:', error);
      return sendError(res, 'Failed to submit performance review', 500);
    }
  }

  // ==========================================
  // PERFORMANCE GOALS
  // ==========================================
  static async createGoal(req, res) {
    try {
      const { role, userId, employeeId } = req.user;
      const { employeeId: targetEmployeeId, title, description, targetDate } = req.body;

      // Check permissions
      if (role !== 'admin' && role !== 'manager' && targetEmployeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      const goal = await PerformanceGoal.create({
        employeeId: targetEmployeeId || employeeId,
        title,
        description,
        targetDate,
        createdBy: userId,
        status: 'active'
      });

      return sendCreated(res, goal, 'Performance goal created successfully');
    } catch (error) {
      console.error('Create goal error:', error);
      return sendError(res, 'Failed to create performance goal', 500);
    }
  }

  // ==========================================
  // GET GOALS
  // ==========================================
  static async getGoals(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { page = 1, limit = 20, status } = req.query;

      let goals;
      let total;

      if (role === 'admin') {
        // Admin can see all goals
        const options = { status, page: parseInt(page), limit: parseInt(limit) };
        goals = await PerformanceGoal.findAll(options);
        total = await PerformanceGoal.count(options);
      } else if (role === 'manager') {
        // Manager can see goals for their team
        const options = { managerId: employeeId, status, page: parseInt(page), limit: parseInt(limit) };
        goals = await PerformanceGoal.findByManager(employeeId, options);
        total = await PerformanceGoal.countByManager(employeeId, options);
      } else {
        // Employee can see their own goals
        const options = { employeeId, status, page: parseInt(page), limit: parseInt(limit) };
        goals = await PerformanceGoal.findByEmployee(employeeId, options);
        total = await PerformanceGoal.countByEmployee(employeeId, options);
      }

      const responseData = {
        goals,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      return sendSuccess(res, responseData, 'Performance goals retrieved');
    } catch (error) {
      console.error('Get goals error:', error);
      return sendError(res, 'Failed to get performance goals', 500);
    }
  }

  // ==========================================
  // GET GOAL BY ID
  // ==========================================
  static async getGoalById(req, res) {
    try {
      const { id } = req.params;
      const { role, employeeId } = req.user;

      const goal = await PerformanceGoal.findById(id);
      if (!goal) {
        return sendError(res, 'Performance goal not found', 404);
      }

      // Check permissions
      if (role === 'employee' && goal.employeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      } else if (role === 'manager') {
        const employee = await Employee.findById(goal.employeeId);
        if (employee.managerId !== employeeId) {
          return sendError(res, 'Access denied', 403);
        }
      }

      return sendSuccess(res, goal, 'Performance goal retrieved successfully');
    } catch (error) {
      console.error('Get goal by ID error:', error);
      return sendError(res, 'Failed to get performance goal', 500);
    }
  }

  // ==========================================
  // UPDATE GOAL
  // ==========================================
  static async updateGoal(req, res) {
    try {
      const { id } = req.params;
      const { title, description, targetDate } = req.body;
      const { role, employeeId } = req.user;

      const goal = await PerformanceGoal.findById(id);
      if (!goal) {
        return sendError(res, 'Performance goal not found', 404);
      }

      // Check permissions - only admin, manager, or goal owner can update
      if (role === 'employee' && goal.employeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      } else if (role === 'manager') {
        const employee = await Employee.findById(goal.employeeId);
        if (employee.managerId !== employeeId) {
          return sendError(res, 'Access denied', 403);
        }
      }

      const updatedGoal = await PerformanceGoal.update(id, {
        title,
        description,
        targetDate
      });

      return sendSuccess(res, updatedGoal, 'Performance goal updated successfully');
    } catch (error) {
      console.error('Update goal error:', error);
      return sendError(res, 'Failed to update performance goal', 500);
    }
  }

  // ==========================================
  // UPDATE GOAL PROGRESS
  // ==========================================
  static async updateGoalProgress(req, res) {
    try {
      const { id } = req.params;
      const { achievementPercentage, status } = req.body;
      const { employeeId } = req.user;

      const goal = await PerformanceGoal.findById(id);
      if (!goal) {
        return sendError(res, 'Performance goal not found', 404);
      }

      if (goal.employeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      const updatedGoal = await PerformanceGoal.update(id, {
        achievementPercentage,
        status
      });

      return sendSuccess(res, updatedGoal, 'Goal progress updated successfully');
    } catch (error) {
      console.error('Update goal progress error:', error);
      return sendError(res, 'Failed to update goal progress', 500);
    }
  }

  // ==========================================
  // AI SMART FEEDBACK
  // ==========================================
  static async generateSmartFeedback(req, res) {
    try {
      const { role } = req.user;
      const { employeeId } = req.body;

      if (role !== 'admin' && role !== 'manager') {
        return sendError(res, 'Access denied', 403);
      }

      // Generate AI feedback
      const aiService = new AIService();
      const feedback = await aiService.generateSmartFeedback(employeeId);

      // Save feedback to database
      const savedFeedback = await AISmartFeedback.create({
        employeeId,
        feedbackType: 'performance',
        generatedFeedback: feedback.feedback,
        performanceData: feedback.performanceData,
        suggestions: feedback.suggestions,
        confidence: feedback.confidence,
        generatedBy: req.user.userId
      });

      return sendCreated(res, savedFeedback, 'Smart feedback generated successfully');
    } catch (error) {
      console.error('Generate smart feedback error:', error);
      return sendError(res, 'Failed to generate smart feedback', 500);
    }
  }

  // ==========================================
  // GET SMART FEEDBACK
  // ==========================================
  static async getSmartFeedback(req, res) {
    try {
      const { role, employeeId } = req.user;
      const { page = 1, limit = 20 } = req.query;

      let feedback;
      let total;

      if (role === 'admin') {
        // Admin can see all feedback
        const options = { page: parseInt(page), limit: parseInt(limit) };
        feedback = await AISmartFeedback.findAll(options);
        total = await AISmartFeedback.count(options);
      } else if (role === 'manager') {
        // Manager can see feedback for their team
        const options = { managerId: employeeId, page: parseInt(page), limit: parseInt(limit) };
        feedback = await AISmartFeedback.findByManager(employeeId, options);
        total = await AISmartFeedback.countByManager(employeeId, options);
      } else {
        // Employee can see their own feedback
        const options = { employeeId, page: parseInt(page), limit: parseInt(limit) };
        feedback = await AISmartFeedback.findByEmployee(employeeId, options);
        total = await AISmartFeedback.countByEmployee(employeeId, options);
      }

      const responseData = {
        feedback,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      return sendSuccess(res, responseData, 'Smart feedback retrieved');
    } catch (error) {
      console.error('Get smart feedback error:', error);
      return sendError(res, 'Failed to get smart feedback', 500);
    }
  }

  // ==========================================
  // GET TEAM PERFORMANCE (MANAGER)
  // ==========================================
  static async getTeamPerformance(req, res) {
    try {
      const { role, employeeId } = req.user;

      if (role !== 'admin' && role !== 'manager') {
        return sendError(res, 'Access denied', 403);
      }

      let teamPerformance;

      if (role === 'admin') {
        // Admin can see all employees
        teamPerformance = await PerformanceController.getAllEmployeesPerformance();
      } else {
        // Manager can see their team
        teamPerformance = await PerformanceController.getManagerTeamPerformance(employeeId);
      }

      return sendSuccess(res, { teamPerformance }, 'Team performance retrieved successfully');
    } catch (error) {
      console.error('Get team performance error:', error);
      return sendError(res, 'Failed to get team performance', 500);
    }
  }

  // ==========================================
  // PERFORMANCE DASHBOARD
  // ==========================================
  static async getPerformanceDashboard(req, res) {
    try {
      const { role, employeeId } = req.user;

      let dashboard;

      if (role === 'admin') {
        dashboard = await PerformanceController.getAdminDashboard();
      } else if (role === 'manager') {
        dashboard = await PerformanceController.getManagerDashboard(employeeId);
      } else {
        dashboard = await PerformanceController.getEmployeeDashboard(employeeId);
      }

      return sendSuccess(res, dashboard, 'Performance dashboard retrieved');
    } catch (error) {
      console.error('Get performance dashboard error:', error);
      return sendError(res, 'Failed to get performance dashboard', 500);
    }
  }

  // Helper methods for dashboard data
  static async getAdminDashboard() {
    const totalReviews = await PerformanceReview.count();
    const pendingReviews = await PerformanceReview.count({ status: 'draft' });
    const totalGoals = await PerformanceGoal.count();
    const activeGoals = await PerformanceGoal.count({ status: 'active' });
    const completedGoals = await PerformanceGoal.count({ status: 'completed' });

    return {
      reviews: { total: totalReviews, pending: pendingReviews },
      goals: { total: totalGoals, active: activeGoals, completed: completedGoals }
    };
  }

  static async getManagerDashboard(managerId) {
    const teamReviews = await PerformanceReview.countByManager(managerId);
    const pendingReviews = await PerformanceReview.countByManager(managerId, { status: 'draft' });
    const teamGoals = await PerformanceGoal.countByManager(managerId);
    const activeGoals = await PerformanceGoal.countByManager(managerId, { status: 'active' });

    return {
      reviews: { total: teamReviews, pending: pendingReviews },
      goals: { total: teamGoals, active: activeGoals }
    };
  }

  static async getEmployeeDashboard(employeeId) {
    const myReviews = await PerformanceReview.countByEmployee(employeeId);
    const myGoals = await PerformanceGoal.countByEmployee(employeeId);
    const activeGoals = await PerformanceGoal.countByEmployee(employeeId, { status: 'active' });
    const completedGoals = await PerformanceGoal.countByEmployee(employeeId, { status: 'completed' });

    return {
      reviews: { total: myReviews },
      goals: { total: myGoals, active: activeGoals, completed: completedGoals }
    };
  }

  // Helper methods for team performance
  static async getAllEmployeesPerformance() {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        e.id as employeeId,
        CONCAT(e.first_name, ' ', e.last_name) as employeeName,
        AVG(pr.overall_rating) as overallRating,
        COUNT(DISTINCT pg.id) as goalsCompleted,
        COUNT(DISTINCT pg2.id) as totalGoals,
        MAX(pr.created_at) as lastReviewDate
      FROM employees e
      LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
      LEFT JOIN performance_goals pg ON e.id = pg.employee_id AND pg.status = 'completed'
      LEFT JOIN performance_goals pg2 ON e.id = pg2.employee_id
      WHERE e.status = 'active'
      GROUP BY e.id
      ORDER BY e.first_name, e.last_name
    `;

    return await executeQuery(query);
  }

  static async getManagerTeamPerformance(managerId) {
    const { executeQuery } = require('../config/database');

    const query = `
      SELECT
        e.id as employeeId,
        CONCAT(e.first_name, ' ', e.last_name) as employeeName,
        AVG(pr.overall_rating) as overallRating,
        COUNT(DISTINCT pg.id) as goalsCompleted,
        COUNT(DISTINCT pg2.id) as totalGoals,
        MAX(pr.created_at) as lastReviewDate
      FROM employees e
      LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
      LEFT JOIN performance_goals pg ON e.id = pg.employee_id AND pg.status = 'completed'
      LEFT JOIN performance_goals pg2 ON e.id = pg2.employee_id
      WHERE e.manager_id = ? AND e.status = 'active'
      GROUP BY e.id
      ORDER BY e.first_name, e.last_name
    `;

    return await executeQuery(query, [managerId]);
  }
}

module.exports = PerformanceController;
