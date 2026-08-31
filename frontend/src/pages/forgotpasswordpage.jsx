import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import PasswordRecoveryLayout from '../components/passwordrecoverylayout.jsx'
import { normalizePasswordResetIdentifier } from '../auth/passwordresetcontext.js'
import usePasswordResetFlow from '../auth/usepasswordresetflow.js'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const flow = usePasswordResetFlow()

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedEmail = normalizePasswordResetIdentifier(email)

    if (!normalizedEmail) {
      setMessage({
        severity: 'error',
        text: 'กรุณากรอก Email',
      })
      return
    }

    if (!emailPattern.test(normalizedEmail)) {
      setMessage({
        severity: 'error',
        text: 'รูปแบบ Email ไม่ถูกต้อง',
      })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await api.post(
        '/auth/forgot-password/request-otp',
        {
          identifier: normalizedEmail,
        },
      )

      const retryAfterSeconds = Number(
        response.data?.retryAfterSeconds || 60,
      )

      flow.begin(
        normalizedEmail,
        retryAfterSeconds,
      )

      navigate('/forgot-password/verify')
    } catch (error) {
      const responseMessage =
        error.response?.data?.message

      setMessage({
        severity: 'error',
        text:
          responseMessage ||
          'ไม่สามารถส่งรหัสยืนยันได้ กรุณาลองใหม่อีกครั้ง',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PasswordRecoveryLayout title="Forgot Password">
      {message && (
        <Alert
          severity={message.severity}
          sx={{
            marginBottom: '18px',
            borderRadius: '10px',
            fontSize: '13px',
          }}
        >
          {message.text}
        </Alert>
      )}

      <Box
        component="form"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <TextField
          fullWidth
          required
          autoFocus
          id="recovery-contact"
          name="recoveryContact"
          type="text"
          inputMode="email"
          autoComplete="new-password"
          label="Email"
          placeholder="กรอก Email"
          value={email}
          disabled={isSubmitting}
          helperText="ระบบจะส่ง OTP เฉพาะ Email ที่ลงทะเบียนไว้กับบัญชีเท่านั้น"
          onChange={(event) => {
            setEmail(event.target.value)

            if (message) {
              setMessage(null)
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineRounded
                    sx={{
                      color: '#64748B',
                      fontSize: '20px',
                    }}
                  />
                </InputAdornment>
              ),
            },
            htmlInput: {
              maxLength: 120,
              autoComplete: 'new-password',
            },
            formHelperText: {
              sx: {
                marginTop: '7px',
                marginLeft: '2px',
                color: '#64748B',
                fontSize: '12px',
                lineHeight: 1.6,
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              minHeight: '50px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
            },
          }}
        />

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? null : (
              <SendRounded
                sx={{
                  fontSize: '19px',
                }}
              />
            )
          }
          sx={{
            height: '50px',
            marginTop: '24px',
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: '14px',
            fontWeight: 800,
            background:
              'linear-gradient(90deg, #3B82F6 0%, #6366F1 52%, #8B5CF6 100%)',
            boxShadow:
              '0 12px 24px rgba(79, 70, 229, 0.20)',
            '&:hover': {
              background:
                'linear-gradient(90deg, #2563EB 0%, #4F46E5 52%, #7C3AED 100%)',
              boxShadow:
                '0 14px 28px rgba(79, 70, 229, 0.26)',
            },
            '&.Mui-disabled': {
              color: '#FFFFFF',
              background: '#A5B4FC',
            },
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress
                size={18}
                sx={{
                  marginRight: '9px',
                  color: '#FFFFFF',
                }}
              />
              กำลังส่งรหัส...
            </>
          ) : (
            'ส่งรหัสยืนยัน'
          )}
        </Button>

        <Typography
          component="button"
          type="button"
          onClick={() => navigate('/login')}
          sx={{
            width: '100%',
            marginTop: '18px',
            padding: 0,
            border: 0,
            background: 'transparent',
            color: '#6366F1',
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: 700,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          กลับไป Login
        </Typography>
      </Box>
    </PasswordRecoveryLayout>
  )
}

export default ForgotPasswordPage