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
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import EmployeeLayout from '../../layouts/employeelayout.jsx';
import RequestNumberText from '../../components/requestnumbertext.jsx';
import {
  CompactSummaryCard,
} from '../../components/sharedvisualfoundation.jsx';
import DashboardLeaveBalance from '../../components/dashboardleavebalance.jsx';
import { DashboardTablePagination } from '../../components/shareduiprimitives.jsx';
import { getLeaveBalance, getMyLeaveRequests } from '../../api/leave-service.js';
import { getNotifications, markNotificationRead as markNotificationAsRead } from '../../api/notification-service.js';
import {
  formatNotificationMessage,
  formatNotificationTitle,
} from '../../utils/presentationformatter.js';

const normalizeStatus = (
  status,
) =>
  String(status || '')
    .trim()
    .toLowerCase();

const toNumber = (
  value,
) => {
  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : 0;
};

const formatDays = (
  value,
) => {
  const number =
    toNumber(value);

  return Number.isInteger(
    number,
  )
    ? String(number)
    : number
        .toFixed(2)
        .replace(
          /\.?0+$/,
          '',
        );
};

const getStatusLabel = (
  status,
) => {
  const normalizedStatus =
    normalizeStatus(status);

  const labels = {
    draft:
      'แบบร่าง',

    pending:
      'รออนุมัติ',

    approved:
      'อนุมัติแล้ว',

    rejected:
      'ปฏิเสธแล้ว',

    cancelled:
      'ยกเลิกแล้ว',
  };

  return (
    labels[
      normalizedStatus
    ] ||
    status ||
    '-'
  );
};

const getLeaveTypeLabel = (
  leaveType,
) => {
  const labels = {
    'Annual Leave':
      'ลาพักร้อน',

    'Sick Leave':
      'ลาป่วย',

    'Personal Leave':
      'ลากิจ',

    'Other Leave':
      'ลาอื่น ๆ',
  };

  return (
    labels[leaveType] ||
    leaveType ||
    '-'
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
      ).slice(
        0,
        4,
      ),
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
    new Date(
      dateValue,
    );

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

  const normalizedDate =
    String(
      dateString,
    )
      .trim()
      .slice(
        0,
        10,
      );

  const match =
    normalizedDate.match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (match) {
    const [
      ,
      year,
      month,
      day,
    ] = match;

    return `${day}/${month}/${year}`;
  }

  const date =
    new Date(
      dateString,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    );

  const month =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,
      '0',
    );

  const year =
    date.getFullYear();

  return `${day}/${month}/${year}`;
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

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      '0',
    );

  const month =
    String(
      date.getMonth() +
        1,
    ).padStart(
      2,
      '0',
    );

  const year =
    date.getFullYear();

  const hour =
    String(
      date.getHours(),
    ).padStart(
      2,
      '0',
    );

  const minute =
    String(
      date.getMinutes(),
    ).padStart(
      2,
      '0',
    );

  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const getStatusStyle = (
  status,
) => {
  const normalizedStatus =
    normalizeStatus(
      status,
    );

  const styles = {
    approved: {
      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },

    pending: {
      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    },

    rejected: {
      backgroundColor:
        '#FEE2E2',

      color:
        '#B91C1C',
    },

    cancelled: {
      backgroundColor:
        '#FEE2E2',

      color:
        '#B91C1C',
    },

    draft: {
      backgroundColor:
        '#DBEAFE',

      color:
        '#1D4ED8',
    },
  };

  return (
    styles[
      normalizedStatus
    ] ||
    styles.cancelled
  );
};

const _translateNotificationTitle = (
  title,
) => {
  const text =
    String(
      title || '',
    ).trim();

  const normalized =
    text.toLowerCase();

  const titleMap = {
    'leave request approved':
      'คำขอลาได้รับการอนุมัติ',

    'leave request rejected':
      'คำขอลาถูกปฏิเสธ',

    'leave request cancelled':
      'คำขอลาถูกยกเลิก',

    'leave request submitted':
      'ส่งคำขอลาเรียบร้อยแล้ว',

    'leave request updated':
      'คำขอลาได้รับการอัปเดต',

    'new leave request submitted':
      'มีการส่งคำขอลาใหม่',

    notification:
      'การแจ้งเตือน',
  };

  return (
    titleMap[
      normalized
    ] ||
    text ||
    'การแจ้งเตือน'
  );
};

const _translateNotificationMessage = (
  message,
) => {
  const text =
    String(
      message || '',
    ).trim();

  if (!text) {
    return '-';
  }

  let match =
    text.match(
      /^Your leave request (.+?) was approved\.?$/i,
    );

  if (match) {
    return `คำขอลา ${match[1]} ได้รับการอนุมัติแล้ว`;
  }

  match =
    text.match(
      /^Your leave request (.+?) was rejected\.?$/i,
    );

  if (match) {
    return `คำขอลา ${match[1]} ถูกปฏิเสธ`;
  }

  match =
    text.match(
      /^Your leave request (.+?) was cancelled\.?$/i,
    );

  if (match) {
    return `คำขอลา ${match[1]} ถูกยกเลิกแล้ว`;
  }

  match =
    text.match(
      /^Your leave request (.+?) was submitted\.?$/i,
    );

  if (match) {
    return `ส่งคำขอลา ${match[1]} เรียบร้อยแล้ว`;
  }

  match =
    text.match(
      /^Your leave request (.+?) was rejected\.\s*Reason:\s*(.+)$/i,
    );

  if (match) {
    return `คำขอลา ${match[1]} ถูกปฏิเสธ เหตุผล: ${match[2]}`;
  }

  match =
    text.match(
      /^Leave request (.+?) was approved\.?$/i,
    );

  if (match) {
    return `คำขอลา ${match[1]} ได้รับการอนุมัติแล้ว`;
  }

  match =
    text.match(
      /^Leave request (.+?) was rejected\.?$/i,
    );

  if (match) {
    return `คำขอลา ${match[1]} ถูกปฏิเสธ`;
  }

  return text;
};

const _calculateLeaveBalances = ({
  requests,
  entitlements,
  year,
}) =>
  entitlements.map(
    (
      entitlement,
    ) => {
      const leaveTypeId =
        Number(
          entitlement.leaveTypeId,
        );

      const pendingDays =
        requests
          .filter(
            (
              request,
            ) =>
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

  const [requestPage, setRequestPage] = useState(0);

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
    useCallback(async () => {
      const [requestData, balanceData, notificationData] = await Promise.all([
        getMyLeaveRequests(), getLeaveBalance(currentYear), getNotifications(),
      ]);
      /*
       * โหลดคำขอลาก่อน เพื่อให้ข้อมูล Entitlement
       * อัปเดตยอด Used จากรายการ Approved ก่อน
       * นำไปคำนวณสิทธิ์คงเหลือ
       */
      const employeeRequests =
        requestData
          .map(
            (
              request,
            ) => ({
              ...request,

              statusLabel:
                getStatusLabel(
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

      const calculatedBalances =
        (balanceData?.balances || []).map((balance) => ({ ...balance, year: balanceData.year, totalDays: balance.total, usedDays: balance.used, pendingDays: balance.pending, remainingDays: balance.remaining, availableDays: balance.available ?? Math.max(Number(balance.remaining || 0) - Number(balance.pending || 0), 0) }));

      const employeeNotifications =
        (notificationData?.notifications || []).map((notification) => ({ ...notification, isRead: Boolean(notification.read) })).sort(
          (
            firstNotification,
            secondNotification,
          ) =>
            new Date(
              secondNotification
                .createdAt ||
                0,
            ).getTime() -
            new Date(
              firstNotification
                .createdAt ||
                0,
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

    const handleStorageChange =
      (
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

  const annualBalance =
    useMemo(
      () =>
        leaveBalances.find(
          (
            balance,
          ) =>
            Number(
              balance.leaveTypeId,
            ) ===
              1 ||
            balance.leaveType ===
              'Annual Leave',
        ) ||
        null,
      [
        leaveBalances,
      ],
    );

  const sickBalance =
    useMemo(
      () =>
        leaveBalances.find(
          (
            balance,
          ) =>
            Number(
              balance.leaveTypeId,
            ) ===
              2 ||
            balance.leaveType ===
              'Sick Leave',
        ) ||
        null,
      [
        leaveBalances,
      ],
    );

  const pendingRequestCount =
    useMemo(
      () =>
        leaveRequests.filter(
          (
            request,
          ) =>
            normalizeStatus(
              request.status,
            ) ===
            'pending',
        ).length,
      [
        leaveRequests,
      ],
    );

  const draftRequestCount = useMemo(
    () => leaveRequests.filter(
      (request) => normalizeStatus(request.status) === 'draft',
    ).length,
    [leaveRequests],
  );

  const approvedRequestCount =
    useMemo(
      () =>
        leaveRequests.filter(
          (
            request,
          ) =>
            normalizeStatus(
              request.status,
            ) ===
              'approved',
        ).length,
      [
        leaveRequests,
      ],
    );

  const rejectedRequestCount = useMemo(
    () => leaveRequests.filter(
      (request) => normalizeStatus(request.status) === 'rejected',
    ).length,
    [leaveRequests],
  );

  const dashboardCardCandidates = [
    {
      title:
        'สิทธิ์ลาพักร้อน',

      value:
        `${formatDays(
          annualBalance
            ?.availableDays ||
            0,
        )} วัน`,

      backgroundColor:
        '#EFF6FF',

      borderColor:
        '#BFDBFE',

      color:
        '#2563EB',

      accent: 'info',
    },

    {
      title:
        'สิทธิ์ลาป่วย',

      value:
        `${formatDays(
          sickBalance
            ?.availableDays ||
            0,
        )} วัน`,

      backgroundColor:
        '#FFF1F2',

      borderColor:
        '#FECDD3',

      color:
        '#E11D48',

      accent: 'error',
    },

    {
      title:
        'คำขอรออนุมัติ',

      value:
        pendingRequestCount,

      backgroundColor:
        '#FFFBEB',

      borderColor:
        '#FDE68A',

      color:
        '#D97706',

      accent: 'warning',
    },

    {
      title:
        'คำขออนุมัติแล้ว',

      value:
        approvedRequestCount,

      backgroundColor:
        '#ECFDF5',

      borderColor:
        '#A7F3D0',

      color:
        '#059669',

      accent: 'success',
    },
  ];

  // Leave balances are rendered once by DashboardLeaveBalance below. These
  // four cards intentionally contain request counts only.
  const summaryCards = [
    {
      title: 'แบบร่าง',
      value: draftRequestCount,
      background: 'linear-gradient(135deg, #F1F5F9 0%, #FFFFFF 78%)',
      glowColor: 'rgba(100, 116, 139, 0.12)',
      valueColor: '#64748B',
    },
    {
      ...dashboardCardCandidates[2],
      title: 'รออนุมัติ',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFFCF1 68%, #FFFFFF 100%)',
      glowColor: 'rgba(250, 204, 21, 0.18)',
      valueColor: '#B45309',
    },
    {
      ...dashboardCardCandidates[3],
      title: 'อนุมัติแล้ว',
      background: 'linear-gradient(135deg, #EAFBF2 0%, #F6FEF9 68%, #FFFFFF 100%)',
      glowColor: 'rgba(74, 222, 128, 0.18)',
      valueColor: '#15803D',
    },
    {
      title: 'ไม่อนุมัติ',
      value: rejectedRequestCount,
      background: 'linear-gradient(135deg, #FFF0F1 0%, #FFF8F8 68%, #FFFFFF 100%)',
      glowColor: 'rgba(248, 113, 113, 0.16)',
      valueColor: '#DC2626',
    },
  ];

  const dashboardRequests =
    useMemo(
      () =>
        leaveRequests
          .filter(
            (
              request,
            ) =>
              normalizeStatus(
                request.status,
              ) !==
              'draft',
          ),
      [
        leaveRequests,
      ],
    );

  const recentRequests = useMemo(
    () => dashboardRequests.slice(requestPage * 5, requestPage * 5 + 5),
    [dashboardRequests, requestPage],
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

  const unreadNotificationCount =
    useMemo(
      () =>
        notifications.filter(
          (
            notification,
          ) =>
            !notification.isRead,
        ).length,
      [
        notifications,
      ],
    );

  const handleOpenRequest = (
    requestId,
  ) => {
    navigate(
      `/employee/my-requests/${requestId}`,
      { state: { returnTo: '/employee/dashboard', returnLabel: 'แดชบอร์ด' } },
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
      { state: { returnTo: '/employee/dashboard', returnLabel: 'แดชบอร์ด' } },
    );
  };

  return (
    <EmployeeLayout
      activeMenu="Dashboard"
      calibrated
    >
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
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {summaryCards.map((card) => (
          <CompactSummaryCard
            key={card.title}
            title={card.title}
            value={card.value}
            color={card.valueColor}
            background={card.background}
            glowColor={card.glowColor}
          />
        ))}
      </Box>

      <DashboardLeaveBalance />

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
              '14px',
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
              คำขอล่าสุด
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
                display: 'none',
                height:
                  '40px',

                padding:
                  '0 16px',

                color:
                  '#2563EB',

                borderColor:
                  '#BFDBFE',

                borderRadius:
                  '9px',

                fontSize:
                  '13px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#EFF6FF',

                  borderColor:
                    '#2563EB',
                },
              }}
            >
              ดูทั้งหมด
            </Button>

          </Box>
        </Box>

        {recentRequests.length >
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
                  '850px',
              }}
            >
              <Box
                sx={{
                  display:
                    'grid',

                  gridTemplateColumns:
                    '1.2fr 1.1fr 2fr 0.9fr 1fr',

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
                  'ประเภทการลา',
                  'ช่วงวันที่',
                  'จำนวนวัน',
                  'สถานะ',
                ].map(
                  (
                    heading,
                  ) => (
                    <Typography
                      key={
                        heading
                      }
                      sx={{
                        color:
                          '#64748B',

                        fontSize:
                          '12px',

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

              {recentRequests.map(
                (
                  request,
                ) => {
                  const status =
                    normalizeStatus(
                      request.status,
                    );

                  return (
                    <Box
                      key={
                        request.id
                      }
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenRequest(request.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleOpenRequest(request.id);
                        }
                      }}
                      sx={{
                        cursor: 'pointer',
                        display:
                          'grid',

                        gridTemplateColumns:
                          '1.2fr 1.1fr 2fr 0.9fr 1fr',

                        alignItems:
                          'center',

                        padding:
                          '15px 24px',

                        borderBottom:
                          '1px solid #EEF0F3',

                        '&:last-child':
                          {
                            borderBottom:
                              0,
                          },

                        '&:hover':
                          {
                            backgroundColor:
                              '#FAFBFD',
                          },
                        '&:focus-visible': {
                          outline: '2px solid #2563EB',
                          outlineOffset: -2,
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#2563EB',

                          fontSize:
                            '13px',

                          fontWeight:
                            700,

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        <RequestNumberText>
                          {request.requestNo || `#${request.id}`}
                        </RequestNumberText>
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#111827',

                          fontSize:
                            '13px',

                          fontWeight:
                            600,
                        }}
                      >
                        {getLeaveTypeLabel(
                          request.leaveType,
                        )}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#4B5563',

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
                            '#374151',

                          fontSize:
                            '13px',

                          fontWeight:
                            600,
                        }}
                      >
                        {formatDays(
                          request.leaveDays,
                        )}{' '}
                        วัน
                      </Typography>

                      <Box>
                        <Chip
                          label={
                            getStatusLabel(
                              status,
                            )
                          }
                          size="small"
                          sx={{
                            ...getStatusStyle(
                              status,
                            ),

                            minWidth:
                              '86px',

                            height:
                              '28px',

                            borderRadius:
                              '999px',

                            fontSize:
                              '11px',

                            fontWeight:
                              700,
                          }}
                        />
                      </Box>

                    </Box>
                  );
                },
              )}
            </Box>
          </Box>
          <DashboardTablePagination
            count={dashboardRequests.length}
            page={requestPage}
            onPageChange={(_, nextPage) => setRequestPage(nextPage)}
          />
          </>
        ) : (
          <Box
            sx={{
              minHeight:
                '210px',

              padding:
                '34px 24px',

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
                  '56px',

                height:
                  '56px',

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
                  '17px',

                fontWeight:
                  800,

                marginTop:
                  '14px',
              }}
            >
              ยังไม่มีคำขอลา
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '13px',

                marginTop:
                  '5px',
              }}
            >
              คำขอลาที่ส่งแล้วจะแสดงที่นี่
            </Typography>

            <Button
              type="button"
              variant="contained"
              startIcon={<AddRoundedIcon sx={{ fontSize: 19 }} />}
              onClick={() =>
                navigate(
                  '/employee/leave-request',
                  { state: { returnTo: '/employee/dashboard' } },
                )
              }
              sx={{
                display: 'none',
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
                  '9px',

                fontSize:
                  '13px',

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
              สร้างคำขอลา
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
            '14px',

          overflow:
            'hidden',

          display:
            'none',
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
                    600,
                }}
              >
                การแจ้งเตือนล่าสุด
              </Typography>

              {unreadNotificationCount >
                0 && (
                <Chip
                  label={`ยังไม่ได้อ่าน ${unreadNotificationCount} รายการ`}
                  size="small"
                  sx={{
                    backgroundColor:
                      '#FEE2E2',

                    color:
                      '#B91C1C',

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
                  '#6B7280',

                fontSize:
                  '13px',

                marginTop:
                  '3px',
              }}
            >
              อัปเดตเกี่ยวกับคำขอลาของคุณ
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
                '#BFDBFE',

              borderRadius:
                '9px',

              fontSize:
                '13px',

              fontWeight:
                700,

              textTransform:
                'none',

              '&:hover': {
                backgroundColor:
                  '#EFF6FF',

                borderColor:
                  '#2563EB',
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
                    padding:
                      '17px 24px',

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

                    '&:hover':
                      {
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
                        '9px',

                      height:
                        '9px',

                      flexShrink:
                        0,

                      marginTop:
                        '7px',

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
                      <RequestNumberText>
                        {formatNotificationTitle(notification.title)}
                      </RequestNumberText>
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
                      label="ใหม่"
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
              ยังไม่มีการแจ้งเตือน
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
              การอัปเดตเกี่ยวกับคำขอลาจะแสดงที่นี่
            </Typography>
          </Box>
        )}
      </Paper>
    </EmployeeLayout>
  );
}

export default EmployeeDashboardPage;
