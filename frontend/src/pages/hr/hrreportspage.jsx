import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  CalendarMonthRounded,
} from '@mui/icons-material';

import {
  useNavigate,
} from 'react-router-dom';

import HRLayout from '../../layouts/hrlayout.jsx';
import api from '../../api/axios.js';

import {
  leaveRequestStorageKey,
} from '../../utils/leaverequeststorage.js';

const theme = {
  primary: '#059669',
  dark: '#047857',
  soft: '#ECFDF5',
  border: '#A7F3D0',
};

/* =========================
   Translation
========================= */

const translateLeaveType = (
  value,
) => {
  const labels = {
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

    'Other Leave':
      'ลาอื่น ๆ',

    Other:
      'ลาอื่น ๆ',
  };

  return (
    labels[value] ||
    value ||
    '-'
  );
};

const translateStatus = (
  status,
) => {
  const labels = {
    draft:
      'ฉบับร่าง',

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
      String(
        status || '',
      ).toLowerCase()
    ] ||
    status ||
    '-'
  );
};

const getStatusStyle = (
  status,
) => {
  const normalizedStatus =
    String(
      status || '',
    ).toLowerCase();

  const styles = {
    draft: {
      backgroundColor:
        '#F1F5F9',

      color:
        '#64748B',
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
        '#64748B',
    },
  };

  return (
    styles[
      normalizedStatus
    ] || {
      backgroundColor:
        '#F1F5F9',

      color:
        '#64748B',
    }
  );
};

/* =========================
   Date
========================= */

const normalizeDateValue = (
  value,
) => {
  const text =
    String(value || '');

  const match =
    text.match(
      /^\d{4}-\d{2}-\d{2}/,
    );

  return match
    ? match[0]
    : '';
};

const formatDate = (
  value,
) => {
  const date =
    normalizeDateValue(
      value,
    );

  if (!date) {
    return '-';
  }

  const [
    year,
    month,
    day,
  ] = date.split('-');

  return `${day}/${month}/${year}`;
};

const formatDateRange = (
  startDate,
  endDate,
) => {
  const start =
    normalizeDateValue(
      startDate,
    );

  const end =
    normalizeDateValue(
      endDate,
    );

  if (!start && !end) {
    return '-';
  }

  if (
    !end ||
    start === end
  ) {
    return formatDate(
      start,
    );
  }

  return `${formatDate(
    start,
  )} - ${formatDate(
    end,
  )}`;
};

/* =========================
   Thai Date Field
========================= */

function ThaiDateField({
  label,
  value,
  onChange,
}) {
  return (
    <Box
      sx={{
        position:
          'relative',
      }}
    >
      <TextField
        fullWidth
        label={label}
        value={
          value
            ? formatDate(
                value,
              )
            : ''
        }
        placeholder="วว/ดด/ปปปป"
        slotProps={{
          input: {
            readOnly: true,

            endAdornment: (
              <InputAdornment position="end">
                <CalendarMonthRounded
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '20px',
                  }}
                />
              </InputAdornment>
            ),
          },

          inputLabel: {
            shrink: true,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root':
            {
              height:
                '48px',

              borderRadius:
                '9px',

              '&.Mui-focused fieldset':
                {
                  borderColor:
                    theme.primary,
                },
            },

          '& .MuiInputLabel-root.Mui-focused':
            {
              color:
                theme.primary,
            },

          '& .MuiInputBase-input::placeholder':
            {
              opacity: 1,

              color:
                '#64748B',
            },
        }}
      />

      <input
        type="date"
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        style={{
          position:
            'absolute',

          inset: 0,

          width:
            '100%',

          height:
            '100%',

          opacity: 0,

          cursor:
            'pointer',
        }}
      />
    </Box>
  );
}

/* =========================
   Normalize Request
========================= */

const normalizeRequest = (
  request,
) => {
  const id =
    request.id ??
    request.leaveRequestId ??
    request.leave_request_id ??
    request.requestId;

  const employeeName =
    request.employeeName ||
    request.employee_name ||
    request.employee?.fullName ||
    request.employee?.name ||
    [
      request.firstName ||
        request.first_name,
      request.lastName ||
        request.last_name,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    '-';

  const employeeCode =
    request.employeeCode ||
    request.employee_code ||
    request.employee?.employeeCode ||
    request.employee?.code ||
    request.employeeId ||
    request.employee_id ||
    '-';

  const leaveType =
    request.leaveType ||
    request.leave_type ||
    request.leaveTypeName ||
    request.leave_type_name ||
    request.leaveType?.name ||
    '-';

  return {
    id,

    requestNo:
      request.requestNo ||
      request.request_no ||
      request.referenceNo ||
      request.reference_no ||
      (
        id
          ? `#${id}`
          : '-'
      ),

    employeeName,

    employeeCode:
      String(
        employeeCode,
      ),

    department:
      request.department ||
      request.departmentName ||
      request.department_name ||
      request.employee?.department ||
      '-',

    leaveTypeId:
      request.leaveTypeId ??
      request.leave_type_id ??
      null,

    leaveType:
      typeof leaveType ===
      'string'
        ? leaveType
        : leaveType?.name ||
          '-',

    startDate:
      normalizeDateValue(
        request.startDate ||
          request.start_date,
      ),

    endDate:
      normalizeDateValue(
        request.endDate ||
          request.end_date,
      ),

    leaveDays:
      Number(
        request.leaveDays ??
          request.leave_days ??
          request.totalDays ??
          0,
      ) || 0,

    status:
      String(
        request.status ||
          'draft',
      ).toLowerCase(),

    approver:
      request.approver ||
      request.approverName ||
      request.approver_name ||
      request.supervisorName ||
      request.supervisor_name ||
      '-',
  };
};

/* =========================
   Response
========================= */

const getResponseRequests = (
  response,
) => {
  const data =
    response?.data?.data;

  if (
    Array.isArray(
      data?.leaveRequests,
    )
  ) {
    return data.leaveRequests;
  }

  if (
    Array.isArray(
      data?.requests,
    )
  ) {
    return data.requests;
  }

  if (
    Array.isArray(data)
  ) {
    return data;
  }

  return null;
};

/* =========================
   Excel Export
========================= */

const escapeHtml = (
  value,
) =>
  String(
    value ?? '',
  )
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /'/g,
      '&#039;',
    );

/* =========================
   Component
========================= */

function HRReportsPage() {
  const navigate =
    useNavigate();

  const [
    leaveRequests,
    setLeaveRequests,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    actionMessage,
    setActionMessage,
  ] = useState(null);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState('all');

  const [
    leaveTypeFilter,
    setLeaveTypeFilter,
  ] = useState('all');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');

  const [
    startDate,
    setStartDate,
  ] = useState('');

  const [
    endDate,
    setEndDate,
  ] = useState('');

  /* =========================
     Load Report
  ========================= */

  const loadReport =
    useCallback(
      async () => {
        setLoading(true);
        setError('');

        try {
          const response =
            await api.get(
              '/reports/leave-requests',
            );

          const apiRequests =
            getResponseRequests(
              response,
            );

          if (
            Array.isArray(
              apiRequests,
            )
          ) {
            setLeaveRequests(
              apiRequests.map(
                normalizeRequest,
              ),
            );

            return;
          }

          setLeaveRequests([]);
          setError('รูปแบบข้อมูลรายงานจากระบบไม่ถูกต้อง');
        } catch (requestError) {
          setLeaveRequests([]);
          setError(requestError.response?.data?.message || 'ไม่สามารถโหลดข้อมูลรายงานการลาได้');
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadReport();

    const handleStorage =
      (event) => {
        if (
          !event.key ||
          event.key ===
            leaveRequestStorageKey
        ) {
          loadReport();
        }
      };

    const handleFocus =
      () => {
        loadReport();
      };

    window.addEventListener(
      'storage',
      handleStorage,
    );

    window.addEventListener(
      'focus',
      handleFocus,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage,
      );

      window.removeEventListener(
        'focus',
        handleFocus,
      );
    };
  }, [loadReport]);

  /* =========================
     Filter Options
  ========================= */

  const departments =
    useMemo(() => {
      return [
        ...new Set(
          leaveRequests
            .map(
              (request) =>
                request.department,
            )
            .filter(
              (department) =>
                department &&
                department !==
                  '-',
            ),
        ),
      ].sort(
        (
          first,
          second,
        ) =>
          first.localeCompare(
            second,
          ),
      );
    }, [leaveRequests]);

  const leaveTypes =
    useMemo(() => {
      return [
        ...new Set(
          leaveRequests
            .map(
              (request) =>
                request.leaveType,
            )
            .filter(
              (leaveType) =>
                leaveType &&
                leaveType !==
                  '-',
            ),
        ),
      ].sort(
        (
          first,
          second,
        ) =>
          first.localeCompare(
            second,
          ),
      );
    }, [leaveRequests]);

  /* =========================
     Filter
  ========================= */

  const filteredRequests =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return leaveRequests.filter(
        (request) => {
          const translatedLeaveType =
            translateLeaveType(
              request.leaveType,
            ).toLowerCase();

          const matchesSearch =
            !keyword ||
            String(
              request.requestNo ||
                '',
            )
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            String(
              request.employeeName ||
                '',
            )
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            String(
              request.employeeCode ||
                '',
            )
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            translatedLeaveType.includes(
              keyword,
            );

          const matchesDepartment =
            departmentFilter ===
              'all' ||
            request.department ===
              departmentFilter;

          const matchesLeaveType =
            leaveTypeFilter ===
              'all' ||
            request.leaveType ===
              leaveTypeFilter;

          const matchesStatus =
            statusFilter ===
              'all' ||
            request.status ===
              statusFilter;

          const matchesStartDate =
            !startDate ||
            (
              request.startDate &&
              request.startDate >=
                startDate
            );

          const matchesEndDate =
            !endDate ||
            (
              request.endDate &&
              request.endDate <=
                endDate
            );

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesLeaveType &&
            matchesStatus &&
            matchesStartDate &&
            matchesEndDate
          );
        },
      );
    }, [
      leaveRequests,
      searchText,
      departmentFilter,
      leaveTypeFilter,
      statusFilter,
      startDate,
      endDate,
    ]);

  /* =========================
     Summary
  ========================= */

  const summary =
    useMemo(() => {
      const approved =
        filteredRequests.filter(
          (request) =>
            request.status ===
            'approved',
        );

      return {
        total:
          filteredRequests.length,

        approved:
          approved.length,

        rejected:
          filteredRequests.filter(
            (request) =>
              request.status ===
              'rejected',
          ).length,

        approvedDays:
          approved.reduce(
            (
              total,
              request,
            ) =>
              total +
              Number(
                request.leaveDays ||
                  0,
              ),
            0,
          ),
      };
    }, [
      filteredRequests,
    ]);

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
        'อนุมัติแล้ว',

      value:
        summary.approved,

      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },

    {
      title:
        'ปฏิเสธแล้ว',

      value:
        summary.rejected,

      backgroundColor:
        '#FEE2E2',

      color:
        '#DC2626',
    },

    {
      title:
        'วันลาที่อนุมัติ',

      value:
        summary.approvedDays,

      backgroundColor:
        '#F3E8FF',

      color:
        '#7C3AED',
    },
  ];

  /* =========================
     Actions
  ========================= */

  const handleClearFilters =
    () => {
      setSearchText('');

      setDepartmentFilter(
        'all',
      );

      setLeaveTypeFilter(
        'all',
      );

      setStatusFilter(
        'all',
      );

      setStartDate('');
      setEndDate('');

      setActionMessage(
        null,
      );
    };

  const handleViewRequest =
    (request) => {
      if (!request.id) {
        return;
      }

      navigate(
        `/hr/reports/leave-requests/${request.id}`,
      );
    };

  /* =========================
     Export Excel
  ========================= */

  const handleExportReport =
    () => {
      if (
        filteredRequests.length ===
        0
      ) {
        setActionMessage({
          severity:
            'warning',

          text:
            'ไม่มีข้อมูลสำหรับส่งออก',
        });

        return;
      }

      const tableRows =
        filteredRequests
          .map(
            (request) => `
              <tr>
                <td>${escapeHtml(
                  request.requestNo,
                )}</td>

                <td>${escapeHtml(
                  request.employeeCode,
                )}</td>

                <td>${escapeHtml(
                  request.employeeName,
                )}</td>

                <td>${escapeHtml(
                  request.department,
                )}</td>

                <td>${escapeHtml(
                  translateLeaveType(
                    request.leaveType,
                  ),
                )}</td>

                <td>${escapeHtml(
                  formatDate(
                    request.startDate,
                  ),
                )}</td>

                <td>${escapeHtml(
                  formatDate(
                    request.endDate,
                  ),
                )}</td>

                <td>${escapeHtml(
                  request.leaveDays,
                )}</td>

                <td>${escapeHtml(
                  translateStatus(
                    request.status,
                  ),
                )}</td>

                <td>${escapeHtml(
                  request.approver,
                )}</td>
              </tr>
            `,
          )
          .join('');

      const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
          </head>

          <body>
            <table border="1">
              <thead>
                <tr>
                  <th>เลขที่คำขอ</th>
                  <th>รหัสพนักงาน</th>
                  <th>ชื่อพนักงาน</th>
                  <th>แผนก</th>
                  <th>ประเภทการลา</th>
                  <th>วันที่เริ่มต้น</th>
                  <th>วันที่สิ้นสุด</th>
                  <th>จำนวนวัน</th>
                  <th>สถานะ</th>
                  <th>ผู้อนุมัติ</th>
                </tr>
              </thead>

              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob =
        new Blob(
          [
            '\ufeff',
            html,
          ],
          {
            type:
              'application/vnd.ms-excel;charset=utf-8;',
          },
        );

      const url =
        URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          'a',
        );

      const today =
        new Date();

      const day =
        String(
          today.getDate(),
        ).padStart(
          2,
          '0',
        );

      const month =
        String(
          today.getMonth() +
            1,
        ).padStart(
          2,
          '0',
        );

      const year =
        today.getFullYear();

      link.href = url;

      link.download =
        `leave-report-${day}-${month}-${year}.xls`;

      document.body.appendChild(
        link,
      );

      link.click();

      document.body.removeChild(
        link,
      );

      URL.revokeObjectURL(
        url,
      );

      setActionMessage({
        severity:
          'success',

        text:
          `ส่งออกรายงาน ${filteredRequests.length} รายการเรียบร้อยแล้ว`,
      });
    };

  /* =========================
     UI
  ========================= */

  return (
    <HRLayout activeMenu="Reports">
      {/* Header */}

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
          รายงานการลา
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleExportReport
          }
          disabled={
            loading
          }
          sx={{
            minWidth:
              '140px',

            height:
              '42px',

            padding:
              '0 18px',

            backgroundColor:
              theme.primary,

            color:
              '#FFFFFF',

            borderRadius:
              '8px',

            fontSize:
              '12px',

            fontWeight:
              700,

            textTransform:
              'none',

            boxShadow:
              'none',

            '&:hover': {
              backgroundColor:
                theme.dark,

              boxShadow:
                'none',
            },
          }}
        >
          ส่งออก Excel
        </Button>
      </Box>

      {/* Messages */}

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError('')
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {error}
        </Alert>
      )}

      {actionMessage && (
        <Alert
          severity={
            actionMessage.severity
          }
          onClose={() =>
            setActionMessage(
              null,
            )
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {
            actionMessage.text
          }
        </Alert>
      )}

      {/* Summary Cards */}

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            sm:
              'repeat(2, 1fr)',

            xl:
              'repeat(4, 1fr)',
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
                {card.value}
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
                {card.title}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      {/* Main Card */}

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
        {/* Filters */}

        <Box
          sx={{
            padding:
              '20px 24px',

            borderBottom:
              '1px solid #E5E7EB',
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
            รายการการลา
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
              filteredRequests.length
            }{' '}
            จาก{' '}
            {
              leaveRequests.length
            }{' '}
            รายการ
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'repeat(2, 1fr)',

                xl:
                  'repeat(3, 1fr)',
              },

              gap:
                '14px',

              marginTop:
                '20px',
            }}
          >
            {/* Search */}

            <TextField
              fullWidth
              label="ค้นหา"
              placeholder="เลขที่คำขอ ชื่อ หรือรหัสพนักงาน"
              value={
                searchText
              }
              onChange={(
                event,
              ) =>
                setSearchText(
                  event.target
                    .value,
                )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    height:
                      '48px',

                    borderRadius:
                      '9px',

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          theme.primary,
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      theme.primary,
                  },
              }}
            />

            {/* Department */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                แผนก
              </InputLabel>

              <Select
                value={
                  departmentFilter
                }
                label="แผนก"
                onChange={(
                  event,
                ) =>
                  setDepartmentFilter(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกแผนก
                </MenuItem>

                {departments.map(
                  (
                    department,
                  ) => (
                    <MenuItem
                      key={
                        department
                      }
                      value={
                        department
                      }
                    >
                      {
                        department
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* Leave Type */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                ประเภทการลา
              </InputLabel>

              <Select
                value={
                  leaveTypeFilter
                }
                label="ประเภทการลา"
                onChange={(
                  event,
                ) =>
                  setLeaveTypeFilter(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกประเภท
                </MenuItem>

                {leaveTypes.map(
                  (
                    leaveType,
                  ) => (
                    <MenuItem
                      key={
                        leaveType
                      }
                      value={
                        leaveType
                      }
                    >
                      {translateLeaveType(
                        leaveType,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* Status */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                สถานะ
              </InputLabel>

              <Select
                value={
                  statusFilter
                }
                label="สถานะ"
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกสถานะ
                </MenuItem>

                <MenuItem value="draft">
                  ฉบับร่าง
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

            {/* Start Date */}

            <ThaiDateField
              label="วันที่เริ่มต้น"
              value={
                startDate
              }
              onChange={
                setStartDate
              }
            />

            {/* End Date */}

            <ThaiDateField
              label="วันที่สิ้นสุด"
              value={
                endDate
              }
              onChange={
                setEndDate
              }
            />
          </Box>

          <Box
            sx={{
              display:
                'flex',

              justifyContent:
                'flex-end',

              marginTop:
                '14px',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth:
                  '110px',

                height:
                  '42px',

                padding:
                  '0 18px',

                color:
                  '#475569',

                borderColor:
                  '#CBD5E1',

                borderRadius:
                  '9px',

                fontSize:
                  '12px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#F8FAFC',

                  borderColor:
                    '#94A3B8',
                },
              }}
            >
              ล้างตัวกรอง
            </Button>
          </Box>
        </Box>

        {/* Loading */}

        {loading ? (
          <Box
            sx={{
              minHeight:
                '300px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',
            }}
          >
            <CircularProgress
              sx={{
                color:
                  theme.primary,
              }}
            />
          </Box>
        ) : filteredRequests.length >
          0 ? (
          /* Table */

          <Box
            sx={{
              width:
                '100%',

              maxWidth:
                '100%',

              overflow:
                'hidden',
            }}
          >
            <Table
              size="small"
              sx={{
                width:
                  '100%',

                tableLayout:
                  'fixed',

                '& th, & td': {
                  boxSizing:
                    'border-box',
                },
              }}
            >
              <colgroup>
                <col
                  style={{
                    width:
                      '11%',
                  }}
                />

                <col
                  style={{
                    width:
                      '14%',
                  }}
                />

                <col
                  style={{
                    width:
                      '12%',
                  }}
                />

                <col
                  style={{
                    width:
                      '12%',
                  }}
                />

                <col
                  style={{
                    width:
                      '17%',
                  }}
                />

                <col
                  style={{
                    width:
                      '7%',
                  }}
                />

                <col
                  style={{
                    width:
                      '10%',
                  }}
                />

                <col
                  style={{
                    width:
                      '12%',
                  }}
                />

                <col
                  style={{
                    width:
                      '5%',
                  }}
                />
              </colgroup>

              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      '#F8FAFC',
                  }}
                >
                  {[
                    'เลขที่คำขอ',
                    'พนักงาน',
                    'แผนก',
                    'ประเภทการลา',
                    'ช่วงวันที่',
                    'จำนวนวัน',
                    'สถานะ',
                    'ผู้อนุมัติ',
                    'การดำเนินการ',
                  ].map(
                    (
                      heading,
                    ) => (
                      <TableCell
                        key={
                          heading
                        }
                        align={
                          [
                            'จำนวนวัน',
                            'สถานะ',
                            'การดำเนินการ',
                          ].includes(
                            heading,
                          )
                            ? 'center'
                            : 'left'
                        }
                        sx={{
                          padding:
                            '11px 7px',

                          color:
                            '#64748B',

                          fontSize:
                            '9.5px',

                          fontWeight:
                            700,

                          lineHeight:
                            1.35,

                          whiteSpace:
                            'normal',

                          wordBreak:
                            'break-word',

                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {
                          heading
                        }
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRequests.map(
                  (
                    request,
                    index,
                  ) => {
                    const statusStyle =
                      getStatusStyle(
                        request.status,
                      );

                    return (
                      <TableRow
                        key={
                          request.id ||
                          `${request.requestNo}-${index}`
                        }
                        hover
                      >
                        {/* Request */}

                        <TableCell
                          sx={{
                            padding:
                              '12px 7px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                theme.primary,

                              fontSize:
                                '10px',

                              fontWeight:
                                800,

                              lineHeight:
                                1.4,

                              wordBreak:
                                'break-word',

                              overflowWrap:
                                'anywhere',
                            }}
                          >
                            {
                              request.requestNo
                            }
                          </Typography>
                        </TableCell>

                        {/* Employee */}

                        <TableCell
                          sx={{
                            padding:
                              '12px 7px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '10px',

                              fontWeight:
                                700,

                              lineHeight:
                                1.4,

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {
                              request.employeeName
                            }
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#94A3B8',

                              fontSize:
                                '9px',

                              lineHeight:
                                1.35,

                              marginTop:
                                '2px',

                              wordBreak:
                                'break-word',
                            }}
                          >
                            {
                              request.employeeCode
                            }
                          </Typography>
                        </TableCell>

                        {/* Department */}

                        <TableCell
                          sx={{
                            padding:
                              '12px 7px',

                            color:
                              '#475569',

                            fontSize:
                              '9.5px',

                            lineHeight:
                              1.45,

                            wordBreak:
                              'break-word',

                            overflowWrap:
                              'anywhere',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {
                            request.department
                          }
                        </TableCell>

                        {/* Leave Type */}

                        <TableCell
                          sx={{
                            padding:
                              '12px 7px',

                            color:
                              '#475569',

                            fontSize:
                              '9.5px',

                            lineHeight:
                              1.45,

                            wordBreak:
                              'break-word',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {translateLeaveType(
                            request.leaveType,
                          )}
                        </TableCell>

                        {/* Date */}

                        <TableCell
                          sx={{
                            padding:
                              '12px 7px',

                            color:
                              '#475569',

                            fontSize:
                              '9.5px',

                            lineHeight:
                              1.45,

                            whiteSpace:
                              'normal',

                            wordBreak:
                              'break-word',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {formatDateRange(
                            request.startDate,
                            request.endDate,
                          )}
                        </TableCell>

                        {/* Days */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '12px 5px',

                            color:
                              '#111827',

                            fontSize:
                              '9.5px',

                            fontWeight:
                              700,

                            lineHeight:
                              1.4,

                            whiteSpace:
                              'normal',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {
                            request.leaveDays
                          }{' '}
                          วัน
                        </TableCell>

                        {/* Status */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '12px 5px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={translateStatus(
                              request.status,
                            )}
                            size="small"
                            sx={{
                              maxWidth:
                                '100%',

                              height:
                                '25px',

                              backgroundColor:
                                statusStyle.backgroundColor,

                              color:
                                statusStyle.color,

                              borderRadius:
                                '999px',

                              fontSize:
                                '8.5px',

                              fontWeight:
                                700,

                              '& .MuiChip-label': {
                                paddingLeft:
                                  '7px',

                                paddingRight:
                                  '7px',
                              },
                            }}
                          />
                        </TableCell>

                        {/* Approver */}

                        <TableCell
                          sx={{
                            padding:
                              '12px 7px',

                            color:
                              '#475569',

                            fontSize:
                              '9.5px',

                            lineHeight:
                              1.45,

                            wordBreak:
                              'break-word',

                            overflowWrap:
                              'anywhere',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {
                            request.approver
                          }
                        </TableCell>

                        {/* Action */}

                        <TableCell
                          align="center"
                          sx={{
                            padding:
                              '12px 3px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Button
                            type="button"
                            disabled={
                              !request.id
                            }
                            onClick={() =>
                              handleViewRequest(
                                request,
                              )
                            }
                            sx={{
                              minWidth:
                                0,

                              padding:
                                '2px 4px',

                              color:
                                theme.primary,

                              fontSize:
                                '9.5px',

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
                            ดู
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          /* Empty */

          <Box
            sx={{
              minHeight:
                '280px',

              padding:
                '40px 24px',

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
                  '16px',

                fontWeight:
                  800,

                marginTop:
                  '14px',
              }}
            >
              ไม่พบข้อมูลการลา
            </Typography>

            <Typography
              sx={{
                color:
                  '#64748B',

                fontSize:
                  '12px',

                marginTop:
                  '5px',
              }}
            >
              ลองเปลี่ยนหรือล้างตัวกรอง
            </Typography>
          </Box>
        )}
      </Paper>
    </HRLayout>
  );
}

export default HRReportsPage;
