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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  getDepartments,
  updateDepartmentStatus,
} from '../api/department-service.js';

function RoleDepartmentManagementPage({
  LayoutComponent,
  activeMenu,
  theme,
}) {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionMessage, setActionMessage] = useState('');

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const rows = await getDepartments();
      setDepartments(rows.map((item) => ({ ...item, id: item.departmentId })));
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to load departments.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  const filteredDepartments = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return departments.filter((department) => {
      const matchesSearch =
        !keyword ||
        department.departmentName
          .toLowerCase()
          .includes(keyword) ||
        department.description
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === 'All' ||
        department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, searchText, statusFilter]);

  const departmentSummary = useMemo(
    () => ({
      total: departments.length,
      active: departments.filter(
        (department) => department.status === 'Active',
      ).length,
      inactive: departments.filter(
        (department) => department.status === 'Inactive',
      ).length,
      employees: departments.reduce(
        (total, department) =>
          total + department.employeeCount,
        0,
      ),
    }),
    [departments],
  );

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter('All');
    setActionMessage('');
  };

  const handleAddDepartment = () => {
    navigate('/admin/department-management/add');
  };

  const handleEditDepartment = (department) => {
    navigate(`/admin/department-management/${department.id}/edit`);
  };

  const handleStatusChange = async (selectedDepartment) => {
    const nextStatus =
      selectedDepartment.status === 'Active'
        ? 'Inactive'
        : 'Active';

    setUpdatingId(selectedDepartment.id);
    try {
      await updateDepartmentStatus(selectedDepartment.id, nextStatus);
      await loadDepartments();
      setActionMessage(`${selectedDepartment.departmentName} was changed to ${nextStatus}.`);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Unable to update department status.');
    } finally { setUpdatingId(null); }
  };

  const summaryCards = [
    {
      title: 'Total Departments',
      value: departmentSummary.total,
      color: theme.primary,
      backgroundColor: theme.soft,
    },
    {
      title: 'Active Departments',
      value: departmentSummary.active,
      color: '#059669',
      backgroundColor: '#ECFDF5',
    },
    {
      title: 'Inactive Departments',
      value: departmentSummary.inactive,
      color: '#D97706',
      backgroundColor: '#FFFBEB',
    },
    {
      title: 'Total Employees',
      value: departmentSummary.employees,
      color: '#2563EB',
      backgroundColor: '#EFF6FF',
    },
  ];

  return (
    <LayoutComponent activeMenu={activeMenu}>
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
            Department Management
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '15px',
              marginTop: '6px',
            }}
          >
            Create, review and manage organization departments.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={handleAddDepartment}
          sx={{
            minWidth: '170px',
            height: '44px',
            padding: '0 20px',
            backgroundColor: theme.primary,
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: 'none',

            '&:hover': {
              backgroundColor: theme.dark,
              boxShadow: 'none',
            },
          }}
        >
          + Add Department
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

      {(loading || loadError) && (
        <Alert severity={loadError ? 'error' : 'info'} action={loadError ? <Button onClick={loadDepartments}>Retry</Button> : null} sx={{ marginBottom: '24px' }}>
          {loadError || 'Loading departments...'}
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
          marginBottom: '24px',
        }}
      >
        {summaryCards.map((card) => (
          <Paper
            key={card.title}
            elevation={0}
            sx={{
              padding: '20px',
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
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              {card.value}
            </Box>

            <Typography
              sx={{
                color: '#111827',
                fontSize: '15px',
                fontWeight: 800,
                marginTop: '14px',
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
            Department List
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',
              fontSize: '14px',
              marginTop: '4px',
            }}
          >
            Showing {filteredDepartments.length} of{' '}
            {departments.length} departments
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(320px, 2fr) minmax(190px, 1fr) auto',
              },
              gap: '16px',
              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Department"
              placeholder="Department name or description"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused fieldset': {
                    borderColor: theme.primary,
                  },
                },

                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.primary,
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="department-status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="department-status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                sx={{
                  height: '48px',
                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor: theme.primary,
                    },
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
                minWidth: '110px',
                height: '48px',
                padding: '0 18px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: '#F9FAFB',
                  borderColor: '#9CA3AF',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {filteredDepartments.length > 0 ? (
          <Box
            sx={{
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <Table
              sx={{
                minWidth: '980px',
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  {[
                    'Department',
                    'Description',
                    'Employees',
                    'Active Employees',
                    'Status',
                    'Updated',
                    'Actions',
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      align={
                        heading === 'Actions'
                          ? 'right'
                          : [
                                'Employees',
                                'Active Employees',
                              ].includes(heading)
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
                {filteredDepartments.map((department) => {
                  const isActive =
                    department.status === 'Active';

                  return (
                    <TableRow
                      key={department.id}
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
                          fontSize: '14px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {department.departmentName}
                      </TableCell>

                      <TableCell
                        sx={{
                          maxWidth: '360px',
                          color: '#4B5563',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {department.description}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: 700,
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {department.employeeCount}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          color: '#059669',
                          fontSize: '14px',
                          fontWeight: 700,
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {department.activeEmployeeCount}
                      </TableCell>

                      <TableCell
                        sx={{
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        <Chip
                          label={department.status}
                          size="small"
                          sx={{
                            minWidth: '76px',
                            backgroundColor: isActive
                              ? '#DCFCE7'
                              : '#FEF3C7',
                            color: isActive
                              ? '#15803D'
                              : '#B45309',
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
                        {department.updatedAt}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          whiteSpace: 'nowrap',
                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px',
                          }}
                        >
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() =>
                              handleEditDepartment(
                                department,
                              )
                            }
                            sx={{
                              minWidth: '68px',
                              height: '36px',
                              padding: '0 12px',
                              color: theme.primary,
                              borderColor: theme.primary,
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'none',

                              '&:hover': {
                                backgroundColor: theme.soft,
                                borderColor: theme.dark,
                              },
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="outlined"
                            disabled={updatingId === department.id}
                            onClick={() =>
                              handleStatusChange(
                                department,
                              )
                            }
                            sx={{
                              minWidth: '92px',
                              height: '36px',
                              padding: '0 12px',
                              color: isActive
                                ? '#B45309'
                                : '#15803D',
                              borderColor: isActive
                                ? '#F59E0B'
                                : '#22C55E',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'none',

                              '&:hover': {
                                backgroundColor: isActive
                                  ? '#FFFBEB'
                                  : '#F0FDF4',
                              },
                            }}
                          >
                            {isActive
                              ? 'Deactivate'
                              : 'Activate'}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.soft,
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
              No departments found
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
                color: theme.primary,
                borderColor: theme.primary,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',

                '&:hover': {
                  backgroundColor: theme.soft,
                  borderColor: theme.dark,
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>
    </LayoutComponent>
  );
}

export default RoleDepartmentManagementPage;
