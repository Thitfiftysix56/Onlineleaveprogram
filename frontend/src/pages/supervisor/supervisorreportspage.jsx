import { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
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

import { useNavigate } from 'react-router-dom';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';
import api from '../../api/axios.js';

const theme = {
  primary: '#7C3AED',
  dark: '#6D28D9',
  soft: '#F3E8FF',
  border: '#DDD6FE',
};

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
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },

  cancelled: {
    backgroundColor: '#E5E7EB',
    color: '#64748B',
  },
};

const leaveTypeLabels = {
  'Annual Leave': 'ลาพักร้อน',
  'Sick Leave': 'ลาป่วย',
  'Personal Leave': 'ลากิจ',
  'Maternity Leave': 'ลาคลอด',
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
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
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
}) {
  const formatDisplayDate = (dateValue) => {
    if (!dateValue) {
      return '';
    }

    const [year, month, day] =
      dateValue.split('-');

    if (!year || !month || !day) {
      return '';
    }

    return `${day}/${month}/${year}`;
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
        value={formatDisplayDate(value)}
        placeholder="วว/ดด/ปปปป"
        slotProps={{
          input: {
            readOnly: true,
          },

          inputLabel: {
            shrink: true,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '48px',
            borderRadius: '9px',
          },

          '& .MuiOutlinedInput-input': {
            fontSize: '14px',
          },

          '& .MuiInputBase-input::placeholder': {
            opacity: 1,
            color: '#64748B',
          },
        }}
      />

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer',
        }}
      />
    </Box>
  );
}

function SupervisorReportsPage() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('all');
  const [leaveType, setLeaveType] = useState('all');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
        status === 'all' ||
        requestStatus === status;

      const matchesLeaveType =
        leaveType === 'all' ||
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

  const summaryCards = [
    {
      title: 'คำขอทั้งหมด',
      value: summary.total,
      backgroundColor: theme.soft,
      color: theme.primary,
    },

    {
      title: 'รออนุมัติ',
      value: summary.pending,
      backgroundColor: '#FEF3C7',
      color: '#B45309',
    },

    {
      title: 'อนุมัติแล้ว',
      value: summary.approved,
      backgroundColor: '#DCFCE7',
      color: '#15803D',
    },

    {
      title: 'ปฏิเสธแล้ว',
      value: summary.rejected,
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
    },
  ];

  const clearFilters = () => {
    setStatus('all');
    setLeaveType('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <SupervisorLayout activeMenu="Team Reports">
      {/* หัวข้อ */}
      <Typography
        component="h1"
        sx={{
          color: '#111827',

          fontSize: {
            xs: '26px',
            sm: '30px',
          },

          fontWeight: 800,
          marginBottom: '22px',
        }}
      >
        รายงานทีม
      </Typography>

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
            xl: 'repeat(4, 1fr)',
          },

          gap: '18px',
          marginBottom: '24px',
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              minHeight: '140px',
              padding: '20px',

              backgroundColor: '#FFFFFF',

              border: '1px solid #E5E7EB',
              borderRadius: '14px',
            }}
          >
            <Box
              sx={{
                width: '50px',
                height: '50px',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                backgroundColor:
                  card.backgroundColor,

                color: card.color,

                borderRadius: '11px',

                fontSize: '20px',
                fontWeight: 800,
              }}
            >
              {card.value}
            </Box>

            <Typography
              sx={{
                color: '#111827',

                fontSize: '14px',
                fontWeight: 800,

                marginTop: '13px',
              }}
            >
              {card.title}
            </Typography>
          </Paper>
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

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color: '#111827',

              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            ประวัติการลาของลูกทีม
          </Typography>

          <Typography
            sx={{
              color: '#64748B',

              fontSize: '12px',

              marginTop: '4px',
            }}
          >
            แสดง {filteredRequests.length} รายการ
          </Typography>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                md: 'repeat(2, 1fr)',
              },

              gap: '16px',

              marginTop: '20px',
            }}
          >
            {/* สถานะ */}
            <FormControl fullWidth>
              <InputLabel>
                สถานะ
              </InputLabel>

              <Select
                value={status}
                label="สถานะ"
                onChange={(event) =>
                  setStatus(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',
                  borderRadius: '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกสถานะ
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

            {/* ประเภทการลา */}
            <FormControl fullWidth>
              <InputLabel>
                ประเภทการลา
              </InputLabel>

              <Select
                value={leaveType}
                label="ประเภทการลา"
                onChange={(event) =>
                  setLeaveType(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',
                  borderRadius: '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกประเภท
                </MenuItem>

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
            />

            {/* วันที่สิ้นสุด */}
            <ThaiDateField
              label="วันที่สิ้นสุด"
              value={endDate}
              onChange={setEndDate}
            />

            {/* ล้างตัวกรอง */}
            <Button
              type="button"
              variant="outlined"
              onClick={clearFilters}
              sx={{
                height: '48px',

                gridColumn: {
                  xs: 'auto',
                  md: '1 / 2',
                },

                color: '#475569',

                borderColor: '#CBD5E1',
                borderRadius: '9px',

                fontSize: '12px',
                fontWeight: 700,

                textTransform: 'none',

                '&:hover': {
                  backgroundColor: '#F8FAFC',
                  borderColor: '#94A3B8',
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
                minWidth: '950px',
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
                    'การดำเนินการ',
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
                {filteredRequests.map(
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
                            {request.requestNo ||
                              `#${request.id}`}
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

                        {/* Action */}
                        <TableCell>
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() =>
                              navigate(
                                `/supervisor/approval/${request.id}`,
                              )
                            }
                            sx={{
                              height: '34px',

                              color:
                                theme.primary,

                              borderColor:
                                theme.border,

                              borderRadius:
                                '8px',

                              fontSize:
                                '11px',

                              fontWeight: 700,

                              textTransform:
                                'none',

                              '&:hover': {
                                backgroundColor:
                                  theme.soft,

                                borderColor:
                                  theme.primary,
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
              ลองเปลี่ยนหรือล้างตัวกรอง
            </Typography>
          </Box>
        )}
      </Paper>
    </SupervisorLayout>
  );
}

export default SupervisorReportsPage;