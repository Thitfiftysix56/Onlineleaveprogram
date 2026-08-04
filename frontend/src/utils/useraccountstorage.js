import {
  authUsersStorageKey,
  getAuthUsers,
  getCurrentUser,
  managedUsersStorageKey,
} from './authstorage.js';

import {
  createAuditLog,
} from './auditlogstorage.js';

const INITIAL_PASSWORD =
  String(
    import.meta.env
      .VITE_DEMO_INITIAL_PASSWORD ||
      '',
  );

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const normalizeValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const normalizeRole = (role) => {
  const normalizedRole =
    normalizeValue(role);

  const allowedRoles = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ];

  return allowedRoles.includes(
    normalizedRole,
  )
    ? normalizedRole
    : 'employee';
};

const normalizeStatus = (status) => {
  const normalizedStatus =
    normalizeValue(status);

  if (
    [
      'inactive',
      'disabled',
      'false',
      '0',
    ].includes(normalizedStatus)
  ) {
    return 'inactive';
  }

  if (
    [
      'locked',
      'blocked',
      'suspended',
    ].includes(normalizedStatus)
  ) {
    return 'locked';
  }

  return 'active';
};

const readStoredArray = (
  storageKey,
) => {
  if (!isBrowserAvailable()) {
    return [];
  }

  const storedValue =
    window.localStorage.getItem(
      storageKey,
    );

  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue =
      JSON.parse(storedValue);

    return Array.isArray(
      parsedValue,
    )
      ? parsedValue
      : [];
  } catch (error) {
    console.error(
      `Unable to read ${storageKey}.`,
      error,
    );

    return [];
  }
};

const writeStoredArray = (
  storageKey,
  values,
) => {
  if (!isBrowserAvailable()) {
    return values;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(values),
  );

  return values;
};

const notifyUserAccountsChanged =
  () => {
    if (
      typeof window ===
      'undefined'
    ) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        'auth-users-changed',
      ),
    );
  };

const formatEmployeeCode = (
  user,
) => {
  const employeeId =
    Number(
      user?.employeeId ||
        user?.employee_id ||
        user?.id,
    );

  return (
    user?.employeeCode ||
    user?.employee_code ||
    (employeeId
      ? `EMP${String(
          employeeId,
        ).padStart(
          3,
          '0',
        )}`
      : '')
  );
};

const normalizeManagedUser = (
  user,
  index = 0,
) => {
  const employeeId =
    Number(
      user?.employeeId ||
        user?.employee_id ||
        user?.id,
    ) ||
    index + 1;

  return {
    ...user,

    id:
      Number(
        user?.id ||
          user?.userId ||
          user?.user_id,
      ) ||
      index + 1,

    employeeId,

    employeeCode:
      formatEmployeeCode({
        ...user,
        employeeId,
      }),

    employeeName:
      String(
        user?.employeeName ||
          user?.employee_name ||
          user?.displayName ||
          user?.fullName ||
          user?.full_name ||
          user?.username ||
          'Not specified',
      ).trim(),

    displayName:
      String(
        user?.displayName ||
          user?.employeeName ||
          user?.employee_name ||
          user?.fullName ||
          user?.full_name ||
          user?.username ||
          'Not specified',
      ).trim(),

    email:
      String(
        user?.email || '',
      ).trim(),

    department:
      String(
        user?.department ||
          user?.departmentName ||
          user?.department_name ||
          'Not specified',
      ).trim(),

    position:
      String(
        user?.position ||
          user?.positionName ||
          user?.position_name ||
          'Not specified',
      ).trim(),

    username:
      String(
        user?.username ||
          user?.userName ||
          user?.user_name ||
          '',
      ).trim(),

    role:
      normalizeRole(
        user?.role ||
          user?.roleName ||
          user?.role_name,
      ),

    status:
      normalizeStatus(
        user?.status ??
          user?.accountStatus ??
          user?.account_status ??
          user?.isActive ??
          user?.is_active,
      ),

    lastLoginAt:
      user?.lastLoginAt ||
      user?.last_login_at ||
      user?.lastLogin ||
      user?.last_login ||
      null,

    createdAt:
      user?.createdAt ||
      user?.created_at ||
      null,

    updatedAt:
      user?.updatedAt ||
      user?.updated_at ||
      null,
  };
};

const getManagedUsers = () =>
  readStoredArray(
    managedUsersStorageKey,
  ).map(
    normalizeManagedUser,
  );

const saveManagedUsers = (
  users,
) =>
  writeStoredArray(
    managedUsersStorageKey,

    users.map(
      normalizeManagedUser,
    ),
  );

const saveAuthenticationUsers = (
  users,
) => {
  const savedUsers =
    writeStoredArray(
      authUsersStorageKey,
      users,
    );

  notifyUserAccountsChanged();

  return savedUsers;
};

const createUserAuditLog = ({
  action,
  recordId,
  detail,
}) => {
  const currentUser =
    getCurrentUser();

  if (!currentUser) {
    return null;
  }

  try {
    return createAuditLog({
      userId:
        currentUser.userId ||
        null,

      username:
        currentUser.username ||
        'unknown',

      role:
        currentUser.role ||
        'admin',

      action,

      tableName:
        'users',

      recordId:
        recordId ?? null,

      detail:
        detail || '',

      ipAddress:
        '127.0.0.1',
    });
  } catch (error) {
    console.error(
      'Unable to create user account audit log.',
      error,
    );

    return null;
  }
};

const validateUsername = (
  username,
) => {
  const normalizedUsername =
    normalizeValue(username);

  if (!normalizedUsername) {
    return (
      'Please enter a username.'
    );
  }

  if (
    !/^[a-z0-9._-]{4,50}$/.test(
      normalizedUsername,
    )
  ) {
    return (
      'Use 4–50 lowercase letters, numbers, dots, underscores or hyphens.'
    );
  }

  return '';
};

export const getUserAccounts =
  () => {
    const authenticationUsers =
      getAuthUsers();

    const managedUsers =
      getManagedUsers();

    return authenticationUsers.map(
      (
        authenticationUser,
        index,
      ) => {
        const managedUser =
          managedUsers.find(
            (user) =>
              Number(user.id) ===
                Number(
                  authenticationUser.id,
                ) ||
              normalizeValue(
                user.username,
              ) ===
                normalizeValue(
                  authenticationUser.username,
                ),
          );

        return normalizeManagedUser(
          {
            ...managedUser,
            ...authenticationUser,

            employeeId:
              managedUser?.employeeId ||
              authenticationUser
                .employeeId ||
              authenticationUser.id,

            employeeCode:
              managedUser
                ?.employeeCode ||
              authenticationUser
                .employeeCode,

            employeeName:
              managedUser
                ?.employeeName ||
              authenticationUser
                .displayName,

            displayName:
              authenticationUser
                .displayName ||
              managedUser
                ?.displayName,

            email:
              managedUser?.email ||
              authenticationUser
                .email,

            department:
              managedUser
                ?.department ||
              authenticationUser
                .department,

            position:
              managedUser
                ?.position ||
              authenticationUser
                .position,

            role:
              authenticationUser.role,

            status:
              authenticationUser.status,

            lastLoginAt:
              authenticationUser
                .lastLoginAt ||
              managedUser
                ?.lastLoginAt,
          },
          index,
        );
      },
    );
  };

export const getUserAccountById = (
  userId,
) =>
  getUserAccounts().find(
    (user) =>
      Number(user.id) ===
      Number(userId),
  ) || null;

export const createUserAccount =
  ({
    employeeId,
    employeeCode,
    employeeName,
    email,
    department,
    position,
    username,
    role,
    status,
  }) => {
    if (!INITIAL_PASSWORD) {
      return {
        success: false,
        error:
          'Local user creation is disabled. Configure the backend user-management API.',
      };
    }

    const normalizedUsername =
      normalizeValue(username);

    const usernameError =
      validateUsername(
        normalizedUsername,
      );

    if (usernameError) {
      return {
        success: false,
        error: usernameError,
      };
    }

    const authenticationUsers =
      getAuthUsers();

    const managedUsers =
      getManagedUsers();

    const usernameExists =
      authenticationUsers.some(
        (user) =>
          normalizeValue(
            user.username,
          ) ===
          normalizedUsername,
      );

    if (usernameExists) {
      return {
        success: false,

        error:
          'This username is already in use.',
      };
    }

    const employeeIsLinked =
      managedUsers.some(
        (user) =>
          Number(
            user.employeeId,
          ) ===
            Number(
              employeeId,
            ) ||
          normalizeValue(
            user.employeeCode,
          ) ===
            normalizeValue(
              employeeCode,
            ),
      );

    if (employeeIsLinked) {
      return {
        success: false,

        error:
          'The selected employee already has a user account.',
      };
    }

    const nextId =
      Math.max(
        0,

        ...authenticationUsers.map(
          (user) =>
            Number(user.id) || 0,
        ),
      ) + 1;

    const createdAt =
      new Date()
        .toISOString();

    const authenticationUser = {
      id: nextId,

      username:
        normalizedUsername,

      password:
        INITIAL_PASSWORD,

      displayName:
        String(
          employeeName ||
            normalizedUsername,
        ).trim(),

      role:
        normalizeRole(role),

      status:
        normalizeStatus(status),

      lastLoginAt:
        null,

      passwordChangedAt:
        null,

      createdAt,

      updatedAt:
        createdAt,
    };

    const managedUser =
      normalizeManagedUser({
        id: nextId,

        employeeId:
          Number(employeeId),

        employeeCode,

        employeeName,

        displayName:
          employeeName,

        email,

        department,

        position,

        username:
          normalizedUsername,

        role:
          normalizeRole(role),

        status:
          normalizeStatus(status),

        lastLoginAt:
          null,

        createdAt,

        updatedAt:
          createdAt,
      });

    saveAuthenticationUsers([
      ...authenticationUsers,
      authenticationUser,
    ]);

    saveManagedUsers([
      ...managedUsers,
      managedUser,
    ]);

    createUserAuditLog({
      action:
        'create_user',

      recordId:
        nextId,

      detail:
        `Created user account ${normalizedUsername} with the ${normalizeRole(
          role,
        )} role.`,
    });

    return {
      success: true,

      user:
        managedUser,

      initialPassword:
        INITIAL_PASSWORD,
    };
  };

export const updateUserAccount =
  ({
    userId,
    employeeId,
    employeeCode,
    employeeName,
    email,
    department,
    position,
    username,
    role,
    status,
  }) => {
    const numericUserId =
      Number(userId);

    const normalizedUsername =
      normalizeValue(username);

    const usernameError =
      validateUsername(
        normalizedUsername,
      );

    if (usernameError) {
      return {
        success: false,
        error: usernameError,
      };
    }

    const authenticationUsers =
      getAuthUsers();

    const managedUsers =
      getManagedUsers();

    const selectedUser =
      authenticationUsers.find(
        (user) =>
          Number(user.id) ===
          numericUserId,
      );

    if (!selectedUser) {
      return {
        success: false,

        error:
          'The selected user account was not found.',
      };
    }

    const usernameExists =
      authenticationUsers.some(
        (user) =>
          Number(user.id) !==
            numericUserId &&
          normalizeValue(
            user.username,
          ) ===
            normalizedUsername,
      );

    if (usernameExists) {
      return {
        success: false,

        error:
          'This username is already in use.',
      };
    }

    const employeeIsLinked =
      managedUsers.some(
        (user) =>
          Number(user.id) !==
            numericUserId &&
          (Number(
            user.employeeId,
          ) ===
            Number(
              employeeId,
            ) ||
            normalizeValue(
              user.employeeCode,
            ) ===
              normalizeValue(
                employeeCode,
              )),
      );

    if (employeeIsLinked) {
      return {
        success: false,

        error:
          'The selected employee already has another user account.',
      };
    }

    const updatedAt =
      new Date()
        .toISOString();

    const previousUsername =
      selectedUser.username;

    const previousRole =
      selectedUser.role;

    const previousStatus =
      selectedUser.status;

    const updatedAuthenticationUser = {
      ...selectedUser,

      username:
        normalizedUsername,

      displayName:
        String(
          employeeName ||
            selectedUser.displayName ||
            normalizedUsername,
        ).trim(),

      role:
        normalizeRole(role),

      status:
        normalizeStatus(status),

      updatedAt,
    };

    const updatedAuthenticationUsers =
      authenticationUsers.map(
        (user) =>
          Number(user.id) ===
          numericUserId
            ? updatedAuthenticationUser
            : user,
      );

    const existingManagedUser =
      managedUsers.find(
        (user) =>
          Number(user.id) ===
            numericUserId ||
          normalizeValue(
            user.username,
          ) ===
            normalizeValue(
              previousUsername,
            ),
      );

    const updatedManagedUser =
      normalizeManagedUser({
        ...existingManagedUser,

        id:
          numericUserId,

        employeeId:
          Number(employeeId),

        employeeCode,

        employeeName,

        displayName:
          employeeName,

        email,

        department,

        position,

        username:
          normalizedUsername,

        role:
          normalizeRole(role),

        status:
          normalizeStatus(status),

        lastLoginAt:
          selectedUser
            .lastLoginAt ||
          existingManagedUser
            ?.lastLoginAt ||
          null,

        createdAt:
          existingManagedUser
            ?.createdAt ||
          selectedUser
            .createdAt ||
          updatedAt,

        updatedAt,
      });

    const managedUserExists =
      Boolean(
        existingManagedUser,
      );

    const updatedManagedUsers =
      managedUserExists
        ? managedUsers.map(
            (user) =>
              Number(user.id) ===
                numericUserId ||
              normalizeValue(
                user.username,
              ) ===
                normalizeValue(
                  previousUsername,
                )
                ? updatedManagedUser
                : user,
          )
        : [
            ...managedUsers,
            updatedManagedUser,
          ];

    saveAuthenticationUsers(
      updatedAuthenticationUsers,
    );

    saveManagedUsers(
      updatedManagedUsers,
    );

    const changes = [];

    if (
      normalizeValue(
        previousUsername,
      ) !==
      normalizedUsername
    ) {
      changes.push(
        `username from ${previousUsername} to ${normalizedUsername}`,
      );
    }

    if (
      normalizeRole(
        previousRole,
      ) !==
      normalizeRole(role)
    ) {
      changes.push(
        `role from ${normalizeRole(
          previousRole,
        )} to ${normalizeRole(
          role,
        )}`,
      );
    }

    if (
      normalizeStatus(
        previousStatus,
      ) !==
      normalizeStatus(status)
    ) {
      changes.push(
        `status from ${normalizeStatus(
          previousStatus,
        )} to ${normalizeStatus(
          status,
        )}`,
      );
    }

    createUserAuditLog({
      action:
        'update_user',

      recordId:
        numericUserId,

      detail:
        changes.length > 0
          ? `Updated account ${previousUsername}: ${changes.join(
              ', ',
            )}.`
          : `Updated account information for ${normalizedUsername}.`,
    });

    return {
      success: true,

      user:
        updatedManagedUser,
    };
  };

export const initialUserPassword =
  INITIAL_PASSWORD;
