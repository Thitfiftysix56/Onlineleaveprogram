import { useEffect, useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { createLeaveType, getLeaveType, updateLeaveType } from '../../api/leave-type-service.js';

function LeaveTypeFormPage({ mode = 'add' }) {
  const isEditMode = mode === 'edit';
  const navigate = useNavigate();
  const { leaveTypeId } = useParams();
  const initialFormData = {
    code: '',
    name: '',
    description: '',
    defaultDays: '',
    minimumDays: '1',
    maximumDaysPerRequest: '',
    attachmentRequired: 'No',
    status: 'Active',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isEditMode) return undefined;
    const load = async () => {
      setLoading(true);
      try {
        const item = await getLeaveType(leaveTypeId);
        if (active) setFormData({
          code: item.code, name: item.name, description: item.description,
          defaultDays: String(item.defaultDays), minimumDays: String(item.minimumDays),
          maximumDaysPerRequest: String(item.maximumDaysPerRequest),
          attachmentRequired: item.attachmentRequired ? 'Yes' : 'No', status: item.status,
        });
      } catch (error) { if (active) setErrorMessage(error.response?.data?.message || 'Unable to load leave type.'); }
      finally { if (active) setLoading(false); }
    };
    load(); return () => { active = false; };
  }, [isEditMode, leaveTypeId]);

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

    const code = formData.code.trim().toUpperCase();
    const name = formData.name.trim();
    const description = formData.description.trim();

    const defaultDays = Number(formData.defaultDays);
    const minimumDays = Number(formData.minimumDays);
    const maximumDaysPerRequest = Number(
      formData.maximumDaysPerRequest,
    );

    if (!code) {
      validationErrors.code =
        'Please enter a leave type code';
    } else if (!/^[A-Z0-9]{2,10}$/.test(code)) {
      validationErrors.code =
        'Code must contain 2-10 uppercase letters or numbers';
    }

    if (!name) {
      validationErrors.name =
        'Please enter a leave type name';
    }

    if (!description) {
      validationErrors.description =
        'Please enter a description';
    } else if (description.length < 10) {
      validationErrors.description =
        'Description must contain at least 10 characters';
    }

    if (!formData.defaultDays) {
      validationErrors.defaultDays =
        'Please enter the default entitlement days';
    } else if (
      Number.isNaN(defaultDays) ||
      defaultDays < 0 ||
      defaultDays > 365
    ) {
      validationErrors.defaultDays =
        'Default days must be between 0 and 365';
    }

    if (!formData.minimumDays) {
      validationErrors.minimumDays =
        'Please enter the minimum leave days';
    } else if (
      Number.isNaN(minimumDays) ||
      minimumDays <= 0 ||
      minimumDays > 365
    ) {
      validationErrors.minimumDays =
        'Minimum days must be between 1 and 365';
    }

    if (!formData.maximumDaysPerRequest) {
      validationErrors.maximumDaysPerRequest =
        'Please enter the maximum days per request';
    } else if (
      Number.isNaN(maximumDaysPerRequest) ||
      maximumDaysPerRequest <= 0 ||
      maximumDaysPerRequest > 365
    ) {
      validationErrors.maximumDaysPerRequest =
        'Maximum days must be between 1 and 365';
    } else if (
      !validationErrors.minimumDays &&
      maximumDaysPerRequest < minimumDays
    ) {
      validationErrors.maximumDaysPerRequest =
        'Maximum days cannot be lower than minimum days';
    }

    if (!formData.attachmentRequired) {
      validationErrors.attachmentRequired =
        'Please select an attachment requirement';
    }

    if (!formData.status) {
      validationErrors.status =
        'Please select a leave type status';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage('');

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    const leaveTypeData = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      defaultDays: Number(formData.defaultDays),
      minimumDays: Number(formData.minimumDays),
      maximumDaysPerRequest: Number(
        formData.maximumDaysPerRequest,
      ),
      attachmentRequired:
        formData.attachmentRequired === 'Yes',
      status: formData.status,
    };

    setSaving(true); setErrorMessage('');
    try {
      const result = isEditMode ? await updateLeaveType(leaveTypeId, leaveTypeData) : await createLeaveType(leaveTypeData);
      setSuccessMessage(result.message);
      window.setTimeout(() => navigate('/hr/leave-types'), 500);
    } catch (error) { setErrorMessage(error.response?.data?.message || 'Unable to save leave type.'); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setSuccessMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <HRLayout activeMenu="Leave Type">
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
          {isEditMode
            ? 'Edit Leave Type'
            : 'Add Leave Type'}
        </Typography>

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '15px',
            marginTop: '6px',
          }}
        >
          {isEditMode
            ? 'Update the leave type entitlement and request conditions.'
            : 'Create a new leave type and define its entitlement and request conditions.'}
        </Typography>

<Button
  type="button"
  variant="outlined"
  onClick={() => navigate('/hr/leave-types')}
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

      {(errorMessage || loading) && <Alert severity={errorMessage ? 'error' : 'info'} sx={{ marginBottom: '24px' }}>{errorMessage || 'Loading leave type...'}</Alert>}

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
              Leave Type Information
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Enter the name, code and description of this leave
              type.
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
              label="Leave Type Code"
              placeholder="Example: AL"
              value={formData.code}
              onChange={(event) =>
                handleInputChange(
                  'code',
                  event.target.value.toUpperCase(),
                )
              }
              error={Boolean(errors.code)}
              helperText={
                errors.code ||
                'Use 2-10 uppercase letters or numbers'
              }
              slotProps={{
                htmlInput: {
                  maxLength: 10,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="Leave Type Name"
              placeholder="Example: Annual Leave"
              value={formData.name}
              onChange={(event) =>
                handleInputChange(
                  'name',
                  event.target.value,
                )
              }
              error={Boolean(errors.name)}
              helperText={errors.name}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              multiline
              minRows={4}
              label="Description"
              placeholder="Describe when employees can use this leave type"
              value={formData.description}
              onChange={(event) =>
                handleInputChange(
                  'description',
                  event.target.value,
                )
              }
              error={Boolean(errors.description)}
              helperText={
                errors.description ||
                `${formData.description.length}/500 characters`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 500,
                },
              }}
              sx={{
                gridColumn: {
                  xs: 'auto',
                  sm: '1 / -1',
                },

                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },

                '& .MuiFormHelperText-root': {
                  textAlign: errors.description
                    ? 'left'
                    : 'right',
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
              Entitlement Settings
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Define the default entitlement and allowed number
              of days per request.
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
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: '22px',
            }}
          >
            <TextField
              fullWidth
              required
              type="number"
              label="Default Entitlement Days"
              value={formData.defaultDays}
              onChange={(event) =>
                handleInputChange(
                  'defaultDays',
                  event.target.value,
                )
              }
              error={Boolean(errors.defaultDays)}
              helperText={
                errors.defaultDays ||
                'Default yearly entitlement'
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 365,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              type="number"
              label="Minimum Days per Request"
              value={formData.minimumDays}
              onChange={(event) =>
                handleInputChange(
                  'minimumDays',
                  event.target.value,
                )
              }
              error={Boolean(errors.minimumDays)}
              helperText={
                errors.minimumDays ||
                'Smallest permitted request'
              }
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 365,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />

            <TextField
              fullWidth
              required
              type="number"
              label="Maximum Days per Request"
              value={formData.maximumDaysPerRequest}
              onChange={(event) =>
                handleInputChange(
                  'maximumDaysPerRequest',
                  event.target.value,
                )
              }
              error={Boolean(
                errors.maximumDaysPerRequest,
              )}
              helperText={
                errors.maximumDaysPerRequest ||
                'Largest permitted request'
              }
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 365,
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
                fontWeight: 800,
              }}
            >
              Request Conditions
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Set supporting document requirements and the
              availability of this leave type.
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
              error={Boolean(errors.attachmentRequired)}
            >
              <InputLabel id="attachment-required-label">
                Attachment Required
              </InputLabel>

              <Select
                labelId="attachment-required-label"
                value={formData.attachmentRequired}
                label="Attachment Required"
                onChange={(event) =>
                  handleInputChange(
                    'attachmentRequired',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="No">
                  No, attachment is optional
                </MenuItem>

                <MenuItem value="Yes">
                  Yes, attachment is required
                </MenuItem>
              </Select>

              {errors.attachmentRequired && (
                <FormHelperText>
                  {errors.attachmentRequired}
                </FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              required
              error={Boolean(errors.status)}
            >
              <InputLabel id="leave-type-status-label">
                Status
              </InputLabel>

              <Select
                labelId="leave-type-status-label"
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

            <Box
              sx={{
                gridColumn: {
                  xs: 'auto',
                  sm: '1 / -1',
                },
                padding: '16px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
              }}
            >
              <Typography
                sx={{
                  color: '#047857',
                  fontSize: '14px',
                  fontWeight: 800,
                }}
              >
                Leave entitlement
              </Typography>

              <Typography
                sx={{
                  color: '#065F46',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  marginTop: '6px',
                }}
              >
                When this leave type is created, its default
                entitlement can be assigned to employees through
                Leave Entitlement Management.
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
              Create Leave Type
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                lineHeight: 1.6,
                marginTop: '4px',
              }}
            >
              Check the entitlement and request conditions before
              saving.
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
              disabled={saving || loading}
              sx={{
                minWidth: '160px',
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
              Save Leave Type
            </Button>
          </Box>
        </Paper>
      </Box>
    </HRLayout>
  );
}

export default LeaveTypeFormPage;
