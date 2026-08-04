ALTER TABLE leave_types
  ADD COLUMN IF NOT EXISTS leave_type_code VARCHAR(10) NULL AFTER leave_type_id,
  ADD COLUMN IF NOT EXISTS description VARCHAR(300) NULL AFTER leave_type_name,
  ADD COLUMN IF NOT EXISTS minimum_days DECIMAL(5,2) NOT NULL DEFAULT 1.00 AFTER annual_quota_days,
  ADD COLUMN IF NOT EXISTS maximum_days_per_request DECIMAL(5,2) NOT NULL DEFAULT 1.00 AFTER minimum_days;

UPDATE leave_types
SET leave_type_code = CONCAT('LT', LPAD(leave_type_id, 3, '0'))
WHERE leave_type_code IS NULL OR leave_type_code = '';

ALTER TABLE leave_types
  MODIFY leave_type_code VARCHAR(10) NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_leave_types_code
  ON leave_types (leave_type_code);

ALTER TABLE holidays
  ADD COLUMN IF NOT EXISTS holiday_type VARCHAR(50) NOT NULL DEFAULT 'Public Holiday' AFTER holiday_name,
  ADD COLUMN IF NOT EXISTS description VARCHAR(300) NULL AFTER holiday_type;
