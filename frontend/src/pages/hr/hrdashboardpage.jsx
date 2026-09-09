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
import AddRounded from '@mui/icons-material/AddRounded';

import HRLayout from '../../layouts/hrlayout.jsx';
import { DashboardTablePagination } from '../../components/shareduiprimitives.jsx';
import DashboardLeaveBalance from '../../components/dashboardleavebalance.jsx';
import { CompactSummaryCard } from '../../components/sharedvisualfoundation.jsx';
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

  const [employeePage, setEmployeePage] = useState(0);

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

  const sortedEmployees =
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
        );
    }, [employees]);

  const recentEmployees = useMemo(
    () => sortedEmployees.slice(employeePage * 5, employeePage * 5 + 5),
    [employeePage, sortedEmployees],
  );

  const summaryCards = [
    {
      title: 'พนักงานทั้งหมด',
      value: employees.length,
      unit: 'คน',
      color: '#2563EB',
      background: 'linear-gradient(135deg, #EAF3FF 0%, #FFFFFF 78%)',
      borderColor: '#C9DDFB',
      glowColor: 'rgba(59, 130, 246, 0.10)',
    },
    {
      title: 'พนักงานสถานะปฏิบัติงาน',
      value: activeEmployees.length,
      unit: 'คน',
      color: '#15803D',
      background: 'linear-gradient(135deg, #E5F9EE 0%, #FFFFFF 78%)',
      borderColor: '#A7E8C3',
      glowColor: 'rgba(34, 197, 94, 0.10)',
    },
    {
      title: 'ประเภทการลา',
      value: activeLeaveTypes.length,
      unit: 'ประเภท',
      color: '#7C3AED',
      background: 'linear-gradient(135deg, #F3E8FF 0%, #FFFFFF 78%)',
      borderColor: '#DDD6FE',
      glowColor: 'rgba(124, 58, 237, 0.10)',
    },
    {
      title: 'วันหยุดปีนี้',
      value: currentYearHolidays.length,
      unit: 'วัน',
      color: '#D97706',
      background: 'linear-gradient(135deg, #FFF6D8 0%, #FFFFFF 78%)',
      borderColor: '#F6D66B',
      glowColor: 'rgba(245, 158, 11, 0.11)',
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
          display: 'none',
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

      <Button type="button" variant="contained" startIcon={<AddRounded />} onClick={() => navigate('/hr/leave-request', { state: { returnTo: '/hr/dashboard' } })} sx={{ display: 'none' }}>สร้างคำขอลา</Button>

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
                sm: 'repeat(2, minmax(0, 1fr))',
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
                color={card.color}
              />
            ))}
          </Box>

          <DashboardLeaveBalance />

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
                  '72px',

                padding: {
                  xs: '18px',
                  sm: '20px 22px',
                },

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
                      600,
                  }}
                >
                  พนักงานล่าสุด
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
                  display:
                    'none',
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
              <>
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
                            sx={{
                              '&:hover': {
                                backgroundColor: '#FAFBFD',
                              },
                              '&:last-child td': {
                                borderBottom: 'none',
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                padding:
                                  '16px 18px',

                                color:
                                  '#111827',

                                fontSize:
                                  '13px',

                                borderBottom:
                                  '1px solid #EEF0F3',

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

                            <TableCell
                              sx={{
                                padding: '16px 18px',
                                borderBottom: '1px solid #EEF0F3',
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
                                {getEmployeeName(
                                  employee,
                                )}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                padding: '16px 18px',
                                color: '#475569',
                                fontSize: '12px',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                borderBottom: '1px solid #EEF0F3',
                              }}
                            >
                              {getDepartment(
                                employee,
                              )}
                            </TableCell>

                            <TableCell
                              sx={{
                                padding: '16px 18px',
                                color: '#475569',
                                fontSize: '12px',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                borderBottom: '1px solid #EEF0F3',
                              }}
                            >
                              {getPosition(
                                employee,
                              )}
                            </TableCell>

                            <TableCell
                              sx={{
                                padding: '16px 18px',
                                borderBottom: '1px solid #EEF0F3',
                              }}
                            >
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

                                  minWidth: '86px',
                                  height: '28px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  '& .MuiChip-label': {
                                    padding: '0 12px',
                                  },
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
              <DashboardTablePagination
                count={sortedEmployees.length}
                page={employeePage}
                onPageChange={(_, nextPage) => setEmployeePage(nextPage)}
              />
              </>
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
