import { useMemo, useState } from 'react';
import {
  Alert,
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
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SupervisorLayout from '../../layouts/supervisorlayout.jsx';

const teamLeaveRequests = [
  {
    id: 1,
    requestNo: 'LR-20260720-0013',
    employeeCode: 'EMP001',
    employeeName: 'Employee User',
    department: 'Information Technology',
    leaveType: 'Annual Leave',
    startDate: '2026-07-30',
    endDate: '2026-07-31',
    leaveDays: 2,
    status: 'pending',
    submittedAt: '2026-07-20T14:05:00',
  },
  {
    id: 2,
    requestNo: 'LR-20260718-0011',
    employeeCode: 'EMP005',
    employeeName: 'Kanya Somjai',
    department: 'Information Technology',
    leaveType: 'Sick Leave',
    startDate: '2026-07-18',
    endDate: '2026-07-18',
    leaveDays: 1,
    status: 'approved',
    submittedAt: '2026-07-18T08:20:00',
  },
  {
    id: 3,
    requestNo: 'LR-20260715-0009',
    employeeCode: 'EMP007',
    employeeName: 'Thana Prasert',
    department: 'Information Technology',
    leaveType: 'Personal Leave',
    startDate: '2026-07-16',
    endDate: '2026-07-16',
    leaveDays: 1,
    status: 'rejected',
    submittedAt: '2026-07-15T10:15:00',
  },
  {
    id: 4,
    requestNo: 'LR-20260710-0006',
    employeeCode: 'EMP003',
    employeeName: 'Nicha Charoen',
    department: 'Information Technology',
    leaveType: 'Annual Leave',
    startDate: '2026-07-22',
    endDate: '2026-07-24',
    leaveDays: 3,
    status: 'approved',
    submittedAt: '2026-07-10T13:40:00',
  },
  {
    id: 5,
    requestNo: 'LR-20260708-0005',
    employeeCode: 'EMP009',
    employeeName: 'Pasin Wattanakul',
    department: 'Information Technology',
    leaveType: 'Sick Leave',
    startDate: '2026-07-09',
    endDate: '2026-07-10',
    leaveDays: 2,
    status: 'cancelled',
    submittedAt: '2026-07-08T09:30:00',
  },
  {
    id: 6,
    requestNo: 'LR-20260628-0004',
    employeeCode: 'EMP006',
    employeeName: 'Mali Suksan',
    department: 'Information Technology',
    leaveType: 'Annual Leave',
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    leaveDays: 3,
    status: 'approved',
    submittedAt: '2026-06-28T11:10:00',
  },
  {
    id: 7,
    requestNo: 'LR-20260620-0002',
    employeeCode: 'EMP002',
    employeeName: 'Arthit Boonmee',
    department: 'Information Technology',
    leaveType: 'Personal Leave',
    startDate: '2026-06-23',
    endDate: '2026-06-23',
    leaveDays: 1,
    status: 'rejected',
    submittedAt: '2026-06-20T15:25:00',
  },
];

const statusStyles = {
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
    color: '#6B7280',
  },
};

function SupervisorReportsPage() {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveTypeFilter, setLeaveTypeFilter] =
    useState('all');
  const [startDateFilter, setStartDateFilter] =
    useState('');
  const [endDateFilter, setEndDateFilter] =
    useState('');
  const [message, setMessage] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredRequests = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return teamLeaveRequests.filter((request) => {
      const matchesSearch =
        !keyword ||
        request.requestNo.toLowerCase().includes(keyword) ||
        request.employeeCode
          .toLowerCase()
          .includes(keyword) ||
        request.employeeName
          .toLowerCase()
          .includes(keyword) ||
        request.leaveType.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'all' ||
        request.status === statusFilter;

      const matchesLeaveType =
        leaveTypeFilter === 'all' ||
        request.leaveType === leaveTypeFilter;

      const matchesStartDate =
        !startDateFilter ||
        request.startDate >= startDateFilter;

      const matchesEndDate =
        !endDateFilter ||
        request.endDate <= endDateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLeaveType &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    searchText,
    statusFilter,
    leaveTypeFilter,
    startDateFilter,
    endDateFilter,
  ]);

  const paginatedRequests = useMemo(() => {
    const startIndex = page * rowsPerPage;

    return filteredRequests.slice(
      startIndex,
      startIndex + rowsPerPage,
    );
  }, [filteredRequests, page, rowsPerPage]);

  const summary = useMemo(
    () => ({
      total: filteredRequests.length,

      pending: filteredRequests.filter(
        (request) => request.status === 'pending',
      ).length,

      approved: filteredRequests.filter(
        (request) => request.status === 'approved',
      ).length,

      rejected: filteredRequests.filter(
        (request) => request.status === 'rejected',
      ).length,

      leaveDays: filteredRequests.reduce(
        (total, request) =>
          total + Number(request.leaveDays),
        0,
      ),
    }),
    [filteredRequests],
  );

  const leaveTypes = useMemo(
    () => [
      ...new Set(
        teamLeaveRequests.map(
          (request) => request.leaveType,
        ),
      ),
    ],
    [],
  );

  const formatStatus = (status) =>
    status.charAt(0).toUpperCase() +
    status.slice(1);

  const formatDate = (dateString) => {
    if (!dateString) {
      return '-';
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
      return '-';
    }

    const date = new Date(dateTimeString);

    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setLeaveTypeFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
    setPage(0);
    setMessage(null);
  };

  const handleViewDetail = (request) => {
    setMessage({
      severity: 'info',
      text: `${request.requestNo} was selected. The team Leave Request Detail page will open after routing is connected.`,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleExportExcel = () => {
    if (filteredRequests.length === 0) {
      setMessage({
        severity: 'warning',
        text: 'There is no report data to export with the selected filters.',
      });

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    console.log({
      action: 'export-supervisor-team-report',
      filters: {
        searchText,
        statusFilter,
        leaveTypeFilter,
        startDateFilter,
        endDateFilter,
      },
      requests: filteredRequests,
    });

    setMessage({
      severity: 'success',
      text: `${filteredRequests.length} team leave request record(s) are ready for Excel export. The file will be generated after the report API is connected.`,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(0);
    setMessage(null);
  };

  const summaryCards = [
    {
      title: 'Total Requests',
      value: summary.total,
      backgroundColor: '#F5F3FF',
      color: '#7C3AED',
    },
    {
      title: 'Pending',
      value: summary.pending,
      backgroundColor: '#FEF3C7',
      color: '#B45309',
    },
    {
      title: 'Approved',
      value: summary.approved,
      backgroundColor: '#DCFCE7',
      color: '#15803D',
    },
    {
      title: 'Rejected',
      value: summary.rejected,
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
    },
    {
      title: 'Total Leave Days',
      value: summary.leaveDays,
      backgroundColor: '#EFF6FF',
      color: '#2563EB',
    },
  ];

  return (
    <SupervisorLayout activeMenu="Team Reports">
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          gap: '18px',
          marginBottom: '28px',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              color: '#111827',
              fontSize: {
                xs: '26px',
                sm: '30px',
              },
              fontWeight: 800,
            }}
          >
            Team Reports
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            Review and export leave request information
            for employees under your supervision.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={handleExportExcel}
          sx={{
            minWidth: '145px',
            height: '44px',
            padding: '0 20px',
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',

            '&:hover': {
              backgroundColor: '#6D28D9',
              boxShadow: 'none',
            },
          }}
        >
          Export Excel
        </Button>
      </Box>

      {message && (
        <Alert
          severity={message.severity}
          onClose={() => setMessage(null)}
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {message.text}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(5, minmax(0, 1fr))',
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
              padding: '18px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
            }}
          >
            <Box
              sx={{
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: card.backgroundColor,
                color: card.color,
                borderRadius: '11px',
                fontSize: '18px',
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

      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            padding: {
              xs: '20px',
              sm: '24px',
            },
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <Typography
            sx={{
              color: '#111827',
              fontSize: '18px',
              fontWeight: 800,
            }}
          >
            Team Leave Request Report
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            Showing {filteredRequests.length} of{' '}
            {teamLeaveRequests.length} records
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'repeat(2, minmax(0, 1fr))',
                xl: 'minmax(250px, 1.5fr) repeat(4, minmax(150px, 0.8fr))',
              },
              gap: '16px',
              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search"
              placeholder="Request number, employee or leave type"
              value={searchText}
              onChange={(event) =>
                handleFilterChange(
                  setSearchText,
                  event.target.value,
                )
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused fieldset': {
                    borderColor: '#7C3AED',
                  },
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#7C3AED',
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="team-report-status-label">
                Status
              </InputLabel>

              <Select
                labelId="team-report-status-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  handleFilterChange(
                    setStatusFilter,
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: '#7C3AED',
                    },
                }}
              >
                <MenuItem value="all">
                  All Statuses
                </MenuItem>

                <MenuItem value="pending">
                  Pending
                </MenuItem>

                <MenuItem value="approved">
                  Approved
                </MenuItem>

                <MenuItem value="rejected">
                  Rejected
                </MenuItem>

                <MenuItem value="cancelled">
                  Cancelled
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="team-report-leave-type-label">
                Leave Type
              </InputLabel>

              <Select
                labelId="team-report-leave-type-label"
                value={leaveTypeFilter}
                label="Leave Type"
                onChange={(event) =>
                  handleFilterChange(
                    setLeaveTypeFilter,
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: '#7C3AED',
                    },
                }}
              >
                <MenuItem value="all">
                  All Leave Types
                </MenuItem>

                {leaveTypes.map((leaveType) => (
                  <MenuItem
                    key={leaveType}
                    value={leaveType}
                  >
                    {leaveType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={startDateFilter}
              onChange={(event) =>
                handleFilterChange(
                  setStartDateFilter,
                  event.target.value,
                )
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused fieldset': {
                    borderColor: '#7C3AED',
                  },
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#7C3AED',
                },
              }}
            />

            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={endDateFilter}
              onChange={(event) =>
                handleFilterChange(
                  setEndDateFilter,
                  event.target.value,
                )
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused fieldset': {
                    borderColor: '#7C3AED',
                  },
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#7C3AED',
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '14px',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                minWidth: '110px',
                height: '42px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: '#F9FAFB',
                  borderColor: '#9CA3AF',
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>

        {filteredRequests.length > 0 ? (
          <>
            <Box
              sx={{
                width: '100%',
                overflowX: 'auto',
              }}
            >
              <Table
                sx={{
                  minWidth: '1250px',
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    {[
                      'Request Number',
                      'Employee',
                      'Leave Type',
                      'Date Range',
                      'Days',
                      'Status',
                      'Submitted',
                      'Action',
                    ].map((heading) => (
                      <TableCell
                        key={heading}
                        align={
                          heading === 'Action'
                            ? 'right'
                            : heading === 'Days'
                              ? 'center'
                              : 'left'
                        }
                        sx={{
                          color: '#6B7280',
                          fontSize: '12px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px',
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
                  {paginatedRequests.map((request) => {
                    const statusStyle =
                      statusStyles[request.status];

                    return (
                      <TableRow
                        key={request.id}
                        hover
                        sx={{
                          '&:last-child td': {
                            borderBottom: 'none',
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            color: '#111827',
                            fontSize: '13px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {request.requestNo}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#111827',
                              fontSize: '13px',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {request.employeeName}
                          </Typography>

                          <Typography
                            sx={{
                              color: '#9CA3AF',
                              fontSize: '11px',
                              marginTop: '3px',
                            }}
                          >
                            {request.employeeCode}
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            color: '#374151',
                            fontSize: '13px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {request.leaveType}
                        </TableCell>

                        <TableCell
                          sx={{
                            color: '#4B5563',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {formatDate(request.startDate)} –{' '}
                          {formatDate(request.endDate)}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            color: '#111827',
                            fontSize: '13px',
                            fontWeight: 800,
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {request.leaveDays}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={formatStatus(
                              request.status,
                            )}
                            size="small"
                            sx={{
                              minWidth: '80px',
                              backgroundColor:
                                statusStyle.backgroundColor,
                              color: statusStyle.color,
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            color: '#6B7280',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
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
                            whiteSpace: 'nowrap',
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() =>
                              handleViewDetail(request)
                            }
                            sx={{
                              minWidth: '76px',
                              height: '36px',
                              padding: '0 12px',
                              color: '#7C3AED',
                              borderColor: '#7C3AED',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'none',

                              '&:hover': {
                                backgroundColor: '#F5F3FF',
                                borderColor: '#6D28D9',
                              },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            <TablePagination
              component="div"
              count={filteredRequests.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={
                handleRowsPerPageChange
              }
              rowsPerPageOptions={[5, 10]}
              sx={{
                borderTop: '1px solid #E5E7EB',
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              minHeight: '300px',
              padding: '40px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#F5F3FF',
                color: '#7C3AED',
                borderRadius: '50%',
                fontSize: '24px',
                fontWeight: 800,
              }}
            >
              0
            </Box>

            <Typography
              sx={{
                color: '#111827',
                fontSize: '18px',
                fontWeight: 800,
                marginTop: '16px',
              }}
            >
              No report data found
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '6px',
              }}
            >
              Try changing or clearing the selected filters.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                height: '42px',
                marginTop: '20px',
                padding: '0 18px',
                color: '#7C3AED',
                borderColor: '#7C3AED',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: '#F5F3FF',
                  borderColor: '#6D28D9',
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          padding: {
            xs: '20px',
            sm: '24px',
          },
          marginTop: '24px',
          backgroundColor: '#F5F3FF',
          border: '1px solid #DDD6FE',
          borderRadius: '12px',
        }}
      >
        <Typography
          sx={{
            color: '#6D28D9',
            fontSize: '15px',
            fontWeight: 800,
          }}
        >
          Report Access
        </Typography>

        <Typography
          sx={{
            color: '#5B21B6',
            fontSize: '13px',
            lineHeight: 1.8,
            marginTop: '8px',
          }}
        >
          This report contains leave requests only from
          employees assigned to the current supervisor.
          Organization-wide reports remain available to HR.
        </Typography>
      </Paper>
    </SupervisorLayout>
  );
}

export default SupervisorReportsPage;