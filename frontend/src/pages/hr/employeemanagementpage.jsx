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
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  useNavigate,
} from 'react-router-dom';

import HRLayout from '../../layouts/hrlayout.jsx';
import { ConfirmationDialog, DataListToolbar } from '../../components/shareduiprimitives.jsx';
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

  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [disableTarget, setDisableTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogError, setDeleteDialogError] = useState('');

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
              .includes(keyword) ||
            employee.department
              .toLowerCase()
              .includes(keyword) ||
            String(
              employee.status === 'active'
                ? 'ใช้งานอยู่'
                : employee.status === 'inactive'
                  ? 'ไม่ใช้งาน'
                  : employee.status,
            )
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

  const paginatedEmployees = useMemo(
    () => filteredEmployees.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [filteredEmployees, page],
  );

  useEffect(() => { setPage(0); }, [searchText, departmentFilter, statusFilter]);

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
      { state: { returnTo: `${window.location.pathname}${window.location.search}` } },
    );
  };

  const handleEditEmployee = (
    employee,
  ) => {
    navigate(
      `/hr/employee-management/${employee.id}/edit`,
      { state: { returnTo: `${window.location.pathname}${window.location.search}` } },
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

  const handleDeleteEmployee = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setUpdatingId(target.id);
    setError('');
    setActionMessage('');
    setDeleteDialogError('');
    try {
      await api.delete(`/hr/employees/${target.id}`);
      setDeleteTarget(null);
      await loadEmployees();
      setActionMessage(`ลบพนักงาน ${target.fullName} เรียบร้อยแล้ว`);
    } catch (deleteError) {
      const reason = deleteError.response?.data?.message || 'ไม่สามารถลบพนักงานได้';
      const actionableMessage = reason.includes('บัญชีผู้ใช้')
        ? 'ลบพนักงานไม่ได้ เนื่องจากยังมีบัญชีผู้ใช้เชื่อมอยู่ กรุณาให้ผู้ดูแลระบบปิดใช้งานและลบบัญชีผู้ใช้ก่อน แล้วจึงลองลบพนักงานอีกครั้ง'
        : `ลบพนักงานไม่ได้: ${reason}`;
      setDeleteTarget(null);
      setDeleteDialogError('');
      setError(actionableMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <HRLayout activeMenu="Employee Management">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button type="button" variant="contained" onClick={handleAddEmployee}>+ เพิ่มพนักงาน</Button>
      </Box>
      {/* Header */}

      <Box
        sx={{
          display: 'none',

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
            '16px',
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
              '40px',

            padding:
              '0 18px',

            backgroundColor:
              '#2563EB',

            color:
              '#FFFFFF',

            borderRadius:
              '9px',

            fontSize:
              '13px',

            fontWeight:
              700,

            textTransform:
              'none',

            boxShadow:
              'none',

            '&:hover': {
              backgroundColor:
                '#1D4ED8',

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

      {/* Main Card */}

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '20px',

          boxShadow:
            '0 4px 16px rgba(15, 23, 42, 0.04)',

          overflow:
            'hidden',
        }}
      >
        {/* Filter */}

        <Box
          sx={{
            padding:
              '20px 24px',
          }}
        >
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
            รายชื่อพนักงาน
          </Typography>

          <DataListToolbar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="ค้นหาชื่อ รหัส หรืออีเมล"
            resultLabel=""
            activeFilters={[
              ...(departmentFilter !== 'all' ? [{ key: 'department', label: `แผนก: ${departmentFilter}`, onDelete: () => setDepartmentFilter('all') }] : []),
              ...(statusFilter !== 'all' ? [{ key: 'status', label: `สถานะ: ${statusFilter === 'active' ? 'ใช้งานอยู่' : statusFilter === 'inactive' ? 'ไม่ใช้งาน' : 'ลาออก'}`, onDelete: () => setStatusFilter('all') }] : []),
            ]}
            onClearFilters={handleClearFilters}
            filters={<><FormControl size="small"><Select value={departmentFilter === 'all' ? '' : departmentFilter} displayEmpty renderValue={(value) => value || 'แผนก'} inputProps={{ 'aria-label': 'แผนก' }} onChange={(event) => setDepartmentFilter(event.target.value || 'all')}>{departments.map((department) => <MenuItem key={department} value={department}>{department}</MenuItem>)}</Select></FormControl><FormControl size="small"><Select value={statusFilter === 'all' ? '' : statusFilter} displayEmpty renderValue={(value) => value === 'active' ? 'ใช้งานอยู่' : value === 'inactive' ? 'ไม่ใช้งาน' : value === 'resigned' ? 'ลาออก' : 'สถานะ'} inputProps={{ 'aria-label': 'สถานะ' }} onChange={(event) => setStatusFilter(event.target.value || 'all')}><MenuItem value="active">ใช้งานอยู่</MenuItem><MenuItem value="inactive">ไม่ใช้งาน</MenuItem><MenuItem value="resigned">ลาออก</MenuItem></Select></FormControl></>}
            sx={{ marginTop: '16px' }}
          />

          <Box
            sx={{
              display:
                'none',

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
                {paginatedEmployees.map(
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
                        tabIndex={0}
                        onClick={() => handleEditEmployee(employee)}
                        onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleEditEmployee(employee); } }}
                        sx={{ cursor: 'pointer', '&:focus-visible': { outline: '2px solid #2563EB', outlineOffset: -2 } }}
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
                            {employee.status !== 'resigned' ? (
                              <Button type="button" size="small" variant="outlined" disabled={updatingId === employee.id} onClick={(event) => { event.stopPropagation(); if (employee.status === 'active') setDisableTarget(employee); else handleToggleStatus(employee); }} sx={{ color: employee.status === 'active' ? '#DC2626' : '#15803D', borderColor: employee.status === 'active' ? '#FECACA' : '#BBF7D0', '&:hover': { backgroundColor: employee.status === 'active' ? '#FEF2F2' : '#F0FDF4' } }}>{updatingId === employee.id ? 'กำลังบันทึก...' : employee.status === 'active' ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}</Button>
                            ) : null}
                            {employee.status !== 'active' ? (
                              <Button
                                type="button"
                                size="small"
                                variant="contained"
                                color="error"
                                disabled={updatingId === employee.id}
                                onClick={(event) => { event.stopPropagation(); setDeleteDialogError(''); setDeleteTarget(employee); }}
                                sx={{ boxShadow: 'none' }}
                              >
                                ลบ
                              </Button>
                            ) : null}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
            {filteredEmployees.length > rowsPerPage ? <TablePagination component="div" count={filteredEmployees.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[rowsPerPage]} labelRowsPerPage="" labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.ceil(filteredEmployees.length / rowsPerPage)}`} /> : null}
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
              ลองปรับตัวกรองหรือกดกากบาทเพื่อล้างค่า
            </Typography>
          </Box>
        )}
      </Paper>
      <ConfirmationDialog open={Boolean(disableTarget)} title="ยืนยันการปิดใช้งานพนักงาน" description={`ต้องการปิดใช้งาน ${disableTarget?.fullName || disableTarget?.name || ''} ใช่หรือไม่`} loading={updatingId === disableTarget?.id} onCancel={() => setDisableTarget(null)} onConfirm={async () => { const target = disableTarget; if (!target) return; await handleToggleStatus(target); setDisableTarget(null); }} />
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="ยืนยันการลบพนักงาน"
        description={deleteDialogError
          ? `ลบไม่สำเร็จ: ${deleteDialogError}`
          : `ต้องการลบ ${deleteTarget?.fullName || ''} ใช่หรือไม่ ระบบจะลบได้เมื่อปิดใช้งานแล้ว และไม่มีบัญชี ประวัติคำขอลา หรือพนักงานใต้บังคับบัญชาอ้างอิงอยู่`}
        confirmLabel="ลบพนักงาน"
        loadingLabel="กำลังลบ..."
        loading={updatingId === deleteTarget?.id}
        onCancel={() => { setDeleteTarget(null); setDeleteDialogError(''); }}
        onConfirm={handleDeleteEmployee}
      />
    </HRLayout>
  );
}

export default EmployeeManagementPage;
