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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import HRLayout from '../../layouts/hrlayout.jsx';

import {
  getLeaveRequests,
  leaveRequestStorageKey,
} from '../../utils/leaverequeststorage.js';

import {
  createHRAuditLog,
} from '../../utils/auditlogstorage.js';

const employeeProfiles = {
  employee: {
    employeeId: 'EMP001',
    employeeName: 'Employee User',
    department:
      'Information Technology',
    approver: 'Supervisor User',
  },

  supervisor: {
    employeeId: 'SUP001',
    employeeName:
      'Nattapong Srisuk',
    department:
      'Information Technology',
    approver: 'Manager User',
  },

  hr: {
    employeeId: 'HR001',
    employeeName:
      'Suda Rattanapong',
    department:
      'Human Resources',
    approver: 'HR Supervisor',
  },

  admin: {
    employeeId: 'ADM001',
    employeeName:
      'Preecha Wongchai',
    department:
      'Information Technology',
    approver: 'System Manager',
  },
};

const capitalizeText = (value) => {
  const normalizedValue = String(
    value || '',
  )
    .trim()
    .toLowerCase();

  if (!normalizedValue) {
    return '';
  }

  return (
    normalizedValue
      .charAt(0)
      .toUpperCase() +
    normalizedValue.slice(1)
  );
};

const escapeXml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

function HRReportsPage() {
  const [
    leaveRequests,
    setLeaveRequests,
  ] = useState([]);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState('All');

  const [
    leaveTypeFilter,
    setLeaveTypeFilter,
  ] = useState('All');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('All');

  const [
    startDate,
    setStartDate,
  ] = useState('');

  const [
    endDate,
    setEndDate,
  ] = useState('');

  const [
    actionMessage,
    setActionMessage,
  ] = useState(null);

  const normalizeReportRequest = (
    request,
  ) => {
    const requestRole = String(
      request.role || 'employee',
    ).toLowerCase();

    const profile =
      employeeProfiles[requestRole] ||
      employeeProfiles.employee;

    const normalizedStatus =
      capitalizeText(request.status);

    return {
      ...request,

      id: Number(request.id),

      requestNo:
        request.requestNo ||
        `Request #${request.id}`,

      employeeId:
        request.employeeId ||
        request.employeeCode ||
        profile.employeeId,

      employeeName:
        request.employeeName ||
        profile.employeeName,

      department:
        request.department ||
        request.departmentName ||
        profile.department,

      leaveType:
        request.leaveType ||
        'Not specified',

      startDate:
        request.startDate || '',

      endDate:
        request.endDate || '',

      leaveDays:
        Number(
          request.leaveDays,
        ) || 0,

      status:
        normalizedStatus ||
        'Pending',

      approver:
        request.approver ||
        request.approverName ||
        profile.approver,

      submittedAt:
        request.submittedAt ||
        null,

      createdAt:
        request.createdAt ||
        null,
    };
  };

  const loadLeaveRequests = () => {
    const storedRequests =
      getLeaveRequests()
        .filter(
          (request) =>
            String(
              request.status || '',
            ).toLowerCase() !==
            'draft',
        )
        .map(
          normalizeReportRequest,
        )
        .sort(
          (
            firstRequest,
            secondRequest,
          ) => {
            const firstDate =
              new Date(
                firstRequest.submittedAt ||
                  firstRequest.createdAt ||
                  firstRequest.startDate ||
                  0,
              ).getTime();

            const secondDate =
              new Date(
                secondRequest.submittedAt ||
                  secondRequest.createdAt ||
                  secondRequest.startDate ||
                  0,
              ).getTime();

            return (
              secondDate -
              firstDate
            );
          },
        );

    setLeaveRequests(
      storedRequests,
    );
  };

  useEffect(() => {
    loadLeaveRequests();

    const handleStorageChange = (
      event,
    ) => {
      if (
        !event.key ||
        event.key ===
          leaveRequestStorageKey
      ) {
        loadLeaveRequests();
      }
    };

    const handleWindowFocus = () => {
      loadLeaveRequests();
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      handleWindowFocus,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        handleWindowFocus,
      );
    };
  }, []);

  const departments = useMemo(
    () => [
      'All',

      ...new Set(
        leaveRequests
          .map(
            (request) =>
              request.department,
          )
          .filter(Boolean),
      ),
    ],
    [leaveRequests],
  );

  const leaveTypes = useMemo(
    () => [
      'All',

      ...new Set(
        leaveRequests
          .map(
            (request) =>
              request.leaveType,
          )
          .filter(Boolean),
      ),
    ],
    [leaveRequests],
  );

  const statuses = useMemo(
    () => [
      'All',

      ...new Set(
        leaveRequests
          .map(
            (request) =>
              request.status,
          )
          .filter(Boolean),
      ),
    ],
    [leaveRequests],
  );

  const filteredRequests =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return leaveRequests.filter(
        (request) => {
          const searchableText = [
            request.requestNo,
            request.employeeId,
            request.employeeName,
            request.department,
            request.leaveType,
            request.status,
            request.approver,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const matchesSearch =
            !keyword ||
            searchableText.includes(
              keyword,
            );

          const matchesDepartment =
            departmentFilter ===
              'All' ||
            request.department ===
              departmentFilter;

          const matchesLeaveType =
            leaveTypeFilter ===
              'All' ||
            request.leaveType ===
              leaveTypeFilter;

          const matchesStatus =
            statusFilter ===
              'All' ||
            request.status ===
              statusFilter;

          const matchesStartDate =
            !startDate ||
            request.endDate >=
              startDate;

          const matchesEndDate =
            !endDate ||
            request.startDate <=
              endDate;

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

  const totalRequests =
    filteredRequests.length;

  const approvedRequests =
    filteredRequests.filter(
      (request) =>
        request.status ===
        'Approved',
    ).length;

  const rejectedRequests =
    filteredRequests.filter(
      (request) =>
        request.status ===
        'Rejected',
    ).length;

  const totalLeaveDays =
    filteredRequests
      .filter(
        (request) =>
          request.status ===
          'Approved',
      )
      .reduce(
        (total, request) =>
          total +
          Number(
            request.leaveDays,
          ),
        0,
      );

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
      Number.isNaN(
        date.getTime(),
      )
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

  const getStatusStyle = (
    status,
  ) => {
    const styles = {
      Pending: {
        backgroundColor:
          '#FEF3C7',

        color: '#B45309',
      },

      Approved: {
        backgroundColor:
          '#DCFCE7',

        color: '#15803D',
      },

      Rejected: {
        backgroundColor:
          '#FEE2E2',

        color: '#B91C1C',
      },

      Cancelled: {
        backgroundColor:
          '#F3F4F6',

        color: '#6B7280',
      },
    };

    return (
      styles[status] ||
      styles.Cancelled
    );
  };

  const handleClearFilters = () => {
    setSearchText('');
    setDepartmentFilter('All');
    setLeaveTypeFilter('All');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
    setActionMessage(null);
  };

  const createExcelCell = (
    value,
    type = 'String',
  ) =>
    `<Cell><Data ss:Type="${type}">${escapeXml(
      value,
    )}</Data></Cell>`;

  const handleExportReport = () => {
    if (
      filteredRequests.length === 0
    ) {
      setActionMessage({
        severity: 'warning',

        text: 'There are no report records to export.',
      });

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    const headings = [
      'Request Number',
      'Employee ID',
      'Employee Name',
      'Department',
      'Leave Type',
      'Start Date',
      'End Date',
      'Leave Days',
      'Status',
      'Approver',
    ];

    const headingRow = `
      <Row>
        ${headings
          .map((heading) =>
            createExcelCell(
              heading,
            ),
          )
          .join('')}
      </Row>
    `;

    const dataRows =
      filteredRequests
        .map(
          (request) => `
            <Row>
              ${createExcelCell(
                request.requestNo,
              )}

              ${createExcelCell(
                request.employeeId,
              )}

              ${createExcelCell(
                request.employeeName,
              )}

              ${createExcelCell(
                request.department,
              )}

              ${createExcelCell(
                request.leaveType,
              )}

              ${createExcelCell(
                request.startDate,
              )}

              ${createExcelCell(
                request.endDate,
              )}

              ${createExcelCell(
                request.leaveDays,
                'Number',
              )}

              ${createExcelCell(
                request.status,
              )}

              ${createExcelCell(
                request.approver,
              )}
            </Row>
          `,
        )
        .join('');

    const workbook = `
      <?xml version="1.0" encoding="UTF-8"?>
      <?mso-application progid="Excel.Sheet"?>

      <Workbook
        xmlns="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
        xmlns:html="http://www.w3.org/TR/REC-html40"
      >
        <Worksheet ss:Name="Leave Requests">
          <Table>
            ${headingRow}
            ${dataRows}
          </Table>
        </Worksheet>
      </Workbook>
    `.trim();

    const blob = new Blob(
      [
        '\uFEFF',
        workbook,
      ],
      {
        type: 'application/vnd.ms-excel;charset=utf-8',
      },
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const downloadLink =
      document.createElement('a');

    const currentDate =
      new Date();

    const fileDate = [
      currentDate.getFullYear(),

      String(
        currentDate.getMonth() +
          1,
      ).padStart(2, '0'),

      String(
        currentDate.getDate(),
      ).padStart(2, '0'),
    ].join('-');

    downloadLink.href =
      downloadUrl;

    downloadLink.download =
      `hr_leave_report_${fileDate}.xls`;

    document.body.appendChild(
      downloadLink,
    );

    downloadLink.click();

    document.body.removeChild(
      downloadLink,
    );

    URL.revokeObjectURL(
      downloadUrl,
    );

    createHRAuditLog({
      action: 'export_report',

      tableName:
        'leave_requests',

      recordId: null,

      detail:
        `Exported HR leave request report with ${filteredRequests.length} record(s) in Excel format.`,
    });

    setActionMessage({
      severity: 'success',

      text: `${filteredRequests.length} report record(s) were exported successfully.`,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <HRLayout activeMenu="Reports">
      <Box
        sx={{
          display: 'flex',

          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs: 'column',
            sm: 'row',
          },

          gap: '16px',

          marginBottom:
            '28px',
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
            HR Reports
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '15px',

              marginTop: '6px',
            }}
          >
            Review leave request
            statistics and export
            filtered report
            information.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',

            gap: '10px',

            flexWrap: 'wrap',
          }}
        >


          <Button
            type="button"
            variant="contained"
            onClick={
              handleExportReport
            }
            sx={{
              minWidth: '150px',

              height: '44px',

              padding: '0 20px',

              backgroundColor:
                '#059669',

              color: '#FFFFFF',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

              textTransform:
                'none',

              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  '#047857',

                boxShadow: 'none',
              },
            }}
          >
            Export Excel
          </Button>
        </Box>
      </Box>

      {actionMessage && (
        <Alert
          severity={
            actionMessage.severity
          }
          onClose={() =>
            setActionMessage(null)
          }
          sx={{
            marginBottom: '24px',

            borderRadius: '8px',
          }}
        >
          {actionMessage.text}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',

            sm: 'repeat(2, minmax(0, 1fr))',

            xl: 'repeat(4, minmax(0, 1fr))',
          },

          gap: '20px',

          marginBottom:
            '24px',
        }}
      >
        {[
          {
            title:
              'Total Requests',

            value:
              totalRequests,

            color: '#2563EB',
          },

          {
            title:
              'Approved Requests',

            value:
              approvedRequests,

            color: '#059669',
          },

          {
            title:
              'Rejected Requests',

            value:
              rejectedRequests,

            color: '#DC2626',
          },

          {
            title:
              'Approved Leave Days',

            value:
              totalLeaveDays,

            color: '#7C3AED',
          },
        ].map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              padding: '20px',

              backgroundColor:
                '#FFFFFF',

              border:
                '1px solid #E5E7EB',

              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#6B7280',

                fontSize: '14px',

                fontWeight: 600,
              }}
            >
              {card.title}
            </Typography>

            <Typography
              sx={{
                color: card.color,

                fontSize: '30px',

                fontWeight: 800,

                marginTop: '8px',
              }}
            >
              {card.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          marginBottom:
            '24px',

          padding: {
            xs: '20px',
            sm: '24px',
          },

          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius: '12px',
        }}
      >
        <Typography
          sx={{
            color: '#111827',

            fontSize: '18px',

            fontWeight: 800,
          }}
        >
          Report Filters
        </Typography>

        <Typography
          sx={{
            color: '#6B7280',

            fontSize: '14px',

            marginTop: '4px',
          }}
        >
          Filter the report by
          employee, date, department,
          leave type and status.
        </Typography>

        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',

              md: 'repeat(2, minmax(0, 1fr))',

              xl: 'repeat(3, minmax(0, 1fr))',
            },

            gap: '18px',

            marginTop: '22px',
          }}
        >
          <TextField
            fullWidth
            label="Search"
            placeholder="Request number, employee ID or name"
            value={searchText}
            onChange={(event) =>
              setSearchText(
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
                        '#059669',
                    },
                },

              '& .MuiInputLabel-root.Mui-focused':
                {
                  color: '#059669',
                },
            }}
          />

          <FormControl fullWidth>
            <InputLabel id="report-department-label">
              Department
            </InputLabel>

            <Select
              labelId="report-department-label"
              value={
                departmentFilter
              }
              label="Department"
              onChange={(event) =>
                setDepartmentFilter(
                  event.target.value,
                )
              }
              sx={{
                height: '48px',

                borderRadius: '8px',
              }}
            >
              {departments.map(
                (department) => (
                  <MenuItem
                    key={department}
                    value={department}
                  >
                    {department ===
                    'All'
                      ? 'All Departments'
                      : department}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="report-leave-type-label">
              Leave Type
            </InputLabel>

            <Select
              labelId="report-leave-type-label"
              value={
                leaveTypeFilter
              }
              label="Leave Type"
              onChange={(event) =>
                setLeaveTypeFilter(
                  event.target.value,
                )
              }
              sx={{
                height: '48px',

                borderRadius: '8px',
              }}
            >
              {leaveTypes.map(
                (leaveType) => (
                  <MenuItem
                    key={leaveType}
                    value={leaveType}
                  >
                    {leaveType ===
                    'All'
                      ? 'All Leave Types'
                      : leaveType}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="report-status-label">
              Status
            </InputLabel>

            <Select
              labelId="report-status-label"
              value={statusFilter}
              label="Status"
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              sx={{
                height: '48px',

                borderRadius: '8px',
              }}
            >
              {statuses.map(
                (status) => (
                  <MenuItem
                    key={status}
                    value={status}
                  >
                    {status ===
                    'All'
                      ? 'All Statuses'
                      : status}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value,
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root':
                {
                  height: '48px',

                  borderRadius:
                    '8px',
                },

              '& input[type="date"]':
                {
                  color: startDate
                    ? '#111827'
                    : '#6B7280',
                },
            }}
          />

          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={endDate}
            onChange={(event) =>
              setEndDate(
                event.target.value,
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root':
                {
                  height: '48px',

                  borderRadius:
                    '8px',
                },

              '& input[type="date"]':
                {
                  color: endDate
                    ? '#111827'
                    : '#6B7280',
                },
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',

            justifyContent:
              'flex-end',

            marginTop: '18px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={
              handleClearFilters
            }
            sx={{
              minWidth: '120px',

              height: '42px',

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
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

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
            Leave Request Report
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '14px',

              marginTop: '4px',
            }}
          >
            Showing{' '}
            {
              filteredRequests.length
            }{' '}
            of {leaveRequests.length}{' '}
            leave requests
          </Typography>
        </Box>

        {filteredRequests.length >
        0 ? (
          <Box
            sx={{
              overflowX: 'auto',
            }}
          >
            <Box
              component="table"
              sx={{
                width: '100%',

                minWidth: '1300px',

                borderCollapse:
                  'collapse',
              }}
            >
              <Box component="thead">
                <Box
                  component="tr"
                  sx={{
                    backgroundColor:
                      '#F9FAFB',
                  }}
                >
                  {[
                    'Request No.',
                    'Employee',
                    'Department',
                    'Leave Type',
                    'Leave Period',
                    'Days',
                    'Status',
                    'Approver',
                  ].map(
                    (heading) => (
                      <Box
                        key={heading}
                        component="th"
                        sx={{
                          padding:
                            '14px 18px',

                          color:
                            '#6B7280',

                          borderBottom:
                            '1px solid #E5E7EB',

                          fontSize:
                            '12px',

                          fontWeight:
                            700,

                          textAlign:
                            'left',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {heading}
                      </Box>
                    ),
                  )}
                </Box>
              </Box>

              <Box component="tbody">
                {filteredRequests.map(
                  (request) => {
                    const statusStyle =
                      getStatusStyle(
                        request.status,
                      );

                    return (
                      <Box
                        key={request.id}
                        component="tr"
                        sx={{
                          '&:hover': {
                            backgroundColor:
                              '#F9FAFB',
                          },
                        }}
                      >
                        <Box
                          component="td"
                          sx={{
                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',

                            color:
                              '#059669',

                            fontSize:
                              '13px',

                            fontWeight:
                              800,

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            request.requestNo
                          }
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            minWidth:
                              '190px',

                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '14px',

                              fontWeight:
                                700,
                            }}
                          >
                            {
                              request.employeeName
                            }
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#6B7280',

                              fontSize:
                                '12px',

                              marginTop:
                                '3px',
                            }}
                          >
                            {
                              request.employeeId
                            }
                          </Typography>
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',

                            color:
                              '#4B5563',

                            fontSize:
                              '13px',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            request.department
                          }
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',

                            color:
                              '#4B5563',

                            fontSize:
                              '13px',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            request.leaveType
                          }
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',

                            color:
                              '#4B5563',

                            fontSize:
                              '13px',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {formatDate(
                            request.startDate,
                          )}{' '}
                          –{' '}
                          {formatDate(
                            request.endDate,
                          )}
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',

                            color:
                              '#111827',

                            fontSize:
                              '13px',

                            fontWeight:
                              700,

                            textAlign:
                              'center',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            request.leaveDays
                          }
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          <Chip
                            label={
                              request.status
                            }
                            size="small"
                            sx={{
                              minWidth:
                                '82px',

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
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding:
                              '16px 18px',

                            borderBottom:
                              '1px solid #E5E7EB',

                            color:
                              '#4B5563',

                            fontSize:
                              '13px',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            request.approver
                          }
                        </Box>
                      </Box>
                    );
                  },
                )}
              </Box>
            </Box>
          </Box>
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

                backgroundColor:
                  '#ECFDF5',

                color: '#059669',

                borderRadius: '50%',

                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'center',

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
              No report records found
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

                color: '#059669',

                borderColor:
                  '#059669',

                borderRadius: '8px',

                fontSize: '14px',

                fontWeight: 700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#ECFDF5',

                  borderColor:
                    '#047857',
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>
    </HRLayout>
  );
}

export default HRReportsPage;