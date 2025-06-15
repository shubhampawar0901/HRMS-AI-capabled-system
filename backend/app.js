// Load environment variables first
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug environment loading
console.log('🔧 Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST ? '[SET]' : '[NOT SET]');
console.log('DB_USER:', process.env.DB_USER ? '[SET]' : '[NOT SET]');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
// const rateLimit = require('express-rate-limit'); // DISABLED FOR DEVELOPMENT

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { authenticateToken } = require('./middleware/authMiddleware');
const { validateRequest } = require('./middleware/validationMiddleware');

// Import database connection
const { connectDB, closeDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const enhancedAIRoutes = require('./routes/enhancedAI');
const reportsRoutes = require('./routes/reportsRoutes');
const smartReportsRoutes = require('./routes/smartReportsRoutes');
const dataRoutes = require('./routes/dataRoutes');
// const policyDocumentRoutes = require('./routes/policyDocumentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

// Rate limiting - DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Serve static files from frontend build (if in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HRMS Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes - Modular service routing
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/employees', authenticateToken, employeeRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/leave', authenticateToken, leaveRoutes);
app.use('/api/payroll', authenticateToken, payrollRoutes);
app.use('/api/performance', authenticateToken, performanceRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/enhanced-ai', enhancedAIRoutes); // Enhanced AI routes with built-in auth
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/smart-reports', authenticateToken, smartReportsRoutes);
app.use('/api/data', authenticateToken, dataRoutes);
// app.use('/api/ai/policy-documents', policyDocumentRoutes); // Policy document routes with built-in auth

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connection established');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 HRMS Backend Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await closeDB();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
