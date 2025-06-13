// Simple test server to verify basic functionality
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HRMS Test Server is running',
    timestamp: new Date().toISOString()
  });
});

// Basic auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple test authentication
  const testUsers = {
    'admin@hrms.com': { role: 'admin', password: 'Admin123!' },
    'manager@hrms.com': { role: 'manager', password: 'Manager123!' },
    'employee@hrms.com': { role: 'employee', password: 'Employee123!' }
  };
  
  const user = testUsers[email];
  if (user && user.password === password) {
    res.json({
      success: true,
      data: {
        token: 'test-token-' + user.role,
        user: { email, role: user.role }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Test employee endpoint
app.get('/api/employees', (req, res) => {
  res.json({
    success: true,
    data: {
      employees: [
        { id: 1, name: 'Admin User', role: 'admin' },
        { id: 2, name: 'Manager Smith', role: 'manager' },
        { id: 3, name: 'John Doe', role: 'employee' }
      ]
    }
  });
});

// Test AI endpoint
app.get('/api/ai/feature-status', (req, res) => {
  res.json({
    success: true,
    data: {
      resumeParser: { enabled: true, version: '1.0' },
      attritionPredictor: { enabled: true, version: '1.0' },
      smartFeedback: { enabled: true, version: '1.0' },
      anomalyDetection: { enabled: true, version: '1.0' },
      chatbot: { enabled: true, version: '1.0' },
      smartReports: { enabled: true, version: '1.0' }
    }
  });
});

// Placeholder endpoints
const placeholderEndpoints = [
  '/api/auth/health',
  '/api/attendance/health', 
  '/api/leave/health',
  '/api/payroll/health',
  '/api/performance/health',
  '/api/reports/health'
];

placeholderEndpoints.forEach(endpoint => {
  app.get(endpoint, (req, res) => {
    const service = endpoint.split('/')[2];
    res.json({
      service: service + '-service',
      status: 'ready for implementation',
      message: `${service} service routes placeholder`
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HRMS Test Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
