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
import { PageHeader } from './sharedvisualfoundation.jsx';

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
              height: '50px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',

              '& fieldset': {
                borderColor: '#E2E8F0',
              },

              '&:hover fieldset':
                {
                  borderColor:
                    '#CBD5E1',
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
          width: '100%',
          maxWidth: '620px',
          marginInline: 'auto',
        }}
      >
      <PageHeader
        title="เปลี่ยนรหัสผ่าน"
        sx={{
          marginBottom: '18px',
        }}
      />

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
            maxWidth: '760px',
            marginBottom: '16px',
            borderRadius: '10px',
            fontSize: '12px',
          }}
        >
          {errorMessage ||
            successMessage}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          width: '100%',
          maxWidth: '620px',
          margin: '0 auto',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            background:
              `linear-gradient(
                135deg,
                #FFFFFF 0%,
                ${resolvedTheme.soft || '#EFF6FF'} 100%
              )`,
            border:
              '1px solid #E6ECF3',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow:
              `0 10px 28px ${resolvedTheme.primary}12`,
          }}
        >
          <Box
            sx={{
              padding: {
                xs: '20px 18px 18px',
                sm: '22px 24px 20px',
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto 18px',
              }}
            >
              <Typography
                sx={{
                  color: resolvedTheme.dark,
                  fontSize: '14px',
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
                gap: '18px',
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              <PasswordField
                id="current-password"
                label="รหัสผ่านปัจจุบัน"
                value={
                  formData.currentPassword
                }
                onChange={(event) =>
                  handleInputChange(
                    'currentPassword',
                    event.target.value,
                  )
                }
                visible={
                  showCurrentPassword
                }
                onToggleVisibility={() =>
                  setShowCurrentPassword(
                    (previous) =>
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

              <Box>
                <PasswordField
                  id="new-password"
                  label="รหัสผ่านใหม่"
                  value={
                    formData.newPassword
                  }
                  onChange={(event) =>
                    handleInputChange(
                      'newPassword',
                      event.target.value,
                    )
                  }
                  visible={
                    showNewPassword
                  }
                  onToggleVisibility={() =>
                    setShowNewPassword(
                      (previous) =>
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

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '7px',
                    marginTop: '10px',
                  }}
                >
                  {passwordChecks.map(
                    (requirement) => (
                      <Box
                        key={
                          requirement.label
                        }
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          minHeight: '26px',
                          padding: '4px 8px',
                          backgroundColor:
                            requirement.passed
                              ? '#F0FDF4'
                              : 'rgba(255,255,255,0.78)',
                          border: 'none',
                          borderRadius: '8px',
                        }}
                      >
                        <CheckRounded
                          sx={{
                            fontSize: '12px',
                            color:
                              requirement.passed
                                ? '#16A34A'
                                : '#CBD5E1',
                          }}
                        />

                        <Typography
                          sx={{
                            color:
                              requirement.passed
                                ? '#166534'
                                : '#64748B',
                            fontSize: '9.5px',
                            fontWeight: 600,
                            lineHeight: 1.2,
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
              </Box>

              <Box>
                <PasswordField
                  id="confirm-password"
                  label="ยืนยันรหัสผ่านใหม่"
                  value={
                    formData.confirmPassword
                  }
                  onChange={(event) =>
                    handleInputChange(
                      'confirmPassword',
                      event.target.value,
                    )
                  }
                  visible={
                    showConfirmPassword
                  }
                  onToggleVisibility={() =>
                    setShowConfirmPassword(
                      (previous) =>
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

                {formData.confirmPassword &&
                  formData.newPassword && (
                    <Typography
                      sx={{
                        marginTop: '7px',
                        color:
                          passwordsMatch
                            ? '#15803D'
                            : '#DC2626',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {passwordsMatch
                        ? 'รหัสผ่านใหม่ตรงกัน'
                        : 'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน'}
                    </Typography>
                  )}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              padding: {
                xs: '0 18px 20px',
                sm: '0 22px 22px',
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto',
                display: 'flex',
                justifyContent:
                  'flex-end',
              }}
            >
              <Button
              type="submit"
              variant="contained"
              disabled={
                isSubmitting
              }
              sx={{
                minWidth: '142px',
                height: '40px',
                padding: '0 18px',
                backgroundColor:
                  resolvedTheme.primary,
                color: '#FFFFFF',
                borderRadius: '9px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow:
                  `0 5px 12px ${resolvedTheme.primary}28`,

                '&:hover': {
                  backgroundColor:
                    resolvedTheme.dark,
                  boxShadow:
                    `0 6px 14px ${resolvedTheme.primary}36`,
                },

                '&.Mui-disabled': {
                  backgroundColor:
                    '#CBD5E1',
                  color: '#FFFFFF',
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
                    gap: '8px',
                  }}
                >
                  <CircularProgress
                    size={16}
                    thickness={5}
                    sx={{
                      color:
                        '#FFFFFF',
                    }}
                  />
                  กำลังเปลี่ยน...
                </Box>
              ) : (
                'เปลี่ยนรหัสผ่าน'
              )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      </Box>
    </LayoutComponent>

  );
}

export default RoleChangePasswordPage;
