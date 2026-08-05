import { useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import api from '../api/axios.js';
import PasswordRecoveryLayout from '../components/passwordrecoverylayout.jsx';
import { normalizePasswordResetIdentifier } from '../auth/passwordresetcontext.js';
import usePasswordResetFlow from '../auth/usepasswordresetflow.js';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flow = usePasswordResetFlow();
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState(() => location.state?.passwordResetMessage
    ? { severity: 'error', text: location.state.passwordResetMessage }
    : null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const normalizedIdentifier = normalizePasswordResetIdentifier(formData.get('identifier'));
    if (!normalizedIdentifier) {
      setMessage({ severity: 'error', text: 'Please enter your username or email.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await api.post('/auth/forgot-password/request-otp', { identifier: normalizedIdentifier });
      flow.begin(normalizedIdentifier, Number(response.data?.retryAfterSeconds || 60));
      setMessage({ severity: 'success', text: response.data?.message });
      navigate('/forgot-password/verify');
    } catch (error) {
      setMessage({
        severity: 'error',
        text: error.response?.data?.message || 'Unable to request a verification code.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PasswordRecoveryLayout title="Forgot Password" description="Enter your username or registered email to receive a verification code.">
      {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth required name="identifier" label="Username or Email" value={identifier} disabled={isSubmitting} autoFocus onChange={(event) => { setIdentifier(event.target.value); setMessage(null); }} />
        <Button fullWidth type="submit" variant="contained" disabled={isSubmitting} sx={{ height: 48, mt: 3, textTransform: 'none', fontWeight: 800 }}>
          {isSubmitting ? 'Sending...' : 'Send Verification Code'}
        </Button>
        <Button fullWidth type="button" disabled={isSubmitting} onClick={() => navigate('/login')} sx={{ mt: 1.5, textTransform: 'none' }}>
          Back to Login
        </Button>
      </form>
    </PasswordRecoveryLayout>
  );
}

export default ForgotPasswordPage;
