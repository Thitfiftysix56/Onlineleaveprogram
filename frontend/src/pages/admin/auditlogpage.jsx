import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  CalendarMonthRounded,
} from '@mui/icons-material';

import AdminLayout from '../../layouts/adminlayout.jsx';
import api from '../../api/axios.js';
import {
  formatAuditActivity,
  formatAuditDetail,
} from '../../utils/presentationformatter.js';

/* =========================
   Theme
========================= */

const adminTheme = {
  primary: '#EA580C',
  dark: '#C2410C',
  soft: '#FFF7ED',
};

/* =========================
   Demo Audit Data
========================= */

const auditLogs = [
  {
    id: 1,
    createdAt:
      '2026-07-21T09:45:00',
    username:
      'admin001',
    employeeName:
      'Preecha Wongchai',
    role:
      'Admin',
    action:
      'UPDATE_USER_STATUS',
    tableName:
      'users',
    recordId:
      5,
    ipAddress:
      '192.168.1.25',
    detail:
      'Changed user employee005 account status from Active to Locked.',
  },
  {
    id: 2,
    createdAt:
      '2026-07-21T09:30:00',
    username:
      'employee001',
    employeeName:
      'Employee User',
    role:
      'Employee',
    action:
      'LOGIN',
    tableName:
      'users',
    recordId:
      1,
    ipAddress:
      '192.168.1.18',
    detail:
      'User logged in successfully.',
  },
  {
    id: 3,
    createdAt:
      '2026-07-21T09:10:00',
    username:
      'admin001',
    employeeName:
      'Preecha Wongchai',
    role:
      'Admin',
    action:
      'CREATE_USER',
    tableName:
      'users',
    recordId:
      6,
    ipAddress:
      '192.168.1.25',
    detail:
      'Created user account employee006 with the Employee role.',
  },
  {
    id: 4,
    createdAt:
      '2026-07-21T08:55:00',
    username:
      'supervisor001',
    employeeName:
      'Nattapong Srisuk',
    role:
      'Supervisor',
    action:
      'APPROVE_LEAVE',
    tableName:
      'leave_requests',
    recordId:
      12,
    ipAddress:
      '192.168.1.20',
    detail:
      'Approved leave request LR-20260720-0012 submitted by EMP001.',
  },
  {
    id: 5,
    createdAt:
      '2026-07-20T16:20:00',
    username:
      'hr001',
    employeeName:
      'Suda Rattanapong',
    role:
      'HR',
    action:
      'UPDATE_EMPLOYEE',
    tableName:
      'employees',
    recordId:
      5,
    ipAddress:
      '192.168.1.22',
    detail:
      'Updated employee EMP005 contact and employment information.',
  },
  {
    id: 6,
    createdAt:
      '2026-07-20T15:30:00',
    username:
      'admin001',
    employeeName:
      'Preecha Wongchai',
    role:
      'Admin',
    action:
      'UPDATE_DEPARTMENT',
    tableName:
      'departments',
    recordId:
      1,
    ipAddress:
      '192.168.1.25',
    detail:
      'Updated Information Technology department information.',
  },
  {
    id: 7,
    createdAt:
      '2026-07-20T14:05:00',
    username:
      'employee001',
    employeeName:
      'Employee User',
    role:
      'Employee',
    action:
      'SUBMIT_LEAVE',
    tableName:
      'leave_requests',
    recordId:
      13,
    ipAddress:
      '192.168.1.18',
    detail:
      'Submitted Annual Leave request LR-20260720-0013.',
  },
  {
    id: 8,
    createdAt:
      '2026-07-20T13:15:00',
    username:
      'hr001',
    employeeName:
      'Suda Rattanapong',
    role:
      'HR',
    action:
      'UPDATE_ENTITLEMENT',
    tableName:
      'leave_entitlements',
    recordId:
      8,
    ipAddress:
      '192.168.1.22',
    detail:
      'Updated Annual Leave entitlement for employee EMP001.',
  },
  {
    id: 9,
    createdAt:
      '2026-07-19T11:40:00',
    username:
      'supervisor001',
    employeeName:
      'Nattapong Srisuk',
    role:
      'Supervisor',
    action:
      'REJECT_LEAVE',
    tableName:
      'leave_requests',
    recordId:
      11,
    ipAddress:
      '192.168.1.20',
    detail:
      'Rejected leave request LR-20260719-0011 and recorded the rejection reason.',
  },
  {
    id: 10,
    createdAt:
      '2026-07-19T10:25:00',
    username:
      'employee001',
    employeeName:
      'Employee User',
    role:
      'Employee',
    action:
      'UPLOAD_ATTACHMENT',
    tableName:
      'leave_attachments',
    recordId:
      4,
    ipAddress:
      '192.168.1.18',
    detail:
      'Uploaded attachment medical-certificate.pdf to leave request 10.',
  },
  {
    id: 11,
    createdAt:
      '2026-07-18T17:05:00',
    username:
      'hr001',
    employeeName:
      'Suda Rattanapong',
    role:
      'HR',
    action:
      'EXPORT_REPORT',
    tableName:
      'leave_requests',
    recordId:
      null,
    ipAddress:
      '192.168.1.22',
    detail:
      'Exported the leave request report in Excel format.',
  },
  {
    id: 12,
    createdAt:
      '2026-07-18T16:40:00',
    username:
      'admin001',
    employeeName:
      'Preecha Wongchai',
    role:
      'Admin',
    action:
      'LOGOUT',
    tableName:
      'users',
    recordId:
      3,
    ipAddress:
      '192.168.1.25',
    detail:
      'User logged out successfully.',
  },
];

/* =========================
   Helpers
========================= */

const normalizeValue = (
  value,
) =>
  String(value || '')
    .trim()
    .toLowerCase();

const translateRole = (
  role,
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
    labels[role] ||
    role ||
    '-'
  );
};

const _translateAction = (
  action,
) => {
  const normalized =
    String(
      action || '',
    ).toUpperCase();

  const labels = {
    LOGIN:
      'เข้าสู่ระบบ',

    LOGOUT:
      'ออกจากระบบ',

    LOGIN_FAILED:
      'เข้าสู่ระบบไม่สำเร็จ',

    CREATE_USER:
      'สร้างบัญชีผู้ใช้',

    UPDATE_USER:
      'แก้ไขบัญชีผู้ใช้',

    UPDATE_USER_STATUS:
      'เปลี่ยนสถานะบัญชี',

    CREATE_LEAVE:
      'สร้างคำขอลา',

    SUBMIT_LEAVE:
      'ส่งคำขอลา',

    APPROVE_LEAVE:
      'อนุมัติคำขอลา',

    REJECT_LEAVE:
      'ปฏิเสธคำขอลา',

    CANCEL_LEAVE:
      'ยกเลิกคำขอลา',

    CREATE_EMPLOYEE:
      'เพิ่มพนักงาน',

    UPDATE_EMPLOYEE:
      'แก้ไขข้อมูลพนักงาน',

    UPDATE_ENTITLEMENT:
      'อัปเดตสิทธิ์การลา',

    CREATE_DEPARTMENT:
      'เพิ่มแผนก',

    UPDATE_DEPARTMENT:
      'แก้ไขข้อมูลแผนก',

    CREATE_POSITION:
      'เพิ่มตำแหน่ง',

    UPDATE_POSITION:
      'แก้ไขข้อมูลตำแหน่ง',

    UPLOAD_ATTACHMENT:
      'อัปโหลดเอกสาร',

    DELETE_ATTACHMENT:
      'ลบเอกสาร',

    EXPORT_REPORT:
      'ส่งออกรายงาน',

    CHANGE_PASSWORD:
      'เปลี่ยนรหัสผ่าน',

    RESET_PASSWORD:
      'รีเซ็ตรหัสผ่าน',
  };

  return (
    labels[normalized] ||
    String(
      action || '-',
    )
  );
};

const translateTable = (
  tableName,
) => {
  const labels = {
    users:
      'บัญชีผู้ใช้',

    employees:
      'พนักงาน',

    departments:
      'แผนก',

    positions:
      'ตำแหน่ง',

    leave_requests:
      'คำขอลา',

    leave_entitlements:
      'สิทธิ์การลา',

    leave_attachments:
      'เอกสารแนบ',

    leave_types:
      'ประเภทการลา',

    holidays:
      'วันหยุด',

    notifications:
      'การแจ้งเตือน',

    auth_sessions:
      'การเข้าสู่ระบบ',

    password_reset_otps:
      'รหัส OTP รีเซ็ตรหัสผ่าน',
  };

  return (
    labels[
      String(
        tableName || '',
      ).toLowerCase()
    ] ||
    tableName ||
    '-'
  );
};

const translateStatusWord = (
  value,
) => {
  const labels = {
    Active:
      'ใช้งานอยู่',

    Inactive:
      'ไม่ใช้งาน',

    Locked:
      'ถูกล็อก',

    Employee:
      'พนักงาน',

    Supervisor:
      'หัวหน้างาน',

    Admin:
      'ผู้ดูแลระบบ',

    HR:
      'HR',
  };

  return (
    labels[value] ||
    value
  );
};

const translateLeaveType = (
  value,
) => {
  const labels = {
    'Annual Leave':
      'ลาพักร้อน',

    'Sick Leave':
      'ลาป่วย',

    'Personal Leave':
      'ลากิจ',

    'Maternity Leave':
      'ลาคลอด',
  };

  return (
    labels[value] ||
    value
  );
};

const _translateDetail = (
  detail,
) => {
  const text =
    String(
      detail || '',
    ).trim();

  if (!text) {
    return '-';
  }

  if (
    text ===
    'User logged in successfully.'
  ) {
    return 'ผู้ใช้เข้าสู่ระบบสำเร็จ';
  }

  if (
    text ===
    'User logged out successfully.'
  ) {
    return 'ผู้ใช้ออกจากระบบสำเร็จ';
  }

  let match =
    text.match(
      /^Changed user (.+?) account status from (.+?) to (.+?)\.$/i,
    );

  if (match) {
    return `เปลี่ยนสถานะบัญชีผู้ใช้ ${match[1]} จาก ${translateStatusWord(
      match[2],
    )} เป็น ${translateStatusWord(
      match[3],
    )}`;
  }

  match =
    text.match(
      /^Created user account (.+?) with the (.+?) role\.$/i,
    );

  if (match) {
    return `สร้างบัญชีผู้ใช้ ${match[1]} ด้วยบทบาท ${translateStatusWord(
      match[2],
    )}`;
  }

  match =
    text.match(
      /^Approved leave request (.+?) submitted by (.+?)\.$/i,
    );

  if (match) {
    return `อนุมัติคำขอลา ${match[1]} ของ ${match[2]} แล้ว`;
  }

  match =
    text.match(
      /^Updated employee (.+?) contact and employment information\.$/i,
    );

  if (match) {
    return `อัปเดตข้อมูลติดต่อและข้อมูลการทำงานของพนักงาน ${match[1]} แล้ว`;
  }

  match =
    text.match(
      /^Updated (.+?) department information\.$/i,
    );

  if (match) {
    return `อัปเดตข้อมูลแผนก ${match[1]} แล้ว`;
  }

  match =
    text.match(
      /^Submitted (.+?) request (.+?)\.$/i,
    );

  if (match) {
    return `ส่งคำขอ${translateLeaveType(
      match[1],
    )} ${match[2]} แล้ว`;
  }

  match =
    text.match(
      /^Updated (.+?) entitlement for employee (.+?)\.$/i,
    );

  if (match) {
    return `อัปเดตสิทธิ์${translateLeaveType(
      match[1],
    )}ของพนักงาน ${match[2]} แล้ว`;
  }

  match =
    text.match(
      /^Rejected leave request (.+?) and recorded the rejection reason\.$/i,
    );

  if (match) {
    return `ปฏิเสธคำขอลา ${match[1]} และบันทึกเหตุผลการปฏิเสธแล้ว`;
  }

  match =
    text.match(
      /^Uploaded attachment (.+?) to leave request (.+?)\.$/i,
    );

  if (match) {
    return `อัปโหลดเอกสาร ${match[1]} ไปยังคำขอลา ${match[2]} แล้ว`;
  }

  if (
    text ===
    'Exported the leave request report in Excel format.'
  ) {
    return 'ส่งออกรายงานคำขอลาเป็นไฟล์ Excel แล้ว';
  }

  return text;
};

/* =========================
   Date Helpers
========================= */

const getDateOnly = (
  value,
) => {
  const text =
    String(value || '');

  const match =
    text.match(
      /^\d{4}-\d{2}-\d{2}/,
    );

  return (
    match?.[0] ||
    ''
  );
};

const formatDate = (
  value,
) => {
  const date =
    getDateOnly(
      value,
    );

  if (!date) {
    return '-';
  }

  const [
    year,
    month,
    day,
  ] = date.split('-');

  return `${day}/${month}/${year}`;
};

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
    return '-';
  }

  const pad = (
    number,
  ) =>
    String(
      number,
    ).padStart(
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
   Date Input
========================= */

function AuditDateField({
  label,
  value,
  onChange,
}) {
  return (
    <Box
      sx={{
        position:
          'relative',
      }}
    >
      <TextField
        fullWidth
        label={label}
        value={
          value
            ? formatDate(
                value,
              )
            : ''
        }
        placeholder="วว/ดด/ปปปป"
        slotProps={{
          input: {
            readOnly:
              true,

            endAdornment: (
              <InputAdornment position="end">
                <CalendarMonthRounded
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '19px',
                  }}
                />
              </InputAdornment>
            ),
          },

          inputLabel: {
            shrink:
              true,
          },
        }}
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
                    adminTheme.primary,
                },
            },

          '& .MuiInputLabel-root.Mui-focused':
            {
              color:
                adminTheme.primary,
            },

          '& .MuiInputBase-input::placeholder':
            {
              opacity:
                1,

              color:
                '#94A3B8',
            },
        }}
      />

      <input
        type="date"
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        style={{
          position:
            'absolute',

          inset:
            0,

          width:
            '100%',

          height:
            '100%',

          opacity:
            0,

          cursor:
            'pointer',
        }}
      />
    </Box>
  );
}

/* =========================
   UI Styles
========================= */

const getRoleStyle = (
  role,
) => {
  const styles = {
    Employee: {
      backgroundColor:
        '#EFF6FF',

      color:
        '#1D4ED8',
    },

    Supervisor: {
      backgroundColor:
        '#F5F3FF',

      color:
        '#6D28D9',
    },

    HR: {
      backgroundColor:
        '#ECFDF5',

      color:
        '#047857',
    },

    Admin: {
      backgroundColor:
        '#FFF7ED',

      color:
        '#C2410C',
    },
  };

  return (
    styles[role] || {
      backgroundColor:
        '#F1F5F9',

      color:
        '#475569',
    }
  );
};

const getActionStyle = (
  action,
) => {
  const normalized =
    String(
      action || '',
    ).toUpperCase();

  if (
    [
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
    ].includes(
      normalized,
    )
  ) {
    return {
      backgroundColor:
        '#EFF6FF',

      color:
        '#1D4ED8',
    };
  }

  if (
    normalized.includes(
      'APPROVE',
    ) ||
    normalized.includes(
      'CREATE',
    )
  ) {
    return {
      backgroundColor:
        '#ECFDF5',

      color:
        '#047857',
    };
  }

  if (
    normalized.includes(
      'REJECT',
    ) ||
    normalized.includes(
      'DELETE',
    ) ||
    normalized.includes(
      'LOCK',
    )
  ) {
    return {
      backgroundColor:
        '#FEF2F2',

      color:
        '#B91C1C',
    };
  }

  if (
    normalized.includes(
      'UPDATE',
    )
  ) {
    return {
      backgroundColor:
        '#FFF7ED',

      color:
        '#C2410C',
    };
  }

  if (
    normalized.includes(
      'UPLOAD',
    ) ||
    normalized.includes(
      'EXPORT',
    )
  ) {
    return {
      backgroundColor:
        '#F5F3FF',

      color:
        '#6D28D9',
    };
  }

  return {
    backgroundColor:
      '#F1F5F9',

    color:
      '#475569',
  };
};

const headerCellStyle = {
  padding:
    '12px 8px',

  color:
    '#64748B',

  fontSize:
    '10.5px',

  fontWeight:
    800,

  lineHeight:
    1.4,

  whiteSpace:
    'normal',

  wordBreak:
    'break-word',

  borderBottom:
    '1px solid #E5E7EB',
};

/* =========================
   Component
========================= */

function AuditLogPage() {
  void auditLogs;
  const [loadedAuditLogs, setLoadedAuditLogs] = useState([]);
  const [loadError, setLoadError] = useState('');
  void loadError;

  useEffect(() => {
    let active = true;
    api.get('/admin/audit-logs')
      .then((response) => {
        if (active) setLoadedAuditLogs(response.data?.data?.auditLogs || []);
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || 'ไม่สามารถโหลดบันทึกกิจกรรมได้');
      });
    return () => { active = false; };
  }, []);
  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    roleFilter,
    setRoleFilter,
  ] = useState('All');

  const [
    actionFilter,
    setActionFilter,
  ] = useState('All');

  const [
    startDate,
    setStartDate,
  ] = useState('');

  const [
    endDate,
    setEndDate,
  ] = useState('');

  const [
    selectedLog,
    setSelectedLog,
  ] = useState(null);

  /* =========================
     Activity Groups
  ========================= */

  const actionGroups = useMemo(() => ([
    {
      value:
        'Authentication',

      label:
        'การเข้าสู่ระบบ',

      actions: [
        'LOGIN',
        'LOGOUT',
        'LOGIN_FAILED',
        'PASSWORD_RESET_OTP_REQUESTED',
        'PASSWORD_RESET_OTP_VERIFIED',
        'PASSWORD_RESET_RATE_LIMITED',
        'PASSWORD_RESET_COMPLETED',
        'CHANGE_PASSWORD',
      ],
    },

    {
      value:
        'User Management',

      label:
        'จัดการผู้ใช้งาน',

      actions: [
        'CREATE_USER',
        'UPDATE_USER',
        'UPDATE_USER_STATUS',
        'RESET_PASSWORD',
        'ADMIN_PASSWORD_RESET',
      ],
    },

    {
      value:
        'Leave Request',

      label:
        'คำขอลา',

      actions: [
        'CREATE_LEAVE',
        'SUBMIT_LEAVE',
        'APPROVE_LEAVE',
        'REJECT_LEAVE',
        'CANCEL_LEAVE',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED',
        'LEAVE_CANCELLED',
      ],
    },

    {
      value:
        'Employee Management',

      label:
        'จัดการพนักงาน',

      actions: [
        'CREATE_EMPLOYEE',
        'UPDATE_EMPLOYEE',
        'UPDATE_ENTITLEMENT',
      ],
    },

    {
      value:
        'Organization',

      label:
        'โครงสร้างองค์กร',

      actions: [
        'CREATE_DEPARTMENT',
        'UPDATE_DEPARTMENT',
        'CREATE_POSITION',
        'UPDATE_POSITION',
      ],
    },

    {
      value:
        'File and Report',

      label:
        'เอกสารและรายงาน',

      actions: [
        'UPLOAD_ATTACHMENT',
        'DELETE_ATTACHMENT',
        'EXPORT_REPORT',
      ],
    },
  ]), []);

  /* =========================
     Filter
  ========================= */

  const filteredAuditLogs =
    useMemo(() => {
      const keyword =
        normalizeValue(
          searchText,
        );

      const selectedGroup =
        actionGroups.find(
          (group) =>
            group.value ===
            actionFilter,
        );

      return loadedAuditLogs.filter(
        (log) => {
          const matchesSearch =
            !keyword ||
            normalizeValue(
              log.username,
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              log.employeeName,
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              formatAuditActivity(
                log.action,
              ),
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              log.action,
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              translateTable(
                log.tableName,
              ),
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              formatAuditDetail(log),
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              log.ipAddress,
            ).includes(
              keyword,
            );

          const matchesRole =
            roleFilter ===
              'All' ||
            log.role ===
              roleFilter;

          const matchesAction =
            actionFilter ===
              'All' ||
            selectedGroup
              ?.actions
              .includes(
                String(
                  log.action ||
                    '',
                ).toUpperCase(),
              );

          const logDate =
            getDateOnly(
              log.createdAt,
            );

          const matchesStart =
            !startDate ||
            logDate >=
              startDate;

          const matchesEnd =
            !endDate ||
            logDate <=
              endDate;

          return (
            matchesSearch &&
            matchesRole &&
            matchesAction &&
            matchesStart &&
            matchesEnd
          );
        },
      );
    }, [
      searchText,
      roleFilter,
      actionFilter,
      actionGroups,
      startDate,
      endDate,
      loadedAuditLogs,
    ]);

  /* =========================
     Summary
  ========================= */

  const summary =
    useMemo(() => {
      const today =
        new Date();

      const year =
        today.getFullYear();

      const month =
        String(
          today.getMonth() +
            1,
        ).padStart(
          2,
          '0',
        );

      const day =
        String(
          today.getDate(),
        ).padStart(
          2,
          '0',
        );

      const todayText =
        `${year}-${month}-${day}`;

      return {
        total:
          loadedAuditLogs.length,

        today:
          loadedAuditLogs.filter(
            (log) =>
              getDateOnly(
                log.createdAt,
              ) ===
              todayText,
          ).length,

        authentication:
          loadedAuditLogs.filter(
            (log) =>
              [
                'LOGIN',
                'LOGOUT',
                'LOGIN_FAILED',
              ].includes(
                String(
                  log.action ||
                    '',
                ).toUpperCase(),
              ),
          ).length,

        admin:
          loadedAuditLogs.filter(
            (log) =>
              log.role ===
              'Admin',
          ).length,
      };
    }, [loadedAuditLogs]);

  const summaryCards = [
    {
      title:
        'บันทึกทั้งหมด',

      value:
        summary.total,

      helper:
        'กิจกรรมที่บันทึกในระบบ',

      color:
        adminTheme.primary,
    },

    {
      title:
        'กิจกรรมวันนี้',

      value:
        summary.today,

      helper:
        'รายการที่เกิดขึ้นวันนี้',

      color:
        '#2563EB',
    },

    {
      title:
        'การเข้าสู่ระบบ',

      value:
        summary.authentication,

      helper:
        'การเข้าสู่ระบบและออกจากระบบ',

      color:
        '#7C3AED',
    },

    {
      title:
        'กิจกรรมผู้ดูแล',

      value:
        summary.admin,

      helper:
        'รายการที่ดำเนินการโดย Admin',

      color:
        '#059669',
    },
  ];

  /* =========================
     Actions
  ========================= */

  const handleClearFilters =
    () => {
      setSearchText('');
      setRoleFilter('All');
      setActionFilter('All');
      setStartDate('');
      setEndDate('');
    };

  const handleCloseDialog =
    () => {
      setSelectedLog(null);
    };

  /* =========================
     UI
  ========================= */

  return (
    <AdminLayout
      activeMenu="Audit Log"
    >
      {/* Header */}

      <Box
        sx={{
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
          ประวัติการใช้งาน
        </Typography>
      </Box>

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
                {card.helper}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* Main Card */}

      <Paper
        elevation={0}
        sx={{
          width:
            '100%',

          maxWidth:
            '100%',

          boxSizing:
            'border-box',

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
          <Box
            sx={{
              display:
                'flex',

              alignItems:
                'flex-start',

              justifyContent:
                'space-between',

              gap:
                '12px',
            }}
          >
            <Box>
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
                รายการประวัติการใช้งาน
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
                  filteredAuditLogs.length
                }{' '}
                จาก{' '}
                {
                  loadedAuditLogs.length
                }{' '}
                รายการ
              </Typography>
            </Box>

            <Chip
              label="อ่านอย่างเดียว"
              size="small"
              sx={{
                backgroundColor:
                  '#FFF7ED',

                color:
                  '#C2410C',

                border:
                  '1px solid #FED7AA',

                borderRadius:
                  '999px',

                fontSize:
                  '10px',

                fontWeight:
                  700,
              }}
            />
          </Box>

          {/* Filter Row 1 */}

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'minmax(260px, 1.5fr) repeat(2, minmax(150px, 0.7fr))',
              },

              gap:
                '12px',

              marginTop:
                '18px',
            }}
          >
            <TextField
              fullWidth
              label="ค้นหาประวัติ"
              placeholder="ผู้ใช้งาน กิจกรรม รายละเอียด หรือ IP"
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
                          adminTheme.primary,
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      adminTheme.primary,
                  },
              }}
            />

            <FormControl
              fullWidth
            >
              <InputLabel
                id="audit-role-filter-label"
              >
                บทบาท
              </InputLabel>

              <Select
                labelId="audit-role-filter-label"
                value={
                  roleFilter
                }
                label="บทบาท"
                onChange={(
                  event,
                ) =>
                  setRoleFilter(
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
                  ทุกบทบาท
                </MenuItem>

                <MenuItem value="Employee">
                  พนักงาน
                </MenuItem>

                <MenuItem value="Supervisor">
                  หัวหน้างาน
                </MenuItem>

                <MenuItem value="HR">
                  HR
                </MenuItem>

                <MenuItem value="Admin">
                  ผู้ดูแลระบบ
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel
                id="audit-action-filter-label"
              >
                ประเภทกิจกรรม
              </InputLabel>

              <Select
                labelId="audit-action-filter-label"
                value={
                  actionFilter
                }
                label="ประเภทกิจกรรม"
                onChange={(
                  event,
                ) =>
                  setActionFilter(
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
                  ทุกกิจกรรม
                </MenuItem>

                {actionGroups.map(
                  (group) => (
                    <MenuItem
                      key={
                        group.value
                      }
                      value={
                        group.value
                      }
                    >
                      {group.label}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Filter Row 2 */}

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                sm:
                  'repeat(2, minmax(0, 1fr)) auto',
              },

              gap:
                '12px',

              marginTop:
                '12px',
            }}
          >
            <AuditDateField
              label="ตั้งแต่วันที่"
              value={
                startDate
              }
              onChange={
                setStartDate
              }
            />

            <AuditDateField
              label="ถึงวันที่"
              value={
                endDate
              }
              onChange={
                setEndDate
              }
            />

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

                '&:hover':
                  {
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

        {/* Table */}

        {filteredAuditLogs.length >
        0 ? (
          <Box
            sx={{
              width:
                '100%',

              maxWidth:
                '100%',

              overflow:
                'hidden',
            }}
          >
            <Table
              size="small"
              sx={{
                width:
                  '100%',

                tableLayout:
                  'fixed',

                '& th, & td':
                  {
                    boxSizing:
                      'border-box',
                  },
              }}
            >
              <colgroup>
                <col
                  style={{
                    width:
                      '14%',
                  }}
                />

                <col
                  style={{
                    width:
                      '17%',
                  }}
                />

                <col
                  style={{
                    width:
                      '11%',
                  }}
                />

                <col
                  style={{
                    width:
                      '17%',
                  }}
                />

                <col
                  style={{
                    width:
                      '15%',
                  }}
                />

                <col
                  style={{
                    width:
                      '21%',
                  }}
                />

                <col
                  style={{
                    width:
                      '5%',
                  }}
                />
              </colgroup>

              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      '#F8FAFC',
                  }}
                >
                  <TableCell
                    sx={
                      headerCellStyle
                    }
                  >
                    วันที่ / เวลา
                  </TableCell>

                  <TableCell
                    sx={
                      headerCellStyle
                    }
                  >
                    ผู้ใช้งาน
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={
                      headerCellStyle
                    }
                  >
                    บทบาท
                  </TableCell>

                  <TableCell
                    sx={
                      headerCellStyle
                    }
                  >
                    กิจกรรม
                  </TableCell>

                  <TableCell
                    sx={
                      headerCellStyle
                    }
                  >
                    ข้อมูลที่เกี่ยวข้อง
                  </TableCell>

                  <TableCell
                    sx={
                      headerCellStyle
                    }
                  >
                    รายละเอียด
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={
                      headerCellStyle
                    }
                  >
                    ดู
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAuditLogs.map(
                  (log) => {
                    const roleStyle =
                      getRoleStyle(
                        log.role,
                      );

                    const actionStyle =
                      getActionStyle(
                        log.action,
                      );

                    return (
                      <TableRow
                        key={
                          log.id
                        }
                        hover
                        sx={{
                          '&:last-child td':
                            {
                              borderBottom:
                                'none',
                            },
                        }}
                      >
                        {/* Date */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 8px',

                            color:
                              '#64748B',

                            fontSize:
                              '10.5px',

                            lineHeight:
                              1.45,

                            whiteSpace:
                              'normal',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {formatDateTime(
                            log.createdAt,
                          )}
                        </TableCell>

                        {/* User */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 8px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '11px',

                              fontWeight:
                                800,

                              lineHeight:
                                1.4,

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {
                              log.username
                            }
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#94A3B8',

                              fontSize:
                                '9.5px',

                              lineHeight:
                                1.35,

                              marginTop:
                                '3px',

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {
                              log.employeeName
                            }
                          </Typography>
                        </TableCell>

                        {/* Role */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '13px 5px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={translateRole(
                              log.role,
                            )}
                            size="small"
                            sx={{
                              maxWidth:
                                '100%',

                              height:
                                '26px',

                              backgroundColor:
                                roleStyle.backgroundColor,

                              color:
                                roleStyle.color,

                              borderRadius:
                                '999px',

                              fontSize:
                                '8.5px',

                              fontWeight:
                                700,

                              '& .MuiChip-label':
                                {
                                  paddingLeft:
                                    '7px',

                                  paddingRight:
                                    '7px',
                                },
                            }}
                          />
                        </TableCell>

                        {/* Action */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 6px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={formatAuditActivity(
                              log.action,
                            )}
                            size="small"
                            sx={{
                              maxWidth:
                                '100%',

                              height:
                                '26px',

                              backgroundColor:
                                actionStyle.backgroundColor,

                              color:
                                actionStyle.color,

                              borderRadius:
                                '999px',

                              fontSize:
                                '8.5px',

                              fontWeight:
                                700,

                              '& .MuiChip-label':
                                {
                                  display:
                                    'block',

                                  overflow:
                                    'hidden',

                                  textOverflow:
                                    'ellipsis',

                                  paddingLeft:
                                    '7px',

                                  paddingRight:
                                    '7px',
                                },
                            }}
                          />
                        </TableCell>

                        {/* Target */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 8px',

                            color:
                              '#475569',

                            fontSize:
                              '10px',

                            lineHeight:
                              1.45,

                            wordBreak:
                              'break-word',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {translateTable(
                            log.tableName,
                          )}

                          {log.recordId !==
                          null
                            ? ` #${log.recordId}`
                            : ''}
                        </TableCell>

                        {/* Detail */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 8px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#475569',

                              fontSize:
                                '10px',

                              lineHeight:
                                1.5,

                              display:
                                '-webkit-box',

                              WebkitLineClamp:
                                2,

                              WebkitBoxOrient:
                                'vertical',

                              overflow:
                                'hidden',

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {formatAuditDetail(log)}
                          </Typography>
                        </TableCell>

                        {/* View */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '10px 3px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Button
                            type="button"
                            onClick={() =>
                              setSelectedLog(
                                log,
                              )
                            }
                            sx={{
                              minWidth:
                                0,

                              padding:
                                '2px 4px',

                              color:
                                adminTheme.primary,

                              fontSize:
                                '10px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',

                              '&:hover':
                                {
                                  backgroundColor:
                                    'transparent',

                                  textDecoration:
                                    'underline',
                                },
                            }}
                          >
                            ดู
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          /* Empty */

          <Box
            sx={{
              minHeight:
                '300px',

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
                  adminTheme.soft,

                color:
                  adminTheme.primary,

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
              ไม่พบประวัติการใช้งาน
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
                  adminTheme.primary,

                borderColor:
                  adminTheme.primary,

                borderRadius:
                  '8px',

                fontSize:
                  '12px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover':
                  {
                    backgroundColor:
                      adminTheme.soft,

                    borderColor:
                      adminTheme.dark,
                  },
              }}
            >
              ล้างตัวกรอง
            </Button>
          </Box>
        )}
      </Paper>

      {/* Detail Dialog */}

      <Dialog
        open={Boolean(
          selectedLog,
        )}
        onClose={
          handleCloseDialog
        }
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius:
                '14px',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color:
              '#111827',

            fontSize:
              '20px',

            fontWeight:
              800,

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          รายละเอียดประวัติการใช้งาน
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '24px !important',
          }}
        >
          {selectedLog && (
            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns: {
                  xs:
                    '1fr',

                  sm:
                    'repeat(2, minmax(0, 1fr))',
                },

                gap:
                  '20px',
              }}
            >
              {[
                {
                  label:
                    'วันที่และเวลา',

                  value:
                    formatDateTime(
                      selectedLog.createdAt,
                    ),
                },

                {
                  label:
                    'ชื่อผู้ใช้',

                  value:
                    selectedLog.username,
                },

                {
                  label:
                    'พนักงาน',

                  value:
                    selectedLog.employeeName,
                },

                {
                  label:
                    'บทบาท',

                  value:
                    translateRole(
                      selectedLog.role,
                    ),
                },

                {
                  label:
                    'กิจกรรม',

                  value:
                    formatAuditActivity(
                      selectedLog.action,
                    ),
                },

                {
                  label:
                    'ข้อมูลที่เกี่ยวข้อง',

                  value:
                    translateTable(
                      selectedLog.tableName,
                    ),
                },

                {
                  label:
                    'รหัสรายการ',

                  value:
                    selectedLog.recordId ??
                    'ไม่มี',
                },

                {
                  label:
                    'IP Address',

                  value:
                    selectedLog.ipAddress ||
                    '-',
                },
              ].map(
                (item) => (
                  <Box
                    key={
                      item.label
                    }
                  >
                    <Typography
                      sx={{
                        color:
                          '#94A3B8',

                        fontSize:
                          '10px',

                        fontWeight:
                          700,
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '13px',

                        fontWeight:
                          700,

                        lineHeight:
                          1.5,

                        marginTop:
                          '5px',

                        wordBreak:
                          'break-word',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ),
              )}

              <Box
                sx={{
                  gridColumn: {
                    xs:
                      'auto',

                    sm:
                      '1 / -1',
                  },

                  padding:
                    '18px',

                  backgroundColor:
                    '#F8FAFC',

                  border:
                    '1px solid #E5E7EB',

                  borderRadius:
                    '10px',
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#94A3B8',

                    fontSize:
                      '10px',

                    fontWeight:
                      700,
                  }}
                >
                  รายละเอียดกิจกรรม
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#374151',

                    fontSize:
                      '13px',

                    lineHeight:
                      1.7,

                    marginTop:
                      '8px',

                    wordBreak:
                      'break-word',
                  }}
                >
                  {formatAuditDetail(selectedLog)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 20px',

            borderTop:
              '1px solid #E5E7EB',
          }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={
              handleCloseDialog
            }
            sx={{
              minWidth:
                '100px',

              height:
                '40px',

              backgroundColor:
                adminTheme.primary,

              color:
                '#FFFFFF',

              borderRadius:
                '8px',

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
                  adminTheme.dark,

                boxShadow:
                  'none',
              },
            }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AuditLogPage;
