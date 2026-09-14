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
  MenuItem,
  Paper,
  Select,
  Table,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditRounded from '@mui/icons-material/EditRounded';
import FixedTableBody from '../../components/fixedtablebody.jsx';


import AdminLayout from '../../layouts/adminlayout.jsx';
import api from '../../api/axios.js';
import TemporaryPasswordDialog from '../../components/temporarypassworddialog.jsx';
import UserFormPage from './userformpage.jsx';
import { DataListToolbar } from '../../components/shareduiprimitives.jsx';
import { InlineListSummary } from '../../components/sharedvisualfoundation.jsx';
import { getCurrentUser } from '../../utils/authstorage.js';

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
        '#FEE2E2',
      color:
        '#B91C1C',
    },

    Locked: {
      backgroundColor:
        '#FEF3C7',
      color:
        '#B45309',
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

function UserManagementPage({ initialFormMode, initialUserId }) {
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
    resettingPasswordUserId,
    setResettingPasswordUserId,
  ] = useState(null);

  const [
    resetConfirmationUser,
    setResetConfirmationUser,
  ] = useState(null);

  const [
    deletingUserId,
    setDeletingUserId,
  ] = useState(null);

  const [
    deleteConfirmationUser,
    setDeleteConfirmationUser,
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

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState(null);
  const [openStatusUserId, setOpenStatusUserId] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [editingUsernameUserId, setEditingUsernameUserId] = useState(null);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [savingUsernameUserId, setSavingUsernameUserId] = useState(null);
  const currentUserId = Number(getCurrentUser()?.userId || 0);
  const [formDialog, setFormDialog] = useState({
    open: Boolean(initialFormMode),
    mode: initialFormMode || 'add',
    userId: initialUserId ? String(initialUserId) : '',
  });

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const [
    actionSeverity,
    setActionSeverity,
  ] = useState('info');

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
            ) ||
            normalizeValue(
              translateRole(
                user.role,
              ),
            ).includes(keyword) ||
            normalizeValue(
              translateStatus(
                user.status,
              ),
            ).includes(keyword);

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

  const paginatedUsers = useMemo(
    () => filteredUsers.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredUsers, page],
  );

  useEffect(() => {
    setPage(0);
  }, [searchText, roleFilter, statusFilter]);

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

      color:
        '#2563EB',
    },

    {
      title:
        'ใช้งานอยู่',

      value:
        userSummary.active,

      color:
        '#059669',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        userSummary.inactive,

      color:
        '#64748B',
    },

    {
      title:
        'ถูกล็อก',

      value:
        userSummary.locked,

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

  const handleDeleteUser = async () => {
    const selectedUser = deleteConfirmationUser;
    if (!selectedUser || deletingUserId !== null) return;

    setDeletingUserId(selectedUser.id);
    try {
      const response = await api.delete(`/admin/users/${selectedUser.id}`);
      if (response.data?.status !== 'ok') {
        throw new Error(response.data?.message || 'ไม่สามารถลบบัญชีผู้ใช้ได้');
      }
      setDeleteConfirmationUser(null);
      showMessage('ลบบัญชีผู้ใช้เรียบร้อยแล้ว', 'success');
      await loadUsers();
    } catch (error) {
      showMessage(
        error.response?.data?.message || error.message || 'ไม่สามารถลบบัญชีผู้ใช้ได้',
        'error',
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleStatusChange = async (user, status) => {
    if (!user || user.status === status || updatingStatusUserId !== null) return;
    setUpdatingStatusUserId(user.id);
    setActionMessage('');
    try {
      const response = await api.patch(`/admin/users/${user.id}/status`, { status });
      if (response.data?.status !== 'ok') {
        throw new Error(response.data?.message || 'ไม่สามารถเปลี่ยนสถานะบัญชีได้');
      }
      setUsers((currentUsers) => currentUsers.map((item) => (
        item.id === user.id ? { ...item, status } : item
      )));
      showMessage('เปลี่ยนสถานะบัญชีเรียบร้อยแล้ว', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || error.message || 'ไม่สามารถเปลี่ยนสถานะบัญชีได้', 'error');
    } finally {
      setUpdatingStatusUserId(null);
    }
  };

  const requestStatusChange = (user, status) => {
    if (user.status === status) return;
    if (status === 'Active') {
      handleStatusChange(user, status);
      return;
    }
    setPendingStatusChange({ user, status });
  };

  const handleSaveUsername = async (user) => {
    const username = usernameDraft.trim().toLowerCase();
    if (!/^[a-z0-9._-]{4,50}$/.test(username)) {
      showMessage('ชื่อผู้ใช้ต้องมี 4-50 ตัว และใช้ตัวอักษรอังกฤษพิมพ์เล็ก ตัวเลข จุด ขีดล่าง หรือขีดกลาง', 'error');
      return;
    }
    setSavingUsernameUserId(user.id);
    try {
      const response = await api.put(`/admin/users/${user.id}`, { username, status: user.status });
      if (response.data?.status !== 'ok') throw new Error(response.data?.message || 'ไม่สามารถแก้ชื่อผู้ใช้ได้');
      setUsers((currentUsers) => currentUsers.map((item) => item.id === user.id ? { ...item, username } : item));
      setEditingUsernameUserId(null);
      setUsernameDraft('');
      showMessage('แก้ชื่อผู้ใช้เรียบร้อยแล้ว', 'success');
    } catch (error) {
      showMessage(error.response?.data?.message || error.message || 'ไม่สามารถแก้ชื่อผู้ใช้ได้', 'error');
    } finally {
      setSavingUsernameUserId(null);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <AdminLayout
      activeMenu="User Management"
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button type="button" variant="contained" onClick={() => setFormDialog({ open: true, mode: 'add', userId: '' })}>+ เพิ่มผู้ใช้งาน</Button>
      </Box>
      {/* Header */}

      <Box
        sx={{
          display:
            'none',

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
            '16px',
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

        <Box sx={{ width: { xs: '100%', sm: 'auto' }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: '10px' }}>
        <Button
          type="button"
          variant="contained"
          onClick={() => setFormDialog({ open: true, mode: 'add', userId: '' })}
          sx={{
            minWidth:
              '145px',

            height:
              '40px',

            padding:
              '0 18px',

            backgroundColor:
              '#2563EB',

            color:
              '#FFFFFF',

            borderRadius:
              '9px',

            fontSize:
              '13px',

            fontWeight:
              700,

            textTransform:
              'none',

            boxShadow:
              'none',

            '&:hover': {
              backgroundColor:
                '#1D4ED8',

              boxShadow:
                'none',
            },
          }}
        >
          + เพิ่มผู้ใช้งาน
        </Button>
        </Box>
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

            md:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '16px',

          marginBottom:
            '16px',
        }}
      >
        <InlineListSummary items={summaryCards} sx={{ gridColumn: '1 / -1', marginBottom: 0 }} />
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
            '20px',

          boxShadow:
            '0 4px 16px rgba(15, 23, 42, 0.04)',

          overflow:
            'hidden',
        }}
      >
        {/* Filters */}

        <Box
          sx={{
            padding:
              '20px 22px',
          }}
        >
          <Typography
            sx={{
              color:
                '#111827',

              fontSize:
                '17px',

              fontWeight:
                600,
            }}
          >
            รายการผู้ใช้งาน
          </Typography>

          <DataListToolbar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="ค้นหาชื่อ ชื่อผู้ใช้ หรืออีเมล"
            resultLabel=""
            activeFilters={[
              ...(roleFilter !== 'All' ? [{ key: 'role', label: `บทบาท: ${translateRole(roleFilter)}`, onDelete: () => setRoleFilter('All') }] : []),
              ...(statusFilter !== 'All' ? [{ key: 'status', label: `สถานะ: ${translateStatus(statusFilter)}`, onDelete: () => setStatusFilter('All') }] : []),
            ]}
            onClearFilters={handleClearFilters}
            filters={<><FormControl size="small"><Select value={roleFilter === 'All' ? '' : roleFilter} displayEmpty renderValue={(value) => value ? translateRole(value) : 'บทบาท'} inputProps={{ 'aria-label': 'บทบาท' }} onChange={(event) => setRoleFilter(event.target.value || 'All')}>{roleOptions.map((role) => <MenuItem key={role} value={role}>{translateRole(role)}</MenuItem>)}</Select></FormControl><FormControl size="small"><Select value={statusFilter === 'All' ? '' : statusFilter} displayEmpty renderValue={(value) => value ? translateStatus(value) : 'สถานะ'} inputProps={{ 'aria-label': 'สถานะ' }} onChange={(event) => setStatusFilter(event.target.value || 'All')}>{statusOptions.map((status) => <MenuItem key={status} value={status}>{translateStatus(status)}</MenuItem>)}</Select></FormControl></>}
            sx={{ marginTop: '16px' }}
          />

          <Box
            sx={{
              display:
                'none',

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
            <TextField fullWidth label="ค้นหาผู้ใช้งาน" placeholder="ชื่อผู้ใช้ ชื่อพนักงาน รหัส หรืออีเมล" value={searchText} onChange={(event) => setSearchText(event.target.value)} sx={{ '& .MuiOutlinedInput-root': { height: '44px', borderRadius: '11px', '&.Mui-focused fieldset': { borderColor: '#EA580C' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#EA580C' } }} />

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

              overflowX:
                'auto',
            }}
          >
            <Table
              size="small"
              sx={{
                width:
                  '100%',

                minWidth: '920px',

                tableLayout:
                  'auto',

                '& .MuiTableCell-head': { fontSize: '12px !important', padding: '13px 14px !important', whiteSpace: 'nowrap' },
                '& .MuiTableCell-body': { fontSize: '12px !important', padding: '14px !important' },
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

              <FixedTableBody>
                {paginatedUsers.map(
                  (user) => {
                    const roleStyle =
                      getRoleStyle(
                        user.role,
                      );

                    return (
                      <TableRow
                        key={
                          user.id
                        }
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
                              'normal',

                            overflowWrap:
                              'normal',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {editingUsernameUserId === user.id ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <TextField
                                size="small"
                                value={usernameDraft}
                                autoFocus
                                onChange={(event) => setUsernameDraft(event.target.value.toLowerCase())}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') handleSaveUsername(user);
                                  if (event.key === 'Escape') setEditingUsernameUserId(null);
                                }}
                                inputProps={{ maxLength: 50 }}
                                sx={{ minWidth: 140, '& .MuiInputBase-root': { height: 34, fontSize: '12px' } }}
                              />
                              <Button size="small" disabled={savingUsernameUserId !== null} onClick={() => handleSaveUsername(user)}>บันทึก</Button>
                              <Button size="small" color="secondary" disabled={savingUsernameUserId !== null} onClick={() => setEditingUsernameUserId(null)}>ยกเลิก</Button>
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Box component="span">{user.username}</Box>
                              <Tooltip title="แก้ชื่อผู้ใช้">
                                <IconButton
                                  size="small"
                                  aria-label={`แก้ชื่อผู้ใช้ ${user.username}`}
                                  onClick={() => { setEditingUsernameUserId(user.id); setUsernameDraft(user.username); }}
                                  sx={{ width: 28, height: 28, color: '#2563EB' }}
                                >
                                  <EditRounded sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
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
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '92px',
                              minHeight: '32px',
                              padding: '5px 12px',
                              backgroundColor: roleStyle.backgroundColor,
                              color: roleStyle.color,
                              borderRadius: '999px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              lineHeight: 1.35,
                              textAlign: 'center',
                            }}
                          >
                            {translateRole(user.role)}
                          </Box>
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
                          {user.id === currentUserId ? (
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '118px',
                                minHeight: '36px',
                                px: '14px',
                                borderRadius: '999px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                backgroundColor: getStatusStyle(user.status).backgroundColor,
                                color: getStatusStyle(user.status).color,
                              }}
                            >
                              {translateStatus(user.status)}
                            </Box>
                          ) : (
                          <Select
                            size="small"
                            value={user.status}
                            open={openStatusUserId === user.id}
                            disabled={updatingStatusUserId !== null}
                            onOpen={() => setOpenStatusUserId(user.id)}
                            onClose={() => setOpenStatusUserId(null)}
                            onClick={() => setOpenStatusUserId(user.id)}
                            onChange={(event) => {
                              setOpenStatusUserId(null);
                              requestStatusChange(user, event.target.value);
                            }}
                            sx={{
                              minWidth: '118px',
                              height: '36px',
                              borderRadius: '999px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              backgroundColor: getStatusStyle(user.status).backgroundColor,
                              color: getStatusStyle(user.status).color,
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#EA580C' },
                              '& .MuiSelect-select': { py: 0, pl: '14px' },
                            }}
                          >
                            {statusOptions.map((status) => (
                              <MenuItem key={status} value={status}>{translateStatus(status)}</MenuItem>
                            ))}
                          </Select>
                          )}
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
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <Button
                              type="button"
                              size="small"
                              variant="outlined"
                              onClick={(event) => { event.stopPropagation(); handleOpenResetConfirmation(user); }}
                              disabled={resettingPasswordUserId !== null || user.status === 'Inactive'}
                              sx={{
                                minWidth: '118px',
                                height: '34px',
                                color: '#1D4ED8',
                                borderColor: '#BFDBFE',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
                              }}
                            >
                              รีเซ็ตรหัสผ่าน
                            </Button>
                            {user.status === 'Inactive' ? (
                              <Button
                                type="button"
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDeleteConfirmationUser(user);
                                }}
                                disabled={deletingUserId !== null}
                                sx={{ minWidth: '64px', height: '34px', borderRadius: '8px', fontWeight: 700 }}
                              >
                                ลบ
                              </Button>
                            ) : null}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </FixedTableBody>
            </Table>
            {filteredUsers.length > rowsPerPage ? (
              <TablePagination component="div" count={filteredUsers.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[rowsPerPage]} labelRowsPerPage="" labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.ceil(filteredUsers.length / rowsPerPage)}`} />
            ) : null}
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
                : 'ลองปรับตัวกรองหรือกดกากบาทเพื่อล้างค่า'}
            </Typography>
          </Box>
        )}
      </Paper>

      {formDialog.open ? (
        <UserFormPage
          mode={formDialog.mode}
          dialogOnly
          open={formDialog.open}
          userId={formDialog.userId}
          onClose={() => setFormDialog((current) => ({ ...current, open: false }))}
          onSaved={() => {
            setFormDialog((current) => ({ ...current, open: false }));
            loadUsers();
          }}
        />
      ) : null}

      <Dialog
        open={Boolean(pendingStatusChange)}
        fullWidth
        maxWidth="xs"
        onClose={() => { if (updatingStatusUserId === null) setPendingStatusChange(null); }}
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle sx={{ color: pendingStatusChange?.status === 'Locked' ? '#B45309' : '#B91C1C', fontSize: '20px', fontWeight: 800 }}>
          ยืนยันการเปลี่ยนสถานะบัญชี
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569', fontSize: '14px', lineHeight: 1.7 }}>
            ต้องการเปลี่ยนบัญชี <strong>{pendingStatusChange?.user?.username}</strong> เป็น “{translateStatus(pendingStatusChange?.status)}” ใช่หรือไม่ ผู้ใช้งานจะไม่สามารถเข้าสู่ระบบได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: '8px' }}>
          <Button variant="outlined" color="secondary" disabled={updatingStatusUserId !== null} onClick={() => setPendingStatusChange(null)}>ยกเลิก</Button>
          <Button
            variant="contained"
            color={pendingStatusChange?.status === 'Locked' ? 'warning' : 'error'}
            disabled={updatingStatusUserId !== null}
            onClick={async () => {
              const change = pendingStatusChange;
              if (!change) return;
              await handleStatusChange(change.user, change.status);
              setPendingStatusChange(null);
            }}
          >
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteConfirmationUser)}
        fullWidth
        maxWidth="xs"
        onClose={() => {
          if (deletingUserId === null) setDeleteConfirmationUser(null);
        }}
        PaperProps={{ sx: { borderRadius: '14px' } }}
      >
        <DialogTitle sx={{ color: '#B91C1C', fontSize: '20px', fontWeight: 800 }}>
          ยืนยันการลบบัญชีผู้ใช้
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569', fontSize: '14px', lineHeight: 1.7 }}>
            ต้องการลบบัญชี <strong>{deleteConfirmationUser?.username}</strong> ใช่หรือไม่
            หลังลบแล้วพนักงานจะไม่สามารถเข้าสู่ระบบด้วยบัญชีนี้ได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: '8px' }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => setDeleteConfirmationUser(null)}
            disabled={deletingUserId !== null}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={deletingUserId !== null}
          >
            {deletingUserId !== null ? 'กำลังลบ...' : 'ยืนยันการลบ'}
          </Button>
        </DialogActions>
      </Dialog>

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
            variant="outlined"
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
              minWidth: '96px',
              height: '40px',
              color: '#475569',
              borderColor: '#CBD5E1',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'none',
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

              height:
                '40px',

              backgroundColor:
                '#2563EB',

              borderRadius:
                '9px',

              fontSize:
                '13px',

              fontWeight:
                600,

              textTransform:
                'none',

              boxShadow:
                'none',

              '&:hover': {
                backgroundColor:
                  '#1D4ED8',

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
