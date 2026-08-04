import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import AdminLayout from '../../layouts/adminlayout.jsx';
import api from '../../api/axios.js';

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

const emptyFormData = {
  employeeId: '',
  username: '',
  role: 'Employee',
  status: 'Active',
};

const mapEmployee = (employee) => ({
  id: Number(employee.employeeId),
  employeeCode:
    employee.employeeCode || '',
  employeeName:
    employee.fullName ||
    'Not specified',
  email:
    employee.email || '',
  department:
    employee.department ||
    'Not specified',
  position:
    employee.position ||
    'Not specified',
});

const mapUserAccount = (user) => ({
  id: Number(user.userId),
  employeeId:
    Number(user.employeeId),
  employeeCode:
    user.employeeCode || '',
  employeeName:
    user.fullName ||
    'Not specified',
  email:
    user.email || '',
  department:
    user.department ||
    'Not specified',
  position:
    user.position ||
    'Not specified',
  username:
    user.username || '',
  role:
    formatRole(user.roleName),
  status:
    formatStatus(user.status),
});

function UserFormPage({
  mode = 'add',
}) {
  const navigate =
    useNavigate();

  const {
    userId,
  } = useParams();

  const isEditMode =
    mode === 'edit';

  const numericUserId =
    Number(userId);

  const [
    formData,
    setFormData,
  ] = useState({
    ...emptyFormData,
  });

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    message,
    setMessage,
  ] = useState(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    editUser,
    setEditUser,
  ] = useState(null);

  const [
    employeeDirectory,
    setEmployeeDirectory,
  ] = useState([]);

  const [
    userAccounts,
    setUserAccounts,
  ] = useState([]);

  const [
    isLoadingPage,
    setIsLoadingPage,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadFormData =
      async () => {
        setIsLoadingPage(true);
        setLoadError('');
        setMessage(null);

        try {
          const usersResponse =
            await api.get(
              '/admin/users',
            );
          const accounts =
            Array.isArray(
              usersResponse.data
                ?.users,
            )
              ? usersResponse.data.users.map(
                  mapUserAccount,
                )
              : [];

          if (!isActive) {
            return;
          }

          setUserAccounts(
            accounts,
          );

          if (!isEditMode) {
            const employeesResponse =
              await api.get(
                '/admin/employees/available-for-account',
              );
            const employees =
              Array.isArray(
                employeesResponse.data
                  ?.employees,
              )
                ? employeesResponse.data.employees.map(
                    mapEmployee,
                  )
                : [];

            if (!isActive) {
              return;
            }

            setEmployeeDirectory(
              employees,
            );
            setFormData({
              ...emptyFormData,
            });
            setEditUser(null);
            return;
          }

          const userResponse =
            await api.get(
              `/admin/users/${numericUserId}`,
            );
          const backendUser =
            userResponse.data?.user;

          if (!backendUser) {
            throw new Error(
              'The selected user account was not found.',
            );
          }

          const selectedUser =
            mapUserAccount(
              backendUser,
            );
          const linkedEmployee =
            mapEmployee(
              backendUser,
            );

          if (!isActive) {
            return;
          }

          setEditUser(
            selectedUser,
          );
          setEmployeeDirectory([
            linkedEmployee,
          ]);
          setFormData({
            employeeId:
              String(
                selectedUser.employeeId,
              ),
            username:
              selectedUser.username,
            role:
              selectedUser.role,
            status:
              selectedUser.status,
          });
        } catch (error) {
          if (!isActive) {
            return;
          }

          console.error(
            'Unable to load the user form.',
            error,
          );
          setEmployeeDirectory([]);
          setEditUser(null);
          setLoadError(
            error.response?.data
              ?.message ||
              error.message ||
              'Unable to load the user form.',
          );
        } finally {
          if (isActive) {
            setIsLoadingPage(false);
          }
        }
      };

    loadFormData();

    return () => {
      isActive = false;
    };
  }, [
    isEditMode,
    numericUserId,
    reloadKey,
  ]);

  const employeeOptions =
    useMemo(() => {
      if (isEditMode) {
        const linkedEmployee =
          employeeDirectory.find(
            (employee) =>
              Number(employee.id) ===
              Number(
                editUser?.employeeId ||
                  editUser?.id,
              ),
          );

        if (linkedEmployee) {
          return [
            linkedEmployee,
          ];
        }

        if (editUser) {
          return [
            {
              id:
                Number(
                  editUser.employeeId ||
                    editUser.id,
                ),

              employeeCode:
                editUser.employeeCode ||
                `EMP${String(
                  editUser.employeeId ||
                    editUser.id,
                ).padStart(
                  3,
                  '0',
                )}`,

              employeeName:
                editUser.employeeName ||
                editUser.displayName ||
                editUser.username,

              email:
                editUser.email ||
                '',

              department:
                editUser.department ||
                'Not specified',

              position:
                editUser.position ||
                'Not specified',
            },
          ];
        }

        return [];
      }

      return employeeDirectory.filter(
        (employee) =>
          !userAccounts.some(
            (user) =>
              Number(
                user.employeeId ||
                  user.id,
              ) ===
                Number(
                  employee.id,
                ) ||
              normalizeValue(
                user.employeeCode,
              ) ===
                normalizeValue(
                  employee.employeeCode,
                ),
          ),
      );
    }, [
      isEditMode,
      editUser,
      employeeDirectory,
      userAccounts,
    ]);

  const selectedEmployee =
    useMemo(
      () =>
        employeeOptions.find(
          (employee) =>
            Number(employee.id) ===
            Number(
              formData.employeeId,
            ),
        ) ||
        employeeDirectory.find(
          (employee) =>
            Number(employee.id) ===
            Number(
              formData.employeeId,
            ),
        ) ||
        null,
      [
        employeeOptions,
        employeeDirectory,
        formData.employeeId,
      ],
    );

  const pageTitle =
    isEditMode
      ? 'Edit User Account'
      : 'Add User Account';

  const pageDescription =
    isEditMode
      ? 'Update the username, role and account status of the selected user.'
      : 'Create a system account for an existing employee.';

  const handleEmployeeChange = (
    employeeId,
  ) => {
    const employee =
      employeeOptions.find(
        (item) =>
          Number(item.id) ===
          Number(employeeId),
      );

    setFormData(
      (previousData) => ({
        ...previousData,

        employeeId:
          String(employeeId),

        username:
          previousData.username ||
          normalizeValue(
            employee?.employeeCode,
          ),
      }),
    );

    setErrors(
      (previousErrors) => ({
        ...previousErrors,

        employeeId: '',
        username: '',
      }),
    );

    setMessage(null);
  };

  const handleInputChange = (
    fieldName,
    value,
  ) => {
    setFormData(
      (previousData) => ({
        ...previousData,

        [fieldName]:
          value,
      }),
    );

    setErrors(
      (previousErrors) => ({
        ...previousErrors,

        [fieldName]: '',
      }),
    );

    setMessage(null);
  };

  const validateForm = () => {
    const validationErrors =
      {};

    const normalizedUsername =
      normalizeValue(
        formData.username,
      );

    if (
      !formData.employeeId
    ) {
      validationErrors.employeeId =
        'Please select an employee.';
    }

    if (!normalizedUsername) {
      validationErrors.username =
        'Please enter a username.';
    } else if (
      !/^[a-z0-9._-]{4,50}$/.test(
        normalizedUsername,
      )
    ) {
      validationErrors.username =
        'Use 4–50 lowercase letters, numbers, dots, underscores or hyphens.';
    } else {
      const usernameAlreadyExists =
        userAccounts.some(
          (user) =>
            normalizeValue(
              user.username,
            ) ===
              normalizedUsername &&
            (!isEditMode ||
              Number(user.id) !==
                numericUserId),
        );

      if (
        usernameAlreadyExists
      ) {
        validationErrors.username =
          'This username is already in use.';
      }
    }

    if (!formData.role) {
      validationErrors.role =
        'Please select a role.';
    }

    if (!formData.status) {
      validationErrors.status =
        'Please select an account status.';
    }

    setErrors(
      validationErrors,
    );

    return (
      Object.keys(
        validationErrors,
      ).length === 0
    );
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setMessage(null);

    if (!validateForm()) {
      return;
    }

    if (!selectedEmployee) {
      setMessage({
        severity: 'error',

        text:
          'The selected employee information was not found.',
      });

      return;
    }

    setIsSubmitting(true);

    const submittedData = {
      employeeId:
        Number(
          selectedEmployee.id,
        ),

      employeeCode:
        selectedEmployee
          .employeeCode,

      employeeName:
        selectedEmployee
          .employeeName,

      email:
        selectedEmployee.email,

      department:
        selectedEmployee
          .department,

      position:
        selectedEmployee
          .position,

      username:
        normalizeValue(
          formData.username,
        ),

      role:
        normalizeValue(
          formData.role,
        ),

      status:
        normalizeValue(
          formData.status,
        ),
    };

    try {
      const response =
        isEditMode
          ? await api.put(
              `/admin/users/${numericUserId}`,
              {
                username:
                  submittedData.username,
                role:
                  submittedData.role,
                status:
                  submittedData.status,
              },
            )
          : await api.post(
              '/admin/users',
              {
                employeeId:
                  submittedData.employeeId,
                username:
                  submittedData.username,
                role:
                  submittedData.role,
                status:
                  submittedData.status,
              },
            );

      if (
        response.data?.status !==
        'ok'
      ) {
        throw new Error(
          response.data?.message ||
            'Unable to save the user account.',
        );
      }

      if (isEditMode) {
        window.alert(
          response.data?.message ||
            'User account updated successfully.',
        );
      } else {
        window.alert(
          `User account created successfully.\nInitial password: ${response.data.initialPassword}`,
        );
      }

      navigate(
        '/admin/user-management',
        {
          replace: true,
        },
      );
    } catch (error) {
      setMessage({
        severity: 'error',
        text:
          error.response?.data
            ?.message ||
          error.message ||
          'Unable to save the user account.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(
      '/admin/user-management',
    );
  };

  const handleBack = () => {
    navigate(
      '/admin/user-management',
    );
  };

  const getRoleColor = (
    role,
  ) => {
    const roleColors = {
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
      roleColors[role] || {
        backgroundColor:
          '#F3F4F6',

        color:
          '#4B5563',
      }
    );
  };

  const roleColor =
    getRoleColor(
      formData.role,
    );

  return (
    <AdminLayout activeMenu="User Management">
      <Box
        sx={{
          marginBottom:
            '28px',
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
          {pageTitle}
        </Typography>

        <Typography
          sx={{
            color:
              '#6B7280',

            fontSize:
              '15px',

            marginTop:
              '6px',
          }}
        >
          {pageDescription}
        </Typography>

        <Button
          type="button"
          variant="outlined"
          onClick={
            handleBack
          }
          sx={{
            minWidth:
              '100px',

            height:
              '42px',

            marginTop:
              '16px',

            padding:
              '0 18px',

            backgroundColor:
              '#FFFFFF',

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
          ← Back
        </Button>
      </Box>

      {message && (
        <Alert
          severity={
            message.severity
          }
          onClose={() =>
            setMessage(null)
          }
          sx={{
            marginBottom:
              '24px',

            borderRadius:
              '8px',
          }}
        >
          {message.text}
        </Alert>
      )}

      {isLoadingPage && (
        <Alert
          severity="info"
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          Loading user account information...
        </Alert>
      )}

      {loadError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() =>
                setReloadKey(
                  (value) =>
                    value + 1,
                )
              }
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

      {!isEditMode &&
        !isLoadingPage &&
        !loadError &&
        employeeOptions.length ===
          0 && (
          <Alert
            severity="warning"
            sx={{
              marginBottom: '24px',
              borderRadius: '8px',
            }}
          >
            Every employee currently has a user account.
          </Alert>
        )}

      <Box
        component="form"
        onSubmit={
          handleSubmit
        }
        noValidate
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
            }}
          >
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
              User Account Information
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
              Select an employee and configure their system account.
            </Typography>
          </Box>

          <Box
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '28px',
              },

              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'repeat(2, minmax(0, 1fr))',
              },

              gap:
                '22px',
            }}
          >
            <FormControl
              fullWidth
              required
              error={Boolean(
                errors.employeeId,
              )}
              disabled={
                isEditMode ||
                isLoadingPage
              }
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },
              }}
            >
              <InputLabel id="user-employee-label">
                Employee
              </InputLabel>

              <Select
                labelId="user-employee-label"
                value={
                  formData.employeeId
                }
                label="Employee"
                onChange={(
                  event,
                ) =>
                  handleEmployeeChange(
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius:
                    '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        '#EA580C',
                    },
                }}
              >
                {employeeOptions.map(
                  (employee) => (
                    <MenuItem
                      key={
                        employee.id
                      }
                      value={
                        String(
                          employee.id,
                        )
                      }
                    >
                      {employee.employeeCode}{' '}
                      —{' '}
                      {employee.employeeName}
                    </MenuItem>
                  ),
                )}
              </Select>

              <FormHelperText>
                {errors.employeeId ||
                  (isEditMode
                    ? 'The linked employee cannot be changed while editing.'
                    : employeeOptions.length >
                        0
                      ? 'Only employees without an existing account are shown.'
                      : 'Every employee currently has a user account.')}
              </FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Username"
              value={
                formData.username
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'username',

                  event.target.value.toLowerCase(),
                )
              }
              error={Boolean(
                errors.username,
              )}
              helperText={
                errors.username ||
                'Example: employee007'
              }
              autoComplete="off"
              slotProps={{
                htmlInput: {
                  maxLength:
                    50,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',

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

            <FormControl
              fullWidth
              required
              error={Boolean(
                errors.role,
              )}
            >
              <InputLabel id="user-role-label">
                Role
              </InputLabel>

              <Select
                labelId="user-role-label"
                value={
                  formData.role
                }
                label="Role"
                onChange={(
                  event,
                ) =>
                  handleInputChange(
                    'role',

                    event.target.value,
                  )
                }
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
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

              {errors.role && (
                <FormHelperText>
                  {errors.role}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              required
              error={Boolean(
                errors.status,
              )}
            >
              <InputLabel id="user-status-label">
                Account Status
              </InputLabel>

              <Select
                labelId="user-status-label"
                value={
                  formData.status
                }
                label="Account Status"
                onChange={(
                  event,
                ) =>
                  handleInputChange(
                    'status',

                    event.target.value,
                  )
                }
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
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

              {errors.status && (
                <FormHelperText>
                  {errors.status}
                </FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              disabled
              label="Initial Password"
              value={
                isEditMode
                  ? 'Password already created'
                  : 'Generated securely after saving'
              }
              helperText={
                isEditMode
                  ? 'Use Reset Password from User Management when necessary.'
                  : 'The user can sign in with this password after the account is created.'
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />
          </Box>

          <Box
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '22px 28px',
              },

              display:
                'flex',

              justifyContent:
                'flex-end',

              flexDirection: {
                xs:
                  'column-reverse',

                sm:
                  'row',
              },

              gap:
                '12px',

              backgroundColor:
                '#F9FAFB',

              borderTop:
                '1px solid #E5E7EB',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              disabled={
                isSubmitting
              }
              onClick={
                handleCancel
              }
              sx={{
                minWidth:
                  '110px',

                height:
                  '44px',

                padding:
                  '0 20px',

                color:
                  '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                textTransform:
                  'none',
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmitting ||
                isLoadingPage ||
                Boolean(loadError) ||
                (!isEditMode &&
                  employeeOptions.length ===
                    0)
              }
              sx={{
                minWidth:
                  '150px',

                height:
                  '44px',

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
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create User'}
            </Button>
          </Box>
        </Paper>

        <Box
          sx={{
            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '24px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '24px',
              },

              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius:
                '12px',
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
              Account Preview
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '13px',

                lineHeight:
                  1.6,

                marginTop:
                  '5px',
              }}
            >
              Review the employee and account information before saving.
            </Typography>

            <Box
              sx={{
                display:
                  'flex',

                flexDirection:
                  'column',

                gap:
                  '18px',

                marginTop:
                  '22px',
              }}
            >
              {[
                {
                  label:
                    'Employee',

                  value:
                    selectedEmployee
                      ?.employeeName ||
                    'Not selected',
                },
                {
                  label:
                    'Employee ID',

                  value:
                    selectedEmployee
                      ?.employeeCode ||
                    'Not selected',
                },
                {
                  label:
                    'Department',

                  value:
                    selectedEmployee
                      ?.department ||
                    'Not selected',
                },
                {
                  label:
                    'Position',

                  value:
                    selectedEmployee
                      ?.position ||
                    'Not selected',
                },
                {
                  label:
                    'Email Address',

                  value:
                    selectedEmployee
                      ?.email ||
                    'Not selected',
                },
                {
                  label:
                    'Username',

                  value:
                    formData.username.trim() ||
                    'Not entered',
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
                          '#9CA3AF',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.5px',
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '14px',

                        fontWeight:
                          700,

                        lineHeight:
                          1.5,

                        marginTop:
                          '4px',

                        wordBreak:
                          'break-word',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>

            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                flexWrap:
                  'wrap',

                gap:
                  '10px',

                paddingTop:
                  '20px',

                marginTop:
                  '20px',

                borderTop:
                  '1px solid #E5E7EB',
              }}
            >
              <Chip
                label={
                  formData.role
                }
                size="small"
                sx={{
                  minWidth:
                    '86px',

                  backgroundColor:
                    roleColor.backgroundColor,

                  color:
                    roleColor.color,

                  borderRadius:
                    '999px',

                  fontSize:
                    '11px',

                  fontWeight:
                    700,
                }}
              />

              <Chip
                label={
                  formData.status
                }
                size="small"
                sx={{
                  minWidth:
                    '76px',

                  backgroundColor:
                    formData.status ===
                    'Active'
                      ? '#DCFCE7'
                      : formData.status ===
                          'Locked'
                        ? '#FEE2E2'
                        : '#FEF3C7',

                  color:
                    formData.status ===
                    'Active'
                      ? '#15803D'
                      : formData.status ===
                          'Locked'
                        ? '#B91C1C'
                        : '#B45309',

                  borderRadius:
                    '999px',

                  fontSize:
                    '11px',

                  fontWeight:
                    700,
                }}
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              padding: {
                xs:
                  '20px',

                sm:
                  '24px',
              },

              backgroundColor:
                '#FFF7ED',

              border:
                '1px solid #FED7AA',

              borderRadius:
                '12px',
            }}
          >
            <Typography
              sx={{
                color:
                  '#C2410C',

                fontSize:
                  '15px',

                fontWeight:
                  800,
              }}
            >
              Initial Password
            </Typography>

            <Typography
              sx={{
                color:
                  '#9A3412',

                fontSize:
                  '13px',

                lineHeight:
                  1.7,

                marginTop:
                  '8px',
              }}
            >
              New accounts receive a securely generated initial password after saving. It is shown only once, and the user can replace it from the Change Password page.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </AdminLayout>
  );
}

export default UserFormPage;
