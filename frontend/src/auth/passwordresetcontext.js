import { createContext } from 'react';

export function normalizePasswordResetIdentifier(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

const PasswordResetFlowContext = createContext(null);

export default PasswordResetFlowContext;
