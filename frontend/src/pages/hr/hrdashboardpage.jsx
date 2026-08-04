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
  Paper,
  Typography,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

import HRLayout from '../../layouts/hrlayout.jsx';

import {
  getLeaveRequests,
  leaveRequestStorageKey,
} from '../../utils/leaverequeststorage.js';

const employeeStorageKeys = [
  'online_leave_approval_employees',
  'online_leave_approval_employee_management',
  'online_leave_approval_system_employees',
  'employees',
];

const holidayStorageKeys = [
  'online_leave_approval_holidays',
  'online_leave_approval_holiday_management',
  'online_leave_approval_system_holidays',
  'holidays',
];

const defaultUpcomingHolidays = [
  {
    id: 1,
    name: 'Asarnha Bucha Day',
    date: '2026-07-29',
    type: 'Public Holiday',
    isActive: true,
  },
  {
    id: 2,
    name: 'Buddhist Lent Day',
    date: '2026-07-30',
    type: 'Public Holiday',
    isActive: true,
  },
  {
    id: 3,
    name: 'H.M. Queen Sirikit Birthday',
    date: '2026-08-12',
    type: 'Public Holiday',
    isActive: true,
  },
];

const employeeProfiles = {
  employee: {
    employeeId: 'EMP001',
    employeeName: 'Employee User',
    department: 'Information Technology',
  },
  supervisor: {
    employeeId: 'SUP001',
    employeeName: 'Supervisor User',
    department: 'Information Technology',
  },
  hr: {
    employeeId: 'HR001',
    employeeName: 'HR User',
    department: 'Human Resources',
  },
  admin: {
    employeeId: 'ADM001',
    employeeName: 'Admin User',
    department: 'Information Technology',
  },
};

const extractArrayFromValue = (value, preferredFields = []) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  for (const field of preferredFields) {
    if (Array.isArray(value[field])) {
      return value[field];
    }
  }

  const arrayValue = Object.values(value).find(
    (item) => Array.isArray(item),
  );

  return Array.isArray(arrayValue) ? arrayValue : [];
};

const readStorageArray = (keys, preferredFields = []) => {
  for (const key of keys) {
    try {
      const storedValue = localStorage.getItem(key);

      if (!storedValue) {
        continue;
      }

      const parsedValue = JSON.parse(storedValue);

      const extractedValue = extractArrayFromValue(
        parsedValue,
        preferredFields,
      );

      if (extractedValue.length > 0) {
        return extractedValue;
      }
    } catch (error) {
      console.error(
        `Unable to read localStorage key "${key}".`,
        error,
      );
    }
  }

  return [];
};

const capitalizeStatus = (status) => {
  const normalizedStatus = String(status || '')
    .trim()
    .toLowerCase();

  if (!normalizedStatus) {
    return 'Pending';
  }

  return (
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1)
  );
};

const parseDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const normalizedValue = String(dateValue);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(
    normalizedValue,
  )
    ? new Date(`${normalizedValue}T00:00:00`)
    : new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const getStartOfToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return today;
};

const getRequestDateValue = (request) => {
  const date =
    parseDate(request.updatedAt) ||
    parseDate(request.approvedAt) ||
    parseDate(request.rejectedAt) ||
    parseDate(request.submittedAt) ||
    parseDate(request.createdAt) ||
    parseDate(request.startDate);

  return date ? date.getTime() : 0;
};

const normalizeRequest = (request) => {
  const requestRole = String(
    request.role || 'employee',
  ).toLowerCase();

  const profile =
    employeeProfiles[requestRole] ||
    employeeProfiles.employee;

  return {
    ...request,

    id: request.id,

    requestNo:
      request.requestNo ||
      request.request_no ||
      `Request #${request.id}`,

    employeeId:
      request.employeeId ||
      request.employeeCode ||
      request.employee_code ||
      profile.employeeId,

    employeeName:
      request.employeeName ||
      request.employee_name ||
      profile.employeeName,

    department:
      request.department ||
      request.departmentName ||
      request.department_name ||
      profile.department,

    leaveType:
      request.leaveType ||
      request.leave_type ||
      request.leaveTypeName ||
      'Not specified',

    startDate:
      request.startDate ||
      request.start_date ||
      '',

    endDate:
      request.endDate ||
      request.end_date ||
      '',

    leaveDays:
      Number(
        request.leaveDays ??
          request.leave_days ??
          0,
      ),

    statusLabel: capitalizeStatus(request.status),
  };
};

const normalizeEmployee = (employee, index) => {
  const firstName =
    employee.firstName ||
    employee.first_name ||
    '';

  const lastName =
    employee.lastName ||
    employee.last_name ||
    '';

  const combinedName = `${firstName} ${lastName}`.trim();

  return {
    id:
      employee.id ||
      employee.employeeId ||
      employee.employee_id ||
      index + 1,

    employeeId:
      employee.employeeCode ||
      employee.employee_code ||
      employee.employeeId ||
      employee.employee_id ||
      `EMP${String(index + 1).padStart(3, '0')}`,

    employeeName:
      employee.employeeName ||
      employee.employee_name ||
      employee.fullName ||
      employee.full_name ||
      combinedName ||
      'Employee',

    department:
      employee.department ||
      employee.departmentName ||
      employee.department_name ||
      'Not specified',

    status: String(
      employee.status ??
        employee.employeeStatus ??
        employee.isActive ??
        employee.is_active ??
        'active',
    ).toLowerCase(),
  };
};

const normalizeHoliday = (holiday, index) => {
  const activeValue =
    holiday.isActive ??
    holiday.is_active ??
    holiday.status ??
    true;

  const normalizedActiveValue =
    typeof activeValue === 'string'
      ? ![
          'inactive',
          'disabled',
          'false',
          '0',
        ].includes(activeValue.toLowerCase())
      : Boolean(activeValue);

  return {
    id:
      holiday.id ||
      holiday.holidayId ||
      holiday.holiday_id ||
      index + 1,

    name:
      holiday.name ||
      holiday.holidayName ||
      holiday.holiday_name ||
      'Organization Holiday',

    date:
      holiday.date ||
      holiday.holidayDate ||
      holiday.holiday_date ||
      '',

    type:
      holiday.type ||
      holiday.holidayType ||
      holiday.holiday_type ||
      'Public Holiday',

    isActive: normalizedActiveValue,
  };
};

function HRDashboardPage() {
  const navigate = useNavigate();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const loadDashboardData = useCallback(() => {
    const storedRequests = getLeaveRequests()
      .filter(
        (request) =>
          String(request.status || '').toLowerCase() !==
          'draft',
      )
      .map(normalizeRequest)
      .sort(
        (firstRequest, secondRequest) =>
          getRequestDateValue(secondRequest) -
          getRequestDateValue(firstRequest),
      );

    const storedEmployees = readStorageArray(
      employeeStorageKeys,
      ['employees', 'items', 'data', 'records'],
    ).map(normalizeEmployee);

    const storedHolidays = readStorageArray(
      holidayStorageKeys,
      ['holidays', 'items', 'data', 'records'],
    ).map(normalizeHoliday);

    setLeaveRequests(storedRequests);
    setEmployees(storedEmployees);

    setHolidays(
      storedHolidays.length > 0
        ? storedHolidays
        : defaultUpcomingHolidays,
    );
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = (event) => {
      const watchedKeys = [
        leaveRequestStorageKey,
        ...employeeStorageKeys,
        ...holidayStorageKeys,
      ];

      if (!event.key || watchedKeys.includes(event.key)) {
        loadDashboardData();
      }
    };

    const handleWindowFocus = () => {
      loadDashboardData();
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
  }, [loadDashboardData]);

  const derivedEmployees = useMemo(() => {
    const employeeMap = new Map();

    leaveRequests.forEach((request) => {
      const employeeKey =
        request.employeeId ||
        request.employeeName;

      if (!employeeKey) {
        return;
      }

      if (!employeeMap.has(employeeKey)) {
        employeeMap.set(employeeKey, {
          id: employeeKey,
          employeeId: request.employeeId,
          employeeName: request.employeeName,
          department: request.department,
          status: 'active',
        });
      }
    });

    return Array.from(employeeMap.values());
  }, [leaveRequests]);

  const dashboardEmployees =
    employees.length > 0
      ? employees
      : derivedEmployees;

  const activeEmployees = dashboardEmployees.filter(
    (employee) =>
      ![
        'inactive',
        'resigned',
        'locked',
        'disabled',
        'false',
        '0',
      ].includes(employee.status),
  );

  const pendingRequests = leaveRequests.filter(
    (request) =>
      String(request.status || '').toLowerCase() ===
      'pending',
  );

  const currentDate = new Date();

  const approvedThisMonth = leaveRequests.filter(
    (request) => {
      if (
        String(request.status || '').toLowerCase() !==
        'approved'
      ) {
        return false;
      }

      const approvalDate =
        parseDate(request.approvedAt) ||
        parseDate(request.updatedAt) ||
        parseDate(request.startDate);

      if (!approvalDate) {
        return false;
      }

      return (
        approvalDate.getFullYear() ===
          currentDate.getFullYear() &&
        approvalDate.getMonth() ===
          currentDate.getMonth()
      );
    },
  ).length;

  const employeesOnLeave = useMemo(() => {
    const today = getStartOfToday();

    const employeeIds = new Set();

    leaveRequests.forEach((request) => {
      if (
        String(request.status || '').toLowerCase() !==
        'approved'
      ) {
        return;
      }

      const startDate = parseDate(request.startDate);
      const endDate = parseDate(request.endDate);

      if (!startDate || !endDate) {
        return;
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (startDate <= today && endDate >= today) {
        employeeIds.add(
          request.employeeId ||
            request.employeeName ||
            request.id,
        );
      }
    });

    return employeeIds.size;
  }, [leaveRequests]);

  const recentRequests = leaveRequests.slice(0, 5);

  const upcomingHolidays = useMemo(() => {
    const today = getStartOfToday();

    return holidays
      .filter((holiday) => {
        if (!holiday.isActive) {
          return false;
        }

        const holidayDate = parseDate(holiday.date);

        if (!holidayDate) {
          return false;
        }

        holidayDate.setHours(0, 0, 0, 0);

        return holidayDate >= today;
      })
      .sort((firstHoliday, secondHoliday) => {
        const firstDate =
          parseDate(firstHoliday.date)?.getTime() || 0;

        const secondDate =
          parseDate(secondHoliday.date)?.getTime() || 0;

        return firstDate - secondDate;
      })
      .slice(0, 3);
  }, [holidays]);

  const summaryCards = [
    {
      title: 'Total Employees',
      value: activeEmployees.length,
      description:
        employees.length > 0
          ? 'Active employees'
          : 'Employees found in leave records',
      backgroundColor: '#EFF6FF',
      textColor: '#2563EB',
      symbol: 'E',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      description: 'Waiting for approval',
      backgroundColor: '#FEF3C7',
      textColor: '#B45309',
      symbol: 'P',
    },
    {
      title: 'Approved This Month',
      value: approvedThisMonth,
      description: 'Approved leave requests',
      backgroundColor: '#DCFCE7',
      textColor: '#15803D',
      symbol: '✓',
    },
    {
      title: 'Employees on Leave',
      value: employeesOnLeave,
      description: 'Currently on leave',
      backgroundColor: '#F5F3FF',
      textColor: '#7C3AED',
      symbol: 'L',
    },
  ];

  const formatDate = (dateValue) => {
    const date = parseDate(dateValue);

    if (!date) {
      return '-';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) {
      return '-';
    }

    if (!endDate || startDate === endDate) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)} - ${formatDate(
      endDate,
    )}`;
  };

  const getStatusStyle = (status) => {
    const styles = {
      Approved: {
        backgroundColor: '#DCFCE7',
        color: '#15803D',
      },
      Rejected: {
        backgroundColor: '#FEE2E2',
        color: '#B91C1C',
      },
      Pending: {
        backgroundColor: '#FEF3C7',
        color: '#B45309',
      },
      Cancelled: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
      },
    };

    return styles[status] || styles.Cancelled;
  };

  return (
    <HRLayout activeMenu="Dashboard">
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          justifyContent: 'space-between',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          gap: '16px',
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
            HR Dashboard
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            Overview of employees, leave requests and
            holidays.
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
            onClick={() =>
              navigate('/hr/employee-management')
            }
            sx={{
              minWidth: '150px',
              height: '44px',
              padding: '0 20px',
              backgroundColor: '#059669',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',

              '&:hover': {
                backgroundColor: '#047857',
                boxShadow: 'none',
              },
            }}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(4, minmax(0, 1fr))',
          },
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              padding: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <Box>
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
                    color: '#111827',
                    fontSize: '30px',
                    fontWeight: 800,
                    marginTop: '8px',
                  }}
                >
                  {card.value}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  backgroundColor: card.backgroundColor,
                  color: card.textColor,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '17px',
                  fontWeight: 800,
                }}
              >
                {card.symbol}
              </Box>
            </Box>

            <Typography
              sx={{
                color: '#9CA3AF',
                fontSize: '13px',
                marginTop: '10px',
              }}
            >
              {card.description}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            xl: 'minmax(0, 2fr) minmax(300px, 1fr)',
          },
          gap: '24px',
          alignItems: 'start',
        }}
      >
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
              display: 'flex',
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
              justifyContent: 'space-between',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              gap: '12px',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '18px',
                  fontWeight: 800,
                }}
              >
                Recent Leave Requests
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Latest employee leave requests.
              </Typography>
            </Box>

            <Button
              type="button"
              onClick={() => navigate('/hr/reports')}
              sx={{
                minWidth: 0,
                padding: 0,
                color: '#059669',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              View All Requests
            </Button>
          </Box>

          {recentRequests.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  minWidth: '900px',
                  borderCollapse: 'collapse',
                }}
              >
                <Box component="thead">
                  <Box
                    component="tr"
                    sx={{
                      backgroundColor: '#F9FAFB',
                    }}
                  >
                    {[
                      'Request ID',
                      'Employee',
                      'Leave Type',
                      'Period',
                      'Days',
                      'Status',
                      'Action',
                    ].map((heading) => (
                      <Box
                        key={heading}
                        component="th"
                        sx={{
                          padding: '14px 18px',
                          color: '#6B7280',
                          borderBottom:
                            '1px solid #E5E7EB',
                          fontSize: '12px',
                          fontWeight: 700,
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {heading}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {recentRequests.map((request) => {
                    const statusStyle = getStatusStyle(
                      request.statusLabel,
                    );

                    return (
                      <Box
                        key={request.id}
                        component="tr"
                        sx={{
                          '&:hover': {
                            backgroundColor: '#F9FAFB',
                          },
                        }}
                      >
                        <Box
                          component="td"
                          sx={{
                            padding: '16px 18px',
                            borderBottom:
                              '1px solid #E5E7EB',
                            color: '#059669',
                            fontSize: '13px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {request.requestNo}
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding: '16px 18px',
                            borderBottom:
                              '1px solid #E5E7EB',
                            color: '#111827',
                            fontSize: '14px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {request.employeeName}
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding: '16px 18px',
                            borderBottom:
                              '1px solid #E5E7EB',
                            color: '#4B5563',
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {request.leaveType}
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding: '16px 18px',
                            borderBottom:
                              '1px solid #E5E7EB',
                            color: '#4B5563',
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatDateRange(
                            request.startDate,
                            request.endDate,
                          )}
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding: '16px 18px',
                            borderBottom:
                              '1px solid #E5E7EB',
                            color: '#4B5563',
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {request.leaveDays}{' '}
                          {request.leaveDays === 1
                            ? 'Day'
                            : 'Days'}
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding: '16px 18px',
                            borderBottom:
                              '1px solid #E5E7EB',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Chip
                            label={request.statusLabel}
                            size="small"
                            sx={{
                              minWidth: '82px',
                              backgroundColor:
                                statusStyle.backgroundColor,
                              color: statusStyle.color,
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          />
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            padding: '16px 18px',
                            borderBottom:
                              '1px solid #E5E7EB',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/hr/leave-requests/${request.id}`,
                              )
                            }
                            sx={{
                              minWidth: 0,
                              padding: 0,
                              color: '#059669',
                              fontSize: '13px',
                              fontWeight: 700,
                              textTransform: 'none',

                              '&:hover': {
                                backgroundColor:
                                  'transparent',
                                textDecoration:
                                  'underline',
                              },
                            }}
                          >
                            View Detail
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                minHeight: '250px',
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
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                }}
              >
                0
              </Box>

              <Typography
                sx={{
                  color: '#111827',
                  fontSize: '17px',
                  fontWeight: 800,
                  marginTop: '14px',
                }}
              >
                No leave requests
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '5px',
                }}
              >
                Submitted leave requests will appear here.
              </Typography>
            </Box>
          )}
        </Paper>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
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
                padding: '22px 24px',
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
                Upcoming Holidays
              </Typography>

              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  marginTop: '4px',
                }}
              >
                Upcoming organization holidays.
              </Typography>
            </Box>

            {upcomingHolidays.length > 0 ? (
              <Box sx={{ padding: '8px 24px' }}>
                {upcomingHolidays.map((holiday, index) => (
                  <Box
                    key={holiday.id}
                    sx={{
                      padding: '18px 0',
                      borderBottom:
                        index <
                        upcomingHolidays.length - 1
                          ? '1px solid #E5E7EB'
                          : 'none',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#111827',
                        fontSize: '14px',
                        fontWeight: 700,
                      }}
                    >
                      {holiday.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#059669',
                        fontSize: '13px',
                        fontWeight: 700,
                        marginTop: '5px',
                      }}
                    >
                      {formatDate(holiday.date)}
                    </Typography>

                    <Typography
                      sx={{
                        color: '#9CA3AF',
                        fontSize: '12px',
                        marginTop: '3px',
                      }}
                    >
                      {holiday.type}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  minHeight: '150px',
                  padding: '30px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    color: '#6B7280',
                    fontSize: '14px',
                  }}
                >
                  No upcoming holidays.
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                padding: '16px 24px 22px',
              }}
            >
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() =>
                  navigate('/hr/holiday-management')
                }
                sx={{
                  height: '42px',
                  color: '#059669',
                  borderColor: '#6EE7B7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'none',

                  '&:hover': {
                    borderColor: '#059669',
                    backgroundColor: '#ECFDF5',
                  },
                }}
              >
                Manage Holidays
              </Button>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              padding: '22px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
            }}
          >
            <Typography
              sx={{
                color: '#047857',
                fontSize: '16px',
                fontWeight: 800,
              }}
            >
              HR Summary
            </Typography>

            <Typography
              sx={{
                color: '#065F46',
                fontSize: '13px',
                lineHeight: 1.7,
                marginTop: '8px',
              }}
            >
              There are currently {pendingRequests.length}{' '}
              pending leave request
              {pendingRequests.length === 1 ? '' : 's'} and{' '}
              {employeesOnLeave} employee
              {employeesOnLeave === 1 ? '' : 's'} on leave.
              Review employee information and leave balances
              regularly.
            </Typography>

            <Button
              type="button"
              variant="contained"
              fullWidth
              onClick={() => navigate('/hr/reports')}
              sx={{
                height: '42px',
                marginTop: '18px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',

                '&:hover': {
                  backgroundColor: '#047857',
                  boxShadow: 'none',
                },
              }}
            >
              Open HR Reports
            </Button>
          </Paper>
        </Box>
      </Box>
    </HRLayout>
  );
}

export default HRDashboardPage;