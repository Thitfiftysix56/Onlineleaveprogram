import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

import {
  useNavigate,
} from 'react-router-dom';

import AdminLayout from '../../layouts/adminlayout.jsx';
import api from '../../api/axios.js';
import TemporaryPasswordDialog from '../../components/temporarypassworddialog.jsx';

import {
  updateAuthUserRole,
} from '../../utils/authstorage.js';

/* =========================
   Options
========================= */

const roleOptions = [
  'Employee',
  'Supervisor',
  'HR',
  'Admin',
];

const statusOptions = [
  'Active',
  'Inactive',
  'Locked',
];

/* =========================
   Helpers
========================= */

const normalizeValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const formatRole = (role) => {
  const roleLabels = {
    employee: 'Employee',
    supervisor: 'Supervisor',
    hr: 'HR',
    admin: 'Admin',
  };

  return (
    roleLabels[
      normalizeValue(role)
    ] || 'Employee'
  );
};

const translateRole = (role) => {
  const roleLabels = {
    Employee: 'พนักงาน',
    Supervisor: 'หัวหน้างาน',
    HR: 'HR',
    Admin: 'ผู้ดูแลระบบ',
  };

  return (
    roleLabels[role] ||
    role ||
    '-'
  );
};

const formatStatus = (status) => {
  const normalizedStatus =
    normalizeValue(status);

  if (
    [
      'inactive',
      'disabled',
      'false',
      '0',
    ].includes(
      normalizedStatus,
    )
  ) {
    return 'Inactive';
  }

  if (
    [
      'locked',
      'blocked',
      'suspended',
    ].includes(
      normalizedStatus,
    )
  ) {
    return 'Locked';
  }

  return 'Active';
};

const translateStatus = (status) => {
  const statusLabels = {
    Active: 'ใช้งานอยู่',
    Inactive: 'ไม่ใช้งาน',
    Locked: 'ถูกล็อก',
  };

  return (
    statusLabels[status] ||
    status ||
    '-'
  );
};

/* =========================
   Date
========================= */

const formatDateTime = (value) => {
  if (
    !value ||
    normalizeValue(value) ===
      'never'
  ) {
    return 'ยังไม่เคยเข้าสู่ระบบ';
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
   Styles
========================= */

const getRoleStyle = (role) => {
  const roleStyles = {
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
    roleStyles[role] || {
      backgroundColor:
        '#F3F4F6',
      color:
        '#4B5563',
    }
  );
};

const getStatusStyle = (
  status,
) => {
  const statusStyles = {
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
    statusStyles[status] || {
      backgroundColor:
        '#F3F4F6',
      color:
        '#4B5563',
    }
  );
};

/* =========================
   Component
========================= */

function UserManagementPage() {
  const navigate =
    useNavigate();

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    isLoadingUsers,
    setIsLoadingUsers,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    updatingStatusUserId,
    setUpdatingStatusUserId,
  ] = useState(null);

  const [
    resettingPasswordUserId,
    setResettingPasswordUserId,
  ] = useState(null);

  const [
    resetConfirmationUser,
    setResetConfirmationUser,
  ] = useState(null);

  const [
    temporaryPasswordResult,
    setTemporaryPasswordResult,
  ] = useState(null);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    roleFilter,
    setRoleFilter,
  ] = useState('All');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('All');

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const [
    actionSeverity,
    setActionSeverity,
  ] = useState('info');

  const [
    actionMenuAnchor,
    setActionMenuAnchor,
  ] = useState(null);

  const [
    actionMenuUser,
    setActionMenuUser,
  ] = useState(null);

  /* =========================
     Message
  ========================= */

  const showMessage = (
    message,
    severity = 'info',
  ) => {
    setActionMessage(
      message,
    );

    setActionSeverity(
      severity,
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /* =========================
     Load Users
  ========================= */

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setLoadError('');

    try {
      const response =
        await api.get(
          '/admin/users',
        );

      const responseUsers =
        response.data?.users;

      if (
        response.data?.status !==
          'ok' ||
        !Array.isArray(
          responseUsers,
        )
      ) {
        throw new Error(
          response.data?.message ||
            'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
        );
      }

      setUsers(
        responseUsers.map(
          (user) => ({
            id:
              user.userId,

            employeeId:
              user.employeeId,

            employeeCode:
              user.employeeCode ||
              'ไม่ระบุ',

            username:
              user.username ||
              '',

            employeeName:
              user.fullName ||
              'ไม่ระบุ',

            email:
              user.email ||
              'ไม่ระบุ',

            roleId:
              user.roleId,

            role:
              formatRole(
                user.roleName,
              ),

            status:
              formatStatus(
                user.status,
              ),

            lastLogin:
              formatDateTime(
                user.lastLoginAt,
              ),

            createdAt:
              user.createdAt,

            updatedAt:
              user.updatedAt,
          }),
        ),
      );
    } catch (error) {
      console.error(
        'Unable to load user accounts.',
        error,
      );

      setUsers([]);

      setLoadError(
        error.response?.data
          ?.message ||
          error.message ||
          'ไม่สามารถโหลดข้อมูลผู้ใช้งานได้',
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =========================
     Filter
  ========================= */

  const filteredUsers =
    useMemo(() => {
      const keyword =
        normalizeValue(
          searchText,
        );

      return users.filter(
        (user) => {
          const matchesSearch =
            !keyword ||
            normalizeValue(
              user.username,
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              user.employeeCode,
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              user.employeeName,
            ).includes(
              keyword,
            ) ||
            normalizeValue(
              user.email,
            ).includes(
              keyword,
            );

          const matchesRole =
            roleFilter ===
              'All' ||
            user.role ===
              roleFilter;

          const matchesStatus =
            statusFilter ===
              'All' ||
            user.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        },
      );
    }, [
      users,
      searchText,
      roleFilter,
      statusFilter,
    ]);

  /* =========================
     Summary
  ========================= */

  const userSummary =
    useMemo(
      () => ({
        total:
          users.length,

        active:
          users.filter(
            (user) =>
              user.status ===
              'Active',
          ).length,

        inactive:
          users.filter(
            (user) =>
              user.status ===
              'Inactive',
          ).length,

        locked:
          users.filter(
            (user) =>
              user.status ===
              'Locked',
          ).length,
      }),
      [users],
    );

  const summaryCards = [
    {
      title:
        'ผู้ใช้งานทั้งหมด',

      value:
        userSummary.total,

      helper:
        'บัญชีในระบบทั้งหมด',

      color:
        '#EA580C',
    },

    {
      title:
        'ใช้งานอยู่',

      value:
        userSummary.active,

      helper:
        'บัญชีที่พร้อมใช้งาน',

      color:
        '#059669',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        userSummary.inactive,

      helper:
        'บัญชีที่ปิดการใช้งาน',

      color:
        '#D97706',
    },

    {
      title:
        'ถูกล็อก',

      value:
        userSummary.locked,

      helper:
        'บัญชีที่ถูกล็อก',

      color:
        '#DC2626',
    },
  ];

  /* =========================
     Filter Actions
  ========================= */

  const handleClearFilters =
    () => {
      setSearchText('');
      setRoleFilter('All');
      setStatusFilter('All');
    };

  /* =========================
     Role
  ========================= */

  const handleRoleChange = (
    selectedUser,
    nextRole,
  ) => {
    const result =
      updateAuthUserRole({
        userId:
          selectedUser.id,

        username:
          selectedUser.username,

        role:
          normalizeValue(
            nextRole,
          ),
      });

    if (!result.success) {
      showMessage(
        result.error ||
          'ไม่สามารถเปลี่ยนบทบาทผู้ใช้งานได้',
        'error',
      );

      return;
    }

    loadUsers();

    showMessage(
      `เปลี่ยนบทบาทของ ${selectedUser.username} เป็น ${translateRole(
        nextRole,
      )} แล้ว`,
      'success',
    );
  };

  /* =========================
     Status
  ========================= */

  const handleStatusChange =
    async (
      selectedUser,
      nextStatus,
    ) => {
      setUpdatingStatusUserId(
        selectedUser.id,
      );

      setActionMessage('');

      try {
        const response =
          await api.patch(
            `/admin/users/${selectedUser.id}/status`,
            {
              status:
                nextStatus,
            },
          );

        if (
          response.data?.status !==
          'ok'
        ) {
          throw new Error(
            response.data?.message ||
              'ไม่สามารถเปลี่ยนสถานะบัญชีได้',
          );
        }

        await loadUsers();

        showMessage(
          `เปลี่ยนสถานะของ ${selectedUser.username} เป็น ${translateStatus(
            nextStatus,
          )} แล้ว`,
          'success',
        );
      } catch (error) {
        showMessage(
          error.response?.data
            ?.message ||
            error.message ||
            'ไม่สามารถเปลี่ยนสถานะบัญชีได้',
          'error',
        );
      } finally {
        setUpdatingStatusUserId(
          null,
        );
      }
    };

  /* =========================
     Action Menu
  ========================= */

  const handleOpenActionMenu = (
    event,
    user,
  ) => {
    setActionMenuAnchor(
      event.currentTarget,
    );

    setActionMenuUser(
      user,
    );
  };

  const handleCloseActionMenu =
    () => {
      setActionMenuAnchor(
        null,
      );

      setActionMenuUser(
        null,
      );
    };

  const handleEditFromMenu = () => {
    if (!actionMenuUser) {
      return;
    }

    const userId =
      actionMenuUser.id;

    handleCloseActionMenu();

    navigate(
      `/admin/user-management/${userId}/edit`,
    );
  };

  const handleResetFromMenu = () => {
    if (!actionMenuUser) {
      return;
    }

    const selectedUser =
      actionMenuUser;

    handleCloseActionMenu();

    handleOpenResetConfirmation(
      selectedUser,
    );
  };

  /* =========================
     Reset Password
  ========================= */

  const handleOpenResetConfirmation = (
    selectedUser,
  ) => {
    if (
      resettingPasswordUserId !==
      null
    ) {
      return;
    }

    setActionMessage('');

    setResetConfirmationUser(
      selectedUser,
    );
  };

  const handleResetPassword =
    async () => {
      const selectedUser =
        resetConfirmationUser;

      if (
        !selectedUser ||
        resettingPasswordUserId !==
          null
      ) {
        return;
      }

      setResettingPasswordUserId(
        selectedUser.id,
      );

      try {
        const response =
          await api.post(
            `/admin/users/${selectedUser.id}/reset-password`,
          );

        if (
          response.data?.status !==
            'ok' ||
          !response.data
            ?.temporaryPassword
        ) {
          throw new Error(
            response.data?.message ||
              'ระบบไม่ได้ส่งรหัสผ่านชั่วคราวกลับมา',
          );
        }

        setResetConfirmationUser(
          null,
        );

        setTemporaryPasswordResult({
          username:
            response.data
              .username ||
            selectedUser.username,

          temporaryPassword:
            response.data
              .temporaryPassword,
        });

        showMessage(
          'รีเซ็ตรหัสผ่านสำเร็จแล้ว',
          'success',
        );
      } catch (error) {
        showMessage(
          error.response?.data
            ?.message ||
            error.message ||
            'ไม่สามารถรีเซ็ตรหัสผ่านได้',
          'error',
        );
      } finally {
        setResettingPasswordUserId(
          null,
        );
      }
    };

  const handleCloseTemporaryPassword =
    () => {
      setTemporaryPasswordResult(
        null,
      );
    };

  /* =========================
     UI
  ========================= */

  return (
    <AdminLayout
      activeMenu="User Management"
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
          จัดการผู้ใช้งาน
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={() =>
            navigate(
              '/admin/user-management/add',
            )
          }
          sx={{
            minWidth:
              '145px',

            height:
              '42px',

            padding:
              '0 18px',

            backgroundColor:
              '#EA580C',

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
                '#C2410C',

              boxShadow:
                'none',
            },
          }}
        >
          + เพิ่มผู้ใช้งาน
        </Button>
      </Box>

      {/* Message */}

      {actionMessage && (
        <Alert
          severity={
            actionSeverity
          }
          onClose={() =>
            setActionMessage('')
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {actionMessage}
        </Alert>
      )}

      {/* Error */}

      {loadError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={
                loadUsers
              }
            >
              ลองอีกครั้ง
            </Button>
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {loadError}
        </Alert>
      )}

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
                {card.helper}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* User List */}

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
            รายการผู้ใช้งาน
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
              filteredUsers.length
            }{' '}
            จาก{' '}
            {
              users.length
            }{' '}
            บัญชี
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'minmax(220px, 1.5fr) minmax(130px, 0.7fr) minmax(130px, 0.7fr) auto',
              },

              gap:
                '12px',

              marginTop:
                '18px',
            }}
          >
            <TextField
              fullWidth
              label="ค้นหาผู้ใช้งาน"
              placeholder="ชื่อผู้ใช้ ชื่อพนักงาน รหัส หรืออีเมล"
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
                          '#EA580C',
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      '#EA580C',
                  },
              }}
            />

            <FormControl fullWidth>
              <InputLabel
                id="user-role-filter-label"
              >
                บทบาท
              </InputLabel>

              <Select
                labelId="user-role-filter-label"
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

                {roleOptions.map(
                  (role) => (
                    <MenuItem
                      key={
                        role
                      }
                      value={
                        role
                      }
                    >
                      {translateRole(
                        role,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel
                id="user-status-filter-label"
              >
                สถานะ
              </InputLabel>

              <Select
                labelId="user-status-filter-label"
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

                {statusOptions.map(
                  (status) => (
                    <MenuItem
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {translateStatus(
                        status,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth:
                  '100px',

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

        {/* Loading */}

        {isLoadingUsers ? (
          <Box
            sx={{
              minHeight:
                '300px',

              display:
                'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              justifyContent:
                'center',

              gap:
                '14px',

              color:
                '#64748B',
            }}
          >
            <CircularProgress
              size={32}
              sx={{
                color:
                  '#EA580C',
              }}
            />

            <Typography
              sx={{
                fontSize:
                  '13px',

                fontWeight:
                  700,
              }}
            >
              กำลังโหลดข้อมูลผู้ใช้งาน...
            </Typography>
          </Box>
        ) : filteredUsers.length >
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
              }}
            >
              <colgroup>
                <col
                  style={{
                    width:
                      '13%',
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
                      '22%',
                  }}
                />

                <col
                  style={{
                    width:
                      '13%',
                  }}
                />

                <col
                  style={{
                    width:
                      '13%',
                  }}
                />

                <col
                  style={{
                    width:
                      '16%',
                  }}
                />

                <col
                  style={{
                    width:
                      '6%',
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
                  {[
                    'ชื่อผู้ใช้',
                    'พนักงาน',
                    'อีเมล',
                    'บทบาท',
                    'สถานะ',
                    'เข้าสู่ระบบล่าสุด',
                    'จัดการ',
                  ].map(
                    (
                      heading,
                    ) => (
                      <TableCell
                        key={
                          heading
                        }
                        align={
                          heading ===
                          'จัดการ'
                            ? 'center'
                            : 'left'
                        }
                        sx={{
                          padding:
                            '12px 10px',

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
                {filteredUsers.map(
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
                          '&:last-child td':
                            {
                              borderBottom:
                                'none',
                            },
                        }}
                      >
                        {/* Username */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 10px',

                            color:
                              '#111827',

                            fontSize:
                              '11.5px',

                            fontWeight:
                              800,

                            wordBreak:
                              'break-word',

                            overflowWrap:
                              'anywhere',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {user.username}
                        </TableCell>

                        {/* Employee */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 10px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '11.5px',

                              fontWeight:
                                700,

                              lineHeight:
                                1.4,

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {user.employeeName}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#94A3B8',

                              fontSize:
                                '10px',

                              marginTop:
                                '3px',
                            }}
                          >
                            {user.employeeCode}
                          </Typography>
                        </TableCell>

                        {/* Email */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 10px',

                            color:
                              '#475569',

                            fontSize:
                              '10.5px',

                            lineHeight:
                              1.45,

                            wordBreak:
                              'break-word',

                            overflowWrap:
                              'anywhere',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {user.email}
                        </TableCell>

                        {/* Role */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 8px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <FormControl
                            size="small"
                            fullWidth
                          >
                            <Select
                              value={
                                user.role
                              }
                              onChange={(
                                event,
                              ) =>
                                handleRoleChange(
                                  user,
                                  event.target.value,
                                )
                              }
                              renderValue={(
                                value,
                              ) =>
                                translateRole(
                                  value,
                                )
                              }
                              sx={{
                                width:
                                  '100%',

                                height:
                                  '34px',

                                backgroundColor:
                                  roleStyle.backgroundColor,

                                color:
                                  roleStyle.color,

                                borderRadius:
                                  '8px',

                                fontSize:
                                  '10.5px',

                                fontWeight:
                                  700,

                                '& .MuiSelect-select':
                                  {
                                    paddingLeft:
                                      '9px',

                                    paddingRight:
                                      '25px !important',

                                    overflow:
                                      'hidden',

                                    textOverflow:
                                      'ellipsis',
                                  },

                                '& .MuiOutlinedInput-notchedOutline':
                                  {
                                    borderColor:
                                      `${roleStyle.color}55`,
                                  },
                              }}
                            >
                              {roleOptions.map(
                                (
                                  role,
                                ) => (
                                  <MenuItem
                                    key={
                                      role
                                    }
                                    value={
                                      role
                                    }
                                  >
                                    {translateRole(
                                      role,
                                    )}
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* Status */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 8px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <FormControl
                            size="small"
                            fullWidth
                          >
                            <Select
                              disabled={
                                Number(
                                  updatingStatusUserId,
                                ) ===
                                Number(
                                  user.id,
                                )
                              }
                              value={
                                user.status
                              }
                              onChange={(
                                event,
                              ) =>
                                handleStatusChange(
                                  user,
                                  event.target.value,
                                )
                              }
                              renderValue={(
                                value,
                              ) =>
                                translateStatus(
                                  value,
                                )
                              }
                              sx={{
                                width:
                                  '100%',

                                height:
                                  '34px',

                                backgroundColor:
                                  statusStyle.backgroundColor,

                                color:
                                  statusStyle.color,

                                borderRadius:
                                  '8px',

                                fontSize:
                                  '10.5px',

                                fontWeight:
                                  700,

                                '& .MuiSelect-select':
                                  {
                                    paddingLeft:
                                      '9px',

                                    paddingRight:
                                      '25px !important',

                                    overflow:
                                      'hidden',

                                    textOverflow:
                                      'ellipsis',
                                  },

                                '& .MuiOutlinedInput-notchedOutline':
                                  {
                                    borderColor:
                                      `${statusStyle.color}55`,
                                  },
                              }}
                            >
                              {statusOptions.map(
                                (
                                  status,
                                ) => (
                                  <MenuItem
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {translateStatus(
                                      status,
                                    )}
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* Last Login */}

                        <TableCell
                          sx={{
                            padding:
                              '13px 10px',

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
                          {user.lastLogin}
                        </TableCell>

                        {/* Action */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '10px 4px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <IconButton
                            type="button"
                            aria-label="เปิดเมนูจัดการผู้ใช้งาน"
                            onClick={(
                              event,
                            ) =>
                              handleOpenActionMenu(
                                event,
                                user,
                              )
                            }
                            disabled={
                              resettingPasswordUserId !==
                              null
                            }
                            sx={{
                              width:
                                '34px',

                              height:
                                '34px',

                              color:
                                '#64748B',

                              borderRadius:
                                '8px',

                              '&:hover':
                                {
                                  color:
                                    '#EA580C',

                                  backgroundColor:
                                    '#FFF7ED',
                                },
                            }}
                          >
                            <MoreVertRoundedIcon
                              sx={{
                                fontSize:
                                  '20px',
                              }}
                            />
                          </IconButton>
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
              ไม่พบข้อมูลผู้ใช้งาน
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
              {users.length ===
              0
                ? 'ยังไม่มีบัญชีผู้ใช้งานในระบบ'
                : 'ลองเปลี่ยนหรือล้างตัวกรอง'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Action Menu */}

      <Menu
        anchorEl={
          actionMenuAnchor
        }
        open={Boolean(
          actionMenuAnchor,
        )}
        onClose={
          handleCloseActionMenu
        }
        anchorOrigin={{
          vertical:
            'bottom',
          horizontal:
            'right',
        }}
        transformOrigin={{
          vertical:
            'top',
          horizontal:
            'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth:
                '175px',

              marginTop:
                '4px',

              padding:
                '5px',

              border:
                '1px solid #E5E7EB',

              borderRadius:
                '10px',

              boxShadow:
                '0 12px 30px rgba(15, 23, 42, 0.12)',
            },
          },
        }}
      >
        <MenuItem
          onClick={
            handleEditFromMenu
          }
          sx={{
            minHeight:
              '40px',

            borderRadius:
              '7px',

            color:
              '#374151',

            fontSize:
              '12px',

            fontWeight:
              700,

            '&:hover': {
              color:
                '#EA580C',

              backgroundColor:
                '#FFF7ED',
            },
          }}
        >
          แก้ไข
        </MenuItem>

        <MenuItem
          onClick={
            handleResetFromMenu
          }
          sx={{
            minHeight:
              '40px',

            borderRadius:
              '7px',

            color:
              '#374151',

            fontSize:
              '12px',

            fontWeight:
              700,

            '&:hover': {
              color:
                '#7C3AED',

              backgroundColor:
                '#F5F3FF',
            },
          }}
        >
          รีเซ็ตรหัสผ่าน
        </MenuItem>
      </Menu>

      {/* Reset Password Confirmation */}

      <Dialog
        open={Boolean(
          resetConfirmationUser,
        )}
        fullWidth
        maxWidth="sm"
        onClose={() => {
          if (
            resettingPasswordUserId ===
            null
          ) {
            setResetConfirmationUser(
              null,
            );
          }
        }}
        PaperProps={{
          sx: {
            borderRadius:
              '14px',
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
          }}
        >
          ยืนยันการรีเซ็ตรหัสผ่าน
        </DialogTitle>

        <DialogContent
          dividers
        >
          <Typography
            sx={{
              color:
                '#475569',

              fontSize:
                '13px',

              lineHeight:
                1.7,
            }}
          >
            กำลังรีเซ็ตรหัสผ่านของบัญชีต่อไปนี้
          </Typography>

          <Box
            sx={{
              padding:
                '16px',

              marginTop:
                '14px',

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
                  '#111827',

                fontSize:
                  '14px',

                fontWeight:
                  800,
              }}
            >
              {
                resetConfirmationUser
                  ?.username
              }
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
              {
                resetConfirmationUser
                  ?.employeeName
              }
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
              บทบาท:{' '}
              {translateRole(
                resetConfirmationUser
                  ?.role,
              )}
            </Typography>
          </Box>

          <Alert
            severity="warning"
            sx={{
              marginTop:
                '18px',

              borderRadius:
                '10px',
            }}
          >
            รหัสผ่านเดิมจะไม่สามารถใช้งานได้ทันที
            ผู้ใช้งานต้องเข้าสู่ระบบด้วยรหัสผ่านชั่วคราวใหม่
            และเปลี่ยนรหัสผ่านก่อนเข้าใช้งานระบบ
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px',
          }}
        >
          <Button
            type="button"
            onClick={() =>
              setResetConfirmationUser(
                null,
              )
            }
            disabled={
              resettingPasswordUserId !==
              null
            }
            sx={{
              color:
                '#64748B',

              fontWeight:
                700,

              textTransform:
                'none',
            }}
          >
            ยกเลิก
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={
              handleResetPassword
            }
            disabled={
              resettingPasswordUserId !==
              null
            }
            sx={{
              minWidth:
                '130px',

              backgroundColor:
                '#7C3AED',

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
                  '#6D28D9',

                boxShadow:
                  'none',
              },
            }}
          >
            {resettingPasswordUserId !==
            null
              ? 'กำลังรีเซ็ต...'
              : 'ยืนยันการรีเซ็ต'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Temporary Password */}

      <TemporaryPasswordDialog
        open={Boolean(
          temporaryPasswordResult,
        )}
        username={
          temporaryPasswordResult
            ?.username ||
          ''
        }
        temporaryPassword={
          temporaryPasswordResult
            ?.temporaryPassword ||
          ''
        }
        onClose={
          handleCloseTemporaryPassword
        }
      />
    </AdminLayout>
  );
}

export default UserManagementPage;
