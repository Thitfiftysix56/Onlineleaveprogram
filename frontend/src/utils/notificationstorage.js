const NOTIFICATION_STORAGE_KEY =
  'online_leave_approval_notifications';

const defaultNotifications = [
  {
    id: 1,
    role: 'supervisor',
    title: 'New leave request',
    message:
      'Employee User submitted leave request LR-20260720-0013 for approval.',
    type: 'leave-submitted',
    referenceId: 2,
    path: '/supervisor/approval/2',
    isRead: false,
    createdAt: '2026-07-20T14:05:00',
  },
  {
    id: 2,
    role: 'employee',
    title: 'Leave request approved',
    message:
      'Your leave request LR-20260715-0009 was approved.',
    type: 'leave-approved',
    referenceId: 3,
    path: '/employee/my-requests/3',
    isRead: false,
    createdAt: '2026-07-15T11:30:00',
  },
  {
    id: 3,
    role: 'employee',
    title: 'Leave request rejected',
    message:
      'Your leave request LR-20260710-0006 was rejected.',
    type: 'leave-rejected',
    referenceId: 4,
    path: '/employee/my-requests/4',
    isRead: true,
    createdAt: '2026-07-10T13:00:00',
  },
];

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const cloneData = (data) =>
  JSON.parse(JSON.stringify(data));

const normalizeRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase();

const normalizeNotification = (
  notification,
) => ({
  id: Number(notification.id),

  role: normalizeRole(
    notification.role,
  ),

  title:
    notification.title ||
    'Notification',

  message:
    notification.message || '',

  type:
    notification.type ||
    'general',

  referenceId:
    notification.referenceId !==
      undefined &&
    notification.referenceId !==
      null
      ? Number(
          notification.referenceId,
        )
      : null,

  path:
    notification.path || null,

  isRead:
    Boolean(notification.isRead),

  createdAt:
    notification.createdAt ||
    new Date().toISOString(),
});

const sortNotifications = (
  notifications,
) =>
  [...notifications].sort(
    (
      firstNotification,
      secondNotification,
    ) => {
      const firstDate =
        new Date(
          firstNotification.createdAt ||
            0,
        ).getTime();

      const secondDate =
        new Date(
          secondNotification.createdAt ||
            0,
        ).getTime();

      return secondDate - firstDate;
    },
  );

export const initializeNotifications =
  () => {
    if (!isBrowserAvailable()) {
      return sortNotifications(
        cloneData(
          defaultNotifications,
        ).map(
          normalizeNotification,
        ),
      );
    }

    const storedNotifications =
      window.localStorage.getItem(
        NOTIFICATION_STORAGE_KEY,
      );

    if (storedNotifications) {
      try {
        const parsedNotifications =
          JSON.parse(
            storedNotifications,
          );

        if (
          Array.isArray(
            parsedNotifications,
          )
        ) {
          return sortNotifications(
            parsedNotifications.map(
              normalizeNotification,
            ),
          );
        }
      } catch (error) {
        console.error(
          'Unable to read notifications:',
          error,
        );
      }
    }

    const initialNotifications =
      cloneData(
        defaultNotifications,
      ).map(
        normalizeNotification,
      );

    window.localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(
        initialNotifications,
      ),
    );

    return sortNotifications(
      initialNotifications,
    );
  };

export const saveNotifications = (
  notifications,
) => {
  const normalizedNotifications =
    sortNotifications(
      notifications.map(
        normalizeNotification,
      ),
    );

  if (isBrowserAvailable()) {
    window.localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(
        normalizedNotifications,
      ),
    );
  }

  return normalizedNotifications;
};

export const getNotifications = ({
  role,
  unreadOnly = false,
} = {}) => {
  const normalizedRole =
    normalizeRole(role);

  return initializeNotifications().filter(
    (notification) => {
      const matchesRole =
        !normalizedRole ||
        notification.role ===
          normalizedRole;

      const matchesReadStatus =
        !unreadOnly ||
        !notification.isRead;

      return (
        matchesRole &&
        matchesReadStatus
      );
    },
  );
};

export const getNotificationById = (
  notificationId,
) => {
  const numericNotificationId =
    Number(notificationId);

  return (
    initializeNotifications().find(
      (notification) =>
        Number(notification.id) ===
        numericNotificationId,
    ) || null
  );
};

export const getNextNotificationId =
  () => {
    const notifications =
      initializeNotifications();

    if (
      notifications.length === 0
    ) {
      return 1;
    }

    return (
      Math.max(
        ...notifications.map(
          (notification) =>
            Number(
              notification.id,
            ) || 0,
        ),
      ) + 1
    );
  };

export const createNotification = ({
  role,
  title,
  message,
  type = 'general',
  referenceId = null,
  path = null,
}) => {
  const notifications =
    initializeNotifications();

  const newNotification =
    normalizeNotification({
      id: getNextNotificationId(),

      role,

      title,

      message,

      type,

      referenceId,

      path,

      isRead: false,

      createdAt:
        new Date().toISOString(),
    });

  saveNotifications([
    ...notifications,
    newNotification,
  ]);

  return newNotification;
};

export const markNotificationAsRead = (
  notificationId,
) => {
  const numericNotificationId =
    Number(notificationId);

  let updatedNotification = null;

  const updatedNotifications =
    initializeNotifications().map(
      (notification) => {
        if (
          Number(notification.id) !==
          numericNotificationId
        ) {
          return notification;
        }

        updatedNotification = {
          ...notification,
          isRead: true,
        };

        return updatedNotification;
      },
    );

  saveNotifications(
    updatedNotifications,
  );

  return updatedNotification;
};

export const markNotificationAsUnread = (
  notificationId,
) => {
  const numericNotificationId =
    Number(notificationId);

  let updatedNotification = null;

  const updatedNotifications =
    initializeNotifications().map(
      (notification) => {
        if (
          Number(notification.id) !==
          numericNotificationId
        ) {
          return notification;
        }

        updatedNotification = {
          ...notification,
          isRead: false,
        };

        return updatedNotification;
      },
    );

  saveNotifications(
    updatedNotifications,
  );

  return updatedNotification;
};

export const markAllNotificationsAsRead =
  (role) => {
    const normalizedRole =
      normalizeRole(role);

    let updatedCount = 0;

    const updatedNotifications =
      initializeNotifications().map(
        (notification) => {
          const belongsToRole =
            !normalizedRole ||
            notification.role ===
              normalizedRole;

          if (
            !belongsToRole ||
            notification.isRead
          ) {
            return notification;
          }

          updatedCount += 1;

          return {
            ...notification,
            isRead: true,
          };
        },
      );

    saveNotifications(
      updatedNotifications,
    );

    return updatedCount;
  };

export const deleteNotification = (
  notificationId,
) => {
  const numericNotificationId =
    Number(notificationId);

  const notifications =
    initializeNotifications();

  const notificationExists =
    notifications.some(
      (notification) =>
        Number(notification.id) ===
        numericNotificationId,
    );

  if (!notificationExists) {
    return false;
  }

  const updatedNotifications =
    notifications.filter(
      (notification) =>
        Number(notification.id) !==
        numericNotificationId,
    );

  saveNotifications(
    updatedNotifications,
  );

  return true;
};

export const deleteAllNotifications =
  (role) => {
    const normalizedRole =
      normalizeRole(role);

    const notifications =
      initializeNotifications();

    const notificationsToKeep =
      normalizedRole
        ? notifications.filter(
            (notification) =>
              notification.role !==
              normalizedRole,
          )
        : [];

    const deletedCount =
      notifications.length -
      notificationsToKeep.length;

    saveNotifications(
      notificationsToKeep,
    );

    return deletedCount;
  };

export const getUnreadNotificationCount =
  (role) =>
    getNotifications({
      role,
      unreadOnly: true,
    }).length;

export const notifySupervisorLeaveSubmitted =
  (request) => {
    if (!request) {
      return null;
    }

    const requestReference =
      request.requestNo ||
      `Request #${request.id}`;

    const employeeName =
      request.employeeName ||
      'Employee User';

    return createNotification({
      role: 'supervisor',

      title: 'New leave request',

      message: `${employeeName} submitted leave request ${requestReference} for approval.`,

      type: 'leave-submitted',

      referenceId: request.id,

      path: `/supervisor/approval/${request.id}`,
    });
  };

export const notifyEmployeeLeaveApproved =
  (request) => {
    if (!request) {
      return null;
    }

    const requestReference =
      request.requestNo ||
      `Request #${request.id}`;

    return createNotification({
      role:
        request.role || 'employee',

      title:
        'Leave request approved',

      message: `Your leave request ${requestReference} was approved.`,

      type: 'leave-approved',

      referenceId: request.id,

      path: `/${
        request.role || 'employee'
      }/my-requests/${request.id}`,
    });
  };

export const notifyEmployeeLeaveRejected =
  (
    request,
    rejectionReason = '',
  ) => {
    if (!request) {
      return null;
    }

    const requestReference =
      request.requestNo ||
      `Request #${request.id}`;

    const reasonText =
      rejectionReason.trim()
        ? ` Reason: ${rejectionReason.trim()}`
        : '';

    return createNotification({
      role:
        request.role || 'employee',

      title:
        'Leave request rejected',

      message: `Your leave request ${requestReference} was rejected.${reasonText}`,

      type: 'leave-rejected',

      referenceId: request.id,

      path: `/${
        request.role || 'employee'
      }/my-requests/${request.id}`,
    });
  };

export const notifyEmployeeLeaveCancelled =
  (request) => {
    if (!request) {
      return null;
    }

    const requestReference =
      request.requestNo ||
      `Request #${request.id}`;

    return createNotification({
      role:
        request.role || 'employee',

      title:
        'Leave request cancelled',

      message: `Leave request ${requestReference} was cancelled.`,

      type: 'leave-cancelled',

      referenceId: request.id,

      path: `/${
        request.role || 'employee'
      }/my-requests/${request.id}`,
    });
  };

export const resetNotificationStorage =
  () => {
    const initialNotifications =
      cloneData(
        defaultNotifications,
      ).map(
        normalizeNotification,
      );

    if (isBrowserAvailable()) {
      window.localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(
          initialNotifications,
        ),
      );
    }

    return sortNotifications(
      initialNotifications,
    );
  };

export const notificationStorageKey =
  NOTIFICATION_STORAGE_KEY;