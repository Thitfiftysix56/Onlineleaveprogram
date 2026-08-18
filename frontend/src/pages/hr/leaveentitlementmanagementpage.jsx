import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import HRLayout from '../../layouts/hrlayout.jsx';
import api from '../../api/axios.js';

const theme = {
  primary: '#059669',
  dark: '#047857',
  soft: '#ECFDF5',
  border: '#A7F3D0',
};

const currentYear =
  new Date().getFullYear();

/* =========================
   Helpers
========================= */

const translateLeaveType = (value) => {
  const labels = {
    'Annual Leave': 'ลาพักร้อน',
    'Sick Leave': 'ลาป่วย',
    'Personal Leave': 'ลากิจ',
    'Maternity Leave': 'ลาคลอด',
    'Paternity Leave': 'ลาเพื่อดูแลบุตร',
    'Ordination Leave': 'ลาอุปสมบท',
    'Military Leave':
      'ลาเพื่อรับราชการทหาร',
    'Other Leave': 'ลาอื่น ๆ',
  };

  return labels[value] || value || '-';
};

const getResponseArray = (
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

const normalizeEntitlement = (
  item,
) => {
  const totalDays = Number(
    item.totalDays ??
      item.total_days ??
      item.entitlement ??
      0,
  );

  const usedDays = Number(
    item.usedDays ??
      item.used_days ??
      item.used ??
      0,
  );

  const remainingDays =
    item.remainingDays ??
    item.remaining_days ??
    Math.max(
      totalDays - usedDays,
      0,
    );

  return {
    id:
      item.id ??
      item.entitlementId ??
      item.entitlement_id,

    employeeId:
      item.employeeId ??
      item.employee_id,

    employeeCode:
      item.employeeCode ||
      item.employee_code ||
      '-',

    employeeName:
      item.employeeName ||
      item.employee_name ||
      item.fullName ||
      [
        item.firstName ||
          item.first_name,
        item.lastName ||
          item.last_name,
      ]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      '-',

    department:
      item.departmentName ||
      item.department_name ||
      item.department ||
      '-',

    departmentId:
      item.departmentId ??
      item.department_id ??
      null,

    leaveTypeId:
      item.leaveTypeId ??
      item.leave_type_id,

    leaveType:
      item.leaveType ||
      item.leaveTypeName ||
      item.leave_type_name ||
      '-',

    year:
      Number(
        item.year ||
          currentYear,
      ),

    totalDays:
      Number.isFinite(
        totalDays,
      )
        ? totalDays
        : 0,

    usedDays:
      Number.isFinite(
        usedDays,
      )
        ? usedDays
        : 0,

    remainingDays:
      Number(
        remainingDays,
      ) || 0,
  };
};

const normalizeEmployee = (
  employee,
) => ({
  id:
    employee.employeeId ??
    employee.employee_id ??
    employee.id,

  code:
    employee.employeeCode ||
    employee.employee_code ||
    employee.code ||
    '-',

  name:
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

  department:
    employee.departmentName ||
    employee.department_name ||
    employee.department ||
    '-',

  status:
    String(
      employee.status ||
        'active',
    ).toLowerCase(),
});

const normalizeLeaveType = (
  leaveType,
) => ({
  id:
    leaveType.leaveTypeId ??
    leaveType.leave_type_id ??
    leaveType.id,

  name:
    leaveType.leaveType ||
    leaveType.leaveTypeName ||
    leaveType.leave_type_name ||
    leaveType.name ||
    '-',

  status:
    String(
      leaveType.status ||
        (
          leaveType.isActive ??
          leaveType.is_active
        )
          ? 'active'
          : 'inactive',
    ).toLowerCase(),
});

/* =========================
   Empty Form
========================= */

const createEmptyForm = () => ({
  employeeId: '',
  leaveTypeId: '',
  year: String(currentYear),
  totalDays: '',
  usedDays: '0',
});

/* =========================
   Component
========================= */

function LeaveEntitlementManagementPage() {
  const [
    entitlements,
    setEntitlements,
  ] = useState([]);

  const [
    employees,
    setEmployees,
  ] = useState([]);

  const [
    leaveTypes,
    setLeaveTypes,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

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
    leaveTypeFilter,
    setLeaveTypeFilter,
  ] = useState('all');

  const [
    yearFilter,
    setYearFilter,
  ] = useState(
    String(currentYear),
  );

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    dialogMode,
    setDialogMode,
  ] = useState('add');

  const [
    selectedEntitlement,
    setSelectedEntitlement,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState(
    createEmptyForm(),
  );

  const [
    formError,
    setFormError,
  ] = useState('');

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* =========================
     Load
  ========================= */

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        entitlementResponse,
        employeeResponse,
        leaveTypeResponse,
      ] = await Promise.all([
        api.get(
          '/hr/leave-entitlements',
        ),

        api.get(
          '/hr/employees',
        ),

        api.get(
          '/hr/leave-types',
        ),
      ]);

      setEntitlements(
        getResponseArray(
          entitlementResponse,
          'entitlements',
        ).map(
          normalizeEntitlement,
        ),
      );

      setEmployees(
        getResponseArray(
          employeeResponse,
          'employees',
        ).map(
          normalizeEmployee,
        ),
      );

      setLeaveTypes(
        getResponseArray(
          leaveTypeResponse,
          'leaveTypes',
        ).map(
          normalizeLeaveType,
        ),
      );
    } catch (loadError) {
      setError(
        loadError.response?.data
          ?.message ||
          'ไม่สามารถโหลดข้อมูลสิทธิ์การลาได้',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     Filter Options
  ========================= */

  const departments =
    useMemo(() => {
      return [
        ...new Set(
          entitlements
            .map(
              (item) =>
                item.department,
            )
            .filter(
              (item) =>
                item &&
                item !== '-',
            ),
        ),
      ].sort();
    }, [entitlements]);

  const years =
    useMemo(() => {
      const availableYears =
        entitlements
          .map(
            (item) =>
              Number(item.year),
          )
          .filter(
            (year) =>
              Number.isFinite(
                year,
              ),
          );

      return [
        ...new Set([
          currentYear,
          ...availableYears,
        ]),
      ].sort(
        (a, b) => b - a,
      );
    }, [entitlements]);

  /* =========================
     Filter
  ========================= */

  const filteredEntitlements =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return entitlements.filter(
        (item) => {
          const matchesSearch =
            !keyword ||
            item.employeeCode
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword);

          const matchesDepartment =
            departmentFilter ===
              'all' ||
            item.department ===
              departmentFilter;

          const matchesLeaveType =
            leaveTypeFilter ===
              'all' ||
            String(
              item.leaveTypeId,
            ) ===
              String(
                leaveTypeFilter,
              );

          const matchesYear =
            yearFilter ===
              'all' ||
            String(item.year) ===
              String(yearFilter);

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesLeaveType &&
            matchesYear
          );
        },
      );
    }, [
      entitlements,
      searchText,
      departmentFilter,
      leaveTypeFilter,
      yearFilter,
    ]);

  /* =========================
     Summary
  ========================= */

  const summaryData =
    useMemo(() => {
      const records =
        filteredEntitlements;

      return {
        totalRecords:
          records.length,

        totalDays:
          records.reduce(
            (total, item) =>
              total +
              Number(
                item.totalDays ||
                  0,
              ),
            0,
          ),

        usedDays:
          records.reduce(
            (total, item) =>
              total +
              Number(
                item.usedDays ||
                  0,
              ),
            0,
          ),

        remainingDays:
          records.reduce(
            (total, item) =>
              total +
              Math.max(
                Number(
                  item.totalDays ||
                    0,
                ) -
                  Number(
                    item.usedDays ||
                      0,
                  ),
                0,
              ),
            0,
          ),
      };
    }, [
      filteredEntitlements,
    ]);

  const summaryCards = [
    {
      title:
        'รายการสิทธิ์ทั้งหมด',

      value:
        summaryData.totalRecords,

      backgroundColor:
        theme.soft,

      color:
        theme.primary,
    },

    {
      title:
        'วันลาที่กำหนด',

      value:
        summaryData.totalDays,

      backgroundColor:
        '#DBEAFE',

      color:
        '#2563EB',
    },

    {
      title:
        'ใช้ไปแล้ว',

      value:
        summaryData.usedDays,

      backgroundColor:
        '#FEE2E2',

      color:
        '#DC2626',
    },

    {
      title:
        'คงเหลือ',

      value:
        summaryData.remainingDays,

      backgroundColor:
        '#DCFCE7',

      color:
        '#15803D',
    },
  ];

  /* =========================
     Dialog
  ========================= */

  const handleOpenAdd = () => {
    setDialogMode('add');

    setSelectedEntitlement(
      null,
    );

    setFormData(
      createEmptyForm(),
    );

    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (
    item,
  ) => {
    setDialogMode('edit');

    setSelectedEntitlement(
      item,
    );

    setFormData({
      employeeId:
        String(
          item.employeeId ||
            '',
        ),

      leaveTypeId:
        String(
          item.leaveTypeId ||
            '',
        ),

      year:
        String(
          item.year ||
            currentYear,
        ),

      totalDays:
        String(
          item.totalDays ??
            '',
        ),

      usedDays:
        String(
          item.usedDays ??
            0,
        ),
    });

    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);

    setSelectedEntitlement(
      null,
    );

    setFormData(
      createEmptyForm(),
    );

    setFormError('');
  };

  const handleFormChange = (
    field,
    value,
  ) => {
    setFormData(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );

    setFormError('');
  };

  /* =========================
     Save
  ========================= */

  const handleSave = async () => {
    setFormError('');

    const employeeId =
      Number(
        formData.employeeId,
      );

    const leaveTypeId =
      Number(
        formData.leaveTypeId,
      );

    const year =
      Number(
        formData.year,
      );

    const totalDays =
      Number(
        formData.totalDays,
      );

    const usedDays =
      Number(
        formData.usedDays,
      );

    if (!employeeId) {
      setFormError(
        'กรุณาเลือกพนักงาน',
      );

      return;
    }

    if (!leaveTypeId) {
      setFormError(
        'กรุณาเลือกประเภทการลา',
      );

      return;
    }

    if (
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      setFormError(
        'กรุณาระบุปีให้ถูกต้อง',
      );

      return;
    }

    if (
      Number.isNaN(
        totalDays,
      ) ||
      totalDays < 0 ||
      totalDays > 365
    ) {
      setFormError(
        'จำนวนวันลาต้องอยู่ระหว่าง 0 - 365 วัน',
      );

      return;
    }

    if (
      Number.isNaN(
        usedDays,
      ) ||
      usedDays < 0
    ) {
      setFormError(
        'จำนวนวันที่ใช้ไปต้องไม่ติดลบ',
      );

      return;
    }

    if (
      usedDays >
      totalDays
    ) {
      setFormError(
        'จำนวนวันที่ใช้ไปต้องไม่มากกว่าสิทธิ์ทั้งหมด',
      );

      return;
    }

    setSaving(true);

    try {
      const payload = {
        employeeId,
        leaveTypeId,
        year,
        totalDays,
        usedDays,
      };

      if (
        dialogMode ===
          'edit' &&
        selectedEntitlement
          ?.id
      ) {
        await api.put(
          `/hr/leave-entitlements/${selectedEntitlement.id}`,
          payload,
        );

        setActionMessage(
          'แก้ไขสิทธิ์การลาเรียบร้อยแล้ว',
        );
      } else {
        await api.post(
          '/hr/leave-entitlements',
          payload,
        );

        setActionMessage(
          'เพิ่มสิทธิ์การลาเรียบร้อยแล้ว',
        );
      }

      setDialogOpen(false);

      setSelectedEntitlement(
        null,
      );

      setFormData(
        createEmptyForm(),
      );

      await loadData();
    } catch (saveError) {
      setFormError(
        saveError.response?.data
          ?.message ||
          'ไม่สามารถบันทึกสิทธิ์การลาได้',
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     Clear Filter
  ========================= */

  const handleClearFilters = () => {
    setSearchText('');

    setDepartmentFilter(
      'all',
    );

    setLeaveTypeFilter(
      'all',
    );

    setYearFilter(
      String(currentYear),
    );
  };

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status ===
          'active',
    );

  const activeLeaveTypes =
    leaveTypes.filter(
      (leaveType) =>
        leaveType.status ===
          'active',
    );

  /* =========================
     UI
  ========================= */

  return (
    <HRLayout activeMenu="Leave Entitlement">
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
          จัดการสิทธิ์การลา
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleOpenAdd
          }
          sx={{
            minWidth:
              '150px',

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
          + เพิ่มสิทธิ์การลา
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
        {/* Filters */}

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
            รายการสิทธิ์การลา
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
              filteredEntitlements.length
            }{' '}
            จาก{' '}
            {entitlements.length}{' '}
            รายการ
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                xl:
                  'minmax(230px, 1.3fr) repeat(3, minmax(150px, 0.75fr)) auto',
              },

              gap:
                '14px',

              marginTop:
                '20px',
            }}
          >
            <TextField
              fullWidth
              label="ค้นหาพนักงาน"
              placeholder="ชื่อหรือรหัสพนักงาน"
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

            {/* Leave Type */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                ประเภทการลา
              </InputLabel>

              <Select
                value={
                  leaveTypeFilter
                }
                label="ประเภทการลา"
                onChange={(
                  event,
                ) =>
                  setLeaveTypeFilter(
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
                  ทุกประเภท
                </MenuItem>

                {leaveTypes.map(
                  (
                    leaveType,
                  ) => (
                    <MenuItem
                      key={
                        leaveType.id
                      }
                      value={
                        String(
                          leaveType.id,
                        )
                      }
                    >
                      {translateLeaveType(
                        leaveType.name,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* Year */}

            <FormControl
              fullWidth
            >
              <InputLabel>
                ปี
              </InputLabel>

              <Select
                value={
                  yearFilter
                }
                label="ปี"
                onChange={(
                  event,
                ) =>
                  setYearFilter(
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
                  ทุกปี
                </MenuItem>

                {years.map(
                  (year) => (
                    <MenuItem
                      key={year}
                      value={String(
                        year,
                      )}
                    >
                      {year}
                    </MenuItem>
                  ),
                )}
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
        ) : filteredEntitlements.length >
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
                    'แผนก',
                    'ประเภทการลา',
                    'ปี',
                    'สิทธิ์ทั้งหมด',
                    'ใช้ไปแล้ว',
                    'คงเหลือ',
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
                {filteredEntitlements.map(
                  (item) => {
                    const remaining =
                      Math.max(
                        Number(
                          item.totalDays ||
                            0,
                        ) -
                          Number(
                            item.usedDays ||
                              0,
                          ),
                        0,
                      );

                    return (
                      <TableRow
                        key={
                          item.id
                        }
                        hover
                      >
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
                              item.employeeCode
                            }
                          </Typography>
                        </TableCell>

                        <TableCell
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
                            item.employeeName
                          }
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
                          {
                            item.department
                          }
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
                          {translateLeaveType(
                            item.leaveType,
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',
                          }}
                        >
                          {
                            item.year
                          }
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize:
                              '12px',

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            item.totalDays
                          }{' '}
                          วัน
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#DC2626',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,
                          }}
                        >
                          {
                            item.usedDays
                          }{' '}
                          วัน
                        </TableCell>

                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              display:
                                'inline-flex',

                              minWidth:
                                '64px',

                              justifyContent:
                                'center',

                              padding:
                                '5px 10px',

                              backgroundColor:
                                '#DCFCE7',

                              color:
                                '#15803D',

                              borderRadius:
                                '999px',

                              fontSize:
                                '10px',

                              fontWeight:
                                700,

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {
                              remaining
                            }{' '}
                            วัน
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(
                                item,
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
                        </TableCell>
                      </TableRow>
                    );
                  },
                )}
              </TableBody>
            </Table>
          </Box>
        ) : (
          /* Empty */

          <Box
            sx={{
              minHeight:
                '280px',

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
              ไม่พบข้อมูลสิทธิ์การลา
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

      {/* =====================
          Add / Edit Dialog
      ====================== */}

      <Dialog
        open={dialogOpen}
        onClose={
          handleCloseDialog
        }
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius:
              '14px',
          },
        }}
      >
        <DialogTitle
          sx={{
            padding:
              '20px 24px',

            color:
              '#111827',

            fontSize:
              '20px',

            fontWeight:
              800,

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          {dialogMode ===
          'add'
            ? 'เพิ่มสิทธิ์การลา'
            : 'แก้ไขสิทธิ์การลา'}
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '24px !important',
          }}
        >
          {formError && (
            <Alert
              severity="error"
              sx={{
                marginBottom:
                  '18px',

                borderRadius:
                  '9px',
              }}
            >
              {formError}
            </Alert>
          )}

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                sm:
                  'repeat(2, 1fr)',
              },

              gap:
                '16px',
            }}
          >
            {/* Employee */}

            <FormControl
              fullWidth
              disabled={
                dialogMode ===
                'edit'
              }
              sx={{
                gridColumn: {
                  xs: 'auto',
                  sm: '1 / -1',
                },
              }}
            >
              <InputLabel>
                พนักงาน
              </InputLabel>

              <Select
                value={
                  formData.employeeId
                }
                label="พนักงาน"
                onChange={(
                  event,
                ) =>
                  handleFormChange(
                    'employeeId',
                    event.target
                      .value,
                  )
                }
              >
                {activeEmployees.map(
                  (
                    employee,
                  ) => (
                    <MenuItem
                      key={
                        employee.id
                      }
                      value={String(
                        employee.id,
                      )}
                    >
                      {
                        employee.code
                      }{' '}
                      -{' '}
                      {
                        employee.name
                      }
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* Leave Type */}

            <FormControl
              fullWidth
              disabled={
                dialogMode ===
                'edit'
              }
            >
              <InputLabel>
                ประเภทการลา
              </InputLabel>

              <Select
                value={
                  formData.leaveTypeId
                }
                label="ประเภทการลา"
                onChange={(
                  event,
                ) =>
                  handleFormChange(
                    'leaveTypeId',
                    event.target
                      .value,
                  )
                }
              >
                {activeLeaveTypes.map(
                  (
                    leaveType,
                  ) => (
                    <MenuItem
                      key={
                        leaveType.id
                      }
                      value={String(
                        leaveType.id,
                      )}
                    >
                      {translateLeaveType(
                        leaveType.name,
                      )}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            {/* Year */}

            <TextField
              fullWidth
              type="number"
              label="ปี"
              value={
                formData.year
              }
              disabled={
                dialogMode ===
                'edit'
              }
              onChange={(
                event,
              ) =>
                handleFormChange(
                  'year',
                  event.target
                    .value,
                )
              }
              slotProps={{
                htmlInput: {
                  min: 2000,
                  max: 2100,
                },
              }}
            />

            {/* Total */}

            <TextField
              fullWidth
              type="number"
              label="สิทธิ์ทั้งหมด (วัน)"
              value={
                formData.totalDays
              }
              onChange={(
                event,
              ) =>
                handleFormChange(
                  'totalDays',
                  event.target
                    .value,
                )
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 365,
                },
              }}
            />

            {/* Used */}

            <TextField
              fullWidth
              type="number"
              label="ใช้ไปแล้ว (วัน)"
              value={
                formData.usedDays
              }
              onChange={(
                event,
              ) =>
                handleFormChange(
                  'usedDays',
                  event.target
                    .value,
                )
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: 365,
                },
              }}
            />
          </Box>

          {dialogMode ===
            'edit' &&
            selectedEntitlement && (
              <Box
                sx={{
                  marginTop:
                    '18px',

                  padding:
                    '14px 16px',

                  backgroundColor:
                    '#F8FAFC',

                  border:
                    '1px solid #E5E7EB',

                  borderRadius:
                    '10px',
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '11px',
                  }}
                >
                  กำลังแก้ไข
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#111827',

                    fontSize:
                      '13px',

                    fontWeight:
                      800,

                    marginTop:
                      '3px',
                  }}
                >
                  {
                    selectedEntitlement.employeeCode
                  }{' '}
                  -{' '}
                  {
                    selectedEntitlement.employeeName
                  }
                </Typography>

                <Typography
                  sx={{
                    color:
                      theme.primary,

                    fontSize:
                      '12px',

                    fontWeight:
                      700,

                    marginTop:
                      '4px',
                  }}
                >
                  {translateLeaveType(
                    selectedEntitlement.leaveType,
                  )}{' '}
                  · ปี{' '}
                  {
                    selectedEntitlement.year
                  }
                </Typography>
              </Box>
            )}
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 22px',

            borderTop:
              '1px solid #E5E7EB',

            gap:
              '10px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            disabled={saving}
            onClick={
              handleCloseDialog
            }
            sx={{
              minWidth:
                '100px',

              height:
                '42px',

              color:
                '#475569',

              borderColor:
                '#CBD5E1',

              borderRadius:
                '8px',

              fontSize:
                '12px',

              fontWeight:
                700,

              textTransform:
                'none',
            }}
          >
            ยกเลิก
          </Button>

          <Button
            type="button"
            variant="contained"
            disabled={saving}
            onClick={
              handleSave
            }
            sx={{
              minWidth:
                '120px',

              height:
                '42px',

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
            {saving
              ? 'กำลังบันทึก...'
              : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default LeaveEntitlementManagementPage;
