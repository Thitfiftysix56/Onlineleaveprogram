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
  VisibilityOffRounded,
  VisibilityRounded,
} from '@mui/icons-material'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  keyframes,
} from '@emotion/react'

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


/* =========================
   ANIMATIONS
========================= */

const meshMovement = keyframes`
  0% {
    background-position:
      0% 0%,
      100% 0%,
      0% 100%,
      50% 100%,
      100% 100%,
      50% 50%;
  }

  50% {
    background-position:
      5% 3%,
      94% 5%,
      4% 94%,
      54% 95%,
      96% 94%,
      50% 50%;
  }

  100% {
    background-position:
      2% 7%,
      96% 2%,
      7% 96%,
      46% 93%,
      93% 98%,
      50% 50%;
  }
`


const floatingCircle = keyframes`
  0% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -8px, 0);
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
`


const buttonShine = keyframes`
  0% {
    transform: translateX(-180%) skewX(-22deg);
  }

  100% {
    transform: translateX(280%) skewX(-22deg);
  }
`


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

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [showPassword, setShowPassword] =
    useState(false)


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


  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      height: '48px',

      borderRadius: '10px',

      backgroundColor: '#F8FAFC',

      transition:
        'box-shadow 180ms ease, background-color 180ms ease',

      '& fieldset': {
        borderColor: '#CBD5E1',

        transition:
          'border-color 180ms ease',
      },

      '&:hover fieldset': {
        borderColor: '#A78BFA',
      },

      '&.Mui-focused': {
        backgroundColor: '#FFFFFF',

        boxShadow:
          '0 0 0 4px rgba(99, 102, 241, 0.10), 0 8px 20px rgba(99, 102, 241, 0.08)',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#6366F1',

        borderWidth: '1.5px',
      },
    },

    '& input': {
      fontSize: '14px',
    },
  }


  return (
    <Box
      sx={{
        minHeight: '100vh',

        width: '100%',

        boxSizing: 'border-box',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        padding: {
          xs: '20px 14px',
          sm: '32px 24px',
        },

        overflowX: 'hidden',

        overflowY: 'auto',

        background: `
          radial-gradient(
            circle at 8% 14%,
            rgba(59, 130, 246, 0.19) 0%,
            rgba(59, 130, 246, 0.08) 24%,
            transparent 44%
          ),

          radial-gradient(
            circle at 92% 86%,
            rgba(139, 92, 246, 0.17) 0%,
            rgba(139, 92, 246, 0.07) 26%,
            transparent 46%
          ),

          radial-gradient(
            circle at 82% 8%,
            rgba(16, 185, 129, 0.09) 0%,
            rgba(16, 185, 129, 0.035) 22%,
            transparent 38%
          ),

          radial-gradient(
            circle at 20% 92%,
            rgba(14, 165, 233, 0.08) 0%,
            transparent 36%
          ),

          #EEF2F8
        `,
      }}
    >
      <Paper
        component="form"

        onSubmit={
          handleSubmit
        }

        elevation={0}

        sx={{
          width: '100%',

          maxWidth: '920px',

          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            sm: '0.92fr 1.08fr',
          },

          overflow: 'hidden',

          borderRadius: {
            xs: '20px',
            sm: '24px',
          },

          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid rgba(148, 163, 184, 0.22)',

          boxShadow:
            '0 28px 70px rgba(30, 41, 59, 0.16)',
        }}
      >

        {/* =========================
            SYSTEM BRANDING
        ========================== */}

        <Box
          sx={{
            position: 'relative',

            minHeight: {
              xs: 'auto',
              sm: '560px',
            },

            padding: {
              xs: '30px 24px',
              sm: '40px 30px',
              md: '48px 42px',
            },

            display: 'flex',

            flexDirection:
              'column',

            alignItems:
              'center',

            justifyContent:
              'center',

            textAlign:
              'center',

            overflow:
              'hidden',

            background: `
              radial-gradient(
                ellipse at 0% 0%,
                rgba(14, 165, 233, 0.84) 0%,
                rgba(14, 165, 233, 0.28) 32%,
                transparent 58%
              ),

              radial-gradient(
                ellipse at 100% 5%,
                rgba(139, 92, 246, 0.88) 0%,
                rgba(139, 92, 246, 0.30) 36%,
                transparent 62%
              ),

              radial-gradient(
                ellipse at 0% 100%,
                rgba(16, 185, 129, 0.82) 0%,
                rgba(16, 185, 129, 0.34) 40%,
                transparent 66%
              ),

              radial-gradient(
                ellipse at 48% 92%,
                rgba(5, 150, 105, 0.36) 0%,
                rgba(5, 150, 105, 0.16) 32%,
                transparent 60%
              ),

              radial-gradient(
                ellipse at 100% 100%,
                rgba(249, 115, 22, 0.52) 0%,
                rgba(249, 115, 22, 0.17) 32%,
                transparent 58%
              ),

              linear-gradient(
                140deg,
                #3B82F6 0%,
                #6366F1 34%,
                #6D5FE7 58%,
                #8B5CF6 100%
              )
            `,

            backgroundSize: `
              115% 115%,
              115% 115%,
              115% 115%,
              115% 115%,
              115% 115%,
              100% 100%
            `,

            animation:
              `${meshMovement} 18s ease-in-out infinite`,

            borderRight: {
              xs: 'none',
              sm:
                '1px solid rgba(99, 102, 241, 0.22)',
            },

            borderBottom: {
              xs:
                '1px solid rgba(99, 102, 241, 0.22)',

              sm: 'none',
            },

            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >

          {/* =========================
              DECORATION
          ========================== */}

          <Box
            aria-hidden="true"

            sx={{
              position:
                'absolute',

              width:
                '300px',

              height:
                '300px',

              top:
                '-165px',

              left:
                '-145px',

              borderRadius:
                '50%',

              backgroundColor:
                'rgba(255,255,255,0.11)',

              animation:
                `${floatingCircle} 8s ease-in-out infinite`,

              pointerEvents:
                'none',

              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />


          <Box
            aria-hidden="true"

            sx={{
              position:
                'absolute',

              width:
                '270px',

              height:
                '270px',

              right:
                '-135px',

              bottom:
                '-135px',

              borderRadius:
                '50%',

              backgroundColor:
                'rgba(255,255,255,0.085)',

              animation:
                `${floatingCircle} 10s ease-in-out infinite 1s`,

              pointerEvents:
                'none',

              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />


          <Box
            aria-hidden="true"

            sx={{
              position:
                'absolute',

              width:
                '90px',

              height:
                '90px',

              right:
                '34px',

              top:
                '50px',

              borderRadius:
                '50%',

              border:
                '1px solid rgba(255,255,255,0.12)',

              backgroundColor:
                'rgba(255,255,255,0.035)',

              pointerEvents:
                'none',
            }}
          />


          <Box
            aria-hidden="true"

            sx={{
              position:
                'absolute',

              width:
                '190px',

              height:
                '650px',

              top:
                '-110px',

              left:
                '125px',

              transform:
                'rotate(24deg)',

              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.085) 50%, transparent 100%)',

              pointerEvents:
                'none',
            }}
          />


          {/* =========================
              SYSTEM ICON
          ========================== */}

          <Box
            sx={{
              position:
                'relative',

              zIndex:
                2,

              width: {
                xs: '60px',
                sm: '68px',
                md: '72px',
              },

              height: {
                xs: '60px',
                sm: '68px',
                md: '72px',
              },

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              borderRadius: {
                xs: '17px',
                md: '20px',
              },

              color:
                '#6366F1',

              backgroundColor:
                'rgba(255,255,255,0.95)',

              border:
                '1px solid rgba(255,255,255,0.80)',

              boxShadow:
                '0 18px 38px rgba(15,23,42,0.19)',

              backdropFilter:
                'blur(10px)',

              transition:
                'transform 200ms ease, box-shadow 200ms ease',

              '&:hover': {
                transform:
                  'translateY(-2px) rotate(-2deg)',

                boxShadow:
                  '0 22px 44px rgba(15,23,42,0.24)',
              },
            }}
          >
            <CalendarMonthRounded
              sx={{
                fontSize: {
                  xs: '33px',
                  sm: '37px',
                  md: '40px',
                },
              }}
            />
          </Box>


          {/* =========================
              SYSTEM NAME
          ========================== */}

          <Typography
            component="h1"

            sx={{
              position:
                'relative',

              zIndex:
                2,

              maxWidth:
                '330px',

              marginTop: {
                xs: '20px',
                sm: '24px',
              },

              color:
                '#FFFFFF',

              fontSize: {
                xs: '21px',
                sm: '24px',
                md: '28px',
              },

              fontWeight:
                900,

              lineHeight:
                1.3,

              letterSpacing:
                '-0.35px',

              textShadow:
                '0 2px 10px rgba(15,23,42,0.16)',
            }}
          >
            Online Leave Approval System
          </Typography>


          <Typography
            sx={{
              position:
                'relative',

              zIndex:
                2,

              marginTop:
                '10px',

              color:
                'rgba(255,255,255,0.90)',

              fontSize: {
                xs: '13px',
                sm: '14px',
              },

              fontWeight:
                600,

              lineHeight:
                1.7,
            }}
          >
            ระบบอนุมัติใบลาออนไลน์
          </Typography>


          {/* =========================
              ROLE COLOR DOTS
          ========================== */}

          <Box
            aria-hidden="true"

            sx={{
              position:
                'relative',

              zIndex:
                2,

              display:
                'flex',

              alignItems:
                'center',

              gap:
                '8px',

              marginTop:
                '22px',

              padding:
                '7px 11px',

              borderRadius:
                '999px',

              backgroundColor:
                'rgba(255,255,255,0.13)',

              border:
                '1px solid rgba(255,255,255,0.18)',

              backdropFilter:
                'blur(9px)',

              boxShadow:
                '0 6px 16px rgba(15,23,42,0.07)',
            }}
          >
            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius:
                  '50%',

                backgroundColor:
                  '#93C5FD',
              }}
            />


            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius:
                  '50%',

                backgroundColor:
                  '#C4B5FD',
              }}
            />


            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius:
                  '50%',

                backgroundColor:
                  '#6EE7B7',
              }}
            />


            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius:
                  '50%',

                backgroundColor:
                  '#FDBA74',
              }}
            />
          </Box>
        </Box>


        {/* =========================
            LOGIN FORM
        ========================== */}

        <Box
          sx={{
            padding: {
              xs:
                '30px 24px 34px',

              sm:
                '40px 36px',

              md:
                '46px 52px',
            },

            display:
              'flex',

            flexDirection:
              'column',

            justifyContent:
              'center',

            minWidth:
              0,

            backgroundColor:
              '#FFFFFF',
          }}
        >

          <Typography
            component="h2"

            sx={{
              color:
                '#0F172A',

              fontSize: {
                xs: '24px',
                sm: '27px',
              },

              fontWeight:
                900,

              lineHeight:
                1.3,

              letterSpacing:
                '-0.3px',

              textAlign:
                'left',
            }}
          >
            Login
          </Typography>


          <Typography
            sx={{
              color:
                '#64748B',

              fontSize:
                '13px',

              lineHeight:
                1.7,

              textAlign:
                'left',

              marginTop:
                '6px',

              marginBottom:
                '26px',
            }}
          >
            กรุณากรอก Username และ Password เพื่อเข้าใช้งานระบบ
          </Typography>


          {/* =========================
              ERROR
          ========================== */}

          {errorMessage && (
            <Alert
              severity="error"

              onClose={() =>
                setErrorMessage('')
              }

              sx={{
                marginBottom:
                  '18px',

                borderRadius:
                  '10px',

                fontSize:
                  '13px',
              }}
            >
              {errorMessage}
            </Alert>
          )}


          {/* =========================
              SUCCESS
          ========================== */}

          {successMessage &&
            !errorMessage && (
              <Alert
                severity="success"

                sx={{
                  marginBottom:
                    '18px',

                  borderRadius:
                    '10px',

                  fontSize:
                    '13px',
                }}
              >
                {successMessage}
              </Alert>
            )}


          {/* =========================
              USERNAME
          ========================== */}

          <Typography
            component="label"

            htmlFor="username"

            sx={{
              display:
                'block',

              color:
                '#334155',

              fontSize:
                '13px',

              fontWeight:
                800,

              marginBottom:
                '7px',
            }}
          >
            Username
          </Typography>


          <TextField
            id="username"

            fullWidth

            required

            placeholder="Enter Username"

            value={
              formData.username
            }

            onChange={(event) =>
              handleInputChange(
                'username',

                event.target.value.toLowerCase(),
              )
            }

            disabled={
              isSubmitting
            }

            autoComplete="username"

            autoFocus

            slotProps={{
              htmlInput: {
                maxLength: 50,
              },
            }}

            sx={
              inputStyle
            }
          />


          {/* =========================
              PASSWORD
          ========================== */}

          <Typography
            component="label"

            htmlFor="password"

            sx={{
              display:
                'block',

              color:
                '#334155',

              fontSize:
                '13px',

              fontWeight:
                800,

              marginTop:
                '18px',

              marginBottom:
                '7px',
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

            placeholder="Enter Password"

            value={
              formData.password
            }

            onChange={(event) =>
              handleInputChange(
                'password',

                event.target.value,
              )
            }

            disabled={
              isSubmitting
            }

            autoComplete="current-password"

            slotProps={{
              input: {
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
                          (
                            previousValue,
                          ) =>
                            !previousValue,
                        )
                      }

                      disabled={
                        isSubmitting
                      }

                      sx={{
                        color:
                          '#64748B',

                        transition:
                          'color 180ms ease, background-color 180ms ease',

                        '&:hover': {
                          color:
                            '#6366F1',

                          backgroundColor:
                            'rgba(99,102,241,0.08)',
                        },
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
                maxLength:
                  128,
              },
            }}

            sx={{
              ...inputStyle,

              '& input::-ms-reveal': {
                display:
                  'none',
              },

              '& input::-ms-clear': {
                display:
                  'none',
              },
            }}
          />


          {/* =========================
              FORGOT PASSWORD
          ========================== */}

          <Button
            type="button"

            disabled={
              isSubmitting
            }

            onClick={() =>
              navigate(
                '/forgot-password',
              )
            }

            sx={{
              display:
                'block',

              width:
                'fit-content',

              minWidth:
                0,

              marginTop:
                '9px',

              marginLeft:
                'auto',

              padding:
                0,

              color:
                '#6366F1',

              fontSize:
                '12px',

              fontWeight:
                800,

              textTransform:
                'none',

              '&:hover': {
                backgroundColor:
                  'transparent',

                color:
                  '#7C3AED',

                textDecoration:
                  'underline',
              },
            }}
          >
            Forgot Password?
          </Button>


          {/* =========================
              SIGN IN
          ========================== */}

          <Button
            fullWidth

            type="submit"

            variant="contained"

            disabled={
              isSubmitting
            }

            sx={{
              position:
                'relative',

              overflow:
                'hidden',

              height:
                '50px',

              marginTop:
                '24px',

              borderRadius:
                '11px',

              background:
                'linear-gradient(100deg, #3B82F6 0%, #6366F1 48%, #8B5CF6 100%)',

              color:
                '#FFFFFF',

              fontSize:
                '14px',

              fontWeight:
                900,

              textTransform:
                'none',

              boxShadow:
                '0 12px 27px rgba(99,102,241,0.28)',

              transition:
                'transform 180ms ease, box-shadow 180ms ease',

              '&::after': {
                content:
                  '""',

                position:
                  'absolute',

                top:
                  '-30%',

                left:
                  0,

                width:
                  '36%',

                height:
                  '160%',

                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.34), transparent)',

                transform:
                  'translateX(-180%) skewX(-22deg)',

                pointerEvents:
                  'none',
              },

              '&:hover': {
                background:
                  'linear-gradient(100deg, #2563EB 0%, #4F46E5 48%, #7C3AED 100%)',

                boxShadow:
                  '0 15px 32px rgba(99,102,241,0.34)',

                transform:
                  'translateY(-1px)',
              },

              '&:hover::after': {
                animation:
                  `${buttonShine} 850ms ease`,
              },

              '&:active': {
                transform:
                  'translateY(0px)',
              },

              '&.Mui-disabled': {
                color:
                  '#FFFFFF',

                background:
                  '#A5B4FC',

                boxShadow:
                  'none',
              },

              '@media (prefers-reduced-motion: reduce)': {
                transition:
                  'none',

                '&:hover': {
                  transform:
                    'none',
                },

                '&:hover::after': {
                  animation:
                    'none',
                },
              },
            }}
          >
            {isSubmitting ? (
              <Box
                sx={{
                  position:
                    'relative',

                  zIndex:
                    2,

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    '10px',
                }}
              >
                <CircularProgress
                  size={19}

                  thickness={5}

                  sx={{
                    color:
                      '#FFFFFF',
                  }}
                />

                Signing In...
              </Box>
            ) : (
              <Box
                component="span"

                sx={{
                  position:
                    'relative',

                  zIndex:
                    2,
                }}
              >
                Sign In
              </Box>
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}


export default LoginPage