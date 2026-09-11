import { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';

export default function ServerUnavailableOverlay() {
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const show = () => setUnavailable(true);
    const hide = () => setUnavailable(false);
    window.addEventListener('api-server-unavailable', show);
    window.addEventListener('api-connection-restored', hide);
    return () => {
      window.removeEventListener('api-server-unavailable', show);
      window.removeEventListener('api-connection-restored', hide);
    };
  }, []);

  if (!unavailable) return null;

  return (
    <Box role="alert" sx={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center', padding: '20px', backgroundColor: 'rgba(246,248,252,0.96)' }}>
      <Paper sx={{ width: '100%', maxWidth: 480, padding: { xs: '28px 22px', sm: '36px' }, textAlign: 'center', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
        <Typography component="h1" sx={{ color: '#0F172A', fontSize: '22px', fontWeight: 800 }}>ไม่สามารถเชื่อมต่อระบบได้</Typography>
        <Typography sx={{ color: '#64748B', fontSize: '14px', lineHeight: 1.7, marginTop: '10px' }}>ขณะนี้ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อหรือลองใหม่อีกครั้ง</Typography>
        <Button type="button" variant="contained" onClick={() => window.location.reload()} sx={{ marginTop: '22px', backgroundColor: '#2563EB' }}>ลองใหม่</Button>
      </Paper>
    </Box>
  );
}
