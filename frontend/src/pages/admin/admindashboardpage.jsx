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

import {
  auditLogStorageKey,
  formatAuditAction,
  getAuditLogs,
} from '../../utils/auditlogstorage.js';

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

const defaultUsers = [
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

const defaultDepartments = [
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

const defaultPositions = [
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

  const nestedArray = Object.values(value).find(
    (item) => Array.isArray(item),
  );

  return Array.isArray(nestedArray)
    ? nestedArray
    : [];
};

const readStorageCollection = (
  keys,
  preferredFields = [],
) => {
  for (const key of keys) {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
      continue;
    }

    try {
      const parsedValue = JSON.parse(storedValue);

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

const parseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const normalizedValue = String(dateValue);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(
    normalizedValue,
  )
    ? new Date(`${normalizedValue}T00:00:00`)
    : new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const formatAccountStatus = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'Active' : 'Inactive';
  }

  const normalizedStatus = String(
    status || 'active',
  )
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

const formatRole = (role) => {
  const normalizedRole = String(
    role || 'Employee',
  )
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

const normalizeUser = (user, index) => {
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
      `user${String(index + 1).padStart(3, '0')}`,

    employeeName:
      user.employeeName ||
      user.employee_name ||
      user.fullName ||
      user.full_name ||
      combinedName ||
      'Not specified',

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
        ].includes(activeValue.toLowerCase())
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
      `${isDepartment ? 'Department' : 'Position'} ${
        index + 1
      }`,

    isActive,
  };
};

const getUserDateValue = (user) => {
  const date =
    parseDate(user.updatedAt) ||
    parseDate(user.createdAt) ||
    parseDate(user.lastLoginAt);

  return date ? date.getTime() : 0;
};

const getAuditDateValue = (auditLog) => {
  const date = parseDate(
    auditLog.createdAt ||
      auditLog.created_at,
  );

  return date ? date.getTime() : 0;
};

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

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
    useCallback(() => {
      const storedUserResult =
        readStorageCollection(
          userStorageKeys,
          [
            'users',
            'accounts',
            'items',
            'data',
            'records',
          ],
        );

      const storedDepartmentResult =
        readStorageCollection(
          departmentStorageKeys,
          [
            'departments',
            'items',
            'data',
            'records',
          ],
        );

      const storedPositionResult =
        readStorageCollection(
          positionStorageKeys,
          [
            'positions',
            'items',
            'data',
            'records',
          ],
        );

      const sourceUsers =
        storedUserResult.found
          ? storedUserResult.items
          : defaultUsers;

      const sourceDepartments =
        storedDepartmentResult.found
          ? storedDepartmentResult.items
          : defaultDepartments;

      const sourcePositions =
        storedPositionResult.found
          ? storedPositionResult.items
          : defaultPositions;

      const normalizedUsers =
        sourceUsers
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
        sourceDepartments.map(
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
        sourcePositions.map(
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
        getAuditLogs()
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

      setUsers(
        normalizedUsers,
      );

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
          user.status === 'Active',
      ),
    [users],
  );

  const inactiveUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.status === 'Inactive',
      ),
    [users],
  );

  const lockedUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.status === 'Locked',
      ),
    [users],
  );

  const activeDepartments = useMemo(
    () =>
      departments.filter(
        (department) =>
          department.isActive,
      ),
    [departments],
  );

  const activePositions = useMemo(
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

  const recentActivities = useMemo(
    () => auditLogs.slice(0, 5),
    [auditLogs],
  );

  const summaryCards = [
    {
      title: 'Total Users',
      value: users.length,
      description: 'All user accounts',
      color: '#EA580C',
      backgroundColor: '#FFF7ED',
    },
    {
      title: 'Active Users',
      value: activeUsers.length,
      description:
        'Accounts ready to use',
      color: '#059669',
      backgroundColor: '#ECFDF5',
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers.length,
      description:
        'Temporarily disabled',
      color: '#D97706',
      backgroundColor: '#FFFBEB',
    },
    {
      title: 'Locked Users',
      value: lockedUsers.length,
      description:
        'Accounts requiring review',
      color: '#DC2626',
      backgroundColor: '#FEF2F2',
    },
  ];

  const organizationCards = [
    {
      title: 'Active Departments',
      value: activeDepartments.length,
      description:
        'Departments currently in use',
      buttonLabel:
        'Manage Departments',
      route:
        '/admin/department-management',
    },
    {
      title: 'Active Positions',
      value: activePositions.length,
      description:
        'Positions currently in use',
      buttonLabel:
        'Manage Positions',
      route:
        '/admin/position-management',
    },
    {
      title: 'Audit Log Records',
      value: auditLogs.length,
      description:
        'Recorded system activities',
      buttonLabel:
        'View Audit Log',
      route:
        '/admin/audit-log',
    },
  ];

  const formatDateTime = (
    dateValue,
  ) => {
    const date =
      parseDate(dateValue);

    if (!date) {
      return 'Never';
    }

    return date.toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const getStatusStyle = (
    status,
  ) => {
    const statusStyles = {
      Active: {
        backgroundColor: '#DCFCE7',
        color: '#15803D',
      },
      Inactive: {
        backgroundColor: '#FEF3C7',
        color: '#B45309',
      },
      Locked: {
        backgroundColor: '#FEE2E2',
        color: '#B91C1C',
      },
    };

    return (
      statusStyles[status] || {
        backgroundColor: '#F3F4F6',
        color: '#4B5563',
      }
    );
  };

  const getRoleStyle = (
    role,
  ) => {
    const roleStyles = {
      Employee: {
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
      },
      Supervisor: {
        backgroundColor: '#F5F3FF',
        color: '#6D28D9',
      },
      HR: {
        backgroundColor: '#ECFDF5',
        color: '#047857',
      },
      Admin: {
        backgroundColor: '#FFF7ED',
        color: '#C2410C',
      },
    };

    return (
      roleStyles[role] || {
        backgroundColor: '#F3F4F6',
        color: '#4B5563',
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

    return (
      formatAuditAction(action) ||
      String(action)
        .replaceAll('_', ' ')
        .replace(
          /\b\w/g,
          (character) =>
            character.toUpperCase(),
        )
    );
  };

  const getActivityDetail = (
    activity,
  ) =>
    activity.detail ||
    activity.description ||
    activity.message ||
    'System activity recorded.';

  const getActivitySymbol = (
    activity,
  ) => {
    const title =
      getActivityTitle(activity);

    return (
      title
        .charAt(0)
        .toUpperCase() ||
      'A'
    );
  };

  return (
    <AdminLayout activeMenu="Dashboard">
      <Box
        sx={{
          display: 'flex',

          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs: 'column',
            sm: 'row',
          },

          gap: '16px',

          marginBottom:
            '28px',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              color: '#111827',

              fontSize: {
                xs: '26px',
                sm: '30px',
              },

              fontWeight: 800,
            }}
          >
            Admin Dashboard
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize:
                '15px',

              marginTop:
                '6px',
            }}
          >
            Overview of user accounts, organization
            structure and system activities.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',

            gap: '10px',

            flexWrap:
              'wrap',
          }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={() =>
              navigate(
                '/admin/user-management',
              )
            }
            sx={{
              height: '44px',

              padding:
                '0 20px',

              backgroundColor:
                '#EA580C',

              color:
                '#FFFFFF',

              borderRadius:
                '8px',

              fontSize:
                '14px',

              fontWeight:
                700,

              textTransform:
                'none',

              boxShadow:
                'none',

              '&:hover': {
                backgroundColor:
                  '#C2410C',

                boxShadow:
                  'none',
              },
            }}
          >
            Manage Users
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            sm:
              'repeat(2, minmax(0, 1fr))',

            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '20px',

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
                padding:
                  '22px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '12px',
              }}
            >
              <Box
                sx={{
                  width:
                    '46px',

                  height:
                    '46px',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    card.backgroundColor,

                  color:
                    card.color,

                  borderRadius:
                    '12px',

                  fontSize:
                    '20px',

                  fontWeight:
                    800,
                }}
              >
                {card.value}
              </Box>

              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '16px',

                  fontWeight:
                    800,

                  marginTop:
                    '16px',
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '13px',

                  marginTop:
                    '5px',
                }}
              >
                {card.description}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            lg:
              'repeat(3, minmax(0, 1fr))',
          },

          gap:
            '20px',

          marginBottom:
            '24px',
        }}
      >
        {organizationCards.map(
          (card) => (
            <Paper
              key={
                card.title
              }
              elevation={0}
              sx={{
                padding:
                  '22px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderLeft:
                  '4px solid #EA580C',

                borderRadius:
                  '12px',
              }}
            >
              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '13px',

                  fontWeight:
                    700,
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '30px',

                  fontWeight:
                    800,

                  marginTop:
                    '8px',
                }}
              >
                {card.value}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#9CA3AF',

                  fontSize:
                    '12px',

                  marginTop:
                    '5px',
                }}
              >
                {card.description}
              </Typography>

              <Button
                type="button"
                onClick={() =>
                  navigate(
                    card.route,
                  )
                }
                sx={{
                  minWidth:
                    0,

                  padding:
                    0,

                  marginTop:
                    '14px',

                  color:
                    '#EA580C',

                  fontSize:
                    '13px',

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
                {card.buttonLabel}
              </Button>
            </Paper>
          ),
        )}
      </Box>

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            xl:
              'minmax(0, 1.7fr) minmax(320px, 1fr)',
          },

          gap:
            '24px',

          alignItems:
            'start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor:
              '#FFFFFF',

            border:
              '1px solid #E5E7EB',

            borderRadius:
              '12px',

            overflow:
              'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '24px',
              },

              borderBottom:
                '1px solid #E5E7EB',

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
                '12px',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '18px',

                  fontWeight:
                    800,
                }}
              >
                Recent User Accounts
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '14px',

                  marginTop:
                    '4px',
                }}
              >
                Latest account information in the system.
              </Typography>
            </Box>

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
                  '14px',

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
              View All Users
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
                    '760px',
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        '#F9FAFB',
                    }}
                  >
                    {[
                      'Username',
                      'Employee',
                      'Role',
                      'Status',
                      'Last Login',
                    ].map(
                      (
                        heading,
                      ) => (
                        <TableCell
                          key={
                            heading
                          }
                          sx={{
                            color:
                              '#6B7280',

                            fontSize:
                              '12px',

                            fontWeight:
                              800,

                            textTransform:
                              'uppercase',

                            letterSpacing:
                              '0.4px',

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
                    (
                      user,
                    ) => {
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
                            '&:last-child td':
                              {
                                borderBottom:
                                  'none',
                              },
                          }}
                        >
                          <TableCell
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '14px',

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
                              color:
                                '#374151',

                              fontSize:
                                '14px',

                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            {user.employeeName}
                          </TableCell>

                          <TableCell
                            sx={{
                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            <Chip
                              label={
                                user.role
                              }
                              size="small"
                              sx={{
                                minWidth:
                                  '84px',

                                backgroundColor:
                                  roleStyle.backgroundColor,

                                color:
                                  roleStyle.color,

                                borderRadius:
                                  '999px',

                                fontSize:
                                  '11px',

                                fontWeight:
                                  700,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            sx={{
                              borderBottom:
                                '1px solid #E5E7EB',
                            }}
                          >
                            <Chip
                              label={
                                user.status
                              }
                              size="small"
                              sx={{
                                minWidth:
                                  '70px',

                                backgroundColor:
                                  statusStyle.backgroundColor,

                                color:
                                  statusStyle.color,

                                borderRadius:
                                  '999px',

                                fontSize:
                                  '11px',

                                fontWeight:
                                  700,
                              }}
                            />
                          </TableCell>

                          <TableCell
                            sx={{
                              color:
                                '#6B7280',

                              fontSize:
                                '13px',

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
                  '240px',

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
                    '60px',

                  height:
                    '60px',

                  backgroundColor:
                    '#FFF7ED',

                  color:
                    '#EA580C',

                  borderRadius:
                    '50%',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  fontSize:
                    '22px',

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
                    '17px',

                  fontWeight:
                    800,

                  marginTop:
                    '14px',
                }}
              >
                No user accounts
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '14px',

                  marginTop:
                    '5px',
                }}
              >
                Created user accounts will appear here.
              </Typography>
            </Box>
          )}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            backgroundColor:
              '#FFFFFF',

            border:
              '1px solid #E5E7EB',

            borderRadius:
              '12px',

            overflow:
              'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '24px',
              },

              borderBottom:
                '1px solid #E5E7EB',

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
                '12px',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '18px',

                  fontWeight:
                    800,
                }}
              >
                Recent System Activity
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '14px',

                  marginTop:
                    '4px',
                }}
              >
                Latest activities from the Audit Log.
              </Typography>
            </Box>

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
                  '13px',

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
              View All
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
                        '14px',

                      padding:
                        '20px 22px',

                      borderBottom:
                        index ===
                        recentActivities.length -
                          1
                          ? 'none'
                          : '1px solid #E5E7EB',

                      '&:hover': {
                        backgroundColor:
                          '#F9FAFB',
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
                          '14px',

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
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#111827',

                          fontSize:
                            '14px',

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
                            '#4B5563',

                          fontSize:
                            '13px',

                          lineHeight:
                            1.6,

                          marginTop:
                            '5px',

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
                            '#9CA3AF',

                          fontSize:
                            '11px',

                          marginTop:
                            '7px',
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
                  '240px',

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
                    '60px',

                  height:
                    '60px',

                  backgroundColor:
                    '#FFF7ED',

                  color:
                    '#EA580C',

                  borderRadius:
                    '50%',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  fontSize:
                    '22px',

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
                    '17px',

                  fontWeight:
                    800,

                  marginTop:
                    '14px',
                }}
              >
                No system activity
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '14px',

                  marginTop:
                    '5px',
                }}
              >
                Recorded activities will appear here.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </AdminLayout>
  );
}

export default AdminDashboardPage;