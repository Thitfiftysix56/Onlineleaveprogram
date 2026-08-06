import {
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';

import {
  PersonSearchRounded,
  SendRounded,
} from '@mui/icons-material';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import api from '../api/axios.js';
import PasswordRecoveryLayout from '../components/passwordrecoverylayout.jsx';

import {
  normalizePasswordResetIdentifier,
} from '../auth/passwordresetcontext.js';

import usePasswordResetFlow from '../auth/usepasswordresetflow.js';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flow = usePasswordResetFlow();

  const [
    identifier,
    setIdentifier,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState(() => (
    location.state?.passwordResetMessage
      ? {
          severity: 'error',
          text: location.state.passwordResetMessage,
        }
      : null
  ));

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    const formData =
      new FormData(event.currentTarget);

    const normalizedIdentifier =
      normalizePasswordResetIdentifier(
        formData.get('identifier'),
      );

    if (!normalizedIdentifier) {
      setMessage({
        severity: 'error',
        text: 'Please enter your username or email.',
      });

      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post(
        '/auth/forgot-password/request-otp',
        {
          identifier:
            normalizedIdentifier,
        },
      );

      flow.begin(
        normalizedIdentifier,
        Number(
          response.data
            ?.retryAfterSeconds || 60,
        ),
      );

      setMessage({
        severity: 'success',
        text: response.data?.message,
      });

      navigate(
        '/forgot-password/verify',
      );
    } catch (error) {
      setMessage({
        severity: 'error',
        text:
          error.response?.data?.message ||
          'Unable to request a verification code.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PasswordRecoveryLayout
      title="Forgot Password"
      description="Enter your username or registered email to receive a verification code."
    >
      {message && (
        <Alert
          severity={message.severity}
          onClose={() =>
            setMessage(null)
          }
          sx={{
            marginBottom: '20px',
            borderRadius: '10px',
            fontSize: '13px',
          }}
        >
          {message.text}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
      >
        <Typography
          component="label"
          htmlFor="identifier"
          sx={{
            display: 'block',
            color: '#374151',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '8px',
          }}
        >
          Username or Email
        </Typography>

        <TextField
          id="identifier"
          fullWidth
          required
          name="identifier"
          placeholder="Enter your username or email"
          value={identifier}
          disabled={isSubmitting}
          autoFocus
          autoComplete="username"
          onChange={(event) => {
            setIdentifier(
              event.target.value,
            );

            setMessage(null);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonSearchRounded
                    sx={{
                      color: '#94A3B8',
                      fontSize: '21px',
                    }}
                  />
                </InputAdornment>
              ),
            },

            htmlInput: {
              maxLength: 120,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: '50px',
              borderRadius: '10px',
              backgroundColor: '#FAFCFF',

              '& fieldset': {
                borderColor: '#DCE3ED',
              },

              '&:hover fieldset': {
                borderColor: '#93B4E8',
              },

              '&.Mui-focused fieldset': {
                borderColor: '#2563EB',
                borderWidth: '1.5px',
              },
            },

            '& input': {
              fontSize: '14px',
            },
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting
              ? null
              : <SendRounded />
          }
          sx={{
            height: '50px',
            marginTop: '26px',
            borderRadius: '11px',
            background:
              'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 900,
            textTransform: 'none',
            boxShadow:
              '0 12px 22px rgba(37, 99, 235, 0.22)',

            '&:hover': {
              background:
                'linear-gradient(90deg, #1D4ED8 0%, #2563EB 100%)',
              boxShadow:
                '0 14px 26px rgba(37, 99, 235, 0.28)',
            },

            '&.Mui-disabled': {
              color: '#FFFFFF',
              backgroundColor: '#AFCBF5',
            },
          }}
        >
          {isSubmitting ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <CircularProgress
                size={19}
                thickness={5}
                sx={{
                  color: '#FFFFFF',
                }}
              />

              Sending...
            </Box>
          ) : (
            'Send Verification Code'
          )}
        </Button>

        <Box
          sx={{
            marginTop: '20px',
            padding: '14px 16px',
            borderRadius: '10px',
            border: '1px solid #E1EAF6',
            backgroundColor: '#F7FAFE',
          }}
        >
          <Typography
            sx={{
              color: '#64748B',
              fontSize: '11.5px',
              lineHeight: 1.7,
              textAlign: 'center',
            }}
          >
            The verification code will be sent only to the email
            registered with your account.
          </Typography>
        </Box>
      </Box>
    </PasswordRecoveryLayout>
  );
}

export default ForgotPasswordPage;