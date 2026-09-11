ALTER TABLE users
  ADD COLUMN IF NOT EXISTS failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0 AFTER status,
  ADD COLUMN IF NOT EXISTS last_failed_login_at DATETIME NULL AFTER failed_login_attempts,
  ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL AFTER last_failed_login_at;
