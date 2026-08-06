CREATE TABLE IF NOT EXISTS leave_requests (
  leave_request_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_no VARCHAR(32) NULL,
  employee_id INT UNSIGNED NOT NULL,
  leave_type_id INT UNSIGNED NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  leave_days DECIMAL(6,2) NOT NULL DEFAULT 0,
  reason VARCHAR(500) NULL,
  status ENUM('draft','pending','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
  submitted_at DATETIME NULL,
  approver_employee_id INT UNSIGNED NULL,
  approved_at DATETIME NULL,
  rejected_at DATETIME NULL,
  rejection_reason TEXT NULL,
  cancelled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (leave_request_id),
  UNIQUE KEY uq_leave_requests_request_no (request_no),
  KEY idx_leave_requests_employee_status (employee_id, status),
  KEY idx_leave_requests_dates (start_date, end_date),
  KEY idx_leave_requests_approver (approver_employee_id),
  CONSTRAINT fk_leave_requests_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
  CONSTRAINT fk_leave_requests_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id),
  CONSTRAINT fk_leave_requests_approver FOREIGN KEY (approver_employee_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL AFTER rejected_at;

CREATE TABLE IF NOT EXISTS leave_request_attachments (
  attachment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  leave_request_id INT UNSIGNED NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (attachment_id),
  KEY idx_leave_attachments_request (leave_request_id),
  CONSTRAINT fk_leave_attachments_request FOREIGN KEY (leave_request_id)
    REFERENCES leave_requests(leave_request_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  leave_request_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notifications_user_created (user_id, created_at),
  KEY idx_notifications_user_read (user_id, is_read),
  KEY idx_notifications_leave_request (leave_request_id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_leave_request FOREIGN KEY (leave_request_id)
    REFERENCES leave_requests(leave_request_id) ON DELETE CASCADE
) ENGINE=InnoDB;
