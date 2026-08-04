import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

function RejectModalPage() {
  const [rejectModalOpen, setRejectModalOpen] =
    useState(true);
  const [rejectionReason, setRejectionReason] =
    useState('');
  const [rejectionReasonError, setRejectionReasonError] =
    useState('');
  const [rejectSuccess, setRejectSuccess] =
    useState(false);

  const leaveRequest = {
    requestId: 'LR-2026-006',
    employeeId: 'EMP006',
    employeeName: 'Narin Chaiyasit',
    department: 'Information Technology',
    position: 'Developer',
    leaveType: 'Annual Leave',
    startDate: '25 Jul 2026',
    endDate: '27 Jul 2026',
    totalDays: '3 Days',
    status: 'Pending',
    reason:
      'I would like to take annual leave to travel with my family. All urgent work will be completed before the leave period.',
  };

  const handleOpenRejectModal = () => {
    setRejectModalOpen(true);
    setRejectSuccess(false);
    setRejectionReasonError('');
  };

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false);
    setRejectionReason('');
    setRejectionReasonError('');
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
    setRejectionReasonError('');
    setRejectSuccess(false);
  };

  const handleConfirmReject = () => {
    const trimmedReason = rejectionReason.trim();

    setRejectionReasonError('');
    setRejectSuccess(false);

    if (!trimmedReason) {
      setRejectionReasonError(
        'Please enter a reason for rejecting this leave request',
      );
      return;
    }

    if (trimmedReason.length < 10) {
      setRejectionReasonError(
        'The rejection reason must contain at least 10 characters',
      );
      return;
    }

    console.log({
      requestId: leaveRequest.requestId,
      decision: 'Rejected',
      rejectionReason: trimmedReason,
    });

    setRejectModalOpen(false);
    setRejectSuccess(true);
    setRejectionReason('');
  };

  return (
    <SupervisorLayout activeMenu="Approval">
      <Box
        sx={{
          marginBottom: '28px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
            justifyContent: 'space-between',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            gap: '16px',
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{
                color: '#111827',
                fontSize: {
                  xs: '26px',
                  sm: '30px',
                },
                fontWeight: 800,
              }}
            >
              Leave Request Detail
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '15px',
                marginTop: '6px',
              }}
            >
              Review request {leaveRequest.requestId} before
              making a decision.
            </Typography>
          </Box>

          <Chip
            label={leaveRequest.status}
            sx={{
              minWidth: '100px',
              height: '34px',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          />
        </Box>

        <Button
          type="button"
          sx={{
            minWidth: 0,
            marginTop: '14px',
            padding: 0,
            color: '#7C3AED',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'none',

            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline',
            },
          }}
        >
          ← Back to Pending Approval
        </Button>
      </Box>

      {rejectSuccess && (
        <Alert
          severity="success"
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          The rejection form is complete. The request status
          will be updated after connecting this page to the
          backend.
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2fr) minmax(300px, 1fr)',
          },
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '24px',
                },
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                Employee Information
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Employee information for this leave request.
              </Typography>
            </Box>

            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '28px',
                },
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                },
                gap: '24px',
              }}
            >
              {[
                {
                  label: 'Employee ID',
                  value: leaveRequest.employeeId,
                },
                {
                  label: 'Employee Name',
                  value: leaveRequest.employeeName,
                },
                {
                  label: 'Department',
                  value: leaveRequest.department,
                },
                {
                  label: 'Position',
                  value: leaveRequest.position,
                },
              ].map((item) => (
                <Box key={item.label}>
                  <Typography
                    sx={{
                      color: '#6B7280',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#111827',
                      fontSize: '15px',
                      fontWeight: 700,
                      marginTop: '6px',
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '24px',
                },
                borderBottom: '1px solid #E5E7EB',
              }}
            >
              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                Leave Information
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Details of the requested leave period.
              </Typography>
            </Box>

            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '28px',
                },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: '24px',
                }}
              >
                {[
                  {
                    label: 'Leave Type',
                    value: leaveRequest.leaveType,
                  },
                  {
                    label: 'Total Leave Days',
                    value: leaveRequest.totalDays,
                  },
                  {
                    label: 'Start Date',
                    value: leaveRequest.startDate,
                  },
                  {
                    label: 'End Date',
                    value: leaveRequest.endDate,
                  },
                ].map((item) => (
                  <Box key={item.label}>
                    <Typography
                      sx={{
                        color: '#6B7280',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#111827',
                        fontSize: '15px',
                        fontWeight: 700,
                        marginTop: '6px',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider
                sx={{
                  margin: '28px 0',
                }}
              />

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Reason for Leave
              </Typography>

              <Typography
                sx={{
                  color: '#374151',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  marginTop: '8px',
                }}
              >
                {leaveRequest.reason}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              padding: '22px 24px',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              Supervisor Decision
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                lineHeight: 1.6,
                marginTop: '4px',
              }}
            >
              Approve or reject this employee leave request.
            </Typography>
          </Box>

          <Box
            sx={{
              padding: '24px',
            }}
          >
            <Box
              sx={{
                padding: '16px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <Typography
                sx={{
                  color: '#92400E',
                  fontSize: '14px',
                  fontWeight: 800,
                }}
              >
                Pending decision
              </Typography>

              <Typography
                sx={{
                  color: '#78350F',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  marginTop: '6px',
                }}
              >
                This request is waiting for your review and
                decision.
              </Typography>
            </Box>

            <Button
              type="button"
              variant="contained"
              fullWidth
              sx={{
                height: '44px',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#15803D',
                  boxShadow: 'none',
                },
              }}
            >
              Approve Request
            </Button>

            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={handleOpenRejectModal}
              sx={{
                height: '44px',
                marginTop: '12px',
                color: '#DC2626',
                borderColor: '#FCA5A5',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  borderColor: '#DC2626',
                  backgroundColor: '#FEF2F2',
                },
              }}
            >
              Reject Request
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog
        open={rejectModalOpen}
        onClose={handleCloseRejectModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '14px',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            padding: {
              xs: '20px',
              sm: '24px',
            },
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Typography
            component="div"
            sx={{
              color: '#111827',
              fontSize: '20px',
              fontWeight: 800,
            }}
          >
            Reject Leave Request
          </Typography>

          <Typography
            component="div"
            sx={{
              color: '#6B7280',
              fontSize: '14px',
              lineHeight: 1.6,
              marginTop: '6px',
            }}
          >
            Enter the reason for rejecting request{' '}
            {leaveRequest.requestId}.
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: {
              xs: '20px',
              sm: '24px',
            },
          }}
        >
          <Box
            sx={{
              padding: '16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              marginBottom: '22px',
            }}
          >
            <Typography
              sx={{
                color: '#991B1B',
                fontSize: '14px',
                fontWeight: 800,
              }}
            >
              Confirm rejection
            </Typography>

            <Typography
              sx={{
                color: '#991B1B',
                fontSize: '13px',
                lineHeight: 1.6,
                marginTop: '6px',
              }}
            >
              The employee will receive a notification containing
              the rejection reason.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
              },
              gap: '16px',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              marginBottom: '22px',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Employee
              </Typography>

              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              >
                {leaveRequest.employeeName}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Leave Type
              </Typography>

              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              >
                {leaveRequest.leaveType}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            required
            multiline
            minRows={5}
            label="Rejection Reason"
            placeholder="Explain why this leave request is being rejected"
            value={rejectionReason}
            onChange={handleRejectionReasonChange}
            error={Boolean(rejectionReasonError)}
            helperText={
              rejectionReasonError ||
              `${rejectionReason.length}/500 characters`
            }
            slotProps={{
              htmlInput: {
                maxLength: 500,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },

              '& .MuiFormHelperText-root': {
                textAlign: rejectionReasonError
                  ? 'left'
                  : 'right',
              },
            }}
          />
        </DialogContent>

        <DialogActions
          sx={{
            padding: {
              xs: '16px 20px 20px',
              sm: '16px 24px 24px',
            },
            borderTop: '1px solid #E5E7EB',
            gap: '10px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={handleCloseRejectModal}
            sx={{
              minWidth: '100px',
              height: '42px',
              padding: '0 18px',
              color: '#374151',
              borderColor: '#D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'none',

              '&:hover': {
                borderColor: '#9CA3AF',
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={handleConfirmReject}
            sx={{
              minWidth: '140px',
              height: '42px',
              padding: '0 18px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',

              '&:hover': {
                backgroundColor: '#B91C1C',
                boxShadow: 'none',
              },
            }}
          >
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </SupervisorLayout>
  );
}

export default RejectModalPage;