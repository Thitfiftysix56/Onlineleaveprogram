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

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

import { getTeamReport } from '../../api/leave-service.js';
import { getNotifications, markNotificationRead as markNotificationAsRead } from '../../api/notification-service.js';
import {
  formatNotificationMessage,
  formatNotificationTitle,
} from '../../utils/presentationformatter.js';

const supervisorTheme = {
  primary: '#7C3AED',
  dark: '#6D28D9',
  soft: '#F3E8FF',
  border: '#DDD6FE',
  text: '#5B21B6',
};

const normalizeStatus = (status) =>
  String(status || '')
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

const getRequestDateValue = (request) => {
  const dateValue =
    request.submittedAt ||
    request.updatedAt ||
    request.createdAt ||
    request.startDate;

  const timestamp = new Date(
    dateValue || 0,
  ).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
};

const getRequestYear = (request) => {
  const value =
    request.startDate ||
    request.submittedAt ||
    request.createdAt ||
    request.updatedAt;

  if (!value) {
    return null;
  }

  const directYear = Number(
    String(value).slice(0, 4),
  );

  if (
    Number.isInteger(directYear) &&
    directYear > 0
  ) {
    return directYear;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date.getFullYear();
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return '-';
  }

  const text = String(
    dateValue,
  ).trim();

  const directMatch =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

  if (directMatch) {
    const [
      ,
      year,
      month,
      day,
    ] = directMatch;

    return `${day}/${month}/${year}`;
  }

  const date = new Date(
    dateValue,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
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

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return '-';
  }

  const date = new Date(
    dateValue,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const hours = String(
    date.getHours(),
  ).padStart(2, '0');

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
};

const translateLeaveType = (
  leaveType,
) => {
  const text = String(
    leaveType || '',
  ).trim();

  const leaveTypeMap = {
    'Annual Leave':
      'ลาพักร้อน',

    'Sick Leave':
      'ลาป่วย',

    'Personal Leave':
      'ลากิจ',

    'Maternity Leave':
      'ลาคลอด',

    'Paternity Leave':
      'ลาเพื่อดูแลบุตร',

    'Ordination Leave':
      'ลาอุปสมบท',

    'Military Leave':
      'ลาเพื่อรับราชการทหาร',

    Other:
      'ลาอื่น ๆ',
  };

  return (
    leaveTypeMap[text] ||
    text ||
    '-'
  );
};

const _translateNotificationTitle = (
  title,
) => {
  const text = String(
    title || '',
  ).trim();

  const titleMap = {
    'New leave request':
      'มีคำขอลาใหม่',

    'New leave request submitted':
      'มีคำขอลาใหม่',

    'New Leave Request':
      'มีคำขอลาใหม่',

    'Pending approval reminder':
      'แจ้งเตือนคำขอที่รออนุมัติ',

    'Leave request approved':
      'คำขอลาได้รับการอนุมัติ',

    'Leave request rejected':
      'คำขอลาถูกปฏิเสธ',

    'Leave request cancelled':
      'คำขอลาถูกยกเลิก',

    Notification:
      'การแจ้งเตือน',
  };

  return (
    titleMap[text] ||
    text ||
    'การแจ้งเตือน'
  );
};

const _translateNotificationMessage = (
  message,
) => {
  const text = String(
    message || '',
  ).trim();

  if (!text) {
    return '-';
  }

  /*
   * ตัวอย่าง:
   * Employee User submitted leave request
   * LR-20260724-0008 for approval.
   */
  const submittedRequestMatch =
    text.match(
      /^(.+?) submitted leave request (.+?) for approval\.?$/i,
    );

  if (
    submittedRequestMatch
  ) {
    const rawEmployeeName =
      String(
        submittedRequestMatch[1] ||
          '',
      ).trim();

    const requestNumber =
      String(
        submittedRequestMatch[2] ||
          '',
      ).trim();

    const employeeName =
      rawEmployeeName.toLowerCase() ===
      'employee user'
        ? 'พนักงาน'
        : rawEmployeeName;

    return `${employeeName} ส่งคำขอลา ${requestNumber} เพื่อขออนุมัติ`;
  }

  return text
    .replace(
      /Employee User/gi,
      'พนักงาน',
    )
    .replace(
      /submitted leave request/gi,
      'ส่งคำขอลา',
    )
    .replace(
      /for approval/gi,
      'เพื่อขออนุมัติ',
    )
    .replace(
      /New leave request/gi,
      'มีคำขอลาใหม่',
    )
    .replace(
      /Pending approval/gi,
      'คำขอที่รออนุมัติ',
    )
    .replace(
      /Annual Leave/gi,
      'ลาพักร้อน',
    )
    .replace(
      /Sick Leave/gi,
      'ลาป่วย',
    )
    .replace(
      /Personal Leave/gi,
      'ลากิจ',
    )
    .replace(
      /Maternity Leave/gi,
      'ลาคลอด',
    );
};

const getEmployeeName = (
  request,
) =>
  request.employeeName ||
  request.fullName ||
  request.employee?.fullName ||
  request.employee?.name ||
  'ไม่ระบุชื่อ';

const getEmployeeCode = (
  request,
) =>
  request.employeeCode ||
  request.employeeId ||
  request.employee?.employeeCode ||
  request.employee?.code ||
  '-';

const getRequestReference = (
  request,
) =>
  request.requestNo ||
  request.requestNumber ||
  request.requestId ||
  (request.id
    ? `#${request.id}`
    : '-');

function SupervisorDashboardPage() {
  const navigate =
    useNavigate();

  const [
    leaveRequests,
    setLeaveRequests,
  ] = useState([]);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const currentYear =
    new Date().getFullYear();

  const loadDashboardData =
    useCallback(async () => {
      const [report, notificationData] = await Promise.all([getTeamReport({}), getNotifications()]);
      const requests =
        (report?.leaveRequests || [])
          .map((request) => ({
            ...request,

            normalizedStatus:
              normalizeStatus(
                request.status,
              ),
          }))
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

      const supervisorNotifications =
        (notificationData?.notifications || []).map((notification) => ({ ...notification, isRead: Boolean(notification.read) })).sort(
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
        requests,
      );

      setNotifications(
        supervisorNotifications,
      );
    }, []);

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = (
      event,
    ) => {
      if (!event.key) {
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
  }, [
    loadDashboardData,
  ]);

  const pendingRequests =
    useMemo(
      () =>
        leaveRequests.filter(
          (request) =>
            request.normalizedStatus ===
            'pending',
        ),
      [
        leaveRequests,
      ],
    );

  const approvedRequestCount =
    useMemo(
      () =>
        leaveRequests.filter(
          (request) =>
            request.normalizedStatus ===
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

  const rejectedRequestCount =
    useMemo(
      () =>
        leaveRequests.filter(
          (request) =>
            request.normalizedStatus ===
              'rejected' &&
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

  const unreadNotificationCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.isRead,
        ).length,
      [
        notifications,
      ],
    );

  const recentPendingRequests =
    useMemo(
      () =>
        pendingRequests.slice(
          0,
          5,
        ),
      [
        pendingRequests,
      ],
    );

  const recentNotifications =
    useMemo(
      () =>
        notifications.slice(
          0,
          4,
        ),
      [
        notifications,
      ],
    );

  const summaryCards = [
    {
      title: 'รออนุมัติ',

      value:
        pendingRequests.length,

      description:
        'รายการที่รอตรวจสอบ',

      backgroundColor:
        supervisorTheme.soft,

      color:
        supervisorTheme.primary,
    },

    {
      title:
        'อนุมัติแล้ว',

      value:
        approvedRequestCount,

      description:
        `รายการในปี ${currentYear}`,

      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },

    {
      title:
        'ปฏิเสธแล้ว',

      value:
        rejectedRequestCount,

      description:
        `รายการในปี ${currentYear}`,

      backgroundColor:
        '#FEE2E2',

      color:
        '#B91C1C',
    },

    {
      title:
        'ยังไม่ได้อ่าน',

      value:
        unreadNotificationCount,

      description:
        'การแจ้งเตือนใหม่',

      backgroundColor:
        '#EDE9FE',

      color:
        '#6D28D9',
    },
  ];

  const handleOpenRequest = (
    request,
  ) => {
    navigate(
      `/supervisor/approval/${request.id}`,
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
        '/supervisor/notifications',
    );
  };

  return (
    <SupervisorLayout
      activeMenu="Dashboard"
    >
      <Box
        sx={{
          marginBottom:
            '22px',
        }}
      >
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
      </Box>

      {/* Summary Cards */}
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
            '18px',

          marginBottom:
            '24px',
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
                minHeight:
                  '140px',

                padding:
                  '20px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '14px',
              }}
            >
              <Box
                sx={{
                  width:
                    '50px',

                  height:
                    '50px',

                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    card.backgroundColor,

                  color:
                    card.color,

                  borderRadius:
                    '11px',

                  fontSize:
                    '20px',

                  fontWeight:
                    800,
                }}
              >
                {
                  card.value
                }
              </Box>

              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '14px',

                  fontWeight:
                    800,

                  marginTop:
                    '13px',
                }}
              >
                {
                  card.title
                }
              </Typography>

              <Typography
                sx={{
                  color:
                    '#94A3B8',

                  fontSize:
                    '11px',

                  marginTop:
                    '3px',
                }}
              >
                {
                  card.description
                }
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* Pending Requests */}
      <Paper
        elevation={0}
        sx={{
          marginBottom:
            '24px',

          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '14px',

          overflow:
            'hidden',
        }}
      >
        <Box
          sx={{
            padding:
              '20px 24px',

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

            borderBottom:
              '1px solid #E5E7EB',
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
              คำขอลาที่รออนุมัติ
            </Typography>

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                marginTop:
                  '4px',
              }}
            >
              แสดง{' '}
              {
                recentPendingRequests.length
              }{' '}
              จาก{' '}
              {
                pendingRequests.length
              }{' '}
              รายการ
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              navigate(
                '/supervisor/approval',
              )
            }
            sx={{
              height:
                '40px',

              padding:
                '0 16px',

              color:
                supervisorTheme.primary,

              borderColor:
                supervisorTheme.border,

              borderRadius:
                '8px',

              fontSize:
                '12px',

              fontWeight:
                700,

              textTransform:
                'none',

              '&:hover': {
                backgroundColor:
                  supervisorTheme.soft,

                borderColor:
                  supervisorTheme.primary,
              },
            }}
          >
            ดูทั้งหมด
          </Button>
        </Box>

        {recentPendingRequests.length >
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
                  '900px',
              }}
            >
              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    '1.2fr 1.5fr 1.2fr 1.7fr 0.8fr 0.8fr',

                  gap:
                    '16px',

                  padding:
                    '13px 24px',

                  backgroundColor:
                    '#F8FAFC',

                  borderBottom:
                    '1px solid #E5E7EB',
                }}
              >
                {[
                  'เลขที่คำขอ',
                  'พนักงาน',
                  'ประเภทการลา',
                  'ช่วงวันที่',
                  'จำนวนวัน',
                  'การดำเนินการ',
                ].map(
                  (heading) => (
                    <Typography
                      key={
                        heading
                      }
                      sx={{
                        color:
                          '#64748B',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,
                      }}
                    >
                      {
                        heading
                      }
                    </Typography>
                  ),
                )}
              </Box>

              {recentPendingRequests.map(
                (request) => (
                  <Box
                    key={
                      request.id ||
                      getRequestReference(
                        request,
                      )
                    }
                    sx={{
                      display:
                        'grid',

                      gridTemplateColumns:
                        '1.2fr 1.5fr 1.2fr 1.7fr 0.8fr 0.8fr',

                      gap:
                        '16px',

                      alignItems:
                        'center',

                      minHeight:
                        '68px',

                      padding:
                        '14px 24px',

                      borderBottom:
                        '1px solid #EEF0F3',

                      '&:last-child':
                        {
                          borderBottom:
                            'none',
                        },

                      '&:hover':
                        {
                          backgroundColor:
                            '#FAFAFC',
                        },
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          supervisorTheme.primary,

                        fontSize:
                          '12px',

                        fontWeight:
                          800,

                        wordBreak:
                          'break-word',
                      }}
                    >
                      {getRequestReference(
                        request,
                      )}
                    </Typography>

                    <Box
                      sx={{
                        minWidth:
                          0,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#111827',

                          fontSize:
                            '12px',

                          fontWeight:
                            700,

                          overflow:
                            'hidden',

                          textOverflow:
                            'ellipsis',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {getEmployeeName(
                          request,
                        )}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#94A3B8',

                          fontSize:
                            '10px',

                          marginTop:
                            '2px',
                        }}
                      >
                        {getEmployeeCode(
                          request,
                        )}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        color:
                          '#374151',

                        fontSize:
                          '12px',
                      }}
                    >
                      {translateLeaveType(
                        request.leaveType,
                      )}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#374151',

                        fontSize:
                          '12px',

                        whiteSpace:
                          'nowrap',
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
                          '#111827',

                        fontSize:
                          '12px',

                        fontWeight:
                          700,
                      }}
                    >
                      {toNumber(
                        request.leaveDays,
                      )}{' '}
                      วัน
                    </Typography>

                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() =>
                        handleOpenRequest(
                          request,
                        )
                      }
                      sx={{
                        width:
                          'fit-content',

                        minWidth:
                          '78px',

                        height:
                          '34px',

                        padding:
                          '0 12px',

                        color:
                          supervisorTheme.primary,

                        borderColor:
                          supervisorTheme.border,

                        borderRadius:
                          '8px',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,

                        textTransform:
                          'none',

                        '&:hover':
                          {
                            backgroundColor:
                              supervisorTheme.soft,

                            borderColor:
                              supervisorTheme.primary,
                          },
                      }}
                    >
                      ตรวจสอบ
                    </Button>
                  </Box>
                ),
              )}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              minHeight:
                '190px',

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
                  supervisorTheme.soft,

                color:
                  supervisorTheme.primary,

                borderRadius:
                  '50%',

                fontSize:
                  '18px',

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
                  '15px',

                fontWeight:
                  800,

                marginTop:
                  '12px',
              }}
            >
              ไม่มีคำขอที่รออนุมัติ
            </Typography>

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                marginTop:
                  '4px',
              }}
            >
              คำขอลาใหม่ของทีมจะแสดงในส่วนนี้
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Notifications */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '14px',

          overflow:
            'hidden',
        }}
      >
        <Box
          sx={{
            padding:
              '20px 24px',

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

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Box>
            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                flexWrap:
                  'wrap',

                gap:
                  '9px',
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
                การแจ้งเตือนล่าสุด
              </Typography>

              {unreadNotificationCount >
                0 && (
                <Chip
                  label={`${unreadNotificationCount} ยังไม่ได้อ่าน`}
                  size="small"
                  sx={{
                    height:
                      '25px',

                    backgroundColor:
                      supervisorTheme.soft,

                    color:
                      supervisorTheme.primary,

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

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                marginTop:
                  '4px',
              }}
            >
              ข่าวสารและรายการที่เกี่ยวข้องกับการอนุมัติ
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            onClick={() =>
              navigate(
                '/supervisor/notifications',
              )
            }
            sx={{
              height:
                '40px',

              padding:
                '0 16px',

              color:
                supervisorTheme.primary,

              borderColor:
                supervisorTheme.border,

              borderRadius:
                '8px',

              fontSize:
                '12px',

              fontWeight:
                700,

              textTransform:
                'none',

              '&:hover': {
                backgroundColor:
                  supervisorTheme.soft,

                borderColor:
                  supervisorTheme.primary,
              },
            }}
          >
            ดูทั้งหมด
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
                    minHeight:
                      '82px',

                    padding:
                      '16px 24px',

                    display:
                      'flex',

                    alignItems:
                      'flex-start',

                    gap:
                      '13px',

                    cursor:
                      'pointer',

                    backgroundColor:
                      notification.isRead
                        ? '#FFFFFF'
                        : '#FAF5FF',

                    borderLeft:
                      notification.isRead
                        ? '4px solid transparent'
                        : `4px solid ${supervisorTheme.primary}`,

                    borderBottom:
                      index ===
                      recentNotifications.length -
                        1
                        ? 'none'
                        : '1px solid #EEF0F3',

                    '&:hover': {
                      backgroundColor:
                        notification.isRead
                          ? '#FAFAFC'
                          : supervisorTheme.soft,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width:
                        '9px',

                      height:
                        '9px',

                      flexShrink:
                        0,

                      marginTop:
                        '6px',

                      backgroundColor:
                        notification.isRead
                          ? '#CBD5E1'
                          : supervisorTheme.primary,

                      borderRadius:
                        '50%',
                    }}
                  />

                  <Box
                    sx={{
                      flex:
                        1,

                      minWidth:
                        0,
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '13px',

                        fontWeight:
                          notification.isRead
                            ? 700
                            : 800,
                      }}
                    >
                      {formatNotificationTitle(
                        notification.title,
                      )}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#475569',

                        fontSize:
                          '12px',

                        lineHeight:
                          1.6,

                        marginTop:
                          '4px',
                      }}
                    >
                      {formatNotificationMessage(
                        notification.message,
                      )}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#94A3B8',

                        fontSize:
                          '10px',

                        marginTop:
                          '6px',
                      }}
                    >
                      {formatDateTime(
                        notification.createdAt,
                      )}
                    </Typography>
                  </Box>

                  {!notification.isRead && (
                    <Chip
                      label="ใหม่"
                      size="small"
                      sx={{
                        height:
                          '24px',

                        flexShrink:
                          0,

                        backgroundColor:
                          supervisorTheme.soft,

                        color:
                          supervisorTheme.primary,

                        borderRadius:
                          '999px',

                        fontSize:
                          '9px',

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
                '170px',

              padding:
                '30px 24px',

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
                  '50px',

                height:
                  '50px',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                backgroundColor:
                  supervisorTheme.soft,

                color:
                  supervisorTheme.primary,

                borderRadius:
                  '50%',

                fontSize:
                  '18px',

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
                  '15px',

                fontWeight:
                  800,

                marginTop:
                  '12px',
              }}
            >
              ไม่มีการแจ้งเตือน
            </Typography>

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                marginTop:
                  '4px',
              }}
            >
              การแจ้งเตือนใหม่จะแสดงในส่วนนี้
            </Typography>
          </Box>
        )}
      </Paper>
    </SupervisorLayout>
  );
}

export default SupervisorDashboardPage;
