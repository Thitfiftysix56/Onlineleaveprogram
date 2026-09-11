import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import HRLayout from '../../layouts/hrlayout.jsx';
import { PageHeader } from '../../components/sharedvisualfoundation.jsx';
import { roleDashboardCardSurfaceSx } from '../../theme/rolecardsurface.js';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getDepartments } from '../../api/department-service.js';
import { getPositions } from '../../api/position-service.js';
import {
  createEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from '../../api/employee-service.js';

function formatThaiDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function ThaiDateField({ label, value, onChange, error, helperText }) {
  const pickerRef = useRef(null);
  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      if (typeof picker.showPicker === 'function') picker.showPicker();
      else picker.click();
    } catch {
      picker.click();
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        required
        label={label}
        value={formatThaiDate(value)}
        placeholder="วว/ดด/ปปปป"
        error={error}
        helperText={helperText}
        onClick={openPicker}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: <InputAdornment position="end"><IconButton type="button" aria-label={`เลือก${label}`} onClick={openPicker} edge="end"><CalendarMonthRounded fontSize="small" /></IconButton></InputAdornment>,
          },
          inputLabel: { shrink: true },
        }}
        sx={{
          '& .MuiOutlinedInput-root': { borderRadius: '8px', '&.Mui-focused fieldset': { borderColor: '#059669' } },
          '& .MuiInputBase-input::placeholder': { opacity: 1, color: '#64748B' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#059669' },
        }}
      />
      <input ref={pickerRef} type="date" value={value} onChange={(event) => onChange(event.target.value)} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', insetInlineStart: 0, bottom: 0 }} />
    </Box>
  );
}

function EmployeeFormPage({ mode = 'add' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeId } = useParams();
  const isEditMode = mode === 'edit';
  const returnTo =
    typeof location.state?.returnTo === 'string' &&
    location.state.returnTo.startsWith('/')
      ? location.state.returnTo
      : '/hr/employee-management';
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    supervisor: '',
    role: 'Employee',
    employmentDate: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationError, setConfirmationError] = useState('');

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  const roles = [
    'Employee',
    'Supervisor',
    'HR',
    'Admin',
  ];

  useEffect(() => {
    let active = true;
    const loadForm = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const [departmentRows, positionRows, employeeRows, employee] = await Promise.all([
          getDepartments(),
          getPositions(),
          getEmployees({ status: 'active' }),
          isEditMode ? getEmployee(employeeId) : Promise.resolve(null),
        ]);
        if (!active) return;
        setDepartments(departmentRows.filter((item) => item.isActive));
        setPositions(positionRows.filter((item) => item.isActive));
        setSupervisors(employeeRows.filter((item) => Number(item.employeeId) !== Number(employeeId)));
        if (employee) {
          setFormData({
            employeeId: employee.employeeCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone || '',
            department: employee.departmentId,
            position: employee.positionId,
            supervisor: employee.supervisorId || '',
            role: employee.roleName || 'Employee',
            employmentDate: String(employee.hireDate).slice(0, 10),
            status: employee.status.charAt(0).toUpperCase() + employee.status.slice(1),
          });
        }
      } catch (error) {
        if (active) setErrorMessage(error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลพนักงานได้');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadForm();
    return () => { active = false; };
  }, [employeeId, isEditMode]);

  const handleInputChange = (fieldName, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [fieldName]: value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [fieldName]: '',
    }));

    setSuccessMessage('');
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.firstName.trim()) {
      validationErrors.firstName =
        'กรุณากรอกชื่อ';
    }

    if (!formData.lastName.trim()) {
      validationErrors.lastName =
        'กรุณากรอกนามสกุล';
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        'กรุณากรอกอีเมล';
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(formData.email.trim())) {
        validationErrors.email =
          'รูปแบบอีเมลไม่ถูกต้อง';
      }
    }

    if (!formData.phone.trim()) {
      validationErrors.phone =
        'กรุณากรอกเบอร์โทรศัพท์';
    } else {
      const phonePattern = /^[0-9+\-\s()]{8,20}$/;

      if (!phonePattern.test(formData.phone.trim())) {
        validationErrors.phone =
          'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
      }
    }

    if (!formData.department) {
      validationErrors.department =
        'กรุณาเลือกแผนก';
    }

    if (!formData.position) {
      validationErrors.position =
        'กรุณาเลือกตำแหน่ง';
    }

    if (!formData.role) {
      validationErrors.role =
        'กรุณาเลือกบทบาท';
    }

    if (!formData.employmentDate) {
      validationErrors.employmentDate =
        'กรุณาเลือกวันที่เริ่มงาน';
    }

    if (!formData.status) {
      validationErrors.status =
        'กรุณาเลือกสถานะพนักงาน';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');
    setConfirmationError('');

    if (!validateForm()) {
      return;
    }

    setConfirmationOpen(true);
  };

  const confirmSave = async () => {
    const employeeData = {
      ...(isEditMode ? { employeeCode: formData.employeeId.trim() } : {}),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      departmentId: Number(formData.department),
      positionId: Number(formData.position),
      supervisorId: formData.supervisor ? Number(formData.supervisor) : null,
      hireDate: formData.employmentDate,
      status: formData.status,
    };
    setSaving(true);
    setConfirmationError('');
    try {
      const result = isEditMode
        ? await updateEmployee(employeeId, employeeData)
        : await createEmployee(employeeData);
      setConfirmationOpen(false);
      setConfirmationError('');
      setSuccessMessage(result.message || `${isEditMode ? 'แก้ไข' : 'เพิ่ม'}พนักงานเรียบร้อยแล้ว`);
      window.setTimeout(() => navigate(returnTo), 500);
    } catch (error) {
      const message = error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลพนักงานได้';
      setErrorMessage(message);
      setConfirmationError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <HRLayout activeMenu="Employee Management">
      <PageHeader title={isEditMode ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'} sx={{ maxWidth: '900px', marginInline: 'auto' }} />

      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage('')}
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {successMessage}
        </Alert>
      )}

      {(errorMessage || loading) && (
        <Alert severity={errorMessage ? 'error' : 'info'} sx={{ marginBottom: '24px', borderRadius: '8px' }}>
          {errorMessage || 'กำลังโหลดข้อมูลพนักงาน...'}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 0,
          width: '100%',
          maxWidth: '900px',
          marginInline: 'auto',
          ...roleDashboardCardSurfaceSx,
          padding: {
            xs: '20px',
            sm: '28px 32px',
          },
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 82%, var(--role-soft, #ECFDF5) 100%)',
          border: 0,
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
          '& > .MuiPaper-root': {
            background: 'transparent !important',
            border: '0 !important',
            borderRadius: '0 !important',
            boxShadow: 'none !important',
            overflow: 'visible',
          },
          '& > .MuiPaper-root > .MuiBox-root:first-of-type': {
            background: 'transparent !important',
            borderBottom: '0 !important',
            padding: {
              xs: '8px 0 10px',
              sm: '10px 4px 12px',
            },
          },
          '& > .MuiPaper-root > .MuiBox-root:last-of-type': {
            padding: {
              xs: '12px 0 24px',
              sm: '14px 4px 28px',
            },
          },
          '& > .MuiPaper-root + .MuiPaper-root': {
            marginTop: '2px',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
          },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              ข้อมูลส่วนตัว
            </Typography>

          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '28px',
              },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: '22px',
            }}
          >
            <TextField
              fullWidth
              label="รหัสพนักงาน"
              value={isEditMode ? formData.employeeId : 'ระบบสร้างอัตโนมัติเมื่อบันทึก'}
              helperText={isEditMode ? 'รหัสประจำตัวพนักงานไม่สามารถแก้ไขได้' : 'ระบบจะสร้างรหัสให้อัตโนมัติ และปรับคำนำหน้าตามบทบาทเมื่อสร้างบัญชีผู้ใช้'}
              slotProps={{ input: { readOnly: true } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  ...(!isEditMode && {
                    backgroundColor: '#F8FAFC',
                  }),
                },
                '& .MuiInputBase-input': {
                  ...(!isEditMode && {
                    color: '#64748B',
                    WebkitTextFillColor: '#64748B',
                  }),
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="ชื่อ"
              value={formData.firstName}
              onChange={(event) =>
                handleInputChange(
                  'firstName',
                  event.target.value,
                )
              }
              error={Boolean(errors.firstName)}
              helperText={errors.firstName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="นามสกุล"
              value={formData.lastName}
              onChange={(event) =>
                handleInputChange(
                  'lastName',
                  event.target.value,
                )
              }
              error={Boolean(errors.lastName)}
              helperText={errors.lastName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              type="email"
              label="อีเมล"
              placeholder="employee@organization.co.th"
              value={formData.email}
              onChange={(event) =>
                handleInputChange(
                  'email',
                  event.target.value,
                )
              }
              error={Boolean(errors.email)}
              helperText={errors.email}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="เบอร์โทรศัพท์"
              placeholder="08X-XXX-XXXX"
              value={formData.phone}
              onChange={(event) =>
                handleInputChange(
                  'phone',
                  event.target.value,
                )
              }
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              ข้อมูลการทำงาน
            </Typography>

          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '28px',
              },
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: '22px',
            }}
          >
            <FormControl
              fullWidth
              required
              error={Boolean(errors.department)}
            >
              <InputLabel id="employee-department-label">
                แผนก
              </InputLabel>

              <Select
                labelId="employee-department-label"
                value={formData.department}
                label="แผนก"
                onChange={(event) =>
                  handleInputChange(
                    'department',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                {departments.map((department) => (
                  <MenuItem
                    key={department.departmentId}
                    value={department.departmentId}
                  >
                    {department.departmentName}
                  </MenuItem>
                ))}
              </Select>

              {errors.department && (
                <FormHelperText>
                  {errors.department}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              required
              error={Boolean(errors.position)}
            >
              <InputLabel id="employee-position-label">
                ตำแหน่ง
              </InputLabel>

              <Select
                labelId="employee-position-label"
                value={formData.position}
                label="ตำแหน่ง"
                onChange={(event) =>
                  handleInputChange(
                    'position',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                {positions.map((position) => (
                  <MenuItem
                    key={position.positionId}
                    value={position.positionId}
                  >
                    {position.positionName}
                  </MenuItem>
                ))}
              </Select>

              {errors.position && (
                <FormHelperText>
                  {errors.position}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="employee-supervisor-label">
                ผู้บังคับบัญชา
              </InputLabel>

              <Select
                labelId="employee-supervisor-label"
                value={formData.supervisor}
                label="ผู้บังคับบัญชา"
                onChange={(event) =>
                  handleInputChange(
                    'supervisor',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="">
                  ไม่มีผู้บังคับบัญชา
                </MenuItem>

                {supervisors.map((supervisor) => (
                  <MenuItem
                    key={supervisor.employeeId}
                    value={supervisor.employeeId}
                  >
                    {supervisor.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ThaiDateField
              label="วันที่เริ่มงาน"
              value={formData.employmentDate}
              onChange={(value) => handleInputChange('employmentDate', value)}
              error={Boolean(errors.employmentDate)}
              helperText={errors.employmentDate}
            />
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              ข้อมูลบัญชีผู้ใช้
            </Typography>

          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '28px',
              },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
                gap: '22px',
              }}
            >
              <FormControl
                fullWidth
                required
                error={Boolean(errors.role)}
              >
                <InputLabel id="employee-role-label">
                  บทบาท
                </InputLabel>

                <Select
                  labelId="employee-role-label"
                  value={formData.role}
                  label="บทบาท"
                  onChange={(event) =>
                    handleInputChange(
                      'role',
                      event.target.value,
                    )
                  }
                  sx={{
                    borderRadius: '8px',
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {({ Employee: 'พนักงาน', Supervisor: 'หัวหน้างาน', HR: 'ฝ่ายทรัพยากรบุคคล', Admin: 'ผู้ดูแลระบบ' })[role]}
                    </MenuItem>
                  ))}
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
                error={Boolean(errors.status)}
              >
                <InputLabel id="employee-status-label">
                  สถานะ
                </InputLabel>

                <Select
                  labelId="employee-status-label"
                  value={formData.status}
                  label="สถานะ"
                  onChange={(event) =>
                    handleInputChange(
                      'status',
                      event.target.value,
                    )
                  }
                  sx={{
                    borderRadius: '8px',
                  }}
                >
                  <MenuItem value="Active">
                    ใช้งานอยู่
                  </MenuItem>

                  <MenuItem value="Inactive">
                    ไม่ใช้งาน
                  </MenuItem>
                </Select>

                {errors.status && (
                  <FormHelperText>
                    {errors.status}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>

          </Box>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '4px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column-reverse',
                sm: 'row',
              },
              gap: '12px',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate(returnTo)}
              sx={{
                minWidth: '110px',
                height: '44px',
                padding: '0 20px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              ยกเลิก
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving || loading}
              sx={{
                minWidth: '150px',
                height: '44px',
                padding: '0 20px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#1D4ED8',
                  boxShadow: 'none',
                },
              }}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog open={confirmationOpen} onClose={() => { if (!saving) { setConfirmationOpen(false); setConfirmationError(''); } }} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>ยืนยันการบันทึกข้อมูลพนักงาน</DialogTitle>
        <DialogContent>
          {confirmationError ? (
            <Alert severity="error" sx={{ marginBottom: '16px' }}>
              {confirmationError}
            </Alert>
          ) : null}
          <Box sx={{ display: 'grid', gap: '10px' }}>
            <Typography><strong>ชื่อ:</strong> {formData.firstName} {formData.lastName}</Typography>
            <Typography><strong>รหัสพนักงาน:</strong> {isEditMode ? formData.employeeId : 'ระบบสร้างอัตโนมัติ'}</Typography>
            <Typography><strong>อีเมล:</strong> {formData.email}</Typography>
            <Typography><strong>แผนก:</strong> {departments.find((item) => String(item.departmentId) === String(formData.department))?.departmentName || '-'}</Typography>
            <Typography><strong>ตำแหน่ง:</strong> {positions.find((item) => String(item.positionId) === String(formData.position))?.positionName || '-'}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '14px 20px' }}><Button type="button" variant="outlined" color="secondary" disabled={saving} onClick={() => { setConfirmationOpen(false); setConfirmationError(''); }}>กลับไปแก้ไข</Button><Button type="button" variant="contained" color="success" disabled={saving} onClick={confirmSave}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button></DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default EmployeeFormPage;
