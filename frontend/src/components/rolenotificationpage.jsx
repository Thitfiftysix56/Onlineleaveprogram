import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';

import { useNavigate } from 'react-router-dom';

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead as markAllNotificationsAsRead,
  markNotificationRead as markNotificationAsRead,
} from '../api/notification-service.js';

import {
  formatNotificationMessage,
  formatNotificationTitle,
} from '../utils/presentationformatter.js';


/* =========================
   Stable Default
========================= */

/*
 * ห้ามใช้ initialNotifications = []
 * เพราะ [] จะถูกสร้างใหม่ทุก render
 * และทำให้ dependency ของ useCallback/useEffect เปลี่ยน
 */
const emptyInitialNotifications = [];

/* =========================
   Category
========================= */

const getCategoryFromType = (type) => {
  const normalizedType = String(
    type || '',
  )
    .trim()
    .toLowerCase();

  const categoryTypes = {
    'category-leave-request':
      'Leave Request',

    'category-approval':
      'Approval',

    'category-employee':
      'Employee',

    'category-entitlement':
      'Entitlement',

    'category-system':
      'System',

    'category-account':
      'Account',

    'category-holiday':
      'Holiday',

    'leave-submitted':
      'Approval',

    'leave-approved':
      'Leave Request',

    'leave-rejected':
      'Leave Request',

    'leave-cancelled':
      'Leave Request',

    'employee-created':
      'Employee',

    'employee-updated':
      'Employee',

    'employee-status':
      'Employee',

    'entitlement-updated':
      'Entitlement',

    'holiday-created':
      'Holiday',

    'holiday-updated':
      'Holiday',

    'account-created':
      'Account',

    'account-updated':
      'Account',

    'password-reset':
      'Account',
  };

  return (
    categoryTypes[
      normalizedType
    ] || 'System'
  );
};

const translateCategory = (
  category,
) => {
  const labels = {
    'Leave Request':
      'คำขอลา',

    Approval:
      'การอนุมัติ',

    Employee:
      'พนักงาน',

    Entitlement:
      'สิทธิ์การลา',

    System:
      'ระบบ',

    Account:
      'บัญชี',

    Holiday:
      'วันหยุด',
  };

  return (
    labels[category] ||
    category ||
    'ระบบ'
  );
};

const getCategorySymbol = (
  category,
) => {
  const symbols = {
    'Leave Request':
      'ค',

    Approval:
      'อ',

    Employee:
      'พ',

    Entitlement:
      'ส',

    System:
      'ร',

    Account:
      'บ',

    Holiday:
      'ว',
  };

  return (
    symbols[category] ||
    'ร'
  );
};

/* =========================
   Leave Type
========================= */

const translateLeaveType = (
  value,
) => {
  const labels = {
    Annual:
      'ลาพักร้อน',

    'Annual Leave':
      'ลาพักร้อน',

    Sick:
      'ลาป่วย',

    'Sick Leave':
      'ลาป่วย',

    Personal:
      'ลากิจ',

    'Personal Leave':
      'ลากิจ',

    Maternity:
      'ลาคลอด',

    'Maternity Leave':
      'ลาคลอด',

    Paternity:
      'ลาเพื่อดูแลบุตร',

    'Paternity Leave':
      'ลาเพื่อดูแลบุตร',

    Ordination:
      'ลาอุปสมบท',

    'Ordination Leave':
      'ลาอุปสมบท',

    Military:
      'ลาเพื่อรับราชการทหาร',

    'Military Leave':
      'ลาเพื่อรับราชการทหาร',

    Other:
      'ลาอื่น ๆ',

    'Other Leave':
      'ลาอื่น ๆ',
  };

  return (
    labels[value] ||
    value ||
    'การลา'
  );
};

/* =========================
   Status
========================= */

const translateEmployeeStatus = (
  value,
) => {
  const labels = {
    Active:
      'ใช้งานอยู่',

    Inactive:
      'ไม่ใช้งาน',

    Locked:
      'ถูกล็อก',

    Suspended:
      'ระงับการใช้งาน',

    active:
      'ใช้งานอยู่',

    inactive:
      'ไม่ใช้งาน',

    locked:
      'ถูกล็อก',

    suspended:
      'ระงับการใช้งาน',
  };

  return (
    labels[value] ||
    value
  );
};

const translateUserRole = (
  value,
) => {
  const labels = {
    Employee:
      'พนักงาน',

    Supervisor:
      'หัวหน้างาน',

    HR:
      'HR',

    Admin:
      'ผู้ดูแลระบบ',
  };

  return (
    labels[value] ||
    value
  );
};

/* =========================
   Notification Title
========================= */

const _translateNotificationTitle = (
  title,
) => {
  const text = String(
    title || '',
  ).trim();

  if (!text) {
    return 'การแจ้งเตือน';
  }

  const normalized =
    text.toLowerCase();

  const exactLabels = {
    notification:
      'การแจ้งเตือน',

    'new notification':
      'การแจ้งเตือนใหม่',

    'new leave request':
      'มีคำขอลาใหม่',

    'leave request submitted':
      'ส่งคำขอลาแล้ว',

    'leave request approved':
      'คำขอลาได้รับการอนุมัติ',

    'leave request rejected':
      'คำขอลาถูกปฏิเสธ',

    'leave request cancelled':
      'ยกเลิกคำขอลาแล้ว',

    'pending approval reminder':
      'แจ้งเตือนคำขอรออนุมัติ',

    'new employee account created':
      'สร้างบัญชีพนักงานใหม่แล้ว',

    'employee account created':
      'สร้างบัญชีพนักงานแล้ว',

    'employee created':
      'เพิ่มพนักงานแล้ว',

    'employee information updated':
      'อัปเดตข้อมูลพนักงานแล้ว',

    'employee updated':
      'อัปเดตข้อมูลพนักงานแล้ว',

    'employee status changed':
      'เปลี่ยนสถานะพนักงานแล้ว',

    'leave entitlement updated':
      'อัปเดตสิทธิ์การลาแล้ว',

    'entitlement updated':
      'อัปเดตสิทธิ์การลาแล้ว',

    'leave entitlement created':
      'เพิ่มสิทธิ์การลาแล้ว',

    'holiday information updated':
      'อัปเดตข้อมูลวันหยุดแล้ว',

    'holiday updated':
      'อัปเดตข้อมูลวันหยุดแล้ว',

    'holiday added':
      'เพิ่มวันหยุดแล้ว',

    'holiday created':
      'เพิ่มวันหยุดแล้ว',

    'leave type created':
      'เพิ่มประเภทการลาแล้ว',

    'leave type updated':
      'อัปเดตประเภทการลาแล้ว',

    'account status changed':
      'เปลี่ยนสถานะบัญชีแล้ว',

    'user status changed':
      'เปลี่ยนสถานะผู้ใช้งานแล้ว',

    'user account created':
      'สร้างบัญชีผู้ใช้งานแล้ว',

    'user account updated':
      'อัปเดตบัญชีผู้ใช้งานแล้ว',

    'user account locked':
      'บัญชีผู้ใช้ถูกล็อก',

    'new user account created':
      'สร้างบัญชีผู้ใช้ใหม่แล้ว',

    'department information updated':
      'อัปเดตข้อมูลแผนกแล้ว',

    'position created':
      'เพิ่มตำแหน่งแล้ว',

    'account status updated':
      'อัปเดตสถานะบัญชีแล้ว',

    'password changed':
      'เปลี่ยนรหัสผ่านแล้ว',

    'password reset':
      'รีเซ็ตรหัสผ่านแล้ว',

    'password reset completed':
      'รีเซ็ตรหัสผ่านแล้ว',
  };

  if (
    exactLabels[normalized]
  ) {
    return exactLabels[
      normalized
    ];
  }

  if (
    normalized.includes(
      'approved',
    ) &&
    normalized.includes(
      'leave',
    )
  ) {
    return 'คำขอลาได้รับการอนุมัติ';
  }

  if (
    normalized.includes(
      'rejected',
    ) &&
    normalized.includes(
      'leave',
    )
  ) {
    return 'คำขอลาถูกปฏิเสธ';
  }

  if (
    normalized.includes(
      'cancelled',
    ) &&
    normalized.includes(
      'leave',
    )
  ) {
    return 'ยกเลิกคำขอลาแล้ว';
  }

  if (
    normalized.includes(
      'employee',
    ) &&
    normalized.includes(
      'created',
    )
  ) {
    return 'สร้างบัญชีพนักงานใหม่แล้ว';
  }

  if (
    normalized.includes(
      'employee',
    ) &&
    normalized.includes(
      'updated',
    )
  ) {
    return 'อัปเดตข้อมูลพนักงานแล้ว';
  }

  if (
    normalized.includes(
      'entitlement',
    ) &&
    normalized.includes(
      'updated',
    )
  ) {
    return 'อัปเดตสิทธิ์การลาแล้ว';
  }

  if (
    normalized.includes(
      'holiday',
    ) &&
    normalized.includes(
      'updated',
    )
  ) {
    return 'อัปเดตข้อมูลวันหยุดแล้ว';
  }

  if (
    normalized.includes(
      'password',
    ) &&
    normalized.includes(
      'reset',
    )
  ) {
    return 'รีเซ็ตรหัสผ่านแล้ว';
  }

  return text;
};

/* =========================
   Notification Message
========================= */

const _translateNotificationMessage = (
  message,
) => {
  const text = String(
    message || '',
  ).trim();

  if (!text) {
    return '';
  }

  let match;

  /*
   * Employee:
   * Your leave request LR-... was approved.
   */
  match = text.match(
    /^Your leave request (.+?) was approved\.?$/i,
  );

  if (match) {
    return `คำขอลา ${match[1]} ของคุณได้รับการอนุมัติแล้ว`;
  }

  /*
   * Employee:
   * Your leave request LR-... was rejected. Reason: ...
   */
  match = text.match(
    /^Your leave request (.+?) was rejected(?:\.\s*Reason:\s*(.+?))?\.?$/i,
  );

  if (match) {
    return match[2]
      ? `คำขอลา ${match[1]} ของคุณถูกปฏิเสธ เหตุผล: ${match[2]}`
      : `คำขอลา ${match[1]} ของคุณถูกปฏิเสธ`;
  }

  /*
   * Leave request LR-... was cancelled.
   */
  match = text.match(
    /^Leave request (.+?) was cancelled\.?$/i,
  );

  if (match) {
    return `ยกเลิกคำขอลา ${match[1]} แล้ว`;
  }

  /*
   * Employee User submitted leave request LR-... for approval.
   */
  match = text.match(
    /^(.+?) submitted leave request (.+?) for approval\.?$/i,
  );

  if (match) {
    return `${match[1]} ส่งคำขอลา ${match[2]} เพื่อรอการอนุมัติ`;
  }

  /*
   * Employee User submitted Annual Leave request LR-...
   */
  match = text.match(
    /^(.+?) submitted (Annual Leave|Sick Leave|Personal Leave|Maternity Leave|Paternity Leave|Ordination Leave|Military Leave|Other Leave) request (.+?)(?: for approval)?\.?$/i,
  );

  if (match) {
    return `${match[1]} ส่งคำขอ${translateLeaveType(
      match[2],
    )} ${match[3]} เพื่อรอการอนุมัติ`;
  }

  /*
   * Supervisor User approved Annual Leave request LR-...
   */
  match = text.match(
    /^(.+?) approved (Annual Leave|Sick Leave|Personal Leave|Maternity Leave|Paternity Leave|Ordination Leave|Military Leave|Other Leave) request (.+?)\.?$/i,
  );

  if (match) {
    return `หัวหน้างานอนุมัติคำขอ${translateLeaveType(
      match[2],
    )} ${match[3]} แล้ว`;
  }

  /*
   * Supervisor User approved leave request LR-...
   */
  match = text.match(
    /^(.+?) approved leave request (.+?)\.?$/i,
  );

  if (match) {
    return `หัวหน้างานอนุมัติคำขอลา ${match[2]} แล้ว`;
  }

  /*
   * Personal Leave request LR-... was rejected by the supervisor.
   */
  match = text.match(
    /^(Annual Leave|Sick Leave|Personal Leave|Maternity Leave|Paternity Leave|Ordination Leave|Military Leave|Other Leave) request (.+?) was rejected by the supervisor\.?$/i,
  );

  if (match) {
    return `คำขอ${translateLeaveType(
      match[1],
    )} ${match[2]} ถูกหัวหน้างานปฏิเสธแล้ว`;
  }

  /*
   * Leave request LR-... was rejected by the supervisor.
   */
  match = text.match(
    /^Leave request (.+?) was rejected by the supervisor\.?$/i,
  );

  if (match) {
    return `คำขอลา ${match[1]} ถูกหัวหน้างานปฏิเสธแล้ว`;
  }

  /*
   * The employee account for Thanawat Meechai (EMP006)
   * was created successfully.
   */
  match = text.match(
    /^The employee account for (.+?) was created successfully\.?$/i,
  );

  if (match) {
    return `สร้างบัญชีพนักงานสำหรับ ${match[1]} สำเร็จแล้ว`;
  }

  /*
   * Employee account for ...
   */
  match = text.match(
    /^Employee account for (.+?) was created successfully\.?$/i,
  );

  if (match) {
    return `สร้างบัญชีพนักงานสำหรับ ${match[1]} สำเร็จแล้ว`;
  }

  /*
   * Created employee account for ...
   */
  match = text.match(
    /^Created employee account for (.+?)\.?$/i,
  );

  if (match) {
    return `สร้างบัญชีพนักงานสำหรับ ${match[1]} สำเร็จแล้ว`;
  }

  /*
   * Updated Annual Leave entitlement for Employee User to 10 days.
   */
  match = text.match(
    /^Updated (Annual Leave|Sick Leave|Personal Leave|Maternity Leave|Paternity Leave|Ordination Leave|Military Leave|Other Leave) entitlement for (.+?) to (.+?) days?\.?$/i,
  );

  if (match) {
    return `อัปเดตสิทธิ์${translateLeaveType(
      match[1],
    )}ของ ${match[2]} เป็น ${match[3]} วันแล้ว`;
  }

  /*
   * Annual Leave entitlement for Employee User was updated to 10 days.
   */
  match = text.match(
    /^(Annual Leave|Sick Leave|Personal Leave|Maternity Leave|Paternity Leave|Ordination Leave|Military Leave|Other Leave) entitlement for (.+?) was updated to (.+?) days?\.?$/i,
  );

  if (match) {
    return `อัปเดตสิทธิ์${translateLeaveType(
      match[1],
    )}ของ ${match[2]} เป็น ${match[3]} วันแล้ว`;
  }

  /*
   * Updated Annual Leave entitlement for employee EMP001.
   */
  match = text.match(
    /^Updated (Annual Leave|Sick Leave|Personal Leave|Maternity Leave|Paternity Leave|Ordination Leave|Military Leave|Other Leave) entitlement for employee (.+?)\.?$/i,
  );

  if (match) {
    return `อัปเดตสิทธิ์${translateLeaveType(
      match[1],
    )}ของพนักงาน ${match[2]} แล้ว`;
  }

  /*
   * Buddhist Lent Day was added to the organization holiday calendar.
   */
  match = text.match(
    /^Buddhist Lent Day was added to (?:the )?(?:organization|company|corporate) holiday calendar\.?$/i,
  );

  if (match) {
    return 'เพิ่มวันเข้าพรรษาลงในปฏิทินวันหยุดขององค์กรแล้ว';
  }

  /*
   * Holiday ... was added ...
   */
  match = text.match(
    /^(.+?) was added to (?:the )?(?:organization|company|corporate) holiday calendar\.?$/i,
  );

  if (match) {
    return `เพิ่ม ${match[1]} ลงในปฏิทินวันหยุดขององค์กรแล้ว`;
  }

  /*
   * The employment status of employee EMP005 was changed to Active.
   */
  match = text.match(
    /^The employment status of employee (.+?) was changed to (.+?)\.?$/i,
  );

  if (match) {
    return `เปลี่ยนสถานะการทำงานของพนักงาน ${match[1]} เป็น ${translateEmployeeStatus(
      match[2],
    )} แล้ว`;
  }

  /*
   * Employee EMP005 status was changed to Active.
   */
  match = text.match(
    /^Employee (.+?) status was changed to (.+?)\.?$/i,
  );

  if (match) {
    return `เปลี่ยนสถานะของพนักงาน ${match[1]} เป็น ${translateEmployeeStatus(
      match[2],
    )} แล้ว`;
  }

  /*
   * User account ... status changed to ...
   */
  match = text.match(
    /^(?:The )?user account (.+?) status was changed to (.+?)\.?$/i,
  );

  if (match) {
    return `เปลี่ยนสถานะบัญชี ${match[1]} เป็น ${translateEmployeeStatus(
      match[2],
    )} แล้ว`;
  }

  /*
   * Password for ... was reset successfully.
   */
  match = text.match(
    /^Password for (.+?) was reset successfully\.?$/i,
  );

  if (match) {
    return `รีเซ็ตรหัสผ่านของ ${match[1]} สำเร็จแล้ว`;
  }

  /*
   * Password was changed successfully.
   */
  if (
    /^Password was changed successfully\.?$/i.test(
      text,
    )
  ) {
    return 'เปลี่ยนรหัสผ่านสำเร็จแล้ว';
  }

  /*
   * The account employee005 was locked
   * after multiple failed login attempts.
   */
  match = text.match(
    /^The account (.+?) was locked after multiple failed login attempts\.?$/i,
  );

  if (match) {
    return `บัญชี ${match[1]} ถูกล็อกหลังจากพยายามเข้าสู่ระบบไม่สำเร็จหลายครั้ง`;
  }

  /*
   * The account employee006 was created
   * and assigned the Employee role.
   */
  match = text.match(
    /^The account (.+?) was created and assigned the (Employee|Supervisor|HR|Admin) role\.?$/i,
  );

  if (match) {
    return `สร้างบัญชี ${match[1]} และกำหนดบทบาทเป็น ${translateUserRole(
      match[2],
    )} แล้ว`;
  }

  /*
   * The Information Technology department
   * information was updated.
   */
  match = text.match(
    /^The (.+?) department information was updated\.?$/i,
  );

  if (match) {
    return `อัปเดตข้อมูลแผนก ${match[1]} แล้ว`;
  }

  /*
   * The Marketing Officer position
   * was added to the system.
   */
  match = text.match(
    /^The (.+?) position was added to the system\.?$/i,
  );

  if (match) {
    return `เพิ่มตำแหน่ง ${match[1]} เข้าสู่ระบบแล้ว`;
  }

  /*
   * The account supervisor001
   * was changed to Active.
   */
  match = text.match(
    /^The account (.+?) was changed to (Active|Inactive|Locked|Suspended)\.?$/i,
  );

  if (match) {
    return `เปลี่ยนสถานะบัญชี ${match[1]} เป็น ${translateEmployeeStatus(
      match[2],
    )} แล้ว`;
  }

  return text;
};

/* =========================
   Date
========================= */

const formatDateTime = (
  value,
) => {
  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  const pad = (number) =>
    String(number).padStart(
      2,
      '0',
    );

  return `${pad(
    date.getDate(),
  )}/${pad(
    date.getMonth() + 1,
  )}/${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`;
};

/* =========================
   Component
========================= */

function RoleNotificationPage({
  LayoutComponent,

  pageTitle =
    'การแจ้งเตือน',

  pageDescription = '',

  initialNotifications =
    emptyInitialNotifications,

  theme,
}) {
  const navigate = useNavigate();
  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('All');

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState('All');

  const [
    actionMessage,
    setActionMessage,
  ] = useState(null);

  const [
    notificationMenuAnchorEl,
    setNotificationMenuAnchorEl,
  ] = useState(null);

  const [
    notificationMenuTarget,
    setNotificationMenuTarget,
  ] = useState(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  /* =========================
     Page Title
  ========================= */

  const normalizedPageTitle =
    String(
      pageTitle || '',
    )
      .trim()
      .toLowerCase();

  const displayPageTitle =
    normalizedPageTitle.includes(
      'notification',
    ) ||
    normalizedPageTitle === ''
      ? 'การแจ้งเตือน'
      : pageTitle;

  /*
   * เก็บ prop นี้ไว้เพื่อให้ wrapper เก่า
   * ยังส่ง pageDescription มาได้
   * แต่ไม่แสดง subtitle
   */
  void pageDescription;

  /* =========================
     Normalize
  ========================= */

  const normalizeForPage =
    useCallback(
      (notification) => ({
        ...notification,

        category:
          notification.category ||
          getCategoryFromType(
            notification.type,
          ),
      }),
      [],
    );

  /* =========================
     Load
  ========================= */

  const loadNotifications =
    useCallback(async () => {
      try {
        const result = await getNotifications();
        setNotifications((result?.notifications || []).map((notification) => normalizeForPage({
          ...notification,
          isRead: Boolean(notification.read),
        })));
      } catch (error) {
        setNotifications([]);
        setActionMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถโหลดการแจ้งเตือนได้' });
      }
    }, [
      normalizeForPage,
    ]);

  /* =========================
     Initial Seed
  ========================= */

  /* =========================
     Effects
  ========================= */

  useEffect(() => {
    void initialNotifications;
    loadNotifications();

    setSearchText('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setActionMessage(null);

    const handleWindowFocus =
      () => {
        loadNotifications();
      };

    window.addEventListener(
      'focus',
      handleWindowFocus,
    );

    return () => {
      window.removeEventListener(
        'focus',
        handleWindowFocus,
      );
    };
  }, [
    loadNotifications,
    initialNotifications,
  ]);

  /* =========================
     Categories
  ========================= */

  const categories =
    useMemo(() => {
      const availableCategories =
        notifications
          .map(
            (notification) =>
              notification.category,
          )
          .filter(Boolean);

      return [
        'All',
        ...new Set(
          availableCategories,
        ),
      ];
    }, [notifications]);

  /* =========================
     Filter
  ========================= */

  const filteredNotifications =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return notifications
        .filter(
          (notification) => {
            const translatedTitle =
              formatNotificationTitle(
                notification.title,
              ).toLowerCase();

            const translatedMessage =
              formatNotificationMessage(
                notification.message,
              ).toLowerCase();

            const originalTitle =
              String(
                notification.title ||
                  '',
              ).toLowerCase();

            const originalMessage =
              String(
                notification.message ||
                  '',
              ).toLowerCase();

            const matchesSearch =
              !keyword ||
              translatedTitle.includes(
                keyword,
              ) ||
              translatedMessage.includes(
                keyword,
              ) ||
              originalTitle.includes(
                keyword,
              ) ||
              originalMessage.includes(
                keyword,
              );

            const matchesStatus =
              statusFilter ===
                'All' ||
              (statusFilter ===
                'Unread' &&
                !notification.isRead) ||
              (statusFilter ===
                'Read' &&
                notification.isRead);

            const matchesCategory =
              categoryFilter ===
                'All' ||
              notification.category ===
                categoryFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesCategory
            );
          },
        )
        .sort(
          (
            firstNotification,
            secondNotification,
          ) =>
            new Date(
              secondNotification.createdAt,
            ) -
            new Date(
              firstNotification.createdAt,
            ),
        );
    }, [
      notifications,
      searchText,
      statusFilter,
      categoryFilter,
    ]);

  /* =========================
     Summary
  ========================= */

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead,
    ).length;

  const readCount =
    notifications.filter(
      (notification) =>
        notification.isRead,
    ).length;

  const todayCount =
    useMemo(() => {
      const today =
        new Date();

      return notifications.filter(
        (notification) => {
          const notificationDate =
            new Date(
              notification.createdAt,
            );

          if (
            Number.isNaN(
              notificationDate.getTime(),
            )
          ) {
            return false;
          }

          return (
            notificationDate.getFullYear() ===
              today.getFullYear() &&
            notificationDate.getMonth() ===
              today.getMonth() &&
            notificationDate.getDate() ===
              today.getDate()
          );
        },
      ).length;
    }, [notifications]);

  /* =========================
     Category Style
  ========================= */

  const getCategoryStyle = (
    category,
  ) => {
    const styles = {
      'Leave Request': {
        backgroundColor:
          '#EFF6FF',

        color:
          '#1D4ED8',
      },

      Approval: {
        backgroundColor:
          '#F5F3FF',

        color:
          '#6D28D9',
      },

      Employee: {
        backgroundColor:
          '#ECFDF5',

        color:
          '#047857',
      },

      Entitlement: {
        backgroundColor:
          '#FFF7ED',

        color:
          '#C2410C',
      },

      System: {
        backgroundColor:
          '#FEF3C7',

        color:
          '#B45309',
      },

      Account: {
        backgroundColor:
          '#F3F4F6',

        color:
          '#4B5563',
      },

      Holiday: {
        backgroundColor:
          '#FEF3C7',

        color:
          '#B45309',
      },
    };

    return (
      styles[category] || {
        backgroundColor:
          theme?.soft ||
          '#F3F4F6',

        color:
          theme?.dark ||
          theme?.primary ||
          '#4B5563',
      }
    );
  };

  /* =========================
     Actions
  ========================= */

  const handleMarkAsRead = (
    notificationId,
  ) => {
    const selectedNotification =
      notifications.find(
        (notification) =>
          Number(
            notification.id,
          ) ===
          Number(
            notificationId,
          ),
      );

    if (
      !selectedNotification
    ) {
      return;
    }

    const updatedNotification = markNotificationAsRead(notificationId);

    if (
      !updatedNotification
    ) {
      setActionMessage({
        severity:
          'error',

        text:
          'ไม่สามารถเปลี่ยนสถานะการแจ้งเตือนได้',
      });

      return;
    }

    updatedNotification.then(loadNotifications).catch((error) => {
      setActionMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะการแจ้งเตือนได้' });
    });

    setActionMessage({
      severity:
        'success',

      text:
        `ทำเครื่องหมาย "${formatNotificationTitle(
          selectedNotification.title,
        )}" ว่าอ่านแล้ว`,
    });
  };

  const handleMarkAllAsRead =
    () => {
      if (
        unreadCount === 0
      ) {
        setActionMessage({
          severity:
            'info',

          text:
            'การแจ้งเตือนทั้งหมดถูกอ่านแล้ว',
        });

        return;
      }

      const updatedCount = unreadCount;
      markAllNotificationsAsRead().then(loadNotifications).catch((error) => {
        setActionMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถเปลี่ยนสถานะการแจ้งเตือนได้' });
      });

      setActionMessage({
        severity:
          'success',

        text:
          `ทำเครื่องหมายว่าอ่านแล้ว ${updatedCount} รายการ`,
      });
    };

  const handleOpenNotification = (notification) => {
    if (!notification?.path) return;
    if (!notification.isRead) markNotificationAsRead(notification.id).catch(() => {});
    navigate(notification.path);
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
      setActionMessage({ severity: 'success', text: 'ลบการแจ้งเตือนเรียบร้อยแล้ว' });
      return true;
    } catch (error) {
      setActionMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถลบการแจ้งเตือนได้' });
      return false;
    }
  };

  const handleOpenNotificationMenu = (event, notification) => {
    event.stopPropagation();
    setNotificationMenuAnchorEl(event.currentTarget);
    setNotificationMenuTarget(notification);
  };

  const handleCloseNotificationMenu = (event) => {
    event?.stopPropagation?.();
    setNotificationMenuAnchorEl(null);
    setNotificationMenuTarget(null);
  };

  const handleRequestDeleteNotification = (event) => {
    event?.stopPropagation?.();
    setDeleteTarget(notificationMenuTarget);
    setNotificationMenuAnchorEl(null);
    setNotificationMenuTarget(null);
  };

  const handleCloseDeleteDialog = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };

  const handleConfirmDeleteNotification = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    const deleted = await handleDeleteNotification(deleteTarget.id);
    setIsDeleting(false);

    if (deleted) {
      setDeleteTarget(null);
    }
  };

  const handleClearFilters =
    () => {
      setSearchText('');
      setStatusFilter('All');
      setCategoryFilter('All');
      setActionMessage(null);
    };

  /* =========================
     Summary Cards
  ========================= */

  const summaryCards = [
    {
      title:
        'การแจ้งเตือนทั้งหมด',

      value:
        notifications.length,

      color:
        theme?.primary ||
        '#2563EB',
    },

    {
      title:
        'ยังไม่ได้อ่าน',

      value:
        unreadCount,

      color:
        '#DC2626',
    },

    {
      title:
        'อ่านแล้ว',

      value:
        readCount,

      color:
        '#059669',
    },

    {
      title:
        'ได้รับวันนี้',

      value:
        todayCount,

      color:
        '#D97706',
    },
  ];

  /* =========================
     UI
  ========================= */

  return (
    <LayoutComponent
      activeMenu="Notification"
    >
      {/* Header */}

      <Box
        sx={{
          display:
            'flex',

          alignItems: {
            xs:
              'flex-start',

            sm:
              'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs:
              'column',

            sm:
              'row',
          },

          gap:
            '16px',

          marginBottom:
            '24px',
        }}
      >
        <Typography
          component="h1"
          sx={{
            color:
              '#111827',

            fontSize: {
              xs:
                '26px',

              sm:
                '30px',
            },

            fontWeight:
              800,
          }}
        >
          {displayPageTitle}
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleMarkAllAsRead
          }
          disabled={
            unreadCount === 0
          }
          sx={{
            minWidth:
              '140px',

            height:
              '42px',

            padding:
              '0 18px',

            backgroundColor:
              theme?.primary,

            color:
              '#FFFFFF',

            borderRadius:
              '9px',

            fontSize:
              '12px',

            fontWeight:
              700,

            textTransform:
              'none',

            boxShadow:
              'none',

            '&:hover': {
              backgroundColor:
                theme?.dark,

              boxShadow:
                'none',
            },
          }}
        >
          อ่านทั้งหมด
        </Button>
      </Box>

      {/* Message */}

      {actionMessage && (
        <Alert
          severity={
            actionMessage.severity
          }
          onClose={() =>
            setActionMessage(
              null,
            )
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {
            actionMessage.text
          }
        </Alert>
      )}

      {/* Summary */}

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            sm:
              'repeat(2, minmax(0, 1fr))',

            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '18px',

          marginBottom:
            '24px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <Paper
              key={
                card.title
              }
              elevation={0}
              sx={{
                minHeight:
                  '142px',

                padding:
                  '20px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '14px',

                boxSizing:
                  'border-box',
              }}
            >
              <Box
                sx={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'space-between',

                  gap:
                    '12px',
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '12px',

                    fontWeight:
                      700,
                  }}
                >
                  {card.title}
                </Typography>

                <Box
                  sx={{
                    width:
                      '9px',

                    height:
                      '9px',

                    flexShrink:
                      0,

                    backgroundColor:
                      card.color,

                    borderRadius:
                      '50%',

                    boxShadow:
                      `0 0 0 4px ${card.color}14`,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '32px',

                  fontWeight:
                    800,

                  lineHeight:
                    1.2,

                  marginTop:
                    '14px',
                }}
              >
                {card.value}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#94A3B8',

                  fontSize:
                    '11px',

                  marginTop:
                    '13px',
                }}
              >
                {card.title ===
                'การแจ้งเตือนทั้งหมด'
                  ? 'รายการแจ้งเตือนทั้งหมด'
                  : card.title ===
                      'ยังไม่ได้อ่าน'
                    ? 'รายการที่ยังไม่ได้เปิดอ่าน'
                    : card.title ===
                        'อ่านแล้ว'
                      ? 'รายการที่อ่านเรียบร้อยแล้ว'
                      : 'รายการที่ได้รับในวันนี้'}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* Notification List */}

      <Paper
        elevation={0}
        sx={{
          width:
            '100%',

          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '14px',

          overflow:
            'hidden',
        }}
      >
        {/* Filters */}

        <Box
          sx={{
            padding:
              '20px 22px',

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '17px',

              fontWeight:
                800,
            }}
          >
            รายการแจ้งเตือน
          </Typography>

          <Typography
            sx={{
              color:
                '#64748B',

              fontSize:
                '12px',

              marginTop:
                '4px',
            }}
          >
            แสดง{' '}
            {
              filteredNotifications.length
            }{' '}
            จาก{' '}
            {
              notifications.length
            }{' '}
            รายการ
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                lg:
                  'minmax(260px, 1.5fr) repeat(2, minmax(160px, 0.8fr)) auto',
              },

              gap:
                '12px',

              marginTop:
                '18px',
            }}
          >
            {/* Search */}

            <TextField
              fullWidth
              label="ค้นหาการแจ้งเตือน"
              placeholder="หัวข้อหรือรายละเอียด"
              value={
                searchText
              }
              onChange={(
                event,
              ) =>
                setSearchText(
                  event.target.value,
                )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    height:
                      '46px',

                    borderRadius:
                      '9px',

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          theme?.primary,
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      theme?.primary,
                  },
              }}
            />

            {/* Status */}

            <FormControl
              fullWidth
            >
              <InputLabel id="notification-status-filter-label">
                สถานะ
              </InputLabel>

              <Select
                labelId="notification-status-filter-label"
                value={
                  statusFilter
                }
                label="สถานะ"
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height:
                    '46px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="All">
                  ทุกสถานะ
                </MenuItem>

                <MenuItem value="Unread">
                  ยังไม่ได้อ่าน
                </MenuItem>

                <MenuItem value="Read">
                  อ่านแล้ว
                </MenuItem>
              </Select>
            </FormControl>

            {/* Category */}

            <FormControl
              fullWidth
            >
              <InputLabel id="notification-category-filter-label">
                หมวดหมู่
              </InputLabel>

              <Select
                labelId="notification-category-filter-label"
                value={
                  categoryFilter
                }
                label="หมวดหมู่"
                onChange={(
                  event,
                ) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height:
                    '46px',

                  borderRadius:
                    '9px',
                }}
              >
                {categories.map(
                  (category) => (
                    <MenuItem
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {category ===
                      'All'
                        ? 'ทุกหมวดหมู่'
                        : translateCategory(
                            category,
                          )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* Clear */}

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth:
                  '105px',

                height:
                  '46px',

                padding:
                  '0 14px',

                color:
                  '#475569',

                borderColor:
                  '#CBD5E1',

                borderRadius:
                  '9px',

                fontSize:
                  '11px',

                fontWeight:
                  700,

                whiteSpace:
                  'nowrap',

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#F8FAFC',

                  borderColor:
                    '#94A3B8',
                },
              }}
            >
              ล้างตัวกรอง
            </Button>
          </Box>
        </Box>

        {/* Items */}

        {filteredNotifications.length >
        0 ? (
          <Box>
            {filteredNotifications.map(
              (
                notification,
                index,
              ) => {
                const categoryStyle =
                  getCategoryStyle(
                    notification.category,
                  );

                return (
                  <Box
                    key={
                      notification.id
                    }
                    role={notification.path ? 'button' : undefined}
                    tabIndex={notification.path ? 0 : undefined}
                    onClick={() => handleOpenNotification(notification)}
                    onKeyDown={(event) => {
                      if (notification.path && ['Enter', ' '].includes(event.key)) handleOpenNotification(notification);
                    }}
                    sx={{
                      display:
                        'flex',

                      alignItems: {
                        xs:
                          'flex-start',

                        md:
                          'center',
                      },

                      flexDirection: {
                        xs:
                          'column',

                        md:
                          'row',
                      },

                      gap:
                        '16px',

                      cursor: notification.path ? 'pointer' : 'default',

                      padding: {
                        xs:
                          '20px',

                        sm:
                          '20px 22px',
                      },

                      backgroundColor:
                        notification.isRead
                          ? '#FFFFFF'
                          : theme?.unreadBackground ||
                            theme?.soft ||
                            '#F8FAFC',

                      borderLeft:
                        notification.isRead
                          ? '4px solid transparent'
                          : `4px solid ${
                              theme?.primary ||
                              '#2563EB'
                            }`,

                      borderBottom:
                        index ===
                        filteredNotifications.length -
                          1
                          ? 'none'
                          : '1px solid #E5E7EB',

                      '&:hover': {
                        backgroundColor:
                          notification.isRead
                            ? '#F8FAFC'
                            : theme?.soft ||
                              '#F8FAFC',
                      },
                    }}
                  >
                    {/* Symbol */}

                    <Box
                      sx={{
                        width:
                          '44px',

                        height:
                          '44px',

                        flexShrink:
                          0,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        backgroundColor:
                          categoryStyle.backgroundColor,

                        color:
                          categoryStyle.color,

                        borderRadius:
                          '11px',

                        fontSize:
                          '15px',

                        fontWeight:
                          800,
                      }}
                    >
                      {getCategorySymbol(
                        notification.category,
                      )}
                    </Box>

                    {/* Content */}

                    <Box
                      sx={{
                        minWidth:
                          0,

                        flex:
                          1,
                      }}
                    >
                      <Box
                        sx={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          flexWrap:
                            'wrap',

                          gap:
                            '8px',
                        }}
                      >
                        <Typography
                          sx={{
                            color:
                              '#111827',

                            fontSize:
                              '14px',

                            fontWeight:
                              notification.isRead
                                ? 700
                                : 800,
                          }}
                        >
                          {formatNotificationTitle(
                            notification.title,
                          )}
                        </Typography>

                        {!notification.isRead && (
                          <Chip
                            label="ใหม่"
                            size="small"
                            sx={{
                              height:
                                '23px',

                              backgroundColor:
                                theme?.soft,

                              color:
                                theme?.primary,

                              borderRadius:
                                '999px',

                              fontSize:
                                '9px',

                              fontWeight:
                                700,
                            }}
                          />
                        )}

                        <Chip
                          label={translateCategory(
                            notification.category,
                          )}
                          size="small"
                          sx={{
                            height:
                              '23px',

                            backgroundColor:
                              categoryStyle.backgroundColor,

                            color:
                              categoryStyle.color,

                            borderRadius:
                              '999px',

                            fontSize:
                              '9px',

                            fontWeight:
                              700,
                          }}
                        />
                      </Box>

                      <Typography
                        sx={{
                          color:
                            '#475569',

                          fontSize:
                            '12px',

                          lineHeight:
                            1.7,

                          marginTop:
                            '6px',

                          wordBreak:
                            'break-word',
                        }}
                      >
                        {formatNotificationMessage(
                          notification.message,
                        )}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#94A3B8',

                          fontSize:
                            '10px',

                          marginTop:
                            '6px',
                        }}
                      >
                        {formatDateTime(
                          notification.createdAt,
                        )}
                      </Typography>
                    </Box>

                    {/* Status / Actions */}

                    <Box
                      sx={{
                        flexShrink: 0,
                        width: { xs: '100%', md: 'auto' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'flex-end', md: 'flex-start' },
                        gap: '6px',
                      }}
                    >
                      {notification.isRead ? (
                        <Chip
                          label="อ่านแล้ว"
                          size="small"
                          sx={{
                            minWidth: '68px',
                            height: '27px',
                            backgroundColor: '#F1F5F9',
                            color: '#64748B',
                            borderRadius: '999px',
                            fontSize: '9px',
                            fontWeight: 700,
                          }}
                        />
                      ) : (
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          sx={{
                            minWidth: '105px',
                            height: '34px',
                            padding: '0 12px',
                            backgroundColor: '#FFFFFF',
                            color: theme?.primary,
                            borderColor: theme?.primary,
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: theme?.soft,
                              borderColor: theme?.dark,
                            },
                          }}
                        >
                          ทำเครื่องหมายว่าอ่านแล้ว
                        </Button>
                      )}

                      <IconButton
                        type="button"
                        aria-label="ตัวเลือกการแจ้งเตือน"
                        aria-haspopup="menu"
                        aria-expanded={
                          notificationMenuTarget?.id === notification.id
                            ? 'true'
                            : undefined
                        }
                        size="small"
                        onClick={(event) =>
                          handleOpenNotificationMenu(event, notification)
                        }
                        sx={{
                          width: '32px',
                          height: '32px',
                          color: '#64748B',
                          borderRadius: '8px',
                          transition: 'background-color 180ms ease, color 180ms ease',
                          '&:hover': {
                            color: '#334155',
                            backgroundColor: '#F1F5F9',
                          },
                          '&:focus-visible': {
                            color: '#334155',
                            backgroundColor: '#F1F5F9',
                          },
                        }}
                      >
                        <MoreVertRounded sx={{ fontSize: '20px' }} />
                      </IconButton>
                    </Box>
                  </Box>
                );
              },
            )}
          </Box>
        ) : (
          /* Empty */

          <Box
            sx={{
              minHeight:
                '280px',

              padding:
                '40px 24px',

              display:
                'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              justifyContent:
                'center',

              textAlign:
                'center',
            }}
          >
            <Box
              sx={{
                width:
                  '56px',

                height:
                  '56px',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                backgroundColor:
                  theme?.soft,

                color:
                  theme?.primary,

                borderRadius:
                  '50%',

                fontSize:
                  '20px',

                fontWeight:
                  800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '15px',

                fontWeight:
                  800,

                marginTop:
                  '14px',
              }}
            >
              ไม่พบการแจ้งเตือน
            </Typography>

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                marginTop:
                  '5px',
              }}
            >
              ลองเปลี่ยนหรือล้างตัวกรอง
            </Typography>

            {(searchText ||
              statusFilter !==
                'All' ||
              categoryFilter !==
                'All') && (
              <Button
                type="button"
                variant="outlined"
                onClick={
                  handleClearFilters
                }
                sx={{
                  height:
                    '40px',

                  marginTop:
                    '18px',

                  padding:
                    '0 16px',

                  color:
                    theme?.primary,

                  borderColor:
                    theme?.primary,

                  borderRadius:
                    '8px',

                  fontSize:
                    '11px',

                  fontWeight:
                    700,

                  textTransform:
                    'none',

                  '&:hover':
                    {
                      backgroundColor:
                        theme?.soft,

                      borderColor:
                        theme?.dark,
                    },
                }}
              >
                ล้างตัวกรอง
              </Button>
            )}
          </Box>
        )}
      </Paper>

      <Menu
        anchorEl={notificationMenuAnchorEl}
        open={Boolean(notificationMenuAnchorEl)}
        onClose={handleCloseNotificationMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: '180px',
              marginTop: '4px',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.10)',
            },
          },
        }}
      >
        <MenuItem
          onClick={handleRequestDeleteNotification}
          sx={{
            minHeight: '40px',
            gap: '10px',
            color: '#DC2626',
            fontSize: '12px',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: '#FEF2F2',
            },
          }}
        >
          <DeleteOutlineRounded sx={{ fontSize: '18px' }} />
          ลบการแจ้งเตือน
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '14px',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#111827',
            fontSize: '18px',
            fontWeight: 800,
            padding: '22px 24px 8px',
          }}
        >
          ลบการแจ้งเตือนนี้?
        </DialogTitle>

        <DialogContent sx={{ padding: '8px 24px 10px' }}>
          <Typography
            sx={{
              color: '#64748B',
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            เมื่อลบแล้ว การแจ้งเตือนนี้จะไม่สามารถกู้คืนได้
          </Typography>

          {deleteTarget && (
            <Box
              sx={{
                marginTop: '14px',
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
              }}
            >
              <Typography
                sx={{
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {formatNotificationTitle(deleteTarget.title)}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding: '12px 24px 22px',
            gap: '8px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={handleCloseDeleteDialog}
            disabled={isDeleting}
            sx={{
              minWidth: '88px',
              height: '38px',
              color: '#475569',
              borderColor: '#CBD5E1',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#F8FAFC',
                borderColor: '#94A3B8',
              },
            }}
          >
            ยกเลิก
          </Button>

          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={handleConfirmDeleteNotification}
            disabled={isDeleting}
            sx={{
              minWidth: '88px',
              height: '38px',
              borderRadius: '9px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {isDeleting ? 'กำลังลบ...' : 'ลบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RoleNotificationPage;
