const { executeQuery } = require('./config/database');

async function createPerformanceData() {
  try {
    console.log('🔗 Connecting to database...');
    
    // First, let's check if we have employees
    const employees = await executeQuery('SELECT id, first_name, last_name FROM employees LIMIT 5');
    console.log('👥 Found employees:', employees.length);
    
    if (employees.length === 0) {
      console.log('⚠️  No employees found. Creating sample employees first...');
      
      // Create sample employees
      const sampleEmployees = [
        { user_id: 2, first_name: 'John', last_name: 'Manager', employee_code: 'EMP001', department_id: 1 },
        { user_id: 3, first_name: 'Jane', last_name: 'Employee', employee_code: 'EMP002', department_id: 1 }
      ];
      
      for (const emp of sampleEmployees) {
        try {
          await executeQuery(
            'INSERT INTO employees (user_id, first_name, last_name, employee_code, department_id) VALUES (?, ?, ?, ?, ?)',
            [emp.user_id, emp.first_name, emp.last_name, emp.employee_code, emp.department_id]
          );
          console.log(`✅ Created employee: ${emp.first_name} ${emp.last_name}`);
        } catch (error) {
          if (error.code !== 'ER_DUP_ENTRY') {
            console.log(`⚠️  Error creating employee ${emp.first_name}: ${error.message}`);
          } else {
            console.log(`ℹ️  Employee already exists: ${emp.first_name} ${emp.last_name}`);
          }
        }
      }
      
      // Refresh employees list
      const updatedEmployees = await executeQuery('SELECT id, first_name, last_name FROM employees LIMIT 5');
      employees.push(...updatedEmployees);
    }
    
    console.log('📊 Creating performance goals...');
    
    // Create sample performance goals
    const sampleGoals = [
      {
        employee_id: employees[0]?.id || 1,
        title: 'Improve Sales Performance',
        description: 'Increase quarterly sales by 15%',
        target_date: '2024-12-31',
        status: 'active',
        achievement_percentage: 75.00,
        created_by: 1
      },
      {
        employee_id: employees[1]?.id || 2,
        title: 'Complete Training Program',
        description: 'Finish advanced technical training course',
        target_date: '2024-11-30',
        status: 'completed',
        achievement_percentage: 100.00,
        created_by: 1
      },
      {
        employee_id: employees[0]?.id || 1,
        title: 'Team Leadership Development',
        description: 'Lead a cross-functional project team',
        target_date: '2025-03-31',
        status: 'active',
        achievement_percentage: 25.00,
        created_by: 2
      }
    ];
    
    for (const goal of sampleGoals) {
      try {
        await executeQuery(
          'INSERT INTO performance_goals (employee_id, title, description, target_date, status, achievement_percentage, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [goal.employee_id, goal.title, goal.description, goal.target_date, goal.status, goal.achievement_percentage, goal.created_by]
        );
        console.log(`✅ Created goal: ${goal.title}`);
      } catch (error) {
        console.log(`⚠️  Error creating goal ${goal.title}: ${error.message}`);
      }
    }
    
    console.log('📋 Creating performance reviews...');
    
    // Create sample performance reviews
    const sampleReviews = [
      {
        employee_id: employees[0]?.id || 1,
        reviewer_id: 1,
        review_period: 'Q3 2024',
        overall_rating: 4.2,
        comments: 'Excellent performance this quarter. Shows strong leadership skills and consistently meets targets.',
        status: 'approved'
      },
      {
        employee_id: employees[1]?.id || 2,
        reviewer_id: 2,
        review_period: 'Q3 2024',
        overall_rating: 3.8,
        comments: 'Good performance with room for improvement in communication skills.',
        status: 'submitted'
      },
      {
        employee_id: employees[0]?.id || 1,
        reviewer_id: 1,
        review_period: 'Q2 2024',
        overall_rating: 4.5,
        comments: 'Outstanding performance. Exceeded all expectations and helped mentor junior team members.',
        status: 'approved'
      }
    ];
    
    for (const review of sampleReviews) {
      try {
        await executeQuery(
          'INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, overall_rating, comments, status) VALUES (?, ?, ?, ?, ?, ?)',
          [review.employee_id, review.reviewer_id, review.review_period, review.overall_rating, review.comments, review.status]
        );
        console.log(`✅ Created review: ${review.review_period} for employee ${review.employee_id}`);
      } catch (error) {
        console.log(`⚠️  Error creating review: ${error.message}`);
      }
    }
    
    console.log('🎉 Performance data creation completed!');
    
    // Verify data
    const goalCount = await executeQuery('SELECT COUNT(*) as count FROM performance_goals');
    const reviewCount = await executeQuery('SELECT COUNT(*) as count FROM performance_reviews');
    
    console.log(`📊 Created ${goalCount[0].count} performance goals`);
    console.log(`📋 Created ${reviewCount[0].count} performance reviews`);
    
  } catch (error) {
    console.error('❌ Error creating performance data:', error);
  } finally {
    process.exit(0);
  }
}

createPerformanceData();
