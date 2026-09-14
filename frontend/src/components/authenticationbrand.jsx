import { Box, Typography } from '@mui/material';

const rolePastels = ['#60A5FA', '#A78BFA', '#34D399', '#F59E0B'];

function AuthenticationBrand({ compact = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: compact ? '18px' : '24px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? '7px' : '8px', marginBottom: compact ? '7px' : '10px' }} aria-hidden="true">
        {rolePastels.map((color) => (
          <Box key={color} sx={{ width: compact ? '8px' : '9px', height: compact ? '8px' : '9px', borderRadius: '50%', backgroundColor: color }} />
        ))}
      </Box>
      <Typography sx={{ color: '#0F172A', fontSize: compact ? { xs: '22px', sm: '24px' } : { xs: '25px', sm: '28px' }, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.4px' }}>
        Leave Approval
      </Typography>
      <Typography sx={{ color: '#64748B', fontSize: { xs: '10px', sm: '11px' }, fontWeight: 600, letterSpacing: '1.3px', marginTop: '5px' }}>
        ONLINE LEAVE SYSTEM
      </Typography>
    </Box>
  );
}

export default AuthenticationBrand;
