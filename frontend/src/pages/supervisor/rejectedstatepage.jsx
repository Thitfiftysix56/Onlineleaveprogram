import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

function RejectedStatePage() {
  const leaveRequest = {
    requestId: 'LR-2026-003',
    status: 'Rejected',

    submittedDate: '04 Jul 2026',
    submittedTime: '09:15 AM',
    rejectedDate: '06 Jul 2026',
    rejectedTime: '02:30 PM',

    employeeId: 'EMP003',
    employeeName: 'Krit Sombatdee',
    department: 'Finance',
    position: 'Accountant',
    email: 'krit@organization.co.th',

    leaveType: 'Personal Leave',
    startDate: '08 Jul 2026',
    endDate: '08 Jul 2026',
    totalDays: '1 Day',

    reason:
      'I would like to take personal leave to complete an important personal appointment.',

    attachment: 'appointment-document.pdf',

    supervisorName: 'Supervisor User',

    rejectionReason:
      'The requested leave date overlaps with an important department deadline. Please select another available date and submit a new request.',

    personalEntitlement: 5,
    personalUsed: 1,
    rejectedRequestDays: 1,
    personalRemaining: 4,
  };

  const approvalTimeline = [
    {
      title: 'Leave request submitted',
      description:
        'Krit Sombatdee submitted this leave request on 04 Jul 2026 at 09:15 AM.',
      type: 'completed',
    },
    {
      title: 'Rejected by supervisor',
      description:
        'Supervisor rejected this leave request on 06 Jul 2026.',
      type: 'rejected',
    },
    {
      title: 'Employee notified',
      description:
        'The employee was notified that this leave request was rejected.',
      type: 'completed',
    },
  ];

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
              Request {leaveRequest.requestId} has been rejected.
            </Typography>
          </Box>

          <Chip
            label={leaveRequest.status}
            sx={{
              minWidth: '110px',
              height: '34px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 700,
            }}
          />
        </Box>

<Button
  type="button"
  variant="outlined"
  sx={{
    minWidth: '100px',
    height: '42px',
    marginTop: '16px',
    padding: '0 18px',
    backgroundColor: '#FFFFFF',
    color: '#2563EB',
    borderColor: '#2563EB',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'none',

    '&:hover': {
      backgroundColor: '#EFF6FF',
      borderColor: '#1D4ED8',
    },
  }}
>
  ← Back
</Button>
      </Box>

      <Alert
        severity="error"
        sx={{
          marginBottom: '24px',
          borderRadius: '8px',
        }}
      >
        This leave request was rejected by{' '}
        {leaveRequest.supervisorName} on{' '}
        {leaveRequest.rejectedDate} at{' '}
        {leaveRequest.rejectedTime}.
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 2fr) minmax(320px, 1fr)',
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
                Information about the employee who submitted
                this request.
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
                {
                  label: 'Email Address',
                  value: leaveRequest.email,
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
                      fontWeight: 600,
                      marginTop: '6px',
                      wordBreak: 'break-word',
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
                Details of the rejected leave request.
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
                    label: 'Submitted Date',
                    value: `${leaveRequest.submittedDate} at ${leaveRequest.submittedTime}`,
                  },
                  {
                    label: 'Start Date',
                    value: leaveRequest.startDate,
                  },
                  {
                    label: 'End Date',
                    value: leaveRequest.endDate,
                  },
                  {
                    label: 'Total Leave Days',
                    value: leaveRequest.totalDays,
                  },
                  {
                    label: 'Rejected Date',
                    value: `${leaveRequest.rejectedDate} at ${leaveRequest.rejectedTime}`,
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
                        fontWeight: 600,
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
                Attachment
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Supporting document included with this request.
              </Typography>
            </Box>

            <Box
              sx={{
                padding: {
                  xs: '20px',
                  sm: '24px',
                },
              }}
            >
              <Box
                sx={{
                  padding: '18px',
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
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
                    sx={{
                      color: '#111827',
                      fontSize: '14px',
                      fontWeight: 700,
                      wordBreak: 'break-word',
                    }}
                  >
                    {leaveRequest.attachment}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#6B7280',
                      fontSize: '13px',
                      marginTop: '4px',
                    }}
                  >
                    PDF document
                  </Typography>
                </Box>

                <Button
                  type="button"
                  variant="outlined"
                  sx={{
                    height: '40px',
                    padding: '0 16px',
                    color: '#7C3AED',
                    borderColor: '#7C3AED',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'none',

                    '&:hover': {
                      borderColor: '#6D28D9',
                      backgroundColor: '#F5F3FF',
                    },
                  }}
                >
                  View File
                </Button>
              </Box>
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
                Supervisor Decision
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Rejection information recorded for this request.
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
                <Box>
                  <Typography
                    sx={{
                      color: '#6B7280',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Rejected By
                  </Typography>

                  <Typography
                    sx={{
                      color: '#111827',
                      fontSize: '15px',
                      fontWeight: 700,
                      marginTop: '6px',
                    }}
                  >
                    {leaveRequest.supervisorName}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: '#6B7280',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Decision
                  </Typography>

                  <Box
                    sx={{
                      marginTop: '6px',
                    }}
                  >
                    <Chip
                      label="Rejected"
                      size="small"
                      sx={{
                        minWidth: '90px',
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Box>
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
                Rejection Reason
              </Typography>

              <Box
                sx={{
                  padding: '16px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  marginTop: '8px',
                }}
              >
                <Typography
                  sx={{
                    color: '#991B1B',
                    fontSize: '14px',
                    lineHeight: 1.7,
                  }}
                >
                  {leaveRequest.rejectionReason}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

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
                Leave Balance
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Personal Leave balance after rejection.
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '24px',
              }}
            >
              {[
                {
                  label: 'Personal Leave Entitlement',
                  value: `${leaveRequest.personalEntitlement} Days`,
                },
                {
                  label: 'Previously Used',
                  value: `${leaveRequest.personalUsed} Day`,
                },
                {
                  label: 'Rejected Request',
                  value: `${leaveRequest.rejectedRequestDays} Day`,
                },
                {
                  label: 'Remaining Balance',
                  value: `${leaveRequest.personalRemaining} Days`,
                },
              ].map((item, index) => (
                <Box key={item.label}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      padding: '13px 0',
                    }}
                  >
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
                        color:
                          item.label === 'Remaining Balance'
                            ? '#7C3AED'
                            : '#111827',
                        fontSize: '14px',
                        fontWeight: 800,
                        textAlign: 'right',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>

                  {index < 3 && <Divider />}
                </Box>
              ))}

              <Box
                sx={{
                  padding: '14px',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  borderRadius: '8px',
                  marginTop: '16px',
                }}
              >
                <Typography
                  sx={{
                    color: '#6D28D9',
                    fontSize: '13px',
                    lineHeight: 1.6,
                  }}
                >
                  Rejected leave requests do not reduce the
                  employee leave balance.
                </Typography>
              </Box>
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
                Approval Timeline
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Completed rejection process.
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '24px',
              }}
            >
              {approvalTimeline.map((item, index) => {
                const isRejected = item.type === 'rejected';

                return (
                  <Box
                    key={item.title}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '28px minmax(0, 1fr)',
                      columnGap: '14px',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: isRejected
                            ? '#DC2626'
                            : '#7C3AED',
                          border: isRejected
                            ? '2px solid #DC2626'
                            : '2px solid #7C3AED',
                          color: '#FFFFFF',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {isRejected ? '×' : '✓'}
                      </Box>

                      {index <
                        approvalTimeline.length - 1 && (
                        <Box
                          sx={{
                            width: '2px',
                            minHeight: '82px',
                            backgroundColor: isRejected
                              ? '#FCA5A5'
                              : '#C4B5FD',
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        paddingBottom:
                          index <
                          approvalTimeline.length - 1
                            ? '28px'
                            : 0,
                      }}
                    >
                      <Typography
                        sx={{
                          color: isRejected
                            ? '#DC2626'
                            : '#111827',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#6B7280',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          marginTop: '6px',
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '24px',
        }}
      >
        <Button
          type="button"
          variant="outlined"
          sx={{
            minWidth: '180px',
            height: '44px',
            padding: '0 20px',
            color: '#7C3AED',
            borderColor: '#7C3AED',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'none',

            '&:hover': {
              borderColor: '#6D28D9',
              backgroundColor: '#F5F3FF',
            },
          }}
        >
          Return to Approval List
        </Button>
      </Box>
    </SupervisorLayout>
  );
}

export default RejectedStatePage;