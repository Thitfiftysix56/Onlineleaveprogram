const AUDIT_LOG_STORAGE_KEY =
  'online_leave_approval_audit_logs';

const defaultAuditLogs = [
  {
    id: 1,
    userId: 1,
    username: 'employee001',
    role: 'employee',
    action: 'login',
    tableName: 'users',
    recordId: 1,
    detail:
      'Employee user logged in successfully.',
    ipAddress: '127.0.0.1',
    createdAt: '2026-07-21T08:00:00',
  },
  {
    id: 2,
    userId: 1,
    username: 'employee001',
    role: 'employee',
    action: 'submit_leave_request',
    tableName: 'leave_requests',
    recordId: 2,
    detail:
      'Submitted leave request LR-20260720-0013.',
    ipAddress: '127.0.0.1',
    createdAt: '2026-07-20T14:05:00',
  },
  {
    id: 3,
    userId: 2,
    username: 'supervisor001',
    role: 'supervisor',
    action: 'approve_leave_request',
    tableName: 'leave_requests',
    recordId: 3,
    detail:
      'Approved leave request LR-20260715-0009.',
    ipAddress: '127.0.0.1',
    createdAt: '2026-07-15T11:30:00',
  },
];

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const cloneData = (data) =>
  JSON.parse(JSON.stringify(data));

const normalizeText = (
  value,
  fallback = '',
) => {
  const normalizedValue = String(
    value ?? '',
  ).trim();

  return normalizedValue || fallback;
};

const normalizeRole = (role) =>
  normalizeText(role, 'system')
    .toLowerCase();

const normalizeAuditLog = (
  auditLog,
) => ({
  id:
    Number(auditLog.id) || 0,

  userId:
    auditLog.userId !==
      undefined &&
    auditLog.userId !== null
      ? Number(auditLog.userId)
      : null,

  username:
    normalizeText(
      auditLog.username,
      'system',
    ),

  role:
    normalizeRole(
      auditLog.role,
    ),

  action:
    normalizeText(
      auditLog.action,
      'unknown_action',
    ).toLowerCase(),

  tableName:
    normalizeText(
      auditLog.tableName,
      '',
    ) || null,

  recordId:
    auditLog.recordId !==
      undefined &&
    auditLog.recordId !== null &&
    auditLog.recordId !== ''
      ? Number(auditLog.recordId)
      : null,

  detail:
    normalizeText(
      auditLog.detail,
      '',
    ),

  ipAddress:
    normalizeText(
      auditLog.ipAddress,
      '127.0.0.1',
    ),

  createdAt:
    auditLog.createdAt ||
    new Date().toISOString(),
});

const sortAuditLogs = (
  auditLogs,
) =>
  [...auditLogs].sort(
    (
      firstAuditLog,
      secondAuditLog,
    ) => {
      const firstDate =
        new Date(
          firstAuditLog.createdAt ||
            0,
        ).getTime();

      const secondDate =
        new Date(
          secondAuditLog.createdAt ||
            0,
        ).getTime();

      if (
        secondDate !== firstDate
      ) {
        return (
          secondDate - firstDate
        );
      }

      return (
        Number(
          secondAuditLog.id,
        ) -
        Number(
          firstAuditLog.id,
        )
      );
    },
  );

export const initializeAuditLogs =
  () => {
    if (!isBrowserAvailable()) {
      return sortAuditLogs(
        cloneData(
          defaultAuditLogs,
        ).map(
          normalizeAuditLog,
        ),
      );
    }

    const storedAuditLogs =
      window.localStorage.getItem(
        AUDIT_LOG_STORAGE_KEY,
      );

    if (storedAuditLogs) {
      try {
        const parsedAuditLogs =
          JSON.parse(
            storedAuditLogs,
          );

        if (
          Array.isArray(
            parsedAuditLogs,
          )
        ) {
          return sortAuditLogs(
            parsedAuditLogs.map(
              normalizeAuditLog,
            ),
          );
        }
      } catch (error) {
        console.error(
          'Unable to read audit logs:',
          error,
        );
      }
    }

    const initialAuditLogs =
      cloneData(
        defaultAuditLogs,
      ).map(
        normalizeAuditLog,
      );

    window.localStorage.setItem(
      AUDIT_LOG_STORAGE_KEY,
      JSON.stringify(
        initialAuditLogs,
      ),
    );

    return sortAuditLogs(
      initialAuditLogs,
    );
  };

export const saveAuditLogs = (
  auditLogs,
) => {
  const normalizedAuditLogs =
    sortAuditLogs(
      auditLogs.map(
        normalizeAuditLog,
      ),
    );

  if (isBrowserAvailable()) {
    window.localStorage.setItem(
      AUDIT_LOG_STORAGE_KEY,
      JSON.stringify(
        normalizedAuditLogs,
      ),
    );
  }

  return normalizedAuditLogs;
};

export const getAuditLogs = ({
  role,
  action,
  tableName,
  recordId,
} = {}) => {
  const normalizedRole =
    role
      ? normalizeRole(role)
      : null;

  const normalizedAction =
    action
      ? normalizeText(action)
          .toLowerCase()
      : null;

  const normalizedTableName =
    tableName
      ? normalizeText(tableName)
          .toLowerCase()
      : null;

  const numericRecordId =
    recordId !== undefined &&
    recordId !== null &&
    recordId !== ''
      ? Number(recordId)
      : null;

  return initializeAuditLogs().filter(
    (auditLog) => {
      const matchesRole =
        !normalizedRole ||
        auditLog.role ===
          normalizedRole;

      const matchesAction =
        !normalizedAction ||
        auditLog.action ===
          normalizedAction;

      const matchesTable =
        !normalizedTableName ||
        String(
          auditLog.tableName || '',
        ).toLowerCase() ===
          normalizedTableName;

      const matchesRecord =
        numericRecordId === null ||
        Number(
          auditLog.recordId,
        ) === numericRecordId;

      return (
        matchesRole &&
        matchesAction &&
        matchesTable &&
        matchesRecord
      );
    },
  );
};

export const getAuditLogById = (
  auditLogId,
) => {
  const numericAuditLogId =
    Number(auditLogId);

  if (
    !Number.isInteger(
      numericAuditLogId,
    ) ||
    numericAuditLogId <= 0
  ) {
    return null;
  }

  return (
    initializeAuditLogs().find(
      (auditLog) =>
        Number(auditLog.id) ===
        numericAuditLogId,
    ) || null
  );
};

export const getNextAuditLogId =
  () => {
    const auditLogs =
      initializeAuditLogs();

    if (auditLogs.length === 0) {
      return 1;
    }

    return (
      Math.max(
        ...auditLogs.map(
          (auditLog) =>
            Number(
              auditLog.id,
            ) || 0,
        ),
      ) + 1
    );
  };

export const createAuditLog = ({
  userId = null,
  username = 'system',
  role = 'system',
  action,
  tableName = null,
  recordId = null,
  detail = '',
  ipAddress = '127.0.0.1',
}) => {
  if (
    !normalizeText(action)
  ) {
    console.error(
      'Audit log action is required.',
    );

    return null;
  }

  const auditLogs =
    initializeAuditLogs();

  const newAuditLog =
    normalizeAuditLog({
      id: getNextAuditLogId(),

      userId,

      username,

      role,

      action,

      tableName,

      recordId,

      detail,

      ipAddress,

      createdAt:
        new Date().toISOString(),
    });

  saveAuditLogs([
    ...auditLogs,
    newAuditLog,
  ]);

  return newAuditLog;
};

export const createEmployeeAuditLog = ({
  action,
  recordId = null,
  detail = '',
  tableName =
    'leave_requests',
}) =>
  createAuditLog({
    userId: 1,

    username:
      'employee001',

    role: 'employee',

    action,

    tableName,

    recordId,

    detail,
  });

export const createSupervisorAuditLog =
  ({
    action,
    recordId = null,
    detail = '',
    tableName =
      'leave_requests',
  }) =>
    createAuditLog({
      userId: 2,

      username:
        'supervisor001',

      role: 'supervisor',

      action,

      tableName,

      recordId,

      detail,
    });

export const createHRAuditLog = ({
  action,
  recordId = null,
  detail = '',
  tableName = null,
}) =>
  createAuditLog({
    userId: 3,

    username: 'hr001',

    role: 'hr',

    action,

    tableName,

    recordId,

    detail,
  });

export const createAdminAuditLog = ({
  action,
  recordId = null,
  detail = '',
  tableName = null,
}) =>
  createAuditLog({
    userId: 4,

    username: 'admin001',

    role: 'admin',

    action,

    tableName,

    recordId,

    detail,
  });

export const formatAuditAction = (
  action,
) => {
  const actionNames = {
    login: 'Login',

    logout: 'Logout',

    change_password:
      'Change Password',

    create_leave_request:
      'Create Leave Request',

    update_leave_request_draft:
      'Update Leave Request Draft',

    delete_leave_request_draft:
      'Delete Leave Request Draft',

    submit_leave_request:
      'Submit Leave Request',

    approve_leave_request:
      'Approve Leave Request',

    reject_leave_request:
      'Reject Leave Request',

    cancel_leave_request:
      'Cancel Leave Request',

    upload_attachment:
      'Upload Attachment',

    delete_attachment:
      'Delete Attachment',

    create_employee:
      'Create Employee',

    update_employee:
      'Update Employee',

    update_employee_status:
      'Update Employee Status',

    create_leave_entitlement:
      'Create Leave Entitlement',

    update_leave_entitlement:
      'Update Leave Entitlement',

    adjust_leave_entitlement:
      'Adjust Leave Entitlement',

    create_user:
      'Create User',

    update_user:
      'Update User',

    update_user_status:
      'Update User Status',

    assign_role:
      'Assign Role',

    create_department:
      'Create Department',

    update_department:
      'Update Department',

    update_department_status:
      'Update Department Status',

    create_position:
      'Create Position',

    update_position:
      'Update Position',

    update_position_status:
      'Update Position Status',

    create_holiday:
      'Create Holiday',

    update_holiday:
      'Update Holiday',

    update_holiday_status:
      'Update Holiday Status',

    export_report:
      'Export Report',
  };

  const normalizedAction =
    normalizeText(action)
      .toLowerCase();

  if (
    actionNames[normalizedAction]
  ) {
    return actionNames[
      normalizedAction
    ];
  }

  return normalizedAction
    .split('_')
    .filter(Boolean)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(' ');
};

export const getAuditActionOptions =
  () => {
    const actions =
      initializeAuditLogs()
        .map(
          (auditLog) =>
            auditLog.action,
        )
        .filter(Boolean);

    return [
      ...new Set(actions),
    ].sort();
  };

export const getAuditTableOptions =
  () => {
    const tableNames =
      initializeAuditLogs()
        .map(
          (auditLog) =>
            auditLog.tableName,
        )
        .filter(Boolean);

    return [
      ...new Set(tableNames),
    ].sort();
  };

export const resetAuditLogStorage =
  () => {
    const initialAuditLogs =
      cloneData(
        defaultAuditLogs,
      ).map(
        normalizeAuditLog,
      );

    if (isBrowserAvailable()) {
      window.localStorage.setItem(
        AUDIT_LOG_STORAGE_KEY,
        JSON.stringify(
          initialAuditLogs,
        ),
      );
    }

    return sortAuditLogs(
      initialAuditLogs,
    );
  };

export const auditLogStorageKey =
  AUDIT_LOG_STORAGE_KEY;