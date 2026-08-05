CREATE TABLE IF NOT EXISTS password_reset_otps (
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
  CONSTRAINT fk_password_reset_otps_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
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
  CONSTRAINT fk_password_reset_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE,
  CONSTRAINT fk_password_reset_tokens_otp
    FOREIGN KEY (otp_id) REFERENCES password_reset_otps (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
