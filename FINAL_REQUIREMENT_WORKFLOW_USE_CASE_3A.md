# Online Leave Approval System

## Final Requirement, Workflow และ Use Case Alignment — ก้อน 3A

สถานะเอกสาร: Final Candidate สำหรับ Review และ Freeze  
วันที่จัดทำ: 13 สิงหาคม 2026  
ฐานอ้างอิง: Current Repository และ Runtime Baseline ที่ผ่าน Integration/Final Testing  
ขอบเขต: Documentation / System Alignment เท่านั้น

> เอกสารนี้อธิบายระบบที่มีอยู่จริง ณ Baseline ปัจจุบัน ไม่ใช่ข้อเสนอให้เปลี่ยน Implementation และไม่รวม DFD, ER Diagram, Data Dictionary หรือการ Trace ถึงระดับ Database/Test Case ซึ่งต้องรอ Review ก้อน 3A ก่อน

---

## 1. Final System Scope

Online Leave Approval System เป็น Web Application สำหรับจัดการคำขอลา สิทธิ์การลา การอนุมัติโดย Supervisor การจัดการข้อมูลบุคลากรและนโยบายการลา การจัดการบัญชีผู้ใช้ รายงาน การแจ้งเตือนภายในระบบ และ Audit Log โดยใช้ Backend API และ MariaDB เป็น Source of Truth ของข้อมูลธุรกิจหลัก

ขอบเขตปัจจุบันประกอบด้วย:

- Authentication: Login ด้วย Username หรือ Email, Logout, Session, Change Password, Temporary Password และ Forgot Password ผ่าน OTP ทาง Email
- Profile: ดูและแก้ไขข้อมูล Profile ของตนเอง รวมถึง Profile Image
- Own Leave Function: ผู้ใช้ทั้ง 4 Role สามารถใช้ Function การลาของตนเองตามสิทธิ์ข้อมูล โดยการ Submit ต้องมี Supervisor ที่ผูกกับ Employee และมีบัญชีผู้ใช้ที่ถูกต้อง
- Leave Request: Draft, Submit, ดูรายการ/รายละเอียดของตนเอง, Cancel คำขอ Pending, Attachment ตามนโยบาย, Leave Balance และ Working Day Calculation
- Supervisor: ดูและพิจารณาคำขอ Pending ของผู้ใต้บังคับบัญชาโดยตรง และดู Team Report
- HR: จัดการ Employee, Leave Type, Leave Entitlement, Holiday และดู HR Report
- Admin: จัดการ User, Department, Position และดู Audit Log
- Notification: แสดงรายการของเจ้าของบัญชี, Unread, Mark Read, Mark All Read, Delete และ Deep Link ตาม Event ที่ระบบสร้างจริง
- Dashboard: แสดงข้อมูลตาม Role จาก API ปัจจุบัน

Workflow อนุมัติปัจจุบัน:

`Leave Request → Supervisor โดยตรง → Approved หรือ Rejected`

ระบบปัจจุบันไม่มี Department Manager Approval, HR Approval, Final Approver, Backup Approver หรือ Multi-step Approval

---

## 2. Actor / Role Final

### 2.1 Primary Actors

| Actor / Role | หน้าที่ในระบบปัจจุบัน | Data Scope หลัก |
| --- | --- | --- |
| Employee | จัดการคำขอลาและข้อมูลส่วนตัวของตนเอง | ข้อมูลของ Employee ที่ผูกกับบัญชีตนเอง |
| Supervisor | ใช้ Own Leave Function และพิจารณาคำขอของทีม | ข้อมูลตนเอง และคำขอของผู้ใต้บังคับบัญชาโดยตรงเท่านั้น |
| HR | ใช้ Own Leave Function และจัดการข้อมูล HR | ข้อมูลตนเอง และข้อมูล Employee/นโยบายลา/รายงานตาม HR API |
| Admin | ใช้ Own Leave Function และจัดการโครงสร้าง/บัญชีระบบ | ข้อมูลตนเอง, User/Department/Position, Audit Log และ HR Report ตาม API |

### 2.2 Supporting Actor

| Actor | หน้าที่ |
| --- | --- |
| Email Service | ส่ง OTP สำหรับ Forgot Password; ไม่ใช่ผู้อนุมัติและไม่อยู่ใน Leave Approval Workflow |

คำว่า “ผู้ใช้งาน” ในเอกสารนี้หมายถึง Employee, Supervisor, HR หรือ Admin ที่ผ่าน Authentication แล้ว ส่วนความสามารถเฉพาะ Role ให้ยึด Permission Matrix และ Backend Authorization

---

## 3. Functional Requirement Final

### FR-01

**ชื่อ Requirement:** Authentication และ Session  
**รายละเอียด:** ระบบต้องให้ผู้ใช้ Login ด้วย Username หรือ Email และ Password, สร้าง Session ที่ตรวจสอบได้, คืนข้อมูล Role ของผู้ใช้, รองรับ Logout และปฏิเสธ Session ที่ไม่ถูกต้อง หมดอายุ บัญชีไม่ Active หรือ Token Version ไม่ตรง  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** บัญชีและ Employee ต้องอยู่ในสถานะที่ Login ได้; Function หลัง Login ส่วนใหญ่ต้องผ่านการเปลี่ยน Temporary Password แล้ว  
**หลักฐาน Implementation:** `backend/src/controllers/auth-controller.js`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`

### FR-02

**ชื่อ Requirement:** Role-based Access  
**รายละเอียด:** ระบบต้องควบคุมการเข้าถึงทั้ง Frontend Route และ Backend API ตาม Role และ Data Scope โดย Backend เป็นจุดบังคับสิทธิ์สุดท้าย  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** การไม่เห็น Menu ไม่ถือเป็น Permission เพียงอย่างเดียว; Direct API ที่ไม่มีสิทธิ์ต้องถูกปฏิเสธ  
**หลักฐาน Implementation:** `frontend/src/App.jsx`, `backend/src/middleware/authorization.js`, `backend/src/server.js`

### FR-03

**ชื่อ Requirement:** Temporary Password และ Change Password  
**รายละเอียด:** ระบบต้องบังคับผู้ใช้ที่มี Temporary Password ให้เปลี่ยน Password ก่อนใช้ Function ธุรกิจ และให้ผู้ใช้ทุก Role เปลี่ยน Password ของตนเองโดยตรวจ Current Password และ Password Policy  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** Password ใหม่ต้องผ่าน Policy, ต่างจาก Password เดิม และเมื่อเปลี่ยนสำเร็จ Session เดิมถูกยกเลิก  
**หลักฐาน Implementation:** `requirePasswordChangeCompleted`, `changePassword`, `users.must_change_password`, `users.token_version`

### FR-04

**ชื่อ Requirement:** Forgot Password ผ่าน OTP  
**รายละเอียด:** ระบบต้องให้ผู้ใช้ขอ OTP ทาง Email, ตรวจ OTP และใช้ Reset Token แบบครั้งเดียวเพื่อกำหนด Password ใหม่  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin; Supporting Actor: Email Service  
**เงื่อนไขสำคัญ:** ใช้ข้อความตอบกลับแบบไม่เปิดเผยว่าบัญชีมีอยู่หรือไม่, มีอายุ OTP/Token, จำกัดการขอซ้ำและจำนวนครั้งที่ตรวจผิด  
**หลักฐาน Implementation:** `backend/src/controllers/password-reset-controller.js`, `backend/src/services/email-service.js`

### FR-05

**ชื่อ Requirement:** จัดการ Profile ของตนเอง  
**รายละเอียด:** ระบบต้องให้ผู้ใช้ดูและแก้ไขข้อมูล Profile ที่อนุญาตของตนเอง รวมถึงอัปโหลด Profile Image  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** เข้าถึงได้เฉพาะ Profile ของบัญชีตนเอง; รูปภาพต้องผ่านชนิดและขนาดที่ Backend กำหนด  
**หลักฐาน Implementation:** `/api/profile`, `backend/src/middleware/profile-upload.js`, Role Profile Routes ใน `frontend/src/App.jsx`

### FR-06

**ชื่อ Requirement:** สร้างและบันทึก Draft Leave Request  
**รายละเอียด:** ระบบต้องให้ผู้ใช้สร้าง Leave Request เป็น Draft และบันทึกข้อมูลที่กรอกเพื่อแก้ไขภายหลัง  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** Draft ว่างสามารถบันทึกได้; เมื่อมีข้อมูลบางส่วน ต้องผ่าน Validation ชุดเดียวกับข้อมูลคำขอที่เกี่ยวข้อง  
**หลักฐาน Implementation:** `POST /api/leave/requests/drafts`, `saveDraft()`

### FR-07

**ชื่อ Requirement:** แก้ไข ลบ Draft และจัดการ Attachment ของ Draft  
**รายละเอียด:** ระบบต้องให้เจ้าของแก้ไขหรือลบ Draft ของตนเอง และลบ Attachment ได้เฉพาะเมื่อคำขอยังเป็น Draft  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** ห้ามแก้ไขหรือลบคำขอที่พ้นสถานะ Draft; ห้ามจัดการ Draft ของผู้อื่น  
**หลักฐาน Implementation:** `PUT/DELETE /api/leave/requests/:requestId/draft`, `DELETE /api/leave-attachments/:attachmentId`

### FR-08

**ชื่อ Requirement:** Submit Leave Request  
**รายละเอียด:** ระบบต้องตรวจข้อมูลและส่ง Leave Request ที่สร้างใหม่หรือ Draft ไปยัง Supervisor โดยเปลี่ยนสถานะเป็น Pending และสร้าง Request Number  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** ผู้ยื่นต้องมี Leave Entitlement และ Balance ที่เพียงพอ, ผ่าน Business Rule ทั้งหมด, มี Supervisor ที่ผูกกับ Employee และ Supervisor นั้นต้องมีบัญชีผู้ใช้  
**หลักฐาน Implementation:** `POST /api/leave/requests/submit`, `POST /api/leave/requests/:requestId/submit`, `save(..., submitting=true)`

### FR-09

**ชื่อ Requirement:** ดู My Requests และรายละเอียด  
**รายละเอียด:** ระบบต้องให้ผู้ใช้ดูรายการและรายละเอียด Leave Request ของตนเองทุกสถานะ พร้อมข้อมูลประเภทลา วันที่ จำนวนวัน เหตุผล สถานะ และ Attachment  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** API ต้องคืนเฉพาะคำขอที่ `employee_id` ตรงกับ Employee ของ Session  
**หลักฐาน Implementation:** `GET /api/leave/requests`, `GET /api/leave/requests/:requestId`

### FR-10

**ชื่อ Requirement:** Cancel Pending Leave Request  
**รายละเอียด:** ระบบต้องให้เจ้าของยกเลิกคำขอของตนเองที่ยัง Pending โดยเปลี่ยนสถานะเป็น Cancelled  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** ยกเลิกได้เฉพาะ Owned Pending Request; ไม่สามารถยกเลิก Approved, Rejected, Cancelled หรือคำขอของผู้อื่น  
**หลักฐาน Implementation:** `PATCH /api/leave/requests/:requestId/cancel`, `cancelOwn()`

### FR-11

**ชื่อ Requirement:** Leave Balance  
**รายละเอียด:** ระบบต้องแสดงสิทธิ์ลา Total, Used, Pending และ Remaining แยกตาม Leave Type และปีของผู้ใช้  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** `Remaining = Total - Used - Pending`; Pending ต้องนับจากคำขอ Pending ในปีและประเภทลาเดียวกัน  
**หลักฐาน Implementation:** `GET /api/leave/balance`, `balance()`

### FR-12

**ชื่อ Requirement:** Working Day Calculation และ Attachment Policy  
**รายละเอียด:** ระบบต้องคำนวณจำนวนวันลาจากวันทำงานจริง โดยไม่นับเสาร์ อาทิตย์ และวันหยุด Active และต้องบังคับ Attachment ตาม Policy ของ Leave Type  
**Role ที่เกี่ยวข้อง:** ผู้ยื่น Leave Request ทุก Role  
**เงื่อนไขสำคัญ:** รองรับ PDF/JPEG/PNG สูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 10 MB; เงื่อนไขบังคับแนบขึ้นกับ `requires_attachment` และ Threshold ของ Leave Type  
**หลักฐาน Implementation:** `workingDays()`, `validate()`, `backend/src/middleware/leave-upload.js`

### FR-13

**ชื่อ Requirement:** Supervisor Pending Approval และ Request Detail  
**รายละเอียด:** ระบบต้องให้ Supervisor ดูรายการ Pending และรายละเอียดคำขอของผู้ใต้บังคับบัญชาโดยตรง  
**Role ที่เกี่ยวข้อง:** Supervisor  
**เงื่อนไขสำคัญ:** ไม่รวมคำขอของ Supervisor เองและไม่รวม Employee นอก Direct Team  
**หลักฐาน Implementation:** `GET /api/supervisor/approvals`, `GET /api/supervisor/approvals/:requestId`

### FR-14

**ชื่อ Requirement:** Approve หรือ Reject Leave Request  
**รายละเอียด:** ระบบต้องให้ Supervisor ของ Employee ตัดสินคำขอ Pending ได้ครั้งเดียว โดย Approve หรือ Reject; กรณี Reject ต้องเก็บเหตุผล  
**Role ที่เกี่ยวข้อง:** Supervisor  
**เงื่อนไขสำคัญ:** Approve ต้องตรวจ Balance ซ้ำภายใน Transaction และเพิ่ม Used Days; Reject ไม่เพิ่ม Used Days; ทั้งสองกรณีสร้าง Notification ให้เจ้าของและ Audit Log  
**หลักฐาน Implementation:** `POST /api/supervisor/approvals/:requestId/decision`, `decide()`

### FR-15

**ชื่อ Requirement:** Supervisor Team Report  
**รายละเอียด:** ระบบต้องให้ Supervisor ดูรายงานคำขอลาของผู้ใต้บังคับบัญชาโดยตรง พร้อม Filter และ Summary ตามข้อมูลที่ API รองรับ  
**Role ที่เกี่ยวข้อง:** Supervisor  
**เงื่อนไขสำคัญ:** Data Scope จำกัด Direct Team และไม่รวมตนเอง  
**หลักฐาน Implementation:** `GET /api/supervisor/team-report`, `teamReport()`

### FR-16

**ชื่อ Requirement:** HR Employee Management  
**รายละเอียด:** ระบบต้องให้ HR และ Admin ดู เพิ่ม แก้ไข และเปลี่ยนสถานะ Employee รวมถึง Department, Position และ Supervisor ที่อ้างอิง  
**Role ที่เกี่ยวข้อง:** HR, Admin  
**เงื่อนไขสำคัญ:** Employee Code และ Email ต้องไม่ซ้ำ; Reference ที่ใช้ต้องถูกต้องตามกฎ Active; สถานะ Employee คือ Active, Inactive หรือ Resigned  
**หลักฐาน Implementation:** `/api/hr/employees*`, `backend/src/controllers/hr-management-controller.js`

### FR-17

**ชื่อ Requirement:** Leave Type Management  
**รายละเอียด:** ระบบต้องให้ HR และ Admin ดู เพิ่ม แก้ไข และเปลี่ยนสถานะ Leave Type รวมถึง Quota, Minimum/Maximum Days และ Attachment Policy  
**Role ที่เกี่ยวข้อง:** HR, Admin  
**เงื่อนไขสำคัญ:** Code และ Name ต้องไม่ซ้ำ; ค่า Policy ต้องอยู่ในช่วงที่ Backend ยอมรับ  
**หลักฐาน Implementation:** `/api/hr/leave-types*`, Leave Type handlers ใน `hr-management-controller.js`

### FR-18

**ชื่อ Requirement:** Leave Entitlement Management  
**รายละเอียด:** ระบบต้องให้ HR และ Admin ดู เพิ่ม และแก้ไขสิทธิ์ลาของ Employee แยกตาม Leave Type และปี  
**Role ที่เกี่ยวข้อง:** HR, Admin  
**เงื่อนไขสำคัญ:** ห้ามมี Entitlement ซ้ำสำหรับ Employee + Leave Type + Year; Total/Used Days และ Year ต้องอยู่ในช่วงที่กำหนด  
**หลักฐาน Implementation:** `/api/hr/leave-entitlements*`

### FR-19

**ชื่อ Requirement:** Holiday Management  
**รายละเอียด:** ระบบต้องให้ HR และ Admin ดู เพิ่ม แก้ไข และลบ Holiday ที่ใช้ในการคำนวณวันทำงาน  
**Role ที่เกี่ยวข้อง:** HR, Admin  
**เงื่อนไขสำคัญ:** Holiday Date ต้องไม่ซ้ำ; เฉพาะ Holiday ที่ Active ถูกหักออกจาก Working Days  
**หลักฐาน Implementation:** `/api/hr/holidays*`, `workingDays()`

### FR-20

**ชื่อ Requirement:** HR Leave Report  
**รายละเอียด:** ระบบต้องให้ HR และ Admin ดูรายงาน Leave Request พร้อม Filter, Summary และรายละเอียดตาม API ปัจจุบัน  
**Role ที่เกี่ยวข้อง:** HR, Admin  
**เงื่อนไขสำคัญ:** Employee และ Supervisor ไม่มีสิทธิ์เรียก HR Report API  
**หลักฐาน Implementation:** `GET /api/reports/leave-requests`, `requireHrOrAdmin`

### FR-21

**ชื่อ Requirement:** Admin User Management  
**รายละเอียด:** ระบบต้องให้ Admin ดู เพิ่ม แก้ไข Role/Username/Status ของบัญชี และ Reset Password เป็น Temporary Password  
**Role ที่เกี่ยวข้อง:** Admin  
**เงื่อนไขสำคัญ:** Username และ Employee Account ต้องไม่ซ้ำ; Role ต้อง Active; Status คือ Active, Inactive หรือ Locked; บัญชี Inactive ไม่สามารถ Reset Password  
**หลักฐาน Implementation:** `/api/admin/users*`, `backend/src/controllers/admin-users-controller.js`

### FR-22

**ชื่อ Requirement:** Department และ Position Management  
**รายละเอียด:** ระบบต้องให้ Admin ดู เพิ่ม แก้ไข และเปลี่ยนสถานะ Department และ Position  
**Role ที่เกี่ยวข้อง:** Admin  
**เงื่อนไขสำคัญ:** ชื่อ Department และ Position ต้องไม่ซ้ำแบบไม่สนตัวพิมพ์ และสถานะต้องเป็น Active หรือ Inactive  
**หลักฐาน Implementation:** Frontend Admin Routes และ `/api/hr/departments*`, `/api/hr/positions*` ที่อนุญาต HR/Admin ใน Backend; UI ปัจจุบันเปิด Management เหล่านี้ให้ Admin

### FR-23

**ชื่อ Requirement:** Audit Log  
**รายละเอียด:** ระบบต้องบันทึก Event ที่ Implementation กำหนดและให้ Admin ดู Audit Log พร้อมข้อมูลประกอบที่ API คืน  
**Role ที่เกี่ยวข้อง:** Admin; System เป็นผู้สร้าง Log  
**เงื่อนไขสำคัญ:** เฉพาะ Admin เรียก Audit Log API ได้; Event Coverage ให้ยึดเหตุการณ์ที่มี `writeAuditLog()` จริง ไม่อนุมานว่าทุก Action ถูกบันทึก  
**หลักฐาน Implementation:** `GET /api/admin/audit-logs`, `backend/src/services/audit-service.js`

### FR-24

**ชื่อ Requirement:** In-app Notification  
**รายละเอียด:** ระบบต้องให้ผู้ใช้ทุก Role ดู Notification ที่เป็นของตนเอง ดูจำนวน Unread, Mark Read, Mark All Read, Delete และเปิด Deep Link ของ Event ได้  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** Data Scope จำกัดด้วย `user_id`; Event ที่ยืนยันใน Workflow คือ Submit แจ้ง Supervisor และ Approve/Reject แจ้งเจ้าของคำขอเท่านั้น  
**หลักฐาน Implementation:** `/api/notifications*`, `notification-controller.js`, `notification-service.js`

### FR-25

**ชื่อ Requirement:** Role Dashboard  
**รายละเอียด:** ระบบต้องแสดง Dashboard ตาม Role ด้วยข้อมูลจาก API ปัจจุบัน และเชื่อมไปยัง Function หลักที่ Role นั้นเข้าถึงได้  
**Role ที่เกี่ยวข้อง:** Employee, Supervisor, HR, Admin  
**เงื่อนไขสำคัญ:** ข้อมูลธุรกิจหลักต้องมาจาก Backend/MariaDB ไม่ใช้ Mock หรือ Legacy Local Storage เป็น Source of Truth  
**หลักฐาน Implementation:** Role Dashboard Pages, API clients และ Runtime Integration Baseline

---

## 4. Role / Permission Requirement

### 4.1 Permission Requirements

- **RP-01 Authentication Boundary:** ทุก Business API ต้องผ่าน Authentication และ Function ส่วนใหญ่ต้องผ่าน Temporary Password Gate
- **RP-02 Own Data Scope:** Own Leave, Profile และ Notification ต้องอิง User/Employee ของ Session และห้ามอ่านหรือแก้ข้อมูลของผู้อื่น
- **RP-03 Supervisor Scope:** เฉพาะ Role Supervisor เท่านั้นที่ใช้ Approval/Team Report API และเห็นเฉพาะ Direct Team โดยห้าม Approve ตนเอง
- **RP-04 HR Scope:** HR และ Admin ใช้ HR Management API และ HR Leave Report ได้; Employee/Supervisor ถูกปฏิเสธ
- **RP-05 Admin Scope:** เฉพาะ Admin จัดการ User และดู Audit Log ได้
- **RP-06 Attachment Scope:** เจ้าของ, Direct Supervisor และ HR/Admin ดาวน์โหลด Attachment ได้; การลบจำกัดเจ้าของ Draft
- **RP-07 Notification Scope:** ผู้ใช้ทุก Role จัดการได้เฉพาะ Notification ที่มี `user_id` ของตนเอง
- **RP-08 Frontend Route Guard:** Direct Route ต้องตรวจ Role และ Redirect/ปฏิเสธผู้ไม่มีสิทธิ์ให้สอดคล้อง Backend

### 4.2 Permission Matrix

สัญลักษณ์: ✅ Allowed, ❌ Not Allowed, ⚠️ Conditional

| Function | Employee | Supervisor | HR | Admin |
| --- | :---: | :---: | :---: | :---: |
| Login/Logout/Session | ✅ | ✅ | ✅ | ✅ |
| Profile/Change Password | ✅ | ✅ | ✅ | ✅ |
| Own Leave Draft/Submit/List/Detail/Cancel | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Own Leave Balance | ✅ | ✅ | ✅ | ✅ |
| Own Notification | ✅ | ✅ | ✅ | ✅ |
| Supervisor Pending/Detail/Decision | ❌ | ⚠️ | ❌ | ❌ |
| Supervisor Team Report | ❌ | ⚠️ | ❌ | ❌ |
| Employee Management API | ❌ | ❌ | ✅ | ✅ |
| Leave Type/Entitlement/Holiday API | ❌ | ❌ | ✅ | ✅ |
| HR Leave Report | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Department/Position API | ❌ | ❌ | ✅ | ✅ |
| Department/Position Management UI | ❌ | ❌ | ❌ | ✅ |
| Audit Log | ❌ | ❌ | ❌ | ✅ |
| Download Own Attachment | ✅ | ✅ | ✅ | ✅ |
| Download Direct Team Attachment | ❌ | ⚠️ | ❌ | ❌ |
| Download Any Request Attachment ตาม Role | ❌ | ❌ | ✅ | ✅ |

เงื่อนไขของ ⚠️:

- Own Leave Submit: ผู้ใช้ต้องมี Employee Record, Entitlement ของปี/ประเภทลา, Balance เพียงพอ และ Supervisor ที่มีบัญชีผู้ใช้
- Supervisor Approval/Report: เฉพาะข้อมูลของ Direct Team, ไม่รวมตนเอง
- Attachment: ต้องมีความสัมพันธ์กับคำขอและผ่านกฎ Ownership/Role ของ API

---

## 5. Business Rule Final

| Rule | ข้อกำหนดที่ระบบบังคับใช้จริง |
| --- | --- |
| BR-01 | Submit ต้องมี Leave Type, Start Date, End Date และ Reason ครบ |
| BR-02 | Start/End ต้องเป็นวันที่รูปแบบถูกต้อง และ End Date ต้องไม่ก่อน Start Date |
| BR-03 | Leave Request เดียวต้องไม่ข้ามปี |
| BR-04 | Reason ต้องยาว 5–500 ตัวอักษร |
| BR-05 | Submit ได้เฉพาะ Leave Type ที่ Active |
| BR-06 | จำนวนวันลานับเฉพาะจันทร์–ศุกร์ และไม่นับ Holiday ที่ Active |
| BR-07 | ช่วงวันที่ที่ไม่มี Working Day เลยไม่สามารถ Submit ได้ |
| BR-08 | จำนวนวันต้องไม่ต่ำกว่า Minimum และไม่เกิน Maximum Days Per Request ของ Leave Type |
| BR-09 | ต้องมี Leave Entitlement ของ Employee + Leave Type + Year |
| BR-10 | Available Balance สำหรับการยื่น = Total - Used - Pending |
| BR-11 | Pending Requests ประเภทและปีเดียวกันต้องถูกกันออกจาก Available Balance |
| BR-12 | ห้ามช่วงวันที่ทับกับคำขอเดิมที่ Pending หรือ Approved ของ Employee เดียวกัน |
| BR-13 | ถ้า Leave Type กำหนด Attachment และถึง Threshold ต้องมี Attachment ก่อน Submit |
| BR-14 | Leave Attachment รองรับ PDF, JPEG, PNG สูงสุด 5 ไฟล์ ไฟล์ละไม่เกิน 10 MB |
| BR-15 | ดาวน์โหลด Attachment ได้เฉพาะเจ้าของ, Direct Supervisor, HR หรือ Admin |
| BR-16 | แก้ไข/ลบคำขอและลบ Attachment ได้เฉพาะ Owned Draft |
| BR-17 | Owner Cancel ได้เฉพาะคำขอสถานะ Pending |
| BR-18 | Submit ต้องพบ Supervisor ที่ผูกกับ Employee และ Supervisor ต้องมี User Account |
| BR-19 | เฉพาะ Role Supervisor พิจารณาคำขอได้ และคำขอต้องเป็นของ Direct Team |
| BR-20 | Supervisor ห้ามพิจารณาคำขอของตนเอง |
| BR-21 | Approve/Reject ทำได้เฉพาะ Pending และทำได้ครั้งเดียว; Approved/Rejected/Cancelled ไม่ย้อนกลับด้วย Decision Endpoint |
| BR-22 | Reject ต้องระบุ Rejection Reason ที่ไม่ว่าง |
| BR-23 | Approve ต้องตรวจ Entitlement/Balance ซ้ำภายใน Transaction ก่อนเพิ่ม Used Days |
| BR-24 | Employee Code และ Email ต้องไม่ซ้ำ; Department/Position/Supervisor ที่อ้างอิงต้องถูกต้องตามกฎของ Backend |
| BR-25 | Department Name และ Position Name ต้องยาว 2–100 ตัวอักษรและไม่ซ้ำแบบไม่สนตัวพิมพ์ |
| BR-26 | Leave Type Code ต้องเป็นตัวพิมพ์ใหญ่/ตัวเลข 2–10 ตัว, Code/Name ไม่ซ้ำ และ Policy Days ต้องถูกต้อง |
| BR-27 | Holiday Date ต้องไม่ซ้ำ; Name/Type/Description/Status ต้องผ่าน Validation |
| BR-28 | Entitlement ต้องไม่ซ้ำในชุด Employee + Leave Type + Year; Year อยู่ระหว่าง 2000–2100 และ Total/Used Days อยู่ระหว่าง 0–365 |
| BR-29 | Username ต้องไม่ซ้ำ, ยาว 4–50 และใช้ตัวพิมพ์เล็ก ตัวเลข จุด ขีดล่าง หรือขีดกลางตามรูปแบบที่กำหนด |
| BR-30 | User หนึ่งบัญชีผูกกับ Employee หนึ่งรายที่ยังไม่มีบัญชี; Role ต้อง Active; Status เป็น Active/Inactive/Locked |
| BR-31 | Admin Create/Reset Password ต้องสร้าง Temporary Password และตั้ง `must_change_password`; บัญชี Inactive Reset Password ไม่ได้ |
| BR-32 | Password ใหม่อย่างน้อย 10 ตัว มีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข อักขระพิเศษ ไม่มีช่องว่าง และไม่เท่ากับ Username/Email/Password เดิม |
| BR-33 | Profile Image รองรับ JPEG, PNG หรือ WebP เพียง 1 ไฟล์ ขนาดไม่เกิน 2 MB |
| BR-34 | Notification List/Read/Delete ต้องจำกัดด้วย `user_id` ของ Session |
| BR-35 | Login/Protected API ต้องปฏิเสธบัญชีไม่ Active และ Session ที่ Token Version ไม่ตรง |
| BR-36 | OTP เป็นตัวเลข 6 หลัก อายุเริ่มต้น 5 นาที, ตรวจผิดได้สูงสุด 5 ครั้ง, ขอซ้ำมี Cooldown 60 วินาที และจำกัดการขอในช่วงเวลา |
| BR-37 | Reset Token อายุเริ่มต้น 15 นาที ใช้ได้ครั้งเดียว และเมื่อ Reset สำเร็จต้องยกเลิก Token/OTP อื่นที่ยังใช้ได้ของผู้ใช้รายนั้น |

---

## 6. Non-Functional Requirement Final

| NFR | Requirement |
| --- | --- |
| NFR-01 Authentication Security | Session ต้องถูกลงนาม ตรวจอายุ ตรวจสถานะบัญชี และสามารถยกเลิกผ่าน Token Version ได้ |
| NFR-02 Cookie Security | Browser Session ใช้ HTTP-only Cookie, SameSite และ Secure ตาม Production Configuration เพื่อลดการเข้าถึง Token จาก Client Script |
| NFR-03 Password Security | Password และ Temporary Password ต้องเก็บเป็น Hash ที่เหมาะสม; OTP/Reset Token ไม่เก็บเป็น Plain Text |
| NFR-04 Authorization | Backend ต้องบังคับ Role และ Data Scope ทุก Endpoint สำคัญ แม้ผู้ใช้เรียก Direct API |
| NFR-05 Data Consistency | ข้อมูลธุรกิจหลักต้องใช้ Backend API และ MariaDB เป็น Source of Truth เดียวกันระหว่างหน้าและ Role |
| NFR-06 Transaction Integrity | การ Submit/Approve/Reject และ Password Reset ที่เปลี่ยนหลายข้อมูลต้องสำเร็จหรือ Rollback เป็นชุด |
| NFR-07 Input Validation | Backend ต้องตรวจ Required Field, รูปแบบ, ช่วงค่า, Duplicate และ Reference ก่อนบันทึก |
| NFR-08 File Upload Security | Backend ต้องจำกัดจำนวน ขนาด และ MIME Type ของ Attachment/Profile Image และตรวจสิทธิ์เข้าถึงไฟล์ |
| NFR-09 Error Handling | API ต้องคืน HTTP Status และ Error Message ที่สอดคล้อง โดยไม่เปิดเผยข้อมูลบัญชีหรือ Internal Detail ที่ไม่ควรเปิดเผยใน Production |
| NFR-10 Responsive Web | Function หลักต้องใช้งานได้บน Desktop และ Mobile viewport 390×844 ตาม Baseline ที่ผ่านการตรวจ |
| NFR-11 Accessibility | Interactive Control สำคัญ โดยเฉพาะ Icon-only Action ต้องมี Accessible Name และรองรับ Focus ตาม Baseline UI ที่ Freeze แล้ว |
| NFR-12 Auditability | เหตุการณ์ Security/Approval ที่ Implementation เลือกบันทึกต้องเก็บผู้กระทำ Action, Record, Result และ Metadata ที่มีอยู่เพื่อการตรวจสอบย้อนหลัง |

---

## 7. Future Scope Final

รายการต่อไปนี้ไม่ใช่ Current Requirement และห้ามนำไปอ้างว่าเป็น Function ปัจจุบัน:

- Push Notification เข้าโทรศัพท์
- Native Mobile Application
- Real-time Notification
- Multi-step Approval
- HR Approval / Final Approval
- Department Manager Approval
- Backup Approver
- Final Approver แยกต่างหาก

Technical Enhancement อื่น เช่น SLA/Monitoring ระดับ Production, Password History, การ Config Approval Chain หรือช่องทาง Notification เพิ่มเติม ต้องจัดทำเป็น Change Request แยกหลัง Requirement Freeze ไม่ใช่ส่วนหนึ่งของก้อน 3A

---

## 8. Final Leave Approval Workflow

1. ผู้ใช้ Login และผ่าน Temporary Password Gate
2. ผู้ใช้เปิด Own Leave Function และเลือก Leave Type/ปีจากข้อมูล API
3. ผู้ใช้สร้าง Draft หรือกรอกคำขอเพื่อ Submit โดยระบุ Leave Type, Start Date, End Date และ Reason; แนบไฟล์เมื่อ Policy กำหนด
4. Backend ตรวจ Required Field, Date Range, Same Year, Reason Length, Active Leave Type, Working Days, Minimum/Maximum Days, Entitlement, Available Balance, Overlap และ Attachment Policy
5. Backend ตรวจว่าผู้ยื่นมี Supervisor และ Supervisor มี User Account
6. เมื่อผ่านทุกเงื่อนไข Backend สร้าง/ปรับคำขอเป็น `pending`, สร้าง Request Number และ Notification ให้ Supervisor โดยตรง
7. เฉพาะ Supervisor ของ Direct Team เปิดรายการ Pending และรายละเอียดคำขอได้
8. Supervisor เลือก Approve หรือ Reject
9. กรณี Approve:
   - Backend Lock และตรวจคำขอว่ายัง Pending
   - ตรวจ Direct Team และห้าม Self-approval
   - Lock/ตรวจ Entitlement และ Balance ซ้ำ
   - เพิ่ม `used_days`
   - เปลี่ยนสถานะเป็น `approved`, เก็บ Approver และเวลาอนุมัติ
   - สร้าง Notification ให้เจ้าของคำขอ
   - เขียน Audit Log
   - Commit Transaction
10. กรณี Reject:
    - Backend ตรวจคำขอว่ายัง Pending, Direct Team และ Rejection Reason
    - เปลี่ยนสถานะเป็น `rejected`, เก็บ Approver, เวลา และเหตุผล
    - ไม่เพิ่ม `used_days`
    - สร้าง Notification ให้เจ้าของคำขอ
    - เขียน Audit Log
    - Commit Transaction
11. กรณี Owner Cancel ก่อนการตัดสินใจ:
    - Owner เรียก Cancel ได้เฉพาะคำขอ Pending ของตนเอง
    - สถานะเปลี่ยนเป็น `cancelled`
    - Current Implementation ไม่ได้สร้าง Approval Decision, Notification หรือ Audit Log จาก Cancel Endpoint

---

## 9. Status Transition Matrix

| Current Status | Action | Next Status | ผู้ดำเนินการ | เงื่อนไข |
| --- | --- | --- | --- | --- |
| ไม่มีรายการ | Save Draft | draft | เจ้าของ | อาจเป็น Draft ว่าง หรือข้อมูลที่ผ่าน Validation ตามกรณี |
| ไม่มีรายการ | Submit | pending | เจ้าของ | ผ่าน Business Rule และมี Supervisor Account |
| draft | Edit/Save Draft | draft | เจ้าของ | Owned Draft เท่านั้น |
| draft | Submit | pending | เจ้าของ | ผ่าน Business Rule และมี Supervisor Account |
| draft | Delete | ถูกลบ | เจ้าของ | Owned Draft เท่านั้น |
| pending | Approve | approved | Direct Supervisor | Pending, Direct Team, ไม่ใช่ตนเอง, Balance ยังพอ |
| pending | Reject | rejected | Direct Supervisor | Pending, Direct Team, ไม่ใช่ตนเอง, มีเหตุผล |
| pending | Cancel | cancelled | เจ้าของ | Owned Pending เท่านั้น |
| approved | Decision/Edit/Cancel | ไม่เปลี่ยน | — | Endpoint ปฏิเสธ |
| rejected | Decision/Edit/Cancel | ไม่เปลี่ยน | — | Endpoint ปฏิเสธ |
| cancelled | Decision/Edit/Cancel | ไม่เปลี่ยน | — | Endpoint ปฏิเสธ |

ไม่มี Transition จาก Rejected/Cancelled กลับ Draft และไม่มีขั้น HR/Final Approval ในระบบปัจจุบัน

---

## 10. Workflow แยกแต่ละ Role

### Employee

`Login → Dashboard → Create/Save Draft/Submit Leave Request → My Requests/Detail → Cancel Pending ตามเงื่อนไข → Leave Balance → Notification → Profile/Change Password → Logout`

### Supervisor

`Login → Dashboard → Own Leave Function ตามเงื่อนไข → Pending Approval ของ Direct Team → View Detail → Approve/Reject → Team Report → Notification → Profile/Change Password → Logout`

Supervisor ไม่มีสิทธิ์พิจารณาคำขอของตนเองหรือ Employee นอก Direct Team

### HR

`Login → Dashboard → Own Leave Function ตามเงื่อนไข → Employee Management → Leave Entitlement → Leave Type → Holiday → HR Report → Notification ของตนเอง → Profile/Change Password → Logout`

HR ไม่อยู่ใน Approval Chain ปัจจุบัน

### Admin

`Login → Dashboard → Own Leave Function ตามเงื่อนไข → User Management → Department → Position → Audit Log → Notification ของตนเอง → Profile/Change Password → Logout`

Admin เข้าถึง HR Report/HR Management API ตาม Backend Permission แต่ไม่ใช่ผู้อนุมัติ Leave Request

---

## 11. Use Case Inventory

| UC-ID | Use Case Name | Primary Actor |
| --- | --- | --- |
| UC-01 | Login, Session และ Logout | ผู้ใช้ทุก Role |
| UC-02 | Change Temporary/Current Password | ผู้ใช้ทุก Role |
| UC-03 | Forgot and Reset Password | ผู้ใช้ทุก Role |
| UC-04 | Manage Own Profile | ผู้ใช้ทุก Role |
| UC-05 | Create/Submit Leave Request | ผู้ใช้ทุก Role |
| UC-06 | Manage Draft and Attachments | ผู้ใช้ทุก Role |
| UC-07 | View My Requests and Detail | ผู้ใช้ทุก Role |
| UC-08 | Cancel Pending Leave Request | ผู้ใช้ทุก Role |
| UC-09 | View Leave Balance | ผู้ใช้ทุก Role |
| UC-10 | Manage Notification | ผู้ใช้ทุก Role |
| UC-11 | Review Pending Request | Supervisor |
| UC-12 | Approve Leave Request | Supervisor |
| UC-13 | Reject Leave Request | Supervisor |
| UC-14 | View Team Report | Supervisor |
| UC-15 | Manage Employee | HR, Admin |
| UC-16 | Manage Leave Type | HR, Admin |
| UC-17 | Manage Leave Entitlement | HR, Admin |
| UC-18 | Manage Holiday | HR, Admin |
| UC-19 | View HR Leave Report | HR, Admin |
| UC-20 | Manage User Account | Admin |
| UC-21 | Manage Department and Position | Admin |
| UC-22 | View Audit Log | Admin |
| UC-23 | View Role Dashboard | ผู้ใช้ทุก Role |

---

## 12. Use Case Specification

### UC-01 — Login, Session และ Logout

**Actor:** Employee, Supervisor, HR, Admin  
**Description:** ยืนยันตัวตน เรียกข้อมูล Session และออกจากระบบ  
**Preconditions:** มีบัญชีและ Employee ที่ระบบยอมรับ  
**Main Flow:** 1) กรอก Username/Email และ Password 2) Backend ตรวจ Hash/Status 3) สร้าง Session พร้อม Role 4) Frontend นำไป Dashboard ของ Role 5) ผู้ใช้ Logout เมื่อเสร็จงาน  
**Alternative Flow:** ข้อมูลไม่ครบ/ผิด, บัญชีไม่ Active, Session หมดอายุหรือ Token Version เปลี่ยน → ปฏิเสธการเข้าถึง  
**Postconditions:** Login สำเร็จมี Session; Logout สำเร็จ Cookie ถูกล้าง  
**Related Requirement:** FR-01, FR-02; BR-35; NFR-01–04

### UC-02 — Change Temporary/Current Password

**Actor:** ผู้ใช้ทุก Role  
**Description:** เปลี่ยน Temporary Password หรือ Password ปัจจุบัน  
**Preconditions:** Login แล้ว และทราบ Current Password  
**Main Flow:** 1) กรอก Current/New Password 2) Backend ตรวจ Current Password และ Policy 3) Hash Password ใหม่ 4) ยกเลิก `must_change_password` และเพิ่ม Token Version 5) ล้าง Session  
**Alternative Flow:** Current Password ผิด, Policy ไม่ผ่าน หรือซ้ำ Password เดิม → ไม่เปลี่ยนข้อมูล  
**Postconditions:** Password ใหม่ถูกบันทึกและต้อง Login ใหม่  
**Related Requirement:** FR-03; BR-31, BR-32; NFR-03

### UC-03 — Forgot and Reset Password

**Actor:** ผู้ใช้ทุก Role; Supporting Actor: Email Service  
**Description:** ขอ OTP, ยืนยัน OTP และ Reset Password  
**Preconditions:** มี Username/Email และ Email Service พร้อมใช้งานสำหรับบัญชีที่ Reset ได้  
**Main Flow:** 1) ขอ OTP 2) ระบบส่งคำตอบแบบไม่เปิดเผยบัญชี 3) Email Service ส่ง OTP 4) ผู้ใช้ยืนยัน OTP 5) ระบบออก Reset Token 6) ผู้ใช้ตั้ง Password ใหม่ 7) ระบบใช้ Token/OTP แล้วและยกเลิก Session เก่า  
**Alternative Flow:** OTP ผิด/หมดอายุ/เกินจำนวนครั้ง, Cooldown/Rate Limit, Email ส่งไม่ได้, Token ใช้แล้วหรือหมดอายุ, Password ไม่ผ่าน Policy  
**Postconditions:** Password ถูก Reset หรือข้อมูลเดิมคงอยู่หาก Flow ไม่สำเร็จ  
**Related Requirement:** FR-04; BR-32, BR-36, BR-37; NFR-03, NFR-09

### UC-04 — Manage Own Profile

**Actor:** ผู้ใช้ทุก Role  
**Description:** ดูและแก้ไข Profile ของตนเอง รวม Profile Image  
**Preconditions:** Login และเปลี่ยน Temporary Password แล้ว  
**Main Flow:** 1) เรียก Profile 2) แก้ Field ที่อนุญาต 3) เลือกรูปถ้าต้องการ 4) Backend Validate และบันทึก  
**Alternative Flow:** รูปชนิดไม่รองรับ/เกิน 2 MB หรือข้อมูลไม่ผ่าน Validation → ไม่บันทึก  
**Postconditions:** Profile ของผู้ใช้ปัจจุบันถูกอัปเดต  
**Related Requirement:** FR-05; BR-33; RP-02

### UC-05 — Create/Submit Leave Request

**Actor:** ผู้ใช้ทุก Role  
**Description:** สร้างและส่งคำขอลาไปยัง Supervisor โดยตรง  
**Preconditions:** Login แล้ว, มี Entitlement/Active Leave Type และ Supervisor Account  
**Main Flow:** 1) เลือกประเภทและวันที่ 2) กรอกเหตุผล/แนบไฟล์ตาม Policy 3) Submit 4) Backend คำนวณ Working Days และ Validate 5) สร้าง Request Number/สถานะ Pending 6) แจ้ง Supervisor  
**Alternative Flow:** ข้อมูลไม่ครบ, วันที่ผิด/ข้ามปี, ไม่มี Working Day, Type Inactive, Days ผิด Policy, ไม่มี Entitlement/Balance, Overlap, ขาด Attachment หรือไม่มี Supervisor Account → Rollback และไม่ Submit  
**Postconditions:** คำขอเป็น Pending และ Direct Supervisor เห็นใน Approval List  
**Related Requirement:** FR-08, FR-12, FR-24; BR-01–14, BR-18

### UC-06 — Manage Draft and Attachments

**Actor:** ผู้ใช้ทุก Role  
**Description:** บันทึก แก้ไข ลบ Draft และจัดการ Attachment ก่อน Submit  
**Preconditions:** Login แล้ว; สำหรับ Edit/Delete ต้องเป็นเจ้าของ Draft  
**Main Flow:** 1) Save Draft 2) เปิด Draft 3) แก้ไข/เพิ่มหรือลบ Attachment 4) Save หรือ Delete  
**Alternative Flow:** ไม่ใช่เจ้าของหรือสถานะไม่ใช่ Draft → ปฏิเสธ; ไฟล์ผิดชนิด/ขนาด/จำนวน → ไม่รับไฟล์  
**Postconditions:** Draft ถูกอัปเดต/ลบ หรือข้อมูลเดิมคงอยู่เมื่อไม่ผ่านเงื่อนไข  
**Related Requirement:** FR-06, FR-07, FR-12; BR-14–16

### UC-07 — View My Requests and Detail

**Actor:** ผู้ใช้ทุก Role  
**Description:** ดูรายการและรายละเอียดคำขอลาของตนเอง  
**Preconditions:** Login แล้ว  
**Main Flow:** 1) เปิด My Requests 2) API กรองด้วย Employee ของ Session 3) เลือกรายการเพื่อดูรายละเอียด/Attachment  
**Alternative Flow:** ขอ ID ของผู้อื่นหรือไม่มีรายการ → ไม่คืนข้อมูลของผู้อื่น  
**Postconditions:** ไม่มีการเปลี่ยนข้อมูล  
**Related Requirement:** FR-09; RP-02

### UC-08 — Cancel Pending Leave Request

**Actor:** ผู้ใช้ทุก Role  
**Description:** เจ้าของยกเลิกคำขอ Pending  
**Preconditions:** เป็นเจ้าของและสถานะ Pending  
**Main Flow:** 1) เปิดรายละเอียด 2) ยืนยัน Cancel 3) Backend เปลี่ยนเป็น Cancelled  
**Alternative Flow:** ไม่ใช่เจ้าของหรือไม่ Pending → ปฏิเสธ  
**Postconditions:** สถานะเป็น Cancelled; ไม่มีการเพิ่ม Used Days  
**Related Requirement:** FR-10; BR-17, BR-21

### UC-09 — View Leave Balance

**Actor:** ผู้ใช้ทุก Role  
**Description:** ดู Total, Used, Pending และ Remaining ของตนเอง  
**Preconditions:** Login แล้ว  
**Main Flow:** 1) เลือก/ใช้ปีปัจจุบัน 2) API อ่าน Entitlement และ Pending 3) คำนวณ Remaining 4) แสดงผล  
**Alternative Flow:** ไม่มี Entitlement → ไม่มี Balance Record สำหรับประเภท/ปีนั้น  
**Postconditions:** ไม่มีการเปลี่ยนข้อมูล  
**Related Requirement:** FR-11; BR-09–11

### UC-10 — Manage Notification

**Actor:** ผู้ใช้ทุก Role  
**Description:** ดู Unread, Mark Read/All, Delete และเปิด Deep Link ของ Notification ตนเอง  
**Preconditions:** Login แล้ว  
**Main Flow:** 1) โหลดรายการของตนเอง 2) อ่านหรือ Mark All 3) เปิด Deep Link เมื่อมี 4) Delete รายการของตนเองเมื่อไม่ต้องการ  
**Alternative Flow:** ID ไม่ใช่ของผู้ใช้ → ไม่แก้/ไม่ลบ; Role ที่ยังไม่มี Event ก็เห็น Empty State ได้  
**Postconditions:** Read State หรือรายการของเจ้าของเปลี่ยนตาม Action  
**Related Requirement:** FR-24; BR-34; RP-07

### UC-11 — Review Pending Request

**Actor:** Supervisor  
**Description:** ดู Pending List และรายละเอียดของ Direct Team  
**Preconditions:** Login ด้วย Role Supervisor และมี Direct Report  
**Main Flow:** 1) เปิด Approval 2) API คืน Pending ของ Direct Team 3) เปิดรายละเอียดและ Attachment ที่มีสิทธิ์  
**Alternative Flow:** คำขอไม่อยู่ในทีม/เป็นของตนเอง/ไม่มีอยู่ → ปฏิเสธ  
**Postconditions:** ไม่มีการเปลี่ยนสถานะ  
**Related Requirement:** FR-13; BR-19, BR-20; RP-03, RP-06

### UC-12 — Approve Leave Request

**Actor:** Supervisor  
**Description:** อนุมัติ Pending Request ของ Direct Team  
**Preconditions:** คำขอยัง Pending, อยู่ใน Direct Team, ไม่ใช่คำขอตนเอง  
**Main Flow:** 1) เลือก Approve 2) Backend Lock Request/Entitlement 3) ตรวจ Scope/Balance 4) เพิ่ม Used Days 5) เปลี่ยน Approved 6) แจ้ง Owner 7) เขียน Audit Log  
**Alternative Flow:** ไม่ Pending, ถูกตัดสินแล้ว, นอกทีม, Self-approval หรือ Balance ไม่พอ → Rollback  
**Postconditions:** คำขอ Approved และ Balance/Audit/Notification สอดคล้องกัน  
**Related Requirement:** FR-14, FR-24; BR-19–23

### UC-13 — Reject Leave Request

**Actor:** Supervisor  
**Description:** ปฏิเสธ Pending Request ของ Direct Team พร้อมเหตุผล  
**Preconditions:** คำขอยัง Pending, อยู่ใน Direct Team, ไม่ใช่คำขอตนเอง  
**Main Flow:** 1) กรอกเหตุผล 2) เลือก Reject 3) Backend ตรวจเงื่อนไข 4) เปลี่ยน Rejected/เก็บเหตุผล 5) แจ้ง Owner 6) เขียน Audit Log  
**Alternative Flow:** เหตุผลว่าง, ไม่ Pending, นอกทีม หรือ Self-approval → ไม่เปลี่ยนสถานะ  
**Postconditions:** คำขอ Rejected, Used Days ไม่เพิ่ม  
**Related Requirement:** FR-14, FR-24; BR-19–22

### UC-14 — View Team Report

**Actor:** Supervisor  
**Description:** ดูรายงานคำขอของ Direct Team ตาม Filter  
**Preconditions:** Login ด้วย Role Supervisor  
**Main Flow:** 1) เปิด Team Report 2) ระบุ Filter 3) API กรอง Direct Team 4) แสดงรายการและ Summary  
**Alternative Flow:** ไม่มีข้อมูลตรง Filter → แสดงผลว่าง  
**Postconditions:** ไม่มีการเปลี่ยนข้อมูล  
**Related Requirement:** FR-15; RP-03

### UC-15 — Manage Employee

**Actor:** HR, Admin  
**Description:** ดู เพิ่ม แก้ไข และเปลี่ยนสถานะ Employee  
**Preconditions:** Login ด้วย HR/Admin  
**Main Flow:** 1) เปิดรายการ 2) เพิ่ม/แก้ข้อมูล 3) เลือก Department/Position/Supervisor 4) Backend Validate 5) บันทึกหรือเปลี่ยนสถานะ  
**Alternative Flow:** Duplicate Code/Email, Reference ไม่ถูกต้อง, Field/Status ไม่ผ่าน → ไม่บันทึก  
**Postconditions:** Employee ถูกสร้าง/อัปเดตตามข้อมูลที่ผ่าน Validation  
**Related Requirement:** FR-16; BR-24; RP-04

### UC-16 — Manage Leave Type

**Actor:** HR, Admin  
**Description:** ดู เพิ่ม แก้ไข และเปลี่ยนสถานะ Leave Type/Policy  
**Preconditions:** Login ด้วย HR/Admin  
**Main Flow:** 1) กรอก Code/Name/Policy 2) Backend Validate 3) บันทึกหรือเปลี่ยนสถานะ  
**Alternative Flow:** Code/Name ซ้ำหรือ Policy ไม่ถูกต้อง → ไม่บันทึก  
**Postconditions:** Leave Type/Policy ถูกอัปเดต  
**Related Requirement:** FR-17; BR-05, BR-08, BR-13, BR-26

### UC-17 — Manage Leave Entitlement

**Actor:** HR, Admin  
**Description:** ดู เพิ่ม และแก้ Entitlement ราย Employee/Type/Year  
**Preconditions:** Login ด้วย HR/Admin และมี Employee/Leave Type ที่ถูกต้อง  
**Main Flow:** 1) เลือก Employee/Type/Year 2) ระบุ Total/Used 3) Backend Validate/Duplicate Check 4) บันทึก  
**Alternative Flow:** Reference ผิด, ปี/วันนอกช่วง หรือชุดข้อมูลซ้ำ → ไม่บันทึก  
**Postconditions:** Entitlement พร้อมใช้กับ Balance/Submit  
**Related Requirement:** FR-18; BR-09, BR-28

### UC-18 — Manage Holiday

**Actor:** HR, Admin  
**Description:** ดู เพิ่ม แก้ไข และลบ Holiday  
**Preconditions:** Login ด้วย HR/Admin  
**Main Flow:** 1) กรอก Date/Name/Type/Description/Status 2) Backend Validate 3) บันทึก/แก้ไข/ลบ  
**Alternative Flow:** วันที่ซ้ำหรือข้อมูลไม่ผ่าน → ไม่เปลี่ยนข้อมูล  
**Postconditions:** Holiday Active มีผลกับ Working Day Calculation  
**Related Requirement:** FR-19, FR-12; BR-06, BR-27

### UC-19 — View HR Leave Report

**Actor:** HR, Admin  
**Description:** ดูรายงาน Leave Request ตาม Filter/Summary และเปิดรายละเอียดที่ระบบรองรับ  
**Preconditions:** Login ด้วย HR/Admin  
**Main Flow:** 1) เปิดรายงาน 2) เลือก Filter 3) API คืนข้อมูล 4) แสดง Summary/List/Detail  
**Alternative Flow:** ไม่มีข้อมูลตรง Filter → แสดงผลว่าง; Role อื่นเรียก API → 403  
**Postconditions:** ไม่มีการเปลี่ยนข้อมูล  
**Related Requirement:** FR-20; RP-04

### UC-20 — Manage User Account

**Actor:** Admin  
**Description:** ดู เพิ่ม แก้ไข Role/Username/Status และ Reset Temporary Password  
**Preconditions:** Login ด้วย Admin; Employee ที่สร้างบัญชียังไม่มี User  
**Main Flow:** 1) เลือก Employee/Role 2) กำหนด Username/Status 3) Backend Validate 4) สร้าง Temporary Password 5) Admin ส่งต่อ Password ด้วยกระบวนการองค์กร 6) ผู้ใช้เปลี่ยนเมื่อ Login  
**Alternative Flow:** Username/Employee ซ้ำ, Role ไม่ Active, Status ผิด หรือ Reset บัญชี Inactive → ปฏิเสธ  
**Postconditions:** User ถูกสร้าง/แก้ หรือได้รับ Temporary Password และ Session เก่าถูกยกเลิกเมื่อ Reset  
**Related Requirement:** FR-21, FR-03; BR-29–32; RP-05

### UC-21 — Manage Department and Position

**Actor:** Admin  
**Description:** ดู เพิ่ม แก้ไข และเปลี่ยนสถานะ Department/Position ผ่าน UI ปัจจุบัน  
**Preconditions:** Login ด้วย Admin  
**Main Flow:** 1) เปิด Management 2) กรอก Name/Description ตามประเภท 3) Backend Validate 4) บันทึก/เปลี่ยนสถานะ  
**Alternative Flow:** ชื่อซ้ำ, ความยาวหรือสถานะผิด → ไม่บันทึก  
**Postconditions:** Master Data ถูกอัปเดตและใช้เป็น Reference ตามสถานะ  
**Related Requirement:** FR-22; BR-25; RP-05

### UC-22 — View Audit Log

**Actor:** Admin  
**Description:** ดู Audit Log ของ Event ที่ระบบบันทึกจริง  
**Preconditions:** Login ด้วย Admin  
**Main Flow:** 1) เปิด Audit Log 2) API ตรวจ Admin 3) คืนรายการ/กลุ่มข้อมูลที่รองรับ 4) แสดงผล  
**Alternative Flow:** Role อื่นเรียก → 403; ไม่มี Event → แสดงผลว่าง  
**Postconditions:** ไม่มีการเปลี่ยน Log  
**Related Requirement:** FR-23; RP-05; NFR-12

### UC-23 — View Role Dashboard

**Actor:** ผู้ใช้ทุก Role  
**Description:** ดู Summary และทางเข้า Function หลักตาม Role จากข้อมูล API ปัจจุบัน  
**Preconditions:** Login และผ่าน Password Gate  
**Main Flow:** 1) เข้าสู่ Dashboard ตาม Role 2) โหลดข้อมูลจาก Backend 3) แสดง Summary 4) ไป Function ที่มีสิทธิ์  
**Alternative Flow:** API Error/ไม่มีข้อมูล → แสดง Error/Empty State ตาม Baseline  
**Postconditions:** ไม่มีการเปลี่ยนข้อมูล เว้นแต่ผู้ใช้ไปทำ Action ต่อ  
**Related Requirement:** FR-25, FR-02; NFR-05, NFR-09, NFR-10

---

## 13. Requirement ↔ Use Case Traceability

| Requirement | Use Case | Role | Implementation Evidence |
| --- | --- | --- | --- |
| FR-01 | UC-01 | ทุก Role | Auth Controller และ `/api/auth/*` |
| FR-02 | UC-01, UC-11, UC-15, UC-19–23 | ทุก Role | App Route Guards, Authorization Middleware |
| FR-03 | UC-02, UC-20 | ทุก Role/Admin | Change Password, Admin User Controller |
| FR-04 | UC-03 | ทุก Role | Password Reset Controller, Email Service |
| FR-05 | UC-04 | ทุก Role | Profile API, Profile Upload Middleware |
| FR-06 | UC-06 | ทุก Role | Draft Create API |
| FR-07 | UC-06 | ทุก Role | Draft Update/Delete, Attachment Delete API |
| FR-08 | UC-05 | ทุก Role แบบมีเงื่อนไข | Submit API, Leave Controller Transaction |
| FR-09 | UC-07 | ทุก Role | Own List/Detail API |
| FR-10 | UC-08 | ทุก Role | Cancel Own API |
| FR-11 | UC-09 | ทุก Role | Balance API/Formula |
| FR-12 | UC-05, UC-06, UC-18 | ผู้ยื่น/HR/Admin | Working Day, Upload Middleware, Holiday API |
| FR-13 | UC-11 | Supervisor | Supervisor List/Detail API |
| FR-14 | UC-12, UC-13 | Supervisor | Decision API/Transaction |
| FR-15 | UC-14 | Supervisor | Team Report API |
| FR-16 | UC-15 | HR/Admin | HR Employee API |
| FR-17 | UC-16 | HR/Admin | Leave Type API |
| FR-18 | UC-17 | HR/Admin | Entitlement API |
| FR-19 | UC-18 | HR/Admin | Holiday API |
| FR-20 | UC-19 | HR/Admin | Leave Report API |
| FR-21 | UC-20 | Admin | Admin User API |
| FR-22 | UC-21 | Admin UI; HR/Admin API | Department/Position API และ Admin Routes |
| FR-23 | UC-22 | Admin/System | Audit API และ Audit Service |
| FR-24 | UC-05, UC-10, UC-12, UC-13 | ทุก Role ตาม Ownership/Event | Notification API/Service |
| FR-25 | UC-23 | ทุก Role | Role Dashboard Pages และ Runtime Baseline |

ทุก FR มี Actor Interaction ที่สัมพันธ์กับ Use Case; FR-23 มีส่วน System Function สำหรับสร้าง Audit Log และ UC-22 สำหรับ Actor ที่อ่าน Log

---

## 14. Implementation Evidence

### 14.1 Runtime Evidence ที่ใช้เป็น Baseline

- Integration/Final Runtime Verification ผ่าน 18 กลุ่มสำคัญ ครอบคลุม Draft, Submit, Validation, Balance, Supervisor Scope, Approve/Reject, Cancel, Notification Ownership, Self-approval, Weekend/Holiday, Attachment Branch, Profile/Password และ Role Authorization
- Permission Runtime ยืนยัน Own Leave สำหรับทุก Role, Supervisor API เฉพาะ Supervisor, HR API สำหรับ HR/Admin, Admin User/Audit เฉพาะ Admin
- Frontend lint/build ผ่าน, Backend Test Suite ผ่าน 51/51 และ CRITICAL/HIGH = 0 ตาม Baseline ที่ส่งต่อเข้าก้อน 3A
- Frontend → Backend API → MariaDB เป็น Source of Truth เดียวของ Business Data หลักตาม Integration Baseline

### 14.2 Backend Evidence

| หลักฐาน | สิ่งที่ยืนยัน |
| --- | --- |
| `backend/src/server.js` | รายการ API, Authentication Gate และ Role Middleware |
| `backend/src/controllers/auth-controller.js` | Login/Session/Logout/Change Password/Cookie/Token Version |
| `backend/src/controllers/password-reset-controller.js` | OTP, Rate Limit, Reset Token, Reset Transaction |
| `backend/src/auth/password-policy.js` | Password Policy |
| `backend/src/middleware/authorization.js` | Admin, HR/Admin และ Supervisor Role Enforcement |
| `backend/src/controllers/leave-controller.js` | Leave Validation, Draft/Submit/Cancel, Balance, Supervisor Scope/Decision, Attachment Access |
| `backend/src/controllers/notification-controller.js` | Owner-scoped List/Read/Delete และ Deep Link Mapping |
| `backend/src/services/notification-service.js` | การสร้าง Notification |
| `backend/src/controllers/hr-management-controller.js` | Employee/Department/Position/Leave Type/Holiday/Entitlement Rules |
| `backend/src/controllers/admin-users-controller.js` | User/Role/Status/Temporary Password/Reset Rules |
| `backend/src/services/audit-service.js` | Audit Log Persistence |
| `backend/src/middleware/leave-upload.js` | Leave Attachment Type/Count/Size |
| `backend/src/middleware/profile-upload.js` | Profile Image Type/Size |

### 14.3 Database Evidence

- `backend/migrations/20260805_add_leave_workflow.sql` ยืนยันสถานะ `draft`, `pending`, `approved`, `rejected`, `cancelled` และตาราง Attachment/Notification
- Password Reset/Temporary Password migrations ยืนยัน Field/Table ที่ Controller ใช้
- Unique Constraints และ Backend Duplicate Check สนับสนุน Master Data/User Rules ที่ระบุ

### 14.4 Frontend Evidence

- `frontend/src/App.jsx` ยืนยัน Route ของ Employee, Supervisor, HR และ Admin รวมถึง Protected/Role Route
- Role Layout/Menu และ Role Pages ยืนยัน Function ที่เปิดให้ผู้ใช้แต่ละ Role
- Frontend Route เป็นหลักฐานการเข้าถึง UI แต่ Backend Authorization เป็นหลักฐาน Permission ขั้นสุดท้าย

### 14.5 Requirement Document เดิม

พบ `FINAL_REQUIREMENT_AUDIT.md` ใน Working Tree ซึ่งเป็นเอกสาร Audit ก่อน Final Alignment และมีข้อสังเกตจากสถานะก่อน Integration บางส่วน จึงใช้เพื่อเปรียบเทียบคำศัพท์/ช่องว่างเท่านั้น ไม่ใช้ข้อความ Legacy Local Storage หรือข้อสรุปเก่าที่ขัดกับ Runtime/Backend ปัจจุบันเป็น Source of Truth เอกสารฉบับนี้เป็น Candidate ที่จัด Alignment ใหม่ตามลำดับหลักฐานที่กำหนด

---

## 15. Documentation Gap ที่พบ

1. **Attachment Policy Runtime Coverage:** Backend รองรับและบังคับ Attachment ตาม Leave Type แล้ว แต่ Runtime Baseline ระบุว่าไม่มี Active Leave Type ที่เปิด Attachment-required branch ให้ทดสอบ End-to-End แบบบังคับแนบ จึงยืนยัน Logic/Test ระดับ Controller ได้ แต่ควรมี Policy Data สำหรับ Acceptance Test ในอนาคต
2. **Approval History Terminology:** Current Decision Flow เขียน `audit_logs` และข้อมูล Approver/Timestamp ใน `leave_requests`; ยังไม่พบการใช้ตาราง Approval History แยกใน Flow ปัจจุบัน เอกสารนี้จึงไม่อ้างว่ามี Approval Chain History หลายขั้น
3. **Cancel Side Effects:** Cancel Endpoint เปลี่ยนสถานะเป็น Cancelled แต่ไม่สร้าง Notification หรือ Audit Log ใน Implementation ปัจจุบัน จึงระบุไว้ตามจริงและไม่เพิ่ม Requirement ที่ไม่มีหลักฐาน
4. **Notification Event Coverage:** Event ที่ยืนยันคือ Submit → Direct Supervisor และ Approve/Reject → Request Owner หน้า Notification ของ HR/Admin มีได้ตาม Role Function/Ownership API แต่ไม่มี Requirement ว่าต้องได้รับ HR/Admin Workflow Event
5. **Department/Position UI กับ API:** Backend อนุญาต HR/Admin สำหรับ HR Master Data API แต่ Frontend Management Route ปัจจุบันอยู่ใน Admin UI เอกสารจึงแยก API Permission และ UI Availability ไม่เหมารวมว่า HR มีหน้าจอ Admin
6. **Dashboard KPI Contract:** Dashboard ใช้ข้อมูล API ปัจจุบัน แต่ยังไม่มีเอกสาร Data Contract/KPI Definition ทางธุรกิจที่เจ้าของระบบลงนาม เอกสารนี้จึงไม่กำหนด KPI เพิ่มเติม
7. **Legacy Audit Document:** เอกสาร Audit เดิมมีข้อสังเกตจากช่วงก่อน Final Integration บางส่วน ต้องไม่ถูกนำไปใช้แทน Baseline ฉบับนี้หลัง Review/Freeze

---

## 16. จุดที่ต้องยืนยันกับเจ้าของระบบ

คำถามต่อไปนี้ไม่ Block การอธิบาย Current Implementation แต่ควรได้รับคำตอบก่อนประกาศ Requirement Freeze สมบูรณ์:

1. ยืนยันว่าผู้ใช้ทุก Role รวม HR/Admin/Supervisor สามารถยื่นคำขอลาของตนเองได้ตาม API ปัจจุบัน โดยมีเงื่อนไขว่าต้องถูกผูก Supervisor Account ใช่หรือไม่
2. ยืนยันว่า Department/Position Management ต้องมี UI เฉพาะ Admin แม้ Backend HR Management API อนุญาต HR/Admin ใช่หรือไม่
3. ยืนยันว่า Current Notification Event ต้องมีเพียง Submit, Approve และ Reject และไม่ต้องแจ้ง HR/Admin หรือแจ้งเมื่อ Cancel ใช่หรือไม่
4. ยืนยันว่า `audit_logs` ร่วมกับ Approver/Timestamp ใน `leave_requests` เพียงพอเป็นประวัติการอนุมัติของ Workflow ชั้นเดียว และไม่ต้องใช้ Approval History Table แยกใช่หรือไม่
5. ยืนยัน Leave Type ใดใน Production ต้องบังคับ Attachment, Threshold เท่าใด และต้องจัด Test Data สำหรับ Acceptance Test หรือไม่
6. ยืนยันว่า Entitlement Management อนุญาตกำหนด `used_days` โดย HR/Admin โดยตรงตาม Implementation ปัจจุบัน และไม่ต้องจำกัดเพิ่มเติม
7. ยืนยันว่าไม่มี SLA, Retention Period, Export Format หรือ Audit Retention Requirement เพิ่มเติมที่จะต้อง Freeze ใน NFR รอบนี้

---

## Final Current vs Future / Consistency Check

- Current Actors มีเพียง Employee, Supervisor, HR และ Admin; Email Service เป็น Supporting Actor เฉพาะ OTP
- Approval มีเพียง Direct Supervisor หนึ่งขั้น
- HR/Admin ไม่ใช่ผู้อนุมัติใน Workflow ปัจจุบัน
- ไม่มี Department Manager, Backup Approver, Final Approver หรือ Multi-step Approval ใน Current Requirement
- Push Notification, Real-time Notification, Native Mobile App และ Approval ขั้นเพิ่มอยู่ใน Future Scope เท่านั้น
- Role → Function → Requirement → Business Rule → Workflow → Use Case ใช้ Terminology และสถานะชุดเดียวกัน
- ไม่มีการแก้ Code, UI/UX, Route, API, Database Schema, Business Logic, Workflow หรือ Permission ในก้อน 3A

**จุดหยุด:** เอกสารก้อน 3A สิ้นสุดที่ Requirement, Permission, Business Rule, Workflow, Use Case และ Mapping ตามขอบเขตที่กำหนด ต้องรอ Review/Approval ก่อนเริ่มก้อน 3B
