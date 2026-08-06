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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import RoleLayout from '../../components/rolelayout.jsx';

import { getSupervisorApprovals } from '../../api/leave-service.js';

const supervisorMenuItems = [
  'Dashboard',
  'Leave Request',
  'My Requests',
  'Leave Balance',
  'Approval',
  'Team Reports',
  'Notification',
  'Profile',
  'Change Password',
  'Logout',
];

const supervisorTheme = {
  primary: '#7C3AED',
  dark: '#6D28D9',
  soft: '#F3E8FF',
  border: '#DDD6FE',
  text: '#5B21B6',
};

const formatDate = (dateString) => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(
    `${dateString}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const formatDateTime = (
  dateTimeString,
) => {
  if (!dateTimeString) {
    return '-';
  }

  const date = new Date(
    dateTimeString,
  );

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
};

function ApprovalPendingListPage() {
  const navigate = useNavigate();

  const [
    requests,
    setRequests,
  ] = useState([]);

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

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadPendingRequests = useCallback(async () => { setLoading(true); setLoadError(''); try { setRequests(await getSupervisorApprovals()); setPage(0); } catch (error) { setLoadError(error.response?.data?.message || 'Unable to load pending approvals.'); } finally { setLoading(false); } }, []);

  useEffect(() => {
    loadPendingRequests();

    return undefined;
  }, [loadPendingRequests]);

  const leaveTypeOptions =
    useMemo(
      () =>
        [
          ...new Set(
            requests
              .map(
                (request) =>
                  request.leaveType,
              )
              .filter(Boolean),
          ),
        ].sort(),
      [requests],
    );

  const departmentOptions =
    useMemo(
      () =>
        [
          ...new Set(
            requests
              .map(
                (request) =>
                  request.department,
              )
              .filter(Boolean),
          ),
        ].sort(),
      [requests],
    );

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
      const firstRow =
        page * rowsPerPage;

      return filteredRequests.slice(
        firstRow,
        firstRow + rowsPerPage,
      );
    }, [
      filteredRequests,
      page,
      rowsPerPage,
    ]);

  const totalPendingDays =
    useMemo(
      () =>
        requests.reduce(
          (
            totalDays,
            request,
          ) =>
            totalDays +
            Number(
              request.leaveDays ||
                0,
            ),
          0,
        ),
      [requests],
    );

  const submittedToday =
    useMemo(() => {
      const today =
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          );

      return requests.filter(
        (request) =>
          request.submittedAt
            ?.slice(
              0,
              10,
            ) === today,
      ).length;
    }, [requests]);

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

  const summaryCards = [
    {
      title:
        'Pending Approval',

      value:
        requests.length,

      helper:
        'Requests awaiting your review',

      backgroundColor:
        '#F3E8FF',

      color:
        '#7C3AED',
    },
    {
      title:
        'Submitted Today',

      value:
        submittedToday,

      helper:
        'New requests received today',

      backgroundColor:
        '#DBEAFE',

      color:
        '#2563EB',
    },
    {
      title:
        'Total Leave Days',

      value:
        totalPendingDays,

      helper:
        'Days requested in pending items',

      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    },
  ];

  return (
    <RoleLayout
      activeMenu="Approval"
      menuItems={
        supervisorMenuItems
      }
      theme={
        supervisorTheme
      }
    >
      {(loading || loadError) && <Typography sx={{ marginBottom:'16px', color:loadError?'#B91C1C':'#6B7280' }}>{loadError || 'Loading pending approvals...'}</Typography>}
      <Box
        sx={{
          marginBottom:
            '28px',
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
          Pending Approval
        </Typography>

        <Typography
          sx={{
            color:
              '#6B7280',

            fontSize:
              '15px',

            marginTop:
              '6px',
          }}
        >
          Review leave requests
          submitted by your team.
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
                padding:
                  '22px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '12px',
              }}
            >
              <Box
                sx={{
                  width:
                    '48px',

                  height:
                    '48px',

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
                    '10px',

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
                    '16px',

                  fontWeight:
                    800,

                  marginTop:
                    '15px',
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '12px',

                  lineHeight:
                    1.6,

                  marginTop:
                    '4px',
                }}
              >
                {card.helper}
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
            '12px',

          overflow:
            'hidden',
        }}
      >
        <Box
          sx={{
            padding: {
              xs:
                '20px',

              sm:
                '24px',
            },

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
            Leave Requests
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '14px',

              marginTop:
                '4px',
            }}
          >
            Showing{' '}
            {
              filteredRequests.length
            }{' '}
            of {requests.length}{' '}
            pending requests
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
                '16px',

              marginTop:
                '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Request"
              placeholder="Request number, employee or leave type"
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
                      '8px',

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
              <InputLabel id="approval-leave-type-filter-label">
                Leave Type
              </InputLabel>

              <Select
                labelId="approval-leave-type-filter-label"
                value={
                  leaveTypeFilter
                }
                label="Leave Type"
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
                    '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        supervisorTheme.primary,
                    },
                }}
              >
                <MenuItem value="all">
                  All Leave Types
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
                      {leaveType}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel id="approval-department-filter-label">
                Department
              </InputLabel>

              <Select
                labelId="approval-department-filter-label"
                value={
                  departmentFilter
                }
                label="Department"
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
                    '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        supervisorTheme.primary,
                    },
                }}
              >
                <MenuItem value="all">
                  All Departments
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
                      {department}
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
                  '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

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
              Clear
            </Button>
          </Box>
        </Box>

        {filteredRequests.length >
        0 ? (
          <>
            <TableContainer>
              <Table
                sx={{
                  minWidth:
                    '1180px',
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        '#F9FAFB',
                    }}
                  >
                    {[
                      'Request Number',
                      'Employee',
                      'Department',
                      'Leave Type',
                      'Date Range',
                      'Days',
                      'Status',
                      'Submitted',
                      'Action',
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
                            'Action'
                              ? 'right'
                              : heading ===
                                  'Days'
                                ? 'center'
                                : 'left'
                          }
                          sx={{
                            color:
                              '#6B7280',

                            fontSize:
                              '11px',

                            fontWeight:
                              800,

                            textTransform:
                              'uppercase',

                            letterSpacing:
                              '0.4px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {heading}
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
                              '1px solid #E5E7EB',
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
                            {request.requestNo ||
                              `Request #${request.id}`}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
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
                            {
                              request.employeeName
                            }
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#9CA3AF',

                              fontSize:
                                '11px',

                              marginTop:
                                '3px',
                            }}
                          >
                            {
                              request.employeeCode
                            }
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#4B5563',

                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {
                            request.department
                          }
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#374151',

                            fontSize:
                              '13px',

                            fontWeight:
                              700,

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {request.leaveType ||
                            'Not selected'}
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#4B5563',

                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {formatDate(
                            request.startDate,
                          )}{' '}
                          –{' '}
                          {formatDate(
                            request.endDate,
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            color:
                              '#111827',

                            fontSize:
                              '13px',

                            fontWeight:
                              800,

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {Number(
                            request.leaveDays ||
                              0,
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label="Pending"
                            size="small"
                            sx={{
                              minWidth:
                                '78px',

                              backgroundColor:
                                '#FEF3C7',

                              color:
                                '#B45309',

                              borderRadius:
                                '999px',

                              fontSize:
                                '11px',

                              fontWeight:
                                700,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#6B7280',

                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
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
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Button
                            type="button"
                            variant="contained"
                            onClick={() =>
                              navigate(
                                `/supervisor/approval/${request.id}`,
                              )
                            }
                            sx={{
                              minWidth:
                                '110px',

                              height:
                                '36px',

                              padding:
                                '0 14px',

                              backgroundColor:
                                supervisorTheme.primary,

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

                              '&:hover':
                                {
                                  backgroundColor:
                                    supervisorTheme.dark,

                                  boxShadow:
                                    'none',
                                },
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={
                filteredRequests.length
              }
              page={
                page
              }
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
              ]}
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
                '320px',

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
                  '66px',

                height:
                  '66px',

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
                  '24px',

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
                  '18px',

                fontWeight:
                  800,

                marginTop:
                  '16px',
              }}
            >
              No pending requests
            </Typography>

            <Typography
              sx={{
                maxWidth:
                  '420px',

                color:
                  '#6B7280',

                fontSize:
                  '14px',

                lineHeight:
                  1.7,

                marginTop:
                  '6px',
              }}
            >
              There are currently no
              leave requests awaiting
              approval, or no requests
              match the selected
              filters.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                height:
                  '42px',

                marginTop:
                  '20px',

                padding:
                  '0 18px',

                color:
                  supervisorTheme.primary,

                borderColor:
                  supervisorTheme.primary,

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    supervisorTheme.soft,

                  borderColor:
                    supervisorTheme.dark,
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>
    </RoleLayout>
  );
}

export default ApprovalPendingListPage;
