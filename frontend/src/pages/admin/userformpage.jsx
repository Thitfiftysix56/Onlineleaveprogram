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
import TemporaryPasswordDialog from '../../components/temporarypassworddialog.jsx';

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

const roleDisplayLabels = {
  Employee: 'พนักงาน',
  Supervisor: 'หัวหน้างาน',
  HR: 'ฝ่ายทรัพยากรบุคคล',
  Admin: 'ผู้ดูแลระบบ',
};

const statusDisplayLabels = {
  Active: 'ใช้งาน',
  Inactive: 'ไม่ใช้งาน',
  Locked: 'ถูกล็อก',
};

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
    'ไม่ระบุ',
  email:
    employee.email || '',
  department:
    employee.department ||
    'ไม่ระบุ',
  position:
    employee.position ||
    'ไม่ระบุ',
});

const mapUserAccount = (user) => ({
  id: Number(user.userId),
  employeeId:
    Number(user.employeeId),
  employeeCode:
    user.employeeCode || '',
  employeeName:
    user.fullName ||
    'ไม่ระบุ',
  email:
    user.email || '',
  department:
    user.department ||
    'ไม่ระบุ',
  position:
    user.position ||
    'ไม่ระบุ',
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
    temporaryPasswordResult,
    setTemporaryPasswordResult,
  ] = useState(null);

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
            'ไม่สามารถโหลดแบบฟอร์มบัญชีผู้ใช้ได้',
            error,
          );
          setEmployeeDirectory([]);
          setEditUser(null);
          setLoadError(
            error.response?.data
              ?.message ||
              error.message ||
              'ไม่สามารถโหลดแบบฟอร์มบัญชีผู้ใช้ได้',
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
                'ไม่ระบุ',

              position:
                editUser.position ||
                'ไม่ระบุ',
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
      ? 'แก้ไขบัญชีผู้ใช้'
      : 'เพิ่มบัญชีผู้ใช้';

  const pageDescription =
    isEditMode
      ? 'แก้ไขชื่อผู้ใช้ บทบาท และสถานะบัญชีของผู้ใช้ที่เลือก'
      : 'สร้างบัญชีระบบให้พนักงานที่มีอยู่';

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
        'กรุณาเลือกพนักงาน';
    }

    if (!normalizedUsername) {
      validationErrors.username =
        'กรุณากรอกชื่อผู้ใช้';
    } else if (
      !/^[a-z0-9._-]{4,50}$/.test(
        normalizedUsername,
      )
    ) {
      validationErrors.username =
        'ใช้ตัวอักษรภาษาอังกฤษพิมพ์เล็ก ตัวเลข จุด ขีดล่าง หรือขีดกลาง จำนวน 4–50 ตัวอักษร';
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
          'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว';
      }
    }

    if (!formData.role) {
      validationErrors.role =
        'กรุณาเลือกบทบาท';
    }

    if (!formData.status) {
      validationErrors.status =
        'กรุณาเลือกสถานะบัญชี';
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
          'ไม่พบข้อมูลพนักงานที่เลือก',
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
            'ไม่สามารถบันทึกบัญชีผู้ใช้ได้',
        );
      }

      if (isEditMode) {
        window.alert(
          response.data?.message ||
            'อัปเดตบัญชีผู้ใช้เรียบร้อยแล้ว',
        );

        navigate(
          '/admin/user-management',
          {
            replace: true,
          },
        );
      } else {
        if (!response.data?.temporaryPassword) {
          throw new Error(
            'สร้างบัญชีผู้ใช้แล้ว แต่ระบบไม่ได้ส่งรหัสผ่านชั่วคราวกลับมา',
          );
        }

        setTemporaryPasswordResult({
          username:
            response.data.username ||
            submittedData.username,
          temporaryPassword:
            response.data.temporaryPassword,
        });
      }
    } catch (error) {
      setMessage({
        severity: 'error',
        text:
          error.response?.data
            ?.message ||
          error.message ||
          'ไม่สามารถบันทึกบัญชีผู้ใช้ได้',
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

  const handleCloseTemporaryPassword = () => {
    setTemporaryPasswordResult(null);
    navigate(
      '/admin/user-management',
      { replace: true },
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
          ← กลับ
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
          กำลังโหลดข้อมูลบัญชีผู้ใช้...
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
              ลองอีกครั้ง
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
            พนักงานทุกคนมีบัญชีผู้ใช้แล้ว
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
              ข้อมูลบัญชีผู้ใช้
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
              เลือกพนักงานและกำหนดค่าบัญชีสำหรับเข้าใช้งานระบบ
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
                พนักงาน
              </InputLabel>

              <Select
                labelId="user-employee-label"
                value={
                  formData.employeeId
                }
                label="พนักงาน"
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
                    ? 'ไม่สามารถเปลี่ยนพนักงานที่เชื่อมโยงไว้ขณะแก้ไขบัญชี'
                    : employeeOptions.length >
                        0
                      ? 'แสดงเฉพาะพนักงานที่ยังไม่มีบัญชีผู้ใช้'
                      : 'พนักงานทุกคนมีบัญชีผู้ใช้แล้ว')}
              </FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              required
              label="ชื่อผู้ใช้"
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
                'ตัวอย่าง: employee007'
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
                บทบาท
              </InputLabel>

              <Select
                labelId="user-role-label"
                value={
                  formData.role
                }
                label="บทบาท"
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
                      {roleDisplayLabels[role] || role}
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
                สถานะบัญชี
              </InputLabel>

              <Select
                labelId="user-status-label"
                value={
                  formData.status
                }
                label="สถานะบัญชี"
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
                      {statusDisplayLabels[status] || status}
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
              label="รหัสผ่านเริ่มต้น"
              value={
                isEditMode
                  ? 'สร้างรหัสผ่านแล้ว'
                  : 'ระบบจะสร้างอย่างปลอดภัยหลังบันทึก'
              }
              helperText={
                isEditMode
                  ? 'หากจำเป็น ให้ใช้คำสั่งรีเซ็ตรหัสผ่านจากหน้าจัดการผู้ใช้'
                  : 'ผู้ใช้สามารถเข้าสู่ระบบด้วยรหัสผ่านนี้หลังสร้างบัญชีแล้ว'
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
              ยกเลิก
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
                ? 'กำลังบันทึก...'
                : isEditMode
                  ? 'บันทึกการแก้ไข'
                  : 'สร้างผู้ใช้'}
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
              ตัวอย่างข้อมูลบัญชี
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
              ตรวจสอบข้อมูลพนักงานและบัญชีก่อนบันทึก
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
                    'พนักงาน',

                  value:
                    selectedEmployee
                      ?.employeeName ||
                    'ยังไม่ได้เลือก',
                },
                {
                  label:
                    'รหัสพนักงาน',

                  value:
                    selectedEmployee
                      ?.employeeCode ||
                    'ยังไม่ได้เลือก',
                },
                {
                  label:
                    'แผนก',

                  value:
                    selectedEmployee
                      ?.department ||
                    'ยังไม่ได้เลือก',
                },
                {
                  label:
                    'ตำแหน่ง',

                  value:
                    selectedEmployee
                      ?.position ||
                    'ยังไม่ได้เลือก',
                },
                {
                  label:
                    'อีเมล',

                  value:
                    selectedEmployee
                      ?.email ||
                    'ยังไม่ได้เลือก',
                },
                {
                  label:
                    'ชื่อผู้ใช้',

                  value:
                    formData.username.trim() ||
                    'ยังไม่ได้กรอก',
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
                  roleDisplayLabels[formData.role] || formData.role
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
                  statusDisplayLabels[formData.status] || formData.status
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
              รหัสผ่านเริ่มต้น
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
              บัญชีใหม่จะได้รับรหัสผ่านเริ่มต้นที่ระบบสร้างอย่างปลอดภัยหลังบันทึก รหัสผ่านจะแสดงเพียงครั้งเดียว และผู้ใช้สามารถเปลี่ยนได้จากหน้าเปลี่ยนรหัสผ่าน
            </Typography>
          </Paper>
        </Box>
      </Box>

      <TemporaryPasswordDialog
        open={Boolean(temporaryPasswordResult)}
        title="สร้างบัญชีผู้ใช้เรียบร้อยแล้ว"
        username={temporaryPasswordResult?.username || ''}
        temporaryPassword={temporaryPasswordResult?.temporaryPassword || ''}
        onClose={handleCloseTemporaryPassword}
      />
    </AdminLayout>
  );
}

export default UserFormPage;
