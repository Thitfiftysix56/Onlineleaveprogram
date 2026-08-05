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
  useNavigate,
} from 'react-router-dom';

import AdminLayout from '../../layouts/adminlayout.jsx';
import api from '../../api/axios.js';
import TemporaryPasswordDialog from '../../components/temporarypassworddialog.jsx';

import {
  updateAuthUserRole,
} from '../../utils/authstorage.js';

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
    ] ||
    'Employee'
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

const formatDateTime = (value) => {
  if (
    !value ||
    normalizeValue(value) ===
      'never'
  ) {
    return 'Never';
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

const getRoleStyle = (role) => {
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
            'Unable to load user accounts.',
        );
      }

      setUsers(
        responseUsers.map(
          (user) => ({
            id: user.userId,
            employeeId:
              user.employeeId,
            employeeCode:
              user.employeeCode ||
              'Not specified',
            username:
              user.username || '',
            employeeName:
              user.fullName ||
              'Not specified',
            email:
              user.email ||
              'Not specified',
            roleId: user.roleId,
            role: formatRole(
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
          'Unable to load user accounts.',
      );
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleClearFilters =
    () => {
      setSearchText('');
      setRoleFilter('All');
      setStatusFilter('All');
    };

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
          'Unable to update the user role.',
        'error',
      );

      return;
    }

    loadUsers();

    showMessage(
      `${selectedUser.username} role was changed to ${nextRole}.`,
      'success',
    );
  };

  const handleStatusChange = async (
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
            status: nextStatus,
          },
        );

      if (
        response.data?.status !==
        'ok'
      ) {
        throw new Error(
          response.data?.message ||
            'Unable to update the account status.',
        );
      }

      await loadUsers();

      showMessage(
        response.data?.message ||
          `${selectedUser.username} status was changed to ${nextStatus}.`,
        'success',
      );
    } catch (error) {
      showMessage(
        error.response?.data
          ?.message ||
          error.message ||
          'Unable to update the account status.',
        'error',
      );
    } finally {
      setUpdatingStatusUserId(
        null,
      );
    }
  };

  const handleOpenResetConfirmation = (
    selectedUser,
  ) => {
    if (resettingPasswordUserId !== null) return;

    setActionMessage('');
    setResetConfirmationUser(selectedUser);
  };

  const handleResetPassword = async () => {
    const selectedUser = resetConfirmationUser;

    if (
      !selectedUser ||
      resettingPasswordUserId !== null
    ) return;

    setResettingPasswordUserId(
      selectedUser.id,
    );

    try {
      const response = await api.post(
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
            'Password reset response did not include a temporary password.',
        );
      }

      setResetConfirmationUser(null);
      setTemporaryPasswordResult({
        username:
          response.data.username ||
          selectedUser.username,
        temporaryPassword:
          response.data.temporaryPassword,
      });

      showMessage(
        response.data?.message ||
          'Password reset successfully.',
        'success',
      );
    } catch (error) {
      showMessage(
        error.response?.data
          ?.message ||
          error.message ||
          'Unable to reset the password.',
        'error',
      );
    } finally {
      setResettingPasswordUserId(
        null,
      );
    }
  };

  const handleCloseTemporaryPassword = () => {
    setTemporaryPasswordResult(null);
  };

  const summaryCards = [
    {
      title: 'Total Users',
      value: userSummary.total,
      color: '#EA580C',
      backgroundColor: '#FFF7ED',
    },

    {
      title: 'Active Users',
      value: userSummary.active,
      color: '#059669',
      backgroundColor: '#ECFDF5',
    },

    {
      title: 'Inactive Users',
      value: userSummary.inactive,
      color: '#D97706',
      backgroundColor: '#FFFBEB',
    },

    {
      title: 'Locked Users',
      value: userSummary.locked,
      color: '#DC2626',
      backgroundColor: '#FEF2F2',
    },
  ];

  return (
    <AdminLayout activeMenu="User Management">
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
            User Management
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            Create, review and manage system user accounts.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={() =>
            navigate(
              '/admin/user-management/add',
            )
          }
          sx={{
            minWidth: '130px',
            height: '44px',
            padding: '0 20px',
            backgroundColor: '#EA580C',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',

            '&:hover': {
              backgroundColor: '#C2410C',
              boxShadow: 'none',
            },
          }}
        >
          + Add User
        </Button>
      </Box>

      {actionMessage && (
        <Alert
          severity={
            actionSeverity
          }
          onClose={() =>
            setActionMessage('')
          }
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {actionMessage}
        </Alert>
      )}

      {loadError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={loadUsers}
            >
              Retry
            </Button>
          }
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {loadError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',

            sm:
              'repeat(2, minmax(0, 1fr))',

            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <Paper
              key={card.title}
              elevation={0}
              sx={{
                padding: '20px',

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
                  width: '44px',
                  height: '44px',

                  display: 'flex',

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
                    '18px',

                  fontWeight:
                    800,
                }}
              >
                {card.value}
              </Box>

              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '15px',
                  fontWeight: 800,
                  marginTop: '14px',
                }}
              >
                {card.title}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

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
              xs: '20px',
              sm: '24px',
            },

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color: '#111827',
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            User Account List
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            Showing {filteredUsers.length} of {users.length}{' '}
            accounts
          </Typography>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                lg:
                  'minmax(300px, 2fr) minmax(180px, 1fr) minmax(180px, 1fr) auto',
              },

              gap: '16px',
              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search User"
              placeholder="Username, employee, code or email"
              value={searchText}
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
                    height: '48px',
                    borderRadius: '8px',

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          '#EA580C',
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color: '#EA580C',
                  },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="user-role-filter-label">
                Role
              </InputLabel>

              <Select
                labelId="user-role-filter-label"
                value={roleFilter}
                label="Role"
                onChange={(
                  event,
                ) =>
                  setRoleFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="All">
                  All Roles
                </MenuItem>

                {roleOptions.map(
                  (role) => (
                    <MenuItem
                      key={role}
                      value={role}
                    >
                      {role}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="user-status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="user-status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="All">
                  All Statuses
                </MenuItem>

                {statusOptions.map(
                  (status) => (
                    <MenuItem
                      key={status}
                      value={status}
                    >
                      {status}
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
                minWidth: '110px',
                height: '48px',
                padding: '0 18px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor:
                    '#F9FAFB',

                  borderColor:
                    '#9CA3AF',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {isLoadingUsers ? (
          <Box
            sx={{
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              color: '#6B7280',
            }}
          >
            <CircularProgress
              size={32}
              sx={{
                color: '#EA580C',
              }}
            />

            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              Loading user accounts...
            </Typography>
          </Box>
        ) : filteredUsers.length >
        0 ? (
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <Table
              sx={{
                minWidth:
                  '1450px',
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
                    'Email',
                    'Role',
                    'Status',
                    'Last Login',
                    'Actions',
                  ].map(
                    (heading) => (
                      <TableCell
                        key={
                          heading
                        }
                        align={
                          heading ===
                          'Actions'
                            ? 'right'
                            : 'left'
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
                        key={user.id}
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
                              800,

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {user.username}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '14px',

                              fontWeight:
                                700,
                            }}
                          >
                            {user.employeeName}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#9CA3AF',

                              fontSize:
                                '12px',

                              marginTop:
                                '3px',
                            }}
                          >
                            {user.employeeCode}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#4B5563',

                            fontSize:
                              '13px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {user.email}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <FormControl
                            size="small"
                            sx={{
                              minWidth:
                                '130px',
                            }}
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
                                  event
                                    .target
                                    .value,
                                )
                              }
                              sx={{
                                height:
                                  '36px',

                                backgroundColor:
                                  roleStyle
                                    .backgroundColor,

                                color:
                                  roleStyle
                                    .color,

                                borderRadius:
                                  '8px',

                                fontSize:
                                  '12px',

                                fontWeight:
                                  700,

                                '& .MuiOutlinedInput-notchedOutline':
                                  {
                                    borderColor:
                                      roleStyle
                                        .color,
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
                                    {role}
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <FormControl
                            size="small"
                            sx={{
                              minWidth:
                                '120px',
                            }}
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
                                  event
                                    .target
                                    .value,
                                )
                              }
                              sx={{
                                height:
                                  '36px',

                                backgroundColor:
                                  statusStyle
                                    .backgroundColor,

                                color:
                                  statusStyle
                                    .color,

                                borderRadius:
                                  '8px',

                                fontSize:
                                  '12px',

                                fontWeight:
                                  700,

                                '& .MuiOutlinedInput-notchedOutline':
                                  {
                                    borderColor:
                                      statusStyle
                                        .color,
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
                                    {status}
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
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
                          {user.lastLogin}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Box
                            sx={{
                              display:
                                'flex',

                              justifyContent:
                                'flex-end',

                              gap:
                                '8px',
                            }}
                          >
                            <Button
                              type="button"
                              variant="outlined"
                              disabled={
                                Number(
                                  resettingPasswordUserId,
                                ) ===
                                Number(
                                  user.id,
                                )
                              }
                              onClick={() =>
                                navigate(
                                  `/admin/user-management/${user.id}/edit`,
                                )
                              }
                              sx={{
                                minWidth:
                                  '68px',

                                height:
                                  '36px',

                                padding:
                                  '0 12px',

                                color:
                                  '#EA580C',

                                borderColor:
                                  '#EA580C',

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
                                      '#FFF7ED',

                                    borderColor:
                                      '#C2410C',
                                  },
                              }}
                            >
                              Edit
                            </Button>

                            <Button
                              type="button"
                              variant="outlined"
                              disabled={
                                resettingPasswordUserId !== null
                              }
                              onClick={() =>
                                handleOpenResetConfirmation(
                                  user,
                                )
                              }
                              sx={{
                                minWidth:
                                  '118px',

                                height:
                                  '36px',

                                padding:
                                  '0 12px',

                                color:
                                  '#7C3AED',

                                borderColor:
                                  '#7C3AED',

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
                                      '#F5F3FF',

                                    borderColor:
                                      '#6D28D9',
                                  },
                              }}
                            >
                              {Number(
                                resettingPasswordUserId,
                              ) === Number(user.id)
                                ? 'Resetting...'
                                : 'Reset Password'}
                            </Button>
                          </Box>
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
                  '64px',

                height:
                  '64px',

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
                  '24px',

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
                  '18px',

                fontWeight:
                  800,

                marginTop:
                  '16px',
              }}
            >
              No user accounts found
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '14px',

                marginTop:
                  '6px',
              }}
            >
              {users.length === 0
                ? 'No user accounts are available in the database.'
                : 'Try changing or clearing the selected filters.'}
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                height:
                  '42px',

                marginTop:
                  '20px',

                padding:
                  '0 18px',

                color:
                  '#EA580C',

                borderColor:
                  '#EA580C',

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#FFF7ED',

                  borderColor:
                    '#C2410C',
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog
        open={Boolean(resetConfirmationUser)}
        fullWidth
        maxWidth="sm"
        onClose={() => {
          if (resettingPasswordUserId === null) {
            setResetConfirmationUser(null);
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirm Password Reset
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            sx={{
              color: '#374151',
              fontSize: '14px',
              lineHeight: 1.7,
            }}
          >
            You are resetting the password for:
          </Typography>
          <Box
            sx={{
              padding: '16px',
              marginTop: '14px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          >
            <Typography sx={{ fontWeight: 800 }}>
              {resetConfirmationUser?.username}
            </Typography>
            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                marginTop: '4px',
              }}
            >
              {resetConfirmationUser?.employeeName}
            </Typography>
            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                marginTop: '4px',
              }}
            >
              Role: {resetConfirmationUser?.role || '-'}
            </Typography>
          </Box>
          <Alert
            severity="warning"
            sx={{ marginTop: '18px' }}
          >
            The current password will stop working immediately. The user must sign in with the new temporary password and change it before accessing the system.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button
            type="button"
            onClick={() =>
              setResetConfirmationUser(null)
            }
            disabled={resettingPasswordUserId !== null}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleResetPassword}
            disabled={resettingPasswordUserId !== null}
            sx={{
              backgroundColor: '#7C3AED',
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            {resettingPasswordUserId !== null
              ? 'Resetting...'
              : 'Confirm Reset'}
          </Button>
        </DialogActions>
      </Dialog>

      <TemporaryPasswordDialog
        open={Boolean(temporaryPasswordResult)}
        username={temporaryPasswordResult?.username || ''}
        temporaryPassword={temporaryPasswordResult?.temporaryPassword || ''}
        onClose={handleCloseTemporaryPassword}
      />
    </AdminLayout>
  );
}

export default UserManagementPage;
