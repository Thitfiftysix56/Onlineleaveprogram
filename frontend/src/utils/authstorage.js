import {
  createAuditLog,
} from './auditlogstorage.js';

const AUTH_STORAGE_KEY =
  'online_leave_approval_auth_session';

const AUTH_USERS_STORAGE_KEY =
  'online_leave_approval_auth_users';

const PRIMARY_MANAGED_USERS_KEY =
  'online_leave_approval_users';

const MANAGED_USERS_STORAGE_KEYS = [
  PRIMARY_MANAGED_USERS_KEY,
  'online_leave_approval_user_management',
  'online_leave_approval_system_users',
  'users',
];

const DEFAULT_INITIAL_PASSWORD =
  String(
    import.meta.env
      .VITE_DEMO_INITIAL_PASSWORD ||
      '',
  );

const IS_DEMO_AUTH_ENABLED =
  import.meta.env.DEV &&
  import.meta.env
    .VITE_ENABLE_DEMO_AUTH ===
    'true' &&
  Boolean(DEFAULT_INITIAL_PASSWORD);

const defaultDemoUsers =
  IS_DEMO_AUTH_ENABLED
    ? [
  {
    id: 1,
    username: 'employee001',
    password: DEFAULT_INITIAL_PASSWORD,
    displayName: 'Employee User',
    role: 'employee',
    status: 'active',
    lastLoginAt: null,
    passwordChangedAt: null,
  },
  {
    id: 2,
    username: 'supervisor001',
    password: DEFAULT_INITIAL_PASSWORD,
    displayName: 'Supervisor User',
    role: 'supervisor',
    status: 'active',
    lastLoginAt: null,
    passwordChangedAt: null,
  },
  {
    id: 3,
    username: 'hr001',
    password: DEFAULT_INITIAL_PASSWORD,
    displayName: 'HR User',
    role: 'hr',
    status: 'active',
    lastLoginAt: null,
    passwordChangedAt: null,
  },
  {
    id: 4,
    username: 'admin001',
    password: DEFAULT_INITIAL_PASSWORD,
    displayName: 'Admin User',
    role: 'admin',
    status: 'active',
    lastLoginAt: null,
    passwordChangedAt: null,
  },
      ]
    : [];

const isBrowserAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.localStorage);

const cloneData = (data) =>
  JSON.parse(
    JSON.stringify(data),
  );

const normalizeValue = (value) =>
  String(value ?? '')
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
  if (typeof status === 'boolean') {
    return status
      ? 'active'
      : 'inactive';
  }

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

const getDisplayName = (user) => {
  const firstName =
    user?.firstName ||
    user?.first_name ||
    '';

  const lastName =
    user?.lastName ||
    user?.last_name ||
    '';

  const combinedName =
    `${firstName} ${lastName}`.trim();

  return String(
    user?.displayName ||
      user?.employeeName ||
      user?.employee_name ||
      user?.fullName ||
      user?.full_name ||
      combinedName ||
      user?.username ||
      'User',
  ).trim();
};

const normalizeUser = (
  user,
  index = 0,
) => ({
  id:
    Number(
      user?.id ||
        user?.userId ||
        user?.user_id,
    ) ||
    index + 1,

  username: String(
    user?.username ||
      user?.userName ||
      user?.user_name ||
      '',
  ).trim(),

  password:
    IS_DEMO_AUTH_ENABLED
      ? String(
          user?.password ||
            user?.initialPassword ||
            user?.initial_password ||
            DEFAULT_INITIAL_PASSWORD,
        )
      : undefined,

  displayName:
    getDisplayName(user),

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

  passwordChangedAt:
    user?.passwordChangedAt ||
    user?.password_changed_at ||
    null,

  createdAt:
    user?.createdAt ||
    user?.created_at ||
    null,

  updatedAt:
    user?.updatedAt ||
    user?.updated_at ||
    null,
});

const readStoredArray = (
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

    return Array.isArray(
      parsedValue,
    )
      ? parsedValue
      : null;
  } catch (error) {
    console.error(
      `Unable to read ${storageKey}.`,
      error,
    );

    return null;
  }
};

const getManagedUsersSource =
  () => {
    if (!isBrowserAvailable()) {
      return {
        storageKey:
          PRIMARY_MANAGED_USERS_KEY,

        users: [],
      };
    }

    for (
      const storageKey of
      MANAGED_USERS_STORAGE_KEYS
    ) {
      const storedUsers =
        readStoredArray(
          storageKey,
        );

      if (storedUsers) {
        return {
          storageKey,
          users: storedUsers,
        };
      }
    }

    return {
      storageKey:
        PRIMARY_MANAGED_USERS_KEY,

      users: [],
    };
  };

const saveManagedUsers = (
  storageKey,
  users,
) => {
  if (!isBrowserAvailable()) {
    return users;
  }

  window.localStorage.setItem(
    storageKey ||
      PRIMARY_MANAGED_USERS_KEY,

    JSON.stringify(users),
  );

  return users;
};

const mergeAuthUsers = ({
  storedUsers = [],
  managedUsers = [],
}) => {
  const usersByUsername =
    new Map();

  defaultDemoUsers.forEach(
    (user, index) => {
      const normalizedUser =
        normalizeUser(
          user,
          index,
        );

      usersByUsername.set(
        normalizeValue(
          normalizedUser.username,
        ),

        normalizedUser,
      );
    },
  );

  storedUsers.forEach(
    (user, index) => {
      const normalizedUser =
        normalizeUser(
          user,
          index,
        );

      const usernameKey =
        normalizeValue(
          normalizedUser.username,
        );

      if (!usernameKey) {
        return;
      }

      const existingUser =
        usersByUsername.get(
          usernameKey,
        );

      usersByUsername.set(
        usernameKey,
        normalizeUser(
          {
            ...existingUser,
            ...normalizedUser,

            password:
              normalizedUser.password ||
              existingUser?.password ||
              DEFAULT_INITIAL_PASSWORD,
          },

          index,
        ),
      );
    },
  );

  managedUsers.forEach(
    (user, index) => {
      const managedUser =
        normalizeUser(
          user,
          index,
        );

      const usernameKey =
        normalizeValue(
          managedUser.username,
        );

      if (!usernameKey) {
        return;
      }

      const existingUser =
        usersByUsername.get(
          usernameKey,
        );

      usersByUsername.set(
        usernameKey,
        normalizeUser(
          {
            ...existingUser,
            ...managedUser,

            password:
              existingUser?.password ||
              managedUser.password ||
              DEFAULT_INITIAL_PASSWORD,

            passwordChangedAt:
              existingUser
                ?.passwordChangedAt ||
              managedUser
                .passwordChangedAt ||
              null,
          },

          index,
        ),
      );
    },
  );

  return Array.from(
    usersByUsername.values(),
  ).filter(
    (user) =>
      Boolean(user.username),
  );
};

const saveAuthUsers = (
  users,
) => {
  const normalizedUsers =
    Array.isArray(users)
      ? users.map(
          normalizeUser,
        )
      : [];

  if (isBrowserAvailable()) {
    window.localStorage.setItem(
      AUTH_USERS_STORAGE_KEY,

      JSON.stringify(
        normalizedUsers,
      ),
    );

    window.dispatchEvent(
      new CustomEvent(
        'auth-users-changed',
        {
          detail:
            normalizedUsers,
        },
      ),
    );
  }

  return normalizedUsers;
};

const initializeAuthUsers =
  () => {
    if (!isBrowserAvailable()) {
      return cloneData(
        defaultDemoUsers,
      );
    }

    const storedUsers =
      readStoredArray(
        AUTH_USERS_STORAGE_KEY,
      ) || [];

    const managedSource =
      getManagedUsersSource();

    const mergedUsers =
      mergeAuthUsers({
        storedUsers,

        managedUsers:
          managedSource.users,
      });

    return saveAuthUsers(
      mergedUsers,
    );
  };

const updateManagedUser = (
  updatedAuthUser,
) => {
  const managedSource =
    getManagedUsersSource();

  const usernameKey =
    normalizeValue(
      updatedAuthUser.username,
    );

  const existingUserIndex =
    managedSource.users.findIndex(
      (user) =>
        normalizeValue(
          user.username ||
            user.userName ||
            user.user_name,
        ) === usernameKey,
    );

  const managedUserData = {
    id:
      updatedAuthUser.id,

    username:
      updatedAuthUser.username,

    employeeName:
      updatedAuthUser.displayName,

    displayName:
      updatedAuthUser.displayName,

    role:
      updatedAuthUser.role,

    status:
      updatedAuthUser.status,

    lastLoginAt:
      updatedAuthUser.lastLoginAt,

    passwordChangedAt:
      updatedAuthUser
        .passwordChangedAt,

    updatedAt:
      updatedAuthUser.updatedAt,
  };

  let updatedManagedUsers;

  if (
    existingUserIndex === -1
  ) {
    updatedManagedUsers = [
      ...managedSource.users,
      managedUserData,
    ];
  } else {
    updatedManagedUsers =
      managedSource.users.map(
        (user, index) =>
          index ===
          existingUserIndex
            ? {
                ...user,
                ...managedUserData,
              }
            : user,
      );
  }

  saveManagedUsers(
    managedSource.storageKey,
    updatedManagedUsers,
  );

  return updatedManagedUsers;
};

const saveUpdatedAuthUser = (
  updatedUser,
) => {
  const users =
    initializeAuthUsers();

  const usernameKey =
    normalizeValue(
      updatedUser.username,
    );

  const updatedUsers =
    users.map((user) =>
      normalizeValue(
        user.username,
      ) === usernameKey
        ? normalizeUser({
            ...user,
            ...updatedUser,
          })
        : user,
    );

  const savedUsers =
    saveAuthUsers(
      updatedUsers,
    );

  const savedUser =
    savedUsers.find(
      (user) =>
        normalizeValue(
          user.username,
        ) === usernameKey,
    );

  if (savedUser) {
    updateManagedUser(
      savedUser,
    );
  }

  return savedUser || null;
};

const notifyAuthChanged = (
  session,
) => {
  if (
    typeof window ===
    'undefined'
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      'auth-session-changed',
      {
        detail: session,
      },
    ),
  );
};

const saveAuthSession = (
  session,
) => {
  if (!isBrowserAvailable()) {
    return session;
  }

  if (!session) {
    window.localStorage.removeItem(
      AUTH_STORAGE_KEY,
    );

    notifyAuthChanged(null);

    return null;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,

    JSON.stringify(session),
  );

  notifyAuthChanged(session);

  return session;
};

const createAuthenticationAuditLog =
  ({
    session,
    action,
    detail,
    recordId,
  }) => {
    if (
      !session ||
      !action
    ) {
      return null;
    }

    try {
      return createAuditLog({
        userId:
          session.userId ||
          null,

        username:
          session.username ||
          'unknown',

        role:
          session.role ||
          'employee',

        action,

        tableName:
          'users',

        recordId:
          recordId ??
          session.userId ??
          null,

        detail:
          detail || '',

        ipAddress:
          '127.0.0.1',
      });
    } catch (error) {
      console.error(
        `Unable to create ${action} audit log.`,
        error,
      );

      return null;
    }
  };

const validateNewPassword = (
  password,
) => {
  const normalizedPassword =
    String(password || '');

  if (
    normalizedPassword.length <
    8
  ) {
    return (
      'The new password must contain at least 8 characters.'
    );
  }

  if (
    !/[a-z]/.test(
      normalizedPassword,
    )
  ) {
    return (
      'The new password must contain at least one lowercase letter.'
    );
  }

  if (
    !/[A-Z]/.test(
      normalizedPassword,
    )
  ) {
    return (
      'The new password must contain at least one uppercase letter.'
    );
  }

  if (
    !/[0-9]/.test(
      normalizedPassword,
    )
  ) {
    return (
      'The new password must contain at least one number.'
    );
  }

  if (
    !/[^A-Za-z0-9]/.test(
      normalizedPassword,
    )
  ) {
    return (
      'The new password must contain at least one special character.'
    );
  }

  return '';
};

export const getDashboardPathByRole = (
  role,
) => {
  const normalizedRole =
    normalizeRole(role);

  const dashboardPaths = {
    employee:
      '/employee/dashboard',

    supervisor:
      '/supervisor/dashboard',

    hr:
      '/hr/dashboard',

    admin:
      '/admin/dashboard',
  };

  return (
    dashboardPaths[
      normalizedRole
    ] ||
    '/login'
  );
};

export const getAuthUsers =
  () =>
    initializeAuthUsers();

export const getAuthUserById = (
  userId,
) =>
  initializeAuthUsers().find(
    (user) =>
      Number(user.id) ===
      Number(userId),
  ) || null;

export const getAuthUserByUsername = (
  username,
) => {
  const usernameKey =
    normalizeValue(username);

  return (
    initializeAuthUsers().find(
      (user) =>
        normalizeValue(
          user.username,
        ) === usernameKey,
    ) || null
  );
};

export const getDemoLoginAccounts =
  () =>
    initializeAuthUsers().map(
      (user) => ({
        username:
          user.username,

        password:
          user.password,

        displayName:
          user.displayName,

        role:
          user.role,

        status:
          user.status,
      }),
    );

export const getAuthSession =
  () => {
    if (!isBrowserAvailable()) {
      return null;
    }

    const storedSession =
      window.localStorage.getItem(
        AUTH_STORAGE_KEY,
      );

    if (!storedSession) {
      return null;
    }

    try {
      const parsedSession =
        JSON.parse(
          storedSession,
        );

      if (
        !parsedSession ||
        !parsedSession.username ||
        !parsedSession.role
      ) {
        window.localStorage.removeItem(
          AUTH_STORAGE_KEY,
        );

        return null;
      }

      return parsedSession;
    } catch (error) {
      console.error(
        'Unable to read authentication session.',
        error,
      );

      window.localStorage.removeItem(
        AUTH_STORAGE_KEY,
      );

      return null;
    }
  };

export const getCurrentUser =
  () =>
    getAuthSession();

export const isAuthenticated =
  () =>
    Boolean(
      getAuthSession(),
    );

export const validateCurrentSession =
  () => {
    const session =
      getAuthSession();

    if (!session) {
      return {
        valid: false,

        reason:
          'not_authenticated',

        error:
          'Please sign in to continue.',
      };
    }

    const user =
      getAuthUserByUsername(
        session.username,
      );

    if (!user) {
      return {
        valid: false,

        reason:
          'user_not_found',

        error:
          'The signed-in account was not found.',
      };
    }

    if (
      user.status ===
      'inactive'
    ) {
      return {
        valid: false,

        reason:
          'inactive',

        error:
          'This user account is inactive.',
      };
    }

    if (
      user.status ===
      'locked'
    ) {
      return {
        valid: false,

        reason:
          'locked',

        error:
          'This user account is locked.',
      };
    }

    if (
      normalizeRole(
        user.role,
      ) !==
      normalizeRole(
        session.role,
      )
    ) {
      return {
        valid: false,

        reason:
          'role_changed',

        error:
          'Your account role has changed. Please sign in again.',
      };
    }

    return {
      valid: true,

      user,

      session,
    };
  };

export const authenticateUser =
  ({
    username,
    password,
  }) => {
    if (!IS_DEMO_AUTH_ENABLED) {
      return {
        success: false,
        error:
          'Browser-based demo authentication is disabled. Sign in through the API.',
      };
    }

    const normalizedUsername =
      normalizeValue(
        username,
      );

    if (!normalizedUsername) {
      return {
        success: false,

        error:
          'Please enter your username.',
      };
    }

    if (!password) {
      return {
        success: false,

        error:
          'Please enter your password.',
      };
    }

    const selectedUser =
      initializeAuthUsers().find(
        (user) =>
          normalizeValue(
            user.username,
          ) ===
          normalizedUsername,
      );

    if (!selectedUser) {
      return {
        success: false,

        error:
          'The username or password is incorrect.',
      };
    }

    if (
      selectedUser.status ===
      'inactive'
    ) {
      return {
        success: false,

        error:
          'This user account is inactive.',
      };
    }

    if (
      selectedUser.status ===
      'locked'
    ) {
      return {
        success: false,

        error:
          'This user account is locked.',
      };
    }

    if (
      String(
        selectedUser.password,
      ) !==
      String(password)
    ) {
      return {
        success: false,

        error:
          'The username or password is incorrect.',
      };
    }

    const loginAt =
      new Date()
        .toISOString();

    const updatedUser =
      saveUpdatedAuthUser({
        ...selectedUser,

        lastLoginAt:
          loginAt,

        updatedAt:
          loginAt,
      });

    const authenticatedUser =
      updatedUser ||
      selectedUser;

    const session = {
      userId:
        authenticatedUser.id,

      username:
        authenticatedUser.username,

      displayName:
        authenticatedUser.displayName,

      role:
        authenticatedUser.role,

      status:
        authenticatedUser.status,

      loginAt,

      passwordChangedAt:
        authenticatedUser
          .passwordChangedAt ||
        null,
    };

    saveAuthSession(
      session,
    );

    createAuthenticationAuditLog({
      session,

      action:
        'login',

      detail:
        `${session.username} logged in to the system.`,
    });

    return {
      success: true,

      user:
        session,

      redirectPath:
        getDashboardPathByRole(
          session.role,
        ),
    };
  };

export const changeCurrentUserPassword =
  ({
    currentPassword,
    newPassword,
  }) => {
    if (!IS_DEMO_AUTH_ENABLED) {
      return {
        success: false,
        error:
          'Browser-based password changes are disabled. Use the API.',
      };
    }

    const sessionValidation =
      validateCurrentSession();

    if (
      !sessionValidation.valid
    ) {
      return {
        success: false,

        error:
          sessionValidation.error,
      };
    }

    const selectedUser =
      sessionValidation.user;

    if (
      String(
        selectedUser.password,
      ) !==
      String(
        currentPassword || '',
      )
    ) {
      return {
        success: false,

        error:
          'The current password is incorrect.',
      };
    }

    if (
      String(newPassword) ===
      String(currentPassword)
    ) {
      return {
        success: false,

        error:
          'The new password must be different from the current password.',
      };
    }

    const passwordError =
      validateNewPassword(
        newPassword,
      );

    if (passwordError) {
      return {
        success: false,

        error:
          passwordError,
      };
    }

    const passwordChangedAt =
      new Date()
        .toISOString();

    const updatedUser =
      saveUpdatedAuthUser({
        ...selectedUser,

        password:
          String(newPassword),

        passwordChangedAt,

        updatedAt:
          passwordChangedAt,
      });

    const updatedSession = {
      ...sessionValidation.session,

      displayName:
        updatedUser?.displayName ||
        sessionValidation.session
          .displayName,

      role:
        updatedUser?.role ||
        sessionValidation.session
          .role,

      status:
        updatedUser?.status ||
        sessionValidation.session
          .status,

      passwordChangedAt,
    };

    saveAuthSession(
      updatedSession,
    );

    createAuthenticationAuditLog({
      session:
        updatedSession,

      action:
        'change_password',

      detail:
        `${updatedSession.username} changed their account password.`,
    });

    return {
      success: true,

      message:
        'Your password was changed successfully.',

      user:
        updatedSession,
    };
  };

export const updateAuthUserStatus =
  ({
    userId,
    username,
    status,
  }) => {
    const selectedUser =
      userId
        ? getAuthUserById(
            userId,
          )
        : getAuthUserByUsername(
            username,
          );

    if (!selectedUser) {
      return {
        success: false,

        error:
          'The selected user account was not found.',
      };
    }

    const normalizedStatus =
      normalizeStatus(status);

    const previousStatus =
      selectedUser.status;

    const updatedUser =
      saveUpdatedAuthUser({
        ...selectedUser,

        status:
          normalizedStatus,

        updatedAt:
          new Date()
            .toISOString(),
      });

    const currentAdmin =
      getCurrentUser();

    if (currentAdmin) {
      createAuthenticationAuditLog({
        session:
          currentAdmin,

        action:
          'update_user_status',

        recordId:
          updatedUser?.id ||
          selectedUser.id,

        detail:
          `Changed account ${selectedUser.username} status from ${previousStatus} to ${normalizedStatus}.`,
      });
    }

    return {
      success: true,

      user:
        updatedUser,
    };
  };

export const updateAuthUserRole =
  ({
    userId,
    username,
    role,
  }) => {
    const selectedUser =
      userId
        ? getAuthUserById(
            userId,
          )
        : getAuthUserByUsername(
            username,
          );

    if (!selectedUser) {
      return {
        success: false,

        error:
          'The selected user account was not found.',
      };
    }

    const normalizedRole =
      normalizeRole(role);

    const previousRole =
      selectedUser.role;

    const updatedUser =
      saveUpdatedAuthUser({
        ...selectedUser,

        role:
          normalizedRole,

        updatedAt:
          new Date()
            .toISOString(),
      });

    const currentAdmin =
      getCurrentUser();

    if (currentAdmin) {
      createAuthenticationAuditLog({
        session:
          currentAdmin,

        action:
          'assign_role',

        recordId:
          updatedUser?.id ||
          selectedUser.id,

        detail:
          `Changed account ${selectedUser.username} role from ${previousRole} to ${normalizedRole}.`,
      });
    }

    return {
      success: true,

      user:
        updatedUser,
    };
  };

export const resetAuthUserPassword =
  ({
    userId,
    username,
  }) => {
    if (!IS_DEMO_AUTH_ENABLED) {
      return {
        success: false,
        error:
          'Browser-based password resets are disabled until the backend reset endpoint is available.',
      };
    }

    const selectedUser =
      userId
        ? getAuthUserById(
            userId,
          )
        : getAuthUserByUsername(
            username,
          );

    if (!selectedUser) {
      return {
        success: false,

        error:
          'The selected user account was not found.',
      };
    }

    const passwordChangedAt =
      new Date()
        .toISOString();

    const updatedUser =
      saveUpdatedAuthUser({
        ...selectedUser,

        password:
          DEFAULT_INITIAL_PASSWORD,

        passwordChangedAt,

        updatedAt:
          passwordChangedAt,
      });

    const currentAdmin =
      getCurrentUser();

    if (currentAdmin) {
      createAuthenticationAuditLog({
        session:
          currentAdmin,

        action:
          'reset_user_password',

        recordId:
          updatedUser?.id ||
          selectedUser.id,

        detail:
          `Reset the password for account ${selectedUser.username}.`,
      });
    }

    return {
      success: true,

      user:
        updatedUser,

      initialPassword:
        DEFAULT_INITIAL_PASSWORD,
    };
  };

export const saveBackendAuthSession = (
  backendUser,
) => {
  const session = {
    userId:
      backendUser?.id ||
      backendUser?.userId ||
      backendUser?.user_id,

    username: String(
      backendUser?.username ||
        backendUser?.userName ||
        backendUser?.user_name ||
        '',
    ).trim(),

    displayName:
      getDisplayName(backendUser),

    role:
      normalizeRole(
        backendUser?.role ||
          backendUser?.roleName ||
          backendUser?.role_name,
      ),

    status:
      normalizeStatus(
        backendUser?.status ??
          backendUser?.accountStatus ??
          backendUser?.account_status ??
          backendUser?.isActive ??
          backendUser?.is_active,
      ),

    loginAt:
      backendUser?.loginAt ||
      backendUser?.login_at ||
      new Date().toISOString(),

    passwordChangedAt:
      backendUser?.passwordChangedAt ||
      backendUser?.password_changed_at ||
      null,

    mustChangePassword:
      Boolean(
        backendUser?.mustChangePassword ??
        backendUser?.must_change_password ??
        false,
      ),

    employeeId:
      backendUser?.employeeId ||
      backendUser?.employee_id ||
      null,

    employeeCode:
      backendUser?.employeeCode ||
      backendUser?.employee_code ||
      '',

    email:
      backendUser?.email ||
      '',

    phone:
      backendUser?.phone ||
      '',

    profileImageUrl:
      backendUser?.profileImageUrl ||
      backendUser?.profile_image_url ||
      null,

    department:
      backendUser?.department ||
      backendUser?.departmentName ||
      backendUser?.department_name ||
      '',

    position:
      backendUser?.position ||
      backendUser?.positionName ||
      backendUser?.position_name ||
      '',
  };

  saveAuthSession(session);

  return session;
};

export const updateCurrentUserProfileSession = (
  profile,
) => {
  const currentSession =
    getAuthSession();

  if (!currentSession) {
    return null;
  }

  return saveAuthSession({
    ...currentSession,

    displayName:
      profile?.fullName ||
      currentSession.displayName,

    email:
      profile?.email || '',

    phone:
      profile?.phone || '',

    profileImageUrl:
      profile?.profileImageUrl ||
      null,

    employeeId:
      profile?.employeeId ||
      currentSession.employeeId ||
      null,

    employeeCode:
      profile?.employeeCode ||
      currentSession.employeeCode ||
      '',

    department:
      profile?.department ||
      currentSession.department ||
      '',

    position:
      profile?.position ||
      currentSession.position ||
      '',
  });
};

export const clearAuthSession =
  () => {
    saveAuthSession(null);

    return true;
  };

export const logoutUser =
  clearAuthSession;

export const authStorageKey =
  AUTH_STORAGE_KEY;

export const authUsersStorageKey =
  AUTH_USERS_STORAGE_KEY;

export const managedUsersStorageKey =
  PRIMARY_MANAGED_USERS_KEY;
