import { useMemo, useState } from 'react';
import PasswordResetFlowContext, { normalizePasswordResetIdentifier } from './passwordresetcontext.js';

function PasswordResetFlowProvider({ children }) {
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otpRequestedAt, setOtpRequestedAt] = useState(null);
  const [resendAvailableAt, setResendAvailableAt] = useState(null);

  const clearFlow = () => {
    setIdentifier('');
    setResetToken('');
    setOtpRequestedAt(null);
    setResendAvailableAt(null);
  };

  const value = useMemo(() => ({
    identifier,
    resetToken,
    otpRequestedAt,
    resendAvailableAt,
    begin(identifierValue, retryAfterSeconds = 60) {
      const completeIdentifier = normalizePasswordResetIdentifier(identifierValue);
      const requestedAt = Date.now();
      setIdentifier(completeIdentifier);
      setResetToken('');
      setOtpRequestedAt(requestedAt);
      setResendAvailableAt(requestedAt + (retryAfterSeconds * 1000));
    },
    markResent(retryAfterSeconds = 60) {
      const requestedAt = Date.now();
      setOtpRequestedAt(requestedAt);
      setResendAvailableAt(requestedAt + (retryAfterSeconds * 1000));
    },
    applyRetryAfter(retryAfterSeconds) {
      setResendAvailableAt(Date.now() + (retryAfterSeconds * 1000));
    },
    verify(token) {
      setResetToken(token);
    },
    clearFlow,
  }), [identifier, resetToken, otpRequestedAt, resendAvailableAt]);

  return (
    <PasswordResetFlowContext.Provider value={value}>
      {children}
    </PasswordResetFlowContext.Provider>
  );
}

export default PasswordResetFlowProvider;
