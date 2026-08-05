import { useState } from 'react';
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Navigate,
  useNavigate,
} from 'react-router-dom';

import api from '../api/axios.js';
import PasswordRecoveryLayout from '../components/passwordrecoverylayout.jsx';
import PasswordPolicyList from '../components/passwordpolicylist.jsx';
import { passwordMeetsPolicy } from '../utils/passwordpolicy.js';
import usePasswordResetFlow from '../auth/usepasswordresetflow.js';

const passwordFieldSx = {
  '& input::-ms-reveal': {
    display: 'none',
  },
  '& input::-ms-clear': {
    display: 'none',
  },
};

function ResetPasswordPage() {
  const navigate = useNavigate();
  const flow = usePasswordResetFlow();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  if (
    !resetCompleted
    && (!flow.identifier || !flow.resetToken)
  ) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword((previousValue) => !previousValue);
  };

  const handlePasswordIconMouseDown = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);

    if (
      !passwordMeetsPolicy(newPassword, {
        username: flow.identifier,
        email: flow.identifier,
      })
    ) {
      setMessage({
        severity: 'error',
        text: 'The new password does not meet the password policy.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        severity: 'error',
        text: 'The confirmation password does not match.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/reset-password', {
        resetToken: flow.resetToken,
        newPassword,
        confirmPassword,
      });

      const successMessage =
        response.data?.message
        || 'Password reset successfully.';

      /*
       * ป้องกันหน้า Reset Password เด้งกลับไป Forgot Password
       * ระหว่างที่กำลังล้างข้อมูล Reset Flow
       */
      setResetCompleted(true);
      setNewPassword('');
      setConfirmPassword('');

      navigate('/login', {
        replace: true,
        state: {
          successMessage,
        },
      });

      /*
       * รอให้เปลี่ยนไปหน้า Login ก่อน
       * แล้วจึงล้าง Identifier และ Reset Token
       */
      window.setTimeout(() => {
        flow.clearFlow();
      }, 0);
    } catch (error) {
      setMessage({
        severity: 'error',
        text:
          error.response?.data?.message
          || 'Unable to reset the password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordAdornment = (
    <InputAdornment position="end">
      <IconButton
        type="button"
        edge="end"
        aria-label={
          showPassword
            ? 'Hide password'
            : 'Show password'
        }
        onClick={handleTogglePasswordVisibility}
        onMouseDown={handlePasswordIconMouseDown}
      >
        {showPassword
          ? <VisibilityOff />
          : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <PasswordRecoveryLayout
      title="Reset Password"
      description="Create a new password for your account."
    >
      {message && (
        <Alert
          severity={message.severity}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          required
          autoFocus
          type={showPassword ? 'text' : 'password'}
          label="New Password"
          value={newPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
          sx={passwordFieldSx}
          slotProps={{
            input: {
              endAdornment: passwordAdornment,
            },
          }}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setMessage(null);
          }}
        />

        <PasswordPolicyList
          password={newPassword}
          username={flow.identifier}
          email={flow.identifier}
        />

        <TextField
          fullWidth
          required
          type={showPassword ? 'text' : 'password'}
          label="Confirm New Password"
          value={confirmPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
          sx={passwordFieldSx}
          slotProps={{
            input: {
              endAdornment: passwordAdornment,
            },
          }}
          error={Boolean(
            confirmPassword
            && confirmPassword !== newPassword
          )}
          helperText={
            confirmPassword
            && confirmPassword !== newPassword
              ? 'The confirmation password does not match.'
              : ''
          }
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setMessage(null);
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            height: 48,
            mt: 3,
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          {isSubmitting
            ? 'Resetting Password...'
            : 'Reset Password'}
        </Button>

        <Button
          fullWidth
          type="button"
          disabled={isSubmitting}
          onClick={() => {
            navigate('/login', {
              replace: true,
            });

            window.setTimeout(() => {
              flow.clearFlow();
            }, 0);
          }}
          sx={{
            mt: 1.5,
            textTransform: 'none',
          }}
        >
          Back to Login
        </Button>
      </form>
    </PasswordRecoveryLayout>
  );
}

export default ResetPasswordPage;