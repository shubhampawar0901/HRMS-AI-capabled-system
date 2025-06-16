const { executeQuery } = require('../config/database');

class AIAttendanceAnomaly {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.anomalyType = data.anomaly_type;
    this.detectedDate = data.detected_date;
    this.anomalyData = data.anomaly_data;
    this.severity = data.severity;
    this.description = data.description;
    this.recommendations = data.recommendations;
    this.status = data.status;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    // Include employee details if available
    this.employee_name = data.employee_name;
    this.employeeName = data.employee_name; // Alias for frontend compatibility
    this.employee_code = data.employee_code;
    this.department_name = data.department_name;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT aa.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code
      FROM ai_attendance_anomalies aa
      LEFT JOIN employees e ON aa.employee_id = e.id
      WHERE aa.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new AIAttendanceAnomaly(rows[0]) : null;
  }

  static async create(anomalyData) {
    const query = `
      INSERT INTO ai_attendance_anomalies (
        employee_id, anomaly_type, detected_date, anomaly_data,
        severity, description, recommendations, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await executeQuery(query, [
      anomalyData.employeeId,
      anomalyData.anomalyType,
      anomalyData.detectedDate,
      JSON.stringify(anomalyData.anomalyData),
      anomalyData.severity,
      anomalyData.description,
      JSON.stringify(anomalyData.recommendations),
      anomalyData.status || 'active'
    ]);
    
    return await AIAttendanceAnomaly.findById(result.insertId);
  }

  static async findByEmployee(employeeId, options = {}) {
    let query = 'SELECT * FROM ai_attendance_anomalies WHERE employee_id = ?';
    const params = [employeeId];
    
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }
    
    query += ' ORDER BY detected_date DESC';
    
    const rows = await executeQuery(query, params);
    return rows.map(row => new AIAttendanceAnomaly(row));
  }

  static async findExisting(criteria) {
    const { employeeId, anomalyType, detectedDate, status } = criteria;

    const query = `
      SELECT * FROM ai_attendance_anomalies
      WHERE employee_id = ?
        AND anomaly_type = ?
        AND DATE(detected_date) = DATE(?)
        AND status = ?
      LIMIT 1
    `;

    const rows = await executeQuery(query, [employeeId, anomalyType, detectedDate, status]);
    return rows.length > 0 ? new AIAttendanceAnomaly(rows[0]) : null;
  }

  static async findExistingWithDateRange(criteria) {
    const { employeeId, anomalyType, dateRangeStart, dateRangeEnd, status } = criteria;

    // Fixed query - simplified and more reliable duplicate detection
    // Look for same employee + anomaly type + overlapping time period
    const query = `
      SELECT * FROM ai_attendance_anomalies
      WHERE employee_id = ?
        AND anomaly_type = ?
        AND status = ?
        AND (
          DATE(detected_date) BETWEEN DATE(?) AND DATE(?)
          OR DATE(detected_date) = DATE(?)
        )
      ORDER BY detected_date DESC, created_at DESC
      LIMIT 1
    `;

    const rows = await executeQuery(query, [
      employeeId,
      anomalyType,
      status,
      dateRangeStart,
      dateRangeEnd,
      dateRangeStart // Also check for exact date match
    ]);
    return rows.length > 0 ? new AIAttendanceAnomaly(rows[0]) : null;
  }

  static async findExistingEnhanced(criteria) {
    const { employeeId, anomalyType, dateRangeStart, dateRangeEnd, status } = criteria;

    // Enhanced method with better duplicate detection logic
    const query = `
      SELECT * FROM ai_attendance_anomalies
      WHERE employee_id = ?
        AND anomaly_type = ?
        AND status = ?
        AND DATE(detected_date) >= DATE(?)
        AND DATE(detected_date) <= DATE(?)
      ORDER BY detected_date DESC, created_at DESC
      LIMIT 1
    `;

    const rows = await executeQuery(query, [
      employeeId,
      anomalyType,
      status,
      dateRangeStart,
      dateRangeEnd
    ]);
    return rows.length > 0 ? new AIAttendanceAnomaly(rows[0]) : null;
  }

  // New method to find and clean up duplicate anomalies
  static async findDuplicates(employeeId, anomalyType, dateRangeStart, dateRangeEnd) {
    const query = `
      SELECT * FROM ai_attendance_anomalies
      WHERE employee_id = ?
        AND anomaly_type = ?
        AND status = 'active'
        AND DATE(detected_date) BETWEEN DATE(?) AND DATE(?)
      ORDER BY created_at ASC
    `;

    const rows = await executeQuery(query, [
      employeeId,
      anomalyType,
      dateRangeStart,
      dateRangeEnd
    ]);
    return rows.map(row => new AIAttendanceAnomaly(row));
  }

  // Method to clean up duplicate anomalies (keep the latest, remove older ones)
  static async cleanupDuplicates(employeeId, anomalyType, dateRangeStart, dateRangeEnd) {
    const duplicates = await this.findDuplicates(employeeId, anomalyType, dateRangeStart, dateRangeEnd);

    if (duplicates.length <= 1) {
      return { cleaned: 0, kept: duplicates.length };
    }

    // Keep the most recent one (last in array after sorting by created_at ASC)
    const toKeep = duplicates[duplicates.length - 1];
    const toDelete = duplicates.slice(0, -1);

    console.log(`🧹 Cleaning up ${toDelete.length} duplicate anomalies for employee ${employeeId}, type: ${anomalyType}`);

    // Delete older duplicates
    for (const duplicate of toDelete) {
      await executeQuery('DELETE FROM ai_attendance_anomalies WHERE id = ?', [duplicate.id]);
    }

    return {
      cleaned: toDelete.length,
      kept: 1,
      keptRecord: toKeep,
      deletedIds: toDelete.map(d => d.id)
    };
  }

  // Method to check if an anomaly is a true duplicate (same data content)
  static async isDuplicateContent(existingAnomaly, newAnomalyData) {
    if (!existingAnomaly || !newAnomalyData) return false;

    const existingData = typeof existingAnomaly.anomalyData === 'string'
      ? JSON.parse(existingAnomaly.anomalyData)
      : existingAnomaly.anomalyData;

    // Compare key metrics to determine if it's the same anomaly
    const compareFields = [
      'lateCount', 'totalDays', 'latePercentage',
      'absentCount', 'absentPercentage',
      'earlyDepartures', 'earlyDeparturePercentage',
      'overtimeDays', 'overtimePercentage',
      'stdDev', 'avgHours',
      'weekendWorkDays', 'weekendWorkPercentage'
    ];

    let matchingFields = 0;
    let totalFields = 0;

    for (const field of compareFields) {
      if (existingData[field] !== undefined || newAnomalyData[field] !== undefined) {
        totalFields++;
        if (Math.abs((existingData[field] || 0) - (newAnomalyData[field] || 0)) < 0.1) {
          matchingFields++;
        }
      }
    }

    // Consider it a duplicate if 80% or more of the fields match
    return totalFields > 0 && (matchingFields / totalFields) >= 0.8;
  }

  static async getActiveAnomalies() {
    const query = `
      SELECT aa.*,
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             d.name as department_name
      FROM ai_attendance_anomalies aa
      JOIN employees e ON aa.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE aa.status = 'active'
      ORDER BY aa.severity DESC, aa.detected_date DESC
    `;

    const rows = await executeQuery(query);
    return rows.map(row => new AIAttendanceAnomaly(row));
  }

  static async update(id, updateData) {
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const params = [];

    if (updateData.status !== undefined) {
      updateFields.push('status = ?');
      params.push(updateData.status);
    }
    if (updateData.resolution !== undefined) {
      updateFields.push('resolution = ?');
      params.push(updateData.resolution);
    }
    if (updateData.ignoreReason !== undefined) {
      updateFields.push('ignore_reason = ?');
      params.push(updateData.ignoreReason);
    }
    if (updateData.resolvedAt !== undefined) {
      updateFields.push('resolved_at = ?');
      params.push(updateData.resolvedAt);
    }
    if (updateData.ignoredAt !== undefined) {
      updateFields.push('ignored_at = ?');
      params.push(updateData.ignoredAt);
    }
    if (updateData.anomalyData !== undefined) {
      updateFields.push('anomaly_data = ?');
      params.push(JSON.stringify(updateData.anomalyData));
    }
    if (updateData.severity !== undefined) {
      updateFields.push('severity = ?');
      params.push(updateData.severity);
    }
    if (updateData.description !== undefined) {
      updateFields.push('description = ?');
      params.push(updateData.description);
    }
    if (updateData.recommendations !== undefined) {
      updateFields.push('recommendations = ?');
      params.push(JSON.stringify(updateData.recommendations));
    }
    if (updateData.detectedDate !== undefined) {
      updateFields.push('detected_date = ?');
      params.push(updateData.detectedDate);
    }

    // Always update the updated_at timestamp
    updateFields.push('updated_at = NOW()');
    params.push(id);

    const query = `
      UPDATE ai_attendance_anomalies
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await executeQuery(query, params);
    return await AIAttendanceAnomaly.findById(id);
  }

  static async getStatistics(options = {}) {
    const { period, startDate, endDate, employeeId } = options;

    // Base query for filtering
    let whereClause = '1=1';
    const params = [];

    if (employeeId) {
      whereClause += ' AND employee_id = ?';
      params.push(employeeId);
    }

    // Calculate date ranges for different periods
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total active anomalies
    const totalActiveQuery = `
      SELECT COUNT(*) as count FROM ai_attendance_anomalies
      WHERE status = 'active' AND ${whereClause}
    `;
    const totalActiveResult = await executeQuery(totalActiveQuery, params);
    const totalActive = totalActiveResult[0].count;

    // Get new anomalies this week
    const newThisWeekQuery = `
      SELECT COUNT(*) as count FROM ai_attendance_anomalies
      WHERE status = 'active' AND DATE(detected_date) >= ? AND ${whereClause}
    `;
    const newThisWeekResult = await executeQuery(newThisWeekQuery, [weekStart.toISOString().split('T')[0], ...params]);
    const newThisWeek = newThisWeekResult[0].count;

    // Get resolved anomalies this month
    const resolvedThisMonthQuery = `
      SELECT COUNT(*) as count FROM ai_attendance_anomalies
      WHERE status = 'resolved' AND DATE(updated_at) >= ? AND ${whereClause}
    `;
    const resolvedThisMonthResult = await executeQuery(resolvedThisMonthQuery, [monthStart.toISOString().split('T')[0], ...params]);
    const resolvedThisMonth = resolvedThisMonthResult[0].count;

    // Get high priority anomalies
    const highPriorityQuery = `
      SELECT COUNT(*) as count FROM ai_attendance_anomalies
      WHERE status = 'active' AND severity = 'high' AND ${whereClause}
    `;
    const highPriorityResult = await executeQuery(highPriorityQuery, params);
    const highPriority = highPriorityResult[0].count;

    // Get severity distribution
    const severityDistributionQuery = `
      SELECT
        severity,
        COUNT(*) as count
      FROM ai_attendance_anomalies
      WHERE status = 'active' AND ${whereClause}
      GROUP BY severity
    `;
    const severityDistributionResult = await executeQuery(severityDistributionQuery, params);

    const severityDistribution = {
      high: 0,
      medium: 0,
      low: 0
    };

    severityDistributionResult.forEach(row => {
      if (row.severity && severityDistribution.hasOwnProperty(row.severity)) {
        severityDistribution[row.severity] = row.count;
      }
    });

    // Calculate trends (compare with previous period)
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevMonthStart = new Date(monthStart.getTime() - 30 * 24 * 60 * 60 * 1000);

    const prevWeekQuery = `
      SELECT COUNT(*) as count FROM ai_attendance_anomalies
      WHERE status = 'active' AND DATE(detected_date) >= ? AND DATE(detected_date) < ? AND ${whereClause}
    `;
    const prevWeekResult = await executeQuery(prevWeekQuery, [
      prevWeekStart.toISOString().split('T')[0],
      weekStart.toISOString().split('T')[0],
      ...params
    ]);
    const prevWeekCount = prevWeekResult[0].count;

    const prevMonthQuery = `
      SELECT COUNT(*) as count FROM ai_attendance_anomalies
      WHERE status = 'active' AND DATE(detected_date) >= ? AND DATE(detected_date) < ? AND ${whereClause}
    `;
    const prevMonthResult = await executeQuery(prevMonthQuery, [
      prevMonthStart.toISOString().split('T')[0],
      monthStart.toISOString().split('T')[0],
      ...params
    ]);
    const prevMonthCount = prevMonthResult[0].count;

    // Calculate percentage changes
    const weeklyChange = prevWeekCount > 0 ? ((newThisWeek - prevWeekCount) / prevWeekCount) * 100 : 0;
    const monthlyChange = prevMonthCount > 0 ? ((totalActive - prevMonthCount) / prevMonthCount) * 100 : 0;

    return {
      totalActive,
      newThisWeek,
      resolvedThisMonth,
      highPriority,
      trends: {
        weeklyChange: Math.round(weeklyChange * 10) / 10, // Round to 1 decimal
        monthlyChange: Math.round(monthlyChange * 10) / 10,
        severityDistribution
      },
      period,
      dateRange: {
        startDate,
        endDate
      }
    };
  }

  toJSON() {
    const obj = { ...this };
    if (typeof obj.anomalyData === 'string') {
      obj.anomalyData = JSON.parse(obj.anomalyData);
    }
    if (typeof obj.recommendations === 'string') {
      obj.recommendations = JSON.parse(obj.recommendations);
    }

    // Ensure numeric fields in anomalyData are properly converted to numbers
    if (obj.anomalyData && typeof obj.anomalyData === 'object') {
      const numericFields = [
        'stdDev', 'avgHours', 'variance', 'latePercentage', 'absentPercentage',
        'earlyDeparturePercentage', 'overtimePercentage', 'inconsistencyPercentage',
        'weekendDays', 'totalOvertimeHours', 'mostCommonLocationPercentage'
      ];

      numericFields.forEach(field => {
        if (obj.anomalyData[field] !== undefined && obj.anomalyData[field] !== null) {
          const numValue = parseFloat(obj.anomalyData[field]);
          if (!isNaN(numValue)) {
            obj.anomalyData[field] = numValue;
          }
        }
      });
    }

    return obj;
  }

  async save() {
    if (this.id) {
      return await AIAttendanceAnomaly.update(this.id, this);
    } else {
      return await AIAttendanceAnomaly.create(this);
    }
  }
}

module.exports = AIAttendanceAnomaly;
