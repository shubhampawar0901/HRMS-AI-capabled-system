const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// Import all models
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

// Initialize models
const models = {
  User: User(sequelize, DataTypes),
  Employee: Employee(sequelize, DataTypes),
  Department: Department(sequelize, DataTypes),
  Attendance: Attendance(sequelize, DataTypes),
  LeaveApplication: LeaveApplication(sequelize, DataTypes),
  LeaveBalance: LeaveBalance(sequelize, DataTypes),
  LeaveType: LeaveType(sequelize, DataTypes),
  Payroll: Payroll(sequelize, DataTypes),
  PerformanceGoal: PerformanceGoal(sequelize, DataTypes),
  PerformanceReview: PerformanceReview(sequelize, DataTypes),
  AIAttritionPrediction: AIAttritionPrediction(sequelize, DataTypes),
  AISmartFeedback: AISmartFeedback(sequelize, DataTypes),
  AIAttendanceAnomaly: AIAttendanceAnomaly(sequelize, DataTypes),
  AIChatbotInteraction: AIChatbotInteraction(sequelize, DataTypes),
  AIResumeParser: AIResumeParser(sequelize, DataTypes)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and sequelize instance
module.exports = {
  ...models,
  sequelize,
  Sequelize
};
