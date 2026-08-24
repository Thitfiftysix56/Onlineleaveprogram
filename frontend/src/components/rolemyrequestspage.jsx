import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import RequestNumberText from './requestnumbertext.jsx';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  cancelLeaveRequest,
  deleteLeaveDraft,
  getMyLeaveRequests,
} from '../api/leave-service.js';

const legacyRequestSamples = [
  {
    id: 1,
    requestNo: null,
    leaveType: 'ลาพักร้อน',
    startDate: '2026-08-18',
    endDate: '2026-08-19',
    leaveDays: 2,
    reason: 'ธุระส่วนตัว',
    status: 'draft',
    submittedAt: null,
  },
  {
    id: 2,
    requestNo: 'LR-20260720-0013',
    leaveType: 'ลาพักร้อน',
    startDate: '2026-07-30',
    endDate: '2026-07-31',
    leaveDays: 2,
    reason: 'ธุระครอบครัว',
    status: 'pending',
    submittedAt: '2026-07-20T14:05:00',
  },
  {
    id: 3,
    requestNo: 'LR-20260715-0009',
    leaveType: 'ลาป่วย',
    startDate: '2026-07-16',
    endDate: '2026-07-16',
    leaveDays: 1,
    reason: 'นัดพบแพทย์',
    status: 'approved',
    submittedAt: '2026-07-15T09:20:00',
  },
  {
    id: 4,
    requestNo: 'LR-20260710-0006',
    leaveType: 'ลากิจ',
    startDate: '2026-07-11',
    endDate: '2026-07-11',
    leaveDays: 1,
    reason: 'มีธุระส่วนตัวเร่งด่วน',
    status: 'rejected',
    submittedAt: '2026-07-10T10:40:00',
  },
  {
    id: 5,
    requestNo: 'LR-20260625-0003',
    leaveType: 'ลาพักร้อน',
    startDate: '2026-06-29',
    endDate: '2026-06-30',
    leaveDays: 2,
    reason: 'กิจกรรมครอบครัว',
    status: 'cancelled',
    submittedAt: '2026-06-25T13:15:00',
  },
  {
    id: 6,
    requestNo: 'LR-20260518-0001',
    leaveType: 'ลาป่วย',
    startDate: '2026-05-19',
    endDate: '2026-05-21',
    leaveDays: 3,
    reason: 'ป่วยและพักรักษาตัว',
    status: 'approved',
    submittedAt: '2026-05-18T08:50:00',
  },
];

const statusLabels = {
  draft: 'แบบร่าง',
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

const formatDate = (
  dateString,
) => {
  if (!dateString) {
    return '-';
  }

  const normalizedDate =
    String(dateString)
      .trim()
      .slice(0, 10);

  const match =
    normalizedDate.match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (!match) {
    return dateString;
  }

  const [, year, month, day] =
    match;

  return `${day}/${month}/${year}`;
};

const formatDateRange = (
  startDate,
  endDate,
) => {
  if (!startDate && !endDate) {
    return '-';
  }

  if (
    startDate &&
    endDate &&
    startDate === endDate
  ) {
    return formatDate(
      startDate,
    );
  }

  return `${formatDate(
    startDate,
  )} - ${formatDate(endDate)}`;
};

const formatDays = (
  value,
) => {
  const days =
    Number(value) || 0;

  return Number.isInteger(days)
    ? String(days)
    : days
        .toFixed(2)
        .replace(/\.?0+$/, '');
};

function RoleMyRequestsPage({
  LayoutComponent,
  theme,
  visualCalibration = true,
}) {
  void legacyRequestSamples;
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const pathRole =
    location.pathname.split(
      '/',
    )[1];

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(pathRole)
    ? pathRole
    : 'employee';

  const [
    requests,
    setRequests,
  ] = useState(
    [],
  );

  useEffect(() => {
    let active = true;

    getMyLeaveRequests()
      .then((leaveRequests) => {
        if (active) setRequests(leaveRequests);
      })
      .catch((error) => {
        if (active) {
          setMessage({
            severity: 'error',
            text: error.response?.data?.message || 'ไม่สามารถโหลดคำขอลาได้',
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');

  const [
    yearFilter,
    setYearFilter,
  ] = useState('all');

  const [
    message,
    setMessage,
  ] = useState(null);

  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuRequest, setActionMenuRequest] = useState(null);

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState(null);

  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(5);

  const availableYears =
    useMemo(() => {
      const years =
        requests
          .map(
            (request) =>
              String(
                request.startDate ||
                  '',
              ).slice(0, 4),
          )
          .filter(Boolean);

      return [
        ...new Set(years),
      ].sort(
        (
          firstYear,
          secondYear,
        ) =>
          Number(secondYear) -
          Number(firstYear),
      );
    }, [requests]);

  const filteredRequests =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return requests.filter(
        (request) => {
          const requestNumber =
            request.requestNo ||
            `แบบร่าง-${request.id}`;

          const leaveType =
            String(
              request.leaveType ||
                '',
            ).toLowerCase();

          const reason =
            String(
              request.reason ||
                '',
            ).toLowerCase();

          const status =
            String(
              request.status ||
                '',
            ).toLowerCase();

          const statusLabel =
            String(
              statusLabels[
                status
              ] || '',
            ).toLowerCase();

          const matchesSearch =
            !keyword ||
            String(
              requestNumber,
            )
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            leaveType.includes(
              keyword,
            ) ||
            reason.includes(
              keyword,
            ) ||
            status.includes(
              keyword,
            ) ||
            statusLabel.includes(
              keyword,
            );

          const matchesStatus =
            statusFilter ===
              'all' ||
            status ===
              statusFilter;

          const matchesYear =
            yearFilter ===
              'all' ||
            String(
              request.startDate ||
                '',
            ).startsWith(
              yearFilter,
            );

          return (
            matchesSearch &&
            matchesStatus &&
            matchesYear
          );
        },
      );
    }, [
      requests,
      searchText,
      statusFilter,
      yearFilter,
    ]);

  const paginatedRequests =
    useMemo(() => {
      const firstRow =
        page * rowsPerPage;

      const lastRow =
        firstRow +
        rowsPerPage;

      return filteredRequests.slice(
        firstRow,
        lastRow,
      );
    }, [
      filteredRequests,
      page,
      rowsPerPage,
    ]);

  const summary =
    useMemo(
      () => ({
        total:
          requests.length,

        draft:
          requests.filter(
            (request) =>
              request.status ===
              'draft',
          ).length,

        pending:
          requests.filter(
            (request) =>
              request.status ===
              'pending',
          ).length,

        approved:
          requests.filter(
            (request) =>
              request.status ===
              'approved',
          ).length,

        rejected:
          requests.filter(
            (request) =>
              request.status ===
              'rejected',
          ).length,

        cancelled:
          requests.filter(
            (request) =>
              request.status ===
              'cancelled',
          ).length,
      }),
      [requests],
    );

  const getStatusStyle = (
    status,
  ) => {
    const statusStyles = {
      draft: {
        backgroundColor:
          '#F3F4F6',
        color:
          '#4B5563',
      },

      pending: {
        backgroundColor:
          '#FEF3C7',
        color:
          '#B45309',
      },

      approved: {
        backgroundColor:
          '#DCFCE7',
        color:
          '#15803D',
      },

      rejected: {
        backgroundColor:
          '#FEE2E2',
        color:
          '#B91C1C',
      },

      cancelled: {
        backgroundColor:
          '#E5E7EB',
        color:
          '#6B7280',
      },
    };

    return (
      statusStyles[status] || {
        backgroundColor:
          '#F3F4F6',
        color:
          '#4B5563',
      }
    );
  };

  const handleSearchChange = (
    value,
  ) => {
    setSearchText(value);
    setPage(0);
    setMessage(null);
  };

  const handleStatusFilterChange =
    (value) => {
      setStatusFilter(value);
      setPage(0);
      setMessage(null);
    };

  const handleYearFilterChange =
    (value) => {
      setYearFilter(value);
      setPage(0);
      setMessage(null);
    };

  const handleClearFilters =
    () => {
      setSearchText('');
      setStatusFilter('all');
      setYearFilter('all');
      setPage(0);
      setMessage(null);
    };

  const handleViewRequest = (
    request,
  ) => {
    navigate(
      `/${currentRole}/my-requests/${request.id}`,
    );
  };

  const openActionMenu = (event, request) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActionMenuRequest(request);
  };

  const closeActionMenu = () => {
    setActionMenuAnchor(null);
    setActionMenuRequest(null);
  };

  const handleEditDraft = (
    request,
  ) => {
    navigate(
      `/${currentRole}/leave-request?edit=${request.id}`,
    );
  };

  const openConfirmation = (
    action,
    request,
  ) => {
    setConfirmAction(
      action,
    );

    setSelectedRequest(
      request,
    );

    setMessage(null);
  };

  const closeConfirmation =
    () => {
      setConfirmAction(null);
      setSelectedRequest(null);
    };

  const handleConfirmAction =
    async () => {
      if (
        !selectedRequest ||
        !confirmAction
      ) {
        return;
      }

      if (
        confirmAction ===
          'delete' &&
        selectedRequest.status ===
          'draft'
      ) {
        try {
          await deleteLeaveDraft(selectedRequest.id);
        } catch (error) {
          setMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถลบแบบร่างได้' });
          closeConfirmation();
          return;
        }

        setRequests(
          (
            previousRequests,
          ) =>
            previousRequests.filter(
              (request) =>
                request.id !==
                selectedRequest.id,
            ),
        );

        setMessage({
          severity:
            'success',

          text:
            `ลบแบบร่าง #${selectedRequest.id} เรียบร้อยแล้ว`,
        });
      }

      if (
        confirmAction ===
          'cancel' &&
        selectedRequest.status ===
          'pending'
      ) {
        try {
          await cancelLeaveRequest(selectedRequest.id);
        } catch (error) {
          setMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถยกเลิกคำขอลาได้' });
          closeConfirmation();
          return;
        }

        setRequests(
          (
            previousRequests,
          ) =>
            previousRequests.map(
              (request) =>
                request.id ===
                selectedRequest.id
                  ? {
                      ...request,
                      status:
                        'cancelled',
                    }
                  : request,
            ),
        );

        setMessage({
          severity:
            'success',

          text:
            `ยกเลิกคำขอ ${
              selectedRequest.requestNo ||
              `#${selectedRequest.id}`
            } เรียบร้อยแล้ว`,
        });
      }

      closeConfirmation();
      setPage(0);

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });
    };

  const handlePageChange = (
    event,
    newPage,
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange =
    (event) => {
      setRowsPerPage(
        Number(
          event.target.value,
        ),
      );

      setPage(0);
    };

  const summaryCards = [
    {
      title:
        'คำขอทั้งหมด',

      value:
        summary.total,

      backgroundColor:
        theme.soft,

      color:
        theme.primary,
    },

    {
      title:
        'แบบร่าง',

      value:
        summary.draft,

      backgroundColor:
        '#F3F4F6',

      color:
        '#4B5563',
    },

    {
      title:
        'รออนุมัติ',

      value:
        summary.pending,

      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    },

    {
      title:
        'อนุมัติแล้ว',

      value:
        summary.approved,

      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },
  ];

  const confirmationTitle =
    confirmAction ===
    'delete'
      ? 'ยืนยันการลบแบบร่าง'
      : 'ยืนยันการยกเลิกคำขอ';

  const confirmationDescription =
    confirmAction ===
    'delete'
      ? 'ต้องการลบแบบร่างนี้ใช่หรือไม่?'
      : 'ต้องการยกเลิกคำขอลาที่กำลังรออนุมัตินี้ใช่หรือไม่?';

  const confirmationButtonText =
    confirmAction ===
    'delete'
      ? 'ลบแบบร่าง'
      : 'ยกเลิกคำขอ';

  return (
    <LayoutComponent
      activeMenu="My Requests"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: '16px',
          marginBottom:
            '24px',
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
          คำขอลาของฉัน
        </Typography>
      </Box>

      {message && (
        <Alert
          severity={
            message.severity
          }
          onClose={() =>
            setMessage(null)
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {message.text}
        </Alert>
      )}

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              'repeat(2, minmax(0, 1fr))',

            md:
              'repeat(4, minmax(0, 1fr))',
          },

          gap: {
            xs:
              '12px',

            sm:
              '16px',
          },

          marginBottom:
            '22px',
          ...(visualCalibration && {
            gap: 0,
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6EAF0',
            borderRadius: '12px',
          }),
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
                  '112px',

                padding:
                  '16px 18px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '12px',

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '14px',
                ...(visualCalibration && {
                  minHeight: '80px',
                  padding: '13px 16px',
                  border: 'none',
                  borderRight: '1px solid #EBEEF2',
                  borderRadius: 0,
                  boxShadow: 'none',
                }),
              }}
            >
              <Box
                sx={{
                  width:
                    '48px',

                  height:
                    '48px',

                  flexShrink:
                    0,

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
                    '12px',

                  fontSize:
                    '20px',
                  ...(visualCalibration && {
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }),

                  fontWeight:
                    800,
                }}
              >
                {
                  card.value
                }
              </Box>

              <Box
                sx={{
                  minWidth:
                    0,
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#6B7280',

                    fontSize:
                      '12px',

                    fontWeight:
                      600,
                  }}
                >
                  สถานะคำขอ
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#111827',

                    fontSize:
                      '15px',

                    fontWeight:
                      800,

                    marginTop:
                      '2px',
                  }}
                >
                  {
                    card.title
                  }
                </Typography>
              </Box>
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
            '14px',

          overflow:
            'hidden',
        }}
      >
        <Box
          sx={{
            padding: {
              xs:
                '18px',

              sm:
                '20px 22px',
            },

            borderBottom:
              '1px solid #E5E7EB',
          }}
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
                '6px',
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
              รายการคำขอลา
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '13px',

                fontWeight:
                  500,
              }}
            >
              แสดง{' '}
              {
                filteredRequests.length
              }{' '}
              จาก{' '}
              {
                requests.length
              }{' '}
              รายการ
            </Typography>
          </Box>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'minmax(260px, 1.6fr) minmax(160px, 0.65fr) minmax(140px, 0.55fr) auto',
              },

              gap:
                '12px',

              marginTop:
                '18px',
            }}
          >
            <TextField fullWidth size="small" label="ค้นหาคำขอ" placeholder="เลขที่คำขอ ประเภทการลา หรือเหตุผล" value={searchText} onChange={(event) => handleSearchChange(event.target.value)} sx={{ '& .MuiOutlinedInput-root': { height: '46px', borderRadius: '9px', '&.Mui-focused fieldset': { borderColor: theme.primary } }, '& .MuiInputLabel-root.Mui-focused': { color: theme.primary } }} />
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel id="request-status-filter-label">
                สถานะ
              </InputLabel>

              <Select
                labelId="request-status-filter-label"
                value={
                  statusFilter
                }
                label="สถานะ"
                onChange={(
                  event,
                ) =>
                  handleStatusFilterChange(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '46px',

                  borderRadius:
                    '9px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                <MenuItem value="all">
                  ทุกสถานะ
                </MenuItem>

                <MenuItem value="draft">
                  แบบร่าง
                </MenuItem>

                <MenuItem value="pending">
                  รออนุมัติ
                </MenuItem>

                <MenuItem value="approved">
                  อนุมัติแล้ว
                </MenuItem>

                <MenuItem value="rejected">
                  ปฏิเสธแล้ว
                </MenuItem>

                <MenuItem value="cancelled">
                  ยกเลิกแล้ว
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel id="request-year-filter-label">
                ปี
              </InputLabel>

              <Select
                labelId="request-year-filter-label"
                value={
                  yearFilter
                }
                label="ปี"
                onChange={(
                  event,
                ) =>
                  handleYearFilterChange(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '46px',

                  borderRadius:
                    '9px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                <MenuItem value="all">
                  ทุกปี
                </MenuItem>

                {availableYears.map(
                  (year) => (
                    <MenuItem
                      key={
                        year
                      }
                      value={
                        year
                      }
                    >
                      {
                        year
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth:
                  '116px',

                height:
                  '46px',

                padding:
                  '0 16px',

                color:
                  '#4B5563',

                borderColor:
                  '#D1D5DB',

                borderRadius:
                  '9px',

                fontSize:
                  '13px',

                fontWeight:
                  700,

                whiteSpace:
                  'nowrap',

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#F9FAFB',

                  borderColor:
                    '#9CA3AF',
                },
              }}
            >
              ล้างตัวกรอง
            </Button>
          </Box>
        </Box>

        {filteredRequests.length >
        0 ? (
          <>
            <Box
              sx={{
                width:
                  '100%',

                overflowX:
                  'auto',
              }}
            >
              <Table
                sx={{
                  minWidth:
                    theme.primary === '#2563EB' ? '780px' : '900px',
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        '#F8FAFC',
                    }}
                  >
                    {[
                      {
                        label:
                          'เลขที่คำขอ',

                        align:
                          'left',
                      },

                      {
                        label:
                          'ประเภทการลา',

                        align:
                          'left',
                      },

                      {
                        label:
                          'ช่วงวันที่',

                        align:
                          'left',
                      },

                      {
                        label:
                          'จำนวนวัน',

                        align:
                          'center',
                      },

                      {
                        label:
                          'สถานะ',

                        align:
                          'left',
                      },

                      {
                        label:
                          'การดำเนินการ',

                        align:
                          'right',
                      },
                    ].map(
                      (
                        heading,
                      ) => (
                        <TableCell
                          key={
                            heading.label
                          }
                          align={
                            heading.align
                          }
                          sx={{
                            padding:
                              '13px 18px',

                            color:
                              '#64748B',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {
                            heading.label
                          }
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedRequests.map(
                    (
                      request,
                    ) => {
                      const statusStyle =
                        getStatusStyle(
                          request.status,
                        );

                      const statusLabel =
                        statusLabels[
                          request
                            .status
                        ] ||
                        request.status ||
                        '-';

                      return (
                        <TableRow
                          key={
                            request.id
                          }
                          hover
                          tabIndex={0}
                          onClick={() => handleViewRequest(request)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleViewRequest(request);
                            }
                          }}
                          sx={{
                            cursor: 'pointer',
                            '&:focus-visible': {
                              outline: `2px solid ${theme.primary}`,
                              outlineOffset: -2,
                            },
                            '&:last-child td':
                              {
                                borderBottom:
                                  'none',
                              },

                            '&:hover':
                              {
                                backgroundColor:
                                  '#FAFBFD',
                              },
                          }}
                        >
                          <TableCell
                            sx={{
                              padding:
                                '16px 18px',

                              borderBottom:
                                '1px solid #EEF0F3',
                            }}
                          >
                            <Typography
                              sx={{
                                color:
                                  '#111827',

                                fontSize:
                                  '13px',

                                fontWeight:
                                  800,

                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              <RequestNumberText>
                                {request.requestNo || `แบบร่าง #${request.id}`}
                              </RequestNumberText>
                            </Typography>

                          </TableCell>

                          <TableCell
                            sx={{
                              padding:
                                '16px 18px',

                              color:
                                '#374151',

                              fontSize:
                                '13px',

                              fontWeight:
                                600,

                              whiteSpace:
                                'nowrap',

                              borderBottom:
                                '1px solid #EEF0F3',
                            }}
                          >
                            {request.leaveType ||
                              '-'}
                          </TableCell>

                          <TableCell
                            sx={{
                              padding:
                                '16px 18px',

                              color:
                                '#4B5563',

                              fontSize:
                                '12px',

                              fontWeight:
                                500,

                              whiteSpace:
                                'nowrap',

                              borderBottom:
                                '1px solid #EEF0F3',
                            }}
                          >
                            {formatDateRange(
                              request.startDate,
                              request.endDate,
                            )}
                          </TableCell>

                          <TableCell
                            align="center"
                            sx={{
                              padding:
                                '16px 18px',

                              color:
                                '#111827',

                              fontSize:
                                '13px',

                              fontWeight:
                                700,

                              whiteSpace:
                                'nowrap',

                              borderBottom:
                                '1px solid #EEF0F3',
                            }}
                          >
                            {formatDays(
                              request.leaveDays,
                            )}{' '}
                            วัน
                          </TableCell>

                          <TableCell
                            sx={{
                              padding:
                                '16px 18px',

                              borderBottom:
                                '1px solid #EEF0F3',
                            }}
                          >
                            <Chip
                              label={
                                statusLabel
                              }
                              size="small"
                              sx={{
                                minWidth:
                                  '86px',

                                height:
                                  '28px',

                                backgroundColor:
                                  statusStyle.backgroundColor,

                                color:
                                  statusStyle.color,

                                borderRadius:
                                  '999px',

                                fontSize:
                                  '11px',

                                fontWeight:
                                  700,

                                '& .MuiChip-label':
                                  {
                                    padding:
                                      '0 12px',
                                  },
                              }}
                            />
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              padding:
                                '16px 18px',

                              whiteSpace:
                                'nowrap',

                              borderBottom:
                                '1px solid #EEF0F3',
                            }}
                          >
                            <Box
                              sx={{
                                display:
                                  'flex',

                                justifyContent:
                                  'flex-end',

                                alignItems:
                                  'center',

                                gap:
                                  theme.primary === '#2563EB' ? '2px' : '7px',

                                flexWrap:
                                  theme.primary === '#2563EB' ? 'nowrap' : 'wrap',

                                '@media (max-width: 600px)': {
                                  justifyContent:
                                    'flex-start',
                                  gap:
                                    '4px',
                                },
                              }}
                            >
                              {['draft', 'pending'].includes(request.status) ? (
                                <IconButton
                                  type="button"
                                  size="small"
                                  aria-label="การดำเนินการ"
                                  aria-haspopup="menu"
                                  onClick={(event) => openActionMenu(event, request)}
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    color: '#64748B',
                                    borderRadius: '8px',
                                    '&:hover': { backgroundColor: theme.soft, color: theme.dark },
                                  }}
                                >
                                  <MoreVertRounded sx={{ fontSize: '20px' }} />
                                </IconButton>
                              ) : null}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </Box>

            <Menu
              anchorEl={actionMenuAnchor}
              open={Boolean(actionMenuAnchor && actionMenuRequest)}
              onClose={closeActionMenu}
              slotProps={{ paper: { sx: { minWidth: 140, borderRadius: '10px' } } }}
            >
              {actionMenuRequest?.status === 'draft' ? (
                <MenuItem
                  onClick={() => {
                    const request = actionMenuRequest;
                    closeActionMenu();
                    handleEditDraft(request);
                  }}
                >
                  แก้ไข
                </MenuItem>
              ) : null}
              {actionMenuRequest?.status === 'draft' ? (
                <MenuItem
                  onClick={() => {
                    const request = actionMenuRequest;
                    closeActionMenu();
                    openConfirmation('delete', request);
                  }}
                  sx={{ color: '#B42318' }}
                >
                  ลบ
                </MenuItem>
              ) : null}
              {actionMenuRequest?.status === 'pending' ? (
                <MenuItem
                  onClick={() => {
                    const request = actionMenuRequest;
                    closeActionMenu();
                    openConfirmation('cancel', request);
                  }}
                  sx={{ color: '#A16207' }}
                >
                  ยกเลิก
                </MenuItem>
              ) : null}
            </Menu>

            <TablePagination
              component="div"
              count={
                filteredRequests.length
              }
              page={
                page
              }
              onPageChange={
                handlePageChange
              }
              rowsPerPage={
                rowsPerPage
              }
              onRowsPerPageChange={
                handleRowsPerPageChange
              }
              rowsPerPageOptions={[
                5,
                10,
              ]}
              labelRowsPerPage="จำนวนรายการต่อหน้า:"
              labelDisplayedRows={({
                from,
                to,
                count,
              }) =>
                `${from}–${to} จาก ${count}`
              }
              sx={{
                borderTop:
                  '1px solid #E5E7EB',

                color:
                  '#4B5563',

                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                  {
                    fontSize:
                      '12px',
                  },
                '& .MuiTablePagination-toolbar': {
                  minHeight: '50px',
                  paddingInline: { xs: '10px', sm: '16px' },
                },
                '& .MuiTablePagination-actions .MuiIconButton-root': {
                  width: '32px',
                  height: '32px',
                  border: 'none',
                },
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              minHeight:
                '260px',

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
                  theme.soft,

                color:
                  theme.primary,

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
              ไม่พบคำขอลา
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
              ลองเปลี่ยนตัวกรองหรือล้างตัวกรองแล้วค้นหาอีกครั้ง
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                height:
                  '40px',

                marginTop:
                  '18px',

                padding:
                  '0 18px',

                color:
                  theme.primary,

                borderColor:
                  theme.primary,

                borderRadius:
                  '8px',

                fontSize:
                  '13px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    theme.soft,

                  borderColor:
                    theme.dark,
                },
              }}
            >
              ล้างตัวกรอง
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog
        open={Boolean(
          selectedRequest &&
            confirmAction,
        )}
        onClose={
          closeConfirmation
        }
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius:
                '14px',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color:
              '#111827',

            fontSize:
              '19px',

            fontWeight:
              800,

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          {
            confirmationTitle
          }
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '22px !important',
          }}
        >
          <Typography
            sx={{
              color:
                '#4B5563',

              fontSize:
                '14px',

              lineHeight:
                1.7,
            }}
          >
            {
              confirmationDescription
            }
          </Typography>

          {selectedRequest && (
            <Box
              sx={{
                padding:
                  '14px',

                marginTop:
                  '16px',

                backgroundColor:
                  '#F8FAFC',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '10px',
              }}
            >
              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '13px',

                  fontWeight:
                    800,
                }}
              >
                <RequestNumberText>
                  {selectedRequest.requestNo || `แบบร่าง #${selectedRequest.id}`}
                </RequestNumberText>
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '12px',

                  marginTop:
                    '5px',
                }}
              >
                {selectedRequest.leaveType ||
                  '-'}{' '}
                •{' '}
                {formatDateRange(
                  selectedRequest.startDate,
                  selectedRequest.endDate,
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '14px 22px 18px',

            borderTop:
              '1px solid #E5E7EB',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={
              closeConfirmation
            }
            sx={{
              minWidth:
                '84px',

              height:
                '40px',

              color:
                '#374151',

              borderColor:
                '#D1D5DB',

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
            กลับ
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={
              handleConfirmAction
            }
            sx={{
              minWidth:
                '118px',

              height:
                '40px',

              backgroundColor:
                '#DC2626',

              color:
                '#FFFFFF',

              borderRadius:
                '8px',

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
                  '#B91C1C',

                boxShadow:
                  'none',
              },
            }}
          >
            {
              confirmationButtonText
            }
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RoleMyRequestsPage;
