import assert from 'node:assert/strict'
import test from 'node:test'

process.env.NODE_ENV = 'test'
process.env.DB_HOST = '127.0.0.1'
process.env.DB_PORT = '3306'
process.env.DB_NAME = 'online_leave_test'
process.env.DB_USER = 'test_user'
process.env.JWT_SECRET = 'leave-remediation-test-secret-with-at-least-32-bytes'

const [
  { calculateApprovalAvailability, recheckApprovalBalance, validateSubmissionParticipants },
  { isAllowedLeaveAttachment },
] = await Promise.all([
  import('../src/controllers/leave-controller.js'),
  import('../src/middleware/leave-upload.js'),
])

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
  assert.match(result.error, /submitting employee.*inactive/i)
})

test('TA-001 rejects an inactive supervisor employee', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ supervisor_employee_status: 'inactive' }), 10)
  assert.match(result.error, /active supervisor employee/i)
})

test('TA-001 rejects an inactive supervisor user account', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ supervisor_user_status: 'inactive' }), 10)
  assert.match(result.error, /active supervisor account/i)
})

test('TA-001 rejects a supervisor account with a non-Supervisor role', async () => {
  const result = await validateSubmissionParticipants(connectionWithParticipant({ supervisor_role_name: 'Employee' }), 10)
  assert.match(result.error, /Supervisor role/i)
})

test('TA-001 accepts a valid active Supervisor and returns its user id', async () => {
  assert.deepEqual(await validateSubmissionParticipants(connectionWithParticipant(), 10), { supervisorUserId: 30 })
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

test('TA-004 approval availability subtracts used and other pending days', () => {
  assert.equal(calculateApprovalAvailability({ total_days: '10.00', used_days: '2.00' }, '3.00'), 5)
})

test('TA-004 current request is not double-counted when excluded from pending input', () => {
  const currentRequestDays = 4
  const availableForCurrent = calculateApprovalAvailability({ total_days: 10, used_days: 2 }, 3)
  assert.equal(currentRequestDays <= availableForCurrent, true)
})

test('TA-004 rejects the balance condition when other pending usage leaves insufficient availability', () => {
  const currentRequestDays = 4
  const availableForCurrent = calculateApprovalAvailability({ total_days: 10, used_days: 2 }, 5)
  assert.equal(currentRequestDays <= availableForCurrent, false)
})

test('TA-004 implementation locks entitlement and excludes the current request from pending usage', async () => {
  const calls = []
  const results = [
    [[{ entitlement_id: 7, total_days: '10.00', used_days: '2.00' }]],
    [[{ pending_days: '3.00' }]],
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
  assert.match(calls[1].sql, /leave_request_id <> \?/)
  assert.deepEqual(calls[1].parameters, [10, 2, 2026, 99])
})
