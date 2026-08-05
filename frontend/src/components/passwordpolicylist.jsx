import { Box, Typography } from '@mui/material';
import { passwordChecks } from '../utils/passwordpolicy.js';

function PasswordPolicyList({ password, username = '', email = '' }) {
  const identityChecks = [
    ['Different from the username', !username || password.toLowerCase() !== username.toLowerCase()],
    ['Different from the email address', !email || password.toLowerCase() !== email.toLowerCase()],
  ];

  return (
    <Box component="ul" sx={{ pl: '20px', my: 1.5 }}>
      {passwordChecks.map(([label, check]) => {
        const passes = check(password);
        return (
          <Typography component="li" key={label} sx={{ color: password ? (passes ? '#15803D' : '#B91C1C') : '#6B7280', fontSize: 13, lineHeight: 1.8 }}>
            {label}
          </Typography>
        );
      })}
      {identityChecks.map(([label, passes]) => (
        <Typography component="li" key={label} sx={{ color: password ? (passes ? '#15803D' : '#B91C1C') : '#6B7280', fontSize: 13, lineHeight: 1.8 }}>
          {label}
        </Typography>
      ))}
    </Box>
  );
}

export default PasswordPolicyList;
