// Debug the stats queries
const { executeQuery } = require('./config/database');

async function debugStatsQueries() {
  try {
    console.log('🔍 Debugging Stats Queries\n');
    
    // Test 1: Total active anomalies
    console.log('1. Testing total active anomalies...');
    const totalActiveResult = await executeQuery('SELECT COUNT(*) as count FROM ai_attendance_anomalies WHERE status = "active"');
    console.log('Total active:', totalActiveResult[0].count);
    
    // Test 2: Check date ranges
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    console.log('\n2. Date ranges:');
    console.log('Week start:', weekStart.toISOString().split('T')[0]);
    console.log('Month start:', monthStart.toISOString().split('T')[0]);
    console.log('Today:', now.toISOString().split('T')[0]);
    
    // Test 3: New this week with DATE function
    console.log('\n3. Testing new this week...');
    const newThisWeekResult = await executeQuery(
      'SELECT COUNT(*) as count FROM ai_attendance_anomalies WHERE status = "active" AND DATE(detected_date) >= ?',
      [weekStart.toISOString().split('T')[0]]
    );
    console.log('New this week:', newThisWeekResult[0].count);
    
    // Test 4: High priority
    console.log('\n4. Testing high priority...');
    const highPriorityResult = await executeQuery(
      'SELECT COUNT(*) as count FROM ai_attendance_anomalies WHERE status = "active" AND severity = "high"'
    );
    console.log('High priority:', highPriorityResult[0].count);
    
    // Test 5: Severity distribution
    console.log('\n5. Testing severity distribution...');
    const severityResult = await executeQuery(
      'SELECT severity, COUNT(*) as count FROM ai_attendance_anomalies WHERE status = "active" GROUP BY severity'
    );
    console.log('Severity distribution:', severityResult);
    
    // Test 6: Check actual detected dates
    console.log('\n6. Checking actual detected dates...');
    const datesResult = await executeQuery(
      'SELECT id, DATE(detected_date) as detected_date, status, severity FROM ai_attendance_anomalies ORDER BY detected_date DESC'
    );
    console.log('Actual dates:', datesResult);
    
    // Test 7: Test the exact query from our stats method
    console.log('\n7. Testing exact stats query...');
    const whereClause = '1=1';
    const params = [];
    
    const totalActiveQuery = `
      SELECT COUNT(*) as count FROM ai_attendance_anomalies 
      WHERE status = 'active' AND ${whereClause}
    `;
    const exactResult = await executeQuery(totalActiveQuery, params);
    console.log('Exact query result:', exactResult[0].count);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

debugStatsQueries();
