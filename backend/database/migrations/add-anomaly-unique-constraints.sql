-- Migration: Add Unique Constraints to Prevent Anomaly Duplicates
-- Date: 2025-06-16
-- Purpose: Prevent duplicate anomaly records for same employee/type/date

-- First, let's add a composite index to improve query performance
-- and prepare for unique constraint
CREATE INDEX IF NOT EXISTS idx_anomaly_composite 
ON ai_attendance_anomalies(employee_id, anomaly_type, detected_date, status);

-- Add a unique constraint to prevent exact duplicates
-- This allows only one active anomaly per employee per type per day
ALTER TABLE ai_attendance_anomalies 
ADD CONSTRAINT uk_employee_anomaly_date 
UNIQUE (employee_id, anomaly_type, detected_date, status);

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anomaly_employee_type 
ON ai_attendance_anomalies(employee_id, anomaly_type);

CREATE INDEX IF NOT EXISTS idx_anomaly_status_date 
ON ai_attendance_anomalies(status, detected_date);

CREATE INDEX IF NOT EXISTS idx_anomaly_severity 
ON ai_attendance_anomalies(severity);

-- Add a check constraint to ensure anomaly_type is not empty
ALTER TABLE ai_attendance_anomalies 
ADD CONSTRAINT chk_anomaly_type_not_empty 
CHECK (anomaly_type IS NOT NULL AND anomaly_type != '');

-- Add a check constraint to ensure valid severity levels
ALTER TABLE ai_attendance_anomalies 
ADD CONSTRAINT chk_valid_severity 
CHECK (severity IN ('low', 'medium', 'high'));

-- Add a check constraint to ensure valid status values
ALTER TABLE ai_attendance_anomalies 
ADD CONSTRAINT chk_valid_status 
CHECK (status IN ('active', 'resolved', 'ignored'));

-- Update any existing records with empty anomaly_type to a default value
UPDATE ai_attendance_anomalies 
SET anomaly_type = 'unknown_pattern' 
WHERE anomaly_type IS NULL OR anomaly_type = '';

-- Update any existing records with invalid severity to 'medium'
UPDATE ai_attendance_anomalies 
SET severity = 'medium' 
WHERE severity NOT IN ('low', 'medium', 'high');

-- Update any existing records with invalid status to 'active'
UPDATE ai_attendance_anomalies 
SET status = 'active' 
WHERE status NOT IN ('active', 'resolved', 'ignored');

-- Add a trigger to automatically update the updated_at timestamp
DELIMITER //
CREATE TRIGGER IF NOT EXISTS tr_anomaly_updated_at
BEFORE UPDATE ON ai_attendance_anomalies
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Create a view for easy anomaly reporting
CREATE OR REPLACE VIEW v_anomaly_summary AS
SELECT 
    aa.id,
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
    CASE 
        WHEN aa.status = 'resolved' THEN aa.resolved_at
        WHEN aa.status = 'ignored' THEN aa.ignored_at
        ELSE NULL
    END as action_date
FROM ai_attendance_anomalies aa
JOIN employees e ON aa.employee_id = e.id
LEFT JOIN departments d ON e.department_id = d.id
ORDER BY aa.detected_date DESC, aa.created_at DESC;

-- Create a function to get anomaly statistics
DELIMITER //
CREATE FUNCTION IF NOT EXISTS fn_get_anomaly_count(
    p_employee_id INT,
    p_anomaly_type VARCHAR(50),
    p_status VARCHAR(20),
    p_days_back INT
) RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE anomaly_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO anomaly_count
    FROM ai_attendance_anomalies
    WHERE (p_employee_id IS NULL OR employee_id = p_employee_id)
      AND (p_anomaly_type IS NULL OR anomaly_type = p_anomaly_type)
      AND (p_status IS NULL OR status = p_status)
      AND (p_days_back IS NULL OR detected_date >= DATE_SUB(CURDATE(), INTERVAL p_days_back DAY));
    
    RETURN anomaly_count;
END//
DELIMITER ;

-- Add comments to the table for documentation
ALTER TABLE ai_attendance_anomalies 
COMMENT = 'Stores AI-detected attendance anomalies with duplicate prevention';

-- Add column comments for better documentation
ALTER TABLE ai_attendance_anomalies 
MODIFY COLUMN employee_id INT NOT NULL COMMENT 'Foreign key to employees table',
MODIFY COLUMN anomaly_type ENUM(
    'late_pattern',
    'early_departure', 
    'irregular_hours',
    'absence_pattern',
    'overtime_anomalies',
    'location_anomalies',
    'weekend_holiday_work',
    'unknown_pattern'
) NOT NULL COMMENT 'Type of anomaly detected',
MODIFY COLUMN detected_date DATE NOT NULL COMMENT 'Date when anomaly was detected',
MODIFY COLUMN anomaly_data JSON COMMENT 'Detailed anomaly data and metrics',
MODIFY COLUMN severity ENUM('low', 'medium', 'high') DEFAULT 'medium' COMMENT 'Severity level of the anomaly',
MODIFY COLUMN description TEXT COMMENT 'Human-readable description of the anomaly',
MODIFY COLUMN recommendations JSON COMMENT 'AI-generated recommendations for addressing the anomaly',
MODIFY COLUMN status ENUM('active', 'resolved', 'ignored') DEFAULT 'active' COMMENT 'Current status of the anomaly';

-- Create a stored procedure for safe anomaly insertion with duplicate checking
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_insert_anomaly_safe(
    IN p_employee_id INT,
    IN p_anomaly_type VARCHAR(50),
    IN p_detected_date DATE,
    IN p_anomaly_data JSON,
    IN p_severity VARCHAR(10),
    IN p_description TEXT,
    IN p_recommendations JSON,
    OUT p_result VARCHAR(20),
    OUT p_anomaly_id INT
)
BEGIN
    DECLARE existing_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'ERROR';
        SET p_anomaly_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Check for existing anomaly
    SELECT COUNT(*) INTO existing_count
    FROM ai_attendance_anomalies
    WHERE employee_id = p_employee_id
      AND anomaly_type = p_anomaly_type
      AND detected_date = p_detected_date
      AND status = 'active';
    
    IF existing_count > 0 THEN
        SET p_result = 'DUPLICATE';
        SET p_anomaly_id = NULL;
    ELSE
        INSERT INTO ai_attendance_anomalies (
            employee_id, anomaly_type, detected_date, anomaly_data,
            severity, description, recommendations, status, created_at, updated_at
        ) VALUES (
            p_employee_id, p_anomaly_type, p_detected_date, p_anomaly_data,
            p_severity, p_description, p_recommendations, 'active', NOW(), NOW()
        );
        
        SET p_anomaly_id = LAST_INSERT_ID();
        SET p_result = 'SUCCESS';
    END IF;
    
    COMMIT;
END//
DELIMITER ;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ai_attendance_anomalies TO 'hrms_app'@'%';
-- GRANT SELECT ON v_anomaly_summary TO 'hrms_app'@'%';
-- GRANT EXECUTE ON FUNCTION fn_get_anomaly_count TO 'hrms_app'@'%';
-- GRANT EXECUTE ON PROCEDURE sp_insert_anomaly_safe TO 'hrms_app'@'%';

-- Log the migration
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES (
    'add-anomaly-unique-constraints', 
    NOW(), 
    'Added unique constraints and indexes to prevent duplicate anomalies'
) ON DUPLICATE KEY UPDATE executed_at = NOW();

-- Display completion message
SELECT 'Anomaly duplicate prevention migration completed successfully!' as message;
