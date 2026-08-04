import {
  notifyEmployeeLeaveApproved,
  notifyEmployeeLeaveCancelled,
  notifyEmployeeLeaveRejected,
  notifySupervisorLeaveSubmitted,
} from './notificationstorage.js';

import {
  createAuditLog,
} from './auditlogstorage.js';

import {
  adjustUsedLeaveDays,
  getLeaveEntitlement,
  getLeaveEntitlements,
  resetLeaveEntitlementStorage,
  saveLeaveEntitlements,
} from './leaveentitlementstorage.js';

const STORAGE_KEY =
  'online_leave_approval_requests';

const ENTITLEMENT_MIGRATION_KEY =
  'online_leave_approval_entitlement_usage_v1';

let lastLeaveRequestError = '';

const defaultRequests = [
  {
    id: 1,
    requestNo: null,
    leaveTypeId: 1,
    leaveType: 'Annual Leave',
    startDate: '2026-08-18',
    endDate: '2026-08-19',
    leaveDays: 2,
    reason: 'Personal travel planning.',
    status: 'draft',
    submittedAt: null,
    createdAt: '2026-07-20T13:50:00',
    updatedAt: '2026-07-20T13:50:00',
    role: 'employee',
    attachments: [],
  },
  {
    id: 2,
    requestNo: 'LR-20260720-0013',
    leaveTypeId: 1,
    leaveType: 'Annual Leave',
    startDate: '2026-07-30',
    endDate: '2026-07-31',
    leaveDays: 2,
    reason: 'Personal family matter.',
    status: 'pending',
    submittedAt: '2026-07-20T14:05:00',
    createdAt: '2026-07-20T13:50:00',
    updatedAt: '2026-07-20T14:05:00',
    role: 'employee',
    attachments: [
      {
        id: 1,
        name: 'supporting-document.pdf',
        size: 245760,
        type: 'application/pdf',
      },
    ],
  },
  {
    id: 3,
    requestNo: 'LR-20260715-0009',
    leaveTypeId: 2,
    leaveType: 'Sick Leave',
    startDate: '2026-07-16',
    endDate: '2026-07-16',
    leaveDays: 1,
    reason:
      'Medical appointment and recovery.',
    status: 'approved',
    submittedAt: '2026-07-15T09:20:00',
    approvedAt: '2026-07-15T11:30:00',
    createdAt: '2026-07-15T09:10:00',
    updatedAt: '2026-07-15T11:30:00',
    role: 'employee',
    attachments: [],
  },
  {
    id: 4,
    requestNo: 'LR-20260710-0006',
    leaveTypeId: 3,
    leaveType: 'Personal Leave',
    startDate: '2026-07-11',
    endDate: '2026-07-11',
    leaveDays: 1,
    reason: 'Urgent personal matter.',
    status: 'rejected',
    submittedAt: '2026-07-10T10:40:00',
    rejectedAt: '2026-07-10T13:00:00',
    rejectionReason:
      'The selected date could not be approved.',
    createdAt: '2026-07-10T10:30:00',
    updatedAt: '2026-07-10T13:00:00',
    role: 'employee',
    attachments: [],
  },
  {
    id: 5,
    requestNo: 'LR-20260625-0003',
    leaveTypeId: 1,
    leaveType: 'Annual Leave',
    startDate: '2026-06-29',
    endDate: '2026-06-30',
    leaveDays: 2,
    reason:
      'Family activity outside the city.',
    status: 'cancelled',
    submittedAt: '2026-06-25T13:15:00',
    cancelledAt: '2026-06-26T09:00:00',
    createdAt: '2026-06-25T13:00:00',
    updatedAt: '2026-06-26T09:00:00',
    role: 'employee',
    attachments: [],
  },
  {
    id: 6,
    requestNo: 'LR-20260518-0001',
    leaveTypeId: 2,
    leaveType: 'Sick Leave',
    startDate: '2026-05-19',
    endDate: '2026-05-21',
    leaveDays: 3,
    reason:
      'Illness with medical certificate.',
    status: 'approved',
    submittedAt: '2026-05-18T08:50:00',
    approvedAt: '2026-05-18T10:20:00',
    createdAt: '2026-05-18T08:40:00',
    updatedAt: '2026-05-18T10:20:00',
    role: 'employee',
    attachments: [],
  },
];

const auditActors = {
  employee: {
    userId: 1,
    username: 'employee001',
    role: 'employee',
  },

  supervisor: {
    userId: 2,
    username: 'supervisor001',
    role: 'supervisor',
  },

  hr: {
    userId: 3,
    username: 'hr001',
    role: 'hr',
  },

  admin: {
    userId: 4,
    username: 'admin001',
    role: 'admin',
  },

  system: {
    userId: null,
    username: 'system',
    role: 'system',
  },
};

const cloneData = (data) =>
  JSON.parse(JSON.stringify(data));

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const setLastError = (message = '') => {
  lastLeaveRequestError = message;
};

const clearLastError = () => {
  lastLeaveRequestError = '';
};

export const getLeaveRequestOperationError =
  () => lastLeaveRequestError;

const normalizeStatus = (status) =>
  String(status || '')
    .trim()
    .toLowerCase();

const normalizeRole = (role) =>
  String(role || 'employee')
    .trim()
    .toLowerCase();

const normalizeAttachment = (
  attachment,
  requestId,
  index,
) => ({
  id:
    attachment.id ||
    `${requestId}-${index + 1}`,

  name:
    attachment.name ||
    attachment.fileName ||
    `Attachment ${index + 1}`,

  size:
    Number(
      attachment.size ||
        attachment.fileSize,
    ) || 0,

  type:
    attachment.type ||
    attachment.fileType ||
    '',
});

const normalizeRequest = (
  request,
) => ({
  ...request,

  id: Number(request.id),

  requestNo:
    request.requestNo || null,

  leaveTypeId:
    request.leaveTypeId !== undefined &&
    request.leaveTypeId !== null &&
    request.leaveTypeId !== ''
      ? Number(request.leaveTypeId)
      : null,

  leaveType:
    request.leaveType ||
    'Not selected',

  startDate:
    request.startDate || '',

  endDate:
    request.endDate || '',

  leaveDays:
    Number(request.leaveDays) || 0,

  reason:
    request.reason || '',

  status:
    normalizeStatus(
      request.status,
    ) || 'draft',

  submittedAt:
    request.submittedAt || null,

  approvedAt:
    request.approvedAt || null,

  rejectedAt:
    request.rejectedAt || null,

  cancelledAt:
    request.cancelledAt || null,

  rejectionReason:
    request.rejectionReason || '',

  createdAt:
    request.createdAt ||
    new Date().toISOString(),

  updatedAt:
    request.updatedAt ||
    request.createdAt ||
    new Date().toISOString(),

  role: normalizeRole(
    request.role,
  ),

  attachments: Array.isArray(
    request.attachments,
  )
    ? request.attachments.map(
        (attachment, index) =>
          normalizeAttachment(
            attachment,
            Number(request.id),
            index,
          ),
      )
    : [],
});

const sortRequests = (requests) =>
  [...requests].sort(
    (
      firstRequest,
      secondRequest,
    ) =>
      Number(secondRequest.id) -
      Number(firstRequest.id),
  );

const createRequestNumber = (
  id,
) => {
  const currentDate =
    new Date();

  const year = currentDate
    .getFullYear()
    .toString();

  const month = String(
    currentDate.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    currentDate.getDate(),
  ).padStart(2, '0');

  const runningNumber =
    String(id).padStart(
      4,
      '0',
    );

  return `LR-${year}${month}${day}-${runningNumber}`;
};

const getRequestReference = (
  request,
) => {
  if (!request) {
    return 'Unknown request';
  }

  return (
    request.requestNo ||
    `Draft #${request.id}`
  );
};

const getDateYear = (
  dateValue,
) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(
    `${dateValue}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getFullYear();
};

const createLeaveRequestAuditLog = ({
  actorRole = 'system',
  action,
  request,
  detail,
}) => {
  const normalizedActorRole =
    normalizeRole(actorRole);

  const actor =
    auditActors[
      normalizedActorRole
    ] || auditActors.system;

  return createAuditLog({
    userId: actor.userId,

    username: actor.username,

    role: actor.role,

    action,

    tableName:
      'leave_requests',

    recordId:
      request?.id || null,

    detail:
      detail || '',

    ipAddress:
      '127.0.0.1',
  });
};

const calculateApprovedUsage = ({
  requests,
  role,
  leaveTypeId,
  year,
}) =>
  requests
    .filter((request) => {
      const requestYear =
        getDateYear(
          request.startDate,
        );

      return (
        request.role === role &&
        request.leaveTypeId ===
          leaveTypeId &&
        requestYear === year &&
        normalizeStatus(
          request.status,
        ) === 'approved'
      );
    })
    .reduce(
      (total, request) =>
        total +
        Number(
          request.leaveDays,
        ),
      0,
    );

const migrateEntitlementUsage = (
  requests,
  force = false,
) => {
  if (!isBrowserAvailable()) {
    return;
  }

  const wasMigrated =
    window.localStorage.getItem(
      ENTITLEMENT_MIGRATION_KEY,
    );

  if (wasMigrated && !force) {
    return;
  }

  const entitlements =
    getLeaveEntitlements();

  const updatedEntitlements =
    entitlements.map(
      (entitlement) => ({
        ...entitlement,

        usedDays:
          calculateApprovedUsage({
            requests,

            role:
              entitlement.role,

            leaveTypeId:
              entitlement.leaveTypeId,

            year:
              entitlement.year,
          }),

        updatedAt:
          new Date().toISOString(),
      }),
    );

  saveLeaveEntitlements(
    updatedEntitlements,
  );

  window.localStorage.setItem(
    ENTITLEMENT_MIGRATION_KEY,
    'true',
  );
};

export const initializeLeaveRequests =
  () => {
    if (!isBrowserAvailable()) {
      return sortRequests(
        cloneData(
          defaultRequests,
        ).map(
          normalizeRequest,
        ),
      );
    }

    const storedRequests =
      window.localStorage.getItem(
        STORAGE_KEY,
      );

    if (storedRequests) {
      try {
        const parsedRequests =
          JSON.parse(
            storedRequests,
          );

        if (
          Array.isArray(
            parsedRequests,
          )
        ) {
          const normalizedRequests =
            sortRequests(
              parsedRequests.map(
                normalizeRequest,
              ),
            );

          migrateEntitlementUsage(
            normalizedRequests,
          );

          return normalizedRequests;
        }
      } catch (error) {
        console.error(
          'Unable to read leave requests:',
          error,
        );
      }
    }

    const initialRequests =
      cloneData(
        defaultRequests,
      ).map(
        normalizeRequest,
      );

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        initialRequests,
      ),
    );

    migrateEntitlementUsage(
      initialRequests,
    );

    return sortRequests(
      initialRequests,
    );
  };

export const saveLeaveRequests = (
  requests,
) => {
  const normalizedRequests =
    sortRequests(
      requests.map(
        normalizeRequest,
      ),
    );

  if (isBrowserAvailable()) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        normalizedRequests,
      ),
    );
  }

  return normalizedRequests;
};

export const getLeaveRequests = ({
  role,
} = {}) => {
  const requests =
    initializeLeaveRequests();

  const normalizedRole =
    role
      ? normalizeRole(role)
      : null;

  if (!normalizedRole) {
    return sortRequests(
      requests,
    );
  }

  return sortRequests(
    requests.filter(
      (request) =>
        request.role ===
        normalizedRole,
    ),
  );
};

export const getLeaveRequestById = (
  requestId,
) => {
  const numericRequestId =
    Number(requestId);

  if (
    !Number.isInteger(
      numericRequestId,
    ) ||
    numericRequestId <= 0
  ) {
    return null;
  }

  return (
    initializeLeaveRequests().find(
      (request) =>
        Number(request.id) ===
        numericRequestId,
    ) || null
  );
};

export const getNextRequestId =
  () => {
    const requests =
      initializeLeaveRequests();

    if (
      requests.length === 0
    ) {
      return 1;
    }

    return (
      Math.max(
        ...requests.map(
          (request) =>
            Number(request.id) ||
            0,
        ),
      ) + 1
    );
  };

const calculatePendingDays = ({
  requests,
  role,
  leaveTypeId,
  year,
  excludeRequestId = null,
}) =>
  requests
    .filter((request) => {
      const requestYear =
        getDateYear(
          request.startDate,
        );

      const isExcluded =
        excludeRequestId &&
        Number(request.id) ===
          Number(excludeRequestId);

      return (
        !isExcluded &&
        request.role === role &&
        request.leaveTypeId ===
          leaveTypeId &&
        requestYear === year &&
        normalizeStatus(
          request.status,
        ) === 'pending'
      );
    })
    .reduce(
      (total, request) =>
        total +
        Number(
          request.leaveDays,
        ),
      0,
    );

const calculateLeaveAvailability = ({
  requests,
  role,
  leaveTypeId,
  year,
  excludeRequestId = null,
}) => {
  const entitlement =
    getLeaveEntitlement({
      role,
      leaveTypeId,
      year,
    });

  if (!entitlement) {
    return {
      entitlement: null,
      totalDays: 0,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: 0,
      availableDays: 0,
    };
  }

  const pendingDays =
    calculatePendingDays({
      requests,
      role,
      leaveTypeId,
      year,
      excludeRequestId,
    });

  const remainingDays =
    Math.max(
      entitlement.totalDays -
        entitlement.usedDays,
      0,
    );

  const availableDays =
    Math.max(
      remainingDays -
        pendingDays,
      0,
    );

  return {
    entitlement,
    totalDays:
      entitlement.totalDays,
    usedDays:
      entitlement.usedDays,
    pendingDays,
    remainingDays,
    availableDays,
  };
};

export const getLeaveAvailability = ({
  role = 'employee',
  leaveTypeId,
  year = new Date().getFullYear(),
  excludeRequestId = null,
}) =>
  calculateLeaveAvailability({
    requests:
      initializeLeaveRequests(),

    role:
      normalizeRole(role),

    leaveTypeId:
      Number(leaveTypeId),

    year:
      Number(year),

    excludeRequestId,
  });

export const saveLeaveRequestDraft = ({
  requestId = null,
  role = 'employee',
  leaveTypeId,
  leaveType,
  startDate,
  endDate,
  leaveDays,
  reason,
  attachments = [],
}) => {
  clearLastError();

  const requests =
    initializeLeaveRequests();

  const now =
    new Date().toISOString();

  const numericRequestId =
    requestId
      ? Number(requestId)
      : getNextRequestId();

  const existingRequest =
    requests.find(
      (request) =>
        Number(request.id) ===
        numericRequestId,
    );

  if (
    existingRequest &&
    normalizeStatus(
      existingRequest.status,
    ) !== 'draft'
  ) {
    setLastError(
      'Only draft requests can be edited.',
    );

    return null;
  }

  const draftRequest =
    normalizeRequest({
      ...existingRequest,

      id: numericRequestId,

      requestNo: null,

      leaveTypeId:
        Number(leaveTypeId) ||
        null,

      leaveType:
        leaveType ||
        'Not selected',

      startDate:
        startDate || '',

      endDate:
        endDate || '',

      leaveDays:
        Number(leaveDays) || 0,

      reason:
        reason || '',

      status: 'draft',

      submittedAt: null,

      approvedAt: null,

      rejectedAt: null,

      cancelledAt: null,

      rejectionReason: '',

      createdAt:
        existingRequest
          ?.createdAt || now,

      updatedAt: now,

      role,

      attachments:
        attachments.map(
          (
            attachment,
            index,
          ) =>
            normalizeAttachment(
              attachment,
              numericRequestId,
              index,
            ),
        ),
    });

  const updatedRequests =
    existingRequest
      ? requests.map(
          (request) =>
            Number(
              request.id,
            ) ===
            numericRequestId
              ? draftRequest
              : request,
        )
      : [
          ...requests,
          draftRequest,
        ];

  saveLeaveRequests(
    updatedRequests,
  );

  const requestReference =
    getRequestReference(
      draftRequest,
    );

  createLeaveRequestAuditLog({
    actorRole:
      draftRequest.role,

    action:
      existingRequest
        ? 'update_leave_request_draft'
        : 'create_leave_request',

    request:
      draftRequest,

    detail:
      existingRequest
        ? `Updated leave request draft ${requestReference}.`
        : `Created leave request draft ${requestReference}.`,
  });

  return draftRequest;
};

export const submitLeaveRequest = ({
  requestId = null,
  role = 'employee',
  leaveTypeId,
  leaveType,
  startDate,
  endDate,
  leaveDays,
  reason,
  attachments = [],
}) => {
  clearLastError();

  const requests =
    initializeLeaveRequests();

  const normalizedRole =
    normalizeRole(role);

  const numericLeaveTypeId =
    Number(leaveTypeId);

  const numericLeaveDays =
    Number(leaveDays);

  const startYear =
    getDateYear(startDate);

  const endYear =
    getDateYear(endDate);

  if (!numericLeaveTypeId) {
    setLastError(
      'Leave type is required.',
    );

    return null;
  }

  if (
    !numericLeaveDays ||
    numericLeaveDays <= 0
  ) {
    setLastError(
      'Leave days must be greater than zero.',
    );

    return null;
  }

  if (
    !startYear ||
    !endYear
  ) {
    setLastError(
      'Start date and end date are required.',
    );

    return null;
  }

  if (startYear !== endYear) {
    setLastError(
      'The MVP does not support leave requests across different years.',
    );

    return null;
  }

  const numericRequestId =
    requestId
      ? Number(requestId)
      : getNextRequestId();

  const existingRequest =
    requests.find(
      (request) =>
        Number(request.id) ===
        numericRequestId,
    );

  if (
    existingRequest &&
    normalizeStatus(
      existingRequest.status,
    ) !== 'draft'
  ) {
    setLastError(
      'Only draft requests can be submitted.',
    );

    return null;
  }

  const availability =
    calculateLeaveAvailability({
      requests,

      role:
        normalizedRole,

      leaveTypeId:
        numericLeaveTypeId,

      year:
        startYear,

      excludeRequestId:
        numericRequestId,
    });

  if (!availability.entitlement) {
    setLastError(
      'No leave entitlement was found for the selected leave type.',
    );

    return null;
  }

  if (
    numericLeaveDays >
    availability.availableDays
  ) {
    setLastError(
      `Insufficient leave balance. Available: ${availability.availableDays} day(s).`,
    );

    return null;
  }

  const now =
    new Date().toISOString();

  const submittedRequest =
    normalizeRequest({
      ...existingRequest,

      id: numericRequestId,

      requestNo:
        existingRequest
          ?.requestNo ||
        createRequestNumber(
          numericRequestId,
        ),

      leaveTypeId:
        numericLeaveTypeId,

      leaveType:
        leaveType ||
        'Not selected',

      startDate:
        startDate || '',

      endDate:
        endDate || '',

      leaveDays:
        numericLeaveDays,

      reason:
        reason || '',

      status: 'pending',

      submittedAt: now,

      approvedAt: null,

      rejectedAt: null,

      cancelledAt: null,

      rejectionReason: '',

      createdAt:
        existingRequest
          ?.createdAt || now,

      updatedAt: now,

      role:
        normalizedRole,

      attachments:
        attachments.map(
          (
            attachment,
            index,
          ) =>
            normalizeAttachment(
              attachment,
              numericRequestId,
              index,
            ),
        ),
    });

  const updatedRequests =
    existingRequest
      ? requests.map(
          (request) =>
            Number(
              request.id,
            ) ===
            numericRequestId
              ? submittedRequest
              : request,
        )
      : [
          ...requests,
          submittedRequest,
        ];

  saveLeaveRequests(
    updatedRequests,
  );

  notifySupervisorLeaveSubmitted(
    submittedRequest,
  );

  createLeaveRequestAuditLog({
    actorRole:
      submittedRequest.role,

    action:
      'submit_leave_request',

    request:
      submittedRequest,

    detail:
      `Submitted leave request ${getRequestReference(
        submittedRequest,
      )} for approval.`,
  });

  return submittedRequest;
};

export const updateLeaveRequestStatus = (
  requestId,
  status,
  extraData = {},
) => {
  const numericRequestId =
    Number(requestId);

  const normalizedNewStatus =
    normalizeStatus(status);

  if (
    !Number.isInteger(
      numericRequestId,
    ) ||
    numericRequestId <= 0 ||
    !normalizedNewStatus
  ) {
    return null;
  }

  const requests =
    initializeLeaveRequests();

  let updatedRequest = null;

  const updatedRequests =
    requests.map(
      (request) => {
        if (
          Number(request.id) !==
          numericRequestId
        ) {
          return request;
        }

        updatedRequest =
          normalizeRequest({
            ...request,

            ...extraData,

            status:
              normalizedNewStatus,

            updatedAt:
              new Date()
                .toISOString(),
          });

        return updatedRequest;
      },
    );

  if (!updatedRequest) {
    return null;
  }

  saveLeaveRequests(
    updatedRequests,
  );

  return updatedRequest;
};

export const cancelLeaveRequest = (
  requestId,
) => {
  clearLastError();

  const selectedRequest =
    getLeaveRequestById(
      requestId,
    );

  if (
    !selectedRequest ||
    normalizeStatus(
      selectedRequest.status,
    ) !== 'pending'
  ) {
    setLastError(
      'Only pending requests can be cancelled.',
    );

    return null;
  }

  const updatedRequest =
    updateLeaveRequestStatus(
      requestId,
      'cancelled',
      {
        cancelledAt:
          new Date()
            .toISOString(),
      },
    );

  if (!updatedRequest) {
    setLastError(
      'The request could not be cancelled.',
    );

    return null;
  }

  notifyEmployeeLeaveCancelled(
    updatedRequest,
  );

  createLeaveRequestAuditLog({
    actorRole:
      updatedRequest.role,

    action:
      'cancel_leave_request',

    request:
      updatedRequest,

    detail:
      `Cancelled leave request ${getRequestReference(
        updatedRequest,
      )}.`,
  });

  return updatedRequest;
};

export const approveLeaveRequest = (
  requestId,
) => {
  clearLastError();

  const selectedRequest =
    getLeaveRequestById(
      requestId,
    );

  if (
    !selectedRequest ||
    normalizeStatus(
      selectedRequest.status,
    ) !== 'pending'
  ) {
    setLastError(
      'Only pending requests can be approved.',
    );

    return null;
  }

  const requestYear =
    getDateYear(
      selectedRequest.startDate,
    );

  const entitlement =
    getLeaveEntitlement({
      role:
        selectedRequest.role,

      leaveTypeId:
        selectedRequest.leaveTypeId,

      year:
        requestYear,
    });

  if (!entitlement) {
    setLastError(
      'No leave entitlement was found for this request.',
    );

    return null;
  }

  if (
    selectedRequest.leaveDays >
    entitlement.remainingDays
  ) {
    setLastError(
      `Insufficient leave balance. Remaining: ${entitlement.remainingDays} day(s).`,
    );

    return null;
  }

  const adjustedEntitlement =
    adjustUsedLeaveDays({
      role:
        selectedRequest.role,

      leaveTypeId:
        selectedRequest.leaveTypeId,

      year:
        requestYear,

      amount:
        selectedRequest.leaveDays,
    });

  if (!adjustedEntitlement) {
    setLastError(
      'The leave balance could not be updated.',
    );

    return null;
  }

  const updatedRequest =
    updateLeaveRequestStatus(
      requestId,
      'approved',
      {
        approvedAt:
          new Date()
            .toISOString(),
      },
    );

  if (!updatedRequest) {
    adjustUsedLeaveDays({
      role:
        selectedRequest.role,

      leaveTypeId:
        selectedRequest.leaveTypeId,

      year:
        requestYear,

      amount:
        -selectedRequest.leaveDays,
    });

    setLastError(
      'The request could not be approved.',
    );

    return null;
  }

  notifyEmployeeLeaveApproved(
    updatedRequest,
  );

  createLeaveRequestAuditLog({
    actorRole: 'supervisor',

    action:
      'approve_leave_request',

    request:
      updatedRequest,

    detail:
      `Approved leave request ${getRequestReference(
        updatedRequest,
      )}. Used leave increased by ${updatedRequest.leaveDays} day(s).`,
  });

  return updatedRequest;
};

export const rejectLeaveRequest = (
  requestId,
  rejectionReason = '',
) => {
  clearLastError();

  const selectedRequest =
    getLeaveRequestById(
      requestId,
    );

  if (
    !selectedRequest ||
    normalizeStatus(
      selectedRequest.status,
    ) !== 'pending'
  ) {
    setLastError(
      'Only pending requests can be rejected.',
    );

    return null;
  }

  const normalizedReason =
    String(
      rejectionReason || '',
    ).trim();

  if (!normalizedReason) {
    setLastError(
      'A rejection reason is required.',
    );

    return null;
  }

  const updatedRequest =
    updateLeaveRequestStatus(
      requestId,
      'rejected',
      {
        rejectedAt:
          new Date()
            .toISOString(),

        rejectionReason:
          normalizedReason,
      },
    );

  if (!updatedRequest) {
    setLastError(
      'The request could not be rejected.',
    );

    return null;
  }

  notifyEmployeeLeaveRejected(
    updatedRequest,
    normalizedReason,
  );

  createLeaveRequestAuditLog({
    actorRole: 'supervisor',

    action:
      'reject_leave_request',

    request:
      updatedRequest,

    detail:
      `Rejected leave request ${getRequestReference(
        updatedRequest,
      )}. Reason: ${normalizedReason}`,
  });

  return updatedRequest;
};

export const deleteLeaveRequest = (
  requestId,
) => {
  clearLastError();

  const numericRequestId =
    Number(requestId);

  const requests =
    initializeLeaveRequests();

  const selectedRequest =
    requests.find(
      (request) =>
        Number(request.id) ===
        numericRequestId,
    );

  if (
    !selectedRequest ||
    normalizeStatus(
      selectedRequest.status,
    ) !== 'draft'
  ) {
    setLastError(
      'Only draft requests can be deleted.',
    );

    return false;
  }

  const updatedRequests =
    requests.filter(
      (request) =>
        Number(request.id) !==
        numericRequestId,
    );

  saveLeaveRequests(
    updatedRequests,
  );

  createLeaveRequestAuditLog({
    actorRole:
      selectedRequest.role,

    action:
      'delete_leave_request_draft',

    request:
      selectedRequest,

    detail:
      `Deleted leave request draft ${getRequestReference(
        selectedRequest,
      )}.`,
  });

  return true;
};

export const resetLeaveRequestStorage =
  () => {
    clearLastError();

    const initialRequests =
      cloneData(
        defaultRequests,
      ).map(
        normalizeRequest,
      );

    resetLeaveEntitlementStorage();

    if (isBrowserAvailable()) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          initialRequests,
        ),
      );

      window.localStorage.removeItem(
        ENTITLEMENT_MIGRATION_KEY,
      );
    }

    migrateEntitlementUsage(
      initialRequests,
      true,
    );

    return sortRequests(
      initialRequests,
    );
  };

export const leaveRequestStorageKey =
  STORAGE_KEY;