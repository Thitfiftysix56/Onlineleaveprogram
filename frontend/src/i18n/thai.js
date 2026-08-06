const exact = new Map(Object.entries({
  'Sign In': 'เข้าสู่ระบบ', 'Sign Out': 'ออกจากระบบ', Logout: 'ออกจากระบบ', 'Forgot Password?': 'ลืมรหัสผ่าน', 'Forgot Password': 'ลืมรหัสผ่าน',
  'Change Password': 'เปลี่ยนรหัสผ่าน', Profile: 'ข้อมูลส่วนตัว', Notification: 'การแจ้งเตือน', Notifications: 'การแจ้งเตือน',
  Save: 'บันทึก', Cancel: 'ยกเลิก', Delete: 'ลบ', Edit: 'แก้ไข', Add: 'เพิ่ม', Search: 'ค้นหา', Filter: 'ตัวกรอง', 'View Details': 'ดูรายละเอียด',
  Back: 'กลับ', Submit: 'ส่งคำขอ', 'Submit Request': 'ส่งคำขอ', 'Save Draft': 'บันทึกร่าง', Approve: 'อนุมัติ', Reject: 'ปฏิเสธ', Dashboard: 'แดชบอร์ด',
  Draft: 'แบบร่าง', Pending: 'รออนุมัติ', Approved: 'อนุมัติแล้ว', Rejected: 'ปฏิเสธแล้ว', Cancelled: 'ยกเลิกแล้ว',
  Active: 'เปิดใช้งาน', Inactive: 'ปิดใช้งาน', Read: 'อ่านแล้ว', Unread: 'ยังไม่ได้อ่าน', Locked: 'ถูกล็อก', Resigned: 'ลาออก',
  Status: 'สถานะ', Actions: 'การดำเนินการ', Action: 'การดำเนินการ', Details: 'รายละเอียด', Description: 'คำอธิบาย', Reason: 'เหตุผล',
  Name: 'ชื่อ', 'Full Name': 'ชื่อ-นามสกุล', Phone: 'เบอร์โทรศัพท์', Department: 'แผนก', Position: 'ตำแหน่ง',
  'Username or Email': 'Username หรือ Email',
  'Employee Code': 'รหัสพนักงาน', 'Employee ID': 'รหัสพนักงาน',
  'Leave Request': 'คำขอลา', 'Leave Requests': 'คำขอลา', 'Create Leave Request': 'สร้างคำขอลา', 'My Requests': 'คำขอลาของฉัน',
  'Request Detail': 'รายละเอียดคำขอลา', 'Leave Request Detail': 'รายละเอียดคำขอลา', 'Leave Balance': 'สิทธิ์วันลาคงเหลือ',
  Approval: 'การอนุมัติ', 'Approval List': 'รายการรออนุมัติ', 'Team Reports': 'รายงานทีม', 'Team Report': 'รายงานทีม', Reports: 'รายงาน', Report: 'รายงาน',
  'Employee Management': 'จัดการพนักงาน', 'User Management': 'จัดการผู้ใช้งาน', 'Leave Type Management': 'จัดการประเภทการลา',
  'Leave Types': 'ประเภทการลา', 'Leave Type': 'ประเภทการลา', 'Leave Entitlement Management': 'จัดการสิทธิ์วันลา',
  'Leave Entitlement': 'สิทธิ์วันลา', 'Holiday Management': 'จัดการวันหยุด', Holidays: 'วันหยุด', Holiday: 'วันหยุด',
  'Department Management': 'จัดการแผนก', 'Position Management': 'จัดการตำแหน่ง', 'Audit Log': 'บันทึกการตรวจสอบ',
  'Add Employee': 'เพิ่มพนักงาน', 'Edit Employee': 'แก้ไขข้อมูลพนักงาน', 'Import Employees': 'นำเข้าข้อมูลพนักงาน',
  'Add User': 'เพิ่มผู้ใช้งาน', 'Edit User': 'แก้ไขผู้ใช้งาน', 'Add Leave Type': 'เพิ่มประเภทการลา', 'Edit Leave Type': 'แก้ไขประเภทการลา',
  'Add Department': 'เพิ่มแผนก', 'Edit Department': 'แก้ไขแผนก', 'Add Position': 'เพิ่มตำแหน่ง', 'Edit Position': 'แก้ไขตำแหน่ง',
  'Reset Password': 'รีเซ็ตรหัสผ่าน', 'Temporary Password': 'รหัสผ่านชั่วคราว', 'Current Password': 'รหัสผ่านปัจจุบัน',
  'New Password': 'รหัสผ่านใหม่', 'Confirm Password': 'ยืนยันรหัสผ่าน', 'Confirm New Password': 'ยืนยันรหัสผ่านใหม่',
  'Show password': 'แสดงรหัสผ่าน', 'Hide password': 'ซ่อนรหัสผ่าน', 'Verify OTP': 'ยืนยัน OTP', 'Verification Code': 'รหัสยืนยัน',
  'Start Date': 'วันที่เริ่มลา', 'End Date': 'วันที่สิ้นสุด', 'Submitted Date': 'วันที่ส่งคำขอ', 'Submitted At': 'วันที่ส่งคำขอ',
  'Leave Days': 'จำนวนวันลา', 'Total Days': 'สิทธิ์ทั้งหมด', 'Used Days': 'ใช้ไปแล้ว', 'Pending Days': 'รออนุมัติ',
  Remaining: 'คงเหลือ', 'Remaining Days': 'คงเหลือ', Available: 'ใช้ได้', Year: 'ปี', Date: 'วันที่', Type: 'ประเภท',
  Attachments: 'ไฟล์แนบ', Attachment: 'ไฟล์แนบ', 'Choose File': 'เลือกไฟล์', 'Choose CSV File': 'เลือกไฟล์ CSV',
  'No file selected': 'ยังไม่ได้เลือกไฟล์', 'Preview Employees': 'ดูตัวอย่างข้อมูลพนักงาน', All: 'ทั้งหมด', Clear: 'ล้างข้อมูล',
  Reset: 'รีเซ็ต', Close: 'ปิด', Confirm: 'ยืนยัน', Yes: 'ใช่', No: 'ไม่ใช่', Loading: 'กำลังโหลด', 'Loading...': 'กำลังโหลด...',
  'No data': 'ไม่มีข้อมูล', 'No records found': 'ไม่พบข้อมูล', 'Mark as Read': 'ทำเครื่องหมายว่าอ่านแล้ว',
  'Mark All as Read': 'ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว', 'All Notifications': 'การแจ้งเตือนทั้งหมด', 'Delete Notification': 'ลบการแจ้งเตือน',
  'Approve Request': 'อนุมัติคำขอ', 'Reject Request': 'ปฏิเสธคำขอ', 'Cancel Request': 'ยกเลิกคำขอ', 'Delete Draft': 'ลบแบบร่าง',
  'Approve Leave Request': 'อนุมัติคำขอลา', 'Reject Leave Request': 'ปฏิเสธคำขอลา', 'Rejection Reason': 'เหตุผลที่ปฏิเสธ',
  'Search requests': 'ค้นหาคำขอลา', 'Search notifications': 'ค้นหาการแจ้งเตือน', 'Search employees': 'ค้นหาพนักงาน', 'Search users': 'ค้นหาผู้ใช้งาน',
  'First Name': 'ชื่อ', 'Last Name': 'นามสกุล', 'Hire Date': 'วันที่เริ่มงาน', 'Employment Date': 'วันที่เริ่มงาน',
  'Public Holiday': 'วันหยุดราชการ', 'Company Holiday': 'วันหยุดบริษัท', 'Special Holiday': 'วันหยุดพิเศษ',
  'Annual Leave': 'ลาพักร้อน', 'Sick Leave': 'ลาป่วย', 'Personal Leave': 'ลากิจ', 'Maternity Leave': 'ลาคลอด',
  'Request ID': 'รหัสคำขอ', 'Request Number': 'เลขที่คำขอ', 'Date Range': 'ช่วงวันที่', 'Leave Period': 'ช่วงวันลา', Submitted: 'ส่งเมื่อ', Updated: 'อัปเดตเมื่อ',
  Total: 'รวม', 'Total Requests': 'คำขอทั้งหมด', 'Total Leave Days': 'วันลารวม', 'Total Entitlement': 'สิทธิ์ทั้งหมด', 'Available Days': 'วันลาที่ใช้ได้',
  'Pending Approval': 'รอการอนุมัติ', 'Waiting for your review': 'รอการตรวจสอบจากคุณ', 'Approved this month': 'อนุมัติในเดือนนี้', 'Rejected this month': 'ปฏิเสธในเดือนนี้',
  'Total Notifications': 'การแจ้งเตือนทั้งหมด', 'Unread Notifications': 'การแจ้งเตือนที่ยังไม่ได้อ่าน', 'Read Notifications': 'การแจ้งเตือนที่อ่านแล้ว', 'Received Today': 'ได้รับวันนี้',
  'All Categories': 'ทุกหมวดหมู่', 'All Status': 'ทุกสถานะ', 'All Leave Types': 'ทุกประเภทการลา', 'All Departments': 'ทุกแผนก',
  'No Balance': 'ไม่มีสิทธิ์คงเหลือ', 'Low Balance': 'สิทธิ์คงเหลือน้อย', 'Not specified': 'ไม่ได้ระบุ',
  'Days from approved requests': 'จำนวนวันจากคำขอที่อนุมัติแล้ว', 'Days awaiting approval': 'จำนวนวันที่รออนุมัติ', 'Days currently available': 'จำนวนวันที่ใช้ได้ในปัจจุบัน', 'Total leave days granted': 'จำนวนวันลาที่ได้รับทั้งหมด',
  'Employee Name': 'ชื่อพนักงาน', 'Position Name': 'ชื่อตำแหน่ง', 'Department Name': 'ชื่อแผนก', Employees: 'พนักงาน', 'Active Employees': 'พนักงานที่เปิดใช้งาน',
  'Total Employees': 'พนักงานทั้งหมด', 'Total Positions': 'ตำแหน่งทั้งหมด', 'Active Positions': 'ตำแหน่งที่เปิดใช้งาน', 'Inactive Positions': 'ตำแหน่งที่ปิดใช้งาน', 'Assigned Employees': 'พนักงานที่ได้รับมอบหมาย',
  'Total Departments': 'แผนกทั้งหมด', 'Active Departments': 'แผนกที่เปิดใช้งาน', 'Inactive Departments': 'แผนกที่ปิดใช้งาน',
  'Total Users': 'ผู้ใช้งานทั้งหมด', 'Active Users': 'ผู้ใช้งานที่เปิดใช้งาน', 'Inactive Users': 'ผู้ใช้งานที่ปิดใช้งาน', 'Locked Users': 'ผู้ใช้งานที่ถูกล็อก',
  'All user accounts': 'บัญชีผู้ใช้งานทั้งหมด', 'Accounts ready to use': 'บัญชีที่พร้อมใช้งาน', 'Temporarily disabled': 'ปิดใช้งานชั่วคราว', 'Accounts requiring review': 'บัญชีที่ต้องตรวจสอบ',
  'Departments currently in use': 'แผนกที่ใช้งานอยู่ในปัจจุบัน', 'Positions currently in use': 'ตำแหน่งที่ใช้งานอยู่ในปัจจุบัน', 'Recorded system activities': 'กิจกรรมของระบบที่บันทึกไว้',
  'Manage Departments': 'จัดการแผนก', 'Manage Positions': 'จัดการตำแหน่ง', 'View Audit Log': 'ดูบันทึกการตรวจสอบ', 'Audit Log Records': 'รายการบันทึกการตรวจสอบ',
  'Active employees': 'พนักงานที่เปิดใช้งาน', 'Employees found in leave records': 'พนักงานที่พบในรายการลา', 'Pending Requests': 'คำขอที่รออนุมัติ',
  'Approved This Month': 'อนุมัติในเดือนนี้', 'Approved leave requests': 'คำขอลาที่อนุมัติแล้ว', 'Employees on Leave': 'พนักงานที่กำลังลา', 'Currently on leave': 'กำลังลาในขณะนี้',
  'Approved Requests': 'คำขอที่อนุมัติแล้ว', 'Available balance': 'สิทธิ์คงเหลือที่ใช้ได้',
  'Save Changes': 'บันทึกการเปลี่ยนแปลง', Deactivate: 'ปิดใช้งาน', Activate: 'เปิดใช้งาน', 'Create Position': 'สร้างตำแหน่ง', 'Create Department': 'สร้างแผนก',
  'Export CSV': 'ส่งออก CSV', 'Export PDF': 'ส่งออก PDF', 'Import Employee': 'นำเข้าข้อมูลพนักงาน',
  'Review notifications and important updates.': 'ตรวจสอบการแจ้งเตือนและข้อมูลสำคัญ',
  'Account security notice': 'แจ้งเตือนความปลอดภัยของบัญชี', Account: 'บัญชี', System: 'ระบบ', Entitlement: 'สิทธิ์วันลา',
  'Leave request approved': 'คำขอลาได้รับการอนุมัติ', 'Leave request rejected': 'คำขอลาถูกปฏิเสธ', 'Leave request cancelled': 'คำขอลาถูกยกเลิก', 'Leave request submitted': 'ส่งคำขอลาแล้ว',
  'New leave request awaiting approval': 'มีคำขอลาใหม่รออนุมัติ', 'New sick leave request': 'มีคำขอลาป่วยใหม่',
  'Email Address': 'Email', 'Rejected Date': 'วันที่ปฏิเสธ', 'Previously Used': 'ใช้ไปก่อนหน้า', 'Rejected Request': 'คำขอที่ปฏิเสธ', 'Remaining Balance': 'สิทธิ์คงเหลือ',
  Previous: 'ก่อนหน้า', Next: 'ถัดไป', 'Rows per page:': 'จำนวนแถวต่อหน้า:',
  'Online Leave Approval System': 'Online Leave Approval System',
}))

const phrases = [
  [/^Welcome back,?\s*/i, 'ยินดีต้อนรับกลับ '], [/^Welcome,?\s*/i, 'ยินดีต้อนรับ '],
  [/Please sign in to continue\.?/gi, 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ'],
  [/Enter your username and password to access the system\.?/gi, 'กรอก Username และ Password เพื่อเข้าใช้งานระบบ'],
  [/The system identifies your Role from the user account\. You do not need to select a Role manually\.?/gi, 'ระบบจะตรวจสอบ Role จากบัญชีผู้ใช้งานโดยอัตโนมัติ'],
  [/Manage leave requests in one place\.?/gi, 'จัดการคำขอลาได้ในที่เดียว'], [/Secure role-based access/gi, 'เข้าใช้งานอย่างปลอดภัยตาม Role'],
  [/Verifying your session\.\.\./gi, 'กำลังตรวจสอบการเข้าสู่ระบบ...'],
  [/Loading team report\.\.\./gi, 'กำลังโหลดรายงานทีม...'], [/Loading leave balance\.\.\./gi, 'กำลังโหลดสิทธิ์วันลา...'],
  [/Loading notifications\.\.\./gi, 'กำลังโหลดการแจ้งเตือน...'], [/Loading requests\.\.\./gi, 'กำลังโหลดคำขอลา...'],
  [/Loading ([^.]+)\.\.\./gi, 'กำลังโหลด$1...'],
  [/Unable to load ([^.]+)\.?/gi, 'ไม่สามารถโหลด$1ได้'], [/Unable to save ([^.]+)\.?/gi, 'ไม่สามารถบันทึก$1ได้'],
  [/Unable to update ([^.]+)\.?/gi, 'ไม่สามารถอัปเดต$1ได้'], [/Unable to delete ([^.]+)\.?/gi, 'ไม่สามารถลบ$1ได้'],
  [/was not found/gi, 'ไม่พบข้อมูล'], [/No ([^.]+) found/gi, 'ไม่พบ$1'], [/retrieved successfully/gi, 'เรียกดูข้อมูลสำเร็จ'],
  [/created successfully/gi, 'สร้างข้อมูลสำเร็จ'], [/updated successfully/gi, 'อัปเดตข้อมูลสำเร็จ'], [/deleted successfully/gi, 'ลบข้อมูลสำเร็จ'],
  [/saved successfully/gi, 'บันทึกข้อมูลสำเร็จ'], [/submitted successfully/gi, 'ส่งคำขอสำเร็จ'], [/marked as read/gi, 'ทำเครื่องหมายว่าอ่านแล้ว'],
  [/All notifications are already marked as read\.?/gi, 'การแจ้งเตือนทั้งหมดถูกอ่านแล้ว'],
  [/All notifications marked as read\.?/gi, 'ทำเครื่องหมายว่าอ่านการแจ้งเตือนทั้งหมดแล้ว'],
  [/Are you sure you want to ([^?]+)\?/gi, 'ยืนยันว่าต้องการ$1หรือไม่'], [/Confirm that you want to ([^.]+)\.?/gi, 'ยืนยันว่าต้องการ$1'],
  [/Please select ([^.]+)\.?/gi, 'กรุณาเลือก$1'], [/Please enter ([^.]+)\.?/gi, 'กรุณากรอก$1'], [/is required/gi, 'จำเป็นต้องระบุ'],
  [/Invalid or expired session/gi, 'การเข้าสู่ระบบไม่ถูกต้องหรือหมดอายุ'], [/Unauthorized/gi, 'กรุณาเข้าสู่ระบบ'],
  [/Forbidden/gi, 'คุณไม่มีสิทธิ์ใช้งานส่วนนี้'], [/Internal server error/gi, 'ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง'],
  [/Different from the username/gi, 'ต้องไม่เหมือน Username'], [/Different from the email address/gi, 'ต้องไม่เหมือน Email'],
  [/(\d+(?:\.\d+)?) Days\b/gi, '$1 วัน'], [/(\d+(?:\.\d+)?) day\(s\) pending/gi, 'รออนุมัติ $1 วัน'], [/^In (\d{4})$/gi, 'ในปี $1'],
]

export function translateThai(value) {
  if (typeof value !== 'string' || !/[A-Za-z]/.test(value)) return value
  const leading = value.match(/^\s*/)?.[0] || ''; const trailing = value.match(/\s*$/)?.[0] || ''; const text = value.trim()
  if (!text) return value
  if (exact.has(text)) return `${leading}${exact.get(text)}${trailing}`
  let translated = text
  for (const [pattern, replacement] of phrases) translated = translated.replace(pattern, replacement)
  return `${leading}${translated}${trailing}`
}

function translateElement(element) {
  for (const attribute of ['placeholder', 'title', 'aria-label']) {
    const value = element.getAttribute?.(attribute)
    const translated = value ? translateThai(value) : value
    if (value && translated !== value) element.setAttribute(attribute, translated)
  }
  for (const node of element.childNodes || []) {
    if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue?.trim()) continue
    const translated = translateThai(node.nodeValue)
    if (translated !== node.nodeValue) node.nodeValue = translated
  }
}

export function installThaiUi() {
  const translateTree = (root) => {
    if (root.nodeType === Node.TEXT_NODE) {
      if (root.nodeValue?.trim()) {
        const translated = translateThai(root.nodeValue)
        if (translated !== root.nodeValue) root.nodeValue = translated
      }
      return
    }
    if (!(root instanceof Element)) return
    translateElement(root); for (const element of root.querySelectorAll('*')) translateElement(element)
  }
  const start = () => {
    translateTree(document.body)
    new MutationObserver((mutations) => { for (const mutation of mutations) { if (mutation.type === 'characterData') translateTree(mutation.target); for (const node of mutation.addedNodes) translateTree(node) } })
      .observe(document.body, { childList: true, subtree: true, characterData: true })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start()
}
