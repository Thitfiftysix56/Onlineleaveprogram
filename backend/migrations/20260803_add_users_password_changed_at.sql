ALTER TABLE users
  ADD COLUMN IF NOT EXISTS password_changed_at DATETIME NULL AFTER last_login_at;
