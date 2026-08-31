import {
  Box,
  Paper,
  Typography,
} from '@mui/material'

import {
  LockResetRounded,
  MailOutlineRounded,
  SecurityRounded,
} from '@mui/icons-material'

import {
  keyframes,
} from '@emotion/react'


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
    transform: translate3d(0, -7px, 0);
  }

  100% {
    transform: translate3d(0, 0, 0);
  }
`


function PasswordRecoveryLayout({
  title,
  description,
  children,
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',

        width: '100%',

        boxSizing: 'border-box',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        position: 'relative',

        overflowX: 'hidden',

        overflowY: 'auto',

        padding: {
          xs: '20px 14px',
          sm: '32px 24px',
        },

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
        elevation={0}

        sx={{
          width: '100%',

          maxWidth: '920px',

          position: 'relative',

          zIndex: 1,

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

          backgroundColor: '#FFFFFF',

          border:
            '1px solid rgba(148, 163, 184, 0.22)',

          boxShadow:
            '0 28px 70px rgba(30, 41, 59, 0.16)',
        }}
      >

        {/* =========================
            LEFT PANEL
        ========================== */}

        <Box
          sx={{
            position: 'relative',

            minHeight: {
              xs: '300px',
              sm: '560px',
            },

            padding: {
              xs: '30px 24px',
              sm: '40px 30px',
              md: '48px 42px',
            },

            display: 'flex',

            flexDirection: 'column',

            alignItems: 'center',

            justifyContent: 'center',

            textAlign: 'center',

            overflow: 'hidden',

            color: '#FFFFFF',

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
                '1px solid rgba(99,102,241,0.22)',
            },

            borderBottom: {
              xs:
                '1px solid rgba(99,102,241,0.22)',

              sm: 'none',
            },

            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >

          {/* Decorative circle */}

          <Box
            aria-hidden="true"

            sx={{
              position: 'absolute',

              width: '300px',

              height: '300px',

              top: '-165px',

              left: '-145px',

              borderRadius: '50%',

              backgroundColor:
                'rgba(255,255,255,0.11)',

              animation:
                `${floatingCircle} 8s ease-in-out infinite`,

              pointerEvents: 'none',

              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />


          <Box
            aria-hidden="true"

            sx={{
              position: 'absolute',

              width: '270px',

              height: '270px',

              right: '-135px',

              bottom: '-135px',

              borderRadius: '50%',

              backgroundColor:
                'rgba(255,255,255,0.085)',

              animation:
                `${floatingCircle} 10s ease-in-out infinite 1s`,

              pointerEvents: 'none',

              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          />


          {/* System name */}

          <Typography
            sx={{
              position: 'relative',

              zIndex: 2,

              color:
                'rgba(255,255,255,0.86)',

              fontSize: '12px',

              fontWeight: 800,

              letterSpacing: '0.6px',
            }}
          >
            Online Leave Approval System
          </Typography>


          {/* Main title */}

          <Typography
            component="h1"

            sx={{
              position: 'relative',

              zIndex: 2,

              marginTop: '12px',

              color: '#FFFFFF',

              fontSize: {
                xs: '24px',
                sm: '27px',
                md: '30px',
              },

              fontWeight: 900,

              lineHeight: 1.3,

              letterSpacing: '-0.4px',

              textShadow:
                '0 2px 10px rgba(15,23,42,0.16)',
            }}
          >
            กู้คืนรหัสผ่านอย่างปลอดภัย
          </Typography>


          {/* =========================
              MAIN RECOVERY ICON
          ========================== */}

          <Box
            sx={{
              position: 'relative',

              zIndex: 2,

              width: {
                xs: '118px',
                sm: '132px',
              },

              height: {
                xs: '118px',
                sm: '132px',
              },

              marginTop: {
                xs: '28px',
                sm: '34px',
              },

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              borderRadius: {
                xs: '28px',
                sm: '32px',
              },

              color: '#6366F1',

              backgroundColor:
                'rgba(255,255,255,0.95)',

              border:
                '1px solid rgba(255,255,255,0.82)',

              boxShadow:
                '0 22px 44px rgba(15,23,42,0.20)',

              backdropFilter:
                'blur(10px)',

              transition:
                'transform 200ms ease, box-shadow 200ms ease',

              '&:hover': {
                transform:
                  'translateY(-3px)',

                boxShadow:
                  '0 26px 50px rgba(15,23,42,0.24)',
              },
            }}
          >
            <MailOutlineRounded
              sx={{
                fontSize: {
                  xs: '52px',
                  sm: '60px',
                },
              }}
            />


            {/* Security badge */}

            <Box
              sx={{
                position: 'absolute',

                right: '-11px',

                bottom: '-9px',

                width: '44px',

                height: '44px',

                display: 'flex',

                alignItems: 'center',

                justifyContent: 'center',

                borderRadius: '14px',

                color: '#FFFFFF',

                background:
                  'linear-gradient(135deg, #10B981, #059669)',

                border:
                  '3px solid rgba(255,255,255,0.95)',

                boxShadow:
                  '0 10px 22px rgba(5,150,105,0.25)',
              }}
            >
              <SecurityRounded
                sx={{
                  fontSize: '22px',
                }}
              />
            </Box>
          </Box>


          {/* Recovery label */}

          <Box
            sx={{
              position: 'relative',

              zIndex: 2,

              marginTop: '25px',

              display: 'flex',

              alignItems: 'center',

              gap: '8px',

              padding: '8px 13px',

              borderRadius: '999px',

              backgroundColor:
                'rgba(255,255,255,0.13)',

              border:
                '1px solid rgba(255,255,255,0.18)',

              backdropFilter:
                'blur(8px)',
            }}
          >
            <LockResetRounded
              sx={{
                fontSize: '17px',
              }}
            />

            <Typography
              sx={{
                color:
                  'rgba(255,255,255,0.92)',

                fontSize: '11px',

                fontWeight: 700,
              }}
            >
              Password Recovery
            </Typography>
          </Box>


          {/* Role colors */}

          <Box
            aria-hidden="true"

            sx={{
              position: 'relative',

              zIndex: 2,

              display: 'flex',

              alignItems: 'center',

              gap: '8px',

              marginTop: '26px',

              padding: '7px 11px',

              borderRadius: '999px',

              backgroundColor:
                'rgba(255,255,255,0.13)',

              border:
                '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius: '50%',

                backgroundColor: '#93C5FD',
              }}
            />

            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius: '50%',

                backgroundColor: '#C4B5FD',
              }}
            />

            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius: '50%',

                backgroundColor: '#6EE7B7',
              }}
            />

            <Box
              sx={{
                width: '8px',

                height: '8px',

                borderRadius: '50%',

                backgroundColor: '#FDBA74',
              }}
            />
          </Box>
        </Box>


        {/* =========================
            RIGHT PANEL
        ========================== */}

        <Box
          sx={{
            minHeight: {
              xs: 'auto',
              sm: '560px',
            },

            padding: {
              xs: '30px 24px 34px',
              sm: '40px 36px',
              md: '46px 52px',
            },

            display: 'flex',

            flexDirection: 'column',

            justifyContent: 'center',

            minWidth: 0,

            backgroundColor: '#FFFFFF',


            /* =========================
               TEXT FIELD
            ========================== */

            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',

              backgroundColor: '#F8FAFC',

              overflow: 'hidden',

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
                  '0 0 0 4px rgba(99,102,241,0.10), 0 8px 20px rgba(99,102,241,0.08)',
              },

              '&.Mui-focused fieldset': {
                borderColor: '#6366F1',

                borderWidth: '1.5px',
              },
            },


            /* Chrome autofill */

            '& input:-webkit-autofill': {
              WebkitTextFillColor:
                '#0F172A',

              WebkitBoxShadow:
                '0 0 0 1000px #F8FAFC inset',

              boxShadow:
                '0 0 0 1000px #F8FAFC inset',

              transition:
                'background-color 9999s ease-out 0s',

              caretColor:
                '#0F172A',
            },

            '& input:-webkit-autofill:hover': {
              WebkitBoxShadow:
                '0 0 0 1000px #F8FAFC inset',

              boxShadow:
                '0 0 0 1000px #F8FAFC inset',
            },

            '& input:-webkit-autofill:focus': {
              WebkitBoxShadow:
                '0 0 0 1000px #FFFFFF inset',

              boxShadow:
                '0 0 0 1000px #FFFFFF inset',
            },

            '& .MuiInputAdornment-root': {
              backgroundColor:
                'transparent',
            },


            /* =========================
               PRIMARY BUTTONS
            ========================== */

            '& .MuiButton-contained': {
              borderRadius: '11px',

              background:
                'linear-gradient(100deg, #3B82F6 0%, #6366F1 48%, #8B5CF6 100%)',

              color: '#FFFFFF',

              fontWeight: 800,

              textTransform: 'none',

              boxShadow:
                '0 10px 24px rgba(99,102,241,0.24)',

              transition:
                'transform 180ms ease, box-shadow 180ms ease',

              '&:hover': {
                background:
                  'linear-gradient(100deg, #2563EB 0%, #4F46E5 48%, #7C3AED 100%)',

                boxShadow:
                  '0 13px 28px rgba(99,102,241,0.30)',

                transform:
                  'translateY(-1px)',
              },

              '&:active': {
                transform:
                  'translateY(0)',
              },

              '&.Mui-disabled': {
                color:
                  'rgba(255,255,255,0.88)',

                background: '#A5B4FC',

                boxShadow: 'none',
              },
            },
          }}
        >

          {/* Title */}

          <Typography
            component="h2"

            sx={{
              color: '#0F172A',

              fontSize: {
                xs: '24px',
                sm: '27px',
              },

              fontWeight: 900,

              lineHeight: 1.3,

              letterSpacing:
                '-0.3px',
            }}
          >
            {title}
          </Typography>


          {/* Description */}

          <Typography
            sx={{
              maxWidth: '440px',

              marginTop: '7px',

              marginBottom: '26px',

              color: '#64748B',

              fontSize: '13px',

              lineHeight: 1.7,
            }}
          >
            {description}
          </Typography>


          {children}
        </Box>
      </Paper>
    </Box>
  )
}


export default PasswordRecoveryLayout