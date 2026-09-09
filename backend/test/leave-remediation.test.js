import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'leave-remediation-test-secret-with-at-least-32-bytes'

const [
  { calculateApprovalAvailability, calculateDisplayedRemaining, calculateRequestAvailability, calculateWorkingDays, isSickLeaveType, isValidLeaveReason, recheckApprovalBalance, validateLeaveStartDatePolicy, validateSubmissionParticipants },
  { isAllowedLeaveAttachment },
] = await Promise.all([
  import('../src/controllers/leave-controller.js'),
  import('../src/middleware/leave-upload.js'),
])

test('leave reason accepts Thai and English letters with spaces', () => {
  assert.equal(isValidLeaveReason('ลาพักผ่อนกับครอบครัว'), true)
  assert.equal(isValidLeaveReason('Family personal leave'), true)
  assert.equal(isValidLeaveReason('ลากิจ ส่วนตัว'), true)
})

test('leave reason rejects digits, symbols, emoji, and blank values', () => {
  for (const reason of ['ลา 123 วัน', 'leave!!!', 'ลาพักผ่อน 😊', '   ']) {
    assert.equal(isValidLeaveReason(reason), false, reason)
  }
})

test('displayed remaining is affected only by approved usage', () => {
  assert.equal(calculateDisplayedRemaining({ total_days: 10, used_days: 2, pending_days: 3 }), 8)
  assert.equal(calculateDisplayedRemaining({ total_days: 10, used_days: 5, pending_days: 0 }), 5)
})

test('request availability reserves pending requests without counting them as used', () => {
  assert.equal(calculateRequestAvailability({ total_days: 10, used_days: 2, pending_days: 3 }), 5)
  assert.equal(calculateRequestAvailability({ total_days: 5, used_days: 0, pending_days: 5 }), 0)
})

function connectionWithParticipant(overrides = {}) {
  const participant = {
    employee_id: 10,
    employee_status: 'active',
    supervisor_id: 20,
    supervisor_employee_status: 'active',
    supervisor_user_id: 30,
    supervisor_user_status: 'active',
    supervisor_role_name: 'Supervisor',
    ...overrides,
  }
  return { execute: async () => [[participant]] }
}

test('TA-001 rejects an inactive submitting employee', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ employee_status: 'inactive' }), 10)
  assert.match(result.error, /ผู้ยื่นคำขอ.*ไม่ได้เปิดใช้งาน/i)
})

test('TA-001 rejects an inactive supervisor employee', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ supervisor_employee_status: 'inactive' }), 10)
  assert.match(result.error, /หัวหน้างานโดยตรง.*เปิดใช้งาน/i)
})

test('TA-001 rejects an inactive supervisor user account', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ supervisor_user_status: 'inactive' }), 10)
  assert.match(result.error, /บัญชีของหัวหน้างาน.*ไม่พร้อมใช้งาน/i)
})

test('TA-001 rejects a supervisor account with a non-Supervisor role', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ supervisor_role_name: 'Employee' }), 10)
  assert.match(result.error, /บทบาทหัวหน้างาน/i)
})

test('TA-001 rejects a self-supervisor relationship', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ supervisor_id: 10 }), 10)
  assert.match(result.error, /ตนเองเป็นหัวหน้างานโดยตรง/i)
  assert.doesNotMatch(result.error, /[A-Za-z]/)
})

test('TA-001 accepts a valid active Supervisor and returns its user id', async () => {
  assert.deepEqual(await validateSubmissionParticipants(connectionWithParticipant(), 10), { supervisorUserId: 30 })
})

test('leave day calculation counts the complete selected working-day range', async () => {
  const connection = { execute: async () => [[]] }
  assert.equal(await calculateWorkingDays(connection, '2026-08-24', '2026-08-24'), 1)
  assert.equal(await calculateWorkingDays(connection, '2026-08-24', '2026-08-28'), 5)
  assert.equal(await calculateWorkingDays(connection, '2026-08-24', '2026-08-30'), 5)
})

test('leave day calculation excludes weekends and active holidays represented as Date values', async () => {
  const connection = { execute: async () => [[{ holiday_date: new Date('2026-08-26T00:00:00Z') }]] }
  assert.equal(await calculateWorkingDays(connection, '2026-08-24', '2026-08-30'), 4)
})

for (const file of [
  { originalname: 'report.pdf', mimetype: 'application/pdf' },
  { originalname: 'photo.jpg', mimetype: 'image/jpeg' },
  { originalname: 'photo.jpeg', mimetype: 'image/jpeg' },
  { originalname: 'image.png', mimetype: 'image/png' },
  { originalname: 'PHOTO.JPG', mimetype: 'image/jpeg' },
]) {
  test(`TA-002 accepts allowed MIME and extension: ${file.originalname}`, () => {
    assert.equal(isAllowedLeaveAttachment(file), true)
  })
}

test('TA-002 rejects an allowed MIME with a disallowed extension', () => {
  assert.equal(isAllowedLeaveAttachment({ originalname: 'report.exe', mimetype: 'application/pdf' }), false)
  assert.equal(isAllowedLeaveAttachment({ originalname: 'photo.txt', mimetype: 'image/jpeg' }), false)
})

test('TA-002 rejects a disallowed MIME with an allowed extension', () => {
  assert.equal(isAllowedLeaveAttachment({ originalname: 'report.pdf', mimetype: 'text/plain' }), false)
})

test('approval availability is reduced only by approved usage', () => {
  assert.equal(calculateApprovalAvailability({ total_days: '10.00', used_days: '2.00' }, '3.00'), 8)
})

test('a pending request does not reduce the displayed approval availability', () => {
  const currentRequestDays = 4
  const availableForCurrent = calculateApprovalAvailability({ total_days: 10, used_days: 2 }, 3)
  assert.equal(currentRequestDays <= availableForCurrent, true)
})

test('other pending requests reserve request availability before approval', () => {
  const requestedDays = 4
  const availableToRequest = calculateRequestAvailability({ total_days: 10, used_days: 2, pending_days: 5 })
  assert.equal(requestedDays <= availableToRequest, false)
})

test('approval implementation locks entitlement and checks current approved usage', async () => {
  const calls = []
  const results = [
    [[{ entitlement_id: 7, total_days: '10.00', used_days: '2.00' }]],
  ]
  const connection = {
    execute: async (sql, parameters) => {
      calls.push({ sql, parameters })
      return results.shift()
    },
  }
  const row = { employee_id: 10, leave_type_id: 2, start_date: '2026-09-01', leave_days: 4 }
  const result = await recheckApprovalBalance(connection, row, 99)
  assert.equal(result.allowed, true)
  assert.match(calls[0].sql, /FOR UPDATE/)
  assert.equal(calls.length, 1)
})

test('general leave must be requested at least three calendar days in advance', () => {
  const annualLeave = { leave_type_name: 'Annual Leave' }
  assert.match(validateLeaveStartDatePolicy('2026-09-10', annualLeave, '2026-09-08'), /3 วัน/)
  assert.equal(validateLeaveStartDatePolicy('2026-09-11', annualLeave, '2026-09-08'), null)
})

test('sick leave can start today or in the past', () => {
  const sickLeave = { leave_type_name: 'Sick Leave' }
  assert.equal(isSickLeaveType(sickLeave), true)
  assert.equal(isSickLeaveType({ leave_type_name: 'ลาป่วย' }), true)
  assert.equal(validateLeaveStartDatePolicy('2026-09-08', sickLeave, '2026-09-08'), null)
  assert.equal(validateLeaveStartDatePolicy('2026-09-01', sickLeave, '2026-09-08'), null)
})
