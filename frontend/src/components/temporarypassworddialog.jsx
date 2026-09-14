import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

function TemporaryPasswordDialog({
  open,
  username,
  temporaryPassword,
  onClose,
  title = 'สร้างรหัสผ่านชั่วคราวเรียบร้อยแล้ว',
}) {
  const [copied, setCopied] =
    useState(false);
  const [copyError, setCopyError] =
    useState('');

  useEffect(() => {
    if (open) {
      setCopied(false);
      setCopyError('');
    }
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `ชื่อผู้ใช้: ${username}\nรหัสผ่านชั่วคราว: ${temporaryPassword}`,
      );
      setCopied(true);
      setCopyError('');
    } catch {
      setCopied(false);
      setCopyError(
        'ไม่สามารถคัดลอกอัตโนมัติได้ กรุณาเลือกและคัดลอกข้อมูลด้วยตนเอง',
      );
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
    >
      <DialogTitle
        sx={{
          color: '#111827',
          fontWeight: 800,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <Alert
          severity="warning"
          sx={{ marginBottom: '20px' }}
        >
          รหัสผ่านชั่วคราวจะแสดงเพียงครั้งเดียว กรุณาคัดลอกและส่งให้พนักงานผ่านช่องทางที่ปลอดภัยก่อนปิดหน้าต่างนี้
        </Alert>

        {copyError && (
          <Alert
            severity="error"
            sx={{ marginBottom: '20px' }}
          >
            {copyError}
          </Alert>
        )}

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          ชื่อผู้ใช้
        </Typography>
        <Typography
          sx={{
            color: '#111827',
            fontSize: '15px',
            fontWeight: 800,
            marginTop: '5px',
            marginBottom: '20px',
          }}
        >
          {username}
        </Typography>

        <TextField
          fullWidth
          label="รหัสผ่านชั่วคราว"
          value={temporaryPassword}
          slotProps={{
            htmlInput: {
              readOnly: true,
              style: {
                fontFamily:
                  'Consolas, Monaco, monospace',
                fontSize: '16px',
                fontWeight: 700,
              },
            },
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '14px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={handleCopy}
            disabled={!temporaryPassword}
            sx={{
              color: '#2563EB',
              borderColor: '#93C5FD',
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            คัดลอกข้อมูลเข้าสู่ระบบ
          </Button>

          {copied && (
            <Typography
              role="status"
              sx={{
                color: '#15803D',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              คัดลอกแล้ว
            </Typography>
          )}
        </Box>

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '13px',
            lineHeight: 1.7,
            marginTop: '20px',
          }}
        >
          พนักงานต้องเปลี่ยนรหัสผ่านชั่วคราวทันทีเมื่อเข้าสู่ระบบครั้งแรก เมื่อปิดหน้าต่างนี้ ระบบจะไม่แสดงรหัสผ่านดังกล่าวอีก
        </Typography>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          sx={{
            color: '#475569',
            borderColor: '#CBD5E1',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: '#F8FAFC',
              borderColor: '#94A3B8',
            },
          }}
        >
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TemporaryPasswordDialog;
