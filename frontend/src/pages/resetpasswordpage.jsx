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
  '& .MuiInputLabel-root': {
    fontWeight: 400,
  },

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
    !resetCompleted &&
    (!flow.identifier || !flow.resetToken)
  ) {
    return (
      <Navigate
        to="/forgot-password"
        replace
      />
    );
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(
      (previousValue) => !previousValue,
    );
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
        text: 'รหัสผ่านใหม่ไม่เป็นไปตามเงื่อนไขที่กำหนด',
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        severity: 'error',
        text: 'รหัสผ่านที่ยืนยันไม่ตรงกัน',
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(
        '/auth/reset-password',
        {
          resetToken: flow.resetToken,
          newPassword,
          confirmPassword,
        },
      );

      const successMessage =
        response.data?.message ||
        'รีเซ็ตรหัสผ่านสำเร็จ';

      setResetCompleted(true);
      setNewPassword('');
      setConfirmPassword('');

      navigate('/login', {
        replace: true,
        state: {
          successMessage,
        },
      });

      window.setTimeout(() => {
        flow.clearFlow();
      }, 0);
    } catch (error) {
      setMessage({
        severity: 'error',
        text:
          error.response?.data?.message ||
          'ไม่สามารถรีเซ็ตรหัสผ่านได้',
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
            ? 'ซ่อนรหัสผ่าน'
            : 'แสดงรหัสผ่าน'
        }
        onClick={handleTogglePasswordVisibility}
        onMouseDown={handlePasswordIconMouseDown}
      >
        {showPassword ? (
          <VisibilityOff />
        ) : (
          <Visibility />
        )}
      </IconButton>
    </InputAdornment>
  );

  return (
    <PasswordRecoveryLayout
      title="ตั้งรหัสผ่านใหม่"
      compact
      description="สร้างรหัสผ่านใหม่สำหรับบัญชีของคุณ"
    >
      {message && (
        <Alert
          severity={message.severity}
          sx={{
            mb: 2,
          }}
        >
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          required
          autoFocus
          size="small"
          type={
            showPassword
              ? 'text'
              : 'password'
          }
          label="รหัสผ่านใหม่"
          value={newPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
          sx={passwordFieldSx}
          slotProps={{
            input: {
              endAdornment:
                passwordAdornment,
            },
          }}
          onChange={(event) => {
            setNewPassword(
              event.target.value,
            );

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
          size="small"
          type={
            showPassword
              ? 'text'
              : 'password'
          }
          label="ยืนยันรหัสผ่านใหม่"
          value={confirmPassword}
          disabled={isSubmitting}
          autoComplete="new-password"
          sx={passwordFieldSx}
          slotProps={{
            input: {
              endAdornment:
                passwordAdornment,
            },
          }}
          error={Boolean(
            confirmPassword &&
              confirmPassword !== newPassword,
          )}
          helperText={
            confirmPassword &&
            confirmPassword !== newPassword
              ? 'รหัสผ่านที่ยืนยันไม่ตรงกัน'
              : ''
          }
          onChange={(event) => {
            setConfirmPassword(
              event.target.value,
            );

            setMessage(null);
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            height: 44,
            mt: 2,
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          {isSubmitting
            ? 'กำลังรีเซ็ตรหัสผ่าน...'
            : 'ตั้งรหัสผ่านใหม่'}
        </Button>
      </form>
    </PasswordRecoveryLayout>
  );
}

export default ResetPasswordPage;
