const mysql = require('mysql2/promise');
require('dotenv').config();

class SampleAttritionDataCreator {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
          rejectUnauthorized: false
        }
      });
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async createSampleAttritionData() {
    try {
      console.log('🔧 Creating sample attrition prediction data...');

      // First, get existing employees
      const [employees] = await this.connection.execute(
        'SELECT id, first_name, last_name, employee_code FROM employees LIMIT 10'
      );

      if (employees.length === 0) {
        console.log('⚠️ No employees found. Please create employees first.');
        return;
      }

      console.log(`📊 Found ${employees.length} employees`);

      // Clear existing attrition predictions
      await this.connection.execute('DELETE FROM ai_attrition_predictions');
      console.log('🗑️ Cleared existing attrition predictions');

      // Sample attrition data with realistic risk factors
      const samplePredictions = [
        {
          employeeId: employees[0]?.id,
          riskScore: 0.85,
          riskLevel: 'critical',
          factors: ['low_performance', 'high_absence', 'no_promotion'],
          recommendations: ['immediate_intervention', 'career_discussion', 'workload_review']
        },
        {
          employeeId: employees[1]?.id,
          riskScore: 0.72,
          riskLevel: 'high',
          factors: ['frequent_late', 'low_engagement', 'skill_gap'],
          recommendations: ['training_program', 'mentorship', 'flexible_schedule']
        },
        {
          employeeId: employees[2]?.id,
          riskScore: 0.58,
          riskLevel: 'medium',
          factors: ['average_performance', 'limited_growth'],
          recommendations: ['development_plan', 'goal_setting']
        },
        {
          employeeId: employees[3]?.id,
          riskScore: 0.45,
          riskLevel: 'medium',
          factors: ['work_life_balance', 'compensation_concerns'],
          recommendations: ['benefits_review', 'flexible_options']
        },
        {
          employeeId: employees[4]?.id,
          riskScore: 0.25,
          riskLevel: 'low',
          factors: ['stable_performance'],
          recommendations: ['maintain_engagement', 'recognition_program']
        }
      ];

      // Add more employees if available
      if (employees.length > 5) {
        for (let i = 5; i < Math.min(employees.length, 10); i++) {
          const randomRisk = Math.random();
          let riskLevel, factors, recommendations;

          if (randomRisk > 0.7) {
            riskLevel = 'high';
            factors = ['performance_issues', 'attendance_problems'];
            recommendations = ['performance_plan', 'support_program'];
          } else if (randomRisk > 0.4) {
            riskLevel = 'medium';
            factors = ['moderate_concerns'];
            recommendations = ['regular_checkins', 'development_opportunities'];
          } else {
            riskLevel = 'low';
            factors = ['stable_employee'];
            recommendations = ['maintain_satisfaction', 'growth_opportunities'];
          }

          samplePredictions.push({
            employeeId: employees[i].id,
            riskScore: randomRisk,
            riskLevel,
            factors,
            recommendations
          });
        }
      }

      // Insert sample predictions
      for (const prediction of samplePredictions) {
        if (prediction.employeeId) {
          await this.connection.execute(`
            INSERT INTO ai_attrition_predictions (
              employee_id, risk_score, risk_level, factors, recommendations,
              prediction_date, model_version, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, CURDATE(), '1.0', NOW(), NOW())
          `, [
            prediction.employeeId,
            prediction.riskScore,
            prediction.riskLevel,
            JSON.stringify(prediction.factors),
            JSON.stringify(prediction.recommendations)
          ]);
        }
      }

      console.log(`✅ Created ${samplePredictions.length} sample attrition predictions`);

      // Verify the data
      const [results] = await this.connection.execute(`
        SELECT ap.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name
        FROM ai_attrition_predictions ap
        JOIN employees e ON ap.employee_id = e.id
        ORDER BY ap.risk_score DESC
      `);

      console.log('\n📊 Sample Attrition Predictions Created:');
      results.forEach(pred => {
        console.log(`   ${pred.employee_name}: ${(pred.risk_score * 100).toFixed(1)}% risk (${pred.risk_level})`);
      });

      console.log('\n🎯 Summary:');
      const summary = results.reduce((acc, pred) => {
        acc[pred.risk_level] = (acc[pred.risk_level] || 0) + 1;
        return acc;
      }, {});

      Object.entries(summary).forEach(([level, count]) => {
        console.log(`   ${level.toUpperCase()}: ${count} employees`);
      });

    } catch (error) {
      console.error('❌ Error creating sample data:', error);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
async function main() {
  const creator = new SampleAttritionDataCreator();
  
  try {
    await creator.connect();
    await creator.createSampleAttritionData();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await creator.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = SampleAttritionDataCreator;
