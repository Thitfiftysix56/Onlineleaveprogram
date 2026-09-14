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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import FixedTableBody from '../../components/fixedtablebody.jsx';

import {
  CloseRounded,
  SearchRounded,
} from '@mui/icons-material';
import ThaiCalendarField from '../../components/thaicalendarfield.jsx';

import {
  useNavigate,
} from 'react-router-dom';

import HRLayout from '../../layouts/hrlayout.jsx';
import RequestNumberText from '../../components/requestnumbertext.jsx';
import { DataListToolbar } from '../../components/shareduiprimitives.jsx';
import { InlineListSummary } from '../../components/sharedvisualfoundation.jsx';
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
        '#FEE2E2',

      color:
        '#B91C1C',
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
  return <ThaiCalendarField label={label} value={value} onChange={onChange} primaryColor={theme.primary} />;
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

    approvedAt:
      request.approvedAt ||
      request.approved_at ||
      null,

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

    reason:
      request.reason ||
      '',

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

  const [page, setPage] = useState(0);
  const [exportConfirmationOpen, setExportConfirmationOpen] = useState(false);
  const rowsPerPage = 5;

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

          const searchableText = [
            request.requestNo,
            request.employeeName,
            request.employeeCode,
            request.department,
            request.leaveType,
            translatedLeaveType,
            translateStatus(
              request.status,
            ),
          ]
            .map((value) =>
              String(value || '')
                .toLowerCase(),
            )
            .join(' ');

          const matchesSearch =
            !keyword ||
            searchableText.includes(
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

  const paginatedRequests = useMemo(
    () => filteredRequests.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredRequests, page],
  );

  useEffect(() => {
    setPage(0);
  }, [searchText, departmentFilter, leaveTypeFilter, statusFilter, startDate, endDate]);

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

  const approvedDaysThisMonth = useMemo(() => {
    const now = new Date();
    return leaveRequests
      .filter((request) => {
        if (request.status !== 'approved' || !request.approvedAt) return false;
        const approvedAt = new Date(request.approvedAt);
        return !Number.isNaN(approvedAt.getTime()) &&
          approvedAt.getFullYear() === now.getFullYear() &&
          approvedAt.getMonth() === now.getMonth();
      })
      .reduce((total, request) => total + Number(request.leaveDays || 0), 0);
  }, [leaveRequests]);

  const summaryCards = [
    {
      title:
        'รายการที่พบ',

      value:
        summary.total,

      backgroundColor:
        theme.soft,

      color:
        '#2563EB',
    },

    {
      title:
        'วันลาอนุมัติเดือนนี้',

      value:
        approvedDaysThisMonth,

      backgroundColor:
        '#F3E8FF',

      color:
        '#0891B2',
    },
  ];

  /* =========================
     Actions
  ========================= */

  const activeFilterChips = [
    ...(departmentFilter !== 'all' ? [{
      key: 'department',
      label: `แผนก: ${departmentFilter}`,
      onDelete: () => setDepartmentFilter('all'),
    }] : []),
    ...(leaveTypeFilter !== 'all' ? [{
      key: 'leaveType',
      label: `ประเภท: ${translateLeaveType(leaveTypeFilter)}`,
      onDelete: () => setLeaveTypeFilter('all'),
    }] : []),
    ...(statusFilter !== 'all' ? [{
      key: 'status',
      label: `สถานะ: ${translateStatus(statusFilter)}`,
      onDelete: () => setStatusFilter('all'),
    }] : []),
    ...(startDate ? [{
      key: 'startDate',
      label: `วันที่เริ่มต้น: ${formatDate(startDate)}`,
      onDelete: () => setStartDate(''),
    }] : []),
    ...(endDate ? [{
      key: 'endDate',
      label: `วันที่สิ้นสุด: ${formatDate(endDate)}`,
      onDelete: () => setEndDate(''),
    }] : []),
  ];

  const handleViewRequest =
    (request) => {
      if (!request.id) {
        return;
      }

      navigate(
        `/hr/reports/leave-requests/${request.id}`,
        {
          state: {
            requestData: request,
            returnTo: `${window.location.pathname}${window.location.search}`,
            returnLabel: 'รายงานการลา',
          },
        },
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '16px',
        }}
      >
        <Button
          type="button"
          variant="contained"
          onClick={() => setExportConfirmationOpen(true)}
          disabled={loading}
          sx={{
            minWidth: '140px',
            height: '42px',
            padding: '0 18px',
            borderRadius: '9px',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
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
              'repeat(2, minmax(0, 1fr))',

            md:
              'repeat(2, minmax(0, 1fr))',
          },

          gap:
            '16px',

          marginBottom:
            '16px',
        }}
      >
        <InlineListSummary items={summaryCards} sx={{ gridColumn: '1 / -1', marginBottom: 0 }} />
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
            '20px',

          boxShadow:
            '0 4px 16px rgba(15, 23, 42, 0.04)',

          overflow:
            'hidden',
        }}
      >
        {/* Filters */}

        <Box
          sx={{
            padding:
              '20px 24px',
          }}
        >
          <Typography sx={{ color: '#111827', fontSize: '18px', fontWeight: 600 }}>
            รายการการลา
          </Typography>

          <DataListToolbar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="ค้นหาเลขที่คำขอ ชื่อ หรือรหัสพนักงาน"
            filters={(
              <>
                <FormControl size="small">
                  <Select
                    value={departmentFilter === 'all' ? '' : departmentFilter}
                    displayEmpty
                    renderValue={(value) => value || 'แผนก'}
                    inputProps={{ 'aria-label': 'แผนก' }}
                    onChange={(event) => setDepartmentFilter(event.target.value || 'all')}
                  >
                    {departments.map((department) => (
                      <MenuItem key={department} value={department}>{department}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={leaveTypeFilter === 'all' ? '' : leaveTypeFilter}
                    displayEmpty
                    renderValue={(value) => value ? translateLeaveType(value) : 'ประเภทการลา'}
                    inputProps={{ 'aria-label': 'ประเภทการลา' }}
                    onChange={(event) => setLeaveTypeFilter(event.target.value || 'all')}
                  >
                    {leaveTypes.map((leaveType) => (
                      <MenuItem key={leaveType} value={leaveType}>{translateLeaveType(leaveType)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    value={statusFilter === 'all' ? '' : statusFilter}
                    displayEmpty
                    renderValue={(value) => value ? translateStatus(value) : 'สถานะ'}
                    inputProps={{ 'aria-label': 'สถานะ' }}
                    onChange={(event) => setStatusFilter(event.target.value || 'all')}
                  >
                    <MenuItem value="pending">รออนุมัติ</MenuItem>
                    <MenuItem value="approved">อนุมัติแล้ว</MenuItem>
                    <MenuItem value="rejected">ปฏิเสธแล้ว</MenuItem>
                    <MenuItem value="cancelled">ยกเลิกแล้ว</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            sx={{ marginTop: '14px' }}
          />

          <Box
            sx={{
              display:
                'none',

              gridTemplateColumns: {
                xs:
                  '1fr',

                sm:
                  'repeat(2, 1fr)',

                lg:
                  'minmax(240px, 1.5fr) repeat(3, minmax(150px, 1fr))',
              },

              gap:
                '12px',

              alignItems:
                'center',

              marginTop:
                '14px',

              '& .MuiInputLabel-root': {
                fontWeight: 400,
              },

              '& .MuiInputBase-input': {
                fontWeight: 400,
              },

              '& > *': {
                minWidth: 0,
              },
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="ค้นหาเลขที่คำขอ ชื่อ หรือรหัสพนักงาน"
              aria-label="ค้นหาเลขที่คำขอ ชื่อ หรือรหัสพนักงาน"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: '#94A3B8', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchText ? (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        size="small"
                        aria-label="ล้างคำค้นหา"
                        onClick={() => setSearchText('')}
                        sx={{ width: 30, height: 30 }}
                      >
                        <CloseRounded sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '44px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '9px',
                  '&.Mui-focused fieldset': { borderColor: theme.primary },
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
                value={departmentFilter === 'all' ? '' : departmentFilter}
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
                '44px',

                  borderRadius:
                    '9px',
                }}
              >

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
                value={leaveTypeFilter === 'all' ? '' : leaveTypeFilter}
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
                    '46px',

                  borderRadius:
                    '9px',
                }}
              >

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
                value={statusFilter === 'all' ? '' : statusFilter}
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
                    '46px',

                  borderRadius:
                    '9px',
                }}
              >


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

          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(2, minmax(0, 1fr))',
                lg: '280px 280px',
              },
              columnGap: '16px',
              rowGap: '12px',
              alignItems: 'center',
              justifyContent: 'start',
              marginTop: '16px',
              '& .MuiInputLabel-root': {
                fontWeight: 400,
              },
              '& .MuiInputBase-input': {
                fontWeight: 400,
              },
              '& > *': {
                minWidth: 0,
              },
            }}
          >

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

          {activeFilterChips.length > 0 ? (
            <Stack
              direction="row"
              alignItems="center"
              gap="8px"
              useFlexGap
              flexWrap="wrap"
              sx={{ marginTop: '12px' }}
            >
              {activeFilterChips.map((filter) => (
                <Chip
                  key={filter.key}
                  size="small"
                  label={filter.label}
                  onDelete={filter.onDelete}
                  sx={{
                    backgroundColor: 'var(--role-hover, #F1F5F9)',
                    color: '#334155',
                  }}
                />
              ))}
            </Stack>
          ) : null}

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
                      '8%',
                  }}
                />

                <col
                  style={{
                    width:
                      '11%',
                  }}
                />

                <col
                  style={{
                    width:
                      '15%',
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

              <FixedTableBody>
                {paginatedRequests.map(
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
                        tabIndex={request.id ? 0 : undefined}
                        onClick={() => request.id && handleViewRequest(request)}
                        onKeyDown={(event) => {
                          if (request.id && (event.key === 'Enter' || event.key === ' ')) {
                            event.preventDefault();
                            handleViewRequest(request);
                          }
                        }}
                        sx={{
                          cursor: request.id ? 'pointer' : 'default',
                          '&:focus-visible': {
                            outline: `2px solid ${theme.primary}`,
                            outlineOffset: -2,
                          },
                        }}
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
                            <RequestNumberText>{request.requestNo}</RequestNumberText>
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

                      </TableRow>
                    );
                  },
                )}
              </FixedTableBody>
            </Table>
            {filteredRequests.length > rowsPerPage ? (
              <TablePagination
                component="div"
                count={filteredRequests.length}
                page={page}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
                labelRowsPerPage=""
                labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.ceil(filteredRequests.length / rowsPerPage)}`}
              />
            ) : null}
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
              ลองปรับตัวกรองหรือกดกากบาทเพื่อล้างค่า
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog open={exportConfirmationOpen} onClose={() => setExportConfirmationOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>ยืนยันการส่งออกรายงาน</DialogTitle>
        <DialogContent>
          <Typography>ต้องการส่งออกข้อมูลการลาตามตัวกรองปัจจุบันเป็นไฟล์ Excel ใช่หรือไม่</Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '14px 20px' }}>
          <Button type="button" variant="outlined" onClick={() => setExportConfirmationOpen(false)} sx={{ color: '#475569', borderColor: '#CBD5E1' }}>ยกเลิก</Button>
          <Button type="button" variant="contained" onClick={() => { setExportConfirmationOpen(false); handleExportReport(); }} sx={{ backgroundColor: '#15803D', '&:hover': { backgroundColor: '#166534' } }}>ยืนยันส่งออก</Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default HRReportsPage;
