ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(255) NULL AFTER email;
