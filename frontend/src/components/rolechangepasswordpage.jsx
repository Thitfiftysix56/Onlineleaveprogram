import {
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { clearAuthSession, getCurrentUser } from '../utils/authstorage.js';
import PasswordPolicyList from './passwordpolicylist.jsx';
import { passwordMeetsPolicy } from '../utils/passwordpolicy.js';

import {
  useNavigate,
} from 'react-router-dom';

import api from '../api/axios.js';

const emptyFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function RoleChangePasswordPage({
  LayoutComponent,
  theme,
}) {
  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  const resolvedTheme = {
    primary:
      theme?.primary ||
      '#2563EB',

    dark:
      theme?.dark ||
      '#1D4ED8',

    soft:
      theme?.soft ||
      '#EFF6FF',

    border:
      theme?.border ||
      '#BFDBFE',

    text:
      theme?.text ||
      '#1E3A8A',
  };

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

  const [showPasswords, setShowPasswords] = useState(false);

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

        [fieldName]:
          '',
      }),
    );

    setMessage(null);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (
      !formData.currentPassword
    ) {
      nextErrors.currentPassword =
        'Please enter your current password.';
    }

    if (
      !formData.newPassword
    ) {
      nextErrors.newPassword =
        'Please enter a new password.';
    } else if (!passwordMeetsPolicy(formData.newPassword, currentUser || {})) {
      nextErrors.newPassword =
        'The new password does not meet the password policy.';
    }

    if (
      !formData.confirmPassword
    ) {
      nextErrors.confirmPassword =
        'Please confirm your new password.';
    } else if (
      formData.confirmPassword !==
      formData.newPassword
    ) {
      nextErrors.confirmPassword =
        'The confirmation password does not match.';
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword ===
        formData.newPassword
    ) {
      nextErrors.newPassword =
        'The new password must be different from the current password.';
    }

    setErrors(
      nextErrors,
    );

    return (
      Object.keys(
        nextErrors,
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

    setIsSubmitting(true);

    try {
      const response =
        await api.post(
          '/auth/change-password',
          {
            currentPassword:
              formData.currentPassword,

            newPassword:
              formData.newPassword,
          },
        );

      if (
        response.data?.status !==
        'ok'
      ) {
        throw new Error(
          response.data?.message ||
            'Unable to change the password.',
        );
      }

      setFormData({
        ...emptyFormData,
      });

      setErrors({});

      setMessage({
        severity:
          'success',

        text:
          response.data?.message ||
          'Your password was changed successfully.',
      });

      clearAuthSession();
      navigate('/login', {
        replace: true,
        state: {
          successMessage: response.data?.message || 'Your password was changed successfully. Please sign in again.',
        },
      });
    } catch (error) {
      setMessage({
        severity:
          'error',

        text:
          error.response?.data
            ?.message ||
          error.message ||
          'Unable to change the password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...emptyFormData,
    });

    setErrors({});

    setMessage(null);
  };

  return (
    <LayoutComponent activeMenu="Change Password">
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
          Change Password
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
          Update the password used to sign in to your account.
        </Typography>
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

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            lg:
              'minmax(0, 1.5fr) minmax(300px, 0.8fr)',
          },

          gap:
            '24px',

          alignItems:
            'start',
        }}
      >
        <Paper
          component="form"
          onSubmit={
            handleSubmit
          }
          elevation={0}
          sx={{
            padding: {
              xs:
                '22px',

              sm:
                '28px',
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
                '18px',

              fontWeight:
                800,
            }}
          >
            Password Information
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '14px',

              lineHeight:
                1.7,

              marginTop:
                '6px',

              marginBottom:
                '24px',
            }}
          >
            Enter your current password before creating a new one.
          </Typography>

          <TextField
            fullWidth
            required
            type={showPasswords ? 'text' : 'password'}
            label="Current Password"
            value={
              formData.currentPassword
            }
            onChange={(
              event,
            ) =>
              handleInputChange(
                'currentPassword',
                event.target.value,
              )
            }
            error={
              Boolean(
                errors.currentPassword,
              )
            }
            helperText={
              errors.currentPassword
            }
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'} onClick={() => setShowPasswords((value) => !value)} edge="end">
                      {showPasswords ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root':
                {
                  borderRadius:
                    '8px',
                },
            }}
          />

          <TextField
            fullWidth
            required
            type={showPasswords ? 'text' : 'password'}
            label="New Password"
            value={
              formData.newPassword
            }
            onChange={(
              event,
            ) =>
              handleInputChange(
                'newPassword',
                event.target.value,
              )
            }
            error={
              Boolean(
                errors.newPassword,
              )
            }
            helperText={
              errors.newPassword
            }
            autoComplete="new-password"
            sx={{
              marginTop:
                '20px',

              '& .MuiOutlinedInput-root':
                {
                  borderRadius:
                    '8px',
                },
            }}
          />

          <TextField
            fullWidth
            required
            type={showPasswords ? 'text' : 'password'}
            label="Confirm New Password"
            value={
              formData.confirmPassword
            }
            onChange={(
              event,
            ) =>
              handleInputChange(
                'confirmPassword',
                event.target.value,
              )
            }
            error={
              Boolean(
                errors.confirmPassword,
              )
            }
            helperText={
              errors.confirmPassword
            }
            autoComplete="new-password"
            sx={{
              marginTop:
                '20px',

              '& .MuiOutlinedInput-root':
                {
                  borderRadius:
                    '8px',
                },
            }}
          />

          <Box
            sx={{
              display:
                'flex',

              justifyContent:
                'flex-end',

              gap:
                '12px',

              flexWrap:
                'wrap',

              marginTop:
                '28px',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              disabled={
                isSubmitting
              }
              onClick={
                handleReset
              }
              sx={{
                minWidth:
                  '100px',

                height:
                  '44px',

                color:
                  '#4B5563',

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

            <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmitting
              }
              sx={{
                minWidth:
                  '160px',

                height:
                  '44px',

                backgroundColor:
                  resolvedTheme.primary,

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
                    resolvedTheme.dark,

                  boxShadow:
                    'none',
                },
              }}
            >
              {isSubmitting
                ? 'Changing Password...'
                : 'Change Password'}
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
              '20px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding:
                '22px',

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
                  '16px',

                fontWeight:
                  800,
              }}
            >
              Signed-in Account
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '12px',

                fontWeight:
                  700,

                textTransform:
                  'uppercase',

                letterSpacing:
                  '0.5px',

                marginTop:
                  '18px',
              }}
            >
              Username
            </Typography>

            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                marginTop:
                  '4px',
              }}
            >
              {currentUser?.username ||
                '-'}
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '12px',

                fontWeight:
                  700,

                textTransform:
                  'uppercase',

                letterSpacing:
                  '0.5px',

                marginTop:
                  '18px',
              }}
            >
              Role
            </Typography>

            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                marginTop:
                  '4px',

                textTransform:
                  'capitalize',
              }}
            >
              {currentUser?.role ||
                '-'}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              padding:
                '22px',

              backgroundColor:
                resolvedTheme.soft,

              border:
                `1px solid ${resolvedTheme.border}`,

              borderRadius:
                '12px',
            }}
          >
            <Typography
              sx={{
                color:
                  resolvedTheme.dark,

                fontSize:
                  '16px',

                fontWeight:
                  800,
              }}
            >
              Password Requirements
            </Typography>

            <PasswordPolicyList
              password={formData.newPassword}
              username={currentUser?.username || ''}
              email={currentUser?.email || ''}
            />
          </Paper>
        </Box>
      </Box>
    </LayoutComponent>
  );
}

export default RoleChangePasswordPage;
