import { useEffect, useRef, useState } from 'react';
import { Alert, Button, TextField, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';

import api from '../api/axios.js';
import PasswordRecoveryLayout from '../components/passwordrecoverylayout.jsx';
import { normalizePasswordResetIdentifier } from '../auth/passwordresetcontext.js';
import usePasswordResetFlow from '../auth/usepasswordresetflow.js';

function VerifyOtpPage() {
  const navigate = useNavigate();
  const flow = usePasswordResetFlow();
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsUntilResend, setSecondsUntilResend] = useState(60);
  const resendInFlight = useRef(false);
  const identifier = normalizePasswordResetIdentifier(flow.identifier);

  useEffect(() => {
    const updateCountdown = () => {
      const remainingMilliseconds = (flow.resendAvailableAt || Date.now()) - Date.now();
      setSecondsUntilResend(Math.max(0, Math.ceil(remainingMilliseconds / 1000)));
    };
    updateCountdown();
    const timer = window.setInterval(() => {
      updateCountdown();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [flow.resendAvailableAt]);

  if (!identifier) {
    return <Navigate to="/forgot-password" replace state={{ passwordResetMessage: 'ขั้นตอนรีเซ็ตรหัสผ่านหมดอายุ กรุณาเริ่มใหม่อีกครั้ง' }} />;
  }

  const handleVerify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setMessage({ severity: 'error', text: 'กรุณากรอกรหัสยืนยัน 6 หลัก' });
      return;
    }
    setIsVerifying(true);
    setMessage(null);
    try {
      const response = await api.post('/auth/forgot-password/verify-otp', { identifier, otp });
      if (!response.data?.resetToken) throw new Error('ไม่สามารถยืนยันรหัสได้');
      flow.verify(response.data.resetToken);
      navigate('/reset-password');
    } catch (error) {
      setMessage({ severity: 'error', text: error.response?.data?.message || error.message || 'ไม่สามารถยืนยันรหัสได้' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendInFlight.current || isResending || secondsUntilResend > 0) return;
    if (!identifier) {
      flow.clearFlow();
      navigate('/forgot-password', { replace: true, state: { passwordResetMessage: 'ขั้นตอนรีเซ็ตรหัสผ่านหมดอายุ กรุณาเริ่มใหม่อีกครั้ง' } });
      return;
    }

    resendInFlight.current = true;
    setIsResending(true);
    setMessage(null);
    try {
      const response = await api.post('/auth/forgot-password/request-otp', { identifier, isResend: true });
      const retryAfterSeconds = Number(response.data?.retryAfterSeconds || 60);
      flow.markResent(retryAfterSeconds);
      setOtp('');
      setSecondsUntilResend(retryAfterSeconds);
      setMessage({ severity: 'success', text: 'ส่งรหัสยืนยันอีกครั้งแล้ว' });
    } catch (error) {
      const retryAfterSeconds = Number(error.response?.data?.retryAfterSeconds || 0);
      if (error.response?.status === 429 && retryAfterSeconds > 0) {
        flow.applyRetryAfter(retryAfterSeconds);
        setSecondsUntilResend(retryAfterSeconds);
        setMessage({ severity: 'error', text: `กรุณารอ ${retryAfterSeconds} วินาทีก่อนขอรหัสใหม่` });
      } else {
        setMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถส่งรหัสยืนยันอีกครั้งได้' });
      }
    } finally {
      resendInFlight.current = false;
      setIsResending(false);
    }
  };

  return (
    <PasswordRecoveryLayout title="ยืนยันรหัส" description="กรอกรหัส 6 หลักที่ส่งไปยัง Email ที่ลงทะเบียนไว้ รหัสจะหมดอายุภายใน 5 นาที">
      {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}
      <form onSubmit={handleVerify}>
        <TextField fullWidth required label="Verification Code" value={otp} disabled={isVerifying || isResending} autoFocus inputMode="numeric" autoComplete="one-time-code" slotProps={{ htmlInput: { maxLength: 6, pattern: '[0-9]*' } }} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} />
        <Typography sx={{ color: '#6B7280', fontSize: 13, mt: 1.5 }}>รหัสจะหมดอายุภายใน 5 นาทีหลังจากส่ง</Typography>
        <Button fullWidth type="submit" variant="contained" disabled={isVerifying || isResending || otp.length !== 6} sx={{ height: 48, mt: 3, textTransform: 'none', fontWeight: 800 }}>
          {isVerifying ? 'กำลังยืนยัน...' : 'ยืนยันรหัส'}
        </Button>
        <Button fullWidth type="button" disabled={isVerifying || isResending || secondsUntilResend > 0} onClick={handleResend} sx={{ mt: 1, textTransform: 'none' }}>
          {isResending ? 'กำลังส่งอีกครั้ง...' : secondsUntilResend > 0 ? `ส่งรหัสอีกครั้ง (${secondsUntilResend} วินาที)` : 'ส่งรหัสอีกครั้ง'}
        </Button>
        <Button fullWidth type="button" disabled={isVerifying || isResending} onClick={() => { flow.clearFlow(); navigate('/forgot-password'); }} sx={{ mt: 0.5, textTransform: 'none' }}>
          Back
        </Button>
      </form>
    </PasswordRecoveryLayout>
  );
}

export default VerifyOtpPage;
