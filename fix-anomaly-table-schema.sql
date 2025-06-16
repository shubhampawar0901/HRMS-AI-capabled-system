-- Fix AI Attendance Anomalies Table Schema
-- Add missing columns for resolution and ignore functionality
-- Add missing columns to ai_attendance_anomalies table
ALTER TABLE ai_attendance_anomalies
ADD COLUMN IF NOT EXISTS resolution TEXT COMMENT 'Resolution details when anomaly is resolved',
  ADD COLUMN IF NOT EXISTS ignore_reason TEXT COMMENT 'Reason when anomaly is ignored',
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL COMMENT 'Timestamp when anomaly was resolved',
  ADD COLUMN IF NOT EXISTS ignored_at TIMESTAMP NULL COMMENT 'Timestamp when anomaly was ignored',
  ADD COLUMN IF NOT EXISTS resolved_by INT NULL COMMENT 'User ID who resolved the anomaly',
  ADD COLUMN IF NOT EXISTS ignored_by INT NULL COMMENT 'User ID who ignored the anomaly';
-- Add foreign key constraints for resolved_by and ignored_by
ALTER TABLE ai_attendance_anomalies
ADD CONSTRAINT fk_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE
SET NULL,
  ADD CONSTRAINT fk_ignored_by FOREIGN KEY (ignored_by) REFERENCES users(id) ON DELETE
SET NULL;
-- Update anomaly_type enum to include all 7 types
ALTER TABLE ai_attendance_anomalies
MODIFY COLUMN anomaly_type ENUM(
    'late_pattern',
    'early_departure',
    'irregular_hours',
    'absence_pattern',
    'overtime_anomalies',
    'location_anomalies',
    'weekend_holiday_work'
  ) NOT NULL;
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resolved_at ON ai_attendance_anomalies(resolved_at);
CREATE INDEX IF NOT EXISTS idx_ignored_at ON ai_attendance_anomalies(ignored_at);
CREATE INDEX IF NOT EXISTS idx_resolved_by ON ai_attendance_anomalies(resolved_by);
CREATE INDEX IF NOT EXISTS idx_ignored_by ON ai_attendance_anomalies(ignored_by);
-- Show the updated table structure
DESCRIBE ai_attendance_anomalies;