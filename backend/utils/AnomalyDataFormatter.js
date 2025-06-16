/**
 * Anomaly Data Formatter
 * Standardizes and formats anomaly data for consistent UI display
 */

class AnomalyDataFormatter {
  
  /**
   * Format anomaly data for UI display
   */
  static formatAnomalyForUI(anomaly) {
    const formatted = {
      ...anomaly,
      displayMetrics: this.extractDisplayMetrics(anomaly),
      primaryMetric: this.getPrimaryMetric(anomaly),
      secondaryMetrics: this.getSecondaryMetrics(anomaly),
      visualData: this.getVisualizationData(anomaly)
    };
    
    return formatted;
  }

  /**
   * Extract key display metrics based on anomaly type
   */
  static extractDisplayMetrics(anomaly) {
    const { anomalyType, anomalyData } = anomaly;
    
    switch (anomalyType) {
      case 'late_pattern':
        return this.formatLatePatternMetrics(anomalyData);
      
      case 'irregular_hours':
        return this.formatIrregularHoursMetrics(anomalyData);
      
      case 'absence_pattern':
        return this.formatAbsencePatternMetrics(anomalyData);
      
      case 'weekend_holiday_work':
        return this.formatWeekendWorkMetrics(anomalyData);
      
      case 'overtime_anomalies':
        return this.formatOvertimeMetrics(anomalyData);
      
      default:
        return this.formatGenericMetrics(anomalyData);
    }
  }

  /**
   * Format late pattern metrics
   */
  static formatLatePatternMetrics(data) {
    return {
      primaryValue: data.latePercentage || data.frequency || 0,
      primaryUnit: '%',
      primaryLabel: 'Late Rate',
      threshold: data.typicalLatePercentage || data.threshold || '20%',
      comparison: 'vs normal',
      severity: this.calculateSeverityLevel(data.latePercentage, 20),
      details: {
        frequency: data.frequency || 'N/A',
        deviation: data.deviation || 'N/A',
        impact: data.impact || 'Affects punctuality and team coordination'
      }
    };
  }

  /**
   * Format irregular hours metrics
   */
  static formatIrregularHoursMetrics(data) {
    const variance = parseFloat(data.hours_variance || data.variance || 0);
    const avgHours = parseFloat(data.average_hours || data.avg_hours || 0);
    
    return {
      primaryValue: variance,
      primaryUnit: 'hrs',
      primaryLabel: 'Hour Variance',
      threshold: data.acceptable_variance_threshold || '2 hrs',
      comparison: 'vs acceptable',
      severity: this.calculateSeverityLevel(variance, 2),
      details: {
        averageHours: avgHours.toFixed(1) + ' hrs',
        minHours: data.minimum_hours || data.min_hours || 'N/A',
        maxHours: data.maximum_hours || data.max_hours || 'N/A',
        impact: data.impact || 'Inconsistent work patterns affect productivity'
      }
    };
  }

  /**
   * Format absence pattern metrics
   */
  static formatAbsencePatternMetrics(data) {
    const absentRate = parseFloat(data.absentPercentage || data.absence_rate || 0);
    
    return {
      primaryValue: absentRate,
      primaryUnit: '%',
      primaryLabel: 'Absence Rate',
      threshold: data.threshold || '10%',
      comparison: 'vs normal',
      severity: this.calculateSeverityLevel(absentRate, 10),
      details: {
        frequency: data.frequency || 'N/A',
        pattern: data.pattern || 'Irregular absences',
        impact: data.impact || 'High absence rate affects team productivity'
      }
    };
  }

  /**
   * Format weekend work metrics
   */
  static formatWeekendWorkMetrics(data) {
    const weekendDays = parseInt(data.weekendWorkDays || data.weekend_days || 0);
    
    return {
      primaryValue: weekendDays,
      primaryUnit: 'days',
      primaryLabel: 'Weekend Work',
      threshold: data.typicalWeekendWorkDays || '0-1 days',
      comparison: 'vs typical',
      severity: this.calculateSeverityLevel(weekendDays, 1),
      details: {
        frequency: data.frequency || `${weekendDays} weekend days`,
        deviation: data.deviation || 'Above normal',
        impact: data.impact || 'Potential burnout and work-life balance issues'
      }
    };
  }

  /**
   * Format overtime metrics
   */
  static formatOvertimeMetrics(data) {
    const longWorkDays = parseInt(data.long_work_days || data.overtime_days || 0);
    const maxHours = parseFloat(data.max_hours || data.maximum_hours || 0);
    
    return {
      primaryValue: longWorkDays,
      primaryUnit: 'days',
      primaryLabel: 'Long Work Days',
      threshold: '2-3 days/month',
      comparison: 'vs normal',
      severity: this.calculateSeverityLevel(longWorkDays, 3),
      details: {
        maxHours: maxHours + ' hrs',
        averageHours: data.average_hours || 'N/A',
        impact: data.impact || 'Excessive overtime may lead to burnout'
      }
    };
  }

  /**
   * Format generic metrics for unknown types
   */
  static formatGenericMetrics(data) {
    return {
      primaryValue: 'N/A',
      primaryUnit: '',
      primaryLabel: 'Anomaly Detected',
      threshold: 'Normal Range',
      comparison: 'vs expected',
      severity: 'medium',
      details: {
        rawData: JSON.stringify(data, null, 2)
      }
    };
  }

  /**
   * Get primary metric for card display
   */
  static getPrimaryMetric(anomaly) {
    const metrics = this.extractDisplayMetrics(anomaly);
    return {
      value: metrics.primaryValue,
      unit: metrics.primaryUnit,
      label: metrics.primaryLabel,
      severity: metrics.severity
    };
  }

  /**
   * Get secondary metrics for detailed view
   */
  static getSecondaryMetrics(anomaly) {
    const metrics = this.extractDisplayMetrics(anomaly);
    return {
      threshold: metrics.threshold,
      comparison: metrics.comparison,
      details: metrics.details
    };
  }

  /**
   * Get data for visualization (charts, progress bars)
   */
  static getVisualizationData(anomaly) {
    const metrics = this.extractDisplayMetrics(anomaly);
    const { anomalyType } = anomaly;
    
    // Calculate progress percentage for visual indicators
    let progressPercentage = 0;
    let maxValue = 100;
    
    switch (anomalyType) {
      case 'late_pattern':
      case 'absence_pattern':
        progressPercentage = Math.min(metrics.primaryValue, 100);
        maxValue = 100;
        break;
      
      case 'irregular_hours':
        progressPercentage = Math.min((metrics.primaryValue / 10) * 100, 100);
        maxValue = 10;
        break;
      
      case 'weekend_holiday_work':
      case 'overtime_anomalies':
        progressPercentage = Math.min((metrics.primaryValue / 7) * 100, 100);
        maxValue = 7;
        break;
      
      default:
        progressPercentage = 50;
        maxValue = 100;
    }
    
    return {
      progressPercentage: Math.round(progressPercentage),
      maxValue,
      colorScheme: this.getSeverityColorScheme(metrics.severity),
      chartData: this.generateChartData(anomaly)
    };
  }

  /**
   * Calculate severity level based on value and threshold
   */
  static calculateSeverityLevel(value, threshold) {
    const ratio = value / threshold;
    
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Get color scheme based on severity
   */
  static getSeverityColorScheme(severity) {
    const schemes = {
      high: {
        primary: '#ef4444',
        secondary: '#fef2f2',
        gradient: 'from-red-500 to-red-600'
      },
      medium: {
        primary: '#f59e0b',
        secondary: '#fffbeb',
        gradient: 'from-amber-500 to-orange-500'
      },
      low: {
        primary: '#3b82f6',
        secondary: '#eff6ff',
        gradient: 'from-blue-500 to-indigo-500'
      }
    };
    
    return schemes[severity] || schemes.medium;
  }

  /**
   * Generate chart data for visualization
   */
  static generateChartData(anomaly) {
    const { anomalyType, anomalyData } = anomaly;
    
    // This would generate data for mini-charts in the UI
    // For now, return basic structure
    return {
      type: 'progress',
      data: [],
      labels: [],
      colors: this.getSeverityColorScheme(anomaly.severity)
    };
  }

  /**
   * Format anomaly list for UI consumption
   */
  static formatAnomalyList(anomalies) {
    return anomalies.map(anomaly => this.formatAnomalyForUI(anomaly));
  }

  /**
   * Get human-readable anomaly type name
   */
  static getAnomalyTypeName(type) {
    const names = {
      'late_pattern': 'Late Arrival Pattern',
      'irregular_hours': 'Irregular Working Hours',
      'absence_pattern': 'High Absence Rate',
      'weekend_holiday_work': 'Weekend Work Pattern',
      'overtime_anomalies': 'Excessive Overtime',
      'early_departure': 'Early Departure Pattern',
      'location_anomalies': 'Location Inconsistencies'
    };
    
    return names[type] || 'Attendance Anomaly';
  }

  /**
   * Get anomaly type description
   */
  static getAnomalyTypeDescription(type) {
    const descriptions = {
      'late_pattern': 'Employee consistently arrives late to work',
      'irregular_hours': 'Significant variation in daily working hours',
      'absence_pattern': 'Higher than normal absence rate detected',
      'weekend_holiday_work': 'Unusual weekend or holiday work pattern',
      'overtime_anomalies': 'Excessive overtime hours worked',
      'early_departure': 'Pattern of leaving work early',
      'location_anomalies': 'Inconsistent work location patterns'
    };
    
    return descriptions[type] || 'Unusual attendance pattern detected';
  }
}

module.exports = AnomalyDataFormatter;
