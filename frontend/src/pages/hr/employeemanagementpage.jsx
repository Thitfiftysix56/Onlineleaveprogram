import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import {
  getEmployees,
  updateEmployeeStatus,
} from '../../api/employee-service.js';

function EmployeeManagementPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] =
    useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionMessage, setActionMessage] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const rows = await getEmployees();
      setEmployees(rows.map((employee) => ({
        ...employee,
        id: employee.employeeId,
        employeeId: employee.employeeCode,
        name: employee.fullName,
        role: employee.roleName,
        status: employee.status.charAt(0).toUpperCase() + employee.status.slice(1),
      })));
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const departments = useMemo(() => [
    'All',
    ...new Set(employees.map((employee) => employee.department)),
  ], [employees]);

  const filteredEmployees = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !keyword ||
        employee.employeeId.toLowerCase().includes(keyword) ||
        employee.name.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword) ||
        employee.position.toLowerCase().includes(keyword);

      const matchesDepartment =
        departmentFilter === 'All' ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        employee.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [employees, searchText, departmentFilter, statusFilter]);

  const activeEmployees = employees.filter(
    (employee) => employee.status === 'Active',
  ).length;

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === 'Inactive',
  ).length;

  const handleAddEmployee = () => {
    navigate('/hr/employee-management/add');
  };

  const handleViewEmployee = (employee) => {
    setActionMessage(
      `View selected for ${employee.name}. Employee detail navigation will be connected later.`,
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleEditEmployee = (employee) => {
    navigate(`/hr/employee-management/${employee.id}/edit`);
  };

  const handleStatusChange = async (employee) => {
    const nextStatus = employee.status === 'Active' ? 'Inactive' : 'Active';
    if (!window.confirm(`Change ${employee.name} to ${nextStatus}?`)) return;
    setUpdatingId(employee.id);
    try {
      await updateEmployeeStatus(employee.id, nextStatus);
      await loadEmployees();
      setActionMessage(`${employee.name} was changed to ${nextStatus}.`);
    } catch (error) {
      setActionMessage(error.response?.data?.message || 'Unable to update employee status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setDepartmentFilter('All');
    setStatusFilter('All');
    setActionMessage('');
  };

  return (
    <HRLayout activeMenu="Employee Management">
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
            Employee Management
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            View and manage employee information registered in
            the system.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={handleAddEmployee}
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

      {actionMessage && (
        <Alert
          severity="info"
          onClose={() => setActionMessage('')}
          sx={{
            marginBottom: '24px',
            borderRadius: '8px',
          }}
        >
          {actionMessage}
        </Alert>
      )}

      {loadError && (
        <Alert severity="error" action={<Button onClick={loadEmployees}>Retry</Button>} sx={{ marginBottom: '24px' }}>
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
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
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
            Total Employees
          </Typography>

          <Typography
            sx={{
              color: '#111827',
              fontSize: '30px',
              fontWeight: 800,
              marginTop: '8px',
            }}
          >
            {employees.length}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            padding: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
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
            Active Employees
          </Typography>

          <Typography
            sx={{
              color: '#059669',
              fontSize: '30px',
              fontWeight: 800,
              marginTop: '8px',
            }}
          >
            {activeEmployees}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            padding: '20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
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
            Inactive Employees
          </Typography>

          <Typography
            sx={{
              color: '#DC2626',
              fontSize: '30px',
              fontWeight: 800,
              marginTop: '8px',
            }}
          >
            {inactiveEmployees}
          </Typography>
        </Paper>
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
            Employee List
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            Showing {filteredEmployees.length} of{' '}
            {employees.length} employees
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'minmax(240px, 2fr) minmax(190px, 1fr) minmax(150px, 1fr) auto',
              },
              gap: '16px',
              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Employee"
              placeholder="Employee ID, name, email or position"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  borderRadius: '8px',
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="employee-department-filter-label">
                Department
              </InputLabel>

              <Select
                labelId="employee-department-filter-label"
                value={departmentFilter}
                label="Department"
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',
                }}
              >
                {departments.map((department) => (
                  <MenuItem
                    key={department}
                    value={department}
                  >
                    {department === 'All'
                      ? 'All Departments'
                      : department}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="employee-status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="employee-status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',
                }}
              >
                <MenuItem value="All">
                  All Statuses
                </MenuItem>

                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              type="button"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                minWidth: '120px',
                height: '48px',
                padding: '0 18px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ minHeight: '300px', display: 'grid', placeItems: 'center' }}>
            <Typography sx={{ color: '#6B7280' }}>Loading employees...</Typography>
          </Box>
        ) : filteredEmployees.length > 0 ? (
          <Box
            sx={{
              overflowX: 'auto',
            }}
          >
            <Box
              component="table"
              sx={{
                width: '100%',
                minWidth: '1050px',
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
                    'Employee ID',
                    'Employee',
                    'Department',
                    'Position',
                    'Role',
                    'Status',
                    'Action',
                  ].map((heading) => (
                    <Box
                      key={heading}
                      component="th"
                      sx={{
                        padding: '14px 18px',
                        color: '#6B7280',
                        borderBottom: '1px solid #E5E7EB',
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
                {filteredEmployees.map((employee) => (
                  <Box
                    key={employee.id}
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
                        borderBottom: '1px solid #E5E7EB',
                        color: '#059669',
                        fontSize: '13px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {employee.employeeId}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: '16px 18px',
                        borderBottom: '1px solid #E5E7EB',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      >
                        {employee.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#6B7280',
                          fontSize: '12px',
                          marginTop: '3px',
                        }}
                      >
                        {employee.email}
                      </Typography>
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: '16px 18px',
                        borderBottom: '1px solid #E5E7EB',
                        color: '#4B5563',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {employee.department}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: '16px 18px',
                        borderBottom: '1px solid #E5E7EB',
                        color: '#4B5563',
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {employee.position}
                    </Box>

                    <Box
                      component="td"
                      sx={{
                        padding: '16px 18px',
                        borderBottom: '1px solid #E5E7EB',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Chip
                        label={employee.role}
                        size="small"
                        sx={{
                          minWidth: '78px',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
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
                        borderBottom: '1px solid #E5E7EB',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Chip
                        label={employee.status}
                        disabled={updatingId === employee.id}
                        onClick={() => handleStatusChange(employee)}
                        size="small"
                        sx={{
                          minWidth: '78px',
                          backgroundColor:
                            employee.status === 'Active'
                              ? '#DCFCE7'
                              : '#FEE2E2',
                          color:
                            employee.status === 'Active'
                              ? '#15803D'
                              : '#B91C1C',
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
                        borderBottom: '1px solid #E5E7EB',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                        }}
                      >
                        <Button
                          type="button"
                          onClick={() =>
                            handleViewEmployee(employee)
                          }
                          sx={{
                            minWidth: 0,
                            padding: 0,
                            color: '#059669',
                            fontSize: '13px',
                            fontWeight: 700,
                            textTransform: 'none',

                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          View
                        </Button>

                        <Button
                          type="button"
                          onClick={() =>
                            handleEditEmployee(employee)
                          }
                          sx={{
                            minWidth: 0,
                            padding: 0,
                            color: '#2563EB',
                            fontSize: '13px',
                            fontWeight: 700,
                            textTransform: 'none',

                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
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
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: '64px',
                height: '64px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
              No employees found
            </Typography>

            <Typography
              sx={{
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '6px',
              }}
            >
              Try changing or clearing the current filters.
            </Typography>

            <Button
              type="button"
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                height: '42px',
                marginTop: '20px',
                padding: '0 18px',
                color: '#059669',
                borderColor: '#059669',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  borderColor: '#047857',
                  backgroundColor: '#ECFDF5',
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

export default EmployeeManagementPage;
