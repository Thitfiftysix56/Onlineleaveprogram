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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import HRLayout from '../../layouts/hrlayout.jsx';

import {
  getLeaveTypes,
  leaveTypeStorageKey,
  saveLeaveType,
  setLeaveTypeStatus,
} from '../../utils/leavetypestorage.js';

import {
  getLeaveRequests,
  leaveRequestStorageKey,
} from '../../utils/leaverequeststorage.js';

import {
  getLeaveEntitlements,
  leaveEntitlementStorageKey,
  saveLeaveEntitlements,
} from '../../utils/leaveentitlementstorage.js';

import {
  createAuditLog,
} from '../../utils/auditlogstorage.js';

const emptyForm = {
  code: '',
  name: '',
  defaultDays: '',
  minimumDays: '1',
  maximumDaysPerRequest: '1',
  attachmentRule: 'none',
  attachmentRequiredAfterDays: '',
  status: 'Active',
  description: '',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
};

const actionButtonSx = {
  minWidth: 0,
  padding: 0,
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'none',
};

const toNumber = (value) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

const formatDays = (value) => {
  const numericValue =
    toNumber(value);

  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue
        .toFixed(2)
        .replace(/\.?0+$/, '');
};

const getAttachmentRule = (
  leaveType,
) => {
  if (leaveType.attachmentRequired) {
    return 'always';
  }

  return Number(
    leaveType.attachmentRequiredAfterDays,
  ) > 0
    ? 'threshold'
    : 'none';
};

const getAttachmentLabel = (
  leaveType,
) => {
  const rule =
    getAttachmentRule(leaveType);

  if (rule === 'always') {
    return 'Always Required';
  }

  if (rule === 'threshold') {
    return `From ${formatDays(
      leaveType.attachmentRequiredAfterDays,
    )} Day(s)`;
  }

  return 'Not Required';
};

const createLeaveTypeAuditLog = ({
  action,
  leaveType,
  detail,
}) =>
  createAuditLog({
    userId: 3,

    username:
      'hr001',

    role:
      'hr',

    action,

    tableName:
      'leave_types',

    recordId:
      leaveType?.id || null,

    detail,

    ipAddress:
      '127.0.0.1',
  });

function LeaveTypeManagementPage() {
  const [
    leaveTypes,
    setLeaveTypes,
  ] = useState([]);

  const [
    requestUsage,
    setRequestUsage,
  ] = useState({});

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('All');

  const [
    message,
    setMessage,
  ] = useState(null);

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    dialogMode,
    setDialogMode,
  ] = useState('add');

  const [
    selectedLeaveType,
    setSelectedLeaveType,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    ...emptyForm,
  });

  const [
    errors,
    setErrors,
  ] = useState({});

  const loadData =
    useCallback(() => {
      const storedLeaveTypes =
        getLeaveTypes();

      const usage =
        getLeaveRequests().reduce(
          (
            result,
            request,
          ) => {
            const leaveTypeId =
              Number(
                request.leaveTypeId,
              );

            if (!leaveTypeId) {
              return result;
            }

            return {
              ...result,

              [leaveTypeId]:
                (
                  result[leaveTypeId] ||
                  0
                ) + 1,
            };
          },
          {},
        );

      setLeaveTypes(
        storedLeaveTypes,
      );

      setRequestUsage(
        usage,
      );
    }, []);

  useEffect(() => {
    loadData();

    const handleStorage = (
      event,
    ) => {
      const watchedKeys = [
        leaveTypeStorageKey,
        leaveRequestStorageKey,
        leaveEntitlementStorageKey,
      ];

      if (
        !event.key ||
        watchedKeys.includes(
          event.key,
        )
      ) {
        loadData();
      }
    };

    window.addEventListener(
      'storage',
      handleStorage,
    );

    window.addEventListener(
      'focus',
      loadData,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage,
      );

      window.removeEventListener(
        'focus',
        loadData,
      );
    };
  }, [loadData]);

  const filteredLeaveTypes =
    useMemo(
      () => {
        const keyword =
          searchText
            .trim()
            .toLowerCase();

        return leaveTypes.filter(
          (leaveType) => {
            const matchesSearch =
              !keyword ||
              leaveType.code
                .toLowerCase()
                .includes(keyword) ||
              leaveType.name
                .toLowerCase()
                .includes(keyword) ||
              leaveType.description
                .toLowerCase()
                .includes(keyword);

            const matchesStatus =
              statusFilter ===
                'All' ||
              leaveType.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          },
        );
      },
      [
        leaveTypes,
        searchText,
        statusFilter,
      ],
    );

  const summary =
    useMemo(
      () => ({
        total:
          leaveTypes.length,

        active:
          leaveTypes.filter(
            (item) =>
              item.status ===
              'Active',
          ).length,

        inactive:
          leaveTypes.filter(
            (item) =>
              item.status ===
              'Inactive',
          ).length,

        attachment:
          leaveTypes.filter(
            (item) =>
              getAttachmentRule(
                item,
              ) !== 'none',
          ).length,
      }),
      [leaveTypes],
    );

  const updateForm = (
    fieldName,
    value,
  ) => {
    setForm(
      (
        previousForm,
      ) => ({
        ...previousForm,

        [fieldName]:
          value,
      }),
    );

    setErrors(
      (
        previousErrors,
      ) => ({
        ...previousErrors,

        [fieldName]: '',

        form: '',
      }),
    );
  };

  const closeDialog = () => {
    setDialogOpen(false);

    setDialogMode('add');

    setSelectedLeaveType(
      null,
    );

    setForm({
      ...emptyForm,
    });

    setErrors({});
  };

  const openAddDialog = () => {
    setDialogMode('add');

    setSelectedLeaveType(
      null,
    );

    setForm({
      ...emptyForm,
    });

    setErrors({});

    setMessage(null);

    setDialogOpen(true);
  };

  const openEditDialog = (
    leaveType,
  ) => {
    const attachmentRule =
      getAttachmentRule(
        leaveType,
      );

    setDialogMode('edit');

    setSelectedLeaveType(
      leaveType,
    );

    setForm({
      code:
        leaveType.code,

      name:
        leaveType.name,

      defaultDays:
        String(
          leaveType.defaultDays,
        ),

      minimumDays:
        String(
          leaveType.minimumDays,
        ),

      maximumDaysPerRequest:
        String(
          leaveType.maximumDaysPerRequest,
        ),

      attachmentRule,

      attachmentRequiredAfterDays:
        attachmentRule ===
        'threshold'
          ? String(
              leaveType.attachmentRequiredAfterDays,
            )
          : '',

      status:
        leaveType.status,

      description:
        leaveType.description,
    });

    setErrors({});

    setMessage(null);

    setDialogOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};

    const code =
      form.code
        .trim()
        .toUpperCase();

    const name =
      form.name.trim();

    const description =
      form.description.trim();

    const defaultDays =
      Number(
        form.defaultDays,
      );

    const minimumDays =
      Number(
        form.minimumDays,
      );

    const maximumDays =
      Number(
        form.maximumDaysPerRequest,
      );

    const attachmentDays =
      Number(
        form.attachmentRequiredAfterDays,
      );

    if (
      !/^[A-Z0-9_-]{2,10}$/.test(
        code,
      )
    ) {
      nextErrors.code =
        'Use 2–10 uppercase letters, numbers, _ or -.';
    }

    if (
      name.length < 3 ||
      name.length > 100
    ) {
      nextErrors.name =
        'Name must contain 3–100 characters.';
    }

    const duplicateCode =
      leaveTypes.some(
        (item) =>
          Number(item.id) !==
            Number(
              selectedLeaveType
                ?.id,
            ) &&
          item.code === code,
      );

    const duplicateName =
      leaveTypes.some(
        (item) =>
          Number(item.id) !==
            Number(
              selectedLeaveType
                ?.id,
            ) &&
          item.name.toLowerCase() ===
            name.toLowerCase(),
      );

    if (duplicateCode) {
      nextErrors.code =
        'This code already exists.';
    }

    if (duplicateName) {
      nextErrors.name =
        'This name already exists.';
    }

    if (
      form.defaultDays === '' ||
      !Number.isFinite(
        defaultDays,
      ) ||
      defaultDays < 0 ||
      defaultDays > 365
    ) {
      nextErrors.defaultDays =
        'Enter a value from 0 to 365.';
    }

    if (
      form.minimumDays === '' ||
      !Number.isFinite(
        minimumDays,
      ) ||
      minimumDays < 0.5 ||
      minimumDays > 365
    ) {
      nextErrors.minimumDays =
        'Enter a value from 0.5 to 365.';
    }

    if (
      form.maximumDaysPerRequest ===
        '' ||
      !Number.isFinite(
        maximumDays,
      ) ||
      maximumDays <
        minimumDays ||
      maximumDays > 365
    ) {
      nextErrors.maximumDaysPerRequest =
        'Maximum must be at least Minimum and no more than 365.';
    }

    if (
      form.attachmentRule ===
        'threshold' &&
      (
        form.attachmentRequiredAfterDays ===
          '' ||
        !Number.isFinite(
          attachmentDays,
        ) ||
        attachmentDays < 1 ||
        attachmentDays >
          maximumDays
      )
    ) {
      nextErrors.attachmentRequiredAfterDays =
        'Enter 1 day or more, not exceeding Maximum Days.';
    }

    if (
      description.length < 5 ||
      description.length > 300
    ) {
      nextErrors.description =
        'Description must contain 5–300 characters.';
    }

    setErrors(
      nextErrors,
    );

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const synchronizeEntitlementName = (
    leaveType,
  ) => {
    const entitlements =
      getLeaveEntitlements();

    saveLeaveEntitlements(
      entitlements.map(
        (item) =>
          Number(
            item.leaveTypeId,
          ) ===
          Number(
            leaveType.id,
          )
            ? {
                ...item,

                leaveType:
                  leaveType.name,

                updatedAt:
                  new Date()
                    .toISOString(),
              }
            : item,
      ),
    );
  };

  const saveForm = () => {
    if (!validateForm()) {
      return;
    }

    const savedLeaveType =
      saveLeaveType({
        id:
          dialogMode ===
          'edit'
            ? selectedLeaveType
                ?.id
            : null,

        code:
          form.code,

        name:
          form.name,

        defaultDays:
          Number(
            form.defaultDays,
          ),

        minimumDays:
          Number(
            form.minimumDays,
          ),

        maximumDaysPerRequest:
          Number(
            form.maximumDaysPerRequest,
          ),

        attachmentRequired:
          form.attachmentRule ===
          'always',

        attachmentRequiredAfterDays:
          form.attachmentRule ===
          'threshold'
            ? Number(
                form.attachmentRequiredAfterDays,
              )
            : null,

        status:
          form.status,

        description:
          form.description,
      });

    if (!savedLeaveType) {
      setErrors({
        form:
          'Could not save. Check for a duplicate code or name.',
      });

      return;
    }

    synchronizeEntitlementName(
      savedLeaveType,
    );

    createLeaveTypeAuditLog({
      action:
        dialogMode === 'edit'
          ? 'update_leave_type'
          : 'create_leave_type',

      leaveType:
        savedLeaveType,

      detail:
        `${
          dialogMode === 'edit'
            ? 'Updated'
            : 'Created'
        } ${savedLeaveType.code} - ${savedLeaveType.name}. Status: ${savedLeaveType.status}.`,
    });

    setMessage({
      severity:
        'success',

      text:
        `${savedLeaveType.name} was ${
          dialogMode === 'edit'
            ? 'updated'
            : 'added'
        } successfully.`,
    });

    closeDialog();

    loadData();
  };

  const toggleStatus = (
    leaveType,
  ) => {
    const nextStatus =
      leaveType.status ===
      'Active'
        ? 'Inactive'
        : 'Active';

    const updatedLeaveType =
      setLeaveTypeStatus(
        leaveType.id,
        nextStatus,
      );

    if (!updatedLeaveType) {
      setMessage({
        severity:
          'error',

        text:
          'Could not update the leave type status.',
      });

      return;
    }

    createLeaveTypeAuditLog({
      action:
        nextStatus ===
        'Active'
          ? 'activate_leave_type'
          : 'deactivate_leave_type',

      leaveType:
        updatedLeaveType,

      detail:
        `Changed ${updatedLeaveType.code} - ${updatedLeaveType.name} to ${nextStatus}.`,
    });

    setMessage({
      severity:
        'success',

      text:
        `${updatedLeaveType.name} was changed to ${nextStatus}.`,
    });

    loadData();
  };

  const summaryCards = [
    {
      title:
        'Total Leave Types',

      value:
        summary.total,

      color:
        '#2563EB',
    },
    {
      title:
        'Active Leave Types',

      value:
        summary.active,

      color:
        '#059669',
    },
    {
      title:
        'Inactive Leave Types',

      value:
        summary.inactive,

      color:
        '#DC2626',
    },
    {
      title:
        'Attachment Rules',

      value:
        summary.attachment,

      color:
        '#7C3AED',
    },
  ];

  return (
    <HRLayout
      activeMenu="Leave Type"
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
            Leave Type Management
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
            Manage leave types, request limits and
            supporting-document rules.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={
            openAddDialog
          }
          sx={{
            minWidth:
              '160px',

            height:
              '44px',

            backgroundColor:
              '#059669',

            borderRadius:
              '8px',

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
          Add Leave Type
        </Button>
      </Box>

      {message && (
        <Alert
          severity={
            message.severity
          }
          onClose={() =>
            setMessage(null)
          }
          sx={{
            marginBottom:
              '24px',

            borderRadius:
              '8px',
          }}
        >
          {message.text}
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
        {summaryCards.map(
          (card) => (
            <Paper
              key={
                card.title
              }
              elevation={0}
              sx={{
                padding:
                  '20px',

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
            padding:
              '24px',

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
            Leave Type List
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
            Showing {filteredLeaveTypes.length} of{' '}
            {leaveTypes.length} leave types
          </Typography>

          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'minmax(280px, 2fr) minmax(180px, 1fr) auto',
              },

              gap:
                '16px',

              marginTop:
                '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Leave Type"
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
              sx={
                fieldSx
              }
            />

            <FormControl
              fullWidth
            >
              <InputLabel id="leave-type-status-filter">
                Status
              </InputLabel>

              <Select
                labelId="leave-type-status-filter"
                value={
                  statusFilter
                }
                label="Status"
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
                    '56px',

                  borderRadius:
                    '8px',
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
              variant="outlined"
              onClick={() => {
                setSearchText('');

                setStatusFilter(
                  'All',
                );
              }}
              sx={{
                minWidth:
                  '110px',

                borderColor:
                  '#D1D5DB',

                color:
                  '#374151',

                borderRadius:
                  '8px',

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

        <TableContainer>
          <Table
            sx={{
              minWidth:
                1250,
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
                  'Code',
                  'Leave Type',
                  'Default',
                  'Minimum',
                  'Maximum',
                  'Attachment',
                  'Requests',
                  'Status',
                  'Action',
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
                          '#6B7280',

                        fontSize:
                          '12px',

                        fontWeight:
                          700,

                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {heading}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredLeaveTypes.map(
                (
                  leaveType,
                ) => (
                  <TableRow
                    key={
                      leaveType.id
                    }
                    hover
                  >
                    <TableCell
                      sx={{
                        color:
                          '#059669',

                        fontWeight:
                          800,
                      }}
                    >
                      {leaveType.code}
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth:
                          270,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#111827',

                          fontSize:
                            '14px',

                          fontWeight:
                            700,
                        }}
                      >
                        {leaveType.name}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#6B7280',

                          fontSize:
                            '12px',

                          marginTop:
                            '4px',
                        }}
                      >
                        {leaveType.description}
                      </Typography>
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      {formatDays(
                        leaveType.defaultDays,
                      )}
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      {formatDays(
                        leaveType.minimumDays,
                      )}
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      {formatDays(
                        leaveType.maximumDaysPerRequest,
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getAttachmentLabel(
                          leaveType,
                        )}
                        size="small"
                        sx={{
                          backgroundColor:
                            getAttachmentRule(
                              leaveType,
                            ) ===
                            'none'
                              ? '#F3F4F6'
                              : '#F5F3FF',

                          color:
                            getAttachmentRule(
                              leaveType,
                            ) ===
                            'none'
                              ? '#6B7280'
                              : '#7C3AED',

                          fontWeight:
                            700,
                        }}
                      />
                    </TableCell>

                    <TableCell
                      align="center"
                    >
                      {requestUsage[
                        leaveType.id
                      ] || 0}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          leaveType.status
                        }
                        size="small"
                        sx={{
                          backgroundColor:
                            leaveType.status ===
                            'Active'
                              ? '#DCFCE7'
                              : '#FEE2E2',

                          color:
                            leaveType.status ===
                            'Active'
                              ? '#15803D'
                              : '#B91C1C',

                          fontWeight:
                            700,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Box
                        sx={{
                          display:
                            'flex',

                          gap:
                            '14px',
                        }}
                      >
                        <Button
                          onClick={() =>
                            openEditDialog(
                              leaveType,
                            )
                          }
                          sx={{
                            ...actionButtonSx,

                            color:
                              '#059669',
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          onClick={() =>
                            toggleStatus(
                              leaveType,
                            )
                          }
                          sx={{
                            ...actionButtonSx,

                            color:
                              leaveType.status ===
                              'Active'
                                ? '#DC2626'
                                : '#2563EB',
                          }}
                        >
                          {leaveType.status ===
                          'Active'
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ),
              )}

              {filteredLeaveTypes.length ===
                0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{
                      padding:
                        '48px',

                      color:
                        '#6B7280',
                    }}
                  >
                    No leave types found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={
          dialogOpen
        }
        onClose={
          closeDialog
        }
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius:
              '14px',
          },
        }}
      >
        <DialogTitle
          sx={{
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
            'edit'
              ? 'Edit Leave Type'
              : 'Add Leave Type'}
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            paddingTop:
              '24px !important',
          }}
        >
          {errors.form && (
            <Alert
              severity="error"
              sx={{
                marginBottom:
                  '20px',
              }}
            >
              {errors.form}
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
            <TextField
              required
              label="Leave Type Code"
              value={
                form.code
              }
              onChange={(
                event,
              ) =>
                updateForm(
                  'code',

                  event.target
                    .value
                    .toUpperCase()
                    .slice(
                      0,
                      10,
                    ),
                )
              }
              error={
                Boolean(
                  errors.code,
                )
              }
              helperText={
                errors.code
              }
              sx={
                fieldSx
              }
            />

            <TextField
              required
              label="Leave Type Name"
              value={
                form.name
              }
              onChange={(
                event,
              ) =>
                updateForm(
                  'name',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.name,
                )
              }
              helperText={
                errors.name
              }
              sx={
                fieldSx
              }
            />

            <TextField
              required
              type="number"
              label="Default Entitlement Days"
              value={
                form.defaultDays
              }
              onChange={(
                event,
              ) =>
                updateForm(
                  'defaultDays',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.defaultDays,
                )
              }
              helperText={
                errors.defaultDays ||
                'Used as a reference when assigning new entitlement'
              }
              inputProps={{
                min: 0,
                max: 365,
                step: 0.5,
              }}
              sx={
                fieldSx
              }
            />

            <FormControl
              fullWidth
            >
              <InputLabel id="leave-type-form-status">
                Status
              </InputLabel>

              <Select
                labelId="leave-type-form-status"
                value={
                  form.status
                }
                label="Status"
                onChange={(
                  event,
                ) =>
                  updateForm(
                    'status',

                    event.target
                      .value,
                  )
                }
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
                <MenuItem value="Active">
                  Active
                </MenuItem>

                <MenuItem value="Inactive">
                  Inactive
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              required
              type="number"
              label="Minimum Days per Request"
              value={
                form.minimumDays
              }
              onChange={(
                event,
              ) =>
                updateForm(
                  'minimumDays',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.minimumDays,
                )
              }
              helperText={
                errors.minimumDays
              }
              inputProps={{
                min: 0.5,
                max: 365,
                step: 0.5,
              }}
              sx={
                fieldSx
              }
            />

            <TextField
              required
              type="number"
              label="Maximum Days per Request"
              value={
                form.maximumDaysPerRequest
              }
              onChange={(
                event,
              ) =>
                updateForm(
                  'maximumDaysPerRequest',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.maximumDaysPerRequest,
                )
              }
              helperText={
                errors.maximumDaysPerRequest
              }
              inputProps={{
                min: 0.5,
                max: 365,
                step: 0.5,
              }}
              sx={
                fieldSx
              }
            />

            <FormControl
              fullWidth
            >
              <InputLabel id="attachment-rule-label">
                Attachment Rule
              </InputLabel>

              <Select
                labelId="attachment-rule-label"
                value={
                  form.attachmentRule
                }
                label="Attachment Rule"
                onChange={(
                  event,
                ) => {
                  updateForm(
                    'attachmentRule',

                    event.target
                      .value,
                  );

                  if (
                    event.target
                      .value !==
                    'threshold'
                  ) {
                    updateForm(
                      'attachmentRequiredAfterDays',

                      '',
                    );
                  }
                }}
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
                <MenuItem value="none">
                  Not Required
                </MenuItem>

                <MenuItem value="always">
                  Always Required
                </MenuItem>

                <MenuItem value="threshold">
                  Required From Selected Days
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              required={
                form.attachmentRule ===
                'threshold'
              }
              disabled={
                form.attachmentRule !==
                'threshold'
              }
              type="number"
              label="Attachment Required From"
              value={
                form.attachmentRequiredAfterDays
              }
              onChange={(
                event,
              ) =>
                updateForm(
                  'attachmentRequiredAfterDays',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.attachmentRequiredAfterDays,
                )
              }
              helperText={
                errors.attachmentRequiredAfterDays ||
                'Example: 3 means 3 working days or more'
              }
              inputProps={{
                min: 1,
                max: 365,
                step: 0.5,
              }}
              sx={
                fieldSx
              }
            />

            <TextField
              required
              multiline
              minRows={4}
              label="Description"
              value={
                form.description
              }
              onChange={(
                event,
              ) =>
                updateForm(
                  'description',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.description,
                )
              }
              helperText={
                errors.description ||
                `${form.description.length}/300 characters`
              }
              inputProps={{
                maxLength:
                  300,
              }}
              sx={{
                ...fieldSx,

                gridColumn: {
                  xs:
                    'auto',

                  sm:
                    '1 / -1',
                },
              }}
            />
          </Box>

          {dialogMode ===
            'add' && (
            <Alert
              severity="info"
              sx={{
                marginTop:
                  '20px',
              }}
            >
              Adding a type does not automatically grant
              days. Assign it later in Leave Entitlement
              Management.
            </Alert>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 24px',

            borderTop:
              '1px solid #E5E7EB',
          }}
        >
          <Button
            variant="outlined"
            onClick={
              closeDialog
            }
            sx={{
              borderColor:
                '#D1D5DB',

              color:
                '#374151',

              borderRadius:
                '8px',

              fontWeight:
                700,

              textTransform:
                'none',
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveForm
            }
            sx={{
              backgroundColor:
                '#059669',

              borderRadius:
                '8px',

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
            {dialogMode ===
            'edit'
              ? 'Save Changes'
              : 'Save Leave Type'}
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default LeaveTypeManagementPage;