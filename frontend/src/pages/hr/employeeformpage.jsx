import { useEffect, useState } from 'react';
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
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import HRLayout from '../../layouts/hrlayout.jsx';
import { PageHeader } from '../../components/sharedvisualfoundation.jsx';
import { roleDashboardCardSurfaceSx } from '../../theme/rolecardsurface.js';
import ThaiCalendarField from '../../components/thaicalendarfield.jsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getDepartments } from '../../api/department-service.js';
import { getPositions } from '../../api/position-service.js';
import { divisionLabelFor } from '../../constants/organizationcatalog.js';
import {
  createEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from '../../api/employee-service.js';

function ThaiDateField({ label, value, onChange, error, helperText }) {
  return <ThaiCalendarField label={label} value={value} onChange={onChange} required error={error} helperText={helperText} primaryColor="#059669" />;
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
    departmentName: '',
    department: '',
    positionGroup: '',
    position: '',
    supervisor: '',
    role: 'Employee',
    employmentDate: '',
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
        setSupervisors(employeeRows.filter((item) =>
          Number(item.employeeId) !== Number(employeeId)
          && String(item.roleName || '').toLowerCase() === 'supervisor',
        ));
        if (employee) {
          setFormData({
            employeeId: employee.employeeCode,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone || '',
            departmentName: employee.department || '',
            department: employee.departmentId,
            positionGroup: employee.positionGroup || '',
            position: employee.positionId,
            supervisor: employee.roleName === 'Supervisor' ? '' : (employee.supervisorId || ''),
            role: employee.roleName || 'Employee',
            employmentDate: String(employee.hireDate).slice(0, 10),
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
      const phonePattern = /^\d{10}$/;

      if (!phonePattern.test(formData.phone.trim())) {
        validationErrors.phone =
          'กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข 10 หลัก';
      }
    }

    if (!formData.department) {
      validationErrors.department =
        'กรุณาเลือกฝ่าย';
    }

    if (!formData.departmentName) validationErrors.departmentName = 'กรุณาเลือกแผนก';
    if (!formData.positionGroup) validationErrors.positionGroup = 'กรุณาเลือกกลุ่มตำแหน่ง';

    if (!formData.position) {
      validationErrors.position =
        'กรุณาเลือกตำแหน่ง';
    }

    if (!formData.role) {
      validationErrors.role =
        'กรุณาเลือกบทบาท';
    }

    if (formData.role === 'Supervisor' && formData.supervisor) {
      validationErrors.supervisor = 'หัวหน้างานไม่สามารถมีผู้บังคับบัญชาในขั้นอนุมัตินี้ได้';
      validationErrors.role = 'ไม่สามารถเลือกบทบาทหัวหน้างานเมื่อกำหนดผู้บังคับบัญชาแล้ว';
    }

    if (formData.role !== 'Supervisor' && !formData.supervisor) {
      validationErrors.supervisor = 'กรุณาเลือกผู้บังคับบัญชา';
    }

    if (!formData.employmentDate) {
      validationErrors.employmentDate =
        'กรุณาเลือกวันที่เริ่มงาน';
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
      roleName: formData.role,
      supervisorId: formData.supervisor ? Number(formData.supervisor) : null,
      hireDate: formData.employmentDate,
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
              placeholder="0812345678"
              value={formData.phone}
              onChange={(event) =>
                handleInputChange(
                  'phone',
                  event.target.value.replace(/\D/g, '').slice(0, 10),
                )
              }
              error={Boolean(errors.phone)}
              helperText={errors.phone}
              slotProps={{
                htmlInput: {
                  maxLength: 10,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                },
              }}
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
              error={Boolean(errors.departmentName)}
            >
              <InputLabel id="employee-department-label">
                แผนก
              </InputLabel>

              <Select
                labelId="employee-department-label"
                value={formData.departmentName}
                label="แผนก"
                onChange={(event) => setFormData((current) => ({ ...current, departmentName: event.target.value, department: '', positionGroup: '', position: '' }))}
                sx={{
                  borderRadius: '8px',
                }}
              >
                {[...new Set(departments.map((department) => department.departmentName))].map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
              </Select>

              {errors.departmentName && (
                <FormHelperText>
                  {errors.departmentName}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              required
              disabled={!formData.departmentName}
              error={Boolean(errors.department)}
            >
              <InputLabel id="employee-division-label">
                ฝ่าย
              </InputLabel>

              <Select
                labelId="employee-division-label"
                value={formData.department}
                label="ฝ่าย"
                onChange={(event) => setFormData((current) => ({ ...current, department: event.target.value, positionGroup: '', position: '' }))}
                sx={{
                  borderRadius: '8px',
                }}
              >
                {departments.filter((department) => department.departmentName === formData.departmentName).map((department) => (
                  <MenuItem
                    key={department.departmentId}
                    value={department.departmentId}
                  >
                    {divisionLabelFor(department.divisionName)}
                  </MenuItem>
                ))}
              </Select>

              {errors.department && (
                <FormHelperText>
                  {errors.department}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth required disabled={!formData.department} error={Boolean(errors.positionGroup)}>
              <InputLabel id="employee-position-group-label">กลุ่มตำแหน่ง</InputLabel>
              <Select labelId="employee-position-group-label" value={formData.positionGroup} label="กลุ่มตำแหน่ง"
                onChange={(event) => setFormData((current) => ({ ...current, positionGroup: event.target.value, position: '' }))}
                sx={{ borderRadius: '8px' }}>
                {[...new Set(positions.filter((position) => String(position.departmentId) === String(formData.department)).map((position) => position.positionGroup).filter(Boolean))]
                  .map((group) => <MenuItem key={group} value={group}>{group}</MenuItem>)}
              </Select>
              {errors.positionGroup && <FormHelperText>{errors.positionGroup}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth required disabled={!formData.positionGroup} error={Boolean(errors.position)}>
              <InputLabel id="employee-position-label">ชื่อตำแหน่ง</InputLabel>
              <Select labelId="employee-position-label" value={formData.position} label="ชื่อตำแหน่ง"
                onChange={(event) => handleInputChange('position', event.target.value)} sx={{ borderRadius: '8px' }}>
                {positions.filter((position) => String(position.departmentId) === String(formData.department) && position.positionGroup === formData.positionGroup)
                  .map((position) => <MenuItem key={position.positionId} value={position.positionId}>{position.positionName}</MenuItem>)}
              </Select>
              {errors.position && <FormHelperText>{errors.position}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth required={formData.role !== 'Supervisor'} disabled={formData.role === 'Supervisor'} error={Boolean(errors.supervisor)}>
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
                {supervisors.map((supervisor) => (
                  <MenuItem
                    key={supervisor.employeeId}
                    value={supervisor.employeeId}
                  >
                    {supervisor.fullName}
                  </MenuItem>
                ))}
              </Select>
              {errors.supervisor && <FormHelperText>{errors.supervisor}</FormHelperText>}
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
                  onChange={(event) => {
                    const role = event.target.value;
                    setFormData((current) => ({ ...current, role, supervisor: role === 'Supervisor' ? '' : current.supervisor }));
                    setErrors((current) => ({ ...current, role: '', supervisor: '' }));
                  }}
                  sx={{
                    borderRadius: '8px',
                  }}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role} disabled={role === 'Supervisor' && Boolean(formData.supervisor)}>
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
            <Typography><strong>แผนก:</strong> {formData.departmentName || '-'}</Typography>
            <Typography><strong>ฝ่าย:</strong> {divisionLabelFor(departments.find((item) => String(item.departmentId) === String(formData.department))?.divisionName)}</Typography>
            <Typography><strong>กลุ่มตำแหน่ง:</strong> {formData.positionGroup || '-'}</Typography>
            <Typography><strong>ชื่อตำแหน่ง:</strong> {positions.find((item) => String(item.positionId) === String(formData.position))?.positionName || '-'}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '14px 20px' }}><Button type="button" variant="outlined" color="secondary" disabled={saving} onClick={() => { setConfirmationOpen(false); setConfirmationError(''); }}>กลับไปแก้ไข</Button><Button type="button" variant="contained" color="success" disabled={saving} onClick={confirmSave}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button></DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default EmployeeFormPage;
