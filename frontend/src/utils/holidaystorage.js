const HOLIDAY_STORAGE_KEY =
  'online_leave_approval_holidays';

const LEGACY_HOLIDAY_STORAGE_KEYS = [
  'online_leave_approval_holiday_management',
  'online_leave_approval_system_holidays',
  'holidays',
];

const defaultHolidays = [
  {
    id: 1,
    holidayDate: '2026-01-01',
    holidayName: "New Year's Day",
    year: 2026,
    isActive: true,
  },
  {
    id: 2,
    holidayDate: '2026-04-13',
    holidayName: 'Songkran Festival Day 1',
    year: 2026,
    isActive: true,
  },
  {
    id: 3,
    holidayDate: '2026-04-14',
    holidayName: 'Songkran Festival Day 2',
    year: 2026,
    isActive: true,
  },
  {
    id: 4,
    holidayDate: '2026-04-15',
    holidayName: 'Songkran Festival Day 3',
    year: 2026,
    isActive: true,
  },
  {
    id: 5,
    holidayDate: '2026-05-01',
    holidayName: 'National Labour Day',
    year: 2026,
    isActive: true,
  },
  {
    id: 6,
    holidayDate: '2026-12-10',
    holidayName: 'Constitution Day',
    year: 2026,
    isActive: true,
  },
  {
    id: 7,
    holidayDate: '2026-12-31',
    holidayName: "New Year's Eve",
    year: 2026,
    isActive: true,
  },
];

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const cloneData = (data) =>
  JSON.parse(JSON.stringify(data));

const normalizeBoolean = (
  value,
  fallback = true,
) => {
  if (
    value === true ||
    value === 1 ||
    value === '1'
  ) {
    return true;
  }

  if (
    value === false ||
    value === 0 ||
    value === '0'
  ) {
    return false;
  }

  const normalizedValue = String(
    value ?? '',
  )
    .trim()
    .toLowerCase();

  if (
    normalizedValue === 'active' ||
    normalizedValue === 'enabled'
  ) {
    return true;
  }

  if (
    normalizedValue === 'inactive' ||
    normalizedValue === 'disabled'
  ) {
    return false;
  }

  return fallback;
};

const normalizeDate = (value) => {
  const rawValue = String(
    value || '',
  ).trim();

  if (!rawValue) {
    return '';
  }

  const directDateMatch =
    rawValue.match(
      /^\d{4}-\d{2}-\d{2}/,
    );

  if (directDateMatch) {
    return directDateMatch[0];
  }

  const parsedDate =
    new Date(rawValue);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return '';
  }

  return parsedDate
    .toISOString()
    .slice(0, 10);
};

const normalizeHoliday = (
  holiday,
  fallbackId = null,
) => {
  const holidayDate =
    normalizeDate(
      holiday.holidayDate ??
        holiday.holiday_date ??
        holiday.date,
    );

  const detectedYear =
    holidayDate
      ? Number(
          holidayDate.slice(0, 4),
        )
      : new Date().getFullYear();

  return {
    ...holiday,

    id: Number(
      holiday.id ??
        holiday.holidayId ??
        holiday.holiday_id ??
        fallbackId,
    ),

    holidayDate,

    holidayName:
      holiday.holidayName ||
      holiday.holiday_name ||
      holiday.name ||
      'Organization Holiday',

    year: Number(
      holiday.year ||
        detectedYear,
    ),

    isActive:
      normalizeBoolean(
        holiday.isActive ??
          holiday.is_active ??
          holiday.status,
        true,
      ),

    createdAt:
      holiday.createdAt ||
      holiday.created_at ||
      new Date().toISOString(),

    updatedAt:
      holiday.updatedAt ||
      holiday.updated_at ||
      holiday.createdAt ||
      holiday.created_at ||
      new Date().toISOString(),
  };
};

const sortHolidays = (holidays) =>
  [...holidays].sort(
    (
      firstHoliday,
      secondHoliday,
    ) =>
      String(
        firstHoliday.holidayDate,
      ).localeCompare(
        String(
          secondHoliday.holidayDate,
        ),
      ),
  );

const extractHolidayArray = (
  value,
) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    const possibleArrays = [
      value.holidays,
      value.data,
      value.items,
      value.records,
      value.results,
    ];

    const selectedArray =
      possibleArrays.find(
        Array.isArray,
      );

    return selectedArray || [];
  }

  return [];
};

const readStoredHolidays = (
  storageKey,
) => {
  if (!isBrowserAvailable()) {
    return null;
  }

  const storedValue =
    window.localStorage.getItem(
      storageKey,
    );

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue =
      JSON.parse(storedValue);

    const holidayArray =
      extractHolidayArray(
        parsedValue,
      );

    return holidayArray.length > 0
      ? holidayArray
      : null;
  } catch (error) {
    console.error(
      `Unable to read holidays from ${storageKey}:`,
      error,
    );

    return null;
  }
};

export const saveHolidays = (
  holidays,
) => {
  const normalizedHolidays =
    sortHolidays(
      holidays
        .map(
          (
            holiday,
            index,
          ) =>
            normalizeHoliday(
              holiday,
              index + 1,
            ),
        )
        .filter(
          (holiday) =>
            holiday.holidayDate,
        ),
    );

  if (isBrowserAvailable()) {
    window.localStorage.setItem(
      HOLIDAY_STORAGE_KEY,
      JSON.stringify(
        normalizedHolidays,
      ),
    );
  }

  return normalizedHolidays;
};

export const initializeHolidays =
  () => {
    if (!isBrowserAvailable()) {
      return sortHolidays(
        cloneData(
          defaultHolidays,
        ).map(
          (
            holiday,
            index,
          ) =>
            normalizeHoliday(
              holiday,
              index + 1,
            ),
        ),
      );
    }

    const canonicalHolidays =
      readStoredHolidays(
        HOLIDAY_STORAGE_KEY,
      );

    if (canonicalHolidays) {
      return sortHolidays(
        canonicalHolidays.map(
          (
            holiday,
            index,
          ) =>
            normalizeHoliday(
              holiday,
              index + 1,
            ),
        ),
      );
    }

    for (
      const legacyStorageKey of
      LEGACY_HOLIDAY_STORAGE_KEYS
    ) {
      const legacyHolidays =
        readStoredHolidays(
          legacyStorageKey,
        );

      if (legacyHolidays) {
        return saveHolidays(
          legacyHolidays,
        );
      }
    }

    const initialHolidays =
      cloneData(
        defaultHolidays,
      ).map(
        (
          holiday,
          index,
        ) =>
          normalizeHoliday(
            holiday,
            index + 1,
          ),
      );

    window.localStorage.setItem(
      HOLIDAY_STORAGE_KEY,
      JSON.stringify(
        initialHolidays,
      ),
    );

    return sortHolidays(
      initialHolidays,
    );
  };

export const getHolidays = ({
  year = null,
  activeOnly = false,
} = {}) => {
  const numericYear =
    year !== null &&
    year !== undefined &&
    year !== ''
      ? Number(year)
      : null;

  return initializeHolidays().filter(
    (holiday) => {
      const matchesYear =
        !numericYear ||
        holiday.year ===
          numericYear;

      const matchesStatus =
        !activeOnly ||
        holiday.isActive;

      return (
        matchesYear &&
        matchesStatus
      );
    },
  );
};

export const getActiveHolidays = ({
  year = null,
} = {}) =>
  getHolidays({
    year,
    activeOnly: true,
  });

export const getActiveHolidayDates =
  ({
    year = null,
  } = {}) =>
    getActiveHolidays({
      year,
    })
      .map(
        (holiday) =>
          holiday.holidayDate,
      )
      .filter(Boolean);

export const getHolidayById = (
  holidayId,
) => {
  const numericHolidayId =
    Number(holidayId);

  return (
    initializeHolidays().find(
      (holiday) =>
        Number(holiday.id) ===
        numericHolidayId,
    ) || null
  );
};

export const getHolidayByDate = (
  holidayDate,
) => {
  const normalizedHolidayDate =
    normalizeDate(holidayDate);

  return (
    initializeHolidays().find(
      (holiday) =>
        holiday.holidayDate ===
        normalizedHolidayDate,
    ) || null
  );
};

export const getNextHolidayId =
  () => {
    const holidays =
      initializeHolidays();

    if (holidays.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...holidays.map(
          (holiday) =>
            Number(holiday.id) ||
            0,
        ),
      ) + 1
    );
  };

export const saveHoliday = ({
  id = null,
  holidayDate,
  holidayName,
  isActive = true,
}) => {
  const normalizedHolidayDate =
    normalizeDate(holidayDate);

  if (!normalizedHolidayDate) {
    return null;
  }

  const holidays =
    initializeHolidays();

  const numericHolidayId =
    id ? Number(id) : null;

  const existingHoliday =
    holidays.find(
      (holiday) =>
        numericHolidayId
          ? Number(holiday.id) ===
            numericHolidayId
          : holiday.holidayDate ===
            normalizedHolidayDate,
    );

  const now =
    new Date().toISOString();

  const savedHoliday =
    normalizeHoliday({
      ...existingHoliday,

      id:
        existingHoliday?.id ||
        numericHolidayId ||
        getNextHolidayId(),

      holidayDate:
        normalizedHolidayDate,

      holidayName:
        String(
          holidayName ||
            existingHoliday
              ?.holidayName ||
            'Organization Holiday',
        ).trim(),

      isActive,

      createdAt:
        existingHoliday
          ?.createdAt || now,

      updatedAt: now,
    });

  const updatedHolidays =
    existingHoliday
      ? holidays.map(
          (holiday) =>
            Number(holiday.id) ===
            Number(
              existingHoliday.id,
            )
              ? savedHoliday
              : holiday,
        )
      : [
          ...holidays,
          savedHoliday,
        ];

  saveHolidays(
    updatedHolidays,
  );

  return savedHoliday;
};

export const setHolidayStatus = (
  holidayId,
  isActive,
) => {
  const selectedHoliday =
    getHolidayById(holidayId);

  if (!selectedHoliday) {
    return null;
  }

  return saveHoliday({
    ...selectedHoliday,
    isActive,
  });
};

export const deleteHoliday = (
  holidayId,
) => {
  const numericHolidayId =
    Number(holidayId);

  const holidays =
    initializeHolidays();

  const holidayExists =
    holidays.some(
      (holiday) =>
        Number(holiday.id) ===
        numericHolidayId,
    );

  if (!holidayExists) {
    return false;
  }

  saveHolidays(
    holidays.filter(
      (holiday) =>
        Number(holiday.id) !==
        numericHolidayId,
    ),
  );

  return true;
};

export const isActiveHoliday = (
  dateValue,
) => {
  const normalizedDate =
    normalizeDate(dateValue);

  if (!normalizedDate) {
    return false;
  }

  return getActiveHolidayDates().includes(
    normalizedDate,
  );
};

export const resetHolidayStorage =
  () => {
    const initialHolidays =
      cloneData(
        defaultHolidays,
      ).map(
        (
          holiday,
          index,
        ) =>
          normalizeHoliday(
            holiday,
            index + 1,
          ),
      );

    if (isBrowserAvailable()) {
      window.localStorage.setItem(
        HOLIDAY_STORAGE_KEY,
        JSON.stringify(
          initialHolidays,
        ),
      );
    }

    return sortHolidays(
      initialHolidays,
    );
  };

export const holidayStorageKey =
  HOLIDAY_STORAGE_KEY;