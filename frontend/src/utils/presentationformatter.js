const normalize = (value) => String(value || '').trim();

const notificationTitles = {
  notification: 'การแจ้งเตือน',
  'new notification': 'การแจ้งเตือนใหม่',
  'new leave request': 'มีคำขอลาใหม่',
  'new leave request submitted': 'มีคำขอลาใหม่',
  'leave request submitted': 'ส่งคำขอลาแล้ว',
  'leave request approved': 'คำขอลาได้รับการอนุมัติ',
  'leave request rejected': 'คำขอลาถูกปฏิเสธ',
  'leave request cancelled': 'คำขอลาถูกยกเลิก',
  'pending approval reminder': 'แจ้งเตือนคำขอที่รออนุมัติ',
  'password changed': 'เปลี่ยนรหัสผ่านแล้ว',
  'password reset': 'รีเซ็ตรหัสผ่านแล้ว',
  'password reset completed': 'รีเซ็ตรหัสผ่านสำเร็จ',
};

export const formatNotificationTitle = (title) => {
  const text = normalize(title);
  const normalized = text.toLowerCase();

  if (notificationTitles[normalized]) return notificationTitles[normalized];
  if (normalized.includes('leave') && normalized.includes('approved')) return 'คำขอลาได้รับการอนุมัติ';
  if (normalized.includes('leave') && normalized.includes('rejected')) return 'คำขอลาถูกปฏิเสธ';
  if (normalized.includes('leave') && normalized.includes('cancelled')) return 'คำขอลาถูกยกเลิก';
  if (normalized.includes('leave') && normalized.includes('request')) return 'การอัปเดตคำขอลา';
  if (normalized.includes('password')) return 'การอัปเดตรหัสผ่าน';

  // Keep existing Thai titles, but never leak an unknown technical/English title.
  return /[ก-๙]/.test(text) ? text : 'การแจ้งเตือน';
};

const leaveTypeLabels = {
  'annual leave': 'ลาพักร้อน',
  'sick leave': 'ลาป่วย',
  'personal leave': 'ลากิจ',
  'maternity leave': 'ลาคลอด',
  'paternity leave': 'ลาเพื่อดูแลบุตร',
  'ordination leave': 'ลาอุปสมบท',
  'military leave': 'ลาเพื่อรับราชการทหาร',
  'other leave': 'ลาอื่น ๆ',
};

const thaiLeaveType = (value) => leaveTypeLabels[normalize(value).toLowerCase()] || normalize(value);

export const formatNotificationMessage = (message) => {
  const text = normalize(message);
  if (!text) return '-';

  let match = text.match(/^(?:Your )?[Ll]eave request (LR-[A-Z0-9-]+) was approved\.?$/i);
  if (match) return `คำขอลา ${match[1]} ได้รับการอนุมัติแล้ว`;

  match = text.match(/^(LR-[A-Z0-9-]+) was approved\.?$/i);
  if (match) return `คำขอลา ${match[1]} ได้รับการอนุมัติแล้ว`;

  match = text.match(/^(?:Your )?[Ll]eave request (LR-[A-Z0-9-]+) was rejected(?:\.\s*Reason:\s*(.+?))?\.?$/i);
  if (match) return match[2]
    ? `คำขอลา ${match[1]} ถูกปฏิเสธ เหตุผล: ${match[2]}`
    : `คำขอลา ${match[1]} ถูกปฏิเสธแล้ว`;

  match = text.match(/^(LR-[A-Z0-9-]+) was rejected(?:\.\s*Reason:\s*(.+?))?\.?$/i);
  if (match) return match[2]
    ? `คำขอลา ${match[1]} ถูกปฏิเสธ เหตุผล: ${match[2]}`
    : `คำขอลา ${match[1]} ถูกปฏิเสธแล้ว`;

  match = text.match(/^(?:Your )?[Ll]eave request (LR-[A-Z0-9-]+) was cancelled\.?$/i);
  if (match) return `คำขอลา ${match[1]} ถูกยกเลิกแล้ว`;

  match = text.match(/^(LR-[A-Z0-9-]+) was cancelled\.?$/i);
  if (match) return `คำขอลา ${match[1]} ถูกยกเลิกแล้ว`;

  match = text.match(/^Leave request (LR-[A-Z0-9-]+) is waiting for approval\.?$/i);
  if (match) return `คำขอลา ${match[1]} กำลังรอการอนุมัติ`;

  match = text.match(/^(.+?) submitted leave request (LR-[A-Z0-9-]+) for approval\.?$/i);
  if (match) return `${match[1]} ส่งคำขอลา ${match[2]} เพื่อรอการอนุมัติ`;

  match = text.match(/^(.+?) submitted (.+? Leave) request (LR-[A-Z0-9-]+)(?: for approval)?\.?$/i);
  if (match) return `${match[1]} ส่งคำขอ${thaiLeaveType(match[2])} ${match[3]} เพื่อรอการอนุมัติ`;

  match = text.match(/^(.+?) approved (.+? Leave) request (LR-[A-Z0-9-]+)\.?$/i);
  if (match) return `หัวหน้างานอนุมัติคำขอ${thaiLeaveType(match[2])} ${match[3]} แล้ว`;

  match = text.match(/^(.+?) approved leave request (LR-[A-Z0-9-]+)\.?$/i);
  if (match) return `หัวหน้างานอนุมัติคำขอลา ${match[2]} แล้ว`;

  if (/[ก-๙]/.test(text) && !/[{}]/.test(text)) return text;

  const requestNumber = text.match(/LR-[A-Z0-9-]+/i)?.[0];
  return requestNumber
    ? `มีการอัปเดตคำขอลา ${requestNumber}`
    : 'มีการอัปเดตข้อมูลในระบบ';
};

const auditTitles = {
  password_reset_otp_requested: 'ขอรหัส OTP สำหรับรีเซ็ตรหัสผ่าน',
  password_reset_otp_verified: 'ยืนยันรหัส OTP รีเซ็ตรหัสผ่าน',
  password_reset_rate_limited: 'จำกัดการขอรหัส OTP ชั่วคราว',
  password_reset_completed: 'รีเซ็ตรหัสผ่านสำเร็จ',
  change_password: 'เปลี่ยนรหัสผ่าน',
  password_changed: 'เปลี่ยนรหัสผ่าน',
  admin_password_reset: 'ผู้ดูแลระบบรีเซ็ตรหัสผ่าน',
  leave_approved: 'อนุมัติคำขอลา',
  approve_leave_request: 'อนุมัติคำขอลา',
  leave_rejected: 'ปฏิเสธคำขอลา',
  reject_leave_request: 'ปฏิเสธคำขอลา',
  leave_cancelled: 'ยกเลิกคำขอลา',
  cancel_leave_request: 'ยกเลิกคำขอลา',
  login: 'เข้าสู่ระบบ',
  logout: 'ออกจากระบบ',
  create_user: 'สร้างบัญชีผู้ใช้',
  update_user: 'แก้ไขบัญชีผู้ใช้',
  update_user_status: 'เปลี่ยนสถานะบัญชีผู้ใช้',
  create_employee: 'เพิ่มพนักงาน',
  update_employee: 'แก้ไขข้อมูลพนักงาน',
  create_department: 'เพิ่มแผนก',
  update_department: 'แก้ไขแผนก',
  create_position: 'เพิ่มตำแหน่ง',
  update_position: 'แก้ไขตำแหน่ง',
  create_holiday: 'เพิ่มวันหยุด',
  update_holiday: 'แก้ไขวันหยุด',
  export_report: 'ส่งออกรายงาน',
};

export const formatAuditActivity = (action) => auditTitles[normalize(action).toLowerCase()] || 'กิจกรรมของระบบ';

const parseMetadata = (detail) => {
  if (detail && typeof detail === 'object') return detail;
  const text = normalize(detail);
  if (!text.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const formatAuditDetail = (auditLog = {}) => {
  const action = normalize(auditLog.action).toLowerCase();
  const metadata = parseMetadata(auditLog.detail);
  const username = normalize(metadata?.username || auditLog.username);
  const subject = username || 'ผู้ใช้';
  const recordId = auditLog.recordId ?? auditLog.record_id;

  if (action === 'password_reset_otp_requested') return `${subject} ขอรหัส OTP สำหรับรีเซ็ตรหัสผ่าน`;
  if (action === 'password_reset_otp_verified') return `${subject} ยืนยันรหัส OTP สำหรับรีเซ็ตรหัสผ่านสำเร็จ`;
  if (action === 'password_reset_rate_limited') return `${subject} ขอรหัส OTP เกินจำนวนที่กำหนด กรุณารอแล้วลองใหม่`;
  if (action === 'password_reset_completed') return `${subject} รีเซ็ตรหัสผ่านสำเร็จ`;
  if (action === 'change_password' || action === 'password_changed') return `${subject} เปลี่ยนรหัสผ่านสำเร็จ`;
  if (action === 'admin_password_reset') return `ผู้ดูแลระบบรีเซ็ตรหัสผ่านของ ${subject}`;
  if (action === 'leave_approved' || action === 'approve_leave_request') {
    return `หัวหน้างานอนุมัติคำขอลา${recordId ? ` #${recordId}` : ''} แล้ว`;
  }
  if (action === 'leave_rejected' || action === 'reject_leave_request') {
    return `หัวหน้างานปฏิเสธคำขอลา${recordId ? ` #${recordId}` : ''}`;
  }
  if (action === 'leave_cancelled' || action === 'cancel_leave_request') {
    return `${subject} ยกเลิกคำขอลา${recordId ? ` #${recordId}` : ''}`;
  }
  if (action === 'login') return `${subject} เข้าสู่ระบบสำเร็จ`;
  if (action === 'logout') return `${subject} ออกจากระบบสำเร็จ`;

  const plainDetail = normalize(auditLog.detail);
  if (plainDetail && !plainDetail.startsWith('{') && /[ก-๙]/.test(plainDetail)) return plainDetail;
  if (username) return `บันทึกกิจกรรมของ ${username}`;
  return 'มีการบันทึกกิจกรรมในระบบ';
};
