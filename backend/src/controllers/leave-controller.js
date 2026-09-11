import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { pool } from '../config/database.js'
import { writeAuditLog } from '../services/audit-service.js'
import { createNotification } from '../services/notification-service.js'

export const leaveAttachmentsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/leave-attachments')
const positiveId = (value) => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null
const date = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : null
const role = (request) => String(request.user?.roleName || '').toLowerCase()
const error = (response, status, message) => response.status(status).json({ status: 'error', message })
const dateOnly = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '').slice(0, 10)
const leaveReasonPattern = /^[A-Za-z\u0E01-\u0E3A\u0E40-\u0E4E\s]+$/u

export function isValidLeaveReason(value) {
  const reason = String(value || '').trim()
  return reason.length >= 5 && reason.length <= 500 && leaveReasonPattern.test(reason)
}

export function calculateDisplayedRemaining(entitlement) {
  return Number(entitlement.total_days) - Number(entitlement.used_days)
}

export function calculateRequestAvailability(entitlement) {
  return Math.max(
    calculateDisplayedRemaining(entitlement) - Number(entitlement.pending_days || 0),
    0,
  )
}

function addCalendarDays(dateValue, days) {
  const value = new Date(`${dateValue}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function todayInBangkok() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function isSickLeaveType(leaveType) {
  const name = String(leaveType?.leave_type_name || leaveType?.name || '')
    .trim()
    .toLowerCase()
  return name.includes('sick') || name.includes('ป่วย')
}

export function validateLeaveStartDatePolicy(
  startDate,
  leaveType,
  todayDate = todayInBangkok(),
) {
  if (isSickLeaveType(leaveType)) return null
  const minimumDate = addCalendarDays(todayDate, 3)
  return startDate < minimumDate
    ? `การลาประเภทนี้ต้องยื่นล่วงหน้าอย่างน้อย 3 วัน โดยเลือกวันเริ่มลาได้ตั้งแต่ ${minimumDate}`
    : null
}

async function identity(connection, request) {
  const [rows] = await connection.execute('SELECT employee_id FROM users WHERE user_id = ? LIMIT 1', [request.user.userId])
  return rows[0]?.employee_id || null
}

export async function validateSubmissionParticipants(connection, employeeId) {
  const [rows] = await connection.execute(
    `SELECT e.employee_id, e.status AS employee_status, e.supervisor_id,
            submitter_role.role_name AS submitter_role_name,
            s.status AS supervisor_employee_status,
            u.user_id AS supervisor_user_id, u.status AS supervisor_user_status,
            r.role_name AS supervisor_role_name
     FROM employees e
     LEFT JOIN users submitter_user ON submitter_user.employee_id = e.employee_id
     LEFT JOIN roles submitter_role ON submitter_role.role_id = submitter_user.role_id
     LEFT JOIN employees s ON s.employee_id = e.supervisor_id
     LEFT JOIN users u ON u.employee_id = s.employee_id
     LEFT JOIN roles r ON r.role_id = u.role_id
     WHERE e.employee_id = ?
     LIMIT 1`,
    [employeeId],
  )
  const participant = rows[0]
  if (!participant || String(participant.employee_status).toLowerCase() !== 'active') {
    return { error: 'บัญชีผู้ยื่นคำขอไม่ถูกต้องหรือไม่ได้เปิดใช้งาน' }
  }
  if (String(participant.submitter_role_name).toLowerCase() === 'supervisor') {
    const [hrUsers] = await connection.execute(
      `SELECT u.user_id
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       JOIN employees e ON e.employee_id = u.employee_id
       WHERE LOWER(r.role_name) = 'hr'
         AND LOWER(u.status) = 'active'
         AND LOWER(e.status) = 'active'`,
    )
    if (!hrUsers.length) return { error: 'ไม่สามารถส่งคำขอได้ เนื่องจากไม่มีบัญชี HR ที่พร้อมอนุมัติ' }
    return { approverType: 'hr', approverUserIds: hrUsers.map((user) => user.user_id) }
  }
  if (!participant.supervisor_id || String(participant.supervisor_employee_status).toLowerCase() !== 'active') {
    return { error: 'ไม่สามารถส่งคำขอได้ กรุณาให้ฝ่ายบุคคลตรวจสอบหัวหน้างานโดยตรงที่เปิดใช้งานของคุณ' }
  }
  if (Number(participant.supervisor_id) === Number(participant.employee_id)) {
    return { error: 'ไม่สามารถส่งคำขอได้ เนื่องจากไม่สามารถกำหนดตนเองเป็นหัวหน้างานโดยตรง กรุณาติดต่อฝ่ายบุคคล' }
  }
  if (!participant.supervisor_user_id || String(participant.supervisor_user_status).toLowerCase() !== 'active') {
    return { error: 'ไม่สามารถส่งคำขอได้ บัญชีของหัวหน้างานโดยตรงไม่พร้อมใช้งาน กรุณาติดต่อฝ่ายบุคคล' }
  }
  if (String(participant.supervisor_role_name).toLowerCase() !== 'supervisor') {
    return { error: 'ไม่สามารถส่งคำขอได้ บัญชีของหัวหน้างานโดยตรงต้องได้รับบทบาทหัวหน้างาน กรุณาติดต่อฝ่ายบุคคล' }
  }
  return { supervisorUserId: participant.supervisor_user_id }
}

export function calculateApprovalAvailability(entitlement) {
  return Number(entitlement.total_days) - Number(entitlement.used_days)
}

export async function recheckApprovalBalance(connection, row, requestId) {
  const year = Number(dateOnly(row.start_date).slice(0, 4))
  const [entitlements] = await connection.execute(
    'SELECT entitlement_id, total_days, used_days FROM leave_entitlements WHERE employee_id = ? AND leave_type_id = ? AND year = ? FOR UPDATE',
    [row.employee_id, row.leave_type_id, year],
  )
  const entitlement = entitlements[0]
  if (!entitlement) return { allowed: false, entitlement: null }
  const availableForCurrent = calculateApprovalAvailability(entitlement)
  return {
    allowed: Number(row.leave_days) <= availableForCurrent,
    entitlement,
    availableForCurrent,
  }
}

const select = `SELECT lr.leave_request_id, lr.request_no, lr.employee_id, lr.leave_type_id,
 lr.start_date, lr.end_date, lr.leave_days, lr.reason, lr.status, lr.submitted_at,
 lr.approver_employee_id, lr.approved_at, lr.rejected_at, lr.rejection_reason,
 lr.cancelled_at, lr.created_at, lr.updated_at,
 lt.leave_type_name, lt.leave_type_code, e.employee_code, CONCAT(e.first_name, ' ', e.last_name) employee_name,
 d.department_name, p.position_name
 FROM leave_requests lr JOIN employees e ON e.employee_id = lr.employee_id
 LEFT JOIN leave_types lt ON lt.leave_type_id = lr.leave_type_id
 JOIN departments d ON d.department_id = e.department_id JOIN positions p ON p.position_id = e.position_id`

async function attachments(connection, requestId) {
  const [rows] = await connection.execute('SELECT attachment_id, original_name, mime_type, file_size FROM leave_request_attachments WHERE leave_request_id = ? ORDER BY attachment_id', [requestId])
  return rows.map((x) => ({ id: x.attachment_id, name: x.original_name, type: x.mime_type, size: Number(x.file_size), url: `/api/leave-attachments/${x.attachment_id}` }))
}
async function serialize(connection, row) {
  return { id: row.leave_request_id, leaveRequestId: row.leave_request_id, requestNo: row.request_no,
    employeeId: row.employee_id, employeeCode: row.employee_code, employeeName: row.employee_name,
    department: row.department_name, position: row.position_name, leaveTypeId: row.leave_type_id,
    leaveType: row.leave_type_name, leaveTypeCode: row.leave_type_code, startDate: dateOnly(row.start_date),
    endDate: dateOnly(row.end_date), leaveDays: Number(row.leave_days), reason: row.reason || '', status: row.status,
    submittedAt: row.submitted_at, reviewedAt: row.approved_at || row.rejected_at,
    approverEmployeeId: row.approver_employee_id, approvedAt: row.approved_at,
    rejectedAt: row.rejected_at, rejectionReason: row.rejection_reason,
    cancelledAt: row.cancelled_at, createdAt: row.created_at, updatedAt: row.updated_at,
    attachments: await attachments(connection, row.leave_request_id) }
}
async function byId(connection, requestId) {
  const [rows] = await connection.execute(`${select} WHERE lr.leave_request_id = ? LIMIT 1`, [requestId])
  return rows[0] || null
}

export async function calculateWorkingDays(connection, startDate, endDate) {
  const [holidays] = await connection.execute('SELECT holiday_date FROM holidays WHERE is_active = 1 AND holiday_date BETWEEN ? AND ?', [startDate, endDate])
  const excluded = new Set(holidays.map((x) => dateOnly(x.holiday_date)))
  let total = 0
  for (let cursor = new Date(`${startDate}T00:00:00Z`), end = new Date(`${endDate}T00:00:00Z`); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay(); const key = cursor.toISOString().slice(0, 10)
    if (day !== 0 && day !== 6 && !excluded.has(key)) total += 1
  }
  return total
}

export async function validateLeaveBoundaryDates(connection, startDate, endDate) {
  for (const [label, dateValue] of [['วันเริ่มลา', startDate], ['วันสิ้นสุดการลา', endDate]]) {
    const dayOfWeek = new Date(`${dateValue}T00:00:00Z`).getUTCDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return `${label}ต้องไม่เป็นวันหยุดสุดสัปดาห์`
    }
  }

  const [holidays] = await connection.execute(
    `SELECT holiday_date, holiday_name
     FROM holidays
     WHERE is_active = 1 AND holiday_date IN (?, ?)`,
    [startDate, endDate],
  )
  const holidayByDate = new Map(holidays.map((holiday) => [dateOnly(holiday.holiday_date), holiday.holiday_name]))
  if (holidayByDate.has(startDate)) return `วันเริ่มลาเป็นวันหยุด: ${holidayByDate.get(startDate)}`
  if (holidayByDate.has(endDate)) return `วันสิ้นสุดการลาเป็นวันหยุด: ${holidayByDate.get(endDate)}`
  return null
}

async function validate(connection, employeeId, body, currentId = 0, submitting = false) {
  const leaveTypeId = positiveId(body.leaveTypeId)
  const startDate = date(body.startDate); const endDate = date(body.endDate)
  const reason = String(body.reason || '').trim()
  const requestsHalfDay = body.halfDay === true
    || String(body.halfDay || '').toLowerCase() === 'true'
    || ['half-day', 'half_day', 'halfday'].includes(String(body.durationType || body.leaveDuration || '').toLowerCase())
  if (requestsHalfDay) return { error: 'ระบบยังไม่รองรับการลาครึ่งวัน' }
  if (!submitting && !leaveTypeId && !startDate && !endDate && !reason) return { value: { leaveTypeId: null, startDate: null, endDate: null, reason: '' } }
  if (!leaveTypeId || !startDate || !endDate || !reason) return { error: 'กรุณาระบุประเภทการลา วันที่เริ่มต้น วันที่สิ้นสุด และเหตุผลการลาให้ครบถ้วน' }
  if (startDate > endDate) return { error: 'วันที่สิ้นสุดต้องตรงกับหรืออยู่หลังวันที่เริ่มลา' }
  if (startDate.slice(0, 4) !== endDate.slice(0, 4)) return { error: 'ระบบไม่รองรับการยื่นคำขอลาคร่อมปี' }
  if (!isValidLeaveReason(reason)) return { error: 'เหตุผลการลาต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น' }
  const [types] = await connection.execute('SELECT * FROM leave_types WHERE leave_type_id = ? AND is_active = 1 LIMIT 1', [leaveTypeId])
  if (!types.length) return { error: 'ประเภทการลาที่เลือกไม่ถูกต้องหรือถูกปิดใช้งาน' }
  const startDatePolicyError = validateLeaveStartDatePolicy(startDate, types[0])
  if (startDatePolicyError) return { error: startDatePolicyError }
  const boundaryDateError = await validateLeaveBoundaryDates(connection, startDate, endDate)
  if (boundaryDateError) return { error: boundaryDateError }
  const days = await calculateWorkingDays(connection, startDate, endDate)
  if (!days) return { error: 'ช่วงวันที่เลือกไม่มีวันทำงานที่สามารถใช้สิทธิ์ลาได้' }
  const type = types[0]
  if (days < Number(type.minimum_days || 0) || days > Number(type.maximum_days_per_request || 365)) return { error: 'จำนวนวันลาไม่เป็นไปตามเงื่อนไขของประเภทการลาที่เลือก' }
  const year = Number(startDate.slice(0, 4))
  const [ents] = await connection.execute(`SELECT entitlement_id, total_days, used_days
    FROM leave_entitlements
    WHERE employee_id = ? AND leave_type_id = ? AND year = ?
    LIMIT 1${submitting ? ' FOR UPDATE' : ''}`, [employeeId, leaveTypeId, year])
  if (!ents.length) return { error: 'ไม่พบสิทธิ์การลาสำหรับประเภทและปีที่เลือก' }
  const [[pending]] = await connection.execute(`SELECT COALESCE(SUM(leave_days), 0) pending_days
    FROM leave_requests
    WHERE employee_id = ? AND leave_type_id = ? AND YEAR(start_date) = ?
      AND status = 'pending' AND leave_request_id <> ?`, [employeeId, leaveTypeId, year, currentId])
  const requestAvailability = calculateRequestAvailability({
    ...ents[0],
    pending_days: pending.pending_days,
  })
  if (requestAvailability < days) {
    const pendingDays = Number(pending.pending_days || 0)
    return {
      error: pendingDays > 0
        ? `ไม่สามารถส่งคำขอได้ เนื่องจากสิทธิ์ที่ยื่นได้คงเหลือ ${requestAvailability} วัน และมีคำขอรออนุมัติ ${pendingDays} วัน`
        : `ไม่สามารถส่งคำขอได้ เนื่องจากสิทธิ์วันลาคงเหลือ ${requestAvailability} วัน`,
    }
  }
  const [overlap] = await connection.execute(`SELECT leave_request_id FROM leave_requests WHERE employee_id = ? AND status IN ('pending','approved') AND leave_request_id <> ? AND start_date <= ? AND end_date >= ? LIMIT 1`, [employeeId, currentId, endDate, startDate])
  if (overlap.length) return { error: 'ช่วงวันที่เลือกซ้ำกับคำขอที่รออนุมัติหรือได้รับอนุมัติแล้ว' }
  return { value: { leaveTypeId, startDate, endDate, reason, days, entitlementId: ents[0].entitlement_id, type } }
}

async function storeFiles(connection, requestId, files = []) {
  if (!files.length) return
  await mkdir(leaveAttachmentsDirectory, { recursive: true })
  for (const file of files) {
    const stored = `${requestId}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`
    await writeFile(path.join(leaveAttachmentsDirectory, stored), file.buffer, { flag: 'wx' })
    await connection.execute('INSERT INTO leave_request_attachments (leave_request_id, original_name, stored_name, mime_type, file_size) VALUES (?, ?, ?, ?, ?)', [requestId, file.originalname, stored, file.mimetype, file.size])
  }
}

export async function options(request, response) {
  const employeeId = await identity(pool, request); const year = Number(request.query.year || new Date().getFullYear())
  const [types] = await pool.execute(`SELECT lt.leave_type_id, lt.leave_type_code, lt.leave_type_name, lt.minimum_days, lt.maximum_days_per_request, lt.requires_attachment, lt.attachment_required_after_days,
    le.total_days, le.used_days, COALESCE(SUM(CASE WHEN lr.status='pending' THEN lr.leave_days ELSE 0 END),0) pending_days
    FROM leave_types lt LEFT JOIN leave_entitlements le ON le.leave_type_id=lt.leave_type_id AND le.employee_id=? AND le.year=?
    LEFT JOIN leave_requests lr ON lr.employee_id=? AND lr.leave_type_id=lt.leave_type_id AND YEAR(lr.start_date)=? WHERE lt.is_active=1 GROUP BY lt.leave_type_id, le.entitlement_id ORDER BY lt.leave_type_name`, [employeeId, year, employeeId, year])
  const [holidays] = await pool.execute('SELECT holiday_id, holiday_date, holiday_name FROM holidays WHERE is_active=1 AND YEAR(holiday_date)=? ORDER BY holiday_date', [year])
  response.json({ status: 'ok', data: { leaveTypes: types.map((x) => ({ id:x.leave_type_id, leaveTypeId:x.leave_type_id, code:x.leave_type_code, name:x.leave_type_name, status:'Active', minimumDays:Number(x.minimum_days), maximumDaysPerRequest:Number(x.maximum_days_per_request), requiresAttachment:Boolean(x.requires_attachment), attachmentRequiredAfterDays:Number(x.attachment_required_after_days), totalDays:Number(x.total_days||0), usedDays:Number(x.used_days||0), pendingDays:Number(x.pending_days||0), remainingDays:calculateDisplayedRemaining(x), availableDays:calculateRequestAvailability(x), hasEntitlement:Boolean(x.total_days!==null) })), holidays: holidays.map((x)=>({ id:x.holiday_id, date:dateOnly(x.holiday_date), name:x.holiday_name })) } })
}

export async function listOwn(request, response) {
  const employeeId = await identity(pool, request); const [rows] = await pool.execute(`${select} WHERE lr.employee_id = ? ORDER BY lr.created_at DESC`, [employeeId])
  response.json({ status:'ok', data:{ leaveRequests: await Promise.all(rows.map((x)=>serialize(pool,x))) } })
}
export async function getOwn(request, response) {
  const requestId=positiveId(request.params.requestId); const employeeId=await identity(pool,request); const row=await byId(pool,requestId)
  if (!row || row.employee_id!==employeeId) return error(response,404,'ไม่พบคำขอลาที่ต้องการ')
  response.json({status:'ok',data:{leaveRequest:await serialize(pool,row)}})
}
export async function saveDraft(request,response) { return save(request,response,false) }
export async function submit(request,response) { return save(request,response,true) }
async function rollbackError(connection, response, status, message) {
  await connection.rollback()
  return error(response, status, message)
}
async function save(request,response,submitting) {
  const connection=await pool.getConnection(); try { await connection.beginTransaction(); const employeeId=await identity(connection,request); const requestId=positiveId(request.params.requestId); let existing=null
    if(requestId){ existing=await byId(connection,requestId); if(!existing||existing.employee_id!==employeeId)return rollbackError(connection,response,404,'ไม่พบแบบร่างคำขอลาที่ต้องการแก้ไข'); if(existing.status!=='draft')return rollbackError(connection,response,409,'แก้ไขได้เฉพาะคำขอที่ยังเป็นแบบร่างเท่านั้น') }
    const checked=await validate(connection,employeeId,request.body,requestId||0,submitting); if(checked.error)return rollbackError(connection,response,400,checked.error); const v=checked.value
    const participants=submitting?await validateSubmissionParticipants(connection,employeeId):null; if(participants?.error)return rollbackError(connection,response,400,participants.error)
    let id=requestId; if(id) await connection.execute(`UPDATE leave_requests SET leave_type_id=?,start_date=?,end_date=?,leave_days=?,reason=?,status=?,submitted_at=${submitting?'NOW()':'NULL'} WHERE leave_request_id=?`,[v.leaveTypeId,v.startDate,v.endDate,v.days||0,v.reason,submitting?'pending':'draft',id])
    else { const [result]=await connection.execute(`INSERT INTO leave_requests(employee_id,leave_type_id,start_date,end_date,leave_days,reason,status,submitted_at) VALUES(?,?,?,?,?,?,?,${submitting?'NOW()':'NULL'})`,[employeeId,v.leaveTypeId,v.startDate,v.endDate,v.days||0,v.reason,submitting?'pending':'draft']); id=result.insertId }
    if(submitting){ const [[storedCount]]=await connection.execute('SELECT COUNT(*) attachment_count FROM leave_request_attachments WHERE leave_request_id=?',[id]); const mustAttach=Boolean(v.type.requires_attachment)&&Number(v.days)>=Number(v.type.attachment_required_after_days||0); if(mustAttach&&!request.files?.length&&!Number(storedCount.attachment_count))return rollbackError(connection,response,400,'คำขอลาประเภทนี้จำเป็นต้องแนบเอกสาร'); const requestNo=`LR-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${String(id).padStart(6,'0')}`; await connection.execute('UPDATE leave_requests SET request_no=? WHERE leave_request_id=?',[requestNo,id]); const approverUserIds=participants.approverUserIds||[participants.supervisorUserId]; for (const approverUserId of approverUserIds) await createNotification(connection,{userId:approverUserId,type:'leave-submitted',title:'New leave request',message:`Leave request ${requestNo} is waiting for approval.`,leaveRequestId:id}) }
    await storeFiles(connection,id,request.files)
    const row=await byId(connection,id)
    if(!row) throw new Error('Saved leave request could not be reloaded.')
    const leaveRequest=await serialize(connection,row)
    await connection.commit()
    response.status(requestId?200:201).json({status:'ok',message:submitting?'ส่งคำขอลาเรียบร้อยแล้ว':'บันทึกแบบร่างเรียบร้อยแล้ว',data:{leaveRequest}})
  } catch(e){await connection.rollback(); console.error(e); error(response,500,'ไม่สามารถบันทึกคำขอลาได้ กรุณาลองใหม่อีกครั้ง')} finally {connection.release()} }

export async function deleteDraft(request,response){const employeeId=await identity(pool,request);const [result]=await pool.execute(`DELETE FROM leave_requests WHERE leave_request_id=? AND employee_id=? AND status='draft'`,[positiveId(request.params.requestId),employeeId]);if(!result.affectedRows)return error(response,409,'ลบได้เฉพาะแบบร่างของตนเองเท่านั้น');response.json({status:'ok',message:'ลบแบบร่างเรียบร้อยแล้ว'})}
export async function cancelOwn(request, response) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const employeeId = await identity(connection, request)
    const requestId = positiveId(request.params.requestId)
    const [rows] = await connection.execute(
      `SELECT lr.leave_request_id, lr.request_no, lr.status, e.supervisor_id,
              LOWER(owner_role.role_name) AS owner_role_name
       FROM leave_requests lr
       JOIN employees e ON e.employee_id = lr.employee_id
       JOIN users owner_user ON owner_user.employee_id = e.employee_id
       JOIN roles owner_role ON owner_role.role_id = owner_user.role_id
       WHERE lr.leave_request_id = ? AND lr.employee_id = ?
       LIMIT 1 FOR UPDATE`,
      [requestId, employeeId],
    )
    const leaveRequest = rows[0]
    if (!leaveRequest || leaveRequest.status !== 'pending') {
      return rollbackError(connection, response, 409, 'ยกเลิกได้เฉพาะคำขอของตนเองที่กำลังรออนุมัติเท่านั้น')
    }

    let approverUsers = []
    if (leaveRequest.owner_role_name === 'supervisor') {
      const [users] = await connection.execute(
        `SELECT u.user_id
         FROM users u
         JOIN roles r ON r.role_id = u.role_id
         JOIN employees e ON e.employee_id = u.employee_id
         WHERE LOWER(r.role_name) = 'hr'
           AND LOWER(u.status) = 'active'
           AND LOWER(e.status) = 'active'`,
      )
      approverUsers = users
    } else {
      const [users] = await connection.execute(
        `SELECT u.user_id
         FROM users u
         JOIN roles r ON r.role_id = u.role_id
         JOIN employees e ON e.employee_id = u.employee_id
         WHERE e.employee_id = ?
           AND LOWER(r.role_name) = 'supervisor'
           AND LOWER(u.status) = 'active'
           AND LOWER(e.status) = 'active'`,
        [leaveRequest.supervisor_id],
      )
      approverUsers = users
    }

    await connection.execute(
      `UPDATE leave_requests
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE leave_request_id = ?`,
      [requestId],
    )

    for (const approver of approverUsers) {
      await createNotification(connection, {
        userId: approver.user_id,
        type: 'leave-cancelled',
        title: 'Leave request cancelled',
        message: `Leave request ${leaveRequest.request_no || `#${requestId}`} was cancelled by the requester.`,
        leaveRequestId: requestId,
      })
    }

    await connection.commit()
    response.json({ status: 'ok', message: 'ยกเลิกคำขอลาเรียบร้อยแล้ว' })
  } catch (cause) {
    await connection.rollback()
    console.error('Cancel leave request error:', cause)
    error(response, 500, 'ไม่สามารถยกเลิกคำขอลาได้ กรุณาลองใหม่อีกครั้ง')
  } finally {
    connection.release()
  }
}

export async function balance(request,response){const employeeId=await identity(pool,request);const year=Number(request.query.year||new Date().getFullYear());const [rows]=await pool.execute(`SELECT le.entitlement_id,lt.leave_type_id,lt.leave_type_name,le.total_days,le.used_days,COALESCE(SUM(CASE WHEN lr.status='pending' THEN lr.leave_days ELSE 0 END),0) pending_days FROM leave_entitlements le JOIN leave_types lt ON lt.leave_type_id=le.leave_type_id LEFT JOIN leave_requests lr ON lr.employee_id=le.employee_id AND lr.leave_type_id=le.leave_type_id AND YEAR(lr.start_date)=le.year WHERE le.employee_id=? AND le.year=? GROUP BY le.entitlement_id ORDER BY lt.leave_type_name`,[employeeId,year]);response.json({status:'ok',data:{year,balances:rows.map(x=>({id:x.entitlement_id,leaveTypeId:x.leave_type_id,leaveType:x.leave_type_name,total:Number(x.total_days),used:Number(x.used_days),pending:Number(x.pending_days),remaining:calculateDisplayedRemaining(x),available:calculateRequestAvailability(x)}))}})}

export async function supervisorList(request,response){const supervisorId=await identity(pool,request);const [rows]=await pool.execute(`${select} WHERE e.supervisor_id=? AND lr.status='pending' AND lr.employee_id<>? ORDER BY lr.submitted_at`,[supervisorId,supervisorId]);response.json({status:'ok',data:{leaveRequests:await Promise.all(rows.map(x=>serialize(pool,x)))}})}
export async function supervisorDetail(request,response){const supervisorId=await identity(pool,request);const row=await byId(pool,positiveId(request.params.requestId));if(!row){return error(response,404,'ไม่พบคำขอลาที่ต้องการ')}const [ok]=await pool.execute('SELECT employee_id FROM employees WHERE employee_id=? AND supervisor_id=?',[row.employee_id,supervisorId]);if(!ok.length||row.employee_id===supervisorId)return error(response,403,'คุณไม่มีสิทธิ์เข้าถึงคำขอลานี้');response.json({status:'ok',data:{leaveRequest:await serialize(pool,row)}})}
const submittedByRoleSql = `EXISTS (SELECT 1 FROM users submitter_user JOIN roles submitter_role ON submitter_role.role_id=submitter_user.role_id WHERE submitter_user.employee_id=lr.employee_id AND LOWER(submitter_role.role_name)=?)`
export async function hrApprovalList(_request,response){const [rows]=await pool.execute(`${select} WHERE lr.status='pending' AND ${submittedByRoleSql} ORDER BY lr.submitted_at`,['supervisor']);response.json({status:'ok',data:{leaveRequests:await Promise.all(rows.map(x=>serialize(pool,x)))}})}
export async function hrApprovalDetail(request,response){const row=await byId(pool,positiveId(request.params.requestId));if(!row)return error(response,404,'ไม่พบคำขอลาที่ต้องการ');const [ok]=await pool.execute(`SELECT lr.leave_request_id FROM leave_requests lr WHERE lr.leave_request_id=? AND ${submittedByRoleSql}`,[row.leave_request_id,'supervisor']);if(!ok.length)return error(response,403,'คุณไม่มีสิทธิ์เข้าถึงคำขอลานี้');response.json({status:'ok',data:{leaveRequest:await serialize(pool,row)}})}
export async function decide(request, response) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const approverId = await identity(connection, request)
    const requestId = positiveId(request.params.requestId)
    const decision = String(request.body.decision || '').toLowerCase()
    const reason = String(request.body.reason || '').trim()
    if (!['approved', 'rejected'].includes(decision) || (decision === 'rejected' && !reason)) {
      return rollbackError(connection, response, 400, 'กรุณาเลือกผลการพิจารณา และระบุเหตุผลเมื่อปฏิเสธคำขอ')
    }
    const [rows] = await connection.execute(`${select} WHERE lr.leave_request_id = ? FOR UPDATE`, [requestId])
    const row = rows[0]
    if (!row || row.status !== 'pending') return rollbackError(connection, response, 409, 'คำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติหรือถูกพิจารณาไปแล้ว')
    const approverRole = role(request)
    const [submitterRoles] = await connection.execute('SELECT LOWER(r.role_name) role_name FROM users u JOIN roles r ON r.role_id=u.role_id WHERE u.employee_id=?',[row.employee_id])
    const submitterRole = submitterRoles[0]?.role_name
    if (approverRole === 'hr') {
      if (submitterRole !== 'supervisor') return rollbackError(connection, response, 403, 'คุณไม่มีสิทธิ์พิจารณาคำขอลานี้')
    } else {
      const [team] = await connection.execute('SELECT employee_id FROM employees WHERE employee_id = ? AND supervisor_id = ?',[row.employee_id, approverId])
      if (approverRole !== 'supervisor' || !team.length || row.employee_id === approverId) return rollbackError(connection, response, 403, 'คุณไม่มีสิทธิ์พิจารณาคำขอลานี้')
    }

    if (decision === 'approved') {
      const balanceCheck = await recheckApprovalBalance(connection, row, requestId)
      if (!balanceCheck.allowed) {
        return rollbackError(connection, response, 409, 'สิทธิ์วันลาคงเหลือไม่เพียงพอสำหรับการอนุมัติคำขอนี้')
      }
      await connection.execute(
        'UPDATE leave_entitlements SET used_days = used_days + ? WHERE entitlement_id = ?',
        [row.leave_days, balanceCheck.entitlement.entitlement_id],
      )
      await connection.execute(
        `UPDATE leave_requests
         SET status = 'approved', approver_employee_id = ?, approved_at = NOW(),
             rejected_at = NULL, rejection_reason = NULL
         WHERE leave_request_id = ?`,
        [approverId, requestId],
      )
    } else {
      await connection.execute(
        `UPDATE leave_requests
         SET status = 'rejected', approver_employee_id = ?, rejected_at = NOW(),
             approved_at = NULL, rejection_reason = ?
         WHERE leave_request_id = ?`,
        [approverId, reason, requestId],
      )
    }

    const [users] = await connection.execute('SELECT user_id FROM users WHERE employee_id = ?', [row.employee_id])
    await createNotification(connection, {
      userId: users[0].user_id,
      type: `leave-${decision}`,
      title: `Leave request ${decision}`,
      message: decision === 'rejected' ? `${row.request_no} was rejected: ${reason}` : `${row.request_no} was approved.`,
      leaveRequestId: requestId,
    })
    await writeAuditLog(connection, {
      userId: request.user.userId,
      action: `leave_${decision}`,
      tableName: 'leave_requests',
      recordId: requestId,
      result: 'success',
      ipAddress: request.ip || null,
      userAgent: request.get('user-agent') || '',
    })
    await connection.commit()
    return response.json({ status: 'ok', message: decision === 'approved' ? 'อนุมัติคำขอลาเรียบร้อยแล้ว' : 'ปฏิเสธคำขอลาเรียบร้อยแล้ว' })
  } catch (exception) {
    await connection.rollback()
    console.error(exception)
    return error(response, 500, 'ไม่สามารถบันทึกผลการพิจารณาได้ กรุณาลองใหม่อีกครั้ง')
  } finally {
    connection.release()
  }
}
export async function teamReport(request,response){const supervisorId=await identity(pool,request);const conditions=['e.supervisor_id=?','lr.employee_id<>?'];const params=[supervisorId,supervisorId];for(const [key,column] of [['status','lr.status'],['leaveTypeId','lr.leave_type_id'],['departmentId','e.department_id']])if(request.query[key]&&request.query[key]!=='all'){conditions.push(`${column}=?`);params.push(request.query[key])}if(date(request.query.startDate)){conditions.push('lr.start_date>=?');params.push(request.query.startDate)}if(date(request.query.endDate)){conditions.push('lr.end_date<=?');params.push(request.query.endDate)}const [rows]=await pool.execute(`${select} WHERE ${conditions.join(' AND ')} ORDER BY lr.start_date DESC`,params);const items=await Promise.all(rows.map(x=>serialize(pool,x)));response.json({status:'ok',data:{leaveRequests:items,summary:{total:items.length,pending:items.filter(x=>x.status==='pending').length,approved:items.filter(x=>x.status==='approved').length,rejected:items.filter(x=>x.status==='rejected').length,cancelled:items.filter(x=>x.status==='cancelled').length}}})}

export async function downloadAttachment(request,response){const attachmentId=positiveId(request.params.attachmentId);const employeeId=await identity(pool,request);const [rows]=await pool.execute(`SELECT a.*,lr.employee_id,e.supervisor_id FROM leave_request_attachments a JOIN leave_requests lr ON lr.leave_request_id=a.leave_request_id JOIN employees e ON e.employee_id=lr.employee_id WHERE a.attachment_id=?`,[attachmentId]);const row=rows[0];if(!row||!(row.employee_id===employeeId||row.supervisor_id===employeeId||['hr','admin'].includes(role(request))))return error(response,404,'ไม่พบไฟล์แนบหรือคุณไม่มีสิทธิ์เข้าถึง');response.download(path.join(leaveAttachmentsDirectory,row.stored_name),row.original_name)}
export async function deleteAttachment(request,response){const attachmentId=positiveId(request.params.attachmentId);const employeeId=await identity(pool,request);const [rows]=await pool.execute(`SELECT a.stored_name,lr.status FROM leave_request_attachments a JOIN leave_requests lr ON lr.leave_request_id=a.leave_request_id WHERE a.attachment_id=? AND lr.employee_id=?`,[attachmentId,employeeId]);if(!rows.length||rows[0].status!=='draft')return error(response,409,'ลบไฟล์แนบได้เฉพาะแบบร่างของตนเองเท่านั้น');await pool.execute('DELETE FROM leave_request_attachments WHERE attachment_id=?',[attachmentId]);await unlink(path.join(leaveAttachmentsDirectory,rows[0].stored_name)).catch(()=>{});response.json({status:'ok',message:'ลบไฟล์แนบเรียบร้อยแล้ว'})}
