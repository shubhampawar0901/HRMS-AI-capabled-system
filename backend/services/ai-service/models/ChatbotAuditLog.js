const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

const ChatbotAuditLog = sequelize.define('ChatbotAuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userRole: {
    type: DataTypes.STRING(50),
    allowNull: false,
    index: true
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    index: true
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  intent: {
    type: DataTypes.STRING(100),
    allowNull: true,
    index: true
  },
  accessAttempts: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  securityViolations: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  ipAddress: {
    type: DataTypes.INET,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    index: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'chatbot_audit_logs',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'timestamp']
    },
    {
      fields: ['userRole']
    },
    {
      fields: ['action']
    },
    {
      fields: ['intent']
    },
    {
      fields: ['timestamp']
    },
    {
      name: 'security_violations_gin_idx',
      fields: ['securityViolations'],
      using: 'gin'
    }
  ]
});

// Define associations
ChatbotAuditLog.associate = (models) => {
  ChatbotAuditLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = ChatbotAuditLog;
