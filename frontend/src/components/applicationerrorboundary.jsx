import { Component } from 'react';

import {
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material';

class ApplicationErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application render error.', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box
        sx={{
          minHeight: '100vh',
          padding: '24px',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: '#F6F8FC',
        }}
      >
        <Paper
          elevation={0}
          role="alert"
          sx={{
            width: '100%',
            maxWidth: '520px',
            padding: { xs: '28px 22px', sm: '36px' },
            textAlign: 'center',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
          }}
        >
          <Typography component="h1" sx={{ color: '#111827', fontSize: '22px', fontWeight: 800 }}>
            ไม่สามารถแสดงหน้านี้ได้
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '14px', marginTop: '10px' }}>
            เกิดข้อผิดพลาดชั่วคราว กรุณาลองอีกครั้งหรือโหลดหน้าใหม่
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '24px' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => this.setState({ hasError: false })}
            >
              ลองอีกครั้ง
            </Button>
            <Button
              type="button"
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ backgroundColor: '#2563EB' }}
            >
              โหลดหน้าใหม่
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default ApplicationErrorBoundary;
