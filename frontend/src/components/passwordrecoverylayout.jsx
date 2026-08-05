import { Box, Paper, Typography } from '@mui/material';

function PasswordRecoveryLayout({ title, description, children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 5 }, backgroundColor: '#F5F7FB' }}>
      <Box sx={{ width: '100%', maxWidth: '1050px', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(380px, 0.8fr)' }, overflow: 'hidden', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '18px', boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
        <Box sx={{ p: { xs: '34px 28px', md: '56px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#2563EB', color: '#FFFFFF' }}>
          <Typography sx={{ fontSize: '13px', fontWeight: 800, letterSpacing: '1.3px', textTransform: 'uppercase', opacity: 0.85 }}>
            Online Leave Approval System
          </Typography>
          <Typography component="h1" sx={{ maxWidth: '520px', fontSize: { xs: '32px', md: '42px' }, fontWeight: 900, lineHeight: 1.15, mt: '18px' }}>
            Secure password recovery.
          </Typography>
          <Typography sx={{ maxWidth: '520px', fontSize: '15px', lineHeight: 1.8, mt: '20px', opacity: 0.88 }}>
            Verification codes are sent only to the email address registered with your employee account.
          </Typography>
        </Box>
        <Paper elevation={0} sx={{ p: { xs: '34px 28px', md: '52px 44px' }, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 0 }}>
          <Typography component="h2" sx={{ color: '#111827', fontSize: '28px', fontWeight: 900 }}>
            {title}
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.7, mt: '7px', mb: '28px' }}>
            {description}
          </Typography>
          {children}
        </Paper>
      </Box>
    </Box>
  );
}

export default PasswordRecoveryLayout;
