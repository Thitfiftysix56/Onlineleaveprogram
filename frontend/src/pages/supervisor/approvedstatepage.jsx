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

function ApprovedStatePage() {
  const leaveRequest = {
    requestId: 'LR-2026-006',
    status: 'Approved',
    submittedDate: '20 Jul 2026',
    submittedTime: '09:30 AM',
    approvedDate: '22 Jul 2026',
    approvedTime: '10:45 AM',

    employeeId: 'EMP006',
    employeeName: 'Narin Chaiyasit',
    department: 'Information Technology',
    position: 'Developer',
    email: 'narin@organization.co.th',

    leaveType: 'Annual Leave',
    startDate: '25 Jul 2026',
    endDate: '27 Jul 2026',
    totalDays: '3 Days',
    reason:
      'I would like to take annual leave to travel with my family. All urgent work will be completed before the leave period.',
    attachment: 'travel-document.pdf',

    supervisorName: 'Supervisor User',
    supervisorComment:
      'Approved. Please complete the work handover before the leave period.',

    annualEntitlement: 10,
    annualUsedBeforeApproval: 2,
    approvedRequestDays: 3,
    annualRemainingAfterApproval: 5,
  };

  const approvalTimeline = [
    {
      title: 'Leave request submitted',
      description:
        'Narin Chaiyasit submitted this leave request on 20 Jul 2026 at 09:30 AM.',
    },
    {
      title: 'Approved by supervisor',
      description:
        'Supervisor User approved this leave request on 22 Jul 2026 at 10:45 AM.',
    },
    {
      title: 'Leave balance updated',
      description:
        'The employee Annual Leave balance was updated after approval.',
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
              Request {leaveRequest.requestId} has been approved.
            </Typography>
          </Box>

          <Chip
            label={leaveRequest.status}
            sx={{
              minWidth: '110px',
              height: '34px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
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
        severity="success"
        sx={{
          marginBottom: '24px',
          borderRadius: '8px',
        }}
      >
        This leave request was approved by{' '}
        {leaveRequest.supervisorName} on{' '}
        {leaveRequest.approvedDate} at{' '}
        {leaveRequest.approvedTime}.
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
                Details of the approved leave request.
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
                    label: 'Approved Date',
                    value: `${leaveRequest.approvedDate} at ${leaveRequest.approvedTime}`,
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

              <Box>
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
                Approval information recorded for this request.
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
                    Approved By
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
                      label="Approved"
                      size="small"
                      sx={{
                        minWidth: '90px',
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
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
                Supervisor Comment
              </Typography>

              <Box
                sx={{
                  padding: '16px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  marginTop: '8px',
                }}
              >
                <Typography
                  sx={{
                    color: '#166534',
                    fontSize: '14px',
                    lineHeight: 1.7,
                  }}
                >
                  {leaveRequest.supervisorComment}
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
                Annual Leave balance after approval.
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '24px',
              }}
            >
              {[
                {
                  label: 'Annual Entitlement',
                  value: `${leaveRequest.annualEntitlement} Days`,
                },
                {
                  label: 'Previously Used',
                  value: `${leaveRequest.annualUsedBeforeApproval} Days`,
                },
                {
                  label: 'Approved Request',
                  value: `${leaveRequest.approvedRequestDays} Days`,
                },
                {
                  label: 'Remaining Balance',
                  value: `${leaveRequest.annualRemainingAfterApproval} Days`,
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
                            ? '#15803D'
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
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  marginTop: '16px',
                }}
              >
                <Typography
                  sx={{
                    color: '#166534',
                    fontSize: '13px',
                    lineHeight: 1.6,
                  }}
                >
                  The approved leave days have been deducted
                  from the employee balance.
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
                Completed approval process.
              </Typography>
            </Box>

            <Box
              sx={{
                padding: '24px',
              }}
            >
              {approvalTimeline.map((item, index) => (
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
                        backgroundColor: '#16A34A',
                        border: '2px solid #16A34A',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </Box>

                    {index <
                      approvalTimeline.length - 1 && (
                      <Box
                        sx={{
                          width: '2px',
                          minHeight: '82px',
                          backgroundColor: '#86EFAC',
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
                        color:
                          index === 1
                            ? '#15803D'
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
              ))}
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

export default ApprovedStatePage;