/**
 * Test script for optimized anomaly detection
 * Tests the new AI-only system without stored procedures
 */

require('dotenv').config();

async function testOptimizedAnomalyDetection() {
  try {
    console.log('🧪 Testing Optimized AI-Only Anomaly Detection...\n');

    // Test database connection
    const { connectDB } = require('./config/database');
    await connectDB();
    console.log('✅ Database connected');

    // Test OptimizedAnomalyService
    const OptimizedAnomalyService = require('./services/OptimizedAnomalyService');
    const optimizedService = new OptimizedAnomalyService();
    console.log('✅ OptimizedAnomalyService initialized');

    // Test with a recent date range
    const dateRange = {
      startDate: '2024-11-01',
      endDate: '2024-12-31'
    };

    console.log('\n🔍 Testing optimized detection...');
    console.log('Date range:', dateRange);

    const startTime = Date.now();
    
    // Test with null employeeIds (all employees)
    const result = await optimizedService.detectAnomaliesOptimized(null, dateRange);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;

    console.log('\n📊 Results:');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('Data:', result.data);
      console.log('Metrics:', result.metrics);
      console.log('Total processing time:', totalTime + 'ms');
      
      // Display performance improvements
      console.log('\n🚀 Performance Metrics:');
      console.log('- Employees processed:', result.metrics.totalProcessed);
      console.log('- AI calls made:', result.metrics.aiCalls);
      console.log('- SQL queries executed:', result.metrics.sqlQueries);
      console.log('- Duplicates avoided:', result.metrics.duplicatesAvoided);
      console.log('- Processing time:', result.metrics.processingTime + 'ms');
      
      if (result.metrics.totalProcessed > 0) {
        console.log('- Avg time per employee:', (result.metrics.processingTime / result.metrics.totalProcessed).toFixed(2) + 'ms');
        console.log('- SQL queries per employee:', (result.metrics.sqlQueries / result.metrics.totalProcessed).toFixed(2));
      }
      
    } else {
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testOptimizedAnomalyDetection();
