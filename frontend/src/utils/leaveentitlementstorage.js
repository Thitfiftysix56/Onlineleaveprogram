const LEAVE_ENTITLEMENT_STORAGE_KEY =
  'online_leave_approval_entitlements';

const currentYear =
  new Date().getFullYear();

const defaultEntitlements = [
  {
    id: 1,
    role: 'employee',
    leaveTypeId: 1,
    leaveType: 'Annual Leave',
    year: currentYear,
    totalDays: 10,
    usedDays: 0,
  },
  {
    id: 2,
    role: 'employee',
    leaveTypeId: 2,
    leaveType: 'Sick Leave',
    year: currentYear,
    totalDays: 30,
    usedDays: 4,
  },
  {
    id: 3,
    role: 'employee',
    leaveTypeId: 3,
    leaveType: 'Personal Leave',
    year: currentYear,
    totalDays: 5,
    usedDays: 0,
  },

  {
    id: 4,
    role: 'supervisor',
    leaveTypeId: 1,
    leaveType: 'Annual Leave',
    year: currentYear,
    totalDays: 10,
    usedDays: 0,
  },
  {
    id: 5,
    role: 'supervisor',
    leaveTypeId: 2,
    leaveType: 'Sick Leave',
    year: currentYear,
    totalDays: 30,
    usedDays: 0,
  },
  {
    id: 6,
    role: 'supervisor',
    leaveTypeId: 3,
    leaveType: 'Personal Leave',
    year: currentYear,
    totalDays: 5,
    usedDays: 0,
  },

  {
    id: 7,
    role: 'hr',
    leaveTypeId: 1,
    leaveType: 'Annual Leave',
    year: currentYear,
    totalDays: 10,
    usedDays: 0,
  },
  {
    id: 8,
    role: 'hr',
    leaveTypeId: 2,
    leaveType: 'Sick Leave',
    year: currentYear,
    totalDays: 30,
    usedDays: 0,
  },
  {
    id: 9,
    role: 'hr',
    leaveTypeId: 3,
    leaveType: 'Personal Leave',
    year: currentYear,
    totalDays: 5,
    usedDays: 0,
  },

  {
    id: 10,
    role: 'admin',
    leaveTypeId: 1,
    leaveType: 'Annual Leave',
    year: currentYear,
    totalDays: 10,
    usedDays: 0,
  },
  {
    id: 11,
    role: 'admin',
    leaveTypeId: 2,
    leaveType: 'Sick Leave',
    year: currentYear,
    totalDays: 30,
    usedDays: 0,
  },
  {
    id: 12,
    role: 'admin',
    leaveTypeId: 3,
    leaveType: 'Personal Leave',
    year: currentYear,
    totalDays: 5,
    usedDays: 0,
  },
];

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const cloneData = (data) =>
  JSON.parse(JSON.stringify(data));

const normalizeRole = (role) =>
  String(role || 'employee')
    .trim()
    .toLowerCase();

const normalizeNumber = (value) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
};

const normalizeEntitlement = (
  entitlement,
) => {
  const totalDays = Math.max(
    normalizeNumber(
      entitlement.totalDays ??
        entitlement.total_days,
    ),
    0,
  );

  const usedDays = Math.min(
    Math.max(
      normalizeNumber(
        entitlement.usedDays ??
          entitlement.used_days,
      ),
      0,
    ),
    totalDays,
  );

  return {
    ...entitlement,

    id: Number(
      entitlement.id ??
        entitlement.entitlementId ??
        entitlement.entitlement_id,
    ),

    role: normalizeRole(
      entitlement.role,
    ),

    leaveTypeId: Number(
      entitlement.leaveTypeId ??
        entitlement.leave_type_id,
    ),

    leaveType:
      entitlement.leaveType ||
      entitlement.leave_type ||
      entitlement.leaveTypeName ||
      entitlement.leave_type_name ||
      'Leave',

    year: Number(
      entitlement.year ||
        currentYear,
    ),

    totalDays,

    usedDays,

    remainingDays: Math.max(
      totalDays - usedDays,
      0,
    ),

    updatedAt:
      entitlement.updatedAt ||
      entitlement.updated_at ||
      new Date().toISOString(),
  };
};

const sortEntitlements = (
  entitlements,
) =>
  [...entitlements].sort(
    (
      firstEntitlement,
      secondEntitlement,
    ) => {
      if (
        firstEntitlement.role !==
        secondEntitlement.role
      ) {
        return firstEntitlement.role
          .localeCompare(
            secondEntitlement.role,
          );
      }

      if (
        firstEntitlement.year !==
        secondEntitlement.year
      ) {
        return (
          secondEntitlement.year -
          firstEntitlement.year
        );
      }

      return (
        firstEntitlement.leaveTypeId -
        secondEntitlement.leaveTypeId
      );
    },
  );

export const initializeLeaveEntitlements =
  () => {
    if (!isBrowserAvailable()) {
      return sortEntitlements(
        cloneData(
          defaultEntitlements,
        ).map(
          normalizeEntitlement,
        ),
      );
    }

    const storedEntitlements =
      window.localStorage.getItem(
        LEAVE_ENTITLEMENT_STORAGE_KEY,
      );

    if (storedEntitlements) {
      try {
        const parsedEntitlements =
          JSON.parse(
            storedEntitlements,
          );

        if (
          Array.isArray(
            parsedEntitlements,
          )
        ) {
          return sortEntitlements(
            parsedEntitlements.map(
              normalizeEntitlement,
            ),
          );
        }
      } catch (error) {
        console.error(
          'Unable to read leave entitlements:',
          error,
        );
      }
    }

    const initialEntitlements =
      cloneData(
        defaultEntitlements,
      ).map(
        normalizeEntitlement,
      );

    window.localStorage.setItem(
      LEAVE_ENTITLEMENT_STORAGE_KEY,
      JSON.stringify(
        initialEntitlements,
      ),
    );

    return sortEntitlements(
      initialEntitlements,
    );
  };

export const saveLeaveEntitlements = (
  entitlements,
) => {
  const normalizedEntitlements =
    sortEntitlements(
      entitlements.map(
        normalizeEntitlement,
      ),
    );

  if (isBrowserAvailable()) {
    window.localStorage.setItem(
      LEAVE_ENTITLEMENT_STORAGE_KEY,
      JSON.stringify(
        normalizedEntitlements,
      ),
    );
  }

  return normalizedEntitlements;
};

export const getLeaveEntitlements = ({
  role,
  year,
} = {}) => {
  const normalizedRole =
    role
      ? normalizeRole(role)
      : null;

  const numericYear =
    year
      ? Number(year)
      : null;

  return initializeLeaveEntitlements().filter(
    (entitlement) => {
      const matchesRole =
        !normalizedRole ||
        entitlement.role ===
          normalizedRole;

      const matchesYear =
        !numericYear ||
        entitlement.year ===
          numericYear;

      return (
        matchesRole &&
        matchesYear
      );
    },
  );
};

export const getLeaveEntitlement = ({
  role = 'employee',
  leaveTypeId,
  year = currentYear,
}) => {
  const normalizedRole =
    normalizeRole(role);

  const numericLeaveTypeId =
    Number(leaveTypeId);

  const numericYear =
    Number(year);

  return (
    initializeLeaveEntitlements().find(
      (entitlement) =>
        entitlement.role ===
          normalizedRole &&
        entitlement.leaveTypeId ===
          numericLeaveTypeId &&
        entitlement.year ===
          numericYear,
    ) || null
  );
};

export const getNextLeaveEntitlementId =
  () => {
    const entitlements =
      initializeLeaveEntitlements();

    if (entitlements.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...entitlements.map(
          (entitlement) =>
            Number(
              entitlement.id,
            ) || 0,
        ),
      ) + 1
    );
  };

export const upsertLeaveEntitlement = ({
  id = null,
  role = 'employee',
  leaveTypeId,
  leaveType,
  year = currentYear,
  totalDays,
  usedDays = 0,
}) => {
  const entitlements =
    initializeLeaveEntitlements();

  const normalizedRole =
    normalizeRole(role);

  const numericLeaveTypeId =
    Number(leaveTypeId);

  const numericYear =
    Number(year);

  const existingEntitlement =
    entitlements.find(
      (entitlement) =>
        entitlement.role ===
          normalizedRole &&
        entitlement.leaveTypeId ===
          numericLeaveTypeId &&
        entitlement.year ===
          numericYear,
    );

  const updatedEntitlement =
    normalizeEntitlement({
      ...existingEntitlement,

      id:
        existingEntitlement?.id ||
        id ||
        getNextLeaveEntitlementId(),

      role: normalizedRole,

      leaveTypeId:
        numericLeaveTypeId,

      leaveType:
        leaveType ||
        existingEntitlement
          ?.leaveType ||
        'Leave',

      year: numericYear,

      totalDays,

      usedDays,

      updatedAt:
        new Date().toISOString(),
    });

  const updatedEntitlements =
    existingEntitlement
      ? entitlements.map(
          (entitlement) =>
            entitlement.id ===
            existingEntitlement.id
              ? updatedEntitlement
              : entitlement,
        )
      : [
          ...entitlements,
          updatedEntitlement,
        ];

  saveLeaveEntitlements(
    updatedEntitlements,
  );

  return updatedEntitlement;
};

export const adjustUsedLeaveDays = ({
  role = 'employee',
  leaveTypeId,
  year = currentYear,
  amount,
}) => {
  const entitlement =
    getLeaveEntitlement({
      role,
      leaveTypeId,
      year,
    });

  if (!entitlement) {
    return null;
  }

  const numericAmount =
    normalizeNumber(amount);

  const nextUsedDays =
    entitlement.usedDays +
    numericAmount;

  if (
    nextUsedDays < 0 ||
    nextUsedDays >
      entitlement.totalDays
  ) {
    return null;
  }

  return upsertLeaveEntitlement({
    ...entitlement,

    usedDays: nextUsedDays,
  });
};

export const setUsedLeaveDays = ({
  role = 'employee',
  leaveTypeId,
  year = currentYear,
  usedDays,
}) => {
  const entitlement =
    getLeaveEntitlement({
      role,
      leaveTypeId,
      year,
    });

  if (!entitlement) {
    return null;
  }

  return upsertLeaveEntitlement({
    ...entitlement,

    usedDays,
  });
};

export const getRemainingEntitlementDays =
  ({
    role = 'employee',
    leaveTypeId,
    year = currentYear,
  }) => {
    const entitlement =
      getLeaveEntitlement({
        role,
        leaveTypeId,
        year,
      });

    return entitlement
      ? entitlement.remainingDays
      : 0;
  };

export const resetLeaveEntitlementStorage =
  () => {
    const initialEntitlements =
      cloneData(
        defaultEntitlements,
      ).map(
        normalizeEntitlement,
      );

    if (isBrowserAvailable()) {
      window.localStorage.setItem(
        LEAVE_ENTITLEMENT_STORAGE_KEY,
        JSON.stringify(
          initialEntitlements,
        ),
      );
    }

    return sortEntitlements(
      initialEntitlements,
    );
  };

export const leaveEntitlementStorageKey =
  LEAVE_ENTITLEMENT_STORAGE_KEY;