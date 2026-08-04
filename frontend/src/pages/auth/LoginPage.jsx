import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
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
import {
  Close,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

function LoginPage() {
  const [role, setRole] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const [roleError, setRoleError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] =
    useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] =
    useState('');

  const [forgotPasswordLoading, setForgotPasswordLoading] =
    useState(false);

  const [forgotPasswordSuccess, setForgotPasswordSuccess] =
    useState('');

  const handleRoleChange = (event) => {
    setRole(event.target.value);

    if (event.target.value) {
      setRoleError('');
    }
  };

  const handleLoginChange = (event) => {
    setLogin(event.target.value);

    if (event.target.value.trim()) {
      setLoginError('');
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (event.target.value) {
      setPasswordError('');
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((previousValue) => !previousValue);
  };

  const handleOpenForgotPassword = () => {
    setForgotPasswordOpen(true);
    setForgotEmail('');
    setForgotEmailError('');
    setForgotPasswordSuccess('');
  };

  const handleCloseForgotPassword = () => {
    if (forgotPasswordLoading) {
      return;
    }

    setForgotPasswordOpen(false);
    setForgotEmail('');
    setForgotEmailError('');
    setForgotPasswordSuccess('');
  };

  const handleForgotEmailChange = (event) => {
    setForgotEmail(event.target.value);
    setForgotEmailError('');
    setForgotPasswordSuccess('');
  };

  const handleForgotPasswordSubmit = (event) => {
    event.preventDefault();

    setForgotEmailError('');
    setForgotPasswordSuccess('');

    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      setForgotEmailError('Please enter your email');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setForgotEmailError(
        'Please enter a valid email address',
      );
      return;
    }

    setForgotPasswordLoading(true);

    setTimeout(() => {
      console.log({
        forgotPasswordEmail: trimmedEmail,
      });

      setForgotPasswordLoading(false);

      setForgotPasswordSuccess(
        'Password reset instructions have been sent to your email.',
      );
    }, 1000);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setRoleError('');
    setLoginError('');
    setPasswordError('');

    let isValid = true;

    if (!role) {
      setRoleError('Please select a role');
      isValid = false;
    }

    if (!login.trim()) {
      setLoginError(
        'Please enter your username or email',
      );
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      console.log({
        role,
        login: login.trim(),
        password,
        rememberMe,
      });

      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#F5F7FB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          noValidate
          sx={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#FFFFFF',
            padding: {
              xs: '28px 20px',
              sm: '40px',
            },
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            boxSizing: 'border-box',
          }}
        >
          <Typography
            component="h1"
            textAlign="center"
            sx={{
              color: '#111827',
              fontSize: {
                xs: '28px',
                sm: '32px',
              },
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            Leave Approval
          </Typography>

          <Typography
            textAlign="center"
            sx={{
              color: '#6B7280',
              fontSize: '16px',
              fontWeight: 400,
              marginTop: '8px',
              marginBottom: '32px',
            }}
          >
            Online Leave Approval System
          </Typography>

          <FormControl
            fullWidth
            error={Boolean(roleError)}
            sx={{
              marginBottom: roleError
                ? '8px'
                : '20px',
            }}
          >
            <InputLabel
              id="role-label"
              sx={{
                color: '#6B7280',
                fontSize: '16px',
                fontWeight: 400,

                '&.Mui-focused': {
                  color: roleError
                    ? '#D32F2F'
                    : '#2563EB',
                },
              }}
            >
              Role
            </InputLabel>

            <Select
              labelId="role-label"
              id="role"
              value={role}
              label="Role"
              onChange={handleRoleChange}
              disabled={isLoading}
              sx={{
                height: '56px',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                fontSize: '16px',
                fontWeight: 400,
                borderRadius: '8px',

                '& .MuiOutlinedInput-notchedOutline':
                  {
                    borderColor: roleError
                      ? '#D32F2F'
                      : '#D1D5DB',
                  },

                '&:hover .MuiOutlinedInput-notchedOutline':
                  {
                    borderColor: roleError
                      ? '#D32F2F'
                      : '#2563EB',
                  },

                '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                  {
                    borderColor: roleError
                      ? '#D32F2F'
                      : '#2563EB',
                    borderWidth: '2px',
                  },
              }}
            >
              <MenuItem value="employee">
                Employee
              </MenuItem>

              <MenuItem value="supervisor">
                Supervisor
              </MenuItem>

              <MenuItem value="hr">
                HR
              </MenuItem>

              <MenuItem value="admin">
                Admin
              </MenuItem>
            </Select>

            {roleError && (
              <FormHelperText
                sx={{
                  marginLeft: '14px',
                  fontSize: '13px',
                }}
              >
                {roleError}
              </FormHelperText>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Username or Email"
            value={login}
            onChange={handleLoginChange}
            error={Boolean(loginError)}
            helperText={loginError}
            disabled={isLoading}
            autoComplete="username"
            sx={{
              marginBottom: loginError
                ? '8px'
                : '20px',

              '& .MuiInputLabel-root': {
                color: '#6B7280',
                fontSize: '16px',
                fontWeight: 400,
              },

              '& .MuiInputLabel-root.Mui-focused': {
                color: loginError
                  ? '#D32F2F'
                  : '#2563EB',
              },

              '& .MuiOutlinedInput-root': {
                height: '56px',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                fontSize: '16px',
                fontWeight: 400,
                borderRadius: '8px',

                '& fieldset': {
                  borderColor: loginError
                    ? '#D32F2F'
                    : '#D1D5DB',
                },

                '&:hover fieldset': {
                  borderColor: loginError
                    ? '#D32F2F'
                    : '#2563EB',
                },

                '&.Mui-focused fieldset': {
                  borderColor: loginError
                    ? '#D32F2F'
                    : '#2563EB',
                  borderWidth: '2px',
                },
              },

              '& .MuiFormHelperText-root': {
                marginLeft: '14px',
                fontSize: '13px',
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={
              showPassword ? 'text' : 'password'
            }
            value={password}
            onChange={handlePasswordChange}
            error={Boolean(passwordError)}
            helperText={passwordError}
            disabled={isLoading}
            autoComplete="current-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      onClick={handleTogglePassword}
                      edge="end"
                      disabled={isLoading}
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      sx={{
                        color: '#6B7280',
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              marginBottom: passwordError
                ? '8px'
                : '12px',

              '& .MuiInputLabel-root': {
                color: '#6B7280',
                fontSize: '16px',
                fontWeight: 400,
              },

              '& .MuiInputLabel-root.Mui-focused': {
                color: passwordError
                  ? '#D32F2F'
                  : '#2563EB',
              },

              '& .MuiOutlinedInput-root': {
                height: '56px',
                backgroundColor: '#FFFFFF',
                color: '#111827',
                fontSize: '16px',
                fontWeight: 400,
                borderRadius: '8px',

                '& fieldset': {
                  borderColor: passwordError
                    ? '#D32F2F'
                    : '#D1D5DB',
                },

                '&:hover fieldset': {
                  borderColor: passwordError
                    ? '#D32F2F'
                    : '#2563EB',
                },

                '&.Mui-focused fieldset': {
                  borderColor: passwordError
                    ? '#D32F2F'
                    : '#2563EB',
                  borderWidth: '2px',
                },
              },

              '& .MuiFormHelperText-root': {
                marginLeft: '14px',
                fontSize: '13px',
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked,
                    )
                  }
                  disabled={isLoading}
                  sx={{
                    color: '#9CA3AF',

                    '&.Mui-checked': {
                      color: '#2563EB',
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 400,
                  }}
                >
                  Remember me
                </Typography>
              }
              sx={{
                marginLeft: '-8px',
                marginRight: 0,
              }}
            />

            <Button
              type="button"
              onClick={handleOpenForgotPassword}
              disabled={isLoading}
              sx={{
                minWidth: 'auto',
                padding: 0,
                color: '#2563EB',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#1D4ED8',
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot Password?
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              height: '48px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: 'none',

              '&:hover': {
                backgroundColor: '#1D4ED8',
                boxShadow: 'none',
              },

              '&.Mui-disabled': {
                backgroundColor: '#93C5FD',
                color: '#FFFFFF',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress
                size={22}
                sx={{
                  color: '#FFFFFF',
                }}
              />
            ) : (
              'Sign In'
            )}
          </Button>
        </Paper>
      </Box>

      <Dialog
        open={forgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '8px',
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleForgotPasswordSubmit}
          noValidate
        >
          <DialogTitle
            sx={{
              position: 'relative',
              color: '#111827',
              fontSize: '24px',
              fontWeight: 800,
              paddingRight: '56px',
            }}
          >
            Forgot Password

            <IconButton
              type="button"
              onClick={handleCloseForgotPassword}
              disabled={forgotPasswordLoading}
              aria-label="Close"
              sx={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                color: '#6B7280',
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              paddingTop: '8px',
            }}
          >
            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Enter your email address and we will send
              instructions to reset your password.
            </Typography>

            {forgotPasswordSuccess && (
              <Alert
                severity="success"
                sx={{
                  marginBottom: '20px',
                  borderRadius: '8px',
                }}
              >
                {forgotPasswordSuccess}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={forgotEmail}
              onChange={handleForgotEmailChange}
              error={Boolean(forgotEmailError)}
              helperText={forgotEmailError}
              disabled={forgotPasswordLoading}
              autoComplete="email"
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#6B7280',
                  fontSize: '16px',
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: forgotEmailError
                    ? '#D32F2F'
                    : '#2563EB',
                },

                '& .MuiOutlinedInput-root': {
                  height: '56px',
                  borderRadius: '8px',

                  '& fieldset': {
                    borderColor: forgotEmailError
                      ? '#D32F2F'
                      : '#D1D5DB',
                  },

                  '&:hover fieldset': {
                    borderColor: forgotEmailError
                      ? '#D32F2F'
                      : '#2563EB',
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: forgotEmailError
                      ? '#D32F2F'
                      : '#2563EB',
                    borderWidth: '2px',
                  },
                },

                '& .MuiFormHelperText-root': {
                  marginLeft: '14px',
                  fontSize: '13px',
                },
              }}
            />
          </DialogContent>

          <DialogActions
            sx={{
              padding: '8px 24px 20px',
              gap: '8px',
            }}
          >
            <Button
              type="button"
              onClick={handleCloseForgotPassword}
              disabled={forgotPasswordLoading}
              sx={{
                height: '44px',
                padding: '0 20px',
                color: '#374151',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                forgotPasswordLoading ||
                Boolean(forgotPasswordSuccess)
              }
              sx={{
                minWidth: '130px',
                height: '44px',
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

                '&.Mui-disabled': {
                  backgroundColor: '#93C5FD',
                  color: '#FFFFFF',
                },
              }}
            >
              {forgotPasswordLoading ? (
                <CircularProgress
                  size={20}
                  sx={{
                    color: '#FFFFFF',
                  }}
                />
              ) : (
                'Send Instructions'
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export default LoginPage;