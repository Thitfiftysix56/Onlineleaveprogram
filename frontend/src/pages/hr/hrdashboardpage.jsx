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
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import HRLayout from '../../layouts/hrlayout.jsx';
import api from '../../api/axios.js';

const theme = {
  primary: '#059669',
  dark: '#047857',
  soft: '#ECFDF5',
  border: '#A7F3D0',
};

/* =========================
   Helpers
========================= */

const getArray = (
  response,
  key,
) => {
  const data =
    response?.data?.data;

  if (Array.isArray(data?.[key])) {
    return data[key];
  }

  if (Array.isArray(data)) {
    return data;
  }

  return [];
};

const getEmployeeName = (
  employee,
) => {
  if (employee.fullName) {
    return employee.fullName;
  }

  if (employee.employeeName) {
    return employee.employeeName;
  }

  const name = [
    employee.firstName ||
      employee.first_name,
    employee.lastName ||
      employee.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return name || '-';
};

const getEmployeeCode = (
  employee,
) =>
  employee.employeeCode ||
  employee.employee_code ||
  employee.code ||
  '-';

const getDepartment = (
  employee,
) =>
  employee.departmentName ||
  employee.department_name ||
  employee.department ||
  '-';

const getPosition = (
  employee,
) =>
  employee.positionName ||
  employee.position_name ||
  employee.position ||
  '-';

const getEmployeeStatus = (
  employee,
) =>
  String(
    employee.status ||
      employee.employeeStatus ||
      'active',
  )
    .trim()
    .toLowerCase();

const translateEmployeeStatus = (
  status,
) => {
  const labels = {
    active: 'ใช้งานอยู่',
    inactive: 'ไม่ใช้งาน',
    resigned: 'ลาออก',
  };

  return labels[status] || status || '-';
};

const getStatusStyle = (
  status,
) => {
  const styles = {
    active: {
      backgroundColor: '#DCFCE7',
      color: '#15803D',
    },

    inactive: {
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
    },

    resigned: {
      backgroundColor: '#F1F5F9',
      color: '#64748B',
    },
  };

  return (
    styles[status] || {
      backgroundColor: '#F1F5F9',
      color: '#64748B',
    }
  );
};

const isLeaveTypeActive = (
  leaveType,
) => {
  if (
    leaveType.isActive !== undefined
  ) {
    return Boolean(
      leaveType.isActive,
    );
  }

  if (
    leaveType.is_active !== undefined
  ) {
    return Boolean(
      leaveType.is_active,
    );
  }

  return (
    String(
      leaveType.status || '',
    ).toLowerCase() === 'active'
  );
};

const getHolidayDate = (
  holiday,
) =>
  holiday.date ||
  holiday.holidayDate ||
  holiday.holiday_date ||
  '';

const getCreatedAt = (
  employee,
) =>
  employee.createdAt ||
  employee.created_at ||
  employee.updatedAt ||
  employee.updated_at ||
  '';

/* =========================
   Component
========================= */

function HRDashboardPage() {
  const navigate = useNavigate();

  const [
    employees,
    setEmployees,
  ] = useState([]);

  const [
    leaveTypes,
    setLeaveTypes,
  ] = useState([]);

  const [
    holidays,
    setHolidays,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  /* =========================
     Load Data
  ========================= */

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [
          employeeResponse,
          leaveTypeResponse,
          holidayResponse,
        ] = await Promise.all([
          api.get(
            '/hr/employees',
          ),

          api.get(
            '/hr/leave-types',
          ),

          api.get(
            '/hr/holidays',
          ),
        ]);

        setEmployees(
          getArray(
            employeeResponse,
            'employees',
          ),
        );

        setLeaveTypes(
          getArray(
            leaveTypeResponse,
            'leaveTypes',
          ),
        );

        setHolidays(
          getArray(
            holidayResponse,
            'holidays',
          ),
        );
      } catch (loadError) {
        setError(
          loadError.response?.data
            ?.message ||
            'ไม่สามารถโหลดข้อมูล Dashboard ได้',
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================
     Summary
  ========================= */

  const currentYear =
    new Date().getFullYear();

  const activeEmployees =
    useMemo(
      () =>
        employees.filter(
          (employee) =>
            getEmployeeStatus(
              employee,
            ) === 'active',
        ),
      [employees],
    );

  const activeLeaveTypes =
    useMemo(
      () =>
        leaveTypes.filter(
          isLeaveTypeActive,
        ),
      [leaveTypes],
    );

  const currentYearHolidays =
    useMemo(
      () =>
        holidays.filter(
          (holiday) => {
            const holidayDate =
              getHolidayDate(
                holiday,
              );

            if (!holidayDate) {
              return false;
            }

            return (
              Number(
                String(
                  holidayDate,
                ).slice(0, 4),
              ) === currentYear
            );
          },
        ),
      [
        holidays,
        currentYear,
      ],
    );

  const recentEmployees =
    useMemo(() => {
      return [...employees]
        .sort(
          (
            firstEmployee,
            secondEmployee,
          ) => {
            const firstDate =
              new Date(
                getCreatedAt(
                  firstEmployee,
                ) || 0,
              ).getTime();

            const secondDate =
              new Date(
                getCreatedAt(
                  secondEmployee,
                ) || 0,
              ).getTime();

            return (
              secondDate -
              firstDate
            );
          },
        )
        .slice(0, 5);
    }, [employees]);

  const summaryCards = [
    {
      title:
        'พนักงานทั้งหมด',

      value:
        employees.length,

      backgroundColor:
        theme.soft,

      color:
        theme.primary,
    },

    {
      title:
        'พนักงานที่ใช้งานอยู่',

      value:
        activeEmployees.length,

      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },

    {
      title:
        'ประเภทการลาที่ใช้งาน',

      value:
        activeLeaveTypes.length,

      backgroundColor:
        '#DBEAFE',

      color:
        '#2563EB',
    },

    {
      title:
        'วันหยุดปีนี้',

      value:
        currentYearHolidays.length,

      backgroundColor:
        '#FEF3C7',

      color:
        '#B45309',
    },
  ];

  /* =========================
     UI
  ========================= */

  return (
    <HRLayout activeMenu="Dashboard">
      {/* Header */}
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
        Dashboard
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

      {loading ? (
        <Box
          sx={{
            minHeight: '420px',

            display: 'flex',

            alignItems: 'center',

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
      ) : (
        <>
          {/* =====================
              Summary Cards
          ====================== */}

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                sm:
                  'repeat(2, 1fr)',

                xl:
                  'repeat(4, 1fr)',
              },

              gap: '18px',

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
                      '140px',

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
                </Paper>
              ),
            )}
          </Box>

          {/* =====================
              Recent Employees
          ====================== */}

          <Paper
            elevation={0}
            sx={{
              width: '100%',

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
                minHeight:
                  '76px',

                padding:
                  '18px 24px',

                display:
                  'flex',

                alignItems: {
                  xs:
                    'flex-start',

                  sm:
                    'center',
                },

                justifyContent:
                  'space-between',

                flexDirection: {
                  xs:
                    'column',

                  sm:
                    'row',
                },

                gap: '14px',

                borderBottom:
                  '1px solid #E5E7EB',
              }}
            >
              <Box>
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
                  พนักงานล่าสุด
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '12px',

                    marginTop:
                      '3px',
                  }}
                >
                  แสดงข้อมูลพนักงานล่าสุด
                </Typography>
              </Box>

              <Button
                type="button"
                variant="outlined"
                onClick={() =>
                  navigate(
                    '/hr/employee-management',
                  )
                }
                sx={{
                  height:
                    '38px',

                  padding:
                    '0 15px',

                  color:
                    theme.primary,

                  borderColor:
                    theme.border,

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
                        theme.soft,

                      borderColor:
                        theme.primary,
                    },
                }}
              >
                ดูทั้งหมด
              </Button>
            </Box>

            {recentEmployees.length >
            0 ? (
              <Box
                sx={{
                  overflowX:
                    'auto',
                }}
              >
                <Table
                  sx={{
                    minWidth:
                      '760px',
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
                        'รหัสพนักงาน',
                        'ชื่อพนักงาน',
                        'แผนก',
                        'ตำแหน่ง',
                        'สถานะ',
                      ].map(
                        (
                          heading,
                        ) => (
                          <TableCell
                            key={
                              heading
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
                    {recentEmployees.map(
                      (
                        employee,
                        index,
                      ) => {
                        const status =
                          getEmployeeStatus(
                            employee,
                          );

                        const statusStyle =
                          getStatusStyle(
                            status,
                          );

                        return (
                          <TableRow
                            key={
                              employee.employeeId ||
                              employee.employee_id ||
                              employee.id ||
                              index
                            }
                            hover
                          >
                            <TableCell
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
                              {getEmployeeCode(
                                employee,
                              )}
                            </TableCell>

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
                                {getEmployeeName(
                                  employee,
                                )}
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
                              }}
                            >
                              {getDepartment(
                                employee,
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
                              }}
                            >
                              {getPosition(
                                employee,
                              )}
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={translateEmployeeStatus(
                                  status,
                                )}
                                size="small"
                                sx={{
                                  backgroundColor:
                                    statusStyle.backgroundColor,

                                  color:
                                    statusStyle.color,

                                  borderRadius:
                                    '999px',

                                  fontSize:
                                    '10px',

                                  fontWeight:
                                    700,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box
                sx={{
                  minHeight:
                    '250px',

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
                      '15px',

                    fontWeight:
                      800,

                    marginTop:
                      '14px',
                  }}
                >
                  ยังไม่มีข้อมูลพนักงาน
                </Typography>
              </Box>
            )}
          </Paper>
        </>
      )}
    </HRLayout>
  );
}

export default HRDashboardPage;