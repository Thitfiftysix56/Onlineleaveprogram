ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) NOT NULL DEFAULT 0
  AFTER password_changed_at,
  ADD COLUMN IF NOT EXISTS token_version INT UNSIGNED NOT NULL DEFAULT 0
  AFTER must_change_password;
