import {
  useCallback,
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
  TextField,
  Typography,
} from '@mui/material';

import HRLayout from '../../layouts/hrlayout.jsx';

import {
  getLeaveEntitlements,
  leaveEntitlementStorageKey,
  upsertLeaveEntitlement,
} from '../../utils/leaveentitlementstorage.js';

import {
  getLeaveRequests,
  leaveRequestStorageKey,
} from '../../utils/leaverequeststorage.js';

import {
  createAuditLog,
} from '../../utils/auditlogstorage.js';

const employeeProfiles = {
  employee: {
    employeeId: 'EMP001',
    employeeName: 'Employee User',
    department: 'Information Technology',
    roleLabel: 'Employee',
  },

  supervisor: {
    employeeId: 'EMP002',
    employeeName: 'Supervisor User',
    department: 'Information Technology',
    roleLabel: 'Supervisor',
  },

  hr: {
    employeeId: 'EMP003',
    employeeName: 'HR User',
    department: 'Human Resources',
    roleLabel: 'HR',
  },

  admin: {
    employeeId: 'EMP004',
    employeeName: 'Admin User',
    department: 'Information Technology',
    roleLabel: 'Admin',
  },
};

const leaveTypeOptions = [
  {
    id: 1,
    name: 'Annual Leave',
  },
  {
    id: 2,
    name: 'Sick Leave',
  },
  {
    id: 3,
    name: 'Personal Leave',
  },
];

const roleOptions = [
  'employee',
  'supervisor',
  'hr',
  'admin',
];

const emptyDialogForm = {
  role: 'employee',
  leaveTypeId: 1,
  year: new Date().getFullYear(),
  totalDays: '',
  usedDays: '0',
};

const tableCellSx = {
  padding: '16px',
  borderBottom:
    '1px solid #E5E7EB',
  whiteSpace: 'nowrap',
};

const tableTextCellSx = (
  color,
  fontWeight,
) => ({
  ...tableCellSx,
  color,
  fontSize: '13px',
  fontWeight,
});

const tableNumberCellSx = (
  color,
) => ({
  ...tableCellSx,
  color,
  fontSize: '13px',
  fontWeight: 700,
  textAlign: 'center',
});

const normalizeStatus = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : 0;
};

const getRequestYear = (
  request,
) => {
  const dateValue =
    request.startDate ||
    request.submittedAt ||
    request.createdAt ||
    request.updatedAt ||
    '';

  const directYear = Number(
    String(dateValue).slice(
      0,
      4,
    ),
  );

  if (
    Number.isInteger(
      directYear,
    ) &&
    directYear > 0
  ) {
    return directYear;
  }

  const date =
    new Date(dateValue);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date.getFullYear();
};

const getLeaveTypeName = (
  leaveTypeId,
) =>
  leaveTypeOptions.find(
    (leaveType) =>
      Number(leaveType.id) ===
      Number(leaveTypeId),
  )?.name || 'Leave';

function LeaveEntitlementManagementPage() {
  const currentYear =
    new Date().getFullYear();

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
    selectedYear,
    setSelectedYear,
  ] = useState(
    String(currentYear),
  );

  const [
    entitlements,
    setEntitlements,
  ] = useState([]);

  const [
    dialogMode,
    setDialogMode,
  ] = useState(null);

  const [
    selectedEntitlement,
    setSelectedEntitlement,
  ] = useState(null);

  const [
    dialogForm,
    setDialogForm,
  ] = useState({
    ...emptyDialogForm,
    year: currentYear,
  });

  const [
    dialogError,
    setDialogError,
  ] = useState('');

  const [
    actionMessage,
    setActionMessage,
  ] = useState(null);

  const loadEntitlementData =
    useCallback(() => {
      /*
       * เรียกคำขอลาก่อน เพื่อให้ระบบอัปเดต
       * Used Days จากคำขอ Approved เดิม
       * ก่อนอ่านข้อมูล Leave Entitlement
       */
      const requests =
        getLeaveRequests();

      const storedEntitlements =
        getLeaveEntitlements();

      const managementRows =
        storedEntitlements.map(
          (entitlement) => {
            const role = String(
              entitlement.role ||
                'employee',
            ).toLowerCase();

            const profile =
              employeeProfiles[
                role
              ] ||
              employeeProfiles
                .employee;

            const leaveTypeId =
              Number(
                entitlement.leaveTypeId,
              );

            const year =
              Number(
                entitlement.year,
              );

            const pendingDays =
              requests
                .filter(
                  (request) =>
                    String(
                      request.role ||
                        '',
                    ).toLowerCase() ===
                      role &&
                    Number(
                      request.leaveTypeId,
                    ) ===
                      leaveTypeId &&
                    getRequestYear(
                      request,
                    ) === year &&
                    normalizeStatus(
                      request.status,
                    ) ===
                      'pending',
                )
                .reduce(
                  (
                    total,
                    request,
                  ) =>
                    total +
                    toNumber(
                      request.leaveDays,
                    ),
                  0,
                );

            const totalDays =
              Math.max(
                toNumber(
                  entitlement.totalDays,
                ),
                0,
              );

            const usedDays =
              Math.min(
                Math.max(
                  toNumber(
                    entitlement.usedDays,
                  ),
                  0,
                ),
                totalDays,
              );

            const remainingDays =
              Math.max(
                totalDays -
                  usedDays,
                0,
              );

            const availableDays =
              Math.max(
                remainingDays -
                  pendingDays,
                0,
              );

            return {
              ...entitlement,
              ...profile,

              role,

              leaveTypeId,

              leaveType:
                entitlement.leaveType ||
                getLeaveTypeName(
                  leaveTypeId,
                ),

              year,

              totalDays,

              usedDays,

              pendingDays,

              remainingDays,

              availableDays,
            };
          },
        );

      const sortedRows = [
        ...managementRows,
      ].sort(
        (
          firstItem,
          secondItem,
        ) => {
          if (
            firstItem.year !==
            secondItem.year
          ) {
            return (
              secondItem.year -
              firstItem.year
            );
          }

          const employeeComparison =
            firstItem.employeeId
              .localeCompare(
                secondItem.employeeId,
              );

          if (
            employeeComparison !==
            0
          ) {
            return employeeComparison;
          }

          return (
            firstItem.leaveTypeId -
            secondItem.leaveTypeId
          );
        },
      );

      setEntitlements(
        sortedRows,
      );
    }, []);

  useEffect(() => {
    loadEntitlementData();

    const handleStorageChange = (
      event,
    ) => {
      if (
        !event.key ||
        event.key ===
          leaveEntitlementStorageKey ||
        event.key ===
          leaveRequestStorageKey
      ) {
        loadEntitlementData();
      }
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      loadEntitlementData,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        loadEntitlementData,
      );
    };
  }, [loadEntitlementData]);

  const availableYears =
    useMemo(() => {
      const storedYears =
        entitlements
          .map(
            (item) =>
              Number(
                item.year,
              ),
          )
          .filter(
            Number.isInteger,
          );

      return [
        ...new Set([
          currentYear - 1,
          currentYear,
          currentYear + 1,
          ...storedYears,
        ]),
      ].sort(
        (
          firstYear,
          secondYear,
        ) =>
          secondYear -
          firstYear,
      );
    }, [
      currentYear,
      entitlements,
    ]);

  const departments =
    useMemo(
      () => [
        'All',

        ...new Set(
          Object.values(
            employeeProfiles,
          ).map(
            (profile) =>
              profile.department,
          ),
        ),
      ],
      [],
    );

  const filteredEntitlements =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return entitlements.filter(
        (item) => {
          const matchesYear =
            String(item.year) ===
            selectedYear;

          const matchesSearch =
            !keyword ||
            item.employeeId
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            item.employeeName
              .toLowerCase()
              .includes(
                keyword,
              ) ||
            item.roleLabel
              .toLowerCase()
              .includes(
                keyword,
              );

          const matchesDepartment =
            departmentFilter ===
              'All' ||
            item.department ===
              departmentFilter;

          const matchesLeaveType =
            leaveTypeFilter ===
              'All' ||
            item.leaveType ===
              leaveTypeFilter;

          return (
            matchesYear &&
            matchesSearch &&
            matchesDepartment &&
            matchesLeaveType
          );
        },
      );
    }, [
      departmentFilter,
      entitlements,
      leaveTypeFilter,
      searchText,
      selectedYear,
    ]);

  const summary =
    useMemo(
      () =>
        filteredEntitlements.reduce(
          (
            result,
            item,
          ) => ({
            records:
              result.records +
              1,

            totalDays:
              result.totalDays +
              item.totalDays,

            usedDays:
              result.usedDays +
              item.usedDays,

            availableDays:
              result.availableDays +
              item.availableDays,
          }),
          {
            records: 0,
            totalDays: 0,
            usedDays: 0,
            availableDays: 0,
          },
        ),
      [filteredEntitlements],
    );

  const handleClearFilters =
    () => {
      setSearchText('');

      setDepartmentFilter(
        'All',
      );

      setLeaveTypeFilter(
        'All',
      );

      setSelectedYear(
        String(currentYear),
      );

      setActionMessage(
        null,
      );
    };

  const handleOpenAddDialog =
    () => {
      setDialogMode(
        'add',
      );

      setSelectedEntitlement(
        null,
      );

      setDialogForm({
        ...emptyDialogForm,

        year: Number(
          selectedYear,
        ),
      });

      setDialogError('');

      setActionMessage(
        null,
      );
    };

  const handleOpenEditDialog =
    (item) => {
      setDialogMode(
        'edit',
      );

      setSelectedEntitlement(
        item,
      );

      setDialogForm({
        role:
          item.role,

        leaveTypeId:
          item.leaveTypeId,

        year:
          item.year,

        totalDays:
          String(
            item.totalDays,
          ),

        usedDays:
          String(
            item.usedDays,
          ),
      });

      setDialogError('');

      setActionMessage(
        null,
      );
    };

  const handleCloseDialog =
    () => {
      setDialogMode(null);

      setSelectedEntitlement(
        null,
      );

      setDialogForm({
        ...emptyDialogForm,

        year:
          currentYear,
      });

      setDialogError('');
    };

  const updateDialogField = (
    fieldName,
    value,
  ) => {
    setDialogForm(
      (
        previousForm,
      ) => ({
        ...previousForm,

        [fieldName]:
          value,
      }),
    );

    setDialogError('');
  };

  const handleSaveEntitlement =
    () => {
      const totalDays =
        Number(
          dialogForm.totalDays,
        );

      const usedDays =
        Number(
          dialogForm.usedDays,
        );

      const year =
        Number(
          dialogForm.year,
        );

      const leaveTypeId =
        Number(
          dialogForm.leaveTypeId,
        );

      if (
        String(
          dialogForm.totalDays,
        ).trim() === '' ||
        String(
          dialogForm.usedDays,
        ).trim() === ''
      ) {
        setDialogError(
          'Please enter Total Days and Used Days.',
        );

        return;
      }

      if (
        !Number.isFinite(
          totalDays,
        ) ||
        totalDays < 0 ||
        totalDays > 365
      ) {
        setDialogError(
          'Total Days must be between 0 and 365.',
        );

        return;
      }

      if (
        !Number.isFinite(
          usedDays,
        ) ||
        usedDays < 0 ||
        usedDays > 365
      ) {
        setDialogError(
          'Used Days must be between 0 and 365.',
        );

        return;
      }

      if (
        !Number.isInteger(
          year,
        ) ||
        year < 2000 ||
        year > 2100
      ) {
        setDialogError(
          'Entitlement Year must be between 2000 and 2100.',
        );

        return;
      }

      if (
        usedDays >
        totalDays
      ) {
        setDialogError(
          'Used Days cannot be greater than Total Days.',
        );

        return;
      }

      const pendingDays =
        dialogMode ===
        'edit'
          ? toNumber(
              selectedEntitlement
                ?.pendingDays,
            )
          : 0;

      if (
        dialogMode ===
          'edit' &&
        totalDays <
          usedDays +
            pendingDays
      ) {
        setDialogError(
          `Total Days cannot be lower than Used + Pending (${usedDays + pendingDays} days).`,
        );

        return;
      }

      const duplicateEntitlement =
        entitlements.find(
          (item) =>
            item.role ===
              dialogForm.role &&
            Number(
              item.leaveTypeId,
            ) ===
              leaveTypeId &&
            Number(
              item.year,
            ) === year &&
            Number(
              item.id,
            ) !==
              Number(
                selectedEntitlement
                  ?.id,
              ),
        );

      if (
        duplicateEntitlement
      ) {
        setDialogError(
          'This employee already has this leave entitlement for the selected year.',
        );

        return;
      }

      const savedEntitlement =
        upsertLeaveEntitlement({
          id:
            selectedEntitlement
              ?.id || null,

          role:
            dialogForm.role,

          leaveTypeId,

          leaveType:
            getLeaveTypeName(
              leaveTypeId,
            ),

          year,

          totalDays,

          usedDays,
        });

      if (
        !savedEntitlement
      ) {
        setDialogError(
          'The leave entitlement could not be saved.',
        );

        return;
      }

      const profile =
        employeeProfiles[
          dialogForm.role
        ] ||
        employeeProfiles
          .employee;

      createAuditLog({
        userId: 3,

        username:
          'hr001',

        role:
          'hr',

        action:
          dialogMode ===
          'add'
            ? 'create_leave_entitlement'
            : 'update_leave_entitlement',

        tableName:
          'leave_entitlements',

        recordId:
          savedEntitlement.id,

        detail:
          `${dialogMode === 'add' ? 'Created' : 'Updated'} ${profile.employeeId} ${getLeaveTypeName(
            leaveTypeId,
          )} entitlement for ${year}: total ${totalDays} day(s), used ${usedDays} day(s).`,

        ipAddress:
          '127.0.0.1',
      });

      setActionMessage({
        severity:
          'success',

        text:
          `${profile.employeeName}'s ${getLeaveTypeName(
            leaveTypeId,
          )} entitlement for ${year} was saved successfully.`,
      });

      handleCloseDialog();

      loadEntitlementData();

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });
    };

  return (
    <HRLayout
      activeMenu="Leave Entitlement"
    >
      <Box
        sx={{
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

          gap:
            '16px',

          marginBottom:
            '28px',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              color:
                '#111827',

              fontSize: {
                xs:
                  '26px',

                sm:
                  '30px',
              },

              fontWeight:
                800,
            }}
          >
            Leave Entitlement Management
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '15px',

              marginTop:
                '6px',
            }}
          >
            View and update employee leave entitlements and
            available balances.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleOpenAddDialog
          }
          sx={{
            minWidth:
              '170px',

            height:
              '44px',

            padding:
              '0 20px',

            backgroundColor:
              '#059669',

            color:
              '#FFFFFF',

            borderRadius:
              '8px',

            fontSize:
              '14px',

            fontWeight:
              700,

            textTransform:
              'none',

            boxShadow:
              'none',

            '&:hover': {
              backgroundColor:
                '#047857',

              boxShadow:
                'none',
            },
          }}
        >
          Add Entitlement
        </Button>
      </Box>

      {actionMessage && (
        <Alert
          severity={
            actionMessage.severity
          }
          onClose={() =>
            setActionMessage(
              null,
            )
          }
          sx={{
            marginBottom:
              '24px',

            borderRadius:
              '8px',
          }}
        >
          {actionMessage.text}
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
              'repeat(2, minmax(0, 1fr))',

            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '20px',

          marginBottom:
            '24px',
        }}
      >
        {[
          {
            title:
              'Entitlement Records',

            value:
              summary.records,

            color:
              '#2563EB',
          },
          {
            title:
              'Total Entitlement Days',

            value:
              summary.totalDays,

            color:
              '#7C3AED',
          },
          {
            title:
              'Used Leave Days',

            value:
              summary.usedDays,

            color:
              '#DC2626',
          },
          {
            title:
              'Available Leave Days',

            value:
              summary.availableDays,

            color:
              '#059669',
          },
        ].map(
          (card) => (
            <Paper
              key={
                card.title
              }
              elevation={0}
              sx={{
                padding:
                  '20px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '12px',
              }}
            >
              <Typography
                sx={{
                  color:
                    '#6B7280',

                  fontSize:
                    '14px',

                  fontWeight:
                    600,
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color:
                    card.color,

                  fontSize:
                    '30px',

                  fontWeight:
                    800,

                  marginTop:
                    '8px',
                }}
              >
                {card.value}
              </Typography>
            </Paper>
          ),
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor:
            '#FFFFFF',

          border:
            '1px solid #E5E7EB',

          borderRadius:
            '12px',

          overflow:
            'hidden',
        }}
      >
        <Box
          sx={{
            padding: {
              xs:
                '20px',

              sm:
                '24px',
            },

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
            Employee Leave Entitlements
          </Typography>

          <Typography
            sx={{
              color:
                '#6B7280',

              fontSize:
                '14px',

              marginTop:
                '4px',
            }}
          >
            Showing {filteredEntitlements.length}{' '}
            entitlement record(s)
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                lg:
                  'minmax(240px, 2fr) repeat(3, minmax(170px, 1fr)) auto',
              },

              gap:
                '16px',

              marginTop:
                '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Employee"
              placeholder="Employee ID, name or role"
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
                      '8px',
                  },
              }}
            />

            <FormControl
              fullWidth
            >
              <InputLabel id="entitlement-year-label">
                Year
              </InputLabel>

              <Select
                labelId="entitlement-year-label"
                value={
                  selectedYear
                }
                label="Year"
                onChange={(
                  event,
                ) =>
                  setSelectedYear(
                    event.target
                      .value,
                  )
                }
                sx={{
                  height:
                    '48px',

                  borderRadius:
                    '8px',
                }}
              >
                {availableYears.map(
                  (year) => (
                    <MenuItem
                      key={
                        year
                      }
                      value={
                        String(
                          year,
                        )
                      }
                    >
                      {year}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel id="entitlement-department-label">
                Department
              </InputLabel>

              <Select
                labelId="entitlement-department-label"
                value={
                  departmentFilter
                }
                label="Department"
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
                    '8px',
                }}
              >
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
                      {department ===
                      'All'
                        ? 'All Departments'
                        : department}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel id="entitlement-leave-type-label">
                Leave Type
              </InputLabel>

              <Select
                labelId="entitlement-leave-type-label"
                value={
                  leaveTypeFilter
                }
                label="Leave Type"
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
                    '8px',
                }}
              >
                <MenuItem value="All">
                  All Leave Types
                </MenuItem>

                {leaveTypeOptions.map(
                  (
                    leaveType,
                  ) => (
                    <MenuItem
                      key={
                        leaveType.id
                      }
                      value={
                        leaveType.name
                      }
                    >
                      {leaveType.name}
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
                minWidth:
                  '110px',

                height:
                  '48px',

                padding:
                  '0 18px',

                color:
                  '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius:
                  '8px',

                fontSize:
                  '14px',

                fontWeight:
                  700,

                textTransform:
                  'none',
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {filteredEntitlements.length >
        0 ? (
          <Box
            sx={{
              overflowX:
                'auto',
            }}
          >
            <Box
              component="table"
              sx={{
                width:
                  '100%',

                minWidth:
                  '1320px',

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
                    'Employee ID',
                    'Employee',
                    'Role',
                    'Department',
                    'Leave Type',
                    'Year',
                    'Total',
                    'Used',
                    'Pending',
                    'Remaining',
                    'Available',
                    'Action',
                  ].map(
                    (
                      heading,
                    ) => (
                      <Box
                        key={
                          heading
                        }
                        component="th"
                        sx={{
                          padding:
                            '14px 16px',

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
                {filteredEntitlements.map(
                  (item) => (
                    <Box
                      key={
                        item.id
                      }
                      component="tr"
                      sx={{
                        '&:hover':
                          {
                            backgroundColor:
                              '#F9FAFB',
                          },
                      }}
                    >
                      <Box
                        component="td"
                        sx={tableTextCellSx(
                          '#059669',
                          700,
                        )}
                      >
                        {item.employeeId}
                      </Box>

                      <Box
                        component="td"
                        sx={tableTextCellSx(
                          '#111827',
                          700,
                        )}
                      >
                        {item.employeeName}
                      </Box>

                      <Box
                        component="td"
                        sx={
                          tableCellSx
                        }
                      >
                        <Chip
                          label={
                            item.roleLabel
                          }
                          size="small"
                          sx={{
                            backgroundColor:
                              '#EFF6FF',

                            color:
                              '#1D4ED8',

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
                        sx={tableTextCellSx(
                          '#4B5563',
                          400,
                        )}
                      >
                        {item.department}
                      </Box>

                      <Box
                        component="td"
                        sx={
                          tableCellSx
                        }
                      >
                        <Chip
                          label={
                            item.leaveType
                          }
                          size="small"
                          sx={{
                            minWidth:
                              '110px',

                            backgroundColor:
                              '#ECFDF5',

                            color:
                              '#047857',

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
                        sx={tableNumberCellSx(
                          '#374151',
                        )}
                      >
                        {item.year}
                      </Box>

                      <Box
                        component="td"
                        sx={tableNumberCellSx(
                          '#111827',
                        )}
                      >
                        {item.totalDays}
                      </Box>

                      <Box
                        component="td"
                        sx={tableNumberCellSx(
                          '#DC2626',
                        )}
                      >
                        {item.usedDays}
                      </Box>

                      <Box
                        component="td"
                        sx={tableNumberCellSx(
                          '#B45309',
                        )}
                      >
                        {item.pendingDays}
                      </Box>

                      <Box
                        component="td"
                        sx={tableNumberCellSx(
                          '#374151',
                        )}
                      >
                        {item.remainingDays}
                      </Box>

                      <Box
                        component="td"
                        sx={
                          tableCellSx
                        }
                      >
                        <Chip
                          label={`${item.availableDays} Days`}
                          size="small"
                          sx={{
                            minWidth:
                              '84px',

                            backgroundColor:
                              item.availableDays >
                              0
                                ? '#DCFCE7'
                                : '#FEE2E2',

                            color:
                              item.availableDays >
                              0
                                ? '#15803D'
                                : '#B91C1C',

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
                        sx={
                          tableCellSx
                        }
                      >
                        <Button
                          type="button"
                          onClick={() =>
                            handleOpenEditDialog(
                              item,
                            )
                          }
                          sx={{
                            minWidth:
                              0,

                            padding:
                              0,

                            color:
                              '#059669',

                            fontSize:
                              '13px',

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
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  ),
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              minHeight:
                '300px',

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
                  '64px',

                height:
                  '64px',

                backgroundColor:
                  '#ECFDF5',

                color:
                  '#059669',

                borderRadius:
                  '50%',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                fontSize:
                  '24px',

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
                  '18px',

                fontWeight:
                  800,

                marginTop:
                  '16px',
              }}
            >
              No entitlement records found
            </Typography>

            <Typography
              sx={{
                color:
                  '#6B7280',

                fontSize:
                  '14px',

                marginTop:
                  '6px',
              }}
            >
              Try changing or clearing the selected filters.
            </Typography>
          </Box>
        )}
      </Paper>

      <Dialog
        open={Boolean(
          dialogMode,
        )}
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
            padding: {
              xs:
                '20px',

              sm:
                '24px',
            },

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Typography
            component="div"
            sx={{
              color:
                '#111827',

              fontSize:
                '20px',

              fontWeight:
                800,
            }}
          >
            {dialogMode ===
            'add'
              ? 'Add Leave Entitlement'
              : 'Edit Leave Entitlement'}
          </Typography>

          <Typography
            component="div"
            sx={{
              color:
                '#6B7280',

              fontSize:
                '14px',

              marginTop:
                '6px',
            }}
          >
            Total and Used Days will update the shared leave
            balance storage.
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: {
              xs:
                '20px',

              sm:
                '24px',
            },
          }}
        >
          {dialogError && (
            <Alert
              severity="error"
              sx={{
                marginBottom:
                  '20px',

                borderRadius:
                  '8px',
              }}
            >
              {dialogError}
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
                  'repeat(2, minmax(0, 1fr))',
              },

              gap:
                '18px',
            }}
          >
            <FormControl
              fullWidth
              disabled={
                dialogMode ===
                'edit'
              }
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  sm:
                    '1 / -1',
                },
              }}
            >
              <InputLabel id="dialog-employee-label">
                Employee
              </InputLabel>

              <Select
                labelId="dialog-employee-label"
                value={
                  dialogForm.role
                }
                label="Employee"
                onChange={(
                  event,
                ) =>
                  updateDialogField(
                    'role',
                    event.target
                      .value,
                  )
                }
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
                {roleOptions.map(
                  (role) => {
                    const profile =
                      employeeProfiles[
                        role
                      ];

                    return (
                      <MenuItem
                        key={
                          role
                        }
                        value={
                          role
                        }
                      >
                        {profile.employeeId}{' '}
                        —{' '}
                        {profile.employeeName}{' '}
                        (
                        {profile.roleLabel}
                        )
                      </MenuItem>
                    );
                  },
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              disabled={
                dialogMode ===
                'edit'
              }
            >
              <InputLabel id="dialog-leave-type-label">
                Leave Type
              </InputLabel>

              <Select
                labelId="dialog-leave-type-label"
                value={
                  dialogForm.leaveTypeId
                }
                label="Leave Type"
                onChange={(
                  event,
                ) =>
                  updateDialogField(
                    'leaveTypeId',

                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
                {leaveTypeOptions.map(
                  (
                    leaveType,
                  ) => (
                    <MenuItem
                      key={
                        leaveType.id
                      }
                      value={
                        leaveType.id
                      }
                    >
                      {leaveType.name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              type="number"
              label="Entitlement Year"
              value={
                dialogForm.year
              }
              disabled={
                dialogMode ===
                'edit'
              }
              onChange={(
                event,
              ) =>
                updateDialogField(
                  'year',

                  event.target
                    .value,
                )
              }
              inputProps={{
                min: 2000,
                max: 2100,
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />

            <TextField
              fullWidth
              required
              type="number"
              label="Total Days"
              value={
                dialogForm.totalDays
              }
              onChange={(
                event,
              ) =>
                updateDialogField(
                  'totalDays',

                  event.target
                    .value,
                )
              }
              inputProps={{
                min: 0,
                max: 365,
                step: 0.5,
              }}
              helperText="Maximum leave days granted"
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />

            <TextField
              fullWidth
              required
              type="number"
              label="Used Days"
              value={
                dialogForm.usedDays
              }
              onChange={(
                event,
              ) =>
                updateDialogField(
                  'usedDays',

                  event.target
                    .value,
                )
              }
              inputProps={{
                min: 0,
                max: 365,
                step: 0.5,
              }}
              helperText={
                dialogMode ===
                'edit'
                  ? `Pending: ${selectedEntitlement?.pendingDays || 0} day(s)`
                  : 'Approved leave already used'
              }
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: {
              xs:
                '16px 20px 20px',

              sm:
                '16px 24px 24px',
            },

            borderTop:
              '1px solid #E5E7EB',

            gap:
              '10px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={
              handleCloseDialog
            }
            sx={{
              minWidth:
                '100px',

              height:
                '42px',

              color:
                '#374151',

              borderColor:
                '#D1D5DB',

              borderRadius:
                '8px',

              fontSize:
                '14px',

              fontWeight:
                700,

              textTransform:
                'none',
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={
              handleSaveEntitlement
            }
            sx={{
              minWidth:
                '130px',

              height:
                '42px',

              backgroundColor:
                '#059669',

              color:
                '#FFFFFF',

              borderRadius:
                '8px',

              fontSize:
                '14px',

              fontWeight:
                700,

              textTransform:
                'none',

              boxShadow:
                'none',

              '&:hover': {
                backgroundColor:
                  '#047857',

                boxShadow:
                  'none',
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default LeaveEntitlementManagementPage;