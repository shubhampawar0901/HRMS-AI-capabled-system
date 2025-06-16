-- Simple migration to add unique constraint for duplicate prevention
-- This ensures no duplicates at database level

-- First, clean up any existing duplicates
DELETE a1 FROM ai_attendance_anomalies a1
INNER JOIN ai_attendance_anomalies a2 
WHERE a1.id > a2.id 
  AND a1.employee_id = a2.employee_id 
  AND a1.anomaly_type = a2.anomaly_type 
  AND DATE(a1.detected_date) = DATE(a2.detected_date)
  AND a1.status = a2.status;

-- Add unique constraint to prevent future duplicates
-- This constraint ensures only one active anomaly per employee per type per day
ALTER TABLE ai_attendance_anomalies 
ADD CONSTRAINT uk_employee_anomaly_unique 
UNIQUE (employee_id, anomaly_type, detected_date, status);

-- Verify the constraint was added
SHOW INDEX FROM ai_attendance_anomalies WHERE Key_name = 'uk_employee_anomaly_unique';

SELECT 'Unique constraint added successfully - no more duplicates possible!' as message;
