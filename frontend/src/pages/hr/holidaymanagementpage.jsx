import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputAdornment,
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
  CalendarMonthRounded,
} from '@mui/icons-material';

import HRLayout from '../../layouts/hrlayout.jsx';
import { DataListToolbar } from '../../components/shareduiprimitives.jsx';
import { InlineListSummary } from '../../components/sharedvisualfoundation.jsx';
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

const toBoolean = (value) => {
  if (
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (
    typeof value === 'number'
  ) {
    return value === 1;
  }

  const text = String(
    value ?? '',
  )
    .trim()
    .toLowerCase();

  if (
    [
      '1',
      'true',
      'active',
    ].includes(text)
  ) {
    return true;
  }

  if (
    [
      '0',
      'false',
      'inactive',
    ].includes(text)
  ) {
    return false;
  }

  return Boolean(value);
};

const normalizeDateValue = (
  value,
) => {
  const text = String(
    value || '',
  );

  const match =
    text.match(
      /^\d{4}-\d{2}-\d{2}/,
    );

  return match
    ? match[0]
    : '';
};

const normalizeHoliday = (
  holiday,
) => {
  const date =
    normalizeDateValue(
      holiday.date ||
        holiday.holidayDate ||
        holiday.holiday_date,
    );

  const activeValue =
    holiday.isActive ??
    holiday.is_active ??
    holiday.active ??
    holiday.status;

  return {
    id:
      holiday.id ??
      holiday.holidayId ??
      holiday.holiday_id,

    name:
      holiday.name ||
      holiday.holidayName ||
      holiday.holiday_name ||
      '-',

    date,

    year:
      Number(
        holiday.year ??
          holiday.holidayYear ??
          holiday.holiday_year ??
          date.slice(0, 4),
      ) || null,

    isActive:
      activeValue ===
      undefined
        ? true
        : toBoolean(
            activeValue,
          ),
  };
};

const formatDate = (
  dateValue,
) => {
  const date =
    normalizeDateValue(
      dateValue,
    );

  if (!date) {
    return '-';
  }

  const [
    year,
    month,
    day,
  ] = date.split('-');

  return `${day}/${month}/${year}`;
};

const getThaiDayName = (
  dateValue,
) => {
  const date =
    normalizeDateValue(
      dateValue,
    );

  if (!date) {
    return '-';
  }

  const parsedDate =
    new Date(
      `${date}T00:00:00`,
    );

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return '-';
  }

  const dayNames = [
    'วันอาทิตย์',
    'วันจันทร์',
    'วันอังคาร',
    'วันพุธ',
    'วันพฤหัสบดี',
    'วันศุกร์',
    'วันเสาร์',
  ];

  return dayNames[
    parsedDate.getDay()
  ];
};

const createEmptyForm = () => ({
  name: '',
  date: '',
  status: 'active',
});

/* =========================
   Thai Date Field
========================= */

function ThaiDateField({
  label,
  value,
  onChange,
  error = false,
  helperText = '',
}) {
  const nativeInputRef = useRef(null);
  const openPicker = () => {
    const input = nativeInputRef.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    if (typeof input.showPicker === 'function') input.showPicker();
    else input.click();
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      }}
      sx={{
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <TextField
        fullWidth
        label={label}
        value={
          value
            ? formatDate(value)
            : ''
        }
        placeholder="วว/ดด/ปปปป"
        error={error}
        helperText={helperText}
        slotProps={{
          input: {
            readOnly: true,

            endAdornment: (
              <InputAdornment position="end">
                <CalendarMonthRounded
                  sx={{
                    color:
                      '#64748B',

                    fontSize:
                      '20px',
                  }}
                />
              </InputAdornment>
            ),
          },

          inputLabel: {
            shrink: true,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root':
            {
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

      <input
        ref={nativeInputRef}
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        style={{
          position:
            'absolute',

          inset:
            0,

          width:
            '100%',

          height:
            helperText
              ? '56px'
              : '100%',

          opacity:
            0,

          pointerEvents:
            'none',
        }}
      />
    </Box>
  );
}

/* =========================
   Component
========================= */

function HolidayManagementPage() {
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

  const [
    actionMessage,
    setActionMessage,
  ] = useState('');

  const [
    searchText,
    setSearchText,
  ] = useState('');

  const [
    yearFilter,
    setYearFilter,
  ] = useState(
    String(currentYear),
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  /* =========================
     Add / Edit
  ========================= */

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    dialogMode,
    setDialogMode,
  ] = useState('add');

  const [
    selectedHoliday,
    setSelectedHoliday,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState(
    createEmptyForm(),
  );

  const [
    formErrors,
    setFormErrors,
  ] = useState({});

  const [
    saving,
    setSaving,
  ] = useState(false);

  /* =========================
     Delete
  ========================= */

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  /* =========================
     Load Holidays
  ========================= */

  const loadHolidays =
    async () => {
      setLoading(true);
      setError('');

      try {
        const response =
          await api.get(
            '/hr/holidays',
          );

        const data =
          response.data?.data;

        const holidayList =
          Array.isArray(
            data?.holidays,
          )
            ? data.holidays
            : Array.isArray(
                  data?.items,
                )
              ? data.items
              : Array.isArray(
                    data,
                  )
                ? data
                : [];

        setHolidays(
          holidayList
            .map(
              normalizeHoliday,
            )
            .filter(
              (holiday) =>
                holiday.id &&
                holiday.date,
            ),
        );
      } catch (
        loadError
      ) {
        setError(
          loadError.response
            ?.data?.message ||
            'ไม่สามารถโหลดข้อมูลวันหยุดได้',
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadHolidays();
  }, []);

  /* =========================
     Years
  ========================= */

  const availableYears =
    useMemo(() => {
      const years =
        holidays
          .map(
            (holiday) =>
              Number(
                holiday.year,
              ),
          )
          .filter(
            (year) =>
              Number.isInteger(
                year,
              ),
          );

      return [
        ...new Set([
          currentYear,
          ...years,
        ]),
      ].sort(
        (firstYear, secondYear) =>
          secondYear -
          firstYear,
      );
    }, [holidays]);

  /* =========================
     Filter
  ========================= */

  const filteredHolidays =
    useMemo(() => {
      const keyword =
        searchText
          .trim()
          .toLowerCase();

      return holidays
        .filter(
          (holiday) => {
            const matchesSearch =
              !keyword ||
              holiday.name
                .toLowerCase()
                .includes(
                  keyword,
                ) ||
              formatDate(
                holiday.date,
              )
                .toLowerCase()
                .includes(keyword) ||
              (holiday.isActive
                ? 'ใช้งานอยู่'
                : 'ไม่ใช้งาน')
                .includes(keyword);

            const matchesYear =
              yearFilter ===
                'all' ||
              String(
                holiday.year,
              ) ===
                String(
                  yearFilter,
                );

            const matchesStatus =
              statusFilter ===
                'all' ||
              (statusFilter ===
                'active' &&
                holiday.isActive) ||
              (statusFilter ===
                'inactive' &&
                !holiday.isActive);

            return (
              matchesSearch &&
              matchesYear &&
              matchesStatus
            );
          },
        )
        .sort(
          (
            firstHoliday,
            secondHoliday,
          ) =>
            firstHoliday.date.localeCompare(
              secondHoliday.date,
            ),
        );
    }, [
      holidays,
      searchText,
      yearFilter,
      statusFilter,
    ]);
  const paginatedHolidays = useMemo(() => filteredHolidays.slice(page * rowsPerPage, (page + 1) * rowsPerPage), [filteredHolidays, page]);
  useEffect(() => { setPage(0); }, [searchText, yearFilter, statusFilter]);

  /* =========================
     Summary
  ========================= */

  const summaryHolidays =
    useMemo(() => {
      if (
        yearFilter ===
        'all'
      ) {
        return holidays;
      }

      return holidays.filter(
        (holiday) =>
          String(
            holiday.year,
          ) ===
          String(
            yearFilter,
          ),
      );
    }, [
      holidays,
      yearFilter,
    ]);

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0,
  );

  const activeCount =
    summaryHolidays.filter(
      (holiday) =>
        holiday.isActive,
    ).length;

  const inactiveCount =
    summaryHolidays.filter(
      (holiday) =>
        !holiday.isActive,
    ).length;

  const upcomingCount =
    summaryHolidays.filter(
      (holiday) => {
        if (
          !holiday.isActive
        ) {
          return false;
        }

        const holidayDate =
          new Date(
            `${holiday.date}T00:00:00`,
          );

        return (
          !Number.isNaN(
            holidayDate.getTime(),
          ) &&
          holidayDate >= today
        );
      },
    ).length;

  const summaryCards = [
    {
      title:
        'วันหยุดทั้งหมด',

      value:
        summaryHolidays.length,

      backgroundColor:
        theme.soft,

      color:
        '#4F46E5',
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
        'วันหยุดที่เหลือในปี',

      value:
        upcomingCount,

      backgroundColor:
        '#DBEAFE',

      color:
        '#0891B2',
    },

    {
      title:
        'ไม่ใช้งาน',

      value:
        inactiveCount,

      backgroundColor:
        '#FEE2E2',

      color:
        '#BE123C',
    },
  ];

  /* =========================
     Filter Actions
  ========================= */

  const handleClearFilters =
    () => {
      setSearchText('');

      setYearFilter(
        String(
          currentYear,
        ),
      );

      setStatusFilter(
        'all',
      );
    };

  /* =========================
     Add Holiday
  ========================= */

  const handleOpenAdd =
    () => {
      setDialogMode('add');

      setSelectedHoliday(
        null,
      );

      setFormData(
        createEmptyForm(),
      );

      setFormErrors({});

      setDialogOpen(true);
    };

  /* =========================
     Edit Holiday
  ========================= */

  const handleOpenEdit =
    (holiday) => {
      setDialogMode('edit');

      setSelectedHoliday(
        holiday,
      );

      setFormData({
        name:
          holiday.name,

        date:
          holiday.date,

        status:
          holiday.isActive
            ? 'active'
            : 'inactive',
      });

      setFormErrors({});

      setDialogOpen(true);
    };

  const handleCloseDialog =
    () => {
      if (saving) {
        return;
      }

      setDialogOpen(false);

      setSelectedHoliday(
        null,
      );

      setFormData(
        createEmptyForm(),
      );

      setFormErrors({});
    };

  const handleFormChange = (
    field,
    value,
  ) => {
    setFormData(
      (
        previousForm,
      ) => ({
        ...previousForm,

        [field]:
          value,
      }),
    );

    setFormErrors(
      (
        previousErrors,
      ) => ({
        ...previousErrors,

        [field]:
          '',
      }),
    );
  };

  /* =========================
     Validate
  ========================= */

  const validateForm =
    () => {
      const errors = {};

      const name =
        formData.name.trim();

      if (!name) {
        errors.name =
          'กรุณากรอกชื่อวันหยุด';
      } else if (
        name.length > 100
      ) {
        errors.name =
          'ชื่อวันหยุดต้องไม่เกิน 100 ตัวอักษร';
      }

      if (
        !formData.date
      ) {
        errors.date =
          'กรุณาเลือกวันที่';
      } else {
        const duplicatedDate =
          holidays.some(
            (holiday) =>
              holiday.date ===
                formData.date &&
              Number(
                holiday.id,
              ) !==
                Number(
                  selectedHoliday
                    ?.id,
                ),
          );

        if (
          duplicatedDate
        ) {
          errors.date =
            'มีวันหยุดในวันที่นี้อยู่แล้ว';
        }
      }

      if (
        !formData.status
      ) {
        errors.status =
          'กรุณาเลือกสถานะ';
      }

      setFormErrors(
        errors,
      );

      return (
        Object.keys(
          errors,
        ).length === 0
      );
    };

  /* =========================
     Save
  ========================= */

  const confirmSave =
    async () => {
      if (
        !validateForm()
      ) {
        return;
      }

      setSaving(true);
      setError('');
      setActionMessage('');

      try {
        const payload = {
          name:
            formData.name.trim(),

          date:
            formData.date,

          type:
            selectedHoliday?.type ||
            'Public Holiday',

          description:
            selectedHoliday?.description ||
            '',

          status:
            formData.status,
        };

        if (
          dialogMode ===
            'edit' &&
          selectedHoliday
            ?.id
        ) {
          await api.put(
            `/hr/holidays/${selectedHoliday.id}`,
            payload,
          );

          setActionMessage(
            'แก้ไขวันหยุดเรียบร้อยแล้ว',
          );
        } else {
          await api.post(
            '/hr/holidays',
            payload,
          );

          setActionMessage(
            'เพิ่มวันหยุดเรียบร้อยแล้ว',
          );
        }

        setDialogOpen(
          false,
        );
        setConfirmationOpen(false);

        setSelectedHoliday(
          null,
        );

        setFormData(
          createEmptyForm(),
        );

        setFormErrors({});

        await loadHolidays();
      } catch (
        saveError
      ) {
        setFormErrors(
          (
            previousErrors,
          ) => ({
            ...previousErrors,

            general:
              saveError.response
                ?.data
                ?.message ||
              'ไม่สามารถบันทึกวันหยุดได้',
          }),
        );
      } finally {
        setSaving(false);
      }
    };

  const handleSave = () => {
    if (!validateForm()) return;
    setConfirmationOpen(true);
  };

  /* =========================
     Delete
  ========================= */

  const handleOpenDelete =
    (holiday) => {
      setDeleteTarget(
        holiday,
      );
    };

  const handleCloseDelete =
    () => {
      if (deleting) {
        return;
      }

      setDeleteTarget(
        null,
      );
    };

  const handleDelete =
    async () => {
      if (
        !deleteTarget?.id
      ) {
        return;
      }

      setDeleting(true);
      setError('');
      setActionMessage('');

      try {
        await api.delete(
          `/hr/holidays/${deleteTarget.id}`,
        );

        setActionMessage(
          `ลบวันหยุด "${deleteTarget.name}" เรียบร้อยแล้ว`,
        );

        setDeleteTarget(
          null,
        );

        await loadHolidays();
      } catch (
        deleteError
      ) {
        setError(
          deleteError.response
            ?.data?.message ||
            'ไม่สามารถลบวันหยุดได้',
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =========================
     UI
  ========================= */

  return (
    <HRLayout activeMenu="Holiday Management">
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Button type="button" variant="contained" onClick={handleOpenAdd}>+ เพิ่มวันหยุด</Button>
      </Box>
      {/* Header */}

      <Box
        sx={{
          display:
            'none',

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
            '16px',
        }}
      >
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
          จัดการวันหยุด
        </Typography>

        <Button
          type="button"
          variant="contained"
          onClick={
            handleOpenAdd
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
          + เพิ่มวันหยุด
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
            setActionMessage(
              '',
            )
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
          display:
            'grid',

          gridTemplateColumns: {
            xs:
              '1fr',

            sm:
              'repeat(2, minmax(0, 1fr))',

            md:
              'repeat(4, minmax(0, 1fr))',
          },

          gap:
            '16px',

          marginBottom:
            '16px',
        }}
      >
        <InlineListSummary items={summaryCards} sx={{ gridColumn: '1 / -1', marginBottom: 0 }} />
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
            '20px',

          boxShadow:
            '0 4px 16px rgba(15, 23, 42, 0.04)',

          overflow:
            'hidden',
        }}
      >
        {/* Filters */}

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
            รายการวันหยุด
          </Typography>

          <DataListToolbar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="ค้นหาชื่อวันหยุด"
            resultLabel=""
            activeFilters={[
              ...(yearFilter !== String(currentYear) ? [{ key: 'year', label: `ปี: ${yearFilter}`, onDelete: () => setYearFilter(String(currentYear)) }] : []),
              ...(statusFilter !== 'all' ? [{ key: 'status', label: `สถานะ: ${statusFilter === 'active' ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}`, onDelete: () => setStatusFilter('all') }] : []),
            ]}
            onClearFilters={handleClearFilters}
            filters={<><FormControl size="small"><Select value={yearFilter === 'all' ? '' : yearFilter} displayEmpty renderValue={(value) => value || 'ปี'} inputProps={{ 'aria-label': 'ปี' }} onChange={(event) => setYearFilter(event.target.value || 'all')}>{availableYears.map((year) => <MenuItem key={year} value={String(year)}>{year}</MenuItem>)}</Select></FormControl><FormControl size="small"><Select value={statusFilter === 'all' ? '' : statusFilter} displayEmpty renderValue={(value) => value === 'active' ? 'ใช้งานอยู่' : value === 'inactive' ? 'ไม่ใช้งาน' : 'สถานะ'} inputProps={{ 'aria-label': 'สถานะ' }} onChange={(event) => setStatusFilter(event.target.value || 'all')}><MenuItem value="active">ใช้งานอยู่</MenuItem><MenuItem value="inactive">ไม่ใช้งาน</MenuItem></Select></FormControl></>}
            sx={{ marginTop: '16px' }}
          />

          <Box
            sx={{
              display:
                'none',

              gridTemplateColumns: {
                xs:
                  '1fr',

                lg:
                  'minmax(260px, 1.4fr) repeat(2, minmax(160px, 0.7fr)) auto',
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
              label="ค้นหาวันหยุด"
              placeholder="ชื่อวันหยุด"
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

                {availableYears.map(
                  (year) => (
                    <MenuItem
                      key={
                        year
                      }
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
                minWidth:
                  '110px',

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

                '&:hover': {
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

        {/* Content */}

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
        ) : filteredHolidays.length >
          0 ? (
          <Box
            sx={{
              overflowX:
                'auto',
            }}
          >
            <Table
              sx={{
                minWidth:
                  '900px',
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
                    'ชื่อวันหยุด',
                    'วันที่',
                    'วัน',
                    'ปี',
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
                {paginatedHolidays.map(
                  (
                    holiday,
                  ) => (
                    <TableRow
                      key={
                        holiday.id
                      }
                      hover
                      tabIndex={0}
                      onClick={() => handleOpenEdit(holiday)}
                      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleOpenEdit(holiday); } }}
                      sx={{ cursor: 'pointer', '&:focus-visible': { outline: '2px solid #2563EB', outlineOffset: -2 } }}
                    >
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
                            holiday.name
                          }
                        </Typography>
                      </TableCell>

                      {/* Date */}

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
                          {formatDate(
                            holiday.date,
                          )}
                        </Typography>
                      </TableCell>

                      {/* Day */}

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
                        {getThaiDayName(
                          holiday.date,
                        )}
                      </TableCell>

                      {/* Year */}

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
                          holiday.year
                        }
                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        <Chip
                          label={
                            holiday.isActive
                              ? 'ใช้งานอยู่'
                              : 'ไม่ใช้งาน'
                          }
                          size="small"
                          sx={{
                            minWidth:
                              '78px',

                            backgroundColor:
                              holiday.isActive
                                ? '#DCFCE7'
                                : '#FEE2E2',

                            color:
                              holiday.isActive
                                ? '#15803D'
                                : '#B91C1C',

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
                          <Button type="button" size="small" variant="outlined" color="error" onClick={(event) => { event.stopPropagation(); handleOpenDelete(holiday); }}>ลบ</Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
            {filteredHolidays.length > rowsPerPage ? <TablePagination component="div" count={filteredHolidays.length} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[rowsPerPage]} labelRowsPerPage="" labelDisplayedRows={() => `หน้า ${page + 1} จาก ${Math.ceil(filteredHolidays.length / rowsPerPage)}`} /> : null}
          </Box>
        ) : (
          /* Empty */

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
              ไม่พบข้อมูลวันหยุด
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

      {/* =========================
          Add / Edit Dialog
      ========================= */}

      <Dialog
        open={
          dialogOpen && !confirmationOpen
        }
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
          'edit'
            ? 'แก้ไขวันหยุด'
            : 'เพิ่มวันหยุด'}
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '24px !important',
          }}
        >
          {formErrors.general && (
            <Alert
              severity="error"
              sx={{
                marginBottom:
                  '18px',

                borderRadius:
                  '9px',
              }}
            >
              {
                formErrors.general
              }
            </Alert>
          )}

          <Box
            sx={{
              display:
                'flex',

              flexDirection:
                'column',

              gap:
                '18px',
            }}
          >
            {/* Name */}

            <TextField
              fullWidth
              label="ชื่อวันหยุด"
              placeholder="เช่น วันขึ้นปีใหม่"
              value={
                formData.name
              }
              onChange={(
                event,
              ) =>
                handleFormChange(
                  'name',
                  event.target
                    .value,
                )
              }
              error={Boolean(
                formErrors.name,
              )}
              helperText={
                formErrors.name ||
                `${formData.name.length}/100 ตัวอักษร`
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    100,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '9px',
                  },

                '& .MuiFormHelperText-root':
                  {
                    textAlign:
                      formErrors.name
                        ? 'left'
                        : 'right',
                  },
              }}
            />

            {/* Date */}

            <ThaiDateField
              label="วันที่"
              value={
                formData.date
              }
              onChange={(
                value,
              ) =>
                handleFormChange(
                  'date',
                  value,
                )
              }
              error={Boolean(
                formErrors.date,
              )}
              helperText={
                formErrors.date ||
                ''
              }
            />

            {/* Status */}

            <FormControl
              fullWidth
              error={Boolean(
                formErrors.status,
              )}
            >
              <InputLabel>
                สถานะ
              </InputLabel>

              <Select
                value={
                  formData.status
                }
                label="สถานะ"
                onChange={(
                  event,
                ) =>
                  handleFormChange(
                    'status',
                    event.target
                      .value,
                  )
                }
                sx={{
                  borderRadius:
                    '9px',
                }}
              >
                <MenuItem value="active">
                  ใช้งานอยู่
                </MenuItem>

                <MenuItem value="inactive">
                  ไม่ใช้งาน
                </MenuItem>
              </Select>

              {formErrors.status && (
                <FormHelperText>
                  {
                    formErrors.status
                  }
                </FormHelperText>
              )}
            </FormControl>

          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 22px',

            borderTop:
              0,

            gap:
              '10px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            disabled={
              saving
            }
            onClick={
              handleCloseDialog
            }
            sx={{
              minWidth:
                '100px',

              height:
                '42px',

              color:
                '#DC2626',

              borderColor:
                '#FCA5A5',

              borderRadius:
                '8px',

              fontSize:
                '12px',

              fontWeight:
                700,

              textTransform:
                'none',

              '&:hover': {
                color: '#B91C1C',
                borderColor: '#EF4444',
                backgroundColor: '#FEF2F2',
              },
            }}
          >
            ยกเลิก
          </Button>

          <Button
            type="button"
            variant="contained"
            disabled={
              saving
            }
            onClick={
              handleSave
            }
            sx={{
              minWidth:
                '120px',

              height:
                '42px',

              backgroundColor:
                '#2563EB',

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
                  '#1D4ED8',

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
      <Dialog open={confirmationOpen} onClose={() => !saving && setConfirmationOpen(false)} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>ยืนยันการบันทึกวันหยุด</DialogTitle><DialogContent><Typography><strong>ชื่อวันหยุด:</strong> {formData.name}</Typography><Typography sx={{ marginTop: '8px' }}><strong>วันที่:</strong> {formData.date || '-'}</Typography><Typography sx={{ marginTop: '8px' }}><strong>สถานะ:</strong> {formData.status === 'active' ? 'ใช้งานอยู่' : 'ไม่ใช้งาน'}</Typography></DialogContent><DialogActions sx={{ padding: '14px 20px' }}><Button variant="outlined" color="secondary" disabled={saving} onClick={() => setConfirmationOpen(false)}>กลับไปแก้ไข</Button><Button variant="contained" color="success" disabled={saving} onClick={confirmSave}>{saving ? 'กำลังบันทึก...' : 'ยืนยันบันทึก'}</Button></DialogActions></Dialog>

      {/* =========================
          Delete Dialog
      ========================= */}

      <Dialog
        open={Boolean(
          deleteTarget,
        )}
        onClose={
          handleCloseDelete
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
          ยืนยันการลบวันหยุด
        </DialogTitle>

        <DialogContent
          sx={{
            padding:
              '24px !important',
          }}
        >
          <Typography
            sx={{
              color:
                '#475569',

              fontSize:
                '13px',

              lineHeight:
                1.8,
            }}
          >
            ต้องการลบวันหยุด{' '}
            <Box
              component="span"
              sx={{
                color:
                  '#111827',

                fontWeight:
                  800,
              }}
            >
              {
                deleteTarget?.name
              }
            </Box>{' '}
            วันที่{' '}
            <Box
              component="span"
              sx={{
                color:
                  theme.primary,

                fontWeight:
                  800,
              }}
            >
              {formatDate(
                deleteTarget
                  ?.date,
              )}
            </Box>{' '}
            ใช่หรือไม่
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            padding:
              '16px 24px 22px',

            borderTop:
              0,

            gap:
              '10px',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            disabled={
              deleting
            }
            onClick={
              handleCloseDelete
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
            color="error"
            disabled={
              deleting
            }
            onClick={
              handleDelete
            }
            sx={{
              minWidth:
                '100px',

              height:
                '42px',

              backgroundColor:
                '#DC2626',

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
                  '#B91C1C',

                boxShadow:
                  'none',
              },
            }}
          >
            {deleting
              ? 'กำลังลบ...'
              : 'ลบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
}

export default HolidayManagementPage;
