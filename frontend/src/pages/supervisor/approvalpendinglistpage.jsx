import {
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

import api from '../../api/axios.js';

const supervisorTheme = {
  primary: '#7C3AED',
  dark: '#6D28D9',
  soft: '#F3E8FF',
  border: '#DDD6FE',
  text: '#5B21B6',
};

const translateLeaveType = (
  leaveType,
) => {
  const value = String(
    leaveType || '',
  ).trim();

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

    Other:
      'ลาอื่น ๆ',
  };

  return (
    labels[value] ||
    value ||
    '-'
  );
};

const formatDate = (
  dateValue,
) => {
  if (!dateValue) {
    return '-';
  }

  const value = String(
    dateValue,
  ).trim();

  const directMatch =
    value.match(
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

  const date =
    new Date(dateValue);

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
      date.getMonth() + 1,
    ).padStart(
      2,
      '0',
    );

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

const formatDateTime = (
  dateValue,
) => {
  if (!dateValue) {
    return '-';
  }

  const date =
    new Date(dateValue);

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
      date.getMonth() + 1,
    ).padStart(
      2,
      '0',
    );

  const hours =
    String(
      date.getHours(),
    ).padStart(
      2,
      '0',
    );

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(
      2,
      '0',
    );

  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
};

const isSubmittedToday = (
  dateValue,
) => {
  if (!dateValue) {
    return false;
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return false;
  }

  const today =
    new Date();

  return (
    date.getFullYear() ===
      today.getFullYear() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getDate() ===
      today.getDate()
  );
};

function ApprovalPendingListPage() {
  const navigate =
    useNavigate();

  const [
    requests,
    setRequests,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    leaveTypeFilter,
    setLeaveTypeFilter,
  ] = useState('all');

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState('all');

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(5);

  const loadPendingRequests =
    async () => {
      setLoading(true);
      setLoadError('');

      try {
        const response =
          await api.get(
            '/supervisor/approvals',
          );

        const leaveRequests =
          response.data?.data
            ?.leaveRequests ||
          response.data
            ?.leaveRequests ||
          [];

        const normalizedRequests =
          Array.isArray(
            leaveRequests,
          )
            ? [
                ...leaveRequests,
              ].sort(
                (
                  firstRequest,
                  secondRequest,
                ) =>
                  new Date(
                    secondRequest
                      .submittedAt ||
                      secondRequest
                        .createdAt ||
                      0,
                  ).getTime() -
                  new Date(
                    firstRequest
                      .submittedAt ||
                      firstRequest
                        .createdAt ||
                      0,
                  ).getTime(),
              )
            : [];

        setRequests(
          normalizedRequests,
        );

        setPage(0);
      } catch (error) {
        setRequests([]);

        setLoadError(
          error.response?.data
            ?.message ||
            'ไม่สามารถโหลดรายการรออนุมัติได้ กรุณาลองอีกครั้ง',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const leaveTypeOptions =
    useMemo(() => {
      return [
        ...new Set(
          requests
            .map(
              (request) =>
                request.leaveType,
            )
            .filter(Boolean),
        ),
      ].sort();
    }, [requests]);

  const departmentOptions =
    useMemo(() => {
      return [
        ...new Set(
          requests
            .map(
              (request) =>
                request.department,
            )
            .filter(Boolean),
        ),
      ].sort();
    }, [requests]);

  const filteredRequests =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return requests.filter(
        (request) => {
          const searchableText = [
            request.requestNo,
            request.employeeCode,
            request.employeeName,
            request.department,
            request.position,
            request.leaveType,
            request.reason,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const matchesSearch =
            !keyword ||
            searchableText.includes(
              keyword,
            );

          const matchesLeaveType =
            leaveTypeFilter ===
              'all' ||
            request.leaveType ===
              leaveTypeFilter;

          const matchesDepartment =
            departmentFilter ===
              'all' ||
            request.department ===
              departmentFilter;

          return (
            matchesSearch &&
            matchesLeaveType &&
            matchesDepartment
          );
        },
      );
    }, [
      requests,
      searchText,
      leaveTypeFilter,
      departmentFilter,
    ]);

  const paginatedRequests =
    useMemo(() => {
      const start =
        page * rowsPerPage;

      return filteredRequests.slice(
        start,
        start + rowsPerPage,
      );
    }, [
      filteredRequests,
      page,
      rowsPerPage,
    ]);

  const submittedToday =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            isSubmittedToday(
              request.submittedAt,
            ),
        ).length,
      [requests],
    );

  const totalPendingDays =
    useMemo(
      () =>
        requests.reduce(
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
      [requests],
    );

  const summaryCards = [
    {
      title:
        'รออนุมัติ',

      value:
        requests.length,

      description:
        'คำขอที่รอตรวจสอบ',

      backgroundColor:
        supervisorTheme.soft,

      color:
        supervisorTheme.primary,
    },

    {
      title:
        'ส่งคำขอวันนี้',

      value:
        submittedToday,

      description:
        'คำขอใหม่ที่ได้รับวันนี้',

      backgroundColor:
        '#DBEAFE',

      color:
        '#2563EB',
    },

    {
      title:
        'จำนวนวันลารวม',

      value:
        totalPendingDays,

      description:
        'วันลาจากรายการที่รออนุมัติ',

      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    },
  ];

  const handleClearFilters =
    () => {
      setSearchText('');
      setLeaveTypeFilter(
        'all',
      );
      setDepartmentFilter(
        'all',
      );
      setPage(0);
    };

  const handleViewRequest =
    (request) => {
      navigate(
        `/supervisor/approval/${request.id}`,
      );
    };

  return (
    <SupervisorLayout
      activeMenu="Approval"
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
          รายการรออนุมัติ
        </Typography>
      </Box>

      {loadError && (
        <Alert
          severity="error"
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {loadError}
        </Alert>
      )}

      <Box
        sx={{
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            md:
              'repeat(3, minmax(0, 1fr))',
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
                  '138px',

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
            คำขอลาที่รอตรวจสอบ
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
              requests.length
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

                lg:
                  'minmax(260px, 1.4fr) repeat(2, minmax(180px, 0.7fr)) auto',
              },

              gap:
                '14px',

              marginTop:
                '20px',
            }}
          >
            <TextField
              fullWidth
              label="ค้นหาคำขอ"
              placeholder="เลขที่คำขอ ชื่อพนักงาน หรือประเภทการลา"
              value={
                searchText
              }
              onChange={(
                event,
              ) => {
                setSearchText(
                  event.target
                    .value,
                );

                setPage(0);
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
                          supervisorTheme.primary,
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      supervisorTheme.primary,
                  },
              }}
            />

            <FormControl
              fullWidth
            >
              <InputLabel id="approval-leave-type-label">
                ประเภทการลา
              </InputLabel>

              <Select
                labelId="approval-leave-type-label"
                label="ประเภทการลา"
                value={
                  leaveTypeFilter
                }
                onChange={(
                  event,
                ) => {
                  setLeaveTypeFilter(
                    event.target
                      .value,
                  );

                  setPage(0);
                }}
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem
                  value="all"
                >
                  ทุกประเภท
                </MenuItem>

                {leaveTypeOptions.map(
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

            <FormControl
              fullWidth
            >
              <InputLabel id="approval-department-label">
                แผนก
              </InputLabel>

              <Select
                labelId="approval-department-label"
                label="แผนก"
                value={
                  departmentFilter
                }
                onChange={(
                  event,
                ) => {
                  setDepartmentFilter(
                    event.target
                      .value,
                  );

                  setPage(0);
                }}
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem
                  value="all"
                >
                  ทุกแผนก
                </MenuItem>

                {departmentOptions.map(
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
                  '48px',

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

        {loading ? (
          <Box
            sx={{
              minHeight:
                '260px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',
            }}
          >
            <CircularProgress
              size={34}
              sx={{
                color:
                  supervisorTheme.primary,
              }}
            />
          </Box>
        ) : filteredRequests.length >
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
                    '1120px',
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
                      'แผนก',
                      'ประเภทการลา',
                      'ช่วงวันที่',
                      'จำนวนวัน',
                      'ส่งคำขอเมื่อ',
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
                            heading ===
                            'จำนวนวัน'
                              ? 'center'
                              : heading ===
                                  'การดำเนินการ'
                                ? 'right'
                                : 'left'
                          }
                          sx={{
                            color:
                              '#64748B',

                            fontSize:
                              '11px',

                            fontWeight:
                              700,

                            whiteSpace:
                              'nowrap',

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
                  {paginatedRequests.map(
                    (
                      request,
                    ) => (
                      <TableRow
                        key={
                          request.id
                        }
                        hover
                        sx={{
                          '&:last-child td':
                            {
                              borderBottom:
                                'none',
                            },
                        }}
                      >
                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #EEF0F3',
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

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {request.requestNo ||
                              `#${request.id}`}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #EEF0F3',
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

                              marginTop:
                                '2px',
                            }}
                          >
                            {request.employeeCode ||
                              '-'}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#475569',

                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #EEF0F3',
                          }}
                        >
                          {request.department ||
                            '-'}
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#374151',

                            fontSize:
                              '12px',

                            fontWeight:
                              600,

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #EEF0F3',
                          }}
                        >
                          {translateLeaveType(
                            request.leaveType,
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#475569',

                            fontSize:
                              '12px',

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
                            color:
                              '#111827',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,

                            borderBottom:
                              '1px solid #EEF0F3',
                          }}
                        >
                          {Number(
                            request.leaveDays ||
                              0,
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#64748B',

                            fontSize:
                              '11px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #EEF0F3',
                          }}
                        >
                          {formatDateTime(
                            request.submittedAt,
                          )}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #EEF0F3',
                          }}
                        >
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() =>
                              handleViewRequest(
                                request,
                              )
                            }
                            sx={{
                              minWidth:
                                '84px',

                              height:
                                '34px',

                              padding:
                                '0 13px',

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
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </Box>

            <TablePagination
              component="div"
              count={
                filteredRequests.length
              }
              page={page}
              onPageChange={(
                event,
                newPage,
              ) =>
                setPage(
                  newPage,
                )
              }
              rowsPerPage={
                rowsPerPage
              }
              onRowsPerPageChange={(
                event,
              ) => {
                setRowsPerPage(
                  Number(
                    event.target
                      .value,
                  ),
                );

                setPage(0);
              }}
              rowsPerPageOptions={[
                5,
                10,
                20,
              ]}
              labelRowsPerPage="จำนวนต่อหน้า:"
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
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              minHeight:
                '280px',

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
                  supervisorTheme.soft,

                color:
                  supervisorTheme.primary,

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
              {requests.length ===
              0
                ? 'ไม่มีคำขอที่รออนุมัติ'
                : 'ไม่พบรายการที่ตรงกับตัวกรอง'}
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
              {requests.length ===
              0
                ? 'เมื่อพนักงานในทีมส่งคำขอลา รายการจะแสดงที่หน้านี้'
                : 'ลองเปลี่ยนหรือล้างตัวกรองเพื่อดูรายการอื่น'}
            </Typography>

            {requests.length >
              0 && (
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
                }}
              >
                ล้างตัวกรอง
              </Button>
            )}
          </Box>
        )}
      </Paper>
    </SupervisorLayout>
  );
}

export default ApprovalPendingListPage;