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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import { BackButton, PageHeader } from './sharedvisualfoundation.jsx';
import { roleDashboardCardSurfaceSx } from '../theme/rolecardsurface.js';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  getLeaveOptions,
  getMyLeaveRequest,
  getMyLeaveRequests,
  saveLeaveDraft,
  submitLeaveDraft,
  submitLeaveRequest,
  updateLeaveDraft,
} from '../api/leave-service.js';


const emptyFormData = {
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
};

const allowedRoles = [
  'employee',
  'supervisor',
  'hr',
  'admin',
];

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
];

const maximumFileSize =
  10 * 1024 * 1024;

const getYearFromDate = (
  dateValue,
) => {
  const year = Number(
    String(
      dateValue || '',
    ).slice(0, 4),
  );

  return Number.isInteger(year) &&
    year > 0
    ? year
    : null;
};

const getBangkokToday = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const addCalendarDays = (dateValue, days) => {
  const value = new Date(`${dateValue}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

const isSickLeaveType = (leaveType) => {
  const name = String(leaveType?.name || leaveType?.leaveTypeName || '')
    .trim()
    .toLowerCase();
  return name.includes('sick') || name.includes('ป่วย');
};

const formatDisplayDate = (
  dateValue,
) => {
  if (!dateValue) {
    return '';
  }

  const date = new Date(
    `${dateValue}T00:00:00`,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  return date.toLocaleDateString(
    'th-TH-u-ca-gregory',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  );
};

const normalizeHolidayDate = (
  holiday,
) => {
  const value =
    typeof holiday === 'string'
      ? holiday
      : holiday?.holidayDate ||
        holiday?.holiday_date ||
        holiday?.date ||
        '';

  const dateMatch = String(value)
    .trim()
    .match(
      /^\d{4}-\d{2}-\d{2}/,
    );

  return dateMatch
    ? dateMatch[0]
    : '';
};

const normalizeLeaveType = (
  leaveType,
) => {
  const requiresAttachment =
    Boolean(
      leaveType
        ?.requiresAttachment ??
        leaveType
          ?.attachmentRequired,
    );

  return {
    ...leaveType,

    id: Number(
      leaveType?.id,
    ),

    status:
      leaveType?.status ===
      'Inactive'
        ? 'Inactive'
        : 'Active',

    requiresAttachment,

    attachmentRequired:
      requiresAttachment,

    attachmentRequiredAfterDays:
      Number(
        leaveType
          ?.attachmentRequiredAfterDays,
      ) > 0
        ? Number(
            leaveType
              .attachmentRequiredAfterDays,
          )
        : null,

    minimumDays: Math.max(
      Number(
        leaveType
          ?.minimumDays,
      ) || 1,
      0.5,
    ),

    maximumDaysPerRequest:
      Math.max(
        Number(
          leaveType
            ?.maximumDaysPerRequest,
        ) || 365,
        0.5,
      ),
  };
};

const formatDays = (
  value,
) => {
  const number =
    Number(value) || 0;

  return Number.isInteger(
    number,
  )
    ? String(number)
    : number
        .toFixed(2)
        .replace(
          /\.?0+$/,
          '',
        );
};

const formatFileSize = (
  fileSize,
) => {
  const size =
    Number(fileSize) || 0;

  return size <
    1024 * 1024
    ? `${(
        size / 1024
      ).toFixed(1)} KB`
    : `${(
        size /
        (1024 * 1024)
      ).toFixed(1)} MB`;
};

const getAttachmentRuleText =
  (
    leaveType,
  ) => {
    if (!leaveType) {
      return '';
    }

    if (
      leaveType
        .requiresAttachment
    ) {
      return 'ต้องแนบไฟล์';
    }

    if (
      Number(
        leaveType
          .attachmentRequiredAfterDays,
      ) > 0
    ) {
      return `ต้องแนบไฟล์เมื่อขอลาตั้งแต่ ${formatDays(
        leaveType
          .attachmentRequiredAfterDays,
      )} วันทำงาน`;
    }

    return 'ไม่บังคับแนบไฟล์';
  };

function ThaiDateField({
  label,
  value,
  onChange,
  minDate,
  disabled = false,
  error = false,
  helperText = '',
  holidaysByDate = new Map(),
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initialDate = value || minDate || getBangkokToday();
    return new Date(`${initialDate}T00:00:00Z`);
  });

  const openDatePicker = () => {
    if (disabled) return;
    const initialDate = value || minDate || getBangkokToday();
    setVisibleMonth(new Date(`${initialDate}T00:00:00Z`));
    setPickerOpen(true);
  };

  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const visibleMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
  const visibleHolidays = Array.from(holidaysByDate.values())
    .filter((holiday) => holiday.date.startsWith(visibleMonthPrefix))
    .sort((first, second) => first.date.localeCompare(second.date));

  const moveMonth = (offset) => {
    setVisibleMonth(new Date(Date.UTC(year, month + offset, 1)));
  };

  const selectDate = (day) => {
    const dateValue = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateValue);
    setPickerOpen(false);
  };

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <TextField
        fullWidth
        required
        disabled={disabled}
        label={label}
        value={
          formatDisplayDate(
            value,
          )
        }
        placeholder="วว/ดด/ปปปป"
        error={error}
        helperText={helperText}
        onClick={
          openDatePicker
        }
        onKeyDown={(event) => {
          if (
            event.key ===
              'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();
            openDatePicker();
          }
        }}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
          input: {
            readOnly: true,

            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  disabled={disabled}
                  edge="end"
                  aria-label="เลือกวันที่"
                  onClick={(
                    event,
                  ) => {
                    event.stopPropagation();
                    openDatePicker();
                  }}
                  sx={{
                    color:
                      '#374151',
                  }}
                >
                  <CalendarMonthRounded
                    fontSize="small"
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          cursor: 'pointer',

          '& .MuiOutlinedInput-root':
            {
              borderRadius:
                '10px',

              cursor:
                'pointer',
            },

          '& .MuiInputBase-input':
            {
              cursor:
                'pointer',
            },

          '& .MuiInputBase-input::placeholder':
            {
              color:
                '#6B7280',

              opacity:
                1,
            },
        }}
      />

      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <IconButton aria-label="เดือนก่อนหน้า" onClick={() => moveMonth(-1)}>‹</IconButton>
          <Typography sx={{ fontWeight: 800 }}>
            {visibleMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </Typography>
          <IconButton aria-label="เดือนถัดไป" onClick={() => moveMonth(1)}>›</IconButton>
        </DialogTitle>
        <DialogContent sx={{ paddingBottom: '20px !important' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((dayName) => (
              <Typography key={dayName} sx={{ color: '#64748B', fontSize: '12px', fontWeight: 700, padding: '6px 0' }}>{dayName}</Typography>
            ))}
            {calendarDays.map((day, index) => {
              if (!day) return <Box key={`empty-${index}`} />;
              const dateValue = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayOfWeek = new Date(`${dateValue}T00:00:00Z`).getUTCDay();
              const holiday = holidaysByDate.get(dateValue);
              const isBlocked = dayOfWeek === 0 || dayOfWeek === 6 || Boolean(holiday) || Boolean(minDate && dateValue < minDate);
              return (
                <Button
                  key={dateValue}
                  type="button"
                  disabled={isBlocked}
                  title={holiday?.name || (dayOfWeek === 0 || dayOfWeek === 6 ? 'วันหยุดสุดสัปดาห์' : '')}
                  aria-label={holiday ? `${dateValue} ${holiday.name}` : dateValue}
                  onClick={() => selectDate(day)}
                  sx={{ minWidth: 0, height: '38px', padding: 0, borderRadius: '9px', fontWeight: value === dateValue ? 800 : 500, backgroundColor: value === dateValue ? '#DBEAFE' : 'transparent' }}
                >
                  {day}
                </Button>
              );
            })}
          </Box>
          {visibleHolidays.length > 0 ? (
            <Box sx={{ display: 'grid', gap: '6px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              {visibleHolidays.map((holiday) => (
                <Box key={holiday.date} sx={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <Typography sx={{ minWidth: '48px', color: '#DC2626', fontSize: '12px', fontWeight: 800 }}>
                    {new Date(`${holiday.date}T00:00:00Z`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', timeZone: 'UTC' })}
                  </Typography>
                  <Typography sx={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                    {holiday.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function RoleCreateLeaveRequestPage({
  LayoutComponent,
  theme,
  organizationHolidays = [],
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const pathRole =
    location.pathname.split(
      '/',
    )[1];

  const currentRole =
    allowedRoles.includes(
      pathRole,
    )
      ? pathRole
      : 'employee';

  const searchParameters =
    new URLSearchParams(
      location.search,
    );

  const editParameter =
    searchParameters.get(
      'edit',
    );

  const editRequestId =
    editParameter !== null
      ? Number(
          editParameter,
        )
      : null;

  const isEditMode =
    Number.isInteger(
      editRequestId,
    ) &&
    editRequestId > 0;

  const requestedBackPath = location.state?.returnTo;
  const backPath =
    typeof requestedBackPath === 'string' &&
    requestedBackPath.startsWith(`/${currentRole}/`)
      ? requestedBackPath
      : `/${currentRole}/my-requests`;

  const [
    formData,
    setFormData,
  ] = useState({
    ...emptyFormData,
  });

  const [
    attachments,
    setAttachments,
  ] = useState([]);

  const [
    loadedDraft,
    setLoadedDraft,
  ] = useState(null);

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    message,
    setMessage,
  ] = useState(null);

  const [leaveOptions, setLeaveOptions] = useState({ leaveTypes: [], holidays: [] });
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [roleRequests, setRoleRequests] = useState([]);
  const storageRevision = 0;

  useEffect(() => {
    setErrors({});

    if (!isEditMode) {
      setLoadedDraft(null);

      setFormData({
        ...emptyFormData,
      });

      setAttachments([]);
      setMessage(null);

      return;
    }

  }, [
    isEditMode,
    location.search,
  ]);

  const entitlementYear =
    useMemo(
      () =>
        getYearFromDate(
          formData.startDate,
        ) ||
        new Date()
          .getFullYear(),
      [
        formData.startDate,
      ],
    );

  useEffect(() => {
    let active = true;
    Promise.all([getLeaveOptions(entitlementYear), getMyLeaveRequests()])
      .then(([options, requests]) => {
        if (!active) return;
        setLeaveOptions(options || { leaveTypes: [], holidays: [] });
        setRoleRequests(requests);
      })
      .catch((error) => {
        if (active) setMessage({ severity: 'error', text: error.response?.data?.message || 'ไม่สามารถโหลดข้อมูลคำขอลาได้' });
      });
    return () => { active = false; };
  }, [entitlementYear]);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    getMyLeaveRequest(editRequestId)
      .then((draft) => {
        if (!active || String(draft?.status).toLowerCase() !== 'draft') return;
        setLoadedDraft(draft);
        setFormData({
          leaveTypeId: draft.leaveTypeId || '',
          startDate: draft.startDate || '',
          endDate: draft.endDate || '',
          reason: draft.reason || '',
        });
        setAttachments(Array.isArray(draft.attachments) ? draft.attachments : []);
      })
      .catch((error) => {
        if (active) {
          setLoadedDraft(null);
          setMessage({ severity: 'error', text: error.response?.data?.message || `ไม่พบร่างคำขอ #${editRequestId}` });
        }
      });
    return () => { active = false; };
  }, [editRequestId, isEditMode]);

  const activeLeaveTypes =
    useMemo(() => {
      return (leaveOptions.leaveTypes || [])
        .map(
          normalizeLeaveType,
        );
    }, [
      leaveOptions.leaveTypes,
    ]);

  const inactiveSelectedLeaveType =
    useMemo(() => {
      if (
        !formData.leaveTypeId
      ) {
        return null;
      }

      const isActive =
        activeLeaveTypes.some(
          (
            leaveType,
          ) =>
            Number(
              leaveType.id,
            ) ===
            Number(
              formData
                .leaveTypeId,
            ),
        );

      if (isActive) {
        return null;
      }

      const storedLeaveType = Number(loadedDraft?.leaveTypeId) === Number(formData.leaveTypeId)
        ? { id: loadedDraft.leaveTypeId, name: loadedDraft.leaveType }
        : null;

      return storedLeaveType
        ? {
            ...normalizeLeaveType(
              storedLeaveType,
            ),

            status:
              'Inactive',
          }
        : null;
    }, [
    activeLeaveTypes,
    formData.leaveTypeId,
    loadedDraft,
    ]);

  const selectableLeaveTypes =
    useMemo(
      () =>
        inactiveSelectedLeaveType
          ? [
              ...activeLeaveTypes,
              inactiveSelectedLeaveType,
            ]
          : activeLeaveTypes,
      [
        activeLeaveTypes,
        inactiveSelectedLeaveType,
      ],
    );

  const calculatedLeaveTypes =
    useMemo(
      () =>
        selectableLeaveTypes.map(
          (
            leaveType,
          ) => {
            const entitlement = leaveType.hasEntitlement ? leaveType : null;

            const pendingDays = Number(leaveType.pendingDays) || 0;

            const totalDays =
              Number(
                entitlement
                  ?.totalDays,
              ) || 0;

            const usedDays =
              Number(
                entitlement
                  ?.usedDays,
              ) || 0;

            const remainingDays =
              Math.max(
                totalDays -
                  usedDays,
                0,
              );

            const availableDays =
              Math.max(
                leaveType.availableDays === undefined ||
                  leaveType.availableDays === null
                  ? remainingDays -
                      pendingDays
                  : Number(
                      leaveType.availableDays,
                    ),
                0,
              );

            return {
              ...leaveType,

              entitlement,

              hasEntitlement:
                Boolean(
                  entitlement,
                ),

              totalDays,

              usedDays,

              pendingDays,

              remainingDays,

              availableDays,

              isSelectable:
                leaveType.status ===
                'Active',
            };
          },
        ),
      [
        selectableLeaveTypes,
      ],
    );

  const selectedLeaveType =
    useMemo(
      () =>
        calculatedLeaveTypes.find(
          (
            leaveType,
          ) =>
            Number(
              leaveType.id,
            ) ===
            Number(
              formData
                .leaveTypeId,
            ),
        ) ||
        null,
      [
        calculatedLeaveTypes,
        formData.leaveTypeId,
      ],
    );

  const minimumStartDate = useMemo(
    () => selectedLeaveType && !isSickLeaveType(selectedLeaveType)
      ? addCalendarDays(getBangkokToday(), 3)
      : '',
    [selectedLeaveType],
  );

  const dateSelectionDisabled = !selectedLeaveType || !selectedLeaveType.isSelectable;

  const activeHolidayByDate =
    useMemo(() => {
      void storageRevision;

      const holidaysByDate = new Map();
      for (const holiday of [
        ...(leaveOptions.holidays || []),
        ...organizationHolidays,
      ]) {
        const holidayDate = normalizeHolidayDate(holiday);
        if (!holidayDate) continue;
        holidaysByDate.set(holidayDate, {
          date: holidayDate,
          name: typeof holiday === 'string'
            ? 'วันหยุดองค์กร'
            : holiday?.name || holiday?.holidayName || 'วันหยุดองค์กร',
        });
      }
      return holidaysByDate;
    }, [
      organizationHolidays,
      leaveOptions.holidays,
      storageRevision,
    ]);

  const activeHolidayDateSet =
    useMemo(
      () =>
        new Set(
          activeHolidayByDate.keys(),
        ),
      [
        activeHolidayByDate,
      ],
    );

  useEffect(() => {
    const blockedReason = (dateValue) => {
      if (!dateValue) return '';
      const dayOfWeek = new Date(`${dateValue}T00:00:00Z`).getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return 'วันที่เลือกเป็นวันหยุดสุดสัปดาห์';
      const holiday = activeHolidayByDate.get(dateValue);
      return holiday ? `วันที่เลือกเป็นวันหยุด: ${holiday.name}` : '';
    };

    const startDateError = blockedReason(formData.startDate);
    if (startDateError) {
      setFormData((current) => ({ ...current, startDate: '', endDate: '' }));
      setErrors((current) => ({ ...current, startDate: startDateError }));
      return;
    }

    const endDateError = blockedReason(formData.endDate);
    if (endDateError) {
      setFormData((current) => ({ ...current, endDate: '' }));
      setErrors((current) => ({ ...current, endDate: endDateError }));
    }
  }, [activeHolidayByDate, formData.endDate, formData.startDate]);

  const workingDaySummary =
    useMemo(() => {
      if (
        !formData.startDate ||
        !formData.endDate
      ) {
        return {
          workingDays: 0,
          weekendDays: 0,
          holidayDays: 0,
          excludedDates: [],
        };
      }

      const startDate =
        new Date(
          `${formData.startDate}T00:00:00Z`,
        );

      const endDate =
        new Date(
          `${formData.endDate}T00:00:00Z`,
        );

      if (
        Number.isNaN(
          startDate.getTime(),
        ) ||
        Number.isNaN(
          endDate.getTime(),
        ) ||
        startDate > endDate
      ) {
        return {
          workingDays: 0,
          weekendDays: 0,
          holidayDays: 0,
          excludedDates: [],
        };
      }

      let workingDays = 0;
      let weekendDays = 0;
      let holidayDays = 0;

      const excludedDates = [];

      const currentDate =
        new Date(startDate);

      while (
        currentDate <=
        endDate
      ) {
        const date =
          currentDate
            .toISOString()
            .slice(0, 10);

        const dayOfWeek =
          currentDate
            .getUTCDay();

        const isWeekend =
          dayOfWeek === 0 ||
          dayOfWeek === 6;

        const isHoliday =
          activeHolidayDateSet.has(
            date,
          );

        if (isWeekend) {
          weekendDays += 1;

          excludedDates.push({
            date,
            reason:
              'วันหยุดสุดสัปดาห์',
          });
        } else if (
          isHoliday
        ) {
          holidayDays += 1;

          excludedDates.push({
            date,
            reason:
              activeHolidayByDate.get(date)?.name || 'วันหยุดองค์กร',
          });
        } else {
          workingDays += 1;
        }

        currentDate.setUTCDate(
          currentDate.getUTCDate() +
            1,
        );
      }

      return {
        workingDays,
        weekendDays,
        holidayDays,
        excludedDates,
      };
    }, [
      activeHolidayDateSet,
      activeHolidayByDate,
      formData.endDate,
      formData.startDate,
    ]);

  const requestedDays =
    workingDaySummary
      .workingDays;

  const attachmentRequired =
    useMemo(() => {
      if (
        !selectedLeaveType
      ) {
        return false;
      }

      if (
        selectedLeaveType
          .requiresAttachment
      ) {
        return true;
      }

      const threshold =
        Number(
          selectedLeaveType
            .attachmentRequiredAfterDays,
        );

      return (
        threshold > 0 &&
        requestedDays >=
          threshold
      );
    }, [
      requestedDays,
      selectedLeaveType,
    ]);

  const handleInputChange = (
    fieldName,
    value,
  ) => {
    setFormData(
      (
        previousData,
      ) => ({
        ...previousData,
        [fieldName]:
          value,
      }),
    );

    setErrors(
      (
        previousErrors,
      ) => ({
        ...previousErrors,
        [fieldName]:
          '',
        dateRange:
          '',
        balance:
          '',
        overlap:
          '',
        policy:
          '',
      }),
    );

    setMessage(null);
  };

  const handleLeaveTypeChange = (leaveTypeId) => {
    const nextLeaveType = calculatedLeaveTypes.find(
      (leaveType) => Number(leaveType.id) === Number(leaveTypeId),
    );

    const nextMinimumDate = nextLeaveType && !isSickLeaveType(nextLeaveType)
      ? addCalendarDays(getBangkokToday(), 3)
      : '';

    setFormData((previousData) => {
      const mustClearDates = Boolean(
        nextMinimumDate &&
        previousData.startDate &&
        previousData.startDate < nextMinimumDate,
      );
      return {
        ...previousData,
        leaveTypeId,
        startDate: mustClearDates ? '' : previousData.startDate,
        endDate: mustClearDates ? '' : previousData.endDate,
      };
    });
    setErrors({});
    setMessage(null);
  };

  const handleStartDateChange = (startDate) => {
    setFormData((previousData) => ({
      ...previousData,
      startDate,
      endDate:
        previousData.endDate && previousData.endDate < startDate
          ? ''
          : previousData.endDate,
    }));
    setErrors((previousErrors) => ({
      ...previousErrors,
      startDate: '',
      endDate: '',
      dateRange: '',
      balance: '',
      overlap: '',
      policy: '',
    }));
    setMessage(null);
  };

  const dateRangesOverlap = (
    firstStartDate,
    firstEndDate,
    secondStartDate,
    secondEndDate,
  ) =>
    firstStartDate <=
      secondEndDate &&
    firstEndDate >=
      secondStartDate;

  const hasOverlappingRequest =
    () => {
      if (
        !formData.startDate ||
        !formData.endDate
      ) {
        return false;
      }

      return roleRequests.some(
        (
          request,
        ) => {
          if (
            isEditMode &&
            Number(
              request.id,
            ) ===
              Number(
                editRequestId,
              )
          ) {
            return false;
          }

          const status =
            String(
              request.status ||
                '',
            ).toLowerCase();

          if (
            ![
              'pending',
              'approved',
            ].includes(
              status,
            )
          ) {
            return false;
          }

          if (
            !request.startDate ||
            !request.endDate
          ) {
            return false;
          }

          return dateRangesOverlap(
            formData.startDate,
            formData.endDate,
            request.startDate,
            request.endDate,
          );
        },
      );
    };

  const handleAttachmentChange =
    (
      event,
    ) => {
      const selectedFiles =
        Array.from(
          event.target.files ||
            [],
        );

      if (
        selectedFiles.length ===
        0
      ) {
        return;
      }

      const invalidTypeFile =
        selectedFiles.find(
          (
            file,
          ) =>
            !allowedMimeTypes.includes(
              file.type,
            ),
        );

      if (
        invalidTypeFile
      ) {
        setErrors(
          (
            previousErrors,
          ) => ({
            ...previousErrors,

            attachments:
              'อนุญาตเฉพาะไฟล์ PDF, JPG, JPEG และ PNG',
          }),
        );

        event.target.value =
          '';

        return;
      }

      const oversizedFile =
        selectedFiles.find(
          (
            file,
          ) =>
            file.size >
            maximumFileSize,
        );

      if (
        oversizedFile
      ) {
        setErrors(
          (
            previousErrors,
          ) => ({
            ...previousErrors,

            attachments:
              'ไฟล์แนบแต่ละไฟล์ต้องมีขนาดไม่เกิน 10 MB',
          }),
        );

        event.target.value =
          '';

        return;
      }

      setAttachments(
        (
          previousAttachments,
        ) => {
          const combinedFiles =
            [
              ...previousAttachments,
              ...selectedFiles,
            ];

          return combinedFiles.filter(
            (
              file,
              index,
              allFiles,
            ) =>
              allFiles.findIndex(
                (
                  comparedFile,
                ) =>
                  comparedFile.name ===
                    file.name &&
                  Number(
                    comparedFile.size,
                  ) ===
                    Number(
                      file.size,
                    ),
              ) ===
              index,
          );
        },
      );

      setErrors(
        (
          previousErrors,
        ) => ({
          ...previousErrors,
          attachments:
            '',
        }),
      );

      setMessage(null);

      event.target.value =
        '';
    };

  const handleRemoveAttachment =
    (
      selectedAttachment,
    ) => {
      setAttachments(
        (
          previousAttachments,
        ) =>
          previousAttachments.filter(
            (
              attachment,
            ) => {
              if (
                selectedAttachment.id &&
                attachment.id
              ) {
                return (
                  attachment.id !==
                  selectedAttachment.id
                );
              }

              return !(
                attachment.name ===
                  selectedAttachment.name &&
                Number(
                  attachment.size,
                ) ===
                  Number(
                    selectedAttachment.size,
                  )
              );
            },
          ),
      );

      setErrors(
        (
          previousErrors,
        ) => ({
          ...previousErrors,
          attachments:
            '',
        }),
      );

      setMessage(null);
    };

  const validateSubmit =
    () => {
      const validationErrors =
        {};

      if (
        !formData.leaveTypeId
      ) {
        validationErrors.leaveTypeId =
          'กรุณาเลือกประเภทการลา';
      } else if (
        !selectedLeaveType
      ) {
        validationErrors.leaveTypeId =
          'ประเภทการลาที่เลือกไม่สามารถใช้งานได้แล้ว';
      } else if (
        selectedLeaveType.status !==
        'Active'
      ) {
        validationErrors.leaveTypeId =
          'ประเภทการลานี้ถูกปิดใช้งาน กรุณาเลือกประเภทการลาที่เปิดใช้งาน';
      }

      if (
        !formData.startDate
      ) {
        validationErrors.startDate =
          'กรุณาเลือกวันที่เริ่มลา';
      }

      if (
        !formData.endDate
      ) {
        validationErrors.endDate =
          'กรุณาเลือกวันที่สิ้นสุด';
      }

      if (
        formData.startDate &&
        minimumStartDate &&
        formData.startDate < minimumStartDate
      ) {
        validationErrors.startDate =
          `การลาประเภทนี้ต้องยื่นล่วงหน้าอย่างน้อย 3 วัน กรุณาเลือกวันที่ตั้งแต่ ${formatDisplayDate(minimumStartDate)}`;
      }

      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate >
          formData.endDate
      ) {
        validationErrors.dateRange =
          'วันที่สิ้นสุดต้องตรงกับหรือหลังวันที่เริ่มลา';
      }

      const startYear =
        getYearFromDate(
          formData.startDate,
        );

      const endYear =
        getYearFromDate(
          formData.endDate,
        );

      if (
        startYear &&
        endYear &&
        startYear !==
          endYear
      ) {
        validationErrors.dateRange =
          'ระบบยังไม่รองรับการยื่นลาคร่อมปี';
      }

      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate <=
          formData.endDate &&
        requestedDays ===
          0
      ) {
        validationErrors.dateRange =
          'ช่วงวันที่เลือกไม่มีวันทำงาน';
      }

      if (
        selectedLeaveType &&
        requestedDays >
          0
      ) {
        if (
          requestedDays <
          Number(
            selectedLeaveType
              .minimumDays,
          )
        ) {
          validationErrors.policy =
            `${selectedLeaveType.name} ต้องลาอย่างน้อย ${formatDays(
              selectedLeaveType.minimumDays,
            )} วันทำงานต่อคำขอ`;
        } else if (
          requestedDays >
          Number(
            selectedLeaveType
              .maximumDaysPerRequest,
          )
        ) {
          validationErrors.policy =
            `${selectedLeaveType.name} อนุญาตให้ลาได้สูงสุด ${formatDays(
              selectedLeaveType.maximumDaysPerRequest,
            )} วันทำงานต่อคำขอ`;
        }
      }

      if (
        selectedLeaveType &&
        !selectedLeaveType
          .hasEntitlement
      ) {
        validationErrors.balance =
          `ไม่พบสิทธิ์วันลาสำหรับปี ${entitlementYear}`;
      } else if (
        selectedLeaveType &&
        requestedDays >
          selectedLeaveType
            .availableDays
      ) {
        validationErrors.balance =
          `ไม่สามารถส่งคำขอได้ เนื่องจากสิทธิ์ที่ยื่นได้คงเหลือ ${formatDays(
            selectedLeaveType.availableDays,
          )} วัน${selectedLeaveType.pendingDays > 0 ? ` และมีคำขอรออนุมัติ ${formatDays(selectedLeaveType.pendingDays)} วัน` : ''}`;
      }

      if (
        hasOverlappingRequest()
      ) {
        validationErrors.overlap =
          'ช่วงวันที่เลือกซ้ำกับคำขอลาที่กำลังรออนุมัติหรือได้รับอนุมัติแล้ว';
      }

      const normalizedReason =
        formData.reason.trim();

      if (
        !normalizedReason
      ) {
        validationErrors.reason =
          'กรุณากรอกเหตุผลการลา';
      } else if (
        normalizedReason.length <
        5
      ) {
        validationErrors.reason =
          'เหตุผลการลาต้องมีอย่างน้อย 5 ตัวอักษร';
      } else if (
        normalizedReason.length >
        500
      ) {
        validationErrors.reason =
          'เหตุผลการลาต้องไม่เกิน 500 ตัวอักษร';
      } else if (!/^[A-Za-z\u0E01-\u0E3A\u0E40-\u0E4E\s]+$/u.test(normalizedReason)) {
        validationErrors.reason =
          'เหตุผลการลาต้องเป็นตัวอักษรภาษาไทยหรือภาษาอังกฤษเท่านั้น';
      }

      if (
        attachmentRequired &&
        attachments.length ===
          0
      ) {
        validationErrors.attachments =
          'ไม่ได้แนบเอกสาร';
      }

      setErrors(
        validationErrors,
      );

      return validationErrors;
    };

  const createStorageData =
    () => ({
      requestId:
        isEditMode &&
        loadedDraft
          ? loadedDraft.id
          : null,

      role:
        currentRole,

      leaveTypeId:
        Number(
          formData.leaveTypeId,
        ),

      leaveType:
        selectedLeaveType
          ?.name ||
        'ยังไม่ได้เลือก',

      startDate:
        formData.startDate,

      endDate:
        formData.endDate,

      leaveDays:
        requestedDays,

      reason:
        formData.reason.trim(),

      attachments:
        attachments.map(
          (
            attachment,
          ) => ({
            id:
              attachment.id ||
              null,

            name:
              attachment.name ||
              attachment.fileName,

            size:
              Number(
                attachment.size ||
                  attachment.fileSize,
              ) || 0,

            type:
              attachment.type ||
              attachment.fileType ||
              '',
          }),
        ),
    });

  const handleSaveDraft =
    async () => {
      if (
        isEditMode &&
        !loadedDraft
      ) {
        setMessage({
          severity:
            'error',

          text:
            `ไม่สามารถอัปเดตร่างคำขอ #${editRequestId} ได้ เนื่องจากไม่พบข้อมูล`,
        });

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        });

        return;
      }

      const draftErrors = validateSubmit();

      if (Object.keys(draftErrors).length > 0) {
        setMessage({
          severity:
            'error',

          text:
            Object.values(draftErrors).filter(Boolean),
        });

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        });

        return;
      }

      try {
        const payload = createStorageData();
        const newFiles = attachments.filter((attachment) => attachment instanceof File);
        if (isEditMode) await updateLeaveDraft(editRequestId, payload, newFiles);
        else await saveLeaveDraft(payload, newFiles);
      } catch (error) {
        setMessage({
          severity:
            'error',

          text:
            error.response?.data?.message || 'ไม่สามารถบันทึกร่างได้',
        });

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        });

        return;
      }

      navigate(
        `/${currentRole}/my-requests`,
      );
    };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setMessage(null);

    if (
      isEditMode &&
      !loadedDraft
    ) {
      setMessage({
        severity:
          'error',

        text:
          `ไม่สามารถส่งร่างคำขอ #${editRequestId} ได้ เนื่องจากไม่พบข้อมูล`,
      });

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });

      return;
    }

    const submissionErrors = validateSubmit();

    if (Object.keys(submissionErrors).length > 0) {
      setMessage({
        severity:
          'error',

        text:
          Object.values(submissionErrors).filter(Boolean),
      });

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });

      return;
    }

    setConfirmationOpen(true);
  };

  const confirmSubmit = async () => {
    try {
      const payload = createStorageData();
      const newFiles = attachments.filter((attachment) => attachment instanceof File);
      if (isEditMode) await submitLeaveDraft(editRequestId, payload, newFiles);
      else await submitLeaveRequest(payload, newFiles);
    } catch (error) {
      setMessage({
        severity:
          'error',

        text:
          error.response?.data?.message || 'ไม่สามารถส่งคำขอลาได้ กรุณาตรวจสอบสิทธิ์วันลาคงเหลือและวันที่ที่เลือก',
      });

      window.scrollTo({
        top: 0,
        behavior:
          'smooth',
      });

      return;
    }

    setConfirmationOpen(false);
    navigate(
      `/${currentRole}/my-requests`,
    );
  };

  const handleReset =
    () => {
      setErrors({});

      if (
        isEditMode &&
        loadedDraft
      ) {
        setFormData({
          leaveTypeId:
            loadedDraft
              .leaveTypeId ||
            '',

          startDate:
            loadedDraft
              .startDate ||
            '',

          endDate:
            loadedDraft
              .endDate ||
            '',

          reason:
            loadedDraft
              .reason ||
            '',
        });

        setAttachments(
          Array.isArray(
            loadedDraft
              .attachments,
          )
            ? loadedDraft
                .attachments
            : [],
        );

        setMessage({
          severity:
            'info',

          text:
            `คืนค่าร่างคำขอ #${loadedDraft.id} เป็นข้อมูลที่บันทึกไว้แล้ว`,
        });

        return;
      }

      setFormData({
        ...emptyFormData,
      });

      setAttachments([]);
      setMessage(null);
    };

  const summaryItems = [
    [
      'ประเภทการลา',

      selectedLeaveType
        ?.name ||
        'ยังไม่ได้เลือก',
    ],

    [
      'ช่วงวันที่ลา',

      formData.startDate &&
      formData.endDate
        ? `${formatDisplayDate(
            formData.startDate,
          )} - ${formatDisplayDate(
            formData.endDate,
          )}`
        : 'ยังไม่ได้เลือก',
    ],

    [
      'จำนวนวันที่ขอลา',

      `${formatDays(
        requestedDays,
      )} วัน`,
    ],

    [
      'ไฟล์แนบ',

      `${attachments.length} ไฟล์`,
    ],

    [
      'สิทธิ์ทั้งหมด',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.totalDays,
          )} วัน`
        : 'ไม่มีข้อมูล',
    ],

    [
      'ใช้ไปแล้ว',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.usedDays,
          )} วัน`
        : 'ไม่มีข้อมูล',
    ],

    [
      'รออนุมัติ',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.pendingDays,
          )} วัน`
        : 'ไม่มีข้อมูล',
    ],

    [
      'ยื่นเพิ่มได้',

      selectedLeaveType
        ? `${formatDays(
            selectedLeaveType.availableDays,
          )} วัน`
        : 'ไม่มีข้อมูล',
    ],
  ];

  const policyErrors = [
    errors.dateRange,
    errors.balance,
    errors.overlap,
    errors.policy,
  ].filter(Boolean);

  return (
    <LayoutComponent
      activeMenu="Leave Request"
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: isEditMode ? '700px' : '760px',
          marginInline: 'auto',
          '--role-primary': theme.primary,
          '--role-secondary': theme.dark,
          '--role-soft': theme.soft,
          '--role-border': theme.border,
          '--role-text': theme.text,
          paddingTop: {
            xs: '10px',
            sm: '18px',
          },
        }}
      >
      <PageHeader
        title={isEditMode ? 'แก้ไขคำขอลาฉบับร่าง' : 'ยื่นคำขอลา'}
        actions={(
          <BackButton
            aria-label={backPath.endsWith('/dashboard') ? 'กลับไปหน้าแดชบอร์ด' : 'กลับไปยังรายการคำขอลา'}
            onClick={() => navigate(backPath)}
          >
            กลับ
          </BackButton>
        )}
      />

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto 24px',
          display: 'none',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, minmax(0, 1fr))',
          },
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D8E0EA',
          borderRadius: '16px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.035)',
        }}
      >
        {[
          {
            title: 'วันทำงาน',
            value: formatDays(requestedDays),
            background: theme.soft,
            valueColor: theme.primary,
          },
          {
            title: 'วันหยุดสุดสัปดาห์',
            value: formatDays(workingDaySummary.weekendDays),
            background: '#FFFBEB',
            valueColor: '#B45309',
          },
          {
            title: 'วันหยุดองค์กร',
            value: formatDays(workingDaySummary.holidayDays),
            background: '#FFF5F5',
            valueColor: '#DC2626',
          },
        ].map((card) => (
          <Box
            key={card.title}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              minHeight: '64px',
              padding: '14px 18px',
              backgroundColor: card.background,
              borderRight: {
                xs: 0,
                sm: '1px solid #D8E0EA',
              },
              borderBottom: {
                xs: '1px solid #D8E0EA',
                sm: 0,
              },
              '&:last-of-type': {
                borderRight: 0,
                borderBottom: 0,
              },
            }}
          >
            <Typography
              noWrap
              sx={{
                color: '#334155',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {card.title}
            </Typography>

            <Typography
              sx={{
                color: card.valueColor,
                fontSize: '17px',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {card.value}
            </Typography>

          </Box>
        ))}
      </Paper>

      {message && (
        <Alert
          severity={
            message.severity
          }
          onClose={() =>
            setMessage(
              null,
            )
          }
          sx={{
            width:
              '100%',

            maxWidth:
              '900px',

            margin:
              '0 auto 20px',

            borderRadius:
              '10px',
          }}
        >
          {Array.isArray(message.text) ? (
            <Box component="ul" sx={{ margin: 0, paddingLeft: '20px' }}>
              {message.text.map((item) => (
                <Typography
                  component="li"
                  key={item}
                  sx={{ fontSize: '14px', lineHeight: 1.7 }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          ) : message.text}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={
          handleSubmit
        }
        noValidate
        sx={{
          width:
            '100%',

          maxWidth:
            '900px',

          margin:
            '0 auto',

          display:
            'grid',

          gridTemplateColumns: {
            xs: '1fr',
          },

          gap:
            '20px',

          alignItems:
            'start',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            ...roleDashboardCardSurfaceSx,
            borderColor: '#E2E8F0',
          }}
        >
          <Box
            sx={{
              padding: {
                xs:
                  '16px 18px',

                sm:
                  '17px 26px',
              },

              borderBottom:
                '1px solid #D8E0EA',

              backgroundColor: '#F8FAFC',

              display: 'none',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                color:
                  '#111827',

                fontSize:
                  '16px',

                fontWeight:
                  600,
              }}
            >
              ข้อมูลการลา
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px',
                flexWrap: 'wrap',
                marginLeft: 'auto',
              }}
            >
              <Button
                type="button"
                size="small"
                variant="outlined"
                onClick={handleSaveDraft}
                sx={{
                  minWidth: '104px',
                  height: '36px',
                  color: theme.primary,
                  borderColor: theme.primary,
                  borderRadius: '11px',
                  fontSize: '13px',
                  fontWeight: 500,
                  textTransform: 'none',
                }}
              >
                {isEditMode ? 'อัปเดตร่าง' : 'บันทึกร่าง'}
              </Button>

            </Box>
          </Box>

          <Box
            sx={{
              padding: {
                xs:
                  '40px 20px 26px',

                sm:
                  '48px 28px 30px',
              },

              display:
                'grid',

              gridTemplateColumns: {
                xs:
                  '1fr',

                md:
                  'repeat(2, minmax(0, 1fr))',
              },

              columnGap:
                '24px',

              rowGap:
                '16px',
            }}
          >
            <FormControl
              fullWidth
              required
              error={
                Boolean(
                  errors.leaveTypeId,
                )
              }
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },
              }}
            >
              <InputLabel id="leave-type-label">
                ประเภทการลา
              </InputLabel>

              <Select
                labelId="leave-type-label"
                value={
                  formData.leaveTypeId
                }
                label="ประเภทการลา"
                onChange={(
                  event,
                ) =>
                  handleLeaveTypeChange(
                    event.target
                      .value,
                  )
                }
                sx={{
                  borderRadius:
                    '11px',
                }}
              >
                {calculatedLeaveTypes.length >
                0 ? (
                  calculatedLeaveTypes.map(
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
                        disabled={
                          !leaveType
                            .isSelectable
                        }
                      >
                        {leaveType.name}{' '}

                        {leaveType.isSelectable
                          ? `— ยื่นเพิ่มได้ ${formatDays(
                              leaveType.availableDays,
                            )} วัน`
                          : '— ปิดใช้งาน (กรุณาเลือกประเภทอื่น)'}
                      </MenuItem>
                    ),
                  )
                ) : (
                  <MenuItem
                    disabled
                    value=""
                  >
                    ไม่มีประเภทการลาที่เปิดใช้งาน
                  </MenuItem>
                )}
              </Select>

              <FormHelperText>
                {errors.leaveTypeId ||
                  (
                    activeLeaveTypes.length >
                    0
                      ? `สิทธิ์ที่ยื่นเพิ่มได้ ปี ${entitlementYear}`
                      : 'HR ยังไม่ได้เปิดใช้งานประเภทการลา'
                  )}
              </FormHelperText>
            </FormControl>

            <ThaiDateField
              label="วันที่เริ่มลา"
              minDate={minimumStartDate}
              holidaysByDate={activeHolidayByDate}
              disabled={dateSelectionDisabled}
              value={
                formData.startDate
              }
              onChange={(
                value,
              ) =>
                handleStartDateChange(
                  value,
                )
              }
              error={
                Boolean(
                  errors.startDate,
                )
              }
              helperText={
                errors.startDate || (dateSelectionDisabled ? 'กรุณาเลือกประเภทการลาก่อน' : '')
              }
            />

            <ThaiDateField
              label="วันที่สิ้นสุด"
              minDate={formData.startDate || minimumStartDate}
              holidaysByDate={activeHolidayByDate}
              disabled={dateSelectionDisabled}
              value={
                formData.endDate
              }
              onChange={(
                value,
              ) =>
                handleInputChange(
                  'endDate',
                  value,
                )
              }
              error={
                Boolean(
                  errors.endDate,
                )
              }
              helperText={
                errors.endDate || (dateSelectionDisabled ? 'กรุณาเลือกประเภทการลาก่อน' : '')
              }
            />

            {formData.startDate &&
              formData.endDate && (
              <Box
                sx={{
                  gridColumn: {
                    xs: 'auto',
                    md: '1 / -1',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '6px',
                  padding: '10px 12px',
                  color: '#334155',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '9px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  ใช้สิทธิ์ {formatDays(requestedDays)} วันทำงาน
                </Typography>

                {(workingDaySummary.weekendDays > 0 ||
                  workingDaySummary.holidayDays > 0) && (
                  <Typography
                    sx={{
                      color: '#64748B',
                      fontSize: '12px',
                    }}
                  >
                    • ไม่นับวันหยุด{' '}
                    {formatDays(
                      workingDaySummary.weekendDays +
                        workingDaySummary.holidayDays,
                    )}{' '}
                    วัน
                  </Typography>
                )}

                {selectedLeaveType && (
                  <Typography
                    sx={{
                      marginLeft: { sm: 'auto' },
                      color: theme.primary,
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    ยื่นเพิ่มได้หลังคำขอนี้{' '}
                    {formatDays(
                      Math.max(
                        0,
                        selectedLeaveType.availableDays -
                          requestedDays,
                      ),
                    )}{' '}
                    วัน
                  </Typography>
                )}
              </Box>
            )}

            {policyErrors.length >
              0 && (
              <Alert
                severity="error"
                sx={{
                  gridColumn: {
                    xs:
                      'auto',

                    md:
                      '1 / -1',
                  },

                  borderRadius:
                    '16px',
                }}
              >
                {policyErrors.map(
                  (
                    errorMessage,
                  ) => (
                    <Typography
                      key={
                        errorMessage
                      }
                      sx={{
                        fontSize:
                          '13px',

                        lineHeight:
                          1.7,
                      }}
                    >
                      •{' '}
                      {errorMessage}
                    </Typography>
                  ),
                )}
              </Alert>
            )}

            {workingDaySummary
              .excludedDates
              .some((item) => item.reason !== 'วันหยุดสุดสัปดาห์') && (
              <Alert
                severity="info"
                sx={{
                  gridColumn: {
                    xs:
                      'auto',

                    md:
                      '1 / -1',
                  },

                  borderRadius:
                    '16px',
                }}
              >
                <Typography
                  sx={{
                    fontSize:
                      '13px',

                    fontWeight:
                      700,
                  }}
                >
                  วันหยุดในช่วงที่เลือก
                </Typography>

                <Typography
                  sx={{
                    fontSize:
                      '12px',

                    lineHeight:
                      1.7,

                    marginTop:
                      '4px',
                  }}
                >
                  {workingDaySummary
                    .excludedDates
                    .filter((item) => item.reason !== 'วันหยุดสุดสัปดาห์')
                    .map(
                      (
                        item,
                      ) =>
                        `${formatDisplayDate(item.date)} (${item.reason})`,
                    )
                    .join(
                      ', ',
                    )}
                </Typography>
              </Alert>
            )}

            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              maxRows={6}
              label="เหตุผลการลา"
              placeholder="กรอกเหตุผลการลา"
              value={
                formData.reason
              }
              onChange={(
                event,
              ) =>
                handleInputChange(
                  'reason',

                  event.target
                    .value,
                )
              }
              error={
                Boolean(
                  errors.reason,
                )
              }
              helperText={
                errors.reason ||
                `${formData.reason.length}/500 ตัวอักษร`
              }
              slotProps={{
                htmlInput: {
                  maxLength:
                    500,
                },
              }}
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },

                '& .MuiOutlinedInput-root':
                  {
                    borderRadius:
                      '11px',
                  },
              }}
            />

            <Box
              sx={{
                gridColumn: {
                  xs:
                    'auto',

                  md:
                    '1 / -1',
                },

                paddingTop: '16px',

                marginTop: '2px',

                borderTop: 0,
              }}
            >
              <Typography
                sx={{
                  color:
                    '#111827',

                  fontSize:
                    '14px',

                fontWeight:
                    600,
                }}
              >
                ไฟล์แนบ
                {attachmentRequired
                  ? ' *'
                  : ''}
              </Typography>

              <Typography
                sx={{
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
                {getAttachmentRuleText(selectedLeaveType)
                  ? `${getAttachmentRuleText(selectedLeaveType)} • `
                  : ''}
                รองรับ PDF, JPG, JPEG และ PNG
                ขนาดไม่เกิน 10 MB ต่อไฟล์
              </Typography>

              <Button
                component="label"
                variant="outlined"
                sx={{
                  height:
                  '40px',

                  marginTop:
                  '10px',

                  padding:
                    '0 18px',

                  color:
                    theme.primary,

                  borderColor:
                    theme.primary,

                  borderRadius:
                    '11px',

                  fontSize:
                    '13px',

                  fontWeight:
                    500,

                  textTransform:
                    'none',
                }}
              >
                + เลือกไฟล์

                <input
                  hidden
                  multiple
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleAttachmentChange
                  }
                />
              </Button>

              {errors.attachments && (
                <Typography
                  sx={{
                    color:
                      '#D32F2F',

                    fontSize:
                      '12px',

                    marginTop:
                      '8px',
                  }}
                >
                  {
                    errors.attachments
                  }
                </Typography>
              )}

              {attachments.length >
                0 && (
                <Box
                  sx={{
                    display:
                      'flex',

                    flexDirection:
                      'column',

                    gap:
                      '10px',

                    marginTop:
                      '16px',
                  }}
                >
                  {attachments.map(
                    (
                      attachment,
                      index,
                    ) => (
                      <Box
                        key={
                          attachment.id ||
                          `${attachment.name || attachment.fileName}-${attachment.size || attachment.fileSize}-${index}`
                        }
                        sx={{
                          padding:
                            '12px 14px',

                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'space-between',

                          gap:
                            '14px',

                          backgroundColor:
                            '#F9FAFB',

                          border:
                            '1px solid #E5E7EB',

                          borderRadius:
                            '11px',
                        }}
                      >
                        <Box
                          sx={{
                            minWidth:
                              0,
                          }}
                        >
                          <Typography
                            sx={{
                              color:
                                '#111827',

                              fontSize:
                                '13px',

                              fontWeight:
                                700,

                              overflow:
                                'hidden',

                              textOverflow:
                                'ellipsis',

                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {attachment.name ||
                              attachment.fileName}
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
                            {formatFileSize(
                              attachment.size ||
                                attachment.fileSize,
                            )}
                          </Typography>
                        </Box>

                        <Button
                          type="button"
                          onClick={() =>
                            handleRemoveAttachment(
                              attachment,
                            )
                          }
                          sx={{
                            color:
                              '#DC2626',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,

                            textTransform:
                              'none',
                          }}
                        >
                          ลบ
                        </Button>
                      </Box>
                    ),
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              padding: { xs: '16px 18px', sm: '18px 28px' },
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              borderTop: 0,
              backgroundColor: 'transparent',
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={isEditMode ? handleReset : () => navigate(backPath)}
              sx={{
                minWidth: '100px',
                height: '44px',
                color: '#374151',
                borderColor: '#D1D5DB',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'none',
              }}
            >
              {isEditMode ? 'คืนค่าร่าง' : 'ยกเลิก'}
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={handleSaveDraft}
              sx={{
                minWidth: '112px',
                height: '44px',
                color: theme.primary,
                borderColor: theme.border,
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'none',
              }}
            >
              {isEditMode ? 'อัปเดตร่าง' : 'บันทึกร่าง'}
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth: '130px',
                height: '44px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '11px',
                fontSize: '13px',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1D4ED8',
                  boxShadow: 'none',
                },
              }}
            >
              {isEditMode ? 'ส่งร่างที่แก้ไข' : 'ส่งคำขอ'}
            </Button>
          </Box>

        </Paper>

        <Paper
          elevation={0}
          sx={{
            display: 'none',
            padding: {
              xs:
                '18px',

              sm:
                '20px',
            },

            backgroundColor:
              '#FFFFFF',

            border:
              '1px solid #E5E7EB',

            borderRadius:
              '20px',
            boxShadow:
              '0 4px 16px rgba(15, 23, 42, 0.04)',
            position: { md: 'sticky' },
            top: { md: '20px' },
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
            สรุปคำขอลา
          </Typography>

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
                '10px',

              marginTop:
                '16px',
            }}
          >
            {summaryItems.map(
              (
                [
                  label,
                  value,
                ],
              ) => {
                const isDateRange =
                  label ===
                  'ช่วงวันที่ลา';

                return (
                  <Box
                    key={
                      label
                    }
                    sx={{
                      minWidth:
                        0,

                      padding:
                        '10px 12px',

                      backgroundColor:
                        '#F8FAFC',

                      border:
                        '1px solid #E5E7EB',

                      borderRadius:
                        '10px',

                      gridColumn:
                        isDateRange
                          ? {
                              xs:
                                'auto',

                              sm:
                                '1 / -1',
                            }
                          : 'auto',
                    }}
                  >
                    <Typography
                      sx={{
                        color:
                          '#94A3B8',

                        fontSize:
                          '11px',

                        fontWeight:
                          700,
                      }}
                    >
                      {label}
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#111827',

                        fontSize:
                          '13px',

                        fontWeight:
                          700,

                        lineHeight:
                          1.45,

                        marginTop:
                          '3px',

                        wordBreak:
                          isDateRange
                            ? 'normal'
                            : 'break-word',

                        whiteSpace:
                          isDateRange
                            ? {
                                xs:
                                  'normal',

                                sm:
                                  'nowrap',
                              }
                            : 'normal',
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                );
              },
            )}
          </Box>

          <Box
            sx={{
              paddingTop:
                '14px',

              marginTop:
                '14px',

              borderTop:
                '1px solid #E5E7EB',
            }}
          >
            <Chip
              label={
                attachmentRequired
                  ? 'ต้องแนบไฟล์'
                  : 'ไม่บังคับแนบไฟล์'
              }
              size="small"
              sx={{
                backgroundColor:
                  attachmentRequired
                    ? '#FEF2F2'
                    : '#ECFDF5',

                color:
                  attachmentRequired
                    ? '#B91C1C'
                    : '#047857',

                borderRadius:
                  '999px',

                fontSize:
                  '11px',

                fontWeight:
                  700,
              }}
            />
          </Box>
        </Paper>

        <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>ยืนยันการส่งคำขอลา</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: '14px' }}>
              {summaryItems.map(([label, value]) => (
                <Box key={label} sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700 }}>{label === 'สิทธิ์คงเหลือ' ? 'สิทธิ์คงเหลือ' : label}</Typography>
                  <Typography sx={{ color: '#0F172A', fontSize: '14px', fontWeight: 700, marginTop: '3px' }}>{value}</Typography>
                </Box>
              ))}
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}><Typography sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700 }}>เหตุผล</Typography><Typography sx={{ color: '#0F172A', fontSize: '14px', marginTop: '3px', whiteSpace: 'pre-wrap' }}>{formData.reason.trim()}</Typography></Box>
              <Box sx={{ gridColumn: { sm: '1 / -1' } }}><Typography sx={{ color: '#94A3B8', fontSize: '11px', fontWeight: 700 }}>เอกสารแนบ</Typography><Typography sx={{ color: '#0F172A', fontSize: '14px', marginTop: '3px' }}>{attachments.length ? attachments.map((item) => item.name || item.fileName).join(', ') : 'ไม่มี'}</Typography></Box>
              {selectedLeaveType && workingDaySummary.workingDays > 0 ? <Box sx={{ gridColumn: { sm: '1 / -1' }, padding: '12px 14px', backgroundColor: '#F8FAFC', borderRadius: '10px' }}><Typography sx={{ color: '#64748B', fontSize: '11px', fontWeight: 700 }}>ยื่นเพิ่มได้หลังส่งคำขอนี้</Typography><Typography sx={{ color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>{formatDays(Math.max(0, selectedLeaveType.availableDays - workingDaySummary.workingDays))} วัน</Typography></Box> : null}
            </Box>
          </DialogContent>
          <DialogActions sx={{ padding: '14px 20px' }}><Button variant="outlined" color="secondary" onClick={() => setConfirmationOpen(false)}>กลับไปแก้ไข</Button><Button variant="contained" onClick={confirmSubmit}>ยืนยันส่งคำขอ</Button></DialogActions>
        </Dialog>
      </Box>
      </Box>
    </LayoutComponent>
  );
}

export default RoleCreateLeaveRequestPage;
