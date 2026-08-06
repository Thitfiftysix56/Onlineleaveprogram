import {
  useEffect,
  useState,
} from 'react'

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
} from '@mui/material'

import {
  CalendarMonthRounded,
  CheckCircleRounded,
  DescriptionRounded,
  LockRounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  clearAuthSession,
  getDashboardPathByRole,
  saveBackendAuthSession,
} from '../utils/authstorage.js'

import api from '../api/axios.js'

const emptyFormData = {
  username: '',
  password: '',
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    ...emptyFormData,
  })

  const [errorMessage, setErrorMessage] = useState(
    String(location.state?.authError || ''),
  )

  const successMessage = String(
    location.state?.successMessage || '',
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    clearAuthSession()
  }, [])

  const handleInputChange = (
    fieldName,
    value,
  ) => {
    setFormData((previousData) => ({
      ...previousData,
      [fieldName]: value,
    }))

    setErrorMessage('')
  }

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault()

    setErrorMessage('')

    const normalizedUsername = String(
      formData.username || '',
    )
      .trim()
      .toLowerCase()

    const enteredPassword = String(
      formData.password || '',
    )

    if (
      !normalizedUsername ||
      !enteredPassword
    ) {
      setErrorMessage(
        'กรุณากรอก Username และ Password',
      )

      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post(
        '/auth/login',
        {
          username: normalizedUsername,
          password: enteredPassword,
        },
      )

      if (response.data.status !== 'ok') {
        setErrorMessage(
          response.data.message ||
            'Unable to sign in.',
        )

        return
      }

      const session =
        saveBackendAuthSession(
          response.data.user,
        )

      const requestedPath =
        typeof location.state?.from ===
        'string'
          ? location.state.from
          : ''

      const pathSegments =
        requestedPath
          .split('/')
          .filter(Boolean)

      const requestedRole =
        String(pathSegments[0] || '')
          .trim()
          .toLowerCase()

      const currentUserRole =
        String(session.role || '')
          .trim()
          .toLowerCase()

      const canReturnToRequestedPath =
        Boolean(requestedPath) &&
        Boolean(requestedRole) &&
        requestedRole ===
          currentUserRole

      const targetPath =
        session.mustChangePassword
          ? `/${currentUserRole}/change-password`
          : canReturnToRequestedPath
            ? requestedPath
            : getDashboardPathByRole(
                session.role,
              )

      navigate(targetPath, {
        replace: true,
      })
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'เกิดข้อผิดพลาดขณะเข้าสู่ระบบ กรุณาลองอีกครั้ง',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: {
          xs: '24px 16px',
          sm: '32px 24px',
        },
        overflowX: 'hidden',
        overflowY: 'auto',
        background:
          'linear-gradient(180deg, #EAF5FF 0%, #F4F7FC 46%, #FFF1F4 100%)',
        position: 'relative',

        '&::before': {
          content: '""',
          position: 'fixed',
          width: '420px',
          height: '420px',
          top: '-180px',
          left: '-130px',
          borderRadius: '50%',
          background:
            'rgba(37, 99, 235, 0.08)',
          pointerEvents: 'none',
        },

        '&::after': {
          content: '""',
          position: 'fixed',
          width: '460px',
          height: '460px',
          right: '-170px',
          bottom: '-210px',
          borderRadius: '50%',
          background:
            'rgba(244, 114, 182, 0.08)',
          pointerEvents: 'none',
        },
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '470px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          borderRadius: {
            xs: '22px',
            sm: '26px',
          },
          backgroundColor: '#FFFFFF',
          border:
            '1px solid rgba(148, 163, 184, 0.22)',
          boxShadow:
            '0 28px 70px rgba(51, 65, 85, 0.16)',
        }}
      >
        <Box
          sx={{
            padding: {
              xs: '24px 24px 22px',
              sm: '26px 36px 24px',
            },
            textAlign: 'center',
            color: '#FFFFFF',
            background:
              'linear-gradient(135deg, #2563EB 0%, #3B82F6 55%, #60A5FA 100%)',
          }}
        >
          <Box
            sx={{
              width: '52px',
              height: '52px',
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor:
                'rgba(255, 255, 255, 0.18)',
              border:
                '1px solid rgba(255, 255, 255, 0.28)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <CalendarMonthRounded
              sx={{
                fontSize: '29px',
              }}
            />
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: '21px',
                sm: '24px',
              },
              fontWeight: 900,
              lineHeight: 1.25,
              letterSpacing: '-0.3px',
            }}
          >
            Online Leave Approval System
          </Typography>

          <Typography
            sx={{
              marginTop: '8px',
              fontSize: '13px',
              lineHeight: 1.6,
              color:
                'rgba(255, 255, 255, 0.88)',
            }}
          >
            จัดการคำขอลาได้ง่ายและปลอดภัย
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'relative',
            height: {
              xs: '160px',
              sm: '180px',
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background:
              'linear-gradient(180deg, #EFF7FF 0%, #F8FBFF 100%)',
            borderBottom:
              '1px solid #E7EEF7',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: '230px',
              height: '230px',
              borderRadius: '50%',
              background:
                'rgba(96, 165, 250, 0.11)',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              width: '155px',
              height: '155px',
              borderRadius: '50%',
              background:
                'rgba(37, 99, 235, 0.08)',
            }}
          />

          <Box
            sx={{
              position: 'relative',
              width: '170px',
              height: '118px',
              borderRadius: '18px',
              backgroundColor: '#FFFFFF',
              border:
                '1px solid #D8E7FA',
              boxShadow:
                '0 18px 35px rgba(37, 99, 235, 0.14)',
              transform: 'rotate(-2deg)',
            }}
          >
            <Box
              sx={{
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                borderRadius:
                  '17px 17px 0 0',
                background:
                  'linear-gradient(90deg, #2563EB, #60A5FA)',
              }}
            >
              <Box
                sx={{
                  width: '7px',
                  height: '7px',
                  marginRight: '6px',
                  borderRadius: '50%',
                  backgroundColor:
                    'rgba(255,255,255,0.85)',
                }}
              />

              <Box
                sx={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor:
                    'rgba(255,255,255,0.55)',
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, 1fr)',
                gap: '8px',
                padding: '15px',
              }}
            >
              {Array.from({
                length: 12,
              }).map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    height: '9px',
                    borderRadius: '4px',
                    backgroundColor:
                      index === 5 ||
                      index === 6
                        ? '#60A5FA'
                        : '#E5EDF8',
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              right: {
                xs: '38px',
                sm: '66px',
              },
              bottom: '24px',
              width: '54px',
              height: '54px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '17px',
              color: '#FFFFFF',
              background:
                'linear-gradient(135deg, #10B981, #34D399)',
              boxShadow:
                '0 12px 24px rgba(16, 185, 129, 0.25)',
              transform: 'rotate(6deg)',
            }}
          >
            <CheckCircleRounded
              sx={{
                fontSize: '32px',
              }}
            />
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: {
                xs: '38px',
                sm: '66px',
              },
              top: '28px',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              color: '#2563EB',
              backgroundColor: '#FFFFFF',
              border:
                '1px solid #DBEAFE',
              boxShadow:
                '0 10px 22px rgba(37, 99, 235, 0.14)',
              transform: 'rotate(-7deg)',
            }}
          >
            <DescriptionRounded
              sx={{
                fontSize: '26px',
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            padding: {
              xs: '26px 24px 30px',
              sm: '30px 38px 34px',
            },
          }}
        >
          <Typography
            component="h2"
            sx={{
              color: '#111827',
              fontSize: '25px',
              fontWeight: 900,
              textAlign: 'center',
              letterSpacing: '-0.3px',
            }}
          >
            Sign In
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '13px',
              lineHeight: 1.7,
              textAlign: 'center',
              marginTop: '6px',
              marginBottom: '24px',
            }}
          >
            กรอก Username และ Password เพื่อเข้าใช้งานระบบ
          </Typography>

          {errorMessage && (
            <Alert
              severity="error"
              onClose={() =>
                setErrorMessage('')
              }
              sx={{
                marginBottom: '18px',
                borderRadius: '10px',
                fontSize: '13px',
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {successMessage &&
            !errorMessage && (
              <Alert
                severity="success"
                sx={{
                  marginBottom: '18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                }}
              >
                {successMessage}
              </Alert>
            )}

          <Typography
            component="label"
            htmlFor="username"
            sx={{
              display: 'block',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 800,
              marginBottom: '7px',
            }}
          >
            Username
          </Typography>

          <TextField
            id="username"
            fullWidth
            required
            placeholder="กรอก Username"
            value={formData.username}
            onChange={(event) =>
              handleInputChange(
                'username',
                event.target.value.toLowerCase(),
              )
            }
            disabled={isSubmitting}
            autoComplete="username"
            autoFocus
            slotProps={{
              htmlInput: {
                maxLength: 50,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root':
                {
                  height: '48px',
                  borderRadius: '10px',
                  backgroundColor:
                    '#FAFCFF',

                  '& fieldset': {
                    borderColor:
                      '#DCE3ED',
                  },

                  '&:hover fieldset': {
                    borderColor:
                      '#93B4E8',
                  },

                  '&.Mui-focused fieldset':
                    {
                      borderColor:
                        '#2563EB',
                      borderWidth: '1.5px',
                    },
                },

              '& input': {
                fontSize: '14px',
              },
            }}
          />

          <Typography
            component="label"
            htmlFor="password"
            sx={{
              display: 'block',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 800,
              marginTop: '18px',
              marginBottom: '7px',
            }}
          >
            Password
          </Typography>

          <TextField
            id="password"
            fullWidth
            required
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            placeholder="กรอก Password"
            value={formData.password}
            onChange={(event) =>
              handleInputChange(
                'password',
                event.target.value,
              )
            }
            disabled={isSubmitting}
            autoComplete="current-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRounded
                      sx={{
                        color:
                          '#94A3B8',
                        fontSize: '20px',
                      }}
                    />
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      type="button"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      onClick={() =>
                        setShowPassword(
                          (previousValue) =>
                            !previousValue,
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      sx={{
                        color:
                          '#64748B',
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOffRounded
                          sx={{
                            fontSize:
                              '21px',
                          }}
                        />
                      ) : (
                        <VisibilityRounded
                          sx={{
                            fontSize:
                              '21px',
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
                  borderRadius: '10px',
                  backgroundColor:
                    '#FAFCFF',

                  '& fieldset': {
                    borderColor:
                      '#DCE3ED',
                  },

                  '&:hover fieldset': {
                    borderColor:
                      '#93B4E8',
                  },

                  '&.Mui-focused fieldset':
                    {
                      borderColor:
                        '#2563EB',
                      borderWidth: '1.5px',
                    },
                },

              '& input': {
                fontSize: '14px',
              },

              '& input::-ms-reveal': {
                display: 'none',
              },

              '& input::-ms-clear': {
                display: 'none',
              },
            }}
          />

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              navigate('/forgot-password')
            }
            sx={{
              display: 'block',
              width: 'fit-content',
              minWidth: 0,
              marginTop: '9px',
              marginLeft: 'auto',
              padding: 0,
              color: '#2563EB',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'none',

              '&:hover': {
                backgroundColor:
                  'transparent',
                textDecoration:
                  'underline',
              },
            }}
          >
            Forgot Password?
          </Button>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              height: '50px',
              marginTop: '24px',
              borderRadius: '11px',
              background:
                'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 900,
              textTransform: 'none',
              boxShadow:
                '0 12px 22px rgba(37, 99, 235, 0.22)',

              '&:hover': {
                background:
                  'linear-gradient(90deg, #1D4ED8 0%, #2563EB 100%)',
                boxShadow:
                  '0 14px 26px rgba(37, 99, 235, 0.28)',
              },

              '&.Mui-disabled': {
                color: '#FFFFFF',
                background: '#AFCBF5',
              },
            }}
          >
            {isSubmitting ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <CircularProgress
                  size={19}
                  thickness={5}
                  sx={{
                    color: '#FFFFFF',
                  }}
                />

                Signing In...
              </Box>
            ) : (
              'Sign In'
            )}
          </Button>

          <Box
            sx={{
              marginTop: '20px',
              padding: '13px 15px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              borderRadius: '10px',
              border:
                '1px solid #E1EAF6',
              backgroundColor:
                '#F7FAFE',
            }}
          >
            <CheckCircleRounded
              sx={{
                flexShrink: 0,
                marginTop: '1px',
                color: '#2563EB',
                fontSize: '18px',
              }}
            />

            <Typography
              sx={{
                color: '#64748B',
                fontSize: '11.5px',
                lineHeight: 1.7,
              }}
            >
              ระบบจะตรวจสอบ Role จากบัญชีผู้ใช้โดยอัตโนมัติ
              โดยไม่ต้องเลือก Role ด้วยตนเอง
            </Typography>
          </Box>

          <Typography
            sx={{
              marginTop: '22px',
              color: '#94A3B8',
              fontSize: '11px',
              textAlign: 'center',
            }}
          >
            เข้าใช้งานอย่างปลอดภัยตาม Role สำหรับ Employee, Supervisor, HR และ Admin
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage
