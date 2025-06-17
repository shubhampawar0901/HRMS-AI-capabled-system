-- Migration: Add unique constraint to prevent duplicate payroll records
-- This ensures that only one payroll record can exist per employee per month/year

-- Check if the constraint already exists
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE TABLE_NAME = 'payroll_records' 
  AND CONSTRAINT_TYPE = 'UNIQUE' 
  AND CONSTRAINT_NAME = 'unique_employee_month_year';

-- Add unique constraint if it doesn't exist
-- Note: This will fail if duplicate records already exist
-- Run the cleanup script first if needed

ALTER TABLE payroll_records 
ADD CONSTRAINT unique_employee_month_year 
UNIQUE (employee_id, month, year);

-- Verify the constraint was added
SHOW INDEX FROM payroll_records WHERE Key_name = 'unique_employee_month_year';
