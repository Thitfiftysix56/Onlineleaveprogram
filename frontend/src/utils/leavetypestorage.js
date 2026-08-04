const STORAGE_KEY =
  'online_leave_approval_leave_types';

const defaultLeaveTypes = [
  {
    id: 1,
    code: 'AL',
    name: 'Annual Leave',
    defaultDays: 10,
    minimumDays: 1,
    maximumDaysPerRequest: 5,
    attachmentRequired: false,
    attachmentRequiredAfterDays: null,
    status: 'Active',
    description:
      'Paid leave for vacation, personal travel or rest.',
  },
  {
    id: 2,
    code: 'SL',
    name: 'Sick Leave',
    defaultDays: 30,
    minimumDays: 1,
    maximumDaysPerRequest: 30,
    attachmentRequired: false,
    attachmentRequiredAfterDays: 3,
    status: 'Active',
    description:
      'Leave for illness, medical treatment or recovery.',
  },
  {
    id: 3,
    code: 'PL',
    name: 'Personal Leave',
    defaultDays: 5,
    minimumDays: 1,
    maximumDaysPerRequest: 3,
    attachmentRequired: false,
    attachmentRequiredAfterDays: null,
    status: 'Active',
    description:
      'Leave for necessary personal matters and appointments.',
  },
  {
    id: 4,
    code: 'ML',
    name: 'Maternity Leave',
    defaultDays: 98,
    minimumDays: 1,
    maximumDaysPerRequest: 98,
    attachmentRequired: true,
    attachmentRequiredAfterDays: null,
    status: 'Active',
    description:
      'Leave provided for pregnancy and childbirth.',
  },
  {
    id: 5,
    code: 'OL',
    name: 'Other Leave',
    defaultDays: 0,
    minimumDays: 1,
    maximumDaysPerRequest: 10,
    attachmentRequired: true,
    attachmentRequiredAfterDays: null,
    status: 'Inactive',
    description:
      'Other leave types requiring HR review and approval.',
  },
];

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const cloneData = (value) =>
  JSON.parse(JSON.stringify(value));

const toNumber = (
  value,
  fallback = 0,
) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : fallback;
};

const normalizeStatus = (value) =>
  String(value || '')
    .trim()
    .toLowerCase() === 'inactive'
    ? 'Inactive'
    : 'Active';

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  return ['true', '1', 'yes'].includes(
    String(value || '')
      .trim()
      .toLowerCase(),
  );
};

const normalizeLeaveType = (
  leaveType,
  index = 0,
) => {
  const id =
    Number(
      leaveType?.id ??
        leaveType?.leaveTypeId,
    ) ||
    index + 1;

  const attachmentRequired =
    normalizeBoolean(
      leaveType?.attachmentRequired ??
        leaveType?.requiresAttachment,
    );

  const rawThreshold =
    leaveType?.attachmentRequiredAfterDays;

  const attachmentRequiredAfterDays =
    attachmentRequired ||
    rawThreshold === null ||
    rawThreshold === '' ||
    rawThreshold === undefined
      ? null
      : Math.max(
          toNumber(rawThreshold),
          0,
        ) || null;

  const minimumDays = Math.max(
    toNumber(
      leaveType?.minimumDays,
      1,
    ),
    0.5,
  );

  const maximumDaysPerRequest =
    Math.max(
      toNumber(
        leaveType?.maximumDaysPerRequest,
        minimumDays,
      ),
      minimumDays,
    );

  const now = new Date().toISOString();

  return {
    id,

    code: String(
      leaveType?.code || `LT${id}`,
    )
      .trim()
      .toUpperCase(),

    name: String(
      leaveType?.name || 'Leave',
    ).trim(),

    defaultDays: Math.max(
      toNumber(leaveType?.defaultDays),
      0,
    ),

    minimumDays,

    maximumDaysPerRequest,

    attachmentRequired,

    requiresAttachment:
      attachmentRequired,

    attachmentRequiredAfterDays,

    status: normalizeStatus(
      leaveType?.status,
    ),

    isActive:
      normalizeStatus(
        leaveType?.status,
      ) === 'Active',

    description: String(
      leaveType?.description || '',
    ).trim(),

    createdAt:
      leaveType?.createdAt || now,

    updatedAt:
      leaveType?.updatedAt || now,
  };
};

const sortLeaveTypes = (leaveTypes) =>
  [...leaveTypes].sort(
    (firstItem, secondItem) =>
      Number(firstItem.id) -
      Number(secondItem.id),
  );

export const saveLeaveTypes = (
  leaveTypes,
) => {
  const normalizedLeaveTypes =
    sortLeaveTypes(
      (
        Array.isArray(leaveTypes)
          ? leaveTypes
          : []
      ).map(normalizeLeaveType),
    );

  if (isBrowserAvailable()) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalizedLeaveTypes,
      ),
    );
  }

  return normalizedLeaveTypes;
};

export const initializeLeaveTypes =
  () => {
    if (isBrowserAvailable()) {
      const storedValue =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (storedValue) {
        try {
          const parsedValue =
            JSON.parse(storedValue);

          if (Array.isArray(parsedValue)) {
            return saveLeaveTypes(
              parsedValue,
            );
          }
        } catch (error) {
          console.error(
            'Unable to read leave types:',
            error,
          );
        }
      }
    }

    return saveLeaveTypes(
      cloneData(defaultLeaveTypes),
    );
  };

export const getLeaveTypes = ({
  status,
} = {}) => {
  const leaveTypes =
    initializeLeaveTypes();

  if (!status) {
    return leaveTypes;
  }

  const selectedStatus =
    normalizeStatus(status);

  return leaveTypes.filter(
    (leaveType) =>
      leaveType.status ===
      selectedStatus,
  );
};

export const getActiveLeaveTypes = () =>
  getLeaveTypes({
    status: 'Active',
  });

export const getLeaveTypeById = (
  leaveTypeId,
) =>
  initializeLeaveTypes().find(
    (leaveType) =>
      Number(leaveType.id) ===
      Number(leaveTypeId),
  ) || null;

export const getNextLeaveTypeId = () => {
  const leaveTypes =
    initializeLeaveTypes();

  return leaveTypes.length === 0
    ? 1
    : Math.max(
        ...leaveTypes.map(
          (leaveType) =>
            Number(leaveType.id) || 0,
        ),
      ) + 1;
};

export const saveLeaveType = ({
  id = null,
  code,
  name,
  defaultDays,
  minimumDays,
  maximumDaysPerRequest,
  attachmentRequired = false,
  attachmentRequiredAfterDays = null,
  status = 'Active',
  description = '',
}) => {
  const leaveTypes =
    initializeLeaveTypes();

  const selectedId = id
    ? Number(id)
    : getNextLeaveTypeId();

  const normalizedCode = String(
    code || '',
  )
    .trim()
    .toUpperCase();

  const normalizedName = String(
    name || '',
  ).trim();

  const hasDuplicate =
    leaveTypes.some(
      (leaveType) =>
        Number(leaveType.id) !==
          selectedId &&
        (
          leaveType.code ===
            normalizedCode ||
          leaveType.name.toLowerCase() ===
            normalizedName.toLowerCase()
        ),
    );

  if (
    !normalizedCode ||
    !normalizedName ||
    hasDuplicate
  ) {
    return null;
  }

  const existingLeaveType =
    leaveTypes.find(
      (leaveType) =>
        Number(leaveType.id) ===
        selectedId,
    );

  const savedLeaveType =
    normalizeLeaveType({
      ...existingLeaveType,

      id: selectedId,

      code:
        normalizedCode,

      name:
        normalizedName,

      defaultDays,

      minimumDays,

      maximumDaysPerRequest,

      attachmentRequired,

      attachmentRequiredAfterDays,

      status,

      description,

      createdAt:
        existingLeaveType?.createdAt ||
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    });

  saveLeaveTypes(
    existingLeaveType
      ? leaveTypes.map(
          (leaveType) =>
            Number(leaveType.id) ===
            selectedId
              ? savedLeaveType
              : leaveType,
        )
      : [
          ...leaveTypes,
          savedLeaveType,
        ],
  );

  return savedLeaveType;
};

export const setLeaveTypeStatus = (
  leaveTypeId,
  status,
) => {
  const leaveType =
    getLeaveTypeById(leaveTypeId);

  return leaveType
    ? saveLeaveType({
        ...leaveType,
        status,
      })
    : null;
};

export const resetLeaveTypeStorage =
  () =>
    saveLeaveTypes(
      cloneData(defaultLeaveTypes),
    );

export const leaveTypeStorageKey =
  STORAGE_KEY;