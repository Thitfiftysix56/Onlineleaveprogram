import {
  Box,
  Paper,
  Typography,
} from '@mui/material';

import {
  CheckCircleRounded,
  LockResetRounded,
  MailOutlineRounded,
  SecurityRounded,
} from '@mui/icons-material';

function PasswordRecoveryLayout({
  title,
  description,
  children,
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: {
          xs: '24px 16px',
          sm: '32px 24px',
          lg: '40px',
        },
        background:
          'linear-gradient(180deg, #EAF5FF 0%, #F4F7FC 48%, #FFF1F4 100%)',

        '&::before': {
          content: '""',
          position: 'fixed',
          width: '430px',
          height: '430px',
          top: '-190px',
          left: '-140px',
          borderRadius: '50%',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          pointerEvents: 'none',
        },

        '&::after': {
          content: '""',
          position: 'fixed',
          width: '470px',
          height: '470px',
          right: '-180px',
          bottom: '-220px',
          borderRadius: '50%',
          backgroundColor: 'rgba(244, 114, 182, 0.08)',
          pointerEvents: 'none',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '1040px',
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(0, 1.05fr) minmax(390px, 0.95fr)',
          },
          overflow: 'hidden',
          borderRadius: {
            xs: '22px',
            md: '26px',
          },
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(148, 163, 184, 0.22)',
          boxShadow: '0 28px 70px rgba(51, 65, 85, 0.16)',
        }}
      >
        {/* Left panel */}
        <Box
          sx={{
            minHeight: {
              xs: '300px',
              md: '570px',
            },
            padding: {
              xs: '30px 26px',
              sm: '38px',
              md: '48px',
            },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            color: '#FFFFFF',
            background:
              'linear-gradient(145deg, #1D4ED8 0%, #2563EB 52%, #4F8EF7 100%)',

            '&::before': {
              content: '""',
              position: 'absolute',
              width: '330px',
              height: '330px',
              top: '-150px',
              right: '-130px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },

            '&::after': {
              content: '""',
              position: 'absolute',
              width: '290px',
              height: '290px',
              left: '-120px',
              bottom: '-150px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '1.3px',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.84)',
              }}
            >
              Online Leave Approval System
            </Typography>

            <Typography
              component="h1"
              sx={{
                marginTop: '20px',
                fontSize: {
                  xs: '28px',
                  sm: '30px',
                  md: '32px',
                },
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
                whiteSpace: {
                  xs: 'normal',
                  sm: 'nowrap',
                },
              }}
            >
              กู้คืนรหัสผ่านอย่างปลอดภัย
            </Typography>
          </Box>

          {/* Illustration */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '410px',
              minHeight: '190px',
              margin: {
                xs: '32px auto 0',
                md: '36px auto',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.20)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box
              sx={{
                width: '185px',
                height: '118px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                borderRadius: '20px',
                color: '#2563EB',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 20px 38px rgba(15, 23, 42, 0.18)',
                transform: 'rotate(-2deg)',
              }}
            >
              <MailOutlineRounded
                sx={{
                  fontSize: '66px',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  right: '15px',
                  bottom: '12px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '13px',
                  color: '#FFFFFF',
                  background:
                    'linear-gradient(135deg, #10B981, #34D399)',
                  boxShadow: '0 9px 20px rgba(16, 185, 129, 0.30)',
                }}
              >
                <SecurityRounded
                  sx={{
                    fontSize: '24px',
                  }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                left: {
                  xs: '25px',
                  sm: '46px',
                },
                top: '30px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '15px',
                color: '#2563EB',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 12px 24px rgba(15, 23, 42, 0.16)',
                transform: 'rotate(-8deg)',
              }}
            >
              <LockResetRounded
                sx={{
                  fontSize: '27px',
                }}
              />
            </Box>

            <Box
              sx={{
                position: 'absolute',
                right: {
                  xs: '24px',
                  sm: '44px',
                },
                bottom: '28px',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '15px',
                color: '#FFFFFF',
                background:
                  'linear-gradient(135deg, #10B981, #34D399)',
                boxShadow: '0 12px 24px rgba(15, 23, 42, 0.14)',
                transform: 'rotate(7deg)',
              }}
            >
              <CheckCircleRounded
                sx={{
                  fontSize: '28px',
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '11px',
              borderRadius: '13px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }}
          >
            <SecurityRounded
              sx={{
                flexShrink: 0,
                marginTop: '1px',
                fontSize: '21px',
              }}
            />

            <Typography
              sx={{
                fontSize: '12px',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.90)',
              }}
            >
              รหัสยืนยันมีอายุการใช้งานจำกัดและใช้ได้เพียงครั้งเดียว
            </Typography>
          </Box>
        </Box>

        {/* Right panel */}
        <Box
          sx={{
            minHeight: {
              xs: 'auto',
              md: '570px',
            },
            padding: {
              xs: '30px 24px 34px',
              sm: '38px',
              md: '46px 44px',
            },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Typography
            component="h2"
            sx={{
              color: '#111827',
              fontSize: {
                xs: '26px',
                md: '30px',
              },
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              maxWidth: '440px',
              marginTop: '9px',
              marginBottom: '28px',
              color: '#6B7280',
              fontSize: '14px',
              lineHeight: 1.7,
            }}
          >
            {description}
          </Typography>

          {children}
        </Box>
      </Paper>
    </Box>
  );
}

export default PasswordRecoveryLayout;