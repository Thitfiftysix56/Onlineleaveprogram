import { pool } from '../config/database.js'

const employeeStatuses = new Set(['active', 'inactive', 'resigned'])
const holidayTypes = new Set(['public holiday', 'company holiday', 'special holiday'])

const trim = (value) => String(value ?? '').trim()
const lower = (value) => trim(value).toLowerCase()
const positiveId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
const activeValue = (value) => {
  if (value === true || value === 1 || value === '1') return 1
  if (value === false || value === 0 || value === '0') return 0
  const status = lower(value)
  if (status === 'active') return 1
  if (status === 'inactive') return 0
  return null
}
const validDate = (value) => {
  const date = trim(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const parsed = new Date(`${date}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    ? date
    : null
}
const decimal = (value, minimum = 0, maximum = 365) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? number
    : null
}

function sendError(response, status, message) {
  return response.status(status).json({ status: 'error', message })
}

function internalError(response, context, error) {
  console.error(context, error)
  return sendError(response, 500, 'Internal server error')
}

const employeeSelect = `
  SELECT e.employee_id, e.employee_code, e.first_name, e.last_name,
         e.phone, e.email, e.department_id, d.department_name,
         e.position_id, p.position_name, e.supervisor_id,
         CONCAT(s.first_name, ' ', s.last_name) AS supervisor_name,
         e.hire_date, e.status, e.created_at, e.updated_at,
         u.user_id, r.role_id, r.role_name
  FROM employees e
  JOIN departments d ON d.department_id = e.department_id
  JOIN positions p ON p.position_id = e.position_id
  LEFT JOIN employees s ON s.employee_id = e.supervisor_id
  LEFT JOIN users u ON u.employee_id = e.employee_id
  LEFT JOIN roles r ON r.role_id = u.role_id`

function employeeData(row) {
  return {
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    phone: row.phone,
    email: row.email,
    departmentId: row.department_id,
    department: row.department_name,
    positionId: row.position_id,
    position: row.position_name,
    supervisorId: row.supervisor_id,
    supervisorName: row.supervisor_name,
    hireDate: row.hire_date,
    roleId: row.role_id,
    roleName: row.role_name || 'Employee',
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function employeeById(employeeId) {
  const [rows] = await pool.execute(
    `${employeeSelect} WHERE e.employee_id = ? LIMIT 1`,
    [employeeId],
  )
  return rows[0] || null
}

async function referenceExists(table, idColumn, id, requireActive = false) {
  const activeClause = requireActive ? ' AND is_active = 1' : ''
  const [rows] = await pool.execute(
    `SELECT ${idColumn} FROM ${table} WHERE ${idColumn} = ?${activeClause} LIMIT 1`,
    [id],
  )
  return rows.length > 0
}

export async function listEmployees(request, response) {
  try {
    const conditions = []
    const parameters = []
    const search = trim(request.query.search)
    const department = trim(request.query.department)
    const status = lower(request.query.status)
    if (search) {
      conditions.push(`(e.employee_code LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR p.position_name LIKE ?)`)
      const term = `%${search}%`
      parameters.push(term, term, term, term, term)
    }
    if (department && lower(department) !== 'all') {
      const departmentId = positiveId(department)
      conditions.push(departmentId ? 'e.department_id = ?' : 'd.department_name = ?')
      parameters.push(departmentId || department)
    }
    if (status && status !== 'all') {
      if (!employeeStatuses.has(status)) return sendError(response, 400, 'Invalid employee status.')
      conditions.push('e.status = ?')
      parameters.push(status)
    }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await pool.execute(`${employeeSelect}${where} ORDER BY e.employee_id ASC`, parameters)
    return response.json({ status: 'ok', message: 'Employees retrieved successfully', data: { employees: rows.map(employeeData) } })
  } catch (error) {
    return internalError(response, 'List employees error:', error)
  }
}

export async function getEmployee(request, response) {
  try {
    const id = positiveId(request.params.employeeId)
    if (!id) return sendError(response, 400, 'A valid employeeId is required.')
    const row = await employeeById(id)
    if (!row) return sendError(response, 404, 'Employee was not found.')
    return response.json({ status: 'ok', message: 'Employee retrieved successfully', data: { employee: employeeData(row) } })
  } catch (error) {
    return internalError(response, 'Get employee error:', error)
  }
}

async function validateEmployee(body, currentId = null) {
  const employeeCode = trim(body.employeeCode).toUpperCase()
  const firstName = trim(body.firstName)
  const lastName = trim(body.lastName)
  const email = lower(body.email)
  const phone = trim(body.phone) || null
  const departmentId = positiveId(body.departmentId)
  const positionId = positiveId(body.positionId)
  const supervisorId = body.supervisorId ? positiveId(body.supervisorId) : null
  const hireDate = validDate(body.hireDate)
  const status = lower(body.status)
  if (!employeeCode || employeeCode.length > 20) return { error: 'Employee code is required and must not exceed 20 characters.' }
  if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) return { error: 'First name and last name are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) return { error: 'A valid email is required.' }
  if (phone && phone.length > 20) return { error: 'Phone must not exceed 20 characters.' }
  if (!departmentId || !await referenceExists('departments', 'department_id', departmentId, true)) return { error: 'The selected department is invalid or inactive.' }
  if (!positionId || !await referenceExists('positions', 'position_id', positionId, true)) return { error: 'The selected position is invalid or inactive.' }
  if (supervisorId) {
    if (supervisorId === currentId) return { error: 'An employee cannot be their own supervisor.' }
    const [supervisors] = await pool.execute('SELECT employee_id FROM employees WHERE employee_id = ? AND status = ? LIMIT 1', [supervisorId, 'active'])
    if (!supervisors.length) return { error: 'The selected supervisor is invalid or inactive.' }
  }
  if (!hireDate) return { error: 'A valid hire date is required.' }
  if (!employeeStatuses.has(status)) return { error: 'Status must be active, inactive or resigned.' }
  const [duplicates] = await pool.execute(
    `SELECT employee_id, employee_code, email FROM employees
     WHERE (employee_code = ? OR email = ?) AND employee_id <> ? LIMIT 1`,
    [employeeCode, email, currentId || 0],
  )
  if (duplicates.length) {
    return { error: lower(duplicates[0].employee_code) === lower(employeeCode) ? 'Employee code is already in use.' : 'Email is already in use.', conflict: true }
  }
  return { value: { employeeCode, firstName, lastName, email, phone, departmentId, positionId, supervisorId, hireDate, status } }
}

export async function createEmployee(request, response) {
  try {
    const validation = await validateEmployee(request.body)
    if (validation.error) return sendError(response, validation.conflict ? 409 : 400, validation.error)
    const v = validation.value
    const [result] = await pool.execute(
      `INSERT INTO employees (employee_code, first_name, last_name, phone, email, department_id, position_id, supervisor_id, hire_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.employeeCode, v.firstName, v.lastName, v.phone, v.email, v.departmentId, v.positionId, v.supervisorId, v.hireDate, v.status],
    )
    const row = await employeeById(result.insertId)
    return response.status(201).json({ status: 'ok', message: 'Employee created successfully', data: { employee: employeeData(row) } })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Employee code or email is already in use.')
    return internalError(response, 'Create employee error:', error)
  }
}

export async function updateEmployee(request, response) {
  try {
    const id = positiveId(request.params.employeeId)
    if (!id) return sendError(response, 400, 'A valid employeeId is required.')
    if (!await employeeById(id)) return sendError(response, 404, 'Employee was not found.')
    const validation = await validateEmployee(request.body, id)
    if (validation.error) return sendError(response, validation.conflict ? 409 : 400, validation.error)
    const v = validation.value
    await pool.execute(
      `UPDATE employees SET employee_code = ?, first_name = ?, last_name = ?, phone = ?, email = ?, department_id = ?, position_id = ?, supervisor_id = ?, hire_date = ?, status = ? WHERE employee_id = ?`,
      [v.employeeCode, v.firstName, v.lastName, v.phone, v.email, v.departmentId, v.positionId, v.supervisorId, v.hireDate, v.status, id],
    )
    const row = await employeeById(id)
    return response.json({ status: 'ok', message: 'Employee updated successfully', data: { employee: employeeData(row) } })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Employee code or email is already in use.')
    return internalError(response, 'Update employee error:', error)
  }
}

export async function updateEmployeeStatus(request, response) {
  try {
    const id = positiveId(request.params.employeeId)
    const status = lower(request.body.status)
    if (!id) return sendError(response, 400, 'A valid employeeId is required.')
    if (!employeeStatuses.has(status)) return sendError(response, 400, 'Status must be active, inactive or resigned.')
    const row = await employeeById(id)
    if (!row) return sendError(response, 404, 'Employee was not found.')
    await pool.execute('UPDATE employees SET status = ? WHERE employee_id = ?', [status, id])
    return response.json({ status: 'ok', message: 'Employee status updated successfully', data: { employeeId: id, status } })
  } catch (error) {
    return internalError(response, 'Update employee status error:', error)
  }
}

function departmentData(row) {
  return {
    departmentId: row.department_id,
    departmentName: row.department_name,
    description: row.description,
    isActive: Boolean(row.is_active),
    status: row.is_active ? 'Active' : 'Inactive',
    employeeCount: Number(row.employee_count || 0),
    activeEmployeeCount: Number(row.active_employee_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const departmentSelect = `SELECT d.department_id, d.department_name, d.description, d.is_active, d.created_at, d.updated_at,
  COUNT(e.employee_id) AS employee_count, COALESCE(SUM(e.status = 'active'), 0) AS active_employee_count
  FROM departments d LEFT JOIN employees e ON e.department_id = d.department_id`

async function departmentById(id) {
  const [rows] = await pool.execute(`${departmentSelect} WHERE d.department_id = ? GROUP BY d.department_id LIMIT 1`, [id])
  return rows[0] || null
}

export async function listDepartments(_request, response) {
  try {
    const [rows] = await pool.execute(`${departmentSelect} GROUP BY d.department_id ORDER BY d.department_id ASC`)
    return response.json({ status: 'ok', message: 'Departments retrieved successfully', data: { departments: rows.map(departmentData) } })
  } catch (error) { return internalError(response, 'List departments error:', error) }
}

export async function getDepartment(request, response) {
  try {
    const id = positiveId(request.params.departmentId)
    if (!id) return sendError(response, 400, 'A valid departmentId is required.')
    const row = await departmentById(id)
    if (!row) return sendError(response, 404, 'Department was not found.')
    return response.json({ status: 'ok', message: 'Department retrieved successfully', data: { department: departmentData(row) } })
  } catch (error) { return internalError(response, 'Get department error:', error) }
}

async function saveDepartment(request, response, id = null) {
  const name = trim(request.body.departmentName)
  const description = trim(request.body.description) || null
  const isActive = activeValue(request.body.isActive ?? request.body.status)
  if (name.length < 2 || name.length > 100) return sendError(response, 400, 'Department name must contain 2-100 characters.')
  if (isActive === null) return sendError(response, 400, 'Status must be Active or Inactive.')
  if (id && !await departmentById(id)) return sendError(response, 404, 'Department was not found.')
  const [duplicates] = await pool.execute('SELECT department_id FROM departments WHERE LOWER(department_name) = LOWER(?) AND department_id <> ? LIMIT 1', [name, id || 0])
  if (duplicates.length) return sendError(response, 409, 'Department name is already in use.')
  let savedId = id
  if (id) {
    await pool.execute('UPDATE departments SET department_name = ?, description = ?, is_active = ? WHERE department_id = ?', [name, description, isActive, id])
  } else {
    const [result] = await pool.execute('INSERT INTO departments (department_name, description, is_active) VALUES (?, ?, ?)', [name, description, isActive])
    savedId = result.insertId
  }
  const row = await departmentById(savedId)
  return response.status(id ? 200 : 201).json({ status: 'ok', message: `Department ${id ? 'updated' : 'created'} successfully`, data: { department: departmentData(row) } })
}

export async function createDepartment(request, response) {
  try { return await saveDepartment(request, response) } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Department name is already in use.')
    return internalError(response, 'Create department error:', error)
  }
}
export async function updateDepartment(request, response) {
  try {
    const id = positiveId(request.params.departmentId)
    if (!id) return sendError(response, 400, 'A valid departmentId is required.')
    return await saveDepartment(request, response, id)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Department name is already in use.')
    return internalError(response, 'Update department error:', error)
  }
}
export async function updateDepartmentStatus(request, response) {
  try {
    const id = positiveId(request.params.departmentId)
    const isActive = activeValue(request.body.status ?? request.body.isActive)
    if (!id) return sendError(response, 400, 'A valid departmentId is required.')
    if (isActive === null) return sendError(response, 400, 'Status must be Active or Inactive.')
    if (!await departmentById(id)) return sendError(response, 404, 'Department was not found.')
    await pool.execute('UPDATE departments SET is_active = ? WHERE department_id = ?', [isActive, id])
    return response.json({ status: 'ok', message: 'Department status updated successfully', data: { departmentId: id, status: isActive ? 'Active' : 'Inactive' } })
  } catch (error) { return internalError(response, 'Update department status error:', error) }
}

function positionData(row) {
  return {
    positionId: row.position_id,
    positionName: row.position_name,
    isActive: Boolean(row.is_active),
    status: row.is_active ? 'Active' : 'Inactive',
    employeeCount: Number(row.employee_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
const positionSelect = `SELECT p.position_id, p.position_name, p.is_active, p.created_at, p.updated_at,
  COUNT(e.employee_id) AS employee_count FROM positions p LEFT JOIN employees e ON e.position_id = p.position_id`
async function positionById(id) {
  const [rows] = await pool.execute(`${positionSelect} WHERE p.position_id = ? GROUP BY p.position_id LIMIT 1`, [id])
  return rows[0] || null
}
export async function listPositions(_request, response) {
  try {
    const [rows] = await pool.execute(`${positionSelect} GROUP BY p.position_id ORDER BY p.position_id ASC`)
    return response.json({ status: 'ok', message: 'Positions retrieved successfully', data: { positions: rows.map(positionData) } })
  } catch (error) { return internalError(response, 'List positions error:', error) }
}
export async function getPosition(request, response) {
  try {
    const id = positiveId(request.params.positionId)
    if (!id) return sendError(response, 400, 'A valid positionId is required.')
    const row = await positionById(id)
    if (!row) return sendError(response, 404, 'Position was not found.')
    return response.json({ status: 'ok', message: 'Position retrieved successfully', data: { position: positionData(row) } })
  } catch (error) { return internalError(response, 'Get position error:', error) }
}
async function savePosition(request, response, id = null) {
  const name = trim(request.body.positionName)
  const isActive = activeValue(request.body.isActive ?? request.body.status)
  if (name.length < 2 || name.length > 100) return sendError(response, 400, 'Position name must contain 2-100 characters.')
  if (isActive === null) return sendError(response, 400, 'Status must be Active or Inactive.')
  if (id && !await positionById(id)) return sendError(response, 404, 'Position was not found.')
  const [duplicates] = await pool.execute('SELECT position_id FROM positions WHERE LOWER(position_name) = LOWER(?) AND position_id <> ? LIMIT 1', [name, id || 0])
  if (duplicates.length) return sendError(response, 409, 'Position name is already in use.')
  let savedId = id
  if (id) await pool.execute('UPDATE positions SET position_name = ?, is_active = ? WHERE position_id = ?', [name, isActive, id])
  else {
    const [result] = await pool.execute('INSERT INTO positions (position_name, is_active) VALUES (?, ?)', [name, isActive])
    savedId = result.insertId
  }
  const row = await positionById(savedId)
  return response.status(id ? 200 : 201).json({ status: 'ok', message: `Position ${id ? 'updated' : 'created'} successfully`, data: { position: positionData(row) } })
}
export async function createPosition(request, response) {
  try { return await savePosition(request, response) } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Position name is already in use.')
    return internalError(response, 'Create position error:', error)
  }
}
export async function updatePosition(request, response) {
  try {
    const id = positiveId(request.params.positionId)
    if (!id) return sendError(response, 400, 'A valid positionId is required.')
    return await savePosition(request, response, id)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Position name is already in use.')
    return internalError(response, 'Update position error:', error)
  }
}
export async function updatePositionStatus(request, response) {
  try {
    const id = positiveId(request.params.positionId)
    const isActive = activeValue(request.body.status ?? request.body.isActive)
    if (!id) return sendError(response, 400, 'A valid positionId is required.')
    if (isActive === null) return sendError(response, 400, 'Status must be Active or Inactive.')
    if (!await positionById(id)) return sendError(response, 404, 'Position was not found.')
    await pool.execute('UPDATE positions SET is_active = ? WHERE position_id = ?', [isActive, id])
    return response.json({ status: 'ok', message: 'Position status updated successfully', data: { positionId: id, status: isActive ? 'Active' : 'Inactive' } })
  } catch (error) { return internalError(response, 'Update position status error:', error) }
}

function leaveTypeData(row) {
  return {
    leaveTypeId: row.leave_type_id,
    code: row.leave_type_code,
    name: row.leave_type_name,
    description: row.description || '',
    defaultDays: Number(row.annual_quota_days),
    minimumDays: Number(row.minimum_days),
    maximumDaysPerRequest: Number(row.maximum_days_per_request),
    attachmentRequired: Boolean(row.requires_attachment),
    attachmentRequiredAfterDays: row.attachment_required_after_days === null
      ? null
      : Number(row.attachment_required_after_days),
    isActive: Boolean(row.is_active),
    status: row.is_active ? 'Active' : 'Inactive',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
const leaveTypeSelect = `SELECT leave_type_id, leave_type_code, leave_type_name, description,
  annual_quota_days, minimum_days, maximum_days_per_request, requires_attachment,
  attachment_required_after_days, is_active, created_at, updated_at FROM leave_types`
async function leaveTypeById(id) {
  const [rows] = await pool.execute(`${leaveTypeSelect} WHERE leave_type_id = ? LIMIT 1`, [id])
  return rows[0] || null
}
export async function listLeaveTypes(_request, response) {
  try {
    const [rows] = await pool.execute(`${leaveTypeSelect} ORDER BY leave_type_id ASC`)
    return response.json({ status: 'ok', message: 'Leave types retrieved successfully', data: { leaveTypes: rows.map(leaveTypeData) } })
  } catch (error) { return internalError(response, 'List leave types error:', error) }
}
export async function getLeaveType(request, response) {
  try {
    const id = positiveId(request.params.leaveTypeId)
    if (!id) return sendError(response, 400, 'A valid leaveTypeId is required.')
    const row = await leaveTypeById(id)
    if (!row) return sendError(response, 404, 'Leave type was not found.')
    return response.json({ status: 'ok', message: 'Leave type retrieved successfully', data: { leaveType: leaveTypeData(row) } })
  } catch (error) { return internalError(response, 'Get leave type error:', error) }
}
async function validateLeaveType(body, currentId = null) {
  const code = trim(body.code).toUpperCase()
  const name = trim(body.name)
  const description = trim(body.description)
  const defaultDays = decimal(body.defaultDays)
  const minimumDays = decimal(body.minimumDays, 0.01)
  const maximumDays = decimal(body.maximumDaysPerRequest, 0.01)
  const attachmentRule = lower(body.attachmentRule)
  const attachmentRequired = body.attachmentRequired === true || attachmentRule === 'always'
  const attachmentAfter = attachmentRule === 'threshold' || body.attachmentRequiredAfterDays !== null && body.attachmentRequiredAfterDays !== undefined && trim(body.attachmentRequiredAfterDays) !== ''
    ? decimal(body.attachmentRequiredAfterDays, 0.01)
    : null
  const isActive = activeValue(body.isActive ?? body.status)
  if (!/^[A-Z0-9]{2,10}$/.test(code)) return { error: 'Code must contain 2-10 uppercase letters or numbers.' }
  if (!name || name.length > 100) return { error: 'Leave type name is required and must not exceed 100 characters.' }
  if (description.length < 5 || description.length > 300) return { error: 'Description must contain 5-300 characters.' }
  if (defaultDays === null) return { error: 'Default days must be between 0 and 365.' }
  if (minimumDays === null || maximumDays === null || maximumDays < minimumDays) return { error: 'Minimum and maximum days are invalid.' }
  if (attachmentAfter === null && (attachmentRule === 'threshold' || trim(body.attachmentRequiredAfterDays))) return { error: 'Attachment threshold is invalid.' }
  if (attachmentAfter !== null && attachmentAfter > maximumDays) return { error: 'Attachment threshold cannot exceed maximum days.' }
  if (isActive === null) return { error: 'Status must be Active or Inactive.' }
  const [duplicates] = await pool.execute(
    `SELECT leave_type_id, leave_type_code, leave_type_name FROM leave_types
     WHERE (leave_type_code = ? OR LOWER(leave_type_name) = LOWER(?)) AND leave_type_id <> ? LIMIT 1`,
    [code, name, currentId || 0],
  )
  if (duplicates.length) return { error: duplicates[0].leave_type_code === code ? 'Leave type code is already in use.' : 'Leave type name is already in use.', conflict: true }
  return { value: { code, name, description, defaultDays, minimumDays, maximumDays, attachmentRequired: attachmentRequired ? 1 : 0, attachmentAfter, isActive } }
}
async function saveLeaveType(request, response, id = null) {
  if (id && !await leaveTypeById(id)) return sendError(response, 404, 'Leave type was not found.')
  const validation = await validateLeaveType(request.body, id)
  if (validation.error) return sendError(response, validation.conflict ? 409 : 400, validation.error)
  const v = validation.value
  let savedId = id
  const parameters = [v.code, v.name, v.description, v.defaultDays, v.minimumDays, v.maximumDays, v.attachmentRequired, v.attachmentAfter, v.isActive]
  if (id) await pool.execute(
    `UPDATE leave_types SET leave_type_code = ?, leave_type_name = ?, description = ?, annual_quota_days = ?, minimum_days = ?, maximum_days_per_request = ?, requires_attachment = ?, attachment_required_after_days = ?, is_active = ? WHERE leave_type_id = ?`,
    [...parameters, id],
  )
  else {
    const [result] = await pool.execute(
      `INSERT INTO leave_types (leave_type_code, leave_type_name, description, annual_quota_days, minimum_days, maximum_days_per_request, requires_attachment, attachment_required_after_days, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      parameters,
    )
    savedId = result.insertId
  }
  const row = await leaveTypeById(savedId)
  return response.status(id ? 200 : 201).json({ status: 'ok', message: `Leave type ${id ? 'updated' : 'created'} successfully`, data: { leaveType: leaveTypeData(row) } })
}
export async function createLeaveType(request, response) {
  try { return await saveLeaveType(request, response) } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Leave type code or name is already in use.')
    return internalError(response, 'Create leave type error:', error)
  }
}
export async function updateLeaveType(request, response) {
  try {
    const id = positiveId(request.params.leaveTypeId)
    if (!id) return sendError(response, 400, 'A valid leaveTypeId is required.')
    return await saveLeaveType(request, response, id)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'Leave type code or name is already in use.')
    return internalError(response, 'Update leave type error:', error)
  }
}
export async function updateLeaveTypeStatus(request, response) {
  try {
    const id = positiveId(request.params.leaveTypeId)
    const isActive = activeValue(request.body.status ?? request.body.isActive)
    if (!id) return sendError(response, 400, 'A valid leaveTypeId is required.')
    if (isActive === null) return sendError(response, 400, 'Status must be Active or Inactive.')
    if (!await leaveTypeById(id)) return sendError(response, 404, 'Leave type was not found.')
    await pool.execute('UPDATE leave_types SET is_active = ? WHERE leave_type_id = ?', [isActive, id])
    return response.json({ status: 'ok', message: 'Leave type status updated successfully', data: { leaveTypeId: id, status: isActive ? 'Active' : 'Inactive' } })
  } catch (error) { return internalError(response, 'Update leave type status error:', error) }
}

function holidayData(row) {
  const date = row.holiday_date instanceof Date
    ? row.holiday_date.toISOString().slice(0, 10)
    : String(row.holiday_date).slice(0, 10)
  return {
    holidayId: row.holiday_id,
    name: row.holiday_name,
    date,
    type: row.holiday_type,
    description: row.description || '',
    year: row.year,
    isActive: Boolean(row.is_active),
    status: row.is_active ? 'Active' : 'Inactive',
  }
}
const holidaySelect = 'SELECT holiday_id, holiday_date, holiday_name, holiday_type, description, year, is_active FROM holidays'
async function holidayById(id) {
  const [rows] = await pool.execute(`${holidaySelect} WHERE holiday_id = ? LIMIT 1`, [id])
  return rows[0] || null
}
export async function listHolidays(request, response) {
  try {
    const conditions = []
    const parameters = []
    if (request.query.year && lower(request.query.year) !== 'all') {
      const year = Number(request.query.year)
      if (!Number.isInteger(year) || year < 1900 || year > 2200) return sendError(response, 400, 'Invalid holiday year.')
      conditions.push('year = ?'); parameters.push(year)
    }
    if (request.query.type && lower(request.query.type) !== 'all') {
      conditions.push('holiday_type = ?'); parameters.push(trim(request.query.type))
    }
    if (request.query.status && lower(request.query.status) !== 'all') {
      const isActive = activeValue(request.query.status)
      if (isActive === null) return sendError(response, 400, 'Invalid holiday status.')
      conditions.push('is_active = ?'); parameters.push(isActive)
    }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await pool.execute(`${holidaySelect}${where} ORDER BY holiday_date ASC`, parameters)
    return response.json({ status: 'ok', message: 'Holidays retrieved successfully', data: { holidays: rows.map(holidayData) } })
  } catch (error) { return internalError(response, 'List holidays error:', error) }
}
export async function getHoliday(request, response) {
  try {
    const id = positiveId(request.params.holidayId)
    if (!id) return sendError(response, 400, 'A valid holidayId is required.')
    const row = await holidayById(id)
    if (!row) return sendError(response, 404, 'Holiday was not found.')
    return response.json({ status: 'ok', message: 'Holiday retrieved successfully', data: { holiday: holidayData(row) } })
  } catch (error) { return internalError(response, 'Get holiday error:', error) }
}
async function saveHoliday(request, response, id = null) {
  const name = trim(request.body.name)
  const date = validDate(request.body.date)
  const type = lower(request.body.type)
  const description = trim(request.body.description)
  const isActive = activeValue(request.body.isActive ?? request.body.status)
  if (!name || name.length > 100) return sendError(response, 400, 'Holiday name is required and must not exceed 100 characters.')
  if (!date) return sendError(response, 400, 'A valid holiday date is required.')
  if (!holidayTypes.has(type)) return sendError(response, 400, 'Holiday type is invalid.')
  if (description.length < 5 || description.length > 300) return sendError(response, 400, 'Description must contain 5-300 characters.')
  if (isActive === null) return sendError(response, 400, 'Status must be Active or Inactive.')
  if (id && !await holidayById(id)) return sendError(response, 404, 'Holiday was not found.')
  const [duplicates] = await pool.execute('SELECT holiday_id FROM holidays WHERE holiday_date = ? AND holiday_id <> ? LIMIT 1', [date, id || 0])
  if (duplicates.length) return sendError(response, 409, 'A holiday already exists on this date.')
  const canonicalType = type.replace(/\b\w/g, (letter) => letter.toUpperCase())
  let savedId = id
  if (id) await pool.execute('UPDATE holidays SET holiday_date = ?, holiday_name = ?, holiday_type = ?, description = ?, year = ?, is_active = ? WHERE holiday_id = ?', [date, name, canonicalType, description, Number(date.slice(0, 4)), isActive, id])
  else {
    const [result] = await pool.execute('INSERT INTO holidays (holiday_date, holiday_name, holiday_type, description, year, is_active) VALUES (?, ?, ?, ?, ?, ?)', [date, name, canonicalType, description, Number(date.slice(0, 4)), isActive])
    savedId = result.insertId
  }
  const row = await holidayById(savedId)
  return response.status(id ? 200 : 201).json({ status: 'ok', message: `Holiday ${id ? 'updated' : 'created'} successfully`, data: { holiday: holidayData(row) } })
}
export async function createHoliday(request, response) {
  try { return await saveHoliday(request, response) } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'A holiday already exists on this date.')
    return internalError(response, 'Create holiday error:', error)
  }
}
export async function updateHoliday(request, response) {
  try {
    const id = positiveId(request.params.holidayId)
    if (!id) return sendError(response, 400, 'A valid holidayId is required.')
    return await saveHoliday(request, response, id)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'A holiday already exists on this date.')
    return internalError(response, 'Update holiday error:', error)
  }
}
export async function deleteHoliday(request, response) {
  try {
    const id = positiveId(request.params.holidayId)
    if (!id) return sendError(response, 400, 'A valid holidayId is required.')
    if (!await holidayById(id)) return sendError(response, 404, 'Holiday was not found.')
    try {
      await pool.execute('DELETE FROM holidays WHERE holiday_id = ?', [id])
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') return sendError(response, 409, 'Holiday is referenced by another record and cannot be deleted.')
      throw error
    }
    return response.json({ status: 'ok', message: 'Holiday deleted successfully', data: { holidayId: id } })
  } catch (error) { return internalError(response, 'Delete holiday error:', error) }
}

const entitlementSelect = `SELECT le.entitlement_id, le.employee_id, e.employee_code,
  CONCAT(e.first_name, ' ', e.last_name) AS employee_name, d.department_name,
  le.leave_type_id, lt.leave_type_name, le.year, le.total_days, le.used_days,
  (le.total_days - le.used_days) AS remaining_days, le.updated_by, le.updated_at
  FROM leave_entitlements le
  JOIN employees e ON e.employee_id = le.employee_id
  JOIN departments d ON d.department_id = e.department_id
  JOIN leave_types lt ON lt.leave_type_id = le.leave_type_id`
function entitlementData(row) {
  return {
    entitlementId: row.entitlement_id,
    employeeId: row.employee_id,
    employeeCode: row.employee_code,
    employeeName: row.employee_name,
    department: row.department_name,
    leaveTypeId: row.leave_type_id,
    leaveType: row.leave_type_name,
    year: row.year,
    totalDays: Number(row.total_days),
    usedDays: Number(row.used_days),
    remainingDays: Number(row.remaining_days),
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
  }
}
async function entitlementById(id) {
  const [rows] = await pool.execute(`${entitlementSelect} WHERE le.entitlement_id = ? LIMIT 1`, [id])
  return rows[0] || null
}
export async function listLeaveEntitlements(request, response) {
  try {
    const conditions = []
    const parameters = []
    const employee = trim(request.query.employee)
    const leaveType = trim(request.query.leaveType)
    const year = trim(request.query.year)
    if (employee && lower(employee) !== 'all') {
      const employeeId = positiveId(employee)
      if (employeeId) { conditions.push('le.employee_id = ?'); parameters.push(employeeId) }
      else { conditions.push('(e.employee_code LIKE ? OR CONCAT(e.first_name, \' \', e.last_name) LIKE ?)'); parameters.push(`%${employee}%`, `%${employee}%`) }
    }
    if (leaveType && lower(leaveType) !== 'all') {
      const leaveTypeId = positiveId(leaveType)
      conditions.push(leaveTypeId ? 'le.leave_type_id = ?' : 'lt.leave_type_name = ?')
      parameters.push(leaveTypeId || leaveType)
    }
    if (year && lower(year) !== 'all') {
      const numericYear = Number(year)
      if (!Number.isInteger(numericYear) || numericYear < 2000 || numericYear > 2100) return sendError(response, 400, 'Year must be between 2000 and 2100.')
      conditions.push('le.year = ?'); parameters.push(numericYear)
    }
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''
    const [rows] = await pool.execute(`${entitlementSelect}${where} ORDER BY le.year DESC, e.employee_code ASC, le.leave_type_id ASC`, parameters)
    return response.json({ status: 'ok', message: 'Leave entitlements retrieved successfully', data: { leaveEntitlements: rows.map(entitlementData) } })
  } catch (error) { return internalError(response, 'List leave entitlements error:', error) }
}
export async function getLeaveEntitlement(request, response) {
  try {
    const id = positiveId(request.params.entitlementId)
    if (!id) return sendError(response, 400, 'A valid entitlementId is required.')
    const row = await entitlementById(id)
    if (!row) return sendError(response, 404, 'Leave entitlement was not found.')
    return response.json({ status: 'ok', message: 'Leave entitlement retrieved successfully', data: { leaveEntitlement: entitlementData(row) } })
  } catch (error) { return internalError(response, 'Get leave entitlement error:', error) }
}
async function saveEntitlement(request, response, id = null) {
  const employeeId = positiveId(request.body.employeeId)
  const leaveTypeId = positiveId(request.body.leaveTypeId)
  const year = Number(request.body.year)
  const totalDays = decimal(request.body.totalDays)
  const usedDays = decimal(request.body.usedDays)
  if (!employeeId || !await referenceExists('employees', 'employee_id', employeeId)) return sendError(response, 400, 'The selected employee is invalid.')
  if (!leaveTypeId || !await referenceExists('leave_types', 'leave_type_id', leaveTypeId)) return sendError(response, 400, 'The selected leave type is invalid.')
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return sendError(response, 400, 'Year must be between 2000 and 2100.')
  if (totalDays === null || usedDays === null) return sendError(response, 400, 'Total days and used days must be between 0 and 365.')
  if (usedDays > totalDays) return sendError(response, 400, 'Used days cannot exceed total days.')
  if (id && !await entitlementById(id)) return sendError(response, 404, 'Leave entitlement was not found.')
  const [duplicates] = await pool.execute(
    'SELECT entitlement_id FROM leave_entitlements WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND entitlement_id <> ? LIMIT 1',
    [employeeId, leaveTypeId, year, id || 0],
  )
  if (duplicates.length) return sendError(response, 409, 'This employee already has this leave entitlement for the selected year.')
  let savedId = id
  if (id) await pool.execute('UPDATE leave_entitlements SET employee_id = ?, leave_type_id = ?, year = ?, total_days = ?, used_days = ?, updated_by = ? WHERE entitlement_id = ?', [employeeId, leaveTypeId, year, totalDays, usedDays, request.user.userId || null, id])
  else {
    const [result] = await pool.execute('INSERT INTO leave_entitlements (employee_id, leave_type_id, year, total_days, used_days, updated_by) VALUES (?, ?, ?, ?, ?, ?)', [employeeId, leaveTypeId, year, totalDays, usedDays, request.user.userId || null])
    savedId = result.insertId
  }
  const row = await entitlementById(savedId)
  return response.status(id ? 200 : 201).json({ status: 'ok', message: `Leave entitlement ${id ? 'updated' : 'created'} successfully`, data: { leaveEntitlement: entitlementData(row) } })
}
export async function createLeaveEntitlement(request, response) {
  try { return await saveEntitlement(request, response) } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'This employee already has this leave entitlement for the selected year.')
    return internalError(response, 'Create leave entitlement error:', error)
  }
}
export async function updateLeaveEntitlement(request, response) {
  try {
    const id = positiveId(request.params.entitlementId)
    if (!id) return sendError(response, 400, 'A valid entitlementId is required.')
    return await saveEntitlement(request, response, id)
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendError(response, 409, 'This employee already has this leave entitlement for the selected year.')
    return internalError(response, 'Update leave entitlement error:', error)
  }
}
