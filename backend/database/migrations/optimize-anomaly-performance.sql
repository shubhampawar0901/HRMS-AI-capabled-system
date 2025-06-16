-- Migration: Optimize Anomaly Detection Performance
-- Date: 2025-06-16
-- Purpose: Add performance optimizations for AI-only anomaly detection
-- ==========================================
-- PERFORMANCE INDEXES
-- ==========================================
-- Composite index for anomaly lookups (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_anomaly_lookup_optimized ON ai_attendance_anomalies(employee_id, anomaly_type, detected_date, status);
-- Index for bulk anomaly retrieval
CREATE INDEX IF NOT EXISTS idx_anomaly_bulk_retrieval ON ai_attendance_anomalies(status, detected_date DESC, severity DESC);
-- Index for employee-specific queries
CREATE INDEX IF NOT EXISTS idx_anomaly_employee_status ON ai_attendance_anomalies(employee_id, status, detected_date DESC);
-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_anomaly_date_range ON ai_attendance_anomalies(detected_date, status, employee_id);
-- Index for statistics queries
CREATE INDEX IF NOT EXISTS idx_anomaly_stats ON ai_attendance_anomalies(status, severity, detected_date);
-- Attendance table optimization for bulk retrieval
CREATE INDEX IF NOT EXISTS idx_attendance_bulk_analysis ON attendance(employeeId, date, status, totalHours);
-- Employee table optimization
CREATE INDEX IF NOT EXISTS idx_employees_active_dept ON employees(active, department_id, id);
-- ==========================================
-- MATERIALIZED VIEW FOR EMPLOYEE DATA
-- ==========================================
-- Create a view for optimized employee data retrieval
CREATE OR REPLACE VIEW v_employees_optimized AS
SELECT e.id,
    e.first_name,
    e.last_name,
    e.employee_code,
    e.department_id,
    d.name as department_name,
    e.active,
    e.hire_date,
    e.position
FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
WHERE e.active = 1;
-- ==========================================
-- OPTIMIZED ANOMALY SUMMARY VIEW
-- ==========================================
CREATE OR REPLACE VIEW v_anomaly_dashboard_optimized AS
SELECT aa.id,
    aa.employee_id,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    e.employee_code,
    d.name as department_name,
    aa.anomaly_type,
    aa.detected_date,
    aa.severity,
    aa.status,
    aa.description,
    aa.created_at,
    aa.updated_at,
    -- Pre-calculated fields for better performance
    CASE
        WHEN aa.severity = 'high' THEN 3
        WHEN aa.severity = 'medium' THEN 2
        ELSE 1
    END as severity_order,
    DATEDIFF(CURDATE(), aa.detected_date) as days_since_detection,
    CASE
        WHEN aa.status = 'resolved' THEN aa.resolved_at
        WHEN aa.status = 'ignored' THEN aa.ignored_at
        ELSE NULL
    END as action_date
FROM ai_attendance_anomalies aa
    JOIN employees e ON aa.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
WHERE e.active = 1;
-- ==========================================
-- STORED PROCEDURES FOR BULK OPERATIONS
-- ==========================================
-- Procedure for bulk anomaly statistics
DELIMITER // CREATE PROCEDURE IF NOT EXISTS sp_get_anomaly_stats_optimized(
    IN p_employee_ids TEXT,
    IN p_date_from DATE,
    IN p_date_to DATE
) BEGIN
DECLARE sql_query TEXT;
-- Build dynamic query based on parameters
SET sql_query = '
        SELECT 
            COUNT(*) as total_active,
            SUM(CASE WHEN severity = "high" THEN 1 ELSE 0 END) as high_priority,
            SUM(CASE WHEN severity = "medium" THEN 1 ELSE 0 END) as medium_priority,
            SUM(CASE WHEN severity = "low" THEN 1 ELSE 0 END) as low_priority,
            SUM(CASE WHEN detected_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week,
            COUNT(DISTINCT employee_id) as affected_employees,
            COUNT(DISTINCT anomaly_type) as anomaly_types
        FROM ai_attendance_anomalies 
        WHERE status = "active"';
-- Add date filter if provided
IF p_date_from IS NOT NULL
AND p_date_to IS NOT NULL THEN
SET sql_query = CONCAT(
        sql_query,
        ' AND detected_date BETWEEN "',
        p_date_from,
        '" AND "',
        p_date_to,
        '"'
    );
END IF;
-- Add employee filter if provided
IF p_employee_ids IS NOT NULL
AND p_employee_ids != '' THEN
SET sql_query = CONCAT(
        sql_query,
        ' AND employee_id IN (',
        p_employee_ids,
        ')'
    );
END IF;
-- Execute the query
SET @sql = sql_query;
PREPARE stmt
FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
END // DELIMITER;
-- Procedure for bulk anomaly cleanup
DELIMITER // CREATE PROCEDURE IF NOT EXISTS sp_cleanup_duplicate_anomalies() BEGIN
DECLARE done INT DEFAULT FALSE;
DECLARE v_employee_id INT;
DECLARE v_anomaly_type VARCHAR(50);
DECLARE v_detection_date DATE;
DECLARE v_keep_id INT;
DECLARE v_duplicate_count INT;
DECLARE duplicate_cursor CURSOR FOR
SELECT employee_id,
    anomaly_type,
    DATE(detected_date) as detection_date,
    MIN(id) as keep_id,
    COUNT(*) as duplicate_count
FROM ai_attendance_anomalies
WHERE status = 'active'
GROUP BY employee_id,
    anomaly_type,
    DATE(detected_date)
HAVING COUNT(*) > 1;
DECLARE CONTINUE HANDLER FOR NOT FOUND
SET done = TRUE;
START TRANSACTION;
OPEN duplicate_cursor;
cleanup_loop: LOOP FETCH duplicate_cursor INTO v_employee_id,
v_anomaly_type,
v_detection_date,
v_keep_id,
v_duplicate_count;
IF done THEN LEAVE cleanup_loop;
END IF;
-- Delete duplicates, keep the one with minimum ID (oldest)
DELETE FROM ai_attendance_anomalies
WHERE employee_id = v_employee_id
    AND anomaly_type = v_anomaly_type
    AND DATE(detected_date) = v_detection_date
    AND status = 'active'
    AND id != v_keep_id;
END LOOP;
CLOSE duplicate_cursor;
COMMIT;
-- Return cleanup summary
SELECT 'Cleanup completed' as message,
    ROW_COUNT() as duplicates_removed;
END // DELIMITER;
-- ==========================================
-- FUNCTIONS FOR PERFORMANCE OPTIMIZATION
-- ==========================================
-- Function to get anomaly count efficiently
DELIMITER // CREATE FUNCTION IF NOT EXISTS fn_get_anomaly_count_fast(
    p_employee_id INT,
    p_status VARCHAR(20),
    p_days_back INT
) RETURNS INT READS SQL DATA DETERMINISTIC BEGIN
DECLARE anomaly_count INT DEFAULT 0;
SELECT COUNT(*) INTO anomaly_count
FROM ai_attendance_anomalies
WHERE (
        p_employee_id IS NULL
        OR employee_id = p_employee_id
    )
    AND (
        p_status IS NULL
        OR status = p_status
    )
    AND (
        p_days_back IS NULL
        OR detected_date >= DATE_SUB(CURDATE(), INTERVAL p_days_back DAY)
    );
RETURN anomaly_count;
END // DELIMITER;
-- Function to check if anomaly exists (for upsert operations)
DELIMITER // CREATE FUNCTION IF NOT EXISTS fn_anomaly_exists(
    p_employee_id INT,
    p_anomaly_type VARCHAR(50),
    p_detected_date DATE
) RETURNS INT READS SQL DATA DETERMINISTIC BEGIN
DECLARE anomaly_id INT DEFAULT 0;
SELECT id INTO anomaly_id
FROM ai_attendance_anomalies
WHERE employee_id = p_employee_id
    AND anomaly_type = p_anomaly_type
    AND DATE(detected_date) = p_detected_date
    AND status = 'active'
LIMIT 1;
RETURN COALESCE(anomaly_id, 0);
END // DELIMITER;
-- ==========================================
-- TRIGGERS FOR AUTOMATIC OPTIMIZATION
-- ==========================================
-- Trigger to update statistics when anomalies change
DELIMITER // CREATE TRIGGER IF NOT EXISTS tr_anomaly_stats_update
AFTER
INSERT ON ai_attendance_anomalies FOR EACH ROW BEGIN -- Update a statistics cache table if it exists
    -- This can be used for real-time dashboard updates
INSERT INTO anomaly_stats_cache (stat_date, total_active, last_updated)
VALUES (
        CURDATE(),
        (
            SELECT COUNT(*)
            FROM ai_attendance_anomalies
            WHERE status = 'active'
        ),
        NOW()
    ) ON DUPLICATE KEY
UPDATE total_active =
VALUES(total_active),
    last_updated = NOW();
END // DELIMITER;
-- ==========================================
-- CACHE TABLE FOR STATISTICS
-- ==========================================
-- Create cache table for frequently accessed statistics
CREATE TABLE IF NOT EXISTS anomaly_stats_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE UNIQUE,
    total_active INT DEFAULT 0,
    high_priority INT DEFAULT 0,
    medium_priority INT DEFAULT 0,
    low_priority INT DEFAULT 0,
    new_this_week INT DEFAULT 0,
    resolved_this_month INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_stat_date (stat_date),
    INDEX idx_last_updated (last_updated)
);
-- ==========================================
-- PERFORMANCE MONITORING
-- ==========================================
-- Create table to track query performance
CREATE TABLE IF NOT EXISTS anomaly_performance_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operation_type VARCHAR(50),
    employee_count INT,
    processing_time_ms INT,
    sql_queries_count INT,
    ai_calls_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_operation_type (operation_type),
    INDEX idx_created_at (created_at)
);
-- ==========================================
-- CLEANUP AND MAINTENANCE
-- ==========================================
-- Event scheduler for automatic cleanup (runs daily)
CREATE EVENT IF NOT EXISTS ev_daily_anomaly_cleanup ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP DO BEGIN -- Clean up old resolved anomalies (older than 6 months)
DELETE FROM ai_attendance_anomalies
WHERE status = 'resolved'
    AND resolved_at < DATE_SUB(CURDATE(), INTERVAL 6 MONTH);
-- Update statistics cache
INSERT INTO anomaly_stats_cache (stat_date, total_active, last_updated)
VALUES (
        CURDATE(),
        (
            SELECT COUNT(*)
            FROM ai_attendance_anomalies
            WHERE status = 'active'
        ),
        NOW()
    ) ON DUPLICATE KEY
UPDATE total_active =
VALUES(total_active),
    last_updated = NOW();
END;
-- ==========================================
-- GRANT PERMISSIONS
-- ==========================================
-- Grant necessary permissions for the application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ai_attendance_anomalies TO 'hrms_app'@'%';
-- GRANT SELECT ON v_employees_optimized TO 'hrms_app'@'%';
-- GRANT SELECT ON v_anomaly_dashboard_optimized TO 'hrms_app'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_get_anomaly_stats_optimized TO 'hrms_app'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_cleanup_duplicate_anomalies TO 'hrms_app'@'%';
-- GRANT EXECUTE ON FUNCTION fn_get_anomaly_count_fast TO 'hrms_app'@'%';
-- GRANT EXECUTE ON FUNCTION fn_anomaly_exists TO 'hrms_app'@'%';
-- Log the migration
INSERT INTO migration_log (migration_name, executed_at, description)
VALUES (
        'optimize-anomaly-performance',
        NOW(),
        'Added performance optimizations for AI-only anomaly detection'
    ) ON DUPLICATE KEY
UPDATE executed_at = NOW();
-- Display completion message
SELECT 'Anomaly detection performance optimization completed successfully!' as message;