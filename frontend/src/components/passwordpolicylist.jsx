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
      label: 'อย่างน้อย 10 ตัวอักษร',
      isValid:
        password.length >= 10,
    },
    {
      label:
        'มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว',
      isValid:
        /[A-Z]/.test(password),
    },
    {
      label:
        'มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว',
      isValid:
        /[a-z]/.test(password),
    },
    {
      label:
        'มีตัวเลขอย่างน้อย 1 ตัว',
      isValid:
        /[0-9]/.test(password),
    },
    {
      label:
        'มีอักขระพิเศษอย่างน้อย 1 ตัว',
      isValid:
        /[^A-Za-z0-9\s]/.test(
          password,
        ),
    },
    {
      label:
        'ต้องไม่มีช่องว่าง',
      isValid:
        hasPassword &&
        !/\s/.test(password),
    },
    {
      label:
        'ต้องไม่เหมือน Username',
      isValid:
        hasPassword &&
        (
          !normalizedUsername ||
          normalizedPassword !==
            normalizedUsername
        ),
    },
    {
      label:
        'ต้องไม่เหมือน Email',
      isValid:
        hasPassword &&
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
        marginTop: '14px',
        marginBottom: '20px',
        padding: '15px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
      }}
    >
      {passwordPolicies.map(
        (policy) => (
          <Box
            key={policy.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {policy.isValid ? (
              <CheckCircleRounded
                sx={{
                  flexShrink: 0,
                  color: '#16A34A',
                  fontSize: '18px',
                }}
              />
            ) : (
              <RadioButtonUncheckedRounded
                sx={{
                  flexShrink: 0,
                  color: '#94A3B8',
                  fontSize: '18px',
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
                lineHeight: 1.5,
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