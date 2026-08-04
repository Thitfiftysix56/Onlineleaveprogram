import { useEffect, useState } from 'react';
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

const emptyDepartmentData = {
  departmentName: '',
  description: '',
  status: 'Active',
};

const editDepartmentData = {
  departmentName: 'Information Technology',
  description:
    'Responsible for software development, infrastructure and technical support.',
  status: 'Active',
};

function RoleDepartmentFormPage({
  LayoutComponent,
  activeMenu,
  theme,
  mode = 'add',
}) {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState(
    isEditMode
      ? { ...editDepartmentData }
      : { ...emptyDepartmentData },
  );

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] =
    useState('');

  const [informationMessage, setInformationMessage] =
    useState('');

  const existingDepartmentNames = [
    'Information Technology',
    'Human Resources',
    'Finance',
    'Marketing',
  ];

  useEffect(() => {
    setFormData(
      isEditMode
        ? { ...editDepartmentData }
        : { ...emptyDepartmentData },
    );

    setErrors({});
    setSuccessMessage('');
    setInformationMessage('');
  }, [isEditMode]);

  const pageTitle = isEditMode
    ? 'Edit Department'
    : 'Add Department';

  const pageDescription = isEditMode
    ? 'Update the selected department information.'
    : 'Create a new department for the organization.';

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
    setInformationMessage('');
  };

  const validateForm = () => {
    const validationErrors = {};

    const normalizedDepartmentName =
      formData.departmentName.trim();

    if (!normalizedDepartmentName) {
      validationErrors.departmentName =
        'Please enter the department name';
    } else if (
      normalizedDepartmentName.length < 2
    ) {
      validationErrors.departmentName =
        'Department name must contain at least 2 characters';
    } else if (
      normalizedDepartmentName.length > 100
    ) {
      validationErrors.departmentName =
        'Department name must not exceed 100 characters';
    } else {
      const departmentAlreadyExists =
        existingDepartmentNames.some(
          (departmentName) =>
            departmentName.toLowerCase() ===
            normalizedDepartmentName.toLowerCase(),
        );

      const isCurrentDepartment =
        isEditMode &&
        normalizedDepartmentName.toLowerCase() ===
          editDepartmentData.departmentName.toLowerCase();

      if (
        departmentAlreadyExists &&
        !isCurrentDepartment
      ) {
        validationErrors.departmentName =
          'This department name is already in use';
      }
    }

    if (!formData.status) {
      validationErrors.status =
        'Please select a department status';
    }

    setErrors(validationErrors);

    return (
      Object.keys(validationErrors).length === 0
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage('');
    setInformationMessage('');

    if (!validateForm()) {
      return;
    }

    const submittedDepartment = {
      department_name:
        formData.departmentName.trim(),

      description:
        formData.description.trim() || null,

      is_active:
        formData.status === 'Active' ? 1 : 0,
    };

    console.log({
      mode,
      submittedDepartment,
    });

    setSuccessMessage(
      isEditMode
        ? 'Department information is valid. The changes will be saved after this page is connected to the backend.'
        : 'Department information is valid. The department will be created after this page is connected to the backend.',
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleReset = () => {
    setFormData(
      isEditMode
        ? { ...editDepartmentData }
        : { ...emptyDepartmentData },
    );

    setErrors({});
    setSuccessMessage('');
    setInformationMessage('');
  };

  const handleBack = () => {
    setInformationMessage(
      'Back navigation to Department Management will work after routing is connected.',
    );

    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const isActive =
    formData.status === 'Active';

  const departmentInitial =
    formData.departmentName
      .trim()
      .charAt(0)
      .toUpperCase() || 'D';

  return (
    <LayoutComponent activeMenu={activeMenu}>
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
          {pageTitle}
        </Typography>

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '15px',
            marginTop: '6px',
          }}
        >
          {pageDescription}
        </Typography>

        <Button
          type="button"
          variant="outlined"
          onClick={handleBack}
          sx={{
            minWidth: '100px',
            height: '42px',
            marginTop: '16px',
            padding: '0 18px',
            backgroundColor: '#FFFFFF',
            color: theme.primary,
            borderColor: theme.primary,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'none',

            '&:hover': {
              backgroundColor: theme.soft,
              borderColor: theme.dark,
            },
          }}
        >
          ← Back
        </Button>
      </Box>

      {informationMessage && (
        <Alert
          severity="info"
          onClose={() =>
            setInformationMessage('')
          }
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {informationMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          onClose={() =>
            setSuccessMessage('')
          }
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
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 1.65fr) minmax(320px, 1fr)',
          },
          gap: '24px',
          alignItems: 'start',
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
              Department Information
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Enter the department name,
              description and current status.
            </Typography>
          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '28px',
              },
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            <TextField
              fullWidth
              required
              label="Department Name"
              placeholder="Example: Information Technology"
              value={formData.departmentName}
              onChange={(event) =>
                handleInputChange(
                  'departmentName',
                  event.target.value,
                )
              }
              error={Boolean(
                errors.departmentName,
              )}
              helperText={
                errors.departmentName ||
                `${formData.departmentName.length}/100 characters`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 100,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',

                  '&.Mui-focused fieldset': {
                    borderColor:
                      theme.primary,
                  },
                },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color: theme.primary,
                  },
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={5}
              maxRows={10}
              label="Description"
              placeholder="Describe the responsibilities of this department"
              value={formData.description}
              onChange={(event) =>
                handleInputChange(
                  'description',
                  event.target.value,
                )
              }
              helperText="Optional"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',

                  '&.Mui-focused fieldset': {
                    borderColor:
                      theme.primary,
                  },
                },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color: theme.primary,
                  },
              }}
            />

            <FormControl
              fullWidth
              required
              error={Boolean(errors.status)}
            >
              <InputLabel id="department-form-status-label">
                Department Status
              </InputLabel>

              <Select
                labelId="department-form-status-label"
                value={formData.status}
                label="Department Status"
                onChange={(event) =>
                  handleInputChange(
                    'status',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>
              </Select>

              <FormHelperText>
                {errors.status ||
                  'Inactive departments remain in historical records but cannot be assigned to new employees.'}
              </FormHelperText>
            </FormControl>
          </Box>

          <Box
            sx={{
              padding: {
                xs: '20px',
                sm: '22px 28px',
              },
              display: 'flex',
              justifyContent: 'flex-end',
              flexDirection: {
                xs: 'column-reverse',
                sm: 'row',
              },
              gap: '12px',
              backgroundColor: '#F9FAFB',
              borderTop:
                '1px solid #E5E7EB',
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
                  backgroundColor: '#FFFFFF',
                  borderColor: '#9CA3AF',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth: '170px',
                height: '44px',
                padding: '0 20px',
                backgroundColor:
                  theme.primary,
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor:
                    theme.dark,
                  boxShadow: 'none',
                },
              }}
            >
              {isEditMode
                ? 'Save Changes'
                : 'Create Department'}
            </Button>
          </Box>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
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
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '17px',
                fontWeight: 800,
              }}
            >
              Department Preview
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                lineHeight: 1.6,
                marginTop: '5px',
              }}
            >
              Review the department information
              before saving.
            </Typography>

            <Box
              sx={{
                padding: '20px',
                marginTop: '22px',
                backgroundColor: theme.soft,
                border: `1px solid ${
                  theme.border || '#E5E7EB'
                }`,
                borderRadius: '12px',
              }}
            >
              <Box
                sx={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFFFF',
                  color: theme.primary,
                  borderRadius: '12px',
                  fontSize: '20px',
                  fontWeight: 800,
                }}
              >
                {departmentInitial}
              </Box>

              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 800,
                  lineHeight: 1.4,
                  marginTop: '16px',
                  wordBreak: 'break-word',
                }}
              >
                {formData.departmentName.trim() ||
                  'Department Name'}
              </Typography>

              <Typography
                sx={{
                  minHeight: '44px',
                  color: '#6B7280',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  marginTop: '9px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {formData.description.trim() ||
                  'No description provided.'}
              </Typography>

              <Chip
                label={formData.status}
                size="small"
                sx={{
                  minWidth: '76px',
                  marginTop: '18px',
                  backgroundColor: isActive
                    ? '#DCFCE7'
                    : '#FEF3C7',
                  color: isActive
                    ? '#15803D'
                    : '#B45309',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              padding: {
                xs: '20px',
                sm: '24px',
              },
              backgroundColor: theme.soft,
              border: `1px solid ${
                theme.border || '#E5E7EB'
              }`,
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: theme.dark,
                fontSize: '15px',
                fontWeight: 800,
              }}
            >
              Department Status
            </Typography>

            <Typography
              sx={{
                color:
                  theme.text || '#4B5563',
                fontSize: '13px',
                lineHeight: 1.8,
                marginTop: '8px',
              }}
            >
              Active departments can be assigned
              to employees. Inactive departments
              remain available for existing
              employee records and historical
              reports.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </LayoutComponent>
  );
}

export default RoleDepartmentFormPage;