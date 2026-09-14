ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS intended_role_id INT UNSIGNED NULL AFTER position_id,
  ADD KEY IF NOT EXISTS idx_employees_intended_role_id (intended_role_id),
  ADD CONSTRAINT IF NOT EXISTS fk_employees_intended_role FOREIGN KEY (intended_role_id)
    REFERENCES roles (role_id) ON UPDATE CASCADE;

UPDATE employees e
LEFT JOIN users u ON u.employee_id = e.employee_id
SET e.intended_role_id = COALESCE(
  u.role_id,
  (SELECT role_id FROM roles WHERE LOWER(role_name) = 'employee' LIMIT 1)
);

ALTER TABLE employees MODIFY intended_role_id INT UNSIGNED NOT NULL;
