-- Authoritative fresh-database baseline for the current production schema.
-- Generated from the 2026-08-18 production schema evidence and cross-checked
-- with the current Master Data Dictionary. Historical migrations remain
-- incremental artifacts and are not a substitute for this baseline.
-- This file is passive: no application or Compose service runs it automatically.

SET NAMES utf8mb4;

CREATE TABLE roles (
  role_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(50) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (role_id),
  UNIQUE KEY uq_roles_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE departments (
  department_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (department_id),
  UNIQUE KEY uq_departments_name (department_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE positions (
  position_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  position_name VARCHAR(100) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (position_id),
  UNIQUE KEY uq_positions_name (position_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE employees (
  employee_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_code VARCHAR(20) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NULL,
  email VARCHAR(100) NOT NULL,
  profile_image_url VARCHAR(255) NULL,
  department_id INT UNSIGNED NOT NULL,
  position_id INT UNSIGNED NOT NULL,
  supervisor_id INT UNSIGNED NULL,
  hire_date DATE NOT NULL,
  status ENUM('active','inactive','resigned') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (employee_id),
  UNIQUE KEY uq_employees_employee_code (employee_code),
  UNIQUE KEY uq_employees_email (email),
  KEY idx_employees_department_id (department_id),
  KEY idx_employees_position_id (position_id),
  KEY idx_employees_supervisor_id (supervisor_id),
  KEY idx_employees_status (status),
  CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments (department_id) ON UPDATE CASCADE,
  CONSTRAINT fk_employees_position FOREIGN KEY (position_id) REFERENCES positions (position_id) ON UPDATE CASCADE,
  CONSTRAINT fk_employees_supervisor FOREIGN KEY (supervisor_id) REFERENCES employees (employee_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id INT UNSIGNED NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  username VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active','inactive','locked') NOT NULL DEFAULT 'active',
  failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  last_failed_login_at DATETIME NULL,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  password_changed_at DATETIME NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  token_version INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_employee_id (employee_id),
  UNIQUE KEY uq_users_username (username),
  KEY idx_users_role_id (role_id),
  KEY idx_users_status (status),
  CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id) ON UPDATE CASCADE,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leave_types (
  leave_type_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  leave_type_code VARCHAR(10) NOT NULL,
  leave_type_name VARCHAR(100) NOT NULL,
  description VARCHAR(300) NULL,
  annual_quota_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  minimum_days DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  maximum_days_per_request DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  requires_attachment TINYINT(1) NOT NULL DEFAULT 0,
  attachment_required_after_days DECIMAL(5,2) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (leave_type_id),
  UNIQUE KEY uq_leave_types_name (leave_type_name),
  UNIQUE KEY uq_leave_types_code (leave_type_code),
  KEY idx_leave_types_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leave_entitlements (
  entitlement_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id INT UNSIGNED NOT NULL,
  leave_type_id INT UNSIGNED NOT NULL,
  year INT UNSIGNED NOT NULL,
  total_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  used_days DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  updated_by INT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (entitlement_id),
  UNIQUE KEY uq_leave_entitlements_employee_type_year (employee_id, leave_type_id, year),
  KEY idx_leave_entitlements_employee_id (employee_id),
  KEY idx_leave_entitlements_leave_type_id (leave_type_id),
  KEY idx_leave_entitlements_year (year),
  KEY idx_leave_entitlements_updated_by (updated_by),
  CONSTRAINT fk_leave_entitlements_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id) ON UPDATE CASCADE,
  CONSTRAINT fk_leave_entitlements_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types (leave_type_id) ON UPDATE CASCADE,
  CONSTRAINT fk_leave_entitlements_updated_by FOREIGN KEY (updated_by) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leave_requests (
  leave_request_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_no VARCHAR(30) NULL,
  employee_id INT UNSIGNED NOT NULL,
  leave_type_id INT UNSIGNED NOT NULL,
  approver_employee_id INT UNSIGNED NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_days DECIMAL(5,2) NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('draft','pending','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
  submitted_at DATETIME NULL,
  approved_at DATETIME NULL,
  rejected_at DATETIME NULL,
  rejection_reason TEXT NULL,
  cancelled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (leave_request_id),
  UNIQUE KEY uq_leave_requests_request_no (request_no),
  KEY idx_leave_requests_employee_id (employee_id),
  KEY idx_leave_requests_leave_type_id (leave_type_id),
  KEY idx_leave_requests_approver_id (approver_employee_id),
  KEY idx_leave_requests_status (status),
  KEY idx_leave_requests_date_range (start_date, end_date),
  KEY idx_leave_requests_employee_status_date (employee_id, status, start_date),
  KEY idx_leave_requests_approver_status_submitted (approver_employee_id, status, submitted_at),
  CONSTRAINT fk_leave_requests_approver FOREIGN KEY (approver_employee_id) REFERENCES employees (employee_id) ON UPDATE CASCADE,
  CONSTRAINT fk_leave_requests_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id) ON UPDATE CASCADE,
  CONSTRAINT fk_leave_requests_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types (leave_type_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy physical table retained for production-schema reproducibility.
-- Current leave controllers do not read or write this table.
CREATE TABLE leave_attachments (
  attachment_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  leave_request_id INT UNSIGNED NOT NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  storage_file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes BIGINT UNSIGNED NOT NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  deleted_by INT UNSIGNED NULL,
  PRIMARY KEY (attachment_id),
  KEY idx_attachments_leave_request_id (leave_request_id),
  KEY idx_attachments_uploaded_by (uploaded_by),
  KEY idx_attachments_deleted_by (deleted_by),
  CONSTRAINT fk_attachments_deleted_by FOREIGN KEY (deleted_by) REFERENCES users (user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_attachments_leave_request FOREIGN KEY (leave_request_id) REFERENCES leave_requests (leave_request_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_attachments_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users (user_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leave_approval_logs (
  approval_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  leave_request_id INT UNSIGNED NOT NULL,
  approver_id INT UNSIGNED NOT NULL,
  action ENUM('approved','rejected') NOT NULL,
  comment TEXT NULL,
  acted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (approval_id),
  KEY idx_approval_logs_leave_request_id (leave_request_id),
  KEY idx_approval_logs_approver_id (approver_id),
  KEY idx_approval_logs_action (action),
  CONSTRAINT fk_approval_logs_approver FOREIGN KEY (approver_id) REFERENCES users (user_id) ON UPDATE CASCADE,
  CONSTRAINT fk_approval_logs_leave_request FOREIGN KEY (leave_request_id) REFERENCES leave_requests (leave_request_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE leave_request_attachments (
  attachment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  leave_request_id INT UNSIGNED NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attachment_id),
  KEY idx_leave_attachments_request (leave_request_id),
  CONSTRAINT fk_leave_attachments_request FOREIGN KEY (leave_request_id) REFERENCES leave_requests (leave_request_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE holidays (
  holiday_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  holiday_date DATE NOT NULL,
  holiday_name VARCHAR(100) NOT NULL,
  holiday_type VARCHAR(50) NOT NULL DEFAULT 'Public Holiday',
  description VARCHAR(300) NULL,
  year INT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (holiday_id),
  UNIQUE KEY uq_holidays_date (holiday_date),
  KEY idx_holidays_year (year),
  KEY idx_holidays_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
  notification_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  leave_request_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_leave_request_id (leave_request_id),
  KEY idx_notifications_is_read (is_read),
  KEY idx_notifications_created_at (created_at),
  KEY idx_notifications_user_read_created (user_id, is_read, created_at),
  CONSTRAINT fk_notifications_leave_request FOREIGN KEY (leave_request_id) REFERENCES leave_requests (leave_request_id) ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
  audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NULL,
  record_id BIGINT UNSIGNED NULL,
  detail LONGTEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_id),
  KEY idx_audit_logs_user_id (user_id),
  KEY idx_audit_logs_action (action),
  KEY idx_audit_logs_table_record (table_name, record_id),
  KEY idx_audit_logs_created_at (created_at),
  KEY idx_audit_logs_user_created (user_id, created_at),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_otps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  used_at DATETIME NULL,
  invalidated_at DATETIME NULL,
  attempt_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  resend_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  requested_ip VARCHAR(45) NULL,
  requested_user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_reset_otps_user_id (user_id),
  KEY idx_password_reset_otps_expires_at (expires_at),
  CONSTRAINT fk_password_reset_otps_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  otp_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  invalidated_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_reset_tokens_token_hash (token_hash),
  KEY idx_password_reset_tokens_user_id (user_id),
  KEY idx_password_reset_tokens_expires_at (expires_at),
  KEY fk_password_reset_tokens_otp (otp_id),
  CONSTRAINT fk_password_reset_tokens_otp FOREIGN KEY (otp_id) REFERENCES password_reset_otps (id) ON DELETE CASCADE,
  CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
