import {
  Box,
  Typography,
} from '@mui/material';

import {
  CheckCircleRounded,
  RadioButtonUncheckedRounded,
} from '@mui/icons-material';

function normalizeValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function PasswordPolicyList({
  password = '',
  username = '',
  email = '',
}) {
  const normalizedPassword =
    normalizeValue(password);
  const normalizedUsername =
    normalizeValue(username);
  const normalizedEmail =
    normalizeValue(email);
  const hasPassword =
    password.length > 0;

  const passwordPolicies = [
    {
      label: 'อย่างน้อย 10 ตัวอักษร และไม่มีช่องว่าง',
      isValid:
        password.length >= 10 &&
        !/\s/.test(password),
    },
    {
      label: 'มีตัวพิมพ์ใหญ่และตัวพิมพ์เล็ก',
      isValid:
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password),
    },
    {
      label: 'มีตัวเลขและอักขระพิเศษ',
      isValid:
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9\s]/.test(password),
    },
    {
      label: 'ไม่ซ้ำกับ Username หรือ Email',
      isValid:
        hasPassword &&
        (
          !normalizedUsername ||
          normalizedPassword !==
            normalizedUsername
        ) &&
        (
          !normalizedEmail ||
          normalizedPassword !==
            normalizedEmail
        ),
    },
  ];

  return (
    <Box
      sx={{
        marginTop: '10px',
        marginBottom: '14px',
        padding: '2px 4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}
    >
      {passwordPolicies.map(
        (policy) => (
          <Box
            key={policy.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            {policy.isValid ? (
              <CheckCircleRounded
                sx={{
                  flexShrink: 0,
                  color: '#16A34A',
                  fontSize: '16px',
                }}
              />
            ) : (
              <RadioButtonUncheckedRounded
                sx={{
                  flexShrink: 0,
                  color: '#94A3B8',
                  fontSize: '16px',
                }}
              />
            )}

            <Typography
              sx={{
                color:
                  policy.isValid
                    ? '#15803D'
                    : '#64748B',
                fontSize: '12px',
                fontWeight:
                  policy.isValid
                    ? 700
                    : 500,
                lineHeight: 1.4,
              }}
            >
              {policy.label}
            </Typography>
          </Box>
        ),
      )}
    </Box>
  );
}

export default PasswordPolicyList;
