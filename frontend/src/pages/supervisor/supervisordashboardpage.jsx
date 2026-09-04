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
import AddRounded from '@mui/icons-material/AddRounded';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import RequestNumberText from '../../components/requestnumbertext.jsx';
import { CompactSummaryCard } from '../../components/sharedvisualfoundation.jsx';
import DashboardLeaveBalance from '../../components/dashboardleavebalance.jsx';
import { DashboardTablePagination } from '../../components/shareduiprimitives.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

import { getTeamReport } from '../../api/leave-service.js';
import { getNotifications, markNotificationRead as markNotificationAsRead } from '../../api/notification-service.js';
import {
  formatNotificationMessage,
  formatNotificationTitle,
} from '../../utils/presentationformatter.js';

const supervisorTheme = roleAccentTokens.supervisor;

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

  const [requestPage, setRequestPage] = useState(0);

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
        pendingRequests.slice(requestPage * 5, requestPage * 5 + 5),
      [
        pendingRequests,
        requestPage,
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
      gradient:
        'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 45%, #FEF3C7 100%)',
      glowColor:
        'rgba(245, 158, 11, 0.16)',
      valueColor:
        '#B45309',
    },

    {
      title:
        'อนุมัติแล้ว',
      value:
        approvedRequestCount,
      description:
        `รายการในปี ${currentYear}`,
      gradient:
        'linear-gradient(135deg, #FFFFFF 0%, #F6FEF9 45%, #DCFCE7 100%)',
      glowColor:
        'rgba(34, 197, 94, 0.14)',
      valueColor:
        '#15803D',
    },

    {
      title:
        'ปฏิเสธแล้ว',
      value:
        rejectedRequestCount,
      description:
        `รายการในปี ${currentYear}`,
      gradient:
        'linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 45%, #FEE2E2 100%)',
      glowColor:
        'rgba(239, 68, 68, 0.13)',
      valueColor:
        '#DC2626',
    },

    {
      title:
        'ยังไม่ได้อ่าน',
      value:
        unreadNotificationCount,
      description:
        'การแจ้งเตือนใหม่',
      gradient:
        'linear-gradient(135deg, #FFFFFF 0%, #FAF8FF 45%, #EDE9FE 100%)',
      glowColor:
        'rgba(124, 58, 237, 0.15)',
      valueColor:
        '#2563EB',
    },
  ];

  const handleOpenRequest = (
    request,
  ) => {
    const requestId =
      Number(request?.id);

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0
    ) {
      return;
    }

    navigate(
      `/supervisor/approval/${requestId}`,
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button type="button" variant="contained" startIcon={<AddRounded />} onClick={() => navigate('/supervisor/leave-request', { state: { returnTo: '/supervisor/dashboard' } })} sx={{ height: 40, borderRadius: '9px', backgroundColor: '#2563EB', boxShadow: 'none', fontSize: '13px', fontWeight: 800, '&:hover': { backgroundColor: '#1D4ED8', boxShadow: 'none' } }}>สร้างคำขอลา</Button>
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

            md:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '16px',

          marginBottom:
            '16px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <CompactSummaryCard
              key={card.title}
              title={card.title}
              value={card.value}
              color={card.valueColor}
              background={card.gradient}
              glowColor={card.glowColor}
            />
          ),
        )}
      </Box>

      <DashboardLeaveBalance />

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
                  600,
              }}
            >
              คำขอลาที่รออนุมัติ
            </Typography>

            <Typography
              sx={{
                display:
                  'none',
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
              display:
                'none',
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
          <>
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
                    '1.2fr 1.5fr 1.2fr 1.7fr 0.8fr',

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
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenRequest(request)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenRequest(request);
                      }
                    }}
                    sx={{
                      display:
                        'grid',

                      gridTemplateColumns:
                        '1.2fr 1.5fr 1.2fr 1.7fr 0.8fr',
                      cursor: 'pointer',

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

                  </Box>
                ),
              )}
            </Box>
          </Box>
          <DashboardTablePagination
            count={pendingRequests.length}
            page={requestPage}
            onPageChange={(_, nextPage) => setRequestPage(nextPage)}
          />
          </>
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
          display:
            'none',

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
                    600,
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
                      <RequestNumberText>
                        {formatNotificationTitle(notification.title)}
                      </RequestNumberText>
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
                      <RequestNumberText>
                        {formatNotificationMessage(notification.message)}
                      </RequestNumberText>
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
