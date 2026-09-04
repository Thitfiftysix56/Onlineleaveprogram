import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getDashboardPathByRole } from '../utils/authstorage.js';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '20px', backgroundColor: '#F6F8FC' }}>
      <Paper sx={{ width: '100%', maxWidth: 480, padding: { xs: '28px 22px', sm: '38px' }, textAlign: 'center', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
        <Typography sx={{ color: '#2563EB', fontSize: '13px', fontWeight: 800 }}>404</Typography>
        <Typography component="h1" sx={{ color: '#0F172A', fontSize: '24px', fontWeight: 700, marginTop: '6px' }}>ไม่พบหน้าที่ต้องการ</Typography>
        <Typography sx={{ color: '#64748B', fontSize: '14px', marginTop: '8px' }}>ลิงก์นี้อาจไม่ถูกต้องหรือหน้าดังกล่าวถูกย้ายแล้ว</Typography>
        <Button variant="contained" onClick={() => navigate(user ? getDashboardPathByRole(user.role) : '/login')} sx={{ marginTop: '22px', backgroundColor: '#2563EB' }}>กลับหน้าแดชบอร์ด</Button>
      </Paper>
    </Box>
  );
}
