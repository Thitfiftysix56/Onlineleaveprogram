import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import AdminLayout from '../../layouts/adminlayout.jsx';

import {
  auditLogStorageKey,
  formatAuditAction,
  getAuditLogs,
} from '../../utils/auditlogstorage.js';

const employeeNames = {
  employee001: 'Employee User',
  supervisor001: 'Nattapong Srisuk',
  hr001: 'Suda Rattanapong',
  admin001: 'Preecha Wongchai',
  system: 'System',
};

const actionGroups = [
  {
    value: 'Authentication',
    label: 'Authentication',
    actions: [
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
      'CHANGE_PASSWORD',
    ],
  },
  {
    value: 'User Management',
    label: 'User Management',
    actions: [
      'CREATE_USER',
      'UPDATE_USER',
      'UPDATE_USER_STATUS',
      'ASSIGN_ROLE',
    ],
  },
  {
    value: 'Leave Request',
    label: 'Leave Request',
    actions: [
      'CREATE_LEAVE_REQUEST',
      'UPDATE_LEAVE_REQUEST_DRAFT',
      'DELETE_LEAVE_REQUEST_DRAFT',
      'SUBMIT_LEAVE_REQUEST',
      'APPROVE_LEAVE_REQUEST',
      'REJECT_LEAVE_REQUEST',
      'CANCEL_LEAVE_REQUEST',
    ],
  },
  {
    value: 'Employee Management',
    label: 'Employee Management',
    actions: [
      'CREATE_EMPLOYEE',
      'UPDATE_EMPLOYEE',
      'UPDATE_EMPLOYEE_STATUS',
      'CREATE_LEAVE_ENTITLEMENT',
      'UPDATE_LEAVE_ENTITLEMENT',
      'ADJUST_LEAVE_ENTITLEMENT',
    ],
  },
  {
    value: 'Organization',
    label: 'Organization',
    actions: [
      'CREATE_DEPARTMENT',
      'UPDATE_DEPARTMENT',
      'UPDATE_DEPARTMENT_STATUS',
      'CREATE_POSITION',
      'UPDATE_POSITION',
      'UPDATE_POSITION_STATUS',
      'CREATE_HOLIDAY',
      'UPDATE_HOLIDAY',
      'UPDATE_HOLIDAY_STATUS',
    ],
  },
  {
    value: 'File and Report',
    label: 'File and Report',
    actions: [
      'UPLOAD_ATTACHMENT',
      'DELETE_ATTACHMENT',
      'EXPORT_REPORT',
    ],
  },
];

const normalizeRoleName = (role) => {
  const normalizedRole = String(
    role || 'system',
  )
    .trim()
    .toLowerCase();

  if (normalizedRole === 'hr') {
    return 'HR';
  }

  return (
    normalizedRole
      .charAt(0)
      .toUpperCase() +
    normalizedRole.slice(1)
  );
};

const normalizeAuditLogForPage = (
  auditLog,
) => {
  const username =
    auditLog.username ||
    'system';

  return {
    ...auditLog,

    id: Number(auditLog.id),

    username,

    employeeName:
      employeeNames[username] ||
      username,

    role: normalizeRoleName(
      auditLog.role,
    ),

    action: String(
      auditLog.action ||
        'unknown_action',
    )
      .trim()
      .toUpperCase(),

    tableName:
      auditLog.tableName ||
      null,

    recordId:
      auditLog.recordId !==
        undefined &&
      auditLog.recordId !== null
        ? Number(
            auditLog.recordId,
          )
        : null,

    ipAddress:
      auditLog.ipAddress ||
      '127.0.0.1',

    detail:
      auditLog.detail || '-',

    createdAt:
      auditLog.createdAt ||
      new Date().toISOString(),
  };
};

const getLocalDateKey = (
  dateTimeString,
) => {
  const date =
    new Date(dateTimeString);

  if (
    Number.isNaN(date.getTime())
  ) {
    return '';
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

function AuditLogPage() {
  const [
    auditLogs,
    setAuditLogs,
  ] = useState([]);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    roleFilter,
    setRoleFilter,
  ] = useState('All');

  const [
    actionFilter,
    setActionFilter,
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
    selectedLog,
    setSelectedLog,
  ] = useState(null);

  const loadAuditLogs = () => {
    const storedAuditLogs =
      getAuditLogs().map(
        normalizeAuditLogForPage,
      );

    setAuditLogs(
      storedAuditLogs,
    );
  };

  useEffect(() => {
    loadAuditLogs();

    const handleStorageChange = (
      event,
    ) => {
      if (
        !event.key ||
        event.key ===
          auditLogStorageKey
      ) {
        loadAuditLogs();
      }
    };

    const handleWindowFocus =
      () => {
        loadAuditLogs();
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

  const filteredAuditLogs =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      const selectedActionGroup =
        actionGroups.find(
          (group) =>
            group.value ===
            actionFilter,
        );

      return auditLogs.filter(
        (log) => {
          const searchableText = [
            log.username,
            log.employeeName,
            log.role,
            log.action,
            log.tableName,
            log.recordId,
            log.detail,
            log.ipAddress,
          ]
            .filter(
              (value) =>
                value !== null &&
                value !== undefined,
            )
            .join(' ')
            .toLowerCase();

          const matchesSearch =
            !keyword ||
            searchableText.includes(
              keyword,
            );

          const matchesRole =
            roleFilter ===
              'All' ||
            log.role ===
              roleFilter;

          const matchesAction =
            actionFilter ===
              'All' ||
            selectedActionGroup
              ?.actions
              .includes(
                log.action,
              );

          const logDate =
            getLocalDateKey(
              log.createdAt,
            );

          const matchesStartDate =
            !startDate ||
            logDate >= startDate;

          const matchesEndDate =
            !endDate ||
            logDate <= endDate;

          return (
            matchesSearch &&
            matchesRole &&
            matchesAction &&
            matchesStartDate &&
            matchesEndDate
          );
        },
      );
    }, [
      auditLogs,
      searchText,
      roleFilter,
      actionFilter,
      startDate,
      endDate,
    ]);

  const summary = useMemo(
    () => {
      const today =
        getLocalDateKey(
          new Date(),
        );

      return {
        total:
          auditLogs.length,

        today:
          auditLogs.filter(
            (log) =>
              getLocalDateKey(
                log.createdAt,
              ) === today,
          ).length,

        authentication:
          auditLogs.filter(
            (log) =>
              [
                'LOGIN',
                'LOGOUT',
                'LOGIN_FAILED',
                'CHANGE_PASSWORD',
              ].includes(
                log.action,
              ),
          ).length,

        administrative:
          auditLogs.filter(
            (log) =>
              log.role ===
              'Admin',
          ).length,
      };
    },
    [auditLogs],
  );

  const formatDateTime = (
    dateTimeString,
  ) => {
    if (!dateTimeString) {
      return '-';
    }

    const date =
      new Date(dateTimeString);

    if (
      Number.isNaN(date.getTime())
    ) {
      return '-';
    }

    return date.toLocaleString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const getRoleStyle = (
    role,
  ) => {
    const styles = {
      Employee: {
        backgroundColor:
          '#EFF6FF',
        color: '#1D4ED8',
      },

      Supervisor: {
        backgroundColor:
          '#F5F3FF',
        color: '#6D28D9',
      },

      HR: {
        backgroundColor:
          '#ECFDF5',
        color: '#047857',
      },

      Admin: {
        backgroundColor:
          '#FFF7ED',
        color: '#C2410C',
      },

      System: {
        backgroundColor:
          '#F3F4F6',
        color: '#4B5563',
      },
    };

    return (
      styles[role] || {
        backgroundColor:
          '#F3F4F6',

        color: '#4B5563',
      }
    );
  };

  const getActionStyle = (
    action,
  ) => {
    if (
      [
        'LOGIN',
        'LOGOUT',
        'CHANGE_PASSWORD',
      ].includes(action)
    ) {
      return {
        backgroundColor:
          '#EFF6FF',

        color: '#1D4ED8',
      };
    }

    if (
      action.includes(
        'APPROVE',
      ) ||
      action.includes(
        'CREATE',
      )
    ) {
      return {
        backgroundColor:
          '#ECFDF5',

        color: '#047857',
      };
    }

    if (
      action.includes(
        'REJECT',
      ) ||
      action.includes(
        'DELETE',
      ) ||
      action.includes(
        'LOCK',
      )
    ) {
      return {
        backgroundColor:
          '#FEF2F2',

        color: '#B91C1C',
      };
    }

    if (
      action.includes(
        'UPDATE',
      ) ||
      action.includes(
        'ADJUST',
      )
    ) {
      return {
        backgroundColor:
          '#FFF7ED',

        color: '#C2410C',
      };
    }

    if (
      action.includes(
        'UPLOAD',
      ) ||
      action.includes(
        'EXPORT',
      )
    ) {
      return {
        backgroundColor:
          '#F5F3FF',

        color: '#6D28D9',
      };
    }

    return {
      backgroundColor:
        '#F3F4F6',

      color: '#4B5563',
    };
  };

  const handleClearFilters =
    () => {
      setSearchText('');
      setRoleFilter('All');
      setActionFilter('All');
      setStartDate('');
      setEndDate('');
    };

  const summaryCards = [
    {
      title:
        'Total Audit Logs',

      value: summary.total,

      color: '#EA580C',

      backgroundColor:
        '#FFF7ED',
    },

    {
      title:
        'Activity Today',

      value: summary.today,

      color: '#2563EB',

      backgroundColor:
        '#EFF6FF',
    },

    {
      title:
        'Authentication',

      value:
        summary.authentication,

      color: '#7C3AED',

      backgroundColor:
        '#F5F3FF',
    },

    {
      title:
        'Admin Actions',

      value:
        summary.administrative,

      color: '#059669',

      backgroundColor:
        '#ECFDF5',
    },
  ];

  return (
    <AdminLayout activeMenu="Audit Log">
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
            Audit Log
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '15px',

              marginTop: '6px',
            }}
          >
            Review important user
            activities and system
            changes.
          </Typography>
        </Box>

 
      </Box>

      <Paper
        elevation={0}
        sx={{
          padding: {
            xs: '18px',
            sm: '20px 24px',
          },

          marginBottom:
            '24px',

          display: 'flex',

          alignItems:
            'flex-start',

          gap: '14px',

          backgroundColor:
            '#FFF7ED',

          border:
            '1px solid #FED7AA',

          borderRadius: '12px',
        }}
      >
        <Box
          sx={{
            width: '38px',

            height: '38px',

            flexShrink: 0,

            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'center',

            backgroundColor:
              '#FFFFFF',

            color: '#EA580C',

            borderRadius: '10px',

            fontSize: '18px',

            fontWeight: 800,
          }}
        >
          !
        </Box>

        <Box>
          <Typography
            sx={{
              color: '#C2410C',

              fontSize: '14px',

              fontWeight: 800,
            }}
          >
            Read-only system records
          </Typography>

          <Typography
            sx={{
              color: '#9A3412',

              fontSize: '13px',

              lineHeight: 1.7,

              marginTop: '4px',
            }}
          >
            Audit Log records can be
            searched and viewed, but
            they cannot be edited or
            deleted through the
            system.
          </Typography>
        </Box>
      </Paper>

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
        {summaryCards.map(
          (card) => (
            <Paper
              key={card.title}
              elevation={0}
              sx={{
                padding: '20px',

                backgroundColor:
                  '#FFFFFF',

                border:
                  '1px solid #E5E7EB',

                borderRadius:
                  '12px',
              }}
            >
              <Box
                sx={{
                  width: '44px',

                  height: '44px',

                  display: 'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  backgroundColor:
                    card.backgroundColor,

                  color:
                    card.color,

                  borderRadius:
                    '12px',

                  fontSize:
                    '18px',

                  fontWeight:
                    800,
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
            System Activity List
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
              filteredAuditLogs.length
            }{' '}
            of {auditLogs.length}{' '}
            records
          </Typography>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                lg: 'repeat(2, minmax(0, 1fr))',

                xl: 'minmax(260px, 1.5fr) repeat(2, minmax(160px, 0.7fr)) repeat(2, minmax(170px, 0.8fr)) auto',
              },

              gap: '16px',

              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Audit Log"
              placeholder="User, action, table, detail or IP"
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
                          '#EA580C',
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      '#EA580C',
                  },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="audit-role-filter-label">
                Role
              </InputLabel>

              <Select
                labelId="audit-role-filter-label"
                value={roleFilter}
                label="Role"
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        '#EA580C',
                    },
                }}
              >
                <MenuItem value="All">
                  All Roles
                </MenuItem>

                <MenuItem value="Employee">
                  Employee
                </MenuItem>

                <MenuItem value="Supervisor">
                  Supervisor
                </MenuItem>

                <MenuItem value="HR">
                  HR
                </MenuItem>

                <MenuItem value="Admin">
                  Admin
                </MenuItem>

                <MenuItem value="System">
                  System
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="audit-action-filter-label">
                Activity
              </InputLabel>

              <Select
                labelId="audit-action-filter-label"
                value={
                  actionFilter
                }
                label="Activity"
                onChange={(event) =>
                  setActionFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius: '8px',

                  '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                    {
                      borderColor:
                        '#EA580C',
                    },
                }}
              >
                <MenuItem value="All">
                  All Activities
                </MenuItem>

                {actionGroups.map(
                  (group) => (
                    <MenuItem
                      key={group.value}
                      value={group.value}
                    >
                      {group.label}
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

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          '#EA580C',
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      '#EA580C',
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

                    '&.Mui-focused fieldset':
                      {
                        borderColor:
                          '#EA580C',
                      },
                  },

                '& .MuiInputLabel-root.Mui-focused':
                  {
                    color:
                      '#EA580C',
                  },
              }}
            />

            <Button
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth: '100px',

                height: '48px',

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
              Clear
            </Button>
          </Box>
        </Box>

        {filteredAuditLogs.length >
        0 ? (
          <Box
            sx={{
              width: '100%',

              overflowX: 'auto',
            }}
          >
            <Table
              sx={{
                minWidth: '1250px',
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      '#F9FAFB',
                  }}
                >
                  {[
                    'Date and Time',
                    'User',
                    'Role',
                    'Action',
                    'Target',
                    'IP Address',
                    'Details',
                    'View',
                  ].map(
                    (heading) => (
                      <TableCell
                        key={heading}
                        align={
                          heading ===
                          'View'
                            ? 'right'
                            : 'left'
                        }
                        sx={{
                          color:
                            '#6B7280',

                          fontSize:
                            '12px',

                          fontWeight:
                            800,

                          textTransform:
                            'uppercase',

                          letterSpacing:
                            '0.4px',

                          whiteSpace:
                            'nowrap',

                          borderBottom:
                            '1px solid #E5E7EB',
                        }}
                      >
                        {heading}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAuditLogs.map(
                  (log) => {
                    const roleStyle =
                      getRoleStyle(
                        log.role,
                      );

                    const actionStyle =
                      getActionStyle(
                        log.action,
                      );

                    return (
                      <TableRow
                        key={log.id}
                        hover
                        sx={{
                          '&:last-child td':
                            {
                              borderBottom:
                                'none',
                            },
                        }}
                      >
                        <TableCell
                          sx={{
                            color:
                              '#6B7280',

                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {formatDateTime(
                            log.createdAt,
                          )}
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '13px',

                              fontWeight:
                                800,
                            }}
                          >
                            {log.username}
                          </Typography>

                          <Typography
                            sx={{
                              color:
                                '#9CA3AF',

                              fontSize:
                                '11px',

                              marginTop:
                                '3px',
                            }}
                          >
                            {
                              log.employeeName
                            }
                          </Typography>
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={log.role}
                            size="small"
                            sx={{
                              minWidth:
                                '82px',

                              backgroundColor:
                                roleStyle.backgroundColor,

                              color:
                                roleStyle.color,

                              borderRadius:
                                '999px',

                              fontSize:
                                '11px',

                              fontWeight:
                                700,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Chip
                            label={formatAuditAction(
                              log.action,
                            )}
                            size="small"
                            sx={{
                              backgroundColor:
                                actionStyle.backgroundColor,

                              color:
                                actionStyle.color,

                              borderRadius:
                                '999px',

                              fontSize:
                                '11px',

                              fontWeight:
                                700,
                            }}
                          />
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#374151',

                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {log.tableName ||
                            '-'}

                          {log.recordId !==
                          null
                            ? ` #${log.recordId}`
                            : ''}
                        </TableCell>

                        <TableCell
                          sx={{
                            color:
                              '#6B7280',

                            fontSize:
                              '12px',

                            whiteSpace:
                              'nowrap',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          {log.ipAddress}
                        </TableCell>

                        <TableCell
                          sx={{
                            maxWidth:
                              '340px',

                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Typography
                            sx={{
                              maxWidth:
                                '340px',

                              color:
                                '#4B5563',

                              fontSize:
                                '12px',

                              overflow:
                                'hidden',

                              textOverflow:
                                'ellipsis',

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {log.detail}
                          </Typography>
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            borderBottom:
                              '1px solid #E5E7EB',
                          }}
                        >
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={() =>
                              setSelectedLog(
                                log,
                              )
                            }
                            sx={{
                              minWidth:
                                '68px',

                              height:
                                '36px',

                              padding:
                                '0 12px',

                              color:
                                '#EA580C',

                              borderColor:
                                '#EA580C',

                              borderRadius:
                                '8px',

                              fontSize:
                                '12px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',

                              '&:hover':
                                {
                                  backgroundColor:
                                    '#FFF7ED',

                                  borderColor:
                                    '#C2410C',
                                },
                            }}
                          >
                            View
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

                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'center',

                backgroundColor:
                  '#FFF7ED',

                color: '#EA580C',

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
              No audit records found
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

                color: '#EA580C',

                borderColor:
                  '#EA580C',

                borderRadius: '8px',

                fontSize: '14px',

                fontWeight: 700,

                textTransform:
                  'none',

                '&:hover': {
                  backgroundColor:
                    '#FFF7ED',

                  borderColor:
                    '#C2410C',
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog
        open={Boolean(selectedLog)}
        onClose={() =>
          setSelectedLog(null)
        }
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#111827',

            fontSize: '20px',

            fontWeight: 800,

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          Audit Log Detail
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '24px !important',
          }}
        >
          {selectedLog && (
            <Box
              sx={{
                display: 'grid',

                gridTemplateColumns: {
                  xs: '1fr',

                  sm: 'repeat(2, minmax(0, 1fr))',
                },

                gap: '20px',
              }}
            >
              {[
                {
                  label:
                    'Date and Time',

                  value:
                    formatDateTime(
                      selectedLog.createdAt,
                    ),
                },

                {
                  label: 'Username',

                  value:
                    selectedLog.username,
                },

                {
                  label: 'Employee',

                  value:
                    selectedLog.employeeName,
                },

                {
                  label: 'Role',

                  value:
                    selectedLog.role,
                },

                {
                  label: 'Action',

                  value:
                    formatAuditAction(
                      selectedLog.action,
                    ),
                },

                {
                  label:
                    'Target Table',

                  value:
                    selectedLog.tableName ||
                    'Not applicable',
                },

                {
                  label:
                    'Record ID',

                  value:
                    selectedLog.recordId ??
                    'Not applicable',
                },

                {
                  label:
                    'IP Address',

                  value:
                    selectedLog.ipAddress,
                },
              ].map(
                (item) => (
                  <Box
                    key={item.label}
                  >
                    <Typography
                      sx={{
                        color:
                          '#9CA3AF',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.5px',
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '14px',

                        fontWeight:
                          700,

                        lineHeight:
                          1.5,

                        marginTop:
                          '5px',

                        wordBreak:
                          'break-word',
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ),
              )}

              <Box
                sx={{
                  gridColumn: {
                    xs: 'auto',

                    sm: '1 / -1',
                  },

                  padding: '18px',

                  backgroundColor:
                    '#F9FAFB',

                  border:
                    '1px solid #E5E7EB',

                  borderRadius: '8px',
                }}
              >
                <Typography
                  sx={{
                    color: '#9CA3AF',

                    fontSize: '11px',

                    fontWeight: 700,

                    textTransform:
                      'uppercase',

                    letterSpacing:
                      '0.5px',
                  }}
                >
                  Activity Detail
                </Typography>

                <Typography
                  sx={{
                    color: '#374151',

                    fontSize: '14px',

                    lineHeight: 1.7,

                    marginTop: '8px',

                    whiteSpace:
                      'pre-wrap',
                  }}
                >
                  {selectedLog.detail}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 20px',

            borderTop:
              '1px solid #E5E7EB',
          }}
        >
          <Button
            type="button"
            variant="contained"
            onClick={() =>
              setSelectedLog(null)
            }
            sx={{
              minWidth: '100px',

              height: '42px',

              backgroundColor:
                '#EA580C',

              color: '#FFFFFF',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

              textTransform: 'none',

              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  '#C2410C',

                boxShadow: 'none',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}

export default AuditLogPage;