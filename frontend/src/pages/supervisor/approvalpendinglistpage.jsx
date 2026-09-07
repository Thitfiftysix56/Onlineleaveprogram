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
import RequestNumberText from '../../components/requestnumbertext.jsx';
import { DataListToolbar } from '../../components/shareduiprimitives.jsx';
import { HeaderlessPageTopOffset } from '../../components/sharedvisualfoundation.jsx';
import { roleAccentTokens } from '../../theme/tokens.js';

import api from '../../api/axios.js';

const supervisorTheme = roleAccentTokens.supervisor;

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

function ApprovalPendingListPage({
  LayoutComponent = SupervisorLayout,
  activeMenu = 'Approval',
  approvalsApiPath = '/supervisor/approvals',
  approvalPagePath = '/supervisor/approval',
}) {
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
  ] = useState('');

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState('');

  const [
    page,
    setPage,
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(5);

  const loadPendingRequests = useCallback(
    async () => {
      setLoading(true);
      setLoadError('');

      try {
        const response =
          await api.get(
            approvalsApiPath,
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
    },
    [approvalsApiPath],
  );

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

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
            translateLeaveType(
              request.leaveType,
            ),
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
            !leaveTypeFilter ||
            request.leaveType ===
              leaveTypeFilter;

          const matchesDepartment =
            !departmentFilter ||
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
      title: 'รออนุมัติ',
      value: requests.length,
      description: 'คำขอที่รอตรวจสอบ',
      background:
        'linear-gradient(135deg, #FFF6D8 0%, #FFFFFF 78%)',
      borderColor: '#F6D66B',
      glowColor: 'rgba(245, 158, 11, 0.11)',
      valueColor: '#B45309',
    },
    {
      title: 'ส่งคำขอวันนี้',
      value: submittedToday,
      description: 'คำขอใหม่ที่ได้รับวันนี้',
      background:
        'linear-gradient(135deg, #EAF3FF 0%, #FFFFFF 78%)',
      borderColor: '#C9DDFB',
      glowColor: 'rgba(59, 130, 246, 0.10)',
      valueColor: '#2563EB',
    },
    {
      title: 'จำนวนวันลารวม',
      value: totalPendingDays,
      description: 'วันลาจากรายการที่รออนุมัติ',
      background:
        'linear-gradient(135deg, #F1F5F9 0%, #FFFFFF 78%)',
      borderColor: '#DCE3EA',
      glowColor: 'rgba(100, 116, 139, 0.10)',
      valueColor: '#64748B',
    },
  ];

  const handleClearFilters =
    () => {
      setSearchText('');
      setLeaveTypeFilter(
        '',
      );
      setDepartmentFilter(
        '',
      );
      setPage(0);
    };

  const handleViewRequest =
    (request) => {
      navigate(
        `${approvalPagePath}/${request.id}`,
        {
          state: {
            returnTo: `${window.location.pathname}${window.location.search}`,
            returnLabel: 'รายการรออนุมัติ',
          },
        },
      );
    };

  return (
    <LayoutComponent
      activeMenu={activeMenu}
    >
      <HeaderlessPageTopOffset />

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
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, minmax(0, 1fr))',
          },
          gap: {
            xs: '12px',
            sm: '16px',
          },
          marginBottom: '16px',
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '8px',
              minHeight: '72px',
              padding: '18px',
              background: card.background,
              border: '1px solid #E6EAF0',
              borderRadius: '20px',
              boxShadow:
                '0 8px 24px rgba(15, 23, 42, 0.06)',
              transition:
                'transform 160ms ease, box-shadow 160ms ease',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '118px',
                height: '118px',
                top: '-47px',
                right: '-38px',
                borderRadius: '50%',
                backgroundColor: card.glowColor,
                filter: 'blur(3px)',
                pointerEvents: 'none',
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow:
                  '0 12px 28px rgba(15, 23, 42, 0.09)',
              },
            }}
          >
            <Typography
              noWrap
              sx={{
                position: 'relative',
                zIndex: 1,
                color: '#374151',
                fontSize: '15px',
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {card.title}
            </Typography>

            <Typography
              sx={{
                position: 'relative',
                zIndex: 1,
                color: card.valueColor,
                fontSize: '18px',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                marginTop: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {card.value}
            </Typography>

            <Typography
              sx={{
                display: 'none',
                position: 'relative',
                zIndex: 1,
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 500,
                marginTop: '8px',
              }}
            >
              {card.description}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '20px',

          overflow:
            'hidden',
        }}
      >
        <Box
          sx={{
            padding: {
              xs: '18px',
              sm: '20px 22px',
            },
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
            คำขอลาที่รอตรวจสอบ
          </Typography>

          <DataListToolbar
            searchValue={searchText}
            onSearchChange={(value) => { setSearchText(value); setPage(0); }}
            searchPlaceholder="ค้นหาพนักงานหรือคำขอลา"
            resultLabel=""
            activeFilters={[
              ...(leaveTypeFilter ? [{ key: 'type', label: `ประเภท: ${translateLeaveType(leaveTypeFilter)}`, onDelete: () => setLeaveTypeFilter('') }] : []),
              ...(departmentFilter ? [{ key: 'department', label: `แผนก: ${departmentFilter}`, onDelete: () => setDepartmentFilter('') }] : []),
            ]}
            onClearFilters={handleClearFilters}
            filters={<><FormControl size="small"><Select value={leaveTypeFilter} displayEmpty renderValue={(value) => value ? translateLeaveType(value) : 'ประเภท'} inputProps={{ 'aria-label': 'ประเภท' }} onChange={(event) => { setLeaveTypeFilter(event.target.value); setPage(0); }}>{leaveTypeOptions.map((leaveType) => <MenuItem key={leaveType} value={leaveType}>{translateLeaveType(leaveType)}</MenuItem>)}</Select></FormControl><FormControl size="small"><Select value={departmentFilter} displayEmpty renderValue={(value) => value || 'แผนก'} inputProps={{ 'aria-label': 'แผนก' }} onChange={(event) => { setDepartmentFilter(event.target.value); setPage(0); }}>{departmentOptions.map((department) => <MenuItem key={department} value={department}>{department}</MenuItem>)}</Select></FormControl></>}
            sx={{ marginTop: '16px' }}
          />

          <Box
            sx={{
              display:
                'none',

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
            <TextField fullWidth label="ค้นหาคำขอ" placeholder="เลขที่คำขอ ชื่อพนักงาน หรือประเภทการลา" value={searchText} onChange={(event) => { setSearchText(event.target.value); setPage(0); }} sx={{ '& .MuiOutlinedInput-root': { height: '44px', borderRadius: '11px', '&.Mui-focused fieldset': { borderColor: supervisorTheme.primary } }, '& .MuiInputLabel-root.Mui-focused': { color: supervisorTheme.primary } }} />
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
                  ประเภท
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
                  แผนก
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
                    '1040px',
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
                            outline: `2px solid ${supervisorTheme.primary}`,
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
                              {request.requestNo || `#${request.id}`}
                            </RequestNumberText>
                          </Typography>
                        </TableCell>

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
                            padding:
                              '16px 18px',

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
                          {translateLeaveType(
                            request.leaveType,
                          )}
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
                          {Number(
                            request.leaveDays ||
                              0,
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            padding:
                              '16px 18px',

                            color:
                              '#64748B',

                            fontSize:
                              '12px',

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
              ]}
              labelRowsPerPage="จำนวนรายการต่อหน้า:"
              labelDisplayedRows={() =>
                `หน้า ${page + 1} จาก ${Math.max(
                  1,
                  Math.ceil(
                    filteredRequests.length /
                      rowsPerPage,
                  ),
                )}`
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
                : 'ลองปรับตัวกรองหรือกดกากบาทเพื่อล้างค่าเพื่อดูรายการอื่น'}
            </Typography>

          </Box>
        )}
      </Paper>
    </LayoutComponent>
  );
}

export default ApprovalPendingListPage;
