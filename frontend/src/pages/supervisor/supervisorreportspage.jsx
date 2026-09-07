import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';

import { useNavigate } from 'react-router-dom';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import RequestNumberText from '../../components/requestnumbertext.jsx';
import { CompactSummaryCard, HeaderlessPageTopOffset } from '../../components/sharedvisualfoundation.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';
import api from '../../api/axios.js';

const theme = roleAccentTokens.supervisor;

const statusLabels = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

const statusColors = {
  pending: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },

  approved: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },

  rejected: {
    backgroundColor: '#FFE4E6',
    color: '#BE123C',
  },

  cancelled: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
};

const leaveTypeLabels = {
  'Annual Leave': 'ลาพักร้อน',
  'Sick Leave': 'ลาป่วย',
  'Personal Leave': 'ลากิจ',
  'Paternity Leave': 'ลาเพื่อดูแลบุตร',
  'Ordination Leave': 'ลาอุปสมบท',
  'Military Leave': 'ลาเพื่อรับราชการทหาร',
  Other: 'ลาอื่น ๆ',
};

const translateLeaveType = (value) =>
  leaveTypeLabels[value] || value || '-';

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})/,
  );

  if (match) {
    return `${match[3]}/${match[2]}/${Number(match[1]) + 543}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear() + 543}`;
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return '-';
  }

  if (!endDate || startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/* =========================
   ช่องวันที่ภาษาไทย
========================= */

function ThaiDateField({
  label,
  value,
  onChange,
  min,
  max,
}) {
  const pickerRef = useRef(null);
  const openPicker = (event) => {
    event?.stopPropagation?.();
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      if (typeof picker.showPicker === 'function') picker.showPicker();
      else picker.click();
    } catch {
      picker.click();
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <TextField
        fullWidth
        label={label}
        value={value ? formatDate(value) : ''}
        placeholder="วว/ดด/ปปปป"
        onClick={openPicker}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: <InputAdornment position="end"><IconButton type="button" aria-label={`เลือก${label}`} onClick={openPicker} edge="end"><CalendarMonthRounded fontSize="small" /></IconButton></InputAdornment>,
          },
          inputLabel: {
            shrink: true,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '44px',
            borderRadius: '11px',
          },

          '& .MuiOutlinedInput-input': {
            fontSize: '14px',
            cursor: 'pointer',
          },

          '& .MuiInputBase-input::placeholder': {
            opacity: 1,
            color: '#64748B',
          },
        }}
      />

      <input
        ref={pickerRef}
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          insetInlineStart: 0,
          bottom: 0,
        }}
        min={min}
        max={max}
      />
    </Box>
  );
}

function SupervisorReportsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(
          '/supervisor/team-report',
        );

        setRequests(
          response.data?.data?.leaveRequests || [],
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'ไม่สามารถโหลดรายงานทีมได้',
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const leaveTypes = useMemo(() => {
    const map = new Map();

    requests.forEach((request) => {
      if (
        request.leaveTypeId &&
        request.leaveType
      ) {
        map.set(
          String(request.leaveTypeId),
          request.leaveType,
        );
      }
    });

    return Array.from(map.entries());
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const requestStatus = String(
        request.status || '',
      ).toLowerCase();

      const matchesStatus =
        !status ||
        requestStatus === status;

      const matchesLeaveType =
        !leaveType ||
        String(request.leaveTypeId) ===
          String(leaveType);

      const matchesStartDate =
        !startDate ||
        request.startDate >= startDate;

      const matchesEndDate =
        !endDate ||
        request.endDate <= endDate;

      return (
        matchesStatus &&
        matchesLeaveType &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    requests,
    status,
    leaveType,
    startDate,
    endDate,
  ]);

  const summary = useMemo(() => {
    const count = (selectedStatus) =>
      filteredRequests.filter(
        (request) =>
          String(
            request.status || '',
          ).toLowerCase() === selectedStatus,
      ).length;

    return {
      total: filteredRequests.length,
      pending: count('pending'),
      approved: count('approved'),
      rejected: count('rejected'),
    };
  }, [filteredRequests]);

  useEffect(() => {
    setPage(0);
  }, [startDate, endDate, status, leaveType]);

  const paginatedRequests = useMemo(
    () => filteredRequests.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredRequests, page],
  );

  const summaryCards = [
    {
      title: 'คำขอทั้งหมด',
      value: summary.total,
      backgroundColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      gradient: 'linear-gradient(135deg, #EAF3FF 0%, #F7FAFF 68%, #FFFFFF 100%)',
      glowColor: 'rgba(96, 165, 250, 0.18)',
      accent: 'info',
    },

    {
      title: 'รออนุมัติ',
      value: summary.pending,
      backgroundColor: '#FEF3C7',
      borderColor: '#FCD34D',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 45%, #FEF3C7 100%)',
      glowColor: 'rgba(245, 158, 11, 0.16)',
      accent: 'warning',
    },

    {
      title: 'อนุมัติแล้ว',
      value: summary.approved,
      backgroundColor: '#DCFCE7',
      borderColor: '#86EFAC',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #F6FEF9 45%, #DCFCE7 100%)',
      glowColor: 'rgba(34, 197, 94, 0.14)',
      accent: 'success',
    },

    {
      title: 'ปฏิเสธแล้ว',
      value: summary.rejected,
      backgroundColor: '#FEE2E2',
      borderColor: '#FCA5A5',
      gradient: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 45%, #FEE2E2 100%)',
      glowColor: 'rgba(239, 68, 68, 0.13)',
      accent: 'error',
    },
  ];

  const activeFilterChips = [
    ...(status ? [{ key: 'status', label: `สถานะ: ${statusLabels[status]}`, onDelete: () => setStatus('') }] : []),
    ...(leaveType ? [{ key: 'leaveType', label: `ประเภท: ${translateLeaveType(leaveTypes.find(([id]) => id === String(leaveType))?.[1])}`, onDelete: () => setLeaveType('') }] : []),
    ...(startDate ? [{ key: 'startDate', label: `วันที่เริ่มต้น: ${formatDate(startDate)}`, onDelete: () => setStartDate('') }] : []),
    ...(endDate ? [{ key: 'endDate', label: `วันที่สิ้นสุด: ${formatDate(endDate)}`, onDelete: () => setEndDate('') }] : []),
  ];

  return (
    <SupervisorLayout activeMenu="Team Reports">
      <HeaderlessPageTopOffset />
      {error && (
        <Alert
          severity="error"
          sx={{
            marginBottom: '20px',
            borderRadius: '10px',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, minmax(0, 1fr))',
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
            color={card.accent === 'warning' ? '#B45309' : card.accent === 'success' ? '#15803D' : card.accent === 'error' ? '#DC2626' : '#2563EB'}
            background={card.gradient}
            glowColor={card.glowColor}
          />
        ))}
      </Box>

      {/* รายงาน */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',

          border: '1px solid #E5E7EB',
          borderRadius: '14px',

          overflow: 'hidden',
        }}
      >
        {/* Filter */}
        <Box
          sx={{
            padding: '20px 24px',
          }}
        >
          <Typography
            sx={{
              color: '#111827',

              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            ประวัติการลาของลูกทีม
          </Typography>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                md: 'repeat(2, 1fr)',

                lg: 'repeat(4, minmax(150px, 1fr))',
              },

              gap: '16px',

              marginTop: '20px',
            }}
          >
            {/* สถานะ */}
            <FormControl fullWidth sx={{ order: 3 }}>

              <Select
                value={status}
                displayEmpty
                renderValue={(value) => value ? statusLabels[value] : 'สถานะ'}
                inputProps={{ 'aria-label': 'สถานะ' }}
                onChange={(event) =>
                  setStatus(
                    event.target.value,
                  )
                }
                sx={{
                  height: '44px',
                  borderRadius: '11px',
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

            {/* ประเภทการลา */}
            <FormControl fullWidth sx={{ order: 4 }}>

              <Select
                value={leaveType}
                displayEmpty
                renderValue={(value) => value ? translateLeaveType(leaveTypes.find(([id]) => id === String(value))?.[1]) : 'ประเภท'}
                inputProps={{ 'aria-label': 'ประเภท' }}
                onChange={(event) =>
                  setLeaveType(
                    event.target.value,
                  )
                }
                sx={{
                  height: '44px',
                  borderRadius: '11px',
                }}
              >
                {leaveTypes.map(
                  ([id, name]) => (
                    <MenuItem
                      key={id}
                      value={id}
                    >
                      {translateLeaveType(
                        name,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* วันที่เริ่มต้น */}
            <ThaiDateField
              label="วันที่เริ่มต้น"
              value={startDate}
              onChange={setStartDate}
              max={endDate || undefined}
            />

            {/* วันที่สิ้นสุด */}
            <ThaiDateField
              label="วันที่สิ้นสุด"
              value={endDate}
              onChange={setEndDate}
              min={startDate || undefined}
            />

          </Box>
          {activeFilterChips.length > 0 ? (
            <Stack direction="row" alignItems="center" gap="8px" useFlexGap flexWrap="wrap" sx={{ marginTop: '12px' }}>
              {activeFilterChips.map((filter) => (
                <Chip key={filter.key} size="small" label={filter.label} onDelete={filter.onDelete} sx={{ backgroundColor: theme.soft }} />
              ))}
            </Stack>
          ) : null}
        </Box>

        {/* Loading */}
        {loading ? (
          <Box
            sx={{
              minHeight: '280px',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress
              sx={{
                color: theme.primary,
              }}
            />
          </Box>
        ) : filteredRequests.length > 0 ? (
          /* Table */
          <Box
            sx={{
              overflowX: 'auto',
            }}
          >
            <Table
              sx={{
                minWidth: '850px',
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
                    'เลขที่คำขอ',
                    'พนักงาน',
                    'ประเภทการลา',
                    'ช่วงวันที่',
                    'จำนวนวัน',
                    'สถานะ',
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        color: '#64748B',

                        fontSize: '11px',
                        fontWeight: 700,

                        whiteSpace: 'nowrap',

                        borderBottom:
                          '1px solid #E5E7EB',
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRequests.map(
                  (request) => {
                    const requestStatus =
                      String(
                        request.status ||
                          '',
                      ).toLowerCase();

                    const style =
                      statusColors[
                        requestStatus
                      ] || {
                        backgroundColor:
                          '#E5E7EB',

                        color:
                          '#64748B',
                      };

                    return (
                      <TableRow
                        key={request.id}
                        hover
                        tabIndex={0}
                        onClick={() => navigate(`/supervisor/approval/${request.id}`, { state: { returnTo: `${window.location.pathname}${window.location.search}`, returnLabel: 'รายงานทีม' } })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            navigate(`/supervisor/approval/${request.id}`, { state: { returnTo: `${window.location.pathname}${window.location.search}`, returnLabel: 'รายงานทีม' } });
                          }
                        }}
                        sx={{
                          cursor: 'pointer',
                          '&:focus-visible': { outline: `2px solid ${theme.primary}`, outlineOffset: -2 },
                        }}
                      >
                        {/* เลขที่ */}
                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                theme.primary,

                              fontSize:
                                '12px',

                              fontWeight:
                                800,

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            <RequestNumberText>
                              {request.requestNo || `#${request.id}`}
                            </RequestNumberText>
                          </Typography>
                        </TableCell>

                        {/* พนักงาน */}
                        <TableCell>
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '12px',

                              fontWeight:
                                700,

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {request.employeeName ||
                              '-'}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#94A3B8',

                              fontSize:
                                '10px',
                            }}
                          >
                            {request.employeeCode ||
                              '-'}
                          </Typography>
                        </TableCell>

                        {/* ประเภทลา */}
                        <TableCell
                          sx={{
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {translateLeaveType(
                            request.leaveType,
                          )}
                        </TableCell>

                        {/* วันที่ */}
                        <TableCell
                          sx={{
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDateRange(
                            request.startDate,
                            request.endDate,
                          )}
                        </TableCell>

                        {/* จำนวนวัน */}
                        <TableCell
                          sx={{
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {Number(
                            request.leaveDays ||
                              0,
                          )}{' '}
                          วัน
                        </TableCell>

                        {/* สถานะ */}
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display:
                                'inline-flex',

                              alignItems:
                                'center',

                              justifyContent:
                                'center',

                              padding:
                                '5px 10px',

                              backgroundColor:
                                style.backgroundColor,

                              color:
                                style.color,

                              borderRadius:
                                '999px',

                              fontSize:
                                '10px',

                              fontWeight: 700,

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {statusLabels[
                              requestStatus
                            ] ||
                              request.status ||
                              '-'}
                          </Box>
                        </TableCell>

                      </TableRow>
                    );
                  },
                )}
              </TableBody>
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
              minHeight: '260px',

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

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                backgroundColor:
                  theme.soft,

                color:
                  theme.primary,

                borderRadius: '50%',

                fontSize: '20px',
                fontWeight: 800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color: '#111827',

                fontSize: '16px',
                fontWeight: 800,

                marginTop: '14px',
              }}
            >
              ไม่พบข้อมูลการลาของลูกทีม
            </Typography>

            <Typography
              sx={{
                color: '#64748B',

                fontSize: '12px',

                marginTop: '5px',
              }}
            >
              ลองปรับตัวกรองหรือกดกากบาทเพื่อล้างค่า
            </Typography>
          </Box>
        )}
      </Paper>
    </SupervisorLayout>
  );
}

export default SupervisorReportsPage;
