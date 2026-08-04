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
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import HRLayout from '../../layouts/hrlayout.jsx';

import {
  getHolidays,
  holidayStorageKey,
  saveHolidays,
} from '../../utils/holidaystorage.js';

import {
  createAuditLog,
} from '../../utils/auditlogstorage.js';

const createInitialHolidayForm = () => ({
  name: '',
  date: '',
  type: 'Public Holiday',
  description: '',
  status: 'Active',
});

const normalizeStatus = (holiday) => {
  if (
    typeof holiday?.isActive ===
    'boolean'
  ) {
    return holiday.isActive
      ? 'Active'
      : 'Inactive';
  }

  if (
    typeof holiday?.is_active ===
    'boolean'
  ) {
    return holiday.is_active
      ? 'Active'
      : 'Inactive';
  }

  const status = String(
    holiday?.status || '',
  )
    .trim()
    .toLowerCase();

  if (status === 'inactive') {
    return 'Inactive';
  }

  return 'Active';
};

const normalizeHoliday = (
  holiday,
  index,
) => {
  const id =
    Number(
      holiday?.id ??
        holiday?.holidayId ??
        holiday?.holiday_id,
    ) ||
    index + 1;

  const name =
    holiday?.name ||
    holiday?.holidayName ||
    holiday?.holiday_name ||
    'Organization Holiday';

  const date =
    holiday?.date ||
    holiday?.holidayDate ||
    holiday?.holiday_date ||
    '';

  const type =
    holiday?.type ||
    holiday?.holidayType ||
    holiday?.holiday_type ||
    'Public Holiday';

  const description =
    holiday?.description ||
    holiday?.detail ||
    `${name} holiday.`;

  const status =
    normalizeStatus(holiday);

  return {
    ...holiday,

    id,
    name,
    date,
    type,
    description,
    status,

    isActive:
      status === 'Active',

    createdAt:
      holiday?.createdAt ||
      holiday?.created_at ||
      null,

    updatedAt:
      holiday?.updatedAt ||
      holiday?.updated_at ||
      null,
  };
};

const normalizeHolidays = (
  holidays,
) =>
  Array.isArray(holidays)
    ? holidays
        .map(normalizeHoliday)
        .filter(
          (holiday) =>
            Boolean(holiday.date),
        )
        .sort(
          (
            firstHoliday,
            secondHoliday,
          ) =>
            firstHoliday.date.localeCompare(
              secondHoliday.date,
            ),
        )
    : [];

const createStorageHoliday = (
  holiday,
) => {
  const now =
    new Date().toISOString();

  const year =
    Number(
      String(
        holiday.date || '',
      ).slice(0, 4),
    ) || null;

  const isActive =
    holiday.status === 'Active';

  return {
    ...holiday,

    id:
      Number(holiday.id) ||
      null,

    holidayId:
      Number(holiday.id) ||
      null,

    holiday_id:
      Number(holiday.id) ||
      null,

    name:
      holiday.name,

    holidayName:
      holiday.name,

    holiday_name:
      holiday.name,

    date:
      holiday.date,

    holidayDate:
      holiday.date,

    holiday_date:
      holiday.date,

    year,

    type:
      holiday.type,

    holidayType:
      holiday.type,

    holiday_type:
      holiday.type,

    description:
      holiday.description,

    status:
      holiday.status,

    isActive,

    is_active:
      isActive,

    createdAt:
      holiday.createdAt ||
      now,

    created_at:
      holiday.createdAt ||
      now,

    updatedAt:
      now,

    updated_at:
      now,
  };
};

const formatHolidayDate = (
  dateString,
) => {
  if (!dateString) {
    return '-';
  }

  const date =
    new Date(
      `${dateString}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  return date.toLocaleDateString(
    'en-GB',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
};

const getDayName = (
  dateString,
) => {
  if (!dateString) {
    return '-';
  }

  const date =
    new Date(
      `${dateString}T00:00:00`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '-';
  }

  return date.toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
    },
  );
};

const createHolidayAuditLog = ({
  action,
  holiday,
  detail,
}) =>
  createAuditLog({
    userId: 3,

    username: 'hr001',

    role: 'hr',

    action,

    tableName: 'holidays',

    recordId:
      holiday?.id || null,

    detail,

    ipAddress: '127.0.0.1',
  });

function HolidayManagementPage() {
  const currentYear =
    String(
      new Date().getFullYear(),
    );

  const [
    holidays,
    setHolidays,
  ] = useState([]);

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    yearFilter,
    setYearFilter,
  ] = useState(currentYear);

  const [
    typeFilter,
    setTypeFilter,
  ] = useState('All');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('All');

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    dialogMode,
    setDialogMode,
  ] = useState('add');

  const [
    selectedHolidayId,
    setSelectedHolidayId,
  ] = useState(null);

  const [
    holidayForm,
    setHolidayForm,
  ] = useState(
    createInitialHolidayForm,
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    actionMessage,
    setActionMessage,
  ] = useState(null);

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    selectedDeleteHoliday,
    setSelectedDeleteHoliday,
  ] = useState(null);

  const loadHolidayData =
    useCallback(() => {
      const storedHolidays =
        normalizeHolidays(
          getHolidays(),
        );

      setHolidays(
        storedHolidays,
      );
    }, []);

  useEffect(() => {
    loadHolidayData();

    const handleStorageChange = (
      event,
    ) => {
      if (
        !event.key ||
        event.key ===
          holidayStorageKey
      ) {
        loadHolidayData();
      }
    };

    window.addEventListener(
      'storage',
      handleStorageChange,
    );

    window.addEventListener(
      'focus',
      loadHolidayData,
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorageChange,
      );

      window.removeEventListener(
        'focus',
        loadHolidayData,
      );
    };
  }, [loadHolidayData]);

  const persistHolidays =
    useCallback(
      (nextHolidays) => {
        saveHolidays(
          nextHolidays.map(
            createStorageHoliday,
          ),
        );

        loadHolidayData();
      },
      [loadHolidayData],
    );

  const availableYears =
    useMemo(() => {
      const storedYears =
        holidays
          .map((holiday) =>
            String(
              holiday.date || '',
            ).slice(0, 4),
          )
          .filter(Boolean);

      return [
        ...new Set([
          currentYear,
          ...storedYears,
        ]),
      ].sort(
        (
          firstYear,
          secondYear,
        ) =>
          Number(secondYear) -
          Number(firstYear),
      );
    }, [
      currentYear,
      holidays,
    ]);

  useEffect(() => {
    if (
      yearFilter !== 'All' &&
      availableYears.length > 0 &&
      !availableYears.includes(
        yearFilter,
      )
    ) {
      setYearFilter(
        availableYears[0],
      );
    }
  }, [
    availableYears,
    yearFilter,
  ]);

  const filteredHolidays =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return holidays.filter(
        (holiday) => {
          const matchesSearch =
            !keyword ||
            holiday.name
              .toLowerCase()
              .includes(keyword) ||
            holiday.description
              .toLowerCase()
              .includes(keyword);

          const matchesYear =
            yearFilter === 'All' ||
            holiday.date.startsWith(
              yearFilter,
            );

          const matchesType =
            typeFilter === 'All' ||
            holiday.type ===
              typeFilter;

          const matchesStatus =
            statusFilter === 'All' ||
            holiday.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesYear &&
            matchesType &&
            matchesStatus
          );
        },
      );
    }, [
      holidays,
      searchText,
      statusFilter,
      typeFilter,
      yearFilter,
    ]);

  const summary =
    useMemo(() => {
      const now =
        new Date();

      now.setHours(
        0,
        0,
        0,
        0,
      );

      return holidays.reduce(
        (
          result,
          holiday,
        ) => {
          const holidayDate =
            new Date(
              `${holiday.date}T00:00:00`,
            );

          const isActive =
            holiday.status ===
            'Active';

          return {
            active:
              result.active +
              (isActive ? 1 : 0),

            upcoming:
              result.upcoming +
              (isActive &&
              !Number.isNaN(
                holidayDate.getTime(),
              ) &&
              holidayDate >= now
                ? 1
                : 0),

            public:
              result.public +
              (isActive &&
              holiday.type ===
                'Public Holiday'
                ? 1
                : 0),

            company:
              result.company +
              (isActive &&
              holiday.type ===
                'Company Holiday'
                ? 1
                : 0),
          };
        },
        {
          active: 0,
          upcoming: 0,
          public: 0,
          company: 0,
        },
      );
    }, [holidays]);

  const handleClearFilters =
    () => {
      setSearchText('');

      setYearFilter(
        currentYear,
      );

      setTypeFilter('All');

      setStatusFilter('All');

      setActionMessage(null);
    };

  const handleOpenAddDialog =
    () => {
      setDialogMode('add');

      setSelectedHolidayId(
        null,
      );

      setHolidayForm(
        createInitialHolidayForm(),
      );

      setErrors({});

      setActionMessage(null);

      setDialogOpen(true);
    };

  const handleOpenEditDialog =
    (holiday) => {
      setDialogMode('edit');

      setSelectedHolidayId(
        holiday.id,
      );

      setHolidayForm({
        name:
          holiday.name,

        date:
          holiday.date,

        type:
          holiday.type,

        description:
          holiday.description,

        status:
          holiday.status,
      });

      setErrors({});

      setActionMessage(null);

      setDialogOpen(true);
    };

  const handleCloseDialog =
    () => {
      setDialogOpen(false);

      setDialogMode('add');

      setSelectedHolidayId(
        null,
      );

      setHolidayForm(
        createInitialHolidayForm(),
      );

      setErrors({});
    };

  const handleFormChange = (
    fieldName,
    value,
  ) => {
    setHolidayForm(
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
      }),
    );
  };

  const validateHolidayForm =
    () => {
      const validationErrors =
        {};

      const holidayName =
        holidayForm.name.trim();

      const description =
        holidayForm.description.trim();

      if (!holidayName) {
        validationErrors.name =
          'Please enter the holiday name.';
      }

      if (!holidayForm.date) {
        validationErrors.date =
          'Please select the holiday date.';
      } else {
        const duplicateHoliday =
          holidays.some(
            (holiday) =>
              holiday.date ===
                holidayForm.date &&
              Number(holiday.id) !==
                Number(
                  selectedHolidayId,
                ),
          );

        if (duplicateHoliday) {
          validationErrors.date =
            'A holiday already exists on this date.';
        }
      }

      if (!holidayForm.type) {
        validationErrors.type =
          'Please select the holiday type.';
      }

      if (!description) {
        validationErrors.description =
          'Please enter the holiday description.';
      } else if (
        description.length < 5
      ) {
        validationErrors.description =
          'Description must contain at least 5 characters.';
      }

      if (!holidayForm.status) {
        validationErrors.status =
          'Please select the holiday status.';
      }

      setErrors(
        validationErrors,
      );

      return (
        Object.keys(
          validationErrors,
        ).length === 0
      );
    };

  const handleSaveHoliday =
    () => {
      if (
        !validateHolidayForm()
      ) {
        return;
      }

      const now =
        new Date().toISOString();

      const preparedHoliday = {
        id:
          dialogMode === 'edit'
            ? selectedHolidayId
            : Math.max(
                0,
                ...holidays.map(
                  (holiday) =>
                    Number(
                      holiday.id,
                    ) || 0,
                ),
              ) + 1,

        name:
          holidayForm.name.trim(),

        date:
          holidayForm.date,

        type:
          holidayForm.type,

        description:
          holidayForm.description.trim(),

        status:
          holidayForm.status,

        isActive:
          holidayForm.status ===
          'Active',

        createdAt:
          dialogMode === 'edit'
            ? holidays.find(
                (holiday) =>
                  Number(
                    holiday.id,
                  ) ===
                  Number(
                    selectedHolidayId,
                  ),
              )?.createdAt ||
              now
            : now,

        updatedAt: now,
      };

      const nextHolidays =
        dialogMode === 'edit'
          ? holidays.map(
              (holiday) =>
                Number(
                  holiday.id,
                ) ===
                Number(
                  selectedHolidayId,
                )
                  ? {
                      ...holiday,
                      ...preparedHoliday,
                    }
                  : holiday,
            )
          : [
              ...holidays,
              preparedHoliday,
            ];

      persistHolidays(
        nextHolidays,
      );

      createHolidayAuditLog({
        action:
          dialogMode === 'edit'
            ? 'update_holiday'
            : 'create_holiday',

        holiday:
          preparedHoliday,

        detail:
          `${
            dialogMode === 'edit'
              ? 'Updated'
              : 'Created'
          } holiday "${preparedHoliday.name}" on ${preparedHoliday.date}. Status: ${preparedHoliday.status}.`,
      });

      setActionMessage({
        severity: 'success',

        text:
          `${preparedHoliday.name} was ${
            dialogMode === 'edit'
              ? 'updated'
              : 'added'
          } successfully.`,
      });

      setYearFilter(
        preparedHoliday.date.slice(
          0,
          4,
        ),
      );

      handleCloseDialog();

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

  const handleToggleStatus = (
    selectedHoliday,
  ) => {
    const nextStatus =
      selectedHoliday.status ===
      'Active'
        ? 'Inactive'
        : 'Active';

    const updatedHoliday = {
      ...selectedHoliday,

      status:
        nextStatus,

      isActive:
        nextStatus === 'Active',

      updatedAt:
        new Date().toISOString(),
    };

    const nextHolidays =
      holidays.map(
        (holiday) =>
          Number(holiday.id) ===
          Number(
            selectedHoliday.id,
          )
            ? updatedHoliday
            : holiday,
      );

    persistHolidays(
      nextHolidays,
    );

    createHolidayAuditLog({
      action:
        nextStatus === 'Active'
          ? 'activate_holiday'
          : 'deactivate_holiday',

      holiday:
        updatedHoliday,

      detail:
        `Changed holiday "${updatedHoliday.name}" on ${updatedHoliday.date} to ${nextStatus}.`,
    });

    setActionMessage({
      severity: 'success',

      text:
        `${updatedHoliday.name} was changed to ${nextStatus}.`,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleOpenDeleteDialog =
    (holiday) => {
      setSelectedDeleteHoliday(
        holiday,
      );

      setDeleteDialogOpen(
        true,
      );

      setActionMessage(null);
    };

  const handleCloseDeleteDialog =
    () => {
      setDeleteDialogOpen(
        false,
      );

      setSelectedDeleteHoliday(
        null,
      );
    };

  const handleConfirmDelete =
    () => {
      if (
        !selectedDeleteHoliday
      ) {
        return;
      }

      const nextHolidays =
        holidays.filter(
          (holiday) =>
            Number(holiday.id) !==
            Number(
              selectedDeleteHoliday.id,
            ),
        );

      persistHolidays(
        nextHolidays,
      );

      createHolidayAuditLog({
        action:
          'delete_holiday',

        holiday:
          selectedDeleteHoliday,

        detail:
          `Deleted holiday "${selectedDeleteHoliday.name}" on ${selectedDeleteHoliday.date}.`,
      });

      setActionMessage({
        severity: 'success',

        text:
          `${selectedDeleteHoliday.name} was deleted successfully.`,
      });

      handleCloseDeleteDialog();

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

  const summaryCards = [
    {
      title: 'Active Holidays',
      value: summary.active,
      color: '#059669',
    },
    {
      title: 'Upcoming Holidays',
      value: summary.upcoming,
      color: '#2563EB',
    },
    {
      title: 'Public Holidays',
      value: summary.public,
      color: '#7C3AED',
    },
    {
      title: 'Company Holidays',
      value: summary.company,
      color: '#B45309',
    },
  ];

  return (
    <HRLayout
      activeMenu="Holiday Management"
    >
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
            Holiday Management
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '15px',

              marginTop: '6px',
            }}
          >
            Manage holidays used when calculating leave
            working days.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleOpenAddDialog
          }
          sx={{
            minWidth: '150px',

            height: '44px',

            padding: '0 20px',

            backgroundColor:
              '#059669',

            color: '#FFFFFF',

            borderRadius: '8px',

            fontSize: '14px',

            fontWeight: 700,

            textTransform: 'none',

            boxShadow: 'none',

            '&:hover': {
              backgroundColor:
                '#047857',

              boxShadow: 'none',
            },
          }}
        >
          Add Holiday
        </Button>
      </Box>

      {actionMessage && (
        <Alert
          severity={
            actionMessage.severity
          }
          onClose={() =>
            setActionMessage(null)
          }
          sx={{
            marginBottom: '24px',

            borderRadius: '8px',
          }}
        >
          {actionMessage.text}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',

          gridTemplateColumns: {
            xs: '1fr',

            sm:
              'repeat(2, minmax(0, 1fr))',

            xl:
              'repeat(4, minmax(0, 1fr))',
          },

          gap: '20px',

          marginBottom: '24px',
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
              <Typography
                sx={{
                  color: '#6B7280',

                  fontSize: '14px',

                  fontWeight: 600,
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color: card.color,

                  fontSize: '30px',

                  fontWeight: 800,

                  marginTop: '8px',
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
            Holiday List
          </Typography>

          <Typography
            sx={{
              color: '#6B7280',

              fontSize: '14px',

              marginTop: '4px',
            }}
          >
            Showing {filteredHolidays.length} of{' '}
            {holidays.length} holidays
          </Typography>

          <Box
            sx={{
              display: 'grid',

              gridTemplateColumns: {
                xs: '1fr',

                lg:
                  'minmax(240px, 2fr) repeat(3, minmax(150px, 1fr)) auto',
              },

              gap: '16px',

              marginTop: '22px',
            }}
          >
            <TextField
              fullWidth
              label="Search Holiday"
              placeholder="Holiday name or description"
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
                  },
              }}
            />

            <FormControl
              fullWidth
            >
              <InputLabel id="holiday-year-filter-label">
                Year
              </InputLabel>

              <Select
                labelId="holiday-year-filter-label"
                value={yearFilter}
                label="Year"
                onChange={(event) =>
                  setYearFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius:
                    '8px',
                }}
              >
                <MenuItem value="All">
                  All Years
                </MenuItem>

                {availableYears.map(
                  (year) => (
                    <MenuItem
                      key={year}
                      value={year}
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
              <InputLabel id="holiday-type-filter-label">
                Type
              </InputLabel>

              <Select
                labelId="holiday-type-filter-label"
                value={typeFilter}
                label="Type"
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

                  borderRadius:
                    '8px',
                }}
              >
                <MenuItem value="All">
                  All Types
                </MenuItem>

                <MenuItem value="Public Holiday">
                  Public Holiday
                </MenuItem>

                <MenuItem value="Company Holiday">
                  Company Holiday
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              fullWidth
            >
              <InputLabel id="holiday-status-filter-label">
                Status
              </InputLabel>

              <Select
                labelId="holiday-status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                sx={{
                  height: '48px',

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
              type="button"
              variant="outlined"
              onClick={
                handleClearFilters
              }
              sx={{
                minWidth: '110px',

                height: '48px',

                padding: '0 18px',

                color: '#374151',

                borderColor:
                  '#D1D5DB',

                borderRadius: '8px',

                fontSize: '14px',

                fontWeight: 700,

                textTransform: 'none',

                '&:hover': {
                  borderColor:
                    '#9CA3AF',

                  backgroundColor:
                    '#F9FAFB',
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        {filteredHolidays.length >
        0 ? (
          <Box
            sx={{
              overflowX: 'auto',
            }}
          >
            <Box
              component="table"
              sx={{
                width: '100%',

                minWidth: '1120px',

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
                    'Holiday',
                    'Date',
                    'Day',
                    'Type',
                    'Status',
                    'Action',
                  ].map(
                    (heading) => (
                      <Box
                        key={heading}
                        component="th"
                        sx={{
                          padding:
                            '14px 18px',

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
                {filteredHolidays.map(
                  (holiday) => (
                    <Box
                      key={holiday.id}
                      component="tr"
                      sx={{
                        '&:hover': {
                          backgroundColor:
                            '#F9FAFB',
                        },
                      }}
                    >
                      <Box
                        component="td"
                        sx={{
                          minWidth:
                            '300px',

                          padding:
                            '16px 18px',

                          borderBottom:
                            '1px solid #E5E7EB',
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
                          {holiday.name}
                        </Typography>

                        <Typography
                          sx={{
                            maxWidth:
                              '340px',

                            color:
                              '#6B7280',

                            fontSize:
                              '12px',

                            lineHeight:
                              1.6,

                            marginTop:
                              '4px',
                          }}
                        >
                          {holiday.description}
                        </Typography>
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding:
                            '16px 18px',

                          borderBottom:
                            '1px solid #E5E7EB',

                          color:
                            '#059669',

                          fontSize:
                            '13px',

                          fontWeight:
                            700,

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {formatHolidayDate(
                          holiday.date,
                        )}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding:
                            '16px 18px',

                          borderBottom:
                            '1px solid #E5E7EB',

                          color:
                            '#4B5563',

                          fontSize:
                            '13px',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {getDayName(
                          holiday.date,
                        )}
                      </Box>

                      <Box
                        component="td"
                        sx={{
                          padding:
                            '16px 18px',

                          borderBottom:
                            '1px solid #E5E7EB',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        <Chip
                          label={
                            holiday.type
                          }
                          size="small"
                          sx={{
                            minWidth:
                              '120px',

                            backgroundColor:
                              holiday.type ===
                              'Public Holiday'
                                ? '#F5F3FF'
                                : '#FEF3C7',

                            color:
                              holiday.type ===
                              'Public Holiday'
                                ? '#7C3AED'
                                : '#B45309',

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
                        sx={{
                          padding:
                            '16px 18px',

                          borderBottom:
                            '1px solid #E5E7EB',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        <Chip
                          label={
                            holiday.status
                          }
                          size="small"
                          sx={{
                            minWidth:
                              '78px',

                            backgroundColor:
                              holiday.status ===
                              'Active'
                                ? '#DCFCE7'
                                : '#FEE2E2',

                            color:
                              holiday.status ===
                              'Active'
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
                        sx={{
                          padding:
                            '16px 18px',

                          borderBottom:
                            '1px solid #E5E7EB',

                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        <Box
                          sx={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap: '14px',
                          }}
                        >
                          <Button
                            type="button"
                            onClick={() =>
                              handleOpenEditDialog(
                                holiday,
                              )
                            }
                            sx={{
                              minWidth: 0,

                              padding: 0,

                              color:
                                '#059669',

                              fontSize:
                                '13px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                holiday,
                              )
                            }
                            sx={{
                              minWidth: 0,

                              padding: 0,

                              color:
                                holiday.status ===
                                'Active'
                                  ? '#DC2626'
                                  : '#2563EB',

                              fontSize:
                                '13px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',
                            }}
                          >
                            {holiday.status ===
                            'Active'
                              ? 'Deactivate'
                              : 'Activate'}
                          </Button>

                          <Button
                            type="button"
                            onClick={() =>
                              handleOpenDeleteDialog(
                                holiday,
                              )
                            }
                            sx={{
                              minWidth: 0,

                              padding: 0,

                              color:
                                '#B91C1C',

                              fontSize:
                                '13px',

                              fontWeight:
                                700,

                              textTransform:
                                'none',
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
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
              minHeight: '300px',

              padding:
                '40px 24px',

              display: 'flex',

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
                width: '64px',

                height: '64px',

                backgroundColor:
                  '#ECFDF5',

                color: '#059669',

                borderRadius:
                  '50%',

                display: 'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

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
              No holidays found
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
          </Box>
        )}
      </Paper>

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

            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
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
            component="div"
            sx={{
              color: '#111827',

              fontSize: '20px',

              fontWeight: 800,
            }}
          >
            {dialogMode === 'edit'
              ? 'Edit Holiday'
              : 'Add Holiday'}
          </Typography>

          <Typography
            component="div"
            sx={{
              color: '#6B7280',

              fontSize: '14px',

              lineHeight: 1.6,

              marginTop: '6px',
            }}
          >
            Active holidays are excluded when calculating
            leave working days.
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            padding: {
              xs: '20px',
              sm: '24px',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',

              flexDirection:
                'column',

              gap: '20px',
            }}
          >
            <TextField
              fullWidth
              required
              label="Holiday Name"
              placeholder="Example: New Year’s Day"
              value={
                holidayForm.name
              }
              onChange={(event) =>
                handleFormChange(
                  'name',
                  event.target.value,
                )
              }
              error={
                Boolean(errors.name)
              }
              helperText={
                errors.name
              }
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
              type="date"
              label="Holiday Date"
              value={
                holidayForm.date
              }
              onChange={(event) =>
                handleFormChange(
                  'date',
                  event.target.value,
                )
              }
              error={
                Boolean(errors.date)
              }
              helperText={
                errors.date
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },
              }}
            />

            <FormControl
              fullWidth
              required
              error={
                Boolean(errors.type)
              }
            >
              <InputLabel id="holiday-form-type-label">
                Holiday Type
              </InputLabel>

              <Select
                labelId="holiday-form-type-label"
                value={
                  holidayForm.type
                }
                label="Holiday Type"
                onChange={(event) =>
                  handleFormChange(
                    'type',
                    event.target.value,
                  )
                }
                sx={{
                  borderRadius:
                    '8px',
                }}
              >
                <MenuItem value="Public Holiday">
                  Public Holiday
                </MenuItem>

                <MenuItem value="Company Holiday">
                  Company Holiday
                </MenuItem>
              </Select>

              {errors.type && (
                <FormHelperText>
                  {errors.type}
                </FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              required
              multiline
              minRows={4}
              label="Description"
              placeholder="Describe this holiday"
              value={
                holidayForm.description
              }
              onChange={(event) =>
                handleFormChange(
                  'description',
                  event.target.value,
                )
              }
              error={
                Boolean(
                  errors.description,
                )
              }
              helperText={
                errors.description ||
                `${holidayForm.description.length}/300 characters`
              }
              slotProps={{
                htmlInput: {
                  maxLength: 300,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '8px',
                  },

                '& .MuiFormHelperText-root':
                  {
                    textAlign:
                      errors.description
                        ? 'left'
                        : 'right',
                  },
              }}
            />

            <FormControl
              fullWidth
              required
              error={
                Boolean(
                  errors.status,
                )
              }
            >
              <InputLabel id="holiday-form-status-label">
                Status
              </InputLabel>

              <Select
                labelId="holiday-form-status-label"
                value={
                  holidayForm.status
                }
                label="Status"
                onChange={(event) =>
                  handleFormChange(
                    'status',
                    event.target.value,
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

              {errors.status && (
                <FormHelperText>
                  {errors.status}
                </FormHelperText>
              )}
            </FormControl>
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

            gap: '10px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={
              handleCloseDialog
            }
            sx={{
              minWidth: '100px',

              height: '42px',

              color: '#374151',

              borderColor:
                '#D1D5DB',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

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
              handleSaveHoliday
            }
            sx={{
              minWidth: '130px',

              height: '42px',

              backgroundColor:
                '#059669',

              color: '#FFFFFF',

              borderRadius: '8px',

              fontSize: '14px',

              fontWeight: 700,

              textTransform:
                'none',

              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  '#047857',

                boxShadow: 'none',
              },
            }}
          >
            {dialogMode === 'edit'
              ? 'Save Changes'
              : 'Save Holiday'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={
          handleCloseDeleteDialog
        }
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius:
              '14px',
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
          Delete Holiday
        </DialogTitle>

        <DialogContent
          sx={{
            paddingTop:
              '24px !important',
          }}
        >
          <Typography
            sx={{
              color: '#374151',

              fontSize: '14px',

              lineHeight: 1.7,
            }}
          >
            Delete{' '}
            <strong>
              {selectedDeleteHoliday?.name ||
                'this holiday'}
            </strong>
            ? This date will no longer be excluded from
            leave-day calculations.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 24px',

            borderTop:
              '1px solid #E5E7EB',

            gap: '10px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={
              handleCloseDeleteDialog
            }
            sx={{
              minWidth: '100px',

              height: '42px',

              color: '#374151',

              borderColor:
                '#D1D5DB',

              borderRadius: '8px',

              textTransform:
                'none',

              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={
              handleConfirmDelete
            }
            sx={{
              minWidth: '110px',

              height: '42px',

              backgroundColor:
                '#DC2626',

              color: '#FFFFFF',

              borderRadius: '8px',

              textTransform:
                'none',

              fontWeight: 700,

              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  '#B91C1C',

                boxShadow: 'none',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default HolidayManagementPage;