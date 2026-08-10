import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Typography,
} from '@mui/material';

import {
  AccountBalanceWalletRounded,
  AdminPanelSettingsRounded,
  AssessmentRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CategoryRounded,
  DashboardRounded,
  DescriptionRounded,
  EventRounded,
  GroupsRounded,
  HistoryRounded,
  ListAltRounded,
  LockRounded,
  LogoutRounded,
  ManageAccountsRounded,
  NotificationsRounded,
  PersonRounded,
  SettingsRounded,
  TaskAltRounded,
  WorkRounded,
} from '@mui/icons-material';

import {
  useEffect,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  getCurrentUser,
  logoutUser,
} from '../utils/authstorage.js';

import {
  createAuditLog,
} from '../utils/auditlogstorage.js';

const roleRoutes = {
  employee: {
    Dashboard:
      '/employee/dashboard',

    'Leave Request':
      '/employee/leave-request',

    'My Requests':
      '/employee/my-requests',

    'Leave Balance':
      '/employee/leave-balance',

    Notification:
      '/employee/notifications',

    Profile:
      '/employee/profile',

    'Change Password':
      '/employee/change-password',
  },

  supervisor: {
    Dashboard:
      '/supervisor/dashboard',

    'Leave Request':
      '/supervisor/leave-request',

    'My Requests':
      '/supervisor/my-requests',

    'Leave Balance':
      '/supervisor/leave-balance',

    Approval:
      '/supervisor/approval',

    'Team Reports':
      '/supervisor/team-reports',

    Notification:
      '/supervisor/notifications',

    Profile:
      '/supervisor/profile',

    'Change Password':
      '/supervisor/change-password',
  },

  hr: {
    Dashboard:
      '/hr/dashboard',

    'Leave Request':
      '/hr/leave-request',

    'My Requests':
      '/hr/my-requests',

    'Leave Balance':
      '/hr/leave-balance',

    'Employee Management':
      '/hr/employee-management',

    'Leave Entitlement':
      '/hr/leave-entitlement',

    'Leave Type':
      '/hr/leave-types',

    'Holiday Management':
      '/hr/holiday-management',

    Reports:
      '/hr/reports',

    Notification:
      '/hr/notifications',

    Profile:
      '/hr/profile',

    'Change Password':
      '/hr/change-password',
  },

  admin: {
    Dashboard:
      '/admin/dashboard',

    'Leave Request':
      '/admin/leave-request',

    'My Requests':
      '/admin/my-requests',

    'Leave Balance':
      '/admin/leave-balance',

    'User Management':
      '/admin/user-management',

    'Department Management':
      '/admin/department-management',

    'Position Management':
      '/admin/position-management',

    'Audit Log':
      '/admin/audit-log',

    Notification:
      '/admin/notifications',

    Profile:
      '/admin/profile',

    'Change Password':
      '/admin/change-password',
  },
};

const roleInformation = {
  employee: {
    label:
      'Employee',

    IllustrationIcon:
      PersonRounded,
  },

  supervisor: {
    label:
      'Supervisor',

    IllustrationIcon:
      TaskAltRounded,
  },

  hr: {
    label:
      'Human Resources',

    IllustrationIcon:
      GroupsRounded,
  },

  admin: {
    label:
      'Administrator',

    IllustrationIcon:
      AdminPanelSettingsRounded,
  },
};

const menuIconMap = {
  Dashboard:
    DashboardRounded,

  'Leave Request':
    DescriptionRounded,

  'My Requests':
    ListAltRounded,

  'Leave Balance':
    AccountBalanceWalletRounded,

  Approval:
    TaskAltRounded,

  'Team Reports':
    AssessmentRounded,

  Reports:
    AssessmentRounded,

  Notification:
    NotificationsRounded,

  Profile:
    PersonRounded,

  'Change Password':
    LockRounded,

  'Employee Management':
    GroupsRounded,

  'Leave Entitlement':
    CalendarMonthRounded,

  'Leave Type':
    CategoryRounded,

  'Holiday Management':
    EventRounded,

  'User Management':
    ManageAccountsRounded,

  'Department Management':
    BusinessRounded,

  'Position Management':
    WorkRounded,

  'Audit Log':
    HistoryRounded,

  Logout:
    LogoutRounded,
};

const getInitials = (name) =>
  String(name || 'User')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join('') || 'U';

function RoleLayout({
  children,
  activeMenu = '',
  menuItems = [],
  theme,
}) {
  const [currentUser, setCurrentUser] =
    useState(() =>
      getCurrentUser(),
    );

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const pathSegments =
    location.pathname.split('/');

  const currentRole = [
    'employee',
    'supervisor',
    'hr',
    'admin',
  ].includes(pathSegments[1])
    ? pathSegments[1]
    : 'employee';

  const resolvedTheme = {
    primary:
      theme?.primary ||
      '#2563EB',

    dark:
      theme?.dark ||
      theme?.primary ||
      '#1D4ED8',

    soft:
      theme?.soft ||
      '#EFF6FF',

    border:
      theme?.border ||
      '#BFDBFE',

    text:
      theme?.text ||
      theme?.primary ||
      '#1E40AF',
  };

  const currentRoleInformation =
    roleInformation[currentRole] ||
    roleInformation.employee;

  const RoleIllustrationIcon =
    currentRoleInformation
      .IllustrationIcon;

  const ActivePageIcon =
    menuIconMap[activeMenu] ||
    RoleIllustrationIcon ||
    SettingsRounded;

  useEffect(() => {
    const handleAuthChanged =
      (event) => {
        setCurrentUser(
          event.detail ||
            getCurrentUser(),
        );
      };

    window.addEventListener(
      'auth-session-changed',
      handleAuthChanged,
    );

    return () => {
      window.removeEventListener(
        'auth-session-changed',
        handleAuthChanged,
      );
    };
  }, []);

  const handleLogout = () => {
    const activeUser =
      getCurrentUser();

    try {
      if (activeUser) {
        createAuditLog({
          userId:
            activeUser.userId ||
            null,

          username:
            activeUser.username ||
            'unknown',

          role:
            activeUser.role ||
            currentRole,

          action:
            'logout',

          tableName:
            'auth_sessions',

          recordId:
            activeUser.userId ||
            null,

          detail:
            `${activeUser.username || 'User'} logged out of the system.`,

          ipAddress:
            '127.0.0.1',
        });
      }
    } catch (error) {
      console.error(
        'Unable to create logout audit log.',
        error,
      );
    } finally {
      logoutUser();

      navigate(
        '/login',
        {
          replace: true,
        },
      );
    }
  };

  const handleMenuClick = (
    menuItem,
  ) => {
    if (
      menuItem ===
      'Logout'
    ) {
      handleLogout();

      return;
    }

    const targetRoute =
      roleRoutes[
        currentRole
      ]?.[menuItem];

    if (!targetRoute) {
      window.alert(
        `Route for "${menuItem}" has not been configured yet.`,
      );

      return;
    }

    navigate(
      targetRoute,
    );
  };

  return (
    <Box
      sx={{
        width:
          '100%',

        minWidth:
          0,

        minHeight:
          '100vh',

        backgroundColor:
          '#F5F7FB',

        overflowX:
          'hidden',
      }}
    >
      <Box
        component="aside"
        sx={{
          width:
            '300px',

          height:
            '100vh',

          position:
            'fixed',

          top:
            0,

          left:
            0,

          zIndex:
            10,

          display: {
            xs:
              'none',

            md:
              'flex',
          },

          flexDirection:
            'column',

          backgroundColor:
            '#FFFFFF',

          borderRight:
            '1px solid #E5E7EB',

          boxShadow:
            '8px 0 30px rgba(15, 23, 42, 0.035)',

          overflowY:
            'auto',
        }}
      >
        <Box
          sx={{
            minHeight:
              '92px',

            flexShrink:
              0,

            padding:
              '20px 22px',

            display:
              'flex',

            alignItems:
              'center',

            gap:
              '13px',

            borderBottom:
              '1px solid #E5E7EB',
          }}
        >
          <Box
            sx={{
              width:
                '46px',

              height:
                '46px',

              flexShrink:
                0,

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              background:
                `linear-gradient(135deg, ${resolvedTheme.primary}, ${resolvedTheme.dark})`,

              color:
                '#FFFFFF',

              borderRadius:
                '13px',

              boxShadow:
                `0 10px 22px ${resolvedTheme.primary}35`,
            }}
          >
            <DescriptionRounded
              sx={{
                fontSize:
                  '26px',
              }}
            />
          </Box>

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
                  '19px',

                fontWeight:
                  900,

                lineHeight:
                  1.2,

                whiteSpace:
                  'nowrap',
              }}
            >
              Leave Approval
            </Typography>

            <Typography
              sx={{
                color:
                  '#94A3B8',

                fontSize:
                  '11px',

                fontWeight:
                  700,

                marginTop:
                  '4px',

                letterSpacing:
                  '0.3px',
              }}
            >
              ONLINE LEAVE SYSTEM
            </Typography>
          </Box>
        </Box>

        <ButtonBase
          type="button"
          aria-label="Open profile"
          onClick={() =>
            handleMenuClick(
              'Profile',
            )
          }
          sx={{
            width:
              'calc(100% - 32px)',

            margin:
              '14px 16px 2px',

            padding:
              '12px 13px',

            position:
              'relative',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'flex-start',

            gap:
              '11px',

            backgroundColor:
              '#F8FAFC',

            border:
              '1px solid #EEF2F7',

            borderRadius:
              '12px',

            overflow:
              'hidden',

            textAlign:
              'left',

            transition:
              'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',

            '&::before': {
              content:
                '""',

              width:
                '3px',

              height:
                '100%',

              position:
                'absolute',

              top:
                0,

              left:
                0,

              backgroundColor:
                resolvedTheme.primary,
            },

            '&:hover': {
              backgroundColor:
                resolvedTheme.soft,

              borderColor:
                resolvedTheme.border,

              transform:
                'translateY(-1px)',
            },
          }}
        >
          <Avatar
            src={
              currentUser
                ?.profileImageUrl ||
              undefined
            }
            alt={
              currentUser
                ?.displayName ||
              'Profile'
            }
            sx={{
              width:
                '40px',

              height:
                '40px',

              flexShrink:
                0,

              background:
                `linear-gradient(135deg, ${resolvedTheme.primary}, ${resolvedTheme.dark})`,

              color:
                '#FFFFFF',

              boxShadow:
                `0 5px 12px ${resolvedTheme.primary}28`,

              fontSize:
                '13px',

              fontWeight:
                800,
            }}
          >
            {getInitials(
              currentUser
                ?.displayName,
            )}
          </Avatar>

          <Box
            sx={{
              minWidth:
                0,

              flex:
                1,
            }}
          >
            <Typography
              noWrap
              sx={{
                color:
                  '#111827',

                fontSize:
                  '13px',

                fontWeight:
                  800,

                lineHeight:
                  1.35,
              }}
            >
              {currentUser
                ?.displayName ||
                currentUser
                  ?.username ||
                'User'}
            </Typography>

            <Box
              sx={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '6px',

                marginTop:
                  '4px',
              }}
            >
              <Box
                sx={{
                  width:
                    '6px',

                  height:
                    '6px',

                  flexShrink:
                    0,

                  backgroundColor:
                    resolvedTheme.primary,

                  borderRadius:
                    '50%',
                }}
              />

              <Typography
                noWrap
                sx={{
                  color:
                    '#64748B',

                  fontSize:
                    '11px',

                  fontWeight:
                    700,
                }}
              >
                {
                  currentRoleInformation
                    .label
                }
              </Typography>
            </Box>
          </Box>
        </ButtonBase>

        <Box
          component="nav"
          sx={{
            flex:
              1,

            padding:
              '14px 16px 18px',

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '7px',
          }}
        >
          {menuItems.map(
            (
              menuItem,
            ) => {
              const isActive =
                activeMenu ===
                menuItem;

              const isLogout =
                menuItem ===
                'Logout';

              const MenuIcon =
                menuIconMap[
                  menuItem
                ] ||
                SettingsRounded;

              return (
                <Button
                  key={
                    menuItem
                  }
                  type="button"
                  fullWidth
                  onClick={() =>
                    handleMenuClick(
                      menuItem,
                    )
                  }
                  startIcon={
                    <Box
                      sx={{
                        width:
                          '30px',

                        height:
                          '30px',

                        flexShrink:
                          0,

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        backgroundColor:
                          isLogout
                            ? '#FEF2F2'
                            : isActive
                              ? '#FFFFFF'
                              : '#F8FAFC',

                        border:
                          isLogout
                            ? '1px solid #FECACA'
                            : isActive
                              ? `1px solid ${resolvedTheme.border}`
                              : '1px solid #EEF2F7',

                        borderRadius:
                          '8px',
                      }}
                    >
                      <MenuIcon
                        sx={{
                          color:
                            isLogout
                              ? '#DC2626'
                              : isActive
                                ? resolvedTheme.primary
                                : '#64748B',

                          fontSize:
                            '18px',
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    minHeight:
                      '50px',

                    padding:
                      '9px 12px',

                    justifyContent:
                      'flex-start',

                    backgroundColor:
                      isActive
                        ? resolvedTheme.soft
                        : 'transparent',

                    color:
                      isLogout
                        ? '#DC2626'
                        : isActive
                          ? resolvedTheme.primary
                          : '#374151',

                    border:
                      isActive
                        ? `1px solid ${resolvedTheme.border}`
                        : '1px solid transparent',

                    borderRadius:
                      '10px',

                    fontSize:
                      '14px',

                    fontWeight:
                      isActive
                        ? 800
                        : 600,

                    textAlign:
                      'left',

                    textTransform:
                      'none',

                    whiteSpace:
                      'normal',

                    lineHeight:
                      1.4,

                    '& .MuiButton-startIcon':
                      {
                        marginLeft:
                          0,

                        marginRight:
                          '11px',
                      },

                    '&:hover':
                      {
                        backgroundColor:
                          isLogout
                            ? '#FEF2F2'
                            : resolvedTheme.soft,

                        color:
                          isLogout
                            ? '#DC2626'
                            : resolvedTheme.primary,

                        borderColor:
                          isLogout
                            ? '#FECACA'
                            : resolvedTheme.border,
                      },
                  }}
                >
                  {menuItem}
                </Button>
              );
            },
          )}
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          width: {
            xs:
              '100%',

            md:
              'calc(100% - 300px)',
          },

          minWidth:
            0,

          minHeight:
            '100vh',

          position:
            'relative',

          isolation:
            'isolate',

          marginLeft: {
            xs:
              0,

            md:
              '300px',
          },

          padding: {
            xs:
              '24px 18px',

            sm:
              '28px 24px',

            md:
              '32px',

            lg:
              '36px 40px',
          },

          background:
            `linear-gradient(180deg, ${resolvedTheme.soft} 0px, #F5F7FB 230px)`,

          overflowX:
            'hidden',
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            width:
              '230px',

            height:
              '230px',

            position:
              'absolute',

            top:
              '-92px',

            right:
              '-76px',

            zIndex:
              -1,

            backgroundColor:
              resolvedTheme.primary,

            borderRadius:
              '50%',

            opacity:
              0.07,

            pointerEvents:
              'none',
          }}
        />

        <Box
          aria-hidden="true"
          sx={{
            width:
              '130px',

            height:
              '130px',

            position:
              'absolute',

            top:
              '86px',

            right:
              '148px',

            zIndex:
              -1,

            backgroundColor:
              resolvedTheme.primary,

            borderRadius:
              '50%',

            filter:
              'blur(2px)',

            opacity:
              0.04,

            pointerEvents:
              'none',
          }}
        />

        <Box
          aria-hidden="true"
          sx={{
            width:
              '118px',

            height:
              '118px',

            position:
              'absolute',

            top:
              '25px',

            right:
              '36px',

            zIndex:
              -1,

            display: {
              xs:
                'none',

              lg:
                'flex',
            },

            alignItems:
              'center',

            justifyContent:
              'center',

            color:
              resolvedTheme.primary,

            opacity:
              0.09,

            pointerEvents:
              'none',
          }}
        >
          <ActivePageIcon
            sx={{
              fontSize:
                '112px',
            }}
          />
        </Box>

        <Box
          sx={{
            width:
              '100%',

            minWidth:
              0,

            position:
              'relative',

            zIndex:
              1,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default RoleLayout;