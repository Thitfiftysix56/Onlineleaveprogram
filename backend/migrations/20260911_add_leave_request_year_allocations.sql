CREATE TABLE IF NOT EXISTS leave_request_year_allocations (
  allocation_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  leave_request_id INT UNSIGNED NOT NULL,
  year SMALLINT UNSIGNED NOT NULL,
  leave_days DECIMAL(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (allocation_id),
  UNIQUE KEY uq_leave_request_year (leave_request_id, year),
  KEY idx_leave_allocation_year (year),
  CONSTRAINT fk_leave_allocation_request
    FOREIGN KEY (leave_request_id) REFERENCES leave_requests (leave_request_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO leave_request_year_allocations (leave_request_id, year, leave_days)
SELECT leave_request_id, YEAR(start_date), leave_days
FROM leave_requests
WHERE start_date IS NOT NULL
ON DUPLICATE KEY UPDATE leave_days = VALUES(leave_days);
