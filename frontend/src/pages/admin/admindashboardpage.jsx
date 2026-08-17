import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import AdminLayout from '../../layouts/adminlayout.jsx';
import api from '../../api/axios.js';

import {
  auditLogStorageKey,
} from '../../utils/auditlogstorage.js';
import {
  formatAuditActivity,
  formatAuditDetail,
} from '../../utils/presentationformatter.js';

/* =========================
   Storage Keys
========================= */

const userStorageKeys = [
  'online_leave_approval_users',
  'online_leave_approval_user_management',
  'online_leave_approval_system_users',
  'users',
];

const departmentStorageKeys = [
  'online_leave_approval_departments',
  'online_leave_approval_department_management',
  'online_leave_approval_system_departments',
  'departments',
];

const positionStorageKeys = [
  'online_leave_approval_positions',
  'online_leave_approval_position_management',
  'online_leave_approval_system_positions',
  'positions',
];

/* =========================
   Default Data
========================= */

const _defaultUsers = [
  {
    id: 1,
    username: 'employee001',
    employeeName: 'Employee User',
    role: 'Employee',
    status: 'active',
    lastLoginAt: '2026-07-21T09:30:00',
    createdAt: '2026-07-01T08:00:00',
  },
  {
    id: 2,
    username: 'supervisor001',
    employeeName: 'Supervisor User',
    role: 'Supervisor',
    status: 'active',
    lastLoginAt: '2026-07-21T08:45:00',
    createdAt: '2026-07-01T08:10:00',
  },
  {
    id: 3,
    username: 'hr001',
    employeeName: 'HR User',
    role: 'HR',
    status: 'active',
    lastLoginAt: '2026-07-20T16:20:00',
    createdAt: '2026-07-01T08:20:00',
  },
  {
    id: 4,
    username: 'admin001',
    employeeName: 'Admin User',
    role: 'Admin',
    status: 'active',
    lastLoginAt: '2026-07-21T09:40:00',
    createdAt: '2026-07-01T08:30:00',
  },
];

const _defaultDepartments = [
  {
    id: 1,
    name: 'Information Technology',
    isActive: true,
  },
  {
    id: 2,
    name: 'Human Resources',
    isActive: true,
  },
  {
    id: 3,
    name: 'Finance',
    isActive: true,
  },
  {
    id: 4,
    name: 'Marketing',
    isActive: true,
  },
];

const _defaultPositions = [
  {
    id: 1,
    name: 'Developer',
    isActive: true,
  },
  {
    id: 2,
    name: 'Supervisor',
    isActive: true,
  },
  {
    id: 3,
    name: 'Human Resource Officer',
    isActive: true,
  },
  {
    id: 4,
    name: 'System Administrator',
    isActive: true,
  },
  {
    id: 5,
    name: 'Accountant',
    isActive: true,
  },
  {
    id: 6,
    name: 'Marketing Officer',
    isActive: true,
  },
];

/* =========================
   Storage Helpers
========================= */

const extractArrayFromValue = (
  value,
  preferredFields = [],
) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  for (const field of preferredFields) {
    if (Array.isArray(value[field])) {
      return value[field];
    }
  }

  const nestedArray =
    Object.values(value).find(
      (item) => Array.isArray(item),
    );

  return Array.isArray(nestedArray)
    ? nestedArray
    : [];
};

const _readStorageCollection = (
  keys,
  preferredFields = [],
) => {
  for (const key of keys) {
    const storedValue =
      localStorage.getItem(key);

    if (storedValue === null) {
      continue;
    }

    try {
      const parsedValue =
        JSON.parse(storedValue);

      return {
        found: true,
        items: extractArrayFromValue(
          parsedValue,
          preferredFields,
        ),
      };
    } catch (error) {
      console.error(
        `Unable to read localStorage key "${key}".`,
        error,
      );
    }
  }

  return {
    found: false,
    items: [],
  };
};

/* =========================
   Date Helpers
========================= */

const parseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const normalizedValue =
    String(dateValue);

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      normalizedValue,
    )
      ? new Date(
          `${normalizedValue}T00:00:00`,
        )
      : new Date(normalizedValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
};

const formatDateTime = (dateValue) => {
  const date = parseDate(dateValue);

  if (!date) {
    return '-';
  }

  const pad = (value) =>
    String(value).padStart(2, '0');

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
   User Helpers
========================= */

const formatAccountStatus = (
  status,
) => {
  if (typeof status === 'boolean') {
    return status
      ? 'Active'
      : 'Inactive';
  }

  const normalizedStatus =
    String(status || 'active')
      .trim()
      .toLowerCase();

  if (
    [
      'inactive',
      'disabled',
      'false',
      '0',
    ].includes(normalizedStatus)
  ) {
    return 'Inactive';
  }

  if (
    [
      'locked',
      'blocked',
      'suspended',
    ].includes(normalizedStatus)
  ) {
    return 'Locked';
  }

  return 'Active';
};

const translateStatus = (status) => {
  const labels = {
    Active: 'ใช้งานอยู่',
    Inactive: 'ไม่ใช้งาน',
    Locked: 'ถูกล็อก',
  };

  return labels[status] || status;
};

const formatRole = (role) => {
  const normalizedRole =
    String(role || 'Employee')
      .trim()
      .toLowerCase();

  const roleLabels = {
    employee: 'Employee',
    supervisor: 'Supervisor',
    hr: 'HR',
    admin: 'Admin',
  };

  return (
    roleLabels[normalizedRole] ||
    String(role || 'Employee')
  );
};

const translateRole = (role) => {
  const labels = {
    Employee: 'พนักงาน',
    Supervisor: 'หัวหน้างาน',
    HR: 'HR',
    Admin: 'ผู้ดูแลระบบ',
  };

  return labels[role] || role;
};

const normalizeUser = (
  user,
  index,
) => {
  const firstName =
    user.firstName ||
    user.first_name ||
    '';

  const lastName =
    user.lastName ||
    user.last_name ||
    '';

  const combinedName =
    `${firstName} ${lastName}`.trim();

  return {
    id:
      user.id ||
      user.userId ||
      user.user_id ||
      index + 1,

    username:
      user.username ||
      user.userName ||
      user.user_name ||
      `user${String(
        index + 1,
      ).padStart(3, '0')}`,

    employeeName:
      user.employeeName ||
      user.employee_name ||
      user.fullName ||
      user.full_name ||
      combinedName ||
      'ไม่ระบุ',

    role: formatRole(
      user.role ||
        user.roleName ||
        user.role_name,
    ),

    status: formatAccountStatus(
      user.status ??
        user.accountStatus ??
        user.account_status ??
        user.isActive ??
        user.is_active,
    ),

    lastLoginAt:
      user.lastLoginAt ||
      user.last_login_at ||
      user.lastLogin ||
      user.last_login ||
      null,

    createdAt:
      user.createdAt ||
      user.created_at ||
      null,

    updatedAt:
      user.updatedAt ||
      user.updated_at ||
      null,
  };
};

/* =========================
   Organization Helpers
========================= */

const normalizeOrganizationItem = (
  item,
  index,
  type,
) => {
  const activeValue =
    item.isActive ??
    item.is_active ??
    item.status ??
    true;

  const isActive =
    typeof activeValue === 'string'
      ? ![
          'inactive',
          'disabled',
          'false',
          '0',
        ].includes(
          activeValue.toLowerCase(),
        )
      : Boolean(activeValue);

  const isDepartment =
    type === 'department';

  return {
    id:
      item.id ||
      item.departmentId ||
      item.department_id ||
      item.positionId ||
      item.position_id ||
      index + 1,

    name:
      item.name ||
      item.departmentName ||
      item.department_name ||
      item.positionName ||
      item.position_name ||
      `${
        isDepartment
          ? 'Department'
          : 'Position'
      } ${index + 1}`,

    isActive,
  };
};

const getUserDateValue = (user) => {
  const date =
    parseDate(user.updatedAt) ||
    parseDate(user.createdAt) ||
    parseDate(user.lastLoginAt);

  return date
    ? date.getTime()
    : 0;
};

const getAuditDateValue = (
  auditLog,
) => {
  const date = parseDate(
    auditLog.createdAt ||
      auditLog.created_at,
  );

  return date
    ? date.getTime()
    : 0;
};

/* =========================
   Audit Translation
========================= */

const _translateAuditTitle = (
  value,
) => {
  const text = String(
    value || '',
  ).trim();

  const normalized =
    text.toLowerCase();

  const labels = {
    login:
      'เข้าสู่ระบบ',

    logout:
      'ออกจากระบบ',

    create_user:
      'สร้างบัญชีผู้ใช้',

    user_created:
      'สร้างบัญชีผู้ใช้',

    update_user:
      'อัปเดตบัญชีผู้ใช้',

    update_user_status:
      'เปลี่ยนสถานะบัญชีผู้ใช้',

    change_password:
      'เปลี่ยนรหัสผ่าน',

    reset_password:
      'รีเซ็ตรหัสผ่าน',

    create_department:
      'เพิ่มแผนก',

    update_department:
      'อัปเดตแผนก',

    create_position:
      'เพิ่มตำแหน่ง',

    update_position:
      'อัปเดตตำแหน่ง',
  };

  if (labels[normalized]) {
    return labels[normalized];
  }

  if (
    normalized.includes('login')
  ) {
    return 'เข้าสู่ระบบ';
  }

  if (
    normalized.includes('logout')
  ) {
    return 'ออกจากระบบ';
  }

  if (
    normalized.includes('password')
  ) {
    return 'ดำเนินการเกี่ยวกับรหัสผ่าน';
  }

  if (
    normalized.includes('department')
  ) {
    return 'ดำเนินการเกี่ยวกับแผนก';
  }

  if (
    normalized.includes('position')
  ) {
    return 'ดำเนินการเกี่ยวกับตำแหน่ง';
  }

  if (
    normalized.includes('user')
  ) {
    return 'ดำเนินการเกี่ยวกับบัญชีผู้ใช้';
  }

  return text || 'กิจกรรมระบบ';
};

const _translateAuditDetail = (
  value,
) => {
  let text = String(
    value || '',
  ).trim();

  if (!text) {
    return 'มีการบันทึกกิจกรรมในระบบ';
  }

  text = text
    .replace(
      /\blogged in to the system\.?/gi,
      'เข้าสู่ระบบ',
    )
    .replace(
      /\blogged out of the system\.?/gi,
      'ออกจากระบบ',
    )
    .replace(
      /\bchanged their account password\.?/gi,
      'เปลี่ยนรหัสผ่านของบัญชี',
    );

  return text;
};

/* =========================
   Component
========================= */

function AdminDashboardPage() {
  const navigate =
    useNavigate();

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    departments,
    setDepartments,
  ] = useState([]);

  const [
    positions,
    setPositions,
  ] = useState([]);

  const [
    auditLogs,
    setAuditLogs,
  ] = useState([]);

  const loadDashboardData =
    useCallback(async () => {
      const [userResponse, departmentResponse, positionResponse, auditResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/hr/departments'),
        api.get('/hr/positions'),
        api.get('/admin/audit-logs'),
      ]);
      const normalizedUsers =
        (userResponse.data?.users || [])
          .map(normalizeUser)
          .sort(
            (
              firstUser,
              secondUser,
            ) =>
              getUserDateValue(
                secondUser,
              ) -
              getUserDateValue(
                firstUser,
              ),
          );

      const normalizedDepartments =
        (departmentResponse.data?.data?.departments || []).map(
          (
            department,
            index,
          ) =>
            normalizeOrganizationItem(
              department,
              index,
              'department',
            ),
        );

      const normalizedPositions =
        (positionResponse.data?.data?.positions || []).map(
          (
            position,
            index,
          ) =>
            normalizeOrganizationItem(
              position,
              index,
              'position',
            ),
        );

      const storedAuditLogs =
        (auditResponse.data?.data?.auditLogs || [])
          .slice()
          .sort(
            (
              firstLog,
              secondLog,
            ) =>
              getAuditDateValue(
                secondLog,
              ) -
              getAuditDateValue(
                firstLog,
              ),
          );

      setUsers(normalizedUsers);

      setDepartments(
        normalizedDepartments,
      );

      setPositions(
        normalizedPositions,
      );

      setAuditLogs(
        storedAuditLogs,
      );
    }, []);

  useEffect(() => {
    loadDashboardData();

    const watchedStorageKeys = [
      ...userStorageKeys,
      ...departmentStorageKeys,
      ...positionStorageKeys,
      auditLogStorageKey,
    ];

    const handleStorageChange = (
      event,
    ) => {
      if (
        !event.key ||
        watchedStorageKeys.includes(
          event.key,
        )
      ) {
        loadDashboardData();
      }
    };

    const handleWindowFocus = () => {
      loadDashboardData();
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      handleWindowFocus,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        handleWindowFocus,
      );
    };
  }, [loadDashboardData]);

  const activeUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.status ===
          'Active',
      ),
    [users],
  );

  const activeDepartments =
    useMemo(
      () =>
        departments.filter(
          (department) =>
            department.isActive,
        ),
      [departments],
    );

  const activePositions =
    useMemo(
      () =>
        positions.filter(
          (position) =>
            position.isActive,
        ),
      [positions],
    );

  const recentUsers = useMemo(
    () => users.slice(0, 5),
    [users],
  );

  const recentActivities =
    useMemo(
      () => auditLogs.slice(0, 5),
      [auditLogs],
    );

  const summaryCards = [
    {
      title:
        'บัญชีผู้ใช้ทั้งหมด',

      value:
        users.length,

      helper:
        'บัญชีในระบบทั้งหมด',

      color:
        '#EA580C',
    },
    {
      title:
        'บัญชีที่ใช้งานอยู่',

      value:
        activeUsers.length,

      helper:
        'บัญชีที่พร้อมใช้งาน',

      color:
        '#059669',
    },
    {
      title:
        'แผนกที่ใช้งานอยู่',

      value:
        activeDepartments.length,

      helper:
        'แผนกที่เปิดใช้งาน',

      color:
        '#2563EB',
    },
    {
      title:
        'ตำแหน่งที่ใช้งานอยู่',

      value:
        activePositions.length,

      helper:
        'ตำแหน่งที่เปิดใช้งาน',

      color:
        '#7C3AED',
    },
  ];

  const getStatusStyle = (
    status,
  ) => {
    const styles = {
      Active: {
        backgroundColor:
          '#DCFCE7',

        color:
          '#15803D',
      },

      Inactive: {
        backgroundColor:
          '#FEF3C7',

        color:
          '#B45309',
      },

      Locked: {
        backgroundColor:
          '#FEE2E2',

        color:
          '#B91C1C',
      },
    };

    return (
      styles[status] || {
        backgroundColor:
          '#F3F4F6',

        color:
          '#4B5563',
      }
    );
  };

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
          '#F3F4F6',

        color:
          '#4B5563',
      }
    );
  };

  const getActivityTitle = (
    activity,
  ) => {
    const action =
      activity.action ||
      activity.actionName ||
      activity.action_name ||
      'system_activity';

    return formatAuditActivity(action);
  };

  const getActivityDetail = (
    activity,
  ) =>
    formatAuditDetail(activity);

  const getActivitySymbol = (
    activity,
  ) => {
    const title =
      getActivityTitle(
        activity,
      );

    return (
      title.charAt(0) ||
      'ก'
    );
  };

  return (
    <AdminLayout
      activeMenu="Dashboard"
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
          Dashboard
        </Typography>
      </Box>

      {/* Summary Cards */}

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
                  '148px',

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
                    '14px',
                }}
              >
                {card.helper}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* Content Grid */}

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            xl:
              'minmax(0, 1.65fr) minmax(320px, 1fr)',
          },

          gap:
            '22px',

          alignItems:
            'start',
        }}
      >
        {/* Recent Users */}

        <Paper
          elevation={0}
          sx={{
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
          <Box
            sx={{
              minHeight:
                '76px',

              padding:
                '18px 22px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap:
                '14px',

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
              บัญชีผู้ใช้ล่าสุด
            </Typography>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  '/admin/user-management',
                )
              }
              sx={{
                minWidth:
                  0,

                padding:
                  0,

                color:
                  '#EA580C',

                fontSize:
                  '12px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    'transparent',

                  textDecoration:
                    'underline',
                },
              }}
            >
              ดูทั้งหมด
            </Button>
          </Box>

          {recentUsers.length >
          0 ? (
            <Box
              sx={{
                width:
                  '100%',

                overflowX:
                  'auto',
              }}
            >
              <Table
                sx={{
                  minWidth:
                    '700px',
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        '#F8FAFC',
                    }}
                  >
                    {[
                      'ชื่อผู้ใช้',
                      'พนักงาน',
                      'บทบาท',
                      'สถานะ',
                      'เข้าสู่ระบบล่าสุด',
                    ].map(
                      (
                        heading,
                      ) => (
                        <TableCell
                          key={
                            heading
                          }
                          sx={{
                            padding:
                              '13px 18px',

                            color:
                              '#64748B',

                            fontSize:
                              '11px',

                            fontWeight:
                              800,

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {heading}
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {recentUsers.map(
                    (user) => {
                      const roleStyle =
                        getRoleStyle(
                          user.role,
                        );

                      const statusStyle =
                        getStatusStyle(
                          user.status,
                        );

                      return (
                        <TableRow
                          key={
                            user.id
                          }
                          hover
                          sx={{
                            '&:last-child td': {
                              borderBottom:
                                'none',
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              padding:
                                '15px 18px',

                              color:
                                '#111827',

                              fontSize:
                                '13px',

                              fontWeight:
                                700,

                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            {user.username}
                          </TableCell>

                          <TableCell
                            sx={{
                              padding:
                                '15px 18px',

                              color:
                                '#374151',

                              fontSize:
                                '13px',

                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            {user.employeeName}
                          </TableCell>

                          <TableCell
                            sx={{
                              padding:
                                '15px 18px',

                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            <Chip
                              label={translateRole(
                                user.role,
                              )}
                              size="small"
                              sx={{
                                minWidth:
                                  '82px',

                                backgroundColor:
                                  roleStyle.backgroundColor,

                                color:
                                  roleStyle.color,

                                borderRadius:
                                  '999px',

                                fontSize:
                                  '10px',

                                fontWeight:
                                  700,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            sx={{
                              padding:
                                '15px 18px',

                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            <Chip
                              label={translateStatus(
                                user.status,
                              )}
                              size="small"
                              sx={{
                                minWidth:
                                  '72px',

                                backgroundColor:
                                  statusStyle.backgroundColor,

                                color:
                                  statusStyle.color,

                                borderRadius:
                                  '999px',

                                fontSize:
                                  '10px',

                                fontWeight:
                                  700,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            sx={{
                              padding:
                                '15px 18px',

                              color:
                                '#64748B',

                              fontSize:
                                '12px',

                              whiteSpace:
                                'nowrap',

                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            {formatDateTime(
                              user.lastLoginAt,
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box
              sx={{
                minHeight:
                  '260px',

                display:
                  'flex',

                flexDirection:
                  'column',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                padding:
                  '32px',

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
                    '#FFF7ED',

                  color:
                    '#EA580C',

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
                ยังไม่มีบัญชีผู้ใช้
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
                บัญชีผู้ใช้ที่สร้างจะปรากฏที่นี่
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Recent Activity */}

        <Paper
          elevation={0}
          sx={{
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
          <Box
            sx={{
              minHeight:
                '76px',

              padding:
                '18px 22px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

              gap:
                '14px',

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
              กิจกรรมล่าสุด
            </Typography>

            <Button
              type="button"
              onClick={() =>
                navigate(
                  '/admin/audit-log',
                )
              }
              sx={{
                minWidth:
                  0,

                padding:
                  0,

                color:
                  '#EA580C',

                fontSize:
                  '12px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    'transparent',

                  textDecoration:
                    'underline',
                },
              }}
            >
              ดูทั้งหมด
            </Button>
          </Box>

          {recentActivities.length >
          0 ? (
            <Box>
              {recentActivities.map(
                (
                  activity,
                  index,
                ) => (
                  <Box
                    key={
                      activity.id ||
                      activity.auditId ||
                      `${activity.action}-${index}`
                    }
                    sx={{
                      display:
                        'flex',

                      alignItems:
                        'flex-start',

                      gap:
                        '13px',

                      padding:
                        '17px 20px',

                      borderBottom:
                        index ===
                        recentActivities.length -
                          1
                          ? 'none'
                          : '1px solid #E5E7EB',

                      '&:hover': {
                        backgroundColor:
                          '#F8FAFC',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width:
                          '38px',

                        height:
                          '38px',

                        flexShrink:
                          0,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        backgroundColor:
                          '#FFF7ED',

                        color:
                          '#EA580C',

                        borderRadius:
                          '10px',

                        fontSize:
                          '13px',

                        fontWeight:
                          800,
                      }}
                    >
                      {getActivitySymbol(
                        activity,
                      )}
                    </Box>

                    <Box
                      sx={{
                        minWidth:
                          0,

                        flex:
                          1,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#111827',

                          fontSize:
                            '13px',

                          fontWeight:
                            800,
                        }}
                      >
                        {getActivityTitle(
                          activity,
                        )}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#475569',

                          fontSize:
                            '12px',

                          lineHeight:
                            1.6,

                          marginTop:
                            '4px',

                          wordBreak:
                            'break-word',
                        }}
                      >
                        {getActivityDetail(
                          activity,
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
                          activity.createdAt ||
                            activity.created_at,
                        )}
                      </Typography>
                    </Box>
                  </Box>
                ),
              )}
            </Box>
          ) : (
            <Box
              sx={{
                minHeight:
                  '260px',

                display:
                  'flex',

                flexDirection:
                  'column',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                padding:
                  '32px',

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
                    '#FFF7ED',

                  color:
                    '#EA580C',

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
                ยังไม่มีกิจกรรมในระบบ
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
                กิจกรรมที่บันทึกจะปรากฏที่นี่
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
