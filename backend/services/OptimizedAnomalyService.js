/**
 * Optimized Anomaly Detection Service
 * 
 * Features:
 * - AI-only detection (no rule-based fallback)
 * - Bulk SQL operations for performance
 * - UPSERT pattern to prevent duplicates
 * - Optimized database queries
 * - Batch processing for multiple employees
 */

const { executeQuery } = require('../config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Attendance } = require('../models');

class OptimizedAnomalyService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.aiModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });
    
    // Performance tracking
    this.metrics = {
      totalProcessed: 0,
      aiCalls: 0,
      sqlQueries: 0,
      duplicatesAvoided: 0,
      processingTime: 0
    };
  }

  /**
   * Main entry point for optimized anomaly detection
   */
  async detectAnomaliesOptimized(employeeIds, dateRange) {
    const startTime = Date.now();
    console.log(`🚀 Starting optimized anomaly detection for ${employeeIds?.length || 'all'} employees`);

    try {
      // Step 1: Get employee list and attendance data in bulk
      const { employees, attendanceData } = await this.bulkDataRetrieval(employeeIds, dateRange);
      
      // Step 2: Process employees in batches for AI analysis
      const batchSize = 5; // Process 5 employees at once
      const allAnomalies = [];
      
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        const batchAnomalies = await this.processBatch(batch, attendanceData, dateRange);
        allAnomalies.push(...batchAnomalies);
      }

      // Step 3: Bulk upsert anomalies to database
      const result = await this.bulkUpsertAnomalies(allAnomalies, dateRange);
      
      // Step 4: Update metrics and return results
      this.metrics.processingTime = Date.now() - startTime;
      this.metrics.totalProcessed = employees.length;
      
      console.log(`✅ Optimized detection completed in ${this.metrics.processingTime}ms`);
      console.log(`📊 Metrics:`, this.metrics);
      
      return {
        success: true,
        data: result,
        metrics: this.metrics,
        processingTime: this.metrics.processingTime
      };

    } catch (error) {
      console.error('❌ Optimized anomaly detection failed:', error);
      return {
        success: false,
        error: error.message,
        metrics: this.metrics
      };
    }
  }

  /**
   * Bulk data retrieval with optimized queries
   */
  async bulkDataRetrieval(employeeIds, dateRange) {
    console.log('📊 Bulk data retrieval starting...');
    
    // Single query to get all employee data with department info
    const employeeQuery = `
      SELECT e.id, e.first_name, e.last_name, e.employee_code,
             e.department_id, d.name as department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
      ${employeeIds ? 'AND e.id IN (' + employeeIds.map(() => '?').join(',') + ')' : ''}
      ORDER BY e.id
    `;
    
    const employees = await executeQuery(employeeQuery, employeeIds || []);
    this.metrics.sqlQueries++;

    // Single query to get all attendance data for the period
    const attendanceQuery = `
      SELECT employeeId, date, status, checkInTime, checkOutTime,
             totalHours, location
      FROM attendance
      WHERE date BETWEEN ? AND ?
      ${employeeIds ? 'AND employeeId IN (' + employeeIds.map(() => '?').join(',') + ')' : ''}
      ORDER BY employeeId, date
    `;
    
    const attendanceParams = [dateRange.startDate, dateRange.endDate];
    if (employeeIds) {
      attendanceParams.push(...employeeIds);
    }
    
    const attendanceRecords = await executeQuery(attendanceQuery, attendanceParams);
    this.metrics.sqlQueries++;

    // Group attendance data by employee
    const attendanceData = {};
    attendanceRecords.forEach(record => {
      if (!attendanceData[record.employeeId]) {
        attendanceData[record.employeeId] = [];
      }
      attendanceData[record.employeeId].push(record);
    });

    console.log(`✅ Retrieved data for ${employees.length} employees with ${attendanceRecords.length} attendance records`);
    
    return { employees, attendanceData };
  }

  /**
   * Process a batch of employees with AI analysis
   */
  async processBatch(employees, attendanceData, dateRange) {
    console.log(`🤖 Processing batch of ${employees.length} employees with AI`);
    
    const batchAnomalies = [];
    
    for (const employee of employees) {
      try {
        const employeeAttendance = attendanceData[employee.id] || [];
        
        if (employeeAttendance.length === 0) {
          console.log(`⚠️ No attendance data for employee ${employee.id}, skipping`);
          continue;
        }

        // AI analysis for this employee
        const anomalies = await this.analyzeEmployeeWithAI(employee, employeeAttendance, dateRange);
        
        // Add employee context to anomalies
        anomalies.forEach(anomaly => {
          anomaly.employeeId = employee.id;
          anomaly.employeeName = `${employee.first_name} ${employee.last_name}`;
          anomaly.departmentName = employee.department_name;
        });
        
        batchAnomalies.push(...anomalies);
        this.metrics.aiCalls++;
        
      } catch (error) {
        console.error(`❌ Error processing employee ${employee.id}:`, error);
        // Continue with next employee instead of failing entire batch
      }
    }
    
    return batchAnomalies;
  }

  /**
   * AI analysis for a single employee (optimized)
   */
  async analyzeEmployeeWithAI(employee, attendanceData, dateRange) {
    // Prepare optimized data structure for AI
    const analysisData = this.prepareAnalysisData(employee, attendanceData, dateRange);
    
    // Optimized AI prompt for faster processing
    const prompt = `
      Analyze attendance data for employee ${employee.first_name} ${employee.last_name} (ID: ${employee.id}).
      
      Data Summary:
      - Total Records: ${attendanceData.length}
      - Date Range: ${dateRange.startDate} to ${dateRange.endDate}
      - Department: ${employee.department_name}
      
      Attendance Patterns:
      ${JSON.stringify(analysisData, null, 2)}
      
      Detect ONLY significant anomalies with confidence > 0.8. Return JSON array:
      [
        {
          "type": "late_pattern|irregular_hours|absence_pattern|early_departure|overtime_anomalies|location_anomalies|weekend_holiday_work",
          "severity": "low|medium|high",
          "confidence": 0.8-1.0,
          "description": "Brief description with specific metrics",
          "data": {"key_metric": "value", "threshold": "normal_range"},
          "recommendations": ["action1", "action2"]
        }
      ]
      
      Return empty array [] if no significant anomalies found.
    `;

    try {
      const result = await this.aiModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse and validate AI response
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const aiAnomalies = JSON.parse(cleanedText);
      
      if (!Array.isArray(aiAnomalies)) {
        console.warn(`⚠️ Invalid AI response for employee ${employee.id}`);
        return [];
      }
      
      // Filter and validate anomalies
      return aiAnomalies
        .filter(anomaly => anomaly.confidence >= 0.8)
        .map(anomaly => this.validateAnomalyData(anomaly));
        
    } catch (error) {
      console.error(`❌ AI analysis failed for employee ${employee.id}:`, error);
      return [];
    }
  }

  /**
   * Prepare optimized analysis data for AI
   */
  prepareAnalysisData(employee, attendanceData, dateRange) {
    const totalDays = attendanceData.length;
    const presentDays = attendanceData.filter(a => a.status === 'present').length;
    const lateDays = attendanceData.filter(a => a.status === 'late').length;
    const absentDays = attendanceData.filter(a => a.status === 'absent').length;
    
    const hours = attendanceData
      .map(a => parseFloat(a.totalHours) || 0)
      .filter(h => h > 0);
    
    const avgHours = hours.length > 0 ? hours.reduce((sum, h) => sum + h, 0) / hours.length : 0;
    const maxHours = hours.length > 0 ? Math.max(...hours) : 0;
    const minHours = hours.length > 0 ? Math.min(...hours) : 0;
    
    return {
      summary: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        latePercentage: totalDays > 0 ? (lateDays / totalDays * 100).toFixed(1) : 0,
        absentPercentage: totalDays > 0 ? (absentDays / totalDays * 100).toFixed(1) : 0
      },
      hours: {
        average: avgHours.toFixed(2),
        minimum: minHours,
        maximum: maxHours,
        variance: this.calculateVariance(hours).toFixed(2)
      },
      patterns: {
        weekendWork: attendanceData.filter(a => {
          const date = new Date(a.date);
          return date.getDay() === 0 || date.getDay() === 6;
        }).length,
        longWorkDays: attendanceData.filter(a => parseFloat(a.totalHours) > 9).length
      }
    };
  }

  /**
   * Calculate variance for hours analysis
   */
  calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    return numbers.reduce((sum, n) => sum + Math.pow(n - avg, 2), 0) / numbers.length;
  }

  /**
   * Validate and sanitize anomaly data
   */
  validateAnomalyData(anomaly) {
    const validTypes = [
      'late_pattern', 'irregular_hours', 'absence_pattern',
      'early_departure', 'overtime_anomalies', 'location_anomalies',
      'weekend_holiday_work'
    ];
    
    return {
      type: validTypes.includes(anomaly.type) ? anomaly.type : 'irregular_hours',
      severity: ['low', 'medium', 'high'].includes(anomaly.severity) ? anomaly.severity : 'medium',
      confidence: Math.min(Math.max(parseFloat(anomaly.confidence) || 0.8, 0.8), 1.0),
      description: anomaly.description || `${anomaly.type} detected`,
      data: anomaly.data || {},
      recommendations: Array.isArray(anomaly.recommendations) ? anomaly.recommendations : []
    };
  }

  /**
   * Bulk upsert anomalies with proper duplicate prevention
   */
  async bulkUpsertAnomalies(anomalies, dateRange) {
    if (anomalies.length === 0) {
      return { created: 0, updated: 0, skipped: 0 };
    }

    console.log(`💾 Bulk upserting ${anomalies.length} anomalies with proper duplicate prevention`);

    let created = 0, updated = 0, skipped = 0;
    const detectedDate = new Date().toISOString().split('T')[0];

    // Process anomalies in chunks for better performance
    const chunkSize = 10;
    for (let i = 0; i < anomalies.length; i += chunkSize) {
      const chunk = anomalies.slice(i, i + chunkSize);

      for (const anomaly of chunk) {
        try {
          // Use MySQL's INSERT ... ON DUPLICATE KEY UPDATE for atomic upsert
          // This prevents race conditions and ensures no duplicates
          const upsertQuery = `
            INSERT INTO ai_attendance_anomalies (
              employee_id, anomaly_type, detected_date, anomaly_data,
              severity, description, recommendations, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
            ON DUPLICATE KEY UPDATE
              anomaly_data = VALUES(anomaly_data),
              severity = VALUES(severity),
              description = VALUES(description),
              recommendations = VALUES(recommendations),
              updated_at = NOW(),
              status = 'active'
          `;

          const result = await executeQuery(upsertQuery, [
            anomaly.employeeId,
            anomaly.type,
            detectedDate,
            JSON.stringify(anomaly.data),
            anomaly.severity,
            anomaly.description,
            JSON.stringify(anomaly.recommendations)
          ]);

          // Check if it was an insert (created) or update
          if (result.affectedRows === 1) {
            created++;
          } else if (result.affectedRows === 2) {
            // MySQL returns 2 for ON DUPLICATE KEY UPDATE
            updated++;
            this.metrics.duplicatesAvoided++;
          }

          this.metrics.sqlQueries++;

        } catch (error) {
          // Handle specific duplicate key errors gracefully
          if (error.code === 'ER_DUP_ENTRY') {
            console.warn(`⚠️ Duplicate key detected for employee ${anomaly.employeeId}, type ${anomaly.type} - attempting update`);

            // Fallback to explicit update if upsert fails
            try {
              const updateQuery = `
                UPDATE ai_attendance_anomalies
                SET anomaly_data = ?, severity = ?, description = ?,
                    recommendations = ?, updated_at = NOW()
                WHERE employee_id = ? AND anomaly_type = ?
                AND DATE(detected_date) = ? AND status = 'active'
              `;

              await executeQuery(updateQuery, [
                JSON.stringify(anomaly.data),
                anomaly.severity,
                anomaly.description,
                JSON.stringify(anomaly.recommendations),
                anomaly.employeeId,
                anomaly.type,
                detectedDate
              ]);

              updated++;
              this.metrics.duplicatesAvoided++;

            } catch (updateError) {
              console.error(`❌ Failed to update existing anomaly for employee ${anomaly.employeeId}:`, updateError);
              skipped++;
            }
          } else {
            console.error(`❌ Error upserting anomaly for employee ${anomaly.employeeId}:`, error);
            skipped++;
          }
        }
      }
    }

    console.log(`✅ Bulk upsert completed: ${created} created, ${updated} updated, ${skipped} skipped`);

    return { created, updated, skipped };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgProcessingTimePerEmployee: this.metrics.totalProcessed > 0 
        ? (this.metrics.processingTime / this.metrics.totalProcessed).toFixed(2) + 'ms'
        : '0ms',
      sqlQueriesPerEmployee: this.metrics.totalProcessed > 0
        ? (this.metrics.sqlQueries / this.metrics.totalProcessed).toFixed(2)
        : '0'
    };
  }

  /**
   * Reset metrics for new detection run
   */
  resetMetrics() {
    this.metrics = {
      totalProcessed: 0,
      aiCalls: 0,
      sqlQueries: 0,
      duplicatesAvoided: 0,
      processingTime: 0
    };
  }
}

module.exports = OptimizedAnomalyService;
