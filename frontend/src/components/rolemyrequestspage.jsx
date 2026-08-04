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
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  cancelLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequests,
} from '../utils/leaverequeststorage.js';

function RoleMyRequestsPage({
  LayoutComponent,
  theme,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathRole =
    location.pathname.split('/')[1];

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(pathRole)
    ? pathRole
    : 'employee';

  const [requests, setRequests] =
    useState([]);

  const [searchText, setSearchText] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [yearFilter, setYearFilter] =
    useState('all');

  const [message, setMessage] =
    useState(null);

  const [
    selectedRequest,
    setSelectedRequest,
  ] = useState(null);

  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);

  const [page, setPage] =
    useState(0);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(5);

  useEffect(() => {
    const storedRequests =
      getLeaveRequests({
        role: currentRole,
      });

    setRequests(storedRequests);
    setPage(0);
    setMessage(null);
  }, [currentRole]);

  const reloadRequests = () => {
    const storedRequests =
      getLeaveRequests({
        role: currentRole,
      });

    setRequests(storedRequests);
  };

  const availableYears =
    useMemo(() => {
      const years = requests
        .filter(
          (request) =>
            Boolean(request.startDate),
        )
        .map((request) =>
          request.startDate.slice(0, 4),
        );

      return [...new Set(years)].sort(
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
            `draft-${request.id}`;

          const leaveType =
            request.leaveType || '';

          const reason =
            request.reason || '';

          const status =
            request.status || '';

          const matchesSearch =
            !keyword ||
            requestNumber
              .toLowerCase()
              .includes(keyword) ||
            leaveType
              .toLowerCase()
              .includes(keyword) ||
            reason
              .toLowerCase()
              .includes(keyword) ||
            status
              .toLowerCase()
              .includes(keyword);

          const matchesStatus =
            statusFilter === 'all' ||
            status === statusFilter;

          const matchesYear =
            yearFilter === 'all' ||
            request.startDate?.startsWith(
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
        firstRow + rowsPerPage;

      return filteredRequests.slice(
        firstRow,
        lastRow,
      );
    }, [
      filteredRequests,
      page,
      rowsPerPage,
    ]);

  const summary = useMemo(
    () => ({
      total: requests.length,

      draft: requests.filter(
        (request) =>
          request.status === 'draft',
      ).length,

      pending: requests.filter(
        (request) =>
          request.status === 'pending',
      ).length,

      approved: requests.filter(
        (request) =>
          request.status ===
          'approved',
      ).length,

      rejected: requests.filter(
        (request) =>
          request.status ===
          'rejected',
      ).length,

      cancelled: requests.filter(
        (request) =>
          request.status ===
          'cancelled',
      ).length,
    }),
    [requests],
  );

  const formatStatus = (status) => {
    if (!status) {
      return '-';
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatDate = (
    dateString,
  ) => {
    if (!dateString) {
      return '-';
    }

    const date = new Date(
      `${dateString}T00:00:00`,
    );

    if (
      Number.isNaN(date.getTime())
    ) {
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

    const date =
      new Date(dateTimeString);

    if (
      Number.isNaN(date.getTime())
    ) {
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

  const getStatusStyle = (
    status,
  ) => {
    const statusStyles = {
      draft: {
        backgroundColor:
          '#F3F4F6',
        color: '#4B5563',
      },

      pending: {
        backgroundColor:
          '#FEF3C7',
        color: '#B45309',
      },

      approved: {
        backgroundColor:
          '#DCFCE7',
        color: '#15803D',
      },

      rejected: {
        backgroundColor:
          '#FEE2E2',
        color: '#B91C1C',
      },

      cancelled: {
        backgroundColor:
          '#E5E7EB',
        color: '#6B7280',
      },
    };

    return (
      statusStyles[status] || {
        backgroundColor:
          '#F3F4F6',
        color: '#4B5563',
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

  const handleClearFilters = () => {
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

  const handleEditDraft = (
    request,
  ) => {
    if (
      request.status !== 'draft'
    ) {
      return;
    }

    navigate(
      `/${currentRole}/leave-request?edit=${request.id}`,
    );
  };

  const openConfirmation = (
    action,
    request,
  ) => {
    setConfirmAction(action);
    setSelectedRequest(request);
    setMessage(null);
  };

  const closeConfirmation = () => {
    setConfirmAction(null);
    setSelectedRequest(null);
  };

  const handleConfirmAction =
    () => {
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
        const wasDeleted =
          deleteLeaveRequest(
            selectedRequest.id,
          );

        if (wasDeleted) {
          reloadRequests();

          setMessage({
            severity: 'success',

            text: `Draft #${selectedRequest.id} was deleted successfully.`,
          });
        } else {
          setMessage({
            severity: 'error',

            text: 'The selected request could not be deleted. Only Draft requests can be deleted.',
          });
        }
      }

      if (
        confirmAction ===
          'cancel' &&
        selectedRequest.status ===
          'pending'
      ) {
        const cancelledRequest =
          cancelLeaveRequest(
            selectedRequest.id,
          );

        if (cancelledRequest) {
          reloadRequests();

          setMessage({
            severity: 'success',

            text: `${selectedRequest.requestNo} was cancelled successfully.`,
          });
        } else {
          setMessage({
            severity: 'error',

            text: 'The selected request could not be cancelled.',
          });
        }
      }

      closeConfirmation();
      setPage(0);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
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
        Number(event.target.value),
      );

      setPage(0);
    };

  const summaryCards = [
    {
      title: 'Total Requests',
      value: summary.total,
      backgroundColor: theme.soft,
      color: theme.primary,
    },
    {
      title: 'Draft',
      value: summary.draft,
      backgroundColor: '#F3F4F6',
      color: '#4B5563',
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
      title: 'Cancelled',
      value: summary.cancelled,
      backgroundColor: '#E5E7EB',
      color: '#6B7280',
    },
  ];

  const confirmationTitle =
    confirmAction === 'delete'
      ? 'Delete Draft'
      : 'Cancel Leave Request';

  const confirmationDescription =
    confirmAction === 'delete'
      ? 'Are you sure you want to delete this draft? This action cannot be undone.'
      : 'Are you sure you want to cancel this pending leave request?';

  const confirmationButtonText =
    confirmAction === 'delete'
      ? 'Delete Draft'
      : 'Cancel Request';

  return (
    <LayoutComponent activeMenu="My Requests">
      <Box
        sx={{
          marginBottom: '28px',
        }}
      >
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
          My Requests
        </Typography>

        <Typography
          sx={{
            color: '#6B7280',
            fontSize: '15px',
            marginTop: '6px',
          }}
        >
          Review and manage your own
          leave requests.
        </Typography>
      </Box>

      {message && (
        <Alert
          severity={message.severity}
          onClose={() =>
            setMessage(null)
          }
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

            xl: 'repeat(6, minmax(0, 1fr))',
          },

          gap: '18px',

          marginBottom: '24px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <Paper
              key={card.title}
              elevation={0}
              sx={{
                padding: '18px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius: '12px',
              }}
            >
              <Box
                sx={{
                  width: '42px',
                  height: '42px',

                  display: 'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    card.backgroundColor,

                  color: card.color,

                  borderRadius:
                    '10px',

                  fontSize: '17px',

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
          ),
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',

          border:
            '1px solid #E5E7EB',

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
            Leave Request List
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '14px',

              marginTop: '4px',
            }}
          >
            Showing{' '}
            {filteredRequests.length}{' '}
            of {requests.length}{' '}
            requests
          </Typography>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                lg: 'minmax(280px, 1.5fr) repeat(2, minmax(170px, 0.7fr)) auto',
              },

              gap: '16px',

              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Request"
              placeholder="Request number, leave type or reason"
              value={searchText}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value,
                )
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    height: '48px',

                    borderRadius:
                      '8px',

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

            <FormControl fullWidth>
              <InputLabel id="request-status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="request-status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  handleStatusFilterChange(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                <MenuItem value="all">
                  All Statuses
                </MenuItem>

                <MenuItem value="draft">
                  Draft
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
              <InputLabel id="request-year-filter-label">
                Year
              </InputLabel>

              <Select
                labelId="request-year-filter-label"
                value={yearFilter}
                label="Year"
                onChange={(event) =>
                  handleYearFilterChange(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        theme.primary,
                    },
                }}
              >
                <MenuItem value="all">
                  All Years
                </MenuItem>

                {availableYears.map(
                  (year) => (
                    <MenuItem
                      key={year}
                      value={year}
                    >
                      {year}
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
                minWidth: '110px',

                height: '48px',

                padding: '0 18px',

                color: '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius: '8px',

                fontSize: '14px',

                fontWeight: 700,

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
            <Box
              sx={{
                width: '100%',

                overflowX: 'auto',
              }}
            >
              <Table
                sx={{
                  minWidth: '1120px',
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
                      'Leave Type',
                      'Date Range',
                      'Days',
                      'Status',
                      'Submitted',
                      'Actions',
                    ].map((heading) => (
                      <TableCell
                        key={heading}
                        align={
                          heading ===
                          'Actions'
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
                            '12px',

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
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedRequests.map(
                    (request) => {
                      const statusStyle =
                        getStatusStyle(
                          request.status,
                        );

                      return (
                        <TableRow
                          key={request.id}
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
                                `Draft #${request.id}`}
                            </Typography>

                            {!request.requestNo && (
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
                                Number assigned
                                after submission
                              </Typography>
                            )}
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
                            {request.leaveDays ||
                              0}
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
                                minWidth:
                                  '78px',

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
                            <Box
                              sx={{
                                display:
                                  'flex',

                                justifyContent:
                                  'flex-end',

                                gap: '8px',
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
                                    '64px',

                                  height:
                                    '36px',

                                  padding:
                                    '0 12px',

                                  color:
                                    theme.primary,

                                  borderColor:
                                    theme.primary,

                                  borderRadius:
                                    '8px',

                                  fontSize:
                                    '12px',

                                  fontWeight:
                                    700,

                                  textTransform:
                                    'none',

                                  '&:hover':
                                    {
                                      backgroundColor:
                                        theme.soft,

                                      borderColor:
                                        theme.dark,
                                    },
                                }}
                              >
                                View
                              </Button>

                              {request.status ===
                                'draft' && (
                                <>
                                  <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() =>
                                      handleEditDraft(
                                        request,
                                      )
                                    }
                                    sx={{
                                      minWidth:
                                        '64px',

                                      height:
                                        '36px',

                                      padding:
                                        '0 12px',

                                      color:
                                        '#2563EB',

                                      borderColor:
                                        '#2563EB',

                                      borderRadius:
                                        '8px',

                                      fontSize:
                                        '12px',

                                      fontWeight:
                                        700,

                                      textTransform:
                                        'none',

                                      '&:hover':
                                        {
                                          backgroundColor:
                                            '#EFF6FF',
                                        },
                                    }}
                                  >
                                    Edit
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() =>
                                      openConfirmation(
                                        'delete',
                                        request,
                                      )
                                    }
                                    sx={{
                                      minWidth:
                                        '68px',

                                      height:
                                        '36px',

                                      padding:
                                        '0 12px',

                                      color:
                                        '#DC2626',

                                      borderColor:
                                        '#DC2626',

                                      borderRadius:
                                        '8px',

                                      fontSize:
                                        '12px',

                                      fontWeight:
                                        700,

                                      textTransform:
                                        'none',

                                      '&:hover':
                                        {
                                          backgroundColor:
                                            '#FEF2F2',
                                        },
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}

                              {request.status ===
                                'pending' && (
                                <Button
                                  type="button"
                                  variant="outlined"
                                  onClick={() =>
                                    openConfirmation(
                                      'cancel',
                                      request,
                                    )
                                  }
                                  sx={{
                                    minWidth:
                                      '68px',

                                    height:
                                      '36px',

                                    padding:
                                      '0 12px',

                                    color:
                                      '#B45309',

                                    borderColor:
                                      '#F59E0B',

                                    borderRadius:
                                      '8px',

                                    fontSize:
                                      '12px',

                                    fontWeight:
                                      700,

                                    textTransform:
                                      'none',

                                    '&:hover':
                                      {
                                        backgroundColor:
                                          '#FFFBEB',
                                      },
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    },
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
              sx={{
                borderTop:
                  '1px solid #E5E7EB',
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

              justifyContent:
                'center',

              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: '64px',
                height: '64px',

                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'center',

                backgroundColor:
                  theme.soft,

                color: theme.primary,

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
              No leave requests found
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',

                fontSize: '14px',

                marginTop: '6px',
              }}
            >
              Try changing or clearing
              the selected filters.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                height: '42px',

                marginTop: '20px',

                padding: '0 18px',

                color: theme.primary,

                borderColor:
                  theme.primary,

                borderRadius: '8px',

                fontSize: '14px',

                fontWeight: 700,

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
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog
        open={Boolean(
          selectedRequest &&
            confirmAction,
        )}
        onClose={closeConfirmation}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#111827',

            fontSize: '20px',

            fontWeight: 800,

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          {confirmationTitle}
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '24px !important',
          }}
        >
          <Typography
            sx={{
              color: '#4B5563',

              fontSize: '14px',

              lineHeight: 1.7,
            }}
          >
            {confirmationDescription}
          </Typography>

          {selectedRequest && (
            <Box
              sx={{
                padding: '16px',

                marginTop: '18px',

                backgroundColor:
                  '#F9FAFB',

                border:
                  '1px solid #E5E7EB',

                borderRadius: '8px',
              }}
            >
              <Typography
                sx={{
                  color: '#111827',

                  fontSize: '14px',

                  fontWeight: 800,
                }}
              >
                {selectedRequest.requestNo ||
                  `Draft #${selectedRequest.id}`}
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',

                  fontSize: '13px',

                  marginTop: '5px',
                }}
              >
                {selectedRequest.leaveType ||
                  'Not selected'}
                :{' '}
                {formatDate(
                  selectedRequest.startDate,
                )}{' '}
                –{' '}
                {formatDate(
                  selectedRequest.endDate,
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 20px',

            borderTop:
              '1px solid #E5E7EB',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={closeConfirmation}
            sx={{
              minWidth: '90px',

              height: '42px',

              color: '#374151',

              borderColor:
                '#D1D5DB',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

              textTransform:
                'none',
            }}
          >
            Back
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={
              handleConfirmAction
            }
            sx={{
              minWidth: '130px',

              height: '42px',

              backgroundColor:
                '#DC2626',

              color: '#FFFFFF',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

              textTransform:
                'none',

              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  '#B91C1C',

                boxShadow: 'none',
              },
            }}
          >
            {confirmationButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutComponent>
  );
}

export default RoleMyRequestsPage;