import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
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

function EmployeeFormPage() {
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

  const departments = [
    'Information Technology',
    'Human Resources',
    'Finance',
    'Marketing',
  ];

  const positions = [
    'Developer',
    'Supervisor',
    'Human Resource Officer',
    'System Administrator',
    'Accountant',
    'Marketing Officer',
  ];

  const supervisors = [
    'Supervisor User',
    'Nattapong Srisuk',
    'Sasithorn Kanya',
  ];

  const roles = [
    'Employee',
    'Supervisor',
    'HR',
    'Admin',
  ];

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

    if (!formData.employeeId.trim()) {
      validationErrors.employeeId =
        'Please enter an employee ID';
    }

    if (!formData.firstName.trim()) {
      validationErrors.firstName =
        'Please enter the first name';
    }

    if (!formData.lastName.trim()) {
      validationErrors.lastName =
        'Please enter the last name';
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        'Please enter an email address';
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(formData.email.trim())) {
        validationErrors.email =
          'Please enter a valid email address';
      }
    }

    if (!formData.phone.trim()) {
      validationErrors.phone =
        'Please enter a phone number';
    } else {
      const phonePattern = /^[0-9+\-\s()]{8,20}$/;

      if (!phonePattern.test(formData.phone.trim())) {
        validationErrors.phone =
          'Please enter a valid phone number';
      }
    }

    if (!formData.department) {
      validationErrors.department =
        'Please select a department';
    }

    if (!formData.position) {
      validationErrors.position =
        'Please select a position';
    }

    if (!formData.role) {
      validationErrors.role =
        'Please select a role';
    }

    if (!formData.employmentDate) {
      validationErrors.employmentDate =
        'Please select an employment date';
    }

    if (!formData.status) {
      validationErrors.status =
        'Please select an employee status';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    const employeeData = {
      ...formData,
      employeeId: formData.employeeId.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    console.log({
      employeeData,
    });

    setSuccessMessage(
      'Employee information is complete. The employee account and initial password will be created after connecting this form to the backend.',
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleReset = () => {
    setFormData({
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

    setErrors({});
    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <HRLayout activeMenu="Employee Management">
      <Box
        sx={{
          marginBottom: '28px',
        }}
      >
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
          Add Employee
        </Typography>

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '15px',
            marginTop: '6px',
          }}
        >
          Enter personal, employment and system account
          information for the new employee.
        </Typography>

<Button
  type="button"
  variant="outlined"
  sx={{
    minWidth: '100px',
    height: '42px',
    marginTop: '16px',
    padding: '0 18px',
    backgroundColor: '#FFFFFF',
    color: '#2563EB',
    borderColor: '#2563EB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'none',

    '&:hover': {
      backgroundColor: '#EFF6FF',
      borderColor: '#1D4ED8',
    },
  }}
>
  ← Back
</Button>
      </Box>

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

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
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
                fontWeight: 800,
              }}
            >
              Personal Information
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Basic information used to identify and contact
              the employee.
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
              required
              label="Employee ID"
              placeholder="Example: EMP006"
              value={formData.employeeId}
              onChange={(event) =>
                handleInputChange(
                  'employeeId',
                  event.target.value,
                )
              }
              error={Boolean(errors.employeeId)}
              helperText={
                errors.employeeId ||
                'Employee ID must be unique'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="First Name"
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
              label="Last Name"
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
              label="Email Address"
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
              label="Phone Number"
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
                fontWeight: 800,
              }}
            >
              Employment Information
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Assign the employee to a department, position and
              supervisor.
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
                Department
              </InputLabel>

              <Select
                labelId="employee-department-label"
                value={formData.department}
                label="Department"
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
                    key={department}
                    value={department}
                  >
                    {department}
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
                Position
              </InputLabel>

              <Select
                labelId="employee-position-label"
                value={formData.position}
                label="Position"
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
                    key={position}
                    value={position}
                  >
                    {position}
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
                Supervisor
              </InputLabel>

              <Select
                labelId="employee-supervisor-label"
                value={formData.supervisor}
                label="Supervisor"
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
                  No Supervisor
                </MenuItem>

                {supervisors.map((supervisor) => (
                  <MenuItem
                    key={supervisor}
                    value={supervisor}
                  >
                    {supervisor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              id="employment-date"
              fullWidth
              required
              type="date"
              label="Employment Date"
              value={formData.employmentDate}
              onChange={(event) =>
                handleInputChange(
                  'employmentDate',
                  event.target.value,
                )
              }
              error={Boolean(errors.employmentDate)}
              helperText={errors.employmentDate}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  color: formData.employmentDate
                    ? '#111827'
                    : '#6B7280',

                  '&.Mui-focused fieldset': {
                    borderColor: '#059669',
                  },
                },

                '& .MuiInputLabel-root': {
                  color: '#6B7280',
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#059669',
                },

                '& input[type="date"]': {
                  color: formData.employmentDate
                    ? '#111827'
                    : '#6B7280',
                },

                '& input[type="date"]::-webkit-datetime-edit': {
                  color: formData.employmentDate
                    ? '#111827'
                    : '#6B7280',
                },

                '& input[type="date"]::-webkit-datetime-edit-fields-wrapper': {
                  color: formData.employmentDate
                    ? '#111827'
                    : '#6B7280',
                },

                '& input[type="date"]::-webkit-calendar-picker-indicator': {
                  opacity: 0.7,
                  cursor: 'pointer',
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
                fontWeight: 800,
              }}
            >
              System Account
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Set the employee role and account status.
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
                  Role
                </InputLabel>

                <Select
                  labelId="employee-role-label"
                  value={formData.role}
                  label="Role"
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
                      {role}
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
                  Status
                </InputLabel>

                <Select
                  labelId="employee-status-label"
                  value={formData.status}
                  label="Status"
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
                    Active
                  </MenuItem>

                  <MenuItem value="Inactive">
                    Inactive
                  </MenuItem>
                </Select>

                {errors.status && (
                  <FormHelperText>
                    {errors.status}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box
              sx={{
                padding: '16px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                marginTop: '24px',
              }}
            >
              <Typography
                sx={{
                  color: '#047857',
                  fontSize: '14px',
                  fontWeight: 800,
                }}
              >
                Initial password
              </Typography>

              <Typography
                sx={{
                  color: '#065F46',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  marginTop: '6px',
                }}
              >
                The system will automatically generate an
                initial password when the employee account is
                created. The employee can change it through the
                Change Password page.
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            padding: {
              xs: '20px',
              sm: '24px',
            },
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            display: 'flex',
            alignItems: {
              xs: 'stretch',
              sm: 'center',
            },
            justifyContent: 'space-between',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            gap: '18px',
          }}
        >
          <Box>
            <Typography
              sx={{
                color: '#111827',
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              Create Employee
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                lineHeight: 1.6,
                marginTop: '4px',
              }}
            >
              Check that all required information is correct
              before saving.
            </Typography>
          </Box>

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
              onClick={handleReset}
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
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth: '150px',
                height: '44px',
                padding: '0 20px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#047857',
                  boxShadow: 'none',
                },
              }}
            >
              Save Employee
            </Button>
          </Box>
        </Paper>
      </Box>
    </HRLayout>
  );
}

export default EmployeeFormPage;