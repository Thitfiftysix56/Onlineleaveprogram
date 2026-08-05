import {
  useEffect,
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

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  clearAuthSession,
  getDashboardPathByRole,
  saveBackendAuthSession,
} from '../utils/authstorage.js';

import api from '../api/axios.js';

const emptyFormData = {
  username: '',
  password: '',
};

function LoginPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    formData,
    setFormData,
  ] = useState({
    ...emptyFormData,
  });

  const [
    errorMessage,
    setErrorMessage,
  ] = useState(
    String(
      location.state?.authError ||
        '',
    ),
  );

  const successMessage = String(location.state?.successMessage || '');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  useEffect(() => {
    clearAuthSession();
  }, []);

  const handleInputChange = (
    fieldName,
    value,
  ) => {
    setFormData(
      (previousData) => ({
        ...previousData,

        [fieldName]: value,
      }),
    );

    setErrorMessage('');
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setErrorMessage('');

    const normalizedUsername =
      String(
        formData.username || '',
      )
        .trim()
        .toLowerCase();

    const enteredPassword =
      String(
        formData.password || '',
      );

    if (
      !normalizedUsername ||
      !enteredPassword
    ) {
      setErrorMessage(
        'Please enter your username and password.',
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        username: normalizedUsername,
        password: enteredPassword,
      });

      if (response.data.status !== 'ok') {
        setErrorMessage(
          response.data.message ||
            'Unable to sign in.',
        );

        return;
      }

      const session =
        saveBackendAuthSession(
          response.data.user,
        );

      const requestedPath =
        typeof location.state?.from ===
        'string'
          ? location.state.from
          : '';

      const pathSegments =
        requestedPath
          .split('/')
          .filter(Boolean);

      const requestedRole =
        String(
          pathSegments[0] || '',
        )
          .trim()
          .toLowerCase();

      const currentUserRole =
        String(
          session.role ||
            '',
        )
          .trim()
          .toLowerCase();

      const canReturnToRequestedPath =
        Boolean(requestedPath) &&
        Boolean(requestedRole) &&
        requestedRole ===
          currentUserRole;

      const targetPath =
        session.mustChangePassword
          ? `/${currentUserRole}/change-password`
          : canReturnToRequestedPath
          ? requestedPath
          : getDashboardPathByRole(
              session.role,
            );

      navigate(
        targetPath,
        {
          replace: true,
        },
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'An error occurred while signing in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight:
          '100vh',

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'center',

        padding: {
          xs:
            '24px',

          md:
            '40px',
        },

        backgroundColor:
          '#F5F7FB',
      }}
    >
      <Box
        sx={{
          width:
            '100%',

          maxWidth:
            '1050px',

          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            lg:
              'minmax(0, 1fr) minmax(380px, 0.8fr)',
          },

          overflow:
            'hidden',

          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '18px',

          boxShadow:
            '0 20px 50px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Box
          sx={{
            padding: {
              xs:
                '34px 28px',

              md:
                '56px',
            },

            display:
              'flex',

            flexDirection:
              'column',

            justifyContent:
              'center',

            backgroundColor:
              '#2563EB',

            color:
              '#FFFFFF',
          }}
        >
          <Typography
            sx={{
              fontSize:
                '13px',

              fontWeight:
                800,

              letterSpacing:
                '1.3px',

              textTransform:
                'uppercase',

              opacity:
                0.85,
            }}
          >
            Online Leave Approval System
          </Typography>

          <Typography
            component="h1"
            sx={{
              maxWidth:
                '520px',

              fontSize: {
                xs:
                  '32px',

                md:
                  '42px',
              },

              fontWeight:
                900,

              lineHeight:
                1.15,

              marginTop:
                '18px',
            }}
          >
            Manage leave requests in one place.
          </Typography>

          <Typography
            sx={{
              maxWidth:
                '520px',

              fontSize:
                '15px',

              lineHeight:
                1.8,

              marginTop:
                '20px',

              opacity:
                0.88,
            }}
          >
            Employees can submit leave requests, supervisors can
            review requests, HR can manage leave information and
            administrators can manage system users.
          </Typography>

          <Box
            sx={{
              marginTop:
                '36px',

              padding:
                '20px',

              backgroundColor:
                'rgba(255, 255, 255, 0.12)',

              border:
                '1px solid rgba(255, 255, 255, 0.2)',

              borderRadius:
                '12px',
            }}
          >
            <Typography
              sx={{
                fontSize:
                  '14px',

                fontWeight:
                  800,
              }}
            >
              Secure role-based access
            </Typography>

            <Typography
              sx={{
                fontSize:
                  '13px',

                lineHeight:
                  1.8,

                marginTop:
                  '8px',

                opacity:
                  0.9,
              }}
            >
              Enter your username and password. The system will
              identify your Role and open the correct Dashboard
              automatically.
            </Typography>
          </Box>
        </Box>

        <Paper
          component="form"
          onSubmit={
            handleSubmit
          }
          elevation={0}
          sx={{
            padding: {
              xs:
                '34px 28px',

              md:
                '52px 44px',
            },

            display:
              'flex',

            flexDirection:
              'column',

            justifyContent:
              'center',

            borderRadius:
              0,
          }}
        >
          <Typography
            component="h2"
            sx={{
              color:
                '#111827',

              fontSize:
                '28px',

              fontWeight:
                900,
            }}
          >
            Sign In
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
                '7px',

              marginBottom:
                '28px',
            }}
          >
            Enter your username and password to access the system.
          </Typography>

          {errorMessage && (
            <Alert
              severity="error"
              onClose={() =>
                setErrorMessage(
                  '',
                )
              }
              sx={{
                marginBottom:
                  '20px',

                borderRadius:
                  '8px',
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {successMessage && !errorMessage && (
            <Alert severity="success" sx={{ marginBottom: '20px', borderRadius: '8px' }}>
              {successMessage}
            </Alert>
          )}

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
            disabled={
              isSubmitting
            }
            autoComplete="username"
            autoFocus
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
                        '#2563EB',
                    },
                },

              '& .MuiInputLabel-root.Mui-focused':
                {
                  color:
                    '#2563EB',
                },
            }}
          />

          <TextField
            fullWidth
            required
            type="password"
            label="Password"
            value={
              formData.password
            }
            onChange={(
              event,
            ) =>
              handleInputChange(
                'password',

                event.target.value,
              )
            }
            disabled={
              isSubmitting
            }
            autoComplete="current-password"
            sx={{
              marginTop:
                '20px',

              '& .MuiOutlinedInput-root':
                {
                  borderRadius:
                    '8px',

                  '&.Mui-focused fieldset':
                    {
                      borderColor:
                        '#2563EB',
                    },
                },

              '& .MuiInputLabel-root.Mui-focused':
                {
                  color:
                    '#2563EB',
                },
            }}
          />

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate('/forgot-password')}
            sx={{ alignSelf: 'flex-end', marginTop: '8px', padding: 0, minWidth: 0, textTransform: 'none', fontWeight: 700 }}
          >
            Forgot Password?
          </Button>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={
              isSubmitting
            }
            sx={{
              height:
                '48px',

              marginTop:
                '26px',

              backgroundColor:
                '#2563EB',

              borderRadius:
                '8px',

              fontSize:
                '15px',

              fontWeight:
                800,

              textTransform:
                'none',

              boxShadow:
                'none',

              '&:hover': {
                backgroundColor:
                  '#1D4ED8',

                boxShadow:
                  'none',
              },

              '&.Mui-disabled': {
                backgroundColor:
                  '#BFDBFE',

                color:
                  '#FFFFFF',
              },
            }}
          >
            {isSubmitting
              ? 'Signing In...'
              : 'Sign In'}
          </Button>

          <Box
            sx={{
              marginTop:
                '24px',

              padding:
                '16px',

              backgroundColor:
                '#F9FAFB',

              border:
                '1px solid #E5E7EB',

              borderRadius:
                '8px',
            }}
          >
            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '12px',

                lineHeight:
                  1.8,
              }}
            >
              The system identifies your Role from the user account.
              You do not need to select a Role manually.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default LoginPage;
