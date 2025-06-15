const express = require('express');
const { connectDB } = require('./config/database');

const app = express();
const PORT = 5003;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server running' });
});

app.get('/test-db', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'OK', message: 'Database connection successful' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

const startServer = async () => {
  try {
    console.log('🚀 Starting test server...');
    
    // Test database connection
    await connectDB();
    console.log('✅ Database connected');
    
    app.listen(PORT, () => {
      console.log(`🚀 Test server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 DB test: http://localhost:${PORT}/test-db`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
