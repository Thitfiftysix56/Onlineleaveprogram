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

const emptyPositionData = {
  positionName: '',
  status: 'Active',
};

const editPositionData = {
  positionName: 'Developer',
  status: 'Active',
};

function RolePositionFormPage({
  LayoutComponent,
  activeMenu,
  theme,
  mode = 'add',
}) {
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState(
    isEditMode
      ? { ...editPositionData }
      : { ...emptyPositionData },
  );

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [informationMessage, setInformationMessage] =
    useState('');

  const existingPositionNames = [
    'Developer',
    'Supervisor',
    'Human Resource Officer',
    'System Administrator',
    'Accountant',
    'Marketing Officer',
  ];

  useEffect(() => {
    setFormData(
      isEditMode
        ? { ...editPositionData }
        : { ...emptyPositionData },
    );

    setErrors({});
    setSuccessMessage('');
    setInformationMessage('');
  }, [isEditMode]);

  const pageTitle = isEditMode
    ? 'Edit Position'
    : 'Add Position';

  const pageDescription = isEditMode
    ? 'Update the selected position information.'
    : 'Create a new position for the organization.';

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
    const normalizedPositionName =
      formData.positionName.trim();

    if (!normalizedPositionName) {
      validationErrors.positionName =
        'Please enter the position name';
    } else if (normalizedPositionName.length < 2) {
      validationErrors.positionName =
        'Position name must contain at least 2 characters';
    } else if (normalizedPositionName.length > 100) {
      validationErrors.positionName =
        'Position name must not exceed 100 characters';
    } else {
      const positionAlreadyExists =
        existingPositionNames.some(
          (positionName) =>
            positionName.toLowerCase() ===
            normalizedPositionName.toLowerCase(),
        );

      const isCurrentPosition =
        isEditMode &&
        normalizedPositionName.toLowerCase() ===
          editPositionData.positionName.toLowerCase();

      if (
        positionAlreadyExists &&
        !isCurrentPosition
      ) {
        validationErrors.positionName =
          'This position name is already in use';
      }
    }

    if (!formData.status) {
      validationErrors.status =
        'Please select a position status';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSuccessMessage('');
    setInformationMessage('');

    if (!validateForm()) {
      return;
    }

    const submittedPosition = {
      positionName: formData.positionName.trim(),
      status: formData.status,
    };

    console.log({
      mode,
      submittedPosition,
    });

    setSuccessMessage(
      isEditMode
        ? 'Position information is valid. The changes will be saved after this page is connected to the backend.'
        : 'Position information is valid. The position will be created after this page is connected to the backend.',
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleReset = () => {
    setFormData(
      isEditMode
        ? { ...editPositionData }
        : { ...emptyPositionData },
    );

    setErrors({});
    setSuccessMessage('');
    setInformationMessage('');
  };

  const handleBack = () => {
    setInformationMessage(
      'Back navigation to Position Management will be connected when routing is added.',
    );

    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const isActive = formData.status === 'Active';

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
          onClose={() => setInformationMessage('')}
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
              Position Information
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Enter the position name and current status.
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
              label="Position Name"
              placeholder="Example: Software Developer"
              value={formData.positionName}
              onChange={(event) =>
                handleInputChange(
                  'positionName',
                  event.target.value,
                )
              }
              error={Boolean(errors.positionName)}
              helperText={
                errors.positionName ||
                `${formData.positionName.length}/100 characters`
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
                    borderColor: theme.primary,
                  },
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.primary,
                },
              }}
            />

            <FormControl
              fullWidth
              required
              error={Boolean(errors.status)}
            >
              <InputLabel id="position-form-status-label">
                Position Status
              </InputLabel>

              <Select
                labelId="position-form-status-label"
                value={formData.status}
                label="Position Status"
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
                      borderColor: theme.primary,
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
                  'Inactive positions remain in existing records but cannot be assigned to new employees.'}
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
              borderTop: '1px solid #E5E7EB',
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
                minWidth: '155px',
                height: '44px',
                padding: '0 20px',
                backgroundColor: theme.primary,
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: theme.dark,
                  boxShadow: 'none',
                },
              }}
            >
              {isEditMode
                ? 'Save Changes'
                : 'Create Position'}
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
              Position Preview
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                lineHeight: 1.6,
                marginTop: '5px',
              }}
            >
              Review the information before saving.
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
                {formData.positionName
                  .trim()
                  .charAt(0)
                  .toUpperCase() || 'P'}
              </Box>

              <Typography
                sx={{
                  minHeight: '50px',
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 800,
                  lineHeight: 1.4,
                  marginTop: '16px',
                  wordBreak: 'break-word',
                }}
              >
                {formData.positionName.trim() ||
                  'Position Name'}
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
              Position Status
            </Typography>

            <Typography
              sx={{
                color: theme.text || '#4B5563',
                fontSize: '13px',
                lineHeight: 1.7,
                marginTop: '8px',
              }}
            >
              Active positions can be assigned to employees.
              Inactive positions remain available for existing
              employee records and historical reports.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </LayoutComponent>
  );
}

export default RolePositionFormPage;