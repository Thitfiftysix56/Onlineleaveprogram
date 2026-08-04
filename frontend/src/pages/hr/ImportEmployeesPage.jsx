import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Typography,
} from '@mui/material';

function ImportEmployeesPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setSelectedFile(file || null);
    setMessage('');
    setError('');
  };

  const handlePreview = () => {
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์ CSV ก่อน');
      setMessage('');
      return;
    }

    setError('');
    setMessage(`เลือกไฟล์ ${selectedFile.name} เรียบร้อยแล้ว`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5F7FB',
        padding: '32px',
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: '720px',
          margin: '0 auto',
          padding: '32px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: 'none',
          boxSizing: 'border-box',
        }}
      >
        <Typography
          component="h1"
          sx={{
            color: '#111827',
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '8px',
          }}
        >
          Import Employees
        </Typography>

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '16px',
            fontWeight: 400,
            marginBottom: '24px',
          }}
        >
          นำเข้าข้อมูลพนักงานจากไฟล์ CSV และสร้างบัญชีผู้ใช้งานอัตโนมัติ
        </Typography>

        {message && (
          <Alert
            severity="success"
            sx={{
              marginBottom: '20px',
            }}
          >
            {message}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{
              marginBottom: '20px',
            }}
          >
            {error}
          </Alert>
        )}

        <Button
          component="label"
          variant="outlined"
          fullWidth
          sx={{
            height: '52px',
            color: '#2563EB',
            borderColor: '#2563EB',
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            marginBottom: '16px',

            '&:hover': {
              borderColor: '#1D4ED8',
              backgroundColor: '#EFF6FF',
            },
          }}
        >
          Choose CSV File

          <input
            type="file"
            accept=".csv"
            hidden
            onChange={handleFileChange}
          />
        </Button>

        <Typography
          sx={{
            minHeight: '24px',
            color: selectedFile ? '#374151' : '#9CA3AF',
            fontSize: '14px',
            fontWeight: 400,
            marginBottom: '24px',
          }}
        >
          {selectedFile
            ? `Selected file: ${selectedFile.name}`
            : 'No file selected'}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={handlePreview}
          sx={{
            height: '52px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '8px',
            boxShadow: 'none',

            '&:hover': {
              backgroundColor: '#1D4ED8',
              boxShadow: 'none',
            },
          }}
        >
          Preview Employees
        </Button>
      </Paper>
    </Box>
  );
}

export default ImportEmployeesPage;