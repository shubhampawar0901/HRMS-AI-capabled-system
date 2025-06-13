const { DataTypes } = require('sequelize');
const { sequelize } = require('../../../config/database');

const ChatbotConversation = sequelize.define('ChatbotConversation', {
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
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    index: true
  },
  userMessage: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  botResponse: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  intent: {
    type: DataTypes.STRING(100),
    allowNull: true,
    index: true
  },
  confidenceScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0.00,
      max: 1.00
    }
  },
  responseTimeMs: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
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
  tableName: 'chatbot_conversations',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'sessionId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['intent']
    },
    {
      fields: ['userId', 'createdAt']
    }
  ]
});

// Define associations
ChatbotConversation.associate = (models) => {
  ChatbotConversation.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = ChatbotConversation;
