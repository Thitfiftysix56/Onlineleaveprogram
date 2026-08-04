import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

import {
  getLeaveRequests,
  leaveRequestStorageKey,
} from '../../utils/leaverequeststorage.js';

import {
  getNotifications,
  markNotificationAsRead,
  notificationStorageKey,
} from '../../utils/notificationstorage.js';

const employeeProfiles = {
  employee: {
    employeeId: 'EMP001',
    employeeName: 'Employee User',
  },
  supervisor: {
    employeeId: 'SUP001',
    employeeName: 'Supervisor User',
  },
  hr: {
    employeeId: 'HR001',
    employeeName: 'HR User',
  },
  admin: {
    employeeId: 'ADM001',
    employeeName: 'Admin User',
  },
};

const capitalizeStatus = (status) => {
  const normalizedStatus = String(status || '')
    .trim()
    .toLowerCase();

  if (!normalizedStatus) {
    return 'Pending';
  }

  return (
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1)
  );
};

const parseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const value = String(dateValue);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const getRequestDateValue = (request) => {
  const date =
    parseDate(request.updatedAt) ||
    parseDate(request.approvedAt) ||
    parseDate(request.rejectedAt) ||
    parseDate(request.submittedAt) ||
    parseDate(request.createdAt) ||
    parseDate(request.startDate);

  return date ? date.getTime() : 0;
};

const getApprovalDateValue = (request) => {
  const status = String(request.status || '').toLowerCase();

  let date = null;

  if (status === 'approved') {
    date =
      parseDate(request.approvedAt) ||
      parseDate(request.updatedAt);
  }

  if (status === 'rejected') {
    date =
      parseDate(request.rejectedAt) ||
      parseDate(request.updatedAt);
  }

  date =
    date ||
    parseDate(request.submittedAt) ||
    parseDate(request.createdAt) ||
    parseDate(request.startDate);

  return date ? date.getTime() : 0;
};

const normalizeRequest = (request) => {
  const requestRole = String(
    request.role || 'employee',
  ).toLowerCase();

  const profile =
    employeeProfiles[requestRole] ||
    employeeProfiles.employee;

  return {
    ...request,

    id: request.id,

    requestNo:
      request.requestNo ||
      `Request #${request.id}`,

    employeeId:
      request.employeeId ||
      request.employeeCode ||
      profile.employeeId,

    employeeName:
      request.employeeName ||
      profile.employeeName,

    leaveType:
      request.leaveType ||
      'Not specified',

    leaveDays:
      Number(request.leaveDays) || 0,

    statusLabel:
      capitalizeStatus(request.status),

    approver:
      request.approver ||
      request.approverName ||
      'Supervisor User',

    rejectionReason:
      request.rejectionReason ||
      request.comment ||
      '',
  };
};

function SupervisorDashboardPage() {
  const navigate = useNavigate();

  const [leaveRequests, setLeaveRequests] =
    useState([]);

  const [notifications, setNotifications] =
    useState([]);

  const loadDashboardData = useCallback(() => {
    const storedRequests = getLeaveRequests()
      .filter(
        (request) =>
          String(request.status || '').toLowerCase() !==
          'draft',
      )
      .map(normalizeRequest)
      .sort(
        (firstRequest, secondRequest) =>
          getRequestDateValue(secondRequest) -
          getRequestDateValue(firstRequest),
      );

    const supervisorNotifications =
      getNotifications({
        role: 'supervisor',
      })
        .map((notification) => ({
          ...notification,

          isRead: Boolean(
            notification.isRead ??
              notification.read,
          ),
        }))
        .sort((firstNotification, secondNotification) => {
          const firstDate =
            parseDate(firstNotification.createdAt)?.getTime() ||
            0;

          const secondDate =
            parseDate(secondNotification.createdAt)?.getTime() ||
            0;

          return secondDate - firstDate;
        });

    setLeaveRequests(storedRequests);
    setNotifications(supervisorNotifications);
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = (event) => {
      if (
        !event.key ||
        event.key === leaveRequestStorageKey ||
        event.key === notificationStorageKey
      ) {
        loadDashboardData();
      }
    };

    const handleWindowFocus = () => {
      loadDashboardData();
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      handleWindowFocus,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        handleWindowFocus,
      );
    };
  }, [loadDashboardData]);

  const currentDate = new Date();

  const isCurrentMonth = (request) => {
    const dateValue =
      getApprovalDateValue(request);

    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);

    return (
      date.getFullYear() ===
        currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth()
    );
  };

  const pendingRequests = useMemo(
    () =>
      leaveRequests
        .filter(
          (request) =>
            String(
              request.status || '',
            ).toLowerCase() === 'pending',
        )
        .sort(
          (firstRequest, secondRequest) =>
            getRequestDateValue(secondRequest) -
            getRequestDateValue(firstRequest),
        ),
    [leaveRequests],
  );

  const approvedThisMonth =
    leaveRequests.filter(
      (request) =>
        String(
          request.status || '',
        ).toLowerCase() === 'approved' &&
        isCurrentMonth(request),
    ).length;

  const rejectedThisMonth =
    leaveRequests.filter(
      (request) =>
        String(
          request.status || '',
        ).toLowerCase() === 'rejected' &&
        isCurrentMonth(request),
    ).length;

  const recentPendingRequests =
    pendingRequests.slice(0, 5);

  const recentApprovalActivity =
    useMemo(
      () =>
        leaveRequests
          .filter((request) =>
            ['approved', 'rejected'].includes(
              String(
                request.status || '',
              ).toLowerCase(),
            ),
          )
          .sort(
            (firstRequest, secondRequest) =>
              getApprovalDateValue(secondRequest) -
              getApprovalDateValue(firstRequest),
          )
          .slice(0, 5),
      [leaveRequests],
    );

  const recentNotifications =
    useMemo(
      () => notifications.slice(0, 4),
      [notifications],
    );

  const unreadNotificationCount =
    notifications.filter(
      (notification) => !notification.isRead,
    ).length;

  const summaryCards = [
    {
      title: 'Pending Approval',
      value: pendingRequests.length,
      description: 'Waiting for your review',
      backgroundColor: '#FEF3C7',
      textColor: '#B45309',
      symbol: 'P',
    },
    {
      title: 'Approved',
      value: approvedThisMonth,
      description: 'Approved this month',
      backgroundColor: '#DCFCE7',
      textColor: '#15803D',
      symbol: 'A',
    },
    {
      title: 'Rejected',
      value: rejectedThisMonth,
      description: 'Rejected this month',
      backgroundColor: '#FEE2E2',
      textColor: '#B91C1C',
      symbol: 'R',
    },
  ];

  const formatDate = (dateValue) => {
    const date = parseDate(dateValue);

    if (!date) {
      return '-';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateRange = (
    startDate,
    endDate,
  ) => {
    if (!startDate && !endDate) {
      return '-';
    }

    if (!endDate || startDate === endDate) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(
      endDate,
    )}`;
  };

  const formatDateTime = (dateValue) => {
    const date = parseDate(dateValue);

    if (!date) {
      return '-';
    }

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      Approved: {
        backgroundColor: '#DCFCE7',
        color: '#15803D',
      },
      Pending: {
        backgroundColor: '#FEF3C7',
        color: '#B45309',
      },
      Rejected: {
        backgroundColor: '#FEE2E2',
        color: '#B91C1C',
      },
      Cancelled: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
      },
    };

    return styles[status] || styles.Cancelled;
  };

  const handleReviewRequest = (requestId) => {
    navigate(
      `/supervisor/approval/${requestId}`,
    );
  };

  const handleOpenNotification = (
    notification,
  ) => {
    if (!notification.isRead) {
      markNotificationAsRead(
        notification.id,
      );

      loadDashboardData();
    }

    navigate(
      notification.path ||
        '/supervisor/notification',
    );
  };

  return (
    <SupervisorLayout activeMenu="Dashboard">
      <Box
        sx={{
          marginBottom: '28px',
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
            Supervisor Dashboard
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            Review pending leave requests and monitor
            recent approval activity.
          </Typography>
        </Box>


      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, minmax(0, 1fr))',
          },
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  sx={{
                    color: '#111827',
                    fontSize: '30px',
                    fontWeight: 800,
                    marginTop: '8px',
                  }}
                >
                  {card.value}
                </Typography>

                <Typography
                  sx={{
                    color: '#9CA3AF',
                    fontSize: '13px',
                    marginTop: '4px',
                  }}
                >
                  {card.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: '46px',
                  height: '46px',
                  minWidth: '46px',
                  backgroundColor:
                    card.backgroundColor,
                  color: card.textColor,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                {card.symbol}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <Box
          sx={{
            padding: {
              xs: '20px',
              sm: '24px',
            },
            borderBottom: '1px solid #E5E7EB',
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
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              Pending Leave Requests
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Leave requests waiting for your approval.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              navigate('/supervisor/approval')
            }
            sx={{
              height: '42px',
              padding: '0 18px',
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
            View All Requests
          </Button>
        </Box>

        {recentPendingRequests.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: '1050px' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1.1fr 1.5fr 1.2fr 1.8fr 0.8fr 1fr 0.8fr',
                  gap: '16px',
                  padding: '14px 24px',
                  backgroundColor: '#F9FAFB',
                  borderBottom:
                    '1px solid #E5E7EB',
                }}
              >
                {[
                  'Request ID',
                  'Employee',
                  'Leave Type',
                  'Leave Period',
                  'Total',
                  'Submitted',
                  'Action',
                ].map((heading) => (
                  <Typography
                    key={heading}
                    sx={{
                      color: '#6B7280',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    {heading}
                  </Typography>
                ))}
              </Box>

              {recentPendingRequests.map(
                (request) => (
                  <Box
                    key={request.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1.1fr 1.5fr 1.2fr 1.8fr 0.8fr 1fr 0.8fr',
                      gap: '16px',
                      alignItems: 'center',
                      padding: '17px 24px',
                      borderBottom:
                        '1px solid #E5E7EB',

                      '&:last-child': {
                        borderBottom: 0,
                      },

                      '&:hover': {
                        backgroundColor: '#F9FAFB',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#7C3AED',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      {request.requestNo}
                    </Typography>

                    <Box>
                      <Typography
                        sx={{
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      >
                        {request.employeeName}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#9CA3AF',
                          fontSize: '12px',
                          marginTop: '3px',
                        }}
                      >
                        {request.employeeId}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        color: '#374151',
                        fontSize: '14px',
                      }}
                    >
                      {request.leaveType}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#374151',
                        fontSize: '14px',
                      }}
                    >
                      {formatDateRange(
                        request.startDate,
                        request.endDate,
                      )}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#374151',
                        fontSize: '14px',
                      }}
                    >
                      {request.leaveDays}{' '}
                      {request.leaveDays === 1
                        ? 'Day'
                        : 'Days'}
                    </Typography>

                    <Box>
                      <Typography
                        sx={{
                          color: '#374151',
                          fontSize: '14px',
                        }}
                      >
                        {formatDate(
                          request.submittedAt ||
                            request.createdAt,
                        )}
                      </Typography>

                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          minWidth: '72px',
                          marginTop: '6px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      />
                    </Box>

                    <Button
                      type="button"
                      onClick={() =>
                        handleReviewRequest(request.id)
                      }
                      sx={{
                        width: 'fit-content',
                        minWidth: 0,
                        padding: 0,
                        color: '#7C3AED',
                        fontSize: '14px',
                        fontWeight: 700,
                        textTransform: 'none',

                        '&:hover': {
                          backgroundColor:
                            'transparent',
                          textDecoration:
                            'underline',
                        },
                      }}
                    >
                      Review
                    </Button>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              minHeight: '220px',
              padding: '36px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: '58px',
                height: '58px',
                backgroundColor: '#F5F3FF',
                color: '#7C3AED',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color: '#111827',
                fontSize: '17px',
                fontWeight: 800,
                marginTop: '14px',
              }}
            >
              No pending requests
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '5px',
              }}
            >
              All submitted leave requests have been
              reviewed.
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            padding: '16px 24px',
            backgroundColor: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '13px',
            }}
          >
            Showing {recentPendingRequests.length} of{' '}
            {pendingRequests.length} pending leave requests
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
          marginBottom: '24px',
        }}
      >
        <Box
          sx={{
            padding: '20px 24px',
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
            Recent Approval Activity
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            Recently approved and rejected leave requests.
          </Typography>
        </Box>

        {recentApprovalActivity.length > 0 ? (
          <Box>
            {recentApprovalActivity.map(
              (request, index) => (
                <Box
                  key={request.id}
                  sx={{
                    padding: '18px 24px',
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
                    borderBottom:
                      index ===
                      recentApprovalActivity.length - 1
                        ? 'none'
                        : '1px solid #E5E7EB',

                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: 800,
                        }}
                      >
                        {request.requestNo}
                      </Typography>

                      <Chip
                        label={request.statusLabel}
                        size="small"
                        sx={{
                          ...getStatusStyle(
                            request.statusLabel,
                          ),
                          minWidth: '80px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        color: '#4B5563',
                        fontSize: '13px',
                        marginTop: '7px',
                      }}
                    >
                      {request.employeeName} ·{' '}
                      {request.leaveType} ·{' '}
                      {request.leaveDays}{' '}
                      {request.leaveDays === 1
                        ? 'day'
                        : 'days'}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#9CA3AF',
                        fontSize: '12px',
                        marginTop: '5px',
                      }}
                    >
                      {formatDateTime(
                        request.approvedAt ||
                          request.rejectedAt ||
                          request.updatedAt ||
                          request.submittedAt,
                      )}
                    </Typography>

                    {request.statusLabel ===
                      'Rejected' &&
                      request.rejectionReason && (
                        <Typography
                          sx={{
                            color: '#B91C1C',
                            fontSize: '12px',
                            marginTop: '5px',
                          }}
                        >
                          Reason:{' '}
                          {request.rejectionReason}
                        </Typography>
                      )}
                  </Box>

                  <Button
                    type="button"
                    onClick={() =>
                      handleReviewRequest(request.id)
                    }
                    sx={{
                      minWidth: 0,
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
                    View
                  </Button>
                </Box>
              ),
            )}
          </Box>
        ) : (
          <Box
            sx={{
              minHeight: '170px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              No approval activity
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                marginTop: '5px',
              }}
            >
              Approved and rejected requests will appear
              here.
            </Typography>
          </Box>
        )}
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
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
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
            gap: '14px',
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                Recent Notifications
              </Typography>

              {unreadNotificationCount > 0 && (
                <Chip
                  label={`${unreadNotificationCount} unread`}
                  size="small"
                  sx={{
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '4px',
              }}
            >
              Updates about newly submitted leave requests.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              navigate('/supervisor/notification')
            }
            sx={{
              height: '40px',
              padding: '0 16px',
              color: '#7C3AED',
              borderColor: '#7C3AED',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'none',

              '&:hover': {
                backgroundColor: '#F5F3FF',
                borderColor: '#6D28D9',
              },
            }}
          >
            View All
          </Button>
        </Box>

        {recentNotifications.length > 0 ? (
          <Box>
            {recentNotifications.map(
              (notification, index) => (
                <Box
                  key={notification.id}
                  onClick={() =>
                    handleOpenNotification(notification)
                  }
                  sx={{
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    cursor: 'pointer',

                    backgroundColor:
                      notification.isRead
                        ? '#FFFFFF'
                        : '#F5F3FF',

                    borderLeft:
                      notification.isRead
                        ? '4px solid transparent'
                        : '4px solid #7C3AED',

                    borderBottom:
                      index ===
                      recentNotifications.length - 1
                        ? 'none'
                        : '1px solid #E5E7EB',

                    '&:hover': {
                      backgroundColor:
                        notification.isRead
                          ? '#F9FAFB'
                          : '#EDE9FE',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: '10px',
                      height: '10px',
                      flexShrink: 0,
                      marginTop: '6px',

                      backgroundColor:
                        notification.isRead
                          ? '#D1D5DB'
                          : '#7C3AED',

                      borderRadius: '50%',
                    }}
                  />

                  <Box
                    sx={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#111827',
                        fontSize: '14px',
                        fontWeight: notification.isRead
                          ? 700
                          : 800,
                      }}
                    >
                      {notification.title ||
                        'Notification'}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#4B5563',
                        fontSize: '13px',
                        lineHeight: 1.6,
                        marginTop: '5px',
                      }}
                    >
                      {notification.message || '-'}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#9CA3AF',
                        fontSize: '11px',
                        marginTop: '7px',
                      }}
                    >
                      {formatDateTime(
                        notification.createdAt,
                      )}
                    </Typography>
                  </Box>

                  {!notification.isRead && (
                    <Chip
                      label="New"
                      size="small"
                      sx={{
                        flexShrink: 0,
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Box>
              ),
            )}
          </Box>
        ) : (
          <Box
            sx={{
              minHeight: '170px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#111827',
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              No notifications
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '13px',
                marginTop: '5px',
              }}
            >
              New leave request notifications will appear
              here.
            </Typography>
          </Box>
        )}
      </Paper>
    </SupervisorLayout>
  );
}

export default SupervisorDashboardPage;