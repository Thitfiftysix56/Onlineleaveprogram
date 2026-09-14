# Final Requirement Audit

## Online Leave Approval System

วันที่ตรวจสอบ: 13 สิงหาคม 2026  
ประเภทงาน: Audit Only  
แหล่งข้อมูลหลัก: Implementation, Backend API, Database schema และ Runtime behavior ปัจจุบัน

> ไม่มีการแก้ Code, UI, Route, Backend, API, Database Schema, Workflow หรือ Business Logic ระหว่างการ Audit

## 1. System Overview

ระบบประกอบด้วย:

- Frontend: React, Vite, React Router และ MUI
- Backend: Node.js และ Express
- Authentication: JWT ใน HTTP-only cookie อายุ 8 ชั่วโมง
- Database: MariaDB
- Roles: Employee, Supervisor, HR และ Admin
- Approval workflow ที่ Backend รองรับจริง: Employee → Supervisor เพียงขั้นเดียว
- Notification: Backend มี in-app notification ใน Database แต่หลายหน้า Frontend ยังใช้ localStorage
- Password recovery: OTP ทางอีเมล → Reset token → ตั้งรหัสผ่านใหม่

หลักฐานสำคัญ:

- `frontend/src/App.jsx`
- `frontend/src/components/protectedroute.jsx`
- `backend/src/server.js`
- `backend/src/controllers/auth-controller.js`
- `backend/src/controllers/leave-controller.js`
- `compose.yaml`

ไม่พบ Requirement Document เดิมใน repository มีเพียง `README.md` ซึ่งเป็นคู่มือรันระบบ จึงไม่สามารถจัด KEEP/UPDATE/REMOVE เทียบเอกสารเดิมได้โดยไม่คาดเดา

## 2. Role Inventory

| Role | ความสามารถที่เชื่อม Backend จริง | ส่วนที่ยังใช้ local/default data |
|---|---|---|
| Employee | Login, Profile, Change Password, Leave detail, Cancel/Delete detail API | Dashboard, Create Leave, My Requests list, Leave Balance, Notification |
| Supervisor | Profile/Password, Pending Approval, Approval detail, Approve/Reject, Team Report | Own leave creation/list/balance, Dashboard บางส่วน, Notification |
| HR | Employee, Leave Type, Entitlement, Holiday management, Profile/Password | Own leave pages, Notification, Report fallback |
| Admin | User, Department, Position management, Profile/Password | Dashboard summary, Audit Log UI, own leave pages, Notification |

## 3. Route / Page Inventory

### 3.1 Shared / Authentication

| Route | Function | API |
|---|---|---|
| `/login` | Login ด้วย username หรือ email | `POST /api/auth/login` |
| `/forgot-password` | ขอ OTP | `POST /api/auth/forgot-password/request-otp` |
| `/forgot-password/verify` | ตรวจ OTP และขอ OTP ใหม่ | `POST /api/auth/forgot-password/verify-otp` |
| `/reset-password` | ตั้งรหัสผ่านใหม่ | `POST /api/auth/reset-password` |
| `/` และ `*` | Redirect ตาม Role | `/api/auth/me` เมื่อเข้า protected route |

### 3.2 Employee

| Route | Function | Data source |
|---|---|---|
| `/employee/dashboard` | Summary, recent requests และ notifications | localStorage |
| `/employee/leave-request` | สร้าง/บันทึก Draft/Submit | localStorage |
| `/employee/my-requests` | ดู/กรอง/แก้/ลบ/ยกเลิกรายการ | default/local data |
| `/employee/my-requests/:requestId` | ดู detail, ลบ draft, ยกเลิก pending | Backend API |
| `/employee/leave-balance` | ดูยอดสิทธิ์ | default data |
| `/employee/notifications` | อ่าน/กรอง/mark read | localStorage |
| `/employee/profile` | ดูและแก้ profile/image | Backend API |
| `/employee/change-password` | เปลี่ยนรหัสผ่าน | Backend API |

### 3.3 Supervisor

| Route | Function | Data source |
|---|---|---|
| `/supervisor/dashboard` | Summary และ notifications | localStorage |
| `/supervisor/leave-request` | คำขอลาของตนเอง | localStorage |
| `/supervisor/my-requests` | รายการคำขอของตนเอง | default/local data |
| `/supervisor/my-requests/:requestId` | รายละเอียดคำขอของตนเอง | Backend API |
| `/supervisor/leave-balance` | สิทธิ์ของตนเอง | default data |
| `/supervisor/approval` | รายการ pending ของลูกทีม | Backend API |
| `/supervisor/approval/:requestId` | ดู/Approve/Reject | Backend API |
| `/supervisor/team-reports` | รายงานลูกทีมพร้อมตัวกรอง | Backend API |
| `/supervisor/notifications` | Notification UI | localStorage |
| `/supervisor/profile` | Profile | Backend API |
| `/supervisor/change-password` | Change Password | Backend API |

### 3.4 HR

| Route | Function | API/Data source |
|---|---|---|
| `/hr/dashboard` | Summary พนักงาน/ประเภทลา/วันหยุด | Backend API |
| `/hr/leave-request` | คำขอลาของ HR | localStorage |
| `/hr/my-requests` | รายการของ HR | default/local data |
| `/hr/my-requests/:requestId` | รายละเอียดของ HR | Backend API |
| `/hr/leave-balance` | สิทธิ์ของ HR | default data |
| `/hr/employee-management` | ค้นหา/กรอง/เปลี่ยนสถานะ | `/api/hr/employees` |
| `/hr/employee-management/add` | เพิ่มพนักงาน | `POST /api/hr/employees` |
| `/hr/employee-management/:employeeId/edit` | แก้พนักงาน | `PUT /api/hr/employees/:employeeId` |
| `/hr/leave-entitlement` | เพิ่ม/แก้สิทธิ์ลา | `/api/hr/leave-entitlements` |
| `/hr/leave-types` | จัดการและเปลี่ยนสถานะประเภทลา | `/api/hr/leave-types` |
| `/hr/leave-types/add` | เพิ่มประเภทลา | Backend API |
| `/hr/leave-types/:leaveTypeId/edit` | แก้ประเภทลา | Backend API |
| `/hr/holiday-management` | เพิ่ม/แก้/ลบวันหยุด | `/api/hr/holidays` |
| `/hr/reports` | รายงาน/กรอง/Export | เรียก API ที่ไม่มี แล้ว fallback localStorage |
| `/hr/reports/leave-requests/:requestId` | รายละเอียดรายงาน | Backend leave detail ตาม viewer mode |
| `/hr/notifications` | Notification UI | localStorage |
| `/hr/profile` | Profile | Backend API |
| `/hr/change-password` | Change Password | Backend API |

### 3.5 Admin

| Route | Function | API/Data source |
|---|---|---|
| `/admin/dashboard` | Summary ผู้ใช้/แผนก/ตำแหน่ง/Audit | localStorage/default data |
| `/admin/leave-request` | คำขอลาของ Admin | localStorage |
| `/admin/my-requests` | รายการของ Admin | default/local data |
| `/admin/my-requests/:requestId` | รายละเอียดของ Admin | Backend API |
| `/admin/leave-balance` | สิทธิ์ของ Admin | default data |
| `/admin/user-management` | ดู/กรอง/สถานะ/reset password | `/api/admin/users` |
| `/admin/user-management/add` | สร้างบัญชีและ temporary password | Backend API |
| `/admin/user-management/:userId/edit` | แก้ username/role/status | Backend API |
| `/admin/department-management` | จัดการแผนก | `/api/hr/departments` |
| `/admin/department-management/add` | เพิ่มแผนก | Backend API |
| `/admin/department-management/:departmentId/edit` | แก้แผนก | Backend API |
| `/admin/position-management` | จัดการตำแหน่ง | `/api/hr/positions` |
| `/admin/position-management/add` | เพิ่มตำแหน่ง | Backend API |
| `/admin/position-management/:positionId/edit` | แก้ตำแหน่ง | Backend API |
| `/admin/audit-log` | ดู/กรอง Audit Log | localStorage เท่านั้น |
| `/admin/notifications` | Notification UI | localStorage |
| `/admin/profile` | Profile | Backend API |
| `/admin/change-password` | Change Password | Backend API |

## 4. Function Inventory

### 4.1 ทำงานกับ Backend/Database จริง

- Login, Logout และ Session restoration
- Forced temporary password change
- Forgot Password ผ่าน OTP
- Profile และ profile image
- Admin user management และ reset password
- HR employee, leave type, entitlement และ holiday management
- Department และ Position management
- Leave detail ของเจ้าของคำขอ
- Supervisor pending list/detail/approve/reject
- Supervisor team report
- Backend leave draft/submit/cancel/balance
- Backend notification list/read/read-all/delete

### 4.2 มี UI แต่ยังไม่เชื่อม Backend เดียวกัน

- Frontend Create Leave Request
- Frontend My Requests list
- Frontend Leave Balance
- Role Notification pages
- Employee/Supervisor/Admin dashboard หลายส่วน
- Admin Audit Log page
- HR Report

## 5. Approval Workflow จริง

```text
ผู้ใช้สร้าง Draft
→ ตรวจ required fields/date/type/entitlement/balance/overlap
→ Submit เป็น pending
→ ค้นหา Supervisor จาก employees.supervisor_id
→ สร้าง Notification ให้ Supervisor
→ Supervisor เห็นเฉพาะ pending ของลูกทีม
→ Approve หรือ Reject
→ Approved: เพิ่ม leave_entitlements.used_days
→ Rejected: เก็บ rejection_reason
→ สร้าง Notification ให้เจ้าของคำขอ
→ เขียน Audit Log สำหรับการตัดสินใจ
```

Status จริง:

- `draft`
- `pending`
- `approved`
- `rejected`
- `cancelled`

ไม่พบ implementation ของ HR approval, Final Approver, Department Manager approval, Backup Approver หรือ Multi-step approval

ข้อขัดแย้ง: Workflow ฝั่ง Backend มีจริง แต่หน้า Frontend สำหรับสร้างและรายการคำขอยังไม่ได้เรียก API ชุดเดียวกัน จึงไม่สามารถยืนยัน end-to-end ผ่าน UI ปัจจุบันได้

## 6. Permission Matrix

| Function | Employee | Supervisor | HR | Admin |
|---|---:|---:|---:|---:|
| Own leave API | ✅ | ✅ | ✅ | ✅ |
| Supervisor approval API | ❌ | ✅ | ❌ | ❌ |
| HR management API | ❌ | ❌ | ✅ | ✅ |
| Admin user API | ❌ | ❌ | ❌ | ✅ |
| Profile/Password | ✅ | ✅ | ✅ | ✅ |
| Notification ของตนเอง | ✅ | ✅ | ✅ | ✅ |
| Download attachment ของตนเอง | ✅ | ✅ | ✅ | ✅ |
| Download attachment ของลูกทีม | ❌ | ✅ | ❌ | ❌ |
| Download attachment ในฐานะ HR/Admin | ❌ | ❌ | ✅ | ✅ |

ผล Runtime API:

- Employee: own `200`, Supervisor/HR/Admin API `403`
- Supervisor: own `200`, Supervisor API `200`, HR/Admin API `403`
- HR: own `200`, HR API `200`, Supervisor/Admin API `403`
- Admin: own `200`, HR API `200`, Admin API `200`, Supervisor API `403`

Frontend direct URL test: Login Employee แล้วเปิด `/admin/user-management` ระบบ redirect กลับ `/employee/dashboard`

สรุป: Route guard และ API authorization หลักทำงานจริง ไม่ใช่เพียงซ่อนเมนู

## 7. Business Rules

| Rule | Status | Enforcement |
|---|---|---|
| Required leave fields | Implement แล้ว | Backend |
| Start date ≤ End date | Implement แล้ว | Backend |
| ห้ามคำขอข้ามปี | Implement แล้ว | Backend |
| Reason 5–500 ตัวอักษร | Implement แล้ว | Backend |
| ใช้เฉพาะ Leave Type ที่ active | Implement แล้ว | Backend/DB |
| ตัดเสาร์-อาทิตย์และวันหยุด | Implement แล้ว | Backend |
| Minimum/maximum days ตามประเภทลา | Implement แล้ว | Backend |
| ต้องมี entitlement ในปีนั้น | Implement แล้ว | Backend |
| Balance ต้องเพียงพอ | Implement แล้ว | Backend transaction |
| ห้ามช่วงวันทับ pending/approved | Implement แล้ว | Backend |
| Attachment ตาม policy | Implement แล้ว | Backend/upload middleware |
| แก้/ลบได้เฉพาะ draft ของตนเอง | Implement แล้ว | Backend |
| ยกเลิกได้เฉพาะ pending ของตนเอง | Implement แล้ว | Backend |
| Supervisor ตัดสินได้เฉพาะลูกทีม | Implement แล้ว | Backend |
| Supervisor ห้ามอนุมัติคำขอตนเอง | Implement แล้ว | Backend |
| Reject ต้องมีเหตุผล | Implement แล้ว | Backend |
| ตัดสินซ้ำไม่ได้ | Implement แล้ว | Backend |
| Username ไม่ซ้ำ | Implement แล้ว | Backend/DB |
| Employee code/email ไม่ซ้ำ | Implement แล้ว | Backend |
| Department/Position name ไม่ซ้ำ | Implement แล้ว | Backend |
| Holiday date ไม่ซ้ำ | Implement แล้ว | Backend |
| Entitlement employee/type/year ไม่ซ้ำ | Implement แล้ว | Backend |
| Temporary password บังคับเปลี่ยน | Implement แล้ว | Frontend + Backend |
| Password policy | Implement แล้ว | Frontend + Backend |

## 8. Notification Flow

### Backend implementation จริง

1. Submit Leave Request
   - ผู้ส่ง/ต้นเหตุ: เจ้าของคำขอ
   - ผู้รับ: Supervisor
   - Type: `leave-submitted`
   - Route: `/supervisor/approval/:requestId`

2. Approve
   - ผู้ส่ง/ต้นเหตุ: Supervisor
   - ผู้รับ: เจ้าของคำขอ
   - Type: `leave-approved`
   - Route: `/employee/my-requests/:requestId`

3. Reject
   - ผู้ส่ง/ต้นเหตุ: Supervisor
   - ผู้รับ: เจ้าของคำขอ
   - Type: `leave-rejected`
   - มี rejection reason ใน content
   - Route: `/employee/my-requests/:requestId`

Backend รองรับ list, unread count, mark read, mark all read และ delete โดยผูก `user_id`

ข้อจำกัด:

- Frontend Role Notification pages ไม่ได้ใช้ `frontend/src/api/notification-service.js`
- ใช้ `notificationstorage.js` และข้อมูลตัวอย่างแทน
- Route notification สำหรับ HR/Admin/Supervisor ที่เป็นเจ้าของคำขอลาถูก hard-code ไป Employee route
- Push/Mobile push ไม่พบ implementation จัดเป็น Future Scope

## 9. Database Mapping

| Function | Tables หลัก |
|---|---|
| Authentication/User | `users`, `roles`, `employees` |
| Employee organization | `employees`, `departments`, `positions` |
| Leave request | `leave_requests`, `leave_request_attachments` |
| Approval | `leave_requests`, `leave_approval_logs` |
| Leave policy | `leave_types`, `leave_entitlements`, `holidays` |
| Notification | `notifications` |
| Audit | `audit_logs` |
| Password recovery | `password_reset_otps`, `password_reset_tokens` |

Foreign-key flow หลัก:

```text
users.employee_id → employees.employee_id
users.role_id → roles.role_id
employees.department_id → departments.department_id
employees.position_id → positions.position_id
employees.supervisor_id → employees.employee_id
leave_requests.employee_id → employees.employee_id
leave_requests.leave_type_id → leave_types.leave_type_id
leave_entitlements.employee_id → employees.employee_id
notifications.user_id → users.user_id
notifications.leave_request_id → leave_requests.leave_request_id
```

Current Database Runtime ยืนยันว่ามี `leave_requests`, `leave_request_attachments`, `leave_entitlements`, `notifications` และข้อมูลคำขอทุก status อยู่จริง

## 10. Requirement Mapping

ตัวอย่าง trace ที่สมบูรณ์:

```text
Supervisor Approve Leave
→ POST /api/supervisor/approvals/:requestId/decision
→ leave-controller.decide()
→ ตรวจ team scope และ pending status
→ UPDATE leave_requests
→ UPDATE leave_entitlements.used_days
→ INSERT notifications
→ INSERT audit_logs
```

ตัวอย่าง trace ที่ยังไม่สมบูรณ์:

```text
Frontend Create Leave Request
→ rolecreateleaverequestpage.jsx
→ leaverequeststorage.js
→ localStorage
→ ไม่เรียก POST /api/leave/requests/submit
→ ไม่ถึง leave_requests/notifications ใน Database
```

## 11. Functional Requirement Candidate

- FR-01 ระบบสามารถยืนยันตัวตนด้วย Username หรือ Email และ Password
- FR-02 ระบบสามารถจำกัดการเข้าถึงตาม Role
- FR-03 ระบบสามารถบังคับผู้ใช้เปลี่ยน Temporary Password ก่อนใช้งานส่วนอื่น
- FR-04 ผู้ใช้สามารถดูและแก้ไขข้อมูลส่วนตัวและรูปโปรไฟล์
- FR-05 ผู้ใช้สามารถเปลี่ยนและกู้คืนรหัสผ่านผ่าน OTP
- FR-06 ผู้ใช้สามารถสร้าง แก้ไข ลบ และ Submit Leave Request แบบ Draft
- FR-07 ผู้ใช้สามารถดูและยกเลิกคำขอของตนตามสถานะที่อนุญาต
- FR-08 ระบบสามารถคำนวณจำนวนวันทำงานและตรวจสิทธิ์ลาคงเหลือ
- FR-09 Supervisor สามารถดูคำขอ pending ของลูกทีม
- FR-10 Supervisor สามารถ Approve หรือ Reject พร้อมเหตุผล
- FR-11 ระบบสามารถปรับ used leave entitlement เมื่อ Approve
- FR-12 Supervisor สามารถดู Team Report พร้อมตัวกรอง
- FR-13 HR สามารถจัดการข้อมูลพนักงาน
- FR-14 HR สามารถจัดการ Leave Type
- FR-15 HR สามารถจัดการ Leave Entitlement
- FR-16 HR สามารถจัดการ Holiday
- FR-17 Admin สามารถจัดการ User Account, Role, Status และ Reset Password
- FR-18 Admin สามารถจัดการ Department และ Position
- FR-19 ระบบสามารถสร้างและจัดการ In-app Notification
- FR-20 ระบบสามารถบันทึก Audit Log สำหรับเหตุการณ์ที่ implement ไว้

ข้อ FR-06–08 และ FR-19 มี Backend implementation แต่ Frontend integration ยังไม่ครบ

## 12. Non-Functional Requirement Candidate

- NFR-01 ใช้ responsive navigation รองรับ desktop/mobile
- NFR-02 ใช้ role-based theme โดยไม่เปลี่ยน permission
- NFR-03 ใช้ HTTP-only cookie สำหรับ authentication
- NFR-04 ใช้ bcrypt สำหรับ password hash
- NFR-05 ใช้ Helmet, CORS และ upload limits
- NFR-06 ใช้ transaction สำหรับ approval และการปรับ balance
- NFR-07 มี Error Boundary ระดับ application
- NFR-08 รองรับ keyboard focus และ accessible name สำหรับ action สำคัญ
- NFR-09 รองรับ reduced motion
- NFR-10 ต้องรักษาความสอดคล้องของข้อมูลระหว่าง UI/API/Database

## 13. Role / Permission Requirement Candidate

- RP-01 Employee เข้าถึงเฉพาะข้อมูลและคำขอของตน
- RP-02 Supervisor อนุมัติได้เฉพาะคำขอของลูกทีม
- RP-03 Supervisor ไม่สามารถอนุมัติคำขอของตนเอง
- RP-04 HR จัดการข้อมูล HR ได้ แต่ไม่สามารถใช้ Admin user API
- RP-05 Admin จัดการ User/Department/Position และใช้ HR management API ได้
- RP-06 ทุก Role จัดการ Profile, Password และ Notification ของตนเองได้
- RP-07 Backend ต้องตรวจ permission แม้ผู้ใช้เรียก API โดยตรง
- RP-08 Frontend ต้อง redirect เมื่อเปิด route ต่าง Role โดยตรง

## 14. Validation / Business Rule Candidate

- VR-01 ห้ามช่วงลาข้ามปี
- VR-02 ต้องมีวันทำงานอย่างน้อยหนึ่งวัน
- VR-03 ต้องไม่ทับคำขอ pending/approved เดิม
- VR-04 ต้องมี entitlement และ balance เพียงพอ
- VR-05 ต้องผ่าน leave type minimum/maximum day policy
- VR-06 ต้องแนบไฟล์เมื่อประเภทลากำหนด
- VR-07 Reject ต้องระบุเหตุผล
- VR-08 Draft เท่านั้นที่แก้หรือลบได้
- VR-09 Pending เท่านั้นที่ยกเลิกหรือตัดสินได้
- VR-10 Username, Employee Code, Email และข้อมูลอ้างอิงสำคัญต้องไม่ซ้ำ
- VR-11 Department, Position และ Leave Type ที่อ้างอิงต้องมีอยู่จริง
- VR-12 Temporary password ต้องถูกเปลี่ยนก่อนเข้าถึง API งานระบบ

## 15. Future Scope

- Push Notification
- Native Mobile Application
- Multi-step approval
- HR/Final approval step
- Backup approver
- Department Manager approval
- Real-time notification
- Centralized report/export service

รายการนี้ไม่ใช่ Requirement ปัจจุบัน เพราะไม่พบ implementation

## 16. Gap Analysis

### CRITICAL — Frontend และ Backend ใช้คนละ Leave Workflow

Frontend Create/My Requests/Balance ใช้ localStorage/default data แต่ detail/approval ใช้ Database API

ผลกระทบ:

- คำขอที่สร้างจาก UI อาจไม่เข้าคิว Supervisor
- ไม่สร้าง Database notification
- ไม่ปรากฏใน Backend report
- กดดูจากรายการตัวอย่างอาจเปิด ID ที่เป็นคนละ record ใน Database
- Balance ที่ UI แสดงไม่รับประกันว่าตรงกับ `leave_entitlements`

หลักฐาน:

- `frontend/src/components/rolecreateleaverequestpage.jsx`
- `frontend/src/components/rolemyrequestspage.jsx`
- `frontend/src/components/roleleavebalancepage.jsx`
- `frontend/src/api/leave-service.js`

Runtime: Employee My Requests แสดง `LR-20260720-0013` และรายการตัวอย่าง 6 รายการ ขณะที่ Database ปัจจุบันมี request number และ ID คนละชุด

### HIGH — HR Report API ไม่มีอยู่จริง

Frontend เรียก `GET /api/reports/leave-requests` แต่ Backend ตอบ `404` ทุก Role แล้วหน้า UI fallback ไป localStorage โดยไม่แจ้งผู้ใช้

ผลกระทบ:

- Report ไม่ใช่ข้อมูลกลาง
- ชื่อพนักงาน แผนก ผู้อนุมัติแสดง `-`
- Export อาจเป็นข้อมูลตัวอย่าง ไม่ใช่ Database

หลักฐาน:

- `frontend/src/pages/hr/hrreportspage.jsx`
- `backend/src/server.js`

### HIGH — Notification UI ไม่ได้ใช้ Notification Database

Backend มี API ครบ แต่ Role Notification pages ใช้ localStorage/default notifications

ผลกระทบ:

- Notification จาก submit/approve/reject อาจไม่ปรากฏใน UI
- read/delete ใน UI ไม่ปรับ Database
- unread count ไม่ตรงกัน

### HIGH — Admin Audit Log UI ไม่ได้อ่าน audit_logs

Backend เขียน Audit Log บางเหตุการณ์ลง Database แต่ Admin Audit Log page อ่าน localStorage

ผลกระทบ: ข้อมูลตรวจสอบย้อนหลังใน UI ไม่ใช่ audit trail ฝั่ง server

### HIGH — Dashboard บาง Role ใช้ข้อมูลตัวอย่าง

Employee, Supervisor และ Admin dashboard ใช้ local/default data บางส่วน ทำให้ summary ไม่รับประกันว่าตรงกับข้อมูลจัดการจริง

### MEDIUM — Notification route ผูกกับ Employee path

Backend ส่ง approved/rejected notification ไป `/employee/my-requests/:requestId` แม้เจ้าของคำขออาจเป็น Supervisor, HR หรือ Admin

### MEDIUM — Audit coverage ไม่ครบทุก business event

พบ Audit Log สำหรับ approval, password change/reset และบาง admin action แต่ submit, cancel, profile และ HR management บางรายการไม่มีหลักฐานว่าบันทึกครบทุกเหตุการณ์

### MEDIUM — มีสอง source of truth

ไฟล์ `leaverequeststorage.js`, `notificationstorage.js`, `leaveentitlementstorage.js` และ `auditlogstorage.js` ทำหน้าที่คล้าย Backend แต่เป็น browser-local state

## 17. Requirement เดิมที่ควร KEEP

ไม่สามารถจัดประเภทได้ เนื่องจากไม่พบ Requirement Document เดิมใน repository

สิ่งที่ยืนยันได้ว่าเหมาะเป็น Requirement Candidate คือ authentication, role permission, single Supervisor approval, HR management, Admin management, profile/password และ Backend notification

## 18. Requirement เดิมที่ควร UPDATE

ยังจัดประเภทไม่ได้จนกว่าจะได้รับ Requirement เดิม

ประเด็นที่ควรตรวจข้อความในเอกสารเดิมเมื่อได้รับ:

- จำนวน approval steps
- ผู้มีสิทธิ์ approve
- ความหมายของ HR Report
- Notification ที่ต้องรองรับ
- Audit events ที่ต้องบันทึก
- Data source ของ Dashboard

## 19. Requirement ที่ควร ADD

หาก Requirement เดิมไม่ได้ระบุ ควรเพิ่มรายการที่มี implementation จริง:

- Forced temporary password change
- Password reset OTP และ resend/rate limit
- Profile image upload
- Leave attachment policy
- Working-day calculation
- Overlap validation
- Supervisor team scope
- Notification ownership
- Token version/session revocation
- Admin password reset

## 20. Requirement เดิมที่อาจ REMOVE

ยังไม่มีรายการที่สามารถแนะนำ REMOVE ได้อย่างมีหลักฐาน เนื่องจากไม่มี Requirement เดิมให้เทียบ

การที่ระบบยังไม่ implement ไม่ใช่เหตุผลเพียงพอให้ REMOVE

## 21. Requirement ที่ระบบยัง Implement ไม่ครบ

- End-to-end Leave Request ผ่าน UI → API → Database
- UI My Requests ที่อ่านข้อมูลจาก Database
- UI Leave Balance ที่อ่าน Database API
- Notification UI ที่อ่าน/แก้ Database
- HR Report API และข้อมูลรายงานกลาง
- Admin Audit Log API/UI integration
- Dashboard summary ที่ใช้ source of truth เดียวกัน
- Notification route ที่รองรับเจ้าของคำขอทุก Role

## 22. สิ่งที่ระบบมีเพิ่มและควรนำเข้า Requirement

- JWT cookie session
- Token version สำหรับ invalidate session
- Must-change-password workflow
- OTP expiry/resend/rate limit
- File type/size validation
- Error Boundary
- Mobile Drawer และ responsive navigation
- Accessibility labels/focus state
- Role-specific theme
- Reduced-motion behavior

รายการ UI/technical เหล่านี้ควรอยู่ใน NFR, Accessibility หรือ Technical Implementation ไม่ใช่ Functional Requirement

## 23. จุดที่ต้องยืนยันก่อน Final Test

1. ตัดสินใจว่าจะใช้ Backend API/Database เป็น source of truth เดียวสำหรับ Leave Request หรือไม่
2. เชื่อม Create/My Requests/Balance เข้ากับ API ที่มีอยู่
3. เพิ่มหรือยืนยัน endpoint ของ HR Report
4. เชื่อม Notification pages กับ `/api/notifications`
5. เชื่อม Admin Audit Log กับ `audit_logs`
6. ตรวจ Dashboard ทุก Role ว่าใช้ข้อมูลจริง
7. ยืนยันว่า workflow สุดท้ายมี Supervisor step เดียวจริง
8. ยืนยันว่า HR/Admin/Supervisor สามารถยื่นลาของตนเองได้ตาม Requirement
9. กำหนด notification destination ตาม Role เจ้าของคำขอ
10. ส่ง Requirement Document เดิมมาเพื่อจัด KEEP/UPDATE/ADD/REMOVE/GAP อย่างเป็นทางการ
11. หลังแก้ integration แล้วจึงทำ Final end-to-end test:
    - Create draft
    - Submit
    - Supervisor receives request
    - Approve/Reject
    - Status/Balance เปลี่ยน
    - Notification ปรากฏ
    - Report/Audit Log ตรงกับ Database

## Final Conclusion

Backend core workflow และ API permission ทำงานจริง แต่ระบบยังไม่พร้อมใช้ Implementation ปัจจุบันเป็น Final Requirement โดยตรงจนกว่าจะจัดการปัญหา Frontend local/default data กับ Backend Database ซึ่งเป็น Gap หลักระดับ CRITICAL

