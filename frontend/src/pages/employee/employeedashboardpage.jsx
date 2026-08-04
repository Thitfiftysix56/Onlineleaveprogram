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

import {
  useNavigate,
} from 'react-router-dom';

import EmployeeLayout from '../../layouts/employeelayout.jsx';

import {
  getLeaveRequests,
  leaveRequestStorageKey,
} from '../../utils/leaverequeststorage.js';

import {
  getNotifications,
  markNotificationAsRead,
  notificationStorageKey,
} from '../../utils/notificationstorage.js';

import {
  getLeaveEntitlements,
  leaveEntitlementStorageKey,
} from '../../utils/leaveentitlementstorage.js';

const normalizeStatus = (status) =>
  String(status || '')
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : 0;
};

const capitalizeStatus = (
  status,
) => {
  const normalizedStatus =
    normalizeStatus(status);

  if (!normalizedStatus) {
    return 'Draft';
  }

  return (
    normalizedStatus
      .charAt(0)
      .toUpperCase() +
    normalizedStatus.slice(1)
  );
};

const getRequestDateValue = (
  request,
) => {
  const requestDate =
    request.updatedAt ||
    request.submittedAt ||
    request.createdAt ||
    request.startDate;

  const timestamp =
    new Date(
      requestDate || 0,
    ).getTime();

  return Number.isNaN(
    timestamp,
  )
    ? 0
    : timestamp;
};

const getRequestYear = (
  request,
) => {
  const dateValue =
    request.startDate ||
    request.submittedAt ||
    request.createdAt ||
    request.updatedAt;

  if (!dateValue) {
    return null;
  }

  const directYear =
    Number(
      String(
        dateValue,
      ).slice(0, 4),
    );

  if (
    Number.isInteger(
      directYear,
    ) &&
    directYear > 0
  ) {
    return directYear;
  }

  const date =
    new Date(dateValue);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date.getFullYear();
};

const formatDate = (
  dateString,
) => {
  if (!dateString) {
    return '-';
  }

  const date =
    new Date(
      `${dateString}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatDateRange = (
  startDate,
  endDate,
) => {
  if (
    !startDate &&
    !endDate
  ) {
    return '-';
  }

  if (
    !endDate ||
    startDate === endDate
  ) {
    return formatDate(
      startDate,
    );
  }

  return `${formatDate(
    startDate,
  )} - ${formatDate(
    endDate,
  )}`;
};

const formatDateTime = (
  dateTimeString,
) => {
  if (!dateTimeString) {
    return '-';
  }

  const date =
    new Date(
      dateTimeString,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

const getStatusStyle = (
  status,
) => {
  const styles = {
    Approved: {
      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },

    Pending: {
      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    },

    Rejected: {
      backgroundColor:
        '#FEE2E2',

      color:
        '#B91C1C',
    },

    Cancelled: {
      backgroundColor:
        '#F3F4F6',

      color:
        '#6B7280',
    },

    Draft: {
      backgroundColor:
        '#DBEAFE',

      color:
        '#1D4ED8',
    },
  };

  return (
    styles[status] ||
    styles.Cancelled
  );
};

const calculateLeaveBalances = ({
  requests,
  entitlements,
  year,
}) =>
  entitlements.map(
    (entitlement) => {
      const leaveTypeId =
        Number(
          entitlement.leaveTypeId,
        );

      const pendingDays =
        requests
          .filter(
            (request) =>
              normalizeStatus(
                request.status,
              ) ===
                'pending' &&
              Number(
                request.leaveTypeId,
              ) ===
                leaveTypeId &&
              getRequestYear(
                request,
              ) ===
                year,
          )
          .reduce(
            (
              total,
              request,
            ) =>
              total +
              toNumber(
                request.leaveDays,
              ),
            0,
          );

      const totalDays =
        Math.max(
          toNumber(
            entitlement.totalDays,
          ),
          0,
        );

      const usedDays =
        Math.min(
          Math.max(
            toNumber(
              entitlement.usedDays,
            ),
            0,
          ),
          totalDays,
        );

      const remainingDays =
        Math.max(
          totalDays -
            usedDays,
          0,
        );

      const availableDays =
        Math.max(
          remainingDays -
            pendingDays,
          0,
        );

      return {
        ...entitlement,

        totalDays,

        usedDays,

        pendingDays,

        remainingDays,

        availableDays,
      };
    },
  );

function EmployeeDashboardPage() {
  const navigate =
    useNavigate();

  const [
    leaveRequests,
    setLeaveRequests,
  ] = useState([]);

  const [
    leaveBalances,
    setLeaveBalances,
  ] = useState([]);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const currentYear =
    new Date().getFullYear();

  const loadDashboardData =
    useCallback(() => {
      /*
       * เรียกคำขอลาก่อน เพราะฟังก์ชันนี้จะทำให้
       * Entitlement Storage อัปเดตยอด Used จาก
       * รายการ Approved เดิมก่อนอ่าน Balance
       */
      const employeeRequests =
        getLeaveRequests({
          role: 'employee',
        })
          .map(
            (request) => ({
              ...request,

              statusLabel:
                capitalizeStatus(
                  request.status,
                ),
            }),
          )
          .sort(
            (
              firstRequest,
              secondRequest,
            ) =>
              getRequestDateValue(
                secondRequest,
              ) -
              getRequestDateValue(
                firstRequest,
              ),
          );

      const employeeEntitlements =
        getLeaveEntitlements({
          role: 'employee',
          year: currentYear,
        });

      const calculatedBalances =
        calculateLeaveBalances({
          requests:
            employeeRequests,

          entitlements:
            employeeEntitlements,

          year:
            currentYear,
        });

      const employeeNotifications =
        getNotifications({
          role: 'employee',
        }).sort(
          (
            firstNotification,
            secondNotification,
          ) =>
            new Date(
              secondNotification
                .createdAt || 0,
            ).getTime() -
            new Date(
              firstNotification
                .createdAt || 0,
            ).getTime(),
        );

      setLeaveRequests(
        employeeRequests,
      );

      setLeaveBalances(
        calculatedBalances,
      );

      setNotifications(
        employeeNotifications,
      );
    }, [currentYear]);

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = (
      event,
    ) => {
      const watchedKeys = [
        leaveRequestStorageKey,
        leaveEntitlementStorageKey,
        notificationStorageKey,
      ];

      if (
        !event.key ||
        watchedKeys.includes(
          event.key,
        )
      ) {
        loadDashboardData();
      }
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      loadDashboardData,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        loadDashboardData,
      );
    };
  }, [loadDashboardData]);

  const annualBalance =
    useMemo(
      () =>
        leaveBalances.find(
          (balance) =>
            Number(
              balance.leaveTypeId,
            ) === 1 ||
            balance.leaveType ===
              'Annual Leave',
        ) || null,
      [leaveBalances],
    );

  const sickBalance =
    useMemo(
      () =>
        leaveBalances.find(
          (balance) =>
            Number(
              balance.leaveTypeId,
            ) === 2 ||
            balance.leaveType ===
              'Sick Leave',
        ) || null,
      [leaveBalances],
    );

  const pendingRequestCount =
    useMemo(
      () =>
        leaveRequests.filter(
          (request) =>
            normalizeStatus(
              request.status,
            ) === 'pending',
        ).length,
      [leaveRequests],
    );

  const approvedRequestCount =
    useMemo(
      () =>
        leaveRequests.filter(
          (request) =>
            normalizeStatus(
              request.status,
            ) ===
              'approved' &&
            getRequestYear(
              request,
            ) ===
              currentYear,
        ).length,
      [
        currentYear,
        leaveRequests,
      ],
    );

  const summaryCards = [
    {
      title:
        'Annual Leave',

      value:
        `${annualBalance?.availableDays || 0} Days`,

      description:
        annualBalance?.pendingDays >
        0
          ? `${annualBalance.pendingDays} day(s) pending`
          : 'Available balance',
    },
    {
      title:
        'Sick Leave',

      value:
        `${sickBalance?.availableDays || 0} Days`,

      description:
        sickBalance?.pendingDays >
        0
          ? `${sickBalance.pendingDays} day(s) pending`
          : 'Available balance',
    },
    {
      title:
        'Pending Requests',

      value:
        pendingRequestCount,

      description:
        'Waiting for approval',
    },
    {
      title:
        'Approved Requests',

      value:
        approvedRequestCount,

      description:
        `In ${currentYear}`,
    },
  ];

  const recentRequests =
    useMemo(
      () =>
        leaveRequests
          .filter(
            (request) =>
              normalizeStatus(
                request.status,
              ) !== 'draft',
          )
          .slice(0, 5),
      [leaveRequests],
    );

  const recentNotifications =
    useMemo(
      () =>
        notifications.slice(
          0,
          4,
        ),
      [notifications],
    );

  const unreadNotificationCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.isRead,
        ).length,
      [notifications],
    );

  const handleOpenRequest = (
    requestId,
  ) => {
    navigate(
      `/employee/my-requests/${requestId}`,
    );
  };

  const handleOpenNotification = (
    notification,
  ) => {
    if (
      !notification.isRead
    ) {
      markNotificationAsRead(
        notification.id,
      );

      loadDashboardData();
    }

    navigate(
      notification.path ||
        '/employee/notification',
    );
  };

  return (
    <EmployeeLayout
      activeMenu="Dashboard"
    >
      <Box
        sx={{
          display:
            'flex',

          alignItems: {
            xs:
              'flex-start',

            sm:
              'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs:
              'column',

            sm:
              'row',
          },

          gap:
            '16px',

          marginBottom:
            '28px',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              color:
                '#111827',

              fontSize: {
                xs:
                  '26px',

                sm:
                  '30px',
              },

              fontWeight:
                800,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '15px',

              marginTop:
                '6px',
            }}
          >
            Welcome back. Here is an overview of your
            leave information.
          </Typography>
        </Box>

       
      </Box>

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            sm:
              'repeat(2, minmax(0, 1fr))',

            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '20px',

          marginBottom:
            '28px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <Paper
              key={
                card.title
              }
              elevation={0}
              sx={{
                padding:
                  '24px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '12px',
              }}
            >
              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '14px',

                  fontWeight:
                    500,
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '28px',

                  fontWeight:
                    800,

                  marginTop:
                    '8px',
                }}
              >
                {card.value}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#9CA3AF',

                  fontSize:
                    '13px',

                  marginTop:
                    '4px',
                }}
              >
                {card.description}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '12px',

          overflow:
            'hidden',

          marginBottom:
            '24px',
        }}
      >
        <Box
          sx={{
            padding:
              '20px 24px',

            borderBottom:
              '1px solid #E5E7EB',

            display:
              'flex',

            alignItems: {
              xs:
                'flex-start',

              sm:
                'center',
            },

            justifyContent:
              'space-between',

            flexDirection: {
              xs:
                'column',

              sm:
                'row',
            },

            gap:
              '16px',
          }}
        >
          <Box>
            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '18px',

                fontWeight:
                  800,
              }}
            >
              Recent Leave Requests
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '14px',

                marginTop:
                  '4px',
              }}
            >
              Your latest submitted leave requests
            </Typography>
          </Box>

          <Box
            sx={{
              display:
                'flex',

              gap:
                '10px',

              flexWrap:
                'wrap',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                navigate(
                  '/employee/my-requests',
                )
              }
              sx={{
                height:
                  '42px',

                padding:
                  '0 18px',

                color:
                  '#2563EB',

                borderColor:
                  '#2563EB',

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                textTransform:
                  'none',
              }}
            >
              View All
            </Button>

            <Button
              type="button"
              variant="contained"
              onClick={() =>
                navigate(
                  '/employee/leave-request',
                )
              }
              sx={{
                height:
                  '42px',

                padding:
                  '0 18px',

                backgroundColor:
                  '#2563EB',

                color:
                  '#FFFFFF',

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                boxShadow:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#1D4ED8',

                  boxShadow:
                    'none',
                },
              }}
            >
              New Leave Request
            </Button>
          </Box>
        </Box>

        {recentRequests.length >
        0 ? (
          <Box
            sx={{
              overflowX:
                'auto',
            }}
          >
            <Box
              sx={{
                minWidth:
                  '800px',
              }}
            >
              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    '1.1fr 1.2fr 2fr 1fr 1fr 0.8fr',

                  padding:
                    '14px 24px',

                  backgroundColor:
                    '#F9FAFB',

                  borderBottom:
                    '1px solid #E5E7EB',
                }}
              >
                {[
                  'Request ID',
                  'Leave Type',
                  'Date',
                  'Total',
                  'Status',
                  'Action',
                ].map(
                  (heading) => (
                    <Typography
                      key={
                        heading
                      }
                      sx={{
                        color:
                          '#6B7280',

                        fontSize:
                          '13px',

                        fontWeight:
                          700,
                      }}
                    >
                      {heading}
                    </Typography>
                  ),
                )}
              </Box>

              {recentRequests.map(
                (request) => {
                  const status =
                    request.statusLabel;

                  return (
                    <Box
                      key={
                        request.id
                      }
                      sx={{
                        display:
                          'grid',

                        gridTemplateColumns:
                          '1.1fr 1.2fr 2fr 1fr 1fr 0.8fr',

                        alignItems:
                          'center',

                        padding:
                          '16px 24px',

                        borderBottom:
                          '1px solid #E5E7EB',

                        '&:last-child':
                          {
                            borderBottom:
                              0,
                          },

                        '&:hover': {
                          backgroundColor:
                            '#F9FAFB',
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#2563EB',

                          fontSize:
                            '14px',

                          fontWeight:
                            700,
                        }}
                      >
                        {request.requestNo ||
                          `#${request.id}`}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#111827',

                          fontSize:
                            '14px',
                        }}
                      >
                        {request.leaveType ||
                          '-'}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#374151',

                          fontSize:
                            '14px',
                        }}
                      >
                        {formatDateRange(
                          request.startDate,
                          request.endDate,
                        )}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#374151',

                          fontSize:
                            '14px',
                        }}
                      >
                        {toNumber(
                          request.leaveDays,
                        )}{' '}
                        {toNumber(
                          request.leaveDays,
                        ) === 1
                          ? 'Day'
                          : 'Days'}
                      </Typography>

                      <Box>
                        <Chip
                          label={
                            status
                          }
                          size="small"
                          sx={{
                            ...getStatusStyle(
                              status,
                            ),

                            minWidth:
                              '82px',

                            borderRadius:
                              '999px',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,
                          }}
                        />
                      </Box>

                      <Button
                        type="button"
                        onClick={() =>
                          handleOpenRequest(
                            request.id,
                          )
                        }
                        sx={{
                          width:
                            'fit-content',

                          minWidth:
                            0,

                          padding:
                            0,

                          color:
                            '#2563EB',

                          fontSize:
                            '14px',

                          fontWeight:
                            700,

                          textTransform:
                            'none',

                          '&:hover': {
                            backgroundColor:
                              'transparent',

                            textDecoration:
                              'underline',
                          },
                        }}
                      >
                        View
                      </Button>
                    </Box>
                  );
                },
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              minHeight:
                '220px',

              padding:
                '36px 24px',

              display:
                'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              justifyContent:
                'center',

              textAlign:
                'center',
            }}
          >
            <Box
              sx={{
                width:
                  '58px',

                height:
                  '58px',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                backgroundColor:
                  '#EFF6FF',

                color:
                  '#2563EB',

                borderRadius:
                  '50%',

                fontSize:
                  '22px',

                fontWeight:
                  800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '17px',

                fontWeight:
                  800,

                marginTop:
                  '14px',
              }}
            >
              No leave requests yet
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '14px',

                marginTop:
                  '5px',
              }}
            >
              Create your first leave request to get started.
            </Typography>

            <Button
              type="button"
              variant="contained"
              onClick={() =>
                navigate(
                  '/employee/leave-request',
                )
              }
              sx={{
                height:
                  '40px',

                marginTop:
                  '18px',

                padding:
                  '0 18px',

                backgroundColor:
                  '#2563EB',

                color:
                  '#FFFFFF',

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                boxShadow:
                  'none',
              }}
            >
              New Leave Request
            </Button>
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '12px',

          overflow:
            'hidden',
        }}
      >
        <Box
          sx={{
            padding:
              '20px 24px',

            borderBottom:
              '1px solid #E5E7EB',

            display:
              'flex',

            alignItems: {
              xs:
                'flex-start',

              sm:
                'center',
            },

            justifyContent:
              'space-between',

            flexDirection: {
              xs:
                'column',

              sm:
                'row',
            },

            gap:
              '14px',
          }}
        >
          <Box>
            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '10px',

                flexWrap:
                  'wrap',
              }}
            >
              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '18px',

                  fontWeight:
                    800,
                }}
              >
                Recent Notifications
              </Typography>

              {unreadNotificationCount >
                0 && (
                <Chip
                  label={`${unreadNotificationCount} unread`}
                  size="small"
                  sx={{
                    backgroundColor:
                      '#FEE2E2',

                    color:
                      '#B91C1C',

                    borderRadius:
                      '999px',

                    fontSize:
                      '11px',

                    fontWeight:
                      700,
                  }}
                />
              )}
            </Box>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '14px',

                marginTop:
                  '4px',
              }}
            >
              Updates related to your leave requests
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              navigate(
                '/employee/notification',
              )
            }
            sx={{
              height:
                '40px',

              padding:
                '0 16px',

              color:
                '#2563EB',

              borderColor:
                '#2563EB',

              borderRadius:
                '8px',

              fontSize:
                '13px',

              fontWeight:
                700,

              textTransform:
                'none',
            }}
          >
            View All
          </Button>
        </Box>

        {recentNotifications.length >
        0 ? (
          <Box>
            {recentNotifications.map(
              (
                notification,
                index,
              ) => (
                <Box
                  key={
                    notification.id
                  }
                  onClick={() =>
                    handleOpenNotification(
                      notification,
                    )
                  }
                  sx={{
                    padding:
                      '18px 24px',

                    display:
                      'flex',

                    alignItems:
                      'flex-start',

                    gap:
                      '14px',

                    cursor:
                      'pointer',

                    backgroundColor:
                      notification.isRead
                        ? '#FFFFFF'
                        : '#EFF6FF',

                    borderLeft:
                      notification.isRead
                        ? '4px solid transparent'
                        : '4px solid #2563EB',

                    borderBottom:
                      index ===
                      recentNotifications.length -
                        1
                        ? 'none'
                        : '1px solid #E5E7EB',

                    '&:hover': {
                      backgroundColor:
                        notification.isRead
                          ? '#F9FAFB'
                          : '#DBEAFE',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width:
                        '10px',

                      height:
                        '10px',

                      flexShrink:
                        0,

                      marginTop:
                        '6px',

                      backgroundColor:
                        notification.isRead
                          ? '#D1D5DB'
                          : '#2563EB',

                      borderRadius:
                        '50%',
                    }}
                  />

                  <Box
                    sx={{
                      minWidth:
                        0,

                      flex:
                        1,
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '14px',

                        fontWeight:
                          notification.isRead
                            ? 700
                            : 800,
                      }}
                    >
                      {notification.title ||
                        'Notification'}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#4B5563',

                        fontSize:
                          '13px',

                        lineHeight:
                          1.6,

                        marginTop:
                          '5px',
                      }}
                    >
                      {notification.message ||
                        '-'}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#9CA3AF',

                        fontSize:
                          '11px',

                        marginTop:
                          '7px',
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
                        flexShrink:
                          0,

                        backgroundColor:
                          '#DBEAFE',

                        color:
                          '#1D4ED8',

                        borderRadius:
                          '999px',

                        fontSize:
                          '10px',

                        fontWeight:
                          700,
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
              minHeight:
                '180px',

              padding:
                '32px 24px',

              display:
                'flex',

              flexDirection:
                'column',

              alignItems:
                'center',

              justifyContent:
                'center',

              textAlign:
                'center',
            }}
          >
            <Box
              sx={{
                width:
                  '52px',

                height:
                  '52px',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                backgroundColor:
                  '#EFF6FF',

                color:
                  '#2563EB',

                borderRadius:
                  '50%',

                fontSize:
                  '20px',

                fontWeight:
                  800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '16px',

                fontWeight:
                  800,

                marginTop:
                  '12px',
              }}
            >
              No notifications
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '13px',

                marginTop:
                  '4px',
              }}
            >
              New leave updates will appear here.
            </Typography>
          </Box>
        )}
      </Paper>
    </EmployeeLayout>
  );
}

export default EmployeeDashboardPage;