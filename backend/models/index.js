const { executeQuery, getConnection } = require('../config/database');

// Import all models (Plain SQL models)
const User = require('./User');
const Employee = require('./Employee');
const Department = require('./Department');
const Attendance = require('./Attendance');
const LeaveApplication = require('./LeaveApplication');
const LeaveBalance = require('./LeaveBalance');
const LeaveType = require('./LeaveType');
const Payroll = require('./Payroll');
const PerformanceGoal = require('./PerformanceGoal');
const PerformanceReview = require('./PerformanceReview');
const AIAttritionPrediction = require('./AIAttritionPrediction');
const AISmartFeedback = require('./AISmartFeedback');
const AIAttendanceAnomaly = require('./AIAttendanceAnomaly');
const AIChatbotInteraction = require('./AIChatbotInteraction');
const AIResumeParser = require('./AIResumeParser');
const AISmartReport = require('./AISmartReport');

// Export all models
module.exports = {
  // Core Models
  User,
  Employee,
  Department,

  // Attendance Models
  Attendance,

  // Leave Models
  LeaveApplication,
  LeaveBalance,
  LeaveType,

  // Payroll Models
  Payroll,

  // Performance Models
  PerformanceGoal,
  PerformanceReview,

  // AI Models
  AIAttritionPrediction,
  AISmartFeedback,
  AIAttendanceAnomaly,
  AIChatbotInteraction,
  AIResumeParser,
  AISmartReport,

  // Database utilities
  executeQuery,
  getConnection
};
