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
   Normalize Employee
========================= */

const normalizeEmployee = (
  employee,
) => ({
  id:
    employee.employeeId ??
    employee.employee_id ??
    employee.id,

  employeeCode:
    employee.employeeCode ||
    employee.employee_code ||
    employee.code ||
    '-',

  firstName:
    employee.firstName ||
    employee.first_name ||
    '',

  lastName:
    employee.lastName ||
    employee.last_name ||
    '',

  fullName:
    employee.fullName ||
    employee.employeeName ||
    employee.employee_name ||
    [
      employee.firstName ||
        employee.first_name,
      employee.lastName ||
        employee.last_name,
    ]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    '-',

  email:
    employee.email ||
    '-',

  phone:
    employee.phone ||
    employee.phoneNumber ||
    employee.phone_number ||
    '-',

  department:
    employee.departmentName ||
    employee.department_name ||
    employee.department ||
    '-',

  departmentId:
    employee.departmentId ??
    employee.department_id ??
    null,

  position:
    employee.positionName ||
    employee.position_name ||
    employee.position ||
    '-',

  positionId:
    employee.positionId ??
    employee.position_id ??
    null,

  supervisorName:
    employee.supervisorName ||
    employee.supervisor_name ||
    '-',

  status:
    String(
      employee.status ||
        employee.employeeStatus ||
        'active',
    )
      .trim()
      .toLowerCase(),
});

/* =========================
   Status
========================= */

const translateStatus = (
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
  if (status === 'active') {
    return {
      backgroundColor: '#DCFCE7',
      color: '#15803D',
    };
  }

  if (status === 'inactive') {
    return {
      backgroundColor: '#FEE2E2',
      color: '#B91C1C',
    };
  }

  return {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  };
};

/* =========================
   Component
========================= */

function EmployeeManagementPage() {
  const navigate = useNavigate();

  const [
    employees,
    setEmployees,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState('');

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState('all');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');

  /* =========================
     Load Employees
  ========================= */

  const loadEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const response =
        await api.get(
          '/hr/employees',
        );

      const data =
        response.data?.data;

      const employeeList =
        Array.isArray(
          data?.employees,
        )
          ? data.employees
          : Array.isArray(data)
            ? data
            : [];

      setEmployees(
        employeeList.map(
          normalizeEmployee,
        ),
      );
    } catch (loadError) {
      setError(
        loadError.response?.data
          ?.message ||
          'ไม่สามารถโหลดข้อมูลพนักงานได้',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  /* =========================
     Departments
  ========================= */

  const departments =
    useMemo(() => {
      return [
        ...new Set(
          employees
            .map(
              (employee) =>
                employee.department,
            )
            .filter(
              (department) =>
                department &&
                department !== '-',
            ),
        ),
      ].sort((a, b) =>
        a.localeCompare(b),
      );
    }, [employees]);

  /* =========================
     Filter
  ========================= */

  const filteredEmployees =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return employees.filter(
        (employee) => {
          const matchesSearch =
            !keyword ||
            employee.employeeCode
              .toLowerCase()
              .includes(keyword) ||
            employee.fullName
              .toLowerCase()
              .includes(keyword) ||
            employee.email
              .toLowerCase()
              .includes(keyword) ||
            employee.position
              .toLowerCase()
              .includes(keyword);

          const matchesDepartment =
            departmentFilter ===
              'all' ||
            employee.department ===
              departmentFilter;

          const matchesStatus =
            statusFilter ===
              'all' ||
            employee.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
          );
        },
      );
    }, [
      employees,
      searchText,
      departmentFilter,
      statusFilter,
    ]);

  /* =========================
     Summary
  ========================= */

  const activeCount =
    employees.filter(
      (employee) =>
        employee.status ===
        'active',
    ).length;

  const inactiveCount =
    employees.filter(
      (employee) =>
        employee.status ===
        'inactive',
    ).length;

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
        'ใช้งานอยู่',

      value:
        activeCount,

      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        inactiveCount,

      backgroundColor:
        '#FEE2E2',

      color:
        '#B91C1C',
    },
  ];

  /* =========================
     Actions
  ========================= */

  const handleClearFilters = () => {
    setSearchText('');
    setDepartmentFilter('all');
    setStatusFilter('all');
  };

  const handleAddEmployee = () => {
    navigate(
      '/hr/employee-management/add',
    );
  };

  const handleEditEmployee = (
    employee,
  ) => {
    navigate(
      `/hr/employee-management/${employee.id}/edit`,
    );
  };

  const handleToggleStatus =
    async (employee) => {
      if (!employee.id) {
        return;
      }

      const nextStatus =
        employee.status ===
        'active'
          ? 'inactive'
          : 'active';

      setUpdatingId(
        employee.id,
      );

      setError('');
      setActionMessage('');

      try {
        await api.patch(
          `/hr/employees/${employee.id}/status`,
          {
            status:
              nextStatus,
          },
        );

        setEmployees(
          (
            previousEmployees,
          ) =>
            previousEmployees.map(
              (item) =>
                item.id ===
                employee.id
                  ? {
                      ...item,
                      status:
                        nextStatus,
                    }
                  : item,
            ),
        );

        setActionMessage(
          nextStatus ===
            'active'
            ? `เปิดใช้งาน ${employee.fullName} แล้ว`
            : `ปิดใช้งาน ${employee.fullName} แล้ว`,
        );
      } catch (updateError) {
        setError(
          updateError.response?.data
            ?.message ||
            'ไม่สามารถเปลี่ยนสถานะพนักงานได้',
        );
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================
     UI
  ========================= */

  return (
    <HRLayout activeMenu="Employee Management">
      {/* Header */}

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
            '22px',
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
          จัดการพนักงาน
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleAddEmployee
          }
          sx={{
            minWidth:
              '140px',

            height:
              '42px',

            padding:
              '0 18px',

            backgroundColor:
              theme.primary,

            color:
              '#FFFFFF',

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

            '&:hover': {
              backgroundColor:
                theme.dark,

              boxShadow:
                'none',
            },
          }}
        >
          + เพิ่มพนักงาน
        </Button>
      </Box>

      {/* Messages */}

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError('')
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {error}
        </Alert>
      )}

      {actionMessage && (
        <Alert
          severity="success"
          onClose={() =>
            setActionMessage('')
          }
          sx={{
            marginBottom:
              '20px',

            borderRadius:
              '10px',
          }}
        >
          {actionMessage}
        </Alert>
      )}

      {/* Summary Cards */}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',

            sm:
              'repeat(3, minmax(0, 1fr))',
          },

          gap: '18px',

          marginBottom:
            '24px',
        }}
      >
        {summaryCards.map(
          (card) => (
            <Paper
              key={card.title}
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

      {/* Main Card */}

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
        {/* Filter */}

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
            รายชื่อพนักงาน
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
              filteredEmployees.length
            }{' '}
            จาก{' '}
            {employees.length}{' '}
            รายการ
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'minmax(250px, 1.4fr) repeat(2, minmax(170px, 0.8fr)) auto',
              },

              gap:
                '14px',

              marginTop:
                '20px',
            }}
          >
            {/* Search */}

            <TextField
              fullWidth
              label="ค้นหาพนักงาน"
              placeholder="ชื่อ รหัส อีเมล หรือตำแหน่ง"
              value={
                searchText
              }
              onChange={(
                event,
              ) =>
                setSearchText(
                  event.target
                    .value,
                )
              }
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

            {/* Department */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                แผนก
              </InputLabel>

              <Select
                value={
                  departmentFilter
                }
                label="แผนก"
                onChange={(
                  event,
                ) =>
                  setDepartmentFilter(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกแผนก
                </MenuItem>

                {departments.map(
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

            {/* Status */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                สถานะ
              </InputLabel>

              <Select
                value={
                  statusFilter
                }
                label="สถานะ"
                onChange={(
                  event,
                ) =>
                  setStatusFilter(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="all">
                  ทุกสถานะ
                </MenuItem>

                <MenuItem value="active">
                  ใช้งานอยู่
                </MenuItem>

                <MenuItem value="inactive">
                  ไม่ใช้งาน
                </MenuItem>

                <MenuItem value="resigned">
                  ลาออก
                </MenuItem>
              </Select>
            </FormControl>

            {/* Clear */}

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
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

                '&:hover':
                  {
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

        {/* Loading */}

        {loading ? (
          <Box
            sx={{
              minHeight:
                '300px',

              display:
                'flex',

              alignItems:
                'center',

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
        ) : filteredEmployees.length >
          0 ? (
          /* Table */

          <Box
            sx={{
              overflowX:
                'auto',
            }}
          >
            <Table
              sx={{
                minWidth:
                  '1050px',
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
                    'อีเมล',
                    'แผนก',
                    'ตำแหน่ง',
                    'สถานะ',
                    'การดำเนินการ',
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
                {filteredEmployees.map(
                  (
                    employee,
                  ) => {
                    const statusStyle =
                      getStatusStyle(
                        employee.status,
                      );

                    return (
                      <TableRow
                        key={
                          employee.id ||
                          employee.employeeCode
                        }
                        hover
                      >
                        {/* Employee Code */}

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
                            {
                              employee.employeeCode
                            }
                          </Typography>
                        </TableCell>

                        {/* Name */}

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
                            {
                              employee.fullName
                            }
                          </Typography>
                        </TableCell>

                        {/* Email */}

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
                          {
                            employee.email
                          }
                        </TableCell>

                        {/* Department */}

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
                          {
                            employee.department
                          }
                        </TableCell>

                        {/* Position */}

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
                          {
                            employee.position
                          }
                        </TableCell>

                        {/* Status */}

                        <TableCell>
                          <Chip
                            label={translateStatus(
                              employee.status,
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
                                '10px',

                              fontWeight:
                                700,
                            }}
                          />
                        </TableCell>

                        {/* Actions */}

                        <TableCell>
                          <Box
                            sx={{
                              display:
                                'flex',

                              alignItems:
                                'center',

                              gap:
                                '14px',

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            <Button
                              type="button"
                              onClick={() =>
                                handleEditEmployee(
                                  employee,
                                )
                              }
                              sx={{
                                minWidth:
                                  0,

                                padding:
                                  0,

                                color:
                                  theme.primary,

                                fontSize:
                                  '11px',

                                fontWeight:
                                  700,

                                textTransform:
                                  'none',

                                '&:hover':
                                  {
                                    backgroundColor:
                                      'transparent',

                                    textDecoration:
                                      'underline',
                                  },
                              }}
                            >
                              แก้ไข
                            </Button>

                            {employee.status !==
                              'resigned' && (
                              <Button
                                type="button"
                                disabled={
                                  updatingId ===
                                  employee.id
                                }
                                onClick={() =>
                                  handleToggleStatus(
                                    employee,
                                  )
                                }
                                sx={{
                                  minWidth:
                                    0,

                                  padding:
                                    0,

                                  color:
                                    employee.status ===
                                    'active'
                                      ? '#DC2626'
                                      : '#2563EB',

                                  fontSize:
                                    '11px',

                                  fontWeight:
                                    700,

                                  textTransform:
                                    'none',

                                  '&:hover':
                                    {
                                      backgroundColor:
                                        'transparent',

                                      textDecoration:
                                        'underline',
                                    },
                                }}
                              >
                                {updatingId ===
                                employee.id
                                  ? 'กำลังบันทึก...'
                                  : employee.status ===
                                      'active'
                                    ? 'ปิดใช้งาน'
                                    : 'เปิดใช้งาน'}
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
        ) : (
          /* Empty State */

          <Box
            sx={{
              minHeight:
                '280px',

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
                  '16px',

                fontWeight:
                  800,

                marginTop:
                  '14px',
              }}
            >
              ไม่พบข้อมูลพนักงาน
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
              ลองเปลี่ยนหรือล้างตัวกรอง
            </Typography>
          </Box>
        )}
      </Paper>
    </HRLayout>
  );
}

export default EmployeeManagementPage;