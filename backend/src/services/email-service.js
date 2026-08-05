import nodemailer from 'nodemailer'

import { config } from '../config/environment.js'

let transport = null

function getTransport() {
  if (!transport) {
    if (!config.smtp.host) {
      throw new Error('SMTP_HOST is required to send password reset email')
    }

    transport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.password }
        : undefined,
    })
  }

  return transport
}

export async function sendPasswordResetOtp({ to, fullName, otp }) {
  await getTransport().sendMail({
    from: config.smtp.from,
    to,
    subject: 'Online Leave Approval System – Password Reset Verification Code',
    text: [
      `Hello ${fullName || 'user'},`,
      '',
      'A password reset was requested for your Online Leave Approval System account.',
      `Your verification code is: ${otp}`,
      '',
      'This code expires in 5 minutes. Do not share it with anyone.',
      'If you did not request this reset, you can ignore this email.',
    ].join('\n'),
  })
}

export function setEmailTransportForTests(nextTransport) {
  transport = nextTransport
}
