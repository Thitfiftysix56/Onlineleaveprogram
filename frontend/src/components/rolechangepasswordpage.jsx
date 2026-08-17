import {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import {
  CheckRounded,
  LockRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material';

import {
  useNavigate,
} from 'react-router-dom';

import api from '../api/axios.js';

import {
  getCurrentUser,
  getDashboardPathByRole,
  saveBackendAuthSession,
} from '../utils/authstorage.js';

const emptyFormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const translatePasswordMessage = (
  message,
  fallback,
) => {
  const text =
    String(
      message || '',
    ).trim();

  const messageMap = {
    'The current password is incorrect.':
      'รหัสผ่านปัจจุบันไม่ถูกต้อง',

    'Current password is incorrect.':
      'รหัสผ่านปัจจุบันไม่ถูกต้อง',

    'The new password must be different from the current password.':
      'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน',

    'The confirmation password does not match.':
      'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน',

    'The confirmation password does not match the new password.':
      'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน',

    'The new password must contain at least 8 characters.':
      'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร',

    'The new password must contain at least one lowercase letter.':
      'รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว',

    'The new password must contain at least one uppercase letter.':
      'รหัสผ่านใหม่ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว',

    'The new password must contain at least one number.':
      'รหัสผ่านใหม่ต้องมีตัวเลขอย่างน้อย 1 ตัว',

    'The new password must contain at least one special character.':
      'รหัสผ่านใหม่ต้องมีอักขระพิเศษอย่างน้อย 1 ตัว',

    'Your password was changed successfully.':
      'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',

    'Password changed successfully.':
      'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',

    'Password changed successfully':
      'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',

    'Unable to change password.':
      'ไม่สามารถเปลี่ยนรหัสผ่านได้',

    'Please sign in to continue.':
      'กรุณาเข้าสู่ระบบอีกครั้ง',
  };

  return (
    messageMap[text] ||
    text ||
    fallback
  );
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  disabled,
  autoComplete,
  theme,
}) {
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          display: 'block',
          color: '#374151',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '7px',
        }}
      >
        {label}
      </Typography>

      <TextField
        id={id}
        fullWidth
        required
        type={
          visible
            ? 'text'
            : 'password'
        }
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  type="button"
                  aria-label={
                    visible
                      ? 'ซ่อนรหัสผ่าน'
                      : 'แสดงรหัสผ่าน'
                  }
                  onClick={
                    onToggleVisibility
                  }
                  disabled={
                    disabled
                  }
                  sx={{
                    color: '#64748B',
                  }}
                >
                  {visible ? (
                    <VisibilityOffRounded
                      sx={{
                        fontSize: '20px',
                      }}
                    />
                  ) : (
                    <VisibilityRounded
                      sx={{
                        fontSize: '20px',
                      }}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },

          htmlInput: {
            maxLength: 128,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root':
            {
              height: '48px',
              backgroundColor: '#FAFCFF',
              borderRadius: '9px',

              '& fieldset': {
                borderColor: '#DCE3ED',
              },

              '&:hover fieldset':
                {
                  borderColor:
                    theme.border,
                },

              '&.Mui-focused fieldset':
                {
                  borderColor:
                    theme.primary,
                  borderWidth:
                    '1.5px',
                },
            },

          '& input': {
            fontSize: '14px',
          },

          '& input::-ms-reveal':
            {
              display: 'none',
            },

          '& input::-ms-clear':
            {
              display: 'none',
            },
        }}
      />
    </Box>
  );
}

function RoleChangePasswordPage({
  LayoutComponent,
  theme,
}) {
  const navigate =
    useNavigate();

  const currentUser =
    getCurrentUser();

  const [
    formData,
    setFormData,
  ] = useState(
    emptyFormData,
  );

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const resolvedTheme = {
    primary:
      theme?.primary ||
      '#2563EB',

    dark:
      theme?.dark ||
      '#1D4ED8',

    soft:
      theme?.soft ||
      '#EFF6FF',

    border:
      theme?.border ||
      '#BFDBFE',

    text:
      theme?.text ||
      '#1E3A8A',
  };

  const passwordChecks =
    useMemo(
      () => [
        {
          label:
            'อย่างน้อย 8 ตัวอักษร',

          passed:
            formData
              .newPassword
              .length >= 8,
        },

        {
          label:
            'ตัวพิมพ์เล็กอย่างน้อย 1 ตัว',

          passed:
            /[a-z]/.test(
              formData
                .newPassword,
            ),
        },

        {
          label:
            'ตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว',

          passed:
            /[A-Z]/.test(
              formData
                .newPassword,
            ),
        },

        {
          label:
            'ตัวเลขอย่างน้อย 1 ตัว',

          passed:
            /[0-9]/.test(
              formData
                .newPassword,
            ),
        },

        {
          label:
            'อักขระพิเศษอย่างน้อย 1 ตัว',

          passed:
            /[^A-Za-z0-9]/.test(
              formData
                .newPassword,
            ),
        },
      ],
      [
        formData
          .newPassword,
      ],
    );

  const allRequirementsPassed =
    passwordChecks.every(
      (
        requirement,
      ) =>
        requirement.passed,
    );

  const passwordsMatch =
    Boolean(
      formData
        .newPassword,
    ) &&
    Boolean(
      formData
        .confirmPassword,
    ) &&
    formData.newPassword ===
      formData.confirmPassword;

  const handleInputChange = (
    fieldName,
    value,
  ) => {
    setFormData(
      (
        previousData,
      ) => ({
        ...previousData,

        [fieldName]:
          value,
      }),
    );

    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setErrorMessage('');
      setSuccessMessage('');

      const currentPassword =
        String(
          formData.currentPassword ||
            '',
        );

      const newPassword =
        String(
          formData.newPassword ||
            '',
        );

      const confirmPassword =
        String(
          formData.confirmPassword ||
            '',
        );

      if (
        !currentPassword
      ) {
        setErrorMessage(
          'กรุณากรอกรหัสผ่านปัจจุบัน',
        );

        return;
      }

      if (!newPassword) {
        setErrorMessage(
          'กรุณากรอกรหัสผ่านใหม่',
        );

        return;
      }

      if (
        !confirmPassword
      ) {
        setErrorMessage(
          'กรุณายืนยันรหัสผ่านใหม่',
        );

        return;
      }

      if (
        newPassword ===
        currentPassword
      ) {
        setErrorMessage(
          'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน',
        );

        return;
      }

      if (
        !allRequirementsPassed
      ) {
        setErrorMessage(
          'รหัสผ่านใหม่ยังไม่ครบตามเงื่อนไขที่กำหนด',
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setErrorMessage(
          'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน',
        );

        return;
      }

      const wasForcedChange =
        Boolean(
          currentUser
            ?.mustChangePassword,
        );

      setIsSubmitting(
        true,
      );

      try {
        const response =
          await api.post(
            '/auth/change-password',
            {
              currentPassword,
              newPassword,
              confirmPassword,
            },
          );

        if (
          response.data?.user
        ) {
          saveBackendAuthSession(
            response.data
              .user,
          );
        }

        setFormData(
          emptyFormData,
        );

        setShowCurrentPassword(
          false,
        );

        setShowNewPassword(
          false,
        );

        setShowConfirmPassword(
          false,
        );

        setSuccessMessage(
          translatePasswordMessage(
            response.data
              ?.message,
            'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
          ),
        );

        if (
          wasForcedChange
        ) {
          const role =
            response.data
              ?.user?.role ||
            currentUser?.role ||
            'employee';

          navigate(
            getDashboardPathByRole(
              role,
            ),
            {
              replace: true,
            },
          );
        }
      } catch (error) {
        setErrorMessage(
          translatePasswordMessage(
            error.response
              ?.data
              ?.message ||
              error.message,
            'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองอีกครั้ง',
          ),
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    };

  return (
    <LayoutComponent
      activeMenu="Change Password"
    >
      <Box
        sx={{
          marginBottom:
            '22px',
        }}
      >
        <Typography
          component="h1"
          sx={{
            color: '#111827',

            fontSize: {
              xs: '26px',
              sm: '30px',
            },

            fontWeight: 800,
          }}
        >
          เปลี่ยนรหัสผ่าน
        </Typography>
      </Box>

      {(errorMessage ||
        successMessage) && (
        <Alert
          severity={
            errorMessage
              ? 'error'
              : 'success'
          }
          onClose={() => {
            setErrorMessage('');
            setSuccessMessage('');
          }}
          sx={{
            width: '100%',
            maxWidth: '900px',
            margin:
              '0 auto 18px',
            borderRadius: '10px',
            fontSize: '13px',
          }}
        >
          {errorMessage ||
            successMessage}
        </Alert>
      )}

      <Paper
        component="form"
        onSubmit={
          handleSubmit
        }
        noValidate
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            md:
              'minmax(0, 1.35fr) minmax(280px, 0.85fr)',
          },

          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '14px',

          overflow: 'hidden',
        }}
      >
        {/* Left Form */}
        <Box
          sx={{
            padding: {
              xs: '22px',
              sm: '28px',
              md: '30px 32px 32px',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <Box
              sx={{
                width: '42px',
                height: '42px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',

                backgroundColor:
                  resolvedTheme.soft,

                color:
                  resolvedTheme.primary,

                border:
                  `1px solid ${resolvedTheme.border}`,

                borderRadius: '10px',
              }}
            >
              <LockRounded
                sx={{
                  fontSize: '21px',
                }}
              />
            </Box>

            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              ตั้งรหัสผ่านใหม่
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '19px',
            }}
          >
            <PasswordField
              id="current-password"
              label="รหัสผ่านปัจจุบัน"
              value={
                formData
                  .currentPassword
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'currentPassword',
                  event.target
                    .value,
                )
              }
              visible={
                showCurrentPassword
              }
              onToggleVisibility={() =>
                setShowCurrentPassword(
                  (
                    previous,
                  ) =>
                    !previous,
                )
              }
              disabled={
                isSubmitting
              }
              autoComplete="current-password"
              theme={
                resolvedTheme
              }
            />

            <PasswordField
              id="new-password"
              label="รหัสผ่านใหม่"
              value={
                formData
                  .newPassword
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'newPassword',
                  event.target
                    .value,
                )
              }
              visible={
                showNewPassword
              }
              onToggleVisibility={() =>
                setShowNewPassword(
                  (
                    previous,
                  ) =>
                    !previous,
                )
              }
              disabled={
                isSubmitting
              }
              autoComplete="new-password"
              theme={
                resolvedTheme
              }
            />

            <PasswordField
              id="confirm-password"
              label="ยืนยันรหัสผ่านใหม่"
              value={
                formData
                  .confirmPassword
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'confirmPassword',
                  event.target
                    .value,
                )
              }
              visible={
                showConfirmPassword
              }
              onToggleVisibility={() =>
                setShowConfirmPassword(
                  (
                    previous,
                  ) =>
                    !previous,
                )
              }
              disabled={
                isSubmitting
              }
              autoComplete="new-password"
              theme={
                resolvedTheme
              }
            />
          </Box>

          {formData
            .confirmPassword &&
            formData
              .newPassword && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '7px',
                  marginTop: '12px',
                }}
              >
                <Box
                  sx={{
                    width: '8px',
                    height: '8px',
                    flexShrink: 0,

                    backgroundColor:
                      passwordsMatch
                        ? '#22C55E'
                        : '#EF4444',

                    borderRadius:
                      '50%',
                  }}
                />

                <Typography
                  sx={{
                    color:
                      passwordsMatch
                        ? '#15803D'
                        : '#DC2626',

                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {passwordsMatch
                    ? 'รหัสผ่านใหม่ตรงกัน'
                    : 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน'}
                </Typography>
              </Box>
            )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={
              isSubmitting
            }
            sx={{
              height: '46px',
              marginTop: '26px',

              backgroundColor:
                resolvedTheme.primary,

              color: '#FFFFFF',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  resolvedTheme.dark,

                boxShadow: 'none',
              },

              '&.Mui-disabled':
                {
                  backgroundColor:
                    '#CBD5E1',

                  color:
                    '#FFFFFF',
                },
            }}
          >
            {isSubmitting ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  gap: '9px',
                }}
              >
                <CircularProgress
                  size={18}
                  thickness={5}
                  sx={{
                    color:
                      '#FFFFFF',
                  }}
                />

                กำลังเปลี่ยนรหัสผ่าน...
              </Box>
            ) : (
              'เปลี่ยนรหัสผ่าน'
            )}
          </Button>
        </Box>

        {/* Right Requirement Panel */}
        <Box
          sx={{
            padding: {
              xs: '22px',
              sm: '26px',
              md: '30px',
            },

            display: 'flex',
            flexDirection:
              'column',

            justifyContent:
              'center',

            backgroundColor:
              '#F8FAFC',

            borderTop: {
              xs:
                '1px solid #E5E7EB',

              md: 'none',
            },

            borderLeft: {
              xs: 'none',

              md:
                '1px solid #E5E7EB',
            },
          }}
        >
          <Typography
            sx={{
              color: '#111827',
              fontSize: '16px',
              fontWeight: 800,
            }}
          >
            รหัสผ่านใหม่ต้องประกอบด้วย
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '13px',
              marginTop: '20px',
            }}
          >
            {passwordChecks.map(
              (
                requirement,
              ) => (
                <Box
                  key={
                    requirement.label
                  }
                  sx={{
                    display: 'flex',
                    alignItems:
                      'center',

                    gap: '10px',
                  }}
                >
                  <Box
                    sx={{
                      width: '24px',
                      height: '24px',
                      flexShrink: 0,

                      display: 'flex',
                      alignItems:
                        'center',

                      justifyContent:
                        'center',

                      backgroundColor:
                        requirement.passed
                          ? '#DCFCE7'
                          : '#FFFFFF',

                      color:
                        requirement.passed
                          ? '#15803D'
                          : '#94A3B8',

                      border:
                        requirement.passed
                          ? '1px solid #BBF7D0'
                          : '1px solid #E2E8F0',

                      borderRadius:
                        '50%',
                    }}
                  >
                    <CheckRounded
                      sx={{
                        fontSize:
                          '15px',
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      color:
                        requirement.passed
                          ? '#166534'
                          : '#64748B',

                      fontSize: '12px',

                      fontWeight:
                        requirement.passed
                          ? 600
                          : 500,
                    }}
                  >
                    {
                      requirement.label
                    }
                  </Typography>
                </Box>
              ),
            )}
          </Box>

          <Box
            sx={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop:
                '1px solid #E2E8F0',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Box
                sx={{
                  width: '24px',
                  height: '24px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    passwordsMatch
                      ? '#DCFCE7'
                      : '#FFFFFF',

                  color:
                    passwordsMatch
                      ? '#15803D'
                      : '#94A3B8',

                  border:
                    passwordsMatch
                      ? '1px solid #BBF7D0'
                      : '1px solid #E2E8F0',

                  borderRadius:
                    '50%',
                }}
              >
                <CheckRounded
                  sx={{
                    fontSize: '15px',
                  }}
                />
              </Box>

              <Typography
                sx={{
                  color:
                    passwordsMatch
                      ? '#166534'
                      : '#64748B',

                  fontSize: '12px',

                  fontWeight:
                    passwordsMatch
                      ? 600
                      : 500,
                }}
              >
                ยืนยันรหัสผ่านใหม่ให้ตรงกัน
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </LayoutComponent>
  );
}

export default RoleChangePasswordPage;