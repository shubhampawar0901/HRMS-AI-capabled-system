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
    const query = `
      UPDATE ai_attendance_anomalies
      SET status = ?, resolution = ?, ignore_reason = ?, resolved_at = ?, ignored_at = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await executeQuery(query, [
      updateData.status || null,
      updateData.resolution || null,
      updateData.ignoreReason || null,
      updateData.resolvedAt || null,
      updateData.ignoredAt || null,
      id
    ]);

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
