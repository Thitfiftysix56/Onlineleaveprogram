import { useContext } from 'react';
import PasswordResetFlowContext from './passwordresetcontext.js';

export default function usePasswordResetFlow() {
  const value = useContext(PasswordResetFlowContext);
  if (!value) {
    throw new Error('PasswordResetFlowProvider is required.');
  }
  return value;
}
