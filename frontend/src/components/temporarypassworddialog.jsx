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
  title = 'Temporary Password Generated',
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
        temporaryPassword,
      );
      setCopied(true);
      setCopyError('');
    } catch {
      setCopied(false);
      setCopyError(
        'Unable to copy automatically. Please select and copy the password manually.',
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

      <DialogContent dividers>
        <Alert
          severity="warning"
          sx={{ marginBottom: '20px' }}
        >
          This password is shown only once. Copy it now and send it to the user through a secure channel.
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
          Username
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
          label="Temporary Password"
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
              color: '#7C3AED',
              borderColor: '#7C3AED',
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Copy Password
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
              Copied
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
          The user must change this temporary password immediately after signing in. Closing this dialog permanently clears it from this page.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button
          type="button"
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: '#EA580C',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': {
              backgroundColor: '#C2410C',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TemporaryPasswordDialog;
