ALTER TABLE departments
  ADD COLUMN division_name VARCHAR(100) NULL AFTER department_name;

ALTER TABLE departments DROP INDEX uq_departments_name;
ALTER TABLE departments
  ADD UNIQUE KEY uq_department_division (department_name, division_name);

UPDATE departments SET division_name = CASE department_name
  WHEN 'Information Technology' THEN 'Development'
  WHEN 'Human Resources' THEN 'Employee Relations'
  WHEN 'Finance' THEN 'Accounting'
  WHEN 'Marketing' THEN 'Digital Marketing'
  ELSE 'General'
END WHERE division_name IS NULL;

ALTER TABLE departments MODIFY division_name VARCHAR(100) NOT NULL;

INSERT IGNORE INTO departments (department_name, division_name, description, is_active) VALUES
  ('Information Technology', 'Infrastructure', 'ฝ่ายโครงสร้างพื้นฐาน', 1);

ALTER TABLE positions
  ADD COLUMN department_id INT UNSIGNED NULL AFTER position_name,
  ADD COLUMN position_group VARCHAR(100) NULL AFTER department_id,
  ADD KEY idx_positions_department (department_id),
  ADD CONSTRAINT fk_positions_department FOREIGN KEY (department_id)
    REFERENCES departments (department_id) ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE positions SET
  department_id = CASE position_name
    WHEN 'Developer' THEN (SELECT department_id FROM departments WHERE department_name='Information Technology' AND division_name='Development' LIMIT 1)
    WHEN 'Human Resource Officer' THEN (SELECT department_id FROM departments WHERE department_name='Human Resources' AND division_name='Employee Relations' LIMIT 1)
    WHEN 'System Administrator' THEN (SELECT department_id FROM departments WHERE department_name='Information Technology' AND division_name='Infrastructure' LIMIT 1)
    WHEN 'Accountant' THEN (SELECT department_id FROM departments WHERE department_name='Finance' AND division_name='Accounting' LIMIT 1)
    WHEN 'Marketing Officer' THEN (SELECT department_id FROM departments WHERE department_name='Marketing' AND division_name='Digital Marketing' LIMIT 1)
    ELSE NULL
  END,
  position_group = CASE position_name
    WHEN 'Developer' THEN 'Developer'
    WHEN 'Human Resource Officer' THEN 'Human Resources'
    WHEN 'System Administrator' THEN 'Infrastructure'
    WHEN 'Accountant' THEN 'Accounting'
    WHEN 'Marketing Officer' THEN 'Marketing'
    WHEN 'Supervisor' THEN 'Management'
    ELSE 'General'
  END;

-- Position titles remain selectable catalog choices in the application and are
-- inserted only when HR/Admin explicitly adds them.
